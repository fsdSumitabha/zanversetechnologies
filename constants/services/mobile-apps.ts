import type { ServiceContent } from "./types";

/* /services/mobile-apps. Facts about the company come from constants/zan.ts and
   constants/landing.ts. The outside facts are the three under `sources`, each read
   on 5 November 2026. */
export const content: ServiceContent = {
  h1: "App Development Company in Dubai",
  seoTitle: "App Development Company in Dubai",
  seoDescription:
    "iOS and Android app development in Dubai, from a first MVP to a full native build, through to store release. Free discovery call with Zan Verse Technologies.",
  lead: "Zan Verse Technologies, an app development company in Dubai, builds iOS and Android apps from a first MVP to a full native build. Startups and established businesses get an app taken from concept through to store release.",
  sections: [
    {
      heading: "Which app should you build first: MVP, cross-platform or native?",
      paragraphs: [
        "The first decision in mobile app development is how much to build, and for which phones. We offer three ways to build and a maintenance plan for afterwards, and your written proposal recommends a route along with the tech stack.",
        "For most business apps we suggest cross-platform app development, because one codebase reaches both stores. A health and fitness startup took the MVP route with us, to test its concept before approaching investors.",
      ],
      bullets: [
        "MVP apps: the core features of your idea on Android or iOS, with a cloud backend, push notifications and store submission.",
        "Cross-platform apps: one Flutter or React Native codebase for iOS and Android, with platform-specific interface details where they matter.",
        "Enterprise native apps: Swift and Kotlin builds with offline support, enterprise security and custom integrations, for demanding business use.",
        "App maintenance: bug fixes, operating system updates, security patches and analytics reports once the app is live.",
      ],
    },
    {
      heading: "iOS and Android app development in Dubai: what each store checks",
      paragraphs: [
        "We handle submission to the App Store and Google Play, and each store's rules shape the build from the start. Two examples are worth knowing before you plan a launch:",
      ],
      bullets: [
        "App Store: Apple reviews every app and says it will reject incomplete builds and apps that crash. It also requires a privacy policy link in the App Store metadata and inside the app, and it expects an app to offer more than a repackaged website.",
        "Google Play: new apps and updates must target a recent version of Android. An existing app that falls behind can stop being available to new users on newer Android versions, which is one reason an app needs upkeep after launch.",
      ],
    },
    {
      heading: "What sits behind the app: backend, cloud and AI",
      paragraphs: [
        "Most business apps rely on more than the code on the phone. Logins, payments, notifications and shared data usually run on a backend, and many apps also need an admin panel for your staff. We can build those parts or connect the app to systems you already run.",
        "As usage grows, hosting, release pipelines and monitoring come under our cloud and DevOps work.",
        "AI app development follows the same pattern. A feature such as a chatbot usually runs on a server rather than on the phone, and we connect it to the app through our AI and machine learning work.",
      ],
      links: [
        { label: "Cloud and DevOps services in Dubai", href: "/services/cloud-devops" },
        { label: "AI and machine learning development in Dubai", href: "/services/ai-machine-learning" },
      ],
    },
    {
      heading: "App development cost in Dubai depends on these six things",
      paragraphs: [
        "There is no standard price for an app, because the cost follows what it has to do. Your estimate comes in writing after a requirements call, broken down line by line, within 3 to 5 business days. These six things shape it:",
      ],
      bullets: [
        "One platform or both, and one shared codebase or two native builds.",
        "How many screens the app has, and whether it needs features such as real-time messaging, payment processing or offline use.",
        "Whether it needs its own backend and admin panel, or talks to systems you already run.",
        "How many third-party services sit behind it, such as payment gateways, maps and analytics.",
        "Whether store submission is part of the scope.",
        "What upkeep you want after the three months of support that come with every project.",
      ],
    },
    {
      heading: "Working with a mobile app development company in the UAE: what to expect",
      paragraphs: [
        "For mobile app development in Dubai and across the UAE, we begin with a free 30-minute discovery call on what the app is for, who will use it, your budget range and your timeline. The app is then designed as wireframes and interactive prototypes, so you can tap through the main flows before development starts.",
        "Development runs in agile sprints, and you see progress weekly on a live staging environment. You talk to the app developers building it, with no go-between.",
        "Invoices are in dirhams, and we are comfortable with NDAs and IP-assignment agreements under your own jurisdiction.",
      ],
      links: [{ label: "UI/UX and mobile app design services", href: "/services/branding-and-designing/ui-ux-design" }],
    },
  ],
  faqs: [
    {
      question: "Can you add AI features to a mobile app?",
      answer:
        "Yes. We can build AI features such as chatbots into an app, drawing on our work with retrieval, agents and classic models. They are listed as their own line in the estimate, so you can see what they add to the build before you agree to them.",
    },
    {
      question: "Do you build apps for specific industries?",
      answer:
        "Yes. The industries we work with include healthcare, finance and fintech, e-commerce, education, real estate, logistics, entertainment and travel. Our case studies include a health and fitness tracking app, and our clients include Ridit App, a cab booking platform. Each build is shaped around the requirements of its sector.",
    },
    {
      question: "Whose name should the app be published under?",
      answer:
        "Usually your company's. Apple says apps in regulated fields such as banking and healthcare should be submitted by the legal entity providing the service, not an individual developer. On Google Play, an organization account needs a valid D-U-N-S number, which Google says can take up to 30 days to obtain, so apply early.",
    },
  ],
  sources: [
    { label: "Apple: App Review Guidelines", href: "https://developer.apple.com/app-store/review/guidelines/" },
    {
      label: "Google Play Console Help: target API level requirements",
      href: "https://support.google.com/googleplay/android-developer/answer/11926878",
    },
    {
      label: "Google Play Console Help: required information for a developer account",
      href: "https://support.google.com/googleplay/android-developer/answer/13628312",
    },
  ],
};
