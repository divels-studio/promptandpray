# 0045_red-proof-scope

**The red-then-green rule is narrowed to the behavior a ticket changes. The proof is per fault, a
missing red record alone is a note, and no brief may widen the rule; this update re-renders three
stage files and the Writer agent.**

## What changes

`review.md`, § Test quality - the first half of the red-proof bullet is replaced (the narrowing grep
for skip, only, todo and reduced sets stays, as its own bullet):

- red-then-green proof is owed for a new test, or a test whose assertion the ticket changed, that
  asserts a behavior the ticket adds or changes;
- the unit of proof is the fault, not the test: one named fault, one red run, and the hand-back
  names the tests that went red under it; a failure before a test's own assertion proves nothing
  for that test;
- a test written before the production change, whose failing run against the old behavior is in the
  hand-back, has its proof - no fault is injected;
- any other new or changed test is checked by reading: its assertion is unconditional and can fail;
- a missing red record is a note; it is a blocker only when the Reviewer names the fault under which
  the test stays green - the finding is then the test, not the record;
- a brief, a plan's verify line or a ticket's acceptance criterion that asks for more does not widen
  the bullet; its suppression dual: no red run for a ticket that changes no behavior, and no second
  one for a failure mode a kept red run already shows.

`ticket.md`, § Ticket brief contract: a brief quotes the red-proof rule and does not widen it - no
red run per test, no per-test log or hash pair, no "every changed test". § Role boundaries, the
Writer line, and `work.md` § Tests: "red, then green where `review.md` § Test quality owes it".

The Writer agent: § VERIFY and § Done contract say the same in the Writer's terms.

Outside the rendered files: `templates/briefs/planner.md` - Acceptance cites the rule and never
widens it. Brief templates are read from the plugin root and arrive with the version.

Why: on a consumer, over 17 plans, 12 of 32 code-pass blockers named no defect, only a missing red
record, and 6 failed passes changed no code line after them; 5 of the 12 cited a brief or an
acceptance criterion rather than the payload sentence (the count is the arbiter session's, from the
consumer's readiness verdicts; not re-counted for this note). The test defects that mattered were found under other Test-quality
and Proof-adequacy bullets, which stay.

## What this migration does

- Four `rerender-managed-region` operations: `.claude/aiwf-native/doctrine/work.md`,
  `.claude/aiwf-native/doctrine/ticket.md`, `.claude/aiwf-native/doctrine/review.md` and
  `.claude/agents/writer.md` (whole files), each additions block carried. No `createIfAbsent` or
  `ifRecorded`: these files exist on every installation since 0.3.8.
- One `note` (`red-proof-scope-0-3-20`): `/pnp:update` prints it with the CHANGELOG block of 0.3.20
  and its two `docRefs`. The release adds no stop for the operator's word, so the note carries no
  word-gate sentence.

## What it leaves alone

Every config key, the ask-ruleset, every other managed file - the core, `plan.md`, the Reviewer and
QA agents, `AGENTS.md` and the managed `CLAUDE.md` region did not change - and every operator-owned
file. The E2E declared RED run of `/pnp:qa` is a separate mechanism and is unchanged.

## Superseded local rules

None retired. A local rule that keeps every red run as a file, asks for a red run per new or changed
test, or blocks on a missing red record alone now contradicts `review.md` § Test quality; the note
names that class, and its deletion stays the consumer's act on its operator's word.
