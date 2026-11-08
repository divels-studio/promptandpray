# PLAN_DOCTR - the doctrine's open wording and gaps closed; release 0.3.16
Tickets: 2 - the DOCSTAGE D-09 shape: one prose ticket (R1, main session, no auditor) carrying every sentence, one code ticket (the Writer, review.code pass 1) carrying the migration, the bump and the changelog; one release 0.3.16 (DECISIONS D-01)

The plan of the roadmap entry `DOCTR` in `dev/backlogs/ROADMAP.md` (`:120-162`). One folder: this
index, `DECISIONS.md` (D-01..D-27), `RESEARCH.md` (two scans, 2026-11-08, HEAD `58fa73b`, facts
1-36), `tickets/DOCTR-001.md` and `tickets/DOCTR-002.md` (the frozen contracts), `records/` (written at
each ticket's close). The shape is DOCSTAGE/D-09's (D-01).

## Goal

The doctrine has no known double phrasing, unqualified term or missing rule from the recorded list
of the roadmap entry: every item the decisions settle as a sentence is written once, at its home
heading in the stage template, the doc or the skill that owns it, and every consumer that restates
it moves with it by a closing grep (DOCTR-001, R1 prose - D-03, D-04, D-06..D-17, D-19..D-23, D-26;
the closes without a change D-02 and D-27); the templates that changed reach every installation as
release 0.3.16 - migration `0041_doctrine-wording` re-rendering exactly the managed files whose
templates 001 changed, one `note`, the bump, the `CHANGELOG.md` block whose `Retires local rules:`
line names the dialog rule the payload now carries (D-20), the `README.md` version line (DOCTR-002,
the Writer, `review.code` pass 1). The split by stage is done and out of scope. The cycle's numbers
are measured as D-24 states; sessions and tiers are D-25.

## Scope

In:
- **DOCTR-001** (R1, the main session, no auditor - `review.docs` row 0): the worklist rows of the
  ticket, one per decision, in `templates/ORCHESTRATOR.md.tmpl`, `templates/doctrine/work.md.tmpl`,
  `templates/doctrine/ticket.md.tmpl`, `templates/doctrine/plan.md.tmpl`, `templates/CLAUDE.md.tmpl`
  (the `aiwf-core` region only), `templates/README.md`, `templates/ROADMAP.md.tmpl`,
  `templates/PROJECT_OVERRIDES.md.tmpl`, `templates/agents/writer.md.tmpl` (`:68-70`, D-21),
  `templates/briefs/writer-dispatch.md`,
  `templates/briefs/record.md`, `templates/briefs/planner.md`,
  `templates/memory-seeds/closeout-needs-a-live-pass.md`, `docs/READINESS_CLASSES.md`,
  `docs/OPERATOR_PROTOCOL.md`, `skills/plan/SKILL.md`, `skills/review/SKILL.md`,
  `skills/roles/SKILL.md` (`:133` only), `skills/qa/SKILL.md`, `skills/qal/SKILL.md`,
  `skills/work/SKILL.md`. The rendered copies under `.claude/` are untouched (D-01).
- **DOCTR-002** (the Writer): `migrations/0041_doctrine-wording/{ops.json,NOTES.md}`, the manifest
  line, `.claude-plugin/plugin.json`; the code consumer of D-04 (`scripts/setup/aiwf-roles.mjs:577`,
  its pin `scripts/setup/test-setup.mjs:1497` and the sample line `skills/roles/SKILL.md:118`); the
  COO's R1 prose that rides the same commit (the `CHANGELOG.md` block, `README.md:22`).

Out:
- item 5, a structural check on first-pass-visible blockers - code on the Codex wrapper, deferred to
  ROADMAP § CODEX; its line moves there at DOCTR-001's close (D-05, `plan: deferred`);
- items 18 and 19 - the roadmap template's places, the unrouted items, the flat defect list - back
  when a second consumer asks; their two lines move at DOCTR-001's close to a new roadmap entry
  `RMAP - the roadmap's places` (`Status: idea`) (D-18, `plan: deferred`);
- the setup interview's language-per-record-class question - ROADMAP § SETUP, a schema change (D-21);
- C-045 (a lint baseline) and C-071 (sessions start from the repo root) - confirmed project-only, no
  text (D-07); a repo-kept known-failing list - a project's choice (D-06);
- items 24 and 25 - declined, no text change (D-27); item 9 and F24 - already closed (D-02);
- the split by stage (DOCSTAGE), the compaction of the skills' bodies (ROADMAP § CTX);
- `templates/agents/reviewer.md.tmpl`, `templates/agents/qa.md.tmpl`, `templates/AGENTS.md.tmpl`,
  `templates/doctrine/review.md.tmpl` - no decision moves their text, so 002 carries no op for them; `schema/`, `hooks/`, `examples/`;
- any shipped migration (`migrations/0033_doctrine-stages/ops.json` is pinned by
  `scripts/update/test-update.mjs:1986-1993`; `0036`, `0040` are read as precedents only);
- the consumers: each takes 0.3.16 through `/plugin update` + `/pnp:update` in its own session, and
  deletes its own copy of the retired dialog rule on its operator's word.

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| DOCTR-001 | every sentence of the decisions in the templates, the docs and the skills, its consumers moved by the closing greps | D-01 D-02 D-03 D-04 D-05 D-06 D-07 D-08 D-09 D-10 D-11 D-12 D-13 D-14 D-15 D-16 D-17 D-18 D-19 D-20 D-21 D-22 D-23 D-25 D-26 D-27 | open | - |
| DOCTR-002 | release 0.3.16 - migration 0041 re-rendering the changed managed files, the note, the bump, the changelog with its Retires line; the roles note of D-04 | D-01 D-04 D-20 D-21 D-25 | open | - |

## Order and gates

The two tickets run IN ORDER: 002's ops re-render what 001 wrote, and its op list is read off 001's
commit. Neither starts on the planning word.

- **The landing** (the COO, on the approval): `## Measurements` and `## Roadmap entry` written into
  this index (D-24), the folder moved to `active/DOCTR/`, ROADMAP § DOCTR `Plans:` and `Status:
  planned`, the ledger line.
- **DOCTR-001**: the operator's word for the ticket. R1 in the main session (overrides § Hard rules:
  prose in the payload is R1) on the cheap COO (D-25); no Writer, no route state, no auditor
  (`review.docs` row 0). The worklist written, the closing greps re-run to their post-change counts,
  VERIFY = the prose row once (the provenance grep, `validate-payload`) plus one render dry-run
  (§ Procedures). One docs commit through its native dialog - the operator's click is the approval;
  no AI attribution line. The live copy refreshed (root `CLAUDE.md` § This repository is the plugin).
  No bump, no CHANGELOG block. D-04's code consumer - the printed roles note
  `scripts/setup/aiwf-roles.mjs:577`, its pin `scripts/setup/test-setup.mjs:1497` and its sample
  `skills/roles/SKILL.md:118` - is NOT 001's: it lands in 002 (W5); 001 changes
  `skills/roles/SKILL.md:133` only. The record `records/DOCTR-001.md` in its own docs commit, carrying
  the close duties of the ticket (D-02, D-27, the D-07 verdict, the D-05 and D-18 line moves).
- **DOCTR-002**: the operator's word for the ticket. The Writer, dispatched once with
  `Ticket: DOCTR-002` on its own line (Gate 2 silent: an active plan's ticket), the scope guard
  `HEAD <hash>` at the dispatch, the route state written. The COO writes the `CHANGELOG.md` block and
  `README.md:22` in the main session BEFORE the Verify batch, so they ride the one code commit (the
  SEEDFS precedent). At the hand-back the COO runs the four Verify rows ONCE as one parallel batch in
  the background beside the full diff read - the self-check in its CI form `--plugin-root .` alone,
  because the bump reds the fixture form's version-stamp row until the self-install
  (`dev/VERIFY_RUNBOOK.md:22-29`; DOCTR-002 § Verify). Auditor pass 1 of the audit table's code row
  (`/pnp:roles`) rides the ticket's word; any further pass takes its own word, one word per pass. No
  QA (no runtime surface). The ONE code commit is the Writer's, local, by explicit paths, through its
  native dialog, body `Refs: DOCTR-002`, no AI attribution line of any kind. The live copy refreshed.
  Then the COO runs `/pnp:update --apply` on this repository (DOCSTAGE/D-09, the SEEDFS precedent),
  its embedded project-scope self-check the proof of the fixture form's PROJECT scope. The record
  commit (docs, its own dialog) also captures the tracked files the self-install changed (the SEEDFS
  precedent, `58fa73b`: "the self-install on 0.3.15"); its explicit path list:
  `dev/backlogs/active/DOCTR/records/DOCTR-002.md`, `dev/backlogs/active/DOCTR/PLAN_DOCTR.md` (the
  row closed), `dev/backlogs/ROADMAP.md` (the lines the plan closes marked),
  `dev/backlogs/CANDIDATES.md` (the rows marked), `dev/PROJECT_OVERRIDES.md` (this repository's
  retired local rule deleted from § Communication, `:210-216`, R1 - D-01, D-20),
  `.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/aiwf-native/doctrine/work.md`,
  `.claude/aiwf-native/doctrine/ticket.md`, `.claude/aiwf-native/doctrine/plan.md`,
  `.claude/aiwf-native/aiwf.config.json` (`installedPluginVersion`, `lastMigrationApplied`, `:4-5`),
  `.claude/agents/writer.md`, root `CLAUDE.md`. The release tag lands on that commit. The plan
  archived at once (guard (e)).
- **The release**: the tag word and the push word are the operator's, separate, after 002's record
  commit - the tag created locally on the record commit and pushed with `main` in one push, CI not
  waited for (`dev/PROJECT_OVERRIDES.md:44-54`). Named here, not gates of a ticket.

## Procedures

- **The marker rule** (001). Every new sentence carries the literal marker phrase its worklist row
  names, ON ONE LINE - the text wraps around the marker, never inside it - so the row's acceptance
  grep can count it. A marker hit outside the files its row names is red.
- **Render dry-run** (001 Verify; 002 inherits it through `setup-suite`). A script in the session
  scratch directory, never in the repository, importing `templateContext`, `renderTemplate` and
  `carryProjectAdditions` from `scripts/setup/generate.mjs` (`:269`, `:372`, `:593`). It reads
  `.claude/aiwf-native/aiwf.config.json`, drops `$schema` and `_aiwf` (the payload half,
  `generate.mjs:260`), and renders `templates/ORCHESTRATOR.md.tmpl`,
  `templates/doctrine/{work,ticket,plan}.md.tmpl`, `templates/agents/writer.md.tmpl` and
  `templates/CLAUDE.md.tmpl` against it with
  `resolvedRoot` = the repository root; then it carries a one-line additions block into each
  whole-file render. Red: a throw; a `{{` left in any render; a `TEMPLATE CONTRACT` line left in any
  render; a whole-file template whose last non-blank line is not `<!-- /project additions -->`, or a
  render whose carried block does not end it; the `CLAUDE.md` render without exactly one
  `<!-- BEGIN aiwf-core -->` and one `<!-- END aiwf-core -->`, or a D-26 route line outside them.

## Closing greps

(the COO's consumer enumeration, run 2026-11-08 at HEAD 58fa73b over `templates/`, `docs/`, `skills/` unless stated)
- Set 1, the pass-2 trigger phrase (D-04): `rg -n "reverses" templates docs skills` - 6 hits: `templates/ORCHESTRATOR.md.tmpl:108` (escalation trigger 1 - stays as it is, it is not the pass-2 sentence), `templates/PROJECT_OVERRIDES.md.tmpl:175`, `templates/doctrine/plan.md.tmpl:125`, `skills/plan/SKILL.md:242`, `skills/roles/SKILL.md:133`, `skills/review/SKILL.md:324`. Research agent A also pointed at `skills/roles/SKILL.md:118`, `docs/OPERATOR_PROTOCOL.md:114`, `templates/doctrine/review.md.tmpl:34` as restating consumers with other words (no `reverses` hit) - open each and include it in the worklist only if it states the trigger.
- Set 2, the R3 "migrations" sites (D-03): `rg -n "[Mm]igrations? / access[- ]policy" templates docs skills` - 3 hits: `templates/doctrine/work.md.tmpl:59`, `:76`, `:109`; plus the route line `templates/CLAUDE.md.tmpl:57` (agent A's pointer, other wording - open it).
- Set 3, item 9 and the new names: `rg -n "unplanned R2|AskUserQuestion|SendMessage" templates docs skills scripts hooks schema` - 0 hits. After DOCTR-001 the grep for `AskUserQuestion` and `SendMessage` must hit exactly the new sentences of D-20 and D-17 and nothing else (the acceptance of 001 states this).
- Set 4, the visible-outcome close (D-22): `rg -n "offline proof never replaces|operator's own run|live pass" templates docs skills` - `templates/doctrine/ticket.md.tmpl:323-324`, `templates/briefs/record.md:55-56`, `templates/memory-seeds/closeout-needs-a-live-pass.md:5,7` (`skills/qal/SKILL.md:106` "live pass" is QAL's live browser pass - not this set).
- Set 5, single-home sentences, one hit each: `exempt` (D-16) `templates/ORCHESTRATOR.md.tmpl:243` (`:390`, `:392` are guard (g)'s other meaning); `dialog or a word` (D-20) `templates/ORCHESTRATOR.md.tmpl:139` and `never a \`file:line\`` `:319`; `live\*\* Writer` (D-17) `templates/doctrine/ticket.md.tmpl:116`; `settles which tree` (D-08) `templates/ORCHESTRATOR.md.tmpl:467`; `zero new failures by name` (D-06) `templates/ORCHESTRATOR.md.tmpl:423`; `sixteenth` (D-15) `docs/READINESS_CLASSES.md:7`.
- Set 6, the route order lines where `/pnp:qa` follows `/pnp:review` (D-26): `rg -n "pnp:review.*pnp:qa" templates docs skills` - 7 route-order hits: `templates/doctrine/work.md.tmpl:39`, `:62`, `:108`, `:109`, `templates/CLAUDE.md.tmpl:55`, `skills/qal/SKILL.md:183`, `skills/work/SKILL.md:85` (the other hits of that grep are door/pointer lines, not order statements).

The planner's reading of the sets against the tree at `58fa73b` (the tickets act on it):
- Set 1's other-word consumers: `skills/roles/SKILL.md:118` states the trigger, but it is the sample of
  the note `scripts/setup/aiwf-roles.mjs:577` prints, pinned by `scripts/setup/test-setup.mjs:1497` -
  code, so it moves in 002 with its producer and pin; `docs/OPERATOR_PROTOCOL.md:114` states it
  ("for a reversed decision") - 001; `templates/doctrine/review.md.tmpl:34` only points at
  `plan.md` § Plan readiness review - not a consumer, untouched.
- Set 2's `templates/CLAUDE.md.tmpl:57` reads "a mini-plan and its readiness review first, then the
  R2 loop" - it names no class and carries no "migrations"; `rg -n "[Mm]igration" templates/CLAUDE.md.tmpl`
  has 0 hits. 001 leaves it as it is for D-03 (D-03 now names the three `work.md` sites only); its
  R2 line `:55` still changes for D-26 (set 6).
- Set 6 and D-26's review-brief home: `skills/review/SKILL.md:178-181` (the EVIDENCE PACK slot of the
  review brief) gains the green E2E run's log path. It is not a route-order line - no
  `/pnp:review ... /pnp:qa` order is stated there - so set 6 stays the seven lines above; 001's P26
  row counts it with its own marker.

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 200,000 (approval 300,000 - start 100,000; the statusline files `~/.claude/ctx/<session>.pct` x `.size`, 30 % and 10 % of 1,000,000) | 697,990 |

The parts of the cycle spend, one per line, each with its source:

- research agent A (the doctrine text), sonnet - 137,390 - notification
- research agent B (the item sources and the release mechanics), sonnet - 130,510 - notification
- the planner (writer type; the draft, the eight answers and revision 1 in one resumed agent) - 242,396 - notification (the last of three, cumulative: 182,399, 203,673, 242,396)
- the runnability pre-pass, sonnet - 51,990 - notification
- readiness pass 1, Codex gpt-6-sol xhigh, cold - 135,704 - round header (`readiness/DOCTR/round-1.md`)

Start and approval numbers: file (the statusline source named in `dev/PROJECT_OVERRIDES.md` § Environment). No part is estimated.

## Roadmap entry

- Goal: the doctrine has no known double phrasing, unqualified term or missing rule from the recorded list
- Why: each item is a recorded gap or ambiguity found while working under the doctrine; DOCSTAGE restructures the files, this entry fixes their sentences
