// Agents Office v2 — roster + design tokens (ported from v1 command-centre.html)
import { applyData } from './profile.js';

// Nominal.so tokens (locked design language, 30 Jul 2026)
export const TOKENS = {
  cream: '#FDFFF8',
  ink: '#151414',
  grey: '#5A5A5A',
  hairline: 'rgba(21,20,20,0.12)',
};

// Dept mapping: Support→mint, Sales→butter, Marketing→coral, Finance→periwinkle,
// Operations→violet, Brain→sage.
// NOTE (17 Aug 2026): the old 'ops' pod split in two. The accounting half kept the pod,
// the periwinkle palette and the key 'fin' (now FINANCE); Proposals + Intel moved out into
// a new 'ops' pod (OPERATIONS) alongside Legal Review, Compliance and Internal Reporting.
// V3.1 (5 Sep 2026, AJ): SUPPORT → EMAILS (same mint slot), new DELIVERY pod (sky) on the top axis.
export const DEPT_KEYS = ['emails', 'sales', 'marketing', 'ops', 'fin', 'delivery'];
export const DEPTS = {
  emails:    { name: 'ПОЧТА',            short: 'ПОЧТА', chip: '#5ADEB7', ink: '#1E9070', floor: '#E9F6EF' },
  delivery:  { name: 'РЕАЛИЗАЦИЯ',       short: 'РЕАЛИЗАЦИЯ', chip: '#8FD3F4', ink: '#2E86AB', floor: '#E6F4FB' },
  sales:     { name: 'ПРОДАЖИ',          short: 'ПРОДАЖИ', chip: '#EADC8F', ink: '#A08A1E', floor: '#F6F1DA' },
  marketing: { name: 'МАРКЕТИНГ',        short: 'МАРКЕТИНГ', chip: '#E69393', ink: '#C46060', floor: '#FAE9E7' },
  fin:       { name: 'ФИНАНСЫ',          short: 'ФИНАНСЫ', chip: '#98A5EF', ink: '#5B66CE', floor: '#EAEDFA' },
  ops:       { name: 'ОПЕРАЦИИ',         short: 'ОПЕРАЦИИ', chip: '#BFA2E3', ink: '#7449A9', floor: '#F2ECFA' },
  brain:     { name: 'БАЗА ЗНАНИЙ',      short: 'БАЗА ЗНАНИЙ', chip: '#D1DECD', ink: '#4C7A57', floor: '#E9EFE4' },
};

// 35 agents (V3.4, 7 Sep 2026: every department has a lead). grid = [col,row] desk slot on the department plinth.
export const AGENTS = [
  // EMAILS (5) — replaced Customer Support, 5 Sep 2026
  { id: 'elead', name: 'РУКОВОДИТЕЛЬ ПОЧТЫ',  dept: 'emails',    lead: true,  grid: [0.5, 0], hair: '#2b2b2b', skin: '#E8B98E' },
  { id: 'cmail', name: 'ПИСЬМА КЛИЕНТАМ',     dept: 'emails',    grid: [0, 1], hair: '#3b2b1d', skin: '#F0C9A0' },
  { id: 'imail', name: 'ВНУТРЕННЯЯ ПОЧТА',    dept: 'emails',    grid: [1, 1], hair: '#111111', skin: '#C68B59' },
  { id: 'vmail', name: 'ПИСЬМА ПОСТАВЩИКАМ',  dept: 'emails',    grid: [0, 2], hair: '#7a3b12', skin: '#F5D5B0' },
  { id: 'kmail', name: 'ПИСЬМА ПОДРЯДЧИКАМ',  dept: 'emails',    grid: [1, 2], hair: '#4a2a10', skin: '#D89F70' },
  // SALES (6) — Sales Lead at the head; Proposals moved in from Operations, Outreach retired
  { id: 'lexi',  name: 'РУКОВОДИТЕЛЬ ПРОДАЖ', dept: 'sales',     lead: true,  grid: [0.5, 0], hair: '#5a2d0c', skin: '#F0C9A0' },
  { id: 'enzo',  name: 'ОБОГАЩЕНИЕ ЛИДОВ',    dept: 'sales',     grid: [0, 1], hair: '#1c1c2e', skin: '#E0A878' },
  { id: 'ilm',   name: 'ВХОДЯЩИЕ ЛИДЫ',       dept: 'sales',     grid: [1, 1], hair: '#26140a', skin: '#F5D5B0' },
  { id: 'pros',  name: 'ПОИСК КЛИЕНТОВ',      dept: 'sales',     grid: [0, 2], hair: '#2a1a0e', skin: '#E8B98E' },
  { id: 'piper', name: 'ПРЕДЛОЖЕНИЯ',         dept: 'sales',     grid: [1, 2], hair: '#2d1a0a', skin: '#F0C9A0' },
  { id: 'folo',  name: 'ПОВТОРНЫЕ КОНТАКТЫ',  dept: 'sales',     grid: [0.5, 3], hair: '#171717', skin: '#F5D5B0' },
  // MARKETING (7) — Marketing Lead at the head since 7 Sep 2026
  { id: 'mlead', name: 'РУКОВОДИТЕЛЬ МАРКЕТИНГА', dept: 'marketing', lead: true, grid: [0.5, 0], hair: '#2a1a0e', skin: '#E0A878' },
  { id: 'riley', name: 'ИССЛЕДОВАНИЯ',        dept: 'marketing', grid: [0, 1], hair: '#8a4a1f', skin: '#F5D5B0' },
  { id: 'newt',  name: 'РАССЫЛКА',            dept: 'marketing', grid: [1, 1], hair: '#26140a', skin: '#D89F70' },
  { id: 'gfx',   name: 'ГРАФИЧЕСКИЙ ДИЗАЙН',  dept: 'marketing', grid: [0, 2], hair: '#141414', skin: '#F0C9A0' },
  { id: 'ada',   name: 'РЕКЛАМА META',        dept: 'marketing', grid: [1, 2], hair: '#3d2814', skin: '#C68B59' },
  { id: 'iggy',  name: 'ОРГАНИКА INSTAGRAM',  dept: 'marketing', grid: [0, 3], hair: '#552200', skin: '#E8B98E' },
  { id: 'vid',   name: 'ВИДЕОМОНТАЖ',         dept: 'marketing', grid: [1, 3], hair: '#1b1b24', skin: '#D9A97E' },
  // OPERATIONS (6) — Operations Lead at the head since 7 Sep 2026; Internal Dashboards joins; Proposals moved to Sales
  { id: 'olead', name: 'РУКОВОДИТЕЛЬ ОПЕРАЦИЙ', dept: 'ops',     lead: true,  grid: [0.5, 0], hair: '#111111', skin: '#F0C9A0' },
  { id: 'scout', name: 'АНАЛИТИКА',           dept: 'ops',       grid: [0, 1], hair: '#101820', skin: '#B07850' },
  { id: 'legal', name: 'ЮРИДИЧЕСКАЯ ПРОВЕРКА', dept: 'ops',      grid: [1, 1], hair: '#20242e', skin: '#F0C9A0' },
  { id: 'comply', name: 'КОМПЛАЕНС',          dept: 'ops',       grid: [0, 2], hair: '#5a3a1a', skin: '#C68B59' },
  { id: 'report', name: 'ВНУТРЕННИЕ ОТЧЁТЫ',  dept: 'ops',       grid: [1, 2], hair: '#2e2118', skin: '#E8B98E' },
  { id: 'dash',  name: 'ПАНЕЛИ ПОКАЗАТЕЛЕЙ',  dept: 'ops',       grid: [0.5, 3], hair: '#0d0d0d', skin: '#9C6B43' },
  // FINANCE (4) — the accounting team; Accounting Lead at the head
  { id: 'alead', name: 'ГЛАВНЫЙ БУХГАЛТЕР',   dept: 'fin',       lead: true,  grid: [0.5, 0], hair: '#1f1f1f', skin: '#E0A878' },
  { id: 'invo',  name: 'ВЫСТАВЛЕНИЕ СЧЕТОВ',  dept: 'fin',       grid: [0, 1], hair: '#4a2a10', skin: '#F5D5B0' },
  { id: 'apay',  name: 'ОПЛАТА СЧЕТОВ',       dept: 'fin',       grid: [1, 1], hair: '#0a0a0a', skin: '#8A5A32' },
  { id: 'recon', name: 'СВЕРКА',              dept: 'fin',       grid: [0.5, 2], hair: '#33221a', skin: '#E8B98E' },
  // DELIVERY (7) — new pod, 5 Sep 2026; Onboarder moved in from Sales
  { id: 'dlead', name: 'РУКОВОДИТЕЛЬ РЕАЛИЗАЦИИ', dept: 'delivery', lead: true, grid: [0.5, 0], hair: '#1f1f1f', skin: '#F0C9A0' },
  { id: 'pco',   name: 'КООРДИНАТОР ПРОЕКТОВ', dept: 'delivery', grid: [0, 1], hair: '#3d2814', skin: '#E8B98E' },
  { id: 'qa',    name: 'КОНТРОЛЬ КАЧЕСТВА',   dept: 'delivery', grid: [1, 1], hair: '#101820', skin: '#C68B59' },
  { id: 'crep',  name: 'ОТЧЁТЫ КЛИЕНТАМ',     dept: 'delivery', grid: [0, 2], hair: '#6b3410', skin: '#F5D5B0' },
  { id: 'cass',  name: 'МАТЕРИАЛЫ КЛИЕНТОВ',  dept: 'delivery', grid: [1, 2], hair: '#141414', skin: '#D9A97E' },
  { id: 'dasst', name: 'ПОМОЩНИК ДИЗАЙНЕРА',  dept: 'delivery', grid: [0, 3], hair: '#552200', skin: '#F0C9A0' },
  { id: 'ona',   name: 'ОНБОРДИНГ',           dept: 'delivery', grid: [1, 3], hair: '#0d0d0d', skin: '#9C6B43' },
];

// Plinth placement in world XZ. Brain central; departments well separated (AJ: not too close at zoom-out).
export const LAYOUT = {
  brain:     { pos: [0, 0],     w: 16, d: 16 },
  emails:    { pos: [-30, -23], w: 20, d: 26 },
  delivery:  { pos: [0, -48],   w: 20, d: 30 },   // 6th pod mirrors ops on the top axis
  sales:     { pos: [30, -23],  w: 20, d: 30 },
  marketing: { pos: [-30, 23],  w: 20, d: 30 },
  fin:       { pos: [30, 23],   w: 20, d: 26 },
  ops:       { pos: [0, 48],    w: 20, d: 30 },   // the 5th pod fills the empty bottom-left gap
};

// Department billboard metrics (v1 rule #5: live metrics float above each dept,
// values tick green on change, "Waiting Approval" pulses amber when > 0).
export const BILLBOARDS = {
  emails:    [{ id: 'emails',    label: 'ПИСЕМ ОТПРАВЛЕНО', val: 128 }],
  delivery:  [{ id: 'reports',   label: 'ОТЧЁТОВ ОТПРАВЛЕНО', val: 9 }],
  sales:     [{ id: 'leads',     label: 'ЛИДОВ ОБОГАЩЕНО', val: 47 },
              { id: 'callhrs',   label: 'ЧАСОВ ЗВОНКОВ', val: 9.5, fmt: v => v.toFixed(1) + ' ч', step: 0.4 }],
  marketing: [{ id: 'adspend',   label: 'РАСХОДЫ НА РЕКЛАМУ', val: 684, fmt: v => '$' + Math.round(v).toLocaleString('ru-RU'), step: 12 }],
  ops:       [{ id: 'proposals', label: 'ПРЕДЛОЖЕНИЙ ОТПРАВЛЕНО', val: 6 }],
  fin:       [{ id: 'invoices',  label: 'СЧЕТОВ ВЫСТАВЛЕНО', val: 23 }],
  brain:     [{ id: 'notes',     label: 'ЗАМЕТОК В ИНДЕКСЕ', val: 1204, fmt: v => Math.round(v).toLocaleString('ru-RU') }],
};

// Approval asks (agent requests → AJ decides; v1 flavour).
// Per-agent first so the ask matches who's asking; dept pool is the fallback.
export const APPROVAL_ASKS = {
  emails:    ['Отправить уведомление о повышении цены 120 клиентам — черновик приложен', 'Ответить в спорной переписке с подрядчиком — черновик приложен'],
  delivery:  ['Отправить сентябрьский пакет отчётов 14 клиентам', 'Опубликовать бренд-материалы на клиентском портале'],
  sales:     ['Отправить SMS для повторного вовлечения 214 холодным лидам', 'Переместить 8 корпоративных лидов в очередь менеджера'],
  marketing: ['Запустить 4 варианта рекламы Meta — бюджет $120 в день', 'Опубликовать ролик в Instagram'],
  ops:       ['Отправить коммерческое предложение Ridgeline Property Group', 'Согласовать изменённый договор Kea Logistics — отмечены 2 пункта'],
  fin:       ['Счёт №218 не совпадает с договором — приостановить для проверки?', 'Списать $180 несопоставленных комиссий по карте'],
};
export const APPROVAL_BY_AGENT = {
  cmail: 'Отправить уведомление о повышении цены 120 клиентам — черновик приложен',
  vmail: 'Принять обновлённый SLA поставщика — отмечены 2 изменения',
  crep:  'Отправить сентябрьский пакет отчётов 14 клиентам — двум нужен звонок',
  qa:    'Согласовать передачу сайта — отмечены 2 небольшие проблемы',
  dlead: 'Продлить проект Ridgeline на неделю — запрос клиента',
  apay:  'Счёт подрядчика №218 на $350 выше ставки по договору — приостановить оплату и уточнить?',
  piper: 'Отправить предложение Ridgeline Property Group — 12 мест, тариф Growth',
  iggy:  'Опубликовать ролик в Instagram — сценарий приложен',
  vid:   'Отправить 45-секундную демоверсию — титры встроены, версия 2 приложена',
  ada:   'Увеличить бюджет объявления до $180 в день — CPA $29',
  mlead: 'Одобрить контент-план на октябрь — 12 роликов, 2 рассылки, 1 обновление рекламы',
  olead: 'Согласовать операционный чек-лист на IV квартал — внутри 3 продления договоров',
  newt:  'Отправить августовскую рассылку 3 400 подписчикам — приложен черновик 3',
  scout: 'Одобрить сравнительную кампанию CallForge — записка приложена',
  enzo:  'Купить 500 кредитов FullEnrich — текущий пакет закончится завтра',
};

// Fake terminal lines for the desk screens (per-dept flavour), matching v1's chat voice.
export const WORKLINES = {
  emails: [
    '▸ готовит ответ — вопрос клиента по объёму работ',
    '▸ переписка с поставщиком: изменения SLA собраны',
    '▸ разобрано 14 внутренних писем · 3 требуют внимания',
    '▸ дан ответ по счёту подрядчика',
  ],
  delivery: [
    '▸ отчёт клиенту: сентябрьский пакет 9/14',
    '▸ проверка качества: передача сайта · 2 замечания',
    '▸ библиотека материалов синхронизирована с порталом',
    '▸ план проекта: перенесены 3 этапа',
  ],
  sales: [
    '▸ обогащает лид — Summit HVAC',
    '▸ распределено 6 лидов · 4,2 ч в очереди',
    '▸ проверено 32 потенциальных клиента · 91% валидных',
    '▸ отправлено сообщение для онбординга — Bay Plumbing',
  ],
  marketing: [
    '▸ готовит заход для ролика, версия 3',
    '▸ реклама Meta: 4 варианта отправлены на проверку',
    '▸ написан блок рассылки 2/5',
    '▸ экспорт бренд-кита: история + квадрат',
    '▸ рендеринг ролика, версия 2 — титры и перебивки',
  ],
  ops: [
    '▸ подготовлено коммерческое предложение в PDF',
    '▸ анализ конкурента: страница тарифов DialAxis',
    '▸ отмечен пункт договора 7.2 — ограничение ответственности',
    '▸ страница регулятора изменилась · сравнение версий',
    '▸ недельный отчёт: готово 4 из 6 разделов',
  ],
  fin: [
    '▸ сверка 14 платежей · 2 отмечены',
    '▸ счёт №218 и договор — найдено расхождение ставки',
    '▸ выставлен счёт — Summit HVAC $840',
    '▸ отправлено напоминание 2/3 — Alpine Freight',
  ],
  brain: [
    '▸ индексирует хранилище — 1 204 заметки',
    '▸ отвечает на аналитический запрос — когорта оттока',
    '▸ встреча запланирована: enzo × tess',
  ],
};

// INDUSTRY PROFILE (12 Sep 2026): a per-industry demo file rewrites pods, seats, rows, asks and screen lines in place. No-op without window.PROFILE.
applyData({ DEPTS, AGENTS, BILLBOARDS, APPROVAL_ASKS, APPROVAL_BY_AGENT, WORKLINES });
