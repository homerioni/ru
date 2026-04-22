const STORAGE_KEY = 'site_update_read_ids_v1';

export function getReadSiteUpdateIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

export function markSiteUpdateAsRead(id: string) {
  const ids = new Set(getReadSiteUpdateIds());
  ids.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}
