# GENERIC-001 [R1 prose] - the rules: 43 payload sentences, the overrides trimmed and marked

Implements: D-01, D-02, D-03, D-04, D-05, D-06. Route per D-18.
COO: cheap (Opus) - because all four no
Branch: `main`. Base: `0cf97e7` (plan-spanning, see the index). Rows: `RESEARCH.md` fact 5.

## Outcome

Each of the 43 rows of D-02 and D-03 is ONE sentence in one payload home, meaning kept; its local
copy and the done rows' copies (D-05) are gone; the D-04 rows stay, marked.

## Scope

Homes - one sentence per row, no heading changed; the row text is fact 5's (C-019's is D-02's):

1. `docs/WORKFLOW.md:129` § How the COO speaks: C-021, C-047, C-062, C-070.
2. `docs/WORKFLOW.md:109` § The operator does not arbitrate: C-028, C-042, C-054, C-063, C-072.
3. `docs/WORKFLOW.md:150` guard (a): C-069; `:154` guard (b): C-022, C-034; `:170` guard (d): C-049.
4. `docs/WORKFLOW.md:431` § Out-of-scope failures: C-023. `:355` § Ticket brief contract: C-035, C-055.
5. `docs/WORKFLOW.md:195` § Verifying failure claims: C-044, C-073.
6. `docs/WORKFLOW.md:436` § Durable development history: C-013, C-014, C-050, C-053, C-066.
7. `docs/WORKFLOW.md:332` the session rule: C-009, C-048, C-060. `:312` the pass: C-019. `:75`
   model policy: C-026. `:209` § Loop shape: C-105. `:410` the language paragraph: C-106.
8. `docs/WORKFLOW.md:624` § COO routing: C-061; `templates/briefs/planner.md:29` follows it.
9. `docs/WORKFLOW.md:747` § Commit & Push Authority: C-033. `:88` write boundary: C-059.
10. `docs/WORKFLOW.md:711` § Tests: C-015's generic core only (D-02).
11. `docs/LOOP.md:95-99` the shell paragraph: C-012, C-043, C-058, C-065, C-104.
12. `docs/REVIEW_CHECKLIST.md:73` § Review dimensions by defect class: C-036, C-037.
13. `docs/CODEX_REVIEW_QA_RECIPE.md:86` resuming: C-010; `:80` the quota gate: C-029 (D-03).

Overrides - `dev/PROJECT_OVERRIDES.md`:

14. Delete the local copy of every row of items 1-13 that has one (fact 5), plus C-011 `:321`,
    C-099 `:62-63` (D-05); C-105/106 is `:220-228`. A clause the payload lacks survives as one line
    with its marker, without the old bold title (D-01 (a)).
15. Mark the D-04 rows at the end of their text: `:46-53`, `:58-61`, `:158-162`, `:171-182`,
    `:184-189`, `:191-193`, `:260-264`, `:266-270`, `:306-308` (C-025's remainder), `:309-317`.
    Headings stay byte-identical (`.claude/hooks/context-gate.mjs:2` quotes § Loop shape).

Record and memory:

16. `dev/backlogs/readiness/GENERIC/rule-homes.md`: `| C-id | home (file:line) | phrase | retires name |`,
    one row per item 1-13 row (43); `phrase` a distinctive phrase of the payload sentence; the
    retires name a lowercase phrase in the 0.3.0 convention (`CHANGELOG.md:50-53`), read by GENERIC-003.
17. At the close (D-06): the memory files of C-022, C-026, C-028, C-029/C-010 keep a one-line
    pointer to the payload section.

Out of scope: rows other than fact 5's; skills; templates but `planner.md`; § The transfer surface.

## Acceptance

From the repository root; the output after the dash means broken.

- Positive control, BEFORE the edit:
  `git grep -c -F -e "git worktree remove" -e "A word for content is not a word to write" -e "Surgical edits over rewrites" -e "prefix on any command" -e "The COO runs scripts itself" -e "Auto mode and the config files" -e "Never pipe a test run through" -e "Long commands run in the background" -e "A documentation claim is a hypothesis" -e "runs only the tests it adds" -e "A file count on disk is not a runner count" -e "No retelling" -e "Analyse and decide" -e "Never a whole PLAN in front of the operator" -e "On an objection, stop the tools" -e "The gate is not prompted" -e "Informal address" -e "offer when the state is durable" -e "COO line names the model" -e "Dialogs only at the gates" -e "No audit-pass question for prose" -e "A ticket born mid-work" -e "Out-of-scope findings" -e "Paid passes are stated and priced" -e "A dead paid pass waits" -e "Resource checks are the COO" -e "reply is short" -e "Candidates are registered where they are born" -e "The resume memory is state" -e "A repo copy of a live artifact" -e "English everywhere in the tree" -e "A rule record carries a marker" 0cf97e7 -- dev/PROJECT_OVERRIDES.md`
  - anything but `0cf97e7:dev/PROJECT_OVERRIDES.md:32`.
- The same command without `0cf97e7`, after the edit - any output.
- `git grep -c -E "\((product|machine)\)" -- dev/PROJECT_OVERRIDES.md` - no output, or a count below 10.
- `git diff -G "^#" --name-only 0cf97e7 -- docs dev/PROJECT_OVERRIDES.md` - any path.
- `git grep -c --untracked -E "^\| C-[0-9]{3} " -- dev/backlogs/readiness/GENERIC/rule-homes.md` - anything but `:43`.
- Per row of `rule-homes.md`: `git grep -c -F "<phrase>" -- docs` - anything but ONE line ending `:1`.
- One `sonnet` scan over `rule-homes.md`, the homes it names and `git show 0cf97e7:dev/PROJECT_OVERRIDES.md`
  (the RBC-002 instrument, `dev/backlogs/readiness/RBC/rule-homes-overrides.md`) - a count line other
  than `rows: 43 homeless: 0 duplicated: 0 meaning-changed: 0`; the line goes into the record.
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md` - any hit.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.

## Risk threshold

Blocks: a row with no home or two; a meaning changed; a changed heading; a D-04 row deleted instead
of marked; a file outside the Code Map edited. Notes: a sentence's place.

## Stop condition

Stop after the record commit and the memory pointers. A home that reads wrong goes to the operator.

## Verify

Prose row (overrides § Test policy): the provenance grep + `validate-payload`, once, before the
commit; no suite.

## Code Map

| path | role in this ticket |
|---|---|
| `docs/WORKFLOW.md` | items 1-10 |
| `docs/LOOP.md` | item 11 |
| `docs/REVIEW_CHECKLIST.md` | item 12 |
| `docs/CODEX_REVIEW_QA_RECIPE.md` | item 13 |
| `templates/briefs/planner.md` | item 8 |
| `dev/PROJECT_OVERRIDES.md` | items 14-15 |
| `dev/backlogs/readiness/` | item 16 |
| `.claude/hooks/context-gate.mjs` | read: quotes § Loop shape |
