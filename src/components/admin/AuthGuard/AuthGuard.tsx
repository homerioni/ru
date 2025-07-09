import { useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const emails = ['homerion13@gmail.com', 'artik1377@gmail.com'];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { status, data } = useSession();

  const isAdmin = data?.user?.email && emails.includes(data?.user?.email);

  const isUnauthenticated = status === 'unauthenticated';

  const isLoading = status === 'loading' || status === 'unauthenticated';

  useEffect(() => {
    if (isUnauthenticated) {
      signIn('google');
    } else if (!isLoading && !isAdmin) {
      signOut().then(() => signIn('google'));
    }
  }, [isUnauthenticated, isAdmin, isLoading]);

  return (
    <>
      {isLoading && 'Загрузка...'}
      {status === 'authenticated' && isAdmin && children}
    </>
  );
};
