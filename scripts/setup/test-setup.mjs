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
 *   4. a render OVERWRITES: an edited, deleted or never-recorded managed artifact ends as the render,
 *      a file this installation had no record of is named as `overwrote: <path>`, and the project
 *      additions block of a Markdown file is carried byte for byte (a malformed one blocks);
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
 *   9. legacy bookkeeping (two-hash objects, a journal key) is normalised on the next run;
 *  10. the three warnings: a project that ALREADY carries plans under `<plansDir>/active/`, or whose
 *      plansDir lies under the scratch directory, is warned about on both paths - the interview at
 *      the question, the generator as a note in its plan and report (12b, 12c); an overrides
 *      document that already exists is warned about at the interview question only (12b; the
 *      generator's own note about it is not asserted here); none is ever blocked, with a clean
 *      project as the flipping control.
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
import { plansDirUnderScratchWarning, renderTemplate, templateContext } from './generate.mjs';
import { runInterview } from './interview.mjs';
import { E2E_TRACE_NOTE } from './e2e-trace-note.mjs';
// Read through the module NAMESPACE, not a named import: a helper this payload does not export yet
// must fail the checks that need it (section 25), not abort the whole suite at load time.
import * as validateConfig from './validate-config.mjs';

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
// The Orchestrator role is UNCONDITIONAL like the writer: the main session exists on every
// installation whatever the review hosts are, so there is no configuration in which this file is
// legitimately absent.
check('the Orchestrator role is always rendered', exists(at(p1, '.claude/aiwf-native/ORCHESTRATOR.md')));
check('reviewer agent rendered (claude-hosted)', exists(at(p1, '.claude/agents/reviewer.md')));
check('NO qa agent rendered (codex-hosted role has no Claude agent file)', !exists(at(p1, '.claude/agents/qa.md')));
check('CLAUDE.md written with the managed markers',
  (read(at(p1, 'CLAUDE.md')) || '').includes('<!-- BEGIN aiwf-core -->') && (read(at(p1, 'CLAUDE.md')) || '').includes('<!-- END aiwf-core -->'));
check('overrides document seeded', exists(at(p1, 'docs/ai/PROJECT_OVERRIDES.md')));
check('plansDir has active/, archive/, drafts/ and readiness/', exists(at(p1, 'docs/backlogs/active')) && exists(at(p1, 'docs/backlogs/archive'))
  && exists(at(p1, 'docs/backlogs/drafts')) && exists(at(p1, 'docs/backlogs/readiness')));
{
  // The negative control of the four-directory check above: a payload copy whose generator no
  // longer creates drafts/ must install a project WITHOUT drafts/ (and still WITH readiness/), so
  // the predicate of that check is seen to be false on a sabotaged install. The replacement is
  // exact - zero or several occurrences of the mkdir elements is a broken control, not a pass - and
  // the sabotaged generator is parsed before anything runs through it.
  const payload = path.join(tmpRoot, 'payload-no-drafts');
  copyTree(PLUGIN_ROOT, payload);
  const genFile = path.join(payload, 'scripts', 'setup', 'generate.mjs');
  const needle = "path.join(merged.paths.plansDir, 'drafts'), path.join(merged.paths.plansDir, 'readiness'),";
  const src = fs.readFileSync(genFile, 'utf8');
  const hits = src.split(needle).length - 1;
  if (hits !== 1) throw new Error(`setup-drafts-ctl-1: expected exactly 1 occurrence of the drafts/readiness mkdir elements in the payload copy, found ${hits}`);
  fs.writeFileSync(genFile, src.replace(needle, "path.join(merged.paths.plansDir, 'readiness'),"));
  const parsed = spawnSync(process.execPath, ['--check', genFile], { encoding: 'utf8' });
  if (parsed.status !== 0) throw new Error(`setup-drafts-ctl-1: the sabotaged generate.mjs does not parse: ${((parsed.stderr || '') + (parsed.error ? parsed.error.message : '')).trim()}`);
  const pc = project('drafts-ctl');
  const rc = install(pc, baseAnswers(), ['--no-seeds'], { payload });
  check('[setup-drafts-ctl-1] sabotage detected: the drafts mkdir removed -> the four-directory check turns red',
    !exists(at(pc, 'docs/backlogs/drafts')) && exists(at(pc, 'docs/backlogs/readiness')), why(rc));
}
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
  check('_aiwf carries no journal key', !Object.prototype.hasOwnProperty.call(bk, 'migrationJournal'));
  check('$schema points at the payload schema', typeof cfg.$schema === 'string' && cfg.$schema.endsWith('schema/aiwf.config.schema.json'), String(cfg.$schema));
  // Both enforcement keys are REQUIRED by the schema, so a fresh install carries them whatever the
  // answers say - a hook that had to guess a mode would be guessing on every project.
  check('the enforcement block carries both gates, Gate 2 in its factory mode',
    cfg.enforcement && cfg.enforcement.routeWriteGuard === true && cfg.enforcement.dispatchGate === 'always',
    JSON.stringify(cfg.enforcement));

  // Bookkeeping: one entry per rendered artifact, each the payload version that rendered it.
  const regions = bk.managedRegions || {};
  const keys = Object.keys(regions).sort();
  check('managedRegions covers exactly the rendered artifacts',
    keys.join(',') === ['.claude/agents/reviewer.md', '.claude/agents/writer.md', '.claude/aiwf-native/ORCHESTRATOR.md', '.claude/aiwf-native/roles.json', 'AGENTS.md', 'CLAUDE.md#aiwf-core'].sort().join(','),
    keys.join(', '));
  // The render itself, against the production render path rather than against a copy of the
  // expectation: the same two exported functions the generator renders through, over the config
  // that was really written. A mirrored expectation here would assert the test's own template
  // engine.
  {
    const tmpl = read(path.join(PLUGIN_ROOT, 'templates', 'ORCHESTRATOR.md.tmpl'));
    const rendered = read(at(p1, '.claude/aiwf-native/ORCHESTRATOR.md'));
    const expected = tmpl === null ? null : renderTemplate(tmpl, templateContext(cfg, p1));
    check('the rendered Orchestrator role is exactly the template render', rendered !== null && rendered === expected,
      rendered === null ? 'the file is missing' : `${rendered.length} bytes vs ${expected === null ? 'no template' : expected.length}`);
    check('it carries the project name and the overrides path from the config, and no model key',
      !!rendered && rendered.includes(baseAnswers().project.name) && rendered.includes(baseAnswers().paths.overridesDoc)
      && !/^model:/m.test(rendered) && !rendered.includes('{{'),
      rendered ? rendered.split('\n').find((l) => l.startsWith('# ')) || '(no heading)' : '-');
    // And it is not an AGENT file: no frontmatter fence on the first line. An agent opens with one,
    // nothing dispatches this artifact, and a fence is where a model would arrive next - so the
    // claim "without frontmatter" is asserted on the render rather than left to the template's
    // intent. The `---` in the fixture's own agent files is what makes this discriminating.
    check('and it is NOT an agent file: the render opens with no frontmatter fence',
      !!rendered && !/^---\s*$/.test(String(rendered).split('\n')[0] || ''),
      rendered ? JSON.stringify(String(rendered).split('\n')[0]).slice(0, 80) : '-');
    check('and the TEMPLATE still carries a contract block, so the render above stripped something',
      tmpl !== null && tmpl.includes('<!-- TEMPLATE CONTRACT') && !String(rendered).includes('TEMPLATE CONTRACT'));
  }
  // The Codex auditor's instruction file: UNCONDITIONAL like the Orchestrator role, a whole file at
  // the project root. Its bytes are held to the production render path, and its shape to the
  // template contract: four headings in a fixed order, two config values, and nothing that goes stale
  // on an update - no resolved project root, no version, no placeholder left unrendered.
  {
    const tmpl = read(path.join(PLUGIN_ROOT, 'templates', 'AGENTS.md.tmpl'));
    const rendered = read(at(p1, 'AGENTS.md'));
    const expected = tmpl === null ? null : renderTemplate(tmpl, templateContext(cfg, p1));
    check('[setup-agents-1] AGENTS.md is rendered at the project root, exactly the template render',
      rendered !== null && rendered === expected,
      rendered === null ? 'the file is missing' : `${rendered.length} bytes vs ${expected === null ? 'no template' : expected.length}`);
    const headings = rendered === null ? [] : rendered.split('\n').filter((l) => l.startsWith('#'));
    const wanted = [`# AGENTS - ${baseAnswers().project.name}`, '## Who reads this', '## Where the contract is', '## Where the project\'s canon is'];
    check('[setup-agents-2] AGENTS.md carries exactly the four contract headings, in order',
      headings.join(' | ') === wanted.join(' | '), headings.join(' | ') || '(no headings)');
    check('[setup-agents-3] AGENTS.md names the overrides document project-relative, and no root, version or placeholder',
      !!rendered && rendered.includes(`- \`${baseAnswers().paths.overridesDoc}\``) && !rendered.includes(p1)
      && !/[0-9]+\.[0-9]+\.[0-9]+/.test(rendered) && !/[A-Za-z]:[\\/]/.test(rendered) && !rendered.includes('{{'),
      rendered === null ? 'the file is missing' : `${rendered.length} bytes`);
  }
  check('every managedRegions entry is the payload version, and every recorded file is on disk',
    keys.length > 0 && keys.every((key) => regions[key] === plugin.version && read(at(p1, key.split('#')[0])) !== null),
    JSON.stringify(regions));

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
section('4 - an edit INSIDE a managed artifact is overwritten by the render, and nothing asks');
{
  const claudeFile = at(p1, 'CLAUDE.md');
  const src = read(claudeFile);
  fs.writeFileSync(claudeFile, src.replace('## Your role', '## Your role (I edited this)'));
  const r = install(p1, baseAnswers(), ['--no-seeds']);
  check('the run exits 0', r.status === 0, why(r, true));
  check('the edited region is the render again', read(claudeFile) === src, 'region differs from the render');
  check('the text outside the markers survived', (read(claudeFile) || '').includes('## My own section'));
}
{
  const rolesFile = at(p1, ROLES_REL);
  const src = read(rolesFile);
  fs.writeFileSync(rolesFile, src.replace('"effort": "high"', '"effort": "low"'));
  const r = install(p1, baseAnswers(), ['--no-seeds']);
  check('a hand-edited whole-file artifact (roles.json) is re-rendered (exit 0)', r.status === 0, why(r, true));
  check('roles.json is the render again', read(rolesFile) === src);
  check('it is reported as a re-render, not as overwrote (this installation wrote it)',
    r.out.includes('.claude/aiwf-native/roles.json') && !r.out.includes('overwrote:'), why(r, true));
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
  const plugin = readJson(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json')) || {};
  check('bookkeeping restamped with the payload version', (bk.managedRegions || {})[ROLES_REL] === plugin.version);
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
  // FLIPPED in 0.2.11: an exact model id on a CLAUDE-hosted Reviewer installs. The dispatch omits
  // `model` for it, so the pin that runs is the one rendered into the agent's frontmatter - which is
  // therefore what this asserts, not only the exit code.
  const p9 = project('exact-id');
  const answers = baseAnswers();
  answers.roles.reviewer.model = 'claude-opus-5-5';
  const r = install(p9, answers, ['--no-seeds']);
  check('a claude-hosted Reviewer pinned to an exact model id installs (exit 0)', r.status === 0, why(r));
  const reviewerMd = read(at(p9, '.claude/agents/reviewer.md')) || '';
  check('and the rendered reviewer.md carries that pin as its frontmatter model',
    /^model: claude-opus-5-5$/m.test(reviewerMd), (reviewerMd.split('\n').find((l) => l.startsWith('model:')) || '(no model line)'));
}
{
  // The rule that replaced the alias conditional: a Claude review ROW shares the ONE reviewer agent
  // file, so its exact id must be that file's pin. A foreign one is a setup BLOCKER - nothing written.
  const p9b = project('foreign-row-id');
  const answers = baseAnswers();
  answers.roles.reviewer.model = 'claude-opus-5-5';
  answers.review.docs = { passes: 1, engine: 'claude', model: 'claude-sonnet-5' };
  const r = install(p9b, answers, ['--no-seeds']);
  check('a Claude review row on a FOREIGN exact id is refused (exit 1)', r.status === 1, `exit ${r.status}`);
  check('the refusal names the row and the Claude pin rule', r.out.includes('review.docs') && r.out.includes('Claude pin rule'), why(r, true));
  check('nothing was written', Object.keys(snapshot(p9b)).length === 0);
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
section('10 - a pre-existing artifact on a fresh install is overwritten and named (section 18 has the matrix)');
// The Codex auditor's instruction file is the one a project is the likeliest to have written by hand
// before it ever installed: the render replaces it, the report names it, and text the project wants
// kept belongs in the overrides document or in a project additions block.
{
  const pa = project('foreign-agents');
  const MINE = '# My own auditor notes\n\nHand-written before the install.\n';
  fs.writeFileSync(at(pa, 'AGENTS.md'), MINE);
  const r = install(pa, baseAnswers(), ['--no-seeds']);
  check('[setup-agents-4] a foreign AGENTS.md on a fresh install does not block (exit 0) and is named as overwrote',
    r.status === 0 && r.out.includes('overwrote: AGENTS.md'), why(r, true));
  check('[setup-agents-5] and AGENTS.md is the render now',
    read(at(pa, 'AGENTS.md')) !== MINE && (read(at(pa, 'AGENTS.md')) || '').startsWith('# AGENTS - '),
    JSON.stringify(String(read(at(pa, 'AGENTS.md'))).slice(0, 60)));
}
// The overrides document is a second writer: pointed at the managed AGENTS.md it would overwrite the
// render right after it was stamped, so the collision is a blocker before anything is written.
{
  const po = project('overrides-is-agents');
  const before = snapshot(po);
  const r = install(po, baseAnswers({ paths: { ...baseAnswers().paths, overridesDoc: 'AGENTS.md' } }), ['--no-seeds']);
  check('[setup-agents-6] paths.overridesDoc = AGENTS.md is refused before any write (exit 1, names both)',
    r.status === 1 && r.out.includes('paths.overridesDoc ("AGENTS.md")') && r.out.includes('the Codex auditor instruction file')
    && diffSnapshots(before, snapshot(po)).length === 0, why(r, true));
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
  // The control of 12c below: a plansDir outside the scratch directory (the schema default,
  // docs/backlogs) hears no under-scratch line on either path. It cannot fail alone - 12c's
  // interview and dry-run checks are its flipping faces.
  check('a plansDir outside the scratch directory hears no under-scratch warning',
    !said.join('').includes('under the scratch directory') && !dry.out.includes('under the scratch directory'),
    [...said.join('').split('\n'), ...dry.out.split('\n')].filter((l) => l.includes('scratch directory')).join(' | ') || 'silent');
}

// ---------------------------------------------------------------------------
section('12c - a plansDir under the scratch directory is WARNED about, on both paths, and never blocked');
{
  // A plan canon under the scratch directory is outside git wherever the scratch directory is
  // ignored (/pnp:review Step 2e). The schema admits the path and the operator may mean exactly
  // this, so setup says it - at the plans question and as a note in the plan/report - and refuses
  // nothing. A project of its own: the 12b project is already installed and does not serve a new
  // dry-run.
  const p3 = project('under-scratch');

  // (a) the pure helper on ten inputs, each with one answer on every platform: nothing reads
  // process.platform - the windows folding is the flag, never the host.
  const matrix = [
    [{ plansDir: '.aiwf/plans' }, true],
    [{ plansDir: '.aiwf' }, true],
    [{ plansDir: 'docs/../.aiwf/plans' }, true],
    [{ plansDir: '.aiwf\\plans', windowsPaths: true }, true],
    [{ plansDir: '.aiwf\\plans' }, false],
    [{ plansDir: '.AIWF/plans', windowsPaths: true }, true],
    [{ plansDir: '.AIWF/plans' }, false],
    [{ plansDir: 'docs/backlogs' }, false],
    [{ plansDir: '.aiwfx/plans' }, false],
    [{ plansDir: '.aiwf/../docs/plans' }, false],
  ];
  const wrong = matrix.map(([input, under]) => [input, under, plansDirUnderScratchWarning(input)])
    .filter(([, under, got]) => (under ? !(typeof got === 'string' && got.includes('is under the scratch directory .aiwf')) : got !== null));
  check('plansDirUnderScratchWarning: under -> warning, outside and the prefix trap -> null',
    wrong.length === 0, wrong.map(([input, under, got]) => `${JSON.stringify(input)} expected ${under ? 'a warning' : 'null'}, got ${JSON.stringify(got)}`).join('; '));

  // (b) the interview path. `ask` receives the TEXT of the question, not the config key.
  const interviewOver = async (ask) => {
    const said = [];
    await runInterview({ schema: loadSchemaJson(), ask, projectRoot: p3, out: { write: (s) => said.push(s) } });
    return said.join('');
  };
  const heard = await interviewOver((q) => (q.startsWith('Plans directory') ? '.aiwf/plans' : scriptedAsk(q)));
  check('the interview warns at the plans question when plansDir is under the scratch directory',
    heard.includes('is under the scratch directory .aiwf'),
    heard.split('\n').filter((l) => l.includes('scratch')).join(' | ') || '(no such line)');

  // (g) the os flag reaches the interview: the same answer, two channels. The interview only asks -
  // nothing is written - so a linux interview runs on any host.
  const osAsk = (osName) => (q) => (q.startsWith('Operating system') ? osName
    : q.startsWith('Plans directory') ? '.AIWF/plans' : scriptedAsk(q));
  const heardLinux = await interviewOver(osAsk('linux'));
  const heardWindows = await interviewOver(osAsk('windows'));
  check('the os flag reaches the interview: a linux project hears no under-scratch warning for .AIWF/plans',
    !heardLinux.includes('under the scratch directory') && heardWindows.includes('is under the scratch directory .aiwf'),
    `linux: ${heardLinux.split('\n').filter((l) => l.includes('scratch')).join(' | ') || 'silent'}; windows: ${heardWindows.split('\n').filter((l) => l.includes('scratch')).join(' | ') || 'silent'}`);

  // (c) the generator path: the non-interactive --answers-file install never sees a question, so
  // its plan/report carries the same line as a note - and the dry-run is not refused.
  const answers = { ...baseAnswers(), paths: { scratchDir: '.aiwf', plansDir: '.aiwf/plans', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' } };
  const dry = install(p3, answers, ['--no-seeds', '--dry-run']);
  check('the dry-run carries the under-scratch note',
    dry.status === 0 && dry.out.includes('note   paths.plansDir .aiwf/plans is under the scratch directory .aiwf'),
    why(dry, true));

  // (g) the os flag reaches the generator: the same plansDir, two channels. A dry-run plans and
  // writes nothing, so a linux-os plan on a windows host is text only.
  const dryOs = (osName) => install(p3, { ...baseAnswers(), os: osName, paths: { scratchDir: '.aiwf', plansDir: '.AIWF/plans', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' } }, ['--no-seeds', '--dry-run']);
  const dryWindows = dryOs('windows');
  const dryLinux = dryOs('linux');
  check('the os flag reaches the generator: .AIWF/plans is under scratch on a windows project and outside on a linux one',
    dryWindows.status === 0 && dryWindows.out.includes('note   paths.plansDir .AIWF/plans is under the scratch directory .aiwf')
    && dryLinux.status === 0 && !dryLinux.out.includes('under the scratch directory'),
    `windows: ${why(dryWindows, true)}; linux: ${why(dryLinux, true)}`);
}

// ---------------------------------------------------------------------------
section('12d - an E2E output directory under a traced app root is NOTED after the outputDir answer');
{
  // The same answers twice: a project whose app root holds a next.config.* hears the note, the same
  // project without one hears nothing. The sentence is the module's own, never restated here.
  const e2eAsk = (q) => (q.startsWith('Does this project have an end-to-end proof surface') ? 'y'
    : q.startsWith('e2e: cwd') ? 'app'
      : q.startsWith('e2e: artifact output directory') ? 'test-results'
        : q.startsWith('e2e: runner command') ? 'x'
          : q.startsWith('e2e: spec directory') ? 'e2e' : scriptedAsk(q));
  const heardOver = async (withNextConfig) => {
    const p = project(withNextConfig ? 'e2e-traced' : 'e2e-untraced');
    fs.mkdirSync(at(p, 'app'), { recursive: true });
    if (withNextConfig) fs.writeFileSync(at(p, 'app/next.config.js'), 'module.exports = {};\n');
    const said = [];
    await runInterview({ schema: loadSchemaJson(), ask: e2eAsk, projectRoot: p, out: { write: (s) => said.push(s) } });
    return said.join('');
  };
  const traced = await heardOver(true);
  check('a projectRoot whose app/ holds next.config.js hears the e2e trace note after the outputDir answer',
    traced.includes(E2E_TRACE_NOTE), traced.split('\n').filter((l) => l.includes('next.config')).join(' | ') || '(no such line)');
  const untraced = await heardOver(false);
  check('the same answers with no next.config.js hear no such note',
    !untraced.includes(E2E_TRACE_NOTE), untraced.split('\n').filter((l) => l.includes('next.config')).join(' | ') || 'silent');
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
section('14 - a DELETED managed artifact is recreated, a deleted region re-appended');
{
  const p18 = project('deleted-file');
  check('install exits 0', install(p18, baseAnswers(), ['--no-seeds']).status === 0);
  const original = read(at(p18, ROLES_REL));
  fs.rmSync(at(p18, ROLES_REL));
  const r = install(p18, baseAnswers(), ['--no-seeds']);
  check('the re-run over a deleted recorded artifact exits 0', r.status === 0, why(r, true));
  check('the file is recreated from the render', read(at(p18, ROLES_REL)) === original);
}
{
  const p19 = project('deleted-region');
  check('install exits 0', install(p19, baseAnswers(), ['--no-seeds']).status === 0);
  const text = read(at(p19, 'CLAUDE.md'));
  const start = text.indexOf('<!-- BEGIN aiwf-core -->');
  const end = text.indexOf('<!-- END aiwf-core -->') + '<!-- END aiwf-core -->'.length;
  const kept = text.slice(0, start) + '(the operator removed the managed region)' + text.slice(end);
  fs.writeFileSync(at(p19, 'CLAUDE.md'), kept);
  const r = install(p19, baseAnswers(), ['--no-seeds']);
  check('the re-run over a removed region exits 0', r.status === 0, why(r, true));
  const after = read(at(p19, 'CLAUDE.md')) || '';
  check('the region is appended back, after every byte that was there', after.startsWith(kept) && after.includes('<!-- BEGIN aiwf-core -->'));
}

// ---------------------------------------------------------------------------
section('15 - --confirm-remove-stale deletes ONLY a recorded render');
{
  // Recorded is the whole condition: an edit inside a stale render is the same overwrite-class
  // change as any other edit, and the flag confirms removing the file setup recorded at that path.
  const p20 = project('stale-edited');
  const claudeQa = baseAnswers();
  claudeQa.roles.qa = { engine: 'claude', model: 'haiku', effort: 'medium' };
  check('install with a claude-hosted qa exits 0', install(p20, claudeQa, ['--no-seeds']).status === 0);
  const agent = at(p20, '.claude/agents/qa.md');
  fs.writeFileSync(agent, read(agent) + '\nMy own note in the agent file.\n');
  const before = snapshot(p20);
  const blocked = install(p20, baseAnswers(), ['--no-seeds']);
  check('a recorded stale render without the flag BLOCKS', blocked.status === 1 && blocked.out.includes('--confirm-remove-stale'), why(blocked, true));
  check('and nothing was written or deleted', diffSnapshots(before, snapshot(p20)).length === 0);
  const r = install(p20, baseAnswers(), ['--no-seeds', '--confirm-remove-stale']);
  check('with the flag the recorded stale render is removed, edited or not (exit 0)', r.status === 0 && !exists(agent), why(r, true));
}
{
  const p21 = project('stale-foreign');
  check('install with a codex-hosted qa exits 0', install(p21, baseAnswers(), ['--no-seeds']).status === 0);
  fs.writeFileSync(at(p21, '.claude/agents/qa.md'), '---\nname: qa\n---\nSomeone else wrote this.\n');
  const foreign = '---\nname: qa\n---\nSomeone else wrote this.\n';
  for (const extra of [[], ['--confirm-remove-stale']]) {
    const label = extra.length ? 'with the flag' : 'without the flag';
    const r = install(p21, baseAnswers(), ['--no-seeds', ...extra]);
    check(`an UNRECORDED file at a stale agent path does not stop the run (${label}, exit 0)`, r.status === 0, why(r, true));
    check(`and it is named as left alone (${label})`,
      r.out.includes('left alone: .claude/agents/qa.md (not rendered by this configuration)'), why(r, true));
    check(`and it is neither deleted nor written (${label})`, read(at(p21, '.claude/agents/qa.md')) === foreign);
  }
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
{
  // The red branch above proves the caller PRINTS the report. This one proves the operator still
  // gets it WHOLE: a caller that forces `process.exit(<code>)` kills the run while its own stdout
  // write is still pending on a POSIX pipe, and the tail of the report is dropped (POSIX-005,
  // CONS-011) - red on Linux and macOS, green on Windows, from one tree. No runtime case on a
  // Windows machine can show that, so the four exit statements are pinned BYTE FOR BYTE here.
  //
  // WHAT IS PINNED: for each of the four callers, the compliant line occurs exactly once and the
  // forced line exactly zero times, compared as WHOLE TRIMMED LINES - never by regex or substring,
  // which is what let the previous version be fooled by a comment, a template literal and a
  // shadowed local. Plus the number of call sites in the payload's scripts, pinned at five.
  // WHAT IS DELIBERATELY NOT PINNED: DISCOVERY of a NEW caller. Judging JS by text without an AST
  // is an unwinnable maintenance treadmill - the same class this repository refused for Gate 4
  // (`docs/LOOP.md` § Commit gate) - so the count pin is the enumeration backstop: a fifth call
  // site anywhere under `scripts/` or `hooks/` fails this suite even though nothing here can tell
  // whether that new caller exits correctly.
  const SYMBOL = 'finishWithSelfCheck';
  const CALL_FORM = `${SYMBOL}(`; // assembled, never written out: a literal here IS a call site
  const CALL_SITES = 5; // the definition in run-selfcheck.mjs + the four callers below
  const PINS = [
    { file: 'scripts/update/aiwf-update.mjs',
      present: 'if (isMain()) process.exitCode = main();', absent: ['if (isMain()) process.exit(main());'] },
    { file: 'scripts/setup/generate.mjs',
      present: `process.exitCode = ${CALL_FORM}{`, absent: [`process.exit(${CALL_FORM}{`] },
    { file: 'scripts/setup/interview.mjs',
      present: 'process.exitCode = code;', absent: ['process.exit(code);'] },
    { file: 'scripts/setup/aiwf-roles.mjs',
      present: 'process.exitCode = code;', absent: ['process.exit(code);', 'process.exit(0);'] },
  ];

  // THE instrument. It takes the file CONTENTS, so the controls below run THIS function over a
  // fixture instead of a mirror of its rules. A file that cannot be read arrives as '' and fails
  // its own `present` pin rather than being skipped.
  function pinViolations(sources) {
    const contentsOf = (file) => (sources.find((s) => s.file === file) || { contents: '' }).contents;
    const problems = [];
    for (const pin of PINS) {
      const lines = contentsOf(pin.file).split('\n').map((l) => l.trim());
      const occurrences = (needle) => lines.filter((l) => l === needle).length;
      const p = occurrences(pin.present);
      if (p !== 1) problems.push(`${pin.file}: present 1 got ${p}`);
      for (const a of pin.absent) {
        const n = occurrences(a);
        if (n !== 0) problems.push(`${pin.file}: absent 0 got ${n}`);
      }
    }
    const total = sources.reduce((n, s) => n + (s.contents.split(CALL_FORM).length - 1), 0);
    if (total !== CALL_SITES) problems.push(`payload scripts+hooks: count ${CALL_SITES} got ${total}`);
    return problems;
  }

  const scriptsUnder = (dir, acc = []) => {
    if (!fs.existsSync(dir)) return acc;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) scriptsUnder(p, acc);
      else if (/\.(mjs|js|cjs)$/.test(e.name)) {
        acc.push({ file: path.relative(PLUGIN_ROOT, p).split(path.sep).join('/'), contents: read(p) || '' });
      }
    }
    return acc;
  };

  // THE CONTROLS, over a FIXTURE this suite owns rather than over the real tree: a control whose
  // premise ("nothing is modified") is falsified by the very mutation the guard exists to catch is
  // not a control, and it would double-report every real violation. The fixture carries one call
  // form per caller plus the definition, so the count pin sits at CALL_SITES for the compliant case.
  const FIXTURE = PINS.map((pin) => {
    const body = [`// fixture for ${pin.file}`];
    if (!pin.present.includes(CALL_FORM)) body.push(`  const code = ${CALL_FORM}{});`);
    body.push(`  ${pin.present}`, '');
    return { file: pin.file, contents: body.join('\n') };
  }).concat([{ file: 'scripts/selfcheck/run-selfcheck.mjs', contents: `export function ${CALL_FORM}{}) {}\n` }]);

  // A control's detail is printed only when it FAILS: a passing row that dumps what the instrument
  // said drowns the failures, which is this suite's rule for every other row.
  const saw = (ok, found) => (ok ? '' : `saw [${found.join(' | ')}]`.slice(0, 300));

  const cClean = pinViolations(FIXTURE);
  check('pin control: an unmodified caller set reports nothing', cClean.length === 0, saw(cClean.length === 0, cClean));

  const REVERTED = PINS[0];
  const cReverted = pinViolations(FIXTURE.map((s) => (s.file === REVERTED.file
    ? { file: s.file, contents: s.contents.split(REVERTED.present).join(REVERTED.absent[0]) }
    : s)));
  const revertedOk = cReverted.length === 2
    && cReverted[0] === `${REVERTED.file}: present 1 got 0`
    && cReverted[1] === `${REVERTED.file}: absent 0 got 1`;
  check('pin control: a caller reverted to process.exit() is reported by file', revertedOk, saw(revertedOk, cReverted));

  const cFifth = pinViolations(FIXTURE.concat([
    { file: 'scripts/setup/fixture-new-caller.mjs', contents: `  const c = ${CALL_FORM}{});\n  process.exitCode = c;\n` },
  ]));
  const fifthOk = cFifth.length === 1
    && cFifth[0] === `payload scripts+hooks: count ${CALL_SITES} got ${CALL_SITES + 1}`;
  check('pin control: a fifth call site is reported by the count pin', fifthOk, saw(fifthOk, cFifth));

  // The FIXTURE is built from `present` only, so the `--show` branch's absent entry would pass
  // vacuously without a fixture that carries the forced exit.
  const ROLES = 'scripts/setup/aiwf-roles.mjs';
  const cShowExit = pinViolations(FIXTURE.map((s) => (s.file === ROLES
    ? { file: s.file, contents: `${s.contents}  process.exit(0);\n` }
    : s)));
  const showExitOk = cShowExit.length === 1 && cShowExit[0] === `${ROLES}: absent 0 got 1`;
  check('pin control: roles-show-exit-zero - a process.exit(0) injected into the aiwf-roles fixture is reported',
    showExitOk, saw(showExitOk, cShowExit));

  const violations = pinViolations(
    scriptsUnder(path.join(PLUGIN_ROOT, 'scripts')).concat(scriptsUnder(path.join(PLUGIN_ROOT, 'hooks'))),
  );
  check('every caller of finishWithSelfCheck returns its code through process.exitCode, never process.exit()',
    violations.length === 0, violations.join(' | ').slice(0, 300));
}

// ---------------------------------------------------------------------------
// A RENDER OVERWRITES. The consumer's own text has two homes - the overrides document and the
// project additions block of a rendered Markdown file - and everything else setup renders is written
// from the payload, whatever is on disk. Each case asserts the FILE (byte for byte where it matters),
// the RECORD (the payload version), and the report line, never just the exit code.
section('18 - setup overwrites: a pre-existing file is replaced and named, the additions block is carried');
const CLAUDE_KEY = 'CLAUDE.md#aiwf-core';
const AGENTS_REL = 'AGENTS.md';
const PLUGIN_VERSION = (readJson(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json')) || {}).version;
// The render, obtained from a real install with the same answers rather than re-implemented here.
const refProject = project('overwrite-reference');
const refInstall = install(refProject, baseAnswers(), ['--no-seeds']);
check('the reference install (for the render bytes) exits 0', refInstall.status === 0, why(refInstall));
const RENDER_ROLES = read(at(refProject, ROLES_REL)) || '';
// The rendered CLAUDE.md REGION carries no project-root value, so the region one project renders is
// the region every project with these answers renders - a legitimate EXPECTED value here.
const regionOfFile = (text) => {
  const start = (text || '').indexOf('<!-- BEGIN aiwf-core -->');
  const end = (text || '').indexOf('<!-- END aiwf-core -->');
  return start === -1 || end === -1 ? '' : text.slice(start, end + '<!-- END aiwf-core -->'.length);
};
const RENDER_REGION = regionOfFile(read(at(refProject, 'CLAUDE.md')));
check('the reference render carries a non-empty managed region (the expected value below is real)',
  RENDER_REGION.length > 0 && RENDER_REGION.includes('BEGIN aiwf-core'));
const record = (dir, key) => (((readJson(at(dir, CONFIG_REL)) || {})._aiwf || {}).managedRegions || {})[key];
const ADD_BEGIN = '<!-- project additions -->';
const ADD_END = '<!-- /project additions -->';
const BLOCK_CRLF = `${ADD_BEGIN}\r\nMy own rule for the Writer.\r\nA second line, CRLF on purpose.\r\n${ADD_END}`;

// (a) a whole-file artifact already on disk with no record -> OVERWRITTEN, named, recorded.
{
  const dir = project('overwrite-foreign-roles');
  fs.mkdirSync(at(dir, '.claude/aiwf-native'), { recursive: true });
  fs.writeFileSync(at(dir, ROLES_REL), '{ "reviewer": "mine, hand-written" }\n');
  const dry = install(dir, baseAnswers(), ['--no-seeds', '--dry-run']);
  check('(a) --dry-run over a foreign file exits 0 and names it as "overwrote:"',
    dry.status === 0 && dry.out.includes(`overwrote: ${ROLES_REL}`), why(dry, true).slice(0, 200));
  check('(a) and the dry run wrote nothing', read(at(dir, ROLES_REL)) === '{ "reviewer": "mine, hand-written" }\n');
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check('(a) the install exits 0 - nothing asks', r.status === 0, why(r, true));
  check('(a) the file IS the render now', read(at(dir, ROLES_REL)) === RENDER_ROLES);
  check('(a) the report names it as "overwrote:"', r.out.includes(`overwrote: ${ROLES_REL}`), why(r, true).slice(0, 200));
  check('(a) the record is the payload version', record(dir, ROLES_REL) === PLUGIN_VERSION, String(record(dir, ROLES_REL)));
  const before = snapshot(dir);
  const again = install(dir, baseAnswers(), ['--no-seeds']);
  check('(a) and the ordinary re-run afterwards is a zero diff with no overwrote line',
    again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0 && !again.out.includes('overwrote:'),
    diffSnapshots(before, snapshot(dir)).join(', '));
}

// (b) a CLAUDE.md carrying a FOREIGN aiwf-core region, CRLF: the region is replaced, every byte
// around it stays, and the region is named.
{
  const dir = project('overwrite-claude-region');
  const head = '# My project\r\n\r\nMy own instructions.\r\n\r\n';
  const tail = '\r\n\r\n## My tail\r\n\r\nStill mine.\r\n';
  fs.writeFileSync(at(dir, 'CLAUDE.md'), `${head}<!-- BEGIN aiwf-core -->\r\nSomeone else wrote this core.\r\n<!-- END aiwf-core -->${tail}`);
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check('(b) the install over a foreign region exits 0', r.status === 0, why(r, true));
  const after = read(at(dir, 'CLAUDE.md')) || '';
  check('(b) the region is the render now', regionOfFile(after).replace(/\r\n/g, '\n') === RENDER_REGION);
  check('(b) the text OUTSIDE the markers is byte-identical, CRLF and all',
    after.slice(0, head.length) === head && after.slice(-tail.length) === tail, JSON.stringify(after.slice(0, 24)));
  check('(b) the written region uses the file\'s own convention (no bare LF anywhere)', !/[^\r]\n/.test(after));
  check('(b) the report names the region as "overwrote:"', r.out.includes(`overwrote: ${CLAUDE_KEY}`), why(r, true).slice(0, 200));
  check('(b) and records it', record(dir, CLAUDE_KEY) === PLUGIN_VERSION);
}

// (c) a RECORDED artifact edited by hand -> overwritten on the next run (a re-render, not an
// "overwrote:" - this installation wrote it).
{
  const dir = project('overwrite-edited');
  install(dir, baseAnswers(), ['--no-seeds']);
  fs.writeFileSync(at(dir, '.claude/agents/writer.md'), `${read(at(dir, '.claude/agents/writer.md'))}\nMy hand edit.\n`);
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check('(c) the re-run over a hand-edited managed file exits 0', r.status === 0, why(r, true));
  check('(c) the hand edit is gone', !(read(at(dir, '.claude/agents/writer.md')) || '').includes('My hand edit.'));
  check('(c) and it is reported as a re-render, not as overwrote',
    r.out.includes('re-rendered') && !r.out.includes('overwrote:'), why(r, true).slice(0, 200));
}

// (d) the project additions block: carried verbatim (CRLF inside), in the render's own empty block at
// the end of the file, and a re-run - with a changed answer that really re-renders the file - still
// carries exactly one copy. Every whole-file Markdown template ends with that empty block, so the
// project writes INTO it; an edit outside it is what the re-run overwrites.
{
  const dir = project('additions-carry');
  install(dir, baseAnswers(), ['--no-seeds']);
  const writer = at(dir, '.claude/agents/writer.md');
  const emptyBlock = `${ADD_BEGIN}\n${ADD_END}`;
  check('(d) precondition: the fresh render ends with the empty project additions block',
    (read(writer) || '').endsWith(`\n\n${emptyBlock}\n`), JSON.stringify((read(writer) || '').slice(-80)));
  fs.writeFileSync(writer, (read(writer) || '').replace(emptyBlock, `An edit outside the block.\n\n${BLOCK_CRLF}`));
  const changed = baseAnswers();
  changed.roles.writer.effort = 'medium';
  const r = install(dir, changed, ['--no-seeds']);
  check('(d) the re-run with a changed answer exits 0', r.status === 0, why(r, true));
  const text = read(writer) || '';
  check('(d) the block survived byte for byte, CRLF included, exactly once',
    text.split(BLOCK_CRLF).length - 1 === 1, `${text.split(BLOCK_CRLF).length - 1} copies`);
  check('(d) in the render\'s own slot at the end of the file, behind one blank line', text.endsWith(`\n\n${BLOCK_CRLF}\n`) && !text.endsWith(`\n\n\n${BLOCK_CRLF}\n`),
    JSON.stringify(text.slice(-160)));
  check('(d) the edit OUTSIDE the block was overwritten, and the render followed the answer',
    !text.includes('An edit outside the block.') && /effort: medium/.test(text), JSON.stringify(text.slice(0, 200)));
  check('(d) the report says the block was carried', r.out.includes('project additions carried'), why(r, true).slice(0, 200));
  const before = snapshot(dir);
  const again = install(dir, changed, ['--no-seeds']);
  check('(d) and the re-run after it is a zero diff', again.status === 0 && diffSnapshots(before, snapshot(dir)).length === 0,
    diffSnapshots(before, snapshot(dir)).join(', '));
}

// (e) a malformed block -> BLOCKED naming the file, nothing written anywhere.
{
  const dir = project('additions-malformed');
  install(dir, baseAnswers(), ['--no-seeds']);
  fs.writeFileSync(at(dir, AGENTS_REL), `${read(at(dir, AGENTS_REL))}\n${ADD_BEGIN}\nhalf a block\n`);
  const before = snapshot(dir);
  const changed = baseAnswers();
  changed.roles.writer.effort = 'medium';
  const r = install(dir, changed, ['--no-seeds']);
  check('(e) a malformed additions block BLOCKS the run (exit 1), naming the file',
    r.status === 1 && r.out.includes(AGENTS_REL) && r.out.includes('malformed'), why(r, true));
  check('(e) and nothing was written', diffSnapshots(before, snapshot(dir)).length === 0, diffSnapshots(before, snapshot(dir)).join(', '));
}

// (f) legacy bookkeeping on disk (two-hash objects, a journal key) is normalised on the next run.
{
  const dir = project('legacy-bookkeeping');
  install(dir, baseAnswers(), ['--no-seeds']);
  const cfg = readJson(at(dir, CONFIG_REL));
  for (const key of Object.keys(cfg._aiwf.managedRegions)) cfg._aiwf.managedRegions[key] = { upstream: 'a'.repeat(64), local: 'a'.repeat(64), override: true };
  cfg._aiwf.migrationJournal = null;
  fs.writeFileSync(at(dir, CONFIG_REL), JSON.stringify(cfg, null, 2) + '\n');
  const r = install(dir, baseAnswers(), ['--no-seeds']);
  check('(f) a re-run over a legacy config exits 0', r.status === 0, why(r, true));
  const bk = (readJson(at(dir, CONFIG_REL)) || {})._aiwf || {};
  check('(f) and writes the current shape: version strings only, no journal key',
    !Object.prototype.hasOwnProperty.call(bk, 'migrationJournal')
    && Object.values(bk.managedRegions || {}).every((v) => v === PLUGIN_VERSION) && Object.keys(bk.managedRegions || {}).length > 0,
    JSON.stringify(bk).slice(0, 200));
}



// ---------------------------------------------------------------------------
// The one managed file that also holds the operator's own text is CLAUDE.md, and every branch that
// writes it splices bytes rather than re-encoding the file. This section is about the WRITE: the
// append and re-render branches. A CRLF checkout is the case that catches a whole-file normalisation - the region comes out
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
  // /pnp:roles re-renders through the same carry: a project additions block (CRLF inside) in the
  // Writer agent survives a --set that re-renders it, and a malformed one is refused with nothing
  // written.
  {
    const writer = at(p22, '.claude/agents/writer.md');
    const block = '<!-- project additions -->\r\nMy rule, kept by /pnp:roles.\r\n<!-- /project additions -->';
    // Written INTO the render's own empty block - a second block beside it would be malformed.
    fs.writeFileSync(writer, (read(writer) || '').replace('<!-- project additions -->\n<!-- /project additions -->', block));
    const d = roleCmd(['--set', 'writer.effort=medium']);
    const text = read(writer) || '';
    check('/pnp:roles: a re-render of the Writer carries its project additions block verbatim, once',
      d.status === 0 && /^effort: medium$/m.test(text) && text.split(block).length - 1 === 1 && text.endsWith(`\n\n${block}\n`),
      `exit ${d.status}: ${d.out.trim().split('\n').slice(-2).join(' | ')}`);
    fs.writeFileSync(writer, `${text}\n<!-- project additions -->\nhalf a block\n`);
    const before = snapshot(p22);
    const e = roleCmd(['--set', 'writer.effort=high']);
    check('/pnp:roles: a malformed block is refused (exit 1) naming the file, and nothing is written',
      e.status === 1 && e.out.includes('.claude/agents/writer.md') && e.out.includes('malformed')
      && diffSnapshots(before, snapshot(p22)).length === 0, `exit ${e.status}: ${e.out.trim().split('\n').slice(-2).join(' | ')}`);
    fs.writeFileSync(writer, text);
    // An unrecorded file at a stale agent path (qa is codex-hosted here) is left alone and named.
    const qa = at(p22, '.claude/agents/qa.md');
    const FOREIGN_QA = '---\nname: qa\n---\nSomeone else wrote this.\n';
    fs.writeFileSync(qa, FOREIGN_QA);
    const f = roleCmd(['--set', 'writer.effort=medium', '--confirm-remove-stale']);
    check('/pnp:roles: an unrecorded file at a stale agent path does not stop the run (exit 0), is named, and is untouched',
      f.status === 0 && f.out.includes('left alone: .claude/agents/qa.md (not rendered by this configuration)') && read(qa) === FOREIGN_QA,
      `exit ${f.status}: ${f.out.trim().split('\n').slice(-3).join(' | ')}`);
    fs.rmSync(qa);
  }
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
  check('and the skeleton carries the three ledger sections', ['# Transfer surface',
    '## Ruling ledger', '## Pass statistics', '## Event ledger'].every((h) => SKELETON.includes(h)),
  `${SKELETON.split('\n').length} lines`);
  check('and no Candidates section - it points at ROADMAP.md instead', !SKELETON.includes('## Candidates')
    && SKELETON.includes('Candidates live in `ROADMAP.md` under the plans directory.'),
  SKELETON.split('\n').filter((l) => l.includes('Candidates')).join(' | ').slice(0, 160));

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
      ['the Codex auditor instruction file', 'AGENTS.md'],
      ['the overrides document', 'docs/ai/PROJECT_OVERRIDES.md'],
      ['the scratch directory', '.aiwf'],
      ['the active plans directory', 'docs/backlogs/active'],
      ['the plan drafts directory', 'docs/backlogs/drafts'],
      ['the readiness history directory', 'docs/backlogs/readiness'],
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
      ['an ANCESTOR of the plan directories (drafts)', 'docs/backlogs', 'docs/backlogs/drafts'],
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
section('24b - the roadmap: seeded once at <plansDir>/ROADMAP.md, never managed, never rewritten');
{
  const ROADMAP_TMPL = path.join(PLUGIN_ROOT, 'templates', 'ROADMAP.md.tmpl');
  const lf = (t) => String(t).replace(/\r\n/g, '\n');
  const SEED = lf(read(ROADMAP_TMPL) || '');
  const regionsOf = (p) => ((readJson(at(p, CONFIG_REL)) || {})._aiwf || {}).managedRegions || {};
  const ROADMAP_REL = 'docs/backlogs/ROADMAP.md';
  check('the payload ships templates/ROADMAP.md.tmpl', SEED.length > 0, ROADMAP_TMPL);
  check('and the seed opens with "# Roadmap" and carries the entry format', SEED.startsWith('# Roadmap\n')
    && ['## <ABBR> - <title>', '- Goal:', '- Why:', '- Scope:', '- Size:', '- Plans:', '- Status:', '- Born:']
      .every((h) => SEED.includes(h)),
  SEED.split('\n')[0]);

  // --- the default plansDir: seeded, unmanaged, a repeated run is a zero diff ----------------------
  {
    const p = project('roadmap-default');
    const r = install(p, baseAnswers());
    check('install exits 0', r.status === 0, why(r));
    check(`the roadmap was seeded at <plansDir>/ROADMAP.md (${ROADMAP_REL})`, exists(at(p, ROADMAP_REL)));
    check('with exactly the payload seed', lf(read(at(p, ROADMAP_REL))) === SEED,
      `${String(lf(read(at(p, ROADMAP_REL)))).length} vs ${SEED.length} bytes`);
    check('and NO bookkeeping record was written for it (it is unmanaged by design)',
      !Object.prototype.hasOwnProperty.call(regionsOf(p), ROADMAP_REL), Object.keys(regionsOf(p)).join(', '));
    const before = snapshot(p);
    const again = install(p, baseAnswers());
    check('a second install over the same project exits 0', again.status === 0, why(again));
    check('and says the roadmap is already the operator\'s', again.out.includes(ROADMAP_REL)
      && again.out.includes('never rewrites the roadmap'),
    again.out.split('\n').filter((l) => l.includes('ROADMAP')).join(' | ').slice(0, 200));
    check('the repeated run is a ZERO diff over the whole project', diffSnapshots(before, snapshot(p)).length === 0,
      diffSnapshots(before, snapshot(p)).join(', '));
  }

  // --- a configured plansDir moves it; nothing lands at the default ------------------------------
  {
    const p = project('roadmap-plansdir');
    const r = install(p, baseAnswers({
      paths: { scratchDir: '.aiwf', plansDir: 'dev/plans', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' },
    }));
    check('install with plansDir dev/plans exits 0', r.status === 0, why(r));
    check('the roadmap was seeded at dev/plans/ROADMAP.md, with exactly the payload seed',
      exists(at(p, 'dev/plans/ROADMAP.md')) && lf(read(at(p, 'dev/plans/ROADMAP.md'))) === SEED);
    check('and nothing was seeded at the default path instead', !exists(at(p, ROADMAP_REL)));
  }

  // --- an EXISTING file is left byte for byte -----------------------------------------------------
  {
    const p = project('roadmap-existing');
    const MINE = '# Roadmap\n\n## X - my own entry\n- Goal: kept\n';
    fs.mkdirSync(at(p, 'docs/backlogs'), { recursive: true });
    fs.writeFileSync(at(p, ROADMAP_REL), MINE, 'utf8');
    const r = install(p, baseAnswers());
    check('install over an existing roadmap exits 0', r.status === 0, why(r));
    check('the operator\'s file is untouched, byte for byte', read(at(p, ROADMAP_REL)) === MINE,
      JSON.stringify(String(read(at(p, ROADMAP_REL))).slice(0, 60)));
    check('and the run SAYS so rather than adopting it in silence', r.out.includes('never rewrites the roadmap'),
      r.out.split('\n').filter((l) => l.includes('ROADMAP')).join(' | ').slice(0, 200));
    check('and it is still unmanaged', !Object.prototype.hasOwnProperty.call(regionsOf(p), ROADMAP_REL));
  }

  // --- the roadmap's path may not be another destination setup writes -------------------------------
  const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
  const basePaths = { scratchDir: '.aiwf', plansDir: 'docs/backlogs', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' };
  for (const [label, paths] of [
    ['the transfer surface configured onto it', { ...basePaths, transferSurface: ROADMAP_REL }],
    ['the overrides document placed onto it', { ...basePaths, overridesDoc: ROADMAP_REL }],
    ['the overrides document\'s directory placed onto it', { ...basePaths, overridesDoc: `${ROADMAP_REL}/OVERRIDES.md` }],
  ]) {
    for (const [entry, run] of [['generator', generateInstall], ['interview', install]]) {
      const p = project(`roadmap-collide-${entry}-${slug(label)}`);
      const r = run(p, baseAnswers({ paths }));
      check(`${entry}: REFUSES ${label} ("${ROADMAP_REL}"), exit 1`, r.status === 1, why(r, true));
      check(`${entry}: and names the roadmap in the collision (${label})`,
        r.out.includes('is the same destination setup writes as') && r.out.includes('roadmap'),
        r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 220));
      check(`${entry}: and wrote NOTHING (${label})`, Object.keys(snapshot(p)).length === 0, Object.keys(snapshot(p)).join(', '));
    }
  }
  // The positive control for the collision rows: a surface merely NEXT TO the roadmap still installs,
  // and both seeds land.
  {
    const p = project('roadmap-collide-control');
    const NEAR = 'docs/backlogs/ROADMAP-NOTES.md';
    const r = install(p, baseAnswers({ paths: { ...basePaths, transferSurface: NEAR } }));
    check('control: a surface merely NEXT TO the roadmap still installs, exit 0', r.status === 0, why(r));
    check('and both seeds landed', exists(at(p, NEAR)) && lf(read(at(p, ROADMAP_REL))) === SEED);
  }

  // --- the resolved roadmap is an existing DIRECTORY ------------------------------------------------
  {
    const p = project('roadmap-is-a-directory');
    fs.mkdirSync(at(p, ROADMAP_REL), { recursive: true });
    const before = snapshot(p);
    const r = install(p, baseAnswers());
    check('setup REFUSES when <plansDir>/ROADMAP.md is an existing directory, exit 1', r.status === 1, why(r, true));
    check('and says what it found rather than reporting the page as yours',
      r.out.includes('the roadmap') && r.out.includes('is not a regular file') && r.out.includes('directory'),
      r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 220));
    check('and wrote NOTHING', diffSnapshots(before, snapshot(p)).length === 0, diffSnapshots(before, snapshot(p)).join(', '));
    check('the operator\'s directory is still there, untouched', fs.statSync(at(p, ROADMAP_REL)).isDirectory());
  }

  // --- containment through the REAL filesystem: plansDir a junction out of the project ------------
  // With the surface configured elsewhere, only the roadmap's own judgment can see the escape.
  {
    const target = project('roadmap-escape-target');
    const p = project('roadmap-escape');
    let made = true;
    try { fs.symlinkSync(target, at(p, 'linked'), 'junction'); } catch { made = false; }
    check('fixture: a junction inside the project, pointing OUT of it, could be created', made,
      made ? '' : 'junction creation failed on this host');
    if (made) {
      const r = install(p, baseAnswers({
        paths: { scratchDir: '.aiwf', plansDir: 'linked', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md', transferSurface: 'docs/CANDIDATES.md' },
      }));
      check('setup REFUSES a roadmap that leaves the project through a junction, exit 1', r.status === 1, why(r, true));
      check('and names the roadmap and the REAL location it resolved to',
        r.out.includes('the roadmap') && r.out.includes('really resolves to') && r.out.includes('not inside the project'),
        r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 240));
      check('and NOTHING was created on the far side of the junction',
        fs.readdirSync(target).length === 0, fs.readdirSync(target).join(', '));
    }
  }
}

section('25 - paths.changesDir: unused and ignored; the containment helper keeps its seven literals');
{
  // The helper is still exported (the self-check calls it). The six refused literals are refused on
  // EVERY platform - a drive-letter form is refused on POSIX too.
  const fn = validateConfig.containedRelativePath;
  check('validate-config.mjs exports containedRelativePath', typeof fn === 'function', typeof fn);
  // Drive-letter literals are composed, never written out: the self-check's provenance section reads
  // a written-out letter-colon-slash in this file as an absolute path.
  const DRIVE = 'C:';
  const LITERALS = [
    ['a/../reports', true], ['../x', false], ['a/../../x', false], ['/x', false],
    [`${DRIVE}/x`, false], [`${DRIVE}\\x`, false], ['C:x', false],
  ];
  for (const [value, expected] of LITERALS) {
    const got = typeof fn === 'function' ? fn(value) : '(not exported)';
    check(`containedRelativePath(${JSON.stringify(value)}) is ${expected}`, got === expected, String(got));
  }

  // The setup consumer: nothing reads the key any more, so a fresh install does not write it, and an
  // old value is carried over and ignored - no refusal, whatever it says.
  check('a fresh install writes no paths.changesDir', !Object.prototype.hasOwnProperty.call((readJson(at(p1, CONFIG_REL)) || {}).paths || {}, 'changesDir'),
    JSON.stringify((readJson(at(p1, CONFIG_REL)) || {}).paths));
  const carried = project('changes-dir-carried');
  const r = install(carried, baseAnswers({ paths: { ...baseAnswers().paths, changesDir: '../x' } }), ['--no-seeds']);
  check('setup does not judge an old paths.changesDir value (exit 0) and carries it as it is',
    r.status === 0 && ((readJson(at(carried, CONFIG_REL)) || {}).paths || {}).changesDir === '../x', why(r, true));
}

// ---------------------------------------------------------------------------
try { fs.rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 3 }); } catch { /* best-effort */ }
console.log(`\nchecks: ${checks}, failures: ${failures}`);
console.log(`fixtures left behind: ${fs.existsSync(tmpRoot) ? tmpRoot : 'none'}`);
console.log(failures === 0 ? 'SETUP SUITE: PASS' : 'SETUP SUITE: FAIL');
process.exit(failures === 0 ? 0 : 1);
