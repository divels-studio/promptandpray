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
2. **The orchestrator (this main session)** runs the project's E2E runner over the ticket's scope
   at the handoff, before `/pnp:review` (`work.md` § Tests) - the browser launches in the test
   runner, not in the review engine.
3. **QA** reads the resulting artifacts (JSON report, screenshots, traces) and returns a verdict.

QA's host is resolved once (Step 0b) and dispatched as one of two branches:

- **engine `codex`** -> the wrapper of this OS channel,
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qa.ps1` or
  `${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-qa.sh` - read-only by a hard
  OS `--sandbox read-only` cell; wrapper locks flags, brief from the per-ticket file
  `-BriefFile` / `--brief-file` names (stdin is the fallback).
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
   Exit 0 = this project is current. Any non-zero exit = migrations are pending: **stop** and point
   the operator at `/pnp:update`. The command reads only.
   Two skills are documented exceptions and run anyway: `/pnp:update` and `/pnp:selfcheck`.
4. **Reading is not a shell job.** Read or inspect files with the Read/Grep/Glob tools - never
   `cat`/`grep`/`ls`/`head`/`node -e` through the shell for reading; the shell is for execution
   (tests, git, build).

Notation: `{{config.some.key}}` in this document means *substitute the value you read in step 2*.

## Step 0.5 - Doctrine read

Read `.claude/aiwf-native/ORCHESTRATOR.md` (the core) and `.claude/aiwf-native/doctrine/ticket.md`
(the ticket stage: the brief contract, the roles' boundaries, the loop's shape) IN FULL before
Step 0a, and note `git rev-parse HEAD` at that read - a session that starts cold on this skill reads
its stage by construction.

**Its suppression dual.** Skip the read when this session already read the current text of both:
`git diff <the HEAD noted at that read> -- .claude/aiwf-native/ORCHESTRATOR.md
.claude/aiwf-native/doctrine/ticket.md` returns empty - the case of a session that entered by
`/pnp:work` or `/pnp:mission`. Any other result - a line of diff, or an error - means read them
again. After a context compaction both are read again, whatever the diff says.

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

QA judges the artifacts of the run the flow's step 2 made before the review; it does not run the
suite again for them. The suite runs here only after a correction round, or when no artifacts of
that run stand: from the main session, writing **persistent** artifacts. After a correction round
the re-run is scoped to what the round touched - the specs over the changed files - and the full
ticket scope is the fallback when that set cannot be named. Do **not**
start a dev server - the operator runs the app; if nothing is listening, stop and report the
precondition rather than starting one.

**Run from `{{config.verify.e2e.cwd}}`** (where the runner's config lives). Canonical command:

```powershell
# cwd: <root>/{{config.verify.e2e.cwd}}  - scope to the ticket's spec
{{config.verify.e2e.runner}} {{config.verify.e2e.specDir}}/<ticket>.spec.ts --trace retain-on-failure --output {{config.verify.e2e.outputDir}}
```

No `>` redirect and **no inline env** - nothing that could disturb the permission match on the
runner command. The persistent JSON report is produced by a **config reporter** in the project's
runner config (a `json` reporter writing next to `{{config.verify.e2e.outputDir}}`; the runner
creates the parent dir).

**The report is copied by whoever ran the suite** - the COO at the handoff (the flow's step 2), this
step after a scoped re-run - right after the run and before anything else, to
`<scratchDir>/<REF>-e2e-report-<N>.json`, `<N>` the run's number in the ticket (1 for the handoff
run); `{{config.verify.e2e.outputDir}}` is neither deleted nor run over again before that copy stands.

Why the two flags (do not drop them):
- **`--trace retain-on-failure`** - a typical repo config traces only on retry, and with zero local
  retries a *failing* run would leave no trace to judge it by. `retain-on-failure` records every
  test and keeps the `trace.zip` of each FAILED one; a passing test is judged from the JSON report,
  which needs no trace.
- **`--output {{config.verify.e2e.outputDir}}`** - pins the artifact dir to a known path the
  project's own `.gitignore` keeps out of git (setup writes no ignore entry).

**Guaranteed artifacts** (before extraction):
- the JSON report, **always** (config reporter) - the evidence of a passing test;
- `{{config.verify.e2e.outputDir}}/**/trace.zip` - a trace per FAILED test (`--trace
  retain-on-failure`); none for a passing one;
- screenshots - **only on failure** (also embedded in the trace);
- the declared RED run - the JSON report of the Writer's own first run of the spec it adds, written
  by the same config reporter and copied by the Writer to `<scratchDir>/<REF>-e2e-red.json`.

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
- the JSON report - **always**; it is the evidence of a passing test;
- `{{config.verify.e2e.outputDir}}/**/trace-extracted/` - the **unzipped** trace internals per
  FAILED test (Step 2b), passed when it exists. Pass this dir, **not** the `.zip`;
- screenshots - **only on failure** (also embedded in the trace);
- the declared RED run's report, `<scratchDir>/<REF>-e2e-red.json` - the evidence the spec can fail.

## Step 3 - Build the QA brief (which artifacts, criteria, thresholds, verdict contract)

Pull acceptance criteria, **risk threshold**, and **stop condition** from the COO's ticket brief -
all mandatory. Point QA at the **artifacts**, not a browser:

```
COVERED BY: operator word "<quote>", <date>
  (the first line of the brief: the operator's word this run rides, quoted verbatim - the ticket's
  standing word for the QA pass that follows the review, the run's own word for any later one)
QA (artifact judge) ticket <TICKET_REF> against its acceptance criteria.
Ticket: <TICKET_REF>
  (a line of its own, first column: the wrapper keys QA's session-state file by it, so another
  ticket's QA run on the same tree never overwrites this run's resume id; `A-Za-z0-9_.-`, 1-64 chars)

EVIDENCE (read-only - do NOT run a browser, do NOT start a server):
  E2E artifacts from the orchestrator's test run (ABSOLUTE paths - resolve them before sending;
  QA cannot expand config values or plugin variables itself):
    - JSON report (always present - the evidence of a passing test): <abs path of the copy <scratchDir>/<REF>-e2e-report-<N>.json, Step 2>
    - Trace internals (present per FAILED test only, UNZIPPED - Step 2b; omit the line when no test failed):
      <abs path>/**/trace-extracted/
      (Read/Grep the .trace/.network files directly - the Claude QA host cannot open a .zip)
    - Screenshots: only if a test FAILED (also embedded in the trace) - read only if present.
    - RED run (the spec's first run, before the change): <abs path of <scratchDir>/<REF>-e2e-red.json> - or `RED run: none - because <reason>` when the pre-change tree could not be run.
  Judge a passing test from the JSON report, a failed one from the JSON + its trace internals,
  against the criteria below. A passing test without a trace is complete evidence, never a gap.

PRODUCT BOUNDARY CHECKS:
<one line per entry of `config.review.productBoundaryChecks`, verbatim - or `none`. A Codex host
reads no `.claude/agents/` file, and the root `AGENTS.md` it reads is role-free, so this slot is
how the project's boundaries reach it.>

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
  First line: exactly one of `pass` / `pass-with-notes` / `fail` (per the review stage file at
  <absolute path of <root>/.claude/aiwf-native/doctrine/review.md> - read it IN FULL before the pass)
  - OR `BLOCKED`, allowed ONLY as a precondition failure: the JSON report is missing, empty or
  unreadable, or the run never produced it. Never `BLOCKED` for a passing test without a trace, and
  never to defer a real defect.
    - `pass`            = every criterion verified at/above the risk threshold from the evidence.
    - `pass-with-notes` = verified; only narrow, local, non-blocking notes remain.
    - `fail`            = a criterion fails / a blocker is evidenced. List blockers first, each
                          citing the artifact (test name, screenshot/trace path, JSON assertion).
    - `BLOCKED`         = precondition only: no usable JSON report to judge; report and stop.
  You are read-only: report with evidence, never fix.
```

## Step 3b - Dispatch on the resolved engine

### codex branch (`$role.engine -eq 'codex'`) - invoke the wrapper (brief through its file)

Deliver the brief through its **brief file** - the path after `-BriefFile` / `--brief-file` - never
positionally; the wrapper hands it to the engine on stdin. The wrapper reads its model from the
resolver, so no model is passed here.

**Write the brief to the per-ticket file `<root>/{{config.paths.scratchDir}}/<key>-qa-brief.txt`**
(Write tool), `<key>` being exactly the brief's `Ticket: <REF>` value - the key of QA's session-state
file below. An empty, whitespace-only, missing or unreadable brief file makes the wrapper exit 2, so
write the file first and invoke in a later tool call, never in the same message; then invoke the
wrapper of this project's OS channel (`{{config.os}}`) with exactly that command, character for
character:

**os `windows`:**

```powershell
& "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qa.ps1" -ProjectRoot '<root>' -BriefFile '<root>/{{config.paths.scratchDir}}/<key>-qa-brief.txt'
```

**os `linux` / `macos`:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-qa.sh" --project-root '<root>' --brief-file '<root>/{{config.paths.scratchDir}}/<key>-qa-brief.txt'
```

The command keeps a **constant prefix on purpose** - same reasoning as `/pnp:review` Step 3: a
permission rule matches a command by its prefix, so an inline here-string carrying the brief, or a
pipe in front of the wrapper, must prompt the operator on every dispatch and can never be
allowlisted; only the brief path after the flag varies, per ticket, and a local allow rule is
written on the prefix. The brief file is per ticket, keyed like the session-state file. Do not
inline the brief; the stdin form (a pipe in front of the wrapper) still works but is only the
fallback, and the flag together with a non-empty stdin is refused (exit 2).

**Run the wrapper in the BACKGROUND - `run_in_background: true`, by default, with a timeout of at
least 3600000 ms:** a command expected to run over about five minutes runs in the background
(`ticket.md` § Role boundaries). A foreground shell call is killed at its cap (10 minutes); an
external engine at `effort: high` routinely exceeds it and is
killed mid-run (exit 143), by which point the operator's paid quota is spent and no verdict has
arrived. What the run had already read is recoverable (the interruption rule below), and that
changes nothing about this rule: recovery costs a further dispatch and the operator's attention, so a
pass that never needed recovering is still the better outcome. Same rule, same reasoning, as
`/pnp:review` Step 3.

**A verification pass after a correction round may RESUME the previous session instead of paying for
a cold one.** It is the same launch with one flag added at its end, so the command keeps the same
constant prefix a permission rule can match:

**os `windows`:**

```powershell
& "${CLAUDE_PLUGIN_ROOT}/scripts/native/ps/codex-qa.ps1" -ProjectRoot '<root>' -BriefFile '<root>/{{config.paths.scratchDir}}/<key>-qa-brief.txt' -Resume
```

**os `linux` / `macos`:**

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/native/sh/codex-qa.sh" --project-root '<root>' --brief-file '<root>/{{config.paths.scratchDir}}/<key>-qa-brief.txt' --resume
```

With no id after it, the flag replays the session the wrapper recorded on its OWN last run for THIS
ticket - QA's own state file, `<root>/{{config.paths.scratchDir}}/last-qa-session.<key>.txt`, keyed by
the brief's `Ticket:` line (a brief without one uses the legacy unkeyed file), which a Reviewer run
never touches - and sends the new brief into that same context; the resume brief carries the same
`Ticket:` line as the run it resumes. With an explicit id (`-ResumeId <id>` on
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
  ticket, the same acceptance criteria, a re-run of the same suite - or of the part of it Step 2
  scopes to the round - on top of the evidence it already read.
- **A correction round that RE-ARCHITECTED rather than closed the blockers re-poses the whole
  question, so its verification reverts to cold or to the operator's call** - the delta is no longer
  a delta against the behavior that was judged.
- **Retire a warm session at its first compaction.** What a resume saves shrinks as the resumed
  session accumulates context of its own, and is gone once that session has been compacted: what
  would be resumed is then no longer the reading that was paid for.

**An interrupted paid pass is NOT lost work.** A kill or an interruption ends the CLI process, while
the session and the work already done survive in the engine's own session store - so the DEFAULT
recovery is a bare resume plus a SHORT continuation prompt - "continue - you already have the brief
and your progress; produce the verdict" - never a fresh dispatch carrying the full brief again.
The recovery is still a paid dispatch: tell the operator what is known of the dead pass - how long
it ran, and its cost where the engine reported one - and take their word before it; never
re-dispatch on your own. Bare means bare: `-Resume` / `--resume` with no id, off QA's own state
file above; write the continuation prompt - WITH the pass's `Ticket:` line - into the same
`<key>-qa-brief.txt` and re-invoke the block, which keeps the command's constant prefix a permission
rule matches.

**How the id gets recorded, and when it does not.** The wrapper does **not** read the engine's
output for the id. Codex's stdout and stderr go to the run's own log outside the repository; the
wrapper's stdout is the engine's final message (its `-o` file) byte for byte, and its stderr carries
its own lines in order: `codex-qa: run ...`, then `codex-qa: tokens used ...` (the engine's figure,
cumulative on a resume), `codex-qa: engine refused: capacity, ...` when it applies, `codex-qa: no
verdict - ...` when the engine left no final message, `codex-qa: log <path>` and `codex-qa: exit
..., session ...`. A
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
rule: the channels are mirrors, never alternatives). `{{config.paths.scratchDir}}` is kept out of
git by the project's own `.gitignore` (setup writes no ignore entry), so the brief never enters a
commit. Between the dispatches of one ticket it is not deleted - `rm` is an `ask` rule and a
cleanup per run would pop the very dialog this arrangement removes; the next dispatch overwrites the
file, and a correction round re-dispatches without retransmitting it. At the ticket's close it IS
deleted, by the ticket-end cleanup of the record skeleton's closing checklist - that one delete
dialog is the gate.

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
  Writer's pattern (`ticket.md` § Role boundaries).

**Effort (Claude branch):** the Agent tool has **no per-invocation `effort` parameter**, so QA's
reasoning effort comes from its **agent frontmatter** (`effort:` in the rendered qa agent), kept in
sync with `roles.json`'s `qa.effort` - the selfcheck engine asserts they match. Pass `model` only as
the dispatch contract above says; do **not** try to pass `effort` to the Agent tool.

## Step 4 - Relay the verdict to the COO

Return QA's `pass` / `pass-with-notes` / `fail` (or precondition `BLOCKED`) verdict and evidence
verbatim to the COO. Corrections route back to the Writer (within the correction-round cap; a
failing spec or missing coverage returns to the Writer to fix the code and/or the `.spec`); the
commit gate stays the COO's/operator's call.

**A QA `BLOCKED` is not a Writer defect:** it is an operator precondition (nothing is serving the
app under test, and the Writer is forbidden to start a server). On `BLOCKED` the COO **pauses** the
loop and asks the operator to start the app, then re-runs `/pnp:qa`. It does **not** consume a
correction round and is **not** routed to the Writer.

The COO then owes the OPERATOR its own report of that verdict:
the verdict plus one or two sentences of its substance, before the next dispatch - what the run
confirmed, or what its blockers and notes are (`ORCHESTRATOR.md` § How the COO speaks to the
operator). Verbatim to the COO, two sentences to the operator; a bare "pass, moving on" hides an
audit the operator paid for.
