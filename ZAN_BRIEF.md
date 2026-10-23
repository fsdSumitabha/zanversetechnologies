# Zan Verse Technologies company site: section builder brief

The rules anyone editing a section of this site follows. Read this, then read `constants/zan.ts`, before you design anything.

## The site

This is the website of Zan Verse Technologies, the Dubai company. One brand, one office, one market: the UAE. It was carried over from the UAE pages of the previous Zan build, and nothing else from that build remains. There is no region switch, no `/ae` prefix and no second office.

The scroll scenes come from Rohith Pranov's personal cinematic portfolio (credited in `NOTICE.md`): pinned GSAP chapter cards, the story-scroll deck, the warp portal, the parallax wall, the scroll-morph ring, the fold, the tilted grid, the zoom parallax and light rays. Techniques from the `Apple_Website` study project sit alongside them: the pinned 3D laptop spin, scrubbed text, the rising masonry and the logo mask zoom.

The client has asked for bolder motion than the previous build had, so new scenes are welcome. The site must still read as a credible B2B technology company, and every rule below still applies to them.

## Direction

1. **Content comes from `constants/`.** `constants/zan.ts` holds the company (`site` and `office`, at the top) and every piece of homepage copy; `constants/pages.ts` and `constants/legal.ts` hold the other pages and the five policies. The copy is the previous build's UAE pages, with the production Zan site's data (`zan_webdevelopment/src/data`) as the second source. Re-read them before you design; do not work from memory of an older version.
2. **Every page is a route of this site.** Services, the sixteen service pages, portfolio, how we work, about, our team, contact, thank you and the five policies all live under `app/`. No page links out to another Zan site, and the chat API is this app's own (`app/api/`), not a proxy. The rule for hrefs from constants:
   - One that starts with `/` is a page of this site, used exactly as written. Never add a prefix to it. Render it with `SiteLink` / `SiteButtonLink` (`@/components/zan/services/SiteLinks`) or `ButtonLink`, which navigate with `next/link`.
   - `#…` is an anchor on the homepage. `useSiteHref()` from `@/lib/useSiteHref` turns it into `/#…` on any other page; `SiteLink` does that for you. A page's own anchor is written directly with `ButtonLink`.
   - `@/lib/links` must stay free of React: server components import it.
   - `waLink(site.whatsapp, site.name)` builds the WhatsApp link. `site.whatsapp` is the Dubai number, digits only.
3. **Never use "small team"**, and no "small on purpose" or similar framing.
4. **Nothing may look AI-generated.**
   - Visuals:
     - no sparkle/✨/magic icons
     - no decorative glow blobs, radial haze or aurora gradients
     - no gradient text scattered around (at most one accent per view)
     - no glassmorphism by default
     - no emoji
   - Copy:
     - no em dashes (—) in visible copy
     - no clever aphorisms or filler adjectives ("seamless", "cutting-edge", "curated", "empower", "elevate")
   - Aim for restrained, editorial, human, specific. "Bolder motion" means kinetic, physical and crafted, not neon.
5. **Four major items.** Development, Digital Marketing, Blockchain & Web3 and Designing are the client's grouping for the services dial. See `pillars` / `pillarsIntro`.
6. **The hero is the old site's hero, in parallax.** It lives in `components/zan/sections/Hero.tsx`. The frame-to-fullscreen board is `Board.tsx`.

## The page, top to bottom

`app/(site)/page.tsx` fixes the order and maps every scene to its section. Each section is one component in `components/zan/sections/*.tsx`. The navbar, footer, preloader and scroll progress bar are in `components/zan/shell/*`; the other pages are built from `components/zan/page/*`.

## Non-negotiables

1. **Zan content only**, from `@/constants/zan` (and `@/constants/pages` on the other pages). Read it before designing.
   - Never invent a number, testimonial, client, team member, quote, certification, address, opening hours or legal fact.
   - Never claim what is not established about the Dubai office: that it builds the work, has a development team, has a headcount, or has existed since a given year. The true framing the content already uses: the people who scope a project are the people who build it, weekly progress, a live staging environment, three months of post-launch support, work invoiced in dirhams.
   - Never reuse the reference's copy. That rules out "Chapter 01 — Who I Am", "Think. Build. Ship.", "Built Different", "Come Alive" and every other personal line.
   - If you need a label that is not in constants, keep it short and factual, for example "Case studies" or "Scroll".
   - Photos in `/images/professional/*` are stock stand-ins. Use them only as sector imagery paired with a case study (the `screenshot` field) or decoratively (`alt=""`). Never caption them "our team", "our office" or a real screenshot.
   - Client logos (`/images/clients/*`) always sit on a white plate, as supplied. Never tint them, grey them out or filter them.
2. **Nothing personal or third-party ships.**
   - Do not import from, or copy assets out of, anything that was deleted, and do not use remote images.
   - Do not use Spline, `unsplash`, `aceternity.com` assets or CDNs. Every asset lives in `/public`.
   - If a file you own still contains personal data (Rohith, KodaiRateIQ, ProofStack, Design_img paths and so on), remove it.
3. **Light theme, tokens only.** No hex colours in components, with two narrow exceptions:
   - neutral pure white or black shadows written as `rgb(… / a)`;
   - the hex values in `@/lib/brand`, for WebGL and canvas only (see 4).

   The tokens, as Tailwind classes:

   | Class | Use |
   |---|---|
   | `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-paper` (#f5f0e8, warm paper, not accent) | Grounds |
   | `text-ink`, `text-ink-2`, `text-muted` | Text |
   | `border-line`, `border-line-strong` | Hairlines |
   | `bg-brand` | Brand fill: the gold |
   | `text-brand-ink` | Accent text on light grounds. **Never `text-brand` for text.** |
   | `bg-brand-soft` | Pale tint |
   | `text-on-brand` | Anything placed on a brand fill: near-black on the gold. **Never hard-code white on a brand fill**; it fails contrast. |

   Utilities: `bg-brand-gradient`, `text-brand-gradient`, `bg-brand-wash`, `bg-brand-veil` and `border-brand-gradient-t`.
   - For translucency use `bg-brand/15` or `color-mix(in oklab, var(--color-brand) 15%, transparent)`.
   - Never concatenate `${hex}55`.
4. **One brand, one office.**
   - The brand is Zan Verse Technologies. A component takes it from `site.name` rather than typing it. "Zan" alone is fine as a short form ("Why businesses choose Zan"). The lockup is `ZanLogo`.
   - The only office is Dubai: `office` (its IFZA address in Dubai Silicon Oasis, its UAE number) and `site.whatsapp`. Where an office is shown, it is one office laid out as one, never a grid with gaps where others used to be.
   - The company has no other office, entity or market, and nothing may name or imply one: no other city or country it works from, no other legal entity or registration, no other phone number, time zone or currency of its own. That holds everywhere: visible copy, metadata, structured data, alt text, aria labels, chat prompts, emails and WhatsApp templates. Work is invoiced in dirhams (`site.currency`, `site.currencyName`). The dollar figures in case studies are client outcomes and stay as written.
   - WebGL, canvas and three.js cannot read `var()`. Use `brandPalette` from `@/lib/brand`: hex strings, a plain constant (there is no hook, and nothing to re-render for).
5. **Reduced motion.**
   - Build every GSAP scene inside `gsap.matchMedia()` using `MQ.motion` from `@/lib/gsap`, so it reverts to a static, complete, readable layout for `prefers-reduced-motion: reduce`.
   - Nothing may stay at opacity 0.
   - Framer Motion is already covered globally by `<MotionConfig reducedMotion="user">`, but anything you animate with `style={{ opacity }}` or `useTransform` is not, so gate it.
   - Canvas and R3F loops must not run.
6. **SEO and accessibility.**
   - Real headings (`h2`/`h3`), lists and links in the server HTML.
   - Canvases and decorative layers get `aria-hidden`.
   - Text split for animation (SplitText or by hand) stays readable as text to assistive technology: keep SplitText's own aria handling, or an `sr-only` copy.
   - Interactive things are keyboard reachable with a visible focus ring. A custom cursor never hides the focus ring and never renders on touch devices.
   - The homepage's single `h1` belongs to the Hero.
   - A page sets its metadata with `pageMetadata({ title, description, path })` from `@/lib/metadata`; `path` is the page's own path, for its canonical.
7. **Performance.**
   - Heavy things are `next/dynamic(..., { ssr: false })` and mount only when near the viewport: three.js, R3F, ogl and the GLB.
   - They pause off-screen and are desktop-only unless cheap. Never stack several WebGL scenes on one screen.
   - No new npm packages. If you think you need one, say so in your report instead.
   - Available: `gsap` (import from `@/lib/gsap`; its bonus plugins, such as SplitText, Flip, DrawSVG, MorphSVG and Observer, ship in the installed package), `@gsap/react`, `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei`, `ogl`, `lenis`, `lucide-react`.
8. **Mobile (390×844, and down to 360px).**
   - No horizontal overflow, readable type, no clipped headings, and every call to action is tappable.
   - Pins are allowed on touch but should be shorter. Anything too heavy gets a static mobile layout.
   - Native touch scroll is kept: Lenis only smooths the wheel.
9. **Layering.**
   - The fixed navbar is `h-nav` (4.5rem) tall at `z-50`. Keep a pinned stage's key content clear of the top 72px.
   - Keep your sections below `z-40`.
   - Anything that scrolls inside itself needs `data-lenis-prevent`.
10. **React 19 + React Compiler lint** (eslint-config-next core-web-vitals).
    - Never set state synchronously inside an effect.
    - Never read or write `ref.current` during render.
    - No `Math.random()`/`Date.now()` in render; seed from the index instead.
    - Never mutate a value returned by a hook.
    - `npx eslint <your files>` must report 0 errors.
11. **Next 16.** Read `node_modules/next/dist/docs/` before using a Next API you are unsure of (`next/dynamic`, `next/image`).

## Shared pieces (use them; do not edit them as part of a section)

| Piece | Where | Notes |
|---|---|---|
| Company and content | `@/constants/zan` | `site` (name, URL, email, logo, WhatsApp, currency), `office` (Dubai), and every piece of homepage copy |
| Other pages' content | `@/constants/pages`, `@/constants/legal` | Page copy and SEO, the five policies |
| Colours for WebGL/canvas | `@/lib/brand` | `brandPalette`, as hex |
| Links | `@/lib/links`, `@/lib/useSiteHref` | `isInternalHref`, `siteHref`, `waLink`; the `useSiteHref()` hook |
| Page metadata | `@/lib/metadata` | `pageMetadata`, `absoluteUrl`, the share card |
| GSAP | `@/lib/gsap` | `gsap`, `ScrollTrigger`, `MQ` |
| Buttons | `@/components/zan/ui/Button` | `ButtonLink` / `Button`: variants `primary` \| `secondary` \| `onBrand` \| `ghost`, sizes `md` \| `lg`, plus `icon` and `arrow` props |
| Eyebrow | `@/components/zan/ui/Eyebrow` | Mono caps label with an accent dot; use `tone="current"` on brand fills |
| SectionHeading | `@/components/zan/ui/SectionHeading` | Eyebrow, then a display heading whose lines rise out of masks, then a lead |
| Icons | `@/components/zan/ui/icons` | `<ZanIcon name="code" />`, keyed by the `icon` fields in constants |
| Logo | `@/components/zan/ui/ZanLogo` | The Zan Verse Technologies lockup |
| Class helper | `cn` from `@/lib/utils` | |
| Everything else | `app/globals.css`, `app/(site)/layout.tsx`, `app/(site)/page.tsx` | The palette, the shell, the section order |

If you need a change in any of these, put it in your final report; do not edit them. Other builders may be working in parallel on other files, and simultaneous edits to one file clobber each other.

Put component-specific CSS (keyframes and anything else Tailwind cannot express) in a co-located `.css` file imported by your component. Prefix its class names with your section, for example `.zan-deck-…`.

## Typography language

| Style | Classes | Use |
|---|---|---|
| Section headings | `font-display` (Bricolage Grotesque) at `text-h1`/`text-h2`, or use `SectionHeading` | Section headings |
| Hero headline and set-pieces | `font-hero` (Bricolage Grotesque, with its weight, width and optical-size axes) | The hero headline, and display set-pieces such as the showreel's wordmark |
| Chapter labels and deck headlines | `font-sans font-bold uppercase text-giant` (0.9 leading, tight tracking) | The reference's big grotesk statements |
| Eyebrows and indices | `font-mono text-eyebrow uppercase` | Eyebrows and indices |
| Body | `text-lead` / `text-body` in `text-ink-2` | Body copy |
| Surfaces | `rounded-2xl`/`rounded-3xl`, 1px `border-line`, `shadow-lift` / `shadow-float` | Cards and panels; no heavy black shadows |
| Motion | `ease-out-expo` or GSAP `power3.out` / `expo.out` | Confident, not bouncy |

## How to verify

Use the dev server (`pnpm dev`, http://localhost:5173) if one is already running; otherwise start one. Do not run `next build` while others are working in the same tree.

Checks:
- `npx tsc --noEmit -p .`: your files must be clean. Other builders' files may be mid-edit, so filter the output to your paths.
- `npx eslint <your files>`: 0 errors.
- Screenshots at 1440×900 and at 390×844 (touch), at several points through your section: a pinned scene at its start, middle and end. Look at every one.
  - Again with reduced motion (`prefers-reduced-motion: reduce`, for example Playwright's `reducedMotion: "reduce"` or the rendering panel in DevTools). Every scene shows its complete, static layout, and nothing is left at opacity 0.
  - Once at 360px wide: no horizontal overflow.
- Watch the browser console while you scroll. Treat any error from your files as a bug.
- Read your copy, alt text and aria labels once more against non-negotiable 4.

## Your final report (your last message)

- Which files you created, changed or deleted.
- What a visitor sees, desktop and mobile.
- How it behaves with reduced motion.
- What you verified, with screenshot paths and lint/tsc results.
- Anything left unfinished, and any change you need in a shared piece.
