# UPDCHECK-002 - release 0.3.13: the skills' prose, migration 0038, the bump, the changelog, the timed self-install

## What landed

- `e6240f6` (the release commit, the COO's dialog; 11 files, +172/-38) - the Writer's part and the COO's prose together,
  as the ticket's § Scope assigned them:
  - Writer: `migrations/0038_selfcheck-scope/ops.json` (one `note`, id `selfcheck-scope-0-3-13`, seven docRefs, no
    re-render op - D-10), `migrations/0038_selfcheck-scope/NOTES.md` (0037's structure; Superseded local rules: none),
    `migrations/index.json` (the 0038 entry, `targetPluginVersion` 0.3.13, line 39), `.claude-plugin/plugin.json` 0.3.13.
  - COO prose (overrides § Hard rules, "Prose in the payload is R1"): `skills/update/SKILL.md` Step 4 and
    `skills/setup/SKILL.md` Step 4 (the embedded run is the project scope; what it proves and what it does not; the
    PASS suffix; a red in the project scope is the project layer inconsistent, never a missing host; the full check is
    `/pnp:selfcheck`); `skills/selfcheck/SKILL.md` (the two scopes in the intro; Step 1 keeps the full command and
    gains the `--scope` paragraph - D-02, D-03, D-05; Step 2: the full run proves the payload, the embedded run does
    not, SCOPE CONTROLS); `scripts/selfcheck/README.md` (the main sections of the full scope with COMMIT AUTOMATION
    CONTROLS, REVIEW AND QA WRAPPERS, CAPTURE HELPER and SCOPE CONTROLS, the project-scope set, the exit-2 rule,
    `run-selfcheck.mjs` passes `--scope project`, the usage line, where it runs); `README.md` (§ Status v0.3.13, the
    self-check bullet's two scopes, the consumer line "both on 0.3.11 when 0.3.13 was cut" - read in the two consumers'
    `aiwf.config.json` `installedPluginVersion` on this machine, the setup paragraph); `CHANGELOG.md` § [0.3.13]
    (Changed, UPDCHECK-001, `Retires local rules: none`); `dev/VERIFY_RUNBOOK.md` § Portion 1 (the apply's embedded
    self-check proves the project scope of the fixture form).
- The close commit (this record's) carries the self-install: `.claude/aiwf-native/aiwf.config.json` stamped
  `installedPluginVersion` 0.3.13 / `lastMigrationApplied` `0038_selfcheck-scope` - the apply's only write (a `note`
  migration re-renders nothing). The live copy `D:\pnp-live` was refreshed to `e6240f6` after the release commit.

## Decisions and deviations

- **Route state cleared to `{}` for the COO's prose phase.** Gate 3 lets the main session write only `docs/**`,
  `.aiwf/**`, root `*.md` and the planning surfaces while `.aiwf/route-state.json` names an R2 route; the ticket's
  recorded actors and overrides § Hard rules assign `skills/**` and `scripts/selfcheck/README.md` to the COO. The
  Writer's part was complete and read before the clear; the state was written `{ticket, route: R2}` at the dispatch and
  `{}` at the hand-back, so the Writer's whole run stood under the guard. The record of the next release ticket of this
  shape should expect the same.
- Slug `0038_selfcheck-scope` - the COO's call (the ticket left it open).
- The Writer dropped one NOTES.md clause of its own - that SCOPE CONTROLS also proves the `--scope` refusal - because the
  UPDCHECK-001 record only hints at it; accepted (the record is the fact source of this ticket).
- The CHANGELOG's "two consumer projects both on 0.3.11 when 0.3.13 was cut" is the COO's reading of the two consumer
  configs on this machine (both `installedPluginVersion` 0.3.11), unverifiable from this tree.
- Correction round 1 (of cap 2), PROSE ONLY: the red bullets of `skills/update/SKILL.md` and `skills/setup/SKILL.md`
  Step 4 still named a missing bash or PowerShell host as a cause of a red embedded self-check (the auditor's one
  blocker). Rewritten: a red in the project scope means the project layer is inconsistent, the failing check is printed
  above the verdict by name, no host was probed; the verdict line's "could not prove ... in this environment" clause is
  the full run's. No verification pass (`ticket.md` § Loop shape: a prose-only round) - the COO's first-hand check of the
  delta against `run-selfcheck.mjs:108-113` and `aiwf-selfcheck.js:10112` recorded in § Diff review.

## Events

| 2026-11-07 | `ticket.md` § fact-check gate | catch | 110 cross-reference claims, 4 false (the README section list offered as complete; the PASS suffix quoted without its backticks in 0038 ops.json and NOTES.md; NOTES "the hosts" where only the PowerShell host line prints) - fixed before pass 1 (COO edit + Writer micro-round; § Verification) |
| 2026-11-07 | `ticket.md` § COO-authored text is reviewed like the Writer's | catch | the COO's Step 4 prose kept the runner's stale "missing host" cause under the project scope; auditor pass 1 `fail` on it; correction round 1 prose only (§ Decisions) |
| 2026-11-07 | `ORCHESTRATOR.md` § Commit & Push Authority ("one click buys one commit") | violation | the close commit's `git add` named the already-moved `active/UPDCHECK` path, failed, and the `;`-chained commit landed with only the staged renames (`a5d3db2`, 7 renames, 0 insertions); the record, the index row, the ledger, the roadmap and the config stamps needed a second close commit and a second click - the fix: `&&` between add and commit, paths checked against `git status` first |

## Verification (what actually ran)

COO, logs outside the repository (session scratchpad `validate-payload-002.log`, `self-install-0313.log`):

- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0, `valid: 38 migration(s) in D:\promptandpray, payload version 0.3.13` (once at the hand-back over the whole diff; the Writer ran it at HEAD before writing and again after its micro-round, exit 0 both).
- Acceptance greps (all on the Bash tool from the root): `"version": "0.3.13"` one hit `.claude-plugin/plugin.json:3`; `"targetPluginVersion": "0.3.13"` one hit `migrations/index.json:39`; `"op": "note"` in 0038 ops.json count `:1`; `"op": "rerender` no line; `## [0.3.13]` at `CHANGELOG.md:7`, `Retires local rules: none` at `:33`, `## [0.3.12]` at `:35`; "project layer only" 1 in each of the setup and update skills; `--scope` 3 in the selfcheck skill, 4 in `scripts/selfcheck/README.md`; `git diff 936dc0e7595220af9d3c6335a43e8d0d0d3b6123 -- examples scripts/ci .github dev/PROJECT_OVERRIDES.md` no output; Step 1's fenced block still the full argv (the ticket's node probe exit 0); consumer-name grep over the payload, README, CHANGELOG and the untracked 0038 no hit; the provenance grep (Cyrillic) over docs skills templates scripts schema hooks migrations examples README.md CHANGELOG.md no hit - run again after correction round 1, no hit.
- Fact-check gate (`/pnp:review` Step 2b, one `sonnet` Explore agent over the diff's prose): `CLAIMS: total=110 verified=103 false=4 unverifiable=3`; the 4 false fixed, the 3 unverifiable closed (the consumers' versions - the COO's own read; "measured in this release's record" x2 - reworded in both migration files to "measured, not promised: no time bound is part of the contract").
- Auditor: Codex code row, pass 1 cold (gpt-6-sol / xhigh, session `01a1b577-aca8-7202-9ff0-9f1cea6b6e1f`), covered by the operator word „пускай тикета" (2026-11-07): `fail`, one blocker (the host cause in the two Step 4 red bullets, `skills/update/SKILL.md:102-105`, `skills/setup/SKILL.md:144-147` at that tree), no notes; "the migration validates, contains one `note` and no re-render, and the version, scope, and full-run command checks pass". `codex-review: tokens used 90,474`. Closed by correction round 1 (prose) without a verification pass. The brief and the verdict: `UPDCHECK-002-review-brief.md`.
- **The self-install, on the operator's dialog word "Пускай (Препоръчвам)" (2026-11-07)**, plugin root `D:\pnp-live` at `e6240f6`:
  - `node D:/pnp-live/scripts/update/aiwf-update.mjs --check --project-root D:/promptandpray` - exit 1, `1 migration(s) pending - this project is at 0.3.12, the payload is 0.3.13`, `0038_selfcheck-scope (-> 0.3.13)`;
  - `... --dry-run ...` - exit 0, the 0.3.13 CHANGELOG block printed, `1 operation(s) planned. NOTHING was written.`, the note's text and seven docRefs;
  - `... --apply ...` - exit 0, `updated: 0.3.12 -> 0.3.13, 1 operation(s) applied.`, `self-check: PASS - ==== 31/31 assertions passed ==== (project layer only - run `/pnp:selfcheck` for the full check)`; after it `_aiwf.lastMigrationApplied` = `0038_selfcheck-scope`, `installedPluginVersion` 0.3.13 (`git diff -- .claude/aiwf-native/aiwf.config.json`: those two lines only).
- **D-09, the two wall times, each with its command:**
  - before - 701 s: `node <tree>/scripts/selfcheck/aiwf-selfcheck.js --plugin-root <tree> --project-fixture <tree>` at 0.3.12 HEAD, one sequential run, wall time from the run's first to last timestamped line, 2026-11-06, 1,755 assertions (ROADMAP § UPDCHECK as it stood, now `git log -S "701 s" -- dev/backlogs/ROADMAP.md`); that is the FULL run of the engine standalone - the same work the embedded run did before this release, measured outside the apply;
  - after - 0.4 s: the whole `node D:/pnp-live/scripts/update/aiwf-update.mjs --apply --project-root D:/promptandpray` of 2026-11-07, embedded project-scope self-check included, wall time `Get-Date` before and after the process in PowerShell (`start=2026-11-07T12:38:32.917+02:00 end=2026-11-07T12:38:33.317+02:00`, 31/31 assertions). The two numbers measure different commands on the same machine and are reported as such, not as a ratio.

## Remaining debt

None in the ticket. One out-of-scope finding, asked at the close with its proposed destination: `scripts/selfcheck/run-selfcheck.mjs:108-113` - the runner's own FAIL verdict line still offers "could not prove part of the contract in this environment (a host the checks need was missing or unusable)" as a cause, which the project scope can no longer produce; code outside this ticket's Code Map.

## Diff review

Folded from `.aiwf/UPDCHECK-002-diff-review.md`: the whole diff read (10 files at the hand-back, 11 in the commit with
the Writer's two new files); nothing outside the Code Map; the guard diff over `examples`, `scripts/ci`, `.github` and
the overrides empty. Facts checked first-hand before the pass: `runProjectScope` order `aiwf-selfcheck.js:10079-10083`;
the full scope's tail `:10156-10159` (COMMIT AUTOMATION, its CONTROLS, NEGATIVE CONTROLS, SCOPE CONTROLS); the titles
`:1275`, `:7524`, `:8036`, `:8056`, `:9917`, `:9997`; the header `scope` and host lines `:10111-10112`; the argv
`run-selfcheck.mjs:62` and the PASS suffix `:101`. Narrowed-test grep n/a (no test in the diff). Acceptance criterion
-> the defect each proof sees: (1) validate-payload - a malformed manifest, a non-monotonic index, a version mismatch;
(2)-(3) the two version greps - the bump or the entry missing; (4) the op counts - a second or a re-render op; (5) the
CHANGELOG greps - the block missing or unterminated; (6)-(7) the skill greps - the flag or the narrower claim
undocumented; (8) Step 1's block - the CI/manual form changed; (9) the guard diff - a frozen surface moved; (10) the name
and Cyrillic greps - provenance; (11) the apply's stamps, PASS line and the two times - the release unproven. Correction
round 1 delta (both red bullets): re-read against `run-selfcheck.mjs:108-113` - the verdict line still carries the
EITHER/OR clause, named as the full run's in the new text - and `aiwf-selfcheck.js:10112` - no host probed under the
project scope; the delta carries no pointer, no fact-check agent re-dispatched.

## Scratch

- `.aiwf/UPDCHECK-002-diff-review.md` - folded into § Diff review and § Verification above; deleted.
- `.aiwf/UPDCHECK-002-review-brief.txt` - moved to `records/UPDCHECK-002-review-brief.md` (the brief verbatim and the
  verdict); deleted.
- `.aiwf/last-review-session.UPDCHECK-002.txt` - the session id `01a1b577-aca8-7202-9ff0-9f1cea6b6e1f`, standing in
  § Verification and the review-brief file; deleted.
- `.aiwf/checkpoint.md` - live loop mechanics (overrides § Workspace paths), kept and rewritten.
- `.aiwf/route-state.json` - `{}`, kept.

## Closing checklist

- the operator's own run on a real input: the self-install apply above ran on the operator's dialog word "Пускай
  (Препоръчвам)" in this session; a consumer's apply of 0.3.13 is the consumer session's own run;
- the diff review folded in above: yes;
- finding lines on the roadmap area entry: n/a - § UPDCHECK is a goal entry; it leaves the roadmap with this archive;
- out-of-scope findings: one, § Remaining debt - asked at the close;
- scratch files: each named above with its destination;
- the next work: the plan is complete and archived with this commit; next is the tag and the push on their words,
  then ROADMAP § SUITES through `/pnp:plan` in a fresh session (operator word 2026-11-07 „добре, SUITES след UPDCHECK").

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 1 (prose only, no verification pass) | 230,000 | `~/.claude/ctx/96579471-10e9-45dd-b342-9d4d60d5862e.pct` 23 x `.size` 1,000,000 |
