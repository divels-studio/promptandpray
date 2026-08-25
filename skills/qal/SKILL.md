---
name: qal
description: Run QAL (LIVE agentic-browser Codex, NO sandbox) - the operator-gated exception to read-only QA. Fail-closed preflight; never invoked on the orchestrator's own initiative.
allowed-tools: Read, Grep, Glob, Bash
---

# /pnp:qal - QAL (live agentic browser, operator-gated)

QAL is the **live exploratory** QA surface: a real Codex-driven agentic browser that navigates the
running app and reports what it observes. It is the deliberate exception to the default read-only
QA, and it runs **without an OS sandbox**: any restrictive sandbox (read-only or workspace-write)
blocks a Codex-launched browser, so it must be relaxed. `--sandbox danger-full-access` is the
**minimal non-bypass** flag that runs one; the broader
`--dangerously-bypass-approvals-and-sandbox` also works but additionally strips the approval
mechanism. **Neither is "safe"** - both give the browser full disk access
(`docs/QA_BROWSER_INVESTIGATION.md`).

Thin wrapper around `${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qal.ps1`. This skill only builds
the brief and invokes the wrapper.

## Invocation gate - operator request required

Run QAL **ONLY** after an **explicit operator request in the current conversation**. The
orchestrator **never** decides to run QAL on its own. If a ticket needs runtime verification and the
operator has not explicitly asked for a live browser, use **`/pnp:qa`** (read-only artifact judge)
instead. If you think QAL is warranted, **ask the operator first** - do not launch it pre-emptively.

## Honest trust model - no cell, say so

QAL runs at `--sandbox danger-full-access`: the Codex process and the browser it drives have **full
disk access**. There is **no cell**. Repo safety rests only on, in order:

1. **cwd isolation** - the wrapper pins `-C` to a **unique per-run** throwaway scratch dir, created
   fresh on every invocation under the per-user temp directory and removed (best-effort) after the
   run so no state leaks between runs; the project repo is **never** the cwd;
2. **throwaway browser profile** - the runner launches its own default (disposable) profile, not the
   operator's real browser/cookies/logins;
3. **git reversibility + the operator-in-the-loop** backstop.

These are **hygiene / accident-grade containment, NOT a guarantee**. Nothing structurally prevents a
write outside the scratch dir. QAL's "never writes the repo" contract is a **convention** of the
role, enforced by the brief and the operator only - never claim the scratch cwd or the convention is
a guarantee. The chosen-flag rationale lives in the wrapper header and
`docs/QA_BROWSER_INVESTIGATION.md`.

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

## Step 0b - Preflight (fail-closed, all three conditions)

QAL runs only when ALL THREE hold. Any other state = refuse with one line of explanation.

1. **`{{config.roles.qal.enabled}}` is true.** QAL is disabled by factory default; enabling it is a
   deliberate operator act.
2. **The qal role resolves to engine `codex`.** QAL is codex-only in fact: the live-browser
   capability could not be proven on Claude, so **no Claude QAL host exists**.
3. **The operator asked for QAL explicitly in the CURRENT conversation** (the gate above). No
   script can check this one - it is on you.

```powershell
$role = pwsh -NoProfile -File "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/aiwf-roles.ps1" `
  -Role qal -RolesPath "<root>/.claude/aiwf-native/roles.json" -AsJson | ConvertFrom-Json
# $role.enabled -> the operator gate;  $role.engine -> must be 'codex'
```

If `$role.enabled` is not true, **stop**: *QAL is disabled (`roles.qal.enabled` is false) - it is an
operator-gated exception; enable it deliberately before asking for a live pass.* If `$role.engine`
is not `codex`, **stop** and report the natural fail-closed: *QAL is codex-only - there is no Claude
QAL host; fix `<root>/.claude/aiwf-native/roles.json`.* Only the `codex` branch exists. (The
`codex-qal.ps1` wrapper independently guards both conditions and exits 2, so this fail-closed is
doubly enforced.)

## Step 1 - Build the QAL brief

QAL is exploratory, so the brief is goal + scope + stop condition (no `.spec` required). Attach to
the operator's running app; **never** start a server.

```
QAL - live exploratory browsing.

APP: <the URL the operator gave you>  (the operator's running app - do NOT start one; if nothing
is listening, report BLOCKED and stop).

LOGIN: this project's E2E fixture account, per its own test setup, unless the operator overrides
it. Give ABSOLUTE read-only reference paths - QAL runs from a scratch cwd with no repo context.
Reference the env var NAMES - never paste literal credentials.

EXPLORATION GOAL: <what to investigate - the question the operator wants answered>
SCOPE: <which pages/flows are in bounds; what is explicitly out of bounds>
STOP CONDITION: <when to stop - e.g. "stop once the goal is answered or a blocker is reproduced; do
not wander into unrelated areas or mutate data beyond what the goal requires">

CONTRACT: you drive a live browser and report with evidence (URL, selector, screenshot/trace refs,
console/network observations). You NEVER write to the repository (convention - there is no sandbox
stopping you; honor it). Report, do not fix.

OUTPUT: first line exactly one of `pass` / `pass-with-notes` / `fail` (or `BLOCKED` only when the
app is not running), then findings with concrete evidence for each.
```

## Step 2 - Invoke the wrapper (prompt via STDIN, never positionally)

Deliver the brief on **stdin** in the **same** executable block (an empty brief makes the wrapper
exit 2):

```powershell
$brief = @'
<paste the completed Step-1 brief here>
'@
$brief | & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qal.ps1" -ProjectRoot '<root>'
```

`-ProjectRoot` is used for ONE thing: locating the project's `roles.json` for the preflight. It is
deliberately NOT the Codex cwd - QAL's cwd is always the unique throwaway scratch dir.

**Run the wrapper in the BACKGROUND - `run_in_background: true`, by default.** A foreground shell
call is capped at 10 minutes; a live agentic-browser run at `effort: high` will normally exceed that
and be killed mid-run (exit 143), spending the operator's paid quota for nothing. QAL is already an
operator-gated exception, so a wasted pass is the most expensive kind. Same rule as `/pnp:review`
Step 3 - with one extra consequence here: a killed QAL run can leave its scratch directory behind,
so check that the wrapper's cleanup ran and remove the directory if it did not.

This PowerShell block is the only canonical invocation path (same foreign-shell caveat as
`/pnp:qa`). Do not pass the brief positionally - the wrapper pins its flags and routes stdin so no
prompt text can be parsed as a CLI option.

## Step 3 - Relay findings to the operator

Return QAL's verdict and evidence verbatim. Because QAL is unsandboxed and operator-gated, results
go back to the **operator** who requested it; any code change that follows routes through the normal
Writer -> `/pnp:review` -> (spec-based `/pnp:qa` if needed) loop and the commit gate.
