import type { ServiceContent } from "./types";

/* /services/branding-and-designing/ui-ux-design. Facts about the company come from
   constants/zan.ts and constants/pages.ts. The outside facts are the three under
   `sources`, each read on 5 November 2026. */
export const content: ServiceContent = {
  h1: "UI/UX Design Services in Dubai",
  seoTitle: "UI/UX Design Services in Dubai",
  seoDescription:
    "Zan Verse Technologies provides UI/UX design services in Dubai: research, wireframes, tested prototypes and finished interfaces for web and mobile products.",
  lead: "Our UI/UX design services in Dubai take a web app, mobile app or dashboard from research and wireframes to tested prototypes and a finished interface. Zan Verse Technologies checks the flows before anything is built.",
  sections: [
    {
      heading: "UI vs UX: what each one means",
      paragraphs: [
        "UX, or user experience, is how well a product works for the person using it: whether they can find what they need and finish the task. UI, or user interface, is what they see and touch along the way: screens, buttons, type and colour.",
        "The W3C's accessibility pages give a useful test by quoting the ISO definition of usability: the extent to which a product can be used by specified users to achieve specified goals effectively, efficiently and with satisfaction in a specified context of use.",
        "We treat UI and UX as one job. A clear set of steps can still fail on a cluttered screen, and a clean screen does not help if the steps are in the wrong order.",
      ],
    },
    {
      heading: "From research to finished interface: what our UI and UX design covers",
      paragraphs: [
        "For companies in Dubai and across the UAE, the work runs in the same order whatever the product. It starts from the tasks people need to complete, and the flows are tested before development begins.",
      ],
      bullets: [
        "UX research: finding out who uses the product, what they are trying to do and where they get stuck.",
        "Wireframes: plain layouts of each screen, so structure and content can be agreed before any visual design.",
        "Interactive prototypes: the main flows made clickable, so they can be tried before anything is built.",
        "Usability testing: people try real tasks on the prototype, and we change what does not work.",
        "Finished interface: final screens and a design system, production-ready for developers, with handoff through a tool such as Figma.",
      ],
    },
    {
      heading: "Why UI/UX design cost varies",
      paragraphs: [
        "UI/UX design is priced by the work a product needs, so there is no standard fee. We talk first, on a free discovery call. Within 3 to 5 business days you then have each part of the work priced in writing.",
        "The number of flows and screens is usually the biggest factor. A sign-up flow is a small job, and a product with several user roles is a much larger one.",
        "Research and testing come next: whether you already have users and data to learn from, and how many rounds of prototype testing are planned. Designing for both web and mobile adds work, and so does creating a design system if you do not have one.",
      ],
    },
    {
      heading: "Mobile app design and dashboard design",
      paragraphs: [
        "Mobile app design starts from how people hold and use the phone. Apple's Human Interface Guidelines point out that people generally hold an iPhone in one or both hands, and that controls in the middle or bottom of the display tend to be easier to reach.",
        "Android's design guides point to Material Design 3, an open source system of guidelines, components and tools. Where an app shares one codebase across iOS and Android, we still design the details that differ on each platform.",
        "Dashboard design is a different problem. People open a dashboard repeatedly to make decisions, so the work is about what each role needs to see first, how much data one screen can hold, and what the screen shows when there is no data yet.",
      ],
      links: [
        { label: "Mobile app development services in Dubai", href: "/services/mobile-apps" },
        { label: "Website development services in Dubai", href: "/services/web-development" },
      ],
    },
    {
      heading: "Choosing a UI/UX design company in Dubai",
      paragraphs: [
        "When you compare UI/UX design agencies in Dubai, ask to see what changed after testing. A portfolio shows finished screens, while a prototype and the changes that came from testing it show how a company actually works.",
        "Ask how the design reaches development. With us, designers and developers share the project from day one, and the finished interface comes with a design system developers can follow.",
        "Check that the company suits the product you have. UI/UX work fits products people use to get something done, such as apps and dashboards. For a marketing site, our website design service is the closer fit.",
      ],
      links: [{ label: "Website design services in Dubai", href: "/services/branding-and-designing/website-design" }],
    },
  ],
  faqs: [
    {
      question: "What is UI/UX design?",
      answer:
        "UI/UX design is the work of planning how a digital product behaves and how it looks. UX covers the structure, the steps and whether people can finish their tasks. UI covers the screens, controls, type and colour. We do both together for web apps, mobile apps and dashboards.",
    },
    {
      question: "How much does UI/UX design cost?",
      answer:
        "It depends on how many flows and screens the product has, how much research is needed, how much testing is planned and whether a design system already exists. We do not publish a standard price. Book a free discovery call, and within 3 to 5 business days you will see a written price for each line of the work.",
    },
    {
      question: "What is the difference between UI/UX design and website design?",
      answer:
        "UI/UX design is for products people use to complete tasks, such as web apps, mobile apps and dashboards. Website design is for the pages of a site and how they look at each screen size. A site with customer accounts or a dashboard can need both, and we offer each on its own.",
    },
    {
      question: "Do you test designs before they are built?",
      answer:
        "Yes. Testing the flows before development is part of the service. We build interactive prototypes, test them against real tasks and change what does not work, which is less work than changing a finished product. You follow the changes through our weekly progress updates.",
    },
    {
      question: "Can we buy UI/UX design without development?",
      answer:
        "Yes. UI/UX design is sold as its own discipline, so you can hand the finished interface to your own developers. If you would rather have one company do both, our developers can build it, and they work with our designers from day one.",
    },
  ],
  sources: [
    {
      label: "W3C: Accessibility, Usability, and Inclusion",
      href: "https://www.w3.org/WAI/fundamentals/accessibility-usability-inclusion/",
    },
    {
      label: "Apple Human Interface Guidelines: Designing for iOS",
      href: "https://developer.apple.com/design/human-interface-guidelines/designing-for-ios",
    },
    { label: "Android Developers: Design for mobile", href: "https://developer.android.com/design/ui/mobile" },
  ],
};
