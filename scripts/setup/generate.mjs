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
 *     on disk, no bookkeeping entry       -> not ours to touch. Stop - unless the run is an ADOPT
 *                                            run, which is the one deliberate way to take ownership
 *                                            of pre-existing files (see below). Never a side effect.
 *   Nothing here overwrites in any branch, and content OUTSIDE the markers is never read as ours.
 *   A file is DELETED only when all three hold: it is recorded as ours, its content still hashes to
 *   the recorded render, and the operator passed --confirm-remove-stale. The flag confirms removing
 *   the stale render setup reported - not whatever happens to sit at that path.
 *
 * ADOPT MODE (--adopt) - installing into a project that ALREADY carries an AIWF surface
 *   A legacy project can hold hand-maintained copies of exactly the files this engine manages. Adopt
 *   BOOTSTRAPS the two-hash bookkeeping over what it finds instead of blocking, and it does that
 *   without a single silent write:
 *     the file is ABSENT              -> the ordinary fresh write, unchanged
 *     encountered content == render   -> adopted CLEAN in silence: local = upstream = hash(render),
 *                                        override false. Nothing is written (the bytes are already
 *                                        the render) and nothing is asked - the question would have
 *                                        exactly one answer.
 *     encountered content != render   -> a per-artifact OPERATOR DECISION, two words only:
 *                                        keep-mine (the default bootstrap): nothing is written,
 *                                          local = hash(yours), upstream = hash(render),
 *                                          override = true. `/pnp:update --resolve <key>` later
 *                                          reopens it with the full vocabulary, merge included.
 *                                        take-new: the render replaces the file; recorded clean.
 *                                        There is NO merge here on purpose: merging is the update
 *                                        engine's machinery, and a bootstrap has to stay decidable
 *                                        one file at a time.
 *   Adopt applies ONLY to files no bookkeeping records. A config carrying an `_aiwf` KEY - whatever
 *   its shape, a malformed one included - is refused outright (there is nothing to adopt, and a block
 *   this engine cannot read must not be stamped over; `/pnp:update --resolve` is that project's path),
 *   every conflict rule above keeps its exact force in both modes, and ADOPT NEVER DELETES
 *   ANYTHING - the report lists possible superseded legacy files as ADVISORY text and touches none
 *   of them. Text outside the CLAUDE.md markers, an existing overrides document and foreign
 *   permission rules stay untouchable in adopt mode exactly as everywhere else.
 *   Resolutions come from --adopt-file <json> (an artifact key -> "keep-mine" | "take-new"), or from
 *   an interactive prompt on a TTY. With neither, the run STOPS naming every address it needed - a
 *   guessed resolution is a silent overwrite with extra steps. --dry-run never asks: it prints the
 *   classification, marks the pending decisions and writes nothing.
 *
 * HASHES are sha256 over the LF-normalised text, so a CRLF checkout does not read as an edit. That
 * is about COMPARING, never about writing: CLAUDE.md - the one managed file that also holds the
 * operator's own text - is written back with its existing bytes untouched and only the managed
 * region re-encoded into the line-ending convention that file already uses. Normalising the whole
 * file would rewrite every line around the markers, which is exactly what "text outside the markers
 * is never touched" forbids.
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
 *                     [--confirm-remove-stale] [--adopt] [--adopt-file <json>] [--no-seeds]
 *                     [--dry-run] [--quiet] [--no-selfcheck]
 *   exit 0 = applied (or dry-run clean); exit 1 = blocked with nothing written, or a red/unrunnable
 *   self-check after a successful write; exit 2 = cannot start.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { previewLines, promptSync } from './dialog.mjs';
import { collectDefaults, formatErrors, loadSchema, validate } from './validate-config.mjs';
import { validatePayload } from '../update/validate-payload.mjs';
import { finishWithSelfCheck } from '../selfcheck/run-selfcheck.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PLUGIN_ROOT = path.resolve(HERE, '..', '..');

export const SUPPORTED_OS = ['windows', 'linux', 'macos'];
export const CONFIG_REL = path.join('.claude', 'aiwf-native', 'aiwf.config.json');
export const ROLES_REL = path.join('.claude', 'aiwf-native', 'roles.json');
export const SETTINGS_REL = path.join('.claude', 'settings.json');
const AGENTS_DIR = path.join('.claude', 'agents');
const REGION_ID = 'aiwf-core';
const REGION_BEGIN = `<!-- BEGIN ${REGION_ID} -->`;
const REGION_END = `<!-- END ${REGION_ID} -->`;
// Stand-in bookkeeping, used ONLY to shape-check the answers before the real block exists. Never
// written anywhere, and deliberately NOT the fresh-install stamp: the real _aiwf is built at the end
// of the plan, and its lastMigrationApplied is READ FROM THE PAYLOAD MANIFEST (see planInstall).
const PROBE_AIWF = {
  installedPluginVersion: '0.0.0',
  lastMigrationApplied: '0000_probe',
  migrationJournal: null,
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

// The three review classes, in the order /pnp:roles prints them. ONE definition: the schema, the
// resolver contract, the renderer and the table all mean the same three words.
export const REVIEW_CLASSES = ['plan', 'code', 'docs'];

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
 *   model  = the Reviewer's own model when the Reviewer is claude-hosted, otherwise `fable` - the
 *            top tier, because a claude-hosted ROW still dispatches through this file and an auditor
 *            below the author is not an audit. `/pnp:review` passes the ROW's model as the Agent
 *            tool's `model` override at dispatch time.
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
  };
}

// ---------------------------------------------------------------------------
// Adopt mode
// ---------------------------------------------------------------------------
// The whole vocabulary, and it is deliberately SHORTER than the update engine's: `merge` is not an
// option at bootstrap time. Merging needs a base to merge against, and the base is exactly what a
// project that never had this bookkeeping does not have; keep-mine + `/pnp:update --resolve <key>`
// reaches the same place through the machinery built for it.
export const ADOPT_RESOLUTIONS = ['keep-mine', 'take-new'];

export const ADOPT_ALREADY_INSTALLED =
  '--adopt is for a project that carries a legacy AIWF surface, and this project already has an '
  + 'installation recorded in _aiwf - there is nothing here to adopt. Re-run without --adopt, and use '
  + '`/pnp:update --resolve <key>` to re-decide a single artifact.';

/**
 * The `--adopt` refusal, decided on the PRESENCE of the `_aiwf` key, never on its shape - and shared
 * by both entrypoints so they cannot disagree about the same config. A malformed block (`null`, a
 * list, a string) is the case that matters: it is bookkeeping this engine cannot read, and adopting
 * over it would REPLACE it with a freshly stamped one, destroying whatever record it held. Refusing
 * is the fail-closed answer; repairing it is not adopt's job.
 * Returns the refusal message, or null when --adopt may proceed.
 */
export function adoptRefusal(existingConfig) {
  if (!isPlainObject(existingConfig)) return null;
  if (!Object.prototype.hasOwnProperty.call(existingConfig, '_aiwf')) return null;
  if (isPlainObject(existingConfig._aiwf)) return ADOPT_ALREADY_INSTALLED;
  const found = existingConfig._aiwf === null ? 'null' : (Array.isArray(existingConfig._aiwf) ? 'a list' : typeof existingConfig._aiwf);
  return `${toPosix(CONFIG_REL)} carries an "_aiwf" key that is not a bookkeeping object (found ${found}) - `
    + '--adopt refuses rather than stamp a fresh block over bookkeeping it cannot read, because whatever that '
    + 'key was meant to record would be gone. Fix or remove the key deliberately, then re-run.';
}

/**
 * One entry of an adopt file: an artifact key mapped to one of the two words. Anything else STOPS
 * the run naming the address - a resolution that had to be interpreted is not a resolution.
 */
export function checkAdoptRecord(value, address) {
  const where = `adopt resolution for "${address}"`;
  if (value === 'merge') {
    throw new SetupError(
      `${where}: adopt has no "merge" - a bootstrap has no recorded base to merge against. Adopt it as `
      + `"keep-mine" and then run \`/pnp:update --resolve ${address}\`, which does have the merge path.`,
    );
  }
  if (typeof value !== 'string' || !ADOPT_RESOLUTIONS.includes(value)) {
    throw new SetupError(
      `${where}: must be ${ADOPT_RESOLUTIONS.map((r) => `"${r}"`).join(' or ')}, found ${JSON.stringify(value)} - `
      + 'an adopt file maps an artifact key directly to one of those two words.',
    );
  }
  return value;
}

// An adopt resolver is `(key, info) => { resolution }` or `{ pending: true, blocking, reason }`.
// "Pending" is not an error: a dry run has nobody to ask on purpose, and a non-interactive run with
// no file has nobody to ask by accident - the first is a preview, the second is a blocker, and the
// resolver is what knows which. A MALFORMED answer is different from no answer and throws.

/** The dry-run adapter: classify everything, decide nothing, block nothing. */
export const adoptPreviewResolver = () => () => ({
  pending: true,
  blocking: false,
  reason: 'a dry run never asks - the classification above is exactly what this preview exists to show. '
    + 'Answer it with --adopt-file, or run without --dry-run.',
});

/** The adapter that cannot answer at all: a non-interactive run with no adopt file. */
export function adoptStopResolver(reason) {
  return () => ({ pending: true, blocking: true, reason });
}

/**
 * The scripted adapter. A missing entry does not throw: it is reported as a pending decision, so one
 * run names every address the file still has to answer instead of one per re-run. `knownAddresses`
 * is read back by the planner, which refuses a file naming an address this run never had to decide -
 * an unconsumed address is a typo or a stale table, and proceeding on it means the operator's
 * decision went somewhere nobody read.
 *
 * `dryRun` makes an unanswered address NON-blocking. A partially filled adopt file is the normal way
 * to work through a large legacy surface, and the preview is what tells the operator which addresses
 * are still open; a dry run that exits 1 on an unanswered decision would refuse to show exactly the
 * thing it exists to show. The answered entries are still applied as classification in that preview.
 */
export function adoptFileResolver(table, { label = 'the adopt file', dryRun = false } = {}) {
  if (!isPlainObject(table)) {
    throw new SetupError(`${label} must be a JSON object mapping an artifact key to "keep-mine" or "take-new".`);
  }
  const resolver = (key) => {
    if (!Object.prototype.hasOwnProperty.call(table, key)) {
      return {
        pending: true,
        blocking: !dryRun,
        reason: `${label} has no entry for it - add ${JSON.stringify(key)}: "keep-mine" (keep what is on disk) `
          + `or "take-new" (let the payload render replace it). Nothing is guessed.${dryRun ? ' (This is a dry run: nothing was written either way.)' : ''}`,
      };
    }
    return { resolution: checkAdoptRecord(table[key], key) };
  };
  resolver.knownAddresses = Object.keys(table);
  resolver.label = label;
  return resolver;
}

/** The interactive adapter: shows both sides and asks. The transport is injectable for tests. */
export function adoptInteractiveResolver({ prompt = promptSync, log = console.log } = {}) {
  return (key, info) => {
    log(`\nADOPT ${key}`);
    log('  this file is already here and PromptAndPray did not write it, and it differs from the render.');
    for (const line of previewLines('yours  ', info.actual)) log(line);
    for (const line of previewLines('payload', info.render)) log(line);
    for (;;) {
      const answer = prompt(`  ${ADOPT_RESOLUTIONS.join(' / ')}: `);
      if (ADOPT_RESOLUTIONS.includes(answer)) return { resolution: answer };
      if (answer === 'merge') {
        log(`  adopt has no merge - take "keep-mine" now and run \`/pnp:update --resolve ${key}\` to merge.`);
        continue;
      }
      log(`  answer with one of: ${ADOPT_RESOLUTIONS.join(', ')}`);
    }
  };
}

/** Builds the resolver a CLI run needs. Both setup entrypoints go through this one function. */
export function makeAdoptResolver({ adoptFile, dryRun = false, interactive = process.stdin.isTTY } = {}) {
  if (adoptFile) {
    const file = path.resolve(adoptFile);
    let table;
    try { table = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
      throw new SetupError(`--adopt-file "${file}" cannot be read (${e.message}).`);
    }
    // dryRun is threaded INTO the file adapter rather than checked before it: a partially answered
    // file plus --dry-run must preview (the answered entries classified, the rest pending), not stop.
    return adoptFileResolver(table, { label: `--adopt-file ${path.basename(file)}`, dryRun });
  }
  if (dryRun) return adoptPreviewResolver();
  if (interactive) return adoptInteractiveResolver();
  return adoptStopResolver('this run is not interactive and no --adopt-file was passed, so there is nobody to ask.');
}

// ---------------------------------------------------------------------------
// The ADVISORY superseded-legacy inventory
// ---------------------------------------------------------------------------
// A legacy AIWF surface is more than the artifacts this engine manages: hooks, wrappers, doctrine
// docs and command files were maintained by hand before the payload existed. Setup reports the ones
// whose NAME matches something the payload now ships, and stops there. It reads; it never proposes a
// command, never stages a deletion and never touches a byte - removing any of them is a separate,
// operator-gated step, and a name match is a hint, not a verdict about what a file contains.
const SCAN_SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build']);
export const SCAN_MAX_HITS = 200;
export const SCAN_MAX_DIRS = 2000;
export const SCAN_MAX_DEPTH = 8;
export const SCAN_MAX_PER_DIR = 2000;

// The five ways this scan can stop before it has seen everything. Each one is a REASON the list is a
// sample, and each is reported by name: a bounded scan whose result cannot say "I stopped early" is
// indistinguishable from a complete one, and the operator reads this list to decide what to delete.
// The hit cap alone is not a traversal bound either - a sparse tree with no matches would satisfy it
// forever while reading every directory in the repository.
export const SCAN_STOP_REASONS = {
  hitLimit: 'the list cap was reached',
  traversal: 'the directory-read budget was reached',
  depth: 'a tree deeper than this scan follows',
  perDir: 'a directory with more entries than this scan reads',
  unreadable: 'a directory that could not be read',
};

function readdirNames(dir, filter) {
  try { return fs.readdirSync(dir).filter(filter); } catch { return []; }
}

/**
 * Walks one class root and pushes ONLY the matches. Filtering after a full walk would read an entire
 * repository into memory to produce an advisory paragraph, and one wide directory is all that takes.
 *
 * TWO INDEPENDENT BUDGETS, because they bound different things: `limit` caps the HITS (how long the
 * printed list may get) and `maxDirs` caps the TRAVERSAL (how much of the tree may be read at all).
 * A hit cap is no traversal bound - with nothing matching, it is never reached. Both, plus the depth
 * and per-directory cutoffs and an unreadable directory, mark the run truncated with their cause.
 * `readdir`, `limit`, `maxDirs` and `maxPerDir` are injectable so every bound is testable without a
 * fixture the size of the thing it is protecting against.
 */
function walkMatches(dir, base, budget, match, hits, depth = 0) {
  if (hits.length >= budget.limit) { budget.causes.hitLimit = true; return; }
  if (budget.dirsRead >= budget.maxDirs) { budget.causes.traversal = true; return; }
  if (depth > SCAN_MAX_DEPTH) { budget.causes.depth = true; return; }
  let entries = [];
  try { entries = budget.readdir(dir); } catch { budget.causes.unreadable = true; return; }
  budget.dirsRead += 1;
  if (entries.length > budget.maxPerDir) { entries = entries.slice(0, budget.maxPerDir); budget.causes.perDir = true; }
  for (const entry of entries) {
    if (hits.length >= budget.limit) { budget.causes.hitLimit = true; return; }
    if (budget.dirsRead >= budget.maxDirs) { budget.causes.traversal = true; return; }
    if (SCAN_SKIP_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkMatches(p, base, budget, match, hits, depth + 1); continue; }
    const found = match(entry.name);
    if (found) hits.push({ rel: toPosix(path.relative(base, p)), ...found });
  }
}

const stemOf = (name) => name.replace(/\.[^.]+$/, '');

/**
 * Returns { hits: [{ rel, what, why }], truncated, causes, dirsRead } - advisory only, sorted, and
 * bounded in BOTH directions (hits and directories read). `truncated` and the named `causes` are
 * part of the result because a capped list presented as a complete one would be a quiet lie in
 * exactly the report an operator uses to decide what to remove.
 */
export function scanSupersededLegacy({
  pluginRoot, projectRoot,
  readdir = (d) => fs.readdirSync(d, { withFileTypes: true }),
  limit = SCAN_MAX_HITS,
  maxDirs = SCAN_MAX_DIRS,
  maxPerDir = SCAN_MAX_PER_DIR,
}) {
  const skills = readdirNames(path.join(pluginRoot, 'skills'), (n) => fs.existsSync(path.join(pluginRoot, 'skills', n, 'SKILL.md')));
  const classes = [
    {
      what: 'hook',
      root: path.join('.claude', 'hooks'),
      names: new Set(readdirNames(path.join(pluginRoot, 'scripts', 'engine'), (n) => n.endsWith('.js'))),
      why: 'the payload ships a hook script of this name under scripts/engine/',
    },
    {
      what: 'wrapper',
      root: path.join('scripts', 'native'),
      names: new Set([
        ...readdirNames(path.join(pluginRoot, 'scripts', 'native', 'ps'), (n) => n.endsWith('.ps1')),
        ...readdirNames(path.join(pluginRoot, 'scripts', 'native', 'sh'), (n) => n.endsWith('.sh')),
      ]),
      why: 'the payload ships a wrapper of this name under scripts/native/',
    },
    {
      what: 'doctrine doc',
      root: 'docs',
      names: new Set(readdirNames(path.join(pluginRoot, 'docs'), (n) => n.endsWith('.md'))),
      why: 'the payload carries a document of this name under docs/',
    },
    {
      what: 'command file',
      root: path.join('.claude', 'commands'),
      names: new Set(skills),
      byStem: true,
      why: 'the payload ships a /pnp: skill of this name',
    },
  ];

  const budget = { limit, maxDirs, maxPerDir, readdir, dirsRead: 0, causes: {} };
  const hits = [];
  for (const cls of classes) {
    if (cls.names.size === 0) continue;
    const dir = path.join(projectRoot, cls.root);
    if (!fs.existsSync(dir)) continue;
    // The budgets are checked HERE too, not only inside the walk: a limit reached exactly at the end
    // of one class root would otherwise leave the next root unvisited and the result claiming to be
    // complete - the whole point being that this class of file lives under FOUR different roots.
    if (hits.length >= budget.limit) { budget.causes.hitLimit = true; continue; }
    if (budget.dirsRead >= budget.maxDirs) { budget.causes.traversal = true; continue; }
    const match = (name) => (cls.names.has(cls.byStem ? stemOf(name) : name) ? { what: cls.what, why: cls.why } : null);
    walkMatches(dir, projectRoot, budget, match, hits);
  }
  hits.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  const causes = Object.keys(SCAN_STOP_REASONS).filter((k) => budget.causes[k] === true);
  return { hits, truncated: causes.length > 0, causes, dirsRead: budget.dirsRead };
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
 * Returns { config, actions, blockers, notes, artifacts, askPlan, adopt } - `actions` is what
 * apply() will do, and `adopt` is null unless this is an adopt run.
 */
export function planInstall({
  pluginRoot, projectRoot, answers, confirmRemoveStale = false, schema,
  adopt = false, resolveAdopt = null,
}) {
  const blockers = [];
  const notes = [];
  const actions = [];
  const abs = (rel) => path.join(projectRoot, rel);
  // The inventory of what adopt met, and the decision taken on each - reported whether the run ends
  // written, blocked or previewed, because it is the operator's map of the surface already there.
  const adoptEntries = [];
  const adoptAsked = new Set();
  const stopped = () => ({ config: null, actions: [], blockers, notes, artifacts: [], askPlan: null, adopt: null });
  const resolveAdoptFn = resolveAdopt
    || adoptStopResolver('this run supplied no adopt resolver at all, so there is nobody to ask.');

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
  const previousAiwf = (existing && isPlainObject(existing._aiwf)) ? existing._aiwf : null;
  // Adopt is a BOOTSTRAP. Re-adopting a project this engine already records would mean deciding
  // again about files whose ownership is already written down - which is `/pnp:update --resolve`,
  // a different mechanism with a journal behind it. Refused in one line, before anything is read,
  // on the PRESENCE of the key rather than on its shape (see adoptRefusal).
  if (adopt) {
    const refusal = adoptRefusal(existing);
    if (refusal) { blockers.push(refusal); return stopped(); }
  }
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
  for (const key of ['scratchDir', 'plansDir', 'overridesDoc']) {
    const value = merged.paths[key];
    const outside = path.isAbsolute(value) || path.relative(projectRoot, path.resolve(projectRoot, value)).split(/[\\/]/)[0] === '..';
    if (outside) blockers.push(`paths.${key} ("${value}") is not inside the project - configured paths are project-relative.`);
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

  // The advice DEPENDS on whether this project has an installation, because --adopt is refused on one
  // that has: pointing a recorded project at a flag it cannot use would be a dead end in a message
  // whose whole job is to say what to do next.
  const adoptHint = previousAiwf
    ? 'This project already has an installation, so --adopt is not the path (it bootstraps a project that has '
      + 'none): move the file aside and re-run, or remove it deliberately if it is a leftover.'
    : 'Re-run with --adopt to bootstrap ownership over the AIWF surface already here (an identical file is '
      + 'adopted silently, a different one asks you first, and nothing is ever deleted), or move it aside.';
  const unrecordedArtifact = (key) =>
    `${key} already exists but is not recorded in _aiwf.managedRegions - setup will not take over a file `
    + `it did not write. ${adoptHint}`;

  /**
   * The adopt classification for ONE unrecorded pre-existing artifact. Returns the decision and
   * RECORDS the inventory entry; the caller does the stamping, because what a decision means for
   * the bookkeeping is the caller's business (a whole file and a marker region hash different
   * things). `identical` never reaches the resolver: that question has exactly one answer.
   */
  const adoptDecide = (key, actualContent, renderContent) => {
    if (sha256(actualContent) === sha256(renderContent)) {
      adoptEntries.push({ key, state: 'identical', resolution: null, pending: false });
      return { identical: true };
    }
    adoptAsked.add(key);
    const answer = resolveAdoptFn(key, { key, actual: actualContent, render: renderContent }) || {};
    if (answer.pending) {
      adoptEntries.push({
        key, state: 'different', resolution: null, pending: true, reason: answer.reason,
        actual: actualContent, render: renderContent,
      });
      return { pending: true, blocking: answer.blocking === true, reason: answer.reason };
    }
    if (!ADOPT_RESOLUTIONS.includes(answer.resolution)) {
      throw new SetupError(
        `the adopt resolver answered ${JSON.stringify(answer.resolution)} for "${key}" - the vocabulary is `
        + `${ADOPT_RESOLUTIONS.join(' and ')}, and nothing is guessed from anything else.`,
      );
    }
    adoptEntries.push({
      key, state: 'different', resolution: answer.resolution, pending: false,
      actual: actualContent, render: renderContent,
    });
    return { resolution: answer.resolution };
  };

  /** Records a pending decision. Blocking or not, NOTHING is stamped and nothing is written. */
  const adoptPending = (key, decision) => {
    if (decision.blocking) {
      blockers.push(`${key} is already here and PromptAndPray did not write it, so adopt needs a decision on it: ${decision.reason}`);
    } else {
      notes.push(`${key}: adopt decision pending - ${decision.reason}`);
    }
  };

  // keep-mine is the ONLY branch that writes an asymmetric record: `local` describes what stays on
  // disk (the operator's file), `upstream` what the payload would have written, and `override` says
  // a human chose between them. A later /pnp:update reads exactly this and re-applies nothing.
  const stampKeepMine = (key, renderContent, actualContent) => {
    managedRegions[key] = { upstream: sha256(renderContent), local: sha256(actualContent), override: true };
  };

  for (const artifact of artifacts) {
    const actual = readText(artifact.file);
    const previous = previousRegions[artifact.key];
    if (actual === null) {
      if (previous) { blockers.push(deletedArtifact(artifact.key)); continue; }
      if (adopt) adoptEntries.push({ key: artifact.key, state: 'absent', resolution: null, pending: false });
      actions.push({ kind: 'write', file: artifact.file, rel: artifact.rel, content: artifact.content, why: 'created' });
      stamp(artifact.key, artifact.content, null);
      continue;
    }
    if (!previous) {
      if (!adopt) { blockers.push(unrecordedArtifact(artifact.key)); continue; }
      const decision = adoptDecide(artifact.key, actual, artifact.content);
      if (decision.pending) { adoptPending(artifact.key, decision); continue; }
      if (decision.identical) {
        // The bytes on disk ALREADY are the render, so there is nothing to write and nothing to ask:
        // adopting it clean is a bookkeeping fact, not a change to the project.
        stamp(artifact.key, artifact.content, null);
        continue;
      }
      if (decision.resolution === 'take-new') {
        actions.push({
          kind: 'write', file: artifact.file, rel: artifact.rel, content: artifact.content,
          why: 'adopted take-new: the payload render replaces the file that was here',
        });
        stamp(artifact.key, artifact.content, null);
        continue;
      }
      stampKeepMine(artifact.key, artifact.content, actual); // keep-mine: not one byte is written
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
      if (adopt) adoptEntries.push({ key: claudeKey, state: 'absent', resolution: null, pending: false });
      actions.push({ kind: 'write', file: claudeFile, rel: 'CLAUDE.md', content: claudeMdRendered, why: 'created with the managed region' });
      stamp(claudeKey, claudeRegion, null);
    }
  } else {
    // Every branch below writes a file that already carries the operator's text, so all of them are
    // VERBATIM writes: the existing bytes are spliced, never re-encoded, and only the managed region
    // is rendered - in the convention this file already uses.
    const claudeEol = dominantEol(claudeActual);
    const regionBytes = () => encodeEol(claudeRegion, claudeEol);
    const start = claudeActual.indexOf(REGION_BEGIN);
    const end = claudeActual.indexOf(REGION_END);
    if (start === -1 && end === -1) {
      // The file is here but the markers are not. With a bookkeeping entry that means the REGION was
      // deleted out of the file - a manual edit again, so appending a fresh one would silently undo
      // it. Without an entry it is an ordinary CLAUDE.md that has never been managed: append. Adopt
      // changes NOTHING here: the region is absent, so there is no encountered content to decide
      // about, and the append already leaves every existing line where it was.
      if (previousClaude) { blockers.push(deletedArtifact(claudeKey)); } else {
        if (adopt) adoptEntries.push({ key: claudeKey, state: 'absent', resolution: null, pending: false });
        const joiner = claudeActual.endsWith('\n') ? '\n' : '\n\n';
        actions.push({
          kind: 'write', file: claudeFile, rel: 'CLAUDE.md', why: 'managed region appended (existing text untouched)',
          content: claudeActual + encodeEol(joiner + claudeRegion + '\n', claudeEol), verbatim: true,
        });
        stamp(claudeKey, claudeRegion, null);
      }
    } else if (start === -1 || end === -1 || end < start) {
      blockers.push(`CLAUDE.md carries only one of the ${REGION_ID} markers - setup will not guess where the managed region ends.`);
    } else {
      const actualRegion = claudeActual.slice(start, end + REGION_END.length);
      const spliceRegion = (replacement) => claudeActual.slice(0, start) + replacement + claudeActual.slice(end + REGION_END.length);
      if (!previousClaude && !adopt) {
        blockers.push(
          `CLAUDE.md already carries an ${REGION_ID} region that is not recorded in _aiwf.managedRegions - `
          + `setup will not take it over. ${adoptHint} (The text OUTSIDE the markers is yours and is never `
          + 'read as ours, in every branch including adopt.)',
        );
      } else if (!previousClaude) {
        // ADOPT over the REGION only. Every branch below rewrites at most the marked span, so the
        // operator's own CLAUDE.md text is untouched here exactly as it is everywhere else.
        const decision = adoptDecide(claudeKey, actualRegion, claudeRegion);
        if (decision.pending) adoptPending(claudeKey, decision);
        else if (decision.identical) stamp(claudeKey, claudeRegion, null);
        else if (decision.resolution === 'take-new') {
          actions.push({
            kind: 'write', file: claudeFile, rel: 'CLAUDE.md', content: spliceRegion(regionBytes()), verbatim: true,
            why: 'adopted take-new: the managed region was replaced by the render (text outside the markers preserved byte for byte)',
          });
          stamp(claudeKey, claudeRegion, null);
        } else {
          stampKeepMine(claudeKey, claudeRegion, actualRegion); // keep-mine: CLAUDE.md is not written at all
        }
      } else if (sha256(actualRegion) !== previousClaude.local) {
        blockers.push(`${claudeKey} was edited by hand inside the markers. Nothing was overwritten - resolve it with \`/pnp:update --resolve ${claudeKey}\`. (Text OUTSIDE the markers is yours and is never read as ours.)`);
      } else if (previousClaude.override === true) {
        notes.push(`${claudeKey} is held by the operator (override) - the new render was recorded as upstream, not applied.`);
        stamp(claudeKey, claudeRegion, previousClaude);
      } else {
        if (sha256(actualRegion) !== sha256(claudeRegion)) {
          actions.push({
            kind: 'write', file: claudeFile, rel: 'CLAUDE.md', why: 'managed region re-rendered (text outside the markers preserved byte for byte)',
            content: spliceRegion(regionBytes()), verbatim: true,
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

  let askPlan = { toAdd: [], toRemove: [], newlyTombstoned: [], ask: [], owned: [], suppressed: [] };
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
      // --adopt does not reach this path either, and that is not an oversight: this configuration
      // renders NO artifact at that path (the role is codex-hosted), so there is no render to adopt
      // the file as - ownership of a file the payload would never write again is not ownership.
      blockers.push(`${key} exists but is not recorded in _aiwf.managedRegions - setup will not adopt (or delete) a file it did not write, even though the ${key.includes('reviewer') ? 'reviewer' : 'qa'} role is codex-hosted now. --adopt does not cover it: this configuration renders nothing at that path, so there is nothing to take ownership OF. Move it aside and re-run.`);
    } else if (sha256(actual) !== previous.local) {
      blockers.push(`${key} is a stale render that was ALSO edited by hand (its content no longer matches the recorded local hash), so it is not the file the removal flag confirms. Nothing was deleted - resolve it with \`/pnp:update --resolve ${key}\`.`);
    } else if (!confirmRemoveStale) {
      blockers.push(`${toPosix(rel)} is a STALE render: the role is now codex-hosted, so a Claude agent file must not stay behind (the self-check fails on it). Nothing was deleted - re-run with --confirm-remove-stale to remove it.`);
    } else {
      actions.push({ kind: 'remove', file: abs(rel), rel: toPosix(rel), why: 'stale render: the role is codex-hosted (recorded, unmodified, removal confirmed)' });
    }
  }

  // ---- 8b. adopt: the answers nobody asked for, and the advisory inventory ---
  // An adopt file naming an address this run never had to decide is a typo, a copy from another
  // project, or a leftover from a previous attempt - and in all three cases an operator decision was
  // written down and then read by nobody. Named, not ignored.
  if (adopt && Array.isArray(resolveAdoptFn.knownAddresses)) {
    const unused = resolveAdoptFn.knownAddresses.filter((key) => !adoptAsked.has(key));
    if (unused.length) {
      blockers.push(
        `${resolveAdoptFn.label || 'the adopt file'} answers ${unused.length} address(es) this run never had to `
        + `decide: ${unused.join(', ')}. Either the key is misspelled, or that artifact is absent or already `
        + 'identical to the render here - nothing was written, and no answer was applied to a different file.',
      );
    }
  }
  const supersededScan = adopt ? scanSupersededLegacy({ pluginRoot, projectRoot }) : null;
  const adoptReport = adopt
    ? {
      entries: adoptEntries,
      superseded: supersededScan.hits,
      supersededTruncated: supersededScan.truncated,
      supersededCauses: supersededScan.causes,
    }
    : null;

  // ---- 9. the final config, and it must validate ---------------------------
  const config = orderConfig({
    ...merged,
    $schema: toPosix(path.join(pluginRoot, 'schema', 'aiwf.config.schema.json')),
    _aiwf: {
      installedPluginVersion: pluginJson.version,
      lastMigrationApplied: (previousAiwf && typeof previousAiwf.lastMigrationApplied === 'string' && previousAiwf.lastMigrationApplied)
        ? previousAiwf.lastMigrationApplied
        : freshInstallMigration,
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

  return { config, actions, blockers, notes, artifacts, askPlan, adopt: adoptReport };
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
  // A pending adopt decision must never survive into a run that WRITES. Only the preview resolver
  // produces a non-blocking one, and it exists for --dry-run alone; pairing it with a real write
  // would stamp a config that quietly forgets an artifact this run met and decided nothing about.
  const pending = plan.adopt ? plan.adopt.entries.filter((e) => e.pending) : [];
  if (!options.dryRun && pending.length) {
    plan.blockers.push(
      `${pending.length} adopt decision(s) are still unanswered (${pending.map((e) => e.key).join(', ')}) - `
      + 'a run that writes never proceeds past one. Answer them with --adopt-file, or re-run interactively.',
    );
  }
  if (plan.blockers.length || options.dryRun) return { ...plan, applied: [], blocked: plan.blockers.length > 0 };
  const applied = applyPlan(plan);
  return { ...plan, applied, blocked: false };
}

const ADOPT_VERDICT = {
  absent: 'absent    - not here yet, written fresh',
  identical: 'identical - adopted clean (nothing written, nothing to decide)',
  pending: 'different - DECISION PENDING',
  'keep-mine': 'different - keep-mine: yours stays, the render is recorded as upstream (override)',
  'take-new': 'different - take-new: the render replaces yours, recorded clean',
};

/**
 * The adopt half of the report: what was already here, how it was classified, what was decided -
 * and the ADVISORY list of files whose names the payload now also ships. Printed on a blocked run
 * too, because that is exactly the run whose operator needs the map in order to answer.
 */
function adoptLines(adopt) {
  if (!adopt) return [];
  const lines = ['', 'ADOPT - the AIWF surface already in this project:'];
  if (!adopt.entries.length) lines.push('  (no managed artifact of this configuration exists here yet)');
  for (const entry of adopt.entries) {
    const verdict = ADOPT_VERDICT[entry.pending ? 'pending' : (entry.resolution || entry.state)];
    lines.push(`  ${entry.key.padEnd(34)} ${verdict}`);
    if (entry.pending) lines.push(`    ${entry.reason}`);
    if (entry.state === 'different') {
      for (const l of previewLines('yours  ', entry.actual, 4)) lines.push(`  ${l}`);
      for (const l of previewLines('payload', entry.render, 4)) lines.push(`  ${l}`);
    }
  }
  // A TRUNCATED scan is reported even when it found nothing: "no superseded files" and "I stopped
  // looking before I had seen everything" are different statements, and printing neither is how the
  // second one gets read as the first.
  if (adopt.superseded.length || adopt.supersededTruncated) {
    const count = adopt.supersededTruncated ? `${adopt.superseded.length}+` : `${adopt.superseded.length}`;
    lines.push('', `possible superseded legacy files (${count}) - ADVISORY, nothing was touched:`);
    for (const s of adopt.superseded) lines.push(`  ${s.rel}  (${s.what}: ${s.why})`);
    if (adopt.supersededTruncated) {
      const why = (adopt.supersededCauses || []).map((c) => SCAN_STOP_REASONS[c]).filter(Boolean);
      lines.push(`  (the scan STOPPED EARLY - ${why.join('; ') || 'a scan bound was reached'} - so this is a`);
      lines.push('   sample, not an inventory: there may be more it never looked at.)');
    }
    lines.push('  Setup never deletes any of these. Removing one is a separate step and your decision.');
  }
  return lines;
}

export function formatReport(report, { projectRoot, seeds = [] }) {
  const lines = [];
  lines.push(`project: ${projectRoot}`);
  if (report.blocked) {
    lines.push(...adoptLines(report.adopt));
    lines.push('', 'BLOCKED - nothing was written:');
    for (const b of report.blockers) lines.push(`  - ${b}`);
    return lines.join('\n');
  }
  lines.push(...adoptLines(report.adopt));
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
    const adopt = has('--adopt');
    if (!adopt && has('--adopt-file')) throw new SetupError('--adopt-file only means something with --adopt - a resolution file for a mode this run is not in would be read by nobody.');
    // A missing value must not degrade into "no file": the next flag would be read as a path, or the
    // run would silently fall back to having nobody to ask. Same shape as --resolve in /pnp:update.
    const adoptFileArg = flag('--adopt-file');
    if (has('--adopt-file') && (!adoptFileArg || adoptFileArg.startsWith('--'))) {
      throw new SetupError('--adopt-file needs the path of the JSON file that answers the adopt decisions.');
    }
    const report = generateProject({
      pluginRoot, projectRoot, answers,
      confirmRemoveStale: has('--confirm-remove-stale'),
      dryRun: has('--dry-run'),
      adopt,
      resolveAdopt: adopt ? makeAdoptResolver({ adoptFile: adoptFileArg, dryRun: has('--dry-run') }) : null,
    });
    const seeds = (has('--no-seeds') || report.blocked || has('--dry-run')) ? [] : readMemorySeeds(pluginRoot);
    if (!has('--quiet') || report.blocked) console.log(formatReport(report, { projectRoot, seeds }));
    process.exit(finishWithSelfCheck({
      pluginRoot,
      projectRoot,
      code: report.blocked ? 1 : 0,
      wouldRun: !report.blocked && !has('--dry-run') && report.applied.length > 0,
      skipped: has('--no-selfcheck'),
      quiet: has('--quiet'),
      subject: 'the installed project layer',
    }));
  } catch (e) {
    console.error(`setup: ${e.message}`);
    process.exit(e instanceof SetupError ? 1 : 2);
  }
}
