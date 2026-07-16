export interface LudoState {
  currentPlayerId: string;
  diceRoll: number | null;
  hasRolled: boolean;
  playerTokens: Record<string, number[]>; // playerId -> token steps (length 2, value -1 for yard, 0..30 where 30 is home)
  winnerId: string | null;
}

export function initLudo(players: { id: string }[]): LudoState {
  const tokens: Record<string, number[]> = {};
  for (const player of players) {
    tokens[player.id] = [-1, -1]; // Yard state
  }
  return {
    currentPlayerId: players[0].id,
    diceRoll: null,
    hasRolled: false,
    playerTokens: tokens,
    winnerId: null,
  };
}

export function handleLudoAction(
  state: LudoState,
  action: { type: string; tokenIndex?: number },
  playerId: string,
  players: { id: string }[]
): LudoState {
  if (playerId !== state.currentPlayerId) {
    throw new Error("Not your turn!");
  }
  if (state.winnerId && action.type !== "restart") {
    throw new Error("Game is already finished!");
  }

  const nextState = { ...state, playerTokens: { ...state.playerTokens } };

  if (action.type === "roll_die") {
    if (state.hasRolled) {
      throw new Error("Already rolled, select a token to move!");
    }
    const roll = Math.floor(Math.random() * 6) + 1;
    nextState.diceRoll = roll;
    nextState.hasRolled = true;

    // Check if player has any valid moves
    const tokens = nextState.playerTokens[playerId];
    const canMoveAny = tokens.some((pos) => {
      if (pos === -1 && roll !== 6) return false; // Needs 6 to exit yard
      if (pos + roll > 30) return false; // Over-reaching home
      return true;
    });

    if (!canMoveAny) {
      // No moves possible, skip turn immediately
      nextState.hasRolled = false;
      const nextIdx = (players.findIndex((p) => p.id === playerId) + 1) % players.length;
      nextState.currentPlayerId = players[nextIdx].id;
    }

    return nextState;
  }

  if (action.type === "move_token") {
    if (!state.hasRolled || state.diceRoll === null) {
      throw new Error("Roll the die first!");
    }
    const idx = action.tokenIndex;
    if (idx === undefined || idx < 0 || idx > 1) {
      throw new Error("Invalid token index selection");
    }

    const roll = state.diceRoll;
    const tokens = [...nextState.playerTokens[playerId]];
    const pos = tokens[idx];

    if (pos === -1 && roll !== 6) {
      throw new Error("Must roll a 6 to enter track");
    }
    if (pos + roll > 30) {
      throw new Error("Token overshoot home boundary");
    }

    // Update position
    const nextPos = pos === -1 ? 0 : pos + roll;
    tokens[idx] = nextPos;
    nextState.playerTokens[playerId] = tokens;

    // Check for "kills" (landing on opponent piece)
    if (nextPos > 0 && nextPos < 30) {
      for (const otherPlayerId of Object.keys(nextState.playerTokens)) {
        if (otherPlayerId === playerId) continue;
        const otherTokens = [...nextState.playerTokens[otherPlayerId]];
        let killed = false;
        for (let i = 0; i < 2; i++) {
          if (otherTokens[i] === nextPos) {
            otherTokens[i] = -1; // Send back to yard
            killed = true;
          }
        }
        if (killed) {
          nextState.playerTokens[otherPlayerId] = otherTokens;
        }
      }
    }

    // Check winner (both tokens reached step 30)
    if (tokens[0] === 30 && tokens[1] === 30) {
      nextState.winnerId = playerId;
    }

    // Pass turn to next player
    nextState.hasRolled = false;
    nextState.diceRoll = null;
    const nextIdx = (players.findIndex((p) => p.id === playerId) + 1) % players.length;
    nextState.currentPlayerId = players[nextIdx].id;

    return nextState;
  }

  if (action.type === "restart") {
    return initLudo(players);
  }

  return state;
}
