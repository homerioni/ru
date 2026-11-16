# Техническое ТЗ: «Ясен Квасен: Раздевалка»

## 1. Стек и ограничения

- Проект: Next.js 15 (App Router), React 19, TypeScript, SCSS modules, Mantine 8, Prisma.
- **Новых npm-зависимостей не добавлять.** Игра на DOM и CSS: без canvas, без игровых движков, без библиотек анимации.
- **Без бэкенда.** Новых API, моделей Prisma и миграций нет. Прогресс хранится в `localStorage`.
- Стиль кода как в соседних компонентах: `'use client'`, импорт стилей `import s from './styles.module.scss'`, алиасы `@/` и `@ui/`.

## 2. Интеграция в сайт

### 2.1 Страница — `src/app/(layout)/(client)/game/page.tsx`

Делается по образцу [team/page.tsx](../../src/app/(layout)/(client)/team/page.tsx). Клиентский layout (`Header`, `Footer`) подключится автоматически.

```tsx
import { KvasGame } from '@/components/client/KvasGame';
import { getPlayers } from '@/services';
import { MY_CLUB_ID } from '@/constants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ясен Квасен: Раздевалка | Речичане United',
  description: 'Пиксельный кликер. Один клик — один глоток.',
};

export default async function GamePage() {
  const { players } = await getPlayers({ clubId: String(MY_CLUB_ID) });

  const roster = players
    .filter((p) => p.type === 'player')
    .map(({ id, name, number, photo }) => ({ id, name, number, photo }));

  return <KvasGame players={roster} />;
}
```

- `getPlayers` по умолчанию отдаёт до 100 записей, этого достаточно.
- В клиент передавать только `id`, `name`, `number`, `photo`, а не весь `TGetPlayers`.

### 2.2 Меню — [src/constants/routes.ts](../../src/constants/routes.ts)

Добавить в `ROUTES` последним пунктом. `Header` сам выводит все пункты `ROUTES`.

```ts
game: {
  name: 'Ясен Квасен',
  mobName: undefined,
  href: '/game',
},
```

## 3. Структура файлов

```
src/components/client/KvasGame/
  index.tsx              # корень: выбран игрок или нет, провайдер состояния
  styles.module.scss
  types.ts               # TKvasPlayer, TGameState, TAction и т.п.
  manifest.ts            # типизированный импорт public/game/kvas/manifest.json
  PlayerSelect/          # экран выбора игрока
  Scene/                 # сцена 320×180 и все её слои
    Room.tsx             # фон, тьма, слои улучшений
    Cans.tsx             # банки в слотах и гора
    Player.tsx           # тело + голова + банка в руке + номер
    Events.tsx           # тренер, тётя Валя, голубь
    Bubbles.tsx          # облачка с фразами
  HUD/                   # глотки, банки, Квасики, звание, звук, «Сменить игрока»
  ShopSkills/
  ShopRoom/
  FinalScreen/
  hooks/
    useGame.ts           # useReducer + сохранение + таймеры
    useSpriteFrame.ts    # одноразовые анимации кадров
  logic/
    balance.ts           # ВСЕ числа из GDD, раздел 11
    reducer.ts           # чистая функция (state, action) => state
    selectors.ts         # bellyStage, rank, canVolume, multipliers, цены
    events.ts            # решения о запуске событий
    phrases.ts           # все тексты
    random.ts            # rng-обёртка, чтобы редьюсер был тестируемым
```

## 4. Состояние

```ts
type TCanPose = 'stand' | 'lie' | 'crushed';
type TSlotZone = 'floor' | 'bench' | 'shelf';

type TGameState = {
  version: 1;
  playerId: number;
  sips: number;
  cans: number;
  kvasiki: number;
  can: { state: 'closed' | 'open'; left: number };
  skills: {
    throat: number;    // Широкая глотка 0..4
    stomach: number;   // Лужёный желудок 0..4
    burp: number;      // Отрыжечный маэстро 0..3
    opener: number;    // Рефлекс открывашки 0..1
    coach: number;     // Тренер подливает 0..4
    armband: number;   // Капитанская повязка 0..3
  };
  roomLevel: number;   // 0..9, сколько улучшений раздевалки куплено
  slots: Record<TSlotZone, (TCanPose | null)[]>; // длины 24 / 6 / 10
  pileCount: number;
  stats: { burps: number; megaBurps: number; coachCaught: number; cleanerVisits: number; playMs: number };
  finalSeen: boolean;
  soundOn: boolean;
};
```

- `bellyStage`, `rank`, `pileStage`, `canVolume` и множители **не хранятся**, а считаются селекторами из `cans` и `skills`.
- Состояние событий (тренер в двери, Валя, голубь) и облачка — **эфемерные**, хранятся в отдельном `useState` или `useReducer` и не сохраняются.

### Экшены

`SIP` (клик или автоглоток, `{ auto: boolean }`), `BUY_SKILL`, `BUY_ROOM`, `MEGA_BURP_SHUFFLE`, `CLEANER_CLEAN`, `COACH_PENALTY`, `COACH_BONUS`, `TICK_PLAYTIME`, `MARK_FINAL_SEEN`, `TOGGLE_SOUND`, `RESET`.

Редьюсер возвращает новое состояние, а информацию «что произошло» (открыл банку, допил, отрыжка, мега-отрыжка, новая стадия пуза, новое звание, финал) отдаёт через поле `lastEffects` в состоянии или через отдельную чистую функцию `resolveSip(state, rng) => { state, effects }`. По `effects` компонент запускает облачка, тряску и звуки. **Рандом только через переданный `rng`.**

## 5. Сохранение

- Ключ: `kvas-clicker:{playerId}`, значение `JSON.stringify(TGameState)`.
- Загрузка при выборе игрока. Если сохранения нет или `version` не совпадает, создаётся новое состояние.
- Запись с троттлингом раз в 2 секунды плюс на `visibilitychange` (hidden) и `beforeunload`.
- Список «Выпито: N банок» на экране выбора читается из `localStorage` при монтировании. Это нужно делать в `useEffect`, иначе будет ошибка гидрации.
- `RESET` удаляет ключ и создаёт новое состояние.

## 6. Рендер сцены и пиксели

- Контейнер сцены имеет размер 320×180 CSS-пикселей с `transform: scale(N)`. N считается в `ResizeObserver` так, чтобы картинка закрыла весь экран телефона и сидящий игрок (от макушки до ступней) занимал кадр. Масштаб может быть дробным: на узком высоком экране целого масштаба по ширине не хватает, чтобы комната заполнила высоту.
- На всех картинках `image-rendering: pixelated`, а позиции и размеры только в целых пикселях.
- Все слои — абсолютно спозиционированные `div` с `background-image`. Порядок `z-index`: фон, слои улучшений, гора, банки на полу и полках, скамейка или диван, игрок, банки на скамейке, тренер, Валя, голубь, тьма, облачка.
- Номер игрока на груди и на лбу у заглушки рисуется пиксельным шрифтом, `font-size` кратный размеру шрифта.

## 7. Анимации (дёргано, без плавности)

- **Запрещено**: `transition`, `ease`, `linear` для движений, твины, `requestAnimationFrame`-интерполяция. Всё меняется кадрами.
- Зацикленные анимации (лампочка, гирлянда, колонка, ТВ, голубь): CSS `@keyframes` по `background-position` с `animation-timing-function: steps(N)` и частотой 4–8 кадров в секунду.
- Одноразовые анимации (глоток, отрыжка, открытие банки): хук `useSpriteFrame(sequence, fps)` меняет номер кадра через `setTimeout`. Например, глоток — это `[1, 2, 0]` на теле и `[1, 1, 0]` на голове при 8 кадрах в секунду.
- Если клик пришёл посреди анимации, анимация **перезапускается с начала** (кадры дёргаются, так и задумано). Очереди кликов нет.
- Тряска сцены: смещение контейнера на целые пиксели по последовательности, например `[2,0] [-2,1] [0,0]`, через тот же хук. Без CSS-transition.
- Банка в слоте появляется в том же рендере, в котором `cans` увеличился. Никакой анимации появления.
- Облачко живёт 1.2 секунды и исчезает мгновенно. Одновременно показывается не больше двух облачков, новое вытесняет самое старое.
- Учитывать `prefers-reduced-motion`: отключать тряску, остальное оставлять.

## 8. Ввод

- Клик или тап по всей сцене вызывает `SIP`, но только если цель клика не голубь и не элемент UI.
- Обработчик `onPointerDown` (а не `onClick`), чтобы на телефоне не было задержки. На сцене `touch-action: manipulation` и `user-select: none`.
- Пробел и Enter, когда сцена в фокусе, тоже дают глоток (доступность). Автоповтор клавиши (`event.repeat`) игнорируется, чтобы не было читерского зажатия.

## 9. Таймеры

Все таймеры в `useGame`, очищаются при размонтировании и при смене игрока. На `document.hidden` ставятся на паузу.

- Автоглоток от навыка `coach`: `setInterval` с `AUTO_SIP_INTERVAL_MS_BY_LEVEL[level]`, диспатчит `SIP { auto: true }`. При автоглотке отрыжки нет, и тренер за него не штрафует.
- Тик событий каждые `EVENT_TICK_MS`: решает, запускать ли тренера или Валю (логика в `logic/events.ts`, чистые функции с `rng`).
- Голубь проверяется в эффекте после допитой банки.
- `TICK_PLAYTIME` раз в 5 секунд, нужен для статистики финала.

## 10. Звук

- `HTMLAudioElement`, созданные один раз через `useRef`. Для частых звуков (глоток) держать пул из 3 элементов.
- По умолчанию звук выключен (`soundOn: false`). Первое включение происходит по клику пользователя, поэтому автоплей браузер не блокирует.

## 11. UI вокруг сцены

- Игра только для телефона и занимает весь экран (`100dvh`), поверх шапки сайта. Сцена масштабируется так, чтобы закрыть экран целиком, кадр держится на игроке. Счёт и «Прокачка» лежат поверх комнаты, как кнопки по краям. Отдельной десктопной раскладки нет.
- Кнопки покупки неактивны, если Квасиков не хватает. На кнопке показывается цена и следующий эффект («10 → 8 глотков»).
- Шрифт UI — тот же пиксельный, что и в сцене. Цвета берутся из CSS-переменных `globals.css`, чтобы тёмная тема сайта не ломалась.

## 12. Ассеты в коде

- Данные из `public/game/kvas/manifest.json` дублируются в `KvasGame/manifest.ts` как типизированная константа (тип в `types.ts`), чтобы не тащить импорт из `public/` и не грузить JSON отдельным запросом. JSON в `public/` остаётся источником для пайплайна ассетов: при его изменении `manifest.ts` обновляется вручную.
- Путь к голове: `manifest.players.includes(id) ? /game/kvas/players/${id}/head.png : /game/kvas/players/_default/head.png`.
- Картинки предзагружаются при выборе игрока (`new Image()`), пока не загрузились — показывается «Разминка...».
- Обычный `<img>` и `background-image` (не `next/image`), потому что нужен pixel-perfect рендер без оптимизации.

## 13. Проверка

- `logic/` — чистые функции. Тестового раннера в проекте нет, новый не добавлять. Достаточно временного прогона через `npx ts-node` (ts-node уже есть в devDependencies) со скриптом-симуляцией: бот кликает 3 раза в секунду и покупает самое дешёвое доступное. Скрипт должен вывести время до `FINAL_CANS`. Цель — 25–40 минут (см. GDD, раздел 11). Скрипт не коммитить.
- Ручная проверка: выбор игрока, все 9 улучшений раздевалки, все навыки на максимуме, каждое событие, финал, «Продолжить сезон», «Начать заново», перезагрузка страницы сохраняет прогресс, игрок без головы показывается с заглушкой.
- `npm run lint` и `npm run build` без ошибок.
