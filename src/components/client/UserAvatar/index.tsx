'use client';

import s from './styles.module.scss';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { getUserPlayer } from '@/services/userPlayer';
import { Player } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { clubAdminRoutes } from '@/constants/routes';

export const UserAvatar = () => {
  const { data } = useSession();
  const router = useRouter();

  const [player, setPlayer] = useState<Player>();
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.user.username) {
      getUserPlayer(data?.user.username).then(setPlayer);
    }
  }, [data?.user.username]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!data?.user) {
    return null;
  }

  return (
    <div className={s.main} ref={menuRef}>
      <div className={s.avatar} onClick={() => setIsOpen(true)}>
        <img src={data.user.image} alt={'avatar'} width={128} height={128} />
      </div>
      <div className={`${s.list} ${isOpen ? s.active : ''}`}>
        {data.user.clubAdminId && (
          <div
            className={s.item}
            onClick={() => {
              router.push(clubAdminRoutes.games);
              setIsOpen(false);
            }}
          >
            Панель управления клубом
          </div>
        )}
        {player && (
          <div
            className={s.item}
            onClick={() => {
              router.push(`/player/${player.id}`);
              setIsOpen(false);
            }}
          >
            Мой профиль
          </div>
        )}
        <div className={s.item} onClick={() => signOut()}>
          Выйти
        </div>
      </div>
    </div>
  );
};
