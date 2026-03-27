'use client';

import { ClubStats, TMatchNotType } from '@/app/(client)/tables/page';
import { useState } from 'react';
import { Tabs } from '@/components/client/Tabs';
import s from './styles.module.scss';
import { useSearchParams } from 'next/navigation';
import { MatchType } from '@prisma/client';
import { LeagueTable } from '@/components/client/LeagueTable';
import { MatchesListByMonth } from '@/components/client/MatchesListByMonth';
import { TGetMatch } from '@/services/matches';
import { PlayerStatsTable } from '@/components/client/PlayerStatsTable';
import { MY_CLUB_ID } from '@/constants';

type TGamesTableProps = {
  matches?: {
    played?: TMatchNotType[];
    future?: TMatchNotType[];
  };
  table?: ClubStats[];
  title: string;
  name: string;
  type: MatchType['type'];
};

const matchesTabs = [
  { id: 0, name: 'Сыгранные матчи' },
  { id: 1, name: 'Будущие матчи' },
  { id: 2, name: 'Статистика' },
];

export const GamesTable = ({
  matches,
  table,
  title,
  name,
  type,
}: TGamesTableProps) => {
  const searchParams = useSearchParams();
  const defaultId = searchParams.get('tabId') ?? 0;

  const [activeTab, setActiveTab] = useState(+defaultId);

  const goals = matches?.played?.reduce<
    Map<string, { clubImgSrc: string; name: string; qty: number }>
  >((acc, match) => {
    match.players.forEach((stats) => {
      if (!stats.goals) return;

      if (!acc.has(stats.player.name)) {
        acc.set(stats.player.name, {
          clubImgSrc: match[stats.club].logoSrc,
          name: stats.player.name,
          qty: stats.goals,
        });
      } else {
        const get = acc.get(stats.player.name)!;

        acc.set(stats.player.name, { ...get, qty: get.qty + stats.goals });
      }
    });

    return acc;
  }, new Map());

  const assists = matches?.played?.reduce<
    Map<string, { clubImgSrc: string; name: string; qty: number }>
  >((acc, match) => {
    match.players.forEach((stats) => {
      if (!stats.assists) return;

      if (!acc.has(stats.player.name)) {
        acc.set(stats.player.name, {
          clubImgSrc: match[stats.club].logoSrc,
          name: stats.player.name,
          qty: stats.assists,
        });
      } else {
        const get = acc.get(stats.player.name)!;

        acc.set(stats.player.name, { ...get, qty: get.qty + stats.assists });
      }
    });

    return acc;
  }, new Map());

  const content = [
    matches?.played && (
      <MatchesListByMonth
        key={'played'}
        clubId={MY_CLUB_ID}
        matches={
          matches.played
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((item) => ({
              ...item,
              type: { name },
            })) as TGetMatch[]
        }
      />
    ),
    matches?.future && (
      <MatchesListByMonth
        key={'future'}
        clubId={MY_CLUB_ID}
        matches={
          matches.future
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((item) => ({
              ...item,
              type: { name },
            })) as TGetMatch[]
        }
      />
    ),
    <PlayerStatsTable
      key={'stats'}
      goals={
        goals
          ? [...goals.values()].slice(0, 10).sort((a, b) => b.qty - a.qty)
          : []
      }
      assists={
        assists
          ? [...assists.values()].slice(0, 10).sort((a, b) => b.qty - a.qty)
          : []
      }
    />,
  ];

  return (
    <section className={`${s.main} container`}>
      <h1 className={s.title}>{title}</h1>
      {type === 'league' && table?.length && (
        <div className={s.table}>
          <LeagueTable data={table} myClubId={MY_CLUB_ID} />
        </div>
      )}
      <div className={s.tabs}>
        <Tabs
          items={matchesTabs.filter(
            (item) => item.id !== 1 || matches?.future?.length
          )}
          activeTab={activeTab}
          setter={(id) => setActiveTab(id)}
        />
      </div>
      <div className={s.games}>{content[activeTab]}</div>
    </section>
  );
};
