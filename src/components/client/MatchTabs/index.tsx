'use client';

import { useState } from 'react';
import s from './styles.module.scss';

export const MatchTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={`${s.main} ${s[`tab${activeTab}`]}`}>
      <button
        className={`${s.tab} ${activeTab === 0 ? s.active : ''}`}
        onClick={() => setActiveTab(0)}
      >
        Информация
      </button>
      <button
        className={`${s.tab} ${activeTab === 1 ? s.active : ''}`}
        onClick={() => setActiveTab(1)}
      >
        Ставки
      </button>
    </div>
  );
};
