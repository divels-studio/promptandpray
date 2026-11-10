# 0043_dialog-language

**The question dialog is written in the operator's language. Rule 9 of the core says it in its own
words; this update re-renders the core.**

## What changes

`ORCHESTRATOR.md` (the core), § How the COO speaks to the operator:

- Rule 9: the dialog is the operator channel - its question, its option labels and their
  descriptions are written in `operator.language`, like every other message to the operator; the
  English of briefs and of the tree never reaches it.

Why: the language rule spoke of the conversation, and the dialog is a tool call. Written right after
an English agent brief, a dialog drifted into English partway through a session - observed in this
plugin's own development and on consumers.

Outside the rendered files: the seeded operator-channel line of `templates/CLAUDE.md.tmpl` (outside
the `aiwf-core` markers) reads "in chat and in every question dialog alike". A seed is written once,
so this reaches new installations only.

## What this migration does

- One `rerender-managed-region` operation: `.claude/aiwf-native/ORCHESTRATOR.md` (whole file), its
  additions block carried. No `createIfAbsent` or `ifRecorded`: the file exists on every installation
  since 0.3.8.
- One `note` (`dialog-language-0-3-18`): `/pnp:update` prints it with the CHANGELOG block of 0.3.18
  and its two `docRefs`. The release adds no stop for the operator's word, so the note carries no
  word-gate sentence.

## What it leaves alone

Every config key, the ask-ruleset, every other managed file - the stage files, the agents,
`AGENTS.md` and the managed `CLAUDE.md` region did not change - and every operator-owned file,
including the operator-channel line of an installed `CLAUDE.md`: reword it on the operator's word if
you want the new form.

## Superseded local rules

None.
