# 0026_ledger

**An installed project gets its ledger - `<plansDir>/LEDGER.md`, the pointer index the transfer
surface now is - and the two rendered files that say where things are written are re-rendered.**

## What changes

- `<plansDir>/LEDGER.md` - a pointer index: one line per plan under `## Plans` (its readiness folder
  and its records), plus the rulings, passes, events and dropped ideas that belong to no plan. It is
  seeded once and then yours: nothing records it, hashes it or rewrites it.
- `paths.transferSurface` - the config key that names the ledger. An installation that has no key
  is asked for it (the default is `docs/backlogs/LEDGER.md`, the seed's path under the default
  `plansDir`); an installation whose key is already set keeps it, and the page it names stays
  exactly as it is. Switching an existing key to the new ledger is your own edit, made when you
  choose to.
- The managed `CLAUDE.md` region gains `## Where things are written`: ideas, plans, readiness, closed
  tickets and their events, the plan-less rows, doctrine and project rules - each with its home.
- `.claude/aiwf-native/ORCHESTRATOR.md` - § The event ledger: a ticket's event row goes into its
  `records/<REF>.md`, a plan-less one into the ledger; the full text is payload `docs/WORKFLOW.md`
  § The ledger.

## What this migration does

Four operations, in this order, nothing else. One `seed-file`: `templates/LEDGER.md.tmpl` to
`<plansDir>/LEDGER.md` (the `<plansDir>` this project configures), written only when the file is
absent, kept byte for byte when it is there, and never recorded; it runs first because no seed may
address the configured transfer surface, so the key cannot point at the file before it exists. One
`add-config-key`: `paths.transferSurface`, asked of the operator with the default
`docs/backlogs/LEDGER.md`, skipped where the key is present. Two `rerender-managed-region`: the
`aiwf-core` region of `CLAUDE.md` and `ORCHESTRATOR.md` on every installation. No `note`: the
CHANGELOG block of this version is what an update prints, and its `Retires local rules:` line names
the rules this release retires.

## Superseded local rules

This release retires the project-local rules the payload doctrine now carries, one sentence each;
the CHANGELOG block of 0.3.1 names them on its `Retires local rules:` line (one of the 43, already
retired by 0.3.0, is not repeated). Delete your
copies from your overrides document in one sitting, on your operator's word.

A file that used to hold your transfer-surface rows (for example a candidates page your key names)
is not touched: it stays as history, and new rows go to the ledger once your key names it.

An edit you made inside the managed `aiwf-core` markers of `CLAUDE.md` or inside `ORCHESTRATOR.md`
outside its project additions block is overwritten by this update: move the text you want to keep
below the `CLAUDE.md` end marker, into the `ORCHESTRATOR.md` project additions block, or into your
overrides document BEFORE running `/pnp:update`.
