# DOCTR-001 [R1 prose] - every sentence of the decisions in the templates, the docs and the skills

Implements: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12, D-13, D-14, D-15, D-16, D-17, D-18, D-19, D-20, D-21, D-22, D-23, D-25, D-26, D-27.
COO: Opus - because all four no.
Escalation: none - no decision here reverses a plan-recorded one (D-03 closes RBB's deferral and reads SEEDFS/D-14 as it stands; D-26 and D-27 are the operator's 2026-11-08 dialog answers), no access-policy or security surface is written, the blast radius stops at the payload text until 002 ships it, and no two roles disagree in writing.
Branch: `main`. Depends on: the plan landed (`dev/` only). Scope guard: `HEAD <hash>` = `git rev-parse HEAD` at the ticket's start, written into the record (R1: no dispatch, no route state).

## Outcome

Every sentence D-03, D-04, D-06..D-17, D-19..D-23 and D-26 decide stands once at its home heading
(rows P03-P26 below), each carrying its marker phrase on one line (index § Procedures, the marker
rule); every consumer the closing greps name moves with its sentence; the closing greps return their
post-change counts; the templates render (index § Procedures, render dry-run); the rendered copies
under `.claude/` are untouched (D-01) - 002 re-renders them. D-02 and D-27 close without a change.
The payload carries no operator quote in the operator's language: the quotes stay in DECISIONS.

## Scope

The worklist, every anchor at HEAD `58fa73b` (re-read at the guard HEAD). No heading changes except
the R3 heading of P03 (`rg -n "R3 - critical" templates docs skills` hits only
`templates/doctrine/work.md.tmpl:59`, `:109` - no pointer reads the heading). Each row: file:line,
home heading, what lands (the decision's text is its `D-NN`, not restated here), marker, consumers.

| row | file:line - home | what lands | marker (one line) | consumers that move |
|---|---|---|---|---|
| P03 | `templates/doctrine/work.md.tmpl:59` § Routes, the R3 heading; `:76` § COO routing check 1; `:109` § Routing mapped to native, the R3 row | D-03: "migrations" -> "schema or data migrations of the product's persistent store" at the three sites; one sentence under the R3 heading (between `:64` and `:66`): a payload migration of a plugin is data applied by a tested engine and routes by its diff (SEEDFS/D-14) | `product's persistent store` (3); `routes by its diff` (1) | none - `templates/CLAUDE.md.tmpl:57` carries no such word and stays (D-03) |
| P04 | `templates/doctrine/plan.md.tmpl:124-127` § Plan readiness review, "Pass economy" | D-04: the trigger sentence; plus its dual, a sentence of its own whose marker stands on a line apart from the trigger's | `reverses a decision the operator made` (5, with the consumers); `reverses a COO decision is a revision, never a second pass` (1) | `skills/plan/SKILL.md:242-244` Step 6; `skills/review/SKILL.md:323-325`; `skills/roles/SKILL.md:133-134`; `templates/PROJECT_OVERRIDES.md.tmpl:174-176` (a seed - 002's note tells installed copies); `docs/OPERATOR_PROTOCOL.md:113-114` "for a reversed decision" -> "for a reversed operator decision". NOT `skills/roles/SKILL.md:118` (002, with its producer), NOT `templates/doctrine/review.md.tmpl:34` (a pointer), NOT `templates/ORCHESTRATOR.md.tmpl:108` (trigger 1) |
| P06 | `templates/ORCHESTRATOR.md.tmpl:421-424` § Verifying failure claims, "VERIFY honesty" | D-06: the baseline sentence extended in place - the discovery scan records the baseline-red tests by name for every file in the ticket's verify line, the brief carries that set, "stays green" is never inherited; a repo-kept known-failing list is a project's choice named in its overrides document | `expected red set` (3, with the consumers) | `templates/doctrine/ticket.md.tmpl:37` the `Verify` field gains "; the expected red set by test name"; `templates/briefs/writer-dispatch.md` a new line after `:4`: `Expected red set: <the baseline-red tests by name of every file in the verify line, or none>` |
| P07 | `templates/doctrine/ticket.md.tmpl:31-40` § Ticket brief contract (R2/R3), the field block, and `:45` | D-07: a field line after `Working branch` (`:39`), so the first six names stay the six headings (`:42-43`); after `:45` one sentence: every R2/R3 brief carries the form, the countable form of "a brief declares observable runtime/UI behavior" (`ticket.md.tmpl:181`, `review.md.tmpl:211` read it, unchanged) | `E2E: yes \| no - because <reason>` (1, `-F`) | none |
| P08 | `templates/ORCHESTRATOR.md.tmpl:465-467` § Branch policy, the two-trees sentence | D-08: the default appended | `own project root is the tree` (1) | none |
| P09 | `templates/ORCHESTRATOR.md.tmpl:356-357` § Operator-interaction guards, guard (b) | D-09: one sentence after "without asking again"; no quote in the operator's language | `takes a step themselves` (1) | none; the count "Eight rules." (`:346`) stays |
| P10 | `templates/ORCHESTRATOR.md.tmpl:337-340` § How the COO speaks to the operator, rule 7 | D-10: rule 7 extended - unrequired agent, check or pass written into the ticket with scope and cost before it is spent; its dual named (the discovery scan, the closing grep, the fact-check gate, a retry of a dead scan ride the ticket's word - as `:310` already says for the retry) | `the doctrine does not require` (1) | none |
| P11 | `templates/doctrine/ticket.md.tmpl:31-40` the field block, and the sentence of P07 | D-11: a field line `Escalation` after the `E2E` line; one sentence: one line per ticket, read over the concrete decisions at the brief against `ORCHESTRATOR.md` § Escalation's four triggers | `Escalation: none \| trigger <N> - <why>` (3, `-F`, with the consumers) | `templates/doctrine/work.md.tmpl:84-87` the plan ticket header carries the line beside `COO:`, pointing at `ticket.md` § Ticket brief contract (R2/R3); `templates/briefs/planner.md:54-55` "Under the title of each ticket" gains it |
| P12 | `templates/README.md:25-33`, the paragraph "The doctrine lives in templates" | D-12: one sentence | `names the property it checks` (1) | none |
| P13 | `templates/ORCHESTRATOR.md.tmpl:297-303` § The operator does not arbitrate engineering decisions, after the product-dialog sentence | D-13: the STOP class | `the user sees less than before` (1) | none |
| P14 | `skills/plan/SKILL.md:84-85` Step 1; `templates/doctrine/ticket.md.tmpl:354-359` § Durable development history, "An entry may be an area" | D-14: an entry and a finding line carry the problem, its evidence, the operator's words and the scope; no quote in the operator's language | `never how it is fixed` (2) | `templates/ROADMAP.md.tmpl:19` `„<quote>"` -> `"<quote>"` (the skill's form, `skills/plan/SKILL.md:95`) |
| P15 | `docs/READINESS_CLASSES.md:3-8` header prose; the table after `:32` | D-15: rows 17 and 18; the header says what the seventeenth and the eighteenth are (measured on consumer plans after a pass) and the count | `eighteenth` (1); table rows `\| 17 \|`, `\| 18 \|` | none - `plan.md.tmpl:121`, `:150-151`, `review.md.tmpl:38` cite classes 15 and 16 by number, unchanged |
| P16 | `templates/ORCHESTRATOR.md.tmpl:242-244` § COO owns broad scans, "Discovery precedes dispatch" | D-16: appended to the exempt-list sentence | `a caller is never exempt` (1) | none |
| P17 | `templates/doctrine/ticket.md.tmpl:115-117` § The COO write boundary runs along artifact class, not size | D-17: the live-Writer sentence names the mechanics | `SendMessage` (1 over set 3's paths) | none |
| P19 | `templates/doctrine/ticket.md.tmpl:339-362` § Durable development history, the archive paragraph and the roadmap writes | D-19: the parent line closes with its last child; the archiving checks every child line of the plan's entry; one by one, never as a sweep | `closes with its last child` (1); `never as a sweep` (1) | none |
| P20 | `templates/ORCHESTRATOR.md.tmpl:341-342` § How the COO speaks to the operator, a rule 9 after rule 8; `:138-142` § The operator-channel filter, item 2 | D-20: rule 9; its dual in item 2 | `AskUserQuestion` (1 over set 3's paths); `an operator's own question is answered` (1) | `skills/plan/SKILL.md:132-134` Step 3: the parenthesis "(one dialog, up to four points, each with its consequence)" becomes a pointer to `ORCHESTRATOR.md` § How the COO speaks to the operator, rule 9 - no tool name there |
| P21 | `templates/doctrine/ticket.md.tmpl:89-93` § Ticket brief contract (R2/R3), the language paragraph | D-21: the CHANGELOG's language and the untranslated quotes | `## Changelog format` (2, `-F`, with the consumer); `never translated` (1) | `templates/agents/writer.md.tmpl:68-70` § Operating rules, the Writer lines of the brief contract: "everything you write into the tree is English" gains the same CHANGELOG clause (the Writer writes the release's block; 002 re-renders `.claude/agents/writer.md`). The interview question is ROADMAP § SETUP's |
| P22 | `templates/doctrine/ticket.md.tmpl:322-324` § Durable development history, item 4 | D-22: the waiver in words, quoted in the record, the outcome marked as not seen | `not seen by the operator` (3, with the consumers) | `templates/briefs/record.md:55-56` the closing-checklist line; `templates/memory-seeds/closeout-needs-a-live-pass.md:4-8` |
| P23 | `templates/doctrine/work.md.tmpl:93-95` § COO routing, "The dynamic clause" | D-23: one sentence after it | `after the discovery scan` (1) | none |
| P26 | `templates/doctrine/work.md.tmpl:123-128` § Tests | D-26: the rule - for `E2E: yes` the COO runs `verify.e2e.runner` over the Writer's spec at the handoff, before `/pnp:review`; a red spec goes to the live Writer as a micro-round (P17); the review brief carries the green E2E run's log path as evidence; dual: `E2E: no` keeps the order | the phrase "at the handoff, before" followed by the backticked `/pnp:review` (3, with the consumers - the literal command is Acceptance, Set 6); route lines: `E2E run` before `/pnp:review` on the same line (7); `green E2E run` (2: this sentence and the review brief) | the route lines `templates/doctrine/work.md.tmpl:39`, `:61-62`, `:108`, `:109`; `templates/CLAUDE.md.tmpl:55-56` (inside `aiwf-core`, `:1-123`); `skills/qal/SKILL.md:183`; `skills/work/SKILL.md:85`; the E2E flow `templates/doctrine/ticket.md.tmpl:183-186`; `skills/qa/SKILL.md:17-20` and Step 2 `:106-112` - QA judges that run's artifacts and runs the suite again only after a correction round, scoped as `:108-110` already says; `skills/review/SKILL.md:178-181` the EVIDENCE PACK slot of the review brief: for `E2E: yes` it names the green E2E run's log path (not a route-order line - set 6 stays seven lines) |

Close duties (in the record `records/DOCTR-001.md`, no text change in the payload):

- D-02: ROADMAP § DOCTR item 9's line marked `done` with the pointer "no hit; the live form is
  non-durable R2" (RESEARCH 9); F24's line is already `done`.
- D-27: the lines of items 24 and 25 closed as declined, with the operator's dialog answers.
- D-07: the "eight rules" line gains the verdict - C-067 homed by P07, C-045 and C-071 project-only.
- D-05: ROADMAP § DOCTR item 5's line (`dev/backlogs/ROADMAP.md:128`) moves to ROADMAP § CODEX; the
  DOCTR line closes with that pointer.
- D-18: the lines of items 18 and 19 (`dev/backlogs/ROADMAP.md:144`, `:145`) move to a new roadmap
  entry `RMAP - the roadmap's places` (`Status: idea`, born of the operator's words D-18 quotes); the
  DOCTR lines close with that pointer.
- The lines whose sentence this ticket wrote are marked at 002's record commit, with the release
  (D-01; index § Order and gates).

## Acceptance

The commands run in PowerShell - this project's channel (`os: windows`) - from the repository root,
as written, after the docs commit; `<guard>` is replaced by the literal hash in the record. A pattern
that carries a quote, a backtick or a non-ASCII character is single-quoted. The output after the
dash means broken. A marker count is lines, so each marker sits on one line.

- `git diff --name-only <guard> HEAD` - a path outside the Code Map below, or any path under
  `.claude/`, `templates/agents/reviewer.md.tmpl`, `templates/agents/qa.md.tmpl`,
  `templates/doctrine/review.md.tmpl`, `templates/AGENTS.md.tmpl`.
- `git diff --name-only <guard> HEAD -- templates/ORCHESTRATOR.md.tmpl templates/doctrine templates/CLAUDE.md.tmpl templates/agents templates/AGENTS.md.tmpl`
  - anything but exactly these six: `templates/ORCHESTRATOR.md.tmpl`,
  `templates/doctrine/work.md.tmpl`, `templates/doctrine/ticket.md.tmpl`,
  `templates/doctrine/plan.md.tmpl`, `templates/CLAUDE.md.tmpl`, `templates/agents/writer.md.tmpl`
  (002's op list is this list).
- `git diff <guard> HEAD -- templates/agents/writer.md.tmpl` - a changed line outside `:68-70`.
- `git diff <guard> HEAD -- templates/CLAUDE.md.tmpl` - a changed line other than the R2 route
  line `:55-56` (everything below `<!-- END aiwf-core -->` `:123` is the operator zone's seed and stays).
- Set 1: `rg -n "reverses" templates docs skills` - a count other than 7 (`templates/ORCHESTRATOR.md.tmpl`
  trigger 1, the five trigger lines, the one dual line); `rg -n "reverses a decision the operator made" templates docs skills`
  - a count other than 5 (`templates/doctrine/plan.md.tmpl`, `skills/plan/SKILL.md`,
  `skills/review/SKILL.md`, `skills/roles/SKILL.md`, `templates/PROJECT_OVERRIDES.md.tmpl`);
  `rg -n "reverses a recorded decision" templates docs skills` - any hit; `rg -n "a reversed decision" templates docs skills`
  - a hit other than `skills/roles/SKILL.md:118` (002's); `rg -n "a reversed operator decision" docs/OPERATOR_PROTOCOL.md`
  - no hit; `rg -n "reverses a COO decision is a revision, never a second pass" templates docs skills`
  - a count other than 1 (`templates/doctrine/plan.md.tmpl`).
- Set 2: `rg -n "[Mm]igrations? / access[- ]policy" templates docs skills` - any hit;
  `rg -n "product's persistent store" templates/doctrine/work.md.tmpl` - a count other than 3;
  `rg -n "routes by its diff" templates docs skills` - a count other than 1.
- Set 3: `rg -n "unplanned R2|AskUserQuestion|SendMessage" templates docs skills scripts hooks schema`
  - anything but exactly 2 hits: `AskUserQuestion` in `templates/ORCHESTRATOR.md.tmpl` (rule 9) and
  `SendMessage` in `templates/doctrine/ticket.md.tmpl` (P17).
- Set 4: `rg -n "offline proof never replaces" templates docs skills` - any hit;
  `rg -n "not seen by the operator" templates docs skills` - a count other than 3
  (`templates/doctrine/ticket.md.tmpl`, `templates/briefs/record.md`,
  `templates/memory-seeds/closeout-needs-a-live-pass.md`).
- Set 5, each still one home: `rg -n "dialog or a word" templates docs skills`,
  `rg -n "live\*\* Writer" templates docs skills`, `rg -n "settles which tree" templates docs skills`,
  `rg -n "zero new failures by name" templates docs skills`, `rg -n "sixteenth" docs` - any count
  other than 1; `rg -n "exempt" templates docs skills` - a hit outside `templates/ORCHESTRATOR.md.tmpl`'s
  discovery paragraph and guard (g).
- Set 6: `rg -n "E2E run\b.*/pnp:review" templates docs skills` - a count other than 7 (the set's
  seven lines: four in `templates/doctrine/work.md.tmpl`, one each in `templates/CLAUDE.md.tmpl`,
  `skills/qal/SKILL.md`, `skills/work/SKILL.md`); `rg -n 'at the handoff, before ./pnp:review' templates docs skills` (the `.` stands for the backtick)
  - a count other than 3 (`templates/doctrine/work.md.tmpl`, `templates/doctrine/ticket.md.tmpl`,
  `skills/qa/SKILL.md`).
- The single-row markers, each `rg -n "<marker>" templates docs skills` - a count other than 1:
  `routes by its diff`, `own project root is the tree`, `takes a step themselves`,
  `the doctrine does not require`, `names the property it checks`, `the user sees less than before`,
  `eighteenth`, `a caller is never exempt`, `closes with its last child`, `never as a sweep`,
  `an operator's own question is answered`, `never translated`, `after the discovery scan`;
  `rg -n -F "## Changelog format" templates/doctrine/ticket.md.tmpl templates/agents/writer.md.tmpl`
  - a count other than 2, one per file.
- `rg -n "green E2E run" templates docs skills` - a count other than 2
  (`templates/doctrine/work.md.tmpl`, `skills/review/SKILL.md`).
- `rg -n "expected red set" templates docs skills` - a count other than 3
  (`templates/ORCHESTRATOR.md.tmpl`, `templates/doctrine/ticket.md.tmpl`,
  `templates/briefs/writer-dispatch.md`).
- `rg -n -F "E2E: yes | no - because <reason>" templates docs skills` - a count other than 1
  (`templates/doctrine/ticket.md.tmpl`); `rg -n -F "Escalation: none | trigger <N> - <why>" templates docs skills`
  - a count other than 3 (`templates/doctrine/ticket.md.tmpl`, `templates/doctrine/work.md.tmpl`,
  `templates/briefs/planner.md`).
- `rg -n "never how it is fixed" templates docs skills` - a count other than 2
  (`skills/plan/SKILL.md`, `templates/doctrine/ticket.md.tmpl`); `rg -n -F '„' templates/ROADMAP.md.tmpl` - any hit.
- `rg -n "^\| 1[78] \|" docs/READINESS_CLASSES.md` - a count other than 2.
- `rg -n "Eight rules\." templates/ORCHESTRATOR.md.tmpl` - a count other than 1.
- The render dry-run (index § Procedures) - any red condition there.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
  - any hit.

## Risk threshold

Blocks: a marker count off its row; a decision's sentence restated in a second stage template or
doc instead of pointed at; a consumer of the closing greps left in its old wording; a word of the
operator's language, an origin-project name or an absolute path in the payload; a heading changed
other than P03's R3 heading; a rendered copy under `.claude/` edited; a file of 002's
(`skills/roles/SKILL.md:118`, `scripts/`, `migrations/`, `.claude-plugin/`, `CHANGELOG.md`,
`README.md`) touched; `templates/agents/reviewer.md.tmpl`, `templates/agents/qa.md.tmpl`,
`templates/AGENTS.md.tmpl` or `templates/doctrine/review.md.tmpl` changed (002 would ship no op for
it); `templates/agents/writer.md.tmpl` changed beyond P21's clause; a template that no longer
renders; a sentence that changes another rule's meaning beyond its decision. Notes: line wrapping,
sentence order inside a paragraph, a rule number in a pointer.

## Stop condition

Stop and ask before writing when: a sentence cannot stand at its anchor without rewording a
neighbouring rule (that is a new decision); a decision reads wrong against the text it lands in; a
file outside the Code Map must change; a closing grep hits a consumer this worklist does not name.
Stop after the docs commit and the record; 002 is the next ticket's word.

## Verify

The prose row (`dev/PROJECT_OVERRIDES.md` § Test policy, "VERIFY is proportional to the change"),
once: the provenance grep, `node scripts/update/validate-payload.mjs --plugin-root .` (cwd `.`), plus
the render dry-run (index § Procedures). No suite runs: no script reads the changed prose
(`scripts/selfcheck/aiwf-selfcheck.js:10589-10592`; the door paragraphs `:8509-8538` and the
`ROADMAP.md.tmpl` entry keys `scripts/setup/test-setup.mjs:1987-1989` are kept by the rows above);
002's `setup-suite` runs the render pins `scripts/setup/test-setup.mjs:292-304`. Logs and the
dry-run script outside the repository.

## Code Map

| path | role |
|---|---|
| `templates/ORCHESTRATOR.md.tmpl` | P06, P08, P09, P10, P13, P16, P20 |
| `templates/doctrine/work.md.tmpl` | P03, P11, P23, P26 |
| `templates/doctrine/ticket.md.tmpl` | P06, P07, P11, P14, P17, P19, P21, P22, P26 |
| `templates/doctrine/plan.md.tmpl` | P04 |
| `templates/CLAUDE.md.tmpl` | P26 (the `aiwf-core` route line `:55-56` only) |
| `templates/agents/writer.md.tmpl` | P21 (`:68-70` only) |
| `templates/README.md` | P12 |
| `templates/ROADMAP.md.tmpl` | P14 (`:19`, a seed) |
| `templates/PROJECT_OVERRIDES.md.tmpl` | P04 (`:174-176`, a seed) |
| `templates/briefs/writer-dispatch.md` | P06 |
| `templates/briefs/record.md` | P22 |
| `templates/briefs/planner.md` | P11 |
| `templates/memory-seeds/closeout-needs-a-live-pass.md` | P22 |
| `docs/READINESS_CLASSES.md` | P15 |
| `docs/OPERATOR_PROTOCOL.md` | P04 (`:113-114`) |
| `skills/plan/SKILL.md` | P04, P14, P20 |
| `skills/review/SKILL.md` | P04, P26 (`:178-181`) |
| `skills/roles/SKILL.md` | P04 (`:133-134` only; `:118` is 002's) |
| `skills/qa/SKILL.md` | P26 |
| `skills/qal/SKILL.md` | P26 |
| `skills/work/SKILL.md` | P26 |
| `scripts/setup/generate.mjs` | render dry-run imports (`:269`, `:372`, `:593`), read only |
| `dev/backlogs` | the record `active/DOCTR/records/DOCTR-001.md` and the close duties on `ROADMAP.md` |
