import { signIn, useSession } from 'next-auth/react';
import { LoginButton } from '@telegram-auth/react';
import { useRouter } from 'next/navigation';
import { clubAdminRoutes } from '@/constants/routes';

export const ClubAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { status, data } = useSession();
  const router = useRouter();

  const isAdmin = !!data?.user?.clubAdminId;

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
              { callbackUrl: clubAdminRoutes.games },
              authData as never
            );
          }}
        />
      </div>
    );
  }

  if (data?.user && !isAdmin) {
    router.push('/');
  }

  return (
    <>
      {isLoading && 'Загрузка...'}
      {status === 'authenticated' && isAdmin && children}
    </>
  );
};
