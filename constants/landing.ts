/* ───────────────────────────────────────────────────────────────────────────
   THE LANDING PAGES: /lp/<slug>

   Paid-traffic pages, one per service, all drawn by one layout
   (components/zan/landing). What differs between them is the entry in
   `landingPages` below; adding a page is adding an entry, and its route, its
   metadata and its form all follow from that.

   The copy is the previous build's landing pages, carried over with its
   structure and its wording, and changed only where this site's rules or the
   brief for these pages require it:

     No prices.      Every figure, currency mark and "from AED …" is gone, from
                     the cards, the sticky bar and the metadata. What is left
                     says how a price is reached, never what it is. Dollar
                     amounts in the case studies are filtered out as well (see
                     `landingProjects`), so no currency appears on these pages.
     One office.     The old pages sold three regions. Here there is Dubai: its
                     number, its address, its WhatsApp, from `office` and `site`.
     This site's     The old pages quoted their own stats. Where this site
     figures.        publishes a figure, that is the one used: 50+ clients rather
                     than "120+ businesses", three months of support rather than
                     "30 days", and no "15+ years", which it does not claim.
     House style.    No em dashes in visible copy, and no "seamless".
     Search terms.   Each section lead and many package descriptions now open
                     with the service as people search for it, so the keywords
                     are words a visitor reads. See below.

   The hero's outcomes were the same three marketing results on every page. Each
   page now quotes its own case study instead, from `projects`, because a figure
   about organic traffic proves nothing about an app.

   WHAT THE ADS ARE JUDGED ON. These pages run on Google Ads in Dubai. Quality
   Score's landing page component measures how relevant and useful the page is
   to someone who clicked the ad, so what counts is the service and the city on
   the page itself: in the h1 (`eyebrow`, which the hero sets inside it), the
   subhead, the hero's list (`serviceTerms`), the section headings and leads, and
   the package descriptions. `seo.keywords` becomes the keywords meta tag, which
   Google ignores; it is here as the record of what each page is built to match.
   Only list what the page actually sells and says. A keyword the page does not
   answer costs more per click and converts worse than no keyword. Keep every term
   in a sentence or a list a visitor can read: hidden text breaks Google's rules.

   The services are the old pages' packages. They carry what they include where
   a price used to be. A page sells one group of them or several; several become
   tabs, so a page with sixteen services is no longer than one with four.
   ─────────────────────────────────────────────────────────────────────────── */

import {
  appDevFaqs,
  clients,
  digitalMarketingFaqs,
  metrics,
  office,
  practices,
  projects,
  webDevFaqs,
  whyUs,
  type FAQ,
  type Project,
} from "@/constants/zan";

/* ── The figures ─────────────────────────────────────────────────────────── */

export type LandingStatId = "projects" | "clients" | "rating" | "on-time" | "support" | "response";

export interface LandingStat {
  id: LandingStatId;
  value: string;
  label: string;
}

const fromMetrics = (id: LandingStatId, label: string, suffix = ""): LandingStat => ({
  id,
  value: `${metrics.find((m) => m.id === id)?.value ?? ""}${suffix}`,
  label,
});

/** The six in the proof grid. The support figure is the three months the process promises. */
export const landingStats: readonly LandingStat[] = [
  fromMetrics("projects", "Projects delivered"),
  fromMetrics("clients", "Clients worldwide"),
  fromMetrics("rating", "Client rating", "/5"),
  fromMetrics("on-time", "On-time delivery"),
  { id: "support", value: "3 months", label: "Post-launch support" },
  fromMetrics("response", "Response time"),
];

const stat = (id: LandingStatId) => landingStats.find((s) => s.id === id)?.value ?? "";

/** The four in the closing block. */
export const closingStats: readonly LandingStat[] = landingStats.filter((s) =>
  ["projects", "clients", "rating", "on-time"].includes(s.id),
);

/* ── The shape of one page ───────────────────────────────────────────────── */

/** One drawing in components/zan/landing/PackageArt.tsx. */
export type PackageArtKey =
  | "campaign-page"
  | "starter-site"
  | "business-site"
  | "online-store"
  | "mvp-app"
  | "cross-platform"
  | "enterprise-app"
  | "app-care"
  | "seo"
  | "ai-search"
  | "search-bundle"
  | "aso"
  | "google-ads"
  | "meta-ads"
  | "linkedin-ads"
  | "full-funnel"
  | "social-starter"
  | "social-growth"
  | "social-scale"
  | "content-production"
  | "creator-vetting"
  | "creator-campaign"
  | "ugc-whitelist"
  | "creator-attribution";

export interface LandingPackage {
  title: string;
  description: string;
  /** What it includes, in the place a price used to be. */
  includes: readonly string[];
  popular?: boolean;
  art: PackageArtKey;
}

/** One group of packages. A page with more than one shows them as tabs. */
export interface LandingDeck {
  /** The tab's name, and the "What do you need?" list's heading. */
  label: string;
  /** What the group covers, under its name on the tab. */
  covers: string;
  /** Above the group's cards, when a tab needs saying what it is. */
  intro?: { tagline: string; description: string };
  packages: readonly LandingPackage[];
}

export interface LandingComparison {
  title: string;
  description: string;
  feature: string;
  /** The ways of doing it: the table's columns. */
  options: readonly string[];
  /** The option the page itself is selling, if it sells one: a tint, not a claim. */
  highlight?: number;
  rows: readonly { feature: string; values: readonly string[] }[];
  recommendation: string;
}

export interface LandingPage {
  /** Last path segment: /lp/<slug>. */
  slug: string;
  /** Short name, for the sticky bar and in running copy. */
  label: string;
  /** The enquiry's `service`: in the words of the site's own form, so reports agree. */
  service: string;
  /** Title under about 60 characters and description under about 160, or Google cuts them. */
  seo: { title: string; description: string; keywords: readonly string[] };
  /** The service and the city, as a searcher types them. Set inside the h1. */
  eyebrow: string;
  headline: { lead: string; accent: string };
  subhead: string;
  /** The services in the words people search for: the hero's visible list. */
  serviceTerms: readonly string[];
  /** Three results from this page's own case studies. */
  outcomes: readonly { value: string; label: string }[];
  /** One headline number, taken from a case study shown on this page. */
  proof: { value: string; label: string };
  packagesIntro: { title: readonly string[]; lead: string };
  decks: readonly LandingDeck[];
  /** `Project.category`: the case studies this page shows. */
  projectCategory: string;
  comparison: LandingComparison;
  faqs: readonly FAQ[];
  /**
   * The two questions shown open. The ones a buyer has come to ask, rather than
   * the first two in the list, which on both pages are definitions.
   */
  featuredFaqs: readonly [string, string];
}

/* ── The pages ───────────────────────────────────────────────────────────── */

/** A marketing discipline's own line, as its service page has it. */
function marketingService(id: string) {
  const service = practices.find((p) => p.id === "marketing")?.items.find((s) => s.id === id);
  return { tagline: service?.tagline ?? "", description: service?.description ?? "" };
}

export const landingPages: readonly LandingPage[] = [
  {
    slug: "web-development",
    label: "Web Development",
    service: "Web Development",
    seo: {
      title: "Web Development Company in Dubai | Free Website Quote",
      description: `Website development services in Dubai from a web development agency: business websites, e-commerce and custom web apps. ${stat("projects")} projects, ${stat("rating")} rating. Free quote.`,
      /* From the client's Keyword Planner report (searches July to September 2026):
         highest searches first, then the rows the report has no figures for. Left
         out: "best" and "top", which this site cannot prove, and the India group,
         which the client is not running. */
      keywords: [
        "website development",
        "website development company",
        "web development company",
        "web development agency",
        "website development services",
        "web development services",
        "website design and development",
        "web developers near me",
        "build shopify website",
        "shopify website development",
        "shopify web development company",
        "web design and development services",
        "website development company near me",
        "website development near me",
        "web development near me",
        "web designing company near me",
        "ecommerce web development",
        "web application development",
        "website and app development",
        "website development cost",
        "web design company",
        "website development firm",
        "custom website development",
        "professional website development",
        "corporate website development",
        "web development agency near me",
        "ecommerce website development company",
        "ecommerce website development services",
        "build ecommerce website",
        "ecommerce website design companies",
        "wordpress website development company",
        "wordpress website development",
        "wordpress development services",
        "shopify website developer",
        "web app development company",
        "web application development company",
        "custom web app development services",
        "web portal development company",
        "website development packages",
        "website development prices",
        "web development pricing",
        "cost of web design",
        "web development company dubai",
        "website development company in dubai",
        "web design company dubai",
        "website design dubai",
        "web development agency dubai",
        "website development company uae",
        "web design company uae",
        "ecommerce website development dubai",
        "shopify developer dubai",
        "website design cost dubai",
      ],
    },
    eyebrow: "Web Development Company in Dubai",
    headline: { lead: "Websites That Turn", accent: "Traffic Into Revenue" },
    subhead:
      "Website development services in Dubai, from a starter site to a custom web application: designed to convert, built to scale, and priced before a line of code is written.",
    serviceTerms: [
      "Website development",
      "Web development services",
      "Website design and development",
      "Corporate website development",
      "E-commerce website development",
      "Shopify website development",
      "Web application development",
      "WordPress website development",
    ],
    outcomes: [
      { value: "340%", label: "Increase in online sales" },
      { value: "1.8s", label: "Page load, down from 6.2s" },
      { value: "45%", label: "Higher conversion rate" },
    ],
    proof: { value: "340%", label: "increase in online sales for a fashion retailer" },
    packagesIntro: {
      title: ["Website development", "packages in Dubai"],
      lead: "We are a web development agency and website development company in Dubai. Our web developers provide web design and development services, from landing pages to e-commerce websites, Shopify stores and custom web apps. Website development cost in Dubai depends on scope, so the final price is confirmed in a written quotation before work begins.",
    },
    decks: [
      {
        label: "Website & web app packages",
        covers: "",
        packages: [
          {
            title: "Landing Page Development",
            description:
              "Landing page design and development for one campaign. Fast-loading and mobile-first, with the lead form, WhatsApp handoff and conversion tracking wired in.",
            includes: ["Lead form and WhatsApp", "Mobile-first build", "Conversion tracking", "Live in 3-5 days"],
            art: "campaign-page",
          },
          {
            title: "Starter Websites",
            description:
              "Professional website development for new businesses and personal brands. Includes 5-7 responsive pages, CMS integration, and essential features to establish your online presence.",
            includes: ["5-7 responsive pages", "CMS integration", "SEO ready", "Contact forms"],
            art: "starter-site",
          },
          {
            title: "Business Websites",
            description:
              "Corporate website development and website design in Dubai, with a custom UI, advanced analytics integration, and enhanced functionality for growing companies seeking professional digital storefronts.",
            includes: ["Custom UI design", "Advanced analytics", "Blog integration", "Security hardened"],
            popular: true,
            art: "business-site",
          },
          {
            title: "E-commerce Platforms",
            description:
              "E-commerce website development in Dubai: full-featured online stores with secure payment gateways, inventory management, and a checkout built to drive conversions. We can also build a Shopify website if that suits your store.",
            includes: ["Payment gateway", "Inventory management", "Order tracking", "Customer accounts"],
            popular: true,
            art: "online-store",
          },
        ],
      },
    ],
    projectCategory: "web-development",
    comparison: {
      title: "WordPress vs custom website development",
      description:
        "Choosing between WordPress and custom development depends on your budget, timeline, and long-term goals. Here is a side-by-side comparison to help you decide.",
      feature: "Feature",
      options: ["WordPress", "Custom Development"],
      highlight: 1,
      rows: [
        { feature: "Initial investment", values: ["Lower upfront", "Higher upfront"] },
        { feature: "Development time", values: ["Faster setup", "Longer but tailored"] },
        { feature: "Flexibility", values: ["Limited by themes and plugins", "Fully customizable"] },
        { feature: "Scalability", values: ["Slows at 50K+ monthly visitors", "Handles millions of users"] },
        { feature: "Security", values: ["Frequent plugin vulnerabilities", "Custom security architecture"] },
        { feature: "SEO control", values: ["Plugin-dependent (Yoast, RankMath)", "Full control over every element"] },
        { feature: "Maintenance", values: ["Plugin and core updates required", "Only your code to maintain"] },
        { feature: "Best for", values: ["Blogs, small business sites", "E-commerce, SaaS, enterprise apps"] },
      ],
      recommendation:
        "Choose WordPress for quick, budget-friendly sites with standard features. Choose custom development when you need unique functionality, high performance, or plan to scale significantly. As a web design company in Dubai, we provide WordPress development services and custom builds, and help you pick the right approach for your goals.",
    },
    /* The Shopify question is this page's own: webDevFaqs is also the main site's
       service page, and that page does not offer Shopify. */
    faqs: [
      {
        question: "Are you a Shopify developer in Dubai?",
        answer:
          "Yes. We are a Shopify web development company as well as a custom and WordPress developer. A Shopify website developer on our team builds your store, and we help you decide whether Shopify or a custom build suits it. The scope is confirmed in a written quotation before work begins.",
      },
      ...webDevFaqs,
    ],
    featuredFaqs: ["How much does website development cost?", "How long does it take to build a custom website?"],
  },
  {
    slug: "app-development",
    label: "App Development",
    service: "Mobile App Development",
    seo: {
      title: "Mobile App Development Company in Dubai | Free Quote",
      description:
        "iOS and Android app development in Dubai. Flutter, React Native and native builds, from MVP to enterprise, with AI features where you need them. Free quote.",
      keywords: [
        "mobile app development company dubai",
        "mobile app development dubai",
        "app development company dubai",
        "app developers dubai",
        "ios app development dubai",
        "android app development dubai",
        "flutter app development dubai",
        "react native app development dubai",
        "cross platform app development uae",
        "mvp app development dubai",
        "ai app development dubai",
        "enterprise app development dubai",
        "fintech app development dubai",
        "ecommerce app development dubai",
        "app maintenance dubai",
        "app development cost dubai",
      ],
    },
    eyebrow: "Mobile App Development Company in Dubai",
    headline: { lead: "Mobile Apps Users", accent: "Keep Coming Back To" },
    subhead:
      "iOS and Android app development in Dubai. Validate an idea with an MVP or ship a full native build: one team, a single codebase where it makes sense, and a price agreed up front.",
    serviceTerms: [
      "iOS app development",
      "Android app development",
      "Flutter app development",
      "React Native app development",
      "Cross-platform app development",
      "MVP app development",
      "Enterprise app development",
      "AI app development",
    ],
    outcomes: [
      { value: "15,000+", label: "Downloads in month one" },
      { value: "4.7", label: "App Store rating" },
      { value: "68%", label: "Daily active users" },
    ],
    proof: { value: "15,000+", label: "downloads in month one for a fitness startup" },
    packagesIntro: {
      title: ["Mobile app development", "packages in Dubai"],
      /* AI, fintech and e-commerce are the site's own practices and industries,
         named here because the page has to answer those searches. */
      lead: "We are an app development company in Dubai, and our app developers cover everything from a first MVP to e-commerce app development, fintech app development and AI features such as chatbots. App development cost in Dubai depends on scope, so the final price is confirmed in a written quotation before work begins.",
    },
    decks: [
      {
        label: "App development packages",
        covers: "",
        packages: [
          {
            title: "MVP Apps",
            description:
              "MVP app development: Android or iOS applications perfect for testing your concept and gaining early traction in the market.",
            includes: ["Core features", "App store submission", "Push notifications", "Cloud backend"],
            popular: true,
            art: "mvp-app",
          },
          {
            title: "Cross-Platform Apps",
            description:
              "Cross-platform app development: Flutter or React Native apps that work across both iOS and Android devices with a single codebase.",
            includes: ["Single codebase", "iOS and Android", "Native performance", "Platform-specific UI"],
            popular: true,
            art: "cross-platform",
          },
          {
            title: "Enterprise Native Apps",
            description:
              "Enterprise app development: full-featured native applications with advanced functionality and optimal performance for demanding business needs.",
            includes: ["Native Swift and Kotlin", "Offline support", "Enterprise security", "Custom integrations"],
            art: "enterprise-app",
          },
          {
            title: "App Maintenance",
            description:
              "App maintenance: ongoing updates, bug fixes, and feature enhancements to keep your app running smoothly and up-to-date.",
            includes: ["Bug fixes", "OS updates", "Security patches", "Analytics reports"],
            art: "app-care",
          },
        ],
      },
    ],
    projectCategory: "mobile-apps",
    comparison: {
      title: "Native vs cross-platform app development",
      description:
        "The choice between native and cross-platform app development affects your budget, timeline, and app performance. Here is what you need to know.",
      feature: "Feature",
      options: ["Native (Swift, Kotlin)", "Cross-Platform (React Native, Flutter)"],
      highlight: 1,
      rows: [
        {
          feature: "Performance",
          values: ["Best possible (direct hardware access)", "Near-native (95%+ performance)"],
        },
        { feature: "Development cost", values: ["Higher (separate iOS and Android teams)", "Lower (single codebase)"] },
        { feature: "Time to market", values: ["Longer", "Faster"] },
        { feature: "Code reuse", values: ["0% (separate codebases)", "80 to 95% shared code"] },
        { feature: "Native features", values: ["Full access to all APIs", "Most APIs via bridges and plugins"] },
        { feature: "UI and UX quality", values: ["Platform-perfect look and feel", "Customizable, near-native"] },
        { feature: "Maintenance", values: ["2 teams needed", "1 team for both platforms"] },
        { feature: "Best for", values: ["High-performance apps, AR/VR, games", "MVPs, business apps, startups"] },
      ],
      recommendation:
        "For most businesses, cross-platform development with React Native or Flutter offers the best balance of cost, speed, and quality. Choose native only for performance-critical applications like AR/VR, complex animations, or apps that need deep hardware integration.",
    },
    faqs: appDevFaqs,
    featuredFaqs: ["How much does it cost to develop a mobile app?", "How long does mobile app development take?"],
  },
  {
    slug: "digital-marketing",
    label: "Digital Marketing",
    /* A heading of the site's service list rather than an option under it, because
       this page sells all four of its disciplines. The package goes in the message. */
    service: "Digital Marketing",
    seo: {
      title: "Digital Marketing Agency in Dubai | SEO, Google Ads & Social",
      description: `Full service digital marketing agency in Dubai: SEO, Google Ads, social media and performance marketing, reported against revenue. ${stat("rating")} rating. Free quote.`,
      /* From the client's Keyword Planner report for this campaign (searches July
         to September 2026): highest searches first, then the six Dubai rows the
         report has no figures for. After those, what else the page sells that the
         report does not cover. The report's match types and negative keywords
         belong in the Google Ads campaign, not here. */
      keywords: [
        "digital marketing agency",
        "marketing agency near me",
        "digital marketing agency near me",
        "digital marketing services",
        "digital marketing company",
        "performance marketing agency",
        "social media marketing agency",
        "digital marketing companies near me",
        "real estate digital marketing agency",
        "ecommerce agency",
        "seo agency near me",
        "ppc agency",
        "full service digital marketing agency",
        "digital marketing agency for small business",
        "digital marketing agency dubai",
        "digital marketing company dubai",
        "marketing agency in dubai",
        "social media marketing agency dubai",
        "performance marketing agency dubai",
        "seo agency dubai",
        "digital marketing services dubai",
        "seo services dubai",
        "google ads agency dubai",
        "ppc agency dubai",
        "ppc management dubai",
        "meta ads agency dubai",
        "linkedin ads agency uae",
        "social media management dubai",
        "influencer marketing agency dubai",
        "generative engine optimization dubai",
        "answer engine optimization dubai",
        "ai seo agency dubai",
        "app store optimization uae",
      ],
    },
    eyebrow: "Digital Marketing Agency in Dubai",
    headline: { lead: "Marketing Judged On", accent: "What It Returns" },
    subhead:
      "Digital marketing services in Dubai from a full service digital marketing agency: SEO, Google Ads, Meta Ads, social media marketing and influencer marketing run as one strategy, with the tracking to prove which part of the spend actually worked.",
    serviceTerms: [
      "Digital marketing services",
      "SEO services",
      "AI SEO (AEO and GEO)",
      "Google Ads management",
      "PPC management",
      "Performance marketing",
      "Social media marketing",
      "Influencer marketing",
      "Real estate digital marketing",
      "E-commerce marketing",
      "Small business digital marketing",
    ],
    outcomes: [
      { value: "3x", label: "Organic traffic growth" },
      { value: "180%", label: "More qualified leads" },
      { value: "42%", label: "Lower cost per acquisition" },
    ],
    proof: { value: "3x", label: "organic traffic in six months for a B2B SaaS" },
    packagesIntro: {
      title: ["Digital marketing", "services in Dubai"],
      lead: "We are a full service digital marketing agency and digital marketing company in Dubai, so you brief one team instead of a separate SEO agency, AI SEO agency, PPC agency, performance marketing agency, social media marketing agency and influencer marketing agency. Buy one service or run them together. Final scope is confirmed in a written quotation before work begins.",
    },
    decks: [
      {
        label: "Search",
        covers: "SEO, AEO & GEO",
        intro: marketingService("seo-aeo-geo"),
        packages: [
          {
            title: "SEO",
            description:
              "SEO services from an SEO agency in Dubai: technical, on-page and content-led SEO that compounds. We fix what blocks crawlers, build the pages that rank, and earn the links that hold those rankings.",
            includes: ["Technical audit", "On-page optimisation", "Link building", "Monthly reporting"],
            popular: true,
            art: "seo",
          },
          {
            title: "AEO + GEO (AI Search)",
            description:
              "AI SEO: answer engine optimisation and generative engine optimisation, structuring your content so AI assistants quote you by name instead of your competitor.",
            includes: ["Schema markup", "Entity building", "Citation-worthy content", "AI visibility tracking"],
            art: "ai-search",
          },
          {
            title: "Search Growth Bundle",
            description:
              "SEO, AEO and GEO managed as one strategy rather than three workstreams. Best value, and the only way the three actually reinforce each other.",
            includes: ["Full search stack", "Shared content calendar", "Unified reporting", "Quarterly roadmap"],
            popular: true,
            art: "search-bundle",
          },
          {
            title: "ASO (App Store Optimization)",
            description:
              "Store-listing optimisation for the App Store and Play Store, the search channel most app teams leave entirely untouched.",
            includes: ["Keyword research", "Listing copy", "Rating strategy", "Install analytics"],
            art: "aso",
          },
        ],
      },
      {
        label: "Paid Media",
        covers: "Performance Marketing",
        intro: marketingService("performance-marketing"),
        packages: [
          {
            title: "Google Ads",
            description:
              "PPC management from a PPC agency and Google Ads agency in Dubai: Search, Display, Shopping and Performance Max campaigns built around intent, and kept clean with disciplined negative-keyword hygiene.",
            includes: ["Keyword strategy", "Bid management", "PMax setup", "Conversion tracking"],
            art: "google-ads",
          },
          {
            title: "Meta Ads",
            description:
              "Facebook and Instagram campaigns from a Meta Ads agency in Dubai, driven by creative testing and tight audience work, including click-to-WhatsApp for markets that convert in chat.",
            includes: ["Audience building", "Creative testing", "Click-to-WhatsApp", "Pixel and CAPI setup"],
            art: "meta-ads",
          },
          {
            title: "LinkedIn Ads",
            description:
              "B2B lead generation and account-based marketing from a LinkedIn Ads agency in the UAE, aimed at the specific seniority tiers that sign off on your deal.",
            includes: ["ABM setup", "Seniority-tier targeting", "Lead-gen forms", "Pipeline reporting"],
            art: "linkedin-ads",
          },
          {
            title: "Full-Funnel Performance Marketing",
            description:
              "As a performance marketing agency in Dubai, we run every paid channel as one system: shared creative testing, shared audiences, and one dashboard that reconciles spend against revenue.",
            includes: ["Cross-platform campaign build", "A/B testing", "Budget optimisation", "Unified reporting"],
            popular: true,
            art: "full-funnel",
          },
        ],
      },
      {
        label: "Social",
        covers: "Social Media Management",
        intro: marketingService("social-media-management"),
        packages: [
          {
            title: "Social Starter",
            description:
              "Social media management for small and local businesses and new brands that need a consistent, credible presence before they spend on ads.",
            includes: ["1-2 platforms", "12-14 posts a month", "Caption and hashtag strategy", "Monthly report"],
            art: "social-starter",
          },
          {
            title: "Social Growth",
            description:
              "Social media marketing from a social media marketing agency in Dubai, with reels, carousels and active community management, for brands ready to turn followers into a pipeline.",
            includes: ["2-3 platforms", "16-20 posts a month", "Reels and carousels", "Community management"],
            popular: true,
            art: "social-growth",
          },
          {
            title: "Social Scale",
            description:
              "Multi-platform publishing with premium video production and influencer coordination for brands competing on share of attention.",
            includes: ["3-4 platforms", "24+ posts a month", "Premium video and reels", "Influencer coordination"],
            art: "social-scale",
          },
          {
            title: "Content Production",
            description:
              "The studio layer behind the calendar: shoots, edits, motion graphics and copy, produced in batches so publishing never stalls.",
            includes: ["Photo and video shoots", "Motion graphics", "Copywriting", "Batch production"],
            art: "content-production",
          },
        ],
      },
      {
        label: "Creators",
        covers: "Influencer & Creator Marketing",
        intro: marketingService("influencer-marketing"),
        packages: [
          {
            title: "Creator Discovery & Vetting",
            description:
              "Influencer marketing starts with the shortlist, built on audience quality, not follower count: engagement authenticity, audience overlap and brand-safety checks before any money moves.",
            includes: [
              "Audience quality analysis",
              "Engagement authenticity",
              "Brand-safety screening",
              "Shortlist and rationale",
            ],
            popular: true,
            art: "creator-vetting",
          },
          {
            title: "Campaign Management",
            description:
              "Briefing, contracting, content approvals and scheduling handled for you, so creators ship on time and on message.",
            includes: ["Creative briefs", "Contracting and negotiation", "Content approvals", "Publishing schedule"],
            popular: true,
            art: "creator-campaign",
          },
          {
            title: "UGC & Whitelisting",
            description:
              "Turn the best-performing creator content into paid assets: licensed, whitelisted and pushed through your own ad accounts.",
            includes: ["UGC licensing", "Spark and whitelisted ads", "Creative repurposing", "Creative testing"],
            art: "ugc-whitelist",
          },
          {
            title: "Performance & Attribution",
            description:
              "Every collaboration tracked to a number: reach, engagement, referral traffic and assisted conversions, reported against spend.",
            includes: ["Tracking links and codes", "Referral traffic", "Assisted conversions", "Campaign wrap report"],
            art: "creator-attribution",
          },
        ],
      },
    ],
    projectCategory: "digital-marketing",
    comparison: {
      title: "SEO vs PPC vs social media marketing",
      description:
        "Each digital marketing channel has distinct strengths. Understanding the differences helps you allocate your budget effectively for maximum ROI.",
      feature: "Feature",
      options: ["SEO", "PPC (Google Ads)", "Social Media"],
      rows: [
        { feature: "Time to results", values: ["Gradual (months)", "Immediate", "Moderate"] },
        { feature: "Monthly investment", values: ["Moderate", "Variable (budget-dependent)", "Moderate"] },
        {
          feature: "Long-term ROI",
          values: ["Highest (compounds over time)", "Stops when you stop paying", "Moderate (builds brand equity)"],
        },
        {
          feature: "Targeting precision",
          values: ["Keyword-based intent", "Highly precise (demographics, intent)", "Interest and behavior-based"],
        },
        { feature: "Brand building", values: ["Authority and trust", "Low brand impact", "Strongest for awareness"] },
        {
          feature: "Lead quality",
          values: ["High (intent-driven)", "High (intent-driven)", "Variable (awareness-stage)"],
        },
        { feature: "Scalability", values: ["Slow but sustainable", "Instant but costly", "Moderate"] },
        {
          feature: "Best for",
          values: ["Long-term growth", "Quick leads and sales", "Brand awareness and engagement"],
        },
      ],
      recommendation:
        "The most effective strategy combines all three channels. Start with PPC for immediate leads, invest in SEO for long-term compounding growth, and use social media to build brand awareness. As a digital marketing agency in Dubai, we build integrated strategies that use each channel's strengths.",
    },
    /* The first five are this page's own, as the web page's Shopify question is:
       digitalMarketingFaqs is also the main site's service page, and these answer
       what the ads bid on. None is a new claim: each answer is this page's services,
       the industries the site already lists, and the office. */
    faqs: [
      {
        question: "Are you a full service digital marketing agency in Dubai?",
        answer:
          "Yes. We are a digital marketing company with one team for SEO, AEO and GEO, Google Ads, Meta Ads, LinkedIn Ads, social media marketing and influencer marketing, so you do not need a separate agency for each. Buy one service or run them together. The scope is confirmed in a written quotation before work begins.",
      },
      {
        question: "Is there a digital marketing agency near me in Dubai?",
        answer: `Yes, if you are in Dubai or elsewhere in the UAE. Our office is at ${office.addressLines.join(", ")}, and you can call or message us on WhatsApp at ${office.phoneDisplay}. So if you searched for a marketing agency near me, digital marketing companies near me or an SEO agency near me, you can brief one team here for all of it.`,
      },
      {
        question: "Are you a digital marketing agency for small business?",
        answer:
          "Yes. A small business can start with one focused service, such as SEO, Google Ads or our Social Starter package, and build the budget in phases as it starts to return. The first call and the written proposal are free, and nothing is charged until the proposal is signed off.",
      },
      {
        question: "Are you a real estate digital marketing agency?",
        answer:
          "Yes. Real estate is one of the industries we work with. For property companies in Dubai that means Google Ads for people already searching, Meta Ads with click-to-WhatsApp for buyers who prefer to talk in chat, and SEO for the searches that keep coming after the ads stop. Results are reported against revenue.",
      },
      {
        question: "Are you an ecommerce agency?",
        answer:
          "Yes. For e-commerce brands we run Google Shopping and Performance Max campaigns, Meta Ads with creative testing, SEO and influencer marketing, reported against revenue. We are also a web development company, so we can build the online store itself.",
      },
      ...digitalMarketingFaqs,
    ],
    featuredFaqs: ["How much should I budget for digital marketing?", "How long does SEO take to show results?"],
  },
];

export const landingPageBySlug = (slug: string): LandingPage | undefined =>
  landingPages.find((page) => page.slug === slug);

export const landingPath = (slug: string) => `/lp/${slug}`;

/* ── Worked out from a page ──────────────────────────────────────────────── */

/**
 * The page's case studies, as /portfolio publishes them, less any result quoted
 * in money. "$500K seed funding" is a client's outcome rather than a price, and
 * it stays on the portfolio; these pages carry no currency figure of any kind.
 */
export function landingProjects(page: LandingPage): readonly Project[] {
  return projects
    .filter((p) => p.category === page.projectCategory)
    .map((p) => ({ ...p, results: p.results.filter((r) => !/[$€£]|AED/.test(r.value)) }));
}

/** The two questions shown open, then the rest in their published order. */
export function splitFaqs(page: LandingPage): { featured: readonly FAQ[]; rest: readonly FAQ[] } {
  const isFeatured = (faq: FAQ) => page.featuredFaqs.includes(faq.question);
  return {
    featured: page.featuredFaqs
      .map((question) => page.faqs.find((faq) => faq.question === question))
      .filter((faq): faq is FAQ => Boolean(faq)),
    rest: page.faqs.filter((faq) => !isFeatured(faq)),
  };
}

/* ── The copy every page shares ──────────────────────────────────────────── */

const sections = [
  { id: "services", label: "Services" },
  { id: "why-us", label: "Why Us" },
  { id: "process", label: "Process" },
  { id: "work", label: "Our Work" },
  { id: "faq", label: "FAQ" },
] as const;

export const landingCopy = {
  /** The nav's anchors, in page order. Nothing routes a paid visitor away from the form. */
  sections,
  cta: { primary: "Get My Free Quote", nav: "Get Free Quote", closing: "Send My Enquiry" },

  /** Who the hero's rating row names: this site's figures, no list of countries. */
  rating: { value: stat("rating"), trusted: "Trusted by", clients: `${stat("clients")} clients` },
  /** Five client marks beside the rating, in place of the old page's stock faces. */
  ratingClients: clients.slice(0, 5),

  /** The heading of the hero's list. It puts the city beside every term in it. */
  servicesLabel: "Services in Dubai",

  heroForm: {
    title: "Get your free growth plan",
    lead: "Takes under a minute. A real strategist replies, not a bot.",
    reassurances: ["NDA on request", "You own the IP", "No hidden costs"],
  },
  popup: {
    eyebrow: "Free consultation",
    title: "Get your free quote",
    lead: "Takes under a minute. A real strategist replies, not a bot.",
  },
  formNote: "No spam, no obligation. We reply within 24 hours.",

  next: {
    eyebrow: "Free consultation",
    title: ["Tell us what you need.", "We'll price it honestly."],
    lead: (topic: string) =>
      `Expert guidance on scope, cost and timeline for your ${topic} project in Dubai, before you commit to anything.`,
    steps: [
      {
        title: "A 30-minute discovery call",
        body: "Booked within 24 hours. We talk goals, audience, budget range and timeline, with no pitch deck.",
      },
      {
        title: "A written proposal in 3-5 days",
        body: "Scope, milestones, a line-item cost breakdown and a tech-stack recommendation.",
      },
      {
        title: "No obligation until you sign",
        body: "Nothing is charged, and nothing is committed, until the proposal is signed off.",
      },
    ],
    points: ["NDA on request", "You own the IP", "No hidden costs"],
  },

  clients: { label: "Trusted by brands and businesses worldwide" },

  packages: { eyebrow: "Services", popular: "Popular", action: "Get a quote for this" },

  why: {
    eyebrow: "Why us",
    title: ["Six reasons clients", "stay with us"],
    /* The first, second, third and fifth are this site's own wording (`whyUs`).
       The other two come from the old pages, which listed six. */
    reasons: [
      whyUs.items[0],
      whyUs.items[1],
      whyUs.items[2],
      {
        id: "fresh-perspectives",
        title: "Fresh Perspectives",
        tagline: "New eyes catch more",
        description:
          "No legacy thinking. We bring innovative solutions and creative problem-solving to every challenge, yours included.",
      },
      whyUs.items[3],
      {
        id: "passionate",
        title: "Passionate & Hungry",
        tagline: "Everything to prove",
        description:
          "We're building our reputation one project at a time. Your satisfaction isn't just important, it's everything.",
      },
    ],
  },

  process: {
    eyebrow: "How we work",
    title: ["Four stages,", "no surprises"],
    lead: "You see progress weekly: live staging environments, sprint demos and direct access to the people building it.",
  },

  work: {
    eyebrow: "Our work",
    title: ["Projects, and the", "numbers they moved"],
    brief: "The brief",
    built: "What we built",
    more: "See what we can do for you",
    compareEyebrow: "Which is right for you",
    verdict: "Our recommendation",
  },

  faq: {
    eyebrow: "FAQ",
    title: ["Questions we get", "every week"],
    lead: (topic: string) => `Everything worth knowing about ${topic} in Dubai before you brief anyone.`,
    more: (count: number) => `See ${count} more questions`,
    less: "Hide these questions",
    still: "Still unsure?",
    ask: "Ask us directly",
    reply: "We answer within 24 hours.",
  },

  closing: {
    title: ["Let's build something", "great together"],
    lead: (topic: string) =>
      `Book a free 30-minute consultation about ${topic} in Dubai. We will tell you what your project should cost and how long it should take, whether or not you work with us.`,
    served: "Serving businesses in Dubai and across the UAE.",
    form: { title: "Request a callback", lead: "One form, one reply, no sales sequence." },
  },

  footer: {
    blurb: "Web development, mobile apps and digital marketing, delivered by one team and quoted up front.",
    mainSite: "Visit the main site",
  },

  notFound: {
    eyebrow: "Page not found",
    title: ["This page", "isn't here"],
    lead: "The link you followed may be out of date. These are the pages we run at the moment.",
  },
} as const;
