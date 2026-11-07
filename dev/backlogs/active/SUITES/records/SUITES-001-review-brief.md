# SUITES-001 - review brief and verdict (pass 1)

Moved from `.aiwf/SUITES-001-review-brief.txt` at the ticket's close. Engine: Codex gpt-6-sol / xhigh, cold
(audit table row `review.code`, 1 pass), session `01a1b663-8939-7ec1-9e69-df268cc4fa39`, tokens used
73,355 (wrapper stderr), log `<temp>/pnp-codex/SUITES-001-code-20261107-162218-29588.log`.

## Brief (verbatim)

```text
COVERED BY: operator word "добре, пускай", 2026-11-07
Review the diff for ticket SUITES-001 on branch main.

Class: code
Ticket: SUITES-001

SCOPE / DIFF:
The whole working diff against the scope guard: `git diff 31314c9` (13 files, uncommitted, nothing staged). The ticket contract is dev/backlogs/active/SUITES/tickets/SUITES-001.md (Outcome, Scope W1-W6 for the Writer and C1-C4 for the COO, Acceptance, Risk threshold, Stop condition, Verify); the plan's shared sections are dev/backlogs/active/SUITES/PLAN_SUITES.md and dev/backlogs/active/SUITES/DECISIONS.md (D-01..D-04, D-07, D-09 apply). Writer files: scripts/setup/test-setup.mjs, scripts/update/test-update.mjs, scripts/ci/run-example-cycle.mjs, scripts/selfcheck/aiwf-selfcheck.js, scripts/selfcheck/run-selfcheck.mjs, .claude/aiwf-native/aiwf.config.json, dev/answers.json. COO prose files: dev/PROJECT_OVERRIDES.md, dev/VERIFY_RUNBOOK.md, dev/README.md, skills/update/SKILL.md, skills/setup/SKILL.md, dev/backlogs/ROADMAP.md (one status line).

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it):
- W1/W2: `'--scope', 'project'` added on the same argv line as `'--project-fixture'` at scripts/setup/test-setup.mjs:340, :1550 and scripts/update/test-update.mjs:1973; their assertions assert exit 0 only (:342, :1551-1552; :1975-1976).
- W3: the cycle's step-8 command scripts/ci/run-example-cycle.mjs:63 and its copy examples/example-project/README.md:120 unchanged (full scope kept, D-02); `git diff 31314c9 -- examples scripts/selfcheck/README.md .github scripts/spike` is empty.
- W4: `printSlowestSections()` added in the four drivers (test-setup.mjs:71-84, test-update.mjs:89-102, run-example-cycle.mjs:83-97, aiwf-selfcheck.js:111-129), called once right before each tally line (test-setup.mjs:2133, test-update.mjs:2113, run-example-cycle.mjs:717, aiwf-selfcheck.js:10367). Title consumers: aiwf-selfcheck.js:10038 (`startsWith('=== ')`), :10043 (TALLY_LINE_RE on the child's last non-empty line), test-update.mjs:2032 (`=== GATE 1`); scripts/selfcheck/run-selfcheck.mjs:69 reads the child's last non-empty line.
- W5: verdict scripts/selfcheck/run-selfcheck.mjs:106-112 and contract comment :20-26; the asserting test scripts/setup/test-setup.mjs:1038-1040; preserved assertions on `WERE written` / `nothing was rolled back` / `never reports that the write failed` in test-setup.mjs and test-update.mjs (ticket W5 lists them).
- W6: the `example-cycle-linux` row removed from .claude/aiwf-native/aiwf.config.json verify.commands and dev/answers.json (the config file is not in `_aiwf.managedRegions`, aiwf.config.json:6-16).
- Writer deviation: the comment test-setup.mjs:1007-1011 rewritten (it described the removed clause directly above the changed assertion).
- COO's local Verify run (Portion 1, one parallel batch, logs outside the repo), all exit 0: validate-payload, setup-suite (`checks: 481, failures: 0`, SETUP SUITE: PASS), update-suite (`checks: 457, failures: 0`, UPDATE SUITE: PASS), example-cycle-windows (`checks: 43, failures: 0`, EXAMPLE CYCLE: PASS), selfcheck fixture form (`==== 1761/1761 assertions passed ====`, `[scope-S1]` PASS); the ticket's D-03 node check over the four logs exit 0; provenance grep empty.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: Blocks: a full-scope self-check spawn left in test-setup or test-update; the cycle's step 8 or its README copy changed (D-02 keeps them full); a tally line changed in text or position, or a consumer of the tally line (PLAN_SUITES.md closing grep S7) no longer matching; a `slowest sections:` row that a section-title consumer reads as a title; the `WERE written` / `nothing was rolled back` wording lost; `verify.commands` invalid JSON or schema-red; a change to CI, the example answers or the self-check's CI/example pins (D-01); a time bound written as acceptance (D-07); a false factual statement in the COO's dev/ or skills prose. Notes only: the verdict's and the comments' wording, the seconds' rounding. This ticket lands unreleased by design (D-08: SUITES-002 carries the bump and the migration) - the absence of a bump here is not a finding.
STOP CONDITION: stop once every changed file is reviewed against the ticket's Acceptance and Risk threshold and the consumers named above are checked; do not propose redesigns and do not review SUITES-002's scope (the parallel full run).
BUDGET TARGET: (the template's line, unchanged)

OUTPUT CONTRACT: (the /pnp:review template's single-round contract, unchanged; checklist path D:/promptandpray/.claude/aiwf-native/doctrine/review.md)
```

## Verdict (verbatim, the wrapper's stdout)

```text
fail

**Blocker — `dev/VERIFY_RUNBOOK.md:33` (P2, stale release instruction).** It says CI provides POSIX proof “before a tag,” while the corrected rule at lines 79–80 and `dev/PROJECT_OVERRIDES.md:50–53` says the tag is pushed with `main` without waiting for CI. This is a false operational instruction in the COO prose, which the ticket’s risk threshold explicitly blocks.

**Non-blocking note — `scripts/setup/test-setup.mjs:1024–1027`.** The mocked red child still reports a bash-host failure, although this case now asserts a project-scope verdict that says no host was probed. The verdict assertion is exercised, but the fixture’s report is misleading.

**Next action:** Correct the runbook’s line 33 to match the post-push CI rule, then rerun the applicable prose checks and resubmit the diff.
```
