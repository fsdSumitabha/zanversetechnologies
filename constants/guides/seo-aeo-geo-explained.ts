import type { Guide } from "./types";

export const guide: Guide = {
  slug: "seo-aeo-geo-explained",
  title: "SEO, AEO and GEO: what is the difference?",
  seoTitle: "SEO vs AEO vs GEO: The Difference",
  seoDescription:
    "SEO, answer engine optimization (AEO) and generative engine optimization (GEO) compared: what Google says, what a study tested and what llms.txt is.",
  lead: "SEO helps your pages appear in search results, answer engine optimization (AEO) helps them supply direct answers, and generative engine optimization (GEO) helps AI-written answers use and cite them. Google says that optimizing for its own generative AI search is still SEO.",
  summary:
    "Plain definitions of SEO, AEO and GEO, what Google's documentation says about them, what the GEO study tested, and what llms.txt is.",
  published: "2026-11-05",
  updated: "2026-11-05",
  sections: [
    {
      heading: "What is the difference between SEO, AEO and GEO?",
      paragraphs: [
        "All three try to put your content in front of people looking for an answer. They differ in where it appears and in how you check the result.",
        "Search engine optimization (SEO), Google says, “is about helping search engines understand your content, and helping users find your site and make a decision about whether they should visit your site through a search engine.”",
        "Answer engine optimization (AEO) means structuring content so that AI-powered search engines, chatbots and voice assistants can find it, understand it and cite it.",
        "Generative engine optimization (GEO) means changing content to increase its visibility in responses from generative engines: systems that search for information and generate a response from multiple sources. A research paper first posted in 2023 introduced the name.",
        "AEO and GEO overlap. Google describes both as terms you may see used for work focused on improving visibility in AI search experiences. Side by side, they compare like this:",
      ],
      bullets: [
        "SEO. Goal: appear in search results. Where it shows: the links on a results page. How to check it: Google Search Console.",
        "AEO. Goal: be the direct answer to a question. Where it shows: answers from AI search tools, chatbots and voice assistants. How to check it: ask those tools your customers' questions and see whether they cite you.",
        "GEO. Goal: be used and cited inside an AI-written response. Where it shows: Google AI Overviews, AI Mode, ChatGPT and Perplexity. How to check it: the Generative AI performance report in Search Console for Google, and manual checks elsewhere.",
      ],
    },
    {
      heading: "What does Google say about AI features and SEO?",
      paragraphs: [
        "Google says this is still SEO. Its guide to generative AI features says: “From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.” Its page on AI features says there are “no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.”",
        "The reason it gives is that these features are rooted in its core Search ranking and quality systems, and highlight content from its Search index. To be eligible, a page must be indexed and eligible to appear in Google Search with a snippet, and the guide adds that the site must be included in Search generative AI features in Search Console. Google says that meeting every requirement still does not mean it will crawl, index or serve a page.",
        "These statements cover Google Search only. They do not tell you how ChatGPT, Perplexity or other products choose their sources.",
        "In the same guide, Google lists things you can ignore for Google Search:",
      ],
      bullets: [
        "New machine-readable files, AI text files, markup or Markdown.",
        "“Chunking”: there is no requirement to break content into tiny pieces, and there is no ideal page length.",
        "Rewriting content just for AI systems.",
        "Seeking inauthentic mentions across the web.",
        "Overfocusing on structured data: it is not required for generative AI search, although Google says it is a good idea to keep using it as part of your overall SEO.",
      ],
    },
    {
      heading: "What changed for FAQ rich results?",
      paragraphs: [
        "An FAQ rich result was a special display in Google's results, built from FAQ structured data on a page. Google has now removed it.",
        "In 2023, Google limited the feature to well-known, authoritative government and health websites. Its changelog entry of May 8, 2026 says: “This feature will no longer appear in Google Search starting May 7, 2026.” On June 15, 2026, it removed the documentation, because the feature “is no longer shown in Google Search results”.",
        "So FAQ markup no longer earns that display in Google, for any site. Neither entry says anything against publishing questions and answers for your readers.",
      ],
    },
    {
      heading: "What did the GEO study test?",
      paragraphs: [
        "The paper is “GEO: Generative Engine Optimization”, by Pranjal Aggarwal and colleagues at Princeton University, the Indian Institute of Technology Delhi and independent researchers. It was accepted at the KDD 2024 conference.",
        "It built a benchmark of 10,000 queries and reported results on a test split of 1,000. For each query, a language model rewrote one source in nine different ways, such as adding citations, quotations or statistics, simplifying the language, or stuffing keywords. The main tests ran on an engine the authors built themselves: it took the first five Google results and had GPT-3.5 Turbo write the answer. A smaller test of 200 samples ran on Perplexity, with the sources uploaded as files.",
        "It measured visibility: how much of the AI's answer cited a source, weighted by position in the answer, and a second score for subjective factors judged by a language model. The paper says it did not evaluate search rankings, and its measures do not count real visits or sales. It did not test Google's AI Overviews or AI Mode.",
        "The figures come from one benchmark, run mainly on an older model, and they do not predict what your website will get. The authors say methods may need to adapt as these engines change. If you act on these results, add only quotes and figures that are true and traceable.",
        "The main findings, for those tests only, were:",
      ],
      bullets: [
        "The paper's strongest methods were adding quotations, statistics and citations: roughly 30% to 40% better on the position-based measure, and 15% to 30% better on the subjective one.",
        "Improving fluency and readability gave a 15% to 30% boost.",
        "Keyword stuffing offered “little to no improvement”. On Perplexity it scored 10% worse than the unchanged text on the position-based measure, and higher on the subjective one.",
        "On Perplexity, adding quotations was 22% better on the position-based measure, and adding statistics 37% better on the subjective one.",
        "Results varied by subject. When the authors changed all the sources at once, lower-ranked pages gained the most: adding citations raised visibility by 115.1% for pages ranked fifth and lowered it by 30.3% for pages ranked first.",
      ],
    },
    {
      heading: "What is llms.txt, and does Google use it?",
      paragraphs: [
        "llms.txt is a proposed Markdown file that a website publishes at /llms.txt, or under a subpath such as /docs/llms.txt. It gives AI agents and language models brief background, guidance and links to more detailed Markdown files. Jeremy Howard published the proposal in September 2024 and revised it in August 2026.",
        "Google Search does not use it. A note Google added to its guide on June 15, 2026 says: “It's completely fine if you decide to create and maintain LLMS.txt files (or other similar files) for other services or systems that use these files. Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.”",
        "Treat it as an optional extra for other systems, not as a way to rank in Google.",
      ],
    },
    {
      heading: "What should a business do about AEO and GEO?",
      paragraphs: [
        "Start with ordinary SEO work. Google says that creating content people find unique, compelling and useful will likely influence your presence in generative AI search in the long run more than any other suggestion in its guide.",
        "Do these first:",
      ],
      bullets: [
        "Let crawlers in. Check that robots.txt and any CDN or hosting layer allow crawling, and that your pages can be indexed.",
        "Put important content in text, and link to it from your other pages.",
        "Write from first-hand knowledge. Google notes that a summary of existing content simply restates what is available elsewhere.",
        "For your readers, answer the question first, then explain it, and back your claims with sources you can trace.",
        "Keep structured data matching the visible text, and keep your Business Profile and Merchant Center details current.",
        "Measure it. In Search Console, verify your site, check that it is included in Search generative AI features, and use the Generative AI performance report.",
        "Be wary of promises. Google warns about third-party tools that promise ranking success, and it tells site owners considering outside AEO or GEO services to review its guidance on third-party SEO advice.",
      ],
      links: [
        { label: "How much to spend on Google Ads in Dubai", href: "/guides/google-ads-budget-dubai" },
        { label: "How much a website costs in Dubai", href: "/guides/website-cost-dubai" },
        { label: "What an AI agent is", href: "/guides/what-is-an-ai-agent" },
      ],
    },
    {
      heading: "How can Zan Verse help with SEO, AEO and GEO?",
      paragraphs: [
        "Zan Verse Technologies provides SEO, AEO and GEO services for businesses in Dubai and across the UAE, covering technical SEO, on-page optimization, link building and AI-search visibility in ChatGPT, Perplexity and Google AI Overviews. We can run all three as one strategy, structuring content and markup so that an AI system can find a direct answer on your site and attribute it to you. A free 30-minute discovery call comes first, and a written proposal follows within 3 to 5 business days.",
      ],
      links: [{ label: "Book a free discovery call", href: "/contact-us" }],
    },
  ],
  faqs: [
    {
      question: "Are AEO and GEO replacing SEO?",
      answer:
        "No. Google says standard SEO guidance remains relevant for AI Overviews and AI Mode, and that optimizing for generative AI search is still SEO from its perspective. AEO and GEO describe a focus on AI answers, and for Google Search the groundwork is the same: crawlable pages and useful content.",
    },
    {
      question: "What is the difference between AEO and GEO?",
      answer:
        "They overlap. Answer engine optimization (AEO) focuses on being the direct answer to a question, and generative engine optimization (GEO) focuses on being used and cited in AI-written responses. Google describes both as terms for work on visibility in AI search experiences, and treats that work as SEO.",
    },
    {
      question: "How do I rank in Google AI Overviews?",
      answer:
        "Follow the same SEO guidance as for Google Search. Google's AI features page says there are no additional requirements or special optimizations for AI Overviews or AI Mode. A page must be indexed and eligible to appear with a snippet, and even then Google may not show it. AI Overviews also often do not trigger.",
    },
    {
      question: "Do I need an llms.txt file?",
      answer:
        "Not for Google Search. Google says Search ignores llms.txt files, so creating one will neither harm nor help your visibility or rankings there. You can still keep one for other services or systems that use it. The file itself is a proposal from 2024, revised in 2026.",
    },
    {
      question: "Do FAQ rich results still appear in Google?",
      answer:
        "No. Google's changelog says the FAQ rich result stopped appearing in Google Search from May 7, 2026, and Google removed its documentation on June 15, 2026. Since 2023 it had been limited to well-known, authoritative government and health websites. You can still publish questions and answers for your readers.",
    },
  ],
  sources: [
    {
      label: "SEO Starter Guide, Google Search Central",
      href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
    },
    {
      label: "AI features and your website, Google Search Central",
      href: "https://developers.google.com/search/docs/appearance/ai-features",
    },
    {
      label: "Optimizing your website for generative AI features on Google Search, Google Search Central",
      href: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    },
    {
      label: "Latest Google Search Documentation Updates, Google Search Central",
      href: "https://developers.google.com/search/updates",
    },
    {
      label: "GEO: Generative Engine Optimization, Aggarwal et al., arXiv 2311.09735",
      href: "https://arxiv.org/abs/2311.09735",
    },
    { label: "The /llms.txt file, llmstxt.org", href: "https://llmstxt.org/" },
  ],
  services: [{ label: "SEO, AEO and GEO services in Dubai", href: "/services/digital-marketing/seo-aeo-geo" }],
};
