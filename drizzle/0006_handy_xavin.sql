CREATE TABLE `experience_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`churchId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`sharedExperience` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experience_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `experience_feedback` ADD CONSTRAINT `experience_feedback_churchId_churches_id_fk` FOREIGN KEY (`churchId`) REFERENCES `churches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experience_feedback` ADD CONSTRAINT `experience_feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `experience_feedback_church_created_idx` ON `experience_feedback` (`churchId`,`createdAt`);