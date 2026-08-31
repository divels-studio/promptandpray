# PromptAndPray

PromptAndPray (`pnp`) is a Claude Code plugin that packages a disciplined four-role working loop:
an Orchestrator/COO who plans, briefs and arbitrates; a Writer that is the only role writing
implementation code in reviewed cycles; and adversarial Reviewer and QA gates that never write.
Routine work stays direct - the loop is a route you choose, not a ceremony every change pays for.

The part that is not advice: **every operator gate that CAN be a native dialog IS a native dialog.**
Writer dispatch, commit, push and the destructive commands surface Claude Code's own Yes/No
permission prompt, and two PreToolUse hooks stand behind them - one deciding who may write at all,
one deciding which Writer dispatch becomes a click - so the protection does not depend on a model
remembering the rules. What the hooks cannot reach - a mutation performed through a shell command,
the roles' own judgment - stays doctrine, and this repository says so at each such place instead of
claiming a guarantee it does not have.

Born in a real production project, then extracted and genericized.

## Status

**v0.1.2. Pre-release, private, and not published to any marketplace.**

What is here:

- **Ten commands** as skills: `loop`, `brief`, `mission`, `work`, `review`, `qa`, `qal`, `setup`,
  `update`, `selfcheck` - each opening with the same Step 0, because a skill inside a plugin has no
  project of its own: resolve the project root, read the config, and stop against the version
  interlock if migrations are pending. `update` and `selfcheck` are the two documented exceptions -
  the command that applies the migrations and the diagnostic you need most when something is out of
  date cannot be the two that refuse to run.
- **Two enforcement hooks** (`hooks/hooks.json`): the mutation guard - Gate 1, non-writer subagents
  cannot use the Edit/Write family, plus Gate 3, the route-state write guard that keeps the main
  session out of code while an R2/R3 ticket is open - and the dispatch gate, Gate 2, which puts the
  operator in the way of a Writer dispatch: a click on every one of them, or (per
  `enforcement.dispatchGate`) only on a dispatch whose `Ticket: <REF>` line names no ticket in an
  active PLAN.
- **The role resolver and the Codex wrappers** (`scripts/native/ps/` on Windows,
  `scripts/native/sh/` on Linux/macOS - two channels that mirror each other): one review role
  resolved to
  `{engine, model, effort}`, and three Codex hosts whose flags are literals in the script rather
  than defaults inherited from a config - two of them sandboxed read-only (Reviewer, QA) and QAL,
  which trades the sandbox away to get a live browser and is therefore operator-gated and off by
  default.
- **The setup engine and the config schema**: an interview, a plan-then-write generator that never
  overwrites your own content, and a JSON Schema that is the single authority for the config shape.
  `--adopt` installs into a project that already carries an AIWF surface: identical files are adopted
  clean and silently, different ones are one operator decision each (keep-mine / take-new), an
  unanswered decision stops the run with nothing written, and nothing is ever deleted.
- **The update engine and the migration runner**: an ordered migration manifest, a two-hash conflict
  machine (take-new / keep-mine / merge) that asks only where there is content of yours to lose, a
  write-ahead journal with deterministic crash recovery, and a generated CHANGES report naming each
  managed artifact's final state. A new plugin version reaches an installed project without stepping
  on that project's own voice - and this path has been walked on a **consumer** installation, not
  only on fixtures: a project other than this one took 0.1.0 -> 0.1.1 through `/plugin update` +
  `/pnp:update`, carrying its own history across the bump. Its two take-new dialogs for artifacts
  nobody had edited are what 0.1.2 removes.
- **The self-check**, which executes both hooks and the resolver at their real entrypoints rather
  than reading their source, and then insists its own checks can fail: the project-layer, example
  fixture and provenance sections each sabotage a copy one way per assertion and require the target
  check to flip. A check with no control is printed by name with the reason, never quietly as a pass.
- **CI** (`.github/workflows/ci.yml`): on every push and pull request, three OS legs (windows,
  ubuntu, macos), one step per gate, none of them advisory. Three things are deliberately left out
  and say so in the file: the manifest validation, which needs a CLI a runner does not have; hook
  parity against the reference implementation, which lives on an operator machine and is a local
  check by nature; and `shellcheck` on the macos leg, where it is not preinstalled (the ubuntu leg
  runs it).

What is **not** here yet:

- **A Linux or macOS install anybody has actually run.** Both channels ship - the bash wrappers
  mirror the PowerShell ones flag for flag, `/pnp:setup` accepts all three OS channels, and the CI
  matrix runs the gates on ubuntu and macos runners. What is missing is field use: the POSIX legs
  first execute on the operator's first push, and no POSIX machine has hosted a real loop yet.
- **A published plugin anyone else can install.** The update path is proven on a consumer
  installation, which was the condition for publishing - but the marketplace here is still local, the
  audience is still one operator, and nothing has been released to a public marketplace.
- **A second consumer, and a bump that carries managed changes on a consumer.** The consumer update
  so far is one project taking one bump: `0002_operator-word-and-hygiene` is the only migration with
  real operations that has landed on a project other than this one. `0003_quiet-rerender` carries a
  managed-region re-render too, but no consumer has taken 0.1.2 yet - so this remains a first rather
  than a routine.

## Three names

| name | what it is |
|---|---|
| **PromptAndPray** | the product and the repository. |
| **`pnp`** | the command namespace: `/pnp:setup`, `/pnp:loop`, `/pnp:review`, and the rest. |
| **AIWF** | the internal name of the loop itself - `aiwf.config.json`, `.aiwf/`, `_aiwf`, the doctrine under `docs/`. Nothing renames it. |

## Install

The plugin is not published to any public marketplace. Two ways to load it from a local checkout:

```
claude --plugin-dir <path-to-this-repo>
```

or install it from this repository as a **local marketplace** (the repo ships its own
`.claude-plugin/marketplace.json`), at project scope from the project you want it in:

```
/plugin marketplace add <path-to-this-repo>
/plugin install pnp@promptandpray
```

That install is a snapshot; Claude Code picks up a newer payload only when `version` in
`plugin.json` changes - then `/plugin marketplace update`, `/plugin update pnp@promptandpray`, and
`/pnp:update` inside the project. Development of the plugin itself lives in `dev/` (not payload);
`dev/README.md` says how a development session runs.

Then, from the project you want it in:

```
/pnp:setup
```

The interview asks for the project's identity and stack, the OS channel, the language of the
operator channel and the nicknames it uses for the roles, the engine and model per role, your VERIFY
commands, the end-to-end proof surface, the paths it should use, and any product-boundary lines the
Reviewer must check. `--dry-run` prints the exact action list and writes nothing, and the generator plans
everything before it writes anything - so a run that hits a blocker leaves the project exactly as
it was. What it writes: `aiwf.config.json` and `roles.json`, the agent
files for the roles hosted on Claude, a project overrides document, a managed region inside your
`CLAUDE.md` (your own text outside its markers is never touched), and the permission ask-rules merged into
`settings.json` without taking over rules it did not insert. It finishes by running the self-check
itself, and prints its memory seeds for you to paste into your own memory tool - the store's format
is machine-local and not the plugin's to assume.

`/pnp:update` brings an installed project up to a newer payload later, and `/pnp:selfcheck` proves
the installation is still consistent.

## Quickstart

`examples/example-project/README.md` is the runnable cycle - install, a simulated version bump, an
update that meets a real conflict, and the self-check - written as the exact commands, with the exit
code each one produces. Its commands are not a paraphrase: the self-check compares them against the
list the CI driver really runs, in both directions, so a quickstart that describes something else
fails a gate instead of misleading someone. Run the whole thing at once with:

```
node scripts/ci/run-example-cycle.mjs
```

## The commands

| command | what it does |
|---|---|
| `/pnp:loop` | the working-loop convention itself: the routes R1/R2/R3, the roles, the hard rules. Read before driving a ticket. |
| `/pnp:brief` | composes the session brief that opens the next fresh session, by one recipe every time. |
| `/pnp:mission` | resumes the active mission with no session brief - reconstructs state from the durable PLAN, memory and git, then waits for the operator's word. |
| `/pnp:work` | an ad-hoc session under the full doctrine: loads it, checks the tree, asks for the task, routes it. |
| `/pnp:review` | the Reviewer over the current diff, or a plan in plan-readiness mode. Read-only; returns pass / pass-with-notes / fail. |
| `/pnp:qa` | QA as an artifact judge over what an end-to-end run produced. Only for tickets with observable runtime behavior. |
| `/pnp:qal` | the live agentic-browser exception: unsandboxed, Codex-only, disabled by default, and never invoked on the orchestrator's own initiative. |
| `/pnp:setup` | installs or re-interviews the project layer. |
| `/pnp:update` | applies the payload's migrations to this project, with conflict dialogs and a CHANGES report. Never commits. |
| `/pnp:selfcheck` | runs the payload and project-layer assertions, with their negative controls. |

Reviewer and QA are engine-neutral: each is hosted on Codex or on Claude, chosen per role in
`roles.json`, resolved once per invocation. On the Codex host the read-only boundary is an OS
sandbox; on the Claude host it is a `Read/Grep/Glob` tool allowlist plus Gate 1, and this repository
does not pretend those two are the same guarantee.

## FAQ

**Why does the Reviewer run through your own wrapper instead of the official Codex plugin?**

Because of the output contract, not the packaging. That plugin's review verbs force a fixed JSON
schema whose verdict is `approve` or `needs-attention`; this loop runs on `pass` /
`pass-with-notes` / `fail` for implementation review and on a two-pass `PASS` / `NEEDS-FIX` for plan
readiness, and neither of those maps onto a binary. Its review slash command also ignores a custom
brief entirely - the adversarial variant takes a focus string, but still forces the schema - so the
risk threshold and the stop condition, the two fields every R2/R3 brief is required to carry, would
never reach the reviewer as a contract at all. And it ships a first-class write path
that is on by default in one of its subagents, which would put a second writer into a loop whose
central rule is that the Writer is the only one.

The honest half: a read-only A/B evaluation on the same diff found review **quality at parity** -
both surfaces reported the same class of real blockers, at comparable latency. The wrapper wins on
contract control, on being a small owned surface rather than a large auto-updating third-party one,
and on write governance. It does not win on finding more, and that plugin remains a perfectly good
operator-driven second opinion next to this one.

**Why is it a Claude Code plugin?**

Because the gates it depends on are Claude Code mechanisms. A PreToolUse hook can deny a tool call
outright or convert it into a native Yes/No dialog, and the permission rules put commit, push and
the destructive commands behind the same dialog. Without those, this loop is advice - a document
asking a model to behave. The skills, the agent definitions and the manifest are packaging around
the two hooks; the hooks are the reason it is a plugin.

## Licence

MIT - see `LICENSE`.
