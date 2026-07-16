export interface RpsState {
  player1Id: string;
  player2Id: string;
  player1Choice: string | null;
  player2Choice: string | null;
  player1Score: number;
  player2Score: number;
  roundWinnerId: string | null; // "draw" or playerId or null
  winnerId: string | null;
  round: number;
}

export function initRps(players: { id: string }[]): RpsState {
  return {
    player1Id: players[0].id,
    player2Id: players[1].id,
    player1Choice: null,
    player2Choice: null,
    player1Score: 0,
    player2Score: 0,
    roundWinnerId: null,
    winnerId: null,
    round: 1,
  };
}

export function handleRpsAction(
  state: RpsState,
  action: { type: string; choice?: string },
  playerId: string,
  players: { id: string }[]
): RpsState {
  if (state.winnerId && action.type !== "restart") {
    throw new Error("Game is already finished!");
  }

  if (action.type === "make_choice") {
    const choice = action.choice;
    if (!choice || !["rock", "paper", "scissors"].includes(choice)) {
      throw new Error("Invalid choice selection");
    }

    let nextState = { ...state };
    if (playerId === state.player1Id) {
      if (nextState.player1Choice) throw new Error("Choice already submitted");
      nextState.player1Choice = choice;
    } else if (playerId === state.player2Id) {
      if (nextState.player2Choice) throw new Error("Choice already submitted");
      nextState.player2Choice = choice;
    } else {
      throw new Error("Not a player in this room");
    }

    // Evaluate choices if both have submitted
    if (nextState.player1Choice && nextState.player2Choice) {
      const c1 = nextState.player1Choice;
      const c2 = nextState.player2Choice;

      let roundWinner: string | null = null;
      if (c1 === c2) {
        roundWinner = "draw";
      } else if (
        (c1 === "rock" && c2 === "scissors") ||
        (c1 === "paper" && c2 === "rock") ||
        (c1 === "scissors" && c2 === "paper")
      ) {
        roundWinner = state.player1Id;
        nextState.player1Score += 1;
      } else {
        roundWinner = state.player2Id;
        nextState.player2Score += 1;
      }

      nextState.roundWinnerId = roundWinner;

      // Check if someone reached 3 points (best of 5)
      if (nextState.player1Score >= 3) {
        nextState.winnerId = state.player1Id;
      } else if (nextState.player2Score >= 3) {
        nextState.winnerId = state.player2Id;
      }
    }

    return nextState;
  }

  if (action.type === "next_round") {
    if (!state.player1Choice || !state.player2Choice) {
      throw new Error("Cannot progress, both players must choose first");
    }
    return {
      ...state,
      player1Choice: null,
      player2Choice: null,
      roundWinnerId: null,
      round: state.round + 1,
    };
  }

  if (action.type === "restart") {
    return initRps(players);
  }

  return state;
}
