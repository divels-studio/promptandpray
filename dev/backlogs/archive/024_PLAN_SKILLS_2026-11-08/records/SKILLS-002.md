# SKILLS-002 - release 0.3.17: migration 0042 with one note, the manifest entry, the bump, the changelog, the README line

Route R2 (code + release), the Writer dispatched once with `Ticket: SKILLS-002` (Gate 2 silent: an
active plan's ticket); the COO on Opus 5.5 (D-13). Operator word for the ticket: „добре пускай 002"
(2026-11-08). Auditor: none - the operator's dialog answer at the ticket's start, "Без Одитор
(Recommended)" (D-01). Scope guard: HEAD `c04e76d`.

## What landed

- `073e75a` (code commit, the Writer's, by explicit paths, body `Refs: SKILLS-002`, no AI
  attribution) - the six files of the Code Map (`git diff --name-only c04e76d HEAD`):
  - W1 `migrations/0042_skills-wording/ops.json` - one `note`, id `skills-wording-0-3-17`, the text
    naming every sentence of `eaffdf5` (D-15's COO tier included), no word-gate sentence; `docRefs`
    `CHANGELOG.md`, the two recipes; `supersedes` `e2e-report-copied-out`,
    `questions-after-the-research` (D-12);
  - W2 `migrations/0042_skills-wording/NOTES.md` - the four sections, per skill and step;
  - W3 `migrations/index.json` - the 0042 entry at 0.3.17, last;
  - W4 `.claude-plugin/plugin.json` - `0.3.17`;
  - C1 `CHANGELOG.md` (the COO's R1 prose) - the `## [0.3.17] - 2026-11-08` block, three `### Changed`
    entries (two SKILLS-001, one SKILLS-002), the verbatim Retires line of D-12;
  - C2 `README.md:22` (the COO's R1 prose) - `**v0.3.17. Public since 0.2.0.**`.
- After the commit: the live copy `D:\pnp-live` detached at `073e75a`; the self-install applied
  0.3.17 on this repository (`.claude/aiwf-native/aiwf.config.json:4-5`, in this record's commit).
- This record's commit - the record, the index rows closed, the ROADMAP § SKILLS marks, the
  CANDIDATES marks, the readiness ledger's pass row, the ledger line, the self-install's config
  stamps; then the plan archived as `archive/024_PLAN_SKILLS_2026-11-08/` (guard (e)).

## Decisions and deviations

- The COO told the Writer to name D-15 (the COO tier of each ticket in the approval report) in the
  note and NOTES - SKILLS-001 wrote it, and W1's list in the ticket predates D-15.
- The ROADMAP § SKILLS `Status:` went `planned` -> `in progress` at this ticket's dispatch (the first
  route-state write of the plan; 001 was R1 with no route), and -> `idea` at the archive: the entry
  stays for item (d)'s open consistency pre-pass (D-07), as § DOCSTAGE stayed for its second plan.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-11-08 | Gate 3 (route-state write guard) | catch - the COO's close-duty edits to `dev/backlogs/CANDIDATES.md` and the plan index were denied while the route state still named SKILLS-002 after the code commit and its verify; the route state was cleared to `{}` (the ticket's code commit and verify done) and the edits made | this record § What landed |

## Verification (what actually ran)

PowerShell, repository root.

- At the hand-back (the Writer): `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0
  (`valid: 42 migration(s) ... payload version 0.3.17`), the Writer's report; the COO re-ran it
  beside the full diff read - exit 0, same line.
- After the code commit (the COO), the Acceptance as written: A1 `1` / `1`; A2 three hits (`:2`,
  `:3`, `:7`), `docRefs|supersedes` 2, the two ids 1 line; A3 no hit (exit 1); A4 4 headings (`:10`,
  `:72`, `:78`, `:85`); A5 `migrations/index.json:43` at 0.3.17, `]` at `:44`; A6 `plugin.json:3`;
  A7 first heading `## [0.3.17] - 2026-11-08` (`:7`), the Retires line once at `:36` (the last
  non-blank line above `## [0.3.16]` at `:38`), `(SKILLS-001)` and `(SKILLS-002)` present; A8
  `README.md:22`; A9 0.3.17 at `README.md:22`, `plugin.json:3`, `index.json:43` and the CHANGELOG
  heading, `0\.3\.16` over README and `.claude-plugin` no hit (exit 1); A10 the six paths; A12 the
  provenance grep no output (exit 1); A14 `git log -1 --format=%B 073e75a` - the subject and
  `Refs: SKILLS-002`, no attribution line.
- The live copy refreshed, then
  `node "D:/pnp-live/scripts/update/aiwf-update.mjs" --apply --project-root "D:\promptandpray"` - exit 0,
  log outside the repo (`%TEMP%\pnp-skills002-apply.log`): `updated: 0.3.16 -> 0.3.17, 1
  operation(s) applied.`, the note's line and the two `supersedes:` lines, `self-check: PASS - ====
  31/31 assertions passed ==== (project layer only)`; A13 `aiwf.config.json:4` `0.3.17`, `:5`
  `0042_skills-wording`.
- No suite locally (the prose-only release row); CI runs the full set after the push.
- No auditor (the operator's dialog answer, D-01).

## Remaining debt

None. ROADMAP § SKILLS item (d)'s consistency pre-pass stays open by decision (D-07), pointed at
ROADMAP § BRIEFS' measurement.

## Diff review

The COO read the whole diff: one op, a `note`, with every required field; the text matches
`eaffdf5` sentence by sentence (QA copy and outputDir clause, setup, brief Step 0.5, the no-match
check and its stage split, the live planner, Step 1/Step 2, D-15, the RED run and its brief line);
no rerender op, no word-gate sentence; NOTES' step homes checked against the skills' headings
(`/pnp:review`'s pack is in Step 2); the manifest and `plugin.json` agree; no shipped migration,
skill, doc or template touched; no Cyrillic, origin-project name or absolute path in the payload.

## Scratch

`.aiwf/` holds `route-state.json` (`{}`) and `checkpoint.md` (live loop mechanics, kept). Nothing of
this ticket was written there; the apply log lives under the system temp directory, outside the repo.

## Closing checklist

- the operator's own run: n/a - a release of skill prose; the consumer sees it through
  `/plugin update` + `/pnp:update` in its own session;
- the diff review folded in above;
- roadmap lines: ROADMAP § SKILLS items (a), (b), (c), (f), (g) and D-15's line `done eaffdf5`; (d)
  marked done for the no-match check, closed for the sibling scan, OPEN for the consistency pre-pass
  (D-07); (e) done for the live planner, declined for the chat form (D-08); CANDIDATES `:565`,
  `:1135`, `:1141`, `:1144` marked;
- out-of-scope findings: none;
- scratch: nothing to move or delete;
- the next ticket: none in this plan - the plan is archived; the release tag and the push are the
  operator's words.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (no auditor) | 230,000 | `~/.claude/ctx/<session>.pct` 23, `.size` 1,000,000 |
