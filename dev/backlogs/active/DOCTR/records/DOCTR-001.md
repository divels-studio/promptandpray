# DOCTR-001 - every sentence of the decisions in the templates, the docs and the skills

Route R1 (prose in the payload), the main session on Opus 5.5 (D-25), no auditor (`review.docs`
row 0). Operator word for the ticket: "da" (2026-11-08). Scope guard: HEAD `6923a2d`.

## What landed

- `1e7f785` (docs commit) - the 21 files of the ticket's Code Map, nothing else
  (`git diff --name-only 6923a2d HEAD`):
  - `templates/ORCHESTRATOR.md.tmpl` - P16 (exempt list = non-callers), P13 (the "user sees less
    than before" stop class), P10 (rule 7: an unrequired agent, check or pass is written into the
    ticket first; its dual), P20 (rule 9, the question dialog; its dual in channel-filter item 2),
    P09 (guard (b): the operator taking a step narrows the word), P06 (the expected red set beside
    the VERIFY baseline), P08 (the own project root is the default tree);
  - `templates/doctrine/work.md.tmpl` - P03 (the three R3 sites qualified, the payload-migration
    sentence under the R3 heading), P11 (the escalation line beside the COO routing line), P23 (the
    checks read after the discovery scan), P26 (§ Tests: the E2E spec before the audit; the four
    route lines);
  - `templates/doctrine/ticket.md.tmpl` - P06 (Verify field), P07 and P11 (the `E2E` and
    `Escalation` field lines and their fixed forms), P21 (CHANGELOG language, quotes never
    translated), P17 (the live Writer resumed by `SendMessage`), P22 (the visible-outcome waiver),
    P14 (a roadmap line carries the problem, never the fix), P19 (a parent line closes with its last
    child; never as a sweep), P26 (the E2E flow order);
  - `templates/doctrine/plan.md.tmpl` - P04 (the pass-2 trigger and its dual);
  - P04's consumers: `skills/plan/SKILL.md`, `skills/review/SKILL.md`, `skills/roles/SKILL.md`
    (`:133-134` only), `templates/PROJECT_OVERRIDES.md.tmpl` (a seed), `docs/OPERATOR_PROTOCOL.md`;
  - `skills/plan/SKILL.md` - also P14 (Step 1) and P20 (Step 3 points at rule 9);
  - `templates/ROADMAP.md.tmpl` - P14 (the seed's quote form);
  - `templates/README.md` - P12; `docs/READINESS_CLASSES.md` - P15 (classes 17 and 18, the header);
  - `templates/agents/writer.md.tmpl` - P21 (`:68-70` only); `templates/CLAUDE.md.tmpl` - P26 (the
    R2 route line `:55-56` only, inside `aiwf-core`);
  - `templates/briefs/writer-dispatch.md` (P06), `templates/briefs/record.md` and
    `templates/memory-seeds/closeout-needs-a-live-pass.md` (P22), `templates/briefs/planner.md`
    (P11);
  - `skills/qa/SKILL.md`, `skills/qal/SKILL.md`, `skills/work/SKILL.md`, `skills/review/SKILL.md`
    (the EVIDENCE PACK slot) - P26.
- The rendered copies under `.claude/` are untouched (D-01); DOCTR-002 re-renders them.
- This record's commit - the record and the close duties on `dev/backlogs/ROADMAP.md` (below).

## Decisions and deviations

- `templates/briefs/writer-dispatch.md`: the row's line `Expected red set: <...>` begins with a
  capital E, so the case-sensitive acceptance grep `expected red set` counted 2, not 3. The line
  gained a pointer, "(the expected red set of `ORCHESTRATOR.md` § Verifying failure claims)", which
  carries the phrase and adds no rule. Why: the acceptance grep is literal; a pointer is the
  doctrine's form for a consumer.
- P20's dual stands in channel-filter item 2 as the ticket names it; the filter's own suppression
  dual paragraph, which already says an operator's own question is answered directly, stays as it
  was. Why: the row's marker belongs to item 2; the paragraph is the filter's dual, not rule 9's.
- `templates/agents/writer.md.tmpl`: the clause fits the three lines `:68-70` by one line longer
  than the file's usual width. Why: the acceptance check refuses a changed line outside `:68-70`.
- D-07's verdict also names C-064, homed by D-06 as the expected red set with the repo-kept list a
  project's choice - the line lists C-064 as open beside the three the ticket names.

## Events

None.

## Verification (what actually ran)

From the repository root, after the edits and before the commit (the tree the commit carries; the
commit changed no file afterwards - `git diff --name-only 6923a2d HEAD` lists the same 21 paths):

- Set 1: `rg -n "reverses" templates docs skills` - 7 lines (ORCHESTRATOR trigger 1, five trigger
  lines, the dual line); `reverses a decision the operator made` - 5; `reverses a recorded decision`
  - 0; `a reversed decision` - 1, `skills/roles/SKILL.md:118` (002's); `a reversed operator
  decision` in `docs/OPERATOR_PROTOCOL.md` - 1; `reverses a COO decision is a revision, never a
  second pass` - 1.
- Set 2: `[Mm]igrations? / access[- ]policy` - 0; `product's persistent store` in `work.md.tmpl` -
  3; `routes by its diff` - 1.
- Set 3: `unplanned R2|AskUserQuestion|SendMessage` over templates docs skills scripts hooks schema
  - 2 (`AskUserQuestion` rule 9 of the ORCHESTRATOR template, `SendMessage` the ticket template).
- Set 4: `offline proof never replaces` - 0; `not seen by the operator` - 3 (ticket template,
  record brief, the seed).
- Set 5: `dialog or a word`, `live\*\* Writer`, `settles which tree`, `zero new failures by name`,
  `sixteenth` (docs) - 1 each; `exempt` - only the discovery paragraph and guard (g).
- Set 6: `E2E run\b.*/pnp:review` - 7 (four in `work.md.tmpl`, `CLAUDE.md.tmpl`, `skills/qal`,
  `skills/work`); `at the handoff, before ./pnp:review` - 3 (`work.md.tmpl`, `ticket.md.tmpl`,
  `skills/qa`).
- Single-row markers - 1 each: `routes by its diff`, `own project root is the tree`, `takes a step
  themselves`, `the doctrine does not require`, `names the property it checks`, `the user sees less
  than before`, `eighteenth`, `a caller is never exempt`, `closes with its last child`, `never as a
  sweep`, `an operator's own question is answered`, `never translated`, `after the discovery scan`;
  `rg -n -F "## Changelog format"` over the ticket and writer templates - 2, one per file.
- `green E2E run` - 2; `expected red set` - 3 (after the deviation above; 2 before it);
  `E2E: yes | no - because <reason>` - 1; `Escalation: none | trigger <N> - <why>` - 3; `never how
  it is fixed` - 2; `„` in `templates/ROADMAP.md.tmpl` - 0; `^\| 1[78] \|` in
  `docs/READINESS_CLASSES.md` - 2; `Eight rules\.` - 1.
- `git diff -U0` of `templates/agents/writer.md.tmpl` - one hunk `@@ -69,2 +69,2 @@`; of
  `templates/CLAUDE.md.tmpl` - one hunk `@@ -55,2 +55,2 @@`.
- Pins of the changed wording in `scripts hooks schema migrations examples .claude-plugin`: none,
  except `a reversed decision` in `scripts/setup/aiwf-roles.mjs` and `scripts/setup/test-setup.mjs`
  - D-04's code consumer, DOCTR-002's by the plan.
- The render dry-run (index § Procedures), a script in the session scratch directory importing
  `templateContext`, `renderTemplate`, `carryProjectAdditions` from `scripts/setup/generate.mjs`:
  the negative control (`NEG=1`: a `{{` left, a `TEMPLATE CONTRACT` line, the END marker dropped and
  a route line outside `aiwf-core`) - exit 1, every injected defect named RED; the clean run - exit
  0, `GREEN: all renders clean`, the D-26 route line inside `aiwf-core`.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0 (log outside the repository).
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations
  examples README.md` - no hit.
- No auditor: `review.docs` row 0 (D-01).

## Remaining debt

None. The roadmap lines whose sentence this ticket wrote are marked at DOCTR-002's record commit,
with the release (D-01).

## Diff review

The COO wrote every line of the diff and read it whole before the commit. Each sentence stands at
the anchor its row names and once; each consumer the closing greps name moved with it; no heading
changed except P03's R3 heading; no rendered copy and none of DOCTR-002's files was touched. No
sentence changes another rule's meaning beyond its decision: P26 changes the order of the E2E run
only for a brief that says `E2E: yes`, and QA's Step 2 runs the suite again only after a
correction round or when no artifacts of the handoff run stand.

## Scratch

`.aiwf/` holds `route-state.json` (`{}`, R1 wrote none) and `checkpoint.md` (the plan's checkpoint,
rewritten whole at each gate - DOCTR is still in flight); both stay. The dry-run script and the
validate log live in the session's temporary directory outside the repository - not covered.

## Close duties

- D-02: ROADMAP § DOCTR, item 9's line marked `done` - "no hit; the live form is non-durable R2"
  (RESEARCH 9); F24's line was already `done`.
- D-27: the lines of items 24 and 25 (F4/F13, F7) closed as declined with the operator's dialog
  answers „Остава целият diff" and „COO го пише сам".
- D-07: the "eight rules" line gains the verdict - C-067 homed by P07, C-064 by P06, C-045 and
  C-071 project-only.
- D-05: item 5's line (intake 8) moved to ROADMAP § CODEX; the DOCTR line closes with that pointer.
- D-18: the lines of items 18 and 19 moved to the new entry `RMAP - the roadmap's places`
  (`Status: idea`, born of the operator's words D-18 quotes); the DOCTR lines close with that
  pointer.

## Closing checklist

- the operator's own run - n/a: no outcome visible in a running product (payload prose);
- the diff review folded in above - yes;
- the ticket's finding lines marked - at DOCTR-002's record commit, with the release (D-01); the
  close duties above are done in this record's commit;
- out-of-scope findings - none found;
- scratch files - § Scratch; nothing deleted;
- the next ticket: DOCTR-002 fits this session (210,000 of 1,000,000 used) or a fresh one; it waits
  for its own word.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (no auditor) | 210,000 | `~/.claude/ctx/4f4c67e9-8d51-4806-bb9e-7e66c3d0d14d.pct` (21) x `.size` (1,000,000) |
