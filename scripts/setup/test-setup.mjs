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
 *      force, and the superseded-legacy list is advisory text that touches nothing;
 *  10. a project that ALREADY carries plans under `<plansDir>/active/`, or an overrides document, is
 *      warned about on both paths - the interview at the question, the generator as a note in its
 *      plan and report - and is never blocked, with a clean project as the flipping control.
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
  // The blanket allow exists once per SHELL TOOL the ask list gates, because a permission rule is
  // addressed to a tool: a posture that allowed only `Bash(*)` while the ask list carries
  // `PowerShell(...)` rules would be half a posture.
  check('the factory allow/deny posture applied to a project with no permissions block of its own (both shell tools)',
    JSON.stringify((settings.permissions || {}).allow) === JSON.stringify(['Bash(*)', 'PowerShell(*)']) && JSON.stringify((settings.permissions || {}).deny) === JSON.stringify([]));
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
// The transport is the only thing the CLI adds, so the flow is driven here with a scripted `ask`.
// Everything NOT in this map is answered with an empty string and therefore takes the schema default
// - which is what proves the defaults really reach the operator instead of being hardcoded somewhere
// downstream. The keys with no schema default of their own (a required name, the models and efforts)
// have to be answered or the question would repeat forever.
const SCRIPTED_ANSWERS = new Map([
  ['Project name', 'Interviewed'],
  ['Writer model', 'claude-opus-5[1m]'],
  ['Writer reasoning effort', 'high'],
  ['reviewer: model', 'opus'],
  ['reviewer: reasoning effort', 'high'],
  ['qa: model', 'sonnet'],
  ['qa: reasoning effort', 'medium'],
]);
const scriptedAsk = async (question) => {
  for (const [needle, value] of SCRIPTED_ANSWERS) if (question.includes(needle)) return value;
  return '';
};
const loadSchemaJson = () => JSON.parse(read(path.join(PLUGIN_ROOT, 'schema', 'aiwf.config.schema.json')));

section('12 - the interactive question flow itself (scripted answers, no readline)');
{
  const answers = await runInterview({ schema: loadSchemaJson(), ask: scriptedAsk });
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
section('12b - a project that already has plans is WARNED about, on both paths, and never blocked');
{
  // The situation: setup is pointed at a project whose `docs/backlogs/active/` is already full of
  // somebody else's plans, and whose overrides document already exists. Nothing here is an error -
  // it may be exactly what the operator wants - but `enforcement.dispatchGate: off-plan` will read
  // every one of those PLAN_*.md files as an active pnp plan, so it is never adopted in silence.
  const p = project('inherited-plans');
  fs.mkdirSync(at(p, 'docs/backlogs/active'), { recursive: true });
  fs.writeFileSync(at(p, 'docs/backlogs/active/PLAN_FOREIGN.md'), '# somebody else\n\n## FOR-001 - a ticket\n');
  fs.writeFileSync(at(p, 'docs/backlogs/active/PLAN_OTHER.md'), '# and another\n');
  // Two shapes that must NOT be counted, because Gate 2 does not read them either: a file that is
  // not a PLAN_*.md, and a DIRECTORY whose name happens to match the pattern.
  fs.writeFileSync(at(p, 'docs/backlogs/active/notes.md'), 'not a plan\n');
  fs.mkdirSync(at(p, 'docs/backlogs/active/PLAN_DIRECTORY.md'), { recursive: true });
  fs.mkdirSync(at(p, 'docs/ai'), { recursive: true });
  fs.writeFileSync(at(p, 'docs/ai/PROJECT_OVERRIDES.md'), '# my own overrides\n');

  const said = [];
  const answers = await runInterview({
    schema: loadSchemaJson(), ask: scriptedAsk, projectRoot: p, out: { write: (s) => said.push(s) },
  });
  const heard = said.join('');
  check('the interview warns AT the plans question, counting only what Gate 2 would read (2, not 4)',
    heard.includes('2 existing PLAN_*.md in docs/backlogs/active'), heard.split('\n').filter((l) => l.includes('PLAN_')).join(' | ') || '(no such line)');
  check('and it names the consequence, not just the count',
    heard.includes('Gate 2 off-plan will read them as active pnp plans'));
  check('the overrides question says the document is already there and will not be rewritten',
    heard.includes('docs/ai/PROJECT_OVERRIDES.md already exists') && heard.includes('never rewrites it'),
    heard.split('\n').filter((l) => l.includes('PROJECT_OVERRIDES')).join(' | ') || '(no such line)');
  check('the warning changes no answer: the schema defaults are still what the interview returns',
    answers.paths.plansDir === 'docs/backlogs' && answers.paths.overridesDoc === 'docs/ai/PROJECT_OVERRIDES.md',
    JSON.stringify(answers.paths));

  // The SECOND path: the generator says it too, so --dry-run and the non-interactive --answers-file
  // install (which never sees a question) are covered as well.
  const before = snapshot(p);
  const dry = install(p, baseAnswers(), ['--no-seeds', '--dry-run']);
  check('--dry-run exits 0 - a full plans directory is a warning, not a blocker', dry.status === 0, why(dry));
  check('the dry-run report carries the same line as a note',
    dry.out.includes('note   2 existing PLAN_*.md in docs/backlogs/active')
    && dry.out.includes('Gate 2 off-plan will read them as active pnp plans'),
    dry.out.split('\n').filter((l) => l.includes('PLAN_*.md')).join(' | ') || '(no such line)');
  check('--dry-run still wrote nothing at all', diffSnapshots(before, snapshot(p)).length === 0,
    diffSnapshots(before, snapshot(p)).join(', '));

  const real = install(p, baseAnswers(), ['--no-seeds']);
  check('and the real install goes through, warning and all', real.status === 0, why(real));
  check('the foreign plans are exactly as they were', read(at(p, 'docs/backlogs/active/PLAN_OTHER.md')) === '# and another\n');
  check('the operator\'s overrides document was not rewritten', read(at(p, 'docs/ai/PROJECT_OVERRIDES.md')) === '# my own overrides\n');
}
{
  // The flipping control: the same two checks on a project that has neither. A warning that cannot
  // be absent is not a warning.
  const clean = project('no-inherited-plans');
  const said = [];
  await runInterview({
    schema: loadSchemaJson(), ask: scriptedAsk, projectRoot: clean, out: { write: (s) => said.push(s) },
  });
  check('a clean project hears nothing about plans or an overrides document',
    !said.join('').includes('existing PLAN_*.md') && !said.join('').includes('already exists'),
    said.join('').split('\n').filter((l) => l.trim().startsWith('docs')).join(' | ') || 'silent');
  const dry = install(clean, baseAnswers(), ['--no-seeds', '--dry-run']);
  check('and its dry-run report carries no such note', dry.status === 0 && !dry.out.includes('existing PLAN_*.md'), why(dry, true).slice(0, 120));
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
{
  // The other branch: a self-check that RAN and came back RED. What is under test here is the
  // caller's VERDICT, not the engine's report - and specifically the distinction the operator acts
  // on, because the two meanings call for opposite responses: either the project really is
  // inconsistent, or this run could not PROVE part of the contract in this environment. The second
  // is not hypothetical - a bash host that could not resolve the paths handed to it turned 52
  // assertions red at once, about the machine rather than about the project.
  //
  // The child is a payload copy whose self-check exits non-zero with a report on stdout. Doubling
  // the CHILD is the same move the fail-closed case above makes by removing it: the production path
  // under test is interview.mjs -> finishWithSelfCheck's red branch. The real engine's own red
  // report is exercised end to end by the update suite (`sc-red`), and running it again here would
  // cost this suite a measured ~105 s - `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .
  // --project-fixture .`, timed on the machine this was written on - to re-prove someone else's
  // contract.
  const payload = path.join(tmpRoot, 'payload-red-selfcheck');
  copyTree(PLUGIN_ROOT, payload);
  fs.writeFileSync(path.join(payload, ...SELFCHECK_REL.split('/')), [
    "'use strict';",
    "console.log('  [FAIL] a bash host is available to run the sh resolver - the contract is UNPROVEN in this run');",
    "console.log('==== 991/992 assertions passed ====');",
    "console.log('FAILURES:');",
    "console.log('  - [ROLE RESOLVER (bash channel)] a bash host is available to run the sh resolver');",
    'process.exitCode = 1;',
    '',
  ].join('\n'));
  const p24 = project('selfcheck-red');
  const r = install(p24, baseAnswers(), ['--no-seeds'], { payload, selfcheck: true });
  check('a self-check that RAN and came back RED makes the install exit 1, not 0', r.status === 1, why(r, true).slice(0, 200));
  check('the child\'s own report reached the operator verbatim',
    r.out.includes('FAILURES:') && r.out.includes('991/992 assertions passed'), why(r, true).slice(0, 200));
  check('the verdict still says the files WERE written and nothing was rolled back',
    r.out.includes('WERE written') && r.out.includes('nothing was rolled back'), why(r, true).slice(0, 200));
  check('and it distinguishes an inconsistent project from a contract this run could not prove here',
    r.out.includes('could not prove part of the contract in this environment')
    && r.out.includes('a host the checks need was missing or unusable'), why(r, true).slice(0, 200));
  check('which is true: the project layer really is on disk',
    exists(at(p24, CONFIG_REL)) && exists(at(p24, ROLES_REL)) && exists(at(p24, 'CLAUDE.md')));
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
  // separator. os is `windows` in baseAnswers(), so the WHOLE path is backslashed - the project root
  // included, whatever the host machine's own separator is. The expectation is therefore built by
  // re-joining the root's segments with the CHANNEL's separator: pasting `${dir}` in raw asserts the
  // host's separator instead, which is the same string on Windows and a different one on POSIX.
  const nativeFor = (osChannel, p) => p.split(/[\\/]/).join(osChannel === 'windows' ? '\\' : '/');
  const expectedOverrides = nativeFor(baseAnswers().os, `${dir}/docs/ai/PROJECT_OVERRIDES.md`);
  const line = writer.split('\n').find((l) => l.includes('PROJECT_OVERRIDES.md')) || '';
  check('the overrides path in the rendered writer is native for config.os (no mixed slashes)',
    line.includes(expectedOverrides), `${line.trim().slice(0, 160)} | expected ${expectedOverrides}`);
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
  // DERIVED from the payload, not a literal. The `<projectRoot>` rules are three push/merge/rebase
  // forms PER SHELL TOOL, so the number moved from 3 to 6 the day the ruleset gained its PowerShell
  // mirror - and it would move again for a third tool. The `> 0` half keeps the precondition from
  // going vacuous if the template ever lost those rules altogether.
  const templatedRules = (((readJson(path.join(PLUGIN_ROOT, 'templates', 'settings.ask-ruleset.json')) || {})
    .permissions || {}).ask || []).filter((rule) => rule.includes('<projectRoot>'));
  check('the fixture precondition holds: root A rules are owned, one per templated payload rule',
    templatedRules.length > 0 && staleRules.length === templatedRules.length,
    `${staleRules.length} owned vs ${templatedRules.length} templated`);

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

section('22 - the audit table: a fresh install gets it without being asked, and /pnp:roles rolls it over');
{
  // THE FRESH-INSTALL PROOF. The interview gained no new question in 0.2.0 and the answers file
  // below carries no `review.plan|code|docs` at all - the three rows arrive from the schema's own
  // `default` through collectDefaults. If that ever stopped being true, every new installation would
  // start with a config the renderer cannot render.
  const p22 = project('audit-table');
  const answers = baseAnswers();
  check('the answers file carries NO review rows (the interview asks nothing about them)',
    answers.review.plan === undefined && answers.review.code === undefined && answers.review.docs === undefined);
  const r = install(p22, answers, ['--no-seeds']);
  check('install exits 0', r.status === 0, why(r));
  const cfg = readJson(at(p22, CONFIG_REL)) || {};
  check('the config carries the factory table 2 / 1 / 1, from the schema defaults',
    JSON.stringify((cfg.review || {}).plan) === '{"passes":2}'
    && JSON.stringify((cfg.review || {}).code) === '{"passes":1}'
    && JSON.stringify((cfg.review || {}).docs) === '{"passes":1}', JSON.stringify(cfg.review));
  const roles = readJson(at(p22, ROLES_REL)) || {};
  // Every row is INHERITED here, so the rendered row is the Reviewer's host whole - which is the
  // whole point: nothing about who audits what changed when the table arrived.
  const rv = cfg.roles.reviewer;
  check('roles.json renders the EFFECTIVE row of each class (inherited = the Reviewer, whole)',
    ['plan', 'code', 'docs'].every((cls) => {
      const row = (roles.review || {})[cls];
      return row && row.engine === rv.engine && row.model === rv.model && row.effort === rv.effort
        && row.passes === cfg.review[cls].passes;
    }), JSON.stringify(roles.review));

  // The round trip, through the real /pnp:roles entrypoint an operator uses.
  const roleCmd = (args) => {
    const rr = spawnSync(process.execPath, [
      path.join(PLUGIN_ROOT, 'scripts', 'setup', 'aiwf-roles.mjs'), ...args,
      '--project-root', p22, '--plugin-root', PLUGIN_ROOT, '--no-selfcheck',
    ], { encoding: 'utf8' });
    return { status: rr.status, out: (rr.stdout || '') + (rr.stderr || '') };
  };
  // Moving the Reviewer to codex makes its Claude agent file stale, and deleting a file is a
  // destructive step: the run must refuse first and say which file it wants to remove.
  const a = roleCmd(['--set', 'reviewer.engine=codex', '--set', 'reviewer.model=codex-atom-2', '--set', 'reviewer.effort=high']);
  check('claude -> codex without --confirm-remove-stale refuses (exit 1) and leaves the agent file alone',
    a.status === 1 && exists(at(p22, '.claude/agents/reviewer.md')), `exit ${a.status}: ${a.out.trim().split('\n').pop()}`);
  check('and it wrote nothing at all - the config still says claude',
    readJson(at(p22, CONFIG_REL)).roles.reviewer.engine === 'claude',
    JSON.stringify(readJson(at(p22, CONFIG_REL)).roles.reviewer));
  const b = roleCmd(['--set', 'reviewer.engine=codex', '--set', 'reviewer.model=codex-atom-2', '--set', 'reviewer.effort=high', '--confirm-remove-stale']);
  check('with the flag it goes through: exit 0, the agent file is gone, roles.json follows',
    b.status === 0 && !exists(at(p22, '.claude/agents/reviewer.md'))
    && (readJson(at(p22, ROLES_REL)) || {}).reviewer.engine === 'codex', b.out.trim().slice(-200));
  check('and the inherited rows followed the Reviewer to codex without being touched themselves',
    ['plan', 'code', 'docs'].every((cls) => (readJson(at(p22, ROLES_REL)).review || {})[cls].engine === 'codex')
    && JSON.stringify(readJson(at(p22, CONFIG_REL)).review.docs) === '{"passes":1}',
    JSON.stringify(readJson(at(p22, ROLES_REL)).review));
  const c = roleCmd(['--set', 'reviewer.engine=claude']);
  check('and back to claude: the model defaults to the top tier and the agent file is re-created',
    c.status === 0 && readJson(at(p22, CONFIG_REL)).roles.reviewer.model === 'fable'
    && exists(at(p22, '.claude/agents/reviewer.md'))
    && /^model: fable$/m.test(read(at(p22, '.claude/agents/reviewer.md')) || ''), c.out.trim().slice(-200));
  const selfcheck = spawnSync(process.execPath, [SELFCHECK, '--plugin-root', PLUGIN_ROOT, '--project-fixture', p22], { encoding: 'utf8' });
  check('the self-check is green on the project after the whole round trip',
    selfcheck.status === 0, (selfcheck.stdout || '').split('\n').filter((l) => l.includes('[FAIL]')).slice(0, 3).join(' | ').slice(0, 240));
}

// ---------------------------------------------------------------------------
// A payload the caller reaches through a SYMLINK. Not an exotic case: macOS mounts its own
// os.tmpdir() behind one (/var -> /private/var), which is why every entrypoint this suite spawns
// from a payload COPY silently did nothing and exited 0 on that channel until it was found. Node
// hands a module its REAL path in `import.meta.url` while `process.argv[1]` keeps the link, so a
// guard comparing the two literally decides it is not main and falls off the end of the file. A
// Windows junction is the same shape, so the case runs on every host that can make such a link;
// where none can be made it says so on one line rather than passing in silence.
section('23 - an entrypoint reached through a symlinked payload still recognizes itself as main');
{
  // Every link fixture in this section hangs off the RESOLVED temp path. On macOS the suite's own
  // tmpRoot already sits behind that /var link, so a fixture placed there reaches its child through
  // a link even when nothing was linked on purpose - the control below would then be asserting a
  // premise the host cannot hold, and it failed exactly that way. Resolving once here leaves the
  // explicit junction as the ONLY link in the picture, which is what this section is trying to
  // isolate.
  const realTmp = fs.realpathSync(tmpRoot);
  const linked = path.join(realTmp, 'payload-via-link');
  let linkable = true;
  try { fs.symlinkSync(PLUGIN_ROOT, linked, 'junction'); } catch { linkable = false; }
  if (!linkable) {
    console.log('  [SKIP] this host would not create a directory link - the whole section needs one');
  } else {
    // THE CONTROL, first: the link really does defeat the naive guard on this host, so the
    // assertions below are about the fix and not about a link that changes nothing here. Its
    // fixture is realpath-based (see above) so that "direct" means direct on every host.
    const naiveDir = path.join(realTmp, 'naive-entrypoint');
    fs.mkdirSync(naiveDir, { recursive: true });
    fs.writeFileSync(path.join(naiveDir, 'naive.mjs'), [
      "import path from 'node:path';",
      "import { fileURLToPath } from 'node:url';",
      "const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';",
      "if (invoked === path.resolve(fileURLToPath(import.meta.url))) console.log('MAIN');",
      '',
    ].join('\n'));
    const naiveLink = path.join(realTmp, 'naive-entrypoint-via-link');
    fs.symlinkSync(naiveDir, naiveLink, 'junction');
    const run = (dir, rel) => spawnSync(process.execPath, [path.join(dir, rel)], { encoding: 'utf8' });
    const naiveDirect = run(naiveDir, 'naive.mjs');
    const naiveViaLink = run(naiveLink, 'naive.mjs');
    check('the control: the naive guard (argv[1] compared literally) DOES run as main directly',
      (naiveDirect.stdout || '').includes('MAIN'), `exit ${naiveDirect.status}: ${JSON.stringify((naiveDirect.stdout || '').trim())}`);
    check('and through the link it silently does nothing and exits 0 - the defect this section is about',
      naiveViaLink.status === 0 && !(naiveViaLink.stdout || '').includes('MAIN'),
      `exit ${naiveViaLink.status}: ${JSON.stringify((naiveViaLink.stdout || '').trim())}`);
    // The production path: the real installer, spawned from the linked payload.
    const p23 = project('install-via-linked-payload');
    const r = install(p23, baseAnswers(), ['--no-seeds'], { payload: linked });
    check('the installer invoked through the linked payload really runs', r.status === 0, why(r, true).slice(0, 200));
    check('and the project layer is on disk, not merely reported',
      exists(at(p23, CONFIG_REL)) && exists(at(p23, ROLES_REL)) && exists(at(p23, 'CLAUDE.md')));
    // The second entrypoint that a self-check spawns from a payload copy. A silent exit 0 here is
    // worse than a wrong answer: every self-check control that validates a SABOTAGED answers file by
    // running this CLI would report the sabotage as accepted, i.e. as a passing check.
    const badCfg = path.join(tmpRoot, 'config-that-cannot-be-valid.json');
    fs.writeFileSync(badCfg, JSON.stringify({ os: 'solaris' }, null, 2));
    const validate = (root) => spawnSync(process.execPath, [
      path.join(root, 'scripts', 'setup', 'validate-config.mjs'), badCfg,
      '--schema', path.join(PLUGIN_ROOT, 'schema', 'aiwf.config.schema.json'),
    ], { encoding: 'utf8' });
    const direct = validate(PLUGIN_ROOT);
    const viaLink = validate(linked);
    check('the validator reaches the same verdict through the link as through the real path',
      direct.status === 1 && viaLink.status === direct.status
      && ((viaLink.stdout || '') + (viaLink.stderr || '')).trim() !== '',
      `link exit ${viaLink.status} vs direct exit ${direct.status}`);
    // The links are removed by name: the recursive cleanup below unlinks rather than descends, but a
    // link that points at the payload is not something to leave to a general-purpose sweep.
    for (const l of [linked, naiveLink]) { try { fs.unlinkSync(l); } catch { try { fs.rmdirSync(l); } catch { /* best-effort */ } } }
  }
}

// ---------------------------------------------------------------------------
section('24 - the transfer surface: seeded once at the resolved path, never managed, never rewritten');
{
  const SURFACE_TMPL = path.join(PLUGIN_ROOT, 'templates', 'PNP_CANDIDATES.md.tmpl');
  const lf = (t) => String(t).replace(/\r\n/g, '\n');
  const SKELETON = lf(read(SURFACE_TMPL) || '');
  // A template that stopped existing would make every assertion below vacuous in the "seeded" half
  // and trivially true in the "untouched" half.
  check('the payload ships templates/PNP_CANDIDATES.md.tmpl', SKELETON.length > 0, SURFACE_TMPL);
  check('and the skeleton carries all four sections', ['# Transfer surface', '## Candidates',
    '## Ruling ledger', '## Pass statistics', '## Event ledger'].every((h) => SKELETON.includes(h)),
  `${SKELETON.split('\n').length} lines`);

  // --- the DEFAULT path: no transferSurface key at all ----------------------
  {
    const p = project('surface-default');
    const r = install(p, baseAnswers());
    check('install with no transferSurface key exits 0', r.status === 0, why(r));
    const DEFAULT_REL = 'docs/backlogs/PNP_CANDIDATES.md';
    check(`the surface was seeded at <plansDir>/PNP_CANDIDATES.md (${DEFAULT_REL})`, exists(at(p, DEFAULT_REL)));
    check('with exactly the payload skeleton', lf(read(at(p, DEFAULT_REL))) === SKELETON,
      `${String(lf(read(at(p, DEFAULT_REL)))).length} vs ${SKELETON.length} bytes`);
    // THE RISK THRESHOLD OF THE TICKET THAT INTRODUCED IT, asserted on the setup side: a record here
    // would make the file a managed artifact, and the next /pnp:update could re-render the
    // operator's own notes.
    const regions = ((readJson(at(p, CONFIG_REL)) || {})._aiwf || {}).managedRegions || {};
    check('and NO bookkeeping record was written for it (it is unmanaged by design)',
      !Object.prototype.hasOwnProperty.call(regions, DEFAULT_REL), Object.keys(regions).join(', '));
    check('the config carries no transferSurface key either (nothing is defaulted into it)',
      !Object.prototype.hasOwnProperty.call((readJson(at(p, CONFIG_REL)) || {}).paths || {}, 'transferSurface'),
      JSON.stringify((readJson(at(p, CONFIG_REL)) || {}).paths));

    // --- a repeated run is a ZERO diff ------------------------------------
    const before = snapshot(p);
    const again = install(p, baseAnswers());
    check('a second install over the same project exits 0', again.status === 0, why(again));
    check('and says the surface is already the operator\'s', again.out.includes(DEFAULT_REL)
      && again.out.includes('never rewrites the transfer surface'),
    again.out.split('\n').filter((l) => l.includes('PNP_CANDIDATES')).join(' | ').slice(0, 200));
    check('the repeated run is a ZERO diff over the whole project', diffSnapshots(before, snapshot(p)).length === 0,
      diffSnapshots(before, snapshot(p)).join(', '));
  }

  // --- a CONFIGURED path ----------------------------------------------------
  {
    const p = project('surface-configured');
    const CONFIGURED_REL = 'dev/notes/SURFACE.md';
    const r = install(p, baseAnswers({
      paths: { scratchDir: '.aiwf', plansDir: 'docs/backlogs', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md', transferSurface: CONFIGURED_REL },
    }));
    check('install with a configured transferSurface exits 0', r.status === 0, why(r));
    check(`the surface was seeded at the CONFIGURED path (${CONFIGURED_REL}), directory created`,
      exists(at(p, CONFIGURED_REL)));
    check('with exactly the payload skeleton', lf(read(at(p, CONFIGURED_REL))) === SKELETON);
    check('and nothing was seeded at the default path instead',
      !exists(at(p, 'docs/backlogs/PNP_CANDIDATES.md')));
    check('the key survived into the written config', ((readJson(at(p, CONFIG_REL)) || {}).paths || {}).transferSurface === CONFIGURED_REL,
      JSON.stringify((readJson(at(p, CONFIG_REL)) || {}).paths));
  }

  // --- an EXISTING file is left byte for byte -------------------------------
  {
    const p = project('surface-existing');
    const MINE = '# My own candidates page\n\nNothing here came from the plugin.\n';
    fs.mkdirSync(at(p, 'docs/backlogs'), { recursive: true });
    fs.writeFileSync(at(p, 'docs/backlogs/PNP_CANDIDATES.md'), MINE, 'utf8');
    const r = install(p, baseAnswers());
    check('install over an existing surface exits 0', r.status === 0, why(r));
    check('the operator\'s file is untouched, byte for byte',
      read(at(p, 'docs/backlogs/PNP_CANDIDATES.md')) === MINE,
      JSON.stringify(String(read(at(p, 'docs/backlogs/PNP_CANDIDATES.md'))).slice(0, 60)));
    check('and the run SAYS so rather than adopting it in silence',
      r.out.includes('never rewrites the transfer surface'),
      r.out.split('\n').filter((l) => l.includes('PNP_CANDIDATES')).join(' | ').slice(0, 200));
  }

  // --- containment: a configured path that escapes the project --------------
  // The same rule the required three paths have had since 0.1: a configured path this engine WRITES
  // to must be inside the project, or setup is writing outside the repository it was pointed at.
  // The absolute form is BUILT at run time from this machine's filesystem root, never written as a
  // literal: a drive-letter path spelled out in a payload file is itself a provenance finding, and
  // the self-check is right to say so.
  const ABSOLUTE_OUTSIDE = path.join(path.parse(tmpRoot).root, 'pnp-not-a-project', 'CANDIDATES.md');
  for (const [label, value] of [
    ['a path that climbs out with ..', '../outside/CANDIDATES.md'],
    ['an absolute path', ABSOLUTE_OUTSIDE.split(path.sep).join('/')],
  ]) {
    const p = project(`surface-outside-${label.replace(/[^a-z]+/gi, '-')}`);
    const answers = baseAnswers({
      paths: { scratchDir: '.aiwf', plansDir: 'docs/backlogs', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md', transferSurface: value },
    });
    const r = install(p, answers);
    check(`setup REFUSES a transferSurface outside the project (${label}), exit 1`, r.status === 1, why(r, true));
    check(`and names paths.transferSurface in the refusal (${label})`, r.out.includes('paths.transferSurface'),
      r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 200));
    check(`and wrote NOTHING (${label})`, Object.keys(snapshot(p)).length === 0, Object.keys(snapshot(p)).join(', '));
    // The OTHER entrypoint: a guard proven only through interview.mjs says nothing about the
    // generator a script can call directly.
    const p2 = project(`surface-outside-gen-${label.replace(/[^a-z]+/gi, '-')}`);
    const g = generateInstall(p2, answers);
    check(`the direct generator refuses it too (${label}), exit 1`, g.status === 1, why(g, true));
    check(`and that project is still empty (${label})`, Object.keys(snapshot(p2)).length === 0);
  }

  // --- the surface may not share a destination setup owns --------------------
  // The first row is a measured defect, not a hypothesis: pointing the surface at a managed artifact
  // produced no blockers, planned BOTH the managed render and the surface write, and recorded that
  // file in `managedRegions` - the one thing the ticket forbids outright. Against the config or the
  // settings path the later write simply won and the promised page was never created at all.
  const pathsWith = (surface) => ({
    scratchDir: '.aiwf', plansDir: 'docs/backlogs', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md', transferSurface: surface,
  });
  const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
  {
    const COLLISIONS = [
      ['a managed agent render', '.claude/agents/writer.md'],
      ['an agent render this configuration does not even produce', '.claude/agents/qa.md'],
      ['the pnp config', '.claude/aiwf-native/aiwf.config.json'],
      ['the rendered roles.json', '.claude/aiwf-native/roles.json'],
      ['the permission settings', '.claude/settings.json'],
      ['the file carrying the managed region', 'CLAUDE.md'],
      ['the overrides document', 'docs/ai/PROJECT_OVERRIDES.md'],
      ['the scratch directory', '.aiwf'],
      ['the active plans directory', 'docs/backlogs/active'],
      ['the agents directory', '.claude/agents'],
    ];
    // Every row through the DIRECT GENERATOR - the engine itself, and the entrypoint a script can
    // call without the interview in front of it.
    for (const [label, value] of COLLISIONS) {
      const p = project(`surface-collide-gen-${slug(value)}`);
      const g = generateInstall(p, baseAnswers({ paths: pathsWith(value) }));
      check(`the generator REFUSES a surface that is ${label} ("${value}"), exit 1`, g.status === 1, why(g, true));
      check(`and it names the collision (${value})`,
        g.out.includes('is the same destination setup writes as') && g.out.includes(value),
        g.out.trim().split('\n').slice(-3).join(' | ').slice(0, 220));
      check(`and wrote NOTHING (${value})`, Object.keys(snapshot(p)).length === 0, Object.keys(snapshot(p)).join(', '));
    }
    // And the three the blocker named, through the INTERVIEW entrypoint as well: a guard proven on
    // one entrypoint says nothing about the other.
    for (const value of ['.claude/agents/writer.md', '.claude/aiwf-native/aiwf.config.json', '.claude/settings.json']) {
      const p = project(`surface-collide-iv-${slug(value)}`);
      const r = install(p, baseAnswers({ paths: pathsWith(value) }));
      check(`the interview entrypoint refuses it too ("${value}"), exit 1`, r.status === 1, why(r, true));
      check(`and that project is still empty ("${value}")`, Object.keys(snapshot(p)).length === 0);
    }
    // HIERARCHY, not just equality. A filesystem has one, and exact-match alone let a whole class
    // through: `docs/backlogs` is not EQUAL to `docs/backlogs/active`, and pointing the surface at it
    // still cannot work. `applyPlan` creates directories BEFORE it writes files, so these got as far
    // as a partial installation and then died on EISDIR - worse than a refusal, which is the point.
    const HIERARCHY = [
      ['an ANCESTOR of the plan directories', 'docs/backlogs', 'docs/backlogs/active'],
      ['an ANCESTOR of everything under .claude', '.claude', '.claude'],
      ['an ANCESTOR of the overrides and plan directories', 'docs', 'docs'],
      ['INSIDE a file setup writes (the inverse conflict)', 'CLAUDE.md/surface.md', 'CLAUDE.md'],
      ['INSIDE the config file', '.claude/aiwf-native/aiwf.config.json/surface.md', '.claude/aiwf-native/aiwf.config.json'],
    ];
    for (const [label, value, named] of HIERARCHY) {
      // BOTH entrypoints for every row: the hierarchy bug was in the engine, and the engine is
      // reachable without the interview in front of it.
      for (const [entry, run] of [['generator', generateInstall], ['interview', install]]) {
        const p = project(`surface-hier-${entry}-${slug(value)}`);
        const r = run(p, baseAnswers({ paths: pathsWith(value) }));
        check(`${entry}: REFUSES a surface that is ${label} ("${value}"), exit 1`, r.status === 1, why(r, true));
        check(`${entry}: and it names the owned destination in the way ("${named}")`,
          r.out.includes(named) && (r.out.includes('sits beneath it') || r.out.includes('which setup writes as a file')),
          r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 240));
        // The whole reason this is a blocker and not a runtime error: a refusal leaves NOTHING behind,
        // where the partial install left a directory tree and a dead run.
        check(`${entry}: and wrote NOTHING - no partial installation ("${value}")`,
          Object.keys(snapshot(p)).length === 0, Object.keys(snapshot(p)).join(', '));
      }
    }

    // THE POSITIVE CONTROL for the whole collision guard: a path that is merely NEAR the reserved set
    // still installs. Without this, a guard that refused everything would pass every row above.
    {
      const p = project('surface-collide-control');
      const OK_REL = '.claude/agents/NOT-AN-AGENT.md';
      const r = install(p, baseAnswers({ paths: pathsWith(OK_REL) }));
      check('control: a surface merely NEXT TO the reserved destinations still installs, exit 0', r.status === 0, why(r));
      check('and it really was seeded there', exists(at(p, OK_REL)) && lf(read(at(p, OK_REL))) === SKELETON);
      check('and it is still unmanaged',
        !Object.prototype.hasOwnProperty.call(((readJson(at(p, CONFIG_REL)) || {})._aiwf || {}).managedRegions || {}, OK_REL));
    }
    // A NAME THAT MERELY BEGINS WITH TWO DOTS IS NOT A CLIMB OUT. `..notes/CANDIDATES.md` relativizes
    // to `..notes\CANDIDATES.md`, which a `startsWith('..')` containment test reads as escaping the
    // project - a false positive in the one guard whose value depends on a refusal meaning something.
    // The directory really is created here, so this face proves the acceptance rather than asserting
    // it: on a host where such a name is impossible the install would fail and so would this row.
    {
      const p = project('surface-dotdot-name');
      const DOTDOT_REL = '..notes/CANDIDATES.md';
      const r = install(p, baseAnswers({ paths: pathsWith(DOTDOT_REL) }));
      check('a path whose first segment merely STARTS with ".." is accepted, exit 0', r.status === 0, why(r, true));
      check('and the surface really landed inside the project at that name',
        exists(at(p, DOTDOT_REL)) && lf(read(at(p, DOTDOT_REL))) === SKELETON,
        String(exists(at(p, DOTDOT_REL))));
      check('control: a REAL climb-out with the same two dots is still refused',
        install(project('surface-dotdot-control'), baseAnswers({ paths: pathsWith('../notes/CANDIDATES.md') })).status === 1);
    }
    // Windows folds case, so two spellings of one destination are one file there. Run only on win32:
    // on a case-sensitive filesystem these really are two different paths and refusing would be wrong.
    if (process.platform === 'win32') {
      const p = project('surface-collide-case');
      const g = generateInstall(p, baseAnswers({ paths: pathsWith('.claude/agents/WRITER.md') }));
      check('win32: a differently-CASED spelling of a managed artifact is the same file, and is refused',
        g.status === 1 && g.out.includes('is the same destination setup writes as'), why(g, true));
      check('and wrote nothing', Object.keys(snapshot(p)).length === 0);
    }
  }

  // --- the resolved surface is an existing DIRECTORY -------------------------
  {
    const p = project('surface-is-a-directory');
    fs.mkdirSync(at(p, 'docs/backlogs/PNP_CANDIDATES.md'), { recursive: true });
    const before = snapshot(p); // snapshot records FILES, so an empty directory reads as {}
    const r = install(p, baseAnswers());
    check('setup REFUSES when the resolved surface is an existing directory, exit 1', r.status === 1, why(r, true));
    check('and says what it found rather than reporting the page as yours',
      r.out.includes('is not a regular file') && r.out.includes('directory'),
      r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 220));
    check('and wrote NOTHING', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
    check('the operator\'s directory is still there, untouched',
      fs.statSync(at(p, 'docs/backlogs/PNP_CANDIDATES.md')).isDirectory());
  }

  // --- containment through the REAL filesystem, not the string ---------------
  // A junction inside the project whose target is outside it: `linked/CANDIDATES.md` is
  // project-relative as a STRING and the write lands outside the project. Junctions rather than
  // symlinks on purpose - they need no administrator rights, so this face really runs here.
  {
    const makeEscape = (name) => {
      const target = project(`${name}-target`); // a sibling of the project, i.e. OUTSIDE it
      const p = project(name);
      let made = true;
      try { fs.symlinkSync(target, at(p, 'linked'), 'junction'); } catch { made = false; }
      return { target, p, made };
    };

    const esc = makeEscape('surface-escape');
    check('fixture: a junction inside the project, pointing OUT of it, could be created', esc.made,
      esc.made ? '' : 'junction creation failed on this host');
    if (esc.made) {
      // The control for the fixture itself: the junction really does lead out of the project, and the
      // old LEXICAL test really would have passed this path. Without both, a green row below could
      // mean the junction never worked.
      check('control: the junction really resolves outside the project',
        fs.realpathSync.native(at(esc.p, 'linked')) === fs.realpathSync.native(esc.target),
        fs.realpathSync.native(at(esc.p, 'linked')));
      check('control: the configured value is lexically innocent (the old check would have passed it)',
        !path.isAbsolute('linked/CANDIDATES.md')
        && path.relative(esc.p, path.resolve(esc.p, 'linked/CANDIDATES.md')).split(/[\\/]/)[0] !== '..');

      const r = install(esc.p, baseAnswers({ paths: pathsWith('linked/CANDIDATES.md') }));
      check('setup REFUSES a surface that leaves the project through a junction, exit 1', r.status === 1, why(r, true));
      check('and names the REAL location it resolved to',
        r.out.includes('really resolves to') && r.out.includes('not inside the project'),
        r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 240));
      check('and NOTHING was created on the far side of the junction',
        fs.readdirSync(esc.target).length === 0, fs.readdirSync(esc.target).join(', '));
      // `snapshot()` cannot be used on this project: it walks with `withFileTypes`, where a junction
      // is a SYMLINK dirent rather than a directory, and it would try to read the junction as a file.
      // The top level is the whole statement anyway - the junction is all that should be there.
      check('and nothing was written inside the project either',
        fs.readdirSync(esc.p).join(',') === 'linked', fs.readdirSync(esc.p).join(', '));

      // The same escape through the DIRECT GENERATOR.
      const escGen = makeEscape('surface-escape-gen');
      if (escGen.made) {
        const g = generateInstall(escGen.p, baseAnswers({ paths: pathsWith('linked/CANDIDATES.md') }));
        check('the direct generator refuses the junction escape too, exit 1', g.status === 1, why(g, true));
        check('with nothing on the far side', fs.readdirSync(escGen.target).length === 0);
      }

      // AND THE DEFAULT PATH, which is the half a configured-surface test cannot reach: with
      // `plansDir` itself a junction, `<plansDir>/PNP_CANDIDATES.md` escapes without anyone
      // configuring a surface at all.
      const escDefault = makeEscape('surface-escape-default');
      if (escDefault.made) {
        const d = install(escDefault.p, baseAnswers({
          paths: { scratchDir: '.aiwf', plansDir: 'linked', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' },
        }));
        check('setup refuses the DEFAULT surface when plansDir itself is a junction out of the project, exit 1',
          d.status === 1, why(d, true));
        check('and the message says it is the default rather than a configured path',
          d.out.includes('the default transfer surface'), d.out.trim().split('\n').slice(-3).join(' | ').slice(0, 240));
        check('and not even the plans directories were created outside the project',
          fs.readdirSync(escDefault.target).length === 0, fs.readdirSync(escDefault.target).join(', '));
      }
    }
  }
}

// ---------------------------------------------------------------------------
try { fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(`fixtures left behind: ${fs.existsSync(tmpRoot) ? tmpRoot : 'none'}`);
console.log(failures === 0 ? 'SETUP SUITE: PASS' : 'SETUP SUITE: FAIL');
process.exit(failures === 0 ? 0 : 1);
