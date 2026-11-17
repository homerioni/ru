import {
  ARMBAND_BONUS_BY_LEVEL,
  BELLY_MULT,
  BELLY_THRESHOLDS,
  CAN_REWARD,
  CAN_VOLUME_BY_LEVEL,
  HYPE_VOICE_BONUS_CHANCE,
  MARATHON_BASE_BONUS,
  PILE_THRESHOLDS,
  RANKS,
  RECYCLE_BONUS_BY_LEVEL,
  ROOM_UPGRADES,
  ROOM_UPGRADE_BONUS,
  SIP_REWARD,
  SKILLS,
  skillPrice,
  TATTOO_BONUS_BY_LEVEL,
  VOICE_PHRASE_CHANCE,
} from './balance';
import { TGameState } from '../types';

export const bellyStage = (cans: number) => {
  let stage = 0;
  BELLY_THRESHOLDS.forEach((threshold, index) => {
    if (cans >= threshold) stage = index;
  });
  return stage;
};

export const pileStage = (pileCount: number) => {
  let stage = 0;
  PILE_THRESHOLDS.forEach((threshold, index) => {
    if (pileCount >= threshold) stage = index;
  });
  return stage;
};

export const rankName = (cans: number) => {
  let name = RANKS[0].name;
  RANKS.forEach((rank) => {
    if (cans >= rank.cans) name = rank.name;
  });
  return name;
};

export const canVolume = (throatLevel: number) =>
  CAN_VOLUME_BY_LEVEL[Math.min(CAN_VOLUME_BY_LEVEL.length - 1, throatLevel ?? 0)];

export const multiplier = (state: TGameState) => {
  const belly = BELLY_MULT[bellyStage(state.cans)];
  const extraRoom = state.roomItems.filter((id) => id !== 1).length;
  const room = 1 + ROOM_UPGRADE_BONUS * extraRoom;
  const armband =
    1 + ARMBAND_BONUS_BY_LEVEL[Math.min(ARMBAND_BONUS_BY_LEVEL.length - 1, state.skills.armband ?? 0)];
  const tattoo =
    1 + TATTOO_BONUS_BY_LEVEL[Math.min(TATTOO_BONUS_BY_LEVEL.length - 1, state.skills.tattoo ?? 0)];
  return belly * room * armband * tattoo;
};

export const sipBaseGain = (state: TGameState) =>
  SIP_REWARD +
  MARATHON_BASE_BONUS[Math.min(MARATHON_BASE_BONUS.length - 1, state.skills.marathon ?? 0)];

export const canRewardBase = (state: TGameState) =>
  Math.round(
    CAN_REWARD *
      (1 + RECYCLE_BONUS_BY_LEVEL[Math.min(RECYCLE_BONUS_BY_LEVEL.length - 1, state.skills.recycle ?? 0)])
  );

export const voiceTriggerChance = (state: TGameState) =>
  VOICE_PHRASE_CHANCE +
  HYPE_VOICE_BONUS_CHANCE[Math.min(HYPE_VOICE_BONUS_CHANCE.length - 1, state.skills.hype ?? 0)];

export const canCrushStage = (state: TGameState) => {
  if (state.can.state !== 'open') return 0;
  const volume = canVolume(state.skills.throat);
  const ratio = state.can.left / Math.max(1, volume);
  if (ratio > 0.68) return 0;
  if (ratio > 0.42) return 1;
  if (ratio > 0.18) return 2;
  return 3;
};

export const gain = (state: TGameState, base: number) =>
  Math.max(1, Math.floor(base * multiplier(state)));

export const canBuyAny = (state: TGameState) => {
  const canSkill = SKILLS.some((skill) => {
    const level = state.skills[skill.id] ?? 0;
    return level < skill.max && state.kvasiki >= skillPrice(skill.base, level);
  });
  if (canSkill) return true;
  return ROOM_UPGRADES.some(
    (item) => !state.roomItems.includes(item.id) && state.kvasiki >= item.price
  );
};
