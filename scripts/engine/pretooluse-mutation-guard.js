'use strict';
/*
 * Gate 1 — PreToolUse(Edit|Write|MultiEdit|NotebookEdit). TWO of the loop's four responsibilities
 * live on this one hook file (Gate 2 is the dispatch gate, Gate 4 the git-verb guard on the two
 * shell tools, Bash and PowerShell):
 *
 * (1) AIWF-N3 (trimmed) — NON-WRITER SUBAGENTS CANNOT WRITE.
 * Identity comes ONLY from the harness-trusted `agent_id` / `agent_type` fields (never a
 * self-declared/file value). Checks OWN-PROPERTY PRESENCE (not value), and requires a plain-object
 * input. Allow ONLY:
 *   (a) TRUE main session — NEITHER `agent_id` NOR `agent_type` exists as an own property, or
 *   (b) `agent_type === "writer"`  (the implementer).
 * Everything else denies: a non-object input (array/primitive/null), or ANY own-property
 * presence of `agent_id`/`agent_type` (including explicit `null`) with a type other than
 * "writer" — incomplete/ambiguous identity fails CLOSED (never inferred as main session).
 *
 * AIWF-N10 (engine-neutral review roles): this gate catches the Edit/Write family from any non-writer
 * subagent, so it is what holds a CLAUDE-hosted Reviewer/QA read-only (Read/Grep/Glob-only, no OS
 * cell). The hard OS `--sandbox read-only` boundary applies only on the codex review path. Proven in
 * AIWF-N10 P0a: reviewer/qa/qal Claude subagents were each denied here and created no sentinel file.
 *
 * (2) AIWF-G3 — ROUTE-STATE WRITE GUARD (the main session's own boundary).
 * The accident: while an R2/R3 ticket is dispatched, the COO wrote to the repo ITSELF (test files
 * under `src/`) instead of giving the work to the Writer. So branch (a) above — the true main session
 * — no longer allows unconditionally; it consults `<projectDir>/.aiwf/route-state.json`:
 *   - file MISSING            -> passthrough. This is TODAY'S behaviour and the common case: with no
 *                                ticket dispatched, R1 work is completely untouched.
 *   - `route` own property ABSENT (e.g. the cleared state `{}`) -> passthrough, ticket closed.
 *   - `route` exactly "R2"/"R3" -> guard ACTIVE: the main session may write only
 *                                `docs/**`, `.aiwf/**` and root-level `*.md`, plus the transfer surface
 *                                (`paths.transferSurface`, else `<plansDir>/PNP_CANDIDATES.md` - one
 *                                file, and only when it is contained, ends in `.md` and is not under
 *                                `.claude`) and the roadmap `<plansDir>/ROADMAP.md` on the same
 *                                terms; anything else DENIES.
 *   - present but unreadable / not JSON / not an object / `route` present with any other value
 *                             -> guard ACTIVE under the SAME fixed allowlist (never the transfer
 *                                surface or the roadmap), denying with an "unusable state" reason. We cannot tell
 *                                whether a ticket is open, and this gate's direction is FAIL-CLOSED. Keeping the allowlist (rather than
 *                                denying everything) is what makes it self-healing instead of a trap:
 *                                `.aiwf/**` stays writable, so the fix is ONE allowed write.
 * Targets OUTSIDE the project dir pass through deliberately (see the path check in
 * mainSessionDecision): the COO's scratchpad and ~/.claude/** memory writes are ordinary work, and
 * this guard protects the REPO. Branch (b) is untouched: the WRITER is never affected by this guard —
 * it is the role that is supposed to write.
 *
 * THE `enforcement.routeWriteGuard` TOGGLE (project config, read from
 * `<projectDir>/.claude/aiwf-native/aiwf.config.json`). Responsibility (2) - and ONLY (2) - can be
 * switched off per project:
 *   - no config file / unreadable / not JSON / no such key -> the guard behaves EXACTLY as it does
 *     without this paragraph. That is the safe direction: a project that never installed the config
 *     layer, and a project whose config is corrupt, both keep the armed guard. A toggle that failed
 *     OPEN would mean "break the config, lose the gate", which is precisely backwards.
 *   - the key is exactly the boolean `false` -> the route-state check is skipped. No coercion: the
 *     STRING "false" is not the boolean false and leaves the guard armed.
 * Responsibility (1), the identity check, is NEVER affected by this key - a config file cannot buy a
 * non-writer subagent the right to write.
 * The same file names the TRANSFER SURFACE (`paths.transferSurface`, `paths.plansDir`); one reader,
 * one failure rule - a config that cannot be read, parsed or typed resolves to no surface at all.
 *
 * HONEST LIMIT: this covers the Edit/Write TOOL CLASS only. A main-session mutation performed through
 * a shell command (`echo … > file` on Bash, `Set-Content` on PowerShell, a script) is NOT caught here
 * and remains doctrine. Gate 4 does sit on both shell tools, but it judges ask-class GIT VERBS, not
 * file mutations — a shell redirect into a file is as uncaught there as it is here.
 *
 * Accident/role protection, not adversary-proofing. Fail-closed: unparseable input -> deny.
 */
const fs = require('fs');
const path = require('path');
const lib = require('./aiwf-lib');

const WRITER_AGENT_TYPE = 'writer'; // matches `name:` in .claude/agents/writer.md
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// ---- AIWF-G3 route-state guard ---------------------------------------------
const ACTIVE_ROUTES = ['R2', 'R3']; // exact match: a typo like "r2" is NOT a route, it is unusable state
const STATE_REL = path.join('.aiwf', 'route-state.json');
const G3 = '[AIWF-G3 gate 3: route-state write guard]';
// How to switch the guard off. Deliberately "write {}", never "delete the file": `rm` is an `ask`
// permission rule, so telling the reader to delete would pop a dialog on every single ticket close —
// this gate must not add operator friction. `{}` has no `route`, and a state with no `route` is the
// CLEARED state, so one allowed write to an allowlisted path turns the guard off.
const HOW_TO_CLEAR =
  'To clear it when the ticket is really closed, WRITE {} into .aiwf/route-state.json — that path is on ' +
  'the allowlist, so it is one allowed edit (do NOT delete the file: `rm` is an ask-rule and would pop a ' +
  'dialog every time).';

// Same resolution as Gate 2 (pretooluse-dispatch-gate.js): CLAUDE_PROJECT_DIR is what settings.json
// uses to launch us; fall back to the hook's own location (.claude/hooks/ -> repo root) so the hook
// also works when run directly (e.g. from the negtest against a fixture project dir).
function projectDirOf() {
  const envDir = process.env.CLAUDE_PROJECT_DIR;
  return envDir && envDir.trim() !== '' ? envDir : path.resolve(__dirname, '..', '..');
}

// The allowlist, on the FIRST path segment. Segment names compare case-INSENSITIVELY: on Windows
// `Docs\x.md` and `docs\x.md` are the same file, so a case-sensitive compare would deny a path the
// filesystem itself treats as allowed. That leniency matches reality; it is not a hole.
function isAllowlisted(rel) {
  const segs = rel.split(/[\\/]/).filter((s) => s !== '');
  if (segs.length === 0) return true; // defensive; the empty relative path is handled before this
  const first = segs[0].toLowerCase();
  if (first === 'docs') return true;                              // docs/** — the COO's own class
  if (first === '.aiwf') return true;                             // .aiwf/** — incl. the state file itself
  if (segs.length === 1 && first.endsWith('.md')) return true;    // root *.md: CLAUDE.md, AGENTS.md, README.md…
  return false;
}

// NotebookEdit names its target `notebook_path`, not `file_path` — reading only `file_path` would let
// every notebook write through while a ticket is open.
function targetPathOf(toolInput) {
  if (!isPlainObject(toolInput)) return null;
  for (const key of ['file_path', 'notebook_path']) {
    const v = toolInput[key];
    if (typeof v === 'string' && v.trim() !== '') return v;
  }
  return null;
}

// The project config, through ONE reader with ONE failure rule: anything that cannot be read, parsed
// or typed as a plain object is `null`, and every consumer below reads `null` as the narrower, armed
// allowlist - never as a reason to allow more.
const CONFIG_REL = path.join('.claude', 'aiwf-native', 'aiwf.config.json');
function readProjectConfig(projectDir) {
  let raw;
  try {
    raw = fs.readFileSync(path.join(projectDir, CONFIG_REL), 'utf8');
  } catch (e) {
    return null; // no config layer (or unreadable)
  }
  let config;
  try {
    config = JSON.parse(raw);
  } catch (e) {
    return null; // a corrupt config
  }
  return isPlainObject(config) ? config : null;
}

// The per-project toggle. Returns TRUE (armed) for every state except an explicit boolean `false`,
// so every failure mode of reading the config - absent, unreadable, malformed, key missing, key of
// the wrong type - leaves the guard exactly as armed as it is on a project with no config at all.
function routeWriteGuardEnabled(config) {
  if (!isPlainObject(config) || !isPlainObject(config.enforcement)) return true;
  return config.enforcement.routeWriteGuard !== false;
}

// The hooks' first `process.platform` branch: win32 and darwin default to case-insensitive
// filesystems, so the transfer-surface identity folds case there; linux compares exactly, because
// there `DEV/x.md` is another file. (A case-sensitive macOS volume is the stated residual.)
const FOLD_CASE = process.platform === 'win32' || process.platform === 'darwin';
const TRANSFER_SURFACE_BASENAME = 'PNP_CANDIDATES.md';
const DEFAULT_PLANS_DIR = 'docs/backlogs'; // the schema default of paths.plansDir

// `<plansDir>/<basename>`: the trimmed `paths.plansDir` when it is a non-blank string, else the
// schema default.
function plansDirFile(paths, basename) {
  const plansDir = typeof paths.plansDir === 'string' && paths.plansDir.trim() !== ''
    ? paths.plansDir.trim() : DEFAULT_PLANS_DIR;
  return plansDir.replace(/[\\/]+$/, '') + '/' + basename;
}

// The transfer surface: the configured `paths.transferSurface` (trimmed) when it is a non-blank
// string, else `<plansDir>/PNP_CANDIDATES.md` - the rule of `resolveTransferSurface` in
// scripts/setup/generate.mjs, copied rather than imported: this hook loads nothing but aiwf-lib.js,
// and whether a CommonJS `require()` of an ESM module works depends on the Node version.
// Returns the project-relative string, or `null` when no surface may be allowed: an unusable config
// (the narrower allowlist), an absolute value on either dialect, ANY `..` segment (stricter than a
// report location's containment - nothing is normalised here), a basename that is not `.md` (which
// keeps the config and every code file out), or a value whose normalised first segment is `.claude`
// (agent files and the rendered rules are `.md` too). Pure: no filesystem access.
function resolveTransferSurface(config, projectDir) {
  if (!isPlainObject(config)) return null;
  const paths = isPlainObject(config.paths) ? config.paths : {};
  let value;
  if (typeof paths.transferSurface === 'string' && paths.transferSurface.trim() !== '') {
    value = paths.transferSurface.trim();
  } else {
    value = plansDirFile(paths, TRANSFER_SURFACE_BASENAME);
  }
  return containedSurface(value, projectDir);
}

// The roadmap: `<plansDir>/ROADMAP.md`, a FIXED location with no config key - the rule of
// `resolveRoadmap` in scripts/setup/generate.mjs, copied for the same reason as the surface's. It is a
// second one-file allow under exactly the surface's terms (containedSurface below), so an idea can
// land in the roadmap while a ticket is open; an unusable config resolves to no roadmap at all.
const ROADMAP_BASENAME = 'ROADMAP.md';
function resolveRoadmap(config, projectDir) {
  if (!isPlainObject(config)) return null;
  const paths = isPlainObject(config.paths) ? config.paths : {};
  return containedSurface(plansDirFile(paths, ROADMAP_BASENAME), projectDir);
}

// The containment rules both one-file allows share; `value` itself, or null when it may not be allowed.
function containedSurface(value, projectDir) {
  if (path.win32.isAbsolute(value) || path.posix.isAbsolute(value)) return null;
  const segs = value.split(/[\\/]/);
  if (segs.includes('..')) return null;
  if (!segs[segs.length - 1].endsWith('.md')) return null;
  const rel = path.relative(projectDir, path.resolve(projectDir, value));
  if (rel === '' || path.isAbsolute(rel)) return null;
  const relSegs = rel.split(path.sep).filter((s) => s !== '' && s !== '.');
  if (relSegs.length === 0 || relSegs[0] === '..') return null;
  let first = FOLD_CASE ? relSegs[0].toLowerCase() : relSegs[0];
  // Windows strips trailing dots and spaces at the filesystem (`.claude.` IS `.claude`); one rule on
  // every platform, since refusing such a name elsewhere costs nothing.
  first = first.replace(/[. ]+$/, '');
  if (first === '.claude') return null;
  return value;
}

// Is the resolved write target the transfer surface itself? The HOST's path identity, not a string
// rewrite: on linux a backslash is a filename character, on win32 a separator.
function isTransferSurface(projectDir, surface, resolved) {
  const surfaceAbs = path.resolve(projectDir, surface);
  const a = FOLD_CASE ? surfaceAbs.toLowerCase() : surfaceAbs;
  const b = FOLD_CASE ? resolved.toLowerCase() : resolved;
  return path.relative(a, b) === '';
}

// Reads the route state and reports WHETHER the guard is armed, never touching the tool payload.
//   { off: true }                        -> no ticket dispatched (or the state was cleared)
//   { why: 'ticket', ticket, route }     -> an R2/R3 ticket is open
//   { why: 'unusable', what }            -> the state exists but cannot be read as a route
function readGuardState(projectDir) {
  const stateFile = path.join(projectDir, STATE_REL);
  let raw;
  try {
    raw = fs.readFileSync(stateFile, 'utf8');
  } catch (e) {
    // NO state file = no ticket dispatched = today's behaviour, untouched. This is the common case.
    if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return { off: true };
    return { why: 'unusable', what: `unreadable (${e && e.message ? e.message : String(e)})` };
  }

  let state;
  try {
    state = JSON.parse(raw);
  } catch (e) {
    return { why: 'unusable', what: `not valid JSON (${e && e.message ? e.message : String(e)})` };
  }
  if (!isPlainObject(state)) return { why: 'unusable', what: `not a JSON object (found ${JSON.stringify(state)})` };

  // CLEARED: no `route` own property at all — this is exactly what writing `{}` produces, which is the
  // documented way to close a ticket, so it must switch the guard OFF. Own-property PRESENCE is the
  // test, the same semantics Gate 1 uses for identity above. (If a `{}` state still denied, "clearing"
  // would clear nothing and the guard would stay latched forever after the very first ticket.)
  if (!has(state, 'route')) return { off: true };

  const route = state.route;
  if (!ACTIVE_ROUTES.includes(route)) {
    return { why: 'unusable', what: `its "route" is not usable (found ` +
      `${route === undefined ? 'undefined' : JSON.stringify(route)}; expected exactly "R2" or "R3", or ` +
      `no "route" key at all when the ticket is closed)` };
  }
  const ticket = (typeof state.ticket === 'string' && state.ticket.trim() !== '') ? state.ticket : '(unnamed ticket)';
  return { why: 'ticket', ticket, route };
}

// Decides for the TRUE MAIN SESSION only (branch (a)). Returns via lib.* which exit the process.
function mainSessionDecision(input) {
  const tool = input.tool_name || 'mutation';
  const projectDir = projectDirOf();
  const config = readProjectConfig(projectDir);
  if (!routeWriteGuardEnabled(config)) return lib.allowPassthrough(); // enforcement.routeWriteGuard === false
  const st = readGuardState(projectDir);
  if (st.off) return lib.allowPassthrough(); // no ticket dispatched -> nothing about today's behaviour changes
  // The transfer surface and the roadmap are extra allows for a TICKET state only; an unusable state
  // keeps exactly the fixed allowlist below.
  const surface = st.why !== 'unusable' ? resolveTransferSurface(config, projectDir) : null;
  const roadmap = st.why !== 'unusable' ? resolveRoadmap(config, projectDir) : null;

  // WHY the guard is armed, in the deny text. An unusable state arms it exactly like an open ticket —
  // SAME fixed allowlist (without the transfer surface), different explanation. That equality is
  // what makes the unusable case self-healing instead of a lock: `.aiwf/**` stays writable, so the fix really is one allowed write. Denying
  // everything on an unusable state would block the very write the message asks for.
  const because = st.why === 'ticket'
    ? `ticket ${st.ticket} is dispatched on route ${st.route}`
    : `${STATE_REL} is present but ${st.what} — this gate cannot tell whether an R2/R3 ticket is ` +
      `dispatched, so it fails CLOSED and applies the same allowlist`;

  const target = targetPathOf(input.tool_input);
  if (target === null) {
    return lib.denyPreTool(
      `Blocked ${tool}: ${because}, and the target path could not be read from tool_input (neither ` +
      `file_path nor notebook_path is a non-empty string), so this gate cannot check it against the ` +
      `allowlist and fails CLOSED. ${G3}`
    );
  }

  const resolved = path.resolve(projectDir, target);
  const rel = path.relative(projectDir, resolved);
  // OUTSIDE the project dir -> passthrough, deliberately and load-bearingly. The main session writes to
  // its session scratchpad and to ~/.claude/** (memory) constantly; denying those would break ordinary
  // work while protecting nothing — this guard exists to protect the REPO.
  if (rel === '' || path.isAbsolute(rel) || rel.split(/[\\/]/)[0] === '..') return lib.allowPassthrough();

  if (isAllowlisted(rel)) return lib.allowPassthrough();
  if (surface !== null && isTransferSurface(projectDir, surface, resolved)) return lib.allowPassthrough();
  if (roadmap !== null && isTransferSurface(projectDir, roadmap, resolved)) return lib.allowPassthrough();

  const plusSurface = surface !== null ? `, plus the transfer surface ${surface} (gate 3)` : '';
  const plusRoadmap = roadmap !== null ? `, plus the roadmap ${roadmap} (gate 3)` : '';
  return lib.denyPreTool(
    `Blocked ${tool}: ${because}, so the MAIN SESSION may not write ${target} — while a ticket is open ` +
    `it may write only docs/**, .aiwf/** and root-level *.md${plusSurface}${plusRoadmap}. Code-class work goes to the Writer ` +
    `subagent (.claude/agents/writer.md), which this gate never blocks. ${HOW_TO_CLEAR} ${G3}`
  );
}

if (require.main === module) lib.runFailClosed(async () => {
  const input = lib.parseInput(await lib.readStdin());

  // Input must be a plain object (not array/primitive/null) — otherwise we cannot read a
  // trusted identity, so fail closed.
  if (!isPlainObject(input)) {
    return lib.denyPreTool(
      'Blocked mutation: hook input is not an object; cannot verify actor identity (fail-closed). ' +
      '[AIWF-N3 gate 1]'
    );
  }

  const idPresent = has(input, 'agent_id');
  const typePresent = has(input, 'agent_type');

  // (b) the Writer subagent (explicit "writer"). Never touched by the AIWF-G3 route guard either.
  if (input.agent_type === WRITER_AGENT_TYPE) return lib.allowPassthrough();
  // (a) true main session: NEITHER identity field present as an own property. Allowed by IDENTITY —
  // the AIWF-G3 route-state guard decides the rest (and passes through when no ticket is dispatched).
  if (!idPresent && !typePresent) return mainSessionDecision(input);

  // Any own-property presence of agent_id/agent_type (incl. explicit null) with type != "writer".
  const detail = typePresent
    ? `agent_type ${input.agent_type === null ? 'null' : JSON.stringify(input.agent_type)}`
    : 'agent_id present, agent_type absent';
  return lib.denyPreTool(
    `Blocked ${input.tool_name || 'mutation'}: non-writer or incomplete subagent identity (${detail}) ` +
    `may not write to the repo — only the Writer subagent (or the true main session) writes. Route ` +
    `edits through the Writer (.claude/agents/writer.md). [AIWF-N3 gate 1: non-writer subagents cannot write]`
  );
});

// Required (not run) by the self-check, which calls the resolver directly; as a hook nothing changes.
module.exports = { resolveTransferSurface, resolveRoadmap, isAllowlisted };
