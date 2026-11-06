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
  sandbox and approval flags are literals, the brief is read from the file `-BriefFile <path>` /
  `--brief-file <path>` names (the skills' launch form: a missing, unreadable, empty or
  whitespace-only file, or the flag beside a non-empty stdin, is exit 2) or, without the flag, from
  stdin, and reaches Codex on stdin either way. `codex-review.*` also takes
  the optional `-Class` / `--class`, hands it to the resolver and uses that row's model and effort.
  The review wrapper passes every brief through `scripts/engine/plan-gate.js`: a `plan`-class run,
  or a brief carrying a `Class: plan` line at its first column, is refused (exit 2) while the plan
  folder its `PLAN:` line names fails `plan-gate --check`.
  Both share one output contract: Codex's stdout and stderr go to one log of the run's own under
  `<temp>/pnp-codex/`, Codex writes its final message through `-o` beside it, and the wrapper's
  stdout is that final message byte for byte and nothing else; its stderr carries its own lines in a
  fixed order - run, then tokens, capacity (when it applies), no-verdict (when there is no final
  message), log and exit. The exit code is Codex's own.
- `codex-capture.mjs` (beside the two channels) - the PowerShell channel's capture helper. PowerShell
  re-encodes a redirected native stream, so `codex-review.ps1` and `codex-qa.ps1` run Codex through
  `node codex-capture.mjs --log <path> -- <codex args...>`: one file handle for both streams, the
  argv an array, `shell: false`, Codex resolved from `PATH` / `PATHEXT` without a shell (an `.exe`
  directly, the npm shim's `codex.js` with node, never a `.cmd`; unresolvable is exit 2 with no log),
  and `--print <file>` emits the final message as a native process. The bash channel needs no
  helper: `> "$log" 2>&1` and `cat` are byte-exact there - the one documented difference between the
  channels.
- `codex-qal.*` - the unsandboxed, operator-gated live-browser host; `-C` is always a unique
  throwaway scratch dir, never the repo. The project root is used only to find `roles.json`.

The bash channel parses JSON with one `node` invocation rather than `jq`: node is already a hard
prerequisite of this plugin (the hooks and every engine are node), `jq` is not, and a grep/sed
reading would silently coerce the exact shapes the resolver exists to reject.

The locked flags in all eight files are asserted by `scripts/selfcheck/aiwf-selfcheck.js`, which
also runs both resolvers against the same fixture matrix and requires identical exit codes and
snapshot shapes. `shellcheck` runs over `sh/` in CI (the ubuntu leg).
