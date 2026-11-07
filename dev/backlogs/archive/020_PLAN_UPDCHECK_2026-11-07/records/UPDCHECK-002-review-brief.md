# UPDCHECK-002 - review brief (moved from `.aiwf/UPDCHECK-002-review-brief.txt` at the close)

One pass, cold, Codex code row (gpt-6-sol / xhigh), session `01a1b577-aca8-7202-9ff0-9f1cea6b6e1f`,
`codex-review: tokens used 90,474`. Verdict `fail` with one blocker; closed by correction round 1 (prose only,
no verification pass - `records/UPDCHECK-002.md` § Decisions).

## The brief

```text
COVERED BY: operator word "пускай тикета", 2026-11-07
Review the diff for ticket UPDCHECK-002 on branch main.

Class: code
Ticket: UPDCHECK-002

SCOPE / DIFF:
The working tree of D:\promptandpray over HEAD 936dc0e7595220af9d3c6335a43e8d0d0d3b6123. Reproduce it with
`git status --short` and `git diff` (nine tracked files), plus the two UNTRACKED files read whole:
`migrations/0038_selfcheck-scope/ops.json` and `migrations/0038_selfcheck-scope/NOTES.md`.
The ticket is release 0.3.13 of the plugin: the prose and the migration for the engine change that
UPDCHECK-001 already committed in 9347fd9 (`git show 9347fd9 --stat`), which is NOT under review again -
review THIS diff against it. The ticket contract: `dev/backlogs/active/UPDCHECK/tickets/UPDCHECK-002.md`;
decisions D-06, D-09, D-10, D-11 in `dev/backlogs/active/UPDCHECK/DECISIONS.md`; what 001 shipped:
`dev/backlogs/active/UPDCHECK/records/UPDCHECK-001.md` § What landed.

Files and their actors:
- Writer: `.claude-plugin/plugin.json` (bump to 0.3.13), `migrations/index.json` (the 0038 entry),
  `migrations/0038_selfcheck-scope/ops.json` (ONE `note` op, no re-render op - D-10), `NOTES.md`.
- COO (prose, overrides § Hard rules "Prose in the payload is R1"): `skills/update/SKILL.md` Step 4,
  `skills/setup/SKILL.md` Step 4, `skills/selfcheck/SKILL.md` (intro, Step 1, Step 2),
  `scripts/selfcheck/README.md`, `README.md` (Status, the self-check bullet, the consumer line, the
  setup paragraph), `CHANGELOG.md` (the 0.3.13 block), `dev/VERIFY_RUNBOOK.md` :21-25.

What to judge: (1) the migration is well-formed for the update engine (`scripts/update/` - the op
vocabulary, `validate-payload.mjs`, the manifest's monotonicity) and carries nothing it must not
(no re-render: no managed template changed since 936dc0e - verify with `git diff 936dc0e --stat -- templates`,
expected empty); (2) the prose describes EXACTLY what the engine does - no claim beyond
`scripts/selfcheck/aiwf-selfcheck.js` and `scripts/selfcheck/run-selfcheck.mjs` as committed, no time
bound promised (D-09), the full-run command of `skills/selfcheck/SKILL.md` Step 1 unchanged (D-02);
(3) the release texts are honest about what the embedded run no longer proves (D-06); (4) the
CHANGELOG block follows the repository's format (one block per version, `### Changed`, bold title with
the ticket id, `Retires local rules: none` as its last line); (5) the diff stays inside the ticket's
Code Map (no change under `examples/`, `scripts/ci/`, `.github/`, `dev/PROJECT_OVERRIDES.md`).

CARRIED BLOCKERS
none - this is pass 1

EVIDENCE PACK (a selection by the audited side - read past it):
- `runProjectScope` order: `scripts/selfcheck/aiwf-selfcheck.js:10079-10083` (PROJECT PLAN NAMING -> PROJECT LAYER -> COMMIT AUTOMATION); full scope's tail `:10156-10159` (COMMIT AUTOMATION, COMMIT AUTOMATION CONTROLS, NEGATIVE CONTROLS, SCOPE CONTROLS).
- Section titles: `:1275` PROJECT PLAN NAMING, `:7524` PROJECT LAYER, `:8036` COMMIT AUTOMATION, `:8056` COMMIT AUTOMATION CONTROLS, `:9917` NEGATIVE CONTROLS, `:9997` SCOPE CONTROLS.
- Header lines: `:10111` `scope`, `:10112` the host line `(not probed: project scope)`.
- The embedded spawn argv `scripts/selfcheck/run-selfcheck.mjs:62`; the PASS suffix `:101`; the contract text `:13-19`.
- Callers of `finishWithSelfCheck`: `scripts/update/aiwf-update.mjs`, `scripts/setup/interview.mjs`, `scripts/setup/generate.mjs`, `scripts/setup/aiwf-roles.mjs` (the plan's closing grep set 1 in `dev/backlogs/active/UPDCHECK/PLAN_UPDCHECK.md`).
- Migration model: `migrations/0037_habit-gates-and-codex-output/ops.json` and `NOTES.md`; the op vocabulary and manifest rules: `dev/PROJECT_OVERRIDES.md` § Data, tenancy and access control; `scripts/update/validate-payload.mjs`.
- COO acceptance run (2026-11-07): `node scripts/update/validate-payload.mjs --plugin-root .` exit 0 `valid: 38 migration(s) ... payload version 0.3.13`; `"version": "0.3.13"` at `.claude-plugin/plugin.json:3`; `"targetPluginVersion": "0.3.13"` at `migrations/index.json:39`; `"op": "note"` count `:1` and no `rerender` in 0038 ops.json; `## [0.3.13]` at `CHANGELOG.md:7`, `Retires local rules: none` at `:33`, `## [0.3.12]` at `:35`; Step 1 of the selfcheck skill still carries the full argv without `--scope` (node probe exit 0); guard diff over examples/scripts/ci/.github/overrides empty; consumer-name and Cyrillic greps no hit.
- The two consumer projects' installed versions (README "both on 0.3.11 when 0.3.13 was cut") were read by the COO in their configs on this machine - not verifiable from this tree; treat as the COO's reading.
- A fact-check scan (sonnet) over the prose ran before this pass; its FALSE rows were fixed in the tree you see.

PRODUCT BOUNDARY CHECKS:
Payload stays generic: no origin-project names, no Cyrillic, no absolute paths (the provenance section of the self-check is the gate)
A managed-artifact change ships as a migration + version bump, never silently
Every operator gate that can be a native dialog is a native dialog

RISK THRESHOLD: block on a re-render op or an op outside the vocabulary; a shipped migration's text changed; `index.json` not monotonic or its last entry not the payload version; a skill or changelog claim the engine does not implement, or a promised time bound (D-09); Step 1's full argv changed (D-02); a documented command added to `examples/`; a rendered `.claude/` copy edited by hand; a consumer project name or Cyrillic in the payload. Note-only: wording, the slug, the ordering of bullets.
STOP CONDITION: stop once every changed file is reviewed against the ticket's Acceptance and the five points above; do not propose redesigns of the self-check or of the release process; do not re-review 9347fd9's code beyond what the prose claims about it.
BUDGET TARGET: keep the brief dense and return ALL material blockers in ONE round - aim for a single round. (This is a throughput target only; it does NOT change the authority minimums - the correction-round cap and the `review.plan.passes` ceiling are unchanged.)

OUTPUT CONTRACT (single round - return ALL material blockers at once; a later round may not raise a blocker that was already visible):
  First line: exactly one of `pass` / `pass-with-notes` / `fail`
  (per the review stage file at D:/promptandpray/.claude/aiwf-native/doctrine/review.md, read IN FULL before the pass).
    - `pass`            = no blocker at or above the risk threshold; nothing left to note.
    - `pass-with-notes` = acceptable now; only narrow, local, non-blocking notes remain.
    - `fail`            = at least one blocker at/above threshold. List blockers first (each with file:line and why it blocks), then non-blocking notes, then the exact next action.
  Do not fix anything - you are read-only. Report only.
```

## The verdict (the wrapper's stdout, verbatim)

```text
fail

**Blocker — operator guidance (P2):** `skills/update/SKILL.md:102-105` and `skills/setup/SKILL.md:144-147` say a red embedded self-check can be caused by a missing bash or PowerShell host. The embedded run uses `--scope project`, which probes neither host; the preceding bullets correctly say host problems surface at the full audit. This gives operators a false diagnosis for a failed write check, so it is more than wording polish.

Non-blocking notes: none. The migration validates, contains one `note` and no re-render, and the version, scope, and full-run command checks pass.

**Next action:** Correct both Step 4 failure bullets to describe the project-scope failure without naming a missing bash or PowerShell host, then resubmit the diff for review.
```

stderr: `codex-review: run cold, class code, model gpt-6-sol, effort xhigh`; `codex-review: tokens used 90,474`;
`codex-review: log <temp>/pnp-codex/UPDCHECK-002-code-20261107-120440-9452.log`; `codex-review: exit 0, session
01a1b577-aca8-7202-9ff0-9f1cea6b6e1f`.
