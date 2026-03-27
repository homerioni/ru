'use client';

import { AppShell } from '@mantine/core';
import { Header } from '@/components/admin/Header';
import { useState } from 'react';
import { ClubAdminNavbar } from '@/components/admin/ClubAdminNavbar';

export const ClubAdminPanel = ({ children }: { children: React.ReactNode }) => {
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
        <ClubAdminNavbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
