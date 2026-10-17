# DECISIONS - plan RBB (REBUILD plan B: the cycle as a skill and as doctrine)

Numbered, scoped to this plan; another plan cites one as `RBB/D-NN`. The source is `dev/REBUILD.md`
§ The cycle and § Tickets (operator-approved 2026-10-17) plus `RESEARCH.md`; plan A's decisions are
cited as `RBA/D-NN`, never restated. `plan:` names the plan whose tickets implement the decision.

## Decisions

- **D-01** `/pnp:plan` is a new skill, `skills/plan/SKILL.md`, and it IS stages 1-6 of REBUILD
  § The cycle: the roadmap entry (written if absent, strict format) -> research (1-2 `sonnet`
  agents, fresh context, reply only) -> `DECISIONS.md` with Open Questions that halt the stage ->
  the planner agent -> the mechanical gate -> ONE Codex readiness pass -> COO triage -> revision ->
  `readiness/<ABBR>/round-N.md` -> cap 2 / stall -> the operator's approval -> landing. It carries
  the Step 0 block and the version-interlock line every skill carries (self-check :6729-6747).
  plan: RBB
- **D-02** The agent contracts live in the payload as plain Markdown under `templates/briefs/`:
  `research.md`, `planner.md`, `readiness-codex.md`, `writer-dispatch.md` - read at run time by
  path under `${CLAUDE_PLUGIN_ROOT}`, never rendered, never managed, not in `managedRegions`. The
  skill names each by path; `templates/README.md` gains the sentence that `briefs/` is read, not
  rendered. plan: RBB
- **D-03** The planner is dispatched as `subagent_type: "writer"` (the only agent type Gate 1 lets
  write, `RESEARCH.md` fact 4; the same `opus` tier REBUILD names, pinned in `writer.md`) with the
  planner brief: it writes ONLY under `<plansDir>/drafts/<ABBR>/` and returns the structured handoff
  only - which `D-NN` lands in which ticket, dependencies checked, risks, evidence pointers - never
  the files' text; the COO reads the files from disk. The brief carries no `Ticket:` line, so Gate 2
  raises ONE dialog per planner dispatch - the gate's click for a plan that does not yet exist, not
  a defect. A revision is the same dispatch over the round file. A `planner` agent type with its own
  Gate 1 exemption stays deferred. (Arbitration ruling 2026-10-17, CANDIDATES § Ruling ledger.) plan: RBB
- **D-04** The plan is drafted as the folder `<plansDir>/drafts/<ABBR>/` (untracked), stamped and
  audited there (`plan-gate.js` resolves `readiness/<ABBR>/` and the xrefs from the grandparent,
  `RESEARCH.md` fact 5). Landing on the operator's approval, every path from the project root:
  the untracked folder is MOVED by the shell (`Move-Item <plansDir>/drafts/<ABBR>
  <plansDir>/active/<ABBR>` - not a git verb, nothing tracked is touched), then `git add` of
  `<plansDir>/active/<ABBR>`, `<plansDir>/readiness/<ABBR>` and `<plansDir>/ROADMAP.md` (its
  `Plans:`/`Status:` lines updated), one docs commit; the stamp survives the move byte for byte
  (file names are relative to the folder). Archiving a folder plan is `git mv <plansDir>/active/<ABBR>
  <plansDir>/archive/<NNN>_PLAN_<ABBR>_<date>` from the root, preceded by the archiving grep
  (WORKFLOW § Durable development history): `git grep -n "operator rule" -- <plansDir>/active/<ABBR>`
  must hit only lines whose rule has a CANDIDATES row, and the same grep is run first over
  `archive/012_PLAN_RBA_2026-10-17/DECISIONS.md` as the positive control (D-15 hits). `drafts/PLAN_<ABBR>.draft.md` is no longer written; the directory stays (setup
  creates it, `test-setup.mjs:187`). Gate 2 off-plan keeps raising the dialog for a ticket of a
  drafted plan. plan: RBB
- **D-05** The readiness brief is `COVERED BY: operator word "<quote>", <date>` (first line),
  `Class: plan`, `PLAN: <plansDir>/drafts/<ABBR>` and the text of `templates/briefs/readiness-codex.md`:
  the blocker contract (BLOCKER = a required property the plan lacks + the evidence; INFO never
  revises; wording, formatting and `file:line` precision out of scope; the fix a hint) and a FIXED
  output shape - one findings table `| id | class | property | evidence | hint |`, then one line
  `BLOCKERS: <n> INFO: <m>`, nothing else - so the verdict is compact by contract. The wrapper is
  unchanged (it writes no file); the skill runs it in the background with stdout to
  `<scratchDir>/readiness-round.txt`, and the COO writes `readiness/<ABBR>/round-N.md` = that table
  verbatim + a disposition column (fixed / rejected: why / deferred / asked). The order of the
  gate is `--stamp` FIRST (it refuses and lists the problems while the contract is broken, writes
  the stamp otherwise), then `--check` confirms; after every revision the folder is re-stamped
  before the next dispatch. plan: RBB
- **D-06** Pass economy, read off the audit table unchanged: pass 1 rides the ticket's standing word;
  pass 2 only when pass 1 returned a BLOCKER that reverses a `D-NN`, or the COO names a risk
  (security, tenancy, concurrency, transactions) after a substantive revision - on the operator's
  word; at most 2 revisions; a revision that does not reduce the BLOCKER count stops and reports.
  The pass-2 brief carries `round-1.md` verbatim - findings and dispositions - and every NEW finding
  declares why pass 1 could not see it (the carried-list form of § Fail aggregation).
  `review.plan.passes` keeps its meaning (the ceiling, factory 2) - no schema change; the roles
  display's plan-row note becomes `second pass only on your word: a reversed decision or a named
  risk` (RBB-003), and `skills/roles/SKILL.md`'s `passes + 1` explanation says the same (RBB-002). plan: RBB
- **D-07** `/pnp:review` readiness mode shrinks to what `/pnp:plan` calls: Steps 2a-2e are deleted,
  the brief block is D-05's three lines + the contract, the wrapper call and the round file stay;
  the fact-check gate (Step 2b) stays for a DIFF and is gone for a plan. Engine-neutral as today:
  the plan row's host decides - a Claude-hosted row dispatches `reviewer` with the same brief, reads
  the FOLDER (no diff) and returns the same findings table, and `templates/agents/reviewer.md.tmpl`
  says so in its plan-class paragraph (`PASS`/`NEEDS-FIX` gone); Gate 2 runs the same `--check`.
  `--hash` leaves the skill text; the flag stays in the code until a code ticket deletes it. plan: RBB
- **D-08** The docs state the cycle once and short: `docs/WORKFLOW.md` § Plan readiness review (the
  cycle, the gate, the contract, the round file, the session rule), § Planning lock (the planning's
  own files are `drafts/<ABBR>/` + `readiness/<ABBR>/`), § Durable development history (folder,
  `records/`, ROADMAP), § Loop shape, § The transfer surface; `docs/REVIEW_CHECKLIST.md` § Plan
  readiness (the blocker contract); `docs/LOOP.md`, `docs/OPERATOR_PROTOCOL.md`,
  `docs/CODEX_REVIEW_QA_RECIPE.md`, `docs/README.md`, `docs/READINESS_CLASSES.md` (kept as the class
  list the Codex brief cites) - every sentence that names a struck artifact goes; the rule stays,
  the story goes (C2 compacts the rest). plan: RBB
- **D-09** The session rule enters the payload as prose: ~400k is a ticket boundary and a guide; a
  readiness cycle starts in a fresh session; the COO reads approved tickets once and carries no
  revision or verdict body; the HARD-024 checkpoint hook stays self-install only. plan: RBB
- **D-10** The Writer brief is a pointer: `Ticket: <REF>`, "read `tickets/<REF>.md` and the files its
  Code Map names", the standing lines (`templates/briefs/writer-dispatch.md`); no restating of
  goal, files or acceptance. `/pnp:loop` and `/pnp:work` point at it; `/pnp:work` and `/pnp:mission`
  send a new durable plan to `/pnp:plan`. plan: RBB
- **D-11** Release 0.3.0 = migration `0025_roadmap-seed` (`seed-file` ROADMAP per `RBA/D-04`;
  `rerender-managed-region` for `CLAUDE.md#aiwf-core` and `ORCHESTRATOR.md`, both changed since
  0024 - `RESEARCH.md` fact 6 - and for `.claude/agents/reviewer.md` with `ifRecorded: true`, the
  template RBB-002 changes), the example bump's `seed-file` op appended LAST, the self-check's
  `OP_TYPES` copy at five with its "four" prose, a `seed-file` row in `migrations/README.md`, the
  plan-row note in `scripts/setup/aiwf-roles.mjs` (D-06), the bump in `plugin.json`, the manifest
  entry, and the CHANGELOG block. The code half goes through the Writer; the CHANGELOG, the
  overrides cleanup and the tag/push words are the COO's. plan: RBB
- **D-12** The CHANGELOG's `Retires local rules:` line NAMES the project-local rules the cycle
  retires: readiness mechanics (delta scan + delta fact-check), chain-trace in the evidence pack,
  "the plan is read by sections", "blockers of the previous ticket enter the next brief", readiness
  symmetry, "a turn of its own is not a stop", and the checkpoint rules the session rule replaces.
  PnP's own `dev/PROJECT_OVERRIDES.md` § Loop shape loses them in RBB-003; each consumer deletes
  its copies in one sitting on its operator's word. plan: RBB
- **D-13** The root `README.md` gets only the sentences 0.3.0 makes false (the command count and
  list, the version, the readiness-artifact sentences :43,:218-220, the `PASS`/`NEEDS-FIX` verdict
  :228, the `/pnp:review` row of the command table :198 - its verdict column names the findings
  table); the rewrite stays HARD-011 (0.3.1). The same ticket cleans this repository's
  `dev/PROJECT_OVERRIDES.md` § Workspace paths (the `.aiwf/` block :348-357 still names the draft
  file and `.aiwf/plan/<ABBR>/`) beside § Loop shape. plan: RBB
- **D-16** The self-check over THIS installation cannot pass between the bump and the local update
  (`aiwf-selfcheck.js:5923-5929` compares the installed version with the payload's). RBB-003's
  order: the Writer's code commit -> the example cycle (its step 8 runs the self-check on a fresh
  0.3.0 install - the proof at handoff) -> the local `/pnp:update --apply` on the operator's word
  with auto mode off (overrides § Execution discipline) -> `selfcheck` over `.` -> the self-install
  diff rides the prose commit. The `selfcheck` row is owed once, after the update. plan: RBB
- **D-14** Tickets: RBB-001 (`/pnp:plan` + `templates/briefs/`), RBB-002 (`/pnp:review` + the
  docs + the pointer skills + the template lines), RBB-003 (release 0.3.0). Prose is R1 in the
  main session (overrides § Hard rules); the code half of RBB-003 is R2 through the Writer, rows per
  `RBA/D-15`: `update-suite` + `validate-payload` + `selfcheck` + `setup-suite` (`scripts/setup/`
  changes) + `example-cycle-windows` (examples change), once, in the background at handoff.
  Routing by the four checks read off each ticket: RBB-001 and RBB-002 `COO: cheap (Opus) - all
  four no`; RBB-003 `COO: top (Fable) - because check 1` (migration code; arbitration ruling
  2026-10-17 - REBUILD:209's "B3 cheap" was an estimate made before the ticket's contract existed
  and is corrected there). The operator chose Fable for this plan's drafting; each ticket's session
  is the operator's call. plan: RBB
- **D-15** This plan is the first under the new cycle with the ONE Codex pass (`RBA/D-13`): the brief
  of D-05 is written by hand this once, from the same text RBB-001 puts into
  `templates/briefs/readiness-codex.md`. plan: RBB

## Deferred

- A `planner` agent type that Gate 1 lets write under `<plansDir>/drafts/` (a hook change; D-03's
  writer-hosted planner is measured on the first Silerax plan first).
- Qualifying COO routing check 1 for payload migrations (data applied by a tested engine, unlike a
  DB or access migration) - a doctrine change for the operator, a ROADMAP line when raised.
- A verdict-to-file mode in the Codex wrappers (code; only if D-05's output contract proves
  insufficient).
- Deleting `--hash` from `plan-gate.js` and the monolith readers (a code ticket after 0.3.0).
- The measurement instruments (plan C, C1), the doctrine compaction (C2), the suites (C3).

## Open Questions

None. The product choices were made by the operator in REBUILD (every stage approved 2026-10-17);
D-03, D-04 and D-05 are engineering choices inside the approved cycle, reported here.
