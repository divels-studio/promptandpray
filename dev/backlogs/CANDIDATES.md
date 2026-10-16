# Кандидати и transfer surface

Отворените кандидати (без ref) плюс трите дневника: Ruling ledger, Pass statistics, Event ledger.
Решените кандидати са махнати при чистката на 2026-09-24 (операторска дума „изчистете го“).
Историята им е в git (`git log -p -- dev/backlogs/CANDIDATES.md`) и в completion record-ите на
тикетите, които ги затвориха. Нов кандидат, роден от работа в полет, става тикет в активния план;
тук стоят само неща, нарочно паркирани извън активната мисия.

## Inventory 2026-10-14 - the „стабилизация“ ("stabilization") phase (operator decision; a sonnet inventory over the whole file)
(was: „Инвентар 2026-10-14 - фаза „стабилизация“ (операторско решение; sonnet инвентар над целия файл)“)

**The operator's decision:** the plugin is not stable - 0.3.0 (README, HARD-011) and the mechanism for the
context ceiling / automatic compaction are POSTPONED. Order: stabilize PnP → Silerax on it → Furnissimo
catches up with Silerax. No Fable - the COO on Opus. The inventory: 70 open, 12 released but not struck out
(their titles below are marked `[ПУСНАТ]`), 22 rejected/obsolete. The numbers below are „т. N“ ("item N")
from § „Прием от Silerax“.

**Plan A - the text (0.2.18) - EXECUTED 2026-10-15 (STAB-001 `371889c`; archive
`archive/010_PLAN_STAB_2026-10-15.md`). Landed as `active/PLAN_STAB.md` (STAB-001, code class after readiness
pass 1, one Codex pass, R2 by operator decision). The list below is the input; the plan is the authority -
left outside it: trace by default, a copy of the E2E report, § „E2E преди кодовия одит“,
§ „Веригата (chain-trace)“, § „Доктринно изречение, което изброява света“ - they go to POSTPONED.**
Silerax intake items 5, 6, 7, 10, 11, 12 (+ (k) from „Таван“ - one cluster), 13 (description only - a host
limitation), 14, 15, 16, 17, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30; from § „UIR-003“: scoped re-run, a
copy of the E2E report, suppression dual (raised priority); trace by default - `?` (contradicts
`skills/qa/SKILL.md`:111-119, decided at planning); § „E2E преди кодовия одит“; § „Веригата (chain-trace)“;
§ „Име на продукт не е път“; § „Две имена за едно множество“; § „Доктринно изречение, което изброява света“;
§ „Брифът, който пуска VERIFY, сочи проектния runbook“.

**Plan B - the code (0.2.19): CODE, Writer + one Codex pass.** Item 1 (the CHANGES path), 2 (`AGENTS.md`), 3
(`$schema` - check first), 9 (a Codex session per ticket); § „Gate 3 заключва transferSurface“ + (j) from
„Таван“ (one cluster); § `--show` process.exit; § „Заварен лексикален containment“; § „`0011` supersede“;
§ „Третият дом на изброяването“; from § „UIR-003“: outputDir under the traced app root.

**POSTPONED (after the stabilization):** from plan A (PLAN_STAB D4): trace by default `retain-on-failure`, a
copy of the E2E report for the Writer, § „E2E преди кодовия одит“, § „Веригата (chain-trace)“,
§ „Доктринно изречение, което изброява света“; R2 vs R3 for payload migrations (the text of WORKFLOW § R3 and
LOOP.md puts „migrations“ in R3 without qualification - PLAN_STAB readiness pass 2) - a candidate for the next
plan; the whole § „Таван на контекста“ ((a)-(l) without (j) and (k)) + item 4 (the subagents' hooks - affects
only the local hooks here and in Silerax); item 18 (a shorter doctrine - separate work); item 19 (the plan as a
folder); items 31, 32 (low priority); item 8 (the auditor raises old blockers - research);
§ „ГЛАВЕН ПРИОРИТЕТ - топъл пас“ (research); § RENAME-001; § PS-EOL (waits for a case); § Codex tier agents;
§ macOS tier; § VERIFY без POSIX крак; § 0.3.0 README; § GO-дума.

**INTO PLAN B (operator words 2026-10-14:
„да, влизат в следващия план, това е грубо нарушение - преписвач, щото е по-лесно“
("yes, they go into the next plan, this is a gross violation - a copier, because it is easier") and
„да за трите, да не пропуснеш нещо, всичко влиза в следващия план Б, това са 8 груби нарушения за една сесия“
("yes to the three, so that you miss nothing, everything goes into the next plan B, these are 8 gross violations in one session")).
Source: the two reports of session „Silerax UI 050“ (events 1-8 in the Event ledger below) and the
self-assessment of the COO there. Plan B is no longer only code - it carries these rules too.**
- The rules in the Writer's brief (the „hard rules“ block) are derived from the CURRENT overrides document and
  the plan, with a source on every line - never copied from an old brief; the scan agent checks the brief
  against overrides + the plan BEFORE the Writer's dispatch, not only before a paid pass (WORKFLOW § Ticket
  brief contract, „Verify an inherited fact“ - the rules block is inherited claims, not a template).
- A later operator remark narrows the standing „да“ ("yes"): once the operator says they take a step
  themselves („сам ще си пусна ъпдейта“ - "I will run the update myself"), the COO stops and waits for that
  step; after that - one action per turn, each one shown; removing a rule is shown before it lands (guard (g)).
  Related: the memory that „да“ covers only what was asked.
- Measuring „цената на подготовката срещу ползата при изпълнението“
  ("the cost of the preparation vs the benefit at execution") (operator concern 2026-10-14: 20% of the
  Claude quota for a day; whether readiness helps the Writers cannot be told) - the COO's proposal: a line in
  the Writer's handback „какво в плана се оказа грешно или липсващо и коя проверка ми спести работа“
  ("what in the plan turned out wrong or missing, and which check saved me work").
- Work the doctrine does NOT require - an agent, a check, a paid pass - goes first through a question to the
  operator, especially after a caught error; a „поправка“ ("fix") with a new unrequested cost is the same error
  in a new form (event 5: 224 160 tokens for an unrequested sonnet cross-check right after the catch; the
  operator:
  „еднолични решения са приемливи в рамките на обхвата, но след като те хванах в издънка, ти продължи да своеволничиш“
  - "unilateral decisions are acceptable within the scope, but after I caught you in a blunder, you kept acting on your own").
- Escalation is checked AT THE MOMENT of the decision, not at the start: every decision in the brief and the
  plan carries a line „ескалация: няма / тригер N“ ("escalation: none / trigger N"), so the four triggers
  (ORCHESTRATOR § Escalation) are read over the concrete decision (events 6 and 7: a shared component over
  three modules against a recorded plan decision - triggers 1 and 3; a text key outside the plan's list -
  trigger 1). „Инженерните решения са на COO“ ("the engineering decisions are the COO's") does not cover a
  decision that reverses a plan or crosses the ticket's boundary - the classification of one's own decision is
  not the COO's alone.
- The rule is applied at the moment of the decision, not only known: read at the start and used from memory as
  a title is the root of events 2, 6 and 7 (the self-assessment, item 2) - related to „Заглавие не е текст“
  ("A title is not the text", overrides § Loop shape) and § „Таван на контекста“ (e)/(g).
- Recording an incident does not wait: event 8 - not one of the eight was in the register (PLAN_STAB block P1
  already carries the rule; plan B checks whether it is enough).
- The thresholds of the context-ceiling hook: the session size is NOT the problem (operator: sessions of
  800-900k without a problem) - the 400/450/500k thresholds confuse the COO when automatic compaction is off.
  Both in Silerax and here raised to 950k/1000k, and the sentence „компресирането идва на ~500k“ removed
  (operator 2026-10-14). Candidate item 20 (a new session at a ticket boundary) is read through this: the
  recommendation is about a ticket boundary, not a size. § „Таван на контекста“ must stop accepting a value
  for `/autocompact`.
- R2 vs R3 for payload migrations - the textual discrepancy from PLAN_STAB readiness pass 2 (ruling row below).
- The checks are run by a fresh `general-purpose`/`sonnet` agent, not the Writer - VERIFY, acceptance,
  reruns; the Writer - only for a fix (operator rule 2026-10-15, from Silerax UIR-050; here in overrides
  § Test policy). A candidate for the payload: WORKFLOW § COO owns broad scans (tripwire 3) and the writer
  template.
- The COO's self-assessment in Silerax (common root „скоростта спечели срещу правилата“
  ("speed won against the rules"); a standing „да“ as a license; a rule known, not applied; self-assigned
  authority; more action after an error; an overloaded session) is the input of the plan - every item above
  answers one of them.

## Direction 2026-10-15: three plans, in this order (operator word „да, записвай го и чертай плана за 0.2.19")

Synthesis of `dev/PLAN REFACTOR/` (GPT answers 1-3), this file and a size measurement, done in one
session so it is not re-derived. Three separate problems, not one:

| Bucket | Measured | Source |
|---|---|---|
| Doctrine preflight (CLAUDE.md, ORCHESTRATOR, overrides, WORKFLOW, LOOP, CHECKLIST, PROTOCOL, READINESS_CLASSES, BRIEF_RECIPE) | 196,741 bytes, ~49k tokens at bytes/4; `/context` on this repo ~65k + overrides ~17k | haiku byte count 2026-10-15; intake item 18 |
| `docs/WORKFLOW.md` alone / `skills/review/SKILL.md` | 82,708 bytes, 1,141 lines / 54,952 bytes | same |
| Consumer active plan `PLAN_UIR.md` | 883 KB, 6,561 lines, >90% of lines outside the current phase | `Отговор 1.pdf` (KB/lines, not tokens) |
| COO start after `/pnp:mission` (consumer) / spend at >150K context | 140.9K / 73-75% | § „Таван на контекста", UIR-038 table |

Decision (COO, reported): the plugin is not rewritten - gates, hooks, roles and the audit table are
not the cause (GPT agrees). Two text/structure refactors and one small code release, drafts under
`dev/backlogs/drafts/` (untracked until each lands):

1. **0.2.19 - `PLAN_PLB.draft.md`** - plan B, the CODE part only (`:28-31`). The rules queued under
   „ВЛИЗАТ В ПЛАН Б" (`:42-81`) move to 2. and are written once, in the compact register.
2. **0.2.20 - `PLAN_DOCT.draft.md`** - doctrine: contract apart from rationale (intake item 18 +
   the plan-B rules). Rationale and incident history to a payload `docs/RATIONALE.md`; target
   preflight <= 40k tokens by `/context`; equivalence proven by a normative-row map (scan agent),
   docs class.
3. **0.3.0 - `PLAN_FOLD.draft.md`** - the plan as a folder (intake item 19 = GPT proposals 1-11):
   index, DECISIONS, phases, one ticket and one record per file; manifest detection, no migration of
   old plans, one doctrine for both formats, four-stage rollout, dogfood on one consumer plan.
   English for new plans inside it. The public README (HARD-011) becomes **0.3.1**, after the folder
   format is proven - 0.3.0 does not ship on a README over an unoptimized system (operator, 2026-10-15).

Stays deferred: § „Таван на контекста" beyond (j)/(k) - the operator stated sessions of 800-900k
run fine and 2.+3. lower the pressure; „ГЛАВЕН ПРИОРИТЕТ" (warm vs cold pass) - research.
Before each plan: its own analysis step and a readiness cycle (`review.plan` row) when durable.

## [ОТЛОЖЕН 2026-10-14, без (j) и (k)] Таван на контекста + чекпойнт по гейтове в payload-а (роден 2026-10-14, операторска дума „кандидат запис за версия и анализ“; ГЛАВЕН кандидат и на Silerax)

**Произход:** Silerax (`D:\Stratex`) UIR-040 / UIR-041 + поправка `c37de33a`; правилото —
`D:\Stratex\dev\PROJECT_OVERRIDES.md` § Loop shape „Чекпойнт по гейтове и таван на контекста“
(2026-10-10), изтича там „когато PromptAndPray носи механизма“; записът на експеримента —
`D:\Stratex\dev\backlogs\readiness\UIR\context-ceiling-2026-10-10.md`. В това репо проектно (не
payload) от HARD-024 (`dev/backlogs/active/PLAN_HARD.md`).

**Механизмът (три части):** (1) `autoCompactWindow` (днес `500000` в потребителските настройки —
важи за всички проекти на машината); (2) statusline пише `~/.claude/ctx/<session_id>.pct|.size`
(днес потребителският `~/.claude/statusline.sh` — извън всеки проект); (3) кука `context-gate.mjs`
на `UserPromptSubmit` / `PostToolUse` / `SessionStart:compact` — напомняне на 400k, „сега“ на 450k,
след компресиране връща `.aiwf/checkpoint.md` като `additionalContext` (`PreCompact` не може да добавя
контекст); правило: COO пренаписва ЦЕЛИЯ чекпойнт (≤ 60 реда) на всеки гейт и по сигнал на куката.

**Какво би носил payload-ът (за решаване, не решено):** куката като четвърти hook файл (или
`SessionStart` + `UserPromptSubmit` в съществуващия `hooks/hooks.json`) — фабрично изключена или
включена; праговете като ключове в схемата (`context.remindTokens`, `context.nowTokens` — имена
нерешени), а не константи; statusline зависимостта — payload-ът не може да пише потребителския
statusline, затова или собствен източник на процента, или честен лимит „без statusline куката мълчи“;
правилото за чекпойнта — `docs/WORKFLOW.md` или ORCHESTRATOR шаблонът (rule-bearing, guard (g));
`checkpoint.md` в живата механика на scratchDir (Step 2e списъкът). Managed-artifact промяна →
миграция + bump. Текстовете на куката днес са български — payload-ът ги иска английски.

**Продуктови решения на оператора (2026-10-14, „схвана ли“):** (1) statusline-ът не е обект на
плъгина; (2) праговете идват от настройката на потребителя, когато аутокомпактът е включен —
`autoCompactWindow` минус 100k и минус 50k (800k → 700k / 750k; 500k → 400k / 450k), не ключове в
схемата; (3) дали аутокомпактът е включен, е работа на потребителя — плъгинът нищо не предлага и
нищо не контролира в настройките; (4) задачата на плъгина: да ПАЗИ потребител с включен аутокомпакт.
(5) „статуслайнът не е опция“ — категорично друго измерване. Следствие за дизайна (COO): процентът на
контекста не може да идва от statusline-а — куката го чете сама от `transcript_path` на payload-а; без включен аутокомпакт куката мълчи. **Проба (2026-10-14,
read-only агент над транскрипта на сесия `00f71ea0…`): ОСЪЩЕСТВИМО** — последният `type:"assistant"`
запис извън `<synthetic>` и sidechain, `message.usage`: `input_tokens + cache_read_input_tokens +
cache_creation_input_tokens` = 446,501 срещу statusline-а 450,000 (45% от 1,000,000) — 0.35 пункта;
четене на последните 256 KB — 1.1 ms (целият файл 32 ms); едно API съобщение = няколко записа с еднакъв
`usage` (взема се последният, не се сумират). Прагът идва от `autoCompactWindow`
(`~/.claude/settings.json:52` = 500000), не от прозореца на модела (1,000,000). Непроверено: записът,
който оставя компресирането, и форматът на sidechain записите (тази сесия няма нито едно).
**Документацията (claude-code-guide, 2026-10-14; code.claude.com/docs/en/hooks, /statusline,
/model-config, /settings-reference, /env-vars):** нито една кука не получава контекста (само
`SessionStart` при `resume`/`fork` носи `context_tokens`); единственият документиран източник е stdin-ът
на statusline-а (`context_window.*`) — отпада по решение (5); форматът на транскрипта НЕ е документиран
(„Path to conversation JSON“, без схема, без гаранция; пише се асинхронно и може да изостава с текущия
ход) — честен лимит на подхода. Прозорецът на компресиране: `CLAUDE_CODE_AUTO_COMPACT_WINDOW` >
`--autocompact` > `/autocompact` (`modelSettings` за модела в user settings) > `autoCompactWindow`; файлове:
managed > `--settings` > `.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json`;
`autoCompactEnabled` (по подразбиране `true`) и `DISABLE_AUTO_COMPACT=1` / `DISABLE_COMPACT=1` го
изключват; `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` може само да СВАЛИ прага. Без зададен прозорец — при
лимита на модела (за 1M модели „около 967K“). `PreCompact` може да блокира, но НЕ може да добавя
контекст; `SessionStart` `additionalContext` стига до модела (за `compact` — разумно, но недокументирано
изрично). Буферът ~33K / „~467K“ от анализа не е документиран. Следствие: куката чете прозореца по
документирания приоритет; без прозорец и без включен аутокомпакт — мълчи.

**Анализ (качен 2026-10-14):** GPT разговорът на оператора — `C:\Users\dyosi\Downloads\Claude
Autocompact (1).pdf` (84 стр., целият разговор 2026-10-10…14; измервания 1-5) и `Claude
Autocompact.pdf` (4 стр., финалната оценка); и двата извън репото, четени от агент (текстов слой
няма — рендерирани страници). Тикетът: Silerax UIR-038 (100 файла в кода, два Codex паса: FAIL с 1
блокер → корекция → PASS; код `bc568dd9`, запис `70f41326`). Източникът на всяко число — `/context` и
`/usage`, отчетени от оператора на COO сесията (Opus 5.5, прозорец 500k):

| точка | контекст | API екв. | стр. |
|---|---|---|---|
| старт след `/pnp:mission` | 140.9K | $1.07 | (1) p27, p30 |
| преди първия compact | 354.8K | $64.64 | (1) p37 |
| веднага след compact | 72.2K | $64.88 | (1) p43, p47 |
| след integrity check | 89.4K | $65.45 | (1) p50-53 |
| след пълния diff review | 256.7K | $69.35 | (1) p63-64, p72 |
| след Codex пас 1 (FAIL, 192 389 Codex токена, отделна квота) | 298.1K | $70.48 | (1) p75-82 |
| тикетът затворен (пас 2 PASS), 3ч45м wall | 346.1K | $75.07 | (4-стр.) p1-2 |

Цената на компресирането: compact + възстановяване $0.24, integrity check $0.57 — общо $0.81 срещу
$1.07 за нов старт през `/pnp:mission` ((1) p56; ориентировъчно, една точка); compact-ът маха 282.6K
(−79.7%), Messages 280.2K → 30.3K ((1) p47). Кешът: 99% от входа, 0 misses, 1 expected rebuild през
цялата сесия; TTL на главната сесия 1ч, на субагентите 5 мин ((1) p32-34); Codex пас 5-12 мин е
вътре в TTL ((1) p68). Ефективният праг: auto-compact стреля на ~467K, не на 500K (буфер 33K, (1)
p31, p36, p64) — праговете 400k/450k на куката стоят преди него. Останало: Bash tool results 75.9K
(~38K спестими по подсказката на `/context`; (4-стр.) p2), 73-75% от usage при >150K контекст, writer
субагентите 39-40% (`/usage`).

**Изводите на GPT (мнение, не измерване):** компресирането работи като пълен цикъл — продължен
тикет, diff review, одит, корекция, затваряне след него ((4-стр.) p2); праг ~400K, не 800K, и „нищо в
workflow-а не се сменя до края на експеримента“ ((1) p57-58); компресиране по гейтове, не по процент
((1) p19-20, p46-48); нова сесия на границата на тежък тикет вместо втори compact върху затворен тикет
((4-стр.) p3); доктрината не се сменя за Bash изхода, преди да е ясно откъде идват 75.9K, а пълният diff
review не се съкращава заради токени ((4-стр.) p2); сравнителната ефективност спрямо чист Claude Code
остава недоказана ((4-стр.) p3); препоръка — числата да влязат в PnP като първи end-to-end case study
за checkpoint + compaction + audit continuity ((4-стр.) p4). Отворено след анализа: финалната стойност
на праговете (нито един текст не препоръчва 450K или 500K като окончателни); цената на нов старт при
~150-180K има една точка ($1.07 при 140.9K).

**Инцидент след компресиране (2026-10-14, доклад на сесия „Silerax Plan F3“ по операторско искане):**
обобщението на автокомпакта носи доктрината само като ЗАГЛАВИЯ („Doctrine preflight: done this session
— I read these in full“; readiness цикълът — един ред), а текстът на `/pnp:review` Step 2a–2d изчезва;
чекпойнтът казваше само „Следва: … → readiness“. COO-то пусна два свободни sonnet агента („fact-check“,
„consequence scan“) ПРЕДИ да зареди скила, после скилът поиска своите седем — 2 дублирани агента, ~550k
subagent токена (fact-check ~187k, скан ~369k), нула платени engine пасове. Причина (по доклада):
действие по заглавието на правилото, не по текста му — правилото е в `docs/WORKFLOW.md` § Plan
readiness review; компресирането е усилващ фактор („прочетено изцяло“ оцелява, текстът — не). Мерки
там: memory `feedback_readiness_via_review_skill.md` и ред в „След компресиране направи“ на чекпойнта —
преди гейт, readiness стъпка или диспач се препрочита текстът на правилото. **Предложения към payload-а
(от доклада, за решаване):** (a) `SessionStart:compact` да инжектира общо напомняне „обобщението носи
заглавия; преди гейт препрочети текста на правилото“, независимо от чекпойнта на проекта; (b) едно
изречение в WORKFLOW § Plan readiness review: readiness започва със зареждане на `/pnp:review`, scan /
fact-check агенти извън Step 2a–2c не се пускат; (c) предупреждение, когато в сесията вече има scan
агенти с „fact-check“/„consequence“ преди скилът да поиска своите.

**Наблюдения** от Silerax (памет на сесия „Silerax Plan F3“, 2026-10-14): на 460k куката каза „сега“,
компресирането мина и `SessionStart:compact` върна чекпойнта правилно; допълван (не пренаписван)
resume файл беше стигнал 174 KB и ~25% от контекста при старт — затова „пренаписвай целия“;
планиране/readiness не е граница на тикет и дълъг контекст не е повод за нова сесия.

**Проучване на добрите практики (2026-10-14, sonnet агент с търсене в мрежата, read-only; операторска
дума „да, запиши ги като кандидати“).** Документирано (code.claude.com/docs - memory, context-window
§ What survives compaction, skills, hooks, costs): след компресиране се зареждат наново root
`CLAUDE.md`, неограничените rules, auto memory и плана от plan mode; извиканите скилове се връщат
съкратени до 5k токена всеки и 25k общо (пази се началото, най-старите отпадат); вложени `CLAUDE.md` и
`paths:` rules се губят; контекстът, добавен от куки, също се обобщава - затова `SessionStart:compact`
трябва да инжектира отново всеки път (нашата кука го прави). При автоматично компресиране PreCompact
получава празно `custom_instructions`; само секция `# Compact instructions` в `CLAUDE.md` насочва
обобщението, а дали моделът я спазва, не е документирано. Непроверено: схемата на изхода на
PreCompact/PostCompact, лимит на `additionalContext`; GitHub issues за изгубени правила (#4517, #5731,
#24460 и др.) - през огледало, статусът им не е проверен. Не са проучени Codex CLI, Cursor, Aider.
Кандидати (за решаване):
- (d) секция `# Compact instructions` в root `CLAUDE.md` (за payload-а - в управлявания регион): какво
  се пази дословно - тикет, гейт, думи на оператора, чакащи одобрения, живи агенти; да се измери дали
  обобщението я спазва;
- (e) „След компресиране направи“ на чекпойнта носи ДОСЛОВНО 10-20-те оперативни реда на правилото за
  следващия гейт вместо указатели - препрочитането на доктрината отпада;
- (f) състоянието на гейта като малък JSON до прозата на чекпойнта (тикет, маршрут, гейт, статус на
  думата, живи агенти) - Anthropic „Effective harnesses for long-running agents“ (2025-11): JSON се
  размива по-трудно от Markdown;
- (g) проверка, че дългите доктринни скилове (`/pnp:review`) не се режат на 5k при връщането след
  компресиране - иначе важното трябва да е в началото на SKILL.md.

**Второ проучване - общността (2026-10-14, sonnet агент, read-only; операторска дума „да, запиши
ги“).** Измерванията са малко и почти всички от един автор - сигнали, не доказателство; автоматично
компресиране на 500k прозорец не е мерил никой.
- (d) ОТХВЪРЛЕН: `# Compact instructions` в `CLAUDE.md` не стига до компресора - compact-canon
  (github.com/tonydzi/compact-canon, данни до 2026-08-29): 0/380 спазени (0/39 автоматични).
- (e) ПОДКРЕПЕН: `SessionStart:compact` е единственият канал, измерен като работещ - 4/4 (dev.to/rulestack,
  2026-09-30, ръчен /compact, v2.1.285); root `CLAUDE.md` 8/8; вложени `CLAUDE.md` 4/8, `paths:` rules 2/4.
  Същото предлага и Silerax Plan F3 (доклад 2026-10-14, негово (а)): общо напомняне при компресиране.
- (g) ПОДКРЕПЕН: върнатото тяло на скила е текстът от момента на извикване (не редактираният файл), а
  при `--resume` липсва в 2/8 - преди гейт скилът се зарежда наново.
- (h) НОВ, риск за нашата кука: anthropics/claude-code #91910 (отворен към 2026-10-05) - PreCompact,
  PostCompact и `SessionStart:compact` се пускат и при компресиране на ФОНОВ субагент, с `session_id` и
  `transcript_path` на родителя и без agent полета; куката може да инжектира чекпойнта на COO-то в
  Колегата. Заобикаляне (непроверено, един автор): mtime на `subagents/**/agent-*.jsonl` < 60 s.
- (i) НОВ: таблицата на живите агенти в чекпойнта се пише при ВСЕКИ диспач и връщане (собственик,
  задача, последно събитие), а след компресиране - ред „разписка“ (живи / завършени / осиротели) преди
  нов диспач; без задачите ролите стават „фантомен екип“ (anthropics/claude-code #23620, коментари;
  gist sigalovskinick „Compaction Memory“ - еднократно напомняне „провери живите агенти“).
- ОТХВЪРЛЕН: ръчен `/compact <блок>` на избран гейт (Nathan Onn 2026-05-01, compact-canon) - иска
  оператор, който чака и пише команда; не става за автономна сесия (операторска дума 2026-10-14).
- (f) JSON състояние - недоказано: в общността няма сравнение JSON срещу Markdown; компромис -
  фиксирани заглавия и запис, който се отказва при липсващо заглавие (github.com/kenimo49/compact-ops).

**От доклада на Silerax Plan F3 (2026-10-14; решение на COO, операторска дума „ти кажи какво да
добавим“).**
- (j) Gate 3 пропуска `paths.transferSurface` и при отворен маршрут: записът на инцидент, кандидат
  или pass ред е bookkeeping, а отлагането до затварянето на тикета води до забравяне (наблюдавано и
  тук: кандидатите на LEAN-001 чакаха в `.aiwf/candidates-queue.md` до `{}`).
- (k) правило в доктрината (без промяна в куката): файл, чийто текст съдържа git глагол, се пише само
  с Edit/Write, никога през shell heredoc - Gate 4 разпознава глагола и в низ и вдига диалог; това е
  умишлено (docs/LOOP.md § Gate 4, „a gated verb inside a quoted string still costs a click“) и
  разпознаването не се разхлабва.

**От третия доклад на Silerax Plan F3 (2026-10-14; UIR-047 - QA гейтът на тикета пропуснат след
компресиране, обобщението го превърна в „или“; решение на COO по стоящата дума „ти кажи какво да
добавим“).**
- към (e): чекпойнтът носи списъка с гейтовете на ТЕКУЩИЯ тикет дословно от PLAN-а (одит да/не, QA
  да/не, commit) като една фиксирана последователност - гейт никога не се пише като алтернатива („или“).
- (l) механична проверка преди commit диалога: ако записът на активния тикет в PLAN-а казва QA да, а
  за маршрута не е записан `qa` диспач, куката предупреждава (route-state може да носи пасовете на
  маршрута) - правило, което може да е кука, не остава само в доктрината (overrides § Identity, „advice“).

## Intake from Silerax - a point-by-point review with the operator (born 2026-10-14; the review is complete: 32 kept, 8 rejected, 1 priority raised)
(was: „Прием от Silerax - преглед точка по точка с оператора (роден 2026-10-14; прегледът завършен: 32 запазени, 8 отхвърлени, 1 вдигнат приоритет)“)

Two sonnet agents read `D:\Stratex` (the project is Silerax, the folder has the wrong name): the repo and the
memory `~/.claude/projects/D--Stratex/memory/`. 42 things with no home here, 15 already carried over, 36 local
rules around the doctrine. Every point went through the operator separately. Abbreviations: `S` = `D:\Stratex`,
`SP` = `S\dev\backlogs\PNP_CANDIDATES.md`, `SO` = `S\dev\PROJECT_OVERRIDES.md`, `SM` = the Silerax memory,
`CE` = `S\dev\backlogs\readiness\UIR\context-ceiling-2026-10-10.md`.

**Defects in the payload (kept).**
1. The path of `CHANGES_<x>-to-<y>.md` is pinned to the project root (`scripts/update/migrate.mjs` ~1559
   per the agent, unverified) - both consumers move it by hand after every update; the folder should be
   configurable. `SP:34`. **[SHIPPED 0.2.19, PLB-002: `paths.changesDir`; Silerax sets it to
   `dev/pnp-changes` and deletes its local move rule (2026-10-16).]**
2. PnP does not render or refresh `AGENTS.md` (the Codex auditor's input); in Silerax it is hand-written and
   the doctrine paths in it are pinned to `cache\...\pnp\0.2.16` - they go stale at every update. Same
   class: the Codex command in their checkpoint carries a pinned `pnp/0.2.16` path. `S\AGENTS.md:28-31`.
   **[SHIPPED 0.2.19, PLB-003: a managed, version-free `AGENTS.md`; both consumers kept their hand-written
   file as a held artifact (keep-mine) - see the candidate "a `createIfAbsent` op meeting a foreign file".]**
3. `$schema` in Silerax's `aiwf.config.json` points at `pnp\0.2.1\schema` - update apparently does not
   refresh it (unverified; the agent points at `migrate.mjs` ~392-395). `S\.claude\aiwf-native\aiwf.config.json:2`.
   **[SHIPPED 0.2.19, PLB-002: every update refreshes `$schema`; Silerax's now points at the 0.2.19 cache.]**
4. The agents' hooks receive the main session's session_id, so the context-ceiling STOP hits the subagents
   too (the activity events, not only compaction - toward (h)); their local fix skips events with
   `agent_id`. `S\.claude\hooks\context-gate.mjs:6`.

**Paid passes.**
5. A paid pass dies without a verdict → report the numbers and wait for a word, never a self-initiated
   re-dispatch (Furnissimo PROJ-002 burned 287k, a local „re-dispatch ONCE“ ran a paid pass without a word).
   Operator: the candidate is a setting in PnP stop/resume. `SM feedback_paid_pass_death.md`.
6. Clarify what a correction round is: the rounds AFTER an auditor verdict count; the Writer's internal fixes
   before the audit (like LEAN-001's fact-check micro-round) do not. Operator: a scope change legitimately
   brings more rounds after an audit - those count; the candidate is only a sentence for clarity.
   `SM feedback_correction_round_counting.md`.
7. A paid review outside the two standard ones (plan readiness, the diff audit), e.g.
   „Codex одитира целия модул“ ("Codex audits the whole module") (~14 000 lines, 250-400k quota in Silerax):
   the plan writes the scope and the approximate cost, so it is seen at approval. NO new stop - operator: a
   stop in the middle breaks the autonomous loop. `SM feedback_codex_after_code_only.md`.
8. The auditor still raises blockers that were visible on the first pass too (it admits the violation
   itself); HARD-005 made the contract instrumented, the behavior did not get fixed - how to enforce it
   structurally. `SP:52`, event ledger `SP` ~302, ~320.
9. `last-review-session.txt` is per project (`<scratchDir>`), not per machine (the agent was wrong,
   `scripts/native/ps/codex-review.ps1:126`); the risk is only with parallel sessions in one project -
   a file per ticket (`last-review-session.<REF>.txt`). Low priority. `SP:44`, `SO:416-427`.
10. The brief's write is confirmed BEFORE the dispatch - separate steps in `/pnp:review` (write and launch in
    one message ran Codex on the old brief). Event ledger `SP` ~243.
11. A blocker that demands precision beyond the business scope (sums up to 10^13) is brought to the operator
    early and in plain language - a product decision, not a new gate (two readiness passes and two revisions
    burned). `SM feedback_scope_question_early.md`.

**Gates and dialogs.**
12. „Редакцията не е работа за shell“ ("editing is not a shell job") next to „четенето не е“
    ("reading is not") - only Edit/Write, for all roles, in the Writer's template and in the shared rules;
    broader than (k). `sed -i` held a dialog open for 6 hours; the auto mode host directive pushes toward shell edits.
    `SP:47`, `SO:66-70`.
13. The auto mode classifier refuses an agent touching `.claude/settings.json` and `aiwf.config.json`
    (Self-Modification) even with a word - `/pnp:roles --set` and update apply should say what to do on a
    refusal (a host limitation, not our defect). `SM project_e2e_local_lessons.md` #7; partly
    PLAN_HARD (auto mode off at apply).
14. The negative probe of a permission gate (tripwire 4) is made on a test copy of the settings, like
    selfcheck, never by weakening the live gate - the classifier refuses that as „Security Weaken“. Event
    ledger `SP` ~294, ~323.
15. Scan agents return the result in the response; if a file is needed - only in scratchDir with an absolute
    path, no shell redirections (Gate 1 catches only Edit/Write). Event ledger `SP` ~229, ~299.
16. The COO names the dialog and what it approves, never says what to click. `SP:36`, `SO:351`.

**Session and context.**
17. The resume note in memory (`/pnp:mission`) is rewritten whole, ≤ ~10 lines, never appended to
    (Silerax: 174 KB, ~25% of the context at start; ours grows too). `SP:42`.
18. In place of the rejected „дайджест“ ("digest") (see below): optimizing the text of the first-read files -
    the full doctrine in fewer words; and the GPT analysis. Measurement (2026-10-14, a sonnet agent over the
    transcript of a Silerax session after `/clear` + `/pnp:mission`, 175.7k total, Messages 132.8k): the
    doctrine ~65k (WORKFLOW.md 32k - two Reads, hits the 25k per-read ceiling; LOOP 11k; ORCHESTRATOR 5k) +
    their overrides 17k; the plan ~34k in two chunks (~400 lines, very wide lines); injected before the first
    tool call ~20k; thinking ~3k; repeated reads 0 (the `/context` hint „save ~19.3k“ is wrong).
    `/context` counts chars/4, really ~2.4 characters/token for Cyrillic + markdown - it underestimates by ~40%.
19. The plan as a folder, a ticket per file: `PLAN_<ABBR>/README.md` (goal, shared decisions, ticket order) +
    `<REF>.md` (brief, acceptance, completion record); the COO reads the head + the current ticket; at a
    close, a decision that affects future tickets is raised as a row in the shared decisions; a line
    „Зависи от: <REF> (<решение>)“ ("Depends on: <REF> (<decision>)") for an explicit dependency. Payload:
    Gate 2 lookup, mission, readiness, archiving; the old plans stay. **Operator: a total change of the core
    workflow - discussed further at planning.**
    `SP:68-75`, `CE:792-800`.
20. At a ticket close the COO recommends in one line „оставаме“ ("we stay") / „нова сесия“ ("new session");
    compaction - only within a ticket; planning and readiness are not a boundary. No stop.
    `SM feedback_session_per_ticket.md`.
21. Every incident becomes a row in the event ledger (+ a candidate, if general); memory only points - otherwise
    PnP never learns (half of today's intake was only in Silerax's memory). Event ledger `SP` ~215.

**Writer, QA, tests.**
22. Parallel Writers - allowed (not by default) when the work splits by files without overlap; the decision
    and the split in the brief. Trap: the Agent tool's `isolation: "worktree"` makes the copy from main, not
    from the current branch. `SP:25`, `SO:464`, `SM project_e2e_local_lessons.md` #15.
23. A test that cannot fail (`expect(true)`, `|| true`, `>= 0`, checks behind `if(visible)`) is a finding - a
    row in REVIEW_CHECKLIST § Test quality (30+ in Silerax's E2E). `SP:48`.
24. A command that can run past 5 min runs only in the background with an explicit ceiling - the Writer's
    template and the briefs (the 10 min ceiling killed a package at 88/137). Note: a background task that
    starts a server never sends a notice - it is watched through the log. `SP:60`, `SO:76`,
    `SM project_e2e_local_lessons.md` #16-17.

**Operator channel.**
25. Passes are named by role and number („одитор, пас 2 (Codex)“ - "auditor, pass 2 (Codex)"), the request
    for a word says what it unlocks; the verdict names who gave it
    („одиторът потвърди“ - "the auditor confirmed" - a bare „Потвърди …“ reads as a request to the operator). `SP:26`, event ledger `SP` ~249.
26. A dialog to the operator (AskUserQuestion, numbered options, one topic, a global/module label) - ONLY when
    the work on the current ticket cannot continue without the answer. Everything else (a question outside
    the ticket, a scan finding outside the scope) is written into a
    „въпроси към оператора“ ("questions for the operator") list and asked at once at the end of the ticket; the work does not stop. Operator: a
    dialog left for two hours stops the ticket, the cache cools and is paid for again, expensively.
    `SM feedback_decision_dialogs.md`.
27. Every ticket in the plan carries a line „COO: <модел>, защото <коя проверка за силен COO е да>“
    ("COO: <model>, because <which strong-COO check is yes>") - the operator sees at approval when a strong
    model is worth it. `SP:51`, `SO:460`.
28. WORKFLOW § Commit & Push Authority says „Commit: Writer only“, while in practice (here and in Silerax) the
    records and the documentation are committed by the COO - the text is fixed to say which is which: the
    code - Writer, the records and the documentation - COO; the practice does not change. `SP:41`, `SO:41-48`.
29. Cleaning `.aiwf` as part of the ticket close: the valuable goes with the plan (readiness/), `.aiwf` keeps
    only the live mechanics; the deletion is destructive - the list is shown with the close commit (the
    operator is there anyway, it is not a new stop). Silerax: 546 files / 56 MB.
    `SM project_aiwf_cleanup_pending.md`; partly § „Черновите живеят в репото“ below.
30. Instead of a general „без предположения“ ("no assumptions"): an extension of „Verify the failure claim“ -
    every claim the COO relays to the operator (also from an agent) is checked first in the code/tree,
    otherwise it is called „непроверено“ ("unverified"); asking - only if the work blocks (item 26). Example
    2026-10-14: the COO relayed „общ за машината“ ("machine-wide") for `last-review-session.txt` without a
    check. `SM feedback_no_assumptions.md`.
31. LOW priority: the project may keep in the repo a list of known-failing tests; VERIFY still reports the
    exit code honestly, but success is
    „нула нови падания спрямо списъка“ ("zero new failures against the list"); the list changes only by an operator word (risk: the list becomes a dumping bin). Silerax carries
    it as a local override of „VERIFY honesty“. `SO:226-248`.
32. VERY LOW priority, eventual: canon ↔ mockup differences - a list and a global/local decision for the
    module when planning a ticket with a design. Operator: debatable whether it is for the plugin; for now it
    stays a local Silerax rule. `SP:24`.

The small correction round without a verification pass (`SO:446-455`) is not a new record - it is already a
candidate in § „От Silerax UIR-003“ (Suppression dual), its priority is raised there.

**Rejected at the review (not to be rediscovered).** A doctrine digest at start (a retelling,
„заглавието не е текстът“ - "the title is not the text" - replaced by item 18); a script that writes to the
database without a dialog (local to the project); QA off by default (decided per ticket in the plan); an
„E2E: да/не“ ("E2E: yes/no") line in the brief (not for us); a mixed model for the Writer (4 comparisons, the
decision is a setting); a session launched from a subfolder (does not happen in Silerax - the root is `S`);
PQA § 5 B/C/D - a question to the fact-check agent about what the called code does, the numbers in the
acceptance from a command, an „авторски блокери“ ("author blockers") column in the statistics (operator: we
touch nothing here - the doctrine grows); comparing the migrations before push (their deploy specifics,
`SO:71`).

## [ПУСНАТ 0.2.16 DRAFTS-001 + HARD-023] Черновите живеят в репото; `.aiwf` носи само живата механика на loop-а (роден 2026-10-02, операторска дума)

Кандидат без ref. Операторът го даде в Silerax (предадено от сесия „Silerax Plan Session 03“) и
каза да влезе тук като кандидат: „драфтовете трябва да живеят в репото; в .aiwf се пишат само когато
репото е блокирано от друга сесия; одобрени планове нямат дубликати в .aiwf; ако трябват за история,
да намерят мястото си в репото“. Две половини:
- **За това репо (проектно правило + чистене):** чернова на план в `dev/backlogs/drafts/PLAN_<ABBR>.draft.md`;
  scratchDir (`.aiwf`) само за `review-brief.txt`, `last-review-session.txt`, `route-state.json` и
  артефактите на ТЕКУЩИЯ тикет/readiness цикъл; историята (readiness вердикти, consequence scan,
  behavior ledger, own pass) в `dev/backlogs/readiness/<ABBR>/` при лендинга/closeout-а; одобрен
  план няма дубликат в `.aiwf`; после инвентаризация на `.aiwf` в три списъка (остава / мести се /
  трие се), показани на оператора преди действие. Silerax го изпълни в commit-и `e009efd2`,
  `fd6e7652`, `065383d1` (по доклада на сесията).
- **За payload-а:** `paths.draftsDir` в схемата и правило за задържане на артефактите. Пряко засяга
  PLAN_RGATE: блокове C и D там препоръчват scratchDir като „естественото място“ за scan и own-pass
  файловете — при приемане тази препоръка се сменя.

**[дописано 2026-10-02]** Половината за payload-а → PLAN_DRAFTS (`dev/backlogs/active/PLAN_DRAFTS.md`,
DRAFTS-001, 0.2.16; без нов ключ — конвенция под `plansDir`, D1); половината за това репо → HARD-023 в
PLAN_HARD (чака дума), а правилото за `.aiwf/` в § Workspace paths е блок P на PLAN_DRAFTS (замества
текста на HARD-023). Readiness историята на PLAN_DRAFTS е първата, влязла в git
(`dev/backlogs/readiness/DRAFTS/`).

**[дописано 2026-10-04]** Половината за payload-а е ЗАТВОРЕНА: DRAFTS-001, кодов commit `dd2b81f`
(0.2.16); планът е архивиран като `dev/backlogs/archive/008_PLAN_DRAFTS_2026-10-04.md`; блок P е в
`dev/PROJECT_OVERRIDES.md` § Workspace paths. Половината за това репо е ЗАТВОРЕНА с HARD-023,
`e2e13fe` (2026-10-04): `.aiwf` = трите живи файла; историята на RDY/RGATE и CONS арбитраж брифът са
тракнати под `dev/backlogs/readiness/`. Кандидатът е изчерпан.

## [ПУСНАТ 0.2.17 LEAN-001] plansDir под игнориран път — self-check observation по префикс `.aiwf/` + предупреждение в интервюто (роден 2026-10-02, от readiness пас 2 на PLAN_DRAFTS)

Кандидат без ref. PLAN_DRAFTS D1 и блок E казват, че `plansDir` под `scratchDir` (Gate 3 пуска
`.aiwf/**`) или под друг игнориран път е извън правилото за черновите (нищо там не стига до git;
`git add` на игнориран път отказва с exit 1), но нищо не го ЗАСИЧА: схемата приема всеки низ, setup го
скафолдва тихо (`generate.mjs` containment отказва само абсолютни/`..` пътища), интервюто предупреждава
само за заварени PLAN_* файлове, self-check-ът проверява само съществуване (scan редове 97-101 на
PLAN_DRAFTS). Под `.aiwf` е решимо по префикс без git; „друг игнориран път“ иска `git check-ignore`.
Нов observation (наблюдение, не проверка) + един warn в интервюто — отделен тикет, когато дойде.
**[дописано 2026-10-14: в PLAN_LEAN, тикет LEAN-001 — `dev/backlogs/active/PLAN_LEAN.md` D6/D7.]**

## [ПУСНАТ 0.2.17 LEAN-001 - всичките шест] От readiness цикъла на Silerax PLAN_PUR v3 (роден 2026-10-02, доклад на сесия „Silerax PLAN_PUR Rediness 2b“ по операторска дума „прати на ПНП за мнение“; операторът още не е решил)

Кандидати без ref, за 0.2.17 (0.2.16 = DRAFTS-001 е одобрен и затворен по обхват). Докладът: PUR v3
(5 тикета, 1276 реда) — пас 1 NEEDS-FIX 11 (4 дизайн/гонки, 2 отхвърлени „приети остатъци“, 4
прецизности, 1 продуктов), пас 2 NEEDS-FIX 7 (3 незатворени + 4 родени от ревизията), ревизия 3 без
пас по операторско решение; own pass-ът в отделен ход хвана 12 + 2 авторски дефекта преди пасовете;
цена 400k Codex + ~1,3M sonnet + 2 COO сесии. Авторските блокери на пас 1 при Silerax: RST 11 → TAL 10
→ LIV 11 → PUR v1 12 → TRF 13 → PUR v3 11 — броят не пада с 0.2.15, класът се мести (указатели/
acceptance → дизайн/concurrency). При PnP: RGATE 9 → DRAFTS 5.
- **Behavior ledger (Step 2a) + consequence scan (Step 2c) = един агент на тикет** с два вида редове
  (какво ПРАВИ веригата / какво НАРУШАВА решение) — спестява един диспач на тикет; гейтът чете scan
  файла, затова артефактите остават два файла или един с две заглавия — дизайнът е на кандидата.
  Домове: `skills/review/SKILL.md` Step 2a/2c, `templates/ORCHESTRATOR.md.tmpl` § Behavior ledger duty.
- **Старт→стоп двойката става незадължителна в payload-а** — `templates/PNP_CANDIDATES.md.tmpl` §
  Pass statistics и `docs/WORKFLOW.md` § The transfer surface още искат „the start/stop pair the
  operator read off the host“; тук е операторско правило от 2026-10-02, че не се иска. Docs-class.
- **Нов readiness клас: lock/concurrency решение, оставено като „приет остатък“** — одиторът не го
  приема (PUR пас 2: 2 от 4 нови блокера); `docs/READINESS_CLASSES.md` + един ред в шестте проверки
  на own pass-а („за всеки запис — кой lock, какво върви паралелно“).
- ~~**Гейтът назовава граматиката на затварянето в отказа си**~~ — ОТПАДА (2026-10-04, проверено от
  Silerax и тук): 0.2.15 вече го прави — `scripts/engine/plan-gate.js:287` печата „its closure must
  start with "plan:" or "no defect:"“ (`CLOSED_PREFIXES` на `:63`). Ухапването на двата консуматора и
  на PnP (40 от 62 реда) е било ПРЕДИ гейтът да бъде пуснат, не въпреки съобщението му. Остава само
  удебеленият ред в Step 2c като docs бележка, ако 0.2.17 пипа SKILL.md — не е самостоятелен кандидат.
- **Step 2d „every file:line opened“ — от кого:** указателите са работа на fact-check гейта; own
  pass-ът отваря онова, по което Колегата ДЕЙСТВА, и чете ledger редовете (Silerax: 629 отворени от
  агенти в own pass-а, 4 FALSE след fact-check — нулев добив). Едно изречение в Step 2d.
Отхвърлено от PnP (мнение, не решение): сливане на делта скана и делта fact-check-а в един агент —
двата договора са различни (повърхност срещу твърдения; fact-check-ът забранява sampling) и при
PLAN_DRAFTS всеки рунд намираха различни неща; спестяването е да вървят ПАРАЛЕЛНО, както тук.

**[дописано 2026-10-14: планът е одобрен — `dev/backlogs/active/PLAN_LEAN.md`, тикет LEAN-001; точка
(2) е сменена с операторска дума 2026-10-14: двойката се МАХА изцяло, не става незадължителна — D3.]**
**[2026-10-04, операторска дума „всичките шест“] Обхватът на 0.2.17 е РЕШЕН:** (1) ledger + consequence
scan = един агент на тикет, две таблици, два файла; (2) старт→стоп двойката незадължителна в payload-а
(`templates/PNP_CANDIDATES.md.tmpl` § Pass statistics, `docs/WORKFLOW.md` § The transfer surface);
(3) readiness клас concurrency/lock („приет остатък“ не минава) + ред в шестте проверки на own pass-а;
(4) Step 2d „every file:line opened“ → „every pointer the Writer acts on; the ledger rows read as
behavior; every instrument run with valid AND broken input“; (5) plansDir под игнориран път —
self-check observation по префикс `.aiwf/` + warn в интервюто (кандидатът по-горе); (6) от
консуматорския блок „вътрешните стъпки отпадат“ (Silerax `dev/PROJECT_OVERRIDES.md:437-449`, Furnissimo
`docs/ai/PROJECT_OVERRIDES.md:334-351`, inventory 2026-10-04): планът носи `file:line` само където
Колегата действа или acceptance-ът чете; контекстът цитира по секция и символ — изречение в WORKFLOW
§ Ticket brief contract („A factual claim about existing code carries a file:line pointer“ се стеснява)
и § Plan readiness review. Точка (1) на същия блок („няма отделен агент за опресняване на указателите“)
е вече покрита от Step 2b (FALSE редът носи вярната стойност) — без промяна. Форма (COO решение): ЕДИН
план, ЕДИН code-class тикет (self-check observation + ORCHESTRATOR rerender → миграция 0021 + bump),
`docs/READINESS_CLASSES.md` получава класа. Двата консуматора носят (1)-(4) и (6) като локални правила с
клауза „изтича с 0.2.17“ — note op-ът на миграцията им казва кои редове да махнат. Планирането — в НОВА
сесия (тази е на половина контекст при избора; handover в `.aiwf/session-brief.md` по `/pnp:brief`).

## From Silerax UIR-003 - E2E/QA hygiene and the verification pass (born 2026-10-04, a cross-session message from session „Silerax UIR-003“ by operator word; recorded here with the operator word „вкарай го, кандидат 2.18“)
(was: „От Silerax UIR-003 — E2E/QA хигиена и верификационният пас (роден 2026-10-04, cross-session съобщение от сесия „Silerax UIR-003“ по операторска дума; записано тук с операторската дума „вкарай го, кандидат 2.18“)“)

Candidates without a ref, for **0.2.18** (0.2.17 = PLAN_LEAN is in readiness). The operator: the three
projects (PnP, Silerax, Furnissimo) hit the same problems. The context at Silerax: an R2 runtime/UI ticket
(37 files), one Codex pass with 1 blocker (158,536 tokens), a correction round of two lines, a ~49-minute
scoped E2E list run TWICE, a full disk (ENOSPC on `npm run build`), a lost report of the first run.
Source of the record: Silerax PLAN_UIR § UIR-003 completion record and Silerax `dev/backlogs/PNP_CANDIDATES.md`.
- **E2E trace mode `retain-on-failure` by default** - `--trace on` writes a trace for every test (0.70 GB
  per run, ~455 zips), while QA is an artifact judge over the JSON report and the screenshots, not over
  traces; the payload (the QA/E2E recipe, `skills/qa/SKILL.md`, `docs/CODEX_REVIEW_QA_RECIPE.md`) recommends
  `retain-on-failure`, unless the ticket names the traces as QA evidence.
- **A scoped E2E re-run after a correction round** - today the COO runs the ticket's whole E2E list after
  the last round; for a small local round that is a full wall-clock for nothing. The re-run is scoped to the
  round's blast radius (the ticket's visual/QA spec + the specs that touch the changed files), with a
  fallback to the full list when the round touches a widely imported file or the Writer's report from the
  first run was not kept (the next candidate).
- **The Writer's report from the E2E run is kept at once** - it lives only in the runner's outputDir
  (cleaned at every run; at Silerax deleted to free disk), so the evidence of the first run was lost and the
  COO repeated the whole run. The Writer copies the JSON report to
  `<scratchDir>/<ticket>-e2e-writer-<stamp>.json` right after the run; the baseline comparison can run over
  it; plus a COO duty: before proposing to delete a test/build output directory - a check that it holds no
  uncopied evidence.
- **Suppression dual for the verification pass after a small code round** - RULE-BEARING (guard (g): the
  text lands only with operator approval, when a plan takes it). The doctrine: code round → verification
  pass on an operator word; two consecutive tickets (UIR-002, UIR-003) got the same answer
  „без пас“ ("no pass") for micro deltas. The candidate: no verification pass and no question when the round's delta is
  ≤ ~10 lines in files the previous pass already audited, and carries a unit test with a seen red negative
  control; above that - asking as today. Silerax carries it as a local override in
  `dev/PROJECT_OVERRIDES.md` until the payload takes it. **The priority raised 2026-10-14** (operator „да“
  at the review of the Silerax intake: it saves a paid pass and a mid-way stop - it works for autonomy);
  exception: migrations, database permissions, authentication - always a pass (`SO:446-455`).
- **Build/tracing hygiene: warn for an outputDir under a traced app root** - a dynamic `path.resolve(...)`
  in server code made Next file tracing copy the whole `test-results/` (14,321 files, incl. traces) into
  `.next/standalone`; every build after a traced E2E run duplicated gigabytes. A temporary rule at Silerax:
  build before E2E in VERIFY. A candidate for the self-check or the setup interview: a warning when the
  runner's outputDir sits inside an app root the build traces (generic for Next.js consumers).
  **[SHIPPED 0.2.19, PLB-004 (c): `scripts/setup/e2e-trace-note.mjs`, a self-check `[NOTE]` and an
  interview line - an observation, never a failure; the build-before-E2E rule stays Silerax's own.]**

## [ОТЛОЖЕН 2026-10-14 - изследване] ГЛАВЕН ПРИОРИТЕТ — топъл пас с компенсациите по-скъп ли е от студен? (роден 2026-09-24, операторска дума)

Кандидат без ref. Readiness цикълът на HARD-019+018 (`gpt-6-sol`/xhigh) даде 138,441 токена за
студения пас 1, а за топлите пасове 2 и 3 — 241,810 и 368,154 принт. (кумулативни по сесията).
Операторът отчита, че топлите „доста изядоха от квотата“, но двойки на брояча не са подадени, така
че цената НЕ е мерена. Хипотезата: трите компенсации (всичко наново от диска + независимо търсене)
карат топлия пас да върши почти цялата работа на студения, и то върху натрупан контекст. С 1M
контекста на Sol 6 компактът, който досега пенсионираше топлите сесии, почти не настъпва.
Resume политиката в `skills/review/SKILL.md` и `skills/qa/SKILL.md` („readiness пас след първия
може да е топъл само с компенсации“, „пенсионирай при първия компакт“) е мерена на Sol 5.6.

**Как се решава:** операторът тества след 0.2.11 във Furnissimo и Silerax, със старт→стоп двойки на
брояча за студен и топъл пас от един и същи вид. По Pass statistics правилата токените са
диагностика, а двойката е мярката. Изходът е или „топлият с компенсации остава“, или промяна на
resume политиката (напр. readiness след първия винаги студен на модели с голям контекст).

**Допълнение (2026-09-24, данни от Silerax CAP-002):** там топла кодова верификация БЕЗ компенсации
(CAP-002 P2, resume на P1, с верига в evidence pack-а) струва 10 точки срещу 32 за студения P1.
Тя обаче се смесва с веригата, защото и двете промени са в един пас. При нас топлите readiness
пасове С компенсации изглеждаха по-скъпи от студения. Хипотезата се стеснява: скъпото вероятно не
е „топъл пас“, а трите компенсации върху голям натрупан контекст. Тестът трябва да разделя двете:
топъл без компенсации (кодова верификация) срещу топъл с компенсации (readiness) срещу студен.
Източник: `D:\Stratex\dev\backlogs\active\PLAN_CAP.md` §Процес т.6, таблицата с пасовете.

## The E2E test runs BEFORE the code audit when the ticket has E2E (born 2026-09-24, from Silerax CAP-003)
(was: „E2E тестът се пуска ПРЕДИ кодовия одит, когато тикетът има E2E (роден 2026-09-24, от Silerax CAP-003)“)

A candidate without a ref. In Silerax CAP-003 three paid verification passes (P6–P8, `gpt-6-sol`/xhigh,
~150–185k tokens and ~6 points of the 5h quota each) went mainly into the robustness of the E2E spec: the
setup does not find the product, a missing supplier location, a negative test impossible with an EUR-only
seed, a timing-dependent case. The auditor works in a read-only cell and cannot run the suites (see the
note „клетката на Одитора не може да пуска суитите“). So it finds such defects by reading, at the cost of a
paid pass, while one run of the spec would show them for free. Today's line in `docs/WORKFLOW.md` § Routes
is Writer → `/pnp:review` → `/pnp:qa`, and the E2E runner goes only before QA. **Direction:** for a ticket
with E2E, the COO runs the configured runner over the Writer's spec BEFORE the code audit. A red spec goes
back to the Writer, without a paid pass, and the auditor gets a green run as evidence in the evidence pack.
Source: `D:\Stratex\dev\CAP003_AUDITOR_EXPERIMENT.md` (P6–P8).
**Waits for a word.**

## The chain (chain-trace) in the evidence pack of the code passes - one line, not a new rule (born 2026-09-24, from Silerax)
(was: „Веригата (chain-trace) в evidence pack-а на кодовите пасове — един ред, не ново правило (роден 2026-09-24, от Silerax)“)

A candidate without a ref. Silerax introduced a rule (`D:\Stratex\dev\PROJECT_OVERRIDES.md:360-372`): every
code pass gets an ordered chain „вход → endpoint“ ("input → endpoint") with `file:line` for every behavior
of the Outcome, with an adversarial frame
(„счупи го, намери какво пропуска“ - "break it, find what it misses"). Data: CAP-003 P1 vs P2 (the same model, the same diff) → the same findings at Δ5h 8 vs 14 and
110k vs 165k tokens. Passes P6–P8 with a chain found defects OUTSIDE it, so „приспиване“ ("lulling") was not
observed. Limits: N=1 per variant, a counter in whole points, and the diff had no production bug on the
chain's path. Exactly there the concern would show. The chain also needs the anchors re-set after every
round.
**Direction:** the payload already has a chain duty before a paid readiness pass
(`.claude/aiwf-native/ORCHESTRATOR.md` § Chain-trace duty). So NOT a new rule, which would be more
duplication, but one line in the evidence pack paragraph in `skills/review/SKILL.md` that points at the
existing format for the code passes. **Start condition:** more data from Furnissimo. **Waits for a word.**

## [ЗАТВОРЕН - HARD-020 0.2.12, без отделен гейт] Readiness pre-read — scan-tier агент прилага шестте readiness проверки адверсариално преди пас 1 (роден 2026-09-27, от Silerax 004 по операторска насока)

Кандидат без ref. Наблюдение от два консуматора, същият модел на провал: readiness пас 1 на
Codex връща предимно АВТОРСКИ блокери — Silerax PLAN_RST 11, RST-004 7, PLAN_TAL 10; Furnissimo
PLAN_SCHEMES_RUNS 8 (числата са от съобщението на Silerax 004; източници: Silerax
`dev/backlogs/PNP_CANDIDATES.md` § Pass statistics и § Event ledger 2026-09-27,
`dev/backlogs/archive/007_PLAN_RST_2026-09-27.md` § RST-004 completion record; Furnissimo
`docs/backlogs/PNP_CANDIDATES.md` § Event ledger 2026-09-27). Същото е записано и тук: WORKFLOW
§ Plan readiness review носи 8 от 10 авторски блокера на плана за одитната таблица. Класовете са
ДИЗАЙН пропуски: проверка, която не може да падне; обхватен guard, сляп за `git mv`; асъртиран
списък с несъществуващи функции; доказателство без позитивна проба; правило без крайния случай;
противоречие с контракта на Writer-а. Fact-check гейтът по конструкция не ги хваща — той проверява
факти (файл:ред, бройки, съществуващи команди), не решения; днес ги намира само платеният одитор.
**Предложение:** в payload-а, до fact-check гейта (`/pnp:review` Step 2b), задължителен pre-read
преди пас 1 на всеки план и на всеки R2/R3 бриф: един `sonnet` агент прилага шестте readiness
проверки адверсариално върху целия документ и връща САМО пропуски в три групи — A (Writer-ът не
може да изпълни / проверката не може да падне или да мине), B (невярно или непроверимо твърдение),
C (консистентност) — без вердикт; COO затваря A и B преди паса. Не е одитор и не се брои за пас
(както fact-check гейтът); допълва собствения проход на COO с чужди очи. Промптът от пробата на
Silerax (върху ревизираната PLAN_TAL, преди пас 2) е готов за шаблон — поискан дословно заедно с
резултата от пробата.
**Разпит с факти (2026-09-27, операторска дума „разпитай го с факти защо се стигна до тук“;
отговорите на Silerax 004 са по неговите ledger-и):** от 17-те итемизирани блокера (RST-004 7 +
PLAN_TAL 10) ВСИЧКИТЕ 17 попадат под вече написано правило (fact-check обхват 3; „must be able to
fail“/tripwire 4: 5; brief precision 5; process dry run 2; § Routes „изпълним артефакт свършва R1“ 1;
без exit-суфикс 1) — класове без правило: 0. Причината не е липсващо правило, а: (а) собственият
проход на COO в ОТДЕЛЕН ход — без доказателство в PLAN_RST, сгънат в чертожния ход при RST-004
(операторска корекция в Event ledger), от същия автор при PLAN_TAL; (б) process dry run — без
доказателство / един ред в същия ход / пропуснал `git mv` и R1-маршрута; (в) инструментите са
симулирани върху stub-ове (grep върху stub README, scope блок без staged rename), не пуснати на
реалното дърво; (г) fact-check гейтът е вървял всеки път, но обхватът му е „факти в дървото“ —
семантична осъществимост (несъществуващи функции зад вярно изречение), placeholder литерал и
„какво остава на Writer-а“ са извън него; един негов finding („vacuous pass“) е бил под-поправен от
COO. PLAN_RST 11 и Furnissimo 8 не са итемизирани никъде. Двойки на брояча не са записвани от
2026-09-22 — цената е само в токени (пас 1: PLAN_RST 188k, RST-004 109k, PLAN_TAL 173k по wrapper).
Пробата на pre-read-а: резултат чакащ; потвърждение от пас 2 — няма (PLAN_TAL спрян преди пас 2).
**Стеснено предложение (Silerax 004 е съгласен):** без втори гейт — Step 2b получава шестте
readiness проверки + „какво остава Writer-ът да решава“ и връща втори списък (пропуски A/B/C) до
списъка с невярни твърдения; същият scan-tier агент, един гейт. Остава отворено дали инструмент
може да замести проход, който е бил прескачан — доказателството е пробата плюс потвърждение от
платен пас.
**ЗАТВОРЕН БЕЗ ПРОМЯНА В PAYLOAD-А (COO решение по операторска дума 2026-09-27: „кодекс не трябва
да ни казва, че 3+5 е равно на 8“; 10 авторски блокера са вина на COO, не липса на механизъм).**
Фактите горе го доказват: нула класове без правило, всички пропуски са прескочени или сгънати
стъпки, които доктрината вече командва. Поправката е изпълнението им — собствен проход в отделен
ход, инструменти пуснати на реалното дърво, dry run написан, верига авторствана — и авторските
блокери на пас 1 се докладват от COO като негов собствен резултат с името на прескочената стъпка.
**Данни от пробата (Silerax 004, 2026-09-27, върху ВЕЧЕ ревизираната PLAN_TAL след затворените 10
блокера):** sonnet, 172,265 токена, 17.5 мин, 14 tool uses → 13 пропуска (A=5, B=5, C=3), 12
приети, 1 шум; петте A са реални изпълнимостни дупки (anchor вътре в чуждо тяло на секция; env
променлива, заредена веднъж и ползвана през отделни tool извиквания; изискване за точен низ `Result:
FAIL` без записан FAIL изход; очакван grep брой сгрешен с едно; plan-landing commit-ът липсва от
dry run-а). Пас 2 не е вървял (операторски стоп) — потвърждение няма. Промптът на пробата,
дословно както е пуснат от Silerax 004 (Agent tool, `general-purpose`, `model: sonnet`):

```text
ADVERSARIAL READINESS PRE-READ (read-only; no edits; no supabase/npm/npx/pwsh -File/git-mutating
commands). You are NOT the auditor and return NO verdict — only GAPS. Target: <plan file> (read in
full). Context: <repo root(s)>, <sibling repos READ-ONLY>, PnP payload <root> (read docs/WORKFLOW.md
§ Plan readiness review, § Ticket brief contract, § Routes; docs/REVIEW_CHECKLIST.md). <If a prior
paid pass exists: its blocker classes, all now revised.> Assume the next paid pass will look for the
SAME classes plus anything else.

Apply the six readiness checks adversarially to EVERY ticket and every decision: (1) repo-match —
open pointers you doubt; (2) scope boundaries; (3) hidden discovery / unresolved decision — for each
ticket list concretely what the Writer would still have to DECIDE or DISCOVER (a column name, a role
grant, a file layout, a command flag, an order of operations) that the plan does not fix; (4)
dependency order + the gate dry-run: any command that needs a dialog/gate the plan does not name; any
step assuming state a prior step leaves different; (5) acceptance — for each block: can it pass on
broken work? can it fail on correct work? does it observe every Risk-threshold item? are the expected
outputs consistent with the tool's real output (…examples…); (6) git prerequisites and what the
Writer contract (.claude/agents/writer.md) forbids or requires that a block or worklist violates.
Also: contradictions between two places in the plan (a decision vs a ticket, a worklist vs an
acceptance, ticket N vs ticket N+1), language/command mismatches, and anything a Codex reviewer with
the sibling tree open would call a false statement.

OUTPUT: a numbered list of GAPS only, each: `<draft line(s)> | <ticket/decision> | <gap in one
sentence> | <what would close it, one sentence>`. Group by severity: A = the Writer cannot execute or
the check cannot fail/pass; B = false or unverifiable claim; C = wording/consistency. No praise, no
summary of what is fine. End with `GAPS: A=<n> B=<n> C=<n>`.
```

Използване без промяна в payload-а: WORKFLOW § Plan
readiness review вече позволява допълнителни инструкции към fact-check агента — шестте проверки
могат да се качат като такава инструкция в конкретен readiness цикъл; не заместват собствения проход.
**Какво от това влиза в PnP (COO решение 2026-09-27):** нов гейт — не. Едно изречение — да, в
цикъла на 0.3.0: шестте проверки + списъкът с пропуски стават ТРЕТАТА стояща допълнителна
инструкция към fact-check агента в `/pnp:review` Step 2b (и абзацът в WORKFLOW § Plan readiness
review, който днес изброява две), със същата уговорка „не е собственият проход, не се брои за
пас“. Мотив: правилото вече стои дословно в паметите на двата консуматора — две копия на едно
правило извън payload-а са точно дрейфът, за който 0.2.9 плати; payload-ът е единственият дом, от
който консуматорите го получават без преписване. Всичко останало (разпитът, ledger редовете за
авторските блокери, ruling-ът) остава в паметите и ledger-ите на двата проекта — за това са.

## [ПУСНАТ 0.2.13 RDY-001] Поправката след пас затваря намерените блокери и не добавя нищо ново (роден 2026-09-28, за HARD-011 / 0.3.0)

**ЗАТВОРЕН 2026-09-30:** изречението легна в `docs/WORKFLOW.md` § Plan readiness review с RDY-001
(0.2.13, `e5676c2`), не с HARD-011.

Кандидат без ref — едно изречение в `docs/WORKFLOW.md` § Plan readiness review. Единственият ред от
„собственото правило“ на Furnissimo (памет `own-pass-separate-turn`), който payload-ът не носи;
останалото там е преразказ на § Plan readiness review + tripwire 4 и стана указател на 2026-09-28.
Данни: HARD-020 readiness пас 2 върна 4 блокера, 2 от които родени от ревизията между пасовете.
Влиза с HARD-011 в цикъла на 0.3.0 (COO решение: не отделно издание за едно изречение).

## [ОТЛОЖЕН 2026-10-14] RENAME-001 [R3] — пълен rename AIWF → pnp (роден 2026-09-03)

Изваден от `active/PLAN_PNP_PUBLIC.md` по операторско решение 2026-09-11 — не е част от тази
мисия. Текстът е дословно както стоеше в плана:

> Пълният rename (config/директории/скриптове/región/resolver пътища; „Three names" в README пада)
> — R3 по route-а: мини-план + readiness (`review.plan.passes`) ПРЕДИ Writer, `r3/<topic>` клон,
> миграция, която мести файлове във всяка инсталация, proof на consumer-а. Обхватът е описан в
> историята на кандидата (2026-08-31). **Чака собствена дума за диспач** (и е последният преди
> Closeout, освен ако операторът не реши друго).

## `--show` of aiwf-roles.mjs prints the table and exits with process.exit(0) (born 2026-09-19)
(was: „`--show` на aiwf-roles.mjs печата таблицата и излиза с process.exit(0) (роден 2026-09-19)“)

A candidate, without a ref. `scripts/setup/aiwf-roles.mjs:708`: the same POSIX class as CONS-011 (an async
pipe + a forced exit), outside the guard, because it does not consume `finishWithSelfCheck`. The table is
small and no truncation was observed; recorded as an observation from the completion record of CONS-011.

## Note (not a candidate, but evidence): the host behavior has already changed once
(was: „Бележка (не кандидат, но е доказателство): поведението на хоста вече се е сменяло веднъж“)

0.2.2 recorded the honest limit
„passthrough клонът на Gate 4 стъпва на поведение на хоста, което това repo не може да тества: ако хостът спре да мачва по подкоманда, пропуснатите форми тихо престават да бъдат гейтнати и нито един тест няма да позеленее"
("the Gate 4 passthrough branch rests on host behavior this repo cannot test: if the host stops matching per subcommand, the skipped forms silently stop being gated and not one test turns green").
That was phrased as a hypothesis.

**Not a hypothesis - it has already happened, in the opposite direction.** The second consumer carries a
measured record from **2026-08-31** (UIS-009): `cd /d/<root> && git commit …` went through WITHOUT a dialog,
two commits, because the command starts with `cd` and does not match `Bash(git commit:*)`. Today,
2026-09-12, the Claude Code documentation describes an operator-aware matcher that splits on the six
separators and matches every subcommand - that is, the same command IS caught today.

So between August and September 2026 the host behavior changed, and exactly along the axis Gate 4 rests on.
Here it changed in the safe direction. The limit stays true and now has a date and evidence, instead of being
caution. The matching consumer candidate is closed too.

## [ОТЛОЖЕН 2026-10-14 - чака случай] PS-EOL — трите codex `.ps1` дрейфват на LF при рън (родена 2026-09-12)

Записът нарочно няма ticket ref — не е в план, малка находка, паркирана.

**Измереното (2026-09-12):** `scripts/native/ps/codex-{qa,qal,review}.ps1` стояха ` M` в
`git status` цялата мисия. Проверено първолично: `git diff --stat` И `git diff --ignore-cr-at-eol
--stat` → **нула** файлов ред (само warning-и) — съдържанието е байт-идентично с HEAD. Разликата е
само line endings: `.gitattributes` пинва тези `.ps1` на `text eol=crlf`, а работното копие дрейфва
на **LF**, оттам `git status` ги маркира, а `git diff` не вижда нищо. Изчистени с
`git checkout -- scripts/native/ps/codex-*.ps1` (възстановява CRLF от HEAD, нула промяна в кода) —
дървото стана чисто.

**Хипотеза за причината (не доказана):** нещо в средата пренаписва тези три файла на LF, вероятно
при пускането на codex wrapper-ите (WSL канал или редактор с LF default пипа файла при рън). Само
трите codex `.ps1` дрейфват — не и другите payload файлове — което сочи към самия codex рън път.

**Посока, не решение:** при следващ codex рън виж дали пак дрейфват; ако да — намери какво ги пипа
(strace/наблюдение на рън пътя, или дали wrapper-ът се презаписва от себе си). Ако дрейфът е
неизбежен през WSL, алтернатива е `.gitattributes` да ги остави с естествения им EOL вместо
пин на CRLF — но това пипа selfcheck-а, който брои byte-level (bash LF-only; ps CRLF). Малко,
не спешно. **Чака дума** (и следващ codex рън като тригер).

## Note (not a candidate): the auditor's cell cannot run the suites
(was: „Бележка (не кандидат): клетката на Одитора не може да пуска суитите“)

For the second time in two consecutive tickets the Codex pass reports that it cannot execute the acceptance
suites - the read-only cell does not allow creating temporary directories (`mkdtemp`), and every suite here
rests on that. Once it was arbitrated as an environment artifact (PUB-001), now it repeated (GATE-001 pass 3).

So it is not an incident but a property of the path: **the auditor's verdict never covers the execution of
the tests.** Verification rests on the Writer's run plus an independent COO-dispatched run. Today that was
done explicitly and is recorded in the completion record of GATE-001. Recorded here so it is not
rediscovered a third time; it needs no ticket, unless the operator decides they want the doctrine to say it.

## A product name is not a path - „запиши го в <плъгин> CANDIDATES" has two valid addresses (born 2026-09-15 from an incident, operator word for the record)
(was: „Име на продукт не е път — „запиши го в <плъгин> CANDIDATES" има два валидни адреса (родена 2026-09-15 от инцидент, операторска дума за записа)“)

A candidate without a ticket ref, by the convention.

**The incident.** On 2026-09-15, 13:05:44, a session with project root `D:\Furnissimo` wrote 51 lines into
`D:\promptandpray\dev\backlogs\CANDIDATES.md` (the Codex resume record, commented above) - two Edits, zero
git, the change stayed uncommitted and was found by the plugin session in `git status`. The word it rested
on was: „Да я запиша ли в PNP CANDIDATES?" → „да, запиши я" ("Shall I write it into PNP CANDIDATES?" →
"yes, write it"). The second Edit (the addition with the research) did not have even such a word - the
standing one was treated as covering it.

**Why the word does not cover the action.** The consumer has its OWN section for the plugin in its own
`docs/backlogs/CANDIDATES.md` (`## PromptAndPray (плъгин, D:\promptandpray)`), and from the operator's point
of view that is the default address. „PNP CANDIDATES" therefore names a PRODUCT, not a path, and has two
valid addresses on the same machine. Resolving that ambiguity is the session's duty, not the operator's -
guard (c): the constraint is read literally, a loose reading is never self-assigned, and in doubt the
constraint's author is asked.

**The second, heavier one:** even with an unambiguous word, the write landed in a LIVE working tree, in
which a parallel session was working on a ticket - in a window in which its runs claim
„the repository is byte-identical". A word for CONTENT is not a word for writing into someone else's tree
during work.

**The proposal (one or two sentences in `docs/WORKFLOW.md` § Branch policy, next to the READY-004 sentence
that HARD-001 brought in):** a product name is not a path - when the operator names
„<плъгин> CANDIDATES", and the consumer has its own section for the same plugin, the default is the OWN repo;
a write into the other one needs a word that names the repo explicitly, and even then not into a tree in
which a session is running - it is handed over or kept at home with a pointer (the pattern is already in the
consumer: the four READY records, carried over by a word on 2026-09-12, with the line
„не се водят на две места; този ред е указателят").

**Why it is doctrine, not a gate:** the hooks read the tool payload, not the project directory, so a
`Write`/`Edit` to someone else's absolute path passes silently and cannot be caught by Gate 1–4. The same
reason READY-004 stayed a sentence, not a check.

**State:** the content of the consumer's candidate (the tier agents) STAYS in
`D:\Furnissimo\docs\backlogs\CANDIDATES.md:448-490` by operator word, until the operator says it should be
taken from there. Not duplicated here. (Update 2026-09-16: a pointer record now exists below, in the
transfer - the evidence stays there.)

## Pointer: Codex tier agents (waiting to mature)
(was: „Указател: Codex тиер-агенти (чака узряване)“)

Cheap scans under an expensive auditor inside Codex itself (`[agents]`, per-role `.toml`, spawn tools) -
researched, the configuration exists, but three open upstream bugs make it fragile (a silent full fork/cost
on override; a model class that turns multi_agent on by itself), and a fan-out with children carries a fixed
overhead that can come out MORE EXPENSIVE than one well-cut pass. The consumer's decision:
`multi_agent = false`; the cheap scans stay on OUR side (fact-check + evidence pack). Trigger for a trial:
the three bugs closed + a free window; the recipe is ready in the source. Evidence: Furnissimo
CANDIDATES_PNP §тиер-агенти (the full record, incl. the bug numbers). NOT on mission passes. **Waits for a
word** (and maturing).

## [ПУСНАТ 0.2.7] Evidence pack пред одитора — от стояща практика към payload

Всеки ПЪРВИ code-class review пас получава бриф с evidence pack: евтин scan агент предварително
вади консуматорите/съседните договори по диффа (`file:line`), брифът носи пакета + ИЗРИЧНО право
и задължение за spot-check на дървото, където пакетът не стига — пакетът е селекция от
одитираната страна и spot-check дългът е какво пази независимостта. Днес това е стояща практика
на двата проекта (тук: PLAN_HARD Решения т.10, до края на плана); кандидатът е тя да стане
payload доктрина — ред в review брифа/скила, за всеки консуматор. Доказано качествено на двата
проекта: одиторът минава от преоткриване към преценка, а реалните блокери идват от собствените
му проби (независимостта издържа); ценови ефект недоказан (няма контролна група — виж указателя
по-долу). Естествен дом: проектира се ЗАЕДНО с HARD-014 („Одитор с resume на сесията") — двете
са една одит-икономика. **Чака дума.**

## Pointer: audit economics - the statistics and their methodology
(was: „Указател: одит-икономика — статистиката и методологията ѝ“)

The standing statistics of the auditor passes live at the consumer (CANDIDATES_PNP §статистика, 13 rows as
of 2026-09-16) with a methodology we adopt here too: the quota points are read from the operator's counter,
NEVER derived from tokens (a cold pass 201k = ~14–15%, not „4–5%" - corrected mental arithmetic); the
counters are written as a START→STOP pair on the pass itself (between passes other sessions spend); a pass
is cited by NAME, not by row number; „surface" is a rough proxy; arithmetic over two measurements is not a
measurement. The qualitative conclusion for the evidence pack: it moves the pass from rediscovery to
judgement (the blockers come from the auditor's own probes), but a cost effect is NOT proven - a control
group without a pack is missing. A resume on a readiness pass (an explicit word, a conscious deviation)
came out at ~¼ of the cold cost with compensations in the brief - it feeds HARD-014. Our numbers: the
HARD-009 record in PLAN_HARD. Three more measured facts the pointer keeps explicit so they are not
rediscovered: (1) **a narrow scope does NOT lower the cost proportionally** - a readiness pass over ONE
ticket (96 lines) costs the same order as a whole plan (~406 lines), because the pass reads the repo behind
the claims, not only the text - a pass is planned by the value of the catch, not by the volume of the text;
(2) **the attributability invariant: the auditor never runs in parallel in two sessions** - exactly one
active, otherwise the start/stop pairs cannot be attributed; (3) a **killed verification pass** was also
observed (287k tokens, the command finished, the result not returned, zero error marker) - a failure mode
the HARD-014 design must foresee (the session files on disk + post-hoc measurement by `token_count` events
are the proven forensic path). **Needs no word - it is a pointer.**

## Inherited lexical containment with a junction hole (born 2026-09-17, from the audit of CONS-001)
(was: „Заварен лексикален containment с junction дупка (роден 2026-09-17, от одита на CONS-001)“)

The lexical checks for `scratchDir` / `plansDir` / `overridesDoc` in setup (generate.mjs, the area
:993-997 as of commit `f21b2b0`) share the hole that CONS-001 blocker 2 named for the dashboard: an
in-project junction/symlink with a target outside the root passes. DELIBERATELY not landed in CONS-001 -
the canonicalization there would REFUSE installs that work today (junctioned docs/), i.e. a behavior change
outside the ticket. The dashboard is protected independently (a canonical check of the resolved path; the
junctioned-plansDir test fixture proves it). A candidate for its own ticket; no ref until it enters a plan.

## [ОТЛОЖЕН 2026-10-14] macOS support tier — преразглеждане след затварянето на PLAN_CONS (роден 2026-09-20)

Основанието, с което macOS беше обявен best-effort, отпадна: известният лимит (скъсан self-check
изход без tally, CHANGELOG 0.2.2 § Known limits) беше същият `process.exit` след асинхронен POSIX
pipe write и падна с CONS-011. `macos` мина изцяло зелен на двата рънa на 0.2.7 (`35431474157`,
`35433501937`) — първи път от 0.2.1. Това НЕ прави канала поддържан: никой не кара loop на Mac и
машина няма. Операторска дума 2026-09-20: сега само се дописва отпадналото основание (HARD-011,
т.6); самият tier и `continue-on-error` се преразглеждат в ОТДЕЛНА сесия след затварянето на
плана. Без ref до влизане в план.

## The `0011` supersede list missed one ID (born 2026-09-20, from Silerax's D4 cleanup)
(was: „`0011` supersede списъкът пропусна едно ID (роден 2026-09-20, от D4 чистенето на Силеракс)“)

The same migration rendered the newborn question („does this ticket get an audit pass") into
`CLAUDE.md#aiwf-core`, but did NOT name the local duplicate of that rule in its supersede list. The
consumer noticed it, left its record untouched and reported - the right behavior: the report is the
authority, not one's own note. The same holds for two of its records with their own supersede notes, whose
IDs were not among the five. The question for a next release: who compiles the list and against what it is
checked to be complete - today it is the author's judgement without a closing grep. No ref.

## Gate 3 locks `paths.transferSurface` for a consumer in the middle of a ticket (born 2026-09-20, from Furnissimo's update)
(was: „Gate 3 заключва `paths.transferSurface` за консуматор по средата на тикет (роден 2026-09-20, от ъпдейта на Фурнисимо)“)

The key is written into `.claude/aiwf-native/aiwf.config.json`, which is NOT in Gate 3's allowlist
(`docs/**`, `.aiwf/**`, root `*.md`). A consumer with an open R2/R3 route in `route-state.json` therefore
cannot set it without touching the route state of a frozen ticket or going through a shell around a gate
its own doctrine guards. Furnissimo chose the default path and left the key unset - the binding is in
place, the key is redundant. That is, **the key's optionality is what saves the case**; if anything ever
makes it mandatory, this corner becomes a blocker. No ref.

## Rejected at the transfer (recorded so it is not rediscovered)
(was: „Отхвърлени при преноса (записано, за да не се преоткрива)“)

(a) „Ръчните ask правила на консуматора не получават нови payload правила"
("the consumer's hand-written ask rules do not get new payload rules") - ABSORBED: HARD-002 (0.2.3) shipped
the „present but not owned" report in the update and CHANGES; the remainder is the consumer's local
operational work. (b) „Ревизия на payload-съседната доктрина извън плъгина"
("a revision of the payload-adjacent doctrine outside the plugin") - their finished local work; its
generalizable value lives in the doctrine-record gate and in the word-gate warning above.

## Two names for one set: „unplanned R2" vs „small R1 and non-durable R2" (born 2026-09-21 from CONS-009, raised by the Writer)
(was: „Две имена за едно множество: „unplanned R2" срещу „small R1 and non-durable R2" (роден 2026-09-21 от CONS-009, вдигнат от Колегата)“)

`docs/WORKFLOW.md:338-340` gives readiness to „durable R2 work and all R3" and excludes
„small R1 and non-durable R2 work"; check 2 of COO routing (`:761`) says „for an unplanned R2". If the two
point at the same set, the doctrine names it twice; if they do not, there is a third category nobody has
described. The discrepancy is older than CONS-009 and was NOT resolved there - the ticket only wrote the two
phrasings next to each other, so the section is true under either reading. A proposal for a next plan, not
a rule.

## A doctrine sentence that enumerates the world is a defect waiting for the case it missed (born 2026-09-21 from CONS-009)
(was: „Доктринно изречение, което изброява света, е дефект, чакащ случая, който е пропуснал (роден 2026-09-21 от CONS-009)“)

Three fixes of one paragraph fell to the same device - each claimed coverage („X е второ условие до Y",
„X Е това, което Y брои", „всеки Z е след Y") and each was refuted by ONE file containing the case the
claim excludes. It closed only with a sentence that names no kind of work at all. A candidate for phrasing
as a checkable rule of the brief/review - for now an observation with its cost (3 passes, 3 rounds), not a
rule written in passing.

## The third home of the enumeration is not instrumented: `docs/LOOP.md` § Role boundaries (born 2026-09-21 from CONS-009)
(was: „Третият дом на изброяването не е инструментиран: `docs/LOOP.md` § Role boundaries (роден 2026-09-21 от CONS-009)“)

The „Twelve commands" line in the README and `Shipped:` in `skills/README.md` already have an instrument
each (a literal pin + a structural pin that checks the line against the directories under `skills/`).
§ Role boundaries in `docs/LOOP.md` is a third home of the same enumeration and is held ONLY by prose: a
skill added in the two READMEs and missed in LOOP.md passes green. The obvious analog is a structural pin
(role bullets against the skills the loop dispatches). It did not go into CONS-009 - it would have been a
silent scope expansion.

## [ОТЛОЖЕН 2026-10-14] VERIFY няма POSIX крак — осемте команди са всичките Windows (от CONS-012, пенсиониран 2026-09-21)

Измерената констатация, която остава вярна независимо от архитектурата: осемте команди в
`verify.commands` са ВСИЧКИТЕ Windows процеси. Онова, което изглежда като Linux покритие —
`example-cycle-linux` — е Windows рън с други отговори във файл. Тоест зелен VERIFY не е твърдение,
че кодът работи на POSIX; POSIX се доказва отделно, на ръка през WSL или от CI.

Живо доказателство от изданието на 0.2.8 (2026-09-21): Windows порция 1 даде 8/8, а POSIX кракът
трябваше да се кара ръчно през WSL под `pnp`, защото го няма в конфига — три опита, два от които
паднаха на транспортна механика, преди да стигне до реален рън.

**Произход:** беше тикет `CONS-012`, паркиран на 2026-09-18 след readiness пас 2 (три от петте
блокера на паса бяха негови вътрешни противоречия, а той не блокираше изданието). Собственият му
текст се самоопределяше като „КОНСТАТАЦИЯ и суровина, НЕ договор". Пенсиониран при затварянето на
PLAN_CONS: суровина, чакаща собствен readiness цикъл, е кандидат, не отворен тикет. Реф-ът
`CONS-012` е ИЗГОРЕН и не се преизползва.

## The brief that runs VERIFY points at the project's VERIFY runbook - the payload half (born 2026-09-22)
(was: „Брифът, който пуска VERIFY, сочи проектния VERIFY runbook — payload половината (роден 2026-09-22)“)

The project half landed with an operator word 2026-09-22: `dev/VERIFY_RUNBOOK.md` + the sentence in
PROJECT_OVERRIDES § Test policy. The candidate is the payload mirror: the ticket-brief contract
(`docs/WORKFLOW.md`, the Verify policy field) should require a pointer to the project's test-policy runbook
when the project has one. Only a candidate - no ref until a word.

## [ОТЛОЖЕН 2026-10-14 - след стабилизацията] 0.3.0 — публичното README (бивш HARD-011) и полирането (роден 2026-09-22, операторска дума)

HARD-011 НЕ е оттеглен — ОТЛОЖЕН е (втора операторска дума 2026-09-22): остава открит тикет в
PLAN_HARD, който стои активен до 0.3.0. Този ред е указателят за обхвата на 0.3.0 цикъла: HARD-011
(README за студен посетител, в неговия план), преразглеждането на macos тиера (ruling 2026-09-20),
и каквото операторът избере от кандидатите в този файл (payload огледалото на VERIFY runbook-а,
RENAME-001, PS-EOL…). 0.3.0 планът за новото се ражда със собствена планова сесия и дума.

**Материал за README-то (сляпа рецензия, 2026-09-22):** операторът пусна „чиста" сесия
(CleanTest, id 2cff45c6-0608-4a22-8623-13260eaa60df, D:CleanTest) като случаен посетител срещу
GitHub README-то. Четирите находки: (1) ударът — „hook-овете правят нарушението нативен диалог,
не добра воля на модела" — идва КЪСНО; първите 10 секунди водят с роли/механизми вместо с
решената болка; (2) token/overhead възражението няма ранен отговор; (3) името може да прочете
несериозно на студен поглед; (4) да не се води с „orchestration/agents/workflow" лексика и списък
команди. Пълният запис е транскриптът на сесията; концепцията стига и на сляпо — позиционирането
е дефектът.

**Known issues секция в README-то (операторска идея 2026-09-22, за HARD-011/0.3.0):** кратък
списък какви проблеми имаме и какво планираме — двоен ефект: честност към студения посетител и
сигнал за сериозност (регистърът „honest limits" вече е гласът на доктрината). Първи кандидати за
списъка: auto mode класификаторът без вердикти за това репо (harness-side, докладван); macos =
advisory tier по ruling; свободната интерпретация на операторски думи (GO-думата/ask-диалог
кандидатът по-горе); класът „инструмент, който нито слой вижда" от LOOP.md.

## [ОТЛОЖЕН 2026-10-14] Конфигурируема GO-дума — зелен светофар вместо свободни интерпретации (роден 2026-09-22, операторска идея; за след 3.0)

Операторът избира при setup своя дума-светофар (напр. ключ в aiwf.config.json, operator.goWord);
САМО тя брои като дума за диспач/пас — всичко друго („ок, давай", „ти си", гола двойка) не е дума
и COO-то пита „кажи <думата>". Мотивът: 2026-09-22 три разтегнати интерпретации за един ден (ти
си → диспач на 016 без дума; 100 99 → прочетено като дума, хванато с прекъсване). Механичният
близнак е Gate 2 диалогът; това е chat-нивото му. **Разширение (същият ден, операторска
идея): още по-далеч — ask ДИАЛОГ вместо chat дума за пасовете.** Мотив: remote на телефона
операторът не чете чата, но ВСЕКИ ask диалог праща известие и той кликва да/не — известен е
винаги. Механиката е готова: wrapper инвокацията на одитора (codex-review/codex-qa) става ask
правило по образеца на Gate 2 — всеки платен пас = нативен диалог, стигащ до телефона. Съвпада
буквално с идентичността на плъгина: „every operator gate that CAN be a native dialog IS one".
Само кандидат — без ref до дума.

**D26 пилот, Етап 0 — ИЗМЕРЕН (2026-09-22, двете точки, факти без заключение):** двата
консуматора караха по един docs-class CLEAN-001 под Opus 4.8 COO с релсите на 0.2.9 и включени
ledger редове. Silerax: 0 операторски корекции (D1 самохванат от пред-пасовия fact-check гейт),
0 недумани диспачи, 1 платен пас pass-with-notes, 0 корекционни рундове; верига
a8ce87a0→b9af7141→e37a9cfc, архив 004. Furnissimo: 0 операторски корекции, 0 недумани диспачи,
R1 без платен пас, 1 самохванато и самодокладвано форм-нарушение (cd-префикс commit; гейтът
удържа механично, нула цена); commits 8bf5a627/9960a997/5de36428, архив 015. Изводът дойде същия ден,
операторска дума: **Етап 1 СЕ ОТМЕНЯ — пилот няма да има.** Мотивът, както е казан: пилотът нищо
не доказва — доказват го живите сесии в двата проекта и евентуалните проблеми, ако се появят.
Етап 0 числата остават мерени и валидни. Следствие за записания ред на консолидацията: брънката
„Silerax кара D26 пилота → чак после Furnissimo възобновява PLAN_PROJ" ОТПАДА — PLAN_PROJ се
размразява направо с операторска дума, без предусловие; CAP-001 продължава като обикновена мисия,
не като пилотен носител.

## `ORCHESTRATOR.md` is not in `ownedDestinations` (born 2026-10-15, PLB-003, raised by the Writer)

A transfer surface or an overrides document configured at `.claude/aiwf-native/ORCHESTRATOR.md` is
not refused by setup's collision checks, while `AGENTS.md`, `CLAUDE.md`, `roles.json` and the agent
files are (the `ownedDestinations` list in `scripts/setup/generate.mjs`). One row in that list.

## The root `CHANGES_*.md` history vs `dev/changes/` (born 2026-10-15, PLB-003 self-update)

The 21 reports up to 0.2.18 are tracked at the repo root; from 0.2.19 this repo writes them under
`dev/changes/` (`paths.changesDir`), because the 0.2.19 report carries the refreshed `$schema` path
and the provenance scan reads root `*.md` as payload (self-check red at the D10 self-update, then
green at 1262/1262 after the move). Either `git mv` the 21 into `dev/changes/`, or leave the split
and say so in `dev/README.md` (done); a candidate, not a debt.

## Update: a `createIfAbsent` op meeting a foreign file offers keep-mine instead of refusing (born 2026-10-16, Furnissimo's first 0.2.19 update)

Migration 0023's AGENTS.md op refuses a hand-written file at the path ("this installation has no
record of it ... move it aside"), by the PLB-003 design: the conflict vocabulary is wrong for a
creation. On the first consumer both installations had such a file (Furnissimo 258 lines, Silerax
272 - the root agent entrypoint their Codex hosts load natively), and `--resolve AGENTS.md` works
only on a RECORDED key (`resolveArtifact`, `scripts/update/migrate.mjs`), so the working path is
three steps: `git mv` aside -> update (renders + records) -> put the file back -> `--resolve
AGENTS.md` keep-mine (override). The candidate: on a `createIfAbsent` op with no record and a
differing file on disk, open the ordinary conflict dialog with `keep-mine` (record the standing file
as held: local = hash(actual), upstream = hash(render), override true) and `take-new` (the operator
moved it aside themselves); `merge` stays out, and a dry run reports the pending decision instead of
exit 1. Setup's `--adopt` already has `adoptDecide` for the same state (`generate.mjs`). Cost: the
engine branch at `migrate.mjs` ~:642-660 plus the resume rule ~:1191-1205, two update-suite cases,
NOTES.md of the next migration. For PLAN_DOCT or PLAN_FOLD; the three-step path stands meanwhile
(both consumers took 0.2.19 through it on 2026-10-16, self-check 1302/1302 each, `AGENTS.md`
byte-identical and held). Two more facts from those runs for the fix: (1) in a non-interactive agent
shell `--resolve` needs `--resolution-file` with the bare key (`{ "AGENTS.md": { "kind": "conflict",
"resolution": "keep-mine" } }`), and `skills/update/SKILL.md` Step 4 describes `--resolve` only as
leaving an override, not as entering one - the skill text follows the fix; (2) on Furnissimo the
host's auto-mode classifier refused the first `--apply` as self-modification (the engine never
started); the operator switched auto mode off for the run - a host behaviour worth one sentence in
the update skill.

## The rendered `AGENTS.md` carries the hard rules, not only pointers (born 2026-10-16, both consumers' 0.2.19 updates)

Both consumers keep a hand-written `AGENTS.md` (Furnissimo 258 lines, Silerax 272) because the Codex
auditor reads that file natively and nothing else of the doctrine; its body duplicates their own
overrides (Furnissimo: 14 twin sections). The 0.2.19 render (D8) carries three sections and pointers
to the canon, so neither consumer could take it - both hold their file as keep-mine. Candidate: the
template renders the project's § Hard rules (and the product boundary checks? - D8 said no: they are
the Reviewer's) from the overrides into the body, so the file stops being hand-written; or a measured
answer first - does Codex open the overrides when `AGENTS.md` names them? A product decision for the
operator; the design cost is the render context (the overrides are operator-owned text, not a
template variable today). Beside it, from Furnissimo's cleanup the same day: a held artifact that
the operator EDITS (their `AGENTS.md:188`) changes its local hash, so the next update reopens the
dialog unless `--resolve <key>` keep-mine is run again - one sentence for `skills/update/SKILL.md`
Step 4, and the `--resolution-file` form for agent shells with it.

## Payload says "a turn of its own" for the own pass; the consumers hold "a turn is not a stop" (born 2026-10-16, Furnissimo scan)

`docs/WORKFLOW.md` (§ Plan readiness review: "the COO does it in a SEPARATE turn", and twice more)
and `skills/review/SKILL.md` Step 2d ("in a turn of its own") still say a separate turn for the own
pass, while `templates/ORCHESTRATOR.md.tmpl` § Verdict and dispatch carries the dual "a verdict gets
its own message, not its own turn" for the verdict only. Furnissimo keeps a local rule "a turn of its
own is not a stop" (`docs/ai/PROJECT_OVERRIDES.md:339-342`, `PNP_CANDIDATES.md:49-52`) against that
reading. One sentence in the payload: the own pass is its own MESSAGE after the gate inputs are
closed, and the turn goes on to the dispatch. PLAN_DOCT material.

## Consumer rules with an unmet "expires when PnP carries it" (born 2026-10-16, Furnissimo and Silerax scans)

Each is a local rule whose own text names the payload as its successor; none is carried by 0.2.19:
- chain-trace in the evidence pack (Furnissimo overrides:329-330, PNP_CANDIDATES:27-28; Silerax
  overrides:444-456): the code-pass evidence pack is `file:line` pointers (`skills/review/SKILL.md`
  § evidence pack); the consumers add an ordered entry-point-to-endpoint chain per Outcome behaviour;
- the delta consequence scan and the delta fact-check run in PARALLEL, with no separate
  pointer-refresh agent (Furnissimo overrides:337; Step 2c says nothing about running beside Step 2b);
- `--trace retain-on-failure` instead of `--trace on` in the QA run (Furnissimo UIR-003 (1);
  `skills/qa/SKILL.md` canonical command);
- the Writer copies the runner's JSON report into `.aiwf/` right after the run, before anything can
  clean the output dir (Furnissimo UIR-003 (3));
- "no `cd` prefix on ANY command", not only before git (Furnissimo overrides:289-296; the managed
  CLAUDE.md covers `cd X && git`);
- surgical edits over whole-file rewrites (Furnissimo memory; this repo's memory too - 0022 carries
  only "Edit/Write, not the shell");
- the host's auto mode refuses writes to `.claude/settings.json` and refused Furnissimo's
  `/pnp:update --apply` as self-modification (memory `automode-blocks-settings-json.md`; the 0.2.19
  run) - a sentence in the setup/update skills;
- "do not offer `/pnp:brief` when the state is durable - `/pnp:mission` reconstructs it"
  (Furnissimo memory `no-brief-offer-when-durable.md`);
- Silerax: a per-ticket `last-review-session.<REF>.txt` (item 9 of § „Прием от Silerax") stays OUT by
  PLAN_PLB § Scope - the consumer's "ПРЕНЕСЕН" marker should read "rejected, reason in PLAN_PLB".
PLAN_DOCT material; each takes its own row when written into a plan.

## The diff-review record before the auditor pass (born 2026-10-16, from the cross-project alignment)

Silerax holds "before the auditor pass the COO reads the ticket's whole diff in person and records it
in `.aiwf/<TICKET>-diff-review.md` (base and candidate hashes, files, findings, decisions), then a
checkpoint and `/compact`" (its overrides, operator rule 2026-10-10; expires when the payload carries
it). Not spread to PnP or Furnissimo in the 2026-10-16 alignment: it was born in Silerax's
context-ceiling cycle (`readiness/UIR/context-ceiling-2026-10-10.md` there), where the operator called
the rules of that day hasty („това за мен са много прибързани решения"). The payload carries "the COO
reads the full diff" (templates/CLAUDE.md.tmpl) without the record file. Decide in PLAN_DOCT whether
the record file is doctrine (then one sentence in `docs/WORKFLOW.md` § The COO write boundary) or a
Silerax-local habit that expires on its own.

## macOS support tier - re-examine (born 2026-09-20 as a memory, moved here 2026-10-16)

The defect that justified "macOS unsupported" was fixed by CONS-011 and the macOS CI leg went fully
green on 0.2.7 (operator ruling 2026-09-20); the tier itself stayed best-effort (`continue-on-error`
in `.github/workflows/ci.yml`) with a re-examination promised "after PLAN_CONS closes" - PLAN_CONS is
archived (005), so the trigger has fired. Decide: promote macOS to a supported tier (drop
`continue-on-error`, say so in README § Status) or state best-effort explicitly in the README. HARD-011
(README 0.3.1) is the natural home.

## Plan layout: the tickets section never moves (operator thought 2026-10-15, for PLAN_FOLD)

Operator, thinking aloud: a header index with a ticket tracker and a short handoff pointing at each
ticket, then the `## Tickets` section as the durable contract, and everything after it - readiness,
blockers, completion records - explanatory, so the ticket lines never shift (PLB-003 shifted by 47
lines when PLB-002's record was inserted inside the section). Beside it, from the same day: a
`file:line` pointer into the code goes stale with the previous ticket's commit whatever the layout
(PLB-003 needed a 41-pointer re-anchor scan, 13 shifted) - the worklist in a plan names the symbol
or section, and `file:line` is born in the dispatch brief. Input for the FOLD plan format.

## Ruling ledger (D18: | въпрос | решение | указател |)

| Тикет с payload миграция: R2 или R3? (PLAN_STAB readiness пас 2) | R2, без пас 3 - операторско решение 2026-10-14; текстовото разминаване (WORKFLOW § R3, LOOP.md) - кандидат | `dev/backlogs/readiness/STAB/revisions.md` § Operator ruling |
| Кой тикет на кой COO модел (тристранката) | 4-те броими проверки на D25; ANY yes → Fable | CONSOLIDATION_2026-09-16.md §G |
| Табло: managed или seed? | Unbookkept one-time seed; rerender би трил консуматорско съдържание | PLAN_CONS Решение 4; migrate.mjs:536-563 proof |
| Арбитър: standing или on-demand? | On-demand cold-start; ledger-ът носи състоянието | CONSOLIDATION D18, e56fe7b |
| macOS зелен на 0.2.7 — сваля ли се `continue-on-error`? | НЕ. Само дописване: отпадналото основание („one measured defect stands unfixed") се маха от README § Status и от коментара на `macos` job-а в `ci.yml`; support tier-ът остава best-effort и се преразглежда в отделна сесия след затварянето на плана. Два зелени рънa не са support tier | операторска дума 2026-09-20; вози се в HARD-011 т.6 (PLAN_HARD, издание 0.2.9) |
| createIfAbsent: файл с байт-идентично съдържание на creation target-а след crash — наш или чужд? Чия е `.claude/aiwf-native/`? | Идентичен = НАШ, щампова се; папката е на плъгина, чужд файл там е проблем на автора му, името `ORCHESTRATOR.md` остава; threshold = загуба на данни ИЗВЪН папката на плъгина. Одиторът четеше „никакво осиновяване, дори равни байтове" — отхвърлено | операторска дума 2026-09-21; CONS-008 completion record в PLAN_CONS; migrate.mjs `recover` тройното правило |
| Условие ли е hardening принципът на D25 за маршрутирането, или икономическа бележка? | БЕЛЕЖКА. В D25 сказуемото е „is coherent **economics**", не „is permitted"; „only" управлява икономиката, не разрешението; втората клауза описва ИЗХОДА от евтино маршрутиране върху невтвърден план, което е граматика на предупреждение — забрана не описва резултата от нарушаването си. Четирите проверки са ЦЯЛОТО правило. Условието беше произведено от нашия payload текст, залепил „only … downstream" до правилото за маршрутиране; махането му е рендиране, не поправка на D25. Заявено независимо от две сесии, след като Одиторът три пъти обори обратното | `CONSOLIDATION_2026-09-16.md:210-212`; CONS-009 completion record в PLAN_CONS; `docs/WORKFLOW.md:778-784`; операторска делегация 2026-09-21 |
| Носи ли payload-ът дом за измерването (CONS-006 / D19, D22)? | НЕ — позиция B. Измерването е дисциплина на кампанията D1–D26, не продуктова доктрина; в payload-а остава само resume/cold политиката, и то при механиката в review/qa скиловете. Отсъдено от АВТОРА на D19/D22, срещу собственото му решение | `.aiwf/arbiter-brief.txt` **[преместен 2026-10-04 в `dev/backlogs/readiness/CONS/arbiter-brief.txt`, HARD-023]**; D22 поправката в CONSOLIDATION_2026-09-16.md; записът на CONS-006 в PLAN_CONS |
| Деветте „липси" на Фурнисимо срещу payload 0.2.8 — липси ли са? | ШЕСТ оттеглени от самата сесия, ТРИ отклонени от COO на Fable след първоличен прочит: йерархия на тежестта (физическите стопове са диалозите; D16 чете здравето на правило от event ledger-а), „заварена конвенция" (продуктовият гейт `docs/WORKFLOW.md:163-164` вече покрива „what the user sees or loses"), `COVERED BY` за Writer (разписката е `Ticket:` редът → PLAN записът с думата). Обявеният канонен конфликт (auto-resume срещу „ре-диспачът не е self-granted") — оттеглен, различни оси. Две твърдения бяха фактически неверни („инцидент"/„concurrency" са в § COO routing `:759`/`:764`); четири бяха приети решения (D22, D5, D12). Реални остават ДВА дефекта в 0.2.8 — кандидатите горе. Корен: payload-wide отрицание по доклад на един sonnet агент, нула от девет проверени лично | арбитражни сесии 2026-09-21 (Opus, после Fable); сесия `22a0ff0e` (Фурнисимо 2.7 new) |

| Редовете на одитната таблица: затворен effort списък (`low|medium|high`) или речникът на engine-а? | Речникът на engine-а: всяка непразна стойност, както при ролите. Ограничение, по-тясно от engine-а, е продуктов бъг. Обръща записаното в схемата „CLOSED set“ (D18 тригер 1; второто мнение е операторът) | операторска дума 2026-09-23 (CAP-003, Silerax); HARD-017 completion record, `54510f4` |
| Колко VERIFY за малка промяна? | Пропорционално на diff-а: тикетът пуска само суитите, които промяната може да счупи. Пълният набор (Windows + WSL) веднъж, преди tag. Обръща записания каданс „пълните 8/8 гейтват затварянето“ (PLAN_HARD § Ред и гейтове, COO решение 2026-09-13) | операторска дума 2026-09-24; `dev/PROJECT_OVERRIDES.md` § Test policy |
| PLAN_RGATE RGATE-001: тикет с наблюдаемо поведение (отказ на wrapper-а, deny на Gate 2) минава ли през `/pnp:qa`, когато E2E е изключен? | Не — QA няма да има; поведението се доказва с изпълнени self-check/spike probe-ове. Изключение за този тикет от LOOP:15, loop SKILL:73-74, WORKFLOW:742/:770, CLAUDE.md:51, overrides:297 (тригер 4: Одиторът оспори D13 писмено; второто мнение е операторът) | операторска дума 2026-10-02 „QA няма да има“, след readiness пас 2; PLAN_RGATE D13 |
| PLAN_DRAFTS D3/D11: разширение на вече приземен план (нов тикет под readiness) — редакция на активния план, или отделна чернова? | А: разширението е НЕКОМИТНАТА редакция на активния план и на `readiness/<ABBR>/`; планиращият lock забранява commit-а на тракнатия план, не черновата в него; readiness файловете се дописват/презаписват в работното дърво и лягат с docs commit-а на разширението. Б (отделен файл под `drafts/`, слят при одобрение) отхвърлена: одиторът би чел фрагмент, а сливането е редакция след одита (тригер 4: Одиторът оспори писмено на code пас 1) | операторска дума 2026-10-04 „А“; домове: `docs/WORKFLOW.md` § Planning lock (bullets 1 и 3), `skills/review/SKILL.md` Step 2e (изречението за разширение); DRAFTS-001 completion record, `008_PLAN_DRAFTS_2026-10-04.md` |
| Language of the tree: should plans, candidates, rulings, memory and briefs be English, given Bulgarian tokenizes worse and the payload is already English by gate? | Yes, everything in the tree in English; two verbatim exceptions - the operator channel stays Bulgarian, and an operator decision or gate word is recorded in its own Bulgarian wording with the English reading beside it; existing text translated only where read every session (overrides, open sections of this file), archived plans and closed rows untouched (PLB-005) | operator word 2026-10-15 „приемам предложението на ГПТ за англо проект в който всичко е на английски, само комуникацията с оператора остава на български и операторските решения или гейтове да се записват дословно на български" + „да, записвай го"; restated 2026-10-16 „важно правило от днес завинаги" + „да" over the shown text - the bullet now names commit messages, code comments and docs, the verbatim example („давай одитор"), and "existing Bulgarian text is translated only when a ticket names it"; the same text goes to Silerax on its own word; home: `dev/PROJECT_OVERRIDES.md` § Communication; origin `dev/PLAN REFACTOR/Отговор 3.md` |
| Memory cleanup of this repo (the three-way pass applied here first): which memory files go? | 21 files -> 8 (plus the index). DELETED (rule stands verbatim in the overrides, CLAUDE.md or the payload): auditor-verdict-gets-two-sentences, coo-routing-tiers, english-in-the-tree, new-ticket-needs-operator-word, operator-words-are-situational-unless-declared, plugin-loads-from-worktree, readiness-review-on-codex, rule-records-carry-a-marker, use-agents-for-scans, macos-support-is-an-open-decision (now the candidate row below). MERGED into the overrides as one marker line each: "Operator channel stays short" (§ Communication, operator rule 2026-09-22) and "Surgical edits over rewrites" (§ Execution discipline, operator rule 2026-10-02); stabilization-strategy folded into the status file. FIXED: auditor-never-below-author (the dead "payload `model: opus` defect" dropped), codex-pass-economy (measured numbers only), machine-constraints-verify-runs (the three-bash fact + runbook pointer), every-pass-after-the-first-needs-a-word (a pointer; its 2026-09-15 tightening "even pass 1 needs a separate word while the Codex quota is limited" is REVOKED by the operator: „пада"). Operator quotes the deleted files carried, kept here verbatim: 2026-08-30 „използвай агенти за скан и ресърч"; 2026-09-13 „всички ги подминавате тия одитори все едно е най..." (the verdict-in-substance rule, HARD-012); 2026-09-21 „ужас, много ясно че е за тикета" (guard (g) situational default); 2026-10-15 „сонет COO не ползвам, opus евентуално" + „от сега нататък, впиши го в overrides" (COO tiers) | operator word 2026-10-16 „пада, одобрявам всичко, трий" over the shown list; homes: `dev/PROJECT_OVERRIDES.md` § Communication / § Execution discipline, the payload sections named in the deleted files' twins (WORKFLOW § The operator does not arbitrate, guards (b) (g), § How the COO speaks, § COO owns broad scans, § Plan readiness review; CLAUDE.md § This repository is the plugin) |
| Must every local rule carry when and where it was born and the approving word? | No. A rule in the overrides carries a marker only - `(operator rule <date>)`, or nothing for a COO generalisation; the operator's wording, the occasion and the evidence pointer live in ONE ledger row here (ruling or event), never in the rule text. Applied to this repo's overrides the same day: the quotes, incident retellings and threshold histories left § Hard rules, § Test policy, § Communication and § Loop shape; the VERIFY traps live in `dev/VERIFY_RUNBOOK.md`, the rest in the rows of this file (2026-09-17 portions, 2026-10-02 release order, 2026-10-14 checkpoint + „Заглавие не е текст", 2026-10-15 COO tiers / scan-agent checks / English). Other projects and the memory files follow after a three-way session | operator word 2026-10-16 „да, правило - маркер в overrides, цитатът в ledger-а, според мен тук и в другите проекти има прекалено много проза и преразказ в локалните правила, направи го първо тук след това ще направим тристранка"; home: `dev/PROJECT_OVERRIDES.md` § Communication, bullet "A rule record carries a marker, not its story" |
| PLAN_PLB readiness pass 1, blocker 1: is a Gate 3 allowlist widening (PLB-001) R2 under the payload-migration ruling, or R3 as "access policy" (`docs/WORKFLOW.md` § R3)? | R2 by ruling: widening a gate's allowlist without flipping its fail direction is R2 (the dual of overrides § Architecture direction "a change that flips a fail direction is R3"); a flip stays R3 | operator word 2026-10-15 „R2 с ruling, давай пас 2"; home: `dev/backlogs/drafts/PLAN_PLB.draft.md` D1 (lands in `active/` at approval); `readiness/PLB/revisions.md` pass-1 verdict |
| COO routing tiers: which model is the "cheap" COO of WORKFLOW § COO routing in this project? | top = Fable, cheap = Opus; a Sonnet COO is never used | operator word 2026-10-15 „сонет COO не ползвам, opus евентуално" + „от сега нататък, впиши го в overrides"; home: `dev/PROJECT_OVERRIDES.md` § Loop shape (rule 2026-10-15); first applied: PLAN_PLB D7 (PLB-006 on Opus) |
| COO routing check 2 ("any worklist item without a `file:line` anchor"): does a NEW file with a fixed path and contract, or a section cited by its title, count as unanchored? | No - check 2 counts an item that still needs discovery to locate; a new file with a fixed path and contract, or a section cited by title, is anchored. Reading of `docs/WORKFLOW.md` § COO routing check 2; a candidate for the payload text when DOCT rewrites that section | operator word 2026-10-15 „да" to the COO's proposal; first applied: PLAN_PLB D7 - PLB-004 and PLB-005 routed cheap (Opus) |
| Cross-project alignment of GENERIC local rules (PnP / Silerax / Furnissimo): the four contradictions the COO could not settle, and two scope questions | Q1 QA default = the payload's rule everywhere (QA when the brief declares observable runtime/UI behaviour, no further word; Silerax's 2026-10-05 word-per-QA REVOKED; Furnissimo's "never n/a" is the same rule from the other side). Q2 product/UX questions = Silerax's AskUserQuestion dialog, ONLY for a decision the ticket cannot continue without; everything else collected and asked once at the ticket's end (CANDIDATES § „Прием от Silerax" item 26 text; Furnissimo's 2026-10-04 ask-in-chat replaced, its no-mockup clause kept). Q3 the operator channel carries the numbers the operator acts on (blockers, passes, gates, cost), never file:line / test ids / code names - PnP's 2026-09-22 "no counts" sharpened. Q4 at a ticket's end everything the ticket created under `.aiwf/` is deleted, keepers move to the docs folder first, the delete dialog is the gate, no chat question (Silerax 2026-10-06 widened). (в) tail / lint baseline / timeout / repo-root rules are generic -> spread. (б) plan-by-sections spreads; the diff-review file + `/compact` stays Silerax-only (candidate above). C-029 (quota start/stop pairs) n/a for Furnissimo - its pass statistics retired 2026-09-28 (ruling to its session, same day) | operator words 2026-10-16: Q1 „съгласен"; Q2 „Силеракс печели - с диалог ... диалог само за продуктови решения, за да не пречат на автономната работа"; Q3 „да искам числата без подробности за файловете, само (брой блокери, пасове, цена)"; Q4 „не само ... остатъците от тестовата среда а за всичко което по време на работа агентите и COO са създали в .aiwf. Ако има нещо (артефакт) което трябва да остане ... отива в документационната папка"; (в) „не са локални"; decision „ок съм, но не започвай още"; start „ти си водещата сесия, изпрати съобщенията и брифовете, да докладват ако имат проблеми, ако нямат след като свършат, ти работиш тук но и контролираш другите два проекта, аз се намесвам само при ескалация". Decision file: `dev/backlogs/drafts/align-2026-10-16/align-decision.md`; homes: `dev/PROJECT_OVERRIDES.md` § Hard rules / § Execution discipline / § Test policy / § Communication / § Loop shape / § Workflow; the consumers' overrides by their own commits (D2 row below) |

## Pass statistics (D22 формат: пас | клас | формат | токени | старт→стоп | минути | вердикт)

**Методологията живее ТУК, не в payload-а** (D22 поправен 2026-09-17 по арбитраж; вж.
`CONSOLIDATION_2026-09-16.md` D22 и записа на CONS-006 в PLAN_CONS). Броячът, прозорецът и
двойките са инструментът на кампанията D1–D26 — с тях РЕШИХМЕ resume политиката и форматите — а не
продуктова доктрина: непознат с един проект може никога да не пипне codex или да има несравнима
квота. Правилата на измерването:

- **Двойката старт→стоп не се иска** (операторска дума 2026-10-02, занапред): COO-то не пита за
  брояча нито преди, нито след пас; колоната `старт→стоп` остава `—`, освен ако операторът сам
  подаде двойка. Квотни точки пак не се извеждат от токени.
- **Токените са диагностика.** Обясняват пас след факта, не планират пас.
- **Двойката е на ПАСА**, не на работата около него — между два паса харчат други сесии.
- **Сравними са само двойки в еднакво състояние на прозореца.** Двойка отпреди обръщане на
  прозореца не е стартът на този пас; чете се непосредствено преди диспача.
- **Един жив одитор, докато се мери.** Двойката е приписуема само защото нищо друго не харчи срещу
  същия брояч — това го държи операторът, никой хук не го вижда. (Инвариантът е в
  `docs/WORKFLOW.md` § Branch policy; тук е само измервателната му половина.)
- **Duration** се пише до двойката; дълъг пас и скъп пас са два различни факта.
- **Пас се цитира по ИМЕ, не по номер на ред** — редовете се местят.
- **Аритметика върху две измервания не е измерване.**

**Операторска оценка за протокола (2026-09-22, както е докладвана):** откакто брифовете към
Codex носят резюме/chain таблици/evidence pack и пасовете resume-ват, токен разходът е паднал
драстично — операторът вече се събира и в 5-часовия, и в седмичния прозорец. Качествена оценка
от този, който вижда броячите; потвърждава посоката на одит-икономиката (Решение 10, resume
политиката, fact-check гейтът пред скъпите пасове).

Измерените форми и провенансът им: секцията „Указател: одит-икономика" по-горе. Тук стоят
ПРАВИЛАТА, там — доказателствата с веригата си; сливането им или ги дублира, или откъсва числата от
източниците им, което е точно болестта, която този арбитраж излекува.

| PLAN_CONS readiness p1 | plan | студен | 122,199 | 100/67→91/65 | — | NEEDS-FIX |
| PLAN_CONS readiness p2 | plan | resume | 38,981 инкр. | 91/65→86/65 | — | NEEDS-FIX |
| PLAN_CONS readiness p3-A | plan | студен | 168,135 | 86/65→74/63 | — | NEEDS-FIX |
| PLAN_CONS readiness p3-B (A/B близнак) | plan | resume | 57,254 инкр. | 74/63→66/61 | — | NEEDS-FIX |
| PLAN_CONS readiness p4-A | plan | студен | 145,289 | 66/61→56/60 | — | NEEDS-FIX |
| PLAN_CONS readiness p4-B (A/B, след компакт) | plan | resume | 137,129 инкр. | 56/60→44/58 | — | NEEDS-FIX |
| CONS-001 review p1 | code | студен | 87,040 | 100/58→94/57 | — | fail |
| CONS-001 verify p2 | code | resume | 108,404 инкр. | 94/57→92/57 | — | fail |
| CONS-001 verify p3 | code | resume | 123,041 инкр. | 92/57→90/57 | — | pass |
| CONS-002 review p1 | code | студен | 70,166 | 90/56→86/56 | — | fail |
| CONS-002 verify p2 | code | resume | 153,424 инкр. | 86/56→84/56 | — | pass |
| CONS-003 review p1 | code | студен | 120,035 | 100/56→93/54 | — | fail |
| CONS-003 verify p2 | code | resume | 185,515 инкр. | 93/54→87/53 | — | fail |
| CONS-003 verify p3 (диспач, убит от оператора по невнимание) | code | resume | — | 87/53→82/53 | — | без вердикт |
| CONS-003 verify p3 | code | resume | 232,016 инкр. | 82/53→79/53 | — | pass |
| CONS-004 review p1 | code | студен | 126,014 | 100/52→96/51 | — | pass-with-notes |
| CONS-005 review p1 | code | студен | 89,805 | 100/51→94/50 | — | fail |
| CONS-005 verify p2 | code | resume | 135,473 инкр. | 94/50→89/49 | — | pass-with-notes |
| PLAN_CONS readiness p1 (CONS-011), диспач убит от хоста „at capacity" | plan | студен | 69,700 | 89/49→84/48 (двойката покрива и възстановяването) | — | без вердикт |
| PLAN_CONS readiness p1 (CONS-011), възстановяване по CONS-005 правилото (bare resume + кратък continuation) | plan | resume | 91,967 инкр. | (в горната двойка) | — | NEEDS-FIX |
| PLAN_CONS readiness p2 (CONS-011) | plan | студен | 75,649 | 84/48→79/48 | — | NEEDS-FIX |
| PLAN_CONS readiness p3 (CONS-011; 5h прозорец нулиран между p2 и p3) | plan | студен | 111,739 | 97/48→89/46 | — | NEEDS-FIX |
| PLAN_CONS readiness p4 (CONS-011; над `passes + 1`, на операторска дума — вж. event ledger) | plan | студен | 88,097 | 89/46→82/45 | — | NEEDS-FIX |
| PLAN_CONS readiness p5 (CONS-011 r9, арбитражна сесия; операторска дума) | plan | студен | 106,283 | 82/45→74/44 | — | NEEDS-FIX (3 стари затворени, 5 нови от r9) |
| PLAN_CONS readiness p6 (CONS-011 r10; операторска дума) | plan | студен | 100,233 | 74/44→67/43 | — | NEEDS-FIX (4 затворени, 1 остатък: chain ред 12 anchor-и) |
| CONS-011 review p1 (сесия f3) | code | студен | 87,487 | 100/43→95/42 | — | fail (1: guard-ът четеше сурови редове) |
| CONS-011 verify p2 (арбитражна сесия; cold — кешът изтекъл) | code | студен | 50,755 | 100/42→96/42 | — | fail (3 P2 по текстовия анализатор) |
| CONS-011 verify p3 (след капа; pin-ове) | code | resume | 70,577 инкр. | 96/42→95/41 | — | pass (0 находки) |
| CONS-008 review p1 (24 файла, 987 реда — най-големият диф в плана) | code | студен | 152,697 | 100/41→86/39 | — | fail (1 P1 + 6 P2) |
| CONS-008 verify p2 | code | resume | 365,672 инкр. | 86/39→77/38 | — | fail (5/7 затворени) |
| CONS-008 verify p3 (след капа) | code | resume | 433,809 инкр. | 77/38→(5h прозорецът се обърна по време на паса; седмичен 38→37; неприписуема) | — | fail (B1 + 1 нов P1) |
| CONS-008 review p4 (cold, ТЕСЕН обхват: само creation протоколът; операторска дума над капа) | code | студен | 101,792 | 100/37→93/36 | — | fail (1 нов: няма тест за продукционния диспач) |
| CONS-008 verify p5 (test-only делта) | code | resume | 192,274 инкр. | 93/36→92/36 | — | pass (0 блокери) |
| CONS-009 review p1 | code | студен | 127,060 принт. | 92/36→82/34 | — | fail (2×P2: застояла chain верига + неразрешен клон в COO routing) |
| CONS-009 verify p2 (след корекционен рунд 1) | code | resume | 162,786 принт. | 82/34→78/34 | — | fail (B1 затворен; B2 остава — „приравняването отрича клона, не го разрешава") |
| CONS-009 verify p3 (след корекционен рунд 2; 5h прозорецът се обърна между p2 и p3) | code | resume | 206,127 принт. | 100/34→95/33 | — | fail (B2 остава; отсъдено „поправка на D25, а не рендиране" → ескалация) |
| CONS-009 verify p4 (след третия рунд, на операторска дума над капа) | code | resume | 221,726 принт. | 95/33→92/32 | — | **pass (0 находки)** |
| HARD-015 readiness p1 (2026-09-22) | plan | студен | 83,880 | 100/32→94/31 | — | NEEDS-FIX (5 блокера) |
| HARD-015 readiness p2 (2026-09-22) | plan | resume | 114,981 инкр. | 94/31→91/31 | — | NEEDS-FIX (1 блокер, роден от ревизията; затворен като проза) |
| HARD-016 readiness p1 (2026-09-22) | plan | студен | 107,097 | 91/31→85/30 | — | NEEDS-FIX (7 блокера, всички в release половината) |
| HARD-016 readiness p2 (2026-09-22) | plan | resume | 149,325 инкр. | 85/100→81/99 | — | NEEDS-FIX (4: 1 остатъчен + 3 родени от ревизията, с произход; таванът изчерпан) |
| HARD-015 review p1 (2026-09-22) | code | студен | 33,293 | 81/99→79/99 | — | pass (0 находки) |
| HARD-016 docs review p1 (2026-09-22) | docs | студен | 84,888 | 100/99→94/98 | — | fail (2 блокера: seed-ът преразказва вместо да сочи; NOTES парафразира guard (g)) |
| HARD-017 review p1 (2026-09-24; `gpt-6-sol`/xhigh — първият пас на ред, записан на xhigh) | code | студен | 68,641 | не е подадена | — | pass (0 находки) |
| HARD-019+018 readiness p1 (2026-09-24; `gpt-6-sol`/xhigh) | plan | студен | 138,441 | не е подадена | — | NEEDS-FIX (10) |
| HARD-019+018 readiness p2 (с трите компенсации) | plan | resume | 241,810 принт. | не е подадена | — | NEEDS-FIX (2 отворени + 4 нови) |
| HARD-019+018 readiness p3 (`passes + 1`, операторска дума) | plan | resume | 368,154 принт. | не е подадена | — | NEEDS-FIX (1 отворен; поправен без пас по дума) |
| HARD-019 review p1 (`gpt-6-sol`/xhigh) | code | студен | 71,980 | не е подадена | — | fail (1: частичен запис при нечетим шаблон) |
| HARD-019 verify p2 (без компенсации — кодова верификация) | code | resume | 82,981 принт. | не е подадена | — | pass (0 нови) |
| HARD-018 review p1 (`gpt-6-sol`/xhigh; 28 файла) | code | студен | 112,787 | не е подадена | — | fail (1, само текст → поправен без пас) |

Бележка към трите реда горе: операторът отчита, че топлите пасове „доста изядоха от квотата“, но
двойки не са подадени, така че цената им НЕ е мерена. Отворен въпрос за следващия цикъл: дали
топъл пас с трите компенсации (наново от диска + независимо търсене върху натрупан 1M контекст на
xhigh) излиза по-скъп от студен. Решава се само със старт→стоп двойки на брояча.

Бележка за колоната „токени" на CONS-009 редовете: записано е числото, което двигателят ПРИНТИРА
(`tokens used`), с етикет „принт." вместо „инкр." — по веригата резюмета то расте монотонно, тоест
се чете като кумулативно, а не като инкрементално. Не е извеждано и не е изваждано: аритметика
върху две измервания не е измерване, а етикетът „инкр." би твърдял нещо, което не съм проверил.

Методологични бележки от цикъла: resume икономията се разпада след компакт на сесията
(−5→−8→−12пп крива; retire-при-компакт); двата A/B: форматите комплементарни на суров план,
схождащи се на зрял; пп/turn ~стабилно срещу пп/токен ±50% (гросс-обемният модел).

| HARD-020 readiness p1 (`gpt-6-sol`/xhigh, session `01a0e302-27ee-7cb2-b7e7-b8c5c5592204`) | plan | студен | 87,928 | брояч: чака двойката от оператора | — | NEEDS-FIX (6 блокера, всичките авторски — PLAN_HARD § HARD-020 „Одит p1“) |
| HARD-020 readiness p2 (`gpt-6-sol`/xhigh, session `01a0e31d-83d4-7bb3-b92a-61d1389aade6`, операторска дума „пускай“) | plan | студен | 77,495 | брояч: чака двойката от оператора | — | NEEDS-FIX (4: два полузатворени от p1 — WORKFLOW `:406-407`, гард с черен вместо бял списък; два родени от ревизията — датов repair на грешното дърво, два `docRefs`; всичките авторски) |
| HARD-020+021 code p1 (`gpt-6-sol`/xhigh, session `01a0e6aa-d2cc-7d23-a31b-aebd0fb07595`, операторска дума „пускай кодекс“) | code | студен | 95,055 | брояч: не е записан | — | fail (2 блокера, двата проза в dev/PROJECT_OVERRIDES; кодът чист; рунд 1 само проза, без платен верификационен пас) |
| RDY readiness p1 (2026-09-29, `gpt-6-sol`/xhigh, над r0) | plan | студен | 168,918 | брояч: не е записан | — | NEEDS-FIX (13: 11 авторски / 2 дизайн) → планът прескопиран |
| RDY readiness p2 (2026-09-29, над r1, дума „кодекс пас студен“) | plan | студен | 124,715 | брояч: не е записан | — | NEEDS-FIX (4 авторски; клас (а)=3, (б)=1) |
| RDY readiness p3 (2026-09-29, топъл resume на p2, дума „пас 2 топъл“) | plan | resume | не е записан | брояч: не е записан | — | PASS (0 нови) |
| RDY-001 code p1 (2026-09-30, `gpt-6-sol`/xhigh, session `01a0f0f5-61dc-7482-9589-56a9aa1bdd28`, дума „start“) | code | студен | 117,866 | брояч: не е записан | — | fail (2 блокера, проза: WORKFLOW не описва разделянето над план; датата в CHANGELOG) → рунд 1 само проза, без платен верификационен пас |
| PLAN_RGATE readiness p1 (2026-10-02, `gpt-6-sol`/xhigh, над r2; първата употреба на consequence scan + own-pass файл) | plan | студен | 181,444 | — | — | NEEDS-FIX (9: всичките авторски, нито един спор по дизайна) |
| PLAN_RGATE readiness p2 (2026-10-02, над r4, дума „1 da“) | plan | студен | 136,667 | — | — | NEEDS-FIX (7 от 9 затворени; незатворени #2 четириколонна scan таблица, #7 QA маршрут — спор по D13; 2 нови, родени от r4: `~~~` огради, контроли не покриват всяка проверка) |
| PLAN_RGATE readiness p3 (2026-10-02, над r6, дума „пускай паса“; hard max) | plan | студен | 125,912 | — | — | NEEDS-FIX (всички от p2 затворени, вкл. операторското решение за QA; 2 нови, родени от r5/r6: невалидна четириколонна делта таблица се игнорира до валидна; ctl-11 не може да светне с фиксирания fixture) → цикълът спира, блокерите при оператора |
| RGATE-001 code p1 (2026-10-02, `gpt-6-sol`/xhigh, session `01a0fc2b-9722-7d91-b6cd-283276cfa74f`, дума „да“; interlock през 0.2.14 wrapper по „давай не чакай, работи“) | code | студен | 140,776 | — | — | fail (3 блокера в `plan-gate.js` срещу договора: таб след затваряща ограда; разделител без проверка на броя клетки; инструментите номерирани през таблиците) → кодов рунд 1 |
| RGATE-001 code verification (2026-10-02, resume на p1, дума „давам я“) | code | resume | 162,996 | — | — | pass (0 находки) |
| PLAN_DRAFTS readiness p1 (2026-10-02, `gpt-6-sol`/xhigh, над r6, дума „пускай прохода“; първата жива употреба на plan gate-а — прие) | plan | студен | 133,112 | — | — | NEEDS-FIX (5 + 1 оспорено: scratch резерв срещу Branch policy; HARD-023 текст срещу D4; лендингът не хваща липсващ файл; S1-S5 не през реалния принтер; граница на шаблона; таг преди CI без авторитет) |
| PLAN_DRAFTS readiness p2 (2026-10-02, над r7, дума „пускай“) | plan | студен | 125,694 | — | — | NEEDS-FIX (4 от 5 затворени; границата на шаблона отворена; 2 нови, родени от r7: git-less хост чупи setup/update; plansDir под `.aiwf` извън „единствения случай“) |
| PLAN_DRAFTS readiness p3 (2026-10-02, над r8, дума „добре нека да има трети пас, само че това е тавана“; hard max) | plan | студен | 92,438 | — | — | NEEDS-FIX (2 от 3 затворени; границата на шаблона: трети добавен ред минава) → цикълът спира; операторът „1“: r9 (дословен блок T) и одобрение без пас 4 |
| DRAFTS-001 code p1 (2026-10-04, `gpt-6-sol`/xhigh, session `01a10644-30ae-7ad2-9769-5aa49dd4b488`, дума „действай“; interlock през 0.2.15 wrapper по същата дума) | code | студен | 106,608 | — | — | fail (5 блокера: WORKFLOW Gate 3 изречението пропуска `.aiwf/**`; брифът `PLAN:` чернова срещу активен план при разширение; ОСПОРЕНО D3/D11 → операторът: А; S3/S4 env пази `GIT_CONFIG_COUNT`/`GIT_TEMPLATE_DIR`; git spawn-ове без timeout) → кодов рунд 1 |
| DRAFTS-001 code verification (2026-10-04, resume на p1, дума „да“) | code | resume | 218,317 (Codex отчита натрупаното за сесията, не само паса) | — | — | pass (5/5 затворени, 0 нови) |
| PLAN_LEAN readiness p1 (2026-10-04, `gpt-6-sol`/xhigh, над r2, стоящата дума за планирането, session `01a1074e-17db-7eb0-8c90-bde27757039b`) | plan | студен | 148,092 | — | — | NEEDS-FIX (2: указателният bullet полу-стеснен; регистърът свеждан по хоста) |
| PLAN_LEAN readiness p2 (2026-10-04, над r5, дума „пускай топъл“; прекъснат от квотата на engine-а, довършен с bare resume по дума „има квота пускай“) | plan | resume | 453,600 натрупано за сесията (прекъснатият ~298k, продължението ~7,350) | — | — | NEEDS-FIX (1, роден от r5: `typeof cfg.os` guard пуска `solaris` до „outside“) |
| PLAN_LEAN readiness p3 (2026-10-14, над r6, дума „studen ok“; hard max) | plan | студен | 131,408 | — | — | PASS (пренесеният блокер CLOSED, 0 нови) |
| LEAN-001 code p1 (2026-10-14, `gpt-6-sol`/xhigh, дума „пускай LEAN-001“; interlock през 0.2.16 wrapper по дума „да“) | code | студен | 120,726 | — | — | pass-with-notes (0 находки; бележка: VERIFY партидата е от доклада на Колегата) |
| STAB-001 code p1 (2026-10-15, `gpt-6-sol`/xhigh, дума „пускай“; interlock през 0.2.17 wrapper по дума „да пусни го през 2.17“) | code | студен | 91,030 | — | — | fail (2 блокера - противоречия между одобрени блокове и съседни изречения: редът `COO:` срещу non-durable R2 без раздел в плана; scoped QA ре-рън срещу „the same suite“) → прозов рунд 1, без верификационен пас |
| PLB-002 code p1 (2026-10-15, `gpt-6-sol`/xhigh, session `01a14015-0cfa-72d2-adba-62673936cfc4`, operator word „da"; pnp-live at 0.2.18 payload, as D10 orders) | code | cold | 92,361 | — | — | fail (2 blockers: the section-8 test assertion narrowed in the pre-verdict micro-round was vacuous when nothing was written; the full test-update exit 0 not yet shown) → code round 1 of 6 test lines in the audited file, red against HEAD's engine / green on the tree, no verification pass (suppression dual) |
| PLB-003 code p1 (2026-10-15, `gpt-6-sol`/xhigh, session `01a1408b-181a-7941-bd7c-cb54f60cb901`, operator word „пускай"; pnp-live still at the 0.2.18 payload, D10) | code | cold | 114,008 | — | — | fail (1 blocker: `paths.overridesDoc = AGENTS.md` planned two writes to one path with no refusal; 1 note on the RECIPE sentence) → code round 1 (10 code lines + 10 test lines + 2 prose), no verification pass by operator word „без пас" on the COO's suppression-dual recommendation |
| PLB-001 code p1 (2026-10-16, `gpt-6-sol`/xhigh, session `01a1431e-1fb0-78b3-8afb-fb833ebfb33a`, operator word „пускай 001"; pnp-live at `695a8fc`, 0.2.19 payload) | code | cold | 55,959 | — | — | pass (0 findings; fact-check before it 155 claims / 2 FALSE fixed in a prose micro-round; the evidence pack carried the check agent's green VERIFY) |
| PLB-004 code p1 (2026-10-16, `gpt-6-sol`/xhigh, session `01a1435c-65af-7b93-8e79-a744772e1102`, operator word „пускай"; top COO by operator word instead of D7's cheap; pnp-live at `2afa758`) | code | cold | 60,325 | — | — | pass-with-notes (0 blockers; 2 notes: CHANGELOG section of the `--show` entry - kept; a controls comment - one line fixed before the commit; fact-check before it 84 claims / 0 FALSE) |

## Event ledger (D16 формат: | дата | правило | violation|catch|operator-correction | указател |)

| 2026-09-16 | статистика старт/стоп двойки | operator-correction | pass 2 диспачнат без поискана старт двойка; операторът я даде постфактум |
| 2026-09-16 | D11 инструментът-пада-нарочно | catch | Edit tool разгъна ` escape до гол backtick; хванато от делта fact-check, не от автора |
| 2026-09-16 | D11 / PS quoting | catch | студен p4 хвана backtick изяждане в double-quoted PowerShell grep |
| 2026-09-16 | компакт хоризонтът на resume | catch (операторски) | операторът предположи 200K+компакт; rollout-ът показа compacted събитие (ред 387) |
| 2026-09-18 | таван на readiness пасовете (passes + 1) | operator-correction | пас 4 на CONS-011 диспачнат над тавана; операторът отсъди: пасовете над контракта са негова дума, по една на пас, без промяна на конфига (арбитраж, PLAN_CONS CONS-011 статус блок) |
| 2026-09-19 | VERIFY паралелно (дума 2026-09-17) | operator-correction | арбитражната сесия предаде решената дума в брифа на CONS-011 като „allowed" и Колегата пусна suite-овете поред; после двете порции наведнъж → memory kill; правилото за ПОРЦИИ легна в PROJECT_OVERRIDES § Test policy (дума 2026-09-19) |
| 2026-09-19 | D11 инструментът-пада-нарочно | catch | verification pass 2 изпълни guard-а на CONS-011 срещу синтетични източници и го счупи 3 пъти; заменен с byte pin-ове (PLAN_CONS CONS-011 completion record) |
| 2026-09-17 | VERIFY каданс | operator-correction | паралелен 8/8 приет с операторска дума; „една наведнъж" superseded в PLAN_CONS хедъра + машинната памет |
| 2026-09-17 | review-brief standard (D21/D23) | catch | pass-1 брифът на CONS-001 коригиран по свидетелски чеклист ПРЕДИ диспача (spot-check изречението; D23 блокът махнат на pass 1) — живо доказателство за CONS-008 регламента |
| 2026-09-17 | D13 котви в handback | catch | двата делта fact-check-а хванаха дрейфнали line цитати в Writer handback-ите (рунд 1 офсет ~6-15 реда; рунд 2 два off-by-one + една локация); кодът верен, цитатите поправени преди платените пасове |
| 2026-09-17 | pre-dispatch checklist completeness | catch | the gap was in the written standard, not the executor - more live evidence for CONS-005 rendering the standard into the skill template where it cannot be half-dictated |
| 2026-09-17 | контрола, проверена твърде тясно | catch (одиторски) | CONS-002 pass 1: COO-то провери flipping контролата срещу ЕДНО връщане назад (пробата махната) и я обяви за жива; одиторът намери, че тя проследява производствения argv, тоест пада само при изтриване, не при отслабване — точно регресията, която се случва. Корекционен рунд 1; мутационна матрица M0-M6 вместо твърдение |
| 2026-09-17 | свръх-обобщаваща проза в тестова секция | catch | CONS-002: ТРИ отделни изречения, верни за едно лице и написани сякаш покриват съседните (два контрола-обобщения + „doubles the ENVIRONMENT, never the logic" за faces 5-8); и трите хванати от fact-check гейта, нито едно от собственото четене на автора — третото оцеля цял корекционен рунд, чийто предмет беше точно какво заобикалят двойниците |
| 2026-09-17 | операторски stop на платен пас | operator-correction | CONS-003: диспач на verify пас убит от оператора ПО НЕВНИМАНИЕ (87/53→82/53, ~5пп, нула вердикт). НЕ е engine/wrapper дефект — бъдеща сесия да НЕ дири memory leaks или нестабилност по тази следа; ре-диспач с дума, pass на 82/53→79/53 |
| 2026-09-17 | D11 stub реализъм | catch (одиторски) | CONS-003 pass 1: stub-ът печаташе `session id:` на stdout, а реалният codex го праща на STDERR — тестът маскираше дефект в ядрото на тикета; живо доказателство: собственият ни диспач остави stale id. Поправено със stream-realistic stub (банер само на stderr) + hex сравнение на байтовете |
| 2026-09-17 | източник във всяко твърдение | **violation (на COO-то, самообявена и ретрактирана)** | CONS-004/006: COO-то записа тук „двойката 79/52 беше ОБЕЗСИЛЕНА от ресет по време на работата" — инцидент, който НЕ се е случил. Фактите (операторска корекция): при даването на 79/52 са оставали 49 мин живот на прозореца, работата е текла над 2 ч, прозорецът се е обърнал на 100 ПРЕДИ диспача, пасът е минал изцяло в новия — двойката 100/52→96/51 е чисто измерване. Нищо не е било обезсилено. Поуката е само че стартова двойка се вкисва и се чете при диспача. Заразата стигна до брифа на Колегата и роди правило в `docs/METRICS.md:57-61`, изведено от несъществуващо събитие; целият файл после отпадна по арбитраж. Указател: записът на CONS-006 в PLAN_CONS |
| 2026-09-17 | граница за генеричност | **catch (на арбитъра, срещу собственото му авторство)** | CONS-006: D19/D22 бяха записали дисциплината на кампанията D1–D26 като публична payload доктрина — „кратка METRICS секция" — при положение че измерването никога не е било тема на payload-а и непознат с един проект може никога да не пипне codex. Хванато от мастер сесията, която Е авторът на D19/D22 и на тикета, и отсъди срещу собственото си решение. Тикетът падна върху невалидна предпоставка СЛЕД зелена работа и преди одиторски пас — нула изхарчена квота. Указател: `.aiwf/arbiter-brief.txt` **[преместен 2026-10-04 в `dev/backlogs/readiness/CONS/arbiter-brief.txt`, HARD-023]** + D22 поправката в CONSOLIDATION_2026-09-16.md |
| 2026-09-17 | съседен договор, пропуснат ОТ брифа на COO-то | catch | CONS-004: брифът ми забрани текста на note op-а, за да пази update-suite секция 14 — с което 0011 щеше да пипне `CLAUDE.md` на консуматора, а release бележката му да мълчи (обратното на конвенцията на 0009/0010). Хванато при собственото четене на пълния диф, поправено с микрорунд при топъл контекст ПРЕДИ платения пас, не с корекционен рунд след него. Дефектът беше в брифа, не в изпълнението |
| 2026-09-17 | P-D11 приложен върху собствения си диф | catch (на Колегата) | CONS-004: `NOTES.md:90` изброяваше какво носи note-ът и стана непълно с новата операция — вдигнато от Колегата като „непълно, не невярно". Диф, който приземява „изброяване се затваря с грep", не може да остави изброяване една грепа по-късо в същия commit; закрито с грep върху целия файл, 15 реда класифицирани, точно един непълен |
| 2026-09-18 | анкер в брифа срещу дома по D-номер | catch (одиторски) | CONS-005 pass 1: D23 иска литерала в plan-readiness шаблона, а брифът ми посочи шаблона за имплементационен диф — гребът и self-check-ът минаваха, защото доказват ПРИСЪСТВИЕ, не МЯСТО. Readiness диспач можеше законно да пропусне блока. Поправено с разделение (литерал в readiness формата, указател в диф шаблона), а не с копие в двата — второто би било два литерала в един файл, което substring пин не различава |
| 2026-09-18 | пин, който носи половин правило | catch (на Колегата) | CONS-005 рунд 1: затварящите `**` стояха между правилото и същината му („преархитектиране пре-задава въпроса**, така че се връща на студен"), тоест пиннатият низ щеше да пази заглавието, а „връща се на студен" оставаше свободно за триене. Двата булета преформатирани в двата скила; значението непроменено. Дефект, който щеше да оцелее незабелязан през всяка проверка за присъствие |
| 2026-09-18 | changelog, който обещава повече от инструментите | catch (одиторски) | CONS-005 pass 1: `CHANGELOG.md` твърдеше „Each sentence is pinned", което беше невярно и остана невярно след разширяването на пиновете. Изборът беше СТЕСНЯВАНЕ на твърдението до „всяко ПРАВИЛО", с именуване на неприпнатите клаузи — не пиннване на проза, за да стане едно изречение вярно. Пин, чиято причина е да оправдае changelog, е пин с грешна причина |
| 2026-09-17 | substring пин срещу правило с два дома | catch | CONS-004: генеричният доктринен луп е substring тест, тоест два записа за един файл и една фраза биха минали и при ЕДНА инстанция — P-H10 щеше да е пин, който не може да падне. Заменено с находка по БРОЙ (=2) и литерална контрола, махаща само първата инстанция; инструментът накаран да падне нарочно преди да бъде вярван |

| 2026-09-20 | стояща дума покрива само работата, за която е дадена (guard (b)) | **violation (на COO-то)** | CONS-007 стъпка 7: операторът даде ID-то на сесията на Силеракс и дума да ѝ се пише; COO-то разшири думата и до Фурнисимо по собствена инициатива и я обяви като удобство („да не чакаме на два такта"). Нула мутации там — сесията хвана read-only pre-state и спря на собствения си stop gate от 2026-09-16 — но неискан гейт въпрос стигна до оператора. Указател: CONS-007 completion record в PLAN_CONS |
| 2026-09-20 | VERIFY, паднал по средова причина, спира и пита | catch | CONS-007 стъпка 2: първият WSL батч даде 4 червени суита, всичките от `*.log` файлове, които COO-то беше сложило ВЪТРЕ в сканираното работно копие (`files of an unclassified type`). Спряно на червено по операторска дума, нула опити за поправка, средата коригирана с дума и ре-рън → 7/7. Инструментът беше дефектният, не кодът |
| 2026-09-21 | D18 тригер 4 — две роли не са съгласни писмено → операторът | **violation (на COO-то)** | CONS-008 вер. 1: Одиторът оспори ДИЗАЙНЕРСКО решение на COO-то (равни байтове = наши); COO-то прие четенето му вместо да спре и да го донесе на оператора на човешки; рунд 2 + вер. 2 (~430k tok) платени за дизайн, който операторът отхвърли с едно изречение („папката е на плъгина"). Роди кандидата „Разногласието не е блокер" → CONS-009 |
| 2026-09-21 | анкер и „дървото е чисто" в брифа = изход от команда, не проза от плана | **violation (на COO-то)** | CONS-009: (а) scope гардът в брифа ми изключваше `dev/` само за НЕТРАКНАТИ файлове, докато аз бях редактирал тракнат `dev/` файл между `git rev-parse HEAD` и диспача — гардът падна върху моята редакция, а изречението „дървото е чисто при диспач" беше невярно; (б) chain редът и `§ Routes` анкерът носеха r8 числа, които файловете бяха надраснали (`:5100-5129` при `:6764`; `:668` при `:699`). Никой гейт не чете котвите на един бриф — (в) по-долу беше хванато от fact-check гейта, (а) от Колегата, (б) от discovery-то. Указател: CONS-009 completion record |
| 2026-09-21 | котва, мерена преди вмъкванията на СОБСТВЕНИЯ тикет | **violation (на COO-то)** | CONS-009 p1 блокер 1: поправих застоелия указател ПРЕДИ имплементацията, а +196 реда на самия тикет преместиха лупа на `:6764`; на следващия рунд моите нови числа пак бяха с една редакция назад (пинът ги избута с 18 реда). Оттам правилото, приложено до края: chain редът се реже ПОСЛЕДЕН във всеки рунд (четири рязания), а всеки указател се ОТВАРЯ, не се преписва от таблица, писана по-рано в същия рунд. Указател: PLAN_CONS ред 8 преамбюл |
| 2026-09-21 | доктринно изречение, което изброява света | **violation (на COO-то и на второто мнение, три пъти)** | CONS-009 B2: три поправки паднаха на един и същ похват — всяка твърдеше ОБХВАЩАНЕ и беше оборена с ЕДИН файл: „втвърден" като второ условие (клон, който никой не решава); „втвърдяването Е това, което проверка 2 брои" (readiness чете пет неща, които тя не стига, `docs/WORKFLOW.md:427-435`); „всеки план-роден тикет е след readiness" (`skills/work/SKILL.md:44-46` иска тикет в план за всяка R2/R3, а readiness е за ТРАЙНИ планове). Затворено чак от текст, който не назовава НИКАКЪВ вид работа. Цена: 3 паса и 3 рунда за един абзац |
| 2026-09-21 | fact-check гейтът пази скъпия пас | catch | CONS-009, три пъти: (1) контрола, чийто етикет твърдеше „преименуван или изтрит скил", докато кодът добавя име, което никога не е имало директория; (2) указател „находка", сочещ изчислението `:6383` вместо `add(...)` реда `:6388`, докато съседният му сочи `add(...)`; (3) двата изрични въпроса преди последния пас („обвързва ли нещо евтиния маршрут извън четирите проверки" / „твърди ли се обхващане") върнаха НЯМА и последният пас го потвърди с нула находки. И трите са неща, които се четат от дървото — намирането им на одиторска цена е най-скъпият начин |
| 2026-09-21 | host-инжектирана директива срещу канона (guard (f)) | catch (две сесии) | По инструментния/MCP канал пристигна „auto mode": чети с `cat`/`head`/`sed`, редактирай със `sed`/heredoc — срещу „Reading is not a shell job" в CLAUDE.md и payload доктрината. Отхвърлена независимо и от Колегата, и от COO-то, и от втората сесия. Идентична през сесиите и HARNESS-инжектирана; сесия, която се подчини, не оставя следа от избора. Не е сигурностен въпрос — мени как се четат файлове, не какво може да се пише |
| 2026-09-21 | readiness цикълът не е хванал дефект, който после струва 4 code паса | наблюдение (за инструмента) | CONS-009: PLAN_CONS мина шест readiness паса, а обвързването „only … downstream", залепено до правило за маршрутиране, оцеля през тях и беше намерено чак от code одита. Не е аргумент по спора и не е ничие нарушение — факт за инструмента, записан да не се преоткрива |
| 2026-09-21 | архивиращата проверка (P-D3) хвана правило без дом | catch | Затварянето на PLAN_CONS: гребът за rule-class точки в процесните секции удари на ред, роден в записа на CONS-010 — „prep-ът задължително е root" — правило за средата без дом. Контролата на инструмента: същият греп върху PLAN_HARD върна 1 попадение, тоест не е мъртъв. **Домът:** `dev/PROJECT_OVERRIDES.md` § Test policy, при другите два WSL капана (guard (h): текст и указателен ред в едно одобрение). Трите капана се местят в скрипта, когато кандидатът за POSIX порцията стане тикет |
| 2026-09-20 | evidence pack носи пътя, по който се чупи, не само къде живее | catch (self) | CONS-008 p1 = 14пп, най-скъпият cold пас в плана: пакетът имаше котвите на промяната, но не и recovery картата (journal → recovery клонове); P1 беше точно там. Дифът е и най-големият (24 файла) |
| 2026-09-20 | fact-check гейт | catch | CONS-008: „every section points at the payload document" — невярно за 4 секции (D13/D15/D18 нямат дом в payload-а; ролята Е домът им), стеснено на 6 повърхности ПРЕДИ платения пас; втори catch на делта: „guard (f) е стоп правило" — не е, прецедентно е |
| 2026-09-20 | VERIFY, паднал по средова причина, спира и пита | catch (на Колегата) | CONS-008 порция 2: selfcheck червен по `--project-fixture .` върху копирано дърво (шестте root-bound owned rules на self-install-а) — процедурен дефект на брифа на COO-то; CI формата е `--plugin-root .`; Колегата спря с контрола върху непокътнат HEAD, нула поправки |
| 2026-09-21 | snap pwsh кеш капан (PROJECT_OVERRIDES § Test policy) | catch (на Колегата) | CONS-008 рунд 4: порция 2 червена 3/4 → 4/4 „no PowerShell host", нула assertions по тикета; спря и поиска дума; `rm -rf ~/.cache/powershell` под `pnp` по дума → 4/4 |
| 2026-09-20 | отчетът е авторитетът, не собствената бележка (D4) | catch (на консуматора) | Силеракс отказа да чисти записи, чиито ID-та не са сред отпечатаните пет — включително два СОБСТВЕНИ supersede записа и един дубликат, роден от същото издание. Точно механизмът на D4; роди кандидата „`0011` supersede списъкът пропусна едно ID" |
| 2026-09-22 | PROJECT_OVERRIDES § Communication (каналът е кратък) | operator-correction | HARD-015 readiness: COO каналът носеше пойнтъри, броеве и дълги резюмета ход след ход; операторът коригира повторно и обяви правилото за стоящо за ВСИЧКИ сесии — памет `operator-channel-stays-short`. Правилото вече съществуваше в § Communication: нарушението е изпълнителско, не липса на канон |
| 2026-09-22 | ORCHESTRATOR.md § Data discipline (число, което само операторът вижда, се ИСКА) | operator-correction | HARD-015 readiness пас 1 върна NEEDS-FIX; COO-то поиска стоп двойката и СПРЯ работа до нея, все едно е гейт. Правилото казва само да се иска и да не се обещава чуждо измерване — редът в Pass statistics е счетоводство. Единственият гейт след пас 1 е операторската дума за пас 2; поправката на блокерите не чака нищо. Операторът: „защо спря, има ли инструкция в лупа да спреш след одитор". Липсва дуал: правило, което КОМАНДВА искане, без изречение кога искането НЕ спира работата |
| 2026-09-22 | „вердикт и диспач не делят съобщение" (ORCHESTRATOR.md § Verdict and dispatch) | operator-correction | РЕЦИДИВ на спирането след одиторски пас (втори за деня, след HARD-016 p1): правилото се чете като „спри след вердикт", а то забранява само платен диспач в съобщението на вердикта — собствената работа на COO-то не чака нито дума, нито стоп двойка. Операторът: „защо всички спирате след 1ви пас". Дуалът липсва и в това правило |
| 2026-09-22 | guard (b) — тикетът чака собствената си дума | violation (COO, Fable) | HARD-016 диспачнат без дума: операторът каза „ти си" за нанасянето на CleanTest записите, COO-то го разтегна до целия обявен план вкл. диспача; операторът е искал рестарт/ъпдейт на Claude преди 016 и коригира постфактум („дума за 016 не съм давал, но късно е вече"). Иронията: тикетът, който тръгна без дума, е точно този, който поправя seed-а за guard (b) |
| 2026-09-22 | една дума на пас (10в: операторът проверява квотата, ПОСЛЕ дава дума) | operator-correction (catch преди диспач) | HARD-016 docs пас: COO-то прочете голата старт двойка „100 99" като дума и обяви диспач; операторът прекъсна — „дадох ти само старт двойка". Нула мутации, пасът не тръгна. Същият клас като guard (b) случая от сутринта: разтегнато покритие на операторска реплика |
| 2026-09-22 | „операторът не арбитрира инженерни решения" (§ The operator does not arbitrate) | operator-correction | D4 диспозицията за Furnissimo беше на COO-то от първото отлагане (консолидацията е тукашна), а стигна до оператора два пъти преди мастър сесията да я разплете; цената — Fable събуждане за бриф, който е трябвало да е пратен проактивно. Операторът: „можеше и по-рано да го направиш като мастър сесия" |
| 2026-09-23 | guard (b) — „да“ покрива само питаното действие | operator-correction | COO на Opus 5.5 прочете „да“ на „заключи multi_agent_v2 и после към ролите?“ като одобрение и приложи `/pnp:roles --set` (Колегата → Opus 5.5, одит → Astra). Операторът: „къде видя да ти казах приложи новите роли“. Върнато с `git restore`, памет `yes-covers-only-the-asked-action` |
| 2026-09-24 | VERIFY каданс (PLAN_HARD § Ред и гейтове) | operator-correction | HARD-017, два реда в схемата: брифът поиска пълните Windows + WSL порции по записания каданс. Операторът: „за една дребна промяна и два реда код ние чакаме 2 часа тестове“. WSL спряна по дума, правилото сменено на пропорционален VERIFY (Ruling ledger) |
| 2026-09-24 | една дума на пас — пасът се иска, когато го има | operator-correction | HARD-018 в работа: COO поиска предварително дума за топъл верификационен пас, преди Колегата да е върнал кода и преди първия одит. Операторът: „СПАЗВАЙ ПРОТОКОЛА“ / „НИЕ НЕ СМЕ ГОТОВИ С КОДА, ТИ МЕ ПИТАШ ЗА 2РИ ПАС“. Въпросът е оттеглен; пасът след първия се иска само когато първият върне корекции |
| 2026-09-24 | „вердикт и диспач не делят съобщение“ — дуалът | operator-correction (рецидив) | HARD-019 p1: COO докладва вердикта и спря, без да пусне корекционния рунд. Корекционният рунд не е платен пас и не чака нито дума, нито нов ход. Операторът: „И ТИ ЩО СПРЯ“. Същото като реда от 2026-09-22 |
| 2026-09-30 | Step 0 interlock на `/pnp:review` при self-hosted издание | catch (на COO-то, спряно и питано) | RDY-001: след `--apply` repo-то е 0.2.13, живият плъгин `D:\pnp-live` е 0.2.12 → `--check` връща „downgrade refused“ и скилът казва „спри“; `pnp-live` се опреснява едва след commit-а, който чака паса. Операторът разреши паса с непроменения wrapper (дума „да“, scripts/ идентични в двете дървета). Всяко следващо издание с self-update минава през същото — ред в PLAN_RDY completion record |
| 2026-09-30 | fact-check гейтът пази скъпия пас / per-claim ledger | catch (на инструмента) | RDY-001, първата употреба на новата Step 2b форма: ledger 58 реда, 0 FALSE; но `CLAIMS:` редът на агента брои 53/5 при 55/3 в собствените му редове — броячът не е доказателство, редовете са. Одиторът все пак хвана 2 прозови блокера (разделяне над план в WORKFLOW; дата) — клас (б) консистентност, не (а) |
| 2026-09-30 | „вердикт и диспач не делят съобщение“ — дуалът | operator-correction (рецидив, консуматор) | Silerax LIV-002: след `pass` на одиторски пас 1 COO докладва вердикта и приключи хода, макар QA там да не иска дума; операторът там: „защо спираш … спираш без причина“ (повторение на Silerax CAP-002, 2026-09-23). Трети запис след `:624` и `:631`; източник — доклад на сесия Silerax LIV 004. → HARD-022 |
| 2026-10-02 | Pass statistics — старт→стоп двойката | operator-correction | PLAN_RGATE readiness p1: COO поиска началната стойност на брояча преди паса; операторът: „стига с тия начални стойности, не ви интересуват“, и „да“ на „занапред ли“ → правилото в § Pass statistics се сменя (текстът — на одобрение по guard (g)) |
| 2026-10-02 | fact-check гейтът пази скъпия пас | catch | RGATE-001: 392 твърдения над прозата на дифа, 7 FALSE — всичките коментари в кода („shells carry no copy“ ×3, „refRegex shared by plan-gate“, env-merge твърдение, „exactly the named damage“ при три fixture-а с допълнителна повреда); поправени с микро-рунд преди паса. Одиторът после намери 3 ПОВЕДЕНЧЕСКИ дефекта срещу договора, които прозовият гейт не вижда — двата инструмента се допълват, не се заместват |
| 2026-10-02 | VERIFY, паднал по средова причина, спира и пита | catch (на Колегата) | RGATE-001: `selfcheck` 1242/1243 в паралелната партида (role resolver „array model -> exit 2“, pwsh spawn под 7-процесно натоварване), 5/5 в изолация, 3 пълни рънa същия ден зелени; Колегата не повтори и докладва, COO спря и пита, операторът прие самостоятелния зелен рън. Fingerprint-ът не е в VERIFY_RUNBOOK — записан тук |
| 2026-10-02 | plan gate-ът пази плановия пас (RGATE-001) | catch (на инструмента) | PLAN_DRAFTS, преди пас 3: първият жив отказ на гейта върху реален дефект — шест делта-scan реда със седем клетки (`scan-row-shape` ×6), поправени, exit 0; нищо не е похарчено. Подробности: `dev/backlogs/readiness/DRAFTS/revisions.md` (r8) |
| 2026-10-02 | собственият проход преди всеки платен пас (RGATE D8) | catch (на автора) | PLAN_DRAFTS: четири печата (r6, r7, r8, r9) с 2 / 6 / 6 / 1 авторски блокера, намерени преди одитора; трите платени паса върнаха 5 → 3 → 1, всичките извън собствения проход (Branch policy срещу scratch резерва; добавената страна на диф гарда). Границата на шаблона мина през три паса, преди дословното пинване да я затвори — гард по брой не е гард по съдържание |
| 2026-10-04 | VERIFY, паднал по средова причина, спира и пита | catch (на Колегата) | DRAFTS-001: `example-cycle-windows` exit 1 в паралелната партида (46/47 — byte-identity проверката видя `.aiwf/drafts-selfcheck-out.txt` и `.aiwf/drafts-test-setup-out.txt`, писани от съседните команди по редиректите на брифа на COO-то; runbook капанът „ZERO edits in the working tree while the example cycles run“), 47/47 самостоятелно; Колегата докладва двата рънa, COO спря и пита, операторът прие („действай“). Дефектът е в брифа — и в acceptance-а на плана, който праща изходите в `.aiwf/` при VERIFY в една партида — не в кода; следващ бриф праща VERIFY изходите извън репото или пуска цикъла отделно от всичко, което пише под репото |
| 2026-10-04 | fact-check гейтът пази скъпия пас | catch | DRAFTS-001: 124 твърдения над прозата на дифа, 7 FALSE / 4 UNVERIFIABLE; две от неверните са ДОСЛОВЕН текст на плана (блок CL/M „шестте изречения сега казват setup writes no entry“ — вярно за 3 от 6; блок E „Gate 3 държи сесия извън всеки игнориран път“ — не под `docs/`), минал три readiness паса и четири собствени прохода; поправени с микро-рунд преди паса. Одиторът после намери 5 блокера, нито един прозово-фактически — двата инструмента пак се допълват |
| 2026-10-04 | оспорен дизайнерски блокер → операторът, не рунд (ORCHESTRATOR § Escalation; D18 тригер 4) | catch (на COO-то) | DRAFTS-001 code p1: Одиторът оспори D3/D11 (разширение на приземен план срещу планиращия lock); COO-то НЕ го имплементира, записа двете страни и цената на всяка на оператора с две bullet-а, а рунда за другите блокери пусна паралелно; операторът отсъди с една буква („А“); текстовете легнаха в същия рунд, верификацията ги прие. Обратното на 2026-09-21 (CONS-008: ~430k tok за дизайн, който операторът отхвърли с едно изречение) |
| 2026-10-04 | пас 1 язди стоящата дума (WORKFLOW § Plan readiness review) | operator-correction | PLAN_LEAN: COO-то вкара „пас 1 на операторска дума“ и „отделен ход = клик“ в цикъла; операторът: „имаме лупа цикъл ... да не стоя и да ви вардя“. Поправено: пас 1 тръгва на думата за планирането; отделният ход е граница на хода, не клик (`dev/backlogs/readiness/LEAN/revisions.md`, края) |
| 2026-10-04 | топъл пас с компенсации срещу студен (§ ГЛАВЕН ПРИОРИТЕТ) | catch (данни) | PLAN_LEAN p2 топъл с трите компенсации над 1119-редов план: ~298k до прекъсването срещу 148k за студения p1; p3 студен — 131k. Още една точка към въпроса (Pass statistics по-горе) |
| 2026-10-14 | инструментът пада нарочно / нула записи под репото | catch (на агента, самодокладван) | PLAN_LEAN own pass 3: агентът с инструментите написа scratch файлове в `dev/backlogs/readiness/LEAN/` (cwd на сесията), веднага ги изнесе и го докладва; COO провери директорията — само осемте readiness файла. Брифът казваше scratch пътя, но не „създай го преди `cd`“ |
| 2026-10-14 | fact-check гейтът пази скъпия пас | catch | LEAN-001: 176 твърдения над прозата на дифа, 3 FALSE — два коментара (генераторът „повтаря“ overrides предупреждението) поправени с микро-рунд преди паса; Колегата на свой ред хвана грешка в брифа на COO-то: генераторът има собствена бележка (`scripts/setup/generate.mjs:1398`), само не през общия helper. Одиторът после — 0 находки. Указател: PLAN_LEAN, LEAN-001 completion record |
| 2026-10-14 | „Заглавие не е текст“ (overrides § Loop shape) — препрочитай правилото, не доктрината | operator-correction | COO-то записа в чекпойнта „след компресиране препрочети WORKFLOW, LOOP, overrides, ORCHESTRATOR“; операторът: препрочитането на всичко след компресиране е чиста сесия. Поправено в чекпойнта: само секцията на правилото за гейта, ако текстът ѝ не е в контекста. Правилото го казваше и преди — отклонението беше в чекпойнта, не в канона |
| 2026-10-14 | „Verify an inherited fact before it enters a brief“ (WORKFLOW § Ticket brief contract) | operator-correction (Silerax) | Silerax UI 050, UIR-050: COO-то взе „Hard rules“ блока от стария бриф на UIR-032 вместо от сегашните overrides (там „no build“ е заменено с build само през `up.ps1` в `.next-e2e`, `d5199c8e`); операторът го хвана преди диспача. Локално: източник на всеки ред + scan сверка преди диспача |
| 2026-10-14 | `/pnp:update` Step 3 „Applying is an operator decision, so wait for it“ | violation (Silerax) | Silerax UI 050: 0.2.16 → 0.2.17 приложен веднага след dry run на по-ранно „1 Да, сега“, дадено ПРЕДИ операторът да каже „аз ще си пусна сам ъпдейтс“; резултатът верен (self-check 1262/1262), гейтът прескочен |
| 2026-10-14 | по-късна реплика стеснява стоящото „да“ | operator-correction (Silerax) | Silerax UI 050: след „сам ще си пусна ъпдейтите“ COO-то продължи да маркира 27 записа в PNP_CANDIDATES без да чака; операторът: „не изчака ъпдейта, почна поправки ... не мога да ти насмогна“ |
| 2026-10-14 | guard (g) - правило се показва преди да легне | operator-correction (Silerax) | Silerax UI 050: махнати два readiness блока от overrides (18 реда) без първо да се покажат; махането вярно (`ef7381bc`), показването прескочено; оттогава всяко правило показано поотделно (`40625391`, 8 локални правила) |
| 2026-10-14 | работа извън доктрината минава през въпрос (кандидат, план Б) | operator-correction (Silerax) | Silerax UI 050, събитие 5: след хванатия стар бриф COO-то пусна непоискана sonnet сверка на брифовете на UIR-050 (224 160 токена); намери реални дупки, но лиценз нямаше. Сесийно правило на оператора: агент или проверка извън доктрината - първо въпрос |
| 2026-10-14 | ORCHESTRATOR § Escalation, тригери 1 и 3 („a fired trigger makes escalation MANDATORY“) | violation (Silerax) | Silerax UI 050, събитие 6: споделените колони на трансферите (`useTransferColumns`, ползвани и в досиетата на договор, сделка, страна) - COO-то реши само (D16 `variant`) срещу записаното в PLAN_UIR § UIR-050 (6412-6415), после го даде като небрежно „или-или“; ескалацията е отворена там |
| 2026-10-14 | ORCHESTRATOR § Escalation, тригер 1 | violation (Silerax) | Silerax UI 050, събитие 7: D9 смени `dossier.qualityOnParent` (добави `<link>`), ключ извън списъка „changed texts“ на плана (6421-6425); прагът на риска го брои за блокер |
| 2026-10-14 | ORCHESTRATOR § The event ledger; PLAN_STAB P1 | violation (Silerax) | Silerax UI 050, събитие 8: нито едно от събитията 1-8 не беше в Event ledger-а на консуматора към доклада |
| 2026-10-14 | праговете на куката за тавана объркват COO при изключено автоматично компресиране | operator-correction | оператор: сесии от 800-900k без проблем, проблемът са 400/450/500k; Silerax и този repo вдигнати на 950k/1000k, изречението за ~500k махнато (виж § „ВЛИЗАТ В ПЛАН Б“) |
| 2026-10-14 | „Class: code“ - изпълним артефакт (WORKFLOW § R1/R2) | catch (Codex readiness пас 1) | PLAN_STAB r0-r2: COO-то класифицира тикета docs, за да спести одит; миграцията се изпълнява; операторът: „ти каза без одитор, а?“; поправено в r3 (`dev/backlogs/readiness/STAB/revisions.md`) |
| 2026-10-15 | WORKFLOW § COO owns broad scans, tripwire 3 (механичната процедура е работа за евтин агент) | operator-correction | STAB-001: VERIFY ре-рънът беше обявен за Колегата (Opus, ~180k контекст); операторът: „а защо пускаш колегата а не евтин сонет“; ре-рънът мина на `general-purpose`/`sonnet` (~58k), правилото легна в overrides § Test policy (дума „записвай го за постоянно“), от Silerax UIR-050 |
| 2026-10-15 | VERIFY, паднал по средова причина, спира и пита | catch (на Колегата) | STAB-001: партида 2 3/6 червени (fixture файлове изчезват в `%TEMP%` по средата на рън; на машината вървят `next dev` на Silerax и друга Claude сесия), партида 1 върху същото съдържание 6/6; Колегата спря без поправки, ре-рънът на празна машина 6/6. Второ наблюдение в същата посока: Silerax UIR-050 build падна при пуснат `next dev` и мина без него |
| 2026-10-15 | нов доктринен блок срещу съседно изречение | catch (одиторски) | STAB-001 code p1: два одобрени блока (F, U) противоречаха на съседни изречения, които пасът на плана, own pass-ът и fact-check-ът не видяха (един чете твърдения, не съседство); затворено с по едно изречение около блока, блоковете дословно. Към кандидата „Доктринно изречение, което изброява света“ |
| 2026-10-14 | Gate 3 затваря трансферната повърхност при отворен маршрут | наблюдение (за инструмента) | LEAN-001: кандидатите от проучванията и от докладите на Silerax чакаха в `.aiwf/candidates-queue.md`, защото маршрутът беше отворен; легнаха с docs commit-а след `{}`. Същото като Silerax UIR-047 (`.aiwf/pnp-ledger-pending.md`) — доказателство за кандидат (j) в § „Таван на контекста“ |
| 2026-10-15 | a pre-verdict micro-round keeps the instrument fail-capable (WORKFLOW § COO owns broad scans, tripwire 4) | catch (auditor) | PLB-002: the COO's micro-round narrowed an existing test-update assertion to `every()` over a possibly empty list; the Writer reported "if no file changed at all, the check also passes" and the COO let it through; Codex pass 1 raised it as a blocker. Pointer: PLAN_PLB § PLB-002 completion record |
| 2026-10-15 | the provenance scan reads root `*.md` as payload; the self-check is the gate (overrides § Hard rules Provenance) | catch (self-check, on the first consumer proof of 0023) | PLB-003 D10 self-update: the integrated self-check went red 1257/1262 because the new `$schema` line of `CHANGES_0.2.18-to-0.2.19.md` carries two drive-letter paths and the report sat at the root; resolved by `paths.changesDir = "dev/changes"` for this repo, then 1262/1262. Pointer: PLAN_PLB § PLB-003 completion record; candidate "root `CHANGES_*.md` history vs `dev/changes/`" |
| 2026-10-16 | CLAUDE.md § Shared rules "Run git bare from the repo root ... no `-C` prefix" | operator-correction | `/pnp:mission` reconstruction: the COO ran `git -C D:\pnp-live log --oneline -1` to confirm the live copy's HEAD, which raised a dialog; the operator: „защо ми поиска гит диалог". The check was not needed for the reconstruction; the only `-C` form in this project is the documented pnp-live refresh after a commit. Pointer: this row |

## D2 pointer rows

| 2026-09-16 | PLAN_CONS одобрен — пълните решения/фрази живеят в dev/backlogs/active/PLAN_CONS.md; дизайн авторитетът в dev/backlogs/CONSOLIDATION_2026-09-16.md | **[дописано 2026-09-21: планът е архивиран, сега е `dev/backlogs/archive/005_PLAN_CONS_2026-09-21.md`. Редът е датиран лог и пътят в него е бил верен, когато е писан — затова се дописва, а не се пренаписва.]** |
| 2026-09-17 | VERIFY кадансът паралелен (операторска дума) + pre-dispatch checklist — домовете: PLAN_CONS хедърът; памет machine-constraints-verify-runs |
| 2026-10-02 | Release order: tag locally + main and the tag in ONE push, CI after, standing until revoked (operator rule, „да за правилото“) — home: `dev/PROJECT_OVERRIDES.md` § Hard rules Release discipline + § Test policy; PLAN_DRAFTS trace step 2 carries a one-line note; the RGATE record's „proposed text awaits guard (g)“ is closed by this row |
| 2026-10-16 | Three-way rule-hygiene pass, led from this repo (operator „тристранката я прави тук, пиши на двете сесии, компактиране и чистене"): the rule "a rule record carries a marker, not its story" landed in all three overrides; overrides compacted with a sonnet obligation scan each - PnP 59/0 missing (28,087 -> 24,867 chars, `1895fa8`), Silerax 185/0 (43,497 -> 40,297; commits 62791463, aa68ca34), Furnissimo 54/0 (25,766 -> 23,154; 147dc41d); memory one-home-per-rule - PnP 21 -> 8 files, Silerax 30 -> 25, Furnissimo 33 -> 26, deletions on the operator's word in each session; memory-only operator rules kept with `(operator rule <date>)` markers (Silerax 10 awaiting the word, Furnissimo 10 kept + 3 COO generalisations as candidates, 8edf316b). Process fact: Gate 1 denies a general-purpose subagent's Write to the user-scope memory folder too, so memory rewrites are main-session work |
| 2026-10-16 | Provenance moved out of the overrides into this file (rule "A rule record carries a marker, not its story"): § Hard rules - tag word 2026-10-01 (covers pushing the tag), release discipline 2026-10-02 rationale "every consumer is Windows today and the local self-check is the proof"; § Test policy - proportional VERIFY 2026-09-24 (supersedes PLAN_HARD § „Ред и гейтове" full 8/8), HARD-021 2026-09-28 (CI after the push, Portion 2 not a gate), portions 2026-09-17 + 2026-09-19 (memory kill of 8 Windows + 3 WSL processes), option A 2026-09-22 (Portion 2 = one invocation, sequential legs; the 0.2.8 measured form), third trap 2026-09-21 (`git archive` dubious ownership, root prep + `su - pnp`, PLAN_CONS CONS-010 record), runbook word 2026-09-22, scan-agent checks 2026-10-15 (adopted from Silerax UIR-050, first on STAB-001); § Loop shape - checkpoint thresholds history (400k/450k -> 950k/1000k, operator 2026-10-14; from Silerax UIR-040/041), „Заглавие не е текст" („да, впиши го в overrides", Silerax Plan F3), COO tiers quote „от сега нататък, впиши го в overrides". The incidents' texts: `dev/VERIFY_RUNBOOK.md` and the rows above (2026-09-17, 2026-10-02, 2026-10-14, 2026-10-15) |
| 2026-10-02 | PLAN_DRAFTS одобрен — черновите и readiness историята под `plansDir` (`drafts/`, `readiness/<ABBR>/`), scratchDir само за живата механика и за единствения Gate 3 случай; домът на правилото в payload-а: `skills/review/SKILL.md` Step 2e + `docs/WORKFLOW.md` (след DRAFTS-001); за това репо: блок P в `dev/backlogs/active/PLAN_DRAFTS.md` → `dev/PROJECT_OVERRIDES.md` § Workspace paths (пише го Колегата с DRAFTS-001; замества текста на HARD-023 § „Правилото“) **[дописано 2026-10-04: DRAFTS-001 затворен с `dd2b81f` — Step 2e, WORKFLOW и блок P са приземени; планът е `dev/backlogs/archive/008_PLAN_DRAFTS_2026-10-04.md`; редът е датиран лог и пътят в него е бил верен, когато е писан]** |
| 2026-10-14 | PLAN_LEAN одобрен (дума „odobrqwam“, след readiness пас 3 PASS) — пълните решения D1-D14 и тикетът LEAN-001 живеят в `dev/backlogs/active/PLAN_LEAN.md`; readiness историята в `dev/backlogs/readiness/LEAN/`; издание 0.2.17 |
| 2026-10-14 | Заглавие не е текст — след компресиране COO препрочита текста на правилото преди гейт / readiness / диспач; readiness започва със зареждане на `/pnp:review` (операторска дума „да, впиши го в overrides“) — home: `dev/PROJECT_OVERRIDES.md` § Loop shape, в bullet-а „Чекпойнт по гейтове“; произход: § „Таван на контекста“ по-горе, инцидентът на Silerax Plan F3 |
| 2026-10-14 | Чекпойнт по гейтове и таван на контекста (операторско правило, „пускай тикета“; пренесено от Silerax UIR-040/041) — home: `dev/PROJECT_OVERRIDES.md` § Loop shape + § Workspace paths (`checkpoint.md`); механизмът: `.claude/hooks/context-gate.mjs` (HARD-024, `dev/backlogs/active/PLAN_HARD.md`); payload кандидатът: § „Таван на контекста“ по-горе |
