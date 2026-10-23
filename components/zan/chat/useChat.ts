"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type PusherClient from "pusher-js";
import type { Channel } from "pusher-js";
import {
  ChatApiError,
  fetchHistory,
  sendMessage,
  setHandoff,
  startSession,
  submitLead,
} from "./api";
import { clearToken, readToken, writeToken } from "./storage";
import type { ChatMessage, ConnectionState, ConversationState, KnownContact } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   CHAT CLIENT

   Owns the whole client side of one conversation: session, transcript,
   realtime subscription and reconnection.

   The rule that shapes everything: the SERVER's message log is the truth and
   `sequence` is its order. The socket is an optimisation — every message it
   delivers is already durable, so a dropped connection costs latency, never
   data. On reconnect we ask for everything past the highest sequence we hold.

   Ported from the main app's src/lib/chat/useChat.ts. One change: pusher-js is
   imported dynamically, and only when a key and cluster are configured. They
   now are — NEXT_PUBLIC_PUSHER_KEY and _CLUSTER live in .env.local alongside
   the rest of the chat backend — so realtime is the normal path. The guard
   stays because a deployment without those two must still work: without them
   pusher-js is never fetched and the panel runs over HTTP, reconciling after
   every send and polling only while a human is on the thread.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The region every conversation from this site is filed under: always "ae".
 *
 * This site serves the UAE alone, so nothing here varies it. It is still sent,
 * because the chat backend and its Mongo collections may be shared with the
 * company's three-region site (zanservices.com), whose agent console files
 * UAE leads under "ae". The server's enum and the stored field keep all three
 * codes for that reason (app/api/chat/session/route.ts).
 */
const CHAT_REGION = "ae";

interface UseChatOptions {
  /** Nothing happens until the panel is first opened. */
  enabled: boolean;
}

export interface ChatController {
  messages: ChatMessage[];
  status: ConversationState;
  connection: ConnectionState;
  agentTyping: boolean;
  aiTyping: boolean;
  agentName: string | null;
  error: string | null;
  ready: boolean;
  /** Anything we already hold, for prefilling the contact card. */
  contact: KnownContact;
  send: (text: string) => Promise<void>;
  submitContact: (details: { name: string; phone: string; email?: string }) => Promise<void>;
  requestHandoff: () => Promise<void>;
  declineHandoff: () => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * What to put in front of the visitor when a call fails.
 *
 * The server's own errors are written for a person, so they pass through. A
 * network failure is not: `fetch` rejects with "Failed to fetch", which is a
 * developer's sentence, and printing it in the transcript makes the panel look
 * broken rather than unreachable. It also happens to be the case where the two
 * other ways of getting in touch still work, so it says so.
 */
// A server failure (5xx) says "Request failed (500)", which means nothing to a
// visitor: show the plain fallback instead. A 4xx carries a real reason.
const reason = (err: unknown, fallback: string) =>
  err instanceof ChatApiError && err.status < 500 && err.message ? err.message : fallback;

/** Local echo, shown before the server has acknowledged the message. */
const isOptimistic = (message: ChatMessage) => message.id.startsWith("pending-");

/**
 * Insert keeping `sequence` order, ignoring anything already present.
 *
 * Optimistic echoes need explicit retirement. They are keyed on a fractional
 * sequence so they sort after the last real message, which means the server's
 * copy — arriving on an integer sequence — does not overwrite them and the
 * visitor sees their own message twice. So once a real client message with the
 * same text lands, the echo it was standing in for is dropped.
 */
function merge(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const bySequence = new Map(existing.map((m) => [m.sequence, m]));
  for (const message of incoming) bySequence.set(message.sequence, message);

  const all = [...bySequence.values()];
  const confirmed = new Set(
    all.filter((m) => !isOptimistic(m) && m.senderType === "client").map((m) => m.message),
  );

  return all
    .filter((m) => !(isOptimistic(m) && confirmed.has(m.message)))
    .sort((a, b) => a.sequence - b.sequence);
}

/** The conversation this browser is on, and the token that proves it. */
interface ChatSession {
  token: string;
  conversationId: string;
}

/** Pusher's public key and cluster, or null when realtime is not configured. */
function realtimeConfig() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  return key && cluster ? { key, cluster } : null;
}

/** The server keeps 500 characters of the referrer, so no more is sent; an
    empty one is left out. */
function currentReferrer(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.referrer.slice(0, 500) || undefined;
}

export function useChat({ enabled }: UseChatOptions): ChatController {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConversationState>("AI_ACTIVE");
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [aiTyping, setAiTyping] = useState(false);
  const [agentTyping] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [contact, setContact] = useState<KnownContact>({ name: null, email: null, phone: null });
  /* The realtime subscription is keyed on this, so a new session gets a new
     client and channel. */
  const [session, setSession] = useState<ChatSession | null>(null);

  // The same session, for callbacks that must see the current one rather than
  // the one from the render that created them.
  const sessionRef = useRef<ChatSession | null>(null);
  const typingGuard = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetting = useRef(false);
  // Read inside socket callbacks, which close over their first render.
  const highestSequence = useRef(0);

  const adoptSession = useCallback((next: ChatSession | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  /**
   * Show or hide the typing indicator.
   *
   * Turning it ON always arms a timeout that turns it back off. The indicator
   * previously had exactly one route to `false` on the success path — a Pusher
   * `typing` event — so any realtime hiccup left it spinning forever even
   * though the reply had already arrived over HTTP. It looked like the chat had
   * hung, and only a reload cleared it.
   */
  const showTyping = useCallback((on: boolean, ceilingMs = 45_000) => {
    if (typingGuard.current) {
      clearTimeout(typingGuard.current);
      typingGuard.current = null;
    }
    setAiTyping(on);
    if (on) {
      typingGuard.current = setTimeout(() => setAiTyping(false), ceilingMs);
    }
  }, []);

  const applyMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((current) => {
      const next = merge(current, incoming);
      highestSequence.current = next.at(-1)?.sequence ?? highestSequence.current;
      return next;
    });
  }, []);

  /** Pull anything we missed while disconnected. */
  const reconcile = useCallback(async () => {
    const token = sessionRef.current?.token;
    if (!token) return;
    try {
      const data = await fetchHistory(token, highestSequence.current);
      // The conversation was replaced while this was in flight; its messages
      // do not belong in the new transcript.
      if (sessionRef.current?.token !== token) return;
      if (data.messages.length) applyMessages(data.messages);
      setStatus(data.status);
    } catch {
      /* Next reconnect will retry; do not surface a transient gap. */
    }
  }, [applyMessages]);

  // ── Session ──────────────────────────────────────────────────────────────
  // Start or resume the conversation when the panel opens. The subscription
  // below follows whichever session this, or reset(), settles on.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        // Only while there is no session yet. Once there is, the connection
        // state belongs to the realtime client, and a resume (the panel
        // reopened) must not leave it stuck on "connecting".
        if (!sessionRef.current) setConnection("connecting");
        const started = await startSession({
          token: readToken() ?? undefined,
          region: CHAT_REGION,
          referrer: currentReferrer(),
        });
        if (cancelled) return;

        writeToken(started.token);
        adoptSession({ token: started.token, conversationId: started.conversationId });
        setStatus(started.status);
        applyMessages(started.messages);
        if (started.contact) setContact(started.contact);
        setReady(true);

        // Realtime unconfigured — the normal case in local development. The
        // panel is fully functional over HTTP (send reconciles, and the poll
        // below covers agent replies), so this is a quieter mode, not an
        // error. pusher-js is never downloaded.
        if (!realtimeConfig()) setConnection("offline");
      } catch (err) {
        if (cancelled) return;
        setConnection("error");
        setError(
          reason(
            err,
            "We cannot reach the assistant right now. WhatsApp or the enquiry form will still get through to us.",
          ),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, applyMessages, adoptSession]);

  // ── Realtime subscription ────────────────────────────────────────────────
  // One client per session: that session's token, that conversation's
  // channel. A new session tears the old client down. Kept alive, it left the
  // panel deaf to the new thread, since the poll below stays off while this
  // client reports itself online.
  const sessionToken = session?.token;
  const sessionConversationId = session?.conversationId;

  useEffect(() => {
    const config = realtimeConfig();
    if (!enabled || !sessionToken || !sessionConversationId || !config) return;
    const channelName = `private-conversation-${sessionConversationId}`;
    let cancelled = false;
    let pusher: PusherClient | null = null;
    let channel: Channel | null = null;

    (async () => {
      const { default: Pusher } = await import("pusher-js");
      if (cancelled) return;

      pusher = new Pusher(config.key, {
        cluster: config.cluster,
        authEndpoint: "/api/pusher/auth",
        auth: { headers: { authorization: `Bearer ${sessionToken}` } },
      });

      // A client being torn down still reports its own disconnect. `cancelled`
      // keeps that from overwriting the state of the client that replaced it.
      const report = (state: ConnectionState) => () => {
        if (!cancelled) setConnection(state);
      };
      pusher.connection.bind("connected", () => {
        if (cancelled) return;
        setConnection("online");
        setError(null);
        // Always reconcile on (re)connect — this is the recovery path.
        void reconcile();
      });
      pusher.connection.bind("connecting", report("connecting"));
      pusher.connection.bind("unavailable", report("offline"));
      pusher.connection.bind("failed", report("error"));
      pusher.connection.bind("disconnected", report("offline"));

      channel = pusher.subscribe(channelName);

      channel.bind("message", (message: ChatMessage) => {
        // Only the current conversation's messages belong in this transcript.
        if (message.conversationId !== sessionRef.current?.conversationId) return;
        applyMessages([message]);
      });
      channel.bind("typing", (payload: { typing: boolean }) => showTyping(payload.typing));
      channel.bind(
        "status",
        (payload: {
          status?: ConversationState;
          agentName?: string;
          messageId?: string;
          messageStatus?: string;
        }) => {
          if (payload.status) setStatus(payload.status);
          if (payload.agentName) setAgentName(payload.agentName);
          if (payload.messageId && payload.messageStatus) {
            setMessages((current) =>
              current.map((m) =>
                m.id === payload.messageId
                  ? { ...m, status: payload.messageStatus as ChatMessage["status"] }
                  : m,
              ),
            );
          }
        },
      );
      channel.bind("agent-joined", (payload: { agentName?: string }) => {
        setStatus("HUMAN_ACTIVE");
        if (payload.agentName) setAgentName(payload.agentName);
      });
    })().catch(() => {
      // pusher-js did not load. The panel still works over HTTP, and the poll
      // below covers agent replies.
      if (!cancelled) setConnection("offline");
    });

    return () => {
      cancelled = true;
      channel?.unbind_all();
      pusher?.unsubscribe(channelName);
      pusher?.disconnect();
    };
  }, [enabled, sessionToken, sessionConversationId, applyMessages, reconcile, showTyping]);

  /*
   * Polling fallback. Only runs when realtime is NOT connected and a human is
   * on the thread — the one case where a message can arrive with nothing on the
   * client having asked for it. With Pusher up this never fires.
   */
  useEffect(() => {
    if (!enabled) return;
    if (connection === "online") return;
    if (status !== "HUMAN_ACTIVE" && status !== "WAITING_FOR_AGENT") return;

    const id = setInterval(() => void reconcile(), 5000);
    return () => clearInterval(id);
  }, [enabled, connection, status, reconcile]);

  // Release the typing ceiling if the panel goes away mid-request.
  useEffect(
    () => () => {
      if (typingGuard.current) clearTimeout(typingGuard.current);
    },
    [],
  );

  // A tab woken from background may have missed messages while throttled.
  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => document.visibilityState === "visible" && void reconcile();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, reconcile]);

  const send = useCallback(
    async (text: string) => {
      const token = sessionRef.current?.token;
      if (!token || !text.trim()) return;

      // Optimistic echo, on a sequence above anything real, so the input feels
      // instant. The server's copy replaces it by sequence on arrival.
      const optimistic: ChatMessage = {
        id: `pending-${Date.now()}`,
        conversationId: "",
        senderType: "client",
        channel: "website",
        message: text,
        status: "pending",
        sequence: highestSequence.current + 0.5,
        actions: [],
        timestamp: new Date().toISOString(),
      };
      setMessages((current) => [...current, optimistic]);
      if (status === "AI_ACTIVE") showTyping(true);

      try {
        await sendMessage(token, text);
        setError(null);
        // Pull the result over HTTP rather than waiting for the socket. The
        // POST resolves only after the server finished the AI turn or the
        // relay, so the reply is already durable — this makes the chat work
        // correctly with realtime unconfigured or down, and realtime becomes
        // a latency optimisation rather than a dependency.
        await reconcile();
      } catch (err) {
        setMessages((current) =>
          current.map((m) => (m.id === optimistic.id ? { ...m, status: "failed" } : m)),
        );
        setError(reason(err, "That message did not send. Please try again in a moment."));
      } finally {
        showTyping(false);
      }
    },
    [status, reconcile, showTyping],
  );

  /** Submit contact details; the server captures them and hands off. */
  const submitContact = useCallback(
    async (details: { name: string; phone: string; email?: string }) => {
      const token = sessionRef.current?.token;
      if (!token) return;
      try {
        await submitLead(token, details);
        setContact({ name: details.name, phone: details.phone, email: details.email ?? null });
        setStatus("WAITING_FOR_AGENT");
        await reconcile();
      } finally {
        showTyping(false);
      }
    },
    [reconcile, showTyping],
  );

  const requestHandoff = useCallback(async () => {
    const token = sessionRef.current?.token;
    if (!token) return;
    try {
      setStatus("WAITING_FOR_AGENT");
      await setHandoff(token, "request");
      await reconcile();
    } catch (err) {
      setError(reason(err, "We could not reach the team just now. Please try again in a moment."));
    }
  }, [reconcile]);

  const declineHandoff = useCallback(async () => {
    const token = sessionRef.current?.token;
    if (!token) return;
    await setHandoff(token, "decline").catch(() => undefined);
    await reconcile();
  }, [reconcile]);

  /** Abandon this thread and start a fresh one. */
  const reset = useCallback(async () => {
    // One at a time: a double click would open two conversations and mix
    // their transcripts.
    if (resetting.current) return;
    resetting.current = true;

    // Drop the old session before asking for a new one. The realtime client
    // for the old thread is torn down on this, and nothing still arriving for
    // it can land in the new transcript.
    clearToken();
    adoptSession(null);
    highestSequence.current = 0;
    setMessages([]);
    setStatus("AI_ACTIVE");
    setAgentName(null);
    setError(null);
    setReady(false);
    setConnection("connecting");

    try {
      const started = await startSession({ region: CHAT_REGION });
      writeToken(started.token);
      adoptSession({ token: started.token, conversationId: started.conversationId });
      setStatus(started.status);
      applyMessages(started.messages);
      setReady(true);
      if (!realtimeConfig()) setConnection("offline");
    } catch (err) {
      // "error" also takes the loading dots down, which would otherwise spin
      // on an empty panel for good.
      setConnection("error");
      setError(reason(err, "We could not start a new conversation. Please try again."));
    } finally {
      resetting.current = false;
    }
  }, [applyMessages, adoptSession]);

  return useMemo(
    () => ({
      messages,
      status,
      connection,
      agentTyping,
      aiTyping,
      agentName,
      error,
      ready,
      contact,
      send,
      submitContact,
      requestHandoff,
      declineHandoff,
      reset,
    }),
    [
      messages,
      status,
      connection,
      agentTyping,
      aiTyping,
      agentName,
      error,
      ready,
      contact,
      send,
      submitContact,
      requestHandoff,
      declineHandoff,
      reset,
    ],
  );
}
