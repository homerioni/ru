'use client';

import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { SIZES } from '@/constants';
import { TTeamStats } from '@/services/matches';
import { getEndingByAmount } from '@/utils/getEndingByAmount';
import s from './styles.module.scss';
import { useState } from 'react';

type TMatchItemProps = {
  clubs: {
    logoSrc: string;
    name: string;
  }[];
  type: string;
  date: string;
  score: number[];
  players?: TTeamStats[];
};

export const MatchItem = ({
  clubs,
  date,
  score,
  type,
  players,
}: TMatchItemProps) => {
  const [teamIsOpen, setTeamIsOpen] = useState(false);

  return (
    <div className={s.main}>
      <ClubLogo
        logoSrc={clubs[0].logoSrc}
        name={clubs[0].name}
        namePosition={NAME_POSITION.BOTTOM}
        size={SIZES.s}
      />
      <div className={s.infoBox}>
        <p className={s.infoTitle}>{type}</p>
        <p className={s.score}>
          {score.length ? `${score[0]} - ${score[1]}` : 'VS'}
        </p>
        <p className={s.date}>{date}</p>
      </div>
      <ClubLogo
        logoSrc={clubs[1].logoSrc}
        name={clubs[1].name}
        namePosition={NAME_POSITION.BOTTOM}
        size={SIZES.s}
      />
      {players?.length ? (
        <>
          <button
            type="button"
            className={`${s.showBtn} ${teamIsOpen ? s.active : ''}`}
            onClick={() => setTeamIsOpen((prev) => !prev)}
          >
            <span>{teamIsOpen ? 'Скрыть' : 'Показать состав на игру'}</span>
            <span className={s.btnArrow}></span>
          </button>
          {teamIsOpen && (
            <div className={s.team}>
              {players.map((item) => (
                <div className={s.teamItem} key={item.id}>
                  <span className={s.number}>{item.player.number}</span>
                  <span className={s.name}>{item.player.name}</span>
                  <span className={s.stats}>
                    {item.goals > 0 && (
                      <span>
                        {item.goals}
                        {getEndingByAmount(item.goals, [
                          ' гол',
                          ' гола',
                          ' голов',
                        ])}
                      </span>
                    )}
                    {item.assists > 0 && (
                      <span>
                        {item.assists}
                        {getEndingByAmount(item.assists, [
                          ' пас',
                          ' паса',
                          ' пасов',
                        ])}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
