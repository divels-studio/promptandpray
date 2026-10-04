# PLAN_RDY - fact-check per claim over r1 (2026-09-29; two sonnet Explore agents, new Step 2b task text incl. "behavior in code")

| section group | claims | verified | false | unverifiable | gaps A/B/C |
|---|---|---|---|---|---|
| 1: header + Context + Mission goal + Решения | 64 | 48 | 6 | 10 | 0/5/1 |
| 2: Спецификация + Тикет + Верига + Процес + Verification | 59 | 48 | 8 | 2 | 3/4/2 |
| **total** | **123** | **96** | **14** | **12** | **3/9/3** |

## FALSE (14) - all corrected in r1
- LIV pass 3 "чака дума" -> already ran (NEEDS-FIX, 5/6 closed, hard cap; PLAN_LIV.draft.md:817-825).
- Furnissimo chain table "44 rows" -> 38 today.
- CUTP "~11/13, ~2 design" -> 13/13, 0 (archive :689 "0 продуктови спора").
- CANDIDATES :158-159 -> :160.
- "54 blockers" vs class counts summing to 63 -> stated as tags (a blocker may carry >1 class).
- review/SKILL.md :214-221 -> :213-221 fence-inclusive (two sites).
- "every grep form falls today" -> two ORCHESTRATOR lines pass today; labelled regression guards.
- chains.md "rows 9-22, 29-34 valid" -> row 15 range 619-727, row 21 obsolete (Door 4), row 30 reads 0.2.13.
- disposition "6/6/1" -> 7 closed / 5 obsolete / 1 by fact.
- 51dd2ce as precedent for the code/docs split -> it carried dev/ files; the split is WORKFLOW :599-603 doctrine.

## UNVERIFIABLE (12) - disposition
- Session-report numbers (corpus, per-class frequencies, "6-8 of 10", TUNE B-labels, memory names, "+1" scan,
  "3 repeated classes") - declared as report-sourced in the header; none of them is in the payload text.
- CI/tag/consumer states - do not exist yet (record items, not acceptance).

## GAPS (15) - all closed
A (3): diff-guard allowlist now names the exact docs/ and migrations/ paths; § C fixes the table row format
and the acceptance regex tolerates spacing; worklist 8 states the order (after 7, before VERIFY).
B (9): the FALSE items above plus the header disclaimer narrowed to the report-only numbers.
C (3): allowlist == exclusion list; 51dd2ce citation narrowed; header vs Context sourcing consistent.

CLAIMS: total=123 verified=96 false=14 unverifiable=12 -> after corrections false=0.
Acceptance run (part 2, read-only): ~50 lines executed on today's tree - all non-guard lines return the
"broken" value today; the `node -e` one-liners and the positive-control grep (27 hits on 005_PLAN_CONS) parse
and run.
