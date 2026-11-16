'use client';

import { useEffect, useState } from 'react';
import { readCans } from '../logic/storage';
import { TKvasPlayer } from '../types';
import s from '../styles.module.scss';

type PlayerSelectProps = {
  players: TKvasPlayer[];
  onPick: (id: number) => void;
};

export const PlayerSelect = ({ players, onPick }: PlayerSelectProps) => {
  const [drunk, setDrunk] = useState<Record<number, number>>({});

  useEffect(() => {
    const next: Record<number, number> = {};
    players.forEach((player) => {
      const cans = readCans(player.id);
      if (cans != null) next[player.id] = cans;
    });
    setDrunk(next);
  }, [players]);

  return (
    <div className={s.selectInner}>
      <div
        className={s.logo}
        role="img"
        aria-label="Ясен Квасен: Раздевалка"
        style={{ backgroundImage: 'url(/game/kvas/props/logo.png)' }}
      />
      <h1 className={s.title}>Кто сегодня в раздевалке?</h1>
      {players.length === 0 ? (
        <p className={s.emptyText}>В составе никого нет. Даже пить некому.</p>
      ) : (
        <div className={s.grid}>
          {players.map((player) => (
            <button key={player.id} type="button" className={s.card} onClick={() => onPick(player.id)}>
              <div className={s.cardPortraitWrap}>
                {player.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={player.photo}
                    alt={player.name}
                    className={s.cardPhoto}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={s.cardHead}
                    style={{ backgroundImage: 'url(/game/kvas/players/_default/head.png)' }}
                  />
                )}
                {player.number != null && <span className={s.cardNum}>#{player.number}</span>}
              </div>
              <span className={s.cardName}>{player.name}</span>
              <span className={s.cardCans}>
                {drunk[player.id] != null ? `Выпито: ${drunk[player.id]} б.` : 'Свежий'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
