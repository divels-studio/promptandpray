# 0050_audit-loss

**A blocker names a loss at both audits, a plan does not restate the project's verification
procedure, plan-form duties scale with the change, measurement is two fixed-form `pnp-measure` rows,
and the briefs carry the project's product stage. This update re-renders three stage files and the
Reviewer agent where one was rendered.**

## What changes

`review.md`, the new § A blocker names a loss (after § The project's test policy and the auditor):
one text for both audits. A BLOCKER names what is lost if the work runs exactly as written - stored
data or money wrong, an access, tenancy or permission hole, a migration that fails or blocks live
traffic, a race or lock order that loses a write, something the user sees wrong or cannot do, a
decision left to the Writer, a proof that does not test the ticket's own product property. A finding
about how the plan or the diff is worded, ordered, proven, evidenced or recorded is a NOTE (an INFO
row at readiness) and opens no revision and no pass; its suppression dual keeps a finding of form
whose consequence is a loss a blocker, and leaves the floor and the dual of § Test findings on
confirmed code untouched. § Plan readiness and the Reviewer's material blocker (§ Fail aggregation,
§ Verdict) point at it; QA's material blocker is unchanged.

`review.md`, § The project's test policy and the auditor: one more bullet - the project's product
stage, named on the brief's `PRODUCT STAGE:` line; a finding about something the stage does not ask
for is a note, what it lists as mandatory is not loosened, and it never lowers the floor; where the
line reads `none`, the pass is judged without it.

`plan.md`, § Plan readiness review: the triage gains the dispositions `note: land` and `note: drop`
(a BLOCKER row that names no loss, with no revision counted); check 5 reads only what the plan
itself introduces.

`ticket.md`, § Loop shape and its overrides: a note opens no correction round, a note of § A blocker
names a loss and a note on a test over confirmed code alike; a required note whose fix needs a
production line is a correction round.

Three more sentences follow the same rule:

- a readiness proof is a blocker only when it cannot observe the ticket's own property
  (`ticket.md` § Proof-surface feasibility); a finding closed by wording is fixed in a revision
  only when it names a loss (`plan.md` § Plan readiness review); a ticket cut is a blocker only
  when a ticket cannot ship alone without a loss (readiness class 16).

The Reviewer agent: on a readiness pass 2, a pass-1 BLOCKER disposed `note: land` or `note: drop` is
`NOTED`, outside both counts.

Outside the rendered files, arriving with the version:

- `templates/briefs/readiness-codex.md` - the blocker text carried whole (the readiness auditor is
  not handed `review.md`), the new test line and INFO examples, the closing-grep and transactional
  questions scaled, the `PRODUCT STAGE:` slot, `NOTED` on pass 2;
- `templates/briefs/planner.md` - the acceptance rule (a ticket names what is its own and cites the
  test policy, never restates it), the `TEST POLICY:` and `PRODUCT STAGE:` slots, the scaled
  `CLOSING GREPS` slot, the notes-only handoff;
- `templates/briefs/research.md` - the transactional read owed only where write order, lock or
  statement set change;
- `templates/briefs/record.md` - `## Measurements` is one `pnp-measure` ticket row;
- `templates/PROJECT_OVERRIDES.md.tmpl` - the seed's new § Product stage;
- `skills/review/SKILL.md` - the code-review brief's `PRODUCT STAGE:` slot, the plan-mode pointer,
  the `note` dispositions;
- `skills/plan/SKILL.md` - the `note` dispositions, the closing-grep rule at Step 4, the plan's
  `pnp-measure` row; the start and approval context numbers and the question to the operator are
  removed;
- `docs/READINESS_CLASSES.md` - classes 8, 11 and 15.

## What this migration does

- Three `rerender-managed-region` operations: `.claude/aiwf-native/doctrine/review.md`, `plan.md`
  and `ticket.md` (whole files), each additions block carried.
- One `rerender-managed-region` of `.claude/agents/reviewer.md` with `ifRecorded: true`: a project
  whose Reviewer and review rows are all Codex-hosted has no such file and sees the operation
  reported as skipped; a Claude-hosted Reviewer whose file is not recorded is never overwritten and
  is re-rendered by a `/pnp:roles --set` or `--reset` run.
- One `note` (`audit-loss-0-3-25`): `/pnp:update` prints it with the CHANGELOG blocks and its nine
  `docRefs`.

## What it leaves alone

Every config key, the ask-ruleset, the Writer and QA agents, `AGENTS.md`, the managed `CLAUDE.md`
region and every operator-owned file - the overrides document included: the engine never writes
it, so an existing project writes its own § Product stage when it wants one, and with none the
`PRODUCT STAGE:` line reads `none`. QA's brief carries no `PRODUCT STAGE:` line.

## Superseded local rules

Named on the CHANGELOG block's `Retires local rules:` line: a local pointer sentence in `plan.md`
§ project additions that points the planner at the project's product-stage section is retired, and
a local pointer in `review.md` § project additions that does the same for the auditor narrows to QA,
the one audit the new slot does not reach. The deletion or narrowing stays the consumer's act on its
operator's word.
