# PLAN_FOLD - The plan as a folder (0.3.0)

Status: DIRECTION DRAFT, 2026-10-15. Not readiness-reviewed. Written so the decision of
2026-10-15 is not re-derived in a later session; a full analysis + readiness cycle precedes
execution. Executed AFTER PLAN_DOCT (0.2.20). 0.3.0 is this plan, not the public README: the README
is 0.3.1, after the folder format is proven on one consumer plan.

## Problem (measured 2026-10-15)

- A consumer's active plan (`PLAN_UIR.md`) is 883 KB / 6,561 lines; >90% of its lines are outside
  the current phase; completion records are 8.8% of it; phase 3 inherits rules from phase 2 which
  inherits from phase 1, so a reader opens all three (`dev/PLAN REFACTOR/Отговор 1.pdf`, sizes in
  KB and lines, not tokens). A readiness pass over the whole file is physically impossible at that
  size; a `/pnp:mission` resume reads a plan of ~34k tokens on this repo (CANDIDATES.md § intake
  item 18).
- Three things live in one file: the approved contract (what to build), the readiness history (how
  it was decided), and the completion records (what was done). Different stages need different
  parts; the monolith gives every reader all of it.
- CANDIDATES.md intake item 19 already names this ("plan as folder, one ticket per file") and defers
  it as a total change of the base workflow. It is: Gate 2's lookup, `scripts/engine/plan-gate.js`,
  the self-check's plan shape, `/pnp:mission`, `/pnp:review` Steps 2a-2e, `/pnp:brief`, the
  archiving step - all read the plan.

## Goal

A plan is a directory whose parts are read by role: the COO's start loads the index, the current
phase, the active ticket and the checkpoint; the Writer gets the ticket and the canon it depends on;
the readiness auditor gets the whole audited package (never a trimmed one); the closeout reads the
records. Old monolith plans keep working unchanged.

## Shape (the GPT proposal, adopted as the starting point; to be verified against the tree)

```text
<plansDir>/active/<ABBR>/
  PLAN_<ABBR>.md        index: goal, scope, phases, ticket table with status - the lookup target
  DECISIONS.md          canonical rules with stable ids, referenced by tickets, never inherited by
                        prose between phases
  phases/<N>/CONTRACT.md
  tickets/<ABBR>-<NNN>.md   one executable contract: Outcome, Scope, Acceptance, Risk, Stop, Verify
  records/<ABBR>-<NNN>.md   one completion record per ticket
<plansDir>/readiness/<ABBR>/   unchanged (0.2.16)
```

Manifest detection: a directory with `PLAN_<ABBR>.md` inside is the folder format; a flat
`PLAN_<ABBR>.md` under `active/` is the monolith and keeps today's behaviour. No migration of
existing plans, no sunset of the monolith, ONE doctrine for both formats.

## Decisions (direction; readiness may overturn with evidence)

- D1. Rollout in four stages (Отговор 1.pdf): format first with no rule change; migrate a COPY of a
  closed plan as the fixture (candidate: `archive/005_PLAN_CONS` or a Silerax archive); a
  completeness check (missing tickets, lost decisions, broken refs, invalid deps, audited-vs-executed
  mismatch) in the self-check; dogfood on ONE new real plan on a consumer; only then doctrine.
- D2. Never migrate an active plan mid-ticket.
- D3. Role-to-context table is a rule in `docs/WORKFLOW.md`, not advice: which role reads which
  file. The readiness auditor is the exception and reads everything audited.
- D4. An audit manifest with hashes of every audited file - the plan-gate already stamps the plan's
  SHA-256 (`/pnp:review` Step 2d); extend, do not reinvent.
- D5. New plans in English, operator words verbatim in Bulgarian (overrides § Communication, rule
  2026-10-15); old plans are not translated. Measured on one translated ticket first (Отговор 3.md).
- D6. Not adopted: Beads / a dependency daemon (Gas Town) - the plugin is not a runtime (overrides
  § Identity). Adopted as ideas only: GSD's selective reading, BMad's one-contract-per-task with
  status kept apart.
- D7. Measure before and after on the same consumer plan: COO start context, plan bytes read per
  role, Writer context, auditor blockers, lost requirements.

## Tickets (sketch; the analysis step rewrites this list)

- FOLD-001 - consumer inventory: every reader of a plan file in the payload (`file:line`), and the
  claims above verified against the tree.
- FOLD-002 - the format + detection (`scripts/engine/`), self-check completeness check, fixture
  from a copied closed plan.
- FOLD-003 - `/pnp:mission`, `/pnp:brief`, `/pnp:work` read by role.
- FOLD-004 - `/pnp:review` Steps 2a-2e and `plan-gate.js` over the folder; Gate 2 lookup.
- FOLD-005 - archiving a folder plan; `docs/WORKFLOW.md` § Durable development history + the
  role-to-context table; migration + bump 0.3.0.
- FOLD-006 - dogfood: one new real plan on a consumer in the folder format; the measurement (D7).

## Before execution

- Full analysis step (the GPT answers are a design, not a verification: competitor facts unfetched,
  "every agent reads the plan" is false for the Writer here).
- Readiness: `review.plan` row (Codex, 2 passes), R2 by the standing ruling for payload work
  (CANDIDATES.md ruling row 2026-10-14) unless a Gate's fail direction changes - then R3.
