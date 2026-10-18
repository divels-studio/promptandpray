# GENERIC-003 [R2 code] - the ledger template and seed, migration 0026, managed templates, 0.3.1

Implements: D-08 (the template half), D-09, D-10, D-11 (the pointer half), D-14, D-17.
COO: Fable - because check 1
Branch: `main`. Base: `0cf97e7` (plan-spanning). Depends on: GENERIC-001, GENERIC-002 (committed).

## Outcome

Setup and migration `0026_ledger` (0.3.1) deliver `<plansDir>/LEDGER.md` as D-08..D-10 decide;
this repository runs 0.3.1 with its key on `dev/backlogs/LEDGER.md`.

## Scope

The Writer:

1. `git mv templates/PNP_CANDIDATES.md.tmpl templates/LEDGER.md.tmpl`; its text = the fenced
   skeleton of `docs/WORKFLOW.md` § The ledger, byte for byte.
2. D-09 setup: `scripts/setup/generate.mjs:1167-1175` seeds from `LEDGER.md.tmpl`; with no
   `paths.transferSurface` in the answers it seeds `<plansDir>/LEDGER.md` and writes that key. The
   seed is an exclusive create (`flag: 'wx'`, as `applySeed`, `scripts/update/migrate.mjs:549-557`);
   `EEXIST` is reported kept, never overwritten. The fallback stays (`generate.mjs:680`); the
   schema prose `schema/aiwf.config.schema.json:309-314` and the
   comment `generate.mjs:671-674` say setup writes the key and the fallback is legacy.
3. D-09 prose: `docs/LOOP.md:134`, `docs/WORKFLOW.md:536-537`, `skills/arbiter/SKILL.md:59-60` say
   "legacy"; `:537` names `templates/LEDGER.md.tmpl`.
4. Tests that move to `LEDGER.md`: `scripts/setup/test-setup.mjs:1581`, `:1587`, `:1590-1591`,
   `:1599-1601`, `:1609-1611` (the no-key assert), `:1641-1654`, `:1796-1808`, `:1859-1870`.
5. D-10: `migrations/index.json` gains `{ "id": "0026_ledger", "targetPluginVersion": "0.3.1" }`;
   `migrations/0026_ledger/ops.json`, four ops in D-10's order, shapes of
   `migrations/0025_roadmap-seed/ops.json:5-7`; op 2 exactly `default: "docs/backlogs/LEDGER.md"`,
   `askOperator: true`, `question` naming `<plansDir>/LEDGER.md`; `NOTES.md` with 0025's three
   sections. `migrate.mjs:490-493`: `planSeedFile` tests existence BEFORE the surface refusal
   (today `:491` refuses first, `:521-527`), so a present target is `kept`.
6. D-14: `templates/CLAUDE.md.tmpl` - `## Where things are written` before `:95`, the generic form
   of `dev/PROJECT_OVERRIDES.md:290-297` (`{{config.paths.plansDir}}`, `{{config.paths.overridesDoc}}`).
7. `templates/ORCHESTRATOR.md.tmpl:160-174`: a ticket's event row goes into its `records/<REF>.md`,
   a plan-less one into the ledger; `:173-174` points at `§ The ledger`.
8. D-17: `.claude-plugin/plugin.json:3` and `README.md:22` -> 0.3.1; `CHANGELOG.md` block
   `## [0.3.1] - <date>` above `:7`, ending `Retires local rules:` with the retires names of
   `dev/backlogs/readiness/GENERIC/rule-homes.md` in the 0.3.0 convention (`CHANGELOG.md:50-53`).
9. Tests added, red then green: (t1) a fresh install with no key seeds `<plansDir>/LEDGER.md`
   byte-equal to the template and writes the key; a file appearing between plan and apply is kept;
   (t2) 0026 with the key on `<plansDir>/CANDIDATES.md` creates `LEDGER.md`, keeps `CANDIDATES.md`
   and the key; (t3) 0026 with `LEDGER.md` present keeps it; (t4) the re-rendered region carries
   `## Where things are written`; (t5) key already `<plansDir>/LEDGER.md`, file present: kept, exit 0.

The COO, after the Writer's commit, route state `{}` and the live copy refreshed (R1):

10. `/pnp:update` `--apply --no-selfcheck`; then `.claude/aiwf-native/aiwf.config.json:225` ->
    `dev/backlogs/LEDGER.md` by hand. D-11: the pointer lines
    `dev/backlogs/CANDIDATES.md:7-9` move to `LEDGER.md` § Plans, `:10` to the plan-less rows;
    GENERIC's own `## Plans` line is written there (D-08).
11. D-14 local half: `dev/PROJECT_OVERRIDES.md:290-297` keeps only its project lines.

Out of scope: the fallback's name, the 0011 promise, history files, `examples/`.

## Acceptance

From the repository root; the output after the dash means broken.

- `git grep -c -F "LEDGER.md.tmpl" -- scripts/setup/generate.mjs` - no output.
- `git grep -c -i -F "pnp_candidates" -- schema scripts/engine scripts/update scripts/selfcheck` - other
  than `0cf97e7`'s: schema 2, guard 3, `test-update.mjs` 2, `validate-payload.mjs` 1, selfcheck 5.
- `git grep -c -i -F "legacy" -- docs/LOOP.md docs/WORKFLOW.md skills/arbiter/SKILL.md` - a file missing.
- `git grep -c -F "0.3.1" -- .claude-plugin/plugin.json README.md migrations/index.json` - a file missing.
- `git grep -n -E "^## \[0\.3\.1\]" -- CHANGELOG.md` - no output.
- `git grep -c -F "## Where things are written" -- templates/CLAUDE.md.tmpl CLAUDE.md` - a file missing (after item 10).
- `git grep -c -F "records/<REF>.md" -- templates/ORCHESTRATOR.md.tmpl` - no output.
- `node scripts/update/aiwf-update.mjs --check --project-root .` after item 10 - exit != 0.
- `git grep -c -F "dev/backlogs/LEDGER.md" -- .claude/aiwf-native/aiwf.config.json` - no output.
- `git grep -c --untracked -F "RBC:" -- dev/backlogs/LEDGER.md` - no output.
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md` - any hit.

## Risk threshold

Blocks: the fallback renamed; D-10's op order changed; a managed template without its op; an
operator file overwritten; a test weakened, not moved; `CANDIDATES.md` rows rewritten.

## Stop condition

Stop after the record commit. A test that can only be weakened goes to the COO.

## Verify

At the handoff, once, in the background: `node scripts/update/validate-payload.mjs --plugin-root .`,
`node scripts/setup/test-setup.mjs`, `node scripts/update/test-update.mjs`. After items 10-11, once:
`node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` (its version-stamp,
`aiwf-selfcheck.js:5933`, is red until the apply). Any exit != 0 is broken.

## Code Map

| path | role in this ticket |
|---|---|
| `templates/` | items 1, 6, 7 |
| `scripts/setup/` | items 2, 4, 9 |
| `schema/aiwf.config.schema.json` | item 2 |
| `scripts/update/` | items 5, 9 |
| `docs/` | items 1, 3 |
| `skills/arbiter/SKILL.md` | item 3 |
| `migrations/` | item 5 |
| `CHANGELOG.md` | item 8 |
| `dev/backlogs/` | item 10 |
| `dev/PROJECT_OVERRIDES.md` | item 11 |
