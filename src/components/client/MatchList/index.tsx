import { MatchItem } from '@/components/client/MatchItem';
import { getMatchDate } from '@/utils/getMatchDate';
import { TGetVoteMatch } from '@/services';
import s from './styles.module.scss';

type MatchListProps = {
  matches: TGetVoteMatch[];
};

export const MatchList = ({ matches }: MatchListProps) => {
  return (
    <section>
      <h2 className={s.title}>Активные голосования</h2>
      <div className={s.list}>
        {matches.map((match) => {
          const matchDate = getMatchDate(match.date);

          return (
            <MatchItem
              key={match.id}
              id={match.id}
              clubs={[match.homeClub, match.awayClub]}
              type={match.type.name}
              date={`${matchDate.day}, ${matchDate.time}`}
              score={match.score}
            />
          );
        })}
      </div>
    </section>
  );
};
