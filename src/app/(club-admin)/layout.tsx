'use client';

import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMediaQuery } from '@mantine/hooks';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { ClubAdminPanel } from '@/components/admin/ClubAdminPanel';
import { ClubAuthGuard } from '@/components/admin/ClubAuthGuard/AuthGuard';

const queryClient = new QueryClient();

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const modalProps = {
    fullScreen: isMobile,
    styles: {
      inner: {
        width: '100vw',
      },
    },
  };

  return (
    <>
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <SessionProvider>
        <ClubAuthGuard>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <Notifications position="top-center" zIndex={1000} />
              <ModalsProvider modalProps={modalProps}>
                <ClubAdminPanel>{children}</ClubAdminPanel>
              </ModalsProvider>
            </MantineProvider>
          </QueryClientProvider>
        </ClubAuthGuard>
      </SessionProvider>
    </>
  );
}
