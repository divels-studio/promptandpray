# 0003_quiet-rerender

**One operation: `CLAUDE.md#aiwf-core` is re-rendered.** The managed region's list of operator gates
named "expensive-quota passes" as a category with no mechanics, and read literally it made the
orchestrator ask for permission before *every* paid review pass - contradicting the rule that the
loop runs to the end after the word. The region now states the mechanics instead: the passes the
route already prescribes run on the ticket's standing word, and only a pass BEYOND the review
contract (a third plan-readiness pass, a correction round past the cap) needs its own word. Nothing
else managed changed in 0.1.2 - not another template, not the ask ruleset.

This is also the first migration that exercises 0.1.2's new rule on a real installation: if you have
not edited that region, the new render is applied **silently**, with no dialog at all - the run just
records `CLAUDE.md#aiwf-core: the payload version applied (you had not edited it)`. If you did edit
it, or you hold it through an override and edited it again, you get the usual take-new / keep-mine /
merge dialog and your file is left untouched until you decide.

## What changed, and why you will notice it next time

The update engine no longer treats a payload change as a conflict on its own.

Until 0.1.1 an artifact was brought to you through a dialog when **either** you had edited it **or**
the payload had changed it. The second half was the normal path of every migration: a release that
re-rendered `CLAUDE.md#aiwf-core` and `.claude/agents/writer.md` asked you to choose take-new for two
files you had never opened. A question you cannot answer wrongly is not a gate; it is noise in front
of the gates that matter.

From 0.1.2 the rule is one predicate:

- you edited the artifact, or it is GONE -> the same dialog as before (take-new / keep-mine / merge);
- you hold it through an override AND edited it again -> the same dialog;
- you hold it and did not touch it -> unchanged behaviour: the new render is RECORDED as upstream and
  **not** applied;
- you never touched it and the payload moved -> applied, without asking, through exactly the same
  code path an operator take-new goes through (same journal, same stage, same resume). The run says
  why: `<key>: the payload version applied (you had not edited it)`.

Nothing was loosened around your content: an edited artifact, a deleted one and a held-and-edited one
all still stop the run and leave the file untouched.

## What the report tells you, and what it deliberately does not

Every `rerender-managed-region` line in the "Applied" section of `CHANGES_<old>-to-<new>.md` now
carries the artifact's final state, read from the bookkeeping and from nothing else - which is what
makes the report identical whether your update ran in one process or resumed twice after a crash:

- `payload-current` - the payload version is what is on disk;
- `held (your version kept)` - your own content stands.

Two accepted boundaries follow from that, and they are boundaries, not omissions:

1. **auto vs. operator take-new is not distinguished.** Both end at `override: false` with
   `upstream == local`, and the bookkeeping records the state, not who decided it. The distinction is
   visible while the run happens (the per-operation summary above) and nowhere afterwards.
2. **applied vs. already-current is not distinguished either**, for the same reason - and when a
   migration re-renders one key twice, the line describes the final state, not each step.

The report also carries one sentence saying which artifacts were applied without a dialog, which were
asked about, and which were only recorded.

## If you are updating from 0.1.0

`0002_operator-word-and-hygiene` still applies first, with its own operations and its own notes; this
migration follows it.
