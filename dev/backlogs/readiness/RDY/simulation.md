# PLAN_RDY - acceptance simulation (Step 7, r0, 2026-09-29; general-purpose sonnet, real tree at ac83496)

40 commands run as written. Verdicts: 29 RUNS+BROKEN-VALUE (expected pre-change), 8 CANNOT-RUN
(target file does not exist yet: READINESS_CLASSES.md, 0017/ops.json, skills/plan/SKILL.md), 3
RUNS+PASSES-TODAY (regression guards: review:423 pin, diff guard on a clean tree, provenance grep),
1 SYNTAX/SHAPE ERROR.

Fixed in the draft after this run:
- row 38 Step 0 identity: empty `L` -> invalid sed range `,14p`, diff prints a plausible 15-line deletion
  instead of failing -> `test -n "$L" &&` added.
- row 25 frontmatter: `sed ... | grep -c` masks a missing file as a clean `0` -> `test -f ... &&` added.
- rows 22/39/40 labelled as regression guards in the plan (pass today by design).

Baseline values recorded: skills 12; seeds 17; "three doors" x2 in OPERATOR_PROTOCOL.md; "chain table"
WORKFLOW 1 / review 1 / tmpl 2; "chain-trace" tmpl 2; last migration 0016 -> 0.2.12; installed 0.2.12.

Process trace: PLAN_RDY.draft.md § Процес т.1-4 (authored by the COO; walks word -> readiness passes
-> Writer -> fact-check -> code pass -> commit click (code incl. self-update) -> docs commit -> push word
-> CI -> date check -> tag word -> push tag -> worktree refresh -> consumer proof -> archive).
