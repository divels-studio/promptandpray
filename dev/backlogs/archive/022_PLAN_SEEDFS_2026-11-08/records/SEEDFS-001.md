# SEEDFS-001 - the seed-file op judged through the real filesystem; the 15c proof; release 0.3.15

## What landed

- `eceb9be` (the Writer, on the operator's commit dialog; `Refs: SEEDFS-001`, no attribution line) - ONE code commit carrying the whole release diff (D-07, D-10), 10 files, 376 insertions, 32 deletions:
  - W1 (D-03) `scripts/setup/generate.mjs`: `export` on `canonicalPath`, `isInsideDir`, `samePath`; bodies unchanged.
  - W2 (D-11) `generate.mjs`: `samePath` folds case on `win32` OR `darwin`, its comment saying why; hunks at old lines 639, 663, 673, 675 only - setup's judgement untouched (D-09).
  - W3 (D-03) `scripts/update/migrate.mjs`: the three helpers imported from `../setup/generate.mjs` beside `resolveTransferSurface`; no copy in the file.
  - W4 (D-01, D-05) `resolveSeedTarget` unchanged - the lexical test stays the first refusal; the summary lines and the overlay key keep the POSIX project-relative target.
  - W5 (D-01) `refuseEscapingSeed` (new): `canonicalPath` of the root and of the target, `isInsideDir`; the refusal names where the write really lands (`really resolves to "<path>", which is not inside the project - nothing was written.`). `planSeedFile` calls, in order, resolve -> exists -> escape -> surface and carries `expectParent` (the canonical parent judged at plan time) on the plan; a new one-line helper `seedPath` replaces three inline joins.
  - W6 (D-02) `refuseSurfaceSeed`: both sides canonical through `samePath`; `FOLD_CASE` / `sameRel` deleted; the message unchanged.
  - W7 (D-04) `seedTargetExists`: `lstatSync`; a link to a regular file is kept; a dangling link or a link to a non-file is refused `(found a link)`; the old branches keep their wording.
  - W8 (D-13) `applySeed(file, text, expectParent)`: after `mkdirSync`, before the `wx`, the canonical parent compared through `samePath` with the plan-time one - `seed-file: the parent of "<file>" moved between the check and the write - nothing was written.`; `applyPlan` passes `plan.expectParent`; `planSeedFile` and `applyPlan` exported as test seams. The docblocks of `planSeedFile` and `applySeed` name the order, the link refusal, the re-check and the residual (the window between the re-check and the `wx` system call, answered by one executing session per working tree - the operator's recorded decision, D-13).
  - P1 (D-06) `scripts/update/test-update.mjs` 15c t6, 15 checks `ledger-16..30`: (a) the escape through a junction on `paths.plansDir` (16-18), (b) the junction alias of the surface (19-21), (c) a dangling junction AT the target (22-24), (d) four controls - real folders, a present surface through the alias kept, a present far-side file kept (25-28), (e) the plan/apply split through the exported seams on a minimal ctx, the parent swapped for an outside junction between plan and apply refused, the unmoved control written (29-30). Every junction fixture is a hard check; realpath equality on both sides; `snapshot` not used on a junction project. The header comment names the five cases; `pathToFileURL` imported.
  - R1-R3 (D-07) `migrations/0040_seed-containment/ops.json` (one `note`, id `seed-containment-0-3-15`, 4 `docRefs`, no re-render op) and `NOTES.md`; `migrations/index.json` gains `0040_seed-containment` -> `0.3.15` as its last entry; `.claude-plugin/plugin.json` `0.3.15`.
  - R4 (the COO, R1 prose, written before the Verify batch): `CHANGELOG.md` `## [0.3.15] - 2026-11-08` (`### Fixed` one entry SEEDFS-001 with four sub-items, `### Changed` the migration line, `Retires local rules: none`); `README.md` § Status `v0.3.15`; the "Who reads the key" sentence of `migrations/0011_transfer-surface/NOTES.md` corrected to what the engine does since `169d9e1` (3 lines added, 2 removed; the promise untouched) - the COO's text, performed by the Writer (§ Decisions and deviations).
- The self-install (R5, operator word „Прилагай self-install-а"): `node D:/pnp-live/scripts/update/aiwf-update.mjs --check` (behind 0.3.14 -> 0.3.15), `--dry-run` (one `note`, nothing re-rendered, no question), then `--apply --project-root D:/promptandpray` - exit 0, `self-check: PASS - ==== 31/31 assertions passed ==== (project layer only - run `/pnp:selfcheck` for the full check)`; the diff: `.claude/aiwf-native/aiwf.config.json` 2 lines (`installedPluginVersion` 0.3.15, `lastMigrationApplied` 0040_seed-containment). It rides this record's docs commit. The live copy `D:\pnp-live` was refreshed to `eceb9be` before it.
- The docs commit carrying this record: this file, `SEEDFS-001-review-brief.md`, `SEEDFS-001-narrow.mjs` (the narrow runner, moved from scratch), the index row closed, the plan archived as `archive/022_PLAN_SEEDFS_2026-11-08/` (guard (e)), `readiness/SEEDFS/ledger.md` created (the plan's passes), ROADMAP § SEEDFS out (its only plan archived) and one finding line on § SETUP, the ledger's SEEDFS line rewritten, the config stamps of the apply.

## Decisions and deviations

- `refuseSurfaceSeed` builds the surface side with `path.resolve(root, surface)` where the ticket wrote `path.join` (the Writer's deviation, accepted): identical for a relative key, and it keeps the shipped line's handling of an absolute key.
- `applySeed`'s refusal names its absolute `file` argument, not the relative target (accepted): an error message, never a summary line, and its EEXIST sibling already names `file`. It also refuses a non-string `expectParent` (the safe direction; every plan from `planSeedFile` carries one).
- The case (e) projects are not `install`ed (accepted): an install seeds LEDGER.md and the plan would come out `kept` instead of `seed`.
- The plan assigned the 0011 sentence (R4) to the COO as R1 prose, but Gate 3 keeps `migrations/**` from the main session while the route state names an R3 route; the COO authored the sentence verbatim and the live Writer performed it as a micro-round. The same held for the two fact-check fixes in `scripts/**` and `migrations/**`. A plan that assigns a non-root path to the COO under an open route should name the micro-round.
- The fact-check gate's one FALSE claim ("refused with/in setup's wording" - the engine's refusal shares only the phrase `really resolves to "<path>", which is not inside the project` with setup's, `generate.mjs:929-931`) stood in three places and in the ticket's W5 and D-01 as well; fixed in the CHANGELOG by the COO and in the `refuseEscapingSeed` docblock and 0040 NOTES by the Writer before the pass; the plan text stays as history.
- Set 3 of the index's closing greps counts 5 `applySeed` hits after the ticket, not 4: the fifth is the `seedTargetExists` docblock naming the re-check (a comment, not a caller).
- ROADMAP.md (the status word of § SEEDFS) stayed out of the code commit on purpose and rides this record's commit, which takes the entry out.

## Events

| 2026-11-08 | `ticket.md` § fact-check gate | catch | 64 claims, 3 false (one attribution in three places, § Decisions and deviations), 3 unverifiable platform facts closed by the COO first-hand (macOS's default case-insensitive filesystem; a Windows junction needs no administrator right - the precedent fixture `test-setup.mjs:1915-1935` rests on it and every junction fixture was made on this host) - all before pass 1 (`SEEDFS-001-review-brief.md`, § Diff review) |
| 2026-11-08 | habit guard (Gate 4) | catch | the COO's commit brief asked the Writer for `git show --stat --format=%s HEAD \| tail -n 15`; the guard refused the pipe and the Writer ran `git show --stat --format=%B HEAD` unpiped - a brief defect, caught |
| 2026-11-08 | `ORCHESTRATOR.md` § The operator-channel filter, question 3 | operator-correction | the Writer reported "no permission dialog appeared for the commit itself" and the COO raised a gate dialog on it (keep the commit or undo it); the operator: „абе има диалог, винаги е имало, колегата не ги вижда тези неща, стига сте ме занимавали с глупости" (there is a dialog, there always was; the Writer does not see it from its side) - a subagent's claim about a dialog in the operator's UI is not one the COO can verify with a Read and is not a reason to stop the loop; the commit stands as approved |

## Verification (what actually ran)

COO, Windows Portion 1 (the ticket's four rows, D-08), ONCE, as one parallel batch - `Start-Process node` per row from the repository root, logs under `C:/Users/dyosi/AppData/Local/Temp/pnp-seedfs-001/`, started at the Writer's hand-back beside the full diff read:

- `node scripts/update/test-update.mjs` - exit 0, 94 s, `checks: 495, failures: 0`, `UPDATE SUITE: PASS`; 15 `[PASS] [ledger-16..30]` lines, 0 `[FAIL]`
- `node scripts/setup/test-setup.mjs` - exit 0, 47 s, `checks: 481, failures: 0`, `SETUP SUITE: PASS`
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0, `valid: 40 migration(s) in D:\promptandpray, payload version 0.3.15`
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` (the CI form; the fixture form would red its version-stamp row before the self-install, `dev/VERIFY_RUNBOOK.md:22-29`) - exit 0, 308 s, `==== 1762/1762 assertions passed ====`; stderr the `--jobs` dealing lines only
- every suite `.err.log` 0 bytes but the self-check's dealing lines

The Writer's runs (D-12), reported at the hand-back with exit codes: the narrow runner `SEEDFS-001-narrow.mjs` on a scratch payload copy outside the repository - red with `--engine e4bc7be` (exit 1: FAIL ledger-17, 18, 20, 21, 23, 24, 29, 30; PASS 16, 19, 22, 25, 26, 27, 28 - the five required reds of 17/20/23/29/30 and the seven fixtures and controls green), green on the change (exit 0: `checks: 46, failures: 0`); the D-04 host probe `LINK` for a dangling junction (exit 0) and `NOT A LINK` for a real directory (exit 1); the [red] rows on both sides - D-03 `NOT EXPORTED canonicalPath isInsideDir samePath` -> `EXPORTED`; D-11 `FOLD WRONG` -> `FOLD OK` for darwin, win32 and linux; D-13 seams `0` -> `2`, the "moved between" message absent -> `:1`; every other Acceptance row at the hand-back as the ticket: Set 1 empty, the no-copy grep empty, the generate.mjs hunks at 639/663/673/675, Set 2 two files, `ORDER OK`, the D-01/D-02/D-05/D-04 counts 1, 2, 1, 2, 1, 1, D-06 15, the D-09 diff empty, the 0011 numstat `3 2` one line with the promise present, plugin.json / index.json / ops.json as the release rows; the provenance greps empty. The COO re-ran the three provenance greps before the commit: empty.

Fact-check gate: one `sonnet` Explore scan over the diff's prose (Class code, cross-reference claims), `CLAIMS: total=64 verified=58 false=3 unverifiable=3`; the three fixed and the three closed before the pass (§ Events).

Auditor: pass 1, Codex gpt-6-sol / xhigh, cold, on the ticket's word „да" - `pass-with-notes`, no findings ("No findings. ... the new checks are red against the old engine and green against the change; update suite, setup suite, the validator and the self-check pass." - notes: the operator-accepted window between the re-check and the `wx`; the darwin check runs with a stubbed platform, its real execution is the upcoming macOS CI); tokens used 94,067 (wrapper stderr), session `01a1ba54-8da1-7171-8d28-ec1891fbd5ea`, log `C:\Users\dyosi\AppData\Local\Temp\pnp-codex\SEEDFS-001-code-20261108-104425-28024.log`. Correction rounds: 0. No QA (operator „Без QA", the plan's § Order and gates). Brief and verdict verbatim: `SEEDFS-001-review-brief.md`.

## Remaining debt

None in this ticket. Two findings outside its scope, registered: (1) a DANGLING junction on a PARENT directory (e.g. `paths.plansDir` pointing at a missing target) is read by `canonicalPath` as inside the project - the walk climbs past the segment it cannot resolve - and Windows can create through it; the helper is setup's shared one (D-09 kept it out) -> one finding line on ROADMAP § SETUP. (2) The darwin fold is live only on the advisory macOS CI leg; the D-11 probe stubs `process.platform` - CI's macos run after the push is where it shows; no line owed. Deferred items stay in DECISIONS § Deferred (the archive).

## Diff review

Folded from `.aiwf/SEEDFS-001-diff-review.md`. The whole diff `git diff e4bc7be` over nine tracked files plus the untracked `migrations/0040_seed-containment/` read by the COO. The engine: the import list; `planSeedFile` with the order resolve -> exists -> `refuseEscapingSeed` -> `refuseSurfaceSeed` and `expectParent` computed AFTER the containment check, so the recorded parent is one already judged inside; `seedPath`; `refuseEscapingSeed` verbatim to W5; `refuseSurfaceSeed` canonical on both sides, `resolve` for the key; `seedTargetExists` with `lstatSync` and the shared `notAFile`; `applySeed` with the re-check after `mkdirSync` and before the `wx`; the docblocks carrying the residual; `UpdateError` already exported (`:75`, read by the test's `instanceof`). Setup: the three exports and the fold, hunks inside the W1/W2 window only. The proof: the five case groups, hard junction checks, realpath equality through `realpathSync.native`, `unlink` per the precedent, the (e) seams on a minimal ctx. The release files as R1-R4. Per acceptance criterion, the defect each proof sees: a lexical surface comparison left (Set 1); the helpers not exported or copied (D-03); setup changed beyond the fold (the hunk ranges); a third consumer of the helpers (Set 2); darwin not folding or linux folding (D-11); W7 unreachable on this host (D-04 probe); the canonical refusal missing or the lexical one gone (the D-01 counts); the surface message duplicated or changed (D-02); a call out of order (the order probe); a canonical path in a summary line (D-05); the seams or the "moved between" message missing, a call site without the third argument (D-13); fewer than 15 cases (D-06); a frozen file touched or 0011 beyond one sentence (D-09); a bump without its stamp set (D-07, Set 5); a Cyrillic byte or an origin name (provenance); a case green on the old engine or a fixture red there (the narrow logs); a red row or a missing ledger PASS line (the Verify logs). Narrowed-test grep over the added lines of the three script diffs (`.skip` / `.only` / `.todo` / `SKIP`): no hit - nothing narrowed. Audit row: class=code -> review.code codex gpt-6-sol/xhigh, 1 pass (the resolver, 2026-11-08). The archive's rule-point backstop: a grep for `operator rule|standing rule|from now on|local rule` over the plan folder hits only pointers to existing rules (the 2026-08-31 attribution rule, `Retires local rules`) - no rule-class point born in this plan without a pointer row; the positive control over `archive/017_PLAN_RULEHOME_2026-10-31/` reports 41 hits in 11 files.

## Scratch

- `.aiwf/SEEDFS-001-diff-review.md` - folded into § Diff review, § Verification and § Events above; deleted.
- `.aiwf/SEEDFS-001-review-brief.txt` - moved to `records/SEEDFS-001-review-brief.md` with the verdict; deleted.
- `.aiwf/SEEDFS-001-narrow.mjs` - the narrow runner (D-12), its content standing nowhere else; moved to `records/SEEDFS-001-narrow.mjs`.
- `.aiwf/last-review-session.SEEDFS-001.txt` - the session id `01a1ba54-8da1-7171-8d28-ec1891fbd5ea`, standing in `SEEDFS-001-review-brief.md` and above; deleted.
- `.aiwf/checkpoint.md` - live loop mechanics (overrides § Workspace paths), kept and rewritten.
- `.aiwf/route-state.json` - cleared to `{}` at the close, kept.
- The logs outside the repository (`C:/Users/dyosi/AppData/Local/Temp/pnp-seedfs-001/`: the four Verify logs, the two narrow logs, the self-install log; the Codex log under `<temp>/pnp-codex/`) are not covered; their numbers stand above.

## Closing checklist

- the operator's own run on a real input: n/a - no product-visible outcome; the suites are this repository's own proof, run above, and the self-install apply ran on the operator's word;
- the diff review folded in above: yes;
- finding lines on the roadmap area entry: § SEEDFS leaves the roadmap whole with the archiving of its only plan (the roadmap entry's goal is `eceb9be`);
- out-of-scope findings: one line on § SETUP (the dangling-junction parent), § Remaining debt;
- scratch files: each named above with its destination;
- the next ticket: none in this plan - the plan is archived; the release's tag and push take the operator's two words.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 | 240,000 | `~/.claude/ctx/6baaaaa9-68ec-452b-b415-2204b81eedab.pct` 24 x `.size` 1,000,000, read at this record's write |
