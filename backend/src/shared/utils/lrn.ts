export function validateLRN(lrn: string): boolean {
  return /^\d{12}$/.test(lrn);
}

export function formatLRN(lrn: string): string {
  if (!validateLRN(lrn)) {
    throw new Error('Invalid LRN: must be exactly 12 numeric digits');
  }
  return lrn;
}
