import { trackFormSubmission, trackGenerateLead } from "@/lib/analytics";
import { EMAIL_PATTERN, leadsReady } from "@/lib/leads";
// Types only, and erased at build, so nothing of that server-only file reaches the browser.
import type { caseStudiesData, companyData, faqsData, servicesData } from "@/lib/siteData";

/* ───────────────────────────────────────────────────────────────────────────
   THE WEBMCP TOOLS

   What an agent in the browser can call on this site: five tools that read, and
   one that sends an enquiry. WebMcpTools.tsx loads this file only in a browser
   that has WebMCP, so nobody else downloads it.

   Written to the Community Group draft of 2 November 2026
   (https://webmachinelearning.github.io/webmcp/). It is a draft and may change.
   Four things it says shape this file:

     A rejected execute() tells the agent nothing. The browser reports a bare
     OperationError and drops the reason. So no tool here rejects: a bad input or a
     failed read comes back as { error }, which the agent can read and correct.

     The browser does not check the input against inputSchema. checkInput does, from
     the same object the agent is shown, so the two cannot disagree.

     registerTool() returns a promise. It rejects on a name already in use, on a
     permissions policy that says no, and on an abort before it settles, so every
     one of those promises is handled.

     toolactivated fires at the ModelContext. Chrome's documentation says
     window.ontoolactivated is not supported from Chrome 156, and the origin trial
     starts at 149, so this listens at both.

   WHAT THE TOOLS TOUCH. Only /data/*.json, which are public copies of constants/,
   POST /api/leads, and after a sent enquiry the page's dataLayer, as a form's send
   does (lib/analytics.ts). Nothing here reads the page's content, its forms,
   cookies, localStorage or the staff console, and requests go with credentials
   "omit", so no cookie goes along. All it takes from the page is the address: the
   path goes with an enquiry and with its conversion. No tool returns text a visitor
   wrote, so none of them sets untrustedContentHint. A tool that ever does must set it.

   SMALL ANSWERS. Chrome's guide (developer.chrome.com/docs/ai/webmcp/secure-tools)
   recommends at most 1.5K characters for a tool's output, 500 for a description,
   150 for a parameter's description and 30 for a name, to stay clear of agents'
   guardrails. So the tools answer with a summary and the address of the full text,
   not the whole data file, which for the services is over 150K.

   No outputSchema: it is optional, an answer is either the result or { error }, and
   the spec lets an agent reject an output that does not match.
   ─────────────────────────────────────────────────────────────────────────── */

/* ── The browser's side, from the spec ────────────────────────────────────── */

export interface ModelContext extends EventTarget {
  /** A promise in the spec. The older API on navigator may return nothing. */
  registerTool(tool: ModelContextTool, options: { signal: AbortSignal }): Promise<void> | void;
}

interface ModelContextTool extends Omit<Tool, "run"> {
  /** The older API may pass something else second, with no signal on it. */
  execute(input: unknown, options?: { signal?: AbortSignal }): Promise<unknown>;
}

/* ── The input, checked ───────────────────────────────────────────────────── */

interface TextField {
  type: "string";
  description: string;
  minLength?: number;
  maxLength: number;
  pattern?: string;
}

interface InputSchema {
  type: "object";
  properties: Readonly<Record<string, TextField>>;
  required: readonly string[];
  additionalProperties: false;
}

const inputs = (properties: InputSchema["properties"] = {}, required: readonly string[] = []): InputSchema => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

/** The fields a tool was given, trimmed. An optional one left empty is not here. */
type Values = Readonly<Record<string, string | undefined>>;

/** The values, or a sentence saying what to correct. It quotes nothing it was given. */
function checkInput({ properties, required }: InputSchema, input: unknown): Values | string {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return "The input must be an object.";
  const given = input as Readonly<Record<string, unknown>>;

  const names = Object.keys(properties);
  if (Object.keys(given).some((key) => !names.includes(key))) {
    return names.length ? `The only fields are: ${names.join(", ")}.` : "This tool takes no input.";
  }

  const values: Record<string, string> = {};
  const problems: string[] = [];
  for (const [name, field] of Object.entries(properties)) {
    const raw = given[name] ?? "";
    if (typeof raw !== "string") {
      problems.push(`${name} must be text.`);
      continue;
    }
    const value = raw.trim();
    if (!value) {
      if (required.includes(name)) problems.push(`${name} is required.`);
    } else if (value.length > field.maxLength) {
      problems.push(`${name} must be at most ${field.maxLength} characters.`);
    } else if (value.length < (field.minLength ?? 0)) {
      problems.push(`${name} must be at least ${field.minLength} characters.`);
    } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
      problems.push(`${name} is not valid. ${field.description}`);
    } else {
      values[name] = value;
    }
  }
  return problems.length ? problems.join(" ") : values;
}

/* ── Reading the site's data ──────────────────────────────────────────────── */

const SERVICES = "/data/services.json";
const CASE_STUDIES = "/data/case-studies.json";
const FAQS = "/data/faqs.json";
const COMPANY = "/data/company.json";

type ServicesFile = ReturnType<typeof servicesData>;
type CaseStudiesFile = ReturnType<typeof caseStudiesData>;
type FaqsFile = ReturnType<typeof faqsData>;
type CompanyFile = ReturnType<typeof companyData>;

/** These answer with Cache-Control for an hour, so a second call reads the browser's copy. */
async function readData<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { credentials: "omit", signal });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return (await response.json()) as T;
}

/** The full address of a data file, to say where the rest of an answer is. */
const addressOf = (path: string) => new URL(path, location.href).href;

/* ── The tools ────────────────────────────────────────────────────────────── */

interface Tool {
  name: string;
  title: string;
  description: string;
  inputSchema: InputSchema;
  annotations: { readOnlyHint?: boolean; consequentialHint?: boolean };
  run(values: Values, signal?: AbortSignal): Promise<unknown>;
}

const READS_ONLY = { readOnlyHint: true };

const listServices: Tool = {
  name: "list_services",
  title: "List services",
  description: "Lists every service this company sells, with the slug get_service takes and the title send_enquiry takes.",
  inputSchema: inputs(),
  annotations: READS_ONLY,
  run: async (_, signal) => {
    const { services } = await readData<ServicesFile>(SERVICES, signal);
    return { services: services.map(({ slug, title }) => ({ slug, title })) };
  },
};

const getService: Tool = {
  name: "get_service",
  title: "Get a service",
  description:
    "Returns one service: what it covers, the address of its page and its full text, the headings of that text and its case studies. get_faqs with the service's title as the topic returns its questions.",
  inputSchema: inputs(
    {
      slug: {
        type: "string",
        description: "A slug from list_services, such as web-development or digital-marketing/seo-aeo-geo.",
        maxLength: 80,
        pattern: "^[a-z0-9-]+(/[a-z0-9-]+)?$",
      },
    },
    ["slug"],
  ),
  annotations: READS_ONLY,
  run: async ({ slug }, signal) => {
    const { services } = await readData<ServicesFile>(SERVICES, signal);
    // The last segment alone is enough, so seo-aeo-geo finds digital-marketing/seo-aeo-geo.
    const service = services.find((item) => item.slug === slug || item.slug.endsWith(`/${slug}`));
    if (!service) {
      return { error: "No service has that slug. These do.", slugs: services.map((item) => item.slug) };
    }
    return {
      slug: service.slug,
      title: service.title,
      page: service.url,
      fullText: service.markdownUrl,
      summary: service.lead,
      capabilities: service.capabilities,
      packages: service.packages.map((item) => item.title),
      technology: service.technology.map((item) => item.label),
      headings: service.sections.map((item) => item.heading),
      caseStudies: service.caseStudies.map((item) => item.name),
    };
  },
};

const listCaseStudies: Tool = {
  name: "list_case_studies",
  title: "List case studies",
  description: "Lists the company's published case studies, with each one's field, industry, length and results.",
  inputSchema: inputs(),
  annotations: READS_ONLY,
  run: async (_, signal) => {
    const { url, caseStudies } = await readData<CaseStudiesFile>(CASE_STUDIES, signal);
    return {
      page: url,
      more: addressOf(CASE_STUDIES),
      caseStudies: caseStudies.map(({ name, discipline, industry, timeline, results }) => ({
        name,
        discipline,
        industry,
        timeline,
        results: results.map(({ metric, value }) => `${metric}: ${value}`),
      })),
    };
  },
};

/* The question sets run to 80K in all and 9K for one service, so an answer that
   would not fit says what else there is: the other questions, which the agent can ask
   for by their words, and as many whole answers as fit beside them. */

const OUTPUT_BUDGET = 1500;

interface FaqRow {
  topic: string;
  question: string;
  answer: string;
  source: string;
}

/** "UI/UX?" is the words "ui" and "ux". */
const wordsIn = (text: string) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/**
 * Whichever finds something first: that exact question or topic, then the words in a
 * topic, in a question, in an answer. A word matches the start of a word, so "nda" is
 * not in "standard" and "develop" is in "development". What was asked is only ever
 * compared, and never becomes a pattern or an address.
 */
function findFaqs(groups: FaqsFile["groups"], asked: string): readonly FaqRow[] {
  const rows = groups.flatMap(({ topic, url, faqs }) =>
    faqs.map(({ question, answer }) => ({ topic, question, answer, source: url })),
  );
  const exactly = asked.toLowerCase();
  const isTheQuestion = (row: FaqRow) => row.question.toLowerCase() === exactly;
  const asking = wordsIn(asked);
  const hasAll = (text: string) => {
    const words = wordsIn(text);
    return asking.every((word) => words.some((other) => other.startsWith(word)));
  };
  const tests: ((row: FaqRow) => boolean)[] = [
    (row) => isTheQuestion(row) || row.topic.toLowerCase() === exactly,
    (row) => hasAll(row.topic),
    (row) => hasAll(row.question),
    (row) => hasAll(row.answer),
  ];
  for (const test of tests) {
    // A guide's title can also be a question. The question comes first, or asking for it again would not reach it.
    const found = rows.filter(test).sort((a, b) => Number(isTheQuestion(b)) - Number(isTheQuestion(a)));
    // Several pages can ask the same question. Once is enough, under the first of them.
    if (found.length) return found.filter((row, i) => found.findIndex((r) => r.question === row.question) === i);
  }
  return [];
}

function fitFaqs(found: readonly FaqRow[]) {
  const reply = (shown: readonly FaqRow[], otherQuestions: readonly string[]) => ({
    matched: found.length,
    faqs: shown.map(({ question, answer, source }) => ({ question, answer, source })),
    ...(shown.length < found.length
      ? { otherQuestions, note: "For another answer, call get_faqs again with the words of its question, or with more words." }
      : {}),
  });
  const fits = (shown: readonly FaqRow[], otherQuestions: readonly string[]) =>
    JSON.stringify(reply(shown, otherQuestions)).length <= OUTPUT_BUDGET;

  // The questions first, because they are how the agent asks for the rest. Only a very
  // broad search has more of them than fit.
  let shown: readonly FaqRow[] = [];
  let others = found.map((row) => row.question);
  while (others.length && !fits(shown, others)) others = others.slice(0, -1);

  // Then answers, for as long as each one fits in place of its question. A single match
  // is the answer that was asked for, so it goes whatever its length.
  for (const row of found) {
    const nextShown = [...shown, row];
    const nextOthers = others.filter((question) => question !== row.question);
    if (found.length > 1 && !fits(nextShown, nextOthers)) break;
    shown = nextShown;
    others = nextOthers;
  }
  return reply(shown, others);
}

const getFaqs: Tool = {
  name: "get_faqs",
  title: "Get FAQs",
  description:
    "Returns answers to common questions about the company, its services and its guides. With no topic it returns the list of topics. With a topic, or with words from a question, it returns the answers that match.",
  inputSchema: inputs({
    topic: {
      type: "string",
      description: "A topic from the list, such as Web Development, or words from a question, such as cost or NDA.",
      maxLength: 200,
    },
  }),
  annotations: READS_ONLY,
  run: async ({ topic = "" }, signal) => {
    const { groups } = await readData<FaqsFile>(FAQS, signal);
    const topics = groups.map((group) => group.topic);
    if (!wordsIn(topic).length) return { topics, note: "Call get_faqs again with a topic, or with words from a question." };

    const found = findFaqs(groups, topic);
    return found.length
      ? fitFaqs(found)
      : { matched: 0, faqs: [], topics, note: "No question matches those words. These are the topics." };
  },
};

const getCompanyFacts: Tool = {
  name: "get_company_facts",
  title: "Get company facts",
  description:
    "Returns who the company is, the company it is part of, what it does, how it works, its certificates, where its office is and how to reach it.",
  inputSchema: inputs(),
  annotations: READS_ONLY,
  run: async (_, signal) => {
    const company = await readData<CompanyFile>(COMPANY, signal);
    const { about, credentials, enquiry, office, phone } = company;
    return {
      name: company.name,
      website: company.url,
      partOf: company.parentOrganization,
      summary: about.summary,
      howWeWork: about.howWeWork,
      facts: about.facts.map(({ label, value }) => `${label}: ${value}`),
      certificates: credentials.map(({ name, body, ref }) => `${name}: ${body} Certificate ${ref}.`),
      email: company.email,
      phone: phone.display,
      whatsapp: company.whatsapp,
      office: [...office.addressLines, office.city, office.country].join(", "),
      timeZone: office.timeZone,
      enquiryPage: enquiry.page,
      more: addressOf(COMPANY),
    };
  },
};

/* ── The one that acts ────────────────────────────────────────────────────────
   Posts to the route the forms post to, so the server's checks and rate limits are
   the same ones. Those checks are also why the fields below mirror the forms: an
   agent should hear about a bad address from here, before anything is posted.

   IT SENDS ONCE AND STOPS. It does not retry by itself, and it will not send the same
   details twice from one page load, because each send is a mail to the team and a
   confirmation to the address typed. That memory is cleared by a failed send, so a
   corrected or repeated try can go, and it is only ever in this variable, for this
   page load.

   NO NAVIGATION, BUT IT COUNTS. The forms go on to /thank-you, where a stored lead
   is what fires generate_lead. This tool goes nowhere and stores no lead. It fires
   the forms' two events itself, once, when the route has said the enquiry went:
   form_submission as the form "webmcp", and generate_lead, the Google Ads
   conversion, with the address and number for Enhanced Conversions. Counting an
   agent's enquiry as a lead is the owner's decision of 10 November 2026. The
   conversion carries conversion_type "webmcp_enquiry" and lead_source "webmcp", so
   a GTM trigger and the reports can tell it from a form's lead, as source "webmcp"
   does in the team's mail. A repeat, a refusal, a failed or cancelled request and
   an answer that is not the route's count nothing. A form an agent filled and a
   person sent is a form's lead, and is counted on /thank-you like any other. */

const PHONE_PATTERN = "^[0-9+\\s()\\-]{6,20}$";

let lastEnquiry: string | null = null;

/**
 * The service as a title the site knows, never the agent's own words. The
 * dataLayer takes nothing typed (lib/analytics.ts), and the agent writes this
 * field itself. A title from list_services is matched without regard to case,
 * "Not sure yet" stays, and anything else is "Other". The team's mail still
 * gets the service as the agent wrote it. The file was read for list_services
 * and is cached for an hour, so this is normally the browser's copy.
 */
async function knownService(service: string): Promise<string> {
  const wanted = service.trim().toLowerCase();
  if (wanted === "not sure yet") return "Not sure yet";
  try {
    const { services } = await readData<ServicesFile>(SERVICES);
    return services.find(({ title }) => title.toLowerCase() === wanted)?.title ?? "Other";
  } catch {
    return "Other";
  }
}

/**
 * The two events, for an enquiry the route said it sent. They have their own
 * catch. Anything that threw in dataLayer.push would otherwise reach the catch in
 * run, which tells the agent a sent enquiry may not have gone, and clears the
 * memory that stops it going twice. Not awaited, so the agent's answer does not
 * wait for the services file.
 */
async function countEnquiry({ email, phone, service = "" }: Values) {
  try {
    trackFormSubmission("webmcp", await knownService(service));
    trackGenerateLead({ email, phone }, { source: "webmcp" });
  } catch {
    // Not counted. The mail went all the same, and the agent is told so.
  }
}

const ANOTHER_WAY = "The person can also use the email address or phone number from get_company_facts.";

function nextStep(status: number): string {
  if (status === 400) return "It was not sent. Correct what the answer names, and check with the person before sending again.";
  if (status === 429) return `It was not sent, because too many enquiries came in. It can go again later. ${ANOTHER_WAY}`;
  return `Tell the person it may not have been sent. ${ANOTHER_WAY}`;
}

const sendEnquiry: Tool = {
  name: "send_enquiry",
  title: "Send an enquiry",
  description:
    "Sends a project enquiry to this company's team by email, and a confirmation email to the address given. The team replies to that address within 24 hours. Use it once the person has read the details and agreed to send them.",
  inputSchema: inputs(
    {
      name: { type: "string", description: "The person's name.", maxLength: 80 },
      email: {
        type: "string",
        description: "The email address to reply to, in full, such as name@example.com.",
        maxLength: 160,
        pattern: `^${EMAIL_PATTERN}$`,
      },
      phone: {
        type: "string",
        description: "A phone number with its country code, in digits, spaces and + ( ) - only. Optional.",
        maxLength: 20,
        pattern: PHONE_PATTERN,
      },
      service: {
        type: "string",
        description: 'The closest service title from list_services, or "Not sure yet".',
        maxLength: 120,
      },
      message: {
        type: "string",
        description: "What the person wants built or run, in a few lines. At least 10 characters.",
        minLength: 10,
        maxLength: 5000,
      },
    },
    ["name", "email", "service", "message"],
  ),
  annotations: { consequentialHint: true },
  run: async (values, signal) => {
    const enquiry = JSON.stringify(values);
    if (enquiry === lastEnquiry) {
      return { sent: false, note: "This exact enquiry was already sent, or is being sent, from this page. It was not sent again." };
    }
    lastEnquiry = enquiry;

    try {
      // A cancel stops a request that has not left. One that has left may still send.
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        signal,
        body: JSON.stringify({ ...values, source: "webmcp", page: location.pathname }),
      });
      // Only the route's own words. A host's error page is not something to pass on.
      const text = response.headers.get("content-type")?.includes("json") ? await response.text() : "";
      const answer = text.slice(0, 500);

      if (response.ok && (JSON.parse(text) as { sent?: unknown }).sent === true) {
        void countEnquiry(values);
        return { sent: true, answer, note: "The team has the enquiry and replies within 24 hours." };
      }

      lastEnquiry = null;
      const wait = response.headers.get("retry-after");
      return {
        sent: false,
        status: response.status,
        answer,
        ...(wait ? { retryAfter: wait } : {}),
        note: nextStep(response.status),
      };
    } catch {
      // Nothing came back, or a 200 that was not the route's answer.
      lastEnquiry = null;
      return { sent: false, note: nextStep(0) };
    }
  },
};

/* ── Registering them ─────────────────────────────────────────────────────── */

/** What ContactModal reads. A form arriving by itself would take the next click of a task in hand. */
const POPUP_SEEN_KEY = "zan.contactModal.seen";

function keepPopupAway() {
  try {
    sessionStorage.setItem(POPUP_SEEN_KEY, "1");
  } catch {
    // Storage refused. If it cannot be read either, ContactModal stays away by itself.
  }
}

function toModelContextTool({ run, ...tool }: Tool): ModelContextTool {
  return {
    ...tool,
    execute: async (input, options) => {
      // As well as on toolactivated: the spec fires that for every tool, but Chrome's
      // documentation only describes it for form tools.
      keepPopupAway();
      const checked = checkInput(tool.inputSchema, input);
      if (typeof checked === "string") return { error: checked };
      try {
        return await run(checked, options?.signal);
      } catch {
        return { error: "The site's data could not be read just now. Try once more, or read the site's pages." };
      }
    },
  };
}

/** A build with no mail account shows the address instead of a form, and offers no send either. */
const TOOLS = [
  listServices,
  getService,
  listCaseStudies,
  getFaqs,
  getCompanyFacts,
  ...(leadsReady ? [sendEnquiry] : []),
];

/**
 * All of them or none, as Chrome's best practices ask. Aborting `signal` unregisters
 * them and stops the listeners. An async map, so that an API which throws is handled
 * the same way as one that rejects.
 */
export async function registerTools(modelContext: ModelContext, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;

  const firesActivated: EventTarget[] = [modelContext, window];
  for (const target of firesActivated) target.addEventListener("toolactivated", keepPopupAway, { signal });

  const rollback = new AbortController();
  const registration = AbortSignal.any([signal, rollback.signal]);
  const results = await Promise.allSettled(
    TOOLS.map(async (tool) => modelContext.registerTool(toModelContextTool(tool), { signal: registration })),
  );

  const refused = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
  if (refused && !signal.aborted) {
    rollback.abort();
    console.warn("[WebMCP] tools not registered", refused.reason);
  }
}
