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
 * answers a different question), so it is asserted against the expectation table only.
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
console.log('== Gate 2 - every Writer dispatch is an operator click ==');
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
