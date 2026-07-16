import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, gameRounds, gameSessions, players, roundPlayers } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { publicRolesForPhase } from "@/lib/raja-game";
import { roomCodeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";


type Context = { params: Promise<{ roomCode: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const { roomCode } = await context.params;
    roomCodeSchema.parse(roomCode);
    const [room] = await db.select().from(gameSessions).where(eq(gameSessions.roomCode, roomCode)).limit(1);
    if (!room) return Response.json({ error: "Room not found" }, { status: 404, headers: privacyHeaders() });
    const [rosterResult, messagesResult] = await Promise.all([
      db.select().from(players).where(eq(players.roomCode, roomCode)).orderBy(asc(players.joinedAt)),
      db.select().from(chatMessages).where(eq(chatMessages.roomCode, roomCode)).orderBy(desc(chatMessages.createdAt)).limit(50),
    ]);
    const roster = rosterResult as any[];
    const messages = messagesResult as any[];

    const requesterId = request.headers.get("x-player-id");
    const requesterDevice = getDeviceId(request);
    const requester = requesterId ? roster.find((player) => player.id === requesterId && player.deviceId === requesterDevice) : undefined;

    const baseResponse: any = {
      roomCode: room.roomCode,
      status: room.gameStatus,
      phase: room.phase,
      roundsToPlay: room.roundsToPlay,
      currentRound: room.currentRound,
      isPrivate: room.isPrivate,
      gameType: room.gameType,
      players: roster.map((player) => ({ id: player.id, name: player.name, score: player.score, isHost: player.isHost, isOnline: player.isOnline })),
      chat: messages.reverse().map((message) => ({ id: String(message.id), playerId: message.playerId, playerName: message.playerName, message: message.message, scope: message.scope, createdAt: new Date(message.createdAt).toISOString() })),
    };

    if (room.gameType !== "chor_sipahi") {
      baseResponse.gameState = room.gameState ? JSON.parse(room.gameState) : null;
      return Response.json(baseResponse, { headers: privacyHeaders() });
    }

    const [round] = room.currentRound > 0 ? await db.select().from(gameRounds).where(and(eq(gameRounds.roomCode, roomCode), eq(gameRounds.roundNumber, room.currentRound))).limit(1) : [];
    const assignments = (round ? await db.select().from(roundPlayers).where(eq(roundPlayers.roundId, round.id)) : []) as any[];

    const ownAssignment = requester ? assignments.find((assignment) => assignment.playerId === requester.id) : undefined;
    const publicRoles = publicRolesForPhase(room.phase, assignments.map((assignment) => ({ playerId: assignment.playerId, role: assignment.role })));
    const awards = Object.fromEntries(assignments.map((assignment) => [assignment.playerId, assignment.pointsAwarded]));

    return Response.json({
      ...baseResponse,
      myRole: ownAssignment?.role ?? null,
      hasSeenRole: ownAssignment?.hasSeenRole ?? false,
      rolesSeenCount: assignments.filter((assignment) => assignment.hasSeenRole).length,
      publicRoles,
      result: round && (room.phase === "round_result" || room.phase === "game_over") ? { mantriGuessPlayerId: round.mantriGuessPlayerId, isGuessCorrect: round.isGuessCorrect, awards } : null,
    }, { headers: privacyHeaders() });
  } catch {
    return Response.json({ error: "Could not load room state" }, { status: 400, headers: privacyHeaders() });
  }
}

