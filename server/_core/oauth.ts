import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import * as db from "../db";
import { getDb } from "../db";
import { churches, memberships, users } from "../../drizzle/schema";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

// Emergent-managed Google Auth: exchange the one-time session_id (received in
// the URL fragment after the user returns from auth.emergentagent.com) for the
// user profile, then mint our own JWT session cookie.
const SESSION_DATA_URL =
  "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data";

// For the shared preview/demo: a user without any active church membership is
// enrolled into the first demo church so the app is usable end-to-end. The very
// first member with no existing administrator becomes the administrator.
async function autoEnroll(userId: number) {
  if (process.env.DEMO_AUTOENROLL === "false") return;
  const database = await getDb();
  if (!database) return;
  const existing = await database
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, "active")))
    .limit(1);
  if (existing.length > 0) return;
  const [church] = await database.select({ id: churches.id }).from(churches).limit(1);
  if (!church) return;
  const [admin] = await database
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.churchId, church.id), eq(memberships.role, "administrator")))
    .limit(1);
  const role = admin ? "member" : "administrator";
  await database.insert(memberships).values({ churchId: church.id, userId, role }).onDuplicateKeyUpdate({ set: { status: "active" } });
  if (role === "administrator") {
    await database.update(users).set({ role: "administrator" }).where(eq(users.id, userId));
  }
}

export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/session", async (req: Request, res: Response) => {
    const sessionId: string | undefined =
      req.body?.session_id ?? req.body?.sessionId;
    if (!sessionId) {
      res.status(400).json({ error: "session_id is required" });
      return;
    }

    try {
      const resp = await fetch(SESSION_DATA_URL, {
        headers: { "X-Session-ID": sessionId },
      });
      if (!resp.ok) {
        res.status(401).json({ error: "invalid session" });
        return;
      }
      const data = (await resp.json()) as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      const openId = String(data.id).slice(0, 64);
      await db.upsertUser({
        openId,
        name: data.name ?? null,
        email: data.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (user) await autoEnroll(user.id);

      const sessionToken = await sdk.createSessionToken(openId, {
        name: data.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        success: true,
        user: {
          openId,
          name: data.name,
          email: data.email,
          picture: data.picture ?? null,
        },
      });
    } catch (error) {
      console.error("[Auth] session exchange failed", error);
      res.status(500).json({ error: "auth failed" });
    }
  });
}
