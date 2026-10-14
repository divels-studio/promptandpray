# Fact-check r6 - PLAN_LEAN (Step 2b, delta over the r6 draft)

One Explore/sonnet agent, 2026-10-14, HEAD b916af0 (payload unchanged since 77936fc), over the parts
r6 changed (header, context (b), D3, D6, D9, D14, title and Outcome, worklist 2(f), 2(g), 3, 4, 9(b),
9(c) S7, 12(d), blocks T, B, N, M, CL, out of scope, the changed acceptance lines, the one-line
literal list, risk threshold, commit subject, trace step 1; revisions.md r6; ledger E4, E5), with the
three extra readiness instructions. Ran today: the 12(d) anchors (`start/stop` 3 hits: template :13,
WORKFLOW :783, :915; `live auditor` 1 hit: :914); the skeleton awk|diff (rc=0; one-word mutation ->
`13c13`/`22c22`, rc=1); an O1+O2 simulation through process substitution, `diff -U0` -> 2 hunks
(`@@ -177,2 +177,5 @@`, `@@ -189,3 +192,5 @@`); block T line 1 = 98 chars, block B lines 93 and 84;
the anchor faces of `which pass it was and what it cost as the engine` (rc=1, both files) and
`zero paid auditor passes. It is an OPERATOR-HELD` (rc=1).

CLAIMS: total=62 verified=56 false=5 unverifiable=1 - GAPS: A=2 B=4 C=4

## FALSE and UNVERIFIABLE rows and their closure (r6)

| # | claim (r6) | correct value | closure |
|---|---|---|---|
| 1 | D3: the note op tells installations in place they can change their text | block N said only "stays as you have it" | plan: block N says "stays as you have it and is yours to change" |
| 2 | block M: the re-rendered § Behavior ledger duty says what the own pass opens, reads and runs | O1/O2 say one agent, two tables, and point to Step 2d | plan: M says "and points to Step 2d for the own pass" |
| 3 | ledger E4: block T is THREE lines, template 24 -> 25 | two lines, template stays 24 | ledger E4 rewritten |
| 4 | ledger E5: WORKFLOW :915 stays; grep (d) anchor 3 unchanged | block B removes :913-917; grep (d) after is empty | ledger E5 rewritten |
| 5 | ledger H6: block T is three | two | ledger H6 rewritten |
| U1 | trace step 1: Pass statistics tokens "from the wrapper" | codex-review.ps1 has no token handling; the figure is codex's own output passed through | plan: "the tokens as codex prints them in the wrapper's output" |

## Gaps and their closure (r6)

| group | plan line | gap | closure |
|---|---|---|---|
| A1 | risk threshold / acceptance | only the literal `start/stop` observes a leftover pair; "read off the host" or "counter pair" would pass | plan: acceptance adds `git grep -n -i -E "read off the host\|counter pair" -- docs skills templates` -> empty (anchor measured today: 2 hits, WORKFLOW :784, template :14); the prose-observer line names the three words |
| A2 | block T | line 2 "  reported it." is covered only by file-to-file equality | plan: acceptance adds `git grep -c "^  reported it\.$" -- templates/PNP_CANDIDATES.md.tmpl docs/WORKFLOW.md` -> 1 per file (anchor measured today: no output, rc=1) |
| B1 | D3 vs block N | = FALSE 1 | closed above |
| B2 | block M | = FALSE 2 | closed above |
| B3 | trace step 1 | = U1 | closed above |
| B4 | ledger E4, E5, H6 | = FALSE 3-5 | closed above |
| C1 | header chain | the chain ends at r5 | plan: header r6 note carries "r5 -> r6" with delta scan 4 and this file |
| C2 | ledger B6, B14 | still describe the `typeof` guard and omit `solaris` | ledger B6, B14 annotated "(r6: ...)" in place |
| C3 | scan rows 58, 59 | closures still say the `typeof` guard | rows annotated "(superseded r6 ... rows 85-91)" in place |
| C4 | scan rows 7, 8, 10 | superseded only in the delta-4 trailer | rows annotated "(superseded r6 ...)" in place |
