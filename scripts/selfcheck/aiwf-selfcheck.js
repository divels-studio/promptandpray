'use strict';
/*
 * PromptAndPray self-check engine.
 *
 * WHAT THIS IS
 *   A standalone regression that asserts two different things and never confuses them:
 *
 *     A. PAYLOAD INVARIANTS - properties of the plugin itself. The two enforcement hooks are
 *        EXECUTED as the harness launches them (`node <hook>` with a JSON PreToolUse payload on
 *        stdin, decision read from stdout), BOTH role resolvers are EXECUTED at their real
 *        entrypoints (`pwsh -NoProfile -File aiwf-roles.ps1 -Role <r> -RolesPath <p> -AsJson` and
 *        `bash aiwf-roles.sh --role <r> --roles-path <p> --as-json`) over the same fixture matrix,
 *        with the bash channel held to the PowerShell one fixture by fixture, and the Codex
 *        wrappers of both channels are checked STATICALLY for their locked flags. These assertions
 *        hold for every installation, because their subject is the payload.
 *
 *        The EXAMPLE FIXTURE section belongs to this class: examples/example-project/ is committed
 *        DATA the example cycle runs on, and data rots as silently as code - so the answers file is
 *        validated at the config validator's own entrypoint, the simulated version bump is held to
 *        the payload validator's own id/version rules, and the quickstart README, the cycle driver
 *        and the CI workflow are compared against each other in both directions.
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
// The RAW-BYTE companion, for facts that are about bytes rather than about text: a file whose
// content was rewritten in place is invisible to a hash that normalises line endings first.
const sha256Bytes = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
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
// bash host discovery (the other resolver channel is a .sh and must run for real too)
// ---------------------------------------------------------------------------
// Deliberately the SAME posture as the PowerShell host above, because the two channels carry the
// same contract: a host that cannot be found is not an exemption - the section below FAILS and says
// the contract is unproven in this run. On Windows the two Git-for-Windows locations are tried
// after PATH, which is where a bash lives on a machine that has git but no `bash` on PATH.
function findBash() {
  const candidates = ['bash'];
  const pf = [process.env['ProgramFiles'], process.env['ProgramW6432'], process.env['ProgramFiles(x86)']].filter(Boolean);
  for (const base of pf) {
    candidates.push(path.join(base, 'Git', 'bin', 'bash.exe'));
    candidates.push(path.join(base, 'Git', 'usr', 'bin', 'bash.exe'));
  }
  for (const exe of candidates) {
    const r = spawnSync(exe, ['-c', 'exit 0'], { encoding: 'utf8' });
    if (!r.error && r.status === 0) return exe;
  }
  return null;
}
const BASH = findBash();

const SH_RESOLVER = path.join(PLUGIN_ROOT, 'scripts', 'native', 'sh', 'aiwf-roles.sh');
function resolveRoleSh(role, rolesPath) {
  const args = [SH_RESOLVER, '--role', role, '--as-json'];
  if (rolesPath !== undefined && rolesPath !== null) args.push('--roles-path', rolesPath);
  const r = spawnSync(BASH, args, { encoding: 'utf8' });
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
// SECTION 3d - the migration payload and its validator
// ---------------------------------------------------------------------------
// The manifest is not decoration: setup STAMPS its last entry as `lastMigrationApplied` on a fresh
// install, and every /pnp:update walks it. A payload with a gap, a duplicate id, a non-monotonic
// version or an unknown op type would be discovered by the runner halfway through a sequence - so
// it is validated here, at the validator's REAL entrypoint, in both directions: the shipped payload
// is accepted, and each way of breaking it is rejected.
const PAYLOAD_VALIDATOR = path.join(PLUGIN_ROOT, 'scripts', 'update', 'validate-payload.mjs');

function runPayloadValidator(root) {
  const r = spawnSync(process.execPath, [PAYLOAD_VALIDATOR, '--plugin-root', root], { encoding: 'utf8' });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function sectionMigrationPayload(tmpRoot) {
  section('MIGRATION PAYLOAD - the manifest, the ops, and a validator that really rejects');
  const manifestFile = path.join(PLUGIN_ROOT, 'migrations', 'index.json');
  const manifest = readJson(manifestFile);
  if (!check('migrations/index.json exists and parses', Array.isArray(manifest), manifestFile)) return;
  check('the manifest is a non-empty ordered array', manifest.length > 0, `${manifest.length} entries`);
  // The FIRST entry is the id every v0.1 installation carries as lastMigrationApplied. Renaming it
  // would break the "lastMigrationApplied exists in the manifest" invariant for every one of them.
  check('the first entry is 0001_initial (the id every v0.1 install already carries)',
    manifest[0] && manifest[0].id === '0001_initial', manifest[0] ? String(manifest[0].id) : 'no first entry');
  const pluginVersion = (readJson(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json')) || {}).version;
  check('the LAST entry targets the payload version (no unapplied-migration/version disagreement)',
    manifest[manifest.length - 1] && manifest[manifest.length - 1].targetPluginVersion === pluginVersion,
    `${manifest[manifest.length - 1] && manifest[manifest.length - 1].targetPluginVersion} vs ${pluginVersion}`);
  check('scripts/update/validate-payload.mjs exists', fs.existsSync(PAYLOAD_VALIDATOR));
  {
    const r = runPayloadValidator(PLUGIN_ROOT);
    check('the shipped payload passes the validator at its real entrypoint (exit 0)', r.status === 0,
      r.status === 0 ? r.stdout : `exit ${r.status} - ${r.stderr.split('\n').slice(0, 3).join(' | ').slice(0, 200)}`);
  }
  // Every managed artifact `--resolve <key>` can reopen must still have a payload template. The
  // template paths themselves are proven to exist by the payload cross-reference check below.
  const migrateSrc = readText(path.join(PLUGIN_ROOT, 'scripts', 'update', 'migrate.mjs')) || '';
  check('migrate.mjs maps every resolvable managed artifact to a payload template',
    ['CLAUDE.md#aiwf-core', 'roles.json.tmpl', 'writer.md.tmpl', 'reviewer.md.tmpl', 'qa.md.tmpl']
      .every((needle) => migrateSrc.includes(needle)));

  // --- the controls: each way of breaking a payload must be REJECTED ------------------------
  const dir = path.join(tmpRoot, 'payload');
  fs.mkdirSync(dir, { recursive: true });
  const variant = (name, mutate) => {
    const root = path.join(dir, name);
    fs.mkdirSync(path.join(root, '.claude-plugin'), { recursive: true });
    fs.copyFileSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), path.join(root, '.claude-plugin', 'plugin.json'));
    copyTree(path.join(PLUGIN_ROOT, 'migrations'), path.join(root, 'migrations'));
    copyTree(path.join(PLUGIN_ROOT, 'templates'), path.join(root, 'templates'));
    mutate(root);
    return root;
  };
  const addMigration = (root, id, version, operations) => {
    const m = readJson(path.join(root, 'migrations', 'index.json'));
    m.push({ id, targetPluginVersion: version });
    fs.writeFileSync(path.join(root, 'migrations', 'index.json'), JSON.stringify(m, null, 2) + '\n');
    fs.mkdirSync(path.join(root, 'migrations', id), { recursive: true });
    fs.writeFileSync(path.join(root, 'migrations', id, 'ops.json'),
      JSON.stringify({ migration: id, targetPluginVersion: version, operations }, null, 2) + '\n');
    fs.writeFileSync(path.join(root, 'migrations', id, 'NOTES.md'), `# ${id}\n\ncontrol fixture\n`);
  };
  const setVersion = (root, version) => {
    const j = readJson(path.join(root, '.claude-plugin', 'plugin.json'));
    j.version = version;
    fs.writeFileSync(path.join(root, '.claude-plugin', 'plugin.json'), JSON.stringify(j, null, 2) + '\n');
  };
  const rejects = (name, root, fragment) => {
    const r = runPayloadValidator(root);
    check(`CONTROL: ${name} is REJECTED`, r.status === 1 && (!fragment || r.stderr.includes(fragment)),
      `exit ${r.status} - ${r.stderr.split('\n').slice(0, 3).join(' | ').slice(0, 180)}`);
  };

  // Every mutation below is expressed RELATIVE to the manifest it found, never against literal ids
  // or versions: this section also runs against a payload copy carrying extra migrations (the update
  // suite points it at one), and a control that only breaks a one-entry manifest would pass there by
  // accident - which is the definition of a vacuous control.
  const pad = (n) => String(n).padStart(4, '0');
  const bumpMinor = (v) => { const [a, b] = String(v).split('.').map(Number); return `${a}.${b + 1}.0`; };
  const count = manifest.length;
  const firstId = manifest[0].id;
  const writeOps = (root, id, operations) => {
    const entry = readJson(path.join(root, 'migrations', 'index.json')).find((e) => e.id === id);
    fs.writeFileSync(path.join(root, 'migrations', id, 'ops.json'),
      JSON.stringify({ migration: id, targetPluginVersion: entry.targetPluginVersion, operations }, null, 2) + '\n');
  };

  rejects('a gap in the numeric sequence', variant('gap', (root) => {
    addMigration(root, `${pad(count + 2)}_gap`, bumpMinor(pluginVersion), []);
    setVersion(root, bumpMinor(pluginVersion));
  }), 'position');
  rejects('a duplicate migration id', variant('dup', (root) => {
    const m = readJson(path.join(root, 'migrations', 'index.json'));
    m.push({ id: firstId, targetPluginVersion: bumpMinor(pluginVersion) });
    fs.writeFileSync(path.join(root, 'migrations', 'index.json'), JSON.stringify(m, null, 2) + '\n');
    setVersion(root, bumpMinor(pluginVersion));
  }), 'DUPLICATE');
  rejects('a non-monotonic version', variant('nonmono', (root) => {
    addMigration(root, `${pad(count + 1)}_back`, '0.0.0', []);
    setVersion(root, '0.0.0');
  }), 'strictly monotonic');
  rejects('a last entry that is not the payload version', variant('lastver', (root) => {
    addMigration(root, `${pad(count + 1)}_ahead`, bumpMinor(pluginVersion), []);
  }), 'LAST manifest entry');
  rejects('an orphan migration directory with no manifest entry', variant('orphan', (root) => {
    const id = `${pad(count + 5)}_orphan`;
    fs.mkdirSync(path.join(root, 'migrations', id), { recursive: true });
    fs.writeFileSync(path.join(root, 'migrations', id, 'ops.json'),
      JSON.stringify({ migration: id, targetPluginVersion: '9.9.9', operations: [] }, null, 2) + '\n');
    fs.writeFileSync(path.join(root, 'migrations', id, 'NOTES.md'), '# orphan\n');
  }), 'SILENTLY never run');
  rejects('an unknown op type', variant('unknownop', (root) => {
    writeOps(root, firstId, [{ op: 'delete-everything', file: 'x' }]);
  }), 'unknown op type');
  rejects('an unknown field on a known op', variant('unknownfield', (root) => {
    writeOps(root, firstId, [{ op: 'note', id: 'x', text: 'y', docRefs: [], sneaky: true }]);
  }), 'unknown field');
  rejects('a file path that escapes the project', variant('traversal', (root) => {
    writeOps(root, firstId, [{ op: 'rerender-managed-region', file: '../outside.md', region: null, template: 'templates/roles.json.tmpl' }]);
  }), 'traverse upwards');
  // The template FILE is there and the REGION is not: existence alone would let this through, and it
  // would then resolve to nothing halfway through a migration.
  rejects('a template reference naming a region the template does not carry', variant('badregion', (root) => {
    writeOps(root, firstId, [{ op: 'rerender-managed-region', file: 'CLAUDE.md', region: 'aiwf-core', template: 'templates/CLAUDE.md.tmpl#definitely-not-a-region' }]);
  }), 'names a region the template does not carry');
  rejects('a manifest version with a leading zero', variant('leadingzero', (root) => {
    const m = readJson(path.join(root, 'migrations', 'index.json'));
    m[m.length - 1].targetPluginVersion = `0${m[m.length - 1].targetPluginVersion}`;
    fs.writeFileSync(path.join(root, 'migrations', 'index.json'), JSON.stringify(m, null, 2) + '\n');
  }), 'plain MAJOR.MINOR.PATCH');
  // A payload version that cannot be ordered is a payload DEFECT (exit 1), not a run that could not
  // start (exit 2): the difference is what the operator is told to go and fix.
  rejects('a payload version that is not a plain triple', variant('badpayloadversion', (root) => {
    const j = readJson(path.join(root, '.claude-plugin', 'plugin.json'));
    j.version = `${j.version}-rc.1`;
    fs.writeFileSync(path.join(root, '.claude-plugin', 'plugin.json'), JSON.stringify(j, null, 2) + '\n');
  }), 'plugin.json declares version');
  rejects('a missing ops.json', variant('noops', (root) => {
    fs.rmSync(path.join(root, 'migrations', firstId, 'ops.json'));
  }), 'ops.json is missing');
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
// SECTION 5b - the bash wrapper channel (static source checks + their controls)
// ---------------------------------------------------------------------------
// The same contract as the PowerShell channel, asserted separately rather than through a shared
// abstraction: the two channels are different LANGUAGES, and a checker that folded them into one
// pattern would end up asserting the intersection of what both happen to look like. What is shared
// is the CONTRACT, and every clause of it appears here in bash form.
//
// The byte-level facts (LF-only, ASCII-only) are counted at byte level for the reason the workflow
// doctrine states out loud: a text-level `grep -c` for a carriage return once reported 0 on a file
// holding 283 of them.
//
// Unlike the PowerShell section above, every finding here carries a stable `id` and a negative
// control that must flip it. A static source check is exactly the kind that rots into a regex
// matching nothing, so the controls sabotage a throwaway copy of the channel one way per assertion
// and require the named check to FAIL.
function shWrapperFindings(root, { execProbes = true, tmpDir = null } = {}) {
  const out = [];
  const add = (id, name, ok, detail) => { out.push({ id, name, ok: !!ok, detail: detail || '' }); return !!ok; };
  const SH = path.join(root, 'scripts', 'native', 'sh');
  if (!add('sh-channel-present', 'scripts/native/sh/ exists (the bash channel ships)', fs.existsSync(SH))) return out;
  const src = (f) => readText(path.join(SH, f));
  const reviewSrc = src('codex-review.sh');
  const qaSrc = src('codex-qa.sh');
  const qalSrc = src('codex-qal.sh');
  const resolverSrc = src('aiwf-roles.sh');

  // Flags are checked against the `CODEX_ARGS=( ... )` array ONLY - the security comments in the
  // headers cite the forbidden flags by name, so checking the whole file would false-match those.
  // Close on the array's REAL terminator (a `)` at the start of a line).
  const argBlock = (s) => { const m = s ? /CODEX_ARGS=\(([\s\S]*?)[\r\n]+\)/.exec(s) : null; return m ? m[1] : ''; };
  // Every flag assertion is an EXACT ARGV PAIR, never a bare word: a bare-word check passes on the
  // word wherever it appears - including a stale comment inside the block - so a wrapper could be
  // switched to workspace-write while a leftover `# ... read-only ...` line kept the check green.
  const SANDBOX_PAIR = (value) => new RegExp(`--sandbox\\s+${value}(?![-\\w])`);
  const EFFORT_PAIR = /-c\s+"model_reasoning_effort=\$ROLE_EFFORT"/;
  const MODEL_PAIR = /-m\s+"\$ROLE_MODEL"/;
  // The FIRST real atom of the block, comments and blank lines skipped - `exec` opening the argv is
  // a position, not a presence, and a presence test would pass on `exec` sitting anywhere.
  const firstAtom = (block) => (block.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))[0] || '(empty)');
  const APPROVAL_PIN = /-c\s+approval_policy=never/;
  // Generalized negatives: the model must come from the resolver, and no wrapper may bake an
  // absolute filesystem path into the args it hands the engine. HARDCODED_MODEL is phrased as "any
  // -m whose value is not the resolved variable", so it catches a literal this file never saw.
  const HARDCODED_MODEL = /-m\s+(?!"\$ROLE_MODEL")\S/;
  const ABSOLUTE_PATH_LITERAL = /[A-Za-z]:[\\/]|\/(?:home|Users|mnt|opt|var)\//;
  const STDIN_PIPE = /printf\s+'%s\\n'\s+"\$PROMPT"\s*\|\s*codex\s+"\$\{CODEX_ARGS\[@\]\}"/;
  // The prompt reaches codex ONLY through that pipe. Any other argv shape - a further atom after
  // the arg array (the `||` status capture excepted), or a --prompt/-p flag parsed out of argv -
  // reopens the option-injection hole.
  const PROMPT_ON_ARGV = /codex\s+"\$\{CODEX_ARGS\[@\]\}"[ \t]+(?!\|\|)\S|--prompt\)|-p\)|PROMPT="\$2"/;
  const PROJECT_ROOT_REQUIRED = /\[\s*-n\s+"\$PROJECT_ROOT"\s*\]\s*\|\|\s*fail/;
  const PASSES_ROLES_PATH = /--roles-path\s+"\$ROLES_PATH"/;
  // The resolver snapshot -> shell variables transport. The delimiter must be NUL and the fields
  // must arrive through a redirect: the config schema admits ANY non-empty string for model/effort,
  // so a newline-delimited transport lets a value with a newline shift the fields and change the
  // argv. A shell variable cannot carry a NUL, which is why `<<< "$fields"` is forbidden here.
  const NUL_JOIN = /\.join\("\\u0000"\)\s*\+\s*"\\u0000"/;
  const NUL_READ = /IFS=\s+read\s+-r\s+-d\s+""\s+ROLE_/;
  const PROC_SUB = /<\s*<\(PNP_SNAPSHOT="\$snapshot"\s+node\s+-e\s+"\$FIELDS_JS"\)/;
  const VARIABLE_TRANSPORT = /<<<\s*"\$fields"/;

  // LF-only and ASCII-only, at BYTE level. `.gitattributes` marks *.sh eol=lf, but a checkout
  // setting or an editor can still write CRLF into the working tree, and a bash script with CRLF
  // line endings dies at the shebang with an unreadable error on a POSIX host.
  const files = fs.readdirSync(SH).filter((n) => n.endsWith('.sh')).sort();
  add('sh-channel-files', 'the bash channel ships exactly the four mirrored wrappers',
    files.join(',') === 'aiwf-roles.sh,codex-qa.sh,codex-qal.sh,codex-review.sh', files.join(', '));
  for (const f of files) {
    const buf = fs.readFileSync(path.join(SH, f));
    let cr = -1;
    let nonAscii = -1;
    for (let i = 0; i < buf.length; i++) {
      if (cr === -1 && buf[i] === 0x0d) cr = i;
      if (nonAscii === -1 && buf[i] > 0x7f) nonAscii = i;
    }
    add(`sh-lf-${f}`, `${f} is LF-only (no 0x0D byte anywhere)`, cr === -1,
      cr === -1 ? `${buf.length} bytes` : `carriage return at offset ${cr}`);
    add(`sh-ascii-${f}`, `${f} is ASCII-only`, nonAscii === -1,
      nonAscii === -1 ? `${buf.length} bytes` : `first non-ASCII byte 0x${buf[nonAscii].toString(16)} at offset ${nonAscii}`);
    const text = readText(path.join(SH, f)) || '';
    add(`sh-shebang-${f}`, `${f} declares the portable bash shebang on line 1`,
      text.split('\n')[0] === '#!/usr/bin/env bash', text.split('\n')[0]);
    add(`sh-strict-${f}`, `${f} sets the strict mode (set -euo pipefail)`, /^set -euo pipefail$/m.test(text));
  }

  for (const [name, short, s, role] of [['codex-review.sh', 'review', reviewSrc, 'reviewer'], ['codex-qa.sh', 'qa', qaSrc, 'qa']]) {
    if (!add(`sh-${short}-exists`, `${name} exists`, s != null)) continue;
    const args = argBlock(s);
    const id = (clause) => `sh-${short}-${clause}`;
    add(id('exec'), `${name} opens the argv with the 'exec' atom`, firstAtom(args) === 'exec', firstAtom(args));
    add(id('sandbox'), `${name} pins the --sandbox read-only argv PAIR (not the bare word)`, SANDBOX_PAIR('read-only').test(args));
    add(id('approval'), `${name} pins the -c approval_policy=never pair`, APPROVAL_PIN.test(args));
    add(id('no-danger'), `${name} argv contains NO danger-full-access atom`, !SANDBOX_PAIR('danger-full-access').test(args));
    add(id('no-bypass'), `${name} argv contains NO --dangerously-bypass atom`, !/--dangerously-bypass[a-z-]*/.test(args));
    add(id('no-ignore'), `${name} argv contains NO --ignore-user-config atom`, !/--ignore-user-config/.test(args));
    add(id('stdin'), `${name} delivers the prompt via stdin`, STDIN_PIPE.test(s));
    add(id('no-argv-prompt'), `${name} has NO prompt on argv and no prompt flag at all`, !PROMPT_ON_ARGV.test(s));
    add(id('empty-prompt'), `${name} exits 2 on an empty (or whitespace-only) prompt`,
      /tr -d '\[:space:\]'/.test(s) && /No prompt provided/.test(s));
    add(id('cwd'), `${name} takes -C from the caller's $PROJECT_ROOT, never a baked-in path`,
      /-C\s+"\$PROJECT_ROOT"/.test(args) && !ABSOLUTE_PATH_LITERAL.test(args));
    add(id('project-root'), `${name} requires --project-root`, PROJECT_ROOT_REQUIRED.test(s));
    add(id('resolver'), `${name} resolves the ${role} role through the resolver entrypoint with --roles-path`,
      /aiwf-roles\.sh/.test(s) && new RegExp(`--role\\s+${role}\\b`).test(s) && PASSES_ROLES_PATH.test(s));
    add(id('model'), `${name} passes the resolved model as the -m "$ROLE_MODEL" pair`, MODEL_PAIR.test(args));
    add(id('no-model-literal'), `${name} does NOT hardcode a model literal in -m`, !HARDCODED_MODEL.test(args));
    add(id('engine-mismatch'), `${name} exits 2 when the resolved engine is not codex`,
      /\[\s*"\$ROLE_ENGINE"\s*!=\s*'codex'\s*\]/.test(s));
    add(id('effort'), `${name} pins the -c "model_reasoning_effort=$ROLE_EFFORT" pair`, EFFORT_PAIR.test(args));
    add(id('exit-code'), `${name} propagates codex's exit code`, /\|\|\s*status=\$\?/.test(s) && /^exit "\$status"$/m.test(s));
    add(id('transport'), `${name} carries the resolved fields NUL-delimited through a redirect (never a line-delimited variable)`,
      NUL_JOIN.test(s) && NUL_READ.test(s) && PROC_SUB.test(s) && !VARIABLE_TRANSPORT.test(s));
  }

  if (add('sh-qal-exists', 'codex-qal.sh exists', qalSrc != null)) {
    const args = argBlock(qalSrc);
    add('sh-qal-exec', 'qal (sh) opens the argv with the \'exec\' atom', firstAtom(args) === 'exec', firstAtom(args));
    add('sh-qal-sandbox', 'qal (sh) pins the --sandbox danger-full-access argv PAIR', SANDBOX_PAIR('danger-full-access').test(args));
    add('sh-qal-approval', 'qal (sh) pins the -c approval_policy=never pair', APPROVAL_PIN.test(args));
    add('sh-qal-no-bypass', 'qal (sh) argv contains NO --dangerously-bypass atom', !/--dangerously-bypass[a-z-]*/.test(args));
    add('sh-qal-no-ignore', 'qal (sh) argv contains NO --ignore-user-config atom', !/--ignore-user-config/.test(args));
    add('sh-qal-no-restrictive', 'qal (sh) does NOT reintroduce a restrictive --sandbox pair',
      !SANDBOX_PAIR('read-only').test(args) && !SANDBOX_PAIR('workspace-write').test(args));
    add('sh-qal-cwd', 'qal (sh) -C targets the per-run scratch, never a baked-in path',
      /-C\s+"\$SCRATCH"/.test(args) && !ABSOLUTE_PATH_LITERAL.test(args));
    add('sh-qal-never-project-root', 'qal (sh) never passes $PROJECT_ROOT to codex (the repo is never the cwd)',
      !/-C\s+"\$PROJECT_ROOT"/.test(args));
    add('sh-qal-stdin', 'qal (sh) delivers the prompt via stdin', STDIN_PIPE.test(qalSrc));
    add('sh-qal-no-argv-prompt', 'qal (sh) has NO prompt on argv and no prompt flag at all', !PROMPT_ON_ARGV.test(qalSrc));
    add('sh-qal-empty-prompt', 'qal (sh) exits 2 on an empty (or whitespace-only) prompt',
      /tr -d '\[:space:\]'/.test(qalSrc) && /No prompt provided/.test(qalSrc));
    // mktemp -d is what makes "fresh every run" TRUE rather than merely likely: the name is unique
    // and the create is atomic, so an existing path can never be silently reused.
    add('sh-qal-mktemp', 'qal (sh) creates the scratch with mktemp -d under the per-user temp dir',
      /mktemp -d "\$\{TMPDIR:-\/tmp\}\/aiwf-qal\.XXXXXX"/.test(qalSrc));
    add('sh-qal-trap', 'qal (sh) removes the scratch from a trap on EXIT (so every exit path cleans up)',
      /trap cleanup_scratch EXIT/.test(qalSrc) && /cleanup_scratch\(\)/.test(qalSrc));
    add('sh-qal-cleanup-warn', 'qal (sh) cleanup warns with the path on failure', /cleanup failed[^\n]*%s/.test(qalSrc));
    add('sh-qal-resolver', 'qal (sh) resolves the qal role through the resolver entrypoint with --roles-path',
      /aiwf-roles\.sh/.test(qalSrc) && /--role\s+qal\b/.test(qalSrc) && PASSES_ROLES_PATH.test(qalSrc));
    add('sh-qal-model', 'qal (sh) passes the resolved model as the -m "$ROLE_MODEL" pair', MODEL_PAIR.test(args));
    add('sh-qal-no-model-literal', 'qal (sh) does NOT hardcode a model literal in -m', !HARDCODED_MODEL.test(args));
    add('sh-qal-engine-mismatch', 'qal (sh) exits 2 when the resolved engine is not codex (codex-only by design)',
      /\[\s*"\$ROLE_ENGINE"\s*!=\s*'codex'\s*\]/.test(qalSrc));
    // The operator gate, fail-closed: the resolver emits `enabled` as a strict boolean, and only
    // the literal true opens the gate here.
    add('sh-qal-enabled-gate', 'qal (sh) refuses to run unless roles.qal.enabled is true (operator gate, fail-closed)',
      /\[\s*"\$ROLE_ENABLED"\s*!=\s*'true'\s*\]/.test(qalSrc) && /QAL is disabled/.test(qalSrc));
    add('sh-qal-effort', 'qal (sh) pins the -c "model_reasoning_effort=$ROLE_EFFORT" pair', EFFORT_PAIR.test(args));
    add('sh-qal-exit-code', 'qal (sh) propagates codex\'s exit code',
      /\|\|\s*status=\$\?/.test(qalSrc) && /^exit "\$status"$/m.test(qalSrc));
    add('sh-qal-transport', 'qal (sh) carries the resolved fields NUL-delimited through a redirect (never a line-delimited variable)',
      NUL_JOIN.test(qalSrc) && NUL_READ.test(qalSrc) && PROC_SUB.test(qalSrc) && !VARIABLE_TRANSPORT.test(qalSrc));
  }

  if (add('sh-resolver-exists', 'aiwf-roles.sh exists', resolverSrc != null)) {
    add('sh-resolver-roles-path', 'resolver (sh) requires --roles-path, with NO script-relative fallback',
      /\[\s*-n\s+"\$ROLES_PATH"\s*\]\s*\|\|\s*fail/.test(resolverSrc)
      && !/BASH_SOURCE[^\n]*roles\.json/.test(resolverSrc) && !/\$HERE[^\n]*roles\.json/.test(resolverSrc));
    add('sh-resolver-fallback', 'resolver (sh) carries the factory fallback literals claude/opus/high',
      /FALLBACK_ENGINE='claude'/.test(resolverSrc) && /FALLBACK_MODEL='opus'/.test(resolverSrc)
      && /FALLBACK_EFFORT='high'/.test(resolverSrc));
    add('sh-resolver-never-codex', 'resolver (sh) never falls back to a paid external engine',
      !/FALLBACK_ENGINE='codex'/.test(resolverSrc));
    add('sh-resolver-fail-paths', 'resolver (sh) has BOTH exit-2 fail paths (unknown role, invalid triple) through one helper',
      /is not a valid role/.test(resolverSrc) && /does not resolve to a valid \(engine, model, effort\) triple/.test(resolverSrc)
      && /^\s*exit 2$/m.test(resolverSrc));
    add('sh-resolver-single-read', 'resolver (sh) reads the config EXACTLY once (a single node invocation)',
      (resolverSrc.match(/node -e/g) || []).length === 1);
    add('sh-resolver-no-capmap', 'resolver (sh) has NO built-in capability-map construct',
      !/CapabilityMap|capability_map|CAPMAP/i.test(resolverSrc));
  }

  // -------------------------------------------------------------------------
  // The transport, EXECUTED (not read)
  // -------------------------------------------------------------------------
  // Every check above this line reads source text, and source text cannot prove what argv a shell
  // really builds. So the wrappers are RUN, against a resolver fixture whose model and effort each
  // contain a space AND a newline - the values the config schema admits and a line-delimited
  // transport silently mangles - with a recording `codex` stub first on PATH. What is asserted is
  // the argv the engine would really have received, atom for atom, plus the stdin it would have
  // read and the exit code it would have returned.
  if (execProbes && tmpDir) {
    // Missing-host posture, identical to the role-resolver section's: a host that cannot be found
    // is a FAILURE saying the contract is unproven, never a silent skip. Nothing is printed when
    // the host IS there - the six executed findings below are that statement.
    if (!BASH) {
      add('sh-exec-host', 'a bash host is available to run the wrappers', false,
        'neither `bash` on PATH nor a Git-for-Windows bash could be executed - the wrapper transport is UNPROVEN in this run');
    } else {
      for (const [wrapper, short] of [['codex-review.sh', 'review'], ['codex-qa.sh', 'qa']]) {
        const probe = runWrapperWithStub(root, wrapper, tmpDir);
        const expected = [
          'exec', '-C', probe.projectRoot, '-m', HOSTILE_MODEL,
          '--sandbox', 'read-only', '-c', 'approval_policy=never', '-c', `model_reasoning_effort=${HOSTILE_EFFORT}`,
        ];
        add(`sh-exec-${short}-argv`,
          `${wrapper} EXECUTED: the argv codex really receives is the locked flag set, with the resolved model and effort intact as ONE atom each (space and newline included)`,
          JSON.stringify(probe.atoms) === JSON.stringify(expected),
          probe.atoms === null ? `the wrapper did not reach codex (exit ${probe.status}): ${firstLine(probe.stderr)}`
            : `${probe.atoms.length} atoms; -m atom ${JSON.stringify(String(probe.atoms[4]).slice(0, 40))}`);
        add(`sh-exec-${short}-stdin`, `${wrapper} EXECUTED: the brief reached codex on stdin, byte for byte, and never on argv`,
          probe.stdin === STUB_BRIEF && !(probe.atoms || []).some((a) => a.includes(STUB_BRIEF.trim())),
          probe.stdin === null ? 'nothing was recorded' : JSON.stringify(String(probe.stdin).slice(0, 40)));
        add(`sh-exec-${short}-exit`, `${wrapper} EXECUTED: codex's exit code is propagated unchanged`,
          probe.status === STUB_EXIT, `exit ${probe.status} (the stub exits ${STUB_EXIT})`);
      }
    }
  }
  return out;
}

// The hostile-but-legal resolver values: the schema requires a non-empty string and nothing more, so
// both of these are valid config a project may really carry. The `--sandbox danger-full-access` text
// inside the model is there on purpose - if the transport ever split on whitespace it would become
// its own argv atom, i.e. a flag.
const HOSTILE_MODEL = 'atom 9\nrogue --sandbox danger-full-access';
const HOSTILE_EFFORT = 'high\nlow';
const STUB_BRIEF = 'the brief for the transport probe\n';
const STUB_EXIT = 7;
const NUL_BYTE = String.fromCharCode(0);

/**
 * Runs one bash wrapper for real with a recording `codex` stub first on PATH, and returns what that
 * stub saw: the argv atoms (NUL-separated in the recording, because an argv atom may contain a
 * newline), the stdin bytes, and the wrapper's own exit code. The stub exits with a distinctive
 * code so exit-propagation is proven by the same run.
 */
function runWrapperWithStub(root, wrapper, tmpDir) {
  const home = fs.mkdtempSync(path.join(tmpDir, 'sh-exec-'));
  const bin = path.join(home, 'bin');
  const projectRoot = path.join(home, 'project');
  fs.mkdirSync(bin, { recursive: true });
  fs.mkdirSync(path.join(projectRoot, '.claude', 'aiwf-native'), { recursive: true });
  const record = { engine: 'codex', model: HOSTILE_MODEL, effort: HOSTILE_EFFORT };
  fs.writeFileSync(path.join(projectRoot, '.claude', 'aiwf-native', 'roles.json'),
    JSON.stringify({ reviewer: record, qa: record, qal: Object.assign({ enabled: true }, record) }));

  const argvOut = path.join(home, 'argv.bin');
  const stdinOut = path.join(home, 'stdin.bin');
  const stub = path.join(bin, 'codex');
  fs.writeFileSync(stub,
    '#!/usr/bin/env bash\n'
    + ': > "$PNP_ARGV_OUT"\n'
    + 'for a in "$@"; do printf \'%s\\0\' "$a" >> "$PNP_ARGV_OUT"; done\n'
    + 'cat > "$PNP_STDIN_OUT"\n'
    + `exit ${STUB_EXIT}\n`);
  fs.chmodSync(stub, 0o755);

  const sep = process.platform === 'win32' ? ';' : ':';
  const env = Object.assign({}, process.env, {
    PATH: bin + sep + process.env.PATH,
    PNP_ARGV_OUT: argvOut,
    PNP_STDIN_OUT: stdinOut,
  });
  const r = spawnSync(BASH, [path.join(root, 'scripts', 'native', 'sh', wrapper), '--project-root', projectRoot],
    { input: STUB_BRIEF, encoding: 'utf8', env });
  const recorded = readText(argvOut);
  return {
    projectRoot,
    status: r.status,
    stderr: r.stderr || '',
    // The recording ends with a trailing NUL, so the last split element is always the empty string.
    atoms: recorded === null ? null : recorded.split(NUL_BYTE).slice(0, -1),
    stdin: readText(stdinOut),
  };
}

// A control copies ONLY the four wrapper files (the findings above read nothing else), so a
// sabotage costs four file copies rather than a payload tree.
function copyShChannel(from, to) {
  const src = path.join(from, 'scripts', 'native', 'sh');
  const dst = path.join(to, 'scripts', 'native', 'sh');
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) fs.copyFileSync(path.join(src, name), path.join(dst, name));
}
const shRel = (file) => ['scripts', 'native', 'sh', file];
/** Drops one line out of a wrapper's CODEX_ARGS block (the array lines are indented by two). */
const dropArgLine = (file, literal) => (r) => patchText(r, shRel(file), new RegExp(`\\n {2}${literal}\\n`), '\n');
const replaceArgLine = (file, literal, replacement) => (r) => patchText(r, shRel(file), new RegExp(`\\n {2}${literal}\\n`), `\n  ${replacement}\n`);

/** The per-file controls for the two read-only wrappers, which are structurally identical. */
function readOnlyWrapperControls(file, short) {
  const at = shRel(file);
  return [
    { id: `sh-${short}-exec`, label: `${file}: the exec atom dropped from the argv`, apply: dropArgLine(file, 'exec') },
    { id: `sh-${short}-sandbox`, label: `${file}: the --sandbox read-only pair dropped`, apply: dropArgLine(file, '--sandbox read-only') },
    { id: `sh-${short}-approval`, label: `${file}: the approval_policy pin dropped`, apply: dropArgLine(file, '-c approval_policy=never') },
    { id: `sh-${short}-no-danger`, label: `${file}: the sandbox switched to danger-full-access`, apply: replaceArgLine(file, '--sandbox read-only', '--sandbox danger-full-access') },
    { id: `sh-${short}-no-bypass`, label: `${file}: a --dangerously-bypass flag smuggled into the argv`, apply: replaceArgLine(file, '-c approval_policy=never', '--dangerously-bypass-approvals-and-sandbox') },
    { id: `sh-${short}-no-ignore`, label: `${file}: --ignore-user-config smuggled into the argv`, apply: replaceArgLine(file, 'exec', 'exec\n  --ignore-user-config') },
    { id: `sh-${short}-stdin`, label: `${file}: the stdin pipe replaced by a plain call`, apply: (r) => patchText(r, at, /printf '%s\\n' "\$PROMPT" \| codex/, 'codex') },
    { id: `sh-${short}-no-argv-prompt`, label: `${file}: the prompt appended to the argv`, apply: (r) => patchText(r, at, /codex "\$\{CODEX_ARGS\[@\]\}"/, 'codex "${CODEX_ARGS[@]}" "$PROMPT"') },
    { id: `sh-${short}-empty-prompt`, label: `${file}: the empty-prompt guard defanged`, apply: (r) => patchText(r, at, /tr -d '\[:space:\]'/, 'cat') },
    { id: `sh-${short}-cwd`, label: `${file}: an absolute path baked into -C`, apply: replaceArgLine(file, '-C "\\$PROJECT_ROOT"', '-C /home/someone/repo') },
    { id: `sh-${short}-project-root`, label: `${file}: --project-root no longer required`, apply: (r) => patchText(r, at, /\[ -n "\$PROJECT_ROOT" \] \|\| fail/, 'true || fail') },
    { id: `sh-${short}-resolver`, label: `${file}: the resolver called with a hardcoded roles path`, apply: (r) => patchText(r, at, /--roles-path "\$ROLES_PATH"/, '--roles-path roles.json') },
    { id: `sh-${short}-model`, label: `${file}: a model literal in place of the resolved one`, apply: replaceArgLine(file, '-m "\\$ROLE_MODEL"', '-m gpt-5') },
    { id: `sh-${short}-no-model-literal`, label: `${file}: a model literal in -m (the generalized negative)`, apply: replaceArgLine(file, '-m "\\$ROLE_MODEL"', '-m gpt-5') },
    { id: `sh-${short}-engine-mismatch`, label: `${file}: the engine-mismatch guard removed`, apply: (r) => patchText(r, at, /\[ "\$ROLE_ENGINE" != 'codex' \]/, '[ -z "$ROLE_ENGINE" ]') },
    { id: `sh-${short}-effort`, label: `${file}: the model_reasoning_effort pin dropped`, apply: dropArgLine(file, '-c "model_reasoning_effort=\\$ROLE_EFFORT"') },
    { id: `sh-${short}-exit-code`, label: `${file}: codex's exit code swallowed`, apply: (r) => patchText(r, at, /exit "\$status"/, 'exit 0') },
    { id: `sh-${short}-transport`, label: `${file}: the NUL-delimited transport regressed to line-delimited`, apply: lineDelimitedTransport(file) },
    // The three EXECUTED controls. Each breaks a different half of the same run, and each is
    // detectable only because the wrapper is really executed: the argv one is exactly the defect a
    // source-reading check cannot see, since the line-delimited source looks perfectly reasonable.
    { id: `sh-exec-${short}-argv`, label: `${file}: line-delimited transport, so a newline in the model shifts the argv`, apply: lineDelimitedTransport(file) },
    { id: `sh-exec-${short}-stdin`, label: `${file}: the brief no longer piped to codex`,
      apply: (r) => patchText(r, at, /printf '%s\\n' "\$PROMPT" \| codex/, 'codex') },
    { id: `sh-exec-${short}-exit`, label: `${file}: codex's exit code swallowed (executed)`,
      apply: (r) => patchText(r, at, /exit "\$status"/, 'exit 0') },
  ];
}

/**
 * The sabotage the executed probe exists for: the transport goes back to newline-delimited fields
 * read from a shell variable - which is what this wrapper shipped before the review found it, and
 * which reads as entirely ordinary shell.
 */
function lineDelimitedTransport(file) {
  const at = shRel(file);
  return (r) => {
    const p = path.join(r, ...at);
    const src = readText(p);
    const fields = file === 'codex-qal.sh' ? 'ROLE_ENGINE ROLE_MODEL ROLE_EFFORT ROLE_ENABLED' : 'ROLE_ENGINE ROLE_MODEL ROLE_EFFORT';
    const reads = fields.split(' ').map((v) => `  IFS= read -r ${v}`).join('\n');
    const broken = src
      .replace(/\.join\("\\u0000"\) \+ "\\u0000"/, '.join("\\n") + "\\n"')
      .replace(/if ! \{[\s\S]*?\} < <\(PNP_SNAPSHOT="\$snapshot" node -e "\$FIELDS_JS"\); then[\s\S]*?\nfi\n/,
        `fields="$(PNP_SNAPSHOT="$snapshot" node -e "$FIELDS_JS")"\n{\n${reads}\n} <<< "$fields"\n`);
    fs.writeFileSync(p, broken);
  };
}

const QAL = 'codex-qal.sh';
const QAL_AT = shRel(QAL);
const ROLES_SH = 'aiwf-roles.sh';
const ROLES_AT = shRel(ROLES_SH);
const SH_CONTROLS = [
  { id: 'sh-channel-files', label: 'one wrapper missing from the channel', apply: (r) => fs.rmSync(path.join(r, ...shRel('codex-qa.sh'))) },
]
  // The byte-level facts, one control per file: a CR byte, a non-ASCII byte, a foreign shebang and
  // a relaxed strict mode. All four are invisible to a check phrased over text rather than bytes.
  .concat(['aiwf-roles.sh', 'codex-qa.sh', QAL, 'codex-review.sh'].flatMap((f) => [
    { id: `sh-lf-${f}`, label: `${f}: a CR byte smuggled into the file`, apply: (r) => {
      const p = path.join(r, ...shRel(f));
      fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('\n', '\r\n'));
    } },
    // The non-ASCII byte is written as an ESCAPE, never as a literal: this file is itself inside the
    // payload the provenance scan reads, and a stray literal here would be a finding of its own.
    { id: `sh-ascii-${f}`, label: `${f}: a non-ASCII byte appended`, apply: (r) => fs.appendFileSync(path.join(r, ...shRel(f)), '# ' + String.fromCharCode(0xe9) + '\n') },
    { id: `sh-shebang-${f}`, label: `${f}: the shebang changed to /bin/sh`, apply: (r) => patchText(r, shRel(f), /^#!\/usr\/bin\/env bash/, '#!/bin/sh') },
    { id: `sh-strict-${f}`, label: `${f}: the strict mode relaxed`, apply: (r) => patchText(r, shRel(f), /^set -euo pipefail$/m, 'set -e') },
  ]))
  .concat(readOnlyWrapperControls('codex-review.sh', 'review'))
  .concat(readOnlyWrapperControls('codex-qa.sh', 'qa'))
  .concat([
    { id: 'sh-qal-exec', label: 'qal: the exec atom dropped from the argv', apply: dropArgLine(QAL, 'exec') },
    { id: 'sh-qal-sandbox', label: 'qal: the danger-full-access pair dropped', apply: dropArgLine(QAL, '--sandbox danger-full-access') },
    { id: 'sh-qal-approval', label: 'qal: the approval_policy pin dropped', apply: dropArgLine(QAL, '-c approval_policy=never') },
    { id: 'sh-qal-no-bypass', label: 'qal: the bypass flag substituted for the narrower one', apply: replaceArgLine(QAL, '--sandbox danger-full-access', '--dangerously-bypass-approvals-and-sandbox') },
    { id: 'sh-qal-no-ignore', label: 'qal: --ignore-user-config smuggled into the argv', apply: replaceArgLine(QAL, 'exec', 'exec\n  --ignore-user-config') },
    { id: 'sh-qal-no-restrictive', label: 'qal: a restrictive sandbox reintroduced (which blocks the browser)', apply: replaceArgLine(QAL, '--sandbox danger-full-access', '--sandbox read-only') },
    { id: 'sh-qal-cwd', label: 'qal: an absolute path baked into -C', apply: replaceArgLine(QAL, '-C "\\$SCRATCH"', '-C /var/tmp/qal') },
    { id: 'sh-qal-never-project-root', label: 'qal: -C pointed at the repository instead of the scratch', apply: replaceArgLine(QAL, '-C "\\$SCRATCH"', '-C "$PROJECT_ROOT"') },
    { id: 'sh-qal-stdin', label: 'qal: the stdin pipe replaced by a plain call', apply: (r) => patchText(r, QAL_AT, /printf '%s\\n' "\$PROMPT" \| codex/, 'codex') },
    { id: 'sh-qal-no-argv-prompt', label: 'qal: the prompt appended to the argv', apply: (r) => patchText(r, QAL_AT, /codex "\$\{CODEX_ARGS\[@\]\}"/, 'codex "${CODEX_ARGS[@]}" "$PROMPT"') },
    { id: 'sh-qal-empty-prompt', label: 'qal: the empty-prompt guard defanged', apply: (r) => patchText(r, QAL_AT, /tr -d '\[:space:\]'/, 'cat') },
    { id: 'sh-qal-mktemp', label: 'qal: the scratch template dropped from mktemp', apply: (r) => patchText(r, QAL_AT, /mktemp -d "\$\{TMPDIR:-\/tmp\}\/aiwf-qal\.XXXXXX"/, 'mktemp -d') },
    { id: 'sh-qal-trap', label: 'qal: the EXIT trap removed, so the early exit path leaks the scratch dir', apply: (r) => patchText(r, QAL_AT, /trap cleanup_scratch EXIT\n/, '') },
    { id: 'sh-qal-cleanup-warn', label: 'qal: the cleanup failure no longer names the path', apply: (r) => patchText(r, QAL_AT, /cleanup failed \(remove it manually\): %s/, 'cleanup failed') },
    { id: 'sh-qal-resolver', label: 'qal: the resolver called with a hardcoded roles path', apply: (r) => patchText(r, QAL_AT, /--roles-path "\$ROLES_PATH"/, '--roles-path roles.json') },
    { id: 'sh-qal-model', label: 'qal: a model literal in place of the resolved one', apply: replaceArgLine(QAL, '-m "\\$ROLE_MODEL"', '-m gpt-5') },
    { id: 'sh-qal-no-model-literal', label: 'qal: a model literal in -m (the generalized negative)', apply: replaceArgLine(QAL, '-m "\\$ROLE_MODEL"', '-m gpt-5') },
    { id: 'sh-qal-engine-mismatch', label: 'qal: the codex-only guard removed', apply: (r) => patchText(r, QAL_AT, /\[ "\$ROLE_ENGINE" != 'codex' \]/, '[ -z "$ROLE_ENGINE" ]') },
    { id: 'sh-qal-enabled-gate', label: 'qal: the roles.qal.enabled operator gate removed', apply: (r) => patchText(r, QAL_AT, /\[ "\$ROLE_ENABLED" != 'true' \]/, '[ -z "$ROLE_ENABLED" ]') },
    { id: 'sh-qal-effort', label: 'qal: the model_reasoning_effort pin dropped', apply: dropArgLine(QAL, '-c "model_reasoning_effort=\\$ROLE_EFFORT"') },
    { id: 'sh-qal-exit-code', label: 'qal: codex\'s exit code swallowed', apply: (r) => patchText(r, QAL_AT, /exit "\$status"/, 'exit 0') },
    { id: 'sh-qal-transport', label: 'qal: the NUL-delimited transport regressed to line-delimited', apply: lineDelimitedTransport(QAL) },
    { id: 'sh-qal-exists', label: 'the qal wrapper deleted', apply: (r) => fs.rmSync(path.join(r, ...QAL_AT)) },
    { id: 'sh-review-exists', label: 'the review wrapper deleted', apply: (r) => fs.rmSync(path.join(r, ...shRel('codex-review.sh'))) },
    { id: 'sh-qa-exists', label: 'the qa wrapper deleted', apply: (r) => fs.rmSync(path.join(r, ...shRel('codex-qa.sh'))) },
    { id: 'sh-resolver-exists', label: 'the resolver deleted', apply: (r) => fs.rmSync(path.join(r, ...ROLES_AT)) },
    { id: 'sh-channel-present', label: 'the whole bash channel removed', apply: (r) => fs.rmSync(path.join(r, 'scripts', 'native', 'sh'), { recursive: true, force: true }) },
    { id: 'sh-resolver-roles-path', label: 'the resolver given a script-relative default roles path', apply: (r) => patchText(r, ROLES_AT, /\[ -n "\$ROLES_PATH" \] \|\| fail/, 'ROLES_PATH="${ROLES_PATH:-$HERE/roles.json}"; true || fail') },
    { id: 'sh-resolver-fallback', label: 'the factory fallback model changed', apply: (r) => patchText(r, ROLES_AT, /FALLBACK_MODEL='opus'/, "FALLBACK_MODEL='sonnet'") },
    { id: 'sh-resolver-never-codex', label: 'the factory fallback engine flipped to the paid external one', apply: (r) => patchText(r, ROLES_AT, /FALLBACK_ENGINE='claude'/, "FALLBACK_ENGINE='codex'") },
    { id: 'sh-resolver-fail-paths', label: 'the unknown-role failure path removed', apply: (r) => patchText(r, ROLES_AT, /is not a valid role/, 'is unusual') },
    { id: 'sh-resolver-single-read', label: 'the config read a second time', apply: (r) => fs.appendFileSync(path.join(r, ...ROLES_AT), 'node -e "$RESOLVE_JS"\n') },
    { id: 'sh-resolver-no-capmap', label: 'a capability map introduced into the resolver', apply: (r) => fs.appendFileSync(path.join(r, ...ROLES_AT), 'CAPMAP=1\n') },
  ]);

// The executed probes cost four child processes per wrapper, so they run for the real payload, for
// the pristine control copy, and then ONLY for the controls that target one of them - the same
// economy (and the same reason) as the example section's guard probes.
const SH_EXEC_IDS = new Set(['sh-exec-host',
  'sh-exec-review-argv', 'sh-exec-review-stdin', 'sh-exec-review-exit',
  'sh-exec-qa-argv', 'sh-exec-qa-stdin', 'sh-exec-qa-exit']);

function sectionShWrappers(tmpRoot) {
  section('WRAPPERS (bash channel) - locked flags, stdin-only delivery, LF + ASCII bytes, executed transport');
  const findings = shWrapperFindings(PLUGIN_ROOT, { tmpDir: tmpRoot });
  for (const f of findings) check(f.name, f.ok, f.detail);

  section('WRAPPERS (bash channel) CONTROLS - each of those assertions is proven able to FAIL');
  const base = path.join(tmpRoot, 'sh-base');
  copyShChannel(PLUGIN_ROOT, base);
  const pristine = shWrapperFindings(base, { tmpDir: tmpRoot }).filter((f) => !f.ok);
  check('the control copy is clean before any sabotage', pristine.length === 0,
    pristine.length ? pristine.map((f) => f.id).join(', ') : `${findings.length} checks green`);

  let i = 0;
  const covered = new Set();
  for (const m of SH_CONTROLS) {
    const broken = path.join(tmpRoot, `sh-neg-${i += 1}`);
    copyShChannel(base, broken);
    try { m.apply(broken); } catch (e) { check(`control could be applied: ${m.label}`, false, String(e.message)); continue; }
    const target = shWrapperFindings(broken, { execProbes: SH_EXEC_IDS.has(m.id), tmpDir: tmpRoot }).find((f) => f.id === m.id);
    if (!target) {
      check(`control "${m.label}" targets a live check (id "${m.id}")`, false, 'no check with that id was produced');
      continue;
    }
    covered.add(m.id);
    check(`sabotage detected [${m.id}]: ${m.label}`, target.ok === false,
      target.ok ? 'still PASS - the check is vacuous' : 'FAIL as required');
    try { fs.rmSync(broken, { recursive: true, force: true }); } catch (e) { /* best-effort */ }
  }
  for (const id of findings.filter((f) => !covered.has(f.id)).map((f) => f.id)) {
    note(`no negative control for bash-channel check "${id}"`, 'no control defined - add one or state why it cannot fail');
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
  // The STRICT-SHAPE fixtures. Each is a file that ONE host language would resolve by accident:
  // PowerShell's property lookup is case-insensitive, and `$raw | ConvertFrom-Json` enumerates an
  // array root so `[{...}]` arrives already unwrapped. Both are rejected in BOTH channels now -
  // roles.json is a machine-rendered artifact with exact-case keys, and a file that only resolves
  // through a host accident is a defect the resolver reports rather than papers over.
  const CASEROLE = fx('caserole.json', '{ "Reviewer": { "engine": "codex", "model": "atom-9", "effort": "low" } }');
  const ARRAYROOT = fx('arrayroot.json', '[{ "reviewer": { "engine": "codex", "model": "atom-9", "effort": "low" } }]');
  const CASEFIELD = fx('casefield.json', '{ "reviewer": { "Engine": "codex", "model": "atom-9", "effort": "low" } }');
  const QAL_CASE_ENABLED = fx('qal-case-enabled.json', '{ "qal": { "Enabled": true, "engine": "codex", "model": "atom-9", "effort": "high" } }');
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
  // STRICT SHAPE, on the channel whose host language would otherwise accept each of these.
  check('a role key differing only in CASE -> exit 2 (the lookup is case-sensitive in both channels)',
    isExit2(resolveRole('reviewer', CASEROLE)));
  check('a field key differing only in CASE -> exit 2 ("Engine" is not "engine")',
    isExit2(resolveRole('reviewer', CASEFIELD)));
  check('a single-element ARRAY root -> exit 2 (never unwrapped into the object it contains)',
    isExit2(resolveRole('reviewer', ARRAYROOT)));
  check('qal with "Enabled" (capital E) -> enabled=false (the operator gate is case-sensitive too)', (() => {
    const r = resolveRole('qal', QAL_CASE_ENABLED); return r.status === 0 && r.json && r.json.enabled === false;
  })());
  // -RolesPath is Mandatory, so omitting it must NOT silently resolve against some payload default.
  // A mandatory parameter with no value on a non-interactive host fails rather than prompting.
  {
    const r = resolveRole('reviewer', null);
    check('omitting -RolesPath does NOT silently resolve (the parameter is mandatory)',
      r.status !== 0 || r.json === null, `exit ${r.status}`);
  }

  // -------------------------------------------------------------------------
  // The BASH channel, on the SAME fixtures, and held to the PowerShell one
  // -------------------------------------------------------------------------
  // Two channels of one contract are only worth having if they answer identically, so the sh
  // resolver is not given a checklist of its own: every fixture above is replayed through it and
  // its exit code AND its JSON snapshot are compared with what the PowerShell resolver returned.
  // Parity alone could be two identical mistakes, which is why the absolute assertions above stay
  // and the two most load-bearing ones (the claude factory fallback, the fail-closed qal gate) are
  // re-stated absolutely here as well.
  section('ROLE RESOLVER (bash channel) - the same matrix, and parity with the PowerShell channel');
  if (!BASH) {
    check('a bash host is available to run the sh resolver', false,
      'neither `bash` on PATH nor a Git-for-Windows bash could be executed - the sh resolver contract is UNPROVEN in this run');
    return;
  }
  check('a bash host is available to run the sh resolver', true, BASH);

  const MATRIX = [
    ['valid reviewer record', 'reviewer', VALID],
    ['valid claude-hosted qa record', 'qa', VALID],
    ['valid qal record (enabled true)', 'qal', VALID],
    ['qal with enabled:false', 'qal', QAL_FALSE],
    ['qal with no enabled key', 'qal', QAL_NO_ENABLED],
    ['qal with enabled:"true" (a string)', 'qal', QAL_STR_ENABLED],
    ['missing config file', 'reviewer', NOFILE],
    ['missing config file + qal', 'qal', NOFILE],
    ['malformed JSON', 'reviewer', MALFORMED],
    ['unknown engine', 'reviewer', BADENGINE],
    ['empty model', 'reviewer', EMPTYMODEL],
    ['role missing from the file', 'reviewer', MISSINGROLE],
    ['unknown role argument', 'bogus', VALID],
    ['number model', 'reviewer', NUMMODEL],
    ['bool model', 'reviewer', BOOLMODEL],
    ['object model', 'reviewer', OBJMODEL],
    ['array model', 'reviewer', ARRMODEL],
    ['non-string engine', 'reviewer', NUMENGINE],
    ['non-string effort', 'reviewer', NUMEFFORT],
    ['missing effort', 'reviewer', NOEFFORT],
    ['empty effort', 'reviewer', EMPTYEFFORT],
    ['a role key differing only in case', 'reviewer', CASEROLE],
    ['a field key differing only in case', 'reviewer', CASEFIELD],
    ['a single-element array root', 'reviewer', ARRAYROOT],
    ['qal with "Enabled" (capital E)', 'qal', QAL_CASE_ENABLED],
  ];
  const shape = (json) => (json === null ? 'null' : JSON.stringify(json));
  for (const [label, role, file] of MATRIX) {
    const ps = resolveRole(role, file);
    const sh = resolveRoleSh(role, file);
    check(`sh resolver matches the ps resolver on: ${label}`,
      ps.status === sh.status && shape(ps.json) === shape(sh.json),
      `ps exit ${ps.status} ${shape(ps.json)} vs sh exit ${sh.status} ${shape(sh.json)}`);
  }
  {
    // THE FLIP, restated on this channel: a missing config must fall back to claude, never to a
    // paid external engine.
    const r = resolveRoleSh('reviewer', NOFILE);
    check('sh: missing config file -> factory fallback claude/opus/high, exit 0 (never codex)',
      okSnap(r, 'claude', 'opus', 'high'), r.json ? `${r.json.engine}/${r.json.model}/${r.json.effort}` : `exit ${r.status}`);
  }
  {
    const r = resolveRoleSh('qal', QAL_STR_ENABLED);
    check('sh: qal enabled:"true" (a string) -> enabled=false (no coercion, fail-closed)',
      r.status === 0 && r.json && r.json.enabled === false, shape(r.json));
  }
  {
    // The plain-text form is the other half of the printed contract, and it is what a human reads.
    const r = spawnSync(BASH, [SH_RESOLVER, '--role', 'reviewer', '--roles-path', VALID], { encoding: 'utf8' });
    check('sh: the plain (non-JSON) form prints "<engine> <model> <effort>"',
      r.status === 0 && (r.stdout || '').trim() === 'codex atom-9 low', JSON.stringify((r.stdout || '').trim()));
  }
  {
    // --roles-path is required, with no payload-relative default - the sh mirror of the mandatory
    // -RolesPath above.
    const r = resolveRoleSh('reviewer', null);
    check('sh: omitting --roles-path does NOT silently resolve (it is required)',
      r.status === 2 && r.json === null, `exit ${r.status}`);
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

  // The version interlock is ENFORCED, not described. Two documented exceptions run regardless -
  // the command that applies the migrations and the diagnostic you need most when something is out
  // of date cannot be the two commands that refuse to run.
  const INTERLOCK_EXCEPTIONS = ['update', 'selfcheck'];
  const notEnforcing = [];
  const stillFuture = [];
  for (const name of skillDirs) {
    const src = readText(path.join(skillsDir, name, 'SKILL.md')) || '';
    if (/enforced\s+from v0\.2|do not simulate/i.test(src)) stillFuture.push(name);
    if (INTERLOCK_EXCEPTIONS.includes(name)) continue;
    if (!/scripts\/update\/aiwf-update\.mjs/.test(src) || !/--check/.test(src)) notEnforcing.push(name);
  }
  check('no skill still carries the future-tense interlock wording ("enforced from v0.2" / "do not simulate")',
    stillFuture.length === 0, stillFuture.join(', '));
  check('every non-exception skill runs the real --check entrypoint in Step 0',
    notEnforcing.length === 0, notEnforcing.length ? notEnforcing.join(', ') : `${skillDirs.length - INTERLOCK_EXCEPTIONS.length} skills`);
  check('both documented interlock exceptions ship', INTERLOCK_EXCEPTIONS.every((n) => skillDirs.includes(n)), skillDirs.join(', '));

  // Cross-reference integrity: every payload doc / wrapper / template / script a payload file names
  // must exist. The update engine and the migration payload are scanned too - a migration's
  // `template`/`ruleset` reference and the resolvable-artifact map in migrate.mjs are exactly the
  // kind of path that rots silently. test-*.mjs is excluded on purpose: the acceptance suites build
  // deliberately broken payload copies, and their fixture paths are not references to resolve.
  const payloadFiles = []
    .concat(listFiles(skillsDir, (p) => p.endsWith('.md')))
    .concat(listFiles(path.join(PLUGIN_ROOT, 'docs'), (p) => p.endsWith('.md')))
    .concat(listFiles(path.join(PLUGIN_ROOT, 'templates'), () => true))
    .concat(listFiles(path.join(PLUGIN_ROOT, 'migrations'), () => true))
    .concat(listFiles(path.join(PLUGIN_ROOT, 'scripts', 'update'), (p) => p.endsWith('.mjs') && !path.basename(p).startsWith('test-')));
  const REF = /(?:docs\/[A-Za-z0-9_.-]+\.md|schema\/[A-Za-z0-9_.-]+\.json|migrations\/[A-Za-z0-9_./-]+\.(?:json|md)|scripts\/native\/ps\/[A-Za-z0-9_.-]+\.ps1|scripts\/native\/sh\/[A-Za-z0-9_.-]+\.sh|scripts\/(?:ci|engine|selfcheck|spike|setup|update)\/[A-Za-z0-9_.-]+\.(?:js|mjs)|templates\/[A-Za-z0-9_./-]+\.(?:tmpl|json))/g;
  const dangling = [];
  let refCount = 0;
  let shRefCount = 0;
  for (const f of payloadFiles) {
    const src = readText(f) || '';
    const seen = new Set(src.match(REF) || []);
    for (const ref of seen) {
      refCount += 1;
      if (ref.startsWith('scripts/native/sh/')) shRefCount += 1;
      if (!fs.existsSync(path.join(PLUGIN_ROOT, ref))) dangling.push(`${path.relative(PLUGIN_ROOT, f)} -> ${ref}`);
    }
  }
  check('every payload path referenced from a skill/doc/template exists',
    dangling.length === 0, dangling.length ? dangling.slice(0, 6).join('; ') : `${refCount} references resolved across ${payloadFiles.length} files`);
  // "Nothing dangling" is also what a scan that matched NOTHING reports, so each channel's arm of
  // the pattern has to be shown to be live. The payload names the bash wrappers in the skills, the
  // doctrine and the wrapper README, so a zero here means the sh alternative stopped matching -
  // and every sh reference would then be unchecked while this section still printed green.
  check('the sh arm of the reference scan is live (the payload really names the bash channel)',
    shRefCount > 0, `${shRefCount} scripts/native/sh/ references resolved`);
  // The needle itself, on constructed input - the same technique the provenance section uses, and
  // for the same reason: a pattern that matches nothing and a payload with nothing to match look
  // identical from the outside. This proves the arm both MATCHES and would report a dangling one.
  {
    const probe = 'see scripts/native/sh/aiwf-roles.sh and scripts/native/sh/nonexistent.sh';
    const hits = probe.match(REF) || [];
    check('the sh arm matches a real AND a dangling bash-wrapper reference (so a broken one cannot pass)',
      hits.includes('scripts/native/sh/aiwf-roles.sh') && hits.includes('scripts/native/sh/nonexistent.sh')
      && fs.existsSync(path.join(PLUGIN_ROOT, 'scripts/native/sh/aiwf-roles.sh'))
      && !fs.existsSync(path.join(PLUGIN_ROOT, 'scripts/native/sh/nonexistent.sh')),
      `${hits.length} matched on constructed input`);
  }

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
// SECTION - provenance (nothing of the project this payload was extracted from)
// ---------------------------------------------------------------------------
// This plugin was extracted from a real, private production project. That project's names, machine
// paths, addresses and operator language must not travel with the payload - and "we grepped once
// and it was zero" rots the moment somebody pastes a path into a comment. So the scrub is a
// standing gate in the same shape as everything else here: findings with stable ids, and one
// sabotage per finding proving it can fail.
//
// TWO DELIBERATE PECULIARITIES, both consequences of this file being INSIDE the set it scans:
//
//   1. The origin names are held as sha256 DIGESTS of their lowercased form, never as text.
//      Spelling them out would put the very identifiers this section exists to keep out back into
//      a payload that is currently clean - the check would become the leak. Recompute one with:
//        node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1].toLowerCase()).digest('hex'))" "<name>"
//      What the controls prove is the MECHANISM - that a denylisted token planted in any payload
//      file, in any case, is found - not that these digests have the preimages they claim. That
//      last step is not provable from inside a payload that must not contain the preimages, and
//      this paragraph is the honest statement of the gap rather than a silent one.
//   2. Every drive-letter literal in this file is split immediately after the colon
//      ('C:' + '\\repo'), for the same reason: the allowlist must NAME the paths it admits, and a
//      whole literal here would be an unadmitted occurrence in this very file. A typo inside a
//      split literal is self-detecting - the real occurrence it describes stops being admitted and
//      the absolute-path check fails loudly.
//
// The scanned set is every text file of the payload, defined by extension/known name below, with
// .git and node_modules excluded as not-payload. A file whose type is not in that set is a
// FAILURE, not a silent skip: a new file class gets classified deliberately or the gate says so.

const PROV_ORIGIN_DIGESTS = [
  '010b3361af1b132b4c18771b3b1a0d972130c070050af026ab1cd91c8db3099f',
  '7e7f34bca54cadc24ef362a6813b1e458334f2c3be2de39afe67fab3a765c63c',
  '63119e36a7ac5020848d84e780e6c71a824fb962733928462d333fca80150175',
];
// Lengths of those three tokens. Purely an optimisation: only tokens of a denylisted length are
// hashed, which is the difference between hashing every word of the payload and hashing a few.
const PROV_ORIGIN_LENGTHS = [10, 7, 7];

// Text file types of the payload. `.sh` joined the list with the bash wrapper channel: the scan is
// the payload's, not one OS channel's, and an unclassified file type FAILS rather than being skipped.
const PROV_TEXT_EXT = new Set(['.md', '.mjs', '.js', '.json', '.tmpl', '.ps1', '.sh', '.yml']);
const PROV_TEXT_NAMES = new Set(['LICENSE', '.gitattributes']);
const PROV_SKIP_DIRS = new Set(['.git', 'node_modules']);
// Every top-level area of the payload must contribute at least one scanned file, root files
// included. This is the half of the coverage assertion that a raw count cannot express: a scan
// that stopped descending after two directories still returns a large, plausible number.
const PROV_AREAS = ['.claude-plugin', '.github', 'docs', 'examples', 'hooks', 'migrations', 'schema', 'scripts', 'skills', 'templates'];
// The payload ships 96 text files today (this run prints the number it really scanned; that is
// where this one comes from). The floor is deliberately well below that - ordinary
// growth and pruning must not trip it, while an empty or gutted list is not read as agreement.
const PROV_MIN_FILES = 60;

// The absolute paths that legitimately survive, each pinned to the ONE file that justifies it: a
// generic placeholder in a documentation example, a fixture value, and a negative control. The
// pairing is the point - the same string in a new place is a new absolute path and fails.
const PROV_ABS_ALLOW = [
  { file: 'scripts/native/ps/aiwf-roles.ps1', literal: 'C:' + '\\repo\\.claude\\aiwf-native\\roles.json',
    why: '.EXAMPLE block: a placeholder project path' },
  { file: 'scripts/native/ps/codex-review.ps1', literal: 'C:' + '\\repo', why: '.EXAMPLE block' },
  { file: 'scripts/native/ps/codex-qa.ps1', literal: 'C:' + '\\repo', why: '.EXAMPLE block' },
  { file: 'scripts/native/ps/codex-qal.ps1', literal: 'C:' + '\\repo', why: '.EXAMPLE block' },
  { file: 'scripts/spike/run-spikes.mjs', literal: 'C:' + '\\\\work\\\\demo',
    why: 'the cwd of the captured hook payloads the spikes replay' },
  { file: 'scripts/update/test-update.mjs', literal: 'C:' + '/Windows/system.ini',
    why: 'the negative control that proves the payload validator rejects an absolute path' },
];

const PROV_TOKEN_RE = /[a-z0-9]+/g;
const PROV_EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
// By CODE POINT, never by byte class: a byte-level Cyrillic range also matches parts of an em-dash,
// and this payload is full of em-dashes - the finding below prints how many it saw and did not
// match, so the absence of that mistake is reported rather than assumed.
const PROV_CYRILLIC_RE = /[\u0400-\u04FF]/;
// The lookbehind is what keeps the letter-colon-slash inside an https URL from reading as a drive
// letter. (Writing that three-character sequence out here, quoted, would itself be an unadmitted
// occurrence - the check caught exactly that in its own first draft.)
const PROV_ABS_RE = /(?<![A-Za-z0-9_])[A-Za-z]:[\\/][^\s"'`,;:()<>|\]]*/g;

/** Hits of the denylist inside one piece of text, counted as whole alphanumeric tokens, case-free. */
function provTokenHits(text, digests, lengths) {
  let hits = 0;
  for (const tok of text.toLowerCase().match(PROV_TOKEN_RE) || []) {
    if (lengths.has(tok.length) && digests.has(sha256(tok))) hits += 1;
  }
  return hits;
}
function provAbsMatches(text) {
  PROV_ABS_RE.lastIndex = 0;
  return [...text.matchAll(PROV_ABS_RE)].map((m) => m[0]);
}
const provRel = (root, p) => path.relative(root, p).split(path.sep).join('/') || '.';
const provWhy = (e) => e.code || e.message;

/**
 * `readdir` is injectable for exactly one reason: the negative controls have to drive the
 * enumeration-failure branch below, and that branch belongs to THIS process rather than to the
 * payload copy a control sabotages. Same pattern, and the same reason, as the junction probe.
 */
function provenanceWalk(root, { readdir = fs.readdirSync } = {}) {
  const scanned = [];
  const unclassified = [];
  const unreadableDirs = [];
  (function rec(dir) {
    let entries;
    // A directory that cannot be enumerated is a SUBTREE THIS SCAN NEVER LOOKED AT. Returning
    // quietly would let the file count and the area coverage stay perfectly plausible while the
    // claim "the payload carries nothing of its origin" was never tested there - the vacuous pass
    // this whole section exists to prevent. So it is collected and it FAILS.
    try { entries = readdir(dir, { withFileTypes: true }); }
    catch (e) { unreadableDirs.push(`${provRel(root, dir)} (${provWhy(e)})`); return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!PROV_SKIP_DIRS.has(e.name)) rec(p); continue; }
      const rel = provRel(root, p);
      if (PROV_TEXT_EXT.has(path.extname(e.name).toLowerCase()) || PROV_TEXT_NAMES.has(e.name)) scanned.push(rel);
      else unclassified.push(rel);
    }
  })(root);
  return { scanned: scanned.sort(), unclassified: unclassified.sort(), unreadableDirs: unreadableDirs.sort() };
}

/**
 * `extraOriginDigests`/`extraOriginLengths` arm the denylist with one extra token. Only the
 * negative controls use it, and they plant a canary whose digest nothing else knows - which is how
 * a control can prove the origin scan catches a planted name without this file containing one.
 */
function provenanceFindings(root, {
  extraOriginDigests = [], extraOriginLengths = [],
  readdir = fs.readdirSync, readFile = (p) => fs.readFileSync(p, 'utf8'),
} = {}) {
  const out = [];
  const add = (id, name, ok, detail) => { out.push({ id, name, ok: !!ok, detail: detail || '' }); return !!ok; };

  const { scanned, unclassified, unreadableDirs } = provenanceWalk(root, { readdir });
  const digests = new Set(PROV_ORIGIN_DIGESTS.concat(extraOriginDigests));
  const lengths = new Set(PROV_ORIGIN_LENGTHS.concat(extraOriginLengths));

  const unreadable = [];
  const originHits = [];
  const emailHits = [];
  const cyrillicHits = [];
  const pathHits = [];
  const allowUsed = PROV_ABS_ALLOW.map(() => 0);
  let emDashes = 0;

  for (const rel of scanned) {
    // Read here rather than through readText(): a file that is in the set but could not be read is
    // a hole in the scan, not a clean file, and the reason is worth naming. Injectable for the same
    // reason as readdir above - the controls have to be able to drive this branch.
    let src;
    try { src = readFile(path.join(root, ...rel.split('/'))); }
    catch (e) { unreadable.push(`${rel} (${provWhy(e)})`); continue; }
    emDashes += (src.match(/\u2014/g) || []).length;
    const lines = src.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const where = `${rel}:${i + 1}`;
      if (provTokenHits(line, digests, lengths)) originHits.push(where);
      if (PROV_EMAIL_RE.test(line)) emailHits.push(where);
      if (PROV_CYRILLIC_RE.test(line)) cyrillicHits.push(where);
      for (const atom of provAbsMatches(line)) {
        const i2 = PROV_ABS_ALLOW.findIndex((a) => a.file === rel && a.literal === atom);
        if (i2 === -1) pathHits.push(`${where} ${atom}`); else allowUsed[i2] += 1;
      }
    }
  }

  // Three ways this scan can be less complete than its count suggests, and all three FAIL here: a
  // file class nobody classified, a file that could not be read, and a directory that could not be
  // enumerated. The third is the dangerous one - it removes a whole subtree from the scan while
  // every other number in this section stays entirely plausible.
  add('provenance-scope',
    'every directory of the payload tree was enumerated, and every file in it is classified as scannable text and was really read',
    unclassified.length === 0 && unreadable.length === 0 && unreadableDirs.length === 0,
    unclassified.length || unreadable.length || unreadableDirs.length
      ? `NOT SCANNED - directories that could not be enumerated: ${unreadableDirs.slice(0, 5).join(', ') || 'none'}; `
        + `files that could not be read: ${unreadable.slice(0, 5).join(', ') || 'none'}; `
        + `files of an unclassified type: ${unclassified.slice(0, 5).join(', ') || 'none'}`
      : `${scanned.length} text files scanned, every directory enumerated`);

  const areas = new Set(scanned.map((rel) => (rel.includes('/') ? rel.split('/')[0] : '(root)')));
  const missingAreas = PROV_AREAS.filter((a) => !areas.has(a));
  add('provenance-scope-areas',
    'the scanned set covers every payload area - examples/ included, since it ships with the plugin - and is not implausibly small',
    missingAreas.length === 0 && areas.has('(root)') && scanned.length >= PROV_MIN_FILES,
    missingAreas.length ? `nothing scanned under ${missingAreas.join(', ')}`
      : `${scanned.length} files (floor ${PROV_MIN_FILES}) across ${areas.size} areas`);

  // The hit lists print WHERE, never WHAT: echoing a found identifier would leak it into every log
  // that captures this run.
  add('provenance-origin', 'no payload file names the project this loop was extracted from',
    originHits.length === 0,
    originHits.length ? `${originHits.length} hit(s) at ${originHits.slice(0, 6).join(', ')} (the token itself is not printed)` : `${scanned.length} files clean`);
  add('provenance-email', 'no payload file carries an email address',
    emailHits.length === 0,
    emailHits.length ? `${emailHits.length} hit(s) at ${emailHits.slice(0, 6).join(', ')} (the address itself is not printed)` : `${scanned.length} files clean`);
  add('provenance-cyrillic', 'no payload file carries a Cyrillic code point (the origin project\'s operator channel was written in a Cyrillic script)',
    cyrillicHits.length === 0,
    cyrillicHits.length ? `${cyrillicHits.length} hit(s) at ${cyrillicHits.slice(0, 6).join(', ')}`
      : `${scanned.length} files clean, with ${emDashes} em-dashes present and correctly not matched`);
  add('provenance-abs-path', 'every drive-letter absolute path in the payload is one the allowlist admits IN THAT FILE',
    pathHits.length === 0,
    pathHits.length ? `${pathHits.length} unadmitted: ${pathHits.slice(0, 6).join(', ')}`
      : `${allowUsed.reduce((a, b) => a + b, 0)} admitted occurrences across ${PROV_ABS_ALLOW.length} entries`);
  const dead = PROV_ABS_ALLOW.filter((a, i) => allowUsed[i] === 0).map((a) => `${a.file} :: ${a.literal}`);
  add('provenance-allowlist-live', 'every allowlist entry still describes a real occurrence (a dead entry is a standing exemption nobody needs)',
    dead.length === 0, dead.length ? `dead: ${dead.join(', ')}` : `${PROV_ABS_ALLOW.length} entries live`);

  return out;
}

// The canary: a token that exists nowhere in the payload, assembled from fragments so that this
// file does not contain it either. The controls arm the denylist with its digest and plant the
// token - which proves the scan finds a planted name, in a payload that must never contain one.
const PROV_CANARY = 'pnpcanary' + 'provenancetoken';
const PROV_ARMED = { extraOriginDigests: [sha256(PROV_CANARY)], extraOriginLengths: [PROV_CANARY.length] };

function appendText(root, rel, text) {
  fs.appendFileSync(path.join(root, ...rel.split('/')), text, 'utf8');
}
const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The two "could not read it" controls inject the failure at the boundary the walk itself uses,
 * rather than really revoking permissions on a copy. Measured, not assumed: `icacls <dir> /deny
 * "<user>:(RX)"` DOES work on a directory this user owns and makes readdirSync throw EPERM - but
 * `fs.rmSync(recursive, force)` then throws EPERM too and LEAVES THE DIRECTORY BEHIND, so the
 * control would trade a proven branch for permanent debris under the system temp dir, in a file
 * whose own rule is that unfinished cleanup is a failure. It is also `icacls`, i.e. Windows-only
 * code in a payload that now ships a Linux/macOS channel too. Injection is deterministic,
 * portable, and drives exactly the same branch; the EPERM code below is the one Windows really
 * produced in that experiment.
 */
function denyingReaddir(absDir) {
  return (dir, opts) => {
    if (path.resolve(dir) === path.resolve(absDir)) {
      const e = new Error(`simulated: cannot enumerate ${absDir}`); e.code = 'EPERM'; throw e;
    }
    return fs.readdirSync(dir, opts);
  };
}
function denyingReadFile(absFile) {
  return (p) => {
    if (path.resolve(p) === path.resolve(absFile)) {
      const e = new Error(`simulated: cannot read ${absFile}`); e.code = 'EPERM'; throw e;
    }
    return fs.readFileSync(p, 'utf8');
  };
}

const PROVENANCE_CONTROLS = [
  { id: 'provenance-origin', label: 'a denylisted origin name planted in a payload doc', opts: PROV_ARMED,
    apply: (r) => appendText(r, 'docs/LOOP.md', `\nA sentence that names ${PROV_CANARY}.\n`) },
  { id: 'provenance-origin', label: 'the same name planted in a template IN UPPER CASE (the match is case-free)', opts: PROV_ARMED,
    apply: (r) => appendText(r, 'templates/CLAUDE.md.tmpl', `\n${PROV_CANARY.toUpperCase()}\n`) },
  { id: 'provenance-origin', label: 'the same name planted under examples/, which ships with the plugin', opts: PROV_ARMED,
    apply: (r) => appendText(r, 'examples/example-project/README.md', `\n${PROV_CANARY}\n`) },
  { id: 'provenance-email', label: 'an email address planted in a script comment',
    apply: (r) => appendText(r, 'scripts/engine/aiwf-lib.js', `\n// contact: someone@${'example.com'}\n`) },
  { id: 'provenance-cyrillic', label: 'one Cyrillic character planted in a template',
    apply: (r) => appendText(r, 'templates/PROJECT_OVERRIDES.md.tmpl', '\nnote: \u0414\n') },
  { id: 'provenance-abs-path', label: 'a new drive-letter absolute path planted in a script',
    apply: (r) => appendText(r, 'scripts/setup/generate.mjs', `\n// see ${'C:' + '\\Users\\someone\\notes.txt'}\n`) },
  { id: 'provenance-abs-path', label: 'an ALLOWLISTED literal planted in a file it does not belong to',
    apply: (r) => appendText(r, 'docs/WORKFLOW.md', `\n    ${'C:' + '\\repo'}\n`) },
  { id: 'provenance-allowlist-live', label: 'the occurrence an allowlist entry describes removed from its file',
    apply: (r) => patchText(r, ['scripts', 'spike', 'run-spikes.mjs'], new RegExp(reEscape('C:' + '\\\\work\\\\demo'), 'g'), 'demo') },
  { id: 'provenance-scope', label: 'a file of an unclassified type dropped into the payload',
    apply: (r) => fs.writeFileSync(path.join(r, 'payload.bin'), 'binary-ish') },
  // No edit to the copy: the sabotage IS the injected failure, at the walk's own boundary.
  { id: 'provenance-scope', label: 'a directory that cannot be enumerated (docs/, EPERM at the readdir boundary the walk uses)',
    opts: (r) => ({ readdir: denyingReaddir(path.join(r, 'docs')) }), apply: () => {} },
  { id: 'provenance-scope', label: 'a file that cannot be read (README.md, EPERM at the readFile boundary the scan uses)',
    opts: (r) => ({ readFile: denyingReadFile(path.join(r, 'README.md')) }), apply: () => {} },
  { id: 'provenance-scope-areas', label: 'a whole payload area (examples/) removed from the copy',
    apply: (r) => fs.rmSync(path.join(r, 'examples'), { recursive: true, force: true }) },
];

function sectionProvenance(tmpRoot) {
  section('PROVENANCE - the payload carries nothing of the project it was extracted from');
  for (const f of provenanceFindings(PLUGIN_ROOT)) check(f.name, f.ok, f.detail);

  // The needles themselves, on constructed input. A denylist that matches nothing and a pattern
  // that matches nothing both report "0 hits" against a clean payload, and look identical there.
  const D = new Set([sha256(PROV_CANARY)]);
  const L = new Set([PROV_CANARY.length]);
  check('the name scan matches a denylisted token in any case and around any punctuation, and only as a WHOLE token',
    provTokenHits(`prefix ${PROV_CANARY} suffix`, D, L) === 1
    && provTokenHits(PROV_CANARY.toUpperCase(), D, L) === 1
    && provTokenHits(`D:${'\\'}${PROV_CANARY}${'\\'}apps`, D, L) === 1
    && provTokenHits(`${PROV_CANARY}x`, D, L) === 0
    && provTokenHits('nothing of the sort here', D, L) === 0);
  check('the email pattern matches a real address, and not a package spec, a bare handle or a dotless host',
    ['someone@' + 'example.com', 'first.last+tag@' + 'sub.domain.co', 'a_b@' + 'x-y.io'].every((s) => PROV_EMAIL_RE.test(s))
    && ['pkg@' + '1.2.3', 'codex@' + 'openai-codex', '@' + 'handle', 'a@' + 'b'].every((s) => !PROV_EMAIL_RE.test(s)));
  check('the Cyrillic class matches by CODE POINT: a Cyrillic letter hits, an em-dash and a hyphen do not',
    PROV_CYRILLIC_RE.test('\u0414') && PROV_CYRILLIC_RE.test('\u044F')
    && !PROV_CYRILLIC_RE.test('\u2014') && !PROV_CYRILLIC_RE.test('\u2013') && !PROV_CYRILLIC_RE.test('-'));
  check('the absolute-path pattern matches a drive path and not the letter-colon-slash inside an https URL',
    provAbsMatches(`-ProjectRoot '${'C:' + '\\repo'}' -Prompt x`).join('|') === 'C:' + '\\repo'
    && provAbsMatches('see https:' + '//example.com/x and http:' + '//localhost:3000/y').length === 0);

  section('PROVENANCE CONTROLS - each of those assertions is proven able to FAIL');
  const base = path.join(tmpRoot, 'prov-base');
  copyPayloadTree(PLUGIN_ROOT, base);
  const pristine = provenanceFindings(base);
  const pristineFailures = pristine.filter((f) => !f.ok);
  check('the control copy is clean before any sabotage', pristineFailures.length === 0,
    pristineFailures.length ? pristineFailures.map((f) => f.id).join(', ') : `${pristine.length} checks green`);

  // Two things at once, and both matter. Every forbidden pattern is planted inside .git/ - which is
  // NOT payload - and the denylist is armed with the canary that is planted nowhere. The copy must
  // still be green: it proves the walk really skips .git, and that each control below is proving
  // its PLANT rather than the arming.
  fs.mkdirSync(path.join(base, '.git'), { recursive: true });
  fs.writeFileSync(path.join(base, '.git', 'config'),
    `${PROV_CANARY}\ncontact someone@${'example.com'}\n\u0414\n${'C:' + '\\Users\\someone\\secret'}\n`, 'utf8');
  const armedClean = provenanceFindings(base, PROV_ARMED).filter((f) => !f.ok);
  check('.git is not payload, and arming alone finds nothing: every forbidden pattern planted in .git/ with the canary armed leaves the copy green',
    armedClean.length === 0, armedClean.length ? armedClean.map((f) => f.id).join(', ') : 'still green');

  let i = 0;
  const covered = new Set();
  for (const m of PROVENANCE_CONTROLS) {
    const broken = path.join(tmpRoot, `prov-neg-${i += 1}`);
    copyPayloadTree(base, broken);
    try { m.apply(broken); } catch (e) { check(`control could be applied: ${m.label}`, false, String(e.message)); continue; }
    // `opts` may be a function of the sabotaged root: the two injection controls need to name a
    // path inside the copy that only exists once the copy exists.
    const opts = typeof m.opts === 'function' ? m.opts(broken) : (m.opts || {});
    const target = provenanceFindings(broken, opts).find((f) => f.id === m.id);
    if (!target) {
      check(`control "${m.label}" targets a live check (id "${m.id}")`, false, 'no check with that id was produced');
      continue;
    }
    covered.add(m.id);
    check(`sabotage detected [${m.id}]: ${m.label}`, target.ok === false,
      target.ok ? 'still PASS - the check is vacuous' : 'FAIL as required');
    try { fs.rmSync(broken, { recursive: true, force: true }); } catch (e) { /* best-effort */ }
  }
  for (const id of pristine.filter((f) => !covered.has(f.id)).map((f) => f.id)) {
    note(`no negative control for provenance check "${id}"`, 'no control defined - add one or state why it cannot fail');
  }
}

// ---------------------------------------------------------------------------
// SECTION - the example fixture (examples/example-project + its driver + CI)
// ---------------------------------------------------------------------------
// The example cycle is the only gate that runs the whole product the way an operator would, and it
// runs on DATA: a committed answers file, a committed seed project, a committed simulated version
// bump. That data can rot exactly like code, and silently - a stale answers file, a bump the
// payload validator would now reject, a README whose commands are no longer what CI runs. So it is
// asserted here, with a negative control per assertion.
//
// EVERY CHECK BELOW MUST SURVIVE BEING RUN AGAINST A PAYLOAD COPY. The acceptance suites and the
// cycle itself run this self-check with --plugin-root pointing at a copy that already carries a
// fixture migration, so a check phrased as "the bump is newer than the last manifest entry" would
// fail on exactly the payloads that exercise the engine hardest. The predecessor rule below is
// phrased against the entry the bump declares itself to FOLLOW, which is stable in both.
const EXAMPLE_REL = 'examples/example-project';
const exAt = (root, ...rel) => path.join(root, 'examples', 'example-project', ...rel);
const OP_TYPES = ['add-config-key', 'rerender-managed-region', 'reconcile-ask-ruleset', 'note'];
const MIGRATION_ID_RE = /^([0-9]{4})_([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const VERSION_RE = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

// An independent implementation, like sha256 above and for the same reason: this file must be able
// to catch the payload validator agreeing with itself. Same rule, written out separately.
function versionTriple(value) {
  const m = typeof value === 'string' ? VERSION_RE.exec(value) : null;
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function versionGreater(a, b) {
  const pa = versionTriple(a);
  const pb = versionTriple(b);
  if (!pa || !pb) return false;
  for (let i = 0; i < 3; i += 1) if (pa[i] !== pb[i]) return pa[i] > pb[i];
  return false;
}

// The stand-in bookkeeping block, mirroring scripts/setup/generate.mjs (PROBE_AIWF). An answers file
// legitimately carries no _aiwf - setup writes that block itself - so validating the answers against
// the schema needs one supplied, exactly as the generator does before it renders anything.
const PROBE_AIWF = {
  installedPluginVersion: '0.0.0',
  lastMigrationApplied: '0000_probe',
  migrationJournal: null,
  managedRegions: {},
  ownedAskRules: [],
  suppressedAskRules: [],
};

/** The command lines the cycle driver declares as documented. Null when the block is not there. */
function documentedCommands(source) {
  const block = /export const DOCUMENTED_COMMANDS = \[([\s\S]*?)\n\];/.exec(source || '');
  if (!block) return null;
  return (block[1].match(/'[^']*'/g) || []).map((s) => s.slice(1, -1));
}
/** Every command line the example README shows, split into the ones with cycle placeholders and the rest. */
function readmeCommands(readme) {
  const lines = String(readme || '').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('node '));
  return { placeholder: lines.filter((l) => l.includes('<')), plain: lines.filter((l) => !l.includes('<')) };
}
const stripPlaceholders = (token) => token
  .split('<payload2>').join('.').split('<payload>').join('.')
  .split('<repo>').join('.').split('<project>').join('.').split('<work>').join('.');

/**
 * The workflow's jobs, as raw text per job name. Deliberately a two-space-indent scan rather than a
 * YAML parser: the payload ships zero dependencies, and what the checks below need is "which lines
 * belong to which leg", which the indentation already says. A job name is the only key at that
 * depth under `jobs:`; everything inside a job is indented further.
 */
function workflowJobs(workflow) {
  const out = new Map();
  const text = String(workflow || '');
  const at = text.indexOf('\njobs:');
  if (at === -1) return out;
  let current = null;
  const lines = [];
  for (const line of text.slice(at + 1).split('\n').slice(1)) {
    const m = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (m) { current = m[1]; lines.push([current, []]); continue; }
    if (current) lines[lines.length - 1][1].push(line);
  }
  for (const [name, body] of lines) out.set(name, body.join('\n'));
  return out;
}

const firstLine = (text) => String(text || '').trim().split('\n')[0].slice(0, 180);
const safeReaddir = (p) => { try { return fs.readdirSync(p).sort(); } catch (e) { return null; } };

/**
 * The junction probe, as a function so its "a junction could not be created" branch is reachable in
 * a test. `symlink` is injected for exactly that reason; production passes fs.symlinkSync.
 *
 * A link that cannot be created is a FAILED check, not a NOTE, on EVERY OS this payload supports.
 * On Windows the link is a junction, which needs no elevation; on Linux and macOS Node ignores the
 * 'junction' type argument and creates a plain symlink, which needs no privilege either - and the
 * danger being probed is identical in both cases: a --work-dir reached into the repository through
 * a link, whose child does not exist yet, that a non-recursive mkdir would still follow. So "we
 * could not make one" describes a broken environment, not a condition this check is exempt from. A
 * NOTE here would be a mandatory probe quietly becoming a non-failure - the entire class of defect
 * this section exists to catch.
 */
function junctionProbeFinding(root, tmpDir, probe, symlink) {
  const NAME = 'the cycle driver REFUSES a --work-dir reached through a junction into the repository: '
    + 'exit 2, a containment reason, nothing created inside it';
  const make = symlink || fs.symlinkSync;
  const holder = path.join(tmpDir, `workdir-junction-${exampleProbe += 1}`);
  fs.mkdirSync(holder, { recursive: true });
  const link = path.join(holder, 'link');
  try {
    make(root, link, 'junction');
  } catch (e) {
    return { id: 'example-workdir-junction', ok: false, name: NAME,
      detail: `a junction (or, on a POSIX host, a symlink) could not be created (${`${e.code || ''} ${e.message}`.trim()}) - on every OS `
        + 'this payload supports that is a broken environment, not an exemption, so this probe FAILS rather than excusing itself' };
  }
  const child = path.join(link, 'pnp-junction-probe');
  const throughTheLink = path.join(root, 'pnp-junction-probe'); // where it would really land
  const r = probe(child);
  const landed = fs.existsSync(throughTheLink);
  const finding = { id: 'example-workdir-junction', name: NAME,
    ok: r.status === 2 && /is refused: it is (inside|an ancestor of) the repository/.test(r.out) && !landed,
    detail: `exit ${r.status}${landed ? ' AND IT CREATED THE DIRECTORY INSIDE THE REPOSITORY' : ''}: ${firstLine(r.out)}` };
  // The LINK is removed with rmdirSync, which never touches what it points at. (Measured: recursive
  // rmSync does not follow a junction either, so the temp-tree cleanup is not a second chance to
  // get this wrong - but this run does not lean on that.)
  try { fs.rmdirSync(link); } catch (e) { try { fs.unlinkSync(link); } catch (e2) { /* the tmp tree removal is the backstop */ } }
  return finding;
}

/**
 * The two file-ownership rules of the cycle driver, EXECUTED.
 *
 * Both are about what happens between "this run wrote a file" and "the cleanup removes it", which
 * in a real run are seventy seconds apart. So the probe takes a throwaway copy of the payload and
 * SHORT-CIRCUITS the cycle body at its first step: the injected lines create the situation and then
 * throw, which still reaches the cleanup - the part under test - about a second later. The injection
 * lives in a temp copy, never in the payload: production carries no test hook.
 */
function shortCircuitedCopy(root, tmpDir, injected) {
  const copy = path.join(tmpDir, `cycle-copy-${exampleProbe += 1}`);
  copyPayloadTree(root, copy);
  const driver = path.join(copy, 'scripts', 'ci', 'run-example-cycle.mjs');
  const src = readText(driver);
  const ANCHOR = "  step('1 - a payload copy and the seed project, both inside the work directory');";
  if (src === null || !src.includes(ANCHOR)) return null;
  fs.writeFileSync(driver, src.replace(ANCHOR, injected.join('\n')));
  return { driver, work: fs.mkdtempSync(path.join(tmpDir, 'cycle-work-')) };
}

function fileOwnershipFindings(root, tmpDir) {
  const out = [];
  const runCopy = (injected) => {
    const built = shortCircuitedCopy(root, tmpDir, injected);
    if (!built) return null;
    const r = spawnSync(process.execPath, [built.driver, '--work-dir', built.work], { encoding: 'utf8' });
    return { status: r.status, out: (r.stdout || '') + (r.stderr || ''), work: built.work };
  };

  // 1. A file that appeared under one of this run's names AFTER the (empty) work directory was
  //    acquired must not be overwritten: the exclusive create refuses and the run bails 2.
  {
    const PLANTED = 'planted by something that is not this run';
    const r = runCopy([
      `  fs.writeFileSync(RESOLUTIONS, '${PLANTED}');`,
      '  writeJsonExclusive(RESOLUTIONS, { probe: true });',
      `  throw new Error('unreachable: the exclusive create must have refused');`,
    ]);
    const survived = r && readText(path.join(r.work, 'resolutions.json'));
    out.push({ id: 'example-cycle-file-exclusive',
      name: "a file that appeared under one of the cycle's own names is REFUSED, never overwritten (exit 2, the bytes intact)",
      ok: !!r && r.status === 2 && /already exists/.test(r.out) && survived === PLANTED,
      detail: r ? `exit ${r.status}, the file now reads ${JSON.stringify(String(survived).slice(0, 40))}: ${firstLine(r.out)}`
        : 'the cycle body could not be short-circuited (its first step line moved)' });
  }

  // 2. A file this run wrote and something else then REPLACED is not the file this run owns: the
  //    cleanup leaves it and reports it, rather than deleting it because the name still matches.
  {
    const REPLACED = 'replaced after this run wrote it';
    const r = runCopy([
      '  const probeHash = writeJsonExclusive(RESOLUTIONS, { probe: true });',
      `  recordCreatedFile('resolutions.json', probeHash);`,
      `  fs.writeFileSync(RESOLUTIONS, '${REPLACED}');`,
      `  throw new Error('ownership probe: stopping once the record exists');`,
    ]);
    const survived = r && readText(path.join(r.work, 'resolutions.json'));
    out.push({ id: 'example-cycle-file-ownership',
      name: 'a recorded file whose bytes changed since this run wrote it is LEFT on disk and reported, not deleted by name',
      ok: !!r && survived === REPLACED && /its bytes changed since this run wrote it/.test(r.out),
      detail: r ? `the file ${survived === REPLACED ? 'survived' : 'was DELETED or changed'}, and the run ${/its bytes changed since this run wrote it/.test(r.out) ? 'reported it' : 'DID NOT REPORT IT'}`
        : 'the cycle body could not be short-circuited (its first step line moved)' });
  }
  return out;
}

let exampleProbe = 0;
/**
 * `guardProbes` runs the EXECUTED half of this section - the cycle driver spawned with a dangerous
 * --work-dir. It is on for the real run and for the pristine control copy, and in the control loop
 * only for the controls that target one of those checks: three extra child processes per findings
 * computation is worth paying twice, not twenty times, and a control that targets a different id
 * never reads them.
 */
function exampleFixtureFindings(root, tmpDir, { guardProbes = true } = {}) {
  const out = [];
  const add = (id, name, ok, detail) => { out.push({ id, name, ok: !!ok, detail: detail || '' }); return !!ok; };

  // --- the four things that must be there ---------------------------------------------------
  const readme = readText(exAt(root, 'README.md'));
  add('example-readme', `${EXAMPLE_REL}/README.md exists`, readme !== null);
  const answers = readJson(exAt(root, 'answers.json'));
  add('example-answers', `${EXAMPLE_REL}/answers.json exists and is valid JSON`, isPlainObject(answers));
  const seedMissing = ['CLAUDE.md', '.claude/settings.json', 'src/hello.mjs']
    .filter((rel) => !fs.existsSync(exAt(root, 'seed', ...rel.split('/'))));
  add('example-seed', `${EXAMPLE_REL}/seed/ carries the pre-existing prose, the foreign permission rule and the VERIFY target`,
    seedMissing.length === 0, seedMissing.length ? `missing ${seedMissing.join(', ')}` : '3 files');

  const bump = readJson(exAt(root, 'bump', 'bump.json'));
  const bumpShapeOk = isPlainObject(bump)
    && Object.keys(bump).sort().join(',') === 'migration,targetPluginVersion'
    && typeof bump.migration === 'string' && typeof bump.targetPluginVersion === 'string';
  add('example-bump-json', `${EXAMPLE_REL}/bump/bump.json carries exactly {migration, targetPluginVersion}`,
    bumpShapeOk, isPlainObject(bump) ? Object.keys(bump).join(', ') : 'not an object');

  const migrationId = bumpShapeOk ? bump.migration : '';
  const ops = readJson(exAt(root, 'bump', migrationId, 'ops.json'));
  const notes = readText(exAt(root, 'bump', migrationId, 'NOTES.md'));
  add('example-bump-migration', `${EXAMPLE_REL}/bump/<migration>/ has ops.json + NOTES.md, both agreeing with bump.json`,
    isPlainObject(ops) && notes !== null && ops.migration === migrationId && ops.targetPluginVersion === (bump || {}).targetPluginVersion,
    isPlainObject(ops) ? `ops declares ${ops.migration} -> ${ops.targetPluginVersion}` : 'ops.json missing or unparseable');

  const opList = (isPlainObject(ops) && Array.isArray(ops.operations)) ? ops.operations : [];
  const usedTypes = new Set(opList.filter(isPlainObject).map((o) => o.op));
  const missingTypes = OP_TYPES.filter((t) => !usedTypes.has(t));
  add('example-bump-ops-types', 'the example migration exercises ALL FOUR operation types, so a reader sees the whole vocabulary',
    missingTypes.length === 0, missingTypes.length ? `missing ${missingTypes.join(', ')}` : `${opList.length} operations`);

  // --- the bump is a plausible NEXT release ---------------------------------------------------
  // The predecessor rule, phrased exactly as validate-payload phrases an appended entry: the id is
  // NNNN_<slug>, the entry numbered NNNN-1 really exists in the manifest, and the target version is
  // strictly greater than that entry's.
  const manifest = readJson(path.join(root, 'migrations', 'index.json'));
  const idMatch = MIGRATION_ID_RE.exec(migrationId);
  const number = idMatch ? Number(idMatch[1]) : 0;
  const predecessor = (Array.isArray(manifest) && number >= 2) ? manifest[number - 2] : null;
  add('example-bump-id', 'the bump id is NNNN_<slug> and the manifest entry it declares itself to FOLLOW really exists',
    !!idMatch && isPlainObject(predecessor) && typeof predecessor.id === 'string',
    idMatch ? `${migrationId} follows ${predecessor ? predecessor.id : 'nothing at position ' + (number - 1)}` : `"${migrationId}" is not NNNN_<slug>`);
  add('example-bump-version', 'the bump target version is a plain MAJOR.MINOR.PATCH triple, strictly greater than that entry\'s',
    versionTriple((bump || {}).targetPluginVersion) !== null && isPlainObject(predecessor)
      && versionGreater(bump.targetPluginVersion, predecessor.targetPluginVersion),
    `${(bump || {}).targetPluginVersion} vs ${predecessor ? predecessor.targetPluginVersion : '(no predecessor)'}`);

  // --- the schema half of the same release ----------------------------------------------------
  const schemaKey = readJson(exAt(root, 'bump', 'schema-key.json'));
  const schemaFile = readJson(path.join(root, 'schema', 'aiwf.config.schema.json'));
  const host = (isPlainObject(schemaKey) && isPlainObject(schemaFile) && isPlainObject(schemaFile.properties))
    ? schemaFile.properties[schemaKey.at] : null;
  add('example-bump-schema-key',
    'bump/schema-key.json names a real object block of the payload schema and declares NO default (the migration owns the default)',
    isPlainObject(schemaKey) && typeof schemaKey.property === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(schemaKey.property)
      && isPlainObject(host) && isPlainObject(host.properties)
      && isPlainObject(schemaKey.schema) && typeof schemaKey.schema.type === 'string'
      && schemaKey.schema.default === undefined,
    isPlainObject(schemaKey) ? `${schemaKey.at}.${schemaKey.property}` : 'schema-key.json missing or unparseable');
  const addKeyOp = opList.find((o) => isPlainObject(o) && o.op === 'add-config-key');
  add('example-bump-key-agrees', 'the add-config-key operation adds exactly the key schema-key.json admits',
    !!addKeyOp && isPlainObject(schemaKey) && addKeyOp.path === `${schemaKey.at}.${schemaKey.property}`,
    addKeyOp ? String(addKeyOp.path) : 'no add-config-key operation');

  // --- the answers file really satisfies the shipped schema ------------------------------------
  {
    const probe = path.join(tmpDir, `example-answers-${exampleProbe += 1}.json`);
    let ok = false;
    let detail = 'answers.json is not an object';
    if (isPlainObject(answers)) {
      fs.writeFileSync(probe, JSON.stringify(Object.assign({}, answers, { _aiwf: PROBE_AIWF }), null, 2));
      const r = spawnSync(process.execPath, [
        path.join(root, 'scripts', 'setup', 'validate-config.mjs'), probe,
        '--schema', path.join(root, 'schema', 'aiwf.config.schema.json'),
      ], { encoding: 'utf8' });
      ok = r.status === 0;
      detail = ok ? '' : `validator exit ${r.status}: ${(r.stderr || '').trim().split('\n').slice(0, 3).join(' | ').slice(0, 220)}`;
    }
    add('example-answers-valid', `${EXAMPLE_REL}/answers.json satisfies schema/aiwf.config.schema.json`, ok, detail);
  }

  // --- the POSIX answers file: the same data, one key apart ------------------------------------
  // The CI matrix runs the cycle twice, and the second run is only worth anything if its answers
  // differ in the OS CHANNEL and in nothing else - otherwise a difference nobody intended (a role
  // moved to another engine, a path renamed) would quietly make the two legs test two products.
  {
    const linux = readJson(exAt(root, 'answers-linux.json'));
    add('example-answers-linux', `${EXAMPLE_REL}/answers-linux.json exists, is valid JSON, and declares os=linux`,
      isPlainObject(linux) && linux.os === 'linux', isPlainObject(linux) ? `os=${linux.os}` : 'missing or unparseable');
    const differences = (a, b, prefix = '') => {
      const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
      const out = [];
      for (const key of keys) {
        const left = (a || {})[key];
        const right = (b || {})[key];
        if (isPlainObject(left) && isPlainObject(right)) { out.push(...differences(left, right, `${prefix}${key}.`)); continue; }
        if (JSON.stringify(left) !== JSON.stringify(right)) out.push(`${prefix}${key}`);
      }
      return out;
    };
    const diff = (isPlainObject(answers) && isPlainObject(linux)) ? differences(answers, linux) : ['(one of the files is unreadable)'];
    add('example-answers-linux-parity', 'answers-linux.json differs from answers.json in the OS channel and NOTHING else',
      diff.length === 1 && diff[0] === 'os', diff.length ? `differs in: ${diff.join(', ')}` : 'the two files are identical - the linux leg would test the windows channel');
    const probe = path.join(tmpDir, `example-answers-linux-${exampleProbe += 1}.json`);
    let ok = false;
    let detail = 'answers-linux.json is not an object';
    if (isPlainObject(linux)) {
      fs.writeFileSync(probe, JSON.stringify(Object.assign({}, linux, { _aiwf: PROBE_AIWF }), null, 2));
      const r = spawnSync(process.execPath, [
        path.join(root, 'scripts', 'setup', 'validate-config.mjs'), probe,
        '--schema', path.join(root, 'schema', 'aiwf.config.schema.json'),
      ], { encoding: 'utf8' });
      ok = r.status === 0;
      detail = ok ? '' : `validator exit ${r.status}: ${(r.stderr || '').trim().split('\n').slice(0, 3).join(' | ').slice(0, 220)}`;
    }
    add('example-answers-linux-valid', `${EXAMPLE_REL}/answers-linux.json satisfies schema/aiwf.config.schema.json`, ok, detail);
  }

  // --- docs cannot drift from code -------------------------------------------------------------
  const driverRel = 'scripts/ci/run-example-cycle.mjs';
  const driver = readText(path.join(root, ...driverRel.split('/')));
  const declared = documentedCommands(driver);
  const shown = readmeCommands(readme);
  add('example-driver-commands', `${driverRel} declares its DOCUMENTED_COMMANDS block`,
    Array.isArray(declared) && declared.length > 0, declared ? `${declared.length} commands` : 'no DOCUMENTED_COMMANDS array found');
  {
    const set = new Set(declared || []);
    const undocumented = shown.placeholder.filter((line) => !set.has(line));
    // An EMPTY set of shown commands is not agreement - it is a README that documents nothing, and
    // 'none of zero commands disagreed' must never read as a pass.
    add('example-readme-in-driver', 'every command the example README shows is one the cycle driver really runs',
      Array.isArray(declared) && shown.placeholder.length > 0 && undocumented.length === 0,
      undocumented.length ? undocumented[0].slice(0, 150)
        : (shown.placeholder.length === 0 ? 'the README shows NO commands at all' : `${shown.placeholder.length} commands`));
    const shownSet = new Set(shown.placeholder);
    const unshown = (declared || []).filter((line) => !shownSet.has(line));
    add('example-driver-in-readme', 'every command the cycle driver runs is shown in the example README',
      Array.isArray(declared) && declared.length > 0 && unshown.length === 0,
      unshown.length ? unshown[0].slice(0, 150)
        : (!declared || declared.length === 0 ? 'the driver declares NO commands at all' : `${declared.length} commands`));
  }
  {
    const scripts = shown.placeholder.concat(shown.plain)
      .map((line) => stripPlaceholders(line.split(' ')[1] || ''))
      .filter((s) => s !== '');
    const dangling = scripts.filter((s) => !fs.existsSync(path.join(root, ...s.split('/'))));
    add('example-readme-scripts-exist', 'every script the example README invokes exists in the payload',
      scripts.length > 0 && dangling.length === 0,
      dangling.length ? dangling.join(', ') : (scripts.length === 0 ? 'the README invokes NO scripts at all' : `${scripts.length} scripts`));
  }

  // --- the CI workflow ---------------------------------------------------------------------------
  const workflowRel = '.github/workflows/ci.yml';
  const workflow = readText(path.join(root, ...workflowRel.split('/')));
  const runScripts = [...String(workflow || '').matchAll(/^\s*run:\s*node\s+(\S+)/gm)].map((m) => m[1]);
  add('example-ci-workflow', `${workflowRel} exists and runs at least one node step`,
    workflow !== null && runScripts.length > 0, workflow === null ? 'missing' : `${runScripts.length} node steps`);
  {
    const dangling = runScripts.filter((s) => !fs.existsSync(path.join(root, ...s.split('/'))));
    add('example-ci-steps', 'every CI step command names a script that really exists',
      workflow !== null && runScripts.length > 0 && dangling.length === 0,
      dangling.length ? dangling.join(', ') : (runScripts.length === 0 ? 'the workflow runs NO node steps at all' : `${runScripts.length} steps resolved`));
  }
  {
    // EVERY gate, the spikes included, IN EVERY OS LEG. A list that omits one turns "the workflow
    // explains why it runs the spikes" into the only thing standing between the repository and a
    // silently deleted step: the `run:` line goes, the comment stays, and both this check and
    // example-ci-omissions report green about a gate that no longer exists.
    //
    // Per JOB, not per file, and that is the whole point since the matrix arrived: a gate that
    // survives in one leg while being dropped from another would satisfy a whole-file check while
    // the channel that leg exists to cover goes untested.
    const REQUIRED_GATES = [
      'scripts/update/validate-payload.mjs', 'scripts/setup/test-setup.mjs', 'scripts/update/test-update.mjs',
      'scripts/spike/run-spikes.mjs', 'scripts/ci/run-example-cycle.mjs', 'scripts/selfcheck/aiwf-selfcheck.js',
    ];
    const REQUIRED_JOBS = ['windows', 'ubuntu', 'macos'];
    const jobs = workflowJobs(workflow);
    add('example-ci-os-matrix', 'CI runs one leg per shipped OS channel (windows, ubuntu, macos), each on its own runner',
      REQUIRED_JOBS.every((j) => jobs.has(j) && new RegExp(`runs-on:\\s*${j}-latest`).test(jobs.get(j))),
      `jobs: ${[...jobs.keys()].join(', ') || '(none parsed)'}`);
    const absent = [];
    for (const job of REQUIRED_JOBS) {
      const body = jobs.get(job);
      if (body === undefined) { absent.push(`${job}: the whole job`); continue; }
      const ran = [...body.matchAll(/^\s*run:\s*node\s+(\S+)/gm)].map((m) => m[1]);
      for (const gate of REQUIRED_GATES) if (!ran.includes(gate)) absent.push(`${job}: ${gate}`);
    }
    add('example-ci-gates', 'EVERY OS leg runs every gate this repository has (payload validator, both suites, the hook spikes, the example cycle, the self-check)',
      workflow !== null && absent.length === 0,
      absent.length ? `not run: ${absent.join(', ')}` : `${REQUIRED_GATES.length} gates x ${REQUIRED_JOBS.length} legs`);
  }
  add('example-ci-omissions', 'the workflow WRITES DOWN every decision it would otherwise make silently (claude plugin validate, the spikes\' reference, shellcheck on macos)',
    workflow !== null && /claude plugin validate/.test(workflow) && /run-spikes\.mjs/.test(workflow)
      && /--reference|PNP_SPIKE_REFERENCE_HOOKS/.test(workflow)
      // The third omission is asserted IN THE LEG IT BELONGS TO: a sentence about shellcheck
      // anywhere in the file would also be satisfied by the ubuntu step that really runs it.
      && /shellcheck/.test(workflowJobs(workflow).get('macos') || '')
      && /NOT preinstalled/.test(workflowJobs(workflow).get('macos') || ''),
    workflow === null ? 'missing' : '');
  {
    // shellcheck runs in CI and NOT in the self-check, deliberately: it is not on an operator
    // machine, so a self-check section that needed it would be red on every local run. The
    // workflow is where that decision has to be visible.
    const ubuntu = workflowJobs(workflow).get('ubuntu') || '';
    add('example-ci-shellcheck', 'the ubuntu leg lints the bash wrappers with shellcheck (the one gate that exists only there)',
      /run:\s*shellcheck\s+scripts\/native\/sh\/\*\.sh/.test(ubuntu),
      ubuntu ? '' : 'no ubuntu job parsed');
  }

  // --- the cycle driver's work-directory guard, EXECUTED ---------------------------------------
  // The driver REMOVES its work directory when it finishes, so a --work-dir it should have refused
  // is a delete-the-repository bug, not a tidiness one. That makes the guard payload behaviour in
  // the same class as the hooks and the role resolver, and it is proven the same way: the real
  // entrypoint is spawned, and the refusal is read off the exit code, the reason it printed, and
  // the filesystem afterwards. A guard asserted by reading its source would only prove the source
  // says so.
  if (guardProbes) {
    const driver = path.join(root, 'scripts', 'ci', 'run-example-cycle.mjs');
    const probe = (badDir) => {
      const r = spawnSync(process.execPath, [driver, '--work-dir', badDir], { encoding: 'utf8' });
      return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
    };

    {
      const target = path.join(root, 'examples', 'example-project', 'pnp-workdir-probe');
      const r = probe(target);
      const created = fs.existsSync(target);
      add('example-workdir-inside',
        'the cycle driver REFUSES a --work-dir inside the repository: exit 2, the reason named, nothing created',
        r.status === 2 && /is inside the repository/.test(r.out) && !created,
        `exit ${r.status}${created ? ' AND IT CREATED THE DIRECTORY' : ''}: ${firstLine(r.out)}`);
    }
    {
      const target = path.dirname(root);
      const before = safeReaddir(target);
      const r = probe(target);
      const now = safeReaddir(target);
      // A listing this run could not read is NOT evidence that nothing appeared. Without both
      // listings the 'nothing created' half is unproven, so the check fails rather than passing on
      // an empty array that only means 'we could not look'.
      const listed = before !== null && now !== null;
      const appeared = listed ? now.filter((n) => !before.includes(n)) : null;
      add('example-workdir-ancestor',
        'the cycle driver REFUSES a --work-dir that is an ANCESTOR of the repository: exit 2, the reason named, nothing created',
        r.status === 2 && /is an ancestor of the repository/.test(r.out) && listed && appeared.length === 0,
        `exit ${r.status}${!listed ? ' BUT THE DIRECTORY COULD NOT BE LISTED, so nothing-created is unproven' : (appeared.length ? ' AND IT CREATED ' + appeared.join(', ') : '')}: ${firstLine(r.out)}`);
    }
    {
      const target = path.join(tmpDir, `workdir-probe-${exampleProbe += 1}`);
      const foreign = path.join(target, 'not-mine.txt');
      fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(foreign, 'a file that was in this directory first\n');
      // The foreign file's RAW BYTES, not just its name: a driver that truncated or rewrote it in
      // place would leave the listing identical, and "the directory untouched" would be a sentence
      // about names rather than about contents.
      const bytesBefore = sha256Bytes(fs.readFileSync(foreign));
      const r = probe(target);
      const after = safeReaddir(target); // null = could not be listed, which is not 'unchanged'
      const bytesAfter = fs.existsSync(foreign) ? sha256Bytes(fs.readFileSync(foreign)) : null;
      add('example-workdir-nonempty',
        'the cycle driver REFUSES an existing NON-EMPTY --work-dir: exit 2, the reason named, the foreign file byte-for-byte untouched',
        r.status === 2 && /is not empty/.test(r.out) && after !== null && after.join(',') === 'not-mine.txt' && bytesAfter === bytesBefore,
        `exit ${r.status}, the directory now holds [${after === null ? '(could not be listed)' : after.join(', ')}]${bytesAfter === bytesBefore ? '' : ', AND ITS CONTENT CHANGED'}: ${firstLine(r.out)}`);
    }
    {
      // A JUNCTION outside the repository that points INTO it, with a child that does not exist yet.
      // As a string the child is harmless; a non-recursive mkdir still follows the junction and
      // lands inside the repository, which is why the guard canonicalizes through the nearest
      // EXISTING ancestor instead of comparing text.
      out.push(junctionProbeFinding(root, tmpDir, probe));
    }
    {
      // A --work-dir whose PARENT does not exist. Nothing above the work directory may ever be
      // created, because the cleanup removes only the work directory itself and anything conjured
      // above it would silently outlive the run.
      const parent = path.join(tmpDir, `workdir-missing-parent-${exampleProbe += 1}`);
      const target = path.join(parent, 'work');
      const r = probe(target);
      add('example-workdir-missing-parent',
        'the cycle driver REFUSES a --work-dir whose parent does not exist: exit 2, the reason named, and the parent is not conjured up either',
        r.status === 2 && /parent directory does not exist/.test(r.out) && !fs.existsSync(parent) && !fs.existsSync(target),
        `exit ${r.status}${fs.existsSync(parent) ? ' AND IT CREATED THE MISSING PARENT' : ''}: ${firstLine(r.out)}`);
    }
    {
      // The --answers guard, EXECUTED, and in the same class as the --work-dir guards above: a
      // flag that silently fell back to the DEFAULT answers file would make the POSIX CI legs run
      // the windows channel and report green about a channel they never touched. Both probes are
      // refused before the run creates anything, so neither starts a real cycle.
      const answersProbe = (argv) => {
        const r = spawnSync(process.execPath, [driver, ...argv], { encoding: 'utf8' });
        return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
      };
      const terminal = answersProbe(['--answers']);
      add('example-answers-flag-guard',
        'the cycle driver REFUSES a --answers with no value: exit 2 and the reason named, never a silent fall back to the default answers file',
        terminal.status === 2 && /--answers was passed without a value/.test(terminal.out),
        `exit ${terminal.status}: ${firstLine(terminal.out)}`);
      // The EMPTY value is its own probe, and it has to be: `--answers ""` is falsy exactly like an
      // absent flag, so one `flag(...) || <default>` reading covers both - and the empty one then
      // runs a full cycle on the DEFAULT answers file while the caller believes they selected
      // another channel. Absent and empty are different inputs and are asserted separately.
      const empty = answersProbe(['--answers', '']);
      add('example-answers-empty-guard',
        'the cycle driver REFUSES an EMPTY --answers value: exit 2 and the reason named, never read as "no flag"',
        empty.status === 2 && /--answers was passed an EMPTY value/.test(empty.out),
        `exit ${empty.status}: ${firstLine(empty.out)}`);
      const notAFile = answersProbe(['--answers', path.join(root, 'examples', 'example-project')]);
      add('example-answers-file-guard',
        'the cycle driver REFUSES a --answers that exists but is not a regular file: exit 2, the reason named',
        notAFile.status === 2 && /is not a regular file/.test(notAFile.out),
        `exit ${notAFile.status}: ${firstLine(notAFile.out)}`);
    }
    // The two file-ownership rules, executed against a short-circuited copy so the cleanup is
    // reached in about a second rather than seventy.
    for (const f of fileOwnershipFindings(root, tmpDir)) out.push(f);
  }

  return out;
}

function copyPayloadTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyPayloadTree(s, d); else fs.copyFileSync(s, d);
  }
}

// One control per assertion above. Each names the check `id` it must break, exactly like the
// project-layer controls: a control that stops targeting a live check fails loudly rather than
// quietly proving nothing.
const EXAMPLE_CONTROLS = [
  { id: 'example-readme', label: 'the example README deleted',
    apply: (r) => fs.rmSync(exAt(r, 'README.md')) },
  { id: 'example-answers', label: 'answers.json corrupted',
    apply: (r) => fs.writeFileSync(exAt(r, 'answers.json'), '{ not json ') },
  { id: 'example-seed', label: 'the VERIFY command target removed from the seed project',
    apply: (r) => fs.rmSync(exAt(r, 'seed', 'src', 'hello.mjs')) },
  { id: 'example-bump-json', label: 'an extra field smuggled into bump.json',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', 'bump.json'], (b) => { b.extra = 'nope'; }) },
  { id: 'example-bump-migration', label: 'the migration ops.json claims another migration id',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', '0002_example-bump', 'ops.json'], (o) => { o.migration = '0009_other'; }) },
  { id: 'example-bump-ops-types', label: 'the note operation dropped, so one op type is undemonstrated',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', '0002_example-bump', 'ops.json'],
      (o) => { o.operations = o.operations.filter((x) => x.op !== 'note'); }) },
  { id: 'example-bump-id', label: 'the bump renumbered so it follows a manifest entry that does not exist',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', 'bump.json'], (b) => { b.migration = '0009_example-bump'; }) },
  { id: 'example-bump-version', label: 'the bump target version no longer rises above its predecessor',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', 'bump.json'], (b) => { b.targetPluginVersion = '0.0.1'; }) },
  { id: 'example-bump-schema-key', label: 'schema-key.json points at a schema block that does not exist',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', 'schema-key.json'], (s) => { s.at = 'notABlock'; }) },
  { id: 'example-bump-schema-key', label: 'schema-key.json declares a default, which would make the migration a no-op on a fresh install',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', 'schema-key.json'], (s) => { s.schema.default = true; }) },
  { id: 'example-bump-key-agrees', label: 'the migration adds a different key from the one the schema admits',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'bump', '0002_example-bump', 'ops.json'],
      (o) => { o.operations.find((x) => x.op === 'add-config-key').path = 'enforcement.somethingElse'; }) },
  { id: 'example-answers-valid', label: 'the answers file pinned to an OS channel that does not exist',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'answers.json'], (a) => { a.os = 'solaris'; }) },
  { id: 'example-answers-linux', label: 'the POSIX answers file deleted',
    apply: (r) => fs.rmSync(exAt(r, 'answers-linux.json')) },
  { id: 'example-answers-linux', label: 'the POSIX answers file quietly moved back to the windows channel',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'answers-linux.json'], (a) => { a.os = 'windows'; }) },
  { id: 'example-answers-linux-parity', label: 'a second, unintended difference smuggled into the POSIX answers file',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'answers-linux.json'], (a) => { a.roles.qa.engine = 'codex'; }) },
  { id: 'example-answers-linux-valid', label: 'the POSIX answers file violating the schema',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'answers-linux.json'], (a) => { a.roles.reviewer.model = 'claude-opus-5[1m]'; }) },
  { id: 'example-answers-valid', label: 'a claude-hosted role in the answers pinned to a full model id',
    apply: (r) => mutateJson(r, ['examples', 'example-project', 'answers.json'], (a) => { a.roles.reviewer.model = 'claude-opus-5[1m]'; }) },
  { id: 'example-driver-commands', label: 'the driver\'s DOCUMENTED_COMMANDS block renamed',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /export const DOCUMENTED_COMMANDS = \[/, 'export const SOMETHING_ELSE = [') },
  { id: 'example-readme-in-driver', label: 'the README shows a command the driver never runs',
    apply: (r) => fs.appendFileSync(exAt(r, 'README.md'), '\n```\nnode <payload2>/scripts/update/aiwf-update.mjs --apply --plugin-root <payload2> --force\n```\n') },
  { id: 'example-driver-in-readme', label: 'a command the driver runs is dropped from the README',
    apply: (r) => patchText(r, ['examples', 'example-project', 'README.md'],
      /^node <payload2>\/scripts\/update\/validate-payload\.mjs --plugin-root <payload2>$/m, '(this step is no longer documented)') },
  { id: 'example-readme-scripts-exist', label: 'the README invokes a script that is not in the payload',
    apply: (r) => fs.appendFileSync(exAt(r, 'README.md'), '\n```\nnode scripts/ci/run-something-else.mjs\n```\n') },
  { id: 'example-ci-steps', label: 'a CI step renamed to a script that does not exist',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /run: node scripts\/setup\/test-setup\.mjs/, 'run: node scripts/setup/test-setup-v2.mjs') },
  { id: 'example-ci-gates', label: 'a gate quietly dropped from CI',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /run: node scripts\/ci\/run-example-cycle\.mjs/, 'run: node --version') },
  // The same sabotage one leg further down: a gate that survives on windows while quietly leaving
  // the ubuntu leg is invisible to any check phrased over the whole file.
  { id: 'example-ci-gates', label: 'a gate dropped from the ubuntu leg only, while windows keeps it',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'],
      /(runs-on: ubuntu-latest[\s\S]*?)run: node scripts\/update\/test-update\.mjs/, '$1run: node --version') },
  { id: 'example-ci-os-matrix', label: 'the macos leg deleted, so one shipped channel is no longer exercised',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /\n {2}macos:[\s\S]*$/, '\n') },
  { id: 'example-ci-shellcheck', label: 'the shellcheck step dropped from the ubuntu leg',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /run: shellcheck scripts\/native\/sh\/\*\.sh/, 'run: true') },
  { id: 'example-ci-omissions', label: 'the written-down shellcheck omission stripped out of the macos leg',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /NOT preinstalled/, 'unavailable') },
  // The spikes' own control, and the reason the list above must be complete: ONLY the `run:` line
  // is deleted, so the step's explanatory comment survives untouched and example-ci-omissions stays
  // green. If example-ci-gates did not name the spikes, this sabotage would be invisible.
  { id: 'example-ci-gates', label: 'the spike step\'s run: line deleted while its explanatory comment stays',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /\n[ \t]*run: node scripts\/spike\/run-spikes\.mjs\n/, '\n') },
  { id: 'example-ci-omissions', label: 'the written-down omissions stripped out of the workflow',
    apply: (r) => patchText(r, ['.github', 'workflows', 'ci.yml'], /claude plugin validate/g, 'that other command') },
  { id: 'example-ci-workflow', label: 'the workflow file deleted',
    apply: (r) => fs.rmSync(path.join(r, '.github', 'workflows', 'ci.yml')) },
  // The guard's controls. Both sabotage the payload copy's driver and both keep the sabotaged run
  // CHEAP - it still refuses immediately, so no control here ever starts a 70-second cycle.
  //
  // PREDICATE level: with the ancestor rule gone, the repository's parent is caught by the
  // "not empty" rule instead. Still exit 2, still nothing created - but the reason is now wrong,
  // and a guard that refuses for the wrong reason tells the operator nothing about the danger.
  { id: 'example-workdir-ancestor', label: 'the ancestor-of-the-repository predicate deleted from the driver\'s guard',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'],
      /^ {2}if \(isInside\(real, repo\)\) return `it is an ancestor of the repository, \$\{removed\}`;$/m,
      '  // (predicate deleted by a self-check negative control)') },
  // CONTRACT level: the guard still refuses, but with the wrong exit code. Callers - CI included -
  // branch on 2 meaning "could not start"; a refusal that exits 1 is indistinguishable from a cycle
  // that ran and failed.
  { id: 'example-workdir-inside', label: 'the guard refuses but exits 1 instead of 2 (the could-not-start contract broken)',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /process\.exit\(2\);/, 'process.exit(1);') },
  { id: 'example-workdir-nonempty', label: 'the guard refuses but exits 1 instead of 2 (the could-not-start contract broken)',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /process\.exit\(2\);/, 'process.exit(1);') },
  // CONTENT level: the driver rewrites the foreign file in place and then refuses exactly as before
  // - same names in the directory, same exit code. Only a check that compares BYTES can see it.
  { id: 'example-workdir-nonempty', label: 'the driver rewrites the foreign file in place, keeping its name and the exit code',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /^ {4}if \(entries\.length\) \{$/m,
      "    if (entries.length) { fs.writeFileSync(path.join(dir, entries[0]), 'clobbered by a self-check negative control');") },
  // The junction probe's control is PREDICATE level and stays cheap: with the walk-up deleted,
  // canonicalize degrades to the textual path for anything that does not exist yet, the junction's
  // child passes the first layer, and only the post-creation layer catches it - so the run still
  // refuses immediately, but no longer with the up-front reason the probe requires.
  { id: 'example-workdir-junction', label: 'the canonicalize walk-up deleted, so a not-yet-existing path is judged as text',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /^ {2}let cursor = path\.resolve\(p\);$/m,
      '  let cursor = path.resolve(p); if (!fs.existsSync(cursor)) return cursor; // (walk deleted by a negative control)') },
  // FILE OWNERSHIP. Both stay cheap: the probes they target short-circuit the cycle body.
  { id: 'example-cycle-file-exclusive', label: 'the exclusive create weakened to a plain overwrite (wx -> w)',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /\{ flag: 'wx' \}/, "{ flag: 'w' }") },
  { id: 'example-cycle-file-ownership', label: 'the cleanup goes back to removing recorded FILES by name, without checking their bytes',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /if \(now !== entry\.hash\) \{/, 'if (false) {') },
  { id: 'example-workdir-missing-parent', label: 'the missing-parent branch removed, so the refusal no longer names the reason',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /if \(e\.code === 'ENOENT'\) \{/, 'if (false) {') },
  // The --answers guards, at CONTRACT level (the refusal must name its reason) rather than by
  // deleting the predicate: a driver that stopped refusing would fall through to a real 70-second
  // cycle inside a negative control, which is a price this section deliberately never pays.
  { id: 'example-answers-flag-guard', label: 'the value-less --answers refusal stops naming its reason',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /--answers was passed without a value/, 'that argument is odd') },
  { id: 'example-answers-file-guard', label: 'the not-a-regular-file refusal stops naming its reason',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /is not a regular file/, 'is unusable') },
  // The empty-value control is PREDICATE level, not message level, and it can afford to be
  // (measured, not assumed): with the branch gone, `path.resolve('')` becomes the caller's CWD, so
  // the very next guard refuses it as "not a regular file" - exit 2, immediately, no cycle. The
  // check flips because the reason is now WRONG, which is exactly the defect: a guard that refuses
  // for the wrong reason tells the caller nothing about what they typed. (Note what this control
  // does NOT prove: that the empty value would have run a cycle. It would have, when the value was
  // read as `flag(...) || <default>` - that reading is gone, and this is the assertion keeping it
  // gone.)
  { id: 'example-answers-empty-guard', label: 'the empty-value branch deleted, so an empty --answers reads as "no flag" again',
    apply: (r) => patchText(r, ['scripts', 'ci', 'run-example-cycle.mjs'], /if \(ANSWERS_ARG\.trim\(\) === ''\) \{/, 'if (false) {') },
];

function sectionExampleFixture(tmpRoot) {
  section('EXAMPLE FIXTURE - the committed cycle data, its driver and CI cannot drift apart');
  const findings = exampleFixtureFindings(PLUGIN_ROOT, tmpRoot);
  for (const f of findings) {
    if (f.note) { note(f.name, f.detail); continue; }
    check(f.name, f.ok, f.detail);
  }

  section('EXAMPLE FIXTURE CONTROLS - each of those assertions is proven able to FAIL');
  const base = path.join(tmpRoot, 'example-base');
  copyPayloadTree(PLUGIN_ROOT, base);
  const pristine = exampleFixtureFindings(base, tmpRoot);
  const pristineFailures = pristine.filter((f) => !f.note && !f.ok);
  check('the control copy is clean before any sabotage', pristineFailures.length === 0,
    pristineFailures.length ? pristineFailures.map((f) => f.id).join(', ') : `${pristine.length} checks green`);

  // The junction probe's OWN failure branch, exercised in process. A negative control on a payload
  // copy cannot reach it: the copy supplies the driver and the data, while the probe's symlink call
  // belongs to THIS process - so the branch is driven by injecting a symlink that refuses, and the
  // requirement is that the finding comes back a FAILURE, never a NOTE and never a pass.
  {
    const simulated = junctionProbeFinding(
      PLUGIN_ROOT, tmpRoot,
      () => { throw new Error('the probe must not spawn anything on this path'); },
      () => { const e = new Error('simulated: junctions unavailable'); e.code = 'EPERM'; throw e; },
    );
    check('the junction probe FAILS when a junction cannot be created (it never degrades to a NOTE or a pass)',
      simulated.ok === false && simulated.note !== true && /could not be created/.test(simulated.detail)
        && /every OS\s+this payload supports/.test(simulated.detail),
      simulated.note ? 'it produced a NOTE' : `ok=${simulated.ok}`);
  }

  let i = 0;
  const covered = new Set();
  for (const m of EXAMPLE_CONTROLS) {
    const broken = path.join(tmpRoot, `example-neg-${i += 1}`);
    copyPayloadTree(base, broken);
    try { m.apply(broken); } catch (e) { check(`control could be applied: ${m.label}`, false, String(e.message)); continue; }
    const target = exampleFixtureFindings(broken, tmpRoot,
      { guardProbes: m.id.startsWith('example-workdir') || m.id.startsWith('example-cycle-file') || m.id.endsWith('-guard') })
      .find((f) => f.id === m.id);
    if (!target) {
      check(`control "${m.label}" targets a live check (id "${m.id}")`, false, 'no check with that id was produced');
      continue;
    }
    covered.add(m.id);
    check(`sabotage detected [${m.id}]: ${m.label}`, target.ok === false && target.note !== true,
      target.note ? 'the check degraded to a NOTE instead of failing' : (target.ok ? 'still PASS - the check is vacuous' : 'FAIL as required'));
    try { fs.rmSync(broken, { recursive: true, force: true }); } catch (e) { /* best-effort */ }
  }
  for (const id of pristine.filter((f) => !f.note && !covered.has(f.id)).map((f) => f.id)) {
    note(`no negative control for example-fixture check "${id}"`, 'no control defined - add one or state why it cannot fail');
  }
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
    sectionMigrationPayload(tmpRoot);
    sectionHookWiring();
    sectionWrappers();
    sectionShWrappers(tmpRoot);
    sectionResolver(tmpRoot);
    sectionPayloadIntegrity();
    sectionProvenance(tmpRoot);
    sectionExampleFixture(tmpRoot);
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
  console.log('The MIGRATION PAYLOAD is validated at the runner\'s own validator entrypoint, in both directions:');
  console.log('the shipped manifest and every ops.json are accepted, and a gap, a duplicate id, a non-monotonic');
  console.log('version, a last entry that is not the payload version, an orphan directory, an unknown op type or');
  console.log('field, and a traversal path are each REJECTED.');
  console.log('The EXAMPLE FIXTURE - the committed answers file, seed project and simulated version bump under');
  console.log('examples/example-project/ - is asserted as data that cannot rot: the answers really satisfy the');
  console.log('shipped schema (at the validator\'s own entrypoint), the bump is a plausible next release by the');
  console.log('payload validator\'s own id/version rules, the migration demonstrates all four op types, and the');
  console.log('README, the cycle driver and the CI workflow are compared against each other in both directions.');
  console.log('Every one of those assertions has its own negative control on a sabotaged payload copy.');
  console.log('The cycle driver is also EXECUTED there: it is spawned with a --work-dir inside the repository,');
  console.log('one above it, one reached through a junction into it, one that is not empty and one whose parent');
  console.log('does not exist, and each must exit 2 having created nothing - that directory is deleted when the');
  console.log('run ends, so a guard asserted by reading its source would only prove the source says so.');
  console.log('PROVENANCE: every text file of the payload - defined by extension/known name, .git and');
  console.log('node_modules excluded, with an unclassified file, an unreadable file and a directory that');
  console.log('could not be enumerated each counted as a FAILURE rather than skipped (a dropped subtree');
  console.log('leaves every other number in the section plausible) - is');
  console.log('scanned for the origin project\'s names (held as digests, never as text), for email');
  console.log('addresses, for Cyrillic code points and for drive-letter absolute paths outside a per-file');
  console.log('allowlist. Each of those has its own negative control on a sabotaged payload copy; the');
  console.log('needles themselves are exercised on constructed input, since a pattern that matches nothing');
  console.log('reports the same "0 hits" as a clean payload. What is NOT proven: that the three name');
  console.log('digests have the preimages they claim - a payload that must not contain those names cannot');
  console.log('carry the proof, so the controls prove the mechanism and the digests are stated data.');
  console.log('STATIC: the wrapper flag locks, asserted as exact ARGV PAIRS rather than bare words (so a');
  console.log('flag switched in the argv while the old word survives in a comment still fails), the hook');
  console.log('wiring, the wrapper sources of BOTH channels (ASCII-only everywhere, LF-only for the bash');
  console.log('one, counted at byte level), and the payload cross-references.');
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
