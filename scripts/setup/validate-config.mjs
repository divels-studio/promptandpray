#!/usr/bin/env node
/*
 * Config validator - a SUBSET JSON-Schema interpreter, driven by the schema FILE.
 *
 * WHY THIS EXISTS AND WHAT IT DELIBERATELY IS NOT
 *   The plugin ships with no dependencies, so there is no ajv. The alternative to this file is
 *   hand-written checks inside the interview and the generator - which would make the schema a
 *   decorative second copy of the rules, free to drift from the code that actually decides. So the
 *   schema stays THE authority and this file only INTERPRETS it: every constraint is read from
 *   schema/aiwf.config.schema.json at run time, and nothing about the config shape is restated here.
 *
 *   It is NOT a JSON Schema implementation. It supports exactly the keyword subset the shipped
 *   schema uses, and it THROWS on any keyword it does not implement. That direction is the whole
 *   point: an unimplemented keyword that were silently ignored would turn a real constraint into
 *   decoration - the exact failure this file exists to prevent - so the unknown keyword fails the
 *   run loudly instead. The check is a FULL schema walk done before the first assertion, not a
 *   per-node check as the instance arrives: a keyword under an `items` of an empty list, under an
 *   unmatched `patternProperties`, under an absent property, or in the untaken branch of an
 *   `if/then/else` is exactly where an instance-driven check would never look.
 *
 * API (ESM)
 *   loadSchema(file?)                 -> the parsed schema (default: the payload schema)
 *   validate(instance, schema)        -> [{ path, message }, ...]  (empty array = valid)
 *   isValid(instance, schema)         -> boolean
 *   collectDefaults(schema)           -> a fresh object of every declared default (no input touched)
 *   formatErrors(errors)              -> one line per error
 *
 * CLI
 *   node validate-config.mjs <config.json> [--schema <schema.json>]
 *     exit 0 = valid; exit 1 = invalid (errors on stderr); exit 2 = the run could not start
 *     (unreadable/unparseable file, or a schema this interpreter cannot execute).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SCHEMA_PATH = path.resolve(HERE, '..', '..', 'schema', 'aiwf.config.schema.json');

// Keywords that carry no assertion. Read, never enforced.
const ANNOTATION_KEYWORDS = new Set(['$schema', '$id', '$comment', 'title', 'description', 'default', 'examples']);
// Keywords this interpreter really executes. Anything outside both sets is a hard error.
const ASSERTION_KEYWORDS = new Set([
  'type', 'enum', 'const', 'required', 'properties', 'additionalProperties', 'patternProperties',
  'items', 'minItems', 'minLength', 'minimum', 'pattern', 'allOf', 'if', 'then', 'else',
]);

export class SchemaSupportError extends Error {}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  return typeof value; // string | boolean | object
}

function typeMatches(value, expected) {
  const actual = typeOf(value);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  return actual === expected;
}

// Structural equality for const/enum. JSON values only, so key ORDER must not matter.
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeOf(a) !== typeOf(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (isPlainObject(a)) {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return ka.length === kb.length && ka.every((k, i) => k === kb[i]) && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isPlainObject(value)) {
    const out = {};
    for (const k of Object.keys(value)) out[k] = clone(value[k]);
    return out;
  }
  return value;
}

const show = (v) => (typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v) ?? String(v));

function assertSupported(schema, pointer) {
  if (!isPlainObject(schema)) {
    throw new SchemaSupportError(`schema node at "${pointer || '/'}" is not an object (boolean schemas are not supported)`);
  }
  for (const keyword of Object.keys(schema)) {
    if (ANNOTATION_KEYWORDS.has(keyword) || ASSERTION_KEYWORDS.has(keyword)) continue;
    throw new SchemaSupportError(
      `unsupported schema keyword "${keyword}" at "${pointer || '/'}" - this interpreter implements ` +
      `only [${[...ASSERTION_KEYWORDS].join(', ')}]; teach it the keyword or the constraint is not enforced`,
    );
  }
  if ('additionalProperties' in schema && typeof schema.additionalProperties !== 'boolean') {
    throw new SchemaSupportError(
      `"additionalProperties" at "${pointer || '/'}" is not a boolean - the sub-schema form is not supported`,
    );
  }
  if ('items' in schema && !isPlainObject(schema.items)) {
    throw new SchemaSupportError(`"items" at "${pointer || '/'}" must be a single sub-schema (tuple form is not supported)`);
  }
}

// Schemas already proven executable, so a repeated validate() does not re-walk the same object.
// Identity-keyed: a schema loaded from disk is a fresh object per process, so nothing goes stale.
const walked = new WeakSet();

/**
 * Walks the WHOLE schema - every subschema, whether or not an instance ever reaches it - and throws
 * on the first keyword this interpreter does not implement.
 *
 * Why the walk has to be unconditional: checking each node only as the instance walk arrives there
 * leaves an unsupported keyword invisible wherever the instance does not go - under an `items` of an
 * empty list, under a `patternProperties` entry nothing matches, under a property that is absent,
 * or in the branch of an `if/then/else` that was not taken. A constraint that is silently ignored in
 * exactly those places is the failure this design exists to prevent, so the whole schema is proven
 * executable BEFORE the first assertion runs.
 */
export function assertSchemaSupported(schema, pointer = '') {
  if (walked.has(schema)) return;
  assertSupported(schema, pointer);
  for (const [key, sub] of Object.entries(schema.properties || {})) assertSchemaSupported(sub, `${pointer}/properties/${key}`);
  for (const [key, sub] of Object.entries(schema.patternProperties || {})) assertSchemaSupported(sub, `${pointer}/patternProperties/${key}`);
  if (schema.items) assertSchemaSupported(schema.items, `${pointer}/items`);
  (schema.allOf || []).forEach((sub, i) => assertSchemaSupported(sub, `${pointer}/allOf/${i}`));
  for (const key of ['if', 'then', 'else']) {
    if (schema[key]) assertSchemaSupported(schema[key], `${pointer}/${key}`);
  }
  walked.add(schema);
}

/**
 * Validates `instance` against `schema`, returning every violation found.
 * Never mutates either argument.
 */
export function validate(instance, schema) {
  assertSchemaSupported(schema);
  return validateNode(instance, schema, '');
}

function validateNode(instance, schema, pointer = '') {
  const errors = [];
  const fail = (message, at = pointer) => errors.push({ path: at || '/', message });

  if ('type' in schema) {
    const expected = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!expected.some((t) => typeMatches(instance, t))) {
      fail(`expected type ${expected.join(' | ')}, found ${typeOf(instance)}`);
      return errors; // every other keyword would be noise on a wrong-typed value
    }
  }

  if ('const' in schema && !deepEqual(instance, schema.const)) {
    fail(`must be ${show(schema.const)}, found ${show(instance)}`);
  }
  if ('enum' in schema && !schema.enum.some((allowed) => deepEqual(instance, allowed))) {
    fail(`must be one of ${schema.enum.map(show).join(', ')}, found ${show(instance)}`);
  }

  if (typeof instance === 'string') {
    if ('minLength' in schema && instance.length < schema.minLength) {
      fail(schema.minLength === 1 ? 'must not be empty' : `must be at least ${schema.minLength} characters`);
    }
    if ('pattern' in schema && !new RegExp(schema.pattern).test(instance)) {
      fail(`must match ${schema.pattern}, found ${show(instance)}`);
    }
  }

  if (typeof instance === 'number' && 'minimum' in schema && instance < schema.minimum) {
    fail(`must be >= ${schema.minimum}, found ${instance}`);
  }

  if (Array.isArray(instance)) {
    if ('minItems' in schema && instance.length < schema.minItems) {
      fail(`must have at least ${schema.minItems} item(s), found ${instance.length}`);
    }
    if ('items' in schema) {
      instance.forEach((item, i) => {
        errors.push(...validateNode(item, schema.items, `${pointer}/${i}`));
      });
    }
  }

  if (isPlainObject(instance)) {
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(instance, key)) fail(`missing required property "${key}"`);
    }
    const properties = schema.properties || {};
    const patternProperties = schema.patternProperties || {};
    for (const key of Object.keys(instance)) {
      const at = `${pointer}/${key}`;
      let matched = false;
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        matched = true;
        errors.push(...validateNode(instance[key], properties[key], at));
      }
      for (const pattern of Object.keys(patternProperties)) {
        if (!new RegExp(pattern).test(key)) continue;
        matched = true;
        errors.push(...validateNode(instance[key], patternProperties[pattern], at));
      }
      if (!matched && schema.additionalProperties === false) {
        fail(`unknown property "${key}" (the schema forbids additional properties here)`, at);
      }
    }
  }

  for (const sub of schema.allOf || []) {
    errors.push(...validateNode(instance, sub, pointer));
  }

  if ('if' in schema) {
    // The `if` branch is evaluated SILENTLY: its own violations are the condition, never findings.
    const branch = validateNode(instance, schema.if, pointer).length === 0 ? schema.then : schema.else;
    if (branch) errors.push(...validateNode(instance, branch, pointer));
  }

  return errors;
}

export function isValid(instance, schema) {
  return validate(instance, schema).length === 0;
}

/**
 * Builds a fresh object carrying every `default` the schema declares, so the interview and the
 * generator never hardcode a default value of their own. Returns undefined where nothing is
 * defaulted. The schema is never mutated and the result shares no reference with it.
 */
export function collectDefaults(schema) {
  assertSchemaSupported(schema);
  return collectDefaultsNode(schema, '');
}

function collectDefaultsNode(schema, pointer) {
  if ('default' in schema) return clone(schema.default);
  const types = 'type' in schema ? (Array.isArray(schema.type) ? schema.type : [schema.type]) : [];
  if (!types.includes('object') || !schema.properties) return undefined;
  const out = {};
  let any = false;
  for (const key of Object.keys(schema.properties)) {
    const value = collectDefaultsNode(schema.properties[key], `${pointer}/${key}`);
    if (value === undefined) continue;
    out[key] = value;
    any = true;
  }
  return any ? out : undefined;
}

export function loadSchema(file = DEFAULT_SCHEMA_PATH) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

export function formatErrors(errors) {
  return errors.map((e) => `  ${e.path}: ${e.message}`).join('\n');
}

// ---- CLI -------------------------------------------------------------------
// A payload can be reached through a SYMLINK (macOS mounts its own os.tmpdir() behind one). Node
// resolves the entry to its REAL path before loading it, so `import.meta.url` is the real file while
// `process.argv[1]` keeps the link - comparing the two literally makes an entrypoint invoked through
// a link decide it is not main, do nothing and exit 0. Both sides go through realpath.
function isMain() {
  const real = (p) => { try { return fs.realpathSync(p); } catch { return p; } };
  const invoked = process.argv[1] ? real(path.resolve(process.argv[1])) : '';
  return invoked !== '' && invoked === real(path.resolve(fileURLToPath(import.meta.url)));
}

if (isMain()) {
  const args = process.argv.slice(2);
  let schemaPath = DEFAULT_SCHEMA_PATH;
  let configPath = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--schema') { schemaPath = args[i + 1] || null; i += 1; continue; }
    if (!args[i].startsWith('--') && configPath === null) configPath = args[i];
  }
  if (!configPath || !schemaPath) {
    console.error('usage: node validate-config.mjs <config.json> [--schema <schema.json>]');
    process.exit(2);
  }
  let schema;
  let config;
  try {
    schema = loadSchema(schemaPath);
  } catch (e) {
    console.error(`validate-config: cannot read the schema - ${e.message}`);
    process.exit(2);
  }
  try {
    config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf8'));
  } catch (e) {
    console.error(`validate-config: cannot read the config - ${e.message}`);
    process.exit(2);
  }
  let errors;
  try {
    errors = validate(config, schema);
  } catch (e) {
    // A schema this interpreter cannot execute is NOT a valid config: it is an unusable run.
    console.error(`validate-config: ${e.message}`);
    process.exit(2);
  }
  if (errors.length === 0) {
    console.log(`valid: ${path.resolve(configPath)}`);
    process.exit(0);
  }
  console.error(`invalid: ${path.resolve(configPath)}`);
  console.error(formatErrors(errors));
  process.exit(1);
}
