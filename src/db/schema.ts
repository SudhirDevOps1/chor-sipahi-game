import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const gameStatusValues = ["waiting", "playing", "finished"] as const;
export type GameStatus = (typeof gameStatusValues)[number];

export const teamValues = ["cops", "thieves"] as const;
export type Team = (typeof teamValues)[number];

export const gamePhaseValues = [
  "lobby",
  "role_reveal",
  "minister_reveal",
  "guess",
  "round_result",
  "game_over",
] as const;
export type GamePhase = (typeof gamePhaseValues)[number];

export const gameRoleValues = ["raja", "mantri", "chor", "sipahi"] as const;
export type GameRole = (typeof gameRoleValues)[number];

export const messageScopeValues = ["all", "team"] as const;
export type MessageScope = (typeof messageScopeValues)[number];

export const gameSessions = sqliteTable(
  "game_sessions",
  {
    roomCode: text("room_code", { length: 6 }).primaryKey(),
    hostDeviceId: text("host_device_id", { length: 128 }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    gameStatus: text("game_status", { enum: gameStatusValues })
      .default("waiting")
      .notNull(),
    phase: text("phase", { enum: gamePhaseValues }).default("lobby").notNull(),
    winnerTeam: text("winner_team", { enum: teamValues }),
    boardSize: integer("board_size").default(7).notNull(),
    turnTimeLimit: integer("turn_time_limit").default(30).notNull(),
    maxPlayersPerTeam: integer("max_players_per_team").default(5).notNull(),
    roundsToPlay: integer("rounds_to_play").default(5).notNull(),
    currentRound: integer("current_round").default(0).notNull(),
    endedAt: integer("ended_at", { mode: "timestamp" }),
    isPrivate: integer("is_private", { mode: "boolean" })
      .default(false)
      .notNull(),
    gameType: text("game_type").default("chor_sipahi").notNull(),
    gameState: text("game_state"),
  },
  (table) => ({
    statusIndex: index("game_sessions_status_idx").on(table.gameStatus),
  }),
);

export const players = sqliteTable(
  "players",
  {
    id: text("id", { length: 36 }).primaryKey(),
    roomCode: text("room_code", { length: 6 })
      .references(() => gameSessions.roomCode, { onDelete: "cascade" })
      .notNull(),
    name: text("name", { length: 24 }).notNull(),
    team: text("team", { enum: teamValues }),
    tokenEmoji: text("token_emoji", { length: 8 }).default("●").notNull(),
    isHost: integer("is_host", { mode: "boolean" }).default(false).notNull(),
    isOnline: integer("is_online", { mode: "boolean" }).default(true).notNull(),
    score: integer("score").default(0).notNull(),
    joinedAt: integer("joined_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    deviceId: text("device_id", { length: 128 }).notNull(),
  },
  (table) => ({
    roomIndex: index("players_room_idx").on(table.roomCode),
    deviceIndex: index("players_device_idx").on(table.deviceId),
  }),
);

export const gameRounds = sqliteTable(
  "game_rounds",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomCode: text("room_code", { length: 6 })
      .references(() => gameSessions.roomCode, { onDelete: "cascade" })
      .notNull(),
    roundNumber: integer("round_number").notNull(),
    mantriGuessPlayerId: text("mantri_guess_player_id", { length: 36 }),
    isGuessCorrect: integer("is_guess_correct", { mode: "boolean" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
  },
  (table) => ({
    roomRoundIndex: uniqueIndex("game_rounds_room_round_idx").on(
      table.roomCode,
      table.roundNumber,
    ),
  }),
);

export const roundPlayers = sqliteTable(
  "round_players",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roundId: integer("round_id")
      .references(() => gameRounds.id, { onDelete: "cascade" })
      .notNull(),
    playerId: text("player_id", { length: 36 })
      .references(() => players.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role", { enum: gameRoleValues }).notNull(),
    hasSeenRole: integer("has_seen_role", { mode: "boolean" })
      .default(false)
      .notNull(),
    pointsAwarded: integer("points_awarded").default(0).notNull(),
  },
  (table) => ({
    roundPlayerIndex: uniqueIndex("round_players_round_player_idx").on(
      table.roundId,
      table.playerId,
    ),
    playerIndex: index("round_players_player_idx").on(table.playerId),
  }),
);

export const movesHistory = sqliteTable(
  "moves_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomCode: text("room_code", { length: 6 })
      .references(() => gameSessions.roomCode, { onDelete: "cascade" })
      .notNull(),
    playerId: text("player_id", { length: 36 }).notNull(),
    fromRow: integer("from_row"),
    fromCol: integer("from_col"),
    toRow: integer("to_row").notNull(),
    toCol: integer("to_col").notNull(),
    capturedTokenPlayerId: text("captured_token_player_id", { length: 36 }),
    capturedTokenTeam: text("captured_token_team", { enum: teamValues }),
    turnNumber: integer("turn_number").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(strftime('%s', 'now') * 1000)`)
      .notNull(),
  },
  (table) => ({
    roomTurnIndex: index("moves_room_turn_idx").on(
      table.roomCode,
      table.turnNumber,
    ),
  }),
);

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code", { length: 6 })
    .references(() => gameSessions.roomCode, { onDelete: "cascade" })
    .notNull(),
  playerId: text("player_id", { length: 36 }).notNull(),
  playerName: text("player_name", { length: 24 }).notNull(),
  message: text("message", { length: 280 }).notNull(),
  scope: text("scope", { enum: messageScopeValues }).default("all").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
});

export const globalScores = sqliteTable("global_scores", {
  playerId: text("player_id", { length: 36 }).primaryKey(),
  playerName: text("player_name", { length: 24 }).notNull(),
  wins: integer("wins").default(0).notNull(),
  captures: integer("captures").default(0).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  deviceId: text("device_id", { length: 128 }).notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type Player = typeof players.$inferSelect;
export type GameRound = typeof gameRounds.$inferSelect;
export type RoundPlayer = typeof roundPlayers.$inferSelect;
