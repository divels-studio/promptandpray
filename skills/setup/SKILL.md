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
4. **Reading is not a shell job.** Read or inspect files with the Read/Grep/Glob tools - never
   `cat`/`grep`/`ls`/`head`/`node -e` through the shell for reading; the shell is for execution
   (tests, git, build).

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 1 - Preflight

- An existing installation: report it in one line (project name, installed version, roles) and ask
  whether the operator wants a re-interview or an update. Do not start asking questions unprompted.
- The OS channel: all three ship - `windows` renders the PowerShell wrappers
  (`scripts/native/ps/`), `linux` and `macos` the bash ones (`scripts/native/sh/`). The interview
  refuses anything outside those three fail-closed: an unknown channel would name wrappers that do
  not exist, and an installation this version cannot run is worse than a refusal.
- **A legacy AIWF surface without an installation** - files at the managed paths (`CLAUDE.md` with
  an `aiwf-core` region, `.claude/aiwf-native/roles.json`, `.claude/agents/*.md`) while
  `<root>/.claude/aiwf-native/aiwf.config.json` does not exist, or exists without an `_aiwf` block:
  offer **adopt** (`--adopt`) instead of telling the operator to move files aside. Say what it does,
  in these words:
  - a file **identical** to what the payload would render is adopted **silently and clean** - nothing
    is written, nothing is asked, and the bookkeeping simply starts recording it;
  - a file that **differs** is one question, per file, with two answers: **keep-mine** (the default
    bootstrap - not one byte of the operator's file is touched; the render is recorded as `upstream`
    and the artifact is held under `override`) or **take-new** (the render replaces it, recorded
    clean). There is deliberately no `merge` here: `/pnp:update --resolve <key>` reopens any adopted
    artifact later with the full vocabulary, merge included;
  - a decision **nobody can answer** stops the run with every address named and zero bytes written;
  - **nothing is ever deleted.** The run also prints an ADVISORY list of *possible superseded legacy
    files* - project files whose names match payload hooks, wrappers, docs or skills. It is a
    name match and nothing more: setup touches none of them, and removing any is a separate,
    operator-gated step, never part of the install.
  - adopt is for a project that has **no** installation. On a project that already has one, `--adopt`
    is refused in one line - re-deciding a recorded artifact is `/pnp:update --resolve <key>`.

## Step 2 - Interview

Run the interview. It asks only the keys with an operator character - project identity, OS channel,
operator language and role nicknames, the roles (engine / model / effort each), the correction-round
cap, the two enforcement gates, the VERIFY commands, the E2E surface, the paths, the
product-boundary lines - and offers every default from the schema, or from the installed config on a
re-run.

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/interview.mjs" --project-root "<root>"
```

Non-interactive (CI, or a scripted install): put the same answers in a JSON file and pass
`--answers-file <path>`. Both paths converge on the same generator, so a scripted install cannot
drift from an interactive one.

Three constraints worth stating before the operator answers:

- a **claude**-hosted reviewer/qa takes a TIER ALIAS as its model (`fable|opus|sonnet|haiku`) - a
  full model id is valid only for the Writer's own frontmatter;
- `paths.plansDir` is the **parent** of `active/` and `archive/`; setup creates both;
- `enforcement.dispatchGate` has exactly two values. `always` (the factory one) raises the Yes/No
  dialog on **every** Writer dispatch. `off-plan` raises it only when the brief's `Ticket: <REF>`
  line names no ticket in `<plansDir>/active/PLAN_*.md` - quieter, and it only means anything in a
  project that really keeps its plans there.

## Step 3 - Dry run, then generate

`--dry-run` prints the exact action list and writes nothing. Show it to the operator when the
project is not empty; on a fresh project, going straight to the write is fine.

The generator plans everything before it writes anything, so a blocked run leaves the project
**exactly** as it was. It stops - and writes nothing at all - when:

- a managed artifact was edited by hand (`actual != local`): a conflict, resolved by
  `/pnp:update --resolve <key>`, never by an overwrite here;
- a file it would manage already exists without bookkeeping **and this is not an adopt run**: setup
  never takes over a file it did not write by accident. With `--adopt` that same file becomes the
  decision described in Step 1 instead of a blocker - and an adopt decision that is left unanswered
  is itself a blocker, so no branch of adopt writes before every question has an answer;
- a stale Claude agent file sits next to a role that is now codex-hosted. Removing it is
  destructive, so it needs `--confirm-remove-stale` - which is an operator decision, exactly like
  any other delete. `--adopt` does not touch this case: the configuration renders nothing at that
  path, so there is nothing to take ownership of.

Text OUTSIDE the `aiwf-core` markers in `CLAUDE.md`, an existing overrides document, and foreign
permission rules are never touched in any branch, adopt included - **byte for byte**, line endings
included: a `CLAUDE.md` write splices the existing bytes and renders only the region, in whichever
convention (CRLF or LF) that file already uses.

Adopt, non-interactively (CI, or a scripted migration) - the file maps an artifact key to one of the
two words, and an address nobody asked about is refused by name rather than ignored:

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/interview.mjs" --project-root "<root>" `
  --answers-file <answers.json> --adopt --adopt-file <adopt.json>
```

```json
{ ".claude/aiwf-native/roles.json": "keep-mine", "CLAUDE.md#aiwf-core": "take-new" }
```

`--adopt --dry-run` never asks: it prints the classification with a preview of both sides, marks
every pending decision and writes nothing. That is the run to show the operator first.

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

Then print the **audit table**, so the operator sees who will audit what before the first ticket -
the interview asks no question about it, and the three review classes arrive from the schema's own
defaults (`plan` 2 passes, `code` 1, `docs` 1, each inheriting the Reviewer's host):

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/aiwf-roles.mjs" --show `
  --project-root "<root>" --plugin-root "${CLAUDE_PLUGIN_ROOT}"
```

Say in one line that `/pnp:roles` is how any of it is changed later - engine, model, effort and pass
count, without a re-interview.
