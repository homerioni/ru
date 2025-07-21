import { MatchItem } from '@/components/client/MatchItem';
import s from './styles.module.scss';
import { getMatchDate } from '@/utils/getMatchDate';
import { TGetMatch } from '@/services/matches';

type MatchesProps = {
  matches: TGetMatch[];
};

export const Matches = ({ matches }: MatchesProps) => {
  const dateNow = Date.now();

  const oldMatches = matches.filter(
    (match) =>
      new Date(match.date).getTime() <= dateNow && match.score.length > 1
  );

  const newMatches = matches
    .filter((match) => new Date(match.date).getTime() > dateNow)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section className={`${s.main} container`}>
      {newMatches.length && (
        <>
          <h1 className={s.title}>Будущие матчи</h1>
          <ul className={s.list}>
            {newMatches.map((match) => {
              const matchDate = getMatchDate(match.date);

              return (
                <li key={match.id}>
                  <MatchItem
                    id={match.id}
                    clubs={[match.homeClub, match.awayClub]}
                    type={match.type.name}
                    date={`${matchDate.day}, ${matchDate.time}`}
                    score={match.score}
                    players={match.players.sort(
                      (a, b) => a.player.number - b.player.number
                    )}
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
      <h2 className={s.title}>Сыгранные матчи</h2>
      <ul className={s.list}>
        {oldMatches.map((match) => {
          const matchDate = new Date(match.date);
          const day = matchDate.toLocaleDateString('ru-RU', {
            month: 'long',
            day: 'numeric',
          });
          const time = matchDate.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <li key={match.id}>
              <MatchItem
                id={match.id}
                clubs={[match.homeClub, match.awayClub]}
                type={match.type.name}
                date={`${day}, ${time}`}
                score={match.score}
                players={match.players.sort(
                  (a, b) => a.player.number - b.player.number
                )}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
