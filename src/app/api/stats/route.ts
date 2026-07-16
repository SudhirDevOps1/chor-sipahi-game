import { desc } from "drizzle-orm";
import { db } from "@/db";
import { players } from "@/db/schema";
import { privacyHeaders } from "@/lib/privacy";

export const dynamic = "force-dynamic";

export async function GET() {
  const leaderboard = await db
    .select({ id: players.id, name: players.name, score: players.score })
    .from(players)
    .orderBy(desc(players.score))
    .limit(10);
  return Response.json({ leaderboard }, { headers: privacyHeaders() });
}
