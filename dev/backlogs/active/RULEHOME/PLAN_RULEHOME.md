# PLAN_RULEHOME - every rule stands where the role that must obey it acts

The plan of the roadmap entry `RULEHOME` in `dev/backlogs/ROADMAP.md` (Size S). One folder: this
index, `DECISIONS.md` (D-01..D-18), `RESEARCH.md` (the four sweeps of 2026-10-31: payload 0.3.6 at
`465e580`, Silerax at `9020e8c3`), `tickets/RULEHOME-NNN.md` (the frozen contract),
`records/RULEHOME-NNN.md` (written at each ticket's close) and `records/silerax-harvest/`
(RULEHOME-003). Readiness history: `readiness/RULEHOME/`.

## Goal

Every rule stands where the role that must obey it acts (D-01): a rule the loop depends on is
carried by the artifact the role fills or reads at the moment it acts - a brief or record skeleton,
the skill step, the role's own file - or by a hook, never by one more restatement; the payload holds
no contradiction a role can trip on; and the first consumer (Silerax, `D:\Stratex`) keeps only
product truth and true project rules in its overrides, none in memory. 001 and 002 ship as ONE
release, 0.3.7, cut at the close of 002 (D-02); 003 cuts the consumer's diet against that release.

## Scope

In:
- RULEHOME-001 (prose, R1): the D-03 worklist below - the brief and record skeletons, the review /
  QA / QA-live / plan / work / loop skills, the writer, ORCHESTRATOR and CLAUDE.md templates,
  `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`,
  `docs/SESSION_BRIEF_RECIPE.md`; the QA-pass word of D-12; the three roadmap lines it homes,
  marked with their pointer.
- RULEHOME-002 (code, R2): the three spikes of D-04, D-05 (b) and D-05 (d); the habit guard inside the Gate 4
  hook file (D-05 (c), D-06); the gates' guarantees (D-05 (d)); ALL of D-13 in one commit - the
  per-ticket brief path on the Codex wrappers, its self-check rows and its prose; the
  working-directory sentence (D-04, D-05 (e)); the release 0.3.7 (D-02).
- RULEHOME-003 (consumer, through a live Silerax session): harvest, removal, diet and the Retires
  sweep of D-07, in today's file layout (D-10).

Out: command rewriting through `updatedInput`, Stop/SubagentStop closing-duty hooks, `omitClaudeMd`
(D-06); path-scoped `.claude/rules` as a payload mechanism, the harness changelog as a standing
source, ROADMAP § DOCTR C-045 / C-064 / C-067 / C-071, Furnissimo (DECISIONS § Deferred); the
doctrine split by stage, DOCSTAGE (D-10; its "selective reading rejected" line is corrected when
DOCSTAGE is planned, D-09); the RESEARCH § S3 ids D-03 does not name (T7, R4, R5, D7, D8, X2, X3,
X4); any write in `D:\Stratex` by this repository's session (D-07).

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| RULEHOME-001 | payload prose: the skeletons, skills, templates and doctrine sentences of D-03, the QA word, the QA evidence, the brief files' lifetime | D-01 D-03 D-09 D-12 D-16 D-17 D-18 | open | - |
| RULEHOME-002 | payload code: two spikes, the habit guard, the gates' guarantees, the per-ticket brief path with its prose, release 0.3.7 | D-02 D-04 D-05 D-06 D-13 D-14 D-15 D-16 | open | - |
| RULEHOME-003 | Silerax: harvest, removal, diet, Retires sweep | D-02 D-07 D-08 D-09 D-10 | open | - |

## Order and gates

Order 001 -> 002 -> 003 (D-02). Sessions (D-08): S2 the readiness pass, triage, approval and
landing; S3a RULEHOME-001 on an Opus session; S3b RULEHOME-002 and the release on a fresh Fable
session (the two tickets route to different COO tiers); S4 Silerax on 0.3.7 and RULEHOME-003 - S4
reads RESEARCH § S1 and § S2 whole before its first message to the Silerax session. Numbers are
suspended (D-11): every `## Measurements` row of this plan, the records' included, reads
`suspended by the operator 2026-10-31`.

- **RULEHOME-001** - the operator's word for the ticket; R1 in the main session (overrides § Hard
  rules), no Writer, no auditor (the audit table's docs row has 0 passes); every rule-bearing text
  shown to the operator before the commit (guard (g)); VERIFY = the prose row; ONE scan-tier
  fact-check over the diff's prose before the commit - the `/pnp:review` Step 2b agent
  (`skills/review/SKILL.md:200`), not an auditor (D-16 (b)); one docs commit
  through its dialog; the live copy refreshed (root `CLAUDE.md` § This repository is the plugin);
  no bump, no CHANGELOG block (D-02).
- **RULEHOME-002** - the operator's word for the ticket; the three spikes first (procedures below),
  results in `records/RULEHOME-002.md` before the Writer's dispatch; the Writer (`Ticket:
  RULEHOME-002`); the fact-check gate; Codex code pass 1 of the `review.code` row, riding the
  ticket's word - any further pass on its own word; the code commit through its dialog; the closing
  half: this repository on 0.3.7 through `/pnp:update --apply` under auto mode (overrides §
  Environment :223-225), the sweep of THIS repository's own consumer layer against the 0.3.7
  `Retires local rules:` line (D-16 (c)) - `dev/PROJECT_OVERRIDES.md` at the lines D-16 (c) names,
  the memory files, the root `CLAUDE.md` operator zone - a duplicate / contradiction / project-only
  verdict per line, R1 in `dev/`, landing in the record commit; the record, the memory file `plan-skill-asks-what-is-recorded` deleted
  (its fix shipped), the record commit through its dialog; then the tag word and the push word -
  the tag created locally on the record commit and pushed with `main` in one push (overrides § Hard
  rules :49-51).
- **RULEHOME-003** - starts only after Silerax ran `/plugin update` + `/pnp:update` to 0.3.7 in its
  own session (D-02); the operator names the live Silerax session (D-07) and gives the word; this
  session reads `D:\Stratex` and writes only here; the Silerax COO edits on this session's brief,
  every delete through Silerax's dialog, its push on the operator's word there. Order (D-07 as
  amended, round-1 B6, B7, B9, B10): the harvest lands HERE in one commit through this repository's
  dialog BEFORE anything is removed there; the removal there carries that commit's hash in its
  marker line; the diet opens with the ONE operator dialog over the conflicts, answered into
  `diet.md`; Silerax then lands TWO commit classes - the Silerax COO's docs commit(s) (removal,
  diet) and a separate code-class item (the two hooks' cited titles, `fable-auditor.md`'s dead
  pointer) through Silerax's Writer, its own review route and commit dialog. The step content is
  § RULEHOME-003 procedure below.

## RULEHOME-001 worklist (D-03, D-12, D-16 (a))

Pointers at `465e580`. The Writer of each line is the main session.

| id | where | what lands |
|---|---|---|
| T1 | `skills/review/SKILL.md:138-139`, `skills/qa/SKILL.md:161-162` | the skeleton's first line `COVERED BY: operator word "<quote>", <date>` - the form of `templates/ORCHESTRATOR.md.tmpl:59-65` and `docs/WORKFLOW.md:363` |
| T2 | `skills/review/SKILL.md:166`, `skills/qa/SKILL.md:161-203` | a `PRODUCT BOUNDARY CHECKS:` slot the COO fills from `config.review.productBoundaryChecks` (or `none`) - the list a Claude Reviewer gets at `templates/agents/reviewer.md.tmpl:63-68`; `templates/AGENTS.md.tmpl:7-9` stays role-free |
| T3, T4, T5, X1, Q2 | `templates/briefs/writer-dispatch.md:4` | the placeholder replaced by the payload's standing lines: agents work without dialogs, a dialog only at a gate or when the ticket cannot continue (`docs/WORKFLOW.md:463-465`); `HEAD <literal hash at dispatch>` (`docs/WORKFLOW.md:456-458`); the background threshold and timeout (D1 constant); the reply about 25 lines (`docs/LOOP.md:109-110`); the commit through its native dialog with `Refs: <REF>` in the body (`docs/WORKFLOW.md:617`, :843-845); then one slot `Project lines: <project rules only, or none>` |
| X1 | `skills/loop/SKILL.md:67`, `docs/SESSION_BRIEF_RECIPE.md:62` | "the standing lines" point at `templates/briefs/writer-dispatch.md`, not at the overrides document |
| T6, Q4 | `templates/briefs/record.md:33-36` + a closing checklist in the skeleton | the scratch DELETED with no chat question, the delete dialog is the gate (replaces "listed for the operator's delete dialog"); the operator's own run on a real input where the outcome is visible (`docs/WORKFLOW.md:535-537`); `<REF>-diff-review.md` folded in (`docs/WORKFLOW.md:98-99`); the roadmap line marked or removed with its pointer; the findings registered on their area's roadmap entry |
| T6, Q4 | `docs/WORKFLOW.md:529-532` | the same scratch sentence |
| T6, D-18 | `skills/review/SKILL.md:338-345`, `skills/qa/SKILL.md:322-325` | both halves of D-18: the brief file is never deleted BETWEEN the dispatches of one ticket (a correction round re-dispatches without retransmitting) and IS deleted at the ticket's close by the ticket-end cleanup, the delete dialog the gate; the sentence "Never delete ... afterwards" is reworded to the two halves; the record skeleton's checklist (row above) carries the second half |
| D-16 (a) | `docs/WORKFLOW.md:562-573` | the roadmap's write events gain the fifth write - a finding line of an area entry is marked `done` with its pointer, or removed, when the commit that closes it lands - so the record skeleton's roadmap line (T6) carries the doctrine instead of contradicting "exactly three events" |
| T8 | `templates/agents/writer.md.tmpl:118-126` | Done contract: every new test red under a named fault, then green, both runs in the hand-back (`docs/REVIEW_CHECKLIST.md:158-160`) |
| T9, C6 | `templates/agents/writer.md.tmpl:76-80` | the commit step after DONE: on the COO's instruction, by explicit paths, body `Refs: <REF>`, through its dialog; the docs commit separate (`docs/WORKFLOW.md:843-845`) |
| R1 | `templates/agents/writer.md.tmpl:58-62` | a Writer digest of `docs/WORKFLOW.md:451-458`, :474-478, :497-503 replaces reading § Ticket brief contract; the overrides document stays |
| R2 | `skills/review/SKILL.md:162-164` | the evidence-pack slot says: read past it, an incomplete pack is a finding (text of :195-198) |
| R3 | `skills/review/SKILL.md:187-189` | the COO's step before the dispatch: grep the diff for skip / only / todo / reduced sets, a decision per hit (`docs/REVIEW_CHECKLIST.md:158-160`) |
| C1 | `docs/LOOP.md:109-110` | "the details in the handoff file" -> the details in the report (`docs/WORKFLOW.md:397`, `templates/agents/writer.md.tmpl:75`) |
| C2 | `templates/CLAUDE.md.tmpl:55-56`, `skills/loop/SKILL.md:71` | the planner exception stated at the rule (`skills/plan/SKILL.md:136-140`) |
| C3 | `skills/work/SKILL.md:41-45` | R2/R3 names the non-durable R2 brief beside the plan ticket (`docs/WORKFLOW.md:507-509`, :719-720) |
| C4 | `docs/LOOP.md:105-109` | the observed behaviour: the update engine's config write is not refused under auto mode; the refusal stands only for the Edit/Write tool class on `.claude/settings.json` and `.claude/hooks/**` (`dev/backlogs/ROADMAP.md:131`) |
| D1 | `docs/LOOP.md:102-105`, `templates/agents/writer.md.tmpl:105-107`, `docs/CODEX_REVIEW_QA_RECIPE.md:77-79`, `skills/review/SKILL.md:347-350`, `skills/qa/SKILL.md:237`, `skills/qal/SKILL.md:153` | one threshold: a command expected to run over about five minutes runs in the background with a timeout of at least 3600000 ms (the LOOP constant); "10 minutes" stays only as the name of the cap |
| D2 | `templates/ORCHESTRATOR.md.tmpl:104-109` | + the clause of `docs/WORKFLOW.md:794-795` (a recorded bar, pin, threshold or cap fires trigger 1) |
| D4 | `skills/loop/SKILL.md:34-36` | the four documents IN FULL of `skills/work/SKILL.md:32-35` |
| D5 | `docs/CODEX_REVIEW_QA_RECIPE.md:92-94` | one resume policy with `skills/review/SKILL.md:381-383` and :399 (the state file is keyed per ticket since 0.3.6) |
| D6 | `docs/WORKFLOW.md:419-428`, `templates/briefs/writer-dispatch.md:2` | the field names are the six headings `scripts/engine/plan-gate.js:28-30` checks (Assignee and Working branch stay) |
| Step 1 | `skills/plan/SKILL.md:74-76` | read the recorded state first - the roadmap entry, the earlier plans' DECISIONS on the area, the project's status documents - and ask only what has no recorded answer; nothing asked when all is recorded |
| (g) | `docs/WORKFLOW.md:219-226` | a rule-bearing text is SHOWN in `operator.language` and written in English, the two saying the same |
| Q3 | `docs/WORKFLOW.md:151-154` | the operator channel carries counts and names, never `file:line` |
| C-002 | `docs/WORKFLOW.md:39` (§ COO owns broad scans) | independent units run in parallel by default, within the machine limits the overrides document names |
| trace, D-17 | `skills/qa/SKILL.md:104`, :113-121, :150-153, :192-196 | `--trace retain-on-failure`, and together with it (D-17): the "why the two flags" text and the guaranteed artifacts (:113-121) - the JSON report always, a trace per FAILED test; the artifacts passed to QA (:150-153) - the JSON report is the evidence of a passing test, `trace-extracted/` per failed test, passed when it exists; the QA brief's precondition (:192-196) - `BLOCKED` only when the JSON report is missing or unreadable, never for a passing test without a trace |
| D-12 | `docs/WORKFLOW.md:125-129`, `templates/CLAUDE.md.tmpl:38-39`, `skills/work/SKILL.md:58-62`, `templates/ORCHESTRATOR.md.tmpl:70-74` | a QA pass that follows the review in an R2 runtime route rides the ticket's standing word |
| roadmap | `dev/backlogs/ROADMAP.md:131`, :132 (Q2, Q3, Q4, C-002), :142 | each marked with the commit pointer |

The D-13 rows of the brief path are RULEHOME-002's (below): 001 touches no `review-brief.txt` /
`qa-brief.txt` mention, so no skill names a flag the live wrappers lack between the two commits.

## RULEHOME-002 worklist (D-04, D-05, D-06, D-13, D-14, D-15)

Pointers at `465e580`. The three hook files stay three: Gate 1/3 `scripts/engine/pretooluse-mutation-guard.js`
(`hooks/hooks.json:10`), Gate 2 `scripts/engine/pretooluse-dispatch-gate.js` (:19), Gate 4
`scripts/engine/pretooluse-git-verb-guard.js` (:28).

| item | where | what lands |
|---|---|---|
| habit guard, D-05 (c), D-06, D-14 | `scripts/engine/pretooluse-git-verb-guard.js` (wired at `hooks/hooks.json:23-31`), deny through `scripts/engine/aiwf-lib.js:90-92` | a second responsibility INSIDE the Gate 4 file, as Gate 3 lives inside the Gate 1 file (`pretooluse-mutation-guard.js:234`). The D-14 matrix in short: a recogniser over every top-level subcommand, both dialects, PowerShell case-folded as Gate 4 folds it, every actor (main session, Writer, any subagent); it DENIES with a hint, never rewrites. Five deny shapes: (1) a pipe into `tail`, (2) into `head`, (3) into `Select-Object` / `Select` with `-First` / `-Last` - hint "run to a log file outside the repository and Read it" (any pipe, not only a test run); (4) `cd` / `chdir` / `pushd` / `Set-Location` / `sl` as the FIRST token of a top-level subcommand, when D-04 ships no variable - hint "the tool's own directory flag"; (5) the global `-c <k=v>` directly after `git` / `git.exe` - hint "drop -c" (the `git -c:*` ask rule stays as the backstop). Not judged inside quotes or a nested shell - a recogniser, not a parser (`docs/LOOP.md:189-195`) - so the runbook's Portion 2 command (`dev/VERIFY_RUNBOOK.md:47`, `cd` inside `sh -lc '...'`) is a PASS case. Monitor = the Bash dialect (row below). Every deny and every row says "habit" |
| fail-closed, D-05 (d) | `hooks/hooks.json:9-10` (Gate 1/3), :27-28 (Gate 4) | `onFailure: "block"` on these two only; the Gate 2 entry `hooks/hooks.json:18-19` unchanged - a block there flips its ASK direction (overrides § Architecture direction :109-111) |
| Monitor, D-05 (d), D-14 (d) | `scripts/engine/pretooluse-git-verb-guard.js:486-494` | `tool_name: Monitor` judged in the Bash dialect, not passed through |
| no-shell, D-05 (d) | spike (c) below; `docs/LOOP.md` § Enforcement | NOT a `scripts/spike/run-spikes.mjs` row (round-1 B5: the runner invokes the hook file through node and cannot observe the host's failure handling): spike (c)'s result lands in `records/RULEHOME-002.md`; `docs/LOOP.md` § Enforcement names the honest limit - the self-check cannot observe host failure handling; the documentation quote of RESEARCH § S4 and the probe date stand for it |
| D-13 code, D-15 | `scripts/native/ps/codex-review.ps1`, `scripts/native/ps/codex-qa.ps1:57`, `scripts/native/sh/codex-review.sh:43-45`, `scripts/native/sh/codex-qa.sh:44-45`; QAL out | PowerShell `-BriefFile <path>`, bash `--brief-file <path>`; the brief file keyed like the session-state file; the CLI contract of D-15 - the flag reads the brief from its path (a missing, unreadable, empty or whitespace-only file = exit 2 before any paid call), no flag = stdin as in 0.3.6, the flag AND a non-empty stdin = exit 2, the 0.3.6 key rules unchanged; the Writer enumerates the remaining pins of the brief path (the .ps1 review wrapper, the self-check rows) with its own closing grep |
| D-13 prose, D-15 | `docs/WORKFLOW.md:765-770`, `docs/CODEX_REVIEW_QA_RECIPE.md:74-76`, :201, :206, :220, :224, :254, `docs/SESSION_BRIEF_RECIPE.md:45`, `skills/plan/SKILL.md:46`, :182, :196, :197, :203, :205, `skills/review/SKILL.md:300`, :307, :314, :365, :372, :420, `skills/qa/SKILL.md:212`, :220, :227, :251, :258, :304, `templates/ORCHESTRATOR.md.tmpl:61`; the "fixed on purpose" paragraphs `skills/review/SKILL.md:319-327`, `skills/qa/SKILL.md:209-210` (stdin only), :231-234 (round-1 B1); `scripts/native/README.md:24-26` (round-1 I2) | the "fixed on purpose / do not make the path unique per ticket" paragraphs are rewritten: the brief file is per ticket and the launch keeps a constant prefix with the path passed through the flag (D-13, D-15), stdin stays the fallback; the README names the flag beside stdin; the brief file is `<scratchDir>/<key>-review-brief.txt` (QA: `<key>-qa-brief.txt`), the key of the session-state file; the launch passes its path through the flag; the plan skill's round file is `<scratchDir>/<key>-readiness-round.txt` (`skills/plan/SKILL.md:197`, :205, D-15); `migrations/0031_session-key/NOTES.md:17` is history, not edited |
| C5, D-04, D-05 (e) | `docs/LOOP.md:99-100`, `templates/agents/writer.md.tmpl:103-104`, `skills/qa/SKILL.md:103` | spike (a) passed AND an existing op carries the variable -> "a `cd` prefix is harmless; prefer the tool's own directory flag"; otherwise "no `cd` prefix, the habit guard denies it" |
| carrier, D-04 | the op vocabulary (overrides § Data :124-126); `templates/settings.ask-ruleset.json`, `scripts/setup/generate.mjs:1234` | the variable ships only through an existing op; with none, a working spike result becomes a ROADMAP line for a carrier (`dev/backlogs/ROADMAP.md`, written by the COO at the close) |
| rows | `scripts/selfcheck/aiwf-selfcheck.js`, `scripts/spike/run-spikes.mjs` | a row per item above but no-shell (spike (c)), each with its negative control (overrides § Architecture direction :114-115) |
| release, D-02 | `.claude-plugin/plugin.json:3`; `migrations/0032_<slug>/` (`ops.json`, `NOTES.md`) + `migrations/index.json:32`; `CHANGELOG.md`; `README.md` § Status | 0.3.7; a `rerender-managed-region` op for every managed artifact 001 and 002 changed, the shape of `migrations/0024_thin-rendered-files/ops.json:5-10`; the block `## [0.3.7]` ending `Retires local rules:` naming, generically: QA after the review rides the ticket's word (D-12), the per-ticket review brief (D-13), Step 1's questions skipped, `--trace retain-on-failure`, the explicit resume id, rules shown in the operator's language (RESEARCH § S2); and one consumer line (D-15): the review / QA launch form changed, so a local allow rule written on the old form stops matching (the payload ships only the blanket allow, `templates/settings.ask-ruleset.json:9-11`) |

## RULEHOME-003 diet pointers (D-07 (4), RESEARCH § S2)

Lines of `D:\Stratex\dev\PROJECT_OVERRIDES.md` at `9020e8c3`; RULEHOME-003 step 1 re-anchors them.

| verdict | lines |
|---|---|
| state and procedures to their own files | :99-120, :175-239, :338-351, :403-419, :421-480, :503-519 |
| retired, deleted | :166-173, :536, :601-608; the 0.3.7 retirements :138, :487, :531, :609, :617 |
| contradiction, resolved to the payload or by an operator answer | :72, :222, :233, :265, :273, :324, :378, :501 vs :179, :523, :620, :626, :647 vs `D:\Stratex\.claude\hooks\context-gate.mjs:14-16`, :663, memory `feedback_db_checks_and_push_steps` vs :18-23 |

## RULEHOME-003 procedure (D-07 as amended)

The content of the ticket's steps; the ticket keeps the pointers, the order and the checks.

- **Harvest layout** - `dev/backlogs/active/RULEHOME/records/silerax-harvest/`: `COO_SELF_ANALYSIS.md`
  (the copied file), `ledger-rows.md` (the harvested ledger rows), `memory/` (the incident memory
  files), `diet.md` (step 4). Every harvested PnP idea - a `pnp-candidate` row, a "For PnP" part of
  a self-analysis entry - is a row of `ledger-rows.md` with ONE value in its `disposition` column:
  `roadmap: <area>` (a line on that entry of `dev/backlogs/ROADMAP.md`), `done: <pointer>`, or
  `dropped: <why>`. The harvest commit here (its dialog) closes step 2.
- **Removal there** - only after the harvest commit; the marker line left in the ledger in place of
  the harvested rows is `harvested by PromptAndPray RULEHOME through <date> <hash>, landed <this
  repository's harvest commit hash>`; the `## Events` rows of archived records stay (a closed
  ticket's history).
- **`diet.md`** - three tables. `## Conflicts` `| conflict | answer |`: one row per conflict the
  ticket's step 4 lists, the operator's answer from the ONE dialog, written before any diet edit.
  `## Rules` `| rule | old pointer | verdict | new home | decided by |` - decided by a D-NN, a payload
  pointer or a `## Conflicts` answer. `## Memory` `| file | verdict |`: one row per Silerax memory
  file, verdict `state` / `user` / `reference` / `rule -> <home>` / `deleted`.
- **Diet homes** - COO-only rules -> `.claude/aiwf-native/ORCHESTRATOR.md` project additions; Writer
  rules -> `.claude/agents/writer.md` project additions; state and procedures to their own files
  (RESEARCH § S2 Misplaced); retired rules deleted; every contradiction resolved to the payload or by
  a `## Conflicts` answer; memory keeps state, user and reference only.
- **Silerax commits** - the Silerax COO's docs commit(s) of the removal and the diet through its dialog; the
  code-class item (the two hooks' cited titles, `fable-auditor.md`'s dead pointer) through Silerax's
  Writer, its own review route and commit dialog (`D:\Stratex\AGENTS.md:34-38`).

## RULEHOME-002 spikes (D-04, D-05 (a), (b), (d))

A `claude` session started to observe a gate live is the operator's (overrides § Hard rules
:35-36): the operator starts it, the COO drives the probes, the results go into
`records/RULEHOME-002.md` with the command and its output.

- **(a) the working directory, D-04.** Claude Code 2.1.316, `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1`
  in the session's environment. The documentation names the variable for the MAIN SESSION only (no
  subagent), and no existing migration op writes a settings `env` block (RESEARCH § S4 VERIFIED) -
  so D-04 resolves to "the guard denies the prefix" with near certainty; the spike stays and records
  it. In the main session and in a `writer` subagent: one call `cd
  scripts` (Bash) and `Set-Location scripts` (PowerShell tool), the next call `pwd` /
  `Get-Location`. Pass = the second call prints the project root on both tools in both actors.
  Pass AND an existing migration op can carry it -> the variable ships; pass with no carrier -> the
  guard denies the prefix and the result becomes a ROADMAP line; fail -> the guard denies the
  prefix (D-04).
- **(b) path-scoped rules in a subagent, D-05 (b).** A probe `.claude/rules/rulehome-probe.md`
  with a `paths:` glob and a distinctive instruction, an `InstructionsLoaded` hook in the
  self-install layer logging `agent_type` and the file to a log outside the repository; a `writer`
  subagent reads a matching file. Pass = the log names the probe file with `agent_type` `writer`.
  Data for 003 only; nothing ships on it. The probe files are deleted after (the delete dialog);
  where auto mode refuses the settings write, the operator adds the hook from the COO's exact lines.
- **(c) a missing interpreter under `onFailure: "block"`, D-05 (d).** A scratch copy of the plugin
  outside the repository whose Gate 4 entry in `hooks/hooks.json` names an interpreter that does
  not exist and carries `onFailure: "block"`; the operator starts a session with `--plugin-dir`
  pointing at that copy; the COO issues one harmless shell call. Pass = the call is blocked; the
  harness message is recorded verbatim with the command, the Claude Code version and the date. The
  scratch copy is deleted after (the delete dialog). `docs/LOOP.md` § Enforcement then names the
  honest limit (worklist row no-shell).

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| suspended by the operator 2026-10-31 | suspended by the operator 2026-10-31 |

Numbers are suspended for this plan (D-11, operator 2026-10-31: „отменям записванто на числата
временно"). For the record, the parts nobody suspended printing: readiness pass 1 (Codex gpt-6-sol
xhigh, cold) 192,892 tokens - source `round header` (`readiness/RULEHOME/round-1.md`); the scan and
planner agents' tokens were reported by their notifications and are not summed here - `suspended`.

## Roadmap entry

- Goal: a rule the loop depends on is carried by the artifact the role fills or reads at the moment it acts (a brief or record skeleton, the skill step, the role's own file) or by a hook, the payload holds no contradiction a role can trip on, and the first consumer (Silerax) keeps only product truth and true project rules in its overrides, none in memory
- Why: „Основното което ме притеснява е че някои правила не се спазват, причините са ли двусмислия между воркфлоу и локални правила, или голям обем на локалните, правила, или просто цялата доктрина има неща които не са си на мястото" (operator 2026-10-31)
