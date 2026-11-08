# DECISIONS - plan SEEDFS

Numbered from 01 (first plan of the entry). The operator's words verbatim where they are the source;
engineering choices are the COO's, each with its one-line why. Research: `RESEARCH.md` (facts by
number below).

## Decisions

- **D-01** Containment is judged through the REAL filesystem. `resolveSeedTarget` keeps the
  `<plansDir>` expansion and keeps returning the POSIX project-relative path (the overlay key, D-05),
  but its containment test becomes canonical: the base is `canonicalPath(ctx.projectRoot)` (setup
  does the same at `generate.mjs:922`; the engine's root is only `path.resolve`d - fact 6), the child
  `canonicalPath(path.join(ctx.projectRoot, rel))`, the test `isInsideDir(base, child)` (strict,
  segment-aware). The refusal takes setup's wording: `seed-file "<raw>" really resolves to
  "<canonical, POSIX>", which is not inside the project - nothing was written.` The LEXICAL test
  stays as the first refusal, with today's `:521` sentence: it is what keeps the rel key and the
  summary line free of `..` (a hand-edited `plansDir` is not validated at payload time). ORDER in
  `planSeedFile`: resolve (token + lexical) -> exists (D-04; a present regular file is `kept`, exit 0,
  whatever link leads to it) -> canonical containment -> surface (D-02). Why: a junction under the
  project makes the lexical test pass while the write lands outside (facts 2, 9, 10); containment
  matters only where the engine would WRITE, so an existing file reached through a link outside the
  project stays `kept` as today - a consumer whose present ledger is a link does not lose
  `/pnp:update`. plan: SEEDFS
- **D-02** The surface is judged canonically. `refuseSurfaceSeed` compares
  `canonicalPath(join(root, target))` with `canonicalPath(join(root, surface))` through `samePath`;
  the message keeps `the transfer surface of this installation` (seed-12, ledger-15 pin it, fact
  21). `sameRel` / `FOLD_CASE` leave migrate.mjs - their only caller is `:530`. The ORDER stays:
  exists -> `kept` BEFORE the refusal (the 0.3.1 promise, `CHANGELOG.md:490-491`, ledger-13/14).
  Why: a lexically different spelling of the surface (an alias through a junction) is the same file
  on disk (fact 3). plan: SEEDFS
- **D-03** `canonicalPath`, `isInsideDir` and `samePath` are EXPORTED from `generate.mjs` and
  imported by `migrate.mjs` beside `resolveTransferSurface` (already imported, `:56`) - no copy.
  The `canonicalize` copy in `run-example-cycle.mjs` (a standalone CI driver, fact 13) and the
  lexical, pure Gate 3 copies (`pretooluse-mutation-guard.js:130-139`, CommonJS, loads nothing but
  `aiwf-lib.js`, fact 14) stay as they are. Why: one judgement, two engines - setup and update must
  agree on what "inside" means, and an import is how they cannot drift. plan: SEEDFS
- **D-04** A link at an ABSENT target is refused. `seedTargetExists` reads the target with
  `lstatSync` first: a symbolic link or junction whose `statSync` yields a regular file stays `kept`
  (nothing written, nothing to contain); a link whose `statSync` fails (dangling) or yields a
  non-file is refused with the existing "exists and is not a regular file" sentence, naming `a link`;
  a non-link entry behaves as today (fact 5). Why: `wx` through a dangling link would create the file
  where the link points, outside every check - and whether Windows follows it on create is unknown
  (RESEARCH § Unknowns), so the engine does not get to find out. plan: SEEDFS
- **D-05** The dry-run overlay key and the two summary lines keep the POSIX project-relative target
  (`seed-file: <rel> (created|kept)`); canonical paths appear only inside the judgement and in the
  refusal messages. Why: seed-1/5/8 and 15c pin the lines, and `ctx.readProjected` /
  `seedTargetExists` key the overlay on the rel path (fact 7, Consumers). plan: SEEDFS
- **D-06** The proof lives in `test-update.mjs` section 15c, on the SHIPPED 0026 ops (fact 21), red
  first on HEAD's `migrate.mjs`: (a) the JUNCTION test - `paths.plansDir` a junction pointing at a
  sibling folder OUTSIDE the project, no key -> exit 1, output carries `really resolves to` and
  `not inside the project`, the far side stays empty, nothing stamped; (b) the ALIAS test - a junction
  `linked` -> `<project>/docs/backlogs` INSIDE the project, `paths.plansDir: linked`,
  `paths.transferSurface: docs/backlogs/LEDGER.md`, the file absent -> exit 1 with `the transfer
  surface of this installation`, nothing created at either spelling; (c) the DANGLING-LINK test
  (D-04) - a junction at `<plansDir>/LEDGER.md` pointing at a non-existent sibling path -> exit 1,
  `is not a regular file`, nothing created at the link's target; (d) controls - the same three
  fixtures with a real folder in place of the junction still `(created)`, and a present regular file
  reached through a junction is `(kept)`. The fixture follows `test-setup.mjs:1915-1948`:
  `fs.symlinkSync(target, link, 'junction')` in try/catch, the `made` check a HARD failure (junctions
  need no elevation, fact 23; every CI leg runs those sections today, fact 25), the fixture's own
  equality through `fs.realpathSync.native` (macOS `/var` alias, fact 23). The header comment of the
  suite (`:33-38`) names the new cases. plan: SEEDFS
- **D-07** Release 0.3.15: migration `0040_seed-containment` with ONE `note` op in the 0039 shape
  (fact 26), `.claude-plugin/plugin.json` -> `0.3.15`, `migrations/index.json` last entry
  `0040_seed-containment` / `0.3.15`, a `CHANGELOG.md` block `## [0.3.15]` under `### Fixed` with the
  entry and `Retires local rules: none`; the root `README.md` version line follows the bump. Authors:
  the Writer ships the code, the tests, the migration directory, `index.json` and `plugin.json`; the
  COO writes the CHANGELOG block and the README line as R1 prose (overrides § Hard rules, "Prose in
  the payload is R1") BEFORE the Writer's commit, and ONE code commit carries the whole release diff
  (the 0.3.14 shape, `eb5da90`). Why: overrides § Hard rules, Release discipline - a payload change
  that must reach a consumer is a release. plan: SEEDFS
- **D-08** Routing and verification. `COO: Fable - because check 1` (`work.md` § COO routing:
  migration-engine code; the 2026-10-17 arbiter reading, CANDIDATES `:1422` - "migration"
  unqualified = top). VERIFY rows (overrides § Test policy, update engine / migrations, plus the
  setup row because `generate.mjs` changes - D-03, D-11; a diff spanning rows runs their union):
  `update-suite`, `setup-suite`, `validate-payload`, `selfcheck`; the selfcheck's fixture-form version row reds
  until the self-install apply (`dev/VERIFY_RUNBOOK.md:22-29`) - the pre-commit run uses the CI form
  (`--plugin-root .` alone), the self-install `/pnp:update --apply` after the code commit proves the
  project scope. Portion 1 as one parallel batch; Portion 2 is not a gate (HARD-021). Why: the rows
  are the policy's; nothing beyond them runs locally. plan: SEEDFS
- **D-09** Out of scope, as the roadmap entry says: the setup side (already real-filesystem), the
  fallback name `PNP_CANDIDATES.md` (ROADMAP § SETUP), the 0011 promise's text, the Gate 3 hook
  (lexical by design), the validator (`validate-payload.mjs` - payload time, no project at hand,
  pinned by seed-16..21). Why: operator word „1" (2026-10-18) recorded the finding as a risk with
  exactly this scope. plan: SEEDFS
- **D-10** One ticket. Why: the fix, its proof and the release that carries it are one shippable
  piece with one code commit; a second ticket would split a fix from its proof (the auditor's cut
  question, `plan.md` § Triage). plan: SEEDFS
- **D-11** `samePath` (`generate.mjs:675`) folds case on win32 AND darwin - the `FOLD_CASE` condition
  `sameRel` had (`migrate.mjs:504`) - and its comment (`:669-674`) says so. Why: `realpathSync.native`
  settles the case of the parts that exist, but the absent tail is spelled by the config; on macOS's
  default case-insensitive filesystem two spellings of that tail are one file, and the engine must
  not lose the darwin fold it has today; setup gains the same, correct, strictness. plan: SEEDFS
- **D-12** The proof's halves. The Writer proves every new check red-then-green with a NARROW run on
  scratch copies (the GENERIC-003 shape: `.aiwf/<REF>-narrow.mjs`, red on HEAD's `migrate.mjs`, green
  on the change) and does not run the full suite; the COO runs the row's suites ONCE at the handoff
  (D-08) - that single run is the VERIFY row. Why: `work.md` § Tests - the Writer runs the tests it
  adds, a check agent runs the checks; no row runs twice (overrides § Test policy). plan: SEEDFS
- **D-13** The check-to-write boundary (round-1 B1, class 15). The seed write holds NO lock and the
  plan adds none: overrides § Identity - no lock files, no runtime. What runs beside it is NOTHING -
  one executing session per working tree, the operator-held invariant of `ORCHESTRATOR.md` § Branch
  policy; a planning session beside it writes only its own draft and readiness folders. The window
  between `refuseEscapingSeed` / `refuseSurfaceSeed` and `applySeed`'s `mkdirSync` + `wx`
  (`migrate.mjs:557-559`) is the same window setup carries between its judgement
  (`generate.mjs:922-926`) and its `applyPlan` (`:1359-1393`), which GENERIC round-1 B9 settled with
  the same invariant (GENERIC/D-09). Amended at round 2 (B1 OPEN): the containment is judged
  TWICE on the same path - at plan time, and again INSIDE `applySeed` right after its `mkdirSync` and
  immediately before the `wx`: `applySeed` takes the canonical parent the plan-time check saw
  (`canonicalPath(dirname(join(root, target)))`) and refuses with an `UpdateError` ("the parent of
  `<target>` moved between the check and the write - nothing was written") when
  `canonicalPath(dirname(file))` differs after the `mkdirSync`. `wx` protects the final file; the
  window left is the one between that re-check and the `wx` system call, which no lock-free process
  closes and Node cannot close by fd-relative opens - the residual, named in the `planSeedFile`
  docblock and the ticket's Risk threshold, identical to setup's, accepted on the invariant. The
  residual is the OPERATOR's recorded decision: round-3 B1 (the auditor's third demand for a bound
  path) went to the operator as a disputed design decision and was answered „Приемам остатъка"
  (dialog, 2026-11-08) - no lock, no further mechanism, the window named. Why: a lock would be the
  daemon-grade mechanism the product refuses; the re-check costs one `realpath` and turns "a parent
  swapped after the check" from a silent write into a refusal. plan: SEEDFS
- **D-14** The route (round-1 B2, class 11). The ticket runs the R3 SHAPE: this plan and its
  readiness pass are the mini-plan and its review; then Writer -> `/pnp:review` (code row) -> the
  commit dialog. Branch `main`, declared here: § Branch policy says R3 *defaults* to `r3/<topic>` and
  a working branch declared in the brief stands; every payload release of this repository landed on
  `main` (`eb5da90`, `169d9e1`). No QA - the operator's explicit decision (dialog answer „Без QA",
  2026-11-08, round-2 B2): the CLI's exit code and refusal text are observable, and the operator chose
  the suite log as the artifact the Reviewer reads over a second paid role, as every engine ticket of
  this repository ran (GENERIC-003, SUITES-002); the suites and the self-check prove the behaviour
  (overrides § Test policy: no E2E runner). The unqualified "migrations" of `work.md` § R3 is read as this repository's overrides read
  it - a payload migration is data applied by a tested engine (§ Data, tenancy and access control),
  R3 proper is a fail-direction flip (§ Architecture direction) - and the wording itself is an open
  DOCTR item (ROADMAP § DOCTR, CANDIDATES `:93`), not this plan's. Why: the plan carries the route
  reasoning instead of leaving the auditor's conflict open; the operator's doctrine fix stays where
  it is recorded. plan: SEEDFS

## Deferred

- `migrations/0011_transfer-surface/NOTES.md:31-32` says "The update engine and the hooks never read
  it" - stale since `169d9e1` (`migrate.mjs:529` reads the key). DECIDED at the approval report
  (operator dialog answer 2026-11-08, "R1 fix in the 0.3.15 release"): the COO corrects that one
  sentence as R1 payload prose in the main session before the Writer's commit, beside R4, and the
  release commit carries it (D-07's shape); the 0011 PROMISE (`:28-30`) stays untouched (D-09). The
  roadmap entry's "out" line covered the promise, not this stale sentence.
- `writeAtomic` / `writeConfig` (`migrate.mjs:118`, `:644-646`) join `projectRoot` lexically - not seed
  code, no exclusive create at stake. Comes back: a finding of an escape on those paths.
- The Gate 3 hook's lexical surface and roadmap copies. Comes back: only if the hook ever gains
  filesystem access (today pure by design).
- A `[SKIP]` for hosts that cannot create a junction. Comes back: a CI leg that fails the fixture
  check - today every leg creates junctions in test-setup.

## Open Questions

None.
