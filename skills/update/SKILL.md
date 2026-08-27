---
name: update
description: Bring this project up to the installed plugin version - version diff, dry-run preview, ordered migration with a write-ahead journal, conflict dialogs (take-new / keep-mine / merge), a CHANGES report, and a self-check. Never overwrites your own content and never commits.
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
stage. A dry run never prompts: where an operation needs a decision it stops there and names the
address, because that decision IS what a preview exists to surface. Show the operator:

- the version diff and the operations per migration;
- every artifact that will be re-rendered, and every one that will raise a conflict.

## Step 3 - The operator's word, then apply

Applying is an operator decision, so **wait for it**. Then:

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --apply --project-root "<root>"
```

- operations run in order and **stop at the first unresolved conflict**; everything applied before
  it stays applied, and the write-ahead journal in `_aiwf.migrationJournal` makes the next run
  resume from exactly that point;
- a conflict is raised when **either** predicate holds: you edited the artifact (`actual != local`)
  **or** the payload changed it (`newRender != upstream`). The choice is
  **take-new** (apply the payload version) / **keep-mine** (keep yours; the payload version is only
  recorded, and the artifact is held from then on) / **merge** (you merge by hand and hand back the
  merged file);
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

## Step 5 - Self-check, then report

Run `/pnp:selfcheck` against the project. A green self-check is what turns "files were written" into
"the installation is consistent".

Report in `{{config.operator.language}}`, short: the version diff, what was applied, every conflict
and how it was resolved, and the artifacts now held by the operator. Point at the generated
`CHANGES_<old>-to-<new>.md` at the project root - it lists the doctrine sections worth re-reading
and the artifacts whose payload version changed while you kept your own.

**This command never commits.** The diff goes through the normal review + commit gate, like any
other change.
