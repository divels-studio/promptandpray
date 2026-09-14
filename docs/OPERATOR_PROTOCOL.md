# Operator protocol - the three doors

> How you start a session with PromptAndPray. One page, written for someone seeing the system for
> the first time. The full rules live in `docs/WORKFLOW.md` and `docs/LOOP.md` - this page is only
> the entrance.

## The three doors

Every session starts in one of three ways. You choose - nothing is loaded on you by force.

### Door 1 - no command: free conversation

You just type. Only the thin `CLAUDE.md` is loaded (role, gates, base rules) - zero extra token
cost. Good for: discussion, analysis, thinking out loud, questions. If the conversation turns into
work halfway through, the session loads the doctrine itself (the preflight rule in `CLAUDE.md`) -
you do not need to restart.

### Door 2 - `/pnp:mission`: continue the mission

No brief? You do not need one. The command reconstructs the context from the real sources - the
active PLAN, memory, the git state - and writes its own brief. At the end it reports one line of
state plus the next ticket, and WAITS for your word. You type only `/pnp:mission`.

### Door 3 - `/pnp:work`: work outside a mission

Loads the full doctrine (dispatch through the Writer, Reviewer/QA, the cheap-subagent policy, token
economy), then asks what you want to do. No protocol explaining on your side. A small task (R1) is
executed directly; anything heavier (R2/R3) first gets a ticket in a plan and waits for your word.

## What is guaranteed REGARDLESS of the door

The rules do not rely on the session "remembering" them - they are enforced mechanically:

- **Gate 1 (hook)** - the Reviewer and QA are physically read-only: the PreToolUse mutation guard
  blocks the Edit/Write family from every subagent except the Writer, and their tool allowlist is
  `Read, Grep, Glob` only.
- **Gate 2 (hook)** - a Writer dispatch through the Agent tool surfaces a native **Yes/No** dialog
  at your end. You choose how often, in `enforcement.dispatchGate`: `always` (the factory value) is
  a dialog on **every** dispatch, so no reviewed (R2/R3) implementation starts without your click;
  `off-plan` is a dialog only when the brief's `Ticket: <REF>` line names no ticket in an active
  PLAN - work nobody planned - and silence otherwise. Anything the hook cannot read (no config, a
  broken one, a value it does not know) behaves as `always`: a broken config costs you clicks, never
  silence. Either way it gates the Writer path, not every write: routine R1 work and the session's
  own docs edits are main-session work and do not raise this dialog - Gate 3 below is what bounds
  them while a ticket is open.
- **Gate 3 (hook)** - while a ticket is dispatched, the main session cannot edit code: with an open
  R2/R3 route recorded in `.aiwf/route-state.json` it may write only docs, `.aiwf/` and root
  `*.md`. Code goes to the Writer, where the review gates are.
- **Gate 4 (hook)** - a git command whose verb is one of the gated ones (commit, push, reset,
  checkout, ...) is **refused outright** when a background agent tries to run it: its dialog would
  never reach your screen. From the session itself nothing changes for the commands you already
  know - `git commit -m ...` raises the one dialog it always did, and so do the chained and
  `timeout`-style forms, which Claude Code's permission documentation says it matches by subcommand
  and past stripped wrappers on its own. What is new is a prompt
  for the spellings your rules never covered: `git.exe <verb>` outside push/merge/rebase, any
  `git -C <path> <verb>`, and a git command behind a wrapper the harness does not strip, such as
  `sudo` or `npx`. So a new prompt here means "this command would have run unasked", not "one more
  click for the same command" - and where a rule does match, the hook and the rule collapse into a
  single dialog rather than two.
  **Which tools this covers:** both shells. The gate is wired on `Bash|PowerShell` and every
  permission rule exists twice, once per tool, so a Windows session that carries a `PowerShell` tool
  alongside `Bash` gets the same dialog either way - and `Monitor`, which has no rules of its own,
  runs its commands under the Bash ones. On PowerShell the prompts are slightly more generous,
  because less is documented about how that tool's commands are matched: a prefixed command such as
  `timeout 30 git commit` asks there while staying silent on Bash. **Where a prompt could still be
  missing entirely:** a harness tool that neither layer names. That is the one gap here that needs no
  unusual command, only another tool, so an agent with a broad tool allowlist could pass this gate by
  choosing one - and closing it for a tool that exists is a two-line change, listed in
  `docs/LOOP.md`.
- **Commit** - a visual Yes/No dialog at your end (an `ask` permission rule), on every attempt
  through either shell tool. The click IS the approval: you type nothing, and there is no token or
  state file behind it.
- **Push / merge / rebase** - the same dialog, **plus** an explicit word from you in the chat. Two
  independent gates, because these are the irreversible ones.
- **Destructive and system-changing commands** (resets, deletes, database and container operations)
  - a dialog at your end, always - with the same tool scope as above.

So an outsider with the plugin cannot break the process out of ignorance - the system stops them and
says why. The commands supply the knowledge; the gates guarantee the behaviour.

Two honest limitations. The permission rules are **prefix matches** on the command text, and every
one of them - like the hook behind them - is addressed to a **tool**: both shell tools are covered,
each rule twice, but a harness tool neither layer names would be outside all of it (see the Gate 4
entry above). They are
accident-grade protection against a role acting out of turn, not an adversary-proof boundary. The
one hard boundary in the system is the OS sandbox on the Codex review path.

## What audits what - one command

`/pnp:roles` prints the **audit table**: every role and every review class on one screen, with the
engine, the model, the effort and the number of passes each one gets, plus the two lines that are
not configurable at all - the fact-check gate (always, before every pass above the scan tier) and
R1 (no auditor by design). `/pnp:mission`, `/pnp:work` and `/pnp:setup` print it in their reports,
so you see who will audit the work before you decide what to ask for.

The same command changes it, with no re-interview: `/pnp:roles --set docs.engine=claude` gives
documentation diffs their own Claude host, `/pnp:roles --set plan.passes=3` raises the CEILING of
readiness passes a plan may get (the first runs on your word for the ticket, each further one on a
word of its own - one word per pass), `/pnp:roles --reset docs` puts a class back on the Reviewer.
It refuses rather than guesses - a result your schema rejects, an artifact you edited by hand or
hold through an override, a stale agent file without `--confirm-remove-stale` - and a refusal
leaves the project exactly as it was.

Nothing here is a gate: changing the table is your configuration, not one of the four approvals
above. What the table cannot do is remove a gate - a pass beyond `review.plan.passes` still needs
your word, and the commit dialog still appears.

## Worktrees and memory

A git worktree is a **different path**, and Claude Code keys a project - including its memory
directory, `~/.claude/projects/<path-slug>/memory` - by that path. So a second worktree of the same
repository is a second project to the harness: it starts with **empty memory**, and anything the
session learned in the main worktree is not there.

Nothing in the plugin changes this, and nothing in the plugin should: memory is a harness surface,
not a PromptAndPray mechanism. What it means for you in practice:

- copying memory into a worktree is a manual copy, and merging what both sides learned is a manual
  merge - there is no sync;
- the durable knowledge that must survive the worktree is exactly the knowledge that belongs in Git
  anyway (the PLAN, the overrides document, the changelog) - that is the point of "durable knowledge
  lives in Git";
- deleting a memory directory under `~/.claude/projects/` is a destructive operator action like any
  other: your call, made deliberately, never a cleanup step an agent performs on its own.

## What is doctrine rather than a hook

Two things are carried by the doctrine text and the roles' own briefs, not by a hook. First,
Gate 3 only arms itself if the session actually records the open ticket in `.aiwf/route-state.json`
- writing that file is a convention, and nothing enforces the convention itself. Second, the hooks
see the Edit/Write tool class only, so a mutation performed through a shell command is outside them
and stays doctrine. Doctrine is not weaker here - it is simply enforced by review instead of by a
dialog.
