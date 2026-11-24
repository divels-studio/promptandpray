# AUDR - research (2026-11-24, HEAD 3c13a90)

Two sonnet scan agents (audit side; planner / record / measurement / config side); the COO opened every pointer
below that carries no mark. AGENT = the agent's pointer, not re-opened. Content authority: ROADMAP § AUDITRULE line (11),
`dev/changes/opus-experiment-2026-11-23.md` § 9.

## 1. Code Map

| file | role today |
|---|---|
| `templates/doctrine/review.md.tmpl` | review stage: plan-readiness blocker contract, test-policy section + floor, test quality, test findings on confirmed code, fail aggregation, verdict |
| `templates/doctrine/plan.md.tmpl` | plan stage: readiness pass, triage, pass economy, the six checks |
| `templates/doctrine/ticket.md.tmpl` | ticket stage: required-note micro-round, the record and its `## Measurements` row |
| `templates/briefs/readiness-codex.md` | readiness brief: the questions, TEST POLICY slot, blocker contract, INFO examples, output shape |
| `templates/briefs/planner.md` | planner brief: TICKET COUNT / CLOSING GREPS / VERIFY COMMANDS slots, folder contract, worklist and acceptance rules |
| `templates/briefs/research.md` | research brief: the transactional read (read / lock / write rows) |
| `templates/briefs/record.md` | completion-record skeleton with two `## Measurements` tables |
| `skills/review/SKILL.md` | code-review brief skeleton (TEST POLICY slot, output contract) and plan-readiness mode |
| `skills/plan/SKILL.md` | the planning cycle: start number, planner dispatch, gate, pre-pass, readiness pass, approval number, index `## Measurements` |
| `templates/agents/reviewer.md.tmpl` | Claude-hosted reviewer: points at review.md and the brief; restates no blocker definition |
| `docs/READINESS_CLASSES.md` | the 18 readiness classes the auditor names by number |
| `templates/PROJECT_OVERRIDES.md.tmpl` | overrides seed: `## Test policy` beside which a product-stage section would sit |
| `migrations/0047_test-authority` | pattern of a prose release: re-renders + one note |
| `migrations/index.json` | the manifest; last entry 0049 -> 0.3.24 |
| `.claude-plugin/plugin.json` | the only version source |
| `CHANGELOG.md` | blocks 0.3.11, 0.3.20-0.3.24 |

## 2. What the code does today

1. Plan-readiness blocker, three copies. `review.md.tmpl`:41-52 "A BLOCKER is a required property the plan lacks plus the
   evidence ... the test is whether the plan, executed exactly as written, would make a ticket fail, land wrong or leave a
   decision open"; `readiness-codex.md`:36-52 the same test plus six INFO examples (:44-50) and "An I<n> row costs the plan
   nothing: the COO reads it and lands or drops it without a revision" (:52); `skills/review/SKILL.md`:332-333 a one-line
   restatement. No copy names a loss.
2. Code-pass blocker. No contract paragraph: "a material blocker is any real product/runtime/contract/proof/i18n/UX issue that
   by itself prevents an honest `pass`" (`review.md.tmpl`:283-285); the brief's risk threshold decides the severity
   (:76-77); verdicts :301-306. Blocker sentences on proof: :100-102, :189-190, :241-242 - narrowed for confirmed code by
   § Test findings on confirmed code (:219-237), whose dual keeps "a test that fails, a test skipped or narrowed to get green,
   and a required verify command that was not run" blockers (:236-237).
3. Red-proof: a missing red record is a note; a blocker only when the Reviewer names the fault under which the test stays green
   (`review.md.tmpl`:201-213).
4. The floor (0.3.22): `review.md.tmpl`:65-67, restated in `readiness-codex.md`:32-34 and `skills/review/SKILL.md`:193-195.
5. TEST POLICY slot: `readiness-codex.md`:29-34, `skills/review/SKILL.md`:190-195, defined in `review.md.tmpl`:54-70 (dual
   `none` :69-70), named by `plan.md.tmpl`:101-103. Its value is a pointer to the overrides doc § Test policy - no config key.
   The QA brief has no such slot (`skills/qa/SKILL.md`:195-240, AGENT). The planner brief has none (`planner.md`:1-23).
6. No PRODUCT STAGE text anywhere in docs / skills / templates / scripts / schema / hooks / migrations / examples (COO grep,
   0 hits).
7. The planner brief orders the restatement: "Acceptance is literal commands, each with the output that would mean
   'broken'" and "procedures and tables move to the index" (`planner.md`:60-66); VERIFY COMMANDS slot quotes
   `verify.commands` verbatim (:17-20); CLOSING GREPS block copied into the index `## Closing greps` (:14-16, :42-44).
8. Closing greps at the auditor (0.3.11): "verified against the index's `## Closing greps` (run the grep, compare the count)
   rather than re-derived, a set the plan changes with no grep there being a finding" (`readiness-codex.md`:12-15).
9. Read / lock / write rows: owed by the research for "a function the goal changes that holds a transaction, a lock or more
   than one write" (`research.md`:10-14); checked by the auditor (`readiness-codex.md`:15-17); class 15
   (`READINESS_CLASSES.md`:34). No scale-with-the-change wording anywhere.
10. Classes 8 (command not literal / cannot fail) and 11 (process order / actor): `READINESS_CLASSES.md`:27, :30. Check 5 of
    the six: `plan.md.tmpl` (rendered `.claude/aiwf-native/doctrine/plan.md`:142-143).
11. Plan measurement: `/pnp:plan` Step 1 start number and Step 6 approval number read from a machine source, and with none
    "ask the operator once ... for the COO context size" (`skills/plan/SKILL.md`:69-74, :271-273); index `## Measurements`
    `| idea -> approved plan | cycle spend |` (:275-282); both marked *Temporary* (:72-74).
12. Ticket measurement: `record.md`:68-90 - table 1 `| correction rounds | COO session at close | source |` (*Temporary*,
    :77-78); table 2 (0.3.22) `| auditor's blockers by kind | effort: ... | defects that reached the operator after the close |`
    with kinds `code defect / test defect / record or form only` (:80-90). Filled at the close: `ticket.md.tmpl`:337-338.
13. Notes on the code side: a note on a test over confirmed code opens no correction round, a plain note is listed in the
    record and settled at the close, a required note (floor) is a Writer micro-round with no pass (`ticket.md.tmpl`:296-303).
14. Templates under `templates/doctrine/` are rendered into projects (`.claude/aiwf-native/doctrine/*.md`) and reach them only
    by a `rerender-managed-region` op; `templates/briefs/*` and `skills/*` are read at run time from the plugin root
    (`skills/plan/SKILL.md` "read at run time by path, never rendered"; 0047 lists them only in `docRefs`,
    `migrations/0047_test-authority/ops.json`:15).
15. Last migration 0049, payload 0.3.24 (`CHANGELOG.md`:7; AGENT `migrations/index.json`:50).

## 3. Consumers and adjacent contracts

- No script parses the auditor's `BLOCKERS:` line or a verdict word; no self-check or suite asserts the wording of the blocker
  contract, TEST POLICY, planner.md or record.md (COO grep of `scripts/`: 0 hits for those phrases). The COO greps the `-o` file
  by hand (`skills/plan/SKILL.md` Step 6).
- `plan-gate.js` enforces the index's `Tickets:` / `Side by side:` lines, the six ticket headings and the Code Map; not
  `## Measurements`, `## Closing greps` or acceptance content (AGENT `scripts/engine/plan-gate.js`:20-130).
- `scripts/setup/test-setup.mjs`:1644-1650 pins plan.md.tmpl § The ledger fence byte for byte (AGENT) - an edit there moves
  with the ledger skeleton.
- `reviewer.md.tmpl`:90-100 points at review.md § Plan readiness and the brief; verdict lines :82-88 use "blocker at/above
  threshold".
- `planner.md`:44-46 ("You write no `## Measurements`") is the contract with `skills/plan/SKILL.md`:275-282.
- `ticket.md.tmpl`:337-338 names the record's `## Measurements` row.
- `templates/agents/writer.md.tmpl`:76-77 cites the overrides doc § Test policy (AGENT).
- A release: migration folder + manifest entry + bump + CHANGELOG block ending `Retires local rules:` + README version line
  (pattern: `064c862`, HANDBACK-001 / 0.3.22, the Writer's commit with the changelog and README lines the COO's prose).

## 4. What already exists

- INFO as a note at readiness: `readiness-codex.md`:41-52 (the COO lands or drops it without a revision).
- Notes at the code pass: `review.md.tmpl`:219-237, `ticket.md.tmpl`:296-303.
- The floor: `review.md.tmpl`:65-67.
- Blockers by kind per ticket: `record.md`:80-90.
- The slot pattern: `TEST POLICY:` with its `none` dual (`review.md.tmpl`:69-70).
- The consumer's own product-stage section (Silerax `dev/PROJECT_OVERRIDES.md` § Product stage: where the product is / not asked
  at this stage / mandatory at this stage) and its two pointer sentences in the project additions of its `plan.md` and
  `review.md` (AGENT; read-only, another repository).

## 5. Paths touched without being named

- This repository's self-install renders `.claude/aiwf-native/doctrine/{review,plan,ticket}.md` - re-rendered by the
  migration through `/pnp:update --apply`, never by hand.
- `templates/CLAUDE.md.tmpl`:13 lists what the overrides doc carries ("identity, hard rules, stack, test policy") (AGENT).
- `dev/PROJECT_OVERRIDES.md` § Environment "COO context source" says `/pnp:plan` and the record skeleton read it - a dev/ line.
- `skills/plan/SKILL.md`:318-320 names the record skeleton for the close.

## 6. Unknowns

- None that blocks a decision. The six-row case list of § 9's both-ways check lives outside this repository (Silerax, `D:\RCCA_TMP`)
  and in `dev/changes/test-cost-research-2026-11-22.md`; it is read by the check, not by this research.
