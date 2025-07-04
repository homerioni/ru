import { ClubLogo, NAME_POSITION } from '~components/ui/ClubLogo';
import { SIZES } from '~constants/sizes';
import s from './styles.module.scss';

type TMatchItemProps = {
  clubs: {
    logoSrc: string;
    name: string;
  }[];
  type: string;
  score: [number, number];
  date: string;
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
          {score[0]} - {score[1]}
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
