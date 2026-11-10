import type { ServiceContent } from "./types";

/* /services/digital-marketing/performance-marketing. Facts about the company come
   from constants/zan.ts, constants/pages.ts and constants/landing.ts. The outside
   facts are the three under `sources`, each read on 5 November 2026. */
export const content: ServiceContent = {
  h1: "Google Ads & PPC Agency in Dubai",
  seoTitle: "Google Ads & PPC Agency in Dubai",
  seoDescription:
    "Zan Verse runs Google Ads and PPC in Dubai, plus Meta Ads and LinkedIn Ads, as performance marketing with conversion tracking in place before launch.",
  lead: "For Google Ads and PPC in Dubai, Zan Verse Technologies plans and runs paid campaigns on Google, Meta and LinkedIn. This performance marketing service is for companies that need to see what their ad spend returned.",
  sections: [
    {
      heading: "What is performance marketing?",
      paragraphs: [
        "Performance marketing is paid advertising judged on results you can count, such as leads, sales and cost per acquisition. PPC, or pay-per-click, is one common form of it.",
        "As a performance marketing agency in Dubai, we run campaigns on three ad platforms. Buy one, or run them as one full-funnel system with shared audiences, shared creative testing and one dashboard that sets spend against revenue.",
        "What each platform covers, and the creative behind them:",
      ],
      bullets: [
        "Google Ads: Search, Display, Shopping and Performance Max campaigns, built around what people are looking for.",
        "Meta Ads: Facebook and Instagram campaigns built on audience work and creative testing, including click-to-WhatsApp ads for customers who prefer to talk in chat.",
        "LinkedIn Ads: B2B lead generation and account-based marketing aimed at the seniority that signs off your deal, with lead-gen forms and pipeline reporting.",
        "Ad creative: each round of testing needs new ads, and our graphic design service can supply banners and social creatives.",
      ],
      links: [
        { label: "Banner design and ad creative in Dubai", href: "/services/branding-and-designing/graphic-design" },
      ],
    },
    {
      heading: "Google Ads management in Dubai",
      paragraphs: [
        "Our PPC management in Dubai starts with intent: what people type when they are ready to buy. Our Google Ads services cover the keyword strategy, the bidding and the negative keywords that keep spend away from the wrong searches, so you pay for fewer clicks you do not want.",
        "The campaign type depends on what you sell:",
      ],
      bullets: [
        "Search: text ads for people typing what you offer. This is usually the place to begin when people already search for your service.",
        "Shopping: product listings with a picture and a price, for online stores.",
        "Display: image ads on websites and apps, for reaching people before they search.",
        "Performance Max: one goal-based campaign that reaches YouTube, Display, Search, Discover, Gmail and Maps, using the assets, feeds and goals you supply.",
      ],
    },
    {
      heading: "Google Ads cost in Dubai: your budget and our fee",
      paragraphs: [
        "There are two separate costs: the ad budget you pay the platform, and the fee for running the campaigns. You set the budget, and Google's Ad Rank then weighs your bid, the quality of your ads and landing page, and the context of each search. Google says higher quality ads can often lead to lower costs per click.",
        "Paid traffic stops when the budget stops, so ads are worth pairing with SEO for the longer term.",
        "Our fee is itemized in an estimate you receive within 3 to 5 business days of a free 30-minute discovery call. It changes with:",
      ],
      bullets: [
        "The number of platforms and campaigns you run.",
        "The competition for your keywords and audiences, which sets how much bid and keyword work they need.",
        "The number of ad variations each round of creative testing needs.",
        "Any tracking, landing pages or product feeds that have to be set up first.",
      ],
      links: [
        { label: "How to set a budget for Google Ads in Dubai", href: "/guides/google-ads-budget-dubai" },
        { label: "SEO services in Dubai", href: "/services/digital-marketing/seo-aeo-geo" },
      ],
    },
    {
      heading: "Google Analytics 4 and conversion tracking before launch",
      paragraphs: [
        "A campaign can only be judged on what it returns if the returns are recorded, so ask any Google Ads or PPC company how it tracks results. Before any of our campaigns goes live, we set up conversion tracking, Google Analytics 4, the Meta Pixel and server-side tracking.",
        "Google Analytics 4 records what visitors do as events, such as a form submission or a purchase. On Meta, the Conversions API links data from a server, website platform, app or CRM to Meta's systems, alongside the Pixel.",
        "Once campaigns run, we use A/B tests and budget changes to move spend towards what is working. You get a report each month by channel, campaign and audience segment, and you talk directly to the marketer running your account.",
      ],
    },
    {
      heading: "Lead generation in Dubai",
      paragraphs: [
        "Lead generation campaigns aim at enquiries rather than online sales, so the page an ad sends people to matters too. We can design and build that page, with the lead form and conversion tracking in place.",
        "One B2B SaaS campaign on our portfolio brought 180% more qualified leads and a 42% lower cost per acquisition over six months. It combined Google Ads and LinkedIn campaigns with a technical SEO overhaul and marketing automation, so those figures describe the whole campaign.",
        "Two example setups:",
      ],
      bullets: [
        "Real estate lead generation: search ads for people already looking, plus click-to-WhatsApp campaigns on Meta, so a buyer can start a chat from the ad.",
        "B2B lead generation: LinkedIn Ads for the seniority tiers that sign off deals, Google Ads for people searching for your category, and lead-gen forms to shorten the step.",
      ],
      links: [
        { label: "Landing page design in Dubai", href: "/services/branding-and-designing/website-design" },
        { label: "B2B lead generation case study", href: "/portfolio" },
      ],
    },
  ],
  faqs: [
    {
      question: "What is PPC in digital marketing?",
      answer:
        "PPC, or pay-per-click, is paid advertising in which you generally pay each time someone clicks your ad. On Google Ads you set a budget and bid on the searches you want to appear for, and an ad can show as soon as the campaign is live. That makes PPC useful when you need enquiries soon.",
    },
    {
      question: "How much does Google Ads cost in Dubai?",
      answer:
        "You choose the ad budget, and the price of a click varies by keyword and industry, so there is no fixed cost. Our fee changes with the number of platforms and campaigns, the creative testing and the tracking work. Book a free discovery call, and your written line-item estimate arrives within 3 to 5 business days.",
    },
    {
      question: "What is Performance Max?",
      answer:
        "Performance Max is a goal-based Google Ads campaign type that reaches YouTube, Display, Search, Discover, Gmail and Maps from a single campaign. You supply assets such as images and data feeds and define the conversions you care about, and Google AI works with those inputs. Those goals need reliable conversion data, so tracking comes first.",
    },
    {
      question: "Meta Conversions API vs Pixel: which do I need?",
      answer:
        "You can run both. The Meta Pixel runs in the visitor's browser, while the Conversions API sends events from your server, website platform, app or CRM to Meta, and Meta processes those server events like Pixel events. Our Meta Ads setup covers both.",
    },
    {
      question: "What is server-side tracking?",
      answer:
        "Server-side tracking sends conversion data to platforms such as Google and Meta from a server, rather than relying only on code running in the visitor's browser. It gives you a second route for recording leads and sales. We set it up with Google Analytics 4 and the Meta Pixel before campaigns launch, to make your data more accurate.",
    },
    {
      question: "Should a B2B company use LinkedIn Ads or Google Ads for lead generation?",
      answer:
        "Often both, because they do different jobs. Google Ads reaches people already searching for what you sell. LinkedIn Ads reaches people by seniority, which suits account-based marketing and buyers who are not searching yet. Compare the cost per qualified lead on each, then move budget towards the one that returns more.",
    },
  ],
  sources: [
    {
      label: "Google Ads Help: About Ad Rank",
      href: "https://support.google.com/google-ads/answer/1722122",
    },
    {
      label: "Google Ads Help: About Performance Max campaigns",
      href: "https://support.google.com/google-ads/answer/10724817",
    },
    {
      label: "Meta for Developers: Conversions API",
      href: "https://developers.facebook.com/docs/marketing-api/conversions-api",
    },
  ],
};
