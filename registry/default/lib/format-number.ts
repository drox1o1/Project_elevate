/**
 * Shared Intl number helpers for DUKU fintech components.
 * Grouping styles: "us" 1,234,567.89 · "eu" 1.234.567,89 ·
 * "in" 12,34,567.89 (Indian lakh/crore) · "space" 1 234 567.89 · "none".
 */

export type NumberFormatStyle = "us" | "eu" | "in" | "space" | "none";

export function formatNumber(
  value: number,
  locale = "en-US",
  decimals = 0
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

const SEPARATORS: Record<
  Exclude<NumberFormatStyle, "none">,
  { group: string; decimal: string }
> = {
  us: { group: ",", decimal: "." },
  eu: { group: ".", decimal: "," },
  in: { group: ",", decimal: "." },
  space: { group: " ", decimal: "." },
};

/** Group an integer-digit string per style ("1234567" → "12,34,567" for "in"). */
export function groupDigits(digits: string, style: NumberFormatStyle): string {
  if (style === "none" || digits.length === 0) return digits;
  const { group } = SEPARATORS[style];
  if (style === "in") {
    if (digits.length <= 3) return digits;
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, group) + group + last3;
  }
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, group);
}

/**
 * Format a raw typed string ("1234.5") as-you-type for the given style.
 * Preserves a trailing decimal separator while the user is mid-entry.
 */
export function formatAsYouType(
  raw: string,
  style: NumberFormatStyle
): string {
  if (raw === "") return "";
  const decimal = style === "none" ? "." : SEPARATORS[style].decimal;
  const [intPart = "", ...decParts] = raw.split(".");
  const hasDecimal = raw.includes(".");
  const grouped = groupDigits(intPart, style);
  if (!hasDecimal) return grouped;
  return (grouped || "0") + decimal + decParts.join("");
}

/** Strip grouping/decoration back to a plain "1234.5" string. */
export function parseFormatted(
  formatted: string,
  style: NumberFormatStyle
): string {
  const decimal = style === "none" ? "." : SEPARATORS[style].decimal;
  let out = "";
  for (const ch of formatted) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === decimal && !out.includes(".")) out += ".";
  }
  return out;
}

/** Count digit characters left of `index` in `text` (caret bookkeeping). */
export function countDigitsBefore(text: string, index: number): number {
  let n = 0;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] >= "0" && text[i] <= "9") n++;
  }
  return n;
}

/**
 * Restore the caret so the same number of digits sit to its left as
 * before a reformat. The hard part of as-you-type formatting.
 */
export function restoreCaret(
  input: HTMLInputElement,
  digitsBefore: number
): void {
  const text = input.value;
  let seen = 0;
  let pos = text.length;
  for (let i = 0; i < text.length; i++) {
    if (seen >= digitsBefore) {
      pos = i;
      break;
    }
    if (text[i] >= "0" && text[i] <= "9") seen++;
  }
  if (seen < digitsBefore) pos = text.length;
  input.setSelectionRange(pos, pos);
}
