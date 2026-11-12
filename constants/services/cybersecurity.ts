import type { ServiceContent } from "./types";

export const content: ServiceContent = {
  h1: "Cyber Security Services in Dubai",
  seoTitle: "Cybersecurity Services in Dubai",
  seoDescription:
    "Our cyber security services in Dubai cover security audits, penetration testing, smart contract security and monitoring, scoped in writing before work starts.",
  lead: "Zan Verse Technologies offers four cyber security services in Dubai: security audits, penetration testing, contract security reviews and monitoring. Any business with a website, an app or a smart contract can use them, with the scope agreed in writing before work starts.",
  sections: [
    {
      heading: "Four cyber security services, and what each one does",
      paragraphs: [
        "We are a cybersecurity company in Dubai, working with businesses here and across the UAE. You can ask for one of these services or a combination.",
        "A security audit is a structured review of your systems, code and settings. It shows where they fall short of a known standard and what should be fixed first.",
        "Penetration testing, often called pen testing, goes further. With your permission, a tester attacks your system the way a real attacker would, to find out what can actually be broken into.",
        "Contract security applies this care to smart contracts, through reviews and audits. A contract is hard to change once it is live, and a flaw can put funds at risk.",
        "Monitoring carries on after the testing ends. Automated checks raise an alert when something looks wrong, so a problem can be dealt with early. They also show when a system slows down, which points to what needs optimization.",
      ],
      links: [{ label: "Smart contract development and audits", href: "/services/blockchain-web3" }],
    },
    {
      heading: "Penetration testing services in Dubai, and what VAPT means",
      paragraphs: [
        "VAPT stands for vulnerability assessment and penetration testing. The assessment examines a system and lists its security weaknesses. The penetration test then mimics a real attack, to see which weaknesses can be used to get past its security.",
        "Each part answers a different question: what could be wrong, and what an attacker could really do. If a client or a tender asks you for VAPT services, tell us. Our security audits and penetration testing can be scoped to match, and the written proposal will say exactly what is covered.",
        "A test can only cover what is named in its scope, and it shows the system as it stood on the day. New code and new settings can add new weaknesses, so plan to test again after major changes. Common targets are:",
      ],
      bullets: [
        "Web application penetration testing: logins, sessions, forms and access to data. We follow OWASP security guidelines, and the 2025 OWASP Top 10 ranks broken access control first.",
        "Mobile app penetration testing: the app, what it stores on the device and the servers it talks to.",
        "API penetration testing: whether one user can reach data or actions that belong to another.",
      ],
      links: [{ label: "What is VAPT?", href: "/guides/what-is-vapt" }],
    },
    {
      heading: "How to choose a cyber security company in Dubai",
      paragraphs: [
        "Ask cyber security companies in Dubai for the scope in writing before testing starts. It should name what will be tested, when, how, and who gave permission. NIST's technical guide to security testing is a public reference for planning tests, analyzing findings and developing ways to reduce the risk.",
        "Ask what the report will contain. A useful report lists each finding, how serious it is, how to reproduce it and how to fix it. A raw scanner export is not a penetration test.",
        "Ask how the provider protects your information. Zan Verse holds an ISO/IEC 27001:2022 certificate for its information security management system, with the number published on our about page, and we sign NDAs on request.",
        "Be wary of any promise that a system is fully secure. A test finds problems, but it cannot prove there are none.",
      ],
      links: [{ label: "Our ISO/IEC 27001:2022 certificate", href: "/about-us" }],
    },
    {
      heading: "Cyber security audit cost: the questions that shape it",
      paragraphs: [
        "The price depends on how much there is to test and how deep the testing must go. A focused test of one app is a different job from a review of everything a company runs. Your answers to these questions shape the estimate:",
      ],
      bullets: [
        "How many applications, servers, APIs or contracts are in scope?",
        "Is the work automated scanning, or manual testing, which takes longer and finds problems a scanner misses?",
        "Does the tester start with no inside knowledge, or with user accounts and source code?",
        "Will testing run on a live system outside business hours, or on a staging copy?",
        "Should the findings be checked again after you have fixed them?",
        "Is this a one-off audit, or monitoring that continues on a retainer?",
      ],
    },
    {
      heading: "How a security project runs, from first call to fixes",
      paragraphs: [
        "Each project opens with a free 30-minute discovery call about what you run and what worries you. Your written proposal then sets out the scope, milestones and cost within 3 to 5 business days.",
        "Findings only help once they are fixed. Some fixes are code changes, and others are cloud settings or changes to how releases are made. The 2025 OWASP Top 10 ranks security misconfiguration second, so this work often reaches beyond the code. We also build software and run cloud and DevOps work, so the fixes can stay with us if you prefer.",
      ],
      links: [{ label: "Cloud and DevOps services in Dubai", href: "/services/cloud-devops" }],
    },
  ],
  faqs: [
    {
      question: "What does VAPT mean?",
      answer:
        "VAPT means vulnerability assessment and penetration testing. The vulnerability assessment examines a system and lists its security weaknesses, while the penetration test mimics a real attack to see which of them can be exploited. The two are often paired, because one shows how wide the problems are and the other shows how far an attacker could get.",
    },
    {
      question: "How much does a security audit or VAPT cost?",
      answer:
        "The cost depends on the scope, so there is no single price. It changes with the number of applications, servers and APIs tested, how much of the testing is manual, and whether fixes are retested. Tell us what you run on a free discovery call, and you receive a written estimate. Nothing is charged until you sign the proposal.",
    },
    {
      question: "What is a security audit?",
      answer:
        "A security audit is a structured review of how well your systems protect data and resist misuse. It checks areas such as access rights, software versions, settings, code and logging against a known standard, then shows what to fix first. An audit can include a penetration test, but on its own it usually looks more widely and does not try to break in.",
    },
    {
      question: "What is on a cyber security audit checklist?",
      answer:
        "A cyber security audit checklist usually covers who has access and how they log in, whether software is patched, how systems are configured, how data is stored and backed up, whether activity is logged and monitored, and what happens when an incident occurs. The exact list depends on what your business runs.",
    },
    {
      question: "Can you test smart contracts as well as websites and apps?",
      answer:
        "Yes. Contract security is part of this service, alongside security audits and penetration testing for websites and apps. A smart contract needs a different kind of review, because a flaw found after launch usually cannot be fixed in place, and it can put funds at risk straight away.",
    },
    {
      question: "Does your ISO/IEC 27001 certificate cover my business?",
      answer:
        "No. Our ISO/IEC 27001:2022 certificate covers the information security management system of Zan Verse Technologies, and its number is published on our about page. It says nothing about your own systems. Certifying your own organization is a separate process, and our testing does not give you a certificate.",
    },
  ],
  sources: [
    {
      label: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment",
      href: "https://csrc.nist.gov/pubs/sp/800/115/final",
    },
    {
      label: "NIST glossary: penetration testing",
      href: "https://csrc.nist.gov/glossary/term/penetration_testing",
    },
    {
      label: "OWASP Top 10:2025",
      href: "https://top10.owasp.org/2025/",
    },
  ],
};
