'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import s from '../styles.module.scss';
import { getMoscowTimestamp } from '@/utils/getMoscowTimestamp';
import { getMatchLeft, getTimeLeft } from '@/utils/getTimeLeft';

type TNextMatchTimerProps = {
  matchDate: number;
};

const timerHandler = (
  date: number,
  setTimer: Dispatch<SetStateAction<string>>
) => {
  const time = getTimeLeft(date - getMoscowTimestamp());
  setTimer(`${time.hours}ч : ${time.minutes}м : ${time.seconds}с`);
};

export const NextMatchTimer = ({ matchDate }: TNextMatchTimerProps) => {
  const [timer, setTimer] = useState('');

  useEffect(() => {
    const dayLeft = getMatchLeft(new Date(matchDate));
    let t: NodeJS.Timeout;

    if (dayLeft === 'TIME') {
      timerHandler(matchDate, setTimer);

      t = setInterval(() => {
        timerHandler(matchDate, setTimer);
      }, 1000);
    } else {
      setTimer(dayLeft);
    }

    return () => {
      clearInterval(t);
    };
  }, [matchDate]);

  return <p className={s.timer}>{timer}</p>;
};
