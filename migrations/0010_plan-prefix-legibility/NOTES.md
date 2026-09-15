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

**One prefix per plan, so a ref is a lookup and not a description.** The release's second change is
the one this migration is named for: a plan file is `PLAN_<ABBR>.md`, where `<ABBR>` is 2 to 8
uppercase letters, and every ticket in it carries the Ticket Ref `<ABBR>-<NNN>` - the SAME
abbreviation plus a three-digit sequential number that is never reused. A ticket born while other
work is in flight takes that same abbreviation and the next free number, and a candidate has no ref
until it is written into a plan. That grammar is what the tooling reads, which is why it is written
down to the letter.

- **The ref addresses its plan.** From `ABC-007` the plan file is known without a search, which is
  what the off-plan dispatch gate now does: it reads `PLAN_<ABBR>.md` directly and reads the other
  plans in the active directory only when that file does not exist or does not carry the ref. The
  decision the gate reaches is unchanged - every dispatch that raised a dialog before raises one now,
  and every one that passed silently still does; only which files are read is different. That is why
  a targeted hit still checks that the active directory itself can be listed before it clears the
  ref: a directory the gate cannot read has always been a dialog, and a faster lookup is not a reason
  for a quieter gate.
- **Nothing is retroactive.** Plans and refs that predate the convention keep their names; the full
  scan is the fallback that keeps them working, and the self-check's new naming assertion binds only
  files that already have the `PLAN_<ABBR>.md` shape.
- **One artifact of yours states it, and it is re-rendered here.** The `aiwf-core` region of your
  `CLAUDE.md` carries the "a NEW ticket waits for its own word" paragraph; it now says with which
  abbreviation and which number that ticket is written into the PLAN.

The operations.

| # | op | what it does here |
|---|----|-------------------|
| 0 | `note` | one paragraph in your `CHANGES_*.md`: the new shape of the audit table and that no value in it moved, the renderer shipping with `/plugin update` rather than with this migration, and the plan/ref naming convention together with the artifact it re-renders. |
| 1 | `rerender-managed-region` | re-renders the `aiwf-core` region of your `CLAUDE.md` from `templates/CLAUDE.md.tmpl#aiwf-core`, so the paragraph about a ticket born after a standing word names the abbreviation and the number. Unconditional: every installation has this region. Your text outside the region markers is untouched; if you edited inside it, the run asks; if you hold the artifact through an override, the new render is recorded as upstream and applied to nothing. |

## If this migration is already applied where the region is not

Taking 0.2.6 as a released version needs nothing from this section: `--apply` runs both operations
of this migration in one go. It matters only for an installation that tracks the payload BETWEEN
releases and had already applied `0010` while it carried only the note - `--apply` walks migrations
that are not yet recorded as applied, so it will not run this one a second time, and the region
would silently stay at the old render.

Re-render that one artifact directly instead, with the resolve path that exists for exactly this -
`--resolve "CLAUDE.md#aiwf-core"` plus a resolution file recording `take-new` for that address - and
the region is brought to the current render with its bookkeeping updated (upstream == local) and no
version bump involved. `--resolve` without a resolution file always stops to ask, which is what
makes the file the thing that lets such a run be non-interactive.

## Why the renderer is not an operation

`/pnp:roles --show` is payload - `scripts/setup/aiwf-roles.mjs` - and so are the skills that print
its output. `/plugin update` replaces the payload wholesale, so the new table is on your screen the
moment the plugin version changes, with no operation to apply and nothing of yours to re-render.
The migration would exist for that half alone, because the manifest's last entry has to name the
payload version, or "no unapplied migrations" and "installed == payload version" would disagree with
each other - and a `note` is the honest way to say what a release did to a screen you read rather
than to a file of yours. The `rerender-managed-region` above belongs to the release's other half,
not to the table.

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
