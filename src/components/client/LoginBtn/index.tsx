import { signIn, signOut } from 'next-auth/react';
import s from './styles.module.scss';

type LoginBtnProps = {
  status: 'authenticated' | 'loading' | 'unauthenticated';
  isDesktop?: boolean;
  isMobile?: boolean;
};

export const LoginBtn = ({ status, isDesktop, isMobile }: LoginBtnProps) => {
  if (status === 'authenticated') {
    return (
      <button
        className={`${s.loginBtn} ${s.logout} ${isDesktop ? s.desktop : ''}`}
        onClick={() => signOut()}
      >
        Выйти
      </button>
    );
  }

  return (
    <button
      className={`${s.loginBtn} ${isMobile ? s.mobile : ''}`}
      onClick={() => signIn('google')}
    >
      Войти
    </button>
  );
};
