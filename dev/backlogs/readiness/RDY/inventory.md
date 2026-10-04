# PLAN_RDY - consumer inventory (Step 2, 2026-09-29; two sonnet Explore agents, before the draft)

Scan 1 - payload surfaces a new skill + a Step 2b change touch. Scan 2 - the two consumer projects
(artifact shapes in use, blocker corpus, local memories). Condensed to the rows the draft consumed.

| contract touched | consumer file:line | what it does with it | in worklist? |
|---|---|---|---|
| skills/<name>/SKILL.md (new dir) | .claude-plugin/plugin.json (no `skills` key) | host auto-discovers directories | n.a. (no edit) |
| skills/<name>/SKILL.md frontmatter | aiwf-selfcheck.js:5813-5849 sectionPayloadIntegrity | name == dirname, description present, Step 0 strings, interlock strings | yes (spec: byte-identical Step 0) |
| skills/README.md:6 `Shipped:` line | aiwf-selfcheck.js:5587-5601 structural read; :5590-5591 literal; :5768-5778 two controls | names vs directory listing; literal is the base the second control rewrites | yes (item 2, 3) |
| command count in prose | README.md:31 "Twelve commands"; README.md:191-206 table | human-readable enumeration | yes (item 10) |
| command count in history | CHANGELOG.md:178 "Both counts of twelve" | history block | no - history is not rewritten |
| skill enumeration elsewhere | templates/**, examples/**, validate-payload.mjs | zero hits | n.a. |
| fact-check gate text | skills/review/SKILL.md:197-262 (:214-221 task, :229-246 readiness lines, :209-211 dispatch) | the only agent-dispatch pattern in a skill; template for the new skill's dispatches | yes (item 4) |
| fact-check output described | docs/WORKFLOW.md:140-155 (:146-149), :375-401 | prose describing the gate's output shape | yes (item 6) - found by the ledger, missed by this scan |
| plan-readiness precondition | skills/review/SKILL.md:264-318 (:269-273) | inventory precondition bullet | yes (item 4) |
| readiness doctrine | docs/WORKFLOW.md:317-349 lock, :350-462 readiness, :64-125 scans, :842-857 fail aggregation; docs/LOOP.md:16,71 | authority the skill points at | yes (item 6, pointers only) |
| planning entry in session skills | skills/mission/SKILL.md, skills/work/SKILL.md (0 hits for plan/lock/readiness) | no planning entry today | yes (item 8) |
| chain-trace duty | templates/ORCHESTRATOR.md.tmpl:163-175 (+ :15, :40 intro - found by the ledger) | managed artifact; model-agnostic pin :5624-5630 | yes (item 7, migration) |
| operator entry points | templates/CLAUDE.md.tmpl:64-66 (found by the ledger) | managed region aiwf-core | yes (item 7b, migration) |
| memory seeds | templates/memory-seeds/*.md (17); generate.mjs:1581-1585 reads dir; no count pin | printed at setup | yes (item 11) |
| .aiwf/ scratch | .gitignore:1; review-brief.txt (review:329-336); route-state.json (mutation-guard.js:71) | no hook/assertion touches a new sub-dir | n.a. |
| release mechanics | migrations/index.json (array, last 0016 -> 0.2.12); 0016 note-only shape; validate-payload.mjs:14-30, :105-160, :274-329; plugin.json:3; examples/ untouched (HARD-019) | triple version match; op field sets | yes (item 12, 13) |
| self-install of this repo | 51dd2ce precedent; aiwf-selfcheck.js:4906-4911 version-stamp | release commit carries --apply artifacts | yes (item 14) - found in the own pass |

Consumer evidence consumed (scan 2): Furnissimo .aiwf/readiness-chains.md (behavior|chain|endpoint, 44
rows) and readiness-process.md (step|gate|tree|who|finding, 14 steps); Stratex PLANNING_QUALITY_ACCOUNT.md
(options A/B = behavior clause per link + same question to the fact-check agent); acceptance-simulation
table shape from PLAN_LIV.draft.md § Процес т.6; blocker corpus 54 items / 5 plans / 2 projects with the
frequency table in the draft's Context; local memories (own-pass-separate-turn, pre-dispatch-scan-
blocker-ledger, plan-proofs-are-literal-commands, chain-trace-evidence-pack, feedback_own_pass_separate_turn).

Closing greps (tripwire 4): `Twelve|twelve|12 commands|eleven` -> README.md:31, CHANGELOG.md:178, selfcheck
comments only; `/pnp:mission` -> 17 files (payload: CHANGELOG, CLAUDE.md, README, OPERATOR_PROTOCOL,
mission skill, CLAUDE.md.tmpl, migration notes); `skills/|SKILL.md` in validate-payload.mjs -> 0;
`readiness|fact-check|chain table|own pass` in memory-seeds -> 0.

Miss of this step, recorded honestly: three consumers were found only by the behavior ledger (WORKFLOW
:146-149 output-shape prose, ORCHESTRATOR.md.tmpl :15/:40 intro, CLAUDE.md.tmpl:64-66 entry points) and
one by the own pass (self-update precedent). The inventory question "who describes this mechanism in
prose" was not asked; the skill's Step 2 task must ask it.
