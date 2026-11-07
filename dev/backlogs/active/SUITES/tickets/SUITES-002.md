# SUITES-002 [R2 + release] - the self-check's full run in parallel groups, one PowerShell exec pass less, release 0.3.14

Implements: D-05, D-06, D-07, D-08, D-09.
COO: Fable - because check 1.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. ONE code commit (D-08, the e6240f6
precedent). Depends on: SUITES-001 committed - the per-section timestamps of `section()`
(`scripts/selfcheck/aiwf-selfcheck.js:112-115` after W4) that the parent here aggregates, and the
suites already on the project scope (read both at the guard HEAD).

## Outcome

`node scripts/selfcheck/aiwf-selfcheck.js` in the full scope runs its 30 full-scope sections in four
groups fixed by name, dealt whole and round-robin to `--jobs <n>` children (default
`max(1, min(4, os.availableParallelism() - 1))`; n >= 4 = one child per group), and prints the same
report it prints today - the sections in canonical order, COVERAGE, the notes, the tally line,
FAILURES, the exit code; `--jobs 1` is today's in-process run; a dead or throwing child is a counted
`(uncaught)` failure and an `INCOMPLETE RUN` (D-05). The uncovered-id enumeration of the PowerShell
resume controls reuses the first pass (D-06). 0.3.14 is cut in the same commit with one `note`
migration, the bump and a `CHANGELOG.md` block carrying SUITES-001 and SUITES-002, and this
repository runs on it through the self-install (D-08). Measured, not promised (D-07).

## Scope

The worklist; every row at its `file:line` (pointers at HEAD 4969f7e - re-read them at the guard
HEAD, SUITES-001 moves lines in the same files). One Writer dispatch, one hand-back.

Writer (code, migration, bump):

- A1 (D-05) `--jobs <n>`, parsed right after `SCOPE` (`aiwf-selfcheck.js:86-98`), before the plugin
  check `:100` and the host discovery `:235`, `:309`: the number of children the groups are dealt
  to, an integer >= 1; absent = the default above; `0`, a negative or non-integer value, or a bare
  `--jobs` -> `bail()` (`:81-84`, exit 2) with a message naming `--jobs`. `--jobs 1` = in-process, no
  child. Under `--scope project` the flag is accepted and has no effect: `runProjectScope`
  `:10079-10083` and its call `:10127` are untouched (test-update's anchor `test-update.mjs:2028`
  holds). The usage comment `:44` and the flag list `:51-52` gain the flag.
- A2 (D-05) one canonical table replaces the 30 calls `:10130-10159`: an array of entries
  `{ name, group, run }` in today's order, each `run` calling its section function with today's
  arguments; `--jobs 1` iterates it in-process exactly as today; a group is the entries with that
  `group` value, so no second list exists that could drift. Each entry stands on one line in the
  literal form `{ name: 'sectionX', group: N, run: (c) => sectionX(` followed by today's arguments
  read from `c` (the run's `tmpRoot`, `PROJECT`, `selfAuthored`, `pluginVersion`) and `) },` - e.g.
  `{ name: 'sectionGate4', group: 3, run: (c) => sectionGate4() },`; the entries stand in the order
  of today's calls `:10130-10159` (the acceptance's source check reads the names, the groups, the
  callbacks and the order). The four groups, fixed by name, balanced
  by RESEARCH § Timings (windows / ubuntu seconds of run 42263924346; `<5` = each under 5 s):

  | group | sections, in canonical order | windows | ubuntu |
  |---|---|---|---|
  | 1 bash host | `sectionBashHost`, `sectionShWrappers` | 229 | 97 |
  | 2 PowerShell host | `sectionGate1Identity`, `sectionGate2`, `sectionGate2Mode`, `sectionGate3`, `sectionGate3Toggle`, `sectionGate3Surface`, `sectionGate3Planning`, `sectionWrappers` | 193 + 7 x <5 | 213 + 7 x <5 |
  | 3 both channels, recording stubs | `sectionGate4`, `sectionConfigSchema`, `sectionMigrationPayload`, `sectionHookWiring`, `sectionMarketplace`, `sectionPlanGate`, `sectionRunHeader` | 173 + 4 x <5 | 104 + 4 x <5 |
  | 4 copies, resolvers, the project | `sectionPlanRefNaming`, `sectionResolver`, `sectionRolesCommand`, `sectionPayloadIntegrity`, `sectionProvenance`, `sectionExampleFixture`, `sectionProjectLayer`, `sectionDraftsObservations`, `sectionE2eTraceObservation`, `sectionCommitAutomation`, `sectionCommitAutomationControls`, `sectionNegativeControls`, `sectionScopeControls` | 164 + 7 x <5 + SCOPE CONTROLS | 78 + 8 x <5 + SCOPE CONTROLS |

  2 + 8 + 7 + 13 = 30 sections. D-05's constraints, each held: `sectionExampleFixture` and
  `sectionNegativeControls` in one group (the `exampleProbe` counter `:9164`, the in-repo probe paths
  `:9085`, `:9449`); `sectionProjectLayer`, `sectionCommitAutomation`, `sectionCommitAutomationControls`
  in one group (one reading of `PROJECT`; `sectionPlanRefNaming`, the fourth reader of `PROJECT`
  `:10134`, joins them); `sectionWrappers` (group 2) and `sectionShWrappers` (group 1) apart;
  `sectionBashHost` first in group 1, the group of the first bash-channel section. SCOPE CONTROLS
  postdates the timed run (0.3.13): unmeasured, its children are project-scope runs. Dealing: whole
  groups, round-robin - group g goes to child `((g - 1) mod n) + 1` (n = 2 -> {1,3}, {2,4}; n = 3 ->
  {1,4}, {2}, {3}; n >= 4 -> one child per group); a child runs its groups' sections in canonical
  order.
- A3 (D-05; the read / lock / write rows of `main()` are RESEARCH F-25 - the fixture, the scratch
  root, the cleanup) the parent and the child. The parent spawns one child of `__filename` per child slot,
  all at once (asynchronous spawn; `main()` may become async, the exit stays `process.exitCode`
  `:10358`), each with the same `--plugin-root`, the parent's `PROJECT` as `--project-fixture` and an
  env marker carrying: the section names of its slot, the parent's `selfAuthored` (`:10094-10104` -
  a child never writes, judges or removes the fixture), a scratch directory the parent created with
  `fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-selfcheck-'))` (today's depth, `:10106`) and removes in
  its `finally` `:10186-10189`, and the path of the child's result document. The marker's variable
  differs from `SCOPE_CHILD_ENV` (`:9992`), so SCOPE CONTROLS' own project-scope child
  (`:10003-10006`) still runs inside group 4. A marked child: refuses to spawn groups (it runs its
  sections in-process whatever `--jobs` says), refuses an unknown or repeated section name in its
  marker (a FAIL, never a silent skip), prints nothing to the parent's stdout (its stdout and stderr
  are piped, kept for the crash detail), runs its sections inside today's `try` (`:10125-10189`), and
  writes one JSON document: per section, in order, its name, the text it printed, its `results`,
  `notes`, `observations` and section times (D-03), plus whether it crashed. The parent prints the
  header `:10108-10122` as today, then every section's text in canonical order, then the `(uncaught)`
  blocks, then `:10191-10358` exactly as today over the merged `results`, `notes`, `observations`
  (canonical order), so FAILURES lists in canonical order. The parent writes one STDERR line per
  child, exactly `aiwf-selfcheck: child <k>: <section names, joined by ", ", canonical order>` (k from
  1, in child order); stdout carries nothing new (D-05). No lock exists or is added (F-25): the
  fixture is written only by the parent before any child starts and removed only by the parent's
  `finally` after every child has exited.
- A4 (D-05) the crash path. A child that crashed (its document says so) or that exits without a
  readable document (non-zero exit, signal, missing or unparsable file) is one `(uncaught)` section
  per such child, after the canonical text, in child order: one failing `check` whose name starts
  `the self-check crashed before it finished: ` (`:10183`) with the child's headline (or its exit
  code / signal and its stderr tail), its detail naming the sections of that child that never ran;
  `crashed` set, so `---- INCOMPLETE RUN ----` (`:10192-10197`, text unchanged) prints and the exit
  code is 1. The sections of the other children stay printed and counted.
- A5 (D-03 in the parallel run) the `slowest sections:` block of SUITES-001 W4 reads the children's
  section times; its total row is the parent's `process.uptime()`; its place (right before the tally
  line) is unchanged.
- A6 (D-06; the read / lock / write rows of `sectionWrappers()` are RESEARCH F-26 - every write under
  `tmpRoot`, no lock, nothing under `PLUGIN_ROOT` or `PROJECT`; A6 adds no write and removes the third
  pass's probe homes) `aiwf-selfcheck.js:3468`: the findings of the first pass are kept in a const and printed
  as today; `:3492-3494` enumerates the uncovered ids from that const - no third
  `psResumeFindings(PLUGIN_ROOT, { execProbes: true ... })` call. The pristine control pass `:3473`
  stays.
- P1 (D-05 proof cases) a new block in `scripts/update/test-update.mjs` after the crash cases
  `:2026-2082` (the self-check's crash contract lives there), spawning the engine of a payload COPY
  directly, full scope, every case seconds long (no full run; no minutes added to the suite): (a) `--jobs 0`, `--jobs x`
  and a bare `--jobs` each exit 2 with `--jobs` in stderr; (b) a throw planted by `patch`
  (`test-update.mjs:126-130`) as the first statement inside a marked child's `try`, run with
  `--jobs 2`: exit 1, `[(uncaught)]` twice in FAILURES, `INCOMPLETE RUN`, the tally line printed;
  (c) the same with `process.exit(3)` planted at the marked child's entry, before any document is
  written: exit 1, the child's exit code 3 named in the `(uncaught)` detail, `INCOMPLETE RUN`; (d) a
  marked child spawned by hand with one cheap section name (`sectionHookWiring`) and `--jobs 4`: its
  document holds that one section only, and no grandchild ran; (e) the fixture is untouched by a
  child, seconds long: a COPY of section 2's `upgraded` project (`test-update.mjs:1960`) is the
  `--project-fixture` of (1) case (d)'s marked child and (2) a second marked child spawned by hand
  whose marker names exactly `sectionPlanRefNaming`, `sectionProjectLayer`, `sectionCommitAutomation`
  (each under 5 s, RESEARCH § Timings), with `--plugin-root P020 --project-fixture <the copy>`; every
  file under the copy is hashed before and after each child (relative path + content hash, no file
  added or removed) - any difference is a FAIL (D-07); and the second child's document holds exactly
  those three sections. Why this is the proof: the child harness is one code path for every section,
  the fixture is touched only by the sections that read `PROJECT` and by the parent's `finally`
  (RESEARCH F-25), and the parent's remove is guarded by `temporary` (`aiwf-selfcheck.js:10188`, the
  run created it) - so the three `PROJECT` readers run through the harness are every child path that
  can reach a caller-named fixture. The planted sites are named constants,
  like `PROJECT_SCOPE_CRASH_SITE` `:2028`, matching a literal line the Writer writes once in the
  engine.
- R1 (D-08) `migrations/0039_<slug>/ops.json` and `NOTES.md`, on the model of
  `migrations/0038_selfcheck-scope/ops.json:1-12` - one `note` op only, no re-render op (no managed
  artifact changes), its text naming the FAIL verdict wording (SUITES-001 W5), the per-section print
  (W4), the suites' project-scope spawns (W1-W2; the cycle's step 8 keeps the full scope), `--jobs` and its default (A1-A4), the reused pass
  (A6); `docRefs` naming the changed payload files; `migrations/index.json:39`: the `0039_<slug>`
  entry after it, `targetPluginVersion` `0.3.14`.
- R2 (D-08) `.claude-plugin/plugin.json:3`: `0.3.14`.

COO (R1 prose in the main session; R3-R5 written BEFORE the Verify batch starts, runbook
`dev/VERIFY_RUNBOOK.md:18`, and carried by the one code commit, D-08):

- R3 `CHANGELOG.md:7`: the `## [0.3.14] - <date>` block above it, root `CLAUDE.md` § Changelog format
  - the entries of SUITES-001 and SUITES-002; its last line `Retires local rules: none` (D-08).
- R4 `scripts/selfcheck/README.md:46`: the usage line gains `[--jobs <n>]`, one sentence on the
  default and `--jobs 1` (the UPDCHECK-002 precedent: this readme is the COO's prose).
- R5 `README.md:20-22` § Status kept true for 0.3.14 (`dev/PROJECT_OVERRIDES.md:188`).
- R6 after the code commit and the live-copy refresh, on the operator's word: the self-install
  `/pnp:update --apply` on this repository; the rendered `.claude/` copies move by it, never by hand.

Unchanged: `runProjectScope` and the project scope's output (A1); every section function's body but
`sectionWrappers` `:3468`, `:3492-3494` (A6); the header lines `:10108-10122`, the COVERAGE,
notes, tally and FAILURES texts `:10191-10358`; `scripts/selfcheck/run-selfcheck.mjs`;
`.github/workflows/ci.yml` (CI keeps running the default); `scripts/setup/`, `scripts/ci/`,
`examples/`.

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken. `$LOGS` is the
log directory of the Verify batch, OUTSIDE the repository.

At the hand-back, on the tree:

- D-05, the flag: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --jobs 0`, the same with
  `--jobs x` and with a bare `--jobs` as the last argument - an exit other than 2, or stderr without
  `--jobs`.
- D-05, the project scope: `git grep -c -F "  sectionCommitAutomation(projectRoot);" -- scripts/selfcheck/aiwf-selfcheck.js` - anything but `:1`.
- S6: `git grep -c -E "^function section[A-Za-z0-9_]*\(" -- scripts/selfcheck/aiwf-selfcheck.js` - anything but `:33`.
- D-05, the canonical table: `git grep -n -E "name: 'section[A-Za-z0-9]+', group: [1-4]" -- scripts/selfcheck/aiwf-selfcheck.js | wc -l` - anything but `30`.
- D-05, the canonical table IN DOCUMENT ORDER - each entry's name against the literal sequence of
  today's `main()` `:10130-10159`, its group against A2's table, and its `run` calling the function
  of its own name: `node -e "const t=require('fs').readFileSync('scripts/selfcheck/aiwf-selfcheck.js','utf8');const got=[...t.matchAll(/\{ name: '(section[A-Za-z0-9]+)', group: ([1-4]), run: \(c\) => (section[A-Za-z0-9]+)\(/g)].map((m)=>({n:m[1],g:Number(m[2]),f:m[3]}));const seq='sectionBashHost sectionGate1Identity sectionGate2 sectionGate2Mode sectionPlanRefNaming sectionGate4 sectionGate3 sectionGate3Toggle sectionGate3Surface sectionGate3Planning sectionConfigSchema sectionMigrationPayload sectionHookWiring sectionMarketplace sectionWrappers sectionShWrappers sectionPlanGate sectionRunHeader sectionResolver sectionRolesCommand sectionPayloadIntegrity sectionProvenance sectionExampleFixture sectionProjectLayer sectionDraftsObservations sectionE2eTraceObservation sectionCommitAutomation sectionCommitAutomationControls sectionNegativeControls sectionScopeControls'.split(' ');const want={1:'sectionBashHost sectionShWrappers',2:'sectionGate1Identity sectionGate2 sectionGate2Mode sectionGate3 sectionGate3Toggle sectionGate3Surface sectionGate3Planning sectionWrappers',3:'sectionGate4 sectionConfigSchema sectionMigrationPayload sectionHookWiring sectionMarketplace sectionPlanGate sectionRunHeader',4:'sectionPlanRefNaming sectionResolver sectionRolesCommand sectionPayloadIntegrity sectionProvenance sectionExampleFixture sectionProjectLayer sectionDraftsObservations sectionE2eTraceObservation sectionCommitAutomation sectionCommitAutomationControls sectionNegativeControls sectionScopeControls'};const grp={};for(const [g,s] of Object.entries(want))for(const n of s.split(' '))grp[n]=Number(g);const bad=[];if(got.length!==seq.length)bad.push('entries '+got.length+' of '+seq.length);got.forEach((e,i)=>{if(e.n!==seq[i])bad.push('order '+(i+1)+': '+e.n+' <> '+seq[i]);if(e.g!==grp[e.n])bad.push('group '+e.n+'='+e.g+' <> '+grp[e.n]);if(e.f!==e.n)bad.push('run of '+e.n+' calls '+e.f);});console.log(bad.length?'TABLE WRONG '+bad.slice(0,5).join(' ; '):'TABLE OK');process.exit(bad.length?1:0)"` -
  exit != 0 or `TABLE WRONG` (an entry missing or extra, out of today's order, in the wrong group, or
  its `run` calling another section).
- D-06: `git grep -c -F "psResumeFindings(PLUGIN_ROOT, { execProbes: true" -- scripts/selfcheck/aiwf-selfcheck.js` - anything but `:1`;
  `git grep -c -F "psResumeFindings(psBase, { execProbes: true" -- scripts/selfcheck/aiwf-selfcheck.js` - anything but `:1`.
- `git grep -n -F '"version": "0.3.14"' -- .claude-plugin/plugin.json` - no hit.
- `git grep -n -F '"targetPluginVersion": "0.3.14"' -- migrations/index.json` - no hit, or a hit not
  on the `0039_` line.
- `git grep --untracked -c -F '"op": "note"' -- "migrations/0039_*/ops.json"` - anything but `:1`;
  `git grep --untracked -c -F '"op": "rerender' -- "migrations/0039_*/ops.json"` - any line.
- `git grep -n -F -e "## [0.3.14]" -e "## [0.3.13]" -e "Retires local rules:" -- CHANGELOG.md` - no
  `## [0.3.14]` hit, or the hit just before `## [0.3.13]` not `Retires local rules: none`.
- `git diff <guard> -- .github examples scripts/ci scripts/setup scripts/selfcheck/run-selfcheck.mjs dev/PROJECT_OVERRIDES.md` - any output.
- `git grep -n -i -e silerax -e stratex -e furnissimo -- CHANGELOG.md README.md docs skills templates scripts hooks migrations` - any hit; the same with `--untracked` over `"migrations/0039_*"` - any hit.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

On the Verify logs (the CI form, D-09; the pair runs one after the other, never beside another full
self-check or the example cycle - the in-repo probe paths `aiwf-selfcheck.js:9085`, `:9449`):

- `validate-payload` - exit != 0.
- D-05/D-07, the pair - stdout and stderr to SEPARATE files (the comparison reads stdout alone; the
  child lines are stderr); the default half is the `selfcheck` row's own run of the batch:
  `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . > "$LOGS/selfcheck.log" 2> "$LOGS/selfcheck.err"`
  and, after the batch has finished,
  `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --jobs 1 > "$LOGS/selfcheck-jobs1.log" 2> "$LOGS/selfcheck-jobs1.err"` -
  either exit != 0, or either log holding `---- INCOMPLETE RUN ----`.
- D-05/D-07, the WHOLE stdout of those two runs as text, after normalising the `pnp-*-XXXXXX` scratch
  paths and the `slowest sections:` rows (each row, seconds and title, to `  N.N row` - the five
  slowest titles may legitimately differ between a serial and a parallel run; the row count may not):
  `node -e "const fs=require('fs');const norm=(t)=>t.split(/\r?\n/).map((l)=>l.replace(/(pnp-[A-Za-z0-9-]*-)[A-Za-z0-9]{6}/g,'\$1X').replace(/^  \d+\.\d .*$/,'  N.N row'));const a=norm(fs.readFileSync(process.argv[1],'utf8')),b=norm(fs.readFileSync(process.argv[2],'utf8'));const d=[];for(let i=0;i<Math.max(a.length,b.length);i+=1){if(a[i]!==b[i])d.push((i+1)+': '+JSON.stringify(a[i])+' <> '+JSON.stringify(b[i]));}console.log(d.length?'DIFFERENT '+d.slice(0,3).join(' | '):'SAME');process.exit(d.length?1:0)" "$LOGS/selfcheck-jobs1.log" "$LOGS/selfcheck.log"` -
  exit != 0 or `DIFFERENT` (a section, a row, COVERAGE, a note, the tally or FAILURES differs or
  moved, or a child line leaked into stdout).
- D-05, canonical order: `diff <(grep "^=== " "$LOGS/selfcheck-jobs1.log") <(grep "^=== " "$LOGS/selfcheck.log")` - any output.
- D-05, canonical order against the engine before this ticket: `diff <(grep "^=== " "$SUITES001_SELFCHECK_LOG") <(grep "^=== " "$LOGS/selfcheck-fixture.log")` -
  any output. `$SUITES001_SELFCHECK_LOG` is SUITES-001's `selfcheck` Verify log, kept by the COO
  outside the repository and named in the dispatch. Both sides are the fixture form on an existing
  installation, because the CI form's PROJECT LAYER title carries `[fixture: authored by this run]`
  (`aiwf-selfcheck.js:7524`) and would differ from SUITES-001's fixture-form title by that suffix alone.
- D-07, the fixture on the default parent path (the third run of `## Verify`): the copy hashed by
  `node -e "const fs=require('fs'),p=require('path'),c=require('crypto');const r=process.argv[1];const out=[];const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);if(e.isDirectory())walk(f);else out.push(p.relative(r,f).split(p.sep).join('/')+' '+c.createHash('sha256').update(fs.readFileSync(f)).digest('hex'));}};walk(r);out.sort();fs.writeFileSync(process.argv[2],out.join('\n')+'\n')" "$LOGS/fixture-copy" "$LOGS/fixture-before.txt"`
  before the run and the same command into `"$LOGS/fixture-after.txt"` after it, then
  `diff "$LOGS/fixture-before.txt" "$LOGS/fixture-after.txt"` - any output (a hash differs, or a
  file was added or removed). The run's EXIT IS NOT ASSERTED: its PROJECT LAYER version-stamp row
  reds until the self-install apply (`dev/VERIFY_RUNBOOK.md:21-28`).
- D-05, the dealing in the default run: `grep "^aiwf-selfcheck: child " "$LOGS/selfcheck.err"` -
  anything but exactly these four lines, in this order (the default is four children when
  `node -e "console.log(require('os').availableParallelism())"` prints 5 or more; below that the
  expected lines are A2's dealing for that n, written into the record):

  ```text
  aiwf-selfcheck: child 1: sectionBashHost, sectionShWrappers
  aiwf-selfcheck: child 2: sectionGate1Identity, sectionGate2, sectionGate2Mode, sectionGate3, sectionGate3Toggle, sectionGate3Surface, sectionGate3Planning, sectionWrappers
  aiwf-selfcheck: child 3: sectionGate4, sectionConfigSchema, sectionMigrationPayload, sectionHookWiring, sectionMarketplace, sectionPlanGate, sectionRunHeader
  aiwf-selfcheck: child 4: sectionPlanRefNaming, sectionResolver, sectionRolesCommand, sectionPayloadIntegrity, sectionProvenance, sectionExampleFixture, sectionProjectLayer, sectionDraftsObservations, sectionE2eTraceObservation, sectionCommitAutomation, sectionCommitAutomationControls, sectionNegativeControls, sectionScopeControls
  ```

  and `grep -c "^aiwf-selfcheck: child " "$LOGS/selfcheck-jobs1.err"` - anything but `0`.
- D-06: the `NOT EXERCISED IN THIS RUN` block of `$LOGS/selfcheck.log` lacks a `no negative control for PowerShell resume check` line that the block of SUITES-001's `selfcheck` log holds - broken.
- S7: the `update-suite` and `setup-suite` logs end `UPDATE SUITE: PASS` / `SETUP SUITE: PASS`, and
  the P1 cases (a)-(e) are `[PASS]` there; the `example-cycle-windows` log ends `EXAMPLE CYCLE: PASS` -
  otherwise broken.

After the commit (the COO, R6):

- `_aiwf.lastMigrationApplied` in `.claude/aiwf-native/aiwf.config.json` not the `0039_<slug>` id;
  the apply exit != 0, or its self-check line not
  `self-check: PASS - ==== P/T assertions passed ==== (project layer only - ...)` (the proof of the
  fixture form's project rows, D-09); `records/SUITES-002.md` without the LOCAL numbers of D-07
  (the batch wall clock, the `slowest sections:` blocks of the Verify logs) and the command of each.

## Risk threshold

Blocks: any change in what the report prints after the sections (`:10191-10358`) or in the header;
a tally line other than the last line of a green run; a consumer of S7 no longer matching; the
default and the `--jobs 1` run differing in result names or tally; a section dropped, run twice, or
run outside its group's constraint; a child writing to the parent's stdout, writing or removing the
fixture, or spawning groups; a child's stderr line missing or naming sections other than its slot's;
a byte of the `--project-fixture` tree changed by a run; a P1 case that runs a full self-check (no
minutes go back into test-update, D-02); a crash or a dead child that leaves exit 0 or no `(uncaught)` row; the
project scope's code path or output changed; a third PowerShell exec pass left, or the pristine pass
removed; a re-render op or an op outside the vocabulary; a shipped migration's text changed;
`index.json` not monotonic or its last entry not the payload version; a time bound written as
acceptance (D-07). Notes: the env variable names, the result document's shape, the slug, wording.

## Stop condition

Stop and hand back before writing when: a section turns out to share state or an in-repo path with a
section of another group beyond the four D-05 constraints (a module-level variable written by one
and read by another, a fixed path under `PLUGIN_ROOT` or `PROJECT`); a section's output depends on
the sections before it outside its group; an assertion or a consumer reads the self-check's
interleaved stdout live (not the final report); the async spawn cannot keep the exit through
`process.exitCode`; a shipped migration would have to change; a file outside the Code Map must
change. The Writer writes A1-A6, P1, R1 and R2 in one dispatch and hands back once, writing none of
R3-R6; R3-R6, the code commit, the record's docs commit, the tag word and the push word are the
COO's, each on the operator's word or click (index § Order and gates).

## Verify

D-09's rows for this diff, the union, ONCE, as ONE parallel batch started by the COO in the
background at the hand-back (R3-R5 already written): `selfcheck` in the CI form
(`node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` - the diff carries the bump, so the
fixture form reds its version-stamp row until the self-install apply, `dev/VERIFY_RUNBOOK.md:21-28`;
the default half of the D-05 pair), `update-suite` (`node scripts/update/test-update.mjs`, it parses
the self-check's output and holds P1, whose cases (a)-(e) add seconds, not minutes), `setup-suite` (`node scripts/setup/test-setup.mjs`, it spawns it),
`example-cycle-windows` (`node scripts/ci/run-example-cycle.mjs`, step 8 runs it), `validate-payload`
(`node scripts/update/validate-payload.mjs --plugin-root .`), all cwd `.`; then, after the batch has
finished, the `--jobs 1` half of the pair alone, in the same CI form
(`node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --jobs 1`); then, after the `--jobs 1`
half has finished, the third run, the default `--jobs` in the fixture form against a COPY of this
repository's project layer outside the repository (D-07): `mkdir -p "$LOGS/fixture-copy"` and
`cp -r .claude CLAUDE.md AGENTS.md .gitignore "$LOGS/fixture-copy/"` (the files the fixture form
reads), the before-hash of the acceptance, then
`node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture "$LOGS/fixture-copy" > "$LOGS/selfcheck-fixture.log" 2> "$LOGS/selfcheck-fixture.err"`,
then the after-hash; its exit is not asserted. The pair and the third run never run beside each
other or beside the example cycle (the in-repo probe paths `aiwf-selfcheck.js:9085`, `:9449`). The
fixture form's project rows are proven by R6's embedded project-scope check after the commit. Every suite run goes to a log
file OUTSIDE the repository (the example cycle asserts a byte-identical tree, RESEARCH F-8), never
piped through tail; a run over ~5 minutes runs in the background with a timeout of at least 3600000
ms; the runbook is `dev/VERIFY_RUNBOOK.md` (overrides § Test policy: VERIFY in PORTIONS - Portion 1 =
the Windows commands as ONE parallel batch; Portion 2 = WSL, not a gate, never concurrent with
Portion 1). Portion 1 only; CI runs the full set after the push. ZERO edits in the tree while the
batch runs. The record carries the LOCAL numbers (D-07): the batch wall clock and the `slowest
sections:` blocks of the Verify logs, each with its command. The CI step seconds of the pushed
commit go into no record: one row in `dev/backlogs/readiness/SUITES/ledger.md`, written by the
session that first sees that run finished (index § Order and gates).

## Code Map

| path | role |
|---|---|
| `scripts/selfcheck/aiwf-selfcheck.js` | A1-A6 (Writer) |
| `scripts/update/test-update.mjs` | P1 (Writer) |
| `migrations` | R1 (Writer) |
| `migrations/index.json` | R1 (Writer) |
| `.claude-plugin/plugin.json` | R2 (Writer) |
| `CHANGELOG.md` | R3 (COO) |
| `scripts/selfcheck/README.md` | R4 (COO) |
| `README.md` | R5 (COO) |
| `.claude/aiwf-native` | R6, the COO's apply |
