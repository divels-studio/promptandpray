#!/usr/bin/env node
/*
 * Migration runner - the engine behind /pnp:update. Importable; the CLI is aiwf-update.mjs.
 *
 * THE PROMISE
 *   An update OVERWRITES what it renders and carries the project additions block. The consumer's
 *   own text has exactly two homes: the overrides document (an update never touches it) and ONE
 *   marked block per rendered Markdown file - `<!-- project additions -->` ... `<!-- /project
 *   additions -->`, each marker on a line of its own - which every re-render carries over byte for
 *   byte (generate.mjs carryProjectAdditions). Everything else an update renders is written from the
 *   payload: an edited file, a deleted one, a file this installation never recorded. Nothing asks.
 *   CLAUDE.md is the one managed file that also holds the operator's text OUTSIDE its `aiwf-core`
 *   markers: only the region is written, every byte around it is kept, and the region is encoded in
 *   the line-ending convention the file already uses.
 *
 * THE MODEL
 *   Migrations run in manifest order and each operation applies directly (a file write is atomic
 *   through writeAtomic). After the LAST operation of a migration the config is written ONCE, with
 *   `lastMigrationApplied` / `installedPluginVersion` moved to that migration and every bookkeeping
 *   change its operations made. A crash mid-migration leaves the stamps at the previous migration,
 *   and the next run simply runs that migration again - every operation is idempotent by
 *   construction: a re-render overwrites, `add-config-key` skips a key that is already present,
 *   `reconcile-ask-ruleset` reconciles. The one config write INSIDE a migration is the reconcile's:
 *   it persists the ask-rule ownership right after it rewrites settings.json, because which rules
 *   this engine inserted cannot be read back off a settings file it has already rewritten.
 *
 * BOOKKEEPING
 *   `_aiwf.managedRegions[key] = "<semver>"` - the payload version that last rendered the artifact,
 *   where key is `<file>#<region>` for a marker region and `<file>` for a whole file. A legacy shape
 *   (an `{upstream, local, override}` object per key, a `migrationJournal` key) is normalised in
 *   memory on load (generate.mjs normalizeBookkeeping) - `--check` included - and written back with
 *   the first config write of the run.
 *
 * WHAT A RUN PRINTS
 *   `--dry-run` and `--apply` print, before the first operation, every `## [x.y.z]` block of the
 *   payload's CHANGELOG.md with installed < x.y.z <= payload - that is how a consumer learns what the
 *   release changed. A `note` operation prints its text, docRefs and supersedes ids. The reconcile
 *   names the payload rules it found present but not owned.
 *
 * WHAT IT SHARES WITH SETUP
 *   The render primitives (`renderTemplate`, `templateContext`, `planAskRules`, `lf`, `orderConfig`,
 *   `jsonText`), the additions carry and the bookkeeping normalisation, all from
 *   ../setup/generate.mjs - so a render means exactly the same bytes in both engines.
 *
 * WHAT THIS ENGINE NEVER DOES
 *   It never initialises a project (no config = setup's business), never commits, never touches the
 *   operator's zone (`.aiwf/` scratch, memory, the overrides document, text outside the markers,
 *   settings.local.json), and never removes a permission rule it did not insert.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIG_REL, ROLES_REL, SETTINGS_REL, ProjectAdditionsError,
  carryProjectAdditions, dominantEol, encodeEol, jsonText, lf, normalizeBookkeeping, orderConfig, planAskRules,
  renderTemplate, templateContext,
} from '../setup/generate.mjs';
import { formatErrors, loadSchema, validate } from '../setup/validate-config.mjs';
import { claudePinErrors } from '../setup/role-rules.mjs';
import { compareVersions, parseVersion, validatePayload } from './validate-payload.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PLUGIN_ROOT = path.resolve(HERE, '..', '..');

const toPosix = (p) => p.split(path.sep).join('/');
export const CONFIG_POSIX = toPosix(CONFIG_REL);
export const SETTINGS_POSIX = toPosix(SETTINGS_REL);
export const ROLES_POSIX = toPosix(ROLES_REL);

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

/** A blocked run: every write before the stop stands, the stamps say where to continue. Exit 1. */
export class UpdateError extends Error {}
/** The run could not start at all (no config, unreadable payload). Exit 2. */
export class UpdateStartError extends Error {}

// ---------------------------------------------------------------------------
// Marker regions
// ---------------------------------------------------------------------------
export const beginMarker = (region) => `<!-- BEGIN ${region} -->`;
export const endMarker = (region) => `<!-- END ${region} -->`;

/** The marked region INCLUDING its markers, or null when the file or the markers are not there. */
export function extractRegion(text, region) {
  if (text === null || text === undefined) return null;
  const begin = beginMarker(region);
  const end = endMarker(region);
  const from = text.indexOf(begin);
  const to = text.indexOf(end);
  if (from === -1 || to === -1 || to < from) return null;
  return text.slice(from, to + end.length);
}

/**
 * `text` with its marked region replaced by `replacement` - every byte outside the markers kept, the
 * replacement encoded in the line-ending convention the file already uses. A region that is missing
 * from the file is APPENDED (after a blank line), so the file's own text is never re-encoded.
 */
export function spliceRegion(text, region, replacement) {
  const eol = dominantEol(text);
  const begin = beginMarker(region);
  const end = endMarker(region);
  const from = text.indexOf(begin);
  const to = text.indexOf(end);
  if (from === -1 || to === -1 || to < from) {
    const joiner = text.endsWith('\n') ? '\n' : '\n\n';
    return text + encodeEol(joiner + replacement + '\n', eol);
  }
  return text.slice(0, from) + encodeEol(replacement, eol) + text.slice(to + end.length);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------
/** Atomic replace. `raw` writes the bytes as they are (spliced regions, carried additions blocks). */
function writeAtomic(file, text, { raw = false } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.pnp-tmp-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  fs.writeFileSync(tmp, raw ? text : lf(text), 'utf8');
  fs.renameSync(tmp, file); // rename replaces an existing file on both Windows and POSIX
}

// ---------------------------------------------------------------------------
// Answer records (the ONE production resolver, its adapters below and in the CLI)
// ---------------------------------------------------------------------------
/**
 * Validates an answer record and returns it. The only kind is `answer` - the value of a config key
 * a migration marks `askOperator`. Anything else STOPS the run naming the address: an unknown kind
 * (the old `conflict` records included), an unknown field, a missing value. Nothing is guessed.
 */
export function checkResolutionRecord(record, address) {
  const where = `resolution for "${address}"`;
  if (!isPlainObject(record)) throw new UpdateError(`${where}: not an object.`);
  if (typeof record.kind !== 'string') throw new UpdateError(`${where}: missing the "kind" discriminator (the only kind is "answer").`);
  if (record.kind !== 'answer') {
    throw new UpdateError(
      `${where}: unknown kind "${record.kind}" - the only kind is "answer" (the value of a config key a migration asks about). `
      + 'An update overwrites what it renders, so there is nothing else to decide.',
    );
  }
  for (const key of Object.keys(record)) {
    if (!['kind', 'value'].includes(key)) throw new UpdateError(`${where}: unknown field "${key}".`);
  }
  if (!own(record, 'value')) throw new UpdateError(`${where}: an "answer" record must carry "value" (any JSON value, including null or false).`);
  return record;
}

/**
 * The scripted adapter: a JSON object mapping "<migration>/<opIndex>/<key>" to an answer record.
 * Every record is checked when the file is loaded, so a stale record (a `conflict` from an older
 * engine, a typo in a field) stops the run before the first operation instead of being ignored. A
 * missing entry for an address the run needs STOPS the run naming it - unless `onMissing` is given
 * (a dry run lists it as `would ask` instead).
 */
export function resolutionFileAdapter(table, { label = 'the resolution file', onMissing = null } = {}) {
  if (!isPlainObject(table)) throw new UpdateStartError(`${label} must be a JSON object mapping "<migration>/<opIndex>/<key>" to an answer record.`);
  for (const [address, record] of Object.entries(table)) checkResolutionRecord(record, address);
  return (address, info) => {
    if (!own(table, address)) {
      if (onMissing) return onMissing(address, info);
      throw new UpdateError(`no answer for "${address}" in ${label}. Add a { "kind": "answer", "value": <json> } record and re-run - nothing is guessed.`);
    }
    return table[address];
  };
}

/** The adapter that refuses to answer: a non-interactive apply with no resolution file. */
export function stopAdapter(reason) {
  return (address) => { throw new UpdateError(`"${address}" needs an answer and ${reason}`); };
}

/**
 * The dry-run adapter: never prompts, never stops. It plans on the key's default and marks the
 * operation so the preview prints `would ask: <address>`.
 */
export const wouldAskAdapter = (address, info) => ({ kind: 'answer', value: info.fallback, wouldAsk: true });

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------
function hasConfigPath(config, dotted) {
  let node = config;
  for (const key of dotted.split('.')) {
    if (!isPlainObject(node) || !own(node, key)) return false;
    node = node[key];
  }
  return true;
}

function setConfigPath(config, dotted, value) {
  const parts = dotted.split('.');
  let node = config;
  for (const key of parts.slice(0, -1)) {
    if (!own(node, key)) node[key] = {};
    if (!isPlainObject(node[key])) {
      throw new UpdateError(`cannot add the config key "${dotted}": "${key}" already holds a value that is not an object.`);
    }
    node = node[key];
  }
  node[parts.at(-1)] = value;
  return config;
}

function renderContext(projectRoot, config) {
  // The same context setup renders with - built by setup's OWN templateContext(), not by a second
  // copy of its shape here. `$schema` and `_aiwf` are stripped because setup renders from the
  // answers, which never carry them.
  const payloadHalf = { ...config };
  delete payloadHalf.$schema;
  delete payloadHalf._aiwf;
  return templateContext(payloadHalf, projectRoot);
}

function renderRef(pluginRoot, ref, context) {
  const [file, region] = ref.split('#');
  const text = readText(path.join(pluginRoot, ...file.split('/')));
  if (text === null) throw new UpdateError(`the payload template "${file}" is missing - the migration cannot render its content.`);
  let rendered;
  try { rendered = renderTemplate(text, context); } catch (e) {
    throw new UpdateError(`the payload template "${ref}" could not be rendered against this project's config: ${e.message}`);
  }
  if (region) {
    const extracted = extractRegion(rendered, region);
    if (extracted === null) throw new UpdateError(`the payload template "${file}" carries no "${region}" markers, so "${ref}" resolves to nothing.`);
    return extracted;
  }
  return rendered;
}

// ---------------------------------------------------------------------------
// Loading and preflight
// ---------------------------------------------------------------------------
/**
 * Reads the project config and normalises a legacy bookkeeping shape IN MEMORY (nothing is written
 * here). A missing or unreadable config is NOT a migration failure - it means the runner was pointed
 * at something it must never initialise, so it is an exit-2 "cannot start".
 * Returns { file, config, normalized } - `normalized` says the in-memory shape differs from disk.
 */
export function loadProjectConfig(projectRoot) {
  const file = path.join(projectRoot, CONFIG_REL);
  const raw = readText(file);
  if (raw === null) {
    throw new UpdateStartError(`no PromptAndPray installation in ${projectRoot} (${CONFIG_POSIX} is missing) - installing is /pnp:setup's business, never an update's.`);
  }
  let config;
  try { config = JSON.parse(raw); } catch (e) {
    throw new UpdateStartError(`${CONFIG_POSIX} is not valid JSON (${e.message}) - nothing is written over a config that cannot be read.`);
  }
  if (!isPlainObject(config) || !isPlainObject(config._aiwf)) {
    throw new UpdateError(`invariant violated: ${CONFIG_POSIX} carries no _aiwf bookkeeping block, so there is nothing to compare a payload against.`);
  }
  const normalized = normalizeBookkeeping(config);
  return { file, config, normalized };
}

/**
 * Everything that must hold BEFORE the first mutation. Each failure names the invariant it violated,
 * because "the update refused" is only actionable when the operator learns which rule said no.
 */
export function preflight({ pluginRoot, projectRoot }) {
  const payload = validatePayload(pluginRoot); // throws PayloadError only when plugin.json is unreadable
  if (payload.errors.length) {
    throw new UpdateError(`the migration payload is not coherent, so nothing was applied:\n  - ${payload.errors.join('\n  - ')}`);
  }
  const { file: configFile, config, normalized } = loadProjectConfig(projectRoot);
  // The Claude pin rule, before anything else is judged and whatever the pending operations are
  // (scripts/setup/role-rules.mjs - one function every writer of the config calls).
  const pinErrors = claudePinErrors(config);
  if (pinErrors.length) {
    throw new UpdateError(
      `invariant violated: a Claude review row cannot run on the model it records, so nothing was applied:\n  - ${pinErrors.join('\n  - ')}\n`
      + 'Set that row to a tier alias or to exactly roles.reviewer.model (node <plugin>/scripts/setup/aiwf-roles.mjs '
      + '--set <row>.model=<value>, or --reset <row>), then run the update again.',
    );
  }
  const bk = config._aiwf;

  if (typeof bk.installedPluginVersion !== 'string' || !parseVersion(bk.installedPluginVersion)) {
    throw new UpdateError(
      `invariant violated: _aiwf.installedPluginVersion (${JSON.stringify(bk.installedPluginVersion)}) is not a plain ` +
      'MAJOR.MINOR.PATCH version, so this project cannot be placed in the migration sequence.',
    );
  }
  if (typeof bk.lastMigrationApplied !== 'string' || bk.lastMigrationApplied === '') {
    throw new UpdateError('invariant violated: _aiwf.lastMigrationApplied is empty - there is no point in the sequence to continue from.');
  }
  // The map itself must be there: `ifRecorded` reads it. Its ENTRIES are whatever normalisation left
  // (the version strings), and nothing below judges them.
  if (!isPlainObject(bk.managedRegions)) {
    throw new UpdateError('invariant violated: _aiwf.managedRegions is not an object, so no managed artifact can be looked up.');
  }
  // The downgrade check comes FIRST, ahead of the manifest lookup: an older payload run against a
  // newer project would otherwise be reported as "lastMigrationApplied names a migration I have
  // never heard of", which is true and useless.
  if (compareVersions(bk.installedPluginVersion, payload.version) > 0) {
    throw new UpdateError(
      `downgrade refused: this project is at ${bk.installedPluginVersion} and the payload is ${payload.version}. ` +
      'Running an older payload over a newer project is not supported.',
    );
  }
  const index = payload.manifest.findIndex((e) => e.id === bk.lastMigrationApplied);
  if (index === -1) {
    throw new UpdateError(
      `invariant violated: _aiwf.lastMigrationApplied "${bk.lastMigrationApplied}" does not exist in this payload's manifest ` +
      '- the project was installed by a payload this one does not know.',
    );
  }
  if (payload.manifest[index].targetPluginVersion !== bk.installedPluginVersion) {
    throw new UpdateError(
      `invariant violated: _aiwf.installedPluginVersion is ${bk.installedPluginVersion} but the manifest says ` +
      `"${bk.lastMigrationApplied}" targets ${payload.manifest[index].targetPluginVersion} - the two stamps disagree.`,
    );
  }
  const pending = payload.manifest.slice(index + 1);
  return { payload, configFile, config, pending, normalized };
}

// ---------------------------------------------------------------------------
// The CHANGELOG blocks a consumer is owed
// ---------------------------------------------------------------------------
const CHANGELOG_HEADING = /^## \[(\d+\.\d+\.\d+)\]/;

/**
 * The lines to print: every `## [x.y.z]` block of `<pluginRoot>/CHANGELOG.md` with
 * from < x.y.z <= to, verbatim and in file order, under ONE header line. A block runs from its
 * heading to the next `## ` heading (or the end of the file); trailing blank lines are not part of
 * it. No file, or no block in the range, is ONE line saying so.
 */
export function changelogLines(pluginRoot, from, to) {
  const text = readText(path.join(pluginRoot, 'CHANGELOG.md'));
  const blocks = [];
  if (text !== null) {
    let current = null;
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('## ')) {
        if (current) blocks.push(current);
        current = null;
        const m = CHANGELOG_HEADING.exec(line);
        if (m && parseVersion(m[1]) && compareVersions(from, m[1]) < 0 && compareVersions(m[1], to) <= 0) current = [line];
        continue;
      }
      if (current) current.push(line);
    }
    if (current) blocks.push(current);
  }
  if (blocks.length === 0) return [`CHANGELOG: no block between ${from} and ${to}`];
  const out = [`CHANGELOG ${from} -> ${to}:`];
  blocks.forEach((block, i) => {
    while (block.length > 1 && block[block.length - 1].trim() === '') block.pop();
    if (i > 0) out.push('');
    out.push(...block);
  });
  return out;
}

// ---------------------------------------------------------------------------
// Per-operation planning
// ---------------------------------------------------------------------------
/**
 * The address key of an operation - the `<key>` half of `<migration>/<opIndex>/<key>`. ONE
 * definition, used by the planner and by every message that has to name an operation.
 */
export function operationKey(op, fallback = null) {
  if (!isPlainObject(op)) return fallback;
  switch (op.op) {
    case 'rerender-managed-region': return op.region ? `${op.file}#${op.region}` : op.file;
    case 'add-config-key': return op.path;
    case 'reconcile-ask-ruleset': return SETTINGS_POSIX;
    case 'note': return op.id;
    default: return fallback;
  }
}

// A plan is what applyPlan() executes. `mode`:
//   'file'     a project file (whole file or spliced region)   'settings'  settings.json
//   'config'   a config key (in memory until the migration's config write)   'none'  nothing
// `lines` are printed under the operation's summary (a note's text, docRefs and supersedes).
function planOperation(ctx, migration, opIndex, op) {
  const address = (key) => `${migration}/${opIndex}/${key}`;
  switch (op.op) {
    case 'note':
      return {
        op, mode: 'none', key: op.id, summary: `note ${op.id}`,
        lines: [
          `note: ${op.text}`,
          ...(op.docRefs || []).map((ref) => `  - ${ref}`),
          ...(op.supersedes || []).map((id) => `  supersedes: ${id}`),
        ],
      };
    case 'add-config-key':
      return planAddConfigKey(ctx, op, address(op.path));
    case 'rerender-managed-region':
      return planRerender(ctx, op);
    case 'reconcile-ask-ruleset':
      return planReconcile(ctx, op);
    default:
      // Unreachable: validate-payload rejects unknown op types before anything runs.
      throw new UpdateError(`unknown operation type "${op.op}".`);
  }
}

function planAddConfigKey(ctx, op, address) {
  if (hasConfigPath(ctx.config, op.path)) {
    return { op, mode: 'none', key: op.path, summary: `config key ${op.path} already present - left exactly as it is` };
  }
  let value = op.default;
  let wouldAsk = false;
  if (op.askOperator === true) {
    const record = ctx.resolve(address, { question: op.question, path: op.path, fallback: op.default });
    value = record.value;
    wouldAsk = record.wouldAsk === true;
  }
  const next = JSON.parse(JSON.stringify(ctx.config));
  setConfigPath(next, op.path, value);
  // A migration that adds a key the payload's own schema forbids would leave a config that setup and
  // the self-check both reject. Caught here, before a single byte is written.
  const errors = validate(next, ctx.schema);
  if (errors.length) {
    throw new UpdateError(`adding the config key "${op.path}" would produce a config the payload schema rejects:\n${formatErrors(errors)}`);
  }
  return {
    op, mode: 'config', key: op.path, value,
    summary: wouldAsk ? `would ask: ${address}` : `config key ${op.path} = ${JSON.stringify(value)}`,
  };
}

/**
 * A re-render ALWAYS writes the fresh render: a region is spliced into the file (bytes outside the
 * markers kept; a missing region appended; a missing file recreated as the region alone), a whole
 * Markdown file goes through the additions carry, any other whole file is the render. The record is
 * the payload version. `ifRecorded: true` keeps its one meaning - an artifact with no record here is
 * not on this installation and is skipped. `createIfAbsent` is accepted by the validator and needs
 * nothing here: a render always creates what is missing.
 */
function planRerender(ctx, op) {
  const key = operationKey(op);
  const recorded = own(ctx.config._aiwf.managedRegions, key);
  if (!recorded && op.ifRecorded === true) {
    return { op, mode: 'none', key, summary: `${key}: not on this installation (no record) - skipped` };
  }
  const newRender = ctx.render(op.template);
  const fileText = ctx.readProjected(op.file);
  let content;
  let raw = false;
  let carried = false;
  if (op.region) {
    if (fileText === null) content = `${newRender}\n`;
    else { content = spliceRegion(fileText, op.region, newRender); raw = true; }
  } else if (op.file.endsWith('.md')) {
    try {
      ({ text: content, carried } = carryProjectAdditions(fileText, newRender, op.file));
    } catch (e) {
      if (e instanceof ProjectAdditionsError) throw new UpdateError(e.message);
      throw e;
    }
    raw = carried;
  } else {
    content = newRender;
  }
  const write = fileText === null || lf(fileText) !== lf(content);
  let summary;
  if (fileText === null) summary = `${key}: created from the payload render`;
  else if (!write) summary = `${key}: already current`;
  else if (op.region && extractRegion(fileText, op.region) === null) summary = `${key}: region appended (it was not in the file)`;
  else if (!recorded) summary = `${key}: overwritten with the payload render (this installation had no record of it)`;
  else summary = `${key}: the payload render written`;
  if (carried) summary += ' (project additions carried)';
  return {
    op, mode: 'file', target: op.file, key, content, raw, write,
    bookkeeping: { managedRegions: { [key]: ctx.payload.version } },
    summary,
  };
}

function planReconcile(ctx, op) {
  const raw = ctx.readProjected(SETTINGS_POSIX);
  if (raw === null) {
    throw new UpdateError(
      `${SETTINGS_POSIX} is GONE from the project - re-run /pnp:setup to install the ask ruleset again.`,
    );
  }
  let settings;
  try { settings = JSON.parse(raw); } catch (e) {
    throw new UpdateError(`${SETTINGS_POSIX} is not valid JSON (${e.message}) - nothing is rewritten over a settings file that cannot be read.`);
  }
  // The same two shapes setup refuses to reason about: "merge" into them would mean "replace".
  if (own(settings, 'permissions') && !isPlainObject(settings.permissions)) {
    throw new UpdateError(
      `${SETTINGS_POSIX} has a "permissions" value that is not an object (found ` +
      `${Array.isArray(settings.permissions) ? 'an array' : typeof settings.permissions}) - the ask ruleset is a set of rules, ` +
      'and nothing is rewritten over a shape this engine does not understand.',
    );
  }
  const permissions = isPlainObject(settings.permissions) ? settings.permissions : {};
  if (permissions.ask !== undefined && !Array.isArray(permissions.ask)) {
    throw new UpdateError(
      `${SETTINGS_POSIX} has a "permissions.ask" value that is not a list (found ${typeof permissions.ask}) - nothing was rewritten.`,
    );
  }

  const desired = readDesiredRules(ctx, op.ruleset);
  const bk = ctx.config._aiwf;
  const plan = planAskRules({
    desired,
    actual: Array.isArray(permissions.ask) ? permissions.ask : [],
    owned: Array.isArray(bk.ownedAskRules) ? bk.ownedAskRules : [],
    suppressed: Array.isArray(bk.suppressedAskRules) ? bk.suppressedAskRules : [],
  });
  // to-remove = owned n (old desired - new desired) is computed INSIDE planAskRules (see its
  // header); this function only reports what it decided.
  const { toRemove, ask, owned } = plan;
  const content = jsonText({ ...settings, permissions: { ...permissions, ask } });
  const parts = [];
  if (plan.toAdd.length) parts.push(`+${plan.toAdd.length}`);
  if (toRemove.length) parts.push(`-${toRemove.length} (owned, no longer desired)`);
  if (plan.newlyTombstoned.length) parts.push(`${plan.newlyTombstoned.length} tombstoned`);
  // The one thing the reconcile does NOT do, said out loud: a payload rule the project already
  // carries in the payload's own spelling but never had inserted by this engine is left alone.
  const foreignNote = plan.presentForeign.length
    ? `; ${plan.presentForeign.length} payload rule(s) present but not owned here - hand-edited, the engine will never touch them`
    : '';
  return {
    op, mode: 'settings', target: SETTINGS_POSIX, key: SETTINGS_POSIX, content,
    write: lf(raw) !== lf(content),
    bookkeeping: { ownedAskRules: owned, suppressedAskRules: plan.suppressed },
    summary: `ask ruleset reconciled: ${parts.length ? parts.join(', ') : 'nothing to change'} (foreign rules untouched)${foreignNote}`,
  };
}

function readDesiredRules(ctx, ruleset) {
  const rulesetRaw = readText(path.join(ctx.pluginRoot, ...ruleset.split('/')));
  if (rulesetRaw === null) throw new UpdateError(`the payload ruleset "${ruleset}" is missing.`);
  let parsed;
  try { parsed = JSON.parse(rulesetRaw); } catch (e) { throw new UpdateError(`the payload ruleset "${ruleset}" is not valid JSON (${e.message}).`); }
  const declared = (isPlainObject(parsed.permissions) && Array.isArray(parsed.permissions.ask)) ? parsed.permissions.ask : null;
  if (!declared) throw new UpdateError(`the payload ruleset "${ruleset}" declares no permissions.ask list.`);
  return declared.map((rule) => rule.split('<projectRoot>').join(ctx.projectRoot));
}

// ---------------------------------------------------------------------------
// Applying one planned operation
// ---------------------------------------------------------------------------
function mergeBookkeeping(config, bookkeeping) {
  if (!bookkeeping) return;
  const bk = config._aiwf;
  if (bookkeeping.managedRegions) {
    for (const [key, entry] of Object.entries(bookkeeping.managedRegions)) bk.managedRegions[key] = entry;
  }
  if (bookkeeping.ownedAskRules) bk.ownedAskRules = bookkeeping.ownedAskRules;
  if (bookkeeping.suppressedAskRules) bk.suppressedAskRules = bookkeeping.suppressedAskRules;
}

function writeConfig(ctx) {
  writeAtomic(ctx.configFile, jsonText(orderConfig(ctx.config)));
}

/**
 * Applies one plan. In a dry run (`ctx.overlay` set) nothing touches the disk: file contents go to
 * the overlay and config changes stay in memory, so the next operation is planned against the state
 * this one would leave.
 */
function applyPlan(ctx, plan) {
  if (plan.mode === 'config') setConfigPath(ctx.config, plan.op.path, plan.value);
  if ((plan.mode === 'file' || plan.mode === 'settings') && plan.write) {
    if (ctx.overlay) ctx.overlay.set(plan.target, plan.content);
    else writeAtomic(path.join(ctx.projectRoot, ...plan.target.split('/')), plan.content, { raw: plan.raw === true });
  }
  mergeBookkeeping(ctx.config, plan.bookkeeping);
  // The reconcile's ownership is persisted the moment settings.json carries it (see THE MODEL).
  if (plan.mode === 'settings' && !ctx.overlay) writeConfig(ctx);
}

// ---------------------------------------------------------------------------
// $schema - engine bookkeeping, like the _aiwf stamps, never an operation
// ---------------------------------------------------------------------------
/** The `$schema` value a config installed or updated from `pluginRoot` carries - setup's own form. */
export const schemaRef = (pluginRoot) => toPosix(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json'));

/**
 * Points a stale `$schema` at this run's payload, ONCE per run and before the first operation. In a
 * dry run the value is assigned in memory only. Idempotent: a value that is already right is not
 * written, so the file stays byte for byte what it was. Returns { from, to }, or null when nothing
 * was stale.
 */
export function refreshSchemaRef(configFile, config, pluginRoot, dryRun) {
  const to = schemaRef(pluginRoot);
  if (config.$schema === to) return null;
  const from = own(config, '$schema') ? config.$schema : null;
  config.$schema = to;
  if (!dryRun) writeAtomic(configFile, jsonText(orderConfig(config)));
  return { from, to };
}

export const schemaRefreshLine = ({ from, to }) => `refreshed $schema: ${from === null ? '(none)' : String(from)} -> ${to}`;

// ---------------------------------------------------------------------------
// The payload rules present but not owned
// ---------------------------------------------------------------------------
/**
 * Measured from the FINAL state (the settings file as it now is, plus the final bookkeeping) for
 * every ruleset a pending migration reconciled. The set is invariant across the reconcile (see
 * planAskRules' header), so measuring afterwards is the same answer. Returns the lines to print:
 * `N payload rule(s) present but not owned here: <names>`, one per ruleset that has any.
 */
function foreignAskRuleLines(ctx, pending) {
  const lines = [];
  const seen = new Set();
  for (const entry of pending) {
    const ops = (ctx.payload.migrations.get(entry.id) || { operations: [] }).operations;
    for (const op of ops) {
      if (op.op !== 'reconcile-ask-ruleset' || seen.has(op.ruleset)) continue;
      seen.add(op.ruleset);
      let desired = null;
      let actual = null;
      try {
        desired = readDesiredRules(ctx, op.ruleset);
        const settings = JSON.parse(ctx.readProjected(SETTINGS_POSIX) || 'null');
        if (isPlainObject(settings) && isPlainObject(settings.permissions) && Array.isArray(settings.permissions.ask)) {
          actual = settings.permissions.ask;
        }
      } catch { /* reported below */ }
      if (desired === null || actual === null) {
        // Never swallowed: a missing line would read as "no foreign rules" - the one wrong answer.
        ctx.warn(`the ask ruleset "${op.ruleset}" could not be re-read against ${SETTINGS_POSIX}, so no rules are named as "present but not owned" for it.`);
        continue;
      }
      const bk = ctx.config._aiwf;
      const { presentForeign } = planAskRules({
        desired,
        actual,
        owned: Array.isArray(bk.ownedAskRules) ? bk.ownedAskRules : [],
        suppressed: Array.isArray(bk.suppressedAskRules) ? bk.suppressedAskRules : [],
      });
      if (presentForeign.length) lines.push(`${presentForeign.length} payload rule(s) present but not owned here: ${presentForeign.join(', ')}`);
    }
  }
  return lines;
}

// ---------------------------------------------------------------------------
// The modes
// ---------------------------------------------------------------------------
function makeContext({ pluginRoot, projectRoot, payload, configFile, config, resolve, log, warn }) {
  const ctx = {
    pluginRoot, projectRoot, payload, configFile, config, resolve, log, warn,
    schema: loadSchema(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json')),
    applied: [],
    // The dry-run overlay: project-relative path -> the content the previewed operations would have
    // left there. null in apply mode, where every read goes straight to disk.
    overlay: null,
  };
  // The render context is built PER RENDER, never cached: an earlier operation in the same run may
  // have added a config key the template reads.
  ctx.render = (ref) => renderRef(pluginRoot, ref, renderContext(projectRoot, ctx.config));
  ctx.readProjected = (rel) => {
    if (ctx.overlay && ctx.overlay.has(rel)) return ctx.overlay.get(rel);
    return readText(path.join(projectRoot, ...rel.split('/')));
  };
  return ctx;
}

/**
 * `--check`: the version interlock every /pnp:* skill runs in Step 0. Touches nothing - a legacy
 * bookkeeping shape is normalised in memory and left on disk as it is.
 */
export function checkInterlock({ pluginRoot, projectRoot }) {
  const { payload, config, pending } = preflight({ pluginRoot, projectRoot });
  return {
    current: pending.length === 0,
    pending,
    installedVersion: config._aiwf.installedPluginVersion,
    payloadVersion: payload.version,
  };
}

/**
 * The whole update. `dryRun` plans everything and writes NOTHING. Returns a report; throws
 * UpdateError when the run is blocked (every migration completed before it stays applied and
 * stamped; the one it stopped in runs again on the next start).
 *
 * `resolve(address, { question, path, fallback })` answers an `askOperator` key with an answer
 * record (the CLI builds it: a resolution file, a prompt, a stop, or - in a dry run - `would ask`).
 */
export function runUpdate({ pluginRoot, projectRoot, resolve, dryRun = false, log = () => {}, warn = null }) {
  const { payload, configFile, config, pending, normalized } = preflight({ pluginRoot, projectRoot });
  const from = config._aiwf.installedPluginVersion;
  const to = payload.version;

  // The one write a run makes before its first operation: a `$schema` left pointing at another
  // plugin root.
  const schemaRefreshed = refreshSchemaRef(configFile, config, pluginRoot, dryRun);
  if (pending.length === 0) {
    // An already-current project whose config still carries the legacy bookkeeping shape gets it
    // written back here - otherwise nothing would ever rewrite it until the next version bump, and a
    // config the schema rejects would stand until then. (refreshSchemaRef already wrote the
    // normalised object when it wrote at all; writing it again is the same bytes.)
    const bookkeepingNormalized = normalized && !dryRun;
    if (bookkeepingNormalized) writeAtomic(configFile, jsonText(orderConfig(config)));
    return { current: true, from, to, applied: [], preview: [], pending: [], dryRun, schemaRefreshed, bookkeepingNormalized, foreign: [] };
  }

  const ctx = makeContext({
    pluginRoot, projectRoot, payload, configFile, config, resolve, log,
    warn: warn || ((message) => log(`warning: ${message}`)),
  });
  for (const line of changelogLines(pluginRoot, from, to)) log(line);

  if (dryRun) {
    // A preview NEVER writes and NEVER prompts. It is SEQUENTIAL: each operation is planned against
    // the state its predecessors would have left (config in memory, files in the overlay).
    ctx.overlay = new Map();
    const preview = [];
    for (const entry of pending) {
      for (const [opIndex, op] of payload.migrations.get(entry.id).operations.entries()) {
        const plan = planOperation(ctx, entry.id, opIndex, op);
        applyPlan(ctx, plan);
        preview.push({ migration: entry.id, opIndex, summary: plan.summary, lines: plan.lines || [], op });
      }
    }
    return { current: false, from, to, applied: [], preview, pending, dryRun: true, schemaRefreshed, foreign: foreignAskRuleLines(ctx, pending) };
  }

  for (const entry of pending) {
    const ops = payload.migrations.get(entry.id).operations;
    for (const [opIndex, op] of ops.entries()) {
      const plan = planOperation(ctx, entry.id, opIndex, op);
      applyPlan(ctx, plan);
      ctx.applied.push({ migration: entry.id, opIndex, summary: plan.summary, op });
      log(`  ${entry.id}[${opIndex}] ${plan.summary}`);
      for (const line of plan.lines || []) log(`    ${line}`);
    }
    // ONE config write per migration: its bookkeeping, and the stamps that say it is done. The
    // version moves WITH the migration id, so the two never disagree after a stop between migrations.
    ctx.config._aiwf.lastMigrationApplied = entry.id;
    ctx.config._aiwf.installedPluginVersion = entry.targetPluginVersion;
    writeConfig(ctx);
  }

  return {
    current: false, from, to, applied: ctx.applied, preview: [], pending, dryRun: false, schemaRefreshed,
    foreign: foreignAskRuleLines(ctx, pending),
  };
}
