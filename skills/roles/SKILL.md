---
name: roles
description: Show and change the audit table - who reviews what, on which engine and model, with how many passes. Prints every role and the three review classes (plan, code, docs) on one screen; --set and --reset change them and re-render roles.json and the agent files, without a re-interview.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:roles - the audit table

Who audits what is **configuration**, not doctrine: `roles.*` and `review.plan|code|docs` in
`aiwf.config.json`. This command shows the whole picture on one screen and changes any of it with
one line - no re-interview, no hand-edited `roles.json`.

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
   That matters here more than elsewhere: an installation that predates the audit table has no
   `review.<class>` rows to show or set.
4. **Reading is not a shell job.** Read or inspect files with the Read/Grep/Glob tools - never
   `cat`/`grep`/`ls`/`head`/`node -e` through the shell for reading; the shell is for execution
   (tests, git, build).

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## The contract of the engine you are calling

`scripts/setup/aiwf-roles.mjs`. Three operations, one exit-code contract, and it writes nothing
until every decision is made.

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/aiwf-roles.mjs" --show `
  --project-root "<root>" --plugin-root "${CLAUDE_PLUGIN_ROOT}"

node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/aiwf-roles.mjs" `
  --set docs.engine=claude --project-root "<root>" --plugin-root "${CLAUDE_PLUGIN_ROOT}"

node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/aiwf-roles.mjs" --reset docs `
  --project-root "<root>" --plugin-root "${CLAUDE_PLUGIN_ROOT}"
```

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/aiwf-roles.mjs" --show \
  --project-root "<root>" --plugin-root "${CLAUDE_PLUGIN_ROOT}"
```

- `--set <target>.<field>=<value>`, more than one per run. `target` is
  `writer|reviewer|qa|qal|plan|code|docs`; `field` is `engine|model|effort|passes|enabled`.
  `passes` is an integer, `enabled` is exactly `true` or `false`.
- `--reset <plan|code|docs>` collapses a row back to `{ passes }` - the one way back to the
  Reviewer's own host.
- `--confirm-remove-stale` is required before a now-unused Claude agent file is deleted. **Ask the
  operator for an explicit word before passing it** - it is a destructive operation, and the run
  refuses without it and names the file.
- **Exit 0** = shown, or written. **Exit 1** = refused, and nothing was written. **Exit 2** = the
  run could not start, or the command line could not be understood.

### What it refuses, and why that is the feature

Every refusal ends the run with **zero writes**, including a run with several `--set` pairs where
only the last one is bad:

- a result the payload schema rejects (a `passes` outside its range, a Claude model that is not a
  tier alias);
- an artifact you **hold** through an override - `/pnp:update --resolve <key>` is that door;
- an artifact you **edited by hand** that is not already exactly the render this run wants;
- a file at an artifact's path that PromptAndPray never wrote and that differs from the render;
- a **stale** agent file without `--confirm-remove-stale`;
- `<row>.effort=` on a Claude row: every Claude-hosted review pass is dispatched through the ONE
  rendered `reviewer` agent, whose effort is `roles.reviewer.effort`, because the Agent tool has no
  per-invocation effort. Change `roles.reviewer.effort` instead;
- `<target>.engine=codex` with no model, when the Reviewer is not codex-hosted either - there is no
  safe guess at an external engine's model id.

`--set X.engine=claude` with no model fills in the **top tier** and prints that it did.

### The honest guarantee about writing

Phase 1 decides and validates everything and writes nothing. Phase 2 writes in a fixed order - agent
files, then `roles.json`, then `aiwf.config.json` (config and bookkeeping together, last). It is
**plan-before-write, not a transaction**: no journal, no rollback. If it is interrupted between two
files, an artifact is left with a stamp that is not yet updated; `/pnp:selfcheck` shows that as a
drifted managed artifact, and **running the same command again finishes it** - the file on disk
already is the render, so the run takes the already-applied branch and completes the stamp.

## How to read the table

```
role/class    host    model              effort  passes  notes
writer        claude  claude-opus-5[1m]  high    -       -
reviewer      codex   gpt-5.6-sol        high    -       -
qa            codex   gpt-5.6-sol        high    -       runtime/UI tickets only
qal           off     -                  -       -       operator-gated
plan          codex   gpt-5.6-sol        high    2       +1 with your word; fact-check before each pass
code (R2/R3)  codex   gpt-5.6-sol        high    1       correction rounds cap 2; fact-check before each pass
docs (R2)     codex   gpt-5.6-sol        high    1       fact-check before each pass
fact-check    claude  sonnet             -       always  not configurable
R1            -       -                  -       0       no auditor
```

- A row showing the Reviewer's host is **inherited**: it carries only `passes` in the config, and
  the whole host - engine, model and effort together - comes from `roles.reviewer`.
- `passes`: for `plan`, the readiness passes that run on the ticket's standing word (one MORE is
  always available with the operator's explicit word, so `passes + 1` is the hard maximum). For
  `code` and `docs`: `1` = one Reviewer pass, `2` = a second full pass after the first returns
  `pass`, `0` = no auditor. Correction rounds stay capped by `loop.correctionRoundsCap`.
- `(the Reviewer's)` after an effort means the row is Claude-hosted and shares the reviewer agent
  file; there is no per-row effort to set.
- `(below the top tier)` marks a Claude auditor whose model is not the top tier. It is printed for
  the Reviewer and for the review rows only - **QA is not marked**, because QA compares artifacts
  against acceptance criteria rather than auditing decisions, so a mid-tier QA is an ordinary
  choice.
- The **fact-check** row and the **R1** row are there so the picture is complete. Neither is
  configurable: the fact-check gate runs before every pass, over a diff or over a plan, and R1 has
  no auditor by definition.

## Step 1 - Report

Report in `{{config.operator.language}}`: print the table verbatim, then - if this run changed
something - the one-line list of what was written, and nothing else. On a refusal (exit 1), give the
refusal line as it came and the single action that resolves it. Never edit `roles.json` or an agent
file by hand to work around a refusal: they are rendered artifacts, and a hand edit there is a
managed-artifact conflict, not a second source.
