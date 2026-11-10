# 0044_decision-title-form

**The plan gate reads a decision bullet whose title stands inside the bold, `- **D-NN <title>**`,
like the form `/pnp:plan` writes, `- **D-NN** <text>`. A code-only release: one `note`, no managed
file re-rendered.**

## What changes

`scripts/engine/plan-gate.js`:

- A decision bullet of a `DECISIONS.md` is recognised in both forms: the bold closed right after the
  number (`- **D-07** Title`), or continuing after a separator with the title and closed later on the
  same line (`- **D-07 Title.**`, `- **D-07: Title**`). Not a decision: three digits (`- **D-071**`),
  a letter glued to the number (`- **D-07x**`), a bold never closed on its line.
- Two consequences of the title form being read:
  - a plan whose `DECISIONS.md` writes the title form now has its own decisions read, so the "every
    decision cited" check may newly refuse such an ACTIVE plan when one of its `plan:`-tagged
    decisions is cited by no ticket and no index line (`decision-uncited:D-NN`);
  - a `<X>/D-NN` cross-reference into such a plan, active or archived, now resolves and is hashed
    into the stamp, where it was refused as `decision-xref-unresolved:<X>/D-NN`.
- The refusal reason of an unresolved cross-reference names both forms; the token is unchanged.

A bullet of the first form is parsed and hashed exactly as before, so every existing stamp over a
first-form plan stays valid.

`/pnp:plan` (`skills/plan/SKILL.md`):

- Step 3: one clause after the bullet form - the gate also reads `- **D-NN <title>**`, the form of
  plans written under an earlier version; a new plan keeps `- **D-NN** <text>`.

## What this migration does

- One `note` (`decision-title-form-0-3-19`) and no other operation: `/pnp:update` prints it with the
  CHANGELOG block of 0.3.19 and its two `docRefs`. The release adds no stop for the operator's word,
  so the note carries no word-gate sentence.

## What it leaves alone

Every config key, the ask-ruleset, every managed file - no rendered template changed, so the core, the
stage files, the agents, `AGENTS.md` and the managed `CLAUDE.md` region are not re-rendered - and
every operator-owned file, every plan and every stamp. The plan gate and the skills are read from the
plugin root, so they arrive with the version and need no write in the project.

## Superseded local rules

None.
