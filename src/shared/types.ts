export type GameRole = "raja" | "mantri" | "chor" | "sipahi";
export type GamePhase = "lobby" | "role_reveal" | "minister_reveal" | "guess" | "round_result" | "game_over";
export type GameStatus = "waiting" | "playing" | "finished";
export type MessageScope = "all" | "team";

export interface RolePlayer {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isOnline: boolean;
}

export interface ChatItem {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  scope: MessageScope;
  createdAt: string;
}

export interface RoundResult {
  mantriGuessPlayerId: string | null;
  isGuessCorrect: boolean | null;
  awards: Record<string, number>;
}

export interface RajaGameState {
  roomCode: string;
  status: GameStatus;
  phase: GamePhase;
  roundsToPlay: number;
  currentRound: number;
  isPrivate: boolean;
  gameType: string;
  gameState?: any;
  players: RolePlayer[];
  myRole: GameRole | null;
  hasSeenRole: boolean;
  rolesSeenCount: number;
  publicRoles: Partial<Record<GameRole, string>>;
  result: RoundResult | null;
  chat: ChatItem[];
}

export interface RoomSummary {
  roomCode: string;
  roundsToPlay: number;
  playersCount: number;
  maxPlayers: number;
  createdAt: string;
  status: GameStatus;
  gameType: string;
}


export interface GuestIdentity {
  deviceId: string;
  label: string;
}
