import { signIn } from 'next-auth/react';
import { LoginButton } from '@telegram-auth/react';
import { useRouter } from 'next/navigation';
import { clubAdminRoutes } from '@/constants/routes';

export const ClubAuthGuard = ({ children }: { children: React.ReactNode }) => {
  // const { status, data } = useSession();
  // const isAdmin = !!data?.user?.clubAdminId;
  const router = useRouter();

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
              { callbackUrl: clubAdminRoutes.games },
              authData as never
            );
          }}
        />
      </div>
    );
  }

  if (!isAdmin) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
};
