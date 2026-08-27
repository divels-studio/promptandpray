---
name: work
description: Ad-hoc working session outside any mission - loads the full AIWF doctrine, checks the tree, then asks for the task and routes it R1 / R2 / R3.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:work - ad-hoc working session under the full AIWF doctrine

You are the Orchestrator/COO. The operator wants a working session that is NOT mission-driven, with
the full AIWF protocol in force - no manual explanation from the operator required.

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
   overrides document carries the project's identity, hard rules and product truth - a session
   without it works without the product's boundaries.
2. **Tree check.** Current branch, `git status`, the last ~5 commits. Identify uncommitted work -
   NEVER touch or stage foreign uncommitted files; commit only by explicit paths.
3. **Ask for the task** (in `{{config.operator.language}}`, briefly): what outcome, what is in and
   out of scope, any constraints. One round of questions, then work.
4. **Classify and route.** R1 -> execute directly in this session and report. R2/R3 -> requires a
   ticket in a plan under `{{config.paths.plansDir}}/active/` (plansDir is the PARENT of `active/`
   and `archive/`): author or extend a PLAN with the ticket brief
   (risk threshold + stop condition), state the routing as a decision with a one-line why, then STOP
   and wait for the operator's word before dispatching.

## Rules in force (summary - the doctrine text is authoritative)

- The operator's four gates: the commit/push word, expensive quota passes, destructive or
  system-changing operations, and product/UX choices (stop-and-wait when 2+ variants exist).
- The Writer is the only repo writer for R2/R3; dispatch via the Agent tool with a `Ticket: <REF>`
  line; never pass `model` when dispatching the Writer (its pin lives in its frontmatter, and the
  override would silently replace it with a tier alias).
- Reviewer (`/pnp:review`) after the diff; QA (`/pnp:qa`) only for observable runtime/UI behavior;
  both engine-neutral per `roles.json`.
- Subagent model policy: an explicit `model` always; `haiku` for mechanical scans, `sonnet` for
  evidence-with-judgment (the default scan tier); the top tier is never delegated for scans.
- While an R2/R3 ticket is open the main session writes only `docs/**`, `.aiwf/**` and root-level
  `*.md` (Gate 3, armed by writing `.aiwf/route-state.json` at dispatch and cleared with `{}` on
  close); VERIFY commands run literally with exact exit codes; every claim to the operator carries
  its evidence (command / file:line / number).
