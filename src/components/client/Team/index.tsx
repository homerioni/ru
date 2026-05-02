'use client';

import { MatchType } from '@prisma/client';
import { TeamCard } from '@/components/client/TeamCard';
import { TGetPlayers } from '@/types';
import { Tabs } from '@/components/client/Tabs';
import { useState } from 'react';
import s from './styles.module.scss';
import { Select } from '@ui/Select';
import { TGetTransfer } from '@/services/transfers';

type TeamProps = {
  players: TGetPlayers[];
  matchTypes: MatchType[];
  transfers: TGetTransfer[];
  clubId: number;
};

const tabList = [
  { id: 0, name: 'Команда', type: 'player' },
  { id: 1, name: 'Представители', type: 'team' },
  { id: 2, name: 'Бывшие игроки', type: 'old_player' },
  { id: 3, name: 'Трансферы' },
];

const years = [
  { value: '', label: 'Все года' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
];

export const Team = ({ players, matchTypes, transfers, clubId }: TeamProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeType, setActiveType] = useState('');
  const [activeYear, setActiveYear] = useState(years[0].value);

  const options = [
    { value: '', label: 'Все матчи' },
    ...matchTypes.map((type) => ({
      value: type.id.toString(),
      label: `${type.name} ${type.year ?? ''}`,
    })),
  ];

  const oldPlayers = Object.values(
    transfers
      .filter((transfer) => transfer.player.club?.id !== clubId)
      .reduce<{ [p: number]: TGetTransfer['player'] }>((acc, item) => {
        acc[item.player.id] = item.player;

        return acc;
      }, {})
  );

  return (
    <section className={`${s.main} container`}>
      <Tabs
        notContainer
        className={s.tabs}
        items={tabList}
        activeTab={activeTab}
        setter={setActiveTab}
      />
      {activeTab !== 3 && (
        <div className={s.selects}>
          <Select
            className={s.select}
            options={options}
            value={activeType}
            onChange={(value) => setActiveType(value)}
          />
          <Select
            className={s.select}
            options={years}
            value={activeYear}
            onChange={(value) => setActiveYear(value)}
          />
        </div>
      )}
      <div className={s.list}>
        {activeTab < 2 &&
          players
            .filter(
              (player) =>
                player.isShow && player.type === tabList[activeTab].type
            )
            .map((player) => ({
              ...player,
              playedIn: player.playedIn.filter(
                (item) =>
                  (!activeType || item.match.type.id === +activeType) &&
                  (!activeYear ||
                    new Date(item.match.date).getFullYear() === +activeYear)
              ),
            }))
            .sort((a, b) => {
              return b.playedIn.length - a.playedIn.length;
            })
            .map((player) => {
              const matches = player.playedIn.length;
              const [goals, assists] = player.playedIn.reduce(
                (acc, item) => [acc[0] + item.goals, acc[1] + item.assists],
                [0, 0]
              );

              return (
                <TeamCard
                  key={player.id}
                  id={player.id}
                  number={player.number}
                  photo={player.photo}
                  name={player.name}
                  position={player.position}
                  matches={matches}
                  goals={goals}
                  assists={assists}
                  isTeam={player.type === 'team'}
                />
              );
            })}

        {activeTab === 2 &&
          oldPlayers
            .map((player) => ({
              ...player,
              playedIn: player.playedIn.filter(
                (item) =>
                  item.clubId === clubId &&
                  (!activeType || item.match.type.id === +activeType) &&
                  (!activeYear ||
                    new Date(item.match.date).getFullYear() === +activeYear)
              ),
            }))
            .sort((a, b) => {
              return b.playedIn.length - a.playedIn.length;
            })
            .map((player) => {
              const matches = player.playedIn.length;
              const [goals, assists] = player.playedIn.reduce(
                (acc, item) => [acc[0] + item.goals, acc[1] + item.assists],
                [0, 0]
              );

              return (
                <TeamCard
                  key={player.id}
                  id={player.id}
                  number={player.number}
                  photo={player.photo}
                  name={player.name}
                  position={player.position}
                  matches={matches}
                  goals={goals}
                  assists={assists}
                  isTeam={player.type === 'team'}
                  club={activeTab === 2 ? player.club : undefined}
                />
              );
            })}

        {activeTab === 3 &&
          transfers
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((transfer) => (
              <TeamCard
                key={transfer.id}
                id={transfer.player.id}
                name={transfer.player.name}
                position={transfer.player.position}
                number={transfer.player.number}
                photo={transfer.player.photo}
                transfer={{
                  from: transfer.fromClub,
                  to: transfer.toClub,
                  date: transfer.date,
                }}
              />
            ))}
      </div>
    </section>
  );
};
