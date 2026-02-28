CREATE TABLE `statistics` (
	`id` text PRIMARY KEY NOT NULL,
	`siteId` text NOT NULL,
	`type` text NOT NULL,
	`actionName` text NOT NULL,
	`actionValue` text NOT NULL,
	`overallCounts` text NOT NULL,
	`countryCounts` text NOT NULL,
	`refererCounts` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `siteIdTypeActionNameActionValueUnique` ON `statistics` (`siteId`,`type`,`actionName`,`actionValue`);