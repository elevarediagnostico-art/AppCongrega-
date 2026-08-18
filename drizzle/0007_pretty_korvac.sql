ALTER TABLE `churches` ADD `primaryColor` varchar(16) DEFAULT '#123d36' NOT NULL;--> statement-breakpoint
ALTER TABLE `churches` ADD `secondaryColor` varchar(16) DEFAULT '#e8bd68' NOT NULL;--> statement-breakpoint
ALTER TABLE `churches` ADD `coverImageUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `churches` ADD `welcomeMessage` varchar(320);