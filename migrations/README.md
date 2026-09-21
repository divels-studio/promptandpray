# migrations/

One directory per migration (`<NNNN>_<slug>/` with `ops.json` + `NOTES.md`), ordered by an explicit
`index.json` manifest. This is how a new plugin version reaches an already-installed project without
overwriting the project's own voice.

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

**`ifRecorded: true`** is for an artifact that exists on SOME installations only - the clear case
being `.claude/agents/reviewer.md`, which is rendered for a claude-hosted host and does not exist at
all on a codex-configured project. Without the field, re-rendering an artifact that carries no
bookkeeping entry THROWS, and that is the invariant, not a bug: an update never adopts a file it did
not write. With the field, such an artifact is reported as
`<key>: not on this installation (no record) - skipped` and the migration continues - no adoption,
no write, no new bookkeeping entry. Use it only where the artifact's absence is a legitimate
configuration, never to paper over a missing record you did not expect.

**`createIfAbsent: true`** is the other answer to the same state, for an artifact the payload has
only just STARTED rendering - an installation older than it has no record, and the migration is what
puts the artifact there. It has two faces and relaxes nothing about adoption:

- no record and **no file** - the artifact is rendered, written and stamped
  (`<key>: created (no record, no file) - rendered and recorded`, and `created (no record, no file)`
  in the `CHANGES` report);
- no record but a **file already standing** at that path, whose content **is** the render - the
  artifact lives in the plugin's own folder, so those bytes came from a run of this engine; nothing
  is written over them and the artifact is simply recorded;
- no record but a file already standing there that **differs** - the migration STOPS with
  `<key>: this installation has no record of it but a file is standing at that path - an update
  never adopts a file it did not write; move it aside or remove it, then run the update again`.
  That refusal holds at planning, at the last read before the write, at the write itself (a
  creation publishes NO-CLOBBER at the syscall, so a file that appears in between fails with EEXIST
  and gets the same sentence), and in the recovery of an interrupted creation. The refusal names
  moving the file rather than adopting it because setup's adopt mode bootstraps a project that has
  NO installation - a project running `/pnp:update` already has one;
- a record already there - the normal re-render path, and the field is invisible.

**It applies to whole-file artifacts only** (`region` must be `null`): a region is a span INSIDE a
file and the field's premise is that no file is there, so "create this region" has no subject and no
defined splice - the validator refuses the combination rather than leaving it to the engine.

**The two fields may not travel in one operation.** `ifRecorded` and `createIfAbsent` answer the
same question - what happens to an artifact this installation has no record of - in opposite
directions (skip versus create/refuse), so an op carrying both is a payload the validator REFUSES
rather than resolves. No precedence is defined on purpose: a precedence rule would make the
migration's intent depend on which field the reader remembers first, and an author who wrote both
has not decided yet.

**`supersedes`** on a `note` is the list of ids this release RETIRES - rules, seeds or earlier notes
an installation may still be carrying. Each entry is printed in `CHANGES_<from>-to-<to>.md` as a
`Supersedes: <id>` line under the note that carries it, and it applies **nothing**: a `note` never
writes a file of the operator's, so the ids are a list to read and act on. Keep them generic - a
consumer maps them onto whatever it calls those records locally - and validate the same way
`docRefs` is validated: an array of non-empty strings, omitted when the release retires nothing.

**The word-gate convention.** A migration whose release introduces a word-gate carries this sentence
in its note TEXT, verbatim:

> If this release introduces a word-gate: check your local rules for self-initiated dispatch or
> remediation - a rule written before this gate may contradict it.

The note text is the only thing that reaches the operator's `CHANGES` report, so a warning written
anywhere else in the payload is a warning the operator never sees at the moment it matters. A local
rule written before a gate existed does not contradict it loudly - it reads as a habit, and the
operator is the only one who can see both.

Operations apply in array order and stop on the first unresolved conflict; the write-ahead journal
in `_aiwf.migrationJournal` makes the run resumable from exactly where it stopped.
