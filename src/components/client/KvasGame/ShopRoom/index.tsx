'use client';

import { ROOM_UPGRADES, ROOM_UPGRADE_BONUS } from '../logic/balance';
import { TGameState } from '../types';
import s from '../styles.module.scss';

type ShopRoomProps = {
  state: TGameState;
  onBuy: () => void;
};

export const ShopRoom = ({ state, onBuy }: ShopRoomProps) => {
  const next = ROOM_UPGRADES[state.roomLevel];
  const bonusPct = Math.round(Math.max(0, state.roomLevel - 1) * ROOM_UPGRADE_BONUS * 100);
  const affordable = !!next && state.kvasiki >= next.price;

  return (
    <div className={s.roomShop}>
      <div className={s.roomHeader}>
        <span>
          Уровень раздевалки: {state.roomLevel}/{ROOM_UPGRADES.length}
        </span>
        <span className={s.shopBonus}>+{bonusPct}% к Квасикам</span>
      </div>

      {next ? (
        <div className={s.roomNextCard}>
          <p className={s.shopBonus}>Следующее улучшение (#{state.roomLevel + 1})</p>
          <p className={s.shopName}>{next.name}</p>
          <p className={s.shopDesc}>
            {next.text} (+{Math.round(ROOM_UPGRADE_BONUS * 100)}% к доходу)
          </p>
          <button
            type="button"
            className={`${s.buyFull} ${affordable ? s.buyReady : ''}`}
            disabled={!affordable}
            onClick={onBuy}
          >
            Улучшить · {next.price.toLocaleString('ru-RU')} кв.
          </button>
        </div>
      ) : (
        <div className={s.roomNextCard}>
          <p className={s.shopName}>Раздевалка мечты собрана!</p>
          <p className={s.shopDesc}>Все {ROOM_UPGRADES.length} улучшений установлены.</p>
        </div>
      )}

      <ul className={s.roomSteps}>
        {ROOM_UPGRADES.map((item, idx) => {
          const done = idx < state.roomLevel;
          const isCurrent = idx === state.roomLevel;
          return (
            <li
              key={item.name}
              className={`${s.roomStep} ${done ? s.roomDone : ''} ${isCurrent ? s.roomCurr : ''}`}
            >
              <span className={s.stepMark}>{done ? '✓' : idx + 1}</span>
              <span className={s.stepName}>{item.name}</span>
              <span className={s.stepPrice}>{done ? 'Есть' : `${item.price} кв.`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
