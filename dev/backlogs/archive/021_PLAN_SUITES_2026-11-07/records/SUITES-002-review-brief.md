# SUITES-002 - review brief and verdict (pass 1)

Moved from `.aiwf/SUITES-002-review-brief.txt` at the ticket's close. Engine: Codex gpt-6-sol / xhigh, cold
(audit table row `review.code`, 1 pass; resolver line `class=code -> review.code: codex gpt-6-sol/xhigh, 1 pass`),
session `01a1b76a-69c2-7041-bcc1-7b3c97a6ba27`, tokens used 105,657 (wrapper stderr), log
`<temp>/pnp-codex/SUITES-002-code-20261107-210925-7452.log`.

## Brief (verbatim)

```text
COVERED BY: operator word "da", 2026-11-07
Review the diff for ticket SUITES-002 on branch main.

Class: code
Ticket: SUITES-002

SCOPE / DIFF:
The whole working diff against the scope guard: `git diff ab743fd` (7 modified files, nothing staged) plus the untracked directory `migrations/0039_selfcheck-jobs/` (ops.json, NOTES.md). The ticket contract is dev/backlogs/active/SUITES/tickets/SUITES-002.md (Outcome, Scope A1-A6 + P1 + R1-R2 for the Writer and R3-R5 for the COO, Acceptance, Risk threshold, Stop condition, Verify); the plan's shared sections are dev/backlogs/active/SUITES/PLAN_SUITES.md and dev/backlogs/active/SUITES/DECISIONS.md (D-05, D-06, D-07, D-08, D-09 apply). Writer files: scripts/selfcheck/aiwf-selfcheck.js, scripts/update/test-update.mjs, migrations/0039_selfcheck-jobs/ops.json, migrations/0039_selfcheck-jobs/NOTES.md, migrations/index.json, .claude-plugin/plugin.json. COO prose files: CHANGELOG.md (the 0.3.14 block), scripts/selfcheck/README.md (usage line + one paragraph), README.md (the status line and one sentence).

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it):
- A1: `--jobs` parsed right after SCOPE (aiwf-selfcheck.js ~:108-120: DEFAULT_JOBS, JOBS; regex `^[1-9][0-9]*$`; bail exit 2 naming --jobs); the usage comment :44 and the flag entry after --scope. The marker `AIWF_SELFCHECK_GROUP_CHILD` is read once and deleted from process.env at load (~:124-129); IS_GROUP_CHILD requires SCOPE full.
- A2: SECTION_TABLE (30 one-line entries `{ name, group, run }`, today's order, groups per the ticket's A2 table), TABLE_BY_NAME, GROUP_COUNT, dealGroups(n) - after runProjectScope (~:10136-10190). `--jobs 1` iterates the table in-process (main: `children === 1`). runProjectScope and its call untouched.
- A3/A4: child side readChildMarker / markChildStarted / runGroupChild (~:10199-10296): console.log swapped for a per-entry buffer, document `{ crashed, headline, detail, sections: [{ name, title, text, ms, titles, results, notes, observations }] }` written in finally; parent side spawnGroupChild / runGroupChildren (~:10299-10405): one stderr line per child before the spawn, children spawned with `--plugin-root PLUGIN_ROOT --project-fixture PROJECT --scope full`, documents under the parent's tmpRoot, child scratch dirs created and removed by the parent, merged arrays rebuilt in canonical order, one `(uncaught)` section per crashed/dead/incomplete child, `crashed` feeding the untouched INCOMPLETE RUN / tally / FAILURES / exitCode block. main() is async; `main();` stays the last statement.
- A5: printSlowestSections(childRows) (~:157-166), call site before the tally unchanged.
- A6: `const psFindings = psResumeFindings(PLUGIN_ROOT, { execProbes: true ... })` at the first pass (~:3519) and the uncovered-id enumeration reading it (~:3544); the pristine pass `psResumeFindings(psBase, ...)` (~:3525) stays. Literal counts: 1 and 1.
- P1: test-update.mjs section 19 (after section 18's last case, ~:2115-2213): cases (a) three refusals, (b) throw planted at GROUP_CHILD_TRY_SITE = '    markChildStarted();' with --jobs 2, (c) process.exit(3) planted before GROUP_CHILD_ENTRY_SITE = '  const childPlan = readChildMarker();', (d)/(e) marked children spawned by hand against copyTree(upgraded, ...) with sha256 tree diffs before/after. Each site literal occurs exactly once in the engine.
- R1/R2: migrations/0039_selfcheck-jobs/ops.json (one `note`, id selfcheck-jobs-0-3-14, 7 docRefs, no rerender op), NOTES.md on 0038's shape; migrations/index.json last entry `0039_selfcheck-jobs` -> 0.3.14; .claude-plugin/plugin.json 0.3.14.
- R3-R5 (COO): CHANGELOG.md `## [0.3.14] - 2026-11-07` block (Added 2 entries, Changed 4, last line `Retires local rules: none`, directly above `## [0.3.13]`); scripts/selfcheck/README.md usage line gains `[--jobs <n>]` plus one paragraph; README.md `v0.3.14` and one sentence in the self-check bullet.
- COO's local Verify run (Portion 1, one parallel batch, logs outside the repo), all exit 0: validate-payload (`valid: 39 migration(s)`, payload version 0.3.14), setup-suite (`checks: 481, failures: 0`, SETUP SUITE: PASS), update-suite (`checks: 473, failures: 0` - 16 more than before, the section-19 rows all PASS, UPDATE SUITE: PASS), example-cycle-windows (`checks: 43, failures: 0`, EXAMPLE CYCLE: PASS), selfcheck CI form default `--jobs` (`==== 1762/1762 assertions passed ====`, 4 child stderr lines exactly as the ticket's table); then `--jobs 1` alone (`==== 1762/1762 ====`, 0 child lines). Batch wall clock 401.1 s; the default self-check 400.2 s against 602.3 s for --jobs 1. The two stdouts: identical `=== ` title sequences; the whole text identical after normalising run-specific names - the ticket's normaliser covered only `pnp-*-XXXXXX`, and the remaining differences were other mkdtemp suffixes (`ps-exec-run-`, `sh-exec-`, `codex-`, `danger-full-`, `cap-`) and the timestamp-pid log names `<stem>-YYYYMMDD-HHMMSS-<pid>.log`; with those normalised too: SAME, 2046 lines each. Third run, fixture form against a copy of this repository's project layer outside the repo: 14 files hashed before/after, SAME; `=== ` titles identical to SUITES-001's selfcheck log; exit 1 on the two known runbook fingerprints (the version-stamp row before the self-install apply; the root-bound owned ask rules on a copied tree) - not asserted by the ticket. Fact-check gate (sonnet): 57 claims, 53 verified, 3 false (the "every suite prints slowest sections" wording in ops.json/NOTES.md/CHANGELOG - the spikes print none; a stale "LAST:" comment at test-update.mjs:1973), 1 unverifiable (a SECTION_TABLE comment clause) - all four fixed before this pass. Narrowed-test grep over added lines: 9 hits, all prose ("only", "skip" in comments/titles), no `.skip`/`.only`.
- Writer deviation accepted: `--scope project --project-fixture . --jobs 3` exited 1 on the version-stamp row (installed 0.3.13 vs payload 0.3.14), the known pre-apply effect; the flag was accepted and no child line printed.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: Blocks: any change in what the report prints after the sections or in the header; a tally line other than the last line of a green run; a consumer of the tally line (PLAN_SUITES.md closing grep S7) no longer matching; the default and the --jobs 1 run differing in result names or tally; a section dropped, run twice, or run outside its group's constraint (sectionExampleFixture with sectionNegativeControls; the four PROJECT readers together; sectionWrappers and sectionShWrappers apart; sectionBashHost first in group 1); a child writing to the parent's stdout, writing or removing the fixture, or spawning groups; a child's stderr line missing or naming sections other than its slot's; a byte of the --project-fixture tree changed by a run; a P1 case that runs a full self-check; a crash or a dead child that leaves exit 0 or no (uncaught) row; the project scope's code path or output changed; a third PowerShell exec pass left, or the pristine pass removed; a re-render op or an op outside the vocabulary; a shipped migration's text changed; index.json not monotonic or its last entry not the payload version; a time bound written as acceptance (D-07); a race or a lost-output path in the async parent (a child's text or results not reaching the report, an unhandled rejection, exit before the report); a false factual statement in the COO's CHANGELOG/README prose. Notes only: the env variable names, the result document's shape, the slug, wording.
STOP CONDITION: stop once every changed file is reviewed against the ticket's Acceptance and Risk threshold and the consumers named above are checked; do not propose redesigns, do not re-run the suites (the COO's Verify evidence is above; you may run the engine's cheap argument checks), and do not review deferred items (DECISIONS § Deferred).
BUDGET TARGET: (the /pnp:review template's line, unchanged)

OUTPUT CONTRACT: (the /pnp:review template's single-round contract, unchanged; checklist path D:/promptandpray/.claude/aiwf-native/doctrine/review.md)
```

## Verdict (verbatim, the wrapper's stdout)

```text
pass

No findings. The changed files, migration, and named tally consumers meet the SUITES-002 review contract. Cheap `--jobs` argument and syntax checks passed. I did not rerun the suites, as requested; the post-commit self-install and CI remain outside this diff review.

Next action: return the pass to the COO for the commit gate.
```
