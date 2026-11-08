# DOCTR - decisions

Item numbers are the research's (`RESEARCH.md` § What the code does today), which follow the open
lines of the roadmap entry.

## Decisions

- **D-01** One plan, two tickets, one release (0.3.16) - the DOCSTAGE D-09 shape: **DOCTR-001** prose,
  R1 in the main session (overrides § Hard rules: prose in the payload is R1), `review.docs` row 0 =
  no auditor - every sentence of D-03..D-23 written into the templates, the docs and the skills, the
  rendered copies untouched (nothing re-renders them until 002); **DOCTR-002** code, the Writer,
  `review.code` pass 1: migration `0041` with `rerender-managed-region` ops for every managed file
  whose template 001 changed (`ORCHESTRATOR.md`, the four stage files, `writer.md` if its template
  moved; the 0036 precedent, RESEARCH 29), one `note`, the bump, the CHANGELOG block with its
  `Retires local rules:` line (D-20), `README.md:22`; after 002's commit `/pnp:update --apply` on this
  repository, the tag and the push each on the operator's word; the record commit marks the roadmap
  lines and the CANDIDATES rows and deletes this repository's retired local rule (R1). Why one
  release: a consumer takes one update and the templates ship with the ops that render them. plan: DOCTR
- **D-02** Closed without a change, marked `done` at 001's close with the pointer: item 9 ("unplanned
  R2" has no hit; the live form is "non-durable R2", RESEARCH 9) and the F24 line already marked. plan: DOCTR
- **D-03** Item 4: the three R3 sites of `work.md` (`:59`, `:76`, `:109`) say "schema or data
  migrations of the product's persistent store" where they say "migrations" (the `CLAUDE.md.tmpl`
  route line carries no such word - the planner's check 2026-11-08 - and stays); a payload migration of a plugin is data applied by a tested engine and routes by its
  diff (SEEDFS/D-14 as the reading, RBB's deferral closed). Why: the unqualified word made two
  readiness passes argue the route (RESEARCH 4). plan: DOCTR
- **D-04** Item 13: the pass-2 trigger reads "a BLOCKER that reverses a decision the OPERATOR made -
  a `D-NN` carrying the operator's words or a dialog answer"; a BLOCKER that reverses a COO decision
  is a revision, never a second pass. The sentence moves in `plan.md` and in its seven restating
  consumers (RESEARCH 13), each by the closing grep of the old phrase. Why: PLAN_GRANTS paid 324K for
  a pass the distinction would have spared. plan: DOCTR
- **D-05** Item 5 is not a sentence: a structural check belongs to the Codex wrapper (pass 2's brief
  already carries `round-1.md`; the wrapper refusing a new row without its "why pass 1 could not see
  it" declaration is code on `scripts/native/`). Deferred to ROADMAP § CODEX: at DOCTR-001's close
  the item's line moves there (the DOCTR line closes with that pointer), so it survives the entry's
  leaving the roadmap at the archiving. plan: deferred
- **D-06** Items 6, 27 and C-064 are one rule, in `ORCHESTRATOR.md` § Verifying failure claims where
  the baseline-by-test-name sentence stands (RESEARCH 6): the discovery scan records the
  baseline-red tests by name for every file in the ticket's verify line, the Writer brief carries
  that expected red set (`templates/briefs/writer-dispatch.md`, the `Verify` field of `ticket.md`),
  and "stays green" is never an inherited claim; a repo-kept list of known-failing tests is a
  project's choice, named in its overrides document (intake 31 and C-064 confirmed project-only).
  plan: DOCTR
- **D-07** C-067 is homed: the brief fields of `ticket.md` gain `E2E: yes | no - because <reason>`,
  the countable form of "a brief declares observable runtime/UI behavior" (`ticket.md.tmpl:181`,
  `review.md.tmpl:211`). C-045 (a lint baseline) and C-071 (sessions start from the repo root) are
  confirmed project-only: a lint tool and a session's working directory are a project's environment;
  the "eight rules" roadmap line closes with that verdict. plan: DOCTR
- **D-08** Item 8: `ORCHESTRATOR.md` § Branch policy's two-trees sentence (`:465-467`) gains the
  default - the session's own project root is the tree when the word names none; another tree
  needs the word naming it. Why: the 2026-09-15 write had a "yes" and no tree. plan: DOCTR
- **D-09** Item 1: guard (b) gains one sentence - a later remark in which the operator takes a step
  themselves („сам ще си пусна ъпдейта") narrows the standing word to what precedes that step: the
  COO stops there and waits for the next word. The existing "after the word the loop runs to the
  end" is its dual. plan: DOCTR
- **D-10** Item 2: an agent, a check or a pass the doctrine does not require and the ticket does not
  name is not spent on the COO's own: it is written into the ticket with its scope and cost before
  it is spent, as a pass beyond the contract already is (`ORCHESTRATOR.md.tmpl:337-340`, rule 7 of
  § How the COO speaks). Dual: the scan-tier work the doctrine requires - the discovery scan, the
  closing grep, the fact-check gate, a retry of a dead scan - rides the ticket's word. Why: 224,160
  tokens for an unrequested cross-check (operator „ти продължи да своеволничиш"). plan: DOCTR
- **D-11** Item 3: one line per ticket, not per decision - `Escalation: none | trigger <N> - <why>`
  beside the COO routing line in a plan ticket's header and as a brief field in `ticket.md` § Ticket
  brief contract, read over the concrete decisions at the brief. Why: triggers 1 and 3 were missed at
  two briefs (RESEARCH 3); a per-decision line would restate the plan. plan: DOCTR
- **D-12** Item 10: one sentence in `templates/README.md`'s contract - a rule that enumerates kinds
  of work is refuted by the kind it missed; a rule names the property it checks, not the list. Why:
  CONS-009 paid three passes for a list (RESEARCH 10). plan: DOCTR
- **D-13** Item 12: `ORCHESTRATOR.md` § The operator does not arbitrate, the product-choice gate,
  gains the STOP class - "the user sees less than before": a field, a row, a function present before
  the change and absent after it, found by ANY role mid-ticket, stops the ticket for the operator's
  word; never a note for the close. Why: RDR-003's loss was found two hours and 290K later. plan: DOCTR
- **D-14** Item 14: `skills/plan/SKILL.md` Step 1 and the roadmap-writes paragraph of `ticket.md`
  state it - an entry and a finding line carry the problem, its evidence, the operator's words and
  the scope, never how it is fixed (the operator 2026-10-24: „това е работа на планера"); the seed
  `templates/ROADMAP.md.tmpl:19` quotes with the skill's `"<quote>"`. plan: DOCTR
- **D-15** Item 15: `docs/READINESS_CLASSES.md` gains classes 17 (a boolean predicate over a nullable
  column names its NULL case) and 18 (a plan that replaces a reader names the old reader's row
  contract, sort keys, search semantics and permission gate, and where the new one differs); the
  header prose counts 18. plan: DOCTR
- **D-16** Item 16: the consumer-grep sentence of `ORCHESTRATOR.md` § COO owns broad scans gains - the
  exempt list names non-callers only (a comment, a doc, a fixture quoting the name); a caller is
  never exempt by its purpose. plan: DOCTR
- **D-17** Item 17: `ticket.md:115-117` names the mechanics - the live Writer is resumed with a
  message to the dispatched agent (the harness's agent-message tool, `SendMessage` in Claude Code)
  for every micro-round, correction round and the commit; a fresh spawn only when that agent has
  ended. plan: DOCTR
- **D-18** Items 18 and 19 are deferred on the operator's own words („ПНП ще си ги вземе някой ден ако
  е необходимо"; L90 "only if a second consumer asks"): the roadmap template's places (order of
  work, phase log, module table, finding tags, question queue), the unrouted items (a `TODO` in
  code, an audit's findings) and the flat defect list - back when a second consumer asks for one of
  them. At DOCTR-001's close the two lines move to a new roadmap entry `RMAP - the roadmap's places`
  (`Status: idea`, born of those words), so they survive the entry's leaving the roadmap. plan: deferred
- **D-19** Item 22 and the adversarial check: the roadmap-writes paragraph of `ticket.md` gains - a
  nested list's parent line closes with its last child, the archiving checks every child line of the
  plan's entry; a line leaves the roadmap one by one, each against the record or commit that closes
  it, never as a sweep. plan: DOCTR
- **D-20** Item 20: the payload names the tool and the form. `ORCHESTRATOR.md` § How the COO speaks
  gains rule 9: a question to the operator is a dialog - the harness's question tool
  (`AskUserQuestion` in Claude Code): one topic per dialog, numbered options with the consequence of
  each, the recommendation first, in words and counts and never with line numbers, up to four points
  per dialog; what does not block the ticket goes into ONE dialog at the ticket's end; never a list in
  the chat. Its dual stands in the channel filter (an operator's own question is answered directly).
  The 0.3.16 `Retires local rules:` line names `overrides § Communication: A question to the operator
  is a dialog` (PnP, Silerax, Furnissimo carry it); this repository's copy is deleted in the record
  commit. Why: the operator's 2026-10-31 words („казвам го за последен път") and S5 after them. plan: DOCTR
- **D-21** Item 21: the language paragraph of `ticket.md` (`:89-93`) gains - the CHANGELOG is kept in
  the language the project's `## Changelog format` section names (chosen at setup; English when the
  changelog ships with a payload), and the operator's quotes are never translated, in the record and
  the decision alike; `templates/agents/writer.md.tmpl:68-70` ("everything you write into the tree is
  English") carries the same CHANGELOG clause, since the Writer writes the release's block - so 002
  re-renders `.claude/agents/writer.md` too. The setup interview's question per record class is
  ROADMAP § SETUP's line (`ROADMAP.md:207`), a schema change, not this plan's. plan: DOCTR
- **D-22** Item 23: the visible-outcome close gains its waiver - the operator may decline the run in
  words; the waiver is quoted in the record and the ticket closes on the offline proof, its outcome
  marked as not seen by the operator. `templates/briefs/record.md:55-56` and the seed
  `closeout-needs-a-live-pass.md` move with it. Why: IMPFX-001 closed this way („затваряй не ми се
  гледа") against a rule with no waiver. plan: DOCTR
- **D-23** Item 26: `work.md`'s routing clause (`:93-95`) states that the four checks are read after
  the discovery scan, over the anchored worklist: a scan that anchors every item closes check 2 and
  the cheap COO suffices for it. plan: DOCTR
- **D-24** Numbers are measured as the skill says: start 100,000 (the statusline files, 10 % of
  1,000,000); the research agents 137,390 and 130,510 (their completion notifications). plan: DOCTR
- **D-25** Sessions and tiers: S1 (this, Fable) the cycle to the landing; DOCTR-001 `COO: Opus - all
  four no` (a prose ticket of anchored sentences; DOCSTAGE-001 precedent); DOCTR-002 `COO: Opus - all
  four no` as well: under D-03's reading a payload migration is data applied by a tested engine and
  fires check 1 no more than the bump does, every worklist item is anchored, no trigger class and no
  open incident stands on its path (the DOCSTAGE-002 "check 1" routing was the unqualified word's
  reading, which this plan ends). plan: DOCTR

## Deferred

- Item 5 (a structural check on first-pass-visible blockers) - ROADMAP § CODEX at the landing; back
  when the wrapper's brief-side check is designed (D-05).
- Items 18, 19 (the roadmap template's places, the unrouted items, the flat defect list) - back when
  a second consumer asks for one of them (D-18).
- The setup interview's language-per-record-class question (ROADMAP § SETUP) - back with a schema
  change (D-21).
- The compaction of the skills' bodies and the operator-protocol docs (RBC, DOCSTAGE Deferred) - back
  with ROADMAP § CTX.

- **D-26** Item 7 (operator 2026-11-08, dialog answer „Да, тестът преди одита"): for a ticket whose
  brief says `E2E: yes` (D-07), the COO runs the configured runner (`verify.e2e.runner`) over the
  Writer's spec at the handoff, BEFORE `/pnp:review`; a red spec goes back to the live Writer as a
  micro-round (D-17), and the auditor's brief carries the green run as evidence. Home: `work.md`
  § Tests and the route order lines (`work.md.tmpl:38-39`, `:107-108`, `CLAUDE.md.tmpl:55-56`), the
  E2E flow of `ticket.md:183-188`, `skills/qa/SKILL.md:102-106` (QA judges the artifacts of that run,
  it does not run it again), and the review brief's evidence list in `skills/review/SKILL.md` (the
  green run's log path is handed to the auditor). Dual: a ticket with `E2E: no` keeps the order as it is. plan: DOCTR
- **D-27** Items 24 and 25 are declined (operator 2026-11-08, dialog answers „Остава целият diff",
  „COO го пише сам"): the COO reads the whole diff first-hand and writes the completion record itself;
  nothing changes in the text; both roadmap lines close as declined at 001's close. plan: DOCTR

## Open Questions

None. (Answered 2026-11-08 by dialog: item 7 -> D-26; items 24, 25 -> D-27.)
