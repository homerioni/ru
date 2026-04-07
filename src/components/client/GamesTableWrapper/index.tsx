'use client';

import { useEffect, useState } from 'react';
import { Tabs } from '@/components/client/Tabs';
import { GamesTable } from '@/components/client/GamesTable';
import { TMatchGroups } from '@/app/(layout)/(client)/tables/page';
import { Select } from '@ui/Select';
import s from './styles.module.scss';

type GamesTableWrapperProps = {
  matches: TMatchGroups;
};

const years = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
];

export const GamesTableWrapper = ({ matches }: GamesTableWrapperProps) => {
  const [activeTab, setActiveTab] = useState(matches.types[0].id);
  const [selectYear, setSelectYear] = useState(years[0].value);

  const tabs = matches.types.filter(
    (type) => type.year === +selectYear || type.year === null
  );

  useEffect(() => {
    setActiveTab(tabs[0].id);
  }, [selectYear]);

  const activeMatches =
    matches[activeTab].type.year !== null
      ? matches[activeTab].matches
      : {
          played: matches[activeTab].matches?.played.filter(
            (match) => new Date(match.date).getFullYear() === +selectYear
          ),
          future: matches[activeTab].matches?.future.filter(
            (match) => new Date(match.date).getFullYear() === +selectYear
          ),
        };

  return (
    <>
      <section className={s.season}>
        <p>Сезон</p>
        <Select
          options={years}
          onChange={(year) => setSelectYear(year)}
          value={selectYear}
        />
      </section>
      <section className={s.tabs}>
        <Tabs
          items={tabs}
          setter={(id) => setActiveTab(id)}
          activeTab={activeTab}
        />
      </section>
      <GamesTable
        key={activeTab}
        table={matches[activeTab].table}
        matches={activeMatches}
        title={matches[activeTab].type.fullName}
        name={matches[activeTab].type.name}
        type={matches[activeTab].type.type}
      />
    </>
  );
};
