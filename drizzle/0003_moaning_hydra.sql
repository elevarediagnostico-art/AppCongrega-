ALTER TABLE `memberships` MODIFY COLUMN `role` enum('super_admin','church_admin','leader','ebd_teacher','gallery_editor','administrator','pastor','member') NOT NULL DEFAULT 'member';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','church_admin','leader','ebd_teacher','gallery_editor','administrator','pastor','member') NOT NULL DEFAULT 'member';--> statement-breakpoint
UPDATE `memberships` SET `role` = CASE WHEN `role` = 'leader' THEN 'pastor' ELSE 'administrator' END WHERE `role` <> 'member';--> statement-breakpoint
UPDATE `users` SET `role` = CASE WHEN `role` = 'leader' THEN 'pastor' ELSE 'administrator' END WHERE `role` <> 'member';--> statement-breakpoint
ALTER TABLE `memberships` MODIFY COLUMN `role` enum('administrator','pastor','member') NOT NULL DEFAULT 'member';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('administrator','pastor','member') NOT NULL DEFAULT 'member';
