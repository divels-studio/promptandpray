# migrations/

One directory per migration (`<NNNN>_<slug>/` with `ops.json` + `NOTES.md`), ordered by an explicit
`index.json` manifest. This is how a STRUCTURAL change of a new plugin version (a new rendered file, a
new config key) reaches an already-installed project; the project's own voice lives in its overrides
document and in the project additions block of each rendered Markdown file, which an update keeps.

## The manifest

`index.json` is a JSON **array** of entries, in order:

```json
[
  { "id": "0001_initial", "targetPluginVersion": "0.1.0" }
]
```

- ids are `NNNN_<slug>`, numeric prefixes ascending by exactly 1 from `0001` - no gaps, no
  duplicates, no reordering;
- `targetPluginVersion` is a plain `MAJOR.MINOR.PATCH` triple, strictly increasing;
- the LAST entry's version **equals the payload's own version**. A version bump with nothing to do
  still ships a no-op migration, otherwise "no unapplied migrations" and "installed == payload
  version" would disagree;
- manifest ids and the directories here are one-to-one: an entry without a directory cannot run, and
  a directory without an entry would silently never run. Both are validation failures.

## ops.json

```json
{ "migration": "0002_<slug>", "targetPluginVersion": "0.2.0", "operations": [ ] }
```

`migration` equals the directory name and `targetPluginVersion` equals the manifest entry. The four
operation types and their exact field sets:

| op | fields |
|---|---|
| `add-config-key` | `path` (dot-path in aiwf.config.json), `default`, `askOperator`, `question` (required exactly when `askOperator` is true) |
| `rerender-managed-region` | `file` (project-relative), `region` (marker id, or `null` for a whole-file managed artifact), `template` (payload ref, optionally `#region`), `ifRecorded` (optional boolean), `createIfAbsent` (optional boolean) |
| `reconcile-ask-ruleset` | `ruleset` (payload ref to the new desired set) |
| `note` | `id`, `text`, `docRefs` (list), `supersedes` (optional list of ids this release retires) |

Unknown op types and unknown fields are rejected. `file` paths are project-relative with no absolute
form and no `..`; `template`/`ruleset` references are payload-relative under `templates/` and must
exist. Everything above is enforced by `scripts/update/validate-payload.mjs`, which BOTH the runner
and setup call before their first write.

**What `rerender-managed-region` does.** It ALWAYS writes the fresh render: a marked region is
spliced into its file (every byte outside the markers kept; a missing region appended; a missing
file recreated), a whole file is written from the render - an edited, deleted or never-recorded one
alike - and a whole Markdown file carries its project additions block (`<!-- project additions -->`
... `<!-- /project additions -->`) over byte for byte. The artifact is then recorded as
`_aiwf.managedRegions[<key>] = "<payload version>"`. Nothing asks; a malformed additions block stops
the run naming the file.

**`ifRecorded: true`** - skip when unrecorded. It is for an artifact that exists on SOME
installations only - the clear case being `.claude/agents/reviewer.md`, which is rendered for a
claude-hosted host and does not exist at all on a codex-configured project. An artifact whose key is
not in `_aiwf.managedRegions` is then reported as `<key>: not on this installation (no record) -
skipped` - no write, no new bookkeeping entry. Without the field the render is written whatever the
record says.

**`createIfAbsent: true`** - accepted, ignored. A render always creates what is missing, so the
field changes nothing in the engine; the validator still accepts it (frozen migrations carry it),
still refuses it on a region operation (`region` must be `null`), and still refuses an operation
that carries both fields - `ifRecorded` and `createIfAbsent` may not travel in one operation, on
presence, whatever their values.

**`supersedes`** on a `note` is the list of ids this release RETIRES - rules, seeds or earlier notes
an installation may still be carrying. It is accepted and printed: the run prints the note as
`note: <text>`, each `docRefs` entry under it, and one `supersedes: <id>` line per id. It applies
**nothing** - a `note` never writes a file of the operator's - so the ids are a list to read and act
on. Keep them generic - a consumer maps them onto whatever it calls those records locally - and
validate the same way `docRefs` is validated: an array of non-empty strings, omitted when the
release retires nothing.

**The supersede duty of a re-render.** A migration that RE-renders an existing region with new
sentences owes its `supersedes` list a search, not a recollection: before it lands, grep the
region's new sentences against every consumer-local duplicate its `NOTES.md` names, and make the
`supersedes` list equal that grep's hits - one id per hit, no more and no fewer. A release has
already shipped with one id missing from such a list. A render that CREATES a
new file has no consumer-local duplicate of its sentences; its `NOTES.md` says so and its note
carries no list.

**The word-gate convention.** A migration whose release introduces a word-gate carries this sentence
in its note TEXT, verbatim:

> If this release introduces a word-gate: check your local rules for self-initiated dispatch or
> remediation - a rule written before this gate may contradict it.

The note text is what the update prints to the operator at the moment of the update, so a warning
written anywhere else in the payload is a warning the operator never sees at the moment it matters. A
local rule written before a gate existed does not contradict it loudly - it reads as a habit, and the
operator is the only one who can see both.

**How a run moves.** Migrations run in manifest order and each operation applies directly. After the
LAST operation of a migration the config is written once - `lastMigrationApplied` and
`installedPluginVersion` move to that migration, together with the bookkeeping its operations made
(the one write inside a migration is `reconcile-ask-ruleset`'s, which persists the ask-rule ownership
right after it rewrites `settings.json`). A run that stops inside a migration leaves the stamps at the
previous one, and the next run runs that migration again: every operation is idempotent - a re-render
overwrites, `add-config-key` skips a key that is present, the ask ruleset reconciles. Before the
first operation, `--dry-run` and `--apply` print the payload `CHANGELOG.md` blocks between the
installed and the payload version.
