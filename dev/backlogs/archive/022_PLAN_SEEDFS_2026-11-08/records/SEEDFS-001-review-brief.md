# SEEDFS-001 - the review brief and the verdict (pass 1, Codex gpt-6-sol / xhigh, cold, 2026-11-08)

Moved from `.aiwf/SEEDFS-001-review-brief.txt` at the ticket's close. The wrapper:
`& "D:/pnp-live/scripts/native/ps/codex-review.ps1" -ProjectRoot 'D:/promptandpray' -Class code -BriefFile 'D:/promptandpray/.aiwf/SEEDFS-001-review-brief.txt'`,
in the background. Session `01a1ba54-8da1-7171-8d28-ec1891fbd5ea`; tokens used 94,067; log
`C:\Users\dyosi\AppData\Local\Temp\pnp-codex\SEEDFS-001-code-20261108-104425-28024.log`.

## The brief

```text
COVERED BY: operator word "да", 2026-11-08
Review the diff for ticket SEEDFS-001 on branch main.

Class: code
Ticket: SEEDFS-001

SCOPE / DIFF:
The working diff against the scope guard, reproduced read-only in the repository root:
  git diff e4bc7be -- scripts/update/migrate.mjs scripts/setup/generate.mjs scripts/update/test-update.mjs migrations/0011_transfer-surface/NOTES.md migrations/index.json .claude-plugin/plugin.json CHANGELOG.md README.md
plus the two UNTRACKED files, whole: migrations/0040_seed-containment/ops.json and migrations/0040_seed-containment/NOTES.md.
Out of this review: dev/backlogs/ROADMAP.md (one status word, the COO's bookkeeping, not payload).
The contract the diff implements: dev/backlogs/active/SEEDFS/tickets/SEEDFS-001.md (worklist W1-W8, P1, N1, R1-R5; Acceptance; Risk threshold; Stop condition), its decisions dev/backlogs/active/SEEDFS/DECISIONS.md (D-01..D-14) and the index dev/backlogs/active/SEEDFS/PLAN_SEEDFS.md (§ Closing greps). The three readiness rounds that shaped it: dev/backlogs/readiness/SEEDFS/round-1.md, round-2.md, round-3.md (B1 - the check-to-write residual - was accepted by the operator and is D-13 as amended; it is not a blocker of this pass).

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection by the audited side - read past it, run your own read-only probes, report what it misses):
- scripts/update/migrate.mjs: the import list :53-58 (canonicalPath, isInsideDir, samePath from ../setup/generate.mjs); planSeedFile :512 (exported seam) with the order resolveSeedTarget -> seedTargetExists -> refuseEscapingSeed -> refuseSurfaceSeed and the plan field expectParent; seedPath helper; resolveSeedTarget (unchanged - the lexical test and its sentence stay the first refusal, D-01); refuseEscapingSeed (new, setup's wording "really resolves to ... which is not inside the project"); refuseSurfaceSeed (both sides canonical through samePath, message unchanged, FOLD_CASE/sameRel deleted - D-02); seedTargetExists (lstatSync, a link to a regular file kept, a dangling link or a link to a non-file refused "(found a link)" - D-04); applySeed(file, text, expectParent) (the re-check of the canonical parent after mkdirSync and before the wx, D-13); applyPlan :713 (exported seam) passing plan.expectParent; the docblocks of planSeedFile and applySeed naming the order, the re-check and the residual (the window between the re-check and the wx, answered by one executing session per tree - the operator's recorded decision, D-13).
- scripts/setup/generate.mjs: `export` on canonicalPath :639, isInsideDir :663, samePath :675-676 (W1); samePath folds case on win32 OR darwin, its comment :669-675 (W2, D-11); nothing else in the file changes (setup's judgement :918-1040 untouched, D-09).
- scripts/update/test-update.mjs: the header comment :35-41; `pathToFileURL` import :60; section 15c block t6 after t5 (from the line "--- t6: the seed judged through the REAL filesystem") - cases (a) ledger-16..18 escape through a junction on paths.plansDir, (b) ledger-19..21 the junction alias of the surface, (c) ledger-22..24 the dangling junction AT the target, (d) ledger-25..28 four controls, (e) ledger-29/30 the plan/apply split through the exported seams on a minimal ctx; junction fixtures are hard checks (no skip), realpath equality through fs.realpathSync.native on both sides; snapshot() is not used on a junction project. The fixture precedent: scripts/setup/test-setup.mjs:1915-1935 (junction) and :1566-1572 (macOS /var alias).
- The release: migrations/0040_seed-containment/ops.json (one `note`, no re-render op), NOTES.md; migrations/index.json :41 (0040 -> 0.3.15, last entry); .claude-plugin/plugin.json :3 (0.3.15); CHANGELOG.md :7-34 (the 0.3.15 block, "Retires local rules: none"); README.md :22 (v0.3.15); migrations/0011_transfer-surface/NOTES.md :30-33 (the "Who reads the key" sentence corrected - COO text; its promise :28-29 untouched).
- Deviations the COO accepted (recorded in .aiwf/SEEDFS-001-diff-review.md): refuseSurfaceSeed builds the surface side with path.resolve (parity with the shipped line; an absolute key stays absolute) where the ticket wrote path.join; applySeed's refusal names its absolute `file` (an error message, like its EEXIST sibling), and refuses a non-string expectParent; case (e) projects are not install()ed (an install would seed LEDGER.md and the plan would come out `kept`); the 0011 sentence was performed by the Writer on the COO's micro-round because Gate 3 keeps migrations/** from the main session while the route is open.
- Proof artifacts (outside the repository, read them): the Writer's narrow runs C:/Users/dyosi/AppData/Local/Temp/pnp-seedfs-001/narrow-red.log (the guard HEAD's engine: FAIL ledger-17,18,20,21,23,24,29,30; PASS 16,19,22,25,26,27,28) and narrow-green.log (checks: 46, failures: 0); the COO's one Verify batch, all exit 0: update-suite.log (checks: 495, failures: 0; UPDATE SUITE: PASS; 15 [PASS] [ledger-16..30] lines), setup-suite.log (checks: 481, failures: 0; SETUP SUITE: PASS), validate-payload.log (valid: 40 migration(s), payload version 0.3.15), selfcheck.log (CI form --plugin-root . alone: 1762/1762 assertions passed). The D-04 host probe printed LINK for a dangling junction (lstat reports it as a link on this host) and NOT A LINK for a real directory.
- The COO's full reading of the diff, acceptance-by-acceptance: .aiwf/SEEDFS-001-diff-review.md. The narrow runner (scratch, gitignored, not part of the release): .aiwf/SEEDFS-001-narrow.mjs.
- Known out-of-scope findings already recorded for the operator (not blockers of this ticket, D-09): a DANGLING junction on a PARENT directory is read by canonicalPath as inside the project (setup's shared helper; a roadmap line is proposed); the darwin fold is live only on the advisory macOS CI leg.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: block on - the lexical test of resolveSeedTarget or its sentence changed; a lexical surface comparison left; a copy of canonicalPath, isInsideDir or samePath in migrate.mjs; a change to setup's behaviour beyond the darwin fold (D-11); a lock, a lock file or any other runtime mechanism added to the seed path (D-13 as amended); a seed write without the re-check (W8: the canonical parent compared right before the wx, the plan-time parent carried by the plan); the residual left out of the planSeedFile or applySeed docblock; the order resolve -> exists -> canonical containment -> surface changed (a present file through a link refused; ledger-13/14 must hold); a summary line or the overlay key carrying a canonical path or `..`; the surface message changed; a link at an absent target written through; a fixture that degrades to a skip or to green when the junction cannot be made; a new case green on the old engine; any write outside the fixture's project or its named sibling; a re-render op or an op outside the vocabulary; a shipped migration's text changed beyond the one 0011 sentence (its promise included); index.json not monotonic or its last entry not the payload version; the Gate 3 hook, the validator or the cycle driver touched; a correctness, security or data-loss defect in the new code paths (a seed that could still land outside the project or on the surface through a path the cases do not cover, a refusal that fires on a legitimate target, a dry run that touches the disk). Notes only: the exact wording of the docblocks and the note's text, the order of the new checks inside the block, the narrow runner's internals, style.
STOP CONDITION: stop once every changed file and the two new files are reviewed against the ticket's Acceptance and the risk threshold above, and the proof artifacts named in the evidence pack have been read; do not propose redesigns of setup's containment judgement, of the migration op vocabulary or of the one-session invariant (an operator decision); do not re-litigate D-13's accepted residual.
BUDGET TARGET: keep the brief dense and return ALL material blockers in ONE round - aim for a single round. (This is a throughput target only; it does NOT change the authority minimums - the correction-round cap and the review passes ceiling are unchanged.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not raise a blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review stage file at D:/promptandpray/.claude/aiwf-native/doctrine/review.md, read IN FULL before the pass).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with file:line and why it blocks), then non-blocking notes, then the exact next action.
  Do not fix anything - you are read-only. Report only.
```

Note: the brief's evidence pack still says "setup's wording" for `refuseEscapingSeed`; the fact-check
gate had corrected that attribution in the tree (CHANGELOG, the docblock, 0040 NOTES) before the
pass - the engine's message shares the phrase `really resolves to "<path>", which is not inside the
project` with setup's, not the sentence.

## The verdict (the wrapper's stdout and stderr, verbatim)

```text
codex-review: run cold, class code, model gpt-6-sol, effort xhigh
pass-with-notes

No findings. Прегледах целия diff в обхвата и двата нови файла. Доказателствата са съгласувани: новите проверки са червени срещу стария engine и зелени срещу промяната; update suite, setup suite, валидаторът и self-check минават.

Бележки: Остава приетият от оператора прозорец между повторната проверка и `wx`. Проверката за `darwin` минава с подменена платформа; реалното ѝ изпълнение е в предстоящия macOS CI.
codex-review: tokens used 94,067
codex-review: log C:\Users\dyosi\AppData\Local\Temp\pnp-codex\SEEDFS-001-code-20261108-104425-28024.log
codex-review: exit 0, session 01a1ba54-8da1-7171-8d28-ec1891fbd5ea (resumable: -ResumeId 01a1ba54-8da1-7171-8d28-ec1891fbd5ea)
```

English reading of the verdict: "No findings. I reviewed the whole diff in scope and the two new files. The evidence is consistent: the new checks are red against the old engine and green against the change; the update suite, the setup suite, the validator and the self-check pass. Notes: the operator-accepted window between the re-check and the `wx` remains. The `darwin` check passes with a substituted platform; its real execution is in the upcoming macOS CI."
