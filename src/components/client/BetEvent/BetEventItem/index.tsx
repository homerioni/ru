'use client';

import Image from 'next/image';
import userImg from '@/assets/img/user.webp';
import loading from '@/assets/img/loading.svg';
import { Coins } from '@ui/Coins';
import { useState } from 'react';
import { BetInfo } from '@/services/bets';
import s from './styles.module.scss';
import {
  getCoef,
  getIsQtyInput,
  getIsWin,
  getMinValue,
} from '@/utils/getIsWin';
import { TGetMatch } from '@/services/matches';

type BetEventItemProps = {
  betId: number;
  name: string;
  ratio: number[];
  code: string;
  bets: BetInfo[];
  match: TGetMatch;
  isCompleted?: boolean;
  handleBetAction: (
    points: number,
    betId: number,
    qty?: number
  ) => Promise<boolean | undefined>;
  addAlertAction: (message: string) => void;
};

export const BetEventItem = ({
  betId,
  bets,
  ratio,
  name,
  isCompleted,
  code,
  match,
  handleBetAction,
  addAlertAction,
}: BetEventItemProps) => {
  const [points, setPoints] = useState('');
  const [qty, setQty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const betClick = () => {
    if (!isLoading) {
      const minValue = getMinValue(code);

      if (+qty < minValue) {
        addAlertAction(
          `Значение "${name}" не может быть меньше чем ${minValue}`
        );
      } else {
        setIsLoading(true);

        handleBetAction(+points, betId, qty ? +qty : undefined).then(
          (res) => res === false && setIsLoading(false)
        );
      }
    }
  };

  return (
    <li className={s.item}>
      <div className={s.header}>
        <h3 className={s.itemTitle}>{name}</h3>
        <span className={s.ratio}>
          {ratio?.length < 2 || qty ? `x${getCoef(ratio, +qty)}` : `до x10`}
        </span>
      </div>
      <ul className={s.usersList}>
        {bets.map((bet) => {
          const isWin = getIsWin(code, match, bet.value);

          return (
            <li key={bet.id} className={s.userWrapper}>
              <div className={s.userImage}>
                <Image
                  src={bet.user.image ?? userImg}
                  alt={'Аватар'}
                  width={256}
                  height={256}
                />
              </div>
              <div className={s.userInfo}>
                <p className={s.username}>{bet.user.name}</p>
                <p className={s.qty}>{bet.value && `${bet.value}:`}</p>
                <Coins
                  qty={
                    isCompleted && isWin
                      ? bet.points *
                        getCoef(ratio, JSON.parse(bet.value as string))
                      : bet.points
                  }
                  status={
                    isCompleted
                      ? isWin
                        ? 'increment'
                        : 'decrement'
                      : undefined
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
      {!isCompleted && (
        <div className={s.footer}>
          <button
            className={`${s.btn} ${s.modalBtn} ${isLoading ? s.loading : ''}`}
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            Сделать ставку
          </button>
          <div className={`${s.modalWrapper} ${isModalOpen ? s.open : ''}`}>
            <button
              className={s.closeWrapper}
              type="button"
              onClick={() => setIsModalOpen(false)}
            />
            <div className={s.betWrapper}>
              <div className={s.header}>
                <h3 className={s.itemTitle}>{name}</h3>
                <span className={s.ratio}>x{getCoef(ratio, +qty)}</span>
              </div>
              {getIsQtyInput(code) && (
                <label className={`${s.inputLabel} ${s.value}`}>
                  <input
                    type="number"
                    onChange={(e) => setQty(e.target.value)}
                    value={qty}
                    placeholder="Введите кол-во"
                  />
                </label>
              )}
              <label className={s.inputLabel}>
                <input
                  type="number"
                  onChange={(e) => setPoints(e.target.value)}
                  value={points}
                  placeholder="Размер вашей ставки"
                />
              </label>
              <button
                className={`${s.btn} ${isLoading ? s.loading : ''}`}
                type="button"
                onClick={betClick}
              >
                {isLoading ? (
                  <Image src={loading} alt={'Загрузка'} />
                ) : (
                  'Сделать ставку'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};
