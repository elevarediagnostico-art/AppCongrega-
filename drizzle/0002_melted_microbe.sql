CREATE TABLE `church_content_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`dailyContentMode` enum('daily_devotional','church_word','hybrid') NOT NULL DEFAULT 'hybrid',
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `church_content_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `church_content_settings_church_unique` UNIQUE(`churchId`)
);
--> statement-breakpoint
CREATE TABLE `church_contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`contentType` enum('devotional','reflection','study','pastoral_word','guidance','campaign','weekly_word','special') NOT NULL,
	`title` varchar(180) NOT NULL,
	`excerpt` text,
	`content` longtext NOT NULL,
	`imageUrl` varchar(1024),
	`audienceType` enum('church','youth','women','men','ebd','leadership','class') NOT NULL DEFAULT 'church',
	`audienceClassId` int,
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `church_contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ebd_magazine_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`magazineId` int NOT NULL,
	`lessonNumber` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`materialStorageKey` varchar(1024),
	`materialUrl` varchar(1024),
	`scheduledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebd_magazine_lessons_id` PRIMARY KEY(`id`),
	CONSTRAINT `ebd_magazine_lessons_number_unique` UNIQUE(`magazineId`,`lessonNumber`)
);
--> statement-breakpoint
CREATE TABLE `ebd_magazines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`classId` int,
	`createdByUserId` int NOT NULL,
	`trimesterLabel` varchar(64) NOT NULL,
	`theme` varchar(180) NOT NULL,
	`description` text,
	`sourceType` enum('church_authored','licensed') NOT NULL DEFAULT 'church_authored',
	`rightsConfirmedAt` timestamp,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebd_magazines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `families` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `families_id` PRIMARY KEY(`id`),
	CONSTRAINT `families_church_name_unique` UNIQUE(`churchId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyId` int NOT NULL,
	`userId` int NOT NULL,
	`relationLabel` varchar(64),
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `family_members_family_user_unique` UNIQUE(`familyId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `professional_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(96) NOT NULL,
	`businessName` varchar(180),
	`description` text NOT NULL,
	`phone` varchar(32),
	`whatsapp` varchar(32),
	`socialUrl` varchar(1024),
	`websiteUrl` varchar(1024),
	`city` varchar(120),
	`imageUrl` varchar(1024),
	`status` enum('draft','pending','published','rejected','archived') NOT NULL DEFAULT 'draft',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`expiresAt` timestamp,
	`termsAcceptedAt` timestamp,
	`moderationNote` text,
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professional_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `church_content_settings` ADD CONSTRAINT `church_content_settings_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `church_content_settings` ADD CONSTRAINT `church_content_settings_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `church_contents` ADD CONSTRAINT `church_contents_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `church_contents` ADD CONSTRAINT `church_contents_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `church_contents` ADD CONSTRAINT `church_contents_audienceClassId_ebd_classes_id_fk` FOREIGN KEY (`audienceClassId`) REFERENCES `ebd_classes`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_magazine_lessons` ADD CONSTRAINT `ebd_magazine_lessons_magazineId_ebd_magazines_id_fk` FOREIGN KEY (`magazineId`) REFERENCES `ebd_magazines`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_magazines` ADD CONSTRAINT `ebd_magazines_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_magazines` ADD CONSTRAINT `ebd_magazines_classId_ebd_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `ebd_classes`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ebd_magazines` ADD CONSTRAINT `ebd_magazines_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `families` ADD CONSTRAINT `families_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_familyId_families_id_fk` FOREIGN KEY (`familyId`) REFERENCES `families`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professional_listings` ADD CONSTRAINT `professional_listings_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professional_listings` ADD CONSTRAINT `professional_listings_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professional_listings` ADD CONSTRAINT `professional_listings_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `church_contents_church_status_date_idx` ON `church_contents` (`churchId`,`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `ebd_magazines_church_class_idx` ON `ebd_magazines` (`churchId`,`classId`);--> statement-breakpoint
CREATE INDEX `professional_listings_church_status_idx` ON `professional_listings` (`churchId`,`status`);--> statement-breakpoint
CREATE INDEX `professional_listings_owner_idx` ON `professional_listings` (`ownerUserId`);
