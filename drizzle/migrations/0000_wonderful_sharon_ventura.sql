CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text(6) NOT NULL,
	`player_id` text(36) NOT NULL,
	`player_name` text(24) NOT NULL,
	`message` text(280) NOT NULL,
	`scope` text DEFAULT 'all' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `game_sessions`(`room_code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text(6) NOT NULL,
	`round_number` integer NOT NULL,
	`mantri_guess_player_id` text(36),
	`is_guess_correct` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`room_code`) REFERENCES `game_sessions`(`room_code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_rounds_room_round_idx` ON `game_rounds` (`room_code`,`round_number`);--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`room_code` text(6) PRIMARY KEY NOT NULL,
	`host_device_id` text(128) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`game_status` text DEFAULT 'waiting' NOT NULL,
	`phase` text DEFAULT 'lobby' NOT NULL,
	`winner_team` text,
	`board_size` integer DEFAULT 7 NOT NULL,
	`turn_time_limit` integer DEFAULT 30 NOT NULL,
	`max_players_per_team` integer DEFAULT 5 NOT NULL,
	`rounds_to_play` integer DEFAULT 5 NOT NULL,
	`current_round` integer DEFAULT 0 NOT NULL,
	`ended_at` integer,
	`is_private` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `game_sessions_status_idx` ON `game_sessions` (`game_status`);--> statement-breakpoint
CREATE TABLE `global_scores` (
	`player_id` text(36) PRIMARY KEY NOT NULL,
	`player_name` text(24) NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`captures` integer DEFAULT 0 NOT NULL,
	`games_played` integer DEFAULT 0 NOT NULL,
	`device_id` text(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `moves_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text(6) NOT NULL,
	`player_id` text(36) NOT NULL,
	`from_row` integer,
	`from_col` integer,
	`to_row` integer NOT NULL,
	`to_col` integer NOT NULL,
	`captured_token_player_id` text(36),
	`captured_token_team` text,
	`turn_number` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `game_sessions`(`room_code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `moves_room_turn_idx` ON `moves_history` (`room_code`,`turn_number`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`room_code` text(6) NOT NULL,
	`name` text(24) NOT NULL,
	`team` text,
	`token_emoji` text(8) DEFAULT '●' NOT NULL,
	`is_host` integer DEFAULT false NOT NULL,
	`is_online` integer DEFAULT true NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`joined_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`device_id` text(128) NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `game_sessions`(`room_code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `players_room_idx` ON `players` (`room_code`);--> statement-breakpoint
CREATE INDEX `players_device_idx` ON `players` (`device_id`);--> statement-breakpoint
CREATE TABLE `round_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`round_id` integer NOT NULL,
	`player_id` text(36) NOT NULL,
	`role` text NOT NULL,
	`has_seen_role` integer DEFAULT false NOT NULL,
	`points_awarded` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `game_rounds`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `round_players_round_player_idx` ON `round_players` (`round_id`,`player_id`);--> statement-breakpoint
CREATE INDEX `round_players_player_idx` ON `round_players` (`player_id`);