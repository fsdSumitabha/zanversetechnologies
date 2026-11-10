import "server-only";

import { credentials, office, parentCompany, site, socialLinks, teamLead, type FAQ } from "@/constants/zan";

/* ───────────────────────────────────────────────────────────────────────────
   THE QUESTION SETS OF /about-us AND /how-we-work

   Each page hands the same array to its accordion and to faqSchema(), as every
   other question set on the site does, so the FAQPage markup cannot drift from
   what the visitor reads. lib/siteData.ts reads them for /data/faqs.json and the
   Markdown copies.

   Every fact here is published elsewhere on the site: `about`, `team*`,
   `credentials`, `clients`, `projects` and the FAQ answers in constants/zan.ts,
   and the payment, ownership and confidentiality clauses of the terms in
   constants/legal.ts. The one exception is the parent company (Zan Services,
   confirmed by the owner on 10 Nov 2026), which /about-us is the first page to
   state in words; its name and address are still read from `parentCompany`.
   None of the questions is one of the homepage's, because two
   pages carrying the same question and answer give a search engine one to keep
   and one to discard. Where a fact is a stored value (a number, an address, a
   name) it is read from where it is stored rather than typed a second time.

   Server only, so all of this stays out of the browser bundle.
   ─────────────────────────────────────────────────────────────────────────── */

const [iso9001, iso27001] = credentials;

/** The footer's accounts by name, as a sentence lists them: "LinkedIn, Instagram and X". */
const socialNames = socialLinks.map((link) => link.label);
const footerAccounts =
  socialNames.length > 1
    ? `${socialNames.slice(0, -1).join(", ")} and ${socialNames[socialNames.length - 1]}`
    : socialNames.join("");

export const aboutFaqs: readonly FAQ[] = [
  {
    question: `Is ${site.name} an IT company in Dubai?`,
    answer:
      "Yes. We are an IT company based at IFZA Business Park in Dubai Silicon Oasis, in the United Arab Emirates. We build web platforms, mobile apps, AI systems and blockchain products, run digital marketing, and design interfaces and brand identities.",
  },
  /* The one fact in this list that no page states anywhere else: the owner
     confirmed it on 10 Nov 2026. It also answers the question the footer
     raises, since the accounts it links to carry the parent's name. */
  {
    question: `Is ${site.name} part of ${parentCompany.name}?`,
    answer: `Yes. ${site.name} is part of ${parentCompany.name}. It serves businesses in the UAE from its office at IFZA Business Park in Dubai Silicon Oasis. The ${footerAccounts} accounts in the footer belong to ${parentCompany.name}.`,
  },
  {
    question: `What certifications does ${site.name} hold?`,
    answer: `We work to two current ISO certifications: ${iso9001.name} for quality management, certificate number ${iso9001.ref}, and ${iso27001.name} for information security, certificate number ${iso27001.ref}. Both numbers are printed in the credentials section of this page.`,
  },
  {
    question: `Who will I work with at ${site.name}?`,
    answer: `You work directly with the people who scope and build your project, from the first call through to launch. Our team page lists the developers and digital marketers by name and role, along with our ${teamLead.role.toLowerCase()}, ${teamLead.name}.`,
  },
  {
    question: `Which businesses has ${site.name} worked with?`,
    answer:
      "Our clients include Angel Care and Patient Care Unit in healthcare, Shreya High Rise in real estate, VSK in construction and infrastructure, Linen & Stories in home textiles and lifestyle retail, and Mylta in business and SME finance. The portfolio page shows their marks, along with our case studies.",
  },
  {
    question: `Can I meet ${site.name} in person in Dubai?`,
    answer: `Yes, by arrangement. Most of the work happens over video calls, and a meeting in Dubai can be arranged where something is better done in person. To arrange one, call or WhatsApp ${office.phoneDisplay}, or write to ${site.email}. Every enquiry gets a reply within 24 hours.`,
  },
  {
    question: `Will ${site.name} sign an NDA?`,
    answer:
      "Yes. We are comfortable with NDAs and IP-assignment agreements governed by your own jurisdiction. Our terms also oblige both sides to keep non-public information confidential during the engagement and for 3 years after it ends, or longer for trade secrets.",
  },
];

export const howWeWorkFaqs: readonly FAQ[] = [
  {
    question: `How does a software project run at ${site.name}?`,
    answer:
      "Every project runs through the same four steps: discovery and strategy, design and prototype, development and testing, then launch and support. A landing page and a platform follow the same order. What changes is how long each step takes, and you are involved at every stage.",
  },
  {
    question: "How long does a software project take?",
    answer:
      "It depends on the scope, and your proposal sets out the milestones and the timeline. The builds in our case studies took between 4 and 10 weeks, from an AI support bot to an enterprise logistics dashboard. Work runs in sprints with demo checkpoints, so you see real progress throughout.",
  },
  {
    question: "How will I see progress during a project?",
    answer:
      "You get weekly progress updates and a live staging environment you can open at any point to see where the build has got to. Projects run on Slack, Jira and Google Meet, and you talk directly to the developers building your project.",
  },
  {
    question: "How does payment work for a project?",
    answer: `Payment is split into milestones tied to deliverables, and work is invoiced in UAE ${site.currencyName.toLowerCase()}. Unless we agree otherwise, our terms take an advance when you accept the proposal, payments as milestones are reached, and the final payment on completion and sign-off. Nothing is committed until you sign the proposal.`,
  },
  {
    question: "Who owns the code and designs when the project is finished?",
    answer:
      "You do, once the project is paid in full. Our terms assign you the final deliverables made for you, such as custom code, designs and content. Pre-existing materials, frameworks and third-party components are licensed to you for the project rather than assigned, and general know-how and reusable code stay with us.",
  },
  {
    question: "What does post-launch support cover?",
    answer:
      "Three months of post-launch support comes with every project, covering bug fixes, minor adjustments and performance monitoring. After that, a monthly retainer can cover uptime monitoring, security patching, content updates and performance optimization.",
  },
];
