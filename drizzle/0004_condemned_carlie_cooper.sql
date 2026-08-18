ALTER TABLE `churches` ADD `planTier` enum('essential','community','church') DEFAULT 'essential' NOT NULL;--> statement-breakpoint
ALTER TABLE `churches` ADD `memberLimit` int DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `photos` ADD `thumbnailStorageKey` varchar(1024);--> statement-breakpoint
ALTER TABLE `photos` ADD `thumbnailUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `photos` ADD `originalBytes` int;--> statement-breakpoint
ALTER TABLE `photos` ADD `optimizedBytes` int;--> statement-breakpoint
ALTER TABLE `photos` ADD `width` int;--> statement-breakpoint
ALTER TABLE `photos` ADD `height` int;