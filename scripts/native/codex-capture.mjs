#!/usr/bin/env node
// codex-capture.mjs - run codex with BOTH of its output streams written to ONE log file, byte for
// byte, and print a finished run's final message. Zero dependencies; node is already a hard
// prerequisite of this plugin (every hook runs on it).
//
//   <prompt> | node codex-capture.mjs --log <path> -- <codex args...>
//   node codex-capture.mjs --print <file>
//
// The PowerShell channel of the review and QA wrappers (scripts/native/ps/codex-review.ps1,
// codex-qa.ps1) runs codex through the first form and emits the verdict through the second. The bash
// channel needs neither: `> "$log" 2>&1` and `cat` are byte-exact there. The capture mechanism is the
// one documented difference between the two channels; their flags and their lines stay a mirror.
//
// WHY A HELPER (decision D-12 of plan GATES, taken on a measurement). Windows PowerShell 5.1 decodes
// a redirected native stream: a 447-byte UTF-8 emitter (non-ASCII text, CRLF and LF line ends, a
// 300-character line, on stdout then stderr) run under `*> <log>` produced a 1796-byte log - UTF-16LE
// with a byte order mark, the UTF-8 decoded through the console code page, every LF turned into CRLF,
// and the first stderr line wrapped in a NativeCommandError record. Here codex is handed ONE file
// handle for its stdout and its stderr at the operating-system level, so nothing reads, decodes or
// re-terminates a byte between codex and the log.
//
// --log: the log belongs to this one run. It is created exclusively (an existing file at that path
// is a refusal, exit 2 - a log is never shared by two runs) and only after codex was resolved. stdin
// is inherited, so the prompt the wrapper pipes in reaches codex untouched. Nothing is written to
// this helper's own stdout. The exit code is codex's own; a child ended by a signal is 1.
//
// --print: the file's bytes, exactly, on stdout - the final message codex wrote through its own
// `-o <file>`. Printed by a native process rather than by PowerShell, so a caller that redirects the
// wrapper's stdout (`> round.txt`) receives it the way it received codex's own stdout before.
//
// NO SHELL ANYWHERE. codex is spawned with `shell: false` and its argv as an array, so no argument is
// ever parsed by cmd.exe or a POSIX shell. It is therefore resolved here, not by a shell:
//   - the PATH directories in order, and on Windows the PATHEXT extensions in order inside each
//     directory (.COM;.EXE;.BAT;.CMD when PATHEXT is unset);
//   - a codex.exe / codex.com is spawned directly;
//   - a codex.cmd / codex.bat is taken to be the npm shim and is NEVER spawned (running it means
//     cmd.exe parsing the arguments): the shim runs <dir>\node.exe when it exists, else node, on
//     <dir>\node_modules\@openai\codex\bin\codex.js - so this helper spawns that same node
//     (process.execPath when the directory has none) on that same file;
//   - a codex.ps1 is skipped. PowerShell's own `& codex` resolves codex.ps1 FIRST where npm installed
//     one; it is a third launcher over the same codex.js, so skipping it changes the launcher, not
//     the engine;
//   - on a POSIX host (pwsh running the PowerShell channel there) the first executable file named
//     `codex` on PATH, spawned directly.
// Unresolvable -> one stderr line `codex-capture: cannot resolve codex (<reason>)`, exit 2, and no
// log written: a refusal before the engine starts, like the wrappers' own refusals.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const USAGE = 'usage: node codex-capture.mjs --log <path> -- <codex args...> | --print <file>';

function refuse(message) {
  process.stderr.write(`codex-capture: ${message}\n`);
  process.exit(2);
}

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch (e) { return false; }
}

function isExecutable(p) {
  try { fs.accessSync(p, fs.constants.X_OK); return true; } catch (e) { return false; }
}

/** The PATH directories in order, empty entries dropped and surrounding quotes removed. */
function pathDirs(env) {
  return String(env.PATH || '').split(path.delimiter)
    .map((d) => d.trim().replace(/^"(.*)"$/, '$1'))
    .filter((d) => d.length > 0);
}

/** { command, prefix } to spawn, or { error } naming why codex cannot be resolved. */
function resolveCodex(env, platform) {
  const dirs = pathDirs(env);
  if (platform === 'win32') {
    const exts = String(env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';')
      .map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0);
    for (const dir of dirs) {
      for (const ext of exts) {
        // Only the four launchable kinds; .js, .vbs, .ps1 and the rest are never run from here.
        if (!['.com', '.exe', '.bat', '.cmd'].includes(ext)) continue;
        const file = path.join(dir, `codex${ext}`);
        if (!isFile(file)) continue;
        if (ext === '.exe' || ext === '.com') return { command: file, prefix: [] };
        const entry = path.join(dir, 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
        if (!isFile(entry)) return { error: `the npm shim ${file} has no ${entry} beside it` };
        const shimNode = path.join(dir, 'node.exe');
        return { command: isFile(shimNode) ? shimNode : process.execPath, prefix: [entry] };
      }
    }
    return { error: 'no codex.exe, codex.com, codex.cmd or codex.bat on PATH' };
  }
  for (const dir of dirs) {
    const file = path.join(dir, 'codex');
    if (isFile(file) && isExecutable(file)) return { command: file, prefix: [] };
  }
  return { error: 'no executable codex on PATH' };
}

function printFile(file) {
  let bytes = null;
  try { bytes = fs.readFileSync(file); } catch (e) { refuse(`the file to print could not be read (${e.code || e.message}): ${file}`); }
  process.stdout.write(bytes);
}

function capture(logPath, codexArgs) {
  const target = resolveCodex(process.env, process.platform);
  if (target.error) refuse(`cannot resolve codex (${target.error})`);
  let logFd = null;
  try { logFd = fs.openSync(logPath, 'wx'); } catch (e) { refuse(`the run log could not be created (${e.code || e.message}): ${logPath}`); }
  let closed = false;
  const closeLog = () => { if (!closed) { closed = true; try { fs.closeSync(logFd); } catch (e) { /* already closed */ } } };
  let child = null;
  try {
    child = spawn(target.command, [...target.prefix, ...codexArgs], { stdio: ['inherit', logFd, logFd], shell: false });
  } catch (e) {
    closeLog();
    refuse(`codex could not start (${e.message})`);
  }
  // An interrupt reaches codex directly (same console on Windows, same process group on POSIX), so
  // this helper only waits for it; a termination aimed at the helper alone is passed on.
  process.on('SIGINT', () => {});
  for (const sig of ['SIGTERM', 'SIGHUP']) {
    try { process.on(sig, () => { try { child.kill(sig); } catch (e) { /* already gone */ } }); } catch (e) { /* not on this platform */ }
  }
  let failedToStart = false;
  child.on('error', (e) => {
    failedToStart = true;
    closeLog();
    process.stderr.write(`codex-capture: codex could not start (${e.message})\n`);
    process.exitCode = 2;
  });
  child.on('exit', (code) => {
    if (!failedToStart) process.exitCode = code === null ? 1 : code;
  });
  child.on('close', closeLog);
}

const argv = process.argv.slice(2);
if (argv[0] === '--print') {
  if (argv.length !== 2 || !argv[1]) refuse(USAGE);
  printFile(argv[1]);
} else if (argv[0] === '--log') {
  if (argv.length < 3 || !argv[1] || argv[2] !== '--') refuse(USAGE);
  capture(argv[1], argv.slice(3));
} else {
  refuse(USAGE);
}
