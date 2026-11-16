import { CSSProperties } from 'react';
import { kvasManifest } from '../manifest';
import s from './styles.module.scss';

const [SCENE_W, SCENE_H] = kvasManifest.scene;
const UPGRADE_IDS = Array.from({ length: 12 }, (_, index) => index + 1);

const layerStyle = (url: string, frames: number): CSSProperties => ({
  backgroundImage: `url(${url})`,
  backgroundSize: `${frames * SCENE_W}px ${SCENE_H}px`,
  ['--shift' as string]: `${-frames * SCENE_W}px`,
});

type RoomProps = {
  roomLevel: number;
  dark: boolean;
};

export const Room = ({ roomLevel, dark }: RoomProps) => (
  <>
    <div className={s.layer} style={layerStyle('/game/kvas/room/base.png', 1)} />
    {UPGRADE_IDS.map((level) => {
      if (roomLevel < level) return null;
      if (level === 4 && roomLevel >= 5) return null;
      const frames = kvasManifest.upgradeFrames[String(level)] ?? 1;
      const motion =
        frames === 4 ? s.f4 : frames === 3 ? s.f3 : frames === 2 ? s.f2 : '';
      return (
        <div
          key={level}
          className={`${s.layer} ${motion}`}
          style={layerStyle(`/game/kvas/room/upgrade-${level}.png`, frames)}
        />
      );
    })}
    {dark && (
      <div className={`${s.layer} ${s.dark}`} style={layerStyle('/game/kvas/room/dark.png', 1)} />
    )}
  </>
);
