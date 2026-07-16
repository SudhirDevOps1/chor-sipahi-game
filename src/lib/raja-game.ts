import type { GameRole } from "@/shared/types";

export const ROLE_DETAILS: Record<
  GameRole,
  {
    title: string;
    hindi: string;
    icon: string;
    basePoints: number;
    description: string;
  }
> = {
  raja: {
    title: "Raja",
    hindi: "राजा",
    icon: "👑",
    basePoints: 1000,
    description: "Call for your Mantri. Your 1,000 points are secure.",
  },
  mantri: {
    title: "Mantri",
    hindi: "मंत्री",
    icon: "🗡️",
    basePoints: 800,
    description: "Reveal yourself, then identify the Chor.",
  },
  chor: {
    title: "Chor",
    hindi: "चोर",
    icon: "💰",
    basePoints: 0,
    description: "Stay unreadable. A wrong Mantri guess gives you 800 points.",
  },
  sipahi: {
    title: "Sipahi",
    hindi: "सिपाही",
    icon: "🛡️",
    basePoints: 500,
    description: "Keep your identity hidden. Your 500 points are secure.",
  },
};

export function assignRoles(
  playerIds: string[],
): Array<{ playerId: string; role: GameRole }> {
  if (playerIds.length !== 4)
    throw new Error("Exactly four players are required");
  const roles: GameRole[] = ["raja", "mantri", "chor", "sipahi"];
  for (let index = roles.length - 1; index > 0; index -= 1) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const swapIndex = buffer[0] % (index + 1);
    [roles[index], roles[swapIndex]] = [roles[swapIndex], roles[index]];
  }
  return playerIds.map((playerId, index) => ({ playerId, role: roles[index] }));
}

export function calculateAwards(
  assignments: Array<{ playerId: string; role: GameRole }>,
  guessedPlayerId: string,
) {
  const chor = assignments.find((assignment) => assignment.role === "chor");
  const correct = chor?.playerId === guessedPlayerId;
  const awards: Record<string, number> = {};
  assignments.forEach((assignment) => {
    if (assignment.role === "raja") awards[assignment.playerId] = 1000;
    if (assignment.role === "sipahi") awards[assignment.playerId] = 500;
    if (assignment.role === "mantri")
      awards[assignment.playerId] = correct ? 800 : 0;
    if (assignment.role === "chor")
      awards[assignment.playerId] = correct ? 0 : 800;
  });
  return { correct, awards };
}

export function publicRolesForPhase(
  phase: string,
  assignments: Array<{ playerId: string; role: GameRole }>,
): Partial<Record<GameRole, string>> {
  if (phase === "role_reveal") return {};
  const raja = assignments.find(
    (assignment) => assignment.role === "raja",
  )?.playerId;
  if (phase === "minister_reveal") return raja ? { raja } : {};
  const mantri = assignments.find(
    (assignment) => assignment.role === "mantri",
  )?.playerId;
  if (phase === "guess")
    return { ...(raja ? { raja } : {}), ...(mantri ? { mantri } : {}) };
  return Object.fromEntries(
    assignments.map((assignment) => [assignment.role, assignment.playerId]),
  ) as Record<GameRole, string>;
}
