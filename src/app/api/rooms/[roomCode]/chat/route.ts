import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, players } from "@/db/schema";
import { getDeviceId, privacyHeaders } from "@/lib/privacy";
import { chatSchema, roomCodeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";


type Context = { params: Promise<{ roomCode: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { roomCode } = await context.params;
    roomCodeSchema.parse(roomCode);
    const input = chatSchema.parse(await request.json());
    const deviceId = getDeviceId(request);
    const [player] = await db.select().from(players).where(and(eq(players.id, input.playerId), eq(players.roomCode, roomCode), eq(players.deviceId, deviceId))).limit(1);
    if (!player) return Response.json({ error: "Invalid player session" }, { status: 403, headers: privacyHeaders() });
    const [message] = await db.insert(chatMessages).values({ roomCode, playerId: player.id, playerName: player.name, message: input.message, scope: "all" }).returning();
    return Response.json({ id: String(message.id), createdAt: new Date(message.createdAt).toISOString() }, { status: 201, headers: privacyHeaders() });

  } catch {
    return Response.json({ error: "Could not send message" }, { status: 400, headers: privacyHeaders() });
  }
}
