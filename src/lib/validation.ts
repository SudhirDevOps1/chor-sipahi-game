import { z } from "zod";

export const roomCodeSchema = z.string().regex(/^\d{6}$/);
export const roundsSchema = z.union([z.literal(3), z.literal(5), z.literal(10)]);

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(2).max(24),
  roundsToPlay: roundsSchema.default(5),
  isPrivate: z.boolean().default(true),
  gameType: z.string().default("chor_sipahi"),
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(2).max(24),
});

export const roomActionSchema = z.object({
  type: z.string(),
  playerId: z.string().uuid().optional(),
}).passthrough();


export const chatSchema = z.object({
  playerId: z.string().uuid(),
  message: z.string().trim().min(1).max(280),
  scope: z.enum(["all", "team"]).default("all"),
});
