# DOCSTAGE-001 [R1 prose] - the four stage templates and the core of ORCHESTRATOR

Implements: D-01, D-02, D-03, D-04, D-05, D-08, D-09.
COO: Opus - because all four no.
Branch: `main`. Depends on: the plan landed (`dev/` only; `docs/`, `skills/`, `templates/` still at `e8761b6`).

## Outcome

The four stage templates exist under `templates/doctrine/` and `templates/ORCHESTRATOR.md.tmpl`
carries the core sections (D-01, D-02, D-05), each file ending with one empty project additions
block (D-03, D-04); the three docs and every reader of them untouched (D-09); D-08's control and
mid-state recorded.

## Scope

Every item is a row of the index § DOCSTAGE-001 worklist, at its `file:line`; the section -> stage
map is D-02 with the D-05 splits.

1. A0 - D-08 control over the untouched tree (index § Procedures), before any template is written.
2. A1-A4 - `templates/doctrine/work.md.tmpl`, `ticket.md.tmpl`, `plan.md.tmpl`, `review.md.tmpl`:
   the sections moved whole and verbatim from `docs/WORKFLOW.md`, `docs/LOOP.md`,
   `docs/REVIEW_CHECKLIST.md`; a cross-stage reference becomes one line `<stage>.md § <heading>`
   (D-05); the ledger fence (`docs/WORKFLOW.md:651-681`) byte for byte in `plan.md.tmpl`.
3. A5 - `templates/ORCHESTRATOR.md.tmpl`: the core sections above `:195-196`, its duplicates
   collapsed, `records/<REF>.md` kept; `:24` and `:181-194` not touched (002).
4. A6 - the frame of each new file: TEMPLATE CONTRACT block first, headings verbatim, one empty
   additions block last, placeholders only of `scripts/setup/generate.mjs:131-133`.
5. A7 - D-08 mid-state run and the render dry-run (index § Procedures); `records/DOCSTAGE-001.md`
   carries both D-08 outputs and the merged-or-dropped list.

## Acceptance

From the repository root, after the commit; the output after the dash means broken.

- `git ls-files templates/doctrine` - fewer than four lines, or a name other than `work.md.tmpl`,
  `ticket.md.tmpl`, `plan.md.tmpl`, `review.md.tmpl`.
- `git grep -c -F "<!-- project additions -->" -- templates/doctrine templates/ORCHESTRATOR.md.tmpl`
  - a file missing or a count other than 1.
- `git grep -L -F "<!-- TEMPLATE CONTRACT" -- templates/doctrine` - any line.
- `git diff --name-only e8761b6 HEAD -- docs skills scripts hooks schema migrations .claude-plugin`
  - any line (D-09: the docs and every reader untouched).
- `git diff --name-only e8761b6 HEAD -- templates` - a path outside `templates/doctrine/` and
  `templates/ORCHESTRATOR.md.tmpl`.
- `git grep -n -F "records/<REF>.md" -- templates/ORCHESTRATOR.md.tmpl` - no hit
  (`scripts/update/test-update.mjs:1700-1711`).
- the dry-run's fence comparison (index § Procedures) - any byte difference.
- `git grep -n -e "^## Planning lock" -e "^## Plan readiness review" -- templates/doctrine/plan.md.tmpl`
  - fewer than two hits.
- `git grep -n -e "^## Ticket brief contract" -e "^## Loop shape and its overrides" -- templates/doctrine/ticket.md.tmpl`
  - fewer than two hits.
- `git grep -n -e "^## Routes$" -e "^## Routing mapped to native" -- templates/doctrine/work.md.tmpl`
  - fewer than two hits.
- `git grep -n -F "## Verdict (both roles)" -- templates/doctrine/review.md.tmpl` - no hit.
- `git grep -n -e "^## Commit & Push Authority" -e "^## Escalation and the arbiter" -- templates/ORCHESTRATOR.md.tmpl`
  - fewer than two hits.
- the D-08 control output - a paragraph off the bar 1 not explained in the record.
- the D-08 mid-state output - a paragraph off the bar 2 not on the merged-or-dropped list.
- the render dry-run - a throw, a `{{` or a `TEMPLATE CONTRACT` line in any render, or a block not
  last.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- the provenance grep of `dev/PROJECT_OVERRIDES.md:153-155` - any hit.

## Risk threshold

Blocks: a rule's text changed while moved (beyond a cross-stage line or a collapsed duplicate); a
section in two stage files outside the D-05 splits; a paragraph of the three docs in no stage file
and on no merged-or-dropped list; a second additions block or one not last; a placeholder the render
cannot resolve; `docs/`, `skills/` or any reader of the templates touched; the ledger fence not byte
identical; `records/<REF>.md` lost from ORCHESTRATOR; Cyrillic, a project name or an absolute path
in the payload. Notes: section order inside a stage file; heading levels of the collapsed
ORCHESTRATOR duplicates.

## Stop condition

Stop and ask the operator before writing when: a paragraph cannot be placed by D-02 or D-05 (a new
decision); a moved paragraph needs its wording changed to stand in its stage (ROADMAP § DOCTR,
out of scope); a file outside the Code Map must change. Stop after the docs commit and the record;
002 is the next ticket's word.

## Verify

The prose row (overrides § Test policy :153-155), once: the provenance grep, `validate-payload`,
plus the render dry-run (index § Procedures). No suite runs: no script reads the new templates and
the ORCHESTRATOR pins (`scripts/update/test-update.mjs:1700-1711`, `scripts/setup/test-setup.mjs:251-252`)
are guarded by the acceptance greps above; 002's suites run them. Logs and scratch scripts outside
the repository.

## Code Map

| path | role |
|---|---|
| `templates` | 2, 4 (new folder `templates/doctrine/`) |
| `templates/ORCHESTRATOR.md.tmpl` | 3 |
| `docs/WORKFLOW.md` | source, read only |
| `docs/LOOP.md` | source, read only |
| `docs/REVIEW_CHECKLIST.md` | source, read only |
| `scripts/setup/generate.mjs` | render dry-run imports (`:261`, `:364`, `:585`), read only |
| `dev/backlogs` | 5 (the record `active/DOCSTAGE/records/DOCSTAGE-001.md`, after the landing) |
