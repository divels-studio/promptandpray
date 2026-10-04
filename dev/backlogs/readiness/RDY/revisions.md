# PLAN_RDY - revisions (Fail aggregation carry)

## pass 1 (2026-09-29, codex gpt-6-sol/xhigh, cold, 168,918 tokens) - NEEDS-FIX, 13 blockers; auditor's split: author-preventable=11 design=2

Verbatim as returned:

1. **План 260–281, 561–570 | RDY-001, Step 4 | Проверка 4.** `UNREAD` спира паса, но собственият `chains.md` ред 35 маркира така новия seed, който още не може да бъде прочетен. Това прави първия ръчен run невалиден според предлагания договор и би спряло планове с нови файлове. **Затваря се** с изрично правило за бъдещи файлове, различно от непрочетено съществуващо звено.
2. **План 292–297, 567–570 | RDY-001, Step 7 | Проверки 4–5.** Step 7 иска резултат за валиден и счупен вход върху реалното дърво преди имплементацията; `simulation.md` вече отчита осем `CANNOT-RUN` за още несъществуващи цели. **Затваря се** с изпълним договор за тези проверки: какво се доказва преди промяната и кога се доказва положителният резултат.
3. **План 296–297 | RDY-001, Step 7 | Проверка 1.** Твърдението, че Gate 1/4 спират агента да пише файлове, е невярно: mutation guard покрива Edit/Write, а Gate 4 проверява Git verbs; shell запис остава извън двата (`pretooluse-mutation-guard.js:54–57`). **Затваря се** с вярно описание и изрично ограничение на страничните ефекти на командите.
4. **План 235–237, 311–324 | RDY-001, `--revise` | Проверка 4.** Първото `--revise` спира при липсващ `revisions.md`, докато R1 трябва тепърва да създаде файла от пас 1. R3 също назовава повторна симулация, но не изисква process trace преди следващия платен пас, както изисква `WORKFLOW.md:403–417`. **Затваря се** с определен момент за запис на вердикта и повторен trace в revise хода.
5. **План 232–234, 307–309 | RDY-001, scratch договор | Проверка 4.** Забраната за запис извън `<dir>` до одобрение противоречи на Step 9: `/pnp:review` записва брифа във фиксирания `<scratchDir>/review-brief.txt` (`skills/review/SKILL.md:329–336`). **Затваря се** с изрично изключение за този бриф.
6. **План 505–506, 518, 575–579 | RDY-001, acceptance и code pass | Проверки 5–6.** `git ls-files` няма да преброи новия skill и seed преди да са добавени в индекса, затова двете проверки остават на 12 и 17 при правилни, но още untracked файлове. Същите нови файлове отсъстват и от обикновен `git diff`, върху който планът поставя fact-check и code pass. **Затваря се** с изрична подготовка на Git състоянието и пълен review обхват за новите файлове, плюс броене, валидно преди commit.
7. **План 367–374, 512 | RDY-001, класове acceptance | Проверка 5.** При обичайния валиден Markdown разделител `|---|`, `grep -c "^| "` брои header и 14 реда, тоест **15**, а планът очаква 16. **Затваря се** с проверка за самите 14 реда или с буквално зададен разделител, който проверката брои.
8. **План 45–47, 362–374 | RDY-001, `READINESS_CLASSES.md` | Проверка 1.** Предвиденият payload текст твърди, че *всеки* от 14-те класа е бил платен pass-1 блокер; същият план отделя клас 14 като роден от ревизии между пасове. **Затваря се** с корекция на твърдението за произхода на класовете.
9. **План 449–461 | RDY-001, Door 4 | Проверка 2.** Буквалният текст ограничава входа до R3 и R2, който продължава през сесии или сменя архитектура. `WORKFLOW.md:584–586` допуска durable R2 и за важно домейн поведение или бъдеща нужда от кодово обяснение. **Затваря се** с формулировка „durable R2 и всеки R3“, съгласувана с договора на скила.
10. **План 488–491, 580–583 | RDY-001, release date | Проверки 4–6.** Ако датата се поправи след зеления CI, планът прави нов commit и веднага преминава към tag; новият commit не е push-нат и CI не го е доказал, в нарушение на `PROJECT_OVERRIDES.md:195`. Целевият hash на тага също не е назован след отделния docs commit. **Затваря се** с конкретна tag цел и повторни push и зелен CI за всеки коригиращ commit преди tag.
11. **План 583–584, 591–593 | RDY-001, `D:\pnp-live` | Проверка 6.** Опресняването на отделния worktree е записано само с ask диалог; `WORKFLOW.md:824–831` изисква предварителна операторска дума за точно тази външна мутация. Планът не проверява и състоянието му преди checkout. **Затваря се** с проверка на worktree състоянието и отделна дума преди командата.
12. **План 389–390, 584–586 | RDY-001, consumer proof | Проверка 4.** Последователността пропуска `/plugin update pnp@promptandpray` между marketplace update и reload, въпреки описания install/update път в `README.md:27–29` и `docs/README.md:19–21`. Така consumer proof може да работи със старата инсталирана версия. **Затваря се** с добавяне на командата в двете места.
13. **План 579–590 | RDY-001, архивиране | Проверки 4–5.** Архивирането е поставено след docs commit, макар `WORKFLOW.md:620–630` да го изисква при completion record-а; така остава Git move без предвиден commit. Задължителният fail-capable grep с положителен контрол е назован, но не е даден като команда. **Затваря се** с преместване и проверка преди docs commit и с буквални команди за проверката и контрола.

Non-blocking: `main` clean at `ac83496`; migration fields, both recorded managed regions, version triple and the named self-check pins compatible; the label "a thirteenth skill ships" would be imprecise once the control adds `ghost` to 13 skills.

### Disposition after the re-scope (operator word 2026-09-29: "приемам предложението с особено мнение ... кодекс пас студен")

The plan was RE-SCOPED between pass 1 and pass 2: the skill, the artifact contract, `--revise`, Door 4, the CLAUDE.md region change and the seed were dropped (WORKFLOW § "a correction round that RE-ARCHITECTED ... reverts to cold" - pass 2 is cold on the operator's word). Per blocker:

| # | disposition | where in r1 |
|---|---|---|
| 1 | OBSOLETE - Step 4/artifact contract dropped; the surviving behavior-ledger duty states the future-file rule explicitly (`NEW <path>` row, not UNREAD) | § Спецификация (Step 2a text) |
| 2 | OBSOLETE - pre-implementation simulation dropped as an instrument; acceptance stays literal, run by the Writer on the real change | Acceptance |
| 3 | CLOSED - the false Gate 1/4 sentence is gone; the lean plan makes no such claim; agents are dispatched read-only (Explore) and the fact-check task verifies hook/engine behavior in code | § Спецификация |
| 4 | OBSOLETE - `--revise` dropped; the one sentence "the revision closes and adds nothing" lands in WORKFLOW | worklist 4 |
| 5 | OBSOLETE - scratch contract dropped | - |
| 6 | CLOSED - Writer runs `git add -N` on every NEW path before VERIFY/acceptance/review; acceptance counts with `ls`/`test -f`; the review brief names the new files | worklist, Acceptance, § Процес |
| 7 | CLOSED - `grep -c "^| [0-9]" docs/READINESS_CLASSES.md` -> 14 | Acceptance |
| 8 | CLOSED - doc text: "13 classes were paid pass-1 blockers; class 14 was measured between passes" | § READINESS_CLASSES |
| 9 | OBSOLETE - Door 4 dropped | - |
| 10 | CLOSED - tag target = the hash CI proved green; a date-fix commit is pushed and CI-proven before the tag, like any commit | § Процес |
| 11 | CLOSED - `git -C D:\pnp-live status --porcelain` empty + operator word before the refresh | § Процес |
| 12 | CLOSED BY FACT - the three-command form is the measured host behavior (PLAN_HARD:1360-1369, operator screen 2026-09-21: `Updated 1 marketplace (1 plugin bumped)`); README's four-step form is HARD-011 item 1; the plan cites both | § Процес |
| 13 | CLOSED - archive `git mv` + rule-class grep (with positive control, literal) inside the docs commit that carries the completion record | § Процес |

Origin duty for pass 2: any NEW blocker declares whether it was born of the re-scope or was visible in pass 1.

## pass 2 (2026-09-29, codex gpt-6-sol/xhigh, COLD on the operator's word, over r1; 124,715 tokens) - NEEDS-FIX, 4 blockers; auditor's split: author-preventable=4 design=0; class (a)=3 (b)=1

Verbatim as returned:

1. **План 336 | RDY-001, acceptance за 14-те класа.** Неекранираното `|` в двата `grep -E` шаблона съвпада с празен низ: проверките броят *всички* редове, а не номерираните. Върху днешния план същият шаблон връща 410, колкото са всички редове; правилно оформеният нов документ също няма да даде очакваните 14 и 1. **Затваря се** с екраниран пайп или `[|]` и повторно изпълнение върху таблицата. **Проверка 5. ORIGIN: re-scope** — новият ERE шаблон е въведен в r1.
2. **План 16, 386–397 | RDY-001, начално записване и архивиране на PLAN.** След одобрението планът се копира като нов `dev/backlogs/active/PLAN_RDY.md`, но процесът не го добавя в Git; кодовият commit изрично изключва `dev/`. Така предвиденият `git mv` при docs commit няма проследен източник. **Затваря се** с изрична Git стъпка за активния план преди `git mv`, със съответния commit клик и HEAD котва, ако се commit-ва при одобрението. **Проверки 4 и 6. ORIGIN: visible in r0 and missed.**
3. **План 341 | RDY-001, проверка за untracked файлове.** `git ls-files --others --exclude-standard -- docs migrations | grep -c .` вече дава очакваното `0` на чистото днешно дърво, а не е означена като regression guard. Сама по себе си не доказва, че трите нови файла са обявени. **Затваря се** с изричното ѝ означаване като regression guard; отделната проверка за трите файла остава доказателството за промяната. **Проверка 5. ORIGIN: re-scope.**
4. **План 369, 372 | RDY-001, § Верига.** Двете звена сочат `migrations/0017/ops.json`, докато спецификацията и worklist-ът създават `migrations/0017_behavior-ledger/ops.json`. Посоченият път няма да съществува и след изпълнението. **Затваря се** с точния бъдещ път и означение `NEW` в двете вериги. **Проверка 1. ORIGIN: visible in r0 and missed** — съкратеният несъществуващ път е и във веригата на r0.

Non-blocking: migration fields/order, the ORCHESTRATOR record, version triple and the named self-check pins compatible; the three-command consumer procedure accepted as fact per PLAN_HARD; blocker 12 not repeated.

### Disposition (r2, same session)
| # | disposition |
|---|---|
| 1 | CLOSED - `[|]` in both patterns; a positive control on a synthetic table added to the acceptance (2 numbered rows -> 2; old pattern -> 4) |
| 2 | CLOSED - § Процес 2 opens with the plan-landing docs commit (copy, git add, click); the brief's HEAD anchor is taken after it; gates list +1 click |
| 3 | CLOSED - labelled regression guard; the `git diff --name-only | grep -c` line is the proof |
| 4 | CLOSED - full path + NEW in § Верига rows 2 and 5 |

Instrument note: blocker 1 could not be seen by the r1 fact-check (the target file does not exist; the pattern was never run on a sample). The positive-control habit - run a NEW file's acceptance regex on a synthetic sample before the pass - is now in the acceptance itself.

## pass 3 (2026-09-29, codex gpt-6-sol/xhigh, WARM resume of pass 2 on the operator's word "пас 2 топъл", over r2) - PASS

#1-#4 CLOSED (the auditor re-ran the pattern control itself: 2 and 1 on the sample, 0 without numbered rows, 4 with the old pattern). No new blockers. OWN/DESIGN 0/0; class (a)/(b) 0/0.
Cycle total: pass 1 cold 13 (11 own / 2 design; over r0) -> re-scope -> pass 2 cold 4 (4 own; a=3 b=1) -> pass 3 warm PASS.
