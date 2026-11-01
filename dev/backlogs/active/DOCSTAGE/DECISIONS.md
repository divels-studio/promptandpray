# DOCSTAGE - decisions

## Decisions

- **D-01** The build (operator 2026-10-18: „ние отваряйки сесия независимо от командата започваме
  работа и това изисква четене на доктрина ... доктрината да бъде разделена на секции"; 2026-10-31:
  „за пореден път кърпим вместо да градим"): every rule of `docs/WORKFLOW.md`, `docs/LOOP.md` and
  `docs/REVIEW_CHECKLIST.md` lives in exactly ONE stage file; a stage file is a payload template
  `templates/doctrine/<stage>.md.tmpl` rendered as a managed artifact
  `.claude/aiwf-native/doctrine/<stage>.md` with the project additions block; the entry command of
  each stage names the file it reads IN FULL („a title is not the text" stands). The always-on stage
  file is the existing `ORCHESTRATOR.md` (already managed, already carrying the block; RULEHOME D-10's
  homes survive). This supersedes the templates contract "a rule is never copied into a template"
  (`templates/README.md:25-27`, RESEARCH S2 fact 18) on the operator's word: the template IS the
  rule's one copy, and the payload docs keep no second one. plan: DOCSTAGE
- **D-02** The stage set and the section -> stage map (RESEARCH S2 inventory), every section moved
  WHOLE unless D-05 splits it:
  - **core** = `ORCHESTRATOR.md` (every door, at its first step): WORKFLOW § Roles, § COO owns broad
    scans, § The operator does not arbitrate engineering decisions + ### How the COO speaks to the
    operator, § Operator-interaction guards, § Verifying failure claims, § Escalation and the arbiter,
    § Branch policy, § Commit & Push Authority; the ORCHESTRATOR's own rules as they are, its
    duplicates of the moved text collapsed (the four triggers stand once), its References-only list
    rewritten to point at stage files;
  - **`work.md`** (`/pnp:work` Step 1): WORKFLOW § Routes (R1, R2, R3, COO routing), § Tests,
    § Status / release docs policy, ### Out-of-scope failures found during work; LOOP § Routing
    mapped to native;
  - **`ticket.md`** (before an R2/R3 brief is authored - `/pnp:work` at the route, `/pnp:mission`
    before the dispatch): WORKFLOW § Ticket brief contract + ### Proof-surface feasibility, § The COO
    write boundary runs along artifact class, § Loop shape and its overrides, § Fail aggregation,
    § Durable development history items 4-5 (D-05); LOOP § Role boundaries' rule paragraphs (D-05);
  - **`plan.md`** (`/pnp:plan` Step 0.5): WORKFLOW § Planning lock, § Plan readiness review,
    § Durable development history items 1-3 with the archive, the roadmap writes and ### The ledger
    (its fenced skeleton included);
  - **`review.md`** (handed to the auditor by `/pnp:review` and `/pnp:qa`; the reviewer and qa agent
    templates name it): `docs/REVIEW_CHECKLIST.md` whole, its plan-readiness section included (the
    plan pass is an auditor's pass);
  - **what stays in `docs/`**: `WORKFLOW.md` becomes the MAP - what the loop is, the stage files and
    the step that reads each, § Reproducibility - with no rule text; `LOOP.md` keeps § Enforcement of
    Writer-only writes, § Commit gate and § Honest security model (the hook reference nobody's
    preflight reads) and points at `work.md` for the routing table; `REVIEW_CHECKLIST.md` becomes a
    pointer stub (why: consumer overrides and memories cite the path; no file leaves `docs/`, so the
    hard rule on removals under `docs/` is not touched). Why ORCHESTRATOR as core: the gates, the
    channel and the guards are what every session needs whatever its command, and the file already
    has the block the RULEHOME diet filled. plan: DOCSTAGE
- **D-03** Rendered into the project, read from there - not read from the payload: (a) the stage's
  local rules live in its block (operator 2026-10-18: „във всеки файл носещ някакви правила да има
  Local rules секция, така overrides остава само продуктови"); (b) the preflight's suppression dual
  (`git diff <HEAD> -- <paths>`) works only on in-tree paths, so in a consumer it never fired on the
  payload docs and fires on the rendered copies (RESEARCH S2 fact 3); (c) the mechanism exists -
  `rerender-managed-region` with `region: null` creates the file, precedent 0012 (fact 12). Always-on
  means read by every entry door at its first step, never a CLAUDE.md `@import`: subagents inherit
  CLAUDE.md, and an import would load the COO's rules into every scan agent and the Writer. plan: DOCSTAGE
- **D-04** One additions block per stage file, at its end - the engine's contract as it stands
  (`generate.mjs:565`, fact 10); a local rule written into it opens with the heading of the rule it
  modifies. „Local rules секция" per file is the operator's word; several blocks per file would be
  an engine change with a new malformed-marker surface, for no rule the end of a ~300-line file
  cannot carry. plan: DOCSTAGE
- **D-05** ONE section splits between two homes, at item boundaries, and the assignment is complete:
  of § Durable development history (`docs/WORKFLOW.md:517-650` at `e8761b6`) item 4 (`:534-565` -
  the record, the two acts, the scratch keep-or-move, the session line) and item 5 (`:566-572` - the
  closeout halves) go to `ticket.md`; EVERY other paragraph of the section goes to `plan.md` - the
  introduction (`:519-525`), items 1-3 (`:526-533`), the archive and roadmap-writes paragraphs
  (`:573-600`), the "do not copy" sentence, the paths tree, the scratch-and-landing paragraph, the
  naming-grammar bullets, the "update once" and the resume-memory paragraphs (`:602-649`), and
  ### The ledger (`:651-681`) (readiness round 2 B9). LOOP § Role boundaries moves WHOLE
  to `ticket.md` under its own heading `## Role boundaries` (readiness round 1 B4: its paragraphs mix
  rule and host fact - `docs/LOOP.md:68-85` - and a clause-level split would be the Writer's
  discovery); `docs/LOOP.md` keeps a NEW `## Role hosts` table of about eight lines - role, host,
  cell (main session / Claude subagent / Codex wrapper, with or without the OS sandbox) - new text
  that copies no rule, and points at `ticket.md § Role boundaries`. § Loop shape and its overrides
  moves whole to `ticket.md`; `work.md` points at it. A cross-stage reference is one line
  `<stage>.md § <heading>`, never a restatement. plan: DOCSTAGE
- **D-06** The entry doors after the split: `/pnp:work` Step 1 reads core + `work.md` + the overrides
  document IN FULL, and `ticket.md` IN FULL the moment the task routes R2/R3, before the brief;
  `/pnp:mission` reads core + the overrides + the plan index + the ticket, and `ticket.md` IN FULL
  before the dispatch; `/pnp:plan` Step 0.5 reads core + `plan.md` + the overrides; `/pnp:review` and
  `/pnp:qa` hand the rendered `review.md` path where they hand `docs/REVIEW_CHECKLIST.md` today
  (`skills/review/SKILL.md:186`, `skills/qa/SKILL.md:206`), and `reviewer.md.tmpl:39` /
  `qa.md.tmpl:35` name it; `/pnp:review`, `/pnp:qa` and `/pnp:qal` themselves carry the doors' Step
  0.5 - core + `ticket.md` IN FULL - so a session that starts cold on any of them reads its stage by
  construction (readiness round 1 B6, round 2 B11); `/pnp:arbiter` reads the rendered core
  (`.claude/aiwf-native/ORCHESTRATOR.md`) IN FULL in place of its two payload section reads
  (`skills/arbiter/SKILL.md:46,52`; round 2 B7) - its two sections are inside it. The
  suppression dual of `/pnp:plan` Step 0.5 becomes the dual of every one of these, over the rendered
  paths and the overrides: skip when `git diff <HEAD at the read> -- <paths>` is empty, read again
  after a compaction - so the review and QA reads cost nothing in a session that entered by a door.
  The CLAUDE.md core region's preflight sentence names the stage files and nothing more. The
  skills' own operative steps stay where they are: a skill is the point of action. Every door's
  read is pinned positively - work, mission, plan, review, qa, qal, arbiter and the CLAUDE.md region:
  the acceptance greps the stage path and `IN FULL` on the step, and the self-check's skill section
  asserts the same per door with a negative control (round 1 B7, round 2 B7). plan: DOCSTAGE
- **D-07** `/pnp:loop` is REMOVED (operator 2026-11-01, dialog answer „Премахни го" over three
  options; 2026-10-31: „имаме нещо което не се ползва ... проблем/дефект"): the directory
  `skills/loop/` goes, the README namespace list and command table row (`README.md:114,198`) and the
  `docs/LOOP.md:27` pointer go, the 0.3.8 block carries a `### Removed` entry, and the self-check's
  `/pnp:<cmd>` rule (RESEARCH S2 fact 14) is the closing check - zero `pnp:loop` outside
  `CHANGELOG.md` history. Its one rule found nowhere else - "a QA `BLOCKED` is not a Writer defect,
  pauses the loop and consumes no correction round" (`skills/loop/SKILL.md:91-94`) - moves into
  `/pnp:qa` at the verdict step, in 002. The self-check's rule scans `migrations/` too
  (`scripts/selfcheck/aiwf-selfcheck.js:7669-7679`, `KNOWN_FUTURE` at `:7666`) and
  `migrations/0022_stab-prose/NOTES.md:9` names `/pnp:loop` (the planner's catch, 2026-11-01): a
  shipped migration's note is history and is never rewritten; the rule gains a `RETIRED_COMMANDS`
  map (`loop` -> `0.3.8`) accepted ONLY under `migrations/`, a retired name anywhere else still
  fails, and the assertion gets its negative control (a retired name planted outside `migrations/`
  in a scratch copy is reported). Code, 002. plan: DOCSTAGE
- **D-08** The enumeration is closed by a paragraph-coverage check, not by a feeling (WORKFLOW
  tripwire 4): a scratch script outside the repository takes every paragraph of the three docs at
  `e8761b6` (whitespace-normalised) and counts its occurrences across `templates/doctrine/*.tmpl`,
  `templates/ORCHESTRATOR.md.tmpl` and the reduced `docs/`; the bar is exactly ONE hit per paragraph,
  except the paragraphs on an explicit merged-or-dropped list in the ticket's record, each with the
  paragraph it merged into or the reason it dropped. Positive control: run once over the untouched
  tree, where every paragraph hits exactly once in its old file. Run and recorded in DOCSTAGE-001
  (the templates stand, the docs untouched: every paragraph hits twice, which is the expected
  mid-state) and again in DOCSTAGE-002 after the reduction (the bar). plan: DOCSTAGE
- **D-09** Two tickets, one release (0.3.8), the RULEHOME D-02 shape: **DOCSTAGE-001** - prose, R1 in
  the main session (overrides § Hard rules), `review.docs` row 0 = no auditor: the four new stage
  templates authored, `ORCHESTRATOR.md.tmpl` extended, the three docs UNTOUCHED (nothing reads the
  templates yet, so the old preflight keeps working between the two tickets), D-08's control and
  mid-state run; VERIFY = provenance grep + `validate-payload` + one render dry-run on a scratch copy;
  one scan-tier fact-check over the diff's prose before the commit (RULEHOME D-16 (b)); `COO: Opus -
  all four no`. **DOCSTAGE-002** - code, the Writer, `review.code` pass 1: `planInstall` gains the
  four keys, the suites' and the fixture's key sets, the ledger-skeleton pin and the quoted-title
  strings follow (fact 16, fact 20), migration `0033` (four creating re-renders, ORCHESTRATOR, the
  CLAUDE.md region, every agent template that changed, one `note`), the skills re-pointed (D-06), the
  docs reduced (D-02), `/pnp:loop` per D-07, README § Status and its command table, `docs/README.md`,
  `templates/README.md:25-31` rewritten to D-01, the CHANGELOG block with its `Retires local rules:`
  line (D-11), the bump, D-08's final run; VERIFY = the union `selfcheck`, `validate-payload`,
  `setup-suite`, `update-suite`, `plugin-validate` (a skill directory leaves and `plugin.json`
  changes - the manifest surface the command checks; the planner's question, 2026-11-01), plus the
  example cycle if `examples/` moves; `COO: Fable - because check 1` (ships a migration; RBC D-12
  precedent). After 002's commit: `/pnp:update --apply` on this
  repository, the tag and the push each on the operator's word; this repository's own consumer
  layer swept in the record commit (RULEHOME D-16 (c)) - against the Retires line AND for every
  pointer to the three docs: `dev/PROJECT_OVERRIDES.md` (`:4-5`, `:109`, `:254`, `:266`, `:281`),
  `dev/VERIFY_RUNBOOK.md:82`, `dev/README.md`, the root `CLAUDE.md` operator zone, each re-aimed at
  the stage file or the map; `dev/REBUILD.md` and `dev/backlogs/**` are history and stay (readiness
  round 2 B10). Why one release:
  a consumer takes one update and the templates ship with the engine that renders them. plan: DOCSTAGE
- **D-10** Numbers are measured for this plan as the skill says (RULEHOME D-11 suspended them for
  that plan only): start 120,000 (the statusline files, 12 % of 1,000,000). At 002's close the
  operator is asked once for two `/context` numbers nobody else can read - the start of a fresh
  `/pnp:work` session and of a fresh `/pnp:plan` session on 0.3.8 - and the entry's expectation
  (~60k chat-only, ~85-95k a plan session) is judged against them in the record. plan: DOCSTAGE
- **D-11** From 0.3.8 a `Retires local rules:` line names, per retired rule, the stage file and block
  it may have stood in (`<stage>.md § project additions: <rule>`), and adopting a local rule means
  moving its sentence into the stage template and shipping it (the entry's words). The format text in
  `CLAUDE.md` § Changelog format (this repository's operator zone, R1) changes in 002's record commit.
  The 0.3.8 line retires no rule of its own unless 001 homes one; the migration `note` tells a
  consumer that four empty blocks exist and that a local rule moves into the block of the stage file
  carrying the rule it modifies - on its operator's word, never by the update. plan: DOCSTAGE
- **D-12** Sessions: S1 (2026-11-01, Fable) the entry, research, decisions, the planner, the stamp
  and the runnability pre-pass, and the readiness pass if its context stays under the session rule's
  boundary at the pass's dispatch - otherwise S2 fresh; S3a DOCSTAGE-001 on an Opus session; S3b
  DOCSTAGE-002 and the release on a fresh Fable session. plan: DOCSTAGE
- **D-13** The lock on the four new writes (readiness round 1 B8, class 15): the stage files are
  written by two engines only - setup (`generate.mjs` `applyPlan`) and update (`migrate.mjs`
  `writeAtomic`, one atomic write per file) - under the operator-held invariant "one executing
  session per working tree" (WORKFLOW § Branch policy): an update or setup run is that session's
  act, and nothing else writes `.claude/aiwf-native/**` beside it - a planning session writes only
  its drafts, readiness, roadmap and ledger; the main session is denied under `.claude/` by Gate 3
  while a route is open and edits an additions block only with no route open and no run in flight;
  the Writer's scope guard never names the rendered layer. Setup's collision check reserves the four
  paths and the `doctrine` directory against a configured overrides document, ledger or roadmap
  (round 1 B1), so no second one-time writer can be configured onto them. No new lock, no new
  concurrent writer. plan: DOCSTAGE

## Deferred

- The mandatory skeletons through Gate 2 (input § 3.4: a Writer dispatch must carry the template's
  fixed lines; the next ticket's dispatch refused while a closed ticket's record is incomplete) - a
  fail-direction change of Gate 2, R3 (overrides § Architecture direction) - the entry's second plan,
  after 0.3.8 is on Silerax. Why not here: a consumer takes the split without a new deny in the same
  update, and an R3 ticket does not share a release with two others.
- The compaction of `docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md` and the skills'
  bodies (RBC Deferred) - pointers updated here, text untouched; back with ROADMAP § CTX.
- The preflight's size measured per plugin version as a standing procedure (ROADMAP § DOCSTAGE
  harvested line) - D-10 measures it once for 0.3.8; the procedure returns when the second measured
  version exists.
- Step 0.5's dual keyed on the version interlock (ROADMAP § DOCSTAGE harvested line): the in-tree
  `git diff` dual of D-06 covers a consumer now; the version key returns if the diff proves costly.

## Open Questions

None. (Answered 2026-11-01: `/pnp:loop` -> D-07, removed.)
