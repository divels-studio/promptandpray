# 0023_changes-dir-and-agents

**Where the update report goes, a `$schema` pointer that no longer goes stale, and the Codex auditor's instruction file as a managed artifact.**

## What changes

- **`paths.changesDir`** - a new config key: the project-relative folder `/pnp:update` writes its `CHANGES_<from>-to-<to>.md` reports into. Its default `"."` is the project root, where the report has always been, so nothing moves until you set it. An installation that has no key at all reads it as `"."` too. The value must stay inside the project: setup refuses it, and an update refuses BEFORE any operation, when it is absolute, carries a drive letter, or climbs out with `..` (`a/../reports` is fine - it is `reports`); an update also refuses when it names something that exists and is not a folder. `--check` and `--resolve` never use the key and never refuse on it.
- **`$schema`** - the pointer at the payload schema in `.claude/aiwf-native/aiwf.config.json` was written once by setup and never again, so an installation that only ever updated kept a path into an old plugin cache. Every update run from a different plugin root now rewrites it, once, before any migration is journalled, and an update refused at a later operation keeps the refreshed pointer (the value is right either way); a run resuming an interrupted update leaves it alone and the next clean run refreshes it. An already-current run that refreshes it prints `refreshed $schema: <from> -> <to>`, then `nothing else was written`, and runs the self-check. Nothing reads the pointer, so a stale one was never a fault - it is now simply true.
- **`AGENTS.md`** - the instruction file a Codex-hosted auditor reads at the project root becomes a managed artifact rendered from the payload: created when you have none, recorded as it is when its bytes equal the render, and otherwise the update STOPS before writing it - an update never adopts a file it did not write; move yours aside or remove it, then run the update again.

## What this migration does

- **Adds** `paths.changesDir` with the value `"."` (no question asked - the default keeps today's location).
- **One `note`** saying the above.

## Superseded local rules

None. The only render this release adds CREATES `AGENTS.md`, a new file with no consumer-local duplicate of its sentences, so this release retires nothing and its note carries no `supersedes` list. A local habit of moving the `CHANGES` reports by hand can be replaced by setting `paths.changesDir`.
