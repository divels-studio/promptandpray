# RULEHOME - decisions

## Decisions

- **D-01** The diagnosis (operator 2026-10-31: „съгласен съм"): rules break where they stand away
  from the point of action and hold where a hook or gate carries them (RESEARCH § Diagnosis). Every
  measure of this plan moves a rule to the artifact the obeying role fills or reads while it acts -
  a brief or record skeleton, the skill step, the role's own file, a project-additions block - or to
  a hook; a rule is never fixed by restating it in one more document. plan: RULEHOME
- **D-02** Three tickets in this order: RULEHOME-001 payload prose, RULEHOME-002 payload code and the
  release cut, RULEHOME-003 the Silerax harvest and diet. 001 and 002 ship as ONE release (0.3.7),
  cut at the close of 002 - the bump is `.claude-plugin/` (Writer), the migration re-renders every
  managed artifact 001 changed, the CHANGELOG block's `Retires local rules:` line names the Silerax
  local rules the payload now carries. Tag and push each on the operator's word. 003 starts only
  after Silerax runs 0.3.7 (`/plugin update` + `/pnp:update` in its own session). Why: a consumer
  takes one update, and the diet is cut against the payload that will stay. plan: RULEHOME
- **D-03** RULEHOME-001 scope - the RESEARCH § S3 ids: T1 (`COVERED BY` in the code-review and QA
  brief skeletons), T2 (product-boundary checks reach a Codex-hosted Reviewer/QA through the brief),
  T3-T5 + X1 (the Writer brief skeleton carries real standing lines in the payload: no dialogs, the
  HEAD hash at dispatch, the background threshold and timeout, the reply length, the commit through
  its dialog with `Refs:`; a project slot only for project lines), T6 + the closing checklist in
  the record skeleton (the operator's own run where the outcome is visible, the diff-review fold,
  the roadmap line marked or removed with its pointer, the findings registered on their area's
  entry, the scratch DELETED with no chat question - the delete dialog is the gate - replacing
  "listed for the operator's delete dialog"), T8, T9, R1 (a Writer digest in the agent template
  replaces reading WORKFLOW § Ticket brief contract), R2, R3, C1, C2, C3, C6, D1 (one threshold
  everywhere), D2, D4, D5, D6, the `/pnp:plan` Step 1 fix (read the recorded state, ask only what
  has no recorded answer - memory `plan-skill-asks-what-is-recorded`), guard (g) language (a
  rule-bearing text is SHOWN in `operator.language` and written in English, the two saying the same
  - operator 2026-10-31: „правилата които се показват на оператора да следват избраната настройка за
  комуникация - така няма да има локални правила"), C4 (ROADMAP § DOCTR auto-mode line), the four
  channel/cleanup/parallel rules of ROADMAP § DOCTR "eight rules" line (Q2, Q3, Q4, C-002) homed in
  the payload, ROADMAP § SKILLS `--trace retain-on-failure`. Prose is R1 in the main session
  (overrides § Hard rules); the managed-artifact re-render rides 002's migration. plan: RULEHOME
- **D-04** C5 (the working directory) and the "no cd" sentence are settled in RULEHOME-002 by its
  spike, not in 001: if `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` returns every Bash command to the
  project root on 2.1.316 (Git Bash and the PowerShell tool) AND an existing migration op can carry
  it into a project's settings, it ships and the rule becomes "a `cd` prefix is harmless; prefer the
  tool's own directory flag"; otherwise the habit guard denies the prefix and a working result
  becomes a ROADMAP line for a carrier. Why: dropping a rule beats guarding it, but not at the price
  of a new op inside this plan. plan: RULEHOME
- **D-05** RULEHOME-002 scope: (a) the working-directory spike of D-04; (b) a spike: do
  `.claude/rules/*.md` files with `paths:` load inside a `writer` subagent on 2.1.316 (proof: an
  `InstructionsLoaded` probe or an observed rule effect) - the answer is data for 003, nothing ships
  on it; (c) the habit guard - a PreToolUse `Bash|PowerShell` check for the main session and the
  Writer that DENIES with a hint: a test or suite run piped into `tail`/`head` (hint: run to a log
  file outside the repo and Read it), `git -c` (hint: drop `-c`, a warning is noise), a `cd` prefix
  when D-04's spike fails (hint: the tool's directory flag) - written INSIDE the Gate 4 hook file as
  its second responsibility, as Gate 3 lives inside the Gate 1 file (why: one node process per shell
  call, and "three hook files" stays true in the canon); (d) the gates' guarantees - the hooks whose
  fail direction is DENY (the Gate 1/3 file, the Gate 4 file) get `onFailure: "block"`; the Gate 2
  hook keeps its ASK direction untouched (a block there would flip it, which is R3 - overrides §
  Architecture direction); Gate 4 handles `tool_name: Monitor`; the Windows no-`shell` behaviour is
  NOT a run-spikes row (round-1 B5: the runner invokes the hook file through node and cannot observe
  the host's failure handling) but spike (c) in the operator's live session - a scratch copy of the
  plugin whose Gate 4 command names a missing interpreter, with `onFailure: "block"`, loaded through
  `--plugin-dir`; pass = one shell call blocked, the harness message recorded in
  `records/RULEHOME-002.md`; `docs/LOOP.md` § Enforcement then names the honest limit (the self-check
  cannot observe host failure handling; the documentation quote of RESEARCH § S4 and the probe date
  stand for it); a FAILED spike (c) - the call ran - is no stop: `onFailure: "block"` ships anyway
  (the documented contract, harmless where the host ignores it) and the LOOP sentence states the
  observed result on that Claude Code version instead of a guarantee; (e) the C5 sentence per D-04; (f) the release cut of
  D-02. Code class: the Writer, the `review.code` row's pass 1. plan: RULEHOME
- **D-06** Rejected or deferred from the harness changelog (RESEARCH § S4): command REWRITING
  (`updatedInput`) is rejected - stripping a `cd` breaks a command that needs the subfolder, and
  dropping a pipe floods the context, so the guard denies and explains; Stop/SubagentStop hooks for
  the closing duties wait - the record skeleton's checklist (D-03) comes first, a hook fires at
  every turn end and can stall work; `omitClaudeMd` for the Reviewer/QA waits - zero violations
  there. plan: RULEHOME
- **D-07** RULEHOME-003 runs through a LIVE Silerax session the operator names, by cross-session
  message; this repository's session never writes in `D:\Stratex` (operator correction 2026-10-18,
  memory `arbiter-role-in-this-session`) - the Silerax COO edits on this session's brief and reports
  back. Its order: (1) re-scan the delta from Silerax `9020e8c3`; (2) HARVEST up to one cut-off -
  `dev/backlogs/COO_SELF_ANALYSIS.md`, the ledger's plan-less and `pnp-candidate` rows, the memory
  files that record incidents - copied into this repository under
  `<plansDir>/active/RULEHOME/records/silerax-harvest/` (operator 2026-10-31: „да ги пренесем тук и
  да ги махнем там, за да мога след две седмица да анализираме новите неща"); every harvested PnP
  idea - a `pnp-candidate` row, a "For PnP" part of a self-analysis entry - gets ONE disposition in
  the harvest: a line on its area's entry in this repository's `dev/backlogs/ROADMAP.md`, `done`
  with its pointer, or `dropped: <why>` - so nothing harvested is parked unread; the harvest is
  COMMITTED HERE (its dialog) before anything is removed there (round-1 B10); (3) REMOVE them in
  Silerax, only after that commit: the self-analysis file and its suspended rule deleted, the
  harvested ledger rows deleted and ONE line left in their place - `harvested by PromptAndPray
  RULEHOME through <date> <hash>, landed <this repository's harvest commit hash>`, the incident
  memory files deleted; the `## Events` rows inside archived records stay - they are a closed
  ticket's history, and the next analysis starts at the cut-off date; (4) the DIET, which opens with
  ONE operator dialog over the enumerated local-vs-local conflicts of RESEARCH § S2 (mockup vs code
  authority, M6 DB checks vs the prod confirm, 400k vs 950k/1000k, which roadmap, English-everywhere
  vs Bulgarian, counterparty vs supplier, "never write dates" vs the dated markers), every answer
  written into `diet.md` before any diet edit (round-1 B6 - Silerax product calls the operator makes
  in S4, listed here, not pre-decided): the overrides keep identity, hard rules, product truth and
  true project rules; COO-only rules move to `.claude/aiwf-native/ORCHESTRATOR.md` project
  additions, Writer rules to `.claude/agents/writer.md` project additions; state and procedures move
  to their own files (RESEARCH § S2 Misplaced); retired rules are deleted; every contradiction is
  resolved to the payload or by the dialog's answer; memory carries no rule (state, user, reference
  only) - `diet.md` carries one row per Silerax memory file with its verdict `state` / `user` /
  `reference` / `rule -> <home>` / `deleted` (round-1 B9) - and its dangling links are resolved; the
  two hooks' cited titles and the local auditor's dead pointer are a Silerax CODE-class item - its
  Writer, its own review route and commit dialog, separate from the Silerax COO's docs commits
  (round-1 B7, `D:\Stratex\AGENTS.md:34-38`) - the removal of step (3) is ONE Silerax docs commit and
  the diet of step (4) another, so a removal can be read on its own; (5) every `Retires local
  rules:` line from 0.3.1 to 0.3.7 is swept against overrides, memory and the CLAUDE.md zone - with
  duplicate / contradiction / project-only verdicts (memory
  `consumer-sweep-covers-all-retires-and-memory`). Every delete runs through Silerax's dialog. Why
  harvest and removal in one session: one cut-off, nothing lost, nothing read twice. plan: RULEHOME
- **D-08** Sessions: S1 (2026-10-31) the entry, research, decisions, planner, stamp and runnability
  pre-pass; S2 the COO's pre-pass (round-0), the readiness pass, triage, approval and landing (a
  readiness cycle starts in a fresh session); S3a RULEHOME-001 on an Opus session; S3b RULEHOME-002
  and the release on a fresh Fable session (the two tickets route to different COO tiers - one
  session cannot carry both); S4 Silerax on 0.3.7 and RULEHOME-003.
  The carrier of this session's context is this folder - RESEARCH.md, this file, the tickets - and
  the records of 001 and 002; S4 reads RESEARCH § S1 and § S2 whole before its first message to
  the Silerax session. plan: RULEHOME
- **D-09** Selective reading is not rejected (operator 2026-10-31: „не съм отхвърлил селективното
  чете - притесняваме да не падне още повече качеството - тук вече не гоним по малко контекст, а по
  стабилна работа на агентите и доктрината"). The Writer digest (D-03 R1) and the role-scoped
  additions blocks (D-07) are within it, each with its quality risk named in its ticket. ROADMAP §
  DOCSTAGE's "out - any selective reading chosen by the COO (rejected 2026-10-18)" is corrected
  when DOCSTAGE is planned. plan: RULEHOME
- **D-10** RULEHOME places rules in today's file layout, by role; DOCSTAGE later splits the doctrine
  by stage and carries the project-additions blocks with it. Why: the diet's target homes survive
  DOCSTAGE, so nothing is moved twice. plan: RULEHOME
- **D-11** Numbers are suspended for this plan (operator 2026-10-31: „отменям записванто на числата
  временно, нямаме време да се занимаваме с това за сега"): Step 1's start number and the index's
  `## Measurements` row are written `suspended by the operator 2026-10-31`. plan: RULEHOME
- **D-12** A QA pass that follows the review in an R2 runtime route rides the ticket's standing
  word: the review pass and the QA pass are the first passes of two roles on one route (operator
  2026-10-31, answer "Върви на думата"). RULEHOME-001 writes it into WORKFLOW § The operator does not
  arbitrate engineering decisions and the copies D3 names; Silerax overrides:617 retires with it.
  plan: RULEHOME
- **D-13** The review brief file is one file per ticket, `<scratchDir>/<key>-review-brief.txt` with
  the same key the session-state file uses, and the wrapper takes the brief path as a parameter so
  the launch command keeps a constant prefix an allow-rule can match (operator 2026-10-31, answer
  "Файл на тикет"); this reverses the fixed-path choice of PARPLAN-002 (`dev/REBUILD.md:46-47`) on
  the operator's own word. It covers the QA brief the same way (`<key>-qa-brief.txt`); QAL is out.
  The flags are `-BriefFile` / `--brief-file`. RULEHOME-002 carries ALL of it - the wrapper flag on
  both channels, the self-check rows AND the prose (WORKFLOW § Branch policy, the review / QA / plan
  skills, the recipe, ORCHESTRATOR's `COVERED BY` path) in one commit - because a skill that names a
  flag the live wrappers do not have yet would break the passes between 001 and 002. Silerax
  overrides:609 retires with it. If no constant-prefix form avoids a dialog, the Writer stops and the
  operator decides again. plan: RULEHOME
- **D-14** The habit guard's matrix (COO 2026-10-31, S2 pre-pass - the D-05 (c) recogniser was
  undefined): a recogniser over every top-level subcommand of the tool's command, both dialects, case
  folded on PowerShell as Gate 4 folds it, every actor (main session, Writer, any subagent). (a) a
  pipe into `tail`, `head`, `Select-Object -First|-Last` (and `Select -First|-Last`) -> deny, hint
  "run to a log file outside the repository and Read it" - any pipe, not only a test run: reading is
  not a shell job (`docs/LOOP.md:95-100`) and "which command is a test run" is an enumeration that
  would never close; (b) when D-04 ships no variable: `cd`, `chdir`, `pushd`, `Set-Location`, `sl`
  as the FIRST token of a top-level subcommand -> deny, hint "the tool's own directory flag"; a `cd` inside quotes or a
  nested shell is not judged - a recogniser, not a parser, Gate 4's honest limit
  (`docs/LOOP.md:189-195`) - so the runbook's Portion 2 command (`dev/VERIFY_RUNBOOK.md:47`, `cd`
  inside `sh -lc '...'`) passes; (c) the global `-c <k=v>` directly after `git` / `git.exe` -> deny,
  hint "drop -c"; the `git -c:*` ask rule stays in the ruleset as the backstop. (d) `tool_name:
  Monitor` is judged in the BASH dialect (RESEARCH § S4 VERIFIED: Bash-matched hooks run on Monitor
  commands). Every deny names the habit and the hint; nothing is rewritten (D-06). plan: RULEHOME
- **D-15** The `-BriefFile` / `--brief-file` contract (COO 2026-10-31): with the flag the brief is
  read from that path - a missing, unreadable, empty or whitespace-only file is exit 2 before any paid
  call; without the flag stdin as today (0.3.6 callers keep working); the flag AND a non-empty stdin
  together are exit 2 (ambiguous). The key rules of 0.3.6 are unchanged. The plan skill's round file
  is keyed the same way - `<scratchDir>/<key>-readiness-round.txt` (`skills/plan/SKILL.md:197`,
  :205) - the review and QA skills write no fixed output file (checked S2). The "allow rule" of D-13
  is a CONSUMER-LOCAL rule - the payload ships only the blanket factory allow
  (`templates/settings.ask-ruleset.json:9-11`) - so the 0.3.7 CHANGELOG block says in one line that
  the launch form changed and a local allow rule on the old form stops matching. plan: RULEHOME
- **D-16** Three gaps of the S2 pre-pass, all RULEHOME-001 / 002 scope (COO 2026-10-31): (a) the
  roadmap's write events (`docs/WORKFLOW.md:562-573`, "exactly three events and never otherwise" +
  the growth write) gain the fifth write - a finding line of an area entry is marked `done` with its
  pointer, or removed, when the commit that closes it lands - else the record skeleton's checklist
  (D-03 T6) contradicts the doctrine it is meant to carry; (b) RULEHOME-001, R1 with no auditor,
  gets ONE scan-tier fact-check over its diff's prose before the commit (the `/pnp:review` Step 2b
  agent, not an auditor - R1 allows it; overrides § Hard rules :37-42 forbid a Writer and an auditor,
  not a scan); (c) RULEHOME-002's closing half sweeps THIS repository's own consumer layer against the
  0.3.7 `Retires local rules:` line - `dev/PROJECT_OVERRIDES.md` (Q2 :206-210, Q3 :203-205, Q4
  :277-279, C-002 :183-185, the auto-mode apply line :223-226, `last-review-session.txt` in
  § Workspace paths :247-248), the memory files, the root `CLAUDE.md` operator zone - duplicate /
  contradiction / project-only per line, R1 in `dev/`, in the record commit. plan: RULEHOME
- **D-17** QA evidence under `--trace retain-on-failure` (COO 2026-10-31, round-1 B2): the JSON
  report is the evidence of a PASSING test; the extracted trace (`trace-extracted/`) exists per
  FAILED test and is passed when it exists; screenshots on failure as today; `BLOCKED` only when the
  JSON report is missing or unreadable - never for a passing test without a trace. The 001 trace row
  changes the flag, the "why the two flags" text, the guaranteed-artifacts list and the QA brief's
  precondition together (`skills/qa/SKILL.md:104`, :113-121, :150-153, :192-196). plan: RULEHOME
- **D-18** The review and QA brief files are never deleted BETWEEN the dispatches of one ticket (a
  correction round re-dispatches without retransmitting; `skills/review/SKILL.md:338-345`,
  `skills/qa/SKILL.md:322-325` keep that sentence) and ARE deleted at the ticket's close by the
  ticket-end cleanup of D-03 T6 - the delete dialog is the gate (COO 2026-10-31, round-1 B3). The
  two skill paragraphs say both halves; the record skeleton's checklist says the second. plan:
  RULEHOME

## Deferred

- The harness changelog as a standing source (operator 2026-10-31: „това е добре да си го запишеш
  като сорс който трябва систематично да се проверява"): the rule text was shown 2026-10-31 and
  waits for its own approval (operator: „спри се малко с тия пряила"); this plan's check ran up to
  Claude Code 2.1.316 (RESEARCH § S4). Comes back when the operator returns to the rules.
- The correction of the memory line "Selective preflight reading rejected - never propose it again"
  (memory `promptandpray-mission-status`): shown 2026-10-31, waits for the same word.
- The next Silerax analysis (operator 2026-10-31: „след две седмица"): starts at D-07's cut-off line.
- Stop/SubagentStop closing-duty hooks, `omitClaudeMd`, path-scoped `.claude/rules` as a payload
  mechanism (D-06; D-05 (b) answers whether 003 may use it locally).
- ROADMAP § DOCTR "eight rules" C-045, C-064, C-067, C-071 (test-baseline and session-start rules) -
  they stay project rules until a plan homes them.
- Furnissimo (operator 2026-10-31: „Furnissimo ще го чистим друг път, там е много работа").

## Open Questions

None. (Answered 2026-10-31: the QA pass word -> D-12; the review brief file -> D-13.)
