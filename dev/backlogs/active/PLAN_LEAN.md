# PromptAndPray — readiness цикълът по-лек и по-остър: един scan агент, без старт/стоп двойка, клас 15, own pass по действие, plansDir под `.aiwf`, указатели по дисциплина (PLAN_LEAN)

> **ОДОБРЕН 2026-10-14 (операторска дума „odobrqwam“) след readiness пас 3 PASS (Codex gpt-6-sol/xhigh,
> студен, над r6, печат `fceb0b63…bbe4`); приземен от `dev/backlogs/drafts/PLAN_LEAN.draft.md`. Цикълът:
> пас 1 NEEDS-FIX 2, пас 2 NEEDS-FIX 1, пас 3 PASS — `dev/backlogs/readiness/LEAN/revisions.md`.
> Изпълнението на LEAN-001 — отделна дума.**
>
> **r6 — 2026-10-14:** операторска дума — старт/стоп двойката се маха изцяло (D3, блокове T и B);
> блокерът на пас 2 (9(b), `os` извън enum-а) е затворен — guard по enum-а + S7 лице `solaris`;
> r5 → r6 след операторската дума и пас 2: делта scan 4 (редове 75-91) и делта fact-check r6 —
> `revisions.md` § r6; печатът `b82d10d1…` вече не съвпада (own pass с нов печат предстои).
>
> **ЧЕРНОВА r5 — 2026-10-04, HEAD `77936fc`, сесия „PNP 0.2.17 PLAN“** (r0 → r1 след Step 2a ledger 1,
> Step 2c scan 1 и сондата; r1 → r2 след Step 2b fact-check r1, два агента; r2 → r3 след readiness пас 1:
> NEEDS-FIX 2, двата затворени; r3 → r4 след делта scan 2 (редове 38-57): флагът е `windowsPaths` от
> декларирания `os`, bullet-ът се заменя цял; r4 → r5 след делта scan 3 (редове 58-74) и делта
> fact-check-овете r3/r4: `os` guard и fixture, `os` окабеляването тествано, F1 гард като diff срещу
> пинат файл — `revisions.md`). Роден от
> `dev/backlogs/CANDIDATES.md` § „От readiness цикъла на Silerax PLAN_PUR v3“, абзацът
> **[2026-10-04, операторска дума „всичките шест“]** — обхватът е РЕШЕН там (шестте точки, ЕДИН план,
> ЕДИН code-class тикет, миграция 0021 + bump), и от кандидата § „plansDir под игнориран път“ (пас 2
> блокер 3 на PLAN_DRAFTS). Readiness цикъл по `/pnp:review` Step 2a–2e и payload `docs/WORKFLOW.md`
> § Plan readiness review на ТЕКУЩИЯ payload (0.2.16): inventory ✓ (1× Explore/sonnet в репото + 1×
> Explore/sonnet над двата консуматора) → r0 (този текст) → Step 2a ledger + Step 2c scan (ДВА агента,
> паралелно — планът не се одитира под правилото, което въвежда) → r1 → Step 2b fact-check (един агент
> за тикета + един за общите) → r2 → инструментите на own pass-а в агент (неговият доклад отваря
> отделния ход) → Step 2d own pass в ОТДЕЛЕН ход (файл, SHA-256 ПОСЛЕДЕН) → пас 1 на стоящата дума за
> планирането — брифът на сесията, без нова дума (`Class: plan` → `review.plan`: Codex
> `gpt-6-sol`/xhigh, студен). Пас 2 — своя дума; пас 3 = таванът, своя дума. Изпълнението на LEAN-001 —
> отделна дума, по възможност отделна
> сесия. При одобрение: `mv` в `dev/backlogs/active/`, бележка в хедъра, двата хеша в `revisions.md`,
> `test -f` на четирите имена + `fact-check-r*`, docs commit (клик).
>
> Издание: **0.2.17**, вози се на единствения тикет. HARD-011 остава 0.3.0. Нищо от DRAFTS-001 и
> HARD-023 не се препланира.
>
> Указателна дисциплина на самия план (D13): `file:line` стои само в worklist-а, гардовете и acceptance-а
> — там, където Колегата действа или проверка чете; контекстът и решенията цитират по секция и символ.
> Котвите са към HEAD `77936fc` (inventory 2026-10-04) и се проверяват при диспач.

## Контекст (inventory 2026-10-04; по секция и символ)

**Какво казва payload-ът днес, за всяка от шестте точки.**

- **(a) Два агента на тикет.** `skills/review/SKILL.md` Step 2a („Behavior ledger before a readiness
  pass“) и Step 2c („Consequence scan before a readiness pass“) носят по една дословна задача и по
  едно изречение „Dispatch it with the Agent tool … one agent per ticket“ — две диспачвания на тикет,
  върху едно и също дърво. `templates/ORCHESTRATOR.md.tmpl` § Behavior ledger duty казва „a row
  produced by a SEPARATE scan-tier context“ и в абзаца „The consequence scan and the own pass ride the
  same duty“ — „read from the tree's side by a separate scan-tier context“. `docs/WORKFLOW.md` § Plan
  readiness review, абзац „A decision is also read from the tree's side“ — „one scan-tier agent per
  ticket (`/pnp:review` Step 2c)“. `scripts/engine/plan-gate.js` чете САМО файловете от редовете
  `PLAN:` / `CONSEQUENCE SCAN:` / `OWN PASS:` на брифа (`LINE_NAMES`, `FILE_LINES`), проверява
  заглавието `SCAN_HEADER` и затварянията `CLOSED_PREFIXES` (`plan:` / `no defect:`); думата „ledger“
  не се среща в него — сливането на агентите не пипа гейта. Нито един тест, self-check или memory seed
  не пинва изреченията на 2a/2c (doctrine pins в `aiwf-selfcheck.js` покриват други изречения).
- **(b) Старт→стоп двойката.** `templates/PNP_CANDIDATES.md.tmpl` § Pass statistics: „the start/stop
  pair the operator read off the host“; същото изречение е в скелета на `docs/WORKFLOW.md` § The
  transfer surface (fenced блок, който „an installation older than the key creates it by hand from
  exactly this skeleton“ — скелетът ТРЯБВА да е байт по байт шаблонът). Шаблонът е seeded-once и
  unmanaged (`generate.mjs` seed-ва го само при липса; никакъв `addArtifact`, никакъв migration op —
  self-check `transfer-surface-unmanaged`); `test-setup.mjs` сравнява seed-натия файл с шаблона,
  ПРОЧЕТЕН по време на теста (`SKELETON`), затова редакция на шаблона не иска редакция на теста.
  `docs/WORKFLOW.md` § Branch policy вече скопира клаузата „exactly one live auditor“ към
  измерването („holds while a pass's counter start/stop pair is being recorded“) — без двойка
  клаузата никога не важи и пада заедно с нея (D3). `templates/ORCHESTRATOR.md.tmpl` § Data discipline
  („a value only the operator can read off a screen (a counter …) is requested from them“) е общо
  правило и не спори с липсата на двойка — не се пипа (D3). **Операторска дума 2026-10-14: двойката се
  маха изцяло, не става незадължителна** („премахва се изцяло, не е необходима вече“). Никой тест не
  сравнява скелета във WORKFLOW с шаблона — `test-setup.mjs` чете `SKELETON` само от шаблона;
  равенството се проверява единствено от acceptance-а на този план (днес: равни, `rc=0`).
- **(c) Concurrency клас.** `docs/READINESS_CLASSES.md` има 14 класа; клас 4 („concurrency / lock
  order“) пита ПОВЕДЕНИЕТО при двама извикващи; нито един клас не пита за ОТГОВОРА на плана — „приет
  остатък“. Уводът казва „the fourteenth was measured between passes“; „The list grows with a release,
  never with a session“. Шестте проверки живеят на три места: `docs/WORKFLOW.md` § Plan readiness
  review списъкът „The readiness review checks only: 1.–6.“, `skills/review/SKILL.md` Step 2b третата
  инструкция „(1) repo-match … (6) branch“ и Step 2d таблицата
  `| ticket | repo-match | scope | discovery | order | acceptance | git |`. Гейтът (`CHECKS_HEADER`,
  `sameHeader`, `own-checks-row-shape`) изисква ТОЧНО тези седем клетки; седма проверка като колона =
  промяна в `plan-gate.js`, fixture-ите в self-check-а и spikes — затова „редът в шестте проверки“ е ред в
  ДЕФИНИЦИЯТА на проверка 3 (discovery), не колона (D4).
- **(d) „every `file:line` opened“.** Две места: `skills/review/SKILL.md` Step 2d, уводното изречение
  („It is the pass … describes: every `file:line` opened, every command run on the real tree, not one
  "if the Writer finds ..."“) и `docs/WORKFLOW.md` § Plan readiness review, абзацът „The COO's own pass
  comes before every counted pass“ („every `file:line` opened, every command executable on the OS
  channel …“). ORCHESTRATOR шаблонът не го повтаря („The COO reads the rows, not the pointers“ вече е в
  духа на (d)); `CHANGELOG.md` го носи като история (не се пипа).
- **(e) plansDir под игнориран път.** `aiwf-selfcheck.js` `projectLayerFindings` има три наблюдения
  (`addObservation`: `plans-drafts-subdir`, `plans-readiness-subdir`, `scratch-ignored`), принтер
  `printerFor` / `sectionProjectLayer`, секция `sectionDraftsObservations(tmpRoot)` с fixture-и S1–S6
  (S6 пуска реалния `sectionProjectLayer` и брои `grew === 3`); коментарът на секцията и обобщаващата
  проза в края на self-check-а казват „three (observed) rows“; `skills/selfcheck/SKILL.md` и
  `scripts/selfcheck/README.md` — „The three project-layer rows whose name carries `(observed)`“. Нищо
  не наблюдава plansDir. Setup: `generate.mjs` `existingPlansWarning({ projectRoot, plansDir })`
  връща един ред или `null`; интервюто (`interview.mjs`, въпросът `paths.plansDir`) го подава като
  `warn:` на `text()` (`warnAbout` печата ЕДИН ред, при default-а и при отговора); `planInstall`
  (раздел „7. directories“) го пуска в `notes`. `test-setup.mjs` раздел 12b тества предупреждението
  (чуто в интервюто; `note   …` в dry-run; чист проект не чува нищо). `scratchDir` е `const ".aiwf"`
  в схемата — интервюто не може да даде друга стойност. Измерено 2026-10-04 (fixture под scratchpad,
  живият payload, `scripts/setup/interview.mjs --dry-run --answers-file … --no-seeds`): с
  `paths.plansDir: .aiwf/plans` dry-run-ът излиза 0 без нито един `note`/`warn` ред и планира `mkdir
  .aiwf/plans/active|archive|drafts|readiness` и `write .aiwf/plans/PNP_CANDIDATES.md` — нищо не
  предупреждава днес. `skills/review/SKILL.md` Step 2e казва за plansDir под scratchDir или друг
  игнориран път: „a configuration this rule does not serve and the self-check does not detect“ — става
  невярно след тикета.
- **(f) Указателите.** `docs/WORKFLOW.md` § Ticket brief contract, bullet „A factual claim about
  existing code carries a `file:line` pointer - or is marked explicitly unverified“; § COO owns broad
  scans („a concrete worklist with `file:line` pointers“) и `templates/CLAUDE.md.tmpl` региона
  („the brief then carries a worklist with `file:line` pointers“) говорят за WORKLIST — вече са (f) и
  не се пипат. § Plan readiness review няма изречение за указателите в плана.

**Издание.** `.claude-plugin/plugin.json` `version` = `0.2.16`; `migrations/index.json` последен запис
`{ "id": "0020_drafts-in-repo", "targetPluginVersion": "0.2.16" }` (записите имат ТОЧНО две полета);
`validate-payload.mjs` изисква `NNNN_<slug>` (четири цифри, долна черта, lowercase slug с тирета), версии
строго растящи, последният запис = версията на payload-а, `NOTES.md` във всяка миграция, op речник
`add-config-key | rerender-managed-region (op, file, region, template) | reconcile-ask-ruleset | note (op,
id, text, docRefs)`. ORCHESTRATOR rerender образец: `migrations/0019_plan-readiness-gate/ops.json` —
`{"op":"rerender-managed-region","file":".claude/aiwf-native/ORCHESTRATOR.md","region":null,"template":"templates/ORCHESTRATOR.md.tmpl"}`
+ `note`; `RESOLVABLE_ARTIFACT_TEMPLATES` в `migrate.mjs` познава точно този ключ. Самоинсталацията:
`.claude/aiwf-native/ORCHESTRATOR.md` е managed с upstream == local → тих rerender при `--apply`;
`aiwf.config.json` носи `installedPluginVersion` и хешовете (self-check `version-stamp`,
`managed-regions-match`). Нито ORCHESTRATOR, нито CLAUDE регионът носят версионен печат; единственият
прозаичен печат е `README.md` ред „**v0.2.16. Public since 0.2.0.**“. `examples/` не носи рендерирани
копия (цикълът ги строи при рън); `run-example-cycle.mjs` пише само под `mkdtemp` и отказва работна
директория в репото — но ПРОВЕРЯВА дървото за байт-идентичност, затова редиректите на acceptance-а
отиват ИЗВЪН репото (прецедент: DRAFTS-001 VERIFY, `example-cycle-windows` exit 1 заради
`.aiwf/*-out.txt`).

**Консуматорите (read-only inventory 2026-10-04, извън репото → агент).** Двата носят точките като
локални правила с клауза „изтича с PnP 0.2.17“: Silerax `dev/PROJECT_OVERRIDES.md` § Loop shape
(bullet „Readiness ceremony — вътрешните стъпки, които отпадат“ = (d) кратка форма + (f); bullet „PnP
0.2.17 кандидатите“ = (a), (b), (c)); Furnissimo `docs/ai/PROJECT_OVERRIDES.md` § Loop shape (същите
два bullet-а, (d) в пълната форма „чете ledger редовете като поведение; пуска инструментите с валиден И
счупен вход“; плюс самостоятелно правило „Без статистика на пасовете“ от 2026-09-28, което остава —
(b) не го отменя). Нито един консуматор няма локално правило за (e). Note op-ът (блок N) им казва кои
редове изтичат, без да ги назовава.

## Решения (COO; всяко с един ред защо)

- **D1. Един агент, две таблици, два файла.** Step 2a става „Behavior ledger and consequence scan
  before a readiness pass: one agent, two tables“ — една дословна задача с две части `LEDGER` / `SCAN`
  и двата входа (решенията на плана + секцията на тикета) по веднъж; агентът връща двете таблици под
  редове `LEDGER` и `SCAN`; COO-то ги записва в `ledger.md` и `consequence-scan.md` (имената и
  заглавията непроменени — гейтът чете втория, own pass-ът първия). Защо един: двете таблици се четат
  от едно и също дърво в светлината на един и същ тикет и вторият агент отваряше файловете, които
  първият току-що е прочел (в това репо: `dev/backlogs/readiness/DRAFTS/ledger.md` ред A1 и
  `consequence-scan.md` ред 1 отварят един и същ `scripts/setup/generate.mjs`); защо два файла: гейтът
  проверява `consequence-scan.md` по заглавие и
  затваряне, а ledger-ът е вход на own pass-а — различни читатели.
- **D2. Делта сканът остава отделно диспачване, само SCAN половината.** Преди всеки следващ пас сканът
  върви над решенията, сменени или добавени от ревизията (клас 14), като диспач със SCAN половината на
  задачата и нищо друго; линк, който ревизията добавя в worklist-а, получава ledger ред по правилото на
  Step 2a за празна или UNREAD клетка — COO-то го чете само или диспачва LEDGER половината наново.
  Защо: ledger-ът се чете веднъж, преди първия пас; ревизията сменя решения, не вериги; едно правило за
  делтата на три места (блок C, O2, WORKFLOW) е по-малко повърхност от условна клауза (scan ред 3).
- **D3. Двойката се маха изцяло (операторска дума 2026-10-14; r0–r5 я правеха незадължителна).**
  Шаблонът § Pass statistics и скелетът в WORKFLOW (байт по байт еднакви — блок T) казват само: кой пас
  и колко е струвал, както engine-ът го е отчел; думите „start/stop“ изчезват от `docs skills
  templates`. § Branch policy губи изречението за „exactly one live auditor … SCOPED TO MEASUREMENT“
  (блок B): то важи само докато се записва двойка, а двойка вече не се записва — мъртъв текст (заменя
  r1 решението по scan ред 8). ORCHESTRATOR § Data discipline НЕ се пипа: общото правило „data only the
  operator can see is ASKED for“ не спори с липса на двойка, затова r1 добавките (блок O3 и „when the
  record needs it“, scan ред 7) отпадат и шаблонът се пипа на две места, не на четири. Операторското
  правило от 2026-10-02 в този проект стои. Скелетът във WORKFLOW няма друг пазач
  освен acceptance-а на този план — честно казано, нов тест би бил нова повърхност (scan ред 9). Защо не migration op за шаблона: той е unmanaged (без
  адрес, без запис, без op — WORKFLOW § The transfer surface и self-check `transfer-surface-unmanaged`);
  промяната стига до нови инсталации, а note op-ът казва на заварените, че могат да сменят текста си.
- **D4. Клас 15, и редът в шестте проверки е ред в дефиницията на проверка 3 — не колона.** Нов ред в
  `docs/READINESS_CLASSES.md`: „concurrency decision left as an accepted residual“ — за всеки запис,
  който планът добавя или сменя: кой lock го държи и какво върви до него, назовани в плана; гонка или
  lock-order въпрос, затворен с „приет остатък“, „рядко“ или „Колегата ще види“, е открито решение и
  никой пас не го приема. Проверка 3 (hidden discovery) във WORKFLOW списъка, в Step 2b третата
  инструкция и в Step 2d (`discovery` клетката) получава изречението; кратките списъци, които само
  назовават категориите — Plan-readiness mode bullet-ът в SKILL и `docs/REVIEW_CHECKLIST.md` — получават
  скоба „(for every write, the lock and what runs beside it - class 15)“ (scan ред 12);
  `templates/agents/reviewer.md.tmpl` носи същия кратък списък и НЕ се пипа (D14; промяната би била
  rerender op за `.claude/agents/reviewer.md` — миграционна операция за една скоба — а „hidden
  discovery/architecture“ като категория вече включва отворено concurrency решение, WORKFLOW § COO
  routing проверка 2). Защо не колона: гейтът изисква точно седемте
  клетки (`CHECKS_HEADER`), fixture-ите в self-check-а и spikes ги пинват, а операторската дума казва
  „ред в шестте проверки“, не „седма проверка“. Честен лимит: гейтът проверява `discovery` клетката само
  за непразност (`plan-gate.js`, `own-checks-empty-cell` в `checkPlanBrief`), затова изречението е
  доктрина, не enforcement, и чистата форма
  на клетката е `0 - no write with a concurrent caller`, никога голо `none` (scan редове 13, 14). Клас 4
  остава — той пита поведението; клас 12 пита какво планът НЕ е решил; клас 15 назовава единственото
  „решение“, което не брои за решение — отложената гонка (scan ред 15: въпросът е към записите на тикета,
  не към honest-limits регистъра на доктрината).
- **D5. Step 2d по действие.** „every `file:line` opened“ → „every pointer the Writer acts on
  opened - the worklist, the guards, the commands - while the pointers that only explain are the
  fact-check gate's; the ledger rows read as behavior, not as pointers; every instrument run on the
  real tree with valid AND broken input“ — в SKILL Step 2d и в WORKFLOW § Plan readiness review (блок
  D). ORCHESTRATOR шаблонът НЕ го преразказва — TEMPLATE CONTRACT-ът му казва, че правило с дом в
  payload документ се сочи, не се повтаря (scan ред 18); блок O2 сочи Step 2d. Защо: указателите на
  контекста са работа на Step 2b (FALSE редът носи вярната стойност); own pass-ът отваря онова, по което
  ще се действа.
- **D6. plansDir под scratchDir — наблюдение по префикс, без git.** Четвърто наблюдение
  `plans-under-scratch` („plansDir under scratchDir (observed)“) с два текста: `under the scratch
  directory <scratchDir> - nothing there is the Git canon while the scratch directory is ignored
  (/pnp:review Step 2e)` / `outside the scratch directory` (и `config paths or os unusable - nothing to
  observe` при негодни пътища или негоден `os` — съседите имат само `paths` в текста си, този има и
  `os`). Решимо по префикс, лексикално: `path.posix.normalize`
  (маха `./`, свива `..` сегменти — `docs/../.aiwf/plans` е под, `.aiwf/../docs/plans` не е), без
  крайни `/`; регистърът и backslash-ът се свеждат САМО за проект с `os: windows` — трети параметър
  `windowsPaths`, по подразбиране `false`, който всяко извикващо място подава от ДЕКЛАРИРАНИЯ `os` на
  проекта (`config.os`, `merged.os`, отговорът на въпроса `os` в интервюто), не от хоста, на който върви
  self-check-ът или setup-ът (пас 1 блокер 2; делта scan редове 43, 45, 55: на linux/macos `.AIWF` е друга
  директория, `\` е легален знак в име и правилото `.aiwf/` не ги покрива; модулният прецедент в
  `generate.mjs` е `samePath`, който свежда регистъра само на win32; хостът е грешната ос — Windows
  конфиг, проверен на ubuntu CI, трябва да даде същия отговор). На Windows свеждането отговаря на
  git: `.git/config` там носи `ignorecase = true` от init сондата и `git check-ignore -v .AIWF/plans`
  удря `.gitignore:1:.aiwf/` (измерено 2026-10-04 в това репо — `fact-check-r3.md`, `fact-check-r4.md`).
  macOS НЕ се свежда: подразбиращият се том е case-insensitive, но case-sensitive том е една опция
  при форматиране, конфигът не декларира том, и лексикален тест не гадае — стои от страната, която не
  нарича тракван път игнориран (честен лимит, казан тук: за macOS проект с различен регистър
  наблюдението може да каже „outside“, докато git на такъв том го игнорира). По същата причина не се
  засича и mount, чието правило за регистъра се различава от декларирания `os` (case-insensitive mount
  на linux, case-sensitive том на macOS) — тестът чете конфига, не диска. Gate 3 свежда регистъра
  на всяка платформа (`pretooluse-mutation-guard.js`; собственият му коментар го нарича leniency за
  Windows пътища) — allowlist на записваеми сегменти може да си го позволи, лексикален прочит на
  конфига, който се докладва като факт, не; `scratch-ignored` до него пита самия git — двете наблюдения
  отговарят на различни въпроси и Step 2e го казва (блок E1: „a lexical prefix test“; делта scan редове
  46, 47, 54). После `a === b ||
  a.startsWith(b + '/')`. Няма достъп до файловата система — абсолютен път или symlink не се резолвират,
  а Windows особеностите извън регистър и `\` (краен `.`/интервал в име, 8.3 кратки имена) остават
  „outside“ за лексикалния тест (делта scan ред 72). Self-check-ът чете СУРОВИЯ конфиг (без schema
  default-и): липсващ `os` или `os`, който не е една от трите enum стойности на схемата (`windows`,
  `linux`, `macos`, точно в този регистър), печата „unusable“, не „outside“ (ред 58, 59; пас 2 блокер
  1 — guard „низ ли е“ пускаше `solaris` до „outside“). Защо по префикс, не
  `git check-ignore`: кандидатът и
  операторската дума казват „по префикс `.aiwf/`“; „друг игнориран път“ иска git и остава извън (честно
  казано в Step 2e, блок E). Защо наблюдение, не
  проверка: проектът е в правото си (схемата допуска всеки низ); наблюденията са извън контролите по
  конструкция (D5 на PLAN_DRAFTS), а каквото МОЖЕ да падне — текстът и принтерът — го доказват
  fixture-и S7↔S8 и разширеното S6.
- **D7. Интервюто ПРЕДУПРЕЖДАВА, никога не отказва.** Нов чист helper
  `plansDirUnderScratchWarning({ plansDir, scratchDir = '.aiwf', windowsPaths = false })` в
  `generate.mjs` до `existingPlansWarning`, същата нормализация като D6; връща един ред или `null`;
  интервюто подава `windowsPaths: os === 'windows'` (отговорът на въпроса `os`, който идва преди
  пътищата), `planInstall` — `merged.os === 'windows'`. Двете копия имат константно подразбиране
  `false`, а правилото живее на трите извикващи места; всяко от трите се доказва през реалния път с
  `.AIWF/plans` (делта scan ред 52, fact-check r4 gap A5): self-check-ът — S7 (`os: windows` → under,
  `os: linux` → outside), генераторът — два dry-run-а в 12c (`os: windows` → `note`, `os: linux` → без
  `note`), интервюто — две скриптирани интервюта в 12c (`os` windows → чува предупреждението, `os` linux →
  не). Интервюто го подава първи: `warn: (value) => plansDirUnderScratchWarning({ plansDir: value,
  windowsPaths: os === 'windows' }) ?? existingPlansWarning({ projectRoot, plansDir: value })` —
  `warnAbout` печата ЕДИН ред, под-scratch предупреждението е
  по-тежкото, а `scratchDir` е `const ".aiwf"` в схемата, затова интервюто не подава стойност; когато
  важат и двете (plansDir под `.aiwf` И заварени `PLAN_*.md` под него), въпросът показва по-тежкия ред, а
  `notes` на доклада носят двата (scan ред 26); `planInstall` пуска и двата реда в `notes`. Четирите
  текста, които изброяват „двете предупреждения на setup“ — `skills/setup/SKILL.md` абзацът за въпросите
  по пътищата, хедърът на `interview.mjs`, коментарът над `existingPlansWarning` в `generate.mjs` и
  хедърният коментар на `test-setup.mjs` (т.10 от списъка му) — казват „три“ (scan ред 27, ledger A14). Защо две копия на нормализацията
  (generate.mjs ESM и aiwf-selfcheck.js CommonJS): self-check-ът не импортира от setup и не бива да
  започне заради едно сравнение на низове; всяко копие има свой тест.
- **D8. Указателна дисциплина — едно изречение на две места.** WORKFLOW § Ticket brief contract,
  bullet-ът за factual claim се заменя цял (блок F1): началото „A factual claim the Writer acts on
  carries a `file:line` pointer“, средата „before writing a factual claim it acts on“ (вместо „any
  factual claim“) и краят „Where the pointer is owed is where the Writer ACTS or an acceptance check
  READS …; context that only explains cites the section and the symbol“ (пас 1 блокер 1 + делта scan ред
  38: всяко изречение на bullet-а говори в един и същ обхват); § Plan
  readiness review, абзацът за инвентара, получава изречението за плана с измерването от консуматора,
  както е записано в `dev/backlogs/CANDIDATES.md` § PUR v3 (629 указателя, отворени от агенти в own
  pass-а → 4 FALSE след fact-check — payload текстът казва „opened by agents in the own pass“, без да
  добавя какви агенти; блокерите на одитора — предимно дизайн и concurrency: 4 дизайн/гонки
  + 2 „приети остатъци“ от 11 на пас 1). Защо: ред с номер в проза остарява с първия commit и струва на fact-check гейта
  повторна проверка при всяка ревизия за нищо, по което някой действа.
- **D9. ORCHESTRATOR шаблонът се пипа → миграция `0021_lean-readiness` = rerender + note.** Две
  места в шаблона (§ Behavior ledger duty първи абзац; абзацът „The consequence scan and the own pass
  ride the same duty“; § Data discipline не се пипа — D3). Op-ът байт по байт както 0019
  (`file: ".claude/aiwf-native/ORCHESTRATOR.md"`, `region: null`, `template:
  "templates/ORCHESTRATOR.md.tmpl"`); note op-ът (блок N) казва на консуматорите кои локални редове
  изтичат. Самоинсталацията: тих take-new при `--apply` (upstream == local).
- **D10. Един тикет, едно издание 0.2.17.** Шестте точки са един договор за един readiness цикъл;
  половината са docs, (e) е код, rerender-ът е миграция — code class по правилото „an executable
  artifact ends docs class“.
- **D11. Маршрут R2 code-class без QA.** `generate.mjs`, `interview.mjs`, `test-setup.mjs`,
  `aiwf-selfcheck.js` се променят; няма runtime/UI; E2E е изключен в конфига; доказателството са
  setup suite и self-check (прецедент D10 на PLAN_DRAFTS, D13 на RGATE).
- **D12. VERIFY — шестте команди от DRAFTS-001, ЕДНА паралелна партида, изходите ИЗВЪН репото.**
  `validate-payload`, `setup-suite`, `update-suite`, `example-cycle-windows`, `selfcheck`,
  `plugin-validate` (редове „schema / config / roles“ + „update engine / migrations / examples“ + skills по решение на
  COO-то; без `spikes` — hooks непроменени), СЛЕД `--apply`. Редиректите на acceptance-а отиват в
  `<OUT>` = `C:/Users/dyosi/AppData/Local/Temp/pnp-lean/` (Колегата я създава с `mkdir -p`), защото
  `run-example-cycle.mjs` проверява дървото за байт-идентичност и файл под `.aiwf/` го обърна в червено
  при DRAFTS-001. `dev/VERIFY_RUNBOOK.md` е runbook-ът.
- **D13. Самият план е под (f).** Контекст и решения — по секция и символ; worklist, гардове и
  acceptance — с `file:line` (котви към HEAD `77936fc`, проверявани при диспач). Одиторът проверява
  решения, не указатели; ако пас 1 брои липсата на `file:line` в контекста за блокер, това е оспорено
  ДИЗАЙНЕРСКО решение и се паркира при оператора, не рунд.
- **D14. Нищо друго не се пипа.** `plan-gate.js`, hooks, схемата, `templates/CLAUDE.md.tmpl`,
  agents шаблоните (вкл. краткия списък на шестте проверки в `reviewer.md.tmpl` — D4), ask-ruleset,
  memory seeds (нула удари за 2a/2c/start-stop), `examples/`,
  CHANGELOG историята („fourteen blocker classes“ в 0.2.13 блока е вярна за 0.2.13), миграция 0017
  note текстът. Операторските правила на консуматорите — техни дървета.
- **COO routing (WORKFLOW § COO routing):** 1 = ДА (тикетът авторства миграция 0021 — rerender +
  note); 2 = не — по смисъла на правилото: всеки worklist запис, по който Колегата действа в
  съществуващ файл, носи `file:line` котва; записите за НОВИ файлове (миграцията, CHANGELOG блокът)
  са литерални текстове, не места за откриване, а закриващите grep-ове (12) са инструменти с измерени
  стойности; нерешен маркер в плана няма (2a назовава точните думи); 3 = не (ескалация по-долу); 4 = не
  → top tier; тази сесия е top tier (моделът на сесията — Fable; състояние на сесията, не на дървото).
- **Ескалация (WORKFLOW § Escalation and the arbiter):** тригер 1 „reverses a plan-recorded
  decision“ — Step 2a като отделен контекст е решение на PLAN_RDY (RDY-001), Step 2c като „one
  scan-tier agent per ticket“ — на PLAN_RGATE; D1 запазва „отделен контекст от автора“ (вторият
  контекст остава; слива се ВТОРИЯТ scan контекст с ПЪРВИЯ, не с COO-то) и идва по операторска дума
  („всичките шест“), а в соло инсталация операторът Е ескалационната цел — тригерът е разгледан и
  решението е операторско, записано тук с причината. Тригери 2–4: не.

**Отхвърлени:** седма колона в own-pass таблицата (D4 — гейт + fixture-и + spikes за едно изречение);
`git check-ignore` за plansDir (D6 — думата казва префикс; „друг игнориран път“ остава извън, честно);
отказ на интервюто при plansDir под `.aiwf` (D7 — схемата го допуска, операторът може да го иска);
migration op за `PNP_CANDIDATES.md` (D3 — unmanaged по конструкция, self-check пада при op към него);
сливане на делта скана и делта fact-check-а (CANDIDATES — различни договори, паралелно); нов клас
вместо клас 4 (D4 — различен въпрос); промяна в `plan-gate.js` (D14).

## Тикет

### LEAN-001 [R2 code-class] — readiness цикълът по-лек и по-остър: един scan агент, без старт/стоп двойка, клас 15, own pass по действие, plansDir под scratchDir, указатели по дисциплина; release 0.2.17

**Outcome:** (1) `skills/review/SKILL.md` Step 2a диспачва ЕДИН агент на тикет, който връща ledger и
scan (две таблици, два файла); Step 2c описва втората таблица, затварянията и делта скана; Step 2d
казва какво own pass-ът отваря, чете и пуска; Step 2b проверка (3) и Step 2e носят клас 15 и
наблюдението за plansDir (D1, D2, D4, D5, D6); (2) `docs/WORKFLOW.md` § Plan readiness review (агентът,
own pass-ът, проверка 3, указателите на плана), § Ticket brief contract (къде се дължи указател), § The
transfer surface (скелетът = шаблонът) и § Branch policy (без клаузата за измерването) носят D1, D4, D5,
D8, D3, а `docs/REVIEW_CHECKLIST.md` краткият
списък — клас 15 (D4); (3) `templates/ORCHESTRATOR.md.tmpl` на двете места (D1) и миграция 0021
го рендерира отново; (4) `templates/PNP_CANDIDATES.md.tmpl` § Pass statistics (D3); (5)
`docs/READINESS_CLASSES.md` клас 15 (D4); (6) self-check наблюдава plansDir под scratchDir (D6) с
fixture-и, интервюто предупреждава и четирите текста за „двете предупреждения“ казват три (D7),
test-setup го доказва; (7) издание
0.2.17: `0021_lean-readiness` (rerender на ORCHESTRATOR + note), bump, CHANGELOG, README печат, `--apply`.

**Worklist (котви към HEAD `77936fc`; Колегата ги отваря преди да пише — редовете се местят, съди се по
ИЗРЕЧЕНИЕ):**

1. **`skills/review/SKILL.md`** — (a) `:197-240` (цялата секция Step 2a, от заглавието до дуала
   включително) → блок A дословно; (b) `:326-375` (цялата секция Step 2c) → блок C дословно; (c)
   `:380-382` изречението „It is the pass `docs/WORKFLOW.md` § Plan readiness review describes: every
   `file:line` opened, every command run on the real tree, not one "if the Writer finds ..."."“ → блок
   D1; (d) `:292-294` в третата fact-check инструкция, под-точка (3): след „(a name, a grant, a layout,
   a flag, an order of operations)“ се добавя „; for every write the ticket adds or changes, the lock
   that holds it and what runs beside it - a race left as an accepted residual is an open decision,
   class 15“ (фразата „(a name, … order of operations)“ днес е пренесена на `:293-294`; вмъкването е след
   затварящата скоба; „class 15“ на един ред); (e) `:402-403` „the six columns are the six readiness
   checks, and `order` carries the dry process trace of the gates.“ → „the six columns are the six
   readiness checks; `order` carries the dry process trace of the gates, and `discovery` names, for every
   write the ticket adds or changes, the lock that holds it and what runs beside it (class 15) - its
   clean form is `0 - no write with a concurrent caller`, never a bare `none`.“ („class 15“ на един ред);
   (f) `:486-487` краят на абзаца в Step 2e „… such a project has no plan canon in git at all - a
   configuration this rule does not serve and the self-check does not detect.“ → блок E1; `:491-492`
   последното изречение „… and observes in the same way whether git ignores `{{config.paths.scratchDir}}`
   at all.“ → завършва „… and observes in the same way whether git ignores `{{config.paths.scratchDir}}` at
   all, and whether `{{config.paths.plansDir}}` lies under it.“ (фразата „whether
   `{{config.paths.plansDir}}` lies under it“ на един ред); (g) `:505-506` „Steps 2a, 2c, 2b and 2d in
   that order: the behavior ledger, the consequence scan, the fact-check gate and the COO's own pass.“ →
   „Steps 2a, 2c, 2b and 2d in that order: the behavior ledger and the consequence scan (one dispatch, two
   tables), the fact-check gate and the COO's own pass.“; (h) `:563-565` (Plan-readiness mode, bullet-ът
   „Each pass reads the **whole plan** …“): „hidden discovery/architecture“ →
   „hidden discovery/architecture (for every write, the lock and what runs beside it - class 15)“ — на един ред.
2. **`docs/WORKFLOW.md`** — (a) `:403` редът „pass, one scan-tier agent per ticket (`/pnp:review` Step
   2c) takes every decision, invariant and“ се заменя с ТРИ реда, дословно (пренесени; следващият ред
   „risk-threshold line of the ticket …“ остава):
   ```
   pass, a scan-tier agent per ticket - before the first pass the Step 2a agent,
   the same context that writes the behavior ledger, in the same dispatch; before a further pass a
   dispatch of its own (`/pnp:review` Step 2c) - takes every decision, invariant and
   ```
   (b) `:420-424` от „a SEPARATE turn against the six readiness checks below: every“ до „guarantee
   checked against the code that gives it.“ (на `:424`) → блок D2; (c) `:508` „3. no hidden discovery or
   unresolved architectural decision remains;“ → блок D3; (d) `:578-581` — целият bullet „**A factual
   claim about existing code carries a `file:line` pointer** …“ (четирите реда) → блок F1 дословно (пас 1
   блокер 1 и делта scan ред 38: началото казва КОЙ носи указател, средата — „a factual claim it acts
   on“ вместо „any factual claim“ — и краят — КЪДЕ се дължи — говорят в един обхват); (e) `:390-399`
   абзацът „**The inventory comes before the
   draft.**“ — след последното изречение („… what the cheapest one proves.“) се добавя блок F2; (f)
   `:783-784` двата реда на bullet-а „- **Pass statistics** - …“ в скелета → блок T (двата реда, байт по
   байт както в шаблона; скелетът остава равен на `templates/PNP_CANDIDATES.md.tmpl` целия); (g)
   `:913-917` от „READ - zero repo writes, zero DB operations, zero paid auditor passes. The machine-wide
   "exactly one“ до „written in the honest-limits register.“ → блок B (D3: изречението за „one live
   auditor“ пада, останалото непроменено).
2a. **`docs/REVIEW_CHECKLIST.md:31-32`** — изречението „Check only that the plan matches the repository,
   has clear scope, contains no hidden discovery or / unresolved architecture, sequences executable work
   correctly, …“: след „unresolved architecture“ (`:32`) се вмъква „ (for every write, the lock and what
   runs beside it - class 15)“ — „class 15“ на един ред; нищо друго във файла (D4: кратките списъци
   назовават категориите; дефиницията живее във WORKFLOW).
3. **`templates/ORCHESTRATOR.md.tmpl`** — (a) `:173-178` първият абзац на § Behavior ledger duty → блок
   O1; (b) `:188-191` началото на абзаца „**The consequence scan and the own pass ride the same
   duty.**“ до „… is a file stamped with the plan's SHA-256 (Step 2d).“ → блок O2 (останалото от абзаца —
   „The brief names both …“ до „The same suppression dual holds.“ — непроменено). § Data discipline не
   се пипа (D3). Нищо друго в шаблона (acceptance: два хънка — `:173-178`, `:188-191`).
4. **`templates/PNP_CANDIDATES.md.tmpl:13-14`** → блок T (двата реда).
5. **`docs/READINESS_CLASSES.md`** — (a) `:3-5` уводният абзац → блок R1; (b) след `:26` (ред 14) нов
   ред → блок R2; `:28` остава.
6. **`scripts/setup/generate.mjs`** — (a) на `:908`, непосредствено след затварящата скоба на
   `existingPlansWarning` (`:881-907`) и преди doc блока на `existingOverridesWarning` (`:909`), нов
   export, дословно (`path` е вече импортиран в модула — Колегата проверява името на import-а):
   ```js
   /**
    * One warning line, or null: paths.plansDir lies under the scratch directory. A plan canon there
    * is outside git wherever the scratch directory is ignored (/pnp:review Step 2e). A warning, never a
    * refusal - the schema admits any string and the operator may mean exactly this. Pure and lexical:
    * "." and ".." segments are folded; on a project whose `os` is windows (windowsPaths) backslashes
    * are separators and case is folded, as that file system and git's ignore matching fold them
    * there; on linux and macos the paths are compared as written (a volume's case rule is not in the
    * config, and a lexical test does not guess it); nothing is resolved against the file system. The
    * same test lives in scripts/selfcheck/aiwf-selfcheck.js (plansDirUnderScratch) - the self-check
    * imports nothing from setup.
    */
   export function plansDirUnderScratchWarning({ plansDir, scratchDir = '.aiwf', windowsPaths = false }) {
     const norm = (p) => {
       const s = windowsPaths ? String(p).replace(/\\/g, '/').toLowerCase() : String(p);
       return path.posix.normalize(s).replace(/\/+$/, '');
     };
     const a = norm(plansDir);
     const b = norm(scratchDir);
     if (!a || !b || a === '.' || b === '.') return null;
     if (a !== b && !a.startsWith(b + '/')) return null;
     return `paths.plansDir ${plansDir} is under the scratch directory ${scratchDir} - a plan canon there is outside git wherever the scratch directory is ignored; pick a tracked path (/pnp:review Step 2e)`;
   }
   ```
   (b) `:1469-1472` вътре в блока, след `if (warning) notes.push(warning);` (`:1471`) нов ред: `const
   underScratch = plansDirUnderScratchWarning({ plansDir: merged.paths.plansDir, scratchDir:
   merged.paths.scratchDir, windowsPaths: merged.os === 'windows' }); if (underScratch)
   notes.push(underScratch);` (`merged.os` е вече валидиран на `:986`); (c) `:881-888` коментарът
   над `existingPlansWarning` („THE TWO WARNINGS SETUP OWES“ и изброяването) казва три — третото е
   plansDir под scratch directory (scan ред 27).
7. **`scripts/setup/interview.mjs`** — (a) `:62` import-ът получава `plansDirUnderScratchWarning`; (b)
   `:219-222` `warn: (value) => existingPlansWarning({ projectRoot, plansDir: value }),` → `warn: (value)
   => plansDirUnderScratchWarning({ plansDir: value, windowsPaths: os === 'windows' }) ??
   existingPlansWarning({ projectRoot, plansDir: value }),` (`os` е локалната константа от въпроса `os`
   на `:158`, зададен преди пътищата; D7: `scratchDir` е `const` в схемата, подразбиращото се `.aiwf` на
   helper-а е единствената възможна стойност; `??` вече се ползва в `generate.mjs`, Node `v24`); (c)
   `:13-19` хедърът, който
   изброява двете предупреждения на интервюто → три, с един ред за plansDir под scratch directory.
7a. **`skills/setup/SKILL.md:94-109`** — абзацът „can print one warning line“ с двете предупреждения и
   „Neither is a blocker: both …“ → трето bullet „`paths.plansDir` under the scratch directory - a plan
   canon there is outside git wherever the scratch directory is ignored (/pnp:review Step 2e); the
   generator repeats it as a note“ и „None is a blocker: all three …“ (scan ред 27). Нищо друго в скила;
   новият текст не носи `--flag` токен — `setupFlagFindings` в self-check-а чете всеки `--…` в този скил
   и го търси в setup CLI-то (ledger I1).
8. **`scripts/setup/test-setup.mjs`** раздел 12b (`:623-686`) и нов раздел 12c след него — шест нови
   `check`-а, имената дословно (acceptance ги търси в изхода), плюс (e) и (f): (a) `plansDirUnderScratchWarning: under -> warning,
   outside and the prefix trap -> null` — `plansDirUnderScratchWarning({ plansDir: '.aiwf/plans' })` е
   низ, който съдържа `is under the scratch directory .aiwf`; `{ plansDir: '.aiwf' }` — низ; `{ plansDir:
   'docs/../.aiwf/plans' }` — низ (`..` се свива); `{ plansDir: '.aiwf\\plans', windowsPaths: true }` —
   низ (Windows разделител); `{ plansDir: '.aiwf\\plans' }` → `null` (без флага backslash е знак от
   името); `{ plansDir: '.AIWF/plans', windowsPaths: true }` — низ (регистърът се свежда); `{ plansDir:
   '.AIWF/plans' }` → `null` (без флага — друга директория); `{ plansDir: 'docs/backlogs' }` → `null`;
   `{ plansDir: '.aiwfx/plans' }` → `null` (капанът на префикса); `{ plansDir: '.aiwf/../docs/plans' }` →
   `null` (излиза от scratch) — десет входа, всеки с детерминиран отговор на всяка платформа (нищо не
   чете `process.platform`); проверките (a), (b), (c) и (g) живеят в НОВ раздел `12c` след края на 12b
   (`:686`), над свой проект `const p3 = project('under-scratch')` — проектът `p` на 12b е вече
   инсталиран от `real` (`:668`) и не става за нов dry-run (fact-check r4 gap A3); (d) остава в clean
   блока на 12b (`:673-686`); (b) `the interview warns at the plans
   question when plansDir is under the scratch directory` — скриптирано интервю по образеца на
   `:640-644` (`runInterview({ schema: loadSchemaJson(), ask: <ask>, projectRoot: p3, out: { write: (s) =>
   said.push(s) } })`, `heard = said.join('')`), с `ask = (q) => q.startsWith('Plans directory') ?
   '.aiwf/plans' : scriptedAsk(q)` — `ask` получава ТЕКСТА на въпроса („Plans directory (the PARENT of
   …)“, `interview.mjs:219`), не ключа; `heard` съдържа `is under the scratch directory .aiwf`; (c) `the
   dry-run carries the under-scratch note` — `install(p3, answers, ['--no-seeds', '--dry-run'])` по образеца
   на `:659-666` (answers — по-долу); `dry.status === 0` и `dry.out` съдържа `note   paths.plansDir
   .aiwf/plans is under the scratch directory .aiwf` (измерено 2026-10-04 на fixture под scratchpad с
   живия payload: такъв dry-run днес излиза 0 без нито един `note` ред и планира `mkdir
   .aiwf/plans/active|archive|drafts|readiness` — containment-ът не отказва, затова редът е
   предупреждение, не отказ; D7); (d) контрола върху чистия проект (блокът `:673-686`, проверката „a clean
   project hears nothing about plans or an overrides document“ на `:681-683`): нов `check` `a plansDir
   outside the scratch directory hears no under-scratch warning` —
   `!said.join('').includes('under the scratch directory')` и `!dry.out.includes('under the scratch
   directory')` (съществуващите контроли остават; тази не може да падне сама — (b) и (c) са обръщащите ѝ
   лица); (e) `:48` import-ът от `generate.mjs` (днес `renderTemplate, scanSupersededLegacy, sha256,
   templateContext`) получава `plansDirUnderScratchWarning` (ledger A5); (f) `:31-33` — т.10 от хедърния
   коментар на файла, който изброява двете предупреждения → три (ledger A14); (g) `os` окабеляването, две
   проверки с имена дословно (fact-check r4 gap A5): `the os flag reaches the interview: a linux project
   hears no under-scratch warning for .AIWF/plans` — две скриптирани интервюта над `p3` с `ask = (q) =>
   q.startsWith('Operating system') ? 'linux' : q.startsWith('Plans directory') ? '.AIWF/plans' :
   scriptedAsk(q)` → `heard` НЕ съдържа `under the scratch directory`, и същото с `'windows'` за
   `Operating system` → `heard` съдържа `is under the scratch directory .aiwf` (интервюто само пита —
   нищо не се записва, затова `os: linux` върви и на Windows хост); `the os flag reaches the generator:
   .AIWF/plans is under scratch on a windows project and outside on a linux one` — `install(p3, { ...baseAnswers(), os: 'windows', paths: { scratchDir: '.aiwf', plansDir: '.AIWF/plans', overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' } }, ['--no-seeds', '--dry-run'])` → `dry.status === 0` и `dry.out` съдържа `note   paths.plansDir .AIWF/plans is under the scratch directory .aiwf`; същото с `os: 'linux'` → `dry.status === 0` и `dry.out` НЕ съдържа `under the scratch directory` (dry-run планира, не пише — linux-os план на Windows хост е само текст; `assertSupportedOs` го приема). За (c): `install(p3, answers, ['--no-seeds',
   '--dry-run'])` с `answers = { ...baseAnswers(), paths: { scratchDir: '.aiwf', plansDir: '.aiwf/plans',
   overridesDoc: 'docs/ai/PROJECT_OVERRIDES.md' } }` — `...overrides` заменя целия top-level ключ (ledger
   A10). `SCRIPTED_ANSWERS` картата НЕ се пипа (scan ред 28: промяна там обръща assertion-ите на `:608`,
   `:653` и `:681-683`); `scriptedAsk` няма needle за въпроса `os` и `choice` взема default-а `windows`
   (делта scan ред 68) — затова (b)-(d) не зависят от флага, а (g) го подава изрично.
9. **`scripts/selfcheck/aiwf-selfcheck.js`** — (a) модулна чиста функция непосредствено СЛЕД
   затварящата скоба на `scratchIgnored` (`:5127`) — не преди нея: коментарът `:5104-5112` и константите
   `:5116-5120` документират `scratchIgnored` (scan ред 25) — дословно (`path` е `require`-нат в модула;
   Колегата проверява името):
   ```js
   // Lexical prefix test, no git and no file system: is plansDir the scratch directory or under it?
   // "." and ".." segments are folded; on a project whose `os` is windows (windowsPaths) backslashes
   // are separators and case is folded, as that file system and git's ignore matching fold them
   // there; on linux and macos the paths are compared as written (a volume's case rule is not in
   // the config, and a lexical test does not guess it). The same test lives in
   // scripts/setup/generate.mjs (plansDirUnderScratchWarning); the self-check imports nothing from setup.
   function plansDirUnderScratch(plansDir, scratchDir, windowsPaths = false) {
     const norm = (p) => {
       const s = windowsPaths ? String(p).replace(/\\/g, '/').toLowerCase() : String(p);
       return path.posix.normalize(s).replace(/\/+$/, '');
     };
     const a = norm(plansDir);
     const b = norm(scratchDir);
     if (!a || !b || a === '.' || b === '.') return false;
     return a === b || a.startsWith(b + '/');
   }
   ```
   (b) след `scratch-ignored` (`:5466-5467`) четвърто наблюдение: `addObservation('plans-under-scratch',
   'plansDir under scratchDir (observed)', typeof paths.plansDir !== 'string' || typeof paths.scratchDir
   !== 'string' || !['windows', 'linux', 'macos'].includes(cfg.os) ?
   'config paths or os unusable - nothing to observe' :
   plansDirUnderScratch(paths.plansDir, paths.scratchDir, cfg.os === 'windows') ? `under the scratch
   directory ${paths.scratchDir} - nothing there is the Git canon while the scratch directory is ignored
   (/pnp:review Step 2e)` : 'outside the scratch directory');` (`cfg` е разпарсеният конфиг на
   `projectLayerFindings` — `const cfg = readJson(cfgPath)` на `:5137`, от който идва и `paths` на
   `:5438`; `os` е задължително enum поле на схемата с точни малки букви (`windows`, `linux`, `macos`),
   затова guard-ът е точно този enum (пас 2 блокер 1: guard „низ ли е“ пускаше `os: 'solaris'` до
   категоричното „outside“) и `=== 'windows'` е точното сравнение — конфиг без `os` или със стойност
   извън трите (вкл. друг регистър като `Windows`) печата текста „unusable“ и пада в
   `config-schema-valid` (`:5497-5503`), не твърди „outside“; setup-ът, за разлика от self-check-а, слива
   schema default-ите — там липсващ `os` е `windows` по `collectDefaults`; делта scan редове 58, 59);
   коментарът `:5464-5465` „Observed, never failed“ покрива и него; (c) `sectionDraftsObservations`
   (`:5533-5657`): коментарът `:5527-5532` „The three (observed) project-layer rows“ → „The four
   (observed) project-layer rows“, „Four fixtures flip the text (S1<->S2 …, S3<->S4 …)“ → „Six fixtures
   flip the text (S1<->S2 for the two directories, S3<->S4 for the ignore observation, S7<->S8 for the
   plansDir observation)“; S6
   (`:5614-5656`): към очакваните редове за S1 и за S2 се добавя `'  [NOTE] plansDir under scratchDir
   (observed) - outside the scratch directory'` (базата има `docs/backlogs`), броячът `:5653` `o.grew !==
   3` → `!== 4` и текстът му „not 3“ → „not 4“; нов `[drafts-S7]` преди затварящата скоба `:5657`:
   fixture = `writeFixture(root, pluginVersion)` в нова директория, после `mutateJson(root, ['.claude',
   'aiwf-native', 'aiwf.config.json'], (c) => { c.paths.plansDir = '.aiwf/plans'; })` (hoisted функция на
   `:8066`, пренаписва с `JSON.stringify(j, null, 2)`; ledger B14), през `projectLayerFindings(fixture,
   PLUGIN_ROOT, { selfAuthored: true })` намерен по `id` `plans-under-scratch` → `detail` започва с `under
   the scratch directory .aiwf` (извън `captured()` — нищо не се печата, нищо не се брои; другите находки
   на този fixture — `path-plans`, `plans-active-subdir` — падат вътре в масива и не се четат); S8 =
   същата проверка над непроменената база с име `[drafts-S8] base plansDir docs/backlogs -> "outside the
   scratch directory"` → `detail === 'outside the scratch directory'` (S7↔S8 обръщат текста); S7 е ЕДИН
   `check` с име `[drafts-S7] plansDir .aiwf/plans -> "under the scratch directory"; the prefix helper on
   ten inputs` и носи и матрицата на helper-а: `plansDirUnderScratch('.aiwf/plans', '.aiwf') === true`, `('.aiwf', '.aiwf')
   === true`, `('docs/../.aiwf/plans', '.aiwf') === true`, `('.aiwf\\plans', '.aiwf', true) === true`,
   `('.aiwf\\plans', '.aiwf') === false`, `('.AIWF/plans', '.aiwf', true) === true`, `('.AIWF/plans',
   '.aiwf') === false`, `('.aiwfx/plans', '.aiwf') === false`, `('docs/backlogs', '.aiwf') === false`,
   `('.aiwf/../docs/plans', '.aiwf') === false` (десет входа, нищо не чете `process.platform` — еднакви на
   трите CI крака); и `os` окабеляването през реалната находка: fixture като S7, но `paths.plansDir =
   '.AIWF/plans'` при `os: 'windows'` (базата на `writeFixture` е `os: 'windows'`, `:536`) → `detail`
   започва с `under the scratch directory`; същият fixture с `c.os = 'linux'` → `detail === 'outside the
   scratch directory'` (двете лица на флага през `cfg.os`, не през хоста); същият fixture с `delete c.os`
   → `detail === 'config paths or os unusable - nothing to observe'` (обръщащото лице на „unusable“
   клона; `config-schema-valid` в същия масив е червена, но не се чете — fact-check r4 gap A4); същият
   fixture с `c.os = 'solaris'` (низ извън enum-а) → същото
   `detail === 'config paths or os unusable - nothing to observe'` (пас 2 блокер 1: guard „низ ли е“
   би дал тук `outside the scratch directory` — това лице пада на него); S8 =
   `byId(s2, 'plans-under-scratch')` над S2 fixture-а (`byId` на `:5537` пуска `projectLayerFindings`
   наново при всяко търсене — както S1/S2 днес; делта scan ред 64, fact-check r4 gap A2); всяко
   извикване на `projectLayerFindings` над fixture с `.aiwf/` пуска `scratchIgnored` → `git check-ignore`
   с хост конфига, 15 s timeout, грешките стават текст; (d) обобщаващата проза `:8318-8321` („The
   three (observed) rows - plans drafts/, plans readiness/ and whether git ignores the scratch
   directory“, удар `:8318`) → „The four (observed) rows - plans drafts/, plans readiness/, whether git
   ignores the scratch directory and whether plansDir lies under it“ (изречението е разделено между два
   `console.log` литерала — редактира се в двата); името на S6 проверката `:5655` носи „three (observed)“
   → „four (observed)“. **`skills/selfcheck/SKILL.md:44-45`** („The three /
   project-layer rows whose name carries `(observed)` are observations instead“ — пренесено на два реда)
   и **`scripts/selfcheck/README.md:40-41`** (същото изречение): „three“ → „four“, по едно изречение.
10. **`README.md:22`** `**v0.2.16. Public since 0.2.0.**` → `**v0.2.17. Public since 0.2.0.**`.
11. **Издание 0.2.17:** `migrations/0021_lean-readiness/ops.json` дословно блок OPS; `NOTES.md` дословно
    блок M; `migrations/index.json:21` получава запетая и нов последен запис `{ "id":
    "0021_lean-readiness", "targetPluginVersion": "0.2.17" }` преди `]`; `.claude-plugin/plugin.json:3` →
    `"version": "0.2.17",`; `CHANGELOG.md` блок CL над `## [0.2.16]` (датата = денят на кодовия commit;
    сверява се при тага); самоъпдейт `node scripts/update/aiwf-update.mjs --apply --project-root .`
    (печата „updated: 0.2.16 -> 0.2.17, 2 operation(s) applied.“; тих rerender на
    `.claude/aiwf-native/ORCHESTRATOR.md` — upstream == local; bookkeeping — версия и хеш в
    `aiwf.config.json`; `CHANGES_0.2.16-to-0.2.17.md`; интегрираният self-check; conflict диалог →
    СТОП). **РЕД:** worklist 1–10 → `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root .
    --project-fixture .` САМОСТОЯТЕЛНО (доказва S7/S8 и наблюдението, докато `version-stamp` е още зелен
    — интегрираният self-check след `--apply` включва новия код и червен резултат там излиза 1 СЛЕД
    записа; ledger C13) → bump + миграция → `--apply` → VERIFY (D12) → acceptance → handback.
    `version-stamp` е червен между bump-а и `--apply`; `--apply` само с bump-нат `plugin.json` пада в
    preflight-а („the LAST manifest entry targets 0.2.16 but the payload version is 0.2.17“).
    Bookkeeping дифът в `aiwf.config.json` след `--apply` е както при 0.2.16 — версия, `lastMigrationApplied`,
    хешът на ORCHESTRATOR.md, журналът; конфигът се пренаписва през `orderConfig` (ledger C11).
12. **Закриващи grep-ове (първо УДРЯТ списъка, после нула извън него; стойностите „на котвата“ са
    измерени 2026-10-04 на `77936fc`):** (a) `git grep -n "one agent per ticket" -- docs skills templates`
    — на котвата 5 удара: `docs/WORKFLOW.md:148`, `:386` и `skills/review/SKILL.md:275` (fact-check
    гейтът — „one agent per ticket section“, остават), `skills/review/SKILL.md:208` (Step 2a, остава в
    блок A), `:336` (Step 2c — изчезва с блок C); след: 6 удара — четирите останали + блок C в SKILL
    („one agent per ticket, two tables, no second dispatch“) + блок O1 в `templates/ORCHESTRATOR.md.tmpl`
    („one agent per ticket, two tables“), всеки отворен — нито един не описва две диспачвания за ledger
    и scan; (b) `git grep -c "^Dispatch it with the" --
    skills/review/SKILL.md` — на котвата `3` (2a, 2b, 2c), след `2` (2a, 2b); (c) `git grep -n 'file:line`
    opened' -- docs skills templates` — на котвата 2 (SKILL `:381`, WORKFLOW `:421`), след 0; (d) `git grep
    -n "start/stop" -- docs skills templates` — на котвата 3 (шаблон `:13`, WORKFLOW `:783`, `:915`); след:
    празно, `rc=1` (блок T и блок B ги махат; D3); `git grep -n "live auditor" -- docs skills templates` —
    на котвата 1 (WORKFLOW `:914`), след празно; (e) `git grep -n
    "three (observed)" -- scripts/selfcheck/aiwf-selfcheck.js` — на котвата 3 (`:5527`, `:5655`, `:8318`),
    след 0; `git grep -n "(observed)" -- skills/selfcheck/SKILL.md scripts/selfcheck/README.md` — на котвата
    по един удар (`:45`, `:41`; броят „three“ е на предния ред — пренос), след: същите два удара, всяко
    изречение отворено и казва „four“; (f) `git grep -c "the fifteenth on" -- docs/READINESS_CLASSES.md` —
    на котвата без изход (`rc=1`), след `1`; „fourteenth“ ОСТАВА в увода (блок R1 го запазва) и
    „fourteen“ в CHANGELOG/migrations е история — не се търси нула.

**Блок A (`skills/review/SKILL.md`, Step 2a — дословно, замества цялата секция):**

~~~~
## Step 2a - Behavior ledger and consequence scan before a readiness pass: one agent, two tables

**Before the first paid readiness pass of a durable plan, the COO dispatches ONE scan-tier agent per
ticket that reads the CODE every chain of the ticket's Outcome passes through AND reads the TREE
against the plan's decisions, and returns two tables from one context.** The first is the behavior
ledger - what each link does with the plan's input, read by a second context rather than remembered
by the plan's author. The second is the consequence scan of Step 2c - for every decision, the
surface that can violate it by a path the plan never opened. One dispatch carries both because both
are read off the same tree in the light of the same ticket, and under the earlier contract the
second agent opened the files the first had just read; the tables stay two files because they have
two readers - the plan gate checks the scan, the COO's own pass reads the ledger. At
`review.plan.passes: 0`, where no auditor pass runs, both tables are owed all the same, before the
plan is presented for execution approval: they, the fact-check gate and the COO's own pass over all
of it (Step 2d) are then the whole contract (`docs/WORKFLOW.md` § Plan readiness review).

Dispatch it with the **Agent tool**, `subagent_type: "Explore"` (or whichever read-only scan agent
this harness ships), `model: sonnet` - named explicitly, never inherited - one agent per ticket,
with exactly this task, verbatim:

```
You read CODE and the TREE, not the plan's claims. Input: the plan's decisions section and one
ticket's section - its Outcome sentences, its worklist pointers and the decisions that apply to it -
below. Return TWO tables, one after the other, each under a line that reads exactly `LEDGER` or
`SCAN`. No verdict, no suggestions, no summary in either.

LEDGER. For EVERY link a chain from the entry point to the endpoint passes through - every function,
action, hook, query, component, template, test the pointers name or that the code at a pointer
calls - open it and return ONE row:
<#> | <behavior sentence> | <link file:line> | DOES: what it validates / rejects / overwrites /
reads / writes / renders with the plan's input | CLOSES OVER: what state it captures and when it
is recreated (memo deps, refs, module scope) | STATES: what happens at empty / one / N rows,
concurrent callers, error path, rerun | LIB: node_modules path:line for any library behavior the
plan relies on | NOTE: anything the plan assumes that the code does not do
A link the plan CREATES (a file that does not exist yet) is one row with `NEW <path>` in DOES and
the contract it must satisfy in NOTE. A link you cannot open is one row with `UNREAD <reason>` in
DOES. A chain that ends before a source or a render-or-DB-write surface is reported as
`CHAIN ENDS EARLY at <file:line>`. Every link is a row.

SCAN. For EVERY decision, rule, invariant and risk-threshold line that applies to this ticket,
search the tree for a surface that can VIOLATE it: a screen, an action, an endpoint, a query, an
import, a bulk or batch path, a migration, a script, a fixture, another command or hook - anything
that reaches the same data, permission, command or contract by a path the plan does not mention.
For every field, file, flag or contract the plan locks or changes, find every OTHER path that
writes or reads it. Return ONE row per surface:
<#> | <ticket> | <decision, quoted short, with its plan line> | <surface file:line> | <how it
violates or bypasses the decision, one sentence> |
(the last cell stays empty - it is the COO's). A decision for which you found no violating
surface is one row with `none found - <what you searched>` in the surface cell and `none` in
the violation cell. Every surface is a row.

PLAN DECISIONS:
<the plan's decisions section, pasted>

TICKET:
<the ticket's section - Outcome, worklist, acceptance - pasted>
```

The COO records the LEDGER rows under the header
`| # | behavior | link (file:line) | DOES | CLOSES OVER | STATES | LIB | NOTE |` in
`{{config.paths.plansDir}}/readiness/<ABBR>/ledger.md`, and the SCAN rows in
`{{config.paths.plansDir}}/readiness/<ABBR>/consequence-scan.md` under the header and the closure
rule of Step 2c (Step 2e names the other files and the one case in which
`{{config.paths.scratchDir}}/plan/<ABBR>/` stands in). An empty DOES cell or an `UNREAD` row is
closed before the pass: the COO reads that link itself, or re-dispatches. The NOTE cells are the
input of the COO's own pass (`docs/WORKFLOW.md` § Plan readiness review). The ledger is not an
auditor: it returns no verdict and it is never counted as a pass.

**Its suppression dual.** Small R1 and non-durable R2 work owe no ledger - they receive no
readiness review at all (`docs/WORKFLOW.md` § Plan readiness review).
~~~~

**Блок C (`skills/review/SKILL.md`, Step 2c — дословно, замества цялата секция):**

~~~~
## Step 2c - Consequence scan before a readiness pass

**Before every paid readiness pass of a durable plan - and, at `review.plan.passes: 0`, before the
plan is presented for execution approval - every decision of the plan has been read from the TREE's
side: the second table of the Step 2a agent.** The behavior ledger and the fact-check gate (Step 2b)
read what the plan SAYS; the SCAN half of the Step 2a task looks for what it does not say - a surface
that can violate a decision by a path the plan never opened (`docs/WORKFLOW.md` § Plan readiness
review; it asks classes 1, 10 and 14 of `docs/READINESS_CLASSES.md` from the tree's side). Before the
FIRST pass the scan rides the Step 2a dispatch - one agent per ticket, two tables, no second
dispatch. Before every FURTHER readiness pass the scan runs again over the decisions the revision
changed or added - the revision is where new surface is born (class 14) - as a dispatch of its own:
the same agent kind and model, carrying the SCAN half of the Step 2a task alone over those
decisions - the Step 2a task with its LEDGER paragraph removed and its first paragraph reading
"Return ONE table under a line that reads exactly `SCAN`", the two inputs unchanged; its rows are
APPENDED to the same file - numbering continues, the earlier rows stay. A
link a revision adds to the worklist is a ledger row the COO reads itself or re-dispatches, exactly
as Step 2a says of an empty DOES cell.

The COO records the rows - each with a leading and a trailing `|` - in ONE file per plan under the
header `| # | ticket | decision | surface | violation | closure |`, numbered from 1 -
`{{config.paths.plansDir}}/readiness/<ABBR>/consequence-scan.md` (Step 2e) - and closes
EVERY row before the pass, in the `closure` cell: `plan: <what changed, with its plan line>` or
`no defect: <why, with file:line>`. Every table in the file that starts with the `#` and `ticket`
columns carries exactly this header - a delta scan repeats it - or the plan gate refuses the file.
**A closure that starts with neither prefix is an open row**, and no other cell may be empty - a
`none found` row writes `none` in its violation cell; a `|` inside a cell is written `\|`. Every
ticket the pass audits has at least one row: a ticket on which the agent found no violating surface
keeps its `none found` row, closed. The scan is not an auditor: it returns no verdict and it is never
counted as a pass.

**Its suppression dual.** Exactly the behavior ledger's: small R1 and non-durable R2 work owe no scan
- they receive no readiness review at all.
~~~~

**Блок D1 (`skills/review/SKILL.md`, Step 2d, второто изречение на първия абзац — дословно):**

```
It is the pass `docs/WORKFLOW.md` § Plan readiness review describes: every pointer the Writer acts on
opened - the worklist, the guards, the commands - while the pointers that only explain are the
fact-check gate's; the ledger rows read as behavior, not as pointers; every instrument run on the
real tree with valid AND broken input; not one "if the Writer finds ...".
```

**Блок D2 (`docs/WORKFLOW.md`, § Plan readiness review, абзацът „The COO's own pass comes before every
counted pass“ — от „a SEPARATE turn against the six readiness checks below:“ до „checked against the
code that gives it.“ — дословно):**

```
a SEPARATE turn against the six readiness checks below: every pointer the Writer acts on opened - the
worklist, the guards, the commands - while the pointers that only explain are the fact-check gate's (a
FALSE row carries the correct value); the ledger rows read as behavior, not as pointers; every
instrument executable on the OS channel the plan records and run on the real tree with valid AND
broken input, never on a stub (an instrument proven on a stub has not been made to fail where it
will run - tripwire 4 of § COO owns broad scans); not one "if the Writer finds ..."; every promise of
a guarantee checked against the code that gives it.
```

**Блок D3 (`docs/WORKFLOW.md`, § Plan readiness review, списъкът „The readiness review checks only“,
точка 3 — дословно):**

```
3. no hidden discovery or unresolved architectural decision remains - for every write the plan
   adds or changes, the lock that holds it and what runs beside it are named (`docs/READINESS_CLASSES.md`
   class 15: a race left as an accepted residual is an open decision);
```

**Блок F1 (`docs/WORKFLOW.md`, § Ticket brief contract — целият bullet на `:578-581`, дословно, с
отстъпа на списъка):**

```
- **A factual claim the Writer acts on carries a `file:line` pointer** - or is marked explicitly
  unverified, for the Writer to check. A claim dictated from memory of the design instead of read
  from the source comes back as a review blocker; a brief that instructs the Writer to read the
  source before writing a factual claim it acts on produces zero factual errors.
  Where the pointer is owed is where the Writer ACTS or an acceptance check READS - a worklist line,
  a guard, a command; context that only explains cites the section and the symbol, because a line
  number in prose goes stale with the next commit and costs the fact-check gate a re-verification at
  every revision for nothing anyone acts on.
```

**Блок F2 (`docs/WORKFLOW.md`, § Plan readiness review, краят на абзаца „The inventory comes before the
draft“ — дословно, добавя се след „what the cheapest one proves.“):**

```
What the draft then carries of those pointers follows one discipline: `file:line` where the Writer
acts or an acceptance check reads - the worklist, the guards, the commands - and section and symbol
everywhere else, because a line number in context is re-verified by the fact-check gate at every
revision and invalidated by the next commit; on one consumer's plan
629 pointers opened by agents in the own pass yielded 4 FALSE after the gate had already run, while
the auditor's blockers were mostly design and concurrency.
```

**Блок O1 (`templates/ORCHESTRATOR.md.tmpl`, § Behavior ledger duty, първият абзац — дословно):**

```
Before the first paid readiness pass - and, when no auditor pass is configured, before the plan is
presented for execution approval - every link of every chain the plan's Outcome passes through has
a row produced by a SEPARATE scan-tier context: what the link does with the plan's input, what it
closes over, what it does at N rows and under concurrent callers, and what the library underneath
it does - and the same context, in the same dispatch, reads every decision of the plan from the
tree's side and returns the surfaces that can violate it, as a second table. `/pnp:review` Step 2a
carries the agent's task and its dispatch - one agent per ticket, two tables; the task is not
restated here. The COO reads the rows, not the pointers, and acts on what they say BEFORE the
dispatch.
```

**Блок O2 (`templates/ORCHESTRATOR.md.tmpl`, § Behavior ledger duty, началото на абзаца „The consequence
scan and the own pass ride the same duty“ до „(Step 2d).“ — дословно; продължението „The brief names
both, …“ остава):**

```
**The consequence scan and the own pass ride the same duty.** Before the same pass, every decision
of the plan has been read from the tree's side by that same separate context - the second table of
the Step 2a dispatch, and before a further pass a scan over the revision's decisions (`/pnp:review`
Step 2c) - and every row it returned is closed, and the COO's own pass - the last act over the plan,
in a turn of its own - is a file stamped with the plan's SHA-256 (Step 2d, which says what that pass
opens, reads and runs; it is not restated here).
```

**Блок R1 (`docs/READINESS_CLASSES.md`, уводният абзац — дословно):**

```
The classes below were measured on the readiness cycles of consumer projects: the first thirteen
classes were each a paid pass-1 blocker at least once, most of them in more than one project; the
fourteenth was measured between passes, on the blockers a revision itself created; the fifteenth on
a second pass, where two of the four blockers born of the revision were a race or a lock decision the
plan had left as an accepted residual.
```

**Блок R2 (`docs/READINESS_CLASSES.md`, нов ред след ред 14 — дословно, един ред):**

```
| 15 | concurrency decision left as an accepted residual | For every write the ticket adds or changes: which lock holds it and what runs beside it - does the plan NAME them? A race or a lock-order question on a path the ticket writes that the plan closes with "accepted residual", "rare" or "the Writer will see" is an open decision, and no pass accepts it. |
```

**Блок T (`templates/PNP_CANDIDATES.md.tmpl` ред 13-14 и `docs/WORKFLOW.md` ред 783-784 в скелета —
дословно, два реда, байт по байт еднакви на двете места):**

```
- **Pass statistics** - one row per auditor pass: which pass it was and what it cost as the engine
  reported it.
```

**Блок B (`docs/WORKFLOW.md` § Branch policy, редове 913-917 — дословно, два реда):**

```
READ - zero repo writes, zero DB operations, zero paid auditor passes. It is an OPERATOR-HELD
invariant (no hook can see sibling sessions), written in the honest-limits register.
```

**Блок E1 (`skills/review/SKILL.md`, Step 2e, краят на абзаца за игнориран plansDir — дословно,
замества „a configuration this rule does not serve and the self-check does not detect.“):**

```
a configuration this rule does not serve. The self-check observes a `{{config.paths.plansDir}}`
under `{{config.paths.scratchDir}}` (a note, never a failure - the project is within its rights) and
`/pnp:setup` warns at the plans question - a lexical prefix test over the configured paths, which
folds case and backslashes on a project whose `os` is windows and asks git nothing;
any other ignored path is detected by neither.
```

**Блок OPS (`migrations/0021_lean-readiness/ops.json` — дословно; note текстът на един ред):**

```json
{
  "migration": "0021_lean-readiness",
  "targetPluginVersion": "0.2.17",
  "operations": [
    {
      "op": "rerender-managed-region",
      "file": ".claude/aiwf-native/ORCHESTRATOR.md",
      "region": null,
      "template": "templates/ORCHESTRATOR.md.tmpl"
    },
    {
      "op": "note",
      "id": "lean-readiness",
      "text": "<блок N по-долу, на един ред>",
      "docRefs": ["CHANGELOG.md", "skills/review/SKILL.md", "docs/READINESS_CLASSES.md"]
    }
  ]
}
```

**Блок N (текстът на `note` op-а — дословно, на един ред в ops.json; без двойни кавички вътре, за да
стои като JSON низ без escape — scan ред 32):**

```
The readiness cycle is leaner and sharper (LEAN-001). ONE AGENT: /pnp:review Step 2a dispatches one scan-tier agent per ticket that returns both the behavior ledger and the consequence scan - two tables, the two files unchanged (ledger.md and consequence-scan.md; the plan gate reads the second); the delta scan before a further pass is a dispatch of its own carrying the SCAN half. COUNTER PAIR: gone - a Pass statistics row records which pass it was and what it cost as the engine reported it, nothing asks the operator for a counter, and the one-live-auditor clause of WORKFLOW Branch policy, which held only while a pair was being recorded, is removed. CLASS 15: docs/READINESS_CLASSES.md - a race or lock decision a plan leaves as an 'accepted residual' is an open decision; the own pass names, for every write, the lock and what runs beside it (check 3, discovery). OWN PASS: it opens every pointer the Writer acts on, reads the ledger rows as behavior and runs every instrument with valid AND broken input - not 'every file:line opened'. POINTERS: a plan carries file:line where the Writer acts or acceptance reads, and cites context by section and symbol. PLANSDIR: the self-check observes a plansDir under the scratch directory (a note, never a failure) and /pnp:setup warns at the plans question - a lexical prefix test over the configured paths (case and backslashes fold on a project whose os is windows; git is not asked). YOUR LOCAL RULES: a local rule for any of these - one agent for ledger and scan, no counter pair, the concurrency class, the own-pass wording, the pointer discipline - can be removed or become a one-line pointer to /pnp:review Steps 2a-2d and docs/READINESS_CLASSES.md. YOUR TRANSFER SURFACE is yours and is not rewritten: its Pass statistics text stays as you have it and is yours to change; the template changes for new installations only.
```

**Блок M (`migrations/0021_lean-readiness/NOTES.md` — дословно):**

```
# 0021_lean-readiness

**The readiness cycle paid for two scan dispatches per ticket, asked for a counter pair nobody
needed, had no class for a race left as an "accepted residual", told the own pass to open every
`file:line`, and let a plan carry line numbers in prose.** Measured on consumer readiness cycles:
the author-side blockers did not fall with the pointer discipline of 0.2.15 - their class moved,
from pointers and acceptance to design and concurrency - and on one plan 629 pointers opened by
agents in the own pass yielded 4 FALSE after the fact-check gate had already run.

## What changes

- **Step 2a of `/pnp:review`** dispatches ONE scan-tier agent per ticket that returns the behavior
  ledger and the consequence scan as two tables from one context; the files stay two (`ledger.md`,
  `consequence-scan.md`) and the plan gate is untouched. **Step 2c** describes the second table, the
  closure grammar and the delta scan before a further pass (a dispatch of its own, SCAN half alone).
- **The Pass statistics row** records which pass it was and what it cost as the engine reported it;
  the counter start/stop pair is gone and nothing asks the operator for a counter. The template and
  the skeleton in `docs/WORKFLOW.md` § The transfer surface say so, and § Branch policy loses the
  "one live auditor" clause that held only while a pair was being recorded; your seeded transfer
  surface is yours and is not rewritten.
- **Class 15** in `docs/READINESS_CLASSES.md`: a concurrency decision left as an accepted residual is
  an open decision. Readiness check 3 (hidden discovery) names, for every write, the lock and what
  runs beside it - in `docs/WORKFLOW.md`, in the fact-check instruction and in the own pass's
  `discovery` cell. The own-pass table keeps its six columns.
- **Step 2d** says what the own pass does: every pointer the Writer acts on opened, the ledger rows
  read as behavior, every instrument run with valid AND broken input - not "every `file:line`
  opened"; `docs/WORKFLOW.md` § Plan readiness review says the same.
- **Pointer discipline** (`docs/WORKFLOW.md` § Ticket brief contract and § Plan readiness review): a
  plan carries `file:line` where the Writer acts or an acceptance check reads; context cites the
  section and the symbol.
- **A plansDir under the scratch directory** is observed by the self-check (`plansDir under
  scratchDir (observed)` - a note, never a failure) and warned about by `/pnp:setup` at the plans
  question - a lexical prefix test over the configured paths (case and backslashes fold on a
  project whose `os` is windows; git is not asked); any other ignored path is detected by neither.

## What this migration does

- **Re-renders `.claude/aiwf-native/ORCHESTRATOR.md`**: § Behavior ledger duty says one agent per
  ticket, two tables, and points to Step 2d for the own pass. An installation that never
  edited the file gets the new render silently; an
  edited file raises the usual conflict question; an artifact held through an override is not
  applied - the new render is recorded as upstream.
- **One `note`** saying the above. No hook entry, matcher, ask rule, schema key or directory
  changes; `scripts/engine/plan-gate.js` is unchanged.

## Superseded local rules

A local rule for one agent returning the ledger and the scan, for no counter pair, for a
concurrency readiness class, for the own pass opening what the Writer acts on, or for `file:line`
only where the Writer acts or acceptance reads can be removed or become a one-line pointer to
`/pnp:review` Steps 2a-2d and `docs/READINESS_CLASSES.md`.
```

**Блок CL (`CHANGELOG.md`, над `## [0.2.16]` — дословно, освен датата: Колегата пише деня на кодовия
commit (`2026-10-05` по-долу е примерна), сверява се при тага; acceptance регексът приема всеки ден):**

```
## [0.2.17] - 2026-10-05

The readiness cycle is leaner and sharper: one scan agent per ticket, no counter pair, a
class for the race left as an "accepted residual", an own pass that opens what the Writer acts on,
a plan that carries `file:line` where someone acts, and a self-check that sees a plansDir under the
scratch directory.

### Added

- **Readiness class 15 (LEAN-001)** - `docs/READINESS_CLASSES.md`: a concurrency decision left as an
  accepted residual is an open decision, and no pass accepts it; readiness check 3 names, for every
  write the plan adds or changes, the lock that holds it and what runs beside it - in
  `docs/WORKFLOW.md`, in the fact-check instruction and in the own pass's `discovery` cell.
- **plansDir under the scratch directory is observed (LEAN-001)** - the self-check's fourth
  `(observed)` row says `under the scratch directory` or `outside the scratch directory` (a note,
  never a failure), and `/pnp:setup` warns at the plans question - a lexical prefix test over the
  configured paths, folding case and backslashes on a project whose `os` is windows; any other
  ignored path is detected by neither.

### Changed

- **One scan agent per ticket (LEAN-001)** - `/pnp:review` Step 2a dispatches one scan-tier agent
  that returns the behavior ledger and the consequence scan as two tables from one context; the
  files stay two and the plan gate is untouched; Step 2c describes the second table and the delta
  scan before a further pass. `.claude/aiwf-native/ORCHESTRATOR.md` is re-rendered by migration
  `0021_lean-readiness`.
- **The own pass opens what the Writer acts on (LEAN-001)** - Step 2d and `docs/WORKFLOW.md` § Plan
  readiness review: every pointer the Writer acts on opened, the ledger rows read as behavior, every
  instrument run with valid AND broken input - in place of "every `file:line` opened".
- **Pointer discipline (LEAN-001)** - `docs/WORKFLOW.md` § Ticket brief contract and § Plan readiness
  review: a plan carries `file:line` where the Writer acts or an acceptance check reads; context
  cites the section and the symbol.

### Removed

- **The counter start/stop pair (LEAN-001)** - `templates/PNP_CANDIDATES.md.tmpl` and the skeleton
  in `docs/WORKFLOW.md` § The transfer surface: a Pass statistics row records which pass it was and
  what it cost as the engine reported it, and nothing asks the operator for a counter; § Branch
  policy loses the "one live auditor" clause that held only while a pair was being recorded.
```

**Извън обхват:** `scripts/engine/plan-gate.js` и неговите fixture-и (D4, D14); hooks, схемата,
`templates/CLAUDE.md.tmpl`, `templates/agents/*`, ask-ruleset, memory seeds, `examples/`; `git
check-ignore` за plansDir (D6); `templates/ORCHESTRATOR.md.tmpl` § Data discipline (D3);
историческите „fourteen“ в `CHANGELOG.md` и `migrations/0017_*` (D14); Furnissimo „Без статистика на
пасовете“ и всяко консуматорско дърво; `dev/` (Колегата не пише там — completion record-ът е docs
commit на COO-то след `{}`); проверка на датата в CHANGELOG срещу деня на тага (ръчна при тага);
HARD-011 / 0.3.0.

**Acceptance (литерални, Bash от repo root; всичко СЛЕД `--apply`, освен реда „Лендингът на този
план“, който е акт на COO-то в стъпка 1 на трейса; `<котва>` = литералният HEAD хеш от брифа (`git
rev-parse HEAD` при диспач — Колегата го замества); `<OUT>` = `C:/Users/dyosi/AppData/Local/Temp/pnp-lean`,
създадена с `mkdir -p` преди VERIFY — редиректите по-долу СА изходите на `setup-suite` и `selfcheck`
от VERIFY партидата (един рън на команда, не втори); `git grep -c` над един файл печата
`<файл>:<брой>`, затова „→ `1`“ е този ред с брой 1, а „→ `0`“ — без изход и `rc=1`; инструментите
по-долу са ИЗПЪЛНЕНИЕ на проверка с именуван изход, не четене — „Reading is not a shell job“ в
договора на Колегата не ги засяга, както при всеки acceptance досега):**
- Присъствие, по един литерал на ред:
  `git grep -n "^## Step 2a - Behavior ledger and consequence scan before a readiness pass: one agent, two tables" -- skills/review/SKILL.md` → един удар;
  `git grep -c "two tables from one context" -- skills/review/SKILL.md` → `1`;
  `git grep -c "the SCAN half of the Step 2a task alone" -- skills/review/SKILL.md` → `1` (блок C);
  `git grep -c "every pointer the Writer acts on" -- skills/review/SKILL.md` → `1` и `-- docs/WORKFLOW.md` → `1`; `-- templates/ORCHESTRATOR.md.tmpl` → без изход, `rc=1` (шаблонът сочи Step 2d, не го преразказва — D5);
  `git grep -c "the same context that writes the behavior ledger" -- docs/WORKFLOW.md` → `1`;
  `git grep -c "Where the pointer is owed" -- docs/WORKFLOW.md` → `1` (блок F1); `git grep -c "A factual claim the Writer acts on carries" -- docs/WORKFLOW.md` → `1` (на котвата: без изход, `rc=1`); `git grep -c "A factual claim about existing code carries" -- docs/WORKFLOW.md` → `0` (на котвата: `1`) и `git grep -c "before writing any factual claim" -- docs/WORKFLOW.md` → `0` (на котвата: `1`; делта scan ред 38 — средата на bullet-а); `git grep -c "before writing a factual claim it acts on" -- docs/WORKFLOW.md` → `1` (на котвата: без изход) и `git grep -c "or is marked explicitly" -- docs/WORKFLOW.md` → `1` (както на котвата — запазената опашка на първото изречение); bullet-ът е заменен като едно цяло и байт по байт (образец: блок T на DRAFTS-001): с блок F1 записан в `<OUT>/lean-block-F1.txt` (осемте реда, LF, нищо друго) — `awk '/^- \*\*A factual claim the Writer acts on carries/{f=1} f&&/^- \*\*A scope or diff guard is anchored/{exit} f' docs/WORKFLOW.md | diff - <OUT>/lean-block-F1.txt` → без изход, exit 0 (bullet-ът от новото му начало до следващия bullet „A scope or diff guard is anchored …“ на `:582` е точно блок F1; един излишен или различен ред → diff изход, exit 1 (измерено: вмъкнат ред → `8d7`); на котвата: awk не удря нищо → `0a1,8` + осемте реда, exit 1; `-U0` hunk гардът от r4 отпада — коректната замяна дава ДВА хънка, защото редове 579-580 са байт-идентични; fact-check r4 gap A1);
  `git grep -c "629 pointers opened by agents in the own pass" -- docs/WORKFLOW.md` → `1` (блок F2);
  `git grep -c "class 15" -- docs/WORKFLOW.md` → `1`, `-- skills/review/SKILL.md` → `3` (1(d), 1(e), 1(h));
  `git grep -cF "| 15 | concurrency decision left as an accepted residual |" -- docs/READINESS_CLASSES.md` → `1` и `git grep -c "the fifteenth on" -- docs/READINESS_CLASSES.md` → `1`;
  `git grep -c "which pass it was and what it cost as the engine" -- templates/PNP_CANDIDATES.md.tmpl` → `1` и `-- docs/WORKFLOW.md` → `1` (на котвата: без изход, `rc=1`);
  `git grep -c "^  reported it\.$" -- templates/PNP_CANDIDATES.md.tmpl docs/WORKFLOW.md` → по `1` на файл (вторият ред на блок T; на котвата: без изход, `rc=1`);
  `git grep -n -i -E "read off the host|counter pair" -- docs skills templates` → празно (на котвата 2: WORKFLOW `:784`, шаблон `:14`; наблюдава остатък от двойката без думата „start/stop“);
  `git grep -c "zero paid auditor passes. It is an OPERATOR-HELD" -- docs/WORKFLOW.md` → `1` (блок B; на котвата: без изход, `rc=1` — днес след „passes.“ следва „The machine-wide“);
  `git grep -c "one agent per ticket, two tables" -- templates/ORCHESTRATOR.md.tmpl` → `1`;
  `git grep -c "class 15" -- docs/REVIEW_CHECKLIST.md` → `1` (2a) и `git grep -c "hidden discovery/architecture (for every write" -- skills/review/SKILL.md` → `1` (1(h));
  `git grep -c "any other ignored path is detected by neither" -- skills/review/SKILL.md` → `1` (блок E1);
  `git grep -c 'whether `{{config.paths.plansDir}}` lies under it' -- skills/review/SKILL.md` → `1` (единични кавички — backtick-овете остават литерални; на котвата без изход, `rc=1`);
  над `migrations/0021_lean-readiness/ops.json` (операндът на всяка команда; файлът е pretty-printed като блок OPS — по един `"op":` на ред, иначе броячът не стига 2): `grep -c '"op":' migrations/0021_lean-readiness/ops.json` → `2`, `grep -c '"op": "rerender-managed-region"' migrations/0021_lean-readiness/ops.json` → `1`, `grep -c '"op": "note"' migrations/0021_lean-readiness/ops.json` → `1` (двата op-а са точно rerender + note — fact-check r4 gap A6), `grep -c '"file": ".claude/aiwf-native/ORCHESTRATOR.md"' migrations/0021_lean-readiness/ops.json` → `1`, `grep -c '"region": null' migrations/0021_lean-readiness/ops.json` → `1`, `grep -c '"template": "templates/ORCHESTRATOR.md.tmpl"' migrations/0021_lean-readiness/ops.json` → `1`, `grep -c "The readiness cycle is leaner and sharper (LEAN-001)" migrations/0021_lean-readiness/ops.json` → `1` (блок N);
  `grep -c "^# 0021_lean-readiness$" migrations/0021_lean-readiness/NOTES.md` → `1`;
  `git grep -nE "^## \[0.2.17\] - 2026-[0-9]{2}-[0-9]{2}$" -- CHANGELOG.md` → един удар;
  `git grep -c "v0.2.17. Public since 0.2.0." -- README.md` → `1`.
- Скелетът = шаблонът (D3; `docs/WORKFLOW.md:770` е единственият ````markdown` fence във файла, тялото
  му започва на `:771`):
  `awk '/^```markdown$/{f=1;next} f&&/^```$/{exit} f' docs/WORKFLOW.md | diff - templates/PNP_CANDIDATES.md.tmpl` → без изход, exit 0 (на котвата: без изход, `rc=0` — равни и днес; измерено 2026-10-04; копие на WORKFLOW с един сменен знак в скелета → `3c3` + двата реда, `rc=1`).
- Отсъствие: `git grep -n 'file:line` opened' -- docs skills templates` → празно (на котвата 2);
  `git grep -c "^Dispatch it with the" -- skills/review/SKILL.md` → `2` (на котвата `3`);
  `git grep -n "three (observed)" -- scripts/selfcheck/aiwf-selfcheck.js` → празно (на котвата 3);
  `git grep -n "the self-check does not detect" -- skills docs` → празно (на котвата 1);
  закриващите grep-ове на worklist 12 — всеки удар отворен.
- Risk threshold, наблюдаем: `git diff <котва> --stat -- hooks scripts/engine schema templates/CLAUDE.md.tmpl templates/agents templates/settings.ask-ruleset.json templates/memory-seeds examples` → празно;
  `git diff <котва> -U0 -- templates/ORCHESTRATOR.md.tmpl | grep -c "^@@"` → `2` (двете места на worklist 3 — `:173-178`, `:188-191`, разделени от непроменени редове; трети хънк = редакция извън тях, вкл. § Data discipline);
  `git grep -cF "| ticket | repo-match | scope | discovery | order | acceptance | git |" -- skills/review/SKILL.md scripts/engine/plan-gate.js` → `skills/review/SKILL.md:1` и `scripts/engine/plan-gate.js:1` (както на котвата — own-pass заглавието не се пипа);
  `git grep -c "ledger.md" -- scripts/engine/plan-gate.js` → `0` (гейтът не чете ledger-а — и преди, и след);
  `git diff <котва> -U0 -- scripts/selfcheck/aiwf-selfcheck.js scripts/spike | grep -c "repo-match"` → `0` (own-pass заглавието в fixture-ите непипнато);
  `git diff <котва> -U0 -- scripts/setup/test-setup.mjs | grep -c "SCRIPTED_ANSWERS"` → `0` (картата непипната);
  `git grep -nE "three$|three project-layer" -- skills/selfcheck/SKILL.md scripts/selfcheck/README.md` → празно (на котвата: SKILL `:44` завършва на „three“, README `:40`);
  прозата (изречение, което иска старт/стоп двойка с друга дума освен „start/stop“, „read off the host“ и „counter pair“, или твърди, че update-ът пренаписва трансферната повърхност или създава директории) няма механичен наблюдател извън 12(d) — само Codex code пасът; записано тук като такова;
  след `--apply`: `git grep -c "one agent per ticket, two tables" -- .claude/aiwf-native/ORCHESTRATOR.md` → `1` (самоинсталацията е пре-рендерирана).
- `node scripts/setup/test-setup.mjs > <OUT>/test-setup-out.txt` → exit 0;
  `grep -c "\[PASS\] plansDirUnderScratchWarning: under -> warning, outside and the prefix trap -> null" <OUT>/test-setup-out.txt` → `1`;
  `grep -c "\[PASS\] the interview warns at the plans question when plansDir is under the scratch directory" <OUT>/test-setup-out.txt` → `1`;
  `grep -c "\[PASS\] the dry-run carries the under-scratch note" <OUT>/test-setup-out.txt` → `1`;
  `grep -c "\[PASS\] a plansDir outside the scratch directory hears no under-scratch warning" <OUT>/test-setup-out.txt` → `1`;
  `grep -c "\[PASS\] the os flag reaches the interview: a linux project hears no under-scratch warning for .AIWF/plans" <OUT>/test-setup-out.txt` → `1`;
  `grep -c "\[PASS\] the os flag reaches the generator: .AIWF/plans is under scratch on a windows project and outside on a linux one" <OUT>/test-setup-out.txt` → `1` (8(g));
  „редиректи под репото по време на VERIFY партидата“ се наблюдава от самия `example-cycle-windows`: проверката му „the repository is byte-identical“ излиза 1 при всеки файл, добавен или сменен под репото (вкл. `.aiwf/`) докато върви — това е наблюдателят, не `git status` (fact-check r4 gap A7).
- `node scripts/selfcheck/aiwf-selfcheck.js --plugin-root . --project-fixture . > <OUT>/selfcheck-out.txt` → exit 0;
  `grep -cE "\[PASS\] \[drafts-S[1-8]\]" <OUT>/selfcheck-out.txt` → `8` и `grep -cE "\[(FAIL|NOTE)\] \[drafts-S[1-8]\]" <OUT>/selfcheck-out.txt` → `0`;
  `grep -c "^  \[NOTE\] plansDir under scratchDir (observed) - outside the scratch directory" <OUT>/selfcheck-out.txt` → `1` (това репо: `dev/backlogs`);
  `grep -cE "\(observed\) - not exercised" <OUT>/selfcheck-out.txt` → `0`; `grep -c "no control applies: plans-under-scratch" <OUT>/selfcheck-out.txt` → `0`.
- `node scripts/update/validate-payload.mjs --plugin-root .` → exit 0, изходът съдържа `valid: 21 migration(s) in` и `payload version 0.2.17`; `node scripts/update/aiwf-update.mjs --check --project-root .` → `up to date: this project is at 0.2.17 and the payload is 0.2.17; no migrations are pending.`
- Провенанс, с нетракнатите файлове: `git grep --untracked -nP "[\x{0400}-\x{04FF}]" -- docs skills templates scripts schema hooks migrations examples .claude-plugin README.md CHANGELOG.md CHANGES_0.2.16-to-0.2.17.md` → празно; `git grep --untracked -nE "[A-Za-z]:[\\\\/]|promptandpray|Silerax|Stratex|Furnissimo|D:/" -- migrations/0021_lean-readiness docs/READINESS_CLASSES.md CHANGES_0.2.16-to-0.2.17.md` → празно (CHANGELOG.md НЕ е в този grep — целият файл носи `https://` на `:4`, което шаблонът `[A-Za-z]:[\\\\/]` удря, и името на репото в стари блокове); само новият блок: `awk '/^## \[0.2.17\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md | grep -nE "[A-Za-z]:[\\\\/]|promptandpray|Silerax|Stratex|Furnissimo|D:/"` → празно (scan ред 35: self-check-ът сканира root `*.md` без CLAUDE.md с digest-и — VERIFY е гейтът, тези grep-ове са бързото лице).
- Дифф гард: `git status --short -- . ":(exclude)dev"` → точно worklist файловете (`skills/review/SKILL.md`, `docs/WORKFLOW.md`, `docs/REVIEW_CHECKLIST.md`, `templates/ORCHESTRATOR.md.tmpl`, `templates/PNP_CANDIDATES.md.tmpl`, `docs/READINESS_CLASSES.md`, `scripts/setup/generate.mjs`, `scripts/setup/interview.mjs`, `skills/setup/SKILL.md`, `scripts/setup/test-setup.mjs`, `scripts/selfcheck/aiwf-selfcheck.js`, `skills/selfcheck/SKILL.md`, `scripts/selfcheck/README.md`, `README.md`, `.claude-plugin/plugin.json`, `migrations/index.json`, `CHANGELOG.md`) + `?? migrations/0021_lean-readiness/`, `?? CHANGES_0.2.16-to-0.2.17.md`, ` M .claude/aiwf-native/aiwf.config.json` (bookkeeping), ` M .claude/aiwf-native/ORCHESTRATOR.md` (тихият rerender); `git status --short -- dev` → празно (черновата и `readiness/LEAN/` са комитнати при лендинга, преди диспача — няма `??`; Колегата не пише в `dev/`).
- Литералите на acceptance-а стоят на ЕДИН ред в дървото (scan редове 5, 6): Колегата пренася прозата до ~100 знака, но държи всеки от тези низове неразделен — `two tables from one context`, `the SCAN half of the Step 2a task alone`, `every pointer the Writer acts on`, `the same context that writes the behavior ledger`, `Where the pointer is owed`, `A factual claim the Writer acts on carries`, `629 pointers opened by agents in the own pass`, `class 15` (всяко място), `the fifteenth on`, `which pass it was and what it cost as the engine`, `zero paid auditor passes. It is an OPERATOR-HELD`, `one agent per ticket, two tables`, `any other ignored path is detected by neither`, `whether `{{config.paths.plansDir}}` lies under it`, `hidden discovery/architecture (for every write`; блоковете по-горе са пренесени така, че това вече е вярно за тях.
- Лендингът на този план (ПРЕДИ `git add` в стъпка 1 на трейса): `for f in ledger.md consequence-scan.md own-pass.md revisions.md; do test -f dev/backlogs/readiness/LEAN/$f || echo "MISSING $f"; done` → без изход; `ls dev/backlogs/readiness/LEAN/fact-check-r*.md | wc -l` → ≥ `1`; след docs commit-а: `git status --short -- dev/backlogs/readiness dev/backlogs/drafts` → празно.

**VERIFY (`dev/VERIFY_RUNBOOK.md`; Test policy `dev/PROJECT_OVERRIDES.md` § Test policy): редове „schema
/ config“ + „update engine / migrations / examples“ + `plugin-validate` по решение на COO-то (skills/ се
променят; прецеденти RGATE-001, DRAFTS-001) — `validate-payload`, `setup-suite`, `update-suite`,
`example-cycle-windows`, `selfcheck`, `plugin-validate`: ЕДНА паралелна партида, СЛЕД `--apply`, точни exit
кодове; без `spikes` (hooks непроменени); acceptance редиректите САМО в `<OUT>` (D12 — нищо не се пише
под репото, вкл. `.aiwf/`, докато партидата върви). POSIX — CI след push.**

**Risk threshold:** блокира: промяна в `scripts/engine/plan-gate.js`, hooks, схемата,
`templates/CLAUDE.md.tmpl`, `templates/agents/*`, ask-ruleset, memory seeds или `examples/`; седма колона
или сменено заглавие на own-pass таблицата където и да е; наблюдение, което може да падне (`add` вместо
`addObservation`), или без обръщащ fixture (S7↔S8), или което драйверът на контролите обяви за
непроверена проверка; интервю, което ОТКАЗВА plansDir под scratchDir вместо да предупреди; миграция с op
извън двата (rerender на ORCHESTRATOR + note); скелет в WORKFLOW, различен от шаблона; изречение, което
иска старт/стоп двойка, или което казва, че update-ът пренаписва трансферната повърхност или създава
директории; „three (observed)“ оцелял в self-check-а или негов doc; Cyrillic/абсолютен път/име на проект в
payload-а; редакция в ORCHESTRATOR шаблона извън двете места (трети хънк); ORCHESTRATOR шаблонът
преразказва текст с дом в Step 2d (TEMPLATE CONTRACT-ът му); редиректи под репото по време на VERIFY
партидата; `SCRIPTED_ANSWERS` картата в test-setup променена.

**Stop condition:** acceptance и VERIFY зелени → стоп.

**Review:** `Class: code`, ЕДИН пас (`gpt-6-sol`/xhigh, Codex) над целия диф срещу котвата при диспач;
fact-check (Step 2b, един sonnet над прозата на дифа) преди него; cap 2; кодов корекционен рунд →
верификационен пас на отделна дума (resume). **Interlock:** след `--apply` репото е 0.2.17, а
`D:\pnp-live` 0.2.16 → Step 0 на `/pnp:review` отказва („downgrade refused“); опресняване преди паса е
невъзможно (дифът е некомитнат). Пътят е един, както при RDY-001, RGATE-001, DRAFTS-001: отказът се
показва на оператора и кодовият пас тръгва през непроменения 0.2.16 wrapper на `D:\pnp-live` на негова
дума за случая (`Class: code`; plan gate-ът не участва). **QA:** не (D11).

**Assignee:** Колега (pin в `.claude/agents/writer.md`; НИКОГА `model` при диспач). Branch `main`.
Route-state `{"ticket":"LEAN-001","route":"R2"}` при диспач, `{}` при close. Брифът носи `Ticket:
LEAN-001` на отделен ред, HEAD котвата литерално (`git rev-parse HEAD` при диспач), блоковете по номер,
VERIFY дословно с портиите и `<OUT>`, списък „не пипай“ (Извън обхват + Risk threshold), формат на отговора
с всяко отклонение флагнато. Commit: ЕДИН кодов, subject `LEAN-001: one scan agent, no counter
pair, class 15, own pass by action, plansDir observation, pointer discipline - released as 0.2.17`, един
ред, без trailers (Co-Authored-By / Claude-Session — операторско правило, записано в паметта на COO-то
`no-claude-trailers-in-git`: историята е пренаписана веднъж, за да ги махне; не е в дървото; ref-ът стои в subject-а, както
при всеки commit в това репо, затова `Refs:` ред в тялото не се добавя — WORKFLOW § Durable development
history го иска „in commit bodies“ като носител на ref-а, а тук носителят е subject-ът); PLAN и
CANDIDATES — отделен docs commit на COO-то.

## Ред и гейтове (dry trace)

0. Lock: от първата дума на тази сесия до одобрението важи планиращият lock — нула git мутации;
   черновата `dev/backlogs/drafts/PLAN_LEAN.draft.md` и `dev/backlogs/readiness/LEAN/*` са нетракнати
   файлове на планирането (WORKFLOW § Planning lock, readiness изключението). Дърво при r0: `main` =
   `77936fc`, 4 локални commit-а пред `origin/main` (283c054, e2e13fe, ada2104, 77936fc — возят се на
   следващата push дума), чисто; `D:\pnp-live` = `77936fc` = 0.2.16; interlock зелен; CI на 0.2.16
   (`37200939927`, `37200939925`) зелен.
1. Readiness (сега, под ТЕКУЩИЯ payload 0.2.16): inventory ✓ (sonnet Explore в репото, 232 указателя;
   sonnet Explore над двата консуматора) → r0 → Step 2a ledger (1 sonnet Explore) ∥ Step 2c scan (1
   sonnet Explore) ∥ сонда ✓ (1 sonnet general-purpose, read-only над репото, писа само в scratchpad:
   скелет≡шаблон днес `rc=0` и пада при мутация; `--dry-run` с `paths.plansDir: .aiwf/plans` минава
   без отказ и без `note`; `writeFixture(root, pluginVersion)` пише `plansDir: 'docs/backlogs'`,
   `scratchDir: '.aiwf'`; S6 очакваните редове и `grew !== 3`; всички „на котвата“ броячи — записани в
   worklist 12 и acceptance; Node `v24.12.0`, GNU awk 5.0 в Git Bash) → `ledger.md`,
   `consequence-scan.md` (редовете затворени) → r1 → Step 2b fact-check (2 sonnet: тикетът + общите, с
   трите допълнителни инструкции и `docs/READINESS_CLASSES.md` по абсолютен път) → `fact-check-r1.md` →
   r2 → инструментите на own pass-а (1 sonnet general-purpose: всяка acceptance команда с валиден и
   счупен вход, нула записи под репото; докладът му отваря ОТДЕЛНИЯ ход) → Step 2d own pass →
   `own-pass.md` с `node D:/pnp-live/scripts/engine/plan-gate.js --hash
   dev/backlogs/drafts/PLAN_LEAN.draft.md` ПОСЛЕДЕН → пас 1 на стоящата дума за планирането (брифът на
   сесията — WORKFLOW § Plan readiness review: „the FIRST pass rides the ticket's standing word“; без нова
   дума от оператора). Брифът `.aiwf/review-brief.txt`: `COVERED BY: operator word "<цитат от брифа>",
   2026-10-04` първи ред; `Class: plan`; `PLAN: dev/backlogs/drafts/PLAN_LEAN.draft.md`; `TICKETS:
   LEAN-001`; `CONSEQUENCE SCAN: dev/backlogs/readiness/LEAN/consequence-scan.md`; `OWN PASS:
   dev/backlogs/readiness/LEAN/own-pass.md`; `PREVIOUS PASS BLOCKERS` (`none - this is pass 1`); `BUDGET
   TARGET`; risk threshold и stop condition на плана дословно. Wrapper-ът винаги във фон
   (`run_in_background`, timeout до 2 ч): `Get-Content 'D:/promptandpray/.aiwf/review-brief.txt' -Raw |
   & "D:/pnp-live/scripts/native/ps/codex-review.ps1" -ProjectRoot 'D:/promptandpray' -Class plan`;
   гейтът на 0.2.16 проверява петте реда и отказва при проблем (нищо не се харчи) → NEEDS-FIX →
   ревизия (само подадените блокери; оспорен дизайнерски блокер → паркиран при оператора) → делта scan
   + делта fact-check ПАРАЛЕЛНО → нов печат → пас 2 само на своя дума (брифът носи блокерите на пас 1
   дословно + origin duty) → [пас 3 = таванът, своя дума] → одобрение (дума) → лендинг: `mv
   dev/backlogs/drafts/PLAN_LEAN.draft.md dev/backlogs/active/PLAN_LEAN.md` (обикновен rename —
   нетракнат файл) + бележка за одобрение в хедъра + `revisions.md` с двата хеша (печатът над одитираната
   чернова; `plan-gate.js --hash dev/backlogs/active/PLAN_LEAN.md` след бележката) + проверката на
   имената (`test -f` четирите + `ls fact-check-r*`; липсващо име = СТОП) + `dev/backlogs/CANDIDATES.md`:
   указателен ред към PLAN_LEAN в § „plansDir под игнориран път“ и в абзаца „всичките шест“, D2 pointer
   ред „PLAN_LEAN одобрен“, Pass statistics ред на всеки пас (токените, както codex ги печата в изхода на wrapper-а; без двойка — D3), Event ledger ред за всеки catch → `git add dev/backlogs/active/PLAN_LEAN.md
   dev/backlogs/readiness/LEAN/ dev/backlogs/CANDIDATES.md` → docs commit (клик) → опресняване на
   `D:\pnp-live` (`git -C D:/pnp-live status --porcelain` празно → `git -C D:/pnp-live checkout --detach
   main`; Gate 4 диалог).
2. Изпълнение (отделна дума, по възможност отделна сесия; routing проверка 1 = да → top tier): `git
   rev-parse HEAD` → route-state → Колега (worklist 1–10 → bump + миграция → `--apply` → VERIFY D12 →
   acceptance → handback) → COO чете целия диф → fact-check (1 sonnet) → Codex code пас (interlock:
   отказът показан, дума за случая, непроменен 0.2.16 wrapper) → корекции в cap 2 (кодов рунд =
   верификационен пас на отделна дума, resume) → commit клик → `D:\pnp-live` опресняване (диалог) →
   route-state `{}` → docs commit с completion record + CANDIDATES редовете за catch-овете и пасовете на
   изпълнението (Gate 3 държи главната сесия извън `dev/` докато маршрутът е отворен — редовете за
   събития по време на кодовия пас се пишат СЛЕД `{}`, както при DRAFTS-001; scan ред 37) + архивиране
   (`009_PLAN_LEAN_<дата>.md`; grep-ът за rule-class точки с контрола над `005_PLAN_CONS`;
   `readiness/LEAN/` остава) → опресняване (диалог) →
   издание по § Release discipline (правило 2026-10-02): CHANGELOG датата сверена → таг `v0.2.17`
   (annotated) ЛОКАЛНО на record commit-а (дума; покрива и push-а на тага) → push `main` + тагът в ЕДИН
   push (дума + диалог; возят и четирите заварени локални commit-а) → CI след push-а (червен POSIX крак =
   defect тикет, не release block) → release record; consumer proof на следващия `/plugin update` +
   `/pnp:update` на всеки консуматор (техни сесии; note op-ът им казва кои локални редове да махнат).
