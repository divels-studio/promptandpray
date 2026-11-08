# 0041_doctrine-wording

**The doctrine says in its own words what the loop had carried as recorded gaps or local habits: the
question dialog as a numbered rule, the expected red set, the `E2E` and `Escalation` brief lines, the
narrowed word, the "user sees less" stop, the live-Writer resume, the CHANGELOG's language, the
visible-outcome waiver and the operator-made decision as the second-pass trigger. This update
re-renders the core, three stage files, the Writer agent and the managed `CLAUDE.md` region.**

## What changes

`ORCHESTRATOR.md` (the core):

- § The operator-channel filter: a raised question takes the form of rule 9; its dual - an
  operator's own question is answered directly, never turned into a dialog.
- § COO owns broad scans: the exempt list that closes an enumeration names non-callers only (a
  comment, a doc, a fixture quoting the name); a caller is never exempt by its purpose.
- § The operator does not arbitrate engineering decisions: one class always stops - the user sees
  less than before (a field, a row or a function present before the change and absent after it),
  found by any role mid-ticket, stops the ticket for the operator's word, never a note for the close.
- § How the COO speaks to the operator: rule 7 extends to an agent, a check or a pass the doctrine
  does not require and the ticket does not name - written into the ticket with its scope and cost
  before it is spent; its suppression dual, the scan-tier work the doctrine requires rides the
  ticket's word. New rule 9: a question to the operator is a dialog - the harness's question tool,
  one topic, numbered options with their consequences, the recommendation first, words and counts
  and never line numbers, up to four points, what does not block in ONE dialog at the ticket's end,
  never a list in the chat.
- § Operator-interaction guards, guard (b): a later remark in which the operator takes a step
  themselves narrows the standing word to what precedes that step; the COO stops there.
- § Verifying failure claims: the discovery scan records the baseline-red tests by name for every
  file in the ticket's verify line, and the Writer brief carries that expected red set; a repo-kept
  list of known-failing tests is a project's choice, named in its overrides document.
- § Branch policy: when a word names no tree, the session's own project root is the tree.

`doctrine/work.md`:

- § R3 - critical: the class reads "schema or data migrations of the product's persistent store";
  a plugin's payload migration is data applied by a tested engine and routes by its diff. The same
  wording in § COO routing, check 1, and in § Routing mapped to native.
- § R2 - product, § R3 - critical and § Routing mapped to native: the runtime routes show the E2E
  run (`E2E: yes`) before `/pnp:review`.
- § COO routing: the escalation line stands beside the `COO:` line; the four checks are read after
  the discovery scan, over the anchored worklist (a fully anchored worklist answers check 2 "no").
- § Tests: the E2E spec runs before the audit - for `E2E: yes` the COO runs the configured runner at
  the handoff, before `/pnp:review`; a red spec is a micro-round to the live Writer; `E2E: no` keeps
  the order.

`doctrine/ticket.md`:

- § Ticket brief contract (R2/R3): the `Verify` line names the expected red set by test name; two new
  mandatory lines, `E2E: yes | no - because <reason>` and `Escalation: none | trigger <N> - <why>`;
  the CHANGELOG is the one exception to English - kept in the language the project's `CLAUDE.md`
  `## Changelog format` names - and the operator's quotes are never translated.
- § The COO write boundary runs along artifact class, not size: the live Writer is resumed with a
  message to the dispatched agent (the harness's agent-message tool) for every micro-round, every
  correction round and the commit; a fresh spawn only when that agent has ended.
- § Role boundaries: the orchestrator runs the E2E runner at the handoff, before `/pnp:review`.
- § Durable development history: the visible-outcome waiver - the operator may decline their own run
  in words, the waiver quoted in the record, the outcome marked as not seen by the operator; a
  roadmap entry or finding line carries the problem, its evidence, the operator's words and the
  scope, never the fix; a nested list's parent line closes with its last child, one line at a time,
  never as a sweep.

`doctrine/plan.md`:

- § Plan readiness review, pass economy: the second pass needs a BLOCKER that reverses a decision the
  operator made (a `D-NN` carrying the operator's words or a dialog answer); its suppression dual, a
  BLOCKER that reverses a COO decision is a revision, never a second pass.

The managed `CLAUDE.md` region:

- § Routes: the R2 line shows the E2E run (`E2E: yes`) before `/pnp:review`.

The Writer agent (`.claude/agents/writer.md`):

- § Operating rules, the ticket-brief lines that bind the Writer: the CHANGELOG is in the language of
  the project's `CLAUDE.md` `## Changelog format`.

Outside the rendered files, in the payload only: `docs/READINESS_CLASSES.md` gains class 17 (the
NULL case of a boolean predicate) and class 18 (a replaced reader); `templates/README.md` says a rule
names the property it checks, not a list of kinds of work. Two seeds changed -
`templates/PROJECT_OVERRIDES.md.tmpl` (the second-pass line) and `templates/ROADMAP.md.tmpl` (the
quote form of the `Born:` line); a seed is written once, so neither reaches an installed copy.

## What this migration does

- Six `rerender-managed-region` operations, every additions block carried:
  `.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/aiwf-native/doctrine/work.md`,
  `.claude/aiwf-native/doctrine/ticket.md`, `.claude/aiwf-native/doctrine/plan.md`,
  `.claude/agents/writer.md` (whole files), and the `aiwf-core` region of `CLAUDE.md`. None carries
  `createIfAbsent` or `ifRecorded`: the six files exist on every installation since 0.3.8.
- One `note` (`doctrine-wording-0-3-16`): `/pnp:update` prints it with the CHANGELOG block of 0.3.16,
  its `docRefs` and its one `supersedes` id. The release adds a stop for the operator's word (the
  narrowed word), so the note carries the word-gate sentence of `migrations/README.md` verbatim.

## What it leaves alone

Every config key, the ask-ruleset, every operator-owned file - the installed overrides document and
the installed roadmap included, both seeds written once - and everything outside the `aiwf-core`
markers of `CLAUDE.md`. The Reviewer and QA agents, `AGENTS.md` and `doctrine/review.md` are not
re-rendered: their templates did not change.

## Superseded local rules

One. An overrides document may carry, in its § Communication, a local rule that a question to the
operator is a dialog (the question tool, numbered options, one topic, the recommendation first). The
core now carries it as rule 9 of § How the COO speaks to the operator, so the note's `supersedes`
names it by the id `question-to-the-operator-is-a-dialog`; the local rule may be deleted on the
operator's word - this update deletes nothing. The CHANGELOG's line for 0.3.16 names it:
`Retires local rules: overrides § Communication: A question to the operator is a dialog`.
