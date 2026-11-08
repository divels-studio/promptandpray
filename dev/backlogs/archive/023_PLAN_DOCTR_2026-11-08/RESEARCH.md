# DOCTR - research

Two read-only sonnet scans, 2026-11-08, HEAD `58fa73b` (0.3.15): A over the doctrine text and its
consumers, B over the item sources and the release mechanics. Line numbers are TEMPLATE lines; the
rendered copies under `.claude/aiwf-native/` equal their templates byte for byte except the stripped
TEMPLATE CONTRACT comment and the `{{config.*}}` substitutions (rendered lines run lower: ORCHESTRATOR
-14, work -14, ticket -12, plan -16, review -12). All five project additions blocks of this repo's
render are empty.

## Code Map

| file | role today |
|---|---|
| `templates/ORCHESTRATOR.md.tmpl` | core: escalation, channel filter, scans, gates, guards (a)-(h), failure claims, branch policy |
| `templates/doctrine/work.md.tmpl` | routes R1/R2/R3, COO routing checks 1-4, tests |
| `templates/doctrine/ticket.md.tmpl` | brief contract, COO write boundary, role boundaries, loop shape, fail aggregation, durable history (record, archive, roadmap writes) |
| `templates/doctrine/plan.md.tmpl` | planning lock, readiness review (pass economy, triage), durable history, the ledger skeleton |
| `templates/doctrine/review.md.tmpl` | auditor rules: plan readiness, fail aggregation, verdict |
| `templates/agents/writer.md.tmpl` | Writer role: VERIFY, Done contract, English-in-the-tree |
| `templates/CLAUDE.md.tmpl` | managed `aiwf-core` region (gates, routes, shared rules) + operator-zone seed with `## Changelog format` |
| `templates/PROJECT_OVERRIDES.md.tmpl` | overrides seed, written once |
| `templates/ROADMAP.md.tmpl` | roadmap seed: header + entry format |
| `templates/briefs/record.md` | completion-record skeleton (Diff review, closing checklist) |
| `templates/briefs/writer-dispatch.md` | Writer dispatch brief |
| `templates/README.md` | the templates contract ("a rule stands in exactly ONE stage template") |
| `docs/READINESS_CLASSES.md` | 16 readiness classes, cited by number |
| `docs/OPERATOR_PROTOCOL.md`, `docs/WORKFLOW.md`, `docs/LOOP.md` | session doors, the stage map, hooks and role hosts |
| `skills/plan/SKILL.md` | Step 1 entry format, Step 3 dialog, Step 6 pass-2 trigger |
| `skills/roles/SKILL.md`, `skills/review/SKILL.md` | restate the pass-2 trigger |
| `migrations/index.json`, `migrations/00NN_*/{ops.json,NOTES.md}` | release manifest and ops |
| `CHANGELOG.md`, `README.md`, `.claude-plugin/plugin.json` | release block + Retires line, version line (`README.md:22`), version |
| `scripts/selfcheck/aiwf-selfcheck.js` | door-read pins (`IN FULL` + stage path), provenance scan; prose not pinned |
| `scripts/setup/test-setup.mjs`, `scripts/update/test-update.mjs` | render pins, ledger-skeleton pin, 0033 op-count pin |
| `dev/PROJECT_OVERRIDES.md` | this repo's local rules; the dialog rule with its *Expires* |

## What the code does today - per item

Item numbers follow the roadmap entry's open lines (`dev/backlogs/ROADMAP.md:120-162`); "no sentence"
means the rule has no home yet and names the nearest one.

1. Narrowing "yes": no sentence. Guard (b) `ORCHESTRATOR.md.tmpl:356` "After the word, the loop runs to the end of what that word covers without asking again"; guard (a) `:348-352` covers a stop only. Source `CANDIDATES.md:60-63` (operator „сам ще си пусна ъпдейта").
2. Unrequired work through a question: no sentence. Nearest `ORCHESTRATOR.md.tmpl:299` (a question outside the gates is a defect), `:337-340` (a pass beyond the contract is written into its ticket with scope and cost). Source `CANDIDATES.md:69-74`: 224,160 tokens for an unrequested sonnet cross-check; operator „еднолични решения са приемливи в рамките на обхвата, но след като те хванах в издънка, ти продължи да своеволничиш".
3. Per-decision escalation line: no sentence. Triggers `ORCHESTRATOR.md.tmpl:104-128`; brief fields `ticket.md.tmpl:31-40` carry no escalation field; the analogue is the routing line `work.md.tmpl:84-87`. Source `CANDIDATES.md:75-81` (events 6, 7: triggers 1 and 3 missed at the brief).
4. "migrations" unqualified: `work.md.tmpl:59` R3 heading "(migrations / access policy / auth / destructive / push)", `:76` check 1 "migration / access-policy / grants / auth / permission-model code", `:109` table. Rulings: RBB `archive/013_PLAN_RBB_2026-10-17/DECISIONS.md:130-131` (deferred to a roadmap line); SEEDFS D-14 `archive/022_PLAN_SEEDFS_2026-11-08/DECISIONS.md:128-133` (a payload migration is data applied by a tested engine; R3 proper is a fail-direction flip); `dev/PROJECT_OVERRIDES.md:123` defines payload migrations. Source `CANDIDATES.md:93`, STAB pass 2 `readiness/STAB/revisions.md:78`, PLB `readiness/PLB/revisions.md:30`.
5. First-pass-visible blockers: the contract is a sentence - `review.md.tmpl:225-239`, `ticket.md.tmpl:272-282` (pass 2 is HANDED the list). Source `CANDIDATES.md:349-351` (intake 8: HARD-005 instrumented it, behaviour unchanged; asks for structure, not a sentence).
6. Known-failing baseline: `ORCHESTRATOR.md.tmpl:421-424` "records the unit baseline at HEAD by test name; the bar after the change is zero new failures by name"; `work.md.tmpl:123-128` § Tests has no baseline sentence. Source `CANDIDATES.md:436-439` (intake 31, LOW: a repo-kept list, changed only on a word).
7. E2E before the code audit: no sentence. Order `work.md.tmpl:38-39`, `:107-108` (`Writer -> /pnp:review -> /pnp:qa`), `CLAUDE.md.tmpl:55-56`; the E2E flow `ticket.md.tmpl:183-188`, `skills/qa/SKILL.md:102-106` (the orchestrator runs the E2E suite at QA). Source `CANDIDATES.md:612-625` ("waits for a word"; Silerax CAP-003 passes P6-P8 at 150-185k each).
8. A product name is not a path: `ORCHESTRATOR.md.tmpl:460-467` - no mutation of another repository without the word for that exact operation; "when 'write it into X's file' can mean two trees ... the COO settles which tree before writing, and asks when the tree cannot settle it". No default tree named. Source `CANDIDATES.md:818-854` (2026-09-15: a Furnissimo-rooted session wrote 51 lines into this repo; „Да я запиша ли в PNP CANDIDATES?" -> „да, запиши я"; the second Edit had no word).
9. "unplanned R2": zero hits in templates, docs, skills. The live forms are "non-durable R2" `work.md.tmpl:79`, `:87`; "small R1 and non-durable R2 work" `plan.md.tmpl:66`; check 2 reads "a non-durable R2 that has no plan section". Source `CANDIDATES.md:956-964` (old WORKFLOW lines).
10. A sentence that enumerates the world: tripwire 4 `ORCHESTRATOR.md.tmpl:256-265` says how an enumeration is CLOSED; nothing says how a doctrine sentence is PHRASED. `templates/README.md:25-50` is the templates contract. Source `CANDIDATES.md:966-973` (CONS-009: three fixes each refuted by one file; "an observation with its cost").
11. C-045 lint baseline, C-064 baseline JSON, C-067 `E2E: yes/no - because`, C-071 repo-root start: none in the templates (`lint`, "baseline JSON", `E2E: yes` zero hits; root: `CLAUDE.md.tmpl:91`, `ticket.md.tmpl:210-214` cover commands, not session start). RULEHOME `archive/017_PLAN_RULEHOME_2026-10-31/DECISIONS.md:201-202` "stay project rules until a plan homes them"; `diet.md:89`, `:148`. Not in `dev/PROJECT_OVERRIDES.md`; they live only in the two consumers.
12. "the user sees less than before": no sentence. Nearest `ORCHESTRATOR.md.tmpl:297` (product/UX choices), `:301-303` (a product dialog names the field the user loses), `:122-129` (a disputed design decision stops the loop). Source `silerax-harvest/ledger-rows.md:39` L72 (RDR-003: the Writer saw it, the COO filed "finding B", the operator found the loss two hours and 290K later).
13. Pass-2 trigger: `plan.md.tmpl:124-127` "a BLOCKER that reverses a recorded decision"; restated `skills/plan/SKILL.md:242-247`, `PROJECT_OVERRIDES.md.tmpl:174-175`, `skills/roles/SKILL.md:118`, `:133`, `skills/review/SKILL.md:324`, `docs/OPERATOR_PROTOCOL.md:114`, `review.md.tmpl:34`. No COO-vs-operator distinction. Source `ledger-rows.md:43` L76 (PLAN_GRANTS: pass 2 cost 324K for one alias finding; operator „това трябваше да е 1 лек тикет, пак ли сме на вълна овъринжинеринг").
14. The roadmap entry carries the problem, never the fix: no sentence. Format `skills/plan/SKILL.md:84-96`, `ROADMAP.md.tmpl:11-20` (the skill quotes `"<quote>"`, the seed `„<quote>"`), `dev/REBUILD.md:432`. Source `ledger-rows.md:45` L78 (operator 2026-10-24 „в роадмапа искам да се записва само полезна информация, но не и как се отстранява проблема - това е работа на планера").
15. Readiness classes: `docs/READINESS_CLASSES.md:15-32` table of 16 (class 6 "data shape the read path already admits (legacy rows, nulls ...)"; classes 1, 10 touch readers and permission gates); the header prose `:1-13` enumerates the count; cited by `plan.md.tmpl:121`, `:150-151`, `review.md.tmpl:38`, `templates/briefs/readiness-codex.md:7`, `docs/README.md:17`. Zero hits for NULL, nullable, exempt. Source `ledger-rows.md:47` L80 (1) (`is_active = true` over a nullable column) and `:84` PLAN_FLT (2) (a replaced reader's contract).
16. Exempt list: `ORCHESTRATOR.md.tmpl:242-244` "the zero-hit result, with the exempt list named, closes that enumeration" - no sentence on who may be exempt. Source `ledger-rows.md:47` L80 (2) (the CAP probe waved through; Codex pass 1 failed on it).
17. Live-Writer resume: `ticket.md.tmpl:115-117` "A code-class note goes as a micro-round to the **live** Writer, not a fresh spawn; if the Writer session has died, spawn and pay" - the mechanics unnamed. Source `ledger-rows.md:47` L80 (3) ("six resumes, 2-26K each, against a fresh 100K+ spawn").
18. Roadmap template places: `ROADMAP.md.tmpl:1-20` has header and entry format only. Routed today: a plan's Deferred list -> `plan.md.tmpl:115-117` (a roadmap line at the landing); remaining debt -> `record.md:28-31`, `:60-61`; an out-of-scope finding -> `ORCHESTRATOR.md.tmpl:426-433`. A TODO in code, an audit's findings: no sentence. Roadmap deletion `ticket.md.tmpl:346-348`, `:359`. Source `ledger-rows.md:55`, `:57`, `:78`, `:80` (operator „ПНП ще си ги вземе някой ден ако е необходимо").
19. Flat defect list: grammar stands at `ticket.md.tmpl:354-359` ("An entry may be an area"), `ROADMAP.md.tmpl:5-7`. Source `ledger-rows.md:57` L90 - "taken up only if a second consumer asks".
20. The dialog rule: `ORCHESTRATOR.md.tmpl:138-142` "A gate is a dialog or a word, not a paragraph asking for agreement ... asked at the ticket's close"; `:317-322` counts and names, never a `file:line`; `skills/plan/SKILL.md:132-134` "one dialog, up to four points, each with its consequence"; `ticket.md.tmpl:78-80` agents work without dialogs. `AskUserQuestion`: zero hits in templates, docs, skills, scripts, schema, hooks. Local rule `dev/PROJECT_OVERRIDES.md:210-216`, *Expires* "when the payload names the tool and the form (ROADMAP § DOCTR 2026-10-31)". Source `RULEHOME-003.md:113-115` (operator „казвам го за последен път - въпроси се задават с диалози, а не в чата като прочетена книга"; „дали мислиш че разбрах какво ме питаш на въпрос зададен с цифри + 501, 179, пешка на Г6, кон на А5?"; „бате това няма ли го до сега?"); S5 `inputs/harvest-2026-11-03.md:30` („омръзна ми да го напомням").
21. Language per record class: `ticket.md.tmpl:89-93` "Everything written into the tree is English ... and the operator's own words are quoted verbatim in their language wherever recorded" (the CHANGELOG not named); guard (g) `ORCHESTRATOR.md.tmpl:387-389`; `writer.md.tmpl:68-69`; `CLAUDE.md.tmpl:129-130` and the operator-zone `## Changelog format` `:137-144` with `Language: <language of the entries>`; `PROJECT_OVERRIDES.md.tmpl:128-134`; interview `scripts/setup/interview.mjs:163` asks `operator.language` only; schema `schema/aiwf.config.schema.json:114-124` (`additionalProperties: false`). Source `silerax-harvest/diet.md:21` Conflicts #5 (operator „всичко в проекта е на английски, changelog следва езика на комуникацията при сетъп на плъгина, цитати следват езика на комуникацията по сетъп ... В PNP влиза - промяна на сетъп и доктрина").
22. Order of work / nested list: no sentence; archive paragraph `ticket.md.tmpl:339-367`, roadmap writes `:349-359`, `record.md:58-59`. Source `inputs/harvest-2026-11-03.md:27` S2.
23. Live-run close without waiver: `ticket.md.tmpl:322-324` "closes only after the operator's own run on a real input, their words recorded in the record; offline proof never replaces it"; restated `record.md:55-56`, seed `templates/memory-seeds/closeout-needs-a-live-pass.md:4-8`. Source `harvest-2026-11-03.md:41` S16 (operator „затваряй не ми се гледа"; closed on QA artifacts).
24. The whole-diff read: `ticket.md.tmpl:118-119` "The COO reads the whole diff of every ticket and writes that reading into `<scratchDir>/<REF>-diff-review.md`"; `:143`, `:229-230`; `ORCHESTRATOR.md.tmpl:204`; `CLAUDE.md.tmpl:35`; `record.md:33-36`. Source `harvest-2026-11-03.md:58`, `:67` F4/F13 (25-35k per ticket).
25. A drafted record: `ticket.md.tmpl:300-306` (the COO writes it, unprompted, on `record.md`); the number guard `:324-331`, `ORCHESTRATOR.md.tmpl:414-416`; model policy `:267-275`. Source `harvest-2026-11-03.md:61` F7 (unsure).
26. Check 2 after discovery: `work.md.tmpl:77-79` check 2 "any worklist item without a `file:line` anchor, or any unresolved decision marker"; `:93-95` the checks are read again on a MID-ticket trigger; discovery `ORCHESTRATOR.md.tmpl:239-244`. Source `harvest-2026-11-03.md:69` F15 (unsure).
27. The expected red set in the brief: `ticket.md.tmpl:37` field `Verify`; `writer-dispatch.md:2`, `:7`; `writer.md.tmpl:117-120`, `:129-132`; baseline sentence as item 6. Source `ledger-rows.md:41` L74 (2) (RDR-002).

## Release mechanics

28. Version `.claude-plugin/plugin.json:3` = 0.3.15; `README.md:22` `**v0.3.15. Public since 0.2.0.**`; `CHANGELOG.md:7` `## [0.3.15] - 2026-11-08`, its last line `:37` `Retires local rules: none`. Manifest `migrations/index.json:39-41`: `0038_selfcheck-scope` 0.3.13, `0039_selfcheck-jobs` 0.3.14, `0040_seed-containment` 0.3.15 (the last line).
29. The stage re-render precedent: `migrations/0036_planning-briefs-and-verify-owner/ops.json` (0.3.11) - `rerender-managed-region` with `region: null` for `doctrine/plan.md`, `ticket.md`, `review.md`, `.claude/agents/writer.md`, `AGENTS.md`, then one `note` with `docRefs`. The full set is `migrations/0033_doctrine-stages/ops.json` (the four stage files `createIfAbsent`, `CLAUDE.md#aiwf-core`, ORCHESTRATOR, writer, reviewer/qa `ifRecorded`); `test-update.mjs:1986-1993` pins 0033's op count and order - never edited.
30. A Retires line naming a stage block: `CHANGELOG.md:167` (0.3.12), `:217` (0.3.11, the form `<stage>.md § project additions: <rule>`). No script parses the line; `/pnp:update` prints the blocks (`test-update.mjs:1048-1095`).
31. Pins over the templates: `test-setup.mjs:292-304` (rendered = render of template, no `{{`, exactly one empty additions block at the end), `:287-288` (the TEMPLATE CONTRACT block), `:1643-1651` (the ledger skeleton in `plan.md.tmpl` § The ledger equals `templates/LEDGER.md.tmpl` byte for byte); self-check `aiwf-selfcheck.js:8509-8538` DOOR_READS (each door paragraph names its stage path AND `IN FULL`; doors: skills work, mission, plan, review, qa, qal, arbiter and `templates/CLAUDE.md.tmpl`), `:8581-8623` provenance scan over `templates/` (Cyrillic, drive paths, origin names). Prose is NOT pinned (`:10589-10592`).
32. `validate-payload.mjs`: ids ascend by 1, the last version equals `plugin.json` (`:13-23`); ops field sets exact, `template` under `templates/` and existing (`:464-481`); `NOTES.md` must exist (`:330-331`); a `note` needs `op`, `id`, `text`, `docRefs` (`:434-436`); nothing in `docs/` or `CHANGELOG.md` is checked.
33. A shipped NOTES may be edited when it has become false: `migrations/0011_transfer-surface/NOTES.md` in `eceb9be` (the engine began reading the key).
34. `plan-gate.js`: `TICKET_FIELDS` `:129`; the `Status:` header exemption `:33-36`, `:424-435`; `plan.ticketByteCap` `:36`, `:443-449` (this project: 61,440); `MAX_TICKETS = 3` `:118` unless `Tickets: <n> - <reason>` `:454-471`; Code Map paths exist `:580`.
35. Seeds: no seed restates an item's sentence (`check-before-gating.md:5`, `verification-pass-economy.md:7` are the only grep hits).
36. `examples/example-project/` holds no rendered doctrine (seed CLAUDE.md, settings, `answers*.json`, bump files); the self-check asserts it as data (`aiwf-selfcheck.js:9025-9669`, `:10563`). A new config key would touch `answers*.json` - none planned here.

## Consumers and adjacent contracts

- A template edit reaches an installation only through a `rerender-managed-region` op in a new migration (`dev/PROJECT_OVERRIDES.md:44-54`); the bump, the manifest line, `ops.json` + `NOTES.md`, the CHANGELOG block, `README.md:22` move together.
- A changed heading needs the closing grep of `<stage>.md § <heading>` over templates, docs and skills (the contract `ORCHESTRATOR.md.tmpl:1-14`).
- The pass-2 trigger sentence (item 13) has seven restating consumers (fact 13) - every one moves.
- `docs/READINESS_CLASSES.md` header prose counts the classes (fact 15).
- The dialog rule retired here lives in three overrides documents (PnP `dev/PROJECT_OVERRIDES.md:210-216`, Silerax, Furnissimo) - the Retires line names it; the deletion is each operator's act.
- `templates/PROJECT_OVERRIDES.md.tmpl` and `templates/ROADMAP.md.tmpl` are seeds: an edit reaches no installed copy; the migration `note` is the channel.
- The self-install of this repository: `/pnp:update --apply` after the code commit (DOCSTAGE D-09, SEEDFS precedent).

## What already exists

- Items 9 (no "unplanned R2") and F24 (no hand-edit path, `ticket.md.tmpl:222-223`) are already closed by earlier landings; item 8 is half-closed by `ORCHESTRATOR.md.tmpl:460-467` (no default tree).
- The baseline-by-test-name sentence (`ORCHESTRATOR.md.tmpl:421-424`), the live-Writer sentence (`ticket.md.tmpl:116`), the whole-diff sentence (`:118`), the no-waiver close (`:322-324`), the English-in-the-tree rule with verbatim quotes (`:89-93`), the gate-is-a-dialog sentence (`ORCHESTRATOR.md.tmpl:138-142`) - each a home that the fix extends rather than a new section.
- The operator-zone `## Changelog format` with its `Language:` line (`CLAUDE.md.tmpl:137-144`) - the place a project already names its changelog language.

## Paths touched without being named

`.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/aiwf-native/doctrine/*.md`, `.claude/agents/writer.md`
(re-rendered by the migration, never hand-edited); `docs/WORKFLOW.md:21-24` heading table;
`docs/OPERATOR_PROTOCOL.md:114`; `docs/SESSION_BRIEF_RECIPE.md:70`; `dev/REBUILD.md:432` (history,
stays); `dev/PROJECT_OVERRIDES.md:210-216` (the local rule that retires, R1 in the record commit);
`dev/backlogs/CANDIDATES.md` rows (frozen; marked at the close); the roadmap entry's lines (`done`
at the close).

## Unknowns

- Item 5 asks for a structural check, not a sentence; its Silerax evidence (`SP:52`) was not opened. The lookup: the HARD-005 record and `D:\Stratex` `SP`. Settled by decision D-05 below (deferred to § CODEX), not by research.
- Whether `ORCHESTRATOR.md.tmpl:460-467` landed before or after the 2026-09-15 incident: `git log -S "settles which tree before writing" -- templates/ORCHESTRATOR.md.tmpl`. Immaterial to the fix (a default tree is added either way).
