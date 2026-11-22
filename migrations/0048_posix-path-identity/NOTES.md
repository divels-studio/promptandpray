# 0048_posix-path-identity

**Two POSIX defects fixed, nothing changed on Windows. One `note`, no re-render.**

## What changes

Gate 1 and Gate 3 (`scripts/engine/pretooluse-mutation-guard.js`) split a write target by the
host's own path separator. On Linux and macOS a backslash is a filename character, so a root-level
file whose name holds one is judged as that one file: `docs\x.js` and `.aiwf\x.js` no longer pass
Gate 3 as the docs or scratch class, and a root file named `..\x.js` is no longer read as outside
the project by either gate (the main session's passthrough and the non-writer branch's). On Windows
the backslash stays a separator and every decision is the same as before.

The two read-only bash wrappers (`scripts/native/sh/codex-review.sh`, `codex-qa.sh`) check for a
brief on stdin beside `--brief-file` through one `node` call instead of `read -N`, a bash builtin
option that bash 3.2 - the macOS default shell - does not have: there the read failed, stdin looked
empty and no ambiguity was ever refused. The bound is unchanged - 64 KiB or 2 seconds, whichever
comes first - and a check that could not run is a refusal, never a pass. The PowerShell mirrors are
untouched.

The macOS proof is the CI leg on the pushed commit; no bash 3.2 host ran it before the release.

## What this migration does

- One `note` (`posix-path-identity-0-3-23`): `/pnp:update` prints it with the CHANGELOG block.

## What it leaves alone

Every rendered file, every config key, the ask-ruleset, the agents and every operator-owned file.
