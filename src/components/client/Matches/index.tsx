import { MatchItem } from '@/components/client/MatchItem';
import s from './styles.module.scss';
import { getMatches } from '@/services';
import { getMatchDate } from '@/utils/getMatchDate';
import { MY_CLUB_ID } from '@/constants';

export const Matches = async () => {
  const matches = await getMatches({ clubId: MY_CLUB_ID }).then((res) => {
    const dateNow = Date.now();

    const oldMatches = res.matches.filter(
      (match) =>
        new Date(match.date).getTime() <= dateNow && match.score.length > 1
    );

    const newMatches = res.matches
      .filter((match) => new Date(match.date).getTime() > dateNow)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      oldMatches,
      newMatches,
    };
  });

  return (
    <section className={`${s.main} container`}>
      {matches?.newMatches.length && (
        <>
          <h1 className={s.title}>Будущие матчи</h1>
          <ul className={s.list}>
            {matches.newMatches.map((match) => {
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
        {matches?.oldMatches.map((match) => {
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
