# 0038_selfcheck-scope

**The self-check that setup, `/pnp:update --apply` and `/pnp:roles` run by themselves after a write
now proves only the project layer it wrote; the full self-check is unchanged and stays the default
everywhere else.**

## What changes

- The engine (`scripts/selfcheck/aiwf-selfcheck.js`) takes `--scope project|full`. An absent flag
  means `full`; any other value, or a bare `--scope`, exits 2 with a message naming `--scope`.
- Under `--scope project` the engine runs only the checks that read the real project, in this order:
  PROJECT PLAN NAMING, PROJECT LAYER (the rendered artifacts, the config, the version stamps, the
  ownership bookkeeping) and the COMMIT AUTOMATION reading. It probes no PowerShell or bash host and
  runs no payload negative control; its header carries a `scope` line and reports the PowerShell host
  as not probed. A missing bash or PowerShell therefore shows first at the first audit, not at the apply.
- The shared embedded run (`scripts/selfcheck/run-selfcheck.mjs`), which setup, `/pnp:update --apply`
  and `/pnp:roles` call, passes `--scope project`. Its PASS line ends
  (project layer only - run `/pnp:selfcheck` for the full check).
- The full run - CI, a manual `/pnp:selfcheck`, every negative control - is unchanged and gains one
  section, SCOPE CONTROLS, after NEGATIVE CONTROLS: it proves that the project scope can fail on a
  broken project layer and prints no payload section title.
- The wall time of the embedded run is measured, not promised: no time bound is part of the contract.

## What this migration does

- One `note` (`selfcheck-scope-0-3-13`): `/pnp:update` prints it with the CHANGELOG block of 0.3.13.

The engine, the embedded runner and the skills are read from the plugin root, so they take effect with
the plugin update itself; no operation carries them.

## What it leaves alone

Every config key, the ask-ruleset, every operator-owned file and every rendered file. No managed
artifact changes, so this update re-renders nothing.

## Superseded local rules

None. The CHANGELOG's line for 0.3.13 reads `Retires local rules: none`.
