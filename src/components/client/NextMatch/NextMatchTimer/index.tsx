'use client';

import { useEffect, useState } from 'react';
import { getTimeLeft } from '@/constants';
import s from '../styles.module.scss';
import { getMoscowTimestamp } from '@/utils/getMoscowTimestamp';

type TNextMatchTimerProps = {
  matchDate: number;
};

export const NextMatchTimer = ({ matchDate }: TNextMatchTimerProps) => {
  const [timer, setTimer] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>(getTimeLeft(matchDate - getMoscowTimestamp()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimer(getTimeLeft(matchDate - getMoscowTimestamp()));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [matchDate]);

  return (
    <p className={s.timer}>
      {timer.hours}ч : {timer.minutes}м : {timer.seconds}с
    </p>
  );
};
