'use strict';
/*
 * AIWF-N4-R / AIWF-G2 — shared hook library, trimmed to what the two gates need.
 *
 * ACCIDENT/ROLE PROTECTION, not adversary-proofing. TWO small hooks share these helpers:
 *   - pretooluse-mutation-guard.js (Gate 1): stops NON-writer subagents from writing to the repo —
 *     the one boundary with no native Claude Code equivalent. It catches the Edit/Write family
 *     (Edit|Write|MultiEdit|NotebookEdit). Under AIWF-N10 (engine-neutral review roles) this Gate 1
 *     block IS the read-only boundary for a CLAUDE-hosted Reviewer/QA (Read/Grep/Glob-only subagent,
 *     no OS cell); the hard OS `--sandbox read-only` cell applies only on the codex review path.
 *   - pretooluse-dispatch-gate.js (Gate 2, AIWF-G2): raises a native Yes/No dialog when a `writer`
 *     subagent dispatch cannot be traced to a ticket that exists in an active Mission PLAN.
 *
 * DELIBERATE ASYMMETRY IN THE FAIL DIRECTION — a decision, not an oversight:
 *   - Gate 1 fails CLOSED (deny). The stake there is a FOREIGN subagent writing to the repo; on a
 *     parse/identity error the actor is unknown, and an unknown actor must not get a write.
 *   - Gate 2 fails to ASK. The stake there is a dispatch that may well be legitimate; denying it on
 *     an unreadable payload or an unreadable PLAN directory would block real work with no way for
 *     the operator to override. A dialog is the safe direction: it costs one click and never blocks.
 * Hence the two emitter/wrapper pairs below (deny/runFailClosed for Gate 1, ask/runFailAsk for
 * Gate 2). Do NOT collapse them into one.
 *
 * The commit/destructive boundary is a DECLARATIVE `ask` permission rule in .claude/settings.json
 * (a visual Yes/No dialog on a matching command in a normal permission mode); since AIWF-N12
 * push/merge/rebase are DECLARATIVE `ask` rules too — dialog-gated, not hard-blocked — across the
 * same three invocation forms (`git`, `git.exe`, `git -C <projectRoot>`), and `permissions.deny` is
 * now literally EMPTY. Their remaining boundary is that ask dialog + the operator's explicit-word
 * doctrine + branch isolation; the `.git/config` pushurl lock is retired (the pushurl now points at
 * the real remote and blocks nothing). No enforcement hook on either. All are accident-grade
 * (prefix-based), not adversary-proof — no state file, no lock, no token. (An
 * interim second-layer Bash hook was tried and removed in N4-R; see the PLAN hook-removal record.)
 *
 * The HARD guarantees live elsewhere, unchanged: the OS read-only Codex sandbox for Reviewer/QA
 * (AIWF-N1), git reversibility, and operator-in-the-loop review/decision.
 *
 * The hooks are Node scripts (deterministic stdin JSON; avoids Windows PowerShell stdin/encoding
 * pitfalls). Gate 1 follows the FAIL-CLOSED rule (on a parse/identity error, DENY); Gate 2 follows
 * the FAIL-TO-ASK rule (on any unexpected error, ASK) — see the asymmetry note above.
 */

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

// Throws on empty/invalid so callers can fail CLOSED.
function parseInput(raw) {
  if (raw == null || String(raw).trim() === '') throw new Error('empty hook stdin');
  return JSON.parse(raw);
}

// ---- decision emitters -----------------------------------------------------
function denyPreTool(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
}
// Gate 2's emitter: a visible native Yes/No dialog on a matching call (operator-confirmed on an
// `Agent` dispatch during the AIWF-G2 spike). Same envelope as denyPreTool, different decision.
function askPreTool(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason },
  }));
  process.exit(0);
}
function allowPassthrough() { process.exit(0); } // no decision => normal permission flow

// Any unexpected throw fails CLOSED (deny) for the PreToolUse gate.
function runFailClosed(fn) {
  fn().catch((err) => denyPreTool(`AIWF gate error (fail-closed): ${err && err.message ? err.message : String(err)}`));
}

// Any unexpected throw fails to ASK — the Gate 2 direction (a dialog, never a block).
function runFailAsk(fn) {
  fn().catch((err) => askPreTool(`AIWF gate error (fail-to-ask): ${err && err.message ? err.message : String(err)}`));
}

module.exports = {
  readStdin, parseInput, denyPreTool, askPreTool, allowPassthrough, runFailClosed, runFailAsk,
};
