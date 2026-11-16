import {
  CLEANER_COOLDOWN_MS,
  CLEANER_FLOOR_FILL,
  COACH_CHANCE,
  COACH_COOLDOWN_MS,
  PIGEON_CHANCE,
} from './balance';
import { pileStage } from './selectors';
import { TRng } from './random';

export const canStartCoach = (now: number, last: number, busy: boolean) =>
  !busy && now - last >= COACH_COOLDOWN_MS;

export const coachRoll = (rng: TRng) => rng() < COACH_CHANCE;

export const canStartCleaner = (
  floorFill: number,
  now: number,
  last: number,
  busy: boolean
) => !busy && floorFill >= CLEANER_FLOOR_FILL && now - last >= CLEANER_COOLDOWN_MS;

export const pigeonRoll = (rng: TRng, pileCount: number) =>
  pileStage(pileCount) >= 1 && rng() < PIGEON_CHANCE;
