# 0032_rule-homes

**Every rule stands where the role that obeys it acts: the rendered files carry the rules of
0.3.7, the review and QA brief is a per-ticket file passed through a flag, and a habit guard denies
the shell habits the doctrine forbids.**

## What changes

- The managed `CLAUDE.md` region, `.claude/aiwf-native/ORCHESTRATOR.md` and `.claude/agents/writer.md`
  carry the 0.3.7 text: a QA pass that follows the review rides the ticket's word, the planner's
  Gate 2 exception, a plan-recorded bar as a recorded decision, the `COVERED BY` line naming the
  per-ticket brief file; the Writer agent's digest of the brief contract (replacing the reading of
  WORKFLOW), the commit step after DONE, and the no-`cd` line with the habit guard behind it.
- `scripts/native/ps/codex-review.ps1`, `scripts/native/ps/codex-qa.ps1`,
  `scripts/native/sh/codex-review.sh`, `scripts/native/sh/codex-qa.sh` take `-BriefFile <path>` /
  `--brief-file <path>`: with the flag the brief is read from that path (a missing, unreadable,
  empty or whitespace-only file is exit 2 before any paid call); without it from stdin as in 0.3.6;
  the flag and a non-empty stdin together are exit 2. The 0.3.6 key rule is unchanged. QAL is not
  changed.
- The skills write the brief to `<scratchDir>/<key>-review-brief.txt` (QA: `<key>-qa-brief.txt`; the
  plan skill's round file `<key>-readiness-round.txt`), `<key>` being the session-state key, and
  launch the wrapper with the path after the flag - a constant command prefix, no pipe.
- `hooks/hooks.json`: `onFailure: "block"` on the Gate 1/3 and Gate 4 commands; Gate 2 unchanged.
  The Gate 4 hook file gains the habit guard (a pipe into `tail` / `head` / `Select-Object -First|-Last`,
  a leading `cd` / `chdir` / `pushd` / `Set-Location` / `sl`, `git -c <k=v>` - denied with a hint,
  every actor, both dialects) and judges `tool_name: Monitor` in the Bash dialect.

## What this migration does

- Three `rerender-managed-region` operations: the `aiwf-core` region of `CLAUDE.md`,
  `ORCHESTRATOR.md` and the Writer agent. The Reviewer, QA and `AGENTS.md` templates did not change -
  no operation for them.
- One `note` (`brief-file-launch-0-3-7`): `/pnp:update` prints it with the CHANGELOG block of 0.3.7.

## What it leaves alone

Every config key you set, the ask-ruleset, every operator-owned file, every project additions block,
and the files in your scratch directory (the old fixed `review-brief.txt` / `qa-brief.txt` /
`readiness-round.txt` are no longer read).

## Superseded local rules

A local allow rule written on the 0.3.6 pipe form of the review / QA launch stops matching; write
it again on the 0.3.7 prefix. The rules the payload now carries are named on the CHANGELOG block's
`Retires local rules:` line; deleting them from your overrides document is your act.
