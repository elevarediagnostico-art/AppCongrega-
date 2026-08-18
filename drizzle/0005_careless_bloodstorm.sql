CREATE TABLE `experience_recognitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int,
	`kind` enum('pioneer_church','experience_ambassador') NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`grantedByUserId` int,
	CONSTRAINT `experience_recognitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `experience_recognitions` ADD CONSTRAINT `experience_recognitions_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_recognitions` ADD CONSTRAINT `experience_recognitions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_recognitions` ADD CONSTRAINT `experience_recognitions_grantedByUserId_users_id_fk` FOREIGN KEY (`grantedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `experience_recognitions_church_idx` ON `experience_recognitions` (`churchId`,`kind`);