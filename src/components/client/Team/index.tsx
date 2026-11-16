'use client';

import { Club, MatchType } from '@prisma/client';
import { TeamCard } from '@/components/client/TeamCard';
import { TGetPlayers } from '@/types';
import { Tabs } from '@/components/client/Tabs';
import { useMemo, useState } from 'react';
import s from './styles.module.scss';
import { Select } from '@ui/Select';
import { TGetTransfer } from '@/services/transfers';

type TeamProps = {
  players: TGetPlayers[];
  matchTypes: MatchType[];
  transfers: TGetTransfer[];
  clubId: number;
};

type PlayedInItem = TGetPlayers['playedIn'][number];

type SortKey =
  | 'matches'
  | 'goals'
  | 'goalsPerGame'
  | 'assists'
  | 'assistsPerGame'
  | 'goalsAssists'
  | 'goalsAssistsPerGame';

type PlayerWithStats = {
  id: number;
  number: number | null;
  photo: string | null;
  name: string;
  position: string;
  type: TGetPlayers['type'];
  club?: Club | null;
  matches: number;
  goals: number;
  assists: number;
  goalsAssists: number;
  matchesPercent: number;
  goalsPerGame: number;
  assistsPerGame: number;
  goalsAssistsPerGame: number;
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

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'matches', label: 'По матчам' },
  { value: 'goals', label: 'По голам' },
  { value: 'goalsPerGame', label: 'По Г/И' },
  { value: 'assists', label: 'По асистам' },
  { value: 'assistsPerGame', label: 'По П/И' },
  { value: 'goalsAssists', label: 'По Г+П' },
  { value: 'goalsAssistsPerGame', label: 'По Г+П/И' },
];

const toPercent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const toPerGame = (value: number, matches: number) =>
  matches > 0 ? Number((value / matches).toFixed(2)) : 0;

const filterPlayedIn = (
  playedIn: PlayedInItem[],
  clubId: number,
  activeType: string,
  activeYear: string
) =>
  playedIn.filter(
    (item) =>
      item.clubId === clubId &&
      (!activeType || item.match.type.id === +activeType) &&
      (!activeYear ||
        new Date(item.match.date).getFullYear() === +activeYear)
  );

const getUniqueMatchesCount = (playedIn: PlayedInItem[]) => {
  const matchIds = new Set<number>();
  playedIn.forEach((item) => matchIds.add(item.matchId));
  return matchIds.size;
};

const buildPlayerStats = (
  player: {
    id: number;
    number: number | null;
    photo: string | null;
    name: string;
    position: string;
    type: TGetPlayers['type'];
    club?: Club | null;
    playedIn: PlayedInItem[];
  },
  totalMatches: number
): PlayerWithStats => {
  const matches = player.playedIn.length;
  const [goals, assists] = player.playedIn.reduce(
    (acc, item) => [acc[0] + item.goals, acc[1] + item.assists],
    [0, 0]
  );
  const goalsAssists = goals + assists;

  return {
    id: player.id,
    number: player.number,
    photo: player.photo,
    name: player.name,
    position: player.position,
    type: player.type,
    club: player.club,
    matches,
    goals,
    assists,
    goalsAssists,
    matchesPercent: toPercent(matches, totalMatches),
    goalsPerGame: toPerGame(goals, matches),
    assistsPerGame: toPerGame(assists, matches),
    goalsAssistsPerGame: toPerGame(goalsAssists, matches),
  };
};

const sortPlayers = (players: PlayerWithStats[], sortBy: SortKey) =>
  [...players].sort((a, b) => b[sortBy] - a[sortBy]);

export const Team = ({ players, matchTypes, transfers, clubId }: TeamProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeType, setActiveType] = useState('');
  const [activeYear, setActiveYear] = useState(years[0].value);
  const [sortBy, setSortBy] = useState<SortKey>('matches');

  const options = [
    { value: '', label: 'Все матчи' },
    ...matchTypes.map((type) => ({
      value: type.id.toString(),
      label: `${type.name} ${type.year ?? ''}`,
    })),
  ];

  const oldPlayers = useMemo(
    () =>
      Object.values(
        transfers
          .filter((transfer) => transfer.player.club?.id !== clubId)
          .reduce<{ [p: number]: TGetTransfer['player'] }>((acc, item) => {
            acc[item.player.id] = item.player;

            return acc;
          }, {})
      ),
    [transfers, clubId]
  );

  const currentTeamPlayedIn = useMemo(
    () =>
      players
        .filter((player) => player.type === 'player')
        .flatMap((player) =>
          filterPlayedIn(player.playedIn, clubId, activeType, activeYear)
        ),
    [players, activeType, activeYear, clubId]
  );

  const totalCurrentMatches = useMemo(
    () => getUniqueMatchesCount(currentTeamPlayedIn),
    [currentTeamPlayedIn]
  );

  const filteredCurrentPlayers = useMemo(() => {
    const list = players
      .filter(
        (player) => player.isShow && player.type === tabList[activeTab].type
      )
      .map((player) =>
        buildPlayerStats(
          {
            ...player,
            playedIn: filterPlayedIn(
              player.playedIn,
              clubId,
              activeType,
              activeYear
            ),
          },
          totalCurrentMatches
        )
      );

    return sortPlayers(list, sortBy);
  }, [
    players,
    activeTab,
    activeType,
    activeYear,
    clubId,
    totalCurrentMatches,
    sortBy,
  ]);

  const filteredOldPlayers = useMemo(() => {
    const withPlayedIn = oldPlayers.map((player) => ({
      ...player,
      playedIn: filterPlayedIn(
        player.playedIn,
        clubId,
        activeType,
        activeYear
      ),
    }));

    const totalOldMatches = getUniqueMatchesCount(
      withPlayedIn.flatMap((player) => player.playedIn)
    );

    const list = withPlayedIn.map((player) =>
      buildPlayerStats(player, totalOldMatches)
    );

    return sortPlayers(list, sortBy);
  }, [oldPlayers, activeType, activeYear, clubId, sortBy]);

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
          <Select
            className={s.select}
            options={sortOptions}
            value={sortBy}
            onChange={(value) => setSortBy(value as SortKey)}
          />
        </div>
      )}
      <div className={s.list}>
        {activeTab < 2 &&
          filteredCurrentPlayers.map((player) => (
            <TeamCard
              key={player.id}
              id={player.id}
              number={player.number}
              photo={player.photo}
              name={player.name}
              position={player.position}
              matches={player.matches}
              goals={player.goals}
              assists={player.assists}
              goalsAssists={player.goalsAssists}
              matchesPercent={player.matchesPercent}
              goalsPerGame={player.goalsPerGame}
              assistsPerGame={player.assistsPerGame}
              goalsAssistsPerGame={player.goalsAssistsPerGame}
              isTeam={player.type === 'team'}
            />
          ))}

        {activeTab === 2 &&
          filteredOldPlayers.map((player) => (
            <TeamCard
              key={player.id}
              id={player.id}
              number={player.number}
              photo={player.photo}
              name={player.name}
              position={player.position}
              matches={player.matches}
              goals={player.goals}
              assists={player.assists}
              goalsAssists={player.goalsAssists}
              matchesPercent={player.matchesPercent}
              goalsPerGame={player.goalsPerGame}
              assistsPerGame={player.assistsPerGame}
              goalsAssistsPerGame={player.goalsAssistsPerGame}
              isTeam={player.type === 'team'}
              club={player.club}
            />
          ))}

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
