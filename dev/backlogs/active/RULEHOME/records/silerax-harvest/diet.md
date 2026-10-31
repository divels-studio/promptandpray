# Silerax diet (RULEHOME-003 step 4, D-07 (4)) - `D:\Stratex\dev\PROJECT_OVERRIDES.md` at `93e18379` (674 lines)

Three tables. `## Conflicts` first: one row per local-vs-local conflict, the operator's answer from
the ONE dialog, written before any diet edit. `## Rules`: one row per overrides line (the index
§ RULEHOME-003 diet pointers, re-anchored at `93e18379` - the file is unchanged since `9020e8c3`),
`decided by` a D-NN, a payload pointer or a `## Conflicts` answer. `## Memory`: one row per Silerax
memory file. The Silerax COO executes the verdicts on this file's brief; every delete through its
dialog; the overrides keep identity, hard rules, product truth and true project rules; COO-only rules
go to `.claude/aiwf-native/ORCHESTRATOR.md` project additions, Writer-only rules to
`.claude/agents/writer.md` project additions; a rule BOTH obey stays in the overrides (D-09); state
and procedures go to their own files; retired rules are deleted.

## Conflicts

| # | conflict | sources | answer (the operator, 2026-10-31) |
|---|---|---|---|
| 1 | mockup vs code authority | :265 (10-15 "site and code after Phase 3"), :273 (10-22 "the code is the truth", freeze lifted 10-24), :280 (10-24 precedence: redesigned code/UI > register > CANON > old mockups), :620, :626, :663 (QA / comparison / canon-mockup procedures), memory `feedback_mockup_from_site` | „това няма нищо общо с плъгина и трябва да го решим в силеракс + отива в мапа със статус S0" - not the diet's to resolve: the three rules and the procedures stay as they are; the conflict becomes a Silerax roadmap line (§ Defects, severity S0, module docs) to be decided in Silerax |
| 2 | DB checks: the COO runs DEV/PROD SELECTs itself (memory `feedback_db_checks_and_push_steps`, hard rule 10-24, "push/apply via `!`") vs :18-23 "anything against the linked Supabase project or prod env needs a confirm" | :18-23; memory | "SELECT сам, запис с потвърждение" - read-only SELECTs on DEV and PROD: the COO itself, no question; the confirmation (dialog or `!`) stays for WRITES only (apply, seed, push); :18-23 reworded so |
| 3 | the context ceiling: :647 "~400k tokens, a ticket boundary (payload session rule)" vs `.claude/hooks/context-gate.mjs:14-15` REMIND 950000 / NOW 1000000 | :647-655; the hook | „куката да се премахне тотално, тя беше създадена заради експеримента с компактиране на сесията. 400К за голям тикет е малко но това е проблема на пейлоада не на силеракс, нека си добавят правило 600К овъррайд на правилото, ние в пнп ще го мислим - отива тук в роадмапа" - the hook `context-gate.mjs` (+ its settings wiring and `long-command-guard.mjs`'s sibling only if it is the same experiment - it is not: it stays) is REMOVED (a Silerax code-class item); the overrides sentence becomes a local override "the session rule's ~400k is overridden to 600k here"; PnP ROADMAP § CTX gains the line (the payload reconsiders the number) |
| 4 | which roadmap: :501 `roadmap: ROADMAP.md` (root) vs :179 `dev/backlogs/ROADMAP.md` (one home, 10-26) | :501; :179 | „в корена е замразен, водещ е в дев беклогс, s0 В роадмапа да се запише анализ на двата файла" - `dev/backlogs/ROADMAP.md` leads; the root `ROADMAP.md` is frozen (a frozen-history banner); :501 fixed; a Silerax roadmap line (S0): an analysis of the two files - what the root one still holds that the leading one lacks |
| 5 | English everywhere (:523) vs 28 Cyrillic lines in the overrides itself (155-156, 159, 162, 177, 213, 220, 273, 276-278, 283-285, 321-325, 327, 333, 382, 526-527, 530, 608, 635-636) and the Bulgarian CHANGELOG (`CLAUDE.md:129`) | :523-530; the lines | „правилото е: всичко в проекта е на английски, changelog следва езика на комуникацията при сетъп на плъгина, цитати следват езика на комуникацията по сетъп (преводът им би бил не 100 процентови твърдения ако се наложи да се доказват решения пред оператора). В PNP влиза - промяна на сетъп и доктрина с въпроси на какъв език да се водят различните записи" - in Silerax: the operator's verbatim quotes stay Bulgarian, every other Bulgarian sentence is translated; the CHANGELOG stays Bulgarian; the :523-530 rule reworded to exactly that. In PnP: ROADMAP § SETUP + § DOCTR - the setup interview asks the language per record class (changelog, quotes, the rest), the doctrine reads it |
| 6 | counterparty vs supplier: memory `project_mission_resume` "counterparty, never supplier" vs memory `user_domain_expert_wife` ("supplier reports") and :326-328 | memory; :326 | „това е приоритет не 1, не 0, не -10, а е първото нещо което трябва да уточним преди затваряне на тяхната текущата сесия - жена ми беше пример еднократен за това от къде знам бизнес модела ... Жена ми? А аз къде съм? Кой води, жена ми или аз?" - the TERM is settled by the operator in the Silerax session FIRST, before that session closes (the Silerax COO asks it there, one dialog); the memory `user_domain_expert_wife` is wrong in its framing (the operator is the source of the business model; the wife was a one-time example) -> deleted; the chosen term is written into § Product truth |
| 7 | "never write dates" (memory `project_plan_order`, "no dates anywhere") vs the dated rule markers `(operator rule <date>)` throughout the overrides | memory; the overrides | „Дата - исторически запис - ОК! Дата - срок за изпълнение - никога! ... дати - срокове - никога, освен ако аз изрично не съм ги посочил или определил" - a date as a historical record is fine (the markers stay); a date as a DEADLINE never, unless the operator set it explicitly (machines have no view of how long a plan takes in real life - this plan's 003 exceeded half a day); the memory sentence narrowed to that, the rule written into the overrides (one line) |

Also from the dialog (not a conflict): questions to the operator are asked as DIALOGS (the
AskUserQuestion tool), never as a chat list, and never with line numbers - the operator's correction
of 2026-10-31 in the PnP session („казвам го за последен път - въпроси се задават с диалози, а не в
чата като прочетена книга - фурнисимо и силеракс го правят от ден 1").

## Rules

Verdicts: `stays` (identity / hard rule / product truth / true project rule, in the overrides);
`delete` (retired - the payload carries it, or history); `move -> <home>` (state or procedure to its
own file; a COO-only rule to the ORCHESTRATOR additions block; a Writer-only rule to the writer.md
additions block); `fix` (a contradiction resolved to the payload or by a conflict answer).

| line(s) | rule / block (short) | verdict | new home | decided by |
|---|---|---|---|---|
| 14-17 | No AI traces in git | stays | - | project hard rule |
| 18-23 | destructive / system-changing class incl. "anything against the linked project or prod env" | fix per conflict 2 | - | Conflicts #2 |
| 24-28, 29-31, 32-33 | local E2E without dialogs; the scripts' regression check; `git rm` without a dialog | stays | - | project hard rules (ask-rule configuration) |
| 34-37 | "Agents work without dialogs - PnP. Our addition" | stays, trimmed to the addition (the ask class routes, gated verbs never as grep text) | - | pointer form; payload WORKFLOW § Ticket brief contract |
| 38-41 | "The environment belongs to the agents": the `.aiwf/` delete half + "its environment stopped" half | fix: the scratch half deleted (0.3.7 Retires: the ticket-end scratch cleanup, the delete dialog the gate; the keep-or-move rule in WORKFLOW § Durable development history); the environment-stop half stays | - | 0.3.7 Retires line |
| 42-56 | stopping the local E2E environment; reset vs build; no RAM preflight; one local E2E at a time | stays | - | project environment rules |
| 57-59 | the commit follows the artifact class - PnP, our addition | stays (addition only) | - | pointer form |
| 60-73 | `:3000` the operator's / `:3100` the E2E server; the `webServer` note; "`AGENTS.md` § Hard rules states the same condition" (:72-73) | fix: the `AGENTS.md § Hard rules` cite dropped (no such section; AGENTS.md's additions hold § Known-red commands and § Seeding only); the rest stays | - | RESEARCH § S2 (the dead cite) |
| 74-75 | migration / database workflow: stop and ask | stays | - | project hard rule |
| 76-77 | editing is not a shell job - PnP; our addition (`unix2dos`, a writing script forbidden; guard (f)) | move -> writer.md additions (the Writer edits; the COO's own edits are R1 prose there too - BOTH obey -> stays) | stays in the overrides, trimmed to the addition | D-09 (both roles obey) |
| 78-81 | the `node_modules` junction before `git worktree remove` | stays | - | project hard rule (ported to Furnissimo marker) |
| 82-90 | push to origin - migrations first; a release pushes main and the tag only | stays | - | project hard rules |
| 91-92 | long commands - background only - PnP; our addition (ad-hoc agents included) | stays, trimmed to the addition | - | pointer form; LOOP § Role boundaries (0.3.7: one threshold) |
| 93-94 | a foreign live session's tree | stays | - | project hard rule (D-07's own principle) |
| 95-97 | no `cd` prefix - PnP; our addition (`npm --prefix silerax`, the two cwd exceptions) | stays, trimmed to the addition; the payload sentence names the habit guard | - | 0.3.7 Retires line (no cd prefix) |
| 99-120 | Documentation trust boundary (SRR-044 state, the unswept example, CANON classes) | move -> `D:\Stratex\dev\DOCS_TRUST.md` (state); the one rule sentence (:107-109 cut-off 2026-09-14, a path reference is suspect, a disagreement is reported) stays in the overrides under § Hard rules | `dev/DOCS_TRUST.md` | RESEARCH § S2 Misplaced |
| 124-126 | checklist first; restate scope | stays | - | the seeded defaults (this repository's too) |
| 127-128 | surgical edits - PnP, our addition; references before a delete or edit | stays, trimmed to the additions | - | pointer form |
| 131-132 | mission resume memory - PnP; our addition (MEMORY.md one line each) | stays (addition only) | - | pointer form |
| 133-135 | a per-request cost is measured before the approval report | move -> ORCHESTRATOR additions (a COO planning rule) | ORCHESTRATOR additions | D-07 homes |
| 136-137 | the record answers before the operator is asked | delete | - | 0.3.7 Retires (`/pnp:plan` asks only what is unrecorded; `/pnp:mission` Step 3) |
| 138-141 | questions come after the research | delete | - | 0.3.7 Retires (`skills/plan` Step 1, f61817f) |
| 142-148 | a plan built on approved mockups | move -> ORCHESTRATOR additions (COO planning) | ORCHESTRATOR additions | D-07 homes; the mockup-authority wording per Conflicts #1 |
| 149-158 | a plan that replaces a path records the old path's behaviour first | move -> ORCHESTRATOR additions (COO planning); the PnP side harvested (ROADMAP § BRIEFS) | ORCHESTRATOR additions | D-07 homes |
| 159-164 | a live import that proves a code change starts with the cache row cleared | stays (product truth of the import's cache) | - | product |
| 166-173 | "Execution guards (retired locally 2026-10-22)" pointer paragraph | delete, leaving ONE line: "Execution guards: PnP doctrine since 0.3.3; a `guard N` reference reads against `readiness/OCRG/arbiter-OCRG-002-ruling.md`" (the :171 pointer already re-pointed at the harvest in step 3) | - | 0.3.3 Retires line; RESEARCH L36 |
| 175-178 | "One home for open work" heading + the occasion line (:177 re-pointed in step 3) | stays as the heading; the Bulgarian quote per Conflicts #5 | - | - |
| 179-184 | One home - the roadmap is the only document for open work | stays (project rule; the payload's roadmap is "live entries", this widens it) | - | project rule |
| 185-203 | plan close; ticket close; closed work leaves the roadmap; plan landing | fix: "closed work leaves the roadmap at the ticket's close" (:192-196) deleted - 0.3.7 carries the fifth roadmap write and the record skeleton's checklist line; plan close / ticket close / plan landing stay (the project's own routing of Deferred items and debt - harvested as a PnP idea, ROADMAP § DOCTR) | - | 0.3.7 Retires (via RULEHOME-001 D-16 (a)); harvested L88 |
| 204-209 | the roadmap is written at one moment per session | stays (a two-sessions-one-tree rule of the project) | - | project rule |
| 210-219 | TODO in code; audit findings; the register is history | move -> the roadmap's own header (procedures of the roadmap) | `dev/backlogs/ROADMAP.md` header, local section | RESEARCH § S2 Misplaced (roadmap design) |
| 220-221 | Mockups: rule Р9 retired, a defect found while mocking up is a roadmap line | move -> `dev/backlogs/drafts/ui-redesign/README.md` | the redesign README | RESEARCH § S2 Misplaced |
| 222-232 | Ideas and defects (local - PnP candidate) | move -> the roadmap's header; the "PnP candidate" marker becomes "harvested to PnP 15623e5 (ROADMAP § DOCTR)" | `dev/backlogs/ROADMAP.md` header | RESEARCH § S2; harvested L90 |
| 233-239 | Roadmap structure (local - PnP candidate) | move -> the roadmap's header; the marker as above | `dev/backlogs/ROADMAP.md` header | RESEARCH § S2; harvested L88 |
| 241-253 | Defect work (no plan for an ordinary fix; an auditor on every R2 fix; a research scan first; only a confirmed defect; against a mess) | stays (the project's loop shape for defects) | - | project rules (ledger L91) |
| 254-263 | sibling products and negative scope; the direction lives in the plans | stays | - | identity |
| 265-271, 273-278, 280-285 | the three mockup-authority rules (10-15, 10-22, 10-24) | stays untouched; the conflict is a Silerax roadmap line (S0) decided in Silerax, not by the diet; the Bulgarian quotes stay (Conflicts #5) | - | Conflicts #1 |
| 291-316 | architecture direction; data, tenancy and access control | stays | - | identity / product boundary |
| 319-334 | product truth: Excel reports are structured data; the location leads; money and VAT | stays (the Bulgarian quotes stay per #5); the system term for the other party of a deal is written here as ONE line once the operator settles it in the Silerax session (Conflicts #6 - the first thing before that session closes) | - | product truth; Conflicts #6 |
| (new) | dates: a date as a historical record is fine (the rule markers stay); a date as a deadline never, unless the operator set it explicitly | add one line under § Execution discipline › One home for open work | - | Conflicts #7 |
| 338-354 | test runners and counts (271 files measured 2026-09-14, 60 specs, "a file count is not a runner count") | move -> `docs/guides/TESTING.md` (the project's declared home of the test policy); the overrides keep the routing rules only | `docs/guides/TESTING.md` | RESEARCH § S2 Misplaced |
| 362-372 | the full E2E suite only at a phase end; every change carries its tests | stays (BOTH roles obey) | - | D-09; project test policy |
| 373-377 | a risky dependency upgrade is proven by a Vercel preview | stays | - | project rule |
| 378-383 | the checks are run by a fresh scan agent, not the Writer (our VERIFY contract) | stays (project-only: who runs the suite is the project's contract; the payload allows a check agent) | - | WORKFLOW § Tests ("a check agent runs checks") |
| 384-392 | scoped unit in VERIFY | stays | - | project test policy |
| 393-402 | build before E2E with traces; the outputDir note | stays | - | project |
| 403-419 | known-red commands (the lint and unit baselines, the fixture side effect closed) | move -> `dev/baselines/README.md` (state); one line stays: "known-red commands and their baselines: `dev/baselines/README.md`" | `dev/baselines/README.md` | RESEARCH § S2 Misplaced (repeated in AGENTS.md § Known-red commands - that pointer stays) |
| 421-484 | E2E - enabled, attach-only: the env variables, the seeded actors, the credentials of ephemeral users | move -> `docs/guides/TESTING.md` § E2E (procedure; the throwaway passwords of :441, :445 go nowhere else - a test-only value, kept in the spec files that use them) | `docs/guides/TESTING.md` | RESEARCH § S2 Misplaced |
| 485-486 | the E2E report is copied out | stays (project VERIFY rule; harvested as a SKILLS line too) | - | project |
| 487-488 | traces on failure only ("expires when the payload carries it") | delete | - | 0.3.7 Retires (`--trace retain-on-failure`, D-17) |
| 490-493 | the suite is not all-green; compare against the baseline JSON | stays (project test policy; PnP DOCTR C-064 deferred) | - | project |
| 495-501 | status and release artifacts | fix :501 -> `dev/backlogs/ROADMAP.md`; the root `ROADMAP.md` gets a frozen-history banner on its first line; a Silerax roadmap line (S0): the analysis of the two files | - | Conflicts #4 |
| 503-519 | versioning (manual) | move -> `.githooks/README.md` (procedure); the two rule sentences (bump by hand - PnP; "no commit is ..." addition) stay | `.githooks/README.md` | RESEARCH § S2 Misplaced |
| 523-530 | English everywhere - PnP; our additions (translation on move, CHANGELOG Bulgarian, the roadmap English, no operator quotes in the roadmap) | fix per Conflicts #5: "everything in the project is English; the CHANGELOG and the operator's verbatim quotes follow the communication language set at the plugin's setup (Bulgarian)"; the 28 Cyrillic lines: quotes stay, the non-quote sentences (155-156, 159, 162, 213, 220, 382, 608, 635-636 where they are sentences, not quotes) translated; the roadmap-quotes deviation stays declared | - | Conflicts #5 |
| 531-532 | rules shown in Bulgarian, written in English | delete | - | 0.3.7 Retires (guard (g) language) |
| 533-535 | replies to the operator short, counts never file:line | delete | - | 0.3.7 Retires (the short operator channel) |
| 536-541 | a dialog only when the ticket cannot go on | delete | - | 0.3.7 Retires (the dialog rule) |
| 542-543 | a problem the operator points at - PnP; our addition (no re-linked static mockup; a live playground) | stays (addition only) | - | pointer form |
| 547-549 | No assumptions (infra / deploy / branch facts not recorded -> ask) | stays | - | project hard rule (memory `feedback_no_assumptions` is its pointer) |
| 550-584 | deploy model; the local E2E environment (stack, profile, config, commands) | move -> `scripts/e2e-local/README.md` (procedure) with the deploy model staying as identity (:550-566) | `scripts/e2e-local/README.md` | RESEARCH § S2 Misplaced |
| 585-594 | workspace paths | stays | - | the seeded section |
| 597-600 | behaviour pointers in the diff-review file (until PASSCOST measures) | move -> ORCHESTRATOR additions (COO-only) | ORCHESTRATOR additions | D-07 homes |
| 601-608 | parallel sessions and the Codex passes (shared brief, explicit `-ResumeId`, per-pass copy; "Expires: when PnP keeps the pass state per ticket") | delete; its point (1) survives as ONE line in the ORCHESTRATOR additions: "after every Codex verdict the COO copies the pass's brief to `.aiwf/<REF>-review-brief-pass<N>.txt` and records the session id in the readiness ledger" (project-only until ROADMAP § CODEX ships the wrapper copy) | ORCHESTRATOR additions (one line) | 0.3.6 keying + 0.3.7 Retires (one explicit resume policy); RESEARCH L80 |
| 609-613 | one review brief per ticket (local deviation) | delete | - | 0.3.7 Retires (the per-ticket brief file, D-13) |
| 614-616 | the small code round - no auditor pass 2 - PnP; our addition (not for a behaviour change; the small round's check includes the E2E + U1) | stays (addition only) | - | pointer form |
| 617-619 | QA (a declared ticket gets its QA pass without a further word) | delete | - | 0.3.7 Retires (QA after the review rides the ticket's word, D-12) |
| 620-631 | QA of a screen with an approved mockup; the mockup comparison on every redesign ticket | move -> ORCHESTRATOR additions (the COO's brief and dispatch rules); the comparison's authority wording per Conflicts #1 | ORCHESTRATOR additions | D-07 homes |
| 632-636 | the verdict message (the blocker count) | delete (the payload: a verdict reaches the operator as the verdict plus its substance, RULEHOME-001 Q3/verdict rules) | - | WORKFLOW § How the COO speaks |
| 637 | the operator judges the visuals live | move -> ORCHESTRATOR additions | ORCHESTRATOR additions | D-07 homes |
| 638-639 | the COO model recommendation in the plan - PnP; our addition | stays (addition only) | - | pointer form |
| 640-641 | COO routing tiers | stays (project rule, as in this repository) | - | project |
| 642-646 | parallel Writers - by default; our additions | fix: "by default" is the payload's since 0.3.7 (C-002); the additions (the shared brief, UI texts one Writer, each group its own tests, once for build / E2E / commit, the machine-resource rule) stay | - | 0.3.7 Retires (parallel-by-default units) |
| 647-655 | checkpoint at the gates; reading the diff is a gate; no expiry | fix per Conflicts #3: the hook `context-gate.mjs` and its `settings.json` wiring are REMOVED (the compaction experiment's instrument - a Silerax code-class item); the sentence "the context ceiling is the payload's session rule (~400k)" becomes "the payload's session rule (~400k) is overridden here to 600k (operator 2026-10-31)"; the checkpoint-at-every-gate habit and "reading the diff is a gate" stay as COO-only -> ORCHESTRATOR additions | ORCHESTRATOR additions | Conflicts #3; D-07 homes |
| 656-658 | a new session at the ticket boundary - PnP; our addition (heavy = ...) | move -> ORCHESTRATOR additions (COO-only, addition text) | ORCHESTRATOR additions | D-07 homes |
| 659-662 | Codex only over the diff after the round | move -> ORCHESTRATOR additions | ORCHESTRATOR additions | D-07 homes |
| 663-670 | canon <-> mockup differences decided at planning time | move -> ORCHESTRATOR additions; wording per Conflicts #1 | ORCHESTRATOR additions | D-07 homes |
| 671-674 | COO self-analysis - suspended | deleted in step 3 | - | D-07 (3) |

Writer-only rules found: none that is not also the COO's (the editing / `cd` / long-command additions
bind every role; the Writer template already carries the payload's lines) - the writer.md additions
block stays empty, and nothing moves there (D-09).

Dangling links: `[[feedback-surgical-edits]]`, `[[feedback-scope-question-early]]`,
`[[feedback-operator-role]]` - the files never existed; the rules they named are the payload's
(surgical edits - LOOP § Role boundaries; a blocker beyond business scope goes to the operator early -
WORKFLOW § The operator does not arbitrate; the operator's role - WORKFLOW § Roles): the links are
removed from `feedback_mockup_from_site.md:19`, `project_restart_strategy_necessity.md:37`,
`feedback_parallel_eval.md:16`, `user_oldschool_mvc.md:15` (or go with those files).

## Memory

`C:\Users\dyosi\.claude\projects\D--Stratex\memory\` - 28 files + MEMORY.md. Verdicts: `state` /
`user` / `reference` (kept, rule-free) / `rule -> <home>` (the rule moved, the file deleted or trimmed
to state) / `deleted`.

| file | verdict | note |
|---|---|---|
| feedback_codex_after_code_only.md | deleted | pointer only (the rule is overrides :659 -> ORCHESTRATOR additions); the "цент" vocabulary fact -> `project_mission_resume.md` vocabulary line |
| feedback_db_checks_and_push_steps.md | rule -> `dev/PROJECT_OVERRIDES.md` § Hard rules :18-23, per Conflicts #2; then deleted (the incident is harvested here) | - |
| feedback_decision_dialogs.md | deleted | pointer; the rule is the payload's since 0.3.7 |
| feedback_git_discipline.md | deleted | pointer; overrides :14 |
| feedback_mockup_from_site.md | rule -> § Product direction per Conflicts #1 (one clause: an element that exists on the site is taken from the site's code); then deleted (incident harvested) | - |
| feedback_no_assumptions.md | deleted | pointer; overrides :547 |
| feedback_no_dialogs_agents.md | deleted | pointer; payload + overrides :34 |
| feedback_no_hesitation.md | rule -> `dev/PROJECT_OVERRIDES.md` § Environment beside the `:3000` rule (:60): "a blocking process on a TEST port is killed without asking; `:3000` is never touched"; then deleted | - |
| feedback_parallel_eval.md | deleted | the rule is the payload's (C-002, 0.3.7) + overrides :642 |
| feedback_plain_language_reports.md | deleted | pointer; the payload's since 0.3.7 |
| feedback_redesign_new_vision.md | rule -> `dev/backlogs/drafts/ui-redesign/README.md` (a mockup-making rule: a NEW way per step, measures before drawing); then deleted (incident harvested) | - |
| feedback_session_per_ticket.md | deleted | pointer (its own retirement note of 2026-10-18) |
| feedback_session_start_from_root.md | rule -> `dev/PROJECT_OVERRIDES.md` § Environment ("sessions start from `D:\Stratex`, never from `silerax\`, or the ask dialogs stay silent"); then deleted (incident harvested; PnP DOCTR C-071 stays deferred) | - |
| feedback_working_lessons.md | rule -> `dev/PROJECT_OVERRIDES.md` § Test policy: "after a route deletion build before type-check; exact / tilde pins; regenerate verify artifacts after the last code change"; the "say fact-check" lesson is the payload's name already; then deleted | - |
| project_arbiter_handover.md | deleted | stale handover of 2026-10-20; its history is `readiness/OCRG/ledger.md` |
| project_ask_mcp_research.md | state | kept |
| project_defect_batches_procedure.md | deleted | pointer to ROADMAP § Preparing the next defect batches (the procedure lives there) |
| project_e2e_local_lessons.md | rule -> `scripts/e2e-local/README.md` (the machine traps, items 1-17; the incident harvested); then deleted | - |
| project_import_redesign.md | state, trimmed: the resume point stays; its "working rules" lines -> `dev/backlogs/drafts/ui-redesign/README.md` | - |
| project_mission_resume.md | state, trimmed: the resume point stays; the "Lessons (IWRC-002)" line is a rule -> ORCHESTRATOR additions ("LOOK at the E2E screenshot yourself before the audit"); the vocabulary line ("counterparty, never supplier") -> § Product truth once the operator settles the term (Conflicts #6) | - |
| project_ocr_providers_inactive.md | state | kept |
| project_plan_order.md | state, trimmed per Conflicts #7: "no dates" -> "no dates as deadlines unless the operator set them; a date as a record is fine" moves into the overrides (one line), the memory keeps the order's pointer | - |
| project_prod_db_state.md | state | kept (DB checks procedure clause per Conflicts #2) |
| project_restart_strategy_necessity.md | deleted | the document `dev/RESTART_STRATEGY.md` is the home of "modules are not copied" and its proof (DPU-003); the memory restates it |
| reference_redesign_hub.md | reference, trimmed: the artifact pointer stays; its rule ("every new mockup goes into it") -> `dev/backlogs/drafts/ui-redesign/README.md` | - |
| user_domain_expert_wife.md | deleted | wrong framing (Conflicts #6: the operator is the source of the business model; the wife was a one-time example of where he knows it from) |
| user_oldschool_mvc.md | user | kept; the dangling link removed |
| MEMORY.md | rewritten | one line per surviving file (state / user / reference only) |
