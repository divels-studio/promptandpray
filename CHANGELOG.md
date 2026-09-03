# Changelog

All notable changes to PromptAndPray (`pnp`) are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow strict
`MAJOR.MINOR.PATCH` as enforced by `scripts/update/validate-payload.mjs`.

## [0.2.1] - 2026-09-03

A code-only release with an uncomfortable cause: the CI matrix had a Linux and a macOS leg since it
was written, both were red from their first run, and they were read for the first time after 0.2.0
was pushed. Nothing here changes your project - no config key, no managed region, no agent file -
and `0005_posix-legs` exists only because a version bump still needs a manifest entry.

### Fixed

- **Entrypoint identity behind a symlinked path (POSIX-001)** - every CLI entrypoint decided whether
  it was started directly or imported by comparing the invoked path with its own module path, and
  Node resolves an entry file to its real path before loading it. On a host whose temp directory sits
  behind a symlink - the normal case on macOS - an entrypoint spawned from a payload copy under temp
  concluded it was not the main module, did nothing, and exited 0. The suites read that 0 as success:
  sabotage controls came back green because nothing had run. All six entrypoints now compare real
  paths on both sides, and the self-check carries an entrypoint-identity assertion with a
  constructed-input control. Reproduced on Windows through a directory junction before the fix.
- **The Linux and macOS CI legs (POSIX-001)** - every defect that kept them red is fixed; the 0.2.1
  push's CI run is the proof. Besides the entrypoint defect: the `codex-qal.sh` cleanup function
  that only a `trap` ever calls is now exempted from BOTH shellcheck codes that report it (two
  ShellCheck generations name the same false positive differently), `actions/checkout` and
  `actions/setup-node` are pinned at `@v5`, and the workflow header no longer claims those legs have
  never executed. macOS itself is proven by CI on the 0.2.1 push - this repository has no macOS host.
- **A test expectation built with the host's separator (POSIX-001)** - the setup suite compared a
  rendered path against a string assembled with the separator of the machine running the test, while
  the product deliberately renders the separator of the CONFIGURED channel. The expectation is now
  built from the channel too.
- **The provenance scan ignores the harness's plugin-cache metadata (POSIX-002)** - when the plugin
  is installed from a marketplace, the payload root is a directory inside Claude Code's plugin cache,
  and the harness keeps `.in_use/<pid>` and `.orphaned_at` in it. The self-check's provenance scan
  fails on files whose type it does not know, so a perfectly clean marketplace installation reported
  four failures about the harness's own bookkeeping. Both names are skipped now - at the payload root
  only, by exact name, and only those two: a `.in_use` directory deeper in the payload is still
  scanned, an unclassified root file of any other name still fails, and two controls prove both
  directions.

## [0.2.0] - 2026-09-02

Who audits what stops being doctrine text and becomes a table in your config: three review classes
(`plan`, `code`, `docs`), each with its own pass count and, if you want one, its own host. One
command shows the whole picture and changes any of it without a re-interview.

### Added

- **The audit table (AUD-001)** - `review.plan`, `review.code` and `review.docs` in
  `aiwf.config.json`, factory `2 / 1 / 1` passes. A row carries only `passes` and INHERITS the
  Reviewer role whole (engine, model and effort together), or names its own host in one of exactly
  two shapes: `{ passes, engine: "claude", model }` or
  `{ passes, engine: "codex", model, effort }`. There is no field-by-field inheritance, so no
  configuration can compose a Claude tier with a Codex model id. The effective rows are rendered
  into `.claude/aiwf-native/roles.json`.
- **`/pnp:roles` (AUD-001)** - `scripts/setup/aiwf-roles.mjs`: `--show` prints the table (every
  role, every class, the fact-check gate and R1); `--set <target>.<field>=<value>` and
  `--reset <plan|code|docs>` change it and re-render `roles.json` and the agent files. Two phases:
  everything is decided and validated before a single byte is written, so a refusal leaves the
  project exactly as it was. It is plan-before-write, not a transaction - an interrupted run is
  finished by re-running the same command. Exit 0 written, 1 refused, 2 could not start.
  `/pnp:mission`, `/pnp:work` and `/pnp:setup` print the table in their reports.
- **The role resolver takes an optional review class (AUD-001)** - `-Class plan|code|docs`
  (`--class` on the bash channel), reviewer-only, in both channels: JSON gains `class` and
  `passes`, the plain form prints four tokens. Without the flag the output is byte-identical to
  0.1.2. The Codex review wrappers take the same flag and use the row's model and effort.
- **`ifRecorded` on `rerender-managed-region` (AUD-001)** - a migration can now re-render an
  artifact that exists on SOME installations only (`.claude/agents/reviewer.md` is rendered for a
  claude-hosted host and does not exist at all on a codex-configured project). Without a record it
  is reported as `not on this installation (no record) - skipped` instead of aborting the run. No
  adoption, no write, no new bookkeeping entry.
- **A third countable tripwire (AUD-002)** - running a mechanical procedure (a helper script, a bulk
  find/replace, a verify cycle over a fixed list, debugging a helper written a minute ago) is a
  `general-purpose` subagent's job with exact inputs and an output contract, not the orchestrator's.
  The countable moment is the SECOND inline fix of the same helper in one session. It is in
  `docs/WORKFLOW.md` and in the managed `CLAUDE.md` region, so it travels to installed projects.
- **The COO's own readiness pass, before any paid one (AUD-002)** - `docs/WORKFLOW.md` § Plan
  readiness: a finished draft is re-read in a separate turn against the six readiness checks, every
  `file:line` opened and every command executed on the recorded OS channel, before an auditor is
  dispatched. A paid pass verifies decisions; precision is paid for on the author's own account.
- **A fifth brief-authoring failure: a scope guard is anchored to HEAD at dispatch (AUD-002)** -
  never to the previous ticket's commit, which silently includes everything committed in between
  (typically the orchestrator's own completion-record commit) and manufactures a VERIFY failure the
  Writer cannot and must not fix. Guards that intentionally span several tickets keep their named
  base and say so.
- **Public install path (PUB-001)** - the plugin installs from the GitHub marketplace this
  repository serves: `/plugin marketplace add divels-studio/promptandpray` +
  `/plugin install pnp@promptandpray`, and `/plugin marketplace update` +
  `/plugin update pnp@promptandpray` + `/reload-plugins` + `/pnp:update` for a newer version.
  `README.md`, `docs/README.md` and `dev/README.md` put that path first and keep the local checkout
  as the alternative; `plugin.json` now names its `repository` and `homepage`. `/reload-plugins` is
  spelled out at every one of those places because a running session keeps the version it loaded at
  startup - the update lands on disk, and `/plugin list` is what says which version is live.

### Changed

- **A Claude auditor is never below the author (AUD-001)** - one rendered `reviewer` agent file per
  installation, whose `model` is the Reviewer's own when the Reviewer is claude-hosted and `fable`
  otherwise, and whose `effort` is always `roles.reviewer.effort` (the Agent tool has no
  per-invocation effort, so a Claude row carries none of its own). The file is now rendered when
  the Reviewer role OR any review row is claude-hosted. `/pnp:roles --show` marks a Claude auditor
  below the top tier; QA is deliberately not marked - it compares artifacts against acceptance
  criteria rather than auditing decisions.
- **The doctrine reads the table instead of stating rules (AUD-002)** - `docs/WORKFLOW.md`,
  `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`, `docs/OPERATOR_PROTOCOL.md`, `/pnp:review`,
  `/pnp:work`, the `README`, the reviewer agent template, the overrides template and the managed
  `CLAUDE.md` region no longer hardcode "two passes", "a third pass", a docs-class host or a model.
  The review brief carries `Class: plan | code | docs`, `/pnp:review` resolves that row through the
  resolver's `-Class`, plan readiness runs `review.plan.passes` with `review.plan.passes` + 1 as the
  hard maximum, and a docs-class ticket on a Claude host is a configuration `/pnp:roles` shows.
- **The fact-check gate guards the expensive pass, whichever engine hosts it (AUD-002)** - it runs
  before every reviewer pass above the scan tier (a Codex pass, or a Claude reviewer on
  `opus`/`fable`), over a diff **or over a plan**, and may be skipped only when the reviewer itself
  runs on a scan-tier model. The old wording skipped it whenever the Claude branch resolved, which
  was wrong the moment a Claude auditor became the expensive one.

### Removed

- **The ad-hoc `opus` reviewer for docs-class diffs (AUD-001)** - "a docs-class ticket goes to a
  Claude host regardless of the configured engine" is no longer a rule with a hardcoded model. It
  is `review.docs`, which starts out inheriting the same auditor as `review.code` and is one
  `/pnp:roles --set` away from anything else. A Claude-hosted row now dispatches the project's
  rendered `reviewer` agent, which exists whenever the Reviewer role or any row is Claude-hosted.
- **The plan pre-pass as a separate step (AUD-002)** - it was the fact-check gate under a second
  name, run over a plan instead of a diff. There is now one rule: fact-check before every pass above
  the scan tier, over a diff or a plan.

## [0.1.2] - 2026-08-31

The first consumer update (0.1.0 -> 0.1.1 on a real installation) produced two take-new dialogs for
artifacts the operator had never opened. A question that cannot be answered wrongly is not a gate, so
the update engine now asks only where there is operator content to lose - and says in the CHANGES
report what happened to every managed artifact.

### Changed

- **A payload change alone is no longer a conflict (P9)** - `scripts/update/migrate.mjs`: an unheld
  artifact the operator has not edited, whose payload render changed, is applied WITHOUT a dialog,
  through the same take-new path an operator decision goes through (same journal, same stage, same
  resume). The run says why: `<key>: the payload version applied (you had not edited it)`. A dialog is
  still raised - and the file still left untouched - when the operator edited the artifact, when it is
  GONE, and when a held artifact was edited again; a held, untouched artifact is still recorded as
  upstream and never re-applied. `/pnp:update`'s dry run now stops only where a decision is genuinely
  needed (a config key that asks, or a real edit of yours).
- **The CHANGES report names each artifact's final state (P9)** - every `rerender-managed-region`
  line in "Applied" carries `payload-current` or `held (your version kept)`, derived from the final
  bookkeeping only, so the report is identical whether the update ran in one process or resumed after
  a crash. One header sentence says which artifacts were applied without a dialog, which were asked
  about and which were only recorded. Accepted boundaries, stated in
  `migrations/0003_quiet-rerender/NOTES.md`: auto and operator take-new are not distinguished, and
  neither are applied and already-current.
- **Plan-readiness reviews always run on the configured engine (P9)** - the docs-class engine
  override from 0.1.1 applies to IMPLEMENTATION diffs only (`/pnp:review` Step 0c and its
  plan-readiness mode, `docs/WORKFLOW.md`, `docs/LOOP.md`). A cheap Claude pre-pass before the first
  pass is allowed, without a verdict, exactly like the fact-check gate.
- **The quota gate names its mechanics (P9)** - `docs/WORKFLOW.md` and the managed
  `CLAUDE.md#aiwf-core` region listed "expensive-quota passes" as an operator gate with no mechanics,
  which read literally made the orchestrator ask before EVERY paid pass. The gate is now the passes
  BEYOND the review contract - a third plan-readiness pass, a correction round past the cap - while
  the passes the route already prescribes run on the ticket's standing word. `0003_quiet-rerender`
  carries that region re-render, which on an unedited region applies with no dialog at all: the new
  conflict rule's first proof on a real installation.
- **The example cycle proves both halves of the rule (P9)** - `0004_example-bump` (renumbered from
  `0003_example-bump`, which the ascend-by-1 rule requires now that the payload ships a third
  migration) gains a second `rerender-managed-region`, over an artifact the cycle never edits: zero
  dialogs for it, `payload-current` in the report, and the hand-edited region still takes the
  keep-mine path.

### Fixed

- **The 0.1.0 entry below overstated the example cycle (P9)** - it exercises `keep-mine` and
  `take-new` (`merge` lives in the update suite) and contains no crash injection (resume after an
  interrupted migration is proven in the update suite, section 9). Corrected in place.
- **The self-check pins the new rule and the readiness carve-out (P9)** - `/pnp:update`'s conflict
  sentence and the plan-readiness clause are asserted as text with their own flipping controls,
  `/pnp:update` joins the six skills carrying the canonical "reading is not a shell job" sentence,
  and the example-fixture controls read the bump's id from `bump.json` instead of hardcoding a number
  that legitimately moves.

## [0.1.1] - 2026-08-30

Hygiene from the first real run of the loop through the plugin, one doctrine correction learned
from an observed violation, and the first migration with operations
(`0002_operator-word-and-hygiene`) - so an installed project takes all of it through
`/plugin update` + `/pnp:update`.

### Added

- **A ticket born after a standing word waits for its own word (P8)** - `docs/WORKFLOW.md` guard
  (b), the managed `CLAUDE.md` region, `/pnp:mission` and `/pnp:work`: a NEW ticket (one not in the
  PLAN's recorded execution order) is written into the PLAN, announced in ONE sentence, and STOPS -
  zero mutations on it until the operator's word for THAT ticket. The earlier reading, "the
  announcement is a notification, not a question", is explicitly REVOKED: it allowed a ticket to be
  born and started in the same turn without a word.
- **Review engine by ticket class (P8)** - the review brief carries `Class: docs | code` (`code`
  when absent) and `/pnp:review` Step 0c branches on it: a docs-class ticket is reviewed by the
  `reviewer` Claude subagent whatever `roles.reviewer.engine` says, a code-class one by the
  configured engine.
- **Fact-check gate before a paid pass (P8)** - `/pnp:review` Step 2b: one cheap read-only scan
  agent over the PROSE of the diff, returning only the false or unverifiable claims with
  `file:line`, before any pass on a paid external engine. The Reviewer verifies decisions; it is
  not the mechanism that discovers a wrong path or a wrong count.
- **A second paid pass only when the correction round touched code (P8)** - in the not-configurable
  half of `docs/WORKFLOW.md` § "Loop shape and its overrides". Prose-only corrections are verified
  by the fact-check gate plus the COO's own first-hand check, recorded in the completion record; the
  operator may always ask for a paid pass explicitly.
- **"Reading is not a shell job" as a skill instruction (P8)** - one identical sentence in Step 0 of
  `/pnp:mission`, `/pnp:work`, `/pnp:setup`, `/pnp:review`, `/pnp:qa` and `/pnp:loop`, and in the
  writer agent.
- **A `## VERIFY` section in the writer agent (P8)** - run every VERIFY command literally, report
  the exact exit code the harness shows, never append `; echo "X=$?"`.
- **Worktrees and memory (P8)** - a short section in `docs/OPERATOR_PROTOCOL.md`: a git worktree is
  a separate project path and therefore a separate memory directory; copying and merging memory is
  manual, and it is a harness fact, not a plugin mechanism.
- **A PAYLOAD DOCTRINE section in the self-check (P8)** - the rules that exist only as text are
  asserted as text, each with its own flipping control (including one that only REWORDS a rule), and
  the project layer now proves an owned ask rule belongs to the ruleset rendered for the CURRENT
  project root.

### Changed

- **The template-contract comment is stripped from every render (P8)** - `<!-- TEMPLATE CONTRACT`
  blocks are notes for whoever edits a template and no longer reach the rendered agent, overrides
  document or managed region. Both engines render through one shared context builder, so setup and
  update cannot disagree about the bytes.
- **`0002_operator-word-and-hygiene` re-renders the managed `CLAUDE.md` region and
  `.claude/agents/writer.md` and reconciles the ask ruleset (P8)** - deliberately with no op for
  `agents/reviewer.md` / `agents/qa.md`, which are absent on a codex-hosted install; the migration's
  `NOTES.md` states that limit and the two ways to re-render them.
- **The Gate 2 dialog spike is recorded as OBSERVED (P8)** - `scripts/spike/README.md`: the native
  Yes/No dialog was seen in `always` mode carrying the `[plugin:pnp]` tag, and a dispatch naming an
  on-plan ticket passed silently in `off-plan`. The procedure stays as the reproduction recipe.

### Fixed

- **A re-run no longer keeps ask rules rendered for a project root that is gone (P8)** - the
  to-remove half of the reconcile formula now lives in `planAskRules` itself, so setup and update
  apply it identically: an owned rule that is not in the desired set for the CURRENT root leaves
  `settings.json` and `ownedAskRules`. It is NOT tombstoned - a tombstone means the operator removed
  it - and a foreign rule that merely mentions the old path is untouched.
- **The blanket `Bash(git -C:*)` ask rule is gone from the factory ruleset (P8)** - it gated every
  `-C` form of every git command, read-only ones included, while adding nothing to the
  push/merge/rebase gate, which keeps its three rendered `Bash(git -C <projectRoot> ...)` forms.
  Consumers lose it through the migration's `reconcile-ask-ruleset` op only where the plugin
  inserted it.
- **The rendered writer agent no longer carries the template-contract comment or a mixed-slash
  overrides path (P8)** - the overrides document is now one absolute path in the native separator of
  `config.os`.

### Known limits (stated, not hidden)

- The hooks trust the harness identity fields and the permission rules match by command prefix:
  accident-grade, not adversary-proof. Mutations performed through shell commands are doctrine,
  not enforcement.
- On a claude-hosted reviewer or qa role, `agents/reviewer.md` / `agents/qa.md` keep the
  template-contract comment until they are re-rendered by `/pnp:setup` or
  `/pnp:update --resolve <key>` - see the migration's `NOTES.md`.

## [0.1.0] - 2026-08-29

First tagged version. Pre-release, private, not published to any marketplace. Extracted from a
production project's native AIWF working loop and genericized; proven by a dogfood installation in
that project (adopt mode, two Writer dispatches through the plugin-hosted loop, one real ticket).

### Added

- **Plugin skeleton** - `.claude-plugin/plugin.json` (`name: pnp`), `hooks/hooks.json` wired
  through `${CLAUDE_PLUGIN_ROOT}`, LF normalization via `.gitattributes`.
- **Two enforcement hooks, three responsibilities.** Gate 1 (`pretooluse-mutation-guard.js`):
  the Edit/Write family is allowed only for the true main session or the `writer` subagent.
  Gate 3 (same file, `enforcement.routeWriteGuard`): while `.aiwf/route-state.json` names an
  R2/R3 route the main session writes only `docs/**`, `.aiwf/**` and root `*.md`. Gate 2
  (`pretooluse-dispatch-gate.js`): the Writer dispatch through the Agent tool becomes a native
  Yes/No dialog - on every dispatch (`enforcement.dispatchGate: "always"`, factory default) or
  only when the brief's `Ticket: <REF>` line names no ticket in an active PLAN (`"off-plan"`).
  Every unreadable or malformed state of either key fails towards the dialog, never towards
  silence.
- **Ten skills** - `/pnp:loop`, `brief`, `mission`, `work`, `review`, `qa`, `qal`, `setup`,
  `update`, `selfcheck` - sharing one Step 0 (project root via `git rev-parse --show-toplevel`,
  config read, version interlock); `update` and `selfcheck` are the documented interlock
  exceptions.
- **Engine-neutral review roles.** Role resolver plus three Codex wrappers with locked flags
  (Reviewer and QA under `--sandbox read-only`, QAL operator-gated without a sandbox), on two
  mirrored OS channels: `scripts/native/ps/` (Windows, PowerShell 5.1-compatible, ASCII-only)
  and `scripts/native/sh/` (Linux/macOS, bash; brief on stdin only, NUL-delimited resolver
  transport). The Claude-hosted alternative renders `reviewer`/`qa` subagents held read-only by
  tool allowlist + Gate 1.
- **Config schema v1** (`schema/aiwf.config.schema.json`, draft 2020-12) as the single authority
  for `aiwf.config.json`; a schema-driven validator that fails loudly on any unknown keyword.
- **Setup engine** (`scripts/setup/`): interview (interactive or `--answers-file`), plan-then-write
  generator (a blocker means zero bytes written), three-state hash bookkeeping for the managed
  artifacts (`roles.json`, `agents/*.md`, the `aiwf-core` region of `CLAUDE.md`), ask-ruleset
  ownership without takeover and with tombstones (`_aiwf.ownedAskRules` /
  `_aiwf.suppressedAskRules`), a hand-owned `PROJECT_OVERRIDES.md` that is never rewritten, memory
  seeds printed rather than written.
- **Adopt mode** (`/pnp:setup --adopt --adopt-file`): installs into a project that already carries
  the loop by hand - identical artifacts are recorded clean, differing ones take an explicit
  per-artifact `keep-mine` / `take-new` decision, nothing is ever deleted, superseded legacy files
  are listed advisory-only; refused on a project that already has an installation.
- **Update engine** (`scripts/update/`): migration manifest (`migrations/index.json`, ops per
  version), fail-closed payload validator, migrator with a write-ahead journal and durable staging
  under `.claude/aiwf-native/update-stage/`, deterministic crash recovery, the
  `take-new` / `keep-mine` / `merge` conflict machine with an `override` that is never re-applied,
  read-through dry-run preview, CHANGES report, `--check` interlock, `--resolve <key>` outside a
  version bump.
- **Self-check** (`scripts/selfcheck/`): payload invariants (both hooks executed at their real
  entrypoints, resolver parity across both channels, wrapper flag locks byte-level), the project
  layer (bookkeeping, rendered artifacts, ask ownership, paths), a provenance scan of the whole
  payload (origin-project names, e-mail addresses, Cyrillic code points, absolute drive paths
  outside an allowlist), and negative controls proving every assertion can fail. It is the final
  step of `setup` and `update`; a red self-check after a successful write exits 1 and says so.
- **Example project and CI** (`examples/example-project/`, `.github/workflows/ci.yml`): the full
  setup -> simulated bump -> update -> self-check cycle, exercising `keep-mine` and `take-new`
  (`merge` and crash-resume are proven in the update suite, not here); OS matrix
  Windows / Linux / macOS (shellcheck on the bash channel). (Corrected in 0.1.2 - the original entry
  claimed all three conflict decisions and resume after an interrupted migration.)
- **Doctrine as payload** (`docs/`): `WORKFLOW.md`, `LOOP.md`, `REVIEW_CHECKLIST.md`,
  `OPERATOR_PROTOCOL.md`, `SESSION_BRIEF_RECIPE.md`, `CODEX_REVIEW_QA_RECIPE.md`,
  `QA_BROWSER_INVESTIGATION.md` - read under the installed plugin root, never copied into a
  project.

### Fixed

- Gate 2 (`off-plan`): ticket-ref boundaries use the whole identifier alphabet
  (`(?<![A-Za-z0-9_-])...(?![A-Za-z0-9_-])`) - a `\b` boundary let `DEMO-1` pass silently
  against a plan that only carried `DEMO-1-EXTRA`.

### Known limits (stated, not hidden)

- The hooks trust the harness identity fields and the permission rules match by command prefix:
  accident-grade, not adversary-proof. Mutations performed through shell commands are doctrine,
  not enforcement.
- Ask-rule reconciliation on re-run is additive: an owned rule that is no longer desired - a rule
  the payload dropped, or one rendered for a project root that has moved - stays in
  `settings.json`. (Fixed in 0.1.1.)
- The factory ruleset carries a blanket `Bash(git -C:*)` ask rule that a project with a
  deliberately silent sibling repository will want to remove. (Fixed in 0.1.1.)
- The `writer` template renders its template-contract comment and a mixed-slash overrides path
  into the project's `agents/writer.md` (cosmetic). (Fixed in 0.1.1.)

[0.2.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.1
[0.2.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.2.0
[0.1.2]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.2
[0.1.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.1
[0.1.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.0
