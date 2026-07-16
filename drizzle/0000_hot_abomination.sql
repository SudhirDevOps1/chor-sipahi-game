CREATE TYPE "public"."game_status" AS ENUM('waiting', 'playing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."message_scope" AS ENUM('all', 'team');--> statement-breakpoint
CREATE TYPE "public"."team" AS ENUM('cops', 'thieves');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" varchar(6) NOT NULL,
	"player_id" varchar(36) NOT NULL,
	"player_name" varchar(24) NOT NULL,
	"message" varchar(280) NOT NULL,
	"scope" "message_scope" DEFAULT 'all' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"room_code" varchar(6) PRIMARY KEY NOT NULL,
	"host_device_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"game_status" "game_status" DEFAULT 'waiting' NOT NULL,
	"winner_team" "team",
	"board_size" integer DEFAULT 7 NOT NULL,
	"turn_time_limit" integer DEFAULT 30 NOT NULL,
	"max_players_per_team" integer DEFAULT 5 NOT NULL,
	"ended_at" timestamp with time zone,
	"is_private" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_scores" (
	"player_id" varchar(36) PRIMARY KEY NOT NULL,
	"player_name" varchar(24) NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"captures" integer DEFAULT 0 NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"device_id" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moves_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" varchar(6) NOT NULL,
	"player_id" varchar(36) NOT NULL,
	"from_row" integer,
	"from_col" integer,
	"to_row" integer NOT NULL,
	"to_col" integer NOT NULL,
	"captured_token_player_id" varchar(36),
	"captured_token_team" "team",
	"turn_number" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"room_code" varchar(6) NOT NULL,
	"name" varchar(24) NOT NULL,
	"team" "team",
	"token_emoji" varchar(8) DEFAULT '●' NOT NULL,
	"is_host" boolean DEFAULT false NOT NULL,
	"is_online" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"device_id" varchar(128) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_code_game_sessions_room_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."game_sessions"("room_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moves_history" ADD CONSTRAINT "moves_history_room_code_game_sessions_room_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."game_sessions"("room_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_room_code_game_sessions_room_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."game_sessions"("room_code") ON DELETE cascade ON UPDATE no action;