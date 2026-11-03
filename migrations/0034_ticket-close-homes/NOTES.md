# 0034_ticket-close-homes

**Four texts move to the stage file every session that applies them reads: `/pnp:mission` closes
tickets and plans but reads only the core and `ticket.md`, and R1 work and planning sessions do not
read `ticket.md`.**

## What changes

- The archive of a finished plan and the roadmap writes (three entry events, two list writes, the
  backstop grep, the trigger) move from `plan.md` § Durable development history to the end of
  `ticket.md` § Durable development history, below item 5. `plan.md` keeps items 1-3, the paths,
  the naming grammar and the ledger.
- The ticket boundary - about 400k tokens, a heavy ticket on the operator's word, what a ticket's
  session reads, when a session brief is offered - moves from `plan.md` § Plan readiness review to
  a new `ticket.md` § The ticket boundary. `plan.md` keeps "a readiness cycle starts in a fresh
  session" and what the COO session holds during it.
- `### Out-of-scope failures found during work` and `## Status / release docs policy` move from
  `work.md` to the core `ORCHESTRATOR.md`, as `##` sections before § Branch policy: they bind every
  session that works, and only the core is read by all of them.
- The texts move word for word; their cross-references and the stage files' opening lines change,
  and `docs/WORKFLOW.md`'s map follows.

## What this migration does

- Four `rerender-managed-region` operations: `ORCHESTRATOR.md`, `doctrine/work.md`,
  `doctrine/ticket.md`, `doctrine/plan.md`.
- One `rerender-managed-region` operation: the `aiwf-core` region of `CLAUDE.md` (the archive's
  pointer now names `ticket.md`).
- One `note` (`ticket-close-homes-0-3-9`): `/pnp:update` prints it with the CHANGELOG block of 0.3.9.

## What it leaves alone

Every config key, the ask-ruleset, every operator-owned file, `review.md`, the agents, and every
project additions block - each one is carried over by its re-render.

## Superseded local rules

None retired. A local rule of yours that points at one of the four texts by its old stage file
needs its pointer re-aimed; a local rule that modifies one of them belongs in the additions block of
its new stage file - on your operator's word, never by this update.
