"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type FormEventHandler,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, MessageCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/zan/ui/Button";
import { landingCopy } from "@/constants/landing";
import { site } from "@/constants/zan";
import { PRELOADER_SEEN_KEY } from "@/components/zan/shell/shellStore";
import { rememberLead, trackFormSubmission, trackWhatsAppClick } from "@/lib/analytics";
import {
  AGENT_REPLY,
  agentSubmit,
  EMAIL_PATTERN,
  formTool,
  leadsReady,
  scriptValidates,
  sendLead,
  toolParam,
  TRAP_FIELD,
} from "@/lib/leads";
import { formatUaePhone, isUaePhone, nationalDigits, toDisplay, toE164 } from "@/lib/uaePhone";
import { cn } from "@/lib/utils";
import { useQuote } from "./quoteContext";

/* ───────────────────────────────────────────────────────────────────────────
   THE LANDING PAGES' ENQUIRY FORM

   The same channel as the rest of the site: /api/leads, as
   components/zan/contact/EnquiryForm.tsx uses, so these leads land in the same
   inbox with the same layout, and a send that resolves goes to /thank-you, which
   is where the Google Ads conversion is counted.

   WHAT TELLS THESE LEADS APART. The hidden `lead_source` field, and where it
   came from on the page. Both reach the team's mail as its Source row, beside
   the page's address, which keeps its query string so a tagged ad link says
   which campaign paid for the click.

   Where it differs from the site's form, because these visitors came from an ad
   and the business wants to call them back:

     - The phone number is required and is a UAE number. The +971 is fixed in
       the field and what is typed after it is checked (lib/uaePhone.ts).
     - Project details are optional. One line fewer between a visitor and the
       button.
     - The service is the page's own and is not asked for. The package is, and
       it starts on "Not sure yet", so nobody has to stop and choose, but the
       lead has always said something about what they want.
     - A failed send keeps the lead: the visitor gets a WhatsApp link with what
       they typed already written out, and the address to fall back on.

   Uncontrolled, as the site's form is, and read through FormData on submit. Each
   new error also goes through one hidden live region, as it does there.

   WITH NO SCRIPT RUNNING it is still a working form, as the site's is: JavaScript
   off, or a press before hydration on a slow phone, posts the fields straight to
   the route, which answers with a redirect. The hidden `service` and `source`
   fields are only read then, since the script sends its own. `source` says "plain
   post", so the inbox can tell these leads apart: no conversion is counted for
   them (see ThankYouConversion). The route writes the +971 onto the number, which
   the script would have done.
   ─────────────────────────────────────────────────────────────────────────── */

type Field = "name" | "email" | "phone" | "interest" | "message";
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type State = "idle" | "sending" | "error";

const FIELDS: readonly Field[] = ["name", "phone", "email", "interest"];
const NOT_SURE = "Not sure yet";
/** What the GTM container's reports call these forms; the old pages' name. */
const FORM_NAME = "landing_lead_form";
const PHONE_HINT = "50 123 4567";
/** Set by ContactModal. Nobody who has just written needs asking to write. */
const CONTACT_MODAL_SEEN_KEY = "zan.contactModal.seen";
/** What each field is called, on its label and in the live region. */
const LABELS: Record<Field, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  interest: "What do you need?",
  message: "Project details",
};
/**
 * Where each form sits, for its name. A page has two and may open a third, and a
 * screen reader's list of landmarks tells them apart by name alone. Any other
 * location is a button that opened the popup.
 */
const FORM_PLACES: Record<string, string> = { hero: "top of page", closing: "end of page" };

function isControl(el: unknown): el is Control {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

function messageFor(el: Control): string | undefined {
  switch (el.name as Field) {
    case "name":
      return el.validity.valid ? undefined : "Please tell us your name.";
    case "email":
      if (el.validity.valid) return undefined;
      return el.validity.valueMissing
        ? "We need an email address to reply to."
        : "That email address looks incomplete. Check it and try again.";
    case "phone":
      if (!el.value.trim()) return "We need a number to call you back on.";
      return isUaePhone(nationalDigits(el.value))
        ? undefined
        : "Enter a UAE number, for example 50 123 4567 or 4 123 4567.";
    case "interest":
      return el.value ? undefined : `Pick the closest option, or “${NOT_SURE}”.`;
    default:
      return undefined;
  }
}

/** For the live region: "3 fields need attention. Name: Please tell us your name." */
function summarise(errors: Partial<Record<Field, string>>): string {
  const bad = FIELDS.filter((f) => errors[f]);
  const [first] = bad;
  return `${bad.length} ${bad.length === 1 ? "field needs" : "fields need"} attention. ${LABELS[first]}: ${errors[first]}`;
}

const control =
  "w-full rounded-xl border border-border-field bg-surface px-4 text-body text-foreground placeholder:text-subtle " +
  "transition-[border-color,box-shadow] duration-200 hover:border-foreground/40 " +
  "focus-visible:border-focus focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/25 " +
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

function FieldShell({
  id,
  label,
  optional,
  confirmed,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  /** Said on the label's line once the field is right, where there is room. */
  confirmed?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-small font-medium text-foreground">
        {label}
        {optional && (
          <>
            {" "}
            <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-subtle uppercase">Optional</span>
          </>
        )}
        {confirmed && (
          <span className="inline-flex items-center gap-1 font-mono text-[0.6875rem] tracking-[0.06em] text-success-ink uppercase">
            <Check aria-hidden="true" className="size-3 shrink-0" strokeWidth={3} />
            {confirmed}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-small text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Where the caret belongs after reformatting: after the same number of digits
 * it was after. Without this, editing the middle of a number throws the caret
 * to the end on every keystroke.
 */
function caretAfterDigits(formatted: string, digits: number): number {
  if (digits <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++seen === digits) return i + 1;
  }
  return formatted.length;
}

export function LandingForm({
  location,
  interest,
  submitLabel = landingCopy.cta.primary,
  className,
}: {
  /** Which form on the page, or which button opened it. Reaches the lead and the reports. */
  location: string;
  /** The package to open on. */
  interest?: string;
  submitLabel?: string;
  className?: string;
}) {
  const { page } = useQuote();
  const uid = useId();
  const id = (f: Field) => `${uid}-${f}`;
  const router = useRouter();

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<State>("idle");
  const [phoneOk, setPhoneOk] = useState(false);
  /** The WhatsApp link a failed send offers, with what the visitor typed in it. */
  const [rescue, setRescue] = useState("");
  const alertRef = useRef<HTMLDivElement>(null);
  /** The live region's text. */
  const [spoken, setSpoken] = useState("");
  /** What it last said about each field, so leaving one again does not repeat it. */
  const spokenFor = useRef<Partial<Record<Field, string>>>({});

  const leadSource = `landing:${page.slug}`;

  /* A send that resolved leaves this form on "Sending" while /thank-you loads, on
     purpose, so nobody presses it twice. That load is a full one, so Back can
     bring this page out of the browser's back/forward cache exactly as it was,
     with the form disabled and still spinning. */
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setState("idle");
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const check = (el: Control) => {
    const name = el.name as Field;
    const msg = messageFor(el);
    setErrors((prev) => (prev[name] === msg ? prev : { ...prev, [name]: msg }));
  };

  // A region only speaks when its text changes, so the same words again get a
  // space no one can see. Fixed errors leave it empty, not holding stale text.
  const say = (text: string) => setSpoken((prev) => (prev === text ? `${text}\u00a0` : text));
  const announce = (el: Control) => {
    const name = el.name as Field;
    const msg = messageFor(el);
    if (spokenFor.current[name] === msg) return;
    spokenFor.current[name] = msg;
    if (msg) say(`${LABELS[name]}: ${msg}`);
    else setSpoken("");
  };

  // Judged once the visitor leaves a field with something in it, then again as
  // they type, so an error clears the moment it is fixed.
  const onBlur = (e: FocusEvent<HTMLFormElement>) => {
    const el = e.target;
    if (!isControl(el) || !el.name) return;
    if (el.value === "" && !errors[el.name as Field]) return;
    check(el);
    announce(el);
  };
  const onInput: FormEventHandler<HTMLFormElement> = (e) => {
    const el = e.target;
    if (isControl(el) && errors[el.name as Field]) check(el);
  };

  /* Written straight to the input, as the rest of this form leaves its values
     with the browser. Any country code or leading 0 pasted or autofilled is
     dropped here, and the digits are spaced the way the number is said. */
  const onPhoneInput: FormEventHandler<HTMLInputElement> = (e) => {
    const el = e.currentTarget;
    const raw = el.value;
    const national = nationalDigits(raw);
    const formatted = formatUaePhone(national);
    const atEnd = (el.selectionStart ?? raw.length) >= raw.length;
    const digitsBefore = raw.slice(0, el.selectionStart ?? raw.length).replace(/\D/g, "").length;
    if (formatted !== raw) {
      el.value = formatted;
      const caret = atEnd ? formatted.length : caretAfterDigits(formatted, digitsBefore);
      el.setSelectionRange(caret, caret);
    }
    setPhoneOk(isUaePhone(national));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Set when an agent filled the form through its tool and a person pressed
    // the button: how to tell the agent what happened. Asked for now or never.
    const reply = agentSubmit(e.nativeEvent);

    // Read the form NOW. "sending" disables every control, and the HTML spec
    // leaves disabled controls out of FormData, so reading it any later sends
    // a blank enquiry.
    const data = new FormData(form);
    const get = (name: string) => String(data.get(name) ?? "").trim();

    const next: Partial<Record<Field, string>> = {};
    let firstInvalid: Control | null = null;
    for (const f of FIELDS) {
      const el = form.elements.namedItem(f);
      if (!isControl(el)) continue;
      const msg = messageFor(el);
      if (msg) {
        next[f] = msg;
        firstInvalid ??= el;
      }
    }
    setErrors(next);
    // Before focus moves, whose blur would otherwise say one of these again.
    spokenFor.current = next;
    if (firstInvalid) {
      setState("idle");
      say(summarise(next));
      reply?.(AGENT_REPLY.invalid(next));
      firstInvalid.focus();
      return;
    }
    setSpoken("");

    // Honeypot: answered the same way a real send is, so a bot learns nothing
    // about why nothing arrived. No lead is stored, so /thank-you reports nothing.
    // Not when an agent filled the form: its tool lists every named field, this
    // one too, and a person still pressed the button.
    if (!reply && get(TRAP_FIELD)) {
      router.push("/thank-you");
      return;
    }

    const national = nationalDigits(get("phone"));
    const lead = { name: get("name"), email: get("email"), phone: toDisplay(national) };
    const chosen = get("interest");
    const details = get("message");
    const source = get("lead_source");
    const where = get("form_location");

    reply?.(AGENT_REPLY.sending);
    setState("sending");
    try {
      await sendLead({
        ...lead,
        service: page.service,
        interest: chosen,
        message: details,
        source: `${source} (${where})`,
      });

      trackFormSubmission(FORM_NAME, page.service, { landing_page: page.slug, form_location: where });
      // What /thank-you reports as user_data for Enhanced Conversions.
      rememberLead({ email: lead.email, phone: toE164(national) });
      /* /thank-you sits under the site's own root layout, so reaching it is a
         full page load in this tab. Someone who has just sent an enquiry goes
         straight to the confirmation, without the first-visit preloader, and
         is not then asked by the site's timed modal to send one. */
      try {
        sessionStorage.setItem(PRELOADER_SEEN_KEY, "1");
        sessionStorage.setItem(CONTACT_MODAL_SEEN_KEY, "1");
      } catch {
        // Storage refused: the preloader plays. Nothing is lost.
      }
      form.reset();
      setPhoneOk(false);
      router.push("/thank-you");
    } catch (err) {
      // The cause is in the route's log. This says which request to look for.
      console.error("[LandingForm] send failed", err);
      const note = encodeURIComponent(
        `Hi ${site.name}! I'm interested in ${page.label}.\n\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nInterested in: ${chosen}${details ? `\n\n${details}` : ""}`,
      );
      setRescue(`https://wa.me/${site.whatsapp}?text=${note}`);
      setState("error");
      requestAnimationFrame(() => alertRef.current?.scrollIntoView({ block: "nearest" }));
    }
  };

  if (!leadsReady) {
    return (
      <div className={className}>
        <p className="text-body text-muted">Tell us what you are building and we will come back within 24 hours.</p>
        <a
          href={`mailto:${site.email}`}
          className="mt-4 inline-block text-lead font-medium text-accent-ink underline decoration-current/40 underline-offset-4 hover:decoration-current"
        >
          {site.email}
        </a>
      </div>
    );
  }

  const busy = state === "sending";
  const invalid = (f: Field) => (errors[f] ? { "aria-invalid": true, "aria-describedby": `${id(f)}-error` } : {});

  return (
    <form
      ref={scriptValidates}
      action="/api/leads"
      method="post"
      onSubmit={onSubmit}
      onBlur={onBlur}
      onInput={onInput}
      aria-label={`${page.label} enquiry, ${FORM_PLACES[location] ?? "quote popup"}`}
      /* Only the hero's. A page has more than one of these forms, and one form
         on a page carries a tool's name: see lib/leads.ts. */
      {...(location === "hero"
        ? formTool(
            "landing_quote_form",
            `Fill in a request to ${site.name} for a quote on ${page.label}, with a call back on a UAE number. The visitor checks it and presses the button. We reply within 24 hours.`,
          )
        : {})}
      className={cn("relative", className)}
    >
      {/* What separates these leads from every other enquiry in the inbox. */}
      <input type="hidden" name="lead_source" value={leadSource} />
      <input type="hidden" name="form_location" value={location} />
      {/* Read only by a post with no script. The script sends its own. */}
      <input type="hidden" name="service" value={page.service} />
      <input type="hidden" name="source" value={`${leadSource} (${location}, plain post)`} />

      {/* Columns by the form's own width, not the window's: the hero's panel is
          narrower at 1024px than at 640px, and side by side there a number would
          not fit beside its code. */}
      <div className="@container">
        <div className="grid gap-4 @min-[24rem]:grid-cols-2">
          <FieldShell id={id("name")} label={LABELS.name} error={errors.name}>
            <input
              id={id("name")}
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={busy}
              pattern=".*\S.*"
              className={cn(control, "h-12")}
              {...toolParam("The visitor's name.")}
              {...invalid("name")}
            />
          </FieldShell>

          <FieldShell
            id={id("phone")}
            label={LABELS.phone}
            error={errors.phone}
            confirmed={phoneOk ? "UAE number" : undefined}
          >
            {/* The code is part of the field rather than a choice beside it, and
              the input hands its border to the group so the two read as one. */}
            <div
              className={cn(
                "flex h-12 items-stretch overflow-hidden rounded-xl border border-border-field bg-surface",
                "transition-[border-color,box-shadow] duration-200 hover:border-foreground/40",
                "focus-within:border-focus focus-within:ring-4 focus-within:ring-focus/25",
                errors.phone && "border-danger focus-within:border-danger focus-within:ring-danger/15",
                busy && "opacity-60",
              )}
            >
              <span className="flex shrink-0 items-center gap-1.5 border-r border-border bg-surface-muted pr-2 pl-2.5 text-small font-medium text-foreground tabular-nums">
                <Image
                  src="/images/landing/flag-ae.svg"
                  alt=""
                  width={16}
                  height={11}
                  className="h-[0.6875rem] w-4 rounded-[2px] ring-1 ring-foreground/10"
                />
                <span>
                  <span className="sr-only">United Arab Emirates </span>
                  {site.dialCode}
                </span>
              </span>
              {/* type="text" and not "tel": the standard allows tel-national only
                  on a text field. inputMode keeps the phone keypad, and the three
                  below keep off what a tel field never had. The pattern is for the
                  browser's own check with no script running; the script does not
                  read it, and judges the number itself. */}
              <input
                id={id("phone")}
                name="phone"
                type="text"
                inputMode="tel"
                autoComplete="tel-national"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                required
                disabled={busy}
                pattern="[0-9+\s\(\)\-]{6,20}"
                placeholder={PHONE_HINT}
                onInput={onPhoneInput}
                className="min-w-0 flex-1 bg-transparent px-2.5 text-body text-foreground tabular-nums outline-none placeholder:text-subtle disabled:cursor-not-allowed"
                {...toolParam(`A UAE phone number, without the ${site.dialCode}. For example ${PHONE_HINT}.`)}
                {...invalid("phone")}
              />
            </div>
          </FieldShell>

          <FieldShell id={id("email")} label={LABELS.email} error={errors.email}>
            <input
              id={id("email")}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              disabled={busy}
              pattern={EMAIL_PATTERN}
              className={cn(control, "h-12")}
              {...toolParam("The email address to reply to.")}
              {...invalid("email")}
            />
          </FieldShell>

          <FieldShell id={id("interest")} label={LABELS.interest} error={errors.interest}>
            <div className="relative">
              <select
                id={id("interest")}
                name="interest"
                required
                disabled={busy}
                defaultValue={interest ?? NOT_SURE}
                className={cn(control, "h-12 cursor-pointer appearance-none pr-10 text-ellipsis")}
                {...toolParam(`The closest package in the list, or ${NOT_SURE}.`)}
                {...invalid("interest")}
              >
                <option value={NOT_SURE}>{NOT_SURE}</option>
                {page.packages.map((group) => {
                  const options = group.titles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ));
                  return group.label ? (
                    <optgroup key={group.label} label={group.label}>
                      {options}
                    </optgroup>
                  ) : (
                    options
                  );
                })}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-subtle"
                strokeWidth={2}
              />
            </div>
          </FieldShell>

          <FieldShell id={id("message")} label={LABELS.message} optional className="@min-[24rem]:col-span-2">
            <textarea
              id={id("message")}
              name="message"
              disabled={busy}
              rows={2}
              placeholder="Tell us briefly what you need…"
              className={cn(control, "min-h-[4.75rem] resize-y py-2.5 leading-relaxed")}
              {...toolParam("What the visitor needs, in a line or two. Optional.")}
            />
          </FieldShell>
        </div>
      </div>

      {/* Honeypot. Off-screen rather than display:none, because some bots skip
          fields that are not rendered. Hidden from assistive technology and
          skipped by the keyboard, so no person ever meets it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-${TRAP_FIELD}`}>Do not fill this in</label>
        <input
          id={`${uid}-${TRAP_FIELD}`}
          name={TRAP_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...toolParam("Do not fill this in.")}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={busy}
        arrow={!busy}
        icon={busy ? <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" /> : undefined}
        className="mt-5 w-full"
      >
        {busy ? "Sending" : submitLabel}
      </Button>

      <p className="mt-3 text-center text-[0.8125rem] leading-snug text-subtle">{landingCopy.formNote}</p>

      <div ref={alertRef} role="alert" className="empty:hidden">
        {state === "error" && (
          <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-small text-muted">
            <p className="flex items-start gap-2.5">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2} />
              <span>
                That did not send. Please try again, or email us at{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="font-medium text-accent-ink underline decoration-current/40 underline-offset-4 hover:decoration-current"
                >
                  {site.email}
                </a>
                .
              </span>
            </p>
            {rescue && (
              <a
                href={rescue}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("Landing Form Fallback")}
                className="mt-2.5 ml-6.5 inline-flex items-center gap-1.5 font-medium text-whatsapp-ink underline decoration-current/40 underline-offset-4 hover:decoration-current"
              >
                <MessageCircle aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
                Send this on WhatsApp instead
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Already in the page when its text changes, or nothing would announce
          it. sr-only takes it out of the flow, so it adds no height or gap. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {spoken}
      </p>
    </form>
  );
}
