const KEY = 'aralsync.deviceId';

function randomId(): string {
  const c = (globalThis.crypto as Crypto | undefined);
  if (c?.randomUUID) return c.randomUUID();
  // Fallback (older browsers): 16 random bytes hex-encoded.
  if (c?.getRandomValues) {
    const bytes = c.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // localStorage blocked — last-resort ephemeral id (won't persist).
    return randomId();
  }
}

export function getUserAgent(): string {
  return typeof navigator !== 'undefined' ? navigator.userAgent : '';
}
