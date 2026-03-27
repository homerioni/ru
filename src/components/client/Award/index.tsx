import { Award as AwardType } from '@prisma/client';
import s from './styles.module.scss';
import Image from 'next/image';
import matchImg from '@/assets/img/award-match.webp';
import monthImg from '@/assets/img/award-month.webp';
import yearImg from '@/assets/img/award-year.webp';

type AwardProps = {
  data: AwardType;
};

const images = {
  match: matchImg,
  month: monthImg,
  year: yearImg,
};

const texts = {
  match: 'Игрок матча',
  month: 'Игрок месяца',
  year: 'Игрок года',
};

export const Award = ({ data }: AwardProps) => {
  const date = new Date(data.createdAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={s.award}>
      <Image
        className={s.awardImg}
        src={images[data.type]}
        alt={'Награда'}
        width={128}
        height={128}
      />
      <div className={s.awardInfo}>
        <p>{texts[data.type]}</p>
        <p>{data.matchType}</p>
        <p>Клуб: {data.clubName}</p>
        <p>Матч: {data.matchName}</p>
        <p>{date}</p>
      </div>
    </div>
  );
};
