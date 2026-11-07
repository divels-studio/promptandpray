# SUITES-001 [R2] - the cuts: one VERIFY row out, the suites' self-checks on the project scope, a per-section time print, an honest FAIL verdict

Implements: D-01, D-02, D-03, D-04, D-07, D-09.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: nothing (the first ticket).
No version: the commit lands on `main` unreleased; 0.3.14 carries it (D-08, SUITES-002).

## Outcome

`verify.commands` holds seven rows and the `dev/` canon names CI's ubuntu leg as the POSIX proof
(D-01); the three full-scope self-check spawns of test-setup and test-update take the project scope,
while the cycle's step 8 keeps the full run against its bumped payload copy (D-02); test-setup, test-update, the example cycle and the self-check
end with a `slowest sections:` block right before their unchanged tally line (D-03); the embedded
runner's FAIL verdict says the run was the project scope and names `/pnp:selfcheck` for the full
check, with no host clause (D-04). Measured, not promised (D-07).

## Scope

The worklist; every row at its `file:line` (pointers at HEAD 4969f7e). Two actors (D-01, overrides
§ Hard rules `dev/PROJECT_OVERRIDES.md:38-43`).

Writer (code and config):

- W1 (D-02) `scripts/setup/test-setup.mjs:326` and `:1538`: the spawn argv gains `'--scope', 'project'`
  ON THE SAME LINE as `'--project-fixture'` (the acceptance greps per line). The two assertions
  `:328` and `:1539-1540` stay (exit 0). The comment `:35-39` is rewritten to today's fact: an
  install's embedded self-check is the project scope (since 0.3.13) - the project layer only, no
  host; the cases that are about the integration run it, the rest pass `--no-selfcheck`. The comment
  `:1003-1007` stays (S4 exempt).
- W2 (D-02) `scripts/update/test-update.mjs:1960`: the same, on line `:1960`; the assertion
  `:1962-1963` stays.
- W3 (D-02) the cycle KEEPS the full scope, nothing changes there: the documented command
  `scripts/ci/run-example-cycle.mjs:63` and its copy `examples/example-project/README.md:120` stay as
  they are (step 8 is the one full run against a bumped payload copy, payload2 `:500-525`; the
  self-check compares the two lines both ways, `scripts/selfcheck/aiwf-selfcheck.js:9345-9373`).
  Checked consumer, unchanged: `scripts/selfcheck/README.md:69-71` (it describes that full run and
  stays true). Also unchanged: the step title `run-example-cycle.mjs:607`, its assertion `:609-610`,
  `scripts/ci/README.md:5`. The cycle file changes for W4 only.
- W4 (D-03) the per-section wall time. The header helpers record a timestamp per section title:
  `scripts/setup/test-setup.mjs:70`, `scripts/update/test-update.mjs:89`,
  `scripts/ci/run-example-cycle.mjs:83` (recorded under `--quiet` too; the block is part of the
  summary `:36` promises), `scripts/selfcheck/aiwf-selfcheck.js:112-115` (`currentSection` unchanged).
  A section's seconds = the next section's timestamp (or the block's print time, for the last) minus
  its own. The block is printed right before the tally line, after everything else the closing code
  prints today: `test-setup.mjs` before `:2121`, `test-update.mjs` before `:2100`,
  `run-example-cycle.mjs` before `:703`, `aiwf-selfcheck.js` after the observations `:10349-10352` and
  before `:10353` (the project scope too). Its exact shape:

  ```text
  slowest sections:
    <s.s> <title>          (one row per section, the five slowest, descending; fewer when the run had fewer)
    <s.s> total            (process.uptime() at the print)
  ```

  then the existing blank line and tally line, text unchanged (`checks: N, failures: M`,
  `==== P/T assertions passed ====`). No row starts with `=== `. `scripts/spike/run-spikes.mjs`
  gets no print (D-03).
- W5 (D-04) `scripts/selfcheck/run-selfcheck.mjs:108-113`: the verdict keeps `self-check: FAIL (exit N).`,
  `The files WERE written and nothing was rolled back` and `never reports that the write failed`
  (asserted by `test-setup.mjs:988-989`, `:1024-1025`, `test-update.mjs:1997-1998`, `:2020-2021`,
  `:2053-2054`); the EITHER/OR and the clause of `:110-111` go; it says that `${subject}` is
  inconsistent, that this run checked the project scope only (no host probed), that the detail above
  says what is inconsistent, and that `/pnp:selfcheck` runs the full check. The contract comment
  `:23-27` (point 4) says the same as the verdict. `scripts/setup/test-setup.mjs:1026-1028` asserts
  the new wording (the project-scope sentence and `/pnp:selfcheck`), not the old clause (closing
  grep S3: these two files plus the two skills of C4).
- W6 (D-01) `.claude/aiwf-native/aiwf.config.json:196-200`: the `example-cycle-linux` object removed,
  the array still valid JSON (the file is not recorded in `_aiwf.managedRegions` `:6-16`);
  `dev/answers.json:28`: the same row removed.

COO (R1 prose, in the main session, written BEFORE the Verify batch starts - runbook
`dev/VERIFY_RUNBOOK.md:18`):

- C1 (D-01) `dev/PROJECT_OVERRIDES.md:150-152`: the list without `example-cycle-linux`, one clause
  naming CI's ubuntu leg the POSIX proof; `:170-171`: "the seven Windows commands".
- C2 (D-01) `dev/VERIFY_RUNBOOK.md:10`, `:12`: seven; `:19-20`: all seven are Windows processes, the
  POSIX proof is CI's ubuntu leg (HARD-021, `:32`), Portion 2 reproduces a red one; `:78-79`: corrected
  to the release rule `dev/PROJECT_OVERRIDES.md:50-54` (CI not waited for; a red POSIX leg is a
  defect ticket).
- C3 (D-01) `dev/README.md:44`: the line removed.
- C4 (D-04 consumers, closing grep S3) `skills/update/SKILL.md:107-108` and
  `skills/setup/SKILL.md:149-150`: the parenthetical that quotes the removed clause goes (payload
  prose, the COO's R1, in the docs commit; it reaches consumers with 0.3.14). Unchanged, not
  consumers: `skills/update/SKILL.md:100`, `skills/setup/SKILL.md:142`, `CHANGELOG.md:23` (a shipped
  block).

Unchanged: `.github/workflows/ci.yml`, `examples/example-project/answers.json`,
`examples/example-project/answers-linux.json`, the self-check's CI and example pins
`scripts/selfcheck/aiwf-selfcheck.js:9309-9431` (D-01); the self-check's section functions and
`main()` `:10088-10189` beyond W4's timestamp (SUITES-002); `scripts/spike/` (D-03).

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken. `$LOGS` is the
log directory of the Verify batch, OUTSIDE the repository.

- D-02: `git grep -n -F -e "--project-fixture" -- scripts/setup/test-setup.mjs scripts/update/test-update.mjs | grep -v -F -e "'--scope', 'project'" -e "--scope project" -e "// --project-fixture"` -
  any output (at the guard HEAD it prints the three lines `test-setup.mjs:326`, `:1538`,
  `test-update.mjs:1960`).
- D-02, the cycle keeps the full scope: `git grep -n -F -e "--project-fixture <project>" -- scripts/ci/run-example-cycle.mjs examples/example-project/README.md` -
  anything but one hit per file, or a hit carrying `--scope`.
- D-02: `git diff <guard> -- examples scripts/selfcheck/README.md` - any output.
- D-04: `git grep -n -F -e "a host the checks need was missing or unusable" -e "could not prove part of the contract" -- scripts skills docs templates examples` -
  any hit.
- D-04: `git grep -c -F "/pnp:selfcheck" -- scripts/selfcheck/run-selfcheck.mjs` - a count lower
  than at the guard HEAD (`git show <guard>:scripts/selfcheck/run-selfcheck.mjs | grep -c -F "/pnp:selfcheck"`).
- D-01: `git grep -n -F "example-cycle-linux" -- .claude/aiwf-native/aiwf.config.json dev/answers.json dev/VERIFY_RUNBOOK.md dev/PROJECT_OVERRIDES.md` - any hit.
- D-01: `git grep -n -F "answers-linux" -- dev/README.md` - any hit.
- D-01: `git grep -n -w "eight" -- dev/PROJECT_OVERRIDES.md dev/VERIFY_RUNBOOK.md dev/README.md` - any hit.
- D-01: `git grep -n -F "tag is placed AFTER the CI run" -- dev/VERIFY_RUNBOOK.md` - any hit.
- D-01: `node -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync('.claude/aiwf-native/aiwf.config.json','utf8'));const a=JSON.parse(fs.readFileSync('dev/answers.json','utf8'));const n=(x)=>JSON.stringify((x.verify||{}).commands.map((r)=>r.name));process.exit(c.verify.commands.length===7&&n(c)===n(a)?0:1)"` -
  exit != 0 (a JSON parse error, not seven rows, or the two lists differ).
- D-01: `git diff <guard> -- .github examples/example-project/answers.json examples/example-project/answers-linux.json scripts/spike` - any output.
- D-03, on the Verify logs: `node -e "const fs=require('fs');let bad=0;for(const f of process.argv.slice(1)){const l=fs.readFileSync(f,'utf8').split(/\r?\n/);const i=l.indexOf('slowest sections:');let j=i+1;while(j<l.length&&/^  \d+\.\d \S/.test(l[j]))j+=1;let k=j;while(k<l.length&&l[k].trim()==='')k+=1;const ok=i>=0&&j-i-1>=2&&j-i-1<=6&&/ total$/.test(l[j-1])&&/^(checks: \d+, failures: \d+|==== \d+\/\d+ assertions passed ====)$/.test(l[k]||'');if(!ok){bad+=1;console.log('BROKEN '+f);}}process.exit(bad?1:0)" "$LOGS/setup-suite.log" "$LOGS/update-suite.log" "$LOGS/example-cycle-windows.log" "$LOGS/selfcheck.log"` -
  exit != 0, or any `BROKEN` line (no block, more than five rows, no total row, or the next
  non-blank line not the tally line).
- D-03/S7: the `setup-suite` and `update-suite` logs end `SETUP SUITE: PASS` / `UPDATE SUITE: PASS`
  (their tally-line assertions `test-update.mjs:1972`, `:1975`, `:2044`, `:2048`, `:2076`,
  `test-setup.mjs:174` are inside them), and the `selfcheck` log's SCOPE CONTROLS `[scope-S1]` row is
  `[PASS]` (`aiwf-selfcheck.js:10030`, it requires the tally line last) - otherwise broken.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: a full-scope self-check spawn left in test-setup or test-update; the cycle's step 8 or its
README copy changed (D-02 keeps them full); a tally line changed in text or position, or a consumer of S7 no longer
matching; a `slowest sections:` row that a section-title consumer reads as a title
(`aiwf-selfcheck.js:9993`, `:10024-10026`; `test-update.mjs:2019`); the `WERE written` /
`nothing was rolled back` wording lost; `verify.commands` invalid JSON or schema-red; a change to CI,
the example answers or the self-check's CI/example pins (D-01); a time bound written as acceptance
(D-07). Notes: the verdict's and the comments' wording, the seconds' rounding.

## Stop condition

Stop and hand back before writing when: one of the three spawns of W1-W2 turns out to assert output
only the full scope prints (D-02 rests on the COO read: each asserts exit 0 alone, RESEARCH
§ Unknowns, settled); a consumer of the FAIL verdict other than `test-setup.mjs:1026-1028` and the two skills of
C4 appears; `.claude/aiwf-native/aiwf.config.json` turns out to be a managed artifact; a file outside
the Code Map must change. The Writer stops after W1-W6 and hands back; C1-C4, the commits and the
record are the COO's (index § Order and gates).

## Verify

D-09's rows for this diff, the union, ONCE, started by the COO in the background at the hand-back:
`setup-suite` (`node scripts/setup/test-setup.mjs`), `update-suite`
(`node scripts/update/test-update.mjs`), `example-cycle-windows`
(`node scripts/ci/run-example-cycle.mjs`), `selfcheck`
(`node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`), `validate-payload`
(`node scripts/update/validate-payload.mjs --plugin-root .`), all cwd `.`, plus the provenance grep.
Every suite run goes to a log file OUTSIDE the repository (the example cycle asserts a byte-identical
tree, RESEARCH F-8), never piped through tail; a run over ~5 minutes runs in the background with a
timeout of at least 3600000 ms; the runbook is `dev/VERIFY_RUNBOOK.md` (overrides § Test policy:
VERIFY in PORTIONS - Portion 1 = the Windows commands as ONE parallel batch; Portion 2 = WSL, not a
gate, never concurrent with Portion 1). Portion 1 only. ZERO edits in the tree while the batch runs:
C1-C4 are written before it. The record carries the LOCAL numbers (D-07): the batch wall clock and
the `slowest sections:` blocks of the Verify logs, each with its command; CI step seconds go into no
record (index § Order and gates).

## Code Map

| path | role |
|---|---|
| `scripts/setup/test-setup.mjs` | W1, W4, W5 (Writer) |
| `scripts/update/test-update.mjs` | W2, W4 (Writer) |
| `scripts/ci/run-example-cycle.mjs` | W4 (Writer) |
| `scripts/selfcheck/aiwf-selfcheck.js` | W4 (Writer) |
| `scripts/selfcheck/run-selfcheck.mjs` | W5 (Writer) |
| `.claude/aiwf-native/aiwf.config.json` | W6 (Writer) |
| `dev/answers.json` | W6 (Writer) |
| `dev/PROJECT_OVERRIDES.md` | C1 (COO) |
| `dev/VERIFY_RUNBOOK.md` | C2 (COO) |
| `dev/README.md` | C3 (COO) |
| `skills/update/SKILL.md` | C4 (COO) |
| `skills/setup/SKILL.md` | C4 (COO) |
