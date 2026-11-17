import {
  BELLY_NAMES,
  BURP_BONUS,
  BURP_CHANCE_BY_LEVEL,
  CLEANER_BONUS,
  COACH_PENALTY_MIN,
  COACH_PENALTY_RATE,
  COACH_SURVIVE_BONUS,
  CRIT_SIP_CHANCE_BY_LEVEL,
  CRIT_SIP_MULT,
  DOUBLE_SIP_CHANCE_BY_LEVEL,
  FINAL_CANS,
  HYPE_TEAMMATE_BONUS,
  MEGA_BURP_BONUS,
  MEGA_BURP_CHANCE,
  ROOM_UPGRADES,
  skillPrice,
  SKILLS,
  SLOT_COUNTS,
  STEALTH_PENALTY_REDUCTION,
  STEALTH_SURVIVE_BONUS,
} from './balance';
import { BURP_PHRASES, CAN_DONE_PHRASES, MEGA_BURP_PHRASE, OPEN_PHRASES } from './phrases';
import { pick, TRng } from './random';
import { pigeonRoll } from './events';
import {
  bellyStage,
  canRewardBase,
  canVolume,
  gain,
  rankName,
  sipBaseGain,
} from './selectors';
import { TAction, TCanPose, TEffect, TGameState, TSlotZone } from '../types';

const ZONES: TSlotZone[] = ['floor', 'bench', 'shelf'];
const POSES: TCanPose[] = ['stand', 'lie', 'crushed'];

export const createState = (playerId: number, soundOn = true): TGameState => ({
  version: 1,
  playerId,
  sips: 0,
  cans: 0,
  kvasiki: 0,
  can: { state: 'closed', left: 0 },
  skills: {
    throat: 0,
    stomach: 0,
    burp: 0,
    opener: 0,
    coach: 0,
    armband: 0,
    tattoo: 0,
    crit: 0,
    recycle: 0,
    stealth: 0,
    hype: 0,
    marathon: 0,
  },
  roomLevel: 1,
  roomItems: [1],
  slots: {
    floor: Array(SLOT_COUNTS.floor).fill(null),
    bench: Array(SLOT_COUNTS.bench).fill(null),
    shelf: Array(SLOT_COUNTS.shelf).fill(null),
  },
  pileCount: 0,
  stats: { burps: 0, megaBurps: 0, coachCaught: 0, cleanerVisits: 0, playMs: 0 },
  finalSeen: false,
  soundOn,
});

const clone = (state: TGameState): TGameState => ({
  ...state,
  can: { ...state.can },
  skills: { ...state.skills },
  roomItems: state.roomItems.slice(),
  slots: {
    floor: state.slots.floor.slice(),
    bench: state.slots.bench.slice(),
    shelf: state.slots.shelf.slice(),
  },
  stats: { ...state.stats },
});

const placeCan = (state: TGameState, rng: TRng): TGameState => {
  for (const zone of ZONES) {
    const free = state.slots[zone]
      .map((pose, index) => (pose === null ? index : -1))
      .filter((index) => index >= 0);
    if (free.length === 0) continue;
    const index = free[Math.floor(rng() * free.length)];
    const next = state.slots[zone].slice();
    next[index] = POSES[Math.floor(rng() * POSES.length)];
    return { ...state, slots: { ...state.slots, [zone]: next } };
  }
  return { ...state, pileCount: state.pileCount + 1 };
};

const shuffleCan = (state: TGameState, rng: TRng): TGameState => {
  const filled: { zone: TSlotZone; index: number }[] = [];
  const free: { zone: TSlotZone; index: number }[] = [];
  ZONES.forEach((zone) => {
    state.slots[zone].forEach((pose, index) => {
      if (pose) filled.push({ zone, index });
      else free.push({ zone, index });
    });
  });
  if (filled.length === 0) return state;
  const from = filled[Math.floor(rng() * filled.length)];
  const slots = {
    floor: state.slots.floor.slice(),
    bench: state.slots.bench.slice(),
    shelf: state.slots.shelf.slice(),
  };
  const pose = slots[from.zone][from.index];
  if (free.length === 0) {
    const others = POSES.filter((item) => item !== pose);
    slots[from.zone][from.index] = others[Math.floor(rng() * others.length)];
    return { ...state, slots };
  }
  const to = free[Math.floor(rng() * free.length)];
  slots[from.zone][from.index] = null;
  slots[to.zone][to.index] = pose;
  return { ...state, slots };
};

const same = (state: TGameState) => ({ state, effects: [] as TEffect[] });

const sip = (
  state: TGameState,
  action: Extract<TAction, { type: 'SIP' }>,
  rng: TRng
) => {
  let next = clone(state);
  const effects: TEffect[] = [];
  const bellyBefore = bellyStage(state.cans);
  const rankBefore = rankName(state.cans);

  const drink = () => {
    const doubleChance = DOUBLE_SIP_CHANCE_BY_LEVEL[next.skills.stomach ?? 0] ?? 0;
    let amount = rng() < doubleChance ? 2 : 1;
    amount = Math.min(amount, next.can.left);
    if (amount <= 0) return;
    const isDouble = amount > 1;
    const critChance = CRIT_SIP_CHANCE_BY_LEVEL[next.skills.crit ?? 0] ?? 0;
    const isCrit = !action.auto && rng() < critChance;

    next.sips += amount;
    next.can = { state: 'open', left: next.can.left - amount };
    const finished = next.can.left <= 0;
    if (finished) {
      next.cans += 1;
      next = placeCan(next, rng);
      next.can = { state: 'closed', left: 0 };
    }
    const sipGain = gain(next, sipBaseGain(next) * (isCrit ? CRIT_SIP_MULT : 1)) * amount;
    next.kvasiki += sipGain;
    effects.push({ type: 'sip', crit: isCrit, double: isDouble });
    if (finished) {
      next.kvasiki += gain(next, canRewardBase(next));
      effects.push({
        type: 'canDone',
        phrase: rng() < 0.3 ? pick(rng, CAN_DONE_PHRASES) : null,
      });
      if (pigeonRoll(rng, next.pileCount)) effects.push({ type: 'pigeon' });
    }
    if (!action.auto) {
      if (rng() < MEGA_BURP_CHANCE) {
        next = shuffleCan(next, rng);
        next.stats.megaBurps += 1;
        next.kvasiki += gain(next, MEGA_BURP_BONUS);
        effects.push({ type: 'burp', mega: true, phrase: MEGA_BURP_PHRASE });
      } else if (rng() < (BURP_CHANCE_BY_LEVEL[next.skills.burp ?? 0] ?? 0.08)) {
        next.stats.burps += 1;
        next.kvasiki += gain(next, BURP_BONUS * ((next.skills.burp ?? 0) + 1));
        effects.push({
          type: 'burp',
          mega: false,
          phrase: pick(rng, BURP_PHRASES, action.lastBurp),
        });
      }
    }
  };

  if (next.can.state === 'closed' || next.can.left <= 0) {
    next.can = { state: 'open', left: canVolume(next.skills.throat) };
    effects.push({ type: 'open', phrase: pick(rng, OPEN_PHRASES) });
    if (action.auto || next.skills.opener >= 1) drink();
  } else {
    drink();
  }

  if (action.caught && !action.auto) {
    const reduction = STEALTH_PENALTY_REDUCTION[next.skills.stealth ?? 0] ?? 0;
    const rawCut = Math.max(COACH_PENALTY_MIN, Math.floor(next.kvasiki * COACH_PENALTY_RATE));
    const cut = Math.max(5, Math.floor(rawCut * (1 - reduction)));
    next.kvasiki = Math.max(0, next.kvasiki - cut);
    next.stats.coachCaught += 1;
  }

  const bellyAfter = bellyStage(next.cans);
  if (bellyAfter !== bellyBefore) {
    effects.push({ type: 'belly', name: BELLY_NAMES[bellyAfter] });
  }
  const rankAfter = rankName(next.cans);
  if (rankAfter !== rankBefore) effects.push({ type: 'rank', name: rankAfter });
  if (state.cans < FINAL_CANS && next.cans >= FINAL_CANS) effects.push({ type: 'final' });

  return { state: next, effects };
};

export const reduceGame = (
  state: TGameState,
  action: TAction,
  rng: TRng
): { state: TGameState; effects: TEffect[] } => {
  if (action.type === 'SIP') return sip(state, action, rng);

  if (action.type === 'BUY_SKILL') {
    const skill = SKILLS.find((item) => item.id === action.id);
    if (!skill) return same(state);
    const level = state.skills[action.id] ?? 0;
    if (level >= skill.max) return same(state);
    const price = skillPrice(skill.base, level);
    if (state.kvasiki < price) return same(state);
    return {
      state: {
        ...state,
        kvasiki: state.kvasiki - price,
        skills: { ...state.skills, [action.id]: level + 1 },
      },
      effects: [],
    };
  }

  if (action.type === 'BUY_ROOM') {
    const upgrade = ROOM_UPGRADES.find((item) => item.id === action.id);
    if (!upgrade || state.roomItems.includes(action.id) || state.kvasiki < upgrade.price) {
      return same(state);
    }
    const roomItems = [...state.roomItems, action.id];
    return {
      state: {
        ...state,
        kvasiki: state.kvasiki - upgrade.price,
        roomItems,
        roomLevel: roomItems.length,
      },
      effects: [],
    };
  }

  if (action.type === 'CLEANER_CLEAN') {
    const floor = state.slots.floor.slice();
    const filled = floor
      .map((pose, index) => (pose ? index : -1))
      .filter((index) => index >= 0);
    const remove = Math.ceil(filled.length / 2);
    for (let i = 0; i < remove; i++) {
      const swap = i + Math.floor(rng() * (filled.length - i));
      [filled[i], filled[swap]] = [filled[swap], filled[i]];
      floor[filled[i]] = null;
    }
    return {
      state: {
        ...state,
        slots: { ...state.slots, floor },
        kvasiki: state.kvasiki + gain(state, CLEANER_BONUS),
        stats: { ...state.stats, cleanerVisits: state.stats.cleanerVisits + 1 },
      },
      effects: [],
    };
  }

  if (action.type === 'COACH_BONUS') {
    const stealthMult = 1 + (STEALTH_SURVIVE_BONUS[state.skills.stealth ?? 0] ?? 0);
    return {
      state: { ...state, kvasiki: state.kvasiki + gain(state, Math.round(COACH_SURVIVE_BONUS * stealthMult)) },
      effects: [],
    };
  }

  if (action.type === 'TEAMMATE_BONUS') {
    const baseBonus = HYPE_TEAMMATE_BONUS[state.skills.hype ?? 0] ?? 0;
    if (baseBonus <= 0) return same(state);
    return {
      state: { ...state, kvasiki: state.kvasiki + gain(state, baseBonus) },
      effects: [],
    };
  }

  if (action.type === 'TICK_PLAYTIME') {
    return {
      state: { ...state, stats: { ...state.stats, playMs: state.stats.playMs + action.ms } },
      effects: [],
    };
  }

  if (action.type === 'MARK_FINAL_SEEN') {
    return { state: { ...state, finalSeen: true }, effects: [] };
  }

  if (action.type === 'TOGGLE_SOUND') {
    return { state: { ...state, soundOn: !state.soundOn }, effects: [] };
  }

  if (action.type === 'RESET') {
    return { state: createState(state.playerId, state.soundOn), effects: [] };
  }

  return same(state);
};

export const isGameState = (value: unknown, playerId: number): value is TGameState => {
  if (!value || typeof value !== 'object') return false;
  const state = value as TGameState;
  return (
    state.version === 1 &&
    state.playerId === playerId &&
    state.slots?.floor?.length === SLOT_COUNTS.floor &&
    state.slots?.bench?.length === SLOT_COUNTS.bench &&
    state.slots?.shelf?.length === SLOT_COUNTS.shelf &&
    !!state.skills &&
    !!state.stats &&
    !!state.can
  );
};
