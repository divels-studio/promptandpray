# SKILLS-001 - every sentence of D-02..D-05, D-09..D-11 in the skills, the Writer brief template and the two recipes

Route R1 (prose in the payload), the main session on Opus 5.5 (D-13), no auditor (`review.docs`
row 0). Operator word for the ticket: "да" (2026-11-08). Scope guard: HEAD `d5021b8` (the plan's
anchors at `b35693b` re-read: `git diff --stat b35693b d5021b8 -- skills docs templates` empty).

## What landed

- `eaffdf5` (docs commit) - the eight files of the ticket's Code Map, nothing else
  (`git diff --name-only d5021b8 HEAD`):
  - `skills/qa/SKILL.md` - P02 (Step 2: the copy rule, `<scratchDir>/<REF>-e2e-report-<N>.json`,
    `outputDir` kept until the copy stands; Step 3 EVIDENCE: the JSON report line names the copy),
    P11 (the declared RED run: a fourth bullet in Step 2's guaranteed artifacts and in Step 2b's
    artifacts for QA, a line in the EVIDENCE block with the none-form; the verdict rule unchanged);
  - `skills/review/SKILL.md` - P02 (the EVIDENCE PACK slot names the report's copy beside the green
    run's log);
  - `skills/setup/SKILL.md` - P03 (the auto-approving sentence at the end of Step 3);
  - `skills/brief/SKILL.md` - P04 (the new `## Step 0.5 - When no brief is composed`);
  - `skills/plan/SKILL.md` - P10 (Step 1 asks nothing; Step 2's closing paragraph answers the three
    questions after the research, ONE dialog for what stays open, the dual moved with it), P09 (the
    live planner at the refusal, the runnability paragraph and the revision; `SendMessage`), P05 (the
    no-match check and the stage split in the runnability pre-pass), P12 (the COO tier of each ticket
    in the approval report);
  - `templates/briefs/writer-dispatch.md` - P11 (the RED run line after the expected red set, dropped
    for `E2E: no`);
  - `docs/CODEX_REVIEW_QA_RECIPE.md` - P11 (the artifact list), P02 + P11 (the prompt's report copy,
    the red-run path or its none-form);
  - `docs/SESSION_BRIEF_RECIPE.md` - P04 (the pointer sentence to `/pnp:brief` Step 0.5).
- No managed template and no rendered copy under `.claude/` changed (D-01); no file of SKILLS-002.
- This record's commit - the record and the index row closed. No roadmap line is marked here (the
  ticket's close duties: 002's record commit marks them with the release).

## Decisions and deviations

- P09: the revision sentence points at Step 5 (where the message rule now stands) instead of
  Step 4; the old "(Step 4, the same dispatch ...)" pointers are gone, per Set 2.
- P05: the Writer's first run of the tests it adds is "seen failing", not "red run", so the literal
  stays out of `skills/plan/SKILL.md` (Set 9, as the row asks).
- P03: the sentence names `.claude/settings.json` and `aiwf.config.json`, as update's `:80-82` does -
  setup writes both through the same engine class (D-03's why).
- P10: the Step 1 sentence that asked the three questions was replaced by "This step asks the
  operator nothing", pointing at Step 2; the dual and the "data, never a word to start" clause moved
  into the new Step 2 paragraph.

## Events

None.

## Verification (what actually ran)

PowerShell, repository root.

- The ticket's Acceptance greps, run on the working tree before the commit and unchanged by it:
  Set 1 - 1 hit (`skills/plan/SKILL.md:123`, between Step 2 `:108` and Step 3 `:130`;
  `asks the operator nothing` `:78`, between Step 1 `:67` and Step 2); Set 2 - `the same dispatch`
  0, `live planner` 3 (`skills/plan/SKILL.md:180, :201, :252`), `SendMessage` 2
  (`templates/doctrine/ticket.md.tmpl:129`, `skills/plan/SKILL.md:182`), `respawn|resume, do not` 0;
  Set 3 - `Guaranteed artifacts` 1, `EVIDENCE \(read-only` 1, `e2e-report-` qa 2 / review 1 /
  recipe 1, `before that copy stands` 1 (`skills/qa/SKILL.md:132`); Set 4 - 2 (review `:182`,
  `work.md.tmpl:141`); Set 5 - 5, the setup hit `:131` between Step 3 `:106` and Step 4 `:134`;
  Set 6 - 3, brief headings Step 0, 0.5, 1, 2, 3 in order, `state is durable` `:34` and
  `/pnp:mission` `:35` between Step 0.5 `:32` and Step 1 `:39`; Set 7 - 2, `selects no test` 1
  (`:197`, after the pre-pass line `:192`, before Step 6 `:204`); Set 9 - the four files,
  `e2e-red.json` qa 3 / recipe 1 / writer-dispatch 1, `RED run: none - because` 1 in each; Set 10 -
  2 hits, `:265` (the Approval line) and `:266`, before the Measurements line `:273`.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0 (`valid: 41 migration(s) ...
  payload version 0.3.16`).
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
  - no output, exit 1.
- After the commit: `git diff --name-only d5021b8 HEAD` - the eight files; the managed-paths diff
  (`templates/doctrine templates/agents templates/ORCHESTRATOR.md.tmpl templates/CLAUDE.md.tmpl
  .claude README.md CHANGELOG.md .claude-plugin migrations`) - empty; `git diff -U0 -- skills` before
  the commit - no hunk inside a `## Step 0 - Project context` section (brief's hunk starts after the
  Notation line, with the new heading).
- Live copy refreshed: `D:\pnp-live` detached at `eaffdf5`.
- No auditor: `review.docs` row 0 (D-01).

## Remaining debt

None.

## Diff review

The COO read the whole diff (56 insertions, 18 deletions): every sentence sits at its row's anchor,
each marker on one line, no neighbouring rule reworded beyond its decision; D-02's actor is the COO
or `/pnp:qa` Step 2, never the Writer; D-11's red report comes from the config reporter, no
redirect; the new backticked paths carry placeholders and match no cross-reference pattern, the one
named doc (`docs/READINESS_CLASSES.md`) exists.

## Scratch

`.aiwf/` holds `route-state.json` (`{}`) and `checkpoint.md` (the live checkpoint, rewritten at this
gate) - both live loop mechanics, kept. Nothing of this ticket was written there.

## Closing checklist

- the operator's own run: n/a - prose in the payload, nothing visible in a running product until
  0.3.17 ships;
- the diff review folded in above;
- roadmap finding lines: n/a here - marked at SKILLS-002's record commit (the ticket's close duties);
- out-of-scope findings: none;
- scratch: nothing to move or delete (§ Scratch);
- the next ticket: SKILLS-002, on its own word; this session can carry it (D-13: Opus).

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 (no auditor) | 140,000 | `~/.claude/ctx/<session>.pct` 14, `.size` 1,000,000 |
