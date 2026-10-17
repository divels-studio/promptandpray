# DECISIONS - plan RBA (REBUILD plan A: the structure)

Numbered, scoped to this plan; another plan cites one as `RBA/D-NN`. The source of every decision is
`dev/REBUILD.md` § The cycle and § Tickets (operator-approved 2026-10-17) plus `RESEARCH.md`; the
operator's own words are quoted verbatim where they are the source. `plan:` names the plan whose
tickets implement the decision.

## Decisions

- **D-01** `ROADMAP.md` lives at `<plansDir>/ROADMAP.md`, a fixed location: no config key, no
  bookkeeping entry, never rewritten by setup or by an update - the transfer surface's model
  (`generate.mjs:1083-1103`). plan: RBA
- **D-02** The entry format is REBUILD's strict format, verbatim; the payload template
  `templates/ROADMAP.md.tmpl` is static text with no placeholders, like `PNP_CANDIDATES.md.tmpl`.
  The COO writes entries; the operator never edits the file by hand („аз казвам идеята на COO, той
  или агент я пише в роадмапа по строго зададен формат"). plan: RBA
- **D-03** A new migration op `seed-file` `{ op, template, target }`: `target` is a path with the
  token `<plansDir>` resolved from the project config; the op writes the rendered template ONLY when
  the target does not exist, records nothing in `managedRegions`, prints `seed-file: <target>
  (created|kept)`, and in dry-run writes nothing. It is the fifth op in `OP_SPECS`; the 0011 promise
  about the transfer surface stands - `seed-file` never targets it. plan: RBA
- **D-04** The migration `0025_roadmap-seed`, the version bump and the CHANGELOG block are plan B's
  (release 0.3.0), because `validate-payload.mjs:258-268` requires the last manifest entry to equal
  `plugin.json` and a bump is a release act. RBA-001 proves the op through `test-update.mjs`
  fixtures only. The self-check's `OP_TYPES` copy (`aiwf-selfcheck.js` § example bump) stays at four
  ops until then, because it requires the example bump to use every op: the example bump gains its
  `seed-file` op with migration 0025 (COO decision at RBA-001, the Writer's blocker). plan: RBB (plan
  B, written after plan A lands)
- **D-05** The `## Candidates` section leaves the transfer-surface template; its bullet becomes a
  pointer to `ROADMAP.md`. The verbatim skeleton and the "Four sections" sentence in
  `docs/WORKFLOW.md` § The transfer surface change in the same diff; the rest of that section's prose
  is plan B's. Existing consumer files are operator-owned and untouched; this repo's
  `dev/backlogs/CANDIDATES.md` has no such heading and stays frozen as it is. plan: RBA
- **D-06** Gate 3 lets the main session write `<plansDir>/ROADMAP.md` while an R2/R3 route is open,
  under the transfer surface's containment rules (one contained `.md`, not under `.claude`, never
  while the route state is unusable) - an idea lands in the roadmap during a ticket. plan: RBA
- **D-07** A plan may be a folder: `active/<ABBR>/PLAN_<ABBR>.md` (index), `DECISIONS.md`,
  `RESEARCH.md`, `tickets/<ABBR>-NNN.md`, `records/<ABBR>-NNN.md`; readiness history stays in
  `readiness/<ABBR>/`. Monolith plans stay readable; no migration of old plans. plan: RBA
- **D-08** Both shapes are read through ONE predicate. Gate 2's `lookupTicketRef` targeted path
  tries `active/PLAN_<ABBR>.md`, then `active/<ABBR>/PLAN_<ABBR>.md`, then
  `active/<ABBR>/tickets/<REF>.md`; the fallback scan descends one level into `active/<ABBR>/`
  directories whose name matches the ABBR grammar. `generate.mjs` `existingPlansWarning` and the
  self-check plan-ref section import or mirror that predicate byte for byte, as they mirror today's.
  plan: RBA
- **D-09** A folder plan is archived as a directory: `git mv active/<ABBR>/
  archive/<NNN>_PLAN_<ABBR>_<YYYY-MM-DD>/` - the same name grammar; `readiness/<ABBR>/` stays. The
  readers' pointer-level lines (skills mission/brief/loop/setup/work/review, `docs/WORKFLOW.md`,
  `docs/LOOP.md`, the schema description, the two seeds) learn the folder in RBA-002; the cycle's own
  prose is plan B's. plan: RBA
- **D-10** The mechanical gate is `plan-gate.js --check <folder>`: at most 3 ticket files; each
  ticket file at most 6,144 bytes (a design constant standing for the ~1,500-token cap); the six
  fields present as headings `## Outcome`, `## Scope`, `## Acceptance`, `## Risk threshold`,
  `## Stop condition`, `## Verify`; every `D-NN` in `DECISIONS.md` carrying `plan: <ABBR>` cited by at
  least one ticket; every `<X>/D-NN` cross-reference resolving to `active/<X>/DECISIONS.md` or
  `archive/*_PLAN_<X>_*/DECISIONS.md`; no `TBD`, `TODO` or `???` in the frozen contract; every path
  in a ticket's `## Code Map` table exists. `--stamp <folder>` writes `readiness/<ABBR>/stamp.json`
  with the SHA-256 over the frozen contract (index, `DECISIONS.md`, `tickets/*.md`, sorted,
  name-prefixed) and the SHA-256 of the text of every cross-plan decision cited; `--check` also
  verifies the stamp. Exit 0 silent; exit 2 with `plan-gate: <token> - <message>` lines. plan: RBA
- **D-11** The plan-class brief shrinks to `Class: plan` + `PLAN: <plansDir>/active/<ABBR>` (a
  folder). Gate 2's reviewer branch and both Codex wrappers run `--check` on that folder and refuse
  on exit 2; the `TICKETS`, `CONSEQUENCE SCAN` and `OWN PASS` lines and all their tokens are deleted;
  a `PLAN:` naming a file is refused with `plan-folder-required` (the operator struck the old
  artifacts 2026-10-17). Until plan B rewrites `/pnp:review`, its readiness mode describes a flow the
  gate no longer accepts - plan B follows plan A immediately. plan: RBA
- **D-12** Self-check 5c and the spike `gate2-plan` cases are rewritten to D-10/D-11 with these
  negative controls: (i) a current-plan decision no ticket cites, (ii) an invalid cross-plan
  reference, (iii) a `deferred` decision wrongly demanded of the current tickets, (iv) a stamp that
  does not match the folder, (v) a cross-plan decision whose source text changed after the stamp,
  (vi) a fourth ticket file, (vii) a ticket over the byte cap. plan: RBA
- **D-13** This plan gets no readiness pass: its content is REBUILD § Tickets, approved by the
  operator, in the folder format; today's gate refuses a plan-class run without the struck artifacts,
  and the new gate is RBA-003 itself. Plan B is the first plan under the new cycle with the one Codex
  pass. The operator may ask for a pass over this plan at any time. plan: RBA
- **D-14** The three tickets run in order RBA-001 -> RBA-002 -> RBA-003, each on the operator's word,
  each on `COO: top (Fable) - because check 1` (a seeding op and Gate 3 in 001, Gate 2's lookup in
  002, the gate's enforcement code in 003); a Codex pass over the code only when the operator asks
  („A's code gets a Codex pass only if the operator asks"). plan: RBA
- **D-15** (operator rule 2026-10-17, via the arbitration session: „всеки тикет по 20-30 мин" must
  not stack; „ама му кажи да го запише в плана") Per code ticket the row's suite runs ONCE: started in
  the background at the Writer's handoff (timeout 3600000, log outside the repo), in parallel with the
  COO's full diff read, by the COO itself or a `sonnet` agent that fixes nothing and runs no git; the
  Writer runs only its own new tests red/green, no suite. Rows: RBA-001 = `setup-suite` +
  `validate-payload` + `selfcheck`; RBA-002 and RBA-003 = `selfcheck` + `spikes`; plan B tickets = no
  suite (provenance grep + `validate-payload`); the example cycles only when `scripts/ci/` or
  `examples/` change. Three suite runs in plan A in total; the fast suites (C3) stay after 0.3.0; CI
  runs the full set on the pushed commit. No micro-round edit while a suite is running. plan: RBA

## Deferred

- A planner subagent for this plan: the brief templates arrive with plan B (B1); this plan is written
  by hand (REBUILD: „written as folders by hand until A2 teaches the tools").
- The ~400k session boundary and the session-start cost: measured after 0.3.0 (REBUILD § The session
  start cost).
- Reading an old monolith plan's `readiness/<ABBR>/` with the new gate: never - old plans finish in
  the old format.

## Open Questions

None. (An unknown is never written down as an assumption; the three Writer-side unknowns in
`RESEARCH.md` change no decision.)
