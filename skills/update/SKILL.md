---
name: update
description: Bring this project up to the installed plugin version - the CHANGELOG blocks between the two versions, a dry-run preview, the migrations in order (managed artifacts are overwritten; each rendered Markdown file keeps its project additions block), and a self-check. Never commits.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:update - apply the payload's migrations to this project

You are the Orchestrator/COO. The payload updates itself with the plugin; this skill is what makes
that update reach the PROJECT layer - the config, the rendered artifacts, the managed CLAUDE.md
region, the permission rules. **An update overwrites what it manages.** The operator's own text lives
in the overrides document, outside the `aiwf-core` markers of `CLAUDE.md`, and in the one
`<!-- project additions -->` ... `<!-- /project additions -->` block a rendered Markdown file may
carry - every re-render keeps that block verbatim.

## Step 0 - Project context (mandatory for every `/pnp:*` skill)

1. **Resolve the project root.** Run `git rev-parse --show-toplevel`. If that fails (not a git
   worktree), fall back to `project.root` in the config below. If neither resolves, stop and say
   so - no skill guesses a root. `<root>` below means this path.
2. **Read the config.** `<root>/.claude/aiwf-native/aiwf.config.json`. If it is missing, stop with
   one line: *PromptAndPray is not installed in this project - run `/pnp:setup`.* This engine never
   initialises a project; installing is setup's business.
3. **Version interlock.** This skill is one of the two documented **exceptions** (with
   `/pnp:selfcheck`): it runs precisely when the installed version is behind the payload. That is
   the whole point of it.
4. **Reading is not a shell job.** Read or inspect files with the Read/Grep/Glob tools - never
   `cat`/`grep`/`ls`/`head`/`node -e` through the shell for reading; the shell is for execution
   (tests, git, build).

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 1 - Where is this project?

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --check --project-root "<root>"
```

Exit 0 = nothing to do; say so in one line and stop. Exit 1 = migrations are pending; a project that
is behind also gets the line `behind: <installed> -> <payload>`.

## Step 2 - Dry run: the CHANGELOG and the full preview, zero writes

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --dry-run --project-root "<root>"
```

It writes **nothing**. It prints `CHANGELOG <installed> -> <payload>:` followed by the plugin
CHANGELOG's version blocks in that range (or `CHANGELOG: no block between <installed> and <payload>`),
then every operation it would run, migration by migration. A dry run never prompts: a new config key
that asks the operator a question is listed as `would ask: <address>`. Show the operator:

- the CHANGELOG blocks, once - that is how the project learns what changed, including any local rule
  the payload now carries (deleting such a local rule from the overrides document stays a separate
  act, on the operator's word);
- the operations per migration: which managed artifacts are re-rendered (overwritten), which config
  keys are added, and any question that will be asked.

## Step 3 - The operator's word, then apply

Applying is an operator decision, so **wait for it**. Then:

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --apply --project-root "<root>"
```

- it prints the same CHANGELOG blocks, then runs the operations in order;
- every managed artifact is **overwritten** from the payload render - an edited file, a foreign file
  at a managed path, a deleted file recreated. A rendered Markdown file keeps its
  `<!-- project additions -->` ... `<!-- /project additions -->` block verbatim (each marker on its
  own line, at most one block per file); a malformed block (one marker alone, two blocks) stops the
  run with exit 1 naming the file. In `CLAUDE.md` everything outside the `aiwf-core` markers is the
  operator's and is never touched;
- the only question an update asks is a new config key that needs the operator's value. Interactively
  the run asks; scripted (CI, or a replayable run) pass `--resolution-file <json>` mapping
  `"<migration>/<opIndex>/<key>"` to `{ "kind": "answer", "value": <json> }`. A missing or malformed
  record stops the run naming the address - nothing is ever guessed;
- if the process dies mid-run, just run it again: an interrupted migration re-runs from its start,
  and every operation is safe to repeat;
- in an auto-approving permission mode the host may refuse the engine's write to
  `.claude/settings.json` or `aiwf.config.json` as self-modification; run it again in a mode that
  asks.

Exit codes: 0 applied (or already current), 1 blocked (an invariant, a validation failure, a
malformed project additions block, or an unanswered question), 2 could not start.

## Step 4 - Self-check (the CLI already ran it), then report

You do not have to remember this step: an `--apply` that really applied migrations **runs the
self-check itself** as its last action, against the project it just wrote, and reports
`self-check: PASS` with the child's own summary line. `--check`, `--dry-run` and an "already
current" run write nothing, so it does not run - except a stale `$schema`, which it refreshes, says
so, and self-checks.

- a **red** self-check makes the update exit **1** and says plainly that the migrations WERE applied
  and nothing was rolled back - the writes stand, and the verdict is EITHER that the result is not
  consistent OR that this run **could not prove part of the contract in this environment** (a host
  the checks need was missing or unusable); the detail above the verdict says which;
- a self-check that could not be started at all is **also** exit 1: "could not check" is never
  reported as "checked";
- `--no-selfcheck` skips it, and says so on one line.

`/pnp:selfcheck` is how you **re-run** it or inspect a failure in full - not a step the agent has to
remember after a write.

Report in `{{config.operator.language}}`, short, read off the CLI output rather than restated: the
version diff, the CHANGELOG blocks shown, what was applied, and every question that was asked and how
it was answered.

When the run printed a **`N payload rule(s) present but not owned here: <names>`** line - a
`reconcile-ask-ruleset` found payload ask rules the project already carries in the payload's own
spelling, which it never inserted - the report carries that line too, with the count and the names.
Those rules are left alone by this update and by every later one, so the operator is the only one who
maintains them; with no such rules the line does not exist and the report says nothing about it.

**This command never commits.** The diff goes through the normal review + commit gate, like any
other change.
