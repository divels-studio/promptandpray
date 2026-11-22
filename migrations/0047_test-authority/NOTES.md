# 0047_test-authority

**Who decides what about tests: the project decides what is tested, the auditor whether a test is
honest, with a floor no project policy lowers. A test weakness over confirmed code is a plain note
outside that floor, a Writer adds no test beyond its brief's list, every record carries the numbers,
and a helper agent may leave a long hand-back as a file. This update re-renders the core, four
stage files and the Writer agent.**

## What changes

`review.md`, the new § The project's test policy and the auditor (after § Plan readiness):

- the project decides what is tested and at which layer; its test policy - the overrides document's
  § Test policy and any document that section names - is named to the auditor on the `TEST POLICY:`
  line of every readiness and review brief; the absence of a test the policy excludes is never a
  finding;
- the auditor decides whether a test that exists is honest - it can fail, it exercises production
  code, it was not narrowed to go green - and whether the code is correct;
- the floor: a behavior that writes stored data, computes money, or sits on a surface of COO routing
  check 1 (migration, access policy, grants, auth, permission model) always owes its proof;
- its suppression dual: a `TEST POLICY:` line that reads `none` leaves the pass to `review.md` alone.

`review.md`, § Test findings on confirmed code (rewritten; supersedes the 0.3.21 text): a weakness in
a test over code the Reviewer confirmed is a NOTE - named, never a `fail`, nobody owes its fix in the
ticket, listed in the record and settled at the close like an out-of-scope finding. On the floor it
is a REQUIRED NOTE: the Writer closes it before the commit, the COO checks the fix, no verification
pass. § Plan readiness: a demand for a test the policy excludes is INFO.

`plan.md`, § Plan readiness review: the readiness brief's `TEST POLICY:` line.

`ticket.md`, § Ticket brief contract: the brief's test list is the whole list - a Writer adds no case
its brief does not list and asks instead; a case the COO adds goes into the ticket with its ruling
before the dispatch; a brief that lists none leaves the Writer to the project's test policy.
§ Loop shape and its overrides: a plain note opens no correction round and no fix; a required note
is ticket work.

The Writer agent: the same list rule in the Writer's terms; "a missing obvious proof test is a scope
miss" now holds only where the brief lists no test cases.

`ORCHESTRATOR.md`, § COO owns broad scans, tripwire 3: a helper agent's output contract is its
reply; one whose hand-back is too long writes it whole under `<scratchDir>/agents/` at the path its
brief names and replies with a summary and that path. The two earlier sentences - a scan agent
writes no file; a procedure agent that must leave one writes it only under the scratch directory -
contradicted Gate 1, which refused every non-writer write inside the project root.

Three clarifications of wording, each closing a place where the generic text read against a
project's test policy:

- `work.md` § Routes: the brief's E2E line picks the row - a UI ticket whose brief says `E2E: no`
  takes the non-runtime row: no spec, no E2E run, no QA; `ticket.md` § Role boundaries (QA) says the
  same;
- `work.md` § Tests: the handoff E2E is run by the COO or a check agent it dispatches; a project
  whose overrides document says so accepts the Writer's kept green run over the final build instead;
- `ORCHESTRATOR.md`, tripwire 4: the instrument "made to fail on purpose" is a script, a grep or a
  gate; a test follows `review.md` § Test quality.

Outside the rendered files, arriving with the version:

- `scripts/engine/pretooluse-mutation-guard.js` - Gate 1 passes a non-writer agent's write under
  `.aiwf/agents/` and nowhere else inside the project root; `reviewer` and `qa` stay refused
  everywhere inside it; the self-check carries the new rows with their named-fault controls, the
  spike probes three rows;
- `skills/review/SKILL.md` - the `TEST POLICY:` slot of the review brief, the verdict vocabulary and
  Step 4;
- `templates/briefs/readiness-codex.md` - the `TEST POLICY:` paragraph of the readiness brief;
- `templates/briefs/record.md` - one more row under `## Measurements`: the auditor's blockers by
  kind, the effort split, the defects that reached the operator after the close;
- `docs/LOOP.md` § Enforcement of Writer-only writes and the README's enforcement line.

Why: on a consumer, over 19 closed tickets, the work on tests outweighed the work on code - one
ticket itemised at a little over twice - and the auditor's findings were the smallest source of that
volume: the ticket's named test list, additions beyond it and local rules were the larger ones, while
the auditor was handed the generic rules and never the project's own test policy (the arbiter
session's research, kept in the plugin's own repository; the counts are that session's and its scan
agents', not re-counted for this note). 0.3.21, released earlier the same day, kept the fix of every
weak test owed; by that session's reading of the consumers' configs no installation had taken it.

## What this migration does

- Six `rerender-managed-region` operations: `.claude/aiwf-native/ORCHESTRATOR.md`,
  `.claude/aiwf-native/doctrine/work.md`, `ticket.md`, `plan.md`, `review.md` and
  `.claude/agents/writer.md`
  (whole files), each additions block carried.
- One `note` (`test-authority-0-3-22`): `/pnp:update` prints it with the CHANGELOG blocks and its
  five `docRefs`.

## What it leaves alone

Every config key, the ask-ruleset, the Reviewer and QA agents (the Reviewer agent's
0.3.21 line still reads true), `AGENTS.md`, the managed `CLAUDE.md` region and every operator-owned
file - the overrides document's § Test policy included: the engine never writes it. The brief
contract's "a test is an enumerated matrix" sentence (`ticket.md`) and the proof sentences of `review.md` ("every acceptance
criterion maps to a proof", "N surfaces carries N fixtures or asserts") are unchanged.

## Superseded local rules

Two, named on the CHANGELOG block's `Retires local rules:` line: the interim local texts that point
the auditor at the project's test policy - one in `review.md § project additions`, one in `plan.md
§ project additions` - now duplicate `review.md` § The project's test policy and the auditor. A
local rule that makes a weak test over confirmed code a blocker or a required fix outside the floor
contradicts § Test findings on confirmed code. The note names both classes; the deletion stays the
consumer's act on its operator's word.
