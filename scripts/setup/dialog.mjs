/*
 * The two primitives an operator DIALOG needs, shared by both engines.
 *
 * WHY THEY LIVE HERE AND NOT IN EITHER CLI
 *   The update CLI (scripts/update/aiwf-update.mjs) asks the conflict question; the setup engine
 *   asks the adopt question. Both need the same synchronous stdin read and the same content preview,
 *   and a second copy of either is exactly how the two dialogs would start describing the same file
 *   differently. This module imports nothing of the engines, so neither import direction can become
 *   a cycle (migrate.mjs already imports scripts/setup/generate.mjs).
 */

import fs from 'node:fs';

/**
 * A SYNCHRONOUS prompt, so the engines stay synchronous.
 *
 * The update engine's write sequence is deliberately synchronous: every write boundary is a point a
 * crash must be recoverable from, and an await between the journal and the target would add
 * boundaries the journal does not describe. The setup engine plans and writes in one synchronous
 * pass for the same reason - the plan is decided in full before the first byte. So the interactive
 * adapter reads stdin synchronously rather than turning either engine async for the sake of the one
 * path a machine never takes.
 */
export function promptSync(text) {
  process.stdout.write(text);
  const buf = Buffer.alloc(4096);
  let out = '';
  for (;;) {
    let n = 0;
    try {
      n = fs.readSync(0, buf, 0, buf.length, null);
    } catch (e) {
      if (e.code === 'EAGAIN') { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20); continue; }
      if (e.code === 'EOF') break;
      throw e;
    }
    if (n === 0) break;
    out += buf.toString('utf8', 0, n);
    if (out.includes('\n')) break;
  }
  return out.split('\n')[0].trim();
}

/**
 * The head of a piece of content, for a dialog or a report: a line count and the first `max` lines.
 * A decision about a file is taken on what that file SAYS, and a dialog that names a path without
 * showing anything asks the operator to answer from memory.
 */
export function previewLines(label, text, max = 6) {
  if (text === null || text === undefined) return [`  ${label}: (not on disk)`];
  const lines = text.split('\n');
  const head = lines.slice(0, max).map((l) => `    | ${l}`);
  if (lines.length > max) head.push(`    | ... (${lines.length - max} more line(s))`);
  return [`  ${label}: ${lines.length} line(s)`, ...head];
}
