#!/usr/bin/env node
/*
 * Acceptance suite for the update engine (/pnp:update).
 *
 * HOW IT TESTS
 *   Real entrypoints, throwaway directories under the system temp dir, nothing checked in and
 *   nothing left behind. Where a version bump is needed, the suite COPIES the whole payload into a
 *   temp directory, bumps its plugin.json and adds a fixture migration - so "upgrade 0.1.0 -> 0.2.0"
 *   is a real payload the real runner walks, not a mock.
 *
 * WHAT IT ASSERTS
 *   1. an already-current project is a zero-diff no-op, and the interlock says so;
 *   2. a real 0.1.0 -> 0.2.0 upgrade applies all four op types, prints the CHANGELOG blocks before
 *      the first operation and the note's text, and stamps the payload version; a FRESH install
 *      from that payload stamps its last manifest entry;
 *   3. the interlock stops a stale project, and every non-exception skill really runs it;
 *   4. an update OVERWRITES: an edited whole file, an edited `aiwf-core` region (every byte outside
 *      the markers kept) and a deleted file all end as the payload render, with no question;
 *   5. ownership without takeover survives an update, and a settings shape the engine does not
 *      understand is never rewritten;
 *   6. the project additions block: carried verbatim (CRLF content included) - appended when the
 *      render has no block, in place when it has one - and a malformed block stops the run naming
 *      the file, with nothing written to it;
 *   7. a malformed payload blocks BOTH the runner and a fresh setup, with zero bytes written;
 *   8. add-config-key: idempotent, answered, never guessed; a `conflict` record is an unknown kind;
 *   9. legacy bookkeeping (two-hash objects, a journal key) is tolerated by --check and normalised
 *      by --apply;
 *  10. a dry run writes nothing and never stops on a question (it lists `would ask:`), and preflight
 *      refuses an incoherent project;
 *  11. the CHANGELOG blocks between the installed and the payload version are printed, exactly the
 *      open-closed range, in file order - or one line saying there is none;
 *  12. a migration interrupted after its first operations re-runs idempotently to the same end state;
 *  13. the audit table migration, replayed from the shipped ops;
 *  14. a note prints its text, docRefs and supersedes ids;
 *  15. createIfAbsent is accepted and changes nothing (a render always creates), and the validator
 *      rules on the field still hold;
 *  16. the example bump is numbered against the payload it is built into;
 *  17. a stale $schema is refreshed;
 *  18. LAST: the self-check is the update's own last step (PASS, skipped, unrunnable, RED, crashed).
 *
 * WHY MOST CASES PASS --no-selfcheck
 *   Every install and every apply below would otherwise pay for a full self-check run. The cases that
 *   are ABOUT the integration run it (section 18, last); the rest skip it through the same flag an
 *   operator has, never through a test-only bypass.
 *
 * Exit 0 = every assertion passed. Exit 1 = at least one failed. Exit 2 = the suite could not run.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { changelogLines, extractRegion } from './migrate.mjs';
// The same module through its NAMESPACE, for helpers read in section 17: a helper this payload does
// not export yet must fail the checks that need it, not abort the whole suite at load time.
import * as engine from './migrate.mjs';
import {
  PROJECT_ADDITIONS_BEGIN, PROJECT_ADDITIONS_END, ProjectAdditionsError, carryProjectAdditions, normalizeBookkeeping,
} from '../setup/generate.mjs';
import { loadSchema, validate } from '../setup/validate-config.mjs';
import { validatePayload } from './validate-payload.mjs';
import { buildExampleBump } from '../ci/example-bump.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(HERE, '..', '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-update-test-'));

let failures = 0;
let checks = 0;
/**
 * `detail` is either a STRING - printed as a suffix on both PASS and FAIL - or a FUNCTION, which is
 * invoked only when the check FAILS and printed as an indented block below it. Producing the detail
 * is itself wrapped: a formatter that throws must not take the suite with it.
 */
function check(name, ok, detail) {
  checks += 1;
  if (!ok) failures += 1;
  const lazy = typeof detail === 'function';
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${!lazy && detail ? ' - ' + detail : ''}`);
  if (!ok && lazy) {
    let text;
    try { text = String(detail() ?? ''); } catch (e) { text = `(the detail could not be produced: ${e && e.message})`; }
    if (text !== '') for (const line of text.split('\n')) console.log(`      | ${line.replace(/\r$/, '')}`);
  }
  return !!ok;
}
function section(title) { console.log(`\n=== ${title} ===`); }
// The whole output of the failing run, verbatim - exit code first, then every line of it.
const why = (r) => () => `exit ${r.status}\n${(r.out || '').replace(/\s+$/, '') || '(the run printed nothing)'}`;

// ---- filesystem helpers ----------------------------------------------------
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const readJson = (p) => { const t = read(p); try { return t === null ? null : JSON.parse(t); } catch { return null; } };
const exists = (p) => fs.existsSync(p);
const at = (dir, rel) => path.join(dir, ...rel.split('/'));
const writeJson = (p, value) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n', 'utf8'); };

function copyTree(from, to, skip = new Set(['.git', 'node_modules'])) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyTree(s, d, skip); else fs.copyFileSync(s, d);
  }
}

function snapshot(dir, base = dir, acc = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) snapshot(p, base, acc);
    else acc[path.relative(base, p).split(path.sep).join('/')] = fs.readFileSync(p, 'utf8');
  }
  return acc;
}
function diffSnapshots(before, after) {
  const changed = [];
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (before[key] !== after[key]) changed.push(key);
  }
  return changed;
}
const patch = (file, from, to) => {
  const src = read(file);
  if (src === null || !src.includes(from)) throw new Error(`cannot patch ${file}: "${from}" not found`);
  fs.writeFileSync(file, src.split(from).join(to), 'utf8');
};

// ---- entrypoints -----------------------------------------------------------
const CONFIG_REL = '.claude/aiwf-native/aiwf.config.json';
const ROLES_REL = '.claude/aiwf-native/roles.json';
const SETTINGS_REL = '.claude/settings.json';
const WRITER_REL = '.claude/agents/writer.md';
const ORCH_REL = '.claude/aiwf-native/ORCHESTRATOR.md';

let seq = 0;
function project(name) {
  const dir = path.join(tmpRoot, `p${seq += 1}-${name}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const baseAnswers = (overrides = {}) => ({
  project: { name: 'Testbed', description: 'a throwaway project used only by the update suite', stack: 'node', defaultBranch: 'main' },
  os: 'windows',
  operator: { language: 'en', roleNicknames: { writer: 'Writer', reviewer: 'Reviewer', qa: 'QA' } },
  roles: {
    writer: { model: 'claude-opus-5[1m]', effort: 'high' },
    reviewer: { engine: 'claude', model: 'opus', effort: 'high' },
    qa: { engine: 'codex', model: 'codex-atom-2', effort: 'medium' },
    qal: { enabled: false, engine: 'codex', model: 'unset', effort: 'high' },
  },
  loop: { correctionRoundsCap: 2 },
  enforcement: { routeWriteGuard: true, dispatchGate: 'always' },
  verify: { commands: [{ name: 'unit', run: 'npm test', cwd: '.' }] },
  paths: { scratchDir: '.aiwf', plansDir: 'docs/backlogs', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' },
  review: { productBoundaryChecks: [] },
  ...overrides,
});
const codexAnswers = () => baseAnswers({
  roles: {
    writer: { model: 'claude-opus-5[1m]', effort: 'high' },
    reviewer: { engine: 'codex', model: 'codex-atom-2', effort: 'high' },
    qa: { engine: 'codex', model: 'codex-atom-2', effort: 'medium' },
    qal: { enabled: false, engine: 'codex', model: 'unset', effort: 'high' },
  },
});

// `selfcheck: true` lets the run perform its integrated self-check; everything else passes
// --no-selfcheck, which is the operator's own flag and not a test-only bypass.
function install(projectDir, { payload = BASE, answers = baseAnswers(), extra = [], selfcheck = false } = {}) {
  const answersFile = path.join(tmpRoot, `answers-${path.basename(projectDir)}-${Math.random().toString(36).slice(2, 8)}.json`);
  writeJson(answersFile, answers);
  const r = spawnSync(process.execPath, [
    path.join(payload, 'scripts', 'setup', 'interview.mjs'),
    '--answers-file', answersFile, '--plugin-root', payload, '--project-root', projectDir, '--no-seeds',
    ...(selfcheck ? [] : ['--no-selfcheck']), ...extra,
  ], { encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

function update(projectDir, args, { payload = BASE, env = null, selfcheck = false } = {}) {
  const r = spawnSync(process.execPath, [
    path.join(payload, 'scripts', 'update', 'aiwf-update.mjs'),
    ...args, '--plugin-root', payload, '--project-root', projectDir,
    ...(selfcheck ? [] : ['--no-selfcheck']),
  ], { encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

const bookkeeping = (projectDir) => (readJson(at(projectDir, CONFIG_REL)) || {})._aiwf || {};
const askRules = (projectDir) => ((readJson(at(projectDir, SETTINGS_REL)) || {}).permissions || {}).ask || [];
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

// ---- payload builder -------------------------------------------------------
const FIXTURE_NOTE = { op: 'note', id: 'fixture-note', text: 'The fixture migration exercises every operation type.', docRefs: ['docs/LOOP.md#commit-gate'] };
const ALL_OPS = [
  { op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: true, question: 'Keep the example toggle this fixture release introduces?' },
  { op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/CLAUDE.md.tmpl#aiwf-core' },
  { op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' },
  { op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' },
  FIXTURE_NOTE,
];
const WRITER_OP = { op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' };
const ORCH_OP = { op: 'rerender-managed-region', file: ORCH_REL, region: null, template: 'templates/ORCHESTRATOR.md.tmpl' };
const NEW_ASK_RULE = 'Bash(pnp-fixture-new:*)';
// Any rule setup OWNS works here - this fixture is about the reconcile op, not about which rule
// leaves - and it is deliberately NOT a git rule (the self-check holds the shipped git rules against
// Gate 4's accept-space form by form).
const DROPPED_ASK_RULE = 'Bash(npm run seed:*)';
// AND THE SAME RULE ON THE OTHER SHELL TOOL: the ask list is a 1:1 `Bash(<X>)` / `PowerShell(<X>)`
// mirror, so the pair moves together; the ASSERTIONS stay on the Bash spelling.
const NEW_ASK_RULE_MIRROR = 'PowerShell(pnp-fixture-new:*)';
const DROPPED_ASK_RULE_MIRROR = 'PowerShell(npm run seed:*)';
const PAYLOAD_LINE = 'A line the next payload version added.';

/** Adds the config key the fixture migration introduces, so the bumped payload's schema admits it. */
function addExampleToggleToSchema(dir) {
  patch(at(dir, 'schema/aiwf.config.schema.json'),
    '"routeWriteGuard": {',
    '"exampleToggle": { "type": "boolean", "description": "fixture key added by a migration" },\n        "routeWriteGuard": {');
}
/** Makes the payload RENDER differently - the CLAUDE.md region and the Writer agent both move. */
function changeTemplates(dir) {
  patch(at(dir, 'templates/CLAUDE.md.tmpl'), '## Your role', '## Your role (v2)');
  fs.appendFileSync(at(dir, 'templates/agents/writer.md.tmpl'), `\n${PAYLOAD_LINE}\n`, 'utf8');
}
/** Changes the desired ask set: one rule added, one rule (which setup owns) dropped - on BOTH shell tools. */
function changeRuleset(dir) {
  const file = at(dir, 'templates/settings.ask-ruleset.json');
  const json = readJson(file);
  const dropped = new Set([DROPPED_ASK_RULE, DROPPED_ASK_RULE_MIRROR]);
  json.permissions.ask = json.permissions.ask.filter((r) => !dropped.has(r))
    .concat([NEW_ASK_RULE, NEW_ASK_RULE_MIRROR]);
  writeJson(file, json);
}

// THE BASELINE THIS SUITE LIVES ON: the shipped plugin with its manifest TRUNCATED to the first
// entry (and the real migration directories above it removed). The fixture migrations are then
// appended as `0002_*`, `0003_*` - so the suite asserts the engine's behaviour, not the shipped
// migration COUNT.
const REAL_MANIFEST = readJson(path.join(PLUGIN_ROOT, 'migrations', 'index.json')) || [];
const BASELINE = REAL_MANIFEST[0];
if (!BASELINE) { console.error('the payload manifest is empty - the update suite has no baseline to build on'); process.exit(2); }

function makePayload(name, { version, migrations, tweak = null }) {
  const dir = path.join(tmpRoot, `payload-${name}`);
  copyTree(PLUGIN_ROOT, dir);
  const pluginJson = readJson(at(dir, '.claude-plugin/plugin.json'));
  pluginJson.version = version;
  writeJson(at(dir, '.claude-plugin/plugin.json'), pluginJson);
  for (const entry of REAL_MANIFEST.slice(1)) {
    fs.rmSync(at(dir, `migrations/${entry.id}`), { recursive: true, force: true });
  }
  const manifest = [{ id: BASELINE.id, targetPluginVersion: BASELINE.targetPluginVersion }];
  for (const m of migrations) {
    manifest.push({ id: m.id, targetPluginVersion: m.version });
    const mdir = at(dir, `migrations/${m.id}`);
    fs.mkdirSync(mdir, { recursive: true });
    writeJson(path.join(mdir, 'ops.json'), { migration: m.id, targetPluginVersion: m.version, operations: m.ops });
    fs.writeFileSync(path.join(mdir, 'NOTES.md'), `# ${m.id}\n\nFixture migration written by the update acceptance suite.\n`, 'utf8');
  }
  writeJson(at(dir, 'migrations/index.json'), manifest);
  if (tweak) tweak(dir);
  return dir;
}

// The payload every project here is INSTALLED from: the shipped plugin at its baseline migration.
const BASE = makePayload('base', { version: BASELINE.targetPluginVersion, migrations: [] });

// The payload every "real upgrade" case runs against: 0.2.0, one migration, all four op types, and
// templates + ruleset that really changed.
const P020 = makePayload('020', {
  version: '0.2.0',
  migrations: [{ id: '0002_fixture', version: '0.2.0', ops: ALL_OPS }],
  tweak: (dir) => { addExampleToggleToSchema(dir); changeTemplates(dir); changeRuleset(dir); },
});

// ONE record for five operations: the only question an update can ask is a config key's value.
const FULL_RESOLUTIONS = {
  '0002_fixture/0/enforcement.exampleToggle': { kind: 'answer', value: false },
};
function resolutionFile(name, table) {
  const p = path.join(tmpRoot, `resolutions-${name}.json`);
  writeJson(p, table);
  return p;
}
function patchOps(dir, id, mutate) {
  const file = at(dir, `migrations/${id}/ops.json`);
  const json = readJson(file);
  mutate(json);
  writeJson(file, json);
}

// ---------------------------------------------------------------------------
section('1 - an already-current project: the interlock says so and --apply is a zero diff');
{
  const p = project('current');
  check('install exits 0', install(p).status === 0);
  const before = snapshot(p);
  const c = update(p, ['--check']);
  check('--check exits 0 on a current project', c.status === 0, why(c));
  check('--check says it is up to date', c.out.includes('up to date'));
  check('--check on a current project prints no behind line', !c.out.includes('behind:'), why(c));
  const a = update(p, ['--apply']);
  check('--apply exits 0', a.status === 0, why(a));
  check('--apply says "already current"', a.out.includes('already current'));
  check('--apply wrote nothing at all (byte for byte)', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
}

// ---------------------------------------------------------------------------
section('2 - a real 0.1.0 -> 0.2.0 upgrade: all four op types, the CHANGELOG, the note, the stamps');
const upgraded = project('upgrade');
{
  check('install at 0.1.0 exits 0', install(upgraded).status === 0);
  const ownedBefore = bookkeeping(upgraded).ownedAskRules || [];
  check('the fixture precondition holds: setup owns the rule the new ruleset drops', ownedBefore.includes(DROPPED_ASK_RULE));
  check('a fresh install records every artifact as the payload version, with no journal key',
    Object.values(bookkeeping(upgraded).managedRegions || {}).every((v) => v === BASELINE.targetPluginVersion)
    && Object.keys(bookkeeping(upgraded).managedRegions || {}).length > 0 && !has(bookkeeping(upgraded), 'migrationJournal'),
    () => JSON.stringify(bookkeeping(upgraded)));

  const c = update(upgraded, ['--check'], { payload: P020 });
  check('--check against the newer payload exits 1', c.status === 1, why(c));
  check('--check names the pending migration', c.out.includes('0002_fixture'), why(c));
  check('--check prints the behind line',
    c.out.includes(`behind: ${BASELINE.targetPluginVersion} -> 0.2.0; /pnp:update prints the CHANGELOG blocks in between`), why(c));

  const r = update(upgraded, ['--apply', '--resolution-file', resolutionFile('full', FULL_RESOLUTIONS)], { payload: P020 });
  check('--apply exits 0', r.status === 0, why(r));

  const cfg = readJson(at(upgraded, CONFIG_REL)) || {};
  const bk = cfg._aiwf || {};
  check('the version stamps moved together', bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_fixture',
    `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
  check('there is no journal key in the bookkeeping', !has(bk, 'migrationJournal'), () => JSON.stringify(bk));
  check('add-config-key wrote the OPERATOR answer, not the default', cfg.enforcement.exampleToggle === false, JSON.stringify(cfg.enforcement));
  check('the re-rendered region really changed in the project', (read(at(upgraded, 'CLAUDE.md')) || '').includes('## Your role (v2)'));
  check('the whole-file artifact was re-rendered', (read(at(upgraded, WRITER_REL)) || '').includes(PAYLOAD_LINE));
  check('the new ask rule was added', askRules(upgraded).includes(NEW_ASK_RULE));
  check('the owned rule dropped from the desired set was removed', !askRules(upgraded).includes(DROPPED_ASK_RULE));
  check('and it left ownedAskRules too', !(bk.ownedAskRules || []).includes(DROPPED_ASK_RULE));
  check('the newly added rule became owned', (bk.ownedAskRules || []).includes(NEW_ASK_RULE));
  check('the re-rendered artifacts are stamped with the payload version',
    bk.managedRegions['CLAUDE.md#aiwf-core'] === '0.2.0' && bk.managedRegions[WRITER_REL] === '0.2.0', () => JSON.stringify(bk.managedRegions));
  check('the stamped config validates against the payload schema',
    validate(cfg, loadSchema(at(P020, 'schema/aiwf.config.schema.json'))).length === 0,
    () => JSON.stringify(validate(cfg, loadSchema(at(P020, 'schema/aiwf.config.schema.json')))));

  const header = r.out.indexOf(`CHANGELOG ${BASELINE.targetPluginVersion} -> 0.2.0:`);
  const noBlock = r.out.indexOf(`CHANGELOG: no block between ${BASELINE.targetPluginVersion} and 0.2.0`);
  const firstOp = r.out.indexOf('0002_fixture[0]');
  check('the CHANGELOG line is printed BEFORE the first operation',
    Math.max(header, noBlock) !== -1 && Math.max(header, noBlock) < firstOp, why(r));
  check('the note prints its text and its docRefs',
    r.out.includes(`note: ${FIXTURE_NOTE.text}`) && r.out.includes('- docs/LOOP.md#commit-gate'), why(r));
  check('no CHANGES report is written and no report line is printed',
    !exists(at(upgraded, 'CHANGES_0.1.0-to-0.2.0.md')) && !r.out.includes('report:'), why(r));
}
{
  // A FRESH install from the 0.2.0 payload must stamp the LAST manifest entry, not a constant.
  const fresh = project('fresh-020');
  const r = install(fresh, { payload: P020 });
  check('a fresh install from the 0.2.0 payload exits 0', r.status === 0, why(r));
  const bk = bookkeeping(fresh);
  check('it stamps the LAST manifest entry (0002_fixture), not a constant', bk.lastMigrationApplied === '0002_fixture', String(bk.lastMigrationApplied));
  check('and the payload version with it', bk.installedPluginVersion === '0.2.0', String(bk.installedPluginVersion));
  const c = update(fresh, ['--check'], { payload: P020 });
  check('so its interlock is immediately green', c.status === 0, why(c));
}

// ---------------------------------------------------------------------------
section('3 - the version interlock is really wired into the skills');
{
  const skills = fs.readdirSync(path.join(PLUGIN_ROOT, 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory()).map((e) => e.name);
  const EXCEPTIONS = ['update', 'selfcheck'];
  const stale = [];
  const missing = [];
  for (const name of skills) {
    const src = read(path.join(PLUGIN_ROOT, 'skills', name, 'SKILL.md')) || '';
    if (/enforced from v0\.2|do not simulate/i.test(src)) stale.push(name);
    if (EXCEPTIONS.includes(name)) continue;
    if (!src.includes('scripts/update/aiwf-update.mjs') || !src.includes('--check')) missing.push(name);
  }
  check('no skill still says the interlock is "enforced from v0.2" / "do not simulate"', stale.length === 0, stale.join(', '));
  check('every non-exception skill runs the real --check entrypoint in Step 0', missing.length === 0, missing.join(', '));
  check('the two documented exceptions still exist', EXCEPTIONS.every((n) => skills.includes(n)));
  check('skills/README.md no longer lists update as "still to come"',
    !/Still to come:\s*`update`/.test(read(path.join(PLUGIN_ROOT, 'skills', 'README.md')) || ''));
}

// ---------------------------------------------------------------------------
section('4 - an update OVERWRITES: an edited file, an edited region and a deleted file end as the render, with no question');
{
  // The donor: the same payload taken to completion on an untouched project. The CLAUDE.md region
  // carries no project-root value, so its render is the expected value for every project here.
  const donor = project('overwrite-donor');
  install(donor);
  const d = update(donor, ['--apply', '--resolution-file', resolutionFile('overwrite-donor', FULL_RESOLUTIONS)], { payload: P020 });
  check('the donor run exits 0', d.status === 0, why(d));
  const donorRegion = extractRegion(read(at(donor, 'CLAUDE.md')), 'aiwf-core');

  const p = project('overwrite-edited');
  install(p);
  // A hand edit in the Writer agent, and one INSIDE the managed region - with operator text OUTSIDE
  // the markers on both sides, in CRLF, so a whole-file normalisation would show.
  fs.writeFileSync(at(p, WRITER_REL), `${read(at(p, WRITER_REL))}\nMy own note in the agent file.\n`, 'utf8');
  const claude = read(at(p, 'CLAUDE.md'));
  const begin = claude.indexOf('<!-- BEGIN aiwf-core -->');
  const end = claude.indexOf('<!-- END aiwf-core -->') + '<!-- END aiwf-core -->'.length;
  const BEFORE = '# My project\r\n\r\nMy own words, before the region.\r\n\r\n';
  const AFTER = '\r\n\r\n## My section after the region\r\n\r\nStill mine.\r\n';
  const edited = `${BEFORE}${claude.slice(begin, end).replace('## Your role', '## Your role (I edited this)')}${AFTER}`;
  fs.writeFileSync(at(p, 'CLAUDE.md'), edited, 'utf8');

  const r = update(p, ['--apply', '--resolution-file', resolutionFile('overwrite-edited', FULL_RESOLUTIONS)], { payload: P020 });
  check('--apply over two hand edits exits 0, with no question beyond the config key', r.status === 0, why(r));
  const writer = read(at(p, WRITER_REL)) || '';
  check('the edited whole file is the payload render now (the hand edit is gone)',
    !writer.includes('My own note in the agent file.') && writer.includes(PAYLOAD_LINE), `${writer.length} bytes`);
  const after = read(at(p, 'CLAUDE.md')) || '';
  const region = extractRegion(after, 'aiwf-core');
  check('the edited region is the payload render now', region === donorRegion && !after.includes('(I edited this)'),
    () => `${region}\n---\n${donorRegion}`);
  check('every byte BEFORE the markers is unchanged (CRLF included)', after.startsWith(BEFORE), () => JSON.stringify(after.slice(0, 80)));
  check('every byte AFTER the markers is unchanged (CRLF included)', after.endsWith(AFTER), () => JSON.stringify(after.slice(-80)));
  check('the summaries say what was written', r.out.includes(`${WRITER_REL}: the payload render written`)
    && r.out.includes('CLAUDE.md#aiwf-core: the payload render written'), why(r));
  check('both are stamped with the payload version',
    bookkeeping(p).managedRegions[WRITER_REL] === '0.2.0' && bookkeeping(p).managedRegions['CLAUDE.md#aiwf-core'] === '0.2.0');
}
{
  const p = project('overwrite-deleted');
  install(p);
  fs.rmSync(at(p, WRITER_REL));
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('overwrite-deleted', FULL_RESOLUTIONS)], { payload: P020 });
  check('a DELETED managed file does not stop the update (exit 0)', r.status === 0, why(r));
  check('it is recreated from the render', (read(at(p, WRITER_REL)) || '').includes(PAYLOAD_LINE)
    && r.out.includes(`${WRITER_REL}: created from the payload render`), why(r));
}

// ---------------------------------------------------------------------------
section('5 - settings: ownership without takeover, and a shape the engine will not rewrite');
{
  const p = project('settings-tombstone');
  install(p);
  // A foreign rule the plugin never inserted, and an owned rule the operator removes by hand.
  const settings = readJson(at(p, SETTINGS_REL));
  const victim = bookkeeping(p).ownedAskRules.find((r) => r !== DROPPED_ASK_RULE);
  settings.permissions.ask = settings.permissions.ask.filter((r) => r !== victim).concat(['Bash(my-own-tool:*)']);
  writeJson(at(p, SETTINGS_REL), settings);

  const r = update(p, ['--apply', '--resolution-file', resolutionFile('settings', FULL_RESOLUTIONS)], { payload: P020 });
  check('the update completes', r.status === 0, why(r));
  const ask = askRules(p);
  const bk = bookkeeping(p);
  check('the foreign rule is untouched', ask.includes('Bash(my-own-tool:*)'));
  check('the foreign rule did not become owned', !bk.ownedAskRules.includes('Bash(my-own-tool:*)'));
  check('the hand-removed owned rule was NOT forced back', !ask.includes(victim), victim);
  check('it is recorded as a tombstone instead', (bk.suppressedAskRules || []).includes(victim));
  check('owned and suppressed stay disjoint', !bk.ownedAskRules.some((r) => bk.suppressedAskRules.includes(r)));
  check('the tombstone survives a SECOND update', (() => {
    const p3 = makePayload(`030-tomb-${seq}`, {
      version: '0.3.0',
      migrations: [
        { id: '0002_fixture', version: '0.2.0', ops: ALL_OPS },
        { id: '0003_again', version: '0.3.0', ops: [{ op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' }] },
      ],
      tweak: (dir) => { addExampleToggleToSchema(dir); changeTemplates(dir); changeRuleset(dir); },
    });
    const rr = update(p, ['--apply'], { payload: p3 });
    return rr.status === 0 && !askRules(p).includes(victim);
  })());
}
// "with `ownedAskRules: []` the reconcile adds nothing" is false: `to-add = (desired - actual) -
// suppressed` has no ownership term. Ownership decides what the engine may remove, and what it
// reports as none of its business. Both faces, on the real entrypoint.
{
  const p = project('settings-unowned-add');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.ownedAskRules = [];
  writeJson(at(p, CONFIG_REL), cfg);
  const HAND_REMOVED = 'Bash(git stash:*)';
  const settings = readJson(at(p, SETTINGS_REL));
  check('unowned: the fixture starts from a rule the payload wants and this project has',
    settings.permissions.ask.includes(HAND_REMOVED));
  settings.permissions.ask = settings.permissions.ask.filter((r) => r !== HAND_REMOVED);
  writeJson(at(p, SETTINGS_REL), settings);

  const askBefore = askRules(p);
  const notDesired = new Set([DROPPED_ASK_RULE, DROPPED_ASK_RULE_MIRROR]);
  const expectedForeign = askBefore.filter((r) => !notDesired.has(r));

  const r = update(p, ['--apply', '--resolution-file', resolutionFile('unowned', FULL_RESOLUTIONS)], { payload: P020 });
  check('unowned: the update completes', r.status === 0, why(r));
  const ask = askRules(p);
  const bk = bookkeeping(p);
  check('unowned: a payload rule MISSING from settings is added even though this project owns nothing',
    ask.includes(HAND_REMOVED), HAND_REMOVED);
  check('unowned: and so is the rule the newer payload introduces',
    ask.includes(NEW_ASK_RULE) && ask.includes(NEW_ASK_RULE_MIRROR));
  check('unowned: what it inserted, it owns - and NOTHING else was adopted',
    bk.ownedAskRules.length === 3 && [HAND_REMOVED, NEW_ASK_RULE, NEW_ASK_RULE_MIRROR].every((rule) => bk.ownedAskRules.includes(rule)),
    () => `owned: ${JSON.stringify(bk.ownedAskRules)}`);
  check('unowned: with nothing owned there is nothing to tombstone',
    (bk.suppressedAskRules || []).length === 0, () => JSON.stringify(bk.suppressedAskRules));
  check('unowned: the dropped payload rule is NOT removed - it was never owned here',
    ask.includes(DROPPED_ASK_RULE) && ask.includes(DROPPED_ASK_RULE_MIRROR));
  const foreignLine = `${expectedForeign.length} payload rule(s) present but not owned here - hand-edited, the engine will never touch them`;
  check('unowned: the reconcile summary says how many payload rules it found present but not owned',
    r.out.includes(foreignLine), `measured ${expectedForeign.length} present but not owned`);
  check('unowned: and the run NAMES every one of them, in payload order, on one line',
    r.out.includes(`${expectedForeign.length} payload rule(s) present but not owned here: ${expectedForeign.join(', ')}`), why(r));
  check('unowned: the rule it added is not among them - it is owned now',
    !(r.out.split('\n').find((l) => l.includes('present but not owned here:')) || '').includes(HAND_REMOVED));
}
{
  const p = project('settings-present-foreign');
  install(p);
  const HAND_WRITTEN = ['Bash(git commit:*)', 'PowerShell(git commit:*)'];
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.ownedAskRules = cfg._aiwf.ownedAskRules.filter((r) => !HAND_WRITTEN.includes(r));
  writeJson(at(p, CONFIG_REL), cfg);
  check('present-foreign: the fixture keeps the rules in settings and drops only the ownership claim',
    HAND_WRITTEN.every((rule) => askRules(p).includes(rule))
    && !HAND_WRITTEN.some((rule) => bookkeeping(p).ownedAskRules.includes(rule)));

  const r = update(p, ['--apply', '--resolution-file', resolutionFile('present-foreign', FULL_RESOLUTIONS)], { payload: P020 });
  check('present-foreign: the update completes', r.status === 0, why(r));
  const ask = askRules(p);
  const bk = bookkeeping(p);
  check('present-foreign: the rules are still there, byte for byte', HAND_WRITTEN.every((rule) => ask.includes(rule)));
  check('present-foreign: the update did NOT adopt them into ownership',
    !HAND_WRITTEN.some((rule) => bk.ownedAskRules.includes(rule)), () => JSON.stringify(bk.ownedAskRules));
  check('present-foreign: and did not tombstone them either',
    !HAND_WRITTEN.some((rule) => (bk.suppressedAskRules || []).includes(rule)));
  check('present-foreign: the run says so out loud, with the count and the names',
    r.out.includes('2 payload rule(s) present but not owned here - hand-edited, the engine will never touch them')
    && r.out.includes('2 payload rule(s) present but not owned here: Bash(git commit:*), PowerShell(git commit:*)'), why(r));
}
{
  // FLIPPING: the same payload, the same op, a project whose ownership bookkeeping is intact.
  const p = project('settings-no-foreign');
  install(p);
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('no-foreign', FULL_RESOLUTIONS)], { payload: P020 });
  check('no-foreign: the update completes', r.status === 0, why(r));
  check('no-foreign: nothing is reported as present but not owned', !r.out.includes('present but not owned'), why(r));
}
for (const [name, permissions, needle] of [
  ['permissions is a string', 'weird', 'not an object'],
  ['permissions.ask is a string', { ask: 'nope' }, 'not a list'],
]) {
  const p = project(`settings-${name.replace(/[^a-z]+/gi, '-')}`);
  install(p);
  const original = JSON.stringify({ permissions, hooks: {} }, null, 2);
  fs.writeFileSync(at(p, SETTINGS_REL), original, 'utf8');
  const payload = makePayload(`badsettings-${seq}`, {
    version: '0.2.0',
    migrations: [{ id: '0002_settings', version: '0.2.0', ops: [FIXTURE_NOTE, { op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' }] }],
  });
  const r = update(p, ['--apply'], { payload });
  check(`update entrypoint: ${name} -> exit 1`, r.status === 1, why(r));
  check(`update entrypoint: ${name} -> the message says what it does not understand`, r.out.includes(needle), why(r));
  check(`update entrypoint: ${name} -> settings.json is byte-identical`, read(at(p, SETTINGS_REL)) === original);
  check(`update entrypoint: ${name} -> the stamps did not move, so the migration simply runs again`,
    bookkeeping(p).lastMigrationApplied === BASELINE.id && bookkeeping(p).installedPluginVersion === BASELINE.targetPluginVersion,
    `${bookkeeping(p).lastMigrationApplied} / ${bookkeeping(p).installedPluginVersion}`);
  writeJson(at(p, SETTINGS_REL), { permissions: { ask: [] }, hooks: {} });
  const again = update(p, ['--apply'], { payload });
  check(`update entrypoint: ${name} -> after repair the same migration runs and completes`, again.status === 0, why(again));
}

// ---------------------------------------------------------------------------
section('6 - the project additions block: carried verbatim, appended or in place, and a malformed one is never guessed');
const BLOCK_CRLF = `${PROJECT_ADDITIONS_BEGIN}\r\nMy own rule, line one.\r\nMy own rule, line two - CRLF on purpose.\r\n${PROJECT_ADDITIONS_END}`;
const countOf = (text, needle) => String(text).split(needle).length - 1;
{
  // The production helper itself, on every shape it decides.
  const RENDER = '# Rendered\n\nBody.\n';
  const SLOT = `# Rendered\n\n${PROJECT_ADDITIONS_BEGIN}\n(the payload's empty slot)\n${PROJECT_ADDITIONS_END}\n\nTail.\n`;
  const mine = `old text\n${BLOCK_CRLF}\nmore old text\n`;
  const r0 = carryProjectAdditions(null, RENDER, 'x.md');
  check('carry: no file -> the render unchanged, nothing carried', r0.text === RENDER && r0.carried === false);
  const r1 = carryProjectAdditions('# old\nno block here\n', RENDER, 'x.md');
  check('carry: a file without a block -> the render unchanged', r1.text === RENDER && r1.carried === false);
  const r2 = carryProjectAdditions(mine, RENDER, 'x.md');
  check('carry: a render without a block -> the block appended after one blank line, bytes verbatim',
    r2.carried === true && r2.text === `${RENDER}\n${BLOCK_CRLF}\n`, () => JSON.stringify(r2.text));
  const r3 = carryProjectAdditions(mine, SLOT, 'x.md');
  check('carry: a render WITH a block -> the existing block replaces it in place',
    r3.carried === true && r3.text === `# Rendered\n\n${BLOCK_CRLF}\n\nTail.\n`, () => JSON.stringify(r3.text));
  const r4 = carryProjectAdditions(`a\r\n${PROJECT_ADDITIONS_BEGIN}\r\nx\r\n${PROJECT_ADDITIONS_END}\r\n`, RENDER, 'x.md');
  check('carry: CRLF marker lines are marker lines', r4.carried === true && r4.text.includes(`${PROJECT_ADDITIONS_BEGIN}\r\nx\r\n${PROJECT_ADDITIONS_END}`));
  const r5 = carryProjectAdditions(`a\n  ${PROJECT_ADDITIONS_BEGIN}\nx\n${PROJECT_ADDITIONS_END} \n`, RENDER, 'x.md');
  check('carry: a marker that is not alone on its line is not a marker (exact bytes) -> nothing carried',
    r5.carried === false && r5.text === RENDER);
  for (const [label, text] of [
    ['begin only', `a\n${PROJECT_ADDITIONS_BEGIN}\nx\n`],
    ['end only', `a\nx\n${PROJECT_ADDITIONS_END}\n`],
    ['two blocks', `${BLOCK_CRLF}\n${BLOCK_CRLF}\n`],
    ['end before begin', `${PROJECT_ADDITIONS_END}\nx\n${PROJECT_ADDITIONS_BEGIN}\n`],
  ]) {
    let thrown = null;
    try { carryProjectAdditions(text, RENDER, 'agents/x.md'); } catch (e) { thrown = e; }
    check(`carry: malformed (${label}) -> ProjectAdditionsError naming the file`,
      thrown instanceof ProjectAdditionsError && thrown.message.includes('agents/x.md') && thrown.message.includes('malformed'),
      thrown ? thrown.message : 'nothing thrown');
  }
}
{
  // (b1) the CLI: the render carries no block (the shipped templates do not), so the block is
  // appended - and two migrations re-rendering the same file in one run still leave ONE block.
  const twice = makePayload('additions-append', {
    version: '0.3.0',
    migrations: [
      { id: '0002_a', version: '0.2.0', ops: [WRITER_OP] },
      { id: '0003_b', version: '0.3.0', ops: [WRITER_OP] },
    ],
    tweak: changeTemplates,
  });
  const p = project('additions-append');
  install(p);
  fs.writeFileSync(at(p, WRITER_REL), `${read(at(p, WRITER_REL))}\nAn edit outside the block.\n\n${BLOCK_CRLF}\n`, 'utf8');
  const r = update(p, ['--apply'], { payload: twice });
  check('an update over a file carrying a block exits 0', r.status === 0, why(r));
  const text = read(at(p, WRITER_REL)) || '';
  check('the block survived byte for byte, CRLF inside included, exactly once', countOf(text, BLOCK_CRLF) === 1, `${countOf(text, BLOCK_CRLF)} copies`);
  check('it sits after the render\'s last line, behind one blank line', text.endsWith(`${PAYLOAD_LINE}\n\n${BLOCK_CRLF}\n`), () => JSON.stringify(text.slice(-200)));
  check('the edit OUTSIDE the block was overwritten', !text.includes('An edit outside the block.'));
  check('the summary says the block was carried', r.out.includes('(project additions carried)'), why(r));
}
{
  // (b2) a render that carries its own block: the project's block takes its place.
  const SLOT_TEXT = 'The payload slot text that the project block replaces.';
  const withSlot = makePayload('additions-slot', {
    version: '0.2.0',
    migrations: [{ id: '0002_slot', version: '0.2.0', ops: [WRITER_OP] }],
    tweak: (dir) => fs.appendFileSync(at(dir, 'templates/agents/writer.md.tmpl'),
      `\n${PROJECT_ADDITIONS_BEGIN}\n${SLOT_TEXT}\n${PROJECT_ADDITIONS_END}\n\n${PAYLOAD_LINE}\n`, 'utf8'),
  });
  const p = project('additions-slot');
  install(p);
  fs.writeFileSync(at(p, WRITER_REL), `${read(at(p, WRITER_REL))}\n${BLOCK_CRLF}\n`, 'utf8');
  const r = update(p, ['--apply'], { payload: withSlot });
  check('an update whose render carries a block exits 0', r.status === 0, why(r));
  const text = read(at(p, WRITER_REL)) || '';
  check('the project block replaced the render\'s block in place (the payload line still follows it)',
    countOf(text, BLOCK_CRLF) === 1 && !text.includes(SLOT_TEXT) && text.indexOf(BLOCK_CRLF) < text.lastIndexOf(PAYLOAD_LINE)
    && countOf(text, PROJECT_ADDITIONS_BEGIN) === 1, () => JSON.stringify(text.slice(-300)));
}
{
  // (c) malformed: the run stops naming the file, and that file is not written.
  const payload = makePayload('additions-malformed', {
    version: '0.2.0', migrations: [{ id: '0002_bad', version: '0.2.0', ops: [WRITER_OP] }], tweak: changeTemplates,
  });
  for (const [label, tail] of [
    ['a begin marker without its end', `\n${PROJECT_ADDITIONS_BEGIN}\nhalf a block\n`],
    ['two blocks', `\n${BLOCK_CRLF}\n\n${BLOCK_CRLF}\n`],
  ]) {
    const p = project('additions-malformed');
    install(p);
    const original = `${read(at(p, WRITER_REL))}${tail}`;
    fs.writeFileSync(at(p, WRITER_REL), original, 'utf8');
    const r = update(p, ['--apply'], { payload });
    check(`malformed block (${label}) -> exit 1, naming the file`,
      r.status === 1 && r.out.includes(WRITER_REL) && r.out.includes('malformed'), why(r));
    check(`malformed block (${label}) -> the file is byte-identical and the stamps did not move`,
      read(at(p, WRITER_REL)) === original && bookkeeping(p).installedPluginVersion === BASELINE.targetPluginVersion);
  }
}

// ---------------------------------------------------------------------------
section('7 - a malformed payload blocks the runner AND a fresh setup, with zero writes');
{
  const variants = [
    ['a gap in the manifest', (dir) => { const m = readJson(at(dir, 'migrations/index.json')); m[1].id = '0003_fixture'; fs.renameSync(at(dir, 'migrations/0002_fixture'), at(dir, 'migrations/0003_fixture')); patchOps(dir, '0003_fixture', (o) => { o.migration = '0003_fixture'; }); writeJson(at(dir, 'migrations/index.json'), m); }],
    ['a duplicate id', (dir) => { const m = readJson(at(dir, 'migrations/index.json')); m[1].id = '0001_initial'; writeJson(at(dir, 'migrations/index.json'), m); }],
    ['a non-monotonic version', (dir) => { const m = readJson(at(dir, 'migrations/index.json')); m[1].targetPluginVersion = '0.0.9'; writeJson(at(dir, 'migrations/index.json'), m); patchOps(dir, '0002_fixture', (o) => { o.targetPluginVersion = '0.0.9'; }); }],
    ['the last entry not matching the payload version', (dir) => { const m = readJson(at(dir, 'migrations/index.json')); m[1].targetPluginVersion = '0.1.5'; writeJson(at(dir, 'migrations/index.json'), m); patchOps(dir, '0002_fixture', (o) => { o.targetPluginVersion = '0.1.5'; }); }],
    ['an unknown op type', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'delete-everything', file: 'x' }]; })],
    ['an unknown op FIELD', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ ...FIXTURE_NOTE, extra: true }]; })],
    // `supersedes` is a LIST of ids; a bare string would be printed one character per line.
    ['a supersedes that is not an array', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ ...FIXTURE_NOTE, supersedes: 'one-id' }]; })],
    ['a supersedes entry that is an empty string', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ ...FIXTURE_NOTE, supersedes: ['fine', '  '] }]; })],
    ['an orphan migration directory', (dir) => { fs.mkdirSync(at(dir, 'migrations/0009_orphan'), { recursive: true }); writeJson(at(dir, 'migrations/0009_orphan/ops.json'), { migration: '0009_orphan', targetPluginVersion: '0.9.0', operations: [] }); fs.writeFileSync(at(dir, 'migrations/0009_orphan/NOTES.md'), '# orphan\n'); }],
    ['a file path that escapes the project', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: '../outside.md', region: null, template: 'templates/roles.json.tmpl' }]; })],
    ['an absolute file path', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: 'C:/Windows/system.ini', region: null, template: 'templates/roles.json.tmpl' }]; })],
    ['a template reference outside templates/', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'docs/WORKFLOW.md' }]; })],
    ['a template reference that does not exist', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/nowhere.tmpl' }]; })],
    ['an add-config-key aimed at the bookkeeping', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'add-config-key', path: '_aiwf.installedPluginVersion', default: '9.9.9', askOperator: false }]; })],
    ['a missing NOTES.md', (dir) => fs.rmSync(at(dir, 'migrations/0002_fixture/NOTES.md'))],
    ['a template region reference the template does not carry', (dir) => patchOps(dir, '0002_fixture', (o) => {
      o.operations = [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/CLAUDE.md.tmpl#definitely-not-a-region' }];
    })],
    ['a manifest version with a leading zero', (dir) => {
      const m = readJson(at(dir, 'migrations/index.json'));
      m[1].targetPluginVersion = '01.0.0';
      writeJson(at(dir, 'migrations/index.json'), m);
      patchOps(dir, '0002_fixture', (o) => { o.targetPluginVersion = '01.0.0'; });
    }],
    ['a payload version that is not a plain triple', (dir) => {
      const j = readJson(at(dir, '.claude-plugin/plugin.json'));
      j.version = '0.2';
      writeJson(at(dir, '.claude-plugin/plugin.json'), j);
    }],
  ];
  for (const [name, breakIt] of variants) {
    const payload = makePayload(`broken-${seq}`, { version: '0.2.0', migrations: [{ id: '0002_fixture', version: '0.2.0', ops: [FIXTURE_NOTE] }], tweak: breakIt });
    const p = project(`broken-${seq}`);
    install(p);
    const before = snapshot(p);
    const r = update(p, ['--apply'], { payload });
    check(`runner refuses ${name} (exit 1)`, r.status === 1, why(r));
    check(`runner refuses ${name}: ZERO writes`, diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));

    const fresh = project(`broken-fresh-${seq}`);
    const setup = install(fresh, { payload });
    check(`fresh setup refuses ${name} (exit 1)`, setup.status === 1, why(setup));
    check(`fresh setup refuses ${name}: the project is still empty`, Object.keys(snapshot(fresh)).length === 0);
  }
}

// ---------------------------------------------------------------------------
section('8 - add-config-key: idempotent, answered, and never guessed');
{
  const p = project('config-key');
  install(p);
  const payload = makePayload('configkey', {
    version: '0.2.0',
    migrations: [{ id: '0002_key', version: '0.2.0', ops: [{ op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: true, question: 'Keep the dialog?' }] }],
    tweak: addExampleToggleToSchema,
  });
  const missing = update(p, ['--apply'], { payload });
  check('a question with no answer in scripted mode STOPS with exit 1', missing.status === 1, why(missing));
  check('and it names the address', missing.out.includes('0002_key/0/enforcement.exampleToggle'), why(missing));
  check('nothing was written', (readJson(at(p, CONFIG_REL)) || {}).enforcement.exampleToggle === undefined);

  const answered = update(p, ['--apply', '--resolution-file', resolutionFile('answer', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'answer', value: false },
  })], { payload });
  check('with an answer record the run completes', answered.status === 0, why(answered));
  check('the answer landed (false, not the default true)', (readJson(at(p, CONFIG_REL)) || {}).enforcement.exampleToggle === false);

  // Idempotency: the same migration, replayed onto a project that already carries the key.
  const p2 = project('config-key-present');
  install(p2);
  const cfg = readJson(at(p2, CONFIG_REL));
  cfg.enforcement.exampleToggle = true;
  writeJson(at(p2, CONFIG_REL), cfg);
  const r = update(p2, ['--apply'], { payload });
  check('an existing key needs no answer at all (idempotent no-op)', r.status === 0, why(r));
  check('and its value is untouched', (readJson(at(p2, CONFIG_REL)) || {}).enforcement.exampleToggle === true);

  // (f) A `conflict` record - the vocabulary of the engine this one replaced - is an UNKNOWN KIND,
  // wherever it sits in the file: at the answer's own address, and at a re-render address nothing
  // asks about any more. Both are refused before the first operation.
  const p3 = project('config-key-wrongkind');
  install(p3);
  const wrong = update(p3, ['--apply', '--resolution-file', resolutionFile('wrongkind', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'conflict', resolution: 'take-new' },
  })], { payload });
  check('(f) a conflict record where an answer is due stops with exit 1 as an unknown kind',
    wrong.status === 1 && wrong.out.includes('unknown kind "conflict"'), why(wrong));
  const p3b = project('config-key-conflict-elsewhere');
  install(p3b);
  const before3b = snapshot(p3b);
  const elsewhere = update(p3b, ['--apply', '--resolution-file', resolutionFile('conflict-elsewhere', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'answer', value: false },
    [`0002_key/1/${WRITER_REL}`]: { kind: 'conflict', resolution: 'keep-mine' },
  })], { payload });
  check('(f) a conflict record at an address nothing asks about is refused too (exit 1, unknown kind)',
    elsewhere.status === 1 && elsewhere.out.includes('unknown kind "conflict"'), why(elsewhere));
  check('(f) and that refusal wrote nothing', diffSnapshots(before3b, snapshot(p3b)).length === 0, diffSnapshots(before3b, snapshot(p3b)).join(', '));
  const p4 = project('config-key-unknownfield');
  install(p4);
  const unknownField = update(p4, ['--apply', '--resolution-file', resolutionFile('unknownfield', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'answer', value: false, mergedFile: 'x' },
  })], { payload });
  check('an unknown field in a record stops with exit 1', unknownField.status === 1, why(unknownField));
  const p5 = project('config-key-unknownkind');
  install(p5);
  const unknownKind = update(p5, ['--apply', '--resolution-file', resolutionFile('unknownkind', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'whatever', value: false },
  })], { payload });
  check('an unknown record kind stops with exit 1', unknownKind.status === 1, why(unknownKind));
  const p6 = project('config-key-novalue');
  install(p6);
  const noValue = update(p6, ['--apply', '--resolution-file', resolutionFile('novalue', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'answer' },
  })], { payload });
  check('an answer record without a value stops with exit 1', noValue.status === 1, why(noValue));

  // A migration that would add a key the payload schema forbids is caught BEFORE any write.
  const badSchema = makePayload('badschema', {
    version: '0.2.0',
    migrations: [{ id: '0002_key', version: '0.2.0', ops: [{ op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: false }] }],
  });
  const p7 = project('config-key-schema');
  install(p7);
  const before = snapshot(p7);
  const rejected = update(p7, ['--apply'], { payload: badSchema });
  check('a key the payload schema does not admit is refused (exit 1)', rejected.status === 1, why(rejected));
  // The project was installed from another payload root, so the run refreshed `$schema` before its
  // first operation - that one write stands; the refused operation wrote nothing.
  const after = snapshot(p7);
  const strip = (text) => { try { const c = JSON.parse(text); delete c.$schema; return JSON.stringify(c); } catch { return null; } };
  const changed = diffSnapshots(before, after);
  const want = typeof engine.schemaRef === 'function' ? engine.schemaRef(badSchema) : '(migrate.mjs exports no schemaRef)';
  const got = (() => { try { return JSON.parse(after[CONFIG_REL]).$schema; } catch { return null; } })();
  check('and the $schema refresh to the attempted payload root was the ONLY write',
    changed.length === 1 && changed[0] === CONFIG_REL && got === want
      && strip(before[CONFIG_REL]) !== null && strip(before[CONFIG_REL]) === strip(after[CONFIG_REL]),
    `changed [${changed.join(', ')}], $schema ${got} vs ${want}`);
}

// ---------------------------------------------------------------------------
section('9 - legacy bookkeeping: tolerated by --check, normalised by --apply');
// The legacy shape on disk, exactly as the two-hash engine left it - a journal key included.
function toLegacy(p) {
  const cfg = readJson(at(p, CONFIG_REL));
  for (const key of Object.keys(cfg._aiwf.managedRegions)) {
    cfg._aiwf.managedRegions[key] = { upstream: 'a'.repeat(64), local: 'b'.repeat(64), override: key === WRITER_REL };
  }
  cfg._aiwf = { installedPluginVersion: cfg._aiwf.installedPluginVersion, lastMigrationApplied: cfg._aiwf.lastMigrationApplied, migrationJournal: null, managedRegions: cfg._aiwf.managedRegions, ownedAskRules: cfg._aiwf.ownedAskRules, suppressedAskRules: cfg._aiwf.suppressedAskRules };
  writeJson(at(p, CONFIG_REL), cfg);
}
{
  // The production primitive itself.
  const legacy = {
    _aiwf: {
      installedPluginVersion: '0.1.0', lastMigrationApplied: '0001_initial',
      migrationJournal: null,
      managedRegions: { 'a.md': { upstream: 'x', local: 'y', override: true }, 'b.md': '0.1.0' },
    },
  };
  const changed = normalizeBookkeeping(legacy);
  check('normalizeBookkeeping: objects become installedPluginVersion, the journal key goes, and it says it changed something',
    changed === true && !has(legacy._aiwf, 'migrationJournal')
    && legacy._aiwf.managedRegions['a.md'] === '0.1.0' && legacy._aiwf.managedRegions['b.md'] === '0.1.0', () => JSON.stringify(legacy));
  check('normalizeBookkeeping: a current shape is left alone and reported unchanged', normalizeBookkeeping(legacy) === false);
  check('normalizeBookkeeping: a config without _aiwf is left alone', normalizeBookkeeping({ project: {} }) === false);

  const p = project('legacy');
  install(p);
  toLegacy(p);
  const before = snapshot(p);
  const current = update(p, ['--check']);
  check('(d) --check on a legacy config of a CURRENT project exits 0 (up to date)', current.status === 0 && current.out.includes('up to date'), why(current));
  const behind = update(p, ['--check'], { payload: P020 });
  check('(d) --check on a legacy config of a project that is behind exits 1 naming the migration - not an invariant refusal',
    behind.status === 1 && behind.out.includes('0002_fixture') && !behind.out.includes('invariant'), why(behind));
  const dry = update(p, ['--dry-run', '--resolution-file', resolutionFile('legacy-dry', FULL_RESOLUTIONS)], { payload: P020 });
  check('(d) --dry-run on a legacy config exits 0', dry.status === 0, why(dry));
  check('(d) none of them wrote a byte - the legacy shape stays on disk until a run writes the config',
    diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));

  const a = update(p, ['--apply', '--resolution-file', resolutionFile('legacy-apply', FULL_RESOLUTIONS)], { payload: P020 });
  check('(d) --apply on a legacy config exits 0', a.status === 0, why(a));
  const cfg = readJson(at(p, CONFIG_REL)) || {};
  const regions = (cfg._aiwf || {}).managedRegions || {};
  check('(d) the written config carries no journal key and only version strings',
    !has(cfg._aiwf, 'migrationJournal') && Object.values(regions).every((v) => typeof v === 'string')
    && regions[WRITER_REL] === '0.2.0' && regions[ROLES_REL] === BASELINE.targetPluginVersion, () => JSON.stringify(cfg._aiwf));
  check('(d) and it validates against the payload schema',
    validate(cfg, loadSchema(at(P020, 'schema/aiwf.config.schema.json'))).length === 0,
    () => JSON.stringify(validate(cfg, loadSchema(at(P020, 'schema/aiwf.config.schema.json')))));
  check('(d) the artifact a legacy hold covered was overwritten like any other', (read(at(p, WRITER_REL)) || '').includes(PAYLOAD_LINE));
}
{
  // An ALREADY-CURRENT project carrying the legacy shape: --check and --dry-run write nothing, and
  // --apply writes the normalised config back (the self-check validates the config against the
  // schema, so it must not wait for the next version bump to be rewritten).
  const p = project('legacy-current');
  install(p);
  toLegacy(p);
  const before = snapshot(p);
  const c = update(p, ['--check']);
  const d = update(p, ['--dry-run']);
  check('(d) on a CURRENT legacy project --check and --dry-run exit 0 and write nothing',
    c.status === 0 && d.status === 0 && diffSnapshots(before, snapshot(p)).length === 0, why(c.status === 0 ? d : c));
  const a = update(p, ['--apply']);
  check('(d) --apply on a CURRENT legacy project exits 0 and says it normalized the bookkeeping',
    a.status === 0 && a.out.includes('bookkeeping normalized to the current shape'), why(a));
  const cfg = readJson(at(p, CONFIG_REL)) || {};
  check('(d) the config is written back in the current shape and validates against the schema',
    !has(cfg._aiwf, 'migrationJournal') && Object.values(cfg._aiwf.managedRegions || {}).every((v) => v === BASELINE.targetPluginVersion)
    && validate(cfg, loadSchema(at(BASE, 'schema/aiwf.config.schema.json'))).length === 0,
    () => JSON.stringify(validate(cfg, loadSchema(at(BASE, 'schema/aiwf.config.schema.json')))));
  check('(d) and it changed only the config', JSON.stringify(diffSnapshots(before, snapshot(p))) === JSON.stringify([CONFIG_REL]),
    diffSnapshots(before, snapshot(p)).join(', '));
  const after = snapshot(p);
  const again = update(p, ['--apply']);
  check('(d) a second --apply prints nothing of the kind and writes nothing',
    again.status === 0 && !again.out.includes('bookkeeping normalized') && diffSnapshots(after, snapshot(p)).length === 0, why(again));
}
{
  // A journal the old engine left IN FLIGHT is not a state any more: the run starts from
  // lastMigrationApplied and simply runs the migration.
  const p = project('legacy-journal');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.migrationJournal = { migration: '0002_fixture', opIndex: 1, state: 'prepared', target: 'CLAUDE.md', preHash: null, postHash: null, resolution: null };
  writeJson(at(p, CONFIG_REL), cfg);
  const a = update(p, ['--apply', '--resolution-file', resolutionFile('legacy-journal', FULL_RESOLUTIONS)], { payload: P020 });
  check('(d) a stale in-flight journal does not block --apply (exit 0) and is gone afterwards',
    a.status === 0 && !has(bookkeeping(p), 'migrationJournal') && bookkeeping(p).installedPluginVersion === '0.2.0', why(a));
}

// ---------------------------------------------------------------------------
section('10 - a dry run writes nothing and never stops on a question, and preflight refuses an incoherent project');
{
  const p = project('dryrun');
  install(p);
  const before = snapshot(p);
  const clean = update(p, ['--dry-run', '--resolution-file', resolutionFile('dry', FULL_RESOLUTIONS)], { payload: P020 });
  check('--dry-run with resolutions exits 0', clean.status === 0, why(clean));
  check('--dry-run lists every planned operation', (clean.out.match(/0002_fixture\[\d\]/g) || []).length === ALL_OPS.length, why(clean));
  check('--dry-run wrote NOTHING (byte for byte)', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));

  const open = update(p, ['--dry-run'], { payload: P020 });
  check('--dry-run without resolutions exits 0 - there is nothing left to stop on', open.status === 0, why(open));
  check('and it lists the unanswered question as "would ask: <address>"',
    open.out.includes('would ask: 0002_fixture/0/enforcement.exampleToggle'), why(open));
  check('and still previews every operation after it', (open.out.match(/0002_fixture\[\d\]/g) || []).length === ALL_OPS.length, why(open));
  check('--dry-run still wrote nothing', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
}
{
  const p = project('dryrun-clean');
  install(p);
  const payload = makePayload('dryrun-clean-payload', {
    version: '0.2.0', migrations: [{ id: '0002_clean', version: '0.2.0', ops: [WRITER_OP] }], tweak: changeTemplates,
  });
  const before = snapshot(p);
  const r = update(p, ['--dry-run'], { payload });
  check('a dry run over a re-render needs no resolution file and exits 0', r.status === 0, why(r));
  check('and it previews the write', r.out.includes(`${WRITER_REL}: the payload render written`), why(r));
  check('a clean dry run still wrote nothing (byte for byte)',
    diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
}
{
  const p = project('preflight');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.lastMigrationApplied = '0007_never_shipped';
  writeJson(at(p, CONFIG_REL), cfg);
  const before = snapshot(p);
  const r = update(p, ['--apply'], { payload: P020 });
  check('an unknown lastMigrationApplied stops with exit 1', r.status === 1, why(r));
  check('the message names the invariant', r.out.includes('lastMigrationApplied'), why(r));
  check('nothing was written', diffSnapshots(before, snapshot(p)).length === 0);
}
{
  // The Claude pin rule, in the update engine's preflight.
  const p = project('preflight-pin');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg.review.docs = { passes: 1, engine: 'claude', model: 'claude-sonnet-5' };
  writeJson(at(p, CONFIG_REL), cfg);
  const before = snapshot(p);
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('pin', FULL_RESOLUTIONS)], { payload: P020 });
  check('a Claude review row on a foreign exact id stops the update in preflight with exit 1', r.status === 1, why(r));
  check('the message names the row and the rule', r.out.includes('review.docs') && r.out.includes('claude-sonnet-5')
    && r.out.includes('cannot run on the model it records'), why(r));
  check('the config is unchanged and nothing else was written', diffSnapshots(before, snapshot(p)).length === 0,
    diffSnapshots(before, snapshot(p)).join(', '));
  cfg.review.docs = { passes: 1, engine: 'claude', model: 'sonnet' };
  writeJson(at(p, CONFIG_REL), cfg);
  const ok = update(p, ['--check'], { payload: P020 });
  check('...while the same row on a tier alias passes preflight (--check reports pending, exit 1, WITHOUT the pin refusal)',
    ok.status === 1 && !ok.out.includes('cannot run on the model it records') && ok.out.includes('0002_fixture'), why(ok));
}
{
  const p = project('mismatch');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.installedPluginVersion = '0.1.4';
  writeJson(at(p, CONFIG_REL), cfg);
  const r = update(p, ['--apply'], { payload: P020 });
  check('a version stamp disagreeing with the manifest stops with exit 1', r.status === 1, why(r));
  check('the message names both stamps', r.out.includes('0.1.4') && r.out.includes(BASELINE.id), why(r));
}
{
  const p = project('downgrade');
  install(p, { payload: P020 });
  const r = update(p, ['--apply']);
  check('a downgrade is refused with exit 1', r.status === 1, why(r));
  check('the message says downgrade', r.out.toLowerCase().includes('downgrade'), why(r));
}
{
  const p = project('unparsable-version');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.installedPluginVersion = 'not-a-version';
  fs.writeFileSync(at(p, CONFIG_REL), JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  const r = update(p, ['--apply'], { payload: P020 });
  check('an unparsable installedPluginVersion stops with exit 1', r.status === 1, why(r));
}
{
  const empty = project('not-installed');
  const r = update(empty, ['--check'], { payload: P020 });
  check('an uninstalled project cannot start the runner (exit 2)', r.status === 2, why(r));
  check('and it points at /pnp:setup rather than initialising anything', r.out.includes('/pnp:setup'), why(r));
  check('nothing was created', Object.keys(snapshot(empty)).length === 0);
}
{
  const p = project('usage');
  install(p);
  const none = update(p, []);
  check('no mode at all is a usage error (exit 2)', none.status === 2, why(none));
  const two = update(p, ['--check', '--apply']);
  check('two modes at once is a usage error (exit 2)', two.status === 2, why(two));
  const resolve = update(p, ['--resolve', WRITER_REL]);
  check('--resolve is no mode any more: a usage error (exit 2)', resolve.status === 2, why(resolve));
}

// ---------------------------------------------------------------------------
section('11 - the CHANGELOG blocks between the installed and the payload version are printed, in file order');
{
  const FIXTURE_CHANGELOG = [
    '# Changelog', '', 'Intro text that is not a block.', '',
    '## [0.3.0] - 2026-01-03', '', '### Added', '- **Third (T-3)** - three.', '',
    '## [0.2.0] - 2026-01-02', '', '### Fixed', '- **Second (T-2)** - two.', '  - a sub-item.', '',
    '## [0.1.0] - 2026-01-01', '', '- **First (T-1)** - one.', '',
  ].join('\n');
  const EXPECTED = [
    `CHANGELOG ${BASELINE.targetPluginVersion} -> 0.3.0:`,
    '## [0.3.0] - 2026-01-03', '', '### Added', '- **Third (T-3)** - three.', '',
    '## [0.2.0] - 2026-01-02', '', '### Fixed', '- **Second (T-2)** - two.', '  - a sub-item.',
  ];
  const payload = makePayload('changelog', {
    version: '0.3.0',
    migrations: [
      { id: '0002_two', version: '0.2.0', ops: [{ ...FIXTURE_NOTE, id: 'two' }] },
      { id: '0003_three', version: '0.3.0', ops: [{ ...FIXTURE_NOTE, id: 'three' }] },
    ],
    tweak: (dir) => fs.writeFileSync(at(dir, 'CHANGELOG.md'), FIXTURE_CHANGELOG, 'utf8'),
  });
  const lines = changelogLines(payload, BASELINE.targetPluginVersion, '0.3.0');
  check('(e) the production helper returns exactly the open-closed range, in file order, under one header',
    JSON.stringify(lines) === JSON.stringify(EXPECTED), () => lines.join('\n'));
  const p = project('changelog');
  install(p);
  const a = update(p, ['--apply'], { payload });
  check('(e) --apply exits 0', a.status === 0, why(a));
  const out = a.out.replace(/\r\n/g, '\n');
  const at0 = out.indexOf(EXPECTED[0]);
  check('(e) --apply prints those lines verbatim, as one run, before the first operation',
    at0 !== -1 && out.slice(at0).startsWith(EXPECTED.join('\n') + '\n') && at0 < out.indexOf('0002_two[0]'), why(a));
  check('(e) the block AT the installed version is not printed', !out.includes('First (T-1)'), why(a));
  const p2 = project('changelog-dry');
  install(p2);
  const d = update(p2, ['--dry-run'], { payload });
  check('(e) --dry-run prints the same lines', d.status === 0 && d.out.replace(/\r\n/g, '\n').includes(EXPECTED.join('\n')), why(d));

  const noFile = makePayload('changelog-none', {
    version: '0.2.0', migrations: [{ id: '0002_two', version: '0.2.0', ops: [FIXTURE_NOTE] }],
    tweak: (dir) => fs.rmSync(at(dir, 'CHANGELOG.md'), { force: true }),
  });
  const noneLine = `CHANGELOG: no block between ${BASELINE.targetPluginVersion} and 0.2.0`;
  check('(e) no CHANGELOG file -> the one no-block line',
    JSON.stringify(changelogLines(noFile, BASELINE.targetPluginVersion, '0.2.0')) === JSON.stringify([noneLine]),
    () => JSON.stringify(changelogLines(noFile, BASELINE.targetPluginVersion, '0.2.0')));
  check('(e) a CHANGELOG with no block in the range -> the same line',
    JSON.stringify(changelogLines(payload, '0.3.0', '0.3.0')) === JSON.stringify(['CHANGELOG: no block between 0.3.0 and 0.3.0']));
  const p3 = project('changelog-none');
  install(p3);
  const n = update(p3, ['--apply'], { payload: noFile });
  check('(e) and --apply prints it', n.status === 0 && n.out.includes(noneLine), why(n));
}

// ---------------------------------------------------------------------------
section('12 - a migration interrupted after its first operations re-runs idempotently to the same end state');
{
  // The stop is a malformed additions block in the LAST operation's file: the config key, the
  // reconcile and the Writer re-render have already run. The re-run (after the file is fixed) must
  // reach exactly the state an uninterrupted run reaches - compared on a second project, with the
  // project root normalised out of the bytes (the ask rules and the Writer agent carry it).
  const OPS = [
    { op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: false },
    { op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' },
    WRITER_OP,
    ORCH_OP,
  ];
  const payload = makePayload('interrupted', {
    version: '0.2.0', migrations: [{ id: '0002_interrupted', version: '0.2.0', ops: OPS }],
    tweak: (dir) => { addExampleToggleToSchema(dir); changeTemplates(dir); changeRuleset(dir); },
  });
  const p = project('interrupted');
  const control = project('interrupted-control');
  install(p);
  install(control);
  const orchOriginal = read(at(p, ORCH_REL));
  const broken = `${orchOriginal}\n${PROJECT_ADDITIONS_BEGIN}\nhalf a block\n`;
  fs.writeFileSync(at(p, ORCH_REL), broken, 'utf8');

  const first = update(p, ['--apply'], { payload });
  check('(g) the run stops at the last operation (exit 1, naming the file)', first.status === 1 && first.out.includes(ORCH_REL), why(first));
  check('(g) the operations before it ran: the Writer agent is the new render, the new ask rule is in',
    (read(at(p, WRITER_REL)) || '').includes(PAYLOAD_LINE) && askRules(p).includes(NEW_ASK_RULE));
  check('(g) the stamps did not move: the migration is still pending',
    bookkeeping(p).lastMigrationApplied === BASELINE.id && bookkeeping(p).installedPluginVersion === BASELINE.targetPluginVersion);
  check('(g) the file it stopped on is byte-identical', read(at(p, ORCH_REL)) === broken);

  fs.writeFileSync(at(p, ORCH_REL), orchOriginal, 'utf8');
  const second = update(p, ['--apply'], { payload });
  check('(g) the re-run of the SAME migration completes (exit 0)', second.status === 0, why(second));
  const once = update(control, ['--apply'], { payload });
  check('(g) the control run, uninterrupted, completes (exit 0)', once.status === 0, why(once));

  const normalise = (snap, root) => {
    const forms = [root, root.split(path.sep).join('/'), root.split(path.sep).join('\\'), root.split(path.sep).join('\\\\')];
    const out = {};
    for (const [k, v] of Object.entries(snap)) {
      let t = v;
      for (const f of forms.sort((a, b) => b.length - a.length)) t = t.split(f).join('<root>');
      out[k] = t;
    }
    return out;
  };
  const a = normalise(snapshot(p), p);
  const b = normalise(snapshot(control), control);
  const differ = diffSnapshots(a, b);
  check('(g) the end state is identical to the uninterrupted run, file for file (root normalised)',
    differ.length === 0, () => differ.map((k) => `${k}\n--- interrupted\n${a[k]}\n--- control\n${b[k]}`).join('\n').slice(0, 4000));
  const bk = bookkeeping(p);
  check('(g) the re-run did not tombstone the rule the payload dropped, and owns the rule it added',
    !(bk.suppressedAskRules || []).includes(DROPPED_ASK_RULE) && (bk.ownedAskRules || []).includes(NEW_ASK_RULE), () => JSON.stringify(bk));
}

// ---------------------------------------------------------------------------
section('13 - the audit table migration: three silent config keys, re-renders, and an artifact that is not on this installation');
{
  // The REAL operations of the shipped 0004, replayed as a fixture migration so this suite keeps
  // its own manifest numbering.
  const realOps = readJson(path.join(PLUGIN_ROOT, 'migrations', '0004_audit-table', 'ops.json'));
  check('the shipped 0004 is readable and carries seven operations',
    !!realOps && Array.isArray(realOps.operations) && realOps.operations.length === 7,
    realOps ? `${(realOps.operations || []).length} ops` : 'unreadable');
  check('and one of them is the managed CLAUDE.md region, not a whole-file rerender',
    !!realOps && (realOps.operations || []).some((o) => o.op === 'rerender-managed-region'
      && o.file === 'CLAUDE.md' && o.region === 'aiwf-core'
      && o.template === 'templates/CLAUDE.md.tmpl#aiwf-core'),
    JSON.stringify((realOps.operations || []).filter((o) => o.file === 'CLAUDE.md')));

  const payload = makePayload('audit', { version: '0.2.0', migrations: [{ id: '0002_audit', version: '0.2.0', ops: realOps.operations }] });

  const REGION_NOW = 'Four countable tripwires';
  const REGION_WAS = 'Three countable tripwires';

  /** A project as 0.1.2 left it: no review rows, no review block in roles.json, an older region. */
  function preTable(projectDir, { ageRegion = true } = {}) {
    const cfgFile = at(projectDir, CONFIG_REL);
    const cfg = readJson(cfgFile);
    delete cfg.review.plan; delete cfg.review.code; delete cfg.review.docs;
    const roles = readJson(at(projectDir, ROLES_REL));
    delete roles.review;
    fs.writeFileSync(at(projectDir, ROLES_REL), JSON.stringify(roles, null, 2) + '\n', 'utf8');
    if (ageRegion) {
      const claudeFile = at(projectDir, 'CLAUDE.md');
      const now = read(claudeFile);
      // Fail LOUDLY rather than degrade into the already-current case.
      if (now === null || !now.includes(REGION_NOW)) {
        throw new Error('preTable: the rendered CLAUDE.md carries no "' + REGION_NOW + '" to age back');
      }
      fs.writeFileSync(claudeFile, now.split(REGION_NOW).join(REGION_WAS), 'utf8');
    }
    writeJson(cfgFile, cfg);
  }

  // --- a codex-hosted installation: reviewer.md does not exist here at all ---
  {
    const p = project('audit-codex');
    check('install exits 0', install(p, { answers: codexAnswers() }).status === 0);
    check('precondition: there is no reviewer agent file on a codex-configured project',
      !exists(at(p, '.claude/agents/reviewer.md')));
    preTable(p);
    const staleRegion = extractRegion(read(at(p, 'CLAUDE.md')), 'aiwf-core');
    check('precondition: the managed CLAUDE.md region carries the previous payload text',
      !!staleRegion && staleRegion.includes(REGION_WAS) && !staleRegion.includes(REGION_NOW));

    const dry = update(p, ['--dry-run'], { payload });
    check('--dry-run exits 0 and needs no resolution file (nothing here asks a question)', dry.status === 0, why(dry));
    check('it previews the three config keys', ['review.plan', 'review.code', 'review.docs']
      .every((k) => dry.out.includes(`config key ${k} =`)), why(dry));
    check('it previews the re-render of roles.json',
      dry.out.includes('.claude/aiwf-native/roles.json: the payload render written'), why(dry));
    check('it previews the reviewer agent as NOT ON THIS INSTALLATION rather than creating it',
      dry.out.includes('.claude/agents/reviewer.md: not on this installation (no record) - skipped'), why(dry));
    check('and it previews the note about the overrides document', dry.out.includes('note overrides-loop-shape'), why(dry));
    check('it previews the CHANGED managed CLAUDE.md region as a write, with no question',
      dry.out.includes('CLAUDE.md#aiwf-core: the payload render written'), why(dry));

    const a = update(p, ['--apply'], { payload });
    check('--apply exits 0 with NO dialog and no resolution file at all', a.status === 0, why(a));
    const newRegion = extractRegion(read(at(p, 'CLAUDE.md')), 'aiwf-core');
    check('the region CONTENT is the payload version afterwards, not the aged one',
      !!newRegion && newRegion.includes(REGION_NOW) && !newRegion.includes(REGION_WAS));
    check('and it is stamped with the payload version', bookkeeping(p).managedRegions['CLAUDE.md#aiwf-core'] === '0.2.0');
    const cfg = readJson(at(p, CONFIG_REL));
    check('the three rows are in the config with the factory 2 / 1 / 1',
      JSON.stringify(cfg.review.plan) === '{"passes":2}' && JSON.stringify(cfg.review.code) === '{"passes":1}'
      && JSON.stringify(cfg.review.docs) === '{"passes":1}', JSON.stringify(cfg.review));
    const roles = readJson(at(p, ROLES_REL));
    check('roles.json now carries the effective rows (inherited = the codex Reviewer, whole)',
      ['plan', 'code', 'docs'].every((cls) => (roles.review || {})[cls]
        && roles.review[cls].engine === 'codex' && roles.review[cls].model === 'codex-atom-2'),
      JSON.stringify(roles.review));
    check('no reviewer agent file was invented for an installation that has none',
      !exists(at(p, '.claude/agents/reviewer.md'))
      && !has(bookkeeping(p).managedRegions, '.claude/agents/reviewer.md'));
    check('the run printed the note text', a.out.includes('note: '), why(a));
  }

  // --- a claude-hosted installation: the same migration re-renders the agent -
  {
    const p = project('audit-claude');
    check('install exits 0 (claude-hosted Reviewer)', install(p).status === 0);
    check('precondition: the reviewer agent file IS here', exists(at(p, '.claude/agents/reviewer.md')));
    preTable(p, { ageRegion: false });
    const untouchedRegion = extractRegion(read(at(p, 'CLAUDE.md')), 'aiwf-core');
    const a = update(p, ['--apply'], { payload });
    check('--apply exits 0 here too', a.status === 0, why(a));
    check('an ALREADY-CURRENT region is left byte-identical',
      extractRegion(read(at(p, 'CLAUDE.md')), 'aiwf-core') === untouchedRegion
      && a.out.includes('CLAUDE.md#aiwf-core: already current'), why(a));
    check('and the reviewer agent was re-rendered rather than skipped',
      a.out.includes('.claude/agents/reviewer.md: the payload render written')
      || a.out.includes('.claude/agents/reviewer.md: already current'), why(a));
    check('the agent file is still there and stamped', exists(at(p, '.claude/agents/reviewer.md'))
      && bookkeeping(p).managedRegions['.claude/agents/reviewer.md'] === '0.2.0');
  }

  // --- the ifRecorded pair, the smallest possible statement of the rule ------
  {
    const opFor = (extra) => [{
      op: 'rerender-managed-region', file: '.claude/agents/reviewer.md', region: null,
      template: 'templates/agents/reviewer.md.tmpl', ...extra,
    }];
    const withField = makePayload('ifrec-yes', { version: '0.2.0', migrations: [{ id: '0002_ifrec', version: '0.2.0', ops: opFor({ ifRecorded: true }) }] });
    const withoutField = makePayload('ifrec-no', { version: '0.2.0', migrations: [{ id: '0002_ifrec', version: '0.2.0', ops: opFor({}) }] });

    const p1 = project('ifrec-yes');
    install(p1, { answers: codexAnswers() });
    const a1 = update(p1, ['--apply'], { payload: withField });
    check('ifRecorded:true over an unrecorded artifact -> skipped, exit 0, nothing written',
      a1.status === 0 && a1.out.includes('not on this installation (no record) - skipped')
      && !exists(at(p1, '.claude/agents/reviewer.md')), why(a1));

    const p2 = project('ifrec-no');
    install(p2, { answers: codexAnswers() });
    const a2 = update(p2, ['--apply'], { payload: withoutField });
    check('the SAME operation without the field -> a render always creates: exit 0, the file is there and stamped',
      a2.status === 0 && exists(at(p2, '.claude/agents/reviewer.md'))
      && bookkeeping(p2).managedRegions['.claude/agents/reviewer.md'] === '0.2.0', why(a2));
  }
}

// ---------------------------------------------------------------------------
section('14 - a note prints its text, its docRefs and the ids it supersedes');
{
  // The REAL note of the shipped 0011, replayed: the ids are printed under the note, one per line.
  const RETIRED = [
    'orchestrator-regulation-v2-seed',
    'local-multisession-invariant',
    'local-resume-economics',
    'local-chain-trace-duty',
    'local-stats-methodology',
  ];
  const shipped = readJson(path.join(PLUGIN_ROOT, 'migrations', '0011_transfer-surface', 'ops.json'));
  const shippedNote = shipped && (shipped.operations || []).find((o) => o.op === 'note');
  check('the shipped 0011 carries a note operation declaring the five retired ids',
    !!shippedNote && JSON.stringify(shippedNote.supersedes) === JSON.stringify(RETIRED), JSON.stringify(shippedNote && shippedNote.supersedes));
  if (shippedNote) {
    const withIds = makePayload('supersedes-yes', {
      version: '0.2.0', migrations: [{ id: '0002_supersedes', version: '0.2.0', ops: [shippedNote] }],
    });
    const p = project('supersedes-yes');
    check('install exits 0', install(p).status === 0);
    const artifactsBefore = Object.keys(bookkeeping(p).managedRegions).sort().join(',');
    const a = update(p, ['--apply'], { payload: withIds });
    check('--apply of a note-only migration exits 0', a.status === 0, why(a));
    check('the note text is printed', a.out.includes(`note: ${shippedNote.text.split('\n')[0]}`), why(a));
    const missing = RETIRED.filter((id) => !a.out.includes(`supersedes: ${id}`));
    check('one "supersedes: <id>" line per declared id', missing.length === 0, missing.length ? `missing ${JSON.stringify(missing)}` : `${RETIRED.length} ids`);
    check('the note applied nothing: the managed set is untouched, only the version stamps moved',
      Object.keys(bookkeeping(p).managedRegions).sort().join(',') === artifactsBefore
      && bookkeeping(p).installedPluginVersion === '0.2.0');
  }
}

// ---------------------------------------------------------------------------
section('15 - createIfAbsent: accepted, and nothing it would change - a render always creates and always overwrites');
{
  const opFor = (extra) => [{
    op: 'rerender-managed-region', file: '.claude/agents/reviewer.md', region: null,
    template: 'templates/agents/reviewer.md.tmpl', ...extra,
  }];
  const moveReviewerTemplate = (dir) => fs.appendFileSync(at(dir, 'templates/agents/reviewer.md.tmpl'), `\n${PAYLOAD_LINE}\n`, 'utf8');
  const withCreate = makePayload('create-yes', {
    version: '0.2.0', migrations: [{ id: '0002_create', version: '0.2.0', ops: opFor({ createIfAbsent: true }) }], tweak: moveReviewerTemplate,
  });
  const withoutField = makePayload('create-plain', {
    version: '0.2.0', migrations: [{ id: '0002_create', version: '0.2.0', ops: opFor({}) }], tweak: moveReviewerTemplate,
  });
  const bothFields = makePayload('create-both', {
    version: '0.2.0', migrations: [{ id: '0002_create', version: '0.2.0', ops: opFor({ ifRecorded: true, createIfAbsent: true }) }],
  });
  const FOREIGN = '---\nname: reviewer\n---\nSomebody else put this here.\n';

  // --- face 1: no record, no file -> created and stamped ------------------------------------
  {
    const p = project('create-empty');
    check('install exits 0 (codex-hosted: no reviewer agent, no record)', install(p, { answers: codexAnswers() }).status === 0);
    const a = update(p, ['--apply'], { payload: withCreate });
    check('createIfAbsent over empty ground: exit 0, created',
      a.status === 0 && a.out.includes('.claude/agents/reviewer.md: created from the payload render'), why(a));
    check('the file exists and is stamped with the payload version',
      exists(at(p, '.claude/agents/reviewer.md')) && bookkeeping(p).managedRegions['.claude/agents/reviewer.md'] === '0.2.0');
  }
  // --- face 2: no record, a FOREIGN file -> overwritten, named, no question ------------------
  {
    const p = project('create-foreign');
    check('install exits 0 (codex-hosted again)', install(p, { answers: codexAnswers() }).status === 0);
    fs.mkdirSync(path.dirname(at(p, '.claude/agents/reviewer.md')), { recursive: true });
    fs.writeFileSync(at(p, '.claude/agents/reviewer.md'), FOREIGN, 'utf8');
    const a = update(p, ['--apply'], { payload: withCreate });
    check('a foreign file at the target is OVERWRITTEN (exit 0), and the summary says it had no record',
      a.status === 0 && a.out.includes('.claude/agents/reviewer.md: overwritten with the payload render (this installation had no record of it)'), why(a));
    const text = read(at(p, '.claude/agents/reviewer.md')) || '';
    check('the file is the render now, and it is stamped', !text.includes('Somebody else') && text.includes(PAYLOAD_LINE)
      && bookkeeping(p).managedRegions['.claude/agents/reviewer.md'] === '0.2.0');
  }
  // --- face 3: a record exists -> the field is invisible --------------------------------------
  {
    const withIt = project('create-recorded-yes');
    const without = project('create-recorded-no');
    check('both installs exit 0 (claude-hosted: the reviewer agent IS recorded here)',
      install(withIt).status === 0 && install(without).status === 0);
    const a1 = update(withIt, ['--apply'], { payload: withCreate });
    const a2 = update(without, ['--apply'], { payload: withoutField });
    check('both runs exit 0', a1.status === 0 && a2.status === 0, why(a1.status === 0 ? a2 : a1));
    const f1 = read(at(withIt, '.claude/agents/reviewer.md'));
    const f2 = read(at(without, '.claude/agents/reviewer.md'));
    check('with the field and without it, the artifact is the same render (root normalised)',
      f1 !== null && f2 !== null && f1.includes(PAYLOAD_LINE)
      && f1.split(withIt).join('<r>').split(withIt.split(path.sep).join('\\')).join('<r>')
        === f2.split(without).join('<r>').split(without.split(path.sep).join('\\')).join('<r>'));
    check('and so is its bookkeeping record',
      bookkeeping(withIt).managedRegions['.claude/agents/reviewer.md'] === bookkeeping(without).managedRegions['.claude/agents/reviewer.md']);
    check('the summary is the ordinary re-render, with no line about the field at all',
      a1.out.includes('.claude/agents/reviewer.md: the payload render written') && !/createIfAbsent/i.test(a1.out), why(a1));
  }
  // --- face 4: the two fields together are still a VALIDATOR refusal ---------------------------
  {
    const MUTUAL = 'rerender-managed-region: ifRecorded and createIfAbsent are mutually exclusive '
      + '(skip versus create/refuse for an unrecorded artifact) - carry one of them';
    const p = project('create-both');
    check('install exits 0', install(p, { answers: codexAnswers() }).status === 0);
    const before = snapshot(p);
    const a = update(p, ['--apply'], { payload: bothFields });
    check('an op carrying BOTH fields is refused by the payload validator (exit 1), with the literal message',
      a.status === 1 && a.out.includes(MUTUAL), why(a));
    check('and that refusal wrote nothing at all', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
    for (const [label, extra] of [
      ['ifRecorded:false + createIfAbsent:true', { ifRecorded: false, createIfAbsent: true }],
      ['ifRecorded:true + createIfAbsent:false', { ifRecorded: true, createIfAbsent: false }],
    ]) {
      const payload = makePayload(`create-both-${seq}`, { version: '0.2.0', migrations: [{ id: '0002_create', version: '0.2.0', ops: opFor(extra) }] });
      const p2 = project(`create-both-${seq}`);
      check(`install exits 0 (${label})`, install(p2, { answers: codexAnswers() }).status === 0);
      const before2 = snapshot(p2);
      const r = update(p2, ['--apply'], { payload });
      check(`BOTH fields PRESENT is refused whatever the values: ${label} (exit 1, the literal message)`,
        r.status === 1 && r.out.includes(MUTUAL), why(r));
      check(`and ${label} wrote nothing at all`, diffSnapshots(before2, snapshot(p2)).length === 0, diffSnapshots(before2, snapshot(p2)).join(', '));
    }
  }
  // --- face 5: the field on a REGION op is still a validator refusal ---------------------------
  {
    const WHOLE_FILE_ONLY = 'rerender-managed-region: createIfAbsent applies to whole-file artifacts only '
      + '(region must be null) - a region cannot be created into a file that does not exist.';
    const regionCreate = makePayload('create-region', {
      version: '0.2.0',
      migrations: [{ id: '0002_create', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/CLAUDE.md.tmpl#aiwf-core', createIfAbsent: true }] }],
    });
    const p = project('create-region');
    check('install exits 0', install(p).status === 0);
    const before = snapshot(p);
    const a = update(p, ['--apply'], { payload: regionCreate });
    check('createIfAbsent on a REGION op is refused by the payload validator (exit 1), with the literal message',
      a.status === 1 && a.out.includes(WHOLE_FILE_ONLY), why(a));
    check('and that refusal wrote nothing at all either', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
  }
  // --- face 10: the SHIPPED note of 0012 recommends no --adopt ---------------------------------
  {
    const shipped = readJson(path.join(PLUGIN_ROOT, 'migrations', '0012_orchestrator-role', 'ops.json'));
    const note = shipped && (shipped.operations || []).find((o) => o.op === 'note');
    check('the shipped 0012 carries a note operation, and its text recommends no --adopt',
      !!note && !String(note.text).includes('--adopt'), note ? `${String(note.text).length} chars` : 'no note');
  }
  // --- faces 11 and 12: the SHIPPED AGENTS.md operation of 0023, run as it ships ----------------
  {
    const shipped0023 = readJson(path.join(PLUGIN_ROOT, 'migrations', '0023_changes-dir-and-agents', 'ops.json'));
    const ops0023 = (shipped0023 && shipped0023.operations) || [];
    const agentsOp = ops0023.find((o) => o.op === 'rerender-managed-region' && o.file === 'AGENTS.md');
    check('[update-agents-0] 0023 ships the AGENTS.md op: whole file, the template, createIfAbsent',
      !!agentsOp && agentsOp.region === null && agentsOp.template === 'templates/AGENTS.md.tmpl' && agentsOp.createIfAbsent === true,
      JSON.stringify(agentsOp || ops0023.map((o) => o.op)));
    const agentsPayload = makePayload('agents-op', {
      version: '0.2.0',
      migrations: [{ id: '0002_agents', version: '0.2.0', ops: [agentsOp || { op: 'note', id: 'agents-op-missing', text: 'the shipped op is missing', docRefs: [] }] }],
    });
    const forgetAgents = (p) => {
      const cfg = readJson(at(p, CONFIG_REL));
      delete cfg._aiwf.managedRegions['AGENTS.md'];
      writeJson(at(p, CONFIG_REL), cfg);
      fs.rmSync(at(p, 'AGENTS.md'), { force: true });
    };
    {
      const p = project('agents-empty');
      check('install exits 0', install(p).status === 0);
      const setupRender = read(at(p, 'AGENTS.md'));
      forgetAgents(p);
      const a = update(p, ['--apply'], { payload: agentsPayload });
      check('[update-agents-1] the shipped op over empty ground: exit 0, AGENTS.md created',
        a.status === 0 && a.out.includes('AGENTS.md: created from the payload render'), why(a));
      check('[update-agents-2] it is stamped with the payload version', bookkeeping(p).managedRegions['AGENTS.md'] === '0.2.0');
      check('[update-agents-3] and the update render is byte-identical to the setup render',
        setupRender !== null && read(at(p, 'AGENTS.md')) === setupRender);
    }
    {
      const p = project('agents-foreign');
      check('install exits 0', install(p).status === 0);
      const setupRender = read(at(p, 'AGENTS.md'));
      forgetAgents(p);
      fs.writeFileSync(at(p, 'AGENTS.md'), '# My own auditor notes\n\nHand-written.\n', 'utf8');
      const a = update(p, ['--apply'], { payload: agentsPayload });
      check('[update-agents-4] a hand-written AGENTS.md with no record is OVERWRITTEN (exit 0), named as such',
        a.status === 0 && a.out.includes('AGENTS.md: overwritten with the payload render (this installation had no record of it)'), why(a));
      check('[update-agents-5] and it is the setup render now, stamped',
        read(at(p, 'AGENTS.md')) === setupRender && bookkeeping(p).managedRegions['AGENTS.md'] === '0.2.0');
    }
  }
}

// ---------------------------------------------------------------------------
section('16 - a release never touches examples/: the example bump is numbered when it is built, against the payload it lands in');
{
  const NOTE_ONLY = [{ op: 'note', id: 'fake-release', text: 'A release the example bump has to follow.', docRefs: ['docs/LOOP.md'] }];
  const sim = makePayload('release-sim', {
    version: '0.2.0',
    migrations: [{ id: '0002_fake-release', version: '0.2.0', ops: NOTE_ONLY }],
  });
  const exampleDir = at(sim, 'examples/example-project');
  const templateBefore = snapshot(at(exampleDir, 'bump'));
  let built = null;
  let buildError = null;
  try { built = buildExampleBump(sim, exampleDir); } catch (e) { buildError = e; }
  check('the builder runs against the released payload', buildError === null, buildError ? buildError.message : '');
  check('it numbers the bump manifest length + 1 of THAT payload: 0003_example-bump',
    !!built && built.id === '0003_example-bump', built ? built.id : 'nothing built');
  check('and targets that payload\'s next minor version: 0.3.0',
    !!built && built.targetPluginVersion === '0.3.0', built ? built.targetPluginVersion : 'nothing built');
  const manifest = readJson(at(sim, 'migrations/index.json')) || [];
  const ops = readJson(at(sim, 'migrations/0003_example-bump/ops.json')) || {};
  check('the manifest, plugin.json and the copied ops.json all carry the computed id and version',
    JSON.stringify(manifest[manifest.length - 1]) === JSON.stringify({ id: '0003_example-bump', targetPluginVersion: '0.3.0' })
      && (readJson(at(sim, '.claude-plugin/plugin.json')) || {}).version === '0.3.0'
      && ops.migration === '0003_example-bump' && ops.targetPluginVersion === '0.3.0'
      && exists(at(sim, 'migrations/0003_example-bump/NOTES.md')),
    `${JSON.stringify(manifest[manifest.length - 1])} / ops ${ops.migration} -> ${ops.targetPluginVersion}`);
  const v = validatePayload(sim);
  check('validate-payload accepts the built payload with ZERO errors',
    v.errors.length === 0, () => v.errors.join('\n'));
  check('the example template it was built from is byte-identical afterwards',
    diffSnapshots(templateBefore, snapshot(at(exampleDir, 'bump'))).length === 0,
    diffSnapshots(templateBefore, snapshot(at(exampleDir, 'bump'))).join(', '));
}
// An UNUSABLE template is refused before the payload is touched, and the payload stays buildable.
{
  const NOTE_ONLY = [{ op: 'note', id: 'fake-release', text: 'A release the example bump has to follow.', docRefs: ['docs/LOOP.md'] }];
  const sim = makePayload('release-sim-broken-template', {
    version: '0.2.0',
    migrations: [{ id: '0002_fake-release', version: '0.2.0', ops: NOTE_ONLY }],
  });
  const exampleDir = path.join(tmpRoot, 'example-broken-template');
  copyTree(at(PLUGIN_ROOT, 'examples/example-project/bump'), path.join(exampleDir, 'bump'));
  const link = path.join(exampleDir, 'bump', 'example-bump', 'AAA-dangling');
  let linkError = null;
  try { fs.symlinkSync(path.join(tmpRoot, 'no-such-target'), link, 'junction'); } catch (e) { linkError = e; }
  check('a dangling link can be planted in the template (a junction on Windows, a symlink on POSIX)',
    linkError === null, linkError ? `${linkError.code || ''} ${linkError.message}` : '');
  const treeState = (dir, base = dir, acc = {}) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      const rel = path.relative(base, p).split(path.sep).join('/');
      if (e.isDirectory()) { acc[`${rel}/`] = '<dir>'; treeState(p, base, acc); } else acc[rel] = fs.readFileSync(p, 'utf8');
    }
    return acc;
  };
  const before = treeState(sim);
  let refusal = null;
  try { buildExampleBump(sim, exampleDir); } catch (e) { refusal = e; }
  check('the build is REFUSED, marked as a refusal, naming the unreadable entry',
    !!refusal && refusal.refused === true && /AAA-dangling/.test(refusal.message),
    refusal ? `refused=${refusal.refused}: ${refusal.message}` : 'it did not throw at all');
  const changed = diffSnapshots(before, treeState(sim));
  check('the payload is byte-identical afterwards - no migration directory, no manifest entry, no version change',
    changed.length === 0, changed.join(', '));
  try { fs.rmdirSync(link); } catch { try { fs.unlinkSync(link); } catch { /* the check below is the real answer */ } }
  let retry = null;
  let retryError = null;
  try { retry = buildExampleBump(sim, exampleDir); } catch (e) { retryError = e; }
  check('once the template is repaired, the SAME payload builds: 0003_example-bump -> 0.3.0',
    !!retry && retry.id === '0003_example-bump' && retry.targetPluginVersion === '0.3.0',
    retryError ? retryError.message : JSON.stringify(retry));
}

// ---------------------------------------------------------------------------
section('17 - a stale $schema is refreshed');
const schemaRefOf = (root) => (typeof engine.schemaRef === 'function' ? engine.schemaRef(root) : '(migrate.mjs exports no schemaRef)');
const schemaOf = (p) => (readJson(at(p, CONFIG_REL)) || {}).$schema;
// Another root at the BASELINE version: nothing is pending from it, so a run from it is a no-op
// whose only possible write is the $schema refresh.
const BASE_B = makePayload('schema-b', { version: BASELINE.targetPluginVersion, migrations: [] });
{
  const PNOTE = makePayload('schema-note', { version: '0.2.0', migrations: [{ id: '0002_note', version: '0.2.0', ops: [FIXTURE_NOTE] }] });
  const p = project('schema-apply');
  install(p);
  const from = schemaOf(p);
  check('setup and the engine agree on the install root\'s value', from === schemaRefOf(BASE), `${from} vs ${schemaRefOf(BASE)}`);
  const r = update(p, ['--apply'], { payload: PNOTE });
  check('--apply exits 0', r.status === 0, why(r));
  check('$schema is rewritten to the update root', schemaOf(p) === schemaRefOf(PNOTE), String(schemaOf(p)));
  check('and the run says so', r.out.includes(`refreshed $schema: ${from} -> ${schemaRefOf(PNOTE)}`), why(r));
}
{
  const p = project('schema-noop');
  install(p);
  const stale = schemaOf(p);
  const cfgBefore = readJson(at(p, CONFIG_REL)) || {};
  const before = snapshot(p);
  const r1 = update(p, ['--apply'], { payload: BASE_B });
  check('a no-op run from another root exits 0 as already current', r1.status === 0 && r1.out.includes('already current'), why(r1));
  check('and rewrites the stale $schema', schemaOf(p) === schemaRefOf(BASE_B) && schemaOf(p) !== stale, String(schemaOf(p)));
  const changed = diffSnapshots(before, snapshot(p));
  check('it changed nothing but the config', changed.length === 1 && changed[0] === CONFIG_REL, changed.join(', '));
  const strip = (c) => { const x = { ...c }; delete x.$schema; return JSON.stringify(x); };
  check('and nothing in the config beyond $schema', strip(cfgBefore) === strip(readJson(at(p, CONFIG_REL)) || {}));
  const fresh = snapshot(p);
  const r2 = update(p, ['--apply'], { payload: BASE_B });
  check('a second run from the same root refreshes nothing and writes nothing',
    r2.status === 0 && !r2.out.includes('refreshed $schema') && diffSnapshots(fresh, snapshot(p)).length === 0, why(r2));
}

// ---------------------------------------------------------------------------
// LAST: every case below RUNS the self-check, whose own assertions change on their own schedule.
section('18 - the self-check is the update\'s own last step, and a red one is never exit 0');
{
  const sc = spawnSync(process.execPath, [
    path.join(P020, 'scripts', 'selfcheck', 'aiwf-selfcheck.js'), '--plugin-root', P020, '--project-fixture', upgraded,
  ], { encoding: 'utf8' });
  check('the self-check passes against the project section 2 updated (exit 0)', sc.status === 0,
    sc.status === 0 ? '' : '\n' + (sc.stdout || '').trim().split('\n').slice(-14).join('\n'));
}
{
  const p = project('sc-pass');
  check('install exits 0', install(p).status === 0);
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('sc-pass', FULL_RESOLUTIONS)], { payload: P020, selfcheck: true });
  check('--apply exits 0', r.status === 0, why(r));
  check('the update RAN the self-check itself and reported PASS', r.out.includes('self-check: PASS'), why(r));
  check('and the PASS line quotes the self-check\'s own summary line verbatim',
    /self-check: PASS - .*assertions passed/.test(r.out),
    (r.out.split('\n').find((l) => l.startsWith('self-check:')) || '(no self-check line)').slice(0, 120));
}
{
  const p = project('sc-skipped');
  check('install exits 0', install(p).status === 0);
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('sc-skip', FULL_RESOLUTIONS), '--no-selfcheck'],
    { payload: P020, selfcheck: true });
  check('--no-selfcheck still exits 0', r.status === 0, why(r));
  check('and it says so on one line', r.out.includes('self-check: SKIPPED'), why(r));
  check('no PASS line is printed for a run that never checked anything', !r.out.includes('self-check: PASS'));
}
{
  // FAIL-CLOSED: the payload's self-check script is not there at all.
  const payload = path.join(tmpRoot, 'payload-020-without-selfcheck');
  copyTree(P020, payload);
  fs.rmSync(at(payload, 'scripts/selfcheck/aiwf-selfcheck.js'));
  const p = project('sc-unrunnable');
  check('install exits 0', install(p).status === 0);
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('sc-unrunnable', FULL_RESOLUTIONS)], { payload, selfcheck: true });
  check('an unrunnable self-check makes the update exit 1, not 0', r.status === 1, why(r));
  check('the message names exactly what could not run', r.out.includes('scripts/selfcheck/aiwf-selfcheck.js'), why(r));
  check('and says plainly that the files WERE written and nothing was rolled back',
    r.out.includes('WERE written') && r.out.includes('nothing was rolled back'), why(r));
  const bk = bookkeeping(p);
  check('which is true: the migrations really applied',
    bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_fixture', `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
}
{
  // The self-check RUNS and comes back RED after an apply that succeeded: a managed artifact the
  // note-only migration does not touch is MISSING from the project - the self-check checks that
  // every managed artifact is present.
  const notePayload = makePayload('note-only-020', {
    version: '0.2.0',
    migrations: [{ id: '0002_noteonly', version: '0.2.0', ops: [FIXTURE_NOTE] }],
  });
  const p = project('sc-red');
  check('install exits 0', install(p).status === 0);
  fs.rmSync(at(p, WRITER_REL));
  const r = update(p, ['--apply'], { payload: notePayload, selfcheck: true });
  check('a RED self-check after a successful apply makes the update exit 1', r.status === 1, why(r));
  check('the self-check\'s own output reached the operator verbatim',
    r.out.includes('writer.md') && r.out.includes('FAILURES:'), why(r));
  check('the verdict says the files WERE written and nothing was rolled back',
    r.out.includes('WERE written') && r.out.includes('nothing was rolled back'), why(r));
  const bk = bookkeeping(p);
  check('which is true: the migration applied and the stamps moved',
    bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_noteonly', `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
}
{
  // The self-check CRASHES - a section throws rather than returning a red assertion.
  const crashPayload = makePayload('crash-selfcheck-020', {
    version: '0.2.0',
    migrations: [{ id: '0002_noteonly', version: '0.2.0', ops: [FIXTURE_NOTE] }],
    tweak: (dir) => patch(at(dir, 'scripts/selfcheck/aiwf-selfcheck.js'),
      '    sectionGate2(tmpRoot);',
      '    (() => { throw new Error(\'sc-crash injected\'); })();'),
  });
  const p = project('sc-crash');
  check('install exits 0', install(p).status === 0);
  const r = update(p, ['--apply'], { payload: crashPayload, selfcheck: true });
  check('a self-check that CRASHES makes the update exit 1, not 0', r.status === 1, why(r));
  check('the crash reached the operator with its own message', r.out.includes('sc-crash injected'), why(r));
  check('and with a stack, not just a message', /at [^\n]*aiwf-selfcheck\.js/.test(r.out), why(r));
  check('the report still ran: the tally line was printed', /==== \d+\/\d+ assertions passed ====/.test(r.out), why(r));
  check('the crash is named in the FAILURES block, under its own section',
    r.out.includes('FAILURES:') && r.out.includes('[(uncaught)]'), why(r));
  check('and the run says out loud that it is incomplete', r.out.includes('INCOMPLETE RUN'), why(r));
  const tally = r.out.match(/==== (\d+)\/(\d+) assertions passed ====/);
  const passed = tally ? Number(tally[1]) : 0;
  const total = tally ? Number(tally[2]) : 0;
  check('the assertions that ran before the crash were not lost, and the crash is counted against them',
    passed > 0 && total > passed, tally ? tally[0] : '(no tally line was printed at all)');
  check('the verdict still says the files WERE written and nothing was rolled back',
    r.out.includes('WERE written') && r.out.includes('nothing was rolled back'), why(r));
  const bk = bookkeeping(p);
  check('which is true: the migration applied and the stamps moved',
    bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_noteonly', `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
}
{
  // The SAME contract, for a throwable that is not an Error (no message, no stack, null prototype).
  const crashPayloadNoMessage = makePayload('crash-selfcheck-nullproto-020', {
    version: '0.2.0',
    migrations: [{ id: '0002_noteonly', version: '0.2.0', ops: [FIXTURE_NOTE] }],
    tweak: (dir) => patch(at(dir, 'scripts/selfcheck/aiwf-selfcheck.js'),
      '    sectionGate2(tmpRoot);',
      '    (() => { throw Object.assign(Object.create(null), { code: \'sc-crash-null-proto\' }); })();'),
  });
  const p = project('sc-crash-null-proto');
  check('install exits 0', install(p).status === 0);
  const r = update(p, ['--apply'], { payload: crashPayloadNoMessage, selfcheck: true });
  check('a throwable with no message and no stack still makes the update exit 1', r.status === 1, why(r));
  check('its field reached the operator, and it was NOT flattened to [object Object]',
    r.out.includes('sc-crash-null-proto') && !r.out.includes('[object Object]'), why(r));
  check('the report still ran for it too: the tally line was printed, with the crash counted against it',
    (() => {
      const t = r.out.match(/==== (\d+)\/(\d+) assertions passed ====/);
      return !!t && Number(t[1]) > 0 && Number(t[2]) > Number(t[1]);
    })(), why(r));
  check('and the crash is named in the FAILURES block, under its own section',
    r.out.includes('FAILURES:') && r.out.includes('[(uncaught)]'), why(r));
  check('and the run says out loud that it is incomplete', r.out.includes('INCOMPLETE RUN'), why(r));
}
{
  // A stale `$schema` on an already-current project: the refresh is a write, so the self-check runs.
  const p = project('schema-noop-selfcheck');
  install(p);
  const from = schemaOf(p);
  const r = update(p, ['--apply'], { payload: BASE_B, selfcheck: true });
  check('the run exits 0', r.status === 0, why(r));
  const line = `refreshed $schema: ${from} -> ${schemaRefOf(BASE_B)}`;
  const at1 = r.out.indexOf(line);
  const at2 = r.out.indexOf('nothing else was written');
  check('the two lines print in order', at1 !== -1 && at2 > at1, why(r));
  check('the plain "Nothing was written" line was NOT printed for a run that wrote', !r.out.includes('Nothing was written'), why(r));
  check('the integrated self-check ran and passed', r.out.includes('self-check: PASS'), why(r));
}

// ---------------------------------------------------------------------------
try { fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(`fixtures left behind: ${fs.existsSync(tmpRoot) ? tmpRoot : 'none'}`);
console.log(failures === 0 ? 'UPDATE SUITE: PASS' : 'UPDATE SUITE: FAIL');
process.exit(failures === 0 ? 0 : 1);
