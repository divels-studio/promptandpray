# AUDR-001 [R2] - the five parts, migration 0050, manifest entry and bump to 0.3.25

Implements: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08.
COO: Opus - because all four no.
Escalation: none - the ticket executes the operator's own decisions of 2026-11-23/24 (no plan-recorded decision is reversed by the ticket), writes no access, tenancy or security-definer surface (a payload migration is not one), stays inside its own diff, and no two roles disagree in writing.
Branch: `main`. Depends on: the plan landed (`dev/` only). Scope guard: `HEAD <hash>` the dispatch brief names (HEAD at the dispatch, after the landing commit). `E2E: no`.
Amended at the close (code audit pass 1, correction round 1, on the operator's dialog answers 2026-11-24): five sites outside W01-W29 - C1 the TEST POLICY `none` dual in `templates/doctrine/review.md.tmpl`, C2 the opening of `templates/doctrine/ticket.md.tmpl` § Proof-surface feasibility, C3 the triage dual in `templates/doctrine/plan.md.tmpl`, C4 readiness class 16 in `docs/READINESS_CLASSES.md`, `templates/briefs/readiness-codex.md` and `templates/doctrine/plan.md.tmpl`, C5 the 0050 note's `/pnp:roles` line and its sentence on C2-C4 (`records/AUDR-001.md`).

## Outcome

Every rule text D-03 .. D-07 approve stands at its home, copied verbatim from `DECISIONS.md` (blockquote markers
dropped, line breaks the Writer's, no word changed); the old sentences those texts retire are gone (Acceptance); the
release is cut - migration `0050_audit-loss`, its manifest entry, version 0.3.25 (D-08). Who decides what (D-03's
"ONE copy for both audits"): `review.md` § A blocker names a loss is the one home; the readiness brief carries its text
because the readiness auditor is not handed `review.md`; every other site points at it.

## Scope

Anchors at HEAD `3c13a90`, re-read at the guard HEAD; an anchor that no longer matches is a STOP (Stop condition).
`DEC` = `dev/backlogs/active/AUDR/DECISIONS.md` after the landing (line numbers as in the draft). "Copy" = verbatim
from the DEC lines named; "pointer" = the literal sentence given here. Each marker sits on ONE line of the file (the
Writer keeps it unbroken when wrapping).

| row | file:line - home | what lands | marker (count in that file) |
|---|---|---|---|
| W01 | `templates/doctrine/review.md.tmpl:70-72` - a new section `## A blocker names a loss` after § The project's test policy and the auditor (its dual ends `:70`), before `## Given per brief` (`:72`) | D-03: copy DEC:38-58 | `## A blocker names a loss` (1); `At both audits - plan readiness and code review` (1); `consequence IS a loss` (1); `whatever the ticket or the brief demands` (1) |
| W02 | `templates/doctrine/review.md.tmpl:65-70` - a bullet after the floor bullet (`:65-67`); the dual appended to the suppression dual (`:69-70`) | D-07: copy the bullet DEC:106-109 ("**The project's product stage** ... it never lowers the floor."); copy the dual DEC:109 ("where the line reads `none`, the pass is judged without it") as one sentence after `:70` | `PRODUCT STAGE:` (1); `the pass is judged without it` (1) |
| W03 | `templates/doctrine/review.md.tmpl:41-46` - § Plan readiness, the blocker contract | D-03: the sentence "A BLOCKER is a required property the plan lacks plus the evidence (`file:line`, opened)." (`:41-42`) and the sentence "A finding whose fix changes no property ... carries the INFO examples." (`:44-46`) are replaced by the pointer "What a BLOCKER is and what is a NOTE - an INFO row here - is § A blocker names a loss; the shipped readiness brief carries that text and its INFO examples." The rest of `:42-52` stays | S1: 0 in this file |
| W04 | `templates/doctrine/review.md.tmpl:283-284` § Fail aggregation; `:306` § Verdict | D-03: "A material blocker is any real product/runtime/contract/proof/i18n/UX issue that by itself prevents an honest `pass`." becomes the pointer "A material blocker is, for the Reviewer, one that names a loss (§ A blocker names a loss) at or above the brief's risk threshold; for QA, any real product/runtime/contract/proof/i18n/UX issue that by itself prevents an honest `pass`." (QA stays as it is - D-07, § 9 names the two audits); the `fail` line `:306` gains "(for the Reviewer, § A blocker names a loss)" after "a material blocker" | `real product/runtime/contract/proof/i18n/UX issue` (1); `for QA, any real product` (1); `A blocker names a loss` (4 lines: W01 heading, W03, W04 x2) |
| W05 | `templates/briefs/readiness-codex.md:36-52` - THE BLOCKER CONTRACT | D-03: `:36`'s first sentence ("A BLOCKER = a required property ... opened by you).") is replaced by the copy of DEC:38-58; `:37-39` stay. `:41-43` become "Wording, formatting and `file:line` precision are INFO, never BLOCKER." + the copy of the test line DEC:60-61 + "INFO examples, rows that belong under I<n> whatever their count:". The six examples `:45-50` stay; the five of DEC:61-64 are appended as five bullets. `:51` stays. `:52` ("An I<n> row costs the plan nothing ...") is removed: the copied "A note opens no revision and no pass: ..." sentence carries it (one copy, D-03) | `At both audits - plan readiness and code review` (1); `consequence IS a loss` (1); `whatever the ticket or the brief demands` (1); `A named loss -> BLOCKER` (1); `the form of a table, a row or a record` (1); S1: 0 in this file |
| W06 | `templates/briefs/readiness-codex.md:12-17` - the questions | D-04: `:13-15` "verified against the index's `## Closing greps` ... being a finding" becomes the copy of DEC:76-78 ("the auditor runs the index's grep and compares the count; ... named by its loss"); after `:17` one sentence: "Classes 8 and 11 and check 5 read only what the plan itself introduces; the project's cited procedure is not re-audited." (DEC:74-76). D-05: `:15-17` "for every function the plan changes that holds a transaction, a lock or more than one write, does RESEARCH.md carry its read / lock / write rows" becomes the pointer question (DEC:79-81 as a question) "does RESEARCH.md carry read / lock / write rows for every function whose write order, lock or statement set the plan changes, and one sentence naming the statements for a write that only carries one more column or value through existing statements"; its parenthesis "(a later write in the same transaction that nobody opened is a finding)" stays | `a count off is INFO` (1); `plan itself introduces` (1); `write order, lock or statement set` (1) |
| W07 | `templates/briefs/readiness-codex.md:34` - after the TEST POLICY slot's block (`:29-34`) | D-07: the slot line, copy DEC:110 - `PRODUCT STAGE: <the overrides document's § Product stage - or none>`; under it, as the slot's explanation the way `:31-34` explain TEST POLICY, the copy of the D-07 bullet from its bold label on, DEC:106-109 ("**The project's product stage** - its overrides document's § Product stage, named on the brief's `PRODUCT STAGE:` line - says what this stage does not ask for and what stays mandatory. A finding about something it lists as not asked is a note, never a blocker; what it lists as mandatory is not loosened; it never lowers the floor.") and of its dual, DEC:109 ("where the line reads `none`, the pass is judged without it") - copied, not reworded (the readiness auditor is not handed `review.md`) | `PRODUCT STAGE:` (2: the slot line and the copied bullet); `**The project's product stage**` (1); `is a note, never a blocker` (1); `the pass is judged without it` (1) |
| W08 | `skills/review/SKILL.md:195` - after the TEST POLICY slot (`:190-195`), before `RISK THRESHOLD:` (`:197`) | D-07: the same slot line, copy DEC:110 | `PRODUCT STAGE:` (1) |
| W09 | `skills/review/SKILL.md:332-333` - plan-readiness mode, Output | D-03: "A BLOCKER names a required property the plan lacks and its evidence; INFO never causes a revision." becomes the pointer "A BLOCKER names a loss - the stage file's "A blocker names a loss", carried whole by the readiness brief; INFO never causes a revision." | S1: 0 in this file |
| W10 | `skills/review/SKILL.md:343` - the round file's dispositions | D-03 (DEC:64-65; readiness round 2, B1): the list gains "/ `note: land` / `note: drop` (a BLOCKER row that names no loss, landed or dropped like INFO, with no revision counted; a notes-only handoff to the live planner is no counted revision)" | `with no revision counted` (1); `a notes-only handoff` (1) |
| W11 | `skills/plan/SKILL.md:249-250` - Step 6 Triage, the dispositions | D-03: as W10 | `with no revision counted` (1); `a notes-only handoff` (1) |
| W12 | `templates/doctrine/plan.md.tmpl:111-112` - Triage and the round file | D-03: "fixed / rejected with a refutation / deferred / asked" gains the W10 text - "/ `note: land` / `note: drop` (a BLOCKER row that names no loss, landed or dropped like INFO, with no revision counted; a notes-only handoff to the live planner is no counted revision)" | `with no revision counted` (1); `a notes-only handoff` (1) |
| W13 | `templates/doctrine/plan.md.tmpl:158-159` - check 5 | D-04 (DEC:74-76): check 5 gains "- read only over what the plan itself introduces; the project's cited procedure is not re-audited" | `plan itself introduces` (1) |
| W14 | `docs/READINESS_CLASSES.md:27` (class 8), `:30` (class 11), `:34` (class 15) - the question cells | D-04: rows 8 and 11 gain "Read only what the plan itself introduces; the project's cited procedure is not re-audited." D-05: row 15 gains the copy of DEC:79-81 ("Read / lock / write rows are owed for a function whose write order, lock or statement set the plan changes; a write that only carries one more column or value through existing statements owes one sentence naming those statements.") | `plan itself introduces` (2); `write order, lock or statement set` (1) |
| W15 | `templates/briefs/research.md:10-14` - the transactional read | D-05: "a function the goal changes that holds a transaction, a lock or more than one write is read whole" becomes "a function whose write order, lock or statement set the goal changes is read whole"; the parenthesis `:14` becomes "(a write that only carries one more column or value through existing statements owes one sentence naming those statements; any other function is a pointer read, as above)" - its first clause the copy of DEC:80-81 | `write order, lock or statement set` (1); `transaction, a lock` (0) |
| W16 | `templates/briefs/planner.md:14-16` - the CLOSING GREPS slot | D-05: the slot's "every symbol the plan changes" becomes the copy of DEC:81-83 ("every symbol whose definition the plan changes - renamed, removed, re-shaped, its meaning changed; a symbol the plan only adds owes none") | `a symbol the plan only adds owes none` (1) |
| W17 | `templates/briefs/planner.md:20-21` - after the VERIFY COMMANDS slot (`:17-20`), before the revision slot (`:21`) | D-04: the TEST POLICY slot - `templates/briefs/readiness-codex.md:29-30` verbatim. D-07: then the slot line DEC:110 and the sentence "The planner plans nothing the stage does not ask for." (DEC:111) | `^TEST POLICY:` (1); `PRODUCT STAGE:` (1) |
| W18 | `templates/briefs/planner.md:60-66` - the worklist and acceptance rules | D-04: "Acceptance is literal commands, each with the output that would mean "broken";" (`:61-62`) becomes the copy of DEC:68-71, the red-then-green clause after it stays; "procedures and tables move to the index" (`:64-65`) becomes "a procedure becomes the cite of the policy that holds it" (DEC:73) | `never restate it in a ticket or in the index` (1); `cite of the policy that holds it` (1); `Acceptance is literal` (0) |
| W19 | `skills/plan/SKILL.md:161-163` - Step 4, a new paragraph after the TICKET COUNT paragraph (`:157-161`), before `:163` | D-05: "Fill the brief's `CLOSING GREPS`:" + the copy of DEC:81-83. (Step 4 carries no closing-grep sentence today, `:149-166`) | `a symbol the plan only adds owes none` (1) |
| W20 | `skills/plan/SKILL.md:69-74`; `:271-273`; `:275-282` | D-06 (DEC:96-98, "Out"): the paragraph **The start number.** `:69-74` is removed whole; in **Approval.** the sentences "Take the approval number ... asks per plan." `:271-273` are removed, "Wait for the approval word." stays; **Measurements - on the approval.** `:275-282` becomes "Write into the index `<plansDir>/drafts/<ABBR>/PLAN_<ABBR>.md` a section `## Measurements` with one row:" + the copy of the plan row DEC:89 + the copy of DEC:86's fill rule ("the COO fills them from figures it already holds; an unknown figure is `-`, never asked") + the copy of DEC:98 ("The pass-1 kinds come from the round file: ... counts as "no loss named".") | `\| pnp-measure \| plan \|` (1); S3 terms other than `## Measurements`: 0 |
| W21 | `templates/briefs/record.md:68-90` - `## Measurements` | D-06: the heading `:68` stays; `:70-83` (both tables and the first table's note) become the copy of the ticket row DEC:92, the copy of DEC:93-94 under it, and DEC:86's fill rule as the skeleton's `<...>` note. The counting notes of `:84-90` stay for the carried columns: the kinds "counted from the verdicts as returned" (`:84-86`), the effort figures "copied from the usage each agent reported, never estimated" (`:86-87`), the after-close count "`0` at the close, raised when one arrives", each defect an Events row (`:82`, `:87-89`); the note gains one sentence: "Notes are not counted; a blocker carried to a later pass counts once." (readiness round 1, B4, B5) | `\| pnp-measure \| ticket \|` (1); `## Measurements` (1); `COO session at close` (0); `counted from the verdicts as returned` (1); `never estimated` (1); `raised when one arrives` (1); `a blocker carried to a later pass counts once` (1) |
| W22 | `templates/PROJECT_OVERRIDES.md.tmpl:116-118` - a new section after `## Test policy` (`:100-116`), before `## Status and release artifacts` (`:118`) | D-07: copy DEC:102-104 | `^## Product stage$` (1) |
| W23 | `migrations/0050_audit-loss/ops.json`, `migrations/0050_audit-loss/NOTES.md` - new, on the shape of `migrations/0047_test-authority/` | D-08: `"targetPluginVersion": "0.3.25"`; three `rerender-managed-region` ops for `.claude/aiwf-native/doctrine/review.md`, `plan.md`, `ticket.md` (the shape of `migrations/0047_test-authority/ops.json:7-9`, `"region": null`); a fourth `rerender-managed-region` op for `.claude/agents/reviewer.md` from `templates/agents/reviewer.md.tmpl`, run only where the file is recorded - the exact shape of `migrations/0046_required-test-notes/ops.json:7` (`"region": null`, `"ifRecorded": true`; D-08 as amended, readiness round 1, B1; round 2, B11); one `note`, id `audit-loss-0-3-25`, whose text names the five parts one sentence each, names the three re-rendered files (additions blocks carried) and the Reviewer agent where one was rendered, and tells an existing project that the overrides seed now carries § Product stage, that its own overrides document is never rewritten, so it writes that section (the three lines of DEC:103-104) when it wants one, and that with none the `PRODUCT STAGE:` line reads `none`; and one sentence (round 2, B13): a Claude-hosted Reviewer whose `.claude/agents/reviewer.md` the update did not re-render (an unrecorded file is never overwritten) is re-rendered by `/pnp:roles`; `docRefs`: `CHANGELOG.md`, `skills/review/SKILL.md`, `skills/plan/SKILL.md`, `templates/briefs/readiness-codex.md`, `templates/briefs/planner.md`, `templates/briefs/record.md`, `templates/briefs/research.md`, `templates/PROJECT_OVERRIDES.md.tmpl`, `docs/READINESS_CLASSES.md` | ops: 4 `rerender-managed-region` (1 with `ifRecorded`), 1 `note` |
| W24 | `migrations/index.json:50` | D-08: a last entry `{ "id": "0050_audit-loss", "targetPluginVersion": "0.3.25" }` after `:50` (comma on `:50`) | `0050_audit-loss` (1) |
| W25 | `.claude-plugin/plugin.json:3` | D-08: `"version": "0.3.25"` | `"version": "0.3.25"` (1) |
| W26 | `templates/doctrine/ticket.md.tmpl:296-297` - the notes bullet | D-03: the sentence "**A note on a test over confirmed code opens no correction round** (`review.md` § Test findings on confirmed code)." becomes "**A note opens no correction round** - a note of `review.md` § A blocker names a loss and a note on a test over confirmed code (`review.md` § Test findings on confirmed code) alike." And `:302-303` "A note whose fix needs a production line is a correction round under the bullet above." becomes "A required note whose fix needs a production line is a correction round under the bullet above." (readiness round 1, B3). The rest of `:296-303` stays | `**A note opens no correction round**` (1); `A required note whose fix needs a production line` (1) |
| W27 | `templates/briefs/planner.md:21-22` - the revision slot | D-03 (readiness round 1, B1; round 2, B1): the whole slot `:21-22` becomes "<on a revision or a notes-only handoff: ROUND FILE: <plansDir>/readiness/<ABBR>/round-<N>.md - fix every row whose disposition is `fixed`, and land every row whose disposition is `note: land`; touch nothing else>" | `a notes-only handoff` (1); `land every row whose disposition is` (1) |
| W28 | `templates/briefs/readiness-codex.md:19-27` - the pass-2 block | D-03 (B1): after "For each pass-1 BLOCKER: CLOSED if ... OPEN with evidence if not" (`:23-24`), the sentence "A pass-1 BLOCKER disposed `note: land` or `note: drop` is marked NOTED, never OPEN, and is counted in neither CLOSED nor OPEN." | `is marked NOTED, never OPEN` (1) |
| W29 | `templates/agents/reviewer.md.tmpl:97-99` - plan readiness, pass 2 | D-03 (B1): "mark each pass-1 BLOCKER `CLOSED` or `OPEN`" gains "- a row disposed `note: land` or `note: drop` `NOTED`, outside both counts" | `outside both counts` (1) |

Not the Writer's (D-01, D-08): the `CHANGELOG.md` 0.3.25 block and `README.md:22`, the COO's prose, written at the
handoff into the same code commit. No line of `skills/qa/SKILL.md` changes (index § Scope, out).

## Acceptance

Host: PowerShell 7 (`pwsh`), from the repository root, at the handoff (working tree against the guard). The first
line binds the guard: `$guard = '<the dispatch HEAD hash>'`. A pattern with a pipe or a backtick is single-quoted; a
double quote inside an rg pattern is written `\x22`. The output after the dash means broken. A count is lines.

- `git status --porcelain` - a path outside `dev/` other than the Code Map's files (the new folder shows as one
  `?? migrations/0050_audit-loss/` line), `CHANGELOG.md` and `README.md`; any path under `.claude/` is broken.
- `git status --porcelain --untracked-files=all -- migrations` - a new file other than
  `migrations/0050_audit-loss/ops.json` and `migrations/0050_audit-loss/NOTES.md`.
- `git diff --name-only $guard -- skills/qa` - any line.
- S1: `rg -n 'required property|land wrong' docs skills templates scripts schema hooks examples` - any hit other than
  `scripts/setup/validate-config.mjs:194`.
- S2: `rg -c 'real product/runtime/contract/proof/i18n/UX issue' templates/doctrine/review.md.tmpl` - not 1;
  `rg -n 'for QA, any real product' templates/doctrine/review.md.tmpl` - not 1.
- `rg -c '\*\*A note opens no correction round\*\*' templates/doctrine/ticket.md.tmpl` - not 1;
  `rg -n 'A note on a test over confirmed code opens no correction round' templates` - any hit;
  `rg -c 'A required note whose fix needs a production line' templates/doctrine/ticket.md.tmpl` - not 1.
- B1: `rg -c 'land every row whose disposition is' templates/briefs/planner.md` - not 1;
  `rg -c 'a notes-only handoff' templates/briefs/planner.md skills/review/SKILL.md skills/plan/SKILL.md templates/doctrine/plan.md.tmpl`
  - not 1 per file; `rg -n 'row the COO marks to land' templates skills docs` - any hit;
  `rg -c 'is marked NOTED, never OPEN' templates/briefs/readiness-codex.md` - not 1;
  `rg -c 'outside both counts' templates/agents/reviewer.md.tmpl` - not 1.
- `rg -n '^## ' templates/doctrine/review.md.tmpl` - `## A blocker names a loss` missing, or not the next heading after
  `## The project's test policy and the auditor`.
- `rg -c 'At both audits - plan readiness and code review|consequence IS a loss|whatever the ticket or the brief demands' templates/doctrine/review.md.tmpl templates/briefs/readiness-codex.md`
  - a count other than 3 per file.
- `rg -c 'A named loss -> BLOCKER|the form of a table, a row or a record|a count off is INFO|is a note, never a blocker' templates/briefs/readiness-codex.md`
  - a count other than 4.
- `rg -c 'the pass is judged without it' templates/doctrine/review.md.tmpl templates/briefs/readiness-codex.md` - a
  count other than 1 per file.
- `rg -n 'An I<n> row costs the plan nothing' templates skills docs` - any hit.
- S6: `rg -n 'with no revision counted' skills templates docs` - a count other than 3, or a hit outside
  `skills/review/SKILL.md`, `skills/plan/SKILL.md`, `templates/doctrine/plan.md.tmpl`.
- S5 and D-04: `rg -n 'Acceptance is literal|procedures and tables move' templates skills docs` - any hit;
  `rg -n 'plan itself introduces' docs templates skills` - a count other than 4 (`docs/READINESS_CLASSES.md` 2,
  `templates/doctrine/plan.md.tmpl` 1, `templates/briefs/readiness-codex.md` 1).
- S7 and D-05: `rg -n 'transaction, a lock' templates docs skills` - any hit;
  `rg -n 'write order, lock or statement set' templates docs` - a count other than 3;
  `rg -n 'a symbol the plan only adds owes none' templates skills` - a count other than 2.
- S4 and D-07: `rg -n 'PRODUCT STAGE:' docs skills templates scripts schema hooks examples` - a count other than 5
  (`templates/briefs/readiness-codex.md` 2, `templates/doctrine/review.md.tmpl`, `templates/briefs/planner.md`,
  `skills/review/SKILL.md` one each); `rg -c '\*\*The project.s product stage\*\*' templates/doctrine/review.md.tmpl templates/briefs/readiness-codex.md`
  - not 1 per file; `rg -c '^TEST POLICY:' templates/briefs/planner.md` - not 1;
  `rg -n '^## ' templates/PROJECT_OVERRIDES.md.tmpl` - `## Product stage` missing or not between `## Test policy` and
  `## Status and release artifacts`.
- S3 and D-06: `rg -n 'COO session at close|context size|approval number|start number|ask the operator once|Temporary' docs skills templates scripts schema hooks examples`
  - any hit; `rg -c '\| pnp-measure \| plan \|' skills/plan/SKILL.md` - not 1;
  `rg -c '\| pnp-measure \| ticket \|' templates/briefs/record.md` - not 1;
  `rg -c '## Measurements' templates/briefs/record.md` - not 1;
  `rg -c 'counted from the verdicts as returned|never estimated|raised when one arrives|a blocker carried to a later pass counts once' templates/briefs/record.md`
  - not 4.
- D-08: `rg -c 'rerender-managed-region' migrations/0050_audit-loss/ops.json` - not 4;
  `rg -c '\x22op\x22: \x22note\x22' migrations/0050_audit-loss/ops.json` - not 1;
  `rg -c 'doctrine/review\.md\x22, \x22region\x22: null, \x22template\x22: \x22templates/doctrine/review\.md\.tmpl' migrations/0050_audit-loss/ops.json` - not 1;
  `rg -c 'doctrine/plan\.md\x22, \x22region\x22: null, \x22template\x22: \x22templates/doctrine/plan\.md\.tmpl' migrations/0050_audit-loss/ops.json` - not 1;
  `rg -c 'doctrine/ticket\.md\x22, \x22region\x22: null, \x22template\x22: \x22templates/doctrine/ticket\.md\.tmpl' migrations/0050_audit-loss/ops.json` - not 1;
  `rg -c '\x22file\x22: \x22\.claude/agents/reviewer\.md\x22, \x22region\x22: null, \x22template\x22: \x22templates/agents/reviewer\.md\.tmpl\x22, \x22ifRecorded\x22: true' migrations/0050_audit-loss/ops.json` - not 1 (the key order of `migrations/0046_required-test-notes/ops.json:7`; round 2, B12);
  `rg -c 'pnp:roles' migrations/0050_audit-loss/ops.json` - 0 (round 2, B13);
  `rg -n '0050_audit-loss' migrations/index.json` - not on the entry before the closing `]`;
  `rg -c '\x22version\x22: \x220.3.25\x22' .claude-plugin/plugin.json` - not 1.

No test is added: the diff is prose, a migration and a bump, and no suite asserts this wording (RESEARCH § 3). The
migration is proven by the VERIFY rows below; a red-then-green proof is owed only as `review.md` § Test quality says.

## Risk threshold

Block on: an approved text of D-03 .. D-07 reworded, cut or missing at a named site; an old sentence left beside its
replacement so two rules contradict; a site changed outside the worklist; a migration op, the manifest entry or the
version that does not match D-08; a Cyrillic character in the payload. Note only: line wrapping, the wording of the
pointer sentences given here, the order of bullets inside a list.

## Stop condition

Stop when W01 .. W29 stand and every Acceptance line is clean. STOP and ask the COO, before writing that row, when an
anchor does not match at the guard HEAD, when a text cannot be placed without rewording an approved one, or when a site
outside the worklist carries a sentence that would contradict the new text.

## Verify

Which rows this diff owes, once, and how: `dev/PROJECT_OVERRIDES.md` § Test policy ("VERIFY is proportional to the
change" - the templates / skills / docs row and the update engine / migrations row, their union) and
`dev/VERIFY_RUNBOOK.md`; the COO runs them at the handoff, Portion 1, in parallel with the diff read. Rows by their
names in `verify.commands`: `validate-payload`, `update-suite`, `selfcheck`; plus the provenance grep and the one
render dry-run on a scratch copy that the same section names. After the commit: the self-install
`/pnp:update --apply` with its embedded self-check (D-08). The Writer runs none of them.

## Code Map

| path | role |
|---|---|
| `templates/doctrine/review.md.tmpl` | W01-W04: the one home of "A blocker names a loss", the product-stage bullet, the readiness and code-verdict pointers |
| `templates/doctrine/plan.md.tmpl` | W12-W13: the `note` disposition, check 5 |
| `templates/doctrine/ticket.md.tmpl` | W26: a note opens no correction round, both kinds; a required note's production fix |
| `templates/agents/reviewer.md.tmpl` | W29: a pass-1 BLOCKER disposed `note` is NOTED on pass 2 |
| `templates/briefs/readiness-codex.md` | W05-W07: the carried blocker text, the questions, the PRODUCT STAGE slot |
| `templates/briefs/planner.md` | W16-W18: CLOSING GREPS scale, TEST POLICY and PRODUCT STAGE slots, the acceptance rule |
| `templates/briefs/research.md` | W15: the transactional read scales |
| `templates/briefs/record.md` | W21: the ticket `pnp-measure` row |
| `templates/PROJECT_OVERRIDES.md.tmpl` | W22: the § Product stage seed |
| `skills/review/SKILL.md` | W08-W10: the code-review PRODUCT STAGE slot, the plan-mode pointer, the `note` disposition |
| `skills/plan/SKILL.md` | W11, W19, W20: the `note` disposition, the closing-grep rule at Step 4, the plan `pnp-measure` row |
| `docs/READINESS_CLASSES.md` | W14: classes 8, 11, 15 |
| `migrations` | W23-W24: `0050_audit-loss/` and its manifest entry |
| `.claude-plugin/plugin.json` | W25: the version 0.3.25 |
