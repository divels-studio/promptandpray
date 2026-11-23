# Session brief - AUDITRULE: един релийс с пет части (fresh session)

Написан от арбитражната сесия на 2026-11-23 по думата на оператора: „брифа го остави на диска за да мога да стартирам нова
сесия със мишън скила". Сесията се отваря с `/pnp:mission`; този файл е ускорител, истината е в git, ledger-а и паметта.

## 1. Заглавие
PromptAndPray - AUDITRULE, планиране на един релийс (следващата версия след 0.3.24) - fresh session.

## 2. Контекст
- Изпълняващ авторитет: `dev/changes/opus-experiment-2026-11-23.md` § 9 (РЕШЕНИЕТО на оператора - петте части, какво не влиза,
  как се проверява текстът). Основа: `dev/changes/audit-measures-2026-11-23.md` (казусът, M1-M4) и
  `dev/changes/test-cost-research-2026-11-22.md` (трите броя). `dev/backlogs/ROADMAP.md` § AUDITRULE редове (9)-(11);
  `dev/backlogs/LEDGER.md` редовете `ruling` от 2026-11-21 .. 2026-11-23.
- Branch `main`; HEAD = commit-ът, който добавя този файл (родител `3c23f73`); дървото чисто. Локалните commit-и след
  `313f912` НЕ са push-нати (`ccd89d7`, `7be182f`, `b43984f`, `3c23f73` и записът след него) - push само по дума.
- Активен план: НЯМА. 0.3.20 - 0.3.24 са издадени и затворени - нищо не се препланира и нищо не се отваря наново.
- Решеното не се пита отново: петте части са приети („приемам записвай всичко"); цената на част 1 е приета („ако се хване при
  изпълнение съм ок, за това е и одитора след това").

## 3. Domain gate
Финалното решение на оператора за съдържанието е § 9 на файла по-горе. ТЕКСТОВЕТЕ на правилата още не са писани: всеки се
показва на оператора на български и влиза в дървото на английски само след одобрение (`ORCHESTRATOR.md` guard (g)). Без
инженерни „подобрения" на петте части; нов въпрос по същество - STOP и питай. Не се пипат: нивото на усилие и броят пасове
на одита (неговият лост за цената); проверките за пари, достъп, RLS и tenancy.

## 4. Задача
Един durable план през `/pnp:plan`, съкращение по избор на COO (предложение: AUDR), вход - roadmap запис AUDITRULE. Тикети
още няма: планът ги реже. Петте части (пълният текст е в § 9, тук само имената):
1. блокерът назовава загуба - и при двата одита; доказателство, което не може да се провали за собственото свойство на
   тикета, остава блокер;
2. планът не преразказва процедурата - започва от `templates/briefs/planner.md`; уреждa се заедно с правилото от 0.3.11 за
   closing greps;
3. задълженията за формата на плана са според промяната;
4. измерване на планирането и изпълнението - два реда с фиксирана форма (план при landing, тикет при close), без нов
   инструмент, без въпроси към оператора; оценка след четирите фази на Silerax;
5. PRODUCT STAGE - място в payload-а до реда `TEST POLICY:`, в брифа на планиращия и в брифовете и на ДВАТА одита.
Срок по същество: релийсът излиза ПРЕДИ операторът да планира следващата фаза в Silerax (числата на четирите фази са
сравними само на новата версия).
Маршрут: проза в payload-а е R1 в главната сесия, код е R2 през Колегата (`dev/PROJECT_OVERRIDES.md` § Hard rules); промяна
на управляван артефакт = миграция + bump + CHANGELOG с ред `Retires local rules:` (ще назове двата местни реда на Silerax за
Product stage и местните му текстове, които payload-ът започва да носи).
Начални повърхности - ПРЕДПОЛОЖЕНИЕ, заменя се от discovery scan: `templates/doctrine/review.md.tmpl`,
`templates/doctrine/plan.md.tmpl`, `templates/briefs/readiness-codex.md`, `templates/briefs/planner.md`,
`docs/READINESS_CLASSES.md` (класове 8, 11, 15), skeleton-ите на review / QA брифовете, record skeleton-ът (редът от 0.3.22).
Проверка на текста на част 1 в двете посоки преди издаване - списъците са в § 9 (кои случаи трябва да излязат бележки и кои
да останат блокери).

## 5. Machine-local facts - не ги преоткривай
- Сесиите тук се стартират с `cd D:\promptandpray && claude --plugin-dir D:\pnp-live`; плъгинът се зарежда от `D:\pnp-live`.
  След ВСЕКИ commit на `main`:
  `Start-Process git -ArgumentList 'checkout','--detach','main' -WorkingDirectory 'D:\pnp-live' -NoNewWindow -Wait`
- Git се пуска гол от корена - без `cd X && git`, без `-C`. Без `; echo` суфикси. Проследени файлове се променят с Edit /
  Write, никога с heredoc или redirect (тази сесия го наруши веднъж - ред в ledger-а).
- Три `bash` на PATH: преди да наречеш червен резултат дефект - `where.exe bash`. VERIFY: `dev/VERIFY_RUNBOOK.md` и
  overrides § Test policy (порциите, CI формата на self-check-а, „никога redirect на suite изход в сканираното дърво").
- Одитната таблица на този проект е на `gpt-6.2-sol` за всички Codex роли от `b43984f` (plan и code на xhigh).
- Codex пас: `pwsh -NoProfile -File "D:\pnp-live\scripts\native\ps\codex-review.ps1" -ProjectRoot "D:\promptandpray" -Class
  <plan|code> -BriefFile ".aiwf\<key>-review-brief.txt"`, във фон; stdout е само крайното съобщение, stderr носи реда
  `tokens used`. ПРЕДИ пускане на платен пас казваш на оператора двигателя, модела и усилието (корекция от 2026-11-23).
- Self-install apply след bump: `/pnp:update --apply`; в auto mode записът в `aiwf.config.json` може да бъде отказан от
  хоста - пуска се в режим, който пита.
- Consumer пътища: Silerax = `D:\Stratex` (НЕ `D:\Silera`); планът на Fable PRCCA е изнесен в `D:\RCCA_TMP`; планът на
  Opus PRCCAA е в Silerax (landed). В чуждо дърво не се пише без думата на оператора за точно това действие.
- Scratch: `.aiwf/arbiter-brief.txt` (изконсумиран) и `.aiwf/PLANCMP-001-review-brief.txt` (брифът на сравнителния пас) -
  съдържанието им стои в двата файла под `dev/changes/`; уреждат се по ticket-end правилото.

## 6. Gates
- Системни / деструктивни команди: съобщават се непосредствено преди изпълнение и чакат диалога.
- Commit: одобрява се само от native диалога при опита; staging по изрични пътища; без Claude trailers в git.
- Push / merge / tag: само с изрична дума в чата И собствения им диалог.
- Docs checkpoint: записът в ledger-а ВЕДНАГА след commit-а, в същата сесия, без напомняне.
- Одобреният план влиза в репото веднага (guard (e)); нов тикет чака собствената си дума (guard (b)).

## 7. Loop
- Колегата (Writer): `claude-opus-5-5[1m]`, high - пинът е във frontmatter-а; НИКОГА не подавай `model` при dispatch.
- Writer brief = указател към тикета: `Ticket: <REF>` на собствен ред + „прочети `tickets/<REF>.md` и файловете от Code
  Map-а му" (`templates/briefs/writer-dispatch.md`); нищо не се преписва.
- Review: `/pnp:review`, брифът в `.aiwf/<key>-review-brief.txt` през `-BriefFile`, wrapper-ът във фон; първият ред на брифа е
  `COVERED BY: operator word "...", <date>`.
- Readiness: `review.plan.passes` = 2 - първият пас язди думата за плана, вторият само по собствена дума на оператора.
  Един код пас на тикет; correction rounds cap 2; всеки следващ пас - дума ПРЕДИ dispatch, една дума на пас.
- Отворен въпрос към оператора, пита се в тази сесия, не се решава вместо него: един Codex пас за мнение върху текста на
  новия договор преди издаване (както на 2026-11-21) - неговото решение за цената.
- QA: не - payload-ът няма runtime/UI поведение за наблюдение; доказателството са self-check, suite-овете и validate-payload.

## 8. Subagent policy (mandatory)
> Subagent policy (mandatory): all routine checks, grep/inventory sweeps, existence/counts,
> mechanical scans AND open-ended research dives go to CHEAP subagents with an EXPLICIT model -
> `haiku` for purely mechanical work, `sonnet` for evidence-with-judgment (the default). Never
> silently inherit the session model; the synthesis stays with the COO. The loop roles
> (Writer/Reviewer/QA) run ONLY through the Agent tool / the `/pnp:*` skills, never inline.
> Maximum quality at minimum cost / context / tokens.

## 9. Memory pointers
`promptandpray-mission-status` (точката за продължаване), `plain-language-in-the-operator-channel`,
`numbers-stay-out-of-the-channel`, `every-pass-after-the-first-needs-a-word`, `yes-covers-only-the-asked-action`,
`no-claude-trailers-in-git`, `codex-pass-economy`, `machine-constraints-verify-runs`, `silerax-lives-in-stratex-folder`,
`consumer-sweep-covers-all-retires-and-memory`, `auditor-never-below-author`.
