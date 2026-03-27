'use client';

import { TGetMatch } from '@/services/matches';
import { Tabs } from '@/components/client/Tabs';
import { useState } from 'react';
import s from './styles.module.scss';
import { MatchesListByMonth } from '@/components/client/MatchesListByMonth';

type MatchesProps = {
  matches: TGetMatch[];
  clubId: string | number;
};

const matchesTabs = [
  { id: 0, name: 'Сыгранные матчи' },
  { id: 1, name: 'Будущие матчи' },
];

export const Matches = ({ matches, clubId }: MatchesProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const dateNow = Date.now();

  const oldMatches = matches.filter(
    (match) =>
      new Date(match.date).getTime() <= dateNow && match.score.length > 1
  );

  const newMatches = matches
    .filter((match) => new Date(match.date).getTime() > dateNow)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className={`${s.main} container`}>
      <div className={s.tabs}>
        <Tabs
          items={matchesTabs}
          activeTab={activeTab}
          setter={(id) => setActiveTab(id)}
        />
      </div>
      {activeTab === 1 ? (
        <MatchesListByMonth matches={newMatches} clubId={clubId} />
      ) : (
        <MatchesListByMonth matches={oldMatches} clubId={clubId} />
      )}
    </div>
  );
};
