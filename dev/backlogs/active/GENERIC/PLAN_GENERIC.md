# PLAN_GENERIC - one home per generic rule; the ledger moves into the plan folder; 0.3.1

The plan of the roadmap entry `GENERIC` in `dev/backlogs/ROADMAP.md` (Size S, one plan). One
folder: this index, `DECISIONS.md` (D-01..D-18), `RESEARCH.md` (two scans at `0cf97e7`),
`tickets/GENERIC-NNN.md` (the frozen contract), `records/GENERIC-NNN.md` (written at each close).
Readiness history: `readiness/GENERIC/` (the stamp, the round files, `rule-homes.md` of GENERIC-001).
HEAD at planning: `0cf97e7`; every diff guard of the three tickets is anchored to it on purpose
(a plan-spanning base, `docs/WORKFLOW.md` § Ticket brief contract).

## Goal

Every generic rule of the 2026-10-16 cross-project alignment has one home in the payload, and the
three overrides documents keep only identity and product truth: the 43 bucket-(b) rows land as one
sentence each in the payload doctrine and leave `dev/PROJECT_OVERRIDES.md`, product and machine rows
stay there marked; a plan's rulings, passes and events live in the plan's own folder and a new
`<plansDir>/LEDGER.md` is only a pointer index; the roadmap holds only live entries; and release
0.3.1 ships the ledger seed, the "Where things are written" block in the managed `CLAUDE.md` region
and the doctrine to the consumers.

## Scope

In: the payload doctrine `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`,
`docs/CODEX_REVIEW_QA_RECIPE.md`, `docs/OPERATOR_PROTOCOL.md`; `skills/plan`, `work`, `mission`,
`arbiter`; `templates/briefs/planner.md`, `record.md`, `templates/ROADMAP.md.tmpl`; the whole
`dev/PROJECT_OVERRIDES.md`; `dev/backlogs/CANDIDATES.md` (frozen), `ROADMAP.md`, the new `LEDGER.md`
(GENERIC-001, GENERIC-002); the surface template's rename, the setup seed of `LEDGER.md` with its
key, the legacy wording of the kept fallback `PNP_CANDIDATES.md` (D-09), migration `0026_ledger`, `templates/CLAUDE.md.tmpl`, `templates/ORCHESTRATOR.md.tmpl`, the bump to 0.3.1 and
this repository's self-update (GENERIC-003).

Out: every consumer tree and the rest of `## Deferred` of `DECISIONS.md`; the rows that stay local
(D-04) beyond their marker; translating or migrating old `CANDIDATES.md` rows; `skills/roles` and
`skills/setup` (they keep the audit-table print, D-16); the tag and the push (D-17: the operator's
two words after the plan closes).

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| GENERIC-001 | the rules: 43 payload sentences, the overrides trimmed and marked | D-01 D-02 D-03 D-04 D-05 D-06 | done (`510165d`) | `records/GENERIC-001.md` |
| GENERIC-002 | the ledger, roadmap and skills prose | D-07 D-08 D-11 D-12 D-13 D-15 D-16 | done (`834147d`) | `records/GENERIC-002.md` |
| GENERIC-003 | the code: ledger template and seed, migration 0026, managed templates, 0.3.1, self-update | D-08 D-09 D-10 D-11 D-14 D-17 | open | - |

Order (D-18): 001 -> 002 -> 003, each on the operator's own word; 003 last because its
`Retires local rules:` line reads 001's `rule-homes.md`, and its template rename needs the code in
the same commit. Routes: 001 and 002 are prose, R1 in the main session, no auditor, VERIFY = the
provenance grep + `validate-payload`; 003 is code, R2 through the Writer on `main` (D-18), VERIFY
rows `validate-payload`, `setup-suite`, `update-suite`, `selfcheck`. COO routing: 001 and 002
`COO: cheap (Opus) - because all four no`; 003 `COO: Fable - because check 1`.

## Gates

1. The plan: the operator's word -> this folder in `drafts/GENERIC/` -> `plan-gate --stamp` then
   `--check` -> ONE readiness pass on the `review.plan` row (rides the plan's word; a second only
   on its own word) -> triage -> the approval report, which asks once whether GENERIC-003 gets a code
   audit pass (overrides § Hard rules: a code pass only on the operator's word) -> the landing:
   re-stamp, `Move-Item dev/backlogs/drafts/GENERIC dev/backlogs/active/GENERIC`, `git add` of
   `active/GENERIC`, `readiness/GENERIC`, `ROADMAP.md`, one docs commit (dialog).
2. GENERIC-001 on its word: no route state; the edits; the acceptance; one commit (dialog, the rule
   text shown - guard (g)); the live copy refreshed; the four memory pointers (D-06); the record
   commit (dialog).
3. GENERIC-002 on its word: R1, the same shape; one commit (dialog); live copy refreshed; record.
4. GENERIC-003 on its word: route state `{ "ticket": "GENERIC-003", "route": "R2" }` -> the Writer
   dispatch (Gate 2 silent: the ticket is in `active/GENERIC/tickets/`) -> at the handoff the COO
   reads the whole diff -> the code audit pass (Codex, `review.code` row) - worded at the approval
   (operator „3 да", 2026-10-18) -> its correction rounds (cap 2) -> THEN the COO starts
   `validate-payload`, `setup-suite`, `update-suite` once, in the background (operator „2 да",
   round-1 B11: the single run observes the final code) -> the Writer's commit (dialog) -> route state `{}` -> the live
   copy refreshed -> `/pnp:update` dry run, the operator's word, `--apply` -> the COO's R1 half (the
   ticket's items 10-11) -> the `selfcheck` row once -> one commit (dialog) -> the final close
   (item 5) -> the record commit, which also carries the archive move (`readiness/GENERIC/` stays)
   and the entry `GENERIC` leaving `ROADMAP.md` (D-12). No tag, no push in the plan: those are the
   operator's two words after it (D-17), one push dialog.
5. Close order (D-17). Tickets 001 and 002: the table row flipped -> `plan-gate --stamp
   dev/backlogs/active/GENERIC` -> `--check` exits 0 -> the record commit. GENERIC-003 (the final
   close): the row flipped and `## Roadmap entry` (the entry's Goal and Why, verbatim - D-13; the
   landing predates the skill change) written into this index -> `--stamp` -> `--check` exits 0 ->
   `git mv dev/backlogs/active/GENERIC dev/backlogs/archive/<NNN>_PLAN_GENERIC_<date>` -> `--check`
   over the archive path exits 0 -> the record commit. No index edit after the last stamp.

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 160k (approval 280k - start 120k) | 701,287 tokens |

Parts of the cycle spend, one per line (source in brackets):

- research agent A (rules, sonnet): 144,199 [notification]
- research agent B (mechanics, sonnet): 133,521 [notification]
- planner (writer agent type, three handoffs): 258,932 [notification - the last of three, cumulative over
  the resumed transcript: 190,171 / 212,692 / 258,932; counted once]
- Codex readiness pass 1 (gpt-6-sol, xhigh, cold): 164,635 [round header, `readiness/GENERIC/round-1.md`];
  its verdict line `BLOCKERS: 13 INFO: 0` [round-1.md] - 12 fixed, 1 asked (B11); planner revisions: 2
  (the cap); no pass 2

Start and approval numbers: `~/.claude/ctx/<session>.pct` x `.size` (1,000,000), whole-percent
precision - 12% at Step 1, 28% at the approval [file]. Start number (a) of the `/pnp:work` entry: 110k
(11%) [file].
