import { absoluteUrl } from "@/lib/metadata";
import { PUBLIC_HEADERS } from "@/lib/siteData";

/* ───────────────────────────────────────────────────────────────────────────
   RFC 9727: the list of this site's APIs, as a linkset

   Two kinds of entry, both from the RFC's appendix. The first lists every
   endpoint under the catalog's own address. The others say, per endpoint, where
   its machine-readable description is (/openapi.json) and what to read about it
   (/llms.txt). A HEAD here has to carry the Link header too, and Next answers
   HEAD from this GET.

   There is one API description because there is only this: the enquiry route and
   four public data files. No MCP server, OAuth or checkout exists to list.
   ─────────────────────────────────────────────────────────────────────────── */

const ENDPOINTS = [
  { path: "/api/leads", title: "Send an enquiry" },
  { path: "/data/company.json", title: "Company facts" },
  { path: "/data/services.json", title: "Services" },
  { path: "/data/case-studies.json", title: "Case studies" },
  { path: "/data/faqs.json", title: "Questions and answers" },
] as const;

const OPENAPI = [{ href: absoluteUrl("/openapi.json"), type: "application/json" }];
const DOCS = [{ href: absoluteUrl("/llms.txt"), type: "text/plain" }];

const catalog = {
  linkset: [
    {
      anchor: absoluteUrl("/.well-known/api-catalog"),
      item: ENDPOINTS.map(({ path, title }) => ({ href: absoluteUrl(path), title })),
    },
    ...ENDPOINTS.map(({ path }) => ({
      anchor: absoluteUrl(path),
      "service-desc": OPENAPI,
      "service-doc": DOCS,
    })),
  ],
};

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(catalog), {
    headers: {
      ...PUBLIC_HEADERS,
      "Content-Type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      Link: '</.well-known/api-catalog>; rel="api-catalog"',
    },
  });
}
