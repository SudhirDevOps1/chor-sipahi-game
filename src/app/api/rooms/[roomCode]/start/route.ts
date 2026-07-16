import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gameRounds, gameSessions, players, roundPlayers } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { assignRoles } from "@/lib/raja-game";
import { roomCodeSchema } from "@/lib/validation";
import { initTicTacToe } from "@/lib/games/tic-tac-toe";
import { initRps } from "@/lib/games/rps";
import { initConnectFour } from "@/lib/games/connect-four";
import { initLudo } from "@/lib/games/ludo";

export const dynamic = "force-dynamic";


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
    const limit = ["tic_tac_toe", "rps", "connect_four"].includes(room.gameType) ? 2 : 4;
    if (roster.length !== limit) return Response.json({ error: `Exactly ${limit} players are needed. ${roster.length}/${limit} joined.` }, { status: 409, headers: privacyHeaders() });

    if (room.gameType === "chor_sipahi") {
      const assignments = assignRoles(roster.map((player) => player.id));
      await db.transaction(async (tx: any) => {
        const [round] = await tx.insert(gameRounds).values({ roomCode, roundNumber: 1 }).returning();
        await tx.insert(roundPlayers).values(assignments.map((assignment: any) => ({ roundId: round.id, playerId: assignment.playerId, role: assignment.role })));
        await tx.update(gameSessions).set({ gameStatus: "playing", phase: "role_reveal", currentRound: 1 }).where(and(eq(gameSessions.roomCode, roomCode), eq(gameSessions.gameStatus, "waiting")));
      });
    } else {
      let initialState: any = null;
      if (room.gameType === "tic_tac_toe") initialState = initTicTacToe(roster);
      else if (room.gameType === "rps") initialState = initRps(roster);
      else if (room.gameType === "connect_four") initialState = initConnectFour(roster);
      else if (room.gameType === "ludo") initialState = initLudo(roster);

      await db.update(gameSessions)
        .set({ gameStatus: "playing", phase: "playing", gameState: JSON.stringify(initialState) })
        .where(eq(gameSessions.roomCode, roomCode));
    }
    return Response.json({ ok: true }, { headers: privacyHeaders() });
  } catch {
    return Response.json({ error: "Could not start the game" }, { status: 400, headers: privacyHeaders() });
  }
}

