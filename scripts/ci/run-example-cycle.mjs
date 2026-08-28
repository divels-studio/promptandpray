#!/usr/bin/env node
/*
 * The example cycle - setup -> simulated version bump -> update -> self-check, end to end.
 *
 * WHAT IT IS
 *   The one gate that runs the whole product the way an operator would, against data checked into
 *   the repository (`examples/example-project/`) rather than fixtures invented in a test file. Each
 *   of the nine steps is an assertion, and the commands it runs are LITERALLY the commands
 *   `examples/example-project/README.md` shows: both are read from DOCUMENTED_COMMANDS below, so the
 *   quickstart cannot document one thing while CI runs another. The self-check asserts the README
 *   still lists exactly these lines (EXAMPLE FIXTURE section).
 *
 * WHERE IT WRITES
 *   Inside its work directory and nowhere else. The payload is COPIED there, the seed project is
 *   COPIED there, and the repository is hashed before and after the run and asserted byte-identical
 *   - because a fixture that quietly rewrites the repository it is checked into would turn every
 *   later run into a green report about a tree nobody wrote deliberately.
 *
 * CLI
 *   node scripts/ci/run-example-cycle.mjs [--work-dir <dir>] [--keep] [--quiet]
 *     --work-dir <dir>  where to run. Default: a fresh mkdtemp under the system temp directory.
 *                       This directory is REMOVED when the run finishes, so it is judged first and
 *                       refused (exit 2, nothing created) when it is the repository itself, inside
 *                       it, an ancestor of it, reachable into it through a symlink or junction, not
 *                       a directory, not empty, or when its parent does not exist. What is removed
 *                       afterwards is decided by OWNERSHIP: a directory this run created goes
 *                       whole; a directory you supplied keeps its identity and only the entries
 *                       this run created inside it are removed - and a FILE only while its bytes
 *                       are still the ones this run wrote - each named in the report.
 *     --keep            do not remove the work directory; print its path.
 *     --quiet           print only failures and the summary.
 *   exit 0 = every check passed; 1 = at least one failed; 2 = the run could not start.
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');
const EXAMPLE_DIR = path.join(REPO_ROOT, 'examples', 'example-project');

// ---------------------------------------------------------------------------
// DOCUMENTED COMMANDS - the single source for what runs AND what the README shows
// ---------------------------------------------------------------------------
// Placeholders are whole argv atoms or substrings of one, and substitution happens AFTER the line is
// split on spaces - so a work directory whose path contains a space still produces the right argv.
// The README lists these lines verbatim; the self-check compares the two sets in both directions.
export const DOCUMENTED_COMMANDS = [
  'node <payload>/scripts/setup/interview.mjs --answers-file <repo>/examples/example-project/answers.json --plugin-root <payload> --project-root <project> --no-seeds',
  'node <payload2>/scripts/update/validate-payload.mjs --plugin-root <payload2>',
  'node <payload2>/scripts/update/aiwf-update.mjs --check --plugin-root <payload2> --project-root <project>',
  'node <payload2>/scripts/update/aiwf-update.mjs --dry-run --plugin-root <payload2> --project-root <project>',
  'node <payload2>/scripts/update/aiwf-update.mjs --apply --plugin-root <payload2> --project-root <project> --resolution-file <work>/resolutions.json',
  'node <payload2>/scripts/update/aiwf-update.mjs --resolve CLAUDE.md#aiwf-core --plugin-root <payload2> --project-root <project> --resolution-file <work>/resolve-take-new.json',
  'node <payload2>/scripts/selfcheck/aiwf-selfcheck.js --plugin-root <payload2> --project-fixture <project>',
];
const [CMD_INSTALL, CMD_VALIDATE, CMD_CHECK, CMD_DRYRUN, CMD_APPLY, CMD_RESOLVE, CMD_SELFCHECK] = DOCUMENTED_COMMANDS;

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : null; };
const HAS = (name) => args.includes(name);
const QUIET = HAS('--quiet');

let checks = 0;
let failures = 0;
function check(name, ok, detail) {
  checks += 1;
  if (!ok) failures += 1;
  if (!ok || !QUIET) console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' - ' + detail : ''}`);
  return !!ok;
}
function step(title) { if (!QUIET) console.log(`\n=== ${title} ===`); }
function bail(message) {
  console.error(`example-cycle: ${message}`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const readJson = (p) => { const t = read(p); try { return t === null ? null : JSON.parse(t); } catch { return null; } };
const writeJson = (p, value) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8'); };
// RAW BYTES, no decode and no line-ending normalisation. Everything downstream of this claims a
// tree is "byte-identical", and a hash taken over LF-normalised text cannot see a file whose only
// change is its line endings - which is a real class here, because .gitattributes deliberately keeps
// *.ps1 on CRLF. Hashing the Buffer is what makes the word "byte-identical" true.
const sha256Bytes = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

/**
 * Creates a file that must NOT already exist, and returns the identity of what landed on disk.
 *
 * The flag is 'wx' on purpose. The default 'w' would silently OVERWRITE a file another process put
 * there after this run acquired the (empty) work directory - and this run would then record that
 * file as its own and delete it at the end. EEXIST is therefore a refusal, never a retry: a work
 * directory that already holds this name is not the empty directory this run acquired.
 */
function writeJsonExclusive(file, value) {
  const data = JSON.stringify(value, null, 2) + '\n';
  try {
    fs.writeFileSync(file, data, { flag: 'wx' });
  } catch (e) {
    if (e.code === 'EEXIST') {
      bail(
        `"${file}" already exists. This run acquired an EMPTY work directory and will not overwrite a file it did not `
        + 'create, so something else put that name there while the cycle was running. Nothing was overwritten.',
      );
    }
    bail(`"${file}" could not be written (${e.message}).`);
  }
  // The identity is read back from disk rather than computed from the string, so what ownership
  // records is what is really there.
  return sha256Bytes(fs.readFileSync(file));
}

const SKIP_DIRS = new Set(['.git', 'node_modules']);
function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyTree(s, d); else fs.copyFileSync(s, d);
  }
}

/**
 * path -> sha256 of the file's RAW BYTES, for every file under `dir`. The basis of both "unchanged"
 * claims in this file: the repository after the run, and the project after a dry run.
 */
function hashTree(dir, base = dir, acc = {}) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) hashTree(p, base, acc);
    else acc[path.relative(base, p).split(path.sep).join('/')] = sha256Bytes(fs.readFileSync(p));
  }
  return acc;
}
function diffTrees(before, after) {
  const changed = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (before[key] !== after[key]) changed.push(key);
  }
  return changed.sort();
}

const isInside = (parent, child) => {
  const rel = path.relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
};

// ---------------------------------------------------------------------------
// The work directory - JUDGED BEFORE ANYTHING IS CREATED
// ---------------------------------------------------------------------------
// This directory is REMOVED when the run finishes, so the order here is the whole safety property:
// a path judged AFTER it was created - or judged by a `check()` the run then survives - would make
// `--work-dir <the repository>` delete the repository and print PASS underneath it. So every
// refusal below happens before the first mkdir and before any write, and each one is a bail
// (exit 2), never a recorded failure execution continues past.
//
// SYMLINKS AND JUNCTIONS are the reason a textual comparison is not enough. `--work-dir
// <junction outside the repository that points INTO it>/<child that does not exist yet>` looks
// innocent as a string, and a non-recursive mkdir still follows the junction and lands inside the
// repository. So a path is canonicalized by walking up to its nearest EXISTING ancestor, resolving
// THAT to its real path, and re-joining the segments that do not exist yet.
function canonicalize(p) {
  let cursor = path.resolve(p);
  const tail = [];
  for (;;) {
    try {
      return path.join(fs.realpathSync.native(cursor), ...tail);
    } catch {
      const parent = path.dirname(cursor);
      if (parent === cursor) return path.join(cursor, ...tail); // reached the root: nothing exists
      tail.unshift(path.basename(cursor));
      cursor = parent;
    }
  }
}

// Containment, in this order, so each refusal names the reason that really applies: the
// repository's own parent is BOTH an ancestor and (usually) non-empty, and "it is not empty" would
// be a true sentence that tells the operator nothing about the danger they were in.
function containmentProblem(dir) {
  const real = canonicalize(dir);
  const repo = canonicalize(REPO_ROOT);
  const removed = 'and this directory is removed when the cycle finishes';
  if (real === repo) return `it is the repository itself, ${removed}`;
  if (isInside(repo, real)) return `it is inside the repository, ${removed}`;
  if (isInside(real, repo)) return `it is an ancestor of the repository, ${removed}`;
  return null;
}

/**
 * The FIRST of two layers. Judges the requested path on its canonical form and CREATES NOTHING, so a
 * dangerous --work-dir never reaches a mkdir at all. The second layer is acquireWorkDir() below,
 * which judges the directory again once it really exists.
 */
function planWorkDir(requested) {
  if (!requested) return { dir: null, temporary: true };
  const dir = path.resolve(requested);
  const contained = containmentProblem(dir);
  if (contained) bail(`--work-dir "${dir}" is refused: ${contained}.`);
  return { dir, temporary: false };
}

/**
 * The SECOND layer: acquire the directory, and let the filesystem - not an earlier existsSync -
 * decide who created it.
 *
 * `fs.mkdirSync(dir)` is NON-RECURSIVE on purpose, and that single choice closes three holes at
 * once. It is ATOMIC, so "this run created it" is the syscall's answer rather than the answer to a
 * question asked a moment earlier, which another process could have invalidated in between. It
 * creates NO PARENTS, so nothing above the work directory is ever brought into existence and
 * nothing above it can ever be left behind by a cleanup that only removes the work directory. And
 * an absent parent surfaces as ENOENT, which is a refusal with its own reason rather than a
 * silently materialised directory tree.
 */
function acquireWorkDir(dir) {
  let created;
  try {
    fs.mkdirSync(dir);
    created = true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      bail(`--work-dir "${dir}" is refused: its parent directory does not exist, and this cycle never creates anything above its work directory.`);
    } else if (e.code !== 'EEXIST') {
      bail(`--work-dir "${dir}" could not be created (${e.message}).`);
    }
    created = false;
  }

  if (!created) {
    // It was already there. Only now do the shape judgements run - and note that a plain FILE also
    // answers EEXIST, which is exactly why this branch checks before trusting anything.
    let stat = null;
    try { stat = fs.statSync(dir); } catch (e) { bail(`--work-dir "${dir}" is refused: it cannot be inspected (${e.message}).`); }
    if (!stat.isDirectory()) bail(`--work-dir "${dir}" is refused: it exists and is not a directory.`);
    let entries = [];
    try { entries = fs.readdirSync(dir); } catch (e) { bail(`--work-dir "${dir}" is refused: it cannot be read (${e.message}).`); }
    if (entries.length) {
      bail(
        `--work-dir "${dir}" is refused: it exists and is not empty (${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}), ` +
        'and this cycle will not clean up a directory whose contents are not all its own.',
      );
    }
  }

  // Containment, judged AGAIN now that the directory really exists, so its real path is exact
  // rather than reconstructed.
  const contained = containmentProblem(dir);
  if (contained) {
    // Whatever this run created on the way here goes before it bails: refusing to run must not
    // leave anything behind, least of all inside the repository. The message reports what really
    // happened - a removal that failed is stated as a failure, never as the tidy sentence.
    let aftermath = 'Nothing was created by this run.';
    if (created) {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* the existsSync below is the real answer */ }
      aftermath = fs.existsSync(dir)
        ? `The directory this run created at "${dir}" COULD NOT BE REMOVED and is still on disk - delete it by hand.`
        : 'The directory this run had just created was removed again.';
    }
    bail(
      `--work-dir "${dir}" resolved to "${canonicalize(dir)}" once it existed, and was refused AFTER it was created: ` +
      `${contained}. ${aftermath}`,
    );
  }
  return { created };
}

// ---------------------------------------------------------------------------
// Running a documented command
// ---------------------------------------------------------------------------
function makeRunner(subs) {
  return (documented) => {
    const tokens = documented.split(' ');
    if (tokens[0] !== 'node') bail(`documented command does not start with "node": ${documented}`);
    const argv = tokens.slice(1).map((t) => {
      let out = t;
      for (const [k, v] of Object.entries(subs)) out = out.split(k).join(v);
      return out;
    });
    const r = spawnSync(process.execPath, argv, { encoding: 'utf8' });
    if (r.error) return { status: null, out: `spawn failed: ${r.error.message}`, argv };
    return { status: r.status, out: (r.stdout || '') + (r.stderr || ''), argv };
  };
}
const tail = (r, n = 4) => `exit ${r.status}: ${(r.out || '').trim().split('\n').filter(Boolean).slice(-n).join(' | ').slice(0, 320)}`;

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const BEGIN = '<!-- BEGIN aiwf-core -->';
const END = '<!-- END aiwf-core -->';
const CONFIG_REL = '.claude/aiwf-native/aiwf.config.json';
const SETTINGS_REL = '.claude/settings.json';
const STAGE_REL = '.claude/aiwf-native/update-stage';
const CLAUDE_KEY = 'CLAUDE.md#aiwf-core';
const FOREIGN_RULE = 'Bash(example-project-own-tool:*)';
const SEED_PROSE = 'This file existed before PromptAndPray was installed';

// ARGUMENT VALIDATION COMES FIRST, ahead of even reading the fixture data: a refused --work-dir must
// be refused for the reason it is dangerous, not shadowed by whatever else happens to be wrong.
const workDirPlan = planWorkDir(flag('--work-dir'));

for (const rel of ['answers.json', 'README.md', 'seed/CLAUDE.md', 'seed/.claude/settings.json', 'seed/src/hello.mjs', 'bump/bump.json', 'bump/schema-key.json']) {
  if (!fs.existsSync(path.join(EXAMPLE_DIR, ...rel.split('/')))) {
    bail(`examples/example-project/${rel} is missing - the cycle runs on committed fixture data, and this run cannot start without it.`);
  }
}

const bump = readJson(path.join(EXAMPLE_DIR, 'bump', 'bump.json'));
const schemaKey = readJson(path.join(EXAMPLE_DIR, 'bump', 'schema-key.json'));
if (!bump || typeof bump.migration !== 'string' || typeof bump.targetPluginVersion !== 'string') {
  bail('examples/example-project/bump/bump.json does not declare {migration, targetPluginVersion}.');
}
if (!schemaKey || typeof schemaKey.at !== 'string' || typeof schemaKey.property !== 'string' || schemaKey.schema === undefined) {
  bail('examples/example-project/bump/schema-key.json does not declare {at, property, schema}.');
}

let workDir;
let OWNS_WORK_DIR;
if (workDirPlan.temporary) {
  try {
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-example-'));
  } catch (e) {
    bail(`the work directory could not be created under the system temp directory (${e.message}).`);
  }
  OWNS_WORK_DIR = true; // mkdtemp creates a directory that did not exist a moment ago, by definition
  // The default path is not exempt from the rule: a machine whose temp directory is configured
  // inside the repository - or reached through a junction into it - would otherwise walk straight
  // past the guard. What was just created is removed again before bailing.
  const contained = containmentProblem(workDir);
  if (contained) {
    try { fs.rmSync(workDir, { recursive: true, force: true }); } catch { /* the existsSync below is the real answer */ }
    const stillThere = fs.existsSync(workDir);
    bail(`the system temp directory produced "${workDir}", which cannot be used: ${contained}. Pass --work-dir <dir> explicitly.` + (stillThere ? ` The directory this run created there COULD NOT BE REMOVED and is still on disk.` : ''));
  }
} else {
  OWNS_WORK_DIR = acquireWorkDir(workDirPlan.dir).created;
  workDir = workDirPlan.dir;
}

// Cleanup is BY OWNERSHIP. A directory this run created is removed whole; a directory the operator
// supplied (and which was empty when this run acquired it) keeps its identity - only the entries
// this run created inside it are removed, and the run says which.
//
// A name lands in `createdEntries` only AFTER the entry really exists. Recording an intention
// instead would put a name on the cleanup's list for something another process may own, which is
// the same mistake as trusting an existsSync from before the mkdir.
// Each record is { kind, name, hash? }. For a FILE the ownership is the sha256 of the bytes this
// run wrote: a name is not an identity, and an entry replaced after this run created it must not be
// deleted as though it were still ours. For a DIRECTORY the ownership is the non-recursive mkdir
// that created it - atomic, and the same guarantee acquireWorkDir() relies on.
const createdEntries = [];
const recordCreatedDir = (name) => {
  if (!createdEntries.some((e) => e.name === name)) createdEntries.push({ kind: 'dir', name });
};
const recordCreatedFile = (name, hash) => {
  if (!createdEntries.some((e) => e.name === name)) createdEntries.push({ kind: 'file', name, hash });
};
/** Creates one top-level directory of the work directory and records it the instant it exists. */
function createOwnedDir(name) {
  const target = path.join(workDir, name);
  fs.mkdirSync(target);
  recordCreatedDir(name);
  return target;
}

const PAYLOAD_1 = path.join(workDir, 'payload-0.1.0');
const PAYLOAD_2 = path.join(workDir, 'payload-0.2.0');
const PROJECT = path.join(workDir, 'project');
const RESOLUTIONS = path.join(workDir, 'resolutions.json');
const RESOLVE_TAKE_NEW = path.join(workDir, 'resolve-take-new.json');
const run = makeRunner({
  '<repo>': REPO_ROOT,
  '<work>': workDir,
  '<payload2>': PAYLOAD_2, // before <payload>, so the longer placeholder is matched first
  '<payload>': PAYLOAD_1,
  '<project>': PROJECT,
});

if (!QUIET) {
  console.log('PromptAndPray example cycle');
  console.log(`repository : ${REPO_ROOT}`);
  console.log(`work dir   : ${workDir}${OWNS_WORK_DIR ? ' (created by this run - removed whole at the end)' : ' (supplied and empty - only what this run creates is removed)'}`);
}

const repoBefore = hashTree(REPO_ROOT);

try {
  // -- 1. the throwaway payload and the throwaway project ---------------------
  step('1 - a payload copy and the seed project, both inside the work directory');
  // "the work directory is outside the repository" is NOT asserted here: by this line it could not
  // fail, because the run is refused (exit 2) before anything is created when it is not. A check
  // that cannot fail is not a check. The guard's own behaviour is proven by the self-check, which
  // spawns this driver with each bad --work-dir and requires exit 2 with nothing created.
  // createOwnedDir brings each entry into existence and records it in the same breath, so a copy
  // that dies halfway still leaves a directory the cleanup knows about.
  createOwnedDir('payload-0.1.0');
  copyTree(REPO_ROOT, PAYLOAD_1);
  createOwnedDir('project');
  copyTree(path.join(EXAMPLE_DIR, 'seed'), PROJECT);
  const payload1Version = (readJson(path.join(PAYLOAD_1, '.claude-plugin', 'plugin.json')) || {}).version;
  check('the payload copy carries the shipped version', typeof payload1Version === 'string', String(payload1Version));
  check('the seed project is in place (its own CLAUDE.md, its own settings, its own source)',
    (read(path.join(PROJECT, 'CLAUDE.md')) || '').includes(SEED_PROSE)
    && ((readJson(path.join(PROJECT, ...SETTINGS_REL.split('/'))) || {}).permissions || {}).ask?.includes(FOREIGN_RULE)
    && fs.existsSync(path.join(PROJECT, 'src', 'hello.mjs')));
  check('the seed project carries NO managed region yet', !(read(path.join(PROJECT, 'CLAUDE.md')) || '').includes(BEGIN));

  // -- 2. install -------------------------------------------------------------
  step('2 - install into the seed project');
  const install = run(CMD_INSTALL);
  check('the install exits 0', install.status === 0, tail(install));
  check('the install ran the self-check ITSELF and it passed',
    install.out.includes('self-check: PASS'), install.status === 0 ? tail(install, 2) : '');
  {
    const claude = read(path.join(PROJECT, 'CLAUDE.md')) || '';
    check('the pre-existing prose survived ABOVE the managed region',
      claude.includes(SEED_PROSE) && claude.indexOf(SEED_PROSE) < claude.indexOf(BEGIN) && claude.includes(END),
      `prose@${claude.indexOf(SEED_PROSE)} region@${claude.indexOf(BEGIN)}`);
    const ask = ((readJson(path.join(PROJECT, ...SETTINGS_REL.split('/'))) || {}).permissions || {}).ask || [];
    check('the project\'s own permission rule is still there (ownership without takeover)', ask.includes(FOREIGN_RULE));
    check('and the payload rules were merged in beside it', ask.length > 1 && !ask.some((r) => r.includes('<projectRoot>')), `${ask.length} rules`);
    const bk = (readJson(path.join(PROJECT, ...CONFIG_REL.split('/'))) || {})._aiwf || {};
    const manifest1 = readJson(path.join(PAYLOAD_1, 'migrations', 'index.json')) || [];
    const lastEntry = manifest1[manifest1.length - 1] || {};
    check('_aiwf.lastMigrationApplied is the LAST manifest entry of the payload that installed it',
      bk.lastMigrationApplied === lastEntry.id, `${bk.lastMigrationApplied} vs ${lastEntry.id}`);
    check('_aiwf.installedPluginVersion is that payload\'s version',
      bk.installedPluginVersion === payload1Version, `${bk.installedPluginVersion} vs ${payload1Version}`);
  }

  // -- 3. the simulated version bump -----------------------------------------
  step(`3 - build the bumped payload (${payload1Version} -> ${bump.targetPluginVersion}) from examples/example-project/bump/`);
  createOwnedDir('payload-0.2.0');
  copyTree(PAYLOAD_1, PAYLOAD_2);
  {
    const pluginJson = readJson(path.join(PAYLOAD_2, '.claude-plugin', 'plugin.json'));
    pluginJson.version = bump.targetPluginVersion;
    writeJson(path.join(PAYLOAD_2, '.claude-plugin', 'plugin.json'), pluginJson);

    const manifest = readJson(path.join(PAYLOAD_2, 'migrations', 'index.json'));
    manifest.push({ id: bump.migration, targetPluginVersion: bump.targetPluginVersion });
    writeJson(path.join(PAYLOAD_2, 'migrations', 'index.json'), manifest);

    copyTree(path.join(EXAMPLE_DIR, 'bump', bump.migration), path.join(PAYLOAD_2, 'migrations', bump.migration));

    // The schema half of the same release: the migration adds a config key, so the payload that
    // ships it must admit that key. A migration whose key the schema rejects is refused by the
    // runner before it writes anything - which is correct, and is why this overlay exists.
    const schema = readJson(path.join(PAYLOAD_2, 'schema', 'aiwf.config.schema.json'));
    const host = schema.properties[schemaKey.at];
    if (!host || !host.properties) throw new Error(`schema-key.json names "${schemaKey.at}", which is not an object block in the payload schema`);
    host.properties[schemaKey.property] = schemaKey.schema;
    writeJson(path.join(PAYLOAD_2, 'schema', 'aiwf.config.schema.json'), schema);
  }
  const validate = run(CMD_VALIDATE);
  check('the bumped payload is coherent (validate-payload exits 0)', validate.status === 0, tail(validate));
  check('and the validator confirms the new migration count', validate.out.includes(`${(readJson(path.join(PAYLOAD_2, 'migrations', 'index.json')) || []).length} migration(s)`), tail(validate, 1));

  // -- 4. the interlock -------------------------------------------------------
  step('4 - the version interlock stops a project the payload has moved past');
  const interlock = run(CMD_CHECK);
  check('--check exits 1 (pending migrations - that is what makes it an interlock)', interlock.status === 1, tail(interlock));
  check('--check names the pending migration', interlock.out.includes(bump.migration), tail(interlock, 2));

  // -- 5. the operator edits a managed region by hand -------------------------
  step('5 - the operator edits the managed region by hand, so the update meets a real conflict');
  const MY_EDIT = 'A line the operator wrote INSIDE the managed region.';
  {
    const file = path.join(PROJECT, 'CLAUDE.md');
    const text = read(file);
    const at = text.indexOf(END);
    fs.writeFileSync(file, `${text.slice(0, at)}\n${MY_EDIT}\n\n${text.slice(at)}`, 'utf8');
    check('the hand edit is inside the markers', (() => {
      const t = read(file);
      return t.indexOf(MY_EDIT) > t.indexOf(BEGIN) && t.indexOf(MY_EDIT) < t.indexOf(END);
    })());
  }

  // -- 6. dry run with no answers --------------------------------------------
  step('6 - a dry run with no resolution file stops, and writes nothing at all');
  const beforeDry = hashTree(PROJECT);
  const dry = run(CMD_DRYRUN);
  check('--dry-run with no --resolution-file exits 1', dry.status === 1, tail(dry));
  check('and it names the address it stopped on', dry.out.includes(`${bump.migration}/0/`), tail(dry, 2));
  check('the project is byte-identical to before the dry run (nothing staged, nothing written)',
    diffTrees(beforeDry, hashTree(PROJECT)).length === 0, diffTrees(beforeDry, hashTree(PROJECT)).join(', '));

  // -- 7. apply ---------------------------------------------------------------
  step('7 - apply, answering the new config key and keeping the hand-edited region');
  const resolutionsHash = writeJsonExclusive(RESOLUTIONS, {
    [`${bump.migration}/0/enforcement.dispatchGate`]: { kind: 'answer', value: false },
    [`${bump.migration}/1/${CLAUDE_KEY}`]: { kind: 'conflict', resolution: 'keep-mine' },
  });
  recordCreatedFile('resolutions.json', resolutionsHash);
  const apply = run(CMD_APPLY);
  check('--apply exits 0', apply.status === 0, tail(apply, 6));
  {
    const claude = read(path.join(PROJECT, 'CLAUDE.md')) || '';
    const cfg = readJson(path.join(PROJECT, ...CONFIG_REL.split('/'))) || {};
    const bk = cfg._aiwf || {};
    const entry = (bk.managedRegions || {})[CLAUDE_KEY] || {};
    const ask = ((readJson(path.join(PROJECT, ...SETTINGS_REL.split('/'))) || {}).permissions || {}).ask || [];
    const changes = read(path.join(PROJECT, `CHANGES_${payload1Version}-to-${bump.targetPluginVersion}.md`));

    check('keep-mine: the hand-edited content survived', claude.includes(MY_EDIT));
    check('keep-mine: the artifact is now HELD (override true) and upstream != local',
      entry.override === true && typeof entry.upstream === 'string' && entry.upstream !== entry.local,
      `override=${entry.override}`);
    check('add-config-key applied the OPERATOR\'s answer, not the op\'s default (true)',
      cfg.enforcement && cfg.enforcement.dispatchGate === false, JSON.stringify(cfg.enforcement));
    check('reconcile-ask-ruleset applied', apply.out.includes('ask ruleset reconciled'), tail(apply, 6));
    check('and it left the project\'s own foreign rule alone', ask.includes(FOREIGN_RULE));
    check('the note reached the CHANGES report, with its docRefs', !!changes && changes.includes('example-bump') && changes.includes('docs/LOOP.md'));
    check('the CHANGES report was written at the project root', changes !== null);
    check('the version stamps moved together',
      bk.installedPluginVersion === bump.targetPluginVersion && bk.lastMigrationApplied === bump.migration,
      `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
    check('the migration journal is clear', bk.migrationJournal === null, JSON.stringify(bk.migrationJournal));
    check('the update ran the self-check ITSELF and it passed', apply.out.includes('self-check: PASS'));
    check('the stage directory left no debris', !fs.existsSync(path.join(PROJECT, ...STAGE_REL.split('/'))));
  }

  // -- 8. leaving the override ------------------------------------------------
  step('8 - --resolve is the way OUT of an override, with no version bump involved');
  const takeNewHash = writeJsonExclusive(RESOLVE_TAKE_NEW, { [CLAUDE_KEY]: { kind: 'conflict', resolution: 'take-new' } });
  recordCreatedFile('resolve-take-new.json', takeNewHash);
  const resolve = run(CMD_RESOLVE);
  check('--resolve exits 0', resolve.status === 0, tail(resolve, 4));
  {
    const claude = read(path.join(PROJECT, 'CLAUDE.md')) || '';
    const entry = ((readJson(path.join(PROJECT, ...CONFIG_REL.split('/'))) || {})._aiwf || {}).managedRegions[CLAUDE_KEY] || {};
    check('the hand edit is gone and the payload render is in place', !claude.includes(MY_EDIT) && claude.includes(BEGIN));
    check('the operator text OUTSIDE the markers is still untouched', claude.includes(SEED_PROSE) && claude.indexOf(SEED_PROSE) < claude.indexOf(BEGIN));
    check('the artifact is no longer held: override false, local == upstream',
      entry.override === false && entry.local === entry.upstream, `override=${entry.override}`);
  }

  // -- 9. the final self-check ------------------------------------------------
  step('9 - the self-check, run on its own against the finished project');
  const selfcheck = run(CMD_SELFCHECK);
  check('the self-check exits 0 against the updated project', selfcheck.status === 0,
    selfcheck.status === 0 ? '' : '\n' + (selfcheck.out || '').trim().split('\n').slice(-16).join('\n'));
} catch (e) {
  // An unexpected throw is a FAILED cycle, never a quiet one: it is recorded as a check so the
  // summary below cannot report "0 failures" for a run that did not finish.
  check('the cycle ran to the end without an unexpected error', false, `${e && e.message ? e.message : String(e)}`);
}

// ---------------------------------------------------------------------------
step('the repository itself');
{
  const changed = diffTrees(repoBefore, hashTree(REPO_ROOT));
  check('the repository is byte-identical: this cycle wrote only inside its work directory',
    changed.length === 0, changed.slice(0, 8).join(', '));
}

// ---------------------------------------------------------------------------
// Cleanup, by ownership, and never silent about what it could not finish
// ---------------------------------------------------------------------------
if (HAS('--keep')) {
  console.log(`\nwork directory kept: ${workDir}`);
} else {
  const leftBehind = [];
  const remove = (target) => {
    if (!fs.existsSync(target)) return;
    try { fs.rmSync(target, { recursive: true, force: true, maxRetries: 3 }); } catch (e) { leftBehind.push(`${target} (${e.message})`); return; }
    if (fs.existsSync(target)) leftBehind.push(`${target} (still on disk after the removal reported success)`);
  };

  if (OWNS_WORK_DIR) {
    remove(workDir);
  } else {
    // The operator's directory keeps its identity, and so does every entry in it. A recorded FILE
    // is removed only while its bytes are still the ones this run wrote: an entry that something
    // else replaced afterwards carries the same NAME and is not the same thing, and deleting it
    // would be exactly the mistake ownership-by-name makes.
    const removed = [];
    const accountedFor = new Set(); // names this pass has already judged, removed or deliberately left
    for (const entry of createdEntries) {
      const target = path.join(workDir, entry.name);
      accountedFor.add(entry.name);
      if (!fs.existsSync(target)) continue;
      if (entry.kind === 'file') {
        let now = null;
        try { now = sha256Bytes(fs.readFileSync(target)); } catch (e) {
          leftBehind.push(`${target} (it could not be read to confirm it is still the file this run wrote: ${e.message}) - LEFT on disk`);
          continue;
        }
        if (now !== entry.hash) {
          leftBehind.push(`${target} (its bytes changed since this run wrote it, so it is no longer this run's to delete) - LEFT on disk`);
          continue;
        }
      }
      remove(target);
      removed.push(entry.name);
    }
    console.log(`\nwork directory ${workDir} was supplied and was empty, so only what this run created there was removed: ${removed.join(', ') || '(nothing)'}`);
    // Anything still in there was never recorded as created, so it is not removed - but it is not
    // passed over in silence either. The directory was empty when this run acquired it, so a
    // survivor means the ownership record missed something, and that is worth seeing.
    let survivors = [];
    try { survivors = fs.readdirSync(workDir); } catch (e) { leftBehind.push(`${workDir} (its contents could not be listed: ${e.message})`); }
    for (const name of survivors) {
      if (accountedFor.has(name)) continue; // already reported above, with the reason that really applies
      leftBehind.push(`${path.join(workDir, name)} (present but never recorded as created by this run, so it was NOT removed)`);
    }
  }

  // An unfinished cleanup is REPORTED, never swallowed - and it is a check, so it lands in the
  // counts rather than in a line nobody reads. Saying nothing about files left behind is the same
  // class of defect as saying nothing about a gate that did not run.
  if (leftBehind.length) {
    console.log('WARNING - the cleanup did not finish. These are still on disk:');
    for (const item of leftBehind) console.log(`  ${item}`);
  }
  check('the cleanup removed everything this run created', leftBehind.length === 0, leftBehind.slice(0, 4).join('; '));
}
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(failures === 0 ? 'EXAMPLE CYCLE: PASS' : 'EXAMPLE CYCLE: FAIL');
process.exit(failures === 0 ? 0 : 1);
