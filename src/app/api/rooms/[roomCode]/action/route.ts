import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { gameRounds, gameSessions, players, roundPlayers } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { assignRoles, calculateAwards } from "@/lib/raja-game";
import { roomActionSchema, roomCodeSchema } from "@/lib/validation";
import { handleTicTacToeAction } from "@/lib/games/tic-tac-toe";
import { handleRpsAction } from "@/lib/games/rps";
import { handleConnectFourAction } from "@/lib/games/connect-four";
import { handleLudoAction } from "@/lib/games/ludo";

export const dynamic = "force-dynamic";


type Context = { params: Promise<{ roomCode: string }> };

async function getCurrentRound(roomCode: string, roundNumber: number) {
  const [round] = await db.select().from(gameRounds).where(and(eq(gameRounds.roomCode, roomCode), eq(gameRounds.roundNumber, roundNumber))).limit(1);
  return round;
}

export async function POST(request: Request, context: Context) {
  try {
    const { roomCode } = await context.params;
    roomCodeSchema.parse(roomCode);
    const action = roomActionSchema.parse(await request.json());
    if (!action.playerId) return Response.json({ error: "Missing player credentials" }, { status: 400, headers: privacyHeaders() });
    const deviceId = getDeviceId(request);
    const [room] = await db.select().from(gameSessions).where(eq(gameSessions.roomCode, roomCode)).limit(1);
    if (!room) return Response.json({ error: "Room not found" }, { status: 404, headers: privacyHeaders() });
    const [actor] = await db.select().from(players).where(and(eq(players.id, action.playerId), eq(players.roomCode, roomCode), eq(players.deviceId, deviceId))).limit(1);

    if (!actor) return Response.json({ error: "Your guest session is not valid for this room" }, { status: 403, headers: privacyHeaders() });

    const roster = (await db.select().from(players).where(eq(players.roomCode, roomCode)).orderBy(asc(players.joinedAt))) as any[];

    if (room.gameType !== "chor_sipahi") {
      let state = room.gameState ? JSON.parse(room.gameState) : null;
      let nextState: any = null;

      try {
        if (room.gameType === "tic_tac_toe") {
          nextState = handleTicTacToeAction(state, action, actor.id, roster);
        } else if (room.gameType === "rps") {
          nextState = handleRpsAction(state, action, actor.id, roster);
        } else if (room.gameType === "connect_four") {
          nextState = handleConnectFourAction(state, action, actor.id, roster);
        } else if (room.gameType === "ludo") {
          nextState = handleLudoAction(state, action, actor.id, roster);
        }
      } catch (err: any) {
        return Response.json({ error: err.message || "Invalid move" }, { status: 400, headers: privacyHeaders() });
      }

      const updateData: any = {
        gameState: JSON.stringify(nextState),
      };

      if (nextState.winnerId) {
        updateData.gameStatus = "finished";
        updateData.phase = "game_over";
        updateData.endedAt = new Date();

        // Award score to the winner
        if (nextState.winnerId !== "draw") {
          await db.update(players)
            .set({ score: sql`${players.score} + 100` })
            .where(eq(players.id, nextState.winnerId));
        }
      }

      await db.update(gameSessions).set(updateData).where(eq(gameSessions.roomCode, roomCode));
      return Response.json({ ok: true }, { headers: privacyHeaders() });
    }

    const currentRound = await getCurrentRound(roomCode, room.currentRound);
    if (!currentRound) return Response.json({ error: "No active round exists" }, { status: 409, headers: privacyHeaders() });
    const assignments = (await db.select().from(roundPlayers).where(eq(roundPlayers.roundId, currentRound.id))) as any[];
    const actorAssignment = assignments.find((assignment) => assignment.playerId === actor.id);



    if (action.type === "acknowledge_role") {
      if (room.phase !== "role_reveal" || !actorAssignment) return Response.json({ error: "Role confirmation is not available now" }, { status: 409, headers: privacyHeaders() });
      await db.update(roundPlayers).set({ hasSeenRole: true }).where(and(eq(roundPlayers.roundId, currentRound.id), eq(roundPlayers.playerId, actor.id)));
      const confirmed = await db.select().from(roundPlayers).where(and(eq(roundPlayers.roundId, currentRound.id), eq(roundPlayers.hasSeenRole, true)));
      if (confirmed.length === 4) await db.update(gameSessions).set({ phase: "minister_reveal" }).where(eq(gameSessions.roomCode, roomCode));
      return Response.json({ ok: true }, { headers: privacyHeaders() });
    }

    if (action.type === "reveal_mantri") {
      if (room.phase !== "minister_reveal" || actorAssignment?.role !== "mantri") return Response.json({ error: "Only the Mantri can reveal at this moment" }, { status: 403, headers: privacyHeaders() });
      await db.update(gameSessions).set({ phase: "guess" }).where(eq(gameSessions.roomCode, roomCode));
      return Response.json({ ok: true }, { headers: privacyHeaders() });
    }

    if (action.type === "guess_chor") {
      if (room.phase !== "guess" || actorAssignment?.role !== "mantri") return Response.json({ error: "Only the Mantri can make this guess" }, { status: 403, headers: privacyHeaders() });
      const suspectPlayerId = action.suspectPlayerId as string;
      const suspect = assignments.find((assignment) => assignment.playerId === suspectPlayerId);
      if (!suspect || !["chor", "sipahi"].includes(suspect.role)) return Response.json({ error: "Choose one of the two unknown players" }, { status: 400, headers: privacyHeaders() });
      const result = calculateAwards(assignments.map((assignment) => ({ playerId: assignment.playerId, role: assignment.role })), suspectPlayerId);
      await db.transaction(async (tx: any) => {
        await Promise.all(assignments.map((assignment) => tx.update(roundPlayers).set({ pointsAwarded: result.awards[assignment.playerId] ?? 0 }).where(eq(roundPlayers.id, assignment.id))));
        await Promise.all(assignments.map((assignment) => tx.update(players).set({ score: sql`${players.score} + ${result.awards[assignment.playerId] ?? 0}` }).where(eq(players.id, assignment.playerId))));
        await tx.update(gameRounds).set({ mantriGuessPlayerId: suspectPlayerId, isGuessCorrect: result.correct, finishedAt: new Date() }).where(eq(gameRounds.id, currentRound.id));
        const finalRound = room.currentRound >= room.roundsToPlay;
        await tx.update(gameSessions).set({ phase: finalRound ? "game_over" : "round_result", gameStatus: finalRound ? "finished" : "playing", endedAt: finalRound ? new Date() : null }).where(eq(gameSessions.roomCode, roomCode));
      });

      return Response.json({ ok: true }, { headers: privacyHeaders() });
    }

    if (action.type === "next_round") {
      if (!actor.isHost || room.phase !== "round_result") return Response.json({ error: "Only the host can begin the next round" }, { status: 403, headers: privacyHeaders() });
      const roster = (await db.select().from(players).where(eq(players.roomCode, roomCode))) as any[];

      const nextRoundNumber = room.currentRound + 1;
      if (nextRoundNumber > room.roundsToPlay || roster.length !== 4) return Response.json({ error: "Cannot start another round" }, { status: 409, headers: privacyHeaders() });
      const newAssignments = assignRoles(roster.map((player) => player.id));
      await db.transaction(async (tx: any) => {
        const [round] = await tx.insert(gameRounds).values({ roomCode, roundNumber: nextRoundNumber }).returning();
        await tx.insert(roundPlayers).values(newAssignments.map((assignment) => ({ roundId: round.id, playerId: assignment.playerId, role: assignment.role })));
        await tx.update(gameSessions).set({ currentRound: nextRoundNumber, phase: "role_reveal" }).where(eq(gameSessions.roomCode, roomCode));
      });
      return Response.json({ ok: true }, { headers: privacyHeaders() });
    }

    return Response.json({ error: "Unknown game action" }, { status: 400, headers: privacyHeaders() });
  } catch (error) {
    const message = error instanceof Error && error.name === "ZodError" ? "Invalid game action" : "Could not complete that action";
    return Response.json({ error: message }, { status: 400, headers: privacyHeaders() });
  }
}
