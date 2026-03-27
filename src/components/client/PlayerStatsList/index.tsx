'use client';

import { Select } from '@ui/Select';
import { PlayerStats } from '@/components/client/PlayerStats';
import { useMemo, useState } from 'react';
import { TGetPlayer } from '@/types';
import s from './styles.module.scss';

type PlayerStatsListProps = {
  playedIn: TGetPlayer['playedIn'];
};

export const PlayerStatsList = ({ playedIn }: PlayerStatsListProps) => {
  const [activeSeason, setActiveSeason] = useState('2025');

  const { tables, years } = useMemo(() => {
    const data = playedIn.reduce<{
      tables: {
        [key in number]: {
          id: number;
          name: string;
          goals: number;
          assists: number;
          matches: number;
        }[];
      };
      years: string[];
    }>(
      (acc, item) => {
        const year = new Date(item.match.date).getFullYear();

        if (!acc.tables[year]) {
          acc.tables[year] = [];
        }

        const typeIndex = acc.tables[year].findIndex(
          (table) => table.id === item.match.type.id
        );

        if (typeIndex === -1) {
          acc.tables[year] = [
            ...acc.tables[year],
            {
              id: item.match.type.id,
              name: item.match.type.name,
              goals: item.goals,
              assists: item.assists,
              matches: 1,
            },
          ];
        } else {
          acc.tables[year][typeIndex] = {
            ...acc.tables[year][typeIndex],
            goals: acc.tables[year][typeIndex].goals + item.goals,
            assists: acc.tables[year][typeIndex].assists + item.assists,
            matches: acc.tables[year][typeIndex].matches + 1,
          };
        }

        if (!acc.years.includes(String(year))) {
          acc.years = [...acc.years, String(year)];
        }

        return acc;
      },
      {
        tables: {},
        years: [],
      }
    );

    setActiveSeason(data.years[0]);

    return data;
  }, [playedIn]);

  return (
    <div className={s.main}>
      {years.length > 0 && (
        <div className={s.select}>
          <p>Сезон</p>
          <Select
            options={years.map((year) => ({ label: year, value: year }))}
            onChange={setActiveSeason}
            value={activeSeason}
          />
        </div>
      )}
      {tables[+activeSeason]?.map((table) => (
        <PlayerStats
          key={table.name}
          matches={table.matches}
          goals={table.goals}
          assists={table.assists}
          title={table.name}
        />
      ))}
    </div>
  );
};
