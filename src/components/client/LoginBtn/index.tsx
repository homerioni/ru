import { signIn, signOut } from 'next-auth/react';
import { Button } from '@ui/Button';
import s from './styles.module.scss';

type LoginBtnProps = {
  status: 'authenticated' | 'loading' | 'unauthenticated';
  isDesktop?: boolean;
  isMobile?: boolean;
};

export const LoginBtn = ({ status, isDesktop, isMobile }: LoginBtnProps) => {
  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    return (
      <Button
        className={isDesktop ? s.desktop : ''}
        variant="secondary"
        onClick={() => {
          signOut().then(() => {
            sessionStorage.removeItem('userId');
          });
        }}
      >
        Выйти
      </Button>
    );
  }

  return (
    <Button
      className={isMobile ? s.mobile : ''}
      onClick={() => signIn('google')}
    >
      Войти
    </Button>
  );
};
