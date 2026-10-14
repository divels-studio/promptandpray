// UserPromptSubmit / PostToolUse / SessionStart(compact) hook (HARD-024; ported from Silerax UIR-040/041): the context ceiling.
// Rule: dev/PROJECT_OVERRIDES.md § Loop shape "Чекпойнт по гейтове и таван на контекста".
// Reads the per-session context % and window size that ~/.claude/statusline.sh writes to ~/.claude/ctx/<session_id>.pct
// and .size (UIR-041), turns them into tokens (missing / bad size -> 1 000 000), reminds once on entering 950k tokens,
// says "checkpoint now" on entering 1000k (and on every prompt while at or above 1000k). Thresholds 950k / 1000k
// (operator 2026-10-14; before: 400k / 450k) - auto-compact is the operator's (`/autocompact`), the hook assumes no value.
// Subagent hooks carry the parent's session_id, so activity events with an agent_id stay silent.
// After a compaction it returns .aiwf/checkpoint.md as context and resets the announced band.
// Writes only under ~/.claude/ctx/. Never blocks: bad input or any error -> exit 0, no output.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const REMIND_TOKENS = 950000;
export const NOW_TOKENS = 1000000;
export const DEFAULT_WINDOW_SIZE = 1000000;

// Stored band levels. Any other stored value (e.g. the UIR-040 70 / 80) reads as 0.
export const BAND_NONE = 0;
export const BAND_REMIND = 1;
export const BAND_NOW = 2;

const SESSION_ID = /^[A-Za-z0-9_-]+$/;
const NUMBER = /^(\d+(\.\d*)?|\.\d+)$/;
const INTEGER = /^\d+$/;
const BANDS = new Set([BAND_NONE, BAND_REMIND, BAND_NOW]);

export const remindText = (k) =>
  `Контекстът е ${k}k токена — пиши чекпойнта (.aiwf/checkpoint.md) на следващия гейт (правило „Чекпойнт по гейтове", overrides § Loop shape).`;
export const nowText = (k) =>
  `Контекстът е ${k}k токена — пиши чекпойнта (.aiwf/checkpoint.md) СЕГА, след текущата стъпка.`;
export const CHECKPOINT_PREFIX =
  'Чекпойнт след компресиране — прочети го и продължи по раздела „After /compact"/„След компресиране":';

/** @param {number} tokens */
export function bandOf(tokens) {
  if (tokens >= NOW_TOKENS) return BAND_NOW;
  if (tokens >= REMIND_TOKENS) return BAND_REMIND;
  return BAND_NONE;
}

/** Window size from the .size file content; missing / garbage / non-positive -> 1 000 000. @param {unknown} raw */
export function parseSize(raw) {
  if (typeof raw !== 'string') return DEFAULT_WINDOW_SIZE;
  const s = raw.trim();
  if (!INTEGER.test(s)) return DEFAULT_WINDOW_SIZE;
  const n = Number(s);
  return Number.isSafeInteger(n) && n > 0 ? n : DEFAULT_WINDOW_SIZE;
}

/** @param {number} pct @param {number} size */
export const tokensOf = (pct, size) => (pct / 100) * size;

/** @param {unknown} raw @returns {number | null} */
export function parsePct(raw) {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!NUMBER.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Pure decision for UserPromptSubmit / PostToolUse.
 * @param {string} event hook_event_name
 * @param {number} tokens current context in tokens
 * @param {number} storedBand last announced band level (0 / 1 / 2)
 * @returns {{ text: string | null, band: number }} band = the level to store (unchanged = no write)
 */
export function decide(event, tokens, storedBand) {
  const band = bandOf(tokens);
  const k = Math.round(tokens / 1000);
  if (band > storedBand) return { text: band === BAND_NOW ? nowText(k) : remindText(k), band };
  if (band < storedBand) return { text: null, band };
  if (band === BAND_NOW && event === 'UserPromptSubmit') return { text: nowText(k), band };
  return { text: null, band };
}

function readSize(path) {
  try {
    return parseSize(readFileSync(path, 'utf8'));
  } catch {
    return DEFAULT_WINDOW_SIZE;
  }
}

const ctxDir = () => join(homedir(), '.claude', 'ctx');

function readBand(path) {
  try {
    const n = Number(readFileSync(path, 'utf8').trim());
    return BANDS.has(n) ? n : BAND_NONE;
  } catch {
    return BAND_NONE;
  }
}

function onActivity(event, sessionId) {
  const dir = ctxDir();
  const pctPath = join(dir, `${sessionId}.pct`);
  let raw;
  let pctMtime;
  try {
    raw = readFileSync(pctPath, 'utf8');
    pctMtime = statSync(pctPath).mtimeMs;
  } catch {
    return null;
  }
  const pct = parsePct(raw);
  if (pct === null) return null;
  // Right after a compaction the statusline may get a null % and leave the pre-compaction number in place:
  // a .pct not rewritten since the compaction is stale and is ignored.
  try {
    if (pctMtime <= statSync(join(dir, `${sessionId}.compacted`)).mtimeMs) return null;
  } catch {
    // no compaction marker -> the .pct is current
  }
  const bandPath = join(dir, `${sessionId}.band`);
  const stored = readBand(bandPath);
  const tokens = tokensOf(pct, readSize(join(dir, `${sessionId}.size`)));
  const result = decide(event, tokens, stored);
  // Store before emitting: if the band cannot be stored, stay silent rather than repeat on every call.
  if (result.band !== stored) writeFileSync(bandPath, String(result.band));
  return result.text;
}

function onCompact(payload, sessionId) {
  if (typeof payload.source === 'string' && payload.source !== 'compact') return null;
  if (sessionId) {
    try {
      const dir = ctxDir();
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${sessionId}.band`), String(BAND_NONE));
      writeFileSync(join(dir, `${sessionId}.compacted`), String(Date.now()));
    } catch {
      // the checkpoint still comes back even if the state cannot be reset
    }
  }
  const envRoot = process.env.CLAUDE_PROJECT_DIR;
  const root = typeof envRoot === 'string' && envRoot !== '' ? envRoot : payload.cwd;
  if (typeof root !== 'string' || root === '') return null;
  const file = join(root, '.aiwf', 'checkpoint.md');
  if (!existsSync(file)) return null;
  return `${CHECKPOINT_PREFIX}\n${readFileSync(file, 'utf8')}`;
}

function main() {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  if (payload === null || typeof payload !== 'object') return;
  const event = payload.hook_event_name;
  const sessionId =
    typeof payload.session_id === 'string' && SESSION_ID.test(payload.session_id) ? payload.session_id : null;
  let text = null;
  if (event === 'UserPromptSubmit' || event === 'PostToolUse') {
    if (!sessionId) return;
    // A subagent's hooks get the parent's session_id: the % is the parent's, not the subagent's context.
    if (typeof payload.agent_id === 'string' && payload.agent_id !== '') return;
    text = onActivity(event, sessionId);
  } else if (event === 'SessionStart') {
    text = onCompact(payload, sessionId);
  }
  if (!text) return;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }));
}

const isDirectRun =
  typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    main();
  } catch {
    // never block the session
  }
  process.exitCode = 0;
}
