'use strict';
/*
 * PromptAndPray self-check engine.
 *
 * WHAT THIS IS
 *   A standalone regression that asserts two different things and never confuses them:
 *
 *     A. PAYLOAD INVARIANTS - properties of the plugin itself. The two enforcement hooks are
 *        EXECUTED as the harness launches them (`node <hook>` with a JSON PreToolUse payload on
 *        stdin, decision read from stdout), the role resolver is EXECUTED at its real entrypoint
 *        (`pwsh -NoProfile -File aiwf-roles.ps1 -Role <r> -RolesPath <p> -AsJson`), and the Codex
 *        wrappers are checked STATICALLY for their locked flags. These assertions hold for every
 *        installation, because their subject is the payload.
 *
 *     B. PROJECT-LAYER INVARIANTS - properties of ONE installed project: the owned-ask-rule
 *        bookkeeping, the rendered artifacts (roles.json / agent frontmatter) agreeing with
 *        aiwf.config.json, and the version bookkeeping. Their subject is the project directory
 *        passed with --project-fixture.
 *
 * WHAT THIS IS NOT
 *   It is NOT - and cannot be - proof that the declarative permission rules are ENFORCED. Those
 *   are enforced by the Claude Code harness, not by anything Node can invoke, so this asserts
 *   their PRESENCE and their bookkeeping, never their enforcement. It is likewise not proof that
 *   the harness renders the Yes/No dialog for `permissionDecision: "ask"`; that rests on the
 *   operator's live observation, recorded with the hook spikes.
 *
 * HONESTY ABOUT THE FIXTURE
 *   When --project-fixture points at a directory this run had to CREATE, the project layer was
 *   authored by this very script, so passing it proves the CHECKER runs - not that some real
 *   install is healthy. Those checks are printed with a `[fixture]` tag, the version-stamp check
 *   is skipped outright as self-confirming, and the NEGATIVE CONTROLS section then mutates a
 *   throwaway copy of the fixture and requires each project-layer check to actually FAIL. A check
 *   that cannot fail is not a check, and this section is what stops this file from becoming one.
 *
 * USAGE
 *   node scripts/selfcheck/aiwf-selfcheck.js [--plugin-root <dir>] [--project-fixture <dir>]
 *
 *   --plugin-root <dir>       The plugin payload to check. Default: the repo this file lives in.
 *   --project-fixture <dir>   A project with PromptAndPray installed. If the directory is missing
 *                             or empty, a synthetic TEST fixture is written into it (this is test
 *                             input, NOT the setup generator). If omitted entirely, a temporary
 *                             fixture directory is created and removed at the end.
 *   --keep-fixture            Do not remove an auto-created temporary fixture (for debugging).
 *
 *   Exit 0 = every assertion held. Exit 1 = at least one failed. Exit 2 = the run could not start.
 */

const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : null;
}
const HAS = (flag) => process.argv.indexOf(flag) !== -1;

const PLUGIN_ROOT = path.resolve(argValue('--plugin-root') || path.resolve(__dirname, '..', '..'));
const KEEP_FIXTURE = HAS('--keep-fixture');

function bail(message) {
  console.error(`aiwf-selfcheck: ${message}`);
  process.exit(2);
}

if (!fs.existsSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'))) {
  bail(`--plugin-root "${PLUGIN_ROOT}" does not look like a plugin (no .claude-plugin/plugin.json).`);
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
const results = [];
const notes = [];
let currentSection = '(none)';

function section(title) {
  currentSection = title;
  console.log(`\n=== ${title} ===`);
}
function check(name, ok, detail) {
  results.push({ section: currentSection, name, ok: !!ok });
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' - ' + detail : ''}`);
  return !!ok;
}
// A condition this run could not exercise. Deliberately NOT counted as a pass: an unexercised
// branch that prints PASS is the exact failure mode this engine exists to avoid.
function note(name, why) {
  notes.push({ section: currentSection, name, why });
  console.log(`  [NOTE] ${name} - not exercised: ${why}`);
}

const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } };
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// ---------------------------------------------------------------------------
// Managed-artifact hashing (an INDEPENDENT implementation of the generator's projection)
// ---------------------------------------------------------------------------
// sha256 over the LF-normalised text - of the whole file for a `<file>` key, of the marked region
// INCLUDING its markers for a `<file>#<region>` key. Written out here on purpose rather than
// imported from the setup engine: a checker that reuses the code under test cannot catch that code
// hashing the wrong thing. The negative controls prove this one can fail.
const sha256 = (text) => crypto.createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
function managedHash(projectRoot, key) {
  const cut = key.indexOf('#');
  const file = cut === -1 ? key : key.slice(0, cut);
  const region = cut === -1 ? null : key.slice(cut + 1);
  const text = readText(path.join(projectRoot, ...file.split('/')));
  if (text === null) return null;
  if (!region) return sha256(text);
  const begin = `<!-- BEGIN ${region} -->`;
  const end = `<!-- END ${region} -->`;
  const from = text.indexOf(begin);
  const to = text.indexOf(end);
  if (from === -1 || to === -1 || to < from) return null;
  return sha256(text.slice(from, to + end.length));
}

// ---------------------------------------------------------------------------
// Hook execution (exactly as the harness launches a PreToolUse hook)
// ---------------------------------------------------------------------------
// The PROCESS is classified before its OUTPUT, and the order is load-bearing: every decision path
// in these hooks ends in exit 0, so a non-zero exit means the hook DIED - and a dead hook also
// prints nothing, which is indistinguishable from "allow, passthrough" if output is read first.
// Classifying a crashed gate as a silent allow is the most dangerous false green available here.
function runHook(hookPath, payload, projectDir) {
  const env = Object.assign({}, process.env);
  if (projectDir) env.CLAUDE_PROJECT_DIR = projectDir; else delete env.CLAUDE_PROJECT_DIR;
  const res = spawnSync(process.execPath, [hookPath], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
    env,
  });
  if (res.error) return { decision: 'CRASH(spawn)', reason: String(res.error.message), exit: null };
  if (res.signal) return { decision: `CRASH(signal=${res.signal})`, reason: (res.stderr || '').trim(), exit: null };
  if (res.status !== 0) return { decision: `CRASH(exit=${res.status})`, reason: (res.stderr || '').trim(), exit: res.status };
  const out = (res.stdout || '').trim();
  if (out === '') return { decision: 'allow(passthrough)', reason: '', exit: res.status };
  let parsed;
  try { parsed = JSON.parse(out); } catch (e) { return { decision: 'UNPARSEABLE', reason: out, exit: res.status }; }
  const h = parsed && parsed.hookSpecificOutput;
  if (!h || typeof h.permissionDecision !== 'string') return { decision: 'UNEXPECTED-SHAPE', reason: out, exit: res.status };
  return { decision: h.permissionDecision, reason: h.permissionDecisionReason || '', exit: res.status };
}

// ---------------------------------------------------------------------------
// PowerShell host discovery (the resolver is a .ps1 and must run for real)
// ---------------------------------------------------------------------------
function findPwsh() {
  for (const exe of ['pwsh', 'powershell']) {
    const r = spawnSync(exe, ['-NoProfile', '-Command', 'exit 0'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return exe;
  }
  return null;
}
const PWSH = findPwsh();

const RESOLVER = path.join(PLUGIN_ROOT, 'scripts', 'native', 'ps', 'aiwf-roles.ps1');
function resolveRole(role, rolesPath) {
  const args = ['-NoProfile', '-File', RESOLVER, '-Role', role, '-AsJson'];
  if (rolesPath !== undefined && rolesPath !== null) args.push('-RolesPath', rolesPath);
  const r = spawnSync(PWSH, args, { encoding: 'utf8' });
  let json = null;
  try { json = r.stdout && r.stdout.trim() ? JSON.parse(r.stdout) : null; } catch (e) { json = null; }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, json };
}

// ---------------------------------------------------------------------------
// Synthetic project fixture (TEST INPUT - not the setup generator)
// ---------------------------------------------------------------------------
// Deliberately hand-written literals rather than a render of the payload templates: the
// project-layer checks compare artifacts against EACH OTHER, so deriving every artifact from one
// source would make those comparisons tautological. The fixture also carries one tombstone
// (an owned rule that was removed and recorded in suppressedAskRules) so the suppressed branch of
// the ownership model is genuinely executed rather than skipped.
const FIXTURE_OWNED = ['Bash(git commit:*)', 'Bash(git push:*)', 'Bash(rm:*)'];
const FIXTURE_SUPPRESSED = ['Bash(git stash:*)'];

function writeFixture(root, pluginVersion) {
  const mk = (rel) => fs.mkdirSync(path.join(root, rel), { recursive: true });
  const put = (rel, content) => fs.writeFileSync(path.join(root, rel), content, 'utf8');
  mk('.claude/aiwf-native');
  mk('.claude/agents');
  mk('.aiwf');
  mk('docs/ai');
  mk('docs/backlogs/active');

  const config = {
    _aiwf: {
      installedPluginVersion: pluginVersion,
      lastMigrationApplied: '0001_initial',
      migrationJournal: null,
      managedRegions: {}, // filled in below from the files this function really writes
      ownedAskRules: FIXTURE_OWNED.slice(),
      suppressedAskRules: FIXTURE_SUPPRESSED.slice(),
    },
    project: { name: 'Fixture', description: 'a synthetic project used only by the self-check', stack: 'n/a', root: 'auto', defaultBranch: 'main' },
    os: 'windows',
    operator: { language: 'en', roleNicknames: { writer: 'Writer', reviewer: 'Reviewer', qa: 'QA' } },
    // reviewer is claude-hosted (its agent file MUST exist) while qa is codex-hosted (its agent
    // file MUST NOT exist), so both branches of the conditional-render contract are exercised.
    roles: {
      writer: { model: 'claude-opus-5[1m]', effort: 'high' },
      reviewer: { engine: 'claude', model: 'opus', effort: 'high' },
      qa: { engine: 'codex', model: 'codex-atom-2', effort: 'medium' },
      qal: { enabled: true, engine: 'codex', model: 'codex-atom-1', effort: 'high' },
    },
    loop: { correctionRoundsCap: 2 },
    enforcement: { routeWriteGuard: true },
    verify: {
      commands: [{ name: 'unit', run: 'npm test', cwd: '.' }],
      e2e: { enabled: true, cwd: 'app', runner: 'npx playwright test', specDir: 'e2e', outputDir: 'test-results/aiwf-qa' },
    },
    paths: { scratchDir: '.aiwf', plansDir: 'docs/backlogs', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' },
    review: { productBoundaryChecks: [] },
  };
  // roles.json is a RENDERED artifact of config.roles - written here with the same values so the
  // consistency check has something true to verify (and something the negative controls can break).
  put('.claude/aiwf-native/roles.json', JSON.stringify({
    reviewer: { engine: 'claude', model: 'opus', effort: 'high' },
    qa: { engine: 'codex', model: 'codex-atom-2', effort: 'medium' },
    qal: { enabled: true, engine: 'codex', model: 'codex-atom-1', effort: 'high' },
  }, null, 2) + '\n');

  const agent = (name, model, effort) =>
    `---\nname: ${name}\ndescription: fixture ${name} agent\ntools: Read, Grep, Glob\nmodel: ${model}\neffort: ${effort}\n---\n\nFixture body.\n`;
  put('.claude/agents/writer.md', `---\nname: writer\ndescription: fixture writer agent\ntools: Read, Grep, Glob, Edit, Write, Bash\nmodel: claude-opus-5[1m]\neffort: high\n---\n\nFixture body.\n`);
  put('.claude/agents/reviewer.md', agent('reviewer', 'opus', 'high'));
  // No qa.md ON PURPOSE: qa is codex-hosted here, and the conditional-render contract says a
  // codex-hosted role has NO Claude agent file. A file here would be a stale render.

  // settings.json: the factory posture, minus the one owned rule the operator removed (the
  // tombstone), so `suppressed rule is really absent from ask` is an executed branch.
  const template = readJson(path.join(PLUGIN_ROOT, 'templates', 'settings.ask-ruleset.json'));
  const desired = (template && template.permissions && template.permissions.ask) || [];
  const rendered = desired.map((r) => r.split('<projectRoot>').join(root));
  const ask = rendered.filter((r) => !FIXTURE_SUPPRESSED.includes(r));
  put('.claude/settings.json', JSON.stringify({
    permissions: { allow: ['Bash(*)'], deny: [], ask },
    hooks: {},
  }, null, 2) + '\n');

  put('docs/ai/PROJECT_OVERRIDES.md', '# Fixture overrides\n');
  put('.aiwf/.keep', '');

  // A CLAUDE.md with the managed region, so the `<file>#<region>` half of the bookkeeping has a real
  // subject. Text outside the markers is here for the same reason: it must NOT enter the hash.
  put('CLAUDE.md', [
    '# Fixture project',
    '',
    '<!-- BEGIN aiwf-core -->',
    'Managed region body (fixture).',
    '<!-- END aiwf-core -->',
    '',
    'Text below the markers belongs to the operator and is never hashed.',
    '',
  ].join('\n'));

  // The bookkeeping is computed from the files just written, never hand-typed: a fixture carrying
  // invented hashes would make the managed-region checks pass on nothing. Every artifact the config
  // implies gets an entry - roles.json, the writer, the claude-hosted reviewer, and the region.
  const managedRegions = {};
  for (const key of ['CLAUDE.md#aiwf-core', '.claude/aiwf-native/roles.json', '.claude/agents/writer.md', '.claude/agents/reviewer.md']) {
    const hash = managedHash(root, key);
    managedRegions[key] = { upstream: hash, local: hash, override: false };
  }
  config._aiwf.managedRegions = managedRegions;
  put('.claude/aiwf-native/aiwf.config.json', JSON.stringify(config, null, 2) + '\n');
}

function isEmptyDir(p) {
  try { return fs.readdirSync(p).length === 0; } catch (e) { return false; }
}

// ---------------------------------------------------------------------------
// SECTION 1 - Gate 1: identity matrix (payload, real hook execution)
// ---------------------------------------------------------------------------
const GATE1 = path.join(PLUGIN_ROOT, 'scripts', 'engine', 'pretooluse-mutation-guard.js');
const GATE2 = path.join(PLUGIN_ROOT, 'scripts', 'engine', 'pretooluse-dispatch-gate.js');
const SCHEMA_FILE = path.join(PLUGIN_ROOT, 'schema', 'aiwf.config.schema.json');
const VALIDATOR = path.join(PLUGIN_ROOT, 'scripts', 'setup', 'validate-config.mjs');

// The validator is an ESM module and this engine is CommonJS, so it is exercised at its REAL CLI
// entrypoint - which is also the entrypoint setup, generate and this file all use. Exit codes:
// 0 valid, 1 invalid, 2 the run could not start (unreadable file, or a schema the interpreter
// cannot execute).
function runValidator(configPath, schemaPath) {
  const r = spawnSync(process.execPath, [VALIDATOR, configPath, '--schema', schemaPath || SCHEMA_FILE], { encoding: 'utf8' });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

const writeEnvelope = (identity, filePath, extra) => Object.assign({
  session_id: '02a3eeba-ff69-4daa-94be-329a7a5036c1',
  permission_mode: 'acceptEdits',
  hook_event_name: 'PreToolUse',
  tool_name: 'Write',
  tool_input: { file_path: filePath, content: 'PROBE' },
  tool_use_id: 'toolu_0115iTt4t3NCUBWADAYd3j4u',
}, identity, extra || {});

function sectionGate1Identity(tmpRoot) {
  section('GATE 1 - non-writer subagents cannot write (identity, real hook run)');
  // Identity is isolated on a project dir with NO route state, so no assertion here can change
  // outcome because some ticket happens to be open somewhere.
  const root = path.join(tmpRoot, 'g1-no-ticket');
  fs.mkdirSync(root, { recursive: true });
  const src = path.join(root, 'src', 'probe.txt');
  const G = (identity, payload) => runHook(GATE1, payload || writeEnvelope(identity, src), root);
  const allow = (r) => r.decision === 'allow(passthrough)' && r.exit === 0;
  const deny = (r) => r.decision === 'deny' && r.exit === 0;

  check('true main session (no identity fields) -> allow (R1 unbroken)', allow(G({})));
  check('writer subagent (agent_type "writer") -> allow', allow(G({ agent_id: 'a1', agent_type: 'writer' })));
  check('reviewer subagent -> DENY', deny(G({ agent_id: 'a2', agent_type: 'reviewer' })));
  check('qa subagent -> DENY', deny(G({ agent_id: 'a3', agent_type: 'qa' })));
  check('ad-hoc scan subagent (Explore) -> DENY', deny(G({ agent_id: 'a4', agent_type: 'Explore' })));
  check('agent_id present + agent_type MISSING -> DENY (incomplete identity)', deny(G({ agent_id: 'a5' })));
  check('agent_id present + agent_type NULL -> DENY (incomplete identity)', deny(G({ agent_id: 'a6', agent_type: null })));
  check('agent_type "Writer" (wrong case) -> DENY (exact match only)', deny(G({ agent_id: 'a7', agent_type: 'Writer' })));
  check('non-object payload (array) -> DENY', deny(G(null, '[]')));
  check('non-object payload (string) -> DENY', deny(G(null, '"text"')));
  {
    // Raw stdin is the only way to make the parser genuinely throw; a JSON-encoding runner never can.
    const r = runHook(GATE1, '{ not json ', root);
    check('malformed JSON on stdin -> DENY via the fail-closed wrapper',
      deny(r) && r.reason.includes('fail-closed'), r.reason.slice(0, 60));
  }
  {
    const r = runHook(GATE1, '', root);
    check('empty stdin -> DENY via the fail-closed wrapper',
      deny(r) && r.reason.includes('fail-closed'), r.reason.slice(0, 60));
  }

  // Captured harness payloads, replayed verbatim except for the file path, which is rewritten onto
  // the fixture dir so the run is machine-independent. Same fixtures the hook spikes use.
  const capturedWriter = {
    session_id: '02a3eeba-ff69-4daa-94be-329a7a5036c1', cwd: root, permission_mode: 'acceptEdits',
    agent_id: 'ae88133a2c5d164f2', agent_type: 'writer', effort: { level: 'medium' },
    hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: src, content: 'PROBE_WRITER_OK' }, tool_use_id: 'toolu_0115iTt4t3NCUBWADAYd3j4u',
  };
  const capturedNonWriter = {
    session_id: 'f8bcc49e-65da-4f4d-a0f6-ef191baebb65', cwd: root, permission_mode: 'acceptEdits',
    agent_id: 'af7e5c7fab2f7c140', agent_type: 'general-purpose',
    hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: src, content: 'PROBE_NONWRITER' }, tool_use_id: 'toolu_01DVGHm7see8dGipHXdEM6L8',
  };
  check('captured live Writer payload -> allow', allow(runHook(GATE1, capturedWriter, root)));
  {
    const r = runHook(GATE1, capturedNonWriter, root);
    check('captured live general-purpose payload -> DENY naming the agent type',
      deny(r) && r.reason.includes('general-purpose'), r.reason.slice(0, 55));
  }
}

// ---------------------------------------------------------------------------
// SECTION 2 - Gate 2: every Writer dispatch is an operator click
// ---------------------------------------------------------------------------
function sectionGate2(tmpRoot) {
  section('GATE 2 - every Writer dispatch raises a native Yes/No dialog');
  const root = path.join(tmpRoot, 'g2');
  fs.mkdirSync(root, { recursive: true });
  const envelope = (toolInput, extra) => Object.assign({
    session_id: '9a1c1a44-0000-4000-8000-000000000000',
    permission_mode: 'default', hook_event_name: 'PreToolUse', tool_name: 'Agent',
    tool_input: toolInput, tool_use_id: 'toolu_02selfcheckAgentDispatch',
  }, extra || {});
  const D = (payload) => runHook(GATE2, payload, root);
  // "Passthrough" is asserted STRICTLY as "no decision JSON emitted at all" - that is literally
  // what "the operator sees nothing" means for a PreToolUse hook. "not a deny" would be satisfied
  // by an ask and would hide a gate that fires on every subagent.
  const silent = (r) => r.decision === 'allow(passthrough)' && r.exit === 0;
  const ask = (r) => r.decision === 'ask' && r.exit === 0;

  const writerDispatch = envelope({
    description: 'Implement ticket ABC-001', prompt: 'Ticket: ABC-001\n\nImplement the thing.',
    subagent_type: 'writer', model: 'opus', run_in_background: false,
  });
  {
    const r = D(writerDispatch);
    check('Agent dispatch, subagent_type "writer" -> ASK with an actionable reason',
      ask(r) && r.reason.includes('Writer dispatch'), r.reason.slice(0, 70));
  }
  check('Agent dispatch, subagent_type "reviewer" -> silent passthrough',
    silent(D(envelope({ description: 'review', prompt: 'x', subagent_type: 'reviewer' }))));
  check('Agent dispatch, subagent_type "qa" -> silent passthrough',
    silent(D(envelope({ description: 'qa', prompt: 'x', subagent_type: 'qa' }))));
  check('Agent dispatch, subagent_type "Explore" -> silent passthrough',
    silent(D(envelope({ description: 'scan', prompt: 'x', subagent_type: 'Explore' }))));
  check('Agent dispatch, subagent_type "Writer" (wrong case) -> silent passthrough',
    silent(D(envelope({ description: 'x', prompt: 'x', subagent_type: 'Writer' }))));
  check('Agent dispatch, subagent_type missing -> silent passthrough',
    silent(D(envelope({ description: 'x', prompt: 'x' }))));
  check('Agent dispatch, tool_input not an object -> ASK (fail-to-ask)', ask(D(envelope('nope'))));
  check('non-Agent tool_name (Bash) -> silent passthrough (the gate judges dispatches only)',
    silent(D({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls' } })));
  check('non-object payload -> ASK, NOT deny (the deliberate asymmetry with Gate 1)',
    ask(D('[]')) && D('[]').decision !== 'deny');
  {
    const r = D('');
    check('empty stdin -> ASK via the fail-to-ask wrapper (NOT deny)',
      ask(r) && r.reason.includes('fail-to-ask'), r.reason.slice(0, 60));
  }
}

// ---------------------------------------------------------------------------
// SECTION 3 - Gate 3: the route-state write guard (inside the Gate 1 hook file)
// ---------------------------------------------------------------------------
function sectionGate3(tmpRoot) {
  section('GATE 3 - route-state write guard: the main session cannot write code while a ticket is open');
  const roots = {};
  const mkRoot = (name, stateRaw) => {
    const root = path.join(tmpRoot, 'g3-' + name);
    fs.mkdirSync(path.join(root, '.aiwf'), { recursive: true });
    if (stateRaw !== null) fs.writeFileSync(path.join(root, '.aiwf', 'route-state.json'), stateRaw);
    roots[name] = root;
    return root;
  };
  const TICKET = 'SELFCHECK-FIXTURE';
  const R2 = mkRoot('r2', JSON.stringify({ ticket: TICKET, route: 'R2' }));
  const R3 = mkRoot('r3', JSON.stringify({ ticket: TICKET, route: 'R3' }));
  const R1 = mkRoot('r1', JSON.stringify({ ticket: TICKET, route: 'R1' }));
  const NUMROUTE = mkRoot('numroute', JSON.stringify({ ticket: TICKET, route: 2 }));
  const CLEARED = mkRoot('cleared', '{}');
  const BROKEN = mkRoot('broken', '{ not json ');
  const NOSTATE = mkRoot('nostate', null);

  const G = (root, toolInput, extra) => runHook(GATE1, Object.assign(
    { hook_event_name: 'PreToolUse', tool_name: 'Edit', tool_input: toolInput }, extra || {}), root);
  const fp = (p) => ({ file_path: p });
  const allow = (r) => r.decision === 'allow(passthrough)' && r.exit === 0;
  const deny = (r) => r.decision === 'deny' && r.exit === 0;
  const G3_MARK = 'gate 3';
  const G1_MARK = 'gate 1';

  check('main + R2 open + docs/foo.md -> allow (docs class is the COO\'s own)', allow(G(R2, fp('docs/foo.md'))));
  check('main + R2 open + .aiwf/scratch.txt -> allow (.aiwf/** must stay writable)', allow(G(R2, fp('.aiwf/scratch.txt'))));
  check('main + R2 open + root CLAUDE.md -> allow (single-segment *.md)', allow(G(R2, fp('CLAUDE.md'))));
  check('main + R2 open + docs/backlogs/active/PLAN_X.md -> allow (nested; first segment wins)',
    allow(G(R2, fp('docs/backlogs/active/PLAN_X.md'))));
  check('main + R2 open + Docs/foo.md -> allow (case-insensitive segment compare)', allow(G(R2, fp('Docs/foo.md'))));
  check('main + R2 open + a path OUTSIDE the project dir -> allow (session scratchpad / agent memory)',
    allow(G(R2, fp(path.resolve(R2, '..', 'outside.txt')))));

  const ABS_SRC = path.join(R2, 'src', 'app', 'x.ts');
  {
    const r = G(R2, fp(ABS_SRC));
    check('main + R2 open + ABSOLUTE src/app/x.ts -> DENY naming the ticket AND the path',
      deny(r) && r.reason.includes(TICKET) && r.reason.includes(ABS_SRC) && r.reason.includes(G3_MARK), r.reason.slice(0, 70));
  }
  {
    const r = G(R2, fp('src/app/x.ts'));
    check('main + R2 open + RELATIVE src/app/x.ts -> DENY (resolved against the project dir)',
      deny(r) && r.reason.includes('src/app/x.ts'), r.reason.slice(0, 70));
  }
  {
    const r = G(R2, fp('src\\app\\x.ts'));
    check('main + R2 open + BACKSLASH src\\app\\x.ts -> DENY (both separators split)',
      deny(r) && r.reason.includes(G3_MARK), r.reason.slice(0, 70));
  }
  {
    const r = G(R2, fp('.claude/settings.json'));
    check('main + R2 open + .claude/settings.json -> DENY (config holds the gates themselves)',
      deny(r) && r.reason.includes(G3_MARK), r.reason.slice(0, 70));
  }
  check('main + R3 open + src/app/x.ts -> DENY (R3 arms the guard too)', deny(G(R3, fp('src/app/x.ts'))));
  {
    // NotebookEdit names its target `notebook_path`, not `file_path`; reading only file_path would
    // let every notebook write through while a ticket is open.
    const r = G(R2, { notebook_path: 'src/analysis.ipynb' }, { tool_name: 'NotebookEdit' });
    check('main + R2 open + NotebookEdit notebook_path under src/ -> DENY (the field is read)',
      deny(r) && r.reason.includes('src/analysis.ipynb'), r.reason.slice(0, 70));
  }
  check('main + R2 open + tool_input with NO usable path -> DENY (fails closed)', deny(G(R2, { content: 'no path' })));

  check('main + route "R1" -> DENY (a present-but-unusable state fails closed, by design)', deny(G(R1, fp('src/app/x.ts'))));
  check('main + non-string route -> DENY (no coercion)', deny(G(NUMROUTE, fp('src/app/x.ts'))));
  check('main + malformed route-state JSON -> DENY', deny(G(BROKEN, fp('src/app/x.ts'))));
  check('main + unusable state + .aiwf/route-state.json -> allow (the deny is self-healing)',
    allow(G(R1, fp('.aiwf/route-state.json'))));

  check('main + NO route-state file + src/app/x.ts -> allow (R1 work untouched)', allow(G(NOSTATE, fp('src/app/x.ts'))));
  check('main + CLEARED state {} + src/app/x.ts -> allow (writing {} is how a ticket is closed)',
    allow(G(CLEARED, fp('src/app/x.ts'))));

  const W = (root, p) => runHook(GATE1, { hook_event_name: 'PreToolUse', tool_name: 'Write',
    agent_id: 'w1', agent_type: 'writer', tool_input: { file_path: p } }, root);
  check('WRITER + R2 open + src/app/x.ts -> silent allow (the Writer is never gated)', allow(W(R2, 'src/app/x.ts')));
  check('WRITER + R2 open + .claude/settings.json -> silent allow', allow(W(R2, '.claude/settings.json')));
  check('WRITER + R3 open + src/app/x.ts -> silent allow', allow(W(R3, 'src/app/x.ts')));
  {
    // The two denial classes must stay distinguishable, or a blocked Reviewer gets mis-diagnosed as
    // a route-state problem.
    const r = runHook(GATE1, { hook_event_name: 'PreToolUse', tool_name: 'Edit', agent_id: 'a9',
      agent_type: 'reviewer', tool_input: { file_path: 'src/app/x.ts' } }, R2);
    check('reviewer subagent + R2 open -> DENY via the IDENTITY path, not the route path',
      deny(r) && r.reason.includes(G1_MARK) && !r.reason.includes(G3_MARK), r.reason.slice(0, 70));
  }
}

// ---------------------------------------------------------------------------
// SECTION 3b - Gate 3's per-project toggle (enforcement.routeWriteGuard)
// ---------------------------------------------------------------------------
// The toggle is read from the PROJECT's aiwf.config.json, so every case here builds a project dir
// with an armed route state and varies only the config. The direction under test is the safe one:
// anything that is not an explicit boolean `false` leaves the guard armed - a corrupt config must
// never be a way to switch a gate off.
function sectionGate3Toggle(tmpRoot) {
  section('GATE 3 TOGGLE - enforcement.routeWriteGuard, and every failure mode leaves the guard ARMED');
  const mkProject = (name, configRaw) => {
    const root = path.join(tmpRoot, 'g3t-' + name);
    fs.mkdirSync(path.join(root, '.aiwf'), { recursive: true });
    fs.mkdirSync(path.join(root, '.claude', 'aiwf-native'), { recursive: true });
    fs.writeFileSync(path.join(root, '.aiwf', 'route-state.json'), JSON.stringify({ ticket: 'TOGGLE-FIXTURE', route: 'R2' }));
    if (configRaw !== null) fs.writeFileSync(path.join(root, '.claude', 'aiwf-native', 'aiwf.config.json'), configRaw);
    return root;
  };
  const cfg = (enforcement) => JSON.stringify({ project: { name: 'Toggle' }, enforcement });
  const G = (root, filePath, identity) => runHook(GATE1, Object.assign({
    hook_event_name: 'PreToolUse', tool_name: 'Edit', tool_input: { file_path: filePath },
  }, identity || {}), root);
  const allow = (r) => r.decision === 'allow(passthrough)' && r.exit === 0;
  const deny = (r) => r.decision === 'deny' && r.exit === 0;

  check('routeWriteGuard false + R2 open + src/app/x.ts -> allow (the project switched Gate 3 off)',
    allow(G(mkProject('off', cfg({ routeWriteGuard: false })), 'src/app/x.ts')));
  check('routeWriteGuard true + R2 open + src/app/x.ts -> DENY (explicitly on)',
    deny(G(mkProject('on', cfg({ routeWriteGuard: true })), 'src/app/x.ts')));
  check('NO config file + R2 open -> DENY (armed, exactly as before the config layer existed)',
    deny(G(mkProject('noconfig', null), 'src/app/x.ts')));
  check('CORRUPT config + R2 open -> DENY (a broken config is not a way to disarm a gate)',
    deny(G(mkProject('corrupt', '{ not json '), 'src/app/x.ts')));
  check('config without an enforcement block + R2 open -> DENY (missing key = armed)',
    deny(G(mkProject('nokey', JSON.stringify({ project: { name: 'Toggle' } })), 'src/app/x.ts')));
  check('routeWriteGuard "false" (a STRING) + R2 open -> DENY (no coercion)',
    deny(G(mkProject('strfalse', cfg({ routeWriteGuard: 'false' })), 'src/app/x.ts')));
  check('routeWriteGuard null + R2 open -> DENY (only an explicit boolean false disarms)',
    deny(G(mkProject('null', cfg({ routeWriteGuard: null })), 'src/app/x.ts')));
  check('config is a JSON array + R2 open -> DENY (not a plain object = armed)',
    deny(G(mkProject('array', '[]'), 'src/app/x.ts')));
  {
    // The whole point of the toggle's scope: it may switch off responsibility (2) and NOTHING else.
    const root = mkProject('identity', cfg({ routeWriteGuard: false }));
    const r = G(root, 'src/app/x.ts', { agent_id: 'a1', agent_type: 'reviewer' });
    check('routeWriteGuard false + REVIEWER subagent -> still DENY via the identity path (Gate 1 is untouchable)',
      deny(r) && r.reason.includes('gate 1'), r.reason.slice(0, 70));
  }
  check('routeWriteGuard false + WRITER + src/app/x.ts -> allow (unchanged)',
    allow(G(mkProject('writer', cfg({ routeWriteGuard: false })), 'src/app/x.ts', { agent_id: 'w1', agent_type: 'writer' })));
}

// ---------------------------------------------------------------------------
// SECTION 3c - the config schema and its interpreter
// ---------------------------------------------------------------------------
// Both directions are asserted: the shipped schema ACCEPTS a healthy config, and it REJECTS the
// specific mistakes the interview can produce. The last three cases are the negative controls for
// this section - they break the schema and the validator themselves, because a validator that
// cannot fail (or a schema that is unreadable and treated as satisfied) would make every other
// assertion here decorative.
function sectionConfigSchema(tmpRoot) {
  section('CONFIG SCHEMA - the schema is the authority and the interpreter really enforces it');
  const dir = path.join(tmpRoot, 'schema');
  fs.mkdirSync(dir, { recursive: true });

  const schema = readJson(SCHEMA_FILE);
  if (!check('schema/aiwf.config.schema.json exists and parses', schema != null, SCHEMA_FILE)) return;
  check('the schema declares draft 2020-12', schema.$schema === 'https://json-schema.org/draft/2020-12/schema', String(schema.$schema));
  check('the schema forbids unknown top-level keys', schema.additionalProperties === false);
  check('scripts/setup/validate-config.mjs exists', fs.existsSync(VALIDATOR));

  // A fixture project, written by the same function the project-layer checks use, so "the shipped
  // schema accepts the shape this engine treats as healthy" is a real cross-check between the two.
  const fx = path.join(dir, 'fixture');
  fs.mkdirSync(fx, { recursive: true });
  writeFixture(fx, (readJson(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json')) || {}).version || '0.0.0');
  const goodConfig = path.join(fx, '.claude', 'aiwf-native', 'aiwf.config.json');
  {
    const r = runValidator(goodConfig);
    check('the self-check fixture config VALIDATES against the shipped schema (they cannot drift apart)',
      r.status === 0, r.status === 0 ? '' : `${r.stderr.slice(0, 220)}`);
  }

  const variant = (name, mutate) => {
    const p = path.join(dir, `${name}.json`);
    const cfg = readJson(goodConfig);
    mutate(cfg);
    fs.writeFileSync(p, JSON.stringify(cfg, null, 2));
    return p;
  };
  const rejects = (name, file, expectFragment) => {
    const r = runValidator(file);
    check(name, r.status === 1 && (!expectFragment || r.stderr.includes(expectFragment)),
      `exit ${r.status}${r.stderr ? ' - ' + r.stderr.split('\n').slice(0, 2).join(' ').slice(0, 120) : ''}`);
  };

  rejects('rejects an unknown OS channel', variant('bad-os', (c) => { c.os = 'solaris'; }), '/os');
  rejects('rejects an empty project.name', variant('no-name', (c) => { c.project.name = ''; }), '/project/name');
  rejects('rejects a missing required block', variant('no-paths', (c) => { delete c.paths; }), 'paths');
  rejects('rejects an unknown top-level key (typo protection)', variant('typo', (c) => { c.enforcment = {}; }));
  rejects('rejects a claude-hosted role pinned to a full model id (the conditional really fires)',
    variant('full-id', (c) => { c.roles.reviewer.model = 'claude-opus-5[1m]'; }), '/roles/reviewer/model');
  rejects('rejects a codex-hosted qal switched to another engine', variant('qal-engine', (c) => { c.roles.qal.engine = 'claude'; }));
  rejects('rejects a correctionRoundsCap below 1', variant('cap0', (c) => { c.loop.correctionRoundsCap = 0; }));
  rejects('rejects a scratchDir moved away from .aiwf', variant('scratch', (c) => { c.paths.scratchDir = '.scratch'; }));
  rejects('rejects a verify command with no run line', variant('cmd', (c) => { c.verify.commands = [{ name: 'unit' }]; }));
  rejects('rejects a non-sha256 managed-region hash', variant('hash', (c) => {
    c._aiwf.managedRegions['roles.json'] = { upstream: 'nope', local: 'nope', override: false };
  }));

  // --- negative controls for THIS section ---------------------------------------------------
  {
    const broken = path.join(dir, 'corrupt.schema.json');
    fs.writeFileSync(broken, '{ not json ');
    const r = runValidator(goodConfig, broken);
    check('CONTROL: an unreadable schema exits 2, it is never treated as satisfied', r.status === 2, `exit ${r.status}`);
  }
  {
    // A keyword the interpreter does not implement must STOP the run. Silently ignoring it would
    // turn a real constraint into decoration - the exact failure this design refuses.
    const unsupported = path.join(dir, 'unsupported.schema.json');
    const copy = readJson(SCHEMA_FILE);
    copy.properties.os.multipleOf = 2;
    fs.writeFileSync(unsupported, JSON.stringify(copy, null, 2));
    const r = runValidator(goodConfig, unsupported);
    check('CONTROL: a schema keyword the interpreter cannot execute exits 2 (never silently ignored)',
      r.status === 2 && r.stderr.includes('unsupported schema keyword'), `exit ${r.status} - ${r.stderr.slice(0, 90)}`);
  }
  {
    // Strip the assertions out of a COPY of the validator and require the rejection to disappear.
    // If this control ever passes trivially, the rejections above were constants, not checks.
    const sabotaged = path.join(dir, 'sabotaged-validator.mjs');
    const src = readText(VALIDATOR);
    fs.writeFileSync(sabotaged, src.split('return errors;').join('return [];'));
    const badConfig = variant('control-bad', (c) => { c.os = 'solaris'; });
    const r = spawnSync(process.execPath, [sabotaged, badConfig, '--schema', SCHEMA_FILE], { encoding: 'utf8' });
    check('CONTROL: a validator stripped of its assertions stops rejecting the bad config (so the rejections above are real)',
      r.status === 0, `exit ${r.status}`);
  }
}

// ---------------------------------------------------------------------------
// SECTION 4 - hook wiring (the plugin's own hooks.json)
// ---------------------------------------------------------------------------
function sectionHookWiring() {
  section('HOOK WIRING - exactly the two enforcement hooks, on the right matchers');
  const hooksFile = path.join(PLUGIN_ROOT, 'hooks', 'hooks.json');
  const hooks = readJson(hooksFile);
  if (!check('hooks/hooks.json parses as JSON', hooks != null)) return;
  const raw = JSON.stringify(hooks.hooks || {});
  check('Gate 1 (pretooluse-mutation-guard.js) wired', raw.includes('pretooluse-mutation-guard.js'));
  check('Gate 2 (pretooluse-dispatch-gate.js) wired', raw.includes('pretooluse-dispatch-gate.js'));
  const scriptCount = (raw.match(/pretooluse-[a-z-]+\.js|userpromptsubmit-[a-z-]+\.js/g) || []).length;
  check('exactly two enforcement hook scripts wired (nothing else crept in)', scriptCount === 2, `${scriptCount} wired`);
  check('hook commands resolve through ${CLAUDE_PLUGIN_ROOT} (payload-relative, not project-relative)',
    (raw.match(/\$\{CLAUDE_PLUGIN_ROOT\}/g) || []).length === 2);
  const entries = (hooks.hooks && Array.isArray(hooks.hooks.PreToolUse)) ? hooks.hooks.PreToolUse : [];
  const g1 = entries.find((e) => JSON.stringify(e.hooks || []).includes('pretooluse-mutation-guard.js'));
  const g2 = entries.find((e) => JSON.stringify(e.hooks || []).includes('pretooluse-dispatch-gate.js'));
  check('Gate 1 matcher covers the whole Edit/Write tool class',
    !!g1 && ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].every((t) => String(g1.matcher).includes(t)),
    g1 ? `matcher=${JSON.stringify(g1.matcher)}` : 'entry not found');
  // Empirically the subagent-dispatch tool_name is "Agent" (the SDK reports the same call as
  // "Task" elsewhere). A word matcher is an EXACT match, so a wrong string silently disables the
  // whole gate without failing anything else.
  check('Gate 2 matcher is exactly "Agent" (the real subagent-dispatch tool name)',
    !!g2 && g2.matcher === 'Agent', g2 ? `matcher=${JSON.stringify(g2.matcher)}` : 'entry not found');
  check('both wired hook files exist on disk', fs.existsSync(GATE1) && fs.existsSync(GATE2));
}

// ---------------------------------------------------------------------------
// SECTION 5 - Codex wrapper flag locks (static source checks)
// ---------------------------------------------------------------------------
function sectionWrappers() {
  section('WRAPPERS - locked flags, stdin-only delivery, no hardcoded model or project root');
  const PS = path.join(PLUGIN_ROOT, 'scripts', 'native', 'ps');
  const src = (f) => readText(path.join(PS, f));
  const reviewSrc = src('codex-review.ps1');
  const qaSrc = src('codex-qa.ps1');
  const qalSrc = src('codex-qal.ps1');
  const resolverSrc = readText(RESOLVER);

  // Flags are checked against the `$codexArgs = @( ... )` array ONLY - the security comments in the
  // headers cite the forbidden flags by name, so checking the whole file would false-match those.
  // Close on the array's REAL terminator (a `)` at the start of a line, CRLF-safe): an argument
  // value contains an inline `)` in `model_reasoning_effort=$($role.effort)`.
  const argBlock = (s) => { const m = s ? /\$codexArgs\s*=\s*@\(([\s\S]*?)[\r\n]+\)/.exec(s) : null; return m ? m[1] : ''; };
  // Every flag assertion is an EXACT ARGV PAIR, never a bare word. A bare-word check passes on the
  // word wherever it appears - including inside a comment that happens to sit in the args block -
  // so a wrapper could be switched to `workspace-write` while a stale `# ... read-only ...` comment
  // kept the check green. The pair regexes below match only real, adjacent argv atoms.
  const SANDBOX_PAIR = (value) => new RegExp(`'--sandbox'\\s*,\\s*'${value}'`);
  const EFFORT_PAIR = /'-c'\s*,\s*"model_reasoning_effort=\$\(\$role\.effort\)"/;
  const MODEL_PAIR = /'-m'\s*,\s*\$role\.model\b/;
  const EXEC_FIRST = /^\s*(?:#[^\n]*\n\s*)*'exec'\s*,/;
  const POSITIONAL = /@codexArgs\s+\$Prompt|\$Prompt\s+@codexArgs|codex\s+@codexArgs\s+"?\$Prompt/;
  const STDIN = /\$Prompt\s*\|\s*&\s*codex\s+@codexArgs/;
  // Assert the CONSECUTIVE argv PAIR, not the bare literal: deleting the `'-c',` token would leave
  // the value orphaned and the flag inert, yet a bare-literal check would still pass.
  const APPROVAL_PIN = /'-c'\s*,\s*'approval_policy=never'/;
  // Generalized negatives (the reference implementation hardcoded one model id and one repo path):
  // the model must come from the resolver, and no wrapper may bake an absolute filesystem path into
  // the args it hands the engine.
  const QUOTED_MODEL = /'-m'\s*,\s*['"]/;
  const ABSOLUTE_PATH_LITERAL = /['"][A-Za-z]:[\\/]|['"]\/(?:home|Users|mnt|opt|var)\//;
  const MANDATORY_PROJECT_ROOT = /\[Parameter\(Mandatory\)\]\[string\]\s*\$ProjectRoot/;
  const PASSES_ROLES_PATH = /-RolesPath\s+\$rolesPath/;

  // ASCII-only: PowerShell 5.1 mis-decodes non-ASCII bytes in a script it is asked to run, so a
  // stray dash or quote character can break the wrapper on a stock Windows host.
  for (const f of fs.readdirSync(PS).filter((n) => n.endsWith('.ps1'))) {
    const buf = fs.readFileSync(path.join(PS, f));
    let bad = -1;
    for (let i = 0; i < buf.length; i++) { if (buf[i] > 0x7f) { bad = i; break; } }
    check(`${f} is ASCII-only (PowerShell 5.1 compatibility)`, bad === -1,
      bad === -1 ? `${buf.length} bytes` : `first non-ASCII byte 0x${buf[bad].toString(16)} at offset ${bad}`);
  }

  for (const [name, s, role] of [['codex-review.ps1', reviewSrc, 'reviewer'], ['codex-qa.ps1', qaSrc, 'qa']]) {
    if (!check(`${name} exists`, s != null)) continue;
    const args = argBlock(s);
    check(`${name} opens the argv with the 'exec' atom`, EXEC_FIRST.test(args), args.split('\n')[0].trim());
    check(`${name} pins the '--sandbox','read-only' argv PAIR (not the bare word)`, SANDBOX_PAIR('read-only').test(args));
    check(`${name} pins the '-c','approval_policy=never' pair`, APPROVAL_PIN.test(args));
    check(`${name} argv contains NO danger-full-access atom`, !SANDBOX_PAIR('danger-full-access').test(args));
    check(`${name} argv contains NO --dangerously-bypass atom`, !/'--dangerously-bypass[a-z-]*'/.test(args));
    check(`${name} argv contains NO --ignore-user-config atom`, !/'--ignore-user-config'/.test(args));
    check(`${name} delivers the prompt via stdin`, STDIN.test(s));
    check(`${name} has NO positional prompt`, !POSITIONAL.test(s));
    check(`${name} exits 2 on an empty prompt`, s.includes('exit 2'));
    check(`${name} takes -C from the caller's $ProjectRoot, never a baked-in path`,
      /'-C',\s*\$ProjectRoot/.test(args) && !ABSOLUTE_PATH_LITERAL.test(args));
    check(`${name} declares -ProjectRoot Mandatory`, MANDATORY_PROJECT_ROOT.test(s));
    check(`${name} resolves the ${role} role through the resolver entrypoint with -RolesPath`,
      /aiwf-roles\.ps1/.test(s) && new RegExp(`-Role\\s+${role}\\b`).test(s) && PASSES_ROLES_PATH.test(s));
    check(`${name} passes the resolved model as the '-m',$role.model pair`, MODEL_PAIR.test(args));
    check(`${name} does NOT hardcode a model literal in -m`, !QUOTED_MODEL.test(args));
    check(`${name} exits 2 when the resolved engine is not codex`, /\$role\.engine\s+-ne\s+'codex'/.test(s));
    check(`${name} pins the '-c',"model_reasoning_effort=$($role.effort)" pair`, EFFORT_PAIR.test(args));
  }

  if (check('codex-qal.ps1 exists', qalSrc != null)) {
    const args = argBlock(qalSrc);
    check('qal opens the argv with the \'exec\' atom', EXEC_FIRST.test(args), args.split('\n')[0].trim());
    check('qal pins the \'--sandbox\',\'danger-full-access\' argv PAIR', SANDBOX_PAIR('danger-full-access').test(args));
    check("qal pins the '-c','approval_policy=never' pair", APPROVAL_PIN.test(args));
    check('qal argv contains NO --dangerously-bypass atom', !/'--dangerously-bypass[a-z-]*'/.test(args));
    check('qal argv contains NO --ignore-user-config atom', !/'--ignore-user-config'/.test(args));
    check('qal does NOT reintroduce a restrictive --sandbox pair',
      !SANDBOX_PAIR('read-only').test(args) && !SANDBOX_PAIR('workspace-write').test(args));
    check('qal -C targets the per-run scratch, never a baked-in path',
      /'-C',\s*\$Scratch/.test(args) && !ABSOLUTE_PATH_LITERAL.test(args));
    check('qal never passes $ProjectRoot to codex (the repo is never the cwd)', !/'-C',\s*\$ProjectRoot/.test(args));
    check('qal delivers the prompt via stdin', STDIN.test(qalSrc));
    check('qal has NO positional prompt', !POSITIONAL.test(qalSrc));
    check('qal exits 2 on an empty prompt', qalSrc.includes('exit 2'));
    check('qal generates a per-run GUID for the scratch dir', /\[guid\]::NewGuid\(\)/.test(qalSrc));
    // A truncated GUID shrinks the space and, paired with -Force, permits a reusable path.
    check('qal uses the FULL GUID (no Substring truncation)', !/NewGuid\(\)\.ToString\('N'\)\.Substring/.test(qalSrc));
    check('qal builds a per-run scratch id (timestamp + GUID)', /\$RunId\s*=/.test(qalSrc) && /yyyyMMdd/.test(qalSrc));
    check('qal places the unique scratch under an aiwf-qal parent', /'aiwf-qal'/.test(qalSrc) && /\$RunId/.test(qalSrc));
    check('qal creates the leaf scratch collision-safe (Test-Path guard + retry loop)',
      /Test-Path\s+-LiteralPath\s+\$candidate/.test(qalSrc) && /for\s*\(\s*\$i\s*=/.test(qalSrc));
    check('qal defines a shared Remove-QalScratch cleanup helper', /function\s+Remove-QalScratch/.test(qalSrc));
    check('qal cleanup helper warns with the path on failure',
      /Remove-Item[^\n]*\$Path/.test(qalSrc) && /Write-Warning[^\n]*\$Path/.test(qalSrc));
    check('qal calls the cleanup helper on BOTH exit paths',
      (qalSrc.match(/Remove-QalScratch\s+-Path\s+\$Scratch/g) || []).length >= 2);
    check('qal resolves the qal role through the resolver entrypoint with -RolesPath',
      /aiwf-roles\.ps1/.test(qalSrc) && /-Role\s+qal\b/.test(qalSrc) && PASSES_ROLES_PATH.test(qalSrc));
    check('qal passes the resolved model as the \'-m\',$role.model pair', MODEL_PAIR.test(args));
    check('qal does NOT hardcode a model literal in -m', !QUOTED_MODEL.test(args));
    check('qal exits 2 when the resolved engine is not codex (codex-only by design)',
      /\$role\.engine\s+-ne\s+'codex'/.test(qalSrc));
    // The operator gate, fail-closed: only a real boolean true may enable QAL.
    check('qal refuses to run unless roles.qal.enabled is true (operator gate, fail-closed)',
      /\$role\.enabled\s+-is\s+\[bool\]/.test(qalSrc) && /-not\s+\$qalEnabled/.test(qalSrc));
    check('qal pins the \'-c\',"model_reasoning_effort=$($role.effort)" pair', EFFORT_PAIR.test(args));
  }

  if (check('aiwf-roles.ps1 exists', resolverSrc != null)) {
    check('resolver reads the config EXACTLY once (single Get-Content)',
      (resolverSrc.match(/Get-Content\b/g) || []).length === 1);
    check('resolver declares -RolesPath Mandatory (no payload-relative default)',
      /\[Parameter\(Mandatory\)\]\[string\]\s*\$RolesPath/.test(resolverSrc));
    check('resolver has NO script-relative fallback to a roles.json path',
      !/\$PSScriptRoot[^\n]*roles\.json/.test(resolverSrc));
    check('resolver has NO built-in capability-map construct',
      !/CapabilityMap\s*=|Get-AiwfCapabilityMap|capmap\[/i.test(resolverSrc));
    check('resolver is entrypoint-only (no dot-source dual-mode guard)',
      !/InvocationName\s*-ne\s*'\.'/.test(resolverSrc));
  }
}

// ---------------------------------------------------------------------------
// SECTION 6 - the role resolver at its real entrypoint
// ---------------------------------------------------------------------------
function sectionResolver(tmpRoot) {
  section('ROLE RESOLVER - real entrypoint, two failure paths, claude factory fallback');
  if (!PWSH) {
    check('a PowerShell host is available to run the resolver', false,
      'neither `pwsh` nor `powershell` could be executed - the resolver contract is UNPROVEN in this run');
    return;
  }
  const dir = path.join(tmpRoot, 'resolver');
  fs.mkdirSync(dir, { recursive: true });
  const fx = (name, content) => { const p = path.join(dir, name); fs.writeFileSync(p, content); return p; };

  const VALID = fx('valid.json', JSON.stringify({
    reviewer: { engine: 'codex', model: 'atom-9', effort: 'low' },
    qa: { engine: 'claude', model: 'opus', effort: 'high' },
    qal: { enabled: true, engine: 'codex', model: 'atom-9', effort: 'high' },
  }));
  const QAL_NO_ENABLED = fx('qal-no-enabled.json', JSON.stringify({ qal: { engine: 'codex', model: 'atom-9', effort: 'high' } }));
  const QAL_STR_ENABLED = fx('qal-str-enabled.json', '{ "qal": { "enabled": "true", "engine": "codex", "model": "atom-9", "effort": "high" } }');
  const QAL_FALSE = fx('qal-false.json', JSON.stringify({ qal: { enabled: false, engine: 'codex', model: 'atom-9', effort: 'high' } }));
  const MALFORMED = fx('malformed.json', '{ not json ');
  const BADENGINE = fx('badengine.json', JSON.stringify({ reviewer: { engine: 'grok', model: 'x', effort: 'high' } }));
  const EMPTYMODEL = fx('emptymodel.json', JSON.stringify({ reviewer: { engine: 'codex', model: '', effort: 'high' } }));
  const MISSINGROLE = fx('missingrole.json', JSON.stringify({ qa: { engine: 'claude', model: 'opus', effort: 'high' } }));
  const NUMMODEL = fx('nummodel.json', '{ "reviewer": { "engine": "codex", "model": 5, "effort": "high" } }');
  const BOOLMODEL = fx('boolmodel.json', '{ "reviewer": { "engine": "codex", "model": true, "effort": "high" } }');
  const OBJMODEL = fx('objmodel.json', '{ "reviewer": { "engine": "codex", "model": {"x":1}, "effort": "high" } }');
  const ARRMODEL = fx('arrmodel.json', '{ "reviewer": { "engine": "codex", "model": ["a"], "effort": "high" } }');
  const NUMENGINE = fx('numengine.json', '{ "reviewer": { "engine": 7, "model": "gpt", "effort": "high" } }');
  const NUMEFFORT = fx('numeffort.json', '{ "reviewer": { "engine": "claude", "model": "opus", "effort": 5 } }');
  const NOEFFORT = fx('noeffort.json', '{ "reviewer": { "engine": "claude", "model": "opus" } }');
  const EMPTYEFFORT = fx('emptyeffort.json', '{ "reviewer": { "engine": "claude", "model": "opus", "effort": "" } }');
  const NOFILE = path.join(dir, 'does-not-exist.json');

  const okSnap = (r, engine, model, effort) => r.status === 0 && r.json
    && r.json.engine === engine && r.json.model === model && r.json.effort === effort;
  const isExit2 = (r) => r.status === 2;

  check('valid record -> the exact (engine, model, effort) triple, exit 0',
    okSnap(resolveRole('reviewer', VALID), 'codex', 'atom-9', 'low'));
  check('a claude-hosted record routes to claude with its own model/effort',
    okSnap(resolveRole('qa', VALID), 'claude', 'opus', 'high'));
  // THE FLIP: a missing config must fall back to claude, never to a paid external engine.
  {
    const r = resolveRole('reviewer', NOFILE);
    check('missing config file -> factory fallback claude/opus/high, exit 0 (never codex)',
      okSnap(r, 'claude', 'opus', 'high'), r.json ? `${r.json.engine}/${r.json.model}/${r.json.effort}` : `exit ${r.status}`);
  }
  {
    // Consequence of the flip: with no config, QAL resolves to claude and is disabled, so the
    // codex-only wrapper refuses. Fail-closed by construction.
    const r = resolveRole('qal', NOFILE);
    check('missing config file + qal -> claude AND enabled=false (QAL fails closed)',
      r.status === 0 && r.json && r.json.engine === 'claude' && r.json.enabled === false);
  }
  check('qal record -> the snapshot carries enabled=true', (() => {
    const r = resolveRole('qal', VALID); return r.status === 0 && r.json && r.json.enabled === true;
  })());
  check('qal record with enabled:false -> enabled=false', (() => {
    const r = resolveRole('qal', QAL_FALSE); return r.status === 0 && r.json && r.json.enabled === false;
  })());
  check('qal record with NO enabled key -> enabled=false (absent means disabled)', (() => {
    const r = resolveRole('qal', QAL_NO_ENABLED); return r.status === 0 && r.json && r.json.enabled === false;
  })());
  check('qal record with enabled:"true" (a string) -> enabled=false (no coercion)', (() => {
    const r = resolveRole('qal', QAL_STR_ENABLED); return r.status === 0 && r.json && r.json.enabled === false;
  })());
  check('reviewer snapshot carries NO enabled key (the gate is qal-only)', (() => {
    const r = resolveRole('reviewer', VALID);
    return r.status === 0 && r.json && !Object.prototype.hasOwnProperty.call(r.json, 'enabled');
  })());

  check('malformed JSON -> exit 2', isExit2(resolveRole('reviewer', MALFORMED)));
  check('unknown engine -> exit 2', isExit2(resolveRole('reviewer', BADENGINE)));
  check('empty model -> exit 2', isExit2(resolveRole('reviewer', EMPTYMODEL)));
  check('role missing from the file -> exit 2', isExit2(resolveRole('reviewer', MISSINGROLE)));
  check('unknown role argument -> exit 2', isExit2(resolveRole('bogus', VALID)));
  check('number model -> exit 2 (no coercion)', isExit2(resolveRole('reviewer', NUMMODEL)));
  check('bool model -> exit 2 (no coercion)', isExit2(resolveRole('reviewer', BOOLMODEL)));
  check('object model -> exit 2 (no coercion)', isExit2(resolveRole('reviewer', OBJMODEL)));
  check('array model -> exit 2 (no coercion)', isExit2(resolveRole('reviewer', ARRMODEL)));
  check('non-string engine -> exit 2 (no coercion)', isExit2(resolveRole('reviewer', NUMENGINE)));
  check('non-string effort -> exit 2', isExit2(resolveRole('reviewer', NUMEFFORT)));
  check('missing effort -> exit 2', isExit2(resolveRole('reviewer', NOEFFORT)));
  check('empty effort -> exit 2', isExit2(resolveRole('reviewer', EMPTYEFFORT)));
  // -RolesPath is Mandatory, so omitting it must NOT silently resolve against some payload default.
  // A mandatory parameter with no value on a non-interactive host fails rather than prompting.
  {
    const r = resolveRole('reviewer', null);
    check('omitting -RolesPath does NOT silently resolve (the parameter is mandatory)',
      r.status !== 0 || r.json === null, `exit ${r.status}`);
  }
}

// ---------------------------------------------------------------------------
// PROJECT-LAYER CHECKS (returned as data, so the negative controls can re-run them)
// ---------------------------------------------------------------------------
// Each entry is { id, name, ok, detail, note }. `id` is a STABLE key that never embeds a configured
// value, so the negative controls can target a check without hardcoding fixture data. `note: true`
// means "this run could not exercise the branch" - it is neither a pass nor a failure, and a
// negative control may not target it. The caller decides whether a failure is a failure (normal run)
// or the expected outcome (negative control).
function projectLayerFindings(projectRoot, pluginRoot, opts) {
  const out = [];
  const add = (id, name, ok, detail) => out.push({ id, name, ok: !!ok, detail: detail || '', note: false });
  const addNote = (id, name, why) => out.push({ id, name, ok: true, detail: why || '', note: true });
  const selfAuthored = !!(opts && opts.selfAuthored);

  const cfgPath = path.join(projectRoot, '.claude', 'aiwf-native', 'aiwf.config.json');
  const cfg = readJson(cfgPath);
  if (!cfg) { add('config-parses', 'aiwf.config.json exists and parses', false, cfgPath); return out; }
  add('config-parses', 'aiwf.config.json exists and parses', true);

  const bk = cfg._aiwf || {};
  const settings = readJson(path.join(projectRoot, '.claude', 'settings.json'));
  const ask = (settings && settings.permissions && Array.isArray(settings.permissions.ask)) ? settings.permissions.ask : null;
  const allow = (settings && settings.permissions && Array.isArray(settings.permissions.allow)) ? settings.permissions.allow : null;
  const deny = (settings && settings.permissions && Array.isArray(settings.permissions.deny)) ? settings.permissions.deny : null;
  // What an installation actually REQUIRES here is `permissions.ask` as a list - that is the set the
  // ownership bookkeeping talks about. `allow`/`deny` are NOT required: setup applies the factory
  // posture only to a project that had no permissions block at all, so a project carrying just an
  // `ask` list is a legitimate install, and failing it would fail the very posture setup preserved.
  add('settings-parses', '.claude/settings.json exists, parses, and declares permissions.ask as a list',
    ask != null, ask != null ? `${ask.length} ask rules; allow=${allow ? allow.length + ' rules' : 'not declared'} deny=${deny ? deny.length + ' rules' : 'not declared'}` : 'no permissions.ask array');

  const owned = Array.isArray(bk.ownedAskRules) ? bk.ownedAskRules : [];
  const suppressed = Array.isArray(bk.suppressedAskRules) ? bk.suppressedAskRules : [];

  if (ask) {
    // Ownership WITHOUT takeover: setup records only the rules it actually INSERTED. An EMPTY
    // ownedAskRules is a legitimate installation - setup may have found every desired rule already
    // present, and a rule it did not insert never becomes owned. So an empty list is an unexercised
    // branch, not a defect. The real assertion is: whatever IS owned must still be there, because a
    // rule the operator removed belongs in suppressedAskRules instead.
    if (owned.length === 0) {
      addNote('owned-subset', 'every owned ask rule is present in settings.json',
        'ownedAskRules is empty - a valid state (setup inserted nothing), so nothing is verified here');
    } else {
      const missing = owned.filter((r) => !ask.includes(r));
      add('owned-subset', 'every owned ask rule is present in settings.json (owned subset of actual)',
        missing.length === 0, missing.length ? `missing ${JSON.stringify(missing)}` : `${owned.length} owned rules`);
    }
    // A tombstone is a rule the operator removed on purpose; it must not be forced back. No
    // tombstones is the normal state of a healthy install, not a defect.
    if (suppressed.length === 0) {
      addNote('suppressed-absent', 'no suppressed (tombstoned) rule was forced back into settings.json',
        'suppressedAskRules is empty - the normal state; the tombstone branch is not exercised here');
    } else {
      const returned = suppressed.filter((r) => ask.includes(r));
      add('suppressed-absent', 'no suppressed (tombstoned) rule was forced back into settings.json',
        returned.length === 0, returned.length ? `returned ${JSON.stringify(returned)}` : `${suppressed.length} tombstone(s)`);
    }
    const both = owned.filter((r) => suppressed.includes(r));
    add('owned-suppressed-disjoint', 'ownedAskRules and suppressedAskRules are disjoint',
      both.length === 0, both.length ? JSON.stringify(both) : `${owned.length} owned / ${suppressed.length} suppressed`);
    add('ask-no-duplicates', 'no duplicate rules in the ask list', new Set(ask).size === ask.length);
    // The rendered ruleset must contain no unsubstituted placeholder - checked against the ACTUAL
    // rules in settings.json, which is the artifact that would be broken, not against a string
    // this function just produced itself.
    const stillTemplated = ask.filter((r) => r.includes('<projectRoot>'));
    add('ask-no-placeholder', 'no ask rule in settings.json still carries the literal <projectRoot>',
      stillTemplated.length === 0, stillTemplated.length ? JSON.stringify(stillTemplated) : `${ask.length} rules rendered`);

    // Owned rules must be members of the payload's desired set (rendered for this project root):
    // this is what proves they came from the shipped ruleset rather than being invented locally.
    const tmpl = readJson(path.join(pluginRoot, 'templates', 'settings.ask-ruleset.json'));
    const desired = (tmpl && tmpl.permissions && Array.isArray(tmpl.permissions.ask)) ? tmpl.permissions.ask : null;
    if (!desired) {
      add('owned-from-payload', 'templates/settings.ask-ruleset.json exists and declares permissions.ask', false);
    } else if (owned.length === 0) {
      addNote('owned-from-payload', 'every owned ask rule comes from the payload ruleset',
        'ownedAskRules is empty - nothing to trace back to the template');
    } else {
      const rendered = new Set(desired.map((r) => r.split('<projectRoot>').join(projectRoot)));
      const foreign = owned.filter((r) => !rendered.has(r));
      add('owned-from-payload', 'every owned ask rule comes from the payload ruleset (none invented locally)',
        foreign.length === 0, foreign.length ? JSON.stringify(foreign) : `${desired.length} rules in the template`);
    }
    if (allow && deny) {
      // The ruleset template applies allow/deny ONLY to a project that had no permissions block of
      // its own, and nothing in the bookkeeping records which case this install was. A divergence
      // is therefore a legitimate project posture, not a defect: report it, never fail on it.
      const tmplAllow = (tmpl && tmpl.permissions && tmpl.permissions.allow) || null;
      const tmplDeny = (tmpl && tmpl.permissions && tmpl.permissions.deny) || null;
      const matches = !!tmplAllow && !!tmplDeny
        && JSON.stringify(allow) === JSON.stringify(tmplAllow)
        && JSON.stringify(deny) === JSON.stringify(tmplDeny);
      if (matches) {
        add('factory-posture', 'allow/deny match the payload factory posture (open allow, empty deny)',
          true, `allow=${JSON.stringify(allow)} deny=${JSON.stringify(deny)}`);
      } else {
        addNote('factory-posture', 'allow/deny match the payload factory posture',
          `the project runs its own posture (allow=${JSON.stringify(allow)} deny=${JSON.stringify(deny)}); setup only applies the factory posture to a project that had no permissions block, and the bookkeeping does not record which case this was`);
      }
    } else {
      // Neither list is declared. Same contract as a divergent posture: setup left an existing
      // permissions block exactly as it found it, so there is nothing to compare and nothing wrong.
      addNote('factory-posture', 'allow/deny match the payload factory posture',
        `the project declares no allow/deny of its own (allow=${allow ? 'list' : 'absent'}, deny=${deny ? 'list' : 'absent'}); setup adds the factory posture only to a project with no permissions block at all, so an ask-only block is a posture it deliberately preserved`);
    }
  }

  // --- rendered artifacts agree with the canonical source (aiwf.config.json.roles.*) ------------
  const roles = readJson(path.join(projectRoot, '.claude', 'aiwf-native', 'roles.json'));
  add('roles-parses', 'roles.json exists and parses', roles != null);
  const TIERS = ['fable', 'opus', 'sonnet', 'haiku'];
  if (roles && cfg.roles) {
    for (const role of ['reviewer', 'qa', 'qal']) {
      const c = cfg.roles[role] || {};
      const r = roles[role] || {};
      add(`roles-match-${role}`,
        `roles.json ${role} matches config.roles.${role} (rendered artifact, not a second source)`,
        c.engine === r.engine && c.model === r.model && c.effort === r.effort,
        `config=${c.engine}/${c.model}/${c.effort} roles.json=${r.engine}/${r.model}/${r.effort}`);
    }
    const qc = cfg.roles.qal || {};
    const qr = roles.qal || {};
    add('qal-enabled-mirrored', 'roles.json qal carries the enabled gate from config',
      qc.enabled === qr.enabled, `config=${qc.enabled} roles.json=${qr.enabled}`);
    for (const role of ['reviewer', 'qa']) {
      const c = cfg.roles[role] || {};
      if (c.engine === 'claude') {
        // A claude-hosted role is dispatched through the Agent tool's `model` override, whose enum
        // is the tier aliases only - a full model id there fails at dispatch time.
        add(`tier-alias-${role}`, `claude-hosted ${role} model is a tier alias (Agent tool enum)`,
          TIERS.includes(c.model), `model=${c.model}`);
      } else {
        addNote(`tier-alias-${role}`, `claude-hosted ${role} model is a tier alias`,
          `the ${role} role is ${c.engine}-hosted, so its model is a free engine atom and the tier enum does not apply`);
      }
    }
  }

  const agentPath = (file) => path.join(projectRoot, '.claude', 'agents', file);
  const frontmatter = (agentFile, field) => {
    const src = readText(agentPath(agentFile));
    if (src == null) return null;
    const m = new RegExp('^' + field + ':\\s*(\\S+)\\s*$', 'm').exec(src);
    return m ? m[1] : null;
  };
  // CONDITIONAL RENDER (the agent templates' own contract): a Claude agent file exists for a role
  // if and only if that role is claude-hosted. A file left behind next to a codex-hosted role is a
  // STALE RENDER - it will be read by anyone debugging the loop and it disagrees with the host that
  // actually runs. The Agent tool also has no per-invocation `effort`, so a claude-hosted role's
  // effort/model live in that frontmatter and MUST equal the configured values; a codex-hosted role
  // carries both as wrapper flags instead, so there is nothing to compare.
  for (const [role, file] of [['reviewer', 'reviewer.md'], ['qa', 'qa.md']]) {
    const c = (cfg.roles && cfg.roles[role]) || {};
    const exists = fs.existsSync(agentPath(file));
    if (c.engine === 'claude') {
      add(`agent-present-${role}`, `.claude/agents/${file} exists (the ${role} role is claude-hosted)`,
        exists, exists ? '' : 'missing - the claude host has no agent definition to dispatch');
      add(`agent-effort-${role}`, `${file} frontmatter effort equals the configured ${role} effort`,
        c.effort != null && c.effort === frontmatter(file, 'effort'),
        `config=${c.effort} frontmatter=${frontmatter(file, 'effort')}`);
      add(`agent-model-${role}`, `${file} frontmatter model equals the configured ${role} model`,
        c.model != null && c.model === frontmatter(file, 'model'),
        `config=${c.model} frontmatter=${frontmatter(file, 'model')}`);
    } else {
      add(`agent-present-${role}`,
        `.claude/agents/${file} is ABSENT (the ${role} role is ${c.engine}-hosted, so a rendered Claude agent would be a stale render)`,
        !exists, exists ? 'the file exists but the role is not claude-hosted' : '');
      addNote(`agent-effort-${role}`, `${file} frontmatter effort equals the configured ${role} effort`,
        `the ${role} role is ${c.engine}-hosted; its effort travels as a wrapper flag and there is no frontmatter to compare`);
      addNote(`agent-model-${role}`, `${file} frontmatter model equals the configured ${role} model`,
        `the ${role} role is ${c.engine}-hosted; its model is passed as a wrapper argv atom`);
    }
  }
  const w = (cfg.roles && cfg.roles.writer) || {};
  add('writer-model', 'writer.md frontmatter model equals config.roles.writer.model',
    w.model != null && w.model === frontmatter('writer.md', 'model'), `frontmatter=${frontmatter('writer.md', 'model')}`);
  add('writer-effort', 'writer.md frontmatter effort equals config.roles.writer.effort',
    w.effort != null && w.effort === frontmatter('writer.md', 'effort'), `frontmatter=${frontmatter('writer.md', 'effort')}`);

  // --- managed artifacts: the bookkeeping against what is really on disk -------------------------
  // The hashes are the whole basis of "no silent overwrite": the next /pnp:update decides what to
  // re-render, what to leave alone and what to call a conflict by comparing them. A stamp that does
  // not describe the file it names turns that decision into a coin toss - silently, and in the
  // direction of overwriting the operator's own work.
  const regions = isPlainObject(bk.managedRegions) ? bk.managedRegions : null;
  add('managed-regions-shape', '_aiwf.managedRegions is an object of managed-artifact records',
    regions != null, regions ? `${Object.keys(regions).length} entries` : `found ${Array.isArray(bk.managedRegions) ? 'an array' : typeof bk.managedRegions}`);
  if (regions) {
    const problems = [];
    for (const key of Object.keys(regions)) {
      const entry = regions[key];
      if (!isPlainObject(entry) || typeof entry.local !== 'string') { problems.push(`${key}: no local hash recorded`); continue; }
      const hash = managedHash(projectRoot, key);
      if (hash === null) {
        problems.push(key.includes('#')
          ? `${key}: the file is missing, or it no longer carries those markers`
          : `${key}: the recorded artifact is missing from the project`);
        continue;
      }
      // `local` is what was last ACCEPTED, so it must match the file even when the operator holds
      // the artifact through an override - that is precisely what override records. Only `upstream`
      // is expected to diverge there, and it is deliberately not compared.
      if (hash !== entry.local) {
        problems.push(`${key}: local ${entry.local.slice(0, 12)}... but the content hashes ${hash.slice(0, 12)}...` +
          (entry.override === true ? ' (override is set, which still requires local to describe the accepted content)' : ''));
      }
    }
    add('managed-regions-match', 'every managed artifact still hashes to its recorded local hash',
      problems.length === 0, problems.length ? problems.slice(0, 4).join('; ') : `${Object.keys(regions).length} artifacts verified`);

    // The set itself must be right: an artifact with no entry is unmanaged (an update would refuse
    // to touch it), and an entry with no artifact is a stamp for something that is not there.
    const expected = new Set(['CLAUDE.md#aiwf-core', '.claude/aiwf-native/roles.json', '.claude/agents/writer.md']);
    for (const role of ['reviewer', 'qa']) {
      if (cfg.roles && cfg.roles[role] && cfg.roles[role].engine === 'claude') expected.add(`.claude/agents/${role}.md`);
    }
    const actualKeys = new Set(Object.keys(regions));
    const missing = [...expected].filter((k) => !actualKeys.has(k));
    const extra = [...actualKeys].filter((k) => !expected.has(k));
    add('managed-regions-cover', 'managedRegions covers exactly the artifacts this config implies',
      missing.length === 0 && extra.length === 0,
      (missing.length ? `missing ${JSON.stringify(missing)} ` : '') + (extra.length ? `unexpected ${JSON.stringify(extra)}` : '')
        || `${expected.size} artifacts`);
  }

  // --- version bookkeeping ----------------------------------------------------------------------
  const pluginJson = readJson(path.join(pluginRoot, '.claude-plugin', 'plugin.json'));
  const pluginVersion = pluginJson && pluginJson.version;
  if (selfAuthored) {
    addNote('version-stamp', 'installedPluginVersion equals the payload version',
      'this run stamped the fixture from the payload, so the comparison would confirm itself');
  } else {
    add('version-stamp', 'installedPluginVersion equals the payload version (no unapplied migrations)',
      pluginVersion != null && bk.installedPluginVersion === pluginVersion,
      `installed=${bk.installedPluginVersion} payload=${pluginVersion}`);
  }
  add('last-migration', '_aiwf records a lastMigrationApplied',
    typeof bk.lastMigrationApplied === 'string' && bk.lastMigrationApplied.length > 0);
  add('journal-clear', '_aiwf.migrationJournal is clear (no interrupted migration)',
    bk.migrationJournal == null, `journal=${JSON.stringify(bk.migrationJournal)}`);

  // --- declared paths exist ---------------------------------------------------------------------
  const paths = cfg.paths || {};
  add('path-overrides', 'paths.overridesDoc exists in the project',
    typeof paths.overridesDoc === 'string' && fs.existsSync(path.join(projectRoot, paths.overridesDoc)), String(paths.overridesDoc));
  add('path-scratch', 'paths.scratchDir exists in the project',
    typeof paths.scratchDir === 'string' && fs.existsSync(path.join(projectRoot, paths.scratchDir)), String(paths.scratchDir));
  add('path-plans', 'paths.plansDir exists in the project',
    typeof paths.plansDir === 'string' && fs.existsSync(path.join(projectRoot, paths.plansDir)), String(paths.plansDir));
  // plansDir is the PARENT of active/ and archive/: a plan ENTERS the repo into active/ and LEAVES
  // into archive/ when every ticket is closed. A plansDir with no active/ means every consumer that
  // globs `<plansDir>/active/PLAN_*.md` silently finds nothing.
  add('plans-active-subdir', 'paths.plansDir contains the active/ subdirectory (plansDir is the parent of active/ and archive/)',
    typeof paths.plansDir === 'string' && fs.existsSync(path.join(projectRoot, paths.plansDir, 'active')),
    `${paths.plansDir}/active`);
  // The route-state guard resolves `.aiwf/route-state.json` literally, so a project that moves its
  // scratch directory elsewhere would arm a guard nobody writes to.
  add('scratch-is-aiwf', 'paths.scratchDir is ".aiwf" (the route-state guard resolves that path literally in v0.1)',
    paths.scratchDir === '.aiwf', String(paths.scratchDir));

  // --- the config satisfies the shipped schema --------------------------------------------------
  // Run at the validator's real CLI entrypoint (the same one setup uses), against the payload schema
  // - so an installation cannot carry a config shape the generator would refuse to produce.
  {
    const r = spawnSync(process.execPath, [
      path.join(pluginRoot, 'scripts', 'setup', 'validate-config.mjs'), cfgPath,
      '--schema', path.join(pluginRoot, 'schema', 'aiwf.config.schema.json'),
    ], { encoding: 'utf8' });
    add('config-schema-valid', 'aiwf.config.json satisfies schema/aiwf.config.schema.json',
      r.status === 0, r.status === 0 ? '' : `validator exit ${r.status}: ${(r.stderr || '').trim().split('\n').slice(0, 3).join(' | ').slice(0, 200)}`);
  }

  return out;
}

function sectionProjectLayer(projectRoot, selfAuthored) {
  section(`PROJECT LAYER - ownership, rendered artifacts, bookkeeping${selfAuthored ? '  [fixture: authored by this run]' : ''}`);
  const findings = projectLayerFindings(projectRoot, PLUGIN_ROOT, { selfAuthored });
  for (const f of findings) {
    if (f.note) { note(f.name, f.detail); continue; }
    check(`${f.name}${selfAuthored ? ' [fixture]' : ''}`, f.ok, f.detail);
  }
  return findings;
}

// ---------------------------------------------------------------------------
// SECTION - payload integrity (skills, cross-references, command prefix)
// ---------------------------------------------------------------------------
function listFiles(dir, filter, acc) {
  acc = acc || [];
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return acc; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, filter, acc);
    else if (filter(p)) acc.push(p);
  }
  return acc;
}

function sectionPayloadIntegrity() {
  section('PAYLOAD INTEGRITY - skills, cross-references, command prefix');
  const skillsDir = path.join(PLUGIN_ROOT, 'skills');
  const skillDirs = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  check('skills/ contains at least one skill directory', skillDirs.length > 0, `${skillDirs.length} skills`);
  for (const name of skillDirs) {
    const file = path.join(skillsDir, name, 'SKILL.md');
    const src = readText(file);
    if (!check(`skills/${name}/SKILL.md exists`, src != null)) continue;
    const nameLine = /^name:\s*(\S+)\s*$/m.exec(src);
    check(`skills/${name}: explicit "name:" frontmatter matching the directory`,
      !!nameLine && nameLine[1] === name, nameLine ? `name: ${nameLine[1]}` : 'no name: field');
    check(`skills/${name}: has a description: frontmatter`, /^description:\s*\S/m.test(src));
    // Every skill must resolve the project itself before touching anything (the Step 0 contract).
    check(`skills/${name}: carries the Step 0 project-context contract`,
      /Step 0/.test(src) && /git rev-parse --show-toplevel/.test(src) && /aiwf\.config\.json/.test(src) && /\/pnp:setup/.test(src));
  }

  // Cross-reference integrity: every payload doc / wrapper / template a payload file names must exist.
  const payloadFiles = []
    .concat(listFiles(skillsDir, (p) => p.endsWith('.md')))
    .concat(listFiles(path.join(PLUGIN_ROOT, 'docs'), (p) => p.endsWith('.md')))
    .concat(listFiles(path.join(PLUGIN_ROOT, 'templates'), () => true));
  const REF = /(?:docs\/[A-Za-z0-9_.-]+\.md|schema\/[A-Za-z0-9_.-]+\.json|scripts\/native\/ps\/[A-Za-z0-9_.-]+\.ps1|scripts\/(?:engine|selfcheck|spike|setup)\/[A-Za-z0-9_.-]+\.(?:js|mjs)|templates\/[A-Za-z0-9_./-]+\.(?:tmpl|json))/g;
  const dangling = [];
  let refCount = 0;
  for (const f of payloadFiles) {
    const src = readText(f) || '';
    const seen = new Set(src.match(REF) || []);
    for (const ref of seen) {
      refCount += 1;
      if (!fs.existsSync(path.join(PLUGIN_ROOT, ref))) dangling.push(`${path.relative(PLUGIN_ROOT, f)} -> ${ref}`);
    }
  }
  check('every payload path referenced from a skill/doc/template exists',
    dangling.length === 0, dangling.length ? dangling.slice(0, 6).join('; ') : `${refCount} references resolved across ${payloadFiles.length} files`);

  // Command prefix: the payload speaks /pnp:, never the originating project's prefix.
  const KNOWN_FUTURE = ['setup', 'update', 'selfcheck'];
  const badPrefix = [];
  const unknownCommands = [];
  for (const f of payloadFiles) {
    const src = readText(f) || '';
    if (/\/aiwf:/.test(src)) badPrefix.push(path.relative(PLUGIN_ROOT, f));
    for (const m of src.match(/\/pnp:[a-z-]+/g) || []) {
      const cmd = m.slice(5);
      if (!skillDirs.includes(cmd) && !KNOWN_FUTURE.includes(cmd)) unknownCommands.push(`${path.relative(PLUGIN_ROOT, f)} -> ${m}`);
    }
  }
  check('no payload file uses a foreign command prefix', badPrefix.length === 0, badPrefix.join('; '));
  check('every /pnp:<cmd> reference names a shipped or planned skill',
    unknownCommands.length === 0, unknownCommands.slice(0, 6).join('; '));
}

// ---------------------------------------------------------------------------
// NEGATIVE CONTROLS - the project-layer checks must be able to fail
// ---------------------------------------------------------------------------
function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyTree(s, d); else fs.copyFileSync(s, d);
  }
}

// Each control names the check `id` it must break. Ids never embed a configured value, so a control
// cannot silently stop targeting anything when a fixture value changes - the "targets a real check"
// assertion below fails loudly instead.
const NEGATIVE_CONTROLS = [
  { id: 'config-parses', label: 'aiwf.config.json corrupted',
    apply: (r) => fs.writeFileSync(path.join(r, '.claude', 'aiwf-native', 'aiwf.config.json'), '{ not json ') },
  { id: 'settings-parses', label: 'settings.json permissions block removed',
    apply: (r) => fs.writeFileSync(path.join(r, '.claude', 'settings.json'), JSON.stringify({ hooks: {} })) },
  { id: 'roles-parses', label: 'roles.json corrupted',
    apply: (r) => fs.writeFileSync(path.join(r, '.claude', 'aiwf-native', 'roles.json'), '{ not json ') },
  { id: 'owned-subset', label: 'an owned ask rule removed from settings.json',
    apply: (r) => mutateJson(r, ['.claude', 'settings.json'], (s) => { s.permissions.ask = s.permissions.ask.filter((x) => x !== FIXTURE_OWNED[0]); }) },
  { id: 'suppressed-absent', label: 'a tombstoned rule forced back into settings.json',
    apply: (r) => mutateJson(r, ['.claude', 'settings.json'], (s) => { s.permissions.ask.push(FIXTURE_SUPPRESSED[0]); }) },
  { id: 'owned-suppressed-disjoint', label: 'a rule listed as both owned and suppressed',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c._aiwf.suppressedAskRules.push(FIXTURE_OWNED[0]); }) },
  { id: 'ask-no-duplicates', label: 'a duplicated rule in the ask list',
    apply: (r) => mutateJson(r, ['.claude', 'settings.json'], (s) => { s.permissions.ask.push(s.permissions.ask[0]); }) },
  { id: 'ask-no-placeholder', label: 'an unrendered <projectRoot> placeholder left in settings.json',
    apply: (r) => mutateJson(r, ['.claude', 'settings.json'], (s) => { s.permissions.ask.push('Bash(git -C <projectRoot> push:*)'); }) },
  { id: 'owned-from-payload', label: 'a locally invented rule recorded as owned',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c._aiwf.ownedAskRules.push('Bash(totally-invented:*)'); }) },
  { id: 'roles-match-reviewer', label: 'roles.json reviewer drifted from the config',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'roles.json'], (j) => { j.reviewer.model = 'haiku'; }) },
  { id: 'roles-match-qa', label: 'roles.json qa engine drifted from the config',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'roles.json'], (j) => { j.qa.engine = 'claude'; }) },
  { id: 'roles-match-qal', label: 'roles.json qal effort drifted from the config',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'roles.json'], (j) => { j.qal.effort = 'low'; }) },
  { id: 'qal-enabled-mirrored', label: 'the qal enabled gate flipped only in roles.json',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'roles.json'], (j) => { j.qal.enabled = false; }) },
  { id: 'tier-alias-reviewer', label: 'a claude-hosted role pinned to a full model id',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c.roles.reviewer.model = 'claude-opus-5[1m]'; }) },
  { id: 'agent-effort-reviewer', label: 'an agent frontmatter effort drifted from the config',
    apply: (r) => patchText(r, ['.claude', 'agents', 'reviewer.md'], /^effort: .*$/m, 'effort: low') },
  { id: 'agent-model-reviewer', label: 'an agent frontmatter model drifted from the config',
    apply: (r) => patchText(r, ['.claude', 'agents', 'reviewer.md'], /^model: .*$/m, 'model: haiku') },
  { id: 'agent-present-reviewer', label: 'the claude-hosted role has no agent file',
    apply: (r) => fs.rmSync(path.join(r, '.claude', 'agents', 'reviewer.md')) },
  { id: 'agent-present-qa', label: 'a STALE Claude agent file left next to a codex-hosted role',
    apply: (r) => fs.writeFileSync(path.join(r, '.claude', 'agents', 'qa.md'), '---\nname: qa\nmodel: opus\neffort: high\n---\nstale render\n') },
  { id: 'writer-model', label: 'the writer frontmatter model drifted from the config',
    apply: (r) => patchText(r, ['.claude', 'agents', 'writer.md'], /^model: .*$/m, 'model: sonnet') },
  { id: 'writer-effort', label: 'the writer frontmatter effort drifted from the config',
    apply: (r) => patchText(r, ['.claude', 'agents', 'writer.md'], /^effort: .*$/m, 'effort: low') },
  { id: 'last-migration', label: 'the lastMigrationApplied stamp blanked',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c._aiwf.lastMigrationApplied = ''; }) },
  { id: 'journal-clear', label: 'an interrupted migration journal left in the bookkeeping',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c._aiwf.migrationJournal = { migration: '0002_x', opIndex: 0, state: 'prepared' }; }) },
  { id: 'path-overrides', label: 'the configured overrides document is missing',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c.paths.overridesDoc = 'docs/ai/GONE.md'; }) },
  { id: 'path-scratch', label: 'the configured scratch directory is missing',
    apply: (r) => fs.rmSync(path.join(r, '.aiwf'), { recursive: true, force: true }) },
  { id: 'path-plans', label: 'the configured plans directory is missing',
    apply: (r) => fs.rmSync(path.join(r, 'docs', 'backlogs'), { recursive: true, force: true }) },
  { id: 'plans-active-subdir', label: 'plansDir has no active/ subdirectory',
    apply: (r) => fs.rmSync(path.join(r, 'docs', 'backlogs', 'active'), { recursive: true, force: true }) },
  { id: 'scratch-is-aiwf', label: 'scratchDir moved away from .aiwf (the route guard would be unarmed)',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c.paths.scratchDir = '.scratch'; }) },
  { id: 'managed-regions-shape', label: 'managedRegions replaced by something that is not an object',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c._aiwf.managedRegions = 'nope'; }) },
  { id: 'managed-regions-match', label: 'a managed file drifted from its recorded hash (roles.json edited)',
    apply: (r) => patchText(r, ['.claude', 'aiwf-native', 'roles.json'], /"effort": "high"/, '"effort": "low"') },
  { id: 'managed-regions-match', label: 'a managed REGION drifted (CLAUDE.md edited between the markers)',
    apply: (r) => patchText(r, ['CLAUDE.md'], /Managed region body \(fixture\)\./, 'I edited the managed region.') },
  { id: 'managed-regions-match', label: 'a recorded local hash that describes nothing on disk',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => {
      c._aiwf.managedRegions['.claude/aiwf-native/roles.json'].local = '0'.repeat(64);
    }) },
  { id: 'managed-regions-cover', label: 'a surplus managedRegions entry for a file that does not exist',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => {
      c._aiwf.managedRegions['.claude/agents/ghost.md'] = { upstream: '0'.repeat(64), local: '0'.repeat(64), override: false };
    }) },
  { id: 'managed-regions-cover', label: 'a managed artifact with no bookkeeping entry at all',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => {
      delete c._aiwf.managedRegions['.claude/agents/writer.md'];
    }) },
  { id: 'config-schema-valid', label: 'a config that violates the schema (an OS channel that does not exist)',
    apply: (r) => mutateJson(r, ['.claude', 'aiwf-native', 'aiwf.config.json'], (c) => { c.os = 'solaris'; }) },
];

// Checks with no control, and the honest reason. Printed in the summary so the gap is visible
// rather than implied by absence.
const NO_CONTROL_REASON = {
  'factory-posture': 'informational by contract: setup applies the factory allow/deny only to a project that had no permissions block, and no bookkeeping key records which case an install was - so a divergence is reported, never failed, and there is nothing to sabotage into a failure',
  'version-stamp': 'skipped on a self-authored fixture (the run stamps it from the payload); it is exercised only against a real installation, where a version bump without migrations makes it fail',
};

function mutateJson(root, relParts, fn) {
  const p = path.join(root, ...relParts);
  const j = readJson(p);
  fn(j);
  fs.writeFileSync(p, JSON.stringify(j, null, 2));
}
function patchText(root, relParts, re, replacement) {
  const p = path.join(root, ...relParts);
  fs.writeFileSync(p, readText(p).replace(re, replacement));
}

// The controls ALWAYS run against a fixture this function synthesised itself, never against the
// project passed with --project-fixture. Two reasons: a real installation must not be copied and
// mutated to satisfy fixture-specific expectations, and a control whose expected failure depends on
// someone else's configuration proves nothing about the checker.
function sectionNegativeControls(tmpRoot, pluginVersion) {
  section('NEGATIVE CONTROLS - each project-layer check is proven able to FAIL (own synthetic fixture)');
  const base = path.join(tmpRoot, 'neg-base');
  fs.mkdirSync(base, { recursive: true });
  writeFixture(base, pluginVersion);

  const pristine = projectLayerFindings(base, PLUGIN_ROOT, { selfAuthored: true });
  const pristineFailures = pristine.filter((f) => !f.note && !f.ok);
  check('the control fixture is clean before any sabotage', pristineFailures.length === 0,
    pristineFailures.length ? pristineFailures.map((f) => f.id).join(', ') : `${pristine.filter((f) => !f.note).length} checks green`);

  let i = 0;
  const covered = new Set();
  for (const m of NEGATIVE_CONTROLS) {
    const broken = path.join(tmpRoot, 'neg-' + (i += 1));
    copyTree(base, broken);
    try { m.apply(broken); } catch (e) { check(`control could be applied: ${m.label}`, false, String(e.message)); continue; }
    const findings = projectLayerFindings(broken, PLUGIN_ROOT, { selfAuthored: true });
    const target = findings.find((f) => f.id === m.id);
    if (!target) {
      check(`control "${m.label}" targets a live check (id "${m.id}")`, false, 'no check with that id was produced');
      continue;
    }
    covered.add(m.id);
    check(`sabotage detected [${m.id}]: ${m.label}`, target.ok === false && target.note !== true,
      target.note ? 'the check degraded to a NOTE instead of failing' : (target.ok ? 'still PASS - the check is vacuous' : 'FAIL as required'));
  }

  // Honest coverage: which real checks have no control, and why.
  const uncontrolled = pristine.filter((f) => !f.note && !covered.has(f.id)).map((f) => f.id);
  for (const id of uncontrolled) {
    note(`no negative control for project-layer check "${id}"`,
      NO_CONTROL_REASON[id] || 'no control defined - add one or state why it cannot fail');
  }
  const unexercised = pristine.filter((f) => f.note).map((f) => f.id);
  if (unexercised.length) {
    console.log(`  (checks that were NOTEs on the control fixture, so no control applies: ${unexercised.join(', ')})`);
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
  const pluginJson = readJson(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'));
  const pluginVersion = (pluginJson && pluginJson.version) || '0.0.0';

  let fixtureArg = argValue('--project-fixture');
  let temporary = false;
  let selfAuthored = false;
  if (!fixtureArg) {
    fixtureArg = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-selfcheck-project-'));
    temporary = true;
  }
  const PROJECT = path.resolve(fixtureArg);
  if (!fs.existsSync(PROJECT) || isEmptyDir(PROJECT)) {
    fs.mkdirSync(PROJECT, { recursive: true });
    writeFixture(PROJECT, pluginVersion);
    selfAuthored = true;
  }

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-selfcheck-'));

  console.log('PromptAndPray self-check');
  console.log(`plugin root     : ${PLUGIN_ROOT} (version ${pluginVersion})`);
  console.log(`project layer   : ${PROJECT}${selfAuthored ? '  [synthetic fixture written by this run]' : '  [existing installation]'}`);
  console.log(`powershell host : ${PWSH || '(none found)'}`);
  console.log(`scratch         : ${tmpRoot}`);
  if (selfAuthored) {
    console.log('NOTE: the project layer was authored by this run, so its checks prove the CHECKER works,');
    console.log('      not that a real installation is healthy. The NEGATIVE CONTROLS section below then');
    console.log('      breaks a copy of it and requires every one of those checks to actually fail.');
  }

  try {
    sectionGate1Identity(tmpRoot);
    sectionGate2(tmpRoot);
    sectionGate3(tmpRoot);
    sectionGate3Toggle(tmpRoot);
    sectionConfigSchema(tmpRoot);
    sectionHookWiring();
    sectionWrappers();
    sectionResolver(tmpRoot);
    sectionPayloadIntegrity();
    sectionProjectLayer(PROJECT, selfAuthored);
    sectionNegativeControls(tmpRoot, pluginVersion);
  } finally {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (e) { /* best-effort */ }
    if (temporary && !KEEP_FIXTURE) { try { fs.rmSync(PROJECT, { recursive: true, force: true }); } catch (e) { /* best-effort */ } }
  }

  const failed = results.filter((r) => !r.ok);
  console.log('\n---- COVERAGE (honest) ----');
  console.log('EXECUTED: both enforcement hooks, run as the harness runs them (identity matrix, the two');
  console.log('captured live payloads, the dispatch gate\'s ask/passthrough matrix, and the route-state');
  console.log('guard across R2/R3/unusable/cleared/absent state, and its enforcement.routeWriteGuard toggle,');
  console.log('whose every failure mode leaves the guard ARMED) - the role resolver at its real entrypoint,');
  console.log('including the claude factory fallback and the qal enabled gate - and the config validator at');
  console.log('its own CLI entrypoint, in both directions (a healthy config is accepted, the mistakes the');
  console.log('interview can produce are rejected), with its own controls for a broken schema and a');
  console.log('validator stripped of its assertions.');
  console.log('STATIC: the wrapper flag locks, asserted as exact ARGV PAIRS rather than bare words (so a');
  console.log('flag switched in the argv while the old word survives in a comment still fails), the hook');
  console.log('wiring, the ASCII-only wrapper sources, and the payload cross-references.');
  console.log('PROJECT LAYER: owned/suppressed ask-rule bookkeeping, rendered artifacts agreeing with the');
  console.log('config, the conditional-render contract (a Claude agent file exists iff its role is');
  console.log('claude-hosted), and version bookkeeping - proven able to fail by the negative controls,');
  console.log('which run against a fixture this script synthesises for that purpose alone. Checks with no');
  console.log('control are named individually above, each with its reason.');
  console.log('NOT PROVEN, and not claimed: that the harness ENFORCES the declarative permission rules or');
  console.log('RENDERS the Yes/No dialog for an "ask" decision. Neither is reachable from Node; both rest');
  console.log('on the recorded live observations. Nor is the OS sandbox posture of the wrappers - that is');
  console.log('enforced by the operating system and the external engine, and only its flags are checked here.');
  if (notes.length) {
    console.log('\nNOT EXERCISED IN THIS RUN (deliberately not counted as passes):');
    for (const n of notes) console.log(`  - ${n.name}: ${n.why}`);
  }
  console.log(`\n==== ${results.length - failed.length}/${results.length} assertions passed ====`);
  if (failed.length) {
    console.log('FAILURES:');
    for (const f of failed) console.log(`  - [${f.section}] ${f.name}`);
  }
  process.exitCode = failed.length ? 1 : 0;
}

main();
