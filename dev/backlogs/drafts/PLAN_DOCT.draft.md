# PLAN_DOCT - Doctrine: contract apart from rationale (0.2.20)

Status: DIRECTION DRAFT, 2026-10-15. Not readiness-reviewed. Written so the decision of
2026-10-15 is not re-derived in a later session; a full analysis + readiness cycle precedes
execution. Executed AFTER PLAN_PLB (0.2.19), BEFORE PLAN_FOLD (0.3.0).

## Problem (measured 2026-10-15)

- The COO's preflight set - `CLAUDE.md`, `.claude/aiwf-native/ORCHESTRATOR.md`,
  `dev/PROJECT_OVERRIDES.md`, payload `docs/WORKFLOW.md`, `LOOP.md`, `REVIEW_CHECKLIST.md`,
  `OPERATOR_PROTOCOL.md`, `READINESS_CLASSES.md`, `SESSION_BRIEF_RECIPE.md` - is 196,741 bytes
  (~49k tokens at bytes/4; `/context` on this repo measured the doctrine at ~65k + overrides ~17k,
  CANDIDATES.md § intake item 18). `docs/WORKFLOW.md` alone is 82,708 bytes / 1,141 lines and
  exceeds the Read tool's 25k-token page. `skills/review/SKILL.md` is 54,952 bytes.
- A COO session on a consumer started at 140.9K context after `/pnp:mission` (CANDIDATES.md,
  the UIR-038 measurement) and 73-75% of its spend was at >150K context. The preflight is paid on
  EVERY turn of EVERY session, so the floor is the largest lever by cost.
- Cause: every incident writes its rule AND its rationale ("measured on a consumer", "observed three
  times", the history of how the rule was learned) into the normative text. The doctrine grew by
  accretion; the register is prose, not contract.

## Goal

Same doctrine, fewer words: the normative text keeps every rule, gate, dual and pointer; the
rationale and the incident history move to a payload document read only on dispute
(`docs/RATIONALE.md`, one entry per rule, keyed by section). Target: preflight set <= 40k tokens
measured with `/context` before and after (not bytes/4). Nothing about routes, gates, hooks, roles
or the audit table changes - the plugin is not rewritten, its text is.

## Scope

1. Payload docs: `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`,
   `docs/OPERATOR_PROTOCOL.md` - split normative / rationale; rationale to `docs/RATIONALE.md`.
2. `skills/review/SKILL.md` and the other `skills/*/SKILL.md` - the same split; a skill keeps its
   steps and its contracts, and nothing it explains.
3. Templates rendered into the project layer: `templates/ORCHESTRATOR.md.tmpl` (or whatever renders
   `.claude/aiwf-native/ORCHESTRATOR.md`), the managed `CLAUDE.md` region, the agent templates -
   same split; a managed-artifact change => migration + version bump (0.2.20).
4. `dev/PROJECT_OVERRIDES.md` (this project's own copy): the incident paragraphs in § Test policy
   and § Loop shape move to CANDIDATES.md event rows or to the plan that owns them; the section
   keeps the rule. The rules queued "ВЛИЗАТ В ПЛАН Б" (CANDIDATES.md:42-81) are written here ONCE,
   in the compact register, instead of into 0.2.19 first.
5. `templates/memory-seeds/` - the closing grep of the enumeration covers them.

Out of scope: any mechanism change; the plan format (PLAN_FOLD); the context-cap hook; renaming
anything; translating archived plans.

## Decisions

- D1. Rationale is not deleted, it is relocated: `docs/RATIONALE.md` is payload and ships; a rule
  keeps a one-token pointer to its rationale entry where the rationale is what makes the rule
  survive a model change (WORKFLOW § Operator-interaction guards says why that matters).
- D2. Equivalence is proven, not felt: before the Writer dispatch a `sonnet` agent produces the
  normative inventory of the OLD text (every sentence that commands, forbids, gates, or defines a
  dual - one row each, `file:line`); after the rewrite a second agent maps every row to its new
  home; a row with no home is a blocker. This is the fact-check gate's shape, applied to a rewrite.
- D3. Class: docs (audit table row `docs 0` = no auditor). The equivalence map (D2) and the COO's
  own pass are the whole contract; the operator may add a Codex pass by word.
- D4. One ticket per document group, not one monolith ticket: the Writer's context is spent on
  writing; a 1,141-line file rewrite on a warm Writer is the failure this plan exists against.
- D5. Written in English in the compact register; operator words quoted verbatim in Bulgarian
  (overrides § Communication, operator rule 2026-10-15).

## Tickets (to be briefed after the analysis step)

- DOCT-001 - inventory: normative rows of the preflight set + skills (scan agent output, landed in
  `readiness/DOCT/`), and the `/context` measurement before.
- DOCT-002 - `docs/WORKFLOW.md` + `docs/RATIONALE.md`.
- DOCT-003 - `docs/LOOP.md`, `REVIEW_CHECKLIST.md`, `OPERATOR_PROTOCOL.md`, `READINESS_CLASSES.md`.
- DOCT-004 - `skills/*/SKILL.md`.
- DOCT-005 - templates (ORCHESTRATOR, CLAUDE.md region, agents, memory seeds) + migration + bump.
- DOCT-006 - `dev/PROJECT_OVERRIDES.md` + the queued plan-B rules + the `/context` measurement
  after; closeout.

## Before execution

- Analysis step: a scan over the preflight set that classifies each paragraph normative / rationale /
  both, with counts - the numbers above are sizes, not the split.
- Readiness: `review.plan` row (Codex, 2 passes) - a doctrine rewrite is durable R2.
- Open question for the operator at that time: does `docs/RATIONALE.md` ship in the payload, or
  stay in `dev/`? (D1 says ship; cost: payload size, benefit: a consumer can read why.)
