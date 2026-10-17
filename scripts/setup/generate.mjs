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
 *   <plansDir>/active, <plansDir>/archive, <plansDir>/drafts, <plansDir>/readiness, <scratchDir>   directories
 *
 * TWO PHASES, AND THE ORDER IS THE SAFETY PROPERTY
 *   plan() decides everything and writes nothing; apply() writes what plan() decided. Any blocker -
 *   an unparseable file, a malformed project additions block, a stale artifact that would have to be
 *   deleted - is found in the plan phase, so the run stops with the project EXACTLY as it was.
 *
 * A RENDER OVERWRITES - the consumer's own text has exactly two homes
 *   Every managed artifact is written from the render, whatever is on disk: an edited file, a
 *   deleted one, a file this engine has no record of. Nothing asks. A pre-existing file this
 *   installation had no record of is overwritten and named in the report as `overwrote: <path>`.
 *   The consumer's own text lives in two places only:
 *     - the overrides document (seeded once, never rewritten), and
 *     - ONE project additions block per rendered Markdown file, between the lines
 *       `<!-- project additions -->` and `<!-- /project additions -->`, which every re-render
 *       carries over byte for byte (carryProjectAdditions). A malformed block (one marker without
 *       the other, or more than one block) stops the run naming the file - nothing is guessed.
 *   CLAUDE.md is the one managed file that also holds the operator's text OUTSIDE its `aiwf-core`
 *   markers: only the marked region is rendered, and every byte around it is kept.
 *
 * BOOKKEEPING
 *   `_aiwf.managedRegions[key] = "<semver>"` - the payload version that last rendered the artifact,
 *   nothing else. A legacy shape (an `{upstream, local, override}` object per key, a
 *   `migrationJournal` key) is normalised in memory on load by normalizeBookkeeping and written back
 *   whenever the run writes the config anyway. A file is DELETED only when its key is recorded and
 *   the operator passed --confirm-remove-stale.
 *
 * LINE ENDINGS: comparison is LF-normalised, so a CRLF checkout does not read as a change. Writing
 * is not: CLAUDE.md is written back with its existing bytes untouched and only the managed region
 * re-encoded into the line-ending convention that file already uses, and a carried additions block
 * keeps its own bytes.
 *
 * MEMORY SEEDS are PRINTED for the operator, never written into any memory store: the store's
 * format and location are machine-local and are not the plugin's to assume.
 *
 * THE SELF-CHECK IS PART OF THE RUN
 *   The direct CLI finishes exactly as interview.mjs does: a successful, non-dry-run apply that
 *   really wrote something RUNS scripts/selfcheck/aiwf-selfcheck.js against the project, and a red
 *   or unrunnable self-check makes the command exit 1 while saying that the files were written and
 *   nothing was rolled back. --no-selfcheck skips it and says so. Contract:
 *   scripts/selfcheck/run-selfcheck.mjs.
 *
 * CLI
 *   node generate.mjs --answers-file <answers.json> [--project-root <dir>] [--plugin-root <dir>]
 *                     [--confirm-remove-stale] [--no-seeds] [--dry-run] [--quiet] [--no-selfcheck]
 *   exit 0 = applied (or dry-run clean); exit 1 = blocked with nothing written, or a red/unrunnable
 *   self-check after a successful write; exit 2 = cannot start.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectDefaults, formatErrors, loadSchema, validate } from './validate-config.mjs';
import { REVIEW_CLASSES, claudePinErrors } from './role-rules.mjs';
import { validatePayload } from '../update/validate-payload.mjs';
import { finishWithSelfCheck } from '../selfcheck/run-selfcheck.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PLUGIN_ROOT = path.resolve(HERE, '..', '..');

export const SUPPORTED_OS = ['windows', 'linux', 'macos'];
export const CONFIG_REL = path.join('.claude', 'aiwf-native', 'aiwf.config.json');
export const ROLES_REL = path.join('.claude', 'aiwf-native', 'roles.json');
export const SETTINGS_REL = path.join('.claude', 'settings.json');
const AGENTS_DIR = path.join('.claude', 'agents');
// The COO's own standing rules, rendered like an agent file but addressed to the MAIN session - so
// it lives beside the config rather than under .claude/agents/, carries no frontmatter, and is
// rendered unconditionally: there is no configuration in which a project has no main session.
const ORCHESTRATOR_REL = path.join('.claude', 'aiwf-native', 'ORCHESTRATOR.md');
// The instruction file a Codex-hosted auditor reads at the project root (the wrappers run it with the
// project root as its working root). A whole file, rendered unconditionally and version-free: it names
// no plugin path, so an update can never leave it pointing at an old payload.
const CODEX_AGENTS_REL = 'AGENTS.md';
const REGION_ID = 'aiwf-core';
const REGION_BEGIN = `<!-- BEGIN ${REGION_ID} -->`;
const REGION_END = `<!-- END ${REGION_ID} -->`;
// Stand-in bookkeeping, used ONLY to shape-check the answers before the real block exists. Never
// written anywhere, and deliberately NOT the fresh-install stamp: the real _aiwf is built at the end
// of the plan, and its lastMigrationApplied is READ FROM THE PAYLOAD MANIFEST (see planInstall).
const PROBE_AIWF = {
  installedPluginVersion: '0.0.0',
  lastMigrationApplied: '0000_probe',
  managedRegions: {},
  ownedAskRules: [],
  suppressedAskRules: [],
};

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const toPosix = (p) => p.split(path.sep).join('/');
// lf / jsonText / orderConfig are exported for the UPDATE engine (scripts/update/migrate.mjs): a
// rendered artifact, its hash and the config's byte layout must mean exactly the same thing in both
// engines, and a second copy of these three lines is precisely how they would drift apart.
export const lf = (text) => text.replace(/\r\n/g, '\n');
export const sha256 = (text) => crypto.createHash('sha256').update(lf(text), 'utf8').digest('hex');

// LINE ENDINGS - hashes are LF, BYTES ON DISK ARE THE FILE'S OWN
// Every hash in this engine is taken over LF-normalised text, so a CRLF checkout never reads as an
// edit. That is a statement about COMPARISON, and it must not leak into writing: a file that carries
// the operator's own text (CLAUDE.md is the only one) is written back with its existing bytes
// untouched, and the managed region is re-encoded into the convention that file already uses.
// Otherwise "text outside the markers is never touched" would be false for every CRLF checkout - the
// region would be correct and every line around it rewritten.
export function dominantEol(text) {
  const crlfCount = (text.match(/\r\n/g) || []).length;
  const lfCount = (text.match(/\n/g) || []).length - crlfCount;
  return crlfCount > lfCount ? '\r\n' : '\n';
}
export const encodeEol = (text, eol) => (eol === '\r\n' ? lf(text).replace(/\n/g, '\r\n') : lf(text));
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
export const jsonText = (value) => JSON.stringify(value, null, 2) + '\n';

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------
// The syntax is exactly what the shipped templates use, and nothing more:
//   {{config.<dotpath>}}   {{resolvedRoot}}   {{wrappers.<key>}}   {{this}} / {{this.<key>}} inside a block
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

// TEMPLATE CONTRACT BLOCKS ARE NOT OUTPUT.
// Every template opens with an HTML comment addressed to THIS engine (`<!-- TEMPLATE CONTRACT ...`)
// - why the file is conditional, which placeholder is render-time, what must never be rendered raw.
// It is documentation for whoever edits the template, and it was reaching the rendered agent file,
// where its first line ("read by the P2 generate engine, not by the Writer") is addressed to nobody
// present. Stripped here, in the ONE function both engines render through, so a re-render by the
// update engine cannot disagree with a fresh install about what the artifact contains.
// Deliberately narrow: only a comment whose FIRST token is `TEMPLATE CONTRACT` goes, so an ordinary
// HTML comment a template wants in its output (the CLAUDE.md region markers, for one) is untouched.
const TEMPLATE_CONTRACT_BLOCK = /^[ \t]*<!--[ \t]*TEMPLATE CONTRACT[\s\S]*?-->[ \t]*\r?\n(?:[ \t]*\r?\n)?/gm;
export function stripTemplateContract(text) {
  return text.replace(TEMPLATE_CONTRACT_BLOCK, '');
}

/**
 * THE render context - built in ONE place so setup and update cannot drift into different bytes for
 * the same template (the update engine imports this instead of assembling its own).
 *   config            the PAYLOAD half of the config (no `$schema`, no `_aiwf`)
 *   resolvedRoot      the project root resolved at render time, never `config.project.root` raw
 *   wrappers          the OS channel, COMPUTED from config.os by wrapperContext()
 *   overridesDocPath  the overrides document as ONE absolute path in the native form of config.os.
 *                     Composed here rather than in a template, because `{{resolvedRoot}}/{{...}}`
 *                     spells a Windows root and a POSIX separator into the same string and renders
 *                     a mixed-slash path (a backslashed root, then forward slashes) into a doctrine
 *                     file nobody re-reads.
 */
export function templateContext(config, resolvedRoot) {
  const context = { config, resolvedRoot, wrappers: wrapperContext(config.os) };
  // Set only when the config really carries the path. A config that does not (a hand-corrupted one
  // reaching the update engine) must fail the way it always did - the template's own "unresolvable
  // template path" render error, naming what is missing - and NOT as a TypeError here or, worse, as
  // the string "null" written into a doctrine file.
  const rel = isPlainObject(config.paths) ? config.paths.overridesDoc : undefined;
  if (typeof rel === 'string') context.overridesDocPath = nativePath(config.os, `${resolvedRoot}/${rel}`);
  // The AUDIT TABLE, resolved to EFFECTIVE rows. The template engine has variables and blocks and
  // deliberately no conditionals, so "inherit the Reviewer or use your own host" is decided here and
  // roles.json reads four flat values per class. Same reason the OS channel is computed rather than
  // branched on in a template.
  const rows = reviewRows(config);
  if (rows) context.review = rows;
  const agent = reviewerAgentFrontmatter(config);
  if (agent) context.reviewerAgent = agent;
  return context;
}

// The three review classes, in the order /pnp:roles prints them. ONE definition, and it lives in
// role-rules.mjs (the Claude pin rule walks the same three rows and must not import this engine
// back); it is re-exported here so every existing importer keeps reading it from the generator.
export { REVIEW_CLASSES };

/**
 * The EFFECTIVE row for one review class: `{ passes, engine, model, effort }`.
 *
 * A row that names no `engine` inherits the Reviewer role WHOLE - engine, model and effort together.
 * There is no field-by-field inheritance on purpose: merging a row's `engine` with the Reviewer's
 * `model` is exactly how a configuration composes `claude` with a Codex model id, which resolves to
 * nothing and fails at dispatch time.
 *
 * A CLAUDE row carries no effort of its own (the schema admits one, the `/pnp:roles --set` gate and
 * the `review-row-shape` assertion refuse it): every Claude-hosted review pass runs through the ONE
 * rendered `reviewer` agent file, and the Agent tool has no per-invocation effort - so the effort
 * that really applies is the frontmatter's, i.e. `roles.reviewer.effort`. Reporting the row's own
 * value there would print a number nothing reads.
 */
export function effectiveReviewRow(config, className) {
  const reviewer = isPlainObject(config.roles) ? config.roles.reviewer : null;
  const row = isPlainObject(config.review) ? config.review[className] : null;
  if (!isPlainObject(row) || !isPlainObject(reviewer)) return null;
  if (typeof row.engine !== 'string') {
    return { passes: row.passes, engine: reviewer.engine, model: reviewer.model, effort: reviewer.effort };
  }
  return {
    passes: row.passes,
    engine: row.engine,
    model: row.model,
    effort: row.engine === 'codex' ? row.effort : reviewer.effort,
  };
}

/** All three effective rows, or null when this config predates the table (nothing to render). */
export function reviewRows(config) {
  const out = {};
  for (const cls of REVIEW_CLASSES) {
    const row = effectiveReviewRow(config, cls);
    if (!row) return null;
    out[cls] = row;
  }
  return out;
}

/**
 * ONE Claude agent file per role, so `reviewer.md` carries ONE model and ONE effort:
 *   model  = the Reviewer's own model (a tier alias or an exact id) when the Reviewer is
 *            claude-hosted, otherwise `fable` - the top tier, because a claude-hosted ROW still
 *            dispatches through this file and an auditor below the author is not an audit.
 *            `/pnp:review` passes the ROW's model as the Agent tool's `model` override only when it
 *            is a tier alias; an exact id is omitted and THIS pin runs, which is why a Claude row
 *            may carry an exact id only when it is exactly this one (role-rules.mjs claudePinErrors).
 *   effort = roles.reviewer.effort, always. There is no per-invocation effort to override it with.
 */
export function reviewerAgentFrontmatter(config) {
  const reviewer = isPlainObject(config.roles) ? config.roles.reviewer : null;
  if (!isPlainObject(reviewer)) return null;
  return {
    model: reviewer.engine === 'claude' ? reviewer.model : 'fable',
    effort: reviewer.effort,
  };
}

/**
 * Is `.claude/agents/reviewer.md` part of THIS configuration? True when the Reviewer role is
 * claude-hosted, and also when any review row is - a Claude-hosted row has no other host to be
 * dispatched through.
 */
export function reviewerAgentRendered(config) {
  const reviewer = isPlainObject(config.roles) ? config.roles.reviewer : null;
  if (isPlainObject(reviewer) && reviewer.engine === 'claude') return true;
  const review = isPlainObject(config.review) ? config.review : {};
  return REVIEW_CLASSES.some((cls) => isPlainObject(review[cls]) && review[cls].engine === 'claude');
}

// One separator for the whole path, chosen by the CHANNEL the installation is for - not by the
// separator of the machine that happens to be rendering. An install is generated for exactly one
// OS channel, and that channel is where the rendered file will be read.
export function nativePath(os, p) {
  return os === 'windows' ? p.split('/').join('\\') : p.split('\\').join('/');
}

/** Renders one template. `context` is what templateContext() builds. Never mutates it. */
export function renderTemplate(text, context) {
  const tree = parseBlocks(tokenize(stripStandaloneTags(stripTemplateContract(text))));
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

/**
 * The fail-closed OS gate. All three channels now ship wrappers (`scripts/native/ps` for windows,
 * `scripts/native/sh` for linux/macos), so this admits the schema's enum and still refuses anything
 * outside it - an unknown channel would render an installation pointing at wrappers that do not
 * exist.
 */
export function assertSupportedOs(os) {
  if (SUPPORTED_OS.includes(os)) return;
  throw new SetupError(
    `os "${os}" is not a supported channel - setup generates one of ${SUPPORTED_OS.map((o) => `"${o}"`).join(', ')} ` +
    'and refuses rather than generate an installation this version cannot run.',
  );
}

// ---------------------------------------------------------------------------
// The wrapper channel (which OS-specific scripts the rendered project layer points at)
// ---------------------------------------------------------------------------
// The template engine has variables, {{#each}} and inverse blocks - and deliberately no
// conditionals - so the OS branch is taken HERE and the templates read a value. windows keeps the
// PowerShell channel; linux and macos share the bash channel. Paths are PAYLOAD-relative and
// POSIX-separated, exactly as the templates spelled them before this became a variable, so an
// os=windows render is byte-identical to the pre-channel one.
export function wrapperContext(os) {
  // No silent default: an unknown channel here would quietly hand every template the bash paths.
  // Both callers gate on assertSupportedOs first, so this only fires if a third caller forgets to.
  assertSupportedOs(os);
  const dir = os === 'windows' ? 'scripts/native/ps' : 'scripts/native/sh';
  const ext = os === 'windows' ? '.ps1' : '.sh';
  const at = (name) => `${dir}/${name}${ext}`;
  return {
    dir,
    ext,
    shell: os === 'windows' ? 'pwsh' : 'bash',
    roles: at('aiwf-roles'),
    review: at('codex-review'),
    qa: at('codex-qa'),
    qal: at('codex-qal'),
  };
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
export function orderConfig(config) {
  const out = {};
  for (const key of CONFIG_KEY_ORDER) if (key in config) out[key] = config[key];
  for (const key of Object.keys(config)) if (!(key in out)) out[key] = config[key];
  return out;
}

// ---------------------------------------------------------------------------
// Ask-ruleset merge (ownership WITHOUT takeover)
// ---------------------------------------------------------------------------
// ONE function for both engines - setup and the update engine's `reconcile-ask-ruleset` call the
// same formulas, so "what the ask list becomes" cannot mean two things:
//   to-add    = (desired - actual) - suppressed      (a tombstone is never forced back)
//   to-remove = owned' - desired                     (the engine retiring its OWN render)
//   owned''   = ((owned n actual) + to-add) - to-remove
//   tombstone: an owned rule missing from actual moves to suppressed and is reported
//   present-foreign = (desired n actual) - owned     (measured, never acted on - see below)
//
// PRESENT-FOREIGN: THE FACE THAT IS NOT A DECISION
//   A payload rule the project already carries in a spelling identical to the payload's, which this
//   engine never inserted: it is not added (it is already there), not removed (it is not owned), not
//   tombstoned (nobody removed it) - the engine's whole behaviour towards it is to leave it alone.
//   It is computed here anyway, because "the engine will never touch this rule" is exactly the fact
//   an operator cannot see from a diff that has no lines: the reconcile report names it, and nothing
//   else in the return changes because of it.
//   The set is invariant across the reconcile it describes - (desired n actual) - owned is the same
//   before and after, because to-add lands in BOTH actual and owned and to-remove is disjoint from
//   desired - which is what lets the CHANGES report re-measure it from the FINAL state instead of
//   carrying an accumulator through a run that may have been interrupted (`assembleChanges`).
//
// TO-REMOVE, AND WHY IT IS NOT A TOMBSTONE
//   `owned` is by construction a subset of the desired set of the payload/root that inserted it, so
//   `owned - desired` is exactly the rules THIS engine wrote and no longer wants: a rule the payload
//   dropped, or - the case that made this half necessary at install time - a `<projectRoot>` render
//   carrying a root the project no longer has (a repo moved, a worktree, a rename). Nothing foreign
//   and nothing pre-existing can land in that set, because neither is ever owned.
//   It is NOT recorded as suppressed: a tombstone means "the OPERATOR removed this, never force it
//   back", and stamping one here would silence a rule the payload might legitimately ship again.
//   The two halves cannot collide, either - a tombstoned rule has already left `owned`.
export function planAskRules({ desired, actual, owned, suppressed }) {
  const actualSet = new Set(actual);
  const desiredSet = new Set(desired);
  const suppressedSet = new Set(suppressed);
  const ownedSet = new Set(owned);
  const newlyTombstoned = owned.filter((r) => !actualSet.has(r));
  for (const r of newlyTombstoned) suppressedSet.add(r);
  const toAdd = desired.filter((r) => !actualSet.has(r) && !suppressedSet.has(r));
  const ownedNext = owned.filter((r) => actualSet.has(r)).concat(toAdd);
  const toRemove = ownedNext.filter((r) => !desiredSet.has(r));
  const removedSet = new Set(toRemove);
  return {
    toAdd,
    toRemove,
    newlyTombstoned,
    ask: actual.concat(toAdd).filter((r) => !removedSet.has(r)),
    owned: ownedNext.filter((r) => !removedSet.has(r)),
    suppressed: [...suppressedSet],
    // In payload order, so a report that prints it is stable across runs.
    presentForeign: desired.filter((r) => actualSet.has(r) && !ownedSet.has(r)),
  };
}

// ---------------------------------------------------------------------------
// Bookkeeping normalisation and the project additions block - shared by every engine that loads a
// config or re-renders a managed artifact (setup, /pnp:update, /pnp:roles), so they cannot disagree.
// ---------------------------------------------------------------------------
/**
 * Brings a config loaded from disk to the current bookkeeping shape, IN PLACE (that is the point:
 * every loader calls it before validation, and the normalised object is what the run then works on
 * and writes back if it writes the config at all). Two legacy forms are rewritten:
 *   - `_aiwf.migrationJournal` (the write-ahead journal of the old update engine) is deleted;
 *   - every object-valued `_aiwf.managedRegions` entry (`{upstream, local, override}`) becomes the
 *     string `_aiwf.installedPluginVersion`.
 * Returns true when it changed something. A config without an `_aiwf` object is left alone.
 */
export function normalizeBookkeeping(config) {
  if (!isPlainObject(config) || !isPlainObject(config._aiwf)) return false;
  const bk = config._aiwf;
  let changed = false;
  if (Object.prototype.hasOwnProperty.call(bk, 'migrationJournal')) {
    delete bk.migrationJournal;
    changed = true;
  }
  if (isPlainObject(bk.managedRegions)) {
    for (const [key, entry] of Object.entries(bk.managedRegions)) {
      if (isPlainObject(entry)) {
        bk.managedRegions[key] = bk.installedPluginVersion;
        changed = true;
      }
    }
  }
  return changed;
}

export const PROJECT_ADDITIONS_BEGIN = '<!-- project additions -->';
export const PROJECT_ADDITIONS_END = '<!-- /project additions -->';

/** A project additions block that cannot be carried without guessing. Callers fail the run with exit 1. */
export class ProjectAdditionsError extends Error {}

/**
 * Every marker LINE of `text` - a line whose content is exactly the marker (a trailing CR of a CRLF
 * line is the line ending, not content). Returns [{ marker, index }] with `index` = where the marker
 * starts, in file order.
 */
function additionsMarkerLines(text) {
  const out = [];
  let lineStart = 0;
  while (lineStart <= text.length) {
    const nl = text.indexOf('\n', lineStart);
    const lineEnd = nl === -1 ? text.length : nl;
    const line = text.slice(lineStart, lineEnd).replace(/\r$/, '');
    if (line === PROJECT_ADDITIONS_BEGIN || line === PROJECT_ADDITIONS_END) out.push({ marker: line, index: lineStart });
    if (nl === -1) break;
    lineStart = nl + 1;
  }
  return out;
}

/**
 * The one block of `text` as { start, end } (end = just after the closing marker), null when the
 * text carries no marker at all, or a ProjectAdditionsError when it carries anything else.
 */
function findAdditionsBlock(text, label) {
  const markers = additionsMarkerLines(text);
  if (markers.length === 0) return null;
  const begins = markers.filter((m) => m.marker === PROJECT_ADDITIONS_BEGIN).length;
  const ends = markers.length - begins;
  if (begins !== 1 || ends !== 1 || markers[0].marker !== PROJECT_ADDITIONS_BEGIN) {
    throw new ProjectAdditionsError(
      `${label}: the project additions block is malformed (${begins} "${PROJECT_ADDITIONS_BEGIN}" and ${ends} `
      + `"${PROJECT_ADDITIONS_END}" line(s); exactly one of each, in that order, is the only shape that is carried). `
      + 'Nothing was written to it - fix the markers and run again.',
    );
  }
  return { start: markers[0].index, end: markers[1].index + PROJECT_ADDITIONS_END.length };
}

/**
 * THE carry rule of a whole-file Markdown re-render. `existingText` is the file on disk (null when
 * it does not exist), `renderedText` the fresh render. When the existing file carries exactly one
 * project additions block, that block - markers included, inner bytes verbatim - goes into the
 * result: in place of the render's own block when the render carries one, otherwise appended after
 * the render's last line with one blank line before it. No block -> the render unchanged. A
 * malformed block (in either text) throws ProjectAdditionsError naming `label`; nothing is guessed.
 * Returns { text, carried }. A carried result must be written byte for byte (no line-ending
 * normalisation), or CRLF content inside the block would not survive.
 */
export function carryProjectAdditions(existingText, renderedText, label = 'the rendered file') {
  if (existingText === null || existingText === undefined) return { text: renderedText, carried: false };
  const mine = findAdditionsBlock(existingText, label);
  if (mine === null) return { text: renderedText, carried: false };
  const block = existingText.slice(mine.start, mine.end);
  // The render half is LF, as every other render write is; only the block keeps its own bytes.
  const render = lf(renderedText);
  const slot = findAdditionsBlock(render, `${label} (the payload render)`);
  if (slot !== null) {
    return { text: render.slice(0, slot.start) + block + render.slice(slot.end), carried: true };
  }
  const joiner = render.endsWith('\n') ? '\n' : '\n\n';
  return { text: `${render}${joiner}${block}\n`, carried: true };
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
 * CANONICAL PATH - the nearest EXISTING ancestor resolved to its real location, with the segments
 * that do not exist yet re-joined onto it.
 *
 * A lexical containment test ("does this string stay under the project root") is not enough, and a
 * junction is why: `<project>/notes` can be a junction whose target is outside the project, and
 * `<project>/notes/CANDIDATES.md` then reads as contained while the write lands somewhere else
 * entirely. `fs.realpathSync` alone cannot answer it either - the file does not exist yet, which is
 * the whole point of seeding it - so the walk climbs until something really is on disk.
 *
 * Same technique and same reason as the work-directory guard in scripts/ci/run-example-cycle.mjs.
 */
function canonicalPath(p) {
  let cursor = path.resolve(p);
  const tail = [];
  for (;;) {
    try {
      return path.join(fs.realpathSync.native(cursor), ...tail);
    } catch {
      const parent = path.dirname(cursor);
      if (parent === cursor) return path.join(cursor, ...tail); // reached the root: nothing exists
      tail.unshift(path.basename(cursor));
      cursor = parent;
    }
  }
}

/**
 * STRICT descendant: equal paths are NOT inside. That is deliberate - it is what makes "the surface
 * may not BE the project root" fall out of the containment test instead of needing its own branch.
 *
 * The climb-out test is SEGMENT-AWARE, not a prefix match. `rel.startsWith('..')` also rejects
 * perfectly ordinary in-project names that merely begin with two dots - `..notes/file.md` relativizes
 * to `..notes\file.md` - and refusing those would be a false positive in a guard whose whole value is
 * that a refusal means something.
 */
function isInsideDir(parent, child) {
  const rel = path.relative(parent, child);
  if (rel === '' || path.isAbsolute(rel)) return false;
  return rel !== '..' && !rel.startsWith('..' + path.sep);
}

/**
 * Path equality as THIS filesystem means it. `realpathSync.native` already returns the on-disk
 * casing for the parts that exist, so the only way two spellings of one destination can differ is in
 * a tail that does not exist yet - which is exactly the fresh-install case the collision guard below
 * is for. On win32 that tail is still the same file, so it is compared case-insensitively there.
 */
const samePath = (a, b) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);

/**
 * THE TRANSFER SURFACE'S PATH, in one place because the resolution is a RULE rather than a value.
 * `paths.transferSurface` has no schema default on purpose - a default would put the key into every
 * fresh config and invite the managed-artifact treatment this file must never get - so "where is it"
 * is answered here and quoted by the doctrine in the same words: the configured
 * `paths.transferSurface`, or `<plansDir>/PNP_CANDIDATES.md` when absent.
 *
 * Returns a project-relative POSIX path. The caller supplies the whole `paths` block, so a config
 * that carries neither key resolves against the schema's own plansDir default having already been
 * merged in - this function does not invent one.
 */
export const TRANSFER_SURFACE_BASENAME = 'PNP_CANDIDATES.md';
export function resolveTransferSurface(paths) {
  const configured = paths && paths.transferSurface;
  if (typeof configured === 'string' && configured.trim() !== '') return toPosix(configured);
  return toPosix(path.join(String((paths && paths.plansDir) || ''), TRANSFER_SURFACE_BASENAME));
}

/**
 * THE ROADMAP'S PATH: `<plansDir>/ROADMAP.md`, a FIXED location with no config key of its own. Like
 * the transfer surface it is seeded once and then the operator's, so nothing records, hashes or
 * rewrites it; unlike the surface it cannot be pointed elsewhere. Returns a project-relative POSIX
 * path. The Gate 3 hook copies this rule (pretooluse-mutation-guard.js resolveRoadmap) rather than
 * importing it, for the same reason it copies resolveTransferSurface.
 */
export const ROADMAP_BASENAME = 'ROADMAP.md';
export function resolveRoadmap(paths) {
  return toPosix(path.join(String((paths && paths.plansDir) || ''), ROADMAP_BASENAME));
}

/**
 * THE THREE WARNINGS SETUP OWES, in one place because two spellings of the same sentence would
 * eventually disagree. The interview says all three at their questions; the generator repeats the
 * existing-plans warning and the under-scratch warning, through these same helpers, as notes in its
 * plan/report. The overrides-document warning is the interview's alone: the generator never calls
 * existingOverridesWarning and states that fact in a note of its own words (planInstall, step 5).
 * Two are owed a project that was not empty (existing plans, an existing overrides document); the
 * third is owed any project whose paths.plansDir lies under the scratch directory.
 *
 * None is a blocker. Each describes a situation an operator may want on purpose; what must not
 * happen is that setup adopts it in SILENCE.
 */

/**
 * A pre-existing `<plansDir>/active/` that already holds `PLAN_*.md` files. The predicate is
 * deliberately the byte-for-byte one Gate 2 uses (`entry.isFile()` + `/^PLAN_.*\.md$/`, see
 * scripts/engine/pretooluse-dispatch-gate.js) - a count that did not describe exactly the set the
 * gate reads would be a warning about a different thing.
 * Returns the warning line, or null when there is nothing to warn about.
 */
export function existingPlansWarning({ projectRoot, plansDir }) {
  if (!projectRoot || typeof plansDir !== 'string' || plansDir.trim() === '') return null;
  const rel = toPosix(path.join(plansDir, 'active'));
  let entries;
  try {
    entries = fs.readdirSync(path.resolve(projectRoot, plansDir, 'active'), { withFileTypes: true });
  } catch { return null; } // absent or unreadable: nothing observed, so nothing claimed
  const count = entries.filter((e) => e.isFile() && /^PLAN_.*\.md$/.test(e.name)).length;
  if (count === 0) return null;
  return `${count} existing PLAN_*.md in ${rel} - Gate 2 off-plan will read them as active pnp plans; pick another paths.plansDir if they are not.`;
}

/**
 * One warning line, or null: paths.plansDir lies under the scratch directory. A plan canon there
 * is outside git wherever the scratch directory is ignored (/pnp:review Step 2e). A warning, never a
 * refusal - the schema admits any string and the operator may mean exactly this. Pure and lexical:
 * "." and ".." segments are folded; on a project whose `os` is windows (windowsPaths) backslashes
 * are separators and case is folded, as that file system and git's ignore matching fold them
 * there; on linux and macos the paths are compared as written (a volume's case rule is not in the
 * config, and a lexical test does not guess it); nothing is resolved against the file system. The
 * same test lives in scripts/selfcheck/aiwf-selfcheck.js (plansDirUnderScratch) - the self-check
 * imports nothing from setup.
 */
export function plansDirUnderScratchWarning({ plansDir, scratchDir = '.aiwf', windowsPaths = false }) {
  const norm = (p) => {
    const s = windowsPaths ? String(p).replace(/\\/g, '/').toLowerCase() : String(p);
    return path.posix.normalize(s).replace(/\/+$/, '');
  };
  const a = norm(plansDir);
  const b = norm(scratchDir);
  if (!a || !b || a === '.' || b === '.') return null;
  if (a !== b && !a.startsWith(b + '/')) return null;
  return `paths.plansDir ${plansDir} is under the scratch directory ${scratchDir} - a plan canon there is outside git wherever the scratch directory is ignored; pick a tracked path (/pnp:review Step 2e)`;
}

/**
 * A pre-existing overrides document. Setup seeds that file ONCE and never rewrites it, so pointing
 * `paths.overridesDoc` at a file that is already there means this install writes no template at all
 * - correct behaviour, and invisible unless it is said out loud.
 * Returns the warning line, or null when there is nothing to warn about.
 */
export function existingOverridesWarning({ projectRoot, overridesDoc }) {
  if (!projectRoot || typeof overridesDoc !== 'string' || overridesDoc.trim() === '') return null;
  try {
    if (!fs.statSync(path.resolve(projectRoot, overridesDoc)).isFile()) return null;
  } catch { return null; }
  return `${toPosix(overridesDoc)} already exists - setup seeds that document once and never rewrites it, so this install will leave your file exactly as it is and write no template there.`;
}

/**
 * Decides the whole installation without touching the filesystem.
 * Returns { config, actions, blockers, notes, artifacts, askPlan, overwrote, leftAlone } - `actions`
 * is what apply() will do, `overwrote` names every pre-existing file (or CLAUDE.md region) this
 * installation had no record of that the run replaces with the render, and `leftAlone` every
 * unrecorded file at a stale agent path that the run does not touch.
 */
export function planInstall({
  pluginRoot, projectRoot, answers, confirmRemoveStale = false, schema,
}) {
  const blockers = [];
  const notes = [];
  const actions = [];
  const overwrote = [];
  const abs = (rel) => path.join(projectRoot, rel);
  const stopped = () => ({ config: null, actions: [], blockers, notes, artifacts: [], askPlan: null, overwrote: [], leftAlone: [] });

  const pluginJson = JSON.parse(fs.readFileSync(path.join(pluginRoot, '.claude-plugin', 'plugin.json'), 'utf8'));
  const activeSchema = schema || loadSchema(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json'));

  // ---- 0. the migration payload, BEFORE anything else ----------------------
  // A fresh install executes no migration - it generates the current state and STAMPS the last
  // manifest entry. That stamp is read from the manifest rather than hardcoded, because a constant
  // here would silently disagree with the payload the moment a migration ships, and every later
  // /pnp:update would then fail the "lastMigrationApplied exists in the manifest" invariant on a
  // project this engine installed itself. The whole payload is validated (not just the manifest):
  // an install whose migrations are incoherent is an install no update can ever move forward.
  const payload = validatePayload(pluginRoot);
  if (payload.errors.length) {
    blockers.push(`the plugin's migration payload is not coherent, so nothing was installed:\n  - ${payload.errors.join('\n  - ')}`);
    return stopped();
  }
  const freshInstallMigration = payload.manifest[payload.manifest.length - 1].id;

  // ---- 1. the config object ------------------------------------------------
  const existingRaw = readText(abs(CONFIG_REL));
  let existing = null;
  if (existingRaw !== null) {
    try { existing = JSON.parse(existingRaw); } catch (e) {
      // Stop here rather than plan around it: every later step reads this file's bookkeeping, and a
      // plan built on "there is no previous state" would report conflicts that do not exist.
      blockers.push(`${toPosix(CONFIG_REL)} exists but is not valid JSON (${e.message}) - setup will not overwrite a config it cannot read.`);
      return stopped();
    }
  }
  // A legacy bookkeeping shape is brought to the current one in memory, before anything reads it.
  normalizeBookkeeping(existing);
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
    return stopped();
  }

  // Configured paths are PROJECT-RELATIVE by contract. An absolute path, or one that climbs out of
  // the project, would make this engine write outside the repository it was pointed at - checked
  // here rather than trusted, because the check is one line and the failure is not recoverable.
  // `transferSurface` is OPTIONAL (no schema default), so it is checked only when the project really
  // configured one - but it is checked on exactly the same terms as the required three, because a
  // configured surface is a path this engine WRITES to, and "outside the project" would mean writing
  // outside the repository it was pointed at.
  for (const key of ['scratchDir', 'plansDir', 'overridesDoc', 'transferSurface']) {
    const value = merged.paths[key];
    if (typeof value !== 'string' || value === '') continue; // absent optional key: nothing configured, nothing to contain
    const outside = path.isAbsolute(value) || path.relative(projectRoot, path.resolve(projectRoot, value)).split(/[\\/]/)[0] === '..';
    if (outside) blockers.push(`paths.${key} ("${value}") is not inside the project - configured paths are project-relative.`);
  }
  // `paths.changesDir` is not judged: nothing reads it since the update stopped writing CHANGES
  // reports, so an old value is carried over as it is and ignored.

  // THE TRANSFER SURFACE'S DESTINATION, judged HERE - before a single write is planned, and always,
  // whether the path was configured or defaulted. Three ways the seed can go wrong, and all three end
  // in a REFUSAL rather than an adoption: the surface is UNMANAGED, so there is no bookkeeping entry
  // to record a decision in, and "write it anyway and remember what we did" - the answer available to
  // every managed artifact - does not exist for this file.
  //   (a) IT LEAVES THE PROJECT through a symlink or junction on one of its parents. The lexical loop
  //       above cannot see that: the string is project-relative and the write still lands outside.
  //   (b) IT COLLIDES with a destination setup owns exclusively. Measured, not theorised: a probe
  //       pointing the surface at `.claude/agents/writer.md` produced no blockers, planned BOTH the
  //       managed render and the surface write, and recorded that file in `managedRegions` - the one
  //       thing that must never happen to it. Against the config or settings path the later write
  //       simply wins and the promised page is never there at all.
  //   (c) IT IS NOT A REGULAR FILE. An existing directory reads as "the surface already exists and is
  //       yours", so setup reports the page as the operator's and never creates it.
  const transferSurfaceRel = resolveTransferSurface(merged.paths);
  const transferSurfaceFile = abs(transferSurfaceRel);
  const roadmapRel = resolveRoadmap(merged.paths);
  const roadmapFile = abs(roadmapRel);
  // Every destination setup writes or creates on its own, each tagged with what it IS - because the
  // conflict rules differ by kind (see below). The agent files are ALL reserved rather than only the
  // ones this configuration renders: a codex-hosted role's agent file is a path setup still inspects
  // and may delete. The roadmap is one of them: it is seeded once like the surface, so a surface (or
  // an overrides document) on the roadmap's path would have two one-time writers for one file.
  const roadmapDestination = { rel: roadmapRel, kind: 'file', label: 'the roadmap' };
  const ownedDestinations = [
    { rel: CONFIG_REL, kind: 'file', label: 'the pnp config' },
    { rel: ROLES_REL, kind: 'file', label: 'the rendered roles.json' },
    { rel: SETTINGS_REL, kind: 'file', label: 'the permission settings' },
    { rel: 'CLAUDE.md', kind: 'file', label: 'the file carrying the managed region' },
    { rel: CODEX_AGENTS_REL, kind: 'file', label: 'the Codex auditor instruction file' },
    { rel: merged.paths.overridesDoc, kind: 'file', label: 'the overrides document' },
    { rel: path.join(AGENTS_DIR, 'writer.md'), kind: 'file', label: 'the Writer agent' },
    { rel: path.join(AGENTS_DIR, 'reviewer.md'), kind: 'file', label: 'the Reviewer agent' },
    { rel: path.join(AGENTS_DIR, 'qa.md'), kind: 'file', label: 'the QA agent' },
    roadmapDestination,
    { rel: merged.paths.scratchDir, kind: 'dir', label: 'the scratch directory' },
    { rel: path.join(merged.paths.plansDir, 'active'), kind: 'dir', label: 'the active plans directory' },
    { rel: path.join(merged.paths.plansDir, 'archive'), kind: 'dir', label: 'the plan archive' },
    { rel: path.join(merged.paths.plansDir, 'drafts'), kind: 'dir', label: 'the plan drafts directory' },
    { rel: path.join(merged.paths.plansDir, 'readiness'), kind: 'dir', label: 'the readiness history directory' },
    { rel: path.dirname(CONFIG_REL), kind: 'dir', label: 'the directory the pnp config lives in' },
    { rel: AGENTS_DIR, kind: 'dir', label: 'the agents directory' },
    { rel: path.dirname(merged.paths.overridesDoc), kind: 'dir', label: 'the directory the overrides document lives in' },
  ];
  {
    const configured = typeof merged.paths.transferSurface === 'string' && merged.paths.transferSurface.trim() !== '';
    const where = configured
      ? `paths.transferSurface ("${merged.paths.transferSurface}")`
      : `the default transfer surface "${transferSurfaceRel}" (<plansDir>/${TRANSFER_SURFACE_BASENAME}, because paths.transferSurface is not set)`;
    const realRoot = canonicalPath(projectRoot);
    const realSurface = canonicalPath(transferSurfaceFile);
    if (!isInsideDir(realRoot, realSurface)) {
      blockers.push(
        `${where} really resolves to "${toPosix(realSurface)}", which is not inside the project `
        + `("${toPosix(realRoot)}") - a path can look project-relative and still leave the project `
        + 'through a symlink or junction on one of its parent directories.',
      );
    } else {
      // THREE conflicts, not one. Exact equality alone let a whole class through, because a filesystem
      // has a hierarchy: `docs/backlogs` is not EQUAL to `docs/backlogs/active`, and pointing the
      // surface at it still cannot work. `applyPlan` creates directories before it writes files, so
      // the run got as far as a partial installation and then died on EISDIR - a half-installed
      // project is a worse outcome than a refusal, which is why all three are judged here.
      //
      // Descending INTO an owned directory is deliberately NOT one of them: the default surface lives
      // inside `<plansDir>`, and a page beside the agents is the operator's business.
      for (const { rel, kind, label } of ownedDestinations) {
        // `path.dirname` of a root-level file is ".", which canonicalizes to the project root itself.
        // Reserving that would refuse every surface anywhere in the repository.
        if (typeof rel !== 'string' || rel === '' || rel === '.') continue;
        const owned = canonicalPath(abs(rel));
        const what = `${label} ("${toPosix(rel)}")`;
        if (samePath(owned, realSurface)) {
          blockers.push(
            `${where} is the same destination setup writes as ${what}. The transfer surface is seeded `
            + 'once and then never touched again, so it cannot share a path with an artifact this '
            + 'engine keeps up to date - one of the two writes would silently lose. Pick another '
            + 'paths.transferSurface.',
          );
        } else if (isInsideDir(realSurface, owned)) {
          // The surface is an ANCESTOR of something setup must create beneath it. The surface is a
          // FILE; a file cannot contain anything.
          blockers.push(
            `${where} is a directory setup has to create things inside - ${what} sits beneath it. The `
            + 'transfer surface is a single file, so it cannot also be the folder holding an artifact '
            + 'this engine writes. Pick another paths.transferSurface.',
          );
        } else if (kind === 'file' && isInsideDir(owned, realSurface)) {
          // The inverse: the surface is BENEATH an owned file, which would require that file to be a
          // directory. It is not, and setup is about to write it as a file.
          blockers.push(
            `${where} is placed INSIDE ${what}, which setup writes as a file - holding the surface `
            + `would require "${toPosix(rel)}" to be a directory instead. Pick another `
            + 'paths.transferSurface.',
          );
        }
      }
      // The overrides document is a second writer too: sharing a path with another owned destination,
      // the later write wins over a render whose hash was already recorded. Refused, like the surface.
      const overridesDoc = merged.paths.overridesDoc;
      for (const { rel, label } of ownedDestinations) {
        if (typeof overridesDoc !== 'string' || typeof rel !== 'string' || rel === '' || rel === '.' || label === 'the overrides document') continue;
        if (samePath(canonicalPath(abs(rel)), canonicalPath(abs(overridesDoc)))) {
          blockers.push(`paths.overridesDoc ("${overridesDoc}") is the same destination setup writes as ${label} ("${toPosix(rel)}") - one write would silently lose. Pick another paths.overridesDoc.`);
        }
      }
      // `statSync` FOLLOWS, on purpose: a symlink to a regular file inside the project is the
      // operator's own arrangement and is left alone like any other existing surface, while a symlink
      // that leaves the project was already refused by the containment test above.
      let surfaceStat = null;
      try { surfaceStat = fs.statSync(transferSurfaceFile); } catch { surfaceStat = null; }
      if (surfaceStat && !surfaceStat.isFile()) {
        blockers.push(
          `${where} already exists and is not a regular file (found a ${surfaceStat.isDirectory() ? 'directory' : 'special file'}). `
          + 'Setup never rewrites an existing surface, so it would report this as your page and the '
          + 'file the skeleton belongs in would never be created.',
        );
      }
    }
  }
  // THE ROADMAP'S DESTINATION, judged on the surface's terms and for the same reason: it is seeded once
  // and never bookkept, so a refusal is the only safe answer to a bad path. Its location is fixed
  // (`<plansDir>/ROADMAP.md`, no config key), so the remedy is to move the other path or plansDir. A
  // collision WITH the transfer surface was already judged above, where the roadmap is one of the
  // owned destinations; here it is judged against the rest.
  {
    const where = `the roadmap "${roadmapRel}" (<plansDir>/${ROADMAP_BASENAME}, a fixed location)`;
    const realRoot = canonicalPath(projectRoot);
    const realRoadmap = canonicalPath(roadmapFile);
    if (!isInsideDir(realRoot, realRoadmap)) {
      blockers.push(
        `${where} really resolves to "${toPosix(realRoadmap)}", which is not inside the project `
        + `("${toPosix(realRoot)}") - a path can look project-relative and still leave the project `
        + 'through a symlink or junction on one of its parent directories.',
      );
    } else {
      for (const destination of ownedDestinations) {
        const { rel, kind, label } = destination;
        if (destination === roadmapDestination || typeof rel !== 'string' || rel === '' || rel === '.') continue;
        const owned = canonicalPath(abs(rel));
        const what = `${label} ("${toPosix(rel)}")`;
        if (samePath(owned, realRoadmap)) {
          blockers.push(
            `${where} is the same destination setup writes as ${what} - the roadmap is seeded once and `
            + 'then never touched again, so one of the two writes would silently lose. Move the other path, '
            + 'or pick another paths.plansDir.',
          );
        } else if (isInsideDir(realRoadmap, owned)) {
          blockers.push(
            `${where} is a directory setup has to create things inside - ${what} sits beneath it. The `
            + 'roadmap is a single file. Move the other path, or pick another paths.plansDir.',
          );
        } else if (kind === 'file' && isInsideDir(owned, realRoadmap)) {
          blockers.push(
            `${where} is placed INSIDE ${what}, which setup writes as a file. Move the other path, or `
            + 'pick another paths.plansDir.',
          );
        }
      }
      // `statSync` FOLLOWS, as for the surface: a symlink to a regular file inside the project is left
      // alone like any existing roadmap.
      let roadmapStat = null;
      try { roadmapStat = fs.statSync(roadmapFile); } catch { roadmapStat = null; }
      if (roadmapStat && !roadmapStat.isFile()) {
        blockers.push(
          `${where} already exists and is not a regular file (found a ${roadmapStat.isDirectory() ? 'directory' : 'special file'}). `
          + 'Setup never rewrites an existing roadmap, so it would report this as your page and the '
          + 'file the template belongs in would never be created.',
        );
      }
    }
  }
  if (blockers.length) return stopped();

  // ---- 2. render every managed artifact ------------------------------------
  const resolvedRoot = projectRoot;
  // The whole context comes from templateContext() - the same function the update engine renders
  // through, so an identical template yields identical bytes in both (see its doc comment).
  const context = templateContext(merged, resolvedRoot);
  const artifacts = [];
  const addArtifact = (key, rel, content) => { artifacts.push({ key, rel, file: abs(rel), content }); };

  const rolesRendered = renderTemplate(readTemplate(pluginRoot, 'roles.json.tmpl'), context);
  try { JSON.parse(rolesRendered); } catch (e) {
    blockers.push(`the rendered roles.json is not valid JSON (${e.message}) - check the role values in the answers.`);
  }
  addArtifact(toPosix(ROLES_REL), ROLES_REL, rolesRendered);
  addArtifact(toPosix(path.join(AGENTS_DIR, 'writer.md')), path.join(AGENTS_DIR, 'writer.md'),
    renderTemplate(readTemplate(pluginRoot, 'agents', 'writer.md.tmpl'), context));
  // Unconditional, like the writer and for the mirror-image reason: the Writer is a Claude subagent
  // by definition, and the Orchestrator is the main session by definition. It is a rules document
  // rather than an agent definition - no frontmatter, no model, nothing dispatches it - so it reads
  // no roles key and the artifacts loop below treats it like any other managed whole file.
  addArtifact(toPosix(ORCHESTRATOR_REL), ORCHESTRATOR_REL,
    renderTemplate(readTemplate(pluginRoot, 'ORCHESTRATOR.md.tmpl'), context));
  // Unconditional as well: the file is what a Codex-hosted auditor reads, and a review class can move
  // to that host at any time, so the artifact is not tied to the configuration of the day. A project
  // whose audits all run on Claude carries a file nobody reads, which costs nothing.
  addArtifact(CODEX_AGENTS_REL, CODEX_AGENTS_REL,
    renderTemplate(readTemplate(pluginRoot, 'AGENTS.md.tmpl'), context));

  const stale = [];
  // reviewer.md is rendered for the Reviewer role OR for any claude-hosted review row (the row has
  // no other host to be dispatched through); qa.md follows its own role alone.
  const claudeHosted = { reviewer: reviewerAgentRendered(merged), qa: merged.roles.qa.engine === 'claude' };
  for (const role of ['reviewer', 'qa']) {
    const rel = path.join(AGENTS_DIR, `${role}.md`);
    if (claudeHosted[role]) {
      addArtifact(toPosix(rel), rel, renderTemplate(readTemplate(pluginRoot, 'agents', `${role}.md.tmpl`), context));
      continue;
    }
    // A rendered Claude agent file next to a codex-hosted role is a STALE RENDER (the self-check
    // fails on it). Whether it may be DELETED is decided in step 8 against the bookkeeping.
    if (readText(abs(rel)) !== null) stale.push({ rel, key: toPosix(rel) });
  }

  const claudeMdRendered = renderTemplate(readTemplate(pluginRoot, 'CLAUDE.md.tmpl'), context);
  const claudeRegion = regionOf(claudeMdRendered);
  const overridesRel = merged.paths.overridesDoc;

  // ---- 3. the managed whole files: overwrite, carrying the additions block ---
  // Every artifact is written from the render. A recorded file is simply re-rendered; a deleted one
  // is recreated; a file this installation has no record of is overwritten and named in the report
  // (`overwrote:`). The only consumer text that survives a render is the project additions block of
  // a Markdown file (carryProjectAdditions); a malformed block is a blocker, never a guess.
  const previousRegions = (previousAiwf && isPlainObject(previousAiwf.managedRegions)) ? previousAiwf.managedRegions : {};
  const isRecorded = (key) => Object.prototype.hasOwnProperty.call(previousRegions, key);
  const managedRegions = {};
  const stamp = (key) => { managedRegions[key] = pluginJson.version; };

  for (const artifact of artifacts) {
    const actual = readText(artifact.file);
    let content = artifact.content;
    let carried = false;
    if (artifact.rel.endsWith('.md')) {
      try {
        ({ text: content, carried } = carryProjectAdditions(actual, artifact.content, artifact.key));
      } catch (e) {
        if (!(e instanceof ProjectAdditionsError)) throw e;
        blockers.push(e.message);
        continue;
      }
    }
    stamp(artifact.key);
    if (actual !== null && lf(actual) === lf(content)) continue; // already exactly the render
    let why = 'created';
    if (actual !== null) {
      if (isRecorded(artifact.key)) why = 're-rendered';
      else {
        why = 'overwrote a file this installation had no record of';
        overwrote.push(artifact.key);
      }
    }
    if (carried) why += ' (project additions carried)';
    // A carried block keeps its own bytes (CRLF included), so that write is verbatim.
    actions.push({ kind: 'write', file: artifact.file, rel: artifact.rel, content, why, verbatim: carried });
  }

  // ---- 4. CLAUDE.md: create / append the region / re-render it --------------
  // Every branch that meets an existing file is a VERBATIM write: the existing bytes are spliced,
  // never re-encoded, and only the managed region is rendered - in the convention this file uses.
  const claudeFile = abs('CLAUDE.md');
  const claudeKey = `CLAUDE.md#${REGION_ID}`;
  const claudeActual = readText(claudeFile);
  if (claudeActual === null) {
    actions.push({ kind: 'write', file: claudeFile, rel: 'CLAUDE.md', content: claudeMdRendered, why: 'created with the managed region' });
    stamp(claudeKey);
  } else {
    const claudeEol = dominantEol(claudeActual);
    const start = claudeActual.indexOf(REGION_BEGIN);
    const end = claudeActual.indexOf(REGION_END);
    if (start === -1 && end === -1) {
      const joiner = claudeActual.endsWith('\n') ? '\n' : '\n\n';
      actions.push({
        kind: 'write', file: claudeFile, rel: 'CLAUDE.md', why: 'managed region appended (existing text untouched)',
        content: claudeActual + encodeEol(joiner + claudeRegion + '\n', claudeEol), verbatim: true,
      });
      stamp(claudeKey);
    } else if (start === -1 || end === -1 || end < start) {
      blockers.push(`CLAUDE.md carries only one of the ${REGION_ID} markers - setup will not guess where the managed region ends.`);
    } else {
      const actualRegion = claudeActual.slice(start, end + REGION_END.length);
      if (lf(actualRegion) !== lf(claudeRegion)) {
        const recorded = isRecorded(claudeKey);
        if (!recorded) overwrote.push(claudeKey);
        actions.push({
          kind: 'write', file: claudeFile, rel: 'CLAUDE.md',
          why: `managed region ${recorded ? 're-rendered' : 'overwrote a region this installation had no record of'} (text outside the markers preserved byte for byte)`,
          content: claudeActual.slice(0, start) + encodeEol(claudeRegion, claudeEol) + claudeActual.slice(end + REGION_END.length),
          verbatim: true,
        });
      }
      stamp(claudeKey);
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

  // ---- 5b. the transfer surface: written ONCE, and never bookkept ----------
  // The same one-time mechanism as the overrides document above, and deliberately NOTHING else: no
  // `addArtifact`, so no managed-region record, no resolvable address, and no migration operation may
  // ever address it. That is the whole design - the surface is where the operator collects
  // candidates, rulings, pass statistics and events, and an update that could re-render it would be
  // an update rewriting the operator's own notes. Absent -> seed the skeleton; present -> leave it
  // exactly as it is, byte for byte.
  //
  // `transferSurfaceRel` / `transferSurfaceFile` were resolved and JUDGED in step 1 - containment
  // through the real filesystem, no collision with a destination setup owns, and not an existing
  // non-file. Anything that reaches here has already survived all three, so `existsSync` below can
  // only be answering about a regular file.
  if (fs.existsSync(transferSurfaceFile)) {
    notes.push(`${transferSurfaceRel} already exists and is yours - setup never rewrites the transfer surface.`);
  } else {
    actions.push({
      kind: 'write', file: transferSurfaceFile, rel: transferSurfaceRel,
      why: 'transfer surface seeded once; unmanaged, never rewritten',
      content: renderTemplate(readTemplate(pluginRoot, 'PNP_CANDIDATES.md.tmpl'), context),
    });
  }

  // ---- 5c. the roadmap: written ONCE, and never bookkept --------------------
  // The transfer surface's mechanism, exactly: no `addArtifact`, no managed-region record. The COO
  // writes the entries; an update that could re-render the file would be rewriting them. Absent ->
  // seed the header; present -> leave it byte for byte. `roadmapRel` / `roadmapFile` were judged in
  // step 1 (containment, collision, not an existing non-file).
  if (fs.existsSync(roadmapFile)) {
    notes.push(`${roadmapRel} already exists and is yours - setup never rewrites the roadmap.`);
  } else {
    actions.push({
      kind: 'write', file: roadmapFile, rel: roadmapRel,
      why: 'roadmap seeded once; unmanaged, never rewritten',
      content: renderTemplate(readTemplate(pluginRoot, 'ROADMAP.md.tmpl'), context),
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

  let askPlan = { toAdd: [], toRemove: [], newlyTombstoned: [], ask: [], owned: [], suppressed: [], presentForeign: [] };
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
      const mergeWhy = `ask ruleset merged (+${askPlan.toAdd.length}`
        + (askPlan.toRemove.length ? ` / -${askPlan.toRemove.length} owned, no longer desired` : '')
        + ' rule(s), foreign rules untouched)';
      actions.push({
        kind: 'write', file: settingsFile, rel: SETTINGS_REL, content,
        why: settingsRaw === null ? 'created with the ask ruleset' : mergeWhy,
      });
    }
    for (const rule of askPlan.newlyTombstoned) {
      notes.push(`owned ask rule "${rule}" is absent from settings.json - recorded as a tombstone in _aiwf.suppressedAskRules and never forced back.`);
    }
    // A rule this engine wrote and no longer wants (a dropped payload rule, or a `<projectRoot>`
    // render carrying a root this project no longer has). Reported, never tombstoned: a tombstone
    // means the OPERATOR removed it.
    for (const rule of askPlan.toRemove) {
      notes.push(`owned ask rule "${rule}" is no longer in the payload's desired set for this project root - removed from settings.json and from _aiwf.ownedAskRules (not tombstoned: nobody removed it by hand).`);
    }
  }

  // ---- 7. directories ------------------------------------------------------
  // A plans directory that is already FULL is not an error - an operator may be pointing setup at
  // the plans this project keeps, on purpose. It is reported rather than adopted in silence:
  // `enforcement.dispatchGate: off-plan` reads every PLAN_*.md there as an active pnp plan, so a
  // Writer dispatch naming a ticket in one of them raises no dialog at all. Said in the plan and in
  // the report, so a --dry-run shows it before anything is written.
  {
    const warning = existingPlansWarning({ projectRoot, plansDir: merged.paths.plansDir });
    if (warning) notes.push(warning);
    const underScratch = plansDirUnderScratchWarning({ plansDir: merged.paths.plansDir, scratchDir: merged.paths.scratchDir, windowsPaths: merged.os === 'windows' });
    if (underScratch) notes.push(underScratch);
  }
  for (const rel of [merged.paths.scratchDir, path.join(merged.paths.plansDir, 'active'), path.join(merged.paths.plansDir, 'archive'), path.join(merged.paths.plansDir, 'drafts'), path.join(merged.paths.plansDir, 'readiness'), path.dirname(CONFIG_REL), AGENTS_DIR, path.dirname(overridesRel)]) {
    const dir = abs(rel);
    if (!fs.existsSync(dir)) actions.push({ kind: 'mkdir', file: dir, rel: toPosix(rel), why: 'created' });
  }

  // ---- 8. the stale-render destructive gate --------------------------------
  // TWO conditions before a file is deleted: its key is RECORDED in the bookkeeping, and the
  // operator passed the flag. A file at that path this installation never recorded is not a render
  // of ours and this configuration renders nothing there: it is LEFT ALONE and named in the report
  // (`left alone:`) - nothing about a file stops the run.
  const leftAlone = [];
  for (const { rel, key } of stale) {
    if (!isRecorded(key)) {
      leftAlone.push(key);
    } else if (!confirmRemoveStale) {
      blockers.push(`${toPosix(rel)} is a STALE render: the role is now codex-hosted, so a Claude agent file must not stay behind (the self-check fails on it). Nothing was deleted - re-run with --confirm-remove-stale to remove it.`);
    } else {
      actions.push({ kind: 'remove', file: abs(rel), rel: toPosix(rel), why: 'stale render: the role is codex-hosted (recorded, removal confirmed)' });
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
        : freshInstallMigration,
      managedRegions,
      ownedAskRules: askPlan.owned,
      suppressedAskRules: askPlan.suppressed,
    },
  });
  const errors = validate(config, activeSchema);
  if (errors.length) blockers.push(`the resulting config does not satisfy the schema:\n${formatErrors(errors)}`);
  // The one rule the schema subset cannot express (it compares two fields): a Claude review row runs
  // through the ONE reviewer agent file, so its exact id must be the id that file carries.
  const pinErrors = claudePinErrors(config);
  if (pinErrors.length) blockers.push(`the resulting config breaks the Claude pin rule:\n${pinErrors.map((e) => `  ${e}`).join('\n')}`);

  const configContent = jsonText(config);
  if (existingRaw === null || lf(existingRaw) !== lf(configContent)) {
    actions.push({
      kind: 'write', file: abs(CONFIG_REL), rel: toPosix(CONFIG_REL), content: configContent,
      why: existingRaw === null ? 'created' : 'updated',
    });
  }

  return { config, actions, blockers, notes, artifacts, askPlan, overwrote, leftAlone };
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
      // A VERBATIM action carries bytes that are already exactly what must land: the operator's own
      // text spliced around a region encoded in that file's convention. Normalising it here would
      // rewrite every line ending outside the markers - the very thing the contract forbids.
      fs.writeFileSync(action.file, action.verbatim ? action.content : lf(action.content), 'utf8');
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
  // Information, not a question: a file this installation had no record of was (or, in a dry run,
  // would be) replaced by the render. The project additions block is where text of yours survives.
  for (const key of report.overwrote || []) lines.push(`overwrote: ${key}`);
  // A file at a path this configuration renders nothing at, and that this installation never
  // recorded: not ours to write or to delete, so it stays - said once, never a blocker.
  for (const key of report.leftAlone || []) lines.push(`left alone: ${key} (not rendered by this configuration)`);
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
// A payload can be reached through a SYMLINK (macOS mounts its own os.tmpdir() behind one). Node
// resolves the entry to its REAL path before loading it, so `import.meta.url` is the real file while
// `process.argv[1]` keeps the link - comparing the two literally makes an entrypoint invoked through
// a link decide it is not main, do nothing and exit 0. Both sides go through realpath.
function isMain() {
  const real = (p) => { try { return fs.realpathSync(p); } catch { return p; } };
  const invoked = process.argv[1] ? real(path.resolve(process.argv[1])) : '';
  return invoked !== '' && invoked === real(path.resolve(fileURLToPath(import.meta.url)));
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
    const report = generateProject({
      pluginRoot, projectRoot, answers,
      confirmRemoveStale: has('--confirm-remove-stale'),
      dryRun: has('--dry-run'),
    });
    const seeds = (has('--no-seeds') || report.blocked || has('--dry-run')) ? [] : readMemorySeeds(pluginRoot);
    if (!has('--quiet') || report.blocked) console.log(formatReport(report, { projectRoot, seeds }));
    // The code is RETURNED, never forced: `process.exit()` would kill the run while this process's
    // OWN stdout write is still pending - a pipe is synchronous on Windows but asynchronous on POSIX
    // (Node, "A note on process I/O") - and the self-check report printed inside the call below would
    // reach the operator truncated. Same exit code, drained output.
    process.exitCode = finishWithSelfCheck({
      pluginRoot,
      projectRoot,
      code: report.blocked ? 1 : 0,
      wouldRun: !report.blocked && !has('--dry-run') && report.applied.length > 0,
      skipped: has('--no-selfcheck'),
      quiet: has('--quiet'),
      subject: 'the installed project layer',
    });
  } catch (e) {
    console.error(`setup: ${e.message}`);
    process.exit(e instanceof SetupError ? 1 : 2);
  }
}
