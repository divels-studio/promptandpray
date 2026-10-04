# PromptAndPray Readiness — `/pnp:plan` (PLAN_RDY) · release 0.3.0

> Роден 2026-09-29 с операторска дума („давай, отваряй плановата сесия“) след разпит на двата
> консуматора — сесиите „Silerax Plan LIV“ (план PLAN_LIV, Stratex) и „Furnissimo Fix“ (план
> PLAN_TUNE; „Fix“ е името на сесията, FIX- е пенсиониран префикс там) — по операторско искане.
> Докладите им са съобщения от 2026-09-29, не файлове на диска: всяка бройка по-долу, която идва от
> тях, е така и източена. Чернова под planning lock:
> нищо в repo-то до одобрение (guard (e) — копие в `dev/backlogs/active/PLAN_RDY.md` в мига на
> одобрението). Един префикс: `RDY`, тикети `RDY-NNN`. Readiness: `review.plan` реда (codex
> `gpt-6-sol`/xhigh, 2 паса; пас 1 на стоящата дума за плановата сесия, всеки следващ — отделна дума).
> Този план е ПЪРВИЯТ, който минава новия процес — на ръка, стъпка по стъпка, с артефактите в
> `.aiwf/plan/RDY/` — за да бъде измерен, преди да се шипне.

## Context (discovery 2026-09-29: 2× Explore/sonnet + двата консуматорски доклада; котви HEAD `ac83496`)

**Проблемът, в числа (източник: докладите на двете сесии от 2026-09-29, и техните ledger-и).**

| План | Пас 1 | Пас 2 | Пас 3 | Авторски | Design находки | Инструменти в цикъла (LIV: fact-check 1 преди пас 1, 2 и 3 между пасовете) |
|---|---|---|---|---|---|---|
| Stratex PLAN_LIV | 11 | 6 (3 незатворени + 3 нови от ревизията) | чака дума | 17/17 | 0 | инвентар (3 sonnet), собствен проход в отделен ход, fact-check ×3 с gaps (12/10/19), chain tables, process trace |
| Furnissimo PLAN_TUNE | 10 | — | — | 10/10 (3 повторени класа от 017/018) | 0 | инвентар (5+1 sonnet), собствен проход (хвана 12), fact-check с gaps (2+5), chain table 44 реда, process trace |
| Stratex PLAN_TAL (27.09) | 10 | 6 | 6 | „всички авторски“ | — | собственият проход не бил отделен ход |
| Furnissimo 017_CUTP (25.09) | 13 | 4+4 нови | — | ~11/13 | ~2 | fact-check (2 дефекта) |
| Furnissimo 018_SCHEMES_RUNS (27.09) | 8 | 4 | PASS (+1) | 8/8 | 0 | fact-check ×2 (8 дефекта) |

**Какво опровергава решението от 2026-09-27** (`dev/backlogs/CANDIDATES.md:102-107`: „нула класове
без правило; поправката е изпълнението на стъпките“). На 29.09 двата консуматора СА изпълнили
стъпките — отделен ход, инвентар, fact-check с шестте проверки, chain table, process trace — и пас 1
пак връща 10–11 авторски блокера. Класът, който остава, е един и същ в двата проекта: **поведение,
не твърдение.** Всеки инструмент днес проверява СЪЩЕСТВУВАНЕ (указателят резолвира, командата
съществува, бройката излиза); никой не проверява какво звеното ПРАВИ с входа на плана — какво
валидира, отхвърля, презаписва, над какво се затваря closure-ът, какво става при N реда, при два
конкурентни повика, какво прави библиотеката в `node_modules`. Fact-check гейтът по конструкция не
го вижда (проверява направените твърдения, не пропуснатото поведение), прави sampling („deeply on
001/002/004, spot-checked on 003/005/006“ — Furnissimo) и завършва с „всичко останало е наред“, което
спира търсенето на COO (TUNE B6, B10). Собственият проход е от контекста, който е писал плана:
изброява случая, който авторът е проектирал, и спира (TUNE B1, B2, B5 — номера от доклада на
сесията, не от `PLAN_TUNE.md`; LIV #1, #3, #5 — `PLAN_LIV.draft.md:790-792`).

**Корпус от блокер-класове (54 итемизирани блокера, 5 плана, 2 проекта; честоти от скана):**
state-enumeration 9 · command-not-literal/cannot-fail 7 · test-cannot-prove (mock) 6 ·
unread-consumer 5 · data-shape-admitted-by-read-path 5 · process-order/actor 5 ·
concurrency/lock-order 5 · acceptance-misses-risk-item 5 · unread-library-behavior 4 ·
permission/render-gate consistency 4 · open-decision 3 · closure/memo-lifecycle 1 ·
identifier-does-not-exist 1 · other 3. Отделно от пас-1 корпуса, **родени от ревизия между пасове**
(клас 14): LIV пас 2 — 3 нови, CUTP пас 2 — 4 нови, HARD-020 пас 2 — 2 от 4 (CANDIDATES `:158-159`)
= 9 измерени. Всички освен два (closure, identifier — по един път, Stratex)
се повтарят в ДВАТА проекта. Класовете са генерични — това е основанието списъкът да живее в
payload-а, а не в паметите.

**Компенсациите на консуматорите са текст.** Silerax: памет `feedback_own_pass_separate_turn`
(+ „отворен ≠ прочетен като поведение“, 29.09); Furnissimo: `own-pass-separate-turn`,
`pre-dispatch-scan-blocker-ledger` (НЕ изпълнена на TUNE — „нищо не ме подсеща в момента“),
`plan-proofs-are-literal-commands` (нарушена в B10 въпреки паметта), `chain-trace-evidence-pack`;
двата: PROJECT_OVERRIDES § Loop shape chain-trace ред (идентичен, 24.09). Нито една не е механична
стъпка с изход, който може да падне. Артефактите, които вече ползват на ръка и които скилът
стандартизира: Furnissimo `.aiwf/readiness-chains.md` (`| # | behavior | chain | endpoint |`, 44
реда), `.aiwf/readiness-process.md` (`| step | gate / action | tree & branch it assumes | who |
finding |`, 14 стъпки); Stratex `PLAN_LIV.draft.md` § Процес т.6 — таблица за симулация на
acceptance блоковете (`| Блок | Валиден вход | Счупен / позитивен контрол | Резултат |`).

**Payload реалност (скан 2026-09-29, котви на HEAD `ac83496`):**
- Скиловете се auto-discover-ват: `.claude-plugin/plugin.json` няма `skills` ключ (17 реда,
  `version` на `:3`). 12 директории `skills/*/SKILL.md`; frontmatter = точно `name`, `description`,
  `allowed-tools` в този ред; Step 0 boilerplate байт-идентичен с `skills/mission/SKILL.md:13-27` в
  6/12 (arbiter, loop, mission, qa, review, work); setup/update се различават по документираните
  изключения, brief/qal/roles/selfcheck — с дописани изречения. Self-check-ът проверява Step 0 по
  четири низа, не по байтове (`aiwf-selfcheck.js:5829-5830`); планът иска байтова идентичност с
  mission — по-строго от проверката, по избор.
- Индексът: `skills/README.md:6` `Shipped: loop, review, qa, qal, brief, mission, work, roles,
  arbiter, setup, update, selfcheck.` — self-check-ът го чете СТРУКТУРНО срещу директорията
  (`scripts/selfcheck/aiwf-selfcheck.js:5587-5600`, литералът `DOCTRINE_SHIPPED_COMMANDS` на
  `:5590-5591` е базата, която вторият негативен контрол `:5775-5778` пренаписва; етикетът на
  първия контрол `:5769` казва „a twelfth skill“). `sectionPayloadIntegrity()` `:5813-5849` чете
  директориите и проверява per скил: `name:` = dirname, `description:` налично, Step 0 договорът
  (`:5829-5830`), version interlock освен `INTERLOCK_EXCEPTIONS = ['update','selfcheck']`
  (`:5836-5848`) — авто-адаптира се към нова директория.
- Броят на командите в проза: `README.md:31` „**Twelve commands**“ + таблицата `README.md:191-206`
  (12 реда); `CHANGELOG.md:178` „Both counts of twelve“ (история — не се пипа); `docs/README.md:14`
  „the three doors“; `docs/OPERATOR_PROTOCOL.md:1-28` (три врати).
- Fact-check гейтът: `skills/review/SKILL.md:197-262`; задачата към агента `:214-221` („Verify every
  factual claim… Return ONLY the list of claims that are FALSE or UNVERIFIABLE“); трите readiness
  реда `:229-246`; диспач `subagent_type: "Explore"`, `model: sonnet` (`:209-211`). Няма изход,
  който да ДОКАЖЕ, че агентът е отворил всяко твърдение — „every claim“ е инструкция без ledger.
- Readiness доктрината: `docs/WORKFLOW.md` § Planning lock `:317-349`, § Plan readiness review
  `:350-462` (собствен проход `:384-401`, process dry run `:403-417`, цикълът `:419-432`, шестте
  проверки `:450-458`), § COO owns broad scans `:64-125`, § Fail aggregation `:842-857`; `docs/LOOP.md:16,71`.
- `skills/mission/SKILL.md` и `skills/work/SKILL.md` не споменават планиране, lock или readiness
  (`grep -c -E "planning lock|readiness|/plan\b"` → 0 в двата; думата plan се среща само като PLAN
  файлът и `review.plan`). `skills/work/SKILL.md:45-51` е мястото,
  където R2/R3 „author or extend a PLAN“.
- `templates/ORCHESTRATOR.md.tmpl:163-175` § Chain-trace duty: `{ behavior | ordered file:line links
  | endpoint class }` + „the form check verifies coverage and resolution, never attention“ — точно
  лимитът, който данните потвърждават. Managed artifact → промяната е миграция с
  `rerender-managed-region` (образец `migrations/0012_orchestrator-role/ops.json:13-18`:
  `file: ".claude/aiwf-native/ORCHESTRATOR.md", region: null, template:
  "templates/ORCHESTRATOR.md.tmpl"`; полетата на op-а: `scripts/update/validate-payload.mjs:121-138`).
  Self-check-ът пази шаблона model-agnostic (`aiwf-selfcheck.js:5624-5630`, контроли `:5718-5723`) —
  промяната не пипа модели.
- `.aiwf/` е gitignored (`.gitignore:1`); днес носи `review-brief.txt` (`skills/review/SKILL.md:329-336`)
  и `route-state.json` (Gate 3, `scripts/engine/pretooluse-mutation-guard.js:71`). Нов под-каталог
  `.aiwf/plan/<ABBR>/` не среща нито hook, нито assertion.
- Издание: `migrations/index.json` последен запис `0016_readiness-gaps-instruction` → `0.2.12`;
  note-only миграцията е `ops.json` + `NOTES.md` (`migrations/0016_readiness-gaps-instruction/`);
  `validate-payload.mjs` не чете `skills/` (0 hits), проверява само `migrations/` (`:14-30`,
  `:274-329`); `examples/` НЕ се пипа при издание (HARD-019, `CHANGELOG.md:37-42`). CHANGELOG
  образец: `CHANGELOG.md:7-28`; README версия `README.md:21`.
- Memory seeds: 17 файла в `templates/memory-seeds/`, нула споменават readiness; формат:
  `# <title> [R]` + „Reinforces payload `docs/WORKFLOW.md` - <section>“ + 2 абзаца
  (`templates/memory-seeds/approved-plan-lands-in-repo.md:1-10`); печатат се от
  `readMemorySeeds` (`scripts/setup/generate.mjs:1581-1585`, readdir + `.md` филтър, без формат или
  бройка), форматират се в `formatReport` (`:1669-1675`, банер „PRINTED, never written“) и се
  печатат от `scripts/setup/interview.mjs:316` — не се рендират във файл.
- Кандидатът `dev/backlogs/CANDIDATES.md:155-161` („поправката след пас затваря намерените блокери и
  не добавя нищо ново“, за 0.3.0) влиза тук — това е revise режимът на скила.
- Странична находка (извън обхват, кандидат без ref): `skills/loop/SKILL.md:4` `allowed-tools: Read,
  Grep, Glob` без Bash, а `:18` инструктира `git rev-parse` — единствен от 12-те.

## Mission goal

Readiness пас 1 на Codex спира да плаща за авторски пропуски: планът пристига при одитора с
ПРОЧЕТЕНО поведение на всяко звено, с fact-check ledger per твърдение, с преиграни блокер-класове и
със симулирани acceptance блокове — произведени като артефакти от стъпки на скил, които могат да
паднат, не от памет. **Измерител:** авторският дял на пас 1 при следващите два readiness цикъла на
всеки консуматор (записва се в completion record-а, когда данните дойдат — не е acceptance на тикета,
защото не е в това repo).

**Обхват:** нов скил `/pnp:plan` (fresh + `revise` режим), нов payload документ
`docs/READINESS_CLASSES.md`, fact-check гейтът в `skills/review/SKILL.md` Step 2b → per-claim ledger,
§ Chain-trace duty на ORCHESTRATOR шаблона → behavior ledger, указатели в WORKFLOW / mission / work /
OPERATOR_PROTOCOL / README, индекс + self-check литерал, seed, миграция `0017` + bump `0.3.0` +
CHANGELOG. Издание 0.3.0 се вози на единствения тикет.
**Извън обхват:** нов hook/гейт (скилът е проза + артефакти; никакво enforcement — един run-time
инструмент повече е out of scope по Identity „не е runtime“); промяна на одитната таблица или на
броя пасове; HARD-011 (README за студен посетител — остава в PLAN_HARD); GPT анализът т.9 на
HARD-011 (`setup --quick`, uninstall, генериране на доктрината); `skills/loop` allowed-tools
дефектът (кандидат); Codex-хостнат fact-check (остава Claude sonnet — `/pnp:roles` „always-on gate“).

## Решения (COO; всяко с едноредово „защо“)

1. **Един тикет, RDY-001 [R2 code-class], + release 0.3.0.** Скилът, индекс редът и self-check
   литералът трябва да са в ЕДИН commit (структурната проверка пада, ако директорията и редът се
   разминат); промяната в review Step 2b е това, което скилът вика в Step 8 — един диф, един кодов
   пас по таблицата. Прецедент: HARD-016, HARD-020/021.
2. **Абревиатура `RDY`.** `PLAN_RDY.md`, `RDY-001`; `PLAN` като префикс би дал `PLAN_PLAN.md`.
3. **0.3.0 е RDY-001; HARD-011 отива в 0.3.1** — операторска дума 2026-09-29 („RDY-001 да е 0.3.0,
   а HARD-011 (README) да отиде в 0.3.1 -> ок“), обръща записаното в PLAN_HARD `:57`, `:2907`
   („HARD-011 в цикъла на 0.3.0“); бележката там ляга с docs commit-а на RDY-001. Мотив: README-то е
   бавна, голяма docs работа; скилът не бива да я чака, а консуматорите го искат сега.
4. **Behavior ledger-ът се пълни от ОТДЕЛЕН контекст** — един `sonnet` Explore агент per тикет, който
   отваря всяко звено и връща по един ред per звено; COO записва редовете и ги ЧЕТЕ и действа в
   собствения проход (субагентите не пишат файлове — Gate 1; всички артефакти ги пише COO).
   Защо: и двата консуматора показаха, че собственият проход от авторския контекст изброява само
   проектирания случай; чужди очи върху КОДА (не върху твърденията) е липсващият инструмент. Top tier
   не се делегира за сканове (WORKFLOW § COO owns broad scans); при противоречие COO чете сам или
   ре-диспачва един tier нагоре — правилото, което вече стои.
5. **Fact-check per claim, без sampling, разделен по тикети.** Един агент per тикет секция + един за
   споделените секции; изходът е ledger с ред за ВСЯКО твърдение (`VERIFIED file:line | FALSE
   <стойност> | UNVERIFIABLE <защо>`) и ред с бройки; „spot-checked“/„everything else resolved“ е
   нарушение на договора → ре-диспач на секцията. Библиотечни твърдения се проверяват в
   `node_modules`. Защо: TUNE B3, B6, B10 (по доклада на сесията от 29.09: гейтът „deeply on
   001/002/004, spot-checked on 003/005/006“ и „everything else resolved exactly“) — гейтът е
   sample-вал и е обявил покритие.
6. **Блокер-класовете стават payload документ `docs/READINESS_CLASSES.md`** (14 класа, генерични, с
   въпроса per клас). Replay стъпката ги прилага per тикет с резултат per клас; архивните планове на
   проекта се преиграват best-effort (форматът им не е гарантиран). Защо: класовете се повтарят в
   двата проекта (корпусът горе); паметите не се изпълняват („нищо не ме подсеща“ — Furnissimo).
7. **Две принудителни граници на ход** в скила: след черновата („чернова готова — собственият проход
   е следващият ход“) и след артефактите („артефактите са готови — диспач на пас 1 следва“). Защо:
   и двата консуматора измериха, че сгънатият в чертожния ход собствен проход не хваща нищо; скилът
   не може да смени контекста, но може да наложи спиране и доклад.
8. **`--revise` режим** (`/pnp:plan --revise`): блокерите на пас N се записват дословно; всяка промяна в
   плана се мапва към блокер или декларира произход; НИЩО ново не се добавя (кандидатът от
   CANDIDATES `:155`); стъпки 4, 7 и 8 се пускат наново над делтата преди следващия пас. Защо: пас 2
   и в двата проекта е роден от ревизията (LIV 3 нови, CUTP 4 нови).
9. **Артефактите се дължат винаги, когато скилът върви** — и при `review.plan.passes: 0`. Обръща
   изречението „a plan that buys no auditor pass owes no chain table“ (`ORCHESTRATOR.md.tmpl:174-175`):
   при 0 паса стъпки 2–8 на скила (инвентар, ledger, собствен проход, replay, симулация, fact-check)
   СА целият договор (WORKFLOW `:436-437` днес казва „own reading plus the fact-check gate“ — т.6 от
   worklist-а разширява изречението до артефактите на скила), не по-малко.
10. **Механиката живее в скила; WORKFLOW получава указатели, не още абзаци.** § Plan readiness review
    задържа контракта (какво се дължи), скилът носи КАК (стъпки, артефакти, task текстове). Защо: GPT
    анализът и 0.2.9 — доктрината се повтаря на много места и дрейфът се плаща.
11. **Никакъв нов hook.** Скилът е конвенция + артефакти; Gate 3 не се пипа (планиране няма route
    state — нищо не е диспачнато). Защо: Identity „не е runtime“; enforcement за планиране би искал
    hook, който чете `.aiwf/plan/` — out of scope, кандидат ако данните го поискат.
12. **`docs/OPERATOR_PROTOCOL.md` получава четвърта врата** и се преименува „the four doors“;
    `docs/README.md:14` следва. Защо: планирането е отделен вход за оператора, документът е
    „entrance“ за нов посетител.
13. **Seed:** един нов `templates/memory-seeds/durable-plan-goes-through-pnp-plan.md` [R]. Защо:
    tripwire 4 — seeds са дом на изброяването при всяка доктринна промяна; консуматорите носят
    собствени памети по темата, които seed-ът замества с указател.
14. **Rerender op-овете в `0017` без `ifRecorded`/`createIfAbsent`.** ORCHESTRATOR.md и
    `CLAUDE.md#aiwf-core` са записани на всяка инсталация, минала `0012`; `ifRecorded` би бил мъртъв
    клон с обърната семантика („съществува на някои инсталации“ — не е така), `createIfAbsent` би
    отказал при чужд файл. Обикновеният път на `migrate.mjs:619-727` е правилният (chains.md ред 15).
15. **Четвъртата врата влиза и в managed региона на `CLAUDE.md`** (`templates/CLAUDE.md.tmpl:64-66`
    изброява входовете) — иначе регионът противоречи на OPERATOR_PROTOCOL; това прави `0017`
    миграция с два rerender op-а, по образеца на `0012` (chains.md ред 23).
16. **Self-update на repo-то е част от кодовия commit** (прецедент `51dd2ce`): `selfcheck` пази
    `installedPluginVersion == payload` (`aiwf-selfcheck.js:4906-4911`) и Step 0 на всеки скил тук
    спира при pending миграция — без `--apply` VERIFY не може да е зелен.
17. **VERIFY пропорционален** (PROJECT_OVERRIDES § Test policy): дифът пипа `skills/` (проза), `docs/`,
    `templates/` (шаблон + seed), `scripts/selfcheck/` (литерал + етикет), `migrations/`, `README.md`,
    `CHANGELOG.md`, `.claude-plugin/plugin.json` → документираните редове (PROJECT_OVERRIDES
    `:190-194`) дават `validate-payload` + provenance (docs/skills), `update-suite`,
    `validate-payload`, `example-cycle-windows`, `selfcheck` (update engine/migrations), `selfcheck`
    (templates); ДВЕ по COO преценка извън четирите реда: `setup-suite` — шаблоните се рендират от
    setup engine-а и суитът е този, който ги упражнява; `plugin-validate` — нова skill директория +
    манифестен bump е точно каквото хостовата валидация чете. Общо шест: редове „docs/skills“ + „update engine/migrations“
    + „templates“ → `validate-payload`, `selfcheck`, `update-suite`, `example-cycle-windows`,
    `setup-suite` (шаблон), `plugin-validate` + provenance grep. Не: `spikes`, `example-cycle-linux`.
    Порция 1, един паралелен batch (6 команди). WSL не е гейт (HARD-021).

## Спецификация на скила `/pnp:plan` (договорът, който Колегата изписва в `skills/plan/SKILL.md`)

Frontmatter: `name: plan`, `description: Author a durable R2/R3 plan under the planning lock and
bring it to readiness with artifacts that can fail - consumer inventory, behavior ledger per chain
link, blocker-class replay, acceptance simulation, process trace, per-claim fact-check - before
the first paid pass; '--revise' re-runs the delta after a pass.`, `allowed-tools: Read, Grep, Glob,
Bash, Agent` (образецът е `skills/review/SKILL.md:4` — скил, който диспачва субагенти, носи `Agent`;
без него стъпки 2/4/6/7 са неизпълними — fact-check B gap A1). Step 0 — байт-идентичният
boilerplate от `skills/mission/SKILL.md:13-27`. Езикът на файла: английски, без Cyrillic, без
абсолютни пътища (provenance). **Общо за всяко агентно диспачване (стъпки 2, 4, 6, 7, 8):** агентът
ВРЪЩА таблицата в отговора си, COO я ЗАПИСВА на фиксирания път — субагент не пише файл (Gate 1);
`subagent_type: "Explore"` „or whichever read-only scan agent this harness ships“ (hedge-ът на
`skills/review/SKILL.md:209`), `model: sonnet` винаги изричен.

**Вход:** целта от оператора (една или повече изречения), `<ABBR>` (2–8 главни букви, WORKFLOW
§ Durable development history), режим: без аргумент = fresh; `--revise` (флаг формата на
`/pnp:update --resolve <key>`, `skills/update/SKILL.md:93`). Артефактен каталог:
`<root>/{{config.paths.scratchDir}}/plan/<ABBR>/` (създава се; gitignored по конвенцията на
scratchDir). Черновата: `<dir>/PLAN_<ABBR>.draft.md`. Нищо извън `<dir>` не се пише до одобрение;
Writer не се диспачва; route-state не се пише (WORKFLOW § Planning lock — скилът го цитира, не го
преразказва). **Състояния на `<dir>`:** fresh при СЪЩЕСТВУВАЩ `<dir>` = възобновяване от първия
липсващ артефакт (скилът казва кой, в един ред) — не презаписва наличните; `--revise` без `<dir>`
или без `revisions.md`/без записан вердикт от пас = стоп с един ред („no pass to revise from“).

**Дуал (кога скилът НЕ се вика):** R1 и non-durable R2 (WORKFLOW § Plan readiness review `:352-354`)
— за тях брифът се пише директно. Скилът не е одитор, не връща вердикт, нито един от артефактите му
не се брои за пас; при `review.plan.passes: 0` стъпки 2–8 са целият договор.

### Стъпки (fresh)

1. **Lock statement.** Една реплика към оператора: планов lock активен; `<ABBR>`; `<dir>`. Без
   въпроси освен липсваща `<ABBR>`.
2. **Consumer inventory** (WORKFLOW `:373-382`). За всеки договор, който целта пипа (символ, колона,
   команда, permission, файл), ЕДИН `sonnet` Explore агент (WORKFLOW `:377` — „One `sonnet`
   agent“; втори само когда първият върне непълен списък и каже кои договори не е стигнал) връща
   таблицата, COO я записва като `<dir>/inventory.md`:
   `| contract | consumer file:line | what it does with it (one clause) | in worklist? |`. COO го
   чете; всеки consumer влиза в worklist-а или в „извън обхват“ с мотив. Затварящ grep per символ
   (tripwire 4) — записан в `inventory.md` с броя.
3. **Чернова.** COO пише `PLAN_<ABBR>.draft.md` по WORKFLOW § Ticket brief contract: Outcome, обхват /
   извън обхват, worklist с `file:line` на ВСЕКИ ред (нито един „Writer-ът намира“), acceptance с
   литерални команди, risk threshold, stop condition, VERIFY редове, assignee, branch; § Процес с
   каданс на гейтовете. Всяко число за състоянието на системата носи командата си (ORCHESTRATOR
   § Data discipline). **СТОП — граница на ход:** доклад „draft complete - own pass is the next
   turn“, и скилът чака операторска реплика (каквато и да е — не е гейт, а граница).
4. **Behavior ledger** — един `sonnet` Explore агент per тикет, с ЕДНА и същата задача (дословно в
   SKILL.md, за да е reusable):

   ```
   You read CODE, not the plan's claims. Input: the ticket's Outcome sentences and its worklist
   pointers below. For EVERY link a chain from the entry point to the endpoint passes through -
   every function, action, hook, query, component, test the pointers name or call - open it and
   return ONE row:
   <#> | <behavior sentence> | <link file:line> | DOES: what it validates / rejects / overwrites /
   reads / writes / renders with the plan's input | CLOSES OVER: what state it captures and when it
   is recreated (memo deps, refs, module scope) | STATES: what happens at empty / one / N rows,
   concurrent callers, error path, rerun | LIB: node_modules path:line for any library behavior
   the plan relies on | NOTE: anything the plan assumes that the code does not do
   A link you cannot open is one row with `UNREAD <reason>` in DOES. No verdict, no suggestions,
   no summary; every link is a row, and a chain that ends before a source or a render-or-DB-write
   surface is reported as `CHAIN ENDS EARLY at <file:line>`.
   ```

   COO записва изхода в `<dir>/chains.md` (един раздел per тикет) под литералния header
   `| # | behavior | link (file:line) | DOES | CLOSES OVER | STATES | LIB | NOTE |`. Празна клетка DOES или
   `UNREAD` = блокер преди паса: COO чете звеното сам или ре-диспачва; `NOTE` редовете са входът на
   стъпка 5.
5. **Собствен проход (отделен ход).** COO чете `chains.md` ред по ред и шестте readiness проверки
   (WORKFLOW `:450-458`) срещу черновата; всяка находка → промяна на конкретен ред от плана,
   записана в `<dir>/ownpass.md`: `| chains row or check | plan line | what changed |`. Нула
   находки е допустим резултат само с изречение защо всяка NOTE не е находка.
6. **Replay.** Един `sonnet` Explore агент прилага `docs/READINESS_CLASSES.md` (14 класа) per тикет и
   връща таблицата, COO я записва като `<dir>/replay.md`: `| class | ticket | PRESENT <plan line> / ABSENT / N.A. <why> |`; PRESENT =
   блокер преди паса. Втора половина, best-effort: последните три файла в
   `{{config.paths.plansDir}}/archive/` — агентът извлича редовете на readiness блокерите от техните
   процесни секции (ако форматът не даде нищо: `no archive blockers extracted`, записано) и ги тагва
   по клас; класовете с ≥2 срещания се проверяват в черновата с изричен ред per клас.
7. **Simulation + process trace.** Един `general-purpose` `sonnet` агент пуска ВСЕКИ acceptance и
   VERIFY блок на реалното дърво, както е написан (валиден вход → exit; счупен вход / позитивен
   контрол → exit) и връща таблицата, COO я записва като `<dir>/simulation.md`: `| block | command as written | valid input exit |
   broken input exit | verdict |`; блок без счупен вход, който пада, е A пропуск; всяка бройка в
   плана се възпроизвежда с команда и изхода ѝ се записва. Агентът НЕ пуска git verbs от ask
   класа, не пише файлове (Gate 1/4 го спират и без инструкция — инструкцията е за честност).
   COO авторства `<dir>/process.md`: `| step | gate / action | tree & branch it assumes | who |
   finding |` — думата за тикета, branch/tree, всеки пас и коя дума му трябва, QA ако има
   observable поведение, commit клик, docs commit, tag/push думи (WORKFLOW `:403-417`).
8. **Fact-check per claim** = `/pnp:review` Step 2b в новата му форма (виж § Промяната в Step 2b) над
   черновата — един агент per тикет секция + един за споделените секции; изходът в
   `<dir>/factcheck-r<N>.md` (N = ревизия, 0 за първата). COO затваря всяко FALSE, всяко
   UNVERIFIABLE и всеки A/B пропуск. **СТОП — граница на ход:** доклад с бройките от четирите
   артефакта (chains реда/UNREAD, ownpass находки, replay PRESENT, simulation червени, claims
   total/false/unverifiable, gaps A/B/C) и „ready for pass 1“. Диспачът е следващ ход.
9. **Readiness пас** — `/pnp:review`, `Class: plan`, брифът с COVERED BY реда (ORCHESTRATOR § „The
   coverage line before a paid dispatch“, `templates/ORCHESTRATOR.md.tmpl:66`) и `PREVIOUS PASS BLOCKERS: none - this is pass 1`; пас 1 на стоящата дума. Скилът
   не върти пасовете; вердиктът се докладва по същество, отделно от следващия диспач.

### Стъпки (`--revise` — след всеки NEEDS-FIX)

R1. Блокерите на пас N се записват ДОСЛОВНО в `<dir>/revisions.md` под `## pass N`.
R2. COO ревизира черновата: под всеки блокер — плановите редове, които го затварят. Всеки променен
    ред, който не затваря блокер, се декларира с произход в същия файл (`born of: <blocker> /
    <fact the pass could not see>`); **промяна, която добавя нова повърхност (нов тикет, нов
    worklist ред за нещо, което нито блокер, нито инвентар е поискал), не се прави** — записва се
    като кандидат.
R3. Наново над делтата: стъпка 4 за всяко пипнато звено (нови редове в `chains.md` с маркер
    `r<N>`), стъпка 7 за всеки пипнат блок (`simulation.md` r<N>), стъпка 8 над променените редове
    + консистентност на целия документ (`factcheck-r<N>.md`), стъпка 6 само за тикетите с промени.
    Нула червени → доклад с бройките и **СТОП**: следващият пас иска операторска дума (WORKFLOW
    § The operator does not arbitrate engineering decisions — един ред в скила, указател).
R4. Брифът на пас N+1 носи листата от `revisions.md § pass N` дословно (Fail aggregation).

### Одобрение

При PASS и операторско одобрение за изпълнение — guard (e): копие в
`{{config.paths.plansDir}}/active/PLAN_<ABBR>.md`, същата сесия; § Процес на плана получава
бройките per пас (не артефактите); `<dir>` остава като scratch. Скилът не комитва (Writer only).

## Промяната в `skills/review/SKILL.md` Step 2b (per-claim ledger)

Заменя задачата `:214-221` (fresh текст, дословно):

```
Verify EVERY factual claim in the prose of this document - path, line number, count, command,
identifier, engine/hook behavior, library behavior - against the tree as it is now. A claim about
a library is verified in node_modules (or the installed package), never from memory. Return a
LEDGER with one row per claim, in document order:
<doc line> | <claim, shortened> | VERIFIED <file:line> | FALSE <correct value> | UNVERIFIABLE <why>
No sampling, no spot-checking, no "everything else resolved": a claim you did not open is
UNVERIFIABLE with the reason "not opened". End with
CLAIMS: total=<n> verified=<n> false=<n> unverifiable=<n>. No verdict, no review, no suggestions.

DOCUMENT:
<the diff the review brief carries, or the plan section this agent is given>
```

Абзацът след него казва: (а) над план документът се РАЗДЕЛЯ — един агент per тикет секция плюс
един за споделените секции (Context, Решения, Процес, Verification), всеки с раздела „Решения“ като
контекст — за да няма sampling по конструкция; (б) изход с „spot-checked“, „deeply on X“, „the rest
is fine“ или без `CLAIMS:` ред е нарушение на договора → същият раздел се ре-диспачва; (в) трите
readiness реда `:229-246` остават, вторият се пренасочва към `chains.md` („verify the behavior
ledger: every link resolves at its file:line and its DOES cell matches the code; a chain that ends
before a source or a render-or-DB-write surface is a gap“), третият остава дословно; (г) едно
изречение-указател: артефактите идват от `/pnp:plan`, гейтът е негова стъпка 8 и стъпка R3.
`:260-262` (не е одитор, не се брои) остава.

## `docs/READINESS_CLASSES.md` (нов payload документ, английски)

Заглавие + два абзаца: откъде идват (измерени на readiness цикли, авторски блокери, без имена на
проекти и БЕЗ бройки — „measured on the readiness cycles of consumer projects: every class below
was a paid pass-1 blocker at least once, most of them in more than one project“; числата остават
в този план (Context), защото за читателя на payload-а са непроверими — fact-check B gap B1), как се ползват (`/pnp:plan`
Step 6, per тикет, резултат per клас; списъкът расте с издание, не с сесия). Таблица
`| # | class | the question to ask of every ticket | typical origin |` с 14 реда:
1 unread consumer · 2 library behavior asserted from memory · 3 closure / memo / lifecycle ·
4 concurrency / lock order · 5 state enumeration (empty / one / N / error / rerun / open-closed) ·
6 data shape the read path already admits · 7 identifier that does not exist · 8 command not
literal or cannot fail · 9 test that cannot prove (a mock stands in for the property) ·
10 permission / render-gate consistency across surfaces · 11 process order / actor · 12 open
decision left to the Writer · 13 acceptance misses a risk-threshold item · 14 fix after a pass
adds new surface. Затваря с честния лимит: списъкът е корпус, не теория — клас, който не е тук,
не е доказано отсъстващ.

## Тикет

### RDY-001 [R2 code-class] — `/pnp:plan`: readiness като артефакти, които могат да паднат; release 0.3.0

**Outcome:** (1) `/pnp:plan` съществува, индексиран е и минава self-check-а: 13 скила, 13 имена в
`Shipped:`, README казва „Thirteen commands“ и има ред за него; (2) fact-check гейтът връща ledger
per твърдение с `CLAIMS:` ред и отказва sampling, над диф и над план, разделен по секции; (3)
`docs/READINESS_CLASSES.md` носи 14-те класа; (4) ORCHESTRATOR § Chain-trace duty казва behavior
ledger от отделен контекст, дължим винаги когато скилът върви, и консуматорите го получават с
`rerender-managed-region`; (5) WORKFLOW, mission, work, OPERATOR_PROTOCOL, docs/README сочат към
скила с по едно-две изречения, включително „поправката след пас затваря и не добавя“; (6) 0.3.0
е издадена по церемонията (commit клик → push дума → CI зелен → tag дума → push tag), с миграция
`0017`, CHANGELOG блок, README версия; консуматорите взимат 0.3.0 през `/plugin marketplace update`
+ `/reload-plugins` + `/pnp:update` (доказва се в record-а, не в acceptance).

**Worklist (котва при диспач = `git rev-parse HEAD`, литерално в брифа):**
1. `skills/plan/SKILL.md` — НОВ, по § Спецификация горе (frontmatter точно три полета в реда
   `name`, `description`, `allowed-tools`; Step 0 копиран байт-за-байт от `skills/mission/SKILL.md:13-27`;
   двата task текста дословно).
2. `skills/README.md:6` → `Shipped: loop, review, qa, qal, brief, mission, work, roles, arbiter,
   setup, update, selfcheck, plan.` + едно изречение под абзаца: `plan` е конвенция + артефакти,
   без hook.
3. `scripts/selfcheck/aiwf-selfcheck.js:5590-5591` литералът `DOCTRINE_SHIPPED_COMMANDS` = новият
   ред; `:5769` етикет „a thirteenth skill ships without being written into the index line“; `:5778`
   контролният низ с `..., selfcheck, plan, telemetry.`. Нищо друго в self-check-а (структурната
   проверка се адаптира сама — `:5813-5849`).
4. `skills/review/SKILL.md:197-262` — по § Промяната в Step 2b; `:264-318` (plan-readiness mode):
   първият bullet `:269-273` става указател: „the plan arrives from `/pnp:plan` with its artifacts
   (inventory, chains, replay, simulation, process, fact-check ledger) — a plan without them spends
   this paid pass on what scan-tier agents return“. **Не се пипа** изречението на `:423` („A
   readiness pass after the first may resume only with its compensations, and only on the operator's
   word“) — пин на self-check-а (`aiwf-selfcheck.js:5576-5578`, `doctrine-pass-compensations`).
5. `docs/READINESS_CLASSES.md` — НОВ, по § горе.
6. `docs/WORKFLOW.md`: § Plan readiness review — абзацът „The COO's own pass comes first“ `:384-401`
   получава изречение: собственият проход чете behavior ledger-а (`/pnp:plan` Step 4–5), не само
   указателите; цикълът `:419-432` получава изречението на кандидата: „The revision after a pass
   closes the blockers it was handed and adds nothing new: a change that opens new surface is a
   candidate for the next plan, not a line in this one — the next pass would only find what the
   revision created.“; нов абзац в началото на § Plan readiness review, веднага след `:352-354`,
   литерално: „**The mechanics live in `/pnp:plan`.** This section states what a durable plan OWES
   before its first paid pass; how the COO produces it - the steps, the artifacts under
   `<scratchDir>/plan/<ABBR>/` (inventory, behavior ledger, replay, simulation, process trace,
   per-claim fact-check ledger), the agent tasks, and the `--revise` mode after a NEEDS-FIX - is the
   skill, and a plan that arrives at the auditor without those artifacts spends the paid pass on what
   scan-tier agents return.“ Абзацът `:436-438` („at `0` the plan gets no auditor at all and the
   COO's own reading plus the fact-check gate is the whole contract“) → „…and the artifacts of
   `/pnp:plan` - the COO's own pass over the behavior ledger plus the fact-check gate - are the whole
   contract“.
   Плюс две задължителни корекции, които ledger-ът намери (chains.md ред 12, 17): `:146-149` описва
   изхода на гейта като „returning only the false or unverifiable claims with file:line and the
   correct value“ → „returning a per-claim ledger (verified / false / unverifiable, one row per
   claim, with a count line)“; `:391-393` „verify the chain table“ → „verify the behavior ledger“.
   Закриващ grep след промяната: `grep -c "chain table" docs/WORKFLOW.md skills/review/SKILL.md
   templates/ORCHESTRATOR.md.tmpl` → 0 на трите.
7. `templates/ORCHESTRATOR.md.tmpl:163-175` § Chain-trace duty → § Behavior ledger duty: преди
   първия платен readiness пас за всяко звено на всяка верига има ред с DOES / CLOSES OVER / STATES /
   LIB, произведен от отделен scan-tier контекст (`/pnp:plan` Step 4) и прочетен от COO (Step 5);
   честният лимит се преформулира: „a ledger proves that a second context read the link, not that
   the COO acted on it — the ownpass record is where acting is visible“; дължи се винаго когато
   скилът върви, включително при 0 паса (Решение 9). Без модел, без frontmatter (self-check
   `:5624-5630`: пада на `config.roles.`, на ред започващ с `model:`/`effort:`, на първи ред `---`).
   Същият файл се преименува и на `:15` и `:40` — интро абзаците изброяват „the chain-trace duty“
   като правило на файла (chains.md ред 17); след промяната `grep -c "chain-trace" templates/ORCHESTRATOR.md.tmpl` → 0.
7б. `templates/CLAUDE.md.tmpl:64-66` — изречението „Session entry points for the operator:
   `/pnp:mission` …, `/pnp:work` …, or no command …“ получава `/pnp:plan` (author a durable plan
   under the planning lock) като четвърти вход — managed region `aiwf-core` → ре-рендер с миграцията
   (т.12; chains.md ред 23). Root `CLAUDE.md` на това repo НЕ се редактира на ръка от Колегата —
   регионът му се ре-рендира от `/pnp:update` върху самото repo след изданието (§ Процес т.2).
8. `skills/mission/SKILL.md` (§ Steps 5, при „newly born ticket“) и `skills/work/SKILL.md:45-51` —
   по едно изречение: „A durable R2/R3 plan is authored through `/pnp:plan`, which carries the
   planning lock and produces the readiness artifacts; a single non-durable ticket brief is written
   here directly.“
9. `docs/OPERATOR_PROTOCOL.md:1-28` — `:1` „# Operator protocol - the four doors“, `:7` „## The four
   doors“, `:9` „one of four ways“, и след Door 3 (`:28`) литерално:

   ```
   ### Door 4 - `/pnp:plan`: plan durable work before anyone writes

   For work that gets a durable plan (R3, and R2 that spans sessions or changes architecture). The
   command holds the planning lock - nothing in the repository changes, no Writer is dispatched -
   and walks the plan to readiness through artifacts that can fail: a consumer inventory, a
   behavior ledger for every link the plan touches, a replay of the blocker classes earlier plans
   paid for, a simulation of every acceptance command on the real tree, and a per-claim fact-check.
   Only then does the plan go to the paid readiness pass. You type `/pnp:plan`, and after a
   NEEDS-FIX verdict `/pnp:plan --revise`.
   ```

   `docs/README.md:14` „the four doors“ + ред за `READINESS_CLASSES.md` в списъка `:6-15`:
   „- `READINESS_CLASSES.md` - the blocker classes a readiness pass keeps finding, one question per
   class; `/pnp:plan` replays them over every ticket before the paid pass.“
10. `README.md:31` „**Thirteen commands**“ + `plan` в списъка; таблицата `:191-206` нов ред
    `/pnp:plan`; `:21` → `v0.3.0`.
11. `templates/memory-seeds/durable-plan-goes-through-pnp-plan.md` — НОВ, форматът на
    `approved-plan-lands-in-repo.md:1-10`: `[R]`, „Reinforces payload `docs/WORKFLOW.md` - § Plan
    readiness review“, две изречения.
12. `migrations/0017_plan-skill/` — `ops.json` (`"migration": "0017_plan-skill"`,
    `"targetPluginVersion": "0.3.0"` — тройното съвпадение с `plugin.json` и `index.json` е проверка
    на `validate-payload.mjs:255-330`): ДВА `rerender-managed-region` op-а **без `ifRecorded` и без
    `createIfAbsent`** — (а) `file: ".claude/aiwf-native/ORCHESTRATOR.md"`, `region: null`,
    `template: "templates/ORCHESTRATOR.md.tmpl"`; (б) `file: "CLAUDE.md"`, `region: "aiwf-core"`,
    `template: "templates/CLAUDE.md.tmpl#aiwf-core"` (образец `0004`/`0012`). Защо без флаг: двата
    артефакта са записани на всяка инсталация, минала `0012` (`createIfAbsent` тогава), и `0017` се
    прилага строго след нея; при запис обикновеният път на `migrate.mjs:619-727` е: нередактиран →
    тих take-new, редактиран → conflict диалог, held → само upstream hash (chains.md ред 15).
    `ifRecorded` тук би било мъртъв клон със грешна семантика. + `note` (`id: plan-skill`, `docRefs`
    `["CHANGELOG.md", "skills/plan/SKILL.md", "docs/READINESS_CLASSES.md"]`, `supersedes: []` не се
    пише — полето е optional и празен списък не носи нищо) с текст, който казва на консуматора кои
    свои памети стават указатели (own pass separate turn, pre-dispatch blocker ledger, chain-trace
    evidence pack за readiness — без имена на проекти); `NOTES.md` по образеца на `0016`;
    `migrations/index.json` нов последен запис `{ "id": "0017_plan-skill", "targetPluginVersion":
    "0.3.0" }`.
13. `.claude-plugin/plugin.json:3` → `"version": "0.3.0"`; `CHANGELOG.md` нов блок `## [0.3.0] -
    <дата на тага>` с `### Added` (`/pnp:plan`, `READINESS_CLASSES.md`) и `### Changed` (Step 2b
    ledger; Chain-trace → Behavior ledger duty; four doors); датата се проверява в тагнатото дърво
    (HARD-020 прецедент `deb2bf0`).

14. **Self-update на това repo, в същия кодов commit** (прецедент `51dd2ce`: release commit-ът носи
    `.claude/aiwf-native/aiwf.config.json`, `roles.json`, `CLAUDE.md`): след bump-а Колегата пуска
    `node scripts/update/aiwf-update.mjs --apply --project-root .` — двата региона се ре-рендират
    тихо (нередактирани), `installedPluginVersion` → `0.3.0`, `lastMigrationApplied` →
    `0017_plan-skill`. Без това `selfcheck` пада на `version-stamp` („installedPluginVersion equals
    the payload version“, `aiwf-selfcheck.js:4906-4911`) и Step 0 на всеки скил тук спира. Ако
    `--apply` отвори conflict диалог (регион, редактиран локално) — СТОП и доклад, не резолюция.

**Извън worklist-а, изрично:** `examples/` (HARD-019), `hooks/`, `schema/`, `scripts/engine/`,
`scripts/native/`, `dev/**` (COO го пише в docs commit-а), `.github/`, `.claude/agents/`,
`.claude/settings.json`.

**Acceptance (всяка команда — литерална, Bash на Writer-а, с изход който значи „счупено“):**
- `git ls-files "skills/*/SKILL.md" | wc -l` → `13` (12 = скилът липсва).
- `grep -c "^Shipped: loop, review, qa, qal, brief, mission, work, roles, arbiter, setup, update, selfcheck, plan\.$" skills/README.md` → `1`.
- `grep -c "selfcheck, plan\.';" scripts/selfcheck/aiwf-selfcheck.js` → `1`; `grep -c "a thirteenth skill ships" scripts/selfcheck/aiwf-selfcheck.js` → `1`; `grep -c "a twelfth skill ships" scripts/selfcheck/aiwf-selfcheck.js` → `0`.
- `grep -c "Thirteen commands" README.md` → `1`; `grep -c "Twelve commands" README.md` → `0`;
  `grep -c '^| `/pnp:plan` |' README.md` → `1`; `grep -c "v0.3.0" README.md` → `1`.
- `grep -c "CLAIMS: total=" skills/review/SKILL.md` → `1`; `grep -c "Return ONLY the list of claims that are" skills/review/SKILL.md` → `0`.
- `grep -c "^| 14 |" docs/READINESS_CLASSES.md` → `1`; `grep -c "^| " docs/READINESS_CLASSES.md` → `16` (header + разделител + 14).
- `grep -c "Behavior ledger duty" templates/ORCHESTRATOR.md.tmpl` → `1`; `grep -c "Chain-trace duty" templates/ORCHESTRATOR.md.tmpl` → `0`; `grep -c "owes no chain table" templates/ORCHESTRATOR.md.tmpl` → `0`.
- `grep -c "adds nothing new" docs/WORKFLOW.md` → `1`; `grep -c "/pnp:plan" docs/WORKFLOW.md skills/mission/SKILL.md skills/work/SKILL.md docs/OPERATOR_PROTOCOL.md docs/README.md templates/CLAUDE.md.tmpl | grep -c ":0$"` → `0` (шест файла, нито един без споменаване).
- `grep -c "chain table" docs/WORKFLOW.md skills/review/SKILL.md templates/ORCHESTRATOR.md.tmpl | grep -vc ":0$"` → `0`; `grep -c "chain-trace" templates/ORCHESTRATOR.md.tmpl` → `0`; `grep -c "only the false or unverifiable claims" docs/WORKFLOW.md` → `0`; `grep -c "may resume only with its compensations" skills/review/SKILL.md` → `1`.
- `grep -rc "three doors" docs/ README.md skills/ templates/ | grep -vc ":0$"` → `0`; `grep -c "four doors" docs/OPERATOR_PROTOCOL.md` → `2` (заглавие + heading).
- Frontmatter: `test -f skills/plan/SKILL.md && sed -n '1p;5p' skills/plan/SKILL.md | grep -c "^---$"` → `2` (без `test -f` pipe-ът маскира липсващ файл като чист `0` — симулация ред 25); `sed -n '2p' skills/plan/SKILL.md` → `name: plan`; `sed -n '4p' skills/plan/SKILL.md` → `allowed-tools: Read, Grep, Glob, Bash, Agent`.
- `git ls-files "templates/memory-seeds/*.md" | wc -l` → `18`.
- `node -e "const i=require('./migrations/index.json');const l=i[i.length-1];if(l.id!=='0017_plan-skill'||l.targetPluginVersion!=='0.3.0')process.exit(1)"` → exit 0 (index.json е JSON масив — chains.md ред 18); `grep -c '"version": "0.3.0"' .claude-plugin/plugin.json` → `1`; `grep -c '"targetPluginVersion": "0.3.0"' migrations/0017_plan-skill/ops.json` → `1`; `grep -c "ifRecorded\|createIfAbsent" migrations/0017_plan-skill/ops.json` → `0`; `grep -c '"op": "rerender-managed-region"' migrations/0017_plan-skill/ops.json` → `2`.
- `grep -c '"installedPluginVersion": "0.3.0"' .claude/aiwf-native/aiwf.config.json` → `1`; `grep -c '"lastMigrationApplied": "0017_plan-skill"' .claude/aiwf-native/aiwf.config.json` → `1`; `grep -c "/pnp:plan" CLAUDE.md .claude/aiwf-native/ORCHESTRATOR.md | grep -c ":0$"` → `0`.
- `grep -c "^## \[0.3.0\] - " CHANGELOG.md` → `1`.
- Step 0 идентичност: `L=$(grep -n "^## Step 0" skills/plan/SKILL.md | cut -d: -f1); test -n "$L" && diff <(sed -n '13,27p' skills/mission/SKILL.md) <(sed -n "${L},$((L+14))p" skills/plan/SKILL.md)` → exit 0 (15 реда, байт-идентични; без `test -n` празно `L` дава невалиден sed range и diff печата подвеждащ 15-редов hunk — симулация ред 38).
- Task текстовете (risk threshold „sampling / вердикт“): `grep -c "You read CODE, not the plan's claims." skills/plan/SKILL.md` → `1`; `grep -c "CHAIN ENDS EARLY at" skills/plan/SKILL.md` → `1`; `grep -c "UNREAD <reason>" skills/plan/SKILL.md` → `1`; `grep -c "No sampling, no spot-checking" skills/review/SKILL.md` → `1`; `grep -c 'UNVERIFIABLE with the reason "not opened"' skills/review/SKILL.md` → `1`; `grep -ci "spot-check" skills/plan/SKILL.md` → `0`. Дословността на целите блокове се чете от Одитора (fact-check + кодовият пас), не от grep.
- „`--apply`, не ръчна редакция“ (risk threshold): наблюдаемо през bookkeeping-а — `selfcheck` сравнява hash-а на всеки managed artifact с `_aiwf.managedRegions.<key>.local` (проектният слой на self-check-а); ръчна редакция до същите байтове е неразличима и безвредна, различни байтове падат там.
- Regression guard-ове, които минават и днес по конструкция (симулация редове 22, 39, 40 и целият VERIFY batch): пинованото изречение `:423`, дифф гардът върху чисто дърво, provenance grep-ът и шестте VERIFY суити — те пазят от регресия, не доказват новото; доказателството за новото са grep редовете горе + fact-check + кодовият пас.
- Дифф гард (котва `<КОТВА>` = HEAD при диспач):
  `node -e "const{execSync}=require('child_process');const sh=c=>execSync(c).toString().trim();const A='<КОТВА>';const ch=sh('git diff --name-only '+A).split(/\r?\n/).filter(Boolean);const un=sh('git status --porcelain').split(/\r?\n/).filter(l=>l.startsWith('??')).map(l=>l.slice(3));const ok=f=>f.startsWith('skills/')||f.startsWith('docs/')||f.startsWith('templates/')||f.startsWith('migrations/')||f==='scripts/selfcheck/aiwf-selfcheck.js'||f==='README.md'||f==='CHANGELOG.md'||f==='CLAUDE.md'||f==='.claude-plugin/plugin.json'||f==='.claude/aiwf-native/aiwf.config.json'||f==='.claude/aiwf-native/ORCHESTRATOR.md'||f==='.claude/aiwf-native/roles.json';const bad=ch.filter(f=>!ok(f)).concat(un.filter(f=>!(ok(f)||f.startsWith('dev/')||f.startsWith('.aiwf/'))));if(bad.length){console.error(bad);process.exit(1)}"` → exit 0 (allowlist-ът включва трите self-update артефакта и root `CLAUDE.md`, защото `--apply` ги пише).
- Provenance: `git grep -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples README.md` → празно.
- VERIFY (Решение 17), Порция 1, един паралелен batch: `validate-payload`, `selfcheck`,
  `update-suite`, `example-cycle-windows`, `setup-suite`, `plugin-validate` → exit 0 всяка, точните
  кодове в handback-а; runbook `dev/VERIFY_RUNBOOK.md`.
- След издание (record, не acceptance): CI green на windows+ubuntu на пушнатия commit; `git
  ls-remote --tags origin v0.3.0` → hash; `origin/main...main` → `0 0`; консуматорите: `/pnp:update`
  чист, self-check зелен, ORCHESTRATOR.md ре-рендиран без диалог (не са го редактирали).

**Risk threshold:** блокира — файл извън allowlist-а на гарда; Cyrillic/абсолютен път/име на проект в
payload; skill frontmatter с четвърто поле или друг ред; Step 0 не идентичен; agent task текст,
който позволява sampling или връща вердикт; какъвто и да е флаг на rerender op-овете; ръчна редакция
на root `CLAUDE.md` / `ORCHESTRATOR.md` вместо `--apply`; пинованото изречение на review `:423`
пипнато; невярно твърдение в prose (fact-check преди паса). Не блокира — стил, дължина на SKILL.md.
**Stop condition:** acceptance зелен + един кодов пас `pass`/`pass-with-notes` → стоп; cap 2 рунда.
**Review:** `Class: code` → `review.code` (codex `gpt-6-sol`/xhigh, 1 пас), fact-check per claim
(новата форма — приложена на ръка от COO върху дифа, защото скилът още не е инсталиран); QA — не
(без runtime поведение).
**Assignee:** Колега. Branch `main`. Един кодов commit (всичкият worklist), докс commit отделно
(PLAN record, CANDIDATES редове, PLAN_HARD бележката за HARD-011 → 0.3.1 ако Решение 3 мине).

## Верига (chain table на този план — Outcome → payload звена; попълва се като behavior ledger в Step 4 на ръчния рън)

| # | behavior | link (file:line) | endpoint |
|---|---|---|---|
| 1 | `/pnp:plan` се вижда от хоста и от self-check-а | `skills/plan/SKILL.md` (нов) → auto-discovery (plugin.json без `skills` ключ) → `skills/README.md:6` → `aiwf-selfcheck.js:5590-5600` (структурно) → `:5768-5778` (два контрола) → `:5813-5849` (name/description/Step 0/interlock) | self-check изход |
| 2 | fact-check връща ledger | `skills/review/SKILL.md:209-221` (диспач + task) → `:223-252` (readiness редове) → агентен изход → COO | текст, четен от COO |
| 3 | behavior ledger духът стига до консуматора | `templates/ORCHESTRATOR.md.tmpl:15,40,163-175` → `migrations/0017/ops.json` два rerender op-а (без флаг) → `validate-payload.mjs:105-137,376-396` → `scripts/update/migrate.mjs:619-727` planRerender (запис + нередактиран → тих take-new) → `.claude/aiwf-native/ORCHESTRATOR.md`, `CLAUDE.md#aiwf-core` (консуматор и това repo чрез `--apply`) | рендирани файлове |
| 4 | доктрината сочи скила | `docs/WORKFLOW.md:146-149`, `:384-401`, `:391-393`, `:419-432` → `skills/mission/SKILL.md:53-61` → `skills/work/SKILL.md:45-51` → `docs/OPERATOR_PROTOCOL.md:1-28` → `docs/README.md:6-15` → `templates/CLAUDE.md.tmpl:64-66` (managed → верига 3) | текст |
| 5 | изданието е валидно | `.claude-plugin/plugin.json:3` → `migrations/index.json` последен запис → `validate-payload.mjs:274-329` → CI → tag | CI + tag |
| 6 | seed-ът стига до нова инсталация | `templates/memory-seeds/<нов>.md` → `scripts/setup/generate.mjs:1581-1585` (чете директорията) → `:1669-1675` банер + `console.log` | конзолен печат — веригата СВЪРШВА тук по конструкция: seeds са „PRINTED, never written“ (банерът на `generate.mjs:1669`), няма pin на броя (chains.md ред 38); приема се, не се закрива с тест |

## Процес

1. **Readiness на този план (ръчният рън на новия процес — първата точка данни; артефактите са в
   `.aiwf/plan/RDY/`: `inventory.md`, `chains.md`, `ownpass.md`, `replay.md`, `simulation.md`,
   `factcheck-r0.md`, `process.md` = тази секция):** инвентар
   (направен, 2 sonnet) → чернова (този файл) → **[граница на ход]** → behavior ledger per верига
   (1 sonnet Explore над таблицата горе; звената са payload файлове — DOES = какво чете/пише/асъртира)
   → собствен проход по ledger-а + шестте проверки → replay (14-те класа над RDY-001, ръчно, защото
   документът още не съществува — списъкът е в този план) → simulation (general-purpose sonnet:
   всяка acceptance команда на реалното дърво: очакван изход при днешното дърво = „счупено“ за
   новите неща, exit за грешно написана команда) + process trace (тази секция) → fact-check per
   claim (новият task текст, приложен на ръка: един агент за Context+Решения, един за
   Спецификация+Step 2b+CLASSES, един за Тикета) → **[граница на ход]** → `/pnp:review` `Class:
   plan` пас 1 (COVERED BY: „давай, отваряй плановата сесия“, 2026-09-29) → revise → пас 2 (дума) →
   при остатък пас 3 (дума, hard max).
2. **Изпълнение:** дума за RDY-001 → route-state `{ticket: RDY-001, route: R2}` → Writer бриф
   (`Ticket: RDY-001` на свой ред, котва HEAD, worklist-ът горе, VERIFY редовете, runbook указател,
   „никакъв `model`“) → handback → fact-check per claim над дифа (COO, на ръка по новата форма) →
   `/pnp:review` `Class: code` (1 пас; корекционен рунд с код → верификационен пас само с дума) →
   commit клик (кодов commit: worklist файловете по изрични пътища, ВКЛ. трите self-update артефакта
   и root `CLAUDE.md` — прецедент `51dd2ce`; PLAN и `dev/` не влизат) →
   route-state `{}` → completion record + CANDIDATES редове (docs commit, клик) → **push `main`
   (дума + диалог)** → CI windows+ubuntu зелени → дата в CHANGELOG срещу деня на тага (в тагнатото
   дърво; ако не съвпада — поправка + нов commit + клик, HARD-020 прецедент) → **tag `v0.3.0`
   (дума)** → **push tag (дума + диалог)** → `git -C D:\pnp-live checkout --detach main` (worktree
   опресняване, ask диалог по Gate 4 за `-C` форма — приема се) → consumer proof: съобщение до
   двете сесии за `/plugin marketplace update promptandpray` → `/reload-plugins` → `/pnp:update`
   (ORCHESTRATOR.md ре-рендиран; техните памети → указатели по NOTES на `0017`) → record.
3. **Затваряне на плана:** RDY-001 е единственият тикет → при completion record-а планът се архивира
   (`git mv dev/backlogs/active/PLAN_RDY.md dev/backlogs/archive/006_PLAN_RDY_<дата>.md`, същата
   сесия) с проверката за rule-class точки без pointer row (guard (h)); PLAN_HARD остава активен с
   HARD-011.
4. **Гейтове, изброени:** дума за RDY-001; commit клик ×2 (код, docs) + евентуален ×1 (дата);
   push дума + диалог; tag дума; push tag дума + диалог; пас над таблицата / рунд над cap 2 — дума
   всеки; readiness пас 2 и 3 — дума всеки. Нищо друго не пита.
5. **Измерване след издание (record):** следващият readiness цикъл на всеки консуматор през
   `/pnp:plan` — пас 1 блокери и авторски дял; сравнение с таблицата в Context. Данните идват от
   техните сесии; тук се записват с указател, не се измислят.

## Verification (края на мисията)

- `node scripts/update/aiwf-update.mjs --check --project-root .` → „up to date … 0.3.0“.
- `git ls-remote --tags origin v0.3.0` → hash на CI-зелен commit; `origin/main...main` → `0 0`.
- Двата консуматора на 0.3.0 с чист `/pnp:update` (record).
- Архивиране на PLAN_RDY в мига на затварянето на RDY-001.
