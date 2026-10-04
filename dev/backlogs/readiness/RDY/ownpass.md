# PLAN_RDY - own pass (Step 5, separate turn, 2026-09-29) + replay (Step 6, inline)

Read: chains.md row by row + the six readiness checks against the draft. Each finding -> a plan line.

| chains row / check | plan line (draft) | what changed |
|---|---|---|
| row 3-4 (DOCTRINE_SHIPPED_COMMANDS literal goes stale -> control red) | worklist 3 | already in worklist; acceptance gained `grep -c "selfcheck, plan\.';"` |
| row 9/17 ("chain table" at review:231, WORKFLOW:391, tmpl:15/40/166) | worklist 4, 6, 7 | WORKFLOW :391-393 and tmpl :15/:40 added as explicit edits; closing grep across the three files -> 0 |
| row 11 (DOCTRINE_PASS_COMPENSATIONS pin at review:423) | worklist 4, risk threshold | "do not touch :423" + acceptance grep -> 1 |
| row 12 (WORKFLOW:146-149 describes the old output shape) | worklist 6 | explicit edit + acceptance `only the false or unverifiable claims` -> 0 |
| row 15 (ifRecorded is dead code / backwards) | Decision 14, worklist 12, acceptance | NO flag on either rerender op; acceptance grep for flags -> 0 |
| row 23 (CLAUDE.md.tmpl:64-66 entry points = managed region) | Decision 15, worklist 7b, 12 | second rerender op `CLAUDE.md#aiwf-core`; template sentence gains `/pnp:plan` |
| row 30 (triple 0.3.0) | worklist 12, acceptance | ops.json targetPluginVersion grep added |
| check 4 (gate dry-run: selfcheck version-stamp :4906-4911 goes red when payload > installed) + precedent 51dd2ce | Decision 16, worklist 14, process 2, diff guard | self-update `--apply` inside the code commit; allowlist gains the three self-install artifacts + root CLAUDE.md |
| check 5 (acceptance literal): index.json command was a placeholder; Step 0 diff had no line anchor; multi-file grep had no fail form | acceptance | literal node -e with exit 1; `L=$(grep -n ...)` anchor; `| grep -c ":0$"` -> 0 forms |
| check 5 (risk item without a check): frontmatter 4th field / order | acceptance | sed 1p/5p/2p/4p checks |
| check 3 (open decision): argument syntax revise | spec | `--revise`, flag form after `/pnp:update --resolve` |
| check 3 (open state): fresh on existing dir; revise without a pass | spec | resume at first missing artifact; stop "no pass to revise from" |

## Replay - moved to replay.md (Step 6 artifact of its own; the table below is the r0 snapshot kept for the record)

| # | class | RDY-001 | pointer |
|---|---|---|---|
| 1 | unread consumer | PRESENT -> closed | CLAUDE.md.tmpl:64-66, tmpl:15/40, WORKFLOW:146-149/:391 (chains rows 12, 17, 23) |
| 2 | library behavior from memory | ABSENT | harness skill-arg form verified against skills/update/SKILL.md:93; Agent tool types Explore/general-purpose in use today |
| 3 | closure / memo | N.A. | no runtime code |
| 4 | concurrency | N.A. | single Writer, one commit |
| 5 | state enumeration | PRESENT -> closed | fresh-on-existing-dir, revise-without-pass, passes=0 (Decision 9) |
| 6 | data shape admitted by read path | PRESENT -> closed | index.json is an array (chains row 18) - acceptance command fixed |
| 7 | identifier does not exist | ABSENT | `$row.passes`, `{{config.paths.scratchDir}}`, `INTERLOCK_EXCEPTIONS`, `DOCTRINE_SHIPPED_COMMANDS` all opened |
| 8 | command not literal / cannot fail | PRESENT -> closed | index.json placeholder, Step 0 diff, multi-file greps |
| 9 | test cannot prove | N.A. | no tests authored; selfcheck controls are the payload's own |
| 10 | permission / render-gate consistency | N.A. | |
| 11 | process order / actor | PRESENT -> closed | self-update inside the code commit (51dd2ce precedent); tag/push words listed |
| 12 | open decision left to the Writer | PRESENT -> closed | `--revise`; migration flags; door 4 in the managed region |
| 13 | acceptance misses a risk-threshold item | PRESENT -> closed | frontmatter shape, flags, :423 pin, chain-table vocabulary now each have a command |
| 14 | fix after a pass adds new surface | N.A. (r0) | applies from --revise on |

Archive replay (best effort, this repo): dev/backlogs/archive has 5 plans; their readiness blocker lists live in
PLAN_HARD (active) records instead - HARD-020 pass 2 returned 4 blockers, 2 born of the revision (CANDIDATES:158-159):
class 14 - is the reason the revise mode exists. No further extraction attempted here.

FINDINGS: 12 -> all closed in the draft before Step 7/8.
