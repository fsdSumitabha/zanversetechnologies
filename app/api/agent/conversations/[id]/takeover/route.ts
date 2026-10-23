import { connectDatabase } from "@/server/config/db";
import { Agent } from "@/server/models/Agent";
import {
  acceptsMessages,
  appendMessage,
  findConversation,
  serialiseMessage,
  transition,
} from "@/server/services/conversation.service";
import { requireAgent } from "@/server/lib/agentAuth";
import { EVENTS, emitStatus, emitToConversation } from "@/server/lib/realtime";
import { fail, notFound, ok, route, unauthorized } from "@/server/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/agent/conversations/{id}/takeover/
 *
 * Claim a thread. Reassigns it, binds it as the agent's active WhatsApp thread
 * so their un-quoted replies land here, and silences the AI.
 */
export const POST = route<Ctx>(async (request, context) => {
  const agent = await requireAgent(request);
  if (!agent) return unauthorized();

  await connectDatabase();
  const { id } = await context.params;
  const conversation = await findConversation(id);
  if (!conversation) return notFound("Conversation not found");
  // Before the reassignment below, so a refused takeover changes nothing.
  if (!acceptsMessages(conversation)) return fail(409, "Conversation is closed");

  conversation.assignedAgent = agent._id;
  conversation.whatsappPhoneNumber = agent.whatsappPhone;
  await conversation.save();

  await Agent.findByIdAndUpdate(agent._id, {
    $set: { activeConversationId: conversation.conversationId, lastAssignedAt: new Date() },
  });

  // Tell the visitor only about a takeover that actually happened.
  if (!(await transition(conversation, "HUMAN_ACTIVE"))) {
    return fail(409, "Conversation could not be taken over");
  }

  const notice = await appendMessage({
    conversationId: conversation.conversationId,
    senderType: "system",
    channel: "website",
    message: `${agent.name} has joined the conversation.`,
  });

  await emitStatus(conversation.conversationId, "HUMAN_ACTIVE", { agentName: agent.name });
  await emitToConversation(conversation.conversationId, EVENTS.agentJoined, {
    agentName: agent.name,
  });
  if (notice) {
    await emitToConversation(conversation.conversationId, EVENTS.message, serialiseMessage(notice));
  }

  return ok({ status: "HUMAN_ACTIVE", agentName: agent.name });
});
