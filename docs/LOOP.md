# The AIWF native working loop (one page)

How the four-role loop of `docs/WORKFLOW.md` runs **natively inside Claude Code** - Writer as a
native subagent, Reviewer/QA as **engine-neutral** read-only review roles (Codex **or** Claude per
the project's `.claude/aiwf-native/roles.json`), the COO orchestrating in-session. This is a native
**mapping** of the workflow, not a new authority: `docs/WORKFLOW.md` and your project's overrides
document remain the source of truth.

## Routing mapped to native

| Route | What it is | Native execution |
|---|---|---|
| **R1 - routine** | Small, low-risk change | Done **directly in the main session**. No subagents, no Reviewer, no QA, no loop - but a ticket that gains an executable artifact (script, hook) is re-classified out of R1 and takes the code loop (`WORKFLOW.md` § Routes). |
| **R2 - product (non-runtime)** | Product change with no observable runtime/UI surface | `COO -> Writer subagent -> /pnp:review -> COO`. Correction rounds capped at `loop.correctionRoundsCap`. |
| **R2 - product (runtime/UI)** | Observable runtime/UI behavior | `COO -> Writer subagent -> /pnp:review -> /pnp:qa -> COO`. Same cap. |
| **R3 - critical** | Migrations / access policy / auth / destructive / push | Plan-first: COO-approved mini-plan + plan-readiness review (Reviewer, read-only) **before** Writer starts, on `r3/<topic>`, then Writer -> `/pnp:review` -> `/pnp:qa` (if runtime) -> COO synthesis -> **operator** commit/merge gate. |

**The review ENGINE follows the ticket's class in both R2 rows (and in R3).** The review brief
carries `Class: docs | code` - default `code` when absent. A `docs`-class ticket (plans, the
overrides document, README, skill/doc prose with no executable artifact) is reviewed by a read-only
**Claude** subagent whatever `roles.reviewer.engine` says; a `code`-class ticket uses the configured
engine (`docs/WORKFLOW.md` § Routes). On a **codex-configured** install that Claude host is an
**ad-hoc** read-only Claude subagent (`general-purpose`, `model: opus`, reviewer preamble in the
brief), not a rendered agent file - `.claude/agents/reviewer.md` exists only for a claude-hosted
role. Before any pass on a PAID engine, `/pnp:review` Step 2b runs the cheap fact-check gate over
the prose of the diff.

`/pnp:loop` states this sequence as a convention. There is **no runtime state machine and no
counters** - the loop is convention + the native click-based permission gates only.

## Role boundaries

- **COO / Orchestrator** (main session) - plans, authors the ticket brief with a mandatory **risk
  threshold** and **stop condition**, delegates, reads the **full** diff, arbitrates, stops at the
  stop condition, and is the only role that presents the result to the operator. Does **not** write
  implementation code.
- **Writer** - the **only** repo writer. A native Claude subagent (`.claude/agents/writer.md`),
  invoked via the **Agent tool** with `subagent_type: "writer"`. Never approves its own work;
  returns the diff, the tests it added, and VERIFY output with exact exit codes. It does not decide
  acceptance or invent ledger content; it performs the Git PLAN write only when the COO explicitly
  delegates that specific mutation (the initial PLAN write, an accepted-closeout section).
  **Dispatch contract - do NOT pass `model` to the Agent tool for the Writer.** The Writer's model
  is pinned in its frontmatter (an exact model id is valid there); the Agent tool's `model` override
  takes precedence over frontmatter and accepts only the tier aliases
  (`sonnet|opus|haiku|fable`), so passing one silently discards the pin. To change the Writer's
  model, change `roles.writer.model` in the config and re-render - that is the single source of
  truth. The Reviewer/QA roles are the opposite case - `/pnp:review` and `/pnp:qa` always pass
  `model: $role.model`, so their `roles.json` values must stay tier aliases.
- **Reviewer** - read-only, **engine-neutral** (Codex or Claude per
  `.claude/aiwf-native/roles.json`, resolved by the role resolver of this project's OS channel -
  `scripts/native/ps/aiwf-roles.ps1` on `windows`, `scripts/native/sh/aiwf-roles.sh` on
  `linux`/`macos`; `config.os` selects it, and the two channels mirror each other flag for flag).
  `/pnp:review` resolves the host once and dispatches either the Codex wrapper
  (`scripts/native/ps/codex-review.ps1` / `scripts/native/sh/codex-review.sh`) **or** the `reviewer`
  Claude subagent (`Read/Grep/Glob` only). Adversarial code/design review; reports
  `pass` / `pass-with-notes` / `fail` (per
  `docs/REVIEW_CHECKLIST.md`; `PASS`/`NEEDS-FIX` is reserved for plan-readiness); never edits.
- **QA** - read-only, **engine-neutral** (Codex or Claude per `roles.json`). `/pnp:qa` resolves the
  host once and dispatches either the Codex wrapper (`scripts/native/ps/codex-qa.ps1` /
  `scripts/native/sh/codex-qa.sh`) **or** the `qa` Claude subagent,
  **only** when the ticket has observable runtime/UI behavior. QA is an **artifact judge**, not a
  live browser: a Codex-launched browser cannot run under the read-only sandbox
  (`docs/QA_BROWSER_INVESTIGATION.md`), so the browser lives in the **test runner**, outside the
  review engine. The spec-flow: **Writer** authors/extends an E2E `.spec` from the acceptance
  criteria -> **the orchestrator (main session)** runs the configured runner over the ticket's scope
  (browser launches in the runner) -> **QA** reads the artifacts (JSON report, screenshots, traces)
  and reports `pass` / `pass-with-notes` / `fail` (or a precondition `BLOCKED` when the artifacts
  are missing/unreadable). On the **codex** host that read is under a hard OS `--sandbox read-only`
  cell; on the **claude** host QA is a `Read/Grep/Glob`-only subagent held read-only by its tool
  allowlist + Gate 1, with no OS cell. QA never starts a dev server and never drives a browser.
- **QAL** - live agentic-browser Codex via `scripts/native/ps/codex-qal.ps1` /
  `scripts/native/sh/codex-qal.sh` (wrapped by `/pnp:qal`). The **operator-gated exception**: runs
  **only after an explicit operator request in the current conversation** and only when
  `roles.qal.enabled` is true - the orchestrator never
  launches it on its own. It runs **without an OS sandbox** (`--sandbox danger-full-access`, the
  minimal non-bypass flag that runs a Codex-launched browser - the broader
  `--dangerously-bypass-approvals-and-sandbox` also works but additionally strips the approval
  mechanism; neither is "safe") in a throwaway scratch cwd with a disposable browser profile. That
  isolation is **hygiene, not a guarantee**; QAL's "never writes the repo" is a convention, not a
  cell (honest model in the wrapper header and `docs/QA_BROWSER_INVESTIGATION.md`). QA (read-only)
  stays the default; QAL is the live-exploration escape hatch.
- **Operator** - the human; the sole authority for commit approval, push, merge, branch switches,
  destructive/system-changing operations, and for authorizing a QAL (unsandboxed live-browser) run.

The Writer-only-write rule and "the COO does not write implementation code" are invariants of the
**R2/R3 cycle**. In **R1** the main session implements directly - no loop, no subagents, no
Reviewer/QA - so R1 is the deliberate exception, not a violation.

**Reading is not a shell job (all roles).** Read or inspect files and config with the Read/Grep/Glob
tools, not shell commands (`cat`/`head`/`node -e`/shell loops) - the shell is for execution
(tests/git/build); reading through it is more powerful than the task needs and produces needless
noise.

Reviewer and QA are **engine-neutral**: the host is data in `.claude/aiwf-native/roles.json`. On the
**codex** host the read-only boundary is a real **OS sandbox** (`--sandbox read-only`) the review
role cannot escape. On the **claude** host - a `Read/Grep/Glob`-only subagent - **Gate 1 catches the
Edit/Write family, and the boundary is tool-availability + convention + git reversibility, with NO
OS cell; the hard OS boundary applies only on the codex read-only path.** QAL is the deliberate
exception and stays **codex-only** (there is no Claude QAL host): it trades the sandbox away to get
a live browser at all, so its containment is cwd/profile hygiene plus the operator gate - never an
OS guarantee. That is why QAL is invoked only on explicit operator request.

## Enforcement of Writer-only writes

**Gate 1** (the plugin's PreToolUse mutation guard) allows an `Edit`/`Write` only from the true main
session or a subagent whose harness-trusted `agent_type` is exactly `writer`; every other subagent
is denied. This was confirmed against the real harness: the native `writer` subagent's `PreToolUse`
input carries `agent_type: "writer"` (Gate 1 -> **allow**) while a `general-purpose` subagent
carries `agent_type: "general-purpose"` (Gate 1 -> **deny**).

**Gate 2** (the plugin's PreToolUse dispatch gate) puts the operator in the way of a Writer dispatch
through the Agent tool, in one of two modes chosen by `enforcement.dispatchGate` in
`aiwf.config.json`:

- **`always`** (the factory default) - EVERY Writer dispatch becomes a native **Yes/No** dialog: no
  repo write starts without an operator click.
- **`off-plan`** - the dispatch is judged instead of counted. The brief's `Ticket: <REF>` line is
  read out of the prompt and `<REF>` is looked up in `<plansDir>/active/PLAN_*.md`: a ticket that is
  in an active PLAN passes **silently** (dispatching the Writer inside an approved plan is the COO's
  job), while a missing line, a ref in no active PLAN, or a plans directory that cannot be read
  raises the dialog naming the ref.

Every other state of the key - absent, misspelled, the wrong case, a non-string, or a config that
cannot be read at all - is `always`. For an ask-gate that is the safe direction: a broken config
costs clicks, never silence. The matcher for a subagent dispatch is the `Agent` tool name (the SDK
reports the same call as `Task` in its permission records - the two names sit on different layers,
and `Agent` is the empirically correct matcher).

**Gate 3** (the route-state write guard, which lives INSIDE the Gate 1 hook file, so the wired-hook
count stays two) keeps the main session out of code-class files while an R2/R3 ticket is
dispatched: with `<projectDir>/.aiwf/route-state.json` naming an R2/R3 route, a main-session
Edit/Write is allowed only under `docs/**`, `.aiwf/**` and root-level `*.md`. No state file, or the
cleared `{}`, means the guard is invisible and R1 work is untouched; the Writer is never gated by
it. It covers the Edit/Write tool class only - shell mutations remain doctrine. A project can switch
it off with `enforcement.routeWriteGuard: false` in `aiwf.config.json`; every other state of that
key - absent, non-boolean, or a config that cannot be read at all - leaves the guard ARMED, and the
toggle never reaches Gate 1.

## Commit gate (click-based, no tokens)

Commits are **local only**, and only after the review route passes **and** the operator explicitly
approves. The operator types **nothing** - the gate is Claude Code's native visual permission
dialog:

- After review passes, the Writer attempts the local `git commit`. `Bash(git commit:*)` is an
  **`ask`** rule in the project's `.claude/settings.json`, so Claude Code shows a visual **Yes/No
  permission dialog** -> the operator clicks **Yes** to allow the commit (or **No** to refuse). No
  approval token, no state file, no HEAD/content binding - the operator's click on the current
  attempt is the approval.
- **Push / merge / rebase** are executed **from the session** - but only after the operator's
  **explicit word** in chat (the doctrine gate) AND a native **`ask`** dialog (Yes/No) as the second
  gate. They are `ask` rules, not `deny`: `Bash(git push:*)` / `Bash(git merge:*)` /
  `Bash(git rebase:*)`, their `git.exe` variants, and the `Bash(git -C <projectRoot> ...)`
  repo-selector forms. The operator does not drive git manually, so the agent must be able to run
  these itself; the gate is the dialog + the explicit-word doctrine + branch isolation.
  Accident-grade, not adversary-proof: the `ask` rules match by prefix, so an explicit push URL, an
  alias/env-indirection, or an escaped verb is out of scope (accepted residual). A second-layer
  shell hook is deliberately NOT attempted - emulating shell escape/continuation semantics is an
  unwinnable maintenance treadmill.
- **Destructive / system-changing commands** (`git reset/clean/rm/checkout/restore/revert/pull/
  cherry-pick`, database reset/seed scripts, migration tools, containers, recursive delete, ...) are
  **`ask`** rules: an AI role **may** run one, but only after the operator clicks **Yes** on the
  dialog for that exact invocation.

## Honest security model

Gate 1, Gate 2 and the permission rules are **accident/role protection, not adversary-proofing**.
The hooks trust the harness identity fields; the ask rules are the native harness gate and match by
command prefix; the push/merge/rebase boundary is declarative (`ask` dialog-gating + the operator's
explicit-word doctrine + branch isolation, no hook) - so an explicit push URL, alias/env-indirection
or escaped push forms, obfuscated command forms, and a few non-prefix-expressible destructive forms
(raw SQL in a DB client, production flags, platform-specific deletes) remain out of scope, and the
commit/push/destructive dialog only fires in a permission mode that asks. The **hard** guarantees
live elsewhere, unchanged: the OS read-only Codex sandbox (Reviewer/QA), git reversibility, and
operator-in-the-loop review/approval (a matching commit, push/merge/rebase, or destructive command
surfaces a click, and push/merge/rebase also need the operator's explicit word - the operator is the
real backstop).
