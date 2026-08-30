<!-- TEMPLATE CONTRACT (read by the P2 generate engine, not by the reader of the rendered file)
     - Rendered ONCE by /pnp:setup and then owned by the operator; updates never overwrite it.
     - D:\promptandpray is a RENDER-TIME placeholder, not a config path: the generate engine
       substitutes the project root it resolves while rendering (`git rev-parse --show-toplevel`,
       or the explicit absolute path when config.project.root is not "auto"). Never render
       config.project.root raw - its schema default is the literal string "auto". -->

# PROJECT OVERRIDES - PromptAndPray

> This document is **yours**. `/pnp:setup` writes it once from this template; updates never
> overwrite it - at most they append a "review these sections" note. Everything here is
> project-specific.
>
> The generic doctrine is **PLUGIN PAYLOAD - not files in this repository**: the PromptAndPray
> payload's `docs/WORKFLOW.md`, `docs/LOOP.md` and `docs/REVIEW_CHECKLIST.md`, which live under the
> installed plugin root (the `/pnp:*` skills resolve that path through `${CLAUDE_PLUGIN_ROOT}`) and
> are updated with the plugin, never copied in here.
>
> Every role reads this file before starting work. Keep it short and true; a stale identity section
> is worse than none.

## Identity

We are building **PromptAndPray** - the pnp Claude Code plugin - a disciplined four-role working loop with native operator gates; this repository is the plugin itself, self-installed so its own development runs under the loop it ships.

PromptAndPray is **not**:

- **the product it was extracted from.** The loop was born in a real production project and then
  genericized; that project is now a *consumer* (installs `pnp@promptandpray` from this repo as a
  local marketplace, project scope). Its name, its operator language and its paths never enter the
  payload - the provenance section of the self-check is the gate, and `dev/` is the only place they
  may appear.
- **a Codex plugin, or a wrapper around one.** Reviewer/QA are engine-neutral roles; the Codex
  wrappers are one host, held read-only by an OS sandbox. The official Codex plugin is a second
  opinion next to this loop, not a component of it (root `README.md` FAQ).
- **a runtime / state machine.** No counters, no lock files, no external service: the loop is
  convention plus the two PreToolUse hooks plus Claude Code's native permission dialogs. A feature
  that needs a daemon is out of scope.
- **advice.** Every operator gate that CAN be a native dialog IS one. A "rule" that only lives in a
  document, where a hook or an ask-rule could carry it, is a defect.

## Hard rules

- Never run destructive Git or filesystem cleanup commands (revert, restore, reset, clean, remove,
  hard delete) unless the operator explicitly asks for that exact operation, immediately before it
  runs.
- Never touch, move, or delete untracked operator work or legacy files unless explicitly requested.
- Destructive / system-changing operations require explicit confirmation immediately before
  execution, even when a backlog, runbook, or brief marks them `MUST`. `MUST` means "mandatory
  before completing", not "execute now". In this project that class is:
  - `git tag` (a release tag is the irreversible half of a release - separate operator word);
  - `git push` / merge / rebase to either this repo or a consumer project (separate word each);
  - removing anything under `docs/` (a payload doc leaves only through a migration that names it
    - the delete is legitimate exactly then, and only then);
  - `--confirm-remove-stale` on `/pnp:setup`, and `/plugin uninstall` in a consumer project;
  - `git worktree remove`, and deleting a memory directory under `~/.claude/projects/`.
- Do not change files outside the requested scope.
- Planning lock: when the operator invokes `/plan` or explicitly asks for planning before
  implementation, stay planning-only (full rules: the payload doc `docs/WORKFLOW.md` § Planning lock).
- **Commit authority:** local commit only, and only after the review route passes and a human
  explicitly approves. No automatic commits.
- **Push authority:** push / merge / rebase only with the operator's **explicit word**, executed via
  the native `ask` dialog. Fetch, cherry-pick, and sync likewise need explicit approval.
- Do not start long-running services. There are none in this project; a `claude` session started
  to observe a gate live is the operator's, never an agent's.
- **The payload is code.** Every change under `skills/`, `docs/`, `templates/`, `scripts/`,
  `schema/`, `hooks/`, `migrations/`, `examples/` or `.claude-plugin/` is **R2** at least - Writer +
  Reviewer pass, never a direct edit from the main session. `dev/` and the self-install layer
  (`.claude/`, root `CLAUDE.md`) are R1 docs unless the ticket says otherwise.
- **Release discipline.** A managed artifact (anything `templates/` renders, the ask-ruleset, the
  managed `CLAUDE.md` region) never changes silently: the change ships as a migration under
  `migrations/NNNN_<slug>/` + a `version` bump in `.claude-plugin/plugin.json` + a `CHANGELOG.md`
  block. The tag is a separate operator word; so is the push. A consumer project picks the new
  version up only through `/plugin update` + `/pnp:update` - that path is the product, and it is
  proven on the consumer before anything is called released.
- **Provenance.** `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks
  migrations` is empty before every commit; the self-check's provenance section (origin names as
  digests, e-mail, Cyrillic by code point, drive-letter paths per allowlist) is the gate, and a new
  allowlist entry needs the one file that justifies it.

## Execution discipline

- **Checklist first.** Prepare a short checklist for the current scope only, execute only that
  checklist, and self-check against it before the final response.
- **Restate scope.** Restate the task scope in 1-3 bullets and confirm it before changing anything.

## Sibling products and negative scope

- The origin project (machine-local, a sibling directory on this machine) is **read-only reference**:
  its archive `docs/backlogs/archive/009_PLAN_PROMPTANDPRAY_2026-08-29.md` holds the extraction
  history, and its `.claude/` layer is the first real installation of this plugin. It is consumed
  as `pnp@promptandpray` (local marketplace = this repo, project scope) - never through
  `--plugin-dir` from there, never with a PNP plan, version or memory of its own.
- Never create a Git coupling to it (remote, submodule, subtree, shared package). A fix observed
  there is a ticket here; it reaches the consumer only through a released version.
- Reusable from it as **platform/workflow reference only**: captured hook payloads (the spike
  reference: `git show c2626789^:.claude/hooks` run IN THE ORIGIN REPO - that hash exists only there,
  not in this repository - extracted into scratch), observed dialog behavior.
- **Not** reusable as this project's product truth: anything product-specific of that project -
  names, domain, tenancy rules, stack. The payload is generic or it is wrong.

## Product direction

The first value loop: **a project installs the plugin, runs one R2 ticket through Writer -> Reviewer
-> commit gate with every gate a native dialog, then takes a newer version through
`/plugin update` + `/pnp:update` without losing its own voice.** Install -> loop -> update, on a real
consumer. A proposed change that does not make one of those three steps more correct, more honest
about its guarantees, or provable by the self-check is not this project's next step. Publishing to
other users comes only after the update path is proven on the consumer (P8).

## Architecture direction

Stack: Node.js (zero dependencies), PowerShell + bash wrappers, Claude Code plugin (skills, hooks, agents, templates, migrations)

Boundaries a reviewer checks:

- **Three layers, and who writes what.** Payload (`docs/ skills/ templates/ scripts/ schema/
  hooks/ migrations/ examples/ .claude-plugin/`) -> project layer rendered by setup/update
  (`.claude/aiwf-native/*`, `.claude/agents/*`, the managed `CLAUDE.md` region, the owned ask-rules
  in `.claude/settings.json`) -> operator-owned content (the overrides doc after its one seeding,
  everything outside the `aiwf-core` markers, foreign permission rules). The payload's engines
  WRITE the project layer - only the managed artifacts, only under the two-hash bookkeeping (no
  silent overwrite, no delete without `--confirm-remove-stale`) - and never the operator-owned
  content. The payload's hooks READ the project's `aiwf.config.json`, `roles.json`, the active
  PLANs under `plansDir` (Gate 2 off-plan) and `.aiwf/route-state.json` (Gate 3) - nothing else of
  the project. Nothing in the project layer ever writes the payload.
- **`schema/aiwf.config.schema.json` is the single authority for the config shape**; the interview,
  the generator and the self-check derive from it, never restate it.
- **The hooks trust harness identity fields and fail in the safe direction**, and the safe
  direction differs per gate: Gate 1 (non-writer subagent write) DENIES, Gate 3 (main-session
  write to a code-class path while an R2/R3 route is open, or an unusable route-state) DENIES,
  Gate 2 (Writer dispatch) ASKS - any unexpected error inside Gate 2 also resolves to ASK, never to
  a silent pass. A change that flips a fail direction is R3.
- **Zero runtime dependencies.** No `node_modules`, no build step; the wrappers are PowerShell 5.1
  ASCII-only / bash LF-only and mirror each other flag for flag.
- **The self-check executes real entrypoints** (hooks, resolver, validators) and every assertion has
  a negative control or is printed as `[NOTE]` with its reason - a check with no control is a
  finding, not a pass.
- **`dev/` is not payload** and may hold what the payload may not (operator language, machine paths).

## Data, tenancy and access control

- No database, no tenants. "Migrations" here are **payload migrations** for installed projects:
  one global manifest `migrations/index.json` (ordered, monotonic in version, last entry = the
  payload version) plus one directory `migrations/NNNN_<slug>/` per migration holding `ops.json`
  and `NOTES.md`, validated
  by `scripts/update/validate-payload.mjs` and applied by the update engine (`scripts/update/`) with
  a write-ahead journal. The op vocabulary is `add-config-key`, `rerender-managed-region`,
  `reconcile-ask-ruleset`, `note` - nothing else, and no migration ever deletes an operator file.
- Access control is the **permission ask-ruleset** (`templates/settings.ask-ruleset.json`): a rule
  added there is a managed-artifact change (migration + bump); a rule removed there ships with a
  `reconcile-ask-ruleset` op so consumers lose only what they never edited.

## Test policy

Tests are part of implementation, not polish. The single home of the test policy in this project is
**this section** plus the acceptance suites themselves (`scripts/setup/test-setup.mjs`,
`scripts/update/test-update.mjs`, `scripts/selfcheck/aiwf-selfcheck.js`, `scripts/spike/run-spikes.mjs`,
`scripts/ci/run-example-cycle.mjs`). Routing:

- pure logic / helper / transform -> targeted unit tests;
- route / auth / navigation / middleware / runtime behavior -> runtime / E2E proof;
- mixed change -> both where applicable;
- a missing obvious proof test is a scope miss.

Proof for algorithmic/runtime logic must exercise the production code path or an extracted
production helper, not mirrored logic inside the test file.

The literal VERIFY commands live in `aiwf.config.json`:
- `validate-payload`: `node scripts/update/validate-payload.mjs --plugin-root .` (cwd: `.`)
- `setup-suite`: `node scripts/setup/test-setup.mjs` (cwd: `.`)
- `update-suite`: `node scripts/update/test-update.mjs` (cwd: `.`)
- `example-cycle-windows`: `node scripts/ci/run-example-cycle.mjs` (cwd: `.`)
- `example-cycle-linux`: `node scripts/ci/run-example-cycle.mjs --answers examples/example-project/answers-linux.json` (cwd: `.`)
- `selfcheck`: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` (cwd: `.`)
- `spikes`: `node scripts/spike/run-spikes.mjs` (cwd: `.`)
- `plugin-validate`: `claude plugin validate .` (cwd: `.`)

## Status and release artifacts

The documents the "status / release docs policy" in the payload doc `docs/WORKFLOW.md` applies to, in this project:

- status page: root `README.md` § Status (what is here / what is not here yet - kept true per release)
- changelog: `CHANGELOG.md` (one block per version, written at the bump, English)
- roadmap: `dev/backlogs/active/` (the open plans ARE the roadmap; `dev/README.md` says how it runs)

## Communication

- Respond to the operator in **bg** unless explicitly asked otherwise.
  Agent-to-agent traffic (briefs, verdicts, micro-rounds) is always English.
- Conversational role names in the operator channel: Writer = "Колега",
  Reviewer = "Одитор", QA = "QA".
  These are conversational only - the technical identifiers (`writer`, `reviewer`, `qa`, file paths,
  frontmatter) never change.
- Keep docs and plans in English unless the operator asks otherwise.
- Be concise; no step-by-step reasoning narration in the output. Explain concretely when
  architecture or product boundaries are involved.
- Stop for an operator choice only when unresolved alternatives materially change product intent, an
  architecture boundary, external risk/cost, or an irreversible outcome. The COO owns routine
  engineering decisions; do not turn the operator into a tie-breaker for them.

## Environment

Platform: `windows`. Prefer that platform's native commands for local instructions unless the
repo already uses a specific cross-platform tool, and pass paths in its native form.

## Workspace paths

```text
D:\promptandpray    Repo root (resolved at render time, never the literal "auto")
.claude-plugin/     plugin.json (the ONLY version source) + marketplace.json (this repo as a local marketplace)
skills/ hooks/      the /pnp:* commands and the two PreToolUse enforcement hooks (payload)
docs/               generic doctrine (payload) - never project-specific, never Cyrillic
templates/          what /pnp:setup renders into a project (managed artifacts; a change = migration)
scripts/            engine (hooks lib), setup, update, selfcheck, spike, ci, native/{ps,sh} wrappers
schema/ migrations/ config authority; ordered payload migrations
examples/           the committed example project + cycle data (payload; asserted by the self-check)
dev/                the plugin's OWN development: this doc, answers.json, backlogs/{active,archive}
.claude/ CLAUDE.md  the self-install (project layer rendered by /pnp:setup from dev/answers.json)
.aiwf/              scratch (gitignored): route-state.json, review-brief.txt
```

Default integration/base branch: `main`. It is not the only allowed
working branch: a task may use a short-lived `feature/`, `fix/`, `experiment/`, `spike/`, or `r3/`
branch when the brief or the operator says so. The agent works on the branch currently checked out.
Always check the branch and dirty state before changes. If pre-existing changes fall outside the
planned task, do not create or switch branches and do not carry those changes into a new branch.
Finish or checkpoint the current scope first, or use a separate clean worktree explicitly provided
by the operator. Never stash, clean, reset, or otherwise hide the dirty/untracked state.

## Loop shape (this project's overrides of the generic defaults)

These are the shape parameters the plugin lets a project set. The gates around them are payload
mechanics and are **not** editable here (see the payload doc `docs/WORKFLOW.md` § Loop shape and its overrides).

- **One reviewer, not two** - no "two independent reviewers" requirement.
- **Correction rounds are capped at 2** for the implementation
  loop, instead of the generic low-4 / medium-8 / high-12 caps. After the cap without a passable
  result, stop and summarize to the operator. Only the operator lifts the cap, by an explicit word
  before the re-dispatch, one extension at a time, recorded in the ticket's PLAN entry.
- **R1 uses no orchestration loop** - it is done directly in the main session.
- **QA is conditional** - only when a brief declares observable runtime/UI behavior; never in R1 or
  non-runtime R2.
- Plan readiness keeps its own two-pass contract regardless of the cap above.

## Product boundary checks (rendered into the Reviewer)

The lines below are rendered into the reviewer agent and are what "product-boundary alignment" means
for this project. Empty is a valid answer.

- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

## Workflow

Routing (R1/R2/R3), the four roles, the ticket-brief contract, and commit/push mechanics are defined
in the plugin payload - `docs/WORKFLOW.md`, with the one-page native mapping in `docs/LOOP.md`
and the verdict rules in `docs/REVIEW_CHECKLIST.md`, all of them under the installed plugin root,
not in this repository. Durable knowledge lives in Git under
`dev/backlogs/active/` (finished plans move to `dev/backlogs/archive/`);
live process state lives in the in-session orchestration.
