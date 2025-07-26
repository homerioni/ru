'use client';

import Image from 'next/image';
import { MatchItem } from '@/components/client/MatchItem';
import { getMatchDate } from '@/utils/getMatchDate';
import s from './styles.module.scss';
import { ClubStats, TMatchNotType } from '@/app/(client)/tables/page';

type TGamesTableProps = {
  matches?: TMatchNotType[][];
  table?: ClubStats[];
  title: string;
  name: string;
  isLeague: boolean;
};

export const GamesTable = ({
  matches,
  table,
  title,
  name,
  isLeague,
}: TGamesTableProps) => {
  return (
    <section className={`${s.main} container`}>
      <h1 className={s.title}>{title}</h1>
      {isLeague && (
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
      )}
      <div className={s.games}>
        {matches?.map((round, i) => (
          <div
            key={Math.random()}
            className={s.round}
            style={{ order: i === 0 ? '1' : '' }}
          >
            {i !== 0 && <h3 className={s.roundTitle}>Тур {i}</h3>}
            {round.map((match) => {
              const matchDate = getMatchDate(match.date);

              return (
                <MatchItem
                  key={match.id}
                  id={match.id}
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
