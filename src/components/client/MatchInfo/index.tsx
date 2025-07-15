import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { TGetMatch } from '@/services/matches';
import { getMatchDate } from '@/utils/getMatchDate';
import { getEndingByAmount } from '@/utils/getEndingByAmount';
import s from './styles.module.scss';

type MatchInfoProps = {
  data: TGetMatch;
};

export const MatchInfo = ({ data }: MatchInfoProps) => {
  const matchDate = getMatchDate(data.date);

  return (
    <section className={`${s.main} container`}>
      <div className={s.match}>
        <ClubLogo logoSrc={data.homeClub.logoSrc} name={data.homeClub.name} />
        <div className={s.infoWrapper}>
          <p className={s.infoTitle}>
            {data.type.name}
            {data.round ? ` ${data.round} тур` : ''}
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
        />
      </div>
      <div className={s.team}>
        {data.players.map((item) => (
          <div key={item.id} className={s.teamItem}>
            <span className={s.number}>{item.player.number}</span>
            <span className={s.name}>{item.player.name}</span>
            <span className={s.stats}>
              {item.goals > 0 && (
                <span>
                  {item.goals}
                  {getEndingByAmount(item.goals, [' гол', ' гола', ' голов'])}
                </span>
              )}
              {item.assists > 0 && (
                <span>
                  {item.assists}
                  {getEndingByAmount(item.assists, [' пас', ' паса', ' пасов'])}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
