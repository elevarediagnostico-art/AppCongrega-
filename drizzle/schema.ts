import {
  boolean,
  foreignKey,
  index,
  int,
  json,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const appRoleValues = [
  "administrator",
  "pastor",
  "member",
] as const;

export type AppRole = (typeof appRoleValues)[number];

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", appRoleValues).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const churches = mysqlTable(
  "churches",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    description: text("description"),
    logoUrl: varchar("logoUrl", { length: 1024 }),
    primaryColor: varchar("primaryColor", { length: 16 }).default("#123d36").notNull(),
    secondaryColor: varchar("secondaryColor", { length: 16 }).default("#e8bd68").notNull(),
    coverImageUrl: varchar("coverImageUrl", { length: 1024 }),
    welcomeMessage: varchar("welcomeMessage", { length: 320 }),
    address: text("address"),
    phone: varchar("phone", { length: 32 }),
    serviceSchedule: text("serviceSchedule"),
    timezone: varchar("timezone", { length: 64 }).default("America/Sao_Paulo").notNull(),
    planTier: mysqlEnum("planTier", ["essential", "community", "church"]).default("essential").notNull(),
    memberLimit: int("memberLimit").default(100).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("churches_slug_unique").on(table.slug)],
);

export const memberships = mysqlTable(
  "memberships",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: mysqlEnum("role", appRoleValues).default("member").notNull(),
    status: mysqlEnum("status", ["active", "invited", "inactive"]).default("active").notNull(),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("memberships_church_user_unique").on(table.churchId, table.userId),
    index("memberships_user_idx").on(table.userId),
  ],
);

export const roles = mysqlTable(
  "roles",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").references(() => churches.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 64 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    isSystem: boolean("isSystem").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("roles_church_idx").on(table.churchId), uniqueIndex("roles_church_key_unique").on(table.churchId, table.key)],
);

export const permissions = mysqlTable(
  "permissions",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 96 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("permissions_key_unique").on(table.key)],
);

export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    id: int("id").autoincrement().primaryKey(),
    roleId: int("roleId").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: int("permissionId").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  },
  table => [uniqueIndex("role_permissions_unique").on(table.roleId, table.permissionId)],
);

export const events = mysqlTable(
  "events",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    createdByUserId: int("createdByUserId").notNull().references(() => users.id),
    title: varchar("title", { length: 180 }).notNull(),
    description: longtext("description"),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt"),
    location: varchar("location", { length: 220 }),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    requiresRegistration: boolean("requiresRegistration").default(false).notNull(),
    status: mysqlEnum("status", ["draft", "published", "cancelled"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("events_church_starts_idx").on(table.churchId, table.startsAt)],
);

export const eventRegistrations = mysqlTable(
  "event_registrations",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: int("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["confirmed", "cancelled"]).default("confirmed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("event_registrations_event_user_unique").on(table.eventId, table.userId)],
);

export const personalCommitments = mysqlTable(
  "personal_commitments",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt"),
    recurrence: mysqlEnum("recurrence", ["none", "daily", "weekly", "monthly"]).default("none").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("personal_commitments_user_starts_idx").on(table.userId, table.startsAt), index("personal_commitments_church_user_idx").on(table.churchId, table.userId)],
);

export const announcements = mysqlTable(
  "announcements",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id),
    title: varchar("title", { length: 180 }).notNull(),
    content: longtext("content").notNull(),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("announcements_church_status_idx").on(table.churchId, table.status)],
);

export const albums = mysqlTable(
  "albums",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    coverPhotoUrl: varchar("coverPhotoUrl", { length: 1024 }),
    visibility: mysqlEnum("visibility", ["members", "public"]).default("members").notNull(),
    allowDownloads: boolean("allowDownloads").default(true).notNull(),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("albums_church_status_idx").on(table.churchId, table.status)],
);

export const photos = mysqlTable(
  "photos",
  {
    id: int("id").autoincrement().primaryKey(),
    albumId: int("albumId").notNull().references(() => albums.id, { onDelete: "cascade" }),
    uploadedByUserId: int("uploadedByUserId").notNull().references(() => users.id),
    storageKey: varchar("storageKey", { length: 1024 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    thumbnailStorageKey: varchar("thumbnailStorageKey", { length: 1024 }),
    thumbnailUrl: varchar("thumbnailUrl", { length: 1024 }),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 96 }).notNull(),
    originalBytes: int("originalBytes"),
    optimizedBytes: int("optimizedBytes"),
    width: int("width"),
    height: int("height"),
    title: varchar("title", { length: 180 }),
    caption: text("caption"),
    status: mysqlEnum("status", ["published", "archived"]).default("published").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("photos_album_created_idx").on(table.albumId, table.createdAt)],
);

export const biblePlans = mysqlTable(
  "bible_plans",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    totalDays: int("totalDays").default(365).notNull(),
    startsAt: timestamp("startsAt"),
    isOfficial: boolean("isOfficial").default(false).notNull(),
    status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("bible_plans_church_active_idx").on(table.churchId, table.status)],
);

export const bibleReadings = mysqlTable(
  "bible_readings",
  {
    id: int("id").autoincrement().primaryKey(),
    planId: int("planId").notNull().references(() => biblePlans.id, { onDelete: "cascade" }),
    dayNumber: int("dayNumber").notNull(),
    reference: varchar("reference", { length: 180 }).notNull(),
    bookTitle: varchar("bookTitle", { length: 80 }),
    introduction: text("introduction"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("bible_readings_plan_day_unique").on(table.planId, table.dayNumber)],
);

export const userBiblePlanEnrollments = mysqlTable(
  "user_bible_plan_enrollments",
  {
    id: int("id").autoincrement().primaryKey(),
    planId: int("planId").notNull().references(() => biblePlans.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    mode: mysqlEnum("mode", ["official", "personal"]).default("official").notNull(),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("user_bible_enrollment_plan_user_unique").on(table.planId, table.userId)],
);

export const userBibleProgress = mysqlTable(
  "user_bible_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    enrollmentId: int("enrollmentId").notNull(),
    readingId: int("readingId").notNull(),
    completedAt: timestamp("completedAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("user_bible_progress_unique").on(table.enrollmentId, table.readingId),
    foreignKey({ columns: [table.enrollmentId], foreignColumns: [userBiblePlanEnrollments.id], name: "ubp_enrollment_fk" }).onDelete("cascade"),
    foreignKey({ columns: [table.readingId], foreignColumns: [bibleReadings.id], name: "ubp_reading_fk" }).onDelete("cascade"),
  ],
);

export const dailyDevotionals = mysqlTable(
  "daily_devotionals",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id),
    dateKey: varchar("dateKey", { length: 10 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    bibleReference: varchar("bibleReference", { length: 180 }).notNull(),
    reflection: longtext("reflection").notNull(),
    application: text("application"),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("daily_devotionals_church_date_unique").on(table.churchId, table.dateKey)],
);

export const churchContentSettings = mysqlTable(
  "church_content_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    dailyContentMode: mysqlEnum("dailyContentMode", ["daily_devotional", "church_word", "hybrid"]).default("hybrid").notNull(),
    updatedByUserId: int("updatedByUserId").references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("church_content_settings_church_unique").on(table.churchId)],
);

export const churchContents = mysqlTable(
  "church_contents",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id),
    contentType: mysqlEnum("contentType", ["devotional", "reflection", "study", "pastoral_word", "guidance", "campaign", "weekly_word", "special"]).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    excerpt: text("excerpt"),
    content: longtext("content").notNull(),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    audienceType: mysqlEnum("audienceType", ["church", "youth", "women", "men", "ebd", "leadership", "class"]).default("church").notNull(),
    audienceClassId: int("audienceClassId").references(() => ebdClasses.id, { onDelete: "set null" }),
    scheduledAt: timestamp("scheduledAt"),
    publishedAt: timestamp("publishedAt"),
    status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("church_contents_church_status_date_idx").on(table.churchId, table.status, table.publishedAt)],
);

export const ebdMagazines = mysqlTable(
  "ebd_magazines",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    classId: int("classId").references(() => ebdClasses.id, { onDelete: "set null" }),
    createdByUserId: int("createdByUserId").notNull().references(() => users.id),
    trimesterLabel: varchar("trimesterLabel", { length: 64 }).notNull(),
    theme: varchar("theme", { length: 180 }).notNull(),
    description: text("description"),
    sourceType: mysqlEnum("sourceType", ["church_authored", "licensed"]).default("church_authored").notNull(),
    rightsConfirmedAt: timestamp("rightsConfirmedAt"),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("ebd_magazines_church_class_idx").on(table.churchId, table.classId)],
);

export const ebdMagazineLessons = mysqlTable(
  "ebd_magazine_lessons",
  {
    id: int("id").autoincrement().primaryKey(),
    magazineId: int("magazineId").notNull().references(() => ebdMagazines.id, { onDelete: "cascade" }),
    lessonNumber: int("lessonNumber").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    materialStorageKey: varchar("materialStorageKey", { length: 1024 }),
    materialUrl: varchar("materialUrl", { length: 1024 }),
    scheduledAt: timestamp("scheduledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("ebd_magazine_lessons_number_unique").on(table.magazineId, table.lessonNumber)],
);

export const families = mysqlTable(
  "families",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 180 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("families_church_name_unique").on(table.churchId, table.name)],
);

export const familyMembers = mysqlTable(
  "family_members",
  {
    id: int("id").autoincrement().primaryKey(),
    familyId: int("familyId").notNull().references(() => families.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    relationLabel: varchar("relationLabel", { length: 64 }),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("family_members_family_user_unique").on(table.familyId, table.userId)],
);

export const professionalListings = mysqlTable(
  "professional_listings",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    category: varchar("category", { length: 96 }).notNull(),
    businessName: varchar("businessName", { length: 180 }),
    description: text("description").notNull(),
    phone: varchar("phone", { length: 32 }),
    whatsapp: varchar("whatsapp", { length: 32 }),
    socialUrl: varchar("socialUrl", { length: 1024 }),
    websiteUrl: varchar("websiteUrl", { length: 1024 }),
    city: varchar("city", { length: 120 }),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    status: mysqlEnum("status", ["draft", "pending", "published", "rejected", "archived"]).default("draft").notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    publishedAt: timestamp("publishedAt"),
    expiresAt: timestamp("expiresAt"),
    termsAcceptedAt: timestamp("termsAcceptedAt"),
    moderationNote: text("moderationNote"),
    reviewedByUserId: int("reviewedByUserId").references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("professional_listings_church_status_idx").on(table.churchId, table.status), index("professional_listings_owner_idx").on(table.ownerUserId)],
);

export const milestones = mysqlTable(
  "milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", ["bible", "participation", "journey"]).notNull(),
    triggerType: mysqlEnum("triggerType", ["readings_completed", "reading_streak", "attendances", "events_joined"]).notNull(),
    threshold: int("threshold").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("milestones_church_active_idx").on(table.churchId, table.isActive)],
);

export const userMilestones = mysqlTable(
  "user_milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    milestoneId: int("milestoneId").notNull().references(() => milestones.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("user_milestones_unique").on(table.milestoneId, table.userId)],
);

export const ebdClasses = mysqlTable(
  "ebd_classes",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    teacherUserId: int("teacherUserId").references(() => users.id),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    schedule: varchar("schedule", { length: 120 }),
    room: varchar("room", { length: 120 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("ebd_classes_church_active_idx").on(table.churchId, table.isActive)],
);

export const ebdLessons = mysqlTable(
  "ebd_lessons",
  {
    id: int("id").autoincrement().primaryKey(),
    classId: int("classId").notNull().references(() => ebdClasses.id, { onDelete: "cascade" }),
    createdByUserId: int("createdByUserId").notNull().references(() => users.id),
    title: varchar("title", { length: 180 }).notNull(),
    scheduledAt: timestamp("scheduledAt").notNull(),
    checkInToken: varchar("checkInToken", { length: 96 }).notNull(),
    checkInAvailableAt: timestamp("checkInAvailableAt"),
    checkInExpiresAt: timestamp("checkInExpiresAt"),
    status: mysqlEnum("status", ["scheduled", "open", "closed"]).default("scheduled").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("ebd_lessons_checkin_token_unique").on(table.checkInToken), index("ebd_lessons_class_date_idx").on(table.classId, table.scheduledAt)],
);

export const ebdEnrollments = mysqlTable(
  "ebd_enrollments",
  {
    id: int("id").autoincrement().primaryKey(),
    classId: int("classId").notNull().references(() => ebdClasses.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
    enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("ebd_enrollments_class_user_unique").on(table.classId, table.userId)],
);

export const attendances = mysqlTable(
  "attendances",
  {
    id: int("id").autoincrement().primaryKey(),
    lessonId: int("lessonId").notNull().references(() => ebdLessons.id, { onDelete: "cascade" }),
    classId: int("classId").notNull().references(() => ebdClasses.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    method: mysqlEnum("method", ["qr", "manual"]).default("qr").notNull(),
    checkedInAt: timestamp("checkedInAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("attendances_lesson_user_unique").on(table.lessonId, table.userId), index("attendances_class_user_idx").on(table.classId, table.userId)],
);

export const prayerRequests = mysqlTable(
  "prayer_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id),
    content: longtext("content").notNull(),
    visibility: mysqlEnum("visibility", ["leadership", "authorized_leadership", "community"]).default("leadership").notNull(),
    status: mysqlEnum("status", ["new", "in_follow_up", "completed"]).default("new").notNull(),
    handledByUserId: int("handledByUserId").references(() => users.id),
    statusUpdatedAt: timestamp("statusUpdatedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("prayer_requests_church_status_idx").on(table.churchId, table.status), index("prayer_requests_author_idx").on(table.authorUserId)],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    category: mysqlEnum("category", ["bible", "ebd", "events", "church", "journey"]).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    relatedEntityType: varchar("relatedEntityType", { length: 64 }),
    relatedEntityId: int("relatedEntityId"),
    sentAt: timestamp("sentAt"),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("notifications_user_read_idx").on(table.userId, table.readAt)],
);

export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    category: mysqlEnum("category", ["bible", "ebd", "events", "church", "journey"]).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("notification_preferences_unique").on(table.churchId, table.userId, table.category)],
);

export const activityEvents = mysqlTable(
  "activity_events",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    action: mysqlEnum("action", ["bible_read", "devotional_view", "attendance", "event_registration", "gallery_view", "prayer_request"]).notNull(),
    entityType: varchar("entityType", { length: 64 }),
    entityId: int("entityId"),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
    metadata: json("metadata"),
  },
  table => [index("activity_events_church_user_date_idx").on(table.churchId, table.userId, table.occurredAt)],
);

export const pastoralSignals = mysqlTable(
  "pastoral_signals",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    signalType: mysqlEnum("signalType", ["attendance_drop", "prolonged_absence", "participation_drop", "pending_prayer_request"]).notNull(),
    observation: text("observation").notNull(),
    periodStartAt: timestamp("periodStartAt").notNull(),
    periodEndAt: timestamp("periodEndAt").notNull(),
    status: mysqlEnum("status", ["open", "reviewed", "dismissed"]).default("open").notNull(),
    calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
    reviewedByUserId: int("reviewedByUserId").references(() => users.id),
    reviewedAt: timestamp("reviewedAt"),
  },
  table => [index("pastoral_signals_church_status_idx").on(table.churchId, table.status)],
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").references(() => churches.id, { onDelete: "cascade" }),
    actorUserId: int("actorUserId").references(() => users.id),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entityType", { length: 64 }).notNull(),
    entityId: int("entityId"),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("audit_logs_church_created_idx").on(table.churchId, table.createdAt)],
);

export const experienceRecognitions = mysqlTable(
  "experience_recognitions",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    kind: mysqlEnum("kind", ["pioneer_church", "experience_ambassador"]).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    grantedAt: timestamp("grantedAt").defaultNow().notNull(),
    grantedByUserId: int("grantedByUserId").references(() => users.id, { onDelete: "set null" }),
  },
  table => [index("experience_recognitions_church_idx").on(table.churchId, table.kind)],
);

export const experienceFeedback = mysqlTable(
  "experience_feedback",
  {
    id: int("id").autoincrement().primaryKey(),
    churchId: int("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    score: int("score").notNull(),
    comment: text("comment"),
    sharedExperience: boolean("sharedExperience").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("experience_feedback_church_created_idx").on(table.churchId, table.createdAt)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
