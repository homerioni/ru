'use client';

import { useState } from 'react';
import { GamesTableTabs } from 'src/components/client/GamesTableTabs';
import { MatchType } from '@prisma/client';
import { GamesTable } from '@/components/client/GamesTable';

type GamesTableWrapperProps = {
  tables: MatchType[];
};

export const GamesTableWrapper = ({ tables }: GamesTableWrapperProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const data = tables.filter((type) => !type.isArchive && type.isLeague);

  return (
    <>
      {data.length > 1 && (
        <GamesTableTabs
          items={data}
          setter={(id) => setActiveTab(id)}
          activeTab={activeTab}
        />
      )}
      <GamesTable
        id={data[activeTab].id}
        title={data[activeTab].fullName}
        name={data[activeTab].name}
      />
    </>
  );
};
