'use client';

import { ROOM_UPGRADES, ROOM_UPGRADE_BONUS } from '../logic/balance';
import { TGameState } from '../types';
import s from '../styles.module.scss';

type ShopRoomProps = {
  state: TGameState;
  onBuy: (id: number) => void;
};

export const ShopRoom = ({ state, onBuy }: ShopRoomProps) => {
  const bought = new Set(state.roomItems);
  const extraCount = state.roomItems.filter((id) => id !== 1).length;
  const bonusPct = Math.round(extraCount * ROOM_UPGRADE_BONUS * 100);
  const itemBonusPct = Math.round(ROOM_UPGRADE_BONUS * 100);

  return (
    <div className={s.roomShop}>
      <div className={s.roomHeader}>
        <span>
          Куплено вещей: {state.roomItems.length}/{ROOM_UPGRADES.length}
        </span>
        <span className={s.shopBonus}>+{bonusPct}% к Квасикам</span>
      </div>

      <p className={s.shopDesc}>
        Любую вещь можно купить сразу — каждая даёт +{itemBonusPct}% к доходу.
      </p>

      <ul className={s.shopList}>
        {ROOM_UPGRADES.map((item) => {
          const done = bought.has(item.id);
          const affordable = !done && state.kvasiki >= item.price;
          return (
            <li
              key={item.id}
              className={`${s.shopCard} ${done ? s.roomCardDone : ''}`}
            >
              <span className={s.stepMark}>{done ? '✓' : '•'}</span>
              <div className={s.shopText}>
                <div className={s.shopHeadRow}>
                  <p className={s.shopName}>{item.name}</p>
                  <span className={s.levelPill}>+{itemBonusPct}%</span>
                </div>
                <p className={s.shopDesc}>{item.text}</p>
              </div>
              {done ? (
                <span className={s.roomOwned}>Есть</span>
              ) : (
                <button
                  type="button"
                  className={`${s.buy} ${affordable ? s.buyReady : ''}`}
                  disabled={!affordable}
                  onClick={() => onBuy(item.id)}
                >
                  {item.price.toLocaleString('ru-RU')} кв.
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
