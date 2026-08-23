import { signIn } from 'next-auth/react';
import { LoginButton } from '@telegram-auth/react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // const { status, data } = useSession();
  // const isAdmin = data?.user?.role === 'ADMIN';

  const isAdmin = true;
  const showLogin = false;

  if (showLogin) {
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

  return <>{isAdmin && children}</>;
};
