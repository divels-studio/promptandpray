COVERED BY: operator word "пускай тук имаме ресурс", 2026-11-06
Review the diff for ticket GATES-005 on branch main.

Class: code
Ticket: GATES-005

SCOPE / DIFF:
The working diff against HEAD f2cb08e90edd2825d451d5fc8d05b301a6d2c687 - reproduce it with `git diff` plus
the untracked new folder `migrations/0037_habit-gates-and-codex-output/` (ops.json, NOTES.md; read both
whole - `git diff` does not show untracked files). Changed: `.claude-plugin/plugin.json`, `CHANGELOG.md`
(the 0.3.12 block), `README.md` (§ Status), `migrations/index.json`.

The contract is `dev/backlogs/active/GATES/tickets/GATES-005.md` (read it in full) with DECISIONS D-01,
D-10, D-11, D-12 (`dev/backlogs/active/GATES/DECISIONS.md`). This is the release of plan GATES: the four
code tickets are committed - GATES-001 `4122b27`, GATES-002 `2c1ad1d`, GATES-003 `a5d883c`, GATES-004
`6984415` (records in `dev/backlogs/active/GATES/records/`). The release text must say what those commits
landed - check it against the code at HEAD, not against the records.

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection made by the audited side - read past it):
- The templates the plan's commits changed: `git diff --name-only ba3f666..HEAD -- templates` (ba3f666 is
  the commit before GATES-001's code; it touched only `.claude/aiwf-native/aiwf.config.json`) lists
  `templates/ORCHESTRATOR.md.tmpl`, `templates/briefs/planner.md`, `templates/doctrine/plan.md.tmpl`.
  0037 re-renders the two managed ones (`.claude/aiwf-native/ORCHESTRATOR.md`,
  `.claude/aiwf-native/doctrine/plan.md`); `planner.md` is read from the plugin root, a `docRefs` entry as in
  `migrations/0036_planning-briefs-and-verify-owner/ops.json:14`.
- No `reconcile-ask-ruleset` op: D-01 keeps the `git -C <projectRoot> push|merge|rebase` ask rules.
- `scripts/native/codex-capture.mjs` (GATES-004, new) and the wrappers / skills / hooks are read from the
  plugin root - no op carries them; the note names them.
- COO VERIFY at the hand-back: `node scripts/update/validate-payload.mjs --plugin-root .` exit 0,
  `valid: 37 migration(s) in D:\promptandpray, payload version 0.3.12`. Acceptance greps: plugin.json `:3`;
  index.json `:38` (the 0037 line); each changed template named once in 0037 ops.json; no
  `reconcile-ask-ruleset`; `## [0.3.12]` `CHANGELOG.md:7`; the Retires line `CHANGELOG.md:61`; no
  consumer-project name and no Cyrillic in the payload or the new folder.
- COO direct edit in this diff: README § What is not here yet - the stale "One consumer installation so far
  ... 0.1.0 to 0.1.2" bullet rewritten from two consumer configs read at `installedPluginVersion` 0.3.11
  (outside this repository; no names in the payload).
- Not yet run (the COO's, after this pass and the release commit, on the operator's word): the self-install
  `/pnp:update --apply` with its embedded selfcheck. Judge whether the ops as written will render correctly
  (the engine is `scripts/update/`); you cannot run the apply.

PRODUCT BOUNDARY CHECKS:
- Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
- A managed-artifact change ships as a migration + version bump, never silently
- Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: blocks - a managed template changed by the plan with no re-render op; an op outside the
vocabulary (`add-config-key`, `rerender-managed-region`, `reconcile-ask-ruleset`, `note`, `seed-file`); a
shipped migration's text changed; a removed-rule op for the kept `git -C` ask rules (D-01); `index.json` not
monotonic or its last entry not the payload version; a rendered `.claude/` copy edited by hand; a consumer
project name in the payload; a release text that states a behaviour the code at HEAD does not have. Notes
only: changelog wording, the slug.
STOP CONDITION: stop once the six changed / new files are reviewed against the ticket's Acceptance and Risk
threshold and every behavioural claim of the release text is checked against the code at HEAD; do not
propose redesigns.
BUDGET TARGET: keep the reply dense and return ALL material blockers in ONE round - aim for a single
round. (This is a throughput target only; it does NOT change the authority minimums.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not raise a
blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review stage file at D:/promptandpray/.claude/aiwf-native/doctrine/review.md, read IN FULL
  before the pass).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with
                          file:line and why it blocks), then non-blocking notes, then the exact next
                          action.
  Do not fix anything - you are read-only. Report only.
