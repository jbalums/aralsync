export const middleInitialOf = (middleName?: string): string =>
  middleName ? `${middleName.trim().slice(0, 1).toUpperCase()}.` : '';
