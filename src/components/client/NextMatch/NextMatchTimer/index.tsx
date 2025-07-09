'use client';

import { useEffect, useState } from 'react';
import s from '../styles.module.scss';
import { getMoscowTimestamp } from '@/utils/getMoscowTimestamp';
import { getMatchLeft, getTimeLeft } from '@/utils/getTimeLeft';

type TNextMatchTimerProps = {
  matchDate: number;
};

export const NextMatchTimer = ({ matchDate }: TNextMatchTimerProps) => {
  const [timer, setTimer] = useState('');

  useEffect(() => {
    const dayLeft = getMatchLeft(new Date(matchDate));
    let t: NodeJS.Timeout;

    if (dayLeft === 'TIME') {
      t = setInterval(() => {
        const time = getTimeLeft(matchDate - getMoscowTimestamp());
        setTimer(`${time.hours}ч : ${time.minutes}м : ${time.seconds}с`);
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
