# Changelog

All notable changes to PromptAndPray (`pnp`) are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow strict
`MAJOR.MINOR.PATCH` as enforced by `scripts/update/validate-payload.mjs`.

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
  setup -> simulated 0.1.0 -> 0.2.0 bump -> update -> self-check cycle, all three conflict
  decisions and resume after an interrupted migration; OS matrix Windows / Linux / macOS
  (shellcheck on the bash channel).
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
- Ask-rule reconciliation on re-run is additive and tombstone-only: a rule already present in
  `settings.json` is never rewritten, and a removed owned rule becomes a tombstone rather than
  being deleted from the bookkeeping. The factory ruleset carries a blanket `Bash(git -C:*)`
  ask rule that a project with a deliberately silent sibling repository will want to remove.
- The `writer` template renders its template-contract comment and a mixed-slash overrides path
  into the project's `agents/writer.md` (cosmetic).

[0.1.0]: https://github.com/divels-studio/promptandpray/releases/tag/v0.1.0
