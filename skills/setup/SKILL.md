---
name: setup
description: Install PromptAndPray into this project - interview, dry-run preview, generate the project layer (config, roles, agents, the rendered Orchestrator role, overrides doc, managed CLAUDE.md region, permission rules), self-check, and print the memory seeds.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:setup - install (or re-interview) the project layer

You are the Orchestrator/COO. This skill creates **layer B** - the generated project layer - from
one interview. Everything it writes is either a managed artifact - rendered from the payload,
overwritten on every re-render, recorded with the plugin version that rendered it - or a file seeded
once and then owned by the operator forever (the overrides document, the transfer surface).

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
   Any non-zero exit means migrations are pending: **stop**
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
- **Files already at the managed paths** - `CLAUDE.md` with an `aiwf-core` region,
  `.claude/aiwf-native/roles.json`, `.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/agents/*.md`,
  the Codex auditor's `AGENTS.md` at the project root: setup **overwrites** them from the render and
  names each one in the report as `overwrote: <path>`. Nothing asks. If the operator wants to keep
  text from such a file, it goes into the overrides document, or into the file's
  `<!-- project additions -->` ... `<!-- /project additions -->` block (each marker on its own line,
  at most one block per rendered Markdown file) - every later render carries that block verbatim.
  Say this before the write when such files exist, so nothing is lost by surprise.

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

- a **claude**-hosted reviewer/qa takes a tier alias (`fable|opus|sonnet|haiku`) or an exact model
  id (e.g. `claude-opus-5-5`) as its model, exactly like the Writer: an alias is passed at dispatch,
  an exact id is pinned in the rendered agent's frontmatter and the dispatch omits `model`. A
  claude-hosted review row shares the ONE reviewer agent file, so it takes a tier alias or exactly
  the Reviewer's own model;
- `paths.plansDir` is the **parent** of `active/`, `archive/`, `drafts/` and `readiness/`; setup
  creates all four;
- `enforcement.dispatchGate` has exactly two values. `always` (the factory one) raises the Yes/No
  dialog on **every** Writer dispatch. `off-plan` raises it only when the brief's `Ticket: <REF>`
  line names no ticket in `<plansDir>/active/PLAN_*.md` or `active/<ABBR>/` - quieter, and it only
  means anything in a project that really keeps its plans there.

**The two path questions look at the project before they are answered** - the offered default first,
then whatever is typed - and each can print one warning line:

- `N existing plan(s) - PLAN_*.md or <ABBR>/ folders - in <plansDir>/active - Gate 2 off-plan will
  read them as active pnp plans; pick another paths.plansDir if they are not.` This is the whole
  reason the warning exists: in `off-plan` mode Gate 2 counts a ticket as planned when its `<REF>`
  appears in a `PLAN_*.md` file or an `<ABBR>/` plan folder under that directory, and it stays
  **silent** on a dispatch that names one. Pointed at a directory of somebody else's plans, the
  gate goes quiet on refs nobody in this loop ever approved - so an
  installation that inherits a full plans directory must be a deliberate answer rather than a
  default nobody looked at.
- `<overridesDoc> already exists - setup seeds that document once and never rewrites it ...` - the
  install is correct and writes nothing there, which is invisible unless it is said.
- `paths.plansDir` under the scratch directory - a plan canon there is outside git wherever the
  scratch directory is ignored (/pnp:review Step 2e); the generator repeats it as a note.

None is a blocker: all three describe a project an operator may want exactly as it is. The
existing-plans one is repeated by the generator as a `note` line in the plan and the report, so
`--dry-run` (Step 3) shows it too - including on the non-interactive `--answers-file` path, which
never sees the interview.

## Step 3 - Dry run, then generate

`--dry-run` prints the exact action list and writes nothing. Show it to the operator when the
project is not empty; on a fresh project, going straight to the write is fine.

Every managed artifact is written from the render - an edited file, a deleted one and a file the
installation has no record of alike; a file that was there before is listed as `overwrote: <path>`.
A rendered Markdown file keeps its project additions block verbatim. The generator plans everything
before it writes anything, so a blocked run leaves the project **exactly** as it was. It stops - and
writes nothing at all - when:

- a project additions block is malformed (one marker without the other, or two blocks): the run
  names the file, and nothing is guessed;
- a RECORDED stale render - a Claude agent file this installation rendered, next to a role that is
  now codex-hosted - and no `--confirm-remove-stale`: removing it is destructive, an operator
  decision exactly like any other delete, so without the flag the run stops with nothing written.

An UNRECORDED file at such a stale agent path is not a blocker: it is left untouched, named as
`left alone: <path> (not rendered by this configuration)`, and the run continues.

Text OUTSIDE the `aiwf-core` markers in `CLAUDE.md`, an existing overrides document (seeded once,
never rewritten), the transfer surface (seeded once) and foreign permission rules are never touched -
**byte for byte**, line endings included: a `CLAUDE.md` write splices the existing bytes and renders
only the region, in whichever convention (CRLF or LF) that file already uses.

## Step 4 - Self-check (the CLI already ran it)

You do not have to remember this step: a successful install that really wrote something **runs the
self-check itself** as its last action, against the project it just wrote, and reports
`self-check: PASS` with the child's own summary line.

- a **red** self-check makes the install exit **1** and says plainly that the files WERE written and
  nothing was rolled back - the writes stand, and the verdict is EITHER that the result is not
  consistent OR that this run **could not prove part of the contract in this environment** (a host
  the checks need was missing or unusable); the detail above the verdict says which;
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

Then print the **audit table** **verbatim** - the tool's literal output, not a retelling - so the
operator sees who will audit what before the first ticket. The interview asks no question about it,
and the three review classes arrive from the schema's own defaults (`plan` 2 passes, `code` 1,
`docs` 1, each inheriting the Reviewer's host):

```powershell
node "${CLAUDE_PLUGIN_ROOT}/scripts/setup/aiwf-roles.mjs" --show `
  --project-root "<root>" --plugin-root "${CLAUDE_PLUGIN_ROOT}"
```

Say in one line that `/pnp:roles` is how any of it is changed later - engine, model, effort and pass
count, without a re-interview.
