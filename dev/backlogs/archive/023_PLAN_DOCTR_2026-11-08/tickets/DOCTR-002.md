# DOCTR-002 [R2 code + release] - release 0.3.16: migration 0041, the note, the bump, the changelog; the roles note of D-04

Implements: D-01, D-04, D-20, D-21, D-25.
COO: Opus - because all four no.
Escalation: none - the migration only re-renders managed artifacts under the two-hash bookkeeping its precedents 0033 and 0036 already exercise and carries no other op; no fail direction flips (SEEDFS/D-14), no ask-rule or access-policy rule moves, the blast radius is the release the plan names, and no two roles disagree in writing.
Branch: `main`. Depends on: DOCTR-001 committed (its templates are what the ops render; its record names its commit, `<001>` below). Scope guard: `HEAD <hash>` at the dispatch.

## Outcome

Release 0.3.16 ships 001's templates to every installation (D-01): migration `0041_doctrine-wording`
re-renders exactly the managed files whose templates 001 changed, in the 0036 op shape, and carries
one `note` whose `supersedes` names the retired dialog rule (D-20, `migrations/README.md:78-84`); the
manifest's last entry and `.claude-plugin/plugin.json` say 0.3.16; the note `/pnp:roles --show`
prints for the plan row, its pin and its sample line say "a reversed operator decision" (D-04's
code consumer); the COO's `CHANGELOG.md` block ends with the Retires line, and `README.md:22` names
the version. One code commit carries all of it. Shipped migrations are untouched.

## Scope

Every anchor at HEAD `58fa73b`; re-read at the guard HEAD.

Writer:

- W1 `migrations/0041_doctrine-wording/ops.json` (new): `"migration": "0041_doctrine-wording"`,
  `"targetPluginVersion": "0.3.16"`, and these six operations, one line each, in the shape of
  `migrations/0036_planning-briefs-and-verify-owner/ops.json:5-9`:
  `{ "op": "rerender-managed-region", "file": ".claude/aiwf-native/ORCHESTRATOR.md", "region": null, "template": "templates/ORCHESTRATOR.md.tmpl" }`;
  the same for `.claude/aiwf-native/doctrine/work.md`, `ticket.md`, `plan.md` with
  `templates/doctrine/<stage>.md.tmpl`;
  `{ "op": "rerender-managed-region", "file": ".claude/agents/writer.md", "region": null, "template": "templates/agents/writer.md.tmpl" }`
  (the form of `0036/ops.json:8`; D-21); and
  `{ "op": "rerender-managed-region", "file": "CLAUDE.md", "region": "aiwf-core", "template": "templates/CLAUDE.md.tmpl#aiwf-core" }`
  (the form of `migrations/0033_doctrine-stages/ops.json:9`). No `createIfAbsent`, no `ifRecorded`:
  the six files exist on every installation since 0.3.8. The list is the A2 command's output
  (Acceptance); a template in that output with no op, or an op without it, is a stop.
  Then one `note`: `"id": "doctrine-wording-0-3-16"`; `"text"` - one paragraph naming, in plain
  words, each rule 001 wrote (the R3 migration wording; the pass-2 trigger and its revision dual; the
  expected red set; the `E2E` and `Escalation` brief lines; the default tree; the narrowed word; the
  unrequired pass; the enumeration sentence; the "user sees less" stop; the roadmap line's problem
  and its nested-list close; readiness classes 17 and 18; the exempt list; the live-Writer resume;
  the question dialog as rule 9; the CHANGELOG's language; the visible-outcome waiver; check 2 after
  the discovery scan; the E2E run before the code audit; the Writer agent's CHANGELOG clause), then
  that the two seeds changed
  (`templates/PROJECT_OVERRIDES.md.tmpl`'s pass-2 line, `templates/ROADMAP.md.tmpl`'s quote form)
  reach no installed copy, then which files this update re-renders with every additions block
  carried, then that an overrides document carrying the dialog rule may delete it on its operator's
  word, then - because D-13 adds a stop for the operator's word - the word-gate sentence of
  `migrations/README.md:86-90`, VERBATIM:
  `If this release introduces a word-gate: check your local rules for self-initiated dispatch or remediation - a rule written before this gate may contradict it.`;
  `"docRefs": ["CHANGELOG.md", "docs/READINESS_CLASSES.md", "templates/PROJECT_OVERRIDES.md.tmpl", "templates/ROADMAP.md.tmpl"]`;
  `"supersedes": ["question-to-the-operator-is-a-dialog"]` - the one consumer-local duplicate the
  NOTES name (`migrations/README.md:78-84`: one id per hit).
- W2 `migrations/0041_doctrine-wording/NOTES.md` (new), the sections of
  `migrations/0040_seed-containment/NOTES.md`: `# 0041_doctrine-wording`, `## What changes` (the
  rules of the note, per stage file and the Writer agent, each with its home heading),
  `## What this migration does` (the six operations by file, the one `note` by id),
  `## What it leaves alone` (every config key, the ask-ruleset, every operator-owned file - the
  installed overrides document and roadmap included, seeds written once; the Reviewer and QA agents,
  `AGENTS.md`, `review.md` - their templates did not change), `## Superseded local rules` (the dialog rule in an overrides document's
  § Communication, its id, and that the CHANGELOG's Retires line names it).
- W3 `migrations/index.json:41`: a comma after the 0040 entry and a new last entry
  `{ "id": "0041_doctrine-wording", "targetPluginVersion": "0.3.16" }` before `]` (`:42`).
- W4 `.claude-plugin/plugin.json:3`: `"version": "0.3.16"`.
- W5 D-04's code consumer, the three together: `scripts/setup/aiwf-roles.mjs:577` the plan note ->
  `'second pass only on your word: a reversed operator decision or a named risk'`; its pin
  `scripts/setup/test-setup.mjs:1497` the same string (an adjusted assertion: the hand-back carries
  its Contract Justification - D-04, producer and pin move together); `skills/roles/SKILL.md:118` the
  sample row's note column the same string.
- Never edited: `migrations/0033_doctrine-stages/ops.json` (pinned by
  `scripts/update/test-update.mjs:1986-1993`), any other shipped migration, the rendered copies
  under `.claude/` (the self-install renders them), every template.

The COO (R1 prose, in the main session BEFORE the Verify batch, so it rides the Writer's commit -
the SEEDFS precedent):

- R1 `CHANGELOG.md` above `:7`: `## [0.3.16] - <the commit's date>`, `### Changed` entries in the
  shape of the root `CLAUDE.md` § Changelog format (`- **Title (DOCTR-001)** - summary`, one per
  rule cluster, 3-5 sub-items at most), one `DOCTR-002` entry for the migration; the block's last
  line, verbatim:
  `Retires local rules: overrides § Communication: A question to the operator is a dialog`
- R2 `README.md:22`: `**v0.3.16. Public since 0.2.0.**`

After the commit (index § Order and gates): the live copy refreshed; `/pnp:update --apply` on this
repository; then the record commit (docs, its own dialog), which also captures the tracked files the
self-install changed (the SEEDFS precedent: `58fa73b`, "the self-install on 0.3.15"). Its explicit
path list: `dev/backlogs/active/DOCTR/records/DOCTR-002.md`, `dev/backlogs/active/DOCTR/PLAN_DOCTR.md`
(the row closed), `dev/backlogs/ROADMAP.md`, `dev/backlogs/CANDIDATES.md`, `dev/PROJECT_OVERRIDES.md`
(`:210-216` deleted), `.claude/aiwf-native/ORCHESTRATOR.md`,
`.claude/aiwf-native/doctrine/work.md`, `.claude/aiwf-native/doctrine/ticket.md`,
`.claude/aiwf-native/doctrine/plan.md`, `.claude/aiwf-native/aiwf.config.json` (its two stamps,
`:4-5`), `.claude/agents/writer.md`, root `CLAUDE.md`; the release tag lands on that commit. Then
the archive; the tag and push words.

## Acceptance

The commands run in PowerShell - this project's channel (`os: windows`) - from the repository root,
as written, after the code commit; `<guard>` and `<001>` are replaced by the literal hashes (the
dispatch's scope guard, 001's commit in its record). A pattern that carries a double quote, a
backtick or a non-ASCII character is single-quoted, and a double quote inside a pattern is written
`\x22` (Windows PowerShell 5.1 does not escape an embedded `"` for a native command). The output
after the dash means broken.

- A1 `rg -c "rerender-managed-region" migrations/0041_doctrine-wording/ops.json` - anything but `6`.
- A2 `git diff --name-only <001>~1 <001> -- templates/ORCHESTRATOR.md.tmpl templates/doctrine templates/CLAUDE.md.tmpl templates/agents templates/AGENTS.md.tmpl`
  - a path whose managed file has no op in W1 (the expected output, six templates:
  `templates/CLAUDE.md.tmpl`, `templates/ORCHESTRATOR.md.tmpl`, `templates/agents/writer.md.tmpl`,
  `templates/doctrine/plan.md.tmpl`, `templates/doctrine/ticket.md.tmpl`,
  `templates/doctrine/work.md.tmpl`).
- A3 `rg -n '\x22file\x22: \x22(\.claude/aiwf-native/ORCHESTRATOR\.md|\.claude/aiwf-native/doctrine/(work|ticket|plan)\.md|\.claude/agents/writer\.md|CLAUDE\.md)\x22' migrations/0041_doctrine-wording/ops.json`
  - fewer than 6 hits; `rg -n "review\.md|reviewer\.md|qa\.md|AGENTS\.md|createIfAbsent|ifRecorded" migrations/0041_doctrine-wording/ops.json`
  - any hit outside the note's text.
- A4 `rg -c '\x22op\x22: \x22note\x22' migrations/0041_doctrine-wording/ops.json` - anything but `1`;
  `rg -c -F 'If this release introduces a word-gate: check your local rules for self-initiated dispatch or remediation - a rule written before this gate may contradict it.' migrations/0041_doctrine-wording/ops.json`
  - anything but `1` (B3: the word-gate sentence verbatim in the note's text);
  `rg -n "question-to-the-operator-is-a-dialog" migrations/0041_doctrine-wording` - no hit in
  `ops.json` (`supersedes`) or none in `NOTES.md`.
- A5 `rg -n "^## (What changes|What this migration does|What it leaves alone|Superseded local rules)$" migrations/0041_doctrine-wording/NOTES.md`
  - fewer than 4 hits.
- A6 `rg -n "0041_doctrine-wording" migrations/index.json` - no hit, or a hit without
  `"targetPluginVersion": "0.3.16"`, or a hit that is not the line right before `]`.
- A7 `rg -n '\x22version\x22: \x220\.3\.16\x22' .claude-plugin/plugin.json` - no hit at `:3`.
- A8 `rg -n "^## \[" CHANGELOG.md` - a first hit other than `## [0.3.16] - <date>`;
  `rg -n -F 'Retires local rules: overrides § Communication: A question to the operator is a dialog' CHANGELOG.md`
  - not exactly one hit, or a hit that is not the last non-blank line above `## [0.3.15]`.
- A9 `rg -n "^\*\*v0\.3\.16\. Public since 0\.2\.0\.\*\*$" README.md` - no hit at `:22`.
- A10 `rg -n "a reversed decision" scripts skills templates docs` - any hit;
  `rg -n "a reversed operator decision or a named risk" scripts/setup/aiwf-roles.mjs scripts/setup/test-setup.mjs skills/roles/SKILL.md`
  - a count other than 3.
- A11 `git diff --name-only <guard> HEAD -- migrations` - a path outside
  `migrations/index.json` and `migrations/0041_doctrine-wording/`.
- A12 `git diff --name-only <guard> HEAD -- templates docs .claude` - any line.
- A13 `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- A14 the four Verify rows, the self-check in its CI form (§ Verify, `dev/VERIFY_RUNBOOK.md:22-29`)
  - any exit != 0.
- A15 the provenance grep `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
  - any hit.
- A16 after the self-install: `rg -n '\x22installedPluginVersion\x22: \x220\.3\.16\x22|\x22lastMigrationApplied\x22: \x220041_doctrine-wording\x22' .claude/aiwf-native/aiwf.config.json`
  - fewer than 2 hits (`:4`, `:5`); `rg -n "AskUserQuestion" .claude/aiwf-native/ORCHESTRATOR.md` and
  `rg -n "SendMessage" .claude/aiwf-native/doctrine/ticket.md` - not one hit each; the update's
  embedded self-check - exit != 0.

## Risk threshold

Blocks: an op missing for a template 001 changed, or an op for a template it did not; an edit to a
shipped migration (0033's op count is pinned); a manifest out of order or a last entry other than
0041 at 0.3.16; `plugin.json` and the manifest disagreeing; a `note` without `id`, `text`, `docRefs`,
or a `supersedes` that does not name the dialog rule; the roles note changed in one of its three
places only; the CHANGELOG block without the verbatim Retires line or not on top; a template, a doc
or a rendered copy edited in this commit; an AI attribution line in the commit; Cyrillic, an
origin-project name or an absolute path in the payload. Notes: the note's wording, the CHANGELOG's
grouping and titles.

## Stop condition

Stop and hand back before any write when: A2's output differs from the six templates W1 names; a
file outside the Code Map must change; an old test's expectation other than `test-setup.mjs:1497`
must move; `validate-payload` refuses the op shape of W1. The Reviewer stops at the first BLOCKER
that would fail a Verify row, and otherwise after reading the whole diff against Acceptance. The
ticket stops after the record commit; the tag and the push are the operator's words.

## Verify

The release row with a re-render migration and a bump (`dev/PROJECT_OVERRIDES.md` § Test policy,
"VERIFY is proportional to the change"; the render pins `scripts/setup/test-setup.mjs:292-304`;
W5 touches `scripts/setup/`), run ONCE by the COO at the hand-back as Portion 1 - one parallel
batch in the background, beside the full diff read; Portion 2 (the POSIX suites under WSL) is not a
release gate. The commands, cwd `.` - the first three verbatim from
`.claude/aiwf-native/aiwf.config.json`, the self-check in the runbook's CI form:

- `update-suite`: `node scripts/update/test-update.mjs`
- `setup-suite`: `node scripts/setup/test-setup.mjs`
- `validate-payload`: `node scripts/update/validate-payload.mjs --plugin-root .`
- the self-check, CI form: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` - NOT the
  config's fixture form `--plugin-root . --project-fixture .`: a version bump reds its PROJECT LAYER
  `installedPluginVersion equals the payload version` row until `/pnp:update --apply` runs, which is
  after the code commit, so the pre-commit run of a release diff uses the CI form
  (`dev/VERIFY_RUNBOOK.md:22-29`).

The Writer runs no suite and adds no test: the only test change is the adjusted pin of W5, whose
proof is the COO's `setup-suite` run. Then the self-install `/pnp:update --apply` with its embedded
project-scope self-check - the proof of the fixture form's PROJECT scope, its version-stamp row
included (A16). Command shapes and every recorded trap: `dev/VERIFY_RUNBOOK.md`. Logs outside the
repository.

## Code Map

| path | role |
|---|---|
| `migrations` | W1, W2 (the new directory `migrations/0041_doctrine-wording/`) |
| `migrations/index.json` | W3 |
| `.claude-plugin/plugin.json` | W4 |
| `scripts/setup/aiwf-roles.mjs` | W5 (`:577`) |
| `scripts/setup/test-setup.mjs` | W5 (`:1497`); the render pins `:292-304`, read only |
| `skills/roles/SKILL.md` | W5 (`:118`) |
| `migrations/0036_planning-briefs-and-verify-owner/ops.json` | the op shape (`:5-9`, the Writer op `:8`), read only |
| `migrations/0033_doctrine-stages/ops.json` | the region op form (`:9`), never edited |
| `migrations/0040_seed-containment/NOTES.md` | the NOTES sections, read only |
| `migrations/README.md` | the `supersedes` duty (`:70-84`), read only |
| `scripts/update/validate-payload.mjs` | the op and note shape (`:426-446`, `:464-481`), read only |
| `scripts/update/test-update.mjs` | the 0033 pin (`:1986-1993`), read only |
| `CHANGELOG.md` | R1 (the COO) |
| `README.md` | R2 (the COO, `:22`) |
| `dev/PROJECT_OVERRIDES.md` | the record commit: `:210-216` deleted (R1, the COO) |
| `dev/backlogs` | the record `active/DOCTR/records/DOCTR-002.md`, the roadmap and CANDIDATES marks |
