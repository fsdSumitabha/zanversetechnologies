/* ───────────────────────────────────────────────────────────────────────────
   NEWSLETTER

   What the sign-up band (components/zan/shell/Newsletter.tsx) and
   app/api/newsletter share. The route checks a sign-up and passes it on to
   zan-workspace (server/services/newsletter.service.ts), so the key that
   zan-workspace checks stays on the server.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Whether the band is shown, from next.config.ts: true when the build could
 * see ZAN_WORKSPACE_URL and ZAN_WORKSPACE_API_KEY, and always in
 * development, where a sign-up is logged instead of sent. A production build
 * without them shows no band: a form that cannot keep an address is worse
 * than no form.
 */
export const newsletterReady = process.env.NEXT_PUBLIC_NEWSLETTER_READY === "true";

/** The band's id, so a link or a redirect can land on it. */
export const NEWSLETTER_ID = "newsletter";

/**
 * The fragments a plain post (no script running) comes back to. The route
 * redirects to the page with one of these, and the band shows the matching
 * line through CSS :target, which needs no script and works on a prerendered
 * page.
 */
export const NEWSLETTER_HASH = {
  subscribed: "newsletter-subscribed",
  invalid: "newsletter-invalid",
  notSent: "newsletter-not-sent",
} as const;

export class SubscribeError extends Error {
  constructor(readonly status: number) {
    super(`POST /api/newsletter answered ${status}`);
  }
}

/** Resolves when zan-workspace has the address. Rejects with SubscribeError, or a network error. */
export async function subscribe(email: string): Promise<void> {
  const { host, pathname, search } = window.location;
  const response = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, consent: true, page: `${host}${pathname}${search}` }),
  });
  if (!response.ok) throw new SubscribeError(response.status);
}
