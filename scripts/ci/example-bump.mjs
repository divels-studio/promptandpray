#!/usr/bin/env node
/*
 * The simulated next release of the example cycle, NUMBERED WHEN IT IS BUILT.
 *
 * WHAT IT IS
 *   `examples/example-project/bump/` holds the simulated release as a TEMPLATE: `bump.json` names
 *   only its slug, and `bump/<slug>/` carries the operations and the notes - no migration number and
 *   no version. This module turns that template into a real migration inside a payload COPY: the
 *   next migration number of THAT payload (manifest length + 1) and the next minor version of THAT
 *   payload. The payload validator requires the numeric prefixes to ascend by exactly 1, so a
 *   committed number went stale with every real release and had to be renamed by hand; a number
 *   computed here cannot, and a real release never has to touch `examples/`.
 *
 *   It is the ONE builder. The example cycle runs it through the CLI below - the same command line
 *   `examples/example-project/README.md` shows - the self-check runs that CLI over a throwaway copy,
 *   and the update suite imports `buildExampleBump` directly.
 *
 * WHAT IT WRITES
 *   Only under <payload>: `migrations/<id>/` (the template's files, with `migration` and
 *   `targetPluginVersion` written into ops.json), the new last entry of `migrations/index.json`, the
 *   version in `.claude-plugin/plugin.json`, and the property `bump/schema-key.json` declares, spliced
 *   into `schema/aiwf.config.schema.json`. The example directory is only READ. Every input - the
 *   whole template directory included, read into memory entry by entry - is read and judged before
 *   the first write, and the migration directory is written from that memory, never copied from the
 *   source. So a refused build (an unreadable entry, a dangling link, a bad JSON file) leaves the
 *   payload exactly as it was, and the same payload can be built again once the input is repaired.
 *
 * CLI
 *   node scripts/ci/example-bump.mjs --payload <dir> --example <dir>
 *     --payload <dir>  the payload COPY to turn into the simulated next release
 *     --example <dir>  the example project directory - the one that holds bump/
 *   Prints `migration: <id>` and `targetPluginVersion: <version>`.
 *   exit 0 = built; 1 = the build failed (the reason is printed; a refusal from the judging phase
 *   says that nothing was written); 2 = a required argument is missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_RE = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
// A refusal is raised before the first write, and says so; an error from the write phase itself
// (a full disk, a permission) propagates as it is, without that claim.
function refuse(message) {
  const e = new Error(`${message}. Nothing was written`);
  e.refused = true;
  return e;
}
function readJson(file, what) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw refuse(`${what} cannot be read (${file}: ${e.code || e.message})`); }
  try { return JSON.parse(text); } catch (e) { throw refuse(`${what} is not valid JSON (${file}: ${e.message})`); }
}
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');

/**
 * The template, read WHOLE into memory during the judging phase: every entry under `dir` becomes a
 * `{ rel, dir: true }` or `{ rel, bytes }` record. An entry that cannot be listed or read, or that
 * is neither a regular file nor a directory once followed (a dangling symlink or junction is the
 * common case), is a refusal HERE - before anything exists under the payload. The write phase then
 * writes from these records and never goes back to the source, so a template that turns out to be
 * unreadable cannot leave a half-built migration directory behind.
 */
function readTemplate(dir, label, rel = '', acc = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch (e) { throw refuse(`${label}${rel ? '/' + rel : ''} cannot be listed (${e.code || e.message})`); }
  for (const name of entries.sort()) {
    const r = rel ? `${rel}/${name}` : name;
    const p = path.join(dir, name);
    let stat;
    try { stat = fs.statSync(p); } catch (e) { throw refuse(`${label}/${r} cannot be read (${e.code || e.message})`); }
    if (stat.isDirectory()) {
      acc.push({ rel: r, dir: true });
      readTemplate(p, label, r, acc);
    } else if (stat.isFile()) {
      try { acc.push({ rel: r, bytes: fs.readFileSync(p) }); } catch (e) { throw refuse(`${label}/${r} cannot be read (${e.code || e.message})`); }
    } else {
      throw refuse(`${label}/${r} is neither a regular file nor a directory`);
    }
  }
  return acc;
}

/**
 * Builds the simulated next release into `payloadDir` from the template under `exampleDir`/bump.
 * Returns `{ id, targetPluginVersion }`. Throws an error marked `refused`, having written nothing,
 * when an input is unusable.
 */
export function buildExampleBump(payloadDir, exampleDir) {
  const payload = path.resolve(payloadDir);
  const bumpDir = path.join(path.resolve(exampleDir), 'bump');

  // ---- read and judge everything first ---------------------------------------------------------
  const bump = readJson(path.join(bumpDir, 'bump.json'), 'bump/bump.json');
  if (!isPlainObject(bump) || typeof bump.slug !== 'string' || !SLUG_RE.test(bump.slug)) {
    throw refuse('bump/bump.json does not declare {slug} as a lowercase dash-separated slug');
  }
  const slug = bump.slug;
  const template = path.join(bumpDir, slug);
  const ops = readJson(path.join(template, 'ops.json'), `bump/${slug}/ops.json`);
  if (!isPlainObject(ops) || !Array.isArray(ops.operations)) {
    throw refuse(`bump/${slug}/ops.json does not carry an "operations" array`);
  }
  const templateEntries = readTemplate(template, `bump/${slug}`);
  const schemaKey = readJson(path.join(bumpDir, 'schema-key.json'), 'bump/schema-key.json');
  if (!isPlainObject(schemaKey) || typeof schemaKey.at !== 'string' || typeof schemaKey.property !== 'string' || schemaKey.schema === undefined) {
    throw refuse('bump/schema-key.json does not declare {at, property, schema}');
  }

  const pluginFile = path.join(payload, '.claude-plugin', 'plugin.json');
  const plugin = readJson(pluginFile, 'the payload plugin.json');
  const version = VERSION_RE.exec(isPlainObject(plugin) ? String(plugin.version) : '');
  if (!version) throw refuse(`the payload plugin.json does not declare a plain MAJOR.MINOR.PATCH version (${pluginFile})`);
  const [, major, minor] = version;
  const manifestFile = path.join(payload, 'migrations', 'index.json');
  const manifest = readJson(manifestFile, 'the payload migrations/index.json');
  if (!Array.isArray(manifest)) throw refuse(`the payload migrations/index.json is not an array (${manifestFile})`);
  const schemaFile = path.join(payload, 'schema', 'aiwf.config.schema.json');
  const schema = readJson(schemaFile, 'the payload schema');
  const host = isPlainObject(schema) && isPlainObject(schema.properties) ? schema.properties[schemaKey.at] : null;
  if (!isPlainObject(host) || !isPlainObject(host.properties)) {
    throw refuse(`bump/schema-key.json names "${schemaKey.at}", which is not an object block in the payload schema`);
  }

  // ---- the two computed values -----------------------------------------------------------------
  const number = manifest.length + 1;
  const id = `${String(number).padStart(4, '0')}_${slug}`;
  const targetPluginVersion = `${major}.${Number(minor) + 1}.0`;
  const target = path.join(payload, 'migrations', id);
  if (fs.existsSync(target)) throw refuse(`${target} already exists - the bump is built once, into a fresh payload copy`);

  // ---- write, into the payload only ------------------------------------------------------------
  // From the in-memory template: nothing below reads the source again.
  fs.mkdirSync(target);
  for (const entry of templateEntries) {
    const to = path.join(target, ...entry.rel.split('/'));
    if (entry.dir) fs.mkdirSync(to); else fs.writeFileSync(to, entry.bytes);
  }
  const body = Object.fromEntries(Object.entries(ops).filter(([k]) => k !== 'migration' && k !== 'targetPluginVersion'));
  writeJson(path.join(target, 'ops.json'), { migration: id, targetPluginVersion, ...body });
  manifest.push({ id, targetPluginVersion });
  writeJson(manifestFile, manifest);
  plugin.version = targetPluginVersion;
  writeJson(pluginFile, plugin);
  // The schema half of the same release: the migration adds a config key, so the payload that ships
  // it must admit that key. A migration whose key the schema rejects is refused by the runner before
  // it writes anything.
  host.properties[schemaKey.property] = schemaKey.schema;
  writeJson(schemaFile, schema);
  return { id, targetPluginVersion };
}

// ---- CLI -------------------------------------------------------------------
// Both sides go through realpath: a payload reached through a SYMLINK hands this module its real path
// in `import.meta.url` while `process.argv[1]` keeps the link.
function isMain() {
  const real = (p) => { try { return fs.realpathSync(p); } catch { return p; } };
  const invoked = process.argv[1] ? real(path.resolve(process.argv[1])) : '';
  return invoked !== '' && invoked === real(path.resolve(fileURLToPath(import.meta.url)));
}

if (isMain()) {
  const args = process.argv.slice(2);
  const value = (name) => {
    const i = args.indexOf(name);
    const v = i === -1 ? undefined : args[i + 1];
    return typeof v === 'string' && v.trim() !== '' && !v.startsWith('--') ? v : null;
  };
  const payload = value('--payload');
  const example = value('--example');
  if (payload === null || example === null) {
    console.error(`example-bump: ${payload === null ? '--payload' : '--example'} <dir> is required.`);
    console.error('usage: node scripts/ci/example-bump.mjs --payload <dir> --example <dir>');
    process.exitCode = 2;
  } else {
    try {
      const built = buildExampleBump(payload, example);
      console.log(`migration: ${built.id}`);
      console.log(`targetPluginVersion: ${built.targetPluginVersion}`);
    } catch (e) {
      console.error(`example-bump: ${e.message}${e.refused ? '.' : ''}`);
      process.exitCode = 1;
    }
  }
}
