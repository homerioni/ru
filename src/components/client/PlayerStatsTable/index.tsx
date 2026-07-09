'use client';

import Image from 'next/image';
import Link from 'next/link';
import s from './styles.module.scss';
import { Select } from '@ui/Select';
import { useState } from 'react';

const selectList = [
  { label: 'Топ бомбардиров', value: 'goals' },
  { label: 'Топ ассистентов', value: 'assists' },
];

type PlayerStatItem = {
  clubImgSrc: string;
  name: string;
  qty: number;
  playerId: number;
  clubId: number;
};

type PlayerStatsTableProps = {
  goals: PlayerStatItem[];
  assists: PlayerStatItem[];
};

const renderPlayerRow = (item: PlayerStatItem, index: number) => (
  <li key={item.playerId} className={s.player}>
    <Link href={`/player/${item.playerId}`} className={s.playerLink}>
      <span>{index + 1}</span>
      <Image src={item.clubImgSrc} alt={'logo'} width={64} height={64} />
      <span>{item.name}</span>
      <span>{item.qty}</span>
    </Link>
  </li>
);

export const PlayerStatsTable = ({ goals, assists }: PlayerStatsTableProps) => {
  const [selectedList, setSelectedList] = useState(selectList[0].value);

  return (
    <>
      <div className={s.mobileSelect}>
        <Select
          options={selectList}
          onChange={(value) => setSelectedList(value)}
          value={selectedList}
        />
      </div>
      <div className={s.main}>
        <div
          className={`${s.listWrapper} ${selectedList === 'goals' ? s.active : ''}`}
        >
          <h2 className={s.title}>Топ бомбардиров</h2>
          <ul className={s.list}>
            <li className={s.header}>
              <span>#</span>
              <span>Клуб</span>
              <span>Имя</span>
              <span>Голов</span>
            </li>
            {goals.map(renderPlayerRow)}
          </ul>
        </div>
        <div
          className={`${s.listWrapper} ${selectedList === 'assists' ? s.active : ''}`}
        >
          <h2 className={s.title}>Топ ассистентов</h2>
          <ul className={s.list}>
            <li className={s.header}>
              <span>#</span>
              <span>Клуб</span>
              <span>Имя</span>
              <span>Пасов</span>
            </li>
            {assists.map(renderPlayerRow)}
          </ul>
        </div>
      </div>
    </>
  );
};
