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
- Scope: in - `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md` split into stage files (always-on: identity + hard rules + gates, ~12k; `/pnp:work`: R1 + Routes + Commit; R2: the brief contract + LOOP roles, at dispatch; `/pnp:plan`: readiness + durable history + the checklist's plan section; `/pnp:review` and `/pnp:qa`: the checklist; `/pnp:mission`: the plan index, the ticket, its stage), each stage file RENDERED into the project under `.claude/aiwf-native/doctrine/` as a managed artifact with a `<!-- project additions -->` block holding the project's local rules for that stage (a rule written outside the block falls at update, by design); each skill names which files it reads IN FULL („a title is not the text" stands); the overrides document reduced to product truth; memory carries no rules; the LEDGER only pointers; adopting a local rule = moving the sentence into the payload template + push; retiring = a `Retires local rules:` line naming file and block; expected start: a chat-only session ~60k, a plan session ~85-95k (`/context`); the later compaction RBC deferred - `docs/OPERATOR_PROTOCOL.md`, `docs/SESSION_BRIEF_RECIPE.md`, the skills (`skills/review` above all) and the rendered templates [dev/backlogs/archive/015_PLAN_RBC_2026-10-18/DECISIONS.md:103-105]; selective reading is IN - the 2026-10-18 "rejected" line was wrong, corrected 2026-11-01 at planning per RULEHOME D-09 (operator 2026-10-31: „не съм отхвърлил селективното чете - притесняваме да не падне още повече качеството - тук вече не гоним по малко контекст, а по стабилна работа на агентите и доктрината"); out - the sentence-level wording fixes (§ DOCTR), the context ceiling and compaction mechanism (§ CTX)
  - 2026-10-31 RULEHOME-001 session - an inventory of every WORKFLOW rule first, each given exactly one stage home, closed by a grep; WORKFLOW becomes reference only, the preflight reads the stage [dev/backlogs/inputs/DOCSTAGE-2026-10-31.md § 3.2]
  - 2026-10-31 RULEHOME-001 session - the skeletons mandatory through Gate 2: a Writer dispatch carries the template's fixed lines; the next ticket's dispatch refused while a closed ticket's record is incomplete (fail-direction change, R3) [dev/backlogs/inputs/DOCSTAGE-2026-10-31.md § 3.4]
  - 2026-10-31 RULEHOME-001 session - `/pnp:loop` removed (no pointer reaches it, its sequence repeats CLAUDE.md and LOOP; operator: „проблем/дефект"); its one unique rule - a QA BLOCKED is no correction round, never routed to the Writer - moves into `/pnp:qa` [dev/backlogs/inputs/DOCSTAGE-2026-10-31.md § 3.5]
  - 2026-10-23 Silerax RDR-002 (harvested 2026-10-31) - the doctrine preflight's size is measured once per plugin version and the session rule prices "a session per ticket" against it (a removal ticket closed at 380K, the preflight plus the plan reading on the order of 150K, unmetered) [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L74]
  - 2026-10-24 Silerax PLAN_BUGS (harvested 2026-10-31) - Step 0.5's dual: the payload docs count as unchanged while the version interlock reports the same plugin version, so a session re-reads nothing it already holds [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md § self-analysis, PLAN_BUGS]
  - 2026-11-02 DOCSTAGE-002 close - D-10's two `/context` numbers still to be read and judged against the expectation above (~60k chat-only, ~85-95k a plan session): the start of a fresh `/pnp:work` session and of a fresh `/pnp:plan` session on 0.3.8; the operator at the close: „Няма ги още - отворено", „не мога да измеря в момента на телефона съм" [dev/backlogs/archive/018_PLAN_DOCSTAGE_2026-11-02/records/DOCSTAGE-002.md § Remaining debt]; 2026-11-03 the method corrected: the COO's own statusline read at `/pnp:work` raised the number it measured (the operator: „докато продължавате тук да четете статуслайна няма как да имае реални числа"), so the overrides' "Start number (a) at `/pnp:work`" rule is deleted (dialog: „Махам правилото, мериш ти") and the `/pnp:work` number is the operator's `/context` at the task question of a fresh session, with no COO read before it; one reading on 0.3.9 so far is not clean (95.8k after one exchange and the COO's read, session 37cc5e63)
- Size: M
- Plans: PLAN_DOCSTAGE (`archive/018_PLAN_DOCSTAGE_2026-11-02/`, landed 2026-11-01, archived 2026-11-02: the split by stage and the render, release 0.3.8); the Gate 2 skeletons line above is the second plan's, not yet born - the entry stays for it (the 2026-11-01 ruling: a deferred item lives as a line under its entry)
- Status: idea
- Born: 2026-10-18, operator word „добре съгласен съм ще го направиш след като затворим плана"

## BRIEFS - research and planner briefs read by pointer
- Goal: the research and planner brief templates hand sections and pointers, not whole files, so a plan's research costs well under the first measured 278k and the planner's first handoff well under 190k
- Why: `dev/REBUILD.md` § First measured plan - GENERIC, levers (a) and (b); operator 2026-10-18: „да не забравим след това да запишем идеите в роадмапа" (relayed by the arbitration session)
- Scope: in - `templates/briefs/research.md`, `templates/briefs/planner.md` (a Code Map of the touched surfaces only; sections by pointer; the planner reads a file only where it writes a Code Map row), the measured before/after on the next plan; runs BEFORE the first Silerax plan; out - the Writer brief
  - 2026-10 (candidate) - the Writer's handback carries one line "what in the plan was wrong or missing, which check saved work" - the prep cost measured against its benefit [dev/backlogs/CANDIDATES.md:64]
  - 2026-10-17 RBB deferral - a `planner` agent type that Gate 1 lets write under `drafts/` (a hook change; today the planner runs as the writer type), judged after the first measured Silerax plan [dev/backlogs/archive/013_PLAN_RBB_2026-10-17/DECISIONS.md:128]
  - 2026-10-22 AIOCR measured (Silerax) - research 189,297 + 217,376, planner 499,902 in ONE dispatch: 43% of a 2.11M cycle; the before number for this entry [dev/REBUILD.md § First measured consumer plans]
  - 2026-10-22 Silerax pnp-candidate - the research brief asks "what already exists for this" and "which real inputs the operator can supply"; the planner brief gains a "closing greps" section [D:\Stratex\dev\backlogs\LEDGER.md rows of 2026-10-20] - DONE in `45c90ee` and `2c7c002` (0.3.3); the templates now read by pointer, the after-number waits for the next measured plan
  - 2026-10-25 Silerax PLINK-003 (harvested 2026-10-31) - the planner brief's closing-greps section runs over tests too (the plan's test list and the COO's grep both missed a test the Writer's stop condition found) [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L81]
  - 2026-10-20 Silerax AIOCR-002 (harvested 2026-10-31) - a fixed short form for a stop-condition hand-back (four escalations in one ticket each cost a full brief) [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L65]
  - 2026-10-23 Silerax RDR-001 (harvested 2026-10-31) - the readiness brief asks for the measurement behind every numeric bound on a live call; the COO's diff-review file carries one "what makes it fail" line per NEW TEST beside the per-criterion lines [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L71]
  - 2026-10-23 Silerax RDR-003 (harvested 2026-10-31) - the research brief records the OBSERVABLE baseline of the path a plan replaces (what the product shows today on real inputs) before the research, and the readiness brief asks the auditor for every loss against it [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L73]
  - 2026-10-23 Silerax PLAN_GRANTS (harvested 2026-10-31) - an "acceptance contract" slot in the planner brief the COO fills at dispatch (file aliases as shell assignments, canonical phrasings, expected sorted lists) [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L76]
  - 2026-10-28 Silerax PLAN_RIR (harvested 2026-10-31) - a COO pre-pass contract in the readiness brief: the mechanisms a plan hinges on, each opened and measured by the COO, so the paid auditor verifies decisions instead of discovering facts [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md § self-analysis, PLAN_RIR]
  - 2026-10-25 Silerax FLT-001 / PLINK-001 (harvested 2026-10-31) - the planner brief seeds a QA spec in the Code Map of every QA-yes ticket and the readiness brief asks for the spec behind every QA criterion; the Writer agent template asks for symbol pointers, not line numbers, in code comments [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md § self-analysis, FLT-001, PLINK-001]
  - 2026-10-25 Silerax PLAN_PLINK (harvested 2026-10-31) - the planner brief line "a guard that counts before it deletes names its lock and the lock order", so class 15 is answered in the plan, not in the round file [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md § self-analysis, PLAN_PLINK]
  - 2026-10-24 Silerax TENANCY-002 (harvested 2026-10-31) - the plan template asks which acceptance path is left for the operator's eyes and why a spec cannot show it [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md § self-analysis, TENANCY-002]
- Size: S
- Plans: none yet (the template work was R1 prose; what remains is the measurement)
- Status: in progress
- Born: 2026-10-18, operator word „да не забравим след това да запишем идеите в роадмапа"

## PASSCOST - the readiness pass cost measured once
- Goal: the same plan folder audited by gpt-5.6-sol/high and by gpt-6-sol/xhigh, blockers and tokens side by side, and the blocker contract made hard enough that INFO is actually used (two passes so far returned 13 BLOCKER / 0 INFO)
- Why: the Codex readiness pass is the sticky 165-216k of the cycle (`dev/REBUILD.md` § First measured plan - GENERIC, lever (c)); effort/model is the lever left (relayed by the arbitration session, 2026-10-18)
- Scope: in - one paid pass on the operator's word, the readiness brief template's INFO examples and an explicit "wording is INFO" line, the audit table's plan row if the measurement says so; out - any further pass
  - 2026-10 (candidate) - a warm (resumed, with compensations) pass against a cold one: cost and verdict quality unmeasured [dev/backlogs/CANDIDATES.md:588]
  - 2026-09-24 Silerax rule - chain-trace in the code-pass evidence pack: adopted into the payload or left local by this measurement (Silerax keeps the pointer form until then, ruling 2026-10-18) [dev/backlogs/CANDIDATES.md:627] [dev/backlogs/CANDIDATES.md:1128]
  - 2026-10-22 AIOCR measured (Silerax) - three readiness passes 199,703 / 227,726 / 388,516 cumulative, blockers 13/0, 5 new, 1 new; six code passes over three tickets (every pass 1 fail -> pass 2 resumed); the stamped AIOCR folder is the candidate for the side-by-side pass [dev/REBUILD.md § First measured consumer plans]
  - 2026-10-22 Silerax pnp-candidate - the revision stop rule compares carried rows (open of carried vs raw count), not raw blocker counts [D:\Stratex\dev\backlogs\LEDGER.md rows of 2026-10-20]
  - 2026-10-22 the INFO contract DONE in `58a2f59` (release 0.3.4: the explicit "wording / formatting / file:line precision = INFO" line, the one test for a row, six INFO examples; REVIEW_CHECKLIST mirrors the test); the measurement goes to the next real Silerax plan (RDR): pass 1 on the plan row (gpt-6-sol/xhigh), then on the operator's word a COLD pass 2 on gpt-5.6-sol/high over the same stamped folder with the same pass-1 brief, the plan row switched through `/pnp:roles --set` for that one pass on its own apply word and switched back; written into the RDR plan as a paid pass beyond the contract (scope + cost). Not over the archived AIOCR: its stamp is stale and this repository writes nothing in the consumer's tree [dev/REBUILD.md § How to continue step 11]
- Size: S
- Plans: none yet
- Status: in progress
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
  - 2026-10-31 operator (RULEHOME-003 diet dialog) - the session rule's "~400k tokens" is too small for a big ticket; the consumer's local hook (950k / 1000k) was the compaction experiment's instrument and is removed; Silerax overrides the number to 600k locally; the payload reconsiders the number („400К за голям тикет е малко но това е проблема на пейлоада не на силеракс, нека си добавят правило 600К овъррайд на правилото, ние в пнп ще го мислим") [dev/backlogs/active/RULEHOME/records/silerax-harvest/diet.md § Conflicts #3]
  - 2026-10-25 Silerax PLINK-003 (harvested 2026-10-31) - the checkpoint path takes the ticket ref, as the review state file does: two live sessions on one tree shared `.aiwf/checkpoint.md` and one rewrote it between the other's read and write [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L81]
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
  - done f61817f (RULEHOME-001 C4) - 2026-10-23 - `docs/LOOP.md` § Role boundaries says auto mode refuses "the config files an update writes"; the 0.3.5 `/pnp:update --apply` ran under auto mode and the engine's config write went through (operator: „аутомод не блокира") - the sentence is corrected to what was observed (the Edit/Write tool class on `.claude/settings.json`, `.claude/hooks/**`), or the refusal is reproduced and the sentence stays [dev/PROJECT_OVERRIDES.md § Environment, 2026-10-23]
  - Q2, Q3, Q4, C-002 done f61817f (RULEHOME-001); C-045, C-064, C-067, C-071 open (RULEHOME DECISIONS § Deferred) - 2026-10-16 alignment, unconsumed by GENERIC - eight rules that live only in the three projects' overrides, with no payload home: a dialog only when the ticket cannot continue (Q2), the operator channel carries counts never file:line (Q3), ticket-end cleanup of `.aiwf/` (Q4/C-056), independent units run in parallel by default (C-002), a lint baseline (C-045), a run judged against a recorded baseline JSON (C-064), the brief line `E2E: yes/no - because` (C-067), sessions start from the repo root (C-071) - each homed in the payload or confirmed project-only [dev/PROJECT_OVERRIDES.md § Communication, § Test policy; `drafts/align-2026-10-16/align-decision.md` in git history before its deletion on 2026-10-18]
  - 2026-10-23 Silerax RDR-003 (harvested 2026-10-31) - "the user sees less than before" as a named STOP class: a finding of that shape found by any role mid-ticket stops the ticket for the operator's word, never a note for the close [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L72]
  - 2026-10-23 Silerax PLAN_GRANTS (harvested 2026-10-31) - the pass-2 trigger distinguishes a reversed COO decision (a revision) from a reversed operator decision (a second pass) [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L76]
  - 2026-10-24 Silerax (harvested 2026-10-31) - a roadmap entry carries the problem, its evidence, the operator's words and the scope, never how it is fixed - the fix is the planner's [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L78]
  - 2026-10-25 Silerax PLINK-002 / PLAN_FLT (harvested 2026-10-31) - two readiness classes for `docs/READINESS_CLASSES.md`: a boolean predicate over a nullable column names its NULL case; a plan that replaces a reader names the old reader's row contract, sort keys, search semantics and permission gate, and where the new one differs [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L80, § self-analysis PLAN_FLT]
  - 2026-10-25 Silerax PLINK-002 (harvested 2026-10-31) - § COO owns broad scans: the exempt list of a consumer grep is for non-callers only (a comment, a doc); a caller is never exempt by its purpose [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L80]
  - 2026-10-25 Silerax PLINK-002 (harvested 2026-10-31) - the live-Writer resume (a message to the dispatched Writer for every micro-round, correction round and the commit) named as the mechanics of "a code-class note goes to the live Writer" [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L80]
  - 2026-10-26 Silerax consolidation (harvested 2026-10-31) - the roadmap template's missing places (the order of work across plans, a direction / phase log, a module table, finding-line tags such as checked / unchecked / severity, the operator's question queue) and the items the payload does not route to the roadmap (a plan's Deferred list, a record's remaining debt, a TODO in code, an audit's findings); an adversarial check before every bulk deletion from the roadmap [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L88, § self-analysis roadmap cleaning 2 and consolidation]
  - 2026-10-26 Silerax (harvested 2026-10-31) - a flat defect list with a growing counter and abbreviations born only with a plan: a consumer's declared local deviation from "an entry may be an area" - taken up only if a second consumer asks [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L90]
  - 2026-10-31 operator (the PnP session itself, RULEHOME-003) - a question to the operator is a DIALOG (the harness's question tool: numbered options, the consequence of each), never a chat list, and never with line numbers: the payload says "a gate is a dialog or a word" and "counts and names, never file:line" but names no tool, and the consumer-local rule that did was deleted as a duplicate („казвам го за последен път - въпроси се задават с диалози, а не в чата като прочетена книга") [dev/backlogs/active/RULEHOME/records/RULEHOME-003.md § Events]
  - 2026-10-31 operator (RULEHOME-003 diet dialog) - the language rule per record class: everything in the tree English; the CHANGELOG and the operator's verbatim quotes follow the communication language set at setup (a translated quote is no longer a 100 % statement when a decision must be proven to the operator); the doctrine states it and the setup interview asks it (with § SETUP) [dev/backlogs/active/RULEHOME/records/silerax-harvest/diet.md § Conflicts #5]
  - 2026-11-02 DOCSTAGE-002 - `templates/doctrine/review.md.tmpl` (moved verbatim from the checklist) still says the Codex wrapper takes the "brief on stdin"; since 0.3.7 the brief arrives through `-BriefFile` / `--brief-file`, stdin the fallback [dev/backlogs/archive/018_PLAN_DOCSTAGE_2026-11-02/records/DOCSTAGE-002.md § Decisions and deviations]
  - 2026-11-03 harvest S2 (Silerax PLAN_IWRC) - PnP has no Order-of-work step: an item left unticked after an archiving once a local rule was deleted as "payload-covered"; a nested roadmap list's parent closes with its last child [dev/backlogs/inputs/harvest-2026-11-03.md S2]
  - 2026-11-03 harvest S16 (Silerax IMPFX-001) - `ticket.md` § Durable development history: a ticket whose outcome is visible "closes only after the operator's own run ... offline proof never replaces it" has no waiver, yet the operator declined the run („затваряй не ми се гледа") and the ticket closed on QA's artifacts - the operator's explicit waiver, quoted in the record, is stated as the way such a ticket closes [dev/backlogs/inputs/harvest-2026-11-03.md S16]
  - 2026-11-03 Silerax 80cc6287 / Furnissimo a36dd900 (both fixed locally in writer.md additions) - `templates/agents/writer.md.tmpl` § VERIFY and § Done contract ("Run every VERIFY command literally"; DONE returns the VERIFY output) and `ticket.md` § Role boundaries contradict `work.md` § Tests ("a check agent runs checks ...; the Writer runs only the tests it adds") - the template and the boundary text aligned, a migration re-renders the Writer, the two local entries retire [dev/backlogs/inputs/harvest-2026-11-03.md, the VERIFY line]
  - 2026-11-03 Furnissimo sweep - `templates/PROJECT_OVERRIDES.md.tmpl:65` seeds "Restate the task scope ... and confirm it before changing anything", which contradicts guard (b) (after the word the loop runs to the end without asking again); the seed corrected (a seed is written once - existing installations keep their copy, a note tells them) [Furnissimo a36dd900, its B1]
  - 2026-11-03 Furnissimo sweep - `templates/AGENTS.md.tmpl:21` still says "The brief on stdin is the contract" (since 0.3.7 `-BriefFile` / `--brief-file`) and names no rendered core or stage file; no migration since 0.2.20 re-renders AGENTS.md - the template corrected and re-rendered (with the review.md stdin line above) [Furnissimo sweep reply, payload finding (1)]
  - 2026-11-03 harvest F4/F13 (Furnissimo TESTENV, twice) - the COO's first-hand read of the whole diff is its largest per-ticket cost (25-35k): a sonnet scan returns a diff map, the COO reads the risk hunks first-hand; a doctrine change to `ticket.md` § The COO write boundary ("reads the whole diff") [dev/backlogs/inputs/harvest-2026-11-03.md F4]
  - 2026-11-03 harvest F7 (Furnissimo) - a sonnet draft of the completion record from structured inputs, the COO verifying it - the invented-number risk named (unsure) [dev/backlogs/inputs/harvest-2026-11-03.md F7]
  - 2026-11-03 harvest F15 (Furnissimo TESTENV-004) - COO routing check 2 read again after the discovery scan: a scan that anchors every worklist item closes check 2, and the cheap COO suffices (unsure) [dev/backlogs/inputs/harvest-2026-11-03.md F15]
  - 2026-11-03 harvest F24 (Furnissimo TESTENV-003) - `ticket.md` § Role boundaries still offers "the operator may hand-edit from the COO's exact lines"; the operator: „ти сериозно ли искаш от мен да отварям и редактирам файлове които не разбирам?" - the hand-edit path removed or made the last resort after auto mode is switched off [dev/backlogs/inputs/harvest-2026-11-03.md F24]
  - 2026-10-23 Silerax RDR-002 (harvested 2026-10-31) - the known-failing baseline, an occasion for the intake-31 line: the discovery scan reads the baseline-red tests of every file in the ticket's verify line and the Writer brief carries that expected red set, so "stays green" is never an inherited claim [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L74]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## SKILLS - the skills: open items
- Goal: every skill says what the doctrine already decided - the QA trace mode, the report copy, the auto-mode refusal, the brief rule
- Why: four decided rules have no sentence in the skill that executes them
- Scope: in - the items below; out - new skills
  - done f61817f (RULEHOME-001 trace, D-17) - 2026-10-04 Silerax UIR-003 - E2E `--trace retain-on-failure` by default in the QA run (`skills/qa` still says `--trace on`) [dev/backlogs/CANDIDATES.md:556] [dev/backlogs/CANDIDATES.md:1133]
  - 2026-10-04 Silerax UIR-003 - the Writer copies the E2E JSON report into the scratch directory right after the run [dev/backlogs/CANDIDATES.md:565] [dev/backlogs/CANDIDATES.md:1135]
  - 2026-10 - one sentence in the setup/update skills: auto mode refuses settings writes and `/pnp:update --apply` (unsure) [dev/backlogs/CANDIDATES.md:1141]
  - 2026-10 - `/pnp:brief` says it is not offered when the state is durable (unsure) [dev/backlogs/CANDIDATES.md:1144]
  - 2026-10-19..25 Silerax, seven occasions (harvested 2026-10-31) - the fact-check gate's cost (RDR-001 246,661 tokens over the whole diff vs the Codex pass's 188,543; PLINK-003 193,176 vs 119,410): a pre-extracted claim list (haiku) that sonnet verifies; on `Class: code` only cross-reference claims (another file's line, a decision cite, a fixture fact, a count), self-describing comments skipped; a small prose delta is the COO's own read, recorded; doc and code claims may split across two agents; the agent's brief names "no statement that can write, DO blocks included" [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L71, L81, § self-analysis OCRG-001, BUGS-001, FLT-002, PLINK-002, GRANTS-001]
  - 2026-10-23..25 Silerax (harvested 2026-10-31) - `/pnp:plan` Step 5's pre-pass: a sibling-decision scan (every other function in the module reading the same column or option the worklist changes), a no-match check of every red-first command (`-t` / `-k` filters that match nothing pass), one sonnet consistency pre-pass per revision over the delta only and a full-folder pre-pass only after a rework [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L75, § self-analysis PLAN_PLINK, PLAN_BUGS, PLAN_AIOCR]
  - 2026-10-25 Silerax PLAN_FLT (harvested 2026-10-31) - `/pnp:plan`: the dialog form in a Cyrillic operator language ("one item per message in chat" instead of four points with consequences); the planner stays a live agent across the gate fix and the revision, said explicitly ("resume, do not respawn") [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md § self-analysis PLAN_FLT]
  - 2026-10-27 Silerax (harvested 2026-10-31, the diet's verification) - `/pnp:plan` Step 1's remaining questions come AFTER Step 2's research, answered from the code, the module docs, the mockups and the scans first, and reach the operator only for what stays unclear; 0.3.7's Step 1 still asks them before the research (operator „3 въпроса на които можеше да си намериш сам отговорите") [dev/backlogs/active/RULEHOME/records/silerax-harvest/diet.md § Rules, lines 138-141]
  - 2026-10-25 Silerax PLINK-003 (harvested 2026-10-31) - the QA brief names "the spec's RED run on the pre-change server" as a standard artifact: with traces off, the red logs are QA's evidence that the spec can fail [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L81]
  - 2026-11-03 harvest F8 (Furnissimo TESTENV-002) - the fact-check agent's reply contract compressed by default: FALSE and UNVERIFIABLE rows in full, VERIFIED grouped with a count (463 rows -> ~4k), stated in `/pnp:review` Step 2b [dev/backlogs/inputs/harvest-2026-11-03.md F8]
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
  - 2026-10-20 Silerax AIOCR-001 (harvested 2026-10-31; PnP RULEHOME-002 pass 3 died the same way) - the review wrapper reports a capacity refusal as its own line, "engine refused: capacity, session <id> resumable", instead of leaving it to the engine's stderr, so the dead-pass report is mechanical [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L63]
  - 2026-10-20 / 10-24 Silerax PLAN_AIOCR, PLAN_TENANCY (harvested 2026-10-31) - the review wrapper writes the round-file skeleton itself (engine, model, cold / resumed, tokens, the auditor's table verbatim with an empty disposition column) and keeps each pass's brief under `readiness/<ABBR>/brief-pass<N>.txt`; a wrapper flag for the effort, so a low-effort comparison pass needs no config change [dev/backlogs/active/RULEHOME/records/silerax-harvest/ledger-rows.md L61, § self-analysis PLAN_TENANCY]
  - 2026-11-03 harvest F6 (Furnissimo TESTENV) - the engine's stream (~6,000 lines per pass) goes to a log file outside the repository; the wrapper prints only the verdict, the token figure and the session id [dev/backlogs/inputs/harvest-2026-11-03.md F6]
  - 2026-11-03 harvest F9/F23 (Furnissimo TESTENV-002, operator fact 2026-10-18) - the "tokens used" figure of a resumed pass is the session's running total, not the pass's own cost; the wrapper prints the increment, or labels the figure cumulative [dev/backlogs/inputs/harvest-2026-11-03.md F9]
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
  - 2026-10-31 operator (RULEHOME-003 diet dialog) - the setup interview asks which language each record class is kept in (the changelog, the operator's quotes, everything else), and renders it into the project's CLAUDE.md zone and the doctrine's language rule (with § DOCTR) [dev/backlogs/active/RULEHOME/records/silerax-harvest/diet.md § Conflicts #5]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „продължи три"

## ENVOP - a settings `env` op, so a harness variable can ship to a project
- Goal: the update engine can write (and own) an `env` block in a project's `.claude/settings.json`, so a harness environment variable the payload relies on ships through a migration instead of a local rule or a guard
- Why: RULEHOME-002 spike (a) (2026-10-31, Claude Code 2.1.316): `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1` returns the main session to the project root after every Bash and PowerShell call - and it applies hot through a `settings.local.json` `env` block, no restart - but no op in the vocabulary (`add-config-key`, `rerender-managed-region`, `reconcile-ask-ruleset`, `note`, `seed-file`) can carry it, so D-04 resolved to the habit guard denying the `cd` prefix [dev/backlogs/active/RULEHOME/records/RULEHOME-002.md § Spikes (a)]
- Scope: in - one op (the write, its ownership bookkeeping, its removal path), the spike's variable as its first use, and the habit guard's shape (4) revisited once the variable ships (a `cd` that cannot persist needs no deny); out - any other settings key
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-31, RULEHOME-002 spike (a)

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

## GATES - the enforcement hooks: open items
- Goal: a rule that sessions keep breaking in the same shape is carried by a hook, and no hook refuses a legitimate act outside the repository
- Why: the 2026-11-03 harvest - `git -C` broken four times in three projects although a written rule forbids it, the habit guard bypassed by a nested form, Gate 1 refusing a scratchpad write twice (harvest S1, S6, F20, F41)
- Scope: in - the items below; out - the fail directions of the gates (a flip is R3, overrides § Architecture direction)
  - 2026-11-03 harvest S1 + F20 + PnP DOCSTAGE ledger (twice) - `git -C <path>` from a COO, four occurrences in three projects (Silerax after the operator's `! cd` moved the cwd; Furnissimo to read Silerax's log; PnP reading the live copy's HEAD twice) though "run git bare from the repo root, no `-C` prefix" stands in every CLAUDE.md; today only `git -C <root> push|merge|rebase` asks - the habit guard denies `git -C` for every verb, with a hint naming the bare form and the file tools for a foreign tree [dev/backlogs/inputs/harvest-2026-11-03.md S1, F20]
  - 2026-11-03 harvest S6 (Silerax IWRC-003) - the habit guard misses a nested form: a check agent denied `Set-Location` twice ran `& { Push-Location ... }` [dev/backlogs/inputs/harvest-2026-11-03.md S6]
  - 2026-11-03 0.3.9 release session + harvest F41 (Furnissimo 2026-10-04) - Gate 1 (`[AIWF-N3 gate 1: non-writer subagents cannot write]`) refuses a non-writer subagent's Edit/Write on a file in the harness scratchpad OUTSIDE the repository, while § COO owns broad scans sends a procedure agent to write files and to make a gate fail "on a copy - a fixture project or a scratch copy": the gate compares the target with the project root, or the doctrine's wording changes - one of the two (operator word „Ред в roadmap"; two occurrences) [dev/backlogs/inputs/harvest-2026-11-03.md F41; the render dry-run of 6efd103 ran without its probe]
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-11-03, operator word „Одобрявам" (the harvest dialog)
