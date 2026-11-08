COVERED BY: operator word "dawaj", 2026-11-08
Review the diff for ticket DOCTR-002 on branch main.

Class: code
Ticket: DOCTR-002

SCOPE / DIFF:
The working tree against HEAD 138ed6771e8b721e1f7a80a5d055b9a533a0ec64 (the scope guard; nothing is committed yet).
Reproduce it with `git diff 138ed67 -- .claude-plugin/plugin.json CHANGELOG.md README.md migrations/index.json scripts/setup/aiwf-roles.mjs scripts/setup/test-setup.mjs skills/roles/SKILL.md`
PLUS the NEW, UNTRACKED folder `migrations/0041_doctrine-wording/` (`ops.json`, `NOTES.md`) - git diff does not show it; read both files whole.
`dev/backlogs/ROADMAP.md` (one `Status:` line) is also dirty: it rides the record commit, not this code commit - out of this review's scope.
The contract is the ticket `dev/backlogs/active/DOCTR/tickets/DOCTR-002.md` (Outcome, Scope W1-W5 and the COO's R1 CHANGELOG/README lines, Acceptance A1-A16, Risk threshold, Stop condition, Verify) - read it IN FULL. Its decisions: `dev/backlogs/active/DOCTR/DECISIONS.md` (D-01, D-04, D-20, D-21, D-25). The templates the migration re-renders were changed by DOCTR-001, commit 1e7f785 (`git show --stat 1e7f785`).

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK:
- The COO's whole-diff read, one line per acceptance criterion: `.aiwf/DOCTR-002-diff-review.md`.
- A2: `git diff --name-only 1e7f785~1 1e7f785 -- templates/ORCHESTRATOR.md.tmpl templates/doctrine templates/CLAUDE.md.tmpl templates/agents templates/AGENTS.md.tmpl` returns six templates; their six ops are `migrations/0041_doctrine-wording/ops.json:5-10`.
- Op shapes followed: `migrations/0036_planning-briefs-and-verify-owner/ops.json:5-9` (whole file; the Writer op `:8`), `migrations/0033_doctrine-stages/ops.json:9` (the aiwf-core region op). The engine: `scripts/update/migrate.mjs` (note printing ~:390, additions carry ~:455-462, ifRecorded ~:437-445); the validator `scripts/update/validate-payload.mjs`; the supersedes duty and the word-gate sentence `migrations/README.md:78-90`.
- The roles note producer `scripts/setup/aiwf-roles.mjs:577`, its pin `scripts/setup/test-setup.mjs:1497` (an adjusted assertion - D-04: producer and pin move together; only the expected string changed), its sample `skills/roles/SKILL.md:118`.
- The 0033 op-count pin that forbids editing a shipped migration: `scripts/update/test-update.mjs:1986-1993`.
- The COO's Verify batch (Portion 1, one parallel run): update-suite exit 0; setup-suite exit 0; validate-payload exit 0 ("valid: 41 migration(s) ..., payload version 0.3.16"); self-check CI form `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` exit 0 ("==== 1762/1762 assertions passed ===="). The fixture form is NOT run before the commit on purpose: the bump reds its installedPluginVersion row until `/pnp:update --apply` (`dev/VERIFY_RUNBOOK.md:22-29`).
- One micro-round after that batch (COO finding F1): the note text said "the four escalation checks" where the four COO routing checks are meant; fixed to "the four COO routing checks"; validate-payload re-run exit 0.
- The fact-check gate (sonnet) over the prose of NOTES.md, the note text, the docRefs, the six ops and the CHANGELOG block: CLAIMS total=109 verified=109 false=0 unverifiable=0.
- A1-A12 and A15 run by the COO, all green (A15: git grep is blind to the untracked folder; it was checked with rg - no Cyrillic, no drive path). A16 runs after the self-install.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: block on: an op missing for a template DOCTR-001 changed, or an op for a template it did not; an edit to a shipped migration; a manifest out of order or a last entry other than 0041 at 0.3.16; plugin.json and the manifest disagreeing; a note without id, text, docRefs, or a supersedes that does not name the dialog rule; the roles note changed in one of its three places only; the CHANGELOG block without the verbatim Retires line or not on top; a template, a doc or a rendered copy edited in this diff; Cyrillic, an origin-project name or an absolute path in the payload; a factual claim in the note, NOTES or CHANGELOG that misstates what the update engine or the templates do. Note-only: the note's wording, the CHANGELOG's grouping and titles.
STOP CONDITION: stop at the first BLOCKER that would fail a Verify row; otherwise stop after reading the whole diff (the untracked folder included) against Acceptance A1-A16. Do not propose redesigns.
BUDGET TARGET: keep the brief dense and return ALL material blockers in ONE round - aim for a single round. (This is a throughput target only; it does NOT change the authority minimums - the correction-round cap and the review.plan.passes ceiling are unchanged.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not raise a blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review stage file at D:/promptandpray/.claude/aiwf-native/doctrine/review.md, read IN FULL before the pass).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with file:line and why it blocks), then non-blocking notes, then the exact next action.
  Do not fix anything - you are read-only. Report only.
