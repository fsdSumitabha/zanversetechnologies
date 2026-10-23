/* ───────────────────────────────────────────────────────────────────────────
   PAGES — the content for every route other than the homepage.

   The homepage's copy lives in constants/zan.ts and is not touched here. This
   file only adds what a standing page needs and the homepage never did: the
   per-service page model (so one template can render all sixteen service
   pages), the page titles and descriptions, and the small amount of framing
   copy the new sections need.

   Sources, in the same order of preference the rest of the site follows:
     1. constants/zan.ts — services, practices, process, industries, projects,
        metrics, clients, the office, about, FAQs. Imported, never re-typed.
     2. the production main app (zan_webdevelopment/src/data) — the search
        titles and descriptions of the service pages, in the form the previous
        build served on its /ae pages, and the parent pages' own descriptions.

   The site serves one market, so every title and description is written for
   it: where a page names a place, the place is Dubai or the UAE.

   Nothing is invented. No figure, client or claim appears here that is not
   already published by Zan.
   ─────────────────────────────────────────────────────────────────────────── */

import type { IconKey } from "@/components/zan/ui/icons";
import {
  practices,
  site,
  type Practice,
  type ServiceItem,
} from "@/constants/zan";

/* ── Service pages ────────────────────────────────────────────────────────── */

export type PracticeId = "development" | "marketing" | "designing";

export interface ServicePage {
  /** Path under /services, e.g. "digital-marketing/seo-aeo-geo". */
  slug: string;
  /** The same, as route segments. */
  segments: readonly string[];
  /** Full path, e.g. "/services/digital-marketing/seo-aeo-geo". */
  href: string;
  /** Set on a sub-service: the slug of the page above it. */
  parent?: string;
  /** Last segment — the key into the per-service tables (art, hero, FAQs). */
  priceKey: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  capabilities?: readonly string[];
  icon: IconKey;
  practice: PracticeId;
  /** Which practice column this page belongs to, for the eyebrow. */
  practiceTitle: string;
  seoTitle: string;
  seoDescription: string;
}

/**
 * Search title and description for each page: the production site's own
 * (src/data/services.ts, `seo`), in the form the previous build served on its
 * /ae pages, which name Dubai as the place.
 *
 * pageMetadata (lib/metadata.ts) appends " — Zan Verse Technologies", 25
 * characters, to every title, so none of these runs past 37 characters and
 * no rendered <title> past 62. Two are a word shorter than the production
 * titles for exactly that reason: Blockchain drops "Company" and Social
 * Media Management drops "Agency", either of which took the title to 64.
 *
 * Descriptions are all <= 160 characters, the point past which Google
 * truncates.
 */
const SEO: Record<string, { title: string; description: string }> = {
  "web-development": {
    title: "Web Development Company in Dubai",
    description:
      "Custom website development in Dubai - e-commerce, business websites & web applications. Responsive, SEO-ready & scalable. Free consultation.",
  },
  "mobile-apps": {
    title: "App Development Company in Dubai",
    description:
      "Mobile app development in Dubai - iOS, Android, React Native & Flutter apps. From MVP to enterprise. Free quote.",
  },
  "ai-machine-learning": {
    title: "AI & ML Development Company in Dubai",
    description:
      "AI & machine learning solutions in Dubai - custom ML models, chatbots, generative AI & AI consulting. Automate and scale your business.",
  },
  "blockchain-web3": {
    title: "Blockchain Development in Dubai",
    description:
      "Blockchain & Web3 development in Dubai - smart contracts, dApps, NFT platforms & trading bots. Secure, audited solutions. Free consultation.",
  },
  "cloud-devops": {
    title: "Cloud & DevOps Services in Dubai",
    description:
      "Cloud infrastructure & DevOps services in Dubai - AWS, Azure, GCP, CI/CD pipelines & process automation. Scale your operations efficiently.",
  },
  cybersecurity: {
    title: "Cybersecurity Services in Dubai",
    description:
      "Cybersecurity services in Dubai - security audits, penetration testing, smart contract security & monitoring. Protect your digital assets.",
  },
  "digital-marketing": {
    title: "Digital Marketing Agency in Dubai",
    description:
      "Result-driven digital marketing agency in Dubai. SEO, Google Ads, social media marketing & marketing automation. Grow your business online.",
  },
  "branding-and-designing": {
    title: "Branding & Design Agency in Dubai",
    description:
      "Branding and design services in Dubai - UI/UX design, logo and brand identity, graphic design and website design, as disciplines or whole decks.",
  },
  "seo-aeo-geo": {
    title: "SEO, AEO & GEO Services in Dubai",
    description:
      "SEO, AEO & GEO services in Dubai - technical SEO, on-page optimisation, link building and AI-search visibility in ChatGPT, Perplexity & Google AI Overviews.",
  },
  "performance-marketing": {
    title: "Performance Marketing Agency in Dubai",
    description:
      "Performance marketing in Dubai - Google Ads, Meta Ads & LinkedIn Ads managed for ROI. Campaign strategy, A/B testing and conversion tracking.",
  },
  "social-media-management": {
    title: "Social Media Management in Dubai",
    description:
      "Social media management in Dubai - content strategy, reels & carousels, community management and analytics across Instagram, Facebook & LinkedIn.",
  },
  "influencer-marketing": {
    title: "Influencer Marketing Agency in Dubai",
    description:
      "Influencer marketing in Dubai - creator discovery, vetting, negotiation, campaign management and performance tracking across Instagram & YouTube.",
  },
  "ui-ux-design": {
    title: "UI/UX Design Services in Dubai",
    description:
      "UI/UX design in Dubai - user research, wireframing, interactive prototypes, usability testing and production-ready interface design for web and mobile.",
  },
  "brand-identity-design": {
    title: "Logo & Brand Identity Design in Dubai",
    description:
      "Logo design and brand identity in Dubai - logo concepts with revisions, colour palette, typography, brand guidelines and full stationery kit.",
  },
  "graphic-design": {
    title: "Graphic Design Services in Dubai",
    description:
      "Graphic design in Dubai - social media creatives, brochures, company profiles, pitch decks, flyers, banners and packaging design.",
  },
  "website-design": {
    title: "Website Design Services in Dubai",
    description:
      "Website design in Dubai - page layouts, responsive design, design systems and Figma component libraries ready for development handoff.",
  },
};

/**
 * The two parent pages that are practices rather than single services. Their
 * description and capability list are the production site's own (src/data/
 * services.ts, `digital-marketing` and `branding-and-designing`).
 */
const PARENTS: Record<
  string,
  { title: string; tagline: string; description: string; capabilities: readonly string[]; icon: IconKey }
> = {
  "digital-marketing": {
    title: "Digital Marketing",
    tagline: "Grow. Engage. Convert.",
    description:
      "Data-driven marketing strategies that drive traffic, generate leads and accelerate growth across all digital channels. Including SEO, AEO and GEO, so you are findable on Google and citable in ChatGPT, Perplexity and AI Overviews.",
    capabilities: [
      "SEO, AEO & GEO",
      "Performance Marketing",
      "Social Media Management",
      "Influencer Marketing",
    ],
    icon: "growth",
  },
  "branding-and-designing": {
    title: "Branding & Designing",
    tagline: "Design That Gets Remembered.",
    description:
      "From the logo up: brand identity, interface design and the day-to-day collateral a growing business runs on. Sold as individual disciplines or as one of three packages.",
    capabilities: [
      "UI/UX Design",
      "Brand Identity & Logo Design",
      "Graphic Design",
      "Website Design",
    ],
    icon: "palette",
  },
};

const [developmentPractice, marketingPractice, designingPractice] = practices;

const seoFor = (slug: string, fallbackTitle: string, fallbackDescription: string) =>
  SEO[slug] ?? { title: fallbackTitle, description: fallbackDescription };

function areaFromItem(item: ServiceItem, index: number, practice: PracticeId, practiceTitle: string): ServicePage {
  const seo = seoFor(item.id, item.title, item.description);
  return {
    slug: item.id,
    segments: [item.id],
    href: `/services/${item.id}`,
    priceKey: item.id,
    index: String(index + 1).padStart(2, "0"),
    title: item.title,
    tagline: item.tagline,
    description: item.description,
    capabilities: item.capabilities,
    icon: item.icon,
    practice,
    practiceTitle,
    seoTitle: seo.title,
    seoDescription: seo.description,
  };
}

function parentPage(slug: string, index: string, practice: PracticeId, practiceTitle: string): ServicePage {
  const p = PARENTS[slug];
  const seo = seoFor(slug, p.title, p.description);
  return {
    slug,
    segments: [slug],
    href: `/services/${slug}`,
    priceKey: slug,
    index,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    capabilities: p.capabilities,
    icon: p.icon,
    practice,
    practiceTitle,
    seoTitle: seo.title,
    seoDescription: seo.description,
  };
}

function subPage(item: ServiceItem, parent: string, index: number, practice: PracticeId, practiceTitle: string): ServicePage {
  const seo = seoFor(item.id, item.title, item.description);
  return {
    slug: `${parent}/${item.id}`,
    segments: [parent, item.id],
    href: `/services/${parent}/${item.id}`,
    parent,
    priceKey: item.id,
    index: String(index + 1).padStart(2, "0"),
    title: item.title,
    tagline: item.tagline,
    description: item.description,
    capabilities: item.capabilities,
    icon: item.icon,
    practice,
    practiceTitle,
    seoTitle: seo.title,
    seoDescription: seo.description,
  };
}

/** The six development services, then the two practice parents. */
export const areaPages: readonly ServicePage[] = [
  ...developmentPractice.items.map((item, i) => areaFromItem(item, i, "development", developmentPractice.title)),
  parentPage("digital-marketing", "07", "marketing", marketingPractice.title),
  parentPage("branding-and-designing", "08", "designing", designingPractice.title),
];

/** The eight pages that sit under a practice parent. */
export const subPages: readonly ServicePage[] = [
  ...marketingPractice.items.map((item, i) => subPage(item, "digital-marketing", i, "marketing", marketingPractice.title)),
  ...designingPractice.items.map((item, i) =>
    subPage(item, "branding-and-designing", i, "designing", designingPractice.title),
  ),
];

/** Every page /services/[...slug] resolves, area pages first. */
export const servicePages: readonly ServicePage[] = [...areaPages, ...subPages];

export const findServicePage = (segments: readonly string[]): ServicePage | undefined =>
  servicePages.find((p) => p.slug === segments.join("/"));

export const childrenOf = (slug: string): readonly ServicePage[] =>
  subPages.filter((p) => p.parent === slug);

/**
 * The technology bands that genuinely apply to a service page, by `techDomains`
 * id in constants/zan.ts. A page with no honest mapping (cybersecurity, the
 * marketing and design pages) simply does not show the band.
 */
export const serviceTechDomains: Record<string, readonly string[]> = {
  "web-development": ["frontend", "backend", "data"],
  "mobile-apps": ["mobile", "backend"],
  "ai-machine-learning": ["ai", "backend"],
  "blockchain-web3": ["blockchain", "frontend"],
  "cloud-devops": ["cloud", "devops"],
};

/**
 * The three branding decks, which are sold as whole packages rather than per
 * card. Titles, taglines and descriptions are the production site's own
 * (src/data/services.ts, `subServices`). They live on the Branding &
 * Designing page rather than on four URLs of their own, because a client
 * searches for "logo design", not for "Growth Branding Package".
 */
export const brandingPackages = [
  {
    key: "starter-branding-package",
    title: "Starter Branding Package",
    tagline: "Look Established From Day One.",
    description:
      "The essential identity kit for startups and small businesses: a logo you own, a colour and type system that holds together, and every day-one asset ready to hand out.",
  },
  {
    key: "growth-branding-package",
    title: "Growth Branding Package",
    tagline: "One Brand. Every Touchpoint.",
    description:
      "Everything in the Starter package, plus the strategy, templates and digital design a scaling business needs to look and sound the same on every surface it appears.",
  },
  {
    key: "premium-brand-identity",
    title: "Premium Brand Identity",
    tagline: "Own The Category.",
    description:
      "A complete identity system for established companies and enterprises: discovery and competitor work up front, a full design and motion language, and every asset needed to roll it out across screens, print and physical space.",
  },
] as const;

/* ── Page headers ─────────────────────────────────────────────────────────── */

export interface PageIntro {
  eyebrow: string;
  title: readonly string[];
  lead: string;
  /** <title> and description. */
  seoTitle: string;
  seoDescription: string;
}

/**
 * SEARCH TITLES — keyword-bearing, not page names.
 *
 * Bare page names ("Services", "Portfolio") would throw away the keywords
 * these pages rank on and leave most of the usable characters unused. The
 * strings below are the previous site's own (vite-react-shift/vite.config.ts,
 * `routeSeoMeta`), naming Dubai where they name a place, and short enough that
 * the rendered title, `<seoTitle> — Zan Verse Technologies`, stays at or under
 * 62 characters. The services index lost a word to get there: "IT Services &
 * Digital Solutions in Dubai" rendered at 65.
 *
 * Descriptions are all <= 160 characters, the point past which Google
 * truncates. The company name takes 22 of them wherever it appears, which is
 * why the portfolio and process descriptions are worded more tightly than the
 * production site's, and the services one names the place instead.
 */

/**
 * The homepage's own description. It lives here rather than in constants/zan.ts
 * because `site.description` is body copy, written to be read rather than to
 * fit a search result (the Organization node in lib/schema.ts carries it), and
 * at nearly 200 characters it would be cut off there. Same facts, 160 or fewer
 * characters.
 */
export const homeSeo = {
  description:
    "Zan Verse Technologies builds web platforms, mobile apps, AI systems and blockchain products, and runs digital marketing. Based in Dubai Silicon Oasis, UAE.",
} as const;

export const servicesPage: PageIntro = {
  eyebrow: "Services",
  title: ["Powerful solutions", "we can create"],
  lead: "From MVPs to enterprise platforms, here is what we are equipped to build. Each project is customized to your exact requirements.",
  seoTitle: "IT Services & Solutions in Dubai",
  seoDescription:
    "Development, digital marketing and design in Dubai: web and mobile apps, AI, blockchain, cloud, cybersecurity, SEO, paid media, branding and UI/UX.",
};

export const portfolioPage: PageIntro = {
  eyebrow: "Selected work",
  title: ["Projects we have", "delivered"],
  lead: "Recent engagements: the problem we were given, what we built, and what changed afterwards.",
  seoTitle: "Portfolio - Projects & Case Studies",
  seoDescription:
    "Case studies from Zan Verse Technologies in e-commerce, AI support, logistics, mobile and B2B marketing: the brief, the build and the outcome of each.",
};

export const howWeWorkPage: PageIntro = {
  eyebrow: "Process",
  title: ["How we turn ideas", "into reality"],
  lead: "Four steps, weekly progress updates and a live staging environment. You are involved at every stage.",
  seoTitle: "How We Work - Our Development Process",
  seoDescription:
    "How a project runs at Zan Verse Technologies: discovery and strategy, design and prototype, development and testing, then launch and three months of support.",
};

/**
 * /about-us builds its hero from the `about` block in constants/zan.ts and
 * takes only its search title and description from here; the header fields
 * below keep the shape every page intro shares.
 */
export const aboutPage: PageIntro = {
  eyebrow: "About Zan Verse Technologies",
  title: ["Based in Dubai.", "Development, marketing", "and design."],
  lead: site.description,
  seoTitle: "About Us - IT Company in Dubai",
  seoDescription:
    "Zan Verse Technologies is a digital engineering company in Dubai Silicon Oasis, building web, mobile, AI and blockchain products and running digital marketing.",
};

/**
 * The people, in full. The homepage's rail carries the same five and now links
 * here; this is where they get the room a rail cannot give them.
 */
export const ourTeamPage: PageIntro = {
  eyebrow: "Our team",
  title: ["The people", "who do the work"],
  lead: "Developers and marketers, by name, under the practice they work in. The people who scope your project are the people who build it, and you talk to them directly from the first call through to launch.",
  seoTitle: "Our Team - Developers & Marketers",
  seoDescription:
    "Meet the developers and marketers at Zan Verse Technologies. Names, roles and experience for the people who scope, build and run your project, start to finish.",
};

export const contactPage: PageIntro = {
  eyebrow: "Get in touch",
  title: ["Let's build", "something together"],
  lead: "Tell us about your project. Free consultation, no obligation, and a reply within 24 hours.",
  seoTitle: "Contact Us - Get a Free Consultation",
  seoDescription:
    "Talk to Zan Verse Technologies about a project. An office in Dubai Silicon Oasis, a reply within 24 hours and a free consultation with the people who build it.",
};

/* ── Section labels used by the new pages ─────────────────────────────────── */

export const labels = {
  packages: "Packages",
  included: "What is included",
  disciplines: "Disciplines",
  relatedWork: "Related work",
  otherServices: "Other services",
  process: "How we work",
  technology: "Technology",
  /* The eyebrow over the office card on /contact-us and /about-us. There is
     one office, so it reads in the singular. */
  offices: "Office",
  industries: "Industries",
  clients: "Clients",
  atAGlance: "At a glance",
  breadcrumb: "Breadcrumb",
  effective: "Effective",
} as const;

/** The closing call to action every standing page ends on. */
export const pageCta = {
  eyebrow: "Next step",
  title: ["Tell us what you", "are building"],
  lead: "A free consultation, a written proposal within 3 to 5 business days, and no obligation until you sign it.",
} as const;

export const notFoundPage = {
  eyebrow: "404",
  title: ["This page is", "not here"],
  lead: "The address may have changed, or the link that brought you here may be out of date. These are the pages people usually want.",
  seoTitle: "Page not found",
} as const;

/* ── Legal ────────────────────────────────────────────────────────────────── */

export const legalSlugs = [
  "privacy-policy",
  "terms-of-service",
  "refund-policy",
  "cookie-policy",
  "disclaimer",
] as const;

export type LegalSlug = (typeof legalSlugs)[number];

/** One line under each policy's title, so the page opens with its scope. */
export const legalIntro: Record<LegalSlug, string> = {
  "privacy-policy": "How Zan Verse Technologies collects, uses, stores and protects personal data.",
  "terms-of-service": "The terms you agree to when you use this website or engage Zan Verse Technologies.",
  "refund-policy": "When a payment can be refunded, and how a refund is requested.",
  "cookie-policy": "The cookies and tracking technologies this website uses, and how to control them.",
  disclaimer: "The limits of what our content, deliverables and advice represent.",
};

/* ── Helpers shared by the page templates ─────────────────────────────────── */

/** The practice a service page belongs to, for its "other services" list. */
export const practiceOf = (page: ServicePage): Practice | undefined =>
  practices.find((p) => p.id === page.practice);

/* ── Breadcrumb trails ────────────────────────────────────────────────────── */

/** Every trail starts at the homepage, so BreadcrumbList reads as a full path. */
export const homeCrumb = { label: "Home", href: "/" } as const;

/** Home › <this page>, for the six standing pages that sit directly off the root. */
export const pageTrail = (label: string, href: string) => [homeCrumb, { label, href }] as const;

/* ── The route registry ───────────────────────────────────────────────────────
   Every path this site actually serves, with its sitemap weighting. app/sitemap.ts
   is generated from this and nothing else, so a URL can never be advertised
   without a page behind it. Weightings mirror the previous site's.

   Keep in step with app/: the five legal routes, the six standing pages, the
   services index and the sixteen pages /services/[...slug] resolves.
   ─────────────────────────────────────────────────────────────────────────── */

export interface SiteRoute {
  /** Path with a leading slash; the homepage is "/". */
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

export const siteRoutes: readonly SiteRoute[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact-us", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about-us", priority: 0.7, changeFrequency: "monthly" },
  { path: "/how-we-work", priority: 0.7, changeFrequency: "monthly" },
  /* A band below the pages a buyer lands on, and the one page here that
     changes when a person joins or leaves rather than when the offer does. */
  { path: "/our-team", priority: 0.6, changeFrequency: "monthly" },
  // An area page (/services/web-development) outranks a discipline under a
  // practice (/services/digital-marketing/seo-aeo-geo), as it did before.
  ...servicePages.map((page) => ({
    path: page.href,
    priority: page.parent ? 0.7 : 0.8,
    changeFrequency: "monthly" as const,
  })),
  ...legalSlugs.map((slug) => ({
    path: `/${slug}`,
    priority: 0.3,
    changeFrequency: "yearly" as const,
  })),
];
