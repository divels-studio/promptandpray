# UPDCHECK-001 [R2 code] - the self-check engine gains a `--scope` flag; the embedded run takes the project scope

Implements: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: nothing (first ticket).

## Outcome

`scripts/selfcheck/aiwf-selfcheck.js` takes `--scope project|full` (D-03). `full` (and no flag) is
today's run, every section and negative control, argv byte for byte (D-02). `project` runs only the
checks that read the real project (D-01, D-04; closing greps set 2) and spawns no PowerShell or bash
host. The one embedded spawn passes `--scope project`, and its PASS line names the narrower claim
(D-05, D-06). The full run carries a SCOPE CONTROLS section that proves the project scope can fail and
prints no payload section (D-07). No section is removed (D-08).

## Scope

The worklist; every row at its `file:line` (`SC` = `scripts/selfcheck/aiwf-selfcheck.js`).

- A1 CLI, beside `KEEP_FIXTURE` `SC:74`: `--scope` read with `argValue` `SC:67-70`; absent -> `full`;
  `project` or `full` taken; any other value, or `--scope` with no value (`argValue` null while
  `HAS('--scope')`), -> `bail` `SC:76-79` (exit 2), the message naming `--scope` and both values.
- A2 host discovery `SC:215`, `SC:288`: probed only under `full`; under `project` `PWSH` and `BASH`
  are null and `findPwsh` / `findBash` never run. The 39 uses (set 3) and the `findBash(...)` doubles
  `SC:476-495` unchanged.
- A3 `main()` `SC:9958-9987`. Under `project`, in this order: the project block of
  `sectionPlanRefNaming` `SC:1510-1536` (with the `aiwf-lib` export check it needs, `SC:1247-1252`)
  under a section title of its own starting `PROJECT PLAN NAMING - `; `sectionProjectLayer(PROJECT,
  selfAuthored)` `SC:9983`; the inspected-project reading of `sectionCommitAutomation` `SC:9986` only -
  `commitAutomationNote(projectRoot)` `SC:7989-7991` and the check that reports it `SC:8010-8017`,
  under its title `SC:7987`. Its synthetic git fixtures under `tmpRoot` (`SC:7996-8006`,
  `SC:8019-8169`) run under `full` only, right after the reading, under a title of their own starting
  `COMMIT AUTOMATION CONTROLS - `. Under `full`: the 28 calls in today's order; the two moved blocks
  print under their new titles in place, so no assertion is added or lost.
- Writes and concurrency: RESEARCH.md § Writes and what runs beside them - no write to the real project
  on the project scope, no lock, no written path shared between two runs; the change keeps it so.
- A4 header `SC:9946-9955`: a line `scope           : <project|full>` after `project layer` `SC:9948`;
  under `project` the `powershell host` line `SC:9949` reads `(not probed: project scope)`, and the
  self-authored NOTE `SC:9952-9954` drops its NEGATIVE CONTROLS sentence (that section does not run).
- A5 COVERAGE `SC:10025-10153`: under `project` a short block instead - what ran (the three titles),
  what did not (the payload sections, the hosts, the negative controls), and that `/pnp:selfcheck`
  runs the full check. Tally `SC:10162` and exit `SC:10167` byte for byte (D-06).
- A6 a full-scope section `SCOPE CONTROLS`, called after `sectionNegativeControls` `SC:9987` (D-07).
  Child = this file with `--plugin-root PLUGIN_ROOT --scope project --project-fixture <copy>`, each
  copy built by `writeFixture` `SC:519` under `tmpRoot`:
  - S1 healthy copy: exit 0; its `=== ` lines (`section` `SC:93-96`) are exactly the three titles of
    A3; the `scope           : project` line; the tally line last.
  - S2 S1 with `PATH` = the directory of `process.execPath` and `ProgramFiles`, `ProgramW6432`,
    `ProgramFiles(x86)` removed: exit 0, the same tally as S1.
  - S3 a copy with one managed artifact recorded in its bookkeeping deleted (the model:
    `scripts/update/test-update.mjs:2010`): exit 1, its `FAILURES:` names the check that
    `projectLayerFindings` `SC:7108` reports not ok on the same copy in-process - the full scope's
    own reading of it.
  - S4 `--scope bogus` and a bare trailing `--scope`: exit 2 each.
- B1 `scripts/selfcheck/run-selfcheck.mjs:60`: the argv gains `'--scope', 'project'`; contract text
  `:13-17` says so; the PASS print `:99` becomes `self-check: PASS - <the child's last non-empty line,
  verbatim> (project layer only - run \`/pnp:selfcheck\` for the full check)`. SKIPPED `:87`, COULD NOT
  RUN `:93-94` and FAIL `:107-110` unchanged.
- C1 `scripts/update/test-update.mjs`: the two crash cases `:2026-2028`, `:2056-2058` patch the
  project-scope call of the commit-automation reading (A3) instead of `    sectionGate2(tmpRoot);` (set 6), so
  `:2043-2044` and `:2067-2069` still see passes before the crash; sc-pass `:1971-1973` also requires
  the suffix of B1; sc-red `:2013-2014` also requires the child's `scope           : project` line and
  no `=== GATE 1` line. The direct run `:1959-1963` stays the full scope.
- C2 unchanged: `scripts/setup/test-setup.mjs:172-174`, `:1013-1023`, `CALL_SITES = 5` `:1050`; the
  four callers of set 1. The direct invocations of set 7 stay the FULL scope, argv unchanged (D-02):
  `.github/workflows/ci.yml:61`, `:103`, `:151`; `skills/selfcheck/SKILL.md:29`;
  `examples/example-project/README.md:120` with `scripts/ci/run-example-cycle.mjs:63` (run at `:608`);
  `scripts/update/test-update.mjs:1960`; `scripts/setup/test-setup.mjs:57` (run at `:1538`);
  `.claude/aiwf-native/aiwf.config.json:203`; `dev/answers.json:29`. Only the embedded spawn
  `scripts/selfcheck/run-selfcheck.mjs:60` takes the project scope (B1, D-05). Set 7's references are
  untouched, except the usage comment `SC:44`, which gains `--scope`.

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken.

- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture . --scope project` -
  exit != 0; a `=== ` line other than A3's three; no `scope           : project` line; a
  `powershell host :` line naming a host; the last line not `==== P/T assertions passed ====`.
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --scope bogus` - exit != 2, or stderr
  without `--scope`. The same with `--scope` as the last argument - exit != 2.
- `git grep -n -F -e "const PWSH = findPwsh();" -e "const BASH = findBash();" -- scripts/selfcheck/aiwf-selfcheck.js` - any hit.
- `git grep -n -F "'--scope', 'project'" -- scripts/selfcheck/run-selfcheck.mjs` - no hit.
- `git diff <guard HEAD> -- .github/workflows/ci.yml .claude/aiwf-native/aiwf.config.json scripts/setup`,
  the guard hash substituted literally by the COO at the dispatch - exit != 0, or any output.
- The selfcheck run of § Verify - exit != 0; no `=== SCOPE CONTROLS` section or an S1-S4 check
  FAIL; no `scope           : full` line; a total below the last recorded full run's 1756
  (`dev/backlogs/archive/019_PLAN_GATES_2026-11-06/records/GATES-005.md:50`).
- The update-suite, setup-suite, validate-payload and example-cycle-windows runs of § Verify - exit != 0.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: any run without `--scope` changed in argv, sections or controls; a host probed under
`project`; a third scope value accepted, or a bare `--scope` run; the tally line or an exit code
changed; the PASS prefix or the verbatim child line changed, so `/self-check: PASS - .*assertions
passed/` stops matching; a payload section title printed under `project`; a negative control removed
from the full run; the call-site count moved; a path or project name in the payload. Notes: the
coverage wording, the titles' text after their prefixes.

## Stop condition

Stop and hand back before writing when: a check of A3 needs `PWSH` or `BASH`; a call site reading
the real project exists beyond set 2; the crash cases of C1 find no project-scope line with passes
before it; S2 needs a host to pass; a file outside the Code Map must change. Stop after the
hand-back; the commit follows the review, on the operator's click.

## Verify

Proportional rows (overrides § Test policy): `selfcheck` (`node scripts/selfcheck/aiwf-selfcheck.js
--plugin-root . --project-fixture .`), `update-suite` (`node scripts/update/test-update.mjs`),
`setup-suite` (`node scripts/setup/test-setup.mjs`, setup's install runs the embedded self-check),
`validate-payload` (`node scripts/update/validate-payload.mjs --plugin-root .`) and
`example-cycle-windows` (`node scripts/ci/run-example-cycle.mjs`, it asserts the embedded PASS line
at `scripts/ci/run-example-cycle.mjs:478`, `:603`), cwd `.` - once, by the COO in the background at
the hand-back. Portion 1 only (Portion 2 is not a release gate); runbook `dev/VERIFY_RUNBOOK.md`;
logs outside the repository; a run over ~5 minutes in the background with a 3600000 ms timeout. The
Writer runs only the tests it adds (S1-S4, C1), each red under a named fault, then green.

## Code Map

| path | role |
|---|---|
| `scripts/selfcheck/aiwf-selfcheck.js` | A1-A6 |
| `scripts/selfcheck/run-selfcheck.mjs` | B1 |
| `scripts/update/test-update.mjs` | C1 |
| `scripts/setup/test-setup.mjs` | C2 (read, unchanged) |
| `.github/workflows/ci.yml` | C2 (read, unchanged) |
