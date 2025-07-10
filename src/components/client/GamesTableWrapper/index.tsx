'use client';

import { useEffect, useState } from 'react';
import { GamesTableTabs } from 'src/components/client/GamesTableTabs';
import { MatchType } from '@prisma/client';
import { getMatchTypes } from '@/services/matchTypes';
import { GamesTable } from '@/components/client/GamesTable';

export const GamesTableWrapper = () => {
  const [tables, setTables] = useState<MatchType[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getMatchTypes().then((res) => {
      setTables(res.filter((type) => !type.isArchive && type.isLeague));
    });
  }, []);

  if (!tables.length) {
    return;
  }

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
