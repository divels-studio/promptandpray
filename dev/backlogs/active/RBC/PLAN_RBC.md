# PLAN_RBC - REBUILD plan C: the measurement, the doctrine compaction, two gate defects

The third plan of the roadmap entry `REBUILD` in `dev/backlogs/ROADMAP.md` (Size M; plan A archived
as `012_PLAN_RBA_2026-10-17/`, plan B as `013_PLAN_RBB_2026-10-17/`). One folder: this index,
`DECISIONS.md` (D-01..D-12), `RESEARCH.md` (the scan of 2026-10-17 at `ba8d626`),
`tickets/RBC-NNN.md` (the frozen contract), `records/RBC-NNN.md` (written at each ticket's close).
Readiness history: `readiness/RBC/` (the stamp, the rule-homes tables of RBC-002).

## Goal

The cycle is measured with a fixed row - the four numbers of D-02 written at the plan's approval
and at each ticket's close, the two session-start numbers of D-04 with a written protocol - the
three payload doctrine documents and this repository's whole overrides document carry every rule
and none of the stories, each rule in one home, and the two gate defects found in plan B are fixed with
their controls: the provenance walk passes a plugin root whose `.git` is a gitfile, and the ticket
byte cap stops counting the header `Status:` line.

## Scope

In: `templates/briefs/record.md` (new), the measurement steps of `skills/plan/SKILL.md`, the
pointer in `docs/WORKFLOW.md` § Durable development history, the start protocol in
`dev/REBUILD.md` (RBC-001); the compaction of `docs/WORKFLOW.md`, `docs/LOOP.md`,
`docs/REVIEW_CHECKLIST.md` and the whole `dev/PROJECT_OVERRIDES.md` (its template stays out), with
token counts before and after against guide targets, and the deletion of the parked DOCT material
(RBC-002); `scripts/engine/plan-gate.js`, the provenance walk and the controls
of `scripts/selfcheck/aiwf-selfcheck.js`, and the three prose statements of the cap (RBC-003).

Out: the suites (REBUILD's original C3) and everything else under `## Deferred` of `DECISIONS.md`;
`docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md`, the skills other than `plan`, the
rendered templates; any change to `/pnp:mission`; a migration or a version bump - plan C ships with
the plugin on push, 0.3.1 stays HARD-011's (D-11); any consumer tree.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| RBC-001 | the measurement instruments: the record skeleton, the approval row, the start protocol; the chain-trace rule | D-02 D-03 D-04 D-13 | open | - |
| RBC-002 | the doctrine compaction: WORKFLOW, LOOP, REVIEW_CHECKLIST, the whole overrides | D-05 D-06 D-07 D-08 | open | - |
| RBC-003 | the two gate defects: the root gitfile, the header `Status:` line | D-09 D-10 | open | - |

Order (D-01): 001 -> 002 -> 003, each on the operator's own word; 001 first because 002's
before/after is taken with its protocol. This plan gets NO readiness pass: the operator's word of
2026-10-17 („имаш дума и за двете") covered running `/pnp:plan` and no Codex readiness pass.
Routes and rows (D-11): 001 and 002 are prose, R1 in the
main session, no auditor, VERIFY = the provenance grep + `validate-payload`; 003 is code, R2 through
the Writer, VERIFY rows `selfcheck` + `spikes` + `validate-payload` once, in the background, at the
handoff; no Codex code pass (the operator's answer at the approval, „Без пас"). COO routing (D-12): 001 and 002
`COO: cheap (Opus) - all four no`; 003 `COO: top (Fable) - because check 1`. From RBC-001's own
record on, every record of this plan is written on `templates/briefs/record.md`.

## Gates walked (the process trace)

1. The operator's word for the plan (given 2026-10-17) -> this folder drafted in `drafts/RBC/` ->
   `plan-gate --stamp` then `--check` -> no readiness pass (the same word) -> the approval report;
   the operator's answers there are recorded (D-11: no Codex code pass on RBC-003; D-13: the
   chain-trace rule enters RBC-001) -> the landing: `Move-Item dev/backlogs/drafts/RBC dev/backlogs/active/RBC`, `git add
   dev/backlogs/active/RBC dev/backlogs/readiness/RBC dev/backlogs/ROADMAP.md`, one docs commit
   (native dialog).
2. RBC-001 on its own word: no route state (R1); the COO edits; the two checks; one commit (dialog,
   the rule text shown in it - guard (g)); the live copy refreshed; the record commit (dialog).
3. RBC-002 on its own word, in a fresh session (start number (a) asked before any plan file is
   read): R1; the compaction; the rule-homes agent; the closing greps; one commit (dialog); the
   live copy refreshed; the two DOCT deletes (two delete dialogs, D-08); the record commit. The
   (a) number after is asked at the next fresh session and written into `dev/REBUILD.md`.
4. RBC-003 on its own word: route state `{ "ticket": "RBC-003", "route": "R2" }` -> the Writer
   dispatch (Gate 2 silent: the ticket is in `active/RBC/tickets/`) -> the three VERIFY rows once in
   the background -> the Writer's commit (dialog) -> route state `{}` -> the COO's prose half (one
   commit, dialog) -> the live copy refreshed -> the record commit, which also archives this plan
   (`git mv dev/backlogs/active/RBC dev/backlogs/archive/<NNN>_PLAN_RBC_<date>`, `readiness/RBC/`
   stays) and sets the roadmap entry's status. No tag; the push only on the operator's push word
   (one dialog).
5. Every ticket's close re-stamps `readiness/RBC/stamp.json` after the table row flips, and
   `plan-gate --check dev/backlogs/active/RBC` exits 0 before the record commit.
