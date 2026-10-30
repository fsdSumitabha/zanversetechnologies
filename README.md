# Zan Verse Technologies — company site

The website of Zan Verse Technologies, the Dubai company at IFZA Business Park, Dubai Silicon Oasis. The homepage covers the four practices (Development, Digital Marketing, Blockchain & Web3 and Designing), the work, the process, the people and the Dubai office, told through pinned, cinematic scroll scenes. The services, each of the sixteen services, the portfolio, how we work, about us, the team, contact and the five policies have pages of their own.

It serves the UAE only: one brand, one office, one market. The site was carried over from the Zan Services build's UAE pages (zanservices.com/ae), which already traded as Zan Verse Technologies; nothing else from that build remains.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, GSAP + ScrollTrigger, Framer Motion, Lenis, three.js / React Three Fiber and ogl. The chat and its agent console run in the same app, on MongoDB, Gemini, Pusher and the WhatsApp Cloud API.

## Status

- **Pre-launch, hidden from search engines.** `app/(site)/layout.tsx` sets `index: false, follow: false`, in the generic `robots` block and again in its `googleBot` block, which overrides it for Google. zanservices.com/ae still serves the same pages, and two indexed copies would split their rankings. Delete both pairs at cutover, once zanversetechnologies.com serves this build and zanservices.com/ae is retired or redirected here. The comment on that block marks exactly what to remove.
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

Copy `.env.example` to `.env.local` for the chat, the agent console and the enquiry form. `next build` succeeds without any of it, because the server reads its credentials only when a request needs them. Values prefixed `NEXT_PUBLIC_` (the Pusher key and cluster, the three EmailJS values) are the exception: they are compiled into the browser bundle, so set them before building. Without the EmailJS values the contact section shows the email address instead of a form that cannot send.

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

## Structure

| Path | What it holds |
|---|---|
| `app/(site)/layout.tsx` | Fonts, the metadata every route inherits (with the pre-launch noindex), the company's JSON-LD, and the shell: consent banner, preloader, scroll progress, smooth scroll, navbar, footer, contact modal, analytics |
| `app/(site)/page.tsx` | The homepage's section order, with a map of every scene |
| `app/(site)/*/` | Every other page: services and the sixteen service pages, portfolio, how we work, about us, our team, contact, thank you and the five policies |
| `app/(console)/agent/` | The agent console, with its own root layout: no site shell, no consent banner, no tags |
| `app/api/` | The chat, the agent console's API, Pusher auth and the WhatsApp webhook |
| `app/global-not-found.tsx` | The 404 for unmatched URLs, rendered in the site layout (the two root layouts leave no shared one) |
| `app/globals.css` | Design tokens and the gold palette. The light theme is the only theme. |
| `constants/zan.ts` | The company (`site`, `office`) and all homepage content. Sections never hard-code copy. |
| `constants/pages.ts`, `constants/legal.ts` | The copy for every other page, and the five policies |
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
| `server/` | The chat backend: environment, MongoDB models, Gemini, WhatsApp, Pusher, rate limits |
| `public/og-default.png` | The 1200x630 share card every page falls back to |
| `assets-src/` | Source masters that are not served: the logo artwork as supplied, the original team portraits |
| `ZAN_BRIEF.md` | The rules anyone editing a section follows |

## Palette

One palette, gold, defined once in `app/globals.css`'s `@theme`:

| Token | Value | Use |
|---|---|---|
| `brand` | `#ffc400` | The fill. Never text. |
| `brand-ink` | `#8b6904` | Accent text on light grounds: 5.10:1 on white |
| `on-brand` | `#17130a` | Anything on a gold fill. Near-black: 11.59:1 on the gold, where white fails |
| `brand-soft` | `#fff4cc` | Pale tint |
| Neutrals | `bg` `#ffffff`, `surface` `#fbf9f3`, `ink` `#17130a`, `ink-2` `#6c6552`, `line` `#ece6d5` | Warm, to sit under the gold |

Components use the tokens (`bg-brand`, `text-brand-ink`, `text-on-brand` …), never hex. WebGL, canvas and three.js cannot read a CSS variable, so `lib/brand.ts` holds the same values as hex. The two change together.

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

The logo's colours (navy and the cyan-to-blue gradient) belong to the logo only; the site's palette stays gold. Images under `public/` are served as immutable for a year, so a changed image gets a new file name or version query rather than being overwritten in place.

## Third-party notices

Attribution for the code and assets this site builds on is kept in [NOTICE.md](NOTICE.md). Read it before publishing.
