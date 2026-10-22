# 0028_ticket-byte-cap

**The per-ticket byte cap of the plan gate becomes a config value, and the execution guards of
0.3.3 reach the installation as one note.**

## What changes

- `schema/aiwf.config.schema.json` gains the top-level object `plan` with one required key,
  `plan.ticketByteCap` (integer, minimum 1024, default 6144).
- `scripts/engine/plan-gate.js` reads the cap from `<project>/.claude/aiwf-native/aiwf.config.json`
  and falls back to 6144 when the key or the file cannot be read - the stricter cap is the safe
  direction. A value below 1024 is not used either: the gate applies 6144.
- The Codex review wrappers print one run header line and one run footer line on stderr; codex's
  own streams are untouched. No installed file carries them, so nothing here writes them.
- Payload prose (`docs/WORKFLOW.md`, `docs/REVIEW_CHECKLIST.md`, the brief templates, `skills/plan`)
  carries the execution guards the note lists.

## What this migration does

- `add-config-key` `plan.ticketByteCap`, default 6144, without a question: written into
  `aiwf.config.json` only when the key is absent. A present key - a value the project chose - is
  left exactly as it is.
- One `note` (`guards-0-3-3`): `/pnp:update` prints it with the CHANGELOG block of 0.3.3 and stamps
  the version.

## What it leaves alone

Every other config key, every managed region, the ask-ruleset and every operator-owned file. The
local copies of the guards in the project's overrides document stay until the operator deletes
them - the CHANGELOG's `Retires local rules:` line names them.

## Superseded local rules

The execution guards named by the 0.3.3 block's `Retires local rules:` line.
