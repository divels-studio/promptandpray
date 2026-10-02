'use strict';
/*
 * plan-gate.js - the readiness artifacts a plan-class review pass does not start without.
 *
 * ONE CHECKER, TWO ENTRY POINTS. As a module it is required by Gate 2 (pretooluse-dispatch-gate.js)
 * for a Claude-hosted `reviewer` dispatch whose prompt carries the line `Class: plan`; as a CLI it is
 * run by the Codex review wrappers (scripts/native/{ps,sh}/codex-review.*) on every brief, and by the
 * COO to stamp the own pass (`--hash`). The shells forward only their own class flag (as
 * `--plan-class`); the recognition of a `Class: plan` LINE, the line grammar and the file formats
 * live HERE and nowhere else.
 *
 * WHAT IT CHECKS. A plan-readiness brief names, on five fixed lines starting at its first column,
 * the class (`Class: plan`), the plan file (`PLAN:`), the tickets this pass audits (`TICKETS:`), the
 * consequence scan (`CONSEQUENCE SCAN:`, /pnp:review Step 2c) and the COO's own pass (`OWN PASS:`,
 * Step 2d). The checker reads the three FILES - never a count the brief reports about them - and
 * returns every problem at once: a missing or duplicated line, a ref that is not a ticket heading of
 * the plan, a missing file, a scan table with a bad header, a malformed, incomplete or still-open
 * scan row, an audited ticket with no scan row or no own-pass row, an empty own-pass cell, a missing
 * `BLOCKERS FOUND:` line, an instrument whose broken run reads like its valid one, and an own pass
 * whose `PLAN SHA256:` is not the hash of the plan file as it is now.
 *
 * WHY `TICKETS`. The pass audits some tickets of a plan, not necessarily all of them: an extended
 * plan (a new ticket in an old plan) must not owe rows for tickets that closed long ago. So coverage
 * is demanded for exactly the refs the brief names, and each of them must be a ticket HEADING of the
 * plan under review (a heading whose first token is the ref, outside a fenced block) - a ref merely
 * mentioned in prose is not a ticket.
 *
 * WHY A HASH. The own pass is the LAST act over the plan. Its file carries the SHA-256 of the plan's
 * text (UTF-8, CRLF normalised to LF, so a checkout that converts line endings is not an edit); any
 * edit after the stamp changes the hash and the pass refuses until the own pass is redone over the
 * text that will be dispatched. An mtime could not tell an edit from a touch.
 *
 * HONEST LIMIT. This proves presence, shape and that the own pass was stamped over the plan file the
 * brief names. It cannot prove the own pass was good, that it ran in a turn of its own, or that a
 * pass N+1 scan really covered the revision. A plan brief that carries neither the class flag nor
 * the `Class: plan` line is not recognised at all.
 *
 * FAIL DIRECTION. A non-plan brief is never checked: without `--plan-class` the CLI exits 0 before
 * any other work unless the brief carries `Class: plan`, and a brief that cannot even be read is
 * passed with one stderr line - a defect here must not refuse a code or docs pass. On the plan path
 * an unexpected error is `internal-error` and exit 2: refusing is the safe direction for a paid pass.
 * Gate 2 does not use the CLI; a throw from the module lands in its fail-to-ask wrapper.
 *
 * Zero dependencies beyond node core and ./aiwf-lib (readStdin, escapeRe).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const lib = require('./aiwf-lib');

// The recognition line: column 0, the key exact, the value `plan` in any case, a trailing CR allowed.
const CLASS_PLAN_LINE = /^Class:[ \t]*[Pp][Ll][Aa][Nn][ \t]*\r?$/m;
const LINE_NAMES = ['Class', 'PLAN', 'TICKETS', 'CONSEQUENCE SCAN', 'OWN PASS'];
const FILE_LINES = ['PLAN', 'CONSEQUENCE SCAN', 'OWN PASS'];
// Gate 2's ticket-ref alphabet (TICKET_LINE in pretooluse-dispatch-gate.js) - older plans with other
// prefixes stay admissible.
const REF_ALPHABET = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const SCAN_HEADER = ['#', 'ticket', 'decision', 'surface', 'violation', 'closure'];
const CHECKS_HEADER = ['ticket', 'repo-match', 'scope', 'discovery', 'order', 'acceptance', 'git'];
const INSTRUMENTS_HEADER = ['instrument', 'valid input', 'broken input'];
// A WHITE list: a closure is closed only when it starts with one of these; `later`, `n/a` or an
// empty cell are open.
const CLOSED_PREFIXES = ['plan:', 'no defect:'];
const HASH_LINE = /^PLAN SHA256:[ \t]*([0-9a-fA-F]{64})[ \t]*\r?$/gm;
const BLOCKERS_LINE = /^BLOCKERS FOUND:[ \t]*([0-9]+)[ \t]*\r?$/gm;
const USAGE = 'usage: node plan-gate.js --project-root <root> [--plan-class]   (the brief on stdin)\n'
  + '       node plan-gate.js --hash <file>';
const REFUSED = 'plan-gate: refused - see /pnp:review Steps 2c and 2d';

/** True when the brief carries the `Class: plan` line at its first column. */
function isPlanBrief(text) {
  return typeof text === 'string' && CLASS_PLAN_LINE.test(text);
}

/** Lowercase hex SHA-256 of the file's UTF-8 text with CRLF normalised to LF. Throws if unreadable. */
function planHash(absPath) {
  const text = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---- text helpers ------------------------------------------------------------
const stripBom = (s) => s.replace(/^\uFEFF/, '');
const toLines = (text) => text.split('\n').map((l) => l.replace(/\r$/, ''));
const allMatches = (re, text) => {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  re.lastIndex = 0;
  return out;
};

/** Every value of a `<NAME>: <value>` brief line that starts at column 0. */
function briefLineValues(brief, name) {
  return allMatches(new RegExp('^' + lib.escapeRe(name) + ':[ \\t]*(\\S.*?)[ \\t]*\\r?$', 'gm'), brief);
}

/**
 * true for every line inside a fenced code block, fences included. Opening fence: up to three
 * leading spaces, then three or more backticks or three or more tildes, an info string allowed.
 * Closing fence: up to three leading spaces, the SAME character, at least as many, nothing else but
 * spaces. A shorter fence inside a longer one does not close it; an unclosed fence runs to the end
 * of the file (the safe direction - nothing after it is counted).
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

/** The refs that are ticket HEADINGS of the plan: a heading whose first token is the ref, unfenced. */
function ticketHeadings(lines) {
  const mask = fencedMask(lines);
  const refs = new Set();
  for (let i = 0; i < lines.length; i++) {
    if (mask[i]) continue;
    const m = /^#{1,6}[ \t]+([A-Za-z0-9_-]+)/.exec(lines[i]);
    if (m) refs.add(m[1]);
  }
  return refs;
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
const sameHeader = (cells, expected) => cells.length === expected.length
  && cells.every((c, i) => c.toLowerCase() === expected[i]);

/**
 * Every table - a `|` header line followed by a separator row with the SAME number of cells - with
 * its data rows and 1-based lines. A header over a separator of another width is not a table.
 */
function findTables(lines) {
  const tables = [];
  for (let i = 0; i + 1 < lines.length; i++) {
    if (!isRowLine(lines[i])) continue;
    const header = splitCells(lines[i]);
    if (!isSeparator(lines[i + 1], header.length)) continue;
    const rows = [];
    let j = i + 2;
    while (j < lines.length && isRowLine(lines[j])) { rows.push({ line: j + 1, cells: splitCells(lines[j]) }); j += 1; }
    tables.push({ headerLine: i + 1, header, rows });
    i = j - 1;
  }
  return tables;
}

// ---- the check ---------------------------------------------------------------
/**
 * Checks a plan-readiness brief and the three files it names, resolved against projectRoot.
 * Returns { ok, problems: [{ token, message }] } with EVERY problem, in this order: the brief's lines,
 * TICKETS, the files, the scan, the own pass. A check that depends on a missing or duplicated line,
 * or on a missing file, is skipped rather than reported as a derived problem.
 */
function checkPlanBrief(briefText, projectRoot) {
  const problems = [];
  const add = (token, message) => problems.push({ token, message });
  const brief = stripBom(typeof briefText === 'string' ? briefText : '');
  const root = typeof projectRoot === 'string' ? projectRoot : '';

  // 1. The five fixed lines.
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
  const single = (name) => (vals[name].length === 1 ? vals[name][0] : null);

  // The files are resolved and read up front; their problems are REPORTED after TICKETS below.
  const files = {};
  for (const name of FILE_LINES) {
    const rel = single(name);
    if (rel === null) { files[name] = null; continue; }
    const abs = path.resolve(root, rel);
    let text = null;
    try {
      if (fs.statSync(abs).isFile()) text = fs.readFileSync(abs, 'utf8');
    } catch (e) {
      text = null;
    }
    files[name] = { rel, abs, text };
  }
  const usable = (name) => files[name] !== null && files[name].text !== null;
  const planText = usable('PLAN') ? stripBom(files.PLAN.text) : null;

  // 2. TICKETS: the refs this pass audits.
  let refs = null; // null = no usable TICKETS line, so no coverage check runs
  const ticketsText = single('TICKETS');
  if (ticketsText !== null) {
    const parts = ticketsText.split(/[,\s]+/).filter(Boolean);
    if (parts.length === 0) {
      add('tickets-empty', 'the TICKETS line names no ref');
    } else {
      refs = [];
      const planHeads = planText === null ? null : ticketHeadings(toLines(planText));
      for (const p of parts) {
        if (!REF_ALPHABET.test(p)) { add(`tickets-bad-ref:${p}`, `"${p}" is not a ticket ref ([A-Za-z0-9][A-Za-z0-9_-]*)`); continue; }
        if (planHeads !== null) {
          const inPlan = planHeads.has(p);
          if (!inPlan) { add(`tickets-not-in-plan:${p}`, `${p} is not a ticket heading of ${files.PLAN.rel} (a heading whose first token is the ref, outside a fenced block)`); continue; }
        }
        if (!refs.includes(p)) refs.push(p);
      }
    }
  }

  // 3. The files.
  for (const name of FILE_LINES) {
    if (files[name] !== null && files[name].text === null) {
      add(`file-missing:${name}`, `${files[name].rel} (resolved to ${files[name].abs}) is not a readable regular file`);
    }
  }

  // 4. The consequence scan (Step 2c).
  if (usable('CONSEQUENCE SCAN')) {
    const lines = toLines(stripBom(files['CONSEQUENCE SCAN'].text));
    const mask = fencedMask(lines);
    const isScanHeaderCandidate = (i) => {
      if (mask[i] || !isRowLine(lines[i])) return false;
      const c = splitCells(lines[i]);
      return c.length >= 2 && c[0].toLowerCase() === '#' && c[1].toLowerCase() === 'ticket';
    };
    const ticketCells = [];
    let validTables = 0;
    let badHeaders = 0;
    let i = 0;
    while (i < lines.length) {
      if (!isScanHeaderCandidate(i)) { i += 1; continue; }
      const headerOk = sameHeader(splitCells(lines[i]), SCAN_HEADER)
        && i + 1 < lines.length && !mask[i + 1] && isSeparator(lines[i + 1], SCAN_HEADER.length);
      if (!headerOk) {
        badHeaders += 1;
        add(`scan-bad-header:${i + 1}`, `line ${i + 1} opens a scan table whose header is not exactly "| # | ticket | decision | surface | violation | closure |" followed by a six-cell separator row - its rows are not checked`);
        i += 1;
        while (i < lines.length && !mask[i] && isRowLine(lines[i]) && !isScanHeaderCandidate(i)) i += 1;
        continue;
      }
      validTables += 1;
      i += 2;
      while (i < lines.length && !mask[i] && isRowLine(lines[i]) && !isScanHeaderCandidate(i)) {
        const lineNo = i + 1;
        const cells = splitCells(lines[i]);
        if (cells.length >= 2) ticketCells.push(cells[1]);
        if (cells.length !== SCAN_HEADER.length) {
          add(`scan-row-shape:${lineNo}`, `scan row at line ${lineNo} has ${cells.length} cells, the header has ${SCAN_HEADER.length} (write a "|" inside a cell as "\\|")`);
        } else {
          if (cells.slice(0, 5).some((c) => c === '')) {
            add(`scan-empty-cell:${lineNo}`, `scan row at line ${lineNo} has an empty cell outside "closure" (a "none found" row writes "none" in its violation cell)`);
          }
          const closure = cells[5].toLowerCase();
          if (!CLOSED_PREFIXES.some((p) => closure.startsWith(p))) {
            add(`scan-open-row:${lineNo}`, `scan row at line ${lineNo} is open - its closure must start with "plan:" or "no defect:"`);
          }
        }
        i += 1;
      }
      // A row the agent returned without its leading `|` ends the table silently in markdown; here it
      // is a malformed row, not a quiet end.
      if (i < lines.length && !mask[i] && /^\s*\d+\s*\|/.test(lines[i])) {
        add(`scan-row-shape:${i + 1}`, `line ${i + 1} is a scan row without its leading "|" - every row is recorded with a leading and a trailing "|"`);
      }
    }
    if (validTables === 0) {
      if (badHeaders === 0) add('scan-no-table', `${files['CONSEQUENCE SCAN'].rel} carries no scan table ("| # | ticket | decision | surface | violation | closure |")`);
    } else if (refs !== null) {
      for (const ref of refs) {
        if (!ticketCells.includes(ref)) add(`scan-ticket-missing:${ref}`, `the consequence scan has no row for ${ref}`);
      }
    }
  }

  // 5. The own pass (Step 2d).
  if (usable('OWN PASS')) {
    const ownText = stripBom(files['OWN PASS'].text);
    const hashes = allMatches(HASH_LINE, ownText);
    if (hashes.length !== 1) {
      add('own-hash-missing', `the own pass must carry exactly one "PLAN SHA256: <64 hex>" line (found ${hashes.length})`);
    } else if (usable('PLAN')) {
      const ownHash = hashes[0].toLowerCase();
      const currentHash = planHash(files.PLAN.abs);
      if (ownHash !== currentHash) {
        add('own-hash-mismatch', `the own pass was stamped over a different text of ${files.PLAN.rel} (stamped ${ownHash.slice(0, 12)}..., now ${currentHash.slice(0, 12)}...) - redo the own pass over the plan that will be dispatched`);
      }
    }
    if (allMatches(BLOCKERS_LINE, ownText).length !== 1) {
      add('own-blockers-missing', 'the own pass must carry exactly one "BLOCKERS FOUND: <n>" line');
    }
    const tables = findTables(toLines(ownText));
    const checks = tables.filter((t) => sameHeader(t.header, CHECKS_HEADER));
    if (checks.length === 0) {
      add('own-checks-table-missing', 'the own pass has no "| ticket | repo-match | scope | discovery | order | acceptance | git |" table');
    } else {
      const ownTickets = [];
      for (const row of checks.flatMap((t) => t.rows)) {
        if (row.cells.length >= 1) ownTickets.push(row.cells[0]);
        if (row.cells.length !== CHECKS_HEADER.length) {
          add(`own-checks-row-shape:${row.line}`, `own-pass row at line ${row.line} has ${row.cells.length} cells, the header has ${CHECKS_HEADER.length}`);
        } else if (row.cells.some((c) => c === '')) {
          const who = row.cells[0] !== '' ? row.cells[0] : `line-${row.line}`;
          add(`own-checks-empty-cell:${who}`, `own-pass row ${who} (line ${row.line}) has an empty cell - every one of the six checks is filled`);
        }
      }
      if (refs !== null) {
        for (const ref of refs) {
          if (!ownTickets.includes(ref)) add(`own-ticket-missing:${ref}`, `the own pass has no row for ${ref}`);
        }
      }
    }
    const instrumentTables = tables.filter((t) => sameHeader(t.header, INSTRUMENTS_HEADER));
    if (instrumentTables.every((t) => t.rows.length === 0)) {
      add('own-instruments-missing', 'the own pass has no "| instrument | valid input | broken input |" table with at least one row');
    } else {
      // Rows are numbered within THEIR OWN table, from 1; the shape token names the file line.
      for (const t of instrumentTables) {
        t.rows.forEach((row, k) => {
          if (row.cells.length !== INSTRUMENTS_HEADER.length) {
            add(`own-instrument-shape:${row.line}`, `instrument row at line ${row.line} has ${row.cells.length} cells, the header has ${INSTRUMENTS_HEADER.length} (write a "|" inside a cell as "\\|")`);
            return;
          }
          const [instrument, valid, broken] = row.cells;
          if (instrument === '' || valid === '' || broken === '' || valid === broken) {
            add(`own-instrument-cannot-fail:${k + 1}`, `instrument row ${k + 1} of the table at line ${t.headerLine} (file line ${row.line}) is empty or reads the same on broken input as on valid input - an instrument that cannot fail is a blocker, not a row`);
          }
        });
      }
    }
  }

  return { ok: problems.length === 0, problems };
}

// ---- CLI ---------------------------------------------------------------------
function parseArgs(argv) {
  if (argv.length === 2 && argv[0] === '--hash') return { mode: 'hash', file: argv[1] };
  let root = null;
  let planClass = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--project-root' && root === null && i + 1 < argv.length && argv[i + 1] !== '') { root = argv[i + 1]; i += 1; continue; }
    if (argv[i] === '--plan-class' && !planClass) { planClass = true; continue; }
    return null;
  }
  return root === null ? null : { mode: 'check', root, planClass };
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

module.exports = { checkPlanBrief, planHash, isPlanBrief };
