---
name: review
description: Run the Reviewer (engine-neutral - Codex or Claude per roles.json) over the current working diff, or over a durable plan in plan-readiness mode. Read-only; returns pass / pass-with-notes / fail.
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# /pnp:review - Code Reviewer (engine-neutral)

Adversarial, **read-only** code/design review of the Writer's diff. The Reviewer role is
**engine-neutral**: its host is data in the project's `.claude/aiwf-native/roles.json`, resolved by
the plugin's `scripts/native/ps/aiwf-roles.ps1`. This skill resolves the host once and dispatches
one of two branches:

- **engine `codex`** -> the canonical wrapper
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1` (`docs/CODEX_REVIEW_QA_RECIPE.md`) -
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
3. **Version interlock.** Compare the payload version with `_aiwf.installedPluginVersion` and point
   at `/pnp:update` if there are unapplied migrations. This step is DOCUMENTED here but **enforced
   from v0.2**, when the migration runner ships - do not simulate the check before then.

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 0b - Resolve the reviewer host (run the resolver once)

```powershell
$role = pwsh -NoProfile -File "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/aiwf-roles.ps1" `
  -Role reviewer -RolesPath "<root>/.claude/aiwf-native/roles.json" -AsJson | ConvertFrom-Json
# $role.engine -> 'codex' or 'claude';  $role.model -> the model to use on that engine
```

`-RolesPath` is mandatory: the plugin payload has no project of its own, so the path is built from
the root resolved in Step 0. If the resolver exits non-zero (exit 2), it printed the reason to
stderr - stop and report the misconfiguration to the COO; do not guess a host. `$role.engine`
selects the branch below; `$role.model` is the model that branch runs.

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

## Plan-readiness mode (durable R2/R3 plans, before execution)

If the brief is a **plan-readiness** check - reviewing a durable R2/R3 **plan** *before*
implementation, not a code diff - the contract is different:

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
tool), then invoke the wrapper with exactly this command, character for character:

```powershell
Get-Content '<root>/{{config.paths.scratchDir}}/review-brief.txt' -Raw | `
  & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1" -ProjectRoot '<root>'
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

The PowerShell block above is the **only canonical wrapper-invocation path**. From a non-PowerShell
shell, start an interactive `pwsh` session (or put the block in a PowerShell script file) and run
the block there - do not inline it through another shell's quoting.

### Step 3 - claude branch (`$role.engine -eq 'claude'`) - dispatch the reviewer subagent

Invoke the **Agent tool** with `subagent_type: "reviewer"`, `model: <$role.model>`, and the
completed Step-2 brief as the task - with the **FULL diff pasted in** (the Claude reviewer cannot
run git). The subagent is read-only (`Read, Grep, Glob` only; Gate 1 blocks any Edit/Write). It
returns the verdict; it never edits.

**Effort (Claude branch):** the Agent tool has **no per-invocation `effort` parameter**, so the
reviewer's reasoning effort comes from its **agent frontmatter** (`effort:` in the rendered
`reviewer` agent), which is kept in sync with `roles.json`'s `reviewer.effort` - the selfcheck
engine asserts they match, and drift fails it. Pass only `model: <$role.model>`; do **not** try to
pass `effort` to the Agent tool.

## Step 4 - Relay the verdict to the COO

Return the Reviewer's `pass` / `pass-with-notes` / `fail` verdict and its blockers verbatim to the
COO (for a **plan-readiness** pass, relay `PASS` / `NEEDS-FIX` instead). Do not act on the findings
yourself - routing corrections back to the Writer (within the correction-round cap), scheduling the
next readiness pass, and any commit gate are the COO's calls, not this skill's.
