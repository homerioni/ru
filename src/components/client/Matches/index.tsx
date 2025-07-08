'use client';

import logo from '@/assets/img/logo.svg';
import { MatchItem } from '@/components/client/MatchItem';
import s from './styles.module.scss';
import { getMatches } from '@/services';
import { useEffect, useState } from 'react';
import { Club, Match } from '@prisma/client';
import { getMatchDate } from '@/utils/getMatchDate';
import { TTeamStats } from '@/services/matches';

type TMatches = {
  oldMatches: (Match & { club: Club; players: TTeamStats[] })[];
  newMatches: (Match & { club: Club; players: TTeamStats[] })[];
};

const myClub = { name: 'Речичане United', logoSrc: logo };

export const Matches = () => {
  const [matches, setMatches] = useState<TMatches>();

  useEffect(() => {
    getMatches().then((res) => {
      const dateNow = Date.now();

      const oldMatches = res.matches.filter(
        (match) => new Date(match.date).getTime() <= dateNow
      );

      const newMatches = res.matches
        .filter((match) => new Date(match.date).getTime() > dateNow)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setMatches({
        oldMatches,
        newMatches,
      });
    });
  }, []);

  if (!matches) {
    return null;
  }

  return (
    <section className={`${s.main} container`}>
      {matches.newMatches.length && (
        <>
          <h1 className={s.title}>Будущие матчи</h1>
          <ul className={s.list}>
            {matches.newMatches.map((match) => {
              const matchDate = getMatchDate(match.date);

              return (
                <li key={match.id}>
                  <MatchItem
                    clubs={[myClub, match.club]}
                    type={match.type}
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
        {matches.oldMatches.map((match) => {
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
                clubs={[myClub, match.club]}
                type={match.type}
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
