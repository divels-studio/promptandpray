#!/usr/bin/env node
/*
 * P0 spike (level a) — direct-invocation proof for the two PreToolUse gates.
 *
 * Runs realistic PreToolUse payloads through the hooks as the harness would: one child process per
 * payload, JSON on stdin, decision read back from stdout. Nothing is mocked - the shipped hook files
 * are the code under test.
 *
 * Two things are proven:
 *   1. EXPECTATION  - every payload produces the decision this table says it must.
 *   2. PARITY       - for Gate 1, the plugin copy produces the IDENTICAL decision AND the identical
 *                     reason text as the reference implementation it was ported from. The reference
 *                     directory is passed with --reference <dir> (or PNP_SPIKE_REFERENCE_HOOKS); when
 *                     it is absent, the parity column reports SKIP and only (1) is enforced.
 *
 * Gate 2 has no reference implementation to compare against (the reference project's Agent-tool hook
 * answers a different question), so it is asserted against the expectation table only. The Gate 3
 * TOGGLE and Gate 2 MODE tables are in the same position for the opposite reason: the reference
 * predates `enforcement.routeWriteGuard` and `enforcement.dispatchGate`, so a parity comparison there
 * would flag the intended change as a divergence. Everything the reference DOES implement stays under
 * parity, in gate1Cases.
 *
 * Payload shapes are NOT invented: the two `capture:` fixtures below are raw PreToolUse inputs
 * recorded from a live harness run and published in the porting project's plan record; the rest are
 * the same envelope with the identity/dispatch fields varied.
 *
 * Exit 0 = every assertion passed. Exit 1 = at least one failed. Exit 2 = the spike could not run.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(HERE, '..', '..');
const PLUGIN_HOOKS = path.join(PLUGIN_ROOT, 'scripts', 'engine');

const GATE1 = 'pretooluse-mutation-guard.js';
const GATE2 = 'pretooluse-dispatch-gate.js';

// ---- reference implementation (optional) -----------------------------------
function referenceDir() {
  const i = process.argv.indexOf('--reference');
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  const env = process.env.PNP_SPIKE_REFERENCE_HOOKS;
  if (env && env.trim() !== '') return env.trim();
  return null;
}
const REFERENCE = referenceDir();
const referenceGate1 = REFERENCE ? path.join(REFERENCE, GATE1) : null;
const referenceAvailable = referenceGate1 !== null && fs.existsSync(referenceGate1);

// ---- running a hook the way the harness does -------------------------------
// Returns a stable, comparable decision record: what the hook told the harness to do, and why.
//
// THE PROCESS IS CLASSIFIED BEFORE ITS OUTPUT, and that order is load-bearing. A PreToolUse hook
// speaks through its exit code first: every decision path in these hooks ends in `process.exit(0)`,
// so a non-zero exit (or a signal, or a failed spawn) means the hook DIED — a require() that throws
// at load time, a syntax error, a missing file. Such a process also prints nothing on stdout, and
// empty stdout is exactly how a hook says "allow, passthrough". Classifying output first would
// therefore score a CRASHED gate as a silent ALLOW: the most dangerous false green a spike like this
// can produce. So a bad exit becomes CRASH(...) here, matches no expectation anywhere, and fails its
// case — and every case additionally asserts exit 0 explicitly, for the plugin and the reference.
function runHook(hookPath, payload, projectDir) {
  const env = { ...process.env };
  if (projectDir) env.CLAUDE_PROJECT_DIR = projectDir;
  else delete env.CLAUDE_PROJECT_DIR;

  const res = spawnSync(process.execPath, [hookPath], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
    env,
  });
  const stderr = (res.stderr || '').trim();

  if (res.error) return { decision: 'CRASH(spawn)', reason: String(res.error.message), exit: null };
  if (res.signal) return { decision: `CRASH(signal=${res.signal})`, reason: stderr, exit: null };
  if (res.status !== 0) return { decision: `CRASH(exit=${res.status})`, reason: stderr, exit: res.status };

  const out = (res.stdout || '').trim();
  if (out === '') return { decision: 'allow(passthrough)', reason: '', exit: res.status };
  let parsed;
  try {
    parsed = JSON.parse(out);
  } catch {
    return { decision: 'UNPARSEABLE', reason: out, exit: res.status };
  }
  const h = parsed && parsed.hookSpecificOutput;
  if (!h || typeof h.permissionDecision !== 'string') {
    return { decision: 'UNEXPECTED-SHAPE', reason: out, exit: res.status };
  }
  return { decision: h.permissionDecision, reason: h.permissionDecisionReason || '', exit: res.status };
}

// ---- fixtures --------------------------------------------------------------
// A write-class PreToolUse envelope; identity fields are spread in per case.
const writeEnvelope = (identity, filePath) => ({
  session_id: '02a3eeba-ff69-4daa-94be-329a7a5036c1',
  cwd: 'C:\\work\\demo',
  permission_mode: 'acceptEdits',
  ...identity,
  hook_event_name: 'PreToolUse',
  tool_name: 'Write',
  tool_input: { file_path: filePath, content: 'PROBE' },
  tool_use_id: 'toolu_0115iTt4t3NCUBWADAYd3j4u',
});

// Two project-dir fixtures for the route-state half of Gate 1. Created fresh, removed at the end.
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pnp-spike-'));
const projectNoTicket = path.join(tmpRoot, 'no-ticket');
const projectOpenTicket = path.join(tmpRoot, 'open-ticket');
fs.mkdirSync(projectNoTicket, { recursive: true });
fs.mkdirSync(path.join(projectOpenTicket, '.aiwf'), { recursive: true });
fs.writeFileSync(
  path.join(projectOpenTicket, '.aiwf', 'route-state.json'),
  JSON.stringify({ route: 'R2', ticket: 'DEMO-1' }),
);

// Raw payloads captured from a live harness run (see the header note), replayed verbatim except for
// the file path, which is rewritten onto the fixture project dir so the run is machine-independent.
const capturedWriter = {
  session_id: '02a3eeba-ff69-4daa-94be-329a7a5036c1',
  cwd: projectNoTicket,
  permission_mode: 'acceptEdits',
  agent_id: 'ae88133a2c5d164f2',
  agent_type: 'writer',
  effort: { level: 'medium' },
  hook_event_name: 'PreToolUse',
  tool_name: 'Write',
  tool_input: { file_path: path.join(projectNoTicket, 'src', 'probe.txt'), content: 'PROBE_WRITER_OK' },
  tool_use_id: 'toolu_0115iTt4t3NCUBWADAYd3j4u',
};
const capturedNonWriter = {
  session_id: 'f8bcc49e-65da-4f4d-a0f6-ef191baebb65',
  cwd: projectNoTicket,
  permission_mode: 'acceptEdits',
  agent_id: 'af7e5c7fab2f7c140',
  agent_type: 'general-purpose',
  hook_event_name: 'PreToolUse',
  tool_name: 'Write',
  tool_input: { file_path: path.join(projectNoTicket, 'src', 'probe.txt'), content: 'PROBE_NONWRITER' },
  tool_use_id: 'toolu_01DVGHm7see8dGipHXdEM6L8',
};

const srcFile = path.join(projectNoTicket, 'src', 'probe.txt');
const srcFileOpen = path.join(projectOpenTicket, 'src', 'probe.txt');
const docFileOpen = path.join(projectOpenTicket, 'docs', 'note.md');

const gate1Cases = [
  { name: 'capture: live Writer subagent payload', projectDir: projectNoTicket, payload: capturedWriter, expect: 'allow(passthrough)' },
  { name: 'capture: live general-purpose subagent payload', projectDir: projectNoTicket, payload: capturedNonWriter, expect: 'deny' },
  { name: 'main session (no identity fields), no ticket open', projectDir: projectNoTicket, payload: writeEnvelope({}, srcFile), expect: 'allow(passthrough)' },
  { name: 'subagent reviewer', projectDir: projectNoTicket, payload: writeEnvelope({ agent_id: 'a1', agent_type: 'reviewer' }, srcFile), expect: 'deny' },
  { name: 'subagent qa', projectDir: projectNoTicket, payload: writeEnvelope({ agent_id: 'a2', agent_type: 'qa' }, srcFile), expect: 'deny' },
  { name: 'subagent Explore', projectDir: projectNoTicket, payload: writeEnvelope({ agent_id: 'a3', agent_type: 'Explore' }, srcFile), expect: 'deny' },
  { name: 'agent_id present, agent_type absent (incomplete identity)', projectDir: projectNoTicket, payload: writeEnvelope({ agent_id: 'a4' }, srcFile), expect: 'deny' },
  { name: 'agent_type explicitly null', projectDir: projectNoTicket, payload: writeEnvelope({ agent_id: 'a5', agent_type: null }, srcFile), expect: 'deny' },
  { name: 'agent_type "Writer" (wrong case)', projectDir: projectNoTicket, payload: writeEnvelope({ agent_id: 'a6', agent_type: 'Writer' }, srcFile), expect: 'deny' },
  { name: 'non-object input (array)', projectDir: projectNoTicket, payload: '[]', expect: 'deny' },
  { name: 'non-object input (string)', projectDir: projectNoTicket, payload: '"text"', expect: 'deny' },
  { name: 'empty stdin (fail-closed)', projectDir: projectNoTicket, payload: '', expect: 'deny' },
  { name: 'route guard: main session -> src/** while an R2 ticket is open', projectDir: projectOpenTicket, payload: writeEnvelope({}, srcFileOpen), expect: 'deny' },
  { name: 'route guard: main session -> docs/** while an R2 ticket is open', projectDir: projectOpenTicket, payload: writeEnvelope({}, docFileOpen), expect: 'allow(passthrough)' },
  { name: 'route guard: Writer -> src/** while an R2 ticket is open', projectDir: projectOpenTicket, payload: writeEnvelope({ agent_id: 'a7', agent_type: 'writer' }, srcFileOpen), expect: 'allow(passthrough)' },
];

// Gate 3's per-project toggle. These cases are deliberately NOT part of gate1Cases: the reference
// implementation predates `enforcement.routeWriteGuard`, so a parity comparison would report a
// DIVERGENCE that is the point of the change rather than a defect. They run against the plugin only,
// and the table below says so in its own header.
const projectToggle = (name, configRaw) => {
  const root = path.join(tmpRoot, 'toggle-' + name);
  fs.mkdirSync(path.join(root, '.aiwf'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude', 'aiwf-native'), { recursive: true });
  fs.writeFileSync(path.join(root, '.aiwf', 'route-state.json'), JSON.stringify({ route: 'R2', ticket: 'DEMO-1' }));
  if (configRaw !== null) fs.writeFileSync(path.join(root, '.claude', 'aiwf-native', 'aiwf.config.json'), configRaw);
  return root;
};
const toggleConfig = (enforcement) => JSON.stringify({ project: { name: 'Spike' }, enforcement });
const toggleOff = projectToggle('off', toggleConfig({ routeWriteGuard: false }));
const toggleOn = projectToggle('on', toggleConfig({ routeWriteGuard: true }));
const toggleCorrupt = projectToggle('corrupt', '{ not json ');
const toggleNoKey = projectToggle('nokey', JSON.stringify({ project: { name: 'Spike' } }));
const toggleString = projectToggle('strfalse', toggleConfig({ routeWriteGuard: 'false' }));

const gate3ToggleCases = [
  { name: 'toggle false: main session -> src/** while an R2 ticket is open', projectDir: toggleOff, payload: writeEnvelope({}, path.join(toggleOff, 'src', 'probe.txt')), expect: 'allow(passthrough)' },
  { name: 'toggle false: reviewer subagent -> src/** (identity path is untouched)', projectDir: toggleOff, payload: writeEnvelope({ agent_id: 'a1', agent_type: 'reviewer' }, path.join(toggleOff, 'src', 'probe.txt')), expect: 'deny' },
  { name: 'toggle true: main session -> src/** while an R2 ticket is open', projectDir: toggleOn, payload: writeEnvelope({}, path.join(toggleOn, 'src', 'probe.txt')), expect: 'deny' },
  { name: 'corrupt config: main session -> src/** (armed - a broken config never disarms)', projectDir: toggleCorrupt, payload: writeEnvelope({}, path.join(toggleCorrupt, 'src', 'probe.txt')), expect: 'deny' },
  { name: 'no enforcement key: main session -> src/** (armed)', projectDir: toggleNoKey, payload: writeEnvelope({}, path.join(toggleNoKey, 'src', 'probe.txt')), expect: 'deny' },
  { name: 'routeWriteGuard "false" as a STRING: main session -> src/** (armed, no coercion)', projectDir: toggleString, payload: writeEnvelope({}, path.join(toggleString, 'src', 'probe.txt')), expect: 'deny' },
];

// Gate 2: the Agent-dispatch envelope, from the live shape (subagent_type next to
// description/prompt/model/run_in_background).
const agentEnvelope = (toolInput, extra = {}) => ({
  session_id: '9a1c1a44-0000-4000-8000-000000000000',
  cwd: 'C:\\work\\demo',
  permission_mode: 'default',
  hook_event_name: 'PreToolUse',
  tool_name: 'Agent',
  tool_input: toolInput,
  tool_use_id: 'toolu_02spikeAgentDispatch',
  ...extra,
});
const writerDispatch = agentEnvelope({
  description: 'Implement ticket DEMO-1',
  prompt: 'Ticket: DEMO-1\n\nImplement the thing.',
  subagent_type: 'writer',
  model: 'opus',
  run_in_background: false,
});

const gate2Cases = [
  { name: 'Agent dispatch, subagent_type "writer"', payload: writerDispatch, expect: 'ask' },
  { name: 'Agent dispatch, subagent_type "reviewer"', payload: agentEnvelope({ description: 'review', prompt: 'x', subagent_type: 'reviewer' }), expect: 'allow(passthrough)' },
  { name: 'Agent dispatch, subagent_type "qa"', payload: agentEnvelope({ description: 'qa', prompt: 'x', subagent_type: 'qa' }), expect: 'allow(passthrough)' },
  { name: 'Agent dispatch, subagent_type "Explore"', payload: agentEnvelope({ description: 'scan', prompt: 'x', subagent_type: 'Explore' }), expect: 'allow(passthrough)' },
  { name: 'Agent dispatch, subagent_type "Writer" (wrong case)', payload: agentEnvelope({ description: 'x', prompt: 'x', subagent_type: 'Writer' }), expect: 'allow(passthrough)' },
  { name: 'Agent dispatch, subagent_type missing', payload: agentEnvelope({ description: 'x', prompt: 'x' }), expect: 'allow(passthrough)' },
  { name: 'Agent dispatch, tool_input not an object (fail-to-ask)', payload: agentEnvelope('nope'), expect: 'ask' },
  { name: 'non-Agent tool (defensive passthrough)', payload: { hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls' } }, expect: 'allow(passthrough)' },
  { name: 'non-object input (fail-to-ask)', payload: '[]', expect: 'ask' },
  { name: 'empty stdin (fail-to-ask)', payload: '', expect: 'ask' },
];

// Gate 2's per-project MODE (`enforcement.dispatchGate`). Same position as the Gate 3 toggle table
// above and for the same reason: the reference implementation knows nothing of this config key, so a
// parity comparison would report the intended change as a divergence. Plugin only.
//
// Each fixture is a project dir: a config (or none) plus, when it has one, a plans directory holding
// PLAN_DEMO.md. The two on-plan fixtures carry DIFFERENT refs on purpose - `nearmiss` holds DEMO-10
// and nothing else, which is the fixture that catches a substring match pretending to be a word
// match.
const projectMode = (name, configRaw, planText) => {
  const root = path.join(tmpRoot, 'mode-' + name);
  fs.mkdirSync(path.join(root, '.claude', 'aiwf-native'), { recursive: true });
  if (configRaw !== null) fs.writeFileSync(path.join(root, '.claude', 'aiwf-native', 'aiwf.config.json'), configRaw);
  if (planText !== null) {
    const activeDir = path.join(root, 'docs', 'backlogs', 'active'); // the schema default plansDir
    fs.mkdirSync(activeDir, { recursive: true });
    fs.writeFileSync(path.join(activeDir, 'PLAN_DEMO.md'), planText);
  }
  return root;
};
const modeConfig = (mode) => JSON.stringify({ project: { name: 'Spike' }, enforcement: { routeWriteGuard: true, dispatchGate: mode } });
const planWith = (ref) => `# PLAN DEMO\n\n## ${ref} - the only ref this fixture plan carries\n\nBody.\n`;
const PLAN_ONE = planWith('DEMO-1');

const modeOffPlan = projectMode('offplan', modeConfig('off-plan'), PLAN_ONE);
// The four near-miss fixtures. Each holds ONE ref that a naive matcher would let clear another:
// a longer numeric tail (DEMO-10), a longer DASHED tail (DEMO-1-EXTRA), a dashed PREFIX (X-DEMO-1),
// and a ref that itself ends in a dash (ABC- vs ABC-X). The dashed ones are the reason the boundary
// is stated over [A-Za-z0-9_-] instead of `\b`: `-` is not a regex word character, so `\b` sits in
// the middle of "DEMO-1-EXTRA" and would clear DEMO-1 there.
const modeNearMiss = projectMode('nearmiss', modeConfig('off-plan'), planWith('DEMO-10'));
const modeSuffixDash = projectMode('suffixdash', modeConfig('off-plan'), planWith('DEMO-1-EXTRA'));
const modePrefixDash = projectMode('prefixdash', modeConfig('off-plan'), planWith('X-DEMO-1'));
const modeTrailingDash = projectMode('trailingdash', modeConfig('off-plan'), planWith('ABC-'));
const modeTrailingDashX = projectMode('trailingdashx', modeConfig('off-plan'), planWith('ABC-X'));
const modeNoPlansDir = projectMode('noplansdir', modeConfig('off-plan'), null);
const modeAlways = projectMode('always', modeConfig('always'), PLAN_ONE);
const modeNoConfig = projectMode('noconfig', null, PLAN_ONE);
const modeCorrupt = projectMode('corrupt', '{ not json ', PLAN_ONE);
const modeWrongCase = projectMode('wrongcase', modeConfig('OFF-PLAN'), PLAN_ONE);

const writerBrief = (prompt) => agentEnvelope({
  description: 'Implement a ticket', prompt, subagent_type: 'writer', model: 'opus', run_in_background: false,
});

const gate2ModeCases = [
  { name: 'off-plan mode, ref IS in an active PLAN', projectDir: modeOffPlan, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'allow(passthrough)' },
  { name: 'off-plan mode, ref is in NO active PLAN', projectDir: modeOffPlan, payload: writerBrief('Ticket: DEMO-2\n\nDo the thing.'), expect: 'ask' },
  { name: 'off-plan mode, brief carries no Ticket: line', projectDir: modeOffPlan, payload: writerBrief('Do the thing, no ticket line here.'), expect: 'ask' },
  { name: 'off-plan mode, ref mentioned in PROSE only (not on its own line)', projectDir: modeOffPlan, payload: writerBrief('This relates to Ticket: DEMO-1 somewhere in a sentence.'), expect: 'ask' },
  { name: 'off-plan mode, near-miss ref DEMO-1 vs a plan holding DEMO-10', projectDir: modeNearMiss, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'off-plan mode, DEMO-1 vs a plan holding only DEMO-1-EXTRA (dashed SUFFIX)', projectDir: modeSuffixDash, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'off-plan mode, that same plan and the ref DEMO-1-EXTRA (control)', projectDir: modeSuffixDash, payload: writerBrief('Ticket: DEMO-1-EXTRA\n\nDo the thing.'), expect: 'allow(passthrough)' },
  { name: 'off-plan mode, DEMO-1 vs a plan holding only X-DEMO-1 (dashed PREFIX)', projectDir: modePrefixDash, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'off-plan mode, that same plan and the ref X-DEMO-1 (control)', projectDir: modePrefixDash, payload: writerBrief('Ticket: X-DEMO-1\n\nDo the thing.'), expect: 'allow(passthrough)' },
  { name: 'off-plan mode, a ref ending in a dash, ABC-, present EXACTLY', projectDir: modeTrailingDash, payload: writerBrief('Ticket: ABC-\n\nDo the thing.'), expect: 'allow(passthrough)' },
  { name: 'off-plan mode, the ref ABC- vs a plan holding only ABC-X', projectDir: modeTrailingDashX, payload: writerBrief('Ticket: ABC-\n\nDo the thing.'), expect: 'ask' },
  { name: 'off-plan mode, the plans directory does not exist', projectDir: modeNoPlansDir, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'off-plan mode, non-writer subagent (untouched by the gate)', projectDir: modeOffPlan, payload: agentEnvelope({ description: 'review', prompt: 'Ticket: DEMO-2', subagent_type: 'reviewer' }), expect: 'allow(passthrough)' },
  { name: 'always mode, ref IS in an active PLAN (still a click)', projectDir: modeAlways, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'NO config file, ref IS in an active PLAN (factory = always)', projectDir: modeNoConfig, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'CORRUPT config, ref IS in an active PLAN (a broken config never buys silence)', projectDir: modeCorrupt, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
  { name: 'mode "OFF-PLAN" (wrong case) -> always, no coercion', projectDir: modeWrongCase, payload: writerBrief('Ticket: DEMO-1\n\nDo the thing.'), expect: 'ask' },
];

// ---- run -------------------------------------------------------------------
const pad = (s, n) => (s.length >= n ? s : s + ' '.repeat(n - s.length));
let failures = 0;
let checks = 0;

// Counts one assertion and returns it as a BOOLEAN, so callers can AND several of them together
// into one row verdict without a string ever being mistaken for a pass.
function record(ok) {
  checks += 1;
  if (!ok) failures += 1;
  return ok === true;
}
const label = (ok) => (ok ? 'PASS' : 'FAIL');

console.log('PromptAndPray P0 spike (level a) - direct hook invocation');
console.log(`plugin hooks : ${PLUGIN_HOOKS}`);
console.log(`reference    : ${referenceAvailable ? REFERENCE : (REFERENCE ? REFERENCE + ' (NOT FOUND -> parity SKIPPED)' : '(not given -> parity SKIPPED)')}`);
console.log(`fixture dirs : ${tmpRoot}`);
console.log('');

console.log('== Gate 1 - non-writer subagents cannot write (+ route-state guard) ==');
console.log('per case: [1] plugin decision matches the expectation  [2] plugin exited 0');
console.log('          [3] reference decision + reason text identical  [4] reference exited 0  (when a reference is given)');
console.log(`${pad('case', 62)} ${pad('expected', 18)} ${pad('plugin', 18)} ${pad('exit', 5)} ${pad('reference', 18)} ${pad('exit', 5)} verdict`);
for (const c of gate1Cases) {
  const got = runHook(path.join(PLUGIN_HOOKS, GATE1), c.payload, c.projectDir);
  let ok = record(got.decision === c.expect);
  ok = record(got.exit === 0) && ok;   // [2] exit asserted separately from the decision
  let refCell = 'SKIP';
  let refExit = '-';
  let ref = null;
  if (referenceAvailable) {
    ref = runHook(referenceGate1, c.payload, c.projectDir);
    refCell = ref.decision;
    refExit = ref.exit === null ? 'null' : String(ref.exit);
    const identical = ref.decision === got.decision && ref.reason === got.reason;
    if (!identical) refCell = `${ref.decision} (DIVERGES)`;
    ok = record(identical) && ok;      // [3]
    ok = record(ref.exit === 0) && ok; // [4]
  }
  const verdict = ok ? 'PASS' : 'FAIL';
  const gotExit = got.exit === null ? 'null' : String(got.exit);
  console.log(`${pad(c.name, 62)} ${pad(c.expect, 18)} ${pad(got.decision, 18)} ${pad(gotExit, 5)} ${pad(refCell, 18)} ${pad(refExit, 5)} ${verdict}`);
  if (verdict === 'FAIL') {
    console.log(`    plugin reason   : ${got.reason || '(none)'}`);
    if (ref) console.log(`    reference reason: ${ref.reason || '(none)'}`);
  }
}

console.log('');
console.log('== Gate 3 toggle - enforcement.routeWriteGuard (plugin only: the reference predates the toggle) ==');
console.log('per case: [1] plugin decision matches the expectation  [2] plugin exited 0');
console.log(`${pad('case', 62)} ${pad('expected', 18)} ${pad('plugin', 18)} ${pad('exit', 5)} verdict`);
for (const c of gate3ToggleCases) {
  const got = runHook(path.join(PLUGIN_HOOKS, GATE1), c.payload, c.projectDir);
  let ok = record(got.decision === c.expect);
  ok = record(got.exit === 0) && ok;
  const verdict = ok ? 'PASS' : 'FAIL';
  const gotExit = got.exit === null ? 'null' : String(got.exit);
  console.log(`${pad(c.name, 62)} ${pad(c.expect, 18)} ${pad(got.decision, 18)} ${pad(gotExit, 5)} ${verdict}`);
  if (verdict === 'FAIL') console.log(`    plugin reason: ${got.reason || '(none)'}`);
}

console.log('');
console.log('== Gate 2 - the dispatch gate in its factory mode (a project with no config = "always") ==');
console.log('per case: [1] plugin decision matches the expectation  [2] plugin exited 0');
console.log(`${pad('case', 62)} ${pad('expected', 18)} ${pad('plugin', 18)} ${pad('exit', 5)} verdict`);
for (const c of gate2Cases) {
  const got = runHook(path.join(PLUGIN_HOOKS, GATE2), c.payload, projectNoTicket);
  let ok = record(got.decision === c.expect);
  ok = record(got.exit === 0) && ok;
  const verdict = ok ? 'PASS' : 'FAIL';
  const gotExit = got.exit === null ? 'null' : String(got.exit);
  console.log(`${pad(c.name, 62)} ${pad(c.expect, 18)} ${pad(got.decision, 18)} ${pad(gotExit, 5)} ${verdict}`);
  if (verdict === 'FAIL') console.log(`    plugin reason: ${got.reason || '(none)'}`);
}

console.log('');
console.log('== Gate 2 mode - enforcement.dispatchGate (plugin only: the reference predates the mode key) ==');
console.log('per case: [1] plugin decision matches the expectation  [2] plugin exited 0');
console.log(`${pad('case', 62)} ${pad('expected', 18)} ${pad('plugin', 18)} ${pad('exit', 5)} verdict`);
for (const c of gate2ModeCases) {
  const got = runHook(path.join(PLUGIN_HOOKS, GATE2), c.payload, c.projectDir);
  let ok = record(got.decision === c.expect);
  ok = record(got.exit === 0) && ok;
  const verdict = ok ? 'PASS' : 'FAIL';
  const gotExit = got.exit === null ? 'null' : String(got.exit);
  console.log(`${pad(c.name, 62)} ${pad(c.expect, 18)} ${pad(got.decision, 18)} ${pad(gotExit, 5)} ${verdict}`);
  if (verdict === 'FAIL') console.log(`    plugin reason: ${got.reason || '(none)'}`);
}

// The headline assertion in words, not only in a table row: the ask must be a real, visible ask
// carrying a reason the operator can act on.
console.log('');
console.log('== Gate 2 - the ask payload itself ==');
{
  const got = runHook(path.join(PLUGIN_HOOKS, GATE2), writerDispatch, projectNoTicket);
  console.log(`decision : ${got.decision}`);
  console.log(`reason   : ${got.reason}`);
  console.log(`exit code: ${got.exit}`);
  const okDecision = record(got.decision === 'ask');
  const okReason = record(typeof got.reason === 'string' && got.reason.includes('Writer dispatch'));
  const okExit = record(got.exit === 0);
  console.log(`assert permissionDecision === "ask"           : ${label(okDecision)}`);
  console.log(`assert reason names the Writer dispatch       : ${label(okReason)}`);
  console.log(`assert hook exits 0 (decision, not a crash)   : ${label(okExit)}`);
}

fs.rmSync(tmpRoot, { recursive: true, force: true });

console.log('');
console.log(`checks: ${checks}, failures: ${failures}`);
if (!referenceAvailable) {
  console.log('NOTE: Gate 1 parity was SKIPPED (no reference implementation given). Expectations were still enforced.');
}
console.log(failures === 0 ? 'SPIKE RESULT: PASS' : 'SPIKE RESULT: FAIL');
process.exit(failures === 0 ? 0 : 1);
