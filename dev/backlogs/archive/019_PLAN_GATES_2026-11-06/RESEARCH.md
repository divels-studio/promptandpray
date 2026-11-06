# RESEARCH - plan GATES (ROADMAP § GATES + three output items of § CODEX)

Two scan agents (sonnet, fresh context, 2026-11-06): A = the hooks and the plan gate, B = the Codex
wrappers. The COO opened the pointers marked (COO). Pointers, not prose.

## Code Map

| file | role today |
|---|---|
| `scripts/engine/pretooluse-git-verb-guard.js` | Gate 4 git-verb guard + the habit guard (`habitOf`, `HABITS`, `HABIT_DIRECTORY_CHANGERS`, `habitSegmentsOf`, `habitWordsOf`) in one hook |
| `scripts/engine/pretooluse-mutation-guard.js` | Gate 1 (identity deny for non-writer subagents) + Gate 3 (route-state guard) in one hook |
| `scripts/engine/plan-gate.js` | the plan folder's mechanical contract: `--check`, `--stamp`, brief mode, module API |
| `scripts/engine/aiwf-lib.js` | `denyPreTool`, `askPreTool`, `runFailClosed`, the plan-name grammars |
| `hooks/hooks.json` | wires Gate 1 and Gate 4 (matcher `Bash\|PowerShell`, `onFailure: block`) |
| `templates/settings.ask-ruleset.json` | the ask rules in `Bash(X)` / `PowerShell(X)` pairs; `git -C <projectRoot> push\|merge\|rebase` |
| `scripts/native/ps/codex-review.ps1`, `scripts/native/sh/codex-review.sh` | the Reviewer wrapper, PS 5.1 CRLF / bash LF mirrors: runs `codex`, streams untouched, two `codex-review:` stderr lines, records the session id |
| `scripts/native/ps/codex-qa.ps1`, `scripts/native/sh/codex-qa.sh` | the QA twin: same invocation and session capture, state file `last-qa-session.<key>.txt`, NO header or footer line |
| `scripts/native/ps/codex-qal.ps1`, `scripts/native/sh/codex-qal.sh` | QAL: no session file, no resume; the only wrapper with a per-run temp dir |
| `scripts/native/ps/aiwf-roles.ps1`, `scripts/native/sh/aiwf-roles.sh` | the role resolver the wrappers call (engine, model, effort) |
| `scripts/selfcheck/aiwf-selfcheck.js` | pins everything above: Gate 1 section, Gate 4 and habit rows, M-cases of the plan gate, wrapper flag locks, executed stub probes 5d |
| `scripts/spike/run-spikes.mjs` | the hook matrices (`gate1Cases`, Gate 4 rows, habit rows, gate2-plan rows); optional Gate 1 parity against a reference copy |
| `docs/LOOP.md` | prose of Gates 1-4 and the habit guard ("five shapes") |
| `docs/CODEX_REVIEW_QA_RECIPE.md` | the wrapper contract ("wrappers do not touch either output stream") and the probe description |
| `scripts/native/README.md` | wrapper summary |
| `skills/review/SKILL.md`, `skills/plan/SKILL.md`, `skills/qa/SKILL.md` | the launch commands, the background run, the resume policy, the round-file header rule |
| `templates/briefs/planner.md` | the plan index grammar the planner follows |
| `templates/ORCHESTRATOR.md.tmpl`, `templates/doctrine/ticket.md.tmpl`, `templates/agents/writer.md.tmpl`, `templates/CLAUDE.md.tmpl` | the doctrine sentences on `-C`, the habit guard and "fail a gate on a copy" |
| `.gitattributes` | `*.ps1 eol=crlf`, `*.sh eol=lf` |
| `.claude-plugin/plugin.json`, `CHANGELOG.md`, `migrations/` | the version source (0.3.11 today), the changelog block, the release migration |

## What the code does today

The habit guard and Gate 4 (A):

1. Five habit shapes: three pipe shapes, `cd`, `git -c`; header comment `pretooluse-git-verb-guard.js:8-27`. `HABITS` at `:530-536` holds `tail`, `head`, `select`, `cd`, `gitDashC`, each `{shape, hint}`; the deny text is `[AIWF-G4 habit guard] habit: <shape> - <hint>` (`:664`).
2. `HINT_DIRECTORY` = "use the tool's own directory flag; a command runs from the repository root" (`:528`). `HABIT_DIRECTORY_CHANGERS = ['cd','chdir','pushd','Set-Location','sl']` (`:544`); `Push-Location` and `popd` are absent. `habitOf` tests only the FIRST word of each segment (`:607-617`).
3. `git -C` is NOT a habit: `habitOf` `:618` matches only `words[1] === '-c'` with `=` in `words[2]`. Selfcheck `:2137` and spike `:604` pin `git -C <path> status` as silent.
4. `verbAfterGit` skips `-C <path>` and `-Cpath` (`:373-381`); `shippedRuleMatches` returns false for every `-C` form (`:495`). A `-C` with an ask-class verb asks (main / Writer) or denies (non-writer subagent); a `-C` with a read verb (`log`, `status`) has no recognised verb and passes silently - this is how the four occurrences went through.
5. `habitSegmentsOf` splits on `&&`, `||`, `|&`, `;`, `|`, newline and a Bash lone `&` (`:537-540`, `:564-581`). On PowerShell `&` is not a separator, so `& { Push-Location x }` is one segment whose first word is `&`. `{`, `(`, `$(` are not separators. Quotes hide their content (nested `pwsh -Command '...'` passes; documented `:28-31`, `docs/LOOP.md:131-132`). Spike PS row `:608` and selfcheck `:1875` pin `echo X & cd scripts` and a quoted `Set-Location` as PASS.
6. Gate 4 passes through when no command is readable (`:659`); the habit check runs before identity and before the verb logic (`:663-664`).

Gate 1 (A):

7. Non-writer path `pretooluse-mutation-guard.js:390-398`: any `agent_id` / `agent_type` own property with a type other than `writer` is denied BEFORE the target is read; `targetPathOf` (`:115-122`) is never called. Deny text ends `[AIWF-N3 gate 1: non-writer subagents cannot write]` (`:397`). A Write to a scratchpad outside the repository is denied by identity alone.
8. Main-session branch `:345-350`: `path.resolve(projectDir, target)` + `path.relative`; outside the project dir is a passthrough, "deliberately and load-bearingly". `projectDirOf()` = `CLAUDE_PROJECT_DIR`, else `__dirname/../..` (`:95-98`). Selfcheck `:2185` pins that passthrough. Only this branch has the outside-root exemption.

The plan gate (A):

9. `codeMapPaths(ticket)` `plan-gate.js:372-386` takes the backticked paths of the first column of `## Code Map` and splits cells on `, `; used only at `:520-524` (`codemap-path-missing`, resolved against `root`).
10. No notion of side-by-side tickets exists: no index-table parser; `model.index = {rel,text,lines,mask}`; the only index line read is `Tickets:` (`declaredTicketCap`, `:443-455`). The planner grammar (`templates/briefs/planner.md:34-37`) makes the order of the tickets free text.
11. Problems are `problems.push({token,message})`; the token order is the doc header `:18-59`; `stampPlanFolder` (`:564-578`) writes nothing while problems exist - a single `writeFileSync`, no lock (no transactional read needed).

The Codex wrappers (B; the main run block of `codex-review.ps1` / `.sh` read whole):

12. Cold: `exec -C <root> -m <model> --sandbox read-only -c approval_policy=never -c model_reasoning_effort=<e>`, brief on stdin (`ps1:265-272`; `sh:298-305`). Resume: `exec resume <id> -c sandbox_mode=read-only -c approval_policy=never -c model=.. -c model_reasoning_effort=.. -`, cwd set to the root (`ps1:281-289,298-301`; `sh:314-326`).
13. Neither stream is touched: `$Prompt | & codex @codexArgs` (`ps1:470`), `printf '%s\n' "$PROMPT" | codex "${CODEX_ARGS[@]}" || status=$?` (`sh:482`). Reasons in the comments: PowerShell re-encodes piped output; codex renders by whether the stream is a terminal (`ps1:443-449`; `sh:349-355`).
14. The wrapper never parses `tokens used` and has no capacity detection (grep of both wrappers for `tokens` / `capacity`: nothing). The round files call it "the wrapper's `tokens used` line" (`dev/backlogs/readiness/DOCSTAGE/round-1.md:3`) - it is codex's own print.
15. Header line (stderr, before codex): `codex-review: run <cold|resumed ID>, <class X|role reviewer>, model M, effort E` (`ps1:466-468`; `sh:477-479`), fields sanitised by `Sanitize-HeaderField` / `header_field` (`ps1:462-465`; `sh:474-476`). Footer line (stderr, after the id is recorded): `\ncodex-review: exit N, session ID (resumable: -ResumeId ID | --resume ID)` or `exit N, session not identified - the next resume needs an explicit id` (`ps1:474-479`; `sh:484-489`).
16. Main run block, `.ps1`: read stamp `$CaptureSince` `:434`; write stderr header `:468`; `$script:RecordedSessionId=$null` `:469`; write engine (stdin brief, streams through) `:470`; read `$LASTEXITCODE` `:471`; read the codex store `~/.codex/sessions` (cold only) `:399-413`; write state file `Set-Content -Encoding ASCII $StateFile` (dir created `:419-421`) `:422`; write `Clear-CodexSessionState` (delete, truncate, re-read) `:358-373` called at `:429`; write stderr footer `:476`/`:478`; `exit $code` `:480`.
17. Main run block, `.sh`: stamp `:411`; header `:479`; `RECORDED_ID=''`, `status=0` `:480-481`; engine `:482`; `record_session_id "$RESUME"` `:483` (rollout scan `:449`, `CAPTURE_JS` `:365-408`; state file `mkdir -p` + `printf > $SESSION_STATE` `:452-453`; clear `:420-435` called `:460`); footer `:486`/`:488`; `exit "$status"` `:490`.
18. A resumed run records the id it was given and does not consult the store (`ps1:378-385`; `sh:440-447`). A cold run finds its session by mtime >= start-2s plus a brief fingerprint in the first 512 KiB of the rollout, and records only when exactly one rollout matches (`ps1:386-414`; `sh:365-408,449`).
19. State file `<root>/<scratchRel>/last-review-session[.<key>].txt` (`ps1:217-222`; `sh:272-276`); key = the brief's first `Ticket:` line, else the last segment of `PLAN:` (`ps1:183-212`; `sh:249-271`); `scratchRel` = `paths.scratchDir`, default `.aiwf` (`ps1:160-171`; `sh:211-220`), gitignored (`.gitignore:1`).
20. Exit code is codex's own (`ps1:480`; `sh:490`); pre-engine refusals exit 2. The review wrapper has no temp-dir logic (grep for `TEMP|TMPDIR|mktemp|GetTempPath`: nothing); QAL has one: `<temp>\aiwf-qal\<ts>-<guid>` (`qal.ps1:91-109`), `mktemp -d "${TMPDIR:-/tmp}/aiwf-qal.XXXXXX"` (`qal.sh:147`).
21. QA wrappers: bare invocation (`qa.ps1:410`; `qa.sh:426`), then the session recorded; no header, no footer. The PS review wrapper's `Write-Warning` in the "not identified" path goes to stdout (`ps1:372`; selfcheck `psWarnsOnStdout` `:5518,5533`).
21a. (round-1 B4; scan agent, both QA wrappers read whole) Main run block, `codex-qa.ps1`: read stamp `$CaptureSince` `:394`; write engine (stdin prompt, streams through, nothing of the wrapper's own) `:410`; read `$LASTEXITCODE` `:411`; `Save-CodexSessionId` `:389` -> read the codex store (cold only; fingerprint = the longest ASCII run of 24+ chars in the brief's first 400 chars, capped at 120, `:350-355`; rollouts by mtime `:360-365`, first 524,288 chars each `:296-310,367`, `session_id` of the single survivor `:371-373`); read state dir `:380`; write `New-Item -Force` dir `:381`; write `Set-Content` id ASCII `:383` (failure -> `Write-Warning` `:385`); no id -> `Clear-CodexSessionState` `:319-334`: write `Remove-Item -Force` `:321`, read `Test-Path` `:322`, write `Set-Content ''` truncate `:323`, read verify `:326-327`, `Write-Error` naming a surviving stale id `:330` or `Write-Warning` "no session id is recorded now" `:333` (the PS warnings and errors go to the host streams, as the review wrapper's `:372`); `exit $code` `:414`. Earlier: a writability probe of the state file (open `Write`, disposed, no bytes) `:231` on a bare resume; `Set-Location $ProjectRoot` `:279` on resume.
21b. Main run block, `codex-qa.sh`: stamp `:376`; engine `:426` (`|| status=$?`); `record_session_id "$RESUME"` `:427` (defined `:402-423`): the rollout scan `CAPTURE_JS` `:330-373` at `:414` (cold only; depth <= 6; stderr discarded); write `mkdir -p` `:417`; write `printf '%s\n' "$id" > "$SESSION_STATE"` `:418` (failure -> stderr `:419`); no id -> `clear_session_state` `:385-400` at `:422`: `rm -f` `:386`, `-e` `:387`, `: >` truncate `:388`, verify `:392-393`, stderr ERROR `:396` or "no session id is recorded now" `:399`; `exit "$status"` `:428`. Differences from the review wrapper's path: no header line (review `ps1:466-468`, `sh:477-479`), no footer (review `ps1:474-479`, `sh:484-489`), no recorded-id variable (review `ps1:423,469`, `sh:454,480`), the `.sh` write test's shape (`||` vs `if`), the message prefix; save, scan, fingerprint and clear are otherwise the same code with other line offsets.
22. Plan skill Step 6 redirects the wrapper's stdout to `<scratchDir>/<ABBR>-readiness-round.txt` and Greps `^BLOCKERS:` (`skills/plan/SKILL.md:205-221`); stderr is not redirected. Review Step 3's launch has no redirect (`skills/review/SKILL.md:354-360`); background run, 3600000 ms timeout, bare `-Resume` policy `:397-489`; an interrupted pass is recovered by bare resume `:461-473`.
23. The recorded capacity text: `"Selected model is at capacity", exit 1, after reading the diff`; re-dispatched only on the operator's word as a bare resume (COO: `dev/backlogs/archive/017_PLAN_RULEHOME_2026-10-31/records/RULEHOME-002.md:80-82`). The stream it went to is not recorded.
24. (COO) `codex-cli 0.156.1` installed; `codex exec --help` lists `-o, --output-last-message <FILE>` (the final agent message written to a file), `--json` (events as JSONL to stdout), `--color <COLOR>`, `--output-schema <FILE>`.

## Consumers and adjacent contracts

Habit guard / Gate 4:

- shapes pinned by selfcheck `aiwf-selfcheck.js:1805-1901` (hint matrix `:1811-1849`; PASS twins `:1851-1892`, incl. `:1866`, `:1877` where `git -C <path> status` must stay silent) and the pure-function rows `:2106-2141` (`:2137` asserts `habitOf('git -C /p log') === null`); spike rows `run-spikes.mjs:517-538` (Bash), `:595-609` (PS) - `:604` and `:608` flip with the change.
- `-C` ask rules: ruleset `:66-68`, `:120-122`; selfcheck pins them as REFUSED forms `:1935`, `:2022`, `:1612-1619`; negative controls push `Bash(git -C <projectRoot> push:*)` `:9143`, `:9152` (`ownedAskRules`); spike rows `:443-446`, `:481`, `:576-577`, `:587` expect ASK/DENY for `-C` forms - a habit deny comes first and changes decision and reason. `GIT_ASK_VERBS` / `EXE_RULE_VERBS` are cross-checked against the ruleset both ways (`git-verb-guard.js:168-185`). Removing a ruleset rule = `reconcile-ask-ruleset` op (overrides § Data, tenancy and access control).
- prose: `docs/LOOP.md:81-86` ("any `git -C` asks"), `:118-132` ("five shapes", the `-c` shape `:128-129`); `templates/CLAUDE.md.tmpl:91`; `writer.md.tmpl:52-54`; `ticket.md.tmpl:211-214`; `ORCHESTRATOR.md.tmpl:463` ("The `-C` forms ask by construction"), `:524`; the guard's header and comments `:179-180`, `:204-208`, `:215-219`, `:491`.

Gate 1:

- deny text and identity pinned by selfcheck `:677-730` (captured payloads `:711-722`) and spike `gate1Cases` (`:151`, run `:635-662`); spike parity against a reference Gate 1 copy only when `--reference <dir>` / `PNP_SPIKE_REFERENCE_HOOKS` is given, else SKIPPED (COO: `run-spikes.mjs:13`, `:47-52`, `:631`). Doctrine: `docs/LOOP.md:25-27` ("every other subagent is denied"); the hook header `:7-20`, `:45-48`; "fail a gate on a copy - a fixture project or a scratch copy" `ORCHESTRATOR.md.tmpl:262-263`, procedure agent writes "only under the scratch directory" `:224-244`.

Plan gate:

- token list: doc header `:18-59`; `PG_CONTRACT_TOKENS` selfcheck `:5278-5279`; `[plan-gate-tokens]` asserts every token is produced by at least one M-case (`:5293`); M-cases `:4839-5142` on fixture `PLAN_FIX` (`:4871-4930`) with `exactly(...)` sets (M25 `:5067`); the fixture has ONE ticket. Spike gate2-plan rows `:353-384`. Brief mode is called by the wrappers (`ps1:320`; `sh:347`) and Gate 2 (`pretooluse-dispatch-gate.js`). Grammar prose: `templates/briefs/planner.md:29-53`, `scripts/native/README.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`.

Wrappers:

- stream purity pinned statically: ps "attaches NOTHING to codex's stdout or stderr - no ForEach-Object, no Tee-Object, no redirect" `selfcheck:3394-3401`; sh regex forbidding `| tee`, `>` on the codex line and `--json` `:3900-3903`; named-fault controls `ps-*-stream-purity` `:3658`, `sh-*-stream-purity` `:4605-4606`; executed byte-for-byte stdout check 5d `:5524-5536,5581` (stub stdout `A\r\nB`, stderr `E1\r\nE2` `:4248-4249`, exit 7 `:4236`, id `019be9f2-0000-4000-8000-0000000000ab` `:4240`).
- header/footer exact strings: `:5502-5523` (HDR_RUN, HDR_EXIT, five probes), controls `:5557-5570`; the resumed id parsed from stderr `codex-review: run resumed (\S+),` `:4343`; `exits.length === 1` `:5534` counts lines starting `codex-review: exit `.
- flag locks: exact argv pairs `:3099-3220` (ps), `:3770-3960` (sh), header `:9518`; the sh channel file list `aiwf-roles.sh,codex-qa.sh,codex-qal.sh,codex-review.sh` `:3826`; `.EXAMPLE` literal allowlist `:7941-7943`.
- executed stubs: sh stub at `<home>/bin/codex` `:4487-4502` (records argv NUL-separated, stdin, cwd marker; prints `session id: <id>` on stderr; writes the rollout `$CODEX_HOME/sessions/2026/09/17/rollout-...-<id>.jsonl`; emits STUB_STDOUT / STUB_STDERR / STUB_EXIT); ps stub `pnp-codex-stub.js` + `codex.cmd` + extensionless `codex` `:3576-3605`. NO stub emits a `tokens used` line or a capacity text.
- prose that moves with the stream contract: `docs/CODEX_REVIEW_QA_RECIPE.md:112-121`, `~187-196`; `skills/review/SKILL.md:475-478`; `skills/qa/SKILL.md:338-339`; `skills/plan/SKILL.md:223-226`; `scripts/native/README.md:24-28`. Launch-command prefix is allow-rule material (`skills/review/SKILL.md:360-368`): a new flag or redirect changes what a rule matches.
- constraints: PS 5.1 ASCII-only, bash LF-only, flag-for-flag mirror (`dev/PROJECT_OVERRIDES.md:115-116`); `.gitattributes`; the example cycle hashes the tree before and after but never calls a Codex wrapper (`run-example-cycle.mjs`, grep `codex`: nothing; work dir under `os.tmpdir()` `:385`).

## What already exists

- `verbAfterGit` already recognises every `-C` form (`:373-381`); `habitSegmentsOf` / `habitWordsOf` (`:552`, `:585`); `HABIT_DIRECTORY_CHANGERS` (`:544`) and the `cd` hint (`:528`, `:534`); hint wording naming the file tools (`writer.md.tmpl:52-54`, `CLAUDE.md.tmpl:91`).
- The main-session outside-root logic (`mutation-guard.js:345-350`) the non-writer branch can reuse; Gate 1 fixture patterns (`writeEnvelope`, captured payloads, selfcheck `:677-730`).
- Every Code Map path per ticket already extracted by `codeMapPaths` and looped at `plan-gate.js:520-524`; the refs from the ticket-file grammar (`readFolder` `:266`, `lib.PLAN_ABBR_RE`); the `Tickets:` line reader `:443-455` as the model for a second declared index line.
- Both wrapper header/footer lines and their sanitiser (`ps1:462-479`; `sh:474-489`): the home for a capacity line and a tokens label. A temp-dir precedent in QAL (`qal.ps1:76-109`; `qal.sh:72-84,143-147`). Codex's own `-o/--output-last-message <FILE>` (fact 24). The stub infrastructure for both channels (`runWrapperWithStub` ~`:4400-4520`, `runPsWrapperWithStub` ~`:3545`).
- The harvest material: `dev/backlogs/inputs/harvest-2026-11-03.md` rows S1 (`:26`), S6 (`:31`), F6 (`:60`), F9 (`:63`), F20 (`:74`), F41 (`:95`); `CANDIDATES.md:1518-1521` (the `tokens used` figure grows monotonically along a chain of resumes - read as cumulative); `dev/REBUILD.md:18` ("135,536 cumulative").

## Paths touched without being named

- Rendered copies of every template the plan edits: `.claude/aiwf-native/ORCHESTRATOR.md`, `.claude/aiwf-native/doctrine/{ticket,plan,work,review}.md`, `.claude/agents/writer.md`, root `CLAUDE.md` - re-rendered by the release migration (`rerender-managed-region`), generator `scripts/setup/generate.mjs`, suites `test-setup.mjs` / `test-update.mjs`.
- The ruleset is rendered into consumers' `.claude/settings.json` (`ownedAskRules`); a ruleset change = migration op. Mentions of the habit guard in `README.md`, `docs/README.md`, `docs/OPERATOR_PROTOCOL.md`, `migrations/README.md`.
- The wrappers' own script text uses `-C` for `codex exec` and `Set-Location -LiteralPath $ProjectRoot` (selfcheck `:3389`, `:3655`) - script contents, not commands the guard judges.
- `templates/memory-seeds/` - a home of the enumeration on every doctrine change (`ORCHESTRATOR.md.tmpl:264`).
- `migrations/0031_session-key`, `0032_rule-homes` name the wrappers and state files (history, not changed).
- `$HOME/.codex` / `$CODEX_HOME` - the store the wrappers already read outside the repository (`ps1:399`; `sh:409`).
- Gate 2 (`pretooluse-dispatch-gate.js`) reads the plan gate in brief mode: a new refusal token reaches review dispatch too.

## Unknowns

1. Which stream carries `tokens used` and the capacity text, and whether `codex exec resume` prints a running total (operator fact 2026-10-18: cumulative) - settled by ONE trivial `codex exec` cold + resume run on a one-line prompt with the streams captured separately (the Writer's first step of the wrapper ticket; cheapest model, low effort).
2. Whether a PS 5.1 `*>` redirect to a file re-encodes or changes a native command's bytes (the comment at `ps1:443-449` says a pipe does) - settled by D-09's deterministic emitter test (known bytes under `*>`, then under `cmd.exe /c ... > <log> 2>&1`, hex-compared against the expected bytes); the `-o` file is the verdict and takes no part in that comparison (round-1 B1, round-2 I3).
3. Whether `& { Push-Location x }`, `$(cd x)`, `( cd x )` and `{ cd x; }` reach `habitOf` as one segment - settled by calling the exported `habitOf` with those four strings for both tools.
4. Whether harvest F41's refused write was a non-writer subagent (identity deny, fact 7) - the row says a non-writer subagent and "the render dry-run of 6efd103 ran without its probe" (`harvest-2026-11-03.md:95`); consistent with fact 7, not re-opened.
5. Whether `examples/` or `scripts/ci/README.md` list a wrapper invocation (`DOCUMENTED_COMMANDS`) - settled by `grep codex examples/ scripts/ci/`.
