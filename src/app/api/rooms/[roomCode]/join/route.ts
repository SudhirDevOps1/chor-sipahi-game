import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gameSessions, players } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { joinRoomSchema, roomCodeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";


type Context = { params: Promise<{ roomCode: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { roomCode } = await context.params;
    roomCodeSchema.parse(roomCode);
    const input = joinRoomSchema.parse(await request.json());
    const [room] = await db.select().from(gameSessions).where(eq(gameSessions.roomCode, roomCode)).limit(1);
    if (!room) return Response.json({ error: "Room not found" }, { status: 404, headers: privacyHeaders() });
    if (room.gameStatus !== "waiting") return Response.json({ error: "This game has already started" }, { status: 409, headers: privacyHeaders() });
    const deviceId = getDeviceId(request);
    const [existing] = await db.select().from(players).where(and(eq(players.roomCode, roomCode), eq(players.deviceId, deviceId))).limit(1);
    if (existing) return Response.json({ roomCode, playerId: existing.id }, { headers: privacyHeaders() });
    const roster = await db.select({ id: players.id }).from(players).where(eq(players.roomCode, roomCode));
    const limit = ["tic_tac_toe", "rps", "connect_four"].includes(room.gameType) ? 2 : 4;
    if (roster.length >= limit) return Response.json({ error: `This room already has ${limit} players` }, { status: 409, headers: privacyHeaders() });


    const playerId = crypto.randomUUID();
    await db.insert(players).values({ id: playerId, roomCode, name: input.playerName, tokenEmoji: "●", deviceId });
    return Response.json({ roomCode, playerId }, { status: 201, headers: privacyHeaders() });
  } catch (error) {
    const message = error instanceof Error && error.name === "ZodError" ? "Invalid room code or alias" : "Could not join the room";
    return Response.json({ error: message }, { status: 400, headers: privacyHeaders() });
  }
}
