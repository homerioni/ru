'use client';

import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { MY_CLUB_ID, SIZES } from '@/constants';
import { TTeamStats } from '@/services/matches';
import Link from 'next/link';
import s from './styles.module.scss';

type TMatchItemProps = {
  id: number;
  clubs: {
    id: number;
    logoSrc: string;
    name: string;
  }[];
  type: string;
  date: string;
  score: number[];
  players?: TTeamStats[];
};

const MatchItemWrapper = ({
  id,
  isMyClub,
  children,
}: {
  id: number;
  isMyClub: boolean;
  children: React.ReactNode;
}) => {
  return isMyClub ? (
    <Link href={`/match/${id}`} className={s.main}>
      {children}
    </Link>
  ) : (
    <div className={s.main}>{children}</div>
  );
};

export const MatchItem = ({
  id,
  clubs,
  date,
  score,
  type,
}: TMatchItemProps) => {
  const isMyClub = clubs[0].id === MY_CLUB_ID || clubs[1].id === MY_CLUB_ID;

  return (
    <MatchItemWrapper id={id} isMyClub={isMyClub}>
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
      {isMyClub && (
        <div className={s.showBtn}>
          <span>Подробнее о матче</span>
          <span className={s.btnArrow}></span>
        </div>
      )}
    </MatchItemWrapper>
  );
};
