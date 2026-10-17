'use strict';
/*
 * AIWF-N4-R / AIWF-G2 / AIWF-G4 — shared hook library, trimmed to what the gates need.
 *
 * ACCIDENT/ROLE PROTECTION, not adversary-proofing. THREE small hooks share these helpers:
 *   - pretooluse-mutation-guard.js (Gate 1): stops NON-writer subagents from writing to the repo —
 *     the one boundary with no native Claude Code equivalent. It catches the Edit/Write family
 *     (Edit|Write|MultiEdit|NotebookEdit). Under AIWF-N10 (engine-neutral review roles) this Gate 1
 *     block IS the read-only boundary for a CLAUDE-hosted Reviewer/QA (Read/Grep/Glob-only subagent,
 *     no OS cell); the hard OS `--sandbox read-only` cell applies only on the codex review path.
 *   - pretooluse-dispatch-gate.js (Gate 2, AIWF-G2): raises a native Yes/No dialog when a `writer`
 *     subagent dispatch cannot be traced to a ticket that exists in an active Mission PLAN, and
 *     denies a `reviewer` dispatch whose brief carries `Class: plan` while plan-gate.js finds its
 *     readiness artifacts missing or incomplete - a decision on a readable brief, not an error path.
 *   - pretooluse-git-verb-guard.js (Gate 4, AIWF-G4): on BOTH shell tools (matcher
 *     `Bash|PowerShell`, mirroring the `Bash(<X>)` / `PowerShell(<X>)` rule pairs in the ruleset).
 *     DENIES an ask-class git verb
 *     to any subagent that is not the Writer (a background agent's dialog reaches no operator) and
 *     ASKS for the main session/Writer in the git forms the shipped `ask` rules never spell out:
 *     `git.exe` outside push/merge/rebase, any `git -C <path> <verb>`, and a wrapper the harness
 *     does not strip. What the harness already matches by itself - each subcommand of a chained
 *     command, a `timeout`/`nice` prefix, a `NAME=value` prefix - stays silent. Those last two are
 *     Bash-only: nothing of the sort is documented for PowerShell, so that dialect asks instead.
 *
 * DELIBERATE ASYMMETRY IN THE FAIL DIRECTION — a decision, not an oversight:
 *   - Gate 1 fails CLOSED (deny). The stake there is a FOREIGN subagent writing to the repo; on a
 *     parse/identity error the actor is unknown, and an unknown actor must not get a write.
 *   - Gate 2 fails to ASK. The stake there is a dispatch that may well be legitimate; denying it on
 *     an unreadable payload or an unreadable PLAN directory would block real work with no way for
 *     the operator to override. A dialog is the safe direction: it costs one click and never blocks.
 *     On an error Gate 2 still asks; the deny of a plan-class reviewer dispatch is a DECISION on a
 *     brief it could read (its artifacts are missing), never the result of an error.
 *   - Gate 4 fails CLOSED (deny), like Gate 1: on a parse error the actor is unknown there too. It
 *     is the one gate that uses BOTH emitters in its normal path — deny on identity, ask on the
 *     command form — so the emitters below belong to no single gate.
 * Hence the two emitter/wrapper pairs below (deny/runFailClosed for Gates 1 and 4, ask/runFailAsk
 * for Gate 2). Do NOT collapse them into one.
 *
 * The commit/destructive boundary is a DECLARATIVE `ask` permission rule in .claude/settings.json
 * (a visual Yes/No dialog on a matching command in a normal permission mode); since AIWF-N12
 * push/merge/rebase are DECLARATIVE `ask` rules too — dialog-gated, not hard-blocked — across the
 * same three invocation forms (`git`, `git.exe`, `git -C <projectRoot>`), and `permissions.deny` is
 * now literally EMPTY. For the main session and the Writer that boundary is still the ask dialog +
 * the operator's explicit-word doctrine + branch isolation; the `.git/config` pushurl lock is
 * retired (the pushurl now points at the real remote and blocks nothing). All of it is
 * accident-grade (prefix-based), not adversary-proof — no state file, no lock, no token.
 *
 * WHAT GATE 4 ADDED, AND WHAT IT DELIBERATELY DID NOT. An interim second-layer Bash hook was tried
 * and removed in N4-R (see the PLAN hook-removal record): it set out to be the enforcement layer for
 * shell commands in general, which means emulating shell escape/continuation semantics — an
 * unwinnable maintenance treadmill, and that judgement still stands. Gate 4 is a narrower thing and
 * makes a narrower promise: it RECOGNISES an ask-class git verb (best-effort: no escape, alias or
 * env awareness, and quote handling only in the two narrow places the Gate 4 header names) and then
 * decides on IDENTITY, which is the part a hook can guarantee. So a
 * non-writer subagent is denied, the git forms no rule spells out get the dialog nothing else
 * raises, and
 * everything else — an aliased verb, an escaped one, a mutation performed with `echo > file` —
 * remains exactly as uncovered as it was, and doctrine.
 *
 * The HARD guarantees live elsewhere, unchanged: the OS read-only Codex sandbox for Reviewer/QA
 * (AIWF-N1), git reversibility, and operator-in-the-loop review/decision.
 *
 * The hooks are Node scripts (deterministic stdin JSON; avoids Windows PowerShell stdin/encoding
 * pitfalls). Gates 1 and 4 follow the FAIL-CLOSED rule (on a parse/identity error, DENY); Gate 2
 * follows the FAIL-TO-ASK rule (on any unexpected error, ASK; its plan-pass deny is a decision on a
 * readable brief, not an error path) — see the asymmetry note above.
 */

const fs = require('fs');
const path = require('path');

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
// (Gate 2 also uses denyPreTool, for exactly one decision: a plan-class reviewer dispatch whose
// readable brief names readiness artifacts that are missing or incomplete. Its errors still ask.)
function askPreTool(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason },
  }));
  process.exit(0);
}
function allowPassthrough() { process.exit(0); } // no decision => normal permission flow

// ---- ticket refs -----------------------------------------------------------
// `escapeRe` is shared by Gate 2 and plan-gate.js. `refRegex` is Gate 2's whole-identifier lookup
// of a ref in an active PLAN, moved here beside the helper it depends on.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// WHOLE-IDENTIFIER match, case-sensitive. A plain substring test would be wrong ("ABC-2" would
// match "ABC-21" and clear a ref that is in no PLAN), and so is `\b`: the ref alphabet admitted by
// Gate 2's TICKET_LINE is [A-Za-z0-9_-], while `-` is NOT a regex word character, so `\bDEMO-1\b`
// finds a boundary in the middle of "DEMO-1-EXTRA" and in "X-DEMO-1" and clears both. The boundaries
// below are therefore stated over the COMPLETE identifier alphabet: the ref matches only where it is
// not glued to another ref character on either side.
function refRegex(ref) {
  return new RegExp('(?<![A-Za-z0-9_-])' + escapeRe(ref) + '(?![A-Za-z0-9_-])');
}

// ---- plan shapes -----------------------------------------------------------
// The ONE definition of what an active plan is, read by Gate 2 (pretooluse-dispatch-gate.js), by
// setup's existing-plans warning (scripts/setup/generate.mjs) and by the self-check's plan-ref
// section - a count or a grammar check that described a different set than the gate reads would be
// a statement about a different thing. A plan is either
//   - a MONOLITH file `active/PLAN_<anything>.md` (the name a plan had before the folder shape), or
//   - a FOLDER `active/<ABBR>/`: the index `PLAN_<ABBR>.md` and the ticket files
//     `tickets/<ABBR>-NNN.md`; `DECISIONS.md`, `RESEARCH.md` and `records/` belong to the plan but
//     are not where a ticket lives, so no reader looks there.
// The grammar is the doctrine's own (payload docs/WORKFLOW.md, "one prefix per plan").
const PLAN_ABBR_RE = /^[A-Z]{2,8}$/;
const PLAN_FILE_RE = /^PLAN_.*\.md$/;
const PLAN_TICKET_FILE_RE = /^([A-Z]{2,8})-(\d{3})\.md$/;

// The targeted lookup of `ref`, IN ORDER: `PLAN_<ABBR>.md`, `<ABBR>/PLAN_<ABBR>.md`,
// `<ABBR>/tickets/<REF>.md`, where `<ABBR>` is the ref's text before its FIRST `-`. No dash (or a
// leading one) -> no candidate at all. The folder candidates exist only where the scan below would
// reach the same file - `<ABBR>` inside the ABBR grammar, `<REF>.md` inside the ticket-file grammar -
// so the targeted path can never clear a ref out of a file the scan would not have read.
// Each candidate: `name` (active/-relative, `/`-separated - the form `filesRead` reports), `file`
// (the path) and `dirs` (the directories between active/ and the file, which a reader must find to
// be real directories, as the scan's Dirent test does).
function targetedPlanCandidates(activeDir, ref) {
  const dash = typeof ref === 'string' ? ref.indexOf('-') : -1;
  if (dash <= 0) return [];
  const abbr = ref.slice(0, dash);
  const out = [{ name: `PLAN_${abbr}.md`, file: path.join(activeDir, `PLAN_${abbr}.md`), dirs: [] }];
  if (!PLAN_ABBR_RE.test(abbr)) return out;
  const folder = path.join(activeDir, abbr);
  out.push({ name: `${abbr}/PLAN_${abbr}.md`, file: path.join(folder, `PLAN_${abbr}.md`), dirs: [folder] });
  if (PLAN_TICKET_FILE_RE.test(`${ref}.md`)) {
    const tickets = path.join(folder, 'tickets');
    out.push({ name: `${abbr}/tickets/${ref}.md`, file: path.join(tickets, `${ref}.md`), dirs: [folder, tickets] });
  }
  return out;
}

// Every active plan file, NAMES only (nothing is content-read): each regular `PLAN_*.md` directly
// under active/, and for each DIRECTORY there whose name is an ABBR, its regular `PLAN_<ABBR>.md`
// index and the regular `tickets/<ABBR>-NNN.md` files. Nothing deeper; a directory outside the
// grammar is not a plan folder. Eligibility is the Dirent's own (`isFile()` / `isDirectory()` on the
// entry ITSELF, so a symlink is neither).
// Returns `{ files, dirError }`; each file is `{ plan, name, file }` (`plan` = the monolith's file
// name or the folder's ABBR, so a caller can count plans). A readdir error is NEVER thrown and never
// read as "no plans": an unreadable active/ returns at once with no files; an unreadable plan folder
// (or its tickets/) is recorded as the FIRST `dirError` while the listing goes on, so a caller that
// must not decide on a partial view (Gate 2) can refuse to, and one that only reports what it saw
// (setup) still can. A folder with no `tickets/` entry is a folder without ticket files, not an error.
function listActivePlanFiles(activeDir) {
  let entries;
  try {
    entries = fs.readdirSync(activeDir, { withFileTypes: true });
  } catch (e) {
    return { files: [], dirError: e };
  }
  const files = [];
  let dirError = null;
  for (const entry of entries) {
    if (entry.isFile()) {
      if (PLAN_FILE_RE.test(entry.name)) files.push({ plan: entry.name, name: entry.name, file: path.join(activeDir, entry.name) });
      continue;
    }
    if (!entry.isDirectory() || !PLAN_ABBR_RE.test(entry.name)) continue;
    const abbr = entry.name;
    const folder = path.join(activeDir, abbr);
    let inner;
    try {
      inner = fs.readdirSync(folder, { withFileTypes: true });
    } catch (e) {
      if (dirError === null) dirError = e;
      continue;
    }
    const index = `PLAN_${abbr}.md`;
    let hasTickets = false;
    for (const f of inner) {
      if (f.name === index && f.isFile()) files.push({ plan: abbr, name: `${abbr}/${index}`, file: path.join(folder, index) });
      else if (f.name === 'tickets' && f.isDirectory()) hasTickets = true;
    }
    if (!hasTickets) continue;
    const ticketsDir = path.join(folder, 'tickets');
    let tickets;
    try {
      tickets = fs.readdirSync(ticketsDir, { withFileTypes: true });
    } catch (e) {
      if (dirError === null) dirError = e;
      continue;
    }
    for (const t of tickets) {
      if (t.isFile() && PLAN_TICKET_FILE_RE.test(t.name)) files.push({ plan: abbr, name: `${abbr}/tickets/${t.name}`, file: path.join(ticketsDir, t.name) });
    }
  }
  return { files, dirError };
}

// Any unexpected throw fails CLOSED (deny) for the PreToolUse gate.
function runFailClosed(fn) {
  fn().catch((err) => denyPreTool(`AIWF gate error (fail-closed): ${err && err.message ? err.message : String(err)}`));
}

// Any unexpected throw fails to ASK — the Gate 2 direction (a dialog, never a block, on an error;
// the plan-pass deny is a decision on a readable brief and never comes from this wrapper).
function runFailAsk(fn) {
  fn().catch((err) => askPreTool(`AIWF gate error (fail-to-ask): ${err && err.message ? err.message : String(err)}`));
}

module.exports = {
  readStdin, parseInput, denyPreTool, askPreTool, allowPassthrough, runFailClosed, runFailAsk,
  escapeRe, refRegex,
  PLAN_ABBR_RE, PLAN_FILE_RE, PLAN_TICKET_FILE_RE, targetedPlanCandidates, listActivePlanFiles,
};
