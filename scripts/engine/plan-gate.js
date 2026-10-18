'use strict';
/*
 * plan-gate.js - the mechanical contract a plan FOLDER meets before a plan-class review pass starts.
 *
 * ONE CHECKER, THREE ENTRY POINTS. As a CLI it is run by the COO to stamp a plan's final text
 * (`--stamp <folder>`) and by anyone to check it (`--check <folder>`); the Codex review wrappers
 * (scripts/native/{ps,sh}/codex-review.*) pipe every brief into its brief mode; as a module it is
 * required by Gate 2 (pretooluse-dispatch-gate.js) for a Claude-hosted `reviewer` dispatch whose
 * prompt carries the line `Class: plan`. The shells forward only their own class flag (as
 * `--plan-class`); the recognition of a `Class: plan` LINE, the brief grammar and the folder contract
 * live HERE and nowhere else.
 *
 * THE FOLDER. `<plansDir>/active/<ABBR>/` holds the index `PLAN_<ABBR>.md`, `DECISIONS.md` and
 * `tickets/<ABBR>-NNN.md` - the frozen contract - plus `RESEARCH.md` and `records/`, which are NOT
 * part of it. The stamp sits with the plan's readiness history: `<plansDir>/readiness/<ABBR>/
 * stamp.json`, `<plansDir>` being the folder's grandparent.
 *
 * WHAT IT CHECKS - every problem at once, one `plan-gate: <token> - <message>` line each:
 *   index-missing                       no regular file PLAN_<ABBR>.md in the folder;
 *   tickets-over-cap:<n>                more than 3 ticket files (names of the grammar <ABBR>-NNN.md -
 *                                       any other file in tickets/ is not a ticket and not counted);
 *   ticket-over-bytes:<file>            a ticket over 6,144 bytes of LF-normalised UTF-8, its header
 *                                       `Status:` line not counted (the first line starting `Status:`
 *                                       above the first `## ` heading; one line at most - a `Status:`
 *                                       line in the body counts);
 *   field-missing:<file>:<field>        a ticket without one of the six column-0 headings `## Outcome`,
 *                                       `## Scope`, `## Acceptance`, `## Risk threshold`,
 *                                       `## Stop condition`, `## Verify` (case-sensitive);
 *   decision-uncited:D-NN               a `- **D-NN**` bullet of DECISIONS.md whose `plan:` names THIS
 *                                       plan and whose D-NN neither a ticket nor the index cites (a
 *                                       bullet naming another plan, or none, is not demanded here; a
 *                                       `<X>/D-NN` reference to ANOTHER plan cites that plan's
 *                                       decision, not this one's);
 *   decision-xref-unresolved:<X>/D-NN   a reference in the index, DECISIONS.md or a ticket to a plan
 *                                       with no DECISIONS.md under active/<X>/ or archive/<NNN>_PLAN_<X>_*
 *                                       (a reference to this plan resolves against this folder), or to
 *                                       a D-NN that file has no bullet for;
 *   tbd-found:<file>:<line>             a bare TBD, TODO or ??? outside code spans and fenced blocks
 *                                       (a mention of the words goes in a code span);
 *   codemap-path-missing:<file>:<path>  a backticked path in the first column of a ticket's `## Code Map`
 *                                       table that does not exist under the project root (a directory
 *                                       counts);
 *   stamp-missing, stamp-mismatch,      --check and brief mode only: no stamp; a contract hash that
 *   decision-xref-stale:<X>/D-NN        differs from the stamp's; a cross-referenced decision whose text
 *                                       changed after the stamp.
 * Brief mode adds line-missing:<name>, line-duplicate:<name>, class-not-plan and plan-folder-required
 * (also on --check of a path that is not a plan folder).
 *
 * THE STAMP. `--stamp` runs every check but the three stamp checks and writes nothing while any
 * problem stands. It records the SHA-256 of each contract file (the index, DECISIONS.md, every
 * tickets/*.md), the contract hash over `<name>\n<text>\n` per file in sorted name order, and the
 * SHA-256 of the bullet text (its `- **D-NN**` line up to the next decision or heading, trimmed) of
 * every decision a cross-reference cites. Texts are UTF-8 with CRLF normalised to LF, so a checkout
 * that converts line endings is not an edit; an mtime could not tell an edit from a touch.
 * RESEARCH.md and records/ change after the stamp by design and are outside it.
 *
 * THE PROJECT ROOT. Code Map paths are resolved against the process cwd on the CLI (`--check`,
 * `--stamp`: run them from the project root) and against `--project-root` / Gate 2's
 * CLAUDE_PROJECT_DIR in brief mode. The module calls take it as their second argument.
 *
 * BRIEF MODE. A plan-class brief carries, at column 0, `Class: plan` and
 * `PLAN: <plansDir>/active/<ABBR>` - a folder, resolved against the project root; every other line is
 * ignored. A missing or duplicated line, a class other than `plan` on a `--plan-class` run, and a PLAN
 * that is not a directory named by the ABBR grammar (`plan-folder-required` - a plan FILE included)
 * are problems; the folder is then checked exactly as by `--check`.
 *
 * HONEST LIMIT. This proves the folder's shape, its citations and that the contract is the text that
 * was stamped. It cannot prove the plan is good, that a citation is meaningful, or that the stamp
 * was taken by the COO over a text anyone read. A plan brief that carries neither the class flag nor
 * the `Class: plan` line is not recognised at all.
 *
 * OUTPUT AND FAIL DIRECTION. `--check`/`--stamp` print their lines on stdout; the brief mode, run by
 * the wrappers ahead of a paid engine, prints on stderr. A non-plan brief is never checked: without
 * `--plan-class` the CLI exits 0 before any other work unless the brief carries `Class: plan`, and a
 * brief that cannot even be read is passed with one stderr line - a defect here must not refuse a
 * code or docs pass. On the plan path and on `--check`/`--stamp` an unexpected error is
 * `internal-error` and exit 2: refusing is the safe direction. Gate 2 does not use the CLI; a throw
 * from the module lands in its fail-to-ask wrapper. `--hash <file>` (one file's SHA-256 line) stays
 * for the readers of monolith plans until they go.
 *
 * Zero dependencies beyond node core and ./aiwf-lib (readStdin, escapeRe, the plan-name grammars).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const lib = require('./aiwf-lib');

// The recognition line: column 0, the key exact, the value `plan` in any case, a trailing CR allowed.
const CLASS_PLAN_LINE = /^Class:[ \t]*[Pp][Ll][Aa][Nn][ \t]*\r?$/m;
const LINE_NAMES = ['Class', 'PLAN'];
const MAX_TICKETS = 3;
// A design constant standing for the ~1,500-token cap of one ticket.
const MAX_TICKET_BYTES = 6144;
const TICKET_FIELDS = ['Outcome', 'Scope', 'Acceptance', 'Risk threshold', 'Stop condition', 'Verify'];
const XREF_RE = /\b([A-Z]{2,8})\/D-(\d{2})\b/g;
const DECISION_LINE = /^- \*\*(D-\d{2})\*\*/;
const DECISION_PLAN = /plan:\s*([A-Z]{2,8})/g;
const TBD_RE = /\bTBD\b|\bTODO\b|\?\?\?/;
const USAGE = 'usage: node plan-gate.js --check <folder> | --stamp <folder>   (run from the project root)\n'
  + '       node plan-gate.js --project-root <root> [--plan-class]   (the brief on stdin)\n'
  + '       node plan-gate.js --hash <file>';
const REFUSED = 'plan-gate: refused - the plan folder fails its mechanical contract (plan-gate --check <folder>)';

/** True when the brief carries the `Class: plan` line at its first column. */
function isPlanBrief(text) {
  return typeof text === 'string' && CLASS_PLAN_LINE.test(text);
}

// ---- text helpers ------------------------------------------------------------
const lf = (text) => text.replace(/\r\n/g, '\n');
const sha = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const stripBom = (s) => (s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s);
const toLines = (text) => text.split('\n').map((l) => l.replace(/\r$/, ''));
const allMatches = (re, text) => {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  re.lastIndex = 0;
  return out;
};

/** Lowercase hex SHA-256 of the file's UTF-8 text with CRLF normalised to LF. Throws if unreadable. */
function planHash(absPath) {
  return sha(lf(fs.readFileSync(absPath, 'utf8')));
}

/** Every value of a `<NAME>: <value>` brief line that starts at column 0. */
function briefLineValues(brief, name) {
  return allMatches(new RegExp('^' + lib.escapeRe(name) + ':[ \\t]*(\\S.*?)[ \\t]*\\r?$', 'gm'), brief);
}

/**
 * true for every line inside a fenced code block, fences included. Opening fence: up to three
 * leading spaces, then three or more backticks or three or more tildes, an info string allowed.
 * Closing fence: up to three leading spaces, the SAME character, at least as many, nothing else but
 * spaces. A shorter fence inside a longer one does not close it; an unclosed fence runs to the end
 * of the file (nothing after it is read as contract text).
 */
function fencedMask(lines) {
  const mask = new Array(lines.length).fill(false);
  let open = null;
  for (let i = 0; i < lines.length; i++) {
    if (open === null) {
      const m = /^ {0,3}(`{3,}|~{3,})/.exec(lines[i]);
      if (m) { open = { ch: m[1][0], len: m[1].length }; mask[i] = true; }
      continue;
    }
    mask[i] = true;
    const m = /^ {0,3}(`{3,}|~{3,}) *$/.exec(lines[i]);
    if (m && m[1][0] === open.ch && m[1].length >= open.len) open = null;
  }
  return mask;
}

/**
 * The line with its code spans blanked: a run of N backticks opens a span that the next run of
 * exactly N backticks closes; a run with no closing partner is literal text.
 */
function stripCodeSpans(line) {
  let out = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] !== '`') { out += line[i]; i += 1; continue; }
    let n = 0;
    while (line[i + n] === '`') n += 1;
    let close = -1;
    let j = i + n;
    while (j < line.length) {
      if (line[j] !== '`') { j += 1; continue; }
      let k = 0;
      while (line[j + k] === '`') k += 1;
      if (k === n) { close = j; break; }
      j += k;
    }
    if (close === -1) { out += line.slice(i, i + n); i += n; continue; }
    out += ' ';
    i = close + n;
  }
  return out;
}

/** Markdown table cells: split on `|` except `\|`, unescape, trim, drop the outer empty cells. */
function splitCells(line) {
  const s = line.trim();
  const cells = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (s[i] === '|') { cells.push(cur); cur = ''; continue; }
    cur += s[i];
  }
  cells.push(cur);
  if (s.startsWith('|')) cells.shift();
  if (cells.length > 0 && s.endsWith('|') && !s.endsWith('\\|')) cells.pop();
  return cells.map((c) => c.trim());
}
const isRowLine = (line) => /^\s*\|/.test(line);
// A delimiter row has EXACTLY the header's cell count (GFM): a shorter or longer one makes no table.
const isSeparator = (line, expectedCount) => {
  if (!isRowLine(line)) return false;
  const cells = splitCells(line);
  return cells.length === expectedCount && cells.every((c) => /^:?-{3,}:?$/.test(c));
};

/** The first table - a `|` header line over a separator row of the same width - and its data rows. */
function firstTable(lines) {
  for (let i = 0; i + 1 < lines.length; i++) {
    if (!isRowLine(lines[i])) continue;
    const header = splitCells(lines[i]);
    if (!isSeparator(lines[i + 1], header.length)) continue;
    const rows = [];
    for (let j = i + 2; j < lines.length && isRowLine(lines[j]); j++) rows.push(splitCells(lines[j]));
    return rows;
  }
  return [];
}

// ---- the folder --------------------------------------------------------------
/** The text of a regular file, or null when it is absent or not a regular file. */
function readFileText(abs) {
  try {
    return fs.statSync(abs).isFile() ? fs.readFileSync(abs, 'utf8') : null;
  } catch (e) {
    return null;
  }
}

/** A contract file: its `/`-separated name in the folder, raw and LF text, lines and fence mask. */
function contractFile(rel, raw) {
  const text = lf(raw);
  const lines = toLines(stripBom(text));
  return { rel, raw, text, lines, mask: fencedMask(lines) };
}

/** Every `.md` regular file of a directory, sorted by name, as contract files named `<prefix>/<name>`. */
function listMd(dir, prefix) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return [];
  }
  return entries.filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name).sort()
    .map((name) => Object.assign(contractFile(`${prefix}/${name}`, fs.readFileSync(path.join(dir, name), 'utf8')), { name }));
}

function readFolder(abs) {
  const abbr = path.basename(abs);
  const indexName = `PLAN_${abbr}.md`;
  const indexRaw = readFileText(path.join(abs, indexName));
  const decisionsRaw = readFileText(path.join(abs, 'DECISIONS.md'));
  const ticketFiles = listMd(path.join(abs, 'tickets'), 'tickets');
  return {
    abs,
    abbr,
    plansDir: path.dirname(path.dirname(abs)),
    indexName,
    index: indexRaw === null ? null : contractFile(indexName, indexRaw),
    decisions: decisionsRaw === null ? null : contractFile('DECISIONS.md', decisionsRaw),
    // Every .md in tickets/ is in the stamp; only the names of the ticket grammar are tickets.
    ticketFiles,
    tickets: ticketFiles.filter((t) => lib.PLAN_TICKET_FILE_RE.test(t.name)),
  };
}

/**
 * The decisions of a DECISIONS.md: each unfenced `- **D-NN**` bullet, its text running to the next
 * `- **D-` line or heading, and the plan its LAST `plan: <ABBR>` names (null when it names none).
 */
function parseDecisions(file) {
  const out = [];
  if (file === null) return out;
  let cur = null;
  const close = () => {
    if (cur === null) return;
    const text = cur.lines.join('\n').trim();
    const plans = allMatches(DECISION_PLAN, text);
    out.push({ id: cur.id, text, plan: plans.length > 0 ? plans[plans.length - 1] : null });
    cur = null;
  };
  file.lines.forEach((line, i) => {
    const unfenced = !file.mask[i];
    if (unfenced && (/^- \*\*D-/.test(line) || /^#{1,6}[ \t]/.test(line))) close();
    const m = unfenced ? DECISION_LINE.exec(line) : null;
    if (m) { cur = { id: m[1], lines: [line] }; return; }
    if (cur !== null) cur.lines.push(line);
  });
  close();
  return out;
}

/** True when the file cites decision `id` of plan `abbr`: the bare D-NN, or `<abbr>/D-NN`. */
function citesDecision(file, id, abbr) {
  const text = file.lines.join('\n');
  // The D-NN of a reference to ANOTHER plan cites that plan's decision.
  const foreign = new Set();
  for (const m of text.matchAll(XREF_RE)) {
    if (m[1] !== abbr) foreign.add(m.index + m[1].length + 1);
  }
  const re = new RegExp('(?<![A-Za-z0-9-])' + lib.escapeRe(id) + '(?![0-9])', 'g');
  for (const m of text.matchAll(re)) {
    if (!foreign.has(m.index)) return true;
  }
  return false;
}

/** The DECISIONS.md a reference to plan `x` resolves to, or null. */
function decisionsSourceOf(model, x) {
  if (x === model.abbr) return path.join(model.abs, 'DECISIONS.md');
  const active = path.join(model.plansDir, 'active', x, 'DECISIONS.md');
  if (readFileText(active) !== null) return active;
  const archive = path.join(model.plansDir, 'archive');
  let dirs = [];
  try {
    dirs = fs.readdirSync(archive, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch (e) {
    dirs = [];
  }
  const named = new RegExp('^\\d+_PLAN_' + lib.escapeRe(x) + '_');
  for (const d of dirs) {
    if (!named.test(d)) continue;
    const file = path.join(archive, d, 'DECISIONS.md');
    if (readFileText(file) !== null) return file;
  }
  return null;
}

/** Every `<X>/D-NN` of the files, sorted, each resolved to { hash } or { why }. */
function resolveXrefs(model, files) {
  const keys = new Map();
  for (const f of files) {
    for (const m of f.lines.join('\n').matchAll(XREF_RE)) keys.set(`${m[1]}/D-${m[2]}`, { x: m[1], id: `D-${m[2]}` });
  }
  const sources = new Map();
  const out = new Map();
  for (const key of [...keys.keys()].sort()) {
    const { x, id } = keys.get(key);
    if (!sources.has(x)) {
      const src = decisionsSourceOf(model, x);
      const raw = src === null ? null : readFileText(src);
      sources.set(x, raw === null ? null : parseDecisions(contractFile('DECISIONS.md', raw)));
    }
    const decisions = sources.get(x);
    const hit = decisions === null ? null : decisions.find((d) => d.id === id);
    if (decisions === null) out.set(key, { why: `plan ${x} has no DECISIONS.md under active/${x}/ or archive/<NNN>_PLAN_${x}_*/` });
    else if (hit === undefined) out.set(key, { why: `the DECISIONS.md of plan ${x} has no "- **${id}**" bullet` });
    else out.set(key, { hash: sha(hit.text) });
  }
  return out;
}

/** The backticked paths in the first column of the ticket's `## Code Map` table. */
function codeMapPaths(ticket) {
  const start = ticket.lines.findIndex((l, i) => !ticket.mask[i] && /^## Code Map[ \t]*$/.test(l));
  if (start === -1) return [];
  let end = ticket.lines.length;
  for (let j = start + 1; j < ticket.lines.length; j++) {
    if (!ticket.mask[j] && /^#{1,6}[ \t]/.test(ticket.lines[j])) { end = j; break; }
  }
  const paths = [];
  for (const cells of firstTable(ticket.lines.slice(start + 1, end))) {
    for (const span of (cells[0] || '').matchAll(/`([^`]+)`/g)) {
      for (const p of span[1].split(', ')) if (p.trim() !== '') paths.push(p.trim());
    }
  }
  return paths;
}

/** The stamp's content for the folder as it is now: per-file hashes, the contract hash, the xrefs. */
function contractOf(model, resolved) {
  const files = {};
  if (model.index !== null) files[model.index.rel] = model.index.text;
  if (model.decisions !== null) files[model.decisions.rel] = model.decisions.text;
  for (const t of model.ticketFiles) files[t.rel] = t.text;
  const names = Object.keys(files).sort();
  const xrefs = {};
  for (const [key, r] of resolved) if (r.hash) xrefs[key] = r.hash;
  return {
    contract: sha(names.map((n) => `${n}\n${files[n]}\n`).join('')),
    files: Object.fromEntries(names.map((n) => [n, sha(files[n])])),
    xrefs,
  };
}

const stampPathOf = (model) => path.join(model.plansDir, 'readiness', model.abbr, 'stamp.json');

/**
 * The bytes the cap counts: the ticket's LF-normalised UTF-8 minus its header `Status:` line - the
 * FIRST line starting `Status:` above the first `## ` heading, fenced blocks ignored - so a status
 * flip in the header never moves a ticket across the cap. Only that one line is ever excluded: a
 * `Status:` line below the first heading is body text and counts, and a ticket with no `## `
 * heading has no header to exclude from. The stamp still hashes the whole text.
 */
function countedTicketBytes(t) {
  const firstHeading = t.lines.findIndex((l, i) => !t.mask[i] && l.startsWith('## '));
  const header = firstHeading === -1 ? [] : t.lines.slice(0, firstHeading).map((l, i) => (t.mask[i] ? '' : l));
  const status = header.filter((l) => l.startsWith('Status:')).slice(0, 1);
  const excluded = status.reduce((n, l) => n + Buffer.byteLength(`${l}\n`, 'utf8'), 0);
  return Buffer.byteLength(t.text, 'utf8') - excluded;
}

/**
 * Every problem of the folder, in this order: the folder itself, the index, the cap, each ticket's
 * bytes and fields, decision coverage, cross-references, open items, Code Map paths, and - with
 * `withStamp` - the stamp. A folder that is not one is the only problem reported.
 */
function examine(folderArg, root, withStamp) {
  const problems = [];
  const add = (token, message) => problems.push({ token, message });
  const abs = path.resolve(root, folderArg);
  let st = null;
  try {
    st = fs.statSync(abs);
  } catch (e) {
    st = null;
  }
  if (st === null || !st.isDirectory() || !lib.PLAN_ABBR_RE.test(path.basename(abs))) {
    add('plan-folder-required', `${folderArg} is not a plan folder - a directory <plansDir>/active/<ABBR> named by the grammar [A-Z]{2,8} (a plan FILE is not accepted)`);
    return { problems, model: null, contract: null };
  }
  const model = readFolder(abs);

  if (model.index === null) add('index-missing', `the folder has no regular file ${model.indexName}`);
  if (model.tickets.length > MAX_TICKETS) {
    add(`tickets-over-cap:${model.tickets.length}`, `tickets/ holds ${model.tickets.length} ticket files - a plan carries at most ${MAX_TICKETS}; split it`);
  }
  for (const t of model.tickets) {
    const bytes = countedTicketBytes(t);
    if (bytes > MAX_TICKET_BYTES) add(`ticket-over-bytes:${t.rel}`, `${t.rel} is ${bytes} bytes of LF-normalised UTF-8, its header Status: line not counted - the cap is ${MAX_TICKET_BYTES}`);
    const headings = new Set(t.lines.filter((l, i) => !t.mask[i]).map((l) => l.replace(/[ \t]+$/, '')));
    for (const f of TICKET_FIELDS) {
      if (!headings.has(`## ${f}`)) add(`field-missing:${t.rel}:${f}`, `${t.rel} has no "## ${f}" heading at its first column`);
    }
  }

  const surface = [model.index, ...model.tickets].filter((f) => f !== null);
  const demanded = new Set();
  for (const d of parseDecisions(model.decisions)) {
    if (d.plan !== model.abbr || demanded.has(d.id)) continue;
    demanded.add(d.id);
    if (!surface.some((f) => citesDecision(f, d.id, model.abbr))) {
      add(`decision-uncited:${d.id}`, `${d.id} names plan ${model.abbr}, but no ticket file and no line of ${model.indexName} cites it`);
    }
  }

  const scanned = [model.index, model.decisions, ...model.tickets].filter((f) => f !== null);
  const resolved = resolveXrefs(model, scanned);
  for (const [key, r] of resolved) if (r.why) add(`decision-xref-unresolved:${key}`, `${key} does not resolve: ${r.why}`);

  for (const f of scanned) {
    f.lines.forEach((line, i) => {
      if (!f.mask[i] && TBD_RE.test(stripCodeSpans(line))) {
        add(`tbd-found:${f.rel}:${i + 1}`, `${f.rel} line ${i + 1} carries a bare TBD, TODO or ??? - the frozen contract has no open item (a mention of the word goes in a code span)`);
      }
    });
  }

  for (const t of model.tickets) {
    for (const p of codeMapPaths(t)) {
      if (!fs.existsSync(path.resolve(root, p))) add(`codemap-path-missing:${t.rel}:${p}`, `the Code Map of ${t.rel} names ${p}, which does not exist under the project root`);
    }
  }

  const contract = contractOf(model, resolved);
  if (withStamp) {
    const stampRel = `readiness/${model.abbr}/stamp.json`;
    const raw = readFileText(stampPathOf(model));
    if (raw === null) add('stamp-missing', `no ${stampRel} - stamp the plan's final text with plan-gate --stamp <folder>`);
    else {
      let s = null;
      try {
        s = JSON.parse(stripBom(raw));
      } catch (e) {
        s = null;
      }
      if (s === null || typeof s !== 'object' || Array.isArray(s) || typeof s.contract !== 'string') {
        add('stamp-mismatch', `${stampRel} is not a stamp (unparseable, or no "contract" hash) - stamp the plan again`);
      } else {
        if (s.plan !== model.abbr || s.contract !== contract.contract) {
          add('stamp-mismatch', `the contract is not the stamped text (stamped ${String(s.contract).slice(0, 12)}..., now ${contract.contract.slice(0, 12)}...) - re-stamp over the text that will be reviewed`);
        }
        const recorded = s.xrefs !== null && typeof s.xrefs === 'object' ? s.xrefs : {};
        for (const [key, h] of Object.entries(contract.xrefs)) {
          if (typeof recorded[key] === 'string' && recorded[key] !== h) {
            add(`decision-xref-stale:${key}`, `the text of ${key} changed after the stamp - re-read it and re-stamp`);
          }
        }
      }
    }
  }
  return { problems, model, contract };
}

// ---- the module API ----------------------------------------------------------
/** Checks a plan folder, stamp included. `root` (default: the cwd) resolves the folder and the Code Map. */
function checkPlanFolder(folder, root) {
  const r = examine(folder, typeof root === 'string' ? root : process.cwd(), true);
  return { ok: r.problems.length === 0, problems: r.problems };
}

/** Stamps a plan folder that passes every check but the stamp's; writes nothing on a problem. */
function stampPlanFolder(folder, root) {
  const r = examine(folder, typeof root === 'string' ? root : process.cwd(), false);
  if (r.problems.length > 0) return { ok: false, problems: r.problems, stampPath: null };
  const stampPath = stampPathOf(r.model);
  const stamp = {
    plan: r.model.abbr,
    contract: r.contract.contract,
    files: r.contract.files,
    xrefs: r.contract.xrefs,
    stampedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(stampPath), { recursive: true });
  fs.writeFileSync(stampPath, `${JSON.stringify(stamp, null, 2)}\n`);
  return { ok: true, problems: [], stampPath };
}

/**
 * Checks a plan-class brief: its `Class:` and `PLAN:` lines, then the folder PLAN names, resolved
 * against projectRoot. Returns { ok, problems: [{ token, message }] } with EVERY problem; a missing
 * or duplicated PLAN line skips the folder rather than reporting derived problems.
 */
function checkPlanBrief(briefText, projectRoot) {
  const problems = [];
  const add = (token, message) => problems.push({ token, message });
  const brief = stripBom(typeof briefText === 'string' ? briefText : '');
  const root = typeof projectRoot === 'string' ? projectRoot : '';

  const vals = {};
  for (const name of LINE_NAMES) {
    vals[name] = briefLineValues(brief, name);
    if (vals[name].length === 0) {
      add(`line-missing:${name}`, `the brief has no "${name}: <value>" line starting at its first column`);
    } else if (vals[name].length > 1) {
      add(`line-duplicate:${name}`, `the brief carries ${vals[name].length} "${name}:" lines - exactly one is allowed, so none of them is used`);
    } else if (name === 'Class' && vals[name][0].toLowerCase() !== 'plan') {
      add('class-not-plan', `the run is plan-class but the brief's class line reads "${vals[name][0]}"`);
    }
  }
  if (vals.PLAN.length === 1) problems.push(...examine(vals.PLAN[0], path.resolve(root), true).problems);
  return { ok: problems.length === 0, problems };
}

// ---- CLI ---------------------------------------------------------------------
function parseArgs(argv) {
  if (argv.length === 2 && argv[0] === '--hash') return { mode: 'hash', file: argv[1] };
  if (argv.length === 2 && (argv[0] === '--check' || argv[0] === '--stamp') && argv[1] !== '') {
    return { mode: argv[0].slice(2), folder: argv[1] };
  }
  let root = null;
  let planClass = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project-root' && root === null && i + 1 < argv.length && argv[i + 1] !== '') { root = argv[i + 1]; i += 1; continue; }
    if (argv[i] === '--plan-class' && !planClass) { planClass = true; continue; }
    return null;
  }
  return root === null ? null : { mode: 'brief', root, planClass };
}

async function main(argv, state) {
  const args = parseArgs(argv);
  if (args === null) {
    process.stderr.write(`plan-gate: ${USAGE}\n`);
    process.exitCode = 2;
    return;
  }
  if (args.mode === 'hash') {
    let hex;
    try {
      hex = planHash(path.resolve(args.file));
    } catch (e) {
      process.stderr.write(`plan-gate: cannot read ${args.file} - ${e && e.message ? e.message : String(e)}\n`);
      process.exitCode = 2;
      return;
    }
    process.stdout.write(`PLAN SHA256: ${hex}\n`);
    return;
  }
  if (args.mode === 'check' || args.mode === 'stamp') {
    state.planPath = true;
    const res = args.mode === 'check' ? checkPlanFolder(args.folder) : stampPlanFolder(args.folder);
    if (res.ok) {
      if (args.mode === 'stamp') process.stdout.write(`plan-gate: stamped ${path.relative(process.cwd(), res.stampPath).split(path.sep).join('/')}\n`);
      return;
    }
    for (const p of res.problems) process.stdout.write(`plan-gate: ${p.token} - ${p.message}\n`);
    process.stdout.write(`${REFUSED}\n`);
    process.exitCode = 2;
    return;
  }

  state.planPath = args.planClass;
  let brief = null;
  let stdinFailed = false;
  try {
    process.stdin.on('error', () => { stdinFailed = true; });
    brief = await lib.readStdin();
  } catch (e) {
    brief = null;
  }
  if (brief === null || stdinFailed) {
    if (!args.planClass) {
      process.stderr.write('plan-gate: brief unreadable, not a plan-class run - passing\n');
      return;
    }
    throw new Error('the brief on stdin could not be read');
  }
  if (!args.planClass && !isPlanBrief(brief)) return; // not a plan brief: nothing to check, nothing printed
  state.planPath = true;

  const res = checkPlanBrief(brief, path.resolve(args.root));
  if (res.ok) return;
  for (const p of res.problems) process.stderr.write(`plan-gate: ${p.token} - ${p.message}\n`);
  process.stderr.write(`${REFUSED}\n`);
  process.exitCode = 2;
}

if (require.main === module) {
  const state = { planPath: false };
  main(process.argv.slice(2), state).catch((err) => {
    const msg = err && err.message ? err.message : String(err);
    if (!state.planPath) {
      // A defect in this checker must never refuse a pass that is not plan-class.
      process.stderr.write('plan-gate: brief unreadable, not a plan-class run - passing\n');
      process.exitCode = 0;
      return;
    }
    process.stderr.write(`plan-gate: internal-error - ${msg}\n`);
    process.exitCode = 2;
  });
}

module.exports = { checkPlanFolder, stampPlanFolder, checkPlanBrief, isPlanBrief, planHash };
