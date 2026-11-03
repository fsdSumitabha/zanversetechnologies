# Zan Verse Technologies — company site

The website of Zan Verse Technologies, the Dubai company at IFZA Business Park, Dubai Silicon Oasis. The homepage covers the four practices (Development, Digital Marketing, Blockchain & Web3 and Designing), the work, the process, the people and the Dubai office, told through pinned, cinematic scroll scenes. The services, each of the sixteen services, the portfolio, how we work, about us, the team, contact and the five policies have pages of their own.

It serves the UAE only: one brand, one office, one market. The site was carried over from the Zan Services build's UAE pages (zanservices.com/ae), which already traded as Zan Verse Technologies; nothing else from that build remains.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, GSAP + ScrollTrigger, Framer Motion, Lenis, three.js / React Three Fiber and ogl. The chat and its agent console run in the same app, on MongoDB, Gemini, Pusher and the WhatsApp Cloud API.

## Status

- **The company's main site.** zanversetechnologies.com serves this build, open to search engines, and zanservices.com/ae redirects here with the path and query kept.
- **Old /ae addresses still work.** `next.config.ts` redirects `/ae` to `/` and `/ae/<path>` to `/<path>`, so a link shared from the old pages lands on the same page here.
- **Every line of copy and every figure** comes from `constants/`: the previous build's UAE pages first, the production Zan site's data (`zan_webdevelopment/src/data`) second. Nothing is invented. The deliberate deviations are documented in comments there.

## Run

The project uses pnpm, pinned in `package.json` (`packageManager`).

```bash
pnpm install
pnpm dev                  # http://localhost:5173
pnpm build && pnpm start
```

If pnpm is not on your PATH, run the pinned version through npx:

```bash
npx pnpm@10.34.6 install
npx pnpm@10.34.6 dev      # http://localhost:5173
```

Copy `.env.example` to `.env.local` for the chat, the agent console and the enquiry form. `next build` succeeds without any of it, because the server reads its credentials only when a request needs them. Values prefixed `NEXT_PUBLIC_` (the Pusher key and cluster) are the exception: they are compiled into the browser bundle, so set them before building. So are `SMTP_USER` and `SMTP_PASS`, because the build decides whether the forms appear: without them the forms show the email address instead of a form that cannot send. Restart the dev server after adding them.

## Deploy

`.github/workflows/deploy.yml` builds every pull request with no credentials, as a check, and on a push to `main` builds through Netlify and publishes to production. It needs two repository secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`. The site ID must be the Netlify site that serves zanversetechnologies.com. The site's environment variables live in Netlify, not in GitHub.

## Client IP header for rate limits

The chat and agent-login rate limits count requests per caller IP, read from a header the host sets itself. Set `TRUSTED_IP_HEADER` to your host's header:

| Host | `TRUSTED_IP_HEADER` |
|---|---|
| Netlify | `x-nf-client-connection-ip` |
| Vercel | `x-real-ip` |
| Cloudflare in front | `cf-connecting-ip` |
| nginx | `x-real-ip`, only when nginx sets `proxy_set_header X-Real-IP $remote_addr;` |

Any other header can be written by the client, so a caller could claim a new IP, and a fresh limit, on every request. If the variable is empty, the site uses Vercel's header when `VERCEL` is set, and otherwise assumes Netlify's and logs a warning in production.

When a request arrives without the header, for example on localhost, the per-IP limits are skipped and one error is logged per process. The other limits stay: per conversation, per login email, and a site-wide cap of 300 new chat sessions per 5 minutes.

## Enquiry mail

Every enquiry form, on the site and the landing pages, posts to `app/api/leads/route.ts`. That sends two mails from `SMTP_USER` through nodemailer (`server/services/mail.service.ts`):

- **To the team:** `MAIL_TO`, or `site.email` if that is empty. It holds everything the visitor sent, and pressing Reply answers the visitor. If this mail fails, the visitor is told, and they get no confirmation.
- **To the visitor:** a confirmation. It is fixed text with no words from the form except a checked name, because anyone can type someone else's address into a public form. If only this mail fails, the lead still counts as sent.

To set it up on Gmail or Google Workspace:

1. Turn on 2-Step Verification on the `SMTP_USER` account. A Workspace admin may have to allow it.
2. Create an App Password for that account, and use it as `SMTP_PASS` with no spaces. The account's sign-in password is refused.
3. Set the `SMTP_*` values in `.env.local`, and in Netlify for production. Set them before building, because the build decides whether the forms appear.

Limits: 5 leads per IP in 10 minutes, 40 per hour across the site, and 3 confirmations per address per hour. They count in MongoDB and fail open, so a database outage cannot stop a lead. They also fail open if `getEnv()` in `server/config/env.ts` rejects any chat setting, with an error in the log for every request, so check the log after setting up a new environment.

## Structure

| Path | What it holds |
|---|---|
| `app/(site)/layout.tsx` | Fonts, the metadata every route inherits (with the pre-launch noindex), the company's JSON-LD, and the shell: consent banner, preloader, scroll progress, smooth scroll, navbar, footer, contact modal, analytics |
| `app/(site)/page.tsx` | The homepage's section order, with a map of every scene |
| `app/(site)/*/` | Every other page: services and the sixteen service pages, portfolio, how we work, about us, our team, contact, thank you and the five policies |
| `app/(landing)/` | The paid landing pages (`/lp/<slug>`), with their own root layout: no preloader, no mega menu, no timed modal. Consent banner and tags as everywhere else. See "Landing pages" below |
| `app/(console)/agent/` | The agent console, with its own root layout: no site shell, no consent banner, no tags |
| `app/api/` | The chat, the enquiry forms' leads, the agent console's API, Pusher auth and the WhatsApp webhook |
| `app/global-not-found.tsx` | The 404 for unmatched URLs, rendered in the site layout (the two root layouts leave no shared one) |
| `app/globals.css` | Design tokens and the gold palette. The light theme is the only theme. |
| `constants/zan.ts` | The company (`site`, `office`) and all homepage content. Sections never hard-code copy. |
| `constants/pages.ts`, `constants/legal.ts` | The copy for every other page, and the five policies |
| `constants/landing.ts`, `components/zan/landing/` | The landing pages' copy and configuration, and the sections they are built from |
| `constants/serviceArt.ts`, `constants/serviceHero.ts` | Card artwork and service photography, with each photograph's source |
| `lib/brand.ts` | `brandPalette`: the palette as hex strings, for WebGL and canvas |
| `lib/links.ts`, `lib/useSiteHref.ts` | Href resolution (a homepage anchor becomes `/#…` on any other page) and WhatsApp links |
| `lib/metadata.ts`, `lib/schema.ts` | Per-page metadata (`pageMetadata`) and structured data |
| `lib/gsap.ts` | GSAP, ScrollTrigger and the shared `MQ` media conditions |
| `components/zan/sections/` | One component per homepage section |
| `components/zan/page/` | The building blocks of the other pages |
| `components/zan/shell/` | Navbar, mega menu, mobile menu, preloader, footer, floating actions |
| `components/zan/ui/` | Shared buttons, eyebrow, section heading, icons, logo |
| `components/zan/chat/`, `components/zan/agent/` | The chat panel and the agent console |
| `components/animations/`, `components/ui/` | The scroll scenes |
| `server/` | The backend: environment, MongoDB models, Gemini, WhatsApp, Pusher, enquiry mail, rate limits |
| `public/og-default.png` | The 1200x630 share card every page falls back to |
| `assets-src/` | Source masters that are not served: the logo artwork as supplied, the original team portraits |
| `ZAN_BRIEF.md` | The rules anyone editing a section follows |

## Landing pages

`/lp/web-development`, `/lp/app-development` and `/lp/digital-marketing`, for paid traffic. One layout draws them all; `landingPages` in `constants/landing.ts` is the only thing that differs. To add a page, add an entry there: its route, metadata and form follow from it. A page lists one or more groups of packages (`decks`); more than one become tabs. A page with a headline line longer than "Marketing Judged On" needs the size in `LandingHero.tsx` checking. An unknown slug gets a 404 that offers the pages that do exist.

- **Leads** go through `/api/leads`, the same as the site's enquiry form (see "Enquiry mail"). They are told apart by the hidden `lead_source` field (`landing:<slug>`) and by which form sent them. Both are the Source row of the team's mail, beside the page's address with any campaign tags. In the GTM dataLayer they are `form_submission` with `form_name: "landing_lead_form"`, `landing_page` and `form_location`.
- **Conversions** count on the same `/thank-you`. That page sits under the site's root layout, so reaching it is a full page load; the form marks the preloader and the timed modal as seen first, so a new lead sees neither.
- **The form:** name, UAE phone, email and "What do you need?" are required ("What do you need?" starts on "Not sure yet"); project details are optional. One component everywhere: hero, closing section and popup, on every page.
- **Phone numbers** are UAE only, with `+971` fixed in the field (`lib/uaePhone.ts`).
- **Tags:** the same `Analytics` as the rest of this build, on the production host and after consent: Meta and LinkedIn, and no GTM container. `GTM-WKT2N6FF` holds Google Ads `AW-17890514943`, with a conversion on `generate_lead` (reaching `/thank-you`) and one on `phone Icon click` (any `tel:` link), but it stays off the UAE (decided 23 Oct 2026). These pages report no Google Ads conversion until a container is chosen for them and added in `components/zan/analytics/TagLoader.tsx`, which today loads `GTM-PGGNMWGN` on `/services/web-development` only.
- **Keywords and metadata** are per page in `seo` in `constants/landing.ts`. Google Ads scores the words on the page, not the keywords meta tag, so the service and the city are in the h1, the subhead, the hero's service list (`serviceTerms`), the section headings and leads, and the package descriptions. Keep a page's keywords to what it actually sells, and keep them in text a visitor can read.
- **No prices or currency figures** appear anywhere on these pages, by design. Case-study results quoted in money are filtered out in `landingProjects`.
- **Not indexed.** They carry `noindex, follow` and stay out of the sitemap, so they cannot compete with `/services/*`. This is permanent. To change it, see `app/(landing)/layout.tsx`.

## Palette

The logo's navy (`#172554`) and cyan (`#44d9f8`) over Tailwind's slate, defined once in `app/globals.css`: the `navy-*` and `cyan-*` scales, then semantic tokens that components use.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#f8fafc` | `#07142f` | The page |
| `surface` | `#ffffff` | `#102142` | Cards, panels, inputs |
| `surface-raised` | `#ffffff` | `#14294c` | Bars, menus, modals |
| `surface-muted` | `#f1f5f9` | `#172b4d` | Alternate bands, chips, hover fills |
| `surface-tint` | `#eff4ff` | `#16305a` | A band with the brand in it |
| `foreground`, `muted`, `subtle` | `#0f172a`, `#475569`, `#64748b` | `#f1f5f9`, `#b6c4d8`, `#9bafcb` | Text |
| `border`, `border-strong`, `border-field` | `#e2e8f0`, `#cbd5e1`, `#64748b` | `#263a5c`, `#3a5178`, `#6f87ab` | Lines. `border-field` is for input outlines |
| `action`, `action-foreground` | `#172554`, `#ffffff` | `#44d9f8`, `#08204a` | The main action |
| `accent`, `accent-foreground` | `#44d9f8`, `#08204a` | the same | The cyan fill. Never text on a light ground |
| `accent-ink` | `#11677d` | `#78e5fb` | Cyan for text: 6.44:1 on white |
| `accent-soft` | `#ecfcff` | `#0b3445` | Pale tint |
| `focus` | `#0891b2` | `#67e8f9` | Keyboard focus |
| `inverse`, `plate`, `scrim`, `shadow` | | | A fixed dark plate, a fixed white plate for logos, the modal backdrop, shadows |
| `ai` | violet-600 | violet-400 | AI and blockchain only |
| `success`, `warning`, `danger` | emerald, amber, rose 600 | 400 | Fills and icons. Text takes the matching `-ink` token |

Components use the tokens (`bg-action`, `text-accent-ink`, `text-muted` …), never hex. WebGL, canvas and three.js cannot read a CSS variable, so `lib/brand.ts` holds the same light values as hex. The two change together.

The dark values sit in `.dark` in `app/globals.css`. Adding the class `dark` to `<html>` turns the theme on. There is no switch in the UI, and light is the default.

## Motion and accessibility

- **Reduced motion.** Every GSAP scene is built inside `gsap.matchMedia()` and falls back to a static, complete layout for `prefers-reduced-motion`. Framer Motion follows `<MotionConfig reducedMotion="user">`. Lenis is not created at all.
- **Content stays in the DOM.** Headings, lists and links are server-rendered. Canvases are decorative and `aria-hidden`.

## The logo

The artwork was supplied as raster images (`assets-src/brand/zanverse-logo.jpeg`, the lockup on white, and `zanverse-logo-iconmark.png`, the mark). The served files are a vector redrawn from the lockup: measured edge by edge and checked against the original by pixel difference, to within about 1px at the original's 1448px width. If a designer's own vector file turns up, it should replace these.

| File | Use |
|---|---|
| `public/images/brand/zan-verse-technologies-logo.svg` | The lockup, mark and "zvt". `site.logo`, rendered by `ZanLogo` |
| `public/images/brand/zan-verse-technologies-logo.png` | The same as a transparent PNG (`site.logo.png`): structured data, email |
| `public/images/brand/zan-verse-technologies-mark.svg` | The mark alone. The hero's flat mark, and what `ZanMark3D` extrudes (it keys on the paths' ids) |
| `public/images/brand/zan-verse-technologies-mark.png` | The mark as a transparent 1024px PNG, for anywhere else it is needed |
| `app/favicon.ico`, `app/icon.svg`, `app/icon.png`, `app/apple-icon.png` | The favicon set. `icon.svg` turns the navy shard white in a dark browser theme |
| `app/manifest.ts`, `public/images/brand/icon-*.png` | Home-screen name and icons, including a maskable one |
| `public/og-default.png` | The share card. Bump the `?v=` in `OG_IMAGE` (`lib/metadata.ts`) whenever it changes |

The two `-on-dark.svg` files in `public/images/brand` are the lockup and the mark with the navy turned slate-100, for the dark theme only: `.dark .zan-logo` and `.dark .zan-mark` swap them in. Images under `public/` are served as immutable for a year, so a changed image gets a new file name or version query rather than being overwritten in place.

## Third-party notices

Attribution for the code and assets this site builds on is kept in [NOTICE.md](NOTICE.md). Read it before publishing.
