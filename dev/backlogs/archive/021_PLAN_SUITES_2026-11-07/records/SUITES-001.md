# SUITES-001 - the cuts: one VERIFY row out, the suites' self-checks on the project scope, a per-section time print, an honest FAIL verdict

## What landed

- `d50b4e7` (the Writer, on the operator's commit dialog; `Refs: SUITES-001`) - seven files:
  - W1/W2 (D-02) `scripts/setup/test-setup.mjs` (the two spawns, now :340 and :1550) and
    `scripts/update/test-update.mjs` (:1973) pass `'--scope', 'project'` on the `--project-fixture` line;
    their exit-0 assertions unchanged; the header comment "WHY MOST CASES PASS --no-selfcheck" rewritten to
    today's fact (the embedded run is the project scope since 0.3.13).
  - W3 (D-02) nothing: the cycle's step 8 and its README copy keep the full scope.
  - W4 (D-03) the four header helpers (`test-setup.mjs`, `test-update.mjs`, `run-example-cycle.mjs` -
    under `--quiet` too - and `aiwf-selfcheck.js`) record a start time per section; `printSlowestSections()`
    prints `slowest sections:`, the five slowest `  <s.s> <title>` rows and `  <s.s> total`
    (`process.uptime()`), right before each unchanged tally line.
  - W5 (D-04) `scripts/selfcheck/run-selfcheck.mjs`: the FAIL verdict drops the EITHER/OR host clause and
    says the run checked the project scope only (no host probed) and that `/pnp:selfcheck` runs the full
    check; contract comment point 4 matches; `test-setup.mjs` asserts the new wording.
  - W6 (D-01) the `example-cycle-linux` row removed from `.claude/aiwf-native/aiwf.config.json`
    `verify.commands` and from `dev/answers.json` (seven rows, the same list in both).
- `9f33a9d` (the COO, docs commit on its dialog) - C1-C4: `dev/PROJECT_OVERRIDES.md` (the seven names, CI's
  ubuntu leg the POSIX proof; "seven Windows commands"), `dev/VERIFY_RUNBOOK.md` (seven; the POSIX proof
  line; the release lines - :33 and the CI section - aligned to the release rule), `dev/README.md` (the
  linux line out of the VERIFY block), `skills/update/SKILL.md` and `skills/setup/SKILL.md` (the quote of
  the removed clause out); `dev/backlogs/ROADMAP.md` § SUITES `Status: in progress` (roadmap write 2).
- The docs commit carrying this record: this file, `SUITES-001-review-brief.md`, the index row closed,
  the ROADMAP finding lines (§ SUITES three lines marked done; § SETUP one new line, the macOS finding).

## Decisions and deviations

- C1-C4 were written BEFORE the Writer's dispatch, not only before the Verify batch: Gate 3 blocks the main
  session on `dev/` and `skills/` once the route state names R2, so the COO's prose had to precede it.
- Three post-dispatch prose fixes (two fact-check rows, the correction round) went into COO files through
  the Writer on the COO's explicit delegation, for the same Gate 3 reason.
- Writer deviation, accepted: the comment above the changed assertion in `test-setup.mjs` (now :1007-1011)
  rewritten - it described the removed two-meaning clause and would have been false.
- Auditor note left as is: the red stub's report text in `test-setup.mjs` (:1024-1027) still names a
  bash-host failure; it is a test double whose text no assertion reads.
- The three post-Verify edits are comment / prose bytes only (`node --check` green on both scripts); no
  Verify row can change, so no second batch (overrides § Test policy).

## Events

| 2026-11-07 | `ticket.md` § fact-check gate | catch | 24 claims, 3 false: a stale CANDIDATES pointer kept in the COO's runbook line, two Writer comments calling the tally "the suite's last word" - all fixed before pass 1 (`SUITES-001-review-brief.md`, this record § Diff review) |
| 2026-11-07 | D-01 / ticket C2 worklist | catch | the auditor found `dev/VERIFY_RUNBOOK.md:33` ("CI is the POSIX proof before a tag") contradicting the corrected release rule; C2 had named only :10, :12, :19-20, :78-79 - a COO enumeration closed without a grep for the phrase; fixed in correction round 1 |
| 2026-11-07 | Gate 3 (route-state write guard) | catch | the COO's Edit of `dev/VERIFY_RUNBOOK.md` with the route open was denied; the fix went to the Writer |

## Verification (what actually ran)

COO, Windows Portion 1, once, in parallel (`Start-Process` per row, logs outside the repository: session
scratchpad `logs-suites001/`, script `verify-suites001.ps1`), started at the Writer's hand-back:

- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0, `valid: 38 migration(s) in D:\promptandpray, payload version 0.3.13`
- `node scripts/setup/test-setup.mjs` - exit 0, `checks: 481, failures: 0`, `SETUP SUITE: PASS`
- `node scripts/update/test-update.mjs` - exit 0, `checks: 457, failures: 0`, `UPDATE SUITE: PASS`
- `node scripts/ci/run-example-cycle.mjs` - exit 0, `checks: 43, failures: 0`, `EXAMPLE CYCLE: PASS`
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` - exit 0, `==== 1761/1761 assertions passed ====`, `[scope-S1]` PASS
- every `.err.log` 0 bytes; `[FAIL]` count 0 in every log.

Acceptance rows (COO, Bash tool, after the batch): the ticket's D-03 node check over the four logs - exit 0,
no `BROKEN` line; `git grep -c -F "/pnp:selfcheck" -- scripts/selfcheck/run-selfcheck.mjs` 7 against 6 at
the guard; the D-01 prose greps (`example-cycle-linux`, `answers-linux`, `-w eight`, the old tag line) and
the D-04 clause grep over skills/docs/templates/examples - no output; provenance grep - no output. Writer
(its hand-back): `node --check` on the five scripts, the D-01 JSON check, the D-02 greps and the guard diffs
over examples, `scripts/selfcheck/README.md`, `.github`, the example answers and `scripts/spike` - no output.

The LOCAL numbers (D-07), read off the Verify logs of the commands above; batch wall clock 776.1 s
(`verify-suites001.ps1`, Process ExitTime minus the batch start):

```text
node scripts/setup/test-setup.mjs
slowest sections:
  6.3 24 - the transfer surface: seeded once at the resolved path, never managed, never rewritten
  2.4 18 - setup overwrites: a pre-existing file is replaced and named, the additions block is carried
  2.3 1 - fresh install, self-check green, memory seeds printed
  2.0 24b - the roadmap: seeded once at <plansDir>/ROADMAP.md, never managed, never rewritten
  1.7 22 - the audit table: a fresh install gets it without being asked, and /pnp:roles rolls it over
  28.3 total

node scripts/update/test-update.mjs
slowest sections:
  15.9 7 - a malformed payload blocks the runner AND a fresh setup, with zero writes
  9.2 18 - the self-check is the update's own last step, and a red one is never exit 0
  5.5 15 - createIfAbsent: accepted, and nothing it would change - a render always creates and always overwrites
  4.1 5 - settings: ownership without takeover, and a shape the engine will not rewrite
  3.6 8 - add-config-key: idempotent, answered, and never guessed
  63.9 total

node scripts/ci/run-example-cycle.mjs
slowest sections:
  772.6 8 - the self-check, run on its own against the finished project
  0.8 2 - install into the seed project
  0.7 3 - build the bumped payload: the documented builder numbers examples/example-project/bump/ against it
  0.6 7 - apply, answering the new config key - the only question an update asks
  0.5 1 - a payload copy and the seed project, both inside the work directory
  776.0 total

node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .
slowest sections:
  199.2 WRAPPERS (bash channel) CONTROLS - each of those assertions is proven able to FAIL
  144.9 REVIEW AND QA WRAPPERS - the output contract: stdout exactly the -o file, the stderr lines in their order, one log per run outside the project (both channels, recording stubs)
  110.0 WRAPPERS (PowerShell channel) RESUME CONTROLS - each of those assertions is proven able to FAIL
  57.5 WRAPPERS (bash channel) - locked flags, stdin / brief-file delivery, LF + ASCII bytes, executed transport
  53.7 EXAMPLE FIXTURE CONTROLS - each of those assertions is proven able to FAIL
  775.0 total
```

Fact-check gate: one `sonnet` Explore scan over `git diff 31314c9`, `CLAIMS: total=24 verified=21 false=3
unverifiable=0`; the three fixed before the pass.

Auditor: pass 1, Codex gpt-6-sol / xhigh, cold, on the ticket's word "добре, пускай" - `fail`, one blocker
in the COO's prose (`dev/VERIFY_RUNBOOK.md:33`), one note; tokens used 73,355 (wrapper stderr). Correction
round 1 prose-only, so no verification pass (`ticket.md` § Loop shape); verified by the COO first-hand (§ Diff
review). Brief and verdict verbatim: `SUITES-001-review-brief.md`.

## Remaining debt

None. Out-of-scope findings, on the operator's dialog answers: the macOS CI leg red in the setup suite ->
a line in ROADMAP § SETUP ("Ред в пътната карта"); `dev/README.md` § The payload is code still saying prose
changes are R2 through the Writer and a Reviewer -> fixed right after this close as R1 ("Поправи веднага").

## Diff review

Folded from `.aiwf/SUITES-001-diff-review.md`. The whole diff `git diff 31314c9` read (13 files: 7 Writer,
6 COO). Per acceptance criterion, the defect each proof sees: D-02 grep - a `--project-fixture` line without
`--scope project` in the two suites; D-02 cycle grep - a `--scope` on step 8 or its README copy; D-02 /
D-01 guard diffs - any byte under examples, the selfcheck README, `.github`, the example answers, the
spikes; D-04 clause grep - the old clause anywhere in the payload; D-04 count - the verdict losing its
pointer to the full check; D-01 greps and JSON check - the row, the linux line, "eight", the old tag
sentence, not seven rows or two different lists; D-03 log check - no block, more than five rows, no total,
the next line not the tally; S7 - the two suites' PASS lines and `[scope-S1]` (the child's last non-empty
line must be the tally, `aiwf-selfcheck.js:10043`); provenance. Reading notes: one tally print site per
driver, the block called right before it (self-check: after the observations, FAILURES still after the
tally); title consumers filter on `=== ` (`aiwf-selfcheck.js:10038`) or `=== GATE 1` (`test-update.mjs:2032`),
so an indented row cannot collide; the cycle's `bail()` exit-2 paths print no tally and so no block; W5
keeps `self-check: FAIL (exit N).`, `WERE written`, `nothing was rolled back`, `never reports that the write
failed`. Narrowed-test grep (`skip|only|todo` on added lines): prose hits only. The fact-check fixes and
correction round 1: see § Events; round 1 checked first-hand by `git diff -U0 -- dev/VERIFY_RUNBOOK.md`
and a grep of `before a tag|before the tag|tag is placed|after the CI run|release gate|release condition`
over the runbook, overrides and `dev/README.md` - only line 33 itself and overrides :174 ("Portion 2 is NOT
a release gate") remain, both consistent with the rule.

## Scratch

- `.aiwf/SUITES-001-diff-review.md` - folded into § Diff review and § Events above; deleted.
- `.aiwf/SUITES-001-review-brief.txt` - moved to `records/SUITES-001-review-brief.md` with the verdict; deleted.
- `.aiwf/last-review-session.SUITES-001.txt` - the session id `01a1b663-8939-7ec1-9e69-df268cc4fa39`,
  standing in `SUITES-001-review-brief.md`; deleted.
- `.aiwf/checkpoint.md` - live loop mechanics (overrides § Workspace paths), kept and rewritten.
- `.aiwf/route-state.json` - cleared to `{}` at the close, kept.

## Closing checklist

- the operator's own run on a real input: n/a - no product-visible outcome; the suites are this repository's
  own proof, run above;
- the diff review folded in above: yes;
- finding lines on the roadmap area entry: ROADMAP § SUITES - the POSIX-leg line and the verdict-clause line
  marked done; the "fast or fewer" line marked done for its `example-cycle-linux` half (the speed half is
  SUITES-002's);
- out-of-scope findings: two, both registered (§ Remaining debt);
- scratch files: each named above with its destination;
- the next ticket: SUITES-002 in a fresh Fable session (its COO line: check 1, a migration), on its own word.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 1 (prose only, from auditor pass 1) | 210,000 | `~/.claude/ctx/4c56aadb-30c6-457c-ac00-bc6c7badf96d.pct` 21 x `.size` 1,000,000 |
