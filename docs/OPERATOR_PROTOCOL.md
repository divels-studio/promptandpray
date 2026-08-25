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
- **Gate 2 (hook)** - every Writer dispatch through the Agent tool surfaces a native **Yes/No**
  dialog at your end, so no reviewed (R2/R3) implementation starts without your click. It gates the
  Writer path, not every write: routine R1 work and the session's own docs edits are main-session
  work and do not raise this dialog - Gate 3 below is what bounds them while a ticket is open.
- **Gate 3 (hook)** - while a ticket is dispatched, the main session cannot edit code: with an open
  R2/R3 route recorded in `.aiwf/route-state.json` it may write only docs, `.aiwf/` and root
  `*.md`. Code goes to the Writer, where the review gates are.
- **Commit** - a visual Yes/No dialog at your end (an `ask` permission rule), on every attempt. The
  click IS the approval: you type nothing, and there is no token or state file behind it.
- **Push / merge / rebase** - the same dialog, **plus** an explicit word from you in the chat. Two
  independent gates, because these are the irreversible ones.
- **Destructive and system-changing commands** (resets, deletes, database and container operations)
  - a dialog at your end, always.

So an outsider with the plugin cannot break the process out of ignorance - the system stops them and
says why. The commands supply the knowledge; the gates guarantee the behaviour.

One honest limitation: the permission rules are **prefix matches** on the command text. They are
accident-grade protection against a role acting out of turn, not an adversary-proof boundary. The
one hard boundary in the system is the OS sandbox on the Codex review path.

## What is doctrine rather than a hook

Two things are carried by the doctrine text and the roles' own briefs, not by a hook. First,
Gate 3 only arms itself if the session actually records the open ticket in `.aiwf/route-state.json`
- writing that file is a convention, and nothing enforces the convention itself. Second, the hooks
see the Edit/Write tool class only, so a mutation performed through a shell command is outside them
and stays doctrine. Doctrine is not weaker here - it is simply enforced by review instead of by a
dialog.
