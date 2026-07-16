import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gameRounds, gameSessions, players, roundPlayers } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { assignRoles } from "@/lib/raja-game";
import { roomCodeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type Context = { params: Promise<{ roomCode: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { roomCode } = await context.params;
    roomCodeSchema.parse(roomCode);
    const deviceId = getDeviceId(request);
    const [room] = await db.select().from(gameSessions).where(eq(gameSessions.roomCode, roomCode)).limit(1);
    if (!room) return Response.json({ error: "Room not found" }, { status: 404, headers: privacyHeaders() });
    if (room.hostDeviceId !== deviceId) return Response.json({ error: "Only the host can start the game" }, { status: 403, headers: privacyHeaders() });
    if (room.gameStatus !== "waiting") return Response.json({ error: "Game is already active" }, { status: 409, headers: privacyHeaders() });
    const roster = (await db.select().from(players).where(eq(players.roomCode, roomCode))) as any[];
    if (roster.length !== 4) return Response.json({ error: `Exactly 4 players are needed. ${roster.length}/4 joined.` }, { status: 409, headers: privacyHeaders() });
    const assignments = assignRoles(roster.map((player) => player.id));
    await db.transaction(async (tx: any) => {
      const [round] = await tx.insert(gameRounds).values({ roomCode, roundNumber: 1 }).returning();
      await tx.insert(roundPlayers).values(assignments.map((assignment: any) => ({ roundId: round.id, playerId: assignment.playerId, role: assignment.role })));
      await tx.update(gameSessions).set({ gameStatus: "playing", phase: "role_reveal", currentRound: 1 }).where(and(eq(gameSessions.roomCode, roomCode), eq(gameSessions.gameStatus, "waiting")));

    });
    return Response.json({ ok: true }, { headers: privacyHeaders() });
  } catch {
    return Response.json({ error: "Could not start the game" }, { status: 400, headers: privacyHeaders() });
  }
}
