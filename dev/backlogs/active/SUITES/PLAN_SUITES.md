# PLAN_SUITES - the suites fast and honest
Tickets: 2 - ticket 1 is the four cuts whose effect the CI section timings make certain and that need no structural change (D-01, D-02, D-03, D-04); ticket 2 restructures the self-check's full run into parallel groups and carries the release (D-05, D-06, D-08)

The plan of the roadmap entry `SUITES` in `dev/backlogs/ROADMAP.md`. One folder: this index,
`DECISIONS.md` (D-01..D-09), `RESEARCH.md` (two scans and the CI timings of run 42263924346,
2026-11-07), `tickets/SUITES-NNN.md` (the frozen contract), `records/SUITES-NNN.md` (written at each
ticket's close).

## Goal

The VERIFY rows of this repository run in minutes, not an hour, and the POSIX proof is named where
it really is: the row `example-cycle-linux`, a Windows run with Linux answers, leaves
`verify.commands`, and the canon says the POSIX proof of a release is CI's ubuntu leg (D-01); three of the
four explicit full-scope self-check spawns inside the suites (test-setup's two, test-update's one)
take the project scope, since they assert only an exit code, while the cycle's step 8 keeps the full
run against its bumped payload copy (D-02); every suite prints its slowest
sections, so each before/after number reads off the suite's own output (D-03); the embedded
runner's FAIL verdict stops offering a host cause its scope cannot produce (D-04); the self-check's
full run executes its 30 full-scope sections in four groups fixed by name, dealt to `--jobs <n>`
children, with output, tally and fail direction unchanged (D-05), and stops repeating one PowerShell exec pass (D-06); the
wall time is measured, never promised (D-07); SUITES-001 lands on `main` unreleased and SUITES-002
carries the release 0.3.14 (D-08); each ticket's VERIFY is the union of the rows its diff can break
(D-09).

## Scope

In:
- SUITES-001 the cuts: the row removed from `verify.commands` and its generator source, the three
  full-scope spawns of test-setup and test-update given `--scope project` (the cycle's step 8 and its
  README copy unchanged), the per-section time print
  in four suites, the FAIL verdict text and its assertion (the Writer); the `dev/` texts that count
  the rows and the release-rule line of the runbook, the two skills' quote of the removed verdict
  clause (the COO, R1) - worklist W1-W6, C1-C4 in the ticket's `## Scope`.
- SUITES-002 the parallel full run and the release, ONE code commit (D-08): `--jobs`, the four named
  groups, the parent / child report, the reused PowerShell exec pass, their proof cases, migration
  `0039_<slug>` and the bump (the Writer); the changelog block, the selfcheck readme's usage line and
  the status page (the COO, before the Verify batch), then the timed self-install (the COO) -
  worklist A1-A6, P1, R1-R6.

Out: everything under DECISIONS § Deferred (parallel cases inside test-setup and test-update,
slimmer payload copies, the bash channel's `bf-idle` wait and the Git-bash host-start cost, a
`--only` filter, the macOS leg's red setup suite); any change to `.github/workflows/ci.yml`, to
`examples/example-project/answers-linux.json` or to the self-check's CI and example pins
(`scripts/selfcheck/aiwf-selfcheck.js:9309-9431`) (D-01); the spikes `scripts/spike/run-spikes.mjs`
(D-03); the project scope's section set `scripts/selfcheck/aiwf-selfcheck.js:10079-10083` (D-05);
any time bound as an acceptance criterion (D-07); the consumers - a consumer takes 0.3.14 through
`/plugin update` + `/pnp:update` in its own session.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| SUITES-001 | the cuts: one VERIFY row out, the suites' self-checks on the project scope, a per-section time print, an honest FAIL verdict | D-01 D-02 D-03 D-04 D-07 D-09 | open | - |
| SUITES-002 | the self-check's full run in parallel groups, one PowerShell exec pass less, release 0.3.14 | D-05 D-06 D-07 D-08 D-09 | open | - |

## Order and gates

Order 001 -> 002, sequential: both change `scripts/selfcheck/aiwf-selfcheck.js` and
`scripts/update/test-update.mjs`; 002's parent must aggregate the per-section times 001's
`section()` records (D-03, D-05); 002's release carries 001's payload changes to the consumers (D-08).

- **SUITES-001**: the operator's word for the ticket (the planning word is not it); the COO writes
  C1-C4 in the main session BEFORE the Verify batch starts (the example cycle asserts a byte-identical
  tree, `dev/VERIFY_RUNBOOK.md:18`); the Writer dispatched with `Ticket: SUITES-001` on its own line
  (Gate 2 silent, the ref is in an active plan), the scope guard `HEAD <hash>` at the dispatch; the
  COO runs the ticket's Verify rows ONCE in the background at the hand-back, beside the full diff
  read; review pass 1 of the audit table's code row (`/pnp:roles`) rides the ticket's word, any
  further pass takes its own word; the code commit through its native dialog (`Refs: SUITES-001`) and
  the COO's `dev/` + skills prose in a separate docs commit through its own dialog; the live copy
  refreshed after each commit (root `CLAUDE.md` § This repository is the plugin); the record
  `records/SUITES-001.md` with the LOCAL numbers of D-07 (the batch wall clock and the `slowest
  sections:` blocks of the Verify logs, each with its command). No version: the commit lands on
  `main` unreleased (D-08).
- **SUITES-002**: the operator's word; ONE Writer dispatch (`Ticket: SUITES-002` on its own line,
  the scope guard `HEAD <hash>` at the dispatch) writes A1-A6, the proof cases P1, R1 (migration
  `0039_<slug>`) and R2 (the bump) and hands back once; the COO writes R3-R5 in the main session
  BEFORE the Verify batch starts (`dev/VERIFY_RUNBOOK.md:18`); the COO runs the ticket's Verify rows
  ONCE in the background at the hand-back, beside the full diff read, then the `--jobs 1` half of the
  D-05 pair after that batch has finished; ONE review pass of the audit table's code row over the
  whole diff rides the ticket's word, any further pass takes its own word; ONE code commit through
  its native dialog carrying all of it (`Refs: SUITES-002`, the e6240f6 precedent, D-08); the live
  copy refreshed; the self-install `/pnp:update --apply` by the COO on the operator's word (R6), its
  embedded project-scope self-check the proof of the fixture form's project rows (D-09); the record
  (the LOCAL numbers of D-07) in its own docs commit through its dialog, the plan archived at once
  (guard (e)); then the tag word and the push word - the tag created locally on the record commit and
  pushed with `main` in one push, CI not waited for (`dev/PROJECT_OVERRIDES.md:50-54`).
- **The CI numbers (D-07)**: no record carries CI step seconds - for either ticket. The CI step
  seconds of the release's pushed commit (`gh run view <id> --json jobs`) land as ONE row in
  `dev/backlogs/readiness/SUITES/ledger.md`, with the command, written by the session that first
  sees that run finished - never from a run that has not finished.

## Closing greps

- S1 the row: `git grep -n -F "example-cycle-linux" -- . ":(exclude)dev/backlogs"` (git grep, not `rg`: `rg` skips the hidden `.claude/` without `--hidden`) -> 4 hits, all change: `.claude/aiwf-native/aiwf.config.json:197`, `dev/answers.json:28`, `dev/VERIFY_RUNBOOK.md:19`, `dev/PROJECT_OVERRIDES.md:151`. Exempt (history, or the entry that leaves the roadmap at archive): `dev/backlogs/ROADMAP.md:232-236`, `dev/backlogs/CANDIDATES.md:989,1343`, the plan's own files.
- S1b the linux line of the dev command list: `rg -n "answers-linux" dev/README.md dev/PROJECT_OVERRIDES.md dev/VERIFY_RUNBOOK.md README.md` -> 1 hit, changes: `dev/README.md:44`. The other `answers-linux` hits (`.github/workflows/ci.yml:100,148`, `scripts/selfcheck/aiwf-selfcheck.js:9309-9340`, `examples/example-project/README.md:15,30,132`, `scripts/ci/run-example-cycle.mjs:20-25`) stay by D-01.
- S2 the count "eight" as the number of rows: `rg -nw "eight" dev/PROJECT_OVERRIDES.md dev/VERIFY_RUNBOOK.md dev/README.md README.md scripts/ci/README.md` -> 4 hits, all change to seven: `dev/PROJECT_OVERRIDES.md:171`, `dev/VERIFY_RUNBOOK.md:10`, `:12`, `:19`. Exempt: `scripts/ci/README.md:5` "Eight steps" (the cycle's steps, not the rows; capitalised, not a hit of the -w grep).
- S3 the verdict clause: `rg -n -e "a host the checks need was missing or unusable" -e "could not prove part of the contract in this environment" --glob "!dev/backlogs/**" .` -> 5 hits in 4 files; all four files change: `scripts/selfcheck/run-selfcheck.mjs:111` (the verdict; its contract comment `:23-27` says the same), `scripts/setup/test-setup.mjs:1027-1028` (the assertion, with `:1026`), `skills/update/SKILL.md:107`, `skills/setup/SKILL.md:149` (the parenthetical quoting the clause goes). Not consumers, unchanged: `skills/update/SKILL.md:100`, `skills/setup/SKILL.md:142` and `CHANGELOG.md:23` ("a missing or unusable bash or PowerShell shows first at the first audit" stays true under the project scope; a shipped changelog block never changes); `run-selfcheck.mjs:26` sits inside the rewritten comment `:23-27`.
- S4 the full-scope self-check spawns inside the suites: `rg -n "project-fixture" scripts/setup/test-setup.mjs scripts/update/test-update.mjs scripts/ci/run-example-cycle.mjs scripts/ci/README.md examples/example-project/README.md` -> 6 hits; 3 change (`--scope project` added): `scripts/setup/test-setup.mjs:326`, `:1538`, `scripts/update/test-update.mjs:1960`; stay: `scripts/ci/run-example-cycle.mjs:63` and `examples/example-project/README.md:120` (the cycle's step 8 keeps the full scope, D-02; the self-check compares the two both ways, `aiwf-selfcheck.js:9345-9373`, and `scripts/selfcheck/README.md:69-71` describes it); exempt: `scripts/setup/test-setup.mjs:1006` (a comment).
- S5 the repeated PowerShell exec pass: `rg -n "psResumeFindings\(PLUGIN_ROOT, \{ execProbes: true" scripts/selfcheck/aiwf-selfcheck.js` -> 2 hits: `:3468` (stays), `:3492` (reuses the first pass's findings, D-06).
- S6 the section runners: `rg -n "^function section\w*\(" scripts/selfcheck/aiwf-selfcheck.js` -> 33 definitions (the helper `:112` + 32 section functions; 30 of them called from `main()` `:10130-10159`, `sectionProjectPlanNaming` `:1278` from `runProjectScope` `:10079-10083` only, `sectionCaptureHelper` `:6210` from inside another section); the suites' header helpers: `rg -n "^function section\(title\)" scripts/setup/test-setup.mjs scripts/update/test-update.mjs` -> `test-setup.mjs:70`, `test-update.mjs:89`; `rg -n "^function step\(title\)" scripts/ci/run-example-cycle.mjs` -> `:83`.
- S7 the tally line's consumers (must keep matching after D-03 and D-05): `rg -n "assertions passed" --glob "scripts/**" --glob "examples/**" --glob "skills/**" --glob "docs/**" --glob "templates/**" .` -> 11 hits: `scripts/update/test-update.mjs:1972,1975,2044,2048,2076`, `scripts/setup/test-setup.mjs:174,1013,1023`, `scripts/selfcheck/aiwf-selfcheck.js:9994,10353`, `scripts/spike/README.md:27` (prose). None changes; the acceptance of D-03/D-05 is that every one of them still matches.

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 340,000 tokens of COO context (start 100,000 = 10 % x 1,000,000; approval 440,000 = 44 % x 1,000,000; source: file `~/.claude/ctx/cd96e027-5eee-41cd-91d8-297fb94c2d03.pct` and `.size`, read at Step 1 and at the approval, 2026-11-07) | 930,073 tokens |

The parts of the cycle spend, one per line (source in brackets):

- research agent A, the suite code (sonnet): 198,498 [notification]
- research agent B, the contracts around the suites (sonnet): 106,637 [notification]
- measurement agent, the CI timings per section (sonnet): 84,947 [notification]
- the planner (writer type; the draft, the pre-pass revision, revision 1, revision 2 - one agent, resumed; the figure is its final cumulative total): 244,295 [notification]
- the runnability pre-pass (sonnet): 103,640 [notification]
- readiness pass 1 (Codex gpt-6-sol, cold): 117,873 [round header, round-1.md]
- readiness pass 2 (Codex gpt-6-sol, resumed): 192,056 cumulative over the session - the figure the engine printed, which INCLUDES pass 1's 117,873; the sum above counts the session once (192,056), not pass 1 twice [round header, round-2.md]

No part is estimated; every agent and every pass printed a figure.

## Roadmap entry

- Goal: the eight VERIFY rows run in minutes, not an hour, and a POSIX proof exists where the canon claims one
- Why: „the suites cost an hour" (CANDIDATES § The suites cost an hour); `example-cycle-linux` is a Windows run with Linux answers, not POSIX proof
