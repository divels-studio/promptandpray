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

**The review ENGINE and the pass count come from the ticket's class, in both R2 rows and in R3.**
The review brief carries `Class: plan | code | docs` - default `code` when absent - and
`/pnp:review` resolves that row of the **audit table** (`review.<class>` in `aiwf.config.json`,
rendered into `roles.json`) through the role resolver's reviewer-only `-Class` / `--class` flag:
engine, model, effort and `passes` in one snapshot. The factory table inherits the Reviewer role on
all three rows, with 2 passes for `plan` and 1 for `code` and `docs`, and `/pnp:roles` shows the
whole table and changes it - so "documentation goes to a Claude host" is a value you can see rather
than a rule this page carries (`docs/WORKFLOW.md` § Routes). A Claude-hosted row dispatches the
project's rendered `reviewer` agent (`subagent_type: "reviewer"`, `model: <the row's model>`); that
file is rendered whenever the Reviewer role OR any row is Claude-hosted, so there is no ad-hoc
reviewer and no model pinned in a document. Before every reviewer pass above the scan tier - a Codex
pass, or a Claude reviewer on `opus`/`fable` - `/pnp:review` Step 2b runs the cheap fact-check gate
over the prose of the diff, or of the plan.

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
  truth. The Reviewer/QA roles are the opposite case - `/pnp:review` always passes the resolved
  ROW's model and `/pnp:qa` passes `model: $role.model`, so the model values in `roles.json` and in
  every Claude-hosted review row must stay tier aliases.
- **Reviewer** - read-only, **engine-neutral** (Codex or Claude per
  `.claude/aiwf-native/roles.json`, resolved by the role resolver of this project's OS channel -
  `scripts/native/ps/aiwf-roles.ps1` on `windows`, `scripts/native/sh/aiwf-roles.sh` on
  `linux`/`macos`; `config.os` selects it, and the two channels mirror each other flag for flag).
  `/pnp:review` resolves the ticket class's row once and dispatches either the Codex wrapper
  (`scripts/native/ps/codex-review.ps1` / `scripts/native/sh/codex-review.sh`, which takes the same
  `-Class` / `--class`) **or** the `reviewer` Claude subagent (`Read/Grep/Glob` only).
  Adversarial code/design review; reports
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
- **Arbiter** - not a loop role: an on-demand, cold-start second view opened through `/pnp:arbiter`
  on a fired escalation trigger, read-only on the tree; the doctrine is `docs/WORKFLOW.md`
  § Escalation and the arbiter.
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

**Gate 3** (the route-state write guard, which lives INSIDE the Gate 1 hook file, so three wired
hook files carry four gates) keeps the main session out of code-class files while an R2/R3 ticket is
dispatched: with `<projectDir>/.aiwf/route-state.json` naming an R2/R3 route, a main-session
Edit/Write is allowed only under `docs/**`, `.aiwf/**` and root-level `*.md`. No state file, or the
cleared `{}`, means the guard is invisible and R1 work is untouched; the Writer is never gated by
it. It covers the Edit/Write tool class only - shell mutations remain doctrine. A project can switch
it off with `enforcement.routeWriteGuard: false` in `aiwf.config.json`; every other state of that
key - absent, non-boolean, or a config that cannot be read at all - leaves the guard ARMED, and the
toggle never reaches Gate 1.

**Gate 4** (the plugin's PreToolUse git-verb guard, on both shell tools - matcher `Bash|PowerShell`)
covers the two things a
declarative `ask` rule cannot do by itself: a background agent's dialog reaches nobody, and a rule
only covers the form it spells out. It recognises `git` / `git.exe` (with an optional global
`-C <path>` or `-c <k=v>`) followed by an ask-class verb anywhere in the command - and the verb list
is not prose: the self-check parses `templates/settings.ask-ruleset.json` and requires every git verb
the rules gate to be one the hook knows, so a rule added there cannot silently outrun the gate. Then:

- from a **subagent that is not the Writer** -> **deny**, naming the verb. That command's dialog
  would never reach the operator, so it would either stall or pass unseen.
- from the **main session or the Writer**, when a rule the payload really ships matches the
  subcommand **byte for byte** -> **silent passthrough**: that dialog is the operator's own and Gate
  4 must not double-gate it. Two shapes qualify and nothing else: `git <verb> ...` for every
  ask-class verb, and `git.exe push|merge|rebase ...`.
- from the main session or the Writer, on **anything else it recognised** -> **ask**. In practice
  that is: `git.exe <verb>` outside push/merge/rebase, **any** `git -C <path> <verb>` (the shipped
  rule names `<projectRoot>` and this hook reads no project directory, so it cannot confirm the
  path), a wrapper the harness does not strip (`sudo`, `npx`, `docker exec`, `direnv exec`, `watch`,
  `setsid`, `flock`, `find -exec`, a flagged `xargs`, a `command -v` query), a nested shell
  (`bash -c "... git reset --hard"`), and irregular whitespace on either side of the verb - a tab or
  a second space, where a rule spells out exactly one.
  None of those matches a rule today, so nothing raises a dialog for them at all.

**What Claude Code already does by itself, and this gate must not pretend otherwise.** Its permission
documentation describes an **operator-aware** matcher - the whole of this paragraph is that
description: it splits a Bash command on `&&`, `||`, `;`, `|`, `|&`, `&` and newlines and matches
rules against each **subcommand** independently (deny/ask rules also reach into subshells, command
substitutions and control-flow bodies), it strips the wrappers `timeout`, `time`, `nice`, `nohup`,
`stdbuf`, `command`, `builtin`, `noglob` and a flagless `xargs` (a flagged one is not stripped, and
`command -v` is excluded - it asks about a command rather than running it), and it matches past
leading
`NAME=value` assignments. So `cd <path> && git commit -m x`, `timeout 30 git commit -m x` and
`FOO=bar git push` already raise your dialog - they are not holes, Gate 4 stays silent on them, and
no doctrine here should call them one.

**Why the default is to ask.** The same documentation is explicit that a hook decision does not
bypass the permission rules: an `ask` rule still prompts after a hook returned `allow`, and a hook
`ask` next to a matching `ask` rule is **one** dialog, not two. Asking where a rule also matches
therefore costs nothing, while a guess about which forms "look gated" turns every looseness into a
silent bypass - so the gate confirms a real rule match or asks.

**And the price of that: Gate 4's passthrough branch depends on documented host behaviour this
repository cannot test.** Nothing here observes the harness - every assertion about the gate, in the
spike matrix and in the self-check, runs the hook against an *assumed* harness. If the host ever
stopped matching per subcommand, the forms Gate 4 deliberately passes through - `cd <path> && git
commit -m x` above all - would silently stop being gated by anything, and no test in this repository
would go red, because none of them is looking at the host. Gate 4's own behaviour (the deny, the
byte-exact rule test, the ask) is covered; the decision to stay **silent** is where the design
borrows a promise from the documentation.

It fails **closed** like Gate 1, and its header states the risk that comes with that: it sits on
matcher `Bash|PowerShell`, i.e. on every shell command of either tool, so it reads its payload and
nothing else - no config,
no files, no project directory. It is a **recogniser, not a shell parser**: it does not interpret
escapes, aliases or env-indirection, so `git \push` and a verb assembled from a variable are not
seen at all, while a gated verb inside a quoted string still costs a click. Its quote handling is
two narrow things only - a separator inside quotes does not split a command, and a verb token's
surrounding quotes come off before the lookup, so `git 'push'` **is** recognised. And its
decomposition does not mirror
the harness's reach into subshells and command substitutions - a `$(git reset --hard)` or
`` `git push` `` is recognised
but never confirmed as a rule match, which resolves to ask. The guarantee is the identity check and
the byte-exact rule test; recognition is best-effort.

**Both shell tools are covered, on both layers - and what is left is a CLASS, not a named hole.**
Gate 4 is wired on the matcher `Bash|PowerShell` (a matcher of letters, digits, `_`, `-`, space, `,`
and `|` is an exact alternation list, not a regex), and every rule in
`templates/settings.ask-ruleset.json` ships as a `Bash(<X>)` / `PowerShell(<X>)` mirror pair, with
the blanket allow present for both tools. Both halves are checkable here, in that file and in the
matcher in `hooks/hooks.json`, and the self-check asserts the mirror in **both** directions - a
missing twin leaves a tool unguarded, an orphan `PowerShell(...)` rule with no `Bash(...)` base reads
as coverage while gating one tool only.

The two dialects are **not** assumed identical, and each difference is resolved towards asking:
PowerShell's documented AST split is `;`, `|` and (PS7+) `&&` / `||`, so `&` is the **call operator**
there rather than a separator (`& git push` matches no rule form and asks); no wrapper or
`NAME=value` stripping is documented for it, so `timeout 30 git commit` asks on PowerShell while
staying silent on Bash; and its matching is case-insensitive, so recognition folds case there
(`GIT Push` is recognised) while the byte-exact rule test folds it on neither - a passthrough may not
rest on a rewrite this repository cannot observe. `Monitor` needs no rules of its own: it runs its
commands **under the Bash permission rules**, with no namespace of its own.

The residual is the class itself: **a tool neither layer sees.** A harness tool that executed
commands under some third namespace would be outside the matcher and outside every rule, and a
subagent whose allowlist carried it would reach a gated git verb by **choosing that tool** - no
alias, no assembled verb, no quoting, which is why this class is weaker than the recognition
residuals above and must not be read as one of them. Closing it for a tool that exists is two lines
(the matcher, and the mirrored rules); a tool nobody has named yet cannot be closed in advance.

## Commit gate (click-based, no tokens)

Commits are **local only**, and only after the review route passes **and** the operator explicitly
approves. The operator types **nothing** - the gate is Claude Code's native visual permission
dialog:

- After review passes, the Writer attempts the local `git commit`. `Bash(git commit:*)` - and its
  `PowerShell(git commit:*)` mirror, so the tool it runs on makes no difference - is an
  **`ask`** rule in the project's `.claude/settings.json`, so Claude Code shows a visual **Yes/No
  permission dialog** -> the operator clicks **Yes** to allow the commit (or **No** to refuse). No
  approval token, no state file, no HEAD/content binding - the operator's click on the current
  attempt is the approval.
- **The click approves the invocation, not the final tree content.** The dialog is raised for the
  `git commit` command about to run; what the *project* does around it is outside the dialog. On a
  project carrying commit automation - a `post-commit` hook that amends, a `pre-commit` formatter, a
  version stamper - the approved tree and the tree that lands diverge silently: measured on a real
  consumer, an unstaged version file was amended into the commit the operator had just approved.
  Because nothing binds the click to content (that binding is refused by design, see above), every
  guard of the form "this ticket touched exactly these files" - including a brief's HEAD-at-dispatch
  anchor - is wrong by construction on such a project. Such a hook is a legitimate choice; the
  plugin's `/pnp:selfcheck` reports one as a `[NOTE]`, never a failure, and auditing what it does
  stays the project's own job.
- **Push / merge / rebase** are executed **from the session** - but only after the operator's
  **explicit word** in chat (the doctrine gate) AND a native **`ask`** dialog (Yes/No) as the second
  gate. They are `ask` rules, not `deny`: `Bash(git push:*)` / `Bash(git merge:*)` /
  `Bash(git rebase:*)`, their `git.exe` variants, and the `Bash(git -C <projectRoot> ...)`
  repo-selector forms - each of them mirrored as a `PowerShell(...)` rule, so the boundary does not
  depend on which shell tool the session reaches for. The operator does not drive git manually, so
  the agent must be able to run
  these itself; the gate is the dialog + the explicit-word doctrine + branch isolation.
  Accident-grade, not adversary-proof: the `ask` rules match by prefix, so an explicit push URL, an
  alias/env-indirection, or an escaped verb is out of scope (accepted residual). **Gate 4** narrows
  two edges of that residual - a non-writer subagent is denied outright, and the git forms the rules
  never spell out (`git.exe` outside push/merge/rebase, any `git -C <path> ...`, an unstripped
  wrapper such as `sudo`) raise a dialog nothing else would raise - and it is deliberately
  narrower than a shell layer: it recognises verbs, it does not emulate shell semantics for
  everyone. That emulation stays out of scope, because escape/continuation semantics are an
  unwinnable maintenance treadmill (an interim hook that tried to be that layer was removed in
  N4-R; the record is in `scripts/engine/aiwf-lib.js`).
- **Destructive / system-changing commands** (`git reset/clean/rm/checkout/restore/revert/pull/
  cherry-pick`, database reset/seed scripts, migration tools, containers, recursive delete, ...) are
  **`ask`** rules: an AI role **may** run one, but only after the operator clicks **Yes** on the
  dialog for that exact invocation.

## Honest security model

Gate 1, Gate 2, Gate 4 and the permission rules are **accident/role protection, not
adversary-proofing**.
The hooks trust the harness identity fields; the ask rules are the native harness gate and match by
command prefix (per subcommand, past the stripped wrappers); for the main session and the Writer the
push/merge/rebase boundary is declarative (`ask` dialog-gating + the operator's explicit-word
doctrine + branch isolation) with Gate 4 adding the dialog on the git forms no rule spells out,
while for every other subagent Gate 4 is a hook DENY - so an explicit push URL, alias/env-indirection
or escaped push forms, obfuscated command forms, and a few non-prefix-expressible destructive forms
(raw SQL in a DB client, production flags, platform-specific deletes) remain out of scope, and the
commit/push/destructive dialog only fires in a permission mode that asks.

**The git boundary above is scoped to the shell tools both layers name, and the widest remaining gap
is a tool that is on neither list.** Both layers now cover both shells: every rule in
`templates/settings.ask-ruleset.json` exists as a `Bash(<X>)` / `PowerShell(<X>)` mirror pair, and
Gate 4 is wired on the `Bash|PowerShell` matcher, so the same commit, push, merge, rebase and reset
raise a dialog whichever of the two a Windows session picks. `Monitor` is covered by the same rules,
because it runs its commands under the Bash ones. What is NOT covered is a harness tool neither
layer names - and unlike the residuals in the paragraph above, that class costs an actor no
cleverness with the command: a subagent whose tool allowlist carried such a tool would only have to
pick it, so Gate 4's deny would be bypassable by tool CHOICE. What Gate 4 does on the two shell tools
it does exactly as described; it does not reach any other one.

The **hard** guarantees live elsewhere, unchanged: the OS read-only Codex sandbox (Reviewer/QA), git
reversibility, and operator-in-the-loop review/approval (a matching commit, push/merge/rebase, or
destructive command surfaces a click, and push/merge/rebase also need the operator's explicit word -
the operator is the real backstop).
