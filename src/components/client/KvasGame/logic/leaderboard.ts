export type TPlayerProfile = {
  clientId: string;
  nickname: string;
};

export type TLeaderboardEntry = {
  id: string;
  nickname: string;
  cans: number;
  sips: number;
  kvasiki: number;
  rankName: string;
  bellyName: string;
  updatedAt: string;
};

export type TLeaderboardResponse = {
  entries: TLeaderboardEntry[];
  total: number;
  me: {
    rank: number;
    entry: TLeaderboardEntry;
  } | null;
};

const PROFILE_KEY = 'kvas-clicker:profile';
export const LEADERBOARD_SYNC_MS = 30000;

const createClientId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
};

export const normalizeNickname = (raw: string) =>
  raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);

export const defaultGuestNickname = (clientId: string) =>
  `Квасной_${clientId.slice(0, 4).toUpperCase()}`;

export const loadProfile = (): TPlayerProfile => {
  if (typeof window === 'undefined') {
    return { clientId: 'ssr', nickname: '' };
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TPlayerProfile>;
      if (parsed && typeof parsed.clientId === 'string' && parsed.clientId.length >= 8) {
        return {
          clientId: parsed.clientId,
          nickname: typeof parsed.nickname === 'string' ? normalizeNickname(parsed.nickname) : '',
        };
      }
    }
  } catch {
    // Ignore parse errors
  }
  const created: TPlayerProfile = { clientId: createClientId(), nickname: '' };
  saveProfile(created);
  return created;
};

export const saveProfile = (profile: TPlayerProfile) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore quota errors
  }
};

export const syncLeaderboardScore = async (
  profile: TPlayerProfile,
  payload: { cans: number; sips: number; kvasiki: number },
  beacon = false
): Promise<boolean> => {
  if (!profile.nickname || profile.nickname.length < 2) return false;
  const body = JSON.stringify({
    clientId: profile.clientId,
    nickname: profile.nickname,
    cans: payload.cans,
    sips: payload.sips,
    kvasiki: payload.kvasiki,
  });

  if (beacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      return navigator.sendBeacon('/api/kvas-leaderboard', blob);
    } catch {
      return false;
    }
  }

  try {
    const res = await fetch('/api/kvas-leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const fetchLeaderboard = async (clientId: string): Promise<TLeaderboardResponse | null> => {
  try {
    const res = await fetch(`/api/kvas-leaderboard?clientId=${encodeURIComponent(clientId)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as TLeaderboardResponse;
  } catch {
    return null;
  }
};
