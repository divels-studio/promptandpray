# REBUILD - the one document for the redesign of the PnP working cycle

> ONE place. Everything about the redesign - the goal, the cycle, the inputs, the decisions, the open
> questions, the next step - lives HERE and nowhere else. Older names (PLAN_DOCT, PLAN_FOLD, the
> "five steps", DEENG-001, "ticket 1 / ticket 2") are pointers into this file now, not separate
> threads. A proposal made in chat is not made until it is written here. The candidates file is FROZEN
> for new entries until this design is approved (operator 2026-10-17: „файла с кандидати е миш маш").
> Rewritten WHOLE at every change; history is in git.

## Status (2026-10-17)

- 0.2.20 released and proven in Silerax (the update overwrites, thin rendered files). Done, closed.
- The redesign is at the INPUT stage: a scan agent is extracting the mechanisms of GSD, BMad (+ loop)
  and Gas Town; its report lands in § Inputs when it arrives. Nothing is decided below beyond
  § Decisions already taken.
- Next step: the COO drafts § The cycle from the inputs, in THIS file, and the operator approves or
  corrects it stage by stage. Only then tickets.

## Goal

The cycle **idea -> research -> analysis -> plan -> phases -> plan review and approval -> phase
execution -> phase audit -> commit** is defined once, cheap in context and quota, and the same in
PnP and its consumers. The operator's words: „не искам да гася пожара, а да го предотвратя";
„бетон по всичко свързано с цикъла"; dozens of plans are coming in Silerax and Furnissimo, and „20х
макс план ... не стига дори и за 4 дена работа" under today's procedure.

What is kept, by the operator's word: a Codex readiness pass during planning and the code pass during
execution - „това доказано работи в полза на качеството и дори открива пробойни".

What is measured, from the first plan under the new cycle: tokens from idea to approved plan;
correction rounds after implementation; COO session size at the end of a plan. Blocker counts are NOT
the measure („броя на блокерите не ни дава реална преценка").

## The problem, in numbers we have

- A five-ticket plan reaches PASS in two or three COO sessions of ~800k tokens each (operator,
  2026-10-17). PLAN_DOCT: pass 1 = 215,992 Codex tokens, ~12% of a weekly quota, 12 blockers on a
  docs plan.
- A consumer's active plan was 883 KB / 6,561 lines, >90% outside the current phase (PLAN_FOLD draft,
  measured 2026-10-15).
- Readiness pass 1 on five consecutive consumer plans returned 10-13 blockers each AFTER the ledger
  and fact-check had been applied (payload WORKFLOW § Plan readiness review) - the artifacts before
  the pass did not reduce what the pass finds.
- Session start today: 120-130k tokens in all three projects before any work (operator reading,
  2026-10-17).

Diagnosis (COO, 2026-10-17; to be confirmed by the inputs): the cost sits in (1) WHERE the plan is
written and revised - inside the COO's long session, which then carries every revision; (2) HOW BIG
the unit is - five or six tickets per plan, cross-ticket consistency, `file:line` pointers that go
stale; (3) blockers without classes - a wording nit costs the same revision + re-check + pass as a
missing lock. The readiness ARTIFACTS (ledger, consequence scan, own-pass file, fact-check per
section, plan gate) are the author's homework and have no measured catch share of their own.

## The cycle - to be drafted from the inputs (empty cells = not decided)

| stage | who (role) | where (fresh context / COO session) | artifact | gate |
|---|---|---|---|---|
| idea | operator | chat | one line in the roadmap | - |
| research | | | | - |
| analysis | | | | - |
| plan | | | | |
| phases | | | | |
| plan review and approval | Codex readiness pass (kept) + operator approval | | | operator word |
| phase execution | Writer | fresh subagent context (today) | diff + handoff | Gate 2 dispatch |
| phase audit | code pass (kept) | Codex, read-only | verdict | - |
| commit | COO / Writer | | commit | native dialog |

Constraints the cycle must honor (unchanged): the plugin is not a runtime (no daemon, no state
machine); every operator gate that can be a native dialog is one; the Writer is the only repo writer;
Reviewer/QA are read-only; one doctrine for PnP and the consumers.

## Inputs (data, not canon)

1. `dev/PLAN REFACTOR/` - a GPT analysis the operator recorded (2026-10-15): split the plan into
   files, selective reading by role, English contracts. **Input only, not accepted as such**
   (operator 2026-10-17: „не е нещо което трябва да приемем на 100%").
2. `dev/backlogs/drafts/PLAN_FOLD.draft.md` - the COO's direction draft "plan as a folder" (0.3.0),
   built on input 1. Input; its ticket list is void until this design exists.
3. `dev/backlogs/drafts/PLAN_DOCT.draft.md` + `dev/backlogs/readiness/DOCT/` - the parked doctrine
   compaction; its analyses of docs/skills/templates are input for the doctrine's size question.
4. The GSD / BMad / bmad-loop / Gas Town scan (agent, 2026-10-17) - mechanisms per stage A-H with
   source pointers; lands here when it arrives.
5. This session's own evidence: CANDIDATES § UPDATE ARCHITECTURE (tickets 1 and 2), § The suites
   cost an hour, § AFTER 0.2.20.

## Decisions already taken (operator, 2026-10-16/17; in force now, independent of the design)

- Prose in the payload is R1; code goes through the Writer; a Codex pass over code only on the word.
- A migration only for structure; the update overwrites; the project additions block is the
  consumer's home inside a rendered file.
- No suite for prose, skills, docs or templates; a `scripts/` change runs its row once; the Writer's
  green run is the verification.
- No audit-pass question for prose.
- The Codex readiness pass stays in the cycle (operator, 2026-10-17).
- The plan grows no further in the COO's session - direction, to be made a rule by § The cycle.

## Open questions for the operator (answered here, one line each, when asked)

1. Plan size cap: ≤ 3 tickets per plan, bigger goals as a roadmap list? (COO proposal)
2. Who drafts the plan: a planner subagent in a fresh context, the COO reading and deciding only?
3. Blocker classes in the Codex brief: design / integration / missing decision / infeasible proof
   count; wording and formatting out of scope - acceptable?
4. One readiness pass by default, a second only when pass 1 reverses a decision?
5. Plan format: monolith kept for the small plan, or the folder (FOLD) from the start?
6. Measurement protocol for the first plan under the new cycle - which consumer, which plan.

## Pointers that now resolve here

- CANDIDATES § AFTER 0.2.20 (the five steps) -> this file supersedes the order; steps 2-5 are rooms.
- CANDIDATES § UPDATE ARCHITECTURE, DEENG-001 -> superseded, see § Status.
- PLAN_DOCT (parked), PLAN_FOLD (direction draft) -> inputs 2 and 3.
- Memory `promptandpray-mission-status` -> points here for "what next".
