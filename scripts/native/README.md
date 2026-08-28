# scripts/native/

OS-specific wrappers. One channel ships today: `ps/` (PowerShell, ASCII-only). The bash mirror
(`sh/`, LF) arrives with the Linux/macOS channel before 1.0; there is no `sh/` directory yet, and
`/pnp:setup` refuses those OS channels fail-closed until there is.

`ps/` ships the role resolver and the three Codex wrappers, all parameterized with an explicit
project root because the payload has no project of its own:

- `aiwf-roles.ps1` - resolves one review role to `{engine, model, effort}` (plus `enabled` for
  qal). `-RolesPath` is MANDATORY; a missing config file falls back to `claude`/`opus`/`high`.
- `codex-review.ps1`, `codex-qa.ps1` - read-only Codex hosts; `-C` is the caller's
  `-ProjectRoot`, the sandbox and approval flags are literals, the brief arrives on stdin.
- `codex-qal.ps1` - the unsandboxed, operator-gated live-browser host; `-C` is always a unique
  throwaway scratch dir, never the repo. `-ProjectRoot` is used only to find `roles.json`.

The locked flags in all four files are asserted by `scripts/selfcheck/aiwf-selfcheck.js`.
