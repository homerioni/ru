import Image from 'next/image';
import { NextMatchTimer } from '@/components/client/NextMatch/NextMatchTimer';
import { TGetMatch } from '@/services/matches';
import { getMatchDate } from '@/utils/getMatchDate';
import img1 from '@/assets/img/ru-ved.webp';
import img2 from '@/assets/img/ru-ved2.webp';
import s from './styles.module.scss';

type NextMatchProps = {
  match: Omit<TGetMatch, 'players'>;
};

export const NewNextMatch = ({ match }: NextMatchProps) => {
  const matchDate = getMatchDate(match.date);

  return (
    <section className={`${s.main} container`}>
      <div className={s.animate}>
        <Image src={img1} alt={''} />
        <Image src={img2} alt={''} />
      </div>
      <div className={s.infoBox}>
        <p className={s.infoTitle}>Следующий матч</p>
        <NextMatchTimer matchDate={matchDate.timestamp} />
        <p className={s.date}>{matchDate.day}</p>
        <p className={s.time}>{matchDate.time}</p>
      </div>
    </section>
  );
};
