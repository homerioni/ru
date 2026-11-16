'use client';

import { TGameState } from '../types';
import s from '../styles.module.scss';

type FinalScreenProps = {
  state: TGameState;
  onContinue: () => void;
  onReset: () => void;
};

const formatPlay = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours} ч ${minutes % 60} мин`;
  return `${minutes} мин ${total % 60} с`;
};

export const FinalScreen = ({ state, onContinue, onReset }: FinalScreenProps) => (
  <div className={s.final}>
    <div className={s.finalCard}>
      <div
        className={s.trophyIcon}
        style={{ backgroundPosition: `${-11 * 32}px 0` }}
        aria-hidden
      />
      <p className={s.finalTitle}>ИГРОК БОЛЬШЕ НЕ ВЛАЗИТ В ФОРМУ!</p>
      <p className={s.finalSub}>СЕЗОН ОКОНЧЕН</p>
      <ul className={s.finalStats}>
        <li>Выпито банок: {state.cans}</li>
        <li>Глотков: {state.sips}</li>
        <li>Отрыжек: {state.stats.burps + state.stats.megaBurps}</li>
        <li>Тренер спалил: {state.stats.coachCaught}</li>
        <li>Тётя Валя приходила: {state.stats.cleanerVisits}</li>
        <li>Время в раздевалке: {formatPlay(state.stats.playMs)}</li>
      </ul>
      <div className={s.finalActions}>
        <button type="button" className={`${s.buyFull} ${s.buyReady}`} onClick={onContinue}>
          Продолжить сезон
        </button>
        <button
          type="button"
          className={s.buyFull}
          onClick={() => {
            if (window.confirm('Точно? Пузо пропадёт.')) onReset();
          }}
        >
          Начать заново
        </button>
      </div>
    </div>
  </div>
);
