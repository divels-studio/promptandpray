# 0010_plan-prefix-legibility

**Nine rows in one stream, and a reader who cannot tell a structural blank from an unset value.**
The audit table is the one screen that answers "who audits this work, on which engine, with how many
passes", and it was printing four different KINDS of row as one undifferentiated list. A dash in a
role's `passes` column means "a role is not a review class"; a dash on the fact-check row's `effort`
means "nothing about this gate is configurable"; `0 / no auditor` on the R1 row is the route stating
there is nothing to configure. Read in one stream they all look like the same thing - a setting
somebody did not fill in.

- **The table prints as four labelled blocks.** One header, then
  `-- roles (who does the work) --` (writer / reviewer / qa / qal),
  `-- review classes (what gets audited, how many passes) --` (plan / code / docs),
  `-- always-on gate --` (fact-check) and `-- routes --` (R1), each block separated from the
  previous one by a blank line.
- **No value moved.** Every data line is byte-for-byte what it was: the same cells, the same
  markers - `(below the top tier)`, `(the Reviewer's - Claude rows share the agent file)`,
  `no auditor`, `always` / `not configurable` - and the same column widths. The block labels are
  emitted outside the column padding precisely so they cannot widen a column.
- **The two non-configurable rows are pinned, with a control.** A session re-rendering this table
  came back with seven rows, `fact-check` and `R1` silently gone. No config file points at either of
  them, so nothing derived from configuration can cover them: they are pinned by hand or not at all.
  The self-check now asserts both are present with their own cells, and a copy of the renderer with
  the fact-check row removed is required to make that assertion fail.
- **The skills print the table verbatim.** `/pnp:work` (at its tree check) and `/pnp:setup` (after
  an install) now say the tool's literal output rather than "print the audit table", which is what
  `/pnp:mission` and `/pnp:roles` already said. A retold table is a table whose cells nobody
  verified.

The operations.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one paragraph in your `CHANGES_*.md`: what the new shape of the audit table is, that no value in it moved, and that the renderer itself ships with `/plugin update` rather than with this migration. |

## Why the renderer is not an operation

`/pnp:roles --show` is payload - `scripts/setup/aiwf-roles.mjs` - and so are the skills that print
its output. `/plugin update` replaces the payload wholesale, so the new table is on your screen the
moment the plugin version changes, with no operation to apply and nothing of yours to re-render.
The migration still exists, because the manifest's last entry has to name the payload version, or
"no unapplied migrations" and "installed == payload version" would disagree with each other - and a
`note` is the honest way to say what a release did to a screen you read rather than to a file of
yours.

## What does NOT change

No config key is added, no permission rule is reconciled, no schema default moves, and the audit
table's VALUES are exactly what they were - `review.plan.passes`, `review.code.passes` and
`review.docs.passes` keep their numbers and their meaning as a ceiling, the roles keep their hosts,
and the fact-check gate is as unconfigurable as it was. `/pnp:roles --set` and `--reset` address the
same targets by the same names; the block labels are output, not addresses.

## If you are updating from 0.1.x or 0.2.x

`0002_operator-word-and-hygiene`, `0003_quiet-rerender`, `0004_audit-table`, `0005_posix-legs`,
`0006_git-verb-gate`, `0007_powershell-ask-ruleset`, `0008_consumer-correctness` and
`0009_readiness-discipline` still apply first, each with its own operations and its own notes; this
one follows them.
