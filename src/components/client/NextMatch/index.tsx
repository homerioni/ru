'use client';

import logo from '@/assets/img/logo.svg';
import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { NextMatchTimer } from '@/components/client/NextMatch/NextMatchTimer';
import { useEffect, useState } from 'react';
import { getMatches } from '@/services/matches';
import { Club, Match } from '@prisma/client';
import { getMatchDate } from '@/utils/getMatchDate';
import s from './styles.module.scss';

export const NextMatch = () => {
  const [match, setMatch] = useState<Match & { club: Club }>();

  useEffect(() => {
    getMatches().then((res) => {
      const dateNow = Date.now();

      const index = res.matches.findIndex(
        (item) => new Date(item.date).getTime() - dateNow < 0
      );

      if (index > 0) {
        setMatch(res.matches[index - 1]);
      }
    });
  }, []);

  if (!match) {
    return null;
  }

  const matchDate = getMatchDate(match.date);

  return (
    <section className={`${s.main} container`}>
      <ClubLogo logoSrc={logo} name={'Речичане United'} />
      <div className={s.infoBox}>
        <p className={s.infoTitle}>Следующий матч</p>
        <NextMatchTimer matchDate={matchDate.timestamp} />
        <p className={s.date}>{matchDate.day}</p>
        <p className={s.time}>{matchDate.time}</p>
      </div>
      <ClubLogo
        logoSrc={match.club.logoSrc}
        name={match.club.name}
        namePosition={NAME_POSITION.LEFT}
      />
    </section>
  );
};
