#!/usr/bin/env node
/*
 * Acceptance + idempotency suite for the setup engine.
 *
 * Everything here runs the REAL entrypoint (`node scripts/setup/interview.mjs --answers-file ...`)
 * against throwaway projects under the system temp directory - never a fixture checked into the
 * repository, and nothing is left behind. The suite asserts the properties the installer is allowed
 * to be judged on:
 *
 *   1. a fresh install produces a project the SELF-CHECK passes (the two engines cross-check each
 *      other: this suite proves setup writes, the self-check proves what it wrote is consistent);
 *   2. re-running with unchanged answers is a ZERO DIFF, byte for byte, _aiwf included;
 *   3. text outside the managed markers survives a re-run;
 *   4. an edit INSIDE a managed artifact stops the run and overwrites NOTHING;
 *   5. the conditional agent render is correct in BOTH directions, and removing a stale render is
 *      gated on an explicit confirmation;
 *   6. every shipped OS channel installs and renders ITS OWN wrapper paths (windows -> the
 *      PowerShell ones, linux/macos -> the bash ones), while an OS outside the three and answers
 *      that violate the schema are both refused before a single file is written;
 *   7. foreign permission rules are never touched, and a rule the operator removed is not forced
 *      back (the tombstone);
 *   8. the self-check is the install's OWN last step: a fresh install runs it and reports PASS,
 *      --no-selfcheck skips it out loud, and a self-check that cannot be run at all makes the
 *      install exit 1 rather than report a green it never obtained;
 *   9. ADOPT (--adopt), the whole matrix: an encountered file identical to the render is adopted
 *      clean and in silence, a different one is decided by the operator (keep-mine keeps every byte,
 *      take-new applies the render), a decision nobody can answer STOPS the run with zero bytes
 *      written, an answer for an address nobody asked about is refused by name, "merge" is not an
 *      adopt word, an installed project is refused outright, the pre-adopt blockers keep their exact
 *      force, and the superseded-legacy list is advisory text that touches nothing.
 *
 * WHY MOST CASES PASS --no-selfcheck
 *   Every install below would otherwise pay for a full self-check run (300+ assertions, a fresh
 *   PowerShell host and two dozen child processes). The cases that are ABOUT the integration run it;
 *   the ones that are about the generator skip it deliberately, through the same flag an operator
 *   has - not through a test-only bypass.
 *
 * Exit 0 = every assertion passed. Exit 1 = at least one failed. Exit 2 = the suite could not run.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSupersededLegacy, sha256 } from './generate.mjs';
import { runInterview } from './interview.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(HERE, '..', '..');
const SELFCHECK = path.join(PLUGIN_ROOT, 'scripts', 'selfcheck', 'aiwf-selfcheck.js');
const SELFCHECK_REL = 'scripts/selfcheck/aiwf-selfcheck.js';

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-setup-test-'));
let failures = 0;
let checks = 0;

function check(name, ok, detail) {
  checks += 1;
  if (!ok) failures += 1;
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' - ' + detail : ''}`);
  return !!ok;
}
function section(title) { console.log(`\n=== ${title} ===`); }
// Detail for a run: the exit code plus the last lines of its output, and ONLY when something is
// worth explaining - a passing row that dumps a whole install report drowns the failures.
const why = (r, always = false) => (r.status === 0 && !always ? '' : `exit ${r.status}: ${r.out.trim().split('\n').filter(Boolean).slice(-3).join(' | ').slice(0, 240)}`);

// ---- helpers ---------------------------------------------------------------
const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const readJson = (p) => { const t = read(p); try { return t === null ? null : JSON.parse(t); } catch { return null; } };
const exists = (p) => fs.existsSync(p);

function project(name) {
  const dir = path.join(tmpRoot, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// `opts.selfcheck: true` lets the install run its integrated self-check; every other case passes
// --no-selfcheck, because paying 300+ assertions per install to prove the generator wrote a file is
// not coverage, it is a slow suite. `opts.payload` runs a DIFFERENT payload copy (the fail-closed
// control installs from a payload whose self-check script has been removed).
function install(projectDir, answers, extra = [], opts = {}) {
  const answersFile = path.join(tmpRoot, `answers-${path.basename(projectDir)}-${Math.random().toString(36).slice(2, 8)}.json`);
  fs.writeFileSync(answersFile, JSON.stringify(answers, null, 2));
  const payload = opts.payload || PLUGIN_ROOT;
  const args = [path.join(payload, 'scripts', 'setup', 'interview.mjs'), '--answers-file', answersFile, '--plugin-root', payload, ...extra];
  if (!opts.selfcheck && !extra.includes('--no-selfcheck')) args.push('--no-selfcheck');
  if (!opts.autoRoot) args.push('--project-root', projectDir);
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', cwd: opts.cwd || process.cwd() });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

// The OTHER entrypoint. Some refusals must hold on both, and a guard asserted only through
// interview.mjs says nothing about the direct generator path an operator or a script can take.
function generateInstall(projectDir, answers, extra = []) {
  const answersFile = path.join(tmpRoot, `answers-gen-${path.basename(projectDir)}-${Math.random().toString(36).slice(2, 8)}.json`);
  fs.writeFileSync(answersFile, JSON.stringify(answers, null, 2));
  const args = [
    path.join(PLUGIN_ROOT, 'scripts', 'setup', 'generate.mjs'),
    '--answers-file', answersFile, '--plugin-root', PLUGIN_ROOT, '--project-root', projectDir, ...extra,
  ];
  if (!extra.includes('--no-selfcheck')) args.push('--no-selfcheck');
  const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

function copyTree(from, to, skip = new Set(['.git', 'node_modules'])) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyTree(s, d, skip); else fs.copyFileSync(s, d);
  }
}

// Every file under a project, keyed by its project-relative path with forward slashes. `.git` is
// skipped: it is not part of the installation and it changes on its own.
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

const baseAnswers = (overrides = {}) => ({
  project: { name: 'Testbed', description: 'a throwaway project used only by the setup suite', stack: 'node', defaultBranch: 'main' },
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

const CONFIG_REL = '.claude/aiwf-native/aiwf.config.json';
const ROLES_REL = '.claude/aiwf-native/roles.json';
const at = (dir, rel) => path.join(dir, ...rel.split('/'));

// ---------------------------------------------------------------------------
section('1 - fresh install, self-check green, memory seeds printed');
const p1 = project('fresh');
const r1 = install(p1, baseAnswers(), [], { selfcheck: true });
check('install exits 0', r1.status === 0, why(r1));
// The install's OWN last step, not a reminder printed for someone else to act on.
check('the install RAN the self-check itself and reported PASS', r1.out.includes('self-check: PASS'), why(r1, true));
check('and the PASS line quotes the self-check\'s own summary line verbatim',
  /self-check: PASS - .*assertions passed/.test(r1.out), (r1.out.split('\n').find((l) => l.startsWith('self-check:')) || '(no self-check line)').slice(0, 120));
check('config written', exists(at(p1, CONFIG_REL)));
check('roles.json written', exists(at(p1, ROLES_REL)));
check('writer agent always rendered', exists(at(p1, '.claude/agents/writer.md')));
check('reviewer agent rendered (claude-hosted)', exists(at(p1, '.claude/agents/reviewer.md')));
check('NO qa agent rendered (codex-hosted role has no Claude agent file)', !exists(at(p1, '.claude/agents/qa.md')));
check('CLAUDE.md written with the managed markers',
  (read(at(p1, 'CLAUDE.md')) || '').includes('<!-- BEGIN aiwf-core -->') && (read(at(p1, 'CLAUDE.md')) || '').includes('<!-- END aiwf-core -->'));
check('overrides document seeded', exists(at(p1, 'docs/ai/PROJECT_OVERRIDES.md')));
check('plansDir has BOTH active/ and archive/', exists(at(p1, 'docs/backlogs/active')) && exists(at(p1, 'docs/backlogs/archive')));
check('scratch dir created', exists(at(p1, '.aiwf')));
check('memory seeds are PRINTED for the operator', r1.out.includes('MEMORY SEEDS') && r1.out.includes('finished-plan-is-archived'));
{
  const cfg = readJson(at(p1, CONFIG_REL)) || {};
  const bk = cfg._aiwf || {};
  const plugin = readJson(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json')) || {};
  check('_aiwf stamps the payload version', bk.installedPluginVersion === plugin.version, `${bk.installedPluginVersion} vs ${plugin.version}`);
  // A fresh install stamps the LAST manifest entry: it already generates the current state, so
  // every shipped migration counts as applied. Read from the manifest rather than pinned to a
  // literal id - a pinned one says "0001_initial" and starts failing on the payload's second
  // migration, which is a true statement about the test and nothing about the engine.
  {
    const manifest = readJson(path.join(PLUGIN_ROOT, 'migrations', 'index.json')) || [];
    const last = manifest.length ? manifest[manifest.length - 1].id : null;
    check('_aiwf stamps the LAST manifest entry as the fresh-install migration id',
      !!last && bk.lastMigrationApplied === last, `${bk.lastMigrationApplied} vs manifest last ${last}`);
    check('and that entry targets the payload version (so "up to date" and "installed == payload" agree)',
      manifest.length > 0 && manifest[manifest.length - 1].targetPluginVersion === plugin.version,
      `${manifest.length ? manifest[manifest.length - 1].targetPluginVersion : '(no manifest)'} vs ${plugin.version}`);
  }
  check('_aiwf journal is clear', bk.migrationJournal === null);
  check('$schema points at the payload schema', typeof cfg.$schema === 'string' && cfg.$schema.endsWith('schema/aiwf.config.schema.json'), String(cfg.$schema));
  // Both enforcement keys are REQUIRED by the schema, so a fresh install carries them whatever the
  // answers say - a hook that had to guess a mode would be guessing on every project.
  check('the enforcement block carries both gates, Gate 2 in its factory mode',
    cfg.enforcement && cfg.enforcement.routeWriteGuard === true && cfg.enforcement.dispatchGate === 'always',
    JSON.stringify(cfg.enforcement));

  // Bookkeeping correctness: every recorded hash must be the hash of what is really on disk, with
  // upstream == local == actual and override false on a clean install. A wrong hash here would make
  // the very first /pnp:update report a conflict that never happened.
  const regions = bk.managedRegions || {};
  const keys = Object.keys(regions).sort();
  check('managedRegions covers exactly the rendered artifacts',
    keys.join(',') === ['.claude/agents/reviewer.md', '.claude/agents/writer.md', '.claude/aiwf-native/roles.json', 'CLAUDE.md#aiwf-core'].sort().join(','),
    keys.join(', '));
  let hashOk = keys.length > 0;
  for (const key of keys) {
    const entry = regions[key];
    const [file, region] = key.split('#');
    let actual = read(at(p1, file));
    if (actual === null) { hashOk = false; break; }
    if (region) {
      const start = actual.indexOf(`<!-- BEGIN ${region} -->`);
      const end = actual.indexOf(`<!-- END ${region} -->`);
      actual = actual.slice(start, end + `<!-- END ${region} -->`.length);
    }
    const h = sha256(actual);
    if (entry.upstream !== h || entry.local !== h || entry.override !== false) hashOk = false;
  }
  check('every managedRegions entry is upstream == local == sha256(actual), override false', hashOk);

  const settings = readJson(at(p1, '.claude/settings.json')) || {};
  const ask = (settings.permissions || {}).ask || [];
  check('the ask ruleset is rendered (no <projectRoot> placeholder survives)', ask.length > 0 && !ask.some((r) => r.includes('<projectRoot>')));
  check('ownedAskRules records what setup inserted, and all of it is present in settings.json',
    Array.isArray(bk.ownedAskRules) && bk.ownedAskRules.length === ask.length && bk.ownedAskRules.every((r) => ask.includes(r)));
  check('the factory allow/deny posture applied to a project with no permissions block of its own',
    JSON.stringify((settings.permissions || {}).allow) === JSON.stringify(['Bash(*)']) && JSON.stringify((settings.permissions || {}).deny) === JSON.stringify([]));
}
{
  const r = spawnSync(process.execPath, [SELFCHECK, '--plugin-root', PLUGIN_ROOT, '--project-fixture', p1], { encoding: 'utf8' });
  const tail = (r.stdout || '').trim().split('\n').slice(-12).join('\n');
  check('the self-check passes against the generated project (exit 0)', r.status === 0, r.status === 0 ? '' : `\n${tail}`);
}

// ---------------------------------------------------------------------------
section('2 - a re-run with unchanged answers is a zero diff');
{
  const before = snapshot(p1);
  const r = install(p1, baseAnswers(), ['--no-seeds']);
  const after = snapshot(p1);
  const changed = diffSnapshots(before, after);
  check('re-run exits 0', r.status === 0, why(r));
  check('not a single byte changed (config and _aiwf included)', changed.length === 0, changed.join(', '));
  check('the report says so', r.out.includes('no changes'));
}

// ---------------------------------------------------------------------------
section('3 - manual edits OUTSIDE the markers are preserved');
{
  const claudeFile = at(p1, 'CLAUDE.md');
  const mine = '\n## My own section\n\nNothing here is the plugin\'s business.\n';
  fs.writeFileSync(claudeFile, read(claudeFile) + mine);
  const before = snapshot(p1);
  const r = install(p1, baseAnswers(), ['--no-seeds']);
  const after = snapshot(p1);
  check('re-run exits 0 with text outside the markers present', r.status === 0, why(r));
  check('the operator text survived', (read(claudeFile) || '').includes('## My own section'));
  check('nothing else changed either', diffSnapshots(before, after).length === 0, diffSnapshots(before, after).join(', '));
}

// ---------------------------------------------------------------------------
section('4 - an edit INSIDE a managed artifact is a conflict, and nothing is overwritten');
{
  const claudeFile = at(p1, 'CLAUDE.md');
  const src = read(claudeFile);
  fs.writeFileSync(claudeFile, src.replace('## Your role', '## Your role (I edited this)'));
  const before = snapshot(p1);
  const r = install(p1, baseAnswers(), ['--no-seeds']);
  const after = snapshot(p1);
  check('the run is BLOCKED (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the message names the managed key and the resolve path', r.out.includes('CLAUDE.md#aiwf-core') && r.out.includes('/pnp:update'));
  check('the edited region was NOT overwritten', (read(claudeFile) || '').includes('## Your role (I edited this)'));
  check('the run wrote nothing at all', diffSnapshots(before, after).length === 0, diffSnapshots(before, after).join(', '));
  fs.writeFileSync(claudeFile, src); // restore for the next case
}
{
  const rolesFile = at(p1, ROLES_REL);
  const src = read(rolesFile);
  fs.writeFileSync(rolesFile, src.replace('"effort": "high"', '"effort": "low"'));
  const before = snapshot(p1);
  const r = install(p1, baseAnswers(), ['--no-seeds']);
  const after = snapshot(p1);
  check('a hand-edited whole-file artifact (roles.json) blocks too', r.status === 1, `exit ${r.status}`);
  check('the message names roles.json', r.out.includes('.claude/aiwf-native/roles.json'));
  check('nothing was written', diffSnapshots(before, after).length === 0, diffSnapshots(before, after).join(', '));
  fs.writeFileSync(rolesFile, src);
}

// ---------------------------------------------------------------------------
section('5 - a changed answer re-renders cleanly (the config is the source, the artifacts follow)');
{
  const answers = baseAnswers();
  answers.roles.reviewer.model = 'sonnet';
  const r = install(p1, answers, ['--no-seeds']);
  check('re-run exits 0', r.status === 0, why(r));
  check('roles.json followed the config', (read(at(p1, ROLES_REL)) || '').includes('"model": "sonnet"'));
  check('the agent frontmatter followed too', /^model: sonnet$/m.test(read(at(p1, '.claude/agents/reviewer.md')) || ''));
  const bk = (readJson(at(p1, CONFIG_REL)) || {})._aiwf || {};
  const entry = (bk.managedRegions || {})[ROLES_REL] || {};
  check('bookkeeping restamped: upstream == local == sha256(new content), override false',
    entry.upstream === sha256(read(at(p1, ROLES_REL))) && entry.local === entry.upstream && entry.override === false);
  install(p1, baseAnswers(), ['--no-seeds']); // back to the baseline
}

// ---------------------------------------------------------------------------
section('6 - the conditional agent render, in both directions');
{
  const p6 = project('conditional');
  const answers = baseAnswers();
  answers.roles.reviewer = { engine: 'codex', model: 'codex-atom-9', effort: 'high' };
  answers.roles.qa = { engine: 'claude', model: 'haiku', effort: 'medium' };
  const r = install(p6, answers, ['--no-seeds']);
  check('install exits 0', r.status === 0, why(r));
  check('claude-hosted qa HAS an agent file', exists(at(p6, '.claude/agents/qa.md')));
  check('codex-hosted reviewer has NONE', !exists(at(p6, '.claude/agents/reviewer.md')));

  // Flipping a role to codex leaves a stale render behind. Deleting it is destructive, so it is
  // gated: the default run reports and deletes nothing.
  const flipped = baseAnswers();
  flipped.roles.reviewer = { engine: 'codex', model: 'codex-atom-9', effort: 'high' };
  flipped.roles.qa = { engine: 'codex', model: 'codex-atom-2', effort: 'medium' };
  const before = snapshot(p6);
  const blocked = install(p6, flipped, ['--no-seeds']);
  check('flipping qa to codex BLOCKS on the stale render', blocked.status === 1, `exit ${blocked.status}`);
  check('the message names the file and the confirmation flag', blocked.out.includes('.claude/agents/qa.md') && blocked.out.includes('--confirm-remove-stale'));
  check('the stale file was NOT deleted and nothing else changed',
    exists(at(p6, '.claude/agents/qa.md')) && diffSnapshots(before, snapshot(p6)).length === 0);

  const confirmed = install(p6, flipped, ['--no-seeds', '--confirm-remove-stale']);
  check('with the confirmation the run completes', confirmed.status === 0, why(confirmed));
  check('the stale render is gone', !exists(at(p6, '.claude/agents/qa.md')));
  check('roles.json reflects the new hosts', (read(at(p6, ROLES_REL)) || '').includes('"engine": "codex"'));
}

// ---------------------------------------------------------------------------
// The OS channel decides WHICH wrapper paths the rendered project layer names. Both POSIX channels
// are asserted end to end - installed, rendered, and re-run - because "linux is accepted now" is a
// claim about generated FILES, not about an enum: a channel that installs while still naming the
// PowerShell wrappers would pass an exit-code-only check and hand the operator an unrunnable loop.
section('6b - the linux and macos channels install and render the bash wrappers');
{
  const PS_ROLES = 'scripts/native/ps/aiwf-roles.ps1';
  const SH_ROLES = 'scripts/native/sh/aiwf-roles.sh';
  const PS_REVIEW = 'scripts/native/ps/codex-review.ps1';
  const SH_REVIEW = 'scripts/native/sh/codex-review.sh';

  // The windows control first: the same templates must still render the PowerShell channel, or
  // "linux renders sh" would be true of every channel and prove nothing.
  const winWriter = read(at(p1, '.claude/agents/writer.md')) || '';
  const winReviewer = read(at(p1, '.claude/agents/reviewer.md')) || '';
  check('os=windows still renders the PowerShell wrapper paths',
    winWriter.includes(PS_ROLES) && winReviewer.includes(PS_REVIEW) && !winWriter.includes(SH_ROLES) && !winReviewer.includes(SH_REVIEW));

  for (const channel of ['linux', 'macos']) {
    const dir = project(`os-${channel}`);
    const r = install(dir, baseAnswers({ os: channel }), ['--no-seeds']);
    check(`os=${channel} installs (exit 0)`, r.status === 0, why(r));
    const writer = read(at(dir, '.claude/agents/writer.md')) || '';
    const reviewer = read(at(dir, '.claude/agents/reviewer.md')) || '';
    check(`os=${channel}: the writer agent names the bash resolver, never the PowerShell one`,
      writer.includes(SH_ROLES) && !writer.includes(PS_ROLES));
    check(`os=${channel}: the reviewer agent names the bash Codex wrapper, never the PowerShell one`,
      reviewer.includes(SH_REVIEW) && !reviewer.includes(PS_REVIEW));
    check(`os=${channel}: the config records the channel`, (readJson(at(dir, CONFIG_REL)) || {}).os === channel);
    const before = snapshot(dir);
    const again = install(dir, baseAnswers({ os: channel }), ['--no-seeds']);
    check(`os=${channel}: a re-run is still a zero diff`,
      again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
  }
}

// ---------------------------------------------------------------------------
section('7 - refusals happen BEFORE anything is written');
{
  // The pair for the refusal below: the OTHER value the enum admits installs cleanly and reaches the
  // config verbatim, so "sometimes" being refused is about the value, not about the key.
  const pOffPlan = project('dispatch-off-plan');
  const answers = baseAnswers();
  answers.enforcement.dispatchGate = 'off-plan';
  const r = install(pOffPlan, answers, ['--no-seeds']);
  check('the off-plan dispatch mode installs (exit 0)', r.status === 0, why(r));
  check('and the answer reached the config, not the factory default',
    ((readJson(at(pOffPlan, CONFIG_REL)) || {}).enforcement || {}).dispatchGate === 'off-plan',
    JSON.stringify((readJson(at(pOffPlan, CONFIG_REL)) || {}).enforcement));
}
{
  const pBadMode = project('dispatch-bad-mode');
  const answers = baseAnswers();
  answers.enforcement.dispatchGate = 'sometimes';
  const r = install(pBadMode, answers, ['--no-seeds']);
  check('a dispatch mode outside the enum is refused (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the schema error names the offending path', r.out.includes('/enforcement/dispatchGate'), why(r, true));
  check('nothing was written', Object.keys(snapshot(pBadMode)).length === 0);
}
{
  const p7 = project('unknown-os');
  const answers = baseAnswers({ os: 'solaris' });
  const r = install(p7, answers, ['--no-seeds']);
  check('an os outside the three channels is refused (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the message names the channels setup can generate', r.out.includes('"windows", "linux", "macos"'), why(r, true));
  check('the project directory is still empty', snapshot(p7) && Object.keys(snapshot(p7)).length === 0);
}
{
  const p8 = project('invalid');
  const answers = baseAnswers();
  answers.roles.reviewer.engine = 'grok';
  const r = install(p8, answers, ['--no-seeds']);
  check('an answer outside the engine enum is refused (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the schema error names the offending path', r.out.includes('/roles/reviewer/engine'), why(r, true));
  check('nothing was written', Object.keys(snapshot(p8)).length === 0);
}
{
  const p9 = project('tier');
  const answers = baseAnswers();
  answers.roles.reviewer.model = 'claude-opus-5[1m]'; // a full id on a CLAUDE host
  const r = install(p9, answers, ['--no-seeds']);
  check('a claude-hosted role pinned to a full model id is refused', r.status === 1, `exit ${r.status}`);
  check('nothing was written', Object.keys(snapshot(p9)).length === 0);
}

// ---------------------------------------------------------------------------
section('8 - settings.json: foreign rules untouched, tombstones not forced back');
{
  const p10 = project('settings');
  fs.mkdirSync(path.join(p10, '.claude'), { recursive: true });
  fs.writeFileSync(at(p10, '.claude/settings.json'), JSON.stringify({
    permissions: { allow: ['Bash(ls:*)'], deny: ['Bash(curl:*)'], ask: ['Bash(my-own-tool:*)', 'Bash(git commit:*)'] },
    hooks: { PreToolUse: [] },
  }, null, 2));
  const r = install(p10, baseAnswers(), ['--no-seeds']);
  check('install exits 0', r.status === 0, why(r));
  const settings = readJson(at(p10, '.claude/settings.json')) || {};
  const ask = (settings.permissions || {}).ask || [];
  const bk = (readJson(at(p10, CONFIG_REL)) || {})._aiwf || {};
  check('the foreign rule is still there', ask.includes('Bash(my-own-tool:*)'));
  check('the project\'s own allow/deny posture was NOT replaced by the factory one',
    JSON.stringify((settings.permissions || {}).allow) === JSON.stringify(['Bash(ls:*)']));
  check('a non-permissions key survived the merge', !!(settings.hooks && Array.isArray(settings.hooks.PreToolUse)));
  check('a rule that was ALREADY present did not become owned', !bk.ownedAskRules.includes('Bash(git commit:*)'));
  check('the foreign rule did not become owned either', !bk.ownedAskRules.includes('Bash(my-own-tool:*)'));
  check('every owned rule is one setup really inserted', bk.ownedAskRules.every((rule) => ask.includes(rule)) && bk.ownedAskRules.length > 0);

  // The operator removes an owned rule by hand: it becomes a tombstone and is never forced back.
  const victim = bk.ownedAskRules[0];
  const trimmed = readJson(at(p10, '.claude/settings.json'));
  trimmed.permissions.ask = trimmed.permissions.ask.filter((rule) => rule !== victim);
  fs.writeFileSync(at(p10, '.claude/settings.json'), JSON.stringify(trimmed, null, 2));
  const r2 = install(p10, baseAnswers(), ['--no-seeds']);
  const bk2 = (readJson(at(p10, CONFIG_REL)) || {})._aiwf || {};
  const ask2 = (readJson(at(p10, '.claude/settings.json')) || {}).permissions.ask;
  check('the re-run exits 0', r2.status === 0, why(r2));
  check('the removed rule was NOT forced back', !ask2.includes(victim), victim);
  check('it is recorded as a tombstone', (bk2.suppressedAskRules || []).includes(victim));
  check('and it is no longer owned', !(bk2.ownedAskRules || []).includes(victim));
  check('owned and suppressed stay disjoint', !(bk2.ownedAskRules || []).some((rule) => (bk2.suppressedAskRules || []).includes(rule)));
}

// ---------------------------------------------------------------------------
section('9 - the project root resolves from git when it is not passed');
{
  const p11 = project('gitroot');
  const init = spawnSync('git', ['init', '-q'], { cwd: p11, encoding: 'utf8' });
  if (init.status !== 0) {
    check('git init succeeded (needed for the auto-resolution case)', false, (init.stderr || '').slice(0, 200));
  } else {
    const r = install(p11, baseAnswers(), ['--no-seeds'], { autoRoot: true, cwd: p11 });
    check('install without --project-root exits 0', r.status === 0, why(r));
    check('the config landed in the git worktree root', exists(at(p11, CONFIG_REL)));
  }
}

// ---------------------------------------------------------------------------
section('10 - WITHOUT --adopt, a pre-existing artifact is never taken over (section 18 is the adopt path)');
{
  const p12 = project('unadopted');
  fs.mkdirSync(at(p12, '.claude/aiwf-native'), { recursive: true });
  fs.writeFileSync(at(p12, ROLES_REL), '{ "reviewer": "mine, hand-written" }\n');
  const before = snapshot(p12);
  const r = install(p12, baseAnswers(), ['--no-seeds']);
  check('the run is BLOCKED (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the message says setup will not take over a file it did not write, and names --adopt as the deliberate way',
    r.out.includes('not recorded in _aiwf.managedRegions') && r.out.includes('--adopt'));
  check('the operator\'s file is untouched and nothing else was written', diffSnapshots(before, snapshot(p12)).length === 0);
}

// ---------------------------------------------------------------------------
section('11 - an existing CLAUDE.md gets the region APPENDED, never a rewrite');
{
  const p13 = project('existing-claude');
  fs.writeFileSync(at(p13, 'CLAUDE.md'), '# My project\n\nMy own instructions.\n');
  const r = install(p13, baseAnswers(), ['--no-seeds']);
  const text = read(at(p13, 'CLAUDE.md')) || '';
  check('install exits 0', r.status === 0, why(r));
  check('the original text is still first', text.startsWith('# My project\n\nMy own instructions.\n'));
  check('the managed region was appended with its markers', text.includes('<!-- BEGIN aiwf-core -->') && text.includes('<!-- END aiwf-core -->'));
  check('the operator zone of the template was NOT injected', !text.includes('## Changelog format'));
  const before = snapshot(p13);
  const again = install(p13, baseAnswers(), ['--no-seeds']);
  check('and a re-run is still a zero diff', again.status === 0 && diffSnapshots(before, snapshot(p13)).length === 0);
}

// ---------------------------------------------------------------------------
section('12 - the interactive question flow itself (scripted answers, no readline)');
{
  // The transport is the only thing the CLI adds, so the flow is driven here with a scripted `ask`.
  // Everything answered with an empty string takes the schema default - which is what proves the
  // defaults really reach the operator instead of being hardcoded somewhere downstream.
  const scripted = new Map([
    ['Project name', 'Interviewed'],
    ['Writer model', 'claude-opus-5[1m]'],
    ['Writer reasoning effort', 'high'],
    ['reviewer: model', 'opus'],
    ['reviewer: reasoning effort', 'high'],
    ['qa: model', 'sonnet'],
    ['qa: reasoning effort', 'medium'],
  ]);
  const answers = await runInterview({
    schema: JSON.parse(read(path.join(PLUGIN_ROOT, 'schema', 'aiwf.config.schema.json'))),
    ask: async (question) => {
      for (const [needle, value] of scripted) if (question.includes(needle)) return value;
      return '';
    },
  });
  check('the required answer is captured', answers.project.name === 'Interviewed');
  check('an empty answer takes the schema default', answers.os === 'windows' && answers.paths.plansDir === 'docs/backlogs' && answers.loop.correctionRoundsCap === 2);
  check('the enforcement questions are asked and default to the factory posture',
    answers.enforcement.routeWriteGuard === true && answers.enforcement.dispatchGate === 'always',
    JSON.stringify(answers.enforcement));
  check('the engine default is claude (never a paid engine by accident)', answers.roles.reviewer.engine === 'claude' && answers.roles.qa.engine === 'claude');
  check('a declined QAL is written as codex + disabled, with a visible placeholder model',
    answers.roles.qal.enabled === false && answers.roles.qal.engine === 'codex' && answers.roles.qal.model === 'unset');
  check('empty lists stay empty', Array.isArray(answers.verify.commands) && answers.verify.commands.length === 0 && answers.review.productBoundaryChecks.length === 0);
  const p17 = project('interviewed');
  const r = install(p17, answers, ['--no-seeds']);
  check('the interview\'s own output installs cleanly', r.status === 0, why(r));
  check('and the rendered qa agent exists (claude-hosted by default)', exists(at(p17, '.claude/agents/qa.md')));
}

// ---------------------------------------------------------------------------
section('13 - dry run writes nothing; unreadable state and escaping paths stop the run');
{
  const p14 = project('dryrun');
  const r = install(p14, baseAnswers(), ['--no-seeds', '--dry-run']);
  check('--dry-run exits 0', r.status === 0, why(r));
  check('--dry-run lists what it WOULD do', r.out.includes('would apply'));
  check('--dry-run wrote nothing', Object.keys(snapshot(p14)).length === 0);
}
{
  const p15 = project('corruptconfig');
  fs.mkdirSync(at(p15, '.claude/aiwf-native'), { recursive: true });
  fs.writeFileSync(at(p15, CONFIG_REL), '{ not json ');
  const before = snapshot(p15);
  const r = install(p15, baseAnswers(), ['--no-seeds']);
  check('an unreadable existing config BLOCKS the run', r.status === 1, `exit ${r.status}`);
  check('and nothing was written over it', diffSnapshots(before, snapshot(p15)).length === 0);
}
{
  const p16 = project('escape');
  const answers = baseAnswers();
  answers.paths.overridesDoc = path.join(tmpRoot, 'outside.md');
  const r = install(p16, answers, ['--no-seeds']);
  check('a configured path outside the project is refused', r.status === 1, `exit ${r.status}`);
  check('the message names the offending key', r.out.includes('paths.overridesDoc'));
  check('nothing was written, inside or outside', Object.keys(snapshot(p16)).length === 0 && !exists(path.join(tmpRoot, 'outside.md')));
}

// ---------------------------------------------------------------------------
section('14 - a DELETED managed artifact is a conflict, not an invitation to recreate it');
{
  const p18 = project('deleted-file');
  check('install exits 0', install(p18, baseAnswers(), ['--no-seeds']).status === 0);
  fs.rmSync(at(p18, ROLES_REL));
  const before = snapshot(p18);
  const r = install(p18, baseAnswers(), ['--no-seeds']);
  check('deleting a recorded artifact BLOCKS the re-run', r.status === 1, `exit ${r.status}`);
  check('the message names the key and the resolve path',
    r.out.includes('.claude/aiwf-native/roles.json') && r.out.includes('GONE from disk') && r.out.includes('/pnp:update --resolve'));
  check('the file was NOT silently recreated', !exists(at(p18, ROLES_REL)));
  check('and nothing else was written', diffSnapshots(before, snapshot(p18)).length === 0, diffSnapshots(before, snapshot(p18)).join(', '));
}
{
  const p19 = project('deleted-region');
  check('install exits 0', install(p19, baseAnswers(), ['--no-seeds']).status === 0);
  const text = read(at(p19, 'CLAUDE.md'));
  const start = text.indexOf('<!-- BEGIN aiwf-core -->');
  const end = text.indexOf('<!-- END aiwf-core -->') + '<!-- END aiwf-core -->'.length;
  fs.writeFileSync(at(p19, 'CLAUDE.md'), text.slice(0, start) + '(the operator removed the managed region)' + text.slice(end));
  const before = snapshot(p19);
  const r = install(p19, baseAnswers(), ['--no-seeds']);
  check('deleting the REGION out of a recorded file BLOCKS too (no silent re-append)', r.status === 1, `exit ${r.status}`);
  check('the message names the region key', r.out.includes('CLAUDE.md#aiwf-core'));
  check('no region was appended back', !(read(at(p19, 'CLAUDE.md')) || '').includes('<!-- BEGIN aiwf-core -->'));
  check('nothing else was written', diffSnapshots(before, snapshot(p19)).length === 0);
}

// ---------------------------------------------------------------------------
section('15 - --confirm-remove-stale deletes ONLY a recorded, unmodified render');
{
  const p20 = project('stale-edited');
  const claudeQa = baseAnswers();
  claudeQa.roles.qa = { engine: 'claude', model: 'haiku', effort: 'medium' };
  check('install with a claude-hosted qa exits 0', install(p20, claudeQa, ['--no-seeds']).status === 0);
  const agent = at(p20, '.claude/agents/qa.md');
  fs.writeFileSync(agent, read(agent) + '\nMy own note in the agent file.\n');
  const before = snapshot(p20);
  const r = install(p20, baseAnswers(), ['--no-seeds', '--confirm-remove-stale']);
  check('a stale render that was ALSO hand-edited BLOCKS even with the flag', r.status === 1, `exit ${r.status}`);
  check('the message says it is not the file the flag confirms', r.out.includes('edited by hand') || r.out.includes('ALSO edited'));
  check('the file is still there, with the operator\'s text', (read(agent) || '').includes('My own note in the agent file.'));
  check('nothing was written or deleted', diffSnapshots(before, snapshot(p20)).length === 0);
}
{
  const p21 = project('stale-foreign');
  check('install with a codex-hosted qa exits 0', install(p21, baseAnswers(), ['--no-seeds']).status === 0);
  fs.writeFileSync(at(p21, '.claude/agents/qa.md'), '---\nname: qa\n---\nSomeone else wrote this.\n');
  const before = snapshot(p21);
  const r = install(p21, baseAnswers(), ['--no-seeds', '--confirm-remove-stale']);
  check('an UNRECORDED file at a managed path is never deleted, flag or no flag', r.status === 1, `exit ${r.status}`);
  check('the message says setup does not adopt (or delete) what it did not write', r.out.includes('not recorded in _aiwf.managedRegions'));
  check('the foreign file survived', (read(at(p21, '.claude/agents/qa.md')) || '').includes('Someone else wrote this.'));
  check('nothing else changed', diffSnapshots(before, snapshot(p21)).length === 0);
}

// ---------------------------------------------------------------------------
section('16 - a permissions shape setup does not understand is never rewritten');
for (const [name, permissions, needle] of [
  ['permissions is a string', 'weird', 'not an object'],
  ['permissions is an array', ['Bash(*)'], 'not an object'],
  ['permissions.ask is a string', { ask: 'nope' }, 'not a list'],
]) {
  const dir = project(`settings-${name.replace(/[^a-z]+/gi, '-')}`);
  fs.mkdirSync(at(dir, '.claude'), { recursive: true });
  const original = JSON.stringify({ permissions, hooks: {} }, null, 2);
  fs.writeFileSync(at(dir, '.claude/settings.json'), original);
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check(`${name} -> BLOCKED`, r.status === 1, `exit ${r.status}`);
  check(`${name} -> the message says what it does not understand`, r.out.includes(needle), why(r, true).slice(0, 120));
  check(`${name} -> settings.json is byte-identical`, read(at(dir, '.claude/settings.json')) === original);
  check(`${name} -> the rest of the project was not written either`, !exists(at(dir, CONFIG_REL)));
}

// ---------------------------------------------------------------------------
section('17 - the self-check is the install\'s own last step, and "could not check" is never "checked"');
{
  const p22 = project('selfcheck-skipped');
  // The flag is passed EXPLICITLY here rather than left to the helper's default: this case is about
  // the flag, and a case that depends on a default is not testing what it says it tests.
  const r = install(p22, baseAnswers(), ['--no-seeds', '--no-selfcheck']);
  check('--no-selfcheck still exits 0', r.status === 0, why(r));
  check('and it says so on one line - a skipped gate that prints nothing reads exactly like a gate that passed',
    r.out.includes('self-check: SKIPPED'), why(r, true).slice(0, 160));
  check('no PASS line is printed for a run that never checked anything', !r.out.includes('self-check: PASS'));
  check('the project was still installed', exists(at(p22, CONFIG_REL)));
}
{
  // FAIL-CLOSED: a payload whose self-check script is not there at all. The install itself succeeds
  // and its files stay on disk - what must not happen is exit 0, because nothing verified them.
  const payload = path.join(tmpRoot, 'payload-without-selfcheck');
  copyTree(PLUGIN_ROOT, payload);
  fs.rmSync(path.join(payload, ...SELFCHECK_REL.split('/')));
  const p23 = project('selfcheck-unrunnable');
  const r = install(p23, baseAnswers(), ['--no-seeds'], { payload, selfcheck: true });
  check('an unrunnable self-check makes the install exit 1, not 0', r.status === 1, why(r, true).slice(0, 200));
  check('the message names exactly what could not run', r.out.includes(SELFCHECK_REL), why(r, true).slice(0, 200));
  check('and says plainly that the files WERE written and nothing was rolled back',
    r.out.includes('WERE written') && r.out.includes('nothing was rolled back'), why(r, true).slice(0, 200));
  check('which is true: the project layer really is on disk',
    exists(at(p23, CONFIG_REL)) && exists(at(p23, ROLES_REL)) && exists(at(p23, 'CLAUDE.md')));
}

// ---------------------------------------------------------------------------
// ADOPT MODE. Every case below installs into a project that ALREADY carries an AIWF surface, which
// is the only situation --adopt exists for. The properties under test are the ones an adopt run can
// get catastrophically wrong: a silent overwrite, a deletion, and a bookkeeping record that
// describes something other than what is on disk. So each case asserts the FILE (byte for byte) and
// the RECORD (both hashes and the override flag), never just the exit code.
section('18 - adopt: identical is adopted silently, different is decided, nothing is ever guessed');
const ADOPT_KEY = ROLES_REL;
const CLAUDE_KEY = 'CLAUDE.md#aiwf-core';
const MINE_ROLES = '{\n  "reviewer": { "engine": "claude", "model": "haiku", "effort": "low" }\n}\n';
// The render, obtained from a real install with the same answers rather than re-implemented here:
// a test that renders the artifact itself proves the test can render, not that the engine can.
const refProject = project('adopt-reference');
const refInstall = install(refProject, baseAnswers(), ['--no-seeds']);
check('the reference install (for the render bytes) exits 0', refInstall.status === 0, why(refInstall));
const RENDER_ROLES = read(at(refProject, ROLES_REL)) || '';
const RENDER_ROLES_HASH = sha256(RENDER_ROLES);
// The rendered CLAUDE.md REGION, taken from that same real install. The region carries no
// project-root value (the template has no {{resolvedRoot}} inside the markers), so the region one
// project renders is the region every project with these answers renders - which is what makes it a
// legitimate EXPECTED value here rather than a second implementation of the renderer.
const regionOfFile = (text) => {
  const start = (text || '').indexOf('<!-- BEGIN aiwf-core -->');
  const end = (text || '').indexOf('<!-- END aiwf-core -->');
  return start === -1 || end === -1 ? '' : text.slice(start, end + '<!-- END aiwf-core -->'.length);
};
const RENDER_REGION = regionOfFile(read(at(refProject, 'CLAUDE.md')));
check('the reference render carries a non-empty managed region (the expected value below is real)',
  RENDER_REGION.length > 0 && RENDER_REGION.includes('BEGIN aiwf-core'));

function adoptFile(name, table) {
  const file = path.join(tmpRoot, `adopt-${name}.json`);
  fs.writeFileSync(file, JSON.stringify(table, null, 2));
  return file;
}
function legacyProject(name, rolesText) {
  const dir = project(name);
  fs.mkdirSync(at(dir, '.claude/aiwf-native'), { recursive: true });
  fs.writeFileSync(at(dir, ROLES_REL), rolesText);
  return dir;
}
const record = (dir, key) => ((readJson(at(dir, CONFIG_REL)) || {})._aiwf || {}).managedRegions[key] || {};

// (a) identical to the render -> adopted CLEAN, in silence. Planted with CRLF on purpose: the hash
// is taken over LF-normalised text, so a CRLF checkout must read as identical - and because nothing
// is written, the file must still be CRLF afterwards.
{
  const mine = RENDER_ROLES.replace(/\n/g, '\r\n');
  const dir = legacyProject('adopt-identical', mine);
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(a) an identical pre-existing artifact adopts with NO resolution supplied at all', r.status === 0, why(r));
  check('(a) the report classifies it as identical and says nothing was written for it',
    r.out.includes('identical - adopted clean'), why(r, true).slice(0, 160));
  check('(a) the file is byte-identical, CRLF and all - an adopt of identical content writes nothing',
    read(at(dir, ROLES_REL)) === mine);
  const e = record(dir, ADOPT_KEY);
  check('(a) the record is CLEAN: upstream == local == sha256(render), override false',
    e.upstream === RENDER_ROLES_HASH && e.local === RENDER_ROLES_HASH && e.override === false, JSON.stringify(e));
  const before = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('(a) and the ordinary re-run afterwards is a zero diff',
    again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
}

// (b) different + keep-mine -> the bootstrap. Not one byte of the operator's file is touched, and
// the two hashes describe two different things on purpose.
{
  const dir = legacyProject('adopt-keep-mine', MINE_ROLES);
  const file = adoptFile('keep-mine', { [ADOPT_KEY]: 'keep-mine' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(b) different + keep-mine exits 0', r.status === 0, why(r));
  check('(b) the operator\'s file is byte-untouched', read(at(dir, ROLES_REL)) === MINE_ROLES);
  const e = record(dir, ADOPT_KEY);
  check('(b) the record is local = sha256(what is on disk), upstream = sha256(render), override TRUE',
    e.local === sha256(MINE_ROLES) && e.upstream === RENDER_ROLES_HASH && e.override === true, JSON.stringify(e));
  check('(b) the report names the decision', r.out.includes('keep-mine: yours stays'), why(r, true).slice(0, 160));

  // (h) idempotence: the ordinary re-run reads that record and re-applies nothing.
  const before = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('(h) a re-run after adopt is a zero diff, byte for byte',
    again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
  check('(h) and it says the artifact is held by the operator', again.out.includes('held by the operator (override)'));
}

// (c) different + take-new -> the render replaces the file, and the record is clean.
{
  const dir = legacyProject('adopt-take-new', MINE_ROLES);
  const file = adoptFile('take-new', { [ADOPT_KEY]: 'take-new' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(c) different + take-new exits 0', r.status === 0, why(r));
  check('(c) the file IS the render now', read(at(dir, ROLES_REL)) === RENDER_ROLES);
  const e = record(dir, ADOPT_KEY);
  check('(c) the record is CLEAN: upstream == local == sha256(render), override false',
    e.upstream === RENDER_ROLES_HASH && e.local === RENDER_ROLES_HASH && e.override === false, JSON.stringify(e));
  const before = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('(c) and the re-run afterwards is a zero diff',
    again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0);
}

// (d) different, nobody to ask -> FAIL-STOP with the address named, and zero bytes written. This is
// the case a guessing engine would "solve" by picking a default; the whole point is that it stops.
{
  const dir = legacyProject('adopt-unanswered', MINE_ROLES);
  const before = snapshot(dir);
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(d) a decision with nobody to ask BLOCKS (exit 1)', r.status === 1, `exit ${r.status}`);
  check('(d) the message names the address that needs an answer', r.out.includes(ADOPT_KEY), why(r, true).slice(0, 200));
  check('(d) and says there is nobody to ask (not interactive, no --adopt-file)',
    r.out.includes('not interactive') && r.out.includes('--adopt-file'), why(r, true).slice(0, 200));
  check('(d) NOT ONE BYTE was written', diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
  check('(d) and the classification is still reported, so the operator can answer it',
    r.out.includes('DECISION PENDING'), why(r, true).slice(0, 200));
}

// (d2) --dry-run never asks: it classifies, marks the decision pending and writes nothing.
{
  const dir = legacyProject('adopt-dryrun', MINE_ROLES);
  const before = snapshot(dir);
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--dry-run']);
  check('(d2) --adopt --dry-run exits 0 - a preview is not a refusal', r.status === 0, why(r));
  check('(d2) it shows the classification AND the pending decision',
    r.out.includes('ADOPT - the AIWF surface') && r.out.includes('DECISION PENDING'), why(r, true).slice(0, 200));
  check('(d2) it previews both sides of the decision', r.out.includes('yours  :') && r.out.includes('payload:'), why(r, true).slice(0, 200));
  check('(d2) and wrote nothing at all', diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
}

// (e) an adopt file naming an address this run never had to decide -> refused BY NAME. An answer
// that lands in no decision is a typo, and proceeding on it means an operator decision went nowhere.
{
  const dir = legacyProject('adopt-unknown-address', MINE_ROLES);
  const before = snapshot(dir);
  const file = adoptFile('unknown', { [ADOPT_KEY]: 'keep-mine', '.claude/aiwf-native/rolez.json': 'take-new' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(e) an unconsumed address BLOCKS the run', r.status === 1, `exit ${r.status}`);
  check('(e) and it is named', r.out.includes('.claude/aiwf-native/rolez.json'), why(r, true).slice(0, 200));
  check('(e) nothing was written', diffSnapshots(before, snapshot(dir)).length === 0);
}

// (e2) "merge" is not an adopt word: it is the update engine's, and adopt says where to get it.
{
  const dir = legacyProject('adopt-merge', MINE_ROLES);
  const before = snapshot(dir);
  const file = adoptFile('merge', { [ADOPT_KEY]: 'merge' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(e2) resolution "merge" at adopt time is refused', r.status === 1, `exit ${r.status}`);
  check('(e2) and it points at /pnp:update --resolve, which does have merge',
    r.out.includes('/pnp:update --resolve') && r.out.includes('keep-mine'), why(r, true).slice(0, 200));
  check('(e2) nothing was written', diffSnapshots(before, snapshot(dir)).length === 0);
}

// (e3) the two flag-shape refusals: a resolution file for a mode this run is not in would be read by
// nobody, and a flag with no value would be a silent fallback to "there is no file".
{
  const dir = legacyProject('adopt-flag-shapes', MINE_ROLES);
  const before = snapshot(dir);
  const file = adoptFile('orphan', { [ADOPT_KEY]: 'keep-mine' });
  const noMode = install(dir, baseAnswers(), ['--no-seeds', '--adopt-file', file]);
  check('(e3) --adopt-file without --adopt is refused', noMode.status === 1 && noMode.out.includes('only means something with --adopt'), why(noMode, true).slice(0, 160));
  const noValue = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file']);
  check('(e3) --adopt-file with no path is refused, not treated as "no file"',
    noValue.status === 1 && noValue.out.includes('needs the path'), why(noValue, true).slice(0, 160));
  check('(e3) neither refusal wrote anything', diffSnapshots(before, snapshot(dir)).length === 0);
}

// (f) a CLAUDE.md carrying a FOREIGN aiwf-core region: the region is adopted, the text around it is
// not the plugin's business in this branch any more than in any other.
{
  const dir = project('adopt-claude-region');
  const mine = '# My project\n\nMy own instructions.\n\n<!-- BEGIN aiwf-core -->\nSomeone else wrote this core.\n<!-- END aiwf-core -->\n\n## My tail\n\nStill mine.\n';
  fs.writeFileSync(at(dir, 'CLAUDE.md'), mine);
  const file = adoptFile('claude', { [CLAUDE_KEY]: 'keep-mine' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(f) adopting a foreign managed region exits 0', r.status === 0, why(r));
  check('(f) CLAUDE.md is byte-identical - keep-mine writes nothing, inside or outside the markers',
    read(at(dir, 'CLAUDE.md')) === mine);
  const e = record(dir, CLAUDE_KEY);
  check('(f) the record holds the region hashes: local = the region on disk, override TRUE',
    e.local === sha256(regionOfFile(mine)) && e.override === true, JSON.stringify(e));
  // The EXACT value, not "differs from something": upstream is the hash of the rendered REGION, and
  // an assertion that only says "not the whole file" is satisfied by any unrelated digest.
  check('(f) upstream is exactly sha256(the rendered region)',
    e.upstream === sha256(RENDER_REGION), `${e.upstream} vs ${sha256(RENDER_REGION)}`);
  const before = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('(f) and the re-run afterwards is a zero diff', again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0);
}

// (f2) the same region, adopted with take-new, over a CRLF file. This is the case that proves the
// write path: the region must be replaced, and every byte around it - line endings included - must
// come out of the file exactly as it went in.
{
  const dir = project('adopt-claude-take-new');
  const head = '# My project\r\n\r\nMy own instructions.\r\n\r\n';
  const tail = '\r\n\r\n## My tail\r\n\r\nStill mine.\r\n';
  const mine = `${head}<!-- BEGIN aiwf-core -->\r\nSomeone else wrote this core.\r\n<!-- END aiwf-core -->${tail}`;
  fs.writeFileSync(at(dir, 'CLAUDE.md'), mine);
  const file = adoptFile('claude-take-new', { [CLAUDE_KEY]: 'take-new' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(f2) adopting a foreign region with take-new exits 0', r.status === 0, why(r));
  const after = read(at(dir, 'CLAUDE.md')) || '';
  check('(f2) the region really was replaced by the render',
    sha256(regionOfFile(after)) === sha256(RENDER_REGION));
  check('(f2) the text OUTSIDE the markers is byte-identical, CRLF and all',
    after.slice(0, head.length) === head && after.slice(-tail.length) === tail, JSON.stringify(after.slice(0, 24)));
  check('(f2) the written region uses the file\'s own convention, so not one line ending in the file moved',
    /<!-- BEGIN aiwf-core -->\r\n/.test(after) && !/[^\r]\n/.test(after), `${(after.match(/\r\n/g) || []).length} CRLF, ${(after.match(/[^\r]\n/g) || []).length} bare LF`);
  const e = record(dir, CLAUDE_KEY);
  check('(f2) the record is CLEAN and both hashes are exactly sha256(the rendered region)',
    e.local === sha256(RENDER_REGION) && e.upstream === sha256(RENDER_REGION) && e.override === false, JSON.stringify(e));
  const before = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('(f2) and the re-run over the CRLF file is a zero diff',
    again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
}

// (g) --adopt on a project that already has an installation: refused in one line. Adopt bootstraps a
// LEGACY surface; re-deciding a recorded artifact is /pnp:update --resolve, which has a journal.
{
  const dir = project('adopt-already-installed');
  check('(g) the ordinary install first exits 0', install(dir, baseAnswers(), ['--no-seeds']).status === 0);
  const before = snapshot(dir);
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(g) --adopt on an installed project is refused (exit 1)', r.status === 1, `exit ${r.status}`);
  check('(g) the refusal says there is nothing to adopt and points at /pnp:update --resolve',
    r.out.includes('nothing here to adopt') && r.out.includes('/pnp:update --resolve'), why(r, true).slice(0, 200));
  check('(g) nothing was written', diffSnapshots(before, snapshot(dir)).length === 0);
}

// (i) the ownership-without-takeover machinery is unchanged by adopt: a rule that was already in
// settings.json is never claimed as ours, in this mode as in every other.
{
  const dir = legacyProject('adopt-settings', MINE_ROLES);
  fs.mkdirSync(at(dir, '.claude'), { recursive: true });
  fs.writeFileSync(at(dir, '.claude/settings.json'), JSON.stringify({
    permissions: { allow: ['Bash(ls:*)'], deny: [], ask: ['Bash(my-own-tool:*)', 'Bash(git commit:*)'] },
  }, null, 2));
  const file = adoptFile('settings', { [ADOPT_KEY]: 'keep-mine' });
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(i) the adopt run exits 0', r.status === 0, why(r));
  const settings = readJson(at(dir, '.claude/settings.json')) || {};
  const ask = (settings.permissions || {}).ask || [];
  const bk = (readJson(at(dir, CONFIG_REL)) || {})._aiwf || {};
  check('(i) a pre-existing identical ask rule did NOT become owned', !bk.ownedAskRules.includes('Bash(git commit:*)'));
  check('(i) the foreign rule is still there and is not owned either',
    ask.includes('Bash(my-own-tool:*)') && !bk.ownedAskRules.includes('Bash(my-own-tool:*)'));
  check('(i) the project\'s own allow posture was not replaced',
    JSON.stringify((settings.permissions || {}).allow) === JSON.stringify(['Bash(ls:*)']));
  check('(i) and every owned rule really is in settings.json', bk.ownedAskRules.length > 0 && bk.ownedAskRules.every((rule) => ask.includes(rule)));
}

// (j) the blockers adopt must NOT weaken.
{
  const dir = project('adopt-stale-foreign');
  fs.mkdirSync(at(dir, '.claude/agents'), { recursive: true });
  const foreign = '---\nname: qa\n---\nSomeone else wrote this.\n';
  fs.writeFileSync(at(dir, '.claude/agents/qa.md'), foreign);
  const before = snapshot(dir);
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--confirm-remove-stale']);
  check('(j) a foreign file at a path this config renders NOTHING at still blocks under --adopt', r.status === 1, `exit ${r.status}`);
  check('(j) the message says adopt does not cover it and why',
    r.out.includes('not recorded in _aiwf.managedRegions') && r.out.includes('--adopt does not cover it'), why(r, true).slice(0, 200));
  check('(j) the foreign file survived, flag or no flag', read(at(dir, '.claude/agents/qa.md')) === foreign);
  check('(j) nothing else was written either', diffSnapshots(before, snapshot(dir)).length === 0);
}
{
  // A hand-edited RECORDED artifact is bookkeeping's business, not adopt's - and because that
  // project has an _aiwf block, --adopt is refused before the conflict is even reached. Both halves
  // are asserted: the refusal WITH the flag, and the untouched hand-edit blocker without it.
  const dir = project('adopt-hand-edited');
  check('(j) the ordinary install exits 0', install(dir, baseAnswers(), ['--no-seeds']).status === 0);
  const edited = (read(at(dir, ROLES_REL)) || '').replace('"effort": "high"', '"effort": "low"');
  fs.writeFileSync(at(dir, ROLES_REL), edited);
  const before = snapshot(dir);
  const withFlag = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(j) --adopt over a recorded install is refused, so it cannot launder a hand edit',
    withFlag.status === 1 && withFlag.out.includes('nothing here to adopt'), why(withFlag, true).slice(0, 200));
  const without = install(dir, baseAnswers(), ['--no-seeds']);
  check('(j) and without the flag the hand-edit blocker is exactly what it always was',
    without.status === 1 && without.out.includes('was edited by hand') && without.out.includes('/pnp:update --resolve'),
    why(without, true).slice(0, 200));
  check('(j) neither run wrote anything', diffSnapshots(before, snapshot(dir)).length === 0);
  check('(j) and the hand edit is still there', read(at(dir, ROLES_REL)) === edited);
}

// (k) the ADVISORY superseded-legacy list: reported by name, and not one of them is touched.
{
  const dir = project('adopt-superseded');
  fs.mkdirSync(at(dir, '.claude/hooks'), { recursive: true });
  const hook = '// the project\'s own hand-maintained copy\nprocess.exit(0);\n';
  fs.writeFileSync(at(dir, '.claude/hooks/pretooluse-mutation-guard.js'), hook);
  fs.mkdirSync(at(dir, '.claude/commands'), { recursive: true });
  fs.writeFileSync(at(dir, '.claude/commands/review.md'), 'my own review command\n');
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(k) an adopt run with nothing to decide exits 0', r.status === 0, why(r));
  check('(k) the advisory list names the planted hook',
    r.out.includes('possible superseded legacy files') && r.out.includes('.claude/hooks/pretooluse-mutation-guard.js'),
    why(r, true).slice(0, 200));
  check('(k) and the planted command file, matched by skill name', r.out.includes('.claude/commands/review.md'), why(r, true).slice(0, 200));
  check('(k) it says plainly that nothing was touched and removal is a separate decision',
    r.out.includes('ADVISORY') && r.out.includes('never deletes'), why(r, true).slice(0, 200));
  check('(k) the hook file is byte-identical', read(at(dir, '.claude/hooks/pretooluse-mutation-guard.js')) === hook);
  check('(k) and the command file too', read(at(dir, '.claude/commands/review.md')) === 'my own review command\n');
  check('(k) the install itself really happened', exists(at(dir, CONFIG_REL)) && exists(at(dir, ROLES_REL)));
}

// ---------------------------------------------------------------------------
// (b2) a PARTIALLY answered adopt file. Working through a legacy surface a few files at a time is
// the normal way to use this, so the preview must show the answered ones classified and the rest
// pending - and exit 0, because a dry run that refuses to preview is not a preview. The same file
// without --dry-run still blocks by name: only the writing run demands a complete table.
{
  const dir = legacyProject('adopt-partial', MINE_ROLES);
  fs.writeFileSync(at(dir, 'CLAUDE.md'), '# Mine\n\n<!-- BEGIN aiwf-core -->\nnot the render\n<!-- END aiwf-core -->\n');
  const file = adoptFile('partial', { [ADOPT_KEY]: 'keep-mine' }); // CLAUDE.md#aiwf-core deliberately unanswered
  const before = snapshot(dir);
  const dry = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file, '--dry-run']);
  check('(b2) a partial adopt file with --dry-run previews instead of refusing (exit 0)', dry.status === 0, why(dry, true).slice(0, 200));
  check('(b2) the answered address shows its decision', dry.out.includes('keep-mine: yours stays'), why(dry, true).slice(0, 200));
  check('(b2) the unanswered one shows as pending, named', dry.out.includes(CLAUDE_KEY) && dry.out.includes('DECISION PENDING'), why(dry, true).slice(0, 200));
  check('(b2) and the dry run wrote nothing', diffSnapshots(before, snapshot(dir)).length === 0);
  const wet = install(dir, baseAnswers(), ['--no-seeds', '--adopt', '--adopt-file', file]);
  check('(b2) the SAME partial file without --dry-run blocks', wet.status === 1, `exit ${wet.status}`);
  check('(b2) naming the address that is still open', wet.out.includes(CLAUDE_KEY) && wet.out.includes('has no entry for it'), why(wet, true).slice(0, 200));
  check('(b2) and that run wrote nothing either', diffSnapshots(before, snapshot(dir)).length === 0);
}

// (b3) the advisory scan is bounded in TRAVERSAL, not just in what it prints. Driven in-process
// with an injected readdir, because "it stopped early" is a claim about how much it read, and an
// output-only assertion cannot tell a capped list from a complete one.
{
  const dir = project('adopt-scan-bound');
  const planted = 12;
  for (let i = 0; i < planted; i += 1) {
    fs.mkdirSync(at(dir, `docs/area-${String(i).padStart(2, '0')}`), { recursive: true });
    fs.writeFileSync(at(dir, `docs/area-${String(i).padStart(2, '0')}/WORKFLOW.md`), 'mine\n');
  }
  let dirsRead = 0;
  const counting = (d) => { dirsRead += 1; return fs.readdirSync(d, { withFileTypes: true }); };
  const capped = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: dir, readdir: counting, limit: 5 });
  check('(b3) the scan returns at most its cap', capped.hits.length === 5, `${capped.hits.length} hit(s)`);
  check('(b3) and says the list is truncated rather than presenting it as complete', capped.truncated === true);
  check('(b3) it stopped READING once the cap was full (it never enumerated all 12 directories)',
    dirsRead <= 7 && capped.dirsRead === dirsRead, `${dirsRead} directories read for ${planted} planted`);
  // The control: with room for all of them it finds all of them, so the bound above is the cap
  // doing its job and not a scan that simply cannot see past five files.
  dirsRead = 0;
  const full = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: dir, readdir: counting, limit: 50 });
  check('(b3) with room, the same scan finds every planted file and reports no truncation',
    full.hits.length === planted && full.truncated === false, `${full.hits.length} hit(s)`);
  check('(b3) the truncated result names its cause, so a report can say WHY it is a sample',
    capped.causes.includes('hitLimit') && full.causes.length === 0, capped.causes.join(', '));
}

// (b3-i) THE HIT CAP IS NOT A TRAVERSAL BOUND. A sparse tree with nothing matching satisfies the hit
// cap forever, so without a separate directory budget the scan would read a whole repository to
// print nothing - and report that nothing as complete.
{
  const dir = project('adopt-scan-sparse');
  const planted = 30;
  for (let i = 0; i < planted; i += 1) {
    fs.mkdirSync(at(dir, `docs/empty-${String(i).padStart(2, '0')}`), { recursive: true });
    fs.writeFileSync(at(dir, `docs/empty-${String(i).padStart(2, '0')}/notes.md`), 'nothing that matches\n');
  }
  let dirsRead = 0;
  const counting = (d) => { dirsRead += 1; return fs.readdirSync(d, { withFileTypes: true }); };
  const bounded = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: dir, readdir: counting, limit: 1, maxDirs: 5 });
  check('(b3-i) with NO matches at all, the directory budget still stops the walk',
    dirsRead === 5 && bounded.dirsRead === 5, `${dirsRead} directories read`);
  check('(b3-i) and the empty result is reported as TRUNCATED, not as "nothing is here"',
    bounded.truncated === true && bounded.hits.length === 0 && bounded.causes.includes('traversal'), bounded.causes.join(', '));
  dirsRead = 0;
  const whole = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: dir, readdir: counting, limit: 1, maxDirs: 500 });
  check('(b3-i) control: with a budget that fits, the same tree is walked whole and is NOT truncated',
    dirsRead === planted + 1 && whole.truncated === false && whole.hits.length === 0, `${dirsRead} directories read`);
}

// (b3-ii) the class-root boundary: the hit cap filling exactly at the END of one root must not leave
// the next root unvisited AND the result claiming to be complete. Two hooks fill a cap of two; the
// matching doc under docs/ is then never seen.
{
  const dir = project('adopt-scan-boundary');
  fs.mkdirSync(at(dir, '.claude/hooks'), { recursive: true });
  fs.writeFileSync(at(dir, '.claude/hooks/pretooluse-mutation-guard.js'), 'mine\n');
  fs.writeFileSync(at(dir, '.claude/hooks/pretooluse-dispatch-gate.js'), 'mine\n');
  fs.mkdirSync(at(dir, 'docs'), { recursive: true });
  fs.writeFileSync(at(dir, 'docs/WORKFLOW.md'), 'mine\n');
  const atBoundary = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: dir, limit: 2 });
  check('(b3-ii) the cap filled exactly at the end of the first root returns exactly the cap',
    atBoundary.hits.length === 2 && atBoundary.hits.every((h) => h.rel.startsWith('.claude/hooks/')), atBoundary.hits.map((h) => h.rel).join(', '));
  check('(b3-ii) and the unvisited root makes the result TRUNCATED, not silently complete',
    atBoundary.truncated === true && atBoundary.causes.includes('hitLimit'), atBoundary.causes.join(', '));
  const roomy = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: dir, limit: 50 });
  check('(b3-ii) control: with room, the file in the second root IS found and nothing is truncated',
    roomy.hits.length === 3 && roomy.hits.some((h) => h.rel === 'docs/WORKFLOW.md') && roomy.truncated === false,
    roomy.hits.map((h) => h.rel).join(', '));
}

// (b3-iii) the depth cutoff and (b3-iv) the per-directory cutoff are stops too, and a stop that does
// not say so is the same defect as a cap that does not say so.
{
  const deep = project('adopt-scan-deep');
  const chain = Array.from({ length: 10 }, (_, i) => `l${i}`).join('/');
  fs.mkdirSync(at(deep, `docs/${chain}`), { recursive: true });
  fs.writeFileSync(at(deep, `docs/${chain}/WORKFLOW.md`), 'too deep to see\n');
  const cut = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: deep });
  check('(b3-iii) a tree deeper than the scan follows marks the result truncated, with the cause',
    cut.truncated === true && cut.causes.includes('depth') && cut.hits.length === 0, cut.causes.join(', '));

  const shallow = project('adopt-scan-shallow');
  fs.mkdirSync(at(shallow, 'docs/one'), { recursive: true });
  fs.writeFileSync(at(shallow, 'docs/one/WORKFLOW.md'), 'visible\n');
  const ok = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: shallow });
  check('(b3-iii) control: a shallow tree is found in full and is NOT truncated',
    ok.truncated === false && ok.hits.length === 1 && ok.causes.length === 0, ok.causes.join(', '));

  const wide = project('adopt-scan-wide');
  fs.mkdirSync(at(wide, 'docs'), { recursive: true });
  for (let i = 0; i < 5; i += 1) fs.writeFileSync(at(wide, `docs/file-${i}.md`), 'nothing that matches\n');
  const clipped = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: wide, maxPerDir: 2 });
  check('(b3-iv) a directory with more entries than the scan reads marks the result truncated',
    clipped.truncated === true && clipped.causes.includes('perDir'), clipped.causes.join(', '));
  const readAll = scanSupersededLegacy({ pluginRoot: PLUGIN_ROOT, projectRoot: wide, maxPerDir: 50 });
  check('(b3-iv) control: with the per-directory bound above the entry count, nothing is truncated',
    readAll.truncated === false && readAll.causes.length === 0, readAll.causes.join(', '));
}

// (b3-v) and the report SAYS it: a truncated scan that found nothing must not print as silence.
{
  const dir = project('adopt-scan-report');
  fs.mkdirSync(at(dir, '.claude/hooks'), { recursive: true });
  fs.writeFileSync(at(dir, '.claude/hooks/pretooluse-mutation-guard.js'), 'mine\n');
  const chain = Array.from({ length: 10 }, (_, i) => `l${i}`).join('/');
  fs.mkdirSync(at(dir, `docs/${chain}`), { recursive: true });
  fs.writeFileSync(at(dir, `docs/${chain}/WORKFLOW.md`), 'too deep to see\n');
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(b3-v) the adopt run exits 0', r.status === 0, why(r));
  check('(b3-v) the report says the scan STOPPED EARLY and names the cause',
    r.out.includes('STOPPED EARLY') && r.out.includes('deeper than this scan follows'), why(r, true).slice(0, 240));
  check('(b3-v) and says plainly that the list is a sample, not an inventory',
    r.out.includes('sample, not an inventory'), why(r, true).slice(0, 240));
}

// (b4) the --adopt refusal is decided on the PRESENCE of _aiwf, never on its shape. A malformed
// block is the dangerous case: adopting over it would stamp a fresh one and destroy whatever it
// recorded. Both entrypoints, because a refusal that lives in only one of them is not a refusal.
for (const [name, value] of [['a list', []], ['a string', 'corrupt'], ['null', null]]) {
  const viaInterview = project(`adopt-aiwf-${name.replace(/\W+/g, '-')}-interview`);
  const viaGenerate = project(`adopt-aiwf-${name.replace(/\W+/g, '-')}-generate`);
  for (const [dir, run, label] of [[viaInterview, install, 'interview.mjs'], [viaGenerate, generateInstall, 'generate.mjs']]) {
    fs.mkdirSync(at(dir, '.claude/aiwf-native'), { recursive: true });
    fs.writeFileSync(at(dir, CONFIG_REL), JSON.stringify({ _aiwf: value }, null, 2));
    const before = snapshot(dir);
    const r = run(dir, baseAnswers(), ['--no-seeds', '--adopt']);
    check(`(b4) _aiwf = ${name} refuses --adopt via ${label} (exit 1)`, r.status === 1, `exit ${r.status}`);
    check(`(b4) _aiwf = ${name} via ${label}: the message names the malformed bookkeeping`,
      r.out.includes('is not a bookkeeping object'), why(r, true).slice(0, 200));
    check(`(b4) _aiwf = ${name} via ${label}: nothing was written over it`,
      diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
  }
}
{
  // The control: a config WITHOUT the key is not refused, so the rule above is about presence and
  // not about "a config file exists".
  const dir = project('adopt-config-no-aiwf');
  fs.mkdirSync(at(dir, '.claude/aiwf-native'), { recursive: true });
  fs.writeFileSync(at(dir, CONFIG_REL), JSON.stringify({ os: 'windows' }, null, 2));
  const r = install(dir, baseAnswers(), ['--no-seeds', '--adopt']);
  check('(b4) a config with no _aiwf key at all is NOT refused - adopt proceeds', r.status === 0, why(r, true).slice(0, 200));
  check('(b4) and it now carries real bookkeeping', !!((readJson(at(dir, CONFIG_REL)) || {})._aiwf || {}).managedRegions);
}

// ---------------------------------------------------------------------------
// The one managed file that also holds the operator's own text is CLAUDE.md, and every branch that
// writes it splices bytes rather than re-encoding the file. This section is about the WRITE, not
// about adopt: the append and re-render branches predate it and are asserted here for the first
// time. A CRLF checkout is the case that catches a whole-file normalisation - the region comes out
// right and every line around it is silently rewritten.
section('19 - CLAUDE.md: the bytes outside the markers survive every write branch, CRLF included');
{
  const dir = project('crlf-claude');
  const head = '# My project\r\n\r\nMy own instructions.\r\n';
  fs.writeFileSync(at(dir, 'CLAUDE.md'), head);
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check('append into a CRLF CLAUDE.md exits 0', r.status === 0, why(r));
  let after = read(at(dir, 'CLAUDE.md')) || '';
  check('the operator\'s bytes are still there, byte for byte', after.slice(0, head.length) === head);
  check('the region was appended', after.includes('<!-- BEGIN aiwf-core -->') && after.includes('<!-- END aiwf-core -->'));
  check('and NOT ONE line ending in the file was rewritten (no bare LF anywhere)',
    !/[^\r]\n/.test(after), `${(after.match(/[^\r]\n/g) || []).length} bare LF`);
  const beforeRerun = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('a re-run over the CRLF file is a zero diff', again.status === 0 && diffSnapshots(beforeRerun, snapshot(dir)).length === 0,
    diffSnapshots(beforeRerun, snapshot(dir)).join(', '));

  // The clean RE-RENDER branch, on the same CRLF file. `project.name` is rendered INSIDE the
  // markers (templates/CLAUDE.md.tmpl line 6), so changing it is what actually re-renders the
  // region - a value from the template's operator zone would leave this branch untaken.
  const changed = baseAnswers();
  changed.project.name = 'Renamed';
  const rr = install(dir, changed, ['--no-seeds']);
  after = read(at(dir, 'CLAUDE.md')) || '';
  check('the re-render exits 0 and really re-rendered the region',
    rr.status === 0 && regionOfFile(after).includes('Renamed'), why(rr, true).slice(0, 160));
  check('the operator\'s bytes are STILL byte-identical after a re-render', after.slice(0, head.length) === head);
  check('and the re-rendered file still has no bare LF', !/[^\r]\n/.test(after), `${(after.match(/[^\r]\n/g) || []).length} bare LF`);
  const beforeIdem = snapshot(dir);
  const idem = install(dir, changed, ['--no-seeds']);
  check('and the re-run after the re-render is a zero diff', idem.status === 0 && diffSnapshots(beforeIdem, snapshot(dir)).length === 0);
}
{
  // The control for "no bare LF": an LF project must stay LF, or the assertion above would be true
  // of an engine that simply wrote CRLF everywhere.
  const dir = project('lf-claude');
  const head = '# My project\n\nMy own instructions.\n';
  fs.writeFileSync(at(dir, 'CLAUDE.md'), head);
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  const after = read(at(dir, 'CLAUDE.md')) || '';
  check('an LF CLAUDE.md stays LF (the CRLF assertions are not true of every branch)',
    r.status === 0 && after.slice(0, head.length) === head && !after.includes('\r'), why(r));
}

// ---------------------------------------------------------------------------
// The template-contract comment is documentation for whoever edits a template; it addresses the
// generate engine and has no reader in the rendered artifact. Both directions are asserted here,
// because "the render does not contain it" is also what a scan of an empty file reports: the
// TEMPLATE still carries the block, the RENDER does not.
section('20 - the TEMPLATE CONTRACT block is stripped from every render');
{
  const dir = project('contract-strip');
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check('install exits 0', r.status === 0, why(r));
  const writer = read(at(dir, '.claude/agents/writer.md')) || '';
  const reviewer = read(at(dir, '.claude/agents/reviewer.md')) || '';
  const overrides = read(at(dir, 'docs/ai/PROJECT_OVERRIDES.md')) || '';
  const claudeMd = read(at(dir, 'CLAUDE.md')) || '';
  check('the rendered writer agent carries no TEMPLATE CONTRACT block', !writer.includes('TEMPLATE CONTRACT'));
  check('nor does the rendered reviewer agent', !reviewer.includes('TEMPLATE CONTRACT'));
  check('nor does the seeded overrides document', !overrides.includes('TEMPLATE CONTRACT'));
  check('nor does CLAUDE.md', !claudeMd.includes('TEMPLATE CONTRACT'));
  // The control: the TEMPLATES still carry the block, so the assertions above are about the
  // stripping and not about a payload that never had the text.
  const tmplWriter = read(path.join(PLUGIN_ROOT, 'templates', 'agents', 'writer.md.tmpl')) || '';
  const tmplOverrides = read(path.join(PLUGIN_ROOT, 'templates', 'PROJECT_OVERRIDES.md.tmpl')) || '';
  check('the writer TEMPLATE still carries it (the control: there was something to strip)',
    tmplWriter.includes('<!-- TEMPLATE CONTRACT'));
  check('and so does the overrides TEMPLATE', tmplOverrides.includes('<!-- TEMPLATE CONTRACT'));
  // Stripping is NARROW: an ordinary HTML comment a template really wants in its output survives.
  check('an ordinary HTML comment survives the render (the region markers are one)',
    claudeMd.includes('<!-- BEGIN aiwf-core -->') && claudeMd.includes('Managed by PromptAndPray'));
  // The rendered writer's overrides path is ONE native path, not a Windows root joined to a POSIX
  // separator. os is `windows` in baseAnswers(), so the whole path is backslashed.
  const line = writer.split('\n').find((l) => l.includes('PROJECT_OVERRIDES.md')) || '';
  check('the overrides path in the rendered writer is native for config.os (no mixed slashes)',
    line.includes(`${dir}\\docs\\ai\\PROJECT_OVERRIDES.md`), line.trim().slice(0, 160));
  // ... and the other channel really renders the other separator.
  const posix = project('contract-strip-posix');
  const linuxAnswers = baseAnswers();
  linuxAnswers.os = 'linux';
  const r2 = install(posix, linuxAnswers, ['--no-seeds']);
  const writerPosix = read(at(posix, '.claude/agents/writer.md')) || '';
  const linePosix = writerPosix.split('\n').find((l) => l.includes('PROJECT_OVERRIDES.md')) || '';
  check('a linux install exits 0', r2.status === 0, why(r2));
  check('and renders the overrides path with forward slashes only',
    linePosix.includes('/docs/ai/PROJECT_OVERRIDES.md') && !linePosix.includes('\\'), linePosix.trim().slice(0, 160));
}

// ---------------------------------------------------------------------------
// A `<projectRoot>` render carries the root it was made for. Move the project (a rename, a copy,
// a worktree) and those owned rules are addressed to a directory this project no longer has. The
// re-run must RETIRE its own stale renders - without touching a foreign rule that merely mentions
// the old path, and without tombstoning (a tombstone means the OPERATOR removed it).
section('21 - a changed project root retires the owned rules rendered for the old one');
{
  const oldRoot = project('root-a');
  const r1 = install(oldRoot, baseAnswers(), ['--no-seeds']);
  check('the install at root A exits 0', r1.status === 0, why(r1));
  const ownedA = ((readJson(at(oldRoot, CONFIG_REL)) || {})._aiwf || {}).ownedAskRules || [];
  const staleRules = ownedA.filter((rule) => rule.includes(oldRoot));
  check('the fixture precondition holds: root A rules are owned', staleRules.length === 3, `${staleRules.length} rules`);

  // The project MOVES: same tree, new path. A foreign rule that happens to mention the old root
  // goes in by hand - it is the operator's, and nothing here may touch it.
  const newRoot = path.join(tmpRoot, 'root-b');
  copyTree(oldRoot, newRoot);
  const FOREIGN = `Bash(my-own-tool --repo ${oldRoot}:*)`;
  const settingsB = readJson(at(newRoot, '.claude/settings.json'));
  settingsB.permissions.ask.push(FOREIGN);
  fs.writeFileSync(at(newRoot, '.claude/settings.json'), JSON.stringify(settingsB, null, 2));

  const r2 = install(newRoot, baseAnswers(), ['--no-seeds']);
  check('the re-run at root B exits 0', r2.status === 0, why(r2));
  const bk = (readJson(at(newRoot, CONFIG_REL)) || {})._aiwf || {};
  const ask = (readJson(at(newRoot, '.claude/settings.json')) || {}).permissions.ask || [];
  check('every root-A rule left settings.json', !staleRules.some((rule) => ask.includes(rule)),
    staleRules.filter((rule) => ask.includes(rule)).join(', '));
  check('and left ownedAskRules', !staleRules.some((rule) => (bk.ownedAskRules || []).includes(rule)));
  check('none of them was tombstoned (the engine retired its own render; nobody removed it by hand)',
    !staleRules.some((rule) => (bk.suppressedAskRules || []).includes(rule)), JSON.stringify(bk.suppressedAskRules));
  check('the root-B rules are there instead', ask.includes(`Bash(git -C ${newRoot} push:*)`)
    && (bk.ownedAskRules || []).includes(`Bash(git -C ${newRoot} push:*)`));
  check('the FOREIGN rule naming the old root is untouched', ask.includes(FOREIGN));
  check('and it never became owned', !(bk.ownedAskRules || []).includes(FOREIGN));
  check('the report says what it removed', r2.out.includes('no longer in the payload\'s desired set'), why(r2, true).slice(0, 200));
  // Idempotent: the retirement happens once, and the next run has nothing left to do.
  const before = snapshot(newRoot);
  const r3 = install(newRoot, baseAnswers(), ['--no-seeds']);
  check('the next re-run at root B is a zero diff', r3.status === 0 && diffSnapshots(before, snapshot(newRoot)).length === 0,
    diffSnapshots(before, snapshot(newRoot)).join(', '));
}

// ---------------------------------------------------------------------------
try { fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(`fixtures left behind: ${fs.existsSync(tmpRoot) ? tmpRoot : 'none'}`);
console.log(failures === 0 ? 'SETUP SUITE: PASS' : 'SETUP SUITE: FAIL');
process.exit(failures === 0 ? 0 : 1);
