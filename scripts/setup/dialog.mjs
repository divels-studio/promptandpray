/*
 * The one primitive an operator dialog needs: a synchronous stdin prompt.
 *
 * WHERE IT IS USED
 *   The update CLI (scripts/update/aiwf-update.mjs) asks for the value of a new config key a
 *   migration marks `askOperator`. Nothing else asks: a render overwrites, so there is no file
 *   dialog left. This module imports nothing of the engines, so no import direction can become a
 *   cycle (migrate.mjs already imports scripts/setup/generate.mjs).
 */

import fs from 'node:fs';

/**
 * A SYNCHRONOUS prompt, so the engines stay synchronous.
 *
 * The update engine applies its operations in one synchronous pass, and the setup engine plans and
 * writes in one synchronous pass too - the plan is decided in full before the first byte. So the
 * interactive adapter reads stdin synchronously rather than turning either engine async for the
 * sake of the one path a machine never takes.
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
