/* ───────────────────────────────────────────────────────────────────────────
   NEWSLETTER

   The words of the sign-up band above the footer
   (components/zan/shell/Newsletter.tsx), and the consent it records. Safe for
   the browser: nothing here is a secret.

   THE CONSENT WORDING IS A RECORD. The route (app/api/newsletter) sends
   `text` and `version` to zan-workspace with every sign-up, as the proof of
   what the person agreed to. The text is taken from here on the
   server, never from the request, so a caller cannot record words nobody was
   shown. Change the text and you must change the version, so older sign-ups
   still point at the wording they saw.
   ─────────────────────────────────────────────────────────────────────────── */

import { site } from "./zan";

export const newsletter = {
  eyebrow: "Newsletter",
  /** Two lines; the second is set in the accent. */
  title: ["Smarter digital growth,", "one email at a time."],
  /**
   * "About once a month" is a promise to the reader. Change it if the
   * newsletter goes out more often.
   */
  lead: "Practical notes from our projects in Dubai and across the UAE: what worked in web, apps, AI and marketing, and what we would do differently. About one email a month.",
  points: [
    { id: "projects", label: "Lessons from real projects" },
    { id: "market", label: "UAE market insight" },
    { id: "privacy", label: "No spam. Unsubscribe anytime." },
  ],
  emailLabel: "Your email",
  emailPlaceholder: "you@company.com",
  submit: "Subscribe",
  sending: "Subscribing",
  /** Under the form: what the address is used for, and how to leave. */
  notice:
    "We use your email address only to send this newsletter, and we never sell it. Every email has an unsubscribe link.",
  success: {
    title: "You are on the list.",
    body: "Thank you. Our next newsletter goes to the address you gave. You can unsubscribe from any email we send.",
  },
} as const;

/**
 * What the box next to the form says, word for word, and which version of the
 * words it is. Unticked by default, and the form cannot be sent without it.
 *
 * Why each part is there:
 *   - "I am 18 or over": the site is not meant for children (Privacy Policy
 *     §10), and India's DPDP Act needs a parent's consent for anyone under 18.
 *     zan-workspace, where the address is stored, works under that Act.
 *   - "receive the … newsletter by email": consent has to name its purpose.
 *   - "unsubscribe at any time": the person is told how to take it back, at
 *     the moment they give it.
 */
export const NEWSLETTER_CONSENT = {
  version: "2026-11-25",
  text: "I am 18 or over, and I agree to receive the Zan Verse Technologies newsletter by email. I can unsubscribe at any time.",
} as const;

/**
 * Where the address is stored, in zan-workspace's own words: its region code
 * for the UAE, and this form's id. zan-workspace makes the source name and
 * the tags itself, from this site's key: "form:zanversetechnologies.com/
 * newsletter_form", and the tags "newsletter" and "zanversetechnologies.com".
 */
export const NEWSLETTER_RECORD = {
  region: site.region,
  form: "newsletter_form",
} as const;
