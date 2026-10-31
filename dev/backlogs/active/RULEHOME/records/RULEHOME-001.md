# RULEHOME-001 - payload prose: the rules into the skeletons, skills and templates the roles act from

## What landed

`f61817f` (docs, 16 files, R1 in the main session on Opus 5.5) - every row of the index
§ RULEHOME-001 worklist:

- T1, T2, R2, R3 - `skills/review/SKILL.md`, `skills/qa/SKILL.md`: `COVERED BY:` first line of both
  brief skeletons; a `PRODUCT BOUNDARY CHECKS:` slot in both; the evidence-pack slot tells the
  Reviewer to read past it; the narrowed-test grep before the dispatch.
- T3-T5, X1, Q2, D6 - `templates/briefs/writer-dispatch.md`: the payload's standing lines (scope
  guard, no dialogs, long commands, reply, commit with `Refs:`) and one `Project lines:` slot;
  `skills/loop/SKILL.md`, `docs/SESSION_BRIEF_RECIPE.md` point at them.
- T6, Q4, D-18 - `templates/briefs/record.md` (`## Diff review`, `## Closing checklist`, § Scratch),
  `docs/WORKFLOW.md` § Durable development history, the review and QA brief-file paragraphs.
- D-16 (a) - WORKFLOW: the fifth roadmap write; the "exactly three events" sentence reworded to
  three entry events plus the two list writes.
- T8, T9, C6, R1, D1 - `templates/agents/writer.md.tmpl`.
- C1, C4, D1 - `docs/LOOP.md`; D1, D5 - `docs/CODEX_REVIEW_QA_RECIPE.md`; D1 - `skills/qal/SKILL.md`.
- C2 - `templates/CLAUDE.md.tmpl`, loop skill; C3 - `skills/work/SKILL.md`; D2, D-12 -
  `templates/ORCHESTRATOR.md.tmpl`; D4 - loop skill; Step 1 - `skills/plan/SKILL.md`.
- (g), Q3, C-002, D6, D-12 - `docs/WORKFLOW.md`.
- trace, D-17 - `skills/qa/SKILL.md` (flag, why-text, guaranteed and passed artifacts, EVIDENCE
  block, BLOCKED precondition).

No bump, no CHANGELOG block, no migration (D-02): the managed-artifact re-render rides RULEHOME-002.

## Decisions and deviations

- Outside the worklist: `templates/memory-seeds/subagent-claims-are-inputs-not-findings.md` and the
  work skill's closing rule both said a claim to the operator carries its `file:line` - a
  contradiction with Q3 (the seeds are a home of every doctrine enumeration, WORKFLOW § COO owns
  broad scans tripwire 4). Both reworded: the evidence stands in the brief or the record.
- `templates/agents/writer.md.tmpl` "hand the COO: the full diff" -> "the diff summary (the diff
  itself stays in the tree)" - it contradicted the 25-line reply of C1.
- C4 worded so it does not contradict `skills/update/SKILL.md` Step 3 (the host may refuse the
  engine's write; run again in a mode that asks): the apply does not ask IN ADVANCE; a refusal is
  handled there. The fact-check raised the conflict.
- T6 widened on the operator's word (2026-10-31, shown list item 10: „10 + .aiwf папката, тя ми е
  проблем, скрача не ме интересува, там да си трият" - "10, plus the .aiwf folder, that is my
  problem; the scratch does not interest me, let them delete there"): at a ticket's close the
  scratch directory is emptied of everything but the route state and in-flight files, leftovers of
  earlier work included; the session's temporary directory outside the repository is not covered.
- Guard (g): the 22 rule-bearing items were shown to the operator in Bulgarian before the commit;
  the operator amended item 10 and the commit followed.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-10-31 | WORKFLOW § COO owns broad scans, tripwire 4 (seeds) | catch | the seed contradicting Q3, found by the COO's consumer grep before the commit |
| 2026-10-31 | D-16 (b) fact-check | catch | `skills/update/SKILL.md` Step 3 vs the new C4 sentence; "a Codex host reads no agent file" vs the root AGENTS.md - both reworded before the commit |
| 2026-10-31 | D-03 T6 | operator-correction | the shown list, item 10 - the cleanup covers the whole scratch directory, not only the ticket's own files |

## Verification (what actually ran)

Before the commit, from the repository root:

- the 21 grep rows of the ticket's Acceptance - every "broken" output absent, every positive row
  hit (`COVERED BY` review 2 / qa 1; `PRODUCT BOUNDARY CHECKS` 1 / 1; `fifth write` 1; `about five
  minutes` in all five files; `tuning` 1; `Refs:` both files; `QA pass` 4 files; `operator.language`
  at WORKFLOW:228; no changed line naming the brief files; no path under scripts hooks schema
  migrations .claude-plugin CHANGELOG.md);
- provenance `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks
  migrations examples README.md` - empty;
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit 0, `valid: 31 migration(s) in
  D:\promptandpray, payload version 0.3.6`;
- render dry-run `node scripts/setup/generate.mjs --answers-file
  examples/example-project/answers.json --project-root <scratchpad>/render-001 --plugin-root .
  --no-selfcheck` - exit 0; no `{{` in the rendered `CLAUDE.md`, `ORCHESTRATOR.md`, `writer.md`
  (positive control: the new text found in all three);
- fact-check (D-16 (b)): one Explore agent, `model: sonnet`, the `/pnp:review` Step 2b task over the
  diff - `CLAIMS: total=70 verified=44 false=0 unverifiable=26`; the unverifiable rows are normative
  rules with no code, harness behaviour (the 10-minute foreground cap, matched by the Bash tool's own
  600000 ms limit) and two conflicts fixed before the commit (Decisions above).

No auditor: R1 prose, the audit table's docs row has 0 passes.

## Remaining debt

None. The re-render of the managed artifacts and the 0.3.7 release are RULEHOME-002's (D-02).

## Diff review

The COO read the whole diff, hunk by hunk against its worklist row; the reading, folded in from
`.aiwf/RULEHOME-001-diff-review.md`: every row T1..D-12 landed at its anchor; the two contradictions
outside the worklist (the seed, the work skill's closing rule) and the writer "full diff" line fixed;
the narrowed-test grep is `n/a` - no test in the diff.

## Scratch

Moved first, deleted after (operator 2026-10-31: „AIWF СЕ ПОЧИСТВА - ВАЖНИТЕ НЕЩА СЕ МЕСТЯТ И ТОГАВА
СЕ ТРИЕ ... НИЩО ВАЖНО НЕ ТРЯБВА ДА СЕ ГУБИ" - "AIWF is cleaned - the important things are moved and
then deleted ... nothing important may be lost"). Moved: the diff review, folded in above;
`.aiwf/silerax-intake-brief.md` (the 2026-10-14 intake brief sent to Silerax - its marking rule and
source table exist nowhere else in `dev/`) -> `records/silerax-harvest/2026-10-14-intake-brief.md`,
the base of what RULEHOME-003 harvests. Checked landed before delete: `candidates-queue.md` - every
paragraph found in `dev/backlogs/CANDIDATES.md` by grep of its headings and items. Deleted from
`.aiwf/` at the close: this ticket's `RULEHOME-001-diff-review.md`, `candidates-queue.md`, the empty
`plan/`, `last-review-session.txt` (the legacy unkeyed file), and the RULEHOME readiness files
`review-brief.txt`, `readiness-round.txt`, `last-review-session.RULEHOME.txt` (the session id is in
`readiness/RULEHOME/round-1.md`). Kept: `route-state.json` (`{}`) and `checkpoint.md` (this
project's gate checkpoint, rewritten).

## Closing checklist

- the operator's own run: n/a - prose, no outcome visible in a running product;
- the diff review folded in: yes;
- roadmap lines: § DOCTR auto-mode line `done f61817f`; § DOCTR "eight rules" line - Q2, Q3, Q4,
  C-002 `done f61817f`, C-045 / C-064 / C-067 / C-071 left open (DECISIONS § Deferred); § SKILLS
  `--trace retain-on-failure` line `done f61817f`; the RULEHOME entry `Status: in progress`;
- out-of-scope findings: none new;
- scratch: § Scratch;
- next ticket: RULEHOME-002 in a fresh Fable session (D-08 - the two tickets route to different COO
  tiers).

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| suspended by the operator 2026-10-31 | suspended by the operator 2026-10-31 | D-11 |
