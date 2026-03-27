'use client';

import { MatchItem } from '@/components/client/MatchItem';
import { getMatchDate } from '@/utils/getMatchDate';
import { TGetMatch } from '@/services/matches';
import s from './styles.module.scss';
import { useState } from 'react';

type MatchesListByMonthProps = {
  matches: TGetMatch[];
  clubId: string | number;
};

export const MatchesListByMonth = ({
  matches,
  clubId,
}: MatchesListByMonthProps) => {
  const [collapsedMonths, setCollapsedMonths] = useState<
    Record<string, boolean>
  >({});

  const toggleMonth = (month: string) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  const groupedMatches = matches.reduce(
    (acc, match) => {
      const date = new Date(match.date);
      const month = date
        .toLocaleDateString('ru-RU', {
          timeZone: 'Europe/Moscow',
          month: 'long',
          year: 'numeric',
        })
        .replace(' г.', '');

      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(match);
      return acc;
    },
    {} as Record<string, TGetMatch[]>
  );

  return (
    <div className={s.wrapper}>
      {Object.entries(groupedMatches).map(([month, monthMatches]) => {
        const isCollapsed = collapsedMonths[month] || false;

        return (
          <div key={month} className={s.monthGroup}>
            <div className={s.monthHeader} onClick={() => toggleMonth(month)}>
              <h2 className={s.monthTitle}>{month}</h2>
              <button
                className={`${s.toggleBtn} ${isCollapsed ? s.collapsed : ''}`}
                aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {!isCollapsed && (
              <ul className={s.list}>
                {monthMatches.map((match) => {
                  const matchDate = getMatchDate(match.date);

                  return (
                    <li key={match.id}>
                      <MatchItem
                        id={match.id}
                        myClubId={+clubId}
                        clubs={[match.homeClub, match.awayClub]}
                        type={match.type.name}
                        date={`${matchDate.day}, ${matchDate.time}`}
                        score={match.score}
                        players={match.players.sort(
                          (a, b) =>
                            (a.player.number ?? 0) - (b.player.number ?? 0)
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};
