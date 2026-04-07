'use client';

import { useSession } from 'next-auth/react';
import { MatchVote as MatchVoteType } from '@prisma/client';
import { Button } from '@ui/Button';
import s from './styles.module.scss';
import { createVote } from '@/services/vote';

type MatchVoteProps = {
  selectedPlayer: {
    id: number;
    name: string;
    number: number;
  } | null;
  matchId: number;
  votes: MatchVoteType[];
};

export const MatchVote = ({
  matchId,
  selectedPlayer,
  votes,
}: MatchVoteProps) => {
  const { data, status } = useSession();

  const handleVote = (data: {
    playerId: number;
    matchId: number;
    username: string;
  }) => {
    createVote(data).finally(() => location.reload());
  };

  if (status === 'unauthenticated') {
    return (
      <div className={s.main}>
        <p className={s.auth}>
          Войди в аккаунт чтобы получить доступ к голосованиям
        </p>
      </div>
    );
  }

  if (votes.some((vote) => vote.username === data?.user.username)) {
    return (
      <div className={s.main}>
        <h2 className={s.title}>Голосование</h2>
        <p className={s.textWrapper}>
          Ваш голос принят, ожидайте окончания голосования
        </p>
      </div>
    );
  }

  return (
    <div className={s.main}>
      <h2 className={s.title}>Голосование</h2>
      {!selectedPlayer && (
        <div className={s.textWrapper}>
          <h3>Проголосуй за игрока матча</h3>
          <p className={s.description}>Выбери любого игрока из команд</p>
        </div>
      )}
      {selectedPlayer && (
        <div className={s.player}>
          <p className={s.number}>{selectedPlayer.number}</p>
          <p className={s.name}>{selectedPlayer.name}</p>
        </div>
      )}
      <Button
        className={s.button}
        onClick={() =>
          selectedPlayer?.id &&
          handleVote({
            username: data!.user.username,
            matchId,
            playerId: selectedPlayer?.id,
          })
        }
      >
        Проголосовать
      </Button>
    </div>
  );
};
