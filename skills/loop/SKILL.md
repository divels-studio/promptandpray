---
name: loop
description: The AIWF native working-loop convention (PLAN -> Writer -> Review -> QA -> commit gate). Read this before driving an R2/R3 ticket; it is the sequence, the roles and the hard rules, not a state machine.
allowed-tools: Read, Grep, Glob
---

# /pnp:loop - Native working-loop convention

This is **documentation-as-command**, not a state machine. There is **no runtime state machine, no
counters, no new state files** - the loop is a convention plus the already-wired native click-based
permission gates. This skill reminds the COO/Orchestrator of the sequence and the hard rules; it
does not track state.

Argument: the ticket ref or goal being run.

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

Read the authority before driving the loop: `{{config.paths.overridesDoc}}` (this project's
identity and hard rules), the plugin's `docs/WORKFLOW.md` (routing + the ticket-brief contract),
and `docs/LOOP.md` (the one-page native mapping).

## Roles (who may do what)

- **COO / Orchestrator** (this session) - plans, authors the ticket brief (with **risk threshold** +
  **stop condition**), delegates, reads the **full** diff, arbitrates, stops the loop at the
  stop condition, and is the only role that presents the result to the operator. Does **not**
  write implementation code.
- **Writer** - the **only** repo writer. Invoked as the `writer` subagent via the **Agent tool**
  with `subagent_type: "writer"` (your project's rendered writer agent). Never approves its own
  work; returns diff + tests + VERIFY output. (Gate 1 allows `agent_type: "writer"`; every other
  subagent is denied the Edit/Write family.)
- **Reviewer** - read-only via `/pnp:review`; **engine-neutral** (Codex or Claude per
  `<root>/.claude/aiwf-native/roles.json`, resolved by the plugin's role resolver -
  `scripts/native/ps/aiwf-roles.ps1` on os `windows`, `scripts/native/sh/aiwf-roles.sh` on os
  `linux`/`macos`). Reports `pass` / `pass-with-notes` / `fail`; never edits.
- **QA** - read-only artifact judge via `/pnp:qa`, **only** when the ticket has observable
  runtime/UI behavior; **engine-neutral** (Codex or Claude per `roles.json`). Reports
  `pass` / `pass-with-notes` / `fail` (or precondition `BLOCKED`) with evidence; never edits, never
  starts a server.
- **Operator** - the human. Sole authority for commit approval, push, merge, branch switches,
  and destructive/system-changing operations.

## The sequence

1. **PLAN.** Classify the work R1/R2/R3 (`docs/WORKFLOW.md`). R1 = direct in this session, no
   subagents/Reviewer/QA - skip the rest of this loop. Durable R2/R3 -> the plan-readiness
   review and the living PLAN under `{{config.paths.plansDir}}/active/` apply before implementation.
2. **Writer implements.** Delegate the concrete ticket to the `writer` subagent (Agent tool,
   `subagent_type: "writer"`). Give it the outcome, scope, acceptance criteria, risk threshold,
   and stop condition. Tests are part of implementation, not polish. The Writer returns
   `DONE` (+ diff + tests + VERIFY output with exact exit codes) or `BLOCKED: <reason>`.
   Carry `Ticket: <REF>` on a line of its own in the brief. Gate 2 then decides in the project's
   configured mode (`enforcement.dispatchGate`): `always` = every dispatch surfaces a native
   **Yes/No** dialog and the operator clicks; `off-plan` = a ref found in
   `{{config.paths.plansDir}}/active/PLAN_*.md` passes silently and everything else raises the dialog.
3. **Review.** Run `/pnp:review <TICKET_REF>` over the Writer's diff.
4. **QA (conditional).** If - and only if - the ticket declares observable runtime/UI behavior,
   run `/pnp:qa <TICKET_REF>`. Otherwise skip QA entirely.
5. **Correction rounds.** On a Reviewer/QA `fail`, route the specific blockers back to the Writer -
   **max `{{config.loop.correctionRoundsCap}}` correction rounds** (one round = COO -> Writer ->
   COO). After the cap without a passable result, **stop** and summarize to the operator - do not
   grind. Only the operator lifts the cap, by an explicit word before the re-dispatch, for one
   extension, recorded in the PLAN entry.
   A QA `BLOCKED` is **not** a Writer defect: it is an operator precondition (nothing is serving
   the app under test, and the Writer is forbidden to start a server). On `BLOCKED`, **pause** the
   loop and ask the operator to start the app, then re-run `/pnp:qa`. This does **not** consume a
   correction round and is **not** routed to the Writer.
6. **Commit gate (click-based).** The gate passes when every required role returns `pass`
   **or** `pass-with-notes` (only a `fail` blocks; a QA `BLOCKED` pauses for the precondition above).
   The Writer then attempts the **local** `git commit`; `Bash(git commit:*)` is an `ask` rule, so
   Claude Code shows a visual **Yes/No permission dialog** -> the operator clicks **Yes** to allow
   the commit. The operator types **nothing** - the click on the current attempt is the approval;
   there is no token, no state file, no HEAD/content binding. No automatic commits.
7. **Push / merge / rebase** - executed from the session **only** after the operator's **explicit
   word** in chat **and** a native **Yes/No** permission dialog. These are `ask` prefix rules for
   the common forms - `Bash(git push:*)` / `Bash(git merge:*)` / `Bash(git rebase:*)`, their
   `git.exe` variants, and the `Bash(git -C <projectRoot> ...)` forms - **plus** branch isolation.
   Accident-grade, not adversary-proof (prefix match, so an explicit push URL / alias / escaped
   verb is out of scope); the operator does not drive git manually. **Destructive / system-changing
   commands** (`git reset/clean/rm/restore/revert/pull/fetch`, database reset/seed, migration
   tools, containers, recursive delete, etc.) - an AI role **may** run one, but only after the
   operator clicks **Yes** on the visual permission dialog for a **matching** command (`ask` rules
   in the project's `.claude/settings.json`; prefix-based, so non-prefix forms are a known
   residual).

## Invariants (do not violate)

- **This loop is the R2/R3 cycle.** In R2/R3, the Writer subagent is the only repo writer and the
  COO/review roles never write implementation code. **R1 is different:** the main session
  implements R1 directly - no loop, no subagents, no Reviewer/QA (see step 1). The Writer-only /
  COO-does-not-write rule is an invariant of the R2/R3 cycle, not of R1.
- Reviewer and QA are read-only, engine-neutral (Codex or Claude per `roles.json`). On the **codex**
  host the read-only boundary is a hard OS `--sandbox read-only` cell; on the **claude** host
  Gate 1 catches the Edit/Write family and the boundary is tool-availability + convention + git
  reversibility, with NO OS cell - the hard OS boundary applies only on the codex read-only path.
- No new state files or counters - this loop is convention + the native click-based permission
  gates plus two tiny stateless hooks (Gate 1, Gate 2). Gate 2 reads the project config and the
  active PLANs; it writes nothing and remembers nothing between dispatches.
- The round cap is `{{config.loop.correctionRoundsCap}}`; the stop condition and risk threshold are
  mandatory in every R2/R3 brief.
- Push/merge/rebase run from the session only after the operator's explicit word **and** a native
  Yes/No dialog (`ask` prefix rules + branch isolation; no hook); commit and destructive ops
  likewise surface a visual Yes/No dialog for a matching command (`ask` rules). Accident/role
  protection, not adversary-proof.
