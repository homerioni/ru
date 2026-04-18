import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { TGetMatch } from '@/services/matches';
import { getMatchDate } from '@/utils/getMatchDate';
import { MatchTeams } from './MatchTeams';
import s from './styles.module.scss';

type MatchInfoProps = {
  data: TGetMatch;
};

const getRoundTitle = (round: string | null) => {
  if (round === null || round.startsWith('group')) {
    return '';
  }

  switch (round) {
    case '1':
      return ' Финал';
    case '2':
      return ' Полуфинал';
    case '3':
      return ' 3-е место';
    default:
      return ` 1/${round} финала`;
  }
};

export const MatchInfo = ({ data }: MatchInfoProps) => {
  const matchDate = getMatchDate(data.date);

  return (
    <section className={`${s.main} container`}>
      <div className={s.match}>
        <ClubLogo
          logoSrc={data.homeClub.logoSrc}
          name={data.homeClub.name}
          background
        />
        <div className={s.infoWrapper}>
          <p className={s.infoTitle}>
            {data.type.name}
            {getRoundTitle(data.round)}
          </p>
          <p className={s.score}>
            {data.score.length ? `${data.score[0]} - ${data.score[1]}` : 'VS'}
          </p>
          <p className={s.date}>
            {matchDate.day}, {matchDate.time}
          </p>
        </div>
        <ClubLogo
          logoSrc={data.awayClub.logoSrc}
          name={data.awayClub.name}
          namePosition={NAME_POSITION.LEFT}
          background
        />
      </div>
      <MatchTeams data={data} />
    </section>
  );
};
