'use client';

import { useState } from 'react';
import { GamesTableTabs } from 'src/components/client/GamesTableTabs';
import { GamesTable } from '@/components/client/GamesTable';
import { TMatchGroups } from '@/app/(client)/tables/page';

type GamesTableWrapperProps = {
  matches: TMatchGroups;
};

export const GamesTableWrapper = ({ matches }: GamesTableWrapperProps) => {
  const [activeTab, setActiveTab] = useState(matches.types[0].id);

  return (
    <>
      <GamesTableTabs
        items={matches.types}
        setter={(id) => setActiveTab(id)}
        activeTab={activeTab}
      />
      <GamesTable
        table={matches[activeTab].table}
        matches={matches[activeTab].matches}
        title={matches[activeTab].type.fullName}
        name={matches[activeTab].type.name}
        isLeague={matches[activeTab].type.isLeague}
      />
    </>
  );
};
