# GATES-004 [R2 code] - the review and QA wrappers: the stream to a log, the verdict from `-o`, capacity and tokens lines

Implements: D-05, D-06, D-07, D-08, D-09, D-11.
COO: Opus - because all four no.
Branch: `main`. Scope guard: `HEAD <hash>` at the dispatch. Depends on: GATES-003 committed (the
selfcheck is a shared file, D-10).

## Outcome

`codex-review` and `codex-qa`, in `.ps1` and `.sh` and flag for flag, stop passing the engine's
stream through. Each run sends codex's stdout and stderr to one log file of its own outside the
repository, and prints as its stdout the `-o` last message, byte for byte and nothing else. On stderr
it writes the header line, then after the run the tokens line, the capacity line when it applies, the
no-verdict line when codex left no `-o` file, the log line and the footer line, in that order. Both
wrappers carry this one output contract (D-05..D-08). The PS redirect form is the one a byte test
measured (D-09), and the exit code stays codex's.

## Scope

The worklist; every row at its `file:line`.

- D0 FIRST, before any edit (D-07, D-09), outside the repository, in two steps:
  (1) the byte test of the PS 5.1 redirect form - a deterministic emitter, one `node -e` printing known
  bytes on stdout and on stderr (non-ASCII UTF-8, CRLF and LF line ends, a line longer than the
  console width), run under PS 5.1 `*> <dir>/emit.log`, the log hex-compared against the expected
  bytes; `*>` is the only form tested - when it preserves the bytes it is the wrapper's form, when
  it does not the ticket STOPS here and hands back the hex diff, the fallback being a later decision
  (D-09, DECISIONS § Deferred); never `Start-Process` (it cannot put both streams in one file);
  (2) the codex run - on `gpt-5.6-sol` at effort low, one cold `codex exec` on a one-line prompt
  (`--sandbox read-only`, `-o <dir>/last.txt`) and one `codex exec resume <id> ... -o <dir>/last2.txt
  -`, stdout and stderr captured to separate files: it measures only the stream and exact text of
  `tokens used` on cold and on resume, and whether a capacity line appears. The `-o` file is the
  verdict; "wrapper stdout == `-o` bytes" is a selfcheck probe over the stub (D4), not a live
  comparison. Hand back both steps' output for the ticket's record (D-07).
- D1 `scripts/native/ps/codex-review.ps1`: `-o <last-message file>` in `$codexArgs` `:265-272` and
  `$resumeArgs` `:281-289` (before the trailing `-`); per run, the log
  `$env:TEMP\pnp-codex\<key>-<class-or-role>-<timestamp>-<pid>.log` and the `-o` file beside it with
  the same stem - `<pid>` is `$PID`; the key is the one of `:183-212`, and a brief with no key gets no
  key segment in either name, as the state file has none `:217-222`; the files belong to the run that
  created them, the name unique by timestamp plus PID, no lock (D-05, QAL's `<ts>-<guid>` precedent);
  the directory created as QAL does (`codex-qal.ps1:91-109`); the invocation `:470` redirected by D0's
  form; after `$code` `:471`: the `-o` bytes raw to stdout and nothing else on stdout - the
  `Write-Warning` of `:372` moves to stderr; then on stderr the tokens line (D-07), the capacity line
  (D-06), with no `-o` file `codex-review: no verdict - the engine wrote no final message; log <path>`
  (stdout then empty, D-05), `codex-review: log <path>`, the footer `:474-479`; `exit $code` `:480`
  unchanged; the comment `:443-449` rewritten to D0's measured fact; new dynamic fields through
  `Sanitize-HeaderField` `:462-465`; ASCII only. The session-state file gains no new write path: the
  save / clear path stays as it is (RESEARCH facts 16-18), and two runs with one key at once remain
  what they are today, the operator-held invariant of `ORCHESTRATOR.md` § Branch policy (one
  executing session per tree; a plan pass has its own key) - named, not changed (D-05). The launch
  line keeps today's argv array (the flag locks), so no character rule on model, effort, key, class
  or resume id is added (D-09).
- D2 `scripts/native/sh/codex-review.sh`, flag for flag: `CODEX_ARGS` `:298-305`, `RESUME_ARGS`
  `:314-326`, the invocation `:482` to the one log, `${TMPDIR:-/tmp}/pnp-codex/` (`codex-qal.sh:147`)
  with the same per-run names, `<pid>` = `$$`; the footer `:484-489`, `exit "$status"` `:490`, the
  comment `:349-355`, `header_field` `:474-476`; the same no-key rule and the same session-state
  sentence as D1 (save / clear path RESEARCH fact 17); the argv array kept, no character rule
  (D-09); LF only.
- D3 the QA twin (D-08): `codex-qa.ps1` `:252`, `:268`, `:403-411`; `codex-qa.sh` `:279`, `:305`,
  `:425-428`; every line of D1 / D2 prefixed `codex-qa:`, role segment `qa`. Its save / clear path is
  mapped in RESEARCH facts 21a (`.ps1`: `Save-CodexSessionId` `:336` (the function) and `:389` (its call), the state write `:383`,
  `Clear-CodexSessionState` `:319-334` with its `Write-Warning` `:333`) and 21b (`.sh`:
  `record_session_id` `:402-423`, the write `:418`, `clear_session_state` `:385-400`) and stays as it
  is - the warnings of `:385` and `:333` move to stderr with D1's rule. The three additions are those
  facts' differences from the review wrapper: the header line (review `ps1:466-468`, `sh:477-479`),
  the footer line (review `ps1:474-479`, `sh:484-489`) and the recorded-id variable the footer reads
  (review `ps1:423,469`, `sh:454,480`), set where 21a / 21b record the id. As in D1 / D2, the
  argv array is kept and no character rule is added (D-09).
- D4 `scripts/selfcheck/aiwf-selfcheck.js`: the stream-purity pins `:3394-3401`, `:3900-3903` and
  their controls `:3658`, `:4605-4606` replaced by D-05's two (nothing between codex and the log; the
  wrapper's stdout equals the `-o` file), each with a named-fault control; flag locks `:3099-3220`,
  `:3770-3960` gain `-o`; the header probes `:5502-5523` and `hdrVerdict` `:5524-5536` read stdout
  against the `-o` bytes on every probe - the PS `psWarnsOnStdout` exception (`:5518`, `:5530-5533`)
  flipped: the warning is asserted on stderr, stdout exactly the `-o` bytes; the tokens, capacity,
  no-verdict and log lines in D-05's order; two runs with one key name two distinct log paths; the
  existing probes with newline-bearing model / effort values (`W-hdr-role`, `W-hdr-inject`,
  `:5516-5522`) stand untouched (round-3 B7, D-09); the same probes for `codex-qa`; the resumed-id parse `:4343` and the one-footer count `:5534` stand; the
  sh channel list `:3826` and the `.EXAMPLE` allowlist `:7941-7943` follow any change.
- D5 the stubs: sh `:4487-4502`, ps `:3576-3605` write a known last message to the path after `-o`
  and print a `tokens used` line on the stream D0 measured; a capacity control (the text on stderr,
  exit 1), a control with no tokens line (`tokens used: not printed by the engine`) and a no-verdict
  control (no `-o` file written: empty stdout, the `no verdict` line before the footer).
- D6 prose: `docs/CODEX_REVIEW_QA_RECIPE.md:112-121`, `~187-196`; `skills/review/SKILL.md:475-478`;
  `skills/qa/SKILL.md:338-339`; `skills/plan/SKILL.md:223-226`; `scripts/native/README.md:24-28`.
- D7 unchanged: `codex-qal.ps1` / `.sh` (D-08); the launch prefix `skills/review/SKILL.md:360-368`;
  Step 6's redirect and `^BLOCKERS:` grep `skills/plan/SKILL.md:205-221`; the state files and their
  save / clear path; the roles resolver.

## Acceptance

From the repository root; the output after the dash means broken.

- FIRST, D0 step 1 in the hand-back: the emitter's expected bytes and the `*>` log's hex - absent, or
  the log differing from the expected bytes by one byte with the ticket not stopped there (D-09).
- SECOND, D0 step 2 in the hand-back: the cold and the resumed run's separate stdout / stderr - absent,
  or without the stream and exact text of `tokens used` for each, or without the capacity finding.
- `git grep -c -F "tokens used" -- scripts/native/ps/codex-review.ps1 scripts/native/sh/codex-review.sh scripts/native/ps/codex-qa.ps1 scripts/native/sh/codex-qa.sh`
  - a file with no hit; the same with `-F "at capacity"`, `-F "pnp-codex"`,
  `-F "not printed by the engine"`, `-F "no verdict - the engine wrote no final message"`.
- `git grep -c -F -e "codex-qa: run " -e "codex-qa: exit " -- scripts/native/ps/codex-qa.ps1 scripts/native/sh/codex-qa.sh` - a file with fewer than 2.
- `git grep -c -F '$PID' -- scripts/native/ps/codex-review.ps1 scripts/native/ps/codex-qa.ps1` and
  `git grep -c -F '$$' -- scripts/native/sh/codex-review.sh scripts/native/sh/codex-qa.sh` - a file
  with no hit.
- `git grep -n -F "psWarnsOnStdout: true" -- scripts/selfcheck/aiwf-selfcheck.js` - any hit.
- `git grep -n -F "Start-Process" -- scripts/native/ps/codex-review.ps1 scripts/native/ps/codex-qa.ps1` - any hit.
- `git grep -n -E "\| *tee( |$)" -- scripts/native/sh/codex-review.sh scripts/native/sh/codex-qa.sh` - any hit.
- `git grep -n -E "& codex .*\| *(ForEach-Object|Tee-Object|Out-)" -- scripts/native/ps/codex-review.ps1 scripts/native/ps/codex-qa.ps1` - any hit.
- `git grep -nP "[^\x00-\x7F]" -- scripts/native/ps` - any hit.
- `git diff --name-only HEAD -- scripts/native/ps/codex-qal.ps1 scripts/native/sh/codex-qal.sh` - any line;
  `git diff -U0 HEAD -- skills/review/SKILL.md` - a hunk header inside `:354-368` (the launch prefix).
- The selfcheck run of § Verify - exit != 0, or a probe of D4 / D5 absent: stdout equal to the `-o`
  bytes; the stderr lines in D-05's order; the capacity control printing `engine refused: capacity`
  with exit 1; the no-tokens control; the no-verdict control (empty stdout, the `no verdict` line
  before the footer); the unidentified-session probe with the warning on stderr and stdout exactly
  the `-o` bytes; two same-key runs naming two distinct logs; the `codex-qa` twins; each with its
  named-fault control.
- The validate-payload run of § Verify - exit != 0.
- The provenance grep of `dev/PROJECT_OVERRIDES.md:156-157` - any hit.

## Risk threshold

Blocks: the wrapper's stdout carrying anything but the `-o` bytes (a warning included); a
`Start-Process` invocation (D-09); a log or the `-o` file inside the repository, or one shared by two
runs; a lock or a new write path on the session-state file (D-05); a byte between codex and the log;
an exit code other than codex's (the pre-engine refusals still 2); the read-only posture or the
stdin-only prompt changed (the flag locks); the `.ps1` / `.sh` mirror broken; a non-ASCII byte in a
`.ps1`, a CR in a `.sh`; an increment computed or stored (D-07); QAL or a state file changed (D-08); a
parse pattern not written from D0's run. Notes: comment wording, the timestamp format of the log name
(one format in both channels).

## Stop condition

Stop and hand back before any edit when: the emitter test under `*>` does not preserve the bytes (the
hex diff in the hand-back; the fallback is a later decision, D-09); `tokens used` is on neither
stream; `-o` is refused by `codex exec resume`. Stop when a file outside the Code Map must change. Stop after the hand-back; the
commit follows the review, on the operator's click.

## Verify

D-11's wrappers row (overrides § Test policy; the stubs live in the selfcheck): `selfcheck` (`node
scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .`) and `validate-payload`
(`node scripts/update/validate-payload.mjs --plugin-root .`), cwd `.`, once, by the COO in the
background at the hand-back. Portion 1 only (Portion 2 is not a release gate); runbook
`dev/VERIFY_RUNBOOK.md`; logs outside the repository; a run over ~5 minutes in the background with a
3600000 ms timeout. The Writer runs only D0 and the tests it adds, red then green.

## Code Map

| path | role |
|---|---|
| `scripts/native/ps/codex-review.ps1` | D1 |
| `scripts/native/sh/codex-review.sh` | D2 |
| `scripts/native/ps/codex-qa.ps1`, `scripts/native/sh/codex-qa.sh` | D3 |
| `scripts/selfcheck/aiwf-selfcheck.js` | D4, D5 |
| `docs/CODEX_REVIEW_QA_RECIPE.md` | D6 |
| `skills/review/SKILL.md`, `skills/qa/SKILL.md`, `skills/plan/SKILL.md` | D6 |
| `scripts/native/README.md` | D6 |

## Amendment D-12 (2026-11-06, after D0)

D0 step 1 stopped the ticket: under PS 5.1 `*>` the 447 expected bytes became a 1796-byte log
(UTF-16LE + BOM, mojibake, LF->CRLF, NativeCommandError records). The COO chose the capture
fallback as D-12 (DECISIONS); D0 step 2's facts are the parse source (`tokens used` on stderr only,
two lines, the figure comma-grouped on the second; `-o` accepted on resume; no capacity line
observed - D-06's text stands unmeasured). The frozen sections above stay; these rows change them:

- Scope D1 / D3 (PS only): the invocation is `$Prompt | & node <$PSScriptRoot helper> --log <log> --
  @codexArgs` (resume: `@resumeArgs`), not a `*>` redirect; `$code = $LASTEXITCODE` as today; the
  comment at `:443-449` (HEAD 03e1309; now `codex-review.ps1:473`, `codex-qa.ps1:434`) states D0's
  measured fact and D-12. Everything else of D1 / D3 stands. The sh
  wrappers keep `> "$log" 2>&1`; both channels' comments name the capture mechanism as the one
  documented channel difference.
- Scope D-12: new payload file `scripts/native/codex-capture.mjs` - zero dependencies, ESM, ASCII,
  LF; `node codex-capture.mjs --log <path> -- <codex args...>`; one log fd, `stdio: ['inherit', fd,
  fd]`, `shell: false`, argv an array, nothing on its own stdout, exit = codex's (signal -> 1);
  codex resolved by `PATH` x `PATHEXT` (`.COM;.EXE;.BAT;.CMD` when unset), `.exe` / `.com` spawned
  directly, a `.cmd` / `.bat` read as the npm shim (`<dir>\node.exe` else `process.execPath`, on
  `<dir>\node_modules\@openai\codex\bin\codex.js`), `.ps1` skipped, a `.cmd` never spawned;
  unresolvable -> `codex-capture: cannot resolve codex (<reason>)` on stderr, exit 2, no log.
- Scope D4 / D5: the PS stubs are laid out so the helper resolves them; added (a) the helper's byte
  probe (D0's emitter bytes on both streams through the PS wrapper, the log hex-equal to stdout part
  then stderr part) with a named-fault control; (b) the unresolvable control (PATH without codex ->
  exit 2, the `cannot resolve codex` line, no log); (c) a second resolution form when the stub
  layout allows it cheaply. The PS flag locks read the `$codexArgs = @( ... )` block through
  `argBlock(s)` (`scripts/selfcheck/aiwf-selfcheck.js:3303`); only the `STDIN_CAPTURE` check
  (`aiwf-selfcheck.js:3310`) pins that this argv follows the helper's `--`.
- Acceptance, added (the helper is untracked until staged: run its two rows with `--untracked` or
  after staging):
  - `git grep -n -F "*>" -- scripts/native/ps/codex-review.ps1 scripts/native/ps/codex-qa.ps1` - a hit on an executable line;
  - `git grep -n -E "shell: *true|execSync|exec\(" -- scripts/native/codex-capture.mjs` - any hit;
  - `git grep -nP "[^\x00-\x7F]" -- scripts/native/codex-capture.mjs` - any hit.
  The existing rows stand.
- Risk threshold, added (blocks): a shell string anywhere in the launch; the helper writing to the
  repository; a byte added, dropped or reordered within one stream between codex and the log; a
  `.cmd` spawned.
- Code Map, added: `scripts/native/codex-capture.mjs` (D1, D3, D-12); a touch of validate-payload,
  the plugin manifest, the provenance allowlist or `scripts/native/README.md` that must name the new
  file is in scope; any other file outside the Code Map = stop and hand back.
