import jwt from "jsonwebtoken";
import { getEnv } from "../config/env";

/* ═══════════════════════════════════════════════════════════════════════════
   TOKENS

   Separate audiences, so that no token can be mistaken for another kind — an
   anonymous visitor's for an agent's above all:

     chat         — issued to a browser when a conversation starts. Proves
                    ownership of exactly one conversationId. No account, no
                    password.
     agent        — issued at dashboard login. Carries a real Agent id and role.
     agent-device — set as a cookie at dashboard login. Marks a browser the
                    agent has signed in on, which exempts it from the
                    per-account login limit. Grants no access by itself.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ChatToken {
  aud: "chat";
  conversationId: string;
  clientId: string;
}

export interface AgentToken {
  aud: "agent";
  agentId: string;
  role: "agent" | "admin";
}

export interface DeviceToken {
  aud: "agent-device";
  agentId: string;
}

export function signChatToken(payload: Omit<ChatToken, "aud">): string {
  return jwt.sign({ ...payload, aud: "chat" }, getEnv().JWT_SECRET, { expiresIn: "7d" });
}

export function signAgentToken(payload: Omit<AgentToken, "aud">): string {
  return jwt.sign({ ...payload, aud: "agent" }, getEnv().JWT_SECRET, { expiresIn: "12h" });
}

export function signDeviceToken(payload: Omit<DeviceToken, "aud">): string {
  return jwt.sign({ ...payload, aud: "agent-device" }, getEnv().JWT_SECRET, { expiresIn: "90d" });
}

function verify<T extends { aud: string }>(token: string, audience: T["aud"]): T | null {
  try {
    const decoded = jwt.verify(token, getEnv().JWT_SECRET) as T;
    // Checking the audience is what stops a chat token being replayed against
    // an agent endpoint.
    return decoded.aud === audience ? decoded : null;
  } catch {
    return null;
  }
}

export const verifyChatToken = (token: string) => verify<ChatToken>(token, "chat");
export const verifyAgentToken = (token: string) => verify<AgentToken>(token, "agent");
export const verifyDeviceToken = (token: string) => verify<DeviceToken>(token, "agent-device");

/** Pull a bearer token off a request, or null. */
export function bearerFrom(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}
