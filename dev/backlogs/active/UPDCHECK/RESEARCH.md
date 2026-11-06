# RESEARCH - UPDCHECK

Two scan agents (sonnet, read-only), 2026-11-06: (A) the self-check's internals, (B) its callers, CI,
suites and documentation. Base: none (first plan of the entry). `SC` = `scripts/selfcheck/aiwf-selfcheck.js`
(10,171 lines). The COO opened `scripts/selfcheck/run-selfcheck.mjs:1-113` and `SC:9925-10019` itself.

## Code Map

| file | role today |
|---|---|
| `scripts/selfcheck/aiwf-selfcheck.js` | the whole self-check: CLI, reporting, 40 section titles from 28 section functions, `main()` |
| `scripts/selfcheck/run-selfcheck.mjs` | the one spawn of the self-check child after a writing apply, and its exit/wording contract |
| `scripts/update/aiwf-update.mjs` | `/pnp:update` CLI; calls `finishWithSelfCheck` after a writing `--apply`; `--no-selfcheck` |
| `scripts/setup/generate.mjs`, `scripts/setup/interview.mjs`, `scripts/setup/aiwf-roles.mjs` | the other three `finishWithSelfCheck` callers (setup, its direct CLI, `/pnp:roles`) |
| `scripts/update/test-update.mjs` | acceptance suite; § 18 runs the integrated self-check for real and parses its tally |
| `scripts/setup/test-setup.mjs` | acceptance suite; runs the self-check for real, pins the call sites and the PASS line |
| `scripts/ci/run-example-cycle.mjs` | example cycle; the embedded self-check twice plus a standalone run; `DOCUMENTED_COMMANDS` |
| `examples/example-project/README.md` | the documented commands the self-check compares with `DOCUMENTED_COMMANDS` |
| `.github/workflows/ci.yml` | CI: the self-check in its no-fixture form on windows, ubuntu, macos |
| `skills/update/SKILL.md`, `skills/setup/SKILL.md`, `skills/selfcheck/SKILL.md` | the operator-facing promises about the self-check |
| `scripts/selfcheck/README.md` | the selfcheck directory's readme (not opened) |
| `.claude/aiwf-native/aiwf.config.json` | this repository's `verify.commands` row `selfcheck` (fixture form) |
| `dev/VERIFY_RUNBOOK.md` | the dev-side forms of the self-check and their traps |

## What the code does today

1. The embedded child is exactly `node <pluginRoot>/scripts/selfcheck/aiwf-selfcheck.js --plugin-root <pluginRoot> --project-fixture <projectRoot>`, `spawnSync` with no timeout and no streaming - the operator sees nothing until it exits (`run-selfcheck.mjs:60`; contract point 2 at `:13-15`).
2. On exit 0 the caller prints `self-check: PASS - <the child's last non-empty stdout line>` (`run-selfcheck.mjs:98-99`); on non-zero, both streams verbatim and a FAIL verdict, exit 1 (`:102-112`); unspawnable -> `COULD NOT RUN`, exit 1 (`:91-97`); `--no-selfcheck` -> `SKIPPED` (`:86-88`).
3. The update runs it at two sites - after a `$schema`/bookkeeping refresh on an already-current project and after `updated:` (`aiwf-update.mjs:156-162`, `:178-182`); never on `--check` / `--dry-run`.
4. The engine's flags are `--plugin-root`, `--project-fixture`, `--keep-fixture`; unknown flags are silently ignored (`SC:67-74`, `:9930`). No section filter, mode, skip flag or parallelism exists anywhere (agent A grep; `main()` `SC:9958-9987` calls all 28 functions unconditionally, opened by the COO).
5. Without `--project-fixture` a synthetic fixture is written and the project-layer checks are tagged `[fixture]`; `version-stamp` degrades to a NOTE (`SC:9933-9942`, `:7391-7393`, `:7484`). Nothing else changes; the time does not drop.
6. The file already declares two subjects: class A payload invariants, class B project-layer invariants (`SC:14-26`; `skills/selfcheck/SKILL.md:9-10`) - not selectable.
7. Three places read the real project: `sectionProjectLayer` (`SC:7477`), the inspected-project reading of `sectionCommitAutomation` (`commitAutomationNote(projectRoot)` `SC:7989`; the rest of the function, `SC:7996-8150`, builds synthetic git fixtures under `tmpRoot`) and block 4 of `sectionPlanRefNaming` (`SC:1510-1536`, the project's active plans); every other section proves the payload on its own temp fixtures (agent A, the section table below; corrected after round 1, I1).
8. Hosts are found at module load, before `main`: `findPwsh` (`SC:208-215`) and `findBash` (`SC:258-288`), no timeout on the production probe.
9. Wrapper runs: one run = one host spawn with its own temp stub home (`runWrapperWithStub` `SC:4685-4819`, `runPsWrapperWithStub` `SC:3719-3848`).
10. PS RESUME CONTROLS (`SC:3424-3449`): a full 36-spawn pass on a base copy, ~38 exec-targeted controls at one spawn each, then a THIRD full 36-spawn pass on `PLUGIN_ROOT` (`SC:3446`) after the one at `SC:3422`.
11. Bash channel (`SC:5080-5115`): a full 52-spawn pass on the payload (`:5082`), a second full 52-spawn pass on the pristine copy (`:5088`), then ~64 exec-targeted controls - ~168 bash spawns.
12. REVIEW AND QA WRAPPERS output contract (`SC:5996-6022`): 17 probes + the two-logs probe per channel, plus 26 controls per channel - ~90 wrapper spawns.
13. EXAMPLE FIXTURE CONTROLS (`SC:9655-9696`): ~43-47 controls, each a whole-payload copy (`copyPayloadTree` `SC:9491-9499`) plus ~3 node spawns that are not gated by `guardProbes`.
14. NEGATIVE CONTROLS (`SC:9862-9921`): ~41 controls, each a tree copy and `projectLayerFindings`, which always spawns 2 node processes (`SC:7285`, `:7459`).
15. Existing cost levers: `execProbes` as `true` or a one-id Set (`SC:3511`, `:3438`, `:4267`, `:5101`), `guardProbes` (`SC:9118`, `:9685-9686`), `captureFindings(..., only)` (`SC:6060-6062`).
16. Measured 2026-11-06 (ROADMAP § UPDCHECK): 91 s at v0.2.0, 701 s at 0.3.12; the 5 slowest titles 506 s; the sections that execute wrappers or a shell host 585 s of 701 s.
17. CI runs `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` (no fixture) on three OSes (`ci.yml:60-61`, `:102-103`, `:150-151`); this repository's VERIFY row is the fixture form (`aiwf.config.json:202-204`).

### Sections in call order (agent A; `main` `SC:9960-9987`)

| # | title (short) | function | kind | spawns |
|---|---|---|---|---|
| 1 | BASH HOST | `sectionBashHost` SC:370 | payload (host) | a few, 15 s timeout |
| 2-10 | GATE 1, GATE 2, GATE 2 MODE, ONE PREFIX PER PLAN, GATE 4, GATE 3, TOGGLE, SURFACE, PLANNING | `sectionGate*`, `sectionPlanRefNaming` | payload | node hook per case (`runHook` SC:185-203) |
| 11-12 | CONFIG SCHEMA, MIGRATION PAYLOAD | `sectionConfigSchema`, `sectionMigrationPayload` | payload | node validators |
| 13-15 | HOOK WIRING, MARKETPLACE (+ CONTROLS) | static | payload | none |
| 16-19 | WRAPPERS, PS channel, PS RESUME CONTROLS, resolver source | `sectionWrappers` SC:3252 | payload | 3 + 36 + ~110 PS |
| 20-21 | bash channel, bash CONTROLS | `sectionShWrappers` SC:5080 | payload | ~168 bash |
| 22-25 | PLAN GATE (CLI, wrappers, Gate 2, CONTROLS) | `sectionPlanGate` SC:5598 | payload | node per case, ~47 controls |
| 26-27 | REVIEW AND QA WRAPPERS output contract, CAPTURE HELPER | `sectionRunHeader` SC:5996 | payload | ~90 wrapper + ~11 |
| 28-29 | ROLE RESOLVER (PS, bash) | `sectionResolver` SC:6185 | payload | ~37 PS, ~10 bash |
| 30 | /pnp:roles engine | `sectionRolesCommand` SC:6523 | payload, temp projects | ~40 node |
| 31-33 | PAYLOAD INTEGRITY, PROVENANCE (+ CONTROLS) | static | payload | none |
| 34-35 | EXAMPLE FIXTURE (+ CONTROLS) | `sectionExampleFixture` SC:9648 | payload | ~13 + ~140 node, ~47 repo copies |
| 36 | PROJECT LAYER | `sectionProjectLayer` SC:7477 | project (real) | 2 node |
| 37-38 | PROJECT LAYER OBSERVATIONS (drafts, e2e outputDir) | SC:7496, SC:7674 | project logic on own fixtures | git, node |
| 39 | COMMIT AUTOMATION | `sectionCommitAutomation` SC:7986 | project (real `.git`) | none |
| 40 | NEGATIVE CONTROLS | `sectionNegativeControls` SC:9862 | project logic on own fixture | ~85-90 node |

### Writes and what runs beside them (COO, after round 1, B3)

Opened: `SC:1255-1286`, `SC:1500-1540`, `SC:7039-7490` (no write: an awk of `writeFileSync|mkdirSync|rmSync|renameSync|copyFileSync|appendFileSync|mkdtempSync` over that range returned nothing), `SC:7986-8160`, `SC:9925-10019`.

| function | read | write | lock | beside it |
|---|---|---|---|---|
| `main()` | `--project-fixture` path (`SC:9930-9937`) | `mkdtempSync` project only when the flag is absent (`SC:9934`); `writeFixture(PROJECT)` only when the path is missing or empty (`SC:9938-9941`); `mkdtempSync` scratch `tmpRoot` (`SC:9944`); `rmSync` of both in `finally` (`SC:10014-10015`) | none | a second run gets its own `mkdtemp` names; the embedded call always passes an installed, non-empty project, so it never writes into it |
| `sectionPlanRefNaming` | the project's `aiwf.config.json` and `<plansDir>/active` (`SC:1512-1527`) | fixture dirs `refnaming-*` under `tmpRoot` (`SC:1259-1283`) | none | the per-run `tmpRoot`; the real project only read |
| `sectionCommitAutomation` | the inspected project's `.git` (`commitAutomationNote(projectRoot)` `SC:7989`) | synthetic git dirs `commit-automation-*` under `tmpRoot` (`SC:7996-8150`) | none | the per-run `tmpRoot` |
| `projectLayerFindings` / `sectionProjectLayer` | the project layer (`SC:7039-7490`) | none | none | spawns `runRoleRules` and `validate-config.mjs` read-only (`SC:7285`, `:7459`) |

Two runs (full and project, or two applies) share no written path; the real project is read only on the embedded path.

## Consumers and adjacent contracts

- Embedded argv: written at `run-selfcheck.mjs:60`, documented as exactly that argv at `:13-15`; inherited by setup, interview and roles (`generate.mjs:1478-1485`, `interview.mjs:309`, `aiwf-roles.mjs:711`/`:724`); call sites pinned by `test-setup.mjs:1048-1105` (`CALL_SITES = 5`, `:1050`).
- Standalone argv: `skills/selfcheck/SKILL.md:29-38`, `run-example-cycle.mjs:63` (`DOCUMENTED_COMMANDS` `:57-65`) compared both ways with `examples/example-project/README.md` by the self-check (`run-example-cycle.mjs:55`).
- PASS line: `test-setup.mjs:172-174` (`/self-check: PASS - .*assertions passed/`), `test-update.mjs:1970-1973`, `run-example-cycle.mjs:477`, `:603`; the tally `==== P/T assertions passed ====` (`SC:10162-10167`) parsed by `test-update.mjs:2036`, `:2040`, `:2068`; a stub tally at `test-setup.mjs:1013-1023`.
- Source-text coupling: `test-update.mjs:2026-2028`, `:2056-2058` patch the literal `    sectionGate2(tmpRoot);` in `main` (`SC:9962`).
- Exit code: 0/1 at `SC:10167`, 2 only from `bail` (`SC:76-83`); the caller contract in `aiwf-update.mjs:32-40`, `skills/update/SKILL.md:84-85`, `:95-99`, `skills/setup/SKILL.md:134-145`, `skills/selfcheck/SKILL.md:38`.
- Operator promises: `skills/update/SKILL.md:89-104` (runs itself, PASS line, `--no-selfcheck`, `/pnp:selfcheck` re-runs; no duration or scope promised); `skills/selfcheck/SKILL.md:17-19`, `:33-36`, `:51-59` (what the run proves); `README.md:185`, `:189`, `:219`; `skills/README.md:11`.
- Dev contracts: `dev/VERIFY_RUNBOOK.md:11-17`, `:21-25`, `:60-62`; `dev/PROJECT_OVERRIDES.md` § Test policy (the prose-only release owes the self-install apply with its embedded self-check) and § Architecture direction ("every assertion has a negative control").

## What already exists

- The class A / class B split in prose (`SC:14-26`, `skills/selfcheck/SKILL.md:9-10`), not selectable.
- Per-control cost gates: `execProbes`, `guardProbes`, `captureFindings(..., only)` (fact 15).
- `--no-selfcheck` on all four callers (skips the whole run); `--keep-fixture`.
- ROADMAP § SUITES "make the suites fast" (`dev/backlogs/CANDIDATES.md:1284`) - the dev suites, out of this entry's scope.

## Paths touched without being named

- The three other `finishWithSelfCheck` callers inherit any change to the embedded argv or wording (setup, interview, roles).
- The COVERAGE text printed on every run (`SC:10025-10153`) describes the sections.
- `run-example-cycle.mjs` `DOCUMENTED_COMMANDS` and `examples/example-project/README.md` (both compared by the self-check).
- Every `skills/*/SKILL.md` Step 0 names `/pnp:selfcheck` as an interlock exception (wording only).
- Docs stating what the self-check pins: `docs/CODEX_REVIEW_QA_RECIPE.md:201`, `docs/LOOP.md:74`, `:114`, `:157`, `docs/WORKFLOW.md:57-58`; `templates/memory-seeds/ps-scripts-ascii-only.md:7`.
- A skill or template text change is a managed-artifact change: a migration + bump (`dev/PROJECT_OVERRIDES.md` § Release discipline).
- This repository is its own consumer: its self-install `/pnp:update --apply` runs the embedded form with `--project-fixture .`.

## Unknowns

1. Exact spawn counts per section and the per-spawn cost per host (PS start vs bash start vs node start) - settled by one instrumented run that times each section; the 2026-11-06 per-title timings exist only in a log outside the repository.
2. Whether the `bf-idle` / `bf-open` / `bf-cap` bash probes run near their 15 s ceiling (`SC:4614`, `:4795-4796`) - settled by the bounded `read` in `scripts/native/sh/codex-review.sh`.
3. The 701 s is a standalone fixture-form run on this machine, not a timed consumer `--apply` - settled by timing `aiwf-update.mjs --apply` once on a copy.
4. Whether PROVENANCE CONTROLS / PAYLOAD INTEGRITY copy the payload per control - settled by a grep of `copyPayloadTree(|copyTree(` in `SC:8187-9040`.
5. `scripts/selfcheck/README.md` content (flags or a section list) - one grep.
