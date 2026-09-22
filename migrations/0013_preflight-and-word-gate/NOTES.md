# 0013_preflight-and-word-gate

**Two defects found by a consumer, not by this repository.** The 0.2.8 arbitration was a session on
another installation reading this plugin's own documents against each other; what it surfaced was
not a disagreement about doctrine but two places where the payload said one thing in one file and
something else in another. Both are documentation defects, and a documentation defect is exactly the
kind a consumer meets first: nothing throws, nothing fails a check, and the session simply works all
day from the wrong page.

## The session doors listed three documents; the managed region requires four

`/pnp:mission` and `/pnp:work` are the two doors an operator opens a session with, and both spell
out the doctrine preflight the managed `aiwf-core` region of your `CLAUDE.md` states. Since 0.2.8
that region names FOUR documents - the two payload documents, your overrides document, and
`.claude/aiwf-native/ORCHESTRATOR.md`, the rendered standing rules the previous release created -
while both skills still listed three. The witness session read a door, not the region, and worked a
full day on a preflight that was one document short: the rendered role exists on the installation,
is named by the region, and was never opened.

Both skills now carry the region's own wording for that fourth document, and the self-check holds
the enumeration's three payload homes (the region template and the two skills) together, with a
negative control per home - so the next time one of them moves ahead of the others, an assertion
goes red instead of a consumer discovering it.

## A seed that printed a reading the doctrine had revoked

`templates/memory-seeds/` is what `/pnp:setup` PRINTS for an operator's own memory. The seed for
guard (b) ended on "a notification, not a question" - the reading `docs/WORKFLOW.md` explicitly
revokes, because it was observed letting a ticket be born AND started without an operator word.
Seeds are pointers by contract: they name the doctrine section and let it hold the text. This one
restated it, and restated the retired version.

The seed is now a pointer. Guard (b) holds the full text and gained the sentence the seed used to
contradict: the loop runs to the end of what that word covers, and every further paid pass takes its
own word. Guard (g) gained the other half the arbitration asked for - when an
operator's remark becomes a standing rule; guard (g) itself holds that text, and this note
deliberately does not restate it. The planning lock's memory sentence now defers to
guard (g) for a rule-bearing write instead of reading as a blanket exemption, and the seeds
directory is named in the fourth tripwire as a home the closing grep of a doctrine change covers -
which is the instrument that would have caught this seed years earlier than a consumer did.

One operation, and it writes nothing.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one entry in your `CHANGES_*.md`: the four preflight documents, the seed that no longer restates a revoked reading, what guard (b) and guard (g) now say, the word-gate line this release's gate requires, and the id it retires. It applies nothing - a note that announces a change is not the note performing one. |

**Why `supersedes` and not an operation.** `dispatch-waits-for-operator-word` is a SEED: what an
installation holds is a record the operator wrote from a printed text, under whatever name that
operator's memory uses. No operation of this plugin may touch it - a `note` never writes a file of
yours - so the id is retired and named, and refreshing the local record from the new seed text is
your call to make.

## What does NOT change

No managed artifact is re-rendered by this migration, no config key is added, no permission rule is
reconciled, and no schema default moves. The skills and the payload documents are payload: you get
them with the version itself, not through an operation. Nothing on your installation is written by
this release.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene` through `0012_orchestrator-role` still apply first, each with its
own operations and its own notes; this one follows them.
