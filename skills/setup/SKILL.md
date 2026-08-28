---
name: setup
description: Install PromptAndPray into this project - interview, dry-run preview, generate the project layer (config, roles, agents, overrides doc, managed CLAUDE.md region, permission rules), self-check, and print the memory seeds.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:setup - install (or re-interview) the project layer

You are the Orchestrator/COO. This skill creates **layer B** - the generated project layer - from
one interview. Everything it writes is either a managed artifact with hash bookkeeping or a file
seeded once and then owned by the operator forever.

## Step 0 - Project context (mandatory for every `/pnp:*` skill)

1. **Resolve the project root.** Run `git rev-parse --show-toplevel`. If that fails (not a git
   worktree), the operator must pass the root explicitly (`--project-root`). If neither resolves,
   stop and say so - no skill guesses a root. `<root>` below means this path.
2. **Read the config.** `<root>/.claude/aiwf-native/aiwf.config.json`. **This skill is the one
   documented exception to the "stop when it is missing" rule**: a missing config is the NORMAL
   fresh-install path - it is what this skill creates. If the file EXISTS, this is a re-interview:
   say so in one line, offer `/pnp:update` for a version change, and continue only if the operator
   wants to change answers.
3. **Version interlock.** With an existing config, run
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/update/aiwf-update.mjs" --check --project-root "<root>"`.
   Any non-zero exit means migrations are pending (or an interrupted update is in flight): **stop**
   and point the operator at `/pnp:update` - a re-interview over an out-of-date project would
   re-render artifacts the pending migrations are about to touch. On a fresh install there is no
   config and nothing to check.

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 1 - Preflight

- An existing installation: report it in one line (project name, installed version, roles) and ask
  whether the operator wants a re-interview or an update. Do not start asking questions unprompted.
- The OS channel: all three ship - `windows` renders the PowerShell wrappers
  (`scripts/native/ps/`), `linux` and `macos` the bash ones (`scripts/native/sh/`). The interview
  refuses anything outside those three fail-closed: an unknown channel would name wrappers that do
  not exist, and an installation this version cannot run is worse than a refusal.

## Step 2 - Interview

Run the interview. It asks only the keys with an operator character - project identity, OS channel,
operator language and role nicknames, the roles (engine / model / effort each), the VERIFY commands,
the E2E surface, the paths, the product-boundary lines - and offers every default from the schema,
or from the installed config on a re-run.

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/interview.mjs" --project-root "<root>"
```

Non-interactive (CI, or a scripted install): put the same answers in a JSON file and pass
`--answers-file <path>`. Both paths converge on the same generator, so a scripted install cannot
drift from an interactive one.

Two constraints worth stating before the operator answers:

- a **claude**-hosted reviewer/qa takes a TIER ALIAS as its model (`fable|opus|sonnet|haiku`) - a
  full model id is valid only for the Writer's own frontmatter;
- `paths.plansDir` is the **parent** of `active/` and `archive/`; setup creates both.

## Step 3 - Dry run, then generate

`--dry-run` prints the exact action list and writes nothing. Show it to the operator when the
project is not empty; on a fresh project, going straight to the write is fine.

The generator plans everything before it writes anything, so a blocked run leaves the project
**exactly** as it was. It stops - and writes nothing at all - when:

- a managed artifact was edited by hand (`actual != local`): a conflict, resolved by
  `/pnp:update --resolve <key>`, never by an overwrite here;
- a file it would manage already exists without bookkeeping: setup does not adopt files it did not
  write;
- a stale Claude agent file sits next to a role that is now codex-hosted. Removing it is
  destructive, so it needs `--confirm-remove-stale` - which is an operator decision, exactly like
  any other delete.

Text OUTSIDE the `aiwf-core` markers in `CLAUDE.md`, an existing overrides document, and foreign
permission rules are never touched in any branch.

## Step 4 - Self-check (the CLI already ran it)

You do not have to remember this step: a successful install that really wrote something **runs the
self-check itself** as its last action, against the project it just wrote, and reports
`self-check: PASS` with the child's own summary line.

- a **red** self-check makes the install exit **1** and says plainly that the files WERE written and
  nothing was rolled back - the writes stand, the verdict is that the result is not consistent;
- a self-check that could not be started at all is **also** exit 1: "could not check" is never
  reported as "checked";
- `--no-selfcheck` skips it, and says so on one line.

`/pnp:selfcheck` is how you **re-run** it or inspect a failure in full - not a step the agent has to
remember after a write.

## Step 5 - Report, and the memory seeds

Report in `{{config.operator.language}}`, short: what was created, what was skipped and why, and the
one thing the operator must do by hand - fill in the placeholders in
`{{config.paths.overridesDoc}}`, which is the project's identity and hard rules and is the file every
role reads before starting work.

The **memory seeds** the run printed are for the operator's own memory tool. They are printed, never
written: the store's format and location are machine-local, and the plugin does not assume them.
