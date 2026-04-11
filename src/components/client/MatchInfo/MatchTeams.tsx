'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { TGetMatch } from '@/services/matches';
import s from './styles.module.scss';
import { MatchVote } from '@/components/client/MatchInfo/MatchVote';
import Image from 'next/image';
import defaultPlayerImg from '@/assets/img/player-default.webp';

type MatchTeamsProps = {
  data: TGetMatch;
};

export const MatchTeams = ({ data }: MatchTeamsProps) => {
  const [activeClub, setActiveClub] = useState(String(data.homeClub.id));
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: number;
    name: string;
    number: number;
  } | null>(null);

  const options = [
    { value: String(data.homeClub.id), label: data.homeClub.name },
    { value: String(data.awayClub.id), label: data.awayClub.name },
  ];

  const matchPlayer = data.votes
    .reduce<
      {
        id: number;
        votes: number;
      }[]
    >((acc, vote) => {
      const index = acc.findIndex((item) => item.id === vote.playerId);

      if (index === -1) {
        return [...acc, { id: vote.playerId, votes: 1 }];
      }

      acc[index] = { ...acc[index], votes: acc[index].votes + 1 };

      return acc;
    }, [])
    .sort((a, b) => b.votes - a.votes)[0];

  const awardPlayerInfo =
    matchPlayer &&
    data.players.find((item) => item.playerId === matchPlayer.id);

  return (
    <>
      {data.voteStatus === 'started' && (
        <MatchVote
          selectedPlayer={selectedPlayer}
          matchId={data.id}
          votes={data.votes}
        />
      )}
      {data.voteStatus === 'closed' && awardPlayerInfo && (
        <div className={s.award}>
          <h3 className={s.awardTitle}>Игрок матча</h3>
          <div className={s.awardPlayer}>
            <Image
              className={s.awardPhoto}
              src={awardPlayerInfo.player.photo ?? defaultPlayerImg}
              alt={'Игрок'}
              width={100}
              height={100}
            />
            <p className={s.awardText}>
              <span className={s.number}>{awardPlayerInfo?.player.number}</span>
              <span>{awardPlayerInfo.player.name}</span>
            </p>
            <Image
              src={
                awardPlayerInfo.clubId === data.homeClub.id
                  ? data.homeClub.logoSrc
                  : data.awayClub.logoSrc
              }
              alt={'Клуб'}
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
      <div className={s.mobileSelect}>
        <Select options={options} value={activeClub} onChange={setActiveClub} />
      </div>
      <div className={s.team}>
        <div className={+activeClub === data.homeClub.id ? s.active : ''}>
          <div className={s.teamHeader}>
            <span>#</span>
            <span>Имя</span>
            <span>Г</span>
            <span>П</span>
          </div>
          {data.players
            .filter((item) => item.clubId === data.homeClub.id)
            .sort((a, b) => (a.player.number ?? 0) - (b.player.number ?? 0))
            .map((item) => (
              <div
                key={item.id}
                className={s.teamItem}
                onClick={() =>
                  setSelectedPlayer({
                    id: item.player.id,
                    name: item.player.name,
                    number: item.player.number ?? 0,
                  })
                }
              >
                <span className={s.number}>{item.player.number}</span>
                <span className={s.name}>{item.player.name}</span>
                {item.goals > 0 && (
                  <span className={s.stats}>{item.goals}</span>
                )}
                {item.assists > 0 && (
                  <span className={s.stats}>{item.assists}</span>
                )}
              </div>
            ))}
        </div>
        <div className={+activeClub === data.awayClub.id ? s.active : ''}>
          <div className={s.teamHeader}>
            <span>#</span>
            <span>Имя</span>
            <span>Г</span>
            <span>П</span>
          </div>
          {data.players
            .filter((item) => item.clubId === data.awayClub.id)
            .sort((a, b) => (a.player.number ?? 0) - (b.player.number ?? 0))
            .map((item) => (
              <div
                key={item.id}
                className={s.teamItem}
                onClick={() =>
                  setSelectedPlayer({
                    id: item.player.id,
                    name: item.player.name,
                    number: item.player.number ?? 0,
                  })
                }
              >
                <span className={s.number}>{item.player.number}</span>
                <span className={s.name}>{item.player.name}</span>
                {item.goals > 0 && (
                  <span className={s.stats}>{item.goals}</span>
                )}
                {item.assists > 0 && (
                  <span className={s.stats}>{item.assists}</span>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
