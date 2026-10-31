# RULEHOME-001 [R1 prose] - the rules into the skeletons, skills and templates the roles act from

Implements: D-01, D-03, D-09, D-12, D-16, D-17, D-18.
COO: Opus - because all four no.
Branch: `main`. Depends on: the plan's landing.

## Outcome

The D-03 list homed per D-01; the S3 contradictions and drifts gone; D-12, D-16 (a), D-17, D-18
landed.

## Scope

The index § RULEHOME-001 worklist, every row at its `file:line`:
T1, T2, T3-T5 + X1 + Q2 (`templates/briefs/writer-dispatch.md:4`), X1 (`skills/loop/SKILL.md:67`,
`docs/SESSION_BRIEF_RECIPE.md:62`), T6 + Q4 (`templates/briefs/record.md:33-36`,
`docs/WORKFLOW.md:529-532`), T6 + D-18 (`skills/review/SKILL.md:338-345`,
`skills/qa/SKILL.md:322-325`), D-16 (a) (`docs/WORKFLOW.md:562-573`), T8 (`templates/agents/writer.md.tmpl:118-126`), T9 + C6
(`templates/agents/writer.md.tmpl:76-80`), R1 (`templates/agents/writer.md.tmpl:58-62`), R2, R3
(`skills/review/SKILL.md:162-164`, :187-189), C1, C4 (`docs/LOOP.md:105-110`), C2, C3, D1, D2, D4,
D5, D6, Step 1 (`skills/plan/SKILL.md:74-76`), guard (g) (`docs/WORKFLOW.md:219-226`), Q3, C-002,
trace + D-17 (`skills/qa/SKILL.md:104`, :113-121, :150-153, :192-196), D-12, the roadmap row.

Out: C5 (D-04), every `review-brief.txt` / `qa-brief.txt` mention (D-13) - 002's; anything under `scripts/ hooks/ schema/ migrations/
.claude-plugin/`, `CHANGELOG.md` and the bump (D-02), the S3 ids the index lists as out.

## Acceptance

Every command from the repository root, BEFORE the commit (the `git diff ... HEAD` rows are empty
after it); the output after the dash means broken.

- `git grep -n -F "for the operator's delete dialog" -- templates/briefs/record.md` - any hit.
- `git grep -n -F "is the operator's dialog" -- docs/WORKFLOW.md` - any hit.
- `git grep -n -F "from its overrides document" -- templates/briefs/writer-dispatch.md` - any hit.
- `git grep -c -F "Project lines" -- templates/briefs/writer-dispatch.md skills/loop/SKILL.md docs/SESSION_BRIEF_RECIPE.md` - any file missing.
- `git grep -c -F "COVERED BY" -- skills/review/SKILL.md skills/qa/SKILL.md` - review below 2, or qa below 1.
- `git grep -c -F "PRODUCT BOUNDARY CHECKS" -- skills/review/SKILL.md skills/qa/SKILL.md` - either file 0.
- `git grep -n -F "fifth write" -- docs/WORKFLOW.md` - no hit (D-16 (a)).
- `git grep -n -F "handoff file" -- docs/LOOP.md` - any hit.
- `git grep -n -F "config files an update writes" -- docs` - any hit.
- `git grep -n -e "--trace on" -- skills/qa/SKILL.md` - any hit.
- `git grep -n -F "a trace per test, **always**" -- skills/qa/SKILL.md` - any hit (D-17).
- `git grep -n -F "Never delete" -- skills/review/SKILL.md skills/qa/SKILL.md` - any hit (D-18).
- `git grep -n -F "three things" -- skills/plan/SKILL.md` - any hit.
- `git diff -U0 HEAD -- docs skills templates` - a changed line naming `review-brief.txt` or `qa-brief.txt` (D-13 is 002's).
- `git grep -c -F "about five minutes" -- templates/agents/writer.md.tmpl docs/CODEX_REVIEW_QA_RECIPE.md skills/review/SKILL.md skills/qa/SKILL.md skills/qal/SKILL.md` - any file missing from the output.
- `git grep -n -F "tuning" -- templates/ORCHESTRATOR.md.tmpl` - no hit.
- `git grep -c -F "Refs:" -- templates/briefs/writer-dispatch.md templates/agents/writer.md.tmpl` - either file missing.
- `git grep -l -i "QA pass" -- docs/WORKFLOW.md templates/CLAUDE.md.tmpl skills/work/SKILL.md templates/ORCHESTRATOR.md.tmpl` - fewer than 4 files.
- `git grep -n -F "operator.language" -- docs/WORKFLOW.md` - no hit in lines 219-232.
- `git diff --name-only HEAD -- scripts hooks schema migrations .claude-plugin CHANGELOG.md` - any path.
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md` - any hit.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.

## Risk threshold

Blocks: a rule restated instead of moved to its point of action (D-01); a
skeleton line that tells a role to read a document for a rule the line itself can carry; a
contradiction left in the payload between two of the touched texts; a provenance hit; a rule-bearing text committed without being shown (guard
(g)); the Writer digest (R1, D-09): a line drifting from `docs/WORKFLOW.md:451-458`, :474-478,
:497-503. Notes: wording.

## Stop condition

Stop after the docs commit of this ticket and its record. A rule the text needs that no D-NN or the
current payload decides goes to the operator as a question, not into the docs. A row whose
`file:line` no longer holds the quoted text is re-located by Grep before the edit; a row whose text
is gone stops the ticket.

## Verify

The prose row (overrides § Test policy :153-155), once, before the commit: the provenance grep and
`validate-payload` of Acceptance; one render dry-run on a scratch copy outside the repository (`node scripts/setup/generate.mjs --answers-file
examples/example-project/answers.json --project-root <scratch> --plugin-root . --no-selfcheck`) -
broken: a non-zero exit, or `{{` left in the rendered `CLAUDE.md`, `.claude/aiwf-native/ORCHESTRATOR.md`
or `.claude/agents/writer.md`. Then ONE scan-tier fact-check of the diff's prose (D-16 (b),
`skills/review/SKILL.md:200`) - broken: a claim it finds false, committed. No suite (the
re-render rides 002, D-02).

## Code Map

| path | role |
|---|---|
| `templates/briefs/writer-dispatch.md` | T3-T5, X1, D6 |
| `templates/briefs/record.md` | T6, Q4 |
| `templates/agents/writer.md.tmpl` | R1, T8, T9, C6, D1 |
| `templates/ORCHESTRATOR.md.tmpl` | D2, D-12 |
| `templates/CLAUDE.md.tmpl` | C2, D-12 |
| `templates/agents/reviewer.md.tmpl` | read: T2 |
| `skills/review/SKILL.md` | T1, T2, R2, R3, D1, D-18 |
| `skills/qa/SKILL.md` | T1, T2, D1, D-17, D-18 |
| `skills/qal/SKILL.md` | D1 |
| `skills/plan/SKILL.md` | Step 1 |
| `skills/work/SKILL.md` | C3, D-12 |
| `skills/loop/SKILL.md` | X1, C2, D4 |
| `docs/WORKFLOW.md` | T6, (g), Q3, C-002, D6, D-12, D-16 (a) |
| `docs/LOOP.md` | C1, C4, D1 |
| `docs/CODEX_REVIEW_QA_RECIPE.md` | D1, D5 |
| `docs/SESSION_BRIEF_RECIPE.md` | X1 |
| `docs/REVIEW_CHECKLIST.md` | read: T8, R3 |
| `dev/backlogs/ROADMAP.md` | the roadmap row |
