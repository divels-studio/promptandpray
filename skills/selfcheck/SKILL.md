---
name: selfcheck
description: Run the PromptAndPray self-check - payload invariants (both enforcement hooks executed, resolver, wrapper flag locks) plus this project's own layer (ownership bookkeeping, rendered artifacts, version stamps), with negative controls.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:selfcheck - prove the installation is consistent

Runs the self-check engine over two different subjects and never confuses them: the **payload**
(properties of the plugin itself) and the **project layer** (properties of this one installation).

## Step 0 - Project context (mandatory for every `/pnp:*` skill)

1. **Resolve the project root.** Run `git rev-parse --show-toplevel`. If that fails (not a git
   worktree), fall back to `project.root` in the config below. If neither resolves, stop and say
   so - no skill guesses a root. `<root>` below means this path.
2. **Read the config.** `<root>/.claude/aiwf-native/aiwf.config.json`. If it is missing, the payload
   half still runs: pass no project fixture and say plainly that only payload invariants were
   checked, then point at `/pnp:setup`.
3. **Version interlock.** This skill is one of the two documented **exceptions** (with
   `/pnp:update`): it runs even when the installed version is behind the payload. A diagnostic that
   refuses to run when something is out of date is a diagnostic you cannot use when you need it.

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 1 - Run it

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/selfcheck/aiwf-selfcheck.js" `
  --plugin-root "${CLAUDE_PLUGIN_ROOT}" --project-fixture "<root>"
```

- `--project-fixture <root>` points the project-layer checks at THIS installation.
- Omit it and the engine writes a synthetic fixture of its own; those checks then prove the CHECKER
  runs, not that a real install is healthy - the output says so, and the version-stamp check is
  skipped as self-confirming.

Exit 0 = every assertion held. Exit 1 = at least one failed. Exit 2 = the run could not start.

## Step 2 - Read the output honestly

- `[PASS] / [FAIL]` are assertions that really ran.
- `[NOTE]` is a branch this run could not exercise (an empty owned-rule list, a codex-hosted role
  with no agent frontmatter to compare). A NOTE is deliberately **not** counted as a pass.
- The **NEGATIVE CONTROLS** section breaks a throwaway copy of a synthetic fixture and requires each
  project-layer check to actually fail. A check that cannot fail is not a check.

What the run does **not** prove, and does not claim: that the harness ENFORCES the declarative
permission rules, or that it RENDERS the Yes/No dialog for an `ask` decision. Neither is reachable
from Node; both rest on recorded live observations.

## Step 3 - Report

Report in `{{config.operator.language}}`: the assertion count, the exit code, and - for each failure -
the check name and the one action that fixes it. A drifted rendered artifact (roles.json or an agent
file disagreeing with `aiwf.config.json`) is fixed at the SOURCE: edit the config and re-render
through `/pnp:setup`, never by editing the rendered file.
