---
name: update
description: Bring this project up to the installed plugin version - version diff, dry-run preview, ordered migration with a write-ahead journal, a conflict dialog only where you edited something (take-new / keep-mine / merge), a CHANGES report, and a self-check. Never overwrites your own content and never commits.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:update - apply the payload's migrations to this project

You are the Orchestrator/COO. The payload updates itself with the plugin; this skill is what makes
that update reach the PROJECT layer - the config, the rendered artifacts, the managed CLAUDE.md
region, the permission rules - **without ever overwriting the operator's own content**.

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

Exit 0 = nothing to do; say so in one line and stop. Non-zero = the pending migrations are named in
the output (or an interrupted update is in flight, which the next step resumes).

## Step 2 - Dry run: the full preview, zero writes

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --dry-run --project-root "<root>"
```

It plans every operation against the real state and writes **nothing** - not one byte, not even a
stage. A dry run never prompts, so it stops exactly where a decision is genuinely needed - where YOU
edited (or deleted) an artifact, or where a new config key asks you a question - and names the
address, because that decision IS what a preview exists to surface. An artifact you never touched
needs no decision, so the preview simply lists the line it would apply and keeps going. Show the
operator:

- the version diff and the operations per migration;
- every artifact that will be re-rendered without asking, and every one that will raise a conflict.

## Step 3 - The operator's word, then apply

Applying is an operator decision, so **wait for it**. Then:

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --apply --project-root "<root>"
```

- operations run in order and **stop at the first unresolved conflict**; everything applied before
  it stays applied, and the write-ahead journal in `_aiwf.migrationJournal` makes the next run
  resume from exactly that point;
- a conflict is raised **only when you edited** the artifact (`actual != local`) or it is GONE from
  the project; a payload change to an artifact you never touched is NOT a conflict - it is applied
  without a dialog and listed in the CHANGES report. When you ARE asked, the choice is
  **take-new** (apply the payload version) / **keep-mine** (keep yours; the payload version is only
  recorded, and the artifact is held from then on) / **merge** (you merge by hand and hand back the
  merged file);
- an artifact you hold through an override is never re-applied: the new render is recorded as
  upstream and the artifact is reported. You are asked about a held artifact only if you edited it
  again since;
- interactively the run asks. Scripted (CI, or a replayable run) pass
  `--resolution-file <json>` mapping `"<migration>/<opIndex>/<key>"` to a record:
  `{ "kind": "conflict", "resolution": "take-new" | "keep-mine" | "merge", "mergedFile": "<path>" }`
  (`mergedFile` exactly when the resolution is `merge`), or
  `{ "kind": "answer", "value": <json> }` for a new config key that asks a question. A missing or
  malformed record stops the run naming the address - nothing is ever guessed;
- if the process dies mid-run, just run it again: it resumes from the journal and replays the
  accepted result from the stage, so no question is asked twice.

Exit codes: 0 applied (or already current), 1 blocked (an invariant, a validation failure, or a stop
at a conflict), 2 could not start.

## Step 4 - Leaving an override, at any time

An artifact you kept through `keep-mine` is **never re-applied** by a later update: its new payload
render is recorded as upstream and reported in CHANGES. When you want it back on the payload version:

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --resolve "<key>" --project-root "<root>"
```

`<key>` is the managed key - `CLAUDE.md#aiwf-core`, `.claude/aiwf-native/roles.json`,
`.claude/agents/writer.md`, and the reviewer/qa agent files. No version bump is required.

## Step 5 - Self-check (the CLI already ran it), then report

You do not have to remember this step: an `--apply` that really applied migrations, and every
`--resolve`, **run the self-check themselves** as their last action, against the project they just
wrote, and report `self-check: PASS` with the child's own summary line. `--check`, `--dry-run` and an
"already current" run write nothing, so there is nothing for it to judge and it does not run.

- a **red** self-check makes the update exit **1** and says plainly that the migrations WERE applied
  and nothing was rolled back - the writes stand, the verdict is that the result is not consistent;
- a self-check that could not be started at all is **also** exit 1: "could not check" is never
  reported as "checked";
- `--no-selfcheck` skips it, and says so on one line.

`/pnp:selfcheck` is how you **re-run** it or inspect a failure in full - not a step the agent has to
remember after a write.

Report in `{{config.operator.language}}`, short: the version diff, what was applied, every conflict
you were actually asked about and how it was resolved, and the artifacts now held by the operator.
Read the per-artifact outcomes off the generated `CHANGES_<old>-to-<new>.md` at the project root
rather than restating them: each `rerender-managed-region` line there carries the artifact's final
state - `payload-current` (the payload version is what is on disk) or `held (your version kept)` -
and the report also lists the doctrine sections worth re-reading and the artifacts whose payload
version changed while you kept your own.

**This command never commits.** The diff goes through the normal review + commit gate, like any
other change.
