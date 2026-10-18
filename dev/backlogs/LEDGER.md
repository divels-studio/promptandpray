# Ledger

Seeded once and then yours: nothing in the plugin records this file, hashes it or rewrites it, so an
update never touches what you put here. It is a pointer index. Under Plans, one line per plan names
its readiness folder and its records; a plan's own rulings and passes live in its readiness folder's
`ledger.md`. Under Rows that belong to no plan, one row per ruling, pass, event or dropped idea that
no plan owns, shaped `| date | kind | text | pointer |`. Ideas live in `ROADMAP.md` under the plans
directory.

## Plans

- RBA - readiness/RBA/, archive/012_PLAN_RBA_2026-10-17/records/
- RBB - readiness/RBB/, archive/013_PLAN_RBB_2026-10-17/records/
- RBC - readiness/RBC/, archive/015_PLAN_RBC_2026-10-18/records/
- GENERIC - readiness/GENERIC/, archive/016_PLAN_GENERIC_2026-10-18/records/

## Rows that belong to no plan

| date | kind | text | pointer |
|---|---|---|---|
| 2026-10-18 | dropped | SCRATCH dropped: the operator does not need it („маха се от роадмапа, не ми трябва") - the API key outside `.aiwf/` and a cleanup that never deletes an operator file | `CANDIDATES.md` history, `git log -S SCRATCH -- dev/backlogs/ROADMAP.md` |
| 2026-10-18 | operator-correction | the consumer 0.3.1 sweep brief covered only the 0.3.1 Retires names against the overrides doc; both consumer sessions re-scanned memory, the 0.3.0 leftovers and the local-vs-payload contradictions themselves and committed a second fix (Silerax `b8b4a53`, Furnissimo `7297b31`); from now a consumer sweep covers every Retires line since the installed version, memory, the CLAUDE.md operator zone, and contradictions, not only duplicates („не можа да се справиш както трябва") | this session's memory `consumer-sweep-covers-all-retires-and-memory` |
| 2026-10-18 | operator-correction | ROADMAP statuses were written by hand and no stage touched them („роадмапа REBUILD стои in progress - отдавна е затворен, GENERIC - planned, на финала са") -> the roadmap is written at exactly three events; approved „да" | payload `docs/WORKFLOW.md` § Durable development history (archiving paragraph); `skills/plan/SKILL.md` landing step |
