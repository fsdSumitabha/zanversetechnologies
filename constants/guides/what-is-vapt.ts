import type { Guide } from "./types";

export const guide: Guide = {
  slug: "what-is-vapt",
  title: "What is VAPT, and does your business need it?",
  seoTitle: "What Is VAPT? Penetration Testing",
  seoDescription:
    "VAPT means vulnerability assessment and penetration testing. What each finds, what a report holds, how a test is scoped, and how often to run one.",
  lead: "VAPT stands for vulnerability assessment and penetration testing: a broad check that lists known weaknesses, then a hands-on test that tries to exploit them. Your business probably needs it if it runs systems that hold customer data, take payments or would be costly to lose.",
  summary:
    "What VAPT means, how a vulnerability assessment differs from a penetration test, what a report holds, and whether your business needs one.",
  published: "2026-11-05",
  updated: "2026-11-05",
  sections: [
    {
      heading: "What does VAPT mean, and what does each part find?",
      paragraphs: [
        "VAPT stands for vulnerability assessment and penetration testing. It joins two kinds of security testing that answer different questions. A vulnerability assessment asks which known weaknesses a system has. A penetration test asks what an attacker could actually do with them.",
        "A vulnerability assessment is broad and often relies on automated scanning. A scanner compares how your systems respond against the signatures of known vulnerabilities, then reports the matches. The US National Institute of Standards and Technology (NIST) calls this a relatively fast and easy way to measure exposure to weaknesses that exist in isolation. It also warns that scanners can report flaws that do not exist, known as false positives, so someone with the right expertise has to interpret the results. Scanners cannot detect flaws that appear only when attack patterns are combined.",
        "A penetration test goes deeper and takes more skill. Testers mimic real attacks to find ways around a system's security, often looking for combinations of weaknesses that give more access than any single flaw would. The Web Security Testing Guide from the OWASP Foundation says manual testing confirms whether a flaw can be exploited, tests integration points and probes business logic. Business logic means the rules your application should enforce, such as that a customer cannot skip the payment step.",
        "The two work together. NIST notes that no one technique gives a complete picture of a system's security, and that penetration testing usually relies on scanning to find its targets.",
        "For web applications, the OWASP Top 10 is an awareness list of the most critical risks. It includes broken access control, where users can act outside their permissions; security misconfiguration, where a system is set up incorrectly; and injection, where a system runs untrusted input as commands.",
      ],
    },
    {
      heading: "Does your business need VAPT?",
      paragraphs: [
        "Probably yes, if a breach or outage of the system would seriously hurt the business. That usually means a website, mobile app or API (the interface other software uses to connect to yours) that holds personal data, takes payments, lets customers or staff log in, or connects to other business systems.",
        "A simple brochure site with no logins, payments or stored customer data gives an attacker less to work with. NIST says resources should go first to high-priority systems, and that lower-priority systems may be tested less often. Regular scanning and prompt updates are a sensible start for a site like that. OWASP's advice is to consider a formal penetration test if you require a high level of assurance.",
        "Order matters. The UK's National Cyber Security Centre says a penetration test should check your own vulnerability management, not serve as your main way of finding flaws. So run scans and fix what they show before paying for testers' time.",
        "This guide does not cover what any law or regulator may require of your business. If a customer or regulator has asked you for a test, find out exactly what it must cover and write that into the scope.",
      ],
    },
    {
      heading: "What does a VAPT report include?",
      paragraphs: [
        "A useful report tells managers what the risk is and tells engineers how to reproduce and fix each problem. Be wary of one that is mostly raw scanner output. OWASP's guide says tool output should be cleaned, not just dumped.",
        "Read the risk ratings against your own business. The National Cyber Security Centre points out that testers may not know a flaw's full business impact, so they may rate it lower or higher than you would, and that decisions on fixes remain yours.",
        "Keep the report private. NIST advises treating test results as sensitive, because they show weaknesses an attacker could use.",
        "OWASP's Web Security Testing Guide suggests a report with these parts:",
      ],
      bullets: [
        "Executive summary: the objective of the test, key findings in business terms and strategic recommendations, without the technical detail.",
        "Scope, limitations and timeline: what was agreed, what could not be tested and why, and how long the work took.",
        "Findings summary: a list of findings with a risk level for each, such as informational, low, medium, high or critical.",
        "Finding details: what each weakness is, how it can be exploited, the damage that could follow and the steps to fix it.",
        "Appendices: the test method, how risk was rated and relevant output from the tools.",
      ],
    },
    {
      heading: "How is a penetration test scoped?",
      paragraphs: [
        "Scope should be agreed in writing before any testing starts. In NIST's method, the planning phase sets the rules, records management's approval and fixes the test's goals. The National Cyber Security Centre says scoping should involve the people who own the risk, technical staff who know the system, and a representative of the test team.",
        "This step matters because a penetration test carries real risk. NIST warns that systems may be damaged or made inoperable during a test, and that experienced testers can reduce this risk but never fully remove it. A test can be designed to stop when one more action would cause damage, and OWASP notes that testing can target a staging environment, a private copy used for checks, as well as the live system.",
        "The written scope should state:",
      ],
      bullets: [
        "The technical boundaries: which systems, applications and addresses are in scope, and which are excluded.",
        "The types of test expected, and any activities that are not allowed.",
        "The timeframe and the effort, usually given in days of work.",
        "Any special handling, such as out-of-hours testing or critical systems that need extra care.",
        "When testing must halt, and who to call if something goes wrong.",
        "What the report must contain, and when it is due.",
      ],
    },
    {
      heading: "What are black box, white box and grey box testing?",
      paragraphs: [
        "The terms describe how much the testers know before they start. Choose by the risk that worries you most.",
      ],
      bullets: [
        "Black box: no information about the system's internals is shared, and the testers work from the outside. The National Cyber Security Centre calls this opaque or closed box testing. It models an attacker with no link to your business, but the lack of information can leave weaknesses undiscovered in the time allowed.",
        "White box: full information is shared, which can include the source code. The National Cyber Security Centre calls this transparent or open box testing, and says it identifies known software vulnerabilities and common misconfigurations, which shows whether your own controls are working.",
        "Grey box: a mix of the two. NIST, which spells it gray box, defines it as tests that use both white box and black box techniques. Testers might attack from outside and also work with a user account, which suits a worry about what a logged-in customer or member of staff could reach.",
      ],
    },
    {
      heading: "How often should you run VAPT?",
      paragraphs: [
        "A sensible starting point is regular scanning, a penetration test once a year, and another test after major changes. Adjust that to your risk.",
        "NIST's 2008 testing guide says an annual penetration test may be sufficient because of its cost and potential impact, with regular scanning in between. OWASP's Top 10 advises at least annual testing, depending on the level of assurance your application needs.",
        "NIST also says application tests should be repeated when significant patches, updates or other changes are made, and when the threats around the application change significantly. OWASP's testing guide lists penetration testing as scheduled and triggered, by a release schedule or on demand.",
        "A test result is a snapshot. The National Cyber Security Centre says a penetration test can only validate that systems are not vulnerable to known issues on the day of the test. If a year passes between tests and you have no other checks, flaws can sit unnoticed.",
      ],
    },
    {
      heading: "How can Zan Verse help with penetration testing?",
      paragraphs: [
        "Zan Verse Technologies, an IT company based in Dubai, offers a cybersecurity service covering security audits, penetration testing, contract security and monitoring. Tell us what you run and what worries you on a free 30-minute discovery call, and you get a written proposal within 3 to 5 business days, with no obligation until you sign it.",
      ],
      links: [
        { label: "Cybersecurity services: security audits, penetration testing and monitoring", href: "/services/cybersecurity" },
        { label: "What is a smart contract, and why audit it?", href: "/guides/what-is-a-smart-contract" },
        { label: "What is an AI agent? The parts it has and the risks, including prompt injection", href: "/guides/what-is-an-ai-agent" },
      ],
    },
  ],
  faqs: [
    {
      question: "Is a vulnerability scan the same as a penetration test?",
      answer:
        "No. A vulnerability scan uses tools to compare your systems against known weaknesses and reports possible matches, some of which may be false alarms. A penetration test goes further: testers try to exploit weaknesses, often combining several, to show what an attacker could actually reach.",
    },
    {
      question: "How much does VAPT cost?",
      answer:
        "There is no fixed price, because the cost follows the scope. The main drivers are how many systems and user roles are covered, how much manual testing you want, any out-of-hours limits, and whether a retest is included. Effort is usually given in days of work, so ask for a written estimate that states them.",
    },
    {
      question: "What is the difference between VAPT and a security audit?",
      answer:
        "The terms overlap. NIST separates examinations, which review documents such as policies, configurations and logs, from tests, which work hands-on with systems to find vulnerabilities. VAPT is testing. A security audit can include either or both, so ask for its scope in writing before you compare quotes.",
    },
    {
      question: "Does passing a penetration test mean we are secure?",
      answer:
        "No. A test shows what one team found, within an agreed scope and time. NIST notes that testing does not give a comprehensive view of security, and that attackers can take whatever time they need. Keep scanning, patching and monitoring between tests.",
    },
    {
      question: "Is testing against the OWASP Top 10 enough?",
      answer:
        "No. OWASP calls the Top 10 primarily an awareness document, and says that if you use it as a testing standard it is the bare minimum and just a starting point. For a fuller standard, OWASP encourages its Application Security Verification Standard, and its Web Security Testing Guide describes a wider set of tests.",
    },
  ],
  sources: [
    {
      label: "NIST SP 800-115: Technical Guide to Information Security Testing and Assessment (2008)",
      href: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf",
    },
    {
      label: "OWASP Web Security Testing Guide: The Web Security Testing Framework",
      href: "https://wstg.owasp.org/latest/3-The_OWASP_Testing_Framework/0-The_Web_Security_Testing_Framework/",
    },
    {
      label: "OWASP Web Security Testing Guide: Reporting Structure",
      href: "https://wstg.owasp.org/latest/5-Reporting/01-Reporting_Structure/",
    },
    {
      label: "OWASP Top 10:2025: Establishing a Modern Application Security Program",
      href: "https://top10.owasp.org/2025/0x03_2025-Establishing_a_Modern_Application_Security_Program/",
    },
    {
      label: "UK National Cyber Security Centre: Penetration testing",
      href: "https://www.ncsc.gov.uk/guidance/penetration-testing",
    },
    {
      label: "NITDA, Nigeria's national IT agency: Vulnerability Assessment and Penetration Testing",
      href: "https://nitda.gov.ng/vapt-service/",
    },
  ],
  services: [{ label: "Cybersecurity", href: "/services/cybersecurity" }],
};
