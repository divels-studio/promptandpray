# RULEHOME - research

Sources: four read-only `sonnet` scan agents, 2026-10-31, in the planning session (`/pnp:work` ->
`/pnp:plan RULEHOME`), each in a fresh context. Payload read at `D:\pnp-live` = 0.3.6 (`465e580`).
Silerax read at `D:\Stratex` HEAD `9020e8c3` (2026-10-31 14:23), its config on 0.3.6 /
`0031_session-key`. Silerax pointers below are relative to `D:\Stratex\dev\backlogs\` unless written
whole; **Silerax line numbers drift daily - RULEHOME-003 re-scans the delta from `9020e8c3` before it
acts**. `VERIFIED` = the COO opened the file itself in this session; everything else is the agent's
pointer, to be opened before it is acted on (WORKFLOW § Verifying failure claims).

The four sweeps: (S1) Silerax rule events since 0.3.6, (S2) Silerax local-rule inventory, (S3) payload
rule placement, (S4) the Claude Code changelog 0.2.21 .. 2.1.316 (installed 2.1.316; keyword sweep of
8,497 bullets, docs pages not fetched).

## Diagnosis (agreed with the operator 2026-10-31, D-01)

- Hook- or gate-enforced rules hold: the Reviewer has zero violations; the fact-check gate caught
  false claims in 22 Silerax records; Gates 1 and 3 caught writes; Silerax's local long-command hook
  has zero violations in the 8 days (S1 catalogue shows none).
- Prose far from the point of action breaks, however often it is repeated: "no cd prefix" is written
  in 4 homes (LOOP, CLAUDE.md core, writer.md, Silerax overrides) and broken 13 times.
- When a skill or skeleton the COO is executing contradicts a local rule, the skill wins
  (`/pnp:plan` Step 1 three times; the record skeleton's scratch line ~45 of 50 sessions).

## Code Map (payload, 0.3.6)

- `templates/briefs/writer-dispatch.md` - the Writer brief skeleton, 4 lines; line 4 is a placeholder
  "Standing lines: <... from its overrides document ...>" (VERIFIED) - no overrides template has such a
  section (S3 X1).
- `templates/briefs/record.md` - the completion-record skeleton; :33-36 `## Scratch` "what is left to
  delete there, listed for the operator's delete dialog" (VERIFIED); no roadmap-marking line, no
  operator-run line, no diff-review fold.
- `templates/briefs/{planner,research,readiness-codex}.md` - planning briefs (out of scope except
  field-name drift D6).
- `skills/review/SKILL.md` - the code-review brief skeleton :138-185 and fact-check task :216-229 live
  inside the skill; `COVERED BY` appears only in plan mode :263 (VERIFIED, with `skills/plan:185`).
- `skills/qa/SKILL.md` - the QA brief skeleton :161-203; `--trace on` :104,:113-114.
- `skills/plan/SKILL.md` - Step 1 asks three questions unconditionally (:74 per S2).
- `skills/work/SKILL.md` :41-44 - "R2/R3 requires a ticket in a plan".
- `templates/agents/writer.md.tmpl` (143 lines) - tells the Writer to read the overrides doc and
  WORKFLOW § Ticket brief contract (:58-62); "10 minutes" :107 (VERIFIED); Done contract :120-126.
- `templates/agents/reviewer.md.tmpl`, `qa.md.tmpl`, `templates/AGENTS.md.tmpl` (:7-9 forbids
  boundary checks for Codex).
- `templates/` ORCHESTRATOR template (192 lines) - escalation triggers :104-109 without the
  "bar/pin/threshold is a recorded decision" clause of WORKFLOW:794-795.
- `docs/WORKFLOW.md` (888 lines), `docs/LOOP.md` (235), `docs/REVIEW_CHECKLIST.md` (231),
  `docs/CODEX_REVIEW_QA_RECIPE.md` (303).
- `hooks/hooks.json` - three PreToolUse entries (Edit|Write|MultiEdit|NotebookEdit; Agent;
  Bash|PowerShell), shell-form `node` commands, no `shell`, no `onFailure`.
- `scripts/engine/aiwf-lib.js` :92 deny, :102 ask - the only decisions the gates emit.

## S3 - payload placement findings (ids are the plan's worklist ids)

Template rule outside the template:
- T1 `COVERED BY` first line - ORCHESTRATOR tmpl :59-65, WORKFLOW:363; missing from the code-review
  (review:138-185) and QA (qa:161-203) skeletons; nothing checks it.
- T2 product-boundary checks reach only a Claude-hosted Reviewer (reviewer.md.tmpl:62-68); a Codex
  Reviewer/QA never gets them - AGENTS.md.tmpl:7-9 excludes them, the brief skeleton has no slot.
- T3 "Agents work without dialogs ... every Writer brief carries this line" (WORKFLOW:463-465) - not
  in writer-dispatch.md.
- T4 HEAD-at-dispatch literal hash (WORKFLOW:456-458) - only an "e.g." in the placeholder.
- T5 background >5 min + timeout >=3600000, Writer reply ~25 lines (LOOP:103-110, "every brief
  repeats this") - in no skeleton; writer.md.tmpl has a vaguer variant and no reply-length rule.
- T6 operator's own run on real input recorded (WORKFLOW:536-537) and `<REF>-diff-review.md` folded
  into the record (WORKFLOW:98-99) - not in record.md.
- T7 ticket-brief fields (WORKFLOW:419-428) - no skeleton for a non-durable R2 brief.
- T8 red-then-green with both runs in the hand-back (REVIEW_CHECKLIST:158-160, WORKFLOW:824) - not in
  the Writer's Done contract.
- T9 `Refs: <REF>` in the commit body, docs commit separate (WORKFLOW:617-618, :843-844) - the
  committing Writer is not told.

Role misplaced:
- R1 the Writer reads WORKFLOW § Ticket brief contract (~90 lines, mostly COO-authoring rules); only
  :451-455, :474-478, :497-503 are the Writer's.
- R2 "the Reviewer reads past the evidence pack, an incomplete pack is a finding" - review:195-198,
  COO-read prose only.
- R3 "the COO greps the diff for skip/only/todo/reduced sets" - REVIEW_CHECKLIST:158-160, a document
  the COO is not told to read.
- R4 all-roles rules (surgical edits, background, short reply) in LOOP:95-110; the Writer is not told
  to read LOOP beyond § Role boundaries.
- R5 COO text of the CLAUDE.md core is loaded by every subagent (low).

Drift: D1 5 min (LOOP:103) vs 10 min (writer.md.tmpl:107, RECIPE:78, review:348, qa:237, qal:153)
(VERIFIED); D2 escalation copy without the bar/pin clause; D3 which passes need a word - CLAUDE.md.tmpl
:38 / WORKFLOW:125-129 / work:59-62 (is QA after review "a pass beyond the first"?); D4 preflight list
in three variants (CLAUDE.md.tmpl/work/mission vs loop:34-36 vs plan:60-63); D5 resume policy stated
oppositely (RECIPE:93 vs review:383,399); D6 ticket field names in three vocabularies (WORKFLOW,
planner.md + plan-gate, writer-dispatch.md); D7 fact-check skip wording (minor); D8 the Gate 3
allow-list copied in 5 places (aligned today, a hazard).

Contradiction: C1 LOOP:110 "the details in the handoff file" vs WORKFLOW:397 "No separate ... handoff
file" (VERIFIED); C2 "every Writer brief carries `Ticket:`" vs the planner dispatch without it
(plan:138), the exception not stated at the rule; C3 work:41-44 "R2/R3 requires a plan ticket" vs
WORKFLOW non-durable R2 (:509-510, :719-720); C4 LOOP:105-109 auto mode refuses the update's config
write - contradicted by observation (ROADMAP § DOCTR line, overrides § Environment 2026-10-23); C5
LOOP:99-100 no `cd` vs writer.md.tmpl:103-104 "from the cwd it names", qa:103; C6 the Writer's
commit step has no instruction after its DONE turn (low).

Dead pointers: X1 "standing lines from the overrides document" (writer-dispatch:4, loop:67,
SESSION_BRIEF_RECIPE:62); X2 "the machine source the overrides document names" (record:46,
plan:68,236 - the temporary measurement steps; numbers suspended by the operator 2026-10-31); X3
review:210 cites a bold paragraph as a section; X4 readiness-codex.md also briefs a Claude host
(name).

Sizes: COO preflight IN FULL = WORKFLOW 888 + LOOP 235 + ORCHESTRATOR ~176 + overrides; the Writer
reads its file (~130) + the whole overrides + WORKFLOW:414-503.

Additional payload gap raised by the operator 2026-10-31: guard (g) does not say in which language a
rule-bearing text is SHOWN; Silerax carries it locally (`D:\Stratex\dev\PROJECT_OVERRIDES.md:531`
"Rules shown in Bulgarian, written in English", VERIFIED); PnP has no such rule (VERIFIED grep).

Already recorded elsewhere and taken up by this plan: memory `plan-skill-asks-what-is-recorded`
(the Step 1 fix); ROADMAP § DOCTR line "LOOP.md § Role boundaries says auto mode refuses ..." (C4);
ROADMAP § DOCTR line "eight rules that live only in the three projects' overrides" (Q2 dialog only
when the ticket cannot continue, Q3 counts not file:line, Q4 ticket-end cleanup, C-002 parallel by
default, C-045 lint baseline, C-064 baseline JSON, C-067 `E2E: yes/no` line, C-071 sessions from the
root); ROADMAP § SKILLS line "E2E `--trace retain-on-failure`" (Silerax L67).

## S1 - Silerax rule events 2026-10-23 .. 2026-10-31 (~85 events; a FLOOR - not every event is recorded)

Start: commit `34c37e0d` "PromptAndPray 0.3.4 -> 0.3.6" (2026-10-23). 260 commits since 10-18.

Counts by rule (agent tally):
1. claim relayed or brief fact not verified - ~16 (COO ~13);
2. `cd` prefix - 13 (Writer 8: RDR-004, HOME-001, PLINK-001, FLT-002, IMPDT x2, SAVEDLG, IWRA-003/004;
   COO 5: FLT-001, SAVEDLG, IWRA-002, IWRA-004, a PROD SELECT);
3. asked the operator what the record or the tree answers, or what the COO decides - ~11, all COO
   (`/pnp:plan` Step 1 x3: readiness/RDR/ledger.md:29, readiness/GRANTS/ledger.md:18, LEDGER.md:94;
   UIMP-002 D-292 `archive/039_PLAN_UIMP_2026-10-31/records/UIMP-002.md:124`; RCVLOCK-001.md:51;
   FLT-001.md:51; arbiter over-escalation TENANCY-002.md:49; scratch delete x2 RESTORE-001.md:64,
   LEDGER.md:103);
4. shell instead of the tools - 11 (`| tail`/`grep | head` 5 Writer; python/heredoc edits 4 Writer +
   1 COO + 1 agent; Write-whole 1 Writer); one record names the cause "host directive: work through
   Bash" (RCVLOCK-001.md:47);
5. brief/checkpoint file collisions between sessions or passes - 6 (readiness/TENANCY/ledger.md:22,
   IWRB-003.md:54, IWRA-003.md:64, IWRB-001.md:49-52);
6. operator channel / gate - 5 (DB-check steps x2, links, push handed as `!` lines, questions during
   the operator's review);
7. over-engineering / pass-count complaints - 4 (GRANTS „вълна овъринжинеринг", RESTORE „дъжд от
   блокери", FLT pass count, RDR cost);
8. tests red first - 3; scope - 2; `:3000` - 2; commit without dialog - 1 (+1 unverified claim about
   it); `git -c` - 1 recorded (RIR-003.md:101 „а защо не го спазвате"); the operator reports
   several more interruptions of a Fable session on `git -c` that left no row.

By actor: COO ~45, Writer ~20, Reviewer 0, other agents 4.

Roadmap bookkeeping (operator 2026-10-31: findings recorded? closed defect work removed?): LEDGER.md:98
„За Нти път ... напомням за изчистване/маркиране в роадмапа на завършена работа"; UIMP
readiness/UIMP/ledger.md:17 "third plan in a row".

The self-analysis mechanism: a project rule (`dev/PROJECT_OVERRIDES.md` § Loop shape, operator rule
2026-10-19, ported from Furnissimo) + `dev/backlogs/COO_SELF_ANALYSIS.md` (1242 lines, entries
2026-10-18 .. 2026-10-28, newest on top); suspended 2026-10-27 by commit `d72e8e46`
(`PROJECT_OVERRIDES.md:671-674`, LEDGER.md:93 „отменя се до второ мое нареждане"); one entry written
while suspended on the operator's word (2026-10-28 PLAN_RIR, „пиши самоанализ защото си тотална
издънка"). Its "For PnP" ideas became `pnp-candidate` rows: LEDGER.md:71-76, 80-81, 88, 103.

Operator quotes (verbatim, pointers): „имам чувството че въобще не си наясно на кой етап от развитието
на софтуера сме" (readiness/RDR/ledger.md:29); „за втори път поправки на готов план и изхарчени пари на
вятъра" (readiness/RDR/ledger.md:30); „какви са тия глупости всеки път 3 въпроса преди планиране"
(readiness/GRANTS/ledger.md:18); „хайде да си прочетеш меморито" (TENANCY-003.md:63); „ама всеки път
да напомням как може да се спести време" (TENANCY-002.md:50); „не изрязвай тикета заради някакви
скапани байтове" (PLINK-001.md:58); „ееее прекаляваш, това са твои команди" (LEDGER.md:84); „да не
кажа че можеше и сам да си го провериш" (FLT-001.md:51); „почиствай, твое задължение е!"
(RESTORE-001.md:64); „явно и QA не знае какво да гледа" (LEDGER.md:100); „никога не съм губил
прозорци, не си измисляй" (IWRB-003.md:56); „Това решение вече съм го взимал" (UIMP-002.md:124);
„Защо всек път ме питате дали да почисвате, нали има правило ... 5 от 50 сесии трият сами"
(LEDGER.md:103); „ужасен си", „дай да си говорим нещата" (COO_SELF_ANALYSIS.md:36-37).

Catches (the mechanisms that work): fact-check gate in 22 records (e.g. RIR-003 22 false, IWRB-002 21
false - 19 the COO's own, UIMP-001 18/258); Gate 1 (TENANCY-002.md:53, UIMP-002.md:122); Gate 3
(ORPH-001.md:43, UIMP-002.md:123).

## S2 - Silerax local-rule inventory (at `9020e8c3`)

Sizes: `dev/PROJECT_OVERRIDES.md` 674 lines (VERIFIED) / 62,603 B, ~100 bold rules, 67 "operator
rule" lines, 25 Bulgarian lines, ~40% occasion/quote/state - as large as WORKFLOW.md (62,551 B); the
Writer is told to read it whole before every task (`D:\Stratex\.claude\agents\writer.md:45`,
VERIFIED). CLAUDE.md operator zone 23 lines / 4 rules. ORCHESTRATOR.md and writer.md / qa.md
project-additions blocks: EMPTY. AGENTS.md additions 45 lines / 5 rules. Local agent
`.claude/agents/fable-auditor.md` 51 lines, points at a plan that no longer exists. Memory: MEMORY.md
35 lines + 26 files (~45.6 KB), ~17 rule-bearing. Local hooks: `long-command-guard.mjs`,
`context-gate.mjs` - both cite Bulgarian rule titles that no longer exist.

Contradictions with the payload: L81 overrides:609 per-ticket brief `.aiwf/<REF>-review-brief.txt`
(operator rule 2026-10-28) vs WORKFLOW:768 + review skill + ORCHESTRATOR one fixed
`review-brief.txt` (PnP PARPLAN-002, `dev/REBUILD.md:46-47`: "a per-ticket brief file was rejected"
because the constant command is what the permission rule matches); L61 overrides:378 "checks run by
a fresh sonnet agent, NOT the Writer" vs writer.md "run VERIFY"; L32 overrides:138 skip Step 1's
questions vs skills/plan:74; L67 overrides:487 `--trace retain-on-failure` vs skills/qa `--trace on`;
L37 overrides:222,233 roadmap deviations (declared).

Local-vs-local: M6 memory `feedback_db_checks_and_push_steps` (COO runs DEV/PROD SELECTs itself,
operator hard rule 2026-10-24, memory only) vs overrides:18-23 (anything against prod needs a
confirm); mockup vs code authority stated five ways (overrides:265, :273, :620, :626, :663 + memory
`feedback_mockup_from_site`); 400k (overrides:647) vs 950k/1000k (`context-gate.mjs:14-16`); which
roadmap (overrides:501 root `ROADMAP.md` vs :179 `dev/backlogs/ROADMAP.md`); English-everywhere
(overrides:523) vs Bulgarian in overrides itself and the changelog (CLAUDE.md:126); "counterparty,
never supplier" (memory project_mission_resume) vs "supplier" (user_domain_expert_wife, overrides:324);
overrides:72 cites "AGENTS.md § Hard rules", which does not exist; memory project_plan_order "never
write dates" vs the dated rule markers.

Retired by the payload, local text still present: L36 overrides:166-173 (the 11 execution guards,
0.3.3 tombstone); L80 overrides:601-608 (explicit `-ResumeId`; its own "Expires" condition met by
0.3.6 keying); L74 overrides:536 (0.3.1, now a narrow format extension); ~13 rules already in
"PnP (...). Our addition:" pointer form are still 2-3x their delta. The 0.3.4-0.3.6 Retires lines are
`none`.

Misplaced (would move in the diet): state/procedure blocks in overrides - documentation trust
boundary :99-120 (state), E2E credentials :421-480 (-> e2e docs), roadmap design :175-239 (12
sub-rules, -> ROADMAP header), versioning :503-519 (-> `.githooks/README.md`), known-red baselines
:403-419 (state, repeated in AGENTS.md:41-45), test counts :338-351; 13 memory files carrying rules
(M2-M10, M12-M16 in the agent's table: codex/cent vocabulary, parallel+QA-beside-pass, kill a foreign
test-port process, sessions from root, DB checks/push, working lessons, mockup-from-site, redesign
vision, redesign hub, vocabulary in mission state, "never write dates", restart strategy, e2e machine
traps, prod DB state); 6 memory files that are pure pointers ("Extra: none"); 3 dangling memory links
(`[[feedback-surgical-edits]]`, `[[feedback-scope-question-early]]`, `[[feedback-operator-role]]`) -
those rules are lost.

Cross-home duplicates: tenancy/RLS boundary (overrides + config productBoundaryChecks + writer.md);
no-cd (overrides + CLAUDE core + writer.md + LOOP); shell reading/editing (overrides + CLAUDE core +
writer.md); background >=3600000 (overrides + hook + writer.md + LOOP); no AI traces (overrides +
settings attribution "" + memory); scratch delete (overrides + memory); node_modules junction
(overrides + memory); commit classes (overrides + AGENTS.md); known-red (overrides + AGENTS.md); E2E
actor seeding (overrides + AGENTS.md); changelog language (overrides + CLAUDE.md); DB check procedure
(two memory files + overrides); parallel Writers (overrides + memory); checkpoint (overrides + hook);
mockup authority (overrides + two memory files); pass state (overrides x2 + RECIPE); roadmap
(overrides + ROADMAP header + two memory files).

## S4 - the Claude Code changelog (agent report; the items below marked VERIFIED were checked 2026-10-31 in S2 against code.claude.com/docs hooks.md, changelog.md, env-vars.md, sub-agents.md, permissions.md by a scan agent, the quotes relayed to the COO)

VERIFIED 2026-10-31 (S2):
- `onFailure: "block"` - changelog 2.1.295: "a hook that can't start, times out, or exits with an
  unexpected code blocks the action instead of letting it through"; failure = cannot start (a missing
  interpreter included), exit code other than 0 or 2, timeout, invalid output; the default is
  `continue`; it sits PER HOOK COMMAND OBJECT (beside `type` / `command`), not on the matcher group.
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` - env-vars page: "Return to the original working
  directory after each Bash or PowerShell command in the main session" - documented for the MAIN
  SESSION only; a subagent is not named. No existing migration op writes a settings `env` block.
- Monitor - changelog 2.1.314: "Fixed hooks matching Bash not running on shell commands started by the
  Monitor tool; such hooks can block or ask, but not approve or rewrite those commands". The
  `tool_name` such a hook receives is NOT documented (Gate 4 today judges every non-`Bash` name in the
  PowerShell dialect - `dialectOf`).
- `InstructionsLoaded` exists (fires at session start and on lazy loads; matcher values
  `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`; fields `file_path`,
  `memory_type`, `load_reason`, `globs`, `trigger_file_path`, `parent_file_path`); `agent_type` is a
  COMMON hook field "present when ... the hook fires inside a subagent". Whether this event fires
  inside a subagent is not documented - spike (b) stands.
- `.claude/rules` in subagents - sub-agents.md: ordinary subagents load "every level of the CLAUDE.md
  hierarchy ... including project rules"; Explore, Plan and `omitClaudeMd` agents load a matching
  path-scoped rule only when they work with files there. `paths:` rules in an ordinary subagent are
  documented by inference, not by an explicit sentence.
- Precedence - permissions.md: "PreToolUse hook decisions don't bypass permission rules ... a
  matching deny rule blocks the call, and a matching ask rule still prompts even when the hook
  returned allow or ask"; a hook `deny` stays blocked whichever settings file it comes from.

The agent's original sweep, unverified where not listed above:

Usable: (1) PreToolUse `additionalContext` (2.1.9) and `updatedInput` (2.0.10/2.1.0) - a hook can
explain or rewrite; (2) `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` (1.0.18) - each Bash command starts
in the project root (unverified on 2.1.316 / Windows); (3) `.claude/rules/*.md` with `paths:` globs
(2.1.84; also loaded on Write/Edit since 2.1.288) - path-scoped rules loaded by the harness;
`InstructionsLoaded` hook carries `agent_type` (2.1.288) - can prove what a subagent loaded; (4)
Stop/SubagentStop hooks with `additionalContext` (2.1.163), block cap 8 (2.1.143); PreCompact /
PostCompact / SessionStart re-injection; (5) agent frontmatter `hooks:` (2.1.0), `skills:` preload,
`omitClaudeMd` (2.1.271), `memory:` (2.1.33), `isolation: worktree` (2.1.222); hook `if:` conditions
(2.1.85); `onFailure: "block"` (2.1.295); exec-form `args` (2.1.139); plugin `bin/`,
`${CLAUDE_PLUGIN_DATA}`, `userConfig` (2.1.78-2.1.91); skill `disallowed-tools` (2.1.152).

Risks to PnP guarantees: Bash-matched hooks now also run on Monitor commands, block/ask only
(2.1.314) - Gate 4 must recognise `tool_name: Monitor`; on Windows a PreToolUse hook with no `shell`
failed OPEN when Git for Windows was missing (2.1.299/2.1.310) - our three hooks set no `shell`;
`permissions.deny` beats a hook `ask`, auto mode floors at a hook's `ask` (2.1.77/2.1.101/2.1.211);
pre-2.1.257 an `ask` rule inside a compound command was skipped in auto mode (a floor version for the
self-check); the Task -> Agent rename version not found (Gate 2 pins `Agent`).

Effort per subagent: already used - `effort:` frontmatter rendered from `roles.*.effort` in all three
agent templates (VERIFIED `templates/agents/*.tmpl`).

## Unknowns

- Whether `.claude/rules/*.md` path-scoped rules load inside a `writer` subagent (not only the main
  session) on 2.1.316 - decides whether they can carry the diet.
- Whether `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` still works on 2.1.316 with Git Bash and the
  PowerShell tool - decides whether the "no cd" rule is dropped or guarded.
- Whether Gate 4 sees Monitor commands today; whether a hook with `onFailure: "block"` and no `shell`
  blocks on a missing interpreter.
