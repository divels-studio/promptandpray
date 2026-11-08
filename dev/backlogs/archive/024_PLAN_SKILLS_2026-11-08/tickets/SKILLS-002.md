# SKILLS-002 [R2 code + release] - release 0.3.17: migration 0042 with one note, the manifest entry, the bump, the changelog, the README line

Implements: D-01, D-06, D-07, D-08, D-12, D-13.
COO: Opus - because all four no.
Escalation: none - a `note` migration and a bump fire no check (D-13, DOCTR/D-25's reading): no recorded decision is reversed, no access surface or ask rule moves, the blast radius is the release the plan names, and no two roles disagree in writing.
Branch: `main`. Depends on: SKILLS-001 committed (its sentences are what the note and the changelog describe; its record names its commit, `<001>` below). Scope guard: `HEAD <hash>` at the dispatch.

## Outcome

Release 0.3.17 ships 001's skill sentences to every installation (D-01): migration
`0042_skills-wording` carries ONE `note` and no other operation (a prose-only release - overrides
§ Hard rules, release discipline, `dev/PROJECT_OVERRIDES.md:44-50`); the manifest's last entry and
`.claude-plugin/plugin.json` say 0.3.17; the `CHANGELOG.md` block for 0.3.17 stands on top and ends
with the `Retires local rules:` line of D-12; `README.md:22` names the version (both the COO's R1
prose, D-01). One code commit, the Writer's, carries all of it. Shipped migrations, the skills, the docs and every template are untouched.

## Scope

Every anchor at HEAD `b35693b`; re-read at the guard HEAD.

Writer:

- W1 `migrations/0042_skills-wording/ops.json` (new), the shape of
  `migrations/0041_doctrine-wording/ops.json:1-4, :11-17`: `"migration": "0042_skills-wording"`,
  `"targetPluginVersion": "0.3.17"`, `"operations"` with exactly one entry `"op": "note"`:
  `"id": "skills-wording-0-3-17"`; `"text"` - one paragraph naming, in plain words, each sentence 001
  wrote (the E2E report copied by whoever ran the suite to the scratch directory; setup's
  auto-mode sentence; `/pnp:brief` composing no brief when the state is durable; the no-match check
  of the runnability pre-pass; the live planner resumed by a message; Step 1 asking nothing and the
  three questions answered after the research; the spec's RED run as a declared QA artifact and its
  Writer brief line), then that no managed file is re-rendered (the skills and the brief templates
  are read from the plugin root and arrive with the version), then that an overrides document or a
  stage file's additions block carrying either retired local rule (D-12) may delete it on its
  operator's word; no word-gate sentence (`migrations/README.md:86-90`: this release adds no stop
  for the operator's word);
  `"docRefs": ["CHANGELOG.md", "docs/CODEX_REVIEW_QA_RECIPE.md", "docs/SESSION_BRIEF_RECIPE.md"]`;
  `"supersedes": ["e2e-report-copied-out", "questions-after-the-research"]` - one id per retired
  local rule of D-12 (`migrations/README.md:70-76`). The shape is validated by
  `scripts/update/validate-payload.mjs:141-148`, `:433-446`.
- W2 `migrations/0042_skills-wording/NOTES.md` (new), the sections of
  `migrations/0041_doctrine-wording/NOTES.md` (`:1`, `:9`, `:84`, `:95`, `:102`):
  `# 0042_skills-wording`, `## What changes` (the sentences of the note, per skill and file, each
  with its home step), `## What this migration does` (the one `note` by id, no other operation),
  `## What it leaves alone` (every config key, the ask-ruleset, every managed file - no template
  changed - and every operator-owned file), `## Superseded local rules` (the two rules of D-12, the
  block each may stand in, their ids, and that the CHANGELOG's Retires line names them). Every
  payload path it names exists (`scripts/selfcheck/aiwf-selfcheck.js:8326-8340`).
- W3 `migrations/index.json:42`: a comma after the 0041 entry and a new last entry
  `{ "id": "0042_skills-wording", "targetPluginVersion": "0.3.17" }` before `]` (`:43`).
- W4 `.claude-plugin/plugin.json:3`: `"version": "0.3.17"`.
- Never edited: `migrations/0041_doctrine-wording/` or any other shipped migration (DOCSTAGE/D-07),
  the skills, the docs, every template, the rendered copies under `.claude/` (the self-install
  writes the config stamps), and the two COO files below.
- The commit: the Writer's one code commit lists by explicit path its four files AND the COO's two
  (`CHANGELOG.md`, `README.md`).

The COO writes before the commit (R1 prose, in the main session BEFORE the hand-back check, so it
rides the Writer's commit - D-01, the `72ccbe8` precedent):

- C1 `CHANGELOG.md` above `:7`: `## [0.3.17] - <the commit's date>`, a two-line summary, then
  `### Changed` entries in the shape of the root `CLAUDE.md` § Changelog format
  (`- **Title (SKILLS-001)** - summary`, 3-5 sub-items at most per entry), one `SKILLS-002` entry
  for the migration; English; the block's last line, verbatim (D-12):
  `Retires local rules: work.md § project additions: the E2E report is copied out; plan.md § project additions: Questions come after the research`
- C2 `README.md:22`: `**v0.3.17. Public since 0.2.0.**`

The COO, after the commit (index § Order and gates): the live copy refreshed; the self-install
(§ Verify); then the record commit (docs, its own dialog). Its close duties, each against its
closing commit (DOCTR/D-19: one line at a time, never as a sweep):

- ROADMAP § SKILLS (`dev/backlogs/ROADMAP.md:125-132`): the lines of items (a), (b), (c), (f), (g)
  marked `done` with 001's commit; item (b) with the pointers `skills/update/SKILL.md:80-82`,
  `skills/roles/SKILL.md:102` (D-03); item (d) marked for the no-match check (D-05, done) and the
  sibling-decision scan (D-06, closed on the research brief and the closing greps), and left OPEN for
  the consistency pre-pass with D-07's pointer to ROADMAP § BRIEFS; item (e) marked for the live
  planner (D-09, done) and the chat form (D-08, declined - rule 9, DOCTR/D-20). The entry stays
  while (d) is open.
- `dev/backlogs/CANDIDATES.md:565`, `:1135`, `:1141`, `:1144`: each row marked with its closing
  commit; `:565` closes whole - its second half (`:569-570`) is D-02's `outputDir` clause.
- The record's explicit path list: `dev/backlogs/active/SKILLS/records/SKILLS-002.md`,
  `dev/backlogs/active/SKILLS/PLAN_SKILLS.md` (the rows closed), `dev/backlogs/ROADMAP.md`,
  `dev/backlogs/CANDIDATES.md`, `.claude/aiwf-native/aiwf.config.json` (`installedPluginVersion`,
  `lastMigrationApplied`, `:4-5`); the release tag lands on that commit. Then the archive; the tag
  and push words.

## Acceptance

The commands run in PowerShell - this project's channel (`os: windows`) - from the repository root,
as written, after the code commit; `<guard>` is replaced by the literal hash of the dispatch's scope
guard. A pattern that carries a double quote, a backtick or a non-ASCII character is single-quoted,
and a double quote inside a pattern is written `\x22` (Windows PowerShell 5.1 does not escape an
embedded `"` for a native command). The output after the dash means broken.

- A1 `rg -c '\x22op\x22:' migrations/0042_skills-wording/ops.json` - anything but `1`;
  `rg -c '\x22op\x22: \x22note\x22' migrations/0042_skills-wording/ops.json` - anything but `1`.
- A2 `rg -n '\x22migration\x22: \x220042_skills-wording\x22|\x22targetPluginVersion\x22: \x220\.3\.17\x22|\x22id\x22: \x22skills-wording-0-3-17\x22' migrations/0042_skills-wording/ops.json`
  - fewer than 3 hits; `rg -n '\x22docRefs\x22|\x22supersedes\x22' migrations/0042_skills-wording/ops.json`
  - fewer than 2 hits; `rg -c "e2e-report-copied-out|questions-after-the-research" migrations/0042_skills-wording/ops.json`
  - anything but `1` (both ids on the `supersedes` line).
- A3 `rg -c -F "If this release introduces a word-gate" migrations/0042_skills-wording` - any hit.
- A4 `rg -n "^## (What changes|What this migration does|What it leaves alone|Superseded local rules)$" migrations/0042_skills-wording/NOTES.md`
  - fewer than 4 hits.
- A5 `rg -n "0042_skills-wording" migrations/index.json` - no hit, or a hit without
  `"targetPluginVersion": "0.3.17"`, or a hit that is not the line right before `]`.
- A6 `rg -n '\x22version\x22: \x220\.3\.17\x22' .claude-plugin/plugin.json` - no hit at `:3`.
- A7 `rg -n "^## \[" CHANGELOG.md` - a first hit other than `## [0.3.17] - <date>`;
  `rg -n -F 'Retires local rules: work.md § project additions: the E2E report is copied out; plan.md § project additions: Questions come after the research' CHANGELOG.md`
  - not exactly one hit, or a hit that is not the last non-blank line above `## [0.3.16]`;
  `rg -n "\(SKILLS-00[12]\)" CHANGELOG.md` - no hit for either id.
- A8 `rg -n "^\*\*v0\.3\.17\. Public since 0\.2\.0\.\*\*$" README.md` - no hit at `:22`.
- A9 Set 8 after the release: `rg -n "0\.3\.17" README.md CHANGELOG.md .claude-plugin migrations/index.json`
  - a missing one of `README.md:22`, the `CHANGELOG.md` `## [0.3.17]` heading,
  `.claude-plugin/plugin.json:3`, the `migrations/index.json` 0042 entry;
  `rg -n "0\.3\.16" README.md .claude-plugin` - any hit.
- A10 `git diff --name-only <guard> HEAD` - a path other than `migrations/index.json`,
  `migrations/0042_skills-wording/ops.json`, `migrations/0042_skills-wording/NOTES.md`,
  `.claude-plugin/plugin.json`, `CHANGELOG.md`, `README.md`.
- A11 `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- A12 the provenance grep `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
  - any hit.
- A13 after the self-install: `rg -n '\x22installedPluginVersion\x22: \x220\.3\.17\x22|\x22lastMigrationApplied\x22: \x220042_skills-wording\x22' .claude/aiwf-native/aiwf.config.json`
  - fewer than 2 hits (`:4`, `:5`); the apply's output without the note's `note:` line or without
  its two `supersedes:` lines; the update's embedded self-check - exit != 0.
- A14 `git log -1 --format=%B <code>` (`<code>` the code commit's literal hash) - a line other than the subject, the body and
  `Refs: SKILLS-002` that is an AI attribution (`Co-Authored-By`, `Claude-Session`, a session URL,
  "Generated by").

## Risk threshold

Blocks: a second operation in `ops.json` or a `rerender-managed-region` op (no template changed);
an edit to a shipped migration; a manifest out of order or a last entry other than 0042 at 0.3.17;
`plugin.json` and the manifest disagreeing; a `note` without `id`, `text`, `docRefs`, or a
`supersedes` that does not name the two rules of D-12; the word-gate sentence in a release that adds
no word-gate; the CHANGELOG block without the verbatim Retires line or not on top; a skill, a doc, a
template or a rendered copy edited in this commit; an AI attribution line in the commit; Cyrillic,
an origin-project name or an absolute path in the payload. Notes: the note's wording, the
CHANGELOG's grouping and titles, the NOTES prose.

## Stop condition

Stop and hand back before any write when: 001 is not committed at the guard HEAD; a file outside
the Code Map must change; `validate-payload` refuses the op shape of W1; a decision reads wrong
against the migration contract (`migrations/README.md:70-93`). The ticket stops after the record
commit; the tag and the push are the operator's words.

## Verify

The prose-only release row (`dev/PROJECT_OVERRIDES.md` § Test policy, `:163-165`: a `note`
migration + the bump), once; NO suite locally - CI runs the full set after the push. Cwd `.`.

1. At the hand-back, by the COO beside the full diff read: `validate-payload` -
   `node scripts/update/validate-payload.mjs --plugin-root .`; and the provenance grep (A12).
2. After the code commit, the live copy refreshed from `main` first (root `CLAUDE.md` § This
   repository is the plugin) - the apply must run the 0.3.17 engine and manifest:
   `Start-Process git -ArgumentList 'checkout','--detach','main' -WorkingDirectory 'D:\pnp-live' -NoNewWindow -Wait`
3. Then the self-install with its embedded self-check:
   `node "D:/pnp-live/scripts/update/aiwf-update.mjs" --apply --project-root "D:\promptandpray"` -
   broken when exit != 0 or A13 fails.

The Writer runs no suite and adds no test: the change carries no code path (a `note` applies
nothing - `migrations/README.md:73`). Command shapes and every recorded trap:
`dev/VERIFY_RUNBOOK.md`. Logs outside the repository.

## Code Map

| path | role |
|---|---|
| `migrations` | W1, W2 (the new directory `migrations/0042_skills-wording/`) |
| `migrations/index.json` | W3 (`:42-43`) |
| `.claude-plugin/plugin.json` | W4 (`:3`) |
| `CHANGELOG.md` | C1 (the COO, above `:7`); in the Writer's commit |
| `README.md` | C2 (the COO, `:22`); in the Writer's commit |
| `migrations/0041_doctrine-wording/ops.json` | the op and note shape (`:1-4`, `:11-17`), never edited |
| `migrations/0041_doctrine-wording/NOTES.md` | the NOTES sections (`:1`, `:9`, `:84`, `:95`, `:102`), never edited |
| `migrations/README.md` | the `supersedes` rule (`:70-76`), the word-gate convention (`:86-90`), read only |
| `scripts/update/validate-payload.mjs` | the note shape (`:141-148`, `:433-446`), read only |
| `dev/backlogs` | the record `active/SKILLS/records/SKILLS-002.md`, the index rows, the ROADMAP and CANDIDATES marks |
| `.claude/aiwf-native/aiwf.config.json` | the self-install's stamps (`:4-5`), the record commit |
