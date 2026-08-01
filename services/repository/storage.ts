const DEBOUNCE_MS = 150;
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

function isBrowser() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Debounced write: rapid successive writes to the same key collapse into one. */
export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  const existing = pendingWrites.get(key);
  if (existing) clearTimeout(existing);
  const timeout = setTimeout(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
    pendingWrites.delete(key);
  }, DEBOUNCE_MS);
  pendingWrites.set(key, timeout);
}

/** Bypasses debounce — use for operations that must persist immediately (import, reset). */
export function writeJSONSync<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  const existing = pendingWrites.get(key);
  if (existing) clearTimeout(existing);
  pendingWrites.delete(key);
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}
