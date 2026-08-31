---
name: review
description: Run the Reviewer (engine-neutral - Codex or Claude per roles.json) over the current working diff, or over a durable plan in plan-readiness mode. Read-only; returns pass / pass-with-notes / fail.
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# /pnp:review - Code Reviewer (engine-neutral)

Adversarial, **read-only** code/design review of the Writer's diff. The Reviewer role is
**engine-neutral**: its host is data in the project's `.claude/aiwf-native/roles.json`, resolved by
the plugin's role resolver - `scripts/native/ps/aiwf-roles.ps1` on os `windows`,
`scripts/native/sh/aiwf-roles.sh` on os `linux`/`macos` (`{{config.os}}`, read in Step 0, decides
which; the two channels have the same CLI contract and the same exit codes). This skill resolves the
host once and dispatches one of two branches:

- **engine `codex`** -> the canonical wrapper for this OS channel,
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1` or
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-review.sh` (`docs/CODEX_REVIEW_QA_RECIPE.md`) -
  read-only by a **hard OS `--sandbox read-only` cell**; the wrapper locks the flags and takes the
  brief on stdin.
- **engine `claude`** -> the `reviewer` subagent via the **Agent tool** (the project's rendered
  reviewer agent) - read-only by a `Read/Grep/Glob`-only tool allowlist. **Gate 1 catches the
  Edit/Write family; the Claude review path is tool-availability + convention + git reversibility,
  with NO OS cell; the hard OS boundary applies only on the codex read-only path.**

Either way the Reviewer reports; it never edits, commits, or pushes.

Arguments: the ticket ref and an optional scope hint.

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
4. **Reading is not a shell job.** Read or inspect files with the Read/Grep/Glob tools - never
   `cat`/`grep`/`ls`/`head`/`node -e` through the shell for reading; the shell is for execution
   (tests, git, build).

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 0b - Resolve the reviewer host (run the resolver once)

Run the channel `{{config.os}}` selects. Both print the same snapshot object.

**os `windows`:**

```powershell
$role = pwsh -NoProfile -File "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/aiwf-roles.ps1" `
  -Role reviewer -RolesPath "<root>/.claude/aiwf-native/roles.json" -AsJson | ConvertFrom-Json
# $role.engine -> 'codex' or 'claude';  $role.model -> the model to use on that engine
```

**os `linux` / `macos`:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/aiwf-roles.sh" \
  --role reviewer --roles-path "<root>/.claude/aiwf-native/roles.json" --as-json
# prints one JSON object: {"role":..,"engine":..,"model":..,"effort":..} - read the fields from it
```

`-RolesPath` / `--roles-path` is mandatory: the plugin payload has no project of its own, so the
path is built from the root resolved in Step 0. If the resolver exits non-zero (exit 2), it printed the reason to
stderr - stop and report the misconfiguration to the COO; do not guess a host. `$role.engine`
selects the branch below; `$role.model` is the model that branch runs.

## Step 0c - Engine by ticket class (the class can override the configured host)

Read the `Class:` line of the ticket brief the COO authored - `Class: docs | code`, and **`code`
when the line is absent**. It decides the host together with Step 0b, and it applies to
**implementation diffs only**:

- **`Class: docs`** - plans, the overrides document, README, skill/doc prose, any diff with **no
  executable artifact** in it - takes the **Claude host** (Step 3, claude branch) regardless of
  `roles.reviewer.engine`. Prose is judged by reading the tree, and a paid external pass buys
  nothing here that the Claude host does not already give.
- **`Class: code`** - anything that runs, is imported, or is tested - uses the engine Step 0b
  resolved.

**What "the Claude host" means on a codex-configured install:** `/pnp:setup` renders
`.claude/agents/reviewer.md` only when `roles.reviewer.engine` is `claude` - that is by design and
stays so - so when this override selects the Claude host while Step 0b resolved `codex` there is no
rendered `reviewer` agent to dispatch (and `$role.model` is a Codex model name the Agent tool would
reject); the host is then an **ad-hoc read-only Claude subagent** -
`subagent_type: "general-purpose"`, `model: "opus"`, brief prefixed with the read-only reviewer
preamble in Step 3's claude branch.

A plan-readiness pass is NOT an implementation diff and never takes this override: it always runs on
the configured engine Step 0b resolved. Readiness is where a missed blocker costs a whole ticket, and
this project's readiness blockers have been found there; a Claude ad-hoc pass may be run first as a
cheap pre-pass, WITHOUT a verdict, exactly like the fact-check gate, but it never replaces the pass
on the configured engine.

Say in one line which branch you took and why (`class=docs -> claude host (engine codex
overridden)`, or `plan-readiness -> configured engine (no class override)`), so the COO's record
shows the engine was chosen, not defaulted. A docs-class ticket
that gained an executable artifact is code class - the same rule that ends R1
(`docs/WORKFLOW.md` § Routes).

## Step 1 - Gather the review scope (read-only)

- Confirm the branch and tree state you intend to review. Run git **bare** from `<root>` (which is
  the session's cwd): `git rev-parse --abbrev-ref HEAD` and `git status --short`.
- Capture the diff (working diff by default; a named base/paths if the scope hint says so), e.g.
  `git diff` (+ `--cached`) or `git diff <base>...HEAD`.
- **Plan-readiness variant:** for a plan-readiness check (a durable R2/R3 **plan** before
  implementation - see "Plan-readiness mode"), the scope is the **whole plan document + the repo
  prerequisites it claims**, not a diff.
- Do **not** modify anything; this is a read/review step.

## Step 2 - Build the brief

Fill this template (implementation-diff review). **Risk threshold** and **stop condition** are
mandatory (without them the Reviewer can loop forever) - take them from the ticket brief the COO
authored. **For a plan-readiness check, use the readiness brief shape below instead.**

```
Review the diff for ticket <TICKET_REF> on branch <branch>.

Class: docs | code
  (the COO fills this in - `code` is the default when the line is absent; it selects the host in
  Step 0c and it is what "an executable artifact ends docs class" is judged against)

SCOPE / DIFF:
<the exact diff or a precise description of the files+ranges to review>
  - codex branch: you MAY paste the diff OR name the git command that reproduces it (Codex runs
    read-only in the repo and can reproduce it).
  - claude branch: you MUST paste the FULL diff here - the Claude reviewer has only Read/Grep/Glob
    and cannot run git, so the "name the git command" shortcut is codex-branch-only.

RISK THRESHOLD: <which defect severity blocks - e.g. "block on correctness/security/data-loss;
note-only for style">
STOP CONDITION: <when you have enough evidence and must stop - e.g. "stop once every changed
file is reviewed against the acceptance criteria; do not propose redesigns">
BUDGET TARGET: keep the brief dense and return ALL material blockers in ONE round - aim for a
single round. (This is a throughput target only; it does NOT change the authority minimums -
the correction-round cap and the two-pass plan-readiness contract are unchanged.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not
raise a blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review checklist at <absolute path to the plugin's docs/REVIEW_CHECKLIST.md> -
  `PASS`/`NEEDS-FIX` is reserved for plan-readiness only).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with
                          file:line and why it blocks), then non-blocking notes, then the exact
                          next action.
  Do not fix anything - you are read-only. Report only.
```

Substitute the checklist path when you write the brief: the Reviewer runs outside this session and
cannot expand `${CLAUDE_PLUGIN_ROOT}` itself, so paste the resolved absolute path.

## Step 2b - Fact-check gate before a paid pass

**Before dispatching to a paid external engine (the codex branch), the COO runs ONE cheap
read-only scan agent over the PROSE of the diff.** A pass on a paid engine is an operator quota
gate, and the Reviewer's job is to verify DECISIONS - not to discover that a path, a line number,
a count or a command in the text does not exist. Those are checkable by anything that can read the
tree, and finding them at review price is the most expensive way to find them
(`docs/WORKFLOW.md` § "COO-authored text is reviewed like the Writer's").

Dispatch it with the **Agent tool**, `subagent_type: "Explore"` (or whichever read-only scan agent
this harness ships), `model: sonnet`, and exactly this task - written here so it is reusable
verbatim:

```
Verify every factual claim in the prose of this diff - path, line number, count, command,
engine/hook behavior - against the tree as it is now. Return ONLY the list of claims that are
FALSE or UNVERIFIABLE, each with file:line and the correct value. No verdict, no review, no
suggestions, no summary of what is correct.

DIFF:
<the same diff the review brief carries>
```

Then: the COO fixes every returned claim, and **only then** dispatches the paid pass, over the
corrected tree. The gate is skipped only when Step 0c resolved the claude branch (there is no paid
pass to protect) - and even then it is cheap enough to be worth running on a prose-heavy diff.

The fact-check agent is **not** a review: it returns no verdict, and it never replaces the
Reviewer's pass.

## Plan-readiness mode (durable R2/R3 plans, before execution)

If the brief is a **plan-readiness** check - reviewing a durable R2/R3 **plan** *before*
implementation, not a code diff - the contract is different:

- **Host:** the engine Step 0b resolved, always - the Step 0c class override is for implementation
  diffs and does not reach here. A Claude ad-hoc pre-pass before pass 1 is allowed, but it returns no
  verdict and does not count as a pass.
- **Step 1 scope** is the whole plan + repo prerequisites, not a diff.
- **Brief:** name the plan file + branch, still carry the ticket **risk threshold** and **stop
  condition** (and the BUDGET TARGET line), and set the OUTPUT CONTRACT verdict to
  `PASS` / `NEEDS-FIX`.
- **One invocation = ONE pass.** Pass 2 is a **separate** `/pnp:review` invocation *after the COO
  revises the plan*. A pass 3 runs only if blockers remain **and** the operator gives explicit
  permission, requested BEFORE the dispatch - any review pass beyond the standard two is a
  budget/limits-gated operator decision, whatever engine hosts the Reviewer. Three passes are the
  hard maximum (`docs/WORKFLOW.md`); if the plan still does not pass, stop and return the unresolved
  blockers to the operator. This skill does not loop the passes itself.
- Each pass reads the **whole plan** and returns all material blockers at once - check repo-match,
  scope, hidden discovery/architecture, dependency order, real acceptance/verification, and
  branch/worktree/Git prerequisites.
- The verdict is exactly **`PASS`** or **`NEEDS-FIX`** (not `pass`/`pass-with-notes`/`fail`).
- read-only: report to the COO; do not edit the plan.

The implementation-review contract above is unchanged; this branch applies only to plan readiness.

## Step 3 - Dispatch on the resolved engine

### Step 3 - codex branch (`$role.engine -eq 'codex'`) - invoke the wrapper (prompt via STDIN)

Deliver the brief to the wrapper on **stdin** - never as a positional/argv argument. The wrapper
reads the model from the resolver itself, so no model is passed here.

**Write the brief to the fixed path `<root>/{{config.paths.scratchDir}}/review-brief.txt`** (Write
tool), then invoke the wrapper of this project's OS channel (`{{config.os}}`) with exactly that
command, character for character:

**os `windows`:**

```powershell
Get-Content '<root>/{{config.paths.scratchDir}}/review-brief.txt' -Raw | `
  & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1" -ProjectRoot '<root>'
```

**os `linux` / `macos`:**

```bash
cat '<root>/{{config.paths.scratchDir}}/review-brief.txt' \
  | bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-review.sh" --project-root '<root>'
```

The path is fixed **on purpose**. A permission rule can only match a constant command string, so an
invocation whose text changes every time - an inline here-string carrying the brief, or a
session-scoped scratchpad path - must prompt the operator on every single dispatch and can never be
allowlisted. Holding the brief in a file at a constant path is what makes the command constant.
`<root>` and the plugin root are constants *for this project*, so the whole command text is stable
across sessions, tickets and correction rounds. Do not inline the brief into the command, and do
not "improve" the path by making it unique per session or per ticket: either change silently
reintroduces a dialog on every review.

The brief must never be empty - an empty brief makes the wrapper exit 2. Write the file first, then
invoke.

`{{config.paths.scratchDir}}` is gitignored, so the brief never enters a commit. Never delete the
file afterwards - `rm` is an `ask` rule and cleanup would pop the very dialog this arrangement
removes. The next dispatch overwrites it, and keeping it lets a correction round re-dispatch
without retransmitting the brief.

Two sessions dispatching a Reviewer in the same second would overwrite each other's brief. That is
an accepted, visible failure mode: a re-dispatch, not a silent wrong verdict.

**Run the wrapper in the BACKGROUND - `run_in_background: true`. This is the default, not an
optimisation.** A foreground shell call is capped at 10 minutes; an external review engine at
`effort: high` on a real diff routinely runs longer and is killed mid-reasoning (exit 143). The
pass is then lost *and already paid for* - passes on a paid external engine are an **operator quota
gate**, so a timeout kill spends the operator's budget and returns no verdict. Background runs carry
no such cap and the harness notifies you on completion. Never re-run a timed-out pass in the
foreground hoping it will fit this time.

The block of this project's OS channel is the **only canonical wrapper-invocation path**: on os
`windows` the PowerShell one, on os `linux`/`macos` the bash one. Run it in that shell - from a
foreign shell, start an interactive `pwsh` (or `bash`) session, or put the block in a script file,
and run it there; do not inline it through another shell's quoting. The two channels are mirrors,
not alternatives: never invoke the `.sh` wrapper on a windows install or the `.ps1` on a POSIX one.

### Step 3 - claude branch - dispatch a read-only Claude reviewer

This branch runs in **two** cases: Step 0b resolved `$role.engine -eq 'claude'`, **or** Step 0c
selected the Claude host for a `docs`-class ticket on a codex-configured install. Either way, invoke
the **Agent tool** with the completed Step-2 brief as the task and the **FULL diff pasted in** (the
Claude reviewer cannot run git). *Which* agent and *which* model you pass depends on the engine
Step 0b resolved, because the rendered `reviewer` agent file exists only on a claude-configured
install:

**Resolved engine `claude`** - `subagent_type: "reviewer"`, `model: <$role.model>`. The rendered
subagent is read-only (`Read, Grep, Glob` only; Gate 1 blocks any Edit/Write) and carries its effort
in its own frontmatter. Nothing else changes.

**Resolved engine `codex`, class `docs`** (the Step 0c override) - there is no rendered `reviewer`
agent, and `$role.model` names a Codex model the Agent tool's model enum would reject. Dispatch
`subagent_type: "general-purpose"` with `model: "opus"` - a review is judgment work, not a scan, so
the scan-tier model policy (`haiku`/`sonnet`) does not apply to it - and prefix the Step-2 brief with
exactly this role preamble, so the ad-hoc agent has the role the rendered one gets from its
frontmatter:

```
You are a read-only, adversarial code/design REVIEWER. Use ONLY the Read, Grep and Glob tools:
never edit, write, stage, commit, push, or run anything - report only, you do not fix what you
find. Judge the diff below against the review checklist at <absolute path to the plugin's
docs/REVIEW_CHECKLIST.md> and return the verdict in exactly the shape the OUTPUT CONTRACT
specifies - first line `pass` / `pass-with-notes` / `fail` (or `PASS` / `NEEDS-FIX` for a
plan-readiness pass), blockers first with file:line, then notes.
```

Read-only on this fallback is **Gate 1** - which denies the Edit/Write family to every subagent whose
`agent_type` is not `writer` - plus the preamble above and git reversibility. It is one notch weaker
than the rendered agent, which is additionally confined by a `Read, Grep, Glob` tool allowlist (Gate
1's own honest limit is that a mutation performed through Bash is not caught), and both are far
weaker than the codex branch's OS cell. That is why this fallback is scoped to `docs`-class diffs.

**Effort (Claude branch):** the Agent tool has **no per-invocation `effort` parameter**, so the
reviewer's reasoning effort comes from its **agent frontmatter** (`effort:` in the rendered
`reviewer` agent), which is kept in sync with `roles.json`'s `reviewer.effort` - the selfcheck
engine asserts they match, and drift fails it. Pass only the `model` above; do **not** try to pass
`effort` to the Agent tool. The `general-purpose` fallback has no such frontmatter, so it runs at the
session default effort - accepted, because that path carries prose only.

## Step 4 - Relay the verdict to the COO

Return the Reviewer's `pass` / `pass-with-notes` / `fail` verdict and its blockers verbatim to the
COO (for a **plan-readiness** pass, relay `PASS` / `NEEDS-FIX` instead). Do not act on the findings
yourself - routing corrections back to the Writer (within the correction-round cap), scheduling the
next readiness pass, and any commit gate are the COO's calls, not this skill's.
