'use client';

import { CSSProperties, memo } from 'react';
import { BELLY_NAMES, FINAL_CANS } from '../logic/balance';
import { bellyStage, canCrushStage, canVolume, multiplier, rankName } from '../logic/selectors';
import { kvasManifest } from '../manifest';
import { TGameState } from '../types';
import s from './styles.module.scss';

type HUDProps = {
  state: TGameState;
  onSound: () => void;
};

const iconBg = (index: number): CSSProperties => ({
  backgroundImage: 'url(/game/kvas/props/icons.png)',
  backgroundSize: '416px 32px',
  backgroundPosition: `${-index * 32}px 0`,
});

export const HUD = memo(function HUD({ state, onSound }: HUDProps) {
  const belly = bellyStage(state.cans);
  const mult = multiplier(state);
  const multText = Number.isInteger(mult) ? `${mult}` : mult.toFixed(2).replace(/\.?0+$/, '');

  return (
    <div className={s.topBar}>
      <div className={s.leftCol}>
        <div className={s.panel}>
          <span className={s.icon32} style={iconBg(1)} aria-hidden />
          <div className={s.meta}>
            <p className={s.rank}>{rankName(state.cans)}</p>
            <p className={s.sub}>
              {BELLY_NAMES[belly]} · ×{multText}
            </p>
          </div>
        </div>

        <div className={s.panel}>
          <span className={s.icon32} style={iconBg(0)} aria-hidden />
          <div className={s.meta}>
            <p className={s.kvasiki}>{state.kvasiki.toLocaleString('ru-RU')} кв.</p>
            <p className={s.sub}>
              Банки: {state.cans}/{FINAL_CANS} · Глотки: {state.sips}
            </p>
          </div>
        </div>
      </div>

      <div className={s.rightDock}>
        <button
          type="button"
          className={`${s.dockBtn} ${state.soundOn ? '' : s.muted}`}
          onClick={onSound}
          aria-label={state.soundOn ? 'Выключить звук' : 'Включить звук'}
        >
          <span className={s.icon32} style={iconBg(3)} aria-hidden />
          <span className={s.dockLabel}>{state.soundOn ? 'Звук' : 'Тихо'}</span>
        </button>
      </div>
    </div>
  );
});

export const CanMeter = memo(function CanMeter({ state }: { state: TGameState }) {
  const volume = canVolume(state.skills.throat);
  const isOpen = state.can.state === 'open';
  const crush = canCrushStage(state);
  const left = isOpen ? state.can.left : volume;
  const pct = isOpen ? Math.max(0, Math.min(100, Math.round((left / volume) * 100))) : 100;
  const canFrame = isOpen ? 2 + crush : 0;

  return (
    <div className={s.canPanel}>
      <span
        className={s.miniCan}
        style={{
          backgroundSize: `${24 * kvasManifest.can.frames}px 44px`,
          backgroundPosition: `${-canFrame * 24}px 0`,
        }}
        aria-hidden
      />
      <div className={s.canInfo}>
        <p className={s.canText}>
          {isOpen ? `В банке: ${left}/${volume}` : 'Закрыта · жми!'}
        </p>
        <div className={s.track} aria-hidden>
          <div
            className={`${s.fill} ${isOpen ? '' : s.fillClosed}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
});
