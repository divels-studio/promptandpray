# 0037_habit-gates-and-codex-output

**Four rules sessions kept breaking move from prose into mechanism: the habit guard denies a
`git -C` that opens a command and reads through a leading call operator or block opener; Gate 1 lets a non-writer write
outside the project root; the plan gate refuses side-by-side tickets whose Code Maps share a path;
the Codex review and QA wrappers send the engine's stream to a log and print the verdict from `-o`.**

## What changes

- The habit guard (`scripts/engine/pretooluse-git-verb-guard.js`, every actor, both shell tools) -
  a sixth shape: `git -C <path> ...` and `git -C<path> ...` as the first words of a command segment
  are denied for every verb, with the hint
  to run git bare from the repository root and to read a foreign tree with the file tools.
  `Push-Location`, `Pop-Location` and `popd` join the `cd` prefix, and the first word of a segment is
  read through a leading `&`, `{`, `(`, `$(` or a whole-word `.`, so `& { Push-Location x }` is
  judged by `Push-Location`. Quotes stay opaque (`docs/LOOP.md`). A `git -C` deeper inside a segment
  (`echo $(git -C <path> status)`) is not read.
- `ORCHESTRATOR.md` § Branch policy - the sentence that said the `-C` forms ask by construction now
  says the habit guard denies them and the `git -C <projectRoot>` ask rules stay as the dialog for a
  project whose hooks are off.
- Gate 1 (`scripts/engine/pretooluse-mutation-guard.js`) - a non-writer subagent's Edit / Write /
  MultiEdit / NotebookEdit passes through when every path field it carries (`file_path`,
  `notebook_path`) resolves outside the project root; a path inside, the root itself, a missing or
  non-string field, or no path field at all is denied with the same text as before. The path is
  judged lexically, without resolving links.
- The plan gate (`scripts/engine/plan-gate.js`) - zero or more `Side by side: <REF>, <REF>[, <REF>
  ...]` lines at column 0 of a plan index; a malformed line refuses with `sidebyside-malformed`, an
  unknown or repeated ref with `sidebyside-unknown-ref`, and every path two refs of one line share in
  their Code Maps (equal, or a directory containing it; the longer path named) with
  `sidebyside-shared-path`. No line, nothing checked. `templates/briefs/planner.md` (read from the
  plugin root) and `plan.md` § Plan readiness review name the line.
- The Codex review and QA wrappers (`scripts/native/ps/`, `scripts/native/sh/`) - codex's stdout
  and stderr go to one log `<temp>/pnp-codex/<key>-<class or role>-<timestamp>-<pid>.log`, the
  engine's final message to the `-o` file `<stem>.last.txt` beside it. The wrapper's stdout is that
  final message and nothing else; stderr carries the run line, then after the run the tokens line
  (the engine's last `tokens used` figure, labelled cumulative on a resume, never computed), the
  capacity line when the engine refused at capacity, the no-verdict line when codex wrote no final
  message, the log line and the exit line. The exit code stays codex's. The QA wrapper carries the
  same lines with the `codex-qa:` prefix; QAL is unchanged.
- `scripts/native/codex-capture.mjs` (new, zero dependencies) - the PowerShell channel launches
  codex through it, because Windows PowerShell 5.1 re-encodes a redirected native stream; it resolves
  codex from `PATH` without a shell and writes both streams to the log at the OS level. The bash
  channel redirects with `> "$log" 2>&1`.
- `/pnp:plan` Step 6, `/pnp:review`, `/pnp:qa` and `docs/CODEX_REVIEW_QA_RECIPE.md` read the verdict
  and the lines above.

## What this migration does

- Two `rerender-managed-region` operations: `.claude/aiwf-native/ORCHESTRATOR.md`,
  `.claude/aiwf-native/doctrine/plan.md`.
- One `note` (`habit-gates-and-codex-output-0-3-12`): `/pnp:update` prints it with the CHANGELOG
  block of 0.3.12.

The hooks, the plan gate, the wrappers, the capture helper, the skills and the planner brief are read
from the plugin root, so they take effect with the plugin update itself; no operation carries them.

## What it leaves alone

Every config key, the ask-ruleset - the `git -C <projectRoot> push|merge|rebase` ask rules stay, so
no `reconcile-ask-ruleset` operation - and every operator-owned file. The additions blocks of the two
re-rendered files are carried.

## Superseded local rules

The CHANGELOG's `Retires local rules:` line names one: a "side-by-side tickets" rule in `plan.md`'s
additions block, now carried by the plan gate and the planner brief. Delete it on your operator's
word.
