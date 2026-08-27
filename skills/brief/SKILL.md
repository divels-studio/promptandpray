---
name: brief
description: Compose the session brief that opens the next fresh session, per the plugin's SESSION_BRIEF_RECIPE - the same recipe on every session-to-session handover.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:brief - the session-to-session handover brief

Compose the **session brief** the operator will use to open the next fresh session.
The authority for the recipe is the plugin's **`docs/SESSION_BRIEF_RECIPE.md`** - read it and follow
its structure exactly (the nine mandatory sections, the Writer-brief checklist, the anti-patterns).
The principle: *maximum quality at minimum cost / context / tokens.*

Argument: the next ticket or focus; empty = the next open ticket in the active plan.

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

## Step 1 - Collect the current state (read-only)

- `git status --short` + `git log --oneline -5` -> branch, **HEAD SHA**, clean/dirty tree.
- The active plan under `{{config.paths.plansDir}}/active/` (plansDir is the PARENT of `active/` and
  `archive/`) -> the target ticket's section (scope, risk threshold, stop condition, VERIFY) and the
  ledger entries -> which tickets are CLOSED.
- Your memory tool -> the resume point, machine-local facts, any recorded operator gates.
- Everything THIS session learned the hard way (environment quirks, commands that actually work,
  decisions taken) - that goes into the brief VERBATIM, so it is not rediscovered.

Write nothing and commit nothing in this skill - the output is text for the operator.

## Step 2 - Compose the brief

- Language: `{{config.operator.language}}` (the operator channel), technical terms in English.
  Dense; about a screen and a half is the target.
- All nine sections from the recipe, in order. Section 7 (Loop + the exhaustive Writer brief) and
  section 8 (the verbatim subagent-model clause) are MANDATORY - they never drop out; they are what
  removes correction rounds and wasted passes in advance.
- Facts and pointers, not file contents; commands copy-paste ready, marked where they are the
  operator's to run.

## Step 3 - Hand it over

Return the brief in ONE fenced block (ready to copy-paste), followed by at most 2-3 lines of notes
to the operator (what to check or decide before pasting it - e.g. pending gates or unfinished VERIFY
steps). Nothing else.
