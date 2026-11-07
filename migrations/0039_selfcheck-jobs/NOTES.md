# 0039_selfcheck-jobs

**The full self-check runs its sections in parallel groups and prints the same report it printed
before; the acceptance suites spawn the embedded self-check in the project scope and print their
slowest sections; the embedded run's FAIL verdict names only a cause its scope can produce.**

## What changes

- The engine (`scripts/selfcheck/aiwf-selfcheck.js`) takes `--jobs <n>`. Its 30 full-scope sections
  stand in four groups fixed by name, dealt whole and round-robin to n child processes of the same
  script; the default is `max(1, min(4, available parallelism - 1))`. `--jobs 1` is the previous
  in-process run. `0`, a negative or non-integer value, or a bare `--jobs` exits 2 with a message
  naming `--jobs`. Under `--scope project` the flag is accepted and has no effect.
- The report is unchanged: the header, the sections' text in canonical order, COVERAGE, the notes,
  the `slowest sections:` block, the tally line, FAILURES and the exit code. The dealing shows on
  stderr as one line per child, `aiwf-selfcheck: child <k>: <its sections>`; stdout carries nothing
  new.
- A child that crashes, or exits without its result document, is one counted `(uncaught)` failure
  naming the sections that never ran; the run prints `---- INCOMPLETE RUN ----` and exits 1. A child
  never writes, judges or removes the `--project-fixture` tree.
- The PowerShell wrappers section lists its uncovered resume checks from the findings it already
  produced instead of running the resume probes a third time; its pristine control pass stays.
- The acceptance suites (`scripts/setup/test-setup.mjs`, `scripts/update/test-update.mjs`) spawn the
  embedded self-check with `--scope project` where they assert only its exit code; the example
  cycle's step 8 (`scripts/ci/run-example-cycle.mjs`) keeps the full scope. The setup suite, the
  update suite, the example cycle and the self-check each print a `slowest sections:` block - the
  five slowest sections and the total - right before their unchanged tally line.
- The embedded run's FAIL verdict (`scripts/selfcheck/run-selfcheck.mjs`) no longer offers a missing
  or unusable host as a cause, because its project-scope run probes none: it says the run checked
  the project scope only and that `/pnp:selfcheck` runs the full check.
- The wall time is measured, not promised: no time bound is part of the contract.

## What this migration does

- One `note` (`selfcheck-jobs-0-3-14`): `/pnp:update` prints it with the CHANGELOG block of 0.3.14.

The engine, the embedded runner and the suites are read from the plugin root, so they take effect
with the plugin update itself; no operation carries them.

## What it leaves alone

Every config key, the ask-ruleset, every operator-owned file and every rendered file. No managed
artifact changes, so this update re-renders nothing.

## Superseded local rules

None. The CHANGELOG's line for 0.3.14 reads `Retires local rules: none`.
