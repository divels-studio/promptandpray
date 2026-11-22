# HANDBACK-002 - the COO's reading of the whole diff (2026-11-22, against HEAD 5c651bf)

Files in the diff (`git status --short`): `.claude-plugin/plugin.json`, `migrations/index.json`,
`migrations/0048_posix-path-identity/{ops.json,NOTES.md}`, `scripts/engine/pretooluse-mutation-guard.js`,
`scripts/native/sh/codex-review.sh`, `scripts/native/sh/codex-qa.sh`, `scripts/selfcheck/aiwf-selfcheck.js`;
plus the COO's own `CHANGELOG.md` block and `README.md` version line. Nothing outside the brief's § Scope.

## Acceptance criteria - the defect each proof would see, and what it reads

1. No both-slash split in the two functions - a POSIX root file `docs\x.js` passing Gate 3, or `..\x.js`
   read as outside: `git grep -n "split(/\[" -- scripts/engine/pretooluse-mutation-guard.js` (reads the
   guard source; the two remaining hits are the config-value splits in `containedSurface` / `containedPath`).
2. The ten direct rows + two controls + one spawned row - the same defect, proven on any host: rows
   `g3-al-*` read `isAllowlisted(rel, pathImpl)`'s return, rows `g1-pr-*` read `projectRelative(...).outside`;
   `g3-ctl-al-sep` / `g1-ctl-pr-sep` put the old split back in a patched copy and require the posix-bslash
   row to turn red; the spawned `docs\x.js` row reads the hook's decision and, off win32, the `gate 3` mark.
3. No `read -N`, controls re-anchored - an ambiguity accepted or an open stdin hanging the run: the eight
   `bf-*` probes per wrapper read exit code, the stub's invocation marker, stderr and the state files; the
   four re-anchored controls patch the `text)` / `cap)` branches, the `setTimeout` line and the node call.
4. `validate-payload` exit 0 - a manifest whose last entry is not the payload version, or a malformed op.
5. Scope - a file outside the list: `git status --short`.

## Reading

- Guard: `isAllowlisted(rel, pathImpl = path)` and `projectRelative` use `pathImpl.sep` / `pathImpl.isAbsolute`;
  the one hook caller of each keeps the default; `projectRelative` exported; no deny text, no fail direction
  touched. Win32 behaviour is unchanged by construction: `path.win32.relative` returns backslash-separated
  segments, and the old regex split them the same way.
- Wrappers: one `node -e "$STDIN_BOUND_JS"` call, words `cap` / `text` / `empty`, anything else a refusal
  (node missing or non-zero through `||`, another word through `*)`). The JS holds no single quote, exits by
  itself through `process.exit` after the write, and counts BYTES against the cap. The two wrappers carry the
  same block. No bash-4+ construct in the change.
- Self-check: rows and controls as briefed.

## Deviations the Writer reported, and the COO's rulings

1. `g1-ctl-hb-sep` re-anchored (not in the brief): correct and necessary - `pgPatch` replaces the first
   match, and `isAllowlisted` now holds the same split text earlier in the file. A miss of the brief's
   worklist, caught by the Writer.
2. "Whitespace" in the node snippet is the ASCII set of `has_text`'s `[:space:]`: accepted - the stricter
   reading, a lone no-break space or byte-order mark on stdin is refused.
3. The `bf-cap` comment rewritten: accepted - "never read" stopped being true.
4. The brief contradicted itself: its risk threshold said the change "only narrows on POSIX", while row
   `g3-al-posix-bslash-md` requires a POSIX root file `notes\x.md` to pass (denied before as two segments).
   Ruling: the row is right and the threshold sentence was wrong. On POSIX that target IS one root-level
   `*.md` file, the class the allowlist has always opened; judging it by the host's path identity is the
   outcome the ticket states. The brief's threshold is corrected to say so; the Reviewer is told.

## VERIFY at the handoff (the COO's run, one parallel batch, logs in the session scratchpad `verify-*.log`)

- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .` exit 0 - `1808/1808 assertions passed` (baseline at HEAD: `1795/1795`)
- `node scripts/spike/run-spikes.mjs` exit 0 - `checks: 484, failures: 0`
- `node scripts/update/test-update.mjs` exit 0 - `checks: 495, failures: 0`
- `node scripts/update/validate-payload.mjs --plugin-root .` exit 0 - `valid: 48 migration(s)`, payload version 0.3.23
- Provenance grep over the payload folders plus README.md and CHANGELOG.md: no hit.
- Narrowed tests: a grep of the diff's added lines for skip / only / todo returned nothing (no decision owed).

## Fact-check gate (one sonnet scan over the diff's prose, cross-reference claims)

`CLAIMS: total=89 verified=78 false=0 unverifiable=11`. The eleven UNVERIFIABLE rows are two kinds, closed
by the COO: (a) statements about bash 3.2 itself (`read -N` absent, the old read failing there) - held on
the macOS CI log of run 45007124740, whose nine red rows are exactly the three ambiguity probes of each
wrapper and their controls, and stated in the tree as the cause, never as a local measurement; (b) "which
host ran it before the release" - true by this record (a Windows host only), and the texts say the linux
and macOS proof is CI. One sentence was a claim ahead of its proof - the migration note's "so the ambiguity
refusal works on the macOS default shell too" - and went back to the live Writer as a fact-check
micro-round: reworded to what the code does (the check no longer depends on the bash version).

## Auditor pass 1 (Codex gpt-6.1-sol / xhigh, cold, code class) - `pass`

No findings. The whole diff, both migration files, every new row and every re-anchored control read; its own
probes confirmed unchanged win32 decisions, the one permitted POSIX widening (the COO's root-level `*.md`
ruling held consistent with POSIX path identity), the bounded stdin handling, the fail-closed check and
effective fault controls; `validate-payload` passed for 0.3.23. Residual gap it names: native Linux / macOS
and bash 3.2 execution awaits the post-push CI, as the project's policy permits. Session
01a2031c-13ec-74b1-8833-4956eecdb8d1; the run log under the temp `pnp-codex` folder,
`HANDBACK-002-code-20261122-135452-22356.log`. No correction round.

## Out-of-scope findings (for the close)

- `README.md` § Status still says macOS carries "one measured defect ... the self-check's captured output
  truncates"; `dev/VERIFY_RUNBOOK.md` § CI records that class fixed since v0.2.7, and the macOS log of run
  45007124740 prints the tally. `.github/workflows/ci.yml` carries the same sentence in the macos job comment.
