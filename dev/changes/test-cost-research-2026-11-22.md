# The cost of test proof - research of the PnP arbiter session, 2026-11-21 .. 2026-11-22

Written by the arbiter session (`pnp arbiter`, read-only on both trees) so that the research survives the session. It is
evidence and a proposal, not doctrine: nothing here is a rule until the operator approves a text in the session that writes it.

Marks used below. OPENED = the arbiter opened the file and line itself. AGENT = reported by a read-only scan agent (sonnet,
Explore), not re-opened by the arbiter. INFERRED = computed, not stated in a file. The consumer is Silerax, `D:\Stratex`; all
consumer paths are under `D:\Stratex\dev\backlogs\` unless written in full.

## 1. The operator's complaint, in his words

- "ченсе занимаваме повече с тестове от колкото със самия код, и не знам дали не се прекалява малко" (Silerax ROADMAP D-492)
- "висим 3ти час на този тикет, и през последните 2 се занимаваме с тестове, макар и кода да е доказано работещ" (same)
- "реално през последните планове това си е проблем, блокери заради червени тестове, повече писане на тестове отколкото на
  код, според мен е прекалено" (arbiter session, 2026-11-21)
- "решенията тук ще отекнат във консуматорите, затова трябва да си на 100% убеден че имаш пълния контекст на картината
  подкрепен със доводи а не догадки" (same)
- "аз не мога да взема такова решение тъй като съм нууб, затова ПНП е писан от АИ за АИ" (same)
- 2026-11-22, after 0.3.21: "както обясних в предишната арбитражна сесия, това с тестовете и тяхната поправка отнема
  повече време от колкото писане на код"
- 2026-11-22: "значи трабва да се измисли механизъм одитор да съди по вътрешните правила, въпросът остава до колко тези
  правила са надеждни и куде е златната среда"
- Earlier, 2026-11-14, after the PRCE readiness rounds (OPENED `readiness\PRCE\ledger.md`:56): "проблема не е в токените на
  кодекс, а ... ние сами си произвеждаме блокери докато планираме"
- 2026-11-18, waiving a D480 blocker (AGENT): "пропускаме го, в последно време взеха да ни връщат блокери за незаписани
  логове от червени тестове, защо така"

What he asked for: less time on tests relative to code; one decision from a whole picture, taken in PnP first and then carried
to the consumers; the engineering judgement made by the AI roles, not handed to him as options.

## 2. What was already decided and shipped

- 0.3.20 (2026-11-21, operator's dialog answer "Стесни го изцяло"): `review.md` § Test quality narrowed - red-then-green proof
  only for a test of a behaviour the ticket changes, per named fault not per test, a test written first has its proof, a
  missing red record is a note unless the Reviewer names the fault the test survives, no brief widens it. Silerax is on 0.3.20
  (OPENED `D:\Stratex\.claude\aiwf-native\aiwf.config.json`:4). Stands; nothing below contradicts it.
- Silerax local rules of 2026-11-21 (commit `28ba10ef` there): the files rule narrowed to one log per fault; the E2E / live-AI
  text; the TRM ruling row; one line per record with the auditor's blockers by kind.
- 0.3.21 (2026-11-22, released on one pasted consumer report): a test weakness over code the Reviewer confirmed is a REQUIRED
  NOTE, not a blocker; the Writer still closes it before the commit; no verification pass. No consumer has installed it
  (Silerax 0.3.20, Furnissimo 0.3.17 - both OPENED). The arbiter's view: it removes the second pass, which was already being
  declined, and keeps the work on tests - see § 9, part 2.
- PnP ROADMAP § AUDITRULE (2026-11-21): four ideas from the verification reference, in the arbiter's order.

## 3. Count A - what the code auditor's blockers were about (17 plans)

Scope: Silerax plans PRCD .. TRM (archive 076-091 plus TRM), 14-21 November; 33 tickets, 30 with a code audit, 36 code
passes, 16 `fail`. Three scan agents; the arbiter opened all 12 "record only" blockers and 10 of the 16 failing verdicts.

| kind of blocker | count |
|---|---|
| a defect in production code or product behaviour | 15 |
| a substantive test defect (the auditor names how the test fails to prove its claim) | 5 |
| "red record missing", no flaw named | 12 |
| total | 32 |

- 6 passes failed on the record alone: PRCE-001, CMSN-001, D480-001, PRCI-001, PRCI-004, PRCI-005. No code line changed
  after any of them (OPENED verdicts; e.g. `readiness\PRCI\PRCI-001\PRCI-001-codex-pass1.log`:18 "No production fix is
  requested"; `readiness\DDRM\DDRM-001\DDRM-001-codex-pass1.log`:8283 "These tests can fail; the missing property is the
  required demonstration").
- 12 of the 16 failing passes carry at least one such blocker.
- Of the 12: 7 cite the payload sentence (then `review.md`:167); 5 cite only a ticket acceptance criterion or the brief
  (D477-001 b2, D480-001 b1, PRCI-005, PRCF-002 b2, TRM-002 pass 2).
- The code defects sit almost entirely in PRCE, PRCG and TRM - database writes, SQL, import.
- What the red runs themselves caught in 33 tickets: a redundant assertion (PRCE-004, OPENED record :87) and an E2E assertion
  that reached the save path only under a fourth fault (TRM-002). The five substantive test defects were found by reading.
- Origin of the rule: Silerax plan AIOCR, 2026-10-20 (OPENED `archive\019_PLAN_AIOCR_2026-10-20\PLAN_AIOCR.md`:121) - "A test
  that cannot fail is a stop condition: every new test is shown red before green"; harvested into PnP 0.3.3 (commit `45c90ee`,
  2026-10-22). First blocker on it: IWRA-002, 2026-10-27 (AGENT).
- Other consumers: PnP's own records carry no such blocker (one grep); Furnissimo one (WSED-002, 2026-11-04), in a pass that
  also had a real defect.

## 4. Count B - where the test volume comes from (19 tickets)

Scope: PRCE-001..004, PRCF-001..005, PRCI-001..005, DDRM-001, CMSN-001, D480-001, TRM-001, TRM-002. Two attribution agents.
Attribution shows where tests came from. It does NOT show which tests were unnecessary - nobody measured that.

Sources of volume, by weight:

1. The ticket's own acceptance criterion names the tests by id, and every id becomes owed. OPENED
   `archive\077_PLAN_PRCE_2026-11-15\tickets\PRCE-002.md`:236-238 - 36 ids in one criterion. AGENT: 14 to 36 named unit ids
   per ticket across PRCE / PRCF / PRCI, plus 3-8 E2E flows; unit tests added per ticket between +25 and about +200. The
   generic sentence behind the habit: `ticket.md` § Ticket brief contract, "a test is an enumerated matrix, not a category"
   (OPENED, rendered `D:\Stratex\.claude\aiwf-native\doctrine\ticket.md`:85).
2. Additions beyond the ticket's list, by the COO's rulings and by the Writers. OPENED the phrase "beyond the ticket's list"
   in records PRCF-004:71, PRCF-005:79, PRCI-001:49. AGENT counts: 7 (PRCE-003), 12 (PRCF-002), 13 (PRCE-004), 17 (PRCF-004),
   about 29 (PRCF-005 - more than the ticket's own 26), 12 sub-cases (PRCI-001).
3. The local rule "Every change carries its tests" (operator rule 2026-10-27; OPENED `D:\Stratex\dev\PROJECT_OVERRIDES.md`
   :227-230): the tests that read the changed files are pulled into the ticket and the ones the change breaks - or that were
   already red - are fixed in it. AGENT: TRM-001's unit line grew to 62 files.
4. A new E2E spec in almost every ticket, from the ticket's line "E2E: yes - because criterion (a)/(d) of TESTING.md" (AGENT).
5. Auditor findings at code review - the smallest source (Count A: 5 substantive test defects in 32 blockers).

Explicit negative (AGENT): no brief of the nine PRCE / PRCF tickets names `review.md` "a change that reaches N surfaces
carries N fixtures or asserts" or "an obvious missing unhappy-path test". The arbiter's earlier suspicion of those two
sentences is withdrawn.

Sources of rework:

1. Red records - closed by 0.3.20 and the Silerax local rules. The widening sat in the briefs: OPENED
   `readiness\PRCE\PRCE-002\shared-brief.md`:340-341 "all of them, whether the ticket's acceptance 7 lists it or not"; OPENED
   `readiness\TRM\TRM-002\TRM-002-shared-brief.md`:66-68 ("every new or changed test", per-test log pair, SHA-256).
2. The two-phase split. OPENED `D:\Stratex\dev\PROJECT_OVERRIDES.md`:360-364 (operator rule 2026-11-08, born when one Writer
   reached a ceiling at item 36 of 38): production code by file groups, then "the tests and specs after it by the same groups
   ... production code is frozen for the test groups". Effect (AGENT): after phase 1 the tests are broken and phase 2 repairs
   them - PRCF-001 "81 error TS lines, ALL in test files", PRCF-004 "107 failed", PRCF-005 "83 unit tests failed at load",
   PRCE-003 nine type errors in test files. It also makes every red run a manufactured one: TRM-001's own Events row calls
   the freeze a violation (OPENED `records\TRM-001.md`:82). Counter-case: PRCH-001 dispatched the test group BEFORE production
   (OPENED `archive\081_PLAN_PRCH_2026-11-18\records\PRCH-001.md`:25); PRCH passed three tickets with no blocker.
3. The fact-check gate over test prose (comments and titles in test files): a micro-round in most tickets (AGENT).
4. E2E specs repaired after their own screenshots or QA shots (AGENT, several tickets).

The one measurement of weight: OPENED `archive\077_PLAN_PRCE_2026-11-15\records\PRCE-004.md`:165-171, the only record that
itemises effort per agent. Test Writers TA1 199,850 + TA2 177,848 + TB 211,580 + TE 255,690 = 844,968 (INFERRED sum);
production Writers A 107,580 + M 152,341 + N 138,305 = 398,226 (INFERRED sum) - a little over twice. Fact-check of test prose
161,405 + 131,845 against production prose 106,104. One ticket; nothing contradicts it.

## 5. Count C - what the plan-readiness auditor asked for (7 plans, 16 rounds)

Scope: PRCD, PRCE, PRCF, PRCG, PRCH, PRCI, TRM round files. One agent; the arbiter opened `readiness\PRCI\round-1.md` whole
and the cited lines of PRCH-002. The first-cut tickets are not kept (only PRCE keeps one earlier version), so the share of a
ticket's test list that came from readiness cannot be measured.

| kind of readiness blocker (live rows: BLOCKER + carried OPEN) | count |
|---|---|
| a gap in the design itself (a missing decision, a race, a broken permission, a wrong contract) | 79 |
| a direct demand for a test or proof | 14 |
| a verify command that cannot run or cannot fail | 8 |
| bookkeeping (closing-grep sets, research rows, roadmap homes) | 21 |
| total | 122 |

- Of the 14 direct demands: 5 add new test content, 3 ask that an existing test be named in the ticket, 5 fix or relax a test
  the plan already had, 1 is an E2E continuation. (AGENT classification, judgement-based at the margins.)
- The indirect path is the larger one: about 39 of the 79 design gaps carry "and prove it with a test" in the hint, and the
  COO's triage turned the hint into a named case (INFERRED by the agent from the hint column). OPENED example,
  `readiness\PRCI\round-1.md`:9-12 - the cell that loses its state on remount, the edit icon shown without the read right,
  the candidate list that drops valid targets: each fix landed with a named test. OPENED `archive\081_PLAN_PRCH_2026-11-18\
  tickets\PRCH-002.md`:101, :106, :166 - cases tagged "(round 1 B6)".
- No "shown red" criterion came from readiness; it was in the tickets before the audit. Two findings say a demanded red
  proof was unattainable.
- One new E2E spec from a direct demand, in a ticket never dispatched (TRM-004).
- Tests from readiness are attached to real gaps caught before any code exists - the cheap place to catch them. Not a
  candidate for cutting.
- At readiness the auditor WAS handed a local Silerax rule: the PRCE and PRCF plan briefs quote "Every change carries its
  tests" and call an unnamed existing test a finding (AGENT, `readiness\PRCE\PRCE-plan-brief-pass1.txt`:87-90). Three
  blockers come from that. Other plans' briefs do not carry it. So the mechanism exists by hand and unevenly.
- Lists also grew before the paid pass: PRCF's runnability pre-pass found "about twenty existing test files and four specs
  ... not named" (AGENT, `readiness\PRCF\ledger.md`:37).

Corrected picture of source 1 in § 4 - the named test list has three tributaries: the planner (the "enumerated matrix"
sentence); the rule "Every change carries its tests", enforced by the COO and by the readiness auditor; the readiness audit
attaching a test to each gap it finds. The third is the most justified, the second the most mechanical.

## 6. The mismatch between the rules Silerax works by and the rules the auditor reads

- Silerax writes tests by its own policy: `D:\Stratex\dev\PROJECT_OVERRIDES.md` § Test policy and `D:\Stratex\docs\guides\
  TESTING.md` (which layer is for what; "Not tested at all: a visual property, the text of a button / heading / label, 'the
  page loads without errors' ... a duplicate of a remaining test. Several tests that are steps of ONE flow are one test" -
  AGENT, TESTING.md:312-316).
- The code auditor is handed the rendered `review.md` (generic: "every acceptance criterion maps to a proof", "N surfaces
  carries N fixtures or asserts"), the ticket, the decisions, the plan and the Writers' brief. OPENED
  `readiness\TRM\TRM-002\TRM-002-review-brief-pass1.txt`:1-42 - the test policy is not named. Of the recent plans' review
  briefs only PRCE-001 and DTPS-001 mention TESTING.md or the overrides at all (one grep, count only).
- The five product-boundary checks the auditor gets automatically are about tenancy, RLS, i18n, money and server / client
  boundaries; none is about tests (OPENED `D:\Stratex\.claude\aiwf-native\aiwf.config.json`:207-213).
- `D:\Stratex\AGENTS.md`:13 points at the overrides only as "identity, hard rules and product truth".
- Documented collisions: PRCE-001 - the COO ruled schema-twin and message-text cases green-only, the auditor blocked; D480 -
  guards that pass at HEAD by design blocked; PRCE-001 - the QA brief asked the E2E to assert a rendering, which TESTING.md
  forbids (AGENT, record :85).
- The auditor can open any file in the repository; nothing points it at the policy, and the rules it is handed say otherwise.

Reliability of the internal rules as they stand: not good enough to be the auditor's yardstick yet. The inventory (about 100
test-obliging sentences over nine files, AGENT) found ten places where one obligation is stated twice with different
breadth - e.g. an old red test: "fixed in the same ticket" (PROJECT_OVERRIDES:227-229) / "never silently fixed, only
recorded" (generic ORCHESTRATOR, Writer) / "a small one is fixed at once" (local, 2026-11-21); and the multiplier "one
assert per surface" (generic `review.md`) against "steps of one flow are one test" (TESTING.md). TESTING.md also carries
figures from September / October.

## 7. The reference the operator asked to be weighed

`D:\Stratex\dev\references\CLAUDE_CODE_VERIFICATION.md` - a post on how one team verifies agent-written code, and the Silerax
COO's reading of 2026-11-17. A direction, not proof. What it adds to this question:

- It has no "show every test red" rule; trust in a test comes from the KIND of test (E2E on a real flow, property tests,
  differential tests) and from running the change.
- Findings are graded: important / nit / pre-existing. The red rule escaped PnP's own threshold by being unconditional.
- The reviewer is itself reviewed for over-flagging, against changes that stayed clean. Count A is the first such count here.
- A new gate starts in observe mode. "The RED runs are kept as files" (2026-11-18) blocked on the day it was written.
- A miss becomes a rule after at least two cases; rules are pruned on a routine.
- Its remedy for "unit tests pass and the feature is broken" is another kind of test, not more proof of the same tests.
These became PnP ROADMAP § AUDITRULE (four lines). PnP's `dev` held no trace of the reference before 2026-11-21.

## 8. Recorded PnP candidates in Silerax (inventory, AGENT)

Source: `D:\Stratex\dev\backlogs\LEDGER.md` § Rows that belong to no plan, rows marked `PnP-candidate`, checked against the
PnP CHANGELOG (to 0.3.21) and ROADMAP. Live set: 22 items - 8 shipped, 1 partly, 10 on the PnP roadmap only, 3 not recorded
in PnP. The frozen October list (27 items) is settled and does not bear on this.

Open and on the theme tests / auditor / planning:

| candidate | date | state in PnP |
|---|---|---|
| the readiness auditor is asked only for what the code cannot catch - money rules, invariants from both sides, locks, tenancy, what the user loses - and NOT for line pointers, test names, closing-grep counts or the form of an acceptance command (LEDGER.md:632) | 2026-11-14 | partly (the 0.3.4-era INFO wording); not on the roadmap; 0.3.11 points the other way for closing greps |
| the auditor's blockers by kind in every record (LEDGER.md:611) | 2026-11-21 | roadmap § AUDITRULE (1) |
| the five lessons of the verification post (LEDGER.md:623) | 2026-11-17 | roadmap § AUDITRULE |
| a heavy ticket is split from the dispatch (LEDGER.md:673) | 2026-11-08 | roadmap § CTX, not shipped |
| mechanical checks in batches of ~50, QA split by spec (LEDGER.md:672) | 2026-11-08 | not recorded |

Off theme, found on the way: the payload contradicts itself - tripwire 3 says a procedure agent writes its file under the
scratch directory, Gate 1 refuses the Write tool to every non-writer agent (LEDGER.md:633; one Silerax agent stopped on it);
`/pnp:plan` Step 6 still asks for the context size, which Silerax has a rule never to ask (LEDGER.md:631).

## 9. The proposal

One release of PnP, a parallel clean-up in Silerax, and two numbers measured before the planner is touched.

The principle (the operator's "golden mean"): split the authority by question, at BOTH audits - plan readiness and code
review - and hand it over the same way each time, not by a sentence in one brief.
- The PROJECT decides what is tested and at which layer (the volume) - through its test policy, named to the auditor.
- The AUDITOR decides whether a test that exists is honest (it can fail, it exercises production code, it was not narrowed
  to go green) and whether the code is correct.
- A FLOOR no project policy lowers: a behaviour that writes stored data, computes money, or sits on a surface of COO
  routing check 1 (migration, access policy, grants, auth, permission model) always owes its proof.
The mean itself is found by two numbers per ticket: the effort on tests against the effort on code, and the defects that
reach the operator after the close (his live-look corrections and post-release fixes - already written into records' Events,
never counted). While the first falls and the second does not rise, the volume can go down further.

Content of the one PnP release (parts 1-4):
1. The mechanism above, in `review.md` and `plan.md`, with the slot through which a project names its test policy (the
   existing project additions block may be enough - then it is prose only; the working session decides).
2. A test weakness over code the Reviewer confirmed is a plain note - listed in the record, its destination settled at the
   close by the out-of-scope rule - except on the floor above, where it stays a required note. Replaces 0.3.21's rule. What
   the operator loses: a later change can break that behaviour and the tests will stay green; the floor keeps that loss away
   from data, money and access.
3. A Writer adds no test case the brief does not list; a case it believes is missing goes back as a question. The COO's own
   additions are written into the ticket, with the ruling that needs them, before dispatch. What the operator loses: an
   unprompted extra case sometimes catches something; it now costs one question. Evidence: moderate (six tickets with
   counts; none shows whether the extras caught anything).
4. One line in every ticket record: the auditor's blockers by kind, the effort split (test Writers / production Writers /
   fact-check of test prose), and the defects that reached the operator after the close. Closes the 2026-11-21 candidate.

5. A helper agent may leave its hand-back as a file in the working folder (operator's word, arbiter session 2026-11-22:
   "искам помощен агент да може да пише файлове в работната папка, има много случай когато хандофа му не може да бъде
   предаден на ЦОО заради обема му"). State today (OPENED `scripts/engine/pretooluse-mutation-guard.js`:7-20): Gate 1
   lets a non-writer subagent write only where every path resolves OUTSIDE the project root; the project's own scratch
   directory (`paths.scratchDir`, `.aiwf/`) is inside it, so the write is refused. The core says two things that do not
   fit that: "A scan agent's output contract is its reply: it writes no file" and "A procedure agent that must leave a
   file writes it only under the scratch directory, at the absolute path its brief names"
   (`templates/ORCHESTRATOR.md.tmpl`, § COO owns broad scans, tripwire 3). Silerax recorded the collision as a candidate
   on 2026-11-15 (its LEDGER.md:633; one scan agent stopped at the refusal). Explore-type agents carry no Write tool at
   all, so they can only reply. Proposed: (a) Gate 1 passes a non-writer agent's write under ONE dedicated subfolder of
   the scratch directory (e.g. `<scratchDir>/agents/`), never anywhere else in it - `route-state.json`, the briefs and
   the session-id files live in the same directory and an agent that could write them could disarm the route guard or
   swap a brief; the Claude-hosted Reviewer / QA stay refused everywhere; (b) the core's two sentences become one: a
   helper agent whose hand-back is long writes it whole to the path its brief names in that subfolder and replies with a
   short summary and the path; the COO reads the file. This is CODE (a hook) - R2 through the Writer with its audit pass,
   a self-check control for the new passthrough and for each refusal that must stay. Closes the 2026-11-15 candidate.

Not in this release - PnP roadmap lines:
- The 2026-11-14 readiness candidate. Count C gives it numbers (29 of 122 readiness blockers are command form and
  bookkeeping, 79 are real design gaps), but 0.3.11 makes the auditor verify closing greps; the two are settled together.
- The heavy-ticket split, if PnP takes it for every consumer: WITHOUT the "tests after, production frozen" phase.
- The planner's "enumerated matrix": NOT changed now. It exists so a brief is precise, and there is no evidence which named
  tests were surplus. Decided on the numbers of part 4 after three or four tickets.
- `review.md` "every acceptance criterion maps to a proof" and "N surfaces carries N fixtures or asserts": NOT narrowed on
  this evidence.
- The context-size question; batches. (The Gate 1 / tripwire 3 contradiction moved into the release, part 5.)

Silerax, its own session, each text on the operator's approval there:
- Now, without waiting for the release (as with the red rule on 2026-11-21): (a) the auditor is pointed at the project's
  test policy at both audits, with the authority sentence; (b) the order of work - a split ticket keeps its file groups, but
  each group writes its tests with or before its own code, no "tests after, production frozen" phase (this amends the
  operator rule of 2026-11-08; its reason was one Writer's size, and the split by file groups stays).
- Then: one home for the test policy, the ten contradictions resolved, the stale figures removed. It touches the operator
  rules of 2026-10-27 and 2026-11-08.
- At the update: Silerax skips 0.3.21 and goes straight to the new release; the interim local texts are retired.

The order:
| # | what | where | depends on |
|---|---|---|---|
| 1 | inventory of the recorded candidates | arbiter session | done 2026-11-22 (§ 8) |
| 2 | interim relief in Silerax: the auditor pointed at the test policy; tests with the code | a new Silerax session | the operator's word |
| 3 | one PnP release (parts 1-4) | the PnP working session | step 1 |
| 4 | the Silerax test policy cleaned into one home | the Silerax session | parallel to 3 |
| 5 | Silerax updates to the release, the interim texts retired | the Silerax session | 3 and 4 |
| 6 | the two numbers read after three or four tickets; the planner question decided | an arbiter session | 5 |

## 10. What is not known

- Which tests were unnecessary: nobody measured it; every count above is about origin.
- Hours: no ticket records time. The effort split exists for one ticket (PRCE-004).
- What would have slipped without the red runs or the named cases: not recoverable from the records.
- The share of a ticket's test list that came from readiness: the first-cut tickets are not kept.
- Silerax plans before 2026-11-14 were not counted; Furnissimo and PnP itself were only grepped.
- The Codex opinion of 2026-11-21 (gpt-6.1-sol, xhigh, 113,915 tokens) read TRM-002 only; it is kept in PnP at
  `dev/changes/0.3.20-red-proof-codex-opinion.txt`; its Codex session id (moved from the untracked scratch file
  `last-review-session.D-492.txt` on 2026-11-24) is `01a1fde2-bcc5-72b0-9107-85765ddce615`.
- Classification in all three counts is judgement-based at the margins; mixed blockers were counted as the substantive kind.
- Agents' pointers marked AGENT were not re-opened; a line number may have moved since (Silerax archived plan TRM as
  `archive\093_PLAN_TRM_2026-11-21` during the work).

## 11. Sessions and messages

- Silerax COO session (stratex-45): asked for the second opinion (brief `D:\Stratex\.aiwf\D-492-arbiter-brief.md`, later
  kept under `readiness\TRM\TRM-002\D-492\`); received the arbiter's and Codex's opinions, the local-rule instructions of
  2026-11-21, and the instruction to record blockers by kind locally instead of reporting.
- PnP working session: received the 0.3.20 handover (2026-11-21); on 2026-11-22 the operator's words and the arbiter's
  opinion on 0.3.21, then the conclusions of Count B (§ 4) and a four-part proposal. It does NOT yet have Count C (§ 5), the
  mismatch (§ 6), the candidate inventory (§ 8) or the corrected proposal (§ 9).
- Nothing was sent to Silerax on 2026-11-22.
