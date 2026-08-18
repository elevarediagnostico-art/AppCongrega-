CREATE TABLE `activity_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('bible_read','devotional_view','attendance','event_registration','gallery_view','prayer_request') NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	CONSTRAINT `activity_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`coverPhotoUrl` varchar(1024),
	`visibility` enum('members','public') NOT NULL DEFAULT 'members',
	`allowDownloads` boolean NOT NULL DEFAULT true,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`content` longtext NOT NULL,
	`imageUrl` varchar(1024),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`classId` int NOT NULL,
	`userId` int NOT NULL,
	`method` enum('qr','manual') NOT NULL DEFAULT 'qr',
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendances_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendances_lesson_user_unique` UNIQUE(`lessonId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bible_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`totalDays` int NOT NULL DEFAULT 365,
	`startsAt` timestamp,
	`isOfficial` boolean NOT NULL DEFAULT false,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bible_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bible_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`reference` varchar(180) NOT NULL,
	`bookTitle` varchar(80),
	`introduction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bible_readings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bible_readings_plan_day_unique` UNIQUE(`planId`,`dayNumber`)
);
--> statement-breakpoint
CREATE TABLE `churches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`logoUrl` varchar(1024),
	`address` text,
	`phone` varchar(32),
	`serviceSchedule` text,
	`timezone` varchar(64) NOT NULL DEFAULT 'America/Sao_Paulo',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `churches_id` PRIMARY KEY(`id`),
	CONSTRAINT `churches_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `daily_devotionals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`dateKey` varchar(10) NOT NULL,
	`title` varchar(180) NOT NULL,
	`bibleReference` varchar(180) NOT NULL,
	`reflection` longtext NOT NULL,
	`application` text,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_devotionals_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_devotionals_church_date_unique` UNIQUE(`churchId`,`dateKey`)
);
--> statement-breakpoint
CREATE TABLE `ebd_classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`teacherUserId` int,
	`name` varchar(160) NOT NULL,
	`description` text,
	`schedule` varchar(120),
	`room` varchar(120),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebd_classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ebd_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ebd_enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `ebd_enrollments_class_user_unique` UNIQUE(`classId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `ebd_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`checkInToken` varchar(96) NOT NULL,
	`checkInAvailableAt` timestamp,
	`checkInExpiresAt` timestamp,
	`status` enum('scheduled','open','closed') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebd_lessons_id` PRIMARY KEY(`id`),
	CONSTRAINT `ebd_lessons_checkin_token_unique` UNIQUE(`checkInToken`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_registrations_event_user_unique` UNIQUE(`eventId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` longtext,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`location` varchar(220),
	`imageUrl` varchar(1024),
	`requiresRegistration` boolean NOT NULL DEFAULT false,
	`status` enum('draft','published','cancelled') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('super_admin','church_admin','leader','ebd_teacher','gallery_editor','member') NOT NULL DEFAULT 'member',
	`status` enum('active','invited','inactive') NOT NULL DEFAULT 'active',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `memberships_church_user_unique` UNIQUE(`churchId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`category` enum('bible','participation','journey') NOT NULL,
	`triggerType` enum('readings_completed','reading_streak','attendances','events_joined') NOT NULL,
	`threshold` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`category` enum('bible','ebd','events','church','journey') NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_unique` UNIQUE(`churchId`,`userId`,`category`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`category` enum('bible','ebd','events','church','journey') NOT NULL,
	`title` varchar(180) NOT NULL,
	`content` text NOT NULL,
	`relatedEntityType` varchar(64),
	`relatedEntityId` int,
	`sentAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pastoral_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`signalType` enum('attendance_drop','prolonged_absence','participation_drop','pending_prayer_request') NOT NULL,
	`observation` text NOT NULL,
	`periodStartAt` timestamp NOT NULL,
	`periodEndAt` timestamp NOT NULL,
	`status` enum('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	CONSTRAINT `pastoral_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(96) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`albumId` int NOT NULL,
	`uploadedByUserId` int NOT NULL,
	`storageKey` varchar(1024) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(96) NOT NULL,
	`title` varchar(180),
	`caption` text,
	`status` enum('published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prayer_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`content` longtext NOT NULL,
	`visibility` enum('leadership','authorized_leadership','community') NOT NULL DEFAULT 'leadership',
	`status` enum('new','in_follow_up','completed') NOT NULL DEFAULT 'new',
	`handledByUserId` int,
	`statusUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prayer_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `role_permissions_unique` UNIQUE(`roleId`,`permissionId`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int,
	`key` varchar(64) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`isSystem` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_church_key_unique` UNIQUE(`churchId`,`key`)
);
--> statement-breakpoint
CREATE TABLE `user_bible_plan_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('official','personal') NOT NULL DEFAULT 'official',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_bible_plan_enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_bible_enrollment_plan_user_unique` UNIQUE(`planId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_bible_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`readingId` int NOT NULL,
	`completedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_bible_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_bible_progress_unique` UNIQUE(`enrollmentId`,`readingId`)
);
--> statement-breakpoint
CREATE TABLE `user_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`milestoneId` int NOT NULL,
	`userId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_milestones_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_milestones_unique` UNIQUE(`milestoneId`,`userId`)
);
--> statement-breakpoint
UPDATE `users` SET `role` = CASE WHEN `role` = 'admin' THEN 'church_admin' ELSE 'member' END;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','church_admin','leader','ebd_teacher','gallery_editor','member') NOT NULL DEFAULT 'member';--> statement-breakpoint
ALTER TABLE `activity_events` ADD CONSTRAINT `activity_events_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_events` ADD CONSTRAINT `activity_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `albums` ADD CONSTRAINT `albums_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `albums` ADD CONSTRAINT `albums_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_lessonId_ebd_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `ebd_lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_classId_ebd_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `ebd_classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bible_plans` ADD CONSTRAINT `bible_plans_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bible_readings` ADD CONSTRAINT `bible_readings_planId_bible_plans_id_fk` FOREIGN KEY (`planId`) REFERENCES `bible_plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_devotionals` ADD CONSTRAINT `daily_devotionals_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_devotionals` ADD CONSTRAINT `daily_devotionals_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_classes` ADD CONSTRAINT `ebd_classes_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_classes` ADD CONSTRAINT `ebd_classes_teacherUserId_users_id_fk` FOREIGN KEY (`teacherUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_enrollments` ADD CONSTRAINT `ebd_enrollments_classId_ebd_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `ebd_classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_enrollments` ADD CONSTRAINT `ebd_enrollments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_lessons` ADD CONSTRAINT `ebd_lessons_classId_ebd_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `ebd_classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_lessons` ADD CONSTRAINT `ebd_lessons_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pastoral_signals` ADD CONSTRAINT `pastoral_signals_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pastoral_signals` ADD CONSTRAINT `pastoral_signals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pastoral_signals` ADD CONSTRAINT `pastoral_signals_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_albumId_albums_id_fk` FOREIGN KEY (`albumId`) REFERENCES `albums`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `photos` ADD CONSTRAINT `photos_uploadedByUserId_users_id_fk` FOREIGN KEY (`uploadedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_requests` ADD CONSTRAINT `prayer_requests_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_requests` ADD CONSTRAINT `prayer_requests_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_requests` ADD CONSTRAINT `prayer_requests_handledByUserId_users_id_fk` FOREIGN KEY (`handledByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_roles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_permissions_id_fk` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_bible_plan_enrollments` ADD CONSTRAINT `user_bible_plan_enrollments_planId_bible_plans_id_fk` FOREIGN KEY (`planId`) REFERENCES `bible_plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_bible_plan_enrollments` ADD CONSTRAINT `user_bible_plan_enrollments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_bible_progress` ADD CONSTRAINT `ubp_enrollment_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `user_bible_plan_enrollments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_bible_progress` ADD CONSTRAINT `ubp_reading_fk` FOREIGN KEY (`readingId`) REFERENCES `bible_readings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_milestones` ADD CONSTRAINT `user_milestones_milestoneId_milestones_id_fk` FOREIGN KEY (`milestoneId`) REFERENCES `milestones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_milestones` ADD CONSTRAINT `user_milestones_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activity_events_church_user_date_idx` ON `activity_events` (`churchId`,`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `albums_church_status_idx` ON `albums` (`churchId`,`status`);--> statement-breakpoint
CREATE INDEX `announcements_church_status_idx` ON `announcements` (`churchId`,`status`);--> statement-breakpoint
CREATE INDEX `attendances_class_user_idx` ON `attendances` (`classId`,`userId`);--> statement-breakpoint
CREATE INDEX `audit_logs_church_created_idx` ON `audit_logs` (`churchId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `bible_plans_church_active_idx` ON `bible_plans` (`churchId`,`status`);--> statement-breakpoint
CREATE INDEX `ebd_classes_church_active_idx` ON `ebd_classes` (`churchId`,`isActive`);--> statement-breakpoint
CREATE INDEX `ebd_lessons_class_date_idx` ON `ebd_lessons` (`classId`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `events_church_starts_idx` ON `events` (`churchId`,`startsAt`);--> statement-breakpoint
CREATE INDEX `memberships_user_idx` ON `memberships` (`userId`);--> statement-breakpoint
CREATE INDEX `milestones_church_active_idx` ON `milestones` (`churchId`,`isActive`);--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`userId`,`readAt`);--> statement-breakpoint
CREATE INDEX `pastoral_signals_church_status_idx` ON `pastoral_signals` (`churchId`,`status`);--> statement-breakpoint
CREATE INDEX `photos_album_created_idx` ON `photos` (`albumId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `prayer_requests_church_status_idx` ON `prayer_requests` (`churchId`,`status`);--> statement-breakpoint
CREATE INDEX `prayer_requests_author_idx` ON `prayer_requests` (`authorUserId`);--> statement-breakpoint
CREATE INDEX `roles_church_idx` ON `roles` (`churchId`);
