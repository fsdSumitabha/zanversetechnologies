import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/* ───────────────────────────────────────────────────────────────────────────
   PHONE NUMBERS, the way zan-workspace keeps them. Server only.

   zan-workspace saves every phone in E.164 ("+919830012345") and reads it
   with libphonenumber-js (src/lib/phone.ts there). These rules are the same
   ones, so a number means the same thing on both sides:

     - A number typed without a country code belongs to the region's
       country: +91 for IN, +1 for US, +971 for AE.
     - "00" at the start is the international prefix, read as "+".
     - Invisible marks that contacts apps paste in are dropped.

   A number that is not valid is sent as typed, and zan-workspace keeps it as
   typed. A lead is never refused over its phone.

   The same file is in zanservices and zanverse-technologies.
   ─────────────────────────────────────────────────────────────────────────── */

export type WorkspaceRegion = "IN" | "US" | "AE";

/** Each region's phone country, as zan-workspace sets it (REGIONS in src/lib/region.ts there). */
const PHONE_COUNTRY: Record<WorkspaceRegion, CountryCode> = { IN: "IN", US: "US", AE: "AE" };

// Zero-width and text-direction marks.
const HIDDEN_MARKS = /[​-‏‪-‮⁦-⁩﻿]/g;

/** E.164, or null when it is not a valid number. */
export function toE164(input: string, region: WorkspaceRegion): string | null {
  const cleaned = input.replace(HIDDEN_MARKS, "").trim().replace(/^00/, "+");
  if (!cleaned || cleaned.length > 40) return null;
  // extract: false refuses text around the number, such as two numbers in one field.
  const phone = parsePhoneNumberFromString(cleaned, { defaultCountry: PHONE_COUNTRY[region], extract: false });
  return phone && !phone.ext && phone.isValid() ? phone.number : null;
}

/**
 * What a payload carries: E.164 when it can be read, otherwise as typed. The
 * caller has already required a phone, so there is always one.
 */
export function phoneForWorkspace(input: string, region: WorkspaceRegion): string {
  const typed = input.replace(HIDDEN_MARKS, "").trim();
  return toE164(typed, region) ?? typed.slice(0, 40);
}
