import Link from 'next/link';
import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { SIZES } from '@/constants';
import { TTeamStats } from '@/services/matches';
import s from './styles.module.scss';

type TMatchItemProps = {
  id: number;
  myClubId?: number;
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

export const MatchItem = ({
  id,
  myClubId,
  clubs,
  date,
  score,
  type,
}: TMatchItemProps) => {
  const getResultContent = () => {
    let result = score[0] - score[1];

    if (clubs[1].id !== myClubId && clubs[0].id !== myClubId) {
      return;
    }

    if (result === 0) {
      return {
        text: 'Ничья',
      };
    }

    if (clubs[0].id !== myClubId) {
      result = -1 * result;
    }

    return result > 0
      ? { text: 'Победа', className: s.win }
      : { text: 'Поражение', className: s.lose };
  };

  const result = getResultContent();

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
          <span>{score.length ? `${score[0]} - ${score[1]}` : 'VS'}</span>
          {myClubId && !!score.length && result && (
            <span className={`${s.result} ${result.className}`}>
              {result.text}
            </span>
          )}
        </p>
        <p className={s.date}>{date}</p>
      </div>
      <ClubLogo
        logoSrc={clubs[1].logoSrc}
        name={clubs[1].name}
        namePosition={NAME_POSITION.BOTTOM}
        size={SIZES.s}
      />
    </Link>
  );
};
