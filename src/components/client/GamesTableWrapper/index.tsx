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

  return (
    <>
      {tables.length > 1 && (
        <GamesTableTabs
          items={tables}
          setter={(id) => setActiveTab(id)}
          activeTab={activeTab}
        />
      )}
      <GamesTable
        id={tables[activeTab].id}
        title={tables[activeTab].fullName}
        name={tables[activeTab].name}
      />
    </>
  );
};
