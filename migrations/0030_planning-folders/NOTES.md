# 0030_planning-folders

**A planning session runs beside an executing one: Gate 3 lets the two planning folders through while
a route is open.**

## What changes

- `scripts/engine/pretooluse-mutation-guard.js` (Gate 3): while `.aiwf/route-state.json` names an
  R2/R3 ticket, the main session may also write every file under `<plansDir>/drafts/**` and
  `<plansDir>/readiness/**` - any file type, any depth, directly under the resolved `paths.plansDir`.
  `<plansDir>` is held to the transfer surface's containment terms: not absolute on either dialect,
  no `..` segment, inside the project, never under `.claude`; a value that fails them opens nothing.
  An unusable route state opens nothing either. Landed plans (`<plansDir>/active/`) and the archive
  stay behind the guard. The deny text names the two folders.
- `schema/aiwf.config.schema.json`: the `enforcement.routeWriteGuard` description names the two
  folders. No shape change.
- The doctrine: `docs/WORKFLOW.md` § Branch policy and § Ticket brief contract, `docs/LOOP.md`
  § Enforcement of Writer-only writes, `docs/OPERATOR_PROTOCOL.md` Gate 3, and the plan, work and
  mission skills - including one paid review pass in flight per working tree, held by the operator
  (the review brief and the session files are shared).

## What this migration does

- One `note` (`planning-folders-0-3-5`): `/pnp:update` prints it with the CHANGELOG block of 0.3.5
  and stamps the version - the two bookkeeping fields of the config (`installedPluginVersion`,
  `lastMigrationApplied`) are the only write. The hook is payload, read at every tool call, so
  nothing else in the installation changes.

## What it leaves alone

Every config key, every managed region, the ask-ruleset, `hooks/hooks.json`, the fail direction of
every gate and every operator-owned file.

## Superseded local rules

None.
