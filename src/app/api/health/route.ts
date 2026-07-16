import { db } from "@/db";
import { gameSessions } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.select({ roomCode: gameSessions.roomCode }).from(gameSessions).limit(1);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
