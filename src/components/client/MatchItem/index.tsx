'use client';

import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { SIZES } from '@/constants';
import { TTeamStats } from '@/services/matches';
import s from './styles.module.scss';
import Link from 'next/link';

type TMatchItemProps = {
  id: number;
  clubs: {
    logoSrc: string;
    name: string;
  }[];
  type: string;
  date: string;
  score: number[];
  players?: TTeamStats[];
};

export const MatchItem = ({
  id,
  clubs,
  date,
  score,
  type,
}: TMatchItemProps) => {
  return (
    <Link href={`/match/${id}`} className={s.main}>
      <ClubLogo
        logoSrc={clubs[0].logoSrc}
        name={clubs[0].name}
        namePosition={NAME_POSITION.BOTTOM}
        size={SIZES.s}
      />
      <div className={s.infoBox}>
        <p className={s.infoTitle}>{type}</p>
        <p className={s.score}>
          {score.length ? `${score[0]} - ${score[1]}` : 'VS'}
        </p>
        <p className={s.date}>{date}</p>
      </div>
      <ClubLogo
        logoSrc={clubs[1].logoSrc}
        name={clubs[1].name}
        namePosition={NAME_POSITION.BOTTOM}
        size={SIZES.s}
      />
      <div className={s.showBtn}>
        <span>Подробнее о матче</span>
        <span className={s.btnArrow}></span>
      </div>
    </Link>
  );
};
