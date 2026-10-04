# PLAN_RDY - fact-check per claim (Step 8, r0, 2026-09-29; three sonnet Explore agents, one per section group, new Step 2b task text applied by hand)

| section group | claims | verified | false | unverifiable | gaps A/B/C |
|---|---|---|---|---|---|
| A: header + Context + Mission goal + Решения | 98 | 74 | 8 | 16 | 2/1/1 |
| B: Спецификация + Step 2b + READINESS_CLASSES | 31 | 30 | 0 | 1 | 3/1/5 |
| C: Тикет + Верига + Процес + Verification | 71 | 64 | 3 | 4 | 2/3/2 |
| **total** | **200** | **168** | **11** | **21** | **7/5/8** |

## FALSE (11) - all corrected in the draft
- A: "Furnissimo Fix" read as a plan name -> session name, plan is PLAN_TUNE (header).
- A: plugin.json "11 реда" -> 17.
- A: Step 0 "byte-identical 12/12" -> 6/12; selfcheck checks four strings, not bytes (:5829-5830).
- A: grep `plan\b|...` -> 0 was false as written -> command restated as `planning lock|readiness|/plan\b` -> 0 (re-run, 0/0).
- A: seeds "printed from generate.mjs:1582" -> readMemorySeeds :1581-1585, formatReport :1669-1675, printed by interview.mjs:316.
- A: WORKFLOW :437-438 -> :436-437 (two sites).
- A: "TUNE B3, B6, B10" -> sourced to the session report explicitly (no file carries them).
- A: Решение 17 derivation -> setup-suite and plugin-validate declared as COO judgment beyond the four documented rows.
- C: aiwf-selfcheck.js:5636-5637 -> :5624-5630 (two sites).
- C: migrate.mjs:619-724 -> :619-727 (three sites).
- C: Верига row 6 endpoint "console output" -> declared as the chain's intentional end (seeds are printed, never written; no pin).

## UNVERIFIABLE (21) - disposition
- 16 in A: prospective identifiers (0.3.0, RDY), conversational events (operator word), and the consumer
  corpus numbers (54 / per-class frequencies / TUNE pass-1 = 10 / own-vs-design tallies) that exist only in
  the two session reports -> header now says so explicitly; READINESS_CLASSES.md ships WITHOUT the numbers.
  `feedback_own_pass_separate_turn` is the memory name Silerax reported (not located by this agent under
  that name; the Furnissimo variant `own-pass-separate-turn` is on disk). Furnissimo `.aiwf/readiness-*.md`
  were opened by scan 2 (sizes recorded) though agent A did not locate them - kept.
- 1 in B: the "54 itemized blockers" phrase in the shipped doc -> removed from the doc text.
- 4 in C: inventory.md / replay.md missing -> written; factcheck-r0.md -> this file; Step 0 command error
  path -> traced by the simulation agent (row 38) and fixed with `test -n`.

## GAPS (20) - all closed
A (7): allowed-tools lacked `Agent`; agents "return the file" -> COO writes every artifact; chains.md
header literal; VERIFY derivation stated honestly; column header "before pass 1" relabelled; task-text
phrases and `--apply` observability added to acceptance; regression-guard lines labelled.
B (5): READINESS_CLASSES numbers dropped; TUNE blocker ids sourced; three pointer corrections; two
missing artifacts written.
C (8): one inventory agent (WORKFLOW :377) with the condition for a second; class 14 measured (9
revision-born blockers) in Context; coverage-line heading quoted verbatim; Decision 9 and the Дуал
paragraph now both say "steps 2-8"; Explore hedge carried; header naming; the redundant :391-393
citation kept as an explicit edit target (not a defect).

CLAIMS: total=200 verified=168 false=11 unverifiable=21 -> after corrections: false=0, unverifiable
reduced to the report-sourced numbers, declared as such.
