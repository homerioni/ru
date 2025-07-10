'use client';

import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from '@/components/admin/AuthGuard/AuthGuard';
import { useMediaQuery } from '@mantine/hooks';
import { AdminPanel } from '@/components/admin/AdminPanel';
import '@mantine/core/styles.css';

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
        <AuthGuard>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <ModalsProvider modalProps={modalProps}>
                <AdminPanel>{children}</AdminPanel>
              </ModalsProvider>
            </MantineProvider>
          </QueryClientProvider>
        </AuthGuard>
      </SessionProvider>
    </>
  );
}
