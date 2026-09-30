# 0018_verdict-own-turn

**A reported verdict was read as a stop.** The Orchestrator rule "a verdict and the next dispatch
never share one message" commanded an action - report the verdict on its own - but was written as a
prohibition with no suppression dual. In Claude Code a reply that ends without a tool call ends the
turn, so "a separate message" silently became "stop and wait", and the loop halted at steps that
need no operator word.

## What changes

- **§ Verdict and dispatch** in the Orchestrator rules now reads "a verdict gets its own message,
  not its own turn": the verdict still reaches the operator on its own, with one or two sentences of
  its substance, and the next dispatch comes after it, never inside it.
- **Its suppression dual**: reporting a verdict is not a stop. When the next step needs no operator
  word, the COO writes the verdict message and goes on in the same turn. The loop halts where the
  doctrine puts a halt - a dialog, a word the doctrine requires, an escalation, an operator stop,
  the stop condition - and never because a verdict was reported.

## What this migration does

- **Re-renders `.claude/aiwf-native/ORCHESTRATOR.md`** with the new section. An installation that
  never edited the file gets the new render silently; an edited file raises the usual conflict
  question; an artifact held through an override is not applied - the new render is recorded as
  upstream.
- **One `note`** saying the above. Nothing that was valid before this release becomes invalid.

## Superseded local rules

A local memory or rule saying the loop does not stop after a verdict can become a one-line pointer
to this section.
