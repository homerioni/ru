'use client';

import Image from 'next/image';
import s from './styles.module.scss';
import { Select } from '@ui/Select';
import { useState } from 'react';

const selectList = [
  { label: 'Топ бомбардиров', value: 'goals' },
  { label: 'Топ ассистентов', value: 'assists' },
];

type PlayerStatsTableProps = {
  goals: { clubImgSrc: string; name: string; qty: number }[];
  assists: { clubImgSrc: string; name: string; qty: number }[];
};

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
            {goals.map((item, index) => (
              <li key={item.name} className={s.player}>
                <span>{index + 1}</span>
                <Image
                  src={item.clubImgSrc}
                  alt={'logo'}
                  width={64}
                  height={64}
                />
                <span>{item.name}</span>
                <span>{item.qty}</span>
              </li>
            ))}
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
            {assists.map((item, index) => (
              <li key={item.name} className={s.player}>
                <span>{index + 1}</span>
                <Image
                  src={item.clubImgSrc}
                  alt={'logo'}
                  width={64}
                  height={64}
                />
                <span>{item.name}</span>
                <span>{item.qty}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
