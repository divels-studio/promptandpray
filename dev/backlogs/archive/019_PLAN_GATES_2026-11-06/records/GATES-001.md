# GATES-001 - the habit guard denies every `git -C` and reads through a leading operator

## What landed

`4122b27` (code, Writer, `Refs: GATES-001`; 9 files, +275/-85):
- `scripts/engine/pretooluse-git-verb-guard.js` - shape (6) `git -C`: `HINT_FOREIGN_TREE` (D-01's hint
  verbatim), `HABITS.gitDashCapitalC`; the match is the first word in `HABIT_GIT_PROGRAMS` (folded on
  PowerShell only) and a second word starting `-C`, never folded. `Push-Location`, `Pop-Location`,
  `popd` join `HABIT_DIRECTORY_CHANGERS`. `habitReadThrough` reads the first word through a leading
  run of `$(`, `&`, `{`, `(` (glued or spaced) and a whole-word `.`, then strips the first word's
  trailing `)` / `}` (correction round 1). `habitSegmentsOf`, `habitWordsOf`, the ask-reason text
  unchanged. Header and comments: six shapes, the read-through, the quotes limit.
- `scripts/selfcheck/aiwf-selfcheck.js`, `scripts/spike/run-spikes.mjs` - the rows that pinned a `-C`
  form as silent or ASK pin the habit deny; new DENY rows and PASS twins for D-01/D-02 on both tools;
  an ASK control `echo $(git -C /p push)` for a `-C` deeper in a subcommand; the SomeFutureShell
  dialect control moved to `echo X & cd scripts`, and `npm test |& tail -5` under SomeFutureShell is
  pinned as the habit deny.
- Prose: `docs/LOOP.md`, `docs/OPERATOR_PROTOCOL.md`, `README.md`, `hooks/hooks.json`,
  `scripts/engine/aiwf-lib.js` header, `templates/ORCHESTRATOR.md.tmpl` (the "-C forms ask by
  construction" sentence replaced). The template reaches the self-install with GATES-005's
  migration 0037 (D-10).
- Unchanged by D-01: `templates/settings.ask-ruleset.json` and `ownedAskRules` (the six
  `git -C <projectRoot>` ask rules).

The live copy `D:\pnp-live` was refreshed to `4122b27` after the commit.

## Decisions and deviations

- The SomeFutureShell `|&` control (selfcheck, spikes) flipped under D-02 - a PASS row off A3/A4's
  list, the ticket's stop condition. COO decision: the guard is right (in the PowerShell dialect `|`
  pipes and the call operator `&` is read through, a real pipe into tail); the control moved to a
  lone `&`, and the new behaviour got its own row.
- Correction round 1 answered the auditor's one blocker (glued closers) with the closer strip on the
  first word only. No verification pass: the code delta was ~7 lines in a file pass 1 audited, with
  tests seen red before the fix, and no migration / access-policy / grants / auth surface
  (`ticket.md` § Loop shape and its overrides, the suppression dual).
- Writer deviations inside the Code Map: extra comment edits in the guard (face (2) list, the
  habit-section `&` comment) and the spike comment, the PowerShell PASS twin `git -c /p log`.

## Events

| 2026-11-06 | GATES-001 stop condition (a PASS row off A3/A4 flips) | catch | the Writer's hand-back said no such row flipped; the COO's Verify run 1 found the SomeFutureShell `|&` control red in both suites (selfcheck :1941, spikes :556) |

## Verification (what actually ran)

COO, Portion 1, logs outside the repository (session scratchpad):
- run 1 (hand-back): `node scripts/update/validate-payload.mjs --plugin-root .` exit 0; render dry-run
  `node scripts/setup/generate.mjs --answers-file examples/example-project/answers.json --project-root
  <scratchpad>/verify-gates001/render-001 --plugin-root . --no-selfcheck` exit 0;
  `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture .` exit 1 (one [FAIL],
  the SomeFutureShell control); `node scripts/spike/run-spikes.mjs` exit 1 (`checks: 454, failures: 1`).
- run 2 (after the micro-round): selfcheck exit 0 `==== 1634/1634 assertions passed ====`; spikes
  exit 0 `checks: 456, failures: 0`.
- run 3 (after correction round 1): selfcheck exit 0 `==== 1641/1641 assertions passed ====`; spikes
  exit 0 `checks: 472, failures: 0`.
- The ticket's Acceptance one-liners, run by the COO before the review: no `MISSED` / `FALSE` line;
  the Explore `git -C .. status` deny carries `habit: git -C` and `file tools`; the PowerShell
  `& { Push-Location .. }` deny carries `habit: cd prefix`; `five shapes` and `ask by construction`
  greps empty; ruleset `git -C <projectRoot>` count 7; `Push-Location` in the guard 4; skills `& {` /
  `& (` empty; provenance grep empty (also after round 1).
- Fact-check gate (`/pnp:review` Step 2b, one Explore agent on sonnet): `CLAIMS: total=55
  verified=55 false=0 unverifiable=0`.
- Auditor: Codex code pass 1 (gpt-6-sol / xhigh, cold, session `01a1b099-2989-7200-bb48-6a1fed65db97`),
  covered by the operator word "da" (2026-11-06): `fail`, one blocker - a glued closer left on the
  first word (`&{Pop-Location}` passed, `echo x | (head)` not seen as a pipe); notes: the
  SomeFutureShell repair correct, no other PASS row flipped, the six ask rules stay.
  `tokens used 67,829`. The review brief: `GATES-001-review-brief.md` beside this record.

## Remaining debt

None.

## Diff review

- Read whole at the hand-back (9 payload files) and again over the round-1 delta
  (`habitReadThrough` :640-662).
- Per acceptance criterion, the defect each proof sees: a missed or false form -> a `MISSED`/`FALSE`
  line; a deny without the label or the hint -> the reason lacks `habit: git -C` / `file tools` /
  `habit: cd prefix`; stale prose -> a `five shapes` / `ask by construction` hit; a removed ask rule
  -> a count other than 7; a skill command the read-through now judges -> an `& {` / `& (` hit; a stale
  row -> selfcheck/spikes exit != 0; Cyrillic -> a provenance hit.
- Narrowed tests: every `skip|only|todo` hit in the added lines is the English word "only"; no test
  marker, no reduced row set.
- Notes: `docs/OPERATOR_PROTOCOL.md` keeps one long reflowed line (cosmetic); the working copy of
  `scripts/engine/aiwf-lib.js` was CRLF, the commit carries LF (`.gitattributes` `eol=lf`).

## Scratch

- `.aiwf/GATES-001-diff-review.md` - folded into § Diff review, § Verification and § Events above, then
  deleted.
- `.aiwf/GATES-001-review-brief.txt` - moved verbatim to `records/GATES-001-review-brief.md`, then
  deleted.
- `.aiwf/last-review-session.GATES-001.txt` - its one line (the session id) stands in § Verification
  above, then deleted.
- `.aiwf/checkpoint.md` (the project's gate checkpoint, rewritten whole at every gate) and
  `.aiwf/route-state.json` (cleared to `{}`) stay.

## Closing checklist

- the operator's own run on a real input: n/a - no product UI; the hook's behaviour is proven by the
  selfcheck and spikes rows through the real hook process (overrides § Test policy);
- the diff review folded in above: yes;
- the ticket's finding lines on ROADMAP § GATES: the `git -C` line (harvest S1 + F20) and the nested
  form line (harvest S6) marked `done 4122b27`;
- out-of-scope findings: none;
- scratch: § Scratch above;
- the next ticket: GATES-002 can run in this session (COO session at 240,000 tokens).

## Measurements

| correction rounds | COO session at close | source |
|---|---|---|
| 1 | 240,000 tokens (24% of 1,000,000) | `~/.claude/ctx/b1055be9-1bbc-46c6-bbe2-399302ca2b5f.pct` and `.size` |
