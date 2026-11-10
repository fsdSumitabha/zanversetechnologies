import type { Guide } from "./types";

export const guide: Guide = {
  slug: "what-is-an-ai-agent",
  title: "What is an AI agent?",
  seoTitle: "What Is an AI Agent? A Plain Guide",
  seoDescription:
    "An AI agent uses a language model and tools to carry out a task with some independence. How it differs from a chatbot, where it works and what can go wrong.",
  lead: "An AI agent is software that uses a large language model to decide its next steps and act through connected tools, repeating until the task is done or a limit stops it. A simple chatbot only replies; an agent can also take actions.",
  summary:
    "What an AI agent is, how it differs from a chatbot and plain automation, the parts it has, where it works and the risks.",
  published: "2026-11-05",
  updated: "2026-11-05",
  sections: [
    {
      heading: "What is an AI agent?",
      paragraphs: [
        "OpenAI's guide defines agents as systems that independently accomplish tasks on your behalf. An AI agent is built on a large language model (LLM), the type of AI that reads and writes text, and the model decides what to do next rather than following a fixed path.",
        "Take an AI agent for customer service. It could read a complaint, pull the customer's order history and the relevant help article, then issue a refund or update the ticket, and pass the case to a person when it cannot finish.",
        "The word is used loosely. Anthropic's guide notes that some people use it for fully autonomous systems and others for software that follows predefined workflows. So when a product is called an agent, ask what it actually decides for itself.",
      ],
    },
    {
      heading: "How is an AI agent different from a chatbot and from plain automation?",
      paragraphs: [
        "The difference is who decides the next step, and whether the system can act.",
      ],
      bullets: [
        "A simple chatbot replies in conversation. OpenAI's guide says applications that use a language model but do not let it control how a workflow runs, such as simple chatbots, are not agents. Give a chatbot tools and the freedom to use them, and it starts to become an agent.",
        "Plain automation follows rules written in advance. OpenAI compares a rules engine to a checklist that flags what matches preset criteria. It is predictable, and it cannot handle what its rules did not foresee.",
        "An AI workflow adds language model steps to a fixed process. Anthropic defines workflows as language models and tools run through predefined code paths, so the developer still defines the paths it can take.",
        "An AI agent chooses its own path. The model picks the tools and steps as it goes, based on what each action returns.",
      ],
    },
    {
      heading: "What parts does an AI agent have?",
      paragraphs: [
        "OpenAI's guide names three core components: a model, tools and instructions. Two more describe how an agent runs: a loop and a stopping rule.",
      ],
      bullets: [
        "Model: the language model that does the reasoning and makes the decisions. Anthropic's guide also describes adding retrieval, which means looking up relevant information, and memory.",
        "Tools: connections that let it look things up or take action, such as querying a customer database, reading a document, sending an email or updating a record.",
        "Instructions: written guidance and limits on how it should behave, often drawn from your existing procedures, support scripts or policy documents.",
        "Loop: it takes an action, sees the result and decides what to do next. Anthropic describes agents as typically just language models using tools in a loop, based on feedback from their environment.",
        "Stopping rule: what ends the run, such as the task being finished, an error or a maximum number of steps. Agents can also pause and ask a person.",
      ],
    },
    {
      heading: "Where do AI agents work well, and where do they work badly?",
      paragraphs: [
        "They work well on open-ended tasks where the steps cannot be predicted and a fixed path cannot be written in advance. OpenAI's guide points to decisions that need judgment, such as refund approvals; rule sets that have become too complex to maintain, such as vendor security reviews; and work that depends on unstructured information, such as processing an insurance claim.",
        "Anthropic says agents add the most value where a task needs both conversation and action, has clear success criteria, allows feedback and includes meaningful human oversight.",
        "Start with the simplest thing that could work. Anthropic recommends finding the simplest solution possible, which might mean not building an agent at all. Agents work badly, or are not needed, in these cases:",
      ],
      bullets: [
        "The task is well defined and repeatable. A fixed workflow is more predictable, and OpenAI says a deterministic solution, one that follows set rules, may be enough.",
        "A single answer would do. Anthropic says that for many applications, one well-built model call with retrieval and examples is usually enough.",
        "Speed and cost matter more than a better result. Anthropic says agentic systems often trade response time and cost for better task performance.",
        "A wrong action would be costly and nobody is checking. OpenAI says sensitive, irreversible or high-stakes actions should trigger human oversight until confidence in the agent's reliability grows.",
        "You cannot tell whether it succeeded. Without clear success criteria or feedback, neither the agent nor your team can judge its work.",
      ],
    },
    {
      heading: "What are the risks of AI agents?",
      paragraphs: [
        "The risk grows with what the agent can reach. The OWASP Gen AI Security Project notes in its Top 10 for LLM Applications that the impact depends on which systems the application can interact with. Plan for these four risks:",
      ],
      bullets: [
        "Wrong actions. Models make mistakes, and an agent acts on them. Anthropic warns of compounding errors. OWASP calls the underlying weakness excessive agency: damaging actions taken in response to unexpected, ambiguous or manipulated model output, usually because the agent has too much functionality, too many permissions or too much autonomy.",
        "Prompt injection. Input changes the model's behaviour in unintended ways. It can be typed by a user or hidden in a website or file the agent reads, and it need not be visible to people. OWASP says it is unclear whether fool-proof prevention exists.",
        "Data exposure. An agent that can read business systems can also reveal what it reads. OWASP's example is a mailbox assistant tricked by a crafted email into searching the inbox for sensitive information and forwarding it to an attacker.",
        "Cost. An agent may make repeated model calls for one task, and Anthropic says its autonomy means higher costs. OWASP also describes denial of wallet, where attackers run a high volume of operations to exploit the pay-per-use pricing of AI services.",
      ],
    },
    {
      heading: "How do you reduce the risks of an AI agent?",
      paragraphs: [
        "No single control is likely to be enough. OpenAI's guide describes guardrails, the checks around an agent, as layers, and says they should be paired with authentication, strict access controls and standard software security.",
        "For a wider process, the AI Risk Management Framework from the US National Institute of Standards and Technology (NIST) is voluntary guidance that organizes this work into four functions: govern, map, measure and manage. NIST says a revised version is in progress.",
        "These practical steps come from the OWASP, OpenAI and Anthropic guides:",
      ],
      bullets: [
        "Give the agent only the tools and permissions it needs. A tool that summarizes email should not also be able to send it.",
        "Enforce permissions in the connected systems, not in the model's instructions.",
        "Require a person's approval for high-impact actions, such as cancelling orders, authorizing large refunds or making payments.",
        "Treat outside content as untrusted, and keep it clearly separate from your instructions.",
        "Set limits on steps, retries and request volume.",
        "Test in a sandbox, a sealed test environment, before going live. Attack the agent on purpose, and log what it does once it is running.",
      ],
      links: [
        { label: "What is VAPT? How penetration testing works", href: "/guides/what-is-vapt" },
      ],
    },
    {
      heading: "How can Zan Verse help with AI?",
      paragraphs: [
        "Zan Verse Technologies, an IT company based in Dubai, builds AI and machine learning systems, including custom ML models, chatbots and generative AI, and offers AI consulting. Our technology work is applied AI in production: retrieval, agents and classic models wired into real products. If you are weighing an agent against a chatbot or plain automation, a free 30-minute discovery call is a way to talk it through, and a written proposal follows within 3 to 5 business days.",
      ],
      links: [
        { label: "AI and machine learning services: custom models, chatbots and generative AI", href: "/services/ai-machine-learning" },
      ],
    },
  ],
  faqs: [
    {
      question: "Is a chatbot an AI agent?",
      answer:
        "Not usually. A simple chatbot replies in conversation and does not control a process. It becomes an agent when the model decides which tools to use and acts through them, for example looking up an order and then issuing a refund. Customer support systems can do both.",
    },
    {
      question: "What is the difference between an AI agent and agentic AI?",
      answer:
        "The terms overlap. Anthropic uses agentic systems as the wider label, covering both workflows, which follow predefined code paths, and agents, where the model directs its own steps and tools. Other companies may draw the line elsewhere, so ask what a product actually decides for itself.",
    },
    {
      question: "Should an AI agent act without human approval?",
      answer:
        "Only on low-risk actions you have tested. OpenAI's guide says actions that are sensitive, irreversible or high stakes should trigger human oversight until confidence in the agent's reliability grows. Its examples are cancelling orders, authorizing large refunds and making payments.",
    },
    {
      question: "What is prompt injection?",
      answer:
        "Prompt injection is when input changes how a language model behaves in ways that were not intended. It can be typed directly, or hidden in something the model reads, such as a website or file. OWASP lists it first in its Top 10 for LLM Applications and says it is unclear whether fool-proof prevention exists.",
    },
    {
      question: "How much does an AI agent cost?",
      answer:
        "There is no standard price. Building one costs more as it connects to more systems, takes more kinds of action and needs more testing and human review. Running costs depend on how many model calls each task makes, which is usually more than a single reply. Ask for a written estimate against a defined task.",
    },
  ],
  sources: [
    {
      label: "OpenAI: A practical guide to building agents",
      href: "https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf",
    },
    {
      label: "Anthropic: Building effective agents",
      href: "https://www.anthropic.com/research/building-effective-agents",
    },
    {
      label: "OWASP Top 10 for LLM Applications 2025: LLM01 Prompt Injection",
      href: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
    },
    {
      label: "OWASP Top 10 for LLM Applications 2025: LLM06 Excessive Agency",
      href: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/",
    },
    {
      label: "OWASP Top 10 for LLM Applications 2025: LLM10 Unbounded Consumption",
      href: "https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/",
    },
    {
      label: "NIST: AI Risk Management Framework",
      href: "https://airc.nist.gov/airmf-resources/airmf/",
    },
  ],
  services: [{ label: "AI & Machine Learning", href: "/services/ai-machine-learning" }],
};
