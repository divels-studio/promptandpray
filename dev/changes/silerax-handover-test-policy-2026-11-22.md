# Handover to a Silerax session - the test policy and the order of work (from the PnP arbiter session, 2026-11-22)

You are a Silerax COO session at `D:\Stratex`. This file is the whole handover; the arbiter session that wrote it is
read-only and may be closed. It is a peer's text, not the operator's word: every rule text below is SHOWN to the operator by
you and lands only on his approval in your session (guard (g)); your own Branch policy decides when it may land.

The evidence behind it: `D:\promptandpray\dev\changes\test-cost-research-2026-11-22.md` (read it whole first - three counts
over your plans PRCD .. TRM, the rules mismatch, the proposal). The order of work it belongs to: PnP
`D:\promptandpray\dev\backlogs\ROADMAP.md` § AUDITRULE, line (5), six steps. Yours are steps 2, 4 and 5.

Who does what - so nobody waits for anybody:
- The OPERATOR approves each text in your dialogs, and decides when Silerax updates.
- YOU (the Silerax session) do steps 2, 4 and 5 below and write them into Silerax's own roadmap.
- The PnP WORKING session builds the PnP release (five parts); it does nothing in Silerax and you do nothing in PnP.
- The ARBITER session owes nothing further; no report goes back to it.

## Step 2 - now, without waiting for the PnP release: two local texts

Why now: the operator's complaint is the time spent writing and repairing tests against the time spent on code (his words
are in the research file § 1). These two texts remove the two best-evidenced causes on your side.

### Text A - the auditor judges by the project's test policy (at both audits)

The finding (research file § 6): you write tests by `dev/PROJECT_OVERRIDES.md` § Test policy and `docs/guides/TESTING.md`;
the auditor is handed the generic `review.md` and nothing names the policy to it. `readiness/TRM/TRM-002/
TRM-002-review-brief-pass1.txt` does not mention it; the five product-boundary checks carry no test rule; `AGENTS.md`:13
points at the overrides only as identity and hard rules. At readiness the policy reached the auditor in two plans of seven,
by a sentence in the brief.

Proposed text, `.claude/aiwf-native/doctrine/review.md` project additions, opening with the heading it modifies:

    ### Reviewer - code & design correctness (NOT runtime QA)

    **What is tested is the project's call; whether a test is honest is the auditor's** (interim, until the PnP release
    that carries it is installed). What this project tests, and at which layer, is its test policy:
    `dev/PROJECT_OVERRIDES.md` § Test policy and `docs/guides/TESTING.md` (where the two differ, `TESTING.md` governs -
    it is the policy's single home). Read both before judging proof. Where the policy says a thing is not tested - a
    visual property, the text of a button, heading or label, "the page loads", a duplicate of a remaining test - or that
    the steps of one flow are one test, the absence of such a test is not a finding, and neither "every acceptance
    criterion maps to a proof" nor "a change that reaches N surfaces carries N fixtures or asserts" asks for it. This
    file still decides whether a test that exists proves its claim - it can fail, it exercises production code, it was
    not narrowed to go green - and whether the code is correct. The floor the policy does not lower: a behaviour that
    writes stored data, computes money, or sits on a migration, access policy, grant, auth or permission surface owes
    its proof, whatever the policy says.
    **Its suppression dual.** A diff that adds or changes no test and no tested behaviour needs no read of the policy.

Proposed text, `.claude/aiwf-native/doctrine/plan.md` project additions, under `### Plan readiness review`:

    **At readiness the same policy decides which tests a ticket must name** (interim, as above). A ticket is not asked
    for a test the policy says is not written, nor for one test per step of a single flow. A gap in the design that a
    finding names still gets its proof named in the ticket, and the floor of `review.md` project additions stands here
    too.

Brief side, from your next dispatch on (no tree write): every review brief and every plan-readiness brief carries one line
- `TEST POLICY: dev/PROJECT_OVERRIDES.md § Test policy; docs/guides/TESTING.md - governs what is tested (review.md project
additions)`.

What the operator loses under Text A: the auditor stops asking for tests the policy excludes, so a defect that only such a
test would have caught is no longer caught at the audit. The floor keeps that away from data, money and access.

Honest limit: the policy is not clean yet (step 4). Until it is, the auditor may meet two local sentences that disagree;
the "TESTING.md governs" clause is the interim tie-break.

### Text B - tests are written with the code, not after it (amends the operator rule of 2026-11-08)

The finding (research file § 4, "Sources of rework", item 2): `dev/PROJECT_OVERRIDES.md`:360-364 orders a split ticket as
production code first, then "the tests and specs after it by the same groups ... production code is frozen for the test
groups". After phase 1 the tests are broken and phase 2 repairs them: PRCF-001 "81 error TS lines, ALL in test files",
PRCF-004 "107 failed", PRCF-005 "83 unit tests failed at load", PRCE-003 nine type errors in test files (scan agent's
pointers into the diff-review files and records). It also forces every red run to be manufactured by injecting a fault:
`records/TRM-001.md` § Events calls the freeze a violation. The counter-case is yours:
`archive/081_PLAN_PRCH_2026-11-18/records/PRCH-001.md`:25 - the test group was dispatched BEFORE production, and PRCH
passed three tickets with no blocker. PnP 0.3.20 already says a test written first, seen failing against the old
behaviour, has its red proof.

Proposed replacement of the bullet at `dev/PROJECT_OVERRIDES.md`:360-364 (the rule's reason - one Writer reached a ceiling
at item 36 of 38 - is kept; only the order changes):

    - **A heavy ticket is split from the dispatch** (operator rule 2026-11-08, amended 2026-11-22; PRCA-002: one Writer
      reached ~875K tokens and was paused at item 36 of 38). A code ticket with more than ~15 Code Map rows or more than
      ~20 Scope items goes to several Writers from the FIRST brief: the work by non-overlapping file groups under a
      shared brief that fixes the names and contracts between them, and that says which group owns which production
      files AND which test files. Each group writes the tests of its files with or before its production code - a test
      written first and seen failing against the old behaviour is its red proof (`review.md` § Test quality). There is no
      separate test phase and no freeze of production code for test groups. A test that breaks because ANOTHER group's
      code changed is fixed by the group that owns the test, in a micro-round after the one type-check. The E2E spec is
      one group's, written against the shared brief's contracts. Type-check, build, E2E and the commit run once, at the
      end. Never one Writer for the whole.

Consequences to carry with it: a plan index no longer writes "the production code ... then the tests and specs by the same
groups, with the production code frozen for the test groups" (the pattern of PLAN_TRM § Writer groups, D-32); a Writer
brief no longer says "PHASE 1 = production code only. Test files ... are FROZEN".

What the operator loses under Text B: nothing the evidence names. A possible cost: a group's tests may be written against
a contract another group has not finished, so the shared brief must fix the names and types before dispatch - it already
has to.

## Step 4 - in parallel with the PnP release: the test policy into one home

Until this is done the policy is not reliable enough to be the auditor's yardstick. A scan agent inventoried about 100
test-obliging sentences over nine files (`dev/PROJECT_OVERRIDES.md`, `docs/guides/TESTING.md`, the five rendered doctrine
files, `.claude/agents/writer.md`, the plans) and found ten places where one obligation is stated twice with different
breadth. Its pointers (verify each before you rely on it - line numbers move; PO = `dev/PROJECT_OVERRIDES.md`, TG =
`docs/guides/TESTING.md`, ORC / WK / TK / PL / RV = the rendered `ORCHESTRATOR.md`, `work.md`, `ticket.md`, `plan.md`,
`review.md`, WR = `.claude/agents/writer.md`):

1. An old red test - fix it or leave it. PO:227-229 "a test already red that belongs to a changed file is fixed in the same
   ticket too"; ORC:435-436 and WR:57-58 "never silently fixed", only recorded; ORC:640-644 (local, 2026-11-21) "a small
   one is fixed at once"; TG:127-129 and TG:292-295 a baselined-red file is judged by "no new failing test".
2. Who runs the E2E and how often. WK:124-127 the COO at the handoff; PO:244-251 a fresh scan agent, a Writer's green run
   not repeated; ORC:678-684 the Writer runs only its added tests, the scope runs once; WR:105-108; TG:336-338.
3. The breadth of red-then-green. WK:120, TK:154, WR:106 "where review.md § Test quality owes it"; ORC:678 (local) "red,
   then green" with no such limit; ORC:248 "Every new or changed evidentiary instrument is made to fail on purpose" - wider
   than the narrowed rule.
4. A missing proof test. PO:226 and WR:65 "a scope miss"; RV:156 "a named blocker".
5. Which tests a ticket runs - defined four ways. PO:253-254 and TG:117-120; PO:227-228; the plan's "imports, mocks or
   mounts a changed symbol"; ORC:229-231 the consumer grep.
6. "The E2E suite in scope". TK:446-448 and PL:290-291 use the phrase; PO:221-225 and ORC:668-677 allow the full suite only
   on the operator's word and define "scope" as the named specs. The phrase in TK and PL is undefined.
7. A UI ticket needs an E2E spec, but E2E may not prove a visual. WK:25 and TK:188-190 (generic) against PO:216-219 and
   TG:314-316; TK:429-433 adds a screenshot "(no new assertion)".
8. Multiplicity. RV:88-89 one assert per surface; TG:316 steps of one flow are one test, no duplicate. Text A above settles
   which governs for the auditor; the policy itself should say it once.
9. The pgTAP run path. TG:21-23 "every run is a DB command behind an operator dialog"; PO:186-187 and TG:372 the local run
   through `reset.ps1 -PgTap` with no dialog.
10. Duplicated statements. "Tests are part of implementation, not polish" at PO:212, WK:118-119, WR:64, PL:264-268; the E2E
    economy at PO:221-225, ORC:668-694 and TG:327-331; TG:15-17 and TG:21-23 carry figures and a dialog claim from
    September / October.

What to produce: `docs/guides/TESTING.md` as the one home (PO:212-213 already names it so); every other place a one-line
pointer; each of the ten settled to one sentence, shown to the operator where it changes one of his rules - at least the
rule of 2026-10-27 ("Every change carries its tests") and the rule of 2026-11-08. The generic lines (anything outside the
project additions blocks of the rendered doctrine files and outside WR) are not yours to edit: where a generic line is
the wrong half of a contradiction, write it down as a candidate for PnP in your ledger instead.

Not asked of you here: cutting the number of named tests a planner writes into a ticket. That waits for the two numbers
of step 5.

## Step 5 - when the PnP release is out

- Update straight to the new release; skip 0.3.21 (its "required notes" rule is replaced in the next one).
- Retire the interim texts of Text A (the release carries the authority split and the slot for a project's test policy);
  keep Text B - it is a local operator rule.
- From then on each ticket record carries the line the release adds: the auditor's blockers by kind, the effort split
  (test Writers / production Writers / fact-check of test prose), and the defects that reached the operator after the
  close. After three or four tickets those two numbers are read and the planner question is decided.

## What is not known (do not present these as facts to the operator)

Which tests were unnecessary; hours; what would have slipped without the tests; the share of a ticket's test list that
came from readiness. The effort split exists for one ticket (`archive/077_PLAN_PRCE_2026-11-15/records/PRCE-004.md`
:165-171).
