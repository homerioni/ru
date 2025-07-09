'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import {
  AppShell,
  Burger,
  Button,
  ColorSchemeScript,
  Flex,
  MantineProvider,
  NavLink,
  Skeleton,
  Text,
  Title,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from '@/components/admin/AuthGuard/AuthGuard';
import { adminRoutes } from '@/constants';
import '@mantine/core/styles.css';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';

const queryClient = new QueryClient();

const LoginComponent = () => {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <Flex align="center" gap={16}>
        <Skeleton height={32} circle />
        <Skeleton width={80} height={36} />
      </Flex>
    );
  }

  return (
    <Flex align="center" gap={16} justify="flex-end" ml="auto">
      <Text>{data?.user?.name}</Text>
      <Button onClick={() => signOut()}>Выйти</Button>
    </Flex>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <SessionProvider>
        <AuthGuard>
          <QueryClientProvider client={queryClient}>
            <MantineProvider>
              <ModalsProvider
                modalProps={{
                  fullScreen: isMobile,
                  styles: {
                    inner: {
                      width: '100vw',
                    },
                  },
                }}
              >
                <AppShell
                  header={{ height: 52 }}
                  navbar={{
                    width: 300,
                    breakpoint: 'sm',
                    collapsed: { mobile: !menuIsOpen },
                  }}
                  padding="md"
                >
                  <AppShell.Header>
                    <Flex
                      align="center"
                      justify="space-between"
                      px={16}
                      h="100%"
                    >
                      <Title
                        h={50}
                        py={8}
                        order={3}
                        display={{ base: 'none', sm: 'block' }}
                      >
                        ADMIN PANEL v0.1
                      </Title>
                      <Burger
                        display={{ base: 'block', sm: 'none' }}
                        opened={menuIsOpen}
                        onClick={() => setMenuIsOpen(!menuIsOpen)}
                      />
                      <LoginComponent />
                    </Flex>
                  </AppShell.Header>

                  <AppShell.Navbar>
                    <NavLink
                      label="Матчи"
                      href={adminRoutes.games}
                      active={pathname === adminRoutes.games}
                    />
                    <NavLink
                      label="Наш состав"
                      href={adminRoutes.team}
                      active={pathname === adminRoutes.team}
                    />
                    <NavLink
                      label="Команды"
                      href={adminRoutes.clubs}
                      active={pathname === adminRoutes.clubs}
                    />
                  </AppShell.Navbar>

                  <AppShell.Main>{children}</AppShell.Main>
                </AppShell>
              </ModalsProvider>
            </MantineProvider>
          </QueryClientProvider>
        </AuthGuard>
      </SessionProvider>
    </>
  );
}
