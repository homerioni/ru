import Image from 'next/image';
import { NextMatchTimer } from '@/components/client/NextMatch/NextMatchTimer';
import { TGetMatch } from '@/services/matches';
import { getMatchDate } from '@/utils/getMatchDate';
import dima1 from '@/assets/img/dima1.webp';
import dima2 from '@/assets/img/dima2.webp';
import shifu1 from '@/assets/img/shifu1.webp';
import shifu2 from '@/assets/img/shifu2.webp';
import nad from '@/assets/img/nad-player.webp';
import s from './styles.module.scss';

type NextMatchProps = {
  match: Omit<TGetMatch, 'players'>;
};

export const NewNextMatch = ({ match }: NextMatchProps) => {
  const matchDate = getMatchDate(match.date);

  return (
    <section className={`${s.main} container`}>
      <div className={s.animate}>
        <Image src={dima1} alt={''} />
        <Image src={dima2} alt={''} />
        <Image src={shifu1} alt={''} />
        <Image src={shifu2} alt={''} />
        <Image src={nad} alt={''} />
      </div>
      {/*<div className={s.infoBox}>*/}
      {/*  <p className={s.infoTitle}>Следующий матч</p>*/}
      {/*  <NextMatchTimer matchDate={matchDate.timestamp} />*/}
      {/*  <p className={s.date}>{matchDate.day}</p>*/}
      {/*  <p className={s.time}>{matchDate.time}</p>*/}
      {/*</div>*/}
    </section>
  );
};
