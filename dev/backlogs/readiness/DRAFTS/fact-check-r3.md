# Fact-check r3 - PLAN_DRAFTS (Step 2b delta over the r4 draft, 2026-10-02)

One Explore/sonnet agent over the r4 delta (D5-D7, Ескалация, worklist 3(g-i), 5, 6(d), 7, 8, 10,
12, blocks E/W/M/CL, Извън обхват, Acceptance, Risk threshold) + fact-check-r2 gaps + scan rows
36-62. CLAIMS: total=155 verified=127 false=14 unverifiable=14 (the residue outside the delta is
one "not opened" row - it was verified by r1/r2). GAPS: A=9 B=8 C=5. Every row and gap closed in r5.

## The gate finding (closed before anything else)

40 of the 62 consequence-scan closures did not start with `plan:` or `no defect:` (the COO wrote
`plan (r4):`, `none`, `no defect (as RGATE):`), so `plan-gate.js` (:63, :285-287) would have refused
pass 1 as `scan-open-row` x40 - the 0.2.15 gate working on its first live plan, before any pass was
spent. Normalised with one scripted replace; the checker's own row logic re-counted 62 rows / 0 open.

## FALSE rows and closures (r5)

| r4 line | finding | closure |
|---|---|---|
| 138-141 | S5 proves `printerFor` only; a `sectionProjectLayer` ignoring it passes S5 | D5 reworded: fixtures prove text and choice; the real-run proof is the acceptance grep over the output (`(observed) - not exercised` -> 0, the `^  [NOTE] ... (observed) - ...` lines) |
| 187 | "every worklist entry carries an anchor" (routing check 2) | every CODE entry does; the release items in worklist 10 are literal values |
| 318-319 | test-setup prints only `[PASS|FAIL] <name>` | `  [PASS] <name>` with two spaces and an optional ` - detail` (test-setup.mjs:63); greps unanchored |
| 348-349 | "четири check-а" | five (S1-S5) |
| 402-403 | CLAUDE.md.tmpl:124-126 "вече носи drafts/" | "ще носи след worklist 8 - днес не" |
| 416 | ops.json `"template": "templates/CLAUDE.md.tmpl"` | `"templates/CLAUDE.md.tmpl#aiwf-core"` - all seven CLAUDE-region migrations use it; without `#aiwf-core` migrate.mjs:401-415 splices the whole template and no validator refuses it; acceptance grep added |
| 427-430 | "copy the last CLAUDE migration's format" vs "дословно"; model 0019 | the block is verbatim; the region op is byte for byte as 0012 (the last CLAUDE-region rerender); 0019 is the rerender+note shape only - D7, Outcome, scan row 51 say so |
| 451-453 | README:40 quote | README:38-41 quoted as it stands |
| 454-456 | "name ends in (observed)" vs other observation() callers | the sentence names "the three project-layer rows whose name carries (observed)" |
| 551-552 | block M "One note / No file is rendered" | block M: a CLAUDE-region bullet + "Re-renders the aiwf-core region" + "One note" |
| 612 | "трите изключения" | "двете" |
| 657-658 | Risk threshold "CLAUDE.md.tmpl outside :124" observed only by the diff count | replaced by `git grep -c "the plan lands in"` -> 1 / `"is copied into"` -> 0 on the template, the ops.json template grep, and the self-install `CLAUDE.md` grep after --apply; the w8 bullet fixes the wrap (two lines) |
| scan rows 13, 16, 51 | closures still describe r3 (findingLine; `ignored (.gitignore)`; model 0019) | rewritten to r4/r5 |
| revisions r3/r4 | "three exceptions"; "12 with a defect" | two; 15 `plan: (r4)` closures |

UNVERIFIABLE (14): git behaviours not run by the agent (128 on dubious ownership, every ignore
source, `-c core.excludesFile`, `node --check`, the spawnSync mapping - all stated as git/node
behaviour, exercised by S3/S4 and acceptance at execution); session state; operator testimony;
ORCHESTRATOR template (verified in r1); the "one <ABBR> one plan" rule (now a rule with a home -
worklist 3(j), D3); the prose risk items (stated as Codex-only observers).

## Gaps and closures (r5)

A (9): template `#aiwf-core` (closed); "дословно" vs "copy the format" (closed); 40 open scan rows
(closed - normalised, 0 open); CLAUDE.md.tmpl diff count (closed - content greps); the :124 wrap
(closed - two lines like the neighbours); the finished-plan seed sentence (closed - full sentence
given); HIERARCHY row literal (closed - `['an ANCESTOR of the plan directories (drafts)',
'docs/backlogs', 'docs/backlogs/drafts'],`); 7(c) guard fallback text (closed); S5 cannot fail if
the printer path is bypassed (closed - D5 reworded, real-run grep is the proof); self-install
CLAUDE.md after --apply (closed - acceptance grep).
B (8): all closed as in the table; the ABBR rule now has a home (3(j)); the prose risk items are
declared Codex-only in the acceptance.
C (5): "двете"; 0012 as the region precedent (D7, Outcome, scan row 51); "пет"; scan rows 13/16/51;
revisions counts.

fact-check-r2 gaps still open at r4 (A3, A5, C2) - all closed in r5 as above.
