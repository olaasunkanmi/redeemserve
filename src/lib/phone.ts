// Nigerian phone number utilities.
// Accepted inputs (after stripping spaces, dashes, parentheses):
//   +234XXXXXXXXXX   (E.164, 13 chars after +)
//   234XXXXXXXXXX    (12 digits)
//   0XXXXXXXXXX      (local, 11 digits, leading 0)
//   XXXXXXXXXX       (10 digits, no leading 0)
// The 10-digit "subscriber" part must start with 7, 8, or 9 (MTN/Glo/Airtel/9mobile/etc.).

export function normalizeNigerianPhone(raw: string): string {
  return raw.replace(/[\s\-()._]/g, "");
}

/** Returns the 10-digit subscriber number (e.g. "8031234567") or null if invalid. */
export function parseNigerianPhone(raw: string): string | null {
  const s = normalizeNigerianPhone(raw);
  let digits = s;
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;

  if (digits.length === 13 && digits.startsWith("234")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("234")) digits = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  else if (digits.length === 10) {/* already subscriber */}
  else return null;

  if (digits.length !== 10) return null;
  if (!/^[789]\d{9}$/.test(digits)) return null;
  return digits;
}

export function isValidNigerianPhone(raw: string): boolean {
  return parseNigerianPhone(raw) !== null;
}

/** Formats to canonical "+234 8XX XXX XXXX" or returns the input if invalid. */
export function formatNigerianPhone(raw: string): string {
  const d = parseNigerianPhone(raw);
  if (!d) return raw;
  return `+234 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** E.164 form, e.g. "+2348031234567". */
export function toE164Nigerian(raw: string): string | null {
  const d = parseNigerianPhone(raw);
  return d ? `+234${d}` : null;
}

export const NG_PHONE_HINT = "Enter a Nigerian number, e.g. 08031234567 or +2348031234567";
