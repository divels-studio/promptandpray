# AUDR - decisions

Source of the content: the operator's decision of 2026-11-23, `dev/changes/opus-experiment-2026-11-23.md` § 9 („приемам
записвай всичко"; part 1's cost: „ако се хване при изпълнение съм ок, за това е и одитора след това"; part 4: „без
овъринжинеринг и без досадни въпроси към мен от агентите"). ROADMAP § AUDITRULE line (11). The rule TEXTS below (D-03 .. D-08)
are shown to the operator in Bulgarian and enter the tree in English only on his approval (`ORCHESTRATOR.md` guard (g)) -
APPROVED 2026-11-24 in a dialog, the texts as they stand below after the both-ways check (`readiness/AUDR/both-ways-check.md`):
"1. Одобрявам всичките". These texts are the Writer's to copy, never to reword.

## The three questions (answered from the research)

- Real inputs: the recorded cases of § 9's both-ways check - `dev/changes/test-cost-research-2026-11-22.md` (the 12 "record
  only" code blockers, the 15 code defects), Silerax readiness rounds PRCCAA (`D:\Stratex\dev\backlogs\readiness\PRCCAA\`), PRCI
  round 1, and the Fable plan PRCCA (`D:\RCCA_TMP\readiness\PRCCA\`); the consumer's own product-stage section (RESEARCH § 4).
- What must stay: the floor (RESEARCH 2.4); the dual that keeps a failing, skipped or narrowed test and an unrun required
  verify command blockers (RESEARCH 2.2); the red-proof rule (RESEARCH 2.3); the readiness effort and pass count; every money,
  access, RLS and tenancy check (§ 9 "Not in the release").
- What retires: the "fail / land wrong / leave a decision open" test of a readiness BLOCKER (RESEARCH 2.1); the planner's order
  to move procedures into the index (RESEARCH 2.7); the temporary context-size measurements of `/pnp:plan` and of the record
  with the question to the operator (RESEARCH 2.11, 2.12); the consumer's `plan.md` pointer sentence to its product-stage
  section, and its `review.md` pointer narrowed to QA, both named on the release's `Retires local rules:` line (D-08).

## Decisions

- **D-01** One release, one ticket: the five parts, the migration, the manifest entry and the version bump ship together as
  AUDR-001 - one shippable piece with one code commit (class 16); the operator decided one release (§ 9). Route R2: the Writer
  writes every payload file; the COO writes the `CHANGELOG.md` block and the `README.md` version line as its prose, as in
  0.3.22 (`064c862`). plan: AUDR
- **D-02** The ticket's one code audit (Codex, `review.code` row) is also the opinion pass over the new contract text: its
  brief adds one question - where the new blocker text, read against the case list of D-09, would still let a no-loss finding
  block or let a loss through as a note. Operator's dialog answer 2026-11-24: "1. Един общ одит (препоръка)". No separate
  opinion pass. plan: AUDR
- **D-03** PART 1 - THE BLOCKER NAMES A LOSS. A new section of `review.md`, `## A blocker names a loss`, placed after § The
  project's test policy and the auditor, ONE copy for both audits; the plan-readiness contract (§ Plan readiness), the code
  verdict (§ Fail aggregation's "material blocker", § Verdict) point at it; the readiness brief carries its text because the
  readiness auditor is not handed `review.md`; `skills/review/SKILL.md`'s plan-mode one-liner becomes a pointer. The text:

  > At both audits - plan readiness and code review - a BLOCKER names what is lost if the work runs exactly as written, with
  > its evidence (`file:line`, opened). The losses: stored data or money wrong; an access, tenancy or permission hole; a
  > migration that fails, cannot be applied, or blocks live traffic while it waits for or holds its lock; a race or a lock
  > order that loses, duplicates or deadlocks a write; something the user sees wrong or cannot do; a decision left to the
  > Writer; a proof that does not test the ticket's own product property - its assertion stays green when the property is
  > broken, or it probes another object than the one the ticket changes. The brief's risk threshold picks which of them block.
  >
  > A finding about how the plan or the diff is worded, ordered, proven, evidenced or recorded names no loss: it is a NOTE (an
  > INFO row at readiness). So is a command that cannot run as written, a missing grep or count, a procedure restated or
  > missing, the form of a table or a row, and the gate that collects a proof's result - which specs run together, the
  > baseline, what a comparator requires, which artifacts QA gets. A note opens no revision and no pass: at readiness the live planner lands it beside a
  > revision, or alone without it counting as one, or the COO drops it; at the code pass it is listed in the record and settled
  > at the close (§ Test findings on confirmed code). The cost is accepted: a wrong command is caught when the ticket runs, with
  > the code audit behind it.
  >
  > **Its suppression dual:** a finding of form whose consequence IS a loss - a step order that fails a migration, a pointer
  > that sends the Writer to the wrong file, a production reader the change breaks - is a blocker, named by that loss; a test
  > the change breaks is a note at readiness, because it fails at the run. Nothing here lowers the floor (§ The project's test
  > policy and the auditor) or the dual of § Test findings on confirmed code: at the code pass, a test that failed, a test
  > skipped or narrowed to get green, and a VERIFY row or project verify command that was not run stay blockers; a missing red
  > run is not one (§ Test quality), whatever the ticket or the brief demands.

  The readiness brief's test line becomes: "The test for a row: executed exactly as written, what does the product, its data
  or its user lose - or what must the Writer decide alone? A named loss -> BLOCKER. None -> INFO." Its INFO examples gain: a
  procedure restated or missing in the plan; an acceptance command that cannot run as written; a closing-grep set missing where
  no consumer is missed; read / lock / write rows missing for a write whose order, lock and statements do not change; the form
  of a table, a row or a record. The triage gains one disposition, `note` - a BLOCKER row that names no loss, landed or dropped
  like INFO, with no revision counted (`plan.md` § Plan readiness review, `/pnp:plan` Step 6). plan: AUDR
- **D-04** PART 2 - THE PLAN DOES NOT RESTATE THE PROCEDURE. In `templates/briefs/planner.md` the acceptance rule becomes:

  > A ticket names what is its own: its test files and the new cases in them, whether it needs a reset (a database, a fixture,
  > an environment) and why, and the acceptance commands of its own properties, each with the output that would mean
  > "broken". Who runs which check, in what order and against which baseline is the project's test policy: cite it by one line
  > (the TEST POLICY slot), never restate it in a ticket or in the index.

  and "procedures and tables move to the index" becomes "a procedure becomes the cite of the policy that holds it". The
  planner brief gains the TEST POLICY slot (same text as the readiness brief's). At readiness, classes 8 and 11 and check 5 read
  only what the plan itself introduces; the project's cited procedure is not re-audited (`docs/READINESS_CLASSES.md` rows 8 and
  11, `plan.md` check 5, the readiness brief's questions). The 0.3.11 closing-grep rule is settled with it: the auditor runs the
  index's grep and compares the count; a set missing or a count off is INFO unless a production reader the change breaks is
  missed - then a BLOCKER of class 1, named by its loss (D-03's dual). plan: AUDR
- **D-05** PART 3 - PLAN-FORM DUTIES SCALE WITH THE CHANGE. Read / lock / write rows are owed for a function whose write order,
  lock or statement set the plan changes; a write that only carries one more column or value through existing statements owes
  one sentence naming those statements (`templates/briefs/research.md` transactional read, the readiness brief's question,
  class 15's row). Closing-grep sets are owed for every symbol whose definition the plan changes - renamed, removed, re-shaped,
  its meaning changed; a symbol the plan only adds owes none (the planner brief's CLOSING GREPS slot, `/pnp:plan` Step 4).
  plan: AUDR
- **D-06** PART 4 - MEASUREMENT, two fixed-form rows, both starting with the cell `pnp-measure`, so `\| pnp-measure \|` over
  the plans directory collects them; the COO fills them from figures it already holds; an unknown figure is `-`, never asked.

  > Plan row - written into the index's `## Measurements` at the landing, replacing today's table:
  > `| pnp-measure | plan | <ABBR> | planned by: COO <model> <effort or -> / planner <model> <effort> | readiness passes <n> | revisions <n> | pass 1: loss named <n> / no loss named <n> / rejected <n> | auditor tokens <as the round headers print them> | research and planner agents <tokens as their completion reports print them> |`
  >
  > Ticket row - written into the record's `## Measurements` at the close, replacing today's two tables:
  > `| pnp-measure | ticket | <REF> | code pass: code defect <n> / test defect <n> / record or form only <n> - or no auditor | correction rounds <n> | effort: test Writers / production Writers / fact-check <figures or -> | defects after the close <n> | plan wrong at execution <n> |`
  > Under it, one sentence per "plan wrong at execution": where the ticket as written could not run or was wrong, and what it
  > cost. A defect after the close is an Events row when the operator reports it; nobody asks him.

  Out: the start and approval context numbers of `/pnp:plan` Steps 1 and 6 with the question to the operator, the record's
  "COO session at close" column, the two *Temporary* notes - § 9 keeps every figure only the operator can read off a screen out.
  The pass-1 kinds come from the round file: a BLOCKER row disposed `note` (D-03) counts as "no loss named". plan: AUDR
- **D-07** PART 5 - PRODUCT STAGE. The overrides seed `templates/PROJECT_OVERRIDES.md.tmpl` gains a section beside § Test
  policy:

  > ## Product stage
  > Changed only by the operator. Where the product is: <fill in>. Not asked at this stage - never a blocker, never planned
  > for: <fill in, or none>. Mandatory at this stage - nothing here is loosened: <fill in, or none>.

  `review.md` § The project's test policy and the auditor gains one bullet: "**The project's product stage** - its overrides
  document's § Product stage, named on the brief's `PRODUCT STAGE:` line - says what this stage does not ask for and what stays
  mandatory. A finding about something it lists as not asked is a note, never a blocker; what it lists as mandatory is not
  loosened; it never lowers the floor." with the dual "where the line reads `none`, the pass is judged without it". The slot
  `PRODUCT STAGE: <the overrides document's § Product stage - or none>` is added to the readiness brief, the code-review
  brief of `skills/review/SKILL.md` and the planner brief (the planner plans nothing the stage does not ask for). QA's brief is
  not changed - § 9 names the planner and the two audits. plan: AUDR
- **D-08** Release mechanics: version 0.3.25; migration `0050_audit-loss` re-renders `doctrine/review.md`, `doctrine/plan.md`
  and `doctrine/ticket.md` (each project additions block carried) and, only where it is recorded, `.claude/agents/reviewer.md`
  from `templates/agents/reviewer.md.tmpl` (the `ifRecorded` op of migration 0046 - readiness round 1, B1; round 2, B11), and
  carries one `note` that tells an existing project to write its own § Product stage when it wants one and that a
  Claude-hosted Reviewer whose file the update did not re-render is re-rendered by `/pnp:roles` (round 2, B13); the manifest entry; the bump in `.claude-plugin/plugin.json`; the
  `CHANGELOG.md` block whose `Retires local rules:` line names the consumer's `plan.md` product-stage pointer sentence as
  retired and its `review.md` pointer as narrowed to QA - the new slot reaches the readiness and code audits only, and that
  pointer sits under a verdict section QA reads too (readiness round 1, B6; operator's dialog answer 2026-11-24: "1. Стеснен,
  запазен за QA (препоръка)") - the names read from the consumer's stage files at the time of writing; the `README.md`
  version line. Self-install by `/pnp:update
  --apply` after the commit. plan: AUDR
- **D-09** The both-ways check of D-03's text (§ 9) runs during this planning, before the operator approves the texts: one
  read-only agent on the session model applies the text to every recorded case and reports which case falls on the wrong side.
  Must come out as notes: the 12 "record only" code blockers of `dev/changes/test-cost-research-2026-11-22.md`, the procedure and
  form blockers of PRCCA and PRCCAA. Must stay blockers: the 15 code defects of the same file; PRCCA B1, B2, B5, B8; PRCCAA B7,
  B12, B14; PRCI round 1 B1, B3, B4. A wrong side is fixed in the text before it is shown. Its result is kept in
  `readiness/AUDR/both-ways-check.md`. plan: AUDR

## Deferred

- QA's brief gets no PRODUCT STAGE line - back when a consumer's QA pass fails on something its stage does not ask for.
- The evaluation of the measurement rows after the operator's four Silerax phases - an arbiter session, not payload
  (§ 9 part 4).
- The planner's "a test is an enumerated matrix" - decided on the rows of D-06 (ROADMAP § AUDITRULE line (5) step 6).
- This repository's own § Product stage in `dev/PROJECT_OVERRIDES.md` - back when the operator asks for one.
- `dev/PROJECT_OVERRIDES.md` § Environment "COO context source" says `/pnp:plan` and the record read it - corrected by the COO
  (R1, dev/) at AUDR-001's close.

## Open Questions

None.
