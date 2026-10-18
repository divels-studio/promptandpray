# REBUILD - the one document for the redesign of the PnP working cycle

> ONE place. Everything about the redesign - the goal, the cycle, the inputs, the decisions, the open
> questions, the next step - lives HERE and nowhere else. Older names (PLAN_DOCT, PLAN_FOLD, the
> "five steps", DEENG-001, "ticket 1 / ticket 2") are pointers into this file now, not separate
> threads. A proposal made in chat is not made until it is written here. The candidates file is FROZEN
> for new entries (ROADMAP.md took that role on 2026-10-17).
> Rewritten WHOLE at every change; history is in git.

## Status (2026-10-18 - plan C done)

- RBC-001 done (`bf018ac`, record `31909bd`, amendment `90a2f81`). RBC-002 done (`a10110f`, record
  `744cc4b`): WORKFLOW + LOOP + REVIEW_CHECKLIST + overrides 54.6k -> 38.7k tokens (claude-opus-5-5
  via `claude -p`, base `90a2f81`), every rule homed (four rule-homes tables, homeless 0), the
  guides missed (WORKFLOW 18.6k vs 12k, LOOP 6.9k vs 4k, overrides 9.1k vs 8k) - closed on homeless
  0; under the ~40k stop line of step 2 below. Start numbers of that session: (a) 120k, (b) 130k
  (before the compaction took effect). Start number (a) after the compaction: 111.5k (§ Measurement
  protocol).
- Follow-on: ROADMAP § GENERIC - the alignment's generic rules without a payload home get one
  payload sentence each and a 0.3.1 `Retires` line (after RBC-003, before 0.3.1).
- RBC-003 done (`9bcf744` code, `f356023` prose; Fable COO, Writer, no Codex pass): the root gitfile
  skipped by the provenance walk, the header `Status:` line out of the byte cap, 8 new self-check
  assertions with their controls; VERIFY rows selfcheck + spikes + validate-payload exit 0 once.
  Plan C archived as `archive/015_PLAN_RBC_2026-10-18/`; its records hold the measurements. Start
  number (b) of that session: 140k (§ Measurement protocol).

### Status at the 2026-10-17 handover

- 0.2.20 and 0.3.0 released; both proven in Silerax (0.3.0: `--apply` exit 0, self-check 1300/1300,
  only the four expected files changed, the additions block kept). PnP self-install at 0.3.0.
- The cycle is APPROVED (nine stages + six answers, 2026-10-17); a second-opinion review's five
  points are in the text. Plans A (`012_PLAN_RBA`) and B (`013_PLAN_RBB`) executed and archived;
  PLAN_HARD archived (`014_PLAN_HARD`), its README ticket moved to ROADMAP § README.
- Plan C landed as `dev/backlogs/active/RBC/` (`ea34683`): RBC-001 measurement instruments + the
  chain-trace rule into REVIEW_CHECKLIST; RBC-002 doctrine compaction (WORKFLOW, LOOP,
  REVIEW_CHECKLIST, the whole overrides) verified by a rule-homes table; RBC-003 the root gitfile in
  the provenance walk + the header `Status:` line out of the byte cap. No readiness pass and no code
  pass on the operator's word. **Nothing of plan C is executed yet - tomorrow.**
- Measured today: preflight-only start = 110k (PnP) / 120k (Silerax); of that the four doctrine
  documents = ~71k, the harness (built-in tools 23.8k, skills 6.1k, system 4k, memory 3.8k) = ~39k,
  MCP = 0 (on demand). With a plan read: +10-20k. So C2 is the main lever on the start; the harness
  part is not ours.

## How to continue tomorrow (the order; nothing here starts without the operator's word)

1. **Open two sessions in PnP**: the executing COO (Opus - plan C is prose, all four routing checks
   "no"; `claude --plugin-dir D:\pnp-live`, `/pnp:mission`) and a fresh ARBITER (any model; see
   § Arbitration below). The executing session asks for the word for RBC-001.
2. **RBC-001 -> RBC-002 -> RBC-003**, each on its word, each closed with code commit / record
   commit, pnp-live refreshed after every commit (Start-Process form, never `-C`). RBC-002 is the big
   one: targets WORKFLOW <= 12k tokens, overrides <= 8k, LOOP <= 4k (guides, not gates - the gate is
   "every rule has a home"; a result above ~40k total means the method failed and stops).
3. **Measure the start again** (preflight-only prompt, § Measurement protocol) - expected ~65k if
   RBC-002 hits its guides. DONE 2026-10-18 together with steps 1-2 (plan C executed and archived):
   (a) 111.5k, (b) 140k - the guides were missed, the start is 120k -> 111.5k.
4. **Push** (one word; the dev commits since `v0.3.0` are unpushed) - the consumers take the compacted
   doctrine with `/plugin update`, no bump needed (prose). Then in Silerax and Furnissimo: `/pnp:update`
   is a no-op (current), but the thinner docs are what every session there reads from now.
5. **The first real plan in Silerax through `/pnp:plan`**, measured with RBC-001's instruments (the
   four numbers + the two start numbers). This is the test of the whole redesign. Baseline: the last
   Silerax plan under the old cycle, from its records.
6. **Only then** judge: does the planner subagent pay (stage 4, the least certain)? does one Codex
   pass suffice? is 194k per pass acceptable (lever: effort `high` on gpt-5.6-sol, measured once on
   the same plan)? Decisions go into this file as D-lines; the next release carries whatever
   changed (ROADMAP § README is bound to no version - operator 2026-10-18).
7. Furnissimo: after Silerax's first measured plan, the same `/plugin update` + one list-driven
   cleanup of its local rules (the 0.3.0 `Retires` line, minus chain-trace and the checkpoint rule,
   which STAY local - see § Corrections).

What is NOT done and must not be assumed done: no measurement of the new cycle exists yet; the
~400k session boundary, the <= 3-ticket cap, the planner-as-subagent and the one-pass default are
JUDGMENTS from GSD/BMad and our own numbers, not proofs. The operator's own words at the handover:
„хубаво преписахме, ама сме само на чернова, полирането тепърва предстои" - this document is a draft
of a working system, and the first Silerax plan is where it is tested.

## Measurement protocol (the session start cost; RBC/D-02, D-04)

The session start is TWO numbers of this repository, both read by the operator off the statusline
and asked by the COO - never estimated; `/pnp:mission` does not change (RBC/D-04):

- **Start number (a)** - after the doctrine preflight and BEFORE any plan file is read: a fresh
  session opened with `/pnp:work`, read at its task question (preflight + tree check + audit table);
  the same session then takes the ticket and yields (b) - zero extra sessions (arbitration ruling
  2026-10-18, CANDIDATES § Ruling ledger). It judges the doctrine compaction (RBC-002). Baseline:
  110k (PnP), 120k (Silerax), operator's `/context`, 2026-10-17 (`active/RBC/RESEARCH.md` fact 17) -
  taken with the preflight-only prompt (below), so (a) via `/pnp:work` sits a few k above it by the
  tree check and the table: a known offset, comparable.
  Measured: before RBC-002 120k (Opus 5.5 session `99e11b12`, statusline 12%); after RBC-002
  (`a10110f`) **111.5k** (Fable 5.1 session `2b168434`, operator's `/context`, 2026-10-18; statusline
  11%): messages 62.7k, system tools 31.9k, skills 6.1k, system prompt 5.9k, memory 4k, compact
  buffer 3k, MCP instructions 0.7k, agents 0.2k. Not comparable line by line with the 2026-10-17
  breakdown (that one was Silerax, messages 70.9k, system tools 23.8k): the harness's system tools
  grew ~8k since, and that part is not ours. Opus 5.5 and Fable 5.1 count identically (the same four
  files measured with both via `claude -p`: equal to the token).
  Selective reading of the preflight rejected by the operator 2026-10-18 („няма селективно
  четене"); the start of ~110k is accepted as the floor the doctrine size allows (harness ~49k +
  doctrine ~38k + the rest); further savings come from GENERIC's overrides trim only.
- **Start number (b)** - AFTER the active plan's files are read: in the same `/pnp:work` session,
  once the operator names the ticket and the plan is read, then the statusline (`/pnp:mission` in a
  fresh session gives a comparable one). It judges the folder format and selective reading. Recorded: ~130k after 0.3.0,
  with the active PLAN_HARD (~3,300 lines, ~34k tokens) inside it (`active/RBC/RESEARCH.md` fact 16).
  Measured 2026-10-18 on the folder plan RBC: **140k** (Fable 5.1 session `2b168434`,
  `~/.claude/ctx` 14% of 1,000,000, whole-percent precision), the same session whose (a) was 111.5k,
  after `PLAN_RBC.md`, `tickets/RBC-003.md`, `DECISIONS.md` and `records/RBC-002.md` were read -
  `RESEARCH.md`, the two closed tickets and `records/RBC-001.md` were not opened (selective reading).
- Per plan and per ticket the numbers are no longer by hand: `/pnp:plan` asks the start and approval
  numbers and writes the index's `## Measurements` (idea -> approved plan, cycle spend); each record
  carries its `## Measurements` row (correction rounds, COO session at close) on
  `templates/briefs/record.md` (RBC-001).
- The preflight-only prompt (operator-tested 2026-10-17):
  "Измерване на стартовия контекст, нищо друго. Направи само doctrine preflight-а по CLAUDE.md: прочети
  IN FULL payload docs/WORKFLOW.md, docs/LOOP.md, dev/PROJECT_OVERRIDES.md и
  .claude/aiwf-native/ORCHESTRATOR.md под D:\pnp-live. НЕ отваряй планове, ROADMAP, CANDIDATES,
  REBUILD, readiness папки; не пускай git или скриптове; не пиши нищо. Когда приключиш, отговори с един
  ред „preflight готов" и спри."

## Arbitration (how the arbiter session works)

- The arbiter is a session that READS and never writes the tree: zero repo writes, zero paid passes.
  The executing COO sends it a brief (SendMessage: the casus, the evidence `file:line`, which
  escalation trigger fired, the options it sees); the arbiter opens the files, replies with ONE ruling
  per casus as a message; the executing session writes the ruling-ledger row (CANDIDATES § Ruling
  ledger). The operator is never a courier; when the operator pastes a consumer session's dialog, the
  arbiter answers with the option number only.
- **Reference for tomorrow's arbiter:** this document is the state; the full context of the day is the
  transcript of the session that designed the cycle and arbitrated plans A-C:
  session id `5ad48d54-8ab3-480e-931b-5fe2e373c50e`, transcript
  `C:\Users\dyosi\.claude\projects\D--promptandpray\5ad48d54-8ab3-480e-931b-5fe2e373c50e.jsonl`
  (machine-local, large - open it only for a specific question, by grep, never whole).
- Rulings given 2026-10-17 (all in CANDIDATES § Ruling ledger, written by the executing session):
  1. RBB casus 1 - the planner runs as `subagent_type: "writer"` with the planner brief, writes only
     under `drafts/<ABBR>/`, returns a structured handoff; an implementation of stage 4, not a reversal.
  2. RBB casus 2 - RBB-003 (migration 0025 + bump) on Fable by routing check 1, as RBA/D-14 read it.
  3. RBB-002's stale `Step 2e` pointers -> RBB-003 item 6; re-stamp + the operator's word, no pass.
  4. RBB-003 out-of-scope (A) the root gitfile in the provenance walk -> plan C; (B) no example-cycle
     assertion on the seed-file line -> nowhere (test-update 15b proves it).
  5. Suites: the row's suite runs ONCE, in the background at the Writer's handoff, parallel to the
     COO's diff read; the Writer runs only its new tests - now RBA/D-15 and overrides § Test policy.
- Audits of plans A and B by the arbiter (three sonnet agents per plan, read-only): design covered;
  deviations recorded in the plan records; the loose ends went into plan C.

## Corrections learned after 0.3.0 (facts the next session needs)

- The 0.3.0 `Retires local rules:` line over-claimed **chain-trace**: the payload carried no equivalent
  (grep over templates/briefs, review skill, REVIEW_CHECKLIST, WORKFLOW: nothing). Silerax keeps it
  locally; RBC-001 puts the rule into REVIEW_CHECKLIST (one sentence) so the three projects share it.
- The **checkpoint rule + its hook** (HARD-024's context-gate) stay in Silerax and here: the ~400k
  session rule is a judgment, the 950k checkpoint is the safety net; only "the plan is read by
  sections" was retired (the folder format covers it).
- The Codex readiness pass over plan B (3 tickets, folder) cost 193,977 tokens - the same as the
  6-ticket monolith DOCT (215,992). The pass reads the repo around the plan, not the plan: plan size
  does not drive pass cost. Levers to test: effort/model (`high` on gpt-5.6-sol), the blocker contract
  in the brief (B returned 13 BLOCKER / 0 INFO under the OLD brief), a named read scope in the brief.
- The ticket byte cap (6144) counted the `Status:` line - RBB-002 hit 6180 on a status edit; RBC-003
  moved the header `Status:` line out of the measure (`9bcf744`).

## Goal

The cycle **idea -> research -> analysis -> plan -> phases -> plan review and approval -> phase
execution -> phase audit -> commit** is defined once, cheap in context and quota, and the same in
PnP and its consumers. The operator's words: „не искам да гася пожара, а да го предотвратя";
„бетон по всичко свързано с цикъла"; dozens of plans are coming in Silerax and Furnissimo, and „20х
макс план ... не стига дори и за 4 дена работа" under today's procedure.

Kept by the operator's word: a Codex readiness pass during planning and the code pass during
execution - „това доказано работи в полза на качеството и дори открива пробойни".

Measured from the first plan under the new cycle: tokens from idea to approved plan; correction
rounds after implementation; COO session size at the end of a plan; total spend. Blocker counts are
NOT the measure.

## The problem, in numbers we have

- A five-ticket plan reaches PASS in two or three COO sessions of ~800k tokens (operator). PLAN_DOCT
  pass 1: 215,992 Codex tokens, ~12% of a weekly quota, 12 blockers on a docs plan.
- A consumer plan: 883 KB / 6,561 lines, >90% outside the current phase; five archived consumer plans
  607-1,635 lines each, completion records 8.8-26.5% of them (PLAN REFACTOR PDF, size tables).
- Pass 1 on five consecutive consumer plans: 10-13 blockers each AFTER the ledger and fact-check were
  applied - the pre-pass artifacts did not reduce what the pass finds.
- Session start: 110-120k preflight-only, ~71k of it the four doctrine documents (2026-10-17).

Diagnosis, confirmed by the inputs: the cost sits in (1) WHERE the plan is written - the COO's long
session, which then carries every revision (GSD and BMad both author in fresh contexts and keep the
orchestrator thin); (2) HOW BIG the unit is (both cap a plan: 2-3 tasks / 900-1,600 tokens, one
shippable goal); (3) blockers without classes (GSD: BLOCKER / WARNING / INFO, INFO never revises;
a finding is a required property + evidence, the fix only a hint). The readiness ARTIFACTS - ledger,
consequence scan, own-pass file, per-section fact-check - are the author's homework with no measured
catch share; the mechanical half of them is a script in both frameworks, the judgment half is the pass.

## The cycle - APPROVED 2026-10-17 (every row, see the approval marks below the table)

| stage | who | where | artifact | gate |
|---|---|---|---|---|
| **idea** | the operator says it in chat; the COO (or a scan agent) writes it | chat -> `dev/backlogs/ROADMAP.md` | one entry per idea, in the strict format below; a goal too big for one plan is one entry with several planned plans under it | - |
| **research** | 1-2 `sonnet` scan agents, fresh context | subagent | `RESEARCH.md` in the plan folder: consumers and adjacent contracts of every touched surface, a Code Map (file -> role, no line numbers), what the code does today, open unknowns. Short; pointers, not prose. | - |
| **analysis** | COO with the operator | chat -> file | `DECISIONS.md`: numbered decisions `D-NN` (the operator's words verbatim where they are the source), a Deferred list, and numbered **Open Questions** that STOP the stage until the operator answers - an unknown is never written down as an assumption. | operator answers the OQs |
| **plan** | a planner subagent (`opus`, fresh context; dispatched as `subagent_type: "writer"` with the planner brief - ruling 1), briefed with RESEARCH + DECISIONS + the goal | subagent | `PLAN_<ABBR>.md` (index: goal, scope, ticket table with status) + `tickets/<ABBR>-NNN.md`, one file per ticket: Outcome, Scope, Acceptance, Risk threshold, Stop condition, Verify, Code Map slice, the `D-NN` it implements. Caps: **<= 3 tickets per plan, <= 6144 bytes (~1,500 tokens) per ticket**; over the cap = split or defer, the COO decides. The COO reads the result; it does not write the plan. | - |
| **phases** | - | - | A plan IS one phase. A bigger goal is a sequence of plans listed in `ROADMAP.md`; a later plan cites earlier `<ABBR>/D-NN` by id, never restates them. | - |
| **plan review and approval** | (a) a mechanical gate (`plan-gate.js --check`, seconds): caps, the six fields, every `D-NN` assigned to this plan (`plan: <ABBR>`) cited by a ticket or the index, cross-plan refs resolve against `active/` and `archive/`, no TBD, every Code Map path exists; the SHA stamp covers the FROZEN contract only - index, `DECISIONS.md`, `tickets/` - plus the text hash of every cross-plan decision cited; (b) **ONE Codex readiness pass** over the plan folder with the blocker contract: a BLOCKER names the property the plan must have + the evidence; INFO never triggers a revision; wording, formatting and `file:line` precision are out of scope; (c) COO triage per finding - fix / reject with a refutation / defer / ask the operator; the fix is written by the planner subagent (fresh), not by the COO; (d) cap: at most 2 revisions, and a revision that does not reduce the BLOCKER count stops and goes to the operator; a second Codex pass on the operator's word when pass 1 found a BLOCKER that reverses a `D-NN`, OR when the COO asks for it with a NAMED risk - security, tenancy, concurrency, transactions; never automatic | Codex + COO + planner agent | `readiness/<ABBR>/round-N.md`: the findings with their disposition (fixed / rejected: why / deferred); `readiness/<ABBR>/stamp.json` | operator approval -> the plan folder lands in `active/` |
| **phase execution** | Writer, fresh context | subagent | brief = `Ticket: <REF>` + "read `tickets/<REF>.md` and the files its Code Map names" + the standing lines (no restating of goal, files or acceptance) -> diff + handoff | Gate 2 dispatch |
| **phase audit** | the code pass (Codex, kept, with the chain-trace per behaviour - RBC-001); the fact-check over the diff (one `sonnet` agent, cheap); QA only for observable runtime behaviour | Codex / subagent | verdict + top findings in the handoff; the full text in a file, never in the COO's context | a word for every pass after the first |
| **commit** | the Writer (code), the COO (`records/<REF>.md`, one file per ticket) | session | two commits: code, then record; the row's suite ONCE in the background at the handoff (ruling 5) | native dialog each |

Approvals: idea („аз казвам идеята на COO, той или агент я пише в роадмапа по строго зададен формат"),
research („Е2 - да"), analysis („да"), plan („Е4 - да", WITH MEASUREMENT - the least certain stage),
phases („да"), review (a)-(d) („да"), execution („да"), audit („да"), commit + session rule („да, Е9
приемам"). Six answers confirmed („да и за двете" for 5 and 6; 1-4 settled by the stages).

**Worked example - a module redesign of 5-6 tickets in a consumer:** one ROADMAP entry (Size M).
Research ONCE for the whole goal, analysis ONCE (`D-01..D-NN`) - both live in the first plan's folder;
later plans cite them by `<ABBR>/D-NN` and add only a research DELTA and new decisions with continued
numbering. The planner cuts independently shippable slices: plan A = tickets 1-3, plan B = tickets 4-6;
B is only a line under the entry until A is committed, then written against the real code. One Codex
pass per plan, each plan in its own session. Old: 1 plan x 6 tickets x 2-3 passes x 2-3 sessions. New:
2 plans x 1 pass x 3 tickets. The price: B waits for A.

**Roadmap entry format (strict; the COO writes it, the operator never edits the file by hand):**

```markdown
## <ABBR> - <title>
- Goal: <one sentence - what is true when it is done>
- Why: <one sentence; the operator's words verbatim when they are the source>
- Scope: in - <...>; out - <...>
- Size: S (one plan) | M (two or three plans) | L (a sequence; each plan listed below as it is born)
- Plans: <PLAN_<ABBR> or none yet>
- Status: idea | researching | planned | in progress | done <date>
- Born: <date>, operator word „<quote>"
```

`ROADMAP.md` replaced the Candidates section of the transfer surface (CANDIDATES.md keeps its three
ledgers); old candidates are not migrated - an old one enters ROADMAP the day it is taken up. Payload:
`templates/ROADMAP.md.tmpl`, seeded once by setup and by migration 0025 (RBA-001, 0.3.0).

Dropped from the old cycle: the behavior ledger, the consequence scan, the own-pass file, the
per-section fact-check agents over the plan, the plan gate's artifact requirement. Replaced by:
research BEFORE the draft (fresh context), the mechanical gate, the blocker contract and the COO triage.

Kept unchanged: the four operator gates as native dialogs; the Writer as the only repo writer;
Reviewer/QA read-only; one doctrine for PnP and the consumers; no runtime, no daemon; English in the
tree, the operator's words verbatim in Bulgarian.

Session rule: the COO session holds the plan index, the state and the verdicts; it reads the APPROVED
tickets once (<= 3 x ~1,500 tokens) and never carries their revisions or a review body; a readiness
cycle starts in a fresh session; ~400k is a ticket boundary - a GUIDE, not a goal (GSD's degradation
scale: peak < 30%, good 30-50%, degrading 50-70% of the window), cut only where a ticket ends anyway;
HARD-024's checkpoint hook at 950k stays as the safety net. **Thin, not blind:** the planner's handoff
is structured (which `D-NN` in which ticket, dependencies checked, risks, evidence pointers); "PASS,
all fine" is not a handoff.

## The six answers (confirmed 2026-10-17)

1. Plan size: <= 3 tickets, <= 6144 bytes per ticket; bigger goals = several plans in ROADMAP.md.
2. Who drafts: a planner subagent in a fresh context; the COO reads, triages and decides.
3. Blocker classes in the Codex brief: BLOCKER (required property + evidence) / INFO; wording,
   formatting and line precision out of scope; the fix is a hint, never the finding.
4. Passes: one by default; a second on a reversed `D-NN` or a named risk, on the operator's word; at
   most 2 revisions; a revision that does not reduce BLOCKERs stops and asks.
5. Format: the folder from the first new plan; old monolith plans stay readable, no migration.
6. First measured plan: the next real plan in Silerax; the four numbers + total spend; baseline = the
   last plan under the old cycle, from its records.

## The plans that built it (A, B, C done)

- **Plan A - the structure** (`archive/012_PLAN_RBA_2026-10-17/`, Fable, Writer, no Codex pass):
  RBA-001 `ROADMAP.md` template + setup seed + the `seed-file` op + Gate 3 opens the roadmap;
  RBA-002 the plan folder in every reader (one predicate in `aiwf-lib.js`; Gate 2 lookup index ->
  tickets; self-check, mission, brief, archiving as a directory; monoliths still read); RBA-003 the
  mechanical gate (`plan-gate.js --check/--stamp`, the negative tests, the cross-plan hashes).
- **Plan B - the cycle as a skill and doctrine** (`archive/013_PLAN_RBB_2026-10-17/`; one Codex
  readiness pass, 13 blockers, 193,977 tokens; B3 on Fable by ruling 2): RBB-001 `/pnp:plan` +
  `templates/briefs/`; RBB-002 `/pnp:review` readiness mode reduced, Steps 2a-2e deleted, the docs
  say the cycle once; RBB-003 release 0.3.0 - migration 0025, CHANGELOG with `Retires local rules:`,
  the overrides' retired bullets, the five stale pointers.
- **Plan C** (`archive/015_PLAN_RBC_2026-10-18/`, no passes; done 2026-10-18): RBC-001 the measurement instruments (record skeleton,
  approval row, the two start numbers) + chain-trace into REVIEW_CHECKLIST; RBC-002 the doctrine
  compaction (WORKFLOW, LOOP, REVIEW_CHECKLIST, the whole overrides; verified by a rule-homes table;
  PLAN_DOCT's drafts and `readiness/DOCT/` are input, deleted on the word); RBC-003 the root gitfile
  in the provenance walk + the header `Status:` line out of the byte cap.
- ROADMAP § README (the public README) - a candidate bound to no version (operator 2026-10-18).
- COO routing applied: A1-A3 Fable (check 1); B1, B2 Opus; B3 Fable (ruling 2); C1, C2 Opus; C3
  Fable (check 1, RBC/D-12).

## Inputs (data, not canon)

1. **`dev/PLAN REFACTOR/` - a GPT analysis the operator recorded (2026-10-15), input only** („не е
   нещо което трябва да приемем на 100%"). Its three answers, in substance: (1) split the monolith
   plan into files read by role - index, DECISIONS, STATE, phases, tickets, records; the measured
   consumer plans were 607-6,561 lines with completion records 8.8-26.5% of them and phase 3
   inheriting phase 2 inheriting phase 1 (the PDF's size tables survived extraction, its Cyrillic prose
   did not); (2) no migration of old plans - legacy compatibility, new format forward, ONE doctrine for
   both; (3) new plans in English, the operator's words verbatim in Bulgarian, the operator channel
   stays Bulgarian; measure tokens on one translated ticket before deciding. Taken: the folder, no
   migration, English. Not taken as such: STATE.yaml (the index table holds status), phases as files
   (a plan IS a phase).
2. `dev/backlogs/drafts/PLAN_FOLD.draft.md` - the COO's direction draft "plan as a folder" (0.3.0);
   absorbed by plan A; its ticket list is void. May be deleted with RBC-002's cleanup, on the word.
3. `dev/backlogs/drafts/PLAN_DOCT.draft.md` + `dev/backlogs/readiness/DOCT/` - the parked doctrine
   compaction (6 tickets, pass 1 = 12 blockers, 215,992 tokens); its analyses of docs/skills/templates
   are RBC-002's input; deleted with RBC-002 on the word.
4. **GSD / BMad v7 (+bmad-loop) / Gas Town scan (sonnet agent, 2026-10-17; clones were under the
   session scratchpad, read only, now gone).** Lessons taken into the cycle, with their source:
   - revision loop with a hard cap and a stall rule; INFO never revises (GSD `references/revision-loop.md`,
     `agents/gsd-plan-checker.md`; BMad review loopback cap);
   - the blocker contract: required property + evidence + severity, the fix a non-binding hint
     (GSD `gsd-plan-checker.md:911-957`);
   - plan authored by fresh-context agents, orchestrator thin, reads frontmatter/summaries only
     (GSD `docs/ARCHITECTURE.md:72-83`, `references/context-budget.md`; BMad `step-02-plan.md`);
   - size caps as proposals with override: 2-3 tasks, <= 5 files per task (GSD); 900-1,600 tokens,
     one shippable goal (BMad `skills/bmad-build/workflow.md:23-31`);
   - mechanical checks before any LLM pass (BMad `lint_spine.py` first; GSD decision-coverage gate);
   - COO triage with a verdict per finding and routes fix / bad_plan / defer / intent_gap, reviewer
     severity ignored (BMad `step-04-review.md:53-86`);
   - review history as an append-only per-round ledger, not a contract (GSD `planner-reviews.md`);
   - auditor takes paths and returns a compact summary, full text to a file (BMad `reviewer-gate.md`);
   - Writer dispatch = a pointer to one self-contained ticket + Code Map, no restating (BMad
     `customize.toml:85-91`, `step-03-implement.md:31`);
   - frozen intent block + Open Questions that halt (BMad `plan-template.md:23-52`);
   - decision ids cited by tickets, inherited by id not by prose (GSD `templates/context.md`; BMad
     spine Inherited Invariants);
   - GSD's degradation scale for context (peak < 30%, good 30-50%, degrading 50-70%) - the source of
     the ~400k guide; GSD names the MCP schema tax as the biggest per-turn lever - here MCP is on
     demand and costs 0 at start.
   Not transferable (conflicts with PnP's constraints): any runtime / daemon / state engine
   (gsd-tools, bmad-loop, Gas Town beads); unattended auto-advance or auto-commit; automatic
   convergence loops without the operator's word; multi-reviewer ensembles (quota x N, and a
   "findings floor"); same-model self-review in place of the Codex pass. The frameworks' own admitted
   failures: orchestrators cannot judge semantic correctness, verifiers false-pass non-inferable
   checks, plan checkers "go soft", the loop is ceremony for small tasks - the same risks apply here.
   Unverified by the agent: token savings (ranking is judgment), BMad stable v6.
5. The second-opinion review of this file (GPT, 2026-10-17): D-NN scoped per plan and qualified
   across plans; the SHA stamp over the frozen contract only; a second pass on a named risk; thin not
   blind (structured planner handoff; the COO reads the approved tickets); total spend as the fourth
   number; cross-plan decision hashes and negative coverage tests in the gate - all in. Its closing
   advice, kept: do not open a readiness cycle on this design itself; implement and measure.
6. This session's evidence: CANDIDATES § UPDATE ARCHITECTURE (0.2.20's two tickets), § The suites
   cost an hour, § AFTER 0.2.20 (the five steps, now superseded by the plans above), § Ruling ledger
   (the five rulings of 2026-10-17).

## Decisions in force (operator, 2026-10-16/17; independent of the design; in the overrides)

- Prose in the payload is R1; code goes through the Writer; a Codex pass over code only on the word.
- A migration only for structure; the update overwrites; the project additions block is the
  consumer's home inside a rendered file.
- No suite for prose, skills, docs or templates; a `scripts/` change runs its row once, in the
  background at the Writer's handoff; the Writer runs only its new tests. No audit-pass question for prose.
- The Codex readiness pass stays in the cycle; a Codex pass is never automatic beyond the first.
- `git -C` and `cd` are forbidden to the COO; pnp-live refresh = `Start-Process git -ArgumentList
  'checkout','--detach','main' -WorkingDirectory 'D:\pnp-live' -NoNewWindow -Wait`.
- The operator decides with option numbers in dialogs; the COO states decisions, it does not ask them.

## Pointers that now resolve here

- CANDIDATES § AFTER 0.2.20 (the five steps), § UPDATE ARCHITECTURE DEENG-001 -> superseded by the
  plans above.
- PLAN_DOCT (parked), PLAN_FOLD (direction draft) -> inputs 2 and 3; both end with RBC-002.
- Memory `promptandpray-mission-status` -> points here for "what next".
