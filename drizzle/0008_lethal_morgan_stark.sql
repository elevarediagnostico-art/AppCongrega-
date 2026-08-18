CREATE TABLE `personal_commitments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`recurrence` enum('none','daily','weekly','monthly') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_commitments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `personal_commitments` ADD CONSTRAINT `personal_commitments_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `personal_commitments` ADD CONSTRAINT `personal_commitments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `personal_commitments_user_starts_idx` ON `personal_commitments` (`userId`,`startsAt`);--> statement-breakpoint
CREATE INDEX `personal_commitments_church_user_idx` ON `personal_commitments` (`churchId`,`userId`);