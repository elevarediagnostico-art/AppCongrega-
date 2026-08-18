import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, gte, inArray, lt, lte, or, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  activityEvents, albums, announcements, attendances, biblePlans, bibleReadings, churches, churchContents,
  dailyDevotionals, ebdClasses, ebdEnrollments, ebdLessons, ebdMagazineLessons, ebdMagazines, eventRegistrations,
  events, experienceFeedback, experienceRecognitions, memberships, milestones, notificationPreferences, pastoralSignals, personalCommitments, photos, prayerRequests,
  professionalListings, userBiblePlanEnrollments, userBibleProgress, userMilestones, users,
} from "../drizzle/schema";
import { getDb } from "./db";
import { requireChurchCapability } from "./rbac";
import { storagePut } from "./storage";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getCatalogDevotional } from "./devotionalCatalog";

const churchInput = z.object({ churchId: z.number().int().positive() });
const contentStatus = z.enum(["draft", "scheduled", "published", "archived"]);
const dateKey = (value = new Date()) => value.toISOString().slice(0, 10);

async function dbOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de dados indisponível." });
  return db;
}

async function assertChurch(user: NonNullable<Parameters<typeof requireChurchCapability>[0]>, churchId: number) {
  return requireChurchCapability(user, churchId, "view_member_area");
}

async function activity(churchId: number, userId: number, action: "bible_read" | "devotional_view" | "attendance" | "event_registration" | "gallery_view" | "prayer_request", entityType?: string, entityId?: number) {
  const db = await dbOrThrow();
  await db.insert(activityEvents).values({ churchId, userId, action, entityType, entityId });
}

async function unlockMilestones(churchId: number, userId: number) {
  const db = await dbOrThrow();
  const [readings, attendance, eventsJoined] = await Promise.all([
    db.select({ total: count() }).from(userBibleProgress).innerJoin(userBiblePlanEnrollments, eq(userBibleProgress.enrollmentId, userBiblePlanEnrollments.id)).innerJoin(biblePlans, eq(userBiblePlanEnrollments.planId, biblePlans.id)).where(and(eq(userBiblePlanEnrollments.userId, userId), eq(biblePlans.churchId, churchId))),
    db.select({ total: count() }).from(attendances).where(eq(attendances.userId, userId)),
    db.select({ total: count() }).from(eventRegistrations).where(and(eq(eventRegistrations.userId, userId), eq(eventRegistrations.status, "confirmed"))),
  ]);
  const totals = { readings: Number(readings[0]?.total ?? 0), attendance: Number(attendance[0]?.total ?? 0), events: Number(eventsJoined[0]?.total ?? 0) };
  const available = await db.select().from(milestones).where(and(eq(milestones.churchId, churchId), eq(milestones.isActive, true)));
  for (const item of available) {
    const value = item.triggerType === "readings_completed" ? totals.readings : item.triggerType === "attendances" ? totals.attendance : item.triggerType === "events_joined" ? totals.events : 0;
    if (value >= item.threshold) {
      await db.insert(userMilestones).values({ milestoneId: item.id, userId }).onDuplicateKeyUpdate({ set: { milestoneId: item.id } });
    }
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  church: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow();
      return db.select({ id: churches.id, slug: churches.slug, name: churches.name, logoUrl: churches.logoUrl, primaryColor: churches.primaryColor, secondaryColor: churches.secondaryColor, coverImageUrl: churches.coverImageUrl, welcomeMessage: churches.welcomeMessage, timezone: churches.timezone, planTier: churches.planTier, memberLimit: churches.memberLimit, role: memberships.role })
        .from(memberships).innerJoin(churches, eq(memberships.churchId, churches.id))
        .where(and(eq(memberships.userId, ctx.user.id), eq(memberships.status, "active"), eq(churches.isActive, true)));
    }),
    create: protectedProcedure.input(z.object({ name: z.string().min(3).max(180), slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/), timezone: z.string().min(3).max(64) })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "administrator") throw new TRPCError({ code: "FORBIDDEN", message: "Apenas o Administrador pode iniciar a igreja." });
      const db = await dbOrThrow();
      const result = await db.insert(churches).values({ ...input });
      const churchId = Number(result[0].insertId);
      await db.insert(memberships).values({ churchId, userId: ctx.user.id, role: "administrator" });
      return { churchId };
    }),
    updateBranding: protectedProcedure.input(churchInput.extend({ name: z.string().min(3).max(180), logoUrl: z.string().url().optional(), primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/), secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/), coverImageUrl: z.string().url().optional(), welcomeMessage: z.string().max(320).optional() })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_church"); const db = await dbOrThrow(); await db.update(churches).set({ name: input.name, logoUrl: input.logoUrl, primaryColor: input.primaryColor, secondaryColor: input.secondaryColor, coverImageUrl: input.coverImageUrl, welcomeMessage: input.welcomeMessage }).where(eq(churches.id, input.churchId)); return { success: true }; }),
  }),
  member: router({
    home: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const today = dateKey();
      const [devotional, plan, upcoming, notices, milestoneTotal] = await Promise.all([
        db.select().from(dailyDevotionals).where(and(eq(dailyDevotionals.churchId, input.churchId), eq(dailyDevotionals.dateKey, today), eq(dailyDevotionals.status, "published"))).limit(1),
        db.select().from(biblePlans).where(and(eq(biblePlans.churchId, input.churchId), eq(biblePlans.status, "active"), eq(biblePlans.isOfficial, true))).limit(1),
        db.select().from(events).where(and(eq(events.churchId, input.churchId), eq(events.status, "published"), gte(events.startsAt, new Date()))).orderBy(asc(events.startsAt)).limit(3),
        db.select().from(announcements).where(and(eq(announcements.churchId, input.churchId), eq(announcements.status, "published"))).orderBy(desc(announcements.publishedAt)).limit(3),
        db.select({ total: count() }).from(userMilestones).where(eq(userMilestones.userId, ctx.user.id)),
      ]);
      let reading: typeof bibleReadings.$inferSelect | null = null; let progress = { completed: 0, total: 0, streak: 0, isComplete: false };
      if (plan[0]) {
        const allReadings = await db.select().from(bibleReadings).where(eq(bibleReadings.planId, plan[0].id)).orderBy(asc(bibleReadings.dayNumber));
        const [enrollment] = await db.select().from(userBiblePlanEnrollments).where(and(eq(userBiblePlanEnrollments.planId, plan[0].id), eq(userBiblePlanEnrollments.userId, ctx.user.id), eq(userBiblePlanEnrollments.isActive, true))).limit(1);
        if (enrollment) {
          const completed = await db.select().from(userBibleProgress).where(eq(userBibleProgress.enrollmentId, enrollment.id));
          const doneIds = new Set(completed.map(item => item.readingId));
          reading = allReadings.find(item => !doneIds.has(item.id)) ?? null;
          let cursor = new Date(); let streak = 0; const dates = new Set(completed.map(item => dateKey(item.completedAt)));
          while (dates.has(dateKey(cursor))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
          progress = { completed: completed.length, total: allReadings.length, streak, isComplete: reading === null && allReadings.length > 0 };
        } else reading = allReadings[0] ?? null;
      }
      const devotionalEntry = devotional[0] ?? getCatalogDevotional(new Date());
      return { devotional: devotionalEntry, plan: plan[0] ?? null, reading, progress, upcoming, notices, milestones: Number(milestoneTotal[0]?.total ?? 0) };
    }),
    dailyDevotional: protectedProcedure.input(churchInput.extend({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() })).query(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId);
      const requestedDate = input.date ? new Date(`${input.date}T12:00:00.000Z`) : new Date();
      const db = await dbOrThrow();
      const [published] = await db.select().from(dailyDevotionals).where(and(eq(dailyDevotionals.churchId, input.churchId), eq(dailyDevotionals.dateKey, dateKey(requestedDate)), eq(dailyDevotionals.status, "published"))).limit(1);
      return published ?? getCatalogDevotional(requestedDate);
    }),
  }),
  bible: router({
    enroll: protectedProcedure.input(z.object({ churchId: z.number().int().positive(), planId: z.number().int().positive(), mode: z.enum(["official", "personal"]) })).mutation(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow();
      const [plan] = await db.select().from(biblePlans).where(and(eq(biblePlans.id, input.planId), eq(biblePlans.churchId, input.churchId))).limit(1);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plano Bíblico não encontrado." });
      await db.insert(userBiblePlanEnrollments).values({ planId: plan.id, userId: ctx.user.id, mode: input.mode }).onDuplicateKeyUpdate({ set: { isActive: true } });
      return { success: true };
    }),
    complete: protectedProcedure.input(z.object({ churchId: z.number().int().positive(), readingId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow();
      const [reading] = await db.select().from(bibleReadings).innerJoin(biblePlans, eq(bibleReadings.planId, biblePlans.id)).where(and(eq(bibleReadings.id, input.readingId), eq(biblePlans.churchId, input.churchId))).limit(1);
      if (!reading) throw new TRPCError({ code: "NOT_FOUND", message: "Leitura não encontrada." });
      const [enrollment] = await db.select().from(userBiblePlanEnrollments).where(and(eq(userBiblePlanEnrollments.userId, ctx.user.id), eq(userBiblePlanEnrollments.planId, reading.bible_readings.planId), eq(userBiblePlanEnrollments.isActive, true))).limit(1);
      if (!enrollment) throw new TRPCError({ code: "BAD_REQUEST", message: "Inscreva-se no Plano Bíblico antes de concluir uma leitura." });
      await db.insert(userBibleProgress).values({ enrollmentId: enrollment.id, readingId: input.readingId, completedAt: new Date() }).onDuplicateKeyUpdate({ set: { completedAt: new Date() } });
      await activity(input.churchId, ctx.user.id, "bible_read", "bible_reading", input.readingId); await unlockMilestones(input.churchId, ctx.user.id); return { success: true };
    }),
  }),
  content: router({
    list: protectedProcedure.input(churchInput.extend({ type: z.string().optional() })).query(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow();
      return db.select().from(churchContents).where(and(eq(churchContents.churchId, input.churchId), eq(churchContents.status, "published"))).orderBy(desc(churchContents.publishedAt));
    }),
    create: protectedProcedure.input(churchInput.extend({ type: z.enum(["devotional", "reflection", "study", "pastoral_word", "guidance", "campaign", "weekly_word", "special"]), title: z.string().min(3).max(180), excerpt: z.string().max(600).optional(), body: z.string().min(3), imageUrl: z.string().url().optional(), audience: z.enum(["church", "youth", "women", "men", "ebd", "leadership", "class"]), classId: z.number().int().positive().optional(), status: contentStatus, scheduledAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_content"); const db = await dbOrThrow();
      const publishedAt = input.status === "published" ? new Date() : undefined;
      const result = await db.insert(churchContents).values({ churchId: input.churchId, authorUserId: ctx.user.id, contentType: input.type, title: input.title, excerpt: input.excerpt, content: input.body, imageUrl: input.imageUrl, audienceType: input.audience, audienceClassId: input.classId, status: input.status, scheduledAt: input.scheduledAt, publishedAt });
      return { id: Number(result[0].insertId) };
    }),
  }),
  community: router({
    personalCommitments: protectedProcedure.input(churchInput.extend({ from: z.date().optional() })).query(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const from = input.from ?? new Date();
      return db.select().from(personalCommitments).where(and(eq(personalCommitments.churchId, input.churchId), eq(personalCommitments.userId, ctx.user.id), gte(personalCommitments.startsAt, from))).orderBy(asc(personalCommitments.startsAt));
    }),
    createPersonalCommitment: protectedProcedure.input(churchInput.extend({ title: z.string().trim().min(1).max(180), description: z.string().trim().max(1000).optional(), startsAt: z.date(), endsAt: z.date().optional(), recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none") })).mutation(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); if (input.endsAt && input.endsAt <= input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "A hora de fim deve ser depois da hora de início." }); const db = await dbOrThrow();
      const result = await db.insert(personalCommitments).values({ churchId: input.churchId, userId: ctx.user.id, title: input.title, description: input.description || null, startsAt: input.startsAt, endsAt: input.endsAt, recurrence: input.recurrence }); return { id: Number(result[0].insertId) };
    }),
    updatePersonalCommitment: protectedProcedure.input(churchInput.extend({ id: z.number().int().positive(), title: z.string().trim().min(1).max(180), description: z.string().trim().max(1000).optional(), startsAt: z.date(), endsAt: z.date().optional(), recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none") })).mutation(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); if (input.endsAt && input.endsAt <= input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "A hora de fim deve ser depois da hora de início." }); const db = await dbOrThrow();
      const result = await db.update(personalCommitments).set({ title: input.title, description: input.description || null, startsAt: input.startsAt, endsAt: input.endsAt, recurrence: input.recurrence }).where(and(eq(personalCommitments.id, input.id), eq(personalCommitments.churchId, input.churchId), eq(personalCommitments.userId, ctx.user.id))); if (!result[0].affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Compromisso não encontrado." }); return { success: true };
    }),
    deletePersonalCommitment: protectedProcedure.input(churchInput.extend({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const result = await db.delete(personalCommitments).where(and(eq(personalCommitments.id, input.id), eq(personalCommitments.churchId, input.churchId), eq(personalCommitments.userId, ctx.user.id))); if (!result[0].affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Compromisso não encontrado." }); return { success: true };
    }),
    events: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(events).where(and(eq(events.churchId, input.churchId), eq(events.status, "published"))).orderBy(asc(events.startsAt)); }),
    confirmEvent: protectedProcedure.input(churchInput.extend({ eventId: z.number().int().positive(), status: z.enum(["confirmed", "cancelled"]).default("confirmed") })).mutation(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const [event] = await db.select({ id: events.id, requiresRegistration: events.requiresRegistration }).from(events).where(and(eq(events.id, input.eventId), eq(events.churchId, input.churchId), eq(events.status, "published"))).limit(1); if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Evento não encontrado." }); await db.insert(eventRegistrations).values({ eventId: input.eventId, userId: ctx.user.id, status: input.status }).onDuplicateKeyUpdate({ set: { status: input.status } }); if (input.status === "confirmed") await activity(input.churchId, ctx.user.id, "event_registration", "event", input.eventId); return { success: true, status: input.status }; }),
    calendar: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const now = new Date();
      const [eventItems, contentItems, personalItems] = await Promise.all([
        db.select({ id: events.id, title: events.title, description: events.description, startsAt: events.startsAt, location: events.location, requiresRegistration: events.requiresRegistration }).from(events).where(and(eq(events.churchId, input.churchId), eq(events.status, "published"), gte(events.startsAt, now))).orderBy(asc(events.startsAt)),
        db.select({ id: churchContents.id, title: churchContents.title, description: churchContents.excerpt, startsAt: churchContents.scheduledAt, contentType: churchContents.contentType }).from(churchContents).where(and(eq(churchContents.churchId, input.churchId), or(eq(churchContents.status, "published"), and(eq(churchContents.status, "scheduled"), lte(churchContents.scheduledAt, now))))).orderBy(asc(churchContents.scheduledAt)),
        db.select().from(personalCommitments).where(and(eq(personalCommitments.churchId, input.churchId), eq(personalCommitments.userId, ctx.user.id), gte(personalCommitments.startsAt, now))).orderBy(asc(personalCommitments.startsAt)),
      ]);
      return [
        ...eventItems.map(item => ({ ...item, kind: "event" as const })),
        ...contentItems.filter(item => item.startsAt).map(item => ({ ...item, kind: "content" as const, location: null, requiresRegistration: false })),
        ...personalItems.map(item => ({ id: item.id, title: item.title, description: item.description, startsAt: item.startsAt, location: null, requiresRegistration: false, kind: "personal" as const, recurrence: item.recurrence })),
      ].sort((a, b) => Number(a.startsAt) - Number(b.startsAt));
    }),
    announcements: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(announcements).where(and(eq(announcements.churchId, input.churchId), eq(announcements.status, "published"))).orderBy(desc(announcements.publishedAt)); }),
    albums: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(albums).where(and(eq(albums.churchId, input.churchId), eq(albums.status, "published"))).orderBy(desc(albums.createdAt)); }),
    albumPhotos: protectedProcedure.input(churchInput.extend({ albumId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select({ id: photos.id, url: photos.url, title: photos.title, caption: photos.caption, filename: photos.filename, createdAt: photos.createdAt, allowDownloads: albums.allowDownloads, albumTitle: albums.title }).from(photos).innerJoin(albums, eq(photos.albumId, albums.id)).where(and(eq(albums.id, input.albumId), eq(albums.churchId, input.churchId), eq(albums.status, "published"), eq(photos.status, "published"))).orderBy(desc(photos.createdAt)); }),
    createAlbum: protectedProcedure.input(churchInput.extend({ title: z.string().min(3).max(180), description: z.string().max(1000).optional(), allowDownloads: z.boolean().default(true) })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_gallery"); const db = await dbOrThrow(); const result = await db.insert(albums).values({ churchId: input.churchId, authorUserId: ctx.user.id, title: input.title, description: input.description, allowDownloads: input.allowDownloads, status: "published" }); return { id: Number(result[0].insertId) }; }),
    uploadPhoto: protectedProcedure.input(churchInput.extend({ albumId: z.number().int().positive(), filename: z.string().min(1).max(255), mimeType: z.literal("image/webp"), dataBase64: z.string().min(32), thumbnailDataBase64: z.string().min(32).optional(), originalBytes: z.number().int().positive().max(10 * 1024 * 1024), width: z.number().int().positive().max(6000), height: z.number().int().positive().max(6000), caption: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_gallery"); const db = await dbOrThrow(); const [album] = await db.select().from(albums).where(and(eq(albums.id, input.albumId), eq(albums.churchId, input.churchId))).limit(1); if (!album) throw new TRPCError({ code: "NOT_FOUND", message: "Álbum não encontrado." });
      const raw = input.dataBase64.replace(/^data:[^;]+;base64,/, ""); const bytes = Buffer.from(raw, "base64"); if (bytes.byteLength > 4 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "A foto otimizada deve ter no máximo 4 MB." });
      const thumbnailBytes = input.thumbnailDataBase64 ? Buffer.from(input.thumbnailDataBase64.replace(/^data:[^;]+;base64,/, ""), "base64") : undefined; if (thumbnailBytes && thumbnailBytes.byteLength > 512 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "A miniatura excede o tamanho permitido." });
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.[^.]+$/, "") || "foto"; const prefix = `churches/${input.churchId}/albums/${input.albumId}/${Date.now()}-${safeName}`; const stored = await storagePut(`${prefix}.webp`, bytes, input.mimeType); const thumbnail = thumbnailBytes ? await storagePut(`${prefix}-thumb.webp`, thumbnailBytes, input.mimeType) : undefined;
      const result = await db.insert(photos).values({ albumId: input.albumId, uploadedByUserId: ctx.user.id, storageKey: stored.key, url: stored.url, thumbnailStorageKey: thumbnail?.key, thumbnailUrl: thumbnail?.url, filename: input.filename, mimeType: input.mimeType, originalBytes: input.originalBytes, optimizedBytes: bytes.byteLength, width: input.width, height: input.height, caption: input.caption }); return { id: Number(result[0].insertId), url: stored.url };
    }),
  }),
  ebd: router({
    classes: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(ebdClasses).where(and(eq(ebdClasses.churchId, input.churchId), eq(ebdClasses.isActive, true))); }),
    magazines: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(ebdMagazines).where(and(eq(ebdMagazines.churchId, input.churchId), eq(ebdMagazines.status, "published"))).orderBy(desc(ebdMagazines.createdAt)); }),
    magazineLessons: protectedProcedure.input(churchInput.extend({ magazineId: z.number().int().positive() })).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const [magazine] = await db.select({ id: ebdMagazines.id }).from(ebdMagazines).where(and(eq(ebdMagazines.id, input.magazineId), eq(ebdMagazines.churchId, input.churchId), eq(ebdMagazines.status, "published"))).limit(1); if (!magazine) throw new TRPCError({ code: "NOT_FOUND", message: "Revista EBD não encontrada." }); return db.select().from(ebdMagazineLessons).where(eq(ebdMagazineLessons.magazineId, input.magazineId)).orderBy(asc(ebdMagazineLessons.lessonNumber)); }),
    myAttendance: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select({ checkedInAt: attendances.checkedInAt, className: ebdClasses.name, lessonTitle: ebdLessons.title }).from(attendances).innerJoin(ebdClasses, eq(attendances.classId, ebdClasses.id)).innerJoin(ebdLessons, eq(attendances.lessonId, ebdLessons.id)).where(and(eq(ebdClasses.churchId, input.churchId), eq(attendances.userId, ctx.user.id))).orderBy(desc(attendances.checkedInAt)); }),
    checkIn: protectedProcedure.input(z.object({ churchId: z.number().int().positive(), token: z.string().min(16).max(96) })).mutation(async ({ ctx, input }) => {
      await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const [lessonRow] = await db.select().from(ebdLessons).innerJoin(ebdClasses, eq(ebdLessons.classId, ebdClasses.id)).where(and(eq(ebdLessons.checkInToken, input.token), eq(ebdClasses.churchId, input.churchId))).limit(1);
      if (!lessonRow || lessonRow.ebd_lessons.status !== "open") throw new TRPCError({ code: "BAD_REQUEST", message: "Este QR Code não está disponível para check-in." });
      const [enrolled] = await db.select().from(ebdEnrollments).where(and(eq(ebdEnrollments.classId, lessonRow.ebd_lessons.classId), eq(ebdEnrollments.userId, ctx.user.id), eq(ebdEnrollments.status, "active"))).limit(1); if (!enrolled) throw new TRPCError({ code: "FORBIDDEN", message: "Não está inscrito nesta classe de EBD." });
      await db.insert(attendances).values({ lessonId: lessonRow.ebd_lessons.id, classId: lessonRow.ebd_lessons.classId, userId: ctx.user.id, method: "qr" }).onDuplicateKeyUpdate({ set: { checkedInAt: new Date() } }); await activity(input.churchId, ctx.user.id, "attendance", "ebd_lesson", lessonRow.ebd_lessons.id); await unlockMilestones(input.churchId, ctx.user.id); return { success: true, lessonTitle: lessonRow.ebd_lessons.title };
    }),
  }),
  care: router({
    createPrayer: protectedProcedure.input(churchInput.extend({ content: z.string().min(5).max(5000), visibility: z.enum(["leadership", "authorized_leadership", "community"]) })).mutation(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const result = await db.insert(prayerRequests).values({ churchId: input.churchId, authorUserId: ctx.user.id, content: input.content, visibility: input.visibility }); await activity(input.churchId, ctx.user.id, "prayer_request", "prayer_request", Number(result[0].insertId)); return { id: Number(result[0].insertId) }; }),
    myPrayers: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(prayerRequests).where(and(eq(prayerRequests.churchId, input.churchId), eq(prayerRequests.authorUserId, ctx.user.id))).orderBy(desc(prayerRequests.createdAt)); }),
    leadershipPrayers: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_prayers"); const db = await dbOrThrow(); return db.select().from(prayerRequests).where(eq(prayerRequests.churchId, input.churchId)).orderBy(desc(prayerRequests.createdAt)); }),
    updatePrayerStatus: protectedProcedure.input(churchInput.extend({ requestId: z.number().int().positive(), status: z.enum(["new", "in_follow_up", "completed"]) })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_prayers"); const db = await dbOrThrow(); await db.update(prayerRequests).set({ status: input.status, handledByUserId: ctx.user.id, statusUpdatedAt: new Date() }).where(and(eq(prayerRequests.id, input.requestId), eq(prayerRequests.churchId, input.churchId))); return { success: true }; }),
    pastoralSignals: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "view_pastoral"); const db = await dbOrThrow(); return db.select({ id: pastoralSignals.id, signalType: pastoralSignals.signalType, observation: pastoralSignals.observation, status: pastoralSignals.status, calculatedAt: pastoralSignals.calculatedAt, memberName: users.name }).from(pastoralSignals).innerJoin(users, eq(pastoralSignals.userId, users.id)).where(eq(pastoralSignals.churchId, input.churchId)).orderBy(desc(pastoralSignals.calculatedAt)); }),
    recalculatePastoralSignals: protectedProcedure.input(churchInput).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "view_pastoral"); const db = await dbOrThrow(); const end = new Date(); const recentStart = new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000); const previousStart = new Date(end.getTime() - 56 * 24 * 60 * 60 * 1000);
      const members = await db.select({ userId: memberships.userId }).from(memberships).where(and(eq(memberships.churchId, input.churchId), eq(memberships.status, "active")));
      const [recent, previous] = await Promise.all([
        db.select({ userId: attendances.userId, total: count() }).from(attendances).innerJoin(ebdClasses, eq(attendances.classId, ebdClasses.id)).where(and(eq(ebdClasses.churchId, input.churchId), gte(attendances.checkedInAt, recentStart))).groupBy(attendances.userId),
        db.select({ userId: attendances.userId, total: count() }).from(attendances).innerJoin(ebdClasses, eq(attendances.classId, ebdClasses.id)).where(and(eq(ebdClasses.churchId, input.churchId), gte(attendances.checkedInAt, previousStart), lt(attendances.checkedInAt, recentStart))).groupBy(attendances.userId),
      ]);
      const recentMap = new Map(recent.map(item => [item.userId, Number(item.total)])); const previousMap = new Map(previous.map(item => [item.userId, Number(item.total)])); let created = 0;
      for (const member of members) { const current = recentMap.get(member.userId) ?? 0; const before = previousMap.get(member.userId) ?? 0; if (before >= 2 && current < before) { const [existing] = await db.select({ id: pastoralSignals.id }).from(pastoralSignals).where(and(eq(pastoralSignals.churchId, input.churchId), eq(pastoralSignals.userId, member.userId), eq(pastoralSignals.signalType, "attendance_drop"), eq(pastoralSignals.status, "open"))).limit(1); if (!existing) { await db.insert(pastoralSignals).values({ churchId: input.churchId, userId: member.userId, signalType: "attendance_drop", observation: `A presença em EBD passou de ${before} para ${current} nas últimas quatro semanas.`, periodStartAt: previousStart, periodEndAt: end }); created += 1; } } }
      return { created, periodStartAt: previousStart, periodEndAt: end };
    }),
  }),
  connections: router({
    list: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); return db.select().from(professionalListings).where(and(eq(professionalListings.churchId, input.churchId), eq(professionalListings.status, "published"))).orderBy(desc(professionalListings.isFeatured), desc(professionalListings.publishedAt)); }),
    submit: protectedProcedure.input(churchInput.extend({ title: z.string().min(3).max(180), category: z.string().min(2).max(96), description: z.string().min(10).max(1500), businessName: z.string().max(180).optional(), phone: z.string().max(32).optional(), whatsapp: z.string().max(32).optional(), city: z.string().max(120).optional(), websiteUrl: z.string().url().optional(), socialUrl: z.string().url().optional() })).mutation(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const result = await db.insert(professionalListings).values({ ...input, ownerUserId: ctx.user.id, status: "pending", termsAcceptedAt: new Date() }); return { id: Number(result[0].insertId) }; }),
  }),
  management: router({
    createBiblePlan: protectedProcedure.input(churchInput.extend({ name: z.string().min(3).max(160), description: z.string().max(1200).optional(), startsAt: z.date().optional(), readings: z.array(z.object({ reference: z.string().min(2).max(180), bookTitle: z.string().max(80).optional(), introduction: z.string().max(1200).optional() })).min(1).max(365) })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_bible"); const db = await dbOrThrow();
      await db.update(biblePlans).set({ isOfficial: false }).where(eq(biblePlans.churchId, input.churchId));
      const planResult = await db.insert(biblePlans).values({ churchId: input.churchId, name: input.name, description: input.description, totalDays: input.readings.length, startsAt: input.startsAt, isOfficial: true, status: "active" });
      const planId = Number(planResult[0].insertId);
      await db.insert(bibleReadings).values(input.readings.map((reading, index) => ({ planId, dayNumber: index + 1, reference: reading.reference, bookTitle: reading.bookTitle, introduction: reading.introduction })));
      return { planId };
    }),
    publishDevotional: protectedProcedure.input(churchInput.extend({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), title: z.string().min(3).max(180), bibleReference: z.string().min(2).max(180), reflection: z.string().min(10).max(10000), application: z.string().max(2000).optional(), status: z.enum(["draft", "published"]).default("published") })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_bible"); const db = await dbOrThrow(); const publishedAt = input.status === "published" ? new Date() : undefined;
      await db.insert(dailyDevotionals).values({ churchId: input.churchId, authorUserId: ctx.user.id, dateKey: input.date, title: input.title, bibleReference: input.bibleReference, reflection: input.reflection, application: input.application, status: input.status, publishedAt }).onDuplicateKeyUpdate({ set: { title: input.title, bibleReference: input.bibleReference, reflection: input.reflection, application: input.application, status: input.status, publishedAt, authorUserId: ctx.user.id } });
      return { success: true };
    }),
    createMilestone: protectedProcedure.input(churchInput.extend({ name: z.string().min(3).max(160), description: z.string().max(1000).optional(), category: z.enum(["bible", "participation", "journey"]), triggerType: z.enum(["readings_completed", "reading_streak", "attendances", "events_joined"]), threshold: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_bible"); const db = await dbOrThrow(); const result = await db.insert(milestones).values(input); return { id: Number(result[0].insertId) };
    }),
    createEbdClass: protectedProcedure.input(churchInput.extend({ name: z.string().min(3).max(160), description: z.string().max(1000).optional(), schedule: z.string().max(120).optional(), room: z.string().max(120).optional(), teacherUserId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_ebd"); const db = await dbOrThrow(); const result = await db.insert(ebdClasses).values({ ...input, teacherUserId: input.teacherUserId ?? ctx.user.id }); return { id: Number(result[0].insertId) };
    }),
    createEbdLesson: protectedProcedure.input(churchInput.extend({ classId: z.number().int().positive(), title: z.string().min(3).max(180), scheduledAt: z.date(), checkInAvailableAt: z.date().optional(), checkInExpiresAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_ebd"); const db = await dbOrThrow(); const [classRoom] = await db.select().from(ebdClasses).where(and(eq(ebdClasses.id, input.classId), eq(ebdClasses.churchId, input.churchId))).limit(1);
      if (!classRoom) throw new TRPCError({ code: "NOT_FOUND", message: "Classe de EBD não encontrada." });
      const token = randomUUID().replace(/-/g, ""); const result = await db.insert(ebdLessons).values({ classId: input.classId, createdByUserId: ctx.user.id, title: input.title, scheduledAt: input.scheduledAt, checkInToken: token, checkInAvailableAt: input.checkInAvailableAt ?? input.scheduledAt, checkInExpiresAt: input.checkInExpiresAt, status: "open" }); return { id: Number(result[0].insertId), checkInToken: token };
    }),
    enrollEbdStudent: protectedProcedure.input(churchInput.extend({ classId: z.number().int().positive(), userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_ebd"); const db = await dbOrThrow(); const [classRoom] = await db.select().from(ebdClasses).where(and(eq(ebdClasses.id, input.classId), eq(ebdClasses.churchId, input.churchId))).limit(1); if (!classRoom) throw new TRPCError({ code: "NOT_FOUND", message: "Classe de EBD não encontrada." });
      await db.insert(ebdEnrollments).values({ classId: input.classId, userId: input.userId }).onDuplicateKeyUpdate({ set: { status: "active" } }); return { success: true };
    }),
    createEbdMagazine: protectedProcedure.input(churchInput.extend({ classId: z.number().int().positive().optional(), trimesterLabel: z.string().min(4).max(64), theme: z.string().min(3).max(180), description: z.string().max(2000).optional(), sourceType: z.enum(["church_authored", "licensed"]), rightsConfirmed: z.boolean() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_ebd"); if (input.sourceType === "licensed" && !input.rightsConfirmed) throw new TRPCError({ code: "BAD_REQUEST", message: "Confirme a autorização de uso antes de publicar material licenciado." }); const db = await dbOrThrow();
      const result = await db.insert(ebdMagazines).values({ churchId: input.churchId, classId: input.classId, createdByUserId: ctx.user.id, trimesterLabel: input.trimesterLabel, theme: input.theme, description: input.description, sourceType: input.sourceType, rightsConfirmedAt: input.rightsConfirmed ? new Date() : undefined, status: "published" }); return { id: Number(result[0].insertId) };
    }),
    createEbdMagazineLesson: protectedProcedure.input(churchInput.extend({ magazineId: z.number().int().positive(), lessonNumber: z.number().int().positive(), title: z.string().min(3).max(180), description: z.string().max(2000).optional(), materialUrl: z.string().url().optional(), scheduledAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "manage_ebd"); const db = await dbOrThrow(); const [magazine] = await db.select().from(ebdMagazines).where(and(eq(ebdMagazines.id, input.magazineId), eq(ebdMagazines.churchId, input.churchId))).limit(1); if (!magazine) throw new TRPCError({ code: "NOT_FOUND", message: "Revista EBD não encontrada." }); const result = await db.insert(ebdMagazineLessons).values({ magazineId: input.magazineId, lessonNumber: input.lessonNumber, title: input.title, description: input.description, materialUrl: input.materialUrl, scheduledAt: input.scheduledAt }); return { id: Number(result[0].insertId) };
    }),
    createEvent: protectedProcedure.input(churchInput.extend({ title: z.string().min(3).max(180), description: z.string().max(6000).optional(), startsAt: z.date(), endsAt: z.date().optional(), location: z.string().max(220).optional(), requiresRegistration: z.boolean().default(false), status: z.enum(["draft", "published"]).default("published") })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_events"); const db = await dbOrThrow(); const result = await db.insert(events).values({ ...input, createdByUserId: ctx.user.id }); return { id: Number(result[0].insertId) }; }),
    createAnnouncement: protectedProcedure.input(churchInput.extend({ title: z.string().min(3).max(180), content: z.string().min(5).max(10000), status: z.enum(["draft", "published"]).default("published") })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_communications"); const db = await dbOrThrow(); const result = await db.insert(announcements).values({ ...input, authorUserId: ctx.user.id, publishedAt: input.status === "published" ? new Date() : undefined }); return { id: Number(result[0].insertId) }; }),
    moderateConnection: protectedProcedure.input(churchInput.extend({ listingId: z.number().int().positive(), status: z.enum(["published", "rejected", "archived"]), moderationNote: z.string().max(1000).optional(), featured: z.boolean().optional() })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_connections"); const db = await dbOrThrow(); await db.update(professionalListings).set({ status: input.status, moderationNote: input.moderationNote, isFeatured: input.featured ?? false, reviewedByUserId: ctx.user.id, publishedAt: input.status === "published" ? new Date() : undefined }).where(and(eq(professionalListings.id, input.listingId), eq(professionalListings.churchId, input.churchId))); return { success: true }; }),
  }),
  reports: router({
    monthly: protectedProcedure.input(churchInput.extend({ month: z.string().regex(/^\d{4}-\d{2}$/) })).query(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "view_metrics"); const db = await dbOrThrow(); const start = new Date(`${input.month}-01T00:00:00.000Z`); const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
      const [members, newMembers, activeMembers, bibleParticipants, readings, ebdEnrolled, ebdPresent, eventsTotal, eventCheckins, prayersTotal, activePrayers, lowParticipation] = await Promise.all([
        db.select({ total: count() }).from(memberships).where(and(eq(memberships.churchId, input.churchId), eq(memberships.status, "active"))),
        db.select({ total: count() }).from(memberships).where(and(eq(memberships.churchId, input.churchId), gte(memberships.joinedAt, start), lt(memberships.joinedAt, end))),
        db.select({ total: sql<number>`count(distinct ${activityEvents.userId})` }).from(activityEvents).where(and(eq(activityEvents.churchId, input.churchId), gte(activityEvents.occurredAt, start), lt(activityEvents.occurredAt, end))),
        db.select({ total: count() }).from(userBiblePlanEnrollments).innerJoin(biblePlans, eq(userBiblePlanEnrollments.planId, biblePlans.id)).where(and(eq(biblePlans.churchId, input.churchId), eq(userBiblePlanEnrollments.isActive, true))),
        db.select({ total: count() }).from(userBibleProgress).innerJoin(userBiblePlanEnrollments, eq(userBibleProgress.enrollmentId, userBiblePlanEnrollments.id)).innerJoin(biblePlans, eq(userBiblePlanEnrollments.planId, biblePlans.id)).where(and(eq(biblePlans.churchId, input.churchId), gte(userBibleProgress.completedAt, start), lt(userBibleProgress.completedAt, end))),
        db.select({ total: count() }).from(ebdEnrollments).innerJoin(ebdClasses, eq(ebdEnrollments.classId, ebdClasses.id)).where(and(eq(ebdClasses.churchId, input.churchId), eq(ebdEnrollments.status, "active"))),
        db.select({ total: count() }).from(attendances).innerJoin(ebdClasses, eq(attendances.classId, ebdClasses.id)).where(and(eq(ebdClasses.churchId, input.churchId), gte(attendances.checkedInAt, start), lt(attendances.checkedInAt, end))),
        db.select({ total: count() }).from(events).where(and(eq(events.churchId, input.churchId), gte(events.startsAt, start), lt(events.startsAt, end))),
        db.select({ total: count() }).from(eventRegistrations).innerJoin(events, eq(eventRegistrations.eventId, events.id)).where(and(eq(events.churchId, input.churchId), eq(eventRegistrations.status, "confirmed"), gte(eventRegistrations.createdAt, start), lt(eventRegistrations.createdAt, end))),
        db.select({ total: count() }).from(prayerRequests).where(and(eq(prayerRequests.churchId, input.churchId), gte(prayerRequests.createdAt, start), lt(prayerRequests.createdAt, end))),
        db.select({ total: count() }).from(prayerRequests).where(and(eq(prayerRequests.churchId, input.churchId), inArray(prayerRequests.status, ["new", "in_follow_up"]))),
        db.select({ total: count() }).from(pastoralSignals).where(and(eq(pastoralSignals.churchId, input.churchId), eq(pastoralSignals.status, "open"))),
      ]);
      const value = (row: { total: unknown }[] | undefined) => Number(row?.[0]?.total ?? 0);
      return { month: input.month, generatedAt: new Date(), church: { members: value(members), newMembers: value(newMembers), activeMembers: value(activeMembers) }, bible: { participants: value(bibleParticipants), readingsCompleted: value(readings) }, ebd: { enrolled: value(ebdEnrolled), attendances: value(ebdPresent) }, participation: { events: value(eventsTotal), eventCheckins: value(eventCheckins) }, care: { prayerRequests: value(prayersTotal), activePrayers: value(activePrayers) }, activity: { activeMembers: value(activeMembers), lowParticipation: value(lowParticipation) } };
    }),
  }),
  experience: router({
    overview: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "view_metrics"); const db = await dbOrThrow(); const start = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const [members, activeMembers, activityTotal, leadership, feedback, recognitions] = await Promise.all([
        db.select({ total: count() }).from(memberships).where(and(eq(memberships.churchId, input.churchId), eq(memberships.status, "active"))),
        db.select({ total: sql<number>`count(distinct ${activityEvents.userId})` }).from(activityEvents).where(and(eq(activityEvents.churchId, input.churchId), gte(activityEvents.occurredAt, start))),
        db.select({ total: count() }).from(activityEvents).where(and(eq(activityEvents.churchId, input.churchId), gte(activityEvents.occurredAt, start))),
        db.select({ total: count() }).from(memberships).where(and(eq(memberships.churchId, input.churchId), inArray(memberships.role, ["administrator", "pastor"]))),
        db.select({ total: count(), average: sql<number>`avg(${experienceFeedback.score})`, shared: sql<number>`sum(case when ${experienceFeedback.sharedExperience} then 1 else 0 end)` }).from(experienceFeedback).where(and(eq(experienceFeedback.churchId, input.churchId), gte(experienceFeedback.createdAt, start))),
        db.select().from(experienceRecognitions).where(eq(experienceRecognitions.churchId, input.churchId)).orderBy(desc(experienceRecognitions.grantedAt)),
      ]);
      const memberCount = Number(members[0]?.total ?? 0); const activeCount = Number(activeMembers[0]?.total ?? 0); const actions = Number(activityTotal[0]?.total ?? 0); const leadershipCount = Number(leadership[0]?.total ?? 0); const feedbackCount = Number(feedback[0]?.total ?? 0); const averageFeedback = Number(feedback[0]?.average ?? 0); const shares = Number(feedback[0]?.shared ?? 0);
      const activationScore = memberCount ? Math.min(30, Math.round((activeCount / memberCount) * 30)) : 0; const usageScore = memberCount ? Math.min(30, Math.round((actions / memberCount) * 8)) : 0; const leadershipScore = leadershipCount ? 15 : 0; const feedbackScore = feedbackCount ? Math.min(15, Math.round((averageFeedback / 5) * 15)) : 0; const sharingScore = feedbackCount ? Math.min(10, Math.round((shares / feedbackCount) * 10)) : 0;
      return { periodStart: start, index: activationScore + usageScore + leadershipScore + feedbackScore + sharingScore, components: { activationScore, usageScore, leadershipScore, feedbackScore, sharingScore, activeMembers: activeCount, activityEvents: actions, leadershipParticipants: leadershipCount, feedbackCount, averageFeedback, spontaneousShares: shares }, recognitions };
    }),
    submitFeedback: protectedProcedure.input(churchInput.extend({ score: z.number().int().min(1).max(5), comment: z.string().max(1500).optional(), sharedExperience: z.boolean().default(false) })).mutation(async ({ ctx, input }) => { await assertChurch(ctx.user, input.churchId); const db = await dbOrThrow(); const result = await db.insert(experienceFeedback).values({ churchId: input.churchId, userId: ctx.user.id, score: input.score, comment: input.comment, sharedExperience: input.sharedExperience }); return { id: Number(result[0].insertId) }; }),
    grantRecognition: protectedProcedure.input(churchInput.extend({ userId: z.number().int().positive().optional(), kind: z.enum(["pioneer_church", "experience_ambassador"]), title: z.string().min(3).max(180), description: z.string().max(1200).optional() })).mutation(async ({ ctx, input }) => { await requireChurchCapability(ctx.user, input.churchId, "manage_church"); const db = await dbOrThrow(); const result = await db.insert(experienceRecognitions).values({ churchId: input.churchId, userId: input.userId, kind: input.kind, title: input.title, description: input.description, grantedByUserId: ctx.user.id }); return { id: Number(result[0].insertId) }; }),
  }),
  admin: router({
    dashboard: protectedProcedure.input(churchInput).query(async ({ ctx, input }) => {
      await requireChurchCapability(ctx.user, input.churchId, "view_metrics"); const db = await dbOrThrow(); const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const [members, bibleParticipants, bibleReadingsCompleted, ebdPresent, activePrayers, upcomingEvents, activeUsers, signals] = await Promise.all([
        db.select({ total: count() }).from(memberships).where(and(eq(memberships.churchId, input.churchId), eq(memberships.status, "active"))),
        db.select({ total: count() }).from(userBiblePlanEnrollments).innerJoin(biblePlans, eq(userBiblePlanEnrollments.planId, biblePlans.id)).where(and(eq(biblePlans.churchId, input.churchId), eq(userBiblePlanEnrollments.isActive, true))),
        db.select({ total: count() }).from(userBibleProgress).innerJoin(userBiblePlanEnrollments, eq(userBibleProgress.enrollmentId, userBiblePlanEnrollments.id)).innerJoin(biblePlans, eq(userBiblePlanEnrollments.planId, biblePlans.id)).where(and(eq(biblePlans.churchId, input.churchId), gte(userBibleProgress.completedAt, since))),
        db.select({ total: count() }).from(attendances).innerJoin(ebdClasses, eq(attendances.classId, ebdClasses.id)).where(and(eq(ebdClasses.churchId, input.churchId), gte(attendances.checkedInAt, since))),
        db.select({ total: count() }).from(prayerRequests).where(and(eq(prayerRequests.churchId, input.churchId), inArray(prayerRequests.status, ["new", "in_follow_up"]))),
        db.select({ total: count() }).from(events).where(and(eq(events.churchId, input.churchId), eq(events.status, "published"), gte(events.startsAt, new Date()))),
        db.select({ total: sql<number>`count(distinct ${activityEvents.userId})` }).from(activityEvents).where(and(eq(activityEvents.churchId, input.churchId), gte(activityEvents.occurredAt, since))),
        db.select({ total: count() }).from(pastoralSignals).where(and(eq(pastoralSignals.churchId, input.churchId), eq(pastoralSignals.status, "open"))),
      ]);
      return { members: Number(members[0]?.total ?? 0), bibleParticipants: Number(bibleParticipants[0]?.total ?? 0), bibleReadingsCompleted: Number(bibleReadingsCompleted[0]?.total ?? 0), ebdPresent: Number(ebdPresent[0]?.total ?? 0), activePrayers: Number(activePrayers[0]?.total ?? 0), upcomingEvents: Number(upcomingEvents[0]?.total ?? 0), weeklyActivity: Number(activeUsers[0]?.total ?? 0), pastoralSignals: Number(signals[0]?.total ?? 0) };
    }),
  }),
});

export type AppRouter = typeof appRouter;
