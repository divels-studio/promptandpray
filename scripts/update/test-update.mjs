#!/usr/bin/env node
/*
 * Acceptance suite for the update engine (/pnp:update).
 *
 * HOW IT TESTS
 *   Real entrypoints, throwaway directories under the system temp dir, nothing checked in and
 *   nothing left behind. Where a version bump is needed, the suite COPIES the whole payload into a
 *   temp directory, bumps its plugin.json and adds a fixture migration - so "upgrade 0.1.0 -> 0.2.0"
 *   is a real payload the real runner walks, not a mock. Crash recovery is proven by really killing
 *   the process (PNP_UPDATE_CRASH_AT makes it exit 86 at a named write boundary) and resuming in a
 *   FRESH process: a hand-written journal state would only prove the recovery code can parse a
 *   fixture.
 *
 * WHAT IT ASSERTS
 *   1. an already-current project is a zero-diff no-op, and the interlock says so;
 *   2. a real 0.1.0 -> 0.2.0 upgrade applies all four op types, and the self-check passes on the
 *      result; a FRESH install from that payload stamps its last manifest entry;
 *   3. the interlock stops a stale project, and every non-exception skill really runs it;
 *   4. the conflict matrix - {you edited it, the payload changed it, both} x {whole file, region},
 *      plus a missing file and a missing region. SIX of the eight stop WITHOUT mutating the target,
 *      keep the operations already applied, and resume; the two upstream-only cases - the payload
 *      moved, the operator never touched the artifact - are applied SILENTLY, with no resolution
 *      file in reach, which is what proves nobody was asked. All three resolutions work, merge
 *      included, and a held artifact is never re-applied;
 *   5. ownership without takeover survives an update, and a settings shape the engine does not
 *      understand is never rewritten;
 *   6. --resolve leaves an override outside any version bump;
 *   7. a malformed payload blocks BOTH the runner and a fresh setup, with zero bytes written;
 *   8. a crash at every write boundary recovers deterministically in a fresh process, including a
 *      config-target operation and a manual merge (whose staged answer is replayed, not re-asked);
 *   9. a dry run writes nothing at all;
 *  10. the self-check is the update's OWN last step: a real apply runs it and reports PASS,
 *      --no-selfcheck skips it out loud, a self-check that cannot be run at all makes the update
 *      exit 1, and a self-check that runs and comes back RED also makes it exit 1 - while the
 *      migrations it just applied stay applied, because a red verdict is a report about the result,
 *      not a rollback.
 *
 * WHY MOST CASES PASS --no-selfcheck
 *   Every install and every apply below would otherwise pay for a full self-check run (300+
 *   assertions and a fresh PowerShell host per run). The cases that are ABOUT the integration run
 *   it; the rest skip it through the same flag an operator has, never through a test-only bypass.
 *
 * Exit 0 = every assertion passed. Exit 1 = at least one failed. Exit 2 = the suite could not run.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UpdateError, resolveArtifact, runUpdate } from './migrate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(HERE, '..', '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-update-test-'));

let failures = 0;
let checks = 0;
function check(name, ok, detail) {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' - ' + detail : ''}`);
  return !!ok;
}
function section(title) { console.log(`\n=== ${title} ===`); }
const why = (r) => `exit ${r.status}: ${(r.out || '').trim().split('\n').filter(Boolean).slice(-3).join(' | ').slice(0, 260)}`;

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
const STAGE_REL = '.claude/aiwf-native/update-stage';

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

// ---- payload builder -------------------------------------------------------
// A real payload copy: the plugin as it ships, with plugin.json bumped and one or more migrations
// added. The runner and setup are then executed FROM THE COPY, which is what a newer plugin release
// really is.
const FIXTURE_NOTE = { op: 'note', id: 'fixture-note', text: 'The fixture migration exercises every operation type.', docRefs: ['docs/LOOP.md#commit-gate'] };
const ALL_OPS = [
  { op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: true, question: 'Keep the example toggle this fixture release introduces?' },
  { op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/CLAUDE.md.tmpl#aiwf-core' },
  { op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' },
  { op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' },
  FIXTURE_NOTE,
];
const NEW_ASK_RULE = 'Bash(pnp-fixture-new:*)';
const DROPPED_ASK_RULE = 'Bash(git stash:*)';

/** Adds the config key the fixture migration introduces, so the bumped payload's schema admits it. */
function addExampleToggleToSchema(dir) {
  patch(at(dir, 'schema/aiwf.config.schema.json'),
    '"routeWriteGuard": {',
    '"exampleToggle": { "type": "boolean", "description": "fixture key added by a migration" },\n        "routeWriteGuard": {');
}
/**
 * Makes the payload RENDER differently. On its own that is no longer a conflict - an artifact the
 * operator never edited is re-rendered without a dialog - so this is what the silent path and the
 * "both" conflicts are built on, not a predicate by itself.
 */
function changeTemplates(dir) {
  patch(at(dir, 'templates/CLAUDE.md.tmpl'), '## Your role', '## Your role (v2)');
  fs.appendFileSync(at(dir, 'templates/agents/writer.md.tmpl'), '\nA line the next payload version added.\n', 'utf8');
}
/** Changes the desired ask set: one rule added, one rule (which setup owns) dropped. */
function changeRuleset(dir) {
  const file = at(dir, 'templates/settings.ask-ruleset.json');
  const json = readJson(file);
  json.permissions.ask = json.permissions.ask.filter((r) => r !== DROPPED_ASK_RULE).concat([NEW_ASK_RULE]);
  writeJson(file, json);
}

// THE BASELINE THIS SUITE LIVES ON, and why it is not simply "the payload as it ships".
// Every payload built here starts from the shipped plugin with its manifest TRUNCATED to the first
// entry (and the real migration directories above it removed, so no orphan directory fails
// validation). The fixture migrations are then appended as `0002_*`, `0003_*` - which is what their
// hardcoded ids and resolution addresses say throughout this file.
// Without the truncation, every fixture id would have to be renumbered the day the payload ships
// its own second migration, and the suite would be asserting the shipped migration COUNT instead of
// the engine's behaviour. The engine is what is under test here; the shipped manifest is covered by
// validate-payload and the self-check.
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
  renumberExampleBump(dir, manifest);
  if (tweak) tweak(dir);
  return dir;
}

/**
 * The committed example fixture travels with every payload copy, and the self-check - which a real
 * `--apply` runs against the payload it applied - holds it to the manifest of the payload it sits
 * in: the entry numbered NNNN-1 must really exist. The manifest here is FABRICATED (truncated to the
 * baseline, then fixture migrations appended), so the example bump is renumbered to follow it.
 * Without this the fixture's number would silently depend on how many migrations the payload ships.
 */
function renumberExampleBump(dir, manifest) {
  const bumpDir = at(dir, 'examples/example-project/bump');
  const bump = readJson(path.join(bumpDir, 'bump.json'));
  if (!bump || typeof bump.migration !== 'string') return;
  const slug = bump.migration.replace(/^\d+_/, '');
  const nextId = `${String(manifest.length + 1).padStart(4, '0')}_${slug}`;
  if (nextId === bump.migration) return;
  fs.renameSync(path.join(bumpDir, bump.migration), path.join(bumpDir, nextId));
  const ops = readJson(path.join(bumpDir, nextId, 'ops.json'));
  ops.migration = nextId;
  writeJson(path.join(bumpDir, nextId, 'ops.json'), ops);
  bump.migration = nextId;
  writeJson(path.join(bumpDir, 'bump.json'), bump);
}

// The payload every project here is INSTALLED from: the shipped plugin at its baseline migration.
// `install()` and `update()` default to it, so "an already-current project" means current against
// this baseline - a stable statement that does not move when the payload ships a new migration.
const BASE = makePayload('base', { version: BASELINE.targetPluginVersion, migrations: [] });

// The payload every "real upgrade" case runs against: 0.2.0, one migration, all four op types, and
// templates + ruleset that really changed.
const P020 = makePayload('020', {
  version: '0.2.0',
  migrations: [{ id: '0002_fixture', version: '0.2.0', ops: ALL_OPS }],
  tweak: (dir) => { addExampleToggleToSchema(dir); changeTemplates(dir); changeRuleset(dir); },
});

// ONE record for five operations. The two `rerender-managed-region` operations need no record at
// all: the projects built here never edit those artifacts, so the payload change is applied without
// a dialog. Keeping take-new records for them would have hidden exactly the regression this suite
// now watches for - a run that asks about content that is not the operator's.
const FULL_RESOLUTIONS = {
  '0002_fixture/0/enforcement.exampleToggle': { kind: 'answer', value: false },
};
function resolutionFile(name, table) {
  const p = path.join(tmpRoot, `resolutions-${name}.json`);
  writeJson(p, table);
  return p;
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
  const a = update(p, ['--apply']);
  check('--apply exits 0', a.status === 0, why(a));
  check('--apply says "already current"', a.out.includes('already current'));
  check('--apply wrote nothing at all (byte for byte)', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
  check('no CHANGES report was invented', !exists(at(p, 'CHANGES_0.1.0-to-0.1.0.md')));
}

// ---------------------------------------------------------------------------
section('2 - a real 0.1.0 -> 0.2.0 upgrade: all four op types, bookkeeping, CHANGES, self-check');
const upgraded = project('upgrade');
{
  check('install at 0.1.0 exits 0', install(upgraded).status === 0);
  const ownedBefore = bookkeeping(upgraded).ownedAskRules || [];
  check('the fixture precondition holds: setup owns the rule the new ruleset drops', ownedBefore.includes(DROPPED_ASK_RULE));

  const c = update(upgraded, ['--check'], { payload: P020 });
  check('--check against the newer payload exits 1', c.status === 1, why(c));
  check('--check names the pending migration', c.out.includes('0002_fixture'), why(c));

  const r = update(upgraded, ['--apply', '--resolution-file', resolutionFile('full', FULL_RESOLUTIONS)], { payload: P020 });
  check('--apply exits 0', r.status === 0, why(r));

  const cfg = readJson(at(upgraded, CONFIG_REL)) || {};
  const bk = cfg._aiwf || {};
  check('the version stamps moved together', bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_fixture',
    `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
  check('the journal is cleared', bk.migrationJournal === null);
  check('add-config-key wrote the OPERATOR answer, not the default', cfg.enforcement.exampleToggle === false, JSON.stringify(cfg.enforcement));
  check('the re-rendered region really changed in the project', (read(at(upgraded, 'CLAUDE.md')) || '').includes('## Your role (v2)'));
  check('text OUTSIDE the markers was preserved', (read(at(upgraded, 'CLAUDE.md')) || '').includes('<!-- END aiwf-core -->'));
  check('the whole-file artifact was re-rendered', (read(at(upgraded, WRITER_REL)) || '').includes('A line the next payload version added.'));
  check('the new ask rule was added', askRules(upgraded).includes(NEW_ASK_RULE));
  check('the owned rule dropped from the desired set was removed', !askRules(upgraded).includes(DROPPED_ASK_RULE));
  check('and it left ownedAskRules too', !(bk.ownedAskRules || []).includes(DROPPED_ASK_RULE));
  check('the newly added rule became owned', (bk.ownedAskRules || []).includes(NEW_ASK_RULE));

  const region = bk.managedRegions['CLAUDE.md#aiwf-core'] || {};
  check('take-new restamped upstream == local, override false', region.upstream === region.local && region.override === false,
    `${String(region.upstream).slice(0, 8)} / ${String(region.local).slice(0, 8)} / ${region.override}`);

  const changes = read(at(upgraded, 'CHANGES_0.1.0-to-0.2.0.md'));
  check('the CHANGES report was written at the project root', changes !== null);
  check('it carries the note text and its docRefs', !!changes && changes.includes('fixture-note') && changes.includes('docs/LOOP.md#commit-gate'));
  check('it lists the applied operations per migration', !!changes && changes.includes('### 0002_fixture'));
  check('nothing was staged and left behind', !exists(at(upgraded, STAGE_REL)));

  const sc = spawnSync(process.execPath, [
    path.join(P020, 'scripts', 'selfcheck', 'aiwf-selfcheck.js'), '--plugin-root', P020, '--project-fixture', upgraded,
  ], { encoding: 'utf8' });
  check('the self-check passes against the updated project (exit 0)', sc.status === 0,
    sc.status === 0 ? '' : '\n' + (sc.stdout || '').trim().split('\n').slice(-14).join('\n'));
}
{
  // Blocker-1: a FRESH install from the 0.2.0 payload must stamp the LAST manifest entry, not a
  // constant. A hardcoded '0001_initial' here would break the very first update of that project.
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
section('4 - the conflict matrix: no branch mutates the target, and every run resumes');
{
  // A migration whose FIRST operation applies cleanly, so every conflict below can be checked for
  // "the operations before it survived".
  const conflictOps = (rerender) => [
    { op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: false },
    rerender,
    FIXTURE_NOTE,
  ];
  const REGION_OP = { op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/CLAUDE.md.tmpl#aiwf-core' };
  const FILE_OP = { op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' };

  // Two payloads: one whose templates CHANGED (upstream predicate) and one whose templates did not.
  const upstreamPayload = (name, rerender) => makePayload(name, {
    version: '0.2.0', migrations: [{ id: '0002_conflict', version: '0.2.0', ops: conflictOps(rerender) }],
    tweak: (dir) => { addExampleToggleToSchema(dir); changeTemplates(dir); },
  });
  const samePayload = (name, rerender) => makePayload(name, {
    version: '0.2.0', migrations: [{ id: '0002_conflict', version: '0.2.0', ops: conflictOps(rerender) }],
    tweak: (dir) => { addExampleToggleToSchema(dir); },
  });

  const editRegion = (dir) => patch(at(dir, 'CLAUDE.md'), 'You are the **Orchestrator / COO**', 'You are the **Orchestrator / COO** (I edited this)');
  const editFile = (dir) => fs.appendFileSync(at(dir, WRITER_REL), '\nMy own note in the agent file.\n', 'utf8');

  const cases = [
    { name: 'edited-only, whole file', payload: samePayload('edit-file', FILE_OP), mutate: editFile, key: WRITER_REL, target: WRITER_REL },
    { name: 'edited-only, region', payload: samePayload('edit-region', REGION_OP), mutate: editRegion, key: 'CLAUDE.md#aiwf-core', target: 'CLAUDE.md' },
    // The two SILENT cases: the payload moved and the operator never touched the artifact. There is
    // nothing of theirs to lose, so there is no question to ask - and no resolution file is passed,
    // which is what makes "exit 0" a proof rather than a claim: a run that needed a decision here
    // would have nobody to ask and would stop with exit 1 naming the address.
    { name: 'upstream-only, whole file', payload: upstreamPayload('up-file', FILE_OP), mutate: null, key: WRITER_REL, target: WRITER_REL, silent: 'A line the next payload version added.' },
    { name: 'upstream-only, region', payload: upstreamPayload('up-region', REGION_OP), mutate: null, key: 'CLAUDE.md#aiwf-core', target: 'CLAUDE.md', silent: '## Your role (v2)' },
    { name: 'both, whole file', payload: upstreamPayload('both-file', FILE_OP), mutate: editFile, key: WRITER_REL, target: WRITER_REL },
    { name: 'both, region', payload: upstreamPayload('both-region', REGION_OP), mutate: editRegion, key: 'CLAUDE.md#aiwf-core', target: 'CLAUDE.md' },
    { name: 'the file is GONE', payload: upstreamPayload('gone-file', FILE_OP), mutate: (d) => fs.rmSync(at(d, WRITER_REL)), key: WRITER_REL, target: WRITER_REL, gone: true },
    {
      name: 'the region is GONE',
      payload: upstreamPayload('gone-region', REGION_OP),
      mutate: (d) => {
        const text = read(at(d, 'CLAUDE.md'));
        const from = text.indexOf('<!-- BEGIN aiwf-core -->');
        const to = text.indexOf('<!-- END aiwf-core -->') + '<!-- END aiwf-core -->'.length;
        fs.writeFileSync(at(d, 'CLAUDE.md'), text.slice(0, from) + '(the operator removed the managed region)' + text.slice(to), 'utf8');
      },
      key: 'CLAUDE.md#aiwf-core', target: 'CLAUDE.md', gone: true,
    },
  ];

  for (const c of cases) {
    const p = project(`conflict-${c.name.replace(/[^a-z]+/gi, '-')}`);
    install(p);
    if (c.mutate) c.mutate(p);
    const targetBefore = read(at(p, c.target));
    const before = snapshot(p);
    const r = update(p, ['--apply'], { payload: c.payload });

    if (c.silent) {
      check(`${c.name}: COMPLETES with exit 0 - no dialog, no resolution file, nothing to lose`, r.status === 0, why(r));
      check(`${c.name}: the run said why it did not ask`,
        r.out.includes(`${c.key}: the payload version applied (you had not edited it)`), why(r));
      check(`${c.name}: the payload render really landed in the project`,
        (read(at(p, c.target)) || '').includes(c.silent) && read(at(p, c.target)) !== targetBefore);
      const entry = bookkeeping(p).managedRegions[c.key] || {};
      check(`${c.name}: bookkeeping is a plain take-new - upstream == local, override false`,
        entry.override === false && typeof entry.local === 'string' && entry.local === entry.upstream,
        JSON.stringify(entry).slice(0, 120));
      check(`${c.name}: the journal is cleared and the version stamps moved`,
        bookkeeping(p).migrationJournal === null && bookkeeping(p).installedPluginVersion === '0.2.0');
      check(`${c.name}: nothing was left in the stage`, !exists(at(p, STAGE_REL)));
      const changes = read(at(p, 'CHANGES_0.1.0-to-0.2.0.md')) || '';
      check(`${c.name}: CHANGES labels it payload-current`,
        changes.includes(`\`rerender-managed-region\` ${c.key} - payload-current`),
        changes.split('\n').filter((l) => l.includes('rerender-managed-region')).join(' | '));
      continue;
    }

    check(`${c.name}: STOPS with exit 1`, r.status === 1, why(r));
    check(`${c.name}: the message names the address`, r.out.includes(`0002_conflict/1/${c.key}`), why(r));
    check(`${c.name}: the conflicting target was NOT mutated`, read(at(p, c.target)) === targetBefore);
    check(`${c.name}: the earlier operation survived (config key applied, journal says so)`,
      (readJson(at(p, CONFIG_REL)) || {}).enforcement.exampleToggle === true
      && (bookkeeping(p).migrationJournal || {}).opIndex === 0);
    check(`${c.name}: only the config was touched by the operations that did apply`,
      diffSnapshots(before, snapshot(p)).join(',') === CONFIG_REL, diffSnapshots(before, snapshot(p)).join(', '));

    // ... and the run resumes from exactly where it stopped.
    const table = c.gone
      ? { [`0002_conflict/1/${c.key}`]: { kind: 'conflict', resolution: 'take-new' } }
      : { [`0002_conflict/1/${c.key}`]: { kind: 'conflict', resolution: 'keep-mine' } };
    const again = update(p, ['--apply', '--resolution-file', resolutionFile(`resume-${seq}`, table)], { payload: c.payload });
    check(`${c.name}: resolving it lets the run finish`, again.status === 0, why(again));
    check(`${c.name}: the version stamps moved`, bookkeeping(p).installedPluginVersion === '0.2.0');
    check(`${c.name}: nothing was left in the stage`, !exists(at(p, STAGE_REL)));
    if (!c.gone) {
      check(`${c.name}: keep-mine applied NOTHING and set override`,
        read(at(p, c.target)) === targetBefore && (bookkeeping(p).managedRegions[c.key] || {}).override === true);
    } else {
      check(`${c.name}: take-new put the payload version back`, read(at(p, c.target)) !== targetBefore
        && (bookkeeping(p).managedRegions[c.key] || {}).override === false);
    }
  }
}
{
  // The third resolution, with a real hand-merged file. The artifact is edited first: merge is an
  // answer to "your content and the payload's disagree", and without an edit of the operator's there
  // is no disagreement and no dialog to answer.
  const p = project('conflict-merge');
  install(p);
  fs.appendFileSync(at(p, WRITER_REL), '\nMy own note in the agent file.\n', 'utf8');
  const payload = makePayload('merge', {
    version: '0.2.0',
    migrations: [{ id: '0002_conflict', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] }],
    tweak: (dir) => { changeTemplates(dir); },
  });
  const merged = path.join(tmpRoot, 'merged-writer.md');
  fs.writeFileSync(merged, (read(at(p, WRITER_REL)) || '') + '\nMerged by hand: both versions reconciled.\n', 'utf8');
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('merge', {
    [`0002_conflict/0/${WRITER_REL}`]: { kind: 'conflict', resolution: 'merge', mergedFile: merged },
  })], { payload });
  check('merge: the run completes', r.status === 0, why(r));
  check('merge: the merged content is what landed', (read(at(p, WRITER_REL)) || '').includes('Merged by hand: both versions reconciled.'));
  const entry = bookkeeping(p).managedRegions[WRITER_REL] || {};
  check('merge: local describes the merged content, upstream the payload render, override true',
    entry.override === true && entry.local !== entry.upstream, JSON.stringify(entry).slice(0, 120));

  // An override SURVIVES a later payload change: the artifact is untouched and CHANGES reports it.
  const payload030 = makePayload('030', {
    version: '0.3.0',
    migrations: [
      { id: '0002_conflict', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] },
      { id: '0003_more', version: '0.3.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] },
    ],
    tweak: (dir) => { changeTemplates(dir); fs.appendFileSync(at(dir, 'templates/agents/writer.md.tmpl'), '\nAnd one more line in 0.3.0.\n', 'utf8'); },
  });
  const held = read(at(p, WRITER_REL));
  const r2 = update(p, ['--apply'], { payload: payload030 });
  check('override survival: the later update needs NO dialog for the held artifact', r2.status === 0, why(r2));
  check('override survival: and it says exactly what it did - recorded, not applied',
    r2.out.includes(`${WRITER_REL} is held by you (override) - the new render was recorded as upstream, not applied`), why(r2));
  check('override survival: the artifact is byte-identical', read(at(p, WRITER_REL)) === held);
  const entry2 = bookkeeping(p).managedRegions[WRITER_REL] || {};
  check('override survival: upstream moved, local did not, override still true',
    entry2.override === true && entry2.local === entry.local && entry2.upstream !== entry.upstream);
  const changes = read(at(p, 'CHANGES_0.2.0-to-0.3.0.md')) || '';
  check('override survival: CHANGES reports the held artifact', changes.includes('Held by you') && changes.includes(WRITER_REL));
  check('override survival: and labels the merged, held artifact `held (your version kept)`',
    changes.includes(`\`rerender-managed-region\` ${WRITER_REL} - held (your version kept)`),
    changes.split('\n').filter((l) => l.includes('rerender-managed-region')).join(' | '));

  // (a) HELD AND EDITED AGAIN is the one held case that still asks. The operator's content is at
  // stake twice over, so it is never applied over - and nothing is written while the run stops.
  fs.appendFileSync(at(p, WRITER_REL), '\nAnd another line of mine, after the hold.\n', 'utf8');
  const mineAgain = read(at(p, WRITER_REL));
  const payload040 = makePayload('040', {
    version: '0.4.0',
    migrations: [
      { id: '0002_conflict', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] },
      { id: '0003_more', version: '0.3.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] },
      { id: '0004_yet-more', version: '0.4.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] },
    ],
    tweak: (dir) => {
      changeTemplates(dir);
      fs.appendFileSync(at(dir, 'templates/agents/writer.md.tmpl'), '\nAnd one more line in 0.3.0.\n\nAnd another in 0.4.0.\n', 'utf8');
    },
  });
  const r3 = update(p, ['--apply'], { payload: payload040 });
  check('held AND edited again: the run STOPS and asks (exit 1)', r3.status === 1, why(r3));
  check('held AND edited again: the message names the address', r3.out.includes(`0004_yet-more/0/${WRITER_REL}`), why(r3));
  check('held AND edited again: the operator content is untouched', read(at(p, WRITER_REL)) === mineAgain);
  check('held AND edited again: the artifact is still held, with the local hash it had',
    (bookkeeping(p).managedRegions[WRITER_REL] || {}).override === true);
}
{
  // (d) The report's two labels, on the four outcomes bookkeeping can tell apart. Operator take-new
  // and "already current" both end at `override:false` and are therefore ONE label - that is the
  // stated boundary of the report, not an oversight.
  const p = project('changes-labels');
  install(p);
  // The region is edited by hand: a real conflict, resolved take-new by the operator. The whole-file
  // artifact is left alone: applied without a dialog. Both must end up `payload-current`.
  patch(at(p, 'CLAUDE.md'), 'You are the **Orchestrator / COO**', 'You are the **Orchestrator / COO** (mine)');
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('labels', {
    ...FULL_RESOLUTIONS,
    '0002_fixture/1/CLAUDE.md#aiwf-core': { kind: 'conflict', resolution: 'take-new' },
  })], { payload: P020 });
  check('labels: the run completes', r.status === 0, why(r));
  const changes = read(at(p, 'CHANGES_0.1.0-to-0.2.0.md')) || '';
  const lines = changes.split('\n').filter((l) => l.includes('rerender-managed-region')).join(' | ');
  check('labels: an operator take-new is `payload-current`',
    changes.includes('`rerender-managed-region` CLAUDE.md#aiwf-core - payload-current'), lines);
  check('labels: a silent take-new is `payload-current` too - the report describes the END STATE, not who decided it',
    changes.includes(`\`rerender-managed-region\` ${WRITER_REL} - payload-current`), lines);
  check('labels: the header says in one sentence what was applied without a dialog and what was not',
    changes.includes('An unheld artifact you had not edited, whose payload render changed, was applied without a dialog; edited ones were asked about; held ones were recorded, not applied.'),
    changes.split('\n').slice(0, 8).join(' | '));

  // An "already current" artifact - a later migration that re-renders an unchanged template - is the
  // same label: nothing distinguishes it in the bookkeeping, and the report never invents what the
  // bookkeeping does not know.
  const payload030 = makePayload('labels-030', {
    version: '0.3.0',
    migrations: [
      { id: '0002_fixture', version: '0.2.0', ops: ALL_OPS },
      { id: '0003_current', version: '0.3.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] },
    ],
    tweak: (dir) => { addExampleToggleToSchema(dir); changeTemplates(dir); changeRuleset(dir); },
  });
  const r2 = update(p, ['--apply'], { payload: payload030 });
  check('labels: a re-render of an artifact nothing changed completes with no dialog', r2.status === 0, why(r2));
  check('labels: and the engine calls it already current', r2.out.includes('already current (neither the project nor the payload changed it)'), why(r2));
  const changes2 = read(at(p, 'CHANGES_0.2.0-to-0.3.0.md')) || '';
  check('labels: an already-current artifact is `payload-current` as well',
    changes2.includes(`\`rerender-managed-region\` ${WRITER_REL} - payload-current`),
    changes2.split('\n').filter((l) => l.includes('rerender-managed-region')).join(' | '));
}
{
  // ... and keep-mine, the other half of the label pair, on its own.
  const p = project('changes-labels-held');
  install(p);
  patch(at(p, 'CLAUDE.md'), 'You are the **Orchestrator / COO**', 'You are the **Orchestrator / COO** (mine)');
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('labels-held', {
    ...FULL_RESOLUTIONS,
    '0002_fixture/1/CLAUDE.md#aiwf-core': { kind: 'conflict', resolution: 'keep-mine' },
  })], { payload: P020 });
  check('labels: the keep-mine run completes', r.status === 0, why(r));
  const changes = read(at(p, 'CHANGES_0.1.0-to-0.2.0.md')) || '';
  check('labels: keep-mine is `held (your version kept)`',
    changes.includes('`rerender-managed-region` CLAUDE.md#aiwf-core - held (your version kept)'),
    changes.split('\n').filter((l) => l.includes('rerender-managed-region')).join(' | '));
  check('labels: the operator content is what is on disk', (read(at(p, 'CLAUDE.md')) || '').includes('(mine)'));
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
  check(`update entrypoint: ${name} -> the earlier operation survived and the run is resumable`,
    (bookkeeping(p).migrationJournal || {}).opIndex === 0 && (bookkeeping(p).migrationJournal || {}).state === 'applied');
  // Repair the shape and the very same run finishes.
  writeJson(at(p, SETTINGS_REL), { permissions: { ask: [] }, hooks: {} });
  const again = update(p, ['--apply'], { payload });
  check(`update entrypoint: ${name} -> after repair the run resumes and completes`, again.status === 0, why(again));
}

// ---------------------------------------------------------------------------
section('6 - --resolve reopens ONE artifact, outside any version bump');
{
  const p = project('resolve');
  install(p);
  const mine = (read(at(p, WRITER_REL)) || '') + '\nMy own note.\n';
  fs.writeFileSync(at(p, WRITER_REL), mine, 'utf8');
  const payload = makePayload('resolve-020', {
    version: '0.2.0',
    migrations: [{ id: '0002_hold', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] }],
  });
  const held = update(p, ['--apply', '--resolution-file', resolutionFile('hold', {
    [`0002_hold/0/${WRITER_REL}`]: { kind: 'conflict', resolution: 'keep-mine' },
  })], { payload });
  check('keep-mine created the override', held.status === 0 && (bookkeeping(p).managedRegions[WRITER_REL] || {}).override === true, why(held));
  check('and the operator content is intact', read(at(p, WRITER_REL)) === mine);

  // A "keep" resolution changes nothing at all...
  const beforeKeep = snapshot(p);
  const keep = update(p, ['--resolve', WRITER_REL, '--resolution-file', resolutionFile('resolve-keep', {
    [WRITER_REL]: { kind: 'conflict', resolution: 'keep-mine' },
  })], { payload });
  check('--resolve with keep-mine exits 0', keep.status === 0, why(keep));
  check('--resolve with keep-mine applied nothing and left the bookkeeping alone',
    diffSnapshots(beforeKeep, snapshot(p)).length === 0, diffSnapshots(beforeKeep, snapshot(p)).join(', '));

  // ... and take-new is the way OUT of the override, with no version bump involved.
  const out = update(p, ['--resolve', WRITER_REL, '--resolution-file', resolutionFile('resolve-take', {
    [WRITER_REL]: { kind: 'conflict', resolution: 'take-new' },
  })], { payload });
  check('--resolve with take-new exits 0', out.status === 0, why(out));
  check('--resolve with take-new applied the payload render', !(read(at(p, WRITER_REL)) || '').includes('My own note.'));
  const entry = bookkeeping(p).managedRegions[WRITER_REL] || {};
  check('--resolve with take-new leaves local == upstream == hash(render), override false',
    entry.local === entry.upstream && entry.override === false, JSON.stringify(entry).slice(0, 120));
  check('--resolve did not move the version stamps', bookkeeping(p).installedPluginVersion === '0.2.0');

  const unknown = update(p, ['--resolve', 'docs/not-managed.md', '--resolution-file', resolutionFile('resolve-unknown', {})], { payload });
  check('--resolve on a key that is not a managed artifact stops with exit 1', unknown.status === 1, why(unknown));
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
    ['an orphan migration directory', (dir) => { fs.mkdirSync(at(dir, 'migrations/0009_orphan'), { recursive: true }); writeJson(at(dir, 'migrations/0009_orphan/ops.json'), { migration: '0009_orphan', targetPluginVersion: '0.9.0', operations: [] }); fs.writeFileSync(at(dir, 'migrations/0009_orphan/NOTES.md'), '# orphan\n'); }],
    ['a file path that escapes the project', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: '../outside.md', region: null, template: 'templates/roles.json.tmpl' }]; })],
    ['an absolute file path', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: 'C:/Windows/system.ini', region: null, template: 'templates/roles.json.tmpl' }]; })],
    ['a template reference outside templates/', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'docs/WORKFLOW.md' }]; })],
    ['a template reference that does not exist', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/nowhere.tmpl' }]; })],
    ['an add-config-key aimed at the bookkeeping', (dir) => patchOps(dir, '0002_fixture', (o) => { o.operations = [{ op: 'add-config-key', path: '_aiwf.installedPluginVersion', default: '9.9.9', askOperator: false }]; })],
    ['a missing NOTES.md', (dir) => fs.rmSync(at(dir, 'migrations/0002_fixture/NOTES.md'))],
    // The template FILE exists; the region inside it does not. Without checking the marker pair this
    // reference resolves to nothing - halfway through a migration.
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
function patchOps(dir, id, mutate) {
  const file = at(dir, `migrations/${id}/ops.json`);
  const json = readJson(file);
  mutate(json);
  writeJson(file, json);
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

  // A wrong-kind record is refused rather than coerced.
  const p3 = project('config-key-wrongkind');
  install(p3);
  const wrong = update(p3, ['--apply', '--resolution-file', resolutionFile('wrongkind', {
    '0002_key/0/enforcement.exampleToggle': { kind: 'conflict', resolution: 'take-new' },
  })], { payload });
  check('a conflict record where an answer is due stops with exit 1', wrong.status === 1, why(wrong));
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
  check('and nothing was written', diffSnapshots(before, snapshot(p7)).length === 0, diffSnapshots(before, snapshot(p7)).join(', '));
}

// ---------------------------------------------------------------------------
section('9 - crash at every write boundary, resumed by a FRESH process');
{
  const BOUNDARIES = ['after-journal-prepared', 'after-target-apply', 'after-applied-flip'];
  const ADDRESS_OF = ['0002_fixture/0/enforcement.exampleToggle', '0002_fixture/1/CLAUDE.md#aiwf-core', `0002_fixture/2/${WRITER_REL}`];
  // opIndex 0 is a CONFIG-target operation (the projection hashing), 1 a region, 2 a whole file.
  for (const opIndex of [0, 1, 2]) {
    for (const boundary of BOUNDARIES) {
      const p = project(`crash-${opIndex}-${boundary}`);
      install(p);
      const table = resolutionFile(`crash-${seq}`, FULL_RESOLUTIONS);
      const crashed = update(p, ['--apply', '--resolution-file', table], {
        payload: P020, env: { PNP_UPDATE_CRASH_AT: `0002_fixture/${opIndex}/${boundary}` },
      });
      check(`op ${opIndex} @ ${boundary}: the child really died with exit 86`, crashed.status === 86, why(crashed));
      const journal = bookkeeping(p).migrationJournal || {};
      check(`op ${opIndex} @ ${boundary}: the journal describes exactly that operation`,
        journal.migration === '0002_fixture' && journal.opIndex === opIndex, JSON.stringify(journal).slice(0, 120));

      // The resume gets a resolution file with the CRASHED operation's address REMOVED: asking THIS
      // one again would stop the run with exit 1 naming exactly the address that is missing. For
      // opIndex 1 and 2 the removal is a no-op, because those two artifacts are unedited here and
      // are re-rendered without any dialog at all - which makes their resume a stronger statement,
      // not a weaker one: there is no record for them anywhere.
      const rest = { ...FULL_RESOLUTIONS };
      delete rest[ADDRESS_OF[opIndex]];
      const resumed = update(p, ['--apply', '--resolution-file', resolutionFile(`resume-crash-${seq}-${opIndex}-${boundary}`, rest)], { payload: P020 });
      check(`op ${opIndex} @ ${boundary}: a fresh process resumes to the end without re-asking`, resumed.status === 0, why(resumed));
      const bk = bookkeeping(p);
      check(`op ${opIndex} @ ${boundary}: the end state is correct`,
        bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_fixture' && bk.migrationJournal === null);
      check(`op ${opIndex} @ ${boundary}: the operator's answer survived the crash`,
        (readJson(at(p, CONFIG_REL)) || {}).enforcement.exampleToggle === false);
      check(`op ${opIndex} @ ${boundary}: the re-rendered artifacts are in place`,
        (read(at(p, 'CLAUDE.md')) || '').includes('## Your role (v2)') && (read(at(p, WRITER_REL)) || '').includes('A line the next payload version added.'));
      check(`op ${opIndex} @ ${boundary}: no stage material is left behind`, !exists(at(p, STAGE_REL)));
    }
  }
}
{
  // The SILENT branch, crashed at its own write boundary. No resolution file exists anywhere in this
  // case - not in the crashing run, not in the resume - so a run that had to ask about anything
  // would stop with exit 1. And the report a resumed run writes must be the report a single-process
  // run would have written: it is assembled from the pending operations and the FINAL bookkeeping,
  // never from what this particular process happened to apply.
  const p = project('crash-silent');
  install(p);
  const payload = makePayload('crash-silent-payload', {
    version: '0.2.0',
    migrations: [{
      id: '0002_silent',
      version: '0.2.0',
      ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }, FIXTURE_NOTE],
    }],
    tweak: changeTemplates,
  });
  const crashed = update(p, ['--apply'], { payload, env: { PNP_UPDATE_CRASH_AT: '0002_silent/0/after-target-apply' } });
  check('silent branch: the child died with exit 86 at the target write', crashed.status === 86, why(crashed));
  const journal = bookkeeping(p).migrationJournal || {};
  check('silent branch: the journal is prepared on exactly that operation',
    journal.migration === '0002_silent' && journal.opIndex === 0 && journal.state === 'prepared', JSON.stringify(journal).slice(0, 140));
  const resumed = update(p, ['--apply'], { payload });
  check('silent branch: a fresh process resumes to the end with no resolution file at all', resumed.status === 0, why(resumed));
  check('silent branch: nothing was asked - the dialog address never appears in the output',
    !resumed.out.includes(`0002_silent/0/${WRITER_REL}`) && !resumed.out.includes('CONFLICT'), why(resumed));
  const entry = bookkeeping(p).managedRegions[WRITER_REL] || {};
  check('silent branch: the end bookkeeping is a plain take-new',
    entry.override === false && entry.local === entry.upstream, JSON.stringify(entry).slice(0, 120));
  check('silent branch: the payload render is what is on disk',
    (read(at(p, WRITER_REL)) || '').includes('A line the next payload version added.'));
  const changes = read(at(p, 'CHANGES_0.1.0-to-0.2.0.md')) || '';
  check('silent branch: the report written after a RESUME carries the same payload-current label a one-process run writes',
    changes.includes(`\`rerender-managed-region\` ${WRITER_REL} - payload-current`),
    changes.split('\n').filter((l) => l.includes('rerender-managed-region')).join(' | '));
  check('silent branch: and the report says in one sentence why nothing was asked',
    changes.includes('An unheld artifact you had not edited, whose payload render changed, was applied without a dialog; edited ones were asked about; held ones were recorded, not applied.'));
}
{
  // A manual merge, crashed after the journal was prepared: the resume must replay the STAGED merged
  // content - it cannot ask again, because the resume gets no resolution file at all.
  const p = project('crash-merge');
  install(p);
  // Edited first, for the same reason as the merge case above: a merge resolves a real disagreement.
  fs.appendFileSync(at(p, WRITER_REL), '\nMy own line in the agent file.\n', 'utf8');
  const payload = makePayload('crash-merge-payload', {
    version: '0.2.0',
    migrations: [{ id: '0002_merge', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] }],
    tweak: changeTemplates,
  });
  const merged = path.join(tmpRoot, 'merged-crash.md');
  fs.writeFileSync(merged, (read(at(p, WRITER_REL)) || '') + '\nHand-merged content that must survive a crash.\n', 'utf8');
  const table = resolutionFile('crash-merge', { [`0002_merge/0/${WRITER_REL}`]: { kind: 'conflict', resolution: 'merge', mergedFile: merged } });
  const crashed = update(p, ['--apply', '--resolution-file', table], { payload, env: { PNP_UPDATE_CRASH_AT: '0002_merge/0/after-journal-prepared' } });
  check('manual merge: the child died with exit 86 before the target was written', crashed.status === 86, why(crashed));
  check('manual merge: the target is still the pre-merge content', !(read(at(p, WRITER_REL)) || '').includes('Hand-merged content'));
  fs.rmSync(merged); // even the merged file is gone - only the STAGE can carry the answer now
  const resumed = update(p, ['--apply'], { payload });
  check('manual merge: a fresh process replays the staged merge without asking again', resumed.status === 0, why(resumed));
  check('manual merge: the hand-merged content is what landed', (read(at(p, WRITER_REL)) || '').includes('Hand-merged content that must survive a crash.'));
  const entry = bookkeeping(p).managedRegions[WRITER_REL] || {};
  check('manual merge: the bookkeeping records a held merge', entry.override === true && entry.local !== entry.upstream);
  check('manual merge: no stage material is left behind', !exists(at(p, STAGE_REL)));
}
{
  // The last boundary of the last operation: the applied-flip landed, the final version write did not.
  const p = project('crash-final');
  install(p);
  const payload = makePayload('crash-final-payload', {
    version: '0.2.0', migrations: [{ id: '0002_final', version: '0.2.0', ops: [FIXTURE_NOTE] }],
  });
  const crashed = update(p, ['--apply'], { payload, env: { PNP_UPDATE_CRASH_AT: '0002_final/0/after-applied-flip' } });
  check('final flip: the child died with exit 86', crashed.status === 86, why(crashed));
  const bk = bookkeeping(p);
  check('final flip: the version stamps had NOT moved yet', bk.installedPluginVersion === '0.1.0' && (bk.migrationJournal || {}).state === 'applied');
  const resumed = update(p, ['--apply'], { payload });
  check('final flip: a fresh process finishes the version write', resumed.status === 0, why(resumed));
  const bk2 = bookkeeping(p);
  check('final flip: the end state is correct', bk2.installedPluginVersion === '0.2.0' && bk2.lastMigrationApplied === '0002_final' && bk2.migrationJournal === null);
  check('final flip: the CHANGES report is there', exists(at(p, 'CHANGES_0.1.0-to-0.2.0.md')));
}

// ---------------------------------------------------------------------------
section('10 - a dry run writes nothing, and preflight refuses an incoherent project');
{
  const p = project('dryrun');
  install(p);
  const before = snapshot(p);
  const clean = update(p, ['--dry-run', '--resolution-file', resolutionFile('dry', FULL_RESOLUTIONS)], { payload: P020 });
  check('--dry-run with resolutions exits 0', clean.status === 0, why(clean));
  check('--dry-run lists every planned operation', (clean.out.match(/0002_fixture\[\d\]/g) || []).length === ALL_OPS.length, why(clean));
  check('--dry-run wrote NOTHING (byte for byte)', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));

  // The first DECISION of this fixture is operation 0 - the config key that asks a question
  // (`askOperator: true`). It is not "the first rerender": the two rerender operations here need no
  // decision at all, and a dry run walks straight past them.
  const stopped = update(p, ['--dry-run'], { payload: P020 });
  check('--dry-run without resolutions stops at the first decision - the config key that asks (exit 1)', stopped.status === 1, why(stopped));
  check('and it names that address, not a rerender', stopped.out.includes('0002_fixture/0/enforcement.exampleToggle'), why(stopped));
  check('--dry-run never prompts, and says so', stopped.out.includes('never prompts'), why(stopped));
  check('--dry-run still wrote nothing', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
}
{
  // A migration with nothing to ask about: no answer op, no edited artifact. A dry run over it needs
  // no resolution file, exits 0, and previews the line it would apply - saying WHY it will not ask.
  const p = project('dryrun-clean');
  install(p);
  const payload = makePayload('dryrun-clean-payload', {
    version: '0.2.0',
    migrations: [{
      id: '0002_clean',
      version: '0.2.0',
      ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }],
    }],
    tweak: changeTemplates,
  });
  const before = snapshot(p);
  const r = update(p, ['--dry-run'], { payload });
  check('a dry run over an unedited artifact needs no resolution file and exits 0', r.status === 0, why(r));
  check('and it previews the apply, saying why it will not ask',
    r.out.includes(`${WRITER_REL}: the payload version applied (you had not edited it)`), why(r));
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
  const p = project('mismatch');
  install(p);
  const cfg = readJson(at(p, CONFIG_REL));
  cfg._aiwf.installedPluginVersion = '0.1.4';
  writeJson(at(p, CONFIG_REL), cfg);
  const r = update(p, ['--apply'], { payload: P020 });
  check('a version stamp disagreeing with the manifest stops with exit 1', r.status === 1, why(r));
  check('the message names both stamps', r.out.includes('0.1.4') && r.out.includes('0001_initial'), why(r));
}
{
  const p = project('downgrade');
  install(p, { payload: P020 });
  // BASE is not "the shipped 0.1.0 payload": it is the CURRENT payload tree truncated to the
  // baseline migration and stamped with that migration's target version. Offering it to a 0.2.0
  // project is the downgrade under test.
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
}

// ---------------------------------------------------------------------------
section('11 - the recovery state machine has no dead ends, and no decision is applied to a state it never saw');
{
  // BLOCKER 1: an interrupted operation whose target MOVED while the process was down is a conflict,
  // and it is resolved through the same dialog every other conflict goes through.
  const REGION_ADDRESS = '0002_fixture/1/CLAUDE.md#aiwf-core';
  const scenario = (name) => {
    const p = project(`moved-${name}`);
    install(p);
    const crashed = update(p, ['--apply', '--resolution-file', resolutionFile(`moved-${seq}`, FULL_RESOLUTIONS)], {
      payload: P020, env: { PNP_UPDATE_CRASH_AT: '0002_fixture/1/after-journal-prepared' },
    });
    check(`${name}: the child died at the region operation (exit 86)`, crashed.status === 86, why(crashed));
    // Somebody edits the interrupted target while the update is down.
    patch(at(p, 'CLAUDE.md'), 'You are the **Orchestrator / COO**', 'You are the **Orchestrator / COO** (edited while the update was down)');
    return p;
  };
  {
    const p = scenario('no-record');
    const rest = { ...FULL_RESOLUTIONS };
    delete rest[REGION_ADDRESS];
    const before = snapshot(p);
    const r = update(p, ['--apply', '--resolution-file', resolutionFile(`moved-none-${seq}`, rest)], { payload: P020 });
    check('a moved target with no resolution STOPS naming the journal address', r.status === 1 && r.out.includes(REGION_ADDRESS), why(r));
    check('and nothing was written', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
  }
  {
    const p = scenario('take-new');
    const r = update(p, ['--apply', '--resolution-file', resolutionFile(`moved-take-${seq}`, {
      ...FULL_RESOLUTIONS, [REGION_ADDRESS]: { kind: 'conflict', resolution: 'take-new' },
    })], { payload: P020 });
    check('resolving the moved target with take-new completes the run', r.status === 0, why(r));
    check('the payload version is what landed', (read(at(p, 'CLAUDE.md')) || '').includes('## Your role (v2)'));
    check('the operator edit outside the decision is gone (take-new is what was asked for)',
      !(read(at(p, 'CLAUDE.md')) || '').includes('edited while the update was down'));
    const entry = bookkeeping(p).managedRegions['CLAUDE.md#aiwf-core'] || {};
    check('the bookkeeping describes the applied content', entry.local === entry.upstream && entry.override === false, JSON.stringify(entry).slice(0, 110));
    check('the end state is complete', bookkeeping(p).installedPluginVersion === '0.2.0' && bookkeeping(p).migrationJournal === null);
    check('no stage material is left behind', !exists(at(p, STAGE_REL)));
  }
  {
    const p = scenario('keep-mine');
    const mine = read(at(p, 'CLAUDE.md'));
    const r = update(p, ['--apply', '--resolution-file', resolutionFile(`moved-keep-${seq}`, {
      ...FULL_RESOLUTIONS, [REGION_ADDRESS]: { kind: 'conflict', resolution: 'keep-mine' },
    })], { payload: P020 });
    check('resolving the moved target with keep-mine completes the run', r.status === 0, why(r));
    check('the file the operator changed while the update was down is untouched', read(at(p, 'CLAUDE.md')) === mine);
    const entry = bookkeeping(p).managedRegions['CLAUDE.md#aiwf-core'] || {};
    check('keep-mine on a moved target records local == what is on disk, override true',
      entry.override === true && entry.local !== entry.upstream, JSON.stringify(entry).slice(0, 110));
  }
}
{
  // BLOCKER 2: an operation that applies NOTHING still journals the artifact it makes an assertion
  // about, so a resume cannot stamp a hash for a file that changed in the meantime.
  const p = project('none-mode-identity');
  install(p);
  // Edited, so keep-mine is a real choice: an unedited artifact is applied without a dialog and
  // there would be no "applies NOTHING" operation left to journal.
  fs.appendFileSync(at(p, WRITER_REL), '\nMine, and I intend to keep it.\n', 'utf8');
  const payload = makePayload('keepmine-crash', {
    version: '0.2.0',
    migrations: [{ id: '0002_hold', version: '0.2.0', ops: [{ op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' }] }],
    tweak: changeTemplates,
  });
  const ADDRESS = `0002_hold/0/${WRITER_REL}`;
  const before = bookkeeping(p).managedRegions[WRITER_REL];
  const crashed = update(p, ['--apply', '--resolution-file', resolutionFile('keepmine-crash', { [ADDRESS]: { kind: 'conflict', resolution: 'keep-mine' } })], {
    payload, env: { PNP_UPDATE_CRASH_AT: '0002_hold/0/after-journal-prepared' },
  });
  check('keep-mine: the child died right after the journal was prepared (exit 86)', crashed.status === 86, why(crashed));
  const journal = bookkeeping(p).migrationJournal || {};
  check('keep-mine: the journal records the artifact it is about to make an assertion about',
    journal.target === WRITER_REL && journal.preHash === journal.postHash && journal.preHash !== null, JSON.stringify(journal).slice(0, 140));
  fs.appendFileSync(at(p, WRITER_REL), '\nEdited while the update was down.\n', 'utf8');
  const resumed = update(p, ['--apply'], { payload });
  check('keep-mine: a resume onto a CHANGED artifact stops instead of stamping', resumed.status === 1, why(resumed));
  check('keep-mine: it names the address', resumed.out.includes(ADDRESS), why(resumed));
  const after = bookkeeping(p).managedRegions[WRITER_REL];
  check('keep-mine: the bookkeeping was NOT stamped (no override, no new local)',
    JSON.stringify(after) === JSON.stringify(before), `${JSON.stringify(before).slice(0, 80)} -> ${JSON.stringify(after).slice(0, 80)}`);
}
{
  // BLOCKER 3: the resolver may take any amount of time, so the state is re-checked in the last
  // instruction before the first write. The gap is exercised in-process, through the real engine
  // entrypoint with a resolver that edits the file before answering - which is exactly what an
  // operator staring at an open dialog can do.
  const p = project('toctou');
  install(p);
  const target = at(p, 'CLAUDE.md');
  // The region is edited FIRST, so this operation really is a conflict and really opens a dialog.
  // Without the edit there would be no dialog at all to sit open (an untouched artifact is applied
  // without asking), and the gap this case is about could not exist.
  patch(target, 'You are the **Orchestrator / COO**', 'You are the **Orchestrator / COO** (mine)');
  let thrown = null;
  try {
    runUpdate({
      pluginRoot: P020,
      projectRoot: p,
      resolve: (address, kind) => {
        if (kind === 'answer') return { kind: 'answer', value: false };
        // The operator edits the artifact while the dialog is open, then answers.
        fs.writeFileSync(target, (read(target) || '').replace('You are the **Orchestrator / COO** (mine)', 'You are the **Orchestrator / COO** (edited mid-dialog)'), 'utf8');
        return { kind: 'conflict', resolution: 'take-new' };
      },
    });
  } catch (e) { thrown = e; }
  check('a decision taken against a state that no longer exists is REFUSED', thrown instanceof UpdateError, thrown ? thrown.message.slice(0, 120) : 'no error thrown');
  check('the message says the artifact changed while the update was deciding',
    !!thrown && thrown.message.includes('changed while the update was deciding'), thrown ? thrown.message.slice(0, 140) : '');
  check('the target still carries the operator\'s mid-dialog edit, untouched by the engine',
    (read(target) || '').includes('(edited mid-dialog)') && !(read(target) || '').includes('## Your role (v2)'));
  check('the operation before it stayed applied', (readJson(at(p, CONFIG_REL)) || {}).enforcement.exampleToggle === false);
}
{
  // --resolve carries the same open-dialog gap, so it carries the same re-check.
  const p = project('toctou-resolve');
  install(p);
  const target = at(p, WRITER_REL);
  let thrown = null;
  try {
    resolveArtifact({
      pluginRoot: PLUGIN_ROOT,
      projectRoot: p,
      key: WRITER_REL,
      resolve: () => {
        fs.appendFileSync(target, '\nEdited while the resolve dialog was open.\n', 'utf8');
        return { kind: 'conflict', resolution: 'take-new' };
      },
    });
  } catch (e) { thrown = e; }
  check('--resolve refuses a decision taken against a state that no longer exists', thrown instanceof UpdateError,
    thrown ? thrown.message.slice(0, 120) : 'no error thrown');
  check('--resolve left the operator\'s mid-dialog edit alone', (read(target) || '').includes('Edited while the resolve dialog was open.'));
}
{
  // ROUND 2, BLOCKER 1: an interrupted add-config-key whose CONFIG moved while the update was down
  // is re-planned against the state that is really there - but the operator's answer travels with
  // the resume, so the question is never asked twice. Both resumes below run WITHOUT a resolution
  // file: anything that had to ask would stop with exit 1.
  const ADDRESS = '0002_key/0/enforcement.exampleToggle';
  const payload = makePayload('replan-answer', {
    version: '0.2.0',
    migrations: [{ id: '0002_key', version: '0.2.0', ops: [{ op: 'add-config-key', path: 'enforcement.exampleToggle', default: true, askOperator: true, question: 'Keep the dialog?' }] }],
    tweak: addExampleToggleToSchema,
  });
  const crashAndMove = (name, move) => {
    const p = project(`replan-${name}`);
    install(p);
    const crashed = update(p, ['--apply', '--resolution-file', resolutionFile(`replan-${seq}`, { [ADDRESS]: { kind: 'answer', value: false } })], {
      payload, env: { PNP_UPDATE_CRASH_AT: '0002_key/0/after-journal-prepared' },
    });
    check(`${name}: the child died with the answer already staged (exit 86)`, crashed.status === 86, why(crashed));
    const cfg = readJson(at(p, CONFIG_REL));
    move(cfg);
    writeJson(at(p, CONFIG_REL), cfg); // the config now matches NEITHER journal hash
    return p;
  };
  {
    const p = crashAndMove('answer-replayed', (cfg) => { cfg.project.description = 'edited while the update was down'; });
    const resumed = update(p, ['--apply'], { payload });
    check('a moved config re-plans WITHOUT asking the staged question again', resumed.status === 0, why(resumed));
    check('and it says the answer was replayed', resumed.out.includes('replayed from the stage'), why(resumed));
    const cfg = readJson(at(p, CONFIG_REL)) || {};
    check('the staged answer is what landed (false, not the default true)', cfg.enforcement.exampleToggle === false);
    check('the external edit was preserved', cfg.project.description === 'edited while the update was down');
    check('the end state is complete', (cfg._aiwf || {}).installedPluginVersion === '0.2.0' && (cfg._aiwf || {}).migrationJournal === null);
  }
  {
    const p = crashAndMove('key-now-present', (cfg) => { cfg.enforcement.exampleToggle = true; });
    const resumed = update(p, ['--apply'], { payload });
    check('a key that is present by the time of the resume is a no-op, with no question', resumed.status === 0, why(resumed));
    check('the value already there is left exactly as it is', (readJson(at(p, CONFIG_REL)) || {}).enforcement.exampleToggle === true);
    check('the run still completed', bookkeeping(p).installedPluginVersion === '0.2.0' && bookkeeping(p).migrationJournal === null);
  }
}
{
  // ROUND 2, BLOCKER 2: the mid-journal --resolve refusal must name the address the operator has to
  // write a record for - including the `#region` half a region operation's journal target omits.
  const p = project('resolve-names-address');
  install(p);
  const crashed = update(p, ['--apply', '--resolution-file', resolutionFile(`resolve-addr-${seq}`, FULL_RESOLUTIONS)], {
    payload: P020, env: { PNP_UPDATE_CRASH_AT: '0002_fixture/1/after-journal-prepared' },
  });
  check('the child died inside a REGION operation (exit 86)', crashed.status === 86, why(crashed));
  const refused = update(p, ['--resolve', ROLES_REL, '--resolution-file', resolutionFile('resolve-addr-table', {
    [ROLES_REL]: { kind: 'conflict', resolution: 'take-new' },
  })], { payload: P020 });
  check('--resolve on another key is refused while an update is in flight (exit 1)', refused.status === 1, why(refused));
  check('the refusal names the EXACT full address of the interrupted operation',
    refused.out.includes('0002_fixture/1/CLAUDE.md#aiwf-core'), why(refused));
  check('and it hands over a ready-to-paste record skeleton', refused.out.includes('"kind": "conflict"'), why(refused));
  check('nothing was applied to the key that was asked about', !(read(at(p, ROLES_REL)) || '').includes('<<<'));
}
{
  // ROUND 3: a record is promised ONLY for the operation that actually consumes one. A reconcile or
  // a note resumes with no resolver involved at all, and telling the operator to write a record
  // there would send them to author a file the resume ignores.
  const NO_RECORD = 'No record is needed - just re-run /pnp:update and this operation resumes on its own.';
  for (const [name, ops, boundary] of [
    ['a reconcile operation', [FIXTURE_NOTE, { op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' }], '0002_plain/1/after-journal-prepared'],
    ['a note operation', [{ op: 'reconcile-ask-ruleset', ruleset: 'templates/settings.ask-ruleset.json' }, FIXTURE_NOTE], '0002_plain/1/after-journal-prepared'],
  ]) {
    const p = project(`refusal-${name.replace(/[^a-z]+/gi, '-')}`);
    install(p);
    const payload = makePayload(`plain-${seq}`, {
      version: '0.2.0', migrations: [{ id: '0002_plain', version: '0.2.0', ops }], tweak: changeRuleset,
    });
    const crashed = update(p, ['--apply'], { payload, env: { PNP_UPDATE_CRASH_AT: boundary } });
    check(`${name}: the child died inside it (exit 86)`, crashed.status === 86, why(crashed));
    const refused = update(p, ['--resolve', ROLES_REL], { payload });
    check(`${name}: --resolve is still refused (exit 1)`, refused.status === 1, why(refused));
    check(`${name}: the refusal does NOT claim a record is needed`, !refused.out.includes('"kind"'), why(refused));
    check(`${name}: it says the operation resumes on its own`, refused.out.includes(NO_RECORD), why(refused));
    // ... and it really does: the same run finishes with no resolution file anywhere.
    const resumed = update(p, ['--apply'], { payload });
    check(`${name}: and the update then resumes with no record at all`, resumed.status === 0, why(resumed));
  }
}
{
  // BLOCKER 6: a migration that touches the same artifact twice. The preview must plan the second
  // operation against what the first one would have written - and on an artifact the operator never
  // edited that now means ZERO resolutions: the first operation applies silently, the second finds
  // the artifact already current.
  //
  // The resolution file is deliberately NOT empty. It carries a `keep-mine` record for the first
  // operation - a record that, if the engine consulted it, would produce a visibly different result
  // (the old content kept, `override: true`). The assertions below are written against the silent
  // take-new outcome, so a regression that starts asking again cannot pass this case by accident.
  const p = project('same-artifact-twice');
  install(p);
  const twice = { op: 'rerender-managed-region', file: WRITER_REL, region: null, template: 'templates/agents/writer.md.tmpl' };
  const payload = makePayload('twice', {
    version: '0.2.0',
    migrations: [{ id: '0002_twice', version: '0.2.0', ops: [twice, twice] }],
    tweak: changeTemplates,
  });
  const table = resolutionFile('twice', { [`0002_twice/0/${WRITER_REL}`]: { kind: 'conflict', resolution: 'keep-mine' } });
  const before = snapshot(p);
  const dry = update(p, ['--dry-run', '--resolution-file', table], { payload });
  check('dry-run of two operations on one artifact needs NO resolution at all', dry.status === 0, why(dry));
  check('the first is previewed as a silent apply, not as a conflict',
    dry.out.includes(`${WRITER_REL}: the payload version applied (you had not edited it)`), why(dry));
  check('and the second is previewed as already current', dry.out.includes('already current'), why(dry));
  check('the dry run still wrote nothing', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
  const applied = update(p, ['--apply', '--resolution-file', table], { payload });
  check('and the apply needs none either', applied.status === 0, why(applied));
  check('the artifact carries the payload render', (read(at(p, WRITER_REL)) || '').includes('A line the next payload version added.'));
  const entry = bookkeeping(p).managedRegions[WRITER_REL] || {};
  check('the surplus keep-mine record was never consulted: override is false and local == upstream',
    entry.override === false && entry.local === entry.upstream, JSON.stringify(entry).slice(0, 120));
  // The same proof once more, in-process and by counting: the engine entrypoint is handed a resolver
  // that records every call. "The dialog address never appeared in the output" is evidence; a
  // resolver that was never called is the fact itself.
  const p2 = project('same-artifact-twice-counted');
  install(p2);
  let asked = 0;
  runUpdate({
    pluginRoot: payload,
    projectRoot: p2,
    resolve: (address, kind) => { asked += 1; return kind === 'answer' ? { kind: 'answer', value: false } : { kind: 'conflict', resolution: 'keep-mine' }; },
  });
  check('in-process: the resolver was called ZERO times for two rerenders of an untouched artifact', asked === 0, `called ${asked} time(s)`);
}
{
  // BLOCKER 7: stage debris from a run that died between its final write and its cleanup must not
  // outlive the next run - including the run that has nothing to do.
  const p = project('stage-debris');
  install(p);
  const done = update(p, ['--apply', '--resolution-file', resolutionFile('debris', FULL_RESOLUTIONS)], { payload: P020 });
  check('the update completes', done.status === 0, why(done));
  fs.mkdirSync(at(p, `${STAGE_REL}/0002_fixture-3`), { recursive: true });
  fs.writeFileSync(at(p, `${STAGE_REL}/0002_fixture-3/stage.json`), '{"left":"behind"}', 'utf8');
  const again = update(p, ['--apply'], { payload: P020 });
  check('the next run says "already current"', again.status === 0 && again.out.includes('already current'), why(again));
  check('and the stage root is gone with it', !exists(at(p, STAGE_REL)));
}

// ---------------------------------------------------------------------------
section('12 - the self-check is the update\'s own last step, and a red one is never exit 0');
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
  // The flag is passed EXPLICITLY here rather than left to the helper's default: this case is about
  // the flag, and a case that depends on a default is not testing what it says it tests.
  const r = update(p, ['--apply', '--resolution-file', resolutionFile('sc-skip', FULL_RESOLUTIONS), '--no-selfcheck'],
    { payload: P020, selfcheck: true });
  check('--no-selfcheck still exits 0', r.status === 0, why(r));
  check('and it says so on one line - a skipped gate that prints nothing reads exactly like a gate that passed',
    r.out.includes('self-check: SKIPPED'), why(r));
  check('no PASS line is printed for a run that never checked anything', !r.out.includes('self-check: PASS'));
}
{
  // FAIL-CLOSED: the payload's self-check script is not there at all. The migrations still applied;
  // what must not happen is exit 0, because nothing verified the result.
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
  check('which is true: the migrations really applied and the journal is clear',
    bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_fixture' && bk.migrationJournal === null,
    `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
}
{
  // The self-check RUNS and comes back RED, after an apply that succeeded. A managed artifact edited
  // by hand is enough on its own: the self-check hashes every managed artifact against the `local`
  // stamp its bookkeeping records, and this migration never touches roles.json - so the apply has no
  // reason to stop, and the result is nevertheless an inconsistent project.
  const notePayload = makePayload('note-only-020', {
    version: '0.2.0',
    migrations: [{ id: '0002_noteonly', version: '0.2.0', ops: [FIXTURE_NOTE] }],
  });
  const p = project('sc-red');
  check('install exits 0', install(p).status === 0);
  patch(at(p, ROLES_REL), '"effort": "high"', '"effort": "low"');
  const r = update(p, ['--apply'], { payload: notePayload, selfcheck: true });
  check('a RED self-check after a successful apply makes the update exit 1', r.status === 1, why(r));
  check('the self-check\'s own output reached the operator verbatim',
    r.out.includes('roles.json') && r.out.includes('FAILURES:'), why(r));
  check('the verdict says the files WERE written and nothing was rolled back',
    r.out.includes('WERE written') && r.out.includes('nothing was rolled back'), why(r));
  const bk = bookkeeping(p);
  check('which is true: the migration applied, the stamps moved and the journal is clear',
    bk.installedPluginVersion === '0.2.0' && bk.lastMigrationApplied === '0002_noteonly' && bk.migrationJournal === null,
    `${bk.installedPluginVersion} / ${bk.lastMigrationApplied}`);
  check('and the CHANGES report is on disk too', exists(at(p, 'CHANGES_0.1.0-to-0.2.0.md')));
  check('the operator\'s hand edit was never overwritten', (read(at(p, ROLES_REL)) || '').includes('"effort": "low"'));
}

// ---------------------------------------------------------------------------
try { fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(`fixtures left behind: ${fs.existsSync(tmpRoot) ? tmpRoot : 'none'}`);
console.log(failures === 0 ? 'UPDATE SUITE: PASS' : 'UPDATE SUITE: FAIL');
process.exit(failures === 0 ? 0 : 1);
