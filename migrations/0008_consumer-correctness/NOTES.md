# 0008_consumer-correctness

**A directory setup used to adopt in silence.** An install pointed at a project whose
`<plansDir>/active/` already held `PLAN_*.md` files said nothing about them. That is not a cosmetic
omission: with `enforcement.dispatchGate: off-plan`, **Gate 2** treats a Writer dispatch as planned
when the brief's `Ticket: <REF>` line appears in a `PLAN_*.md` file under that directory, and stays
**silent** instead of raising the Yes/No dialog. Pointed at somebody else's plans, the gate goes
quiet on refs nobody in this loop ever approved - and the operator was never told which directory
had just been given that authority.

One operation, and it writes nothing.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one paragraph in your `CHANGES_*.md`. This release changes the setup engine; it changes nothing that is already installed. |

## What changed in `/pnp:setup`

Two questions now look at the project **before** they are answered - the offered default first, then
whatever is typed, because a typed answer names a different path from the default:

- `paths.plansDir` - an existing `<path>/active/` holding `PLAN_*.md` files prints
  `N existing PLAN_*.md in <path>/active - Gate 2 off-plan will read them as active pnp plans; pick
  another paths.plansDir if they are not.` The count is the set Gate 2 itself would read: a real
  file whose name matches `PLAN_*.md`, so a directory with that name and a `notes.md` beside it are
  not counted.
- `paths.overridesDoc` - a file that already exists prints that setup seeds that document once and
  never rewrites it, so this install will write no template there. The behaviour is old and correct;
  saying it is the new part.

The generator repeats the plans line as a `note` in its plan and in its report, so `--dry-run` shows
it, and so does the non-interactive `--answers-file` install - the path that never sees a question at
all.

**Neither line is a blocker.** An operator may be pointing setup at exactly that directory on
purpose; an install is never refused over it, and the report line sits next to the other notes rather
than in the `BLOCKED` list.

## What does NOT change

No managed artifact is re-rendered, no config key is added, no permission rule is reconciled, and no
schema default moves: `paths.plansDir` is still `docs/backlogs` and `paths.overridesDoc` is still
`docs/ai/PROJECT_OVERRIDES.md`. Gate 2's own behaviour is untouched - this release makes the
installation honest about which directory the gate was handed, and nothing more.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene`, `0003_quiet-rerender`, `0004_audit-table`, `0005_posix-legs`,
`0006_git-verb-gate` and `0007_powershell-ask-ruleset` still apply first, each with its own
operations and its own notes; this one follows them.
