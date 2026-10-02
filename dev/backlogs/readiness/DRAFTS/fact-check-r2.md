# Fact-check r2 - PLAN_DRAFTS (Step 2b delta over the r2 draft, 2026-10-02)

One Explore/sonnet agent over the whole r2 draft + ledger.md + fact-check-r1.md (told to repeat only
the r1 gaps still open). CLAIMS: total=208 verified=177 false=20 unverifiable=11. GAPS: A=8 B=12 C=4.
Measured baselines it recorded: main 2e1521d / origin/main 542c664; the two-element sabotage string
occurs 0 times today; `git mv -n` on the untracked draft -> exit 128; `check-ignore -q` 0/1/128;
`git grep` baselines 5 / 3 / 4; the `archive/` grep returns 15 lines (the r2 list wrote :5416-5417
as one); `readiness/<ABBR>/` rc=1; provenance greps empty; D:/pnp-live at 2e1521d, 0.2.15, clean.

## FALSE rows and closures (r3)

| r2 line | finding | closure in r3 |
|---|---|---|
| 27-28 | CANDIDATES.md:11-15 names only Silerax | Context: "two consumers" is channel testimony; CANDIDATES carries Silerax's only |
| 35-36 | mutation-guard `:98` is the allowlist line | `:71` (STATE_REL) |
| 53-54, 130, 132 | driver `:7898-7938`; exclusion `:7933` | `:7898-7936`; exclusion `!f.note` `:7927`; target rule `:7922` (also ledger.md B4 paragraph) |
| 57-58 | validate-payload `:121-157` | OP_SPECS `:105-156` |
| 73 | hash compare `:317-320` | `:313-318` |
| 163, 234-235 | WORKFLOW `:341` | the sentence `:342-343`; the exception paragraph `:346-348` (D11, 3(e)); consequence-scan row 8 closure rewritten |
| 209-213 | 1(g) `:312-313` | `:312-314` |
| 300-302 | mission sentence "in parentheses" | quoted as it stands (no parentheses, continues ", and only `active/` holds candidates") |
| 453 | managedRegions bookkeeping changes for the version | a note-only update leaves managedRegions untouched; only the version stamps and the journal change |
| 533; ledger.md:60 | 47 rows | 49 (ledger.md, revisions.md, trace) |
| 479-485 | acceptance names ids, the printer prints names | names fixed in 7(b)/(c) (`plans drafts/ (observed)`, `plans readiness/ (observed)`, `scratchDir ignored by git (observed)`); acceptance greps over a saved output file, one literal per line |
| ledger B1 | `[fixture]` suffix only when selfAuthored | corrected in ledger.md |
| ledger C9 | `.claude/aiwf-native/aiwf.config.json:4` also carries 0.2.15 | corrected in ledger.md |
| ledger para B4 | `:7898-7938` | `:7898-7936` |

UNVERIFIABLE (11): operator quotes, "3 live" (now "by HARD-023's judgement"), git keeps no empty
directory (stated as git behavior), routing checks 2-4 (now each with its reason), consumer
testimony in W, the § Release discipline proposal (channel), own-pass.md / test-setup post-change
state (not yet produced), the one-occurrence claim for the sabotage string (now: 0 today, exactly 1
after 5(a)'s verbatim insertion).

## Gaps and closures (r3)

A: (1) ids vs printed names -> closed (7(b)/(c) names + acceptance greps on `.aiwf/*-out.txt`);
(2) sabotage string 0 times today / 5(a) silent -> closed (5(a) verbatim insertion, same line,
comma-space; "0 today, exactly 1 after"); (3) closing-grep exceptions by pre-edit lines -> closed
(three exceptions named by content, judged per sentence, 15-line baseline); (4) NOTES.md and block N
unchecked -> closed (block M verbatim; two fixed-line greps); (5) S1-S4 test `detail` not the print
branch -> closed (`findingLine(f, selfAuthored)` pure function + S5 + the "not exercised" grep);
(6) fourth text and status mapping -> closed (D6 and 7(c): `not present - nothing to check`;
0 / 1 / everything else incl. `null`); (7) wrapped literals, floors -> closed (one literal per line;
floors declared as floors beside per-site literals); (8) CL date hard-coded in the grep -> closed
(regex over the day; CL says the day is verified at the tag).
B: all anchors/counts above closed; testimony marked in the text (header, Context, W, trace 2).
C: (1) CANDIDATES edit at landing -> closed (trace 1 landing step + `git add`); (2) scan closures
describe r1 designs; no delta scan over r2 -> closed (trace 1: delta scan over the changed decisions
before the stamp; rows 5, 6, 8, 13, 14, 16 rewritten to r3 in consequence-scan.md); (3) escalation
trigger 1 unexamined -> closed (new "Ескалация" paragraph under the decisions: RGATE's blocks were a
recommendation inside a verbatim block, not a D-decision; the change comes on the operator's word,
who is the escalation target of a solo installation - no trigger); (4) two dates -> closed (one
source: the day of the tag; the grep does not pin the day).
