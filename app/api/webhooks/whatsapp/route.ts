import { NextResponse } from "next/server";
import { connectDatabase } from "@/server/config/db";
import { logger } from "@/server/config/logger";
import { Agent } from "@/server/models/Agent";
import { Message } from "@/server/models/Message";
import { claimWebhookEvent, releaseWebhookEvent } from "@/server/models/WebhookEvent";
import { deliverAgentMessage } from "@/server/services/chat.service";
import { routeInbound } from "@/server/services/whatsappInbound.service";
import { markRead, sendText, verifyChallenge, verifySignature } from "@/server/services/whatsapp.service";
import { EVENTS, emitToConversation } from "@/server/lib/realtime";
import { sanitiseMessage } from "@/server/lib/http";
import type { MessageStatus } from "@/server/types/domain";

export const runtime = "nodejs";

/* ═══════════════════════════════════════════════════════════════════════════
   WHATSAPP WEBHOOK

   Two rules govern everything here:

   1. NEVER TRUST THE PAYLOAD. Every request is HMAC-verified against the raw
      bytes before a single field is read. An unverified body is discarded.

   2. RETURN 200 when every event was handled or skipped on purpose (a
      duplicate, an unsupported type, an unknown sender); 500 when an event
      failed, so Meta retries it. Each event is claimed before it is processed
      and its claim is released if processing fails, so a retry runs only the
      failed events again: the ones that succeeded stay claimed and are
      skipped as duplicates.
   ═══════════════════════════════════════════════════════════════════════════ */

/** GET — Meta's one-time subscription handshake. */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const challenge = verifyChallenge(params);

  if (!challenge) {
    logger.warn({}, "whatsapp: webhook verification failed");
    return new NextResponse("Forbidden", { status: 403 });
  }
  // Meta requires the raw challenge as plain text, not JSON.
  return new NextResponse(challenge, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}

interface WaValue {
  metadata?: { phone_number_id?: string };
  contacts?: { profile?: { name?: string }; wa_id?: string }[];
  messages?: {
    id: string;
    from: string;
    timestamp: string;
    type: string;
    text?: { body: string };
    context?: { id?: string };
    button?: { text?: string };
    interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
  }[];
  statuses?: {
    id: string;
    status: string;
    recipient_id?: string;
    errors?: { code?: number; title?: string; message?: string }[];
  }[];
}

/** POST — inbound messages and delivery/read receipts. */
export async function POST(request: Request) {
  // Raw body FIRST. Re-serialising a parsed object produces different bytes and
  // the signature would never match.
  const raw = await request.text();

  if (!verifySignature(Buffer.from(raw, "utf8"), request.headers.get("x-hub-signature-256") ?? undefined)) {
    logger.warn({}, "whatsapp: invalid webhook signature");
    return new NextResponse("Forbidden", { status: 403 });
  }

  let payload: { entry?: { changes?: { value?: WaValue }[] }[] };
  try {
    payload = JSON.parse(raw);
  } catch {
    // Signed but unparseable: acknowledge, do not invite a retry.
    return NextResponse.json({ received: true });
  }

  try {
    await connectDatabase();
  } catch (error) {
    // Nothing is claimed yet, so Meta's retry will process the whole batch.
    logger.error({ err: String(error) }, "whatsapp: database unavailable, asking Meta to retry");
    return NextResponse.json({ received: false }, { status: 500 });
  }

  // Event by event: one failure must neither stop the rest of the batch nor
  // be acknowledged as though it had been processed. The optional chaining is
  // for a signed body of an unexpected shape, which is skipped rather than
  // turned into a 500 that Meta would retry for days.
  let failed = false;
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value;
      if (!value) continue;
      for (const message of value.messages ?? []) {
        const done = await processOnce(`${message.id}:message`, () => handleMessage(value, message));
        if (!done) failed = true;
      }
      for (const status of value.statuses ?? []) {
        const done = await processOnce(`${status.id}:${status.status}`, () => handleStatus(status));
        if (!done) failed = true;
      }
    }
  }

  // See rule 2 above.
  if (failed) return NextResponse.json({ received: false }, { status: 500 });
  return NextResponse.json({ received: true });
}

/**
 * Claim one event, then process it. Resolves false when processing failed —
 * after releasing the claim, so that Meta's retry runs the event again rather
 * than skipping it as a duplicate.
 */
async function processOnce(eventKey: string, work: () => Promise<void>): Promise<boolean> {
  let claimed = false;
  try {
    // Idempotency. Meta retries until it sees a 200, and a retry can arrive
    // while the first delivery is still in flight.
    claimed = await claimWebhookEvent(eventKey);
    if (!claimed) {
      logger.debug({ eventKey }, "whatsapp: duplicate event, skipped");
      return true;
    }
    await work();
    return true;
  } catch (error) {
    logger.error({ err: String(error), eventKey }, "whatsapp: event processing failed");
    if (claimed) {
      try {
        await releaseWebhookEvent(eventKey);
      } catch (releaseError) {
        // The one way an event is still lost: the retry will be skipped.
        logger.error(
          { err: String(releaseError), eventKey },
          "whatsapp: could not release claim, Meta's retry will be skipped",
        );
      }
    }
    return false;
  }
}

async function handleMessage(value: WaValue, message: NonNullable<WaValue["messages"]>[number]) {
  // Sender first. Only agents use this line, and an automatic reply to an
  // unknown number is how a business account gets reported — whatever that
  // number happened to send.
  const agent = await Agent.findOne({ whatsappPhone: message.from });
  if (!agent) {
    logger.warn({ from: message.from, type: message.type }, "whatsapp: message from unknown number, ignored");
    return;
  }

  // Any message from an agent opens the 24-hour window in which we may send
  // them free-form text: a voice note counts as much as a typed reply.
  agent.lastInboundAt = new Date();
  await agent.save();

  // Text, tapped button, and list selections all arrive differently.
  const text =
    message.text?.body ??
    message.interactive?.button_reply?.title ??
    message.interactive?.list_reply?.title ??
    message.button?.text ??
    null;

  if (!text) {
    logger.info({ type: message.type, from: message.from }, "whatsapp: unsupported message type");
    await sendText(
      message.from,
      "Only text replies are relayed to the website chat at the moment. Please type your reply.",
    );
    return;
  }

  const routed = await routeInbound({
    from: message.from,
    text: sanitiseMessage(text),
    contextMessageId: message.context?.id ?? null,
  });

  if (!routed.agentId) {
    // The agent was removed since the check above. Do not reply — replying to
    // arbitrary inbound numbers is how a business account gets reported.
    return;
  }

  if (!routed.conversation) {
    await sendText(
      message.from,
      "I couldn't tell which conversation that was for. Reply directly to a lead notification, " +
        "or start your message with the conversation ID, e.g. #conv_abc123 your reply.",
    );
    return;
  }

  // Ticks in the agent's app should reflect that we actually took it.
  void markRead(message.id);

  await deliverAgentMessage(routed.conversation, routed.text, {
    channel: "whatsapp",
    agentId: routed.agentId,
    externalMessageId: message.id,
  });

  logger.info(
    { conversationId: routed.conversation.conversationId, reason: routed.reason },
    "whatsapp: agent message relayed to website",
  );
}

/** Delivery and read receipts for messages WE sent. */
async function handleStatus(status: NonNullable<WaValue["statuses"]>[number]) {
  const mapped: Record<string, MessageStatus> = {
    sent: "sent",
    delivered: "delivered",
    read: "read",
    failed: "failed",
  };
  const next = mapped[status.status];
  if (!next) return;

  const failure = status.errors?.[0];
  const updated = await Message.findOneAndUpdate(
    { externalMessageId: status.id },
    {
      $set: {
        status: next,
        ...(failure ? { failureReason: failure.message ?? failure.title ?? "Delivery failed" } : {}),
      },
    },
    { returnDocument: "after" },
  );

  if (!updated) return;

  // Surface ticks in the website UI too.
  await emitToConversation(updated.conversationId, EVENTS.status, {
    messageId: String(updated._id),
    messageStatus: next,
  });

  if (next === "failed") {
    logger.error(
      { conversationId: updated.conversationId, reason: failure?.message },
      "whatsapp: message delivery failed",
    );
  }
}
