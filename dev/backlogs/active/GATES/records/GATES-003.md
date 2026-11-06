# GATES-003 - the plan gate refuses side-by-side tickets whose Code Maps share a path

## What landed

`a5d883c` (code, Writer, `Refs: GATES-003`; 4 files, +150/-6):
- `scripts/engine/plan-gate.js` - the three tokens in the header; `SIDE_BY_SIDE_KEY`, `SIDE_BY_SIDE_PREFIX`,
  `SIDE_BY_SIDE_REF = /^[A-Z]{2,8}-\d{3}$/` (the lib's ticket grammar); `declaredSideBySide(model)`
  beside `declaredTicketCap` (column 0, the fence mask, split on ", ", two or more refs, no upper bound,
  trailing blanks trimmed); `mapPathKey` / `sharedMapPath` (equal, or containment either way, the
  longer path returned, the root contains all); in `examine` after the Code Map paths: a malformed line
  -> `sidebyside-malformed:<line>`, an unknown or repeated ref -> `sidebyside-unknown-ref:<line>`, each
  path two refs of one well-formed line share -> `sidebyside-shared-path:<A>,<B>,<path>`.
  `stampPlanFolder` unchanged.
- `scripts/selfcheck/aiwf-selfcheck.js` - M57-M61 after M56 (malformed, unknown/duplicate ref,
  shared path by equality, by containment with the longer path named, a well-formed line over disjoint
  Code Maps plus a fenced line -> exactly `stamp-mismatch`); FIX-002 written inside each case's
  `after`; five named-fault controls (`ctl-sbs-malformed`, `-unknown`, `-shared`, `-contain`,
  `-mask`); the three tokens in `PG_CONTRACT_TOKENS`.
- `templates/briefs/planner.md` (the folder contract) and `templates/doctrine/plan.md.tmpl`
  (§ Plan readiness review, the mechanical gate) name the line and the check. Both reach installations
  with GATES-005's migration 0037 (D-10).
- Unchanged (C4): the spike gate2-plan rows; Gate 2 reads the tokens through brief mode.

The live copy `D:\pnp-live` was refreshed to `a5d883c` after the commit.

## Decisions and deviations

- One extra control beyond the ticket's list, `ctl-sbs-mask` (M61), for the risk-threshold item "a
  line inside a fenced block read".
- Path comparison is case-sensitive; trailing blanks of a side-by-side line are trimmed.
- The ticket's selfcheck pointers predated GATES-001/002's shift (~+150 lines); the brief named the
  moved lines. The spike gate2-plan block is at `run-spikes.mjs:363-392` (the ticket said :353-384).
- The auditor's note: the containment case covers a directory in the FIRST ticket's Code Map; the
  symmetric branch has no case of its own. The code is symmetric (`sharedMapPath`); closed as a note,
  no change.

## Events

None.

## Verification (what actually ran)

COO, Portion 1, logs outside the repository (session scratchpad `verify-gates003/`):
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0,
  `==== 1666/1666 assertions passed ====`, `[plan-gate-tokens] ... - 19 tokens`, the five ctl-sbs
  controls "FAIL as required";
- `node scripts/spike/run-spikes.mjs` exit 0, `checks: 478, failures: 0`;
- `node scripts/update/validate-payload.mjs --plugin-root .` exit 0, `valid: 36 migration(s) in
  D:\promptandpray, payload version 0.3.11`;
- render dry-run `node scripts/setup/generate.mjs --answers-file examples/example-project/answers.json
  --project-root <scratchpad>/verify-gates003/render-003 --plugin-root . --no-selfcheck` exit 0; the
  rendered `.claude/aiwf-native/doctrine/plan.md` carries "Side by side:" once and no `{{`.
- Acceptance (COO): `sidebyside-` count in plan-gate.js 6; "Side by side:" once in each template;
  `node scripts/engine/plan-gate.js --check dev/backlogs/active/GATES` exit 2 with only
  `stamp-mismatch` (the folder gained records after its stamp - pre-existing), no `sidebyside-` token;
  a scratch copy with `Side by side: GATES-001, GATES-002` printed `sidebyside-shared-path` for
  `scripts/selfcheck/aiwf-selfcheck.js`, `scripts/spike/run-spikes.mjs`, `docs/LOOP.md`,
  `hooks/hooks.json`; the Writer's scratch copies gave `sidebyside-unknown-ref:3` (GATES-009),
  `sidebyside-malformed:3` (one ref), no malformed for four refs, and
  `sidebyside-shared-path:GATES-002,GATES-003,scripts/engine/plan-gate.js` (containment); provenance
  grep empty.
- Narrowed-test grep over the added lines: no hit.
- Fact-check gate (`/pnp:review` Step 2b, one Explore agent on sonnet): `CLAIMS: total=39 verified=39
  false=0 unverifiable=0`.
- Auditor: Codex code pass 1 (gpt-6-sol / xhigh, cold, session `01a1b0f1-07d8-7f70-9bf2-8d41d9b22b29`),
  covered by the operator word "пускай" (2026-11-06): `pass-with-notes`, no finding at the risk
  threshold; one note (the symmetric containment branch, above). `tokens used 63,981`. The review
  brief: `GATES-003-review-brief.md` beside this record.

## Remaining debt

None.

## Diff review

- Read whole at the hand-back (4 payload files).
- Per acceptance criterion, the defect each proof sees: a token never produced or a vacuous control ->
  selfcheck exit != 0 or the `[plan-gate-tokens]` line naming it; the tokens missing -> a `sidebyside-`
  count below 6; a template not naming the line -> a file with no "Side by side:"; a plan without the
  line judged -> a `sidebyside-` token on `--check`; a missed equality, ref check, one-ref line,
  upper bound or containment -> the scratch-copy rows' expected tokens absent or present; Cyrillic ->
  a provenance hit.
- Notes: the containment control covers one branch only (the auditor's note).

## Scratch

- `.aiwf/GATES-003-diff-review.md` - folded into § Diff review, § Verification and § Decisions above,
  then deleted.
- `.aiwf/GATES-003-review-brief.txt` - moved verbatim to `records/GATES-003-review-brief.md`, then
  deleted.
- `.aiwf/last-review-session.GATES-003.txt` - its one line (the session id) stands in § Verification
  above, then deleted.
- `.aiwf/checkpoint.md` and `.aiwf/route-state.json` (cleared to `{}`) stay.

## Closing checklist

- the operator's own run on a real input: n/a - no product UI; the checker's behaviour is proven by
  the selfcheck M-cases and the scratch-copy rows;
- the diff review folded in above: yes;
- the ticket's finding line on ROADMAP § GATES (the side-by-side line, Silerax PLAN_ALOG) marked
  `done a5d883c`; the Stratex local sentence retires through GATES-005's `Retires local rules:` line;
- out-of-scope findings: none;
- scratch: § Scratch above;
- the next ticket: GATES-004 in a fresh session is the better place - its first step is a measured
  codex run and the wrappers are the plan's largest ticket (COO session at 350,000 tokens, near the
  ~400k ticket boundary).

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 0 | 350,000 tokens (35% of 1,000,000) | `~/.claude/ctx/b1055be9-1bbc-46c6-bbe2-399302ca2b5f.pct` and `.size` |
