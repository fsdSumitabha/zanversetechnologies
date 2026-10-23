import { site } from "@/constants/zan";
import { getEnv } from "../config/env";
import { logger } from "../config/logger";
import { Agent } from "../models/Agent";
import { Lead } from "../models/Lead";
import { Message } from "../models/Message";
import type { ConversationDoc } from "../models/Conversation";
import { SERVICE_LABELS, type LeadData, type LeadScore } from "../types/domain";
import { generateSummary, buildFallbackSummary } from "./gemini.service";
import {
  OUTSIDE_WINDOW_CODE,
  sendTemplate,
  sendText,
  withinServiceWindow,
  type SendResult,
} from "./whatsapp.service";
import { appendMessage, getAiHistory, transition } from "./conversation.service";

/* ═══════════════════════════════════════════════════════════════════════════
   HUMAN HANDOFF
   Summarise → persist the Lead → park the conversation in WAITING_FOR_AGENT →
   notify a front caller on WhatsApp.

   The order matters. The Lead is written BEFORE the notification goes out, so
   a WhatsApp outage costs us a notification, never the lead itself.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Agents alerted before giving up. One unreachable phone must not strand a
    lead, but a WhatsApp-wide outage should not stall the visitor for long. */
const MAX_ALERT_ATTEMPTS = 3;

/**
 * Front callers to alert, in the order to try them. Available agents first,
 * least-recently-assigned of those — a crude round-robin, but it stops every
 * lead landing on whoever happens to sort first. Then any other agent, so a
 * lead is never orphaned.
 */
export async function pickAgents(limit = MAX_ALERT_ATTEMPTS) {
  const available = await Agent.find({ isAvailable: true }).sort({ lastAssignedAt: 1 }).limit(limit);
  if (available.length >= limit) return available;

  const others = await Agent.find({ _id: { $nin: available.map((a) => a._id) } })
    .sort({ lastAssignedAt: 1 })
    .limit(limit - available.length);
  return [...available, ...others];
}

type AgentRecord = Awaited<ReturnType<typeof pickAgents>>[number];

/** "-" rather than an empty string: WhatsApp rejects blank template parameters. */
const orDash = (value: string | null | undefined) => (value && value.trim()) || "-";

const listOr = (items: string[], fallback = "-") =>
  items.length ? items.join(", ") : fallback;

/**
 * The free-form version, sent when we are inside the 24-hour window.
 *
 * No lead score: it is an internal triage signal for the dashboard, and it
 * tells the person about to dial nothing they can use. What they need is who
 * to call, on what number, and enough of the brief to open the conversation
 * without asking the client to repeat themselves.
 *
 * The first line names the site, so a front caller who also answers for
 * another of the company's sites knows which name to pick up the phone in.
 */
function formatLeadMessage(lead: LeadData, summary: string, conversationId: string): string {
  const service = lead.service ? SERVICE_LABELS[lead.service] : "Not yet identified";

  const lines = [
    `🔔 NEW LEAD from the ${site.name} website chat`,
    "",
    `👤 ${orDash(lead.name)}`,
    `📞 ${orDash(lead.phone)}`,
    `✉️ ${orDash(lead.email)}`,
    "",
    `Service:   ${service}`,
    `Project:   ${orDash(lead.projectType)}`,
    `Budget:    ${orDash(lead.budget)}`,
    `Timeline:  ${orDash(lead.timeline)}`,
  ];

  if (lead.requirements.length) {
    lines.push("", "What they need:", ...lead.requirements.map((r) => `  • ${r}`));
  }
  if (lead.technology.length) {
    lines.push("", `Tech mentioned: ${lead.technology.join(", ")}`);
  }

  lines.push("", "In summary:", summary);
  lines.push("", `Ref: ${conversationId}`, "Reply to this message to talk to them in the website chat.");

  return lines.join("\n");
}

/**
 * Parameters for the approved template, used outside the 24-hour window.
 *
 * Order is fixed by the template body approved in WhatsApp Manager
 * (WHATSAPP_LEAD_TEMPLATE): {{1}} name, {{2}} phone, {{3}} email, {{4}}
 * service, {{5}} project, {{6}} requirements, {{7}} budget, {{8}} timeline,
 * {{9}} summary, {{10}} reference. The template's own wording lives in Meta,
 * not here; a change to either side needs the other. Values are capped
 * because Meta limits a template body to roughly 1,024 characters in total,
 * and a long requirements list would otherwise push the whole send over and
 * fail it.
 */
function templateParams(lead: LeadData, summary: string, conversationId: string): string[] {
  return [
    orDash(lead.name),
    orDash(lead.phone),
    orDash(lead.email),
    lead.service ? SERVICE_LABELS[lead.service] : "Not yet identified",
    orDash(lead.projectType).slice(0, 90),
    listOr(lead.requirements).slice(0, 180),
    orDash(lead.budget),
    orDash(lead.timeline),
    summary.slice(0, 320),
    conversationId,
  ];
}

/**
 * Alert one agent. Template first when we are outside the 24-hour window,
 * because free-form simply will not deliver there.
 */
async function alertAgent(agent: AgentRecord, text: string, params: string[]): Promise<SendResult> {
  let result = withinServiceWindow(agent.lastInboundAt)
    ? await sendText(agent.whatsappPhone, text)
    : await sendTemplate(agent.whatsappPhone, getEnv().WHATSAPP_LEAD_TEMPLATE, params);

  // If we believed we were in the window and Meta disagreed, retry as template.
  if (!result.ok && result.errorCode === OUTSIDE_WINDOW_CODE) {
    logger.info({ agent: agent.whatsappPhone }, "handoff: window closed, retrying as template");
    result = await sendTemplate(agent.whatsappPhone, getEnv().WHATSAPP_LEAD_TEMPLATE, params);
  }
  return result;
}

export interface HandoffResult {
  agentId: string | null;
  agentName: string | null;
  summary: string;
  notified: boolean;
  /** Set when the notification could not be delivered, for the dashboard. */
  notificationError?: string;
}

/**
 * Run the handoff. Safe to call more than once — a second call re-notifies but
 * does not duplicate the Lead.
 */
export async function performHandoff(conversation: ConversationDoc): Promise<HandoffResult> {
  const leadData = conversation.leadData as unknown as LeadData;
  const leadScore = (conversation.leadScore ?? "MEDIUM") as LeadScore;

  // 1 ── Summary. Never allowed to block the handoff, so it falls back.
  let summary: string;
  try {
    const history = await getAiHistory(conversation.conversationId, 60);
    summary = await generateSummary(history, leadData);
  } catch (error) {
    logger.warn({ err: error }, "handoff: summary failed, using fallback");
    summary = buildFallbackSummary(leadData);
  }
  conversation.aiSummary = summary;

  // 2 ── Persist the Lead before anything can fail downstream.
  await Lead.findOneAndUpdate(
    { conversationId: conversation.conversationId },
    {
      $set: {
        conversationId: conversation.conversationId,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        service: leadData.service,
        projectType: leadData.projectType,
        requirements: leadData.requirements,
        budget: leadData.budget,
        timeline: leadData.timeline,
        technology: leadData.technology,
        leadScore,
        aiSummary: summary,
        // "ae" for every lead from this site; see the note on Lead.region.
        region: conversation.meta?.region ?? null,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  // 3 ── Park the conversation. Before any alert goes out, so an agent who
  //      replies at once finds it waiting for them rather than with the AI.
  await conversation.save();
  await transition(conversation, "WAITING_FOR_AGENT");

  // 4 ── Alert a front caller, moving down the list while alerts fail: an
  //      expired session on one phone should not leave the lead unannounced.
  const candidates = await pickAgents();
  if (!candidates.length) {
    logger.error({ conversationId: conversation.conversationId }, "handoff: no agent configured");
  }

  const text = formatLeadMessage(leadData, summary, conversation.conversationId);
  const params = templateParams(leadData, summary, conversation.conversationId);
  const failures: string[] = [];
  let alerted: AgentRecord | null = null;

  for (const agent of candidates) {
    const result = await alertAgent(agent, text, params);
    const failureReason = result.ok
      ? null
      : `${result.errorCode ?? "?"}: ${result.errorMessage ?? "Send failed"}`;

    // 5 ── Record every attempt in the transcript so the thread is complete.
    await appendMessage({
      conversationId: conversation.conversationId,
      senderType: "system",
      channel: "whatsapp",
      // The visitor sees this line too, so a failed alert must not read as a
      // handover.
      message: result.ok ? `Lead handed to ${agent.name}.` : `Could not alert ${agent.name}.`,
      externalMessageId: result.messageId,
      status: result.ok ? "sent" : "failed",
      // Persisted, not just logged: a failed handoff is exactly when someone
      // goes looking in the database, and "status: failed" alone does not say
      // whether it was an unverified recipient, an expired token or a closed
      // 24-hour window.
      failureReason,
    });

    if (result.ok) {
      alerted = agent;
      break;
    }
    logger.error(
      { conversationId: conversation.conversationId, agent: agent.name, error: result.errorMessage },
      "handoff: notification failed",
    );
    failures.push(`${agent.name}: ${failureReason}`);
  }

  // 6 ── Assign the lead to whoever actually got the alert. An agent who was
  //      never told about it cannot be the one it waits on.
  if (alerted) {
    conversation.assignedAgent = alerted._id;
    conversation.whatsappPhoneNumber = alerted.whatsappPhone;
    alerted.lastAssignedAt = new Date();
    // Bind this thread so the agent's un-quoted replies route here.
    alerted.activeConversationId = conversation.conversationId;
    await alerted.save();
  }

  // Stored, not just returned: the console puts leads nobody was told about
  // at the top of its queue.
  const notificationError = failures.join("; ") || "No agent configured";
  conversation.handoffNotified = Boolean(alerted);
  conversation.handoffError = alerted ? null : notificationError;
  await conversation.save();

  if (!alerted) {
    return { agentId: null, agentName: null, summary, notified: false, notificationError };
  }

  return {
    agentId: String(alerted._id),
    agentName: alerted.name,
    summary,
    notified: true,
  };
}

/**
 * Relay a client's website message to the front caller on WhatsApp.
 *
 * Prefixed with the client's name so an agent handling several threads on one
 * phone can tell them apart at a glance.
 */
export async function relayToAgent(
  conversation: ConversationDoc,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!conversation.whatsappPhoneNumber) return { ok: false, error: "No agent bound" };

  const leadData = conversation.leadData as unknown as LeadData;
  const who = leadData.name ?? "Client";
  const result = await sendText(conversation.whatsappPhoneNumber, `${who}: ${text}`);

  if (result.messageId) {
    // Attach the wamid to the stored client message so its delivery callbacks
    // can be matched back to it.
    await Message.findOneAndUpdate(
      { conversationId: conversation.conversationId, message: text, senderType: "client" },
      { $set: { externalMessageId: result.messageId } },
      { sort: { sequence: -1 } },
    );
  }

  if (!result.ok) {
    const outside = result.errorCode === OUTSIDE_WINDOW_CODE;
    logger.error(
      { conversationId: conversation.conversationId, outside, error: result.errorMessage },
      "relay: failed",
    );
    return {
      ok: false,
      error: outside
        ? "The agent's WhatsApp session has expired. They need to message us to reopen it."
        : result.errorMessage,
    };
  }
  return { ok: true };
}
