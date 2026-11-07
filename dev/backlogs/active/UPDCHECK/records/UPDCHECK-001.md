# UPDCHECK-001 - the self-check engine gains a `--scope` flag; the embedded run takes the project scope

## What landed

- `9347fd9` (the Writer, on the operator's commit dialog) - three files:
  - `scripts/selfcheck/aiwf-selfcheck.js` - A1 `--scope project|full` (absent = full; any other value or a
    bare flag -> exit 2 naming `--scope`); A2 `PWSH`/`BASH` probed only under full; A3 `runProjectScope`
    (PROJECT PLAN NAMING -> PROJECT LAYER -> COMMIT AUTOMATION reading), the plan-naming reading split out
    and printed in place under its own title, the export check shared (`requirePlanShapeLib`), commit
    automation split into the reading and `COMMIT AUTOMATION CONTROLS`; A4 header `scope` line, host line
    unprobed, NOTE sentence dropped under project; A5 short COVERAGE block under project, full text
    unchanged plus one SCOPE CONTROLS paragraph; A6 `SCOPE CONTROLS` S1-S4 (5 checks) after NEGATIVE
    CONTROLS, with a recursion guard (`AIWF_SELFCHECK_SCOPE_CHILD`) and a non-plugin root for the S4 faces.
  - `scripts/selfcheck/run-selfcheck.mjs` - B1 the embedded spawn passes `--scope project`; the PASS line
    gains ` (project layer only - run `/pnp:selfcheck` for the full check)`; contract text 2-3 reworded.
  - `scripts/update/test-update.mjs` - C1 both crash cases patch `  sectionCommitAutomation(projectRoot);`
    (the last project-scope call); sc-pass checks the suffix; sc-red checks the scope line and no GATE 1.
- The docs commit carrying this record also carries two COO edits made at the dispatch: `ROADMAP.md`
  § UPDCHECK `Status: in progress` (roadmap write 2, the first ticket's dispatch) and
  `tickets/UPDCHECK-002.md` line 4 `COO: Opus` -> `COO: Fable` (check 1 is yes: it writes migration 0038;
  operator word „поправи го и пускай 001").

## Decisions and deviations

- **Accepted deviation of the acceptance row "example-cycle-windows exit != 0"**: the run exited 1, its only
  `[FAIL]` the byte-identity check, tripped by the COO's own writes into `.aiwf/` during the run. The operator
  ruled no rerun twice (dialog answers „Не, приеми го така" and „2 - остава без повторно пускане, 002 така или
  иначе пак ще го пусне"); the COO corrected the second answer's premise - 002 does not run the cycle
  locally; CI runs it on the pushed commit. Auditor pass 2 accepted the deviation.
- Writer: the [NOTE]-classification check of commit automation moved into the reading (it reads only
  `results`), so it runs under the project scope too - order changed, count unchanged.
- Writer: two runaway guards in SCOPE CONTROLS beyond the contract (the child env flag; S4 on a non-plugin
  root so a wrongly accepted value fails on a message without `--scope`). Within A6's intent.

## Events

| 2026-11-07 | overrides § Test policy "No micro-round edits while a suite is running" | violation | COO wrote `.aiwf/UPDCHECK-001-diff-review.md` and `.aiwf/checkpoint.md` while the Verify batch ran; example-cycle-windows byte-identity FAIL (this record § Verification) |
| 2026-11-07 | `/pnp:review` § The evidence pack | violation | the COO's pass-1 pack omitted the Writer's red/green evidence it held; cost auditor pass 2 (`UPDCHECK-001-review-brief.md`) |
| 2026-11-07 | `work.md` § COO routing (ANY yes -> top tier) | catch | UPDCHECK-002 recorded `COO: Opus - because check 1`; corrected to Fable at `/pnp:mission`, on the operator's word |
| 2026-11-07 | `ticket.md` § fact-check gate | catch | 43 cross-reference claims, 1 false (the SCOPE CONTROLS header comment said every face runs `--scope project`; S4 does not) - fixed by a Writer micro-round before pass 1 |

## Verification (what actually ran)

COO, Windows Portion 1, once, in parallel, logs outside the repository (session scratchpad `verify-001/`):

- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` - exit 0, `==== 1761/1761 assertions passed ====`, header `scope           : full`, `[scope-S1]`..`[scope-S4]` PASS
- `node scripts/update/test-update.mjs` - exit 0
- `node scripts/setup/test-setup.mjs` - exit 0
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0
- `node scripts/ci/run-example-cycle.mjs` - exit 1, one `[FAIL] the repository is byte-identical ... - .aiwf/UPDCHECK-001-diff-review.md, .aiwf/checkpoint.md`, `EXAMPLE CYCLE: FAIL` (accepted deviation above)

COO acceptance rows: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture . --scope project` exit 0, the three titles, `scope           : project`, `powershell host : (not probed: project scope)`, last line `==== 31/31 assertions passed ====`; `--scope bogus` exit 2 and bare `--scope` exit 2, both stderr naming `--scope`; `git grep -n -F -e "const PWSH = findPwsh();" -e "const BASH = findBash();" -- scripts/selfcheck/aiwf-selfcheck.js` exit 1; `git grep -n -F "'--scope', 'project'" -- scripts/selfcheck/run-selfcheck.mjs` one hit `:62`; `git diff 453ddf0b180218eb7a35f07b21ac0d51b50d227e -- .github/workflows/ci.yml .claude/aiwf-native/aiwf.config.json scripts/setup` exit 0, no output; provenance grep exit 1.

Writer (its hand-back; scratch drivers outside the repository, not re-run by the COO): S1-S4 and C1 each red under a named fault, then green - listed in `UPDCHECK-001-review-brief.md` § Pass 2.

Fact-check gate: one `sonnet` Explore scan, `CLAIMS: total=43 verified=42 false=1 unverifiable=0`.

Auditor: pass 1 Codex gpt-6-sol / xhigh, cold - `fail` (no code defect; two evidence blockers); pass 2 the
same session resumed, on the operator's word „Пусни втората проверка (Препоръчвам)" - `pass-with-notes`.
Tokens per the wrapper: 92,539 (pass 1), 94,261 cumulative over the session.

## Remaining debt

None. (`scripts/selfcheck/README.md` still lists the old section set - already worklist R4 of UPDCHECK-002.)

## Diff review

Folded from `.aiwf/UPDCHECK-001-diff-review.md`: the whole diff read; no file outside the Code Map. A1 the
SCOPE IIFE after `bail`, before the plugin-root check; A2 the probes gated; A3 the project scope's three
sections in the contract's order, the full scope's 28 calls in order plus the two moved blocks in place and
SCOPE CONTROLS last; A4/A5 header and COVERAGE branched, tally and exit lines untouched; A6 S1-S4 as
specified, S3 comparing the child's FAILURES to the in-process `projectLayerFindings` on the same copy; B1
the PASS suffix after the verbatim child line, so `/self-check: PASS - .*assertions passed/` still matches;
C1 the crash site unique, two passing sections before it. Narrowed-test grep (`skip|only|todo` on added
lines): prose hits only, no narrowed test set. Acceptance criterion -> the defect each proof sees: (1) the
project-scope run - a payload section, a probed host, a missing tally; (2) the refused values - exit 2 and
`--scope` in stderr; (3) the probe grep - an unconditional probe; (4) the argv grep - a full embedded spawn;
(5) the guard diff - a frozen invocation moved; (6) the full selfcheck - SCOPE CONTROLS missing or red, no
`scope : full`, total below 1756; (7) the suites - a pin on the old PASS line or crash site; (8) provenance.

## Scratch

- `.aiwf/UPDCHECK-001-diff-review.md` - folded into § Diff review above; deleted.
- `.aiwf/UPDCHECK-001-review-brief.txt` - moved to `records/UPDCHECK-001-review-brief.md` (pass 2 in
  substance, pass 1 restored verbatim); deleted.
- `.aiwf/last-review-session.UPDCHECK-001.txt` - the session id `01a1b551-0767-7060-a85e-d11af1dd10b1`,
  standing in § Verification and the review-brief file; deleted.
- `.aiwf/checkpoint.md` - live loop mechanics (overrides § Workspace paths), kept and rewritten.
- `.aiwf/route-state.json` - cleared to `{}` at the close, kept.

## Closing checklist

- the operator's own run on a real input: n/a - the outcome is visible in a consumer's `/pnp:update --apply`,
  which is UPDCHECK-002's timed self-install (D-09);
- the diff review folded in above: yes;
- finding lines on the roadmap area entry: n/a - § UPDCHECK is a goal entry with no finding lines;
- out-of-scope findings: none;
- scratch files: each named above with its destination;
- the next ticket: UPDCHECK-002 in a fresh Fable session (its COO line), on its own word.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (pass 2 was a verification of evidence, no code changed) | 220,000 | `~/.claude/ctx/e33a3f31-edb4-41ca-adaa-aebad373a9d7.pct` 22 x `.size` 1,000,000 |
