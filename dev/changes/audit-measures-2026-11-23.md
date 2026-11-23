# Measures against wrapper blockers - the PnP arbiter session, 2026-11-23

Written into the tree by the arbiter session itself, on the operator's word of 2026-11-23: "дървото на пнп е свободно можеш
да запишеш всичко ... записвай където и каквото трябва". It is evidence and a proposal, not doctrine: nothing here is a rule
until the operator approves a text in the session that writes it. NOTHING HERE IS DECIDED YET - the operator runs an
experiment first (§ 6) and the next arbiter session decides after it (§ 7).

Read with it: `dev/changes/test-cost-research-2026-11-22.md` (the three counts, the proposal that became 0.3.22) and
`dev/backlogs/ROADMAP.md` § AUDITRULE.

Marks. OPENED = the arbiter opened the file itself. COO-REPORT = the Silerax COO's own account, pasted by the operator, not
opened by the arbiter. The consumer is Silerax, `D:\Stratex`.

## 1. The operator's words

- 2026-11-23, in the Silerax session, on the PRCCA plan (COO-REPORT): "ужас" - "за цената на планирането"; "т.е блокерите
  отново са свързани с тестовата политика по време на планиране и последните актуализации на ПНП"; "ти защо не спази
  тестовата политика по време на планирането, начина по койото одитора чете".
- 2026-11-23, arbiter session: "нямам идея кое и какво да направим но тези проблеми зачестяват и искам да вземем мерки".
- 2026-11-23, arbiter session, the experiment: "в силеракс сега ще направя експеримент, ще зануля все едно не сме
  планирали, ще изнеса готовия план извън репото и ще пусна Опус да планира на ново (сегашния план беше на Фабъл). Отдавна
  се каня да направя това и мисля че сега му е времето. Това ще покаже кое е от модела кое е от плъгина." - and: "Следващата
  нова сесия тук тръгва отново с пнп:арбитър и решаваме какво правим. това ще бъде след като опус приключи планирането".
- The experiment was first announced on 2026-11-14 (OPENED `D:\Stratex\dev\backlogs\readiness\PRCE\ledger.md`:56): "ще
  планирам едно и също нещо в две паралелни сеси едната на fable другата на Опус след това и двата плана ще ги пратя на
  кодекс".
- He delegates the engineering judgement ("ПНП е писан от АИ за АИ") and wants the problem CLASS to stop, not one more fix.
- Why this session will not be reopened: a cold reopen re-reads its whole context; the next arbiter session starts cold
  from the parked brief (`.aiwf/arbiter-brief.txt`) and this file.

## 2. The casus - plan PRCCA (Silerax, 2026-11-23)

OPENED whole: `D:\Stratex\dev\backlogs\readiness\PRCCA\round-1.md` and `round-2.md`. A plan of two tickets: one boolean
column on purchases, a two-answer field in the purchase form, a warning triangle in three table mounts and the detail head.
Planned by a Fable COO session under PnP 0.3.24 (OPENED `D:\Stratex\.claude\aiwf-native\aiwf.config.json`:4).

The Fable plan's baseline - recorded here because the operator moves the plan out of the Silerax repository:

| what | figure | source |
|---|---|---|
| readiness pass 1 | Codex gpt-6.2-sol, xhigh, cold; `BLOCKERS: 11 INFO: 4`; 268,148 tokens | OPENED round-1.md:3-4, :25 |
| readiness pass 2 | the same session resumed, on the operator's word; `BLOCKERS: 2 INFO: 3`, `CLOSED: 8 OPEN: 3`; 509,869 tokens cumulative | OPENED round-2.md:3-6, :20-22 |
| revisions | 2 (the last the cycle allows); carried OPEN rows 11 -> 3 -> 0 by the planner's hand-back | OPENED round-2.md:24-28 |
| research scans of the whole PRCC (they also serve the next three phases) | 176,871 + 176,115 + 256,495 + 231,844 | COO-REPORT |
| extra research for phase 1 | 182,370 | COO-REPORT |
| the planner - the plan and both revisions (a running total, not split) | 465,608 | COO-REPORT |
| the command pre-pass and two scans ordered by findings | 101,509 + 151,309 + 105,126 | COO-REPORT |
| the plan index | about 45 KB | COO-REPORT |
| the COO's context size | not measured (a Silerax rule of 2026-11-14 forbids asking for it) | COO-REPORT |

The 13 blockers by what they are about (the arbiter's reading of the two files; the Silerax COO counts 6 for the test
policy and 3 for the plan's form - the difference is where B9 goes, not the substance):

| kind | count | which |
|---|---|---|
| a real gap in the design | 4 | B1 the note picker does not render the alarm (a wrong claim in decision D-07); B2 the error element, and in pass 2 the radio group's accessible name; B5 the lock the migration takes; B8 the pgTAP call probes the wrong thing |
| the order of verification and the commands, restated in the plan | 6 | B7 who runs reset and in what order; B9 a placeholder inside two commands; B10 the E2E baseline and the compare command; B11 the screenshots QA must judge; B12 a redundant build and rerun (born of revision 1); B13 the unit line with the local stack down (a fact pass 1 did not open) |
| the plan's form | 2 | B4 read / lock / write rows for a write that adds one column; B6 closing-grep sets and the reader inventory - both re-opened in pass 2 |
| rejected with a refutation | 1 | B3 |

No blocker of either round asks for a test the project's policy excludes.

The COO's own ledger rows for this plan (COO-REPORT, `D:\Stratex\dev\backlogs\readiness\PRCCA\ledger.md`): four violations
of its own - a claim about the callers written without opening the picker (B1); a claim about a library's behaviour not
opened (B2); the test policy not read in full before the planner's brief or the readiness brief ("six of the thirteen
blockers of the two passes are the policy's"); a placeholder put into two commands by its own pre-pass fix (B9).

## 3. Why it happened

- 0.3.22 did what it was built for (no demand for an excluded test).
- But the readiness brief now tells the auditor to read the project's test policy (OPENED
  `templates/briefs/readiness-codex.md`:29-32), and readiness classes 8 "command not literal or cannot fail" and 11
  "process order / actor" stand (OPENED `docs/READINESS_CLASSES.md`:27, :30). The plan restated, per ticket, who runs which
  check, in what order, against which baseline; the auditor compared that text with the policy line by line. Under the
  contract "executed exactly as written, would a ticket fail, land wrong, or leave a decision open" every mismatch between
  two texts is a blocker.
- The arbiter did not foresee this when it proposed the authority split on 2026-11-22, and it deferred the Silerax
  candidate of 2026-11-14 that would have covered it (ROADMAP § AUDITRULE line (6)). The deferral was wrong.
- The Silerax COO did not read the policy before its briefs. True, and not the lever: a plan that does not restate the
  procedure has nothing to mismatch.
- Not separable yet: how much of this is the planning MODEL (the size of the plan, the restated procedure, the two wrong
  claims) and how much is the PLUGIN (what the doctrine tells a planner to write and an auditor to block on). § 6.

## 4. The pattern behind four releases in three days

| release | the blocker it turned into a note |
|---|---|
| 0.3.20 | a missing red record |
| 0.3.21 / 0.3.22 | a weak test over code the Reviewer confirmed |
| 0.3.22 | a test the project's policy excludes |
| (PRCCA, open) | a mismatch between the plan's procedural text and the policy |

Each is the same thing met at a different door: a finding about how the work is WRITTEN, PROVEN, ORDERED or RECORDED was
graded as a blocker, with no loss named for the product. An auditor at the highest effort finds every mismatch between any
two texts it is handed; the more text a plan or a brief carries, the more such findings. Fixing one door per release is the
piecemeal way the operator warned against on 2026-11-21 ("или го караме на парче"); the arbiter took part in it.

## 5. The measures proposed - one release, designed once (NOT decided)

M1. THE BLOCKER CONTRACT NAMES A LOSS (both audits). A BLOCKER names what is lost if the work runs exactly as written: what
the user sees or cannot do, what is stored or computed wrongly (data, money), who can reach what (access, tenancy,
permissions), a migration that can fail or block live traffic, or a decision left open that the Writer would have to make.
A finding that names no such loss - about how the plan or the diff is worded, ordered, proven, evidenced or recorded - is a
NOTE: the COO fixes it without a revision round and without a pass, and it never moves the verdict. The existing special
cases (the red record, the weak test over confirmed code, the test the policy excludes) become instances of this one
sentence; the floor of 0.3.22 stays. On a pass 2 the same holds for NEW findings.
   Its cost, to be told to the operator plainly: an auditor held to "name the loss" lets through a wrapper mistake that
   would have cost a failed command at execution (PRCCA's B7 and B13 look like that). It then costs one micro-round at the
   handoff instead of a readiness blocker; the product is not touched by it.

M2. THE PLAN DOES NOT RESTATE THE PROCEDURE. A ticket names only what is its own: its test files and specs, its new cases,
whether it needs a database reset and why, the literal acceptance commands for ITS OWN properties. Who runs which check, in
what order, against which baseline, with which report copy is the project's test policy, cited by one line. Readiness
classes 8 and 11 apply to the steps and commands the plan itself introduces, never to a restatement of the policy. This is
the Silerax candidate of 2026-11-14 (ROADMAP § AUDITRULE line (6)), now with its second case (PRCE, then PRCCA). It is
settled together with 0.3.11's rule that the auditor verifies the closing greps, since the two pull opposite ways.

M3. PLAN-FORM DUTIES SCALE WITH THE CHANGE. The read / lock / write rows and the closing-grep sets are owed for what the
plan CHANGES: a write whose order, lock or statement set changes; a contract whose shape changes. A write that only carries
one more column through existing statements owes one sentence saying so. Thinner evidence (PRCCA B4 and B6, each re-opened
once; the same class in PRCE's rounds) - in the release only if M1 does not already make it a note.

M4. THE COUNT IS ROUTINE, AND A RULE WAITS FOR ITS SECOND CASE. (a) Every readiness round's ledger row carries its blockers
by kind - "a loss named" / "no loss named" - as a ticket record carries the code auditor's blockers by kind since 0.3.22.
(b) For PnP itself: a change to the audit's rules ships when the same class has shown twice, as one designed release, not
one release per pasted report (ROADMAP § AUDITRULE line (2), applied to PnP's own work). 0.3.21 is the example of the
opposite.

Not proposed: lowering the readiness effort or the number of passes - the operator's cost gate. Data for him: in PRCCA
pass 2 found two new blockers, both about the order of checks; under M1 both are notes.

How to carry it, if it is decided: as a plan (`/pnp:plan`), not a quick prose edit - it changes the audit's central
sentence. Surfaces, a starting guess to be replaced by a discovery scan: `templates/doctrine/review.md.tmpl` (§ Plan
readiness - the blocker contract; § Reviewer; § Verdict), `templates/doctrine/plan.md.tmpl`,
`templates/briefs/readiness-codex.md`, `docs/READINESS_CLASSES.md`, the review and QA skills' brief skeletons,
`templates/briefs/planner.md` (M2), a migration, the changelog. One independent read of the proposed contract text before
it ships (a single Codex opinion pass, as on 2026-11-21) is worth its price - the operator's word for that one pass.
The text is checked against the cases both ways: the 12 "record only" code blockers and PRCCA's 6 procedure blockers must
come out as notes; the 15 code defects, PRCCA's 4 design gaps and PRCI round 1's B1 / B3 / B4 must stay blockers (the lists:
the research file; `D:\Stratex\dev\backlogs\readiness\{PRCCA,PRCI}\round-*.md`).

## 6. The experiment - Opus plans the same thing again

The operator's design (§ 1): the Fable plan PRCCA is taken out of the Silerax repository, the tree is set as if nothing had
been planned, and an Opus session plans the same phase. It is his experiment; the arbiter writes nothing in Silerax.

What it can tell - model against plugin:
- If Opus's plan draws the SAME kinds of blockers in about the same number (the restated procedure, the plan's form), the
  cause is the plugin: what the doctrine tells a planner to write and an auditor to block on. M1-M3 stand.
- If Opus's plan draws far fewer, or mostly "a real gap in the design", the cause is largely how Fable plans (plan size,
  restating, unopened claims). Then the measures shift toward the planner's brief and the model choice for planning (the
  audit table and the `COO: top | cheap` line), and M1 matters less.
- A mixed result is the likely one; the split by kind is what decides, not the total.

What makes the two runs comparable - to check in the next session, not assumed:
1. The same plugin version on both (the Fable plan: 0.3.24).
2. The same auditor: Codex gpt-6.2-sol, xhigh, pass 1 COLD - a resumed session or one that has seen the Fable plan is not
   comparable.
3. The same inputs: the operator's words and decisions for the phase, the same research or none on both. If Opus re-uses
   the Fable research scans, its cost column is not comparable; if it re-runs them, it is.
4. Lessons that leaked. The Fable COO learned after pass 2 that the plan should cite the test guide instead of restating
   it, and wrote that into its notes and its ledger. If the Opus session reads those notes (the checkpoint, the memory
   files, `readiness/PRCCA/ledger.md`), the experiment measures "Opus with the lesson" against "Fable without it". Either
   keep them out of its reach or record that it had them.
5. The test policy document is the same on both (cleaned into one home on 2026-11-22 - COO-REPORT).
6. Compare pass 1 with pass 1. The Fable plan had two passes and two revisions; a second Opus pass is a separate decision.

What to read from the Opus run (the same rows as § 2): the plan index's size; the number of tickets; pass 1's `BLOCKERS /
INFO`; every blocker classified by the SAME four kinds; the agents' and the auditor's token figures with their sources;
the COO's own violations, if it records any; whether it restated the verification procedure or cited the policy.

One run is one run: a single plan cannot separate a model's habit from chance. The result is a direction, to be said so.

## 7. For the next arbiter session

It starts cold with `/pnp:arbiter`. The parked brief is `.aiwf/arbiter-brief.txt` (a copy of this section and pointers);
if the scratch directory was cleaned, this file is the brief.

- The question to rule on: after the Opus experiment, which of M1-M4 go into one PnP release, changed how; and whether the
  result calls for a measure about the PLANNER (its brief, the model that plans) instead of, or beside, the auditor's
  contract.
- Ask the operator first, and only this: where the Opus plan and its readiness round are (he moved the Fable plan out of
  the repository - ask where that went too), and whether the Opus session had the Fable session's notes (§ 6, point 4).
- Then open: the Opus round file(s); this file § 2 for the Fable baseline; the research file; ROADMAP § AUDITRULE; the
  LEDGER rows of 2026-11-21 .. 2026-11-23 marked `ruling`.
- Classify the Opus blockers by the four kinds of § 2 before forming a view. Do not re-count the Fable plan - its files
  may be gone; § 2 is the record.
- Not in scope unless the operator asks: the readiness effort and the number of passes (his cost gate); Silerax's local
  rules (its own session).
- State of the earlier work: 0.3.20 (red proof narrowed), 0.3.22 (the authority split, plain notes, the Writer adds no
  test beyond the list, the record's numbers, the helper agent's hand-back file) are released and installed in Silerax
  (0.3.24). ROADMAP § AUDITRULE step 6 (the two numbers read after three or four tickets) is still ahead.

## 8. What is not known

- How many of PRCCA's six procedure blockers would have caused a real failure at execution. At least two look real; the
  executing session follows the policy, not the plan's restatement, so the practical loss is probably a failed command.
- A second plan audited after 0.3.22. PRCCA is one case of 0.3.22's side effect and the second case of the restated
  procedure.
- Whether "name the loss" makes an auditor under-flag. The defects that reach the operator after a close are recorded per
  ticket since 0.3.22; that number is the check.
- Everything marked COO-REPORT above.
