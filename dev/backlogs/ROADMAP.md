# Roadmap

Seeded once and then yours. Nothing in the plugin records this file, hashes it, or rewrites it.
The COO writes the entries, one `##` per idea, in the format below; entries follow this header.
An entry is a goal worth at least one plan; a task of a few lines is not an entry - it is one
indented line in the `Scope: in -` list of its area's entry (a module or theme whose goal is "no
known open defect"), added when the finding is born, until the list is worth a plan. Only live
entries stay here: an entry leaves when its last plan is archived, and an idea dropped before then
leaves with one ledger row `<ABBR> dropped: <why>`.

```markdown
## <ABBR> - <title>
- Goal: <one sentence - what is true when it is done>
- Why: <one sentence; the operator's words verbatim when they are the source>
- Scope: in - <...>; out - <...>
- Size: S (one plan) | M (two or three plans) | L (a sequence; each plan listed below as it is born)
- Plans: <PLAN_<ABBR> or none yet>
- Status: idea | researching | planned | in progress
- Born: <date>, operator word „<quote>"
```

## README - the public README for a cold visitor
- Goal: a visitor who has never seen the loop understands what PnP is, installs it, runs one R2 ticket and takes an update from the root README.md alone
- Why: „тоя план става сега история, тоя 11 отива някъде в обозримото бъдеще, предполагам мястото му е в новия роадмап"; the original ticket is HARD-011 in `archive/014_PLAN_HARD_2026-10-17.md` (§ HARD-011 (README-001))
- Scope: in - the root `README.md`, § Status true per release, the command table, the macOS tier line (CANDIDATES § macOS support tier - re-examine folds in); out - the payload docs
- Size: S
- Plans: none yet; bound to no version (operator 2026-10-18: „остава кандидат необвързан с версия")
- Status: idea
- Born: 2026-10-17, operator word „тоя 11 отива ... в новия роадмап"

## SEEDFS - the seed-file op contained through the real filesystem
- Goal: the `seed-file` migration op refuses a target that resolves outside the project or onto this installation's transfer surface through the REAL filesystem (a junction, a symlinked alias), as setup's surface judgement already does
- Why: Codex code pass 1 on GENERIC-003 (2026-10-18) returned two blockers on it - `resolveSeedTarget` / `refuseSurfaceSeed` in `scripts/update/migrate.mjs` resolve `<plansDir>` and compare the surface lexically; pre-existing since `926a3c6` (0.3.0's seed-file op; 0025's ROADMAP seed has the same exposure), outside GENERIC-003's scope; operator word „1" (recorded as a risk, not a correction round)
- Scope: in - `resolveSeedTarget` / `refuseSurfaceSeed` through canonical paths, a junction test and an alias test on the shipped 0026 seed path in `test-update.mjs`; out - the setup side (already real-filesystem), the fallback name, the 0011 promise's text
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „1"

## DOCSTAGE - the doctrine by stage, rendered into the project
- Goal: a session loads only the doctrine of the stage it is in, whole, by construction of the entry command, and a project's local rules live next to the rule they modify
- Why: „ние отваряйки сесия независимо от командата започваме работа и това изисква четене на доктрина ... доктрината да бъде разделена на секции" and „във всеки файл носещ някакви правила да има Local rules секция, така overrides остава само продуктови" (operator 2026-10-18, relayed by the arbitration session)
- Scope: in - `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md` split into stage files (always-on: identity + hard rules + gates, ~12k; `/pnp:work`: R1 + Routes + Commit; R2: the brief contract + LOOP roles, at dispatch; `/pnp:plan`: readiness + durable history + the checklist's plan section; `/pnp:review` and `/pnp:qa`: the checklist; `/pnp:mission`: the plan index, the ticket, its stage), each stage file RENDERED into the project under `.claude/aiwf-native/doctrine/` as a managed artifact with a `<!-- project additions -->` block holding the project's local rules for that stage (a rule written outside the block falls at update, by design); each skill names which files it reads IN FULL („a title is not the text" stands); the overrides document reduced to product truth; memory carries no rules; the LEDGER only pointers; adopting a local rule = moving the sentence into the payload template + push; retiring = a `Retires local rules:` line naming file and block; expected start: a chat-only session ~60k, a plan session ~85-95k (`/context`); the later compaction RBC deferred - `docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md`, the skills (`skills/review` above all) and the rendered templates [dev/backlogs/archive/015_PLAN_RBC_2026-10-18/DECISIONS.md:103-105]; out - any selective reading chosen by the COO (rejected 2026-10-18)
- Size: M
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „добре съгласен съм ще го направиш след като затворим плана"

## BRIEFS - research and planner briefs read by pointer
- Goal: the research and planner brief templates hand sections and pointers, not whole files, so a plan's research costs well under the first measured 278k and the planner's first handoff well under 190k
- Why: `dev/REBUILD.md` § First measured plan - GENERIC, levers (a) and (b); operator 2026-10-18: „да не забравим след това да запишем идеите в роадмапа" (relayed by the arbitration session)
- Scope: in - `templates/briefs/research.md`, `templates/briefs/planner.md` (a Code Map of the touched surfaces only; sections by pointer; the planner reads a file only where it writes a Code Map row), the measured before/after on the next plan; runs BEFORE the first Silerax plan; out - the Writer brief
  - 2026-10 (candidate) - the Writer's handback carries one line "what in the plan was wrong or missing, which check saved work" - the prep cost measured against its benefit [dev/backlogs/CANDIDATES.md:64]
  - 2026-10-17 RBB deferral - a `planner` agent type that Gate 1 lets write under `drafts/` (a hook change; today the planner runs as the writer type), judged after the first measured Silerax plan [dev/backlogs/archive/013_PLAN_RBB_2026-10-17/DECISIONS.md:128]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „да не забравим след това да запишем идеите в роадмапа"

## PASSCOST - the readiness pass cost measured once
- Goal: the same plan folder audited by gpt-5.6-sol/high and by gpt-6-sol/xhigh, blockers and tokens side by side, and the blocker contract made hard enough that INFO is actually used (two passes so far returned 13 BLOCKER / 0 INFO)
- Why: the Codex readiness pass is the sticky 165-216k of the cycle (`dev/REBUILD.md` § First measured plan - GENERIC, lever (c)); effort/model is the lever left (relayed by the arbitration session, 2026-10-18)
- Scope: in - one paid pass on the operator's word, the readiness brief template's INFO examples and an explicit "wording is INFO" line, the audit table's plan row if the measurement says so; out - any further pass
  - 2026-10 (candidate) - a warm (resumed, with compensations) pass against a cold one: cost and verdict quality unmeasured [dev/backlogs/CANDIDATES.md:588]
  - 2026-09-24 Silerax rule - chain-trace in the code-pass evidence pack: adopted into the payload or left local by this measurement (Silerax keeps the pointer form until then, ruling 2026-10-18) [dev/backlogs/CANDIDATES.md:627] [dev/backlogs/CANDIDATES.md:1128]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word relayed by the arbitration session (the post-archive batch, „записвай пакетите")

## PORTABLE - a consumer is not coupled to PnP
- Goal: a clean clone of a consumer (Silerax) runs a planning cycle under another framework (GSD, installed `--claude --local`) with the PnP plugin disabled for that folder, proving the product does not depend on the plugin and giving a third measurement point (GSD vs `/pnp:plan` on the same module)
- Why: „това може да стане чак след селективното четене, а в роадмапа може да влезе само като идея + доказване че двата консуматора не са тясно свързани със PnP" (operator 2026-10-18, relayed by the arbitration session)
- Scope: in - a throwaway clone, `enabledPlugins: {"pnp@promptandpray": false}` in the clone's project settings (verify that project-level is honoured), the PnP `CLAUDE.md` region removed in the clone only, GSD local install, `/gsd-onboard` + one phase planned, tokens recorded; runs AFTER DOCSTAGE; out - any push from the clone, any change to the real Silerax tree
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „това може да стане чак след селективното четене"

Entries below were ported on 2026-10-18 from `dev/backlogs/CANDIDATES.md` (now history); each item keeps a pointer `[dev/backlogs/CANDIDATES.md:<line>]` to its original row, where the full text and the evidence live.

## CTX - the context ceiling, compaction and gate state in the payload
- Goal: the payload carries the checkpoint and compaction mechanism every project runs locally today (the gate-checkpoint hook, the context ceiling, the post-compaction return), so the local hooks expire
- Why: the mechanism is a project's own addition in 0.3.x (`docs/WORKFLOW.md` session rule) while three projects run the same hook by hand; the compaction incident of 2026-10-14 produced the items below
- Scope: in - the items below; out - any runtime or daemon (overrides § Identity)
  - 2026-10-14 - the context-ceiling + gate-checkpoint mechanism in the payload: a hook that reads the transcript, silent without autocompact [dev/backlogs/CANDIDATES.md:135]
  - 2026-10-14 compaction incident - (a) a SessionStart:compact reminder, (b) readiness starts by loading /pnp:review, (c) a warning on early fact-check agents [dev/backlogs/CANDIDATES.md:225]
  - 2026-10-14 - (e) the checkpoint carries the next gate's operative lines verbatim [dev/backlogs/CANDIDATES.md:261]
  - 2026-10-14 - (f) gate state as a small JSON beside the checkpoint prose (unproven; fixed headings are the alternative) [dev/backlogs/CANDIDATES.md:263] [dev/backlogs/CANDIDATES.md:289]
  - 2026-10-14 - (g) long doctrine skills are not cut at 5k on their return after compaction; reload the skill before a gate [dev/backlogs/CANDIDATES.md:266] [dev/backlogs/CANDIDATES.md:277]
  - 2026-10-14 - (e) SessionStart:compact is the only measured channel [dev/backlogs/CANDIDATES.md:274]
  - 2026-10-14 - (h) compact hooks also fire for a background subagent (#91910) [dev/backlogs/CANDIDATES.md:279]
  - 2026-10-14 - (i) a live-agents table in the checkpoint, a receipt line after compaction [dev/backlogs/CANDIDATES.md:283]
  - 2026-10-14 - the checkpoint lists the current ticket's gates verbatim, never as "or" [dev/backlogs/CANDIDATES.md:305]
  - 2026-10-14 - (l) a mechanical pre-commit check: the plan says QA yes but no QA dispatch is recorded [dev/backlogs/CANDIDATES.md:307]
  - 2026-10 intake 4 - subagent hooks get the main session id, so the ceiling STOP reaches subagents [dev/backlogs/CANDIDATES.md:333]
  - 2026-10 - a configurable GO-word / ask dialog for paid passes [dev/backlogs/CANDIDATES.md:1034]
- Size: M
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## DOCTR - doctrine: open wording and gaps
- Goal: the doctrine has no known double phrasing, unqualified term or missing rule from the recorded list
- Why: each item is a recorded gap or ambiguity found while working under the doctrine; DOCSTAGE restructures the files, this entry fixes their sentences
- Scope: in - the items below; out - the split by stage (DOCSTAGE)
  - 2026-10 - a later operator remark narrows the standing "да": stop and wait (unsure) [dev/backlogs/CANDIDATES.md:60]
  - 2026-10 - work the doctrine does not require goes first through a question to the operator (unsure) [dev/backlogs/CANDIDATES.md:69]
  - 2026-10 - a per-decision "escalation: none / trigger N" line in brief and plan (unsure) [dev/backlogs/CANDIDATES.md:75]
  - 2026-10 - R2 vs R3 for payload migrations: WORKFLOW § R3 says "migrations" unqualified [dev/backlogs/CANDIDATES.md:93]
  - 2026-10 intake 8 - the auditor still raises first-pass-visible blockers: enforce structurally, not by a sentence [dev/backlogs/CANDIDATES.md:349]
  - 2026-10 intake 31 - a known-failing tests list, "zero new failures" (low priority) [dev/backlogs/CANDIDATES.md:436]
  - 2026-10 - run the E2E spec before the code audit (waits for a word) [dev/backlogs/CANDIDATES.md:612]
  - 2026-10 - a product name is not a path: "write to <plugin> CANDIDATES" has two addresses - a Branch policy sentence (unsure) [dev/backlogs/CANDIDATES.md:818]
  - 2026-10 - two names for one set: "unplanned R2" vs "small R1 / non-durable R2" (unsure) [dev/backlogs/CANDIDATES.md:956]
  - 2026-10 - a doctrine sentence that enumerates the world is phrased as a checkable rule (unsure) [dev/backlogs/CANDIDATES.md:966]
  - 2026-10-16 alignment, unconsumed by GENERIC - eight rules that live only in the three projects' overrides, with no payload home: a dialog only when the ticket cannot continue (Q2), the operator channel carries counts never file:line (Q3), ticket-end cleanup of `.aiwf/` (Q4/C-056), independent units run in parallel by default (C-002), a lint baseline (C-045), a run judged against a recorded baseline JSON (C-064), the brief line `E2E: yes/no - because` (C-067), sessions start from the repo root (C-071) - each homed in the payload or confirmed project-only [dev/PROJECT_OVERRIDES.md § Communication, § Test policy; `drafts/align-2026-10-16/align-decision.md` in git history before its deletion on 2026-10-18]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## SKILLS - the skills: open items
- Goal: every skill says what the doctrine already decided - the QA trace mode, the report copy, the auto-mode refusal, the brief rule
- Why: four decided rules have no sentence in the skill that executes them
- Scope: in - the items below; out - new skills
  - 2026-10-04 Silerax UIR-003 - E2E `--trace retain-on-failure` by default in the QA run (`skills/qa` still says `--trace on`) [dev/backlogs/CANDIDATES.md:556] [dev/backlogs/CANDIDATES.md:1133]
  - 2026-10-04 Silerax UIR-003 - the Writer copies the E2E JSON report into the scratch directory right after the run [dev/backlogs/CANDIDATES.md:565] [dev/backlogs/CANDIDATES.md:1135]
  - 2026-10 - one sentence in the setup/update skills: auto mode refuses settings writes and `/pnp:update --apply` (unsure) [dev/backlogs/CANDIDATES.md:1141]
  - 2026-10 - `/pnp:brief` says it is not offered when the state is durable (unsure) [dev/backlogs/CANDIDATES.md:1144]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## CODEX - the Codex wrapper: open items
- Goal: the three Codex wrappers keep their line endings under every git setting and use the tier agents once upstream is fixed
- Why: two recorded wrapper behaviours wait for an external event
- Scope: in - the items below; out - the review/QA contract itself
  - 2026-10 PS-EOL - the three codex `.ps1` drift to LF; `.gitattributes` pins crlf; waits for a codex run [dev/backlogs/CANDIDATES.md:784]
  - 2026-10 - Codex tier agents (`multi_agent`), waiting for the upstream bugs [dev/backlogs/CANDIDATES.md:859]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## SETUP - setup and naming: open items
- Goal: the installer owns every file it renders and the product carries one name
- Why: two recorded gaps in the setup engine
- Scope: in - the items below; out - the update engine
  - 2026-10 RENAME-001 - the full rename AIWF -> pnp across the payload (R3) [dev/backlogs/CANDIDATES.md:748]
  - 2026-10 - `ORCHESTRATOR.md` is not in `ownedDestinations` of `generate.mjs` [dev/backlogs/CANDIDATES.md:1062]
  - 2026-10-17 RBB deferral - delete `--hash` from `scripts/engine/plan-gate.js` and the monolith readers (a code ticket promised after 0.3.0) [dev/backlogs/archive/013_PLAN_RBB_2026-10-17/DECISIONS.md:134]
  - 2026-10-18 GENERIC deferral - rename the legacy fallback `PNP_CANDIDATES.md` -> `LEDGER.md` in the engine (guard, generate, selfcheck, the two suites) once every installation carries the key [dev/backlogs/archive/016_PLAN_GENERIC_2026-10-18/DECISIONS.md:170]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## SUITES - the suites fast and honest
- Goal: the eight VERIFY rows run in minutes, not an hour, and a POSIX proof exists where the canon claims one
- Why: „the suites cost an hour" (CANDIDATES § The suites cost an hour); `example-cycle-linux` is a Windows run with Linux answers, not POSIX proof
- Scope: in - the items below; out - the test policy rows (overrides § Test policy)
  - 2026-09 - VERIFY has no POSIX leg; `example-cycle-linux` is a Windows run [dev/backlogs/CANDIDATES.md:985]
  - 2026-10 - make the suites fast (setup ~16, update ~19, cycle ~16, selfcheck ~6 min; target under 3 min) [dev/backlogs/CANDIDATES.md:1284]
  - 2026-10 AFTER step 4 - suites fast or fewer; drop `example-cycle-linux` from `verify.commands` [dev/backlogs/CANDIDATES.md:1342]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"
