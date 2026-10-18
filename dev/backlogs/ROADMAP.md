# Roadmap

Seeded once and then yours. Nothing in the plugin records this file, hashes it, or rewrites it.
The COO writes the entries, one `##` per idea, in the format below; entries follow this header.

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

## REBUILD - the working cycle rebuilt
- Goal: the cycle idea -> commit is defined once, cheap in context and quota, the same in PnP and its consumers
- Why: „не искам да гася пожара, а да го предотвратя"
- Scope: in - the cycle, its gate, its skill, its docs, the measurement; out - the suites, the public README
- Size: M
- Plans: PLAN_RBA (done 2026-10-17, archived as `012_PLAN_RBA_2026-10-17/`); PLAN_RBB (done 2026-10-17, release 0.3.0, archived as `013_PLAN_RBB_2026-10-17/`); PLAN_RBC (plan C, done 2026-10-18, archived as `015_PLAN_RBC_2026-10-18/`; planned 2026-10-17, operator word „имаш дума и за двете", approved „Одобрявам", no readiness pass: RBC-001 the measurement instruments + the chain-trace rule, RBC-002 the doctrine compaction - ahead of the first Silerax plan, the start measured at 130k after 0.3.0 - RBC-003 the two gate defects; the suites stay out) - RBC-003 is the plan gate's byte cap counting a ticket's `Status:` line (status belongs to the index table; arbitration note 2026-10-17, CANDIDATES § Ruling ledger) and the self-check's provenance walk skipping a root `.git` gitfile as it skips the `.git` directory, with a negative control (a worktree plugin root turns `/pnp:update --apply`'s embedded self-check red on a correct install; arbitration ruling 2026-10-17 on RBB-003's finding A, CANDIDATES § Ruling ledger)
- Status: in progress
- Born: 2026-10-17, operator word „да"

## README - the public README for a cold visitor
- Goal: a visitor who has never seen the loop understands what PnP is, installs it, runs one R2 ticket and takes an update from the root README.md alone
- Why: „тоя план става сега история, тоя 11 отива някъде в обозримото бъдеще, предполагам мястото му е в новия роадмап"; the original ticket is HARD-011 in `archive/014_PLAN_HARD_2026-10-17.md` (§ HARD-011 (README-001))
- Scope: in - the root `README.md`, § Status true per release, the command table, the macOS tier line (CANDIDATES § macOS support tier - re-examine folds in); out - the payload docs
- Size: S
- Plans: none yet; runs after REBUILD plan C's RBC-002 (the README describes the cut doctrine) and cuts 0.3.1
- Status: idea
- Born: 2026-10-17, operator word „тоя 11 отива ... в новия роадмап"

## GENERIC - one home per generic rule across the three projects
- Goal: every generic rule of the 2026-10-16 cross-project alignment has one home in the payload, and the three overrides documents keep only identity and product truth
- Why: „тези 40 правила от консолидацията къде и кога влизат" (relayed by the arbitration session, 2026-10-18); RBC-002 removed only the payload restatements, and the generic rules without a payload home are still local copies in PnP's overrides and both consumers
- Scope: in - the C1/C2 rows of `drafts/align-2026-10-16/align-decision.md` (with `rules-matrix.md` beside it) checked against `dev/PROJECT_OVERRIDES.md`: a rule the payload carries is deleted locally; a generic rule with no payload home gets one sentence in `docs/WORKFLOW.md`, `docs/LOOP.md` or `docs/REVIEW_CHECKLIST.md` and its name on the 0.3.1 `Retires local rules:` line; the ledgers move into the plan folder (a plan's rulings and pass rows in `readiness/<ABBR>/`, a ticket's events in `records/<REF>.md`) and the top-level transfer surface becomes a pointer index (operator 2026-10-18: „тоя леджер след 2 месеца ще стане 20к реда, леджер е указател, всичко свързано с плановете е в папката на плана"), and the ledger files settled by the operator (2026-10-18: „леджер нов файл, кандидати остава исторически и с времето се прехвърля към роадмап, роадмап носи всички бъдещи планове и идеи"): (1) `dev/backlogs/LEDGER.md` is a NEW file - the pointer index (one line per plan -> its `readiness/` and `records/`) plus the rows that belong to no plan; `paths.transferSurface` points at it; the payload template becomes `LEDGER.md.tmpl`, seeded once (a `seed-file` migration), WORKFLOW § The transfer surface renamed accordingly; (2) `CANDIDATES.md` stays a frozen HISTORICAL file, written again only to mark a row "taken up -> ROADMAP § X / dropped" - no migration, no template; (3) `ROADMAP.md` holds only LIVE entries (idea | researching | planned | in progress): at the archiving of an entry's last plan the entry leaves the roadmap and the archived plan's index carries its Goal and Why verbatim (copied at landing - `/pnp:plan`'s landing step writes them into `PLAN_<ABBR>.md`); a dropped idea leaves with one LEDGER line ("<ABBR> dropped: <why>"); grain rule - an entry is a goal worth at least one plan, a three-line task is not an entry; (4) consumers get the doctrine and the LEDGER seed with 0.3.1, their `CANDIDATES.md` untouched as history; the "Where things are written" block of overrides § Workspace paths goes into the CLAUDE.md region template (0.3.1 migration), so every session has it from line one; old rows are never migrated; out - product and machine-specific rows (they stay local, marked), any consumer tree
- Size: S
- Plans: none yet; a prose ticket after RBC-003 and before 0.3.1 cuts
- Status: idea
- Born: 2026-10-18, operator word „1 да"

## SCRATCH - the API key and the scratch cleanup
- Goal: a run that needs the Anthropic key reads it from a place the ticket-end `.aiwf/` cleanup never deletes, and the cleanup never deletes an operator file
- Why: found in RBC-002 (2026-10-18) - the key an earlier session read from `.aiwf/anthropic_key` had been removed by a past ticket-end cleanup, so the token counts fell back to `claude -p` (`active/RBC/records/RBC-002.md` § Decisions and deviations)
- Scope: in - where the key lives (outside `.aiwf/`, gitignored), the cleanup rule of overrides § Loop shape (operator files are never its target); out - the payload
- Size: S
- Plans: none yet
- Status: idea
- Born: 2026-10-18, operator word „това е бъдеща работа"
