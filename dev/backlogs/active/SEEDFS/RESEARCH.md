# RESEARCH - plan SEEDFS

Two scan agents (sonnet, read-only, 2026-11-08), first plan of the entry - no base. Pointers were
opened by the agents; the COO opened `migrate.mjs:480-565`, `generate.mjs:625-700`,
`GENERIC-003.md` and the GENERIC decisions D-09/D-10 itself. No claim was contradicted between the
two replies.

## Code Map

| file | role today |
|---|---|
| `scripts/update/migrate.mjs` | update engine; owns the whole `seed-file` path (plan, refuse, exists, apply) and the dry-run overlay |
| `scripts/update/aiwf-update.mjs` | CLI; parses `--project-root` / `--dry-run` / `--apply`, builds `projectRoot`, calls `runUpdate`, runs the self-check |
| `scripts/setup/generate.mjs` | setup; holds `canonicalPath`, `isInsideDir`, `samePath` (private) and the exported `resolveTransferSurface` / `resolveRoadmap`; setup's real-filesystem surface and roadmap judgement - the model |
| `scripts/ci/run-example-cycle.mjs` | CI cycle driver; its own `canonicalize` copy for the work-dir guard |
| `scripts/engine/pretooluse-mutation-guard.js` | Gate 3 hook; lexical, copied `resolveTransferSurface` / `resolveRoadmap`, pure by design |
| `scripts/update/validate-payload.mjs` | payload-time validator of the seed-file op (token, default surface by name, traversal) |
| `scripts/update/test-update.mjs` | update acceptance suite; 15b seed-file, 15c the shipped 0026 replay |
| `scripts/setup/test-setup.mjs` | setup suite; sec 23 symlinked payload, sec 24 / 24b surface and roadmap junction escapes - the fixture pattern |
| `scripts/selfcheck/aiwf-selfcheck.js` | static self-check; knows seed-file only as an op-type name; isMain realpath scan |
| `migrations/0025_roadmap-seed/`, `migrations/0026_ledger/` | the two shipped seed-file ops |
| `migrations/0011_transfer-surface/NOTES.md` | the "never addressed" promise |
| `migrations/0039_selfcheck-jobs/` | latest migration; the one-`note` shape of a code-only release |
| `migrations/index.json`, `.claude-plugin/plugin.json`, `CHANGELOG.md` | release stamps |
| `.github/workflows/ci.yml` | windows + ubuntu blocking, macos advisory; each leg runs `test-update.mjs` |

## What the code does today

Transactional read of `planSeedFile` (`migrate.mjs:492-502`), the `seed` branch of `applyPlan`
(`:653-666`) and `applySeed` (`:556-564`). No lock, no journal anywhere in the seed path.

| site | kind | target | pointer |
|---|---|---|---|
| plansDir | read | `ctx.config.paths` | `migrate.mjs:509` |
| containment | read | none on disk - `path.resolve` / `path.relative` against `ctx.projectRoot`, lexical | `migrate.mjs:518-519` |
| overlay | read | `ctx.overlay.has(target)` | `migrate.mjs:540` |
| existence | read | `fs.statSync(projectRoot/target)` - follows links; ENOENT = absent, other errors throw, non-file throws | `migrate.mjs:542-551` |
| surface | read | `ctx.config.paths` -> `resolveTransferSurface`, compared lexically | `migrate.mjs:528-529` |
| template | read | `ctx.render(op.template)` | `migrate.mjs:499`, `:749` |
| dry run | write | `ctx.overlay.set(plan.target, plan.content)`, no disk | `migrate.mjs:660` |
| apply | write | `fs.mkdirSync(dirname(file), {recursive:true})` - follows links; the first disk write | `migrate.mjs:557` |
| apply | write | `fs.writeFileSync(file, lf(text), {flag:'wx'})`; EEXIST -> UpdateError "appeared after it was planned" | `migrate.mjs:559-562` |
| bookkeeping | write | `mergeBookkeeping` - a seed has none, no-op | `migrate.mjs:663` |
| config | write | per-migration `writeConfig` after the op loop | `migrate.mjs:831` |

The sequence AROUND the seed - `runUpdate` (`migrate.mjs:779-832`, opened by the COO at round 1) and
the shipped 0026 run (fact 16); no lock at any site, nothing runs beside it (`ORCHESTRATOR.md`
§ Branch policy, one executing session per tree):

| site | kind | target | pointer |
|---|---|---|---|
| preflight | read | payload, config file, pending migrations | `migrate.mjs:780` |
| `$schema` | write | `refreshSchemaRef(configFile, ...)` - the ONE write before the first op (dry run: none) | `migrate.mjs:784-786` |
| legacy bookkeeping | write | `writeAtomic(configFile, ...)` when already current and the shape was normalised | `migrate.mjs:792-793` |
| dry run | write | overlay only; sequential plan + `applyPlan` against the overlay | `migrate.mjs:803-816` |
| 0026 op 0 | write | the seed (`<plansDir>/LEDGER.md`) - the rows above | `migrate.mjs:821-822` |
| 0026 op 1 | write (memory) | `add-config-key paths.transferSurface` - config object in memory, the operator asked | `migrate.mjs:821-822`; fact 16 |
| 0026 op 2/3 plan | read | `planRerender` (opened by the COO at round 2): the bookkeeping record `ctx.config._aiwf.managedRegions[key]` | `migrate.mjs:442-446` |
| 0026 op 2/3 plan | read | the payload template rendered, `ctx.render(op.template)` | `migrate.mjs:447` |
| 0026 op 2/3 plan | read | the existing file through the overlay, `ctx.readProjected(op.file)` (null when absent) | `migrate.mjs:448` |
| 0026 op 2/3 plan | read (memory) | the region splice `spliceRegion` (op 2, `#aiwf-core`) or the additions carry `carryProjectAdditions` (op 3, a `.md`); `write` decided by `lf(fileText) !== lf(content)` | `migrate.mjs:452-466` |
| 0026 op 2 | write | `rerender-managed-region CLAUDE.md#aiwf-core` through `writeAtomic`, plus the bookkeeping `managedRegions[key] = payload.version` merged into the config object | `migrate.mjs:474-477`, `:821-822`, `:118`, `:663` |
| 0026 op 3 | write | `rerender-managed-region .claude/aiwf-native/ORCHESTRATOR.md` through `writeAtomic`, the same bookkeeping | `migrate.mjs:474-477`, `:821-822`, `:118`, `:663` |
| stamp | write | `lastMigrationApplied` + `installedPluginVersion` set, then ONE `writeConfig` per migration | `migrate.mjs:827-831` |

Setup's apply path, which the shared `samePath` touches (`generate.mjs:1359-1393`, opened by the COO
at round 1): `samePath` is read only in the PLAN phase - the collision checks `:945`, `:975`, `:1014`
that push blockers BEFORE any action exists - so D-11 changes which plans are refused, never how
`applyPlan` writes. Its sites, no lock:

| site | kind | target | pointer |
|---|---|---|---|
| directories | write | every `mkdir` action first, `mkdirSync recursive` | `generate.mjs:1363-1367` |
| parent | write | `mkdirSync(dirname(file), recursive)` before each write | `generate.mjs:1370` |
| exclusive write | write | `writeFileSync(..., {flag:'wx'})`; EEXIST -> `kept` | `generate.mjs:1375-1383` |
| plain write | write | `writeFileSync(file, text)` (managed artifacts) | `generate.mjs:1385` |
| remove | write | `rmSync(file, {force:true})` | `generate.mjs:1387-1388` |

1. `resolveTransferSurface` is imported from `../setup/generate.mjs` (`migrate.mjs:53-57`). `canonicalPath`, `isInsideDir`, `samePath` are NOT exported (`generate.mjs:639`, `:663`, `:675`). `toPosix` is local (`migrate.mjs:65`); `UpdateError` exit 1 (`:75`), `UpdateStartError` exit 2 (`:77`).
2. `resolveSeedTarget` (`migrate.mjs:508-524`) is lexical: expands `<plansDir>`, tests `path.relative(projectRoot, path.resolve(projectRoot, rel))` for `''`, absolute or first segment `..`, returns the POSIX project-relative path. No realpath: a junction or symlinked parent passes.
3. `refuseSurfaceSeed` (`migrate.mjs:527-536`) compares target and surface with `sameRel` - case-folded under `FOLD_CASE` (win32 or darwin, `:504-505`). A symlinked alias of the surface is not caught.
4. Order in `planSeedFile` (`:493-497`): resolve, then `seedTargetExists`, then `refuseSurfaceSeed`; the docblock `:488-491` says existence is tested BEFORE the refusal, so an existing surface is `kept` (mode `none`) and never reaches the check.
5. `seedTargetExists` uses `statSync` (follows): a junction to a directory is refused as "not a regular file"; a link to an outside regular file reads as `kept`; a DANGLING link gives ENOENT, counts as absent, and `wx` would then write through it (`:542-551`, `:559`).
6. `ctx.projectRoot` is passed through unchanged (`migrate.mjs:798`, `makeContext :738-740`); in `aiwf-update.mjs:124` it is `resolveProjectRoot(flag('--project-root'))` = `path.resolve(explicit)` or `path.resolve(git rev-parse --show-toplevel)` (`generate.mjs:380-384`). Not realpath'd. Setup canonicalises its root first (`generate.mjs:922`).
7. Dry run: `ctx.overlay = new Map()` (`migrate.mjs:806`), ops planned sequentially and applied to the overlay (`:810-811`); `seedTargetExists` sees overlay entries (`:540`) and otherwise stats the real disk. No journal exists (removed in `b3be045`).
8. Apply loop (`migrate.mjs:818-832`): plan then apply per op, one config write per migration; an `UpdateError` in op N leaves earlier ops written and the migration unstamped.
9. `canonicalPath` (`generate.mjs:639-652`) climbs to the nearest existing ancestor, `realpathSync.native` on it, re-joins the missing tail. `isInsideDir` (`:663-667`) strict descendant, segment-aware `..`. `samePath` (`:675`) folds case on win32 only; comment `:669-674` - realpath.native returns on-disk casing for the parts that exist.
10. Setup's judgement (`generate.mjs:918-992`): canonicalise root and surface, refuse when the surface is not inside the root (`:924-929`, message "really resolves to ... not inside the project"); three collision checks against `ownedDestinations` (`:939-969`); `statSync` non-file refusal (`:982-990`). The roadmap gets the same treatment (`:998-1040`).
11. Setup seeds with `existsSync` and an `exclusive: true` write action (`generate.mjs:1199-1207`, roadmap `:1214-1222`); its `applyPlan` does `mkdirSync` + `wx`, EEXIST -> `kept` (`:1359-1393`); comment `:1355-1358` says it matches `applySeed`.
12. `TRANSFER_SURFACE_BASENAME='PNP_CANDIDATES.md'` (`generate.mjs:690`), `LEDGER_BASENAME='LEDGER.md'` (`:692`); `resolveTransferSurface(paths)` = configured value or `<plansDir>/PNP_CANDIDATES.md` (`:693-697`); `resolveRoadmap` (`:707-709`) is NOT imported by migrate.mjs. Setup writes `paths.transferSurface = <plansDir>/LEDGER.md` for key-less installs (`:867-870`).
13. `run-example-cycle.mjs:191-204` `canonicalize` is a verbatim copy of `canonicalPath` (comment `:186-190`); `containmentProblem` `:209-217` uses it.
14. Gate 3 (`pretooluse-mutation-guard.js:130-139`): "`path.resolve` + `path.relative` and nothing more (no realpath, no filesystem access)"; `:216`, `:245` "Pure: no filesystem access"; copies at `:217-227` (surface), `:234-238` (roadmap); `:209-211` copied rather than imported because the hook loads nothing but `aiwf-lib.js` and a CommonJS `require()` of ESM depends on the Node version.
15. Validator: seed-file op spec `validate-payload.mjs:152-161` (comment `:156` - the surface is never a target); `SEED_TARGET_TOKEN='<plansDir>'` `:165`; `seedTargetError` `:174-188` refuses non-strings, other tokens, traversal, and the DEFAULT surface by name, case-folded (`:184`); the configured surface is run-time only (`:171-172`); op checks `:447-459`.
16. Shipped ops: 0025 `<plansDir>/ROADMAP.md` from `templates/ROADMAP.md.tmpl`; 0026 `<plansDir>/LEDGER.md` then `add-config-key paths.transferSurface` (askOperator) - the seed sees the OLD key (op order).
17. 0011 promise (`migrations/0011_transfer-surface/NOTES.md:28-29`): "no operation here or later may name the transfer surface"; `:23-24` "No `_aiwf.managedRegions` record, no `--resolve` address, no `rerender-managed-region` operation - not in this release and not in a later one"; `:31-32` "The update engine and the hooks never read it" - STALE since `169d9e1` (`migrate.mjs:529` reads the key).
18. History: `planSeedFile` / `applySeed` born in `926a3c6`; `refuseSurfaceSeed` and `FOLD_CASE` first appear in `169d9e1` (the GENERIC-003 split).
19. `test-update.mjs`: `check(name, ok, detail)` `:80-91`; no skip mechanism; summary `:2215-2220` prints `checks: N, failures: M` and `UPDATE SUITE: PASS|FAIL`. Helpers: `project(name)` `:157` under `tmpRoot = mkdtempSync(os.tmpdir()/pnp-update-test-)` `:71`; `at` `:114`; `read` `:111`; `why` `:108`; `install` `:191`; `update(p,args,{payload})` `:202` -> `{status,out}`; `baseAnswers` `:163` (plansDir `docs/backlogs`); `snapshot` `:127` reads a junction dirent as a file (trap noted at `test-setup.mjs:1944-1946`); `makePayload(name,{version,migrations})` `:266`; `writeJson` `:115`; `patch` `:143`.
20. 15b (`test-update.mjs:1476-1623`): `SEED_TEMPLATE`, `SEED_OP` (`<plansDir>/ROADMAP.md`), `ROADMAP_REL`, `writtenBeyondSchema` `:1486`; checks seed-1..21 (created / kept / dry run / plansDir moved / surface refused seed-12,13 / directory refused seed-14,15 / validator seed-16..21). NO outside-project runtime refusal test, NO junction test; the runtime escape message today is `which is not inside the project - nothing was written` (`migrate.mjs:521`).
21. 15c (`test-update.mjs:1625-1752`) replays the REAL `migrations/0026_ledger/ops.json` (`:1630`, shape pinned by ledger-0 `:1632`): ledger-1..5 (key on CANDIDATES, LEDGER created), ledger-6/7 (no key, ask), ledger-8/9 (present kept), ledger-10..12 (re-render), ledger-13/14 (key == LEDGER, file present -> kept), ledger-15 (key == LEDGER, file ABSENT -> exit 1 "the transfer surface of this installation", nothing created).
22. The only link in `test-update.mjs` is `:1906` - a dangling junction planted in the example-bump template, a HARD check (`:1907-1908`), cleanup `:1926` (`rmdirSync` then `unlinkSync`).
23. `test-setup.mjs` sec 24 escape fixture (`:1910-1973`): `makeEscape(name)` `:1915` - `target` a sibling project OUTSIDE, `fs.symlinkSync(target, at(p,'linked'), 'junction')` in try/catch -> `made`; `made` false FAILS the fixture check (`:1924`, comment `:1911-1913` - junctions need no administrator rights); controls `:1930-1935` (`realpathSync.native` equality, lexical innocence); exit 1, message `really resolves to` + `not inside the project` (`:1938-1940`); far side empty, top level only `linked` (`:1942-1948`); plansDir itself a junction (default surface) `:1958-1972`. Sec 24b roadmap escape `:2081-2101`. Sec 23 `:1564-1604` has the `[SKIP]` line pattern and `realTmp = fs.realpathSync(tmpRoot)` (`:1572`; macOS `/var -> /private/var`, `:1566-1571`).
24. Self-check: `OP_TYPES` `aiwf-selfcheck.js:9039`; isMain realpath scan `:8371-8413`; `junctionProbeFinding` `:9109-9145` (the cycle driver's work dir) with a simulated-EPERM control `:9768-9778` that FAILS rather than degrading. No section asserts on migrate.mjs seed behaviour.
25. CI (`.github/workflows/ci.yml`): `windows` `:25-28`, `ubuntu` `:68-71`, `macos` `:105-125` with `continue-on-error: true` `:126`; each runs `node scripts/update/test-update.mjs` (`:46-47`, `:93-94`, `:141-142`), Node 22. Nothing about symlink privilege; the junction sections of test-setup already run on every leg.
26. Release stamps: `migrations/index.json:40` last entry `0039_selfcheck-jobs` / `0.3.14`; `plugin.json:3` `0.3.14`; CHANGELOG top block `## [0.3.14] - 2026-11-07` (`:7`); `0039/ops.json` = ONE `note` op (`id`, `text`, `docRefs`), ending "This update re-renders nothing"; `migrations/README.md:21-23` a bump with nothing to do still ships a no-op migration, `:41`, `:70-76` note semantics, `:18-25` ids ascend by one.
27. `dev/VERIFY_RUNBOOK.md:22-29`: a version bump reds ONE row of the fixture-form selfcheck (`installedPluginVersion equals the payload version`) until `/pnp:update --apply` runs on this repository after the code commit; the pre-commit run of a release diff uses the CI form (`--plugin-root .` alone). `:72-74` macos advisory. No junction / EPERM / realpath trap recorded.

## Consumers and adjacent contracts

- **Runtime messages** - producers `migrate.mjs:495`, `:500` (`seed-file: <rel> (created|kept)`), `:521` (not inside), `:532` (surface), `:548` (not a regular file); readers seed-1/5/8, seed-12 (`the transfer surface of this installation`), seed-14 (`is not a regular file`), ledger-15. No test reads `:521`'s wording. Setup's real-path wording `really resolves to ... not inside the project` (`generate.mjs:926`, `:1004`) is pinned by `test-setup.mjs:1940`, `:2096`.
- **Ordering promise** - exists -> `kept` before the refusal: `planSeedFile` docblock `:488-491`, `CHANGELOG.md:490-491`, ledger-13/14.
- **Overlay key** - `ctx.readProjected` (`migrate.mjs:750-753`) and `seedTargetExists` (`:540`) key on the POSIX project-relative target.
- **`resolveTransferSurface` export** - imported by `migrate.mjs:56`; its Gate 3 copy must match it (`pretooluse-mutation-guard.js:229-231`).
- **Documented promises** - `migrations/README.md:42` (seed-file row); `0011 NOTES.md:28-32`; `0026 NOTES.md:24-28` (seed first, no seed may address the configured surface); `0025 NOTES.md:22-24`; `CHANGELOG.md:541-544`, `:490-491`, `:387`; `examples/example-project/bump/example-bump/ops.json:33`, `NOTES.md:14` (the `kept` case; the cycle asserts nothing on the printed line - CANDIDATES `:1424` (B)).
- **Validator** - `validate-payload.mjs:152-188`, `:447-459`, pinned by seed-16..21; payload-time, no project at hand.
- **Release stamps that move together** - `plugin.json`, `migrations/index.json` + the new directory (`ops.json`, `NOTES.md`), the CHANGELOG block; `validate-payload.mjs` checks the manifest.

## What already exists

- `canonicalPath` / `isInsideDir` / `samePath` (`generate.mjs:639`, `:663`, `:675`, private) and their use at `:922-926`, `:943-975`, `:1000-1025`; the `canonicalize` copy `run-example-cycle.mjs:191`.
- `resolveTransferSurface` already imported into migrate.mjs (`:56`).
- The junction fixture pattern `test-setup.mjs:1915-1948`, `:2084-2089`; the hard-fail-on-fixture pattern `:1924`, `:2088`, `test-update.mjs:1907`; the `realpathSync.native` comparison `:1930`.
- `seedTargetExists` already refuses non-regular files; `applySeed` already uses `wx`; `writtenBeyondSchema` tolerates the `$schema` refresh.
- The one-`note` release shape `migrations/0039_selfcheck-jobs/ops.json`.

## Paths touched without being named

- `fs.mkdirSync(dirname, {recursive:true})` (`migrate.mjs:557`) creates directories through any link on the way, before `wx`.
- `resolveRoadmap` is not consulted by migrate.mjs; the roadmap is reachable only as a plain seed target (0025).
- `writeAtomic` (`migrate.mjs:118`) and `writeConfig` (`:644-646`) join `projectRoot` lexically - not seed code, adjacent only.
- `renderContext(projectRoot, config)` (`:206-213`) renders templates with the lexical root; `refreshSchemaRef` writes the config before the first op (`:786`); `finishWithSelfCheck` runs the self-check on `projectRoot` (`aiwf-update.mjs:132-134`).
- `paths.transferSurface` / `paths.plansDir` read from `ctx.config` (`:509`, `:528`), mutated in memory by an earlier `add-config-key` in the same run.
- The example cycle runs the engine (the example bump's seed-file op) on every CI leg.
- macOS tmpdir sits behind `/var -> /private/var` (`test-setup.mjs:1557-1571`): any fixture comparing lexical against real paths needs `realpathSync` on its own side. Windows: `realpathSync.native` may differ in case / 8.3 names from the lexical spelling (`generate.mjs:669-675`).

## Unknowns

- Whether a `wx` create on a dangling link at the target itself errors or writes through, per platform (Linux `O_EXCL` does not follow a symlink -> EEXIST; Windows unverified). Settled by the ticket's red-first test for that case, not by a lookup.
- Whether `windows-latest` creates `'junction'` links without elevation in CI - implied by the junction sections of test-setup running green on that leg today (run 42406267228); a CI log line would confirm.
