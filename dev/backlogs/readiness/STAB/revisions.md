# PLAN_STAB - revisions

## r0 (2026-10-14, HEAD bc8c9a4)
Draft from the Silerax intake review and the CANDIDATES inventory; one ticket STAB-001, 28 points.

## r0 -> r1 (after Step 2a: ledger.md 28 rows, consequence-scan.md 27 rows)
Block A no longer sends a procedure agent to Write (Gate 1 denies it); S1 names aiwf.config.json only
(/pnp:roles never writes settings.json); E quotes the approval in COVERED BY; Q promises no cost a
wrapper does not record; the migration note is written in English in the plan (r0 had a Cyrillic
placeholder - provenance fail); CHANGES file of --apply in scope; index.json comma; update SKILL bullet
punctuation; five pins named, not three; acceptance replaced by check-blocks.mjs (whole block,
whitespace-normalized) - three r0 prefix probes already matched at HEAD. 32 blocks in ```text fences.

## r1 -> r2 (after Step 2b: fact-check-r1.md - 167 claims, 12 FALSE, 10 UNVERIFIABLE; gaps A=18 B=13 C=8)
Closed: landing before the Writer dispatch (Gate 2 off-plan needs the ref in active/); H is an explicit
exception to WORKFLOW:317/323 and lists the five check-1 surfaces incl. permission model; NOTES.md and
CHANGELOG text verbatim as blocks; check-blocks.mjs gained absence ("!ID") and duplicate checks - 8 old
texts (E, G2, I, R1, R2, T, W, X); --dry-run before --apply, stop rule on any non-zero exit, no
--resolution-file; git add only worklist files + CHANGES; branch main; README/CHANGELOG/version checks;
pins' observers named (selfcheck, update-suite); D11 lists all touched doctrine files as a report;
VERIFY batch: no edits while it runs, D10 cites the overrides rows and justifies setup-suite and
plugin-validate; D1 states the class as a COO decision with precedent (0.2.14) and offers review.code;
D2 quotes check 1 literally; D3 says why this is not the prose-only release shape; D4 moved to
CANDIDATES deferred at landing; anchor :104; three re-renders here (reviewer skipped); M1/M2 scoped to
tracked files; D gated as "the plan cannot go on without its answer"; N cites the documented cap; L
says "observed on a consumer". Host-behaviour claims (L, N server notice, R1 parallel start, S1/S2
classifier) stay worded as "may"/"observed" - the tree cannot prove host behaviour.
check-blocks.mjs: valid fixture `blocks: 2/2 present, 1/1 old texts gone` exit 0; real tree at HEAD
`blocks: 0/34 present, 0/8 old texts gone` exit 1.
Own pass over r2: BLOCKERS FOUND 0, stamp `3d0d950f5099187e0f542a7beebb1128e8b08b28444457b22a4ef9d31daf82c6`.

## Readiness pass 1 (Codex gpt-6-sol/xhigh, cold, 2026-10-14; COVERED BY "пусни кодекс, нека видим какво ще каже"; 134,800 tokens) - NEEDS-FIX, verbatim

NEEDS-FIX

**Блокери**

- PLAN_STAB.draft.md:33 — D1 третира `ops.json` като неактивни данни и избира `review.docs = 0`. Операциите в Y се изпълняват от migration engine и променят инсталирани файлове. Това попада под „anything that runs“ в WORKFLOW.md:819 и дефиницията за `Class: code` на ред 837; прецедентът от 0.2.14 не отменя това правило. Така планът пропуска изисквания одиторски пас.
- PLAN_STAB.draft.md:42 — D2 твърди „all four no“, но worklist 14(g)–(h) на редове 165–170 няма `file:line` котви и не описва нови файлове. Буквалната проверка 2 в WORKFLOW.md:873 дава „yes“, следователно записаният `COO: cheap` не следва от правилото.
- PLAN_STAB.draft.md:232 — H казва, че малък кодов кръг не изисква *никакъв* verification pass. При кръг след `QA fail` това оставя последната QA присъда `fail`, докато skills/loop/SKILL.md:75 и редове 84–85 изискват всяка задължителна роля да върне `pass` или `pass-with-notes` преди commit. Планът не разрешава този път.
- PLAN_STAB.draft.md:407 — Acceptance не проверява точните операции в Y. `check-blocks.mjs` чете само заглавия `#### … → …`, а `update-suite` премахва реалните миграции при създаване на fixtures (test-update.mjs:245). Например липсващият `reviewer.md` rerender би минал локалните проверки и `--apply` тук, където Reviewer няма запис, но би оставил Claude-hosted инсталация без O2. Това е счупен release, който описаната acceptance допуска.
- PLAN_STAB.draft.md:449 — Dry trace завършва с docs commit за completion/archive и преминава направо към tag. Пропуска опресняването на `D:\pnp-live` след този commit, изисквано **след всеки commit на main** от CLAUDE.md:173.
- fact-check-r1.md:1 — Наличният fact-check е върху r1, а представеният план е r2 (PLAN_STAB.draft.md:3). WORKFLOW.md:400 изисква fact-check на всяка ревизия преди платения readiness pass. За r2 няма такъв артефакт; own-pass хешът е върху r2.

**Неблокираща бележка**

- PLAN_STAB.draft.md:379 твърди в NOTES, че всяка промяна е в съществуващ абзац, но worklist поставя J1 и S1 като нови абзаци.

## r2 -> r3 (operator "да" to fixing; closes the six pass-1 blockers + the delta scan + fact-check-r2)
Blocker 1: D1 code-class, review.code one Codex pass on the ticket's word, R2-not-R3 reason (COO error,
admitted to the operator). Blocker 2: COO top because check 2 (14(g)-(h) are commands without anchors);
check 1 stated as arguable. Blocker 3: H only for a code round answering a Reviewer fail; a QA fail is
closed only by a QA run (H, NOTES, CHANGELOG, Y note). Blocker 4: Y is a check-blocks block checked whole
+ a JSON.parse acceptance. Blocker 5: pnp-live refresh after the record commit. Blocker 6: delta
fact-check-r2.md. Note: NOTES says "one to three sentences inside an existing section".
Delta scan rows 28-45 (consequence-scan.md): row 36 -> new block G3 in skills/loop step 6 (the commit
gate could not pass after a small round); row 42 -> dry trace branch for the small round; the rest
no defect. fact-check-r2.md (94 claims, 3 FALSE, 5 UNVERIFIABLE, gaps A=7 B=5 C=6) all closed: landing
names and hashes, literal route-state, COVERED BY, --apply covered by the ticket word, re-run after a
round, D2 check 4, NOTES citation, G3 requires the fact-check gate.
check-blocks.mjs over r3: real tree `blocks: 0/36 present, 0/8 old texts gone` exit 1.
Own pass over r3: BLOCKERS FOUND 0, stamp `be4591a148735c88bf1f4ee6293773e775cc56b11863914d41d27a063da83889`
(earlier stamp over r2: `3d0d950f...82c6`). Pass 2: operator word "давай, с пас 2 ок" (2026-10-14); cold.

## Readiness pass 2 (Codex gpt-6-sol/xhigh, cold, 2026-10-14; 132,730 tokens) - NEEDS-FIX, verbatim

NEEDS-FIX

- CLOSED — D1 класифицира изпълняваните `ops.json` операции като `Class: code` и предвижда `review.code` пас.
- CLOSED — D2 избира `COO: top` по буквалната проверка 2.
- CLOSED — H изисква нов QA run след `QA fail`; G3 описва пътя след малък кръг по `Reviewer fail`.
- CLOSED — Acceptance проверява целия Y блок, валиден JSON и `validate-payload`.
- CLOSED — Dry trace опреснява `D:\pnp-live` и след последния docs commit.
- CLOSED — `fact-check-r2.md` обхваща ревизията; хешът в `own-pass.md` съвпада с r3.

**Нов блокер**

- PLAN_STAB.draft.md:42 — D1 твърди, че R3 се отнася само за миграции на данни/права, и оставя тикета на R2/main. WORKFLOW.md:853 и LOOP.md:16 посочват „migrations“ в R3 без това ограничение; PROJECT_OVERRIDES.md:159 нарича тези операции payload migrations. Така маршрутът и Git предпоставките в dry trace не следват от действащата доктрина. **Произход:** r3 добавя изричното разграничение „R2, не R3“ към променената D1 code-class класификация; това твърдение липсваше в r2.

**Неблокиращи бележки:** няма.

## Operator ruling and landing (2026-10-14)
Operator: "р2 без пас, след това одобрение на плана и комит" - R2 (the pass-2 blocker is settled by the
operator, not by a revision; no pass 3), plan APPROVED. r3 -> landed: D1 states the R2 ruling and that the
R2/R3 text mismatch is a next-plan candidate; approval note in the header. Draft moved to
`dev/backlogs/active/PLAN_STAB.md`.
Hashes: own-pass stamp over r3 (audited) `be4591a148735c88bf1f4ee6293773e775cc56b11863914d41d27a063da83889`;
landed plan `af23d7885aaa4b6c44d32eef69c9177b6fdefa2856daa6c8e240d0e6cdb69641` - the difference is the
D1 R2-ruling sentence and the approval note.
Cost of the cycle: Codex 134,800 + 132,730 tokens; Claude-side scan agents (sonnet) ~200k + 2x~200k +
2x~100k (session reports).
