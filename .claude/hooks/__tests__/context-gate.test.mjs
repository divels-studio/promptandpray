import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  bandOf,
  CHECKPOINT_PREFIX,
  decide,
  DEFAULT_WINDOW_SIZE,
  parsePct,
  parseSize,
  remindText,
  nowText,
  tokensOf,
} from '../context-gate.mjs';

// No .size file -> 1 000 000 tokens, so 1 % = 10k tokens: 94 % = 940k, 96 % = 960k, 100 % = 1000k.

const hookPath = fileURLToPath(new URL('../context-gate.mjs', import.meta.url));

const sandboxRoots = [];
after(() => {
  for (const root of sandboxRoots) rmSync(root, { recursive: true, force: true });
});

/** A fresh temp HOME and temp project dir per test. */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'context-gate-'));
  sandboxRoots.push(root);
  const home = join(root, 'home');
  const project = join(root, 'project');
  mkdirSync(join(home, '.claude', 'ctx'), { recursive: true });
  mkdirSync(project, { recursive: true });
  const ctx = (name) => join(home, '.claude', 'ctx', name);
  const env = { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_PROJECT_DIR: project };
  const run = (payload, options = {}) => {
    const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const result = spawnSync(process.execPath, [hookPath], { input, encoding: 'utf8', env: options.env ?? env });
    assert.equal(result.status, 0, `exit code (stderr: ${result.stderr})`);
    assert.equal(result.stderr, '');
    return result.stdout;
  };
  const setPct = (sid, value) => writeFileSync(ctx(`${sid}.pct`), String(value));
  const setSize = (sid, value) => writeFileSync(ctx(`${sid}.size`), String(value));
  return { root, home, project, ctx, env, run, setPct, setSize };
}

const activity = (event, sid = 'sess-1') => ({ hook_event_name: event, session_id: sid, cwd: 'unused' });

/** Asserts the exact additionalContext JSON shape and returns the text. */
function contextOf(stdout, event) {
  const out = JSON.parse(stdout);
  assert.deepEqual(Object.keys(out), ['hookSpecificOutput']);
  assert.deepEqual(Object.keys(out.hookSpecificOutput).sort(), ['additionalContext', 'hookEventName']);
  assert.equal(out.hookSpecificOutput.hookEventName, event);
  assert.equal(typeof out.hookSpecificOutput.additionalContext, 'string');
  return out.hookSpecificOutput.additionalContext;
}

function listFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .sort();
}

test('pure: bands at the boundaries, number parsing, decision table', () => {
  assert.equal(bandOf(949999), 0);
  assert.equal(bandOf(950000), 1);
  assert.equal(bandOf(999999), 1);
  assert.equal(bandOf(1000000), 2);
  assert.equal(bandOf(1049999), 2);
  assert.equal(bandOf(1050000), 2);
  assert.equal(tokensOf(41, 1000000), 410000);
  assert.equal(tokensOf(72, 200000), 144000);
  assert.equal(parsePct('72'), 72);
  assert.equal(parsePct(' 72.5\n'), 72.5);
  for (const bad of ['', '   ', 'abc', '-5', '7e1', 'NaN', '72%', null, undefined, 72]) {
    assert.equal(parsePct(bad), null, `parsePct(${JSON.stringify(bad)})`);
  }
  assert.deepEqual(decide('PostToolUse', 940000, 0), { text: null, band: 0 });
  assert.deepEqual(decide('PostToolUse', 960400, 0), { text: remindText(960), band: 1 });
  assert.deepEqual(decide('PostToolUse', 999999, 1), { text: null, band: 1 });
  assert.deepEqual(decide('PostToolUse', 1000000, 1), { text: nowText(1000), band: 2 });
  assert.deepEqual(decide('PostToolUse', 1010000, 1), { text: nowText(1010), band: 2 });
  assert.deepEqual(decide('UserPromptSubmit', 1010000, 2), { text: nowText(1010), band: 2 });
  assert.deepEqual(decide('PostToolUse', 1010000, 2), { text: null, band: 2 });
  assert.deepEqual(decide('UserPromptSubmit', 300000, 2), { text: null, band: 0 });
  assert.deepEqual(decide('PostToolUse', 1050000, 0), { text: nowText(1050), band: 2 });
});

test('pure: the two texts, exact; no stop / no /compact request', () => {
  assert.equal(
    remindText(960),
    'Контекстът е 960k токена — пиши чекпойнта (.aiwf/checkpoint.md) на следващия гейт (правило „Чекпойнт по гейтове", overrides § Loop shape).',
  );
  assert.equal(
    nowText(1010),
    'Контекстът е 1010k токена — пиши чекпойнта (.aiwf/checkpoint.md) СЕГА, след текущата стъпка.',
  );
  for (const text of [remindText(960), nowText(1010)]) {
    assert.equal(text.includes('СПРИ'), false);
    assert.equal(text.includes('поискай /compact'), false);
  }
});

test('pure: window size parsing -> missing / garbage / non-positive = 1 000 000', () => {
  assert.equal(DEFAULT_WINDOW_SIZE, 1000000);
  assert.equal(parseSize('200000'), 200000);
  assert.equal(parseSize(' 1000000\n'), 1000000);
  for (const bad of ['', '   ', 'abc', '0', '-5', '2e5', '200000.5', '99999999999999999999', null, undefined, 200000]) {
    assert.equal(parseSize(bad), 1000000, `parseSize(${JSON.stringify(bad)})`);
  }
});

test('940k -> no output', () => {
  const s = sandbox();
  s.setPct('sess-1', 94);
  assert.equal(s.run(activity('UserPromptSubmit')), '');
  assert.equal(s.run(activity('PostToolUse')), '');
  assert.equal(existsSync(s.ctx('sess-1.band')), false);
});

test('band flow: 960k once, 1000k now, 1000k again on prompt only, drop to 300k silently, 960k again', () => {
  const s = sandbox();

  s.setPct('sess-1', 96);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), remindText(960));
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '1');
  assert.equal(s.run(activity('PostToolUse')), '', 'second call at 960k -> none');
  assert.equal(s.run(activity('UserPromptSubmit')), '', 'prompt at 960k -> none');

  s.setPct('sess-1', 100);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), nowText(1000));
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '2');
  assert.equal(contextOf(s.run(activity('UserPromptSubmit')), 'UserPromptSubmit'), nowText(1000));
  assert.equal(contextOf(s.run(activity('UserPromptSubmit')), 'UserPromptSubmit'), nowText(1000));
  assert.equal(s.run(activity('PostToolUse')), '', 'tool call at 1000k after the now-text -> none');

  s.setPct('sess-1', 30);
  assert.equal(s.run(activity('UserPromptSubmit')), '');
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '0', 'band lowered silently');

  s.setPct('sess-1', 96);
  assert.equal(contextOf(s.run(activity('UserPromptSubmit')), 'UserPromptSubmit'), remindText(960));

  assert.deepEqual(listFiles(s.home), ['.claude/ctx/sess-1.band', '.claude/ctx/sess-1.pct']);
  assert.deepEqual(listFiles(s.project), []);
});

test('rounding: 999.6k is still the remind band and shows 1000k rounded', () => {
  const s = sandbox();
  s.setPct('sess-1', 99.96);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), remindText(1000));
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '1');
});

test('.size: tokens = pct x size; 72 % of 200k = 144k -> none; 100 % of 1M file -> now; 50 % of 2M -> now', () => {
  const s = sandbox();
  s.setSize('sess-1', 200000);
  s.setPct('sess-1', 72);
  assert.equal(s.run(activity('PostToolUse')), '', '144k -> none');
  assert.equal(existsSync(s.ctx('sess-1.band')), false);

  s.setSize('sess-2', 1000000);
  s.setPct('sess-2', 100);
  assert.equal(contextOf(s.run(activity('PostToolUse', 'sess-2')), 'PostToolUse'), nowText(1000));

  s.setSize('sess-3', 2000000);
  s.setPct('sess-3', 50);
  assert.equal(contextOf(s.run(activity('PostToolUse', 'sess-3')), 'PostToolUse'), nowText(1000));
});

test('no .size -> computed on 1M (96 % -> 960k remind, 94 % -> none)', () => {
  const s = sandbox();
  s.setPct('sess-1', 96);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), remindText(960));
  s.setPct('sess-2', 94);
  assert.equal(s.run(activity('PostToolUse', 'sess-2')), '');
  assert.equal(existsSync(s.ctx('sess-1.size')), false);
});

test('garbage .size -> computed on 1M', () => {
  const s = sandbox();
  for (const [i, garbage] of ['', 'abc', '0', '-200000', '2e5', '200000.5'].entries()) {
    const sid = `sess-g${i}`;
    s.setSize(sid, garbage);
    s.setPct(sid, 96);
    assert.equal(contextOf(s.run(activity('PostToolUse', sid)), 'PostToolUse'), remindText(960), `.size ${JSON.stringify(garbage)}`);
  }
});

test('old UIR-040 band values (70 / 80) read as 0', () => {
  const s = sandbox();
  writeFileSync(s.ctx('sess-1.band'), '80');
  s.setPct('sess-1', 100);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), nowText(1000));
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '2');
  writeFileSync(s.ctx('sess-2.band'), '70');
  s.setPct('sess-2', 96);
  assert.equal(contextOf(s.run(activity('PostToolUse', 'sess-2')), 'PostToolUse'), remindText(960));
});

test('sessions are separate', () => {
  const s = sandbox();
  s.setPct('sess-a', 101);
  s.setPct('sess-b', 94);
  assert.equal(s.run(activity('PostToolUse', 'sess-b')), '');
  assert.equal(contextOf(s.run(activity('PostToolUse', 'sess-a')), 'PostToolUse'), nowText(1010));
});

test('subagent (agent_id present) at 1010k -> no output, .band unchanged; without agent_id -> now text', () => {
  const s = sandbox();
  s.setPct('sess-1', 101);
  writeFileSync(s.ctx('sess-1.band'), '1');
  const sub = (event) => ({ ...activity(event), agent_id: 'agent-7f3a', agent_type: 'writer' });
  assert.equal(s.run(sub('PostToolUse')), '', 'subagent PostToolUse -> none');
  assert.equal(s.run(sub('UserPromptSubmit')), '', 'subagent UserPromptSubmit -> none');
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '1', '.band untouched by the subagent');

  // control: the same payload without agent_id (and with an empty one) is the main session
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), nowText(1010));
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '2');
  assert.equal(
    contextOf(s.run({ ...activity('UserPromptSubmit'), agent_id: '' }), 'UserPromptSubmit'),
    nowText(1010),
  );
});

test('missing pct file -> no output, exit 0', () => {
  const s = sandbox();
  assert.equal(s.run(activity('UserPromptSubmit')), '');
  assert.equal(s.run(activity('PostToolUse')), '');
  assert.deepEqual(listFiles(s.home), []);
});

test('garbage pct file -> no output, exit 0', () => {
  const s = sandbox();
  for (const garbage of ['', 'abc', '85%', '-90', '\u0000\u0001']) {
    s.setPct('sess-1', garbage);
    assert.equal(s.run(activity('UserPromptSubmit')), '', `pct ${JSON.stringify(garbage)}`);
  }
  assert.equal(existsSync(s.ctx('sess-1.band')), false);
});

test('garbage stdin / bad session id / other events -> no output, exit 0, nothing written', () => {
  const s = sandbox();
  s.setPct('sess-1', 101);
  assert.equal(s.run('not json'), '');
  assert.equal(s.run('null'), '');
  assert.equal(s.run({ hook_event_name: 'PostToolUse' }), '');
  assert.equal(s.run({ hook_event_name: 'PostToolUse', session_id: 42 }), '');
  assert.equal(s.run(activity('PostToolUse', '../sess-1')), '');
  assert.equal(s.run(activity('PreToolUse')), '');
  assert.equal(s.run(activity('Stop')), '');
  assert.deepEqual(listFiles(s.home), ['.claude/ctx/sess-1.pct']);
});

test('SessionStart compact with a checkpoint -> the content as additionalContext, band reset to 0', () => {
  const s = sandbox();
  s.setPct('sess-1', 101);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), nowText(1010));
  mkdirSync(join(s.project, '.aiwf'));
  const checkpoint = '# Checkpoint\n\n## След компресиране\n- прочети PLAN § UIR-040\n';
  writeFileSync(join(s.project, '.aiwf', 'checkpoint.md'), checkpoint);

  const stdout = s.run({ hook_event_name: 'SessionStart', source: 'compact', session_id: 'sess-1', cwd: 'unused' });
  assert.equal(contextOf(stdout, 'SessionStart'), `${CHECKPOINT_PREFIX}\n${checkpoint}`);
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '0');
  assert.equal(readFileSync(join(s.project, '.aiwf', 'checkpoint.md'), 'utf8'), checkpoint, 'checkpoint untouched');
});

test('SessionStart compact without a checkpoint -> no output (band still reset)', () => {
  const s = sandbox();
  writeFileSync(s.ctx('sess-1.band'), '2');
  assert.equal(s.run({ hook_event_name: 'SessionStart', source: 'compact', session_id: 'sess-1' }), '');
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '0');
  assert.deepEqual(listFiles(s.project), []);
});

test('SessionStart: payload cwd is the fallback when CLAUDE_PROJECT_DIR is not set', () => {
  const s = sandbox();
  mkdirSync(join(s.project, '.aiwf'));
  writeFileSync(join(s.project, '.aiwf', 'checkpoint.md'), 'cp');
  const env = { ...s.env };
  delete env.CLAUDE_PROJECT_DIR;
  const stdout = s.run({ hook_event_name: 'SessionStart', source: 'compact', session_id: 'sess-1', cwd: s.project }, { env });
  assert.equal(contextOf(stdout, 'SessionStart'), `${CHECKPOINT_PREFIX}\ncp`);
});

test('SessionStart with another source -> no output, state untouched', () => {
  const s = sandbox();
  mkdirSync(join(s.project, '.aiwf'));
  writeFileSync(join(s.project, '.aiwf', 'checkpoint.md'), 'cp');
  writeFileSync(s.ctx('sess-1.band'), '2');
  assert.equal(s.run({ hook_event_name: 'SessionStart', source: 'startup', session_id: 'sess-1' }), '');
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '2');
});

test('after a compaction a stale pct (not rewritten since) is ignored; a fresh one counts', () => {
  const s = sandbox();
  s.setPct('sess-1', 101);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), nowText(1010));
  const past = Date.now() / 1000 - 120;
  utimesSync(s.ctx('sess-1.pct'), past, past);

  assert.equal(s.run({ hook_event_name: 'SessionStart', source: 'compact', session_id: 'sess-1' }), '');
  assert.equal(s.run(activity('PostToolUse')), '', 'stale 1010k after compaction -> silent');
  assert.equal(s.run(activity('UserPromptSubmit')), '', 'stale 1010k after compaction -> silent on prompt too');
  assert.equal(readFileSync(s.ctx('sess-1.band'), 'utf8'), '0');

  const future = Date.now() / 1000 + 120;
  s.setPct('sess-1', 30);
  utimesSync(s.ctx('sess-1.pct'), future, future);
  assert.equal(s.run(activity('PostToolUse')), '');

  s.setPct('sess-1', 97);
  utimesSync(s.ctx('sess-1.pct'), future + 1, future + 1);
  assert.equal(contextOf(s.run(activity('PostToolUse')), 'PostToolUse'), remindText(970));
});
