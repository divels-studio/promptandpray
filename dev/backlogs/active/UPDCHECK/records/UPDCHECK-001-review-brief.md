# UPDCHECK-001 - review briefs (moved from `.aiwf/UPDCHECK-001-review-brief.txt` at the close)

Two passes on one Codex session (`01a1b551-0767-7060-a85e-d11af1dd10b1`): pass 1 cold, pass 2 resumed.
The brief file was overwritten by pass 2; pass 1's text is restored here from the COO's session.

## Pass 1 (cold) - verdict `fail`

```text
COVERED BY: operator word "поправи го и пускай 001", 2026-11-07 (and the dialog answer "Пусни Одитора (Препоръчвам)", 2026-11-07)
Review the diff for ticket UPDCHECK-001 on branch main.

Class: code
Ticket: UPDCHECK-001

SCOPE / DIFF:
The working-tree diff against HEAD 453ddf0b180218eb7a35f07b21ac0d51b50d227e, code files only:
  git diff 453ddf0b180218eb7a35f07b21ac0d51b50d227e -- scripts/selfcheck/aiwf-selfcheck.js scripts/selfcheck/run-selfcheck.mjs scripts/update/test-update.mjs
The tree also carries two uncommitted COO edits outside this review (dev/backlogs/ROADMAP.md status line, dev/backlogs/active/UPDCHECK/tickets/UPDCHECK-002.md COO line) - not part of the ticket's code.
The contract is the frozen ticket dev/backlogs/active/UPDCHECK/tickets/UPDCHECK-001.md (Outcome, Scope A1-A6 B1 C1-C2, Acceptance, Risk threshold, Stop condition, Verify, Code Map), with dev/backlogs/active/UPDCHECK/PLAN_UPDCHECK.md (closing greps sets 1-7) and dev/backlogs/active/UPDCHECK/DECISIONS.md (D-01..D-11). Review the diff against that contract and against the tree.

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection by the audited side - read past it, run your own probes, report an incomplete pack as a finding):
- Anchors at the guard HEAD the ticket was authored against: aiwf-selfcheck.js:215 `const PWSH = findPwsh();`, :288 `const BASH = findBash();`, :9962 `    sectionGate2(tmpRoot);` (the old crash site of test-update.mjs:2026-2028, :2056-2058), :9986 `sectionCommitAutomation(PROJECT, tmpRoot);`.
- New in the tree: the SCOPE IIFE after bail(); `requirePlanShapeLib` + `sectionProjectPlanNaming` + `projectPlanNamingReading` (the plan-naming reading split out of sectionPlanRefNaming, printed in place under `PROJECT PLAN NAMING - `); `sectionCommitAutomation(projectRoot)` (the reading + the [NOTE]-classification check, moved before the controls) and `sectionCommitAutomationControls(tmpRoot)`; `sectionScopeControls` (S1-S4, recursion guard env AIWF_SELFCHECK_SCOPE_CHILD); `runProjectScope`; main() branching on SCOPE; COVERAGE text branched (the full-scope text is the old text re-indented, plus one SCOPE CONTROLS paragraph).
- run-selfcheck.mjs:62 argv gains '--scope','project'; :101 PASS suffix " (project layer only - run `/pnp:selfcheck` for the full check)".
- test-update.mjs: PROJECT_SCOPE_CRASH_SITE = '  sectionCommitAutomation(projectRoot);' replaces the sectionGate2 site in both crash cases; new sc-pass suffix check; new sc-red scope-line / no GATE 1 check.
- COO's VERIFY run at the hand-back (Windows Portion 1, once, logs outside the repo), exit codes as run:
  selfcheck (node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .) exit 0, `==== 1761/1761 assertions passed ====` (1756 before + 5 SCOPE CONTROLS), header `scope           : full`, S1-S4 all PASS;
  update-suite exit 0; setup-suite exit 0; validate-payload exit 0;
  example-cycle-windows exit 1 - its ONLY [FAIL] is "the repository is byte-identical", naming .aiwf/UPDCHECK-001-diff-review.md and .aiwf/checkpoint.md, two files the COO wrote into the gitignored scratch dir while the cycle ran (COO violation, recorded; the operator ruled no rerun). Every other cycle check passed, including the embedded PASS line with the new suffix.
  Acceptance rows run by the COO: `--scope project --project-fixture .` exit 0, three `=== ` titles (PROJECT PLAN NAMING / PROJECT LAYER / COMMIT AUTOMATION), `scope           : project`, `powershell host : (not probed: project scope)`, last line `==== 31/31 assertions passed ====`; `--scope bogus` exit 2 and bare `--scope` exit 2, both messages naming --scope; the findPwsh/findBash grep exit 1 (no hit); the '--scope', 'project' grep one hit run-selfcheck.mjs:62; the guard diff over ci.yml, aiwf.config.json, scripts/setup exit 0 with no output; provenance grep exit 1 (no hit).
- Fact-check gate (cross-reference claims of the added lines): 43 claims, 42 verified, 1 false - the SCOPE CONTROLS header comment said every face runs --scope project against a writeFixture project, untrue for S4; fixed by a comment-only micro-round before this pass.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: (the ticket's, plus any correctness defect that makes the project scope report green on a broken project or the full scope lose an assertion; notes only: coverage wording, titles after their prefixes, style)
STOP CONDITION: stop once every changed file is reviewed against the ticket's Scope, Acceptance and Risk threshold and against D-01..D-08; no redesigns, no deferred items; UPDCHECK-002's release prose out of scope.
OUTPUT CONTRACT: the standard single-round pass / pass-with-notes / fail contract of /pnp:review, per .claude/aiwf-native/doctrine/review.md.
```

Verdict (92,539 tokens per the wrapper): `fail`, no code defect found; blockers - (1) the acceptance row at
UPDCHECK-001.md:89 requires example-cycle-windows exit 0, the run exited 1; (2) the red runs under named
faults for S1-S4 and C1 were missing from the pack.

## Pass 2 (resumed, on the operator's word) - verdict `pass-with-notes`

The brief carried both blockers verbatim, the operator's two dialog answers on the cycle ("Не, приеми го
така"; "2 - остава без повторно пускане, 002 така или иначе пак ще го пусне") as an accepted deviation, and
the Writer's red/green hand-back evidence (S1: `sectionGate4()` added to the project scope -> S1 red; S2: a
host-needing check -> S2 red; S3: the project-layer check forced to pass -> S3 red; S4: `bogus` accepted /
a bare `--scope` accepted -> each face red; C1: the suffix check red with the suffix removed, the sc-red
scope check red without `--scope project`, both crash cases on the old `sectionGate2` site red (exit 0,
31/31, crash never reached) and on the new site exit 1 at 31/32 with FAILURES, `[(uncaught)]`, INCOMPLETE RUN).

Verdict (cumulative 94,261 tokens over the session, per the wrapper): `pass-with-notes` - both carried
blockers closed, no new blocker; note: the example-cycle deviation stays part of the ticket record.
