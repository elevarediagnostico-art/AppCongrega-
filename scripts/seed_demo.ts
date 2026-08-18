import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { sdk } from "../server/_core/sdk";
import {
  announcements,
  biblePlans,
  bibleReadings,
  churches,
  dailyDevotionals,
  events,
  memberships,
  userBiblePlanEnrollments,
  users,
} from "../drizzle/schema";

const dateKey = (d = new Date()) => d.toISOString().slice(0, 10);

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable — check DATABASE_URL");

  // Church ------------------------------------------------------------------
  await db
    .insert(churches)
    .values({
      slug: "congrega-demo",
      name: "Comunidade CONGREGA",
      description: "Igreja de demonstração da plataforma CONGREGA.",
      welcomeMessage: "Que a sua jornada seja abençoada.",
      timezone: "America/Sao_Paulo",
      planTier: "community",
      memberLimit: 500,
    })
    .onDuplicateKeyUpdate({ set: { name: "Comunidade CONGREGA" } });
  const [church] = await db.select().from(churches).where(eq(churches.slug, "congrega-demo")).limit(1);

  // Users -------------------------------------------------------------------
  const people = [
    { openId: "admin-demo", name: "Ana Administradora", email: "admin@congrega.demo", role: "administrator" as const },
    { openId: "pastor-demo", name: "Paulo Pastor", email: "pastor@congrega.demo", role: "pastor" as const },
    { openId: "member-demo", name: "Marcos Membro", email: "member@congrega.demo", role: "member" as const },
  ];

  const tokens: Record<string, string> = {};
  for (const p of people) {
    await db
      .insert(users)
      .values({ openId: p.openId, name: p.name, email: p.email, loginMethod: "google", role: p.role })
      .onDuplicateKeyUpdate({ set: { name: p.name, email: p.email, role: p.role } });
    const [u] = await db.select().from(users).where(eq(users.openId, p.openId)).limit(1);
    await db
      .insert(memberships)
      .values({ churchId: church.id, userId: u.id, role: p.role, status: "active" })
      .onDuplicateKeyUpdate({ set: { role: p.role, status: "active" } });
    tokens[p.openId] = await sdk.createSessionToken(p.openId, { name: p.name });
  }

  const [admin] = await db.select().from(users).where(eq(users.openId, "admin-demo")).limit(1);

  // Bible plan --------------------------------------------------------------
  const existingPlan = await db
    .select()
    .from(biblePlans)
    .where(and(eq(biblePlans.churchId, church.id), eq(biblePlans.isOfficial, true)))
    .limit(1);
  if (existingPlan.length === 0) {
    const planResult = await db.insert(biblePlans).values({
      churchId: church.id,
      name: "Plano Bíblico Anual",
      description: "Uma leitura por dia para caminhar na Palavra ao longo do ano.",
      totalDays: 5,
      isOfficial: true,
      status: "active",
    });
    const planId = Number(planResult[0].insertId);
    await db.insert(bibleReadings).values([
      { planId, dayNumber: 1, reference: "Gênesis 1", bookTitle: "Gênesis", introduction: "O princípio de todas as coisas." },
      { planId, dayNumber: 2, reference: "Salmos 1", bookTitle: "Salmos", introduction: "O caminho do justo." },
      { planId, dayNumber: 3, reference: "João 1", bookTitle: "João", introduction: "O Verbo se fez carne." },
      { planId, dayNumber: 4, reference: "Provérbios 3", bookTitle: "Provérbios", introduction: "Confia no Senhor de todo o coração." },
      { planId, dayNumber: 5, reference: "Romanos 8", bookTitle: "Romanos", introduction: "Nenhuma condenação para os que estão em Cristo." },
    ]);
  }

  // Enroll all demo users in the official plan so the journey works out of the box.
  const [officialPlan] = await db
    .select()
    .from(biblePlans)
    .where(and(eq(biblePlans.churchId, church.id), eq(biblePlans.isOfficial, true)))
    .limit(1);
  if (officialPlan) {
    for (const p of people) {
      const [u] = await db.select().from(users).where(eq(users.openId, p.openId)).limit(1);
      await db
        .insert(userBiblePlanEnrollments)
        .values({ planId: officialPlan.id, userId: u.id, mode: "official", isActive: true })
        .onDuplicateKeyUpdate({ set: { isActive: true } });
    }
  }

  // Today's devotional ------------------------------------------------------
  await db
    .insert(dailyDevotionals)
    .values({
      churchId: church.id,
      authorUserId: admin.id,
      dateKey: dateKey(),
      title: "A constância de cada dia",
      bibleReference: "Lamentações 3:22-23",
      reflection:
        "As misericórdias do Senhor se renovam a cada manhã. Grande é a Sua fidelidade. Que hoje você encontre forças para dar mais um passo na sua caminhada com Deus, confiando que Ele cuida de cada detalhe do seu dia.",
      application: "Reserve cinco minutos hoje para agradecer por três coisas concretas.",
      status: "published",
      publishedAt: new Date(),
    })
    .onDuplicateKeyUpdate({ set: { status: "published" } });

  // Event + announcement ----------------------------------------------------
  const evtCount = await db.select().from(events).where(eq(events.churchId, church.id)).limit(1);
  if (evtCount.length === 0) {
    const next = new Date();
    next.setDate(next.getDate() + 3);
    await db.insert(events).values({
      churchId: church.id,
      createdByUserId: admin.id,
      title: "Culto de Celebração",
      description: "Um encontro para louvar e ouvir a Palavra juntos.",
      startsAt: next,
      location: "Templo Sede",
      status: "published",
    });
  }
  const annCount = await db.select().from(announcements).where(eq(announcements.churchId, church.id)).limit(1);
  if (annCount.length === 0) {
    await db.insert(announcements).values({
      churchId: church.id,
      authorUserId: admin.id,
      title: "Bem-vindo ao CONGREGA",
      content: "Estamos felizes por você fazer parte da nossa comunidade. Explore a sua jornada diária!",
      status: "published",
      publishedAt: new Date(),
    });
  }

  console.log("\n=== SEED COMPLETO ===");
  console.log("Church:", church.name, "id:", church.id, "slug:", church.slug);
  console.log("\nSession tokens (use como cookie 'app_session_id' ou header Bearer):");
  for (const p of people) console.log(`- ${p.role.padEnd(14)} ${p.email}\n    ${tokens[p.openId]}`);
  console.log("\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
