import { signIn, signOut, useSession } from 'next-auth/react';
import { LoginButton } from '@telegram-auth/react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { status, data } = useSession();

  // Проверяем, что у пользователя роль ADMIN
  const isAdmin = data?.user?.role === 'ADMIN';

  const isLoading = status === 'loading' || status === 'unauthenticated';

  if (status === 'unauthenticated') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
        }}
      >
        <LoginButton
          lang="ru"
          botUsername="rechutd_bot"
          onAuthCallback={(authData) => {
            signIn(
              'telegram-login',
              { callbackUrl: '/panel' },
              authData as never
            );
          }}
        />
      </div>
    );
  }

  if (data?.user && !isAdmin) {
    signOut();
  }

  return (
    <>
      {isLoading && 'Загрузка...'}
      {status === 'authenticated' && isAdmin && children}
    </>
  );
};
