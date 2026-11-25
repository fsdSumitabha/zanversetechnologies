"use client";

import { Fragment, useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { Check, Lightbulb, Loader2, MailOpen, MapPin, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { NEWSLETTER_CONSENT, newsletter } from "@/constants/newsletter";
import { Reveal } from "@/components/zan/page/Reveal";
import { SiteLink } from "@/components/zan/services/SiteLinks";
import { Button } from "@/components/zan/ui/Button";
import { Eyebrow } from "@/components/zan/ui/Eyebrow";
import { trackNewsletterSignup } from "@/lib/analytics";
import { EMAIL_PATTERN, scriptValidates, TRAP_FIELD } from "@/lib/leads";
import { NEWSLETTER_HASH, NEWSLETTER_ID, newsletterReady, subscribe, SubscribeError } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────────────────────────────────
   The newsletter band, above the footer on every page of the site (not the
   landing pages, which have no footer and keep to one action).

   A navy panel on the page ground, so it reads as its own close before the
   footer's lighter CTA strip: the pitch on the left, the sign-up in a frosted
   card on the right, over two slow orbits and a cyan bloom.

   It posts to /api/newsletter, which checks the address and the consent and
   passes the sign-up to zan-workspace. What makes it a lawful sign-up:

     - The consent box starts unticked and the form will not send without it.
       Its words are NEWSLETTER_CONSENT, which the route records with the
       sign-up, version and all.
     - The notice under it says what the address is for, that it is never
       sold, and how to leave, with the Privacy Policy one tap away.
     - Nothing personal reaches the dataLayer (trackNewsletterSignup).

   It behaves like the enquiry form (components/zan/contact/EnquiryForm.tsx):
   the browser's own constraint checks with the messages written out under the
   fields, one live region, a honeypot, and a real <form> that still works with
   no script. Then the route answers with a redirect back to the page and a
   fragment, and the matching line below shows through :target.
   ─────────────────────────────────────────────────────────────────────────── */

type Field = "email" | "consent";
type State = "idle" | "sending" | "tooMany" | "failed" | "done";

const FIELDS: readonly Field[] = ["email", "consent"];

const POINT_ICONS: Record<(typeof newsletter.points)[number]["id"], LucideIcon> = {
  projects: Lightbulb,
  market: MapPin,
  privacy: ShieldCheck,
};

/** The cyan, on the navy. The dark theme's panel is cyan, so there it is the panel's text colour. */
const ON_PANEL_ACCENT = "text-accent dark:text-action-foreground";

/** A message on the navy: a light chip, so the danger colour keeps its contrast. */
const NOTE_CHIP =
  "flex w-fit max-w-full items-start gap-2 rounded-xl bg-surface px-3 py-2 text-small text-foreground shadow-lift";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/* The title's line rise, as SectionHeading plays it. SectionHeading itself is
   not used here: its eyebrow and lead are coloured for the page ground. */
const line: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({ y: "0%", transition: { duration: 1.1, ease: EASE, delay: 0.06 + i * 0.08 } }),
};

function messageFor(el: HTMLInputElement): string | undefined {
  if (el.validity.valid) return undefined;
  if (el.name === "consent") return "Tick the box to agree, so we can send you the newsletter.";
  return el.validity.valueMissing
    ? "Enter your email address."
    : "That email address looks incomplete. Check it and try again.";
}

function isField(el: unknown): el is HTMLInputElement {
  return el instanceof HTMLInputElement && FIELDS.includes(el.name as Field);
}

/** Two orbits, a dot on each, a dot grid and two blooms. Decorative. */
function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <span
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--color-action-foreground) 20%, transparent) 1px, transparent 1.25px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 65% 75% at 18% 30%, black, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 75% at 18% 30%, black, transparent 72%)",
        }}
      />
      <span className="absolute -top-36 -right-28 size-[28rem] rounded-full bg-accent/25 blur-3xl" />
      <span className="absolute -bottom-44 -left-28 size-[24rem] rounded-full bg-accent/10 blur-3xl" />
      <span className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />

      {/* Centred behind the card from 1024px; off to the side on a phone. */}
      <div className="absolute top-1/2 -right-64 size-[46rem] -translate-y-1/2 sm:-right-48 lg:-right-36">
        <svg viewBox="0 0 100 100" fill="none" className="absolute inset-0 size-full text-action-foreground">
          {[48, 38, 28].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.15" />
          ))}
        </svg>
        <div className="absolute inset-0 motion-safe:animate-[spin_60s_linear_infinite]">
          <span className="absolute top-[2%] left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_18px_4px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]" />
        </div>
        <div className="absolute inset-[10%] motion-safe:animate-[spin_40s_linear_infinite_reverse]">
          <span className="absolute bottom-[2.5%] left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-action-foreground/70" />
        </div>
      </div>
    </div>
  );
}

export function Newsletter() {
  const uid = useId();
  const id = (f: Field) => `${uid}-${f}`;

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<State>("idle");
  /** The live region's text. */
  const [spoken, setSpoken] = useState("");
  const alertRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state === "tooMany" || state === "failed") alertRef.current?.scrollIntoView({ block: "nearest" });
    // The form is gone, so focus goes to what replaced it rather than to <body>.
    if (state === "done") doneRef.current?.focus({ preventScroll: true });
  }, [state]);

  // A region only speaks when its text changes, so the same words again get a
  // space no one can see.
  const say = (text: string) => setSpoken((prev) => (prev === text ? `${text} ` : text));

  const check = (el: HTMLInputElement) => {
    const name = el.name as Field;
    const msg = messageFor(el);
    setErrors((prev) => (prev[name] === msg ? prev : { ...prev, [name]: msg }));
    return msg;
  };

  // The address is judged once the visitor leaves it with something in it,
  // then again as they type, so the message clears the moment it is fixed.
  const onBlur = (e: FocusEvent<HTMLFormElement>) => {
    const el = e.target;
    if (!isField(el) || el.type === "checkbox") return;
    if (el.value === "" && !errors.email) return;
    const msg = check(el);
    if (msg) say(msg);
  };
  const onChange = (e: FormEvent<HTMLFormElement>) => {
    const el = e.target;
    if (isField(el) && errors[el.name as Field]) check(el);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Read now: "sending" disables the fields, and FormData skips disabled ones.
    const data = new FormData(form);

    const next: Partial<Record<Field, string>> = {};
    let firstInvalid: HTMLInputElement | null = null;
    for (const f of FIELDS) {
      const el = form.elements.namedItem(f);
      if (!(el instanceof HTMLInputElement)) continue;
      const msg = messageFor(el);
      if (msg) {
        next[f] = msg;
        firstInvalid ??= el;
      }
    }
    setErrors(next);
    if (firstInvalid) {
      setState("idle");
      say(next.email ?? next.consent ?? "");
      firstInvalid.focus();
      return;
    }

    // Honeypot: answered like a real sign-up, so a bot learns nothing.
    if (String(data.get(TRAP_FIELD) ?? "").trim()) {
      setState("done");
      return;
    }

    setState("sending");
    setSpoken("");
    try {
      await subscribe(String(data.get("email") ?? "").trim());
      trackNewsletterSignup();
      say(newsletter.success.title);
      setState("done");
    } catch (err) {
      // The cause is in the route's log. This says which request to look for.
      console.error("[Newsletter] sign-up failed", err);
      setState(err instanceof SubscribeError && err.status === 429 ? "tooMany" : "failed");
    }
  };

  if (!newsletterReady) return null;

  const busy = state === "sending";
  const invalid = (f: Field) => (errors[f] ? { "aria-invalid": true, "aria-describedby": `${id(f)}-error` } : {});
  const titleId = `${uid}-title`;

  return (
    <section
      id={NEWSLETTER_ID}
      aria-labelledby={titleId}
      className="relative scroll-mt-nav border-t border-border bg-canvas py-[clamp(3.5rem,2.6rem+3.8vw,6rem)]"
    >
      <div className="container-zan">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-action-gradient px-6 py-10 text-action-foreground shadow-float sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <Backdrop />

          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            {/* ── The pitch ─────────────────────────────────────────────── */}
            <div className="lg:col-span-6 xl:col-span-7">
              <Reveal>
                <Eyebrow tone="onBrand">{newsletter.eyebrow}</Eyebrow>
              </Reveal>

              <motion.h2
                id={titleId}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="mt-5 font-display text-h1 text-balance"
              >
                {newsletter.title.map((text, i) => (
                  <Fragment key={text}>
                    {i > 0 && " "}
                    <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                      <motion.span
                        data-reveal
                        variants={line}
                        custom={i}
                        className={cn("block", i === newsletter.title.length - 1 && ON_PANEL_ACCENT)}
                      >
                        {text}
                      </motion.span>
                    </span>
                  </Fragment>
                ))}
              </motion.h2>

              <Reveal delay={0.15}>
                <p className="mt-6 max-w-[52ch] text-lead text-action-foreground/80">{newsletter.lead}</p>
              </Reveal>

              <Reveal delay={0.25}>
                <ul className="mt-8 flex flex-wrap gap-2.5">
                  {newsletter.points.map((p) => {
                    const Icon = POINT_ICONS[p.id];
                    return (
                      <li
                        key={p.id}
                        className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-action-foreground/15 bg-action-foreground/[0.06] py-1.5 pr-4 pl-1.5 text-small font-medium text-action-foreground/90"
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-action-foreground/10">
                          <Icon aria-hidden="true" className={cn("size-3.5", ON_PANEL_ACCENT)} strokeWidth={2} />
                        </span>
                        {p.label}
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            </div>

            {/* ── The sign-up ───────────────────────────────────────────── */}
            <Reveal delay={0.1} className="lg:col-span-6 xl:col-span-5">
              <div className="relative rounded-3xl border border-action-foreground/15 bg-action-foreground/[0.07] p-5 shadow-[0_24px_60px_-28px_color-mix(in_oklab,var(--color-shadow)_70%,transparent)] backdrop-blur-md sm:p-7">
                <span
                  aria-hidden="true"
                  className="absolute -top-5 right-6 grid size-11 -rotate-6 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-lift"
                >
                  <MailOpen className="size-5" strokeWidth={2} />
                </span>

                {state === "done" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="py-4 text-center sm:py-6"
                  >
                    <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_0_0_8px_color-mix(in_oklab,var(--color-accent)_18%,transparent)]">
                      <Check aria-hidden="true" className="size-7" strokeWidth={2.5} />
                    </span>
                    <h3 ref={doneRef} tabIndex={-1} className="mt-6 font-display text-h2 outline-none">
                      {newsletter.success.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-[38ch] text-body text-action-foreground/80">
                      {newsletter.success.body}
                    </p>
                  </motion.div>
                ) : (
                  <form
                    ref={scriptValidates}
                    action="/api/newsletter"
                    method="post"
                    onSubmit={onSubmit}
                    onBlur={onBlur}
                    onChange={onChange}
                    aria-labelledby={titleId}
                    className="relative"
                  >
                    {/* After a plain post (no script), the route sends the
                        visitor back here with one of these as the fragment. */}
                    <p
                      id={NEWSLETTER_HASH.subscribed}
                      className={cn(NOTE_CHIP, "mb-5 hidden scroll-mt-[calc(var(--spacing-nav)+4rem)] target:flex")}
                    >
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} />
                      {newsletter.success.title} {newsletter.success.body}
                    </p>
                    <p
                      id={NEWSLETTER_HASH.invalid}
                      className={cn(NOTE_CHIP, "mb-5 hidden scroll-mt-[calc(var(--spacing-nav)+4rem)] target:flex")}
                    >
                      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
                      Check your email address and tick the box, then try again.
                    </p>
                    <p
                      id={NEWSLETTER_HASH.notSent}
                      className={cn(NOTE_CHIP, "mb-5 hidden scroll-mt-[calc(var(--spacing-nav)+4rem)] target:flex")}
                    >
                      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
                      That did not go through. Please try again in a few minutes.
                    </p>

                    <label htmlFor={id("email")} className="block font-mono text-eyebrow text-action-foreground/80 uppercase">
                      {newsletter.emailLabel}
                    </label>

                    {/* One white pill with the button inside from 640px; on a
                        phone the button sits under the field, in the same
                        plate, so the navy button never lands on the navy. */}
                    <div
                      data-invalid={errors.email ? "" : undefined}
                      className="mt-3 flex flex-col gap-1.5 rounded-[1.625rem] bg-surface p-1.5 shadow-lift transition-shadow duration-200 has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-accent/50 data-invalid:ring-2 data-invalid:ring-danger sm:flex-row sm:items-center sm:rounded-full"
                    >
                      <input
                        id={id("email")}
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        maxLength={160}
                        pattern={EMAIL_PATTERN}
                        placeholder={newsletter.emailPlaceholder}
                        disabled={busy}
                        className="h-12 w-full min-w-0 flex-1 rounded-full bg-transparent px-4 text-body text-foreground placeholder:text-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        {...invalid("email")}
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={busy}
                        arrow={!busy}
                        icon={busy ? <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" /> : undefined}
                        className="h-12 w-full shrink-0 sm:w-auto"
                      >
                        {busy ? newsletter.sending : newsletter.submit}
                      </Button>
                    </div>
                    {errors.email && (
                      <p id={`${id("email")}-error`} className={cn(NOTE_CHIP, "mt-2.5 text-danger-ink")}>
                        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
                        {errors.email}
                      </p>
                    )}

                    {/* The consent. Unticked, required, and in words the route
                        records with the sign-up (constants/newsletter.ts). */}
                    <div className="mt-5">
                      <label htmlFor={id("consent")} className="flex cursor-pointer items-start gap-3">
                        <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                          <input
                            id={id("consent")}
                            name="consent"
                            type="checkbox"
                            value="yes"
                            required
                            disabled={busy}
                            className="peer size-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-action-foreground/60 bg-action-foreground/5 transition-colors duration-200 checked:border-accent checked:bg-accent focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:outline-none aria-invalid:border-danger disabled:cursor-not-allowed"
                            {...invalid("consent")}
                          />
                          <Check
                            aria-hidden="true"
                            className="pointer-events-none absolute size-3.5 text-accent-foreground opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                            strokeWidth={3}
                          />
                        </span>
                        <span className="text-small text-action-foreground/90">{NEWSLETTER_CONSENT.text}</span>
                      </label>
                      {errors.consent && (
                        <p id={`${id("consent")}-error`} className={cn(NOTE_CHIP, "mt-2.5 text-danger-ink")}>
                          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
                          {errors.consent}
                        </p>
                      )}
                    </div>

                    <p className="mt-5 border-t border-action-foreground/15 pt-4 text-[0.8125rem] leading-relaxed text-action-foreground/70">
                      {newsletter.notice} Details are in our{" "}
                      <SiteLink
                        href="/privacy-policy"
                        className="font-medium text-action-foreground underline decoration-action-foreground/40 underline-offset-4 transition-colors hover:decoration-action-foreground"
                      >
                        Privacy Policy
                      </SiteLink>
                      .
                    </p>

                    {/* Honeypot, as on the enquiry form: off-screen, hidden from
                        assistive technology and skipped by the keyboard. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor={`${uid}-${TRAP_FIELD}`}>Do not fill this in</label>
                      <input id={`${uid}-${TRAP_FIELD}`} name={TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div ref={alertRef} role="alert" className="empty:hidden">
                      {(state === "tooMany" || state === "failed") && (
                        <p className={cn(NOTE_CHIP, "mt-4")}>
                          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
                          {state === "tooMany"
                            ? "Too many tries from this connection. Please wait a few minutes and try again."
                            : "That did not go through. Please try again in a moment."}
                        </p>
                      )}
                    </div>
                  </form>
                )}

                {/* Already in the page when its text changes, or nothing would announce it. */}
                <p aria-live="polite" aria-atomic="true" className="sr-only">
                  {spoken}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
