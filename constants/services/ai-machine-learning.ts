import type { ServiceContent } from "./types";

export const content: ServiceContent = {
  h1: "AI Development Company in Dubai",
  /* The search title names AI agents, while the h1 keeps the company phrase.
     By 10 November 2026 "AI agent" had passed "generative AI" in UAE
     searches, and the page already says we build both chatbots and agents.
     35 characters, so the rendered title runs to 60 (at most 62). Changing
     this redraws the page's share card, so the page's date in
     constants/freshness.ts moves with it. */
  seoTitle: "AI Development & AI Agents in Dubai",
  seoDescription:
    "Zan Verse is an AI development company in Dubai. We build AI agents, chatbots, custom machine learning models and generative AI, and offer AI consulting.",
  lead: "Zan Verse Technologies is an AI development company in Dubai. Growing businesses get AI consulting, custom machine learning models, chatbots and generative AI features that automate work and connect to the systems they already run.",
  sections: [
    {
      heading: "What our AI development services include",
      paragraphs: [
        "We build AI solutions for businesses in Dubai and across the UAE, each doing a specific job inside a real product or process. A project can use one of these services or combine several.",
      ],
      bullets: [
        "AI consulting: working out whether AI suits a task, which approach fits, what data it needs and what it would cost to run.",
        "Custom machine learning models: models trained on your own data to predict or classify something specific to your business, such as which requests need attention first.",
        "AI chatbot development: assistants that answer questions in plain language, connect to systems such as a CRM, and pass complex queries to a person.",
        "Generative AI development: features that draft, summarize or answer questions. With retrieval, answers draw on your own documents, not only on the model's general training.",
      ],
    },
    {
      heading: "AI agents and AI workflow automation",
      paragraphs: [
        "An AI agent is software that uses a language model to plan steps toward a goal and carry them out through connected tools. Systems that work this way are often called agentic AI. An AI agent for customer service, for example, might look up an order and start a return.",
        "AI workflow automation is the wider idea: a repeated process in which AI handles a step that used to need a person, such as sorting a request or drafting a reply.",
        "Agents suit tasks whose steps cannot all be set in advance and whose results can be checked. For a simple question and answer, a chatbot or a fixed rule is usually cheaper and easier to test. We build both chatbots and agents, and our recommendation for your project is set out in the written proposal.",
        "Whichever you choose, the AI needs a place to work, such as a web app, a dashboard or your existing CRM. So AI projects often include web development.",
      ],
      links: [
        { label: "What is an AI agent?", href: "/guides/what-is-an-ai-agent" },
        { label: "Web development company in Dubai", href: "/services/web-development" },
      ],
    },
    {
      heading: "What changes the cost of AI development",
      paragraphs: [
        "The model is only one part of the bill. Data, connections and testing take work too, and these factors move the estimate:",
      ],
      bullets: [
        "Reuse or build: calling an existing model through an API takes less work than collecting data and training a custom one.",
        "The state of your data: records that are clean and in one place need less preparation than scattered or unlabelled ones.",
        "AI integration: each system the AI reads from or writes to, such as a CRM or an order system, adds work.",
        "Room for error: a tool whose output a person checks needs less testing than one that acts on its own.",
        "Usage: model providers usually charge by use, so the volume of requests adds a running cost beyond the build.",
        "Sensitive data: personal or confidential information calls for tighter access control and more review.",
      ],
    },
    {
      heading: "Comparing AI companies in Dubai and across the UAE",
      paragraphs: [
        "Start with one task you can measure, such as the share of support tickets answered without a person. Then ask each AI company in Dubai you are considering to show you an AI system running in a real business. Our example is the customer support chatbot we built for an e-commerce brand, shown in our portfolio.",
        "With us, you talk directly to the people who build the system, and you see weekly progress on a live staging environment. Three months of post-launch support is included. Whoever you are comparing, put these questions to them:",
      ],
      bullets: [
        "How will the system be tested before people rely on it, and who reviews its mistakes afterwards?",
        "What happens when it cannot answer? It should pass the conversation to a person.",
        "How does it handle prompt injection, sensitive information disclosure and excessive agency? The OWASP Top 10 for LLM Applications names all three.",
        "Who manages AI risk over time? NIST's AI Risk Management Framework, intended for voluntary use, is a public reference.",
        "Where will it run, who monitors it, and who owns the code? With us, you own the IP, and we sign an NDA on request.",
      ],
      links: [
        { label: "AI customer support chatbot case study", href: "/portfolio" },
        { label: "Cyber security services in Dubai", href: "/services/cybersecurity" },
        { label: "Cloud and DevOps services in Dubai", href: "/services/cloud-devops" },
      ],
    },
  ],
  faqs: [
    {
      question: "How much does AI development cost in Dubai?",
      answer:
        "The job sets the cost, so there is no price list. An AI chatbot built on an existing model usually takes less work than an AI agent connected to several systems or a custom model trained on your data. You get a written, line-item estimate within 3 to 5 business days of a free discovery call, and work is invoiced in dirhams.",
    },
    {
      question: "What is an AI agent?",
      answer:
        "An AI agent is software that uses a language model to decide on steps toward a goal and act through connected tools, such as looking up an order or updating a record. Agents are part of our applied AI work, alongside retrieval and classic models. Actions that are costly to undo should still go to a person for review.",
    },
    {
      question: "What is a chatbot, and how does a generative AI chatbot differ?",
      answer:
        "A chatbot is software that holds a conversation with a person, usually through text. A rule-based chatbot follows fixed scripts and answers only what it was set up to answer. A generative AI chatbot uses a language model to write each reply, and it can draw on your own documents and systems to handle more varied questions.",
    },
    {
      question: "What is AI automation?",
      answer:
        "AI automation means using AI for a step in a process that would otherwise need human judgment, such as reading an email, working out what the sender wants and routing it. It copes with varied wording better than a fixed rule does. It also makes mistakes, so it needs testing and a way to pass hard cases to a person.",
    },
    {
      question: "How long does it take to build an AI chatbot?",
      answer:
        "It depends on the scope, and one project is only a guide. The customer support chatbot in our portfolio took 4 weeks and connected to the client's CRM and order management system. More integrations, messier data or stricter testing can lengthen that, so your written proposal sets out milestones for your own project.",
    },
    {
      question: "Do we need a custom machine learning model?",
      answer:
        "Often not at the start. If an existing model reached through an API does the job well enough, it is quicker and cheaper to begin there. A custom model makes sense when the task depends on your own data, such as predicting demand or classifying your records, and a general model cannot reach the accuracy you need.",
    },
  ],
  sources: [
    {
      label: "OWASP Top 10 for LLM Applications (2025)",
      href: "https://genai.owasp.org/llm-top-10/",
    },
    {
      label: "NIST AI Risk Management Framework",
      href: "https://www.nist.gov/itl/ai-risk-management-framework",
    },
    {
      label: "Anthropic: Building effective agents",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
  ],
};
