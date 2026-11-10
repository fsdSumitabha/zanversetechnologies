import type { ServiceContent } from "./types";

/* /services/digital-marketing. Facts about the company come from constants/zan.ts,
   constants/pages.ts and constants/landing.ts. The outside facts are the two under
   `sources`, each read on 5 November 2026. Added after digitalMarketingFaqs, so the
   cost question is the one that set already has. */
export const content: ServiceContent = {
  h1: "Digital Marketing Agency in Dubai",
  seoTitle: "Digital Marketing Agency in Dubai",
  seoDescription:
    "Zan Verse is a digital marketing agency in Dubai that runs SEO, Google Ads, social media and influencer marketing, with reports on what each channel returned.",
  lead: "Zan Verse Technologies is a digital marketing agency in Dubai. We run SEO, paid advertising, social media and influencer marketing for growing companies, as single services or as one plan, with tracking that shows what each channel returned.",
  sections: [
    {
      heading: "Digital marketing services in Dubai",
      paragraphs: [
        "Digital marketing reaches customers online, and we run four channels of it: search, paid ads, social media and creators. You can brief one digital marketing company in Dubai instead of hiring a separate agency for each. Here is what each channel covers, plus the artwork behind it:",
      ],
      bullets: [
        "Search: technical fixes, on-page work, content and link building for Google, with generative engine optimization (GEO) and answer engine optimization (AEO) so that AI tools such as ChatGPT and Perplexity can cite your content.",
        "Paid ads: Google Ads, Meta Ads and LinkedIn Ads, judged on what each campaign returns.",
        "Social media: a content plan for Instagram, Facebook and LinkedIn, with the posts made for you and your audience answered.",
        "Influencers: finding and checking creators, agreeing terms, briefing them and measuring each collaboration.",
        "Artwork: social creatives and banners from our graphic design service, built as templates so that campaigns stay consistent.",
      ],
      links: [
        { label: "SEO, AEO and GEO services in Dubai", href: "/services/digital-marketing/seo-aeo-geo" },
        { label: "Google Ads and PPC management in Dubai", href: "/services/digital-marketing/performance-marketing" },
        { label: "Social media marketing in Dubai", href: "/services/digital-marketing/social-media-management" },
        { label: "Influencer marketing agency in Dubai", href: "/services/digital-marketing/influencer-marketing" },
        { label: "Graphic design services in Dubai", href: "/services/branding-and-designing/graphic-design" },
      ],
    },
    {
      heading: "Which digital marketing channel should you start with?",
      paragraphs: [
        "It depends on whether people already search for what you sell, and how soon you need enquiries. The channels do different jobs, so a plan can use several of them.",
        "Paid and organic search are separate. Google says it does not accept payment to rank a site higher, so ad spend buys ad placements and SEO works on the organic listings.",
        "Use this as a starting point:",
      ],
      bullets: [
        "People already search for your service and you need enquiries soon: start with Google Ads, which can show as soon as a campaign is live.",
        "You can wait months and want traffic that continues after an ad budget ends: invest in SEO.",
        "Few people know your brand yet: use social media and influencers to reach them before they start looking.",
        "You sell to other companies: add LinkedIn Ads, which can target the seniority level that signs off a deal.",
      ],
      links: [
        { label: "What SEO, AEO and GEO mean", href: "/guides/seo-aeo-geo-explained" },
        { label: "How much to budget for Google Ads in Dubai", href: "/guides/google-ads-budget-dubai" },
      ],
    },
    {
      heading: "Digital marketing for real estate, healthcare, e-commerce and B2B",
      paragraphs: [
        "The channel mix changes with how each sector buys. These are starting points for four kinds of business we work with:",
      ],
      bullets: [
        "Real estate: Google Ads for people already looking, Meta Ads with click-to-WhatsApp for buyers who prefer to talk in chat, and SEO for searches that continue after the ads end.",
        "Healthcare: a healthcare digital marketing agency should start with the searches people make when they need care, so SEO and Google Ads can come first. Health claims also need checking before they go live.",
        "E-commerce: Google Shopping and Performance Max, Meta Ads with creative testing, SEO and influencer marketing, all reported against revenue.",
        "B2B: SEO, Google Ads and LinkedIn campaigns, with marketing automation to nurture leads. Our B2B lead generation case study used this mix.",
      ],
    },
    {
      heading: "Digital marketing cost in Dubai: what changes it",
      paragraphs: [
        "We do not publish a list price, because the scope differs from one company to the next. Instead, you get a free 30-minute discovery call, and then a proposal in writing within 3 to 5 business days. It sets out the scope, milestones and a line-item cost breakdown, and nothing is charged until you sign it.",
        "These are the main things that change the estimate:",
      ],
      bullets: [
        "How many channels you run at once.",
        "Your ad budget, which goes to the ad platforms and is separate from the fee for running campaigns.",
        "How competitive your market and search terms are.",
        "How much content, video and artwork has to be made each month.",
        "How much work your website and tracking need before a campaign can start.",
        "Whether the work is a fixed scope or a monthly retainer.",
      ],
    },
    {
      heading: "How a digital marketing engagement runs",
      paragraphs: [
        "Before you sign with any of the digital marketing agencies in Dubai, ask who will run your account. A digital marketing service provider should be able to answer that plainly. With us, you talk directly to the marketers who do the work, from the first call onwards. The work follows this order:",
      ],
      bullets: [
        "Discovery call: your goals, audience, budget range and timeline.",
        "Proposal: the written scope and costs, for you to approve.",
        "Tracking: conversion tracking goes in before any campaign launches. That data then shows which keywords, ads and campaigns lead to the actions you value, such as a purchase, sign-up or phone call.",
        "Budget: planned in phases against revenue targets, so you can increase spend on what is working.",
        "Reports: each month, results by channel, campaign and audience segment, with one view of spend against revenue.",
      ],
    },
  ],
  faqs: [
    {
      question: "What is digital marketing?",
      answer:
        "Digital marketing is promoting a business through online channels, including search engines, paid ads, social media and creators. Results can often be traced to a visit, an enquiry or a sale, which is harder with most offline advertising. Digital marketing in Dubai can mean Google Ads and SEO for people already searching, and Instagram or LinkedIn for people who are not.",
    },
    {
      question: "Can I start with one digital marketing service?",
      answer:
        "Yes. You can buy SEO, Google Ads, social media management or influencer marketing on its own and add others later. A small business can begin with one focused service and build the budget in phases as that service starts to return. The first call and the written proposal are both free.",
    },
    {
      question: "Do you work as a digital marketing agency across the UAE, or only in Dubai?",
      answer:
        "Across the UAE. Our office is in Dubai Silicon Oasis, and our digital marketing services in the UAE serve businesses in Dubai and elsewhere in the country. Most of the work happens over video calls and shared dashboards, and a meeting in Dubai can be arranged when something is better done in person. Work for UAE clients is invoiced in dirhams.",
    },
  ],
  sources: [
    {
      label: "Google Search Central: In-depth guide to how Google Search works",
      href: "https://developers.google.com/search/docs/fundamentals/how-search-works",
    },
    {
      label: "Google Ads Help: About conversion measurement",
      href: "https://support.google.com/google-ads/answer/1722022",
    },
  ],
};
