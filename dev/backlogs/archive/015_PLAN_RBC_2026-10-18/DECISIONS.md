# DECISIONS - plan RBC (REBUILD plan C: measurement, doctrine compaction, two gate defects)

Numbered, scoped to this plan; another plan cites one as `RBC/D-NN`. The source is `dev/REBUILD.md`
§ Tickets (plan C) and § The session start cost, the operator's decisions relayed by the arbitration
session on 2026-10-17 and confirmed here with the word „имаш дума и за двете" (2026-10-17), and
`RESEARCH.md`. Plan A and B decisions are cited as `RBA/D-NN`, `RBB/D-NN`, never restated.

## Decisions

- **D-01** Plan C is three tickets: RBC-001 the measurement instruments (C1), RBC-002 the doctrine
  compaction (C2), RBC-003 the two gate defects (C3). The suites (REBUILD's original C3) stay out.
  Order: RBC-001 -> RBC-002 -> RBC-003; RBC-001 first because RBC-002's before/after is measured with
  its protocol (D-04). plan: RBC
- **D-02** The four numbers (REBUILD § Proposed answers 6): (1) tokens from idea to approved plan -
  the COO context at the approval report minus the COO context when `/pnp:plan` started; (2) the
  TOTAL spend of the cycle - every subagent's tokens as the harness reports them in its completion
  notification, plus every Codex pass's tokens as the engine printed them; (3) correction rounds
  after implementation, per ticket, counted from an auditor's verdict (WORKFLOW § Loop shape); (4)
  the COO session size when the ticket closes. (1) and (2) are written at the approval into the plan
  index's `## Measurements` section; (3) and (4) into each record. A value only the operator can see
  (the COO context size on the statusline) is ASKED for at that moment, never estimated - the
  data-discipline rule of `ORCHESTRATOR.md`. plan: RBC
- **D-03** The record gets a payload skeleton: `templates/briefs/record.md` - the five sections the
  real records already use (What landed; Decisions and deviations; Verification (what actually
  ran); Remaining debt; Scratch) plus a fixed `## Measurements` row of D-02's (3) and (4). Why
  `briefs/`: it is already the payload's "read at run time, never rendered" directory
  (`RBB/D-02`); a second such directory would restate that rule. WORKFLOW § Durable development
  history item 4 points at it; `skills/plan/SKILL.md` Step 6 gains the approval-time measurement
  (D-02 (1) and (2)) and names the skeleton for the records. Not rendered, so no migration. plan: RBC
- **D-04** The session-start measurement is TWO numbers (operator remark relayed 2026-10-17: „ние
  мерим след /pnp:mission а това включва и файловете на активната мисия, всяка носи различен
  контекст"): (a) after the doctrine preflight and before any plan file is read - the number C2 is
  judged by; (b) after the active plan's files are read - the number the folder format and selective
  reading are judged by. The protocol lives in `dev/REBUILD.md` § The session start cost (this
  repository's measurement, read by the operator off the statusline); `/pnp:mission` does not change
  - a per-session print would cost a question every session for a measurement taken twice. The
  current 130k is (b) with PLAN_HARD inside it; RBC-001 records it as such. Vehicle amended
  2026-10-18 by arbitration ruling (CANDIDATES § Ruling ledger; the definition stands): (a) is read
  at `/pnp:work`'s task question, before any plan file, and the same session then reads the plan for
  (b) - no second session. plan: RBC
- **D-05** The compaction rule (REBUILD C2): every RULE stays; rationale, history and "measured on a
  consumer ..." stories go; no `docs/RATIONALE.md` (PLAN_DOCT's idea is dropped - git keeps the
  history). Duplicate normative text across the three payload documents collapses to ONE home and
  one-line pointers (PLAN_DOCT's finding, `RESEARCH.md` fact 15). Scope: `docs/WORKFLOW.md`,
  `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md`, and the WHOLE `dev/PROJECT_OVERRIDES.md` (operator
  answer 2026-10-17: „Целия overrides, без шаблона"): its text that restates a payload rule goes -
  the payload carries it; project-only rules stay, reduced to the rule and its marker per the
  overrides' "a rule record carries a marker, not its story". The checkpoint bullet stays until its
  hook (HARD-024's `context-gate.mjs`, which quotes the bullet's name) is handled separately - the
  400k session rule does not replace the hook. `templates/ORCHESTRATOR.md.tmpl` and every other
  template, skill or doc stay out (a managed template would need a migration and a bump). plan: RBC
- **D-06** Every `##`/`###` heading, the guard letters (a)-(h), LOOP § Role boundaries' seven role
  bullets and the run-in sentence "COO-authored text is reviewed like the Writer's" stay
  byte-identical: ~90 pointers cite them by name and no check reads an anchor (`RESEARCH.md` fact
  12). A section that empties out keeps its heading and a one-line pointer to the rule's home. The
  overrides' § Product boundary checks stays byte-identical: its lines mirror
  `review.productBoundaryChecks`, which is rendered into the reviewer agent. plan: RBC
- **D-07** RBC-002's verification: one `sonnet` agent, given the OLD text (`git show <base>:<file>`)
  and the NEW, returns the no-homeless-rule table - every rule of the old text with its home in the
  new (`file` + section), and a count line `rules: <n> homeless: <m>`; `homeless: 0` is the gate, a
  homeless rule goes back into the text. The table lands in `readiness/RBC/rule-homes-<doc>.md`.
  Plus the provenance grep and `validate-payload` (overrides § Test policy, prose row). Token
  counts of each document are measured before and after with the SAME tokenizer, named in the
  record, beside `wc -c`/`wc -l`. Targets, as a guide and not a gate (operator answer 2026-10-17:
  „Целите като ориентир"): WORKFLOW <= 12k tokens, `dev/PROJECT_OVERRIDES.md` <= 8k, LOOP <= 4k; a
  rule is never cut to reach a number, and a miss with `homeless: 0` closes the ticket. The baseline
  is `RESEARCH.md` fact 17; the result is judged on the start number (a) of D-04. plan: RBC
- **D-08** PLAN_DOCT's parked material (`drafts/PLAN_DOCT.draft.md`, tracked, and
  `readiness/DOCT/`, untracked) is RBC-002's input and is deleted at RBC-002's close: the tracked
  draft through `git rm -f` (it carries uncommitted edits that are input only, never committed),
  the untracked folder through `Remove-Item` - each the operator's delete dialog. plan: RBC
- **D-09** Gitfile: the provenance walk skips a `.git` entry that is a FILE at the plugin ROOT only,
  as it skips the `.git` directory; a `.git` file below the root stays RED. Controls in the
  self-check: a planted root gitfile -> green; a resembling root file (`.foo`) -> still red; a
  `.git` file one level down -> still red. plan: RBC
- **D-10** Byte cap: the ticket's header `Status:` line - the first line starting `Status:` before
  the first `## ` heading - is excluded from the 6,144-byte count; a `Status:` line in the body
  counts. Controls: M7/M8 unchanged; a ticket of exactly 6,144 bytes plus a header `Status:` line ->
  valid; a 6,145-byte body with a body `Status:` line -> `ticket-over-bytes`. The literal
  `const MAX_TICKET_BYTES = 6144;` stays textually identical (ctl-7 replaces it). The stamp is
  unchanged: a status flip still needs a re-stamp. The three prose statements of the cap (WORKFLOW
  § Plan readiness review, `skills/plan/SKILL.md` Step 5, `templates/briefs/planner.md`) ride in the
  same ticket. plan: RBC
- **D-11** Routes and rows: RBC-001 and RBC-002 are prose, R1 in the main session (overrides § Hard
  rules), no auditor, VERIFY = provenance grep + `validate-payload`. RBC-003 is code, R2 through the
  Writer; VERIFY rows `selfcheck` + `spikes` + `validate-payload`, once, in the background at the
  handoff; no Codex code pass (operator answer at the approval, 2026-10-17: „Без пас"). No
  migration, no version bump - plan C ships with the plugin on push; 0.3.1 stays HARD-011's. plan: RBC
- **D-12** COO routing (overrides § Loop shape, the four checks): RBC-001 and RBC-002 `COO: Opus -
  all four no`; RBC-003 `COO: Fable - because check 1` (`plan-gate.js` is what Gate 2 and the Codex
  wrappers deny a plan pass on - the precedent of RBA's gate ticket). plan: RBC
- **D-13** The chain-trace rule enters the payload (operator answer 2026-10-17: „Правило в
  payload-а"; the 0.3.0 CHANGELOG retired it as a local rule while no payload text carried it -
  found in Silerax's post-update cleanup, relayed by the arbitration session): one sentence in
  `docs/REVIEW_CHECKLIST.md` § Reviewer - code & design correctness - for each behaviour the
  ticket's Outcome names, the Reviewer traces the ordered chain from its entry point to its end
  point through the files of the Code Map, adversarially, and still reads the whole diff. It lands in
  RBC-001 (prose, ahead of the compaction, which then keeps it as a rule); the sentence is shown to
  the operator before its commit (guard (g)). plan: RBC

## Deferred

- The suites (fast or fewer) - REBUILD's original C3; back when the operator names it.
- `docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md`, the skills (`skills/review/SKILL.md`
  above all) and the rendered templates - a later compaction plan, after (a) is measured on RBC-002.
- `drafts/PLAN_FOLD.draft.md` and `drafts/align-2026-10-16/` - REBUILD input 2 and older material,
  not this plan's; deleted on a word when the operator names them.
- A `/pnp:mission` print of the start numbers - only if the twice-taken measurement becomes routine.

## Open Questions

None. The scope and the three tickets are the operator's (relayed, confirmed by the word); D-02 to
D-12 are engineering choices inside it, reported here.
