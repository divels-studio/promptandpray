# 0035_declared-ticket-count

**A plan's ticket count is a decision of the plan, declared on one line of its index and enforced
by the plan gate; an index without the line keeps the cap of 3.**

## What changes

- The plan index carries, right under its title line and at column 0, `Tickets: <n> - <reason>`:
  `<n>` an integer 1-99, `<reason>` the COO's one reason. The COO decides the count from the roadmap
  entry's Size and the research before the planner runs and fills the planner brief's
  `TICKET COUNT` slot (`<n> - <reason>`, or `default`); the planner copies it verbatim.
- `scripts/engine/plan-gate.js` enforces the declared count instead of the constant 3
  (`tickets-over-cap:<n>`, the message naming `declared "Tickets: <n>"` or `the default 3`). No
  line -> the cap is 3. A line starting `Tickets:` that breaks the grammar, or a second one, is
  refused with the new token `tickets-cap-malformed:<line>`; a line inside a fenced block declares
  nothing.
- The readiness auditor gains the cut question - `docs/READINESS_CLASSES.md` class 16: every ticket
  one shippable piece with one code commit; two tickets that are one, or a plan that is two
  missions, is a BLOCKER (`templates/briefs/readiness-codex.md`, `plan.md` § Plan readiness review).
- `plan.md` § Plan readiness review states the decision in the cycle and the declared count in the
  mechanical gate's list; `/pnp:plan` Step 4 and the approval report carry it.

## What this migration does

- One `rerender-managed-region` operation: `.claude/aiwf-native/doctrine/plan.md`.
- One `note` (`declared-ticket-count-0-3-10`): `/pnp:update` prints it with the CHANGELOG block of
  0.3.10.

## What it leaves alone

Every config key (the byte cap `plan.ticketByteCap` included), the ask-ruleset, every
operator-owned file, the other stage files, the agents, and the project additions block of
`plan.md` - carried over by its re-render. An existing plan folder needs nothing: without the line
its cap stays 3, and its stamp is unchanged.

## Superseded local rules

None retired.
