---
name: review
description: Run the Reviewer (engine-neutral - Codex or Claude per roles.json) over the current working diff, or over a durable plan in plan-readiness mode. Read-only; returns pass / pass-with-notes / fail.
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# /pnp:review - Code Reviewer (engine-neutral)

Adversarial, **read-only** code/design review of the Writer's diff. The Reviewer role is
**engine-neutral**: its host is data in the project's `.claude/aiwf-native/roles.json` - the
**audit table**, one row per review class - resolved by the plugin's role resolver -
`scripts/native/ps/aiwf-roles.ps1` on os `windows`,
`scripts/native/sh/aiwf-roles.sh` on os `linux`/`macos` (`{{config.os}}`, read in Step 0, decides
which; the two channels have the same CLI contract and the same exit codes). This skill resolves the
row for the ticket's class once and dispatches one of two branches:

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

## Step 0b - Resolve the row for this ticket's review class (run the resolver once)

Two reads, one command. **First** take the `Class:` line of the ticket brief the COO authored -
`Class: plan | code | docs`, and **`code` when the line is absent** (Step 0c says what each class
covers). **Then** run the channel `{{config.os}}` selects, passing that class: the resolver returns
the audit table's effective row - engine, model, effort and `passes` - for that class alone. Both
channels print the same snapshot object.

**os `windows`:**

```powershell
$row = pwsh -NoProfile -File "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/aiwf-roles.ps1" `
  -Role reviewer -Class <class> -RolesPath "<root>/.claude/aiwf-native/roles.json" -AsJson `
  | ConvertFrom-Json
# $row.engine -> 'codex' or 'claude';  $row.model -> the model that engine runs;
# $row.passes -> how many passes this class gets on the ticket's standing word
```

**os `linux` / `macos`:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/aiwf-roles.sh" \
  --role reviewer --class <class> --roles-path "<root>/.claude/aiwf-native/roles.json" --as-json
# prints one JSON object, whose fields you read:
# {"role":"reviewer","class":..,"engine":..,"model":..,"effort":..,"passes":..}
```

`-RolesPath` / `--roles-path` is mandatory: the plugin payload has no project of its own, so the
path is built from the root resolved in Step 0.

`-Class` / `--class` is a **reviewer-only** flag, and it is judged on being PASSED rather than on
its value - an empty string is an error, not a quiet fall-back to the classless form, which is a
different contract with a different output. The resolver prints one line to stderr and exits **2**
when the class is not one of `plan|code|docs`, when it is combined with another role, and when the
project's `roles.json` carries no `review.<class>` record - that last one naming `/pnp:update`,
because a `roles.json` rendered before the audit table is an installation one update behind, not a
row to guess at. On any non-zero exit, stop and report the misconfiguration to the COO; do not guess
a host. The one exception is a MISSING `roles.json`: the resolver returns the factory fallback
(`claude` / `opus` / `high`) with the factory pass count and exits 0 - a broken installation running
read-only on Claude, never a paid engine nobody chose.

`$row.engine` selects the branch in Step 3; `$row.model` is the model that branch runs.

## Step 0c - What the class selects (a configuration you can see, not a rule)

The class names a ROW of the **audit table** - `review.plan`, `review.code`, `review.docs` in
`aiwf.config.json`, rendered into `roles.json` - and the row carries the host and the pass count.
Nothing in this skill hardcodes which engine audits what: `/pnp:roles` prints the whole table and
changes it.

- **`Class: code`** - anything that runs, is imported, or is tested. Row `review.code`.
- **`Class: docs`** - the overrides document, README, skill/doc prose, any implementation diff with
  **no executable artifact** in it. Row `review.docs`. It starts out inheriting the same auditor as
  `review.code`: "a docs-class diff goes to a Claude host" is a value the operator can read and
  change, not a rule this document carries.
- **`Class: plan`** - a plan-readiness pass over a durable R2/R3 plan before implementation. Row
  `review.plan`, whose `passes` IS the readiness contract (see "Plan-readiness mode").

`$row.passes` is how many passes that class gets on the ticket's standing word. For `code` and
`docs`: `1` = one Reviewer pass (the factory value); `2` = a second full pass after the first
returns `pass`, dispatched by the COO on the same standing word; `0` = **no auditor** - the COO
reviews first-hand and the fact-check gate still runs. `/pnp:roles --show` prints a zero row as
`no auditor`, so it can never be a silent omission. For `plan`, see "Plan-readiness mode".

Say in one line which row you took and where it came from (`class=docs -> review.docs: codex
gpt-5.6-sol/high, 1 pass`), so the COO's record shows the host was resolved, not defaulted. A
docs-class ticket that gained an executable artifact is code class - the same rule that ends R1
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

Class: plan | code | docs
  (the COO fills this in - `code` is the default when the line is absent; it names the row of the
  audit table that Step 0b resolves, and it is what "an executable artifact ends docs class" is
  judged against)

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
the correction-round cap and the `review.plan.passes` readiness contract are unchanged.)

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

## Step 2b - Fact-check gate before every pass above the scan tier

**Before dispatching any reviewer pass whose model is above the scan tier - a codex pass, or a
claude reviewer on `opus`/`fable` - the COO runs ONE cheap read-only scan agent over the PROSE of
the diff.** Such a pass costs the operator either external quota or top-tier tokens, and the
Reviewer's job is to verify DECISIONS - not to discover that a path, a line number,
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

**Over a plan, this is the same gate with the plan document in place of the diff** - one rule, not
two: fact-check before every pass above the scan tier, over a diff or over a plan. There is no
second, plan-only variant of this step, and for a readiness pass the task carries one extra line -
`every acceptance command exists and can fail`.

Then: the COO fixes every returned claim, and **only then** dispatches the pass, over the
corrected tree. The gate may be skipped only when the reviewer itself runs on a scan-tier model
(`haiku`/`sonnet`) - there is nothing more expensive than the gate to protect - and even then it is
cheap enough to be worth running on a prose-heavy diff.

The fact-check agent is **not** a review: it returns no verdict, and it never replaces the
Reviewer's pass.

## Plan-readiness mode (durable R2/R3 plans, before execution)

If the brief is a **plan-readiness** check - reviewing a durable R2/R3 **plan** *before*
implementation, not a code diff - the contract is different:

- **Host:** the `review.plan` row - Step 0b resolved it with `-Class plan`. It is a row like any
  other: which engine and model audits plans is what `/pnp:roles` shows and changes. What is NOT
  configurable is that the Planner/COO never approves its own plan, and that the fact-check gate
  runs before every one of these passes above the scan tier (Step 2b - skipped only when the
  reviewer itself runs on a scan-tier model).
- **Step 1 scope** is the whole plan + repo prerequisites, not a diff.
- **Brief:** name the plan file + branch, still carry the ticket **risk threshold** and **stop
  condition** (and the BUDGET TARGET line), and set the OUTPUT CONTRACT verdict to
  `PASS` / `NEEDS-FIX`.
- **One invocation = ONE pass.** The next pass is a **separate** `/pnp:review` invocation *after the
  COO revises the plan*. `$row.passes` is how many passes this project's plans get on the ticket's
  standing word (factory 2). One MORE runs only if blockers remain **and** the operator gives
  explicit permission, requested BEFORE the dispatch - a pass beyond `review.plan.passes` is a
  budget/limits-gated operator decision, whatever engine hosts the Reviewer - so
  `review.plan.passes` + 1 is the hard maximum (`docs/WORKFLOW.md`); if the plan still does not pass
  there, stop and return the unresolved blockers to the operator. A `review.plan.passes` of `0`
  means the plan gets no auditor at all - a configuration `/pnp:roles` prints as `no auditor`, never
  a shortcut this skill takes on its own. This skill does not loop the passes itself.
- Each pass reads the **whole plan** and returns all material blockers at once - check repo-match,
  scope, hidden discovery/architecture, dependency order, real acceptance/verification, and
  branch/worktree/Git prerequisites.
- The verdict is exactly **`PASS`** or **`NEEDS-FIX`** (not `pass`/`pass-with-notes`/`fail`).
- read-only: report to the COO; do not edit the plan.

The implementation-review contract above is unchanged; this branch applies only to plan readiness.

## Step 3 - Dispatch on the resolved engine

### Step 3 - codex branch (`$row.engine -eq 'codex'`) - invoke the wrapper (prompt via STDIN)

Deliver the brief to the wrapper on **stdin** - never as a positional/argv argument. The wrapper
calls the resolver itself, so no model is passed here - but **pass the class**: with `-Class` /
`--class` the wrapper reads the model and the effort of that ROW instead of the Reviewer role's own
triple. `/pnp:review` passes the class on every invocation.

**Write the brief to the fixed path `<root>/{{config.paths.scratchDir}}/review-brief.txt`** (Write
tool), then invoke the wrapper of this project's OS channel (`{{config.os}}`) with exactly that
command, character for character:

**os `windows`:**

```powershell
Get-Content '<root>/{{config.paths.scratchDir}}/review-brief.txt' -Raw | `
  & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-review.ps1" -ProjectRoot '<root>' -Class <class>
```

**os `linux` / `macos`:**

```bash
cat '<root>/{{config.paths.scratchDir}}/review-brief.txt' \
  | bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-review.sh" --project-root '<root>' \
    --class <class>
```

The path is fixed **on purpose**. A permission rule can only match a constant command string, so an
invocation whose text changes every time - an inline here-string carrying the brief, or a
session-scoped scratchpad path - must prompt the operator on every single dispatch and can never be
allowlisted. Holding the brief in a file at a constant path is what makes the command constant.
`<root>` and the plugin root are constants *for this project*, and `-Class` / `--class` takes one of
exactly three literal tokens, so the command text is drawn from a small fixed set and is stable
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

### Step 3 - claude branch (`$row.engine -eq 'claude'`) - dispatch the rendered reviewer

Invoke the **Agent tool** with `subagent_type: "reviewer"`, `model: <$row.model>`, the completed
Step-2 brief as the task, and the **FULL diff pasted in** (the Claude reviewer cannot run git).
There is **one** Claude host and it is the project's rendered `reviewer` agent - no ad-hoc subagent,
and no model named in this document.

The agent file is rendered whenever the Reviewer role **OR any row of the audit table** is
Claude-hosted (`templates/agents/reviewer.md.tmpl`), so a Claude-hosted row always has a real agent
to dispatch, including on a project whose Reviewer role runs on Codex. The rendered subagent is
read-only (`Read, Grep, Glob` only; Gate 1 blocks the Edit/Write family from every subagent whose
`agent_type` is not `writer`; Gate 1's own honest limit is that a mutation performed through Bash is
not caught) - weaker than the codex branch's OS cell, and stated as such.

If `subagent_type: "reviewer"` does not exist while a row resolved to `claude`, the project layer is
behind its config - stop and say so; `/pnp:roles` (or `/pnp:setup`) renders it. Do not substitute
another agent: a review dispatched to an agent nobody configured is not the audit the row names.

**Effort (Claude branch):** the Agent tool has **no per-invocation `effort` parameter**, so the
reviewer's reasoning effort comes from its **agent frontmatter** (`effort:` in the rendered
`reviewer` agent), which is `roles.reviewer.effort` - the selfcheck engine asserts they match, and
drift fails it. One file, one effort, shared by every Claude-hosted row: that is why a Claude row
carries no `effort` of its own, why `/pnp:roles --show` prints it as
`the Reviewer's - Claude rows share the agent file`, and why `--set <row>.effort=...` on a Claude
row refuses with exit 1. Pass only the `model` above; do **not** try to pass `effort` to the Agent
tool.

## Step 4 - Relay the verdict to the COO

Return the Reviewer's `pass` / `pass-with-notes` / `fail` verdict and its blockers verbatim to the
COO (for a **plan-readiness** pass, relay `PASS` / `NEEDS-FIX` instead). Do not act on the findings
yourself - routing corrections back to the Writer (within the correction-round cap), scheduling the
next readiness pass, and any commit gate are the COO's calls, not this skill's.
