# VERIFY runbook - how the suites go green on this machine

> Operational companion to `dev/PROJECT_OVERRIDES.md` § Test policy - the POLICY home stays there;
> this page holds the working command shapes and the recorded incidents, so nobody re-derives them.
> **Every brief that runs VERIFY (in full or in part) carries a pointer to this file; a red test on
> a trap described here is a defect of the brief, not of the code** (operator word 2026-09-22).
> Sources: `dev/backlogs/archive/005_PLAN_CONS_2026-09-21.md` (line pointers per item),
> `dev/backlogs/CANDIDATES.md`, PROJECT_OVERRIDES § Test policy.

## Portion 1 - the eight Windows commands (gates every ticket close)

- The eight = `verify.commands` in `aiwf.config.json`, listed verbatim in § Test policy.
- ONE parallel batch: `Start-Process` per command, logs redirected OUTSIDE the repo, exit codes
  read from the Process objects (archive :6-15). A sequential run inside the portion is a brief
  defect.
- Measured wall clock: ~10.4 min clean, up to ~17.6 min live (archive :10, :1288) - run it in the
  background, never in a foreground call with a timeout.
- ZERO edits in the working tree while the example cycles run (archive :1373).
- All eight are Windows processes - `example-cycle-linux` is Linux-flavored ANSWERS on a Windows
  run, not POSIX proof (CANDIDATES :834-843). POSIX proof = Portion 2 or CI.

## Portion 2 - WSL POSIX legs (release tickets; NEVER concurrent with Portion 1)

- Starts only after Portion 1 has finished: both at once = memory kill by the harness (2026-09-19,
  event ledger; the incident behind the PORTIONS rule).
- Legs run SEQUENTIALLY inside the one invocation (operator word 2026-09-22, option A - recorded in
  § Test policy): the parallel-batch sentence is Portion 1's; parallel spawns in WSL trip the snap
  pwsh cache trap.
- User: non-root `pnp` (uid 1000, created 2026-09-18). Precondition check, verbatim:
  `wsl.exe -u pnp -e sh -lc "id -u; pwsh -NoProfile -Command 'Write-Output ok'"` -> uid != 0, `ok`.
- Work copy under `/home/pnp`, NOT `/tmp` (tmpfs - wiped when WSL idles between invocations).
  Prep runs as ROOT: `git archive` against `/mnt/d/...` as `pnp` fails with `dubious ownership`,
  the error text flows into `tar`, and the copy comes out SILENTLY EMPTY - every leg then fails in
  seconds against nothing. Working form: ONE invocation in which root prepares (archive +
  `chown -R pnp:pnp`) and `su - pnp` runs the legs; prep carries `test -f` guards on files the
  copy must contain, so an empty copy dies THERE. Three-attempt incident: archive :1311-1318.
- Reference prep shape (root; the CONS-011 form - adapt names/paths; NB it still used /tmp for the
  small state file and for the copy - for a release run the copy itself goes under /home/pnp per
  the rule above):
  `wsl.exe -e sh -lc 'D=$(mktemp -d /tmp/pnp-011.XXXXXX) && echo "$D" > /tmp/pnp-011.dir && chmod 644 /tmp/pnp-011.dir && mkdir "$D/control" "$D/fix" "$D/mut" && cd /mnt/d/promptandpray && git archive HEAD | tar -x -C "$D/control" && tar --exclude=.git -cf - . | tar -x -C "$D/fix" && tar --exclude=.git -cf - . | tar -x -C "$D/mut" && chown -R pnp:pnp "$D" && echo "$D"'`
- Reference leg shape (pnp; suite + in-log assertion, self-validating):
  `wsl.exe -u pnp -e sh -lc 'D=$(cat /tmp/pnp-011.dir) && cd "$D/fix" && node scripts/update/test-update.mjs > "$D/fix.log" 2>&1 && grep -q "checks: [0-9]*, failures: 0" "$D/fix.log"'`
- Quoting traps: a command carrying `$?` goes to `wsl.exe` in SINGLE quotes - in double quotes the
  OUTER shell expands it first (observed false `suite_exit=0` on a real exit 1; archive :728-731).
  Never pass a bare `/tmp/...` path as its OWN `wsl.exe` argument from Git Bash - it is rewritten
  to a Windows path (once produced an untracked `C:` directory; archive :829-836). Keep paths
  inside the `-lc` string.
- snap `pwsh` under `pnp` breaks after many parallel spawns: `FileLoadException`, fingerprint
  "no PowerShell host" / five `[ROLE RESOLVER (bash channel)...]` lines, zero on-ticket
  assertions. Cure: clear `/home/pnp/.cache/powershell` (an operator word each time - it is a
  recursive delete), then re-run ONLY the red legs (accepted precedent, CONS-010). Recurrences
  recorded: CONS-011, CONS-008 round 4, CONS-010.
- Selfcheck in Portion 2 runs the CI FORM: `--plugin-root .` WITHOUT `--project-fixture .` - the
  fixture form against a copied tree false-reds on the six root-bound owned rules of the
  self-install (CONS-008 :1105-1107; confirmed CONS-010 :1294).
- Keep `*.log` files OUT of the scanned copy - an in-tree log tripped a "files of an unclassified
  type" false red (CONS-007, archive :972-978).

## CI (GitHub)

- Blocking legs: `windows` + `ubuntu` (acceptance checks `conclusion === 'success'` on both).
  `macos` is ADVISORY (`continue-on-error`, ci.yml) and STAYS advisory by ruling 2026-09-20: two
  green runs are not a support-tier change; the tier is reconsidered with 0.2.9 (HARD-011).
- macOS went green for the FIRST time on v0.2.7 (both runs), again on v0.2.8 - after CONS-011
  replaced `process.exit(...)` with `process.exitCode` in the four `finishWithSelfCheck` callers
  (POSIX stdout truncation; macOS had shown the class since 0.2.0). Archive :679-710, :983-992,
  :1298-1300.

## Environment failure = stop and ask

A red with an environment fingerprint (empty copy, pwsh cache, /tmp wipe, fixture-form selfcheck,
log-in-tree) is NOT a code defect: STOP, name the fingerprint, ask for the operator word - never
silently fix the environment and report a pass (payload `docs/WORKFLOW.md` § Verifying failure
claims).
