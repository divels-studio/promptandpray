# GATES-004 - the review and QA wrappers: the stream to a log, the verdict from `-o`, capacity and tokens lines

## What landed

`6984415` (code, Writer, `Refs: GATES-004`; 13 files, +1292/-240):
- `scripts/native/codex-capture.mjs` (new, D-12) - the PowerShell channel's capture helper:
  `--log <path> -- <codex args>` spawns codex with `stdio: ['inherit', fd, fd]`, `shell: false`, argv an array,
  the log created exclusively (`wx`) after codex resolved; `--print <file>` emits the `-o` bytes as a native
  process; codex resolved from PATH x PATHEXT without a shell (`.exe`/`.com` directly, a `.cmd`/`.bat` read as
  the npm shim and its `node_modules/@openai/codex/bin/codex.js` run by node, `.ps1` skipped, a `.cmd` never
  spawned); unresolvable -> `codex-capture: cannot resolve codex (<reason>)`, exit 2, no log.
- `scripts/native/ps/codex-review.ps1`, `codex-qa.ps1` (D1, D3) - the run log and `-o` file per run under
  `<temp>\pnp-codex\<key>-<class|reviewer|qa>-<yyyyMMdd-HHmmss>-<pid>`, `-o` on the cold and the resume argv,
  codex run through the helper, stdout = the `-o` bytes and nothing else (both warnings moved to stderr),
  stderr lines run / tokens / capacity / no-verdict / log / exit in that order, exit = codex's.
- `scripts/native/sh/codex-review.sh`, `codex-qa.sh` (D2, D3) - the same contract, `> "$LOG_FILE" 2>&1`,
  `${TMPDIR:-/tmp}/pnp-codex/`, `$$`; the QA `record_session_id` sets RECORDED_ID.
- `scripts/selfcheck/aiwf-selfcheck.js` (D4, D5) - the stream-purity pins redefined, `stdout-verdict` and
  `last-message` pins added; the npm-shim stub layout; section 5d (the output contract on both channels,
  W-/Q- probes, 13 named-fault controls per wrapper per channel; `psWarnsOnStdout` gone); section 5e (the
  helper: cap-static / resolve / exe / unresolvable / exclusive / bytes, each with a control).
- Prose (D6): `docs/CODEX_REVIEW_QA_RECIPE.md`, `skills/review/SKILL.md`, `skills/qa/SKILL.md`,
  `skills/plan/SKILL.md` (Step 6 reads the verdict from the `-o` file - correction round 1),
  `scripts/native/README.md`.
- The plan: `DECISIONS.md` D-12 and § Deferred's fallback bullet `taken up -> D-12`; `tickets/GATES-004.md`
  § Amendment D-12.
- Unchanged (D7): `codex-qal.ps1` / `.sh`, the review launch prefix, the session-state save / clear path, the
  roles resolver.

The live copy `D:\pnp-live` was refreshed to `6984415` after the commit. Reaches installations with GATES-005's
release 0.3.12 (D-10).

## Decisions and deviations

- **D0 stopped the ticket, as designed (D-09).** Step 1, the byte test under Windows PowerShell 5.1.26100.9444:
  the emitter wrote 447 bytes (stdout: an LF line, non-ASCII UTF-8 `café λ € U+1F600` + CRLF, 300 x `L` + LF, a
  CRLF line, an LF line - 383 bytes; stderr: an LF line, `naïve €` + CRLF, `tokens used` / `12,345` - 64 bytes);
  `*> emit.log` produced 1796 bytes differing at offset 0 - `ff fe 73 00 74 00 ...` (UTF-16LE with a BOM), the
  UTF-8 decoded through the console code page (`c3 a9` -> `1c 25 39 04`), every LF -> CRLF, and the first
  stderr line wrapped in a NativeCommandError record (`node.exe : stderr LF line`, `At ...:3 char:1`,
  `CategoryInfo`, `FullyQualifiedErrorId : NativeCommandError`).
  Step 2, codex-cli 0.156.1, gpt-5.6-sol at effort low, read-only, streams captured to separate files: cold
  run exit 0, stdout `OK\n`, `-o` file `OK` (no trailing newline), stderr (445 bytes, LF only) ends
  `codex\nOK\ntokens used\n3,506\n`; resume of session `01a1b120-4d88-72d3-a57d-6bde247ca82a` with `-o` exit 0,
  stdout `AGAIN\n`, `-o` file `AGAIN`, stderr (321 bytes) ends `codex\nAGAIN\ntokens used\n5,393\n`. Findings:
  `tokens used` on stderr only, two lines, the figure comma-grouped on the second; `-o` accepted on resume; no
  capacity text on either stream. The Writer added `--skip-git-repo-check` for the scratch directory
  (measurement only). Evidence files: the session scratchpad `gates004-d0\` (outside the repository).
- **D-12 (COO decision on the measurement):** the PS channel captures through the node helper; the .NET Process
  candidate needs cmd.exe argument parsing to launch the npm shim `codex.cmd`. The sh channel keeps
  `> "$log" 2>&1`; the capture mechanism is the one documented channel difference.
- **Writer deviations, accepted by the COO:** the helper's `--print` mode (the wrapper's stdout must be native
  bytes); the capacity line only on a non-zero exit (codex echoes the brief into the log, so a brief quoting
  "at capacity" would fake a refusal); the exit line without its leading line break; `GetTempPath()` without
  `$env:TEMP`; the tokens figure printed as written; an existing log refused with exit 2; `WARNING: ...` on
  stderr; the sh QA `||` -> `if`.
- **The capacity text is D-06's recorded one** ("Selected model is at capacity"), not measured - D0 saw none.
- **Correction round 1 (prose, on the operator's ruling):** `/pnp:plan` Step 6 launches the wrapper with no
  stdout redirect and reads the verdict with Grep from the `-o` file `<stem>.last.txt` beside the log the
  `codex-review: log <path>` line names; `<ABBR>-readiness-round.txt` is gone. The ticket's D7 had frozen that
  redirect; the operator lifted it (readiness ledger, ruling row of 2026-11-06).
- Pointers: the ticket's selfcheck pointers predated GATES-001..003's shift (+151 to +193 lines); the brief
  named the moved lines. The ticket's `codex-qa.sh:305` for RESUME_ARGS is `:295-303`.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-11-06 | overrides § Test policy "Logs of any run go OUTSIDE the repository" | violation | the Writer's side-measurement of `--` ran `node -e <js> --log ...` from the repository root; node read `--log` as its V8 flag and wrote four `isolate-*-v8.log` files into the root; the Writer reported them, the COO deleted them through the delete dialog before VERIFY |
| 2026-11-06 | `/pnp:review` Step 2b (the fact-check gate) | catch | 2 FALSE claims in the ticket's Amendment text (a pre-edit line pointer; the PS flag locks said to read the argv after `--`) fixed by a Writer micro-round before the pass |
| 2026-11-06 | `ORCHESTRATOR.md` § Escalation trigger 4 | catch | the auditor's P2 blocker against a redirect the ticket had frozen; the COO did not implement or reject it on its own - escalated to the operator, who ruled (readiness `ledger.md`) |

## Verification (what actually ran)

COO, Portion 1, logs outside the repository (session scratchpad `verify-gates004\`):
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 0,
  `==== 1756/1756 assertions passed ====`; `[cap-bytes]` log 447 bytes, equal true; `[ctl-cap-bytes]` FAIL as
  required (453 bytes, first difference at byte 14); every W-/Q- output-contract probe and control on both
  channels. Its PowerShell host is `pwsh` first (`aiwf-selfcheck.js:208-215`): the executed PS probes ran on
  PowerShell 7 here.
- `node scripts/update/validate-payload.mjs --plugin-root .` exit 0, `valid: 36 migration(s) in
  D:\promptandpray, payload version 0.3.11` - at the hand-back and again after correction round 1.
- Acceptance greps (`acceptance.log`): `tokens used` 6, `at capacity` 3, `pnp-codex` 3, `not printed by the
  engine` 1, `no verdict - ...` 1 in each of the four wrappers; `codex-qa: run `/`exit ` 3 in each QA wrapper;
  `$PID` / `$$` 1 each; no hit for `psWarnsOnStdout: true`, `Start-Process`, `| tee`, a pass-through after
  `& codex`, non-ASCII in `scripts/native/ps`, `*>` in the PS wrappers, `shell: true|execSync|exec(` or
  non-ASCII in the helper; 0 CR in the sh wrappers and the helper; no QAL diff; the only skills/review hunk at
  `@@ -476`; `git diff --check` exit 0; the provenance grep no hit (exit 1, also after round 1).
- COO runs closing the fact-check's unverifiable rows: `powershell.exe ... $PSVersionTable.PSVersion` ->
  `5.1.26100.9444`; the helper under powershell.exe with an empty PATH -> exit 2, `codex-capture: cannot
  resolve codex (no codex.exe, codex.com, codex.cmd or codex.bat on PATH)` (so 5.1 passes `--`);
  `Get-Command codex -All` -> `codex.ps1` (ExternalScript), then `codex.cmd`.
- Fact-check gate (`/pnp:review` Step 2b, one Explore agent on sonnet, stopped once on the operator's pause
  and resumed): `CLAIMS: total=261 verified=248 false=2 unverifiable=11`.
- Auditor: Codex code pass 1 (gpt-6-sol / xhigh, cold, session `01a1b17f-4910-70e3-bd15-32fe749da13e`), covered
  by the operator word "ok" (2026-11-06): `fail`, one P2 blocker - `/pnp:plan` Step 6 redirected the PS wrapper
  with `>`, which Windows PowerShell 5.1 writes as UTF-16LE. Notes: the helper swallows a SIGINT sent to it
  alone (`codex-capture.mjs:124`); the two token figures do not by themselves prove D-07's "cumulative".
  `tokens used 131,639`. The review brief: `GATES-004-review-brief.md` beside this record.
- Correction round 1 (prose only) - no verification pass (`ticket.md` § Loop shape: a prose-only round): the
  COO's first-hand check of the ~15-line delta against `codex-review.ps1:240-246`, `:575`,
  `codex-review.sh:565`; `git grep -F "readiness-round" -- skills docs templates scripts README.md` no hit.

## Remaining debt

None. Two notes stay notes on the operator's word (dialog at the close, "Не ги записвай"): the selfcheck runs
the executed PS probes on pwsh 7 when present, so PS 5.1 is proven by D0 and the COO's manual runs only; and the
helper ignores a SIGINT sent to it alone.

## Diff review

- Read whole: the helper (150 lines), the four wrappers, the selfcheck diff, the prose, the plan writes.
- Per acceptance criterion, the defect each proof sees: a missing contract line -> a wrapper with 0 on the
  `tokens used` / `at capacity` / `pnp-codex` / `not printed` / `no verdict` counts; QA twin lines missing ->
  fewer than 2; a missing PID segment -> 0 on `$PID` / `$$`; the old stdout exception -> a
  `psWarnsOnStdout: true` hit; a forbidden launch form -> a `Start-Process` / `tee` / pass-through / `*>` hit; a
  shell in the helper -> a `shell: true|execSync|exec(` hit; a byte between codex and the log -> `cap-bytes` and
  the `*-exec-*-bytes` probes red; stdout not the `-o` bytes, lines out of order, a capacity / no-tokens /
  no-verdict miss, one log shared -> the W-/Q- probe red; a vacuous probe -> its control "still PASS".
- Narrowed-test grep: 2 hits (`f.skip`, `target.skip`) - the `cap-exe` probe is a Windows form printed as a
  `[NOTE]` on a POSIX host; not a narrowing.
- Notes: the sh wrappers refuse an existing log by a `[ -e ]` test (the name carries timestamp + `$$`, unique
  among live processes); the PS prompt still reaches codex through the PS stdin pipe, unchanged.

## Scratch

- `.aiwf/GATES-004-diff-review.md` - folded into § Diff review, § Verification and § Decisions above, then
  deleted.
- `.aiwf/GATES-004-review-brief.txt` - moved verbatim to `records/GATES-004-review-brief.md`, then deleted.
- `.aiwf/last-review-session.GATES-004.txt` - its one line (the session id) stands in § Verification above,
  then deleted.
- `.aiwf/checkpoint.md` and `.aiwf/route-state.json` (cleared to `{}`) stay.

## Closing checklist

- the operator's own run on a real input: n/a - no product UI; the wrappers' behaviour is proven by the
  selfcheck probes and D0's measured run;
- the diff review folded in above: yes;
- the ticket's finding lines on ROADMAP § CODEX (F6 the stream to a log, F9/F23 the cumulative tokens label,
  AIOCR-001 the capacity line) marked `done 6984415`;
- out-of-scope findings: the two notes above, not registered on the operator's word;
- scratch: § Scratch above;
- the next ticket: GATES-005 (the release 0.3.12) in a fresh session - the COO session is at 320,000 tokens,
  near the ~400k ticket boundary.

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 1 | 320,000 tokens (32% of 1,000,000) | `~/.claude/ctx/d66182c6-af54-42f8-9eda-e0fcdd8ed037.pct` and `.size` |
