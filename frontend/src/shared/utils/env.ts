const REQUIRED_VARS = [
  'VITE_API_URL',
  'VITE_SOCKET_URL',
  'VITE_APP_VERSION',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}. Check frontend/.env`);
  }
}
