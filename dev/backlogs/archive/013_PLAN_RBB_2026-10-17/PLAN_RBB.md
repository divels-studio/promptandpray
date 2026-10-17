# PLAN_RBB - REBUILD plan B: the cycle as a skill and as doctrine

The second plan in the cycle's folder format and the first under the cycle itself: research before
the draft, the mechanical gate, ONE Codex readiness pass with the blocker contract, COO triage. One
folder: this index, `DECISIONS.md` (D-01..D-15), `RESEARCH.md` (the scan of 2026-10-17),
`tickets/RBB-NNN.md` (the frozen contract), `records/RBB-NNN.md` (written at each ticket's close).
Readiness history: `readiness/RBB/` (stamp, `round-N.md`).

Roadmap entry: `REBUILD` in `dev/backlogs/ROADMAP.md` (Size M; plan A archived as
`012_PLAN_RBA_2026-10-17/`; plan C follows the measurement).

## Goal

A project runs the approved cycle idea -> research -> decisions -> plan -> gate -> one Codex pass
-> triage -> approval through `/pnp:plan`, with the agent contracts shipped in the payload, the
doctrine stating that cycle once, and release 0.3.0 carrying it to the consumers with the list of
local rules it retires.

## Scope

In: the `/pnp:plan` skill and `templates/briefs/`; the `/pnp:review` readiness mode reduced to
what the skill calls; the docs, the pointer skills and the two template lines that still name the
struck artifacts; migration `0025_roadmap-seed`, the example bump's fifth op, the bump to 0.3.0 and
its CHANGELOG block; this repository's overrides cleaned of the retired rules. Out: the public
README rewrite (HARD-011, 0.3.1), the measurement instruments and the doctrine compaction (plan C),
any hook or engine change (`--hash`, a planner agent type - Deferred), any consumer tree.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| RBB-001 | `/pnp:plan` - the cycle as a skill, the brief templates | D-01 D-02 D-03 D-04 D-05 D-06 D-10 | closed (`05d8b39`) | `records/RBB-001.md` |
| RBB-002 | `/pnp:review` reduced; the docs and the pointers say the cycle once | D-07 D-08 D-09 | closed (`16ddc77`) | `records/RBB-002.md` |
| RBB-003 | release 0.3.0: migration 0025, the example bump, CHANGELOG, the retired rules | D-11 D-12 D-13 D-16 | closed (`f1ffd24`, `1e5c320`) | `records/RBB-003.md` |

Order: 001 -> 002 -> 003, each on the operator's own word (D-14). 001 and 002 are prose, R1 in the
main session, `COO: cheap (Opus) - all four no`; 003 is prose plus a code half through the Writer,
`COO: top (Fable) - because check 1` (D-14). Each ticket closes with its record in
`records/RBB-NNN.md` and this table's row; 003's code half closes with the Writer's commit first.
This plan: pass 1 on the plan's word (D-15); a second pass only under D-06.

## Gates walked (the process trace)

1. The operator's word for the plan (given 2026-10-17: „да") -> this folder drafted in
   `drafts/RBB/`, `plan-gate --stamp` (refuses on problems) then `--check` -> readiness pass 1
   (Codex, `review.plan` row; brief per D-05, hand-written per D-15) -> `readiness/RBB/round-1.md`
   -> revision if BLOCKERs (<= 2, the stall rule), re-stamped -> the operator's approval -> from
   the root: `Move-Item dev/backlogs/drafts/RBB dev/backlogs/active/RBB`, `git add
   dev/backlogs/active/RBB dev/backlogs/readiness/RBB dev/backlogs/ROADMAP.md`, one docs commit
   (native dialog).
2. RBB-001 on its own word: no route state (R1), the COO edits `skills/plan/`, `templates/briefs/`,
   `templates/README.md`; provenance grep + `validate-payload`; one commit (dialog); record commit.
3. RBB-002 on its own word: R1; the same two checks + the closing greps of its ticket; commit; record.
4. RBB-003 on its own word: route state `{ "ticket": "RBB-003", "route": "R2" }` -> Writer dispatch
   (Gate 2 silent: the ticket is in `active/RBB/tickets/`) -> the suites of D-14 except `selfcheck`
   in the background at handoff (the example cycle's step 8 is the self-check on a fresh 0.3.0
   install) -> the Writer's commit (dialog) -> route state `{}` -> the local `/pnp:update --apply`
   on the operator's word, auto mode off (D-16) -> `selfcheck` over `.` -> the COO's prose half +
   the self-install diff (CHANGELOG, overrides, README lines, `aiwf.config.json`; dialog) -> the
   archiving grep with its positive control (D-04) -> the record commit, which also archives this
   plan (`git mv dev/backlogs/active/RBB dev/backlogs/archive/<NNN>_PLAN_RBB_<date>`,
   `readiness/RBB/` stays) -> the tag word (`v0.3.0` on that commit, local) -> the push word (tag +
   `main`, one dialog) -> the live copy refreshed. No consumer is updated in this plan.
5. The tree is clean between tickets except the parked `drafts/PLAN_DOCT.draft.md` +
   `readiness/DOCT/`, which no ticket touches.
