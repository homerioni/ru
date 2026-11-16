import { kvasManifest } from '../manifest';
import { bellyStage, canCrushStage } from '../logic/selectors';
import { TGameState } from '../types';
import s from './styles.module.scss';

type PlayerProps = {
  state: TGameState;
  bodyFrame: number;
  headFrame: number;
  canPop: boolean;
};

const headUrl = (playerId: number) =>
  kvasManifest.players.includes(playerId)
    ? `/game/kvas/players/${playerId}/head.png`
    : '/game/kvas/players/_default/head.png';

export const PlayerSprite = ({ state, bodyFrame, headFrame, canPop }: PlayerProps) => {
  const stage = bellyStage(state.cans);
  const crush = canCrushStage(state);
  const tattooLevel = Math.min(3, state.skills.tattoo ?? 0);
  const anchors = kvasManifest.body.anchors[String(stage)];
  const anchor = anchors[bodyFrame] ?? anchors[0];
  const [bodyW, bodyH] = kvasManifest.body.cell;
  const [headW, headH] = kvasManifest.head.cell;
  const [canW, canH] = kvasManifest.can.cell;
  const [drinkW, drinkH] = kvasManifest.canDrink.cell;
  const canFrame = canPop ? 1 : state.can.state === 'open' ? 2 + crush : 0;
  const isChugging = bodyFrame === 1 || bodyFrame === 2;
  const isBurping = bodyFrame === 3;
  const isIdle = bodyFrame === 0;
  const drinkShiftY = bodyFrame === 1 ? 2 : 0;
  const idleShiftX = bodyFrame === 3 ? -1 : 0;
  const idleShiftY = bodyFrame === 3 ? -2 : bodyFrame === 4 ? 2 : 0;

  return (
    <div
      className={`${s.sprite} ${s.player} ${isIdle ? s.playerIdle : ''}`}
      style={{
        left: kvasManifest.playerPosition[0],
        top: kvasManifest.playerPosition[1],
        width: bodyW,
        height: bodyH,
      }}
    >
      {!isChugging && (
        <div
          style={{
            position: 'absolute',
            left: anchor.neck[0] - kvasManifest.head.neck[0],
            top: anchor.neck[1] - kvasManifest.head.neck[1],
            width: headW,
            height: headH,
            backgroundImage: `url(${headUrl(state.playerId)})`,
            backgroundSize: `${headW * kvasManifest.head.frames}px ${headH}px`,
            backgroundPosition: `${-headFrame * headW}px 0`,
          }}
        />
      )}
      <div
        style={{
          width: bodyW,
          height: bodyH,
          backgroundImage: `url(/game/kvas/body/belly-${stage}.png)`,
          backgroundSize: `${bodyW * kvasManifest.body.frames}px ${bodyH}px`,
          backgroundPosition: `${-bodyFrame * bodyW}px 0`,
        }}
      />
      {tattooLevel > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(/game/kvas/props/tattoo-${tattooLevel}.png)`,
            backgroundSize: `${bodyW * kvasManifest.body.frames}px ${bodyH}px`,
            backgroundPosition: `${-bodyFrame * bodyW}px 0`,
          }}
        />
      )}
      {isChugging ? (
        <>
          <div
            className={s.drinkTilt}
            style={{
              position: 'absolute',
              left: anchor.hand[0] - Math.floor(drinkW / 2),
              top: anchor.hand[1] - Math.floor(drinkH / 2),
              width: drinkW,
              height: drinkH,
              backgroundImage: 'url(/game/kvas/props/can-drink.png)',
              backgroundSize: `${drinkW * kvasManifest.canDrink.frames}px ${drinkH}px`,
              backgroundPosition: `${-crush * drinkW}px 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: drinkShiftY,
              width: bodyW,
              height: bodyH,
              backgroundImage: 'url(/game/kvas/props/grip-drink.png)',
              backgroundSize: `${bodyW}px ${bodyH}px`,
            }}
          />
        </>
      ) : (
        <>
          <div
            className={canPop ? s.canPop : ''}
            style={{
              position: 'absolute',
              left: anchor.hand[0] - Math.floor(canW / 2),
              top: anchor.hand[1] - Math.floor(canH / 2),
              width: canW,
              height: canH,
              backgroundImage: 'url(/game/kvas/props/can.png)',
              backgroundSize: `${canW * kvasManifest.can.frames}px ${canH}px`,
              backgroundPosition: `${-canFrame * canW}px 0`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: idleShiftX,
              top: idleShiftY,
              width: bodyW,
              height: bodyH,
              backgroundImage: 'url(/game/kvas/props/grip-idle.png)',
              backgroundSize: `${bodyW}px ${bodyH}px`,
            }}
          />
          {canPop && (
            <div
              className={s.fizzSpray}
              style={{
                left: anchor.hand[0] - 10,
                top: anchor.hand[1] - 28,
              }}
              aria-hidden
            />
          )}
        </>
      )}
      {isBurping && (
        <div
          className={s.burpCloud}
          style={{
            left: anchor.neck[0] - 24,
            top: anchor.neck[1] - 26,
          }}
          aria-hidden
        />
      )}
    </div>
  );
};
