'use client';

import { AppShell } from '@mantine/core';
import { Header } from '@/components/admin/Header';
import { Navbar } from '@/components/admin/Navbar';
import { useState } from 'react';

export const AdminPanel = ({ children }: { children: React.ReactNode }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
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
        <Header
          menuIsOpen={menuIsOpen}
          burgerClick={() => setMenuIsOpen(!menuIsOpen)}
        />
      </AppShell.Header>

      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
