# SKILLS - decisions

Items (a)-(g) are the open lines of ROADMAP § SKILLS, lettered as `RESEARCH.md` letters them; fact
numbers are the research's (`RESEARCH.md` § What the code does today).

## Decisions

- **D-01** One plan, two tickets, one release (0.3.17) - the DOCSTAGE D-09 / DOCTR D-01 shape:
  **SKILLS-001** prose, R1 in the main session (overrides § Hard rules: prose in the payload is R1),
  `review.docs` row 0 = no auditor - every sentence of D-02..D-11 written into the skills, the one
  run-time brief template `templates/briefs/writer-dispatch.md` (`record.md:40-43` already covers
  the Scratch section and stays), the recipe's second copy and `docs/SESSION_BRIEF_RECIPE.md`; the
  CHANGELOG block and the README version line are the COO's R1 prose, written in the main session
  before 002's commit and committed with it by explicit paths (the 0.3.16 commit `72ccbe8`
  precedent); NO managed template touched (no
  `templates/doctrine/*`, `templates/ORCHESTRATOR.md.tmpl`, `templates/agents/*`: fact 30 - the
  doctrine already carries every rule these sentences execute); **SKILLS-002** code, the Writer:
  migration `0042` with ONE `note` op (a prose-only release; overrides § Hard rules, release
  discipline), the bump to 0.3.17 in `.claude-plugin/plugin.json`, the manifest entry, the CHANGELOG
  block with its `Retires local rules:` line (D-12), the README version line (`README.md:22`); its
  VERIFY is the prose-only release row of overrides § Test policy - `validate-payload` and the
  self-install `/pnp:update --apply` on this repository with its embedded self-check, no suite
  locally; a Codex pass over its code only on the operator's word (overrides § Hard rules), so the
  ticket carries no review pass unless that word is given at its start. After 002's commit the tag
  and the push each on the operator's word; the record commit marks the roadmap lines and the
  CANDIDATES rows (R1). Why one release: a skill reaches a consumer only through a version
  (RESEARCH § Consumers, release mechanics). plan: SKILLS
- **D-02** Item (a): the one who runs the E2E suite copies its JSON report - since 0.3.16 that is
  the COO at the handoff (DOCTR/D-26, fact 1) and after a scoped re-run (fact 2), never the Writer
  (the roadmap line's "the Writer copies" predates D-26): right after the run, before anything else,
  the report is copied to `<scratchDir>/<REF>-e2e-report-<N>.json` (`<N>` the run's number in the
  ticket, 1 for the handoff run), the QA brief's `JSON report:` line names the COPY (fact 3,
  `skills/qa/SKILL.md:192`), the review brief's green-run line names it beside the log
  (`skills/review/SKILL.md:182`), and the record's Scratch section says where it went at the close
  (fact 4: the scratch is emptied at the ticket's end); `outputDir` is neither deleted nor run over
  again before that copy stands - the second half of the candidate (`CANDIDATES.md:569-570`), so the
  row closes whole. Home: `skills/qa/SKILL.md` Step 2 (the run
  and the guaranteed artifacts) and Step 3 (the brief), `skills/review/SKILL.md` the evidence pack,
  `docs/CODEX_REVIEW_QA_RECIPE.md` the brief's second copy. Why: UIR-003 lost the first run's report
  to the outputDir's cleanup and repeated a ~49-minute run (fact 23). plan: SKILLS
- **D-03** Item (b) is covered for `/pnp:update` (fact 6) and `/pnp:roles` (fact 8), and the rule
  stands in `ticket.md` (fact 7): the roadmap line closes on those pointers. `skills/setup/SKILL.md`
  Step 3 gains the same sentence as update's `:80-82`, worded for the generate (the host may refuse
  the engine's write to `.claude/settings.json` as self-modification in an auto-approving mode; run
  it again in a mode that asks) - one sentence. Why: setup and update write the same file by the
  same engine class, and a reader of one skill should not have to open the other. plan: SKILLS
- **D-04** Item (c): `skills/brief/SKILL.md` gains, as its first step after Step 0, the rule of
  `ticket.md` § The ticket boundary (fact 9) in the skill's own words: when the state is durable -
  the record, the memory and the transfer surface complete - the skill composes no brief, says "new
  session, `/pnp:mission`" and stops; a brief is composed only mid-flight (an unfinished ticket, an
  uncommitted diff, decisions spoken but not recorded). `docs/SESSION_BRIEF_RECIPE.md` gains one
  sentence pointing at that step. Why: the rule exists and the skill that executes it says nothing
  (fact 10). plan: SKILLS
- **D-05** Item (d), the no-match check: the runnability pre-pass of `skills/plan/SKILL.md:185-189`
  gains it - every acceptance or verify command that carries a test filter (`-t`, `-k`, `-g`,
  `--grep`, a spec path) is checked to select at least one test, and a filter that selects nothing
  is reported as "cannot fail" (class 8, fact 14) and goes back to the planner like a command that
  cannot run. The check runs over the tree as it stands at the stamp: a filter that names a test the
  ticket itself creates cannot be selected yet and is exempt here - the ticket's worklist names that
  test as new, and its proof is the Writer's own red run of the tests it adds (`work.md` § Tests:
  red, then green - a new test that selects nothing cannot go red). Why: a filter that matches
  nothing passes green on every tree (fact 26, PLAN_BUGS); the stage split is readiness round 1 B3.
  plan: SKILLS
- **D-06** Item (d), the sibling-decision scan: covered - the research brief asks, for every surface
  the goal touches (a file, a column, an option), who reads it and who writes it, and the planner
  brief carries the COO-filled CLOSING GREPS whose hit lists are the enumeration (fact 15; tripwire
  4 of `ORCHESTRATOR.md` § COO owns broad scans); no new sentence; the roadmap sub-item closes on
  those pointers. Why: a scan at Step 5 for what the research and the closing greps already
  enumerate would be a third copy of one enumeration. plan: SKILLS
- **D-07** Item (d), the consistency pre-pass per revision and the full-folder pre-pass after a
  rework: deferred. Two reasons: (1) a pre-pass that returns findings is a judging agent and never
  runs below the session model (fact 13), so "one sonnet pre-pass" is not available as written;
  (2) ROADMAP § BRIEFS' measurement line holds a session-tier pre-pass before the paid pass (ALOG
  P-5) until the pass-1 BLOCKER count under the pointer-read templates is read on the next
  multi-service plan - RDR's four pre-passes cost ~520k for two defects (fact 26). Back with that
  measurement; the roadmap sub-item stays open with this pointer. plan: deferred
- **D-08** Item (e), the chat form "one item per message" in a Cyrillic operator language:
  declined, no text change. It reverses rule 9 (DOCTR/D-20, fact 16), which carries the operator's
  own later words (2026-10-31 „казвам го за последен път - въпроси се задават с диалози, а не в чата
  като прочетена книга") and already caps a dialog at four points; the Silerax observation (fact
  27) is the earlier word. The roadmap sub-item closes as declined with that pointer. plan: SKILLS
- **D-09** Item (e), the live planner: `skills/plan/SKILL.md` says it where it says "the same
  dispatch" (fact 17) and in the runnability paragraph - a gate refusal, a command that cannot run
  and every revision go to the LIVE planner by a message to the dispatched agent (the harness's
  agent-message tool, `SendMessage` in Claude Code), never a fresh dispatch while that agent lives;
  a fresh dispatch - and its Gate 2 dialog - only when it has ended, the DOCTR/D-17 mechanics (fact
  18) applied to the planner. Why: a respawn re-reads the whole folder (BRIEFS: the first planner
  handoff ~190k) and costs a dialog. plan: SKILLS
- **D-10** Item (f): the three questions of `skills/plan/SKILL.md` Step 1 (fact 19) move AFTER
  Step 2 - Step 1 reads the recorded state and asks nothing; after the research the COO answers
  "which real inputs exist, what must stay, what retires" from the research (its sections 4 and 6)
  and the recorded state, writes the answers into `DECISIONS.md` with their pointers, and only what
  stays unanswered goes to the operator in ONE dialog (rule 9) before Step 3; the suppression dual
  stays (all answered -> nothing asked, the sources cited). The research brief is unchanged: its
  "what already exists" and "unknowns" sections are where the answers come from. Why: the
  operator's words 2026-10-27 („3 въпроса на които можеше да си намериш сам отговорите и ако имаш
  неясноти тогава да ме питаш", the rule approved „ок съм с правилото") and PLAN_GRANTS before them
  (fact 28); f61817f moved the recorded-state read first but left the order (fact 28, `diet.md:60`).
  This plan's own cycle already ran that way. plan: SKILLS
- **D-11** Item (g): the QA brief gains a fourth, DECLARED artifact - the spec's RED run before the
  change: the runner's JSON report of the Writer's own first run of the spec it adds (the Writer
  runs the tests it adds red, then green - `work.md` § Tests, fact 5) - the same config reporter
  that writes the green run's report (fact 3), so no shell redirect is needed (`skills/qa/SKILL.md:124`
  forbids one on the runner command) - copied by the Writer to `<scratchDir>/<REF>-e2e-red.json`
  right after that run, or the line `RED run: none - because <reason>` when the pre-change tree
  could not be run (no server up, a spec over a feature that did not exist). `skills/qa/SKILL.md` Step 2's guaranteed-artifacts
  list and Step 3's EVIDENCE block carry it (fact 21), `docs/CODEX_REVIEW_QA_RECIPE.md` its second
  copy, and `templates/briefs/writer-dispatch.md` gains one line, for `E2E: yes` tickets only,
  naming the path. QA's verdict rule does not change: a passing test is judged from the JSON report;
  the red log is the evidence that the spec CAN fail, which `retain-on-failure` leaves no trace of
  (fact 3). Why: PLINK-003 - the two red logs were QA's decisive evidence, "without them 'passed'
  proves little" (fact 29). plan: SKILLS
- **D-12** The 0.3.17 `Retires local rules:` line names, in the format CLAUDE.md § Changelog format
  gives, the consumer-local forms this release makes redundant: `work.md § project additions: the
  E2E report is copied out` (Silerax, a VERIFY rule - RESEARCH § Paths touched) and `plan.md §
  project additions: Questions come after the research` (Silerax § Execution discipline); whether
  either still stands is the consumer's sweep, on its operator's word. The migration's `note`
  carries the same two as generic ids in `supersedes` (`migrations/README.md:70-76`: the ids a
  release retires - rules, seeds or notes - kept generic): `e2e-report-copied-out`,
  `questions-after-the-research`. plan: SKILLS
- **D-13** Sessions and tiers: S1 (this, Fable) the cycle to the landing; SKILLS-001 `COO: Opus -
  all four no` (a prose ticket of anchored sentences; DOCTR-001 precedent); SKILLS-002 `COO: Opus -
  all four no` (a `note` migration and a bump fire no check - DOCTR/D-25's reading). Both
  `Escalation: none`: no recorded decision reversed (D-08 keeps one), no access surface, no blast
  radius past the ticket, no written disagreement. plan: SKILLS
- **D-15** The approval report of `/pnp:plan` (Step 6, Approval - `skills/plan/SKILL.md`, the
  paragraph "the declared ticket count and its reason, the tickets and their order") names, per
  ticket, the COO tier that executes it - the ticket's `COO: <model> - because <check>` line -
  beside the ticket count and the order. Operator rule 2026-11-08, at this plan's approval report:
  „искам правило след одобрениен на план да ми се рапотуват modelite ЦOO po tiketi"; home chosen by
  dialog the same day: the payload only, through SKILLS-001 (not a local rule). Added after
  readiness pass 1, which did not see it: one sentence in a report paragraph, named as added scope in
  `readiness/SKILLS/round-1.md`; no second pass unless the operator asks. plan: SKILLS
- **D-14** Numbers are measured as the skill says: start 100,000 (the statusline files, 10 % of
  1,000,000); the research agents 81,143 and 88,077 (their completion notifications). plan: SKILLS

## Deferred

- The consistency pre-pass per revision and the full-folder pre-pass after a rework - back with
  ROADMAP § BRIEFS' measurement of the pass-1 BLOCKER count under the pointer-read templates (D-07).
- The Writer brief's skeleton through Gate 2 (DOCSTAGE's second plan) - the one line D-11 adds to
  `writer-dispatch.md` is prose until then.

## Open Questions

None. (The three Step 1 questions, answered from the research: the real inputs are the harvest
records and the CANDIDATES rows already in the tree - facts 23-29; what must stay - the entry's
`out: new skills`, rule 9 and the managed templates (D-01, D-08); what retires - the two
consumer-local forms of D-12.)
