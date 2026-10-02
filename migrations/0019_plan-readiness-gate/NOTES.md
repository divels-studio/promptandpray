# 0019_plan-readiness-gate

**A paid readiness pass started on an own pass nobody wrote down.** The behavior ledger and the
fact-check gate read what a plan SAYS and cannot find a rule it never wrote down, and the COO's own
pass - "a SEPARATE turn" in the doctrine - lived only in prose: measured on a consumer, it was
skipped or folded into the writing flow in five readiness cycles out of five, and each first paid
pass returned 10 or more author-side blockers.

## What changes

- **Step 2c - the consequence scan** (`/pnp:review`): before every paid readiness pass, one
  scan-tier agent per ticket reads the TREE against the plan's decisions and returns one row per
  surface that can violate one of them; the COO closes every row in a file before the pass, and the
  scan runs again over what each revision changed.
- **Step 2d - the COO's own pass, as a file**: the last act over the plan, one row per audited
  ticket against the six readiness checks, every instrument run on valid and on broken input, a
  `BLOCKERS FOUND:` count, stamped with the plan's SHA-256 (`scripts/engine/plan-gate.js --hash`).
- **The plan gate**: the readiness brief names the plan, the audited tickets and both files on five
  fixed lines, and `scripts/engine/plan-gate.js` checks them before the pass is spent - the Codex
  review wrapper refuses a plan-class run (exit 2), by its class flag or by the brief's
  `Class: plan` line, and Gate 2 denies a Claude reviewer dispatch whose brief carries that line.
  It proves presence, shape and that the own pass was stamped over the plan file the brief names -
  not that the work was good, nor that a later scan covered the revision.

## What this migration does

- **Re-renders `.claude/aiwf-native/ORCHESTRATOR.md`**: § Behavior ledger duty now carries the
  consequence scan and the own pass as the same duty, with the gate's honest limit. An installation
  that never edited the file gets the new render silently; an edited file raises the usual conflict
  question; an artifact held through an override is not applied - the new render is recorded as
  upstream.
- **One `note`** saying the above. No hook entry, matcher or ask rule changes.

## Superseded local rules

A local rule or hook that refuses a plan pass without these artifacts can become a one-line pointer
to Step 2d.
