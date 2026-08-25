# scripts/native/

OS-specific wrappers: `ps/` (PowerShell, ASCII-only) and `sh/` (bash, LF).
The role resolver and the Codex review wrappers, parameterized with an explicit
project root.

`ps/` is populated in P1; `sh/` mirrors it in P6. Empty by design at P0.
