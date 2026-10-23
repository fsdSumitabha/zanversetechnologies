import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDatabase } from "@/server/config/db";
import { isProduction } from "@/server/config/env";
import { Agent } from "@/server/models/Agent";
import { signAgentToken, signDeviceToken, verifyDeviceToken } from "@/server/lib/tokens";
import { clearRateLimit, clientIp, rateLimit } from "@/server/lib/rateLimit";
import { fail, ok, parseBody, route, tooMany } from "@/server/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/**
 * Marks a browser an agent has signed in on before — OWASP's "device cookie".
 *
 * The per-account limit below counts every attempt, so without it anyone could
 * lock an agent out for 15 minutes by sending ten wrong passwords for their
 * email. A browser carrying that agent's own device token skips the limit, so
 * the lockout lands only on browsers the agent has never used.
 */
const DEVICE_COOKIE = "zan_agent_device";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

/** The per-account window, shared by the limit and its reset. */
const ACCOUNT_WINDOW_SECONDS = 900;

/** POST /api/agent/login/ */
export const POST = route(async (request: Request) => {
  // Strict: this is the one endpoint worth brute-forcing. Skipped only when
  // the host sets no trusted IP header — one shared bucket would lock every
  // agent out at once — and the per-account limit still applies.
  const ip = clientIp(request);
  if (ip) {
    const limit = await rateLimit(ip, "login", 10, 600);
    if (!limit.allowed) return tooMany(limit.retryAfterSeconds);
  }

  const parsed = await parseBody(request, bodySchema);
  if (!parsed.ok) return parsed.response;
  const email = parsed.data.email.toLowerCase();

  await connectDatabase();
  const agent = await Agent.findOne({ email }).select("+passwordHash");

  // Per account as well, so guesses spread across many IPs still run out.
  // Every attempt is counted up front: counting only failures would let a
  // burst of parallel guesses all pass the check before any of them failed.
  // Unknown emails are counted the same way, so a 429 reveals nothing.
  if (!(agent && (await isTrustedDevice(String(agent._id))))) {
    const perAccount = await rateLimit(email, "login-email", 10, ACCOUNT_WINDOW_SECONDS);
    if (!perAccount.allowed) return tooMany(perAccount.retryAfterSeconds);
  }

  // Compare against a dummy hash when the account does not exist, so response
  // time does not reveal which emails are registered.
  const hash = agent?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const valid = await bcrypt.compare(parsed.data.password, hash);

  if (!agent || !valid) return fail(401, "Invalid email or password");

  // The agent's own sign-ins must not add up towards their lockout.
  await clearRateLimit(email, "login-email", ACCOUNT_WINDOW_SECONDS);

  (await cookies()).set(DEVICE_COOKIE, signDeviceToken({ agentId: String(agent._id) }), {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    // Sent only to the one route that reads it.
    path: "/api/agent/login",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  });

  return ok({
    token: signAgentToken({ agentId: String(agent._id), role: agent.role as "agent" | "admin" }),
    agent: {
      id: String(agent._id),
      name: agent.name,
      email: agent.email,
      role: agent.role,
      isAvailable: agent.isAvailable,
    },
  });
});

/** True when this browser carries a device token issued to this agent. */
async function isTrustedDevice(agentId: string): Promise<boolean> {
  const token = (await cookies()).get(DEVICE_COOKIE)?.value;
  return token ? verifyDeviceToken(token)?.agentId === agentId : false;
}
