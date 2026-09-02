#!/usr/bin/env node
/*
 * Migration payload validator - the ONE gate both the runner and setup pass before their first write.
 *
 * WHY IT IS SHARED, AND WHY IT RUNS BEFORE ANY WRITE
 *   Two different engines depend on the migration payload being coherent. The runner EXECUTES the
 *   migrations; setup STAMPS the last manifest entry as `lastMigrationApplied` on a fresh install
 *   (nothing is executed there - the fresh install already IS the current state). A payload with a
 *   gap, a duplicate id, an orphan directory or an unknown op field would be discovered by the
 *   runner halfway through a sequence and by setup never - so both call this module first and stop
 *   with zero bytes written when it reports anything.
 *
 * WHAT IT ASSERTS (fail-closed: anything not explicitly allowed is an error)
 *   manifest  - migrations/index.json is a non-empty ARRAY of entries with EXACTLY {id,
 *               targetPluginVersion}; ids are NNNN_<slug> whose numeric prefixes ascend by exactly
 *               1 from 0001 (no gaps, no duplicates, no reordering); versions are plain
 *               MAJOR.MINOR.PATCH triples (a prerelease or build suffix is REJECTED - a migration
 *               sequence orders versions, and prerelease ordering is a rule nobody here implements),
 *               strictly increasing; the LAST entry's version equals the payload's own version, so
 *               "no unapplied migrations" and "installed == payload version" cannot disagree.
 *   directories - manifest ids and migrations/<dir> are one-to-one EQUAL sets. An entry without a
 *               directory cannot run; a directory without an entry would SILENTLY never run, which
 *               is the worse of the two and is why an orphan is an error rather than a warning.
 *   ops.json  - exactly {migration, targetPluginVersion, operations}; `migration` equals its own
 *               directory name and `targetPluginVersion` equals the manifest entry, so a copied
 *               migration cannot claim to be another one. Every operation matches its type's EXACT
 *               field set (unknown type, unknown field and missing field are all errors), every
 *               `file` is a project-relative path with no absolute form and no ".." traversal, and
 *               every `template`/`ruleset` reference is payload-relative under templates/ AND
 *               really exists.
 *
 * API (ESM)
 *   validatePayload(pluginRoot)  -> { errors: string[], manifest: entry[], migrations: Map<id, ops> }
 *   payloadVersion(pluginRoot)   -> the version string in .claude-plugin/plugin.json (throws PayloadError)
 *   compareVersions(a, b)        -> -1 | 0 | 1 over plain triples
 *   parseVersion(v)              -> [major, minor, patch] or null
 *
 * CLI
 *   node validate-payload.mjs [--plugin-root <dir>]
 *     exit 0 = the payload is coherent; 1 = it is not (errors on stderr); 2 = the run could not
 *     start (no plugin.json, unreadable manifest file).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PLUGIN_ROOT = path.resolve(HERE, '..', '..');
export const MANIFEST_REL = 'migrations/index.json';
export const MIGRATIONS_DIR = 'migrations';

export class PayloadError extends Error {}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------
// PLAIN triples only. The manifest orders a sequence of migrations, and ordering "1.0.0-rc.2"
// against "1.0.0" is a semver rule this engine does not implement - so it refuses the input rather
// than inventing an order for it.
//
// Leading zeroes are rejected per component (`0` or `[1-9][0-9]*`): "01.0.0" and "1.0.0" would
// compare EQUAL here while being two different strings everywhere else - in plugin.json, in the
// `installedPluginVersion` stamp, in every message - so the "installed == the migration's target
// version" invariant could hold numerically and fail on a string compare, or the other way round.
const VERSION_RE = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

export function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const m = VERSION_RE.exec(value);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) throw new PayloadError(`cannot compare versions "${a}" and "${b}" - both must be plain MAJOR.MINOR.PATCH triples`);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

export function payloadVersion(pluginRoot) {
  const file = path.join(pluginRoot, '.claude-plugin', 'plugin.json');
  const raw = readText(file);
  if (raw === null) throw new PayloadError(`cannot read ${file} - this does not look like a plugin payload.`);
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { throw new PayloadError(`${file} is not valid JSON (${e.message}).`); }
  if (!isPlainObject(parsed) || typeof parsed.version !== 'string') {
    throw new PayloadError(`${file} declares no "version" string.`);
  }
  return parsed.version;
}

// ---------------------------------------------------------------------------
// The op vocabulary - the EXACT field set per type (PLAN "Migration format (ops.json)")
// ---------------------------------------------------------------------------
// `required` is asserted by presence (hasOwnProperty), never by truthiness: `"default": false` and
// `"default": null` are legitimate values for add-config-key, and a truthiness test would report
// them as missing.
export const OP_SPECS = {
  'add-config-key': {
    required: ['op', 'path', 'default', 'askOperator'],
    optional: ['question'],
    // `question` is shown ONLY when askOperator is true, so it is required exactly then and
    // forbidden otherwise: a question nobody will ever be asked is a defect in the migration, not
    // documentation.
    conditional: (op) => {
      const errors = [];
      if (op.askOperator === true && !has(op, 'question')) errors.push('"question" is required when askOperator is true');
      if (op.askOperator !== true && has(op, 'question')) errors.push('"question" is only allowed when askOperator is true');
      if (has(op, 'question') && (typeof op.question !== 'string' || op.question.trim() === '')) errors.push('"question" must be a non-empty string');
      return errors;
    },
    types: { path: 'string', askOperator: 'boolean' },
  },
  'rerender-managed-region': {
    // `ifRecorded: true` marks an artifact that exists on SOME installations only - the clearest
    // case being `.claude/agents/reviewer.md`, which is rendered for a claude-hosted host and does
    // not exist at all on a codex-configured project. Without the field a re-render of an
    // unrecorded artifact THROWS (that is the invariant: an update never adopts a file it did not
    // write), which would break the apply of every installation that legitimately does not have it.
    // With it, such an artifact is reported as skipped and the migration continues.
    required: ['op', 'file', 'region', 'template'],
    optional: ['ifRecorded'],
    conditional: () => [],
    types: { file: 'string', template: 'string', ifRecorded: 'boolean' },
  },
  'reconcile-ask-ruleset': {
    required: ['op', 'ruleset'],
    optional: [],
    conditional: () => [],
    types: { ruleset: 'string' },
  },
  note: {
    required: ['op', 'id', 'text', 'docRefs'],
    optional: [],
    conditional: () => [],
    types: { id: 'string', text: 'string' },
  },
};

export const OP_TYPES = Object.keys(OP_SPECS);

// A config dot-path the migration may create. `_aiwf` and `$schema` are excluded on purpose: the
// bookkeeping block is written by setup/update alone and is not a migratable surface.
const CONFIG_PATH_RE = /^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)*$/;

function relPathError(label, value) {
  if (typeof value !== 'string' || value.trim() === '') return `${label} must be a non-empty string`;
  if (value.includes('\\')) return `${label} ("${value}") must use forward slashes, not backslashes`;
  if (/^[A-Za-z]:/.test(value) || value.startsWith('/')) return `${label} ("${value}") must be relative, not absolute`;
  const segments = value.split('/');
  if (segments.includes('..')) return `${label} ("${value}") must not traverse upwards with ".."`;
  if (segments.some((s) => s === '')) return `${label} ("${value}") has an empty path segment`;
  return null;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
/**
 * Validates the whole migration payload. NEVER throws for a payload defect - defects come back as
 * `errors`, so a caller can report all of them at once and write nothing. It throws only when the
 * run itself cannot start (no plugin.json).
 */
export function validatePayload(pluginRoot) {
  const errors = [];
  const migrations = new Map();
  const version = payloadVersion(pluginRoot); // throws: a missing plugin.json is not a payload defect

  // The payload's OWN version is validated here, as a payload defect (exit 1), not left to blow up
  // inside a comparison later (exit 2, "the run could not start"). A payload that declares
  // "0.2" or "1.0.0-rc.1" is a broken payload, and that is what the operator has to be told.
  if (!parseVersion(version)) {
    errors.push(
      `.claude-plugin/plugin.json declares version "${version}", which is not a plain MAJOR.MINOR.PATCH triple ` +
      '(no prerelease or build suffix, no leading zeroes) - the migration sequence is ordered by it.',
    );
  }

  const manifestFile = path.join(pluginRoot, ...MANIFEST_REL.split('/'));
  const raw = readText(manifestFile);
  if (raw === null) {
    errors.push(`${MANIFEST_REL} is missing - the migration manifest is required, even when it lists a single entry.`);
    return { errors, manifest: [], migrations, version };
  }
  let manifest;
  try { manifest = JSON.parse(raw); } catch (e) {
    errors.push(`${MANIFEST_REL} is not valid JSON (${e.message}).`);
    return { errors, manifest: [], migrations, version };
  }
  if (!Array.isArray(manifest)) {
    errors.push(`${MANIFEST_REL} must be a JSON ARRAY of {id, targetPluginVersion} entries.`);
    return { errors, manifest: [], migrations, version };
  }
  if (manifest.length === 0) {
    errors.push(`${MANIFEST_REL} is empty - a payload always carries at least the initial migration.`);
    return { errors, manifest: [], migrations, version };
  }

  // ---- entries -------------------------------------------------------------
  const ID_RE = /^([0-9]{4})_([a-z0-9]+(?:-[a-z0-9]+)*)$/;
  const seen = new Set();
  let previousVersion = null;
  manifest.forEach((entry, i) => {
    const at = `${MANIFEST_REL}[${i}]`;
    if (!isPlainObject(entry)) { errors.push(`${at} is not an object.`); return; }
    for (const key of Object.keys(entry)) {
      if (key !== 'id' && key !== 'targetPluginVersion') {
        errors.push(`${at} has an unknown field "${key}" - a manifest entry carries exactly {id, targetPluginVersion}.`);
      }
    }
    for (const key of ['id', 'targetPluginVersion']) {
      if (!has(entry, key)) errors.push(`${at} is missing "${key}".`);
    }
    const { id, targetPluginVersion } = entry;
    if (typeof id === 'string') {
      const m = ID_RE.exec(id);
      if (!m) {
        errors.push(`${at} id "${id}" is not of the form NNNN_<slug> (four digits, underscore, a lowercase dash-separated slug).`);
      } else {
        if (seen.has(id)) errors.push(`${at} id "${id}" is a DUPLICATE of an earlier entry.`);
        seen.add(id);
        const number = Number(m[1]);
        if (number !== i + 1) {
          errors.push(`${at} id "${id}" carries the number ${number} but sits at position ${i + 1} - the numeric prefixes ascend by exactly 1 from 0001 (no gaps, no reordering).`);
        }
      }
    } else if (has(entry, 'id')) {
      errors.push(`${at} id must be a string.`);
    }
    if (typeof targetPluginVersion === 'string') {
      if (!parseVersion(targetPluginVersion)) {
        errors.push(`${at} targetPluginVersion "${targetPluginVersion}" is not a plain MAJOR.MINOR.PATCH triple (prerelease and build suffixes are rejected).`);
      } else {
        if (previousVersion !== null && compareVersions(targetPluginVersion, previousVersion) <= 0) {
          errors.push(`${at} targetPluginVersion "${targetPluginVersion}" does not increase on the previous entry's "${previousVersion}" - manifest versions are strictly monotonic.`);
        }
        previousVersion = targetPluginVersion;
      }
    } else if (has(entry, 'targetPluginVersion')) {
      errors.push(`${at} targetPluginVersion must be a string.`);
    }
  });

  const last = manifest[manifest.length - 1];
  if (isPlainObject(last) && typeof last.targetPluginVersion === 'string'
      && parseVersion(last.targetPluginVersion) && parseVersion(version)) {
    if (compareVersions(last.targetPluginVersion, version) !== 0) {
      errors.push(
        `the LAST manifest entry targets ${last.targetPluginVersion} but the payload version is ${version} - a version bump ` +
        'without operations still needs a no-op migration, or "no unapplied migrations" and "installed == payload version" ' +
        'would disagree with each other.',
      );
    }
  }

  // ---- directories: one-to-one with the manifest ---------------------------
  const dirRoot = path.join(pluginRoot, MIGRATIONS_DIR);
  let dirNames = [];
  try {
    dirNames = fs.readdirSync(dirRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    errors.push(`${MIGRATIONS_DIR}/ cannot be read - the migration directories are part of the payload.`);
  }
  const ids = manifest.filter(isPlainObject).map((e) => e.id).filter((id) => typeof id === 'string');
  for (const name of dirNames) {
    if (!ids.includes(name)) {
      errors.push(`${MIGRATIONS_DIR}/${name}/ has no entry in ${MANIFEST_REL} - an orphan migration directory would SILENTLY never run.`);
    }
  }

  // ---- ops.json per migration ----------------------------------------------
  for (const entry of manifest) {
    if (!isPlainObject(entry) || typeof entry.id !== 'string') continue;
    const id = entry.id;
    const dir = path.join(dirRoot, id);
    if (!dirNames.includes(id)) {
      errors.push(`${MIGRATIONS_DIR}/${id}/ is listed in the manifest but does not exist.`);
      continue;
    }
    if (readText(path.join(dir, 'NOTES.md')) === null) {
      errors.push(`${MIGRATIONS_DIR}/${id}/NOTES.md is missing - every migration documents itself for the operator.`);
    }
    const opsRaw = readText(path.join(dir, 'ops.json'));
    if (opsRaw === null) { errors.push(`${MIGRATIONS_DIR}/${id}/ops.json is missing.`); continue; }
    let ops;
    try { ops = JSON.parse(opsRaw); } catch (e) {
      errors.push(`${MIGRATIONS_DIR}/${id}/ops.json is not valid JSON (${e.message}).`);
      continue;
    }
    const at = `${MIGRATIONS_DIR}/${id}/ops.json`;
    if (!isPlainObject(ops)) { errors.push(`${at} must be an object.`); continue; }
    for (const key of Object.keys(ops)) {
      if (!['migration', 'targetPluginVersion', 'operations'].includes(key)) {
        errors.push(`${at} has an unknown field "${key}" - the wrapper carries exactly {migration, targetPluginVersion, operations}.`);
      }
    }
    if (ops.migration !== id) {
      errors.push(`${at} declares migration "${ops.migration}" but lives in ${MIGRATIONS_DIR}/${id}/ - a copied migration must not claim to be another one.`);
    }
    if (ops.targetPluginVersion !== entry.targetPluginVersion) {
      errors.push(`${at} declares targetPluginVersion "${ops.targetPluginVersion}" but the manifest entry says "${entry.targetPluginVersion}".`);
    }
    if (!Array.isArray(ops.operations)) {
      errors.push(`${at} "operations" must be an array (an empty array is a legitimate no-op migration).`);
      continue;
    }
    ops.operations.forEach((op, i) => {
      for (const message of validateOp(op, `${at} operations[${i}]`, pluginRoot)) errors.push(message);
    });
    migrations.set(id, ops);
  }

  return { errors, manifest, migrations, version };
}

/** Validates ONE operation object. Returns a (possibly empty) list of messages. */
export function validateOp(op, at, pluginRoot) {
  const errors = [];
  if (!isPlainObject(op)) return [`${at} is not an object.`];
  if (typeof op.op !== 'string' || !has(OP_SPECS, op.op)) {
    return [`${at} has an unknown op type ${JSON.stringify(op.op)} - the vocabulary is exactly [${OP_TYPES.join(', ')}].`];
  }
  const spec = OP_SPECS[op.op];
  const allowed = new Set([...spec.required, ...spec.optional]);
  for (const key of Object.keys(op)) {
    if (!allowed.has(key)) errors.push(`${at} (${op.op}) has an unknown field "${key}".`);
  }
  for (const key of spec.required) {
    if (!has(op, key)) errors.push(`${at} (${op.op}) is missing the required field "${key}".`);
  }
  for (const [key, type] of Object.entries(spec.types || {})) {
    if (has(op, key) && typeof op[key] !== type) errors.push(`${at} (${op.op}) field "${key}" must be a ${type}.`);
  }
  for (const message of spec.conditional(op)) errors.push(`${at} (${op.op}) ${message}.`);

  if (op.op === 'add-config-key' && typeof op.path === 'string') {
    if (!CONFIG_PATH_RE.test(op.path)) {
      errors.push(`${at} (add-config-key) path "${op.path}" is not a plain dot-path of config keys.`);
    } else if (op.path.split('.')[0] === '_aiwf') {
      errors.push(`${at} (add-config-key) path "${op.path}" targets the _aiwf bookkeeping block, which only setup and update own.`);
    }
  }
  if (op.op === 'rerender-managed-region') {
    if (has(op, 'file')) {
      const bad = relPathError('file', op.file);
      if (bad) errors.push(`${at} (rerender-managed-region) ${bad}.`);
    }
    if (has(op, 'region') && op.region !== null && (typeof op.region !== 'string' || op.region.trim() === '')) {
      errors.push(`${at} (rerender-managed-region) "region" must be a marker id or null (null = a whole-file managed artifact).`);
    }
    if (has(op, 'template')) for (const m of payloadRefErrors('template', op.template, pluginRoot)) errors.push(`${at} (rerender-managed-region) ${m}.`);
  }
  if (op.op === 'reconcile-ask-ruleset' && has(op, 'ruleset')) {
    for (const m of payloadRefErrors('ruleset', op.ruleset, pluginRoot)) errors.push(`${at} (reconcile-ask-ruleset) ${m}.`);
  }
  if (op.op === 'note') {
    if (has(op, 'docRefs')) {
      if (!Array.isArray(op.docRefs)) errors.push(`${at} (note) "docRefs" must be an array (an empty one is fine).`);
      else if (op.docRefs.some((r) => typeof r !== 'string' || r.trim() === '')) errors.push(`${at} (note) every docRefs entry must be a non-empty string.`);
    }
    if (has(op, 'id') && typeof op.id === 'string' && op.id.trim() === '') errors.push(`${at} (note) "id" must not be empty.`);
  }
  return errors;
}

/**
 * A payload reference (`template`, `ruleset`) is payload-relative, lives under templates/, may carry
 * a `#<region>` suffix on a template, and must EXIST. A dangling reference discovered mid-migration
 * would stop a run that has already written something.
 *
 * A `#<region>` suffix is checked against the template's REAL markers, not just the file's
 * existence: `templates/CLAUDE.md.tmpl#not-a-region` names a file that is there and a region that is
 * not, so without this the reference resolves to nothing - and it resolves to nothing halfway
 * through a migration, which is exactly the moment this validator exists to come before.
 */
function payloadRefErrors(label, value, pluginRoot) {
  const bad = relPathError(label, value);
  if (bad) return [bad];
  const [file, ...rest] = value.split('#');
  if (rest.length > 1) return [`${label} ("${value}") carries more than one "#" region suffix`];
  if (rest.length === 1 && rest[0].trim() === '') return [`${label} ("${value}") has an empty region suffix`];
  const fileError = relPathError(label, file);
  if (fileError) return [fileError];
  if (!file.startsWith('templates/')) return [`${label} ("${value}") must be payload-relative under templates/`];
  if (!pluginRoot) return [];
  const abs = path.join(pluginRoot, ...file.split('/'));
  if (!fs.existsSync(abs)) return [`${label} ("${value}") does not exist in the payload`];
  if (rest.length === 1) {
    const region = rest[0];
    const text = readText(abs);
    if (text === null) return [`${label} ("${value}") names a template that cannot be read`];
    const begin = `<!-- BEGIN ${region} -->`;
    const end = `<!-- END ${region} -->`;
    const from = text.indexOf(begin);
    const to = text.indexOf(end);
    if (from === -1 || to === -1 || to < from) {
      return [`${label} ("${value}") names a region the template does not carry (no matching "${begin}" / "${end}" pair)`];
    }
  }
  return [];
}

// ---- CLI -------------------------------------------------------------------
function isMain() {
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return invoked === path.resolve(fileURLToPath(import.meta.url));
}

if (isMain()) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--plugin-root');
  const pluginRoot = path.resolve(i !== -1 && args[i + 1] ? args[i + 1] : DEFAULT_PLUGIN_ROOT);
  let result;
  try {
    result = validatePayload(pluginRoot);
  } catch (e) {
    console.error(`validate-payload: ${e.message}`);
    process.exit(2);
  }
  if (result.errors.length === 0) {
    console.log(`valid: ${result.manifest.length} migration(s) in ${pluginRoot}, payload version ${result.version}`);
    process.exit(0);
  }
  console.error(`invalid migration payload: ${pluginRoot}`);
  for (const e of result.errors) console.error(`  - ${e}`);
  process.exit(1);
}
