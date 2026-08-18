import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { AppRole, User } from "../drizzle/schema";
import { memberships } from "../drizzle/schema";
import { getDb } from "./db";

export const capabilities = [
  "view_member_area",
  "manage_church",
  "manage_members",
  "manage_bible",
  "manage_ebd",
  "manage_events",
  "manage_communications",
  "manage_content",
  "manage_connections",
  "manage_gallery",
  "manage_prayers",
  "view_pastoral",
  "view_metrics",
] as const;

export type Capability = (typeof capabilities)[number];

const capabilityRoles: Record<Capability, readonly AppRole[]> = {
  view_member_area: ["administrator", "pastor", "member"],
  manage_church: ["administrator"],
  manage_members: ["administrator"],
  manage_bible: ["administrator"],
  manage_ebd: ["administrator"],
  manage_events: ["administrator"],
  manage_communications: ["administrator"],
  manage_content: ["administrator"],
  manage_connections: ["administrator"],
  manage_gallery: ["administrator"],
  manage_prayers: ["administrator", "pastor"],
  view_pastoral: ["pastor"],
  view_metrics: ["administrator", "pastor"],
};

export async function getChurchRole(user: User, churchId: number): Promise<AppRole> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de dados indisponível." });

  const [membership] = await db
    .select({ role: memberships.role, status: memberships.status })
    .from(memberships)
    .where(and(eq(memberships.churchId, churchId), eq(memberships.userId, user.id)))
    .limit(1);

  if (!membership || membership.status !== "active") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Não possui acesso a esta igreja." });
  }

  return membership.role;
}

export async function requireChurchCapability(user: User, churchId: number, capability: Capability): Promise<AppRole> {
  const role = await getChurchRole(user, churchId);
  if (!capabilityRoles[capability].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "O seu perfil não tem permissão para esta ação." });
  }
  return role;
}

export function canAccessRole(role: AppRole, capability: Capability): boolean {
  return capabilityRoles[capability].includes(role);
}
