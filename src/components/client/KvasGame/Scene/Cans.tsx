'use client';

import { memo, useEffect, useRef } from 'react';
import { kvasManifest } from '../manifest';
import { mulberry32 } from '../logic/random';
import { pileStage } from '../logic/selectors';
import { TCanPose, TGameState, TSlotZone } from '../types';
import s from './styles.module.scss';

const [SCENE_W, SCENE_H] = kvasManifest.scene;
const POSE_FRAME: Record<TCanPose, number> = { stand: 6, lie: 7, crushed: 8 };
const UPPER_ZONES: TSlotZone[] = ['bench', 'shelf'];

const SLOT_CAN_W = 20;
const SLOT_CAN_H = 38;
const CAN_SHEET_W = SLOT_CAN_W * kvasManifest.can.frames;

const [CRUSH_W, CRUSH_H] = kvasManifest.canCrushed.cell;
const CRUSH_FRAMES = kvasManifest.canCrushed.frames;
const [SHEET_CRUSH_W, SHEET_CRUSH_H] = kvasManifest.canCrushed.sheetCell;

const [PILE_W, PILE_H] = kvasManifest.pile.cell;
const PILE_SHEET_W = PILE_W * kvasManifest.pile.frames;

const MAX_PHYSICS_CANS = 36;
const CAN_RADIUS = 6.4;
const GRAVITY = 560;
const MOUND_CENTERS = [64, 206] as const;
const DEG_TO_RAD = Math.PI / 180;

type TCanBody = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  variant: number;
  mound: 0 | 1;
  stillTicks: number;
  sleeping: boolean;
};

const floorAt = (x: number) => {
  const centerDist = Math.abs(x - 135) / 135;
  return 424 - centerDist * 4;
};

const createTossedBody = (id: number, rng: () => number, mound: 0 | 1): TCanBody => {
  const targetX = MOUND_CENTERS[mound] + (rng() - 0.5) * 24;
  const startX = 88 + (rng() - 0.5) * 8;
  const startY = 290 + (rng() - 0.5) * 6;
  const flightTime = 0.54 + rng() * 0.12;
  const vx = (targetX - startX) / flightTime;
  const vy = -95 - rng() * 55;
  return {
    id,
    x: startX,
    y: startY,
    vx,
    vy,
    angle: (rng() - 0.5) * 60,
    vAngle: (mound === 0 ? -1 : 1) * (240 + rng() * 240),
    variant: Math.floor(rng() * CRUSH_FRAMES),
    mound,
    stillTicks: 0,
    sleeping: false,
  };
};

const createSettledSeedBody = (id: number, rng: () => number, mound: 0 | 1): TCanBody => {
  const cx = MOUND_CENTERS[mound];
  const spread = 24;
  const x = cx + (rng() - 0.5) * spread * 2;
  const y = 372 - Math.floor(id / 3) * 11 - rng() * 12;
  return {
    id,
    x,
    y,
    vx: (cx - x) * 0.9 + (rng() - 0.5) * 16,
    vy: 15 + rng() * 25,
    angle: (rng() - 0.5) * 70,
    vAngle: (rng() - 0.5) * 90,
    variant: Math.floor(rng() * CRUSH_FRAMES),
    mound,
    stillTicks: 0,
    sleeping: false,
  };
};

const stepPhysics = (bodies: TCanBody[], dt: number) => {
  let anyActive = false;

  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b.sleeping) continue;
    anyActive = true;

    b.vy += GRAVITY * dt;
    b.vx *= 0.994;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += b.vAngle * dt;

    if (b.x < 34) {
      b.x = 34;
      b.vx = Math.abs(b.vx) * 0.45;
      b.vAngle *= -0.5;
    } else if (b.x > 236) {
      b.x = 236;
      b.vx = -Math.abs(b.vx) * 0.45;
      b.vAngle *= -0.5;
    }

    const fy = floorAt(b.x) - CAN_RADIUS;
    if (b.y >= fy) {
      b.y = fy;
      if (b.vy > 36) {
        b.vy = -b.vy * 0.3;
        b.vx *= 0.72;
        b.vAngle = b.vx * 1.5;
      } else {
        b.vy = 0;
        b.vx *= 0.78;
        b.vAngle *= 0.68;
      }
      const target = MOUND_CENTERS[b.mound];
      const dxMound = target - b.x;
      if (Math.abs(dxMound) > 10 && Math.abs(b.vx) > 2) {
        b.vx += Math.sign(dxMound) * 120 * dt;
      }
    }
  }

  const minDist = CAN_RADIUS * 2.02;
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        if (a.sleeping && b.sleeping) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        if (distSq >= minDist * minDist) continue;

        const dist = Math.sqrt(distSq) || 0.01;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;

        const aWeight = a.sleeping ? 0.12 : 0.5;
        const bWeight = b.sleeping ? 0.12 : 0.5;
        const totalW = aWeight + bWeight || 1;
        a.x -= nx * overlap * (aWeight / totalW);
        a.y -= ny * overlap * (aWeight / totalW);
        b.x += nx * overlap * (bWeight / totalW);
        b.y += ny * overlap * (bWeight / totalW);

        const fa = floorAt(a.x) - CAN_RADIUS;
        if (a.y > fa) a.y = fa;
        const fb = floorAt(b.x) - CAN_RADIUS;
        if (b.y > fb) b.y = fb;

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const vn = rvx * nx + rvy * ny;

        if (vn < 0) {
          const jImp = -(1 + 0.24) * vn * 0.5;
          if (!a.sleeping) {
            a.vx -= jImp * nx;
            a.vy -= jImp * ny;
          }
          if (!b.sleeping) {
            b.vx += jImp * nx;
            b.vy += jImp * ny;
          }

          const tx = -ny;
          const ty = nx;
          const vt = rvx * tx + rvy * ty;
          const ft = vt * 0.32;
          if (!a.sleeping) {
            a.vx += ft * tx;
            a.vy += ft * ty;
            a.vAngle = a.vx * 1.1;
          }
          if (!b.sleeping) {
            b.vx -= ft * tx;
            b.vy -= ft * ty;
            b.vAngle = b.vx * 1.1;
          }
        }
      }
    }
  }

  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    if (b.sleeping) continue;
    const speedSq = b.vx * b.vx + b.vy * b.vy;
    const fy = floorAt(b.x) - CAN_RADIUS;
    const onFloor = b.y >= fy - 0.8;
    let supported = onFloor;
    if (!supported) {
      for (let j = 0; j < bodies.length; j++) {
        if (i === j) continue;
        const o = bodies[j];
        if (o.y <= b.y + 1.5) continue;
        const dx = b.x - o.x;
        const dy = b.y - o.y;
        if (dx * dx + dy * dy <= (minDist + 1.4) * (minDist + 1.4)) {
          supported = true;
          break;
        }
      }
    }
    if (supported && speedSq < 28 && Math.abs(b.vAngle) < 35) {
      b.stillTicks += 1;
      if (b.stillTicks >= 10) {
        b.vx = 0;
        b.vy = 0;
        b.vAngle = 0;
        b.sleeping = true;
      }
    } else {
      b.stillTicks = 0;
    }
  }

  return anyActive;
};

const drawCans = (
  canvas: HTMLCanvasElement | null,
  img: HTMLImageElement | null,
  bodies: TCanBody[]
) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  if (!img || !img.complete || img.naturalWidth === 0 || bodies.length === 0) return;
  ctx.imageSmoothingEnabled = false;

  const sorted = bodies.slice().sort((a, b) => a.y - b.y);
  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i];
    ctx.save();
    ctx.translate(Math.round(b.x), Math.round(b.y));
    ctx.rotate(b.angle * DEG_TO_RAD);
    // Crisp dark contact shadow under can without expensive CSS filter
    ctx.fillStyle = 'rgba(10, 6, 4, 0.45)';
    ctx.fillRect(-CRUSH_W / 2 + 1, CRUSH_H / 2 - 3, CRUSH_W - 2, 3);
    ctx.drawImage(
      img,
      b.variant * SHEET_CRUSH_W,
      0,
      SHEET_CRUSH_W,
      SHEET_CRUSH_H,
      -CRUSH_W / 2,
      -CRUSH_H / 2,
      CRUSH_W,
      CRUSH_H
    );
    ctx.restore();
  }
};

const canStyle = (frame: number, x: number, y: number) => ({
  left: x,
  top: y,
  width: SLOT_CAN_W,
  height: SLOT_CAN_H,
  backgroundImage: 'url(/game/kvas/props/can.png)',
  backgroundSize: `${CAN_SHEET_W}px ${SLOT_CAN_H}px`,
  backgroundPosition: `${-frame * SLOT_CAN_W}px 0`,
});

type CansProps = {
  cans: number;
  pileCount: number;
  floorCount: number;
  megaBurps: number;
  benchSlots: TGameState['slots']['bench'];
  shelfSlots: TGameState['slots']['shelf'];
  crashImpulse?: number;
};

export const Cans = memo(function Cans({
  cans,
  pileCount,
  floorCount,
  megaBurps,
  benchSlots,
  shelfSlots,
  crashImpulse = 0,
}: CansProps) {
  const stage = pileStage(pileCount);
  const targetMoundCount = Math.min(MAX_PHYSICS_CANS, floorCount + pileCount);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const bodiesRef = useRef<TCanBody[]>([]);
  const nextIdRef = useRef(1);
  const initDoneRef = useRef(false);
  const prevStateRef = useRef({ cans, floorCount, megaBurps, crashImpulse });
  const rngRef = useRef(mulberry32(7731));
  const rafRef = useRef<number | null>(null);

  const startLoop = () => {
    if (rafRef.current !== null) return;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.032, Math.max(0.008, (now - last) / 1000));
      last = now;
      const active = stepPhysics(bodiesRef.current, dt);
      drawCans(canvasRef.current, spriteRef.current, bodiesRef.current);
      if (active) {
        rafRef.current = window.requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = window.requestAnimationFrame(frame);
  };

  if (!initDoneRef.current) {
    initDoneRef.current = true;
    const seeded: TCanBody[] = [];
    for (let i = 0; i < targetMoundCount; i++) {
      const mound = (i % 2) as 0 | 1;
      seeded.push(createSettledSeedBody(nextIdRef.current++, rngRef.current, mound));
    }
    for (let step = 0; step < 190; step++) {
      if (!stepPhysics(seeded, 1 / 60)) break;
    }
    bodiesRef.current = seeded;
  }

  useEffect(() => {
    const img = new Image();
    img.src = '/game/kvas/props/can-crushed.png';
    img.onload = () => {
      spriteRef.current = img;
      drawCans(canvasRef.current, img, bodiesRef.current);
    };
    spriteRef.current = img;
    if (img.complete) {
      drawCans(canvasRef.current, img, bodiesRef.current);
    }
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const prev = prevStateRef.current;
    const bodies = bodiesRef.current;
    let changed = false;

    if (cans === 0 && bodies.length > 0) {
      bodiesRef.current = [];
      prevStateRef.current = { cans: 0, floorCount: 0, megaBurps: 0, crashImpulse };
      drawCans(canvasRef.current, spriteRef.current, []);
      return;
    }

    if (floorCount < prev.floorCount) {
      const removeCount = Math.min(bodies.length, prev.floorCount - floorCount);
      if (removeCount > 0) {
        bodies.sort((a, b) => a.y - b.y);
        bodies.splice(0, removeCount);
        bodies.forEach((b) => {
          b.sleeping = false;
          b.stillTicks = 0;
        });
        changed = true;
      }
    }

    if (cans > prev.cans) {
      const added = Math.min(3, cans - prev.cans);
      for (let i = 0; i < added; i++) {
        const id = nextIdRef.current++;
        const mound = ((id + Math.floor(rngRef.current() * 2)) % 2) as 0 | 1;
        if (bodies.length >= MAX_PHYSICS_CANS) {
          bodies.sort((a, b) => b.y - a.y);
          bodies.shift();
        }
        bodies.push(createTossedBody(id, rngRef.current, mound));
        changed = true;
      }
    }

    if (megaBurps > prev.megaBurps && bodies.length > 0) {
      bodies.forEach((b) => {
        b.sleeping = false;
        b.stillTicks = 0;
        b.vy -= 105 + rngRef.current() * 65;
        b.vx += (b.x < 135 ? -1 : 1) * (35 + rngRef.current() * 55);
        b.vAngle += (rngRef.current() - 0.5) * 400;
      });
      changed = true;
    }

    if (crashImpulse > prev.crashImpulse && bodies.length > 0) {
      bodies.forEach((b) => {
        if (b.x < 135) {
          b.sleeping = false;
          b.stillTicks = 0;
          b.vy -= 120 + rngRef.current() * 80;
          b.vx += 45 + rngRef.current() * 75;
          b.vAngle += (rngRef.current() - 0.5) * 480;
        }
      });
      changed = true;
    }

    prevStateRef.current = { cans, floorCount, megaBurps, crashImpulse };

    if (changed) startLoop();
  }, [cans, floorCount, megaBurps, crashImpulse]);

  const zones: { zone: TSlotZone; list: TGameState['slots']['bench'] }[] = [
    { zone: 'bench', list: benchSlots },
    { zone: 'shelf', list: shelfSlots },
  ];

  return (
    <>
      {stage > 0 && (
        <div
          className={`${s.sprite} ${s.pile}`}
          style={{
            left: kvasManifest.pilePosition[0],
            top: kvasManifest.pilePosition[1],
            width: PILE_W,
            height: PILE_H,
            backgroundImage: 'url(/game/kvas/props/pile.png)',
            backgroundSize: `${PILE_SHEET_W}px ${PILE_H}px`,
            backgroundPosition: `${-(stage - 1) * PILE_W}px 0`,
          }}
        />
      )}
      {UPPER_ZONES.map((zone, zIdx) =>
        zones[zIdx].list.map((pose, index) => {
          if (!pose) return null;
          const point = kvasManifest.slots[zone][index];
          if (!point) return null;
          const zoneClass = zone === 'bench' ? s.benchCan : s.shelfCan;
          return (
            <div
              key={`${zone}-${index}`}
              className={`${s.sprite} ${zoneClass}`}
              style={canStyle(POSE_FRAME[pose], point[0], point[1])}
            />
          );
        })
      )}
      <canvas
        ref={canvasRef}
        width={SCENE_W}
        height={SCENE_H}
        className={`${s.sprite} ${s.floorCan}`}
      />
    </>
  );
});
