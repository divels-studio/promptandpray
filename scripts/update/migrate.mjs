#!/usr/bin/env node
/*
 * Migration runner - the engine behind /pnp:update. Importable; the CLI is aiwf-update.mjs.
 *
 * THE PROMISE
 *   An update reaches an installed project WITHOUT ever overwriting the operator's own content.
 *   Everything below exists to make that true even when the process dies halfway.
 *
 * WHAT IT SHARES WITH SETUP, AND WHAT IT DELIBERATELY DOES NOT
 *   It imports the primitives from ../setup/generate.mjs - `sha256`, `renderTemplate`,
 *   `templateContext`, `planAskRules`, `lf`, `orderConfig`, `jsonText` - so a rendered artifact and
 *   its hash mean exactly the same thing in both engines. The CONFLICT STATE MACHINE is NOT setup's
 *   and is not shared: setup cleanly RE-RENDERS whenever `actual == local` (its legitimate re-render
 *   path), while an update asks the operator EXACTLY when there is something of theirs to lose -
 *     (a) `actual != local`     the operator edited the artifact (or it is GONE),
 *     (b) held AND edited       an override the operator has since changed again.
 *   A payload change alone is NOT a conflict: `newRender != upstream` on an artifact the operator
 *   never touched is the normal path of every migration, and it is applied silently through the same
 *   take-new machinery (see planRerender), listed in the CHANGES report. Setup re-renders the same
 *   config; an update brings a different payload - but only over content nobody has edited.
 *
 * THE TWO-HASH MODEL (PLAN "Update mechanism")
 *   `_aiwf.managedRegions[key] = { upstream, local, override }` where key is `<file>#<region>` for a
 *   marker region and `<file>` for a whole-file artifact. `upstream` = the content last RENDERED
 *   from the payload, `local` = the content last ACCEPTED. Clean: actual == local == upstream,
 *   override false. On a conflict the operator picks:
 *     take-new  - apply the render;  local = upstream = hash(render); override = false
 *     keep-mine - apply NOTHING;     local = hash(actual); upstream = hash(render); override = true
 *     merge     - apply the merged file; local = hash(merged); upstream = hash(render); override = true
 *   An `override: true` artifact is never re-applied by a later update: the new render is RECORDED
 *   as upstream and the artifact is listed in CHANGES. Leaving override is `--resolve <key>`, at any
 *   time, version bump or not. A DELETED file or region where bookkeeping has an entry is a manual
 *   edit too, so it is a conflict - never a silent re-create.
 *
 * WRITE-AHEAD JOURNAL, AND WHY THE STAGE COMES FIRST
 *   Per operation N: the accepted RESULT is staged on disk first (rendered content, merged content,
 *   or the operator's answer), then `_aiwf.migrationJournal` goes `prepared` carrying preHash and
 *   postHash = hash(staged result), then the target is written file-atomically, then the journal
 *   flips to `applied` in ONE atomic config write together with that operation's hash/ownership
 *   bookkeeping, then the stage is removed. Staging BEFORE the journal is what lets a restart replay
 *   the exact accepted result - including a manual merge and an operator's answer - without asking
 *   the same question twice.
 *   Recovery, on start, with a journal present: `applied` at N -> resume at N+1; `prepared` -> hash
 *   the target with the applicable projection: == postHash -> flip and continue, == preHash ->
 *   re-apply from the stage (or re-plan when the stage is gone: that state is exactly the pre state),
 *   neither -> the SAME conflict dialog every other conflict goes through, re-decided against the
 *   file as it is now. Every write boundary is therefore recoverable, and no branch is a dead end.
 *
 *   An operation that applies NOTHING but asserts something about an artifact (keep-mine, an
 *   artifact held through an override, an already-current re-render) journals that artifact with
 *   preHash == postHash == the hash its bookkeeping is about to claim. Only an operation with no
 *   artifact at all - a note, a config key that is already there - journals a null target. Without
 *   that identity a resume would stamp a hash describing a file that had changed in the meantime.
 *
 *   And because the state is READ when an operation is planned while the resolver may take any
 *   amount of time to answer (an interactive dialog can sit open), the target is re-hashed in the
 *   last instruction before the first write of every operation. A decision taken against a state
 *   that no longer exists is refused, not applied.
 *
 * HASHING PROJECTIONS
 *   ordinary file  -> sha256 over the LF-normalised whole file
 *   marker region  -> sha256 over the region INCLUDING its markers
 *   the config     -> sha256 over projectionText(config), which is the config WITHOUT
 *                     `_aiwf.migrationJournal`. Without that exclusion, a config-target operation
 *                     could never be recovered: writing the journal would change its own target's
 *                     hash.
 *
 * CRASH INJECTION (test-only, production-inert)
 *   PNP_UPDATE_CRASH_AT="<migration>/<opIndex>/<boundary>" with boundary one of
 *   `after-journal-prepared` | `after-target-apply` | `after-applied-flip` makes the process exit 86
 *   the instant that write completes. Without the variable nothing in here reads it twice and no
 *   branch changes. The acceptance suite uses ONLY this - a real process kill and a fresh process
 *   resume - never a hand-written journal state, because a hand-written state proves the recovery
 *   code parses a fixture, not that the engine can be killed.
 *
 * WHAT THIS ENGINE NEVER DOES
 *   It never initialises a project (no config = setup's business), never commits, never touches the
 *   operator's zone (`.aiwf/` scratch, memory, text outside the markers, settings.local.json), and
 *   never removes a rule it did not insert.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIG_REL, ROLES_REL, SETTINGS_REL,
  jsonText, lf, orderConfig, planAskRules, renderTemplate, sha256, templateContext,
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
export const STAGE_POSIX = '.claude/aiwf-native/update-stage';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

/** A blocked run: the project is left exactly as the last completed write left it. Exit 1. */
export class UpdateError extends Error {}
/** The run could not start at all (no config, unreadable payload). Exit 2. */
export class UpdateStartError extends Error {}

/**
 * THE refusal for an artifact this installation has no record of while a file is standing at its
 * path. One definition, because it is raised from three places that must not drift: the planning arm
 * of `createIfAbsent`, the last read before that plan's first write, and the recovery of an
 * interrupted creation. It names the only door that exists: `/pnp:setup --adopt` refuses a project
 * that already HAS an installation, so telling the operator to adopt would be pointing at a locked
 * one.
 */
const unrecordedFileRefusal = (key) =>
  `${key}: this installation has no record of it but a file is standing at that path - an update never `
  + 'adopts a file it did not write; move it aside or remove it, then run the update again';

/**
 * The EARLY half of the creation guard: the last read before a creation's first write, so the
 * operator gets this sentence rather than an errno. It is exported so it can be exercised directly -
 * the in-process window between planning a creation and writing it has no crash point to inject at,
 * and a guard that is only reachable through a race is a guard nobody has seen work.
 *
 * A file standing at the target refuses only when it DIFFERS from the render. Identical bytes are
 * this engine's own write - the folder is the plugin's - so there is nothing there to lose and
 * nothing to ask about.
 *
 * This check is the message, not the guarantee - between it and the write there is a window nothing
 * in one process can close. `writeCreatedTarget` below is the guarantee.
 */
export function assertNoForeignFileAtCreationTarget(absFile, content, key) {
  const standing = readText(absFile);
  if (standing !== null && lf(standing) !== lf(content)) throw new UpdateError(unrecordedFileRefusal(key));
}

/**
 * THE guarantee: a creation's target is published NO-CLOBBER, at the syscall boundary.
 *
 * `writeAtomic` is the wrong primitive here - its `rename` replaces whatever is at the target, which
 * is exactly right for re-rendering an artifact we own and exactly wrong for creating one we do not.
 * So the content is staged in the target's own directory and published with `link`, which FAILS with
 * EEXIST when anything is already there and is otherwise all-or-nothing: no window, no partial file,
 * no clobber. The temporary is removed either way; a hard link and its source are the same inode, so
 * unlinking the temp leaves the published file whole.
 *
 * It is called only where the target is ABSENT: the caller has already dealt with a file that is
 * there (identical content is ours and needs no write; differing content is refused). So an EEXIST
 * here is the race - a file that appeared between those two instructions - and it gets the same
 * refusal. Any OTHER link failure means this filesystem will not give the guarantee at all, and the
 * run stops rather than falling back to a write that could clobber.
 */
export function writeCreatedTarget(absFile, content, key) {
  fs.mkdirSync(path.dirname(absFile), { recursive: true });
  const body = lf(content);
  const tmp = `${absFile}.pnp-new-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  fs.writeFileSync(tmp, body, 'utf8');
  try {
    fs.linkSync(tmp, absFile);
  } catch (e) {
    if (e && e.code === 'EEXIST') throw new UpdateError(unrecordedFileRefusal(key));
    throw new UpdateError(
      `${key}: could not publish without clobbering - the filesystem refused a hard link (${e && e.code}); `
      + 'nothing was written, re-run on a filesystem that supports hard links',
    );
  } finally {
    try { fs.rmSync(tmp, { force: true }); } catch { /* the publish already succeeded or threw */ }
  }
}

// The setup-rendered managed artifacts and the payload template each one comes from. A migration op
// names its own template explicitly; this map exists for `--resolve <key>`, which reopens the dialog
// for an artifact OUTSIDE a version bump and therefore has no op to read the template from. The
// self-check asserts every path here exists in the payload, so the map cannot rot silently.
export const RESOLVABLE_ARTIFACT_TEMPLATES = {
  'CLAUDE.md#aiwf-core': 'templates/CLAUDE.md.tmpl#aiwf-core',
  [ROLES_POSIX]: 'templates/roles.json.tmpl',
  '.claude/aiwf-native/ORCHESTRATOR.md': 'templates/ORCHESTRATOR.md.tmpl',
  '.claude/agents/writer.md': 'templates/agents/writer.md.tmpl',
  '.claude/agents/reviewer.md': 'templates/agents/reviewer.md.tmpl',
  '.claude/agents/qa.md': 'templates/agents/qa.md.tmpl',
};

// ---------------------------------------------------------------------------
// Projections
// ---------------------------------------------------------------------------
/**
 * THE canonical text of a config for hashing. Every hash of a config-target operation - pre, staged,
 * and the one recovery recomputes - goes through this one function, so they cannot disagree.
 * `_aiwf.migrationJournal` is excluded: it is the only key that changes as a side effect of
 * journalling the very operation whose target is this file.
 */
export function projectionText(config) {
  const clone = JSON.parse(JSON.stringify(config));
  if (isPlainObject(clone._aiwf)) delete clone._aiwf.migrationJournal;
  return jsonText(orderConfig(clone));
}

export const configHash = (config) => sha256(projectionText(config));
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

function spliceRegion(text, region, replacement) {
  const begin = beginMarker(region);
  const end = endMarker(region);
  const from = text.indexOf(begin);
  const to = text.indexOf(end);
  if (from === -1 || to === -1 || to < from) {
    // The region is gone from a file that still exists. Appending is a DELIBERATE resolution here
    // (the operator chose take-new / merge on the missing-region conflict), never a silent repair.
    const joiner = text.endsWith('\n') ? '\n' : '\n\n';
    return text + joiner + replacement + '\n';
  }
  return text.slice(0, from) + replacement + text.slice(to + end.length);
}

// ---------------------------------------------------------------------------
// Atomic writes + crash injection
// ---------------------------------------------------------------------------
function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.pnp-tmp-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  fs.writeFileSync(tmp, lf(text), 'utf8');
  fs.renameSync(tmp, file); // rename replaces an existing file on both Windows and POSIX
}

// Inert unless PNP_UPDATE_CRASH_AT names exactly this boundary. Read fresh each time so a test can
// set it per child process; nothing else in the engine branches on it.
function crashPoint(migration, opIndex, boundary) {
  const spec = process.env.PNP_UPDATE_CRASH_AT;
  if (!spec) return;
  if (spec === `${migration}/${opIndex}/${boundary}`) {
    process.stderr.write(`pnp-update: PNP_UPDATE_CRASH_AT=${spec} - exiting 86 immediately after that write.\n`);
    process.exit(86);
  }
}

// ---------------------------------------------------------------------------
// Resolution records (the ONE production resolver, two adapters over it)
// ---------------------------------------------------------------------------
export const CONFLICT_RESOLUTIONS = ['take-new', 'keep-mine', 'merge'];

/**
 * Validates a resolution record and returns it. Anything unexpected STOPS the run naming the
 * address: an unknown kind, an unknown field, a missing conditional field, a record of the wrong
 * kind for this address. Nothing is ever guessed - a guessed resolution is a silent overwrite with
 * extra steps.
 */
export function checkResolutionRecord(record, expectedKind, address) {
  const where = `resolution for "${address}"`;
  if (!isPlainObject(record)) throw new UpdateError(`${where}: not an object.`);
  if (typeof record.kind !== 'string') throw new UpdateError(`${where}: missing the "kind" discriminator ("conflict" or "answer").`);
  if (record.kind !== 'conflict' && record.kind !== 'answer') {
    throw new UpdateError(`${where}: unknown kind "${record.kind}" - the vocabulary is "conflict" and "answer".`);
  }
  if (record.kind !== expectedKind) {
    throw new UpdateError(`${where}: this address needs a "${expectedKind}" record, but a "${record.kind}" record was supplied.`);
  }
  if (record.kind === 'conflict') {
    for (const key of Object.keys(record)) {
      if (!['kind', 'resolution', 'mergedFile'].includes(key)) throw new UpdateError(`${where}: unknown field "${key}".`);
    }
    if (!CONFLICT_RESOLUTIONS.includes(record.resolution)) {
      throw new UpdateError(`${where}: resolution must be one of ${CONFLICT_RESOLUTIONS.join(' | ')}, found ${JSON.stringify(record.resolution)}.`);
    }
    const isMerge = record.resolution === 'merge';
    if (isMerge && (typeof record.mergedFile !== 'string' || record.mergedFile.trim() === '')) {
      throw new UpdateError(`${where}: "merge" requires "mergedFile" - the path of the file you merged by hand.`);
    }
    if (!isMerge && own(record, 'mergedFile')) {
      throw new UpdateError(`${where}: "mergedFile" is only allowed with resolution "merge".`);
    }
    return record;
  }
  for (const key of Object.keys(record)) {
    if (!['kind', 'value'].includes(key)) throw new UpdateError(`${where}: unknown field "${key}".`);
  }
  if (!own(record, 'value')) throw new UpdateError(`${where}: an "answer" record must carry "value" (any JSON value, including null or false).`);
  return record;
}

/**
 * The scripted adapter: a JSON object mapping an address to a record. A missing entry STOPS the run
 * naming the address, so a scripted update can never proceed on a question nobody answered.
 */
export function resolutionFileAdapter(table, { label = 'the resolution file' } = {}) {
  if (!isPlainObject(table)) throw new UpdateStartError(`${label} must be a JSON object mapping "<migration>/<opIndex>/<key>" to a resolution record.`);
  return (address, expectedKind) => {
    if (!own(table, address)) {
      throw new UpdateError(
        `no resolution for "${address}" in ${label}. Add a ${expectedKind === 'answer'
          ? '{ "kind": "answer", "value": <json> }'
          : '{ "kind": "conflict", "resolution": "take-new" | "keep-mine" | "merge" }'} record and re-run - nothing is guessed.`,
      );
    }
    return checkResolutionRecord(table[address], expectedKind, address);
  };
}

/** The adapter that refuses to answer at all: dry-run previews and non-interactive runs with no file. */
export function stopAdapter(reason) {
  return (address, expectedKind) => {
    throw new UpdateError(`"${address}" needs ${expectedKind === 'answer' ? 'an answer' : 'a conflict resolution'} and ${reason}`);
  };
}

// ---------------------------------------------------------------------------
// Stage (durable, under the setup/update-owned tree - never under .aiwf/, which is the operator's)
// ---------------------------------------------------------------------------
const stageDir = (projectRoot, migration, opIndex) => path.join(projectRoot, ...STAGE_POSIX.split('/'), `${migration}-${opIndex}`);

function writeStage(projectRoot, migration, opIndex, meta, content) {
  const dir = stageDir(projectRoot, migration, opIndex);
  // A stage from an earlier attempt at the SAME operation is superseded, not merged: leaving its
  // `content` behind next to a new stage.json that has no content would hand recovery a result
  // nobody accepted.
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  if (content !== null && content !== undefined) fs.writeFileSync(path.join(dir, 'content'), lf(content), 'utf8');
  // stage.json LAST: its presence is what makes the stage complete and readable.
  writeAtomic(path.join(dir, 'stage.json'), jsonText(meta));
}

function readStage(projectRoot, migration, opIndex) {
  const dir = stageDir(projectRoot, migration, opIndex);
  const metaRaw = readText(path.join(dir, 'stage.json'));
  if (metaRaw === null) return null;
  let meta;
  try { meta = JSON.parse(metaRaw); } catch { return null; }
  const content = readText(path.join(dir, 'content'));
  return { meta, content };
}

function removeStage(projectRoot, migration, opIndex) {
  fs.rmSync(stageDir(projectRoot, migration, opIndex), { recursive: true, force: true });
}

/**
 * Removes the whole stage tree. Called ONLY where nothing can be in flight - after the final config
 * write (the journal has just been cleared) and on the "already current" path (where a journal is an
 * invariant violation, checked in preflight). Anything left under it there is debris from a run that
 * died between its last write and this cleanup, and the next run must not inherit it: the directory
 * is setup/update-owned, so nothing of the operator's can be in it.
 */
function removeStageRoot(projectRoot) {
  fs.rmSync(path.join(projectRoot, ...STAGE_POSIX.split('/')), { recursive: true, force: true });
}

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
  // copy of its shape here, which is exactly how the two engines would drift into different bytes.
  // `$schema` and `_aiwf` are stripped because setup renders from the answers, which never carry
  // them.
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
// The runner
// ---------------------------------------------------------------------------
/**
 * Reads the project config. A missing or unreadable config is NOT a migration failure - it means
 * the runner was pointed at something it must never initialise, so it is an exit-2 "cannot start".
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
  return { file, config };
}

const JOURNAL_FIELDS = ['migration', 'opIndex', 'state', 'target', 'preHash', 'postHash', 'resolution'];
export const JOURNAL_STATES = ['prepared', 'applied'];

function checkJournal(journal) {
  if (journal === null || journal === undefined) return null;
  if (!isPlainObject(journal)) throw new UpdateError('invariant violated: _aiwf.migrationJournal is neither null nor an object.');
  for (const key of Object.keys(journal)) {
    if (!JOURNAL_FIELDS.includes(key)) throw new UpdateError(`invariant violated: _aiwf.migrationJournal has an unknown field "${key}".`);
  }
  for (const key of JOURNAL_FIELDS) {
    if (!own(journal, key)) throw new UpdateError(`invariant violated: _aiwf.migrationJournal is missing "${key}".`);
  }
  if (typeof journal.migration !== 'string' || !Number.isInteger(journal.opIndex)) {
    throw new UpdateError('invariant violated: _aiwf.migrationJournal needs a migration id and an integer opIndex.');
  }
  // THE state vocabulary, as a named list rather than two literals in a condition: `prepared` and
  // `applied` are the two ends of every operation, creations included. A creation needs no state of
  // its own, because byte-identical content at its target IS this engine's own write - the artifact
  // lives in the plugin's own folder - so the hashes already say everything a resume has to know.
  if (!JOURNAL_STATES.includes(journal.state)) {
    throw new UpdateError(`invariant violated: _aiwf.migrationJournal state "${journal.state}" is not one of ${JOURNAL_STATES.map((s) => `"${s}"`).join(', ')}.`);
  }
  return journal;
}

/**
 * Everything that must hold BEFORE the first mutation. Each failure names the invariant it violated,
 * because "the update refused" is only actionable when the operator learns which rule said no.
 */
export function preflight({ pluginRoot, projectRoot }) {
  const payload = validatePayload(pluginRoot); // throws UpdateStartError-worthy PayloadError only when plugin.json is unreadable
  if (payload.errors.length) {
    throw new UpdateError(`the migration payload is not coherent, so nothing was applied:\n  - ${payload.errors.join('\n  - ')}`);
  }
  const { file: configFile, config } = loadProjectConfig(projectRoot);
  // The Claude pin rule, before anything else is judged and whatever the pending operations are: a
  // Claude review row whose exact id the ONE reviewer agent file does not carry would dispatch a
  // model other than the one it records, and no update carries a config like that forward. It lives
  // in ONE function that every writer of the config calls (scripts/setup/role-rules.mjs).
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
  if (!isPlainObject(bk.managedRegions)) {
    throw new UpdateError('invariant violated: _aiwf.managedRegions is not an object, so no managed artifact can be judged.');
  }
  // The downgrade check comes FIRST, ahead of the manifest lookup, because it is the same situation
  // seen from the operator's side: an older payload run against a newer project would otherwise be
  // reported as "lastMigrationApplied names a migration I have never heard of", which is true and
  // useless. (With every other invariant intact this branch is also the only way installed can
  // exceed the payload version, since the manifest's last entry equals that version and versions
  // only rise - so it stays as an explicit refusal rather than an assumption.)
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
  const journal = checkJournal(bk.migrationJournal ?? null);
  if (journal && !pending.some((e) => e.id === journal.migration)) {
    throw new UpdateError(
      `invariant violated: the journal names migration "${journal.migration}", which is not among the migrations still ` +
      'pending for this project. The bookkeeping was edited by hand or the payload changed under an interrupted run.',
    );
  }
  return { payload, configFile, config, pending, journal };
}

// ---------------------------------------------------------------------------
// Per-operation planning
// ---------------------------------------------------------------------------
/**
 * The address key of an operation - the `<key>` half of `<migration>/<opIndex>/<key>`. ONE
 * definition, used by the planner, by recovery and by every message that has to name an operation,
 * so a message can never describe an address the resolver would not recognise.
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

// A plan is what apply() executes. `mode` decides the projection used for hashing:
//   'file'     whole file        'region'  marked region        'settings' whole settings.json
//   'config'   config projection 'none'    nothing on disk changes (a note, or a held artifact)
//
// `staged` is the result an interrupted attempt at THIS operation already accepted (read back from
// its stage). It is passed only when recovery re-plans an operation, and it exists so that a
// question the operator has already answered is never asked a second time.
function planOperation(ctx, migration, opIndex, op, staged = null) {
  const address = (key) => `${migration}/${opIndex}/${key}`;
  switch (op.op) {
    case 'note':
      return {
        op, mode: 'none', target: null, key: op.id, preHash: null, postHash: null,
        content: null, resolution: null, bookkeeping: null, summary: `note ${op.id}`,
      };
    case 'add-config-key':
      return planAddConfigKey(ctx, op, address(op.path), staged);
    case 'rerender-managed-region':
      return planRerender(ctx, op, (key) => address(key));
    case 'reconcile-ask-ruleset':
      return planReconcile(ctx, op, address(SETTINGS_POSIX));
    default:
      // Unreachable: validate-payload rejects unknown op types before anything runs.
      throw new UpdateError(`unknown operation type "${op.op}".`);
  }
}

function planAddConfigKey(ctx, op, address, staged = null) {
  if (hasConfigPath(ctx.config, op.path)) {
    return {
      op, mode: 'none', target: null, key: op.path, preHash: null, postHash: null,
      content: null, resolution: null, bookkeeping: null,
      summary: `config key ${op.path} already present - left exactly as it is`,
    };
  }
  let value = op.default;
  if (op.askOperator === true) {
    // A STAGED answer is the operator's answer to this very question, already given. Re-planning
    // this operation against a config that moved while the update was down must re-check the
    // current state (the key may be there now, and the schema still gates the result) - but it must
    // not ask again. The resolver is consulted only when there is genuinely no staged answer.
    if (staged) {
      value = staged.value;
      ctx.log(`  ${op.path}: the answer you already gave was replayed from the stage (not asked again).`);
    } else {
      value = ctx.resolve(address, 'answer', { question: op.question, path: op.path, fallback: op.default }).value;
    }
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
    op, mode: 'config', target: CONFIG_POSIX, key: op.path,
    preHash: configHash(ctx.config), postHash: configHash(next),
    content: null, value, resolution: null, bookkeeping: null,
    summary: `config key ${op.path} = ${JSON.stringify(value)}`,
  };
}

function planRerender(ctx, op, addressOf) {
  const key = op.region ? `${op.file}#${op.region}` : op.file;
  const address = addressOf(key);
  const fileText = ctx.readProjected(op.file);
  const actual = op.region ? extractRegion(fileText, op.region) : fileText;
  const newRender = ctx.render(op.template);
  const previous = ctx.config._aiwf.managedRegions[key];

  if (!isPlainObject(previous)) {
    // `ifRecorded: true` says this artifact exists on SOME installations only - `.claude/agents/
    // reviewer.md` is rendered for a claude-hosted host and does not exist at all on a
    // codex-configured project. Skipping it is not a relaxation of the invariant below: there is
    // still no adoption, no write and no bookkeeping entry - the operation simply has no subject
    // here, and it says so. Without the field the throw stands, which is what makes the field a
    // deliberate statement by the migration author rather than a default.
    if (op.ifRecorded === true) {
      return {
        op, mode: 'none', target: null, key, preHash: null, postHash: null,
        content: null, resolution: null, bookkeeping: null,
        summary: `${key}: not on this installation (no record) - skipped`,
      };
    }
    // `createIfAbsent: true` is the opposite answer to the same state, for an artifact the payload
    // has only just started rendering: an installation older than it has no record, and the
    // migration is what puts the artifact there. It relaxes NOTHING about adoption. Nothing on disk
    // is the ordinary case - render, write, stamp. A file whose content IS the render is this
    // engine's own write (the artifact lives in the plugin's own folder), so the creation is planned
    // anyway and ends as a stamp with nothing written. A file that DIFFERS is content this engine
    // never wrote, and the run stops - the refusal says what to do with it.
    if (op.createIfAbsent === true) {
      // "a file is already standing there" is read off the FILE, never off the extracted region: for
      // a region artifact a null extraction ALSO means "the file is there and carries no markers",
      // and creating from the render in that state would splice into - or replace - a file this
      // engine did not write. The file is the honest subject of the question.
      if (fileText !== null && lf(fileText) !== lf(newRender)) throw new UpdateError(unrecordedFileRefusal(key));
      const createHash = sha256(newRender);
      return {
        // The region arm is unreachable: the validator refuses `createIfAbsent` on a region op.
        op, mode: op.region ? 'region' : 'file', target: op.file, key,
        // `created` marks this plan as a CREATION for every step that touches the target after
        // planning. It is not derivable from `preHash: null`: a take-new or merge that resolved a
        // conflict over a MISSING file carries a null preHash too, and that one has an operator
        // decision behind it, so the two must not share a refusal.
        created: true,
        preHash: null, postHash: createHash, content: newRender, resolution: null,
        bookkeeping: { managedRegions: { [key]: { upstream: createHash, local: createHash, override: false } } },
        summary: `${key}: created (no record, no file) - rendered and recorded`,
      };
    }
    throw new UpdateError(
      `invariant violated: "${key}" is not recorded in _aiwf.managedRegions, so this update has no idea what the project ` +
      'last accepted there. An update never adopts a file it did not write - that is /pnp:setup\'s '
      + 'business, and `--adopt` is the flag that bootstraps ownership over a surface already on disk.',
    );
  }

  const renderHash = sha256(newRender);
  const held = previous.override === true;
  const localEdit = actual === null || sha256(actual) !== previous.local;
  const upstreamChange = renderHash !== previous.upstream;

  // An operation that applies NOTHING still journals the artifact it is about to make an assertion
  // about, with preHash == postHash == the hash its bookkeeping will claim as `local`. Nothing is
  // written to the file in either branch, but recovery must be able to tell "the artifact is exactly
  // what the decision was taken on" from "it changed while the process was down" - and a journal
  // with a null target cannot tell those apart, so it would stamp a hash describing a file that no
  // longer looks like that.
  if (held && !localEdit) {
    // Held by the operator: never re-applied. The new render is RECORDED as upstream and the
    // artifact goes into CHANGES; the file itself is not touched in any branch.
    const identity = sha256(actual);
    return {
      op, mode: 'none', target: op.file, key, preHash: identity, postHash: identity,
      content: null, resolution: null,
      bookkeeping: { managedRegions: { [key]: { upstream: renderHash, local: previous.local, override: true } } },
      summary: `${key} is held by you (override) - the new render was recorded as upstream, not applied`,
    };
  }

  if (!held && !localEdit && !upstreamChange) {
    const identity = sha256(actual);
    return {
      op, mode: 'none', target: op.file, key, preHash: identity, postHash: identity,
      content: null, resolution: null, bookkeeping: null,
      summary: `${key} is already current (neither the project nor the payload changed it)`,
    };
  }

  if (!held && !localEdit && upstreamChange) {
    // The normal path of every migration: the payload moved and the operator never touched the
    // artifact, so there is nothing of theirs to lose and nothing to ask about. It goes through the
    // SAME applyResolution path an operator take-new goes through - identical journal, stage and
    // resume - with a synthetic record; only the summary differs, and it says why it was not asked.
    return applyResolution(ctx, {
      op, key, address, actual, newRender, renderHash,
      record: { resolution: 'take-new', auto: true },
    });
  }

  const record = ctx.resolve(address, 'conflict', {
    key,
    predicates: [localEdit ? (actual === null ? 'the file or region is GONE from the project' : 'you edited it') : null,
      upstreamChange ? 'the payload changed it' : null].filter(Boolean),
    held,
    actual,
    newRender,
  });
  return applyResolution(ctx, { op, key, address, actual, newRender, renderHash, record });
}

/**
 * Turns an accepted resolution into a plan. It overwrites only an artifact the operator has not
 * edited (the synthetic `record.auto` take-new planRerender builds for that case), and says so in
 * the summary; every other branch here rests on a decision the operator actually made.
 */
function applyResolution(ctx, { op, key, address, actual, newRender, renderHash, record }) {
  const mode = op.region ? 'region' : 'file';
  const preHash = actual === null ? null : sha256(actual);
  const base = { op, mode, target: op.file, key, preHash, resolution: record.resolution };

  if (record.resolution === 'keep-mine') {
    if (actual === null) {
      throw new UpdateError(
        `"${address}": keep-mine needs something to keep, and ${key} is not on disk. Resolve this one with take-new ` +
        '(write the payload version) or merge (supply the content you want).',
      );
    }
    // Nothing is applied, but the artifact IS journalled (preHash == postHash == the hash this
    // resolution records as `local`), so a resume can prove the file still looks the way it did when
    // the operator chose to keep it - see the note in planRerender.
    return {
      ...base, mode: 'none', postHash: preHash, content: null,
      bookkeeping: { managedRegions: { [key]: { upstream: renderHash, local: preHash, override: true } } },
      summary: `${key}: kept yours (nothing applied); the payload version was recorded as upstream`,
    };
  }

  let accepted = newRender;
  if (record.resolution === 'merge') {
    const mergedPath = path.isAbsolute(record.mergedFile) ? record.mergedFile : path.join(ctx.projectRoot, record.mergedFile);
    const merged = readText(mergedPath);
    if (merged === null) throw new UpdateError(`"${address}": the merged file "${record.mergedFile}" cannot be read.`);
    if (op.region && extractRegion(merged, op.region) === null) {
      throw new UpdateError(
        `"${address}": the merged file "${record.mergedFile}" carries no ${beginMarker(op.region)} / ${endMarker(op.region)} ` +
        'markers, so there is no region to install.',
      );
    }
    accepted = op.region ? extractRegion(merged, op.region) : merged;
  }
  const acceptedHash = sha256(accepted);
  const isMerge = record.resolution === 'merge';
  return {
    ...base,
    postHash: acceptedHash,
    content: accepted,
    bookkeeping: {
      managedRegions: {
        [key]: isMerge
          ? { upstream: renderHash, local: acceptedHash, override: true }
          : { upstream: renderHash, local: acceptedHash, override: false },
      },
    },
    summary: isMerge
      ? `${key}: your merged content applied (upstream recorded, held)`
      : record.auto === true
        ? `${key}: the payload version applied (you had not edited it)`
        : `${key}: the payload version applied`,
  };
}

function planReconcile(ctx, op, address) {
  const raw = ctx.readProjected(SETTINGS_POSIX);
  if (raw === null) {
    throw new UpdateError(
      `${SETTINGS_POSIX} is GONE from the project. A deletion is a manual edit, and an update never recreates one - ` +
      're-run /pnp:setup if you want the ask ruleset installed again.',
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

  const rulesetRaw = readText(path.join(ctx.pluginRoot, ...op.ruleset.split('/')));
  if (rulesetRaw === null) throw new UpdateError(`the payload ruleset "${op.ruleset}" is missing.`);
  let ruleset;
  try { ruleset = JSON.parse(rulesetRaw); } catch (e) { throw new UpdateError(`the payload ruleset "${op.ruleset}" is not valid JSON (${e.message}).`); }
  const declared = (isPlainObject(ruleset.permissions) && Array.isArray(ruleset.permissions.ask)) ? ruleset.permissions.ask : null;
  if (!declared) throw new UpdateError(`the payload ruleset "${op.ruleset}" declares no permissions.ask list.`);
  const desired = declared.map((rule) => rule.split('<projectRoot>').join(ctx.projectRoot));

  const bk = ctx.config._aiwf;
  const plan = planAskRules({
    desired,
    actual: Array.isArray(permissions.ask) ? permissions.ask : [],
    owned: Array.isArray(bk.ownedAskRules) ? bk.ownedAskRules : [],
    suppressed: Array.isArray(bk.suppressedAskRules) ? bk.suppressedAskRules : [],
  });
  // to-remove = owned n (old desired - new desired) is computed INSIDE planAskRules (see its
  // header): `owned` is by construction a subset of the OLD desired set, so owned n (old - new) ==
  // owned - new, computable without the previous payload's ruleset. It used to be recomputed here,
  // which is how setup and update came to disagree about a stale `<projectRoot>` render; the
  // formula now has one home and this function only reports what it decided.
  const { toRemove, ask, owned } = plan;

  const next = { ...settings, permissions: { ...permissions, ask } };
  const content = jsonText(next);
  const preHash = sha256(raw);
  const postHash = sha256(content);
  const parts = [];
  if (plan.toAdd.length) parts.push(`+${plan.toAdd.length}`);
  if (toRemove.length) parts.push(`-${toRemove.length} (owned, no longer desired)`);
  if (plan.newlyTombstoned.length) parts.push(`${plan.newlyTombstoned.length} tombstoned`);
  // The one thing the reconcile does NOT do, said out loud. A payload rule the project already
  // carries in the payload's own spelling but never had inserted by this engine is left alone
  // forever - correct, and invisible in a diff that has no lines for it, which is how an operator
  // comes to believe those rules are maintained for them. It is appended AFTER the parenthesis
  // rather than mixed into the change parts, so "nothing to change" stays the honest first half.
  const foreignNote = plan.presentForeign.length
    ? `; ${plan.presentForeign.length} payload rule(s) present but not owned here - hand-edited, the engine will never touch them`
    : '';
  return {
    op, mode: 'settings', target: SETTINGS_POSIX, key: SETTINGS_POSIX,
    preHash, postHash, content, resolution: null,
    bookkeeping: { ownedAskRules: owned, suppressedAskRules: plan.suppressed },
    summary: `ask ruleset reconciled: ${parts.length ? parts.join(', ') : 'nothing to change'} (foreign rules untouched)${foreignNote}`,
  };
}

// ---------------------------------------------------------------------------
// Applying one planned operation
// ---------------------------------------------------------------------------
function stageMetaOf(migration, opIndex, plan) {
  return {
    migration, opIndex, op: plan.op.op, mode: plan.mode, key: plan.key, target: plan.target,
    region: plan.op.region ?? null, resolution: plan.resolution ?? null,
    // `created` TRAVELS. A replay rebuilds the plan from this record, and a rebuilt plan without the
    // flag would take the ordinary write path - `writeAtomic`, which clobbers - for an artifact this
    // engine is bringing into existence. The flag is what routes the write to the no-clobber
    // publish, so it has to survive the crash that makes a replay necessary.
    created: plan.created === true,
    preHash: plan.preHash, postHash: plan.postHash,
    bookkeeping: plan.bookkeeping ?? null,
    value: plan.mode === 'config' ? { value: plan.value } : null,
  };
}

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
 * The FULL text this plan would put in its target file - the one place that knows how a region is
 * spliced back into the file around it. Both the writer and the dry-run preview go through it, so a
 * preview cannot claim one thing while the apply does another.
 */
function projectedFileContent(ctx, plan) {
  if (plan.mode !== 'region') return plan.content;
  // A missing FILE in region mode is only reachable through a conflict the operator resolved with
  // take-new or merge, so the accepted region becomes the whole file: it is the honest
  // reconstruction of a file that is not there, and it is never a silent one.
  const fileText = ctx.readProjected(plan.target);
  return fileText === null ? `${plan.content}\n` : spliceRegion(fileText, plan.op.region, plan.content);
}

/** Writes the operation's TARGET, file-atomically. Returns true when a byte really changed. */
function applyTarget(ctx, plan) {
  if (plan.mode === 'none') return false;
  if (plan.mode === 'config') {
    setConfigPath(ctx.config, plan.op.path, plan.value);
    writeConfig(ctx);
    return true;
  }
  const abs = path.join(ctx.projectRoot, ...plan.target.split('/'));
  const next = projectedFileContent(ctx, plan);
  // A CREATION does not take `writeAtomic` at all: its rename replaces whatever is at the target,
  // which is right for an artifact this engine owns and wrong for one it is bringing into
  // existence. The three cases are decided HERE, in the last instruction before the write, and the
  // equality test comes first because `link` cannot tell "identical, ours" from "different,
  // somebody else's" - both are EEXIST to it.
  if (plan.created === true) {
    const standing = readText(abs);
    if (standing === null) { writeCreatedTarget(abs, next, plan.key); return true; }
    // Identical bytes are this engine's own write - the folder is the plugin's - so there is
    // nothing to write and nothing to ask about; the bookkeeping flip stamps it.
    if (lf(standing) === lf(next)) return false;
    throw new UpdateError(unrecordedFileRefusal(plan.key));
  }
  const current = readText(abs);
  if (current !== null && lf(current) === lf(next)) return false; // identical bytes: do not touch the file
  writeAtomic(abs, next);
  return true;
}

/**
 * Hashes the plan's target AS IT IS ON DISK RIGHT NOW, with the projection that plan implies. Used
 * for the re-check below, so it deliberately re-reads the config from disk rather than hashing the
 * in-memory copy: the point is to catch a change this process did not make.
 */
function hashPlanTargetOnDisk(ctx, plan) {
  if (!plan.target) return null;
  if (plan.mode === 'config') {
    const raw = readText(ctx.configFile);
    if (raw === null) return null;
    try { return configHash(JSON.parse(raw)); } catch { return null; }
  }
  const text = readText(path.join(ctx.projectRoot, ...plan.target.split('/')));
  if (plan.op.op === 'rerender-managed-region' && plan.op.region) {
    const region = extractRegion(text, plan.op.region);
    return region === null ? null : sha256(region);
  }
  return text === null ? null : sha256(text);
}

function applyOperation(ctx, migration, opIndex, plan) {
  // 0. The state was READ when this operation was planned, and the resolver may have taken any
  // amount of time to answer - an interactive dialog can sit open for an hour. So the target is
  // re-hashed here, in the last instruction before the first write, and an operation planned against
  // a state that no longer exists is refused rather than applied to a file it never saw. Zero writes
  // for this operation; everything before it stays applied and journalled.
  // 0a. A CREATION is judged on its own terms, and BEFORE the generic re-check. That check asks only
  // "did the target move", and for a creation every answer other than "still absent" would be
  // reported as a state change - true, but the wrong sentence: the real question is whether somebody
  // else's file is now standing at that path. This is the last read before the first write, so it is
  // where the window between planning and writing NARROWS - it is closed by the no-clobber publish
  // in `applyTarget`, not here. The generic check must not run for a creation: it would report a
  // state change where this one names the situation.
  if (plan.created === true && plan.target) {
    assertNoForeignFileAtCreationTarget(
      path.join(ctx.projectRoot, ...plan.target.split('/')), projectedFileContent(ctx, plan), plan.key,
    );
  }
  const nowHash = hashPlanTargetOnDisk(ctx, plan);
  if (plan.target && plan.created !== true && nowHash !== plan.preHash) {
    throw new UpdateError(
      `"${migration}/${opIndex}/${plan.key}": ${plan.target} changed while the update was deciding what to do with it, ` +
      'so the decision was taken against a state that no longer exists. Nothing was applied - re-run the update and it ' +
      'will re-plan this operation against the file as it is now.',
    );
  }

  // 1. stage the ACCEPTED result first, so a restart replays it without asking again
  writeStage(ctx.projectRoot, migration, opIndex, stageMetaOf(migration, opIndex, plan), plan.content);

  // 2. the write-ahead journal, atomically, with the hashes of the staged result.
  // `target` is null only for an operation that has NO artifact to be right or wrong about (a note,
  // a config key that is already present). An operation that applies nothing but asserts something
  // about an artifact still records it - see the note in planRerender.
  ctx.config._aiwf.migrationJournal = {
    migration, opIndex, state: 'prepared', target: plan.target,
    preHash: plan.preHash, postHash: plan.postHash, resolution: plan.resolution ?? null,
  };
  writeConfig(ctx);
  crashPoint(migration, opIndex, 'after-journal-prepared');

  // 3. the target itself
  applyTarget(ctx, plan);
  crashPoint(migration, opIndex, 'after-target-apply');

  // 4. ONE atomic config write: the journal flips to applied together with this op's bookkeeping
  ctx.config._aiwf.migrationJournal.state = 'applied';
  mergeBookkeeping(ctx.config, plan.bookkeeping);
  writeConfig(ctx);
  crashPoint(migration, opIndex, 'after-applied-flip');

  // 5. the stage has served its purpose
  removeStage(ctx.projectRoot, migration, opIndex);
}

// ---------------------------------------------------------------------------
// Recovery
// ---------------------------------------------------------------------------
/** Hashes the operation's target with the projection that operation's mode implies. */
function hashTarget(ctx, op, target) {
  if (target === null) return null;
  if (op.op === 'add-config-key') return configHash(ctx.config);
  const abs = path.join(ctx.projectRoot, ...target.split('/'));
  const text = readText(abs);
  if (op.op === 'rerender-managed-region' && op.region) {
    const region = extractRegion(text, op.region);
    return region === null ? null : sha256(region);
  }
  return text === null ? null : sha256(text);
}

/**
 * Finishes an operation whose target already carries the staged result: the journal flips to
 * `applied` together with the bookkeeping the stage recorded.
 *
 * A MISSING stage is tolerated here (the target already matches postHash, so nothing is at risk in
 * the file), and the bookkeeping is then recomputed as far as it is derivable:
 *   - a re-rendered artifact: fully derivable (local = the content on disk, upstream = a fresh
 *     render, override = whether the recorded resolution held the file);
 *   - a reconciled ask ruleset: NOT derivable, because "which rules did we insert" cannot be read
 *     off the post-state without claiming ownership of rules that were already there. The safe
 *     direction is to claim nothing new, and to say so out loud.
 */
function flipWithoutStage(ctx, migration, opIndex, op, journal) {
  const stage = readStage(ctx.projectRoot, migration, opIndex);
  if (stage && stage.meta && stage.meta.bookkeeping !== undefined) return stage.meta.bookkeeping;
  if (op.op === 'rerender-managed-region') {
    const key = op.region ? `${op.file}#${op.region}` : op.file;
    const previous = ctx.config._aiwf.managedRegions[key] || {};
    // AN `ifRecorded` OPERATION WITH NO RECORD WAS SKIPPED, AND IT STAYS SKIPPED - decided HERE,
    // before anything on disk is read, and NOT on whether a file happens to exist at that path.
    // Reading first was a silent adoption: on an installation that renders no artifact there, a
    // FOREIGN file someone else put at that path would be hashed into a fresh `local`/`upstream`
    // pair with `override: false`, i.e. the update would take ownership of a file it never wrote -
    // the one thing this engine promises it never does - and the next payload change would then
    // overwrite it without a dialog. "No record" is the whole answer: no read, no adoption, no
    // bookkeeping, whatever is or is not on disk.
    if (op.ifRecorded === true && !isPlainObject(ctx.config._aiwf.managedRegions[key])) return null;
    // A `createIfAbsent` OPERATION WITH NO RECORD IS DELIBERATELY *NOT* EARLY-RETURNED HERE, and the
    // reason is the mirror image of the paragraph above: that operation's whole point is that a
    // record must EXIST when it is done, so returning null would leave an artifact this engine
    // rendered and then refused to own - the next payload change would meet it unrecorded and
    // abort. Reconstructing it from disk is safe because of WHO may arrive here: a creation reaches
    // this function only through the journal-state rule in `recover`, i.e. only when the journal
    // says our own write succeeded AND the bytes on disk are the ones it recorded. A file this
    // engine did not write is refused there and never gets this far, so the generic reconstruction
    // below is already the consistent form for the field.
    // The artifact is hashed from the OPERATION rather than from journal.target: the operation is
    // the authority on which file and which region this record is about, and this path is reached
    // exactly when the journal's own account of it (the stage) is missing.
    const abs = path.join(ctx.projectRoot, ...op.file.split('/'));
    const text = readText(abs);
    const artifact = op.region ? extractRegion(text, op.region) : text;
    if (artifact === null) {
      throw new UpdateError(
        `the staged bookkeeping for ${migration}/${opIndex} was lost and "${key}" is not on disk either, so its record ` +
        'cannot be reconstructed. Nothing was written; inspect the artifact and re-run.',
      );
    }
    // override follows the RECORDED resolution; with no resolution (a held artifact, or an operation
    // that had nothing to do) the operator's existing hold is preserved rather than quietly dropped.
    const override = journal.resolution === 'keep-mine' || journal.resolution === 'merge'
      ? true
      : (journal.resolution === 'take-new' ? false : previous.override === true);
    const upstream = sha256(ctx.render(op.template));
    ctx.warn(`the staged bookkeeping for ${migration}/${opIndex} was lost; "${key}" was restamped from what is on disk.`);
    return { managedRegions: { [key]: { upstream, local: sha256(artifact), override } } };
  }
  if (op.op === 'reconcile-ask-ruleset') {
    const bk = ctx.config._aiwf;
    const settings = (() => { try { return JSON.parse(readText(path.join(ctx.projectRoot, ...SETTINGS_POSIX.split('/'))) || 'null'); } catch { return null; } })();
    const ask = (isPlainObject(settings) && isPlainObject(settings.permissions) && Array.isArray(settings.permissions.ask)) ? settings.permissions.ask : [];
    const owned = (Array.isArray(bk.ownedAskRules) ? bk.ownedAskRules : []).filter((rule) => ask.includes(rule));
    ctx.warn(
      `the staged ownership delta for ${migration}/${opIndex} was lost. The reconciled rules were applied to ` +
      `${SETTINGS_POSIX}, but the ones this update inserted were NOT claimed as owned (claiming what cannot be proven ` +
      'would take over rules the project already had). Re-run /pnp:setup to restore ownership.',
    );
    return { ownedAskRules: owned, suppressedAskRules: Array.isArray(bk.suppressedAskRules) ? bk.suppressedAskRules : [] };
  }
  return null;
}

/**
 * Decides where an interrupted run continues. Returns { migrationIndex, opIndex } - the FIRST
 * operation that still has to run.
 */
function recover(ctx, pending) {
  const journal = ctx.config._aiwf.migrationJournal;
  const migrationIndex = pending.findIndex((e) => e.id === journal.migration);
  const migration = journal.migration;
  const ops = ctx.payload.migrations.get(migration).operations;
  const opIndex = journal.opIndex;
  if (opIndex < 0 || opIndex >= ops.length) {
    throw new UpdateError(`invariant violated: the journal points at operation ${opIndex} of "${migration}", which has ${ops.length} operation(s).`);
  }
  const op = ops[opIndex];

  if (journal.state === 'applied') {
    ctx.log(`resuming: ${migration} operation ${opIndex} was already applied.`);
    removeStage(ctx.projectRoot, migration, opIndex); // idempotent
    return { migrationIndex, opIndex: opIndex + 1 };
  }

  // state === 'prepared'

  // AN INTERRUPTED CREATION, decided before any hash branch and in three ways only. Identical bytes
  // at the target are THIS ENGINE'S OWN WRITE: the artifact lives in the plugin's own folder, so a
  // file there with exactly the render's content came from a run of ours, and the postHash branch
  // below stamps it. A DIFFERING file is content this engine never wrote, and the conflict
  // vocabulary is wrong for it in both directions - keep-mine would adopt it, take-new would
  // overwrite it - so it is refused here instead. Nothing on disk is nothing to decide: that falls
  // through to the ordinary resume, which replays the stage or re-plans and writes no-clobber.
  const creationKey = op.op === 'rerender-managed-region' && op.createIfAbsent === true
    ? operationKey(op, journal.target) : null;
  if (creationKey !== null && !isPlainObject(ctx.config._aiwf.managedRegions[creationKey])) {
    const standing = readText(path.join(ctx.projectRoot, ...op.file.split('/')));
    if (standing !== null && sha256(standing) !== journal.postHash) {
      throw new UpdateError(unrecordedFileRefusal(creationKey));
    }
  }

  if (journal.target === null) {
    // Nothing on disk to compare (a note, or a held artifact): finishing it is a bookkeeping write.
    const bookkeeping = flipWithoutStage(ctx, migration, opIndex, op, journal);
    ctx.config._aiwf.migrationJournal.state = 'applied';
    mergeBookkeeping(ctx.config, bookkeeping);
    writeConfig(ctx);
    removeStage(ctx.projectRoot, migration, opIndex);
    ctx.log(`resuming: ${migration} operation ${opIndex} touched no file; its bookkeeping was completed.`);
    return { migrationIndex, opIndex: opIndex + 1 };
  }

  const actualHash = hashTarget(ctx, op, journal.target);
  if (actualHash !== null && actualHash === journal.postHash) {
    const bookkeeping = flipWithoutStage(ctx, migration, opIndex, op, journal);
    ctx.config._aiwf.migrationJournal.state = 'applied';
    mergeBookkeeping(ctx.config, bookkeeping);
    writeConfig(ctx);
    removeStage(ctx.projectRoot, migration, opIndex);
    ctx.log(`resuming: ${migration} operation ${opIndex} had already reached its target; it was marked applied.`);
    return { migrationIndex, opIndex: opIndex + 1 };
  }

  if (actualHash === journal.preHash) {
    const stage = readStage(ctx.projectRoot, migration, opIndex);
    if (stage && stage.meta) {
      // Replay the EXACT accepted result - including a manual merge and an operator's answer.
      const plan = {
        op, mode: stage.meta.mode, target: stage.meta.target, key: stage.meta.key,
        // Rebuilt from the STAGE where the stage says so, and from the OPERATION otherwise: a stage
        // written by an older payload carries no `created` field, and for a `createIfAbsent` op on a
        // key this installation still has no record of, the answer is the same one planning would
        // give. Without it the replayed write would clobber.
        created: stage.meta.created === true
          || (op.op === 'rerender-managed-region' && op.createIfAbsent === true
            && !isPlainObject(ctx.config._aiwf.managedRegions[stage.meta.key])),
        preHash: stage.meta.preHash, postHash: stage.meta.postHash,
        content: stage.content, value: stage.meta.value ? stage.meta.value.value : undefined,
        resolution: stage.meta.resolution, bookkeeping: stage.meta.bookkeeping,
        summary: `${stage.meta.key}: replayed from the stage`,
      };
      ctx.log(`resuming: ${migration} operation ${opIndex} is replayed from its stage (no question is asked twice).`);
      applyOperation(ctx, migration, opIndex, plan);
      ctx.applied.push({ migration, opIndex, summary: plan.summary, op });
      return { migrationIndex, opIndex: opIndex + 1 };
    }
    ctx.log(`resuming: ${migration} operation ${opIndex} never reached its target and its stage is gone; it is planned again.`);
    return { migrationIndex, opIndex };
  }

  // Neither hash: the target moved under an interrupted run. That is EXACTLY a conflict, so it is
  // resolved through the same dialog every other conflict goes through - a recovery that could only
  // throw would be a state the machine can enter and never leave.
  // A CREATION never reaches this branch: the three-way rule above has already decided it - stamped
  // (its own bytes), refused (a differing file), or fallen through with nothing on disk, which
  // matches a creation's null preHash and is handled by the replay branch. That is deliberate, not
  // incidental: the conflict vocabulary is wrong for a creation in both directions - keep-mine would
  // ADOPT a file this engine never wrote, take-new would OVERWRITE it.
  const key = operationKey(op, journal.target);
  const address = `${migration}/${opIndex}/${key}`;
  // The interrupted attempt's stage is NOT cleared here: if this dialog goes unanswered the run is
  // blocked, and a blocked run writes nothing at all. It is superseded the moment a decision is
  // taken - writeStage replaces the whole stage directory before the new one is journalled.

  if (op.op === 'rerender-managed-region') {
    const fileText = ctx.readProjected(op.file);
    const actual = op.region ? extractRegion(fileText, op.region) : fileText;
    const newRender = ctx.render(op.template);
    const previous = ctx.config._aiwf.managedRegions[key] || {};
    const record = ctx.resolve(address, 'conflict', {
      key,
      predicates: ['it changed while the update was down, so it matches neither the state the interrupted operation started from nor the result it staged'],
      held: previous.override === true,
      actual,
      newRender,
    });
    const plan = applyResolution(ctx, { op, key, address, actual, newRender, renderHash: sha256(newRender), record });
    applyOperation(ctx, migration, opIndex, plan);
    ctx.applied.push({ migration, opIndex, summary: plan.summary, op });
    ctx.log(`resuming: ${migration} operation ${opIndex} was re-decided against the file as it is now.`);
    return { migrationIndex, opIndex: opIndex + 1 };
  }

  // add-config-key and reconcile-ask-ruleset have no conflict vocabulary of their own: neither ever
  // overwrites an existing value or a foreign rule, so the faithful answer to "the target moved" is
  // to plan them again from the state that is really there. The main loop does that on return.
  //
  // What the re-plan must NOT do is ask again. An interrupted add-config-key with askOperator has
  // the operator's answer in its stage, and re-planning is a state question ("is the key there
  // now?"), never a fresh question to the operator - so the staged answer travels with the resume.
  const stage = readStage(ctx.projectRoot, migration, opIndex);
  const staged = (stage && stage.meta && stage.meta.value) ? stage.meta.value : null;
  ctx.log(
    `resuming: ${migration} operation ${opIndex} (${op.op}) found ${journal.target} changed while the update was down; ` +
    `it is planned again against the current state${staged ? ', replaying the answer you already gave' : ''} ` +
    '(this operation never overwrites what it finds).',
  );
  return { migrationIndex, opIndex, staged };
}

// ---------------------------------------------------------------------------
// CHANGES report
// ---------------------------------------------------------------------------
/**
 * The rules the reconcile deliberately did not touch, measured for the report.
 *
 * Measured from the FINAL state - the settings file as it now is plus the final bookkeeping - and
 * NOT collected while the operations ran, for the same reason `assembleChanges` is: a run that was
 * interrupted and resumed in a second process has no in-memory record of the operations the first
 * one applied, and a report built from such an accumulator would silently lose exactly the rules it
 * exists to name. The set is invariant across the reconcile (see `planAskRules`' header), so
 * measuring it afterwards is the same answer, available in every process.
 *
 * Returns a Map keyed by the ruleset ref, so two migrations reconciling the same ruleset in one run
 * report one measurement - which is what the final state is.
 */
function measureForeignAskRules(ctx, pending) {
  const out = new Map();
  for (const entry of pending) {
    const ops = (ctx.payload.migrations.get(entry.id) || { operations: [] }).operations;
    for (const op of ops) {
      if (op.op !== 'reconcile-ask-ruleset' || out.has(op.ruleset)) continue;
      // Anything unreadable here is reported, never swallowed: the operation itself has already
      // read both of these successfully, so a failure at report time is news, and a missing line
      // would read as "no foreign rules" - the one wrong answer.
      const rulesetRaw = readText(path.join(ctx.pluginRoot, ...op.ruleset.split('/')));
      const settingsRaw = ctx.readProjected(SETTINGS_POSIX);
      let desired = null;
      let actual = null;
      try {
        const ruleset = rulesetRaw === null ? null : JSON.parse(rulesetRaw);
        if (isPlainObject(ruleset) && isPlainObject(ruleset.permissions) && Array.isArray(ruleset.permissions.ask)) {
          desired = ruleset.permissions.ask.map((rule) => rule.split('<projectRoot>').join(ctx.projectRoot));
        }
        const settings = settingsRaw === null ? null : JSON.parse(settingsRaw);
        if (isPlainObject(settings) && isPlainObject(settings.permissions) && Array.isArray(settings.permissions.ask)) {
          actual = settings.permissions.ask;
        }
      } catch { /* handled by the null checks below */ }
      if (desired === null || actual === null) {
        ctx.warn(
          `the ask ruleset "${op.ruleset}" could not be re-read against ${SETTINGS_POSIX} after it was applied, so the ` +
          'report names no rules as "present but not owned" for it. Run /pnp:selfcheck to inspect the settings file.',
        );
        continue;
      }
      const bk = ctx.config._aiwf;
      const { presentForeign } = planAskRules({
        desired,
        actual,
        owned: Array.isArray(bk.ownedAskRules) ? bk.ownedAskRules : [],
        suppressed: Array.isArray(bk.suppressedAskRules) ? bk.suppressedAskRules : [],
      });
      out.set(op.ruleset, presentForeign);
    }
  }
  return out;
}

/**
 * Assembled from the pending operations and the FINAL bookkeeping - never from an accumulator built
 * during the run. That is what makes it identical whether the run completed in one process or in
 * three after two crashes. `foreignAskRules` obeys the same rule: it is measured from the final
 * state by `measureForeignAskRules` above, not accumulated by the operations that ran.
 *
 * `createdOps` is the ONE input that cannot obey that rule, and it is worth saying why rather than
 * pretending otherwise. It names the OPERATIONS - `<migrationId>/<opIndex>`, never bare artifact
 * keys - that really created an artifact in this run: the first pending `createIfAbsent` op on a key
 * that had no bookkeeping record when the process started. The identity is per-operation because a
 * run can carry several migrations: with the key alone, a LATER migration re-rendering the same
 * artifact in the same run would print "created" too, and only one of those operations created
 * anything. The fact itself - "there was no record before" - is destroyed by the act of creating the
 * record, so no reading of the final state can recover it and no derivation exists that a resumed
 * process could repeat. The caller takes it as a snapshot of the pre-run bookkeeping (not as an
 * accumulator built by the operations), and the cost is bounded to ONE label on ONE line: after a
 * crash between the creation and this report, that operation prints as `payload-current`, which is
 * less specific and still true - the payload version is what is on disk. Every other line, and
 * everything else in this report, stays derived from the final state. The alternative - a `created`
 * flag written into the operator's durable bookkeeping - would pay for a one-line label with a
 * permanent field in a record that describes content, not history.
 */
export function assembleChanges({ from, to, pending, migrations, managedRegions, foreignAskRules = new Map(), createdOps = new Set() }) {
  const notes = [];
  const held = [];
  // The managed-artifact renders this run really carried. A `rerender-managed-region` whose key has
  // no bookkeeping record was SKIPPED (`ifRecorded: true` on an artifact this installation never
  // had), so it is not one of them - and a note-only migration has none at all. Measured from the
  // FINAL bookkeeping like everything else here, never from an accumulator built during the run.
  const renders = [];
  for (const entry of pending) {
    const ops = (migrations.get(entry.id) || { operations: [] }).operations;
    for (const op of ops) {
      if (op.op === 'note') notes.push(op);
      if (op.op === 'rerender-managed-region') {
        const key = op.region ? `${op.file}#${op.region}` : op.file;
        const record = managedRegions[key];
        if (record) renders.push(key);
        if (record && record.override === true && record.upstream !== record.local) held.push(key);
      }
    }
  }

  const lines = [];
  lines.push(`# What changed: ${from} -> ${to}`, '');
  lines.push('This report is generated by `/pnp:update`. It is a one-off note to you, not tracked bookkeeping:');
  lines.push('each update writes its own version-named report; keeping or deleting them is your call, nothing reads them back.', '');
  // The dialog legend belongs to a run that actually rendered a managed artifact. Printed
  // unconditionally it told the reader of a note-only release that something of theirs "was applied
  // without a dialog" when nothing of theirs had been applied at all - a sentence that is false in
  // exactly the releases that touch nothing, which is when a consumer most needs to trust it. The
  // wording for a run that DOES render is unchanged.
  if (renders.length) {
    lines.push(
      'An unheld artifact you had not edited, whose payload render changed, was applied without a dialog; '
      + 'edited ones were asked about; held ones were recorded, not applied.',
      '',
    );
  }

  if (notes.length) {
    lines.push('## Review these sections', '');
    for (const note of notes) {
      lines.push(`- **${note.id}** - ${note.text}`);
      for (const ref of note.docRefs || []) lines.push(`  - ${ref}`);
      // What this release RETIRES, one id per line. It applies nothing - no record of the operator's
      // is touched by a note - so the only way an installation loses a superseded rule is by reading
      // this list and acting on it. Printed under the note it belongs to, never aggregated, because
      // the text above is what explains why the id is here at all.
      for (const id of note.supersedes || []) lines.push(`  - Supersedes: ${id}`);
    }
    lines.push('');
  }

  if (held.length) {
    lines.push('## Held by you (override) - the payload version changed and was NOT applied', '');
    for (const key of held) {
      lines.push(`- \`${key}\` - you keep your own version. The new payload render was recorded as upstream only.`);
      lines.push(`  Reopen the choice any time with \`/pnp:update --resolve ${key}\`.`);
    }
    lines.push('');
  }

  lines.push('## Applied', '');
  for (const entry of pending) {
    const ops = (migrations.get(entry.id) || { operations: [] }).operations;
    lines.push(`### ${entry.id} (-> ${entry.targetPluginVersion})`, '');
    if (ops.length === 0) lines.push('- no operations (a version bump with nothing to migrate)');
    for (const [opIndex, op] of ops.entries()) {
      if (op.op === 'add-config-key') lines.push(`- \`add-config-key\` ${op.path}`);
      else if (op.op === 'rerender-managed-region') {
        // The label is the artifact's FINAL state, read from the bookkeeping and nowhere else, so it
        // is the same whether the run took one process or three. Bookkeeping distinguishes exactly
        // two outcomes: `override:false` (the payload version is what is on disk - an auto take-new,
        // an operator take-new and an "already current" artifact all end there) and `override:true`
        // (the operator's own content stands - keep-mine and merge alike). The third label is the
        // created one, and it is the single thing here the final bookkeeping cannot tell apart -
        // see `createdOps` in the doc comment above, degradation included. It is matched on THIS
        // operation's identity, so a later migration re-rendering the same artifact in the same run
        // gets the ordinary label: only one operation created anything.
        const key = op.region ? `${op.file}#${op.region}` : op.file;
        const record = managedRegions[key];
        const label = !isPlainObject(record)
          ? (op.ifRecorded === true ? 'not on this installation - skipped' : null)
          : createdOps.has(`${entry.id}/${opIndex}`) ? 'created (no record, no file)'
            : record.override === true ? 'held (your version kept)' : 'payload-current';
        lines.push(`- \`rerender-managed-region\` ${key}${label ? ` - ${label}` : ''}`);
      }
      else if (op.op === 'reconcile-ask-ruleset') {
        lines.push(`- \`reconcile-ask-ruleset\` ${op.ruleset}`);
        // BY NAME, because a count alone sends the operator hunting through a 100-rule list for
        // rules that are indistinguishable from the maintained ones by looking at them.
        const foreign = foreignAskRules.get(op.ruleset) || [];
        if (foreign.length) {
          lines.push(`  - ${foreign.length} payload rule(s) present but not owned here - hand-edited, the engine will never touch them:`);
          for (const rule of foreign) lines.push(`    - \`${rule}\``);
        }
      }
      else lines.push(`- \`note\` ${op.id}`);
    }
    lines.push('');
  }
  lines.push('Nothing here was committed: the diff is yours to review and commit as usual.', '');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// The three modes
// ---------------------------------------------------------------------------
function makeContext({ pluginRoot, projectRoot, payload, configFile, config, resolve, log, warn }) {
  const ctx = {
    pluginRoot, projectRoot, payload, configFile, config, resolve,
    schema: loadSchema(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json')),
    applied: [], notes: [], log, warn,
    // The dry-run overlay: project-relative path -> the content the previewed operations would have
    // left there. null in apply mode, where every read goes straight to disk.
    overlay: null,
  };
  // The render context is built PER RENDER, never cached: an earlier operation in the same run may
  // have added a config key, and a template rendered against a snapshot taken before it would
  // produce content that disagrees with the config now on disk.
  ctx.render = (ref) => renderRef(pluginRoot, ref, renderContext(projectRoot, ctx.config));
  // EVERY planning read of a project file goes through this. In apply mode it is the disk; in a
  // dry run it is the disk PLUS what the operations previewed so far would have written - so a
  // migration that touches the same artifact twice previews the second operation against the first
  // one's result, exactly as the apply will see it, instead of re-reading the untouched file and
  // reporting a conflict that will not happen.
  ctx.readProjected = (rel) => {
    if (ctx.overlay && ctx.overlay.has(rel)) return ctx.overlay.get(rel);
    return readText(path.join(projectRoot, ...rel.split('/')));
  };
  ctx.project = (rel, content) => { if (ctx.overlay) ctx.overlay.set(rel, content); };
  return ctx;
}

/**
 * `--check`: the version interlock every /pnp:* skill runs in Step 0. Touches nothing.
 * Returns { current: bool, pending: [...] }; the CLI turns that into an exit code.
 */
export function checkInterlock({ pluginRoot, projectRoot }) {
  const { payload, config, pending, journal } = preflight({ pluginRoot, projectRoot });
  return {
    current: pending.length === 0 && !journal,
    pending,
    journal,
    installedVersion: config._aiwf.installedPluginVersion,
    payloadVersion: payload.version,
  };
}

/**
 * The whole update. `dryRun` plans everything and writes NOTHING - not one byte, not even a stage.
 * Returns a report; throws UpdateError when the run is blocked (nothing half-written is left behind
 * beyond operations that had already completed, each of which is journalled and resumable).
 */
export function runUpdate({ pluginRoot, projectRoot, resolve, dryRun = false, log = () => {}, warn = null }) {
  const { payload, configFile, config, pending, journal } = preflight({ pluginRoot, projectRoot });
  const from = config._aiwf.installedPluginVersion;
  const to = payload.version;

  if (pending.length === 0) {
    if (journal) throw new UpdateError('invariant violated: a migration journal is present although no migration is pending.');
    // Nothing is in flight here (a journal on this path is the invariant violation above), so stage
    // debris left by a run that died between its final write and its cleanup is collected now -
    // otherwise "already current" would be the one answer that never cleans up after itself.
    if (!dryRun) removeStageRoot(projectRoot);
    return { current: true, from, to, applied: [], pending: [], dryRun, changesFile: null, notes: [] };
  }

  const ctx = makeContext({
    pluginRoot, projectRoot, payload, configFile, config, resolve, log,
    warn: warn || ((message) => log(`warning: ${message}`)),
  });

  if (dryRun) {
    // A preview NEVER writes and NEVER prompts: it plans each operation against the current state
    // and reports it. Where a resolution is required it comes from the resolution file, or the
    // preview stops there - which is itself the answer the operator needs from a preview.
    //
    // The preview is SEQUENTIAL: each operation is planned against the state its predecessors would
    // have left - config keys and bookkeeping in memory, file contents in the overlay. Without that,
    // a migration touching one artifact twice would preview the second operation against the
    // untouched file and announce a conflict the apply will never raise.
    ctx.overlay = new Map();
    const preview = [];
    for (const entry of pending) {
      for (const [opIndex, op] of payload.migrations.get(entry.id).operations.entries()) {
        const plan = planOperation(ctx, entry.id, opIndex, op);
        preview.push({ migration: entry.id, opIndex, summary: plan.summary, op });
        if (plan.mode === 'config') setConfigPath(ctx.config, op.path, plan.value);
        else if (plan.mode !== 'none') ctx.project(plan.target, projectedFileContent(ctx, plan));
        if (plan.bookkeeping) mergeBookkeeping(ctx.config, plan.bookkeeping);
      }
    }
    return { current: false, from, to, applied: [], preview, pending, dryRun: true, changesFile: null, notes: ctx.notes };
  }

  // Taken BEFORE recovery and before the first operation, because this is the last moment the fact
  // still exists: which `createIfAbsent` artifacts this installation had no record of. The moment
  // one is created the record is there, and nothing in the final state distinguishes it from an
  // artifact that had always been recorded (see assembleChanges). Only the report's label depends on
  // it, and only for a run that completes in this process.
  //
  // Recorded as `<migrationId>/<opIndex>` and claimed ONCE per key, in the order the operations will
  // run: the operation that finds no record is the one that creates the artifact, and every later
  // operation on the same key in the same run meets a record and creates nothing.
  const createdOps = new Set();
  const claimed = new Set();
  for (const entry of pending) {
    for (const [opIndex, op] of payload.migrations.get(entry.id).operations.entries()) {
      if (op.op !== 'rerender-managed-region' || op.createIfAbsent !== true) continue;
      const key = op.region ? `${op.file}#${op.region}` : op.file;
      if (claimed.has(key) || isPlainObject(ctx.config._aiwf.managedRegions[key])) continue;
      claimed.add(key);
      createdOps.add(`${entry.id}/${opIndex}`);
    }
  }

  let start = { migrationIndex: 0, opIndex: 0, staged: null };
  if (journal) start = recover(ctx, pending);

  for (let m = start.migrationIndex; m < pending.length; m += 1) {
    const entry = pending[m];
    const ops = payload.migrations.get(entry.id).operations;
    const firstOp = m === start.migrationIndex ? start.opIndex : 0;
    for (let i = firstOp; i < ops.length; i += 1) {
      // The staged result belongs to ONE operation - the interrupted one recovery handed back.
      const staged = (m === start.migrationIndex && i === start.opIndex) ? (start.staged ?? null) : null;
      const plan = planOperation(ctx, entry.id, i, ops[i], staged);
      applyOperation(ctx, entry.id, i, plan);
      ctx.applied.push({ migration: entry.id, opIndex: i, summary: plan.summary, op: ops[i] });
      log(`  ${entry.id}[${i}] ${plan.summary}`);
    }
  }

  // The report first (it is derived, so a crash here costs nothing but a re-run), then ONE final
  // atomic config write that moves the version stamps and clears the journal.
  const changes = assembleChanges({
    from, to, pending, migrations: payload.migrations, managedRegions: ctx.config._aiwf.managedRegions,
    foreignAskRules: measureForeignAskRules(ctx, pending), createdOps,
  });
  const changesFile = path.join(projectRoot, `CHANGES_${from}-to-${to}.md`);
  writeAtomic(changesFile, changes);

  ctx.config._aiwf.lastMigrationApplied = pending[pending.length - 1].id;
  ctx.config._aiwf.installedPluginVersion = to;
  ctx.config._aiwf.migrationJournal = null;
  writeConfig(ctx);
  removeStageRoot(projectRoot);

  return { current: false, from, to, applied: ctx.applied, pending, dryRun: false, changesFile, notes: ctx.notes };
}

/**
 * `--resolve <key>`: reopens the conflict dialog for ONE managed artifact, at any time - a version
 * bump is not required, and this is the only way out of an `override`.
 *
 * It is deliberately NOT journalled: it is a single operation with two writes (the artifact, then
 * its bookkeeping), and a journal that could not name a migration would have to invent an id that
 * recovery must then special-case. The residual is bounded and visible: a crash between the two
 * writes leaves the artifact updated and its stamp stale, which the next `/pnp:selfcheck` reports as
 * a drifted managed artifact and a second `--resolve` fixes.
 */
export function resolveArtifact({ pluginRoot, projectRoot, key, resolve, log = () => {} }) {
  const { payload, configFile, config, journal } = preflight({ pluginRoot, projectRoot });
  if (journal) {
    // The interrupted operation owns its artifact until it finishes, and the update run reopens
    // exactly this dialog for it. So the refusal names the LITERAL address that dialog will use -
    // derived from the journalled operation itself, not from journal.target, which for a region
    // operation carries the file and not the `#region` half the address needs. A message the
    // operator cannot copy a record from would point at a door without giving them the key.
    const ops = payload.migrations.get(journal.migration);
    const journalOp = ops ? ops.operations[journal.opIndex] : null;
    const journalKey = operationKey(journalOp, journal.target ?? '(unknown)');
    const address = `${journal.migration}/${journal.opIndex}/${journalKey}`;
    // What the operator has to DO differs by operation, so the message says only what is true of
    // the one in the journal. Promising a record where none is consumed sends them to write a file
    // the resume will ignore - and then to wonder why it changed nothing.
    let advice;
    if (journalOp && journalOp.op === 'rerender-managed-region') {
      // The only operation whose resume can reopen a dialog: a target that moved while the update
      // was down is a conflict, and a conflict is the one thing a record answers.
      advice = `If that artifact changed while the update was down, the resume reopens the decision at the address "${address}", ` +
        'where the record is { "kind": "conflict", "resolution": "take-new" | "keep-mine" | "merge" }.';
    } else if (journalOp && journalOp.op === 'add-config-key' && journalOp.askOperator === true) {
      // The answer it already has is replayed from the stage, so a record is needed only in the one
      // case where that stage is gone.
      advice = 'The answer you already gave is staged and replays automatically. Only if that stage has been deleted does ' +
        `the resume ask again, at the address "${address}", where the record is { "kind": "answer", "value": <json> }.`;
    } else {
      advice = 'No record is needed - just re-run /pnp:update and this operation resumes on its own.';
    }
    throw new UpdateError(
      `an interrupted update is in flight: ${journal.migration} operation ${journal.opIndex} ` +
      `(${journalOp ? journalOp.op : 'unknown operation'}, ${journalKey}). Finish it with \`/pnp:update\` first - it ` +
      `resumes from the journal. ${advice}`,
    );
  }
  const previous = config._aiwf.managedRegions[key];
  if (!isPlainObject(previous)) {
    throw new UpdateError(`"${key}" is not a managed artifact of this project (nothing with that key is recorded in _aiwf.managedRegions).`);
  }
  const template = RESOLVABLE_ARTIFACT_TEMPLATES[key];
  if (!template) {
    throw new UpdateError(
      `"${key}" is recorded, but no payload template is associated with it, so there is nothing to re-render against. ` +
      `Resolvable keys: ${Object.keys(RESOLVABLE_ARTIFACT_TEMPLATES).join(', ')}.`,
    );
  }
  const cut = key.indexOf('#');
  const op = {
    op: 'rerender-managed-region',
    file: cut === -1 ? key : key.slice(0, cut),
    region: cut === -1 ? null : key.slice(cut + 1),
    template,
  };
  const ctx = makeContext({
    pluginRoot, projectRoot, payload, configFile, config, resolve, log,
    warn: (message) => log(`warning: ${message}`),
  });

  const fileText = ctx.readProjected(op.file);
  const actual = op.region ? extractRegion(fileText, op.region) : fileText;
  const newRender = ctx.render(op.template);
  const renderHash = sha256(newRender);
  // The dialog is reopened UNCONDITIONALLY here - that is what --resolve means. There is no
  // "nothing to do" branch: leaving an override is a decision, not a diff.
  const record = ctx.resolve(key, 'conflict', {
    key, held: previous.override === true, actual, newRender,
    predicates: ['you asked to reopen this artifact'],
  });
  const plan = applyResolution(ctx, { op, key, address: key, actual, newRender, renderHash, record });
  // The same re-check applyOperation does, for the same reason: this dialog can sit open just as
  // long, and a decision taken about content that has since changed must not be applied to it.
  const nowHash = hashPlanTargetOnDisk(ctx, plan);
  if (plan.target && nowHash !== plan.preHash) {
    throw new UpdateError(
      `"${key}": ${plan.target} changed while you were deciding, so the resolution was taken against a state that no ` +
      'longer exists. Nothing was applied - run --resolve again to decide against the file as it is now.',
    );
  }
  applyTarget(ctx, plan);
  mergeBookkeeping(ctx.config, plan.bookkeeping);
  writeConfig(ctx);
  log(`  ${plan.summary}`);
  return { key, resolution: record.resolution, summary: plan.summary };
}
