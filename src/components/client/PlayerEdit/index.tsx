'use client';

import { Button } from '@ui/Button';
import { SessionProvider, useSession } from 'next-auth/react';
import s from './styles.module.scss';
import { TGetPlayer } from '@/types';
import { useState } from 'react';
import { PlayerEditModal } from './PlayerEditModal';
import { profileRequestTgBot } from '@/services/profileUserTg';

type PlayerEditProps = { username: string | null; playerData: TGetPlayer };

export const PlayerEdit = (props: PlayerEditProps) => {
  return (
    <SessionProvider>
      <PlayerEditContent {...props} />
    </SessionProvider>
  );
};

const PlayerEditContent = ({ username, playerData }: PlayerEditProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHasRequest, setIsHasRequest] = useState(
    sessionStorage.getItem('hasRequest') === 'true'
  );
  const { data, status } = useSession();

  const onRequest = () => {
    if (!data?.user?.username) {
      return;
    }

    setIsHasRequest(true);

    profileRequestTgBot({
      username: data?.user?.username,
      playerId: playerData.id,
      playerName: playerData.name,
    })
      .then(() => {
        sessionStorage.setItem('hasRequest', 'true');
      })
      .catch(() => {
        setIsHasRequest(false);
      });
  };

  if (status === 'unauthenticated') {
    return (
      <div className={s.notAuth}>
        Чтобы редактировать профиль войдите в свой аккаунт
      </div>
    );
  }

  if (username === undefined || username === null) {
    return (
      <div className={s.notUsername}>
        <p>Профиль не привязан</p>
        <Button className={s.button} onClick={onRequest}>
          {isHasRequest ? 'Запрос отправлен' : 'Запросить доступ к аккаунту'}
        </Button>
      </div>
    );
  }

  if (!username || username !== data?.user?.username) {
    return null;
  }

  return (
    <>
      <Button className={s.button} onClick={() => setIsOpen(true)}>
        Редактировать
      </Button>
      {isOpen && (
        <PlayerEditModal
          playerData={playerData}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
