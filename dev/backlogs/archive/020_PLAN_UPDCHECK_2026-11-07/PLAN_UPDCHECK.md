# PLAN_UPDCHECK - the self-check an update runs proves the project it wrote, and stays fast as the payload grows
Tickets: 2 - the engine change (the `--scope` flag, the one embedded spawn passing it, its controls and the suites' adjustments) is one code commit through the Writer; the release (the skills' prose, the `note` migration, the bump, the CHANGELOG block, the self-install apply with the before/after time) is a second commit that depends on it

The plan of the roadmap entry `UPDCHECK` in `dev/backlogs/ROADMAP.md`. One folder: this index,
`DECISIONS.md` (D-01..D-11), `RESEARCH.md` (two scans of 2026-11-06), `tickets/UPDCHECK-NNN.md` (the
frozen contract), `records/UPDCHECK-NNN.md` (written at each ticket's close).

## Goal

`/pnp:update --apply` in a consumer project finishes its embedded self-check in a time that does not
grow with every release, while the payload's own invariants stay proven (in CI and in this
repository's development): the self-check engine gains one flag, `--scope project|full` (absent =
`full`, D-03); the one embedded spawn shared by setup, update and `/pnp:roles` passes `--scope project`
(D-05), which runs only the checks that read the real project and spawns no PowerShell or bash host
(D-01, D-04); the full run stays the default everywhere it runs today, negative controls included
(D-02); the narrowed run carries its own negative controls (D-07) and says what it proves in its PASS
line and in the skills (D-06); the wall time is measured before and after, never promised (D-09);
released as 0.3.13 with a `note` migration (D-10), under the existing prose-only release rule (D-11).

## Scope

In:
- UPDCHECK-001 the engine change: the flag, the lazy host discovery, the project-scope section set,
  the header and coverage text, the SCOPE CONTROLS section, the embedded argv and PASS line, and the
  update suite's adjustments - worklist A1-A6, B1, C1-C2 in the ticket's `## Scope`.
- UPDCHECK-002 the release 0.3.13: migration `0038` (one `note`) and the bump by the Writer; the three
  skills, the selfcheck readme, the root README, the changelog and the runbook line by the COO; the
  COO's timed self-install apply (D-09) - worklist R1-R8 in the ticket's `## Scope`.

Out: everything under DECISIONS § Deferred (speeding up the slow payload sections, a per-section time
print, a static-checks-only scope); removing or retiring any section (D-08); any change to the CI
argv (`.github/workflows/ci.yml:61`, `:103`, `:151`) or to this repository's `selfcheck` VERIFY row
(`.claude/aiwf-native/aiwf.config.json:203`) (D-02, D-03); the text of `dev/PROJECT_OVERRIDES.md`
§ Test policy (D-11); the dev suites' own speed (ROADMAP § SUITES); the consumers - a consumer takes
0.3.13 through `/plugin update` + `/pnp:update` in its own session.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| UPDCHECK-001 | the self-check engine gains a `--scope` flag; the embedded run takes the project scope | D-01 D-02 D-03 D-04 D-05 D-06 D-07 D-08 | closed 9347fd9 | `records/UPDCHECK-001.md` |
| UPDCHECK-002 | release 0.3.13: the skills' prose, migration 0038, the bump, the changelog, the timed self-install | D-06 D-09 D-10 D-11 | closed e6240f6 | `records/UPDCHECK-002.md` |

## Order and gates

Order 001 -> 002, sequential: 002's prose describes the flag and the PASS line 001 ships, and its
self-install apply is the first run of the project scope through `/pnp:update --apply`.

- **UPDCHECK-001**: the operator's word for the ticket (the planning word is not it); the Writer
  dispatched with `Ticket: UPDCHECK-001` on its own line (Gate 2 silent, the ref is in an active plan);
  the scope guard `HEAD <hash>` at the dispatch; the COO runs the ticket's Verify rows ONCE in the
  background at the hand-back, beside the full diff read; review pass 1 of the audit table's code row
  (`/pnp:roles`) rides the ticket's word, any further pass takes its own word; the code commit through
  its native dialog (`Refs: UPDCHECK-001`); the live copy refreshed after the commit (root `CLAUDE.md`
  § This repository is the plugin); the record `records/UPDCHECK-001.md`.
- **UPDCHECK-002**: the operator's word; the Writer (`Ticket: UPDCHECK-002`) writes the code part only -
  R6 (migration `0038`: `ops.json`, `NOTES.md`, `migrations/index.json`) and the
  `.claude-plugin/plugin.json` bump of R7 - and hands back; then the COO writes the prose in the main
  session (overrides § Hard rules, "Prose in the payload is R1"): R1-R5, the `CHANGELOG.md` block of
  R7, R8; review pass 1 of the audit table's row for the diff's class on that word; ONE release
  commit by the COO through its dialog, the Writer's part and the COO's together; the live
  copy refreshed; the self-install `/pnp:update --apply` by the COO on the operator's word, timed, its
  embedded project-scope self-check the release's proof (D-09, D-11); the record (with the before and
  after times and the command of each) and the close commit through its dialog, the plan archived at
  once (guard (e)); then the tag word and the push word - the tag created locally on the record commit
  and pushed with `main` in one push (overrides § Hard rules, release discipline); CI then runs the
  full self-check on three OSes (D-02, D-11).

## Closing greps

```text
set 1 - callers of the embedded self-check: grep -nE "finishWithSelfCheck\(|runSelfCheck\(" over the repo minus dev/ -> 8 hits:
  scripts/update/aiwf-update.mjs:132, scripts/setup/aiwf-roles.mjs:711, scripts/setup/interview.mjs:309,
  scripts/setup/generate.mjs:1480, scripts/selfcheck/run-selfcheck.mjs:55 (def runSelfCheck), :80 (def finishWithSelfCheck),
  :90 (the call), CHANGELOG.md:1064 (history prose, exempt); the spawn argv itself: scripts/selfcheck/run-selfcheck.mjs:60,
  its contract text :13-15; the call-site count pinned by scripts/setup/test-setup.mjs:1048-1105 (CALL_SITES = 5 at :1050)
set 2 - reads of the real project in the engine: grep -nw "PROJECT" scripts/selfcheck/aiwf-selfcheck.js -> 22 hits;
  the call sites that pass it: :9964 sectionPlanRefNaming(tmpRoot, PROJECT), :9983 sectionProjectLayer(PROJECT, selfAuthored),
  :9986 sectionCommitAutomation(PROJECT, tmpRoot); the rest are its definition and cleanup (:9937-9940, :10015), the header
  print (:9948), comments (:23, :865, :1271, :2398, :6686, :7039, :7495), section titles (:7478, :7497, :7675) and the
  COVERAGE prose (:10112, :10124, :10159)
set 3 - host discovery at module load: grep -nE "\b(PWSH|BASH)\b\s*=|findPwsh\(|findBash\(" scripts/selfcheck/aiwf-selfcheck.js
  -> :208 def findPwsh, :215 const PWSH = findPwsh(), :277 def findBash, :288 const BASH = findBash(), :322 comment, and
  findBash(...) test doubles at :476, :482, :487, :495; grep -cw "PWSH|BASH" -> 39 uses in the file (each a consumer of the
  two module-level constants)
set 4 - the PASS line: grep -n "self-check: PASS" over the repo minus dev/ -> 13 hits: examples/example-project/README.md:35,
  scripts/ci/run-example-cycle.mjs:478, :603, scripts/update/test-update.mjs:1970, :1972, :1982, :2087,
  skills/update/SKILL.md:91, skills/setup/SKILL.md:135, scripts/selfcheck/run-selfcheck.mjs:16, :99,
  scripts/setup/test-setup.mjs:172, :174, :975 - :1972 and test-setup.mjs:174 match /self-check: PASS - .*assertions passed/
set 5 - the tally line: grep -n "assertions passed" over the repo minus dev/ -> 9 hits: scripts/selfcheck/aiwf-selfcheck.js:10162
  (the print), scripts/update/test-update.mjs:1972, :2036, :2040, :2068, scripts/setup/test-setup.mjs:174, :1013, :1023
  (stub), scripts/spike/README.md:27 (unrelated prose, exempt)
set 6 - source-text coupling to main(): scripts/update/test-update.mjs:2026-2028 and :2056-2058 patch the literal
  "    sectionGate2(tmpRoot);" (aiwf-selfcheck.js:9962) to simulate a crash of the INTEGRATED self-check through
  `/pnp:update --apply` - under D-05 the integrated run takes the project scope, so a crash planted in sectionGate2 would no
  longer be reached on that path; the ticket names which project-scope line those two cases patch instead
set 7 - direct invocations of the engine: git grep -n "aiwf-selfcheck.js" -- scripts skills .github examples README.md docs templates -> 26 hits;
  invocations (all stay the FULL scope, argv unchanged, D-02): .github/workflows/ci.yml:61, :103, :151; skills/selfcheck/SKILL.md:29;
  examples/example-project/README.md:120 + scripts/ci/run-example-cycle.mjs:63 (DOCUMENTED_COMMANDS; run at :609 through CMD_SELFCHECK);
  scripts/update/test-update.mjs:1960 (direct full run); scripts/setup/test-setup.mjs:57 (const SELFCHECK, run at :1538);
  the embedded spawn scripts/selfcheck/run-selfcheck.mjs:60 (built from SELFCHECK_REL :43) -> the PROJECT scope (D-05);
  references, not invocations (exempt): scripts/update/test-update.mjs:1988, :1993, :2026, :2056 (set 6), scripts/setup/test-setup.mjs:58, :1005,
  scripts/update/aiwf-update.mjs:23, scripts/setup/interview.mjs:42, scripts/setup/generate.mjs:51, :751, scripts/setup/README.md:46,
  scripts/native/README.md:53, scripts/selfcheck/run-selfcheck.mjs:13, scripts/selfcheck/README.md:3, :37 (usage line, R4 of 002),
  scripts/selfcheck/aiwf-selfcheck.js:44 (usage comment, gains --scope in 001), :9344 (a path list)
  dev-side, outside the grep: .claude/aiwf-native/aiwf.config.json:203, dev/answers.json:29 (full, unchanged)
```

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 180,000 | 749,990 |

(1) approval number 250,000 (file: `~/.claude/ctx/<session>.pct` 25 x `.size` 1,000,000) minus start number 70,000 (file: `.pct` 7 x `.size` 1,000,000, read after the Step 0.5 doctrine read, before the roadmap entry). (2) the parts, as printed:

- research agent A (self-check internals, sonnet) - 199,021 - notification
- research agent B (callers, CI, docs, sonnet) - 70,483 - notification
- planner, first dispatch (writer type) - 129,161 - notification
- planner, revision 1 (the same agent resumed) - 159,166 - notification; whether this figure includes the first dispatch is not printed, so the sum may count that part twice
- runnability pre-pass (sonnet) - 53,754 - notification
- Codex readiness pass 1 (gpt-6-sol / xhigh, cold) - 138,405 - round header

## Roadmap entry

- Goal: `/pnp:update --apply` in a consumer project finishes its embedded self-check in a time that does not grow with every release, while the payload's own invariants stay proven (in CI and in this repository's development)
- Why: the operator, 2026-11-06, after the 0.3.12 apply: „със всяка изминала нова версия времето на селфчека се увеличава, беше около 2 мин, сега е над 10. никой няма дани чака след време половин час за аплай и селфчек, когато стигнем пета шеста версия"
