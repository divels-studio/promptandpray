/*
 * The integrated self-check step - the last thing /pnp:setup and /pnp:update do.
 *
 * WHY IT LIVES HERE AND NOT IN EACH CLI
 *   Three entrypoints finish a write: `scripts/setup/interview.mjs`, `scripts/setup/generate.mjs`
 *   (its direct CLI) and `scripts/update/aiwf-update.mjs`. They must reach the SAME verdict from the
 *   same child process, so the spawn, the exit-code contract and the wording live once, here.
 *
 * THE CONTRACT (all seven points hold for every caller)
 *   1. It runs only after a SUCCESSFUL, non-dry-run apply that actually wrote something. Never on
 *      --dry-run, never after a blocked run, never on --check. The caller decides that and passes it
 *      as `wouldRun`; nothing here guesses.
 *   2. The child is `node <pluginRoot>/scripts/selfcheck/aiwf-selfcheck.js --plugin-root <pluginRoot>
 *      --project-fixture <projectRoot>` - the real entrypoint, against the project that was just
 *      written.
 *   3. Child exit 0 -> the CLI keeps its own exit code and prints `self-check: PASS` followed by the
 *      child's last non-empty stdout line, verbatim.
 *   4. Child exit non-zero -> the child's stdout and stderr are printed verbatim and the CLI exits 1
 *      with a one-line verdict that says plainly that the files WERE written and nothing was rolled
 *      back. A red self-check behind exit 0 would be the worst false green this payload can produce.
 *   5. The child cannot be spawned at all (missing script, spawn error, no exit status) -> exit 1
 *      naming what could not run. Fail-closed: "could not check" is never reported as "checked".
 *   6. `--no-selfcheck` skips it and says so on one line. Silence is not an option in either branch,
 *      so that line is printed even under --quiet: a skipped gate that prints nothing reads exactly
 *      like a gate that passed.
 *   7. --quiet suppresses ONLY the PASS line. Failure output is never suppressed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const SELFCHECK_REL = 'scripts/selfcheck/aiwf-selfcheck.js';
export const NO_SELFCHECK_FLAG = '--no-selfcheck';

export function selfCheckScript(pluginRoot) {
  return path.join(pluginRoot, ...SELFCHECK_REL.split('/'));
}

/**
 * Runs the self-check against one project. NEVER throws: an unrunnable child comes back as
 * `{ ran: false, reason }`, because a thrown error here would be reported by the caller's catch as
 * "the setup/update failed", which is the one thing that did not happen.
 */
export function runSelfCheck({ pluginRoot, projectRoot }) {
  const script = selfCheckScript(pluginRoot);
  if (!fs.existsSync(script)) {
    return { ran: false, reason: `${SELFCHECK_REL} is not in the payload at "${pluginRoot}"` };
  }
  const r = spawnSync(process.execPath, [script, '--plugin-root', pluginRoot, '--project-fixture', projectRoot], { encoding: 'utf8' });
  if (r.error) return { ran: false, reason: `${SELFCHECK_REL} could not be started (${r.error.message})` };
  if (r.status === null) return { ran: false, reason: `${SELFCHECK_REL} did not exit normally (signal ${r.signal || 'unknown'})` };
  return { ran: true, status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

/** The child's own summary line - the last line it printed that carries anything. */
export function lastNonEmptyLine(text) {
  const lines = String(text || '').split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');
  return lines.length ? lines[lines.length - 1] : '(the self-check printed nothing)';
}

/**
 * The final step of a writing run. Returns the exit code the CLI must use.
 *
 * `code`     the exit code the CLI had reached on its own (kept when the self-check is green)
 * `wouldRun` the caller's judgement of contract point 1 - a successful, non-dry-run apply that wrote
 * `skipped`  --no-selfcheck was passed
 * `subject`  what a red verdict is a report ABOUT, e.g. "the installed project layer"
 */
export function finishWithSelfCheck({
  pluginRoot, projectRoot, code, wouldRun, skipped, quiet = false, subject,
  out = (line) => console.log(line),
  err = (line) => console.error(line),
}) {
  if (!wouldRun) return code;
  if (skipped) {
    out(`self-check: SKIPPED (${NO_SELFCHECK_FLAG}). The files WERE written - run \`/pnp:selfcheck\` to verify ${subject}.`);
    return code;
  }
  const result = runSelfCheck({ pluginRoot, projectRoot });
  if (!result.ran) {
    err(
      `self-check: COULD NOT RUN - ${result.reason}. The files WERE written and nothing was rolled back; ` +
      '"could not check" is never reported as "checked", so this run exits 1. Run `/pnp:selfcheck` once the payload is intact.',
    );
    return 1;
  }
  if (result.status === 0) {
    if (!quiet) out(`self-check: PASS - ${lastNonEmptyLine(result.stdout)}`);
    return code;
  }
  // Verbatim, both streams, before the verdict: the verdict is one line and the detail is what the
  // operator actually needs to fix the project.
  if (result.stdout) process.stdout.write(result.stdout.endsWith('\n') ? result.stdout : `${result.stdout}\n`);
  if (result.stderr) process.stderr.write(result.stderr.endsWith('\n') ? result.stderr : `${result.stderr}\n`);
  err(
    `self-check: FAIL (exit ${result.status}). The files WERE written and nothing was rolled back - a red self-check ` +
    `reports that ${subject} is inconsistent, not that the write failed. Run \`/pnp:selfcheck\` for the detail printed above.`,
  );
  return 1;
}
