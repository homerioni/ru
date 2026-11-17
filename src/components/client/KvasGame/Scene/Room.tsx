import { CSSProperties, memo } from 'react';
import { kvasManifest } from '../manifest';
import s from './styles.module.scss';

const [SCENE_W, SCENE_H] = kvasManifest.scene;
const UPGRADE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

const layerStyle = (url: string, frames: number): CSSProperties => ({
  backgroundImage: `url(${url})`,
  backgroundSize: `${frames * SCENE_W}px ${SCENE_H}px`,
  ['--shift' as string]: `${-frames * SCENE_W}px`,
});

type RoomProps = {
  roomItems: number[];
  dark: boolean;
};

export const Room = memo(function Room({ roomItems, dark }: RoomProps) {
  const bought = new Set(roomItems);
  return (
    <>
      <div className={s.layer} style={layerStyle('/game/kvas/room/base.png', 1)} />
      {UPGRADE_IDS.map((id) => {
        if (!bought.has(id)) return null;
        if (id === 4 && bought.has(5)) return null;
        const frames = kvasManifest.upgradeFrames[String(id)] ?? 1;
        const motion =
          frames === 4 ? s.f4 : frames === 3 ? s.f3 : frames === 2 ? s.f2 : '';
        return (
          <div
            key={id}
            className={`${s.layer} ${motion}`}
            style={layerStyle(`/game/kvas/room/upgrade-${id}.png`, frames)}
          />
        );
      })}
      {dark && (
        <div className={`${s.layer} ${s.dark}`} style={layerStyle('/game/kvas/room/dark.png', 1)} />
      )}
    </>
  );
});
