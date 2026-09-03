#!/usr/bin/env node
/*
 * /pnp:update entrypoint - the CLI over the migration engine in migrate.mjs.
 *
 * MODES (exactly one per run)
 *   --check            the version interlock every /pnp:* skill runs in Step 0. Reads only.
 *   --dry-run          plan the whole update and write NOTHING - not one byte, not even a stage.
 *   --apply            run it: ordered application, write-ahead journal, resume after a crash.
 *   --resolve <key>    reopen the conflict dialog for ONE managed artifact, at any time. This is
 *                      the only way out of an `override`, and it needs no version bump.
 *
 * COMMON FLAGS
 *   --project-root <dir>       default: `git rev-parse --show-toplevel` from the cwd
 *   --plugin-root <dir>        default: the payload this file lives in
 *   --resolution-file <json>   answers, keyed by address (see below)
 *   --quiet                    print only what blocked, if anything
 *   --no-selfcheck             skip the integrated self-check step (it says so on one line)
 *
 * THE SELF-CHECK IS THE LAST STEP OF A WRITING RUN
 *   `--apply` that really applied migrations, and `--resolve`, finish by RUNNING
 *   scripts/selfcheck/aiwf-selfcheck.js against the project. `--check`, `--dry-run` and an
 *   "already current" run write nothing, so there is nothing for it to judge and it does not run.
 *   A red self-check makes this command exit 1 while saying plainly that the migrations WERE
 *   applied and nothing was rolled back; a self-check that cannot be spawned is also exit 1,
 *   because "could not check" is never reported as "checked". Contract:
 *   scripts/selfcheck/run-selfcheck.mjs.
 *
 * EXIT CODES (the contract every caller may rely on)
 *   0  success: applied, already current, a clean dry-run, or `--check` on a current project
 *   1  blocked: an invariant violation, a payload/validation failure, or a stop at an unresolved
 *      conflict. `--check` also exits 1 when migrations are pending - that is what makes it an
 *      interlock a skill can branch on. A writing run whose integrated self-check came back red (or
 *      could not run at all) also exits 1: the writes stand, the verdict is that they are not
 *      consistent.
 *   2  the run could not start: no installation, an unreadable config, an unreadable payload, or a
 *      usage error.
 *
 * RESOLUTIONS - two adapters over ONE resolver
 *   The resolution FILE maps an address to a DISCRIMINATED record:
 *     address:  "<migration>/<opIndex>/<key>"   (bare "<key>" in --resolve mode)
 *     conflict: { "kind": "conflict", "resolution": "take-new" | "keep-mine" | "merge",
 *                 "mergedFile": "<path>" }      mergedFile exactly when resolution is "merge"
 *     answer:   { "kind": "answer", "value": <any json> }   for add-config-key with askOperator
 *   An unknown kind, an unknown field, a missing conditional field, a record of the wrong kind for
 *   the address, or NO record at all stops the run with exit 1 naming the address. Nothing is ever
 *   guessed: a guessed resolution is a silent overwrite with extra steps.
 *   Without a resolution file, an interactive run ASKS (the same records, typed by the operator) and
 *   a non-interactive one stops. A dry-run never prompts - a preview that asks questions is not a
 *   preview; pass --resolution-file to preview the resolved plan.
 *   A resolution is needed only where something of the operator's is at stake: a config key with
 *   `askOperator`, or an artifact the operator edited, deleted, or holds and edited. A payload change
 *   to an artifact nobody touched needs no decision, so a dry-run over it simply previews the line it
 *   would apply ("... the payload version applied (you had not edited it)") and keeps going.
 *
 * This command NEVER commits. The diff it produces goes through the normal review + commit gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { previewLines, promptSync } from '../setup/dialog.mjs';
import { resolveProjectRoot } from '../setup/generate.mjs';
import { finishWithSelfCheck } from '../selfcheck/run-selfcheck.mjs';
import { PayloadError } from './validate-payload.mjs';
import {
  DEFAULT_PLUGIN_ROOT, UpdateError, UpdateStartError,
  checkInterlock, checkResolutionRecord, resolutionFileAdapter, resolveArtifact, runUpdate, stopAdapter,
} from './migrate.mjs';

const MODES = ['--check', '--dry-run', '--apply', '--resolve'];

// The conflict dialog's two primitives - the synchronous stdin read and the content preview - are
// shared with the setup engine's adopt dialog (scripts/setup/dialog.mjs). Both dialogs describe the
// same kind of file to the same operator, so they read from one implementation.
const preview = (label, text) => previewLines(label, text);

function interactiveResolver() {
  return (address, expectedKind, info) => {
    if (expectedKind === 'answer') {
      console.log(`\nA new setting needs your answer (${address}):`);
      console.log(`  ${info.question}`);
      console.log(`  default: ${JSON.stringify(info.fallback)}`);
      const raw = promptSync('  your answer (JSON, or plain text; empty = the default): ');
      if (raw === '') return checkResolutionRecord({ kind: 'answer', value: info.fallback }, 'answer', address);
      let value = raw;
      try { value = JSON.parse(raw); } catch { /* a plain string is a legitimate answer */ }
      return checkResolutionRecord({ kind: 'answer', value }, 'answer', address);
    }
    console.log(`\nCONFLICT at ${address}`);
    console.log(`  artifact : ${info.key}`);
    console.log(`  why      : ${info.predicates.join('; ')}${info.held ? ' (you currently hold this artifact)' : ''}`);
    for (const line of preview('yours', info.actual)) console.log(line);
    for (const line of preview('payload', info.newRender)) console.log(line);
    for (;;) {
      const answer = promptSync('  take-new / keep-mine / merge: ');
      if (answer === 'keep-mine' || answer === 'take-new') {
        return checkResolutionRecord({ kind: 'conflict', resolution: answer }, 'conflict', address);
      }
      if (answer === 'merge') {
        const file = promptSync('  path of the file you merged by hand: ');
        return checkResolutionRecord({ kind: 'conflict', resolution: 'merge', mergedFile: file }, 'conflict', address);
      }
      console.log('  answer with one of: take-new, keep-mine, merge');
    }
  };
}

function makeResolver({ resolutionFile, dryRun }) {
  if (resolutionFile) {
    const file = path.resolve(resolutionFile);
    let table;
    try { table = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
      throw new UpdateStartError(`--resolution-file "${file}" cannot be read (${e.message}).`);
    }
    return resolutionFileAdapter(table, { label: `--resolution-file ${path.basename(file)}` });
  }
  if (dryRun) {
    return stopAdapter('a dry-run never prompts - this is the decision the preview exists to show you. Answer it with --apply, or preview the resolved plan with --resolution-file.');
  }
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
    console.error(`usage: node aiwf-update.mjs (${MODES.join(' | ')} <key>) [--project-root <dir>] [--plugin-root <dir>] [--resolution-file <json>] [--quiet] [--no-selfcheck]`);
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

  // The integrated self-check, for the two modes that write. `wouldRun: true` at every call site
  // below is deliberate: each one is reached only after a run that really wrote something.
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
      if (result.journal) {
        console.error(`pnp-update: an interrupted update is in flight (${result.journal.migration} operation ${result.journal.opIndex}). Run /pnp:update to resume it.`);
        return 1;
      }
      console.error(
        `pnp-update: ${result.pending.length} migration(s) pending - this project is at ${result.installedVersion}, ` +
        `the payload is ${result.payloadVersion}. Run /pnp:update before anything else.`,
      );
      for (const entry of result.pending) console.error(`  - ${entry.id} (-> ${entry.targetPluginVersion})`);
      return 1;
    }

    if (mode === '--resolve') {
      const key = flag('--resolve');
      if (!key || key.startsWith('--')) {
        console.error('pnp-update: --resolve needs the managed key to reopen, e.g. --resolve "CLAUDE.md#aiwf-core".');
        return 2;
      }
      const resolve = makeResolver({ resolutionFile: flag('--resolution-file'), dryRun: false });
      const result = resolveArtifact({ pluginRoot, projectRoot, key, resolve, log: say });
      say(`resolved "${result.key}" as ${result.resolution}.`);
      // --resolve always writes: the artifact in take-new/merge, and the bookkeeping stamp in every
      // branch including keep-mine. So it is a writing run and it is judged like one.
      return finish(0, 'the resolved artifact');
    }

    const dryRun = mode === '--dry-run';
    const resolve = makeResolver({ resolutionFile: flag('--resolution-file'), dryRun });
    const report = runUpdate({ pluginRoot, projectRoot, resolve, dryRun, log: say });
    if (report.current) {
      say(`already current: ${report.from} == the payload version, and no migrations are pending. Nothing was written.`);
      return 0;
    }
    if (dryRun) {
      say(`dry run: ${report.from} -> ${report.to}, ${report.preview.length} operation(s) planned. NOTHING was written.`);
      for (const p of report.preview) say(`  ${p.migration}[${p.opIndex}] ${p.summary}`);
      return 0;
    }
    say(`updated: ${report.from} -> ${report.to}, ${report.applied.length} operation(s) applied.`);
    say(`report:  ${path.relative(projectRoot, report.changesFile).split(path.sep).join('/')}`);
    say('Nothing was committed - review the diff and commit it the usual way.');
    return finish(0, 'the updated project');
  } catch (e) {
    if (e instanceof UpdateError) { console.error(`pnp-update: ${e.message}`); return 1; }
    if (e instanceof UpdateStartError || e instanceof PayloadError) { console.error(`pnp-update: ${e.message}`); return 2; }
    console.error(`pnp-update: unexpected failure - ${e && e.message ? e.message : String(e)}`);
    return 2;
  }
}

if (isMain()) process.exit(main());
