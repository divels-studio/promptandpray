# RULEHOME-002 - the habit guard, the gates' guarantees, the per-ticket brief, 0.3.7

The ticket's completion record (PLAN_RULEHOME § RULEHOME-002 worklist; DECISIONS D-02, D-04, D-05,
D-06, D-13, D-14, D-15, D-16). Opened 2026-10-31 with the spike results, closed the same day.
Session: Fable 5.1 (COO routing check 1), `--plugin-dir D:\pnp-live`, auto mode on; operator word
for the ticket 2026-10-31 „пускай, ако някъде аутомод гръмне спираш и питаш, но не и преди".

## What landed

- `6c4e627` (docs, R1, the COO) - the scratch-keep row in five files: `docs/WORKFLOW.md` § Durable
  development history, `templates/briefs/record.md` (§ Scratch + closing checklist),
  `skills/plan/SKILL.md` (landing step), `skills/mission/SKILL.md` Step 3, `skills/work/SKILL.md`
  Step 2 - the phrase `never deleted unmoved` on one line in each (the closing grep hits all five).
- `6bb25dc` (code, the Writer; 25 files, +959 / -176 before the rounds, +778 / -71 more in the
  rounds on the code files) - the ticket:
  - `scripts/engine/pretooluse-git-verb-guard.js` - the habit guard as the file's second
    responsibility (D-14): a separator-aware splitter (`habitSegmentsOf`, a lone `&` a separator on
    Bash outside redirects, an escaped `\>`/`\<` not a redirect), `habitWordsOf`, `habitOf` (five
    shapes; shape (5) = first word `git`/`git.exe`, second `-c`, third carries `=`; PowerShell
    case-folded, Bash not), the deny through `lib.denyPreTool` with `[AIWF-G4 habit guard] habit:
    <shape> - <hint>` after the payload validation and before the git-verb logic, for every actor;
    `TOOL_MONITOR` -> the Bash dialect in `dialectOf`.
  - `hooks/hooks.json` - `onFailure: "block"` on the Gate 1/3 and Gate 4 command objects; Gate 2
    untouched; the description names the habit guard.
  - `scripts/native/ps/codex-review.ps1`, `codex-qa.ps1` - `-BriefFile <path>` read before role
    resolution and any state read; missing / unreadable / empty / whitespace-only -> exit 2; the
    flag beside a pipeline or `-Prompt` brief -> exit 2; no flag -> the 0.3.6 contract.
  - `scripts/native/sh/codex-review.sh`, `codex-qa.sh` - `--brief-file <path>`, the same refusals;
    the stdin ambiguity check is ONE bounded read (`IFS= read -r -d '' -t 2 -N 65536`), a stdin
    that fills the bound refused unread, a BOM dropped; byte-identical blocks.
  - `scripts/selfcheck/aiwf-selfcheck.js` (+360 / -17) - 27 habit deny rows x 3 actors with the
    hint asserted, the PASS twins, the order row, the Monitor rows + the `SomeFutureShell` control,
    pure-function rows on the splitter and `dialectOf`; the onFailure shape row with five
    patched-copy controls; the brief-file probes (`bf-capture`, `bf-missing`, `bf-empty`,
    `bf-blank`, `bf-both`; bash-only `bf-idle`, `bf-open`, `bf-cap`) executed on both channels with
    one sabotage control each; the old rows that used a `cd` prefix as a stand-in for "a compound
    command" rewritten with a neutral prefix; both wrapper section titles "stdin / brief-file".
  - `scripts/spike/run-spikes.mjs` (+49 / -8) - the habit shapes, PASS cases and Monitor rows on
    both Gate 4 tables; the old `cd` rows rewritten.
  - Prose (Writer B): `docs/WORKFLOW.md` § Branch policy (per-ticket brief + state files; "dispatched
    one at a time" dropped), `docs/LOOP.md` (the `cd` sentence, the habit-guard and onFailure
    paragraphs in § Enforcement, Monitor, § Honest security model), `docs/CODEX_REVIEW_QA_RECIPE.md`
    (the flag as the launch form, stdin the fallback, the keyed names, the PowerShell honest limit),
    `docs/SESSION_BRIEF_RECIPE.md`, `docs/OPERATOR_PROTOCOL.md` (the five habits in the operator's
    voice), `skills/review`, `skills/qa`, `skills/plan` (the launch through the flag with
    `<key>-review-brief.txt` / `<key>-qa-brief.txt` / `<key>-readiness-round.txt`; "constant prefix
    on purpose" replaces "do not make the path unique"), `templates/ORCHESTRATOR.md.tmpl`,
    `templates/agents/writer.md.tmpl`, `scripts/native/README.md`, `README.md` § Status.
  - Release (D-02): `.claude-plugin/plugin.json` 0.3.7; `migrations/index.json` +
    `migrations/0032_rule-homes/` (three `rerender-managed-region` ops - `CLAUDE.md#aiwf-core`,
    ORCHESTRATOR.md, writer.md - and one `note`); `CHANGELOG.md` `## [0.3.7] - 2026-10-31`
    (Added / Changed / Fixed, the consumer line, ONE `Retires local rules:` line).
- the record commit (docs, the COO) - this record; the index row closed; `dev/backlogs/ROADMAP.md`
  § ENVOP born (the carrier of spike (a)); the D-16 (c) sweep of this repository's consumer layer
  (below); this repository on 0.3.7 (`/pnp:update --apply`: `aiwf.config.json`, the re-rendered
  `CLAUDE.md` region, `ORCHESTRATOR.md`, `writer.md`).

## Decisions and deviations

- Two Writers in parallel on non-overlapping file sets (A = code, B = prose + release), the split
  recorded in both briefs; one VERIFY and one commit closed the ticket (LOOP § Role boundaries).
- Writer A stopped before any write on the ticket's "an old test's expectation" condition: six Gate
  4 rows used `cd X && ...` / `git -c k=v commit` as stand-ins for "a compound command" and expected
  a silent pass. The COO's amendment: a neutral prefix (`echo X && ...`, `Write-Output X; ...`)
  keeps each row's purpose; the two `git -c k=v commit` passthrough rows become habit denies, the
  rule-match half staying on the pure-function row. D-14 is the recorded decision; the rows merely
  predated it.
- Separators inside `$( )`, `( )`, `{ }` outside quotes are top-level for the habit check (as
  `subcommandsOf` already treats them): `X=$(git log | head -1)` IS a pipe into head.
- Shape (5) folds the program name on PowerShell only (D-14's letter); `-c` is never folded.
- "Dispatched one at a time" (WORKFLOW § Branch policy, PARPLAN-002) dropped: with per-ticket brief
  and state files the two sessions' passes collide on nothing; one executing session per tree stays
  operator-held.
- Spike (a): the variable also applies HOT through a `settings.local.json` `env` block (no restart) -
  observed, not in the plan's procedure; no op carries it, so D-04 resolved to the habit guard
  denying `cd` and ROADMAP § ENVOP was born for the carrier.
- Spike (b) ran in this session rather than a restarted one: the `InstructionsLoaded` hook written
  into `settings.local.json` was hot-loaded (the first Writer dispatch after the write logged it).
- Spike (c) PASS -> LOOP names the observed 2.1.316 result and the honest limit (D-05 (d)).
- Codex pass 3's first attempt died at the engine ("Selected model is at capacity", exit 1, after
  reading the diff); it was re-dispatched only on the operator's word („изчакай 2 мин"), as a bare
  resume with a continuation prompt (the interruption rule of `skills/review` Step 3).
- Correction rounds: 2 of the cap 2, both answering Codex blockers; the second round's blockers were
  born of the first round's own code (declared as such by the auditor).
- Sessions (D-08 amended by the operator 2026-10-31, „003 ще мине в тази сесия, ти имаш пълния
  контекст"): RULEHOME-003 runs in THIS session, not a fresh S4; the session rule is a guide.
- The COO's own self-check run after round 1 was started and then stopped by the COO when round 2
  began (moot - the tree changed); the operator's processes were not touched.

## Events

| date | rule or D-id | kind | pointer |
|---|---|---|---|
| 2026-10-31 | the ticket's stop condition (an old test's expectation) / D-14 | catch | Writer A stopped before any write; the COO amended the rows (§ Decisions) |
| 2026-10-31 | WORKFLOW § The operator does not arbitrate - a dead paid pass waits | catch | pass 3 died at the engine; reported with its numbers; re-dispatched on the operator's word only |
| 2026-10-31 | WORKFLOW § How the COO speaks (an interim notification with no result gets no message) | operator-correction | after ~30 min of the update-suite's silence the operator asked „kakwo става да не зависнахте, да не заспахте?" - the COO answered with the measured state (4 of 5 rows done, the fifth's embedded self-checks); a long VERIFY now gets one line of expected duration up front |
| 2026-10-31 | pass economy | operator-correction | „малко ми идвате в повече с тия блокери" - two boundary blockers born of round 1's fix; the rounds stayed within the cap |
| 2026-10-31 | overrides § Test policy (the row's suite runs once) | catch (COO self-correction) | the post-round-1 self-check started by the COO was stopped as moot when round 2 began; one wasted start |

## Verification (what actually ran)

Logs outside the repository under `C:\Users\dyosi\AppData\Local\Temp\rulehome-002\`.

- Writer A, red then green (its logs): self-check `--plugin-root .` exit 1 1503/1562 (59 new rows
  red) -> exit 0 1566/1566; spikes exit 1 402/18 -> exit 0 402/0; `claude plugin validate .` exit 0.
  Round 1: 1565/1576 + 414/4 red -> 1576/1576 + 414/0 green. Round 2: 1577/1582 + 418/1 red ->
  1582/1582 + 418/0 green.
- Writer B: provenance grep empty; `node scripts/update/validate-payload.mjs --plugin-root .` exit 0
  (32 migrations, payload 0.3.7); `node scripts/update/test-update.mjs` exit 0, `checks: 445,
  failures: 0` (run before A's code landed); `claude plugin validate .` passed with 2 pre-existing
  warnings; the three closing greps as the acceptance says.
- The COO's VERIFY union (one parallel batch, 18:04:33 -> 18:36:21, wall 1908 s,
  `verify\summary.txt`): `selfcheck` (CI form) exit 0 `1565/1565 assertions passed`; `spikes` exit 0
  `checks: 402, failures: 0`; `update-suite` exit 0 `checks: 445, failures: 0`; `validate-payload`
  exit 0; `plugin-validate` exit 0.
- Baseline for the duration question: `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .`
  from `D:\pnp-live` at 6c4e627 -> `1458/1458` in 400 s (beside other processes); the final
  self-check `1582/1582` in 522 s wall beside the spikes. The ticket adds 124 rows and roughly two
  minutes; the update-suite embeds the self-check in four fixtures, hence its ~32 min.
- After round 2 (19:36:55 -> 19:45:37, `verify-round1\summary.txt`): `selfcheck` exit 0
  `1582/1582`; `spikes` exit 0 `checks: 418, failures: 0`.
- Fact-check gate (Explore, sonnet) over the prose of the diff: `CLAIMS: total=163 verified=156
  false=0 unverifiable=7`; the seven closed by the COO: the four 001 contradictions (history, the 001
  record), the host's onFailure behaviour (spike (c)), "the host's documented onFailure contract"
  (RESEARCH § S4, changelog 2.1.295), "no hook can see sibling sessions" and the matcher sentence
  (pre-existing text), `templates/ORCHESTRATOR.md.tmpl:112` (the recorded-bar clause),
  `templates/agents/writer.md.tmpl:89` (`Refs: <REF>`), `scripts/update/migrate.mjs:371,385` (the
  `note` op is printed).
- Narrowed-test grep over the added code lines (`.skip`, `.only`, `todo`, `xit(`, `xdescribe`):
  zero hits.
- Codex code pass (review.code: gpt-6-sol, xhigh), session `01a192d2-1a9c-71b2-b2bf-11bae4f50f7e`:
  pass 1 cold `fail` (3 blockers + 1 note; 112,515 tokens); pass 2 resume `fail` (carried 3 CLOSED,
  2 new; 156,508 cumulative; operator word „да"); pass 3 resume - first attempt dead at the engine
  (158,060; "Selected model is at capacity"), re-dispatched as a bare resume on the operator's word
  („изчакай 2 мин") -> `pass`, no findings, no notes (177,220 cumulative; the word for pass 3 „да,
  но малко ми идвате в повече с тия блокери").
- Provenance grep (`[\x{0400}-\x{04FF}]` over the payload dirs) empty before each commit.
- This repository's `/pnp:update --apply` 0.3.6 -> 0.3.7 (`update-apply.log`): `updated: 0.3.6 ->
  0.3.7, 4 operation(s) applied` (the three re-renders + the note, no question asked, no unowned
  payload rule reported); `self-check: PASS - ==== 1581/1581 assertions passed ====` (the fixture
  form, run by the engine); under auto mode, no refusal.

## Spikes (D-04, D-05 (a), (b), (d))

Claude Code 2.1.316 (`claude --version`), Windows 11, the operator's session (Fable 5.1,
`--plugin-dir D:\pnp-live` at `803d9db`), auto mode on.

### (a) the working directory, D-04

Baseline WITHOUT `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` (`"ENV=[$env:...]"` printed `ENV=[]`):

| actor | tool | call 1 | call 2 | result |
|---|---|---|---|---|
| main session | Bash | `cd scripts` | `pwd` -> `/d/promptandpray/scripts` | the `cd` persists |
| main session | PowerShell | `Set-Location scripts` -> exit 1, `Cannot find path 'D:\promptandpray\scripts\scripts'` | `Get-Location` -> `D:\promptandpray\scripts` | the Bash `cd` had already moved the PowerShell tool's directory: ONE working directory shared by both tools |
| `writer` subagent, run 1 | Bash | `cd scripts` -> exit 1 (its cwd was already `...\scripts`) | `pwd` -> `/d/promptandpray/scripts` | a subagent STARTS in the main session's current directory |
| `writer` subagent, run 2 (main back at the root) | Bash | `pwd` -> `/d/promptandpray`; `cd scripts` -> exit 0 | `pwd` -> `/d/promptandpray` | inside a subagent the `cd` does NOT persist between calls |

The `writer` agent has no PowerShell tool (Read, Grep, Glob, Edit, Write, Bash).

WITH the variable, set through an `env` block in `.claude/settings.local.json` (hot-applied, no
restart: `VAR=[1]` printed on both tools in the next call):

| actor | tool | call 1 | call 2 | result |
|---|---|---|---|---|
| main session | Bash | `cd scripts` | `pwd` -> `/d/promptandpray` | PASS - returned to the root |
| main session | PowerShell | `Set-Location scripts` | `Get-Location` -> `D:\promptandpray` | PASS - returned to the root |
| `writer` subagent, run 3 | Bash | `pwd` -> root; `cd scripts` -> exit 0; `VAR=[1]` | `pwd` -> `/d/promptandpray` | PASS - as without the variable; the variable is visible inside it |

Verdict: PASS on both tools in the main session and in the subagent. Carrier: none - the op
vocabulary (`add-config-key`, `rerender-managed-region`, `reconcile-ask-ruleset`, `note`,
`seed-file`) writes no settings `env` block -> per D-04 the habit guard denies the `cd` prefix;
ROADMAP § ENVOP holds the carrier. The probe files (`.claude/rules/rulehome-probe.md`,
`.claude/settings.local.json`) were deleted after the spikes (the delete dialog).

### (b) path-scoped rules in a subagent, D-05 (b)

Probe: `.claude/rules/rulehome-probe.md` with `paths: ["scripts/spike/**"]` and the instruction to end
the reply with `RULEHOME-PROBE-7731`; an `InstructionsLoaded` hook in `.claude/settings.local.json`
running `C:/Users/dyosi/AppData/Local/Temp/rulehome-spike/log-instructions.mjs`, appending every
payload to `.../rulehome-spike/spike-b.log`. Positive control: a hand-piped payload produced the
first log row. The hook was hot-loaded.

Result: PASS, by both proofs - the log row (verbatim)
`2026-10-31T14:55:11.362Z | InstructionsLoaded | agent_type=writer | load_reason=path_glob_match | memory_type=Project | file_path=D:\promptandpray\.claude\rules\rulehome-probe.md | trigger_file_path=D:\promptandpray\scripts\spike\run-spikes.mjs | globs=["scripts/spike"]`
and the Writer's reply ending with `RULEHOME-PROBE-7731` ("the rule loaded only after the step-3
Read, not at start"). On 2.1.316 a `paths:` rule loads inside a `writer` subagent lazily, at the
Read of a matching file. Data for RULEHOME-003; nothing ships on it.

### (c) a missing interpreter under `onFailure: "block"`, D-05 (d)

Scratch copy `C:\Users\dyosi\AppData\Local\Temp\rulehome-spike\plugin-c\` (robocopy of `D:\pnp-live`
at `803d9db` without `.git`, 343 files), its `hooks/hooks.json` Gate 4 entry changed to
`"command": "node-rulehome-missing \"${CLAUDE_PLUGIN_ROOT}/scripts/engine/pretooluse-git-verb-guard.js\""`
with `"onFailure": "block"` (`Get-Command node-rulehome-missing` finds nothing); Gate 1/3 and Gate 2
unchanged. The operator started `claude --plugin-dir <the copy>` in `D:\promptandpray` (Claude Code
2.1.316 - the transcript's `version` field) and asked for one shell call, `node --version`.

Result: PASS - the call did not run; the harness message, verbatim (the operator's paste, matched
in that session's transcript `~/.claude/projects/D--promptandpray/9fe73645-1250-431b-a753-7ad5eca9fdb7.jsonl`):

```text
PreToolUse:PowerShell hook error: [node-rulehome-missing "${CLAUDE_PLUGIN_ROOT}/scripts/engine/pretooluse-git-verb-guard.js"]: failed; blocking because onFailure is "block"
/usr/bin/bash: line 1: node-rulehome-missing: command not found
```

The hook command runs through bash (`/usr/bin/bash: line 1`) even for the PowerShell tool, and a hook
that cannot start is BLOCKED under `onFailure: "block"` on this version. The scratch copy was
deleted after (the delete dialog).

## Retires sweep (D-16 (c)) - this repository's consumer layer against the 0.3.7 `Retires local rules:` line

| Retires item | where it stood locally | verdict | act |
|---|---|---|---|
| a QA pass after the review rides the ticket's word | nowhere; memory `every-pass-after-the-first-needs-a-word` is a pointer to WORKFLOW | none | - |
| the per-ticket review/QA brief file and its launch through the flag | overrides § Workspace paths, the `.aiwf/` line (`review-brief.txt, last-review-session.txt, readiness-round.txt`) | contradiction | rewritten to the keyed names |
| one explicit resume policy | memory `codex-pass-economy` ("only with the explicit -ResumeId ... cold passes never resume, operator rule 2026-10-02") | contradiction | the rule sentence replaced by a pointer to the recipe; the measurements kept, RULEHOME-002's added |
| `/pnp:plan` asks only what is unrecorded | memory `plan-skill-asks-what-is-recorded`; the clause inside the overrides' dialog bullet | duplicate | the memory file deleted (+ its MEMORY.md line); the bullet below |
| `--trace retain-on-failure` | no E2E runner here | none | - |
| rule-bearing text shown in the operator's language | nowhere | none | - |
| no `cd` prefix / no pipe into tail-head / no `git -c` (the habit guard) | root `CLAUDE.md` operator zone "refresh the live copy - no `-C`, no `cd`" | duplicate clause in a project rule | the clause trimmed; the refresh instruction stays |
| the ticket-end scratch cleanup, the delete dialog the gate | overrides § Loop shape "Ticket-end cleanup (operator rule 2026-10-06, widened 2026-10-16)" | duplicate (WORKFLOW § Durable development history) | bullet deleted |
| the short operator channel | overrides § Communication "Operator channel stays short (operator rule 2026-09-22, sharpened 2026-10-16)" | duplicate (WORKFLOW § How the COO speaks) | bullet deleted |
| the dialog rule (Q2) | overrides § Communication "A dialog only when the ticket cannot continue (operator rule 2026-10-16; Silerax 2026-10-05)" | duplicate (WORKFLOW § The operator does not arbitrate, ORCHESTRATOR filter, the Writer brief skeleton); the AskUserQuestion formatting is tool ergonomics | bullet deleted |
| parallel-by-default units | overrides § Test policy "Independent units run in parallel by default (operator rules 2026-10-02, 2026-10-05)" | duplicate (WORKFLOW § COO owns broad scans); the machine limit is the PORTIONS paragraph, which stays | paragraph deleted |
| `/pnp:update --apply` under auto mode | overrides § Environment "(operator rule 2026-10-23 ...) Never ask ... The payload sentence ... is a ROADMAP § DOCTR item" | duplicate (LOOP § Role boundaries, 001 C4; the DOCTR line done) | paragraph deleted; the 0.3.5 observation is history in the PARPLAN-001 record |
| consumer line (the launch form changed) | `.claude/settings.json` allow = `Bash(*)` | none | - |

Kept as project-only or pointers: the memories `no-claude-trailers-in-git`,
`yes-covers-only-the-asked-action`, `auditor-never-below-author`,
`consumer-sweep-covers-all-retires-and-memory`, `machine-constraints-verify-runs`,
`silerax-lives-in-stratex-folder`, `arbiter-role-in-this-session`; the overrides' Gate checkpoint
hook and COO routing tiers bullets.

## Remaining debt

- ROADMAP § ENVOP - the carrier for the working-directory variable (born here; a plan when worth it).
- None else. The DOCTR C-045 / C-064 / C-067 / C-071 lines stay deferred by the plan (DECISIONS §
  Deferred), not by this ticket.

## Diff review

Folded in from `.aiwf/RULEHOME-002-diff-review.md` (dispatch HEAD 6c4e627).

Acceptance criteria -> the defect each proof catches (written before the first paid pass): selfcheck
CI form exit 0 (a habit / Monitor / onFailure / wrapper row red, or a broken existing row);
run-spikes exit 0 (a shape not denied / a PASS case denied on either dialect); test-update exit 0
(migration 0032 malformed, the index not monotonic, a rerender op on a missing template);
validate-payload exit 0 (index last entry != plugin.json version); claude plugin validate exit 0
(hooks.json rejects `onFailure`); `onFailure` count 2 and none near the dispatch gate (the key on
Gate 2 flips its ASK); no `??` under scripts/engine, hooks (a fourth hook file); `habit` and
`Monitor` in both the hook and the self-check; `sh -lc` in the self-check (the runbook PASS case);
no `updatedInput` (D-06); no bare `review-brief|qa-brief|readiness-round.txt` (a skill naming the
old fixed path = a dialog on every pass); `BriefFile` in 5 files; no "do not make the path unique";
version 0.3.7 in plugin.json and `## [0.3.7]` in the CHANGELOG; no silerax/stratex in the payload;
the provenance grep empty.

Writer B (prose + release), read whole before its micro-rounds: WORKFLOW § Branch policy correct
(per-ticket files, the flag, "one at a time" dropped - the COO's decision); the recipe's delivery
bullet dense but true (three delivery forms in one breath); LOOP's `cd` clause, the habit-guard and
onFailure paragraphs, Monitor, the security model match the contract given to A; SESSION_BRIEF
RECIPE, ORCHESTRATOR template, writer template, the native README correct; the plan skill's
precondition paragraph and keyed files correct; review/qa skills' launch blocks, the "constant prefix
on purpose" paragraph, the resume forms, the "same ticket" overwrite sentence correct, B's two named
deviations right; the release files correct, ONE `Retires local rules:` line last in the block. The
micro-rounds (README § Status, OPERATOR_PROTOCOL Gate 4 entry, the recipe's PowerShell honest limit)
read and correct.

Writer A (code), read whole: the hook's header, `TOOL_MONITOR`/`dialectOf`, the habit block
(HABITS, the separator-aware splitter beside `subcommandsOf`, `habitWordsOf`, `habitOf`), the main
path deny after payload validation and before the verb logic, the exports; hooks.json; the four
wrappers (the flag read before any state read, the refusals, the bash readiness test, the BOM, the
help texts); the self-check rows and the brief-file probe table with its sabotage controls (the
refusals run as a bare resume with no state so the reason text pins the order); the spike rows. One
stale label noted ("stdin-only delivery").

Self-check duration (the operator asked whether the batch hung): 1458/1458 in 400 s at 6c4e627 vs
1565/1565 in ~516 s with the diff (both on a loaded machine); +107 rows then, +124 at the close;
the update-suite embeds the self-check in four fixtures (~32 min wall). A measurement, not a finding.

Narrowed tests: zero hits over the added code lines.

Codex pass 1 `fail`: (1) shape (5) over-matched (`echo git -c core.x=y`, bare `git -c`, `GIT -c` on
Bash); (2) the Bash dialect omitted the standalone `&` separator; (3) the bash wrappers' `read -t 0`
then `cat` could hang on a stdin that delivers a byte and stays open; note: the stale label. None
disputed a recorded decision -> correction round 1 with the COO's contract (first word `git`,
second `-c`, third carries `=`; a lone `&` a separator unless part of a redirect / two-char operator;
one bounded read, never `cat`, plus the `bf-open` probe). Round 1's delta read first-hand: correct.

Codex pass 2 `fail`: carried 1-3 CLOSED, the note CLOSED; two NEW, declared as born of round 1: the
64 KiB cap (65,536 spaces then `x` passed as whitespace) and the escaped `\>` before `&` read as a
redirect -> correction round 2 (the last within the cap): a read that FILLED the cap refused
unread; the redirect exception ignores an escaped `<`/`>`; one row + control each. Round 2's delta
read first-hand: correct (`codex-review.sh:125-143`, `pretooluse-git-verb-guard.js:552-581`).

Codex pass 3 `pass` (one dead attempt before it): carried 1 and 2 CLOSED, no new findings, no notes.

## Scratch

Per file in `.aiwf/` at the close (the scratch-keep rule, 6c4e627):

- `RULEHOME-002-diff-review.md` - folded into § Diff review above -> deleted.
- `RULEHOME-002-retires-sweep.md` - folded into § Retires sweep above -> deleted.
- `review-brief.txt` - its COVERED BY lines, the carried blockers and the contract stand in
  § Verification and § Diff review -> deleted (the ticket's close; D-18).
- `last-review-session.RULEHOME-002.txt` - the session id `01a192d2-1a9c-71b2-b2bf-11bae4f50f7e`
  stands in § Verification -> deleted.
- `checkpoint.md` - the live gate mechanic (overrides § Loop shape), rewritten whole for the next
  step; stays. `route-state.json` - `{}`; stays.

The session's own temporary directories (`...\Temp\rulehome-002\`, `...\Temp\rulehome-spike\`) are
not covered; the verify logs stay there as the sources of the numbers above.

## Closing checklist

- the operator's own run on a real input: the gates' outcome is visible only in a live session -
  spike (c) WAS the operator's own run (their paste quoted in § Spikes (c)); the habit guard and
  the flag reach the running product with the next session on 0.3.7 (`D:\pnp-live` refreshed at
  6bb25dc), so the operator's first `cd`-prefixed command or `/pnp:review` dispatch there is the run;
  recorded as pending that session, not as offline proof.
- the diff review folded in above - yes.
- the ticket's finding lines on their roadmap area entry: this ticket closed no roadmap finding line
  of its own (001's lines were marked in 1d6cbfe); it BORE one entry, § ENVOP - the roadmap's first
  write for it.
- every out-of-scope finding registered: the carrier (§ ENVOP); none else.
- the scratch evidence moved and the rest deleted - § Scratch, each file named with its destination.
- the next ticket: RULEHOME-003 in THIS session (the operator's word 2026-10-31), after Silerax runs
  `/plugin update` + `/pnp:update` to 0.3.7 in its own session (D-02) and the operator names the
  live Silerax session (D-07).

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| suspended by the operator 2026-10-31 (for the record: 2, counted from the auditor's verdicts) | suspended by the operator 2026-10-31 | D-11 |
