# PLAN_SKILLS - every skill says what the doctrine already decided; release 0.3.17
Tickets: 2 - one prose ticket (SKILLS-001: R1 in the main session - the skills, the one run-time brief template `templates/briefs/writer-dispatch.md` and nothing under `templates/doctrine/`, `templates/agents/`, `templates/ORCHESTRATOR.md.tmpl`; plus `docs/CODEX_REVIEW_QA_RECIPE.md` and `docs/SESSION_BRIEF_RECIPE.md`) and one release ticket (SKILLS-002: the Writer - migration `0042` with one `note` op, the manifest entry, the bump to 0.3.17 in `.claude-plugin/plugin.json`, the CHANGELOG block with its `Retires local rules:` line, `README.md:22`), the DOCTR/D-01 shape (D-01)

The plan of the roadmap entry `SKILLS` in `dev/backlogs/ROADMAP.md` (`:120-137`). One folder: this
index, `DECISIONS.md` (D-01..D-14), `RESEARCH.md` (two scans, 2026-11-08, HEAD `b35693b`, facts
1-30), `tickets/SKILLS-001.md` and `tickets/SKILLS-002.md` (the frozen contracts), `records/` (written
at each ticket's close). The shape is DOCSTAGE/D-09's and DOCTR/D-01's (D-01).

## Goal

Every open item of ROADMAP § SKILLS that a decision settles as a sentence stands in the skill that
executes it: the E2E report copied by whoever ran the suite (D-02), the auto-mode sentence in
`/pnp:setup` (D-03), `/pnp:brief` composing no brief when the state is durable (D-04), the no-match
check in the runnability pre-pass (D-05), the live planner (D-09), Step 1's three questions answered
after the research (D-10), the spec's RED run as a declared QA artifact (D-11), the COO model per ticket in the approval
report (D-15) - written by
SKILLS-001 (R1 prose, the main session) into the skills, `templates/briefs/writer-dispatch.md` and the
two recipes, no managed template touched; and they reach every installation as release 0.3.17 -
migration `0042_skills-wording` with one `note`, the manifest entry, the bump, the `CHANGELOG.md`
block whose `Retires local rules:` line names the two consumer-local forms (D-12), `README.md:22`
(SKILLS-002: the Writer's migration and bump, the COO's R1 changelog and README line riding the
same commit - D-01). Three sub-items close without text (D-06, D-08) or stay open (D-07).
Sessions and tiers are D-13; the cycle's numbers are measured as D-14 states.

## Scope

In:
- **SKILLS-001** (R1, the main session, no auditor - `review.docs` row 0, D-01): `skills/qa/SKILL.md`
  (D-02, D-11), `skills/review/SKILL.md` (D-02), `skills/setup/SKILL.md` (D-03),
  `skills/brief/SKILL.md` (D-04), `skills/plan/SKILL.md` (D-05, D-09, D-10),
  `templates/briefs/writer-dispatch.md` (D-11), `docs/CODEX_REVIEW_QA_RECIPE.md` (D-02, D-11),
  `docs/SESSION_BRIEF_RECIPE.md` (D-04). The rendered copies under `.claude/` are untouched.
- **SKILLS-002** (the Writer): `migrations/0042_skills-wording/{ops.json,NOTES.md}`,
  `migrations/index.json`, `.claude-plugin/plugin.json:3` (D-01, D-12); the COO's R1 prose that
  rides the same commit, written in the main session before it (the `72ccbe8` precedent, D-01): the
  `CHANGELOG.md` block and `README.md:22`; after the commit the live-copy refresh and the
  self-install on this repository.

Out:
- every managed template - `templates/doctrine/*`, `templates/ORCHESTRATOR.md.tmpl`,
  `templates/agents/*`, `templates/CLAUDE.md.tmpl`: the doctrine already carries every rule these
  sentences execute (D-01, RESEARCH fact 30), so 002 carries no `rerender-managed-region` op;
- `templates/briefs/planner.md`, `templates/briefs/research.md`, `templates/briefs/record.md` (its
  Scratch section `:40-43` already asks where moved evidence went - D-02's close duty reads it as it
  stands), `skills/update/SKILL.md`, `skills/roles/SKILL.md` (D-03: covered at `:80-82` and `:102`),
  `skills/mission/SKILL.md`;
- item (d)'s sibling-decision scan - covered by the research brief and the closing greps, no
  sentence (D-06);
- item (d)'s consistency pre-pass per revision and the full-folder pre-pass after a rework -
  deferred to ROADMAP § BRIEFS' measurement; the roadmap sub-item stays open with that pointer
  (D-07, `plan: deferred`);
- item (e)'s "one item per message" chat form - declined, rule 9 stands (D-08, DOCTR/D-20);
- any shipped migration (`migrations/0041_doctrine-wording/` is history - DOCSTAGE/D-07); new skills
  (the entry's `out`);
- the consumers: each takes 0.3.17 through `/plugin update` + `/pnp:update` in its own session and
  deletes its own copy of a retired local rule on its operator's word (D-12).

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| SKILLS-001 | every sentence of D-02..D-05, D-09..D-11 in the skills, the Writer brief template and the two recipes | D-01 D-02 D-03 D-04 D-05 D-09 D-10 D-11 D-13 D-15 | closed (eaffdf5) | `records/SKILLS-001.md` |
| SKILLS-002 | release 0.3.17 - migration 0042 with one note, the manifest entry, the bump, the changelog with its Retires line, the README line | D-01 D-06 D-07 D-08 D-12 D-13 | open | - |

## Order and gates

The two tickets run IN ORDER: 002's note describes what 001 committed, and 002's record commit marks
the roadmap lines 001's sentences close. Neither starts on the planning word.

- **The landing** (the COO, on the approval): `## Measurements` and `## Roadmap entry` written into
  this index (D-14), the folder moved to `active/SKILLS/`, ROADMAP § SKILLS `Plans:` and
  `Status: planned`, the ledger line.
- **SKILLS-001**: the operator's word for the ticket. R1 in the main session on the COO tier of D-13;
  no Writer, no route state, no auditor (`review.docs` row 0). The worklist written, the closing
  greps re-run to their post-change counts (the ticket's Acceptance), VERIFY = the prose row once.
  One docs commit through its native dialog - the operator's click is the approval; no AI
  attribution line. The live copy refreshed (root `CLAUDE.md` § This repository is the plugin). No
  bump, no CHANGELOG block. The record `records/SKILLS-001.md` in its own docs commit.
- **SKILLS-002**: the operator's word for the ticket. The Writer, dispatched once with
  `Ticket: SKILLS-002` on its own line (Gate 2 silent: an active plan's ticket), the scope guard
  `HEAD <hash>` at the dispatch, the route state written. No review pass unless the operator gives
  the word for a Codex pass over its code at the ticket's start (D-01; overrides § Hard rules); no
  QA (no runtime surface). The COO writes the `CHANGELOG.md` block and `README.md:22` in the main
  session BEFORE the hand-back check, so they ride the one code commit (D-01, the `72ccbe8`
  precedent). At the hand-back the COO runs `validate-payload` once beside the full
  diff read. The ONE code commit is the Writer's, local, by explicit paths, through its native
  dialog, body `Refs: SKILLS-002`, no AI attribution line of any kind. Then the live copy refreshed
  and the self-install `/pnp:update --apply` on this repository with its embedded self-check
  (SKILLS-002 § Verify). The record commit (docs, its own dialog) carries the record, this index's
  rows closed, the ROADMAP § SKILLS marks and the CANDIDATES marks (SKILLS-002 § Scope, close
  duties), and the tracked file the self-install changed (`.claude/aiwf-native/aiwf.config.json`,
  `:4-5`). The plan archived at once (guard (e)).
- **The release**: the tag word and the push word are the operator's, separate, after 002's record
  commit - the tag created locally on the record commit and pushed with `main` in one push, CI not
  waited for (`dev/PROJECT_OVERRIDES.md:44-54`). Named here, not gates of a ticket.

## Procedures

- **The marker rule** (001). Every new sentence carries the literal marker phrase its worklist row
  names, ON ONE LINE - the text wraps around the marker, never inside it - so the row's acceptance
  grep can count it. A marker hit outside the files its row names is red.

## Closing greps

(run by the COO 2026-11-08 at HEAD b35693b over `skills/`, `docs/`, `templates/` unless a set says otherwise)
- Set 1 - the Step 1 three questions (D-10): grep `real inputs|what must stay|what retires` -> 2 hits, 1 file: `skills/plan/SKILL.md:79`, `skills/plan/SKILL.md:80`.
- Set 2 - the planner's continuity wording (D-09): grep `the same dispatch` -> 2 hits: `skills/plan/SKILL.md:175`, `skills/plan/SKILL.md:239`; grep `respawn|resume, do not` -> 0 hits.
- Set 3 - the QA brief's artifact list and its second copy (D-02, D-11): grep `Guaranteed artifacts` -> 1 hit: `skills/qa/SKILL.md:137`; grep `EVIDENCE \(read-only` -> 1 hit: `skills/qa/SKILL.md:189`; grep `JSON report` -> 15 hits: `skills/qa/SKILL.md:21, :125, :132, :138, :170, :192, :197, :223, :230`, `templates/agents/qa.md.tmpl:4, :46`, `templates/doctrine/review.md.tmpl:216`, `templates/doctrine/ticket.md.tmpl:199`, `docs/CODEX_REVIEW_QA_RECIPE.md:289, :293`; exempt (non-callers - they name the artifact, not its path): the four managed-template hits; the path lines are `skills/qa/SKILL.md:192` and `docs/CODEX_REVIEW_QA_RECIPE.md:293`.
- Set 4 - the green run's log line (D-02): grep `log path of the green|green E2E run` -> 2 hits: `templates/doctrine/work.md.tmpl:141` (managed, unchanged - the doctrine says "log path"; the copy is the skill's addition), `skills/review/SKILL.md:182`.
- Set 5 - the auto-mode sentence (D-03): grep `auto-approving|auto mode` -> 4 hits: `skills/update/SKILL.md:80`, `skills/roles/SKILL.md:102`, `templates/doctrine/ticket.md.tmpl:235`, `templates/doctrine/ticket.md.tmpl:239`; `skills/setup/SKILL.md` -> 0 hits (the gap D-03 fills; its Step 3 heading is `skills/setup/SKILL.md:106`).
- Set 6 - the brief-offered rule (D-04): grep `state is durable` -> 1 hit: `templates/doctrine/ticket.md.tmpl:305`; `skills/brief/SKILL.md` -> 0 hits (the gap D-04 fills; its Step 0 heading is `skills/brief/SKILL.md:17`).
- Set 7 - the pre-pass (D-05): grep `[Rr]unnability pre-pass|cannot run and why` -> 2 hits: `skills/plan/SKILL.md:185`, `skills/plan/SKILL.md:188`; over `scripts/` -> 0 hits.
- Set 8 - the version string (D-01): grep `0\.3\.16` over `README.md`, `CHANGELOG.md`, `.claude-plugin/`, `migrations/`, `docs/`, `skills/`, `templates/`, `scripts/` -> 8 hits: `CHANGELOG.md:7`, `README.md:22`, `.claude-plugin/plugin.json:3`, `migrations/index.json:42`, `migrations/0041_doctrine-wording/ops.json:3, :14`, `migrations/0041_doctrine-wording/NOTES.md:91, :108`; exempt: the four hits in the shipped migration 0041 (a shipped migration's files are history and are never rewritten - DOCSTAGE/D-07). The release writes `README.md:22`, `.claude-plugin/plugin.json:3`, a new `migrations/index.json` entry after line 42, a new CHANGELOG block above line 7.
- Set 9 - the red-run artifact (D-11): grep `\b(RED|red) run\b|e2e-red|e2e-report` -> 0 hits in the payload (a new artifact, no prior site).
- Set 10 - the approval report's COO tier per ticket (D-15): grep `declared ticket count and its reason|COO tier of each ticket` -> 1 hit: `skills/plan/SKILL.md:252`.

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 210,000 (approval 310,000 - start 100,000) | 476,594 |

- start: 100,000 - `file` (`~/.claude/ctx/<session>.pct` 10, `.size` 1,000,000, at Step 1)
- approval: 310,000 - `file` (the same files at the approval word, `.pct` 31)
- research agent A (the skills' text, Sonnet): 81,143 - `notification`
- research agent B (the evidence and the doctrine, Sonnet): 88,077 - `notification`
- planner (writer type, Opus; three handoffs - the plan, revision 1 with the planner's questions, D-15 - cumulative as the last notification printed it): 161,055 - `notification`
- runnability pre-pass (Sonnet): 45,805 - `notification`
- readiness pass 1 (Codex gpt-6-sol, xhigh, cold): 100,514 - `round header` (`readiness/SKILLS/round-1.md`)

## Roadmap entry

- Goal: every skill says what the doctrine already decided - the QA trace mode, the report copy, the auto-mode refusal, the brief rule
- Why: four decided rules have no sentence in the skill that executes them
