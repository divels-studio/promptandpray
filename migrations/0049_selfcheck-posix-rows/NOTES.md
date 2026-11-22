# 0049_selfcheck-posix-rows

**The self-check corrected, not the gates. One `note`, no re-render.**

## What changes

The CI run on the 0.3.23 commit printed `1807/1809` on both POSIX legs (ubuntu, macos): two rows
named `(p2) main + R2 open`, under GATE 3 SURFACE and GATE 3 PLANNING, expected DENY for a write
target whose name holds backslashes and ends in `.md`. Since 0.3.23 Gate 1 and Gate 3 split a target
by the host's own separator, so on Linux and macOS such a target is one root-level file name ending
in `.md` and passes Gate 3 as a root-level markdown file. The hook was right; the rows asserted the
decision from before 0.3.23.

In `scripts/selfcheck/aiwf-selfcheck.js` the surface row now expects allow on every platform (on
Windows the configured surface, elsewhere a root-level `*.md` name), a new row `(p2b)` writes the
same target in a project whose surface is another path (DENY on Windows, allow elsewhere - the POSIX
allow does not come from the surface), and the planning row names a `.ts` file so the folder test
alone decides it. On Windows every decision is the same as before.

## What this migration does

- One `note` (`selfcheck-posix-rows-0-3-24`): `/pnp:update` prints it with the CHANGELOG block.

## What it leaves alone

Every rendered file, every config key, the ask-ruleset, the agents and every operator-owned file.
