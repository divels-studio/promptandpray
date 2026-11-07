# SUITES-002 - the self-check's full run in parallel groups, one PowerShell exec pass less, release 0.3.14

## What landed

- `eb5da90` (the Writer, on the operator's commit dialog - the operator's dialog answer „Да, кликнах Yes"; `Refs: SUITES-002`) - ONE code commit (D-08), 9 files, 554 insertions, 48 deletions:
  - A1 (D-05) `scripts/selfcheck/aiwf-selfcheck.js`: `--jobs <n>` parsed right after `--scope` (`DEFAULT_JOBS` = `max(1, min(4, availableParallelism - 1))`, `JOBS`; `0`, a negative or non-integer value or a bare flag -> `bail()` exit 2 naming `--jobs`); the usage comment and the flag list gain the flag.
  - A2 (D-05) one canonical `SECTION_TABLE` of 30 `{ name, group, run }` entries replaces the 30 calls in `main()`; `dealGroups(n)` deals whole groups round-robin; `--jobs 1` iterates the table in-process; `runProjectScope` untouched.
  - A3 (D-05) the group child (`readChildMarker`, `markChildStarted`, `runGroupChild`): the env marker `AIWF_SELFCHECK_GROUP_CHILD` (JSON: sections, selfAuthored, scratch, out) read once and deleted from `process.env` at load; `console.log` buffered per table entry; one JSON document per child (`crashed`, `headline`, `detail`, `sections[]` with `name`, `title`, `text`, `ms`, `titles[]`, `results`, `notes`, `observations`); an unknown or repeated section name is a FAIL in a `(dealing)` section. The parent (`spawnGroupChild`, `runGroupChildren`, `main()` now async): one stderr line per child before the spawn, children spawned with `--plugin-root --project-fixture --scope full`, both streams piped, documents under the parent's `tmpRoot`, child scratch dirs created and removed by the parent, the sections' text and the `results`/`notes`/`observations` rebuilt in canonical order, the report block after the sections unchanged.
  - A4 (D-05) one `(uncaught)` section per child that crashed, could not start, exited without a document or without one of its sections, or exited other than 0/1 - a failing `check` naming the headline and the sections that never ran, the child's stderr tail as detail; `crashed` -> `---- INCOMPLETE RUN ----`, exit 1.
  - A5 (D-03) `printSlowestSections(childRows)` takes the children's per-title seconds; the total stays the parent's `process.uptime()`.
  - A6 (D-06) `sectionWrappers`: the first pass's findings kept in `psFindings`; the uncovered-id enumeration reads it; the third `psResumeFindings(PLUGIN_ROOT, { execProbes: true ... })` call gone; the pristine control pass stays.
  - P1 (D-05) `scripts/update/test-update.mjs` section 19 (16 checks, after section 18): (a) `--jobs 0`, `--jobs x`, a bare `--jobs` exit 2 naming the flag; (b) a throw planted at `GROUP_CHILD_TRY_SITE` (`    markChildStarted();`) with `--jobs 2`: exit 1, two `[(uncaught)]` FAILURES rows, the message, `INCOMPLETE RUN`, the tally; (c) `process.exit(3)` planted before `GROUP_CHILD_ENTRY_SITE` (`  const childPlan = readChildMarker();`): exit 1, the `(uncaught)` detail naming exit code 3 for each child; (d)/(e) marked children spawned by hand against a copy of section 2's `upgraded` project - one with `sectionHookWiring` and `--jobs 4` (document holds exactly it, no child stderr line, empty stdout), one with the three PROJECT readers (document holds exactly those three) - every file of the copy sha256-hashed before and after each: no difference. `node:crypto` imported; the header comment lists 19 and drops "LAST" from 18.
  - R1 (D-08) `migrations/0039_selfcheck-jobs/ops.json` (one `note`, id `selfcheck-jobs-0-3-14`, 7 `docRefs`, no re-render op) and `NOTES.md`; `migrations/index.json` gains `0039_selfcheck-jobs` -> `0.3.14`.
  - R2 (D-08) `.claude-plugin/plugin.json` `0.3.14`.
  - R3-R5 (the COO, R1 prose, written before the dispatch and riding the code commit by D-08): `CHANGELOG.md` `## [0.3.14] - 2026-11-07` (Added: the `--jobs` run, the four suites' slowest-sections print; Changed: the suites' project-scope spawns, the FAIL verdict wording, one PowerShell pass less, the migration line; `Retires local rules: none`); `scripts/selfcheck/README.md` usage line `[--jobs <n>]` and one paragraph; `README.md` § Status `v0.3.14` and one sentence in the self-check bullet.
- The self-install (R6, operator dialog answer „Да, пускай apply"): `node D:/pnp-live/scripts/update/aiwf-update.mjs --dry-run --project-root D:/promptandpray` then `--apply` - `updated: 0.3.13 -> 0.3.14, 1 operation(s) applied.`, `self-check: PASS - ==== 31/31 assertions passed ==== (project layer only - run `/pnp:selfcheck` for the full check)`; the diff: `.claude/aiwf-native/aiwf.config.json` 2 lines (`installedPluginVersion` 0.3.14, `lastMigrationApplied` 0039_selfcheck-jobs). It rides this record's docs commit.
- The docs commit carrying this record: this file, `SUITES-002-review-brief.md`, the index row closed, the plan archived as `archive/021_PLAN_SUITES_2026-11-07/` (guard (e)), `readiness/SUITES/ledger.md` created (the plan's passes; the CI row lands after the push, D-07), ROADMAP § SUITES out (its last plan archived) and the § SETUP pointer moved to the archive path, the ledger's SUITES line rewritten, the config stamps of the apply.

## Decisions and deviations

- R3-R5 were written BEFORE the Writer's dispatch (the SUITES-001 precedent: Gate 3 blocks `scripts/selfcheck/README.md` once the route state names R2); the CHANGELOG names the migration slug the COO fixed in the brief (`0039_selfcheck-jobs`, the ticket left the slug open).
- The marker is honoured only in the full scope and is deleted from `process.env` at load (the Writer's choice, accepted): a grandchild - SCOPE CONTROLS' own project-scope child, every spawned host - cannot inherit it.
- The child's output buffer is switched per table entry by the child runner, not inside `section()` (the Writer's deviation, accepted): DRAFTS OBSERVATIONS swaps `console.log` itself and calls `sectionProjectLayer` inside its capture, so a swap inside `section()` would have broken it.
- The P1 block stands after section 18's last case (the stale-`$schema` case), not right after the crash cases the ticket named: a header between them would have moved that case under section 19.
- A child exiting with a code other than 0 or 1, or whose document lacks one of its sections, is also an `(uncaught)` block (the Writer's addition, accepted - a quieter failure than a crash is still a failure).
- The brief's expectation that `--scope project --project-fixture . --jobs 3` exits 0 was the brief's error: it exited 1 on the version-stamp row (installed 0.3.13 vs payload 0.3.14 - `dev/VERIFY_RUNBOOK.md` :22-29); the flag was accepted and no child line printed, which was the point.
- `--jobs` is validated under the project scope too (a bad value exits 2 there as well) - stricter than the ticket's "accepted and without effect", and the ticket's exit-2 rule carries no scope qualifier.
- Two acceptance rows of the ticket did not hold as written, the code did: (1) the D-06 row expected SUITES-001's selfcheck log to hold a `no negative control for PowerShell resume check` line that the new log lacks - both logs hold none (every resume check already had a control), so D-06 is proven by the source counts (1 and 1) and by the pair's identical output; its effect is time only. (2) The D-05/D-07 SAME row's normaliser covered `pnp-*-XXXXXX` and the slowest rows only; 109 lines still differed, all run-specific names - other mkdtemp suffixes (`ps-exec-run-`, `sh-exec-`, `codex-`, `danger-full-`, `cap-`) and the wrappers' log names `<stem>-YYYYMMDD-HHMMSS-<pid>.log`; with those normalised too the two stdouts are identical (2046 lines each). Both recorded as brief defects, not code defects.
- The fact-check gate's three code-class fixes (comments and the migration's prose) went to the live Writer as a micro-round after every Verify run had finished (overrides § Test policy: no edits while a suite runs); comment/prose bytes only, `node --check` and `validate-payload` green after them, no second batch.

## Events

| 2026-11-07 | `ticket.md` § fact-check gate | catch | 57 claims, 3 false (the "every suite prints `slowest sections:`" wording in `ops.json`, `NOTES.md` and the COO's CHANGELOG title - the spikes print none; the stale `LAST:` comment at `test-update.mjs:1973`) and 1 unverifiable (a SECTION_TABLE comment clause) - all fixed before pass 1 (`SUITES-002-review-brief.md`, this record § Diff review) |
| 2026-11-07 | habit guard (`git -C`) | catch | the COO's own `git -C D:\pnp-live rev-parse` to read the live copy's HEAD after the refresh was denied by the habit guard; the refresh itself ran in the gated-free `Start-Process` form and its output named the new HEAD |

## Verification (what actually ran)

COO, Windows Portion 1, once, in parallel (`Start-Process` per row, logs outside the repository: session scratchpad `logs-suites002/`, script `verify-suites002.ps1`), started at the Writer's hand-back, beside the full diff read; then the `--jobs 1` half alone; then the fixture-copy run (`verify-suites002-fixture.sh`):

- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0, `valid: 39 migration(s) in D:\promptandpray, payload version 0.3.14`
- `node scripts/setup/test-setup.mjs` - exit 0, `checks: 481, failures: 0`, `SETUP SUITE: PASS`
- `node scripts/update/test-update.mjs` - exit 0, `checks: 473, failures: 0`, `UPDATE SUITE: PASS` (457 at SUITES-001 + the 16 section-19 rows, all `[PASS]`)
- `node scripts/ci/run-example-cycle.mjs` - exit 0, `checks: 43, failures: 0`, `EXAMPLE CYCLE: PASS`
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` (CI form, default `--jobs` = 4 children on `availableParallelism` 12) - exit 0, `==== 1762/1762 assertions passed ====`; stderr exactly the four child lines of the ticket's table
- batch wall clock 401.1 s (`verify-suites002.ps1`, Process ExitTime minus the batch start; SUITES-001's batch: 776.1 s)
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --jobs 1` - exit 0, `==== 1762/1762 assertions passed ====`, 0 child lines, 602.3 s
- the pair's stdouts: `=== ` title sequences identical; whole text identical after normalising the run-specific names (the ticket's normaliser plus `<prefix>-XXXXXX` mkdtemp names and `-YYYYMMDD-HHMMSS-<pid>.log`) - `SAME`, 2046 lines each
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture "$LOGS/fixture-copy"` (a copy of `.claude/`, `CLAUDE.md`, `AGENTS.md`, `.gitignore` outside the repository) - exit 1, not asserted: FAILURES = the version-stamp row and the root-bound owned-ask-rules row, the two fingerprints of `dev/VERIFY_RUNBOOK.md` :22-29 and :64-66; `==== 1754/1760 ====`; 4 child lines; the 14 files hashed before and after (sha256, relative path) - `fixture hashes: SAME`; `=== ` titles identical to SUITES-001's selfcheck log; 306 s
- every suite `.err` 0 bytes; the two self-check `.err` files hold exactly the four child lines; `[FAIL]` count 0 in every green log

Acceptance rows at the hand-back (the Writer, literal, exit codes reported): `node --check` on both scripts 0; `--jobs 0` / `--jobs x` / bare `--jobs` each exit 2 with `aiwf-selfcheck: --jobs takes a whole number of 1 or more, got ...`; `sectionCommitAutomation(projectRoot);` count 1; `^function section` definitions 33; table entries 30 and `TABLE OK`; `psResumeFindings(PLUGIN_ROOT, { execProbes: true` 1, `psResumeFindings(psBase, { execProbes: true` 1; plugin.json / index.json / ops.json / CHANGELOG release greps as the ticket; the guard diff over `.github examples scripts/ci scripts/setup scripts/selfcheck/run-selfcheck.mjs dev/PROJECT_OVERRIDES.md` empty; the provenance and origin-name greps empty; `validate-payload` exit 0. P1 red/green by the Writer's hand-run engine spawns on a scratch payload copy (`p1-cases.mjs` in the session scratchpad): every case red under a planted fault (a refusal that stops naming `--jobs`; a parent ignoring crashed documents / missing documents; a child leaking to stdout or running its list twice; a child writing into the project), then green.

The LOCAL numbers (D-07), read off the Verify logs, each with its command:

```text
node scripts/setup/test-setup.mjs
slowest sections:
  11.6 24 - the transfer surface: seeded once at the resolved path, never managed, never rewritten
  4.0 18 - setup overwrites: a pre-existing file is replaced and named, the additions block is carried
  3.3 22 - the audit table: a fresh install gets it without being asked, and /pnp:roles rolls it over
  3.1 24b - the roadmap: seeded once at <plansDir>/ROADMAP.md, never managed, never rewritten
  3.0 1 - fresh install, self-check green, memory seeds printed
  48.0 total

node scripts/update/test-update.mjs
slowest sections:
  28.4 7 - a malformed payload blocks the runner AND a fresh setup, with zero writes
  15.6 19 - the self-check's group children: a bad --jobs exits 2, a dead child is a counted crash, a child runs only its own sections and leaves the project untouched
  10.9 18 - the self-check is the update's own last step, and a red one is never exit 0
  10.1 15 - createIfAbsent: accepted, and nothing it would change - a render always creates and always overwrites
  7.8 5 - settings: ownership without takeover, and a shape the engine will not rewrite
  124.1 total

node scripts/ci/run-example-cycle.mjs
slowest sections:
  396.1 8 - the self-check, run on its own against the finished project
  1.3 2 - install into the seed project
  1.0 3 - build the bumped payload: the documented builder numbers examples/example-project/bump/ against it
  0.8 7 - apply, answering the new config key - the only question an update asks
  0.5 1 - a payload copy and the seed project, both inside the work directory
  401.0 total

node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .   (default --jobs, 4 children, beside the other four rows of the batch)
slowest sections:
  252.9 WRAPPERS (bash channel) CONTROLS - each of those assertions is proven able to FAIL
  186.5 REVIEW AND QA WRAPPERS - the output contract: stdout exactly the -o file, the stderr lines in their order, one log per run outside the project (both channels, recording stubs)
  146.6 WRAPPERS (PowerShell channel) RESUME CONTROLS - each of those assertions is proven able to FAIL
  123.2 WRAPPERS (bash channel) - locked flags, stdin / brief-file delivery, LF + ASCII bytes, executed transport
  90.0 EXAMPLE FIXTURE CONTROLS - each of those assertions is proven able to FAIL
  400.1 total

node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --jobs 1   (alone)
slowest sections:
  171.3 WRAPPERS (bash channel) CONTROLS - each of those assertions is proven able to FAIL
  103.8 REVIEW AND QA WRAPPERS - the output contract: stdout exactly the -o file, the stderr lines in their order, one log per run outside the project (both channels, recording stubs)
  70.4 WRAPPERS (PowerShell channel) RESUME CONTROLS - each of those assertions is proven able to FAIL
  46.2 WRAPPERS (bash channel) - locked flags, stdin / brief-file delivery, LF + ASCII bytes, executed transport
  40.0 EXAMPLE FIXTURE CONTROLS - each of those assertions is proven able to FAIL
  602.3 total

node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture <copy outside the repo>   (default --jobs, alone)
slowest sections:
  213.6 WRAPPERS (bash channel) CONTROLS - each of those assertions is proven able to FAIL
  143.4 REVIEW AND QA WRAPPERS - the output contract: stdout exactly the -o file, the stderr lines in their order, one log per run outside the project (both channels, recording stubs)
  99.3 WRAPPERS (PowerShell channel) RESUME CONTROLS - each of those assertions is proven able to FAIL
  68.8 WRAPPERS (bash channel) - locked flags, stdin / brief-file delivery, LF + ASCII bytes, executed transport
  61.8 EXAMPLE FIXTURE CONTROLS - each of those assertions is proven able to FAIL
  306.3 total
```

The per-section seconds of a parallel run are wall seconds of a child running beside three others (and, in the batch, beside four other suites), so a section reads slower than in the serial run while the whole run reads faster; no arithmetic over them is a measurement.

Fact-check gate: one `sonnet` Explore scan over the diff's prose (Class code, cross-reference claims), `CLAIMS: total=57 verified=53 false=3 unverifiable=1`; the four fixed before the pass (§ Events). A second `sonnet` scan answered the Writer's hand-back question: no `fs` write in the engine targets `PLUGIN_ROOT`; the only root-rooted paths in a spawn's argv are the example-cycle guard probes inside `exampleFixtureFindings` (group 4); the module-level `let`s are `currentSection` (per process) and `exampleProbe` (group 4 helpers only) - the D-05 grouping holds.

Auditor: pass 1, Codex gpt-6-sol / xhigh, cold, on the ticket's word „da" - `pass`, no findings ("The changed files, migration, and named tally consumers meet the SUITES-002 review contract. Cheap `--jobs` argument and syntax checks passed."); tokens used 105,657 (wrapper stderr), session `01a1b76a-69c2-7041-bcc1-7b3c97a6ba27`. Correction rounds: 0. Brief and verdict verbatim: `SUITES-002-review-brief.md`.

## Remaining debt

None. The CI step seconds of the pushed commit are owed to `readiness/SUITES/ledger.md` by the session that first sees that run finished (D-07) - a scheduled write, not a debt. Deferred items stay in DECISIONS § Deferred (the archive).

## Diff review

Folded from `.aiwf/SUITES-002-diff-review.md`. The whole diff `git diff ab743fd` plus the untracked `migrations/0039_selfcheck-jobs/` read (8 files: 5 Writer, 3 COO). Per acceptance criterion, the defect each proof sees: D-05 flag - a value accepted silently or `bail()` not reached before the plugin check; project scope untouched - `runProjectScope` edited or duplicated; S6 - a section function added or removed; the canonical table - an entry missing/extra, out of today's order, in the wrong group, or `run` calling another function; D-06 - the third pass left or the pristine pass removed; the release rows - a bump without its migration, a re-render op, a shipped block changed; the guard diffs - scope creep; provenance - a Cyrillic byte or an origin name; the Verify logs - a red row, `INCOMPLETE RUN`, a differing stdout or title sequence, a wrong or missing child line, a changed fixture byte, a missing PASS line or a red section-19 row. Reading notes: the marker deleted at load and `IS_GROUP_CHILD` tied to the full scope, the parent passing `--scope full` explicitly; the child's buffer restored in `finally` and the document written there; per-entry slicing of `results`/`notes`/`observations`/`sectionStarts` by index range (an entry setting several titles - WRAPPERS - owns each with its own seconds); the child's exit 1 on any red result treated as a clean exit by the parent (0 and 1); a section printing through `process.stdout.write` would be lost from the report - the pair's SAME result is the proof none does; the parent's documents under its own `tmpRoot`, child scratch dirs removed in `main()`'s `finally`; entries outside a slot (the `(dealing)` refusal) emitted after the canonical ones; P1's identifiers all module-level in test-update (`upgraded` :333, `copyTree` :117, `readJson` :112, `at` :114, `tmpRoot` :71, `P020` :293, `makePayload` :266, `FIXTURE_NOTE` :216, `why` :108). Narrowed-test grep (`skip|only|todo` on the added lines of the two scripts): 9 hits, every one prose ("The full scope only", "never a skip", "runs only its own sections", "the rest skip it through the same flag" ...), no `.skip`, `.only` or `todo` marker - nothing narrowed.

## Scratch

- `.aiwf/SUITES-002-diff-review.md` - folded into § Diff review, § Verification and § Events above; deleted.
- `.aiwf/SUITES-002-review-brief.txt` - moved to `records/SUITES-002-review-brief.md` with the verdict; deleted.
- `.aiwf/last-review-session.SUITES-002.txt` - the session id `01a1b76a-69c2-7041-bcc1-7b3c97a6ba27`, standing in `SUITES-002-review-brief.md`; deleted.
- `.aiwf/checkpoint.md` - live loop mechanics (overrides § Workspace paths), kept and rewritten.
- `.aiwf/route-state.json` - cleared to `{}` at the close, kept.
- The session scratchpad outside the repository (`logs-suites002/`, the two verify scripts, `writer-suites002/`, the diff patches, the fact-check diff) is not covered; its numbers stand above.

## Closing checklist

- the operator's own run on a real input: n/a - no product-visible outcome; the suites are this repository's own proof, run above, and the self-install apply ran on the operator's dialog answer;
- the diff review folded in above: yes;
- finding lines on the roadmap area entry: § SUITES leaves the roadmap whole with the archiving of its last plan (the fourth and fifth writes end with it; the "suites fast" and "fast or fewer" lines are closed by `eb5da90`);
- out-of-scope findings: none new;
- scratch files: each named above with its destination;
- the next ticket: none in this plan - the plan is archived; the release's tag and push take the operator's two words in this session; the CI row of D-07 goes to the session that first sees the run finished.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 | 320,000 | `~/.claude/ctx/11a1491c-a17e-4480-9790-6c3141cbcbcf.pct` 32 x `.size` 1,000,000, read at this record's write |
