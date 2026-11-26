import { after } from "next/server";
import { z } from "zod";
import { site } from "@/constants/zan";
import { connectDatabase } from "@/server/config/db";
import { findConversation, updateLeadData } from "@/server/services/conversation.service";
import { requestHandoff } from "@/server/services/chat.service";
import { bearerFrom, verifyChatToken } from "@/server/lib/tokens";
import { rateLimit } from "@/server/lib/rateLimit";
import { fail, ok, parseBody, route, sanitiseMessage, tooMany, unauthorized } from "@/server/lib/http";
import { normalisePhone } from "@/server/services/whatsapp.service";
import { phoneForWorkspace } from "@/server/lib/phone";
import { captureToWorkspace, type LeadRecord } from "@/server/services/workspace.service";
import type { LeadData } from "@/server/types/domain";

export const runtime = "nodejs";
export const maxDuration = 60;

/*
 * The chat widget's contact card posts here. Besides the handoff, the lead
 * is copied to zan-workspace (/api/integrations/leads there, form
 * "chat_widget"), with what the assistant has gathered so far, as
 * zanservices' chat widget does.
 *
 * Contact details are collected by a real form rather than by asking the model
 * to extract them from prose. A phone number is the one field where "close
 * enough" is useless — the front caller either can dial it or cannot — and an
 * LLM reading "double seven, then eight one" out of a sentence is not a
 * foundation for a callback.
 */
const bodySchema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(6).max(24),
  email: z.string().email().max(160).optional().or(z.literal("")),
  note: z.string().max(600).optional(),
});

/** POST /api/chat/lead/ — capture contact details, then hand off. */
export const POST = route(async (request: Request) => {
  const token = bearerFrom(request);
  if (!token) return unauthorized();
  const claims = verifyChatToken(token);
  if (!claims) return unauthorized();

  // Tight: each submission triggers a WhatsApp notification.
  const limit = await rateLimit(claims.conversationId, "lead", 5, 300);
  if (!limit.allowed) return tooMany(limit.retryAfterSeconds);

  const parsed = await parseBody(request, bodySchema);
  if (!parsed.ok) return parsed.response;

  const phone = normalisePhone(parsed.data.phone);
  if (!phone) {
    return fail(400, "That phone number doesn't look right. Include the country code.", {
      details: [{ field: "phone", message: "Enter 8–15 digits including country code" }],
    });
  }

  await connectDatabase();
  const conversation = await findConversation(claims.conversationId);
  if (!conversation) return fail(404, "Conversation not found");
  if (conversation.status === "CLOSED") return fail(409, "This conversation has been closed.");

  // Merge rather than replace: the model may already have picked up a service,
  // budget or timeline that this form does not ask about.
  const existing = conversation.leadData as unknown as LeadData;
  await updateLeadData(
    conversation,
    {
      ...existing,
      name: sanitiseMessage(parsed.data.name, 80),
      phone,
      email: parsed.data.email ? sanitiseMessage(parsed.data.email, 160) : existing.email,
    },
    // Someone who hands over a phone number is, by definition, not a cold lead.
    conversation.leadScore === "HIGH" ? "HIGH" : "MEDIUM",
  );

  await requestHandoff(conversation);

  // A copy for zan-workspace, sent after the response: the handoff above is
  // what the visitor is waiting on, and a slow or absent zan-workspace must
  // not hold up the chat. Failures are logged by the workspace client.
  const lead = conversation.leadData as unknown as LeadData;
  const record: LeadRecord = {
    region: site.region,
    form: "chat_widget",
    page: null,
    name: lead.name ?? sanitiseMessage(parsed.data.name, 80),
    email: lead.email ? lead.email.toLowerCase() : null,
    // normalisePhone keeps E.164's digits without the "+", the form WhatsApp
    // takes. zan-workspace keeps E.164 with it.
    phone: phoneForWorkspace(`+${(lead.phone ?? phone).replace(/^\+/, "")}`, site.region),
    service: null,
    interest: null,
    message: parsed.data.note ? sanitiseMessage(parsed.data.note, 600) || null : null,
    chat: {
      conversationId: claims.conversationId,
      leadScore: (conversation.leadScore as string | null) ?? null,
      service: lead.service ?? null,
      projectType: lead.projectType ?? null,
      budget: lead.budget ?? null,
      timeline: lead.timeline ?? null,
      requirements: [...(lead.requirements ?? [])],
      technology: [...(lead.technology ?? [])],
      summary: (conversation.aiSummary as string | null) ?? null,
    },
  };
  // 5 seconds with its retry: the host's 10-second limit counts the handoff
  // above as well.
  after(() => captureToWorkspace("lead", record, { budgetMs: 5000 }));

  return ok({ status: conversation.status });
});
