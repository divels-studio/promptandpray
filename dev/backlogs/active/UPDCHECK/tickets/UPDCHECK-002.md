# UPDCHECK-002 [R2 prose + release] - release 0.3.13: the skills' prose, migration 0038, the bump, the changelog, the timed self-install

Implements: D-06, D-09, D-10, D-11.
COO: Fable - because check 1.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: UPDCHECK-001 committed (the
prose describes its flag, its section titles and its PASS line).

## Outcome

The operator-facing texts say what the embedded self-check proves after a write and what it no longer
proves (D-06); 0.3.13 is cut with one `note` migration, the bump and a `CHANGELOG.md` block ending
`Retires local rules: none` (D-10); this repository runs on 0.3.13 through the self-install, whose
embedded project-scope self-check is the release's proof (D-11), timed against the 701 s full run
(D-09).

## Scope

The worklist; every row at its `file:line`. Actors: the Writer writes R6 and the `plugin.json` bump
of R7 only, then hands back; the COO writes R1-R5, the `CHANGELOG.md` block of R7 and R8 in the
main session after that hand-back (overrides § Hard rules, "Prose in the payload is R1",
`dev/PROJECT_OVERRIDES.md:38`); one release commit by the COO through its dialog.

- R1 (COO) `skills/update/SKILL.md:87-104` (Step 4): the embedded run is the project scope - the rendered
  artifacts, the config, the version stamps, the ownership bookkeeping (D-01); no hook, wrapper,
  resolver or host execution and no payload negative control, so a missing bash or PowerShell shows
  first at the first audit; the PASS line ends `(project layer only - run \`/pnp:selfcheck\` for the
  full check)` (UPDCHECK-001 B1); `/pnp:selfcheck` runs the full check.
- R2 (COO) `skills/setup/SKILL.md:131-146` (Step 4): the same, for the install.
- R3 (COO) `skills/selfcheck/SKILL.md`: `:9-10` names the two scopes; Step 1 `:26-38` - the command at
  `:28-31` stays the full form (D-02), a paragraph adds `--scope project|full` (absent = `full`,
  `project` = the project layer only, any other value exit 2, D-03) and says setup, update and
  `/pnp:roles` run `--scope project` after a write (D-05); `:51-59` says the full run proves it and the
  embedded run does not.
- R4 (COO) `scripts/selfcheck/README.md`: the section list `:27-30` gains `PROJECT PLAN NAMING`,
  `COMMIT AUTOMATION CONTROLS` and `SCOPE CONTROLS`; `:32-34` says the shared step passes `--scope project`; the usage line `:37`
  gains `[--scope project|full]`.
- R5 (COO) `README.md:185`: setup finishes with the project-layer self-check; § Status `:20` kept true for
  0.3.13 (overrides § Status and release artifacts).
- R6 (Writer) `migrations/0038_<slug>/ops.json` and `NOTES.md`, on the model of
  `migrations/0037_habit-gates-and-codex-output/ops.json:1-14` - one `note` op only, no re-render op
  (no managed artifact changes, D-10), `docRefs` naming the changed payload files;
  `migrations/index.json:38`: the `0038_<slug>` entry after it, `targetPluginVersion` `0.3.13`.
- R7 (Writer) `.claude-plugin/plugin.json:3`: `0.3.13`. (COO) `CHANGELOG.md:7`: the `## [0.3.13] - <date>` block
  above it, format of root `CLAUDE.md` § Changelog format - the UPDCHECK-001 entry under `### Changed`;
  its last line `Retires local rules: none` (D-10).
- R8 (COO) `dev/VERIFY_RUNBOOK.md:21-25`: the self-install apply's embedded self-check proves the project
  scope (PROJECT LAYER with its version-stamp row), not the whole fixture form.
- Unchanged: `docs/LOOP.md:74`, `:114`, `:157`, `docs/CODEX_REVIEW_QA_RECIPE.md:201`,
  `docs/WORKFLOW.md:57-58` (they describe the full run, still true, D-02); `examples/`,
  `scripts/ci/run-example-cycle.mjs:57-65` (no documented command added); `dev/PROJECT_OVERRIDES.md`
  § Test policy text (D-11).
- Not the Writer's: R1-R5, the `CHANGELOG.md` block of R7 and R8 (the COO's prose, after the
  Writer's hand-back); the release commit (the COO, through its dialog); the self-install
  `/pnp:update --apply` (the COO, on the operator's word), timed from outside the process; the
  rendered copies under `.claude/` move by it, never by hand.

## Acceptance

From the repository root, on the Bash tool; the output after the dash means broken.

- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- `git grep -n -F '"version": "0.3.13"' -- .claude-plugin/plugin.json` - no hit.
- `git grep -n -F '"targetPluginVersion": "0.3.13"' -- migrations/index.json` - no hit, or a hit not
  on the `0038_` line.
- `git grep --untracked -c -F '"op": "note"' -- "migrations/0038_*/ops.json"` - anything but `:1`.
- `git grep --untracked -c -F '"op": "rerender' -- "migrations/0038_*/ops.json"` - any line.
- `git grep -n -F -e "## [0.3.13]" -e "## [0.3.12]" -e "Retires local rules:" -- CHANGELOG.md` - no
  `## [0.3.13]` hit, or the hit just before `## [0.3.12]` not `Retires local rules: none`.
- `git grep -c -F "project layer only" -- skills/update/SKILL.md skills/setup/SKILL.md` - a file with
  no line.
- `git grep -c -F -e "--scope" -- skills/selfcheck/SKILL.md scripts/selfcheck/README.md` - a file
  with no line.
- `git diff <guard HEAD> -- examples scripts/ci .github dev/PROJECT_OVERRIDES.md`, the guard hash
  substituted literally by the COO at the dispatch - exit != 0, or any output.
- Step 1 keeps the full form (D-02): `node -e "const t=require('fs').readFileSync('skills/selfcheck/SKILL.md','utf8');const s=(t.split('## Step 1')[1]||'').split('## Step 2')[0];const b=s.split('\x60\x60\x60')[1]||'';process.exit(b.includes('aiwf-selfcheck.js')&&!b.includes('--scope')?0:1)"`
  (Step 1's first fenced block, today `:28-31`) - exit != 0.
- After the self-install (the COO): `_aiwf.lastMigrationApplied` in
  `.claude/aiwf-native/aiwf.config.json` not the `0038_<slug>` id; the apply exit != 0, or its
  self-check line not `self-check: PASS - ==== P/T assertions passed ==== (project layer only - ...)`;
  `records/UPDCHECK-002.md` without both wall times and the command of each (D-09).
- `git grep -n -i -e silerax -e stratex -e furnissimo -- CHANGELOG.md README.md docs skills templates scripts hooks migrations` - any hit; the same with `--untracked` over `"migrations/0038_*"` - any hit.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: a re-render op, or an op outside the vocabulary (overrides § Data, tenancy and access
control); a shipped migration's text changed; `index.json` not monotonic or its last entry not the
payload version; a skill promising a time bound (D-09); Step 1's full argv changed; a documented
command added to `examples/`; a rendered `.claude/` copy edited by hand; a consumer project name in
the payload. Notes: wording, the slug.

## Stop condition

Stop and hand back before writing when: a changed payload file turns out to be a managed template; a
shipped migration would have to change; the prose needs a fact UPDCHECK-001 did not ship (read it at
the guard HEAD); a file outside the Code Map must change. The Writer stops after R6 and the
`plugin.json` bump and hands back, writing none of the prose rows; the prose, the release commit, the
timed self-install, the record commit, the tag word and the push word are the COO's, each on the
operator's word or click (index § Order and gates).

## Verify

D-11's release row (overrides § Test policy): `validate-payload` (`node
scripts/update/validate-payload.mjs --plugin-root .`, cwd `.`) once by the COO at the hand-back, then
the self-install `/pnp:update --apply` on this repository with its embedded self-check, timed (D-09:
before = 701 s, the full fixture-form run of 2026-11-06, ROADMAP § UPDCHECK; after = this apply).
Portion 1 only; no suite locally (CI runs the full set after the push); runbook
`dev/VERIFY_RUNBOOK.md`; logs outside the repository.

## Code Map

| path | role |
|---|---|
| `skills/update/SKILL.md` | R1 (COO) |
| `skills/setup/SKILL.md` | R2 (COO) |
| `skills/selfcheck/SKILL.md` | R3 (COO) |
| `scripts/selfcheck/README.md` | R4 (COO) |
| `README.md` | R5 (COO) |
| `migrations` | R6 (Writer) |
| `migrations/index.json` | R6 (Writer) |
| `.claude-plugin/plugin.json` | R7 (Writer) |
| `CHANGELOG.md` | R7 (COO) |
| `dev/VERIFY_RUNBOOK.md` | R8 (COO) |
| `.claude/aiwf-native` | the COO's apply |
