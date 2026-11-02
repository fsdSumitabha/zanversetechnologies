import { site } from "@/constants/zan";

/* ───────────────────────────────────────────────────────────────────────────
   UAE PHONE NUMBERS

   The landing pages' forms take a UAE number and nothing else: the +971 is
   fixed in the field, and the visitor types the rest. People enter it however
   they carry it around, so everything that can arrive (050 123 4567,
   +971 50 123 4567, 00971501234567, a browser's autofill) is reduced to the
   national number first, and only that is judged.

   WHAT COUNTS AS VALID. A mobile is 5 and eight more digits; a landline is an
   area code (2 Abu Dhabi, 3 Al Ain, 4 Dubai, 6 the northern emirates, 7 Ras Al
   Khaimah, 9 Fujairah) and seven more.

   THE SECOND DIGIT OF A MOBILE IS NOT CHECKED, ON PURPOSE. Lists of the live
   prefixes disagree with one another and go stale as operators open new
   ranges. On a page paid for by the click, turning away a real number costs
   far more than letting a typo through: the lead still has to give an email
   address, and that is how a mistyped number gets corrected.

   Pure string handling, so it can be read on the server and in tests alike.
   ─────────────────────────────────────────────────────────────────────────── */

const MOBILE = /^5\d{8}$/;
const LANDLINE = /^[2-4679]\d{7}$/;

/** The UAE's dialling code as bare digits. */
const COUNTRY = site.dialCode.replace(/\D/g, "");

/**
 * Whatever was typed or pasted, as the national number: digits only, with any
 * country code and any trunk 0 taken off the front.
 *
 * A bare "971" is only taken for the country code when there are enough digits
 * after it to make a number, because 09 712 3456 is a real Fujairah landline
 * and typing it without its 0 gives 97123456.
 */
export function nationalDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const international = raw.trimStart().startsWith("+") || digits.startsWith(`00${COUNTRY}`);
  let rest = digits;
  if (digits.startsWith(`00${COUNTRY}`)) rest = digits.slice(COUNTRY.length + 2);
  else if (digits.startsWith(COUNTRY) && (international || digits.length >= COUNTRY.length + 8)) {
    rest = digits.slice(COUNTRY.length);
  }
  return rest.replace(/^0+/, "");
}

export function isUaePhone(national: string): boolean {
  return MOBILE.test(national) || LANDLINE.test(national);
}

function grouped(digits: string, sizes: readonly number[]): string {
  const parts: string[] = [];
  let at = 0;
  sizes.forEach((size, i) => {
    if (at >= digits.length) return;
    // The last group takes whatever is left, so extra digits stay visible for
    // the visitor to notice instead of quietly going missing.
    const end = i === sizes.length - 1 ? digits.length : at + size;
    parts.push(digits.slice(at, end));
    at = end;
  });
  return parts.join(" ");
}

/** As the number is said aloud: 50 123 4567, or 4 123 4567 for a landline. */
export function formatUaePhone(national: string): string {
  if (national.startsWith("5")) return grouped(national, [2, 3, 4]);
  if (/^[2-4679]/.test(national)) return grouped(national, [1, 3, 4]);
  return national;
}

/** +971501234567: what a dialler and Google's Enhanced Conversions expect. */
export function toE164(national: string): string {
  return `${site.dialCode}${national}`;
}

/** +971 50 123 4567: what a person reads in the inbox. */
export function toDisplay(national: string): string {
  return `${site.dialCode} ${formatUaePhone(national)}`;
}
