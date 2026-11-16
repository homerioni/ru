'use client';

import { useEffect, useRef, useState } from 'react';
import { kvasManifest } from '../manifest';
import { TGameState } from '../types';
import { Cans } from './Cans';
import { Events } from './Events';
import { PlayerSprite } from './Player';
import { Room } from './Room';
import s from './styles.module.scss';

type SceneProps = {
  state: TGameState;
  bodyFrame: number;
  headFrame: number;
  canPop: boolean;
  shake: [number, number];
  dark: boolean;
  coach: 'idle' | 'creak' | 'look';
  coachYell: boolean;
  cleaner: boolean;
  pigeon: boolean;
  teammate: 1 | 2 | null;
  teammateFrame: number;
  velo: 'idle' | 'ride' | 'crash';
  veloImpulse: number;
  onSip: (point?: { x: number; y: number }) => void;
  onPigeon: () => void;
};

const [SCENE_W, SCENE_H] = kvasManifest.scene;
const [FOCUS_X, FOCUS_Y] = kvasManifest.focus;

export const Scene = (props: SceneProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ scale: 1, left: 0, top: 0 });

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const apply = () => {
      const vw = node.clientWidth;
      const vh = node.clientHeight;
      if (!vw || !vh) return;
      const scale = Math.max(vw / SCENE_W, vh / SCENE_H);
      const minLeft = vw - SCENE_W * scale;
      const minTop = vh - SCENE_H * scale;
      const left = Math.min(0, Math.max(minLeft, vw * 0.5 - FOCUS_X * scale));
      const top = Math.min(0, Math.max(minTop, vh * 0.52 - FOCUS_Y * scale));
      setView({ scale, left, top });
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className={s.wrap}
      tabIndex={0}
      role="button"
      aria-label="Глотнуть Ясен Квасен"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('[data-pigeon], button')) return;
        event.preventDefault();
        props.onSip({ x: event.clientX, y: event.clientY });
      }}
      onKeyDown={(event) => {
        if (event.repeat) return;
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          const rect = wrapRef.current?.getBoundingClientRect();
          props.onSip(
            rect
              ? { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.48 }
              : undefined
          );
        }
      }}
    >
      <div className={s.frame}>
        <div
          className={s.scene}
          style={{
            transform: `translate(${view.left}px, ${view.top}px) scale(${view.scale}) translate(${props.shake[0]}px, ${props.shake[1]}px)`,
            transformOrigin: 'top left',
          }}
        >
          <Room roomLevel={props.state.roomLevel} dark={props.dark} />
          <Cans state={props.state} crashImpulse={props.veloImpulse} />
          <PlayerSprite
            state={props.state}
            bodyFrame={props.bodyFrame}
            headFrame={props.headFrame}
            canPop={props.canPop}
          />
          <Events
            state={props.state}
            coach={props.coach}
            coachYell={props.coachYell}
            cleaner={props.cleaner}
            pigeon={props.pigeon}
            teammate={props.teammate}
            teammateFrame={props.teammateFrame}
            velo={props.velo}
            onPigeon={props.onPigeon}
          />
        </div>
      </div>
    </div>
  );
};
