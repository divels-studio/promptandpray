#!/usr/bin/env node
/*
 * /pnp:update entrypoint - the CLI over the migration engine in migrate.mjs.
 *
 * MODES (exactly one per run)
 *   --check            the version interlock every /pnp:* skill runs in Step 0. Reads only. A
 *                      project that is behind also gets the line `behind: <installed> -> <payload>`.
 *   --dry-run          plan the whole update and write NOTHING; print the CHANGELOG blocks between
 *                      the installed and the payload version, then every planned operation.
 *   --apply            run it: the CHANGELOG blocks, then the migrations in order. Every managed
 *                      artifact is OVERWRITTEN from the render (a Markdown file keeps its project
 *                      additions block); an interrupted migration simply runs again next time.
 *
 * COMMON FLAGS
 *   --project-root <dir>       default: `git rev-parse --show-toplevel` from the cwd
 *   --plugin-root <dir>        default: the payload this file lives in
 *   --resolution-file <json>   answers, keyed by address (see below)
 *   --quiet                    print only what blocked, if anything
 *   --no-selfcheck             skip the integrated self-check step (it says so on one line)
 *
 * THE SELF-CHECK IS THE LAST STEP OF A WRITING RUN
 *   `--apply` that really applied migrations finishes by RUNNING
 *   scripts/selfcheck/aiwf-selfcheck.js against the project. `--check`, `--dry-run` and an
 *   "already current" run write nothing, so there is nothing for it to judge and it does not run -
 *   except an "already current" run that refreshed a stale `$schema`: the config changed on disk,
 *   so it prints `refreshed $schema: <from> -> <to>`, then `nothing else was written`, and runs it.
 *   A red self-check makes this command exit 1 while saying plainly that the migrations WERE
 *   applied and nothing was rolled back; a self-check that cannot be spawned is also exit 1,
 *   because "could not check" is never reported as "checked". Contract:
 *   scripts/selfcheck/run-selfcheck.mjs.
 *
 * EXIT CODES (the contract every caller may rely on)
 *   0  success: applied, already current, a clean dry-run, or `--check` on a current project
 *   1  blocked: an invariant violation, a payload/validation failure, a malformed project additions
 *      block, or an unanswered question. `--check` also exits 1 when migrations are pending - that is
 *      what makes it an interlock a skill can branch on. A writing run whose integrated self-check
 *      came back red (or could not run at all) also exits 1: the writes stand, the verdict is that
 *      they are not consistent.
 *   2  the run could not start: no installation, an unreadable config, an unreadable payload, or a
 *      usage error.
 *
 * ANSWERS - the one question an update can ask
 *   A migration's `add-config-key` with `askOperator` asks for a value. The resolution FILE maps its
 *   address to an answer record:
 *     address:  "<migration>/<opIndex>/<key>"
 *     answer:   { "kind": "answer", "value": <any json> }
 *   Every record is checked when the file is loaded: an unknown kind (a `conflict` record of an
 *   older engine included), an unknown field or a missing value stops the run with exit 1. Without a
 *   file, an interactive `--apply` ASKS and a non-interactive one stops at that address. A dry run
 *   never prompts and never stops on it: the unanswered key is listed as `would ask: <address>`.
 *
 * This command NEVER commits. The diff it produces goes through the normal review + commit gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promptSync } from '../setup/dialog.mjs';
import { resolveProjectRoot } from '../setup/generate.mjs';
import { finishWithSelfCheck } from '../selfcheck/run-selfcheck.mjs';
import { PayloadError } from './validate-payload.mjs';
import {
  DEFAULT_PLUGIN_ROOT, UpdateError, UpdateStartError,
  checkInterlock, checkResolutionRecord, resolutionFileAdapter, runUpdate, schemaRefreshLine, stopAdapter, wouldAskAdapter,
} from './migrate.mjs';

const MODES = ['--check', '--dry-run', '--apply'];

function interactiveResolver() {
  return (address, info) => {
    console.log(`\nA new setting needs your answer (${address}):`);
    console.log(`  ${info.question}`);
    console.log(`  default: ${JSON.stringify(info.fallback)}`);
    const raw = promptSync('  your answer (JSON, or plain text; empty = the default): ');
    if (raw === '') return checkResolutionRecord({ kind: 'answer', value: info.fallback }, address);
    let value = raw;
    try { value = JSON.parse(raw); } catch { /* a plain string is a legitimate answer */ }
    return checkResolutionRecord({ kind: 'answer', value }, address);
  };
}

function makeResolver({ resolutionFile, dryRun }) {
  if (resolutionFile) {
    const file = path.resolve(resolutionFile);
    let table;
    try { table = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
      throw new UpdateStartError(`--resolution-file "${file}" cannot be read (${e.message}).`);
    }
    // A dry run lists an address the file does not answer as `would ask`; an apply stops on it.
    return resolutionFileAdapter(table, { label: `--resolution-file ${path.basename(file)}`, onMissing: dryRun ? wouldAskAdapter : null });
  }
  if (dryRun) return wouldAskAdapter;
  if (process.stdin.isTTY) return interactiveResolver();
  return stopAdapter('this run is not interactive and no --resolution-file was passed, so there is nobody to ask.');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
// A payload can be reached through a SYMLINK (macOS mounts its own os.tmpdir() behind one). Node
// resolves the entry to its REAL path before loading it, so `import.meta.url` is the real file while
// `process.argv[1]` keeps the link - comparing the two literally makes an entrypoint invoked through
// a link decide it is not main, do nothing and exit 0. Both sides go through realpath.
function isMain() {
  const real = (p) => { try { return fs.realpathSync(p); } catch { return p; } };
  const invoked = process.argv[1] ? real(path.resolve(process.argv[1])) : '';
  return invoked !== '' && invoked === real(path.resolve(fileURLToPath(import.meta.url)));
}

function main() {
  const args = process.argv.slice(2);
  const flag = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
  const has = (name) => args.includes(name);
  const quiet = has('--quiet');
  const say = (line) => { if (!quiet) console.log(line); };

  const chosen = MODES.filter((m) => has(m));
  if (chosen.length !== 1) {
    console.error(`usage: node aiwf-update.mjs (${MODES.join(' | ')}) [--project-root <dir>] [--plugin-root <dir>] [--resolution-file <json>] [--quiet] [--no-selfcheck]`);
    console.error(chosen.length === 0 ? '  exactly one mode is required.' : `  these modes are mutually exclusive: ${chosen.join(', ')}`);
    return 2;
  }
  const mode = chosen[0];
  const pluginRoot = path.resolve(flag('--plugin-root') || DEFAULT_PLUGIN_ROOT);
  const projectRoot = resolveProjectRoot(flag('--project-root'));
  if (!projectRoot) {
    console.error('pnp-update: cannot resolve the project root - pass --project-root <dir> (this directory is not a git worktree).');
    return 2;
  }

  // The integrated self-check, for the runs that write. `wouldRun: true` at every call site below is
  // deliberate: each one is reached only after a run that really wrote something.
  const finish = (code, subject) => finishWithSelfCheck({
    pluginRoot, projectRoot, code, wouldRun: true, skipped: has('--no-selfcheck'), quiet, subject,
  });

  try {
    if (mode === '--check') {
      const result = checkInterlock({ pluginRoot, projectRoot });
      if (result.current) {
        say(`up to date: this project is at ${result.installedVersion} and the payload is ${result.payloadVersion}; no migrations are pending.`);
        return 0;
      }
      console.error(
        `pnp-update: ${result.pending.length} migration(s) pending - this project is at ${result.installedVersion}, ` +
        `the payload is ${result.payloadVersion}. Run /pnp:update before anything else.`,
      );
      for (const entry of result.pending) console.error(`  - ${entry.id} (-> ${entry.targetPluginVersion})`);
      console.error(`behind: ${result.installedVersion} -> ${result.payloadVersion}; /pnp:update prints the CHANGELOG blocks in between`);
      return 1;
    }

    const dryRun = mode === '--dry-run';
    const resolve = makeResolver({ resolutionFile: flag('--resolution-file'), dryRun });
    const report = runUpdate({ pluginRoot, projectRoot, resolve, dryRun, log: say });
    if (report.current) {
      if ((report.schemaRefreshed || report.bookkeepingNormalized) && !dryRun) {
        // The config changed on disk, so this is a writing run and it is judged like one.
        say(`already current: ${report.from} == the payload version, and no migrations are pending.`);
        if (report.schemaRefreshed) say(schemaRefreshLine(report.schemaRefreshed));
        if (report.bookkeepingNormalized) say('bookkeeping normalized to the current shape');
        say('nothing else was written');
        return finish(0, 'the refreshed config');
      }
      say(`already current: ${report.from} == the payload version, and no migrations are pending. Nothing was written.`);
      if (report.schemaRefreshed) say(`a real run would write: ${schemaRefreshLine(report.schemaRefreshed)}`);
      return 0;
    }
    if (dryRun) {
      say(`dry run: ${report.from} -> ${report.to}, ${report.preview.length} operation(s) planned. NOTHING was written.`);
      if (report.schemaRefreshed) say(`  a real run would first write: ${schemaRefreshLine(report.schemaRefreshed)}`);
      for (const p of report.preview) {
        say(`  ${p.migration}[${p.opIndex}] ${p.summary}`);
        for (const line of p.lines) say(`    ${line}`);
      }
      for (const line of report.foreign) say(line);
      return 0;
    }
    say(`updated: ${report.from} -> ${report.to}, ${report.applied.length} operation(s) applied.`);
    if (report.schemaRefreshed) say(schemaRefreshLine(report.schemaRefreshed));
    for (const line of report.foreign) say(line);
    say('Nothing was committed - review the diff and commit it the usual way.');
    return finish(0, 'the updated project');
  } catch (e) {
    if (e instanceof UpdateError) { console.error(`pnp-update: ${e.message}`); return 1; }
    if (e instanceof UpdateStartError || e instanceof PayloadError) { console.error(`pnp-update: ${e.message}`); return 2; }
    console.error(`pnp-update: unexpected failure - ${e && e.message ? e.message : String(e)}`);
    return 2;
  }
}

// The code is RETURNED, never forced. `process.exit()` here would kill the run while this
// process's OWN stdout write is still pending - a pipe is synchronous on Windows but asynchronous
// on POSIX (Node, "A note on process I/O") - and the self-check report `finishWithSelfCheck` just
// wrote would reach the operator truncated. Same exit code, drained output.
if (isMain()) process.exitCode = main();
