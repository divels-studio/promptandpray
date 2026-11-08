# 0040_seed-containment

**The update engine judges a `seed-file` target through the real filesystem, with setup's own
helpers: a target that leaves the project through a link, an alias of the transfer surface and a link
at an absent target are refused; a parent that moved before the write is refused; `samePath` folds
case on darwin as well as win32.**

## What changes

- `scripts/setup/generate.mjs` exports `canonicalPath`, `isInsideDir` and `samePath`;
  `scripts/update/migrate.mjs` imports them beside `resolveTransferSurface` - one judgement, two
  engines, no copy.
- A seed is judged in this order: resolve (the `<plansDir>` token and the lexical test, which stays
  the first refusal and keeps the summary line free of `..`) -> exists (a present regular file is
  `kept`, whatever link leads to it) -> canonical containment -> the transfer surface.
- Canonical containment: a target that leaves the project through a junction or symlink on a parent
  directory is refused, naming where it really lands in the phrase of setup's containment check -
  `seed-file "<target>" really resolves to "<path>", which is not inside the project - nothing was
  written.` It is judged only where the engine would write, so a present file reached through a
  link outside the project stays `kept`.
- The transfer surface is compared canonically: an alias of the surface through a junction is
  refused as the surface, with the message it always had.
- A link standing at an absent target - dangling, or leading to something that is not a regular
  file - is refused as `exists and is not a regular file (found a link)` instead of being written
  through.
- The seed write re-checks, right before its exclusive create, the canonical parent the plan-time
  check saw, and refuses a parent that moved in between: `seed-file: the parent of "<file>" moved
  between the check and the write - nothing was written.` No lock is added; the window between that
  re-check and the create itself is answered by one executing session per working tree, the same
  window setup carries between its judgement and its write.
- `samePath` folds case on win32 and on darwin, for setup and update alike: the absent tail of a
  path is spelled by the config, and on macOS's default case-insensitive filesystem two spellings of
  it are one file.
- The summary lines (`seed-file: <target> (created|kept)`) and the dry run keep the project-relative
  target; canonical paths appear only in the refusals.

## What this migration does

- One `note` (`seed-containment-0-3-15`): `/pnp:update` prints it with the CHANGELOG block of
  0.3.15.

The engines are read from the plugin root, so they take effect with the plugin update itself; no
operation carries them.

## What it leaves alone

Every config key, the ask-ruleset, every operator-owned file and every rendered file. No managed
artifact changes, so this update re-renders nothing.

## Superseded local rules

None. The CHANGELOG's line for 0.3.15 reads `Retires local rules: none`.
