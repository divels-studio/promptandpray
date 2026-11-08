# SEEDFS-001 [R3 shape + release] - the seed-file op judged through the real filesystem; the 15c proof; release 0.3.15

Implements: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12, D-13, D-14.
COO: Fable - because check 1.
Branch: `main`, declared here (D-14). Scope guard: `HEAD <hash>` at the dispatch. ONE code commit
carrying the whole release diff (D-07, D-10; the 0.3.14 shape `eb5da90`). Route (D-14): the R3 shape -
this plan and its readiness pass are the mini-plan and its review; then Writer -> `/pnp:review` (the
audit table's code row) -> the native commit dialog. No QA - operator dialog answer 'Без QA',
2026-11-08 (the suite log is the artifact; the Reviewer reads it).

## Outcome

`scripts/update/migrate.mjs` judges a `seed-file` target through the real filesystem with setup's own
helpers, imported from `scripts/setup/generate.mjs` (D-03). `planSeedFile` runs, in this order (D-01):
resolve (the `<plansDir>` token and today's lexical test) -> exists (a present regular file is `kept`,
exit 0, whatever link leads to it, D-04) -> canonical containment (refused with setup's wording) ->
the surface, compared canonically (D-02). A link standing at an absent target is refused as "not a
regular file" (D-04). `applySeed` re-checks the canonical parent right before its `wx` and refuses a
parent that moved since the plan-time check (D-13). The summary lines and the overlay key stay the POSIX project-relative target
(D-05). `samePath` folds case on win32 and darwin (D-11). The update suite's 15c proves it on the
shipped 0026 ops (D-06), each new check shown red-then-green by the Writer's narrow run (D-12). 0.3.15
is cut in the same commit with one `note` migration (D-07).

## Scope

The worklist; every row at its `file:line` at HEAD ebc2a22 (re-read them at the guard HEAD). One
Writer dispatch, one hand-back. Write P1 and the narrow runner N1 FIRST and take the red half before
W1-W8.

Writer (code, tests, the migration directory, `index.json`, `plugin.json` - D-07):

- W1 (D-03) `scripts/setup/generate.mjs`: `canonicalPath` `:639`, `isInsideDir` `:663` and `samePath`
  `:675` gain `export`; the bodies of `canonicalPath` and `isInsideDir` and their comments `:625-667`
  unchanged; setup's judgement `:918-1040` unchanged (D-09).
- W2 (D-11) `scripts/setup/generate.mjs:675`: `samePath` folds case when `process.platform` is
  `win32` OR `darwin` - the condition of `FOLD_CASE` (`migrate.mjs:504`); its comment `:669-674` says
  so and why (the absent tail is spelled by the config; on macOS's default case-insensitive filesystem
  two spellings of it are one file). Setup's collision checks `:943-975`, `:1012-1025` gain the same
  strictness through the shared helper; no other line of the file changes.
- W3 (D-03) `scripts/update/migrate.mjs:53-57`: the import list from `../setup/generate.mjs` gains
  `canonicalPath`, `isInsideDir`, `samePath` beside `resolveTransferSurface` (`:56`). No copy of any of
  the three in migrate.mjs.
- W4 (D-01, D-05) `resolveSeedTarget` `:508-524` unchanged in behaviour: the `<plansDir>` expansion
  `:509-517` with its refusal `:514`, and the LEXICAL test `:518-522` with today's `:521` sentence as
  the first refusal (it keeps the rel key and the summary line free of `..`); the return stays the
  POSIX project-relative path of `:523`.
- W5 (D-01) the canonical containment, a new function `refuseEscapingSeed(ctx, raw, target)` beside
  `refuseSurfaceSeed`: base `canonicalPath(ctx.projectRoot)`, child
  `canonicalPath(path.join(ctx.projectRoot, ...target.split('/')))`, refused unless
  `isInsideDir(base, child)`, with the message (`toPosix` `:65` on the canonical child):
  `seed-file "<raw>" really resolves to "<canonical, POSIX>", which is not inside the project - nothing was written.`
  `planSeedFile` `:492-502` calls, in this order: `resolveSeedTarget` `:493` -> `seedTargetExists`
  `:494` (present -> `kept`, return) -> `refuseEscapingSeed` -> `refuseSurfaceSeed` `:497`.
  Containment is judged only where the engine would WRITE: a present regular file reached through a
  link outside the project stays `kept` (D-01). The check-to-write boundary (D-13, amended): no lock
  exists or is added; the containment is judged twice on the same path - here at plan time, and again
  inside `applySeed` right before the `wx` (W8); the window left is the one between that re-check and
  the `wx` system call - the residual, identical to setup's (`generate.mjs:922-926` -> `:1359-1393`),
  accepted on the one-executing-session-per-tree invariant (`ORCHESTRATOR.md` § Branch policy) and
  recorded as the OPERATOR's decision (D-13, dialog 2026-11-08).
- W6 (D-02) `refuseSurfaceSeed` `:527-536`: compares
  `canonicalPath(path.join(ctx.projectRoot, ...target.split('/')))` with
  `canonicalPath(path.join(ctx.projectRoot, resolveTransferSurface(paths)))` through `samePath`; the
  message `:531-534` unchanged (seed-12 `test-update.mjs:1565`, ledger-15 `:1750` read it). `FOLD_CASE`
  and `sameRel` `:504-505` are deleted - `:530` is their only caller (Closing greps Set 1).
- W7 (D-04) `seedTargetExists` `:539-553`: the overlay test `:540` first, unchanged; then
  `fs.lstatSync` of the target path (`:542`'s join). ENOENT -> absent, as today `:543`; any other error
  -> today's "cannot be inspected" `:544`. A link (`isSymbolicLink()`): `fs.statSync` of it - a
  regular file -> `true` (`kept`, wherever it points); a failing stat (dangling) or a non-file -> the
  existing refusal `:547-549` with `(found a link)`. A non-link: today's behaviour `:546-552` on the
  lstat result. The `planSeedFile` docblock `:481-491` names the order of W5, the link refusal, the
  re-check of W8 and the residual of D-13 - the window between that re-check and the `wx` system call -
  with the invariant that answers it (one executing session per working tree, no lock), as the
  OPERATOR's recorded decision (D-13, dialog 2026-11-08); its sentence on exists-before-surface
  `:488-490` stays. `applySeed`'s docblock `:555` names the same residual.
- W8 (D-13) `applySeed` `:556-564` takes a third argument, the canonical parent the plan-time check
  saw - `canonicalPath(path.dirname(path.join(ctx.projectRoot, ...target.split('/'))))`, computed in
  `planSeedFile` and carried on the plan object (e.g. `expectParent`). After its `mkdirSync` `:557` and
  before the `wx` `:559` it compares `canonicalPath(path.dirname(file))` with it through `samePath`
  and, when they differ, throws `UpdateError`
  `seed-file: the parent of "<target>" moved between the check and the write - nothing was written.`
  The `seed` branch of `applyPlan` `:659-662` passes `plan.expectParent`. Two test seams are EXPORTED,
  `planSeedFile` `:492` and migrate's own `applyPlan` `:653` (the GENERIC-003 precedent: `applyPlan`
  exported for the plan/apply window,
  `dev/backlogs/archive/016_PLAN_GENERIC_2026-10-18/records/GENERIC-003.md:48`); `applySeed` and
  `makeContext` `:738` stay unexported - P1 case (e) does not need them. `makeContext` being private,
  the test builds the MINIMAL `ctx` the two seams read (opened `:492-502`, `:653-662`, `:738-753`):
  `projectRoot`, `config` (with `paths`), `overlay: null`, and `render` (the seed's `ctx.render(op.template)`
  `:499`). The EEXIST branch `:560-563` unchanged.
- P1 (D-06) `scripts/update/test-update.mjs` section 15c, a new block after t5 (`:1751`, before the
  section's closing `}` `:1752`), on the same `payload` (the shipped 0026 ops, `:1630-1641`), the same
  `LEDGER_REL` / `OLD_REL` / `MINE_LEDGER` / `setSurfaceKey` / `surfaceKey` (`:1642-1654`) and the
  helpers `project` `:157`, `install` `:191`, `update` `:202`, `at` `:114`, `exists` `:113`, `why`
  `:108`, `bookkeeping` `:211`, `resolutionFile` `:303`. Every project starts `install(p)` exit 0. The
  junction fixture follows `scripts/setup/test-setup.mjs:1915-1935`: `fs.symlinkSync(target, link,
  'junction')` in try/catch, `made` false is a FAILING check (no `[SKIP]`, D-06; junctions need no
  elevation), the fixture's own equality through `fs.realpathSync.native` on BOTH sides (macOS `/var`
  alias, `test-setup.mjs:1566-1572`). `snapshot` (`:127-135`) and `writtenBeyondSchema` are NOT used on
  a project holding a junction - `snapshot` reads a junction dirent as a file (`test-setup.mjs:1944-1946`);
  check the named paths instead. "Not stamped" = `bookkeeping(p).lastMigrationApplied !== '0002_ledger'`.
  The check names, in order:
  - (a) the escape - `paths.plansDir: 'linked'`, `linked` a junction to `project('<name>-target')` (a
    sibling, OUTSIDE), no key (`setSurfaceKey(p, null)`), applied with the resolution file of ledger-7
    (`:1685-1687`) so the run reaches op 0 whatever the question order:
    `[ledger-16]` fixture made and `realpathSync.native(at(p,'linked')) === realpathSync.native(target)`;
    `[ledger-17]` exit 1, the output carries `really resolves to` AND `not inside the project`;
    `[ledger-18]` the far side is empty (`fs.readdirSync(target).length === 0`), `surfaceKey(p) === undefined`, not stamped.
  - (b) the alias - `linked` a junction to `at(p, 'docs/backlogs')` (INSIDE), `paths.plansDir: 'linked'`,
    `paths.transferSurface: LEDGER_REL` (`docs/backlogs/LEDGER.md`), `LEDGER_REL` removed:
    `[ledger-19]` fixture made and the realpath equality against `at(p, 'docs/backlogs')`;
    `[ledger-20]` exit 1, the output carries `the transfer surface of this installation`;
    `[ledger-21]` `!exists(at(p, LEDGER_REL))` and `!exists(at(p, 'linked/LEDGER.md'))`, not stamped.
  - (c) the dangling link - `paths.plansDir` as installed (`docs/backlogs`), the key on `OLD_REL`
    (`setSurfaceKey(p, OLD_REL)`, the t2 shape `:1660`, so the surface refusal cannot mask the case),
    `LEDGER_REL` removed, a junction AT `at(p, LEDGER_REL)` pointing at a non-existent
    `path.join(tmpRoot, '<name>-no-such-target')` (the precedent `:1906`):
    `[ledger-22]` fixture made, `fs.lstatSync(link).isSymbolicLink()` true and the target absent;
    `[ledger-23]` exit 1, the output carries `is not a regular file`;
    `[ledger-24]` the link's target still absent, not stamped. Cleanup of the link as `:1926`
    (`rmdirSync`, then `unlinkSync`). Its control is ledger-1 (`:1664-1665`): the same fixture without
    the link, `(created)`.
  - (d) controls, each exit 0: `[ledger-25]` (a) with a real folder `linked` in place of the junction
    -> `0002_ledger[0] seed-file: linked/LEDGER.md (created)` and `exists(at(p, 'linked/LEDGER.md'))`;
    `[ledger-26]` (b) with a real folder `linked` -> `0002_ledger[0] seed-file: linked/LEDGER.md (created)`
    and `!exists(at(p, LEDGER_REL))`; `[ledger-27]` the (b) junction fixture with `MINE_LEDGER` written
    at `at(p, LEDGER_REL)` -> `0002_ledger[0] seed-file: linked/LEDGER.md (kept)`, the file
    byte-identical, the output without `the transfer surface of this installation`; `[ledger-28]` the
    (a) junction fixture with `MINE_LEDGER` written on the FAR side (`path.join(target, 'LEDGER.md')`)
    -> `0002_ledger[0] seed-file: linked/LEDGER.md (kept)`, the far-side file byte-identical, the
    output without `really resolves to` (D-01's order: a present file is kept, containment is judged
    only where the engine would write).
  - (e) the re-check through a REAL plan/apply split (W8, D-13): import `planSeedFile` and `applyPlan`
    from the changed `migrate.mjs` (`at(PLUGIN_ROOT, 'scripts/update/migrate.mjs')`, a file URL); a
    missing export is a FAILING check for both, never a crash of the suite. A fresh `project(name)`
    with a real `docs/backlogs` folder; the minimal `ctx` of W8 - `projectRoot` the project,
    `config.paths` `{ plansDir: 'docs/backlogs', transferSurface: OLD_REL }` (so the surface refusal
    cannot fire), `overlay: null`, `render` returning a fixed text; the op is the shipped 0026 seed op
    `ops[0]` (`:1631`). `[ledger-29]` `planSeedFile(ctx, ops[0])` (mode `seed`), then `docs/backlogs`
    renamed away and a junction named `docs/backlogs` made to a sibling `project('<name>-target')`
    OUTSIDE (the `made` check hard, as above), then `applyPlan(ctx, plan)` -> it throws an
    `UpdateError` whose message carries `moved between the check and the write`, and the sibling stays
    empty (`fs.readdirSync(target).length === 0`); `[ledger-30]` the control - the same plan steps on a
    second project with the real folder left in place -> `applyPlan` writes `docs/backlogs/LEDGER.md`
    with the fixed text.

  The suite header `:35-38` names the new cases (a link out of the project refused, a junction alias
  of the surface refused, a link at an absent target refused, a present file through a link kept, a
  parent that moved before the write refused).
- N1 (D-12) the narrow runner `.aiwf/SEEDFS-001-narrow.mjs` (scratch, gitignored, the GENERIC-003
  shape, `dev/backlogs/archive/016_PLAN_GENERIC_2026-10-18/records/GENERIC-003.md:77-79`): it runs
  section 15c of the changed `test-update.mjs` - P1's block and what it needs, nothing else - on a
  scratch copy of the payload OUTSIDE the repository, and prints `checks: N, failures: M`. Its
  contract: `--engine <hash>` makes the copy's `scripts/update/migrate.mjs` the output of
  `git show <hash>:scripts/update/migrate.mjs`, everything else the changed tree; without the flag the
  copy is the changed tree. The two runs, literal (both logs outside the repository):
  `node .aiwf/SEEDFS-001-narrow.mjs --engine <guard> > "$LOGS/narrow-red.log" 2>&1` (red) and
  `node .aiwf/SEEDFS-001-narrow.mjs > "$LOGS/narrow-green.log" 2>&1` (green).
- R1 (D-07) `migrations/0040_seed-containment/ops.json` and `NOTES.md` on the model of
  `migrations/0039_selfcheck-jobs/ops.json:1-12` and `NOTES.md:1-47` - ONE `note` op (`id`, `text`,
  `docRefs`), no re-render op (no managed artifact changes); its text naming the real-filesystem
  containment and its order (W5), the surface alias (W6), the link at an absent target (W7), the
  re-check before the write (W8), the darwin fold of setup and update alike (W2), and ending "This update re-renders nothing; no config
  key, ask rule or operator file changes."; `docRefs` naming `CHANGELOG.md` and the changed payload
  files.
- R2 (D-07) `migrations/index.json:40`: the entry `{ "id": "0040_seed-containment", "targetPluginVersion": "0.3.15" }`
  after it (ids ascend by one, `migrations/README.md:18-25`).
- R3 (D-07) `.claude-plugin/plugin.json:3`: `0.3.15`.

COO (R1 prose in the main session, D-07, `dev/PROJECT_OVERRIDES.md:38-43`; R4 written BEFORE the
Verify batch starts, so before the Writer's commit, and carried by that ONE code commit):

- R4 `CHANGELOG.md:7`: the `## [0.3.15] - <date>` block above it, root `CLAUDE.md` § Changelog format,
  under `### Fixed`, one entry `(SEEDFS-001)`; its last line `Retires local rules: none` (D-07).
  `README.md:22` (`**v0.3.14. ...**`) follows the bump to 0.3.15 (D-07).
  `migrations/0011_transfer-surface/NOTES.md:31-32` corrected to what the engine does since `169d9e1`
  (the update engine reads the key through `resolveTransferSurface` to REFUSE a seed onto the surface,
  and writes it never; the hooks' copy stays lexical); the promise `:28-30` untouched.
- R5 after the code commit and the live-copy refresh, on the operator's word: the self-install
  `/pnp:update --apply` on this repository; the rendered `.claude/` copies move by it, never by hand.

Unchanged (D-09): `scripts/setup/generate.mjs` beyond W1-W2; `scripts/engine/`; `scripts/ci/`;
`scripts/update/validate-payload.mjs`; `scripts/setup/test-setup.mjs`; every shipped migration
(`migrations/0011_transfer-surface/` beyond the one sentence of R4 (its promise `:28-30` untouched), `0025_roadmap-seed/`, `0026_ledger/` included); `applySeed`
`:556-564` beyond W8; `examples/`; `.github/`.

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken. `$LOGS` is the
log directory, OUTSIDE the repository; `<guard>` the scope guard's hash. Red-first (D-12): every
command marked [red] is run by the Writer once on the guard HEAD (before W1-W8) and once on the
change; the red run must be broken as stated, the green run not.

At the hand-back, on the tree:

- D-02, Set 1: `git grep -n -E "sameRel|FOLD_CASE" -- scripts/update/migrate.mjs` - any hit.
- D-03 [red]: `node -e "import('./scripts/setup/generate.mjs').then((m)=>{const miss=['canonicalPath','isInsideDir','samePath'].filter((n)=>typeof m[n]!=='function');console.log(miss.length?'NOT EXPORTED '+miss.join(' '):'EXPORTED');process.exit(miss.length?1:0)})"` - exit != 0 or `NOT EXPORTED`.
- D-03, no copy: `git grep -n -E "^(export )?(function|const) (canonicalPath|isInsideDir|samePath)\b" -- scripts/update/migrate.mjs` - any hit.
- D-03/D-11, generate.mjs touched only at W1-W2: `git diff -U0 <guard> -- scripts/setup/generate.mjs | grep "^@@"` - a hunk whose old range lies outside `:639`, `:663`, `:669-675`.
- Set 2: `rg -l "canonicalPath|isInsideDir|samePath" scripts` - anything but `scripts/setup/generate.mjs` and `scripts/update/migrate.mjs` (path separators read as equal).
- D-11 [red]: `node -e "Object.defineProperty(process,'platform',{value:process.argv[1]});import('./scripts/setup/generate.mjs').then((m)=>{const f=typeof m.samePath==='function'?m.samePath('/x/LEDGER.md','/x/ledger.md'):null;const want=process.argv[1]!=='linux';console.log(f===want?'FOLD OK':'FOLD WRONG');process.exit(f===want?0:1)})" darwin`, the same with `win32` and with `linux` as the last argument - exit != 0 or `FOLD WRONG` in any of the three (darwin and win32 fold, linux does not).
- D-04, the host: `node -e "const fs=require('fs'),p=require('path'),os=require('os');const d=fs.mkdtempSync(p.join(os.tmpdir(),'pnp-seedfs-lstat-'));const l=p.join(d,'link');if(process.argv[1]==='junction')fs.symlinkSync(p.join(d,'no-such-target'),l,'junction');else fs.mkdirSync(l);const ok=fs.lstatSync(l).isSymbolicLink();try{fs.rmdirSync(l)}catch{try{fs.unlinkSync(l)}catch{}}fs.rmSync(d,{recursive:true,force:true});console.log(ok?'LINK':'NOT A LINK');process.exit(ok?0:1)" junction` - exit != 0 or `NOT A LINK` (a dangling junction made as P1 makes it is not a link under lstat on this host: W7's branch would never be reached - the Stop condition). Its red half is the same command with `dir` as the last argument (a real directory): exit 1 and `NOT A LINK`, or the probe proves nothing.
- D-01: `git grep -c -F "really resolves to" -- scripts/update/migrate.mjs` - no hit; `git grep -c -F "which is not inside the project - nothing was written" -- scripts/update/migrate.mjs` - anything but `:2` (today's lexical sentence `:521` kept, the canonical one added).
- D-02: `git grep -c -F "the transfer surface of this installation" -- scripts/update/migrate.mjs` - anything but `:1`.
- D-01, the order: `node -e "const t=require('fs').readFileSync('scripts/update/migrate.mjs','utf8');const s=t.indexOf('function planSeedFile(');const b=t.slice(s,t.indexOf('\n}\n',s));const at=['resolveSeedTarget(ctx','seedTargetExists(ctx','refuseEscapingSeed(ctx','refuseSurfaceSeed(ctx'].map((n)=>b.indexOf(n));const ok=s>=0&&at.every((i)=>i>=0)&&at.every((i,k)=>k===0||i>at[k-1]);console.log(ok?'ORDER OK':'ORDER WRONG '+at.join(','));process.exit(ok?0:1)"` - exit != 0 or `ORDER WRONG`.
- D-05: `git grep -c -F 'summary: `seed-file: ${target} (' -- scripts/update/migrate.mjs` - anything but `:2`.
- D-04: `git grep -c -F "lstatSync" -- scripts/update/migrate.mjs` - no hit; `git grep -c -F "found a link" -- scripts/update/migrate.mjs` - no hit.
- D-13 [red]: `git grep -n -E "^export function (planSeedFile|applyPlan)\(" -- scripts/update/migrate.mjs | wc -l` - anything but `2`; `git grep -c -F "moved between the check and the write - nothing was written" -- scripts/update/migrate.mjs` - anything but `:1`.
- D-13, the W8 surface: `git grep -n -F "applySeed(" -- scripts/update/migrate.mjs` - any call site without the third argument (`plan.expectParent`), or the definition not `function applySeed(` with three parameters (unexported, W8).
- D-06: `git grep -o -E "\[ledger-(1[6-9]|2[0-9]|30)\]" -- scripts/update/test-update.mjs | sort -u | wc -l` - anything but `15`.
- D-09: `git diff <guard> -- scripts/engine scripts/ci scripts/update/validate-payload.mjs scripts/setup/test-setup.mjs migrations/0025_roadmap-seed migrations/0026_ledger examples .github` - any output.
  `git diff <guard> --numstat -- migrations/0011_transfer-surface` - anything but exactly one line, naming `migrations/0011_transfer-surface/NOTES.md`, whose added and removed counts are each at most 3 (one rewrapped sentence; `ops.json` in the list, a second file, or a larger count = broken), plus `git grep -n -F "no operation here or later may name the transfer surface" -- migrations/0011_transfer-surface/NOTES.md` - no hit (the promise must still be there).
- D-07: `git grep -n -F '"version": "0.3.15"' -- .claude-plugin/plugin.json` - no hit.
- D-07: `git grep -n -F '"targetPluginVersion": "0.3.15"' -- migrations/index.json` - no hit, or a hit not on the `0040_seed-containment` line.
- D-07: `git grep --untracked -c -F '"op": "note"' -- "migrations/0040_*/ops.json"` - anything but `:1`; `git grep --untracked -c -F '"op": "rerender' -- "migrations/0040_*/ops.json"` - any line.
- D-07 (after R4): `awk '/^## \[0.3.15\]/,/^## \[0.3.14\]/' CHANGELOG.md | grep -c -F "Retires local rules: none"` - anything but `1`; `git grep -n -F "v0.3.15" -- README.md` - no hit; `git grep -n -F "never read it" -- migrations/0011_transfer-surface/NOTES.md` - any hit.
- D-07, Set 5 (after R4): `rg -l --hidden "0\.3\.15" --glob '!dev/**' --glob '!.git/**' .` - a file outside the Set 5 list of the
  index (path separators read as equal), or a listed file missing (the config
  `.claude/aiwf-native/aiwf.config.json` excepted before R5).
- Provenance: `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md` - any hit; the same with `--untracked` over `"migrations/0040_*"` - any hit. `git grep -n -i -e silerax -e stratex -e furnissimo -- CHANGELOG.md README.md docs skills templates scripts hooks migrations` - any hit.

On the narrow logs (N1, D-12), written by
`node .aiwf/SEEDFS-001-narrow.mjs --engine <guard> > "$LOGS/narrow-red.log" 2>&1` and
`node .aiwf/SEEDFS-001-narrow.mjs > "$LOGS/narrow-green.log" 2>&1`:

- red: `grep -E "^  \[FAIL\] \[ledger-(17|20|23|29|30)\]" "$LOGS/narrow-red.log" | wc -l` - anything but `5`
  (a case that passes on the old engine proves nothing; 29/30 are red there because the guard HEAD's
  `planSeedFile` and `applyPlan` are not exported, so the import yields no function - a failing check,
  never a crash); `grep -E "^  \[PASS\] \[ledger-(16|19|22|25|26|27|28)\]" "$LOGS/narrow-red.log" | wc -l` - anything but `7` (a fixture or a control red on the old engine is a broken fixture, not a proof).
- green: `grep -c -E "^  \[PASS\] \[ledger-(1[6-9]|2[0-9]|30)\]" "$LOGS/narrow-green.log"` - anything but `15`; any `[FAIL]` line; the last `checks:` line with `failures:` other than `0`.

On the Verify logs (the COO's batch, D-08, D-12):

- `update-suite`: the log does not end `UPDATE SUITE: PASS`; `grep -c -E "^  \[PASS\] \[ledger-(1[6-9]|2[0-9]|30)\]" "$LOGS/update-suite.log"` - anything but `15`.
- `setup-suite`: the log does not end `SETUP SUITE: PASS`.
- `validate-payload` - exit != 0.
- `selfcheck` (the CI form) - exit != 0.

After the commit (the COO, R5):

- `_aiwf.lastMigrationApplied` in `.claude/aiwf-native/aiwf.config.json` not `0040_seed-containment`;
  the apply exit != 0, or its self-check line not
  `self-check: PASS - ==== P/T assertions passed ==== (project layer only - ...)`.

## Risk threshold

Blocks: the lexical test `:518-522` or its sentence changed; a lexical surface comparison left; a copy
of `canonicalPath`, `isInsideDir` or `samePath` in migrate.mjs; a change to setup's behaviour beyond
the darwin fold (D-11); a lock, a lock file or any other runtime mechanism added to the seed path
(D-13, amended); a seed write without the re-check (W8: the canonical parent compared right before
the `wx`, the plan-time parent carried by the plan); the residual - the window between that re-check
and the `wx` system call, accepted on the one-executing-session-per-tree invariant - left out of the
`planSeedFile` or `applySeed` docblock; the order resolve -> exists -> canonical containment -> surface changed (a
present file through a link refused; ledger-13/14 must hold); a summary line or the overlay key
carrying a canonical path or `..`; the surface message changed; a link at an absent target written
through; a fixture that degrades to a skip or to green when the junction cannot be made; a new case
green on the old engine; any write outside the fixture's project or its named sibling; the full suite
run by the Writer (D-12); a re-render op or an op outside the vocabulary; a shipped migration's text
changed by the Writer, or 0011's beyond R4's one sentence (its promise `:28-30` included); `index.json` not monotonic or its last entry not the payload version; the Gate 3 hook, the
validator or the cycle driver touched. Notes: the exact wording of the docblock, the note's text, the
order of the new checks inside the block, the narrow runner's internals.

## Stop condition

Stop and hand back before writing the part in question when: the D-04 host probe prints `NOT A LINK`
for the junction (`lstatSync` does not report a junction as a link here, so W7's branch would not be
the one P1 reaches); the preflight or another op refuses a P1 fixture before op 0 runs (the case would
then prove the preflight, not the seed); a new case is green on the guard HEAD's engine, or a fixture
or control is red there; a setup or update check outside P1 would start failing under W1-W8 (the
darwin fold included); a shipped migration would have to change in the Writer's part (0011's R4 sentence is the COO's, not the Writer's); a file outside the Code Map must
change. The Writer writes W1-W8, P1, N1 and R1-R3 in one dispatch and hands back once, writing none of
R4-R5; R4-R5, the code commit's dialog, the record's docs commit, the tag word and the push word are
the COO's or the operator's (index § Order and gates).

## Verify

The Writer's runs (D-12), from cwd `.`: N1 red,
`node .aiwf/SEEDFS-001-narrow.mjs --engine <guard> > "$LOGS/narrow-red.log" 2>&1`, then N1 green,
`node .aiwf/SEEDFS-001-narrow.mjs > "$LOGS/narrow-green.log" 2>&1`, and every
Acceptance command marked [red] on both sides, each with its exit code in the hand-back. The Writer
does NOT run the full suites.

D-08's rows, ONCE, as ONE parallel batch started by the COO in the background at the hand-back (R4
already written) - that single run is the VERIFY row (D-12); each command verbatim from
`verify.commands`, cwd `.`:

- `update-suite`: `node scripts/update/test-update.mjs`
- `setup-suite`: `node scripts/setup/test-setup.mjs` (generate.mjs changes, D-03, D-11)
- `validate-payload`: `node scripts/update/validate-payload.mjs --plugin-root .`
- `selfcheck`: in the CI form `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` alone - the
  diff carries the bump, so the fixture form `--project-fixture .` reds its PROJECT LAYER
  `installedPluginVersion equals the payload version` row until the self-install apply
  (`dev/VERIFY_RUNBOOK.md:22-29`); R5's embedded project-scope self-check proves the project scope
  after the commit.

The runbook is `dev/VERIFY_RUNBOOK.md` (overrides § Test policy: VERIFY in PORTIONS - Portion 1 = the
Windows commands as ONE parallel batch; Portion 2 = WSL, not a gate, never concurrent with Portion 1).
Portion 1 only; CI runs the full set on `windows` and `ubuntu` (and the advisory `macos`, where D-11's
fold is the live branch) after the push. A run over ~5 minutes runs in the background with a timeout
of at least 3600000 ms; every log goes OUTSIDE the repository, never piped through tail; ZERO edits in
the tree while the batch runs. Before the commit: the provenance grep of the Acceptance empty; the
commit message carries `Refs: SEEDFS-001` and no AI attribution line (operator rule 2026-08-31).

## Code Map

| path | role |
|---|---|
| `scripts/update/migrate.mjs` | W3-W8 (Writer) |
| `scripts/setup/generate.mjs` | W1-W2 (Writer) |
| `scripts/update/test-update.mjs` | P1 (Writer) |
| `.aiwf` | N1, the narrow runner, scratch (Writer) |
| `migrations` | R1, the new `0040_seed-containment/` (Writer) |
| `migrations/index.json` | R2 (Writer) |
| `.claude-plugin/plugin.json` | R3 (Writer) |
| `CHANGELOG.md` | R4 (COO) |
| `README.md` | R4, the version line (COO) |
| `migrations/0011_transfer-surface/NOTES.md` | R4, one sentence (COO) |
| `.claude/aiwf-native` | R5, the COO's apply |
