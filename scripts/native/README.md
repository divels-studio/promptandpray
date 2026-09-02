# scripts/native/

OS-specific wrappers, in two channels that mirror each other file for file: `ps/` (PowerShell,
Windows, ASCII-only) and `sh/` (bash, Linux/macOS, LF-only). `aiwf.config.json.os` selects the
channel; the generate engine renders the project layer against the one it names, and the skills run
the block of that channel. The channels are mirrors, not alternatives - a windows install never
invokes an `.sh` wrapper, a POSIX install never invokes a `.ps1`.

Each channel ships the role resolver and the three Codex wrappers, all parameterized with an
explicit project root because the payload has no project of its own:

- `aiwf-roles.ps1` / `aiwf-roles.sh` - resolves one review role to `{engine, model, effort}` (plus
  `enabled` for qal). `-RolesPath` / `--roles-path` is MANDATORY; a missing config file falls back
  to `claude`/`opus`/`high`; a present-but-invalid record is one stderr line and exit 2. The shape
  rules are STRICT and identical in both channels - object root only (never an array, not even a
  single-element one) and case-SENSITIVE keys - so that no file resolves through a host-language
  accident in one channel and fails in the other.
  An optional `-Class plan|code|docs` (`--class`) resolves the **audit table's** row for that review
  class instead: reviewer-only (any other role is exit 2), unknown class is exit 2, and the snapshot
  gains `class` and `passes` (the plain form prints four tokens, `<engine> <model> <effort>
  <passes>`). A `roles.json` with no `review.<class>` record predates the table and is exit 2 naming
  `/pnp:update`, never a guessed row; a MISSING file keeps the factory fallback and adds the factory
  pass counts (2 / 1 / 1). Without the flag the output is byte-identical to what it always was.
- `codex-review.*`, `codex-qa.*` - read-only Codex hosts; `-C` is the caller's project root, the
  sandbox and approval flags are literals, the brief arrives on stdin. `codex-review.*` also takes
  the optional `-Class` / `--class`, hands it to the resolver and uses that row's model and effort.
- `codex-qal.*` - the unsandboxed, operator-gated live-browser host; `-C` is always a unique
  throwaway scratch dir, never the repo. The project root is used only to find `roles.json`.

The bash channel parses JSON with one `node` invocation rather than `jq`: node is already a hard
prerequisite of this plugin (the hooks and every engine are node), `jq` is not, and a grep/sed
reading would silently coerce the exact shapes the resolver exists to reject.

The locked flags in all eight files are asserted by `scripts/selfcheck/aiwf-selfcheck.js`, which
also runs both resolvers against the same fixture matrix and requires identical exit codes and
snapshot shapes. `shellcheck` runs over `sh/` in CI (the ubuntu leg).
