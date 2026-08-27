#!/usr/bin/env node
/*
 * Generate engine - renders the PROJECT LAYER from one source of truth: aiwf.config.json.
 *
 * WHAT IT WRITES (the project layer of the three-layer model)
 *   .claude/aiwf-native/aiwf.config.json   the config itself, with the _aiwf bookkeeping block
 *   .claude/aiwf-native/roles.json         rendered from config.roles     (managed artifact)
 *   .claude/agents/writer.md               always rendered                (managed artifact)
 *   .claude/agents/reviewer.md|qa.md       ONLY when that role is claude-hosted (managed artifact)
 *   CLAUDE.md                              the `aiwf-core` managed region (create / append / re-render)
 *   <overridesDoc>                         rendered ONCE, then owned by the operator forever
 *   .claude/settings.json                  ask-ruleset SET-MERGE, ownership without takeover
 *   <plansDir>/active, <plansDir>/archive, <scratchDir>   directories
 *
 * TWO PHASES, AND THE ORDER IS THE SAFETY PROPERTY
 *   plan() decides everything and writes nothing; apply() writes what plan() decided. Any blocker -
 *   a conflict, an unparseable file, a stale artifact that would have to be deleted - is found in
 *   the plan phase, so the run stops with the project EXACTLY as it was. A generator that discovered
 *   its conflicts while writing would leave a half-installed project behind, and "no silent
 *   overwrite" would hold for the file it stopped on and for nothing before it.
 *
 * NO SILENT OVERWRITE - the three states of a managed artifact
 *   Bookkeeping carries two hashes per artifact: `upstream` (what the payload last rendered) and
 *   `local` (what was last accepted). With `actual` = what is on disk right now:
 *     actual == local, render == actual   -> nothing to do (this is what makes a re-run zero-diff)
 *     actual == local, render != actual   -> a clean re-render (the config changed); write, restamp
 *     actual != local                     -> a manual edit inside a managed artifact: CONFLICT.
 *                                            Stop and name the key; the resolve dialog is /pnp:update.
 *     recorded, but GONE from disk        -> the extreme case of `actual != local`: a deletion is a
 *                                            manual edit too, so it is a CONFLICT, never a silent
 *                                            re-create (which would also wipe an override record).
 *                                            Same for a marker region deleted out of a live file.
 *     on disk, no bookkeeping entry       -> not ours to touch. Stop. Adopting pre-existing files
 *                                            is the adopt path, not a side effect of setup.
 *   Nothing here overwrites in any branch, and content OUTSIDE the markers is never read as ours.
 *   A file is DELETED only when all three hold: it is recorded as ours, its content still hashes to
 *   the recorded render, and the operator passed --confirm-remove-stale. The flag confirms removing
 *   the stale render setup reported - not whatever happens to sit at that path.
 *
 * HASHES are sha256 over the LF-normalised text, so a CRLF checkout does not read as an edit.
 *
 * MEMORY SEEDS are PRINTED for the operator, never written into any memory store: the store's
 * format and location are machine-local and are not the plugin's to assume.
 *
 * CLI
 *   node generate.mjs --answers-file <answers.json> [--project-root <dir>] [--plugin-root <dir>]
 *                     [--confirm-remove-stale] [--no-seeds] [--dry-run] [--quiet]
 *   exit 0 = applied (or dry-run clean); exit 1 = blocked, nothing written; exit 2 = cannot start.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectDefaults, formatErrors, loadSchema, validate } from './validate-config.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PLUGIN_ROOT = path.resolve(HERE, '..', '..');

export const SUPPORTED_OS = 'windows';
export const CONFIG_REL = path.join('.claude', 'aiwf-native', 'aiwf.config.json');
export const ROLES_REL = path.join('.claude', 'aiwf-native', 'roles.json');
export const SETTINGS_REL = path.join('.claude', 'settings.json');
const AGENTS_DIR = path.join('.claude', 'agents');
const REGION_ID = 'aiwf-core';
const REGION_BEGIN = `<!-- BEGIN ${REGION_ID} -->`;
const REGION_END = `<!-- END ${REGION_ID} -->`;
// Fresh install: nothing is executed, the last manifest entry is STAMPED. No migrations ship yet,
// so this is the id the first manifest entry will carry (migrations/0001_initial - the runner is P3).
const FRESH_INSTALL_MIGRATION = '0001_initial';
// Stand-in bookkeeping, used ONLY to shape-check the answers before the real block exists. Never
// written anywhere: the real _aiwf is built at the end of the plan, from the run's own hashes.
const PROBE_AIWF = {
  installedPluginVersion: '0.0.0',
  lastMigrationApplied: FRESH_INSTALL_MIGRATION,
  migrationJournal: null,
  managedRegions: {},
  ownedAskRules: [],
  suppressedAskRules: [],
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const toPosix = (p) => p.split(path.sep).join('/');
const lf = (text) => text.replace(/\r\n/g, '\n');
export const sha256 = (text) => crypto.createHash('sha256').update(lf(text), 'utf8').digest('hex');
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const jsonText = (value) => JSON.stringify(value, null, 2) + '\n';

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------
// The syntax is exactly what the shipped templates use, and nothing more:
//   {{config.<dotpath>}}   {{resolvedRoot}}   {{this}} / {{this.<key>}} inside a block
//   {{#each <path>}} ... {{/each}}            {{^<path>}} ... {{/<path>}}   (inverse)
// An unresolvable path THROWS. A typo in a template must break the install loudly rather than
// render an empty string into a doctrine file nobody re-reads.
class RenderError extends Error {}

// A block tag alone on its line takes the whole line with it (the Mustache "standalone" rule).
// Without this, `{{#each}}` on its own line leaves a blank line behind for every empty list.
function stripStandaloneTags(text) {
  return text.replace(/^[ \t]*(\{\{[#^/][^{}]*\}\})[ \t]*\r?\n/gm, '$1');
}

function tokenize(text) {
  const tokens = [];
  const re = /\{\{\s*([#^/]?)\s*([^{}]+?)\s*\}\}/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', value: text.slice(last, m.index) });
    const [, sigil, body] = m;
    if (sigil === '#') {
      const parts = body.split(/\s+/);
      if (parts[0] !== 'each' || parts.length !== 2) throw new RenderError(`unsupported block helper {{#${body}}}`);
      tokens.push({ type: 'open', kind: 'each', path: parts[1] });
    } else if (sigil === '^') {
      tokens.push({ type: 'open', kind: 'inverse', path: body });
    } else if (sigil === '/') {
      tokens.push({ type: 'close', path: body });
    } else {
      tokens.push({ type: 'var', path: body });
    }
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) });
  return tokens;
}

function parseBlocks(tokens) {
  const root = { children: [] };
  const stack = [root];
  for (const token of tokens) {
    const top = stack[stack.length - 1];
    if (token.type === 'open') {
      const node = { type: 'block', kind: token.kind, path: token.path, children: [] };
      top.children.push(node);
      stack.push(node);
    } else if (token.type === 'close') {
      if (stack.length === 1) throw new RenderError(`closing tag {{/${token.path}}} without an opening tag`);
      const open = stack.pop();
      const expected = open.kind === 'each' ? 'each' : open.path;
      if (token.path !== expected) {
        throw new RenderError(`closing tag {{/${token.path}}} does not match {{${open.kind === 'each' ? '#each ' + open.path : '^' + open.path}}}`);
      }
    } else {
      top.children.push(token);
    }
  }
  if (stack.length !== 1) throw new RenderError(`unclosed block {{${stack[stack.length - 1].path}}}`);
  return root;
}

function lookup(scope, expression) {
  if (expression === 'this') {
    if (!('this' in scope)) throw new RenderError('{{this}} used outside an {{#each}} block');
    return scope.this;
  }
  const segments = expression.split('.');
  let value = scope;
  for (let i = 0; i < segments.length; i += 1) {
    if (!isPlainObject(value) || !(segments[i] in value)) {
      throw new RenderError(`unresolvable template path "${expression}"`);
    }
    value = value[segments[i]];
  }
  return value;
}

const isEmptyValue = (v) => v === undefined || v === null || v === false || v === ''
  || (Array.isArray(v) && v.length === 0);

function renderNodes(nodes, scope) {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') { out += node.value; continue; }
    if (node.type === 'var') {
      const value = lookup(scope, node.path);
      if (isPlainObject(value) || Array.isArray(value)) {
        throw new RenderError(`template path "${node.path}" resolves to a ${Array.isArray(value) ? 'list' : 'object'}, which has no rendering`);
      }
      out += String(value);
      continue;
    }
    const value = lookup(scope, node.path);
    if (node.kind === 'each') {
      if (!Array.isArray(value)) throw new RenderError(`{{#each ${node.path}}} needs a list, found ${typeof value}`);
      for (const item of value) out += renderNodes(node.children, { ...scope, this: item });
    } else if (isEmptyValue(value)) {
      out += renderNodes(node.children, scope);
    }
  }
  return out;
}

/** Renders one template. `context` is `{ config, resolvedRoot }`. Never mutates the context. */
export function renderTemplate(text, context) {
  const tree = parseBlocks(tokenize(stripStandaloneTags(text)));
  return renderNodes(tree.children, context);
}

// ---------------------------------------------------------------------------
// Project root + answers
// ---------------------------------------------------------------------------
export function resolveProjectRoot(explicit, cwd = process.cwd()) {
  if (explicit) return path.resolve(explicit);
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (out && out.trim()) return path.resolve(out.trim());
  } catch { /* not a git worktree - fall through */ }
  return null;
}

/** The fail-closed OS gate. The schema admits three channels; v0.1 can only GENERATE one. */
export function assertSupportedOs(os) {
  if (os === SUPPORTED_OS) return;
  throw new SetupError(
    `os "${os}" is not supported before 1.0 - only "${SUPPORTED_OS}" ships wrappers today, and setup ` +
    'refuses rather than generate an installation this version cannot run.',
  );
}

export class SetupError extends Error {}

function deepMerge(base, overlay) {
  if (!isPlainObject(base) || !isPlainObject(overlay)) return overlay === undefined ? base : overlay;
  const out = {};
  for (const key of Object.keys(base)) out[key] = base[key];
  for (const key of Object.keys(overlay)) {
    out[key] = (isPlainObject(out[key]) && isPlainObject(overlay[key])) ? deepMerge(out[key], overlay[key]) : overlay[key];
  }
  return out;
}

const CONFIG_KEY_ORDER = ['$schema', '_aiwf', 'project', 'os', 'operator', 'roles', 'loop', 'enforcement', 'verify', 'paths', 'review'];

// Deterministic key order, so a re-run produces a byte-identical file. Keys the order does not know
// are appended rather than dropped: an unknown key must fail schema validation loudly, not vanish.
function orderConfig(config) {
  const out = {};
  for (const key of CONFIG_KEY_ORDER) if (key in config) out[key] = config[key];
  for (const key of Object.keys(config)) if (!(key in out)) out[key] = config[key];
  return out;
}

// ---------------------------------------------------------------------------
// Ask-ruleset merge (ownership WITHOUT takeover)
// ---------------------------------------------------------------------------
// Formulas from the update contract, applied at install time:
//   to-add   = (desired - actual) - suppressed      (a tombstone is never forced back)
//   owned'   = (owned n actual) + to-add            (only rules setup really INSERTED are owned)
//   tombstone: an owned rule missing from actual moves to suppressed and is reported
export function planAskRules({ desired, actual, owned, suppressed }) {
  const actualSet = new Set(actual);
  const suppressedSet = new Set(suppressed);
  const newlyTombstoned = owned.filter((r) => !actualSet.has(r));
  for (const r of newlyTombstoned) suppressedSet.add(r);
  const toAdd = desired.filter((r) => !actualSet.has(r) && !suppressedSet.has(r));
  const ownedNext = owned.filter((r) => actualSet.has(r)).concat(toAdd);
  return {
    toAdd,
    newlyTombstoned,
    ask: actual.concat(toAdd),
    owned: ownedNext,
    suppressed: [...suppressedSet],
  };
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------
function templatePath(pluginRoot, ...rel) { return path.join(pluginRoot, 'templates', ...rel); }

function readTemplate(pluginRoot, ...rel) {
  const file = templatePath(pluginRoot, ...rel);
  const text = readText(file);
  if (text === null) throw new SetupError(`missing payload template ${toPosix(path.relative(pluginRoot, file))}`);
  return text;
}

function regionOf(rendered) {
  const start = rendered.indexOf(REGION_BEGIN);
  const end = rendered.indexOf(REGION_END);
  if (start === -1 || end === -1) throw new SetupError(`the CLAUDE.md template has no ${REGION_ID} markers`);
  return rendered.slice(start, end + REGION_END.length);
}

/**
 * Decides the whole installation without touching the filesystem.
 * Returns { config, actions, blockers, notes, artifacts } - `actions` is what apply() will do.
 */
export function planInstall({ pluginRoot, projectRoot, answers, confirmRemoveStale = false, schema }) {
  const blockers = [];
  const notes = [];
  const actions = [];
  const abs = (rel) => path.join(projectRoot, rel);

  const pluginJson = JSON.parse(fs.readFileSync(path.join(pluginRoot, '.claude-plugin', 'plugin.json'), 'utf8'));
  const activeSchema = schema || loadSchema(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json'));

  // ---- 1. the config object ------------------------------------------------
  const existingRaw = readText(abs(CONFIG_REL));
  let existing = null;
  if (existingRaw !== null) {
    try { existing = JSON.parse(existingRaw); } catch (e) {
      // Stop here rather than plan around it: every later step reads this file's bookkeeping, and a
      // plan built on "there is no previous state" would report conflicts that do not exist.
      blockers.push(`${toPosix(CONFIG_REL)} exists but is not valid JSON (${e.message}) - setup will not overwrite a config it cannot read.`);
      return { config: null, actions: [], blockers, notes, artifacts: [], askPlan: null };
    }
  }
  const previousAiwf = (existing && isPlainObject(existing._aiwf)) ? existing._aiwf : null;
  const base = collectDefaults(activeSchema) || {};
  const carried = existing ? { ...existing } : {};
  delete carried.$schema;
  delete carried._aiwf;
  const merged = deepMerge(deepMerge(base, carried), answers || {});
  assertSupportedOs(merged.os);

  // The payload half of the config is validated BEFORE anything is rendered: a template that reads
  // a key the answers never supplied would otherwise fail with a render error instead of the
  // schema's own message, and the message is what tells the operator which answer is wrong.
  const shapeErrors = validate({ ...merged, _aiwf: PROBE_AIWF }, activeSchema).filter((e) => !e.path.startsWith('/_aiwf'));
  if (shapeErrors.length) {
    blockers.push(`the answers do not satisfy the config schema:\n${formatErrors(shapeErrors)}`);
    return { config: null, actions: [], blockers, notes, artifacts: [], askPlan: null };
  }

  // Configured paths are PROJECT-RELATIVE by contract. An absolute path, or one that climbs out of
  // the project, would make this engine write outside the repository it was pointed at - checked
  // here rather than trusted, because the check is one line and the failure is not recoverable.
  for (const key of ['scratchDir', 'plansDir', 'overridesDoc']) {
    const value = merged.paths[key];
    const outside = path.isAbsolute(value) || path.relative(projectRoot, path.resolve(projectRoot, value)).split(/[\\/]/)[0] === '..';
    if (outside) blockers.push(`paths.${key} ("${value}") is not inside the project - configured paths are project-relative.`);
  }
  if (blockers.length) return { config: null, actions: [], blockers, notes, artifacts: [], askPlan: null };

  // ---- 2. render every managed artifact ------------------------------------
  const resolvedRoot = projectRoot;
  const context = { config: merged, resolvedRoot };
  const artifacts = [];
  const addArtifact = (key, rel, content) => { artifacts.push({ key, rel, file: abs(rel), content }); };

  const rolesRendered = renderTemplate(readTemplate(pluginRoot, 'roles.json.tmpl'), context);
  try { JSON.parse(rolesRendered); } catch (e) {
    blockers.push(`the rendered roles.json is not valid JSON (${e.message}) - check the role values in the answers.`);
  }
  addArtifact(toPosix(ROLES_REL), ROLES_REL, rolesRendered);
  addArtifact(toPosix(path.join(AGENTS_DIR, 'writer.md')), path.join(AGENTS_DIR, 'writer.md'),
    renderTemplate(readTemplate(pluginRoot, 'agents', 'writer.md.tmpl'), context));

  const stale = [];
  for (const role of ['reviewer', 'qa']) {
    const rel = path.join(AGENTS_DIR, `${role}.md`);
    if (merged.roles[role].engine === 'claude') {
      addArtifact(toPosix(rel), rel, renderTemplate(readTemplate(pluginRoot, 'agents', `${role}.md.tmpl`), context));
      continue;
    }
    // A rendered Claude agent file next to a codex-hosted role is a STALE RENDER (the self-check
    // fails on it). Whether it may be DELETED is decided in step 8 against the bookkeeping - the
    // content is captured here so that decision compares hashes, not mere existence.
    const actual = readText(abs(rel));
    if (actual !== null) stale.push({ rel, key: toPosix(rel), actual });
  }

  const claudeMdRendered = renderTemplate(readTemplate(pluginRoot, 'CLAUDE.md.tmpl'), context);
  const claudeRegion = regionOf(claudeMdRendered);
  const overridesRel = merged.paths.overridesDoc;

  // ---- 3. bookkeeping: three-state per managed artifact ---------------------
  const previousRegions = (previousAiwf && isPlainObject(previousAiwf.managedRegions)) ? previousAiwf.managedRegions : {};
  const managedRegions = {};
  const stamp = (key, content, previous) => {
    const hash = sha256(content);
    managedRegions[key] = previous && previous.override === true
      ? { upstream: hash, local: previous.local, override: true }
      : { upstream: hash, local: hash, override: false };
  };

  // A DELETION is a manual edit. `actual != local` is the conflict rule, and a missing file is the
  // extreme case of it - so a recorded artifact that is gone must NOT be silently recreated: doing
  // so would also wipe an `override: true` record, i.e. undo an operator decision without asking.
  const deletedArtifact = (key) =>
    `${key} is recorded in _aiwf.managedRegions but is GONE from disk. A deletion is a manual edit, ` +
    `and setup never silently recreates a managed artifact - resolve it with ` +
    `\`/pnp:update --resolve ${key}\` (which can re-render it deliberately). Nothing was written.`;

  for (const artifact of artifacts) {
    const actual = readText(artifact.file);
    const previous = previousRegions[artifact.key];
    if (actual === null) {
      if (previous) { blockers.push(deletedArtifact(artifact.key)); continue; }
      actions.push({ kind: 'write', file: artifact.file, rel: artifact.rel, content: artifact.content, why: 'created' });
      stamp(artifact.key, artifact.content, null);
      continue;
    }
    if (!previous) {
      blockers.push(`${artifact.key} already exists but is not recorded in _aiwf.managedRegions - setup will not adopt a file it did not write. Move it aside (or adopt the installation) and re-run.`);
      continue;
    }
    if (sha256(actual) !== previous.local) {
      blockers.push(`${artifact.key} was edited by hand (its content no longer matches the recorded local hash). Nothing was overwritten - resolve it with \`/pnp:update --resolve ${artifact.key}\`.`);
      continue;
    }
    if (previous.override === true) {
      // The operator kept their own version through a conflict dialog. The new render is RECORDED
      // as upstream and applied to nothing; leaving override is an explicit `/pnp:update --resolve`.
      notes.push(`${artifact.key} is held by the operator (override) - the new render was recorded as upstream, not applied.`);
      stamp(artifact.key, artifact.content, previous);
      continue;
    }
    if (sha256(actual) !== sha256(artifact.content)) {
      actions.push({ kind: 'write', file: artifact.file, rel: artifact.rel, content: artifact.content, why: 're-rendered from the config' });
    }
    stamp(artifact.key, artifact.content, previous);
  }

  // ---- 4. CLAUDE.md: create / append the region / re-render it --------------
  const claudeFile = abs('CLAUDE.md');
  const claudeKey = `CLAUDE.md#${REGION_ID}`;
  const claudeActual = readText(claudeFile);
  const previousClaude = previousRegions[claudeKey];
  if (claudeActual === null) {
    // Same rule as the whole-file artifacts: a recorded region whose FILE was deleted is a manual
    // edit, not an invitation to recreate the file.
    if (previousClaude) blockers.push(deletedArtifact(claudeKey));
    else {
      actions.push({ kind: 'write', file: claudeFile, rel: 'CLAUDE.md', content: claudeMdRendered, why: 'created with the managed region' });
      stamp(claudeKey, claudeRegion, null);
    }
  } else {
    const start = claudeActual.indexOf(REGION_BEGIN);
    const end = claudeActual.indexOf(REGION_END);
    if (start === -1 && end === -1) {
      // The file is here but the markers are not. With a bookkeeping entry that means the REGION was
      // deleted out of the file - a manual edit again, so appending a fresh one would silently undo
      // it. Without an entry it is an ordinary CLAUDE.md that has never been managed: append.
      if (previousClaude) { blockers.push(deletedArtifact(claudeKey)); } else {
        const joiner = claudeActual.endsWith('\n') ? '\n' : '\n\n';
        actions.push({
          kind: 'write', file: claudeFile, rel: 'CLAUDE.md', why: 'managed region appended (existing text untouched)',
          content: claudeActual + joiner + claudeRegion + '\n',
        });
        stamp(claudeKey, claudeRegion, null);
      }
    } else if (start === -1 || end === -1 || end < start) {
      blockers.push(`CLAUDE.md carries only one of the ${REGION_ID} markers - setup will not guess where the managed region ends.`);
    } else {
      const actualRegion = claudeActual.slice(start, end + REGION_END.length);
      if (!previousClaude) {
        blockers.push(`CLAUDE.md already carries an ${REGION_ID} region that is not recorded in _aiwf.managedRegions - setup will not adopt it.`);
      } else if (sha256(actualRegion) !== previousClaude.local) {
        blockers.push(`${claudeKey} was edited by hand inside the markers. Nothing was overwritten - resolve it with \`/pnp:update --resolve ${claudeKey}\`. (Text OUTSIDE the markers is yours and is never read as ours.)`);
      } else if (previousClaude.override === true) {
        notes.push(`${claudeKey} is held by the operator (override) - the new render was recorded as upstream, not applied.`);
        stamp(claudeKey, claudeRegion, previousClaude);
      } else {
        if (sha256(actualRegion) !== sha256(claudeRegion)) {
          actions.push({
            kind: 'write', file: claudeFile, rel: 'CLAUDE.md', why: 'managed region re-rendered (text outside the markers preserved)',
            content: claudeActual.slice(0, start) + claudeRegion + claudeActual.slice(end + REGION_END.length),
          });
        }
        stamp(claudeKey, claudeRegion, previousClaude);
      }
    }
  }

  // ---- 5. the overrides document: written ONCE -----------------------------
  const overridesFile = abs(overridesRel);
  if (fs.existsSync(overridesFile)) {
    notes.push(`${toPosix(overridesRel)} already exists and is yours - setup never rewrites it.`);
  } else {
    actions.push({
      kind: 'write', file: overridesFile, rel: overridesRel, why: 'seeded once; never rewritten',
      content: renderTemplate(readTemplate(pluginRoot, 'PROJECT_OVERRIDES.md.tmpl'), context),
    });
  }

  // ---- 6. settings.json: set-merge, foreign rules untouched -----------------
  const settingsFile = abs(SETTINGS_REL);
  const settingsRaw = readText(settingsFile);
  let settings = null;
  if (settingsRaw === null) settings = {};
  else {
    try { settings = JSON.parse(settingsRaw); } catch (e) {
      blockers.push(`${toPosix(SETTINGS_REL)} exists but is not valid JSON (${e.message}) - setup will not rewrite a settings file it cannot read.`);
    }
  }
  // Two shapes this engine refuses to reason about, because "merge" would mean "replace": a
  // `permissions` value that is not an object, and a `permissions.ask` that is not a list. Both are
  // legal JSON and both would silently lose whatever the operator meant by them.
  if (settings && 'permissions' in settings && !isPlainObject(settings.permissions)) {
    blockers.push(`${toPosix(SETTINGS_REL)} has a "permissions" value that is not an object (found ${Array.isArray(settings.permissions) ? 'an array' : typeof settings.permissions}) - setup will not rewrite a permissions shape it does not understand. Nothing was written.`);
    settings = null;
  }
  if (settings && isPlainObject(settings.permissions)
      && settings.permissions.ask !== undefined && !Array.isArray(settings.permissions.ask)) {
    blockers.push(`${toPosix(SETTINGS_REL)} has a "permissions.ask" value that is not a list (found ${typeof settings.permissions.ask}) - the ask ruleset is a set of rules, and setup will not replace a shape it does not understand. Nothing was written.`);
    settings = null;
  }

  let askPlan = { toAdd: [], newlyTombstoned: [], ask: [], owned: [], suppressed: [] };
  if (settings) {
    const ruleset = JSON.parse(fs.readFileSync(templatePath(pluginRoot, 'settings.ask-ruleset.json'), 'utf8'));
    const desired = ruleset.permissions.ask.map((rule) => rule.split('<projectRoot>').join(resolvedRoot));
    const hadPermissions = isPlainObject(settings.permissions);
    const permissions = hadPermissions ? settings.permissions : {};
    askPlan = planAskRules({
      desired,
      actual: Array.isArray(permissions.ask) ? permissions.ask : [],
      owned: (previousAiwf && Array.isArray(previousAiwf.ownedAskRules)) ? previousAiwf.ownedAskRules : [],
      suppressed: (previousAiwf && Array.isArray(previousAiwf.suppressedAskRules)) ? previousAiwf.suppressedAskRules : [],
    });
    // The factory allow/deny posture applies ONLY to a project that had no permissions block of its
    // own; an existing posture is the project's business and is never rewritten.
    const nextPermissions = hadPermissions
      ? { ...permissions, ask: askPlan.ask }
      : { allow: ruleset.permissions.allow, deny: ruleset.permissions.deny, ask: askPlan.ask };
    const nextSettings = { ...settings, permissions: nextPermissions };
    const content = jsonText(nextSettings);
    if (settingsRaw === null || lf(settingsRaw) !== lf(content)) {
      actions.push({
        kind: 'write', file: settingsFile, rel: SETTINGS_REL, content,
        why: settingsRaw === null ? 'created with the ask ruleset' : `ask ruleset merged (+${askPlan.toAdd.length} rule(s), foreign rules untouched)`,
      });
    }
    for (const rule of askPlan.newlyTombstoned) {
      notes.push(`owned ask rule "${rule}" is absent from settings.json - recorded as a tombstone in _aiwf.suppressedAskRules and never forced back.`);
    }
  }

  // ---- 7. directories ------------------------------------------------------
  for (const rel of [merged.paths.scratchDir, path.join(merged.paths.plansDir, 'active'), path.join(merged.paths.plansDir, 'archive'), path.dirname(CONFIG_REL), AGENTS_DIR, path.dirname(overridesRel)]) {
    const dir = abs(rel);
    if (!fs.existsSync(dir)) actions.push({ kind: 'mkdir', file: dir, rel: toPosix(rel), why: 'created' });
  }

  // ---- 8. the stale-render destructive gate --------------------------------
  // THREE conditions before a file is deleted, in this order: it is RECORDED as ours, its content is
  // still exactly the render we recorded, and the operator passed the flag. The flag alone is not
  // enough - `--confirm-remove-stale` confirms "remove the stale render you told me about", and a
  // foreign or hand-edited file at that path is not that file. Deleting it would be an unrecoverable
  // answer to a question the operator was never asked.
  for (const { rel, key, actual } of stale) {
    const previous = previousRegions[key];
    if (!previous) {
      blockers.push(`${key} exists but is not recorded in _aiwf.managedRegions - setup will not adopt (or delete) a file it did not write, even though the ${key.includes('reviewer') ? 'reviewer' : 'qa'} role is codex-hosted now. Move it aside and re-run.`);
    } else if (sha256(actual) !== previous.local) {
      blockers.push(`${key} is a stale render that was ALSO edited by hand (its content no longer matches the recorded local hash), so it is not the file the removal flag confirms. Nothing was deleted - resolve it with \`/pnp:update --resolve ${key}\`.`);
    } else if (!confirmRemoveStale) {
      blockers.push(`${toPosix(rel)} is a STALE render: the role is now codex-hosted, so a Claude agent file must not stay behind (the self-check fails on it). Nothing was deleted - re-run with --confirm-remove-stale to remove it.`);
    } else {
      actions.push({ kind: 'remove', file: abs(rel), rel: toPosix(rel), why: 'stale render: the role is codex-hosted (recorded, unmodified, removal confirmed)' });
    }
  }

  // ---- 9. the final config, and it must validate ---------------------------
  const config = orderConfig({
    ...merged,
    $schema: toPosix(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json')),
    _aiwf: {
      installedPluginVersion: pluginJson.version,
      lastMigrationApplied: (previousAiwf && typeof previousAiwf.lastMigrationApplied === 'string' && previousAiwf.lastMigrationApplied)
        ? previousAiwf.lastMigrationApplied
        : FRESH_INSTALL_MIGRATION,
      migrationJournal: previousAiwf ? (previousAiwf.migrationJournal ?? null) : null,
      managedRegions,
      ownedAskRules: askPlan.owned,
      suppressedAskRules: askPlan.suppressed,
    },
  });
  const errors = validate(config, activeSchema);
  if (errors.length) blockers.push(`the resulting config does not satisfy the schema:\n${formatErrors(errors)}`);

  const configContent = jsonText(config);
  if (existingRaw === null || lf(existingRaw) !== lf(configContent)) {
    actions.push({
      kind: 'write', file: abs(CONFIG_REL), rel: toPosix(CONFIG_REL), content: configContent,
      why: existingRaw === null ? 'created' : 'updated',
    });
  }

  return { config, actions, blockers, notes, artifacts, askPlan };
}

// ---------------------------------------------------------------------------
// Applying
// ---------------------------------------------------------------------------
function applyPlan(plan) {
  const applied = [];
  // Directories first: a write into a directory that does not exist yet must not depend on order.
  for (const action of plan.actions) {
    if (action.kind !== 'mkdir') continue;
    fs.mkdirSync(action.file, { recursive: true });
    applied.push(action);
  }
  for (const action of plan.actions) {
    if (action.kind === 'write') {
      fs.mkdirSync(path.dirname(action.file), { recursive: true });
      fs.writeFileSync(action.file, lf(action.content), 'utf8');
    } else if (action.kind === 'remove') {
      fs.rmSync(action.file, { force: true });
    } else continue;
    applied.push(action);
  }
  return applied;
}

export function readMemorySeeds(pluginRoot) {
  const dir = path.join(pluginRoot, 'templates', 'memory-seeds');
  let names = [];
  try { names = fs.readdirSync(dir).filter((n) => n.endsWith('.md')).sort(); } catch { return []; }
  return names.map((name) => ({ name: name.replace(/\.md$/, ''), text: fs.readFileSync(path.join(dir, name), 'utf8') }));
}

/**
 * Plans and (unless dryRun) applies. Returns a report; NOTHING is written when `blockers` is
 * non-empty, so a blocked run leaves the project exactly as it was.
 */
export function generateProject(options) {
  const plan = planInstall(options);
  if (plan.blockers.length || options.dryRun) return { ...plan, applied: [], blocked: plan.blockers.length > 0 };
  const applied = applyPlan(plan);
  return { ...plan, applied, blocked: false };
}

export function formatReport(report, { projectRoot, seeds = [] }) {
  const lines = [];
  lines.push(`project: ${projectRoot}`);
  if (report.blocked) {
    lines.push('', 'BLOCKED - nothing was written:');
    for (const b of report.blockers) lines.push(`  - ${b}`);
    return lines.join('\n');
  }
  const changes = report.applied.length ? report.applied : report.actions;
  if (changes.length === 0) lines.push('', 'no changes - the project layer already matches the config (re-run is a zero diff).');
  else {
    lines.push('', `${report.applied.length ? 'applied' : 'would apply'}:`);
    for (const a of changes) lines.push(`  ${a.kind.padEnd(6)} ${toPosix(a.rel)}  (${a.why})`);
  }
  for (const n of report.notes) lines.push(`  note   ${n}`);
  if (seeds.length) {
    lines.push('', '='.repeat(78));
    lines.push('MEMORY SEEDS - paste these into your own memory tool. They are PRINTED, never written:');
    lines.push('the store\'s format and location are machine-local and not the plugin\'s to assume.');
    lines.push('='.repeat(78));
    for (const seed of seeds) lines.push('', `--- ${seed.name} ---`, seed.text.trimEnd());
  }
  return lines.join('\n');
}

// ---- CLI -------------------------------------------------------------------
function isMain() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return invoked === path.resolve(fileURLToPath(import.meta.url));
}

if (isMain()) {
  const args = process.argv.slice(2);
  const flag = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
  const has = (name) => args.includes(name);
  const pluginRoot = path.resolve(flag('--plugin-root') || DEFAULT_PLUGIN_ROOT);
  const projectRoot = resolveProjectRoot(flag('--project-root'));
  const answersFile = flag('--answers-file');
  try {
    if (!projectRoot) throw new SetupError('cannot resolve the project root - pass --project-root <dir> (this directory is not a git worktree).');
    if (!answersFile) throw new SetupError('--answers-file <answers.json> is required when generate.mjs is run directly (the interactive path is interview.mjs).');
    const answers = JSON.parse(fs.readFileSync(path.resolve(answersFile), 'utf8'));
    const report = generateProject({ pluginRoot, projectRoot, answers, confirmRemoveStale: has('--confirm-remove-stale'), dryRun: has('--dry-run') });
    const seeds = (has('--no-seeds') || report.blocked || has('--dry-run')) ? [] : readMemorySeeds(pluginRoot);
    if (!has('--quiet') || report.blocked) console.log(formatReport(report, { projectRoot, seeds }));
    process.exit(report.blocked ? 1 : 0);
  } catch (e) {
    console.error(`setup: ${e.message}`);
    process.exit(e instanceof SetupError ? 1 : 2);
  }
}
