# SKILLS - research

Two scan agents (Sonnet, 2026-11-08, HEAD `b35693b`): A over the skills and the brief templates,
B over the evidence records and the doctrine. Pointers the COO opened itself are marked `(COO)`.
Items (a)-(g) are the open lines of ROADMAP § SKILLS (`dev/backlogs/ROADMAP.md:125-132` after the
DOCTR entry left), in the entry's order:

- (a) the Writer copies the E2E JSON report into the scratch directory right after the run;
- (b) one sentence in the setup/update skills: auto mode refuses settings writes and `--apply`;
- (c) `/pnp:brief` says it is not offered when the state is durable;
- (d) `/pnp:plan` Step 5's pre-pass: a sibling-decision scan, a no-match check of red-first
  commands, a sonnet consistency pre-pass per revision over the delta, a full-folder pre-pass only
  after a rework;
- (e) `/pnp:plan`: the dialog form in a Cyrillic operator language; the planner stays a live agent
  ("resume, do not respawn");
- (f) `/pnp:plan` Step 1's questions come AFTER Step 2's research;
- (g) the QA brief names "the spec's RED run on the pre-change server" as a standard artifact.

## Code Map

| file | role today |
|---|---|
| `skills/plan/SKILL.md` | the planning cycle: Step 1 entry and questions, Step 2 research, Step 4 planner, Step 5 gate and runnability pre-pass, Step 6 pass, triage, approval |
| `skills/qa/SKILL.md` | QA: Step 2 the E2E run and its artifacts, Step 3 the QA brief with its EVIDENCE block |
| `skills/review/SKILL.md` | the Reviewer: the evidence pack names the green E2E run's log path |
| `skills/brief/SKILL.md` | composes the session brief; says nothing about when it is not offered |
| `skills/mission/SKILL.md` | resumes without a brief; never names `/pnp:brief` |
| `skills/setup/SKILL.md` | install: Step 3 dry run and generate; no auto-mode sentence |
| `skills/update/SKILL.md` | update: Step 3 carries the auto-mode sentence |
| `skills/roles/SKILL.md` | the audit table; carries its own auto-mode sentence for the `roles.json` write |
| `templates/briefs/research.md` | the research brief, read at run time from the plugin root |
| `templates/briefs/planner.md` | the planner brief; no live/resume wording |
| `templates/briefs/writer-dispatch.md` | the Writer brief, ten fixed lines; no E2E line |
| `templates/doctrine/ticket.md.tmpl` | managed: the live-Writer resume (DOCTR/D-17), the auto-mode rule, the E2E spec-flow, the brief-offered rule |
| `templates/doctrine/work.md.tmpl` | managed: § Tests - the E2E spec runs before the audit (DOCTR/D-26) |
| `templates/doctrine/plan.md.tmpl` | managed: the cycle's order, the mechanical gate, pass economy |
| `templates/ORCHESTRATOR.md.tmpl` | managed: the model policy, speaking rule 9, guard (d) |
| `templates/agents/qa.md.tmpl` | managed: the QA agent reads the artifacts under `verify.e2e.outputDir` |
| `docs/CODEX_REVIEW_QA_RECIPE.md` | a second copy of the QA spec-flow and brief contract |
| `docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md` | the three doors; when a brief is written |
| `docs/READINESS_CLASSES.md` | the 18 readiness classes (class 1 unread consumer, class 8 a command that cannot fail) |

## What the code does today

(a)
1. The COO, not the Writer, runs `verify.e2e.runner` over the Writer's spec at the handoff, before
   `/pnp:review`; the review brief carries the log path of the green run - `templates/doctrine/work.md.tmpl:137-142` (COO); the spec-flow `templates/doctrine/ticket.md.tmpl:196-202` (COO); `skills/review/SKILL.md:182` (COO, the evidence pack line).
2. QA judges the artifacts of that run; a re-run only after a correction round or when no artifacts stand, scoped to the changed specs - `skills/qa/SKILL.md:107-115` (COO).
3. The canonical run command already carries `--trace retain-on-failure --output <outputDir>` - `skills/qa/SKILL.md:121` (COO); the JSON report comes from a config reporter next to `outputDir` - `:125-127` (COO); it is the always-present artifact - `:138`, `:170`, `:192` (COO); BLOCKED only when it is missing or unreadable - `:223`, `:230` (A).
4. Nothing copies the report anywhere; `scratchDir` is named in the payload only for the brief files, the session ids and the diff-review file (B, grep over skills, templates, docs). The record skeleton's Scratch section covers evidence moved out of the scratch dir - `templates/briefs/record.md:40` (B); the scratch is emptied at the ticket's close - `templates/doctrine/ticket.md.tmpl:323-325` (B).
5. The Writer brief template has no E2E line - `templates/briefs/writer-dispatch.md:1-10` (COO); the Writer "runs only the tests it adds - red, then green" - `work.md.tmpl:134-135` (COO).

(b)
6. `skills/update/SKILL.md:80-82` already says: in an auto-approving permission mode the host may refuse the engine's write to `.claude/settings.json` or `aiwf.config.json`; run it again in a mode that asks (COO).
7. `templates/doctrine/ticket.md.tmpl:233-241` carries the rule: auto mode refuses Edit/Write edits to `.claude/settings.json` and `.claude/hooks/**`; `/pnp:update --apply` was observed running through under auto mode; a host that does refuse it is handled by `/pnp:update` Step 3 (COO).
8. `skills/setup/SKILL.md` has no such sentence (COO, grep `auto|settings.json|--apply`: none; its steps at `:14`, `:36`, `:54`, `:106`, `:131`, `:157`). `skills/roles/SKILL.md:102` carries its own for the `roles.json` write (COO, grep).

(c)
9. The rule exists in `templates/doctrine/ticket.md.tmpl:305-307`: no session brief is offered when the state is durable; once the record, the memory and the transfer surface are complete the COO says "new session, `/pnp:mission`"; a brief only mid-flight (COO).
10. `skills/brief/SKILL.md:7-15` has no such sentence (COO); `docs/OPERATOR_PROTOCOL.md:21-22` "No brief? You do not need one" (B); `skills/mission/SKILL.md:10` "the brief is an accelerator, not the source of truth" (B); `docs/SESSION_BRIEF_RECIPE.md:13-15` says who writes it, nothing on when it is not written (B).

(d)
11. The only pre-pass is the runnability pre-pass: one scan-tier Sonnet agent between the stamp and the paid pass, over every `## Acceptance` command and index procedure, running each read-only command as written, replying with the ones that cannot run - `skills/plan/SKILL.md:185-189` (COO, the skill text in this session); no no-match check, no sibling scan, no consistency pre-pass, no per-revision wording (A).
12. The "can fail" rule: readiness check 5 `templates/doctrine/plan.md.tmpl:156-157`; `templates/briefs/planner.md:60-65` (COO) - acceptance is literal commands each with the output meaning "broken"; `ticket.md.tmpl:93` (A).
13. The model policy: "a judging agent - a Claude-hosted reviewer, a readiness pre-pass, any agent that returns a verdict - never runs on a model below the session model"; Sonnet is the scan tier - `templates/ORCHESTRATOR.md.tmpl:270-276` (B); the rendered copy `.claude/aiwf-native/ORCHESTRATOR.md:255-263` (COO).
14. Classes: class 1 unread consumer, class 8 a command not literal or that cannot fail, class 14 a revision adding surface - `docs/READINESS_CLASSES.md:20`, `:27`, `:33` (B).
15. The research brief already asks, for every touched surface, who reads it and who writes it - `templates/briefs/research.md:23-25` (COO); the planner brief carries the COO-filled CLOSING GREPS - `templates/briefs/planner.md:14-16` (COO).

(e)
16. Rule 9: a question to the operator is a dialog, one topic, numbered options with consequences, up to four points, never a list in the chat - `templates/ORCHESTRATOR.md.tmpl:352-356` (B); rendered `.claude/aiwf-native/ORCHESTRATOR.md:338-342` (COO); `skills/plan/SKILL.md:134-137` cites it (A). No text anywhere on a Cyrillic operator language or "one item per message" (A, grep).
17. The planner's continuity is only "the same dispatch" - `skills/plan/SKILL.md:175`, `:239` (COO, grep); `resume` in that skill is the Codex pass's (`:220`, `:229`, `:249`) (A); `templates/briefs/planner.md` has no live/resume text (B).
18. The live-Writer resume mechanics - a message to the dispatched agent (`SendMessage`) for every round and the commit, a fresh spawn only when that agent has ended - `templates/doctrine/ticket.md.tmpl:127-130` (COO); written for the Writer only. Each planner dispatch raises one Gate 2 dialog - `skills/plan/SKILL.md:147-148` (A).

(f)
19. Step 1 reads the recorded state, THEN asks the three questions (real inputs, what stays, what retires) before Step 2's research; the suppression dual asks nothing when all are recorded - `skills/plan/SKILL.md:76-82` (COO, the skill text in this session; grep `real inputs`: that one site in the payload).
20. `templates/doctrine/plan.md.tmpl:72-76` places the research before the plan's first sentence and does not place the questions (B); guard (d) "a demand on the operator only after checking" - `templates/ORCHESTRATOR.md.tmpl:390-393` (B), rendered `:376-379` (COO).

(g)
21. The QA brief's EVIDENCE block lists three artifacts: the JSON report (always), the trace internals (failed tests), the screenshots (failures); "a passing test without a trace is complete evidence, never a gap" - `skills/qa/SKILL.md:189-198` (COO). The guaranteed-artifacts list `:137-141` (COO).
22. No red run or pre-change run is named in `skills/qa/SKILL.md`, `ticket.md.tmpl`, `review.md.tmpl` (B, grep); `red` in the payload: the expected red set `writer-dispatch.md:5`, "red, then green" `work.md.tmpl:135`, "a red spec goes back to the live Writer" `work.md.tmpl:139`, "a unit test seen red before the fix" `ticket.md.tmpl:282` (A, COO for the first three).

The evidence
23. (a) `dev/backlogs/CANDIDATES.md:565-570` (COO): the report lives only in the runner's outputDir, cleaned at every run, deleted at Silerax to free disk; the first run's evidence was lost and the COO repeated the whole run (~49 minutes, `:553`); the candidate names the Writer as the copier and `<scratchDir>/<ticket>-e2e-writer-<stamp>.json`. `:1135-1136` (COO) the same (Furnissimo UIR-003 (3)). Silerax kept it as a project VERIFY rule - `.../silerax-harvest/diet.md:87` (B).
24. (b) `CANDIDATES.md:1141-1143` (COO): Furnissimo's memory `automode-blocks-settings-json.md`, the 0.2.19 run; "(unsure)".
25. (c) `CANDIDATES.md:1144-1145` (COO): Furnissimo's memory `no-brief-offer-when-durable.md`; "(unsure)". Memory carries no rules since the diet (B, ledger-rows L88).
26. (d) `.../silerax-harvest/COO_SELF_ANALYSIS.md:447-448` (COO) the sibling-decision scan; `:616-617` (COO) the no-match check (vitest `-t`, jest `-t`, pytest `-k`); `:1081-1082` (COO) the delta consistency pre-pass as the consumer's own steering; `ledger-rows.md:42` row 75 (COO): one Sonnet pre-pass per revision over the delta, a full-folder pre-pass only after a rework - "RDR: four pre-passes, ~520k, two defects found".
27. (e) `COO_SELF_ANALYSIS.md:323-325` (COO): in a Cyrillic operator language the dialog tool's payload cap makes four points with consequences unreachable, "this operator refuses the form"; `:328-329` (COO): the planner as a live agent is the right default, "the same dispatch" is there, "resume, do not respawn" is not.
28. (f) `ledger-rows.md:61` row 94 (COO): the operator 2026-10-27 „3 въпроса на които можеше да си намериш сам отговорите и ако имаш неясноти тогава да ме питаш ... сложи един овъррайд", the override "Questions come after the research" approved „ок съм с правилото"; `:43` row 76 (COO): PLAN_GRANTS „какви са тия глупости всеки път 3 въпроса", disposed "done: f61817f (Step 1 reads the recorded state first)"; `diet.md:60` (B): corrected 2026-10-31 - the payload's Step 1 still asks BEFORE the research; this rule answers them FROM the research first, a stronger order the payload does not carry.
29. (g) `COO_SELF_ANALYSIS.md:269-271` (COO): QA judged from the JSON reports, the spec source and the two RED logs of the spec on the pre-change server; "the red logs were the decisive evidence - without them 'passed' proves little"; it costs the Writer one Playwright run while the old build is still up. `ledger-rows.md:48` row 81 (2) (COO).
30. DOCTR touched three of the seven: D-17 the live-Writer resume (item e, the Writer half), D-20 rule 9 (item e, the dialog half), D-26 the COO runs the E2E before the audit (item a, the actor) - `dev/backlogs/archive/023_PLAN_DOCTR_2026-11-08/DECISIONS.md:83-85`, `:97-105`, `:141-148` (COO, read as active/DOCTR before the archiving). Nothing in DOCTR decides (b), (c), (d), (f) or (g).

## Consumers and adjacent contracts

- No script asserts on the text of the touched sentences: `scripts/selfcheck/README.md:23-25` "presence and working hooks, not words" (A). What the self-check pins about a skill: the frontmatter and the Step 0 strings (`scripts/selfcheck/aiwf-selfcheck.js:8298-8323`), every payload path a skill names must exist (`:8326-8340`), retired command names (`:8423`), the door pins - `skills/plan` -> `plan.md` IN FULL, `skills/review` and `skills/qa` -> `ticket.md` + `review.md` (`:8470-8476`, `:8515-8521`) (A); `scripts/update/test-update.mjs:404-409` the Step 0 strings (A). A new sentence keeps those strings, and a new path it names must exist.
- The QA brief contract has a second copy: `docs/CODEX_REVIEW_QA_RECIPE.md:286-298` (A, B) - the EVIDENCE list moves with `skills/qa/SKILL.md` Step 3.
- The JSON-report path appears in `skills/qa/SKILL.md:21`, `:125`, `:132`, `:138`, `:170`, `:192`, `:197`, `:223`, `:230`; `templates/agents/qa.md.tmpl:4`, `:46`; `templates/doctrine/review.md.tmpl:216`; `templates/doctrine/ticket.md.tmpl:199`; `docs/CODEX_REVIEW_QA_RECIPE.md:289`, `:293` (COO, grep `JSON report`). The managed ones name the artifact, not its path: a copy in scratch changes the brief's path (`:192`), not them.
- The green run's log line: `templates/doctrine/work.md.tmpl:141` (managed) and `skills/review/SKILL.md:182` (COO, grep).
- `auto-approving` / `auto mode`: `skills/update/SKILL.md:80`, `skills/roles/SKILL.md:102`, `templates/doctrine/ticket.md.tmpl:235`, `:239` (COO, grep). `state is durable`: `ticket.md.tmpl:305` only (COO, grep).
- `the same dispatch`: `skills/plan/SKILL.md:175`, `:239`; `respawn`, `resume, do not`: zero hits in the payload (COO, grep).
- `real inputs` / the three questions: `skills/plan/SKILL.md:79-80` only (COO, grep).
- The pre-pass: `skills/plan/SKILL.md:185-189` only; nothing under `scripts/` names it (COO, grep `runnability pre-pass|cannot run and why`).
- Rule 9 and the dialog cap move together with any dialog-form text in `skills/plan` (A). The pass-economy rules `plan.md.tmpl:124-138` move with any per-revision pre-pass (A).
- Release mechanics: a skill or a `templates/briefs/*` file is read at run time from the plugin root and reaches a consumer only through a release - overrides § Hard rules (release discipline); `scripts/setup/generate.mjs:1058-1097` renders only `roles.json`, the agents, `ORCHESTRATOR.md`, the stage files, `AGENTS.md`, `CLAUDE.md` - no `briefs` (A, grep). The current version is 0.3.16 - `.claude-plugin/plugin.json:3`; the last migration `0041_doctrine-wording` -> 0.3.16 - `migrations/index.json:42` (COO).

## What already exists

- (a) `retain-on-failure` and `--output` in the canonical command (`skills/qa/SKILL.md:121`); the brief's `JSON report: <abs path>` slot (`:192`); the green run's log in the review pack (`skills/review/SKILL.md:182`); the scoped re-run (`skills/qa/SKILL.md:109-113`, CANDIDATES `:560` done).
- (b) the full sentence in `skills/update/SKILL.md:80-82`, the rule in `ticket.md.tmpl:233-241`, the roles' own in `skills/roles/SKILL.md:102`.
- (c) the full rule in `ticket.md.tmpl:305-307`; `docs/OPERATOR_PROTOCOL.md:21-22`.
- (d) the runnability pre-pass (`skills/plan/SKILL.md:185-189`), check 5 (`plan.md.tmpl:156`), the planner's "broken when" (`planner.md:60-65`), class 8 and class 1, the research brief's consumers section (`research.md:23-25`), the CLOSING GREPS slot (`planner.md:14-16`).
- (e) rule 9 (`ORCHESTRATOR.md.tmpl:352-356`); the live-Writer resume (`ticket.md.tmpl:127-130`); "the same dispatch" (`skills/plan/SKILL.md:175`, `:239`).
- (f) "the recorded state comes first" and its dual (`skills/plan/SKILL.md:76-82`, f61817f).
- (g) nothing; the nearest are the expected red set (`writer-dispatch.md:5`) and "red, then green" (`work.md.tmpl:135`).

## Paths touched without being named

- The rendered copies of every managed template in this repository (`.claude/aiwf-native/**`, `.claude/agents/*`): a change to a `templates/doctrine/*.tmpl`, `templates/ORCHESTRATOR.md.tmpl` or `templates/agents/*.tmpl` is a migration with `rerender-managed-region` ops (`migrations/0041_doctrine-wording/ops.json:5-10`, A); a change to `skills/**` or `templates/briefs/*` is not, and travels with the version alone.
- `docs/CODEX_REVIEW_QA_RECIPE.md:286-298` - the QA brief's second copy.
- The ticket-end scratch rule (`ticket.md.tmpl:323-325`) and the record's Scratch section (`record.md:40`): anything new written under `scratchDir` meets them at the ticket's close.
- The `Retires local rules:` line of the release's CHANGELOG block (CLAUDE.md § Changelog format): the consumer-local forms of (a) (Silerax, a VERIFY rule - `diet.md:87`) and (f) (Silerax `dev/PROJECT_OVERRIDES.md` § Execution discipline "Questions come after the research" - `ledger-rows.md:61`).

## Unknowns

- Whether the Silerax override "Questions come after the research" still stands in its overrides (row 94 says it retires with 0.3.7's line; `diet.md:60` says the payload never carried the stronger order): settled by reading `D:\Stratex\dev\PROJECT_OVERRIDES.md` § Execution discipline - outside this repository, not opened; the Retires line names the block it MAY have stood in, which is what the format asks.
- Whether the dialog tool's payload cap in Cyrillic is documented anywhere but `COO_SELF_ANALYSIS.md:323-325`: no other source found (B); moot under D-08.
