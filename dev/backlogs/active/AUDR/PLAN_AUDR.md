# PLAN AUDR - the auditor's rules: a blocker names a loss (release 0.3.25)
Tickets: 1 - one release: the five parts, the migration, the manifest entry and the bump ship as one piece with one code commit (D-01)

## Goal

One PromptAndPray release, 0.3.25, of the five parts the operator decided (ROADMAP § AUDITRULE line (11),
`dev/changes/opus-experiment-2026-11-23.md` § 9): a blocker names a loss at both audits (D-03); the plan does not
restate the verification procedure (D-04); plan-form duties scale with the change (D-05); two fixed-form measurement
rows, one per plan at its landing and one per ticket at its close, with no question to the operator (D-06); a
PRODUCT STAGE slot beside `TEST POLICY:` (D-07) - shipped with migration `0050_audit-loss`, its manifest entry and the
version bump (D-08), as one ticket and one code commit (D-01). The approved rule texts of D-03 .. D-07 enter the tree
verbatim, after the both-ways check of D-09 (`dev/backlogs/readiness/AUDR/both-ways-check.md`).

## Scope

In:
- the payload sites of D-03 .. D-07 named in AUDR-001's worklist (`templates/doctrine/review.md.tmpl`,
  `templates/doctrine/plan.md.tmpl`, `templates/doctrine/ticket.md.tmpl`, `templates/briefs/{readiness-codex,planner,record,research}.md`,
  `templates/PROJECT_OVERRIDES.md.tmpl`, `templates/agents/reviewer.md.tmpl`, `skills/review/SKILL.md`,
  `skills/plan/SKILL.md`, `docs/READINESS_CLASSES.md`);
- the release mechanics of D-08: `migrations/0050_audit-loss/`, `migrations/index.json`, `.claude-plugin/plugin.json`;
- the COO's prose of D-01 in the same code commit: the `CHANGELOG.md` 0.3.25 block and the `README.md` version line.
  Its `Retires local rules:` line (D-08 as amended, readiness round 1, B6): the consumer's `plan.md` product-stage
  pointer retires, its `review.md` pointer is narrowed to QA - the names read by the COO from the consumer's stage
  files at the time of writing.

Out (DECISIONS § Deferred and § The three questions "what must stay"):
- QA's brief gets no PRODUCT STAGE line; the evaluation of the measurement rows (an arbiter session); the planner's
  "a test is an enumerated matrix"; this repository's own § Product stage in `dev/PROJECT_OVERRIDES.md`;
- the floor (`templates/doctrine/review.md.tmpl:65-67`), the dual of § Test findings on confirmed code (`:236-237`),
  the red-proof rule (`:201-213`), the readiness effort and pass count, every money / access / tenancy check -
  unchanged;
- `skills/qa/SKILL.md` - no line changes; QA's material blocker stays as it is
  (D-07, § 9 names the two audits);
- the update engine's apply window against a session beside it - deferred to the next plan (readiness round 2, B7);
- the `dev/PROJECT_OVERRIDES.md` § Environment "COO context source" line - corrected by the COO (R1, `dev/`) at
  AUDR-001's close (DECISIONS § Deferred).

## Tickets

| ref | title | implements | status | record |
|---|---|---|---|---|
| AUDR-001 | The five parts, migration 0050, manifest entry and bump to 0.3.25 | D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08 | open | - |

Order and gates (one ticket, in order):

1. Landing - the COO, on the operator's approval word: the folder moves to `dev/backlogs/active/AUDR/` and is committed
   through its own commit dialog.
2. AUDR-001 starts on the operator's own word for the ticket; the Writer dispatch carries `Ticket: AUDR-001` (Gate 2
   off-plan: silent for a ticket of an active plan). Route R2 (D-01): the Writer writes every payload file.
3. At the Writer's handoff the COO writes the `CHANGELOG.md` block and the `README.md` version line (D-01, D-08), then
   runs the ticket's VERIFY rows once, in parallel with the diff read (`dev/PROJECT_OVERRIDES.md` § Test policy).
4. One code audit on the `review.code` row (Codex): pass 1 rides the ticket's word; its brief adds D-02's one question -
   where the new blocker text, read against the case list of D-09, would still let a no-loss finding block or let a loss
   through as a note. No separate opinion pass (D-02). A pass beyond the first takes its own word. No QA: the ticket
   has no observable runtime or UI behaviour (`E2E: no`).
5. The code commit - the Writer, by explicit paths, body `Refs: AUDR-001`, no attribution lines; the operator's commit
   dialog.
6. The live-copy refresh (root `CLAUDE.md` § This repository is the plugin), then the self-install
   `/pnp:update --apply` on this repository with its embedded self-check (D-08). After the apply the COO greps each
   re-rendered stage file for one marker its own template adds - `.claude/aiwf-native/doctrine/review.md`
   `## A blocker names a loss`, `.claude/aiwf-native/doctrine/plan.md` `with no revision counted`,
   `.claude/aiwf-native/doctrine/ticket.md` `**A note opens no correction round**` - a count of 0 is broken (readiness
   round 1, B10). The re-rendered files and `.claude/aiwf-native/aiwf.config.json` go through the COO's own commit
   dialog (B8). Before the tag:
   `rg -n '\x22installedPluginVersion\x22: \x220.3.25\x22|\x22lastMigrationApplied\x22: \x220050_audit-loss\x22' .claude/aiwf-native/aiwf.config.json`
   - fewer than 2 lines is broken (PowerShell 7, `pwsh`).
7. The record `records/AUDR-001.md` on the skeleton as released - its `pnp-measure` ticket row (D-06) - and the close
   duty of DECISIONS § Deferred; the docs commit dialog.
8. The tag `v0.3.25` created locally on the record commit and pushed with `main` in one push: the tag word and the push
   word, one dialog (`dev/PROJECT_OVERRIDES.md` § Hard rules, Release discipline).

D-09 (the both-ways check of D-03's text) ran during this planning, before the operator approved the texts; its result
is `dev/backlogs/readiness/AUDR/both-ways-check.md`, and the texts the ticket copies are DECISIONS.md as approved.

## Closing greps

(run from the repo root over `docs skills templates scripts schema hooks examples`; `migrations/` and `CHANGELOG.md` are history and exempt; hit counts as the Grep tool printed them on 2026-11-24 at HEAD 3c13a90)
- S1 the plan-readiness blocker definition - `required property|land wrong` - 4 hits + 1 exempt: `skills/review/SKILL.md:332`, `templates/briefs/readiness-codex.md:36`, `templates/briefs/readiness-codex.md:43`, `templates/doctrine/review.md.tmpl:41`; exempt `scripts/setup/validate-config.mjs:194` (a config-validator error string, not a caller).
- S2 the code-pass blocker - `A material blocker is` - 1 hit: `templates/doctrine/review.md.tmpl:283` (and the verdict lines `templates/doctrine/review.md.tmpl:301-311` beside it).
- S3 the measurement - `COO session at close|context size|approval number|start number|ask the operator once|Temporary|## Measurements` - hits: `skills/plan/SKILL.md:69`, `:72`, `:73`, `:271`, `:272`, `:276`, `:277`, `:284`; `templates/briefs/planner.md:45`; `templates/briefs/record.md:68`, `:70`, `:77`; `templates/doctrine/ticket.md.tmpl:338`.
- S4 the TEST POLICY slot, beside which PRODUCT STAGE goes - `TEST POLICY` - 6 hits: `skills/review/SKILL.md:190`, `:214`; `templates/briefs/readiness-codex.md:29`; `templates/doctrine/plan.md.tmpl:103`; `templates/doctrine/review.md.tmpl:60`, `:69`. The planner brief carries none today (`templates/briefs/planner.md:1-23`). `PRODUCT STAGE|Product stage` - 0 hits.
- S5 the procedure restated - `Acceptance is literal|literal and can fail` - 3 hits: `templates/briefs/planner.md:61` (and its "procedures and tables move to the index", `templates/briefs/planner.md:64-65`, line-broken), `templates/doctrine/plan.md.tmpl:158`; exempt `templates/doctrine/ticket.md.tmpl:103` (the COO's ticket-brief precision rule, not the plan's; its "enumerated matrix" is deferred - DECISIONS § Deferred).
- S6 the triage dispositions, which gain `note` - `fixed` / `rejected` lists, literal pattern ``fixed` / `rejected|fixed / rejected`` (landed with revision 1, readiness round 1, I1; the Grep tool printed 3 hits) - 3 hits: `skills/plan/SKILL.md:249`, `skills/review/SKILL.md:343`, `templates/doctrine/plan.md.tmpl:111`.
- S7 the transactional read, which scales - `transaction, a lock` - 2 hits: `templates/briefs/readiness-codex.md:15`, `templates/briefs/research.md:11`; plus class rows `docs/READINESS_CLASSES.md:27` (8), `:30` (11), `:34` (15).
- S8 the release version (landed with revision 1, readiness round 1, I2) - `0\.3\.24` over `README.md .claude-plugin migrations/index.json` - 4 hits: `.claude-plugin/plugin.json:3` (moves: AUDR-001 W25); `README.md:22` (moves: the COO's prose, D-01); `migrations/index.json:50` (stays: the 0049 entry; W24 appends the 0050 entry after it); `README.md:121` (stays: "green as of 0.3.24", a history statement in the COO's prose).
- S9 the readers of the NOTED status and the notes-only handoff (landed with revision 2, readiness round 2, I4) - `CLOSED if|OPEN with evidence|CLOSED. or .OPEN` over `templates skills docs` - 1 hit: `templates/briefs/readiness-codex.md:23` (moves: AUDR-001 W28). Not matched because line-broken: `templates/agents/reviewer.md.tmpl:98-99` "`CLOSED` or / `OPEN`" (moves: W29); the planner's handoff reader is the revision slot `templates/briefs/planner.md:21-22` (moves: W27).

## Measurements

| idea -> approved plan | cycle spend |
|---|---|
| 210,000 | 960,844 |

Written under the `/pnp:plan` skill in force (0.3.24), the table this plan's own D-06 retires.
- COO context at Step 1: 120,000 (12 % of 1,000,000) - file `~/.claude/ctx/<session>.pct` / `.size`
- COO context at the approval: 330,000 (33 % of 1,000,000) - file, same
- research agent, audit side (sonnet): 103,759 - notification
- research agent, planner / record / config side (sonnet): 82,389 - notification
- both-ways check of D-03 (opus): 169,230 - notification
- planner (writer type, the Writer's pin; first handoff, the COO's answers, revisions 1 and 2): 174,618 - notification (the last
  of four; the figures grew 121,778 / 128,588 / 159,198 / 174,618, read as cumulative over the resumed agent)
- runnability pre-pass (sonnet): 75,064 - notification
- readiness passes 1 and 2 (Codex gpt-6.2-sol xhigh, one session, pass 2 resumed): 355,784 - round header of `round-2.md`,
  cumulative over the session (pass 1 alone: 182,948, `round-1.md`)

## Roadmap entry

- Goal: every rule an auditor blocks on is seen catching real defects, is measured on a routine, and leaves or narrows when it stops paying
- Why: the red-proof casus of 2026-11-21 - on Silerax's last 17 plans, 12 of 32 code-pass blockers named no defect, only a missing red record (the arbiter session's count, not re-counted here); the rule was narrowed in 0.3.20; the order below is the arbiter's, on the operator's delegation „ти кои препоръчваш ... ПНП е писан от АИ за АИ"
