#!/usr/bin/env node
// PLAN_STAB acceptance instrument (dev tooling, not payload).
// Reads every "#### <ID> → <file>[, <file>...]" heading of the plan and the ```text block under it,
// and checks that each block's text is present in each named file, comparing with all runs of
// whitespace collapsed to one space (the payload wraps at ~100 columns, so a block spans lines).
// Exit 0 when every block is present in every file; exit 1 with one MISSING line per gap; exit 2 on
// a plan it cannot parse. Paths in headings are relative to the current directory (the repo root).
import { readFileSync, existsSync } from 'node:fs';

const planPath = process.argv[2];
if (!planPath || !existsSync(planPath)) {
  console.error(`usage: node check-blocks.mjs <plan file>  (not found: ${planPath ?? '<none>'})`);
  process.exit(2);
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const lines = readFileSync(planPath, 'utf8').split(/\r?\n/);
const blocks = [];
for (let i = 0; i < lines.length; i++) {
  const h = /^#### (\S+) → (.+)$/.exec(lines[i]);
  if (!h) continue;
  if (lines[i + 1] !== '```text') {
    console.error(`heading for ${h[1]} at line ${i + 1} is not followed by a \`\`\`text fence`);
    process.exit(2);
  }
  const body = [];
  let j = i + 2;
  while (j < lines.length && lines[j] !== '```') body.push(lines[j++]);
  if (j >= lines.length) {
    console.error(`block ${h[1]} has no closing fence`);
    process.exit(2);
  }
  blocks.push({ id: h[1], files: h[2].split(',').map((f) => f.trim()), text: norm(body.join('\n')) });
  i = j;
}
if (blocks.length === 0) {
  console.error('no "#### <ID> → <file>" blocks found');
  process.exit(2);
}

const cache = new Map();
const read = (f) => {
  if (!cache.has(f)) cache.set(f, existsSync(f) ? norm(readFileSync(f, 'utf8')) : null);
  return cache.get(f);
};

// An ID that starts with "!" names OLD text that must be ABSENT from its files (a replaced sentence).
let present = 0;
let absent = 0;
const want = blocks.filter((b) => !b.id.startsWith('!'));
const gone = blocks.filter((b) => b.id.startsWith('!'));
for (const b of want) {
  let ok = true;
  for (const f of b.files) {
    const s = read(f);
    if (s === null) { console.log(`MISSING ${b.id} in ${f} (file not found)`); ok = false; }
    else if (!s.includes(b.text)) { console.log(`MISSING ${b.id} in ${f}`); ok = false; }
    else if (s.indexOf(b.text) !== s.lastIndexOf(b.text)) { console.log(`DUPLICATE ${b.id} in ${f}`); ok = false; }
  }
  if (ok) present++;
}
for (const b of gone) {
  let ok = true;
  for (const f of b.files) {
    const s = read(f);
    if (s !== null && s.includes(b.text)) { console.log(`STILL PRESENT ${b.id} in ${f}`); ok = false; }
  }
  if (ok) absent++;
}
console.log(`blocks: ${present}/${want.length} present, ${absent}/${gone.length} old texts gone`);
process.exit(present === want.length && absent === gone.length ? 0 : 1);
