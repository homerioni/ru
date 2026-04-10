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
  const date = new Date(data.date).toLocaleString('ru-RU', {
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
        <p>
          <span>Награда:</span> {texts[data.type]}
        </p>
        <p>
          <span>Тип матча:</span> {data.matchType}
        </p>
        <p>
          <span>Клуб:</span> {data.clubName}
        </p>
        <p>
          <span>Матч:</span> {data.matchName}
        </p>
        <p>
          <span>Дата:</span> {date}
        </p>
      </div>
    </div>
  );
};
