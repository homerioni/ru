import { CSSProperties, memo } from 'react';
import { kvasManifest } from '../manifest';
import { pileStage } from '../logic/selectors';
import s from './styles.module.scss';

type EventsProps = {
  pileCount: number;
  coach: 'idle' | 'creak' | 'look';
  coachYell: boolean;
  cleaner: boolean;
  pigeon: boolean;
  teammate: 1 | 2 | null;
  teammateFrame: number;
  velo: 'idle' | 'ride' | 'crash';
  onPigeon: () => void;
};

const [COACH_W, COACH_H] = kvasManifest.coach.cell;
const [TEAMMATE_W, TEAMMATE_H] = kvasManifest.teammate.cell;
const [VELO_W, VELO_H] = kvasManifest.velo.cell;
const [CLEANER_W, CLEANER_H] = kvasManifest.cleaner.cell;
const [PIGEON_W, PIGEON_H] = kvasManifest.pigeon.cell;

export const Events = memo(function Events({
  pileCount,
  coach,
  coachYell,
  cleaner,
  pigeon,
  teammate,
  teammateFrame,
  velo,
  onPigeon,
}: EventsProps) {
  const coachFrame = coachYell ? 2 : coach === 'look' ? 1 : 0;
  const pigeonAt =
    kvasManifest.pigeonOnPile[pileStage(pileCount)] ?? kvasManifest.pigeonOnPile[1];

  return (
    <>
      {teammate !== null && (
        <div
          className={`${s.sprite} ${s.teammate}`}
          style={{
            left: kvasManifest.teammatePosition[0],
            top: kvasManifest.teammatePosition[1],
            width: TEAMMATE_W,
            height: TEAMMATE_H,
            backgroundImage: `url(/game/kvas/props/teammate-${teammate}.png)`,
            backgroundSize: `${TEAMMATE_W * kvasManifest.teammate.frames}px ${TEAMMATE_H}px`,
            backgroundPosition: `${-teammateFrame * TEAMMATE_W}px 0`,
          }}
        />
      )}
      {velo !== 'idle' && (
        <div
          className={`${s.sprite} ${s.velo} ${velo === 'ride' ? s.veloRide : s.veloCrash}`}
          style={
            {
              left: 0,
              top: 222,
              width: VELO_W,
              height: VELO_H,
              backgroundImage: 'url(/game/kvas/props/velo.png)',
              backgroundSize: `${VELO_W * kvasManifest.velo.frames}px ${VELO_H}px`,
              backgroundPosition: velo === 'crash' ? `${-2 * VELO_W}px 0` : '0 0',
              ['--shift' as string]: `${-2 * VELO_W}px`,
            } as CSSProperties
          }
        />
      )}
      {velo === 'crash' && (
        <div className={s.crashBurst} style={{ left: 6, top: 248 }} aria-hidden />
      )}
      {coach !== 'idle' && (
        <div
          className={`${s.sprite} ${s.actor}`}
          style={{
            left: kvasManifest.coachPosition[0],
            top: kvasManifest.coachPosition[1],
            width: COACH_W,
            height: COACH_H,
            backgroundImage: 'url(/game/kvas/props/coach.png)',
            backgroundSize: `${COACH_W * kvasManifest.coach.frames}px ${COACH_H}px`,
            backgroundPosition: `${-coachFrame * COACH_W}px 0`,
          }}
        />
      )}
      {cleaner && (
        <div
          className={`${s.sprite} ${s.actor} ${s.cleaner}`}
          style={
            {
              left: kvasManifest.cleanerPosition[0],
              top: kvasManifest.cleanerPosition[1],
              width: CLEANER_W,
              height: CLEANER_H,
              backgroundImage: 'url(/game/kvas/props/cleaner.png)',
              backgroundSize: `${CLEANER_W * kvasManifest.cleaner.frames}px ${CLEANER_H}px`,
              ['--shift' as string]: `${-CLEANER_W * kvasManifest.cleaner.frames}px`,
            } as CSSProperties
          }
        />
      )}
      {pigeon && (
        <button
          type="button"
          data-pigeon
          className={s.pigeon}
          style={
            {
              left: pigeonAt[0],
              top: pigeonAt[1],
              width: PIGEON_W,
              height: PIGEON_H,
              backgroundImage: 'url(/game/kvas/props/pigeon.png)',
              backgroundSize: `${PIGEON_W * kvasManifest.pigeon.frames}px ${PIGEON_H}px`,
              ['--shift' as string]: `${-PIGEON_W * kvasManifest.pigeon.frames}px`,
            } as CSSProperties
          }
          onPointerDown={(event) => {
            event.stopPropagation();
            onPigeon();
          }}
          aria-label="Голубь"
        />
      )}
    </>
  );
});
