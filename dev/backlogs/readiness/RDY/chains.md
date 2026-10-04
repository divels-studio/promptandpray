# PLAN_RDY - behavior ledger (Step 4, r0, 2026-09-29; one sonnet Explore agent, 38 rows, 1 UNREAD, 17 notes)

Rows condensed to the cells that carry behavior; the agent's full text is in the session transcript.

## CHAIN 1 - `/pnp:plan` seen by host and self-check
| # | link | DOES | STATES | NOTE |
|---|---|---|---|---|
| 1 | skills/README.md:6 | read as data by shippedIndexNames/skillDirNames | - | - |
| 2 | aiwf-selfcheck.js:5593-5601 | regex `^Shipped:\s*(.+)$`, strips trailing `.`, splits on `,`, trims, strips backticks; ORDER not significant (`.includes`), CASE significant; dirs = readdirSync sorted | no Shipped line -> null; empty skills/ -> fail | append `, plan` before the final `.`, no backticks |
| 3 | aiwf-selfcheck.js:5760-5779 | control A mkdir skills/ghost; control B doctrinePhrase(README, DOCTRINE_SHIPPED_COMMANDS, ...telemetry) | control B THROWS if the literal is not found verbatim | **DOCTRINE_SHIPPED_COMMANDS :5590-5591 is a hand-maintained literal; stale -> control reported RED ("control could be applied")** |
| 4 | aiwf-selfcheck.js:5711-5715, :5791 | phraseRe miss -> throw -> caught as check(false) + continue | the sabotage assertion never runs for that control | confirms row 3 |
| 5 | aiwf-selfcheck.js:5813-5849 | per dir: SKILL.md exists; `^name:\s*(\S+)$` == dirname; `^description:\s*\S`; ALL of `Step 0`, `git rev-parse --show-toplevel`, `aiwf.config.json`, `/pnp:setup`; interlock: `scripts/update/aiwf-update.mjs` AND `--check` unless in ['update','selfcheck']; bans `/enforced\s+from v0\.2|do not simulate/i` | independent per skill | satisfied by a byte-identical mission Step 0 (:15,18,21,23) |
| 6 | aiwf-selfcheck.js:5646, :5681, :6060, :6298 | README re-read; DOCTRINE_COPY_DIRS ['docs','skills','templates']; PROV_AREAS includes skills; unrelated encoding control | directory-listing based | new dir auto-covered by provenance + copy base |
| 7 | .claude-plugin/plugin.json:1-15 | no skills/commands list | - | host loader external |
| 8 | .github/workflows/ci.yml | per leg: validate-payload, test-setup, test-update, (shellcheck), spikes, example-cycle, selfcheck | macos continue-on-error | nothing counts skills outside selfcheck; chain ends at selfcheck stdout/exitCode |

## CHAIN 2 - fact-check ledger
| 9 | skills/review/SKILL.md:197-262 (:213-221, :228-247, "chain table" :231) | dispatch text for Explore/sonnet; three readiness lines | doc | **"chain table" phrase also at docs/WORKFLOW.md:391 and ORCHESTRATOR.md.tmpl:166 - coordinate** |
| 10 | skills/review/SKILL.md:264-318 (:269-273) | precondition bullet, host row, brief fields, ceiling semantics | doc | clean pointer target |
| 11 | aiwf-selfcheck.js:5576-5578 DOCTRINE_PASS_COMPENSATIONS -> skills/review/SKILL.md:423 | pinned sentence "A readiness pass after the first may resume only with its compensations, and only on the operator's word" | phrase test | **must survive the Step 2b rewrite (it is outside :197-318)** |
| 12 | docs/WORKFLOW.md:140-155, :375-401 | :148-149 says the gate returns "only the false or unverifiable claims with file:line and the correct value" + gaps | doc | **output shape changes -> WORKFLOW :146-149 must be edited too; plan listed only review skill** |

## CHAIN 3 - Behavior ledger duty + migration 0017
| 13 | validate-payload.mjs:105-137 | rerender op: required op/file/region/template; optional ifRecorded/createIfAbsent | - | - |
| 14 | validate-payload.mjs:376-396 | rejects BOTH flags present (by key, not truthiness); rejects createIfAbsent with non-null region | :387 error string pinned by suites | ifRecorded alone + region null passes |
| 15 | scripts/update/migrate.mjs:619-724 planRerender | not recorded: ifRecorded -> skip; createIfAbsent -> render/stamp or THROW on differing file; neither -> THROW. Recorded: held & !localEdit -> record upstream only; !localEdit & !upstreamChange -> no-op; !localEdit & upstreamChange -> SILENT take-new; localEdit -> conflict dialog | ORCHESTRATOR.md recorded on every installation since 0012 (createIfAbsent) | **`ifRecorded: true` is dead code on every current installation and semantically backwards vs the field's purpose; precedent = NEITHER flag** |
| 16 | aiwf-selfcheck.js:5618-5640, :5716-5723 | fails on `/config\.roles\./`, `/^(?:model|effort):/m`, first line `---` | - | rewrite must avoid exactly these |
| 17 | ORCHESTRATOR.md.tmpl:15, :40; WORKFLOW.md:391; review/SKILL.md:231 | :15/:40 are the template's own intro naming "chain-trace duty" | - | **rename heading only -> same file inconsistent; all four sites must move together** |
| 18 | migrations/index.json | JSON ARRAY of {id, targetPluginVersion}; last: 0015 0.2.11, 0016 0.2.12 | - | - |
| 19 | migrations/0016/* | note-only precedent; 0012 = note + two rerenders (mixed shape precedented) | - | - |
| 20 | scripts/update/test-update.mjs | no pin on count 16 / last id / 0.2.12 | - | - |

## CHAIN 4 - pointers and doors
| 21 | grep "three doors" | docs/OPERATOR_PROTOCOL.md:1, :7; docs/README.md:14 (+ this draft) | - | three payload edits |
| 22 | aiwf-selfcheck.js:5519-5669 | the 9 kept doctrine checks: 4x WORKFLOW sentences (one word per pass; newborn question; host precedence; doctrine-write gate), 1x review/SKILL.md (compensations), 3 structural (template model-agnostic; shipped index; two git -C ruleset) | - | none targets § Plan readiness review or OPERATOR_PROTOCOL |
| 23 | templates/CLAUDE.md.tmpl:64-66 | managed region `aiwf-core` renders "Session entry points for the operator: /pnp:mission, /pnp:work, or no command" | rerendered by /pnp:update | **a fourth door is a managed-region change -> rerender op on CLAUDE.md#aiwf-core in 0017 (as 0012 did), or the region contradicts OPERATOR_PROTOCOL** |
| 24 | skills/mission/SKILL.md:53-61 | Report and STOP + newborn rule | - | clean insertion |
| 25 | skills/work/SKILL.md:45-51 | Classify and route | - | clean insertion |
| 26 | docs/WORKFLOW.md:350-462 | § Plan readiness review spans confirmed; :384-401, :419-432 inside | - | - |
| 27 | docs/OPERATOR_PROTOCOL.md:1-30 | title, heading, Doors 1-3, guarantees | - | no pin |
| 28 | docs/README.md:6-15 | index line :14 says three doors | - | edit |

## CHAIN 5 - version 0.3.0
| 29 | .claude-plugin/plugin.json:3 | version read by host + validate-payload | - | - |
| 30 | validate-payload.mjs:255-330 | last manifest entry version == plugin version; dir<->entry one-to-one; ops.json {migration, targetPluginVersion, operations}; ops.migration == dir id; ops.targetPluginVersion == manifest entry | **triple 0.3.0: plugin.json, index.json last, 0017/ops.json** | - |
| 31 | scripts/ grep 0.2.12 / 0016 | zero | - | - |
| 32 | scripts/ci/example-bump.mjs | next id = manifest length + 1; next minor of the payload it lands in | version-agnostic | - |
| 33 | scripts/ci/run-example-cycle.mjs | runs against a copy; asserts repo unchanged | - | - |
| 34 | .github/workflows/ci.yml | no release/tag job | CHAIN ENDS EARLY (tag is operator-side) | expected |

## CHAIN 6 - seed
| 35 | templates/memory-seeds/durable-plan-goes-through-pnp-plan.md | UNREAD (does not exist yet) | - | contract in row 36 |
| 36 | scripts/setup/generate.mjs:1581-1585 | readdirSync, `.md` filter, sort, {name, text}; no format/count check; dir missing -> [] silently | 0/1/N fine | - |
| 37 | generate.mjs:1652,1669-1675; callers :1716, interview.mjs:315 | printed under "MEMORY SEEDS" banner unless --no-seeds/--dry-run/blocked; console.log sink | 0 seeds -> banner skipped | - |
| 38 | test-setup.mjs, aiwf-selfcheck.js | no seed-count pin | - | - |

ROWS: total=38 unread=1 notes=17
