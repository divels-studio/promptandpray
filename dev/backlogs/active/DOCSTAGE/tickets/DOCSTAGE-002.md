# DOCSTAGE-002 [R2 code + release] - managed stage files, migration 0033, doors re-pointed, 0.3.8

Implements: D-01, D-02, D-03, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-13.
COO: Fable - because check 1.
Branch: `main`. Depends on: DOCSTAGE-001 committed (its templates ride the migration).

## Outcome

The four stage files render as managed artifacts (D-01, D-03), the doors read them (D-06), the docs
are reduced (D-02, D-05), `/pnp:loop` is gone (D-07), D-08's bar holds; 0.3.8 cut (D-09, D-11).

## Scope

Every item is a row of the index § DOCSTAGE-002 worklist, at its `file:line`.

1. B1-B4, B15: the engine, suites, pins, collisions.
2. B5-B6, B16 migration `0033` + `migrations/index.json:33`, `.claude-plugin/plugin.json:3`, the
   live 0.3.7 -> 0.3.8 apply on a scratch copy.
3. B7-B9, B17 doors (D-06), templates, every pointer to the three docs; the exempt list is row B9's.
4. B10 docs reduced (D-02, D-05: `## Role hosts`); B11 `/pnp:loop` removed, its QA `BLOCKED` rule
   into `skills/qa/SKILL.md`; B14 retired-command allowance under `migrations/` only (D-07).
5. B12 README, CHANGELOG `## [0.3.8]` (`### Removed`, `Retires local rules:` per D-11); B13 D-08.

## Acceptance

From the repository root; the output after the dash means broken.

- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` (CI form, `dev/VERIFY_RUNBOOK.md:21-25`) - exit != 0.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- `node scripts/setup/test-setup.mjs` - exit != 0, or no case where the overrides document
  configured onto a doctrine path is a blocker (B15).
- `node scripts/update/test-update.mjs` - exit != 0.
- `claude plugin validate .` - exit != 0.
- B16 `node scripts/update/aiwf-update.mjs --apply --project-root <scratch copy>` (the fixture of
  row B16) - exit != 0, one of the four files absent, `_aiwf.managedRegions` without one of the four keys at `0.3.8`, or
  `_aiwf.lastMigrationApplied` not the 0033 id.
- B17 (`scripts/selfcheck/aiwf-selfcheck.js:7557-7573`): a door skill without its read passes, or the
  negative control is absent.
- For every door -> path pair of row B17 (work, mission, plan, review, qa, qal, arbiter, the
  CLAUDE.md region), `git grep -l --all-match -F -e "<path>" -e "IN FULL" -- <file>` - no line.
- `git grep -n "REVIEW_CHECKLIST" -- docs skills templates scripts hooks README.md` - a hit other
  than inside `docs/REVIEW_CHECKLIST.md` and the `docs/README.md` line naming the stub.
- `git grep -nE "WORKFLOW\.md|LOOP\.md|REVIEW_CHECKLIST" -- docs skills templates scripts/native README.md` - a hit off row B9's exempt list.
- `` git grep -nE "WORKFLOW\.md\` §|LOOP\.md\` §|REVIEW_CHECKLIST\.md\` §" -- docs skills templates scripts `` - a hit off row B9's exempt list.
- `git grep -n "pnp:loop" -- docs skills templates scripts hooks README.md` - any hit.
- `git ls-files skills/loop` - any line.
- B14 (`scripts/selfcheck/aiwf-selfcheck.js:7666-7679`): a `/pnp:loop` outside `migrations/` passes
  the self-check, or the negative control (a retired name planted outside `migrations/` in a scratch
  copy is reported) is absent.
- `git grep -n "Durable development history" -- scripts` - a hit naming `docs/WORKFLOW.md`.
- `git grep -n "ORCHESTRATOR_REL\|aiwf-native/ORCHESTRATOR.md" -- scripts` - read per hit: a hit
  without the four keys beside it and not named exempt in the hand-back.
- `git grep -c -i "consume" -- skills/qa/SKILL.md` - no hit (D-07's rule not moved).
- `git grep -c -F "templates/doctrine/" -- migrations` - the `0033_*/ops.json` count is not 4.
- `git grep -n -F '"version": "0.3.8"' -- .claude-plugin/plugin.json` - no hit.
- `git grep -n -F "## [0.3.8]" -- CHANGELOG.md` - no hit; `### Removed` absent from that block.
- the D-08 final output (index § Procedures) - a paragraph off the bar 1 not on the list.
- `git grep -n -i -e silerax -e stratex -e furnissimo -- CHANGELOG.md docs skills templates scripts hooks migrations` - any hit.
- the provenance grep of `dev/PROJECT_OVERRIDES.md:153-155` - any hit.
- After the record commit (D-09 sweep): `git grep -nE "WORKFLOW\.md|LOOP\.md|REVIEW_CHECKLIST" -- dev/PROJECT_OVERRIDES.md dev/VERIFY_RUNBOOK.md dev/README.md CLAUDE.md` - a hit off row B9's exempt list.

## Risk threshold

Blocks: a rule in two places or in none; a door reading a payload doc instead of the rendered file;
a managed artifact without a creating op; an additions block lost at re-render; a stage key missing
from a key set; a removed-file op invented (RESEARCH § S2 fact 12); a file removed under `docs/`; a
`/pnp:<cmd>` with no skill; a new writer or lock on `.claude/aiwf-native/**` beyond D-13's two
engines; a path or project name in the payload. Notes: wording.

## Stop condition

Stop and hand back before writing when: a rule cannot be placed by D-02/D-05; a shipped
migration's text would have to change (D-07); a file outside the Code Map must change. Stop after
the code commit; the closing half, tag and push are the COO's on the operator's words (index § Order).

## Verify

The rows' union (overrides § Test policy :151-165), once: `selfcheck`, `validate-payload`,
`setup-suite`, `update-suite`, `plugin-validate` (D-09), the example cycle if the diff touches
`scripts/ci/` or `examples/` (overrides :159) - by the COO in the background at the hand-back.
Portion 1: the Windows commands as ONE parallel batch; Portion 2: the POSIX suites under WSL only
AFTER it, not a release gate. Runbook `dev/VERIFY_RUNBOOK.md`; logs outside the repository; a
command over ~5 minutes in the background with a 3600000 ms timeout; no AI attribution in git.

## Code Map

| path | role |
|---|---|
| `scripts/setup` | 1 |
| `scripts/update` | 1, 2 |
| `scripts/selfcheck/aiwf-selfcheck.js` | 1, 3, 4 |
| `scripts/ci/run-example-cycle.mjs` | 1 |
| `scripts/engine` | 1 |
| `migrations` | 2 |
| `.claude-plugin/plugin.json` | 2 |
| `skills` | 3, 4 |
| `templates` | 3 |
| `docs` | 3, 4 |
| `scripts/native` | 3 |
| `README.md` | 4, 5 |
| `CHANGELOG.md` | 5 |
