import { useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const emails = ['homerion13@gmail.com'];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const t = useSession();

  const isAdmin = t.data?.user?.email && emails.includes(t.data?.user?.email);

  const isUnauthenticated = t.status === 'unauthenticated';

  const isLoading = t.status === 'loading' || t.status === 'unauthenticated';

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
      {t.status === 'authenticated' && isAdmin && children}
    </>
  );
};
