'use strict';
/*
 * Gate 1 — PreToolUse(Edit|Write|MultiEdit|NotebookEdit). TWO responsibilities on one hook:
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
 *                                `docs/**`, `.aiwf/**` and root-level `*.md`; anything else DENIES.
 *   - present but unreadable / not JSON / not an object / `route` present with any other value
 *                             -> guard ACTIVE under the SAME allowlist, denying with an "unusable
 *                                state" reason. We cannot tell whether a ticket is open, and this
 *                                gate's direction is FAIL-CLOSED. Keeping the allowlist (rather than
 *                                denying everything) is what makes it self-healing instead of a trap:
 *                                `.aiwf/**` stays writable, so the fix is ONE allowed write.
 * Targets OUTSIDE the project dir pass through deliberately (see the path check in
 * mainSessionDecision): the COO's scratchpad and ~/.claude/** memory writes are ordinary work, and
 * this guard protects the REPO. Branch (b) is untouched: the WRITER is never affected by this guard —
 * it is the role that is supposed to write.
 *
 * HONEST LIMIT: this covers the Edit/Write TOOL CLASS only. A main-session mutation performed through
 * a Bash command (`echo … > file`, `Set-Content`, a script) is NOT caught here and remains doctrine.
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
  const st = readGuardState(projectDir);
  if (st.off) return lib.allowPassthrough(); // no ticket dispatched -> nothing about today's behaviour changes

  // WHY the guard is armed, in the deny text. An unusable state arms it exactly like an open ticket —
  // SAME allowlist, different explanation. That equality is what makes the unusable case self-healing
  // instead of a lock: `.aiwf/**` stays writable, so the fix really is one allowed write. Denying
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

  return lib.denyPreTool(
    `Blocked ${tool}: ${because}, so the MAIN SESSION may not write ${target} — while a ticket is open ` +
    `it may write only docs/**, .aiwf/** and root-level *.md. Code-class work goes to the Writer ` +
    `subagent (.claude/agents/writer.md), which this gate never blocks. ${HOW_TO_CLEAR} ${G3}`
  );
}

lib.runFailClosed(async () => {
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
