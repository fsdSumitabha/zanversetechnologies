import "server-only";

import { CONTENT_UPDATED, pageUpdated } from "@/constants/freshness";
import { guides } from "@/constants/guides";
import type { Guide } from "@/constants/guides/types";
import { legalDocuments } from "@/constants/legal";
import { aboutFaqs, howWeWorkFaqs } from "@/constants/pageFaqs";
import {
  aboutPage,
  brandingPackages,
  childrenOf,
  contactPage,
  guidesPage,
  howWeWorkPage,
  labels,
  legalIntro,
  legalSlugs,
  ourTeamPage,
  portfolioPage,
  practiceOf,
  servicePages,
  serviceTechDomains,
  servicesPage,
  siteRoutes,
  type LegalSlug,
  type ServicePage,
} from "@/constants/pages";
import { getServiceContent } from "@/constants/services";
import type { ContentSection } from "@/constants/services/types";
import {
  about,
  clients,
  contactIntro,
  credentials,
  faqs,
  faqsForService,
  industries,
  metrics,
  office,
  processSteps,
  projects,
  servicesFaqs,
  site,
  socialLinks,
  teamGroups,
  teamLead,
  techDomains,
  whyUs,
  type FAQ,
  type Person,
  type Project,
} from "@/constants/zan";
import { waLink } from "@/lib/links";
import { absoluteUrl, markdownUrl } from "@/lib/metadata";

/* ───────────────────────────────────────────────────────────────────────────
   THE SITE'S FACTS, AS PLAIN DATA

   What /data/*.json, /llms.txt, /llms-full.txt and the Markdown copies under /md
   are built from. All of it is read from constants/*, the same source the pages
   render, so none of these can say something the pages do not. A new fact goes
   in the constants and reaches here. It never gets typed into this file.

   SERVER ONLY, which the first line makes a build error to break.
   constants/services and constants/guides hold every page's copy, and a client
   component importing this file would send all of it to the browser. Nothing
   here reads the environment.

   EVERY PAGE PATH COMES FROM ONE PLACE: `siteRoutes` in constants/pages.ts, plus
   the guides, which that file may not import. See `publicPaths`. A page added
   there is in the data, /llms.txt, /llms-full.txt and /md without touching them.
   /agent, /thank-you and /lp/* are not in that registry, so they are in none of
   these.
   ─────────────────────────────────────────────────────────────────────────── */

/** For what a browser-based agent may fetch from another site, and read for an hour. */
export const SHARED_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
} as const;

/**
 * The same, for files that repeat what the pages say, where the pages are the
 * ones meant to rank. Not for the Markdown copies: app/md/[...path]/route.ts.
 */
export const PUBLIC_HEADERS = {
  ...SHARED_HEADERS,
  "X-Robots-Tag": "noindex",
} as const;

const guidePath = (guide: Guide) => `/guides/${guide.slug}`;

/** A path on this site as a full URL. Anything else passes through. */
const fullHref = (href: string) => (href.startsWith("/") ? absoluteUrl(href) : href);

/** The office's address on one line, as the office card prints it. */
export const officeAddress = [...office.addressLines, office.city, office.country].join(", ");

/** A Google Maps search for it, the same one the office card links to. */
export const officeMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`;

/* ── Which pages there are ────────────────────────────────────────────────── */

/** Every public page's path: the registry, then the guides, none of them twice. */
export function publicPaths(): readonly string[] {
  return Array.from(new Set([...siteRoutes.map((route) => route.path), ...guides.map(guidePath)]));
}

export const isLegalSlug = (slug: string): slug is LegalSlug =>
  (legalSlugs as readonly string[]).includes(slug);

export type PageGroup = "main" | "service" | "guide" | "policy";

export interface PublicPage {
  path: string;
  url: string;
  markdownUrl: string;
  /** The name to link it by. */
  title: string;
  /** One line on what is there. */
  note: string;
  group: PageGroup;
}

/** The pages with a name and a line of their own, under the names the breadcrumbs use. */
const STANDING_PAGES: Readonly<Record<string, { title: string; note: string }>> = {
  "/": { title: "Home", note: site.tagline },
  "/services": { title: "Services", note: servicesPage.seoDescription },
  "/portfolio": { title: "Portfolio", note: portfolioPage.seoDescription },
  "/how-we-work": { title: "How We Work", note: howWeWorkPage.seoDescription },
  "/about-us": { title: "About Us", note: aboutPage.seoDescription },
  "/our-team": { title: "Our Team", note: ourTeamPage.seoDescription },
  "/contact-us": { title: "Contact Us", note: contactPage.seoDescription },
};

function describePage(path: string): Pick<PublicPage, "title" | "note" | "group"> {
  const standing = STANDING_PAGES[path];
  if (standing) return { ...standing, group: "main" };

  const service = servicePages.find((page) => page.href === path);
  if (service) {
    const content = getServiceContent(service.priceKey);
    return { title: service.title, note: content?.seoDescription ?? service.seoDescription, group: "service" };
  }

  const guide = guides.find((item) => guidePath(item) === path);
  if (guide) return { title: guide.title, note: guide.summary, group: "guide" };

  const slug = path.slice(1);
  if (isLegalSlug(slug)) return { title: legalDocuments[slug].title, note: legalIntro[slug], group: "policy" };

  if (path === "/guides") {
    return { title: labels.guides, note: guidesPage.seoDescription, group: "guide" };
  }

  // A page new to the registry is still listed, under its address.
  return { title: path, note: "", group: "main" };
}

/** Every public page, with what it takes to link to it. */
export function publicPages(): readonly PublicPage[] {
  return publicPaths().map((path) => ({
    path,
    url: absoluteUrl(path),
    markdownUrl: markdownUrl(path),
    ...describePage(path),
  }));
}

/* ── The people ───────────────────────────────────────────────────────────── */

const personData = ({ name, role, experience, description, email, linkedin }: Person) => ({
  name,
  role,
  experience,
  description,
  email,
  linkedin,
});

export function teamData() {
  return {
    lead: personData(teamLead),
    groups: teamGroups.map((group) => ({
      label: group.label,
      blurb: group.blurb,
      people: group.people.map(personData),
    })),
  };
}

/* ── /data/company.json ───────────────────────────────────────────────────── */

export function companyData() {
  return {
    updated: CONTENT_UPDATED,
    name: site.name,
    shortName: site.shortName,
    url: site.url,
    tagline: site.tagline,
    description: site.description,
    email: site.email,
    phone: { tel: office.phoneTel, display: office.phoneDisplay },
    whatsapp: waLink(site.whatsapp, site.name),
    office: {
      city: office.city,
      country: office.country,
      countryCode: office.countryCode,
      timeZone: office.timeZone,
      addressLines: office.addressLines,
      mapUrl: officeMapUrl,
    },
    currency: { code: site.currency, name: site.currencyName },
    about: { summary: about.body[0], howWeWork: about.body[1], facts: about.principles },
    credentials: credentials.map(({ name, body, refLabel, ref }) => ({ name, body, refLabel, ref })),
    // Not the rating or the on-time figure. The site keeps those out of its
    // markup (lib/schema.ts) until published reviews and records stand behind
    // them, and an agent would pass them on as facts.
    metrics: metrics
      .filter((m) => m.id !== "rating" && m.id !== "on-time")
      .map(({ label, value, detail }) => ({ label, value, detail })),
    team: teamData(),
    clients: clients.map(({ name, sector }) => ({ name, sector })),
    industries: industries.map(({ label, description }) => ({ label, description })),
    technology: techDomains.map(({ label, blurb, stack }) => ({ label, blurb, stack })),
    process: processSteps.map(({ title, description, deliverables }) => ({ title, description, deliverables })),
    reasons: whyUs.items.map(({ title, tagline, description }) => ({ title, tagline, description })),
    enquiry: {
      summary: contactIntro.lead,
      page: absoluteUrl("/contact-us"),
      api: absoluteUrl("/api/leads"),
      apiDescription: absoluteUrl("/openapi.json"),
    },
    social: socialLinks.map(({ label, href }) => ({ label, href })),
  };
}

/* ── /data/case-studies.json ──────────────────────────────────────────────── */

/* Not `screenshot`: those are stock photographs of the sector, not the work. */
function caseStudyData(project: Project) {
  const service = servicePages.find((page) => page.priceKey === project.category);
  return {
    id: project.id,
    name: project.name,
    discipline: project.discipline,
    industry: project.industry,
    timeline: project.timeline,
    challenge: project.challenge,
    solution: project.solution,
    results: project.results.map(({ metric, value }) => ({ metric, value })),
    techStack: project.techStack,
    service: service ? absoluteUrl(service.href) : undefined,
  };
}

export type CaseStudyData = ReturnType<typeof caseStudyData>;

export function caseStudiesData() {
  return {
    updated: pageUpdated("/portfolio"),
    url: absoluteUrl("/portfolio"),
    caseStudies: projects.map(caseStudyData),
  };
}

/* ── /data/services.json ──────────────────────────────────────────────────── */

const sectionData = ({ heading, paragraphs, bullets, links }: ContentSection) => ({
  heading,
  paragraphs,
  bullets,
  links: links?.map(({ label, href }) => ({ label, href: fullHref(href) })),
});

/** The questions a service page shows: its own set, then the ones from its copy. */
const serviceFaqs = (page: ServicePage): readonly FAQ[] => [
  ...(faqsForService[page.priceKey] ?? []),
  ...(getServiceContent(page.priceKey)?.faqs ?? []),
];

/** One service page's text, in the order the page runs it. */
function serviceData(page: ServicePage) {
  const content = getServiceContent(page.priceKey);
  const parent = page.parent ? servicePages.find((other) => other.slug === page.parent) : undefined;
  return {
    slug: page.slug,
    url: absoluteUrl(page.href),
    markdownUrl: markdownUrl(page.href),
    updated: pageUpdated(page.href),
    title: page.title,
    practice: page.practiceTitle,
    parent: parent ? { title: parent.title, url: absoluteUrl(parent.href) } : undefined,
    tagline: page.tagline,
    description: page.description,
    h1: content?.h1 ?? page.title,
    lead: content?.lead ?? page.description,
    capabilities: page.capabilities ?? [],
    disciplines: childrenOf(page.slug).map((child) => ({
      title: child.title,
      tagline: child.tagline,
      description: child.description,
      url: absoluteUrl(child.href),
    })),
    packages:
      page.slug === "branding-and-designing"
        ? brandingPackages.map(({ title, tagline, description }) => ({ title, tagline, description }))
        : [],
    sections: (content?.sections ?? []).map(sectionData),
    technology: (serviceTechDomains[page.priceKey] ?? []).flatMap((id) =>
      techDomains
        .filter((domain) => domain.id === id)
        .map(({ label, blurb, stack }) => ({ label, blurb, stack })),
    ),
    caseStudies: projects.filter((project) => project.category === page.priceKey).map(caseStudyData),
    faqs: serviceFaqs(page),
    sources: content?.sources ?? [],
    related: (practiceOf(page)?.items ?? [])
      .filter((item) => item.href !== page.href)
      .slice(0, 3)
      .map((item) => ({ title: item.title, tagline: item.tagline, url: absoluteUrl(item.href) })),
  };
}

export type ServiceData = ReturnType<typeof serviceData>;

export const serviceDataFor = (page: ServicePage): ServiceData => serviceData(page);

export function servicesData() {
  return {
    updated: CONTENT_UPDATED,
    services: servicePages.map(serviceData),
  };
}

/* ── /data/faqs.json ──────────────────────────────────────────────────────── */

export function faqsData() {
  const sets: { topic: string; path: string; faqs: readonly FAQ[] }[] = [
    { topic: "General", path: "/", faqs },
    { topic: "IT services", path: "/services", faqs: servicesFaqs },
    { topic: "About the company", path: "/about-us", faqs: aboutFaqs },
    { topic: "How we work", path: "/how-we-work", faqs: howWeWorkFaqs },
    ...servicePages.map((page) => ({ topic: page.title, path: page.href, faqs: serviceFaqs(page) })),
    ...guides.map((guide) => ({ topic: guide.title, path: guidePath(guide), faqs: guide.faqs })),
  ];
  return {
    updated: CONTENT_UPDATED,
    groups: sets
      .filter((set) => set.faqs.length > 0)
      .map(({ topic, path, faqs: items }) => ({ topic, url: absoluteUrl(path), faqs: items })),
  };
}

/* ── The guides, for the Markdown copies ──────────────────────────────────── */

export function guidesData() {
  return guides.map((guide) => ({
    path: guidePath(guide),
    url: absoluteUrl(guidePath(guide)),
    title: guide.title,
    lead: guide.lead,
    summary: guide.summary,
    published: guide.published,
    updated: guide.updated,
    sections: guide.sections.map(sectionData),
    faqs: guide.faqs,
    sources: guide.sources,
    services: guide.services.map(({ label, href }) => ({ label, href: fullHref(href) })),
  }));
}

export type GuideData = ReturnType<typeof guidesData>[number];
