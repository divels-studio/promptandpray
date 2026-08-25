# migrations/

One directory per migration (`<NNNN>_<slug>/` with `ops.json` + `NOTES.md`),
ordered by an explicit `index.json` manifest. This is how a new plugin version
reaches an already-installed project without overwriting the project's own voice.

Populated in P3. Empty by design at P0.
