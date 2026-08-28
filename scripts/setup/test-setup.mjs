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
 *   6. an unsupported OS channel and answers that violate the schema are both refused before a
 *      single file is written;
 *   7. foreign permission rules are never touched, and a rule the operator removed is not forced
 *      back (the tombstone);
 *   8. the self-check is the install's OWN last step: a fresh install runs it and reports PASS,
 *      --no-selfcheck skips it out loud, and a self-check that cannot be run at all makes the
 *      install exit 1 rather than report a green it never obtained.
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
import { sha256 } from './generate.mjs';
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
  enforcement: { routeWriteGuard: true },
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
  check('_aiwf stamps a fresh-install migration id', bk.lastMigrationApplied === '0001_initial', String(bk.lastMigrationApplied));
  check('_aiwf journal is clear', bk.migrationJournal === null);
  check('$schema points at the payload schema', typeof cfg.$schema === 'string' && cfg.$schema.endsWith('schema/aiwf.config.schema.json'), String(cfg.$schema));

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
section('7 - refusals happen BEFORE anything is written');
{
  const p7 = project('linux');
  const answers = baseAnswers({ os: 'linux' });
  const r = install(p7, answers, ['--no-seeds']);
  check('os=linux is refused (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the message says what it says: not supported before 1.0', r.out.includes('supported before 1.0'));
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
section('10 - an unadopted pre-existing artifact is never taken over');
{
  const p12 = project('unadopted');
  fs.mkdirSync(at(p12, '.claude/aiwf-native'), { recursive: true });
  fs.writeFileSync(at(p12, ROLES_REL), '{ "reviewer": "mine, hand-written" }\n');
  const before = snapshot(p12);
  const r = install(p12, baseAnswers(), ['--no-seeds']);
  check('the run is BLOCKED (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the message says setup does not adopt files it did not write', r.out.includes('not recorded in _aiwf.managedRegions'));
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
try { fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(`fixtures left behind: ${fs.existsSync(tmpRoot) ? tmpRoot : 'none'}`);
console.log(failures === 0 ? 'SETUP SUITE: PASS' : 'SETUP SUITE: FAIL');
process.exit(failures === 0 ? 0 : 1);
