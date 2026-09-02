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
| `rerender-managed-region` | `file` (project-relative), `region` (marker id, or `null` for a whole-file managed artifact), `template` (payload ref, optionally `#region`), `ifRecorded` (optional boolean) |
| `reconcile-ask-ruleset` | `ruleset` (payload ref to the new desired set) |
| `note` | `id`, `text`, `docRefs` (list) |

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

Operations apply in array order and stop on the first unresolved conflict; the write-ahead journal
in `_aiwf.migrationJournal` makes the run resumable from exactly where it stopped.
