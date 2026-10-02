# Fact-check r4 - PLAN_DRAFTS (Step 2b delta over the r7 draft, 2026-10-02, session "PNP 0.2.16")

One Explore/sonnet agent over the r7 passages (D4, D5, worklist 7(d) S3-S6, worklist 11(a) and
block P, blocks E/W/N/M/CL, the Acceptance additions, "Отхвърлени", dry trace steps 1-2) with the
three standing extra instructions; the behavior ledger rows the delta touches (A1-A7, B1-B7, E7-E9,
H5) re-anchored. CLAIMS: total=76 verified=68 false=6 unverifiable=1. GAPS: A=5 B=4 C=3. Every row
and gap closed in r7 (same revision - the delta scan 3 and this check ran over r7 before the stamp).

## FALSE rows and closures

| r7 line | finding | closure |
|---|---|---|
| 126-127 | guard (e) quoted as "outside the repository" | quoted as it stands ("outside the repo"), and phrased as an analogy to guard (e), not as what the guard says (gap C) |
| 395 | S6 "`notes.length` grows by 0" - `selfAuthored: true` fires `addNote('version-stamp')` (:5396) and the codex-qa notes | the notes assertion dropped; S6 asserts the observations delta (+3) and the printed lines; the three arrays are cut back to their snapshot in `finally` (scan rows 71-72) |
| 700 | "the sentence that starts at :124" | the replaced fragment is on :124 of the bullet that starts at :123; a hunk from :123 is an edit outside the fragment |
| 701 | hunk regex requires a comma after 124; `git diff -U0` prints `@@ -124 +124,2 @@` for a one-line old side | regex `^@@ -124(,[1-3])? \+124(,[1-4])? @@`; both forms measured on a scratch copy (scan row 78) |
| 807 | the CHANGELOG-date step attributed to the written rule (PROJECT_OVERRIDES:73-82) | attributed to the RGATE record (`archive/007:946-948`) and block CL |
| 808-810 | the 0.2.15 one-push practice called a one-off exception; the RGATE record (:909-911) calls it a proposed replacement pending guard (g) | reworded: a proposed replacement awaiting guard (g); until approved the written rule stands and a deviation is the operator's word at the tag |

UNVERIFIABLE (1): "the S1/S2 fixture passes every project-layer check" - the fixtures do not exist
yet; closed by naming the recipe (writeFixture base + the two directories / the base unchanged) and
the pristine check (:7904-7909) that asserts the base is clean; proven at execution by S6 itself.

## Gaps and closures

A (5): hunk regex (closed, as above); notes delta (closed); S6 fixture recipe (closed - recipe
named, zero `[FAIL]` rests on the pristine base); `currentSection` overwritten by `section()`
(closed - saved and restored with the three arrays, scan row 73); the draft has no home in the
Gate 3 case (closed - D4 and block E: the draft lives under `<scratchDir>/plan/<ABBR>/` with the
artifacts in that case and goes to `active/` at landing, scan row 68).
B (4): the guard (e) quote; the sentence/fragment at :123/:124; the date step's source; the S6
fixture claim - all closed as above.
C (3): the 0.2.15 practice characterisation (closed); guard (e) "allows" -> "by analogy" (closed);
ledger row B6 named no file (closed - `.claude/aiwf-native/aiwf.config.json:238-239`).

Behavior-ledger re-anchoring: A1-A7, B1-B7, E7-E9, H5 all verified at their file:line; no DOES cell
mismatch.
