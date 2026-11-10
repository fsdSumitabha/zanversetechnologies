import type { ServiceContent } from "./types";

/* /services/digital-marketing/social-media-management. Facts about the company come
   from constants/zan.ts, constants/pages.ts and constants/landing.ts. The outside
   facts are the two under `sources`, each read on 5 November 2026. The Instagram
   post is dated 31 May 2023, so the page gives that year where it relies on the post. */
export const content: ServiceContent = {
  h1: "Social Media Marketing in Dubai",
  seoTitle: "Social Media Marketing in Dubai",
  seoDescription:
    "We run social media marketing in Dubai: strategy, reels, carousels, community management and monthly reports across Instagram, Facebook and LinkedIn.",
  lead: "Zan Verse Technologies is a social media marketing agency in Dubai. Our social media management covers a content plan, finished posts, audience replies and monthly reports on Instagram, Facebook and LinkedIn.",
  sections: [
    {
      heading: "What social media management covers",
      paragraphs: [
        "Social media management is the ongoing work of planning, making, publishing and answering on a company's social accounts. The aim is an audience that is worth advertising to later.",
        "The work has five parts:",
      ],
      bullets: [
        "Strategy: which platforms you use, who you are speaking to and what each account is for.",
        "Content calendar: posts planned in advance, on a calendar you can see.",
        "Social media content creation: reels, carousels, captions and hashtags.",
        "Community management: replies to comments and conversations, so people get an answer.",
        "Analytics: a monthly report on what each account did.",
      ],
      links: [
        { label: "Social media post design services", href: "/services/branding-and-designing/graphic-design" },
      ],
    },
    {
      heading: "Social media management packages in Dubai",
      paragraphs: [
        "The final scope is set in your written proposal. Packages differ by the number of platforms, the posts a month and the formats:",
      ],
      bullets: [
        "Social Starter: 1 to 2 platforms and 12 to 14 posts a month, with caption and hashtag strategy and a monthly report. It suits small and local businesses and new brands that want a steady presence before they spend on ads.",
        "Social Growth: 2 to 3 platforms and 16 to 20 posts a month, with reels, carousels and community management, for brands ready to turn followers into a pipeline.",
        "Social Scale: 3 to 4 platforms and 24 or more posts a month, with premium video, reels and influencer coordination.",
        "Content Production: photo and video shoots, reel production, edits, motion graphics and copywriting, made in batches so publishing does not stall.",
      ],
      links: [{ label: "Influencer marketing in Dubai", href: "/services/digital-marketing/influencer-marketing" }],
    },
    {
      heading: "What does social media management cost?",
      paragraphs: [
        "Social media marketing cost depends on how much has to be made and answered each month, so we do not publish a price list.",
        "First comes a free 30-minute discovery call. Within 3 to 5 business days of that, the scope and a line-item cost arrive in writing, with no obligation until you sign.",
        "The amount of work comes down to:",
      ],
      bullets: [
        "How many platforms you publish on.",
        "How many posts go out each month.",
        "How much of it is video. A reel with a shoot and an edit takes more work than a designed image.",
        "How many comments and conversations have to be answered.",
        "Whether your brand assets are ready. A company without a logo, colours and guidelines may need those first.",
      ],
      links: [
        { label: "Logo and brand identity design in Dubai", href: "/services/branding-and-designing/brand-identity-design" },
      ],
    },
    {
      heading: "Instagram marketing and LinkedIn marketing in Dubai: which platform fits?",
      paragraphs: [
        "Choose by where your customers spend time, not by how many accounts you can fill.",
        "Format matters too. Instagram has said it has no single algorithm: Feed, Stories, Explore, Reels and Search each use their own. For one of its Reels systems, Meta lists predictions such as how likely a person is to comment, reshare or follow the author. So plan content for the surface it will appear on.",
        "How the three platforms compare:",
      ],
      bullets: [
        "Instagram marketing suits products and services that show well in pictures and video. Instagram said in 2023 that most of what people see in Reels comes from accounts they do not follow.",
        "LinkedIn marketing suits companies selling to other businesses, because people list their employer and job title there.",
        "Facebook is often run alongside Instagram, since Meta's tools cover both.",
      ],
    },
    {
      heading: "What to ask a social media agency in Dubai",
      paragraphs: [
        "Sample posts show only part of what social media marketing agencies in Dubai do, so ask about these as well:",
      ],
      bullets: [
        "The calendar: you should be able to see what is planned before it goes out.",
        "The makers: ask who shoots, edits and writes the content.",
        "The replies: community management should be named in the scope.",
        "The report: ask what it measures, because follower counts alone say little about enquiries.",
        "The contact: you should deal with the people running your account, as you do with us.",
      ],
    },
  ],
  faqs: [
    {
      question: "What is social media marketing?",
      answer:
        "Social media marketing is using platforms such as Instagram, Facebook and LinkedIn to reach customers, build an audience and bring in enquiries. It covers posts, conversations and community work, and it can also include paid ads and influencers. It is strongest for awareness, while Google Ads suits people who are already searching.",
    },
    {
      question: "What is the difference between social media marketing and social media management?",
      answer:
        "Social media management is the day-to-day running of your accounts: planning, publishing and replying. Social media marketing is the wider effort to win customers on those platforms, which can add paid ads and influencers. We offer both in Dubai and across the UAE, so you can start with managed accounts and add the rest once the content is working.",
    },
    {
      question: "How much does social media management cost in Dubai?",
      answer:
        "The number of platforms, the posts a month, the amount of video and the community management you need all change it, so there is no price list. A free discovery call starts the process, and a written proposal with a line-item cost breakdown reaches you within 3 to 5 business days. There is no obligation until you sign it.",
    },
    {
      question: "Does Instagram marketing work for a small business?",
      answer:
        "It can, if your customers use Instagram and you can post consistently. It suits products and services that show well in pictures and video, and an audience takes time to build. Our Social Starter package was made for small and local businesses that want a consistent presence before they spend on ads.",
    },
    {
      question: "What is UGC marketing?",
      answer:
        "UGC marketing uses user-generated content, meaning photos, videos and reviews made by customers or creators rather than by the brand itself. With the right licence, a brand can reuse that content on its own accounts and in paid ads. We handle UGC licensing and reuse as part of our influencer marketing work.",
    },
    {
      question: "Which social media platforms do you manage?",
      answer:
        "We manage Instagram, Facebook and LinkedIn, and each package sets how many platforms are covered. We help you choose based on where your customers are, because a few active accounts usually do more than many quiet ones. The final list goes in your written proposal.",
    },
  ],
  sources: [
    {
      label: "Instagram: Instagram Ranking Explained (31 May 2023)",
      href: "https://about.instagram.com/blog/announcements/instagram-ranking-explained",
    },
    {
      label: "Meta Transparency Center: Instagram Reels Chaining AI system",
      href: "https://transparency.meta.com/features/explaining-ranking/ig-reels-chaining/",
    },
  ],
};
