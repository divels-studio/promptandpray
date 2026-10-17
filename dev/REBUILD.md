# REBUILD - the one document for the redesign of the PnP working cycle

> ONE place. Everything about the redesign - the goal, the cycle, the inputs, the decisions, the open
> questions, the next step - lives HERE and nowhere else. Older names (PLAN_DOCT, PLAN_FOLD, the
> "five steps", DEENG-001, "ticket 1 / ticket 2") are pointers into this file now, not separate
> threads. A proposal made in chat is not made until it is written here. The candidates file is FROZEN
> for new entries until this design is approved (operator 2026-10-17: „файла с кандидати е миш маш").
> Rewritten WHOLE at every change; history is in git.

## Status (2026-10-17, night)

- 0.2.20 released and proven in Silerax. Closed.
- **The cycle is APPROVED** - all nine stages and the six answers, by the operator on 2026-10-17 (the
  approvals are marked under the table). A second-opinion review (GPT, the same day, on this file)
  raised four architectural points and one nit; all five are taken into the text below (marked
  "review 2026-10-17").
- Next: the tickets (§ Tickets), plan A first, each on the operator's word.

## Goal

The cycle **idea -> research -> analysis -> plan -> phases -> plan review and approval -> phase
execution -> phase audit -> commit** is defined once, cheap in context and quota, and the same in
PnP and its consumers. The operator's words: „не искам да гася пожара, а да го предотвратя";
„бетон по всичко свързано с цикъла"; dozens of plans are coming in Silerax and Furnissimo, and „20х
макс план ... не стига дори и за 4 дена работа" under today's procedure.

Kept by the operator's word: a Codex readiness pass during planning and the code pass during
execution - „това доказано работи в полза на качеството и дори открива пробойни".

Measured from the first plan under the new cycle: tokens from idea to approved plan; correction
rounds after implementation; COO session size at the end of a plan. Blocker counts are NOT the measure.

## The problem, in numbers we have

- A five-ticket plan reaches PASS in two or three COO sessions of ~800k tokens (operator). PLAN_DOCT
  pass 1: 215,992 Codex tokens, ~12% of a weekly quota, 12 blockers on a docs plan.
- A consumer plan: 883 KB / 6,561 lines, >90% outside the current phase; five archived consumer plans
  607-1,635 lines each, completion records 8.8-26.5% of them (PLAN REFACTOR PDF, size tables).
- Pass 1 on five consecutive consumer plans: 10-13 blockers each AFTER the ledger and fact-check were
  applied - the pre-pass artifacts did not reduce what the pass finds.
- Session start today: 120-130k tokens in all three projects before any work.

Diagnosis, confirmed by the inputs: the cost sits in (1) WHERE the plan is written - the COO's long
session, which then carries every revision (GSD and BMad both author in fresh contexts and keep the
orchestrator thin); (2) HOW BIG the unit is (both cap a plan: 2-3 tasks / 900-1,600 tokens, one
shippable goal); (3) blockers without classes (GSD: BLOCKER / WARNING / INFO, INFO never revises;
a finding is a required property + evidence, the fix only a hint). The readiness ARTIFACTS - ledger,
consequence scan, own-pass file, per-section fact-check - are the author's homework with no measured
catch share; the mechanical half of them is a script in both frameworks, the judgment half is the pass.

## The cycle - COO DRAFT (approve, correct or strike per row)

| stage | who | where | artifact | gate |
|---|---|---|---|---|
| **idea** - APPROVED 2026-10-17 („аз казвам идеята на COO, той или агент я пише в роадмапа по строго зададен формат") | the operator says it in chat; the COO (or a scan agent) writes it | chat -> `dev/backlogs/ROADMAP.md` | one entry per idea, in the strict format below; a goal too big for one plan is one entry with several planned plans under it | - |
| **research** | 1-2 `sonnet` scan agents, fresh context | subagent | `RESEARCH.md` in the plan folder: consumers and adjacent contracts of every touched surface, a Code Map (file -> role, no line numbers), what the code does today, open unknowns. Short; pointers, not prose. | - |
| **analysis** | COO with the operator | chat -> file | `DECISIONS.md`: numbered decisions `D-NN` (the operator's words verbatim where they are the source), a Deferred list, and numbered **Open Questions** that STOP the stage until the operator answers - an unknown is never written down as an assumption. | operator answers the OQs |
| **plan** | a planner subagent (`opus`, fresh context), briefed with RESEARCH + DECISIONS + the goal | subagent | `PLAN_<ABBR>.md` (index: goal, scope, ticket table with status) + `tickets/<ABBR>-NNN.md`, one file per ticket: Outcome, Scope, Acceptance, Risk threshold, Stop condition, Verify, Code Map slice, the `D-NN` it implements. Caps: **<= 3 tickets per plan, <= ~1,500 tokens per ticket**; over the cap = split or defer, the COO decides. The COO reads the result; it does not write the plan. | - |
| **phases** | - | - | A plan IS one phase. A bigger goal is a sequence of plans listed in `ROADMAP.md`; a later plan cites earlier `D-NN` by id, never restates them. | - |
| **plan review and approval** | (a) a mechanical gate (script, seconds): caps, every ticket has its six fields, every `D-NN` **assigned to this plan** cited by some ticket (a decision carries `plan: A | B | deferred`; a decision of another plan is cited qualified, `<ABBR>/D-NN` - review 2026-10-17), no TBD, every path in the Code Map exists; the SHA stamp covers the FROZEN contract only - the index, `DECISIONS.md` and `tickets/` - never `records/` or the readiness history (review 2026-10-17); (b) **ONE Codex readiness pass** over the plan folder with the blocker contract: a BLOCKER names the property the plan must have + the evidence; INFO never triggers a revision; wording, formatting and `file:line` precision are out of scope; (c) COO triage per finding - fix / reject with a refutation / defer / ask the operator; the fix is written by the planner subagent (fresh), not by the COO; (d) cap: at most 2 revisions, and a revision that does not reduce the BLOCKER count stops and goes to the operator; a second Codex pass on the operator's word when pass 1 found a BLOCKER that reverses a `D-NN`, OR when the COO asks for it with a NAMED risk - security, tenancy, concurrency, transactions - after a substantive revision (review 2026-10-17); never automatic | Codex + COO + planner agent | `readiness/<ABBR>/round-N.md`: the findings with their disposition (fixed / rejected: why / deferred) | operator approval -> the plan folder lands in `active/` |
| **phase execution** | Writer, fresh context | subagent | brief = `Ticket: <REF>` + "read `tickets/<REF>.md` and the files its Code Map names" + the standing lines (no restating of goal, files or acceptance) -> diff + handoff | Gate 2 dispatch |
| **phase audit** | the code pass (Codex, kept); the fact-check over the diff (one `sonnet` agent, kept - cheap); QA only for observable runtime behaviour | Codex / subagent | verdict + top findings in the handoff; the full text in a file, never in the COO's context | a word for every pass after the first |
| **commit** | the Writer (code), the COO (`records/<REF>.md`, one file per ticket) | session | two commits: code, then record | native dialog each |

**Worked example - a module redesign of 5-6 tickets in a consumer (operator question 2026-10-17):**
one ROADMAP entry (Size M). Research ONCE for the whole goal, analysis ONCE (`D-01..D-NN` for the
redesign) - both live in the first plan's folder; later plans cite them by path and `D-NN` and add only a
research DELTA (what the earlier plan changed) and new `D-NN` with continued numbering. The planner cuts
independently shippable slices: plan A = tickets 1-3 (model + API), plan B = tickets 4-6 (UI). Plan B is
only a line under the entry until A is committed; it is written then, against the real code after A.
One Codex pass per plan over three tickets, each plan in its own session. Old: 1 plan x 6 tickets x 2-3
passes x 2-3 sessions. New: 2 plans x 1 pass x 3 tickets. Integration between A and B is held by the
shared `D-NN` and B's research delta, not by cross-consistency inside one 3,000-line file. The price:
B waits for A.

**Roadmap entry format (strict; the COO writes it, the operator never edits the file by hand):**

```markdown
## <ABBR> - <title>
- Goal: <one sentence - what is true when it is done>
- Why: <one sentence; the operator's words verbatim when they are the source>
- Scope: in - <...>; out - <...>
- Size: S (one plan) | M (two or three plans) | L (a sequence; each plan listed below as it is born)
- Plans: <PLAN_<ABBR> or none yet>
- Status: idea | researching | planned | in progress | done <date>
- Born: <date>, operator word „<quote>"
```

`ROADMAP.md` replaces the **Candidates** section of the transfer surface (CANDIDATES.md keeps its three
ledgers: ruling, pass statistics, event); old candidates are not migrated - an old one enters ROADMAP
the day it is taken up. The overrides' "roadmap = the open plans" becomes "ROADMAP.md + `active/`".
The payload (WORKFLOW § The transfer surface, the CANDIDATES template) learns this with the cycle's
ticket. (Operator question 2026-10-17: „няма ли да се сбие със съществуващите роадмап файлове".)

**research** - APPROVED 2026-10-17 („Е2 - да"). **analysis** - APPROVED 2026-10-17 („да").
**plan** - APPROVED 2026-10-17 („Е4 - да"), WITH MEASUREMENT: the least certain stage - whether a
planner subagent beats the COO writing a <= 3-ticket plan is unmeasured; the first Silerax plan decides
(§ Proposed answers 6). The operator's question of the day: are we copying GSD or fitting - the
mechanisms are taken, the gates, the single Codex auditor, the word per pass and the one doctrine are
ours; nothing here is proven until measured. **phases** - APPROVED 2026-10-17 („да").
**plan review and approval** (a)-(d) - APPROVED 2026-10-17 („да"). **phase execution** - APPROVED
2026-10-17 („да"). **phase audit** - APPROVED 2026-10-17 („да"). **commit + the session rule** -
APPROVED 2026-10-17 („да, Е9 приемам"); the ~400k ticket boundary is a judgment on GSD's degradation
scale (peak < 30%, good 30-50%, degrading 50-70% of the window; `gsd-core/references/context-budget.md`),
not our measurement - the COO session size at the end of the first Silerax plan is the measurement.
At >= 400k the COO finishes the current ticket (commit + record) and says "new ticket = new session";
HARD-024's checkpoint at 950k stays as the safety net, not the plan.

**ALL NINE STAGES APPROVED 2026-10-17, AND THE SIX ANSWERS BELOW CONFIRMED („да и за двете" for 5 and 6;
1-4 are settled by the approved stages).** The design is complete. Remaining: the tickets that build it
into PnP.

Dropped from today's cycle: the behavior ledger, the consequence scan, the own-pass file, the
per-section fact-check agents over the plan, the plan gate's artifact requirement (its SHA stamp
stays as the mechanical gate's anchor). Replaced by: research BEFORE the draft (fresh context), the
mechanical gate, the blocker contract and the COO triage.

Kept unchanged: the four operator gates as native dialogs; the Writer as the only repo writer;
Reviewer/QA read-only; one doctrine for PnP and the consumers; no runtime, no daemon; English in the
tree, the operator's words verbatim in Bulgarian.

Session rule: the COO session holds the plan index, the state and the verdicts; it reads the APPROVED
tickets once (<= 3 x ~1,500 tokens) and never carries their revisions or a review body; a readiness
cycle starts in a fresh session; ~400k is a ticket boundary. **Thin, not blind** (review 2026-10-17):
the planner agent's handoff is structured - which `D-NN` lands in which ticket, which dependencies
were checked, which risks remain, and pointers to the evidence - so the COO can open a proof on
doubt; "PASS, all fine" is not a handoff.

## Proposed answers to the open questions (the operator confirms or corrects)

1. Plan size: **<= 3 tickets, <= ~1,500 tokens per ticket; bigger goals = several plans in ROADMAP.md.**
2. Who drafts: **a planner subagent in a fresh context; the COO reads, triages and decides.**
3. Blocker classes in the Codex brief: **BLOCKER (required property + evidence) / INFO; wording,
   formatting and line precision out of scope; the fix is a hint, never the finding.**
4. Passes: **one by default; a second only on a BLOCKER that reverses a D-NN, on the operator's word;
   at most 2 revisions; a revision that does not reduce BLOCKERs stops and asks.**
5. Format: **the folder from the first new plan** (index, DECISIONS, RESEARCH, tickets/, records/;
   `readiness/<ABBR>/` as today); old monolith plans stay readable, no migration.
6. First measured plan: **the next real plan in Silerax**, measured on: tokens idea -> approved plan,
   correction rounds after implementation, COO session size at the end, and (review 2026-10-17) the
   TOTAL spend of the cycle - every agent's tokens as the harness reports them plus the Codex tokens -
   so a saving in the COO's context is not a cost moved to the planner. The same numbers for the
   last plan under the old cycle, from its records, as the baseline.

## Tickets that build the cycle into PnP (COO proposal 2026-10-17; the cycle applied to itself: one
## roadmap entry, three plans of <= 3 tickets, written as folders by hand until A2 teaches the tools)

**Plan A - the structure (code; Writer; a Codex pass over the code only on the operator's word)**
- A1 `ROADMAP.md`: seeded once per project from a payload template in the strict entry format
  (like the transfer surface); the Candidates section of CANDIDATES retires; setup seeds it, a
  migration seeds it on existing installations; this repo gets `dev/backlogs/ROADMAP.md` with the
  REBUILD entry as its first row.
- A2 the plan folder: `active/<ABBR>/PLAN_<ABBR>.md` + `DECISIONS.md` + `RESEARCH.md` + `tickets/<REF>.md`
  + `records/<REF>.md`; every reader learns both formats - Gate 2's lookup, the self-check's plan-ref
  section, `/pnp:mission` Step 2, `/pnp:brief`, archiving (`git mv` of the folder). Monolith plans
  stay readable; no migration of old plans.
- A3 the mechanical gate: `scripts/engine/plan-gate.js` rewritten to the new contract - caps (<= 3
  tickets, ticket size), the six fields per ticket, every `D-NN` cited by a ticket, no TBD, every Code
  Map path exists, SHA stamp of the folder; Gate 2's `Class: plan` branch and the Codex wrappers'
  exit-2 check require THIS stamp and nothing else (ledger / scan / own-pass requirements deleted).
  Self-check PLAN GATE section follows. Two implementation notes (review 2026-10-17): the stamp's
  manifest also records the text hash of every decision cited ACROSS plans (`<ABBR>/D-NN`), so a change
  in the source decision is detected by the gate; and the coverage check ships with negative tests for
  (i) a current-plan decision no ticket cites, (ii) an invalid cross-plan reference, (iii) a
  `deferred` decision wrongly demanded of the current tickets.

**Plan B - the cycle as a skill and as doctrine (prose; the COO, R1)**
- B1 `/pnp:plan` - a new skill that IS stages 1-6: the roadmap entry -> research agents (brief
  template) -> DECISIONS with Open Questions that halt -> planner agent (brief template) -> the
  mechanical gate -> ONE Codex readiness pass with the blocker contract -> COO triage table -> revision
  by the planner agent -> `readiness/<ABBR>/round-N.md` -> cap 2 / stall rule -> operator approval ->
  the folder lands. The brief templates live in the payload (`templates/briefs/`), one per agent
  (research, planner, writer-dispatch pointer, readiness-codex), so the contracts are the same in
  every project.
- B2 `/pnp:review` readiness mode reduced to what B1 calls (the gate + the one pass + the round
  ledger); Steps 2a-2e deleted; the verdict text goes to a file, only the summary enters the COO's
  context (verify what the wrapper does today).
- B3 the docs: `docs/WORKFLOW.md` § Plan readiness review, § Planning lock, § Durable development
  history (folder, records, ROADMAP), § Loop shape, § The transfer surface; `docs/REVIEW_CHECKLIST.md`
  § Plan readiness (the blocker contract); `docs/LOOP.md`; the session rule (400k boundary, fresh
  session for readiness). Release **0.3.0**: bump + CHANGELOG block whose `Retires local rules:` line
  NAMES every project-local rule the new cycle makes dead or absorbs (readiness mechanics, chain-trace
  in the evidence pack, "the plan is read by sections", "blockers of the previous ticket enter the next
  brief", readiness symmetry, the checkpoint rules the session rule replaces) + the one migration
  (A1's seed). PnP's own overrides § Loop shape is cleaned in B3 itself; each consumer deletes its
  named rules in one sitting on its operator's word (operator question 2026-10-17: „ще трябва ли
  отново да ревизираме всичко по проектите" - no: one list-driven pass per project, mostly deletions;
  old active plans finish in the old format). Then the first measured plan in Silerax.

**Plan C - after the measurement (each on its own word)**
- C1 the measurement instruments: the three numbers written into `records/<REF>.md` by the closing
  COO (Codex tokens from the pass output, rounds, session size from the context hook) - a template
  row, no tooling.
- C2 the doctrine compaction (PLAN_DOCT's material): the rule stays, the story goes; one ticket per
  document; prose, R1.
- C3 the suites: fast or fewer (CANDIDATES § The suites cost an hour).

**The session start cost (operator 2026-10-17: „нова сесия започва 140К COO контекст").** A fresh
session pays the start every time, so the ~400k boundary is a guide, never a goal: a session is cut at
a ticket boundary where it stops anyway, not for the number. The real saving is that the COO stops
READING - research, planning, revisions and verdicts run in subagents that start from their brief and
pay no doctrine preflight. The start itself is the next target: measure it right after 0.3.0 (thin
files landed); if it is still above ~100k, C2 (the doctrine compaction) moves AHEAD of the first
Silerax plan, because every new plan pays it.

Order: A -> B -> 0.3.0 -> (start measured; C2 first if > ~100k) -> Silerax plan measured -> C. Each ticket on its own word; A's code gets a
Codex pass only if the operator asks. COO routing (overrides § Loop shape, the four checks): A1, A2,
A3 `COO: top (Fable) - because check 1` (a migration, Gate 2's lookup, the gate's enforcement code);
B1, B2 `COO: cheap (Opus) - all four no` (prose); B3 `COO: top (Fable) - because check 1` (the
release ticket writes migration 0025 - corrected by the arbitration ruling of 2026-10-17 on plan RBB's
readiness pass 1, CANDIDATES § Ruling ledger; the earlier "B3 cheap" was an estimate made before the
ticket's contract existed); C1, C2, C3 `COO: cheap (Opus) - all four no`.
Nine tickets, six before 0.3.0.

## Inputs (data, not canon)

1. `dev/PLAN REFACTOR/` - a GPT analysis the operator recorded (2026-10-15). **Input only**
   (operator 2026-10-17: „не е нещо което трябва да приемем на 100%"). Its size tables are the only
   part of the PDF that survived text extraction (Cyrillic lost to font encoding).
2. `dev/backlogs/drafts/PLAN_FOLD.draft.md` - the COO's direction draft "plan as a folder"; its
   folder shape is adopted in the cycle above; its ticket list is void.
3. `dev/backlogs/drafts/PLAN_DOCT.draft.md` + `dev/backlogs/readiness/DOCT/` - the parked doctrine
   compaction; input for the doctrine-size question (a room, after the cycle).
4. **GSD / BMad v7 (+bmad-loop) / Gas Town scan (sonnet agent, 2026-10-17; clones under the session
   scratchpad, read only).** Lessons taken into the cycle, with their source:
   - revision loop with a hard cap and a stall rule; INFO never revises (GSD `references/revision-loop.md`,
     `agents/gsd-plan-checker.md`; BMad review loopback cap);
   - the blocker contract: required property + evidence + severity, the fix a non-binding hint
     (GSD `gsd-plan-checker.md:911-957`);
   - plan authored by fresh-context agents, orchestrator thin, reads frontmatter/summaries only
     (GSD `docs/ARCHITECTURE.md:72-83`, `references/context-budget.md`; BMad `step-02-plan.md`);
   - size caps as proposals with override: 2-3 tasks, <= 5 files per task (GSD); 900-1,600 tokens,
     one shippable goal (BMad `skills/bmad-build/workflow.md:23-31`);
   - mechanical checks before any LLM pass (BMad `lint_spine.py` first; GSD decision-coverage gate);
   - COO triage with a verdict per finding and routes fix / bad_plan / defer / intent_gap, reviewer
     severity ignored (BMad `step-04-review.md:53-86`);
   - review history as an append-only per-round ledger, not a contract (GSD `planner-reviews.md`);
   - auditor takes paths and returns a compact summary, full text to a file (BMad `reviewer-gate.md`);
   - Writer dispatch = a pointer to one self-contained ticket + Code Map, no restating (BMad
     `customize.toml:85-91`, `step-03-implement.md:31`);
   - frozen intent block + Open Questions that halt (BMad `plan-template.md:23-52`);
   - decision ids cited by tickets, inherited by id not by prose (GSD `templates/context.md`; BMad
     spine Inherited Invariants).
   Not transferable (conflicts with PnP's constraints): any runtime / daemon / state engine
   (gsd-tools, bmad-loop, Gas Town beads); unattended auto-advance or auto-commit; automatic
   convergence loops without the operator's word; multi-reviewer ensembles (quota x N, and a
   "findings floor"); same-model self-review in place of the Codex pass. The frameworks' own admitted
   failures: orchestrators cannot judge semantic correctness, verifiers false-pass non-inferable
   checks, plan checkers "go soft", the loop is ceremony for small tasks - the same risks apply here.
   Unverified by the agent: token savings (ranking is judgment), BMad stable v6, whether `/pnp:review`
   already returns a summary rather than the full verdict text.
5. This session's evidence: CANDIDATES § UPDATE ARCHITECTURE (tickets 1 and 2), § The suites cost
   an hour, § AFTER 0.2.20.

## Decisions already in force (operator, 2026-10-16/17; independent of the design)

- Prose in the payload is R1; code goes through the Writer; a Codex pass over code only on the word.
- A migration only for structure; the update overwrites; the project additions block is the
  consumer's home inside a rendered file.
- No suite for prose, skills, docs or templates; a `scripts/` change runs its row once; the Writer's
  green run is the verification. No audit-pass question for prose.
- The Codex readiness pass stays in the cycle.

## Pointers that now resolve here

- CANDIDATES § AFTER 0.2.20 (the five steps) -> superseded by § The cycle; the readiness cut, FOLD,
  the doctrine compaction and the suites are rooms that follow the approved cycle.
- CANDIDATES § UPDATE ARCHITECTURE, DEENG-001 -> superseded.
- PLAN_DOCT (parked), PLAN_FOLD (direction draft) -> inputs 2 and 3.
- Memory `promptandpray-mission-status` -> points here for "what next".
