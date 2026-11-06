# GATES-005 - release 0.3.12: migration 0037, the bump, the changelog, the self-install

## What landed

`235a4ed` (release, Writer, `Refs: GATES-005`; 6 files, +154/-10):
- `migrations/0037_habit-gates-and-codex-output/ops.json` - two `rerender-managed-region` ops
  (`.claude/aiwf-native/ORCHESTRATOR.md` <- `templates/ORCHESTRATOR.md.tmpl`,
  `.claude/aiwf-native/doctrine/plan.md` <- `templates/doctrine/plan.md.tmpl`) and one `note`
  (`habit-gates-and-codex-output-0-3-12`, docRefs incl. `templates/briefs/planner.md` and
  `scripts/native/codex-capture.mjs`); no `reconcile-ask-ruleset` (D-01). `NOTES.md` on 0036's structure.
- `migrations/index.json` - the 0037 entry, `targetPluginVersion` 0.3.12.
- `.claude-plugin/plugin.json` - 0.3.12.
- `CHANGELOG.md` - the `## [0.3.12] - 2026-11-06` block: Added GATES-003, Changed GATES-001 and GATES-004,
  Fixed GATES-002; last line `Retires local rules: plan.md § project additions: Side-by-side tickets`.
- `README.md` § Status - v0.3.12, Gate 1 outside the root, the plan gate's side-by-side refusal, the wrappers'
  output; COO direct edits: the `git -C` wording (correction round 1) and the stale consumer-installation
  bullet.

The close commit carries the self-install (`/pnp:update --apply`, COO): `.claude/aiwf-native/ORCHESTRATOR.md`,
`.claude/aiwf-native/doctrine/plan.md` re-rendered, `.claude/aiwf-native/aiwf.config.json` stamped 0.3.12 /
0037. The live copy `D:\pnp-live` was refreshed to `235a4ed` after the release commit.

## Decisions and deviations

- The base for "templates the plan changed" is `ba3f666` (the commit before GATES-001's code; it touched only
  the self-install config): three templates, two managed, `planner.md` a docRef.
- README § What is not here yet: the "One consumer installation so far ... 0.1.0 to 0.1.2" bullet was stale;
  the COO read `installedPluginVersion` "0.3.11" in two consumer projects' configs and rewrote it without names.
- Correction round 1 (prose): the release text said the habit guard denies EVERY `git -C`; it now says a
  `git -C` that opens a command, and that one deeper inside a segment is not read (DECISIONS § Deferred).
- No `Retires` for a PnP-local rule: this repository's own `plan.md` additions block carried none.

## Events

None.

## Verification (what actually ran)

COO, logs outside the repository (session scratchpad `verify-gates005\`):
- `node scripts/update/validate-payload.mjs --plugin-root .` exit 0, `valid: 37 migration(s) in
  D:\promptandpray, payload version 0.3.12` - at the hand-back and after round 1.
- Acceptance greps: `"version": "0.3.12"` at `.claude-plugin/plugin.json:3`; `"targetPluginVersion": "0.3.12"`
  at `migrations/index.json:38` (the 0037 line); `templates/ORCHESTRATOR.md.tmpl`,
  `templates/doctrine/plan.md.tmpl`, `templates/briefs/planner.md` each `:1` in 0037 ops.json;
  `reconcile-ask-ruleset` no line; `## [0.3.12]` at `CHANGELOG.md:7`; the Retires line at `CHANGELOG.md:63`;
  consumer names (tracked payload + README, and the untracked 0037) no hit; provenance no hit; "every `git -C`"
  / "any `git -C" no hit after round 1.
- Self-install, on the operator's dialog word "Пускай": `aiwf-update.mjs --check` exit 1 (`0.3.11 -> 0.3.12`,
  one migration pending); `--dry-run` exit 0, 3 operations planned; `--apply` exit 0, `updated: 0.3.11 ->
  0.3.12, 3 operation(s) applied.`, `self-check: PASS - ==== 1756/1756 assertions passed ====`. After it:
  `_aiwf.lastMigrationApplied` = `0037_habit-gates-and-codex-output`; `Side by side:` 1 in
  `.claude/aiwf-native/doctrine/plan.md`.
- Fact-check gate (`/pnp:review` Step 2b, one Explore agent on sonnet): `CLAIMS: total=94 verified=89 false=0
  unverifiable=5` - closed: the PS 5.1 re-encoding is GATES-004's D0 measurement; the consumer versions read by
  the COO; "no installation elsewhere is known" worded as knowledge.
- Auditor: Codex code pass 1 (gpt-6-sol / xhigh, cold, session `01a1b1bf-5bd6-7af2-a268-e1939df1c858`), covered
  by the operator word "пускай тук имаме ресурс" (2026-11-06): `fail`, one blocker - the "every `git -C`" claim
  (the guard reads the first word of a segment only, `pretooluse-git-verb-guard.js:670-682`); no other finding;
  its read-only update preview planned both re-renders with additions carried. `codex-review: tokens used
  92,328` (the new wrapper's line; stdout was the verdict only). The review brief: `GATES-005-review-brief.md`.
- Correction round 1 (prose only) - no verification pass (`ticket.md` § Loop shape): the COO edited
  `CHANGELOG.md` and `README.md`, the Writer 0037 `NOTES.md` and the note text; the COO re-ran validate-payload
  and the greps.
- Archive grep for rule-class points without a pointer row: `grep -i -E "operator rule|from now on|standing
  rule|a rule:"` over `PLAN_GATES.md` and `DECISIONS.md` - no hit; positive control, the same pattern over the
  archive - `014_PLAN_HARD_2026-10-17.md` 11 hits.

## Remaining debt

None.

## Diff review

- Read whole at the hand-back (6 files) and again after round 1.
- Per acceptance criterion, the defect each proof sees: an invalid migration set -> validate-payload exit != 0;
  a missing bump -> no plugin.json hit; a non-monotonic index -> no 0.3.12 hit on the 0037 line or a validate
  failure; a changed template without its op -> a template with no line in 0037 ops.json; a removed-rule op ->
  a `reconcile-ask-ruleset` line; a missing block or Retires line -> no CHANGELOG hit; a consumer name or
  Cyrillic -> a hit; a broken apply -> `lastMigrationApplied` not 0037, a selfcheck FAIL, no `Side by side:` in
  the rendered plan.md.
- Notes: the CHANGELOG link references stop at 0.2.6 (pre-existing); README line 100 runs past the wrap width.

## Scratch

- `.aiwf/GATES-005-diff-review.md` - folded into § Diff review, § Verification and § Decisions above, then
  deleted.
- `.aiwf/GATES-005-review-brief.txt` - moved verbatim to `records/GATES-005-review-brief.md`, then deleted.
- `.aiwf/last-review-session.GATES-005.txt` - its one line (the session id) stands in § Verification above,
  then deleted.
- `.aiwf/checkpoint.md` and `.aiwf/route-state.json` (cleared to `{}`) stay.

## Closing checklist

- the operator's own run on a real input: n/a - no product UI; the release is proven by the self-install's
  embedded selfcheck;
- the diff review folded in above: yes;
- roadmap: § GATES (every item done) leaves the roadmap with its only plan archived; § CODEX's three output
  lines were marked `done 6984415` at GATES-004, its Plans line points at the archive and its Status returns
  to `idea` for the items that stay;
- out-of-scope findings: none;
- scratch: § Scratch above;
- the plan: every ticket closed - archived in the same commit as `archive/019_PLAN_GATES_2026-11-06/`;
- next: the tag word and the push word (the tag `v0.3.12` created locally on the record commit, pushed with
  `main` in one push), then the operator's comment on the selfcheck.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 1 | 410,000 tokens (41% of 1,000,000) | `~/.claude/ctx/d66182c6-af54-42f8-9eda-e0fcdd8ed037.pct` and `.size` |
