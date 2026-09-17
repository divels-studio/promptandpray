# 0011_transfer-surface

**A page the plugin seeds and then never touches again, and a release note that can say what it
retires.** Two changes, one release, and neither of them writes a file of yours: this migration
carries a single `note` operation.

## The transfer surface

An installation has had exactly one place for durable work - the plans under `<plansDir>` - and a
plan is the wrong home for four things that outlive it: work that is only PROPOSED, the RULING that
settled a conflict, what an auditor pass COST, and a rule-class EVENT worth a pointer. They ended up
in whatever document was open at the time, which is the same as not keeping them.

- **Where it is.** The configured `paths.transferSurface`, or `<plansDir>/PNP_CANDIDATES.md` when
  that key is absent. The key is optional and has **no schema default**, deliberately: a default
  would put it into every fresh config and invite exactly the managed-artifact treatment this file
  must never get. The resolution is a rule, stated in the same words by the schema, by
  `scripts/setup/generate.mjs` and by `docs/WORKFLOW.md`.
- **Who writes it.** `/pnp:setup`, once, from `templates/PNP_CANDIDATES.md.tmpl`, and only when
  nothing is there: a file that already exists is left byte for byte as it is, and reported as
  yours. That is the same one-time mechanism the overrides document has had since `0001_initial`.
- **What never happens to it.** No `_aiwf.managedRegions` record, no `--resolve` address, no
  `rerender-managed-region` operation - not in this release and not in a later one. The self-check
  asserts it is outside the managed set, with a control that injects a record for it and is required
  to fail. An update that could re-render this file would be an update rewriting the operator's own
  notes.
- **Who reads the key.** Setup (for the seed location and the containment check) and the doctrine.
  The update engine and the hooks never read it, so an installation that adds the key changes no
  behaviour it already has.

**If you are updating rather than installing fresh, nothing is created for you.** That is the
consequence of the paragraph above, not an omission: the only way this file could appear on an
existing project is an operation addressing it, and there is to be no such operation. Create it by
hand - the skeleton is written out verbatim in `docs/WORKFLOW.md`, under the transfer-surface
heading - or leave it absent until you want one.

## `supersedes` on a note

A release can now say which earlier records it RETIRES. `note` gains an optional `supersedes` list
of ids, and `CHANGES_<from>-to-<to>.md` prints each entry as a `Supersedes: <id>` line under the
note that carries it.

- **It applies nothing.** A `note` has never written a file of yours and still does not. The ids are
  a list to read and act on; what an installation calls those records locally is its own business,
  which is why the ids shipped here are generic rather than named after anybody's file.
- **The shape is checked.** `supersedes` must be an array of non-empty strings, on the same terms as
  `docRefs`. A bare string would be printed character by character, and an empty entry names nothing
  an operator could remove.

## The word-gate line

Every migration whose release introduces a word-gate carries this sentence in its note text, because
the note is the only thing that reaches the operator's `CHANGES` report:

> If this release introduces a word-gate: check your local rules for self-initiated dispatch or
> remediation - a rule written before this gate may contradict it.

The convention is written down in `migrations/README.md`. The reason it is a convention rather than
a field: a rule an installation wrote before a gate existed does not contradict the gate loudly - it
reads as a local habit, and the operator is the only one who can see both.

The operations.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one entry in your `CHANGES_*.md`: the transfer surface and where it resolves, that this migration deliberately does not create it, the new `supersedes` field, the five ids this release retires, and the word-gate line. It applies nothing. |

## What does NOT change

No config key is added (`paths.transferSurface` is optional and unset unless you set it), no managed
artifact is re-rendered, no permission rule is reconciled, and the four operation types keep their
exact semantics - `supersedes` is an optional field on one of them, not a fifth type.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene` through `0010_plan-prefix-legibility` still apply first, each with
its own operations and its own notes; this one follows them.
