# Roadmap

Seeded once and then yours. Nothing in the plugin records this file, hashes it, or rewrites it.
The COO writes the entries, one `##` per idea, in the format below; entries follow this header.
An entry is a goal worth at least one plan; a task of a few lines is not an entry. Only live
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

## GENERIC - one home per generic rule across the three projects
- Goal: every generic rule of the 2026-10-16 cross-project alignment has one home in the payload, and the three overrides documents keep only identity and product truth
- Why: „тези 40 правила от консолидацията къде и кога влизат" (relayed by the arbitration session, 2026-10-18); RBC-002 removed only the payload restatements, and the generic rules without a payload home are still local copies in PnP's overrides and both consumers
- Scope: in - the C1/C2 rows of `drafts/align-2026-10-16/align-decision.md` (with `rules-matrix.md` beside it) checked against `dev/PROJECT_OVERRIDES.md`: a rule the payload carries is deleted locally; a generic rule with no payload home gets one sentence in `docs/WORKFLOW.md`, `docs/LOOP.md` or `docs/REVIEW_CHECKLIST.md` and its name on the 0.3.1 `Retires local rules:` line; the ledgers move into the plan folder (a plan's rulings and pass rows in `readiness/<ABBR>/`, a ticket's events in `records/<REF>.md`) and the top-level transfer surface becomes a pointer index (operator 2026-10-18: „тоя леджер след 2 месеца ще стане 20к реда, леджер е указател, всичко свързано с плановете е в папката на плана"), and the ledger files settled by the operator (2026-10-18: „леджер нов файл, кандидати остава исторически и с времето се прехвърля към роадмап, роадмап носи всички бъдещи планове и идеи"): (1) `dev/backlogs/LEDGER.md` is a NEW file - the pointer index (one line per plan -> its `readiness/` and `records/`) plus the rows that belong to no plan; `paths.transferSurface` points at it; the payload template becomes `LEDGER.md.tmpl`, seeded once (a `seed-file` migration), WORKFLOW § The transfer surface renamed accordingly; (2) `CANDIDATES.md` stays a frozen HISTORICAL file, written again only to mark a row "taken up -> ROADMAP § X / dropped" - no migration, no template; (3) `ROADMAP.md` holds only LIVE entries (idea | researching | planned | in progress): at the archiving of an entry's last plan the entry leaves the roadmap and the archived plan's index carries its Goal and Why verbatim (copied at landing - `/pnp:plan`'s landing step writes them into `PLAN_<ABBR>.md`); a dropped idea leaves with one LEDGER line ("<ABBR> dropped: <why>"); grain rule - an entry is a goal worth at least one plan, a three-line task is not an entry; (4) consumers get the doctrine and the LEDGER seed with 0.3.1, their `CANDIDATES.md` untouched as history; the "Where things are written" block of overrides § Workspace paths goes into the CLAUDE.md region template (0.3.1 migration), so every session has it from line one; old rows are never migrated; `/pnp:plan` gains a doctrine-preflight step with its suppression dual (read the four documents IN FULL unless this session already read their current text - checked by `git diff` since that read; after a context compaction all four are read again) (operator 2026-10-18: „влиза"); the audit table is no longer printed at a session start - removed from `/pnp:work` Step 2 and `/pnp:mission` Step 5, kept in `/pnp:roles` and `/pnp:setup` (operator 2026-10-18: „искам да махнем принтирането на таблицата с ролите"); out - product and machine-specific rows (they stay local, marked), any consumer tree
- Size: S
- Plans: PLAN_GENERIC (planned 2026-10-18, operator word „1 да", approved „1 да, 2 да, 3 да" - the plan, B11, the code pass of GENERIC-003; readiness pass 1: 13 blockers, 12 fixed, 1 asked; no pass 2)
- Status: in progress
- Born: 2026-10-18, operator word „1 да"
