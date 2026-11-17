import { isGameState, createState } from './reducer';
import { TGameState } from '../types';

const saveKey = (playerId: number) => `kvas-clicker:${playerId}`;

export const SELECTED_KEY = 'kvas-clicker:selected';

export const loadState = (playerId: number): TGameState => {
  try {
    const raw = localStorage.getItem(saveKey(playerId));
    if (!raw) return createState(playerId);
    const parsed: unknown = JSON.parse(raw);
    if (!isGameState(parsed, playerId)) return createState(playerId);
    const base = createState(playerId);
    const legacyLevel = Math.max(1, parsed.roomLevel ?? 1);
    const legacyItems = Array.from({ length: Math.min(12, legacyLevel) }, (_, i) => i + 1);
    const rawItems = Array.isArray(parsed.roomItems)
      ? Array.from(
          new Set(
            parsed.roomItems.filter(
              (id): id is number => typeof id === 'number' && Number.isInteger(id) && id >= 1
            )
          )
        )
      : legacyItems;
    const roomItems = rawItems.includes(1) ? rawItems : [1, ...rawItems];
    return {
      ...parsed,
      roomItems,
      roomLevel: roomItems.length,
      skills: { ...base.skills, ...parsed.skills },
      stats: { ...base.stats, ...parsed.stats },
    };
  } catch {
    return createState(playerId);
  }
};

export const saveState = (state: TGameState) => {
  localStorage.setItem(saveKey(state.playerId), JSON.stringify(state));
};

export const readCans = (playerId: number): number | null => {
  try {
    const raw = localStorage.getItem(saveKey(playerId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('cans' in parsed)) return null;
    return typeof parsed.cans === 'number' ? parsed.cans : null;
  } catch {
    return null;
  }
};
