# GATES-005 [R2 code + release] - release 0.3.12: migration 0037, the bump, the changelog, the self-install

Implements: D-10, D-11.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: GATES-001 .. GATES-004
committed.

## Outcome

0.3.12 is cut (D-10): migration `0037` re-renders every managed template the plan's commits changed
and carries one `note`; `plugin.json` says 0.3.12; the `CHANGELOG.md` block ends with the
`Retires local rules:` line for the Stratex sentence; this repository runs on 0.3.12 through the
self-install.

## Scope

1. `migrations/0037_<slug>/ops.json` and `NOTES.md`, on the model of
   `migrations/0036_planning-briefs-and-verify-owner/ops.json:1-17`: one `rerender-managed-region` op
   per managed template in `git diff --name-only <GATES-001 dispatch HEAD>..HEAD -- templates` - by the
   worklists, `templates/ORCHESTRATOR.md.tmpl` (-> `.claude/aiwf-native/ORCHESTRATOR.md`, GATES-001)
   and `templates/doctrine/plan.md.tmpl` (-> `.claude/aiwf-native/doctrine/plan.md`, GATES-003);
   `templates/briefs/planner.md` is read from the payload, a `docRefs` entry as in 0036 `:14`, not an
   op; then one `note` op naming the four mechanisms. No `reconcile-ask-ruleset` op (D-01).
2. `migrations/index.json:37`: the `0037_<slug>` entry after it, `targetPluginVersion` `0.3.12`.
3. `.claude-plugin/plugin.json:3`: `0.3.12`.
4. `CHANGELOG.md`: the `## [0.3.12]` block on top, in the format of root `CLAUDE.md` § Changelog
   format - one entry per ticket GATES-001 .. GATES-004 under that format's `###` sections; its last
   line `Retires local rules: plan.md § project additions: Side-by-side tickets` (D-10).
5. `README.md` § Status: kept true for 0.3.12 (overrides § Status and release artifacts).
6. Not the Writer's: the self-install `/pnp:update --apply` (the COO, on the operator's word); the
   rendered copies under `.claude/` move by it, never by hand.

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken.

- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- `git grep -n -F '"version": "0.3.12"' -- .claude-plugin/plugin.json` - no hit.
- `git grep -n -F '"targetPluginVersion": "0.3.12"' -- migrations/index.json` - no hit, or a hit not on
  the `0037_` line.
- For each managed template in `git diff --name-only <GATES-001 dispatch HEAD>..HEAD -- templates`:
  `git grep --untracked -c -F "<that template path>" -- "migrations/0037_*/ops.json"` - no line (a
  count of 0 prints nothing; `--untracked` because the `0037` files are untracked at the hand-back,
  and a plain `git grep` would not search them).
- `git grep --untracked -c -F "reconcile-ask-ruleset" -- "migrations/0037_*/ops.json"` - any line.
- `git grep -n -F "## [0.3.12]" -- CHANGELOG.md` - no hit.
- `git grep -n -F "Retires local rules: plan.md § project additions: Side-by-side tickets" -- CHANGELOG.md` - no hit.
- After the self-install: `_aiwf.lastMigrationApplied` in `.claude/aiwf-native/aiwf.config.json` not
  the `0037_<slug>` id; its embedded selfcheck - a `FAIL` line or exit != 0;
  `git grep -c -F "Side by side:" -- .claude/aiwf-native/doctrine/plan.md` - no line.
- `git grep -n -i -e silerax -e stratex -e furnissimo -- CHANGELOG.md docs skills templates scripts hooks migrations` (tracked files) - any hit.
- `git grep --untracked -n -i -e silerax -e stratex -e furnissimo -- "migrations/0037_*"` (the untracked new files) - any hit.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: a managed template changed by the plan with no re-render op; an op outside the vocabulary
(overrides § Data, tenancy and access control); a shipped migration's text changed; a removed-rule op
for the kept `git -C` ask rules (D-01); `index.json` not monotonic or its last entry not the payload
version; a rendered `.claude/` copy edited by hand; a consumer project name in the payload. Notes:
changelog wording, the slug.

## Stop condition

Stop and hand back before writing when: a changed template has no managed destination; a shipped
migration would have to change; a file outside the Code Map must change. Stop after the hand-back;
the release commit, the self-install, the record commit, the tag word and the push word are the
COO's, each on the operator's word or click (index § Order and gates).

## Verify

D-11's release row (overrides § Test policy): `validate-payload` (`node
scripts/update/validate-payload.mjs --plugin-root .`, cwd `.`) once by the COO at the hand-back, then
the self-install `/pnp:update --apply` on this repository with its embedded selfcheck. Portion 1 only;
no suite beyond these (CI runs the full set after the push); runbook `dev/VERIFY_RUNBOOK.md`; logs
outside the repository.

## Code Map

| path | role |
|---|---|
| `migrations` | 1 |
| `migrations/index.json` | 2 |
| `.claude-plugin/plugin.json` | 3 |
| `CHANGELOG.md` | 4 |
| `README.md` | 5 |
| `.claude/aiwf-native` | 6 (the COO's apply) |
