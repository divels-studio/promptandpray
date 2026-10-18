# GENERIC-001 - the rules: 43 payload sentences, the overrides trimmed and marked

## What landed

`510165d` (docs, COO direct edits, R1 prose):

- items 1-10: 34 sentences in `docs/WORKFLOW.md` - § How the COO speaks gains items 5-8 (C-021, C-047,
  C-062, C-070); § The operator does not arbitrate one paragraph (C-028, C-042, C-054, C-063, C-072);
  guards (a) C-069, (b) C-034 + C-022, (d) C-049; § Verifying failure claims C-073, C-044; § Loop shape
  C-105; the readiness pass C-019; the session rule C-009, C-060, C-048; § Ticket brief contract C-035,
  C-055 and the language paragraph C-106; § Out-of-scope failures C-023; § Durable development history
  C-066, C-014, C-013, C-050, C-053; § COO routing C-061 (`templates/briefs/planner.md:29` follows);
  model policy C-026; write boundary C-059; § Tests C-015; § Commit & Push Authority C-033;
- item 11: 5 sentences in the shell paragraph of `docs/LOOP.md` (C-043, C-104, C-065, C-012, C-058);
- item 12: `docs/REVIEW_CHECKLIST.md` § Review dimensions by defect class (C-036, C-037);
- item 13: `docs/CODEX_REVIEW_QA_RECIPE.md` background-run bullet (C-029) and § Resuming a session (C-010);
- items 14-15: `dev/PROJECT_OVERRIDES.md` loses every local copy plus C-011 and C-099; the ten D-04 rows
  carry `(product)` / `(machine)`; three clauses the payload lacks survive as one marked line each (the
  single suite run, translating existing Bulgarian text, `MEMORY.md` index lines);
- item 16: `dev/backlogs/readiness/GENERIC/rule-homes.md`, 43 rows.

Memory (item 17, D-06): `yes-covers-only-the-asked-action`, `auditor-never-below-author`,
`every-pass-after-the-first-needs-a-word` rewritten as one-line pointers; `codex-pass-economy` keeps its
measurements with a pointer line replacing the quota rule; two `MEMORY.md` index lines follow.

## Decisions and deviations

- C-062's sentence also restates the scope-and-cost-before-spending clause with a pointer to § Durable
  development history - the first equivalence scan read it as dropped (`meaning-changed: 1`); the clause
  was already at `WORKFLOW.md:501-503`, made explicit rather than argued.
- C-023's destination reads "a roadmap entry" instead of "the candidates" - D-12 makes the roadmap the
  home of future work.
- C-014's local `git tag` bullet in § Hard rules deleted with its copy (fact 5 `:30-31`); the payload
  sentence carries "the tag takes its own word, which also covers pushing the tag".
- C-006's marker sits at the end of the E2E bullet (the row's last line of text in `:158-163`).
- C-105's payload sentence names "the transfer surface"; GENERIC-002 renames that section (D-08) and its
  closing grep must reach this sentence.

## Verification (what actually ran)

- Positive control at `0cf97e7`: `0cf97e7:dev/PROJECT_OVERRIDES.md:32`.
- The same grep after the edit: no output.
- `git grep -c -E "\((product|machine)\)" -- dev/PROJECT_OVERRIDES.md`: `:10`.
- `git diff -G "^#" --name-only 0cf97e7 -- docs dev/PROJECT_OVERRIDES.md`: no output.
- `git grep -c --untracked -E "^\| C-[0-9]{3} " -- rule-homes.md`: `:43`.
- Per-row phrase grep over `docs`: 43 of 43 one file, count 1.
- Sonnet equivalence scan: pass 1 `rows: 43 homeless: 0 duplicated: 0 meaning-changed: 1` (C-062),
  after the fix `rows: 43 homeless: 0 duplicated: 0 meaning-changed: 0`.
- Provenance grep: no output (exit 1). `node scripts/update/validate-payload.mjs --plugin-root .`: exit 0.
- No auditor (R1 prose, D-18).

## Events

- catch | the equivalence scan flagged C-062 before the commit; fixed in the same ticket.

## Remaining debt

None.

## Scratch

`.aiwf/checkpoint.md` was rewritten for this ticket; it is rewritten whole at the next gate, nothing to
move. Nothing to delete.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (no auditor) | 210k (21% x 1,000,000) | `~/.claude/ctx/<session>.pct`, `.size` |
