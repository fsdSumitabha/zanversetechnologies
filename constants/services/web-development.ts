import type { ServiceContent } from "./types";

/* /services/web-development. Facts about the company come from constants/zan.ts,
   constants/landing.ts and the terms in constants/legal.ts. The outside facts are
   the three under `sources`, each read on 5 November 2026. */
export const content: ServiceContent = {
  h1: "Web Development Company in Dubai",
  seoTitle: "Web Development Company in Dubai",
  seoDescription:
    "Website development services in Dubai for business websites, e-commerce stores, landing pages and custom web applications, built by Zan Verse Technologies.",
  lead: "Zan Verse Technologies is a web development company in Dubai. We build business websites, online stores, landing pages and custom web applications for companies in Dubai and across the UAE, and you deal directly with the developers doing the work.",
  sections: [
    {
      heading: "Website development services in Dubai: five kinds of project",
      paragraphs: [
        "What the site has to do for your business decides which of these five fits, from one campaign page to a full application. Design can be part of the same project or bought on its own.",
      ],
      bullets: [
        "Starter websites: 5 to 7 responsive pages with a content management system and contact forms, for a new business or personal brand establishing its online presence.",
        "Business websites: a custom interface, a blog, advanced analytics and hardened security, for a growing company whose site has to do more than introduce it.",
        "E-commerce platforms: online stores that take payment and manage stock, orders and customer accounts.",
        "Custom web applications: software people use in a browser, such as dashboards, booking systems and CRM systems, for work a website alone cannot do.",
        "Landing pages: one fast, mobile-first page for one campaign, with the lead form, WhatsApp handoff and conversion tracking wired in, live in 3 to 5 days.",
      ],
      links: [
        { label: "Web design company in Dubai", href: "/services/branding-and-designing/website-design" },
        { label: "UI/UX design services in Dubai", href: "/services/branding-and-designing/ui-ux-design" },
      ],
    },
    {
      heading: "E-commerce website development in Dubai: Shopify or custom?",
      paragraphs: [
        "Our e-commerce builds connect the payment gateway, inventory management, order tracking, customer accounts and a secure checkout.",
        "Our Shopify development services suit a store that fits how Shopify already works. Shopify is a hosted platform with its own checkout and admin, so there is less to build and less to maintain.",
        "Custom website development suits a store whose rules do not fit a platform, which can happen with several vendors in one marketplace or stock tied to your own systems. It usually costs more up front and takes longer, and in return the whole system is built around your business.",
        "For a company site or blog with standard features, our WordPress web development services are usually the quicker route. The written proposal you receive includes a tech-stack recommendation.",
      ],
    },
    {
      heading: "Website development cost in Dubai: how an estimate is built",
      paragraphs: [
        "We keep no price list for websites, because the work differs from one project to the next. After a free 30-minute discovery call, your written estimate comes within 3 to 5 business days, with a separate price for each component, so anything not worth it to you can come out. Payment is split into milestones and invoiced in dirhams.",
        "Expect the estimate to move with:",
      ],
      bullets: [
        "Type of build: a landing page, a company site, an online store and a web application are different amounts of work.",
        "Store scope: the size of the catalogue, the number of payment methods and whether several vendors sell on one site.",
        "Logged-in features: customer accounts, staff roles and dashboards each add design, build and testing work.",
        "Integrations: each CRM, carrier API or other system the site has to connect to.",
        "Pages and design: how many pages need a layout of their own, and whether the design builds on a brand you already have.",
        "Content and data: how much copy and imagery you supply, and whether anything has to move across from an old site.",
      ],
      links: [{ label: "How much does a website cost in Dubai?", href: "/guides/website-cost-dubai" }],
    },
    {
      heading: "What makes a website SEO-ready?",
      paragraphs: [
        "A website is SEO-ready when search engines can read every page and people get a fast, stable experience on it. Much of that is decided during the build, not after launch.",
        "Google's Core Web Vitals are a practical check. A good result is a Largest Contentful Paint within 2.5 seconds, an Interaction to Next Paint of 200 milliseconds or less, and a Cumulative Layout Shift of 0.1 or less. So the main content appears quickly, taps get a quick response, and the layout stays steady as the page loads.",
        "Google's AI features rest on the same groundwork. Google says supporting links in AI Overviews and AI Mode come only from pages that are indexed and eligible to show in Search with a snippet.",
        "Our websites are built SEO-ready. Ongoing work on rankings and AI citations, such as content and link building, is a separate service.",
      ],
      links: [{ label: "SEO, AEO and GEO services in Dubai", href: "/services/digital-marketing/seo-aeo-geo" }],
    },
    {
      heading: "Four questions for any web development company in Dubai",
      paragraphs: [
        "Before you hire a website development company in Dubai, look at how it works as well as what it has built. When comparing options for web development in the UAE, ask these four questions. Our answers follow each one.",
      ],
      bullets: [
        "Will I talk to the people building it? Yes. You deal directly with the same people who scope your project and then build it.",
        "Can I see the work before launch? Yes. You get weekly progress and a live staging environment you can open at any point.",
        "Who owns the finished work? You do, once it is paid in full. Our terms assign the custom code and designs made for you, but not third-party, pre-existing or reusable components, and we can sign an NDA on request.",
        "How is quality managed? We work to ISO 9001:2015 for quality and ISO/IEC 27001:2022 for information security, with both certificate numbers on our about page.",
      ],
    },
  ],
  faqs: [
    {
      question: "Does Shopify work in the UAE?",
      answer:
        "Yes. Shopify Payments, the payment service built into Shopify, is available in the United Arab Emirates for credit and debit cards and accelerated checkout, though Shopify may ask you to verify personal and business information. We build Shopify stores, and we can tell you whether Shopify or a custom build suits yours.",
    },
    {
      question: "Do you offer website maintenance services in Dubai?",
      answer:
        "Yes. Three months of post-launch support comes with every build, covering bug fixes, performance monitoring and minor adjustments. When that ends, a monthly retainer can look after uptime monitoring, security patching, content updates and performance optimization, quoted against what your site needs.",
    },
    {
      question: "Do you build web applications as well as websites?",
      answer:
        "Yes. Custom web applications are part of our web development service, including dashboards, booking systems and CRM systems. In one case study, a logistics team moved from spreadsheets to a dashboard with real-time shipment tracking, automated reporting and role-based access control.",
    },
  ],
  sources: [
    { label: "web.dev: Web Vitals", href: "https://web.dev/articles/vitals" },
    {
      label: "Google Search Central: AI features and your website",
      href: "https://developers.google.com/search/docs/appearance/ai-features",
    },
    {
      label: "Shopify Help Center: Shopify Payments for the United Arab Emirates",
      href: "https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/united-arab-emirates",
    },
  ],
};
