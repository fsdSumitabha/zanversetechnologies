import type { ServiceContent } from "./types";

/* /services/branding-and-designing/website-design. Facts about the company come
   from constants/zan.ts and constants/landing.ts. The outside facts are the three
   under `sources`, each read on 5 November 2026. */
export const content: ServiceContent = {
  h1: "Web Design Company in Dubai",
  seoTitle: "Web Design Company in Dubai",
  seoDescription:
    "Page layouts, responsive behaviour and a Figma component set, ready for our developers or yours. Web design in Dubai from Zan Verse Technologies.",
  lead: "If your business needs a web design company in Dubai, Zan Verse Technologies designs the page layouts, responsive behaviour and component set, and hands them over in Figma, ready for our developers or yours.",
  sections: [
    {
      heading: "Website design and development services: one company or two?",
      paragraphs: [
        "If you are looking for web design in Dubai, you may want a finished website, not only design files. We can do both. Our designers and developers work together from day one, so developers see the design while it can still change.",
        "If you already have developers, the same Figma files go to them instead. You can buy website design as a service on its own.",
        "Where a site also has logged-in areas or customer dashboards, those screens are interface design, and they come under our UI/UX work.",
      ],
      links: [
        { label: "Web development company in Dubai", href: "/services/web-development" },
        {
          label: "UI/UX design services for web apps and dashboards",
          href: "/services/branding-and-designing/ui-ux-design",
        },
      ],
    },
    {
      heading: "Website design services in Dubai: what you receive",
      paragraphs: [
        "Website design decides how each page is laid out, how it looks and how it behaves on different screens. It comes before development, so you can see the site and change it before any code is written. We provide website design for businesses in Dubai and across the UAE.",
        "At the end you hold a set of working files that a developer can build from:",
      ],
      bullets: [
        "Page layouts: a designed layout for each type of page, such as home, service, product and contact pages.",
        "Responsive behaviour: how each layout changes from a phone to a large screen, settled in the design rather than left to the build.",
        "Interactive prototypes: clickable versions of key pages, so you can try the site and give feedback early.",
        "A design system: the colour, type and spacing rules that every page follows.",
        "A Figma component set: buttons, forms, cards and navigation as reusable parts, so new pages stay consistent after launch.",
      ],
    },
    {
      heading: "Real estate and e-commerce website design in Dubai",
      paragraphs: [
        "Real estate is among the industries we work with. People use a property website to compare listings, often on a phone, so each listing has to be quick to scan, with photos and virtual tours easy to reach and the enquiry form close by.",
        "An online store is judged on how easily someone finds a product and finishes checkout. That calls for clear category pages, product filtering that works on a small screen, and a short route from cart to payment.",
        "Landing page design is a smaller job of the same kind: one campaign, one page and one action, designed mobile-first.",
      ],
    },
    {
      heading: "How to compare website design agencies",
      paragraphs: [
        "Start with what a website design company in Dubai will actually hand you. Ask whether the handover is a set of reusable components a developer can build from, or only pictures of pages.",
        "Then look at the phone version of their work. Google says it uses the mobile version of a site's content for indexing and ranking, and it recommends responsive web design, so a layout that only works on a desktop is a problem for search as well as for people.",
        "Check readability too. The W3C's accessibility guidelines set a minimum contrast ratio of 4.5:1 for regular-sized text at Level AA, so pale grey type on white can fail them.",
        "Finally, ask who you will deal with once the design is approved. Here, that is the people doing the work, and you see progress every week.",
      ],
    },
    {
      heading: "What sets the website design price in Dubai?",
      paragraphs: [
        "Website design is quoted against the work involved, not from a rate card. A free 30-minute discovery call leads to a written, line-item proposal within 3 to 5 business days. You commit to nothing until you sign it.",
        "The price moves with these factors:",
      ],
      bullets: [
        "Pages built from one template take less design work than pages that each need their own layout.",
        "With a logo, colours and type already in place, the design starts from them. Without them, brand identity may have to come first.",
        "The more pages that need a clickable prototype, the more design time the project takes.",
        "A small site needs a small set of shared components, and a large site needs a larger design system.",
        "More rounds of review and change add time.",
        "A website redesign also has to carry existing content across, while a new site starts clean.",
      ],
      links: [
        {
          label: "Logo and brand identity design in Dubai",
          href: "/services/branding-and-designing/brand-identity-design",
        },
        { label: "Website cost in Dubai: a guide", href: "/guides/website-cost-dubai" },
      ],
    },
  ],
  faqs: [
    {
      question: "What is website design?",
      answer:
        "Website design is the planning of how a site looks and works before it is built: the page layouts, colours, type, navigation and how each page adapts to a phone. At Zan Verse Technologies the result is a set of layouts and reusable components in Figma that developers can build from.",
    },
    {
      question: "How much does a website design cost in Dubai?",
      answer:
        "The cost follows the scope, so we quote each project rather than list a fixed price. The main factors are how many different page layouts you need, whether you already have a brand, how much is prototyped and how many feedback rounds are planned. The first call and the line-item estimate are both free, and the estimate reaches you within 3 to 5 business days.",
    },
    {
      question: "Do you build the website as well as design it?",
      answer:
        "Yes, if you want us to. Our developers can build from the approved design, and your proposal can cover both parts. If you have your own developers, we hand the Figma files to them instead. Either way you can see the design and try the prototypes before anyone starts writing code.",
    },
    {
      question: "What do you need from us before the design starts?",
      answer:
        "Mainly your goals, audience, budget range and timeline, which is what the free 30-minute discovery call covers. After that it helps to have your logo and brand assets, your copy and images, and a few websites you like. If some of it is not ready yet, tell us on the call, because late content is a common cause of delay.",
    },
    {
      question: "Can you redesign an existing website?",
      answer:
        "Yes. A website redesign is the same design work on a site that already exists, with its content carried across to the new layouts. In one of our case studies, a fashion retailer replaced an outdated WordPress site, which had slow load times and a poor mobile experience, with a new online store we built. Our developers can build your redesign, or yours can work from the files.",
    },
    {
      question: "Is responsive design included?",
      answer:
        "Yes. Every layout we design includes its responsive behaviour, so a developer does not have to guess how a page changes from a phone to a large screen. The web.dev guidance from Google is to let the content decide where a layout changes, rather than designing around particular devices.",
    },
  ],
  sources: [
    {
      label: "Google Search Central: mobile-first indexing",
      href: "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing",
    },
    { label: "web.dev: Responsive web design basics", href: "https://web.dev/articles/responsive-web-design-basics" },
    {
      label: "W3C: Understanding Success Criterion 1.4.3, Contrast (Minimum)",
      href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
    },
  ],
};
