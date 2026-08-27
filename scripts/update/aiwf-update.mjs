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
 *
 * EXIT CODES (the contract every caller may rely on)
 *   0  success: applied, already current, a clean dry-run, or `--check` on a current project
 *   1  blocked: an invariant violation, a payload/validation failure, or a stop at an unresolved
 *      conflict. `--check` also exits 1 when migrations are pending - that is what makes it an
 *      interlock a skill can branch on.
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
 *
 * This command NEVER commits. The diff it produces goes through the normal review + commit gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectRoot } from '../setup/generate.mjs';
import { PayloadError } from './validate-payload.mjs';
import {
  DEFAULT_PLUGIN_ROOT, UpdateError, UpdateStartError,
  checkInterlock, checkResolutionRecord, resolutionFileAdapter, resolveArtifact, runUpdate, stopAdapter,
} from './migrate.mjs';

const MODES = ['--check', '--dry-run', '--apply', '--resolve'];

// ---------------------------------------------------------------------------
// A synchronous prompt, so the engine stays synchronous
// ---------------------------------------------------------------------------
// The engine's write sequence is deliberately synchronous: every write boundary is a point a crash
// must be recoverable from, and an await between the journal and the target would add boundaries the
// journal does not describe. So the interactive adapter reads stdin synchronously rather than
// turning the whole engine async for the sake of the one path a machine never takes.
function promptSync(text) {
  process.stdout.write(text);
  const buf = Buffer.alloc(4096);
  let out = '';
  for (;;) {
    let n = 0;
    try {
      n = fs.readSync(0, buf, 0, buf.length, null);
    } catch (e) {
      if (e.code === 'EAGAIN') { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20); continue; }
      if (e.code === 'EOF') break;
      throw e;
    }
    if (n === 0) break;
    out += buf.toString('utf8', 0, n);
    if (out.includes('\n')) break;
  }
  return out.split('\n')[0].trim();
}

const preview = (label, text) => {
  if (text === null || text === undefined) return [`  ${label}: (not on disk)`];
  const lines = text.split('\n');
  const head = lines.slice(0, 6).map((l) => `    | ${l}`);
  if (lines.length > 6) head.push(`    | ... (${lines.length - 6} more line(s))`);
  return [`  ${label}: ${lines.length} line(s)`, ...head];
};

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
function isMain() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return invoked === path.resolve(fileURLToPath(import.meta.url));
}

function main() {
  const args = process.argv.slice(2);
  const flag = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
  const has = (name) => args.includes(name);
  const quiet = has('--quiet');
  const say = (line) => { if (!quiet) console.log(line); };

  const chosen = MODES.filter((m) => has(m));
  if (chosen.length !== 1) {
    console.error(`usage: node aiwf-update.mjs (${MODES.join(' | ')} <key>) [--project-root <dir>] [--plugin-root <dir>] [--resolution-file <json>] [--quiet]`);
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
      return 0;
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
    return 0;
  } catch (e) {
    if (e instanceof UpdateError) { console.error(`pnp-update: ${e.message}`); return 1; }
    if (e instanceof UpdateStartError || e instanceof PayloadError) { console.error(`pnp-update: ${e.message}`); return 2; }
    console.error(`pnp-update: unexpected failure - ${e && e.message ? e.message : String(e)}`);
    return 2;
  }
}

if (isMain()) process.exit(main());
