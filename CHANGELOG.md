# Changelog

All notable changes to PromptAndPray (`pnp`) are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow strict
`MAJOR.MINOR.PATCH` as enforced by `scripts/update/validate-payload.mjs`.

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

[0.1.2]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.2
[0.1.1]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.1
[0.1.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.0
