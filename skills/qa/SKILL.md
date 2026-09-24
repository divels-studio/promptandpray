---
name: qa
description: Run QA (engine-neutral artifact judge - Codex or Claude per roles.json) over the artifacts an end-to-end run produced. Only for tickets with observable runtime/UI behavior; returns pass / pass-with-notes / fail / BLOCKED.
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# /pnp:qa - QA (engine-neutral artifact judge)

QA is the **judge over evidence**, not a live browser. The QA role is **engine-neutral**: its host
is data in the project's `.claude/aiwf-native/roles.json`, resolved by the plugin's role resolver -
`scripts/native/ps/aiwf-roles.ps1` on os `windows`, `scripts/native/sh/aiwf-roles.sh` on os
`linux`/`macos` (`{{config.os}}`, read in Step 0, decides which; same CLI contract, same exit
codes). A Codex-launched browser cannot run under the read-only sandbox
(`docs/QA_BROWSER_INVESTIGATION.md`), so on **either** host the browser lives in the **test
runner**, outside the review engine, and QA reads the artifacts read-only. The flow:

1. **Writer** authors/extends an E2E `.spec` from the acceptance criteria.
2. **The orchestrator (this main session)** runs the project's E2E runner over the ticket's scope -
   the browser launches in the test runner, not in the review engine.
3. **QA** reads the resulting artifacts (JSON report, screenshots, traces) and returns a verdict.

QA's host is resolved once (Step 0b) and dispatched as one of two branches:

- **engine `codex`** -> the wrapper of this OS channel,
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qa.ps1` or
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-qa.sh` - read-only by a hard
  OS `--sandbox read-only` cell; wrapper locks flags, brief on stdin.
- **engine `claude`** -> the `qa` subagent via the **Agent tool** (the project's rendered qa agent) -
  read-only by a `Read/Grep/Glob`-only tool allowlist. **Gate 1 catches the Edit/Write family; the
  Claude QA path is tool-availability + convention + git reversibility, with NO OS cell; the hard OS
  boundary applies only on the codex read-only path.**

For **live exploratory** browsing use the separate, operator-gated `/pnp:qal` instead.

Arguments: the ticket ref and an optional acceptance-criteria hint.

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

## Step 0a - Gate: does this ticket have observable runtime/UI behavior?

QA engages **only** when the ticket brief declares observable runtime/UI behavior. If the change is
pure logic/helpers/config with no runtime surface, **do not run QA** - reply that QA is not
applicable and stop. If `{{config.verify.e2e.enabled}}` is false, the project has no E2E proof
surface: say so and stop rather than improvising one.

## Step 0b - Resolve the QA host (run the resolver once)

Run the channel `{{config.os}}` selects. Both print the same snapshot object.

**os `windows`:**

```powershell
$role = pwsh -NoProfile -File "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/aiwf-roles.ps1" `
  -Role qa -RolesPath "<root>/.claude/aiwf-native/roles.json" -AsJson | ConvertFrom-Json
# $role.engine -> 'codex' or 'claude';  $role.model -> the model to use on that engine
```

**os `linux` / `macos`:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/aiwf-roles.sh" \
  --role qa --roles-path "<root>/.claude/aiwf-native/roles.json" --as-json
# prints one JSON object: {"role":..,"engine":..,"model":..,"effort":..} - read the fields from it
```

If the resolver exits non-zero, it printed the reason to stderr - stop and report the
misconfiguration; do not guess a host.

## Step 1 - Confirm the Writer `.spec` exists (else return to Writer)

Confirm a `.spec` covering this ticket's acceptance criteria exists (or was extended for it) - under
`{{config.verify.e2e.cwd}}/{{config.verify.e2e.specDir}}`. If **no** spec covers the criteria, **do
not run QA** - return the ticket to the **Writer** to author/extend the `.spec` first, then resume
at Step 2.

## Step 2 - Orchestrator runs the E2E suite (browser lives here, not in the review engine)

Run the scoped suite from the main session and let it write **persistent** artifacts. Do **not**
start a dev server - the operator runs the app; if nothing is listening, stop and report the
precondition rather than starting one.

**Run from `{{config.verify.e2e.cwd}}`** (where the runner's config lives). Canonical command:

```powershell
# cwd: <root>/{{config.verify.e2e.cwd}}  - scope to the ticket's spec
{{config.verify.e2e.runner}} {{config.verify.e2e.specDir}}/<ticket>.spec.ts --trace on --output {{config.verify.e2e.outputDir}}
```

No `>` redirect and **no inline env** - nothing that could disturb the permission match on the
runner command. The persistent JSON report is produced by a **config reporter** in the project's
runner config (a `json` reporter writing next to `{{config.verify.e2e.outputDir}}`; the runner
creates the parent dir).

Why the two flags (do not drop them):
- **`--trace on`** - a typical repo config traces only on retry, and with zero local retries a
  *passing* run would leave **zero** traces, so QA would self-`BLOCKED`. `on` forces a `trace.zip`
  for every test.
- **`--output {{config.verify.e2e.outputDir}}`** - pins the artifact dir to a known, gitignored path.

**Guaranteed artifacts** (before extraction):
- the JSON report, **always** (config reporter);
- `{{config.verify.e2e.outputDir}}/**/trace.zip` - a trace per test, **always** (`--trace on`);
- screenshots - **only on failure** (also embedded in the trace).

## Step 2b - Extract traces for the QA host (the orchestrator does the unzip)

A `trace.zip` is a **zip** - the **Claude** QA subagent has only `Read/Grep/Glob` and **cannot
unzip**. So the orchestrator extracts each trace into a sibling `trace-extracted/` dir (the Codex
host *could* read the zip directly, but extracting keeps the brief **engine-neutral** - the same
paths work on both hosts). Run from `{{config.verify.e2e.cwd}}`:

**os `windows`:**

```powershell
Get-ChildItem {{config.verify.e2e.outputDir}} -Recurse -Filter trace.zip | ForEach-Object {
  Expand-Archive -LiteralPath $_.FullName -DestinationPath (Join-Path $_.DirectoryName 'trace-extracted') -Force
}
```

**os `linux` / `macos`** (same result; `unzip -o` overwrites, as `-Force` does above). Every path is
quoted: the configured output dir may contain spaces, and so may a trace's own directory:

```bash
find "{{config.verify.e2e.outputDir}}" -name trace.zip -exec sh -c \
  'unzip -o "$1" -d "$(dirname "$1")/trace-extracted"' _ {} \;
```

Each trace's internals (`0-trace.trace`, `test.trace`, `0-trace.network`, `resources/...`) now live
under `{{config.verify.e2e.outputDir}}/**/trace-extracted/` for QA to Read/Grep directly.

**Artifacts to pass QA in Step 3** (post-extraction):
- the JSON report - **always**;
- `{{config.verify.e2e.outputDir}}/**/trace-extracted/` - the **unzipped** trace internals per test,
  **always** (Step 2b). Pass this dir, **not** the `.zip`;
- screenshots - **only on failure** (also embedded in the trace).

## Step 3 - Build the QA brief (which artifacts, criteria, thresholds, verdict contract)

Pull acceptance criteria, **risk threshold**, and **stop condition** from the COO's ticket brief -
all mandatory. Point QA at the **artifacts**, not a browser:

```
QA (artifact judge) ticket <TICKET_REF> against its acceptance criteria.

EVIDENCE (read-only - do NOT run a browser, do NOT start a server):
  E2E artifacts from the orchestrator's test run (ABSOLUTE paths - resolve them before sending;
  QA cannot expand config values or plugin variables itself):
    - JSON report (always present): <abs path to the runner's JSON report>
    - Trace internals (always present, UNZIPPED per test - Step 2b):
      <abs path>/**/trace-extracted/
      (Read/Grep the .trace/.network files directly - the Claude QA host cannot open a .zip)
    - Screenshots: only if a test FAILED (also embedded in the trace) - read only if present.
  Judge from the JSON + trace internals against the criteria below.

LOGIN CONTEXT (as exercised by the spec): this project's E2E fixture account, per its own test
setup, unless the ticket brief overrides it. Reference the env var NAMES only - never paste
literal credentials into a brief.

ACCEPTANCE CRITERIA (observable behavior to verify from the evidence):
<the exact, testable runtime/UI criteria from the ticket brief>

RISK THRESHOLD: <which defect severity blocks - e.g. "block on broken flow / wrong data /
auth or isolation leak; note-only for cosmetic">
STOP CONDITION: <when you have enough evidence and must stop - e.g. "stop once each criterion
is confirmed or a blocker is evidenced; do not request more runs beyond the provided artifacts">
BUDGET TARGET: keep the brief dense and return ALL material problems in ONE round - aim for a
single round. (Throughput target only; does NOT change the correction-round cap or any
authority minimum.)

OUTPUT CONTRACT (single round - return ALL material problems at once):
  First line: exactly one of `pass` / `pass-with-notes` / `fail` (per the review checklist at
  <absolute path to the plugin's docs/REVIEW_CHECKLIST.md>)
  - OR `BLOCKED`, allowed ONLY as a precondition failure (the artifacts are missing/empty/
  unreadable, or the run never produced them). Never use `BLOCKED` to defer a real defect.
    - `pass`            = every criterion verified at/above the risk threshold from the evidence.
    - `pass-with-notes` = verified; only narrow, local, non-blocking notes remain.
    - `fail`            = a criterion fails / a blocker is evidenced. List blockers first, each
                          citing the artifact (test name, screenshot/trace path, JSON assertion).
    - `BLOCKED`         = precondition only: no usable artifacts to judge; report and stop.
  You are read-only: report with evidence, never fix.
```

## Step 3b - Dispatch on the resolved engine

### codex branch (`$role.engine -eq 'codex'`) - invoke the wrapper (prompt via STDIN)

Deliver the brief on **stdin** - never positionally. The wrapper reads its model from the resolver,
so no model is passed here.

**Write the brief to the fixed path `<root>/{{config.paths.scratchDir}}/qa-brief.txt`** (Write tool -
an empty brief makes the wrapper exit 2, so write the file first), then invoke the wrapper of this
project's OS channel (`{{config.os}}`) with exactly that command, character for character:

**os `windows`:**

```powershell
Get-Content '<root>/{{config.paths.scratchDir}}/qa-brief.txt' -Raw | `
  & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qa.ps1" -ProjectRoot '<root>'
```

**os `linux` / `macos`:**

```bash
cat '<root>/{{config.paths.scratchDir}}/qa-brief.txt' \
  | bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-qa.sh" --project-root '<root>'
```

The path is fixed **on purpose** - same reasoning as `/pnp:review` Step 3: a permission rule can
only match a constant command string, so an inline here-string carrying the brief, or a
session-scoped scratchpad path, must prompt the operator on every dispatch and can never be
allowlisted. Do not inline the brief, and do not make the path unique per session or per ticket.

**Run the wrapper in the BACKGROUND - `run_in_background: true`, by default.** A foreground shell
call is capped at 10 minutes; an external engine at `effort: high` routinely exceeds it and is
killed mid-run (exit 143), by which point the operator's paid quota is spent and no verdict has
arrived. What the run had already read is recoverable (the interruption rule below), and that
changes nothing about this rule: recovery costs a further dispatch and the operator's attention, so a
pass that never needed recovering is still the better outcome. Same rule, same reasoning, as
`/pnp:review` Step 3.

**A verification pass after a correction round may RESUME the previous session instead of paying for
a cold one.** It is the same block with one flag added, so the command text stays in the same small
fixed set a permission rule can match:

**os `windows`:**

```powershell
Get-Content '<root>/{{config.paths.scratchDir}}/qa-brief.txt' -Raw | `
  & "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qa.ps1" -ProjectRoot '<root>' -Resume
```

**os `linux` / `macos`:**

```bash
cat '<root>/{{config.paths.scratchDir}}/qa-brief.txt' \
  | bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-qa.sh" --project-root '<root>' --resume
```

With no id after it, the flag replays the session the wrapper recorded on its OWN last run - QA's
own state file, `<root>/{{config.paths.scratchDir}}/last-qa-session.txt`, which a Reviewer run never
touches - and sends the new brief into that same context. With an explicit id (`-ResumeId <id>` on
PowerShell, `--resume <id>` or `--resume-id <id>` on bash) it resumes exactly that session instead;
an explicitly EMPTY id is refused (exit 2) rather than quietly falling back to the recorded one.
With no recorded session and no id the wrapper refuses (exit 2) rather than quietly running a cold
pass, because a silent cold pass spends the operator's quota on the very thing the resume was
avoiding. The resume form carries no `-C` and no `--sandbox`: `codex exec resume` has neither, so
the read-only posture travels as `-c sandbox_mode=read-only` plus `-c approval_policy=never` and the
wrapper makes the project root its cwd itself. Resuming is for a **verification** pass over the same
ticket and the same evidence set; a new ticket, or a pass whose artifacts the previous session never
saw, is a cold run.

**Which passes that last sentence lets resume - and which it does not.** The flag and its refusals
are the mechanics above; this is the policy that decides when to reach for them, and it lives here
rather than in a document of its own so the two cannot drift apart. One question settles every case
below: **resume answers "is the DELTA sound"; cold answers "is the WHOLE still sound"**. The
precondition `BLOCKED` is the plainest instance of the cold-run clause the paragraph above ends on -
a run that judged nothing leaves no delta behind it, and the artifacts that arrive afterwards are an
evidence set that session never saw. QA has no plan-readiness pass of its own, so the readiness
rules `/pnp:review` carries have no counterpart here.

- **A verification pass after a correction round resumes by default** - the case the paragraph above
  describes, and the one where the delta really is what the previous session was judging: the same
  ticket, the same acceptance criteria, a re-run of the same suite on top of the evidence it already
  read.
- **A correction round that RE-ARCHITECTED rather than closed the blockers re-poses the whole
  question, so its verification reverts to cold or to the operator's call** - the delta is no longer
  a delta against the behavior that was judged.
- **Retire a warm session at its first compaction.** What a resume saves shrinks as the resumed
  session accumulates context of its own, and is gone once that session has been compacted: what
  would be resumed is then no longer the reading that was paid for.

**An interrupted paid pass is NOT lost work.** A kill or an interruption ends the CLI process, while
the session and the work already done survive in the engine's own session store - so the DEFAULT
recovery is a bare resume plus a SHORT continuation prompt - "continue - you already have the brief
and your progress; produce the verdict" - never a fresh dispatch carrying the full brief again. Bare
means bare: `-Resume` / `--resume` with no id, off QA's own state file above; write the continuation
prompt into the same `qa-brief.txt` and re-invoke the block, which keeps the command text in the
fixed set a permission rule matches.

**How the id gets recorded, and when it does not.** The wrapper does **not** read the engine's
output - it touches neither stdout nor stderr, so what you see is the engine's own bytes. A
**resumed** run records the id it resumed with (which also repairs the state file after an explicit
`-ResumeId`). A **cold** run identifies its session in Codex's own store (`$CODEX_HOME`, default
`~/.codex`) by mtime plus a fingerprint of this run's brief, and records the id only when exactly
one session matches. If it cannot tell - nothing matched, two sessions did, or the brief was too
short to leave a fingerprint - the state file is CLEARED and the wrapper says so on stderr, so the
next `-Resume` refuses instead of replaying a stale session. Two lines on stderr are worth reading
when they appear: `no session id is recorded now` (the next pass must be cold or explicit) and,
far worse,
`ERROR: ... could NOT be removed` - a stale id survived the clear, so do not resume from it at all.
A `-Resume` against a state file the wrapper cannot write is refused (exit 2) for the same reason.

The block of this project's OS channel is the **only canonical wrapper path** - PowerShell on os
`windows`, bash on os `linux`/`macos` (same foreign-shell caveat as `/pnp:review`, and the same
rule: the channels are mirrors, never alternatives). `{{config.paths.scratchDir}}` is gitignored, so
the brief never enters a commit. Never delete it afterwards - `rm` is an `ask` rule and cleanup
would pop the very dialog this
arrangement removes; the next dispatch overwrites the file.

### claude branch (`$role.engine -eq 'claude'`) - dispatch the qa subagent

Invoke the **Agent tool** with `subagent_type: "qa"`, the role's model per the dispatch contract
below, and the completed Step-3 brief as the task - with the **absolute artifact paths** embedded
(the Claude QA agent has only Read/Grep/Glob and reads those paths directly; Gate 1 blocks any
Edit/Write). It returns the verdict; it never fixes.

**The `model` dispatch contract - two halves, decided by `$role.model`:**

- **a tier alias (`fable|opus|sonnet|haiku`) is passed as the Agent tool's `model`** - that
  parameter takes precedence over the agent file's frontmatter, so the role's alias is what runs;
- **an exact model id is NOT passed - `model` is omitted.** The Agent tool's `model` takes a tier
  alias and nothing else, so an exact id is not a value it can carry; with `model` omitted, the pin
  in the rendered qa agent's frontmatter (rendered from `roles.qa.model`) is what runs - the
  Writer's pattern (`docs/LOOP.md` § Role boundaries).

**Effort (Claude branch):** the Agent tool has **no per-invocation `effort` parameter**, so QA's
reasoning effort comes from its **agent frontmatter** (`effort:` in the rendered qa agent), kept in
sync with `roles.json`'s `qa.effort` - the selfcheck engine asserts they match. Pass `model` only as
the dispatch contract above says; do **not** try to pass `effort` to the Agent tool.

## Step 4 - Relay the verdict to the COO

Return QA's `pass` / `pass-with-notes` / `fail` (or precondition `BLOCKED`) verdict and evidence
verbatim to the COO. Corrections route back to the Writer (within the correction-round cap; a
failing spec or missing coverage returns to the Writer to fix the code and/or the `.spec`); the
commit gate stays the COO's/operator's call.

The COO then owes the OPERATOR its own report of that verdict:
the verdict plus one or two sentences of its substance, before the next dispatch - what the run
confirmed, or what its blockers and notes are (`docs/WORKFLOW.md` § How the COO speaks to the
operator). Verbatim to the COO, two sentences to the operator; a bare "pass, moving on" hides an
audit the operator paid for.
