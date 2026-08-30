# 0002_operator-word-and-hygiene (0.1.1)

The first migration with operations. It carries the hygiene of the first real dogfood run of the
loop, plus one doctrine correction that was learned from an observed violation.

## What changes in your project

1. **`CLAUDE.md`, the `aiwf-core` region** is re-rendered. New in it: a ticket born after a standing
   operator word is written into the PLAN, announced in ONE sentence and STOPS - zero mutations on
   it until the operator's word for THAT ticket. (The earlier reading, "the announcement is a
   notification rather than a question", let a ticket be born AND started without a word; it is
   revoked in `docs/WORKFLOW.md` guard (b).) The git-hygiene bullet also stops claiming that a `-C`
   prefix trips an ask rule, because it no longer does - see 3.

2. **`.claude/agents/writer.md`** is re-rendered. It gains a `## VERIFY` section (run every command
   literally, report the exact exit code the harness shows, never append `; echo "X=$?"`) and the
   "reading is not a shell job" rule, and it loses two cosmetic defects: the template-contract
   comment addressed to the generate engine, which was being rendered into the agent file, and the
   mixed-slash overrides path (a Windows root joined to a POSIX separator). The path is now one
   native path for your `os` channel.

3. **`.claude/settings.json`**: the blanket `Bash(git -C:*)` ask rule is removed **if this plugin
   inserted it** (`_aiwf.ownedAskRules`). It gated every `-C` form of every git command - including
   read-only ones against another repository - while adding nothing to the push/merge/rebase gate,
   which keeps its three rendered `Bash(git -C <projectRoot> ...)` forms. A rule you added yourself,
   or one that was already in your settings before the install, is foreign and is not touched; a
   rule you had already removed by hand is a tombstone and stays removed.

No files are deleted, and no operator-owned file is written: your overrides document, the text
outside the `aiwf-core` markers and your own permission rules are exactly as they were. (The one
thing this migration does remove is the blanket ask RULE in 3 - deliberately, and only when the
plugin owns it.)

## Known limit: the reviewer and qa agent files

This migration deliberately carries **no** `rerender-managed-region` op for `.claude/agents/
reviewer.md` or `.claude/agents/qa.md`. Those files exist only when the role is claude-hosted, so on
a codex-hosted install they are absent and unrecorded - and `planRerender` refuses (by design) to
re-render an artifact that `_aiwf.managedRegions` does not record, because an update never adopts a
file it did not write. An op for them would therefore BLOCK the update of every codex-hosted
project.

Consequence: if your reviewer or qa role is claude-hosted, those two agent files keep the
template-contract comment until you re-render them deliberately - `/pnp:setup` (a re-interview
re-renders them cleanly) or `/pnp:update --resolve .claude/agents/reviewer.md`. The comment is
cosmetic; nothing behaves differently because of it.

## If it stops on a conflict

You edited a managed artifact by hand (or the payload and you both changed it). Nothing was
overwritten: the run names the key and offers `take-new` / `keep-mine` / `merge`. `keep-mine` holds
your version and records the new render as upstream, so a later `/pnp:update --resolve <key>` can
still bring it in.
