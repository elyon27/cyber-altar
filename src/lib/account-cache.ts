// Cached personal data belongs to one Auth identity, even when emails are reused.
function personalKey(key: string) {
  if (/^cyber[_-]altar/.test(key)) return true;
  try {
    const parts = JSON.parse(key);
    return Array.isArray(parts) && typeof parts[0] === 'string' && /^cyber[_-]altar/.test(parts[0]);
  } catch { return false; }
}

export function clearAccountCache() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (personalKey(key)) storage.removeItem(key);
    }
  }
}

export function scopeAccountCache(userId: string) {
  if (localStorage.getItem('cyber_altar_cache_owner') === userId) return;
  clearAccountCache();
  localStorage.setItem('cyber_altar_cache_owner', userId);
}
