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
- Scope: in - `docs/WORKFLOW.md`, `docs/LOOP.md`, `docs/REVIEW_CHECKLIST.md` split into stage files (always-on: identity + hard rules + gates, ~12k; `/pnp:work`: R1 + Routes + Commit; R2: the brief contract + LOOP roles, at dispatch; `/pnp:plan`: readiness + durable history + the checklist's plan section; `/pnp:review` and `/pnp:qa`: the checklist; `/pnp:mission`: the plan index, the ticket, its stage), each stage file RENDERED into the project under `.claude/aiwf-native/doctrine/` as a managed artifact with a `<!-- project additions -->` block holding the project's local rules for that stage (a rule written outside the block falls at update, by design); each skill names which files it reads IN FULL („a title is not the text" stands); the overrides document reduced to product truth; memory carries no rules; the LEDGER only pointers; adopting a local rule = moving the sentence into the payload template + push; retiring = a `Retires local rules:` line naming file and block; expected start: a chat-only session ~60k, a plan session ~85-95k (`/context`); out - any selective reading chosen by the COO (rejected 2026-10-18)
- Size: M
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „добре съгласен съм ще го направиш след като затворим плана"

## BRIEFS - research and planner briefs read by pointer
- Goal: the research and planner brief templates hand sections and pointers, not whole files, so a plan's research costs well under the first measured 278k and the planner's first handoff well under 190k
- Why: `dev/REBUILD.md` § First measured plan - GENERIC, levers (a) and (b); operator 2026-10-18: „да не забравим след това да запишем идеите в роадмапа" (relayed by the arbitration session)
- Scope: in - `templates/briefs/research.md`, `templates/briefs/planner.md` (a Code Map of the touched surfaces only; sections by pointer; the planner reads a file only where it writes a Code Map row), the measured before/after on the next plan; runs BEFORE the first Silerax plan; out - the Writer brief
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „да не забравим след това да запишем идеите в роадмапа"

## PASSCOST - the readiness pass cost measured once
- Goal: the same plan folder audited by gpt-5.6-sol/high and by gpt-6-sol/xhigh, blockers and tokens side by side, and the blocker contract made hard enough that INFO is actually used (two passes so far returned 13 BLOCKER / 0 INFO)
- Why: the Codex readiness pass is the sticky 165-216k of the cycle (`dev/REBUILD.md` § First measured plan - GENERIC, lever (c)); effort/model is the lever left (relayed by the arbitration session, 2026-10-18)
- Scope: in - one paid pass on the operator's word, the readiness brief template's INFO examples and an explicit "wording is INFO" line, the audit table's plan row if the measurement says so; out - any further pass
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
