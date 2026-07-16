CREATE TYPE "public"."game_phase" AS ENUM('lobby', 'role_reveal', 'minister_reveal', 'guess', 'round_result', 'game_over');--> statement-breakpoint
CREATE TYPE "public"."game_role" AS ENUM('raja', 'mantri', 'chor', 'sipahi');--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" varchar(6) NOT NULL,
	"round_number" integer NOT NULL,
	"mantri_guess_player_id" varchar(36),
	"is_guess_correct" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "round_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"round_id" integer NOT NULL,
	"player_id" varchar(36) NOT NULL,
	"role" "game_role" NOT NULL,
	"has_seen_role" boolean DEFAULT false NOT NULL,
	"points_awarded" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DROP INDEX "players_room_team_idx";--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "phase" "game_phase" DEFAULT 'lobby' NOT NULL;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "rounds_to_play" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD COLUMN "current_round" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_room_code_game_sessions_room_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."game_sessions"("room_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_players" ADD CONSTRAINT "round_players_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_players" ADD CONSTRAINT "round_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "game_rounds_room_round_idx" ON "game_rounds" USING btree ("room_code","round_number");--> statement-breakpoint
CREATE UNIQUE INDEX "round_players_round_player_idx" ON "round_players" USING btree ("round_id","player_id");--> statement-breakpoint
CREATE INDEX "round_players_player_idx" ON "round_players" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "players_room_idx" ON "players" USING btree ("room_code");