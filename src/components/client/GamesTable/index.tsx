'use client';

import Image from 'next/image';
import { getMatchType } from '@/services/matchTypes';
import { Club, Match } from '@prisma/client';
import { useEffect, useState } from 'react';
import { TGetMatch } from '@/services/matches';
import { MatchItem } from '@/components/client/MatchItem';
import { getMatchDate } from '@/utils/getMatchDate';
import s from './styles.module.scss';

type TGamesTableProps = {
  id: number;
  title: string;
  name: string;
};

type ClubStats = {
  club: Club;
  matches: Match[];
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  missed: number;
  goalDifference: number;
  points: number;
};

type TMatchNotType = Omit<TGetMatch, 'type'>;

export const GamesTable = ({ id, title, name }: TGamesTableProps) => {
  const [matches, setMatches] = useState<TMatchNotType[][]>();
  const [table, setTable] = useState<ClubStats[]>();

  useEffect(() => {
    getMatchType(id).then((res) => {
      setMatches(
        res.matches.reduce<TMatchNotType[][]>((acc, item) => {
          if (item.round) {
            if (acc[item.round]) {
              acc[item.round].push(item);
            } else {
              acc[item.round] = [item];
            }
          } else {
            if (acc[0]) {
              acc[0].push(item);
            } else {
              acc[0] = [item];
            }
          }

          return acc;
        }, [])
      );

      const clubMap = new Map<number, ClubStats>();

      for (const match of res.matches) {
        const { homeClub, awayClub, score } = match;

        if (!score || score.length !== 2) continue;

        const [homeGoals, awayGoals] = score;

        for (const [club, isHome] of [
          [homeClub, true],
          [awayClub, false],
        ] as const) {
          if (!clubMap.has(club.id)) {
            clubMap.set(club.id, {
              club,
              matches: [],
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goals: 0,
              missed: 0,
              goalDifference: 0,
              points: 0,
            });
          }

          const stats = clubMap.get(club.id)!;

          stats.matches.push(match);
          stats.played += 1;

          const isWin =
            (isHome && homeGoals > awayGoals) ||
            (!isHome && awayGoals > homeGoals);
          const isDraw = homeGoals === awayGoals;

          if (isWin) {
            stats.wins += 1;
            stats.points += 3;
          } else if (isDraw) {
            stats.draws += 1;
            stats.points += 1;
          } else {
            stats.losses += 1;
          }

          const goalsFor = isHome ? homeGoals : awayGoals;
          const goalsAgainst = isHome ? awayGoals : homeGoals;

          stats.goals += goalsFor;
          stats.missed += goalsAgainst;
          stats.goalDifference = stats.goals - stats.missed;
        }
      }

      const clubsWithStats = Array.from(clubMap.values());

      clubsWithStats.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalDifference - a.goalDifference;
      });

      setTable(clubsWithStats);
    });
  }, [id]);

  console.log(matches);

  return (
    <section className={`${s.main} container`}>
      <h1 className={s.title}>{title}</h1>
      <div className={s.tableWrapper}>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.header}>#</th>
              <th className={s.header}>Клуб</th>
              <th className={s.header}>Название</th>
              <th className={s.header}>И</th>
              <th className={s.header}>В</th>
              <th className={s.header}>Н</th>
              <th className={s.header}>П</th>
              <th className={s.header}>ЗМ</th>
              <th className={s.header}>ПМ</th>
              <th className={s.header}>РМ</th>
              <th className={s.header}>Очки</th>
            </tr>
          </thead>
          <tbody>
            {table?.map((item, i) => (
              <tr key={item.club.id}>
                <td>{i + 1}</td>
                <td className={s.logo}>
                  <Image
                    src={item.club.logoSrc}
                    alt={item.club.name}
                    width={200}
                    height={200}
                  />
                </td>
                <td className={s.name}>{item.club.name}</td>
                <td>{item.played}</td>
                <td>{item.wins}</td>
                <td>{item.draws}</td>
                <td>{item.losses}</td>
                <td>{item.goals}</td>
                <td>{item.missed}</td>
                <td>{item.goalDifference}</td>
                <td>{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.games}>
        {matches?.slice(1).map((round, i) => (
          <div key={i} className={s.round}>
            <h3 className={s.roundTitle}>Тур {i + 1}</h3>
            {round.map((match) => {
              const matchDate = getMatchDate(match.date);

              return (
                <MatchItem
                  key={match.id}
                  clubs={[match.homeClub, match.awayClub]}
                  type={name}
                  date={`${matchDate.day}, ${matchDate.time}`}
                  score={match.score}
                  players={match.players.sort(
                    (a, b) => a.player.number - b.player.number
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
};
