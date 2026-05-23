// Philippine Learner Reference Number: 12 digits, luhn-style check digit
export function validateLRN(lrn: string): boolean {
  if (!/^\d{12}$/.test(lrn)) return false;

  // DepEd LRN check: last digit is check digit using alternating weights 1,2,1,2...
  const digits = lrn.split('').map(Number);
  const payload = digits.slice(0, 11);
  const check = digits[11];

  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    let d = payload[i] * (i % 2 === 0 ? 1 : 2);
    if (d > 9) d -= 9;
    sum += d;
  }
  const expected = (10 - (sum % 10)) % 10;
  return check === expected;
}
