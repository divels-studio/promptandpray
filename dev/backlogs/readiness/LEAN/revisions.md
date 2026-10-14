# Revisions - PLAN_LEAN

## r0 (2026-10-04, session "PNP 0.2.17 PLAN") - first draft

Written at HEAD `77936fc` after the inventory: one Explore/sonnet over the payload surfaces of the
six points plus the release mechanics (232 pointers; plan-gate.js never names ledger.md; the
own-pass header is exactly seven cells in `CHECKS_HEADER`; the transfer-surface template is seeded
once and unmanaged; ORCHESTRATOR.md.tmpl has no version stamp), and one Explore/sonnet over the two
consumers' local rules (read-only, outside the repository: both carry (a)-(d) and (f) with an
"expires with 0.2.17" clause; neither has a rule for (e)). Scope authority:
`dev/backlogs/CANDIDATES.md` § "От readiness цикъла на Silerax PLAN_PUR v3", the paragraph of
2026-10-04 (operator word "всичките шест"). One ticket LEAN-001 [R2 code-class], release 0.2.17,
migration `0021_lean-readiness` (ORCHESTRATOR rerender + note); decisions D1-D14.

Readiness runs under the CURRENT payload (0.2.16): Step 2a and Step 2c as two agents in parallel.

## r1 (2026-10-04) - after ledger 1, scan 1 and the instrument probe

Probe (1x general-purpose/sonnet, read-only on the repo, scratch under the scratchpad): the WORKFLOW
skeleton equals the template today (awk|diff rc=0; one mutated character -> `3c3`, rc=1); a setup
dry-run with `paths.plansDir: .aiwf/plans` exits 0 with no note and plans the four mkdirs (no
containment refusal); `writeFixture(root, pluginVersion)` writes plansDir `docs/backlogs`; the S6
expected lines and `grew !== 3`; Node v24.12.0, GNU awk 5.0; every "on the anchor" count measured.
Ledger 1: 112 rows (A interview chain, B self-check chain, C release chain, D template render, E
transfer surface, F plan gate, G example cycle, H anchors), 0 UNREAD. Scan 1: 37 rows, 10 `none
found`, 27 with a surface - 21 closed `plan:`, 16 `no defect:` (every row closed in
`consequence-scan.md`). Changes in r1:

- D2: the delta dispatch carries the SCAN half only; a link a revision adds is a ledger row by the
  Step 2a rule (scan 3); block C and D2 reworded.
- D3: ORCHESTRATOR § Data discipline rule line (`:50`) gets "ASKED for when the record needs it"
  beside block O3 (scan 7) - four hunks; Branch policy clause stays, reason stated (scan 8); no test
  compares the skeleton, stated (scan 9).
- D4: short six-check lists in SKILL Plan-readiness mode (1(h)) and docs/REVIEW_CHECKLIST.md (2a) get
  the class-15 parenthesis; reviewer.md.tmpl stays (scan 12); the gate reads `discovery` non-empty
  only - honest limit (scan 13); clean form `0 - no write with a concurrent caller` (scan 14); row 15
  reworded "on a path the ticket writes" (scan 15); "fourteen" greps dropped (scan 16, probe).
- D5/O1/O2: the ORCHESTRATOR template points to Step 2d and does not restate it (scan 18); block D1
  and O2 re-wrapped so acceptance literals sit on one line (scan 5, 6; ledger H14); 2(a) given as three
  pre-wrapped lines; a one-line-literal list in the acceptance.
- D6/D7: lexical norm via `path.posix.normalize` + lowercase (scan 20); matrices extended; helper
  inserted after `scratchIgnored` (scan 25); four "two warnings" texts -> three (scan 27, ledger A14);
  wrapper ask for the plans question, SCRIPTED_ANSWERS untouched (scan 28); test-setup `:48` import
  (ledger A5); `install()` with a full `paths` object (ledger A10); `mutateJson` for S7 (ledger B14);
  S6 name `:5655` and summary `:8318` (scan 22, probe); selfcheck SKILL `:44-45` wrap (scan 23).
- D8: block F2 reworded around the inventory pointers (scan 30).
- Block N: single quotes - valid JSON string (scan 32; ledger C3).
- Acceptance: provenance greps widened to .claude-plugin, CHANGELOG.md, the CHANGES report (scan
  35); ORCHESTRATOR `every pointer` -> rc=1; four hunks; `ASKED for when the record needs it` -> 1;
  REVIEW_CHECKLIST and 1(h) literals; closing grep 12(a) five hits; 12(e) by `(observed)`; 12(f)
  `the fifteenth on`.
- Order: `selfcheck` standalone after worklist 1-10, before the bump (ledger C13); bookkeeping diff
  noted (ledger C11); trace step 2 - in-flight CANDIDATES rows after `{}` (scan 37).
- Anchors: WORKFLOW 2(b) `:420-424`; ORCHESTRATOR 3(c) `:57-58`; 1(d) phrase wrapped `:293-294`;
  12 baselines measured.

## r2 (2026-10-04) - after Step 2b fact-check r1 (two agents)

Agent T (ticket + ledger A-B): 190 claims, 14 FALSE, 9 UNVERIFIABLE, gaps A9 B11 C9. Agent S (shared
+ ledger C-H): 202 claims, 10 FALSE, 8 UNVERIFIABLE, gaps A10 B14 C7. Every row and gap is in
`fact-check-r1.md` with its closure. Changes in r2: five ops.json greps get their file operand; the
provenance grep drops CHANGELOG.md and greps the new block alone; "class 15" in SKILL -> 3; blocks
2(a) and F2 re-wrapped; F2/M/D8 reworded to what CANDIDATES.md:51,73 records (629 pointers opened by
agents in the own pass, 4 FALSE; blockers mostly design and concurrency); the ask predicate named;
S7's name and the "Six fixtures" wording; 2a names the exact insertion words; four risk-threshold
observers added, one item declared Codex-only; D4 cites by symbol and says one rerender op; D7/8(f)
say header item 10; D9 says four places; D12 row names aligned; routing check 2 restated with the
exemptions; block C defines the SCAN-half dispatch text; block CL's date declared illustrative; the
acceptance header: instruments are execution, the redirects are the VERIFY batch's outputs, the
landing item is a COO act, `<котва>` is the brief's literal hash; the commit-line rule stated; the
ledger corrected (C7, C8, F8, G4, H14, A5, B6) and extended (I1-I3). The r2 text is what the own
pass is stamped over.

## Own pass (2026-10-04) - first stamp, over r2 (+ its own five blockers)

In a turn of its own, opened by the instrument agent's hand-back (58 instruments, both faces, no
writes under the repo). BLOCKERS FOUND 5, all applied before the stamp: the stale "pass 1 on an
operator word" / "STOP" in the header and trace; the 1(h) literal split; the stale `629 ... three
agents` in the one-line list; the dev/ status guard's moment; the per-line `"op":` count. One typo.
Stamp: `9a7a127196e88a0ff17907f1afcf637e036e668939cc54a0e373864d661b84e5` (the text pass 1 is
dispatched over). The brief `.aiwf/review-brief.txt`: COVERED BY quotes the session brief § 5 ("Пас
1 — на думата за планирането"), the five fixed lines, `PREVIOUS PASS BLOCKERS: none - this is pass
1`, risk threshold and stop condition of the plan, BUDGET TARGET. The 0.2.16 plan gate over that
brief (`plan-gate.js --project-root D:/promptandpray --plan-class`, stdin): exit 0, silent - the five
lines, the 37 closed scan rows, the own-pass tables and the stamp over the current text accepted;
the hash re-printed after the stamp is unchanged (`9a7a1271...b84e5`).

## Pass 1 (2026-10-04, session "PNP 0.2.17 PLAN") - Codex gpt-6-sol/xhigh, cold, over r2 (stamp `9a7a1271...b84e5`)

Dispatched on the planning word of the session brief (no new operator word), in the background;
the 0.2.16 plan gate in `D:\pnp-live` accepted the brief. Tokens used 148,092. Verdict verbatim (the
auditor answered in the plan's language):

```
NEEDS-FIX

1. **Указателната дисциплина остава противоречива.** Планът добавя F1 след съществуващия bullet, без да промени началото му (план:322–323, план:643–650). То изисква `file:line` за *всяко* фактическо твърдение за съществуващ код или изрично `unverified` (WORKFLOW:578–581); F1 казва, че обяснителният контекст цитира само секция и символ. Фактическо твърдение в такъв контекст ще попада под две несъвместими инструкции. Планът трябва да стесни и съществуващото изречение.

2. **Префиксната проверка дава невярно наблюдение на Linux.** D6 и двата зададени helper-а свеждат регистъра и приемат `.AIWF/plans` за път под `.aiwf`; тестовите очаквания закрепват това поведение (план:181–196, план:356–363, план:421–427, план:384–388). Linux е поддържан (generate.mjs:109); там `.AIWF` и `.aiwf` са различни директории, а ignore правилото е `.aiwf/` (.gitignore:1). Мотивът с Gate 3 се отнася до allowlist, чийто коментар обосновава сгъването с Windows (mutation guard:90–99). Така self-check може да твърди „под scratchDir“ за тракваем път; acceptance-ът ще отхвърли коректна за Linux поправка. Планът трябва да уточни проверката и очакванията за поддържаните ОС.

**Неблокиращи бележки:** Проверих целия план срещу посочените входове. `main` е на `77936fc`, а SHA-256 на черновата съвпада с own-pass печата. Не промених файлове.

**DISPUTED DESIGN DECISION:** Няма отделно оспорено решение; горните две са дефекти в записания договор.

**Следващо действие:** Поправете тези две места в черновата, повторете делта скана, fact-check-а и own pass-а с нов печат, след което подайте пас 2 на изискваната за него отделна операторска дума.
```

## r3 (2026-10-04) - after pass 1

Closes the two blockers - and, as delta scan 2 and delta fact-check r3 then found, closes them
defectively and with new surface (a host-platform default on two helpers, a darwin claim, a
tautological matrix case, a half-narrowed bullet); r4 below replaces that closure. As written in r3:

- Blocker 1 - worklist 2(d), block F1, D8, acceptance: the bullet's bold opening becomes "A factual
  claim the Writer acts on carries a `file:line` pointer" (the rest of its sentence - "or is marked
  explicitly unverified, for the Writer to check" - stays), and F1 is appended after it; the two
  sentences now say the same thing from two sides (who owes a pointer / where it is owed). Acceptance:
  the new opening -> 1, the old opening -> 0 (anchor 1).
- Blocker 2 - D6, D7, worklist 6(a), 8(a), 9(a), S7: case folds ONLY where the file system and git's
  ignore matching fold it - a third parameter `foldCase` defaulting to `process.platform === 'win32'
  || process.platform === 'darwin'`; on linux the paths are compared as written, so `.AIWF/plans` is
  "outside" there and a tracked path is never called ignored. The matrices test both faces explicitly
  (`foldCase: true` -> under, `false` -> outside) plus the platform default, so the suites pass on
  windows and on the ubuntu CI leg alike. The Gate 3 comparison, which folds on every platform for the
  Windows case, is named as a different contract (an allowlist of writable segments, where folding is
  the safe direction) - this observation reports a fact about git, where it is not.

## r4 (2026-10-04) - after delta scan 2 (rows 38-57 over r3)

20 rows: 16 with a violating surface and 4 `none found`; closed as 11 `plan:` and 9 `no defect:`; every row in `consequence-scan.md`.
The r3 closure of pass-1 blocker 2 was itself defective (class 14): it read the HOST platform
(`process.platform`), added darwin against the module's own win32-only precedent (`samePath`), kept
the backslash rewrite on linux where `\` is a name character, and its matrix mirrored the production
expression (tautological on every CI leg). r4 replaces it: a flag `windowsPaths` (case AND backslash),
default `false`, set at every call site from the project's DECLARED `os` (`merged.os`, the interview's
`os` answer of :158, `cfg.os`) - never from the host; the matrices are deterministic on all legs and
the os wiring is proven through the real finding (S7: `os: windows` -> under, `os: linux` -> outside);
blocks E1, M, N and CL say "a lexical prefix test ... folds case and backslashes on a project whose
`os` is windows; git is not asked"; D6/D7 state the honest limits (a mount whose case rule differs
from the declared os; the one-line `merged.os === 'windows'` wiring has no test of its own). Pass-1
blocker 1's closure was also incomplete (row 38): the bullet's middle still said "any factual claim"
- 2(d) now replaces the whole bullet with block F1 (opening, middle and end in one scope); acceptance
adds `before writing any factual claim` -> 0 and states each face per command (row 40).

## r5 (2026-10-04) - after delta scan 3 (rows 58-74 over r4) and the delta fact-checks r3 and r4

Delta scan 3: 17 rows, 5 with a surface, 12 `none found`; closed as 5 `plan:` and 12 `no defect:`.
Delta fact-check r3 (over the r3 text, 1 agent): 119 claims, 102 verified, 8 FALSE, 9 UNVERIFIABLE,
gaps A3 B3 C3 - mostly superseded by r4 (the host-platform default, the mirror matrix), the rest in
`fact-check-r3.md`. Delta fact-check r4 (over the r4 text, 1 agent): 141 claims, 117 verified, 11
FALSE, 13 UNVERIFIABLE, gaps A7 B10 C4 - every row and gap in `fact-check-r4.md` with its closure.
Changes in r5 (closing the handed findings, nothing new): 9(b) guards `typeof cfg.os !== 'string'`
and prints `config paths or os unusable - nothing to observe` (rows 58, 59; D6 aligned to that text);
S7 gains the `delete c.os` face (fact-check r4 A4) and S8 = `byId(s2, ...)` (A2, row 64); the `os`
wiring of the generator and the interview is tested in a new test-setup block 12c over
`project('under-scratch')` with `.AIWF/plans` at `os` windows and linux (A5, A3) - two more named
checks in the acceptance; the `-U0` hunk guard, which cannot pass (two hunks - rows 579-580 are
byte-identical), is replaced by a byte-for-byte diff of the bullet against `<OUT>/lean-block-F1.txt`
(A1, the DRAFTS block-T pattern); `"op": "note"` -> 1 (A6); the example cycle's byte-identity check
named as the observer of "redirects under the repo" (A7); "scan agents" -> "agents" in F2, M, D8 and
the acceptance (B2: CANDIDATES.md:73 says "агенти"); macOS stated as compared as written with its
honest limit, the mount limit written into D6 (B3, B6); the code comments carry no OS facts beyond
"compared as written" (B3); block E1 re-wrapped so its literal sits on one line (row 71); the Windows
dot/space/8.3 limit named (row 72); 1(c) `:380-382` (B8); the no-trailers rule cites the COO memory
`no-claude-trailers-in-git` (B9); r4's own counts corrected above (B4, B5); ledger A14, B6, B14 and
A5 rewritten; scan rows 45 and 57 re-closed (B6, B7). The r5 text is what the second own-pass stamp
is over.

## Own pass 2 (2026-10-04) - second stamp, over r5

In a turn of its own, opened by the hand-back of the r5 instrument probe (F1 diff both faces,
`0a1,8` / no output / `8d7`; the seven ops.json greps 2/1/1/1/1/1/1 and the broken-note face 0;
three dry-runs on a scratch fixture incl. a linux-os project on this Windows host - exit 0; the
`choice` contract accepts `linux`; `projectLayerFindings` reads no `os`, `config-schema-valid`
records a finding). BLOCKERS FOUND 4, applied before the stamp: 8(b)/(c) over `p3` not `p`; "шест"
checks; (d) stays in 12b's clean block; the F1 diff anchor face is `0a1,8`. Stamp:
`b82d10d1cb698028c04e0511b480af71d49e9d647ff2231ba821588b43a63fde` (1119 lines). The 0.2.16 plan gate
over the unchanged pass-1 brief (five lines, 74 closed scan rows, this stamp): exit 0, silent; the hash
re-printed after the stamp is unchanged. Live gate faces measured in this cycle: `file-missing:OWN
PASS` (before the first stamp), exit 0 (first stamp), `own-hash-mismatch` (after r3 edited the plan:
stamped 9a7a1271..., now c52a5b9b...), exit 0 (second stamp).

Stamps: r2 `9a7a127196e88a0ff17907f1afcf637e036e668939cc54a0e373864d661b84e5` (pass 1 was dispatched
over it); r5 `b82d10d1cb698028c04e0511b480af71d49e9d647ff2231ba821588b43a63fde` (the text pass 2 is
dispatched over, on the operator's own word - the brief carries pass 1's two blockers verbatim and the
origin duty).

## Pass 2 (2026-10-04, session "PNP 0.2.17 PLAN") - Codex gpt-6-sol/xhigh, WARM (resume) over r5 (stamp `b82d10d1...3fde`)

Operator word: "пускай топъл" - a resumed pass with its three compensations written into the brief:
re-read the plan (r2 -> r5, 1025 -> 1119 lines) and every readiness file from DISK, not from the
session's memory; an independent search for consumers of the r3-r5 surfaces; pass 1's two blockers
verbatim with the carried-list status duty and the origin duty for every new blocker. Resumed session
`01a1074e-17db-7eb0-8c90-bde27757039b` (the wrapper's recorded id of the cold pass 1); the 0.2.16 plan
gate accepted the brief (exit 0 over the second stamp).

**INTERRUPTED - no verdict.** The engine stopped on its own quota: `ERROR: You've hit your usage
limit ... try again at 7:08 PM` (twice), exit 1, after re-reading the plan, the readiness files and
the tree (its last read was generate.mjs around planInstall's directories block). `tokens used
446,250` - cumulative for the resumed session (pass 1 was 148,092), so the interrupted pass had
consumed about 298,000 before the limit; the warm compensations (a full re-read from disk of a 1119-line
plan plus 74 scan rows plus three fact-check files) are what made it cost twice the cold pass. Operator
word in the same minute: "след вердикта спираш, сесията е пълна" - this session stops here.

**Recovery for the NEXT session (`/pnp:review` Step 3, "An interrupted paid pass is NOT lost work"):**
after 19:08 local, a bare resume with a SHORT continuation prompt in `.aiwf/review-brief.txt` - the
five fixed lines (`Class: plan`, `PLAN:`, `TICKETS:`, `CONSEQUENCE SCAN:`, `OWN PASS:`), the COVERED
BY line quoting the operator's word for the continuation, and "continue - you already have the brief
and your progress; produce the verdict" - then the same `codex-review.ps1 ... -Class plan -Resume`
block. The plan must NOT change before that (the stamp `b82d10d1...3fde` must still match); the
wrapper's recorded session id is the one above (check `.aiwf/last-review-session.txt` first - a
cleared file means `-ResumeId 01a1074e-17db-7eb0-8c90-bde27757039b` or a cold pass on the operator's
word). A CATCH row for the Event ledger at landing: the warm pass with full compensations over a
plan this size cost more than the cold pass before it was cut off - the CANDIDATES § "ГЛАВЕН
ПРИОРИТЕТ" question (warm + compensations vs cold) has one more data point.

**Continuation (same session, operator word "има квота пускай"):** the recovery of Step 3 - a bare
`-Resume` (recorded id `01a1074e-17db-7eb0-8c90-bde27757039b` still in `.aiwf/last-review-session.txt`)
with a SHORT continuation prompt in `.aiwf/review-brief.txt`: the five fixed lines, COVERED BY quoting
the word, "continue - you already have the brief and your progress; produce the verdict", and a
reminder that nothing changed since (stamp `b82d10d1...3fde` holds). The engine finished in one go;
`tokens used 453,600` cumulative (the continuation itself ~7,350 after the 446,250 of the interrupted
run). Verdict verbatim:

```
NEEDS-FIX

1. **Невалиден `os` все още получава категорично наблюдение.** Планът обещава `unusable` за конфиг с липсващ или негоден `os`, но зададеният guard проверява само дали стойността е низ (план:494–504). При `os: "solaris"` и `plansDir: ".AIWF/plans"` той ще отчете `outside the scratch directory`. Схемата допуска само `windows`, `linux`, `macos` (schema:121–125); self-check чете суровия конфиг (selfcheck:5136–5139), а проверката на схемата е отделна находка по-късно (selfcheck:5497–5503). S7 пробва само изтрит `os` (план:527–532), така че acceptance може да мине с това невярно наблюдение. **ORIGIN:** родено в r5 с guard-а и твърдението на редове 494–504; този път не е съществувал в прегледания на пас 1 r2.

**CARRIED-LIST STATUS**

1. **CLOSED.** F1 вече заменя целия противоречив bullet, включително средното изречение, и acceptance сравнява целия нов текст (план:725–737, план:973).
2. **CLOSED.** За валидните декларирани ОС `windowsPaths` вече се подава през трите реални извиквания; Linux запазва регистъра и backslash-а, а матриците проверяват двете лица (план:185–215, план:521–530). Горният дефект е отделният r5 път за невалиден низ.

**Неблокиращи бележки:** Прочетох r5 и readiness файловете от диска и потърсих независимо потребителите на променените повърхности. `main` остава на `77936fc`, печатът съвпада, а plan gate върху текущия бриф завършва с exit 0. Не промених файлове.

**DISPUTED DESIGN DECISION:** Няма.

**Следващо действие:** COO да коригира guard-а в 9(b) за целия `os` enum и да добави S7 лице с невалиден низ; след това да обнови делта скана, fact-check-а и own-pass печата преди следващия readiness пас.
```

Cycle state: pass 1 NEEDS-FIX 2, pass 2 NEEDS-FIX 1 (both carried blockers CLOSED; the one new blocker
is born of r5 with its origin declared). The configured passes (2) are exhausted. Operator word in this
session: "след вердикта спираш, сесията е пълна" - the session ends here, no r6 in it.

**For the NEXT session:** r6 closes exactly the one blocker - 9(b): the guard becomes `!['windows',
'linux', 'macos'].includes(cfg.os)` (the schema enum, exact lowercase) -> `config paths or os unusable -
nothing to observe`, and S7 gains the face `c.os = 'solaris'` (or any non-enum string) -> that text,
beside the existing `delete c.os` face; D6/9(b) prose say "not one of the three enum values" instead of
"not a string". Then a delta scan over the changed decision || a delta fact-check over r6 -> own pass
(in its own turn) with a new stamp -> gate -> pass 3 = the hard maximum, only on the operator's own word
(the brief carries pass 2's one blocker verbatim + the carried-list status + the origin duty; cold or
resume is the operator's call - the warm pass over this plan cost ~298k before the quota cut it and
~7k to finish) -> approval (word) -> landing.

## r6 (2026-10-14, session "/pnp:work") - IN PROGRESS: operator scope change on point (b)

Operator word: "Двойката start/stop ... премахва се изцяло, не е необходима вече" - point (b) changes
from "optional" to "removed". D3 rewritten: block T says only which pass and what it cost as the
engine reported it (two lines, template 24 lines unchanged); new block B and worklist 2(g) drop the
WORKFLOW § Branch policy "one live auditor ... SCOPED TO MEASUREMENT" sentence (it held only while a
pair was recorded - supersedes the r1 closure of scan row 8); ORCHESTRATOR § Data discipline is no
longer touched (block O3 and the "when the record needs it" hunk dropped - supersedes scan row 7), so
the template takes two hunks, not four; 12(d) `start/stop` after -> empty, plus a `live auditor`
grep; acceptance, literal list, risk threshold, out-of-scope, blocks N/M/CL (CL: the pair moves to
`### Removed`), commit subject and trace aligned. Superseded readiness rows: ledger E4, E5; scan rows
7, 8, 10.

Pass-2 blocker 1 closed (operator word "продължи с r6 и блокера от пас 2"): 9(b) guard is
`!['windows', 'linux', 'macos'].includes(cfg.os)` (the schema enum, `schema/aiwf.config.schema.json`
`os.enum`, exact case) -> `config paths or os unusable - nothing to observe`; S7 gains the face
`c.os = 'solaris'` -> that text, beside `delete c.os`; D6 and 9(b) prose say "not one of the three
enum values".

Delta scan 4 (1x Explore/sonnet, rows 75-91): 17 rows, 2 `none found`, all closed `no defect:`; rows
7, 8, 10, 58, 59 annotated as superseded in place. Delta fact-check r6 (1x Explore/sonnet): 62
claims, 56 verified, 5 FALSE, 1 UNVERIFIABLE, gaps A2 B4 C4 - every row closed in `fact-check-r6.md`:
block N "yours to change", block M "points to Step 2d", the trace's token wording, ledger E4/E5/H6
rewritten and B6/B14 annotated, two acceptance greps added (`read off the host|counter pair` -> empty,
`^  reported it\.$` -> 1 per file; both anchor faces measured), the header chain extended.

Own-pass instrument run (1x general-purpose/sonnet, scratch copies under the session scratchpad,
`git grep/diff --no-index` - Gate 4 denied it `git commit` in the scratch copy): instruments 1-10
matched on every face - `start/stop` 3 -> none (B unapplied -> hit), `live auditor` 1 -> none,
block T line 1 and line 2 greps rc=1 -> 1 per file (no-dot face drops the template), `read off the
host|counter pair` 2 -> none (planted "counter pair" -> hit), block B literal rc=1 -> 1, skeleton
diff rc=0 -> rc=0 (T on one side -> rc=1), ORCHESTRATOR hunks 2 (edit at :57 -> 3), guard table:
NEW enum guard gives unusable for solaris/Windows/undefined, OLD typeof guard gives categorical for
solaris and Windows. Process deviation: the agent first wrote scratch files into this directory
(session cwd) and moved them out at once; the directory holds only the eight readiness files
(checked). Operator word "след агента спираш": the session stops here. NEXT SESSION: own pass in a
turn of its own over r6 -> `own-pass.md` new stamp (`plan-gate.js --hash`) -> gate -> pass 3 (the
hard maximum) on the operator's own word, cold or resume his call; the brief carries pass 2's one
blocker verbatim with its CLOSED status and the operator's D3 change.

## Own pass 3 (2026-10-14, session "/pnp:work") - third stamp, over r6

Operator word "минаваме към LEAN". `/pnp:review` loaded and Steps 2a-2e re-read first (overrides rule
"Заглавие не е текст"). In a turn of its own, after the instrument run's hand-back: the r6 regions
re-read first-hand, a closing grep over the draft for the old wordings (only history and instruments
hit). BLOCKERS FOUND 0. Stamp: `fceb0b637bfa046a3c54a3fdd1cd3f44dc52c86ac9fab87f88ecc44a0be1bbe4`. The
0.2.16 plan gate over the pass-3 brief (five lines; 91 scan rows; this stamp): exit 0, silent. Pass 3
(the hard maximum) is NOT dispatched - it waits for the operator's own word, cold or resume his call.

Stamps: r2 `9a7a1271...b84e5` (pass 1), r5 `b82d10d1...3fde` (pass 2), r6 `fceb0b63...bbe4` (pass 3).

## Pass 3 (2026-10-14, session "/pnp:work") - Codex gpt-6-sol/xhigh, COLD, over r6 (stamp `fceb0b63...bbe4`)

Operator word "studen ok" (COVERED BY line). The 0.2.16 plan gate in the wrapper accepted the brief.
Tokens used 131,408 (the wrapper output). Verdict verbatim:

```
PASS

**Блокери:** Няма нови материални блокери.

**CARRIED-LIST STATUS:** **CLOSED.** Guard-ът в 9(b) проверява трите стойности от schema enum-а ([планът](/D:/promptandpray/dev/backlogs/drafts/PLAN_LEAN.draft.md:502)); S7 проверява и `os: 'solaris'` срещу `unusable` ([планът](/D:/promptandpray/dev/backlogs/drafts/PLAN_LEAN.draft.md:538)). Схемата допуска точно `windows`, `linux`, `macos` ([схемата](/D:/promptandpray/schema/aiwf.config.schema.json:121)).

**Неблокиращи бележки:** Прочетох целия план и всички осем readiness файла. `main` е на `49fc203`; payload файловете не са променяни след котвата `77936fc`. SHA-256 на r6 съвпада с печата в [own-pass.md](/D:/promptandpray/dev/backlogs/readiness/LEAN/own-pass.md:27).

**DISPUTED DESIGN DECISION:** Няма.

**Следващо действие:** Върнете PASS на COO за одобрението и лендинга по плана.
```

Cycle: pass 1 NEEDS-FIX 2, pass 2 NEEDS-FIX 1, pass 3 PASS (carried blocker CLOSED, no new blocker).

## Landing (2026-10-14, operator word "odobrqwam")

`mv dev/backlogs/drafts/PLAN_LEAN.draft.md dev/backlogs/active/PLAN_LEAN.md` (plain rename, the draft
was untracked) + the approval note in the header. Hashes: the stamp over the audited draft
`fceb0b637bfa046a3c54a3fdd1cd3f44dc52c86ac9fab87f88ecc44a0be1bbe4`; `plan-gate.js --hash` over the
landed plan `74b12781a11627389a2b7e80d09b6078b87182dc4f713b6831523f19c3b44031` - the only difference is
the approval note. Names: `test -f` on ledger.md, consequence-scan.md, own-pass.md, revisions.md - no
output; `fact-check-r*.md` - 4 (r1, r3, r4, r6). One docs commit with the plan, this directory and the
CANDIDATES rows. LEAN-001 execution waits for its own word.

Operator correction (2026-10-04, same session, for the Event ledger at landing): the COO had read
"pass 1 on an operator word" into the cycle; the operator objected ("имаме лупа цикъл ... да не стоя
и да ви вардя") - the doctrine says pass 1 rides the standing planning word (WORKFLOW § Plan readiness
review; the session brief § 5), and "a turn of its own" for the own pass is a turn boundary, not an
operator click. Corrected: the instrument runs of the own pass are dispatched to an agent whose return
opens the own-pass turn; pass 1 is dispatched by the COO on the brief's planning word.
