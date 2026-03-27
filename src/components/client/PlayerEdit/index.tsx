'use client';

import { Button } from '@ui/Button';
import { SessionProvider, useSession } from 'next-auth/react';
import s from './styles.module.scss';
import { TGetPlayer } from '@/types';
import { useState } from 'react';
import { PlayerEditModal } from './PlayerEditModal';

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
  const { data } = useSession();

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
