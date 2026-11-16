import { TSkillId } from '../types';

export const CAN_VOLUME_BY_LEVEL = [12, 10, 8, 7, 6, 5];
export const SIP_REWARD = 1;
export const CAN_REWARD = 10;
export const BURP_CHANCE_BY_LEVEL = [0.08, 0.12, 0.16, 0.2, 0.24, 0.28];
export const BURP_BONUS = 5;
export const MEGA_BURP_CHANCE = 0.01;
export const MEGA_BURP_BONUS = 50;
export const DOUBLE_SIP_CHANCE_BY_LEVEL = [0, 0.05, 0.1, 0.16, 0.22, 0.3];
export const AUTO_SIP_INTERVAL_MS_BY_LEVEL: (number | null)[] = [
  null,
  4000,
  3000,
  2000,
  1200,
  700,
];
export const ARMBAND_BONUS_BY_LEVEL = [0, 0.1, 0.25, 0.45, 0.7];
export const TATTOO_BONUS_BY_LEVEL = [0, 0.15, 0.3, 0.5];
export const CRIT_SIP_CHANCE_BY_LEVEL = [0, 0.06, 0.1, 0.14, 0.19, 0.24];
export const CRIT_SIP_MULT = 3;
export const RECYCLE_BONUS_BY_LEVEL = [0, 0.15, 0.3, 0.5, 0.75, 1.0];
export const STEALTH_PENALTY_REDUCTION = [0, 0.2, 0.4, 0.6, 0.75];
export const STEALTH_SURVIVE_BONUS = [0, 0.25, 0.5, 0.85, 1.2];
export const HYPE_VOICE_BONUS_CHANCE = [0, 0.01, 0.02, 0.03, 0.04];
export const HYPE_TEAMMATE_BONUS = [0, 15, 30, 55, 90];
export const MARATHON_BASE_BONUS = [0, 1, 2, 3, 4, 5];

export const BELLY_THRESHOLDS = [0, 3, 12, 35, 90, 220];
export const BELLY_MULT = [1, 1.2, 1.5, 2, 2.5, 3];
export const BELLY_NAMES = [
  'Атлет',
  'Лёгкий намёк',
  'Мозоль пивная',
  'Ветеран',
  'Трещит по швам',
  'Шар',
];
export const ROOM_UPGRADE_BONUS = 0.08;
export const SKILL_PRICE_GROWTH = 1.55;
export const PILE_THRESHOLDS = [0, 1, 20, 60, 150];
export const EVENT_TICK_MS = 15000;
export const COACH_CHANCE = 0.15;
export const COACH_COOLDOWN_MS = 60000;
export const COACH_LOOK_MS = 2000;
export const COACH_CREAK_MS = 500;
export const COACH_PENALTY_RATE = 0.1;
export const COACH_PENALTY_MIN = 20;
export const COACH_SURVIVE_BONUS = 30;
export const CLEANER_FLOOR_FILL = 0.8;
export const CLEANER_COOLDOWN_MS = 240000;
export const CLEANER_STAY_MS = 3000;
export const CLEANER_BONUS = 100;
export const PIGEON_CHANCE = 0.03;
export const VOICE_PHRASE_CHANCE = 0.05;
export const VELO_CHANCE = 0.004;
export const PIGEON_STAY_MIN_MS = 10000;
export const PIGEON_STAY_MAX_MS = 20000;
export const FINAL_CANS = 1300;
export const SLOT_COUNTS = { floor: 24, bench: 6, shelf: 10 } as const;

export const RANKS = [
  { cans: 0, name: 'Запасной' },
  { cans: 25, name: 'Основа' },
  { cans: 100, name: 'Капитан пуза' },
  { cans: 250, name: 'Легенда раздевалки' },
  { cans: 500, name: "Квасной Балон д'Ор" },
];

export const ROOM_UPGRADES = [
  { name: 'Лампочка на проводе', price: 50, text: 'Да будет свет. Тусклый.' },
  { name: 'Гирлянда', price: 150, text: 'Новый год круглый год' },
  { name: 'Плакат «Ясен Квасен»', price: 300, text: 'Реклама работает' },
  { name: 'Магнитофон «Весна»', price: 600, text: 'Кассета одна, зато любимая' },
  { name: 'Колонка', price: 1000, text: 'Басы бьют по банкам' },
  { name: 'Холодильник с Квасеном', price: 1600, text: 'Стратегический запас' },
  { name: 'Ковёр с оленями', price: 2500, text: 'Как у бабушки, но в раздевалке' },
  { name: 'Пузатый телевизор', price: 3500, text: 'Повтор гола 2008 года. Опять.' },
  { name: 'Диван вместо скамейки', price: 5000, text: 'Раздевалка мечты' },
  { name: 'Неоновая вывеска «КВАС»', price: 7000, text: 'Светит ярче прожекторов' },
  { name: 'Золотой бочонок Квасена', price: 10000, text: 'Безлимитный кран прямо у шкафчиков' },
  { name: 'Чемпионский вымпел', price: 15000, text: 'Элитная база «Речичане United»' },
];

export const ROOM_UPGRADE_PRICES = ROOM_UPGRADES.map((item) => item.price);

const pct = (value: number) => `${Math.round(value * 100)}%`;

export const SKILLS: {
  id: TSkillId;
  name: string;
  max: number;
  base: number;
  desc: string;
  next: (level: number) => string;
}[] = [
  {
    id: 'throat',
    name: 'Широкая глотка',
    max: 5,
    base: 90,
    desc: 'Глотка шире, чем штрафная',
    next: (level) =>
      `Банка: ${CAN_VOLUME_BY_LEVEL[level]} → ${CAN_VOLUME_BY_LEVEL[level + 1]} глотков`,
  },
  {
    id: 'stomach',
    name: 'Лужёный желудок',
    max: 5,
    base: 140,
    desc: 'Желудок закалён на выездных',
    next: (level) => `Двойной глоток: шанс ${pct(DOUBLE_SIP_CHANCE_BY_LEVEL[level + 1])}`,
  },
  {
    id: 'burp',
    name: 'Отрыжечный маэстро',
    max: 5,
    base: 80,
    desc: 'Отрыжка как гимн',
    next: (level) =>
      `Шанс ${pct(BURP_CHANCE_BY_LEVEL[level + 1])}, бонус ×${level + 2}`,
  },
  {
    id: 'opener',
    name: 'Рефлекс открывашки',
    max: 1,
    base: 260,
    desc: 'Открывает банку глазами',
    next: () => 'Банка открывается без отдельного клика',
  },
  {
    id: 'coach',
    name: 'Тренер подливает',
    max: 5,
    base: 220,
    desc: 'Тренер сам несёт. Это любовь',
    next: (level) =>
      `Авто-глоток раз в ${(AUTO_SIP_INTERVAL_MS_BY_LEVEL[level + 1] ?? 0) / 1000} с`,
  },
  {
    id: 'armband',
    name: 'Капитанская повязка на пузе',
    max: 4,
    base: 360,
    desc: 'Капитан не тот, кто бегает',
    next: (level) => `+${pct(ARMBAND_BONUS_BY_LEVEL[level + 1])} к Квасикам`,
  },
  {
    id: 'tattoo',
    name: 'Наколки раздевалки',
    max: 3,
    base: 200,
    desc: 'Добавляет татуировки на тело',
    next: (level) => {
      const labels = ['Рукава на руках', 'Перстни и кисти', 'Наколки на ногах'];
      return `${labels[level]} (+${pct(TATTOO_BONUS_BY_LEVEL[level + 1])} к Квасикам)`;
    },
  },
  {
    id: 'crit',
    name: 'Залповый глоток',
    max: 5,
    base: 140,
    desc: 'Иногда залетает в три горла',
    next: (level) =>
      `Шанс ${pct(CRIT_SIP_CHANCE_BY_LEVEL[level + 1])} на крит ×${CRIT_SIP_MULT}`,
  },
  {
    id: 'recycle',
    name: 'Сдача алюминия',
    max: 5,
    base: 160,
    desc: 'Каждая пустая банка — в дело',
    next: (level) =>
      `+${pct(RECYCLE_BONUS_BY_LEVEL[level + 1])} к награде за допитую банку`,
  },
  {
    id: 'stealth',
    name: 'Стелс на скамейке',
    max: 4,
    base: 180,
    desc: 'Прячет банку быстрее свистка',
    next: (level) =>
      `Штраф тренера -${pct(STEALTH_PENALTY_REDUCTION[level + 1])}, бонус +${pct(STEALTH_SURVIVE_BONUS[level + 1])}`,
  },
  {
    id: 'hype',
    name: 'Братва в теме',
    max: 4,
    base: 220,
    desc: 'Парни заходят чаще и подкидывают на квас',
    next: (level) =>
      `+${HYPE_TEAMMATE_BONUS[level + 1]} кв. (×множитель) за визит, +${pct(HYPE_VOICE_BONUS_CHANCE[level + 1])} к шансу`,
  },
  {
    id: 'marathon',
    name: 'Второе дыхание',
    max: 5,
    base: 320,
    desc: 'Увеличивает базовую силу каждого глотка',
    next: (level) =>
      `База глотка: ${SIP_REWARD + MARATHON_BASE_BONUS[level]} → ${SIP_REWARD + MARATHON_BASE_BONUS[level + 1]} кв.`,
  },
];

export const skillPrice = (base: number, level: number) =>
  Math.floor(base * SKILL_PRICE_GROWTH ** level);
