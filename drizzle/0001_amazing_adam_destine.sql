CREATE INDEX "game_sessions_status_idx" ON "game_sessions" USING btree ("game_status");--> statement-breakpoint
CREATE INDEX "moves_room_turn_idx" ON "moves_history" USING btree ("room_code","turn_number");--> statement-breakpoint
CREATE INDEX "players_room_team_idx" ON "players" USING btree ("room_code","team");--> statement-breakpoint
CREATE INDEX "players_device_idx" ON "players" USING btree ("device_id");