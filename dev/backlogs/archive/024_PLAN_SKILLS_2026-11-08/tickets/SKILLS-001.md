# SKILLS-001 [R1 prose] - every sentence of D-02..D-05, D-09..D-11 in the skills, the Writer brief template and the two recipes

Implements: D-01, D-02, D-03, D-04, D-05, D-09, D-10, D-11, D-13, D-15.
COO: Opus - because all four no.
Escalation: none - no recorded decision is reversed (D-08 keeps rule 9), no access surface is written, the blast radius stops at the payload text until 002 ships it, and no two roles disagree in writing (D-13).
Branch: `main`. Depends on: the plan landed (`dev/` only). Scope guard: `HEAD <hash>` = `git rev-parse HEAD` at the ticket's start, written into the record (R1: no dispatch, no route state).

## Outcome

Every sentence D-02, D-03, D-04, D-05, D-09, D-10, D-11 and D-15 decide stands at its home in the skill,
the Writer brief template or the recipe the row names (rows P02-P12 below), each carrying its marker
phrase on one line (index § Procedures, the marker rule); the closing greps return their
post-change counts (Acceptance); no managed template and no rendered copy under `.claude/` changes
(D-01). The payload carries no operator quote in the operator's language: the quotes stay in
DECISIONS.

## Scope

The worklist, every anchor at HEAD `b35693b` (re-read at the guard HEAD). One heading is added
(P04's `## Step 0.5`, the precedent `skills/plan/SKILL.md:55`, so Steps 1-3 of `/pnp:brief` keep
their numbers); no heading is renamed; no `## Step 0` section of any skill changes (the self-check
pins its strings, `scripts/selfcheck/aiwf-selfcheck.js:8298-8323`). Each row: file:line and home,
what lands (the decision's text is its `D-NN`, not restated here), marker, consumers.

| row | file:line - home | what lands | marker (one line) | consumers that move |
|---|---|---|---|---|
| P02 | `skills/qa/SKILL.md:124-127` Step 2, after the config-reporter paragraph | D-02: the copy rule - whoever ran the suite (the COO at the handoff, `:18-20`; this step after a scoped re-run, `:109-113`) copies the JSON report right after the run, before anything else, to `<scratchDir>/<REF>-e2e-report-<N>.json`, `<N>` the run's number in the ticket, 1 for the handoff run; and one clause in the same sentence: `outputDir` is neither deleted nor run over again before that copy stands (the second half of `dev/backlogs/CANDIDATES.md:569-570`, so the row closes whole) | `-e2e-report-<N>.json` (1); `before that copy stands` (1) | `skills/qa/SKILL.md:192` Step 3, the brief's `JSON report:` line names the copy's absolute path (marker `e2e-report-`); `skills/review/SKILL.md:181-182` the EVIDENCE PACK slot names the copy beside the green run's log, `green E2E run` kept on one line (marker `e2e-report-`); `docs/CODEX_REVIEW_QA_RECIPE.md:293` the prompt's `JSON report: <path>` names the copy (marker `e2e-report-`). NOT the managed hits of Set 3 (`templates/agents/qa.md.tmpl:4, :46`, `templates/doctrine/review.md.tmpl:216`, `templates/doctrine/ticket.md.tmpl:199` - they name the artifact, not its path); NOT `templates/briefs/record.md:40-43` (its Scratch section already asks what evidence moved out of the scratch directory and where - the close duty reads it as it stands) |
| P03 | `skills/setup/SKILL.md:106-129` Step 3, a paragraph after `:129`, before `## Step 4` (`:131`) | D-03: the sentence of `skills/update/SKILL.md:80-82`, worded for the generate - one sentence | `auto-approving permission mode` (1 in this file) | none - `skills/update/SKILL.md:80-82` and `skills/roles/SKILL.md:102` stay (D-03) |
| P04 | `skills/brief/SKILL.md:30-32`, a new `## Step 0.5 - When no brief is composed` after the Notation line `:30`, before `## Step 1` (`:32`) | D-04: the rule of `templates/doctrine/ticket.md.tmpl:305-307` in the skill's words - when the state is durable (the record, the memory and the transfer surface complete) no brief, "new session, `/pnp:mission`", stop; a brief only mid-flight (an unfinished ticket, an uncommitted diff, decisions spoken but not recorded) | `state is durable` (1 in this file) | `docs/SESSION_BRIEF_RECIPE.md:13-15` § What a session brief is, and who writes it: one sentence after `:15` pointing at that step (marker `state is durable`, 1) |
| P05 | `skills/plan/SKILL.md:185-189` Step 5, the runnability pre-pass paragraph, after "replies with the ones that cannot run and why" (`:188`) | D-05: the no-match check - a command with a test filter (`-t`, `-k`, `-g`, `--grep`, a spec path) is checked to select at least one test; a filter that selects nothing is reported as "cannot fail" (class 8, `docs/READINESS_CLASSES.md:27`) and goes back to the planner like a command that cannot run; and D-05's stage split in the same sentence - the check runs over the tree as it stands at the stamp; a filter that names a test the ticket itself creates is exempt there, the ticket's worklist names that test as new, and the Writer's own first run of the tests it adds, seen red, is its proof (`work.md` § Tests). The wording keeps the literal `red run` out of this file (Set 9 names four files, not this one) | `selects no test` (1) | none - `Runnability pre-pass` (`:185`) and `cannot run and why` (`:188`) stay on their own lines (Set 7) |
| P09 | `skills/plan/SKILL.md:175` Step 5, the refusal sentence; `:188-189` the runnability paragraph's "goes back to the planner (Step 4)"; `:239` Step 6 "Revision", "(Step 4, the same dispatch over the round file)" | D-09: at `:175` the full sentence - a gate refusal, a command that cannot run and every revision go to the live planner by a message to the dispatched agent (the harness's agent-message tool, `SendMessage` in Claude Code), never a fresh dispatch while that agent lives; a fresh dispatch and its Gate 2 dialog (`:147-148`) only when it has ended (DOCTR/D-17's mechanics applied to the planner); at `:189` and `:239` "the same dispatch" / "the planner" become "the live planner" pointing at it | `live planner` (3); `SendMessage` (1 in this file) | none - `templates/briefs/planner.md` stays (D-09 names the skill only) |
| P10 | `skills/plan/SKILL.md:76-82` Step 1, "The recorded state comes first"; a new paragraph at the end of Step 2, after `:123`, before `## Step 3` (`:125`) | D-10: Step 1 keeps the read of the recorded state and asks the operator nothing (the sentence "Then ask the operator ..." `:78-80` and the dual `:80-81` leave it); Step 2's new paragraph: after the research the COO answers the three questions from the research (its "what already exists" and "unknowns" sections, `:119-122`) and the recorded state, writes the answers with their pointers into `DECISIONS.md`, and only what stays unanswered goes to the operator in ONE dialog (rule 9) before Step 3; the suppression dual moves with it | `which real inputs exist, what must stay, what retires` (1); `asks the operator nothing` (1) | none - Set 1 has no other site; `templates/briefs/research.md` stays (D-10) |
| P11 | `skills/qa/SKILL.md:137-141` Step 2, the guaranteed artifacts, a fourth bullet; `:169-173` Step 2b, the artifacts passed to QA in Step 3, a fourth bullet; `:189-198` Step 3, the EVIDENCE block, a line after `:196` | D-11: the declared RED run - the runner's JSON report of the Writer's first run of the spec it adds, written by the same config reporter as the green run's (`:125-127`, no redirect - `:124`) and copied by the Writer right after that run to `<scratchDir>/<REF>-e2e-red.json`, or `RED run: none - because <reason>` when the pre-change tree could not be run; the verdict rule `:197-198` unchanged in meaning (a passing test judged from the JSON report; the red report is the evidence the spec can fail). The two Step 2 bullets name the path only; the none-form stands in the EVIDENCE line | `e2e-red.json` (3 in this file); `RED run: none - because` (1 in this file, `-F`) | `docs/CODEX_REVIEW_QA_RECIPE.md:289` the artifact list gains the red run's report, `:293` the prompt gains the red-run path or its none-form (markers `e2e-red.json` 1, `RED run: none - because` 1, both on `:293`); `templates/briefs/writer-dispatch.md` a new line after `:5` (Expected red set), for an `E2E: yes` ticket only - the Writer copies the JSON report of its spec's first, red run to `<scratchDir>/<REF>-e2e-red.json` right after that run, or says `RED run: none - because <reason>` in the hand-back; the line is dropped for `E2E: no` (markers `e2e-red.json` 1, `RED run: none - because` 1) |
| P12 | `skills/plan/SKILL.md:252` Step 6, the `**Approval.**` paragraph ("the declared ticket count and its reason, the tickets and their order, ...") | D-15: the report names, per ticket, the COO tier that executes it - the ticket's `COO: <model> - because <check>` line - beside the count and the order | `COO tier of each ticket` (1) | none - `templates/briefs/planner.md:54-55` already makes the COO line mandatory per ticket |

Close duties (in the record `records/SKILLS-001.md`): none of the roadmap lines is marked here - the
lines whose sentence this ticket wrote are marked at 002's record commit, with the release (D-01;
index § Order and gates).

## Acceptance

The commands run in PowerShell - this project's channel (`os: windows`) - from the repository root,
as written, after the docs commit; `<guard>` is replaced by the literal hash in the record. A pattern
that carries a quote, a backtick or a non-ASCII character is single-quoted. The output after the
dash means broken. A marker count is lines, so each marker sits on one line.

- `git diff --name-only <guard> HEAD` - a path other than `skills/qa/SKILL.md`,
  `skills/review/SKILL.md`, `skills/setup/SKILL.md`, `skills/brief/SKILL.md`, `skills/plan/SKILL.md`,
  `templates/briefs/writer-dispatch.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`,
  `docs/SESSION_BRIEF_RECIPE.md` (the record is the separate docs commit).
- `git diff --name-only <guard> HEAD -- templates/doctrine templates/agents templates/ORCHESTRATOR.md.tmpl templates/CLAUDE.md.tmpl .claude README.md CHANGELOG.md .claude-plugin migrations`
  - any line (D-01; Set 8 is 002's).
- `git diff <guard> HEAD -- skills` - a changed line inside a `## Step 0 - Project context` section.
- Set 1: `rg -n "real inputs|what must stay|what retires" skills docs templates` - a count other
  than 1; `rg -n "^## Step [123] |real inputs|asks the operator nothing" skills/plan/SKILL.md` - the
  `real inputs` line not between the `## Step 2` and `## Step 3` lines, or the
  `asks the operator nothing` line not between the `## Step 1` and `## Step 2` lines.
- Set 2: `rg -n "the same dispatch" skills docs templates` - any hit;
  `rg -n "live planner" skills docs templates` - a count other than 3, or a hit outside
  `skills/plan/SKILL.md`; `rg -n "SendMessage" skills docs templates scripts hooks schema` - anything
  but exactly 2 hits: `templates/doctrine/ticket.md.tmpl` (DOCTR/D-17) and `skills/plan/SKILL.md`
  (P09); `rg -n "respawn|resume, do not" skills docs templates` - any hit.
- Set 3: `rg -n "Guaranteed artifacts" skills docs templates` and
  `rg -n "EVIDENCE \(read-only" skills docs templates` - a count other than 1 each;
  `rg -c "e2e-report-" skills docs templates` - anything but `skills/qa/SKILL.md` 2,
  `skills/review/SKILL.md` 1, `docs/CODEX_REVIEW_QA_RECIPE.md` 1;
  `rg -n "before that copy stands" skills docs templates` - a count other than 1, or a hit outside
  `skills/qa/SKILL.md`.
- Set 4: `rg -n "log path of the green|green E2E run" skills docs templates` - a count other than 2
  (`templates/doctrine/work.md.tmpl`, `skills/review/SKILL.md`).
- Set 5: `rg -n "auto-approving|auto mode" skills docs templates` - a count other than 5;
  `rg -n "^## Step|auto-approving" skills/setup/SKILL.md` - the hit not between the `## Step 3` and
  `## Step 4` lines.
- Set 6: `rg -n "state is durable" skills docs templates` - a count other than 3
  (`templates/doctrine/ticket.md.tmpl`, `skills/brief/SKILL.md`, `docs/SESSION_BRIEF_RECIPE.md`);
  `rg -n "^## Step|state is durable|pnp:mission" skills/brief/SKILL.md` - the headings other than
  Step 0, Step 0.5, Step 1, Step 2, Step 3 in that order, or the `state is durable` line or a
  `/pnp:mission` line not between the `## Step 0.5` and `## Step 1` lines.
- Set 7: `rg -n "[Rr]unnability pre-pass|cannot run and why" skills docs templates scripts` - a count
  other than 2 (`skills/plan/SKILL.md`); `rg -n "^## Step|Runnability pre-pass|selects no test" skills/plan/SKILL.md`
  - the `selects no test` line not after the `**Runnability pre-pass.**` line and before
  `## Step 6`; `rg -n "selects no test" skills docs templates` - a count other than 1.
- Set 9: `rg -l "\b(RED|red) run\b|e2e-red|e2e-report" skills docs templates` - anything but these four
  files: `skills/qa/SKILL.md`, `skills/review/SKILL.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`,
  `templates/briefs/writer-dispatch.md`; `rg -c "e2e-red\.json" skills docs templates` - anything
  but `skills/qa/SKILL.md` 3, `docs/CODEX_REVIEW_QA_RECIPE.md` 1,
  `templates/briefs/writer-dispatch.md` 1; `rg -c -F "RED run: none - because" skills docs templates`
  - anything but 1 in each of those three files.
- Set 10: `rg -n "declared ticket count and its reason|COO tier of each ticket" skills docs templates`
  - anything but exactly 2 hits, both in `skills/plan/SKILL.md`, the second between the
  `**Approval.**` line and the `**Measurements` line of Step 6.
- `node scripts/update/validate-payload.mjs --plugin-root .` - exit != 0.
- `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
  - any hit.

## Risk threshold

Blocks: a marker count off its row; a decision's sentence restated in a second file instead of
pointed at; a consumer of the closing greps left in its old wording; a managed template or a
rendered copy under `.claude/` edited; a file of 002's (`migrations/`, `.claude-plugin/`,
`CHANGELOG.md`, `README.md`) touched; a `## Step 0` section changed or a skill heading renamed; a
new backticked payload path that does not exist (the self-check's cross-reference scan,
`scripts/selfcheck/aiwf-selfcheck.js:8326-8340`); `templates/briefs/writer-dispatch.md`'s E2E line
not marked as dropped for `E2E: no`; a red-run artifact that needs a shell redirect (D-11); a word of the operator's language, an origin-project name or an
absolute path in the payload; a sentence that changes another rule's meaning beyond its decision
(D-02's actor is never the Writer - DOCTR/D-26). Notes: line wrapping, sentence order inside a
paragraph, the exact wording of the new step heading.

## Stop condition

Stop and ask before writing when: a sentence cannot stand at its anchor without rewording a
neighbouring rule (that is a new decision); a decision reads wrong against the text it lands in; a
file outside the Code Map must change; a closing grep hits a consumer this worklist does not name.
Stop after the docs commit and the record; 002 is the next ticket's word.

## Verify

The prose row (`dev/PROJECT_OVERRIDES.md` § Test policy, "VERIFY is proportional to the change",
`:156-158`), once: the provenance grep
`git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md`
(broken when it prints any line) and `node scripts/update/validate-payload.mjs --plugin-root .`
(cwd `.`). No suite runs: no script asserts on the text of the touched sentences
(`scripts/selfcheck/README.md:23-25`); the Step 0 strings are kept by the Acceptance diff check
(`scripts/update/test-update.mjs:404-409` pins them). No render dry-run: `templates/briefs/*` is read
at run time from the plugin root, never rendered (`scripts/setup/generate.mjs:1058-1097`). Logs
outside the repository.

## Code Map

| path | role |
|---|---|
| `skills/qa/SKILL.md` | P02 (`:124-127`, `:192`), P11 (`:137-141`, `:169-173`, `:189-198`) |
| `skills/review/SKILL.md` | P02 (`:181-182`) |
| `skills/setup/SKILL.md` | P03 (Step 3, `:106-131`) |
| `skills/brief/SKILL.md` | P04 (`:30-32`) |
| `skills/plan/SKILL.md` | P05 (`:185-189`), P09 (`:175`, `:189`, `:239`), P10 (`:76-82`, `:119-125`), P12 (`:252`) |
| `templates/briefs/writer-dispatch.md` | P11 (a line after `:5`) |
| `docs/CODEX_REVIEW_QA_RECIPE.md` | P02 (`:293`), P11 (`:289`, `:293`) |
| `docs/SESSION_BRIEF_RECIPE.md` | P04 (after `:15`) |
| `skills/update/SKILL.md` | P03's source sentence (`:80-82`), read only |
| `templates/doctrine/ticket.md.tmpl` | the rules executed - the live-Writer resume `:127-130`, the brief rule `:305-307`; read only, never edited |
| `templates/briefs/record.md` | the Scratch section `:40-43`, read only |
| `docs/READINESS_CLASSES.md` | class 8 (`:27`), read only |
| `dev/backlogs` | the record `active/SKILLS/records/SKILLS-001.md` |
