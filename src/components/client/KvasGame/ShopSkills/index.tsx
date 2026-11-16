'use client';

import { AUTO_SIP_INTERVAL_MS_BY_LEVEL, skillPrice, SKILLS } from '../logic/balance';
import { canRewardBase, gain, multiplier, sipBaseGain } from '../logic/selectors';
import { TGameState, TSkillId } from '../types';
import s from '../styles.module.scss';

type ShopSkillsProps = {
  state: TGameState;
  onBuy: (id: TSkillId) => void;
};

export const ShopSkills = ({ state, onBuy }: ShopSkillsProps) => {
  const mult = multiplier(state);
  const multText = Number.isInteger(mult) ? `${mult}` : mult.toFixed(2).replace(/\.?0+$/, '');
  const perSip = gain(state, sipBaseGain(state));
  const perCan = gain(state, canRewardBase(state));
  const autoMs = AUTO_SIP_INTERVAL_MS_BY_LEVEL[state.skills.coach ?? 0];

  return (
    <div>
      <div className={s.buildSummary}>
        <span>Множитель: ×{multText}</span>
        <span>Глоток: +{perSip} кв.</span>
        <span>Банка: +{perCan} кв.</span>
        <span>Авто: {autoMs ? `${autoMs / 1000}с` : 'нет'}</span>
      </div>
      <ul className={s.shopList}>
        {SKILLS.map((skill, index) => {
          const level = state.skills[skill.id] ?? 0;
          const maxed = level >= skill.max;
          const price = skillPrice(skill.base, level);
          const affordable = !maxed && state.kvasiki >= price;

          return (
            <li key={skill.id} className={s.shopCard}>
              <div
                className={s.skillIcon}
                style={{ backgroundPosition: `${-index * 32}px 0` }}
                aria-hidden
              />
              <div className={s.shopText}>
                <div className={s.shopHeadRow}>
                  <p className={s.shopName}>{skill.name}</p>
                  <span className={s.levelPill}>
                    {level}/{skill.max}
                  </span>
                </div>
                <p className={s.shopDesc}>{skill.desc}</p>
                {!maxed && <p className={s.shopBonus}>{skill.next(level)}</p>}
                <div className={s.levelPips} aria-hidden>
                  {Array.from({ length: skill.max }, (_, idx) => (
                    <span key={idx} className={idx < level ? s.lvlPipOn : s.lvlPip} />
                  ))}
                </div>
              </div>
              <button
                type="button"
                className={`${s.buy} ${affordable ? s.buyReady : ''}`}
                disabled={!affordable}
                onClick={() => onBuy(skill.id)}
              >
                {maxed ? 'МАКС' : `${price} кв.`}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
