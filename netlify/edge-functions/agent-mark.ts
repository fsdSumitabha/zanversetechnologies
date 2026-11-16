/* ───────────────────────────────────────────────────────────────────────────
   A SIGNED AGENT GETS THE STILL PAGE

   An agent that signs its requests with Web Bot Auth sends a Signature-Agent
   header: ChatGPT agent sends "https://chatgpt.com". Its browser looks like a
   person's otherwise, so the page's own check (lib/agentMode.ts) cannot tell.
   For such a request this writes <html data-agent="signed"> into the page, and
   the page then behaves as it does for any agent: no cover, no timed popup, no
   pinned scenes, every section shown at rest.

   The `header` condition below means this function does not run at all
   without that header. A person's browser never sends it, so a person's
   request never reaches this code and their page is the cached one, untouched.
   The signature itself is not checked: a client that fakes the header only
   gets the simpler page.

   Plain Web API types and no import of @netlify/edge-functions, which is not a
   dependency, because tsc reads this folder too. It cannot run locally under
   `next dev` or `next start`: check it after a deploy.
   ─────────────────────────────────────────────────────────────────────────── */

/** The part of Netlify's context this uses. */
type Context = { next(): Promise<Response> };

/** The <html> start tag, once, before its first attribute or its end. */
const HTML_TAG = /<html(?=[\s>])/i;

export default async function agentMark(_request: Request, context: Context): Promise<Response> {
  const response = await context.next();
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;

  const page = await response.text();
  if (!HTML_TAG.test(page)) return new Response(page, response);

  // A different body: its length and its validator no longer describe it.
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");
  return new Response(page.replace(HTML_TAG, '<html data-agent="signed"'), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  path: "/*",
  /* Everything that is not a page: files ("/*.*" is any URL with a dot in it),
     the API, data, the Markdown copies, share cards, images, the /ae redirect
     and the staff console. */
  excludedPath: [
    "/_next/*",
    "/api/*",
    "/data/*",
    "/md/*",
    "/og/*",
    "/images/*",
    "/ae",
    "/ae/*",
    "/agent",
    "/agent/*",
    "/*.*",
  ],
  /* Runs only when the request has this header. NO `method`: see the note in
     markdown-negotiation.ts. */
  header: { "signature-agent": true },
};
