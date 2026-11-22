# 0046_required-test-notes

**A weakness in a test over code the Reviewer confirmed is a required note, not a blocker. The
Writer closes it before the commit, the COO checks the fix, and no second pass follows; this update
re-renders two stage files and, where one exists, the Reviewer agent.**

## What changes

`review.md`, the new § Test findings on confirmed code (after § Test quality):

- when the Reviewer has traced a behavior the ticket adds or changes through the production code
  and found it correct, a weakness in that behavior's tests - a missing assertion, an assertion that
  stays green under a named fault, a surface with no proof of its own, a missing unhappy-path test -
  is a REQUIRED NOTE: it names the test, the fault the test would miss and the surface;
- a required note never makes the verdict `fail` by itself; a pass whose only findings are required
  notes returns `pass-with-notes`;
- the Writer closes every required note before the commit; the COO checks each fix by reading the
  delta and running the changed tests, and no verification pass follows;
- the same finding is a blocker only when the Reviewer could not confirm the code without that
  proof;
- its suppression dual: a test that fails, a test skipped or narrowed to get green, and a required
  verify command that was not run stay blockers.

The sentences the section narrows each gained a pointer to it: "a missing proof surface is a
completion blocker" (§ Reviewer - code & design correctness), "an obvious missing unhappy-path test
is a named blocker" (§ Proof adequacy) and the red-proof bullet's "names the fault under which the
test stays green" (§ Test quality). § Fail aggregation lists required notes whole in the same round;
§ Verdict names them under `pass-with-notes` and in the listing order.

`ticket.md`, § Loop shape and its overrides: closing the required notes of a `pass-with-notes` is
ticket work, not a correction round - a micro-round to the live Writer whose delta stays in test
files, the COO's first-hand check recorded in the completion record, no verification pass; a note
whose fix needs a production line is a correction round.

The Reviewer agent: the `pass-with-notes` line of its output contract names required notes.

Outside the rendered files: `skills/review/SKILL.md` - the output contract of the brief and Step 4
say the same. Skills are read from the plugin root and arrive with the version.

Why: on a consumer, a first code pass returned `fail` with five blockers while confirming the three
production fixes of the ticket; four of the five named a weak or missing test, not a code defect
(the consumer COO's report to the operator, 2026-11-22; not re-counted for this note). Under the
previous text each of them was a blocker and the route owed a correction round and a second paid
pass over tests of correct code. The 0.3.20 narrowing covered only a missing red record.

## What this migration does

- Two `rerender-managed-region` operations: `.claude/aiwf-native/doctrine/ticket.md` and
  `.claude/aiwf-native/doctrine/review.md` (whole files), each additions block carried.
- One `rerender-managed-region` of `.claude/agents/reviewer.md` with `ifRecorded: true`: a project
  whose Reviewer and review rows are all Codex-hosted has no such file and sees the operation
  reported as skipped.
- One `note` (`required-test-notes-0-3-21`): `/pnp:update` prints it with the CHANGELOG block of
  0.3.21 and its two `docRefs`.

## What it leaves alone

Every config key, the ask-ruleset, every other managed file - the core, `work.md`, `plan.md`, the
Writer and QA agents, `AGENTS.md` and the managed `CLAUDE.md` region did not change - and every
operator-owned file. QA's verdict rules are unchanged: the section binds the Reviewer.

## Superseded local rules

None retired. A local rule that makes a weak or missing test a blocker whatever the Reviewer found
in the code now contradicts `review.md` § Test findings on confirmed code; the note names that
class, and its deletion stays the consumer's act on its operator's word.
