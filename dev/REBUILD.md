# REBUILD - the one document for the redesign of the PnP working cycle

> ONE place. Everything about the redesign - the goal, the cycle, the inputs, the decisions, the open
> questions, the next step - lives HERE and nowhere else. Older names (PLAN_DOCT, PLAN_FOLD, the
> "five steps", DEENG-001, "ticket 1 / ticket 2") are pointers into this file now, not separate
> threads. A proposal made in chat is not made until it is written here. The candidates file is FROZEN
> for new entries until this design is approved (operator 2026-10-17: „файла с кандидати е миш маш").
> Rewritten WHOLE at every change; history is in git.

## Status (2026-10-17, evening)

- 0.2.20 released and proven in Silerax. Closed.
- Inputs complete: the GSD / BMad / Gas Town scan is in (§ Inputs 4). § The cycle below is the COO's
  DRAFT from those inputs, with a proposed answer to every open question. Nothing in it is approved.
- Next step: the operator walks § The cycle stage by stage and § Proposed answers one by one; each
  approval or correction is written into this file. Tickets only after the whole cycle is approved.

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
| **idea** | operator -> COO | chat | one line in `ROADMAP.md`: a title and the goal in a sentence. A goal too big for one plan is several lines. | - |
| **research** | 1-2 `sonnet` scan agents, fresh context | subagent | `RESEARCH.md` in the plan folder: consumers and adjacent contracts of every touched surface, a Code Map (file -> role, no line numbers), what the code does today, open unknowns. Short; pointers, not prose. | - |
| **analysis** | COO with the operator | chat -> file | `DECISIONS.md`: numbered decisions `D-NN` (the operator's words verbatim where they are the source), a Deferred list, and numbered **Open Questions** that STOP the stage until the operator answers - an unknown is never written down as an assumption. | operator answers the OQs |
| **plan** | a planner subagent (`opus`, fresh context), briefed with RESEARCH + DECISIONS + the goal | subagent | `PLAN_<ABBR>.md` (index: goal, scope, ticket table with status) + `tickets/<ABBR>-NNN.md`, one file per ticket: Outcome, Scope, Acceptance, Risk threshold, Stop condition, Verify, Code Map slice, the `D-NN` it implements. Caps: **<= 3 tickets per plan, <= ~1,500 tokens per ticket**; over the cap = split or defer, the COO decides. The COO reads the result; it does not write the plan. | - |
| **phases** | - | - | A plan IS one phase. A bigger goal is a sequence of plans listed in `ROADMAP.md`; a later plan cites earlier `D-NN` by id, never restates them. | - |
| **plan review and approval** | (a) a mechanical gate (script, seconds): caps, every ticket has its six fields, every `D-NN` cited by some ticket, no TBD, every path in the Code Map exists; (b) **ONE Codex readiness pass** over the plan folder with the blocker contract: a BLOCKER names the property the plan must have + the evidence; INFO never triggers a revision; wording, formatting and `file:line` precision are out of scope; (c) COO triage per finding - fix / reject with a refutation / defer / ask the operator; the fix is written by the planner subagent (fresh), not by the COO; (d) cap: at most 2 revisions, and a revision that does not reduce the BLOCKER count stops and goes to the operator; a second Codex pass only when pass 1 found a BLOCKER that reverses a `D-NN`, on the operator's word | Codex + COO + planner agent | `readiness/<ABBR>/round-N.md`: the findings with their disposition (fixed / rejected: why / deferred) | operator approval -> the plan folder lands in `active/` |
| **phase execution** | Writer, fresh context | subagent | brief = `Ticket: <REF>` + "read `tickets/<REF>.md` and the files its Code Map names" + the standing lines (no restating of goal, files or acceptance) -> diff + handoff | Gate 2 dispatch |
| **phase audit** | the code pass (Codex, kept); the fact-check over the diff (one `sonnet` agent, kept - cheap); QA only for observable runtime behaviour | Codex / subagent | verdict + top findings in the handoff; the full text in a file, never in the COO's context | a word for every pass after the first |
| **commit** | the Writer (code), the COO (`records/<REF>.md`, one file per ticket) | session | two commits: code, then record | native dialog each |

Dropped from today's cycle: the behavior ledger, the consequence scan, the own-pass file, the
per-section fact-check agents over the plan, the plan gate's artifact requirement (its SHA stamp
stays as the mechanical gate's anchor). Replaced by: research BEFORE the draft (fresh context), the
mechanical gate, the blocker contract and the COO triage.

Kept unchanged: the four operator gates as native dialogs; the Writer as the only repo writer;
Reviewer/QA read-only; one doctrine for PnP and the consumers; no runtime, no daemon; English in the
tree, the operator's words verbatim in Bulgarian.

Session rule: the COO session holds the plan index, the state and the verdicts - never a plan body or
a review body; a readiness cycle starts in a fresh session; ~400k is a ticket boundary.

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
   correction rounds after implementation, COO session size at the end. The same three numbers for
   the last plan under the old cycle, from its records, as the baseline.

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
