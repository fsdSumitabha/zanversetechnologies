import "server-only";

import { pageUpdated } from "@/constants/freshness";
import { legalDocuments, type LegalBlock } from "@/constants/legal";
import { aboutFaqs, howWeWorkFaqs } from "@/constants/pageFaqs";
import {
  areaPages,
  childrenOf,
  contactPage,
  guidesPage,
  howWeWorkPage,
  labels,
  legalIntro,
  ourTeamPage,
  portfolioPage,
  servicePages,
  servicesPage,
  type LegalSlug,
  type ServicePage,
} from "@/constants/pages";
import {
  about,
  clients,
  contactIntro,
  credentials,
  credentialsIntro,
  deckPractices,
  faqIntro,
  faqs,
  hero,
  industries,
  industriesIntro,
  metrics,
  metricsIntro,
  office,
  partnersIntro,
  pillars,
  pillarsIntro,
  processIntro,
  processSteps,
  servicesFaqs,
  servicesIntro,
  site,
  teamGroups,
  teamIntro,
  teamLead,
  techDomains,
  techIntro,
  whyUs,
  workIntro,
  type FAQ,
  type Person,
  type Practice,
} from "@/constants/zan";
import { waLink } from "@/lib/links";
import { absoluteUrl } from "@/lib/metadata";
import {
  caseStudiesData,
  guidesData,
  isLegalSlug,
  officeAddress,
  officeMapUrl,
  publicPages,
  publicPaths,
  serviceDataFor,
  type CaseStudyData,
  type GuideData,
  type PublicPage,
  type ServiceData,
} from "@/lib/siteData";

/* ───────────────────────────────────────────────────────────────────────────
   EVERY PUBLIC PAGE, AS MARKDOWN

   An agent that only wants the words should not have to download a page's markup
   and React data with them. Each page here says what the real page says, from
   the same constants, in the order it runs. The real page stays the one to cite
   and rank: app/md/[...path]/route.ts sends these with a noindex and a canonical
   pointing back at it.

   SERVER ONLY, for the reason in lib/siteData.ts. No em dashes here either: this
   is the site's copy, whoever reads it.

   A PAGE ADDED TO constants/pages.ts `siteRoutes` already appears in /md, /llms.txt
   and /llms-full.txt. Until it has a builder below, its copy is one line naming
   the real page, so give it a builder here.
   ─────────────────────────────────────────────────────────────────────────── */

/* ── Writing Markdown ─────────────────────────────────────────────────────── */

type Block = string | false | null | undefined | readonly Block[];

const flatten = (blocks: readonly Block[]): string[] =>
  blocks.flatMap((block) => {
    if (!block) return [];
    return typeof block === "string" ? [block] : flatten(block);
  });

const join = (...blocks: Block[]) => flatten(blocks).join("\n\n");

/** Copy as Markdown text: one line, and nothing in it read as markup. */
const text = (copy: string) => copy.replace(/\s+/g, " ").trim().replace(/[\\`*<[\]]/g, "\\$&");

/** A paragraph. A number or a dash at the very start of one would open a list. */
const para = (copy: string) => text(copy).replace(/^(\d+)([.)] )/, "$1\\$2").replace(/^([-+#>] )/, "\\$1");

const heading = (level: 1 | 2 | 3 | 4, copy: string) => `${"#".repeat(level)} ${text(copy)}`;
const link = (label: string, href: string) => `[${text(label)}](${href})`;
const strong = (copy: string) => `**${text(copy)}**`;
const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

/** A sentence from a list of names. */
const sentence = (label: string, items: readonly string[]) => `${label}: ${text(items.join(", "))}.`;

/* ── One page ─────────────────────────────────────────────────────────────── */

function page(path: string, title: string, updated: string, ...blocks: Block[]): string {
  return `${join(heading(1, title), `> Markdown copy of <${absoluteUrl(path)}>. Last updated ${updated}.`, blocks)}\n`;
}

/* ── Bands more than one page has ─────────────────────────────────────────── */

const contactDetails = () =>
  list([
    `Phone and WhatsApp: ${link(office.phoneDisplay, `tel:${office.phoneTel}`)}`,
    `WhatsApp: ${link("start a chat", waLink(site.whatsapp, site.name))}`,
    `Email: ${link(site.email, `mailto:${site.email}`)}`,
    `Office: ${text(officeAddress)}`,
  ]);

const contactBand = () =>
  join(
    heading(2, contactIntro.title.join(" ")),
    para(contactIntro.lead),
    contactDetails(),
    para(`Enquiry form: ${absoluteUrl("/contact-us")}`),
  );

const faqBand = (title: string, items: readonly FAQ[]) =>
  items.length > 0 && [heading(2, title), items.flatMap((item) => [heading(3, item.question), para(item.answer)])];

const stepsBand = (title: string, lead?: string) => [
  heading(2, title),
  lead && para(lead),
  processSteps.map((step) => [
    heading(3, step.title),
    para(step.description),
    step.deliverables.length > 0 && list(step.deliverables.map(text)),
  ]),
];

/** The four steps in brief, as a service page shows them. */
const stepsBrief = () => [
  heading(2, labels.process),
  list(processSteps.map((step) => `${strong(step.title)}: ${text(step.description)}`)),
  para(`More: ${absoluteUrl("/how-we-work")}`),
];

const reasonsBand = () => [
  heading(2, whyUs.title.join(" ")),
  list(whyUs.items.map((item) => `${strong(item.title)} (${text(item.tagline)}): ${text(item.description)}`)),
];

const technologyList = (domains: readonly { label: string; blurb: string; stack: readonly string[] }[]) =>
  list(domains.map((domain) => `${strong(domain.label)}: ${text(domain.blurb)} ${sentence("Tools", domain.stack)}`));

const technologyBand = () => [heading(2, techIntro.title.join(" ")), para(techIntro.lead), technologyList(techDomains)];

const metricsList = () => list(metrics.map((m) => `${strong(m.value)} ${text(m.label)}: ${text(m.detail)}`));

const clientsBand = () => [
  heading(2, partnersIntro.title.join(" ")),
  para(partnersIntro.lead),
  list(clients.map((client) => `${strong(client.name)}: ${text(client.sector)}`)),
];

const industriesBand = () => [
  heading(2, industriesIntro.title.join(" ")),
  para(industriesIntro.lead),
  list(industries.map((industry) => `${strong(industry.label)}: ${text(industry.description)}`)),
];

const caseStudy = (project: CaseStudyData) => [
  heading(3, project.name),
  para(`${project.discipline}, ${project.industry}, ${project.timeline}.`),
  para(`Challenge: ${project.challenge}`),
  para(`What we built: ${project.solution}`),
  list(project.results.map((result) => text(`${result.metric}: ${result.value}`))),
  sentence("Technology", project.techStack),
];

const personLine = (person: Person) =>
  [
    `${strong(person.name)}, ${text(person.role)}${person.experience ? `, ${text(person.experience)}` : ""}.`,
    person.description && text(person.description),
    person.linkedin && link("LinkedIn", person.linkedin),
  ]
    .filter(Boolean)
    .join(" ");

const practiceBand = (practice: Practice) => [
  heading(3, practice.title),
  para(practice.tagline),
  para(practice.lead),
  list(practice.items.map((item) => `${link(item.title, absoluteUrl(item.href))}: ${text(item.description)}`)),
];

const serviceLine = (service: ServicePage) =>
  `${link(service.title, absoluteUrl(service.href))} (${text(service.tagline)}): ${text(service.description)}`;

/* ── The pages ────────────────────────────────────────────────────────────── */

function home(): string {
  const words = hero.typingWords;
  const typed = `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
  return page(
    "/",
    `${site.heroOwner}${hero.subtitle.map((part) => part.text).join("")}`,
    pageUpdated("/"),
    para(`${hero.headlineLead} ${typed}.`),
    para(site.description),
    heading(2, servicesIntro.title.join(" ")),
    para(servicesIntro.lead),
    deckPractices.map(practiceBand),
    reasonsBand(),
    heading(2, pillarsIntro.title.join(" ")),
    para(pillarsIntro.lead),
    list(
      pillars.map(
        (pillar) =>
          `${link(pillar.title, absoluteUrl(pillar.href))}: ${text(pillar.description)} ${sentence("Includes", pillar.items)}`,
      ),
    ),
    heading(2, workIntro.title.join(" ")),
    para(workIntro.lead),
    caseStudiesData().caseStudies.map(caseStudy),
    heading(2, metricsIntro.eyebrow),
    metricsList(),
    clientsBand(),
    technologyBand(),
    stepsBand(processIntro.title.join(" "), processIntro.lead),
    industriesBand(),
    heading(2, about.eyebrow),
    para(about.heading.join(" ")),
    about.body.map(para),
    list(about.principles.map((fact) => `${text(fact.label)}: ${text(fact.value)}`)),
    heading(2, teamIntro.title.join(" ")),
    para(teamIntro.lead),
    para(`${teamIntro.more.label}: ${absoluteUrl(teamIntro.more.href)}`),
    list([teamLead, ...teamGroups.flatMap((group) => group.people)].map(personLine)),
    faqBand(faqIntro.title.join(" "), faqs),
    contactBand(),
  );
}

function servicesIndex(): string {
  const development = areaPages.filter((area) => area.practice === "development");
  const parents = areaPages.filter((area) => area.practice !== "development");
  return page(
    "/services",
    servicesPage.title.join(" "),
    pageUpdated("/services"),
    para(servicesPage.lead),
    heading(2, "Development"),
    list(development.map(serviceLine)),
    parents.map((parent) => [
      heading(2, parent.title),
      para(`${parent.title} overview: ${absoluteUrl(parent.href)}`),
      list(childrenOf(parent.slug).map(serviceLine)),
    ]),
    reasonsBand(),
    stepsBand(processIntro.title.join(" "), processIntro.lead),
    faqBand("Questions about the services", servicesFaqs),
    contactBand(),
  );
}

function servicePage(service: ServicePage): string {
  const data: ServiceData = serviceDataFor(service);
  return page(
    service.href,
    data.h1,
    data.updated,
    para(data.lead),
    data.disciplines.length === 0 &&
      data.capabilities.length > 0 && [heading(2, labels.included), list(data.capabilities.map(text))],
    data.sections.map((section) => [
      heading(2, section.heading),
      section.paragraphs.map(para),
      section.bullets && section.bullets.length > 0 && list(section.bullets.map(text)),
      section.links &&
        section.links.length > 0 &&
        `${labels.seeAlso}: ${section.links.map((item) => link(item.label, item.href)).join(", ")}`,
    ]),
    data.disciplines.length > 0 && [
      heading(2, labels.disciplines),
      list(data.disciplines.map((child) => `${link(child.title, child.url)} (${text(child.tagline)}): ${text(child.description)}`)),
    ],
    data.packages.length > 0 && [
      heading(2, labels.packages),
      list(data.packages.map((pkg) => `${strong(pkg.title)} (${text(pkg.tagline)}): ${text(pkg.description)}`)),
    ],
    data.technology.length > 0 && [heading(2, labels.technology), technologyList(data.technology)],
    data.caseStudies.length > 0 && [heading(2, labels.relatedWork), data.caseStudies.map(caseStudy)],
    stepsBrief(),
    faqBand(`${service.title} questions`, data.faqs),
    data.related.length > 0 && [
      heading(2, labels.otherServices),
      list(data.related.map((item) => `${link(item.title, item.url)}: ${text(item.tagline)}`)),
    ],
    data.sources.length > 0 && [
      heading(2, labels.sources),
      list(data.sources.map((source) => link(source.label, source.href))),
    ],
    contactBand(),
  );
}

function portfolio(): string {
  return page(
    "/portfolio",
    portfolioPage.title.join(" "),
    pageUpdated("/portfolio"),
    para(portfolioPage.lead),
    heading(2, "Case studies"),
    caseStudiesData().caseStudies.map(caseStudy),
    heading(2, metricsIntro.eyebrow),
    metricsList(),
    clientsBand(),
    contactBand(),
  );
}

function howWeWork(): string {
  return page(
    "/how-we-work",
    howWeWorkPage.title.join(" "),
    pageUpdated("/how-we-work"),
    para(howWeWorkPage.lead),
    list(about.principles.map((fact) => `${text(fact.label)}: ${text(fact.value)}`)),
    stepsBand(
      "What happens, in order",
      "Every project runs the same way, whether it is a landing page or a platform. What changes is how long each step takes.",
    ),
    reasonsBand(),
    technologyBand(),
    heading(2, "Who you talk to"),
    para(about.body[1]),
    faqBand("Questions about how we work", howWeWorkFaqs),
    contactBand(),
  );
}

function aboutUs(): string {
  return page(
    "/about-us",
    about.heading.join(" "),
    pageUpdated("/about-us"),
    para(about.body[0]),
    list(about.principles.map((fact) => `${text(fact.label)}: ${text(fact.value)}`)),
    heading(2, "How we work with you"),
    para(about.body[1]),
    metricsList(),
    heading(2, credentialsIntro.title),
    para(credentialsIntro.lead),
    list(credentials.map((item) => `${strong(item.name)}: ${text(item.body)} ${text(item.refLabel)} ${text(item.ref)}.`)),
    heading(2, "Where to find us"),
    contactDetails(),
    list([
      "Meetings: Video calls, or in Dubai by arrangement",
      "Agreements: NDAs and IP assignment under your jurisdiction",
    ]),
    industriesBand(),
    faqBand("Questions about the company", aboutFaqs),
  );
}

function ourTeam(): string {
  return page(
    "/our-team",
    ourTeamPage.title.join(" "),
    pageUpdated("/our-team"),
    para(ourTeamPage.lead),
    heading(2, "Leadership"),
    list([personLine(teamLead)]),
    teamGroups.map((group) => [heading(2, group.label), para(group.blurb), list(group.people.map(personLine))]),
    contactBand(),
  );
}

function contact(): string {
  return page(
    "/contact-us",
    contactPage.title.join(" "),
    pageUpdated("/contact-us"),
    para(contactPage.lead),
    heading(2, "Talk to us directly"),
    contactDetails(),
    para("The Dubai office answers this number on calls and on WhatsApp. Every enquiry is answered within 24 hours."),
    heading(2, "Send an enquiry"),
    para(`The form on this page asks for your name, your email, the service and your project. Phone is optional. Page: ${absoluteUrl("/contact-us")}`),
    para(`An agent acting for a person can send the same enquiry with POST ${absoluteUrl("/api/leads")}, described in ${absoluteUrl("/openapi.json")}.`),
    faqBand(faqIntro.title.join(" "), faqs),
  );
}

function guidesIndex(): string {
  return page(
    "/guides",
    guidesPage.title.join(" "),
    pageUpdated("/guides"),
    para(guidesPage.lead),
    list(guidesData().map((guide) => `${link(guide.title, guide.url)}: ${text(guide.summary)}`)),
    contactBand(),
  );
}

function guidePage(guide: GuideData): string {
  return page(
    guide.path,
    guide.title,
    guide.updated,
    para(guide.lead),
    guide.sections.map((section) => [
      heading(2, section.heading),
      section.paragraphs.map(para),
      section.bullets && section.bullets.length > 0 && list(section.bullets.map(text)),
      section.links &&
        section.links.length > 0 &&
        `${labels.seeAlso}: ${section.links.map((item) => link(item.label, item.href)).join(", ")}`,
    ]),
    faqBand("Common questions", guide.faqs),
    guide.services.length > 0 && [
      heading(2, labels.relatedServices),
      list(guide.services.map((item) => link(item.label, item.href))),
    ],
    guide.sources.length > 0 && [
      heading(2, labels.sources),
      list(guide.sources.map((source) => link(source.label, source.href))),
    ],
    contactBand(),
  );
}

function legalLine(block: LegalBlock): string {
  if (!block.contact) return text(block.text);
  return block.contact === "email"
    ? link(site.email, `mailto:${site.email}`)
    : link(office.phoneDisplay, `tel:${office.phoneTel}`);
}

function legalPage(slug: LegalSlug): string {
  const doc = legalDocuments[slug];
  // The documents are stored flat, so a run of `li` blocks becomes one list.
  const blocks: string[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length > 0) blocks.push(list(bullets));
    bullets = [];
  };
  for (const block of doc.blocks) {
    if (block.tag === "li") {
      bullets.push(legalLine(block));
      continue;
    }
    flush();
    if (block.tag === "p") blocks.push(para(block.text));
    else blocks.push(heading(block.tag === "h2" ? 2 : block.tag === "h3" ? 3 : 4, block.text));
  }
  flush();
  return page(
    `/${slug}`,
    doc.title,
    pageUpdated(`/${slug}`),
    para(legalIntro[slug]),
    para(`${labels.effective}: ${doc.effective}`),
    blocks,
  );
}

/* ── The way in ───────────────────────────────────────────────────────────── */

const STANDING_PAGES: Readonly<Record<string, () => string>> = {
  "/": home,
  "/services": servicesIndex,
  "/portfolio": portfolio,
  "/how-we-work": howWeWork,
  "/about-us": aboutUs,
  "/our-team": ourTeam,
  "/contact-us": contact,
  "/guides": guidesIndex,
};

/** A public page's Markdown, or undefined for anything that is not one. */
export function markdownFor(path: string): string | undefined {
  if (!publicPaths().includes(path)) return undefined;

  const standing = STANDING_PAGES[path];
  if (standing) return standing();

  const service = servicePages.find((item) => item.href === path);
  if (service) return servicePage(service);

  const guide = guidesData().find((item) => item.path === path);
  if (guide) return guidePage(guide);

  const slug = path.slice(1);
  if (isLegalSlug(slug)) return legalPage(slug);

  return page(path, path, pageUpdated(path), para(`This page has no Markdown copy yet. Read it at ${absoluteUrl(path)}`));
}

/** Its address under /md, as route segments: the homepage is /md/index. */
const markdownSegments = (path: string) => (path === "/" ? ["index"] : path.slice(1).split("/"));

/** The other way round, for the route. */
export const pathFromSegments = (segments: readonly string[]) =>
  segments.join("/") === "index" ? "/" : `/${segments.join("/")}`;

export const markdownParams = () => publicPaths().map((path) => ({ path: markdownSegments(path) }));

/* ── /llms.txt and /llms-full.txt ─────────────────────────────────────────── */

const entry = (item: PublicPage) => `${link(item.title, item.url)}${item.note ? `: ${text(item.note)}` : ""}`;

/** The llms.txt format: a name, a summary, some notes, then lists of links. */
export function llmsTxt(): string {
  const pages = publicPages();
  const group = (name: PublicPage["group"]) => list(pages.filter((item) => item.group === name).map(entry));
  const data = (path: string, name: string, note: string) => `${link(name, absoluteUrl(path))}: ${note}`;

  return `${join(
    heading(1, site.name),
    `> ${text(site.description)}`,
    para(about.body[1]),
    para(contactIntro.lead),
    para(
      "Every page below has a Markdown copy: add .md to its URL, and use /index.md for the homepage. A request for a page with Accept: text/markdown gets the same copy.",
    ),
    heading(2, "Main pages"),
    group("main"),
    heading(2, "Services"),
    group("service"),
    heading(2, labels.guides),
    group("guide"),
    heading(2, "Data"),
    list([
      data("/data/company.json", "Company facts", "JSON. The office, contact details, certificates, team, clients and process."),
      data("/data/services.json", "Services", "JSON. The text, questions and links of every service page."),
      data("/data/case-studies.json", "Case studies", "JSON. The brief, the build and the outcome of each."),
      data("/data/faqs.json", "Questions and answers", "JSON. Every question set on the site, by topic."),
      data("/openapi.json", "API description", "OpenAPI 3.1, for the data files above and the enquiry route."),
      data("/.well-known/api-catalog", "API catalog", "RFC 9727, pointing at the API description."),
    ]),
    heading(2, "Contact"),
    list([
      `${link("Contact Us", absoluteUrl("/contact-us"))}: ${text(contactPage.lead)}`,
      link(site.email, `mailto:${site.email}`),
      `${link(office.phoneDisplay, `tel:${office.phoneTel}`)}: Calls and WhatsApp.`,
      `${link("WhatsApp", waLink(site.whatsapp, site.name))}: Start a chat.`,
      `${link("Office", officeMapUrl)}: ${text(officeAddress)}`,
      `${link("Send an enquiry", absoluteUrl("/openapi.json"))}: POST ${absoluteUrl("/api/leads")} with a name, email and service, when the person you act for has asked you to.`,
    ]),
    heading(2, "Optional"),
    list([
      `${link("Full text", absoluteUrl("/llms-full.txt"))}: The text of every page on this list, in one file.`,
      ...pages.filter((item) => item.group === "policy").map(entry),
    ]),
  )}\n`;
}

/** The text of every public page, one after another. */
export function llmsFullTxt(): string {
  const intro = join(
    heading(1, `${site.name}: the text of every page`),
    `> ${text(site.description)}`,
    para(`A map of the site is at ${absoluteUrl("/llms.txt")}. Each page below opens with its own address.`),
  );
  const pages = publicPaths().flatMap((path) => markdownFor(path)?.trimEnd() ?? []);
  return `${[intro, ...pages].join("\n\n---\n\n")}\n`;
}
