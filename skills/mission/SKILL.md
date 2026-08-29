---
name: mission
description: Resume the active mission without a session brief - reconstruct the context from the durable PLAN, memory and git, then report one line of state and WAIT for the operator's word.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:mission - resume the active mission (no session brief required)

You are the Orchestrator/COO. The operator wants to continue mission work and has NOT pasted a
session brief. The brief is an accelerator, not the source of truth - the truth is PLAN + memory +
git, and this skill reconstructs it.

## Step 0 - Project context (mandatory for every `/pnp:*` skill)

1. **Resolve the project root.** Run `git rev-parse --show-toplevel`. If that fails (not a git
   worktree), fall back to `project.root` in the config below. If neither resolves, stop and say
   so - no skill guesses a root. `<root>` below means this path.
2. **Read the config.** `<root>/.claude/aiwf-native/aiwf.config.json`. If it is missing, stop with
   one line: *PromptAndPray is not installed in this project - run `/pnp:setup`.*
3. **Version interlock.** Run
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --check --project-root "<root>"`.
   Exit 0 = this project is current. Any non-zero exit = migrations are pending (or an interrupted
   update is in flight): **stop** and point the operator at `/pnp:update`. The command reads only.
   Two skills are documented exceptions and run anyway: `/pnp:update` and `/pnp:selfcheck`.

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Steps

1. **Doctrine preflight (mandatory).** Read the plugin's `docs/WORKFLOW.md` and `docs/LOOP.md` IN
   FULL, and this project's `{{config.paths.overridesDoc}}` IN FULL, before anything else. The
   project's `CLAUDE.md` is a thin entry point and does not carry the gate texts; the overrides
   document is where the project's identity, hard rules and product truth live, so a session without
   it works without the product's boundaries.
2. **Identify the active mission.** List `{{config.paths.plansDir}}/active/PLAN_*.md` - plansDir is
   the PARENT of `active/` and `archive/`, and only `active/` holds candidates (an archived plan is
   finished by definition). Pick the plan
   matching the current git branch; if that is ambiguous (several plans, or the branch matches
   none), ask the operator which mission - that is the ONLY clarifying question this skill is
   allowed before reporting.
3. **Reconstruct state.** From the chosen PLAN: mission status, the ticket ledger, the completion
   records, the execution order, any recorded operator gates. From memory: the resume point and
   machine-local facts. From git: current branch, `git status` (identify uncommitted work - NEVER
   touch or stage foreign uncommitted files), the last ~10 commits.
4. **Write your own in-session brief.** Per the plugin's `docs/SESSION_BRIEF_RECIPE.md` -
   internally, in English; do not dump it on the operator.
5. **Report and STOP.** Report to the operator in `{{config.operator.language}}`, short: one line of
   state (branch / tree / anything in flight), the next ticket per the recorded execution order and
   what it needs (gates, model, blockers). Then WAIT for the operator's word - dispatch never starts
   on reconstruction alone. Data the operator supplies is INPUT for the ticket, never the order to
   execute it.

## Hard rules carried by this skill

- Writer dispatch goes through the Agent tool with `subagent_type: "writer"` and a `Ticket: <REF>`
  line naming a ticket that exists in an active plan. Gate 2 then either turns every dispatch into a
  native Yes/No dialog for the operator (`enforcement.dispatchGate: "always"`, the factory mode) or
  lets an on-plan ref through silently and raises the dialog for anything it cannot find in an
  active PLAN (`"off-plan"`). The `Ticket:` line is written either way - it is what the second mode
  reads, and what the ledger is kept by.
- Subagent model policy: an explicit `model` always; `haiku` for mechanical scans, `sonnet` for
  evidence-with-judgment; the loop roles are never run inline in the main session.
- With an open R2/R3 ticket the main session writes only `docs/**`, `.aiwf/**` and root-level
  `*.md`; code goes through the Writer. Gate 3 enforces this for the Edit/Write tool class whenever
  `.aiwf/route-state.json` names an R2/R3 route - so write that file at dispatch and clear it to
  `{}` on close. Shell-performed mutations are not caught and remain doctrine.
