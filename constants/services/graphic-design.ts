import type { ServiceContent } from "./types";

/* /services/branding-and-designing/graphic-design. Facts about the company come
   from constants/zan.ts and constants/pages.ts, and the rights line from clauses
   3.2 and 3.4 of the terms in constants/legal.ts. The outside facts are the three
   under `sources`, each read on 5 November 2026. */
export const content: ServiceContent = {
  h1: "Graphic Design Services in Dubai",
  seoTitle: "Graphic Design Services in Dubai",
  seoDescription:
    "We provide graphic design services in Dubai: social posts, brochures, company profiles, pitch decks, flyers, banners and packaging, built as templates.",
  lead: "Zan Verse Technologies offers graphic design services in Dubai for the recurring material an active brand needs: social posts, brochures, pitch decks and packaging, built as templates so every piece stays consistent.",
  sections: [
    {
      heading: "Brochures, pitch decks, social posts and packaging: what we design",
      paragraphs: [
        "A brochure and a social post do different jobs, so this list is sorted by what each piece has to do. These are the graphic design services we offer clients in Dubai and elsewhere in the UAE:",
      ],
      bullets: [
        "Company profiles and brochures: documents a buyer or partner reads without you in the room, so company profile design and brochure design both depend on a clear reading order.",
        "Pitch decks: presentation design for a sales meeting or an investor, where each slide should make one clear point.",
        "Social media design: posts and other creatives for the platforms you publish on, which people often see on a phone.",
        "Flyer and banner design: single pieces for a campaign or an offer, where the main message has to read at a glance.",
        "Packaging design: product packaging, where the layout has to fit the shape of the pack and carry the information the product must show.",
      ],
    },
    {
      heading: "Graphic design pricing: what the estimate depends on",
      paragraphs: [
        "The price of brochure design or banner design in Dubai depends on what the job involves, so it is worked out for your order and not read off a list. Your written estimate breaks the job into line items, and each of these can change the total:",
      ],
      bullets: [
        "Volume: how many pieces you need, and how many sizes of each.",
        "Length: page count affects the cost of a company profile, a brochure or a pitch deck.",
        "Templates: setting one up takes more work than a single layout, and each piece built from it afterwards takes less.",
        "Content: whether your copy and images are ready when the design starts.",
        "Your brand: whether there is an identity to work from, or one has to be made first.",
        "Packaging: how many products and pack formats the design has to cover.",
        "Frequency: a fixed scope for a defined job, or a retainer for a regular flow of work.",
      ],
    },
    {
      heading: "Why recurring graphic design is built as templates",
      paragraphs: [
        "When every piece starts from a blank page, the look tends to drift from one job to the next, and each job takes longer than it needs to.",
        "A template fixes the layout, type sizes, colours and image style, and later pieces are built from it. A new brochure then matches the last one, and a social post looks as if it came from the same company as the pitch deck.",
        "Templates need an identity to draw from. If your logo, colours and type are settled, we work from them. If they are not, we would suggest the identity work first.",
      ],
      links: [{ label: "Logo design company in Dubai", href: "/services/branding-and-designing/brand-identity-design" }],
    },
    {
      heading: "Designing for social media and paid ads",
      paragraphs: [
        "Online work is often seen on a phone, in a feed, beside other people's posts. Keep the message short enough to read at that size, and keep the brand visible even if the image is cropped.",
        "A display campaign may need a set of parts rather than one finished artwork. Google's responsive display ads are built from assets you upload, such as images, logos and headlines, and Google Ads adjusts their size, appearance and format to fit the available ad space.",
        "Words set inside an image also need care on a website. The W3C's guidance prefers real text styled with CSS, and says that where an image of text must be used, its text alternative must contain the same text. A screen reader can then read out the same message.",
        "As a graphic design company in Dubai that also runs social media management and performance marketing, we can design the creative and run the channel it appears on.",
      ],
      links: [
        {
          label: "Social media marketing agency in Dubai",
          href: "/services/digital-marketing/social-media-management",
        },
        { label: "Performance marketing agency in Dubai", href: "/services/digital-marketing/performance-marketing" },
      ],
    },
    {
      heading: "How to compare graphic design companies in Dubai",
      paragraphs: [
        "This is recurring work, so judge a provider on how it handles the repeat order as well as on its samples. Before you choose a graphic design agency in Dubai, check these five points:",
      ],
      bullets: [
        "Templates: reusable templates keep the tenth brochure in line with the first, while a new layout each time does not. Our work is built as templates.",
        "File preparation: a brochure going to print and a post going to Instagram need different colour settings and sizes, so ask how each one is prepared.",
        "Printing: some providers stop at the files and others arrange the print run, so check which you are buying.",
        "Engagement type: ours run as a fixed scope or a retainer, so you can agree one defined piece of work before you commit to a regular flow.",
        "Rights: ours pass to you on full payment, apart from third-party material such as stock images. Ask any other provider what its terms say.",
      ],
    },
  ],
  faqs: [
    {
      question: "What is graphic design?",
      answer:
        "Graphic design is the arrangement of words, images and colour so that a message is clear and recognizably yours. For a business, that means material such as social posts, brochures, company profiles, pitch decks, flyers, banners and packaging. We build this work as templates, so each new piece matches the last.",
    },
    {
      question: "What is company profile design?",
      answer:
        "Company profile design is the layout of the document that explains who your company is, what it sells and who it serves. Buyers and partners often read it before they speak to you, so it has to make sense with nobody there to present it. We design it to match your brand.",
    },
    {
      question: "How much does graphic design cost in Dubai?",
      answer:
        "The figure follows what you order, so graphic design has no list price. Volume, page count, templates and whether your content is ready all affect it. The free discovery call comes first, and a line-item estimate reaches you in writing within 3 to 5 business days.",
    },
    {
      question: "Do I need a monthly retainer for graphic design?",
      answer:
        "No. Our engagements run as a fixed scope or a retainer. A fixed scope suits a defined piece of work, such as a company profile, while a retainer suits a steady flow of social posts and banners. The discovery call is where we work out which fits your volume.",
    },
    {
      question: "Do you need our brand guidelines before you start?",
      answer:
        "Not always. If you have guidelines, we design to them, and the templates follow your logo, colours and type. If you have no settled identity yet, we would suggest logo and brand identity work first, so the graphic design has something to stay consistent with.",
    },
    {
      question: "Do you offer pitch deck design services?",
      answer:
        "Yes. Pitch decks are part of our graphic design work, whether the deck is for investors or a sales meeting. The deck is built on a template, so later versions keep the same look when your numbers or your message change.",
    },
  ],
  sources: [
    {
      label: "Google Ads Help: About responsive display ads",
      href: "https://support.google.com/google-ads/answer/6363750",
    },
    {
      label: "W3C Web Accessibility Initiative: Images of Text",
      href: "https://www.w3.org/WAI/tutorials/images/textual/",
    },
    {
      label: "W3C Web Accessibility Initiative: Images Tutorial",
      href: "https://www.w3.org/WAI/tutorials/images/",
    },
  ],
};
