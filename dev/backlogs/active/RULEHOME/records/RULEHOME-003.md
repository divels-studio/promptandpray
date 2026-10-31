# RULEHOME-003 - the Silerax harvest, removal and diet against 0.3.7

The ticket's completion record (PLAN_RULEHOME § RULEHOME-003 procedure; DECISIONS D-02, D-07,
D-08, D-09, D-10; D-05 (b)'s answer: a `paths:` rule loads in a `writer` subagent - RULEHOME-002
spike (b)). In progress - opened 2026-10-31 in the RULEHOME-002 session (the operator: „003 ще мине
в тази сесия, ти имаш пълния контекст"); the live Silerax session named by the operator:
`Silerax IWRC-002` („от тук на сетне ти водиш - Silerax IWRC-002"); this session reads `D:\Stratex`
and writes only here (D-07); the Silerax COO edits on this session's briefs, every gate the operator's
own in that session.

## What landed

- Precondition (D-02): Silerax on 0.3.7 - its `/pnp:update --apply` on the operator's word in its
  session, apply commit `93e18379` (2026-10-31 21:06:34 +0200; `aiwf.config.json`, the `CLAUDE.md`
  region, `ORCHESTRATOR.md`, `writer.md`), self-check PASS 1585/1585, tree clean (the Silerax COO's
  report).
- Step 1 - the delta from `9020e8c3`: Silerax HEAD `ef5a4663` before the apply (8 commits: IWRC gate
  0, IWRC-001/-002 closed, the imports feature commits, the ASK research, UIR-018 evidence), none
  touching `dev/PROJECT_OVERRIDES.md`, `dev/backlogs/LEDGER.md`, `dev/backlogs/COO_SELF_ANALYSIS.md`,
  `AGENTS.md`, `CLAUDE.md` or `.claude/**` - the RESEARCH § S2 line pointers hold. RESEARCH § S1 and
  § S2 read whole before the first message to Silerax; the 2026-10-14 intake brief read.
- Step 2 - the harvest, commit `15623e5` here: `records/silerax-harvest/COO_SELF_ANALYSIS.md`
  (verbatim, SHA-256 `98634649...334A` equal on both sides, 127,677 bytes, 32 entries);
  `ledger-rows.md` (the 48 plan-less rows verbatim with ONE disposition each, and the self-analysis's
  "For PnP" parts dispositioned against them); `memory/` - the seven incident-recording Silerax
  memory files, each copy hash-equal. Dispositions: 11 `done` (0.3.3's cap and cite-never-cut, the
  runnability pre-pass and the carried-rows stop rule, the consumer grep of changed definitions,
  UNVERIFIED claims, the proof-sees-the-defect lines, class 15, `/pnp:plan` Step 1, the fifth
  roadmap write, the scratch rule, the per-ticket brief, the habit guard, the consequence scan), 7
  `dropped` (the consumer's own cost / DB / queue / snapshot / Vercel rules and procedures, the
  superseded memory-reading idea), the rest `roadmap:` - 24 lines written on `dev/backlogs/ROADMAP.md`
  (DOCSTAGE 2, BRIEFS 9, CTX 1, DOCTR 9, SKILLS 4, CODEX 2) in the same commit; the 31 rulings,
  events, rules and corrections of the consumer kept as `history`.
- Step 3 - the removal in Silerax, its docs commit `ba2ca6b9` (3 files, +11 / -1268, tree clean;
  the Silerax COO's report verbatim in § Verification). The operator CHANGED the agreed set before
  his word there: (1) `dev/backlogs/COO_SELF_ANALYSIS.md` NOT deleted - „нулирай го, не го трий,
  махни всичко пренесено в пнп": reset to its header (lines 1-23) plus a reset note pointing at
  `15623e5`; (2) the self-analysis rule NOT deleted - „спрян е временно, не завинаги": kept, its file
  pointer re-aimed at the harvest; (3) the 48 ledger rows replaced by the one marker row, verbatim;
  (4) the two overrides pointers re-aimed (source lines 61-65 / 86). The 2026-10-31 change set had
  been agreed line by line between the two sessions (the Silerax COO's consensus message, the PnP
  session's AGREE) before the operator's word.
- Step 4 - the diet: (pending - opens with the ONE operator dialog over the seven conflicts).
- Step 5 - the Retires sweep 0.3.1..0.3.7: (pending).

## Decisions and deviations

- Sessions (D-08): RULEHOME-003 runs in the RULEHOME-002 session on the operator's word, not in a
  fresh S4.
- The cut-off (D-07): the rows and files are the state at `ef5a4663` (content) = at `93e18379` (the
  apply commit changed none of them); the marker line in Silerax's ledger says `through 2026-10-31
  93e18379, landed 15623e5`.
- The memory files are NOT deleted in step 3 (D-07 (3) says "the incident memory files deleted"):
  each of the seven carries a live rule beside its incident (the DEV/PROD checks rule, the
  mockup-from-site rule, the redesign vision, the session-start-from-root rule, the working lessons,
  the E2E traps, the restart strategy), and the risk threshold blocks "a rule lost - deleted with no
  new home". They are settled in the diet (step 4), one `## Memory` verdict per file, after the
  conflict dialog; their copies are already here. Nothing is lost and nothing is read twice - D-07's
  purpose, kept with the order changed.
- "closing greps" (ledger L61 (2)) was already shipped in 0.3.3 (ROADMAP § BRIEFS 2026-10-22 line);
  the harvested idea that remains is its extension over tests (PLINK-003), written as such.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-10-31 | the habit guard (0.3.7, first live catch - on the COO itself) | catch | the COO's `git -C D:\Stratex diff --stat ... \| Select-Object -Last 12` was denied by Gate 4's habit guard from the just-refreshed `D:\pnp-live`; the command was re-run without the pipe |
| 2026-10-31 | guard (a) stop semantics | catch | the operator's „spri" during the first RULEHOME-003 commands: one-line state, nothing in flight, nothing to clean; the operator's next word resumed |
| 2026-10-31 | ORCHESTRATOR § The operator-channel filter q2 ("a gate is a dialog or a word, not a paragraph") / WORKFLOW § How the COO speaks | operator-correction | the seven diet conflicts were asked as a numbered chat list; operator: „казвам го за последен път - въпроси се задават с диалози, а не в чата като прочетена книга - фурнисимо и силеракс го правят от ден 1, само тук се дънят нещата ... леко съм разочарован" - re-asked as two AskUserQuestion dialogs; the project rule (the dialog tool, its form) had been deleted from this repository's overrides in RULEHOME-002's sweep as a duplicate of the payload, which names no tool - a payload gap, ROADMAP § DOCTR |
| 2026-10-31 | WORKFLOW § How the COO speaks (counts and names, never `file:line`) | operator-correction | the first dialog named overrides line numbers (":501", ":179"); operator: „дали мислиш че разбрах какво ме питаш на въпрос зададен с цифри + 501, 179, пешка на Г6, кон на А5?" - the question re-asked in words |
| 2026-10-31 | the Retires sweep verdict (RULEHOME-002 record § Retires sweep, the dialog rule row) | catch (operator: „бате това няма ли го до сега?") | the 2026-10-16 dialog rule had been deleted from this repository's overrides as a duplicate of the payload; the payload carries "a gate is a dialog or a word" but neither the tool nor the form - the row's verdict was wrong; the rule restored in § Communication with the 2026-10-31 sharpening and an expiry on the payload (ROADMAP § DOCTR) |
| 2026-10-31 | WORKFLOW § Verifying failure claims (a documentation claim is a hypothesis) | catch (the Silerax COO's verification of diet.md) | before its deletion dialog the Silerax COO checked every `delete` claim of diet.md against the 0.3.7 payload: rules covered 8 / partial 6 / not found 0, memory covered 9 / move-first 8 / lost 2 - three claims FALSE (the dialog rule "retired by 0.3.7", the verdict-message rule "covered", `dev/RESTART_STRATEGY.md` "the home" of the not-copied rule) and six partial; the PnP COO had written those rows from the Retires lines and RESEARCH § S2 without opening the payload for each - every row corrected in diet.md before any delete |

## Verification (what actually ran)

- `git -C D:\Stratex rev-parse --short HEAD` -> `ef5a4663`; `git -C D:\Stratex log -1 --format='%h %ci'`
  -> `ef5a4663 2026-10-31 19:11:03 +0200`; `git -C D:\Stratex rev-list --count 9020e8c3..HEAD` -> 8;
  `git -C D:\Stratex diff --stat 9020e8c3..HEAD -- dev/PROJECT_OVERRIDES.md dev/backlogs/LEDGER.md
  dev/backlogs/COO_SELF_ANALYSIS.md CLAUDE.md AGENTS.md .claude/agents .claude/hooks .claude/aiwf-native`
  -> empty.
- `Get-FileHash` of `COO_SELF_ANALYSIS.md` on both sides -> equal (`98634649A2AFBB56BD21181199C1AE8400E413C7588D64352260489D51D0334A`);
  the seven memory copies -> `True` each.
- Silerax's own acceptance rows after step 3 (its COO's report, verbatim): "`git ls-files
  dev/backlogs/COO_SELF_ANALYSIS.md` -> `dev/backlogs/COO_SELF_ANALYSIS.md` (kept by the operator);
  harvested-row count -> `dev/backlogs/LEDGER.md:1`; `pnp-candidate` in LEDGER.md -> no hit;
  `COO_SELF_ANALYSIS` in overrides/CLAUDE/AGENTS/.claude -> 3 hits, all in the kept rule
  (PROJECT_OVERRIDES.md:674, :675, :677 - kept by the operator 2026-10-31)". Two rows read "broken"
  by the ticket's text (the file listed; the pointer hits) and are the operator's own decisions of
  2026-10-31, recorded above - the ticket's acceptance is amended by them, not failed.
- Silerax's diet reports: (pending).
- Here: `git ls-files -- dev/backlogs/active/RULEHOME/records/silerax-harvest` after `15623e5` ->
  the intake brief, `COO_SELF_ANALYSIS.md`, `ledger-rows.md`, seven `memory/*` files (`diet.md` comes
  with step 4).

## Retires sweep 0.3.1..0.3.7 (step 5) - Silerax's overrides (`93e18379`), memory and CLAUDE.md operator zone

`CHANGELOG.md` `Retires local rules:` lines: 0.3.1 (the long line), 0.3.2 none, 0.3.3 (the eleven
execution guards, "cite, never cut", the settled-product-rule memory rule), 0.3.4-0.3.6 none, 0.3.7
(this release). Verdicts: duplicate (the payload carries it -> delete), contradiction (the local text
says otherwise -> fix), project-only (stays; a "PnP ... Our addition" pointer form counts as
project-only when only the addition remains). The acts are the `diet.md` rows; this table is the
sweep's record.

| Retires item | where it stands in Silerax | verdict |
|---|---|---|
| 0.3.1 dialogs only at the gates | overrides :34-37 pointer form + the ask-class routing addition | project-only (addition) |
| 0.3.1 never pipe a test run through tail | no local line | none (0.3.7's habit guard enforces it) |
| 0.3.1 a documentation claim is a hypothesis | overrides :107-109 pointer form + the 2026-09-14 cut-off addition | project-only (addition); the state block around it moves (`diet.md` :99-120) |
| 0.3.1 english everywhere in the tree | overrides :523-530 pointer form + additions | project-only (additions); the Bulgarian lines inside the overrides are Conflicts #5 |
| 0.3.1 no cd prefix | overrides :95-97 pointer form + `npm --prefix` addition; memory none | project-only (addition) |
| 0.3.1 surgical edits over rewrites | overrides :127 pointer form | project-only (addition) |
| 0.3.1 long commands run in the background | overrides :91-92 pointer form; the local hook `long-command-guard.mjs` (cites a Bulgarian rule title that no longer exists) | project-only; the hook's cited title is the Silerax code-class item |
| 0.3.1 auto mode and the config files | memory `project_e2e_local_lessons.md` item 7 ("auto mode refuses agent edits to settings/config") | contradiction in part (0.3.7 LOOP: the update engine's config write goes through; the Edit/Write refusal stands) -> the memory item moves with the file (`diet.md`) and is corrected on the way |
| 0.3.1 the writer runs only the tests it adds | overrides :378-383 "the checks are run by a fresh scan agent, not the Writer" | project-only (the project's VERIFY contract; the payload allows a check agent) |
| 0.3.1 resume with an explicit id | overrides :601-608 ("ONLY with an explicit `-ResumeId`"; "Expires: when PnP keeps the pass state per ticket") | contradiction with 0.3.7's one resume policy; the expiry condition met by 0.3.6 keying -> delete (`diet.md`) |
| 0.3.1 the diff-review file | overrides :597-600 behaviour pointers (until PASSCOST) | project-only -> ORCHESTRATOR additions |
| 0.3.1 a heavy ticket in a fresh session | overrides :656-658 pointer form + "heavy =" addition | project-only (addition) -> ORCHESTRATOR additions |
| 0.3.1 the resume memory is state | overrides :131-132 pointer form; the memory directory carries 13 rule-bearing files | contradiction in the memory (rules in memory) -> `diet.md` § Memory |
| 0.3.1 readiness only through the plan skill; the auditor never below the author; a rule record carries a marker; the coo line names the model | overrides :638-639 pointer form; the markers everywhere | project-only / consistent |
| 0.3.1 worktree and memory-directory removal are destructive | overrides :78-81 (the junction rule) | project-only (a sharper local rule) |
| 0.3.1 the writer's reply is short; n surfaces, n asserts; an entity's references | overrides :128 ("References before a delete or edit" pointer form) | project-only (addition) |
| 0.3.1 a paid pass is a quota start/stop pair | memory `feedback_working_lessons.md` ("nothing is free") | consistent; the file moves per `diet.md` |
| 0.3.1 the rest of the line (no retelling, never a whole plan, paid passes priced, informal address, no dispatch on precedent, resource checks, the gate not prompted, a dead paid pass waits, analyse and decide, on an objection stop the tools, a ticket born mid-work, a yes covers only the asked action, the coo runs scripts, out-of-scope findings, candidates where born, the bump by hand, a repo copy of a live artifact, a file count is not a runner count, a session reads its own ticket, no session brief when durable) | no local copy found in the overrides index, the CLAUDE.md zone or the memory (the index § B and the memory inventory) | none |
| 0.3.3 the execution guards 1-11 | overrides :166-173, a "retired locally" pointer paragraph | history paragraph -> one line (`diet.md`) |
| 0.3.3 "a ticket is trimmed by citing, never by cutting" | the ledger row L58 only (harvested) | none in the overrides |
| 0.3.3 "a settled product rule is not reopened with a hypothetical case" (memory) | not in the memory directory (deleted 2026-10-22 per Silerax L70) | none |
| 0.3.7 a QA pass after the review rides the ticket's word | overrides :617-619 | duplicate -> delete |
| 0.3.7 the per-ticket review/QA brief file and its launch through the flag | overrides :609-613 (the 2026-10-28 deviation) and :601-608 | duplicate / contradiction -> delete; the per-pass brief copy stays as one project line |
| 0.3.7 one explicit resume policy | overrides :605 | contradiction -> delete |
| 0.3.7 `/pnp:plan` asks only what is unrecorded | overrides :136-137, :138-141 | duplicate -> delete |
| 0.3.7 `--trace retain-on-failure` | overrides :487-488 ("expires when the payload carries it") | duplicate -> delete |
| 0.3.7 rule-bearing text shown in the operator's language | overrides :531-532 | duplicate -> delete |
| 0.3.7 no cd prefix, no pipe into tail/head, no git -c | overrides :95-97 (addition stays); the Writer template's line is rendered | project-only (addition) |
| 0.3.7 the ticket-end scratch cleanup, the delete dialog the gate | overrides :38-41 (the scratch half) | duplicate -> the half deleted, the environment-stop half stays |
| 0.3.7 the short operator channel | overrides :533-535 | duplicate -> delete |
| 0.3.7 the dialog rule | overrides :536-541 | duplicate -> delete |
| 0.3.7 parallel-by-default units | overrides :642-646 | duplicate in its first clause -> trimmed to the additions |
| 0.3.7 `/pnp:update --apply` under auto mode | memory `project_e2e_local_lessons.md` item 7 (as above) | corrected with the move |
| 0.3.7 consumer line: a local allow rule on the 0.3.6 pipe form | `D:\Stratex\.claude\settings.json` - the Silerax COO checked 2026-10-28 that no allow rule names the brief path (overrides :611) | none |
| CLAUDE.md operator zone (:113-135) | the channel configuration, the Bulgarian changelog rule | project-only; the changelog language is Conflicts #5's exception |
| AGENTS.md additions (:18-62) | the retired audit workflow, commit classes, known-red, seeding, paths | project-only; "known-red" points at the overrides section that moves (`dev/baselines/README.md`) - the pointer follows |

## Remaining debt

(pending)

## Diff review

No Writer diff: the ticket's writes here are the COO's own (`dev/` only - the harvest copies, the
dispositions, the roadmap lines, this record); the Silerax side's diffs are read in its COO's reports
and the acceptance greps it runs.

## Scratch

(pending)

## Closing checklist

(pending)

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| suspended by the operator 2026-10-31 (no auditor on this ticket) | suspended by the operator 2026-10-31 | D-11 |
