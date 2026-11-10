import { site } from "@/constants/zan";

/* RFC 9116: where to report a security problem. Nothing in it but the published
   address. The RFC wants the date no more than a year out and scanners flag a
   file past it, so move EXPIRES before 5 November 2027. */
const EXPIRES = "2027-11-05T00:00:00.000Z";

const body = [
  `Contact: mailto:${site.email}`,
  `Expires: ${EXPIRES}`,
  "Preferred-Languages: en",
  `Canonical: ${site.url}/.well-known/security.txt`,
].join("\n");

export const dynamic = "force-static";

export function GET() {
  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
