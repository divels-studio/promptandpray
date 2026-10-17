# PLAN_RBA - REBUILD plan A: the structure

The first plan written in the cycle's folder format (`dev/REBUILD.md` § The cycle, approved by the
operator 2026-10-17). One folder: this index, `DECISIONS.md` (D-01..D-14), `RESEARCH.md` (the scan
of 2026-10-17), `tickets/RBA-NNN.md` (one file per ticket, the frozen contract), `records/RBA-NNN.md`
(written by the COO at each ticket's close). Readiness history, when there is one: `readiness/RBA/`.

Roadmap entry: `REBUILD` in `dev/backlogs/ROADMAP.md` (created by RBA-001; until then
`dev/REBUILD.md` is the entry). Plan B (the cycle as `/pnp:plan`, docs, release 0.3.0) and plan C
(after the measurement) are lines under that entry and are written after this plan lands.

## Goal

A project can hold its ideas in `ROADMAP.md`, write a plan as a folder of small files, and have that
folder checked mechanically before anyone pays for a readiness pass - the three pieces of structure
the cycle stands on, in PnP's payload, proven by the suites.

## Scope

In: the roadmap template and its seeding (setup + a `seed-file` op), the plan folder in every reader,
the mechanical plan gate on the folder contract, this repository's own roadmap and this folder as the
first stamped plan. Out: the migration and the 0.3.0 release (plan B, `RBA/D-04`), the `/pnp:plan`
skill and the `/pnp:review` rewrite (plan B), the doctrine prose of the cycle (plan B), the
measurement instruments and the suites (plan C), any consumer tree.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| RBA-001 | ROADMAP.md: template, setup seed, `seed-file` op, Gate 3 surface | D-01 D-02 D-03 D-05 D-06 | open | - |
| RBA-002 | the plan folder: every reader learns both shapes | D-07 D-08 D-09 | open | - |
| RBA-003 | the mechanical plan gate on the folder contract | D-10 D-11 D-12 | open | - |

Order: 001 -> 002 -> 003, each on the operator's own word (D-14). Route R2 code; the Writer
implements; `COO: top (Fable) - because check 1` on all three; a Codex pass over the code only on
the operator's word; no readiness pass on this plan (D-13). Each ticket closes with two commits -
the Writer's code commit, then the COO's record commit carrying `records/RBA-NNN.md` and this
table's row.

## Gates walked (the process trace)

1. The operator's word for RBA-001 (given 2026-10-17: „да") -> this folder lands in one docs commit
   (native dialog) -> `.aiwf/route-state.json` = `{ "ticket": "RBA-001", "route": "R2" }` -> Writer
   dispatch (Gate 2 raises ONE dialog: the folder is not readable by today's lookup, RBA-002 fixes
   that) -> `DONE` -> COO reads the full diff -> the Writer's commit (dialog) -> record commit
   (dialog) -> route state `{}`.
2. RBA-002 on its own word; after its commit Gate 2 finds `RBA-003` silently.
3. RBA-003 on its own word; after its commit `plan-gate.js --stamp dev/backlogs/active/RBA` writes
   `readiness/RBA/stamp.json`, committed with the record.
4. No tag, no push, no bump in this plan. The tree is clean between tickets except the parked
   `drafts/PLAN_DOCT.draft.md` + `readiness/DOCT/`, which no ticket touches.
