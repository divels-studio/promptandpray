# 0021_lean-readiness

**The readiness cycle paid for two scan dispatches per ticket, asked for a counter pair nobody
needed, had no class for a race left as an "accepted residual", told the own pass to open every
`file:line`, and let a plan carry line numbers in prose.** Measured on consumer readiness cycles:
the author-side blockers did not fall with the pointer discipline of 0.2.15 - their class moved,
from pointers and acceptance to design and concurrency - and on one plan 629 pointers opened by
agents in the own pass yielded 4 FALSE after the fact-check gate had already run.

## What changes

- **Step 2a of `/pnp:review`** dispatches ONE scan-tier agent per ticket that returns the behavior
  ledger and the consequence scan as two tables from one context; the files stay two (`ledger.md`,
  `consequence-scan.md`) and the plan gate is untouched. **Step 2c** describes the second table, the
  closure grammar and the delta scan before a further pass (a dispatch of its own, SCAN half alone).
- **The Pass statistics row** records which pass it was and what it cost as the engine reported it;
  the counter start/stop pair is gone and nothing asks the operator for a counter. The template and
  the skeleton in `docs/WORKFLOW.md` § The transfer surface say so, and § Branch policy loses the
  "one live auditor" clause that held only while a pair was being recorded; your seeded transfer
  surface is yours and is not rewritten.
- **Class 15** in `docs/READINESS_CLASSES.md`: a concurrency decision left as an accepted residual is
  an open decision. Readiness check 3 (hidden discovery) names, for every write, the lock and what
  runs beside it - in `docs/WORKFLOW.md`, in the fact-check instruction and in the own pass's
  `discovery` cell. The own-pass table keeps its six columns.
- **Step 2d** says what the own pass does: every pointer the Writer acts on opened, the ledger rows
  read as behavior, every instrument run with valid AND broken input - not "every `file:line`
  opened"; `docs/WORKFLOW.md` § Plan readiness review says the same.
- **Pointer discipline** (`docs/WORKFLOW.md` § Ticket brief contract and § Plan readiness review): a
  plan carries `file:line` where the Writer acts or an acceptance check reads; context cites the
  section and the symbol.
- **A plansDir under the scratch directory** is observed by the self-check (`plansDir under
  scratchDir (observed)` - a note, never a failure) and warned about by `/pnp:setup` at the plans
  question - a lexical prefix test over the configured paths (case and backslashes fold on a
  project whose `os` is windows; git is not asked); any other ignored path is detected by neither.

## What this migration does

- **Re-renders `.claude/aiwf-native/ORCHESTRATOR.md`**: § Behavior ledger duty says one agent per
  ticket, two tables, and points to Step 2d for the own pass. An installation that never
  edited the file gets the new render silently; an
  edited file raises the usual conflict question; an artifact held through an override is not
  applied - the new render is recorded as upstream.
- **One `note`** saying the above. No hook entry, matcher, ask rule, schema key or directory
  changes; `scripts/engine/plan-gate.js` is unchanged.

## Superseded local rules

A local rule for one agent returning the ledger and the scan, for no counter pair, for a
concurrency readiness class, for the own pass opening what the Writer acts on, or for `file:line`
only where the Writer acts or acceptance reads can be removed or become a one-line pointer to
`/pnp:review` Steps 2a-2d and `docs/READINESS_CLASSES.md`.
