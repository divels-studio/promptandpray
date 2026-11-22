# HANDBACK-003 - the COO's reading of the whole diff (2026-11-22, against HEAD 8c1e569; no audit pass)

Files: `scripts/selfcheck/aiwf-selfcheck.js`, `.claude-plugin/plugin.json`, `migrations/index.json`,
`migrations/0049_selfcheck-posix-rows/{ops.json,NOTES.md}` (the Writer); the `CHANGELOG.md` block
`## [0.3.24]` and the `README.md` version line (the COO). No production line.

## Why the ticket exists

CI run 45021800616 on the 0.3.23 commit: ubuntu and macos red on the example-cycle step, `1807/1809` on
both. The nine macOS rows red before 0.3.23 (the `bf-*` probes and controls) are green there - the node
bound is proven on bash 3.2. The two red rows are `(p2)` of GATE 3 SURFACE and GATE 3 PLANNING: they
expected DENY on POSIX for a root-level name holding backslashes and ending in `.md`, the class the COO's
ruling in HANDBACK-002 opened. The COO's discovery for HANDBACK-002 did not find them: its consumer grep
covered the two functions' callers and the rows that call them directly, not the spawned platform rows
whose POSIX branch asserts the old decision and which are green on win32. The auditor's pass ran on the
same Windows host and could not see them either.

## The three rows, read against scripts/engine/pretooluse-mutation-guard.js for each platform

- (p2) surface, `dev\backlogs\CANDIDATES.md` against `CONF` -> allow everywhere. win32: three segments,
  not on the fixed allowlist, allowed as the configured transfer surface (`isTransferSurface`). linux and
  darwin: one segment ending in `.md`, allowed by `isAllowlisted`'s root-`*.md` rule before any surface test.
- (p2b), the same target against `REFUSED` (configured surface `src/app.ts`, refused as not `.md`) ->
  DENY on win32 (a nested path, no surface, not the roadmap, not under drafts or readiness), allow on
  linux and darwin by the same root-`*.md` rule - which shows the POSIX allow of (p2) is not the surface's.
- (p2) planning, `dev\backlogs\drafts\PX\x.ts` against `CONF` -> allow on win32 (a file under the drafts
  folder, `isUnderDir`), DENY on linux and darwin (one root-level name, not `.md`, not under any folder).
Each row can fail: (p2) by a deny, (p2b) and the planning row by the opposite decision per platform.
Red-then-green cannot be shown on this host - the POSIX branches never execute on win32; the proof is CI
on the pushed commit, and the two rows were seen red there before the change.

## Deviations

- The planning label gained "one root-level file name, not *.md": wording, accepted.

## VERIFY at the handoff (one parallel batch, logs in the session scratchpad `v3-*.log`)

See the ledger row for the three exit codes and summary lines.

## Prose delta (the fact-check's suppression dual: a few lines, the COO's own first-hand read)

The comments and labels of the three rows, the migration NOTES and note, the CHANGELOG block: every
pointer in them (the section names, the row names `(p2)` / `(p2b)`, `1807/1809`, the REFUSED fixture's
surface) was opened by the COO in the diff, the CI log or the source.
