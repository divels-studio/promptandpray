# 0033_doctrine-stages

**The doctrine by stage: every rule of the loop stands in exactly one stage file, each stage file is
rendered into the project as a managed artifact with its own project additions block, and every
entry door reads its stage IN FULL from the rendered file.**

## What changes

- Four new managed artifacts, rendered from `templates/doctrine/`:
  `.claude/aiwf-native/doctrine/work.md` (the routes, routing mapped to native, tests, the status
  docs policy), `ticket.md` (the brief contract, the COO write boundary, role boundaries, loop shape,
  fail aggregation, the ticket's record and closeout), `plan.md` (the planning lock, plan readiness,
  durable development history, the ledger) and `review.md` (the Reviewer/QA verdict rules). The core
  is `.claude/aiwf-native/ORCHESTRATOR.md`, which now carries the always-on sections in full.
- The entry doors read the rendered files: `/pnp:work` the core, `work.md` and the overrides document,
  then `ticket.md` when the task routes R2/R3; `/pnp:mission` the core and the overrides document,
  then `ticket.md` before the dispatch; `/pnp:plan` the core, `plan.md` and the overrides document;
  `/pnp:review`, `/pnp:qa` and `/pnp:qal` the core and `ticket.md` at their first step, and the
  auditor is handed `review.md`; `/pnp:arbiter` the core. Each read has the suppression dual
  `git diff <HEAD at the read> -- <paths>`, which fires on in-tree paths only - the reason the stage
  files are rendered rather than read from the plugin root.
- The payload documents shrink, none leaves: `docs/WORKFLOW.md` is the map of the stage files plus
  § Reproducibility; `docs/LOOP.md` keeps § Enforcement of Writer-only writes, § Commit gate,
  § Honest security model and a new § Role hosts table; `docs/REVIEW_CHECKLIST.md` is a pointer stub.
- The loop command is removed (its skill directory is gone); its one rule found nowhere else - a QA
  `BLOCKED` pauses the loop and consumes no correction round - stands in `/pnp:qa` at the verdict.
- Setup reserves the four stage paths and the `doctrine` directory: an overrides document, a transfer
  surface or a roadmap configured onto one of them is a blocker.

## What this migration does

- Four `rerender-managed-region` operations with `region: null` create the four stage files (the
  0012 shape: an artifact this installation has no record of is rendered, written and recorded).
- Three `rerender-managed-region` operations: the `aiwf-core` region of `CLAUDE.md` (the preflight
  names the stage files), `ORCHESTRATOR.md` (its pointers re-aimed at the stage files) and the Writer
  agent (its pointers re-aimed).
- Two `rerender-managed-region` operations with `ifRecorded`: the Reviewer and QA agents, which now
  name the rendered `review.md` and `ticket.md` - skipped where this installation has no such agent.
- One `note` (`doctrine-stages-0-3-8`): `/pnp:update` prints it with the CHANGELOG block of 0.3.8.

## What it leaves alone

Every config key you set, the ask-ruleset, every operator-owned file, every project additions block
(the one of `ORCHESTRATOR.md` and of each agent is carried over), and your overrides document - a
pointer of yours to a payload section now resolves in the stage file `docs/WORKFLOW.md` names.

## Superseded local rules

Four empty project additions blocks now exist, one at the end of each stage file. A local rule of
yours moves into the block of the stage file carrying the rule it modifies, opening with that rule's
heading - on your operator's word, never by this update. The CHANGELOG block's `Retires local
rules:` line names the rules the payload now carries - `none` for 0.3.8; from here on, deleting a
named one from your overrides document is your act.
