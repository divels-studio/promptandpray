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
