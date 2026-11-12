import type { ServiceContent } from "./types";

/* /services/digital-marketing/seo-aeo-geo. Facts about the company come from
   constants/zan.ts, constants/pages.ts and constants/landing.ts. The outside facts
   are the three under `sources`, each read on 5 November 2026. The 3 to 6 months
   figure is the site's own, from digitalMarketingFaqs in constants/zan.ts. */
export const content: ServiceContent = {
  h1: "SEO, AEO & GEO Services in Dubai",
  seoTitle: "SEO, AEO & GEO Services in Dubai",
  seoDescription:
    "Our SEO, AEO and GEO services in Dubai help your business be found on Google and cited by ChatGPT, Perplexity and Google AI Overviews.",
  lead: "Zan Verse Technologies provides SEO, AEO and GEO services in Dubai: search engine optimization for Google, plus answer engine optimization and generative engine optimization, so AI tools can cite you.",
  sections: [
    {
      heading: "SEO vs AEO vs GEO: how do they differ?",
      paragraphs: [
        "All three help customers find you, and they rest on the same base. Google says its SEO advice remains relevant for AI features in Search, so we run the three as one strategy rather than as three separate projects.",
        "They differ in where the answer appears:",
      ],
      bullets: [
        "Search engine optimization (SEO) helps search engines understand your pages, so those pages can appear in results such as Google's.",
        "Answer engine optimization (AEO) means writing and marking up content as clear, direct answers, so AI-powered search and assistants can find the answer on your site and attribute it to you.",
        "Generative engine optimization (GEO) means working to get your brand named and cited when tools such as ChatGPT and Perplexity write an answer.",
      ],
      links: [{ label: "SEO vs AEO vs GEO explained", href: "/guides/seo-aeo-geo-explained" }],
    },
    {
      heading: "How to rank in ChatGPT and Google AI Overviews",
      paragraphs: [
        "No one can promise a place in an AI answer. What can be done is to make your pages easy to find, read and quote.",
        "For Google, a page has to be indexed and eligible to show with a snippet before it can appear as a supporting link in AI Overviews or AI Mode. Google says this needs no new machine-readable files, no AI text files and no special schema.org structured data.",
        "So for Google, AI SEO is careful search work, not a separate technique. We write clear, direct answers, keep the facts accurate, keep structured data in line with the visible text and do entity building, so machines can tell who your company is.",
        "Google's rule covers Google only. It says nothing about how ChatGPT or Perplexity choose their sources, so we also track whether AI tools mention or cite your brand.",
      ],
    },
    {
      heading: "What our SEO services in Dubai include",
      paragraphs: [
        "We run SEO in Dubai and across the UAE, and the work covers your site, your content and what other sites say about you. In one six-month, multi-channel B2B SaaS campaign, which included a full technical SEO overhaul, organic traffic grew 3x.",
        "Some technical problems start with how the site was designed. Our website design service covers page layouts and responsive behaviour, so those fixes can be planned together.",
        "The service includes:",
      ],
      bullets: [
        "Technical SEO: an audit of what stops crawlers reaching or reading your pages, then the fixes.",
        "On-page optimization: titles, headings and copy matched to what your customers type.",
        "Content: pages written to rank and to answer the questions people ask.",
        "Link building: earning links from other sites to hold those rankings.",
        "Schema markup and entity building: describing your company and pages in a form machines can read.",
        "AI visibility tracking and monthly reporting: what ranks, what gets cited and what changed.",
        "A shared content calendar and a quarterly roadmap when SEO, AEO and GEO run together.",
      ],
      links: [
        { label: "Website design company in Dubai", href: "/services/branding-and-designing/website-design" },
        { label: "The B2B SaaS case study", href: "/portfolio" },
      ],
    },
    {
      heading: "How to choose an SEO agency in Dubai",
      paragraphs: [
        "Put the same questions to all the SEO agencies in Dubai on your shortlist, including us. Any SEO service in Dubai should be able to answer them:",
      ],
      bullets: [
        "Does it promise rankings? Google says no one can promise first place in its results, and that if an SEO company does, you should find someone else.",
        "What timeline does it give? Google suggests asking what results to expect and in what timeframe. In our experience, SEO takes 3 to 6 months to show measurable results, and a new site usually takes longer.",
        "What will the monthly report show? Ask to see rankings, traffic and enquiries, not only a list of tasks.",
        "Who does the work? You should be able to talk to that person, as you can here.",
        "How does it handle AI search? Ask what work it does for AEO and GEO, and how it checks the effect.",
      ],
    },
    {
      heading: "SEO pricing in Dubai: why quotes differ",
      paragraphs: [
        "SEO services pricing depends on how much work your site and market need, so we do not quote from a list. After a free 30-minute discovery call, we send a written proposal within 3 to 5 business days. It prices each part of the work on its own, so you can see what an item costs before you agree to it.",
        "What changes the figure:",
      ],
      bullets: [
        "Site size and condition: corporate SEO services for a large site with technical faults take more audit and repair than work on a small, clean site.",
        "Competition: harder search terms usually take more content and more links.",
        "Content: how many pages need writing or rewriting.",
        "Reach: whether you are targeting searches in Dubai only or across the UAE.",
        "AI search: how many pages need clearer answers and structured data.",
        "Scope: whether search runs alone or inside a wider digital marketing plan with paid ads and social media.",
      ],
      links: [{ label: "Digital marketing agency in Dubai", href: "/services/digital-marketing" }],
    },
  ],
  faqs: [
    {
      question: "AEO vs GEO: what is the difference?",
      answer:
        "Answer engine optimization (AEO) aims to make your content the direct answer a search feature or assistant gives. Generative engine optimization (GEO) aims to get your brand named and cited in answers that AI tools write. The terms overlap and agencies use them differently, so ask any agency what work it means by each.",
    },
    {
      question: "How much does SEO cost in Dubai?",
      answer:
        "SEO is quoted against the work your site needs, so no fixed price applies. The size and condition of the site, the competition for your search terms and the amount of content to write all change it. Start with a free discovery call, and we will send itemized costs within 3 to 5 business days.",
    },
    {
      question: "How long before SEO starts to work?",
      answer:
        "Usually 3 to 6 months for measurable results, with larger traffic growth more often between months 6 and 12. A new website tends to take longer than an established one. Technical fixes and title changes can show sooner, while content and link building build up over time.",
    },
    {
      question: "What is llms.txt, and do I need one?",
      answer:
        "It is a proposal for a Markdown file that helps AI agents use a website, and the proposal is still open for community input. You do not need one for Google, which says AI text files are not needed to appear in AI Overviews or AI Mode. Treat it as a small extra rather than a way to rank.",
    },
    {
      question: "Does SEO still matter now that people use AI search?",
      answer:
        "Yes. A page has to be indexed in Google Search before it can appear as a supporting link in AI Overviews or AI Mode, and Google says its SEO advice remains relevant for both. Sound technical work and clear, trustworthy content serve ordinary results and AI answers alike.",
    },
    {
      question: "Do you offer SEO for e-commerce and B2B companies?",
      answer:
        "Yes. For e-commerce brands we run SEO alongside Google Shopping, Performance Max and Meta Ads, with results reported against revenue. For B2B companies the work can sit beside Google Ads and LinkedIn campaigns, as it did in the B2B SaaS engagement on our portfolio. Tell us your sector on the discovery call, and the proposal reflects it.",
    },
  ],
  sources: [
    {
      label: "Google Search Central: AI features and your website",
      href: "https://developers.google.com/search/docs/appearance/ai-features",
    },
    {
      label: "Google Search Central: Do you need an SEO?",
      href: "https://developers.google.com/search/docs/fundamentals/do-i-need-seo",
    },
    {
      label: "llms.txt: the proposal",
      href: "https://llmstxt.org/",
    },
  ],
};
