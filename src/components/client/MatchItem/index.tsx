import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { SIZES } from '@/constants';
import s from './styles.module.scss';

type TMatchItemProps = {
  clubs: {
    logoSrc: string;
    name: string;
  }[];
  type: string;
  date: string;
  score: [number, number] | [];
};

export const MatchItem = ({ clubs, date, score, type }: TMatchItemProps) => {
  return (
    <div className={s.main}>
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
    </div>
  );
};
