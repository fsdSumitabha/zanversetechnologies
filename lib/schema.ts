import { pageUpdated } from "@/constants/freshness";
import type { ServicePage } from "@/constants/pages";
import { reviewerFor, teamCardPath } from "@/constants/reviewers";
import type { FAQ, Person } from "@/constants/zan";
import {
  credentials,
  ctas,
  everyone,
  googleProfile,
  office,
  parentCompany,
  processSteps,
  practices,
  site,
  socialLinks,
} from "@/constants/zan";
import { absoluteUrl, OG_IMAGE, shareImage } from "@/lib/metadata";

/* ═══════════════════════════════════════════════════════════════════════════
   STRUCTURED DATA

   Built from the same facts in constants/zan.ts that the page renders, so the
   markup can never drift from the visible content — the failure mode Google
   penalises hardest.

   Two nodes are sitewide and attached once, in app/(site)/layout.tsx:

     Organization + ProfessionalService   who the company is
     WebSite                              what this site is

   The rest is per page: WebPage, saying what kind of page it is and when it
   last changed; Service on the sixteen service pages, Article on the guides,
   HowTo on /how-we-work, FAQPage wherever a page renders a question set of its
   own, BreadcrumbList wherever a trail is rendered
   (components/zan/page/Breadcrumbs.tsx).

   Every URL in here is built with `absoluteUrl` (lib/metadata.ts), the same
   helper the canonicals and the sitemap use, so the three can never name the
   same page two different ways. Every date comes from constants/freshness.ts or
   from the guide it describes, so the markup, the sitemap and the "Last updated"
   line can never disagree.

   NOT PORTED from the previous site's index.html, deliberately:

     aggregateRating 4.9 / 120 reviews — the owner confirmed the 4.9 on
       10 Nov 2026, and it is published in the page text and the data files
       (`metrics` in constants/zan.ts). It stays out of the markup for two
       reasons that have nothing to do with whether it is true. Google does
       not show review snippets for self-serving reviews, and a company's
       rating of itself, on its own Organization or LocalBusiness node, is
       exactly that. And there are no published third-party reviews to mark
       up: an AggregateRating has to total reviews a reader can find, and the
       old "120" had none behind it. Review markup that cannot be checked is a
       manual-action risk with no rich result to win.
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
  // The emirate, which has the city's name.
  addressRegion: office.city,
  addressCountry: office.countryCode,
} as const;

/** The one market the company sells into. */
const areaServed = { "@type": "Country", name: office.country } as const;

/**
 * The Google Maps search the office card's Directions row opens, for the
 * address as the card prints it (components/zan/contact/OfficeCard.tsx). A
 * search rather than a pin, because no coordinates have been confirmed.
 */
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  [...office.addressLines, office.city, office.country].join(", "),
)}`;

/** Every discipline the company sells, flattened out of the three practices. */
const everyService = practices.flatMap((p) => p.items);

/**
 * The company: one node, one @id, attached to every page by the layout, so a
 * crawler that lands on any URL of the site gets the same identity with it.
 *
 * Everything in it is something the site already says in its own copy: the
 * Dubai office's address and number, the inbox, the services, the people, the
 * two ISO certificates, and the parent company, which /about-us names in its
 * questions. The exception is `sameAs`, the company's listing on Google, which
 * no page prints: it is a pointer for machines rather than copy.
 *
 * LEFT OUT until the Google Business Profile is ready (it was not on
 * 10 Nov 2026): opening hours, a postal code, map coordinates, a founding
 * date, a headcount and a licence number. None of them is published anywhere
 * on the site, and Google blocks scripts from reading the listing, so a node
 * that stated them would be guessing, which is the drift this file exists to
 * prevent. Each one is a line here the day it is known.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    // The PNG, not the SVG: not every reader of structured data takes a vector.
    logo: `${site.url}${site.logo.png}`,
    image: `${site.url}${OG_IMAGE}`,
    description: site.description,
    email: site.email,
    telephone: office.phoneTel,
    address: postalAddress,
    hasMap: mapUrl,
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
    /* How to reach the company, for a machine: the page with the enquiry form. */
    potentialAction: {
      "@type": "CommunicateAction",
      name: ctas.contact.label,
      target: absoluteUrl(ctas.contact.href),
    },
    /* The two certificates /about-us prints, with the numbers it prints. No
       issuing body, because the site names none. */
    hasCredential: credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.name,
      description: c.body,
      credentialCategory: "certificate",
      identifier: c.ref,
      url: `${absoluteUrl("/about-us")}#credentials`,
    })),
    areaServed,
    knowsAbout: everyService.map((s) => s.title),
    /* The named colleagues /our-team renders, the director first. Name, job
       title, `url` and `worksFor` for everyone. `url` is the person's own card:
       every card on /our-team carries the person's `id` as its anchor
       (components/zan/team/TeamPageCard.tsx), so /our-team#sumitabha opens on
       Sumitabha's card. `worksFor` repeats what sitting under `employee`
       already says, so that a Person node read on its own still names the
       company. `description` (the approved line), `image` (the headshot),
       `email` and `sameAs` only for the people who actually have one on file,
       because a Person carrying an invented address or profile URL is the
       exact drift this file exists to prevent. Like the address and the
       services, who works here is a fact about the company rather than about
       one URL, so it rides along on every page with the rest of the node.

       NOT `founder`, and not `employee` + a second officer property for Nadim
       Ali. What we have is the job title "Director" and the line written from
       it, and nothing else. A director is an officer of the company, appointed
       to the role, and a company can have several; it is not the same claim as
       having started it, so `founder` would assert something about the
       company's history that nobody has told us. `employee` with the title he
       was given says exactly what we know, and the day someone confirms more,
       this is one line.

       No `@id` on any of them: nothing else in the graph points at a person.
       A card's anchor is where the person is described, and `url` says so,
       which is all a reader of this node needs. */
    employee: everyone.map((person) => ({
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
      url: `${absoluteUrl("/our-team")}#${person.id}`,
      worksFor: { "@id": ORG_ID },
      ...(person.description ? { description: person.description } : {}),
      ...(person.portrait ? { image: absoluteUrl(person.portrait) } : {}),
      ...(person.email ? { email: person.email } : {}),
      ...(person.linkedin ? { sameAs: person.linkedin } : {}),
    })),
    /* Zan Services, the company Zan Verse Technologies is part of (confirmed
       by the owner on 10 Nov 2026): its own site, and the LinkedIn, Instagram
       and X accounts the footer links to, which are Zan Services' accounts.
       No `@id`: the node is the other site's to identify, and one invented
       here would claim to name it. */
    parentOrganization: {
      "@type": "Organization",
      name: parentCompany.name,
      url: parentCompany.url,
      sameAs: socialLinks.map((l) => l.href),
    },
    /* `sameAs` means "the same entity, elsewhere", so it is the company's own
       listing on Google (its knowledge panel), and nothing else. Not the
       three accounts in the footer: they are the parent's, and listing them
       here would say Zan Verse Technologies and Zan Services are one company.
       They sit under `parentOrganization` instead. */
    sameAs: [googleProfile],
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
 * The @id of a page's BreadcrumbList (components/zan/page/Breadcrumbs.tsx), which
 * its WebPage node points to. Every page that calls webPageSchema renders a
 * trail, apart from the homepage.
 */
export const breadcrumbId = (path: string) => `${absoluteUrl(path)}#breadcrumb`;

/**
 * The colleague a page names at its foot (constants/reviewers.ts), as its
 * structured data names them: the `reviewedBy` of its WebPage, a guide's
 * included. Name, job title, the address of their card on /our-team
 * and, where they have one, their LinkedIn profile as `sameAs`. The card and
 * the profile are what let a reader, Google included, tell this person from
 * another of the same name. The same name, title and address as their node in
 * the Organization's `employee` list, and like that node no `@id`, so a reader
 * matches the two by `url`.
 */
function personNode(person: Person) {
  return {
    "@type": "Person",
    name: person.name,
    jobTitle: person.role,
    url: absoluteUrl(teamCardPath(person)),
    ...(person.linkedin ? { sameAs: person.linkedin } : {}),
  };
}

/**
 * What one page is, when it last changed and who reviews it, tied to the two
 * sitewide nodes by their @id. `dateModified` falls back to the page's entry in
 * constants/freshness.ts.
 *
 * The company stays the author and the publisher: these pages carry no byline.
 * What their foot does carry is a reviewer, the colleague the owner chose for
 * the page in constants/reviewers.ts, and that person is `reviewedBy` here,
 * with `lastReviewed` the same date as `dateModified`, because the foot gives
 * one date for both: "Last updated 5 November 2026. Reviewed by Nadim Ali,
 * Director." A page with no reviewer there, such as the homepage or a policy,
 * gets neither property.
 *
 * `type: "FAQPage"` is for a page with no faqSchema node of its own. Google's
 * rich results check rejects two FAQPage nodes on one URL.
 */
export function webPageSchema({
  path,
  name,
  description,
  type = "WebPage",
  dateModified,
}: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  dateModified?: string;
}) {
  const url = absoluteUrl(path);
  const modified = dateModified ?? pageUpdated(path);
  const reviewer = reviewerFor(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    // The slash the two sitewide @ids have, which the homepage's bare URL does not.
    "@id": `${path === "/" ? `${site.url}/` : url}#webpage`,
    url,
    name,
    description,
    inLanguage: site.lang,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    dateModified: modified,
    ...(reviewer ? { reviewedBy: personNode(reviewer), lastReviewed: modified } : {}),
    ...(path === "/" ? {} : { breadcrumb: { "@id": breadcrumbId(path) } }),
  };
}

/**
 * One `Service` node per service page. This is what makes a service page
 * eligible in its own right rather than only as part of the homepage —
 * without it the sixteen would carry a BreadcrumbList and nothing else.
 *
 * `opts` carries the page's own h1 and lead where its copy has them, so the
 * markup says what the page says. Without them it falls back to the service's
 * short name and description.
 *
 * No OfferCatalog. The site publishes no figures, and an `Offer` with no
 * price attached is a claim about what is for sale that the page itself does
 * not make.
 */
export function serviceSchema(page: ServicePage, opts: { name?: string; description?: string } = {}) {
  const url = absoluteUrl(page.href);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: opts.name ?? page.title,
    serviceType: page.title,
    description: opts.description ?? page.description,
    url,
    provider: { "@id": ORG_ID },
    areaServed,
  };
}

/**
 * One `Article` node per guide. Its image is the guide's share card, and
 * `citations` are the outside sources the guide lists.
 *
 * The company is the author and the publisher, its name riding along with the
 * @id, because the Organization node it points at sits in another script
 * block. The guide's foot says "Reviewed by <name>", not "by <name>", so the
 * colleague the owner chose for it in constants/reviewers.ts is the
 * `reviewedBy` of the page the Article belongs to, as a full Person node
 * (`personNode`), with the guide's `updated` as `lastReviewed`, as every other
 * dated page does. Markup has to say what the page says, and nobody has said
 * these colleagues wrote the guides. If one did, make them the author here and
 * have the foot say "Written and reviewed by".
 */
export function articleSchema({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  citations,
}: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  citations?: readonly string[];
}) {
  const url = absoluteUrl(path);
  const company = { "@type": "Organization", "@id": ORG_ID, name: site.name } as const;
  const reviewer = reviewerFor(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    // The page itself, so that its trail (components/zan/page/Breadcrumbs.tsx)
    // hangs off it, and its reviewer: Article has neither property of its own.
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      breadcrumb: { "@id": breadcrumbId(path) },
      ...(reviewer ? { reviewedBy: personNode(reviewer), lastReviewed: dateModified } : {}),
    },
    url,
    headline,
    description,
    image: absoluteUrl(shareImage(path)),
    inLanguage: site.lang,
    datePublished,
    dateModified,
    author: company,
    publisher: company,
    isPartOf: { "@id": SITE_ID },
    ...(citations?.length ? { citation: [...citations] } : {}),
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
 * (`faqs`), /services (`servicesFaqs`), the service pages (`faqsForService` and
 * the page's own copy), /about-us, /how-we-work and the guides.
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
