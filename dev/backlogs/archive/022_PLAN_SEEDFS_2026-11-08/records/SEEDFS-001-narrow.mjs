#!/usr/bin/env node
/*
 * SEEDFS-001 narrow runner (scratch, gitignored; the GENERIC-003 shape).
 *
 * Runs section 15c of the CHANGED scripts/update/test-update.mjs - the suite's prelude (helpers and
 * the base payloads), the 15c block, and the suite's closing block, nothing else - on a scratch copy
 * of the payload OUTSIDE the repository, and the copied suite prints `checks: N, failures: M`.
 *
 *   node .aiwf/SEEDFS-001-narrow.mjs                  the copy is the changed tree
 *   node .aiwf/SEEDFS-001-narrow.mjs --engine <hash>  the copy's scripts/update/migrate.mjs is
 *                                                     `git show <hash>:scripts/update/migrate.mjs`,
 *                                                     everything else the changed tree
 *
 * Exit = the narrowed suite's exit (0 pass, 1 a failed check); 2 = the runner could not run.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
let engine = null;
const ei = args.indexOf('--engine');
if (ei !== -1) {
  engine = args[ei + 1];
  if (!engine || engine.startsWith('--')) { console.error('narrow: --engine needs a commit hash'); process.exit(2); }
}

const SKIP = new Set(['.git', 'node_modules', '.aiwf']);
function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyTree(s, d); else if (e.isFile()) fs.copyFileSync(s, d);
  }
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-seedfs-narrow-'));
const copy = path.join(scratch, 'payload');
let status = 2;
try {
  copyTree(REPO, copy);
  const migrate = path.join(copy, 'scripts', 'update', 'migrate.mjs');
  if (engine) {
    const old = execFileSync('git', ['show', `${engine}:scripts/update/migrate.mjs`], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(migrate, old, 'utf8');
    console.log(`narrow: engine scripts/update/migrate.mjs from ${engine}`);
  } else {
    console.log('narrow: engine scripts/update/migrate.mjs from the changed tree');
  }

  const suite = fs.readFileSync(path.join(copy, 'scripts', 'update', 'test-update.mjs'), 'utf8');
  const lines = suite.split(/\r?\n/);
  const find = (prefix) => {
    const i = lines.findIndex((l) => l.startsWith(prefix));
    if (i < 1 || !lines[i - 1].startsWith('// ----')) throw new Error(`marker not found: ${prefix}`);
    return i - 1; // the separator line above it
  };
  const first = find("section('1 - ");
  const from = find("section('15c ");
  const to = find("section('15d ");
  const tail = find('try { fs.rmSync(tmpRoot');
  if (!(first < from && from < to && to < tail)) throw new Error('markers out of order');
  const narrow = [...lines.slice(0, first), ...lines.slice(from, to), ...lines.slice(tail)].join('\n');
  const narrowFile = path.join(copy, 'scripts', 'update', 'test-update-15c.mjs');
  fs.writeFileSync(narrowFile, narrow, 'utf8');
  console.log(`narrow: section 15c of the changed test-update.mjs (lines ${from + 1}-${to}), payload copy ${copy}`);

  const r = spawnSync(process.execPath, [narrowFile], { stdio: 'inherit' });
  status = r.status === null ? 2 : r.status;
} catch (e) {
  console.error(`narrow: could not run - ${e && e.message ? e.message : String(e)}`);
  status = 2;
} finally {
  try { fs.rmSync(scratch, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
}
process.exit(status);
