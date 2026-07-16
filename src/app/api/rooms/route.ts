import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { gameSessions, players } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { createRoomSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

function createRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function GET() {
  try {
    const rooms = (await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.gameStatus, "waiting"))
      .orderBy(gameSessions.createdAt)
      .limit(20)) as any[];

    const summaries = await Promise.all(
      rooms
        .filter((room) => !room.isPrivate)
        .map(async (room) => {
          const roster = await db
            .select({ id: players.id })
            .from(players)
            .where(eq(players.roomCode, room.roomCode));
          const maxPlayers = ["tic_tac_toe", "rps", "connect_four"].includes(
            room.gameType,
          )
            ? 2
            : 4;
          return {
            roomCode: room.roomCode,
            roundsToPlay: room.roundsToPlay,
            playersCount: roster.length,
            maxPlayers,
            createdAt: new Date(room.createdAt).toISOString(),
            status: room.gameStatus,
            gameType: room.gameType,
          };
        }),
    );
    return Response.json({ rooms: summaries }, { headers: privacyHeaders() });
  } catch {
    return Response.json(
      { error: "Could not load rooms" },
      { status: 500, headers: privacyHeaders() },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Auto-cleanup rooms older than 30 days (cascading deletes will clear players, chat, and round state)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db
      .delete(gameSessions)
      .where(lt(gameSessions.createdAt, thirtyDaysAgo));

    const input = createRoomSchema.parse(await request.json());
    const deviceId = getDeviceId(request);
    let roomCode = createRoomCode();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const [existing] = await db
        .select({ roomCode: gameSessions.roomCode })
        .from(gameSessions)
        .where(eq(gameSessions.roomCode, roomCode))
        .limit(1);
      if (!existing) break;
      roomCode = createRoomCode();
    }
    const playerId = crypto.randomUUID();
    await db
      .insert(gameSessions)
      .values({
        roomCode,
        hostDeviceId: deviceId,
        roundsToPlay: input.roundsToPlay,
        isPrivate: input.isPrivate,
        phase: "lobby",
        gameType: input.gameType,
      });

    await db
      .insert(players)
      .values({
        id: playerId,
        roomCode,
        name: input.playerName,
        tokenEmoji: "👑",
        isHost: true,
        deviceId,
      });
    return Response.json(
      { roomCode, playerId },
      { status: 201, headers: privacyHeaders() },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.name === "ZodError"
        ? "Enter a valid alias and number of rounds"
        : "Could not create the room";
    return Response.json(
      { error: message },
      { status: 400, headers: privacyHeaders() },
    );
  }
}
