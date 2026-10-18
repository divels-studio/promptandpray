# The AIWF native working loop (one page)

How the four-role loop of `docs/WORKFLOW.md` runs **natively inside Claude Code** - Writer as a
native subagent, Reviewer/QA as **engine-neutral** read-only review roles (Codex **or** Claude per
the project's `.claude/aiwf-native/roles.json`), the COO orchestrating in-session. A native
**mapping**, not a new authority: `docs/WORKFLOW.md` and your project's overrides document remain
the source of truth.

## Routing mapped to native

| Route | What it is | Native execution |
|---|---|---|
| **R1 - routine** | Small, low-risk change | Done **directly in the main session**. No subagents, no Reviewer, no QA, no loop - but a ticket that gains an executable artifact (script, hook) is re-classified out of R1 and takes the code loop (`WORKFLOW.md` § Routes). |
| **R2 - product (non-runtime)** | Product change with no observable runtime/UI surface | `COO -> Writer subagent -> /pnp:review -> COO`. Correction rounds capped at `loop.correctionRoundsCap`. |
| **R2 - product (runtime/UI)** | Observable runtime/UI behavior | `COO -> Writer subagent -> /pnp:review -> /pnp:qa -> COO`. Same cap. |
| **R3 - critical** | Migrations / access policy / auth / destructive / push | Plan-first: COO-approved mini-plan + plan-readiness review (Reviewer, read-only) **before** Writer starts, on `r3/<topic>`, then Writer -> `/pnp:review` -> `/pnp:qa` (if runtime) -> COO synthesis -> **operator** commit/merge gate. |

The review engine and the pass count come from the ticket's class, in both R2 rows and in R3: the
brief's `Class: plan | code | docs` names a row of the audit table (`docs/WORKFLOW.md` § Routes),
which `/pnp:review` resolves through the role resolver's reviewer-only `-Class` / `--class` flag -
engine, model, effort and `passes` in one snapshot. A Claude-hosted row dispatches the rendered
`reviewer` agent under the dispatch contract (§ Role boundaries). Before every diff pass above the
scan tier `/pnp:review` Step 2b runs the fact-check gate; a plan pass has the mechanical plan gate
instead (`docs/WORKFLOW.md` § The COO write boundary runs along artifact class, not size; the
planning cycle is `/pnp:plan`).

`/pnp:loop` states this sequence as a convention. There is **no runtime state machine and no
counters** - the loop is convention + the native click-based permission gates only.

## Role boundaries

- **COO / Orchestrator** (main session) - plans, authors the ticket brief with a mandatory **risk
  threshold** and **stop condition**, delegates, reads the **full** diff, arbitrates, stops at the
  stop condition, and is the only role that presents the result to the operator. Does **not** write
  implementation code in the R2/R3 cycle; in **R1** the main session implements directly - the
  deliberate exception, not a violation.
- **Writer** - the **only** repo writer. A native Claude subagent (`.claude/agents/writer.md`),
  invoked via the **Agent tool** with `subagent_type: "writer"`. Never approves its own work;
  returns the diff, the tests it added, and VERIFY output with exact exit codes. It does not decide
  acceptance or invent ledger content; it performs the Git PLAN write only when the COO explicitly
  delegates that specific mutation. Several Writers may run on ONE ticket when its worklist splits
  into file sets that do not overlap: the brief records the split, and one VERIFY and one commit
  close the ticket. The Agent tool's `isolation: "worktree"` is not the instrument for it (its copy
  starts from the default branch, not the branch checked out). The planner of `/pnp:plan` runs as
  the `writer` agent type and writes only its plan folder under `<plansDir>/drafts/<ABBR>/`.
  **Dispatch contract - do NOT pass `model` to the Agent tool for the Writer.** The Writer's model
  is pinned in its frontmatter (a tier alias or an exact model id); the Agent tool's `model`
  override takes precedence over frontmatter and takes only a tier alias (`sonnet|opus|haiku|fable`),
  so passing one silently discards the pin. To change the Writer's model, change
  `roles.writer.model` in the config and re-render. A Claude-hosted Reviewer, QA or review row takes
  a tier alias or an exact model id: `/pnp:review` and `/pnp:qa` pass `model` ONLY for a tier alias
  and omit it for an exact id, so the rendered agent's frontmatter pin applies. The Reviewer has ONE
  agent file with ONE pin, shared by every Claude-hosted row, so such a row takes a tier alias or
  exactly `roles.reviewer.model` (a tier alias when the Reviewer is Codex-hosted and the file
  carries `fable`): setup, `/pnp:update` and `/pnp:roles` refuse anything else before writing, and
  `/pnp:review` fails closed at dispatch when the row's exact id and the file's pin disagree.
- **Reviewer** - read-only, **engine-neutral**: the host is data in `.claude/aiwf-native/roles.json`,
  resolved by the role resolver of this project's OS channel - `scripts/native/ps/aiwf-roles.ps1` on
  `windows`, `scripts/native/sh/aiwf-roles.sh` on `linux`/`macos` (`config.os` selects it; the two
  channels mirror each other flag for flag). `/pnp:review` resolves the class's row once and
  dispatches either the Codex wrapper (`scripts/native/ps/codex-review.ps1` /
  `scripts/native/sh/codex-review.sh`, same `-Class` / `--class`) **or** the `reviewer` Claude
  subagent (`Read/Grep/Glob` only). Adversarial code/design review; reports `pass` /
  `pass-with-notes` / `fail` per `docs/REVIEW_CHECKLIST.md` (a plan-readiness pass returns a findings
  table and a `BLOCKERS:` line instead); never edits. On the **codex** host the read-only boundary
  is a hard OS cell (`--sandbox read-only`); on the **claude** host it is tool-availability + Gate 1
  + convention + git reversibility, with NO OS cell.
- **QA** - read-only, **engine-neutral** the same way: `/pnp:qa` dispatches either the Codex wrapper
  (`scripts/native/ps/codex-qa.ps1` / `scripts/native/sh/codex-qa.sh`) **or** the `qa` Claude
  subagent, **only** when the ticket has observable runtime/UI behavior. QA is an **artifact
  judge**, not a live browser: a Codex-launched browser cannot run under the read-only sandbox
  (`docs/QA_BROWSER_INVESTIGATION.md`), so the browser lives in the **test runner**. The spec-flow:
  the **Writer** authors/extends an E2E `.spec` from the acceptance criteria -> **the orchestrator**
  runs the configured runner over the ticket's scope -> **QA** reads the artifacts (JSON report,
  screenshots, traces) and reports `pass` / `pass-with-notes` / `fail` (or a precondition `BLOCKED`
  when the artifacts are missing/unreadable). Same boundary per host as the Reviewer. QA never starts
  a dev server and never drives a browser.
- **QAL** - live agentic-browser Codex via `scripts/native/ps/codex-qal.ps1` /
  `scripts/native/sh/codex-qal.sh` (wrapped by `/pnp:qal`), **codex-only**. The **operator-gated
  exception**: runs **only after an explicit operator request in the current conversation** and only
  when `roles.qal.enabled` is true - never on the orchestrator's own initiative. It runs **without an
  OS sandbox** (`--sandbox danger-full-access`, the minimal non-bypass flag that runs a
  Codex-launched browser; `--dangerously-bypass-approvals-and-sandbox` also strips the approval
  mechanism; neither is "safe") in a throwaway scratch cwd with a disposable browser profile - hygiene,
  not a guarantee; its "never writes the repo" is a convention, not a cell. QA stays the default.
- **Arbiter** - not a loop role: an on-demand, cold-start second view opened through `/pnp:arbiter`
  on a fired escalation trigger, read-only on the tree; the doctrine is `docs/WORKFLOW.md`
  § Escalation and the arbiter.
- **Operator** - the human; the sole authority for commit approval, push, merge, branch switches,
  destructive/system-changing operations, and for authorizing a QAL (unsandboxed live-browser) run.

The session rule (a readiness cycle in a fresh session; ~400k tokens as a ticket boundary):
`docs/WORKFLOW.md` § Plan readiness review.

**Reading is not a shell job (all roles).** Read or inspect files and config with the Read/Grep/Glob
tools, not shell commands (`cat`/`head`/`node -e`/shell loops) - the shell is for execution
(tests/git/build). Editing is not a shell job either: change tracked files with Edit / Write, never
`sed -i`, a heredoc or a redirect - a shell edit can stall on a dialog nobody is watching, and a file
whose text names a gated git verb trips Gate 4 when written through the shell. No command carries a
`cd` prefix: it runs from the repository root and reaches a subfolder with the tool's own flag.
Surgical edits over rewrites: a file is never rewritten whole when the result is the same, and a
whole-file restructure that is needed is announced in one line first, with its reason. A command
expected to run over about five minutes runs in the background for every role, with a timeout of at
least 3600000 ms, awaited by its notification; a run killed by the cap is not restarted but
reported, and every brief repeats this. Auto mode refuses agent edits to `.claude/settings.json`,
`.claude/hooks/**` and the config files an update writes, even with the operator's word: the COO
asks the operator to switch auto mode off in its first reply, and if still blocked stops and
explains - never a bypass through `sed`, a heredoc or a redirect; the operator may hand-edit from
the COO's exact lines. The Writer's reply is short - about 25 lines: blockers, deviations, failed
checks and the handoff path, the details in the handoff file.

## Enforcement of Writer-only writes

**Gate 1** (the plugin's PreToolUse mutation guard) allows an `Edit`/`Write` only from the true main
session or a subagent whose harness-trusted `agent_type` is exactly `writer`; every other subagent
is denied.

**Gate 2** (the plugin's PreToolUse dispatch gate) puts the operator in the way of a Writer dispatch
through the Agent tool, in one of two modes chosen by `enforcement.dispatchGate`:

- **`always`** (the factory default) - EVERY Writer dispatch becomes a native **Yes/No** dialog.
- **`off-plan`** - the brief's `Ticket: <REF>` line is looked up in `<plansDir>/active/PLAN_*.md`
  and the `active/<ABBR>/` plan folders (index and `tickets/`): a ticket in an active PLAN passes
  **silently**, while a missing line, a ref in no active PLAN, or a plans directory that cannot be
  read raises the dialog naming the ref.

Every other state of the key - absent, misspelled, the wrong case, a non-string, an unreadable
config - is `always`: a broken config costs clicks, never silence. The matcher is the `Agent` tool
name (the SDK reports the same call as `Task` in its permission records; `Agent` is the empirically
correct matcher).

**A Claude-hosted plan-readiness pass goes through the same hook.** On an `Agent` dispatch of
`reviewer` whose prompt carries the line `Class: plan`, Gate 2 runs `scripts/engine/plan-gate.js`
over the prompt and DENIES the dispatch while the plan folder the brief names fails `--check`; with
a passing check it stays silent, and every other reviewer dispatch is untouched. An unreadable
payload, a throw inside the check, or a session with no `CLAUDE_PROJECT_DIR` still resolves to ask.
The Codex host gets the same check inside `codex-review.ps1` / `codex-review.sh`, which refuse a
plan-class run - by the class flag or by the brief's `Class: plan` line - with exit 2. Honest limit:
`ask` on an `Agent` call was observed live, while `deny` on it rests on the documented PreToolUse
decision contract.

**Gate 3** (the route-state write guard, INSIDE the Gate 1 hook file - three hook files carry four
gates) applies while `<projectDir>/.aiwf/route-state.json` names an R2/R3 route: a main-session
Edit/Write is allowed only under `docs/**`, `.aiwf/**` and root-level `*.md`, plus the transfer
surface (`paths.transferSurface`, else `<plansDir>/PNP_CANDIDATES.md`; one contained `.md` file not
under `.claude`) and the roadmap `<plansDir>/ROADMAP.md` under the same rules; anything else is
denied with a message naming the open ticket. No state file, or the cleared `{}`, means the guard is
invisible; the Writer is never gated by it. A present-but-unusable state (a route that is not R2/R3,
a non-string route, malformed JSON) denies by design, never opens the transfer surface or the
roadmap, and is self-healing because `.aiwf/**` stays writable. A `paths.plansDir` under neither
`docs/` nor `.aiwf/` puts the plan's own draft and readiness files behind the guard while a route is
open (the transfer surface and the roadmap excepted), so `/pnp:plan` runs while no route is open.
The paths and the state-file location are fixed. It covers the Edit/Write tool class only - shell
mutations remain doctrine. `enforcement.routeWriteGuard: false` skips it; every other state of that
key - absent, non-boolean, an unreadable config - leaves it ARMED, and the toggle never reaches
Gate 1.

**Gate 4** (the plugin's PreToolUse git-verb guard, matcher `Bash|PowerShell`) recognises `git` /
`git.exe` (with an optional global `-C <path>` or `-c <k=v>`) followed by an ask-class verb anywhere
in the command; the self-check parses `templates/settings.ask-ruleset.json` and requires every git
verb the rules gate to be one the hook knows. Then:

- from a **subagent that is not the Writer** -> **deny**, naming the verb (its dialog would reach no
  operator).
- from the **main session or the Writer**, when a rule the payload ships matches the subcommand
  **byte for byte** -> **silent passthrough** (that dialog is the operator's own). Two shapes
  qualify: `git <verb> ...` for every ask-class verb, and `git.exe push|merge|rebase ...`.
- from the main session or the Writer, on **anything else it recognised** -> **ask**: `git.exe
  <verb>` outside push/merge/rebase, **any** `git -C <path> <verb>` (the hook reads no project
  directory, so it cannot confirm the path), a wrapper the harness does not strip (`sudo`, `npx`,
  `docker exec`, `direnv exec`, `watch`, `setsid`, `flock`, `find -exec`, a flagged `xargs`, a
  `command -v` query), a nested shell (`bash -c "... git reset --hard"`), and irregular whitespace
  on either side of the verb.

Claude Code's own matcher, per its permission documentation, already splits a Bash command on `&&`,
`||`, `;`, `|`, `|&`, `&` and newlines and matches each **subcommand** (deny/ask rules also reach
subshells, command substitutions and control-flow bodies), strips `timeout`, `time`, `nice`,
`nohup`, `stdbuf`, `command`, `builtin`, `noglob` and a flagless `xargs`, and matches past leading
`NAME=value` assignments - so `cd <path> && git commit -m x`, `timeout 30 git commit -m x` and
`FOO=bar git push` already raise the dialog and are not holes. A hook decision does not bypass the
permission rules (an `ask` rule still prompts after a hook `allow`; a hook `ask` beside a matching
rule is one dialog), so the gate confirms a real rule match or asks. Honest limit: the passthrough
branch depends on that documented host behaviour, which nothing in this repository observes - if
the host stopped matching per subcommand, the passed-through forms would go ungated with no test
going red.

It fails **closed** like Gate 1 and reads its payload only - no config, no files, no project
directory. It is a **recogniser, not a shell parser**: escapes, aliases and env-indirection are not
seen (`git \push`, a verb from a variable), a gated verb inside a quoted string still costs a click,
a separator inside quotes does not split, a verb token's surrounding quotes come off (`git 'push'`
is recognised), and a `$(git reset --hard)` or `` `git push` `` is recognised but never confirmed as
a rule match, which resolves to ask. The guarantee is the identity check and the byte-exact rule
test; recognition is best-effort.

**Both shell tools.** The matcher `Bash|PowerShell` is an exact alternation list, and every rule in
`templates/settings.ask-ruleset.json` ships as a `Bash(<X>)` / `PowerShell(<X>)` mirror pair, with
the blanket allow present for both; the self-check asserts the mirror in **both** directions. The
dialects are not assumed identical, and each difference resolves towards asking: PowerShell splits
on `;`, `|` and (PS7+) `&&` / `||`, `&` is its call operator (`& git push` asks), no wrapper or
`NAME=value` stripping is documented (`timeout 30 git commit` asks there), and recognition folds case
(`GIT Push` is recognised) while the byte-exact rule test folds it on neither tool. `Monitor` runs
its commands under the Bash rules and needs none of its own.

## Commit gate (click-based, no tokens)

The authority - who commits, the native dialog, the click that approves the invocation rather than
the tree, push/merge/rebase on the explicit word plus the dialog, destructive commands as `ask`
rules - is `docs/WORKFLOW.md` § Commit & Push Authority. Natively: after review passes, the Writer
attempts the local `git commit`, the `ask` rule raises the Yes/No dialog, and the operator's click on
that attempt is the approval.

## Honest security model

Gate 1, Gate 2, Gate 4 and the permission rules are **accident/role protection, not
adversary-proofing**. The hooks trust the harness identity fields; the ask rules match by command
prefix (per subcommand, past the stripped wrappers); for the main session and the Writer the
push/merge/rebase boundary is declarative (`ask` dialog + the explicit-word doctrine + branch
isolation) with Gate 4 adding the dialog on the git forms no rule spells out, while for every other
subagent Gate 4 is a DENY. Out of scope: an explicit push URL, alias/env-indirection or escaped
push forms, obfuscated command forms, and non-prefix-expressible destructive forms (raw SQL in a DB
client, production flags, platform-specific deletes); and the dialogs only fire in a permission mode
that asks. Emulating shell semantics stays out of scope (the record is in
`scripts/engine/aiwf-lib.js`).

**The widest remaining gap is a tool on neither list.** Both layers cover both shell tools, and
`Monitor` rides the Bash rules; a harness tool that executed commands under some third namespace
would be outside the matcher and every rule, and a subagent whose allowlist carried it would reach a
gated git verb by tool CHOICE alone - weaker than the residuals above. Closing it for a tool that
exists is two lines (the matcher, and the mirrored rules); a tool nobody has named cannot be closed
in advance.

The **hard** guarantees live elsewhere: the OS read-only Codex sandbox (Reviewer/QA), git
reversibility, and operator-in-the-loop review/approval - the operator is the real backstop.
