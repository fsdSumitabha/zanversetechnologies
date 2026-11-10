import { COMPANY_DATA_UPDATED } from "@/constants/freshness";
import { serviceOptions, site } from "@/constants/zan";
import { absoluteUrl } from "@/lib/metadata";
import { PUBLIC_HEADERS } from "@/lib/siteData";

/* ───────────────────────────────────────────────────────────────────────────
   OPENAPI 3.1: what an agent can call here

   The enquiry route (app/api/leads/route.ts) and the four public data files
   (app/data, built by lib/siteData.ts). Keep the fields in step with those two.
   The enquiry's limits are not spelled out on purpose: a 429 with Retry-After is
   all a caller needs, and the numbers would only tell someone how much it takes.

   The forms' trap field is not listed either. A real caller never fills it.
   ─────────────────────────────────────────────────────────────────────────── */

const string = { type: "string" };
const url = { type: "string", format: "uri" };
const date = { type: "string", format: "date" };
const strings = { type: "array", items: string };
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string) => ({ type: "array", items: ref(name) });

/** `plain`: a form post gets the same refusal as plain text. */
const errorResponse = (description: string, plain = false) => ({
  description,
  content: {
    "application/json": { schema: ref("Error") },
    ...(plain ? { "text/plain": { schema: { type: "string" } } } : {}),
  },
});

const jsonFile = (operationId: string, summary: string, schema: string) => ({
  get: {
    operationId,
    summary,
    security: [],
    responses: {
      "200": { description: summary, content: { "application/json": { schema: ref(schema) } } },
    },
  },
});

const spec = {
  openapi: "3.1.0",
  info: {
    title: `${site.name} public API`,
    // The day the Company schema last changed, which is also company.json's.
    version: COMPANY_DATA_UPDATED,
    description:
      "Public, read-only facts about the company, and one route for sending it an enquiry. There is no login. The data files are the same text the site's pages show.",
    contact: { name: site.name, url: site.url, email: site.email },
  },
  servers: [{ url: site.url }],
  externalDocs: { description: "A map of the site for AI tools", url: absoluteUrl("/llms.txt") },
  paths: {
    "/api/leads": {
      post: {
        operationId: "sendEnquiry",
        summary: "Send an enquiry to the company",
        description:
          "The same route the site's enquiry forms use: the company receives the enquiry by email, and the address given gets a confirmation. Send it only when the person you act for has asked you to. Another site's page cannot call this from a browser: the route gives no CORS permission.",
        security: [],
        requestBody: {
          required: true,
          description: "A body with any other content type, or none, is read as JSON.",
          content: {
            "application/json": { schema: ref("Enquiry") },
            "application/x-www-form-urlencoded": { schema: ref("Enquiry") },
            "multipart/form-data": { schema: ref("Enquiry") },
          },
        },
        responses: {
          "200": {
            description: "JSON request: the enquiry has been sent.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["sent"],
                  properties: { sent: { type: "boolean", const: true } },
                },
              },
            },
          },
          "303": {
            description:
              "Form post: sent, to /thank-you. Fields that did not validate, back to the page it came from, or to /contact-us, with ?form=invalid.",
            headers: { Location: { schema: string } },
          },
          "400": errorResponse("JSON request: the body or a field did not validate."),
          "403": errorResponse("Sent from another site's page."),
          "429": {
            ...errorResponse("Too many requests. Wait for the time in Retry-After. JSON for a JSON request, plain text for a form post.", true),
            headers: { "Retry-After": { description: "Seconds to wait.", schema: { type: "integer" } } },
          },
          "500": errorResponse("Something went wrong on the server. Nothing can be assumed to have been sent."),
          "502": errorResponse("The enquiry could not be sent. Please try again. JSON for a JSON request, plain text for a form post.", true),
        },
      },
    },
    "/data/company.json": jsonFile("getCompanyFacts", "Who the company is, where it is and how to reach it", "Company"),
    "/data/services.json": jsonFile("listServices", "Every service, with its page's text and questions", "Services"),
    "/data/case-studies.json": jsonFile("listCaseStudies", "The published case studies", "CaseStudies"),
    "/data/faqs.json": jsonFile("listFaqs", "Every question set on the site, by topic", "Faqs"),
  },
  components: {
    schemas: {
      Enquiry: {
        type: "object",
        required: ["name", "email", "service"],
        properties: {
          name: { type: "string", minLength: 1, description: "The person's name. Must not be blank. Cut at 80 characters." },
          email: { type: "string", format: "email", maxLength: 160, description: "Where the reply goes." },
          phone: { type: "string", description: "A phone number, if they gave one. Cut at 32 characters." },
          service: {
            type: "string",
            description: "The service asked about. Use one of the examples where one fits. Cut at 120 characters.",
            examples: serviceOptions.flatMap((group) => group.options),
          },
          interest: { type: "string", description: "The package asked about, if any. Cut at 120 characters." },
          message: { type: "string", description: "What the person wants to build or fix. Cut at 5000 characters." },
          source: {
            type: "string",
            description: "A short label for where this came from, so it can be counted apart. Defaults to \"api\". Cut at 80 characters.",
          },
          page: {
            type: "string",
            description: "The page the enquiry is about. Defaults to the Referer. Cut at 500 characters.",
          },
        },
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: string,
          details: {
            type: "array",
            description: "Which fields did not validate.",
            items: {
              type: "object",
              required: ["field", "message"],
              properties: { field: string, message: string },
            },
          },
        },
      },
      Faq: {
        type: "object",
        required: ["question", "answer"],
        properties: { question: string, answer: string },
      },
      Person: {
        type: "object",
        required: ["name", "role"],
        properties: { name: string, role: string, experience: string, description: string, email: string, linkedin: url },
      },
      TechnologyDomain: {
        type: "object",
        required: ["label", "blurb", "stack"],
        properties: { label: string, blurb: string, stack: strings },
      },
      Company: {
        type: "object",
        required: ["updated", "name", "url", "description", "email", "phone", "whatsapp", "office", "currency", "enquiry"],
        properties: {
          updated: date,
          name: string,
          shortName: string,
          url,
          parentOrganization: {
            type: "object",
            description: "The company this one is part of.",
            required: ["name", "url"],
            properties: { name: string, url },
          },
          googleProfile: { ...url, description: "The company's listing on Google, its knowledge panel." },
          tagline: string,
          description: string,
          email: { type: "string", format: "email" },
          phone: {
            type: "object",
            required: ["tel", "display"],
            properties: { tel: string, display: string },
          },
          whatsapp: { ...url, description: "A wa.me link that opens a chat." },
          office: {
            type: "object",
            required: ["city", "country", "countryCode", "timeZone", "addressLines", "mapUrl"],
            properties: {
              city: string,
              country: string,
              countryCode: string,
              timeZone: string,
              addressLines: strings,
              mapUrl: url,
            },
          },
          currency: {
            type: "object",
            description: "The currency work is invoiced in.",
            required: ["code", "name"],
            properties: { code: string, name: string },
          },
          about: {
            type: "object",
            properties: {
              summary: string,
              howWeWork: string,
              facts: {
                type: "array",
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: { label: string, value: string },
                },
              },
            },
          },
          credentials: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "body", "refLabel", "ref"],
              properties: {
                name: string,
                body: string,
                refLabel: string,
                ref: { type: "string", description: "The certificate number." },
              },
            },
          },
          metrics: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "value", "detail"],
              properties: { label: string, value: string, detail: string },
            },
          },
          team: {
            type: "object",
            required: ["lead", "groups"],
            properties: {
              lead: ref("Person"),
              groups: {
                type: "array",
                items: {
                  type: "object",
                  required: ["label", "blurb", "people"],
                  properties: { label: string, blurb: string, people: arrayOf("Person") },
                },
              },
            },
          },
          clients: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "sector"],
              properties: { name: string, sector: string },
            },
          },
          industries: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "description"],
              properties: { label: string, description: string },
            },
          },
          technology: arrayOf("TechnologyDomain"),
          process: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "description", "deliverables"],
              properties: { title: string, description: string, deliverables: strings },
            },
          },
          reasons: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "tagline", "description"],
              properties: { title: string, tagline: string, description: string },
            },
          },
          enquiry: {
            type: "object",
            required: ["summary", "page", "api", "apiDescription"],
            properties: { summary: string, page: url, api: url, apiDescription: url },
          },
          social: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "href"],
              properties: { label: string, href: url },
            },
          },
          socialOwner: { ...string, description: "Who the accounts in `social` belong to: the parent company." },
        },
      },
      CaseStudy: {
        type: "object",
        required: ["id", "name", "discipline", "industry", "timeline", "challenge", "solution", "results", "techStack"],
        properties: {
          id: string,
          name: string,
          discipline: string,
          industry: string,
          timeline: string,
          challenge: string,
          solution: string,
          results: {
            type: "array",
            description: "The client's outcomes, as published.",
            items: {
              type: "object",
              required: ["metric", "value"],
              properties: { metric: string, value: string },
            },
          },
          techStack: strings,
          service: { ...url, description: "The page of the service this was." },
        },
      },
      CaseStudies: {
        type: "object",
        required: ["updated", "url", "caseStudies"],
        properties: { updated: date, url, caseStudies: arrayOf("CaseStudy") },
      },
      ContentSection: {
        type: "object",
        required: ["heading", "paragraphs"],
        properties: {
          heading: string,
          paragraphs: strings,
          bullets: strings,
          links: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "href"],
              properties: { label: string, href: url },
            },
          },
        },
      },
      Service: {
        type: "object",
        required: ["slug", "url", "markdownUrl", "updated", "title", "practice", "tagline", "description", "h1", "lead"],
        properties: {
          slug: { type: "string", description: "The page's path under /services." },
          url,
          markdownUrl: url,
          updated: date,
          title: string,
          practice: string,
          parent: {
            type: "object",
            required: ["title", "url"],
            properties: { title: string, url },
          },
          tagline: string,
          description: string,
          h1: string,
          lead: string,
          capabilities: strings,
          disciplines: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "tagline", "description", "url"],
              properties: { title: string, tagline: string, description: string, url },
            },
          },
          packages: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "tagline", "description"],
              properties: { title: string, tagline: string, description: string },
            },
          },
          sections: arrayOf("ContentSection"),
          technology: arrayOf("TechnologyDomain"),
          caseStudies: arrayOf("CaseStudy"),
          faqs: arrayOf("Faq"),
          sources: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "href"],
              properties: { label: string, href: url },
            },
          },
          related: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "tagline", "url"],
              properties: { title: string, tagline: string, url },
            },
          },
        },
      },
      Services: {
        type: "object",
        required: ["updated", "services"],
        properties: { updated: date, services: arrayOf("Service") },
      },
      FaqGroup: {
        type: "object",
        required: ["topic", "url", "faqs"],
        properties: { topic: string, url, faqs: arrayOf("Faq") },
      },
      Faqs: {
        type: "object",
        required: ["updated", "groups"],
        properties: { updated: date, groups: arrayOf("FaqGroup") },
      },
    },
  },
};

export const dynamic = "force-static";

export function GET() {
  return Response.json(spec, { headers: PUBLIC_HEADERS });
}
