# Codex Reviewer / QA invocation recipe

Reviewer and QA are **engine-neutral** read-only review roles: the host per role is data in the
project's `.claude/aiwf-native/roles.json` (resolved by `scripts/native/ps/aiwf-roles.ps1`). **This
recipe covers the `codex` host** - run as `codex exec` under the OS read-only sandbox, the boundary
a Claude subagent cannot provide. When a role resolves to `claude` instead, `/pnp:review` /
`/pnp:qa` dispatch the `reviewer` / `qa` Claude subagents (`Read/Grep/Glob` only; read-only by
Gate 1 + the tool allowlist, not an OS cell) - see those agent files, not this recipe. QAL stays
**codex-only**.

- **Prerequisite, proven before this recipe was trusted:** the command below is genuinely read-only
  (a sentinel write returns a non-zero exit and an access-denied error, and creates no file) and
  still exposes the user's Codex tooling (because user config is loaded).
- **Roles / definitions:** the project's rendered `reviewer` / `qa` agents, with the per-role host in
  `.claude/aiwf-native/roles.json`. Verdict rules: `docs/REVIEW_CHECKLIST.md`.
- **Auth smoke turn:** model discovery alone does not prove Codex authentication - confirm the host
  is authenticated with a real smoke turn before trusting a review/QA run.
- **Note:** this recipe is invocation only. Hook/gate wiring lives in the plugin's `hooks/`.
- **Reasoning effort:** each role carries an `effort` in `roles.json`. On the **codex** host the
  wrapper passes it as a locked `-c` atom `model_reasoning_effort=<effort>` (value from
  `$role.effort`; the sandbox/approval flags stay literal). On the **claude** host the Agent tool has
  **no per-invocation `effort` parameter**, so effort comes from the agent **frontmatter**, kept in
  sync with `roles.json` by a selfcheck consistency assert (drift fails it). A bad `effort` value is
  not enum-checked by the resolver - it is rejected **visibly** by the engine at call time (natural
  fail-closed).

## Canonical invocation surface - the wrapper scripts

Always invoke Reviewer/QA through the wrapper scripts. They are the canonical, safe surface:
`scripts/native/ps/codex-review.ps1` and `scripts/native/ps/codex-qa.ps1` (usage in the role
sections below). They pin the locked flags **and** deliver the prompt via stdin so no prompt text
can be parsed as a CLI option.

**Do NOT put the prompt as a positional argument.** A positional `"<prompt>"` on argv reopens the
option-injection hole the wrappers close (a prompt beginning with `--` would be parsed as a flag).
If you must run the raw command without the wrapper, use the **stdin form only**:

```
"<prompt>" | codex exec -C <projectRoot> -m <model> --sandbox read-only -c approval_policy=never
```

Hard requirements (do not change without re-proving the read-only posture):

- `--sandbox read-only` - the enforced read-only boundary. Reviewer/QA cannot mutate the repo.
  (QA is an artifact judge that reads test-runner output; it does NOT drive a browser - a
  Codex-launched browser cannot run under this sandbox. See `docs/QA_BROWSER_INVESTIGATION.md`.)
- `-C <projectRoot>` - the project root; an absolute path, supplied by the wrapper's mandatory
  `-ProjectRoot` parameter.
- `-m <model>` - the Reviewer/QA model, resolved from `roles.json`.
- `-c approval_policy=never` - pins the approval mechanism **explicitly** so it is NOT inherited from
  the user's `~/.codex/config.toml`. `codex exec` has no `--ask-for-approval` flag; approval is a
  config value overridden with `-c`. Verified: the session header reads `approval: never` /
  `sandbox: read-only`. Without this pin, `read-only` paired with an inherited escalating approval
  policy could permit a sandbox escalation. This does **not** change `--sandbox`.
- **NEVER pass `--ignore-user-config`** - keeps the CWD/model/sandbox/user-config posture as proven
  (do not diverge without re-proving it). The `-c approval_policy=never` pin above is a deliberate
  hardening on top of that posture. Reviewer/QA do not need browser tooling (Reviewer reads code; QA
  reads test artifacts), so this is about posture parity, not tool availability - the live-browser
  tools matter only for QAL.
- **Delivering the prompt via STDIN ONLY is what makes the flag set truly locked.** The wrappers
  never place the prompt on the command line; they pipe it to Codex's stdin
  (`$Prompt | & codex @codexArgs`). Stdin text is never option-parsed, so a brief beginning with
  `--` (e.g. `--ignore-user-config` or `--dangerously-bypass-approvals-and-sandbox`) cannot inject a
  CLI option and defeat the read-only lock. A literal `--` end-of-options separator does **not** work
  here: PowerShell's `Windows` native-argument mode strips a standalone `--` (verified - even
  embedded in a splatted array) before it reaches codex, so an on-argv prompt cannot be protected.
  Stdin sidesteps option parsing entirely. The locked flags above are only trustworthy because no
  caller text reaches the option parser.
- Prompt is passed with `-Prompt` or piped in (use `-Raw` for long briefs); either way the wrapper
  routes it through stdin.
- **Every wrapper runs in the BACKGROUND by default** (`run_in_background: true`). A foreground shell
  call is capped at 10 minutes, while an external engine at `effort: high` on a real diff routinely
  runs longer and is killed mid-reasoning (exit 143). The pass is then lost *and already paid for* -
  passes on a paid engine are an operator quota gate, so a timeout kill spends the operator's budget
  and returns no verdict. Never retry a timed-out pass in the foreground: a full `high` pass on a
  multi-file diff has been observed killed at the cap with nothing returned.

### Option-injection regression probe (must stay green)

`codex-qa.ps1 -ProjectRoot <root> -Prompt '--help'` must treat `--help` as a **prompt**, not a flag:
the Codex session header must still read `sandbox: read-only` and it must NOT print
`codex exec --help`. Same for `codex-review.ps1`. Re-run this probe whenever the wrappers change.
The dangerous payloads `-Prompt '--ignore-user-config'` and
`-Prompt '--dangerously-bypass-approvals-and-sandbox'` must likewise be echoed back as the `user`
prompt with header `sandbox: read-only`, `approval: never`.

## Reviewer (code/design, read-only, no browser)

Adversarial code/design review of the Writer's diff. Read-only; reports, never fixes. Give it the
ticket's **risk threshold** and **stop condition** (mandatory) and the diff scope. It returns `pass`,
`pass-with-notes`, or `fail` (or `PASS`/`NEEDS-FIX` for a plan-readiness pass), with all visible
material blockers in one round.

```powershell
scripts\native\ps\codex-review.ps1 -ProjectRoot <root> -Prompt "Review the diff on branch <b> for ticket <ref>. Risk threshold: <sev>. Stop condition: <cond>. Report pass/pass-with-notes/fail with all blockers in one round."
# or, for a long brief:
Get-Content .\review-brief.txt -Raw | scripts\native\ps\codex-review.ps1 -ProjectRoot <root>
```

## Two QA surfaces (why the split)

The QA browser investigation (`docs/QA_BROWSER_INVESTIGATION.md`) proved a **Codex-launched browser
cannot run under any restrictive sandbox** (`read-only` **and** `workspace-write` both block launch
**and** CDP-attach; only `danger-full-access`/bypass works). So "agentic browser under a hard OS
read-only sandbox" is impossible. QA is therefore split into two surfaces, one contract each:

| Surface | Sandbox | Browser | Gate | Wrapper |
|---|---|---|---|---|
| **QA** - artifact judge | `--sandbox read-only` (hard OS guarantee) | none - reads test artifacts | default route (conditional on runtime/UI) | `scripts/native/ps/codex-qa.ps1` |
| **QAL** - live agentic browser | `--sandbox danger-full-access` (**no cell**) | live Codex-driven browser | **operator request only**, and `roles.qal.enabled` | `scripts/native/ps/codex-qal.ps1` |

### QA (artifact judge, read-only, no browser)

Engages **only** when the ticket declares observable runtime/UI behavior. QA does **not** drive a
browser. The runtime evidence is produced outside Codex: **Writer** authors an E2E `.spec` from the
acceptance criteria -> **the orchestrator (main session)** runs the configured runner over the
ticket's scope (browser lives in the test runner, outside the sandbox) -> QA reads the artifacts
(JSON report, screenshots, traces) under `--sandbox read-only` and judges them against the criteria.
The full step-flow is `/pnp:qa`.

```powershell
scripts\native\ps\codex-qa.ps1 -ProjectRoot <root> -Prompt "QA (artifact judge) ticket <ref> against acceptance criteria: <criteria>. Read the E2E artifacts (JSON report: <path>; traces/screenshots: <path>) under read-only - do NOT run a browser or start a server. Login context (as exercised by the spec): this project's E2E fixture account per its own test setup, referenced by env var NAME only, unless the brief overrides it. Risk threshold: <sev>. Stop condition: <cond>. Return pass/pass-with-notes/fail with evidence (test name, artifact path)."
```

If no usable artifacts exist (the run never produced them / they are unreadable), QA reports
`BLOCKED` - a precondition failure, not a deferred defect.

### QAL (live agentic browser, NO sandbox, operator-gated)

The exception, invoked **only after an explicit operator request in the current conversation** and
only when `roles.qal.enabled` is true - the orchestrator never launches it on its own. Runs
`--sandbox danger-full-access` (the minimal non-bypass flag that runs a Codex-launched browser - the
broader `--dangerously-bypass-approvals-and-sandbox` also works but additionally strips the approval
mechanism; neither is "safe") with `-c approval_policy=never` (the approval mechanism pinned
explicitly, not inherited from config - under `danger-full-access` this does not reduce capability,
it just removes prompting, correct for non-interactive `exec`). The cwd is a **unique per-run
throwaway** dir created fresh on every invocation under the per-user temp directory and removed
(best-effort) afterward, so no state leaks between runs - the project repo is never the cwd; with a
disposable browser profile. **There is no cell** - that isolation is hygiene, not a guarantee; QAL's
"never writes the repo" is a convention. Full contract + brief template: `/pnp:qal`.

```powershell
scripts\native\ps\codex-qal.ps1 -ProjectRoot <root> -Prompt "QAL - live exploratory browsing. App at <url> (do NOT start a server; BLOCKED if nothing is listening). Exploration goal: <what to investigate>. Scope: <in/out of bounds>. Stop condition: <cond>. You drive a live browser and report with evidence; you NEVER write the repo (convention). Return pass/pass-with-notes/fail (or BLOCKED) with evidence."
```

Chosen-flag rationale (`--sandbox danger-full-access` vs the broader
`--dangerously-bypass-approvals-and-sandbox`): the investigation proved `danger-full-access` is the
minimal flag that works; the bypass flag additionally strips the approval mechanism, an unnecessary
widening.

## Notes

- All three wrapper scripts are thin: they only prepend the proven, locked flags and forward the
  prompt via stdin. Read them before trusting them.
- Reviewer and QA are read-only by OS sandbox. **QAL is not read-only** - its containment is
  cwd/profile hygiene plus the operator gate, and that is stated honestly everywhere.
