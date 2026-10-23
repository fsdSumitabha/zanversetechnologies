import type { ServicePage } from "@/constants/pages";
import type { FAQ } from "@/constants/zan";
import { everyone, office, processSteps, practices, site, socialLinks } from "@/constants/zan";
import { absoluteUrl, OG_IMAGE } from "@/lib/metadata";

/* ═══════════════════════════════════════════════════════════════════════════
   STRUCTURED DATA

   Built from the same facts in constants/zan.ts that the page renders, so the
   markup can never drift from the visible content — the failure mode Google
   penalises hardest.

   Two nodes are sitewide and attached once, in app/(site)/layout.tsx:

     Organization + ProfessionalService   who the company is
     WebSite                              what this site is

   The rest is per page: Service on the sixteen service pages, HowTo on
   /how-we-work, FAQPage wherever a page renders a question set of its own,
   BreadcrumbList wherever a trail is rendered
   (components/zan/page/Breadcrumbs.tsx).

   Every URL in here is built with `absoluteUrl` (lib/metadata.ts), the same
   helper the canonicals and the sitemap use, so the three can never name the
   same page two different ways.

   NOT PORTED from the previous site's index.html, deliberately:

     aggregateRating 4.9 / 120 reviews — there are no 120 published reviews
       behind it. Unsubstantiated review markup is a manual-action risk, and
       Google has been removing self-serve AggregateRating from rich results
       for service pages regardless.
     WebSite SearchAction — this site has no search endpoint to point it at.
       Declaring one that 404s is worse than declaring none.
   ═══════════════════════════════════════════════════════════════════════════ */

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

/** The Dubai office, as schema.org writes an address. */
const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: office.addressLines.join(", "),
  addressLocality: office.city,
  addressCountry: office.countryCode,
} as const;

/** The one market the company sells into. */
const areaServed = { "@type": "Country", name: office.country } as const;

/** Every discipline the company sells, flattened out of the three practices. */
const everyService = practices.flatMap((p) => p.items);

/**
 * The company: one node, one @id, attached to every page by the layout, so a
 * crawler that lands on any URL of the site gets the same identity with it.
 *
 * Everything in it is something the site already says in its own copy: the
 * Dubai office's address and number, the inbox, the services, the people.
 *
 * LEFT OUT until someone confirms them: opening hours, a founding date, map
 * coordinates and a registration number. None of them is published anywhere
 * on the site, and a node that states a fact the pages do not is the drift
 * this file exists to prevent. Each one is a line here the day it is known.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    logo: `${site.url}${site.logo.src}`,
    image: `${site.url}${OG_IMAGE}`,
    description: site.description,
    email: site.email,
    telephone: office.phoneTel,
    address: postalAddress,
    location: {
      "@type": "Place",
      name: `${site.name}, ${office.city}`,
      address: postalAddress,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: office.phoneTel,
      email: site.email,
      contactType: "customer service",
      areaServed: office.countryCode,
      availableLanguage: ["en"],
    },
    areaServed,
    knowsAbout: everyService.map((s) => s.title),
    /* The named colleagues /our-team and the homepage's rail render, the
       director first. Name and job title for everyone; `email` and `sameAs`
       only for the people who actually have one on file, because a Person
       carrying an invented address or profile URL is the exact drift this file
       exists to prevent. Like the address and the services, who works here is
       a fact about the company rather than about one URL, so it rides along on
       every page with the rest of the node.

       NOT `founder`, and not `employee` + a second officer property for Nadim
       Ali. What we have is the job title "Director" and nothing else. A
       director is an officer of the company, appointed to the role, and a
       company can have several; it is not the same claim as having started
       it, so `founder` would assert something about the company's history
       that nobody has told us. `employee` with the title he was given says
       exactly what we know, and the day someone confirms more, this is one
       line.

       No `@id` on any of them either: none of the six has a page of their own,
       and /our-team is the company's page about its people rather than a
       profile URL per person. */
    employee: everyone.map((person) => ({
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
      ...(person.email ? { email: person.email } : {}),
      ...(person.linkedin ? { sameAs: person.linkedin } : {}),
    })),
    sameAs: socialLinks.map((l) => l.href),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: site.url,
    name: site.name,
    inLanguage: site.lang,
    publisher: { "@id": ORG_ID },
  };
}

/**
 * One `Service` node per service page. This is what makes a service page
 * eligible in its own right rather than only as part of the homepage —
 * without it the sixteen would carry a BreadcrumbList and nothing else.
 *
 * No OfferCatalog. The site publishes no figures, and an `Offer` with no
 * price attached is a claim about what is for sale that the page itself does
 * not make.
 */
export function serviceSchema(page: ServicePage) {
  const url = absoluteUrl(page.href);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: page.title,
    serviceType: page.title,
    description: page.description,
    url,
    provider: { "@id": ORG_ID },
    areaServed,
  };
}

/** The four-step engagement, for /how-we-work. */
export function howToSchema() {
  const url = absoluteUrl("/how-we-work");
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: `How a project runs at ${site.name}`,
    description:
      "Four steps from first call to launch: discovery and strategy, design and prototype, development and testing, then launch and support.",
    url,
    step: processSteps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
      url: `${url}#${s.id}`,
      ...(s.deliverables.length
        ? {
            itemListElement: s.deliverables.map((d) => ({
              "@type": "HowToDirection",
              text: d,
            })),
          }
        : {}),
    })),
  };
}

/**
 * FAQPage for a set of questions.
 *
 * Emitted wherever a page renders a question set OF ITS OWN: the homepage
 * (`faqs`), /services (`servicesFaqs`), and the three service pages that carry
 * their own set (`faqsForService` — web development, mobile apps, digital
 * marketing).
 *
 * WITHHELD on /contact-us, which renders the homepage's list outright. Two
 * URLs carrying byte-identical Q&A pairs give Google one node to keep and one
 * to discard, and the homepage — the URL that should rank for them — is not
 * reliably the one it keeps. The accordion still renders; only the markup is
 * withheld.
 *
 * `items` is required rather than defaulting to the homepage's set, so a page
 * can only ever mark up the questions it was handed: each caller passes the
 * same array to its accordion and to this, and the two cannot disagree.
 */
export function faqSchema(items: readonly FAQ[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** One or more nodes, serialised for a single <script type="application/ld+json">. */
export function jsonLd(...nodes: (object | null | undefined)[]): string {
  const graph = nodes.filter(Boolean);
  const payload = graph.length === 1 ? graph[0] : graph;
  // `</script>` inside a string literal would close the tag early.
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
