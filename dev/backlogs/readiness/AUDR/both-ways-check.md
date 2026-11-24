# AUDR - both-ways check of D-03's draft text (D-09)

One read-only agent, Claude Opus 5.5, 2026-11-24; 169,230 tokens (its completion notification). It applied the draft of D-03
(with D-04's closing-grep sentence and D-05) to every case of § 9's list. Its report follows verbatim, then what the COO
changed. DEC = `dev/backlogs/drafts/AUDR/DECISIONS.md` as it stood before the changes (line numbers of that draft). A record
path is `D:\Stratex\dev\backlogs\archive\<plan>\records\<REF>.md`; RD = `D:\Stratex\dev\backlogs\readiness`.

## The agent's report

I opened 57 cases (the 53 listed, plus PRCCAA B2/B6/B11 and PRCCA B3). Every case was found, but the research file does not
list the 12 and the 15 one by one. It gives only counts and pointers (`test-cost-research-2026-11-22.md`:50-64), so I rebuilt
both lists from the Silerax records and verdicts. My rebuild comes to exactly 12 and 15, with 5 test defects left over
(PRCF-002 b1, D477-001 b1, DDRM-001 b1, TRM-002 B7 and B8), which makes the file's total of 32. Two choices are my inference:
which of D477's and PRCF's two blockers is "b2" (taken from sentence order in the records), and counting TRM-002 B8 as a test
defect, which the TRM-002 record itself does (`TRM-002.md`:62-63, B8 "mixed", counted as the substantive kind). One pointer in
the brief disagrees with the source: it lists PRCCA's procedure blockers as B7/B9/B10/B11, but
`audit-measures-2026-11-23.md`:57 also counts B12 and B13 from pass 2. I tested both.

| case | what it said | new text | expected | result | deciding words |
|---|---|---|---|---|---|
| A1-1 PRCE-001 B1 | 18 cases and E2E flows 2-4 not shown red (PRCE-001.md:124) | NOTE | NOTE | OK | "proven, evidenced or recorded" DEC:41 |
| A1-2 PRCF-002 b2 | 11 instances with no red run that the brief claimed (PRCF-002.md:67,95) | NOTE / borderline | NOTE | borderline | "required verify command that was not run" DEC:51 |
| A1-3 D477-001 b2 | unit red runs not kept (D477-001.md:51-52) | NOTE / borderline | NOTE | borderline | DEC:41 vs :51 |
| A1-4 CMSN-001 B1 | red runs not kept (CMSN-001.md:49) | NOTE | NOTE | OK | "recorded" |
| A1-5 D480-001 B1 | the ticket "requires an observed failure" on E2E; no red run (RD\D480\D480-001-codex-pass1.log:4059) | BLOCKER | NOTE | WRONG SIDE | "a required verify command that was not run stay blockers" DEC:51 |
| A1-6 D480-001 B2 | guards L5/P22/P23 have no red run (log:4061) | NOTE / borderline | NOTE | borderline | "a proof that cannot fail" DEC:39 (the guards are green at HEAD by design) |
| A1-7 PRCI-001 B1 | red runs missing for 12 sub-cases (PRCI-001.md:72) | NOTE | NOTE | OK | "evidenced" |
| A1-8 PRCI-004 B1 | S4 never shown red (PRCI-004.md:68) | NOTE | NOTE | OK | same |
| A1-9 PRCI-005 B1 | X16 never seen red; only the ticket requires it (PRCI-005.md:117) | NOTE / borderline | NOTE | borderline | DEC:51 |
| A1-10 DDRM-001 b2 | "These tests can fail... A5 requires RED" (RD\DDRM\DDRM-001\DDRM-001-codex-pass1.log:8278-8283) | BLOCKER / borderline | NOTE | WRONG SIDE (risk) | DEC:51, the ticket's A5 |
| A1-11 TRM-001 B3 | fault-red evidence missing (RD\TRM\TRM-001\TRM-001-review-pass1-verdict.txt:15) | NOTE | NOTE | OK | "evidenced" |
| A1-12 TRM-002 p2 #3 | 4 round-1 tests have no red (RD\TRM\TRM-002\TRM-002-review-pass2-verdict.txt:19) | NOTE / borderline | NOTE | borderline | DEC:51 |
| A2 PRCCA B4 | read/lock/write rows for a write that adds one column (`D:\RCCA_TMP\readiness\PRCCA\round-1.md`:12) | NOTE | NOTE | OK | D-05 "carries one more column... one sentence" DEC:73-74 |
| A2 PRCCA B6 | closing sets missing; lock-icon test not on the unit line (round-1:14) | NOTE / borderline | NOTE | borderline | "a missed consumer the change breaks" DEC:49, D-04 DEC:70-71 |
| A2 PRCCA B7 | reset given to an agent that may not run it, before stack start (round-1:15) | NOTE / borderline | NOTE | borderline | "command that cannot run" DEC:42 vs "verify command not run" DEC:51 |
| A2 PRCCA B9 | `<the dispatch HEAD>` placeholder in a command (round-1:17) | NOTE | NOTE | OK | "a command that cannot run as written" |
| A2 PRCCA B10 | no baseline, comparator exits BASE REQUIRED (round-1:18) | NOTE / borderline | NOTE | borderline | "procedure... missing" vs "proof that cannot fail" (its hint: require O1-O4 passed) |
| A2 PRCCA B11 | QA states have no artifacts (round-1:19) | NOTE / borderline | NOTE | borderline | "evidenced" vs "proof" |
| A2 PRCCA B12 | redundant build and rerun (round-2:14) | NOTE | NOTE | OK | "ordered", "procedure restated" |
| A2 PRCCA B13 | unit line run with the stack up (round-2:15) | NOTE | NOTE | OK | "ordered" |
| A2 PRCCA B3 (rejected) | a saved `checks:false` hides the alarm (round-1:11) | BLOCKER | rejected | noise | "user sees wrong"; the text has no reachability word |
| A3 PRCCAA B1 | closing sets miss consumers incl. the dossier's "exact column assertions" (RD\PRCCAA\round-1.md:8) | BLOCKER | NOTE | WRONG SIDE | "a missed consumer the change breaks" DEC:49, D-04 DEC:70-71 |
| A3 PRCCAA B3 | note transaction rows (round-1:10) | NOTE | NOTE | OK | D-05 |
| A3 PRCCAA B4 | edit/insert lock rows (round-1:11) | NOTE | NOTE | OK | D-05 |
| A3 PRCCAA B5 | joint-save rows (round-1:12) | NOTE | NOTE | OK | D-05 |
| A3 PRCCAA B8 | roadmap home for a deferred item (round-1:15) | NOTE | NOTE | OK | "recorded" |
| A3 PRCCAA B9 | bare npm build plus Playwright attach; reset actor (round-1:16) | NOTE / borderline | NOTE | borderline | DEC:42 vs DEC:51 |
| A3 PRCCAA B10 | unit gate misses regressions; the new schema proof is ungated (round-1:17) | borderline | NOTE | borderline | "proof that cannot fail for the ticket's own" |
| A3 PRCCAA B13 | the comparator passes when the named proof never ran (round-1:20; round-2:22) | BLOCKER | NOTE | WRONG SIDE | "a proof that cannot fail for the ticket's own product property" DEC:39 plus "a test skipped" DEC:51 |
| B1-1 PRCE-002 B1 | header totals summed as floats (PRCE-002.md:107) | BLOCKER | BLOCKER | OK | "money wrong" |
| B1-2 PRCE-002 B2 | stale deduction after a VAT change (:107-108) | BLOCKER | BLOCKER | OK | money / stored data |
| B1-3 PRCE-003 B1 | table sorts the gross, shows the net (PRCE-003.md:144-146) | BLOCKER | BLOCKER | OK | "user sees wrong" |
| B1-4 PRCG-001 B1 | SQL `\s` misses U+00A0/FEFF (PRCG-001.md:41) | BLOCKER | BLOCKER | OK | stored data |
| B1-5 PRCG-001 B2 | counter locked after the reference locks (:44) | borderline | BLOCKER | borderline | no lock-order / deadlock loss in DEC:37-39 |
| B1-6 TRM-001 B1 | non-string plate bypasses the gate and is stored (TRM-001 verdict:4) | BLOCKER | BLOCKER | OK | stored data |
| B1-7 TRM-001 B2 | SQL and TS normalise differently (:6) | BLOCKER | BLOCKER | OK | stored data (migration) |
| B1-8..13 TRM-002 B1-B6 | "0001"->"1"; in-group dot; unread piece imported; clearing leaves the row invalid; info mark lost; trailer warning lost (TRM-002 pass1 verdict:6-16) | BLOCKER x6 | BLOCKER | OK | stored data / "user sees wrong or cannot do" |
| B1-14 TRM-002 p2 #1 | blur admits the refused value (pass2:17) | BLOCKER | BLOCKER | OK | stored data |
| B1-15 TRM-002 p2 #2 | a duplicate hides the D-53 error (pass2:18) | BLOCKER | BLOCKER | OK | "user sees wrong" |
| B2 PRCCA B1 | the picker does not render the promised alarm (round-1:9) | BLOCKER | BLOCKER | OK | "user sees wrong"; "decision left to the Writer" |
| B2 PRCCA B2 | `FormMessage` renders nothing (round-1:10) | BLOCKER (only via "decision left") | BLOCKER | OK, weak | the user still sees the error beside the label, so "user sees wrong" is thin |
| B2 PRCCA B5 | ADD COLUMN takes ACCESS EXCLUSIVE; no contention rule (round-1:13) | NOTE | BLOCKER | WRONG SIDE | "a migration that fails or cannot be applied" DEC:38; the hint is a procedure ("procedure... missing" DEC:42) |
| B2 PRCCA B8 | 3-argument `has_column` probes table `public` (round-1:16) | NOTE | BLOCKER | WRONG SIDE | it is a proof that cannot PASS, not one that "cannot fail"; "a wrong command is caught when the ticket runs" DEC:45 |
| B3 PRCCAA B7 | a mark-only edit can change VAT and stored totals (round-1:14) | BLOCKER | BLOCKER | OK | money |
| B3 PRCCAA B12 | the filter proof passes with an unwired checkbox (round-1:19) | BLOCKER | BLOCKER | OK | proof clause |
| B3 PRCCAA B14 | a writer that always stores `false` passes (round-2:9) | BLOCKER | BLOCKER | OK | proof clause |
| B4 PRCI B1 | a remount loses the saving state and the refusal (RD\PRCI\round-1.md:9) | BLOCKER | BLOCKER | OK | user sees wrong |
| B4 PRCI B3 | edit icon shown without the read right (:11) | BLOCKER | BLOCKER | OK | "cannot do"; the server refuses, so this is not an access hole |
| B4 PRCI B4 | mass move drops valid targets (:12) | BLOCKER | BLOCKER | OK | "cannot do" |
| extra PRCCAA B2 | existing tests and exact payload asserts break (round-1:9) | BLOCKER if tests count as consumers, else NOTE | (real) | - | DEC:49 / :51 |
| extra PRCCAA B6 | migration lock (round-1:13) | NOTE | (real) | - | same as PRCCA B5 |
| extra PRCCAA B11 | the seed helper rejects the fixture, so the test cannot run (round-1:18) | NOTE | (real) | - | "command that cannot run" |

Wrong side, the minimal wording changes:

1. PRCCA B5, migration lock (must stay a blocker, comes out a note). The earlier proposal said "a migration that can fail or
   block live traffic" (`audit-measures`:101). The draft dropped the second half. Change DEC:38 to: "a migration that fails,
   cannot be applied, or blocks live traffic while it waits for or holds its lock." Side effect: PRCCAA B6 becomes a blocker
   too, which matches the arbiter's "real". No must-be-note case moves.
2. PRCCA B8, wrong `has_column` signature (must stay a blocker, comes out a note). Change DEC:39 to: "a proof that does not
   test the ticket's own product property: its assertion stays green when the property is broken, or probes another object
   than the one the ticket changes." Side effect: PRCCAA B11 stays a note (it cannot run; it does not probe the wrong object).
   PRCCA B9 stays a note (a command, not a proof).
3. PRCCAA B13 (must be a note, comes out a blocker); PRCCA B10, B11 and PRCCAA B10 are borderline the same way. "Proof that
   cannot fail" catches the gate around a proof as well as the proof itself. Add to DEC:42: "...so is the gate that collects a
   proof's result: which specs run together, the baseline, what the comparator requires, which artifacts QA gets." Side
   effect: PRCCAA B12 and B14 stay blockers, because they are the tests' own assertions.
4. D480 B1 and DDRM b2 (must be notes); A1-2, -3, -9, -12 borderline. The clause "a required verify command that was not run"
   (DEC:51) has no definition. A ticket or brief that demands a red run makes that red run "required", which overrides the
   red-proof rule. D-03 does not repeat that rule's "no brief widens it" (`test-cost-research`:35). Change DEC:50-51 to: "at
   the code pass, a test that failed, a test skipped or narrowed to get green, and a VERIFY row or project verify command that
   was not run stay blockers; a missing red run is not one (§ Test quality), whatever the ticket or brief demands." Side
   effect: none of the must-stay cases depends on a red run. TRM-002 B8 stays a blocker under the proof clause. Scoping the
   clause to the code pass also settles PRCCA B7 and PRCCAA B9 at readiness.
5. PRCCAA B1, missed consumers (must be a note, comes out a blocker). A test whose exact column assertions break counts as "a
   missed consumer the change breaks" (DEC:49, :70-71). Change to: "a production reader the change breaks; a test it breaks is
   a note: it fails at the run, where the dual of § Test findings holds it." Side effect: PRCCAA B2 becomes a note. B2 is not
   on the must-stay list but the arbiter calls it real, so the operator should know. Without the "at the code pass" scoping
   from change 4, the "a test that fails" clause pulls B1 back to a blocker at readiness.

Borderline:
- "cannot fail" (DEC:39): D480 B2 (tests green at HEAD by design) and PRCCAA B10 (the ticket's own new schema proof is ungated).
- "required" (DEC:51): every red-run blocker whose demand comes from the ticket or brief (A1-2, -3, -9, -12).
- Lock order / deadlock is not on the loss list: PRCG-001 B2 stays a blocker only if the auditor translates it into "cannot
  do" or "stored data wrong". Proposed: add "a race or lock order that loses, duplicates or deadlocks a write". It carries a
  small risk of reviving the D-05 research-row findings (PRCCA B4, PRCCAA B3-B5).
- "decision left to the Writer" is all that keeps PRCCA B2 a blocker. It also means a decision left to the COO, as in PRCCA
  B5's retry rule, names no loss.
- "consumer the change breaks" (PRCCA B6 and its pass 2) depends on whether the auditor shows the break.
- No reachability or magnitude word: PRCCA B3 (rejected) and PRCE-002's pass-2 overflow above about 90 trillion
  (PRCE-002.md:111-112) would block. Only the risk threshold filters them.

Counts: 57 cases opened, 0 not found. The 12 and the 15 were rebuilt from the records and verdicts, not read from a list in
the research file. The research file counts 12 of 16 failing passes carrying a record-only blocker
(`test-cost-research`:61); my rebuild gives 11 such passes, or 12 if TRM-002 pass 1 is counted for B8's missing-records half.

## What the COO changed in D-03 / D-04 (2026-11-24)

All five wrong-side changes taken as proposed, and the lock-order borderline: the loss list gained "blocks live traffic while
it waits for or holds its lock" and "a race or a lock order that loses, duplicates or deadlocks a write"; the proof clause
became "does not test the ticket's own product property - its assertion stays green when the property is broken, or it
probes another object"; the note list gained the gate that collects a proof's result; the dual names "a production reader
the change breaks" and makes a test the change breaks a note at readiness; the kept-blocker clause is scoped to the code pass,
names "a VERIFY row or project verify command", and says a missing red run is not one whatever the ticket or brief demands.
Consequence named to the operator: PRCCAA B2 (existing tests broken by the change) becomes a note at readiness - it fails at
the run. Left as they are: the reachability / magnitude borderline (the risk threshold filters it), "a decision left to the
COO" (not a loss to the user).
