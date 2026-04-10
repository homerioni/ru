'use client';

import { LoginButton } from '@telegram-auth/react';
import { signIn } from 'next-auth/react';
import { UserAvatar } from '@/components/client/UserAvatar';
import s from './styles.module.scss';
import { Button } from '@ui/Button';
import { TelegramIcon } from '@ui/Icons';

type LoginBtnProps = {
  status: 'authenticated' | 'loading' | 'unauthenticated';
};

export const LoginBtn = ({ status }: LoginBtnProps) => {
  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    return <UserAvatar />;
  }

  return (
    <div className={s.main}>
      <Button className={s.btn} variant={'blue'}>
        <TelegramIcon />
        <span>Войти</span>
      </Button>
      <div className={s.login}>
        <LoginButton
          buttonSize={'small'}
          lang={'ru'}
          showAvatar={false}
          botUsername="rechutd_bot"
          onAuthCallback={(data) => {
            signIn(
              'telegram-login',
              { callbackUrl: location.href },
              data as never
            );
          }}
        />
      </div>
    </div>
  );
};
