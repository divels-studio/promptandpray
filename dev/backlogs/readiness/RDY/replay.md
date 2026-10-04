# PLAN_RDY - blocker-class replay (Step 6, r0, 2026-09-29; by the COO - docs/READINESS_CLASSES.md does not exist yet)

| # | class | RDY-001 | pointer |
|---|---|---|---|
| 1 | unread consumer | PRESENT -> closed | CLAUDE.md.tmpl:64-66, ORCHESTRATOR.md.tmpl:15/40, WORKFLOW:146-149/:391 (chains rows 12, 17, 23) |
| 2 | library behavior from memory | ABSENT | skill-arg form verified at skills/update/SKILL.md:93; Agent tool types in use by review skill :209/:460 |
| 3 | closure / memo | N.A. | no runtime code |
| 4 | concurrency | N.A. | single Writer, one commit |
| 5 | state enumeration | PRESENT -> closed | fresh-on-existing-dir, --revise-without-pass, passes=0 (Decision 9) |
| 6 | data shape admitted by read path | PRESENT -> closed | index.json is an array (chains row 18) - acceptance command fixed |
| 7 | identifier does not exist | ABSENT | `$row.passes`, `{{config.paths.scratchDir}}`, `INTERLOCK_EXCEPTIONS`, `DOCTRINE_SHIPPED_COMMANDS`, `DOCTRINE_PASS_COMPENSATIONS` all opened |
| 8 | command not literal / cannot fail | PRESENT -> closed | index.json placeholder, Step 0 diff (empty L), frontmatter pipe mask, multi-file greps |
| 9 | test cannot prove | N.A. | no tests authored; selfcheck controls are the payload's own |
| 10 | permission / render-gate consistency | N.A. | |
| 11 | process order / actor | PRESENT -> closed | self-update inside the code commit (51dd2ce precedent); every word/dialog listed in § Процес |
| 12 | open decision left to the Writer | PRESENT -> closed | `--revise`; migration flags; Door 4 and WORKFLOW pointer paragraph now literal text |
| 13 | acceptance misses a risk-threshold item | PRESENT -> closed | frontmatter shape, flags, :423 pin, chain-table vocabulary, task-text phrases, --apply via bookkeeping hashes |
| 14 | fix after a pass adds new surface | N.A. (r0) | applies from --revise on |

Archive replay (best effort, this repo): dev/backlogs/archive holds 5 plans; the readiness blocker lists of
this repo live in PLAN_HARD's records - HARD-020 pass 2 returned 4, 2 born of the revision (CANDIDATES
:158-159): class 14. No further extraction attempted.

PRESENT: 8 of 14, all closed before Step 7/8.
