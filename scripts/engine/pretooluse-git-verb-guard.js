'use strict';
/*
 * Gate 4 - PreToolUse(Bash). ASK-CLASS GIT VERBS, JUDGED BY WHO IS RUNNING THE COMMAND.
 *
 * Two faces of one hole, neither of them adversarial:
 *
 * (1) A BACKGROUND SUBAGENT'S DIALOG NEVER REACHES THE OPERATOR. The commit/push/destructive gate
 *     is a set of declarative `ask` rules in the project's .claude/settings.json, and a dialog is
 *     only a gate where somebody can see it. A subagent that runs `git reset --hard` is not the
 *     operator's screen, so this gate DENIES an ask-class git verb from any subagent that is not
 *     the Writer - identity, the one thing a hook can decide here with certainty.
 *
 * (2) A RULE ONLY COVERS THE FORM IT SPELLS OUT. What the harness already does by itself is more
 *     than a naive prefix match, and this gate must not claim otherwise. CLAUDE CODE'S PERMISSION
 *     DOCUMENTATION DESCRIBES AN OPERATOR-AWARE MATCHER - everything in this paragraph is that
 *     description, not something this repository can observe: it splits a Bash command on `&&`,
 *     `||`, `;`, `|`, `|&`, `&` and newlines and matches every rule against each SUBCOMMAND
 *     independently (deny/ask rules also reach into subshells, command substitutions and
 *     control-flow bodies); it strips the wrappers `timeout`, `time`, `nice`, `nohup`, `stdbuf`,
 *     `command`, `builtin`, `noglob` and a FLAGLESS `xargs` before matching - a flagged one is not
 *     stripped, and `command -v git ...` is documented as excluded, being a query about a command
 *     rather than the command; and it matches past leading `NAME=value` assignments. So
 *     `cd <path> && git commit -m x`, `timeout 30 git commit -m x` and `FOO=bar git push` ALREADY
 *     raise the operator's dialog - none of them is a hole, and nothing here should pretend it is.
 *     What the shipped ruleset does NOT cover is the forms it never spells out: `git.exe <verb>`
 *     for anything but push/merge/rebase, ANY `git -C <path> <verb>` (the shipped rule names
 *     `<projectRoot>`, and this hook cannot verify that a path is the project root), a wrapper the
 *     harness does not strip (`sudo`, `npx`, `docker exec`, `direnv exec`, `watch`, `setsid`,
 *     `flock`, `find -exec`, a flagged `xargs`), and irregular whitespace between the tokens. Those
 *     reach nobody today; for those, this gate asks.
 *
 * ASKING WHERE A RULE ALSO MATCHES IS FREE, WHICH IS WHY THE DEFAULT IS INVERTED. A hook decision
 * does not bypass the permission rules: an `ask` rule still prompts after a hook returned `allow`,
 * and a hook `ask` next to a matching `ask` rule is ONE dialog, not two. So this gate does not try
 * to guess which forms "look gated" - every looseness in such a guess is a silent bypass. It passes
 * through ONLY where a rule the payload really ships matches the subcommand byte for byte, and asks
 * on everything else it recognised. Over-asking costs an operator nothing; under-asking is the
 * whole defect class.
 *
 * RECOGNISER, NOT A SHELL PARSER. It finds `git` / `git.exe` (with an optional global `-C <path>`
 * or `-c <k=v>`) followed by an ask-class verb, ANYWHERE in the command string. It does NOT
 * interpret escapes, aliases or env-indirection, and its quote handling is exactly two narrow
 * things and nothing more: the subcommand splitter ignores a separator inside quotes, and a verb
 * token's surrounding quotes come off before the lookup - so `git 'push'` and `git "reset"` ARE
 * recognised. The guarantee is the identity check and
 * the byte-exact rule test; recognition is best-effort. Both directions of that are accepted rather
 * than hidden:
 *   - FALSE POSITIVE: a gated verb inside a quoted string (`git grep -n "git commit" -- docs`) is
 *     recognised all the same - one dialog for the main session, a deny for a subagent. Costly by a
 *     click, recoverable by rephrasing, and never a silent pass.
 *   - FALSE NEGATIVE: an alias, a verb assembled from a variable or a substitution (`git $VERB`),
 *     and a verb whose characters are ESCAPED (`git \push`) are NOT recognised at all. The
 *     permission rules miss those too; this gate does not close that class. A verb merely QUOTED is
 *     not in it - see above.
 *   - NOT MIRRORED: the harness reaches into subshells, command substitutions and control-flow
 *     bodies; the decomposition below splits on the six separators and newlines only, and skips
 *     those inside quotes. A `$(git reset --hard)` is therefore not isolated as its own subcommand
 *     here, and neither is the inside of `bash -c "...; git reset --hard"` - both are still
 *     RECOGNISED anywhere in the string, and the subcommand carrying them is not a byte-exact rule
 *     match, so they resolve to ASK. Failing that way round is the point of the inversion.
 *
 * THE PASSTHROUGH BRANCH RESTS ON HOST BEHAVIOUR THIS REPOSITORY CANNOT TEST. Everything in face (2)
 * above is Claude Code's DOCUMENTED matching, not an observation of a running harness and not
 * something any suite here pins: every assertion about this hook - spike rows and self-check alike -
 * runs it against an ASSUMED harness, never against the real one. So if the host ever stopped
 * matching per subcommand, the forms this gate deliberately passes through would silently stop being
 * gated by anything at all - `cd <path> && git commit -m x` first among them - and nothing in the
 * suite would go red, because nothing in the suite is looking at the host. The deny branch, the
 * byte-exact rule test and the ask branch are this repository's own behaviour and are covered; the
 * decision to STAY SILENT is the part that borrows a promise from the documentation.
 *
 * A DIFFERENT AND WEAKER LIMIT, WHICH IS NOT ONE OF THE ABOVE: THIS GATE SEES ONE SHELL TOOL. It is
 * wired on matcher `Bash`. A harness that exposes a SECOND shell tool - a Windows session carries a
 * `PowerShell` tool next to `Bash` - can run the very same git verbs through that other tool, and
 * this hook is never invoked for it. Neither is the permission layer: every rule in
 * templates/settings.ask-ruleset.json is a `Bash(...)` rule, so the whole ask list - commit, push,
 * merge, rebase, reset and the rest - has NO coverage on a second shell tool. Both halves of that
 * are checkable from this repository: read the matcher in hooks/hooks.json and the rule prefixes in
 * the ruleset.
 *   That matters most for the DENY branch, and it is stated plainly rather than folded into the
 * residuals above: a subagent whose tool allowlist includes the other shell can reach a gated git
 * verb by CHOOSING THAT TOOL. It needs no exotic command form - no alias, no assembled verb, no
 * quoting - which is what makes this weaker than everything listed above it. Nothing in this file
 * closes it; what this file does close, on the Bash tool, it closes exactly as described.
 * This is why the record of the hook removed in N4-R still stands (see scripts/engine/aiwf-lib.js):
 * emulating shell semantics for everyone remains a treadmill nobody should walk. This gate does not
 * try to - it recognises, and it decides on identity.
 *
 * FAIL DIRECTION: DENY (`runFailClosed`), like Gate 1 - WITH A NAMED RISK, because the blast radius
 * is not Gate 1's. Gate 1 sits on four mutation tools; this one sits on matcher `Bash`, i.e. on
 * EVERY shell command of the session, so a hook that throws stops the session's whole shell rather
 * than one tool class. Three consequences, deliberate:
 *   - this file requires nothing but ./aiwf-lib: no fs, no config, no project directory, no I/O
 *     that can fail. There is nothing here for an environment to break;
 *   - the spike and self-check matrices carry an ordinary non-git command and a malformed stdin as
 *     explicit cases, so "the gate is silent on everything it does not judge" is asserted, not
 *     assumed;
 *   - a payload that parses but carries no readable command (`tool_input` without a `command`
 *     string) is a PASSTHROUGH, not a deny: there is no verb to recognise, and denying every shell
 *     call whose shape surprised us would be a worse accident than the one this gate prevents. The
 *     fail-closed wrapper covers hook-LEVEL errors - unparseable stdin, an unexpected throw - which
 *     is where "the actor is unknown" really applies.
 *
 * NEITHER THE VERB LIST NOR THE SET OF ACCEPTED FORMS IS MAINTAINED BY HAND. `GIT_ASK_VERBS` and
 * `EXE_RULE_VERBS` below are the single source, and the self-check parses
 * templates/settings.ask-ruleset.json into the literal invocation PREFIX of every git rule it
 * carries, then holds those forms against this file's whole accept-space ({`git`, `git.exe`} x the
 * verb list, which is finite and therefore enumerated rather than sampled) in BOTH directions:
 *   - every rule form this gate models must be ACCEPTED by shippedRuleMatches. Otherwise the rules
 *     gate a form the gate does not know, and a verb added to the ruleset would outrun it.
 *   - every form shippedRuleMatches ACCEPTS must be carried by a shipped rule. That is the
 *     over-permissive half, and the half a verb-level check could not see: delete
 *     `Bash(git.exe push:*)` and the verb `push` is still "covered" by the bare rule, while
 *     `git.exe push ...` goes on being passed through here with nothing gating it.
 *   - the three `git -C <projectRoot> ...` rule forms are the one deliberate exception and are
 *     asserted as REFUSED rather than skipped (the reason is on EXE_RULE_VERBS below).
 * Each direction carries its own control on a sabotaged copy of the ruleset: a form added, the
 * `git.exe` rule removed, a bare rule removed.
 *   That cross-check, and the same need for every other decision this
 * file makes, is why the gate RUNS only when this is the main module while the constants and the
 * pure functions beside them are EXPORTED (see `module.exports` at the end for the current surface -
 * it is not restated here, because a list in a comment is a second copy that goes stale): the
 * self-check then holds the shipped verb list, the subcommand decomposition, the wrapper stripping
 * and the byte-exact rule test as the code really defines them, instead of retyping any of it into an
 * assertion. (`require.main === module` compares module objects, not paths, so it is unaffected by
 * the symlinked-payload defect POSIX-001 fixed in the ESM entrypoints.)
 *
 * Accident/role protection, not adversary-proofing.
 */
const lib = require('./aiwf-lib');

const WRITER_AGENT_TYPE = 'writer'; // matches `name:` in .claude/agents/writer.md
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const G4 = '[AIWF-G4 gate 4: ask-class git verbs]';

// The ask-class git verbs, in the shipped ruleset's own order (bare forms first, then the three
// push/merge/rebase ones). `-c` is in the list because `Bash(git -c:*)` is: `git -c k=v <anything>`
// would otherwise walk past every `git <verb>` prefix rule. `-C` is NOT: the ruleset deliberately
// carries no blanket `git -C` rule (it would gate `git -C <other repo> log`), so `-C <path>` is
// skipped as the global option it is and the verb AFTER it is the one RECOGNISED. That is
// recognition only: no `-C` form is ever a rule match, whatever verb follows (see EXE_RULE_VERBS).
const GIT_ASK_VERBS = Object.freeze([
  'commit', 'reset', 'clean', 'rm', 'checkout', 'switch', 'restore', 'revert',
  'pull', 'fetch', 'cherry-pick', 'stash', 'config', 'remote', '-c',
  'push', 'merge', 'rebase',
]);
const VERB_SET = new Set(GIT_ASK_VERBS);
// The only verbs the ruleset spells out behind `git.exe`. Every other ask-class verb exists there in
// the bare `git <verb>` form alone - which is why the rule test below is asymmetric. The
// `git -C <projectRoot> ...` rules are deliberately NOT modelled: their path is rendered from the
// project root, and a hook that reads no project directory cannot tell that path from any other, so
// every `-C` form asks.
const EXE_RULE_VERBS = new Set(['push', 'merge', 'rebase']);

// What the harness itself does before it matches a rule, mirrored exactly as far as it is
// documented - no further. Separators first: a rule is matched against each SUBCOMMAND. They are
// recognised by the scanner in subcommandsOf, which is quote-aware, because a `;` inside a quoted
// string is not a separator and splitting on it would MANUFACTURE a subcommand the harness never
// sees - and a manufactured subcommand is exactly the shape that turns into a false passthrough.
const TWO_CHAR_SEPARATORS = ['&&', '||', '|&'];
const ONE_CHAR_SEPARATORS = new Set([';', '|', '&', '\n', '\r']);
// Wrappers the harness strips before matching. This set is CLOSED on purpose: `sudo`, `npx`,
// `docker exec`, `direnv exec`, `watch`, `setsid`, `flock` and `find -exec` are NOT stripped by the
// harness, so a command behind one of them matches no rule and must reach the ask branch here.
const STRIPPED_WRAPPERS = new Set([
  'timeout', 'time', 'nice', 'nohup', 'stdbuf', 'command', 'builtin', 'noglob', 'xargs',
]);
// Of those, the ones that are a wrapper only when they carry NO flag. A flagged `xargs` is not
// stripped, and `command -v git` / `builtin -x` are QUERIES rather than invocations - `command -v
// git commit` prints a path, it does not run a commit, and treating it as one would let the literal
// text `git commit` through as if it were the command.
const FLAG_SENSITIVE_WRAPPERS = new Set(['xargs', 'command', 'builtin']);
// And the ones that really do take an argument of their own before the command (`timeout 30`,
// `nice -n 10`, `stdbuf -oL`). The others take the command directly, so consuming tokens after them
// would be inventing a rewrite the harness never performs.
const WRAPPERS_WITH_ARGS = new Set(['timeout', 'time', 'nice', 'stdbuf']);

// `git` / `git.exe` as a whole word - the MIRROR of the verb-token question below, decided by the
// same two rules, and audited the same way.
//
// Here the whitelist would be wrong, because what may sit around a real `git` invocation is open
// ended: a space, a `;`, a `&&`, a pipe, a backtick or `$(`, a quote, a path separator (either
// `/usr/bin/git push` or a Windows path ending in `\git.exe`) are all legitimate, and so is the
// start of the string. What
// must NOT sit there is an IDENTIFIER character, because then the word is a different program or
// path: `mygit push`, `git-lfs push`, `foo_git push`, `git2 push`, `.git/config`. So the boundary is
// stated as a small exclusion - letters, digits, `_`, `.`, `-` - and everything else is allowed
// through to recognition.
//   The direction is the same as below: a character wrongly allowed here only lets this hook LOOK at
// a command that was not a git invocation, and the exact verb lookup then usually rejects it - at
// worst an extra deny or ask. A character wrongly excluded would hide a real `git` from the gate.
// `.` is excluded and `git.exe` is matched by the alternative above it, so the one case where a dot
// really does continue the program name is spelled out rather than left to the boundary.
const GIT_WORD = 'git(?:\\.exe)?';
const NOT_IDENT_BEFORE = '(?:^|[^A-Za-z0-9_.\\-])';
const NOT_IDENT_AFTER = '(?![A-Za-z0-9_.\\-])';
// Quoted runs are kept whole ONLY so that `-C "path with spaces"` counts as one token. It is not
// quote handling in any larger sense - see the header.
const TOKEN = /"[^"]*"|'[^']*'|\S+/g;

// HOW THE CANDIDATE TOKEN IS REDUCED TO A VERB, AND WHY IT IS A WHITELIST.
//
// A verb is routinely GLUED to whatever ends or surrounds its command: `git push;`,
// `git commit;echo x`, `$(git push)`, "`git push`", `git push|cat`, `git reset>log`,
// `git commit"` inside a quoted string. None of that is whitespace, so the token still carries it.
// The first version of this reduction read the token raw and missed all of them; the second cut at
// a BLACKLIST of shell punctuation - and a blacklist was wrong twice over, because the backtick was
// missing from it and the deny branch silently did not fire for "echo `git push`". So the rule is
// inverted: keep the longest prefix a verb could BE, and stop at the first character a verb cannot
// contain. That cannot omit a character, because it enumerates the verbs, not the shell.
//
// A git verb, in `GIT_ASK_VERBS`, is built from exactly two kinds of character:
//   [A-Za-z]  the words themselves (`commit`, `push`, `stash`, ...). Case is kept in the prefix and
//             decided by the exact set lookup afterwards, so `Push` is simply not a verb.
//   -         `cherry-pick` needs it in the middle, `-c` needs it at the start.
// Therefore EVERY other character terminates the token, and the two rules that make that safe:
//   * a character wrongly INCLUDED as a terminator can only shorten the candidate, which at worst
//     recognises a verb in something that was not one - an extra deny or ask, never a passthrough;
//   * a character wrongly EXCLUDED is a silent bypass of the deny branch, which is the defect above.
// Inclusion is the safe direction, so the whitelist is kept as narrow as the verbs allow.
//
// The characters named in the review of this decision, each against that rule:
//   `  ;  &  |  (  )  <  >  {  }      terminate: shell control, redirection, substitution, grouping.
//                                     None can appear in a verb. The backtick is the one that was
//                                     missing, and `echo \`git push\`` is now recognised.
//   "  '                              terminate. Surrounding quotes come off first (so `git 'push'`
//                                     and `git "reset"` ARE recognised); an unbalanced or inner one
//                                     ends the token instead of hiding the verb behind it.
//   $  !  #  =  *  ?  [  ]  ~         terminate: expansion, history, comment, assignment, globbing,
//                                     home expansion. None can appear in a verb. A token that
//                                     STARTS with one reduces to the empty string and is not a verb
//                                     - `git $VERB` stays unrecognised, which is the documented
//                                     limit for a verb assembled by the shell, not a new one.
//   space  tab  newline  CR  (all \s) terminate, but one step earlier: TOKEN above is built on \S+,
//                                     so whitespace already ends a token before this prefix is
//                                     taken. It is inside the whitelist's complement anyway, which
//                                     is what makes a quoted multi-word token (`git "push origin"`)
//                                     reduce to `push` rather than to nothing.
//   \  (backslash)                    terminates. An escaped verb (`git \push`) is therefore NOT
//                                     recognised - escapes are not interpreted anywhere in this
//                                     file, and that residual is stated in the header.
//   A-Z a-z  -                        do NOT terminate: they are what a verb is made of. This is
//                                     the only exclusion, and it is why `git pushx` is not `push`
//                                     and `git cherry-pick` is not `cherry`.
const VERB_TOKEN_PREFIX = /^[A-Za-z-]*/;

// Given everything that follows a `git` token, returns the ask-class verb it invokes, or null.
// Global options that are not themselves ask-class are stepped over: `-C <path>`, `-C<path>` and
// the glued `-c<k>=<v>`. A bare `-c` is NOT stepped over - it is a member of the verb set. This is
// RECOGNITION only, i.e. "is an ask-class verb being invoked here at all"; whether any rule covers
// the form is a separate question, answered by shippedRuleMatches below.
function verbAfterGit(rest) {
  const tokens = rest.match(TOKEN) || [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '-C') { i += 2; continue; }                                                 // -C <path>
    if (t.length > 2 && (t.startsWith('-C') || t.startsWith('-c'))) { i += 1; continue; } // -C<path> / -ck=v
    break;
  }
  const token = tokens[i];
  if (typeof token !== 'string') return null;
  const bare = VERB_TOKEN_PREFIX.exec(token.replace(/^["']/, '').replace(/["']$/, ''))[0];
  return VERB_SET.has(bare) ? bare : null;
}

// The FIRST ask-class git verb invoked anywhere in the command, or null. Exported for the
// self-check, which asserts the recogniser on constructed input as well as through a real hook run.
function recognisedVerb(command) {
  if (typeof command !== 'string') return null;
  const re = new RegExp(`${NOT_IDENT_BEFORE}(${GIT_WORD})${NOT_IDENT_AFTER}`, 'gi');
  let m;
  while ((m = re.exec(command)) !== null) {
    // m[0] includes the character BEFORE the git token, so m.index + m[0].length - where exec has
    // already parked lastIndex - is the end of the token itself. The scan therefore continues at
    // the next character and a second `git` right after the first is still seen.
    const verb = verbAfterGit(command.slice(m.index + m[0].length));
    if (verb !== null) return verb;
  }
  return null;
}

// The subcommands the harness would match rules against, one per element.
//
// Whitespace introduced BY a separator belongs to the separator, not to the operator:
// `cd <path> && git commit -m x` really does contain the subcommand `git commit -m x`, and the
// harness matches `Bash(git commit:*)` against it. The FIRST fragment keeps its leading whitespace
// on purpose - nothing separated it, and whether the harness trims a command that BEGINS with a
// space is not documented, so ` git commit -m x` stays unconfirmed and therefore asks.
// QUOTE-AWARE, and only in the abstaining direction. A separator inside single or double quotes is
// text, not a separator: `bash -c "true; git reset --hard"` is ONE command whose first token is
// `bash`, and splitting it on that `;` would hand the rule test a fragment (`git reset --hard"`)
// that no shell ever runs and no rule is ever matched against - a manufactured passthrough. A
// backslash escapes the next character outside single quotes, for the same reason. Both only ever
// make fragments LONGER, i.e. harder to match a rule prefix, which is the safe direction; neither
// pretends to be shell parsing (see the header).
function subcommandsOf(command) {
  const src = String(command);
  const parts = [];
  let buf = '';
  let quote = null;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '\\' && quote !== "'" && i + 1 < src.length) { buf += ch + src[i + 1]; i += 1; continue; }
    if (quote !== null) { buf += ch; if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (TWO_CHAR_SEPARATORS.includes(src.slice(i, i + 2))) { parts.push(buf); buf = ''; i += 1; continue; }
    if (ONE_CHAR_SEPARATORS.has(ch)) { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  parts.push(buf);
  return parts.map((part, i) => (i === 0 ? part : part.replace(/^\s+/, '')));
}

// The documented pre-match rewriting: leading `NAME=value` assignments, then the wrapper set, then
// that wrapper's own options and duration arguments (`timeout 30`, `nice -n 10`, `stdbuf -oL`).
// Stripping only ever makes a subcommand look MORE like a rule, so it is kept literal and closed:
// a wrapper that is not on the list stops the loop, which is what sends `sudo git reset --hard` to
// the ask branch instead of quietly matching `git reset`.
function stripWrappers(subcommand) {
  let rest = String(subcommand);
  let m;
  while ((m = /^([A-Za-z_][A-Za-z0-9_]*=\S*) /.exec(rest)) !== null) rest = rest.slice(m[0].length);
  for (;;) {
    const w = /^(\S+) /.exec(rest);
    if (w === null || !STRIPPED_WRAPPERS.has(w[1])) break;
    const after = rest.slice(w[0].length);
    // A FLAG turns these three into something else: a flagged `xargs` is not stripped at all, and
    // `command -v` / `builtin -x` ask ABOUT a command instead of running one. Stop rather than
    // guess - the text that follows is then an argument, not the command the rules would see.
    if (FLAG_SENSITIVE_WRAPPERS.has(w[1]) && /^-/.test(after)) break;
    rest = after;
    if (!WRAPPERS_WITH_ARGS.has(w[1])) continue; // the rest take the command directly
    let a;
    while ((a = /^(-{1,2}\S*|\d+[smhd]?) /.exec(rest)) !== null) rest = rest.slice(a[0].length);
  }
  return rest;
}

// TRUE only when a rule the payload REALLY SHIPS matches this subcommand byte for byte. Two shapes,
// and nothing else (templates/settings.ask-ruleset.json):
//   - `git <verb>` for every ask-class verb - the bare rules, e.g. Bash(git commit:*);
//   - `git.exe <verb>` for push|merge|rebase only - the three `git.exe` rules.
// EXACTLY ONE SPACE, on BOTH sides of the verb: no leading whitespace, one space between the
// executable and the verb, and after the verb either the end of the string or one space followed by
// a non-space. A tab or a second space is whitespace this test cannot resolve into a rule prefix -
// the shipped rules are literal strings ending in `:*`, and whether the harness treats `git commit`
// + TAB as that prefix is not something this repository can check - so it abstains and the caller
// asks. The comparison is case-SENSITIVE for the same reason. Everything it cannot confirm -
// `git  commit`, `git commit\t-m x`, `GIT commit`, `git -C <path> <anything>`, `git.exe reset` -
// is a form this predicate refuses to call gated.
function shippedRuleMatches(subcommand) {
  const rest = stripWrappers(subcommand);
  const m = /^(git\.exe|git) (\S+)(?: (?!\s)|$)/.exec(rest);
  if (m === null) return false;
  const verb = m[2];
  if (!VERB_SET.has(verb)) return false;
  return m[1] === 'git' ? true : EXE_RULE_VERBS.has(verb);
}

// The main-session / Writer decision: passthrough only when EVERY subcommand that carries a
// recognised ask-class verb is one of those byte-exact rule matches.
//
// The empty case is an ASK, not a passthrough, and that is load-bearing: it means the verb was
// recognised somewhere in the command but in no subcommand this function could map to a rule - a
// form neither layer would gate (`git\ncommit` splits into `git` and `commit`, and neither is a
// rule match). Reporting "nothing to see" there is exactly the silent bypass being avoided.
function everyGitFormIsRuleMatched(command) {
  const withVerb = subcommandsOf(command).filter((s) => recognisedVerb(s) !== null);
  if (withVerb.length === 0) return false;
  return withVerb.every((s) => shippedRuleMatches(s));
}

// The Bash tool names its payload `command`. Anything else - a tool_input that is not an object, a
// missing or blank command - is "nothing to recognise", which is a passthrough (see the header).
function commandOf(input) {
  if (!isPlainObject(input.tool_input)) return null;
  const c = input.tool_input.command;
  return (typeof c === 'string' && c.trim() !== '') ? c : null;
}

if (require.main === module) {
  lib.runFailClosed(async () => {
    const input = lib.parseInput(await lib.readStdin());

    // Not a plain object -> no trusted identity can be read, so fail CLOSED (the same rule as
    // Gate 1). This is the hook-level error case, not the "unreadable command" case above.
    if (!isPlainObject(input)) {
      return lib.denyPreTool(
        `Blocked Bash command: hook input is not an object; cannot verify actor identity ` +
        `(fail-closed). ${G4}`
      );
    }

    const command = commandOf(input);
    if (command === null) return lib.allowPassthrough();
    const verb = recognisedVerb(command);
    if (verb === null) return lib.allowPassthrough(); // the overwhelmingly common case: not a gated git command

    // Identity, with the SAME own-property semantics as Gate 1: presence, never truthiness. Only
    // `agent_type === "writer"` and the true main session (neither field present) reach the
    // prefix branch below; `agent_id` alone, an explicit null and a wrong case are all subagents.
    const idPresent = has(input, 'agent_id');
    const typePresent = has(input, 'agent_type');
    const isWriter = input.agent_type === WRITER_AGENT_TYPE;
    const isMainSession = !idPresent && !typePresent;

    if (!isWriter && !isMainSession) {
      const detail = typePresent
        ? `agent_type ${input.agent_type === null ? 'null' : JSON.stringify(input.agent_type)}`
        : 'agent_id present, agent_type absent';
      return lib.denyPreTool(
        `Blocked Bash command: it invokes the ask-class git verb "${verb}", and a non-writer or ` +
        `incomplete subagent identity (${detail}) may not run one. Such a command is gated by an ` +
        `operator dialog, and a background agent's dialog never reaches the operator - from here it ` +
        `would either stall or pass unseen. Report the command to the main session (or the Writer), ` +
        `where the dialog is visible and the operator can answer it. ${G4}`
      );
    }

    // Main session / Writer. Silent only where a shipped rule really matches the subcommand the
    // harness would test - the harness is about to raise that dialog itself.
    if (everyGitFormIsRuleMatched(command)) return lib.allowPassthrough();

    return lib.askPreTool(
      `This command invokes the ask-class git verb "${verb}" in a form no permission rule covers. ` +
      `The rules are literal: "git ${verb} ..." raises your dialog (and so does a chained or ` +
      `wrapper-prefixed one - the harness splits subcommands and strips timeout/nice/env prefixes ` +
      `itself), but a git.exe form outside push/merge/rebase, any "git -C <path> ..." form, an ` +
      `unstripped wrapper such as sudo or npx, and irregular spacing between the tokens match ` +
      `nothing and would raise no dialog at all. This is that dialog. Run it as a plain ` +
      `"git ${verb} ..." from the repository root to keep the ordinary one. ${G4}`
    );
  });
}

module.exports = {
  GIT_ASK_VERBS, recognisedVerb, subcommandsOf, stripWrappers, shippedRuleMatches,
  everyGitFormIsRuleMatched,
};
