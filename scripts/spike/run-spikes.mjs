#!/usr/bin/env node
/*
 * P0 spike (level a) — direct-invocation proof for the three PreToolUse gates.
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
const GATE4 = 'pretooluse-git-verb-guard.js';

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

// Gate 4: the Bash envelope. Same captured shape as above with the command varied; the gate reads
// nothing but the payload (no project dir, no config), so these cases need no fixture directory.
const bashEnvelope = (identity, command) => ({
  session_id: '5c3b1f2e-0000-4000-8000-000000000000',
  cwd: 'C:\\work\\demo',
  permission_mode: 'default',
  ...identity,
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command, description: 'run a command' },
  tool_use_id: 'toolu_04spikeBashGitVerb',
});
const MAIN = {};                                     // true main session: NO identity fields at all
const WRITER = { agent_id: 'w1', agent_type: 'writer' };
// A repo-selector path for the `git -C <path>` forms. Deliberately not a drive-letter path: the
// payload carries none (the provenance section of the self-check is the gate), and the FORM is what
// these cases are about, not the platform.
const ROOT = '/work/demo';

// The whole decision table, one row per branch. Four groups, and the third is the load-bearing one:
// a gate that denied `git log` from a subagent would be uninstallable, so "silent on everything it
// does not judge" is asserted as explicitly as the denies.
//
// The main-session rows encode the DOCUMENTED harness behaviour, not a guess about it: Claude Code
// splits a Bash command on the six shell operators and newlines and matches rules per SUBCOMMAND,
// strips the timeout/time/nice/nohup/stdbuf/command/builtin/noglob/flagless-xargs wrappers, and
// matches past leading NAME=value assignments. So the chained and wrapper-prefixed forms are
// ALREADY gated by the harness and must stay silent here; what asks is what the shipped rules never
// spell out.
const gate4Cases = [
  // --- main session / Writer: silent ONLY where a shipped rule matches the subcommand byte for byte
  { name: 'main: bare `git commit` (the rule matches) -> silent', payload: bashEnvelope(MAIN, 'git commit -m x'), expect: 'allow(passthrough)' },
  { name: 'main: bare `git push origin main` -> silent', payload: bashEnvelope(MAIN, 'git push origin main'), expect: 'allow(passthrough)' },
  { name: 'main: `git.exe push origin main` (the ruleset spells this one out) -> silent', payload: bashEnvelope(MAIN, 'git.exe push origin main'), expect: 'allow(passthrough)' },
  { name: 'main: `cd <root> && git commit` -> silent (the HARNESS matches the subcommand)', payload: bashEnvelope(MAIN, `cd ${ROOT} && git commit -m y`), expect: 'allow(passthrough)' },
  { name: 'main: `timeout 30 git commit` -> silent (a stripped wrapper; the rule still matches)', payload: bashEnvelope(MAIN, 'timeout 30 git commit -m x'), expect: 'allow(passthrough)' },
  { name: 'main: `nice -n 10 git push` -> silent (stripped wrapper with its own option)', payload: bashEnvelope(MAIN, 'nice -n 10 git push origin main'), expect: 'allow(passthrough)' },
  { name: 'main: `xargs git push` -> silent (flagless xargs IS stripped by the harness)', payload: bashEnvelope(MAIN, 'xargs git push'), expect: 'allow(passthrough)' },
  { name: 'main: `FOO=bar git push origin main` -> silent (rules match past env assignments)', payload: bashEnvelope(MAIN, 'FOO=bar git push origin main'), expect: 'allow(passthrough)' },
  { name: 'main: `git -c k=v commit` -> silent (Bash(git -c:*) matches this byte for byte)', payload: bashEnvelope(MAIN, 'git -c user.name=x commit -m y'), expect: 'allow(passthrough)' },
  { name: 'main: `npx foo && git reset --hard` -> silent (the git SUBCOMMAND is rule-matched)', payload: bashEnvelope(MAIN, 'npx foo && git reset --hard'), expect: 'allow(passthrough)' },
  // The bypasses: forms the shipped ruleset never spells out, which reach nobody today.
  { name: 'main: `git.exe reset --hard` -> ASK (.exe rules exist for push/merge/rebase only)', payload: bashEnvelope(MAIN, 'git.exe reset --hard'), expect: 'ask' },
  { name: 'main: `git -C <root> reset --hard` -> ASK (no -C rule for a non-push verb)', payload: bashEnvelope(MAIN, `git -C ${ROOT} reset --hard`), expect: 'ask' },
  { name: 'main: `git -C <root> push origin main` -> ASK (the rule names <projectRoot>, unverifiable)', payload: bashEnvelope(MAIN, `git -C ${ROOT} push origin main`), expect: 'ask' },
  { name: 'main: `git.exe -C <root> push` -> ASK (no rule carries both spellings)', payload: bashEnvelope(MAIN, `git.exe -C ${ROOT} push`), expect: 'ask' },
  { name: 'main: `git -C /p -C . push` (a second -C) -> ASK', payload: bashEnvelope(MAIN, 'git -C /p -C . push'), expect: 'ask' },
  { name: 'main: `sudo git reset --hard` -> ASK (sudo is NOT a stripped wrapper)', payload: bashEnvelope(MAIN, 'sudo git reset --hard'), expect: 'ask' },
  { name: 'main: `npx git reset --hard` -> ASK (npx is NOT stripped either)', payload: bashEnvelope(MAIN, 'npx git reset --hard'), expect: 'ask' },
  { name: 'main: `xargs -I{} git push` -> ASK (a FLAGGED xargs is not stripped)', payload: bashEnvelope(MAIN, 'xargs -I{} git push'), expect: 'ask' },
  { name: 'main: `git  commit` (two spaces) -> ASK (irregular whitespace matches no rule)', payload: bashEnvelope(MAIN, 'git  commit -m x'), expect: 'ask' },
  { name: 'main: `git\\tcommit` (a tab) -> ASK', payload: bashEnvelope(MAIN, 'git\tcommit -m x'), expect: 'ask' },
  // The same whitespace question AFTER the verb, which `(\s|$)` used to let through.
  { name: 'main: `git commit\\t-m x` (tab after the verb) -> ASK', payload: bashEnvelope(MAIN, 'git commit\t-m x'), expect: 'ask' },
  { name: 'main: `git.exe push\\torigin main` (tab after the verb) -> ASK', payload: bashEnvelope(MAIN, 'git.exe push\torigin main'), expect: 'ask' },
  { name: 'main: `git commit  -m x` (two spaces after the verb) -> ASK', payload: bashEnvelope(MAIN, 'git commit  -m x'), expect: 'ask' },
  // A separator inside quotes is not a separator: the real first token is `bash`, which no rule carries.
  { name: 'main: `bash -c "true; git reset --hard"` -> ASK (a nested shell is not a git rule)', payload: bashEnvelope(MAIN, 'bash -c "true; git reset --hard"'), expect: 'ask' },
  { name: "main: `sh -c 'git reset --hard'` -> ASK", payload: bashEnvelope(MAIN, "sh -c 'git reset --hard'"), expect: 'ask' },
  { name: 'main: `git commit -m "x && y"` -> silent (a quoted separator does not split the command)', payload: bashEnvelope(MAIN, 'git commit -m "x && y"'), expect: 'allow(passthrough)' },
  { name: 'main: `command -v git commit` -> ASK (a query; a flagged wrapper is not stripped)', payload: bashEnvelope(MAIN, 'command -v git commit'), expect: 'ask' },
  { name: 'main: `builtin -x git push` -> ASK', payload: bashEnvelope(MAIN, 'builtin -x git push'), expect: 'ask' },
  { name: 'main: `command git commit -m x` -> silent (flagless: a real stripped wrapper)', payload: bashEnvelope(MAIN, 'command git commit -m x'), expect: 'allow(passthrough)' },
  { name: 'main: ` git commit` (a leading space) -> ASK (unconfirmed that the harness trims it)', payload: bashEnvelope(MAIN, ' git commit -m x'), expect: 'ask' },
  { name: 'main: `git\\ncommit` (a newline splits it into two non-rules) -> ASK', payload: bashEnvelope(MAIN, 'git\ncommit -m x'), expect: 'ask' },
  { name: 'main: `git -ck=v reset` (glued -c is not the rule prefix "git -c ") -> ASK', payload: bashEnvelope(MAIN, 'git -cuser.name=x reset --hard'), expect: 'ask' },
  { name: 'main: `git push ... && sudo git reset --hard` -> ASK (one bad subcommand decides)', payload: bashEnvelope(MAIN, 'git push origin main && sudo git reset --hard'), expect: 'ask' },
  { name: 'main: a verb inside a command substitution -> ASK (not mirrored, so not confirmed)', payload: bashEnvelope(MAIN, 'echo $(git reset --hard)'), expect: 'ask' },
  { name: 'writer: bare `git commit` -> silent (the commit dialog is the operator\'s, unchanged)', payload: bashEnvelope(WRITER, 'git commit -m x'), expect: 'allow(passthrough)' },
  { name: 'writer: `git.exe reset --hard` -> ASK (the Writer is not exempt from the form)', payload: bashEnvelope(WRITER, 'git.exe reset --hard'), expect: 'ask' },
  // --- non-writer subagents: an ask-class verb is denied, whatever the form
  { name: 'general-purpose: `git reset --hard` -> DENY', payload: bashEnvelope({ agent_id: 'a1', agent_type: 'general-purpose' }, 'git reset --hard'), expect: 'deny' },
  { name: 'Explore: `cd X && git reset --hard` -> DENY', payload: bashEnvelope({ agent_id: 'a2', agent_type: 'Explore' }, 'cd X && git reset --hard'), expect: 'deny' },
  { name: 'reviewer: `git switch other` -> DENY', payload: bashEnvelope({ agent_id: 'a3', agent_type: 'reviewer' }, 'git switch other'), expect: 'deny' },
  { name: 'qa: `git fetch --all` -> DENY', payload: bashEnvelope({ agent_id: 'a4', agent_type: 'qa' }, 'git fetch --all'), expect: 'deny' },
  { name: 'agent_id present, agent_type absent: `git commit` -> DENY', payload: bashEnvelope({ agent_id: 'a5' }, 'git commit -m x'), expect: 'deny' },
  { name: 'agent_type null: `git commit` -> DENY', payload: bashEnvelope({ agent_id: 'a6', agent_type: null }, 'git commit -m x'), expect: 'deny' },
  { name: 'agent_type "Writer" (wrong case): `git commit` -> DENY', payload: bashEnvelope({ agent_id: 'a7', agent_type: 'Writer' }, 'git commit -m x'), expect: 'deny' },
  // The form never softens the deny: the .exe and -C rows above are an ASK for the main session and
  // stay a DENY here, because identity decides this branch before the form is looked at.
  { name: 'general-purpose: `git.exe reset --hard` -> DENY (form is irrelevant to identity)', payload: bashEnvelope({ agent_id: 'a13', agent_type: 'general-purpose' }, 'git.exe reset --hard'), expect: 'deny' },
  { name: 'general-purpose: `git -C <root> reset --hard` -> DENY', payload: bashEnvelope({ agent_id: 'a14', agent_type: 'general-purpose' }, `git -C ${ROOT} reset --hard`), expect: 'deny' },
  // A verb GLUED to the punctuation that ends its command. Reading the token raw made the recogniser
  // blind to these, so the deny branch silently did not fire - the worst shape of the whole class.
  { name: 'general-purpose: `git reset --hard;` (trailing separator) -> DENY', payload: bashEnvelope({ agent_id: 'a15', agent_type: 'general-purpose' }, 'git reset --hard;'), expect: 'deny' },
  { name: 'general-purpose: `git commit;echo done` -> DENY', payload: bashEnvelope({ agent_id: 'a16', agent_type: 'general-purpose' }, 'git commit;echo done'), expect: 'deny' },
  { name: 'general-purpose: `echo $(git push)` -> DENY', payload: bashEnvelope({ agent_id: 'a17', agent_type: 'general-purpose' }, 'echo $(git push)'), expect: 'deny' },
  { name: 'general-purpose: `git reset>log` -> DENY', payload: bashEnvelope({ agent_id: 'a18', agent_type: 'general-purpose' }, 'git reset>log'), expect: 'deny' },
  { name: 'general-purpose: `git log --oneline;` -> silent (the control: only ask-class verbs)', payload: bashEnvelope({ agent_id: 'a19', agent_type: 'general-purpose' }, 'git log --oneline;'), expect: 'allow(passthrough)' },
  // BACKTICK COMMAND SUBSTITUTION. The shell runs it, and the permission rules reach into it, but a
  // blacklist cut that lacked the backtick left the verb token as ``push` `` - unrecognised, so the
  // gate returned before identity was ever looked at. The reduction is a whitelist now (a verb is
  // letters and `-`, everything else ends the token), which is why these are DENIES.
  { name: 'general-purpose: `echo `git push`` -> DENY (backtick substitution)', payload: bashEnvelope({ agent_id: 'a20', agent_type: 'general-purpose' }, 'echo `git push`'), expect: 'deny' },
  { name: 'general-purpose: `echo `git stash`` -> DENY', payload: bashEnvelope({ agent_id: 'a21', agent_type: 'general-purpose' }, 'echo `git stash`'), expect: 'deny' },
  { name: 'general-purpose: `echo "`git push`"` -> DENY (quoted substitution: two terminators at once)', payload: bashEnvelope({ agent_id: 'a22', agent_type: 'general-purpose' }, 'echo "`git push`"'), expect: 'deny' },
  { name: 'general-purpose: `echo `date`` -> silent (the control: a substitution with no ask-class verb)', payload: bashEnvelope({ agent_id: 'a23', agent_type: 'general-purpose' }, 'echo `date`'), expect: 'allow(passthrough)' },
  { name: 'main: `echo `git push`` -> ASK (no rule covers a substitution; the harness does reach in)', payload: bashEnvelope(MAIN, 'echo `git push`'), expect: 'ask' },
  { name: 'writer: `echo `git push`` -> ASK (the Writer is not exempt)', payload: bashEnvelope(WRITER, 'echo `git push`'), expect: 'ask' },
  // The other newly-cut characters that plausibly appear glued to a verb in a real command. `{`,
  // `}`, `=`, `*`, `?`, `[`, `]`, `~`, `#`, `!` and `$` are cut too, but a real command does not
  // glue them onto a git verb, so no row pretends otherwise - the enumeration itself is pinned by a
  // pure-function assertion in the self-check.
  { name: "general-purpose: `git 'reset' --hard` (quoted verb) -> DENY", payload: bashEnvelope({ agent_id: 'a24', agent_type: 'general-purpose' }, "git 'reset' --hard"), expect: 'deny' },
  { name: 'general-purpose: `git "push" origin` (quoted verb) -> DENY', payload: bashEnvelope({ agent_id: 'a25', agent_type: 'general-purpose' }, 'git "push" origin'), expect: 'deny' },
  { name: 'general-purpose: `git \\push` (ESCAPED verb) -> silent (stated residual: escapes are not interpreted)', payload: bashEnvelope({ agent_id: 'a26', agent_type: 'general-purpose' }, 'git \\push'), expect: 'allow(passthrough)' },
  // --- everything this gate does not judge stays invisible, from EVERY identity
  { name: 'subagent: `git log --oneline -5` -> silent (read-only verb)', payload: bashEnvelope({ agent_id: 'a8', agent_type: 'Explore' }, 'git log --oneline -5'), expect: 'allow(passthrough)' },
  { name: 'subagent: `git status --short` -> silent', payload: bashEnvelope({ agent_id: 'a9', agent_type: 'Explore' }, 'git status --short'), expect: 'allow(passthrough)' },
  { name: 'subagent: `git show HEAD` -> silent', payload: bashEnvelope({ agent_id: 'a10', agent_type: 'reviewer' }, 'git show HEAD'), expect: 'allow(passthrough)' },
  { name: 'subagent: `git grep -n x -- docs` -> silent', payload: bashEnvelope({ agent_id: 'a11', agent_type: 'reviewer' }, 'git grep -n x -- docs'), expect: 'allow(passthrough)' },
  { name: 'subagent: `node --version` (no git at all) -> silent', payload: bashEnvelope({ agent_id: 'a12', agent_type: 'general-purpose' }, 'node --version'), expect: 'allow(passthrough)' },
  { name: 'main: `git log --oneline -5` -> silent', payload: bashEnvelope(MAIN, 'git log --oneline -5'), expect: 'allow(passthrough)' },
  { name: 'main: `cd X && npm test` -> silent (the ask branch judges GIT verbs only)', payload: bashEnvelope(MAIN, 'cd X && npm test'), expect: 'allow(passthrough)' },
  { name: 'main: `mygit commit` / `git-foo commit` are other programs -> silent', payload: bashEnvelope(MAIN, 'mygit commit && git-foo commit'), expect: 'allow(passthrough)' },
  // --- the documented FALSE POSITIVE (header): recognition does not treat quoted text as data
  { name: 'main: a gated verb inside a quoted string -> ASK (documented false positive, costs a click)', payload: bashEnvelope(MAIN, 'git grep -n "git commit" -- docs'), expect: 'ask' },
  // --- the fail direction, on a hook that sits on EVERY Bash command
  { name: 'non-object input (array) -> DENY (fail-closed)', payload: '[]', expect: 'deny' },
  { name: 'non-object input (string) -> DENY (fail-closed)', payload: '"text"', expect: 'deny' },
  { name: 'empty stdin -> DENY (fail-closed)', payload: '', expect: 'deny' },
  { name: 'tool_input without a command string -> silent (nothing to recognise)', payload: bashEnvelope(MAIN, undefined), expect: 'allow(passthrough)' },
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

console.log('');
console.log('== Gate 4 - ask-class git verbs on the Bash tool (plugin only: the reference has no such hook) ==');
console.log('per case: [1] plugin decision matches the expectation  [2] plugin exited 0');
console.log(`${pad('case', 62)} ${pad('expected', 18)} ${pad('plugin', 18)} ${pad('exit', 5)} verdict`);
for (const c of gate4Cases) {
  const got = runHook(path.join(PLUGIN_HOOKS, GATE4), c.payload, c.projectDir);
  let ok = record(got.decision === c.expect);
  ok = record(got.exit === 0) && ok;
  const verdict = ok ? 'PASS' : 'FAIL';
  const gotExit = got.exit === null ? 'null' : String(got.exit);
  console.log(`${pad(c.name, 62)} ${pad(c.expect, 18)} ${pad(got.decision, 18)} ${pad(gotExit, 5)} ${verdict}`);
  if (verdict === 'FAIL') console.log(`    plugin reason: ${got.reason || '(none)'}`);
}

// The two decisions in words: a deny must name the verb it recognised (otherwise the subagent
// cannot report anything useful back), and the ask must say WHY a dialog appeared - that no rule
// covers this FORM, which is the only reason this gate ever adds one.
console.log('');
console.log('== Gate 4 - the deny and ask payloads themselves ==');
{
  const denied = runHook(path.join(PLUGIN_HOOKS, GATE4),
    bashEnvelope({ agent_id: 'a1', agent_type: 'general-purpose' }, 'git reset --hard'));
  const asked = runHook(path.join(PLUGIN_HOOKS, GATE4), bashEnvelope(MAIN, 'git.exe reset --hard'));
  console.log(`deny reason : ${denied.reason}`);
  console.log(`ask reason  : ${asked.reason}`);
  const okDeny = record(denied.decision === 'deny' && denied.reason.includes('"reset"') && denied.exit === 0);
  const okAsk = record(asked.decision === 'ask' && asked.reason.includes('no permission rule covers') && asked.exit === 0);
  console.log(`assert the deny names the recognised verb     : ${label(okDeny)}`);
  console.log(`assert the ask says no rule covers the form   : ${label(okAsk)}`);
}

fs.rmSync(tmpRoot, { recursive: true, force: true });

console.log('');
console.log(`checks: ${checks}, failures: ${failures}`);
if (!referenceAvailable) {
  console.log('NOTE: Gate 1 parity was SKIPPED (no reference implementation given). Expectations were still enforced.');
}
console.log(failures === 0 ? 'SPIKE RESULT: PASS' : 'SPIKE RESULT: FAIL');
process.exit(failures === 0 ? 0 : 1);
