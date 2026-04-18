const STORAGE_KEY = 'datingTracker';
const SYNC_META_KEY = 'datingTrackerSyncMeta';

export function loadFromCache() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Migration: strip base64 photos from cached entries
    return parsed.map(p => {
      if (p.photos && p.photos.some(ph => ph && ph.startsWith('data:'))) {
        const { photos, ...rest } = p;
        return rest;
      }
      const { photos, ...rest } = p;
      return rest;
    });
  } catch {
    return [];
  }
}

export function saveToCache(people) {
  // Never persist photos array
  const clean = people.map(({ photos, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

export function getSyncMeta() {
  try {
    const meta = localStorage.getItem(SYNC_META_KEY);
    return meta ? JSON.parse(meta) : { lastSync: null };
  } catch {
    return { lastSync: null };
  }
}

export function setSyncMeta(meta) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}
