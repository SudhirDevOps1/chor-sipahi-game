export interface TicTacToeState {
  board: (string | null)[]; // 9 cells
  currentPlayerId: string;
  winnerId: string | null; // or "draw"
  roundsPlayed: number;
}

export function initTicTacToe(players: { id: string }[]): TicTacToeState {
  return {
    board: Array(9).fill(null),
    currentPlayerId: players[0].id,
    winnerId: null,
    roundsPlayed: 1,
  };
}

export function handleTicTacToeAction(
  state: TicTacToeState,
  action: { type: string; cellIndex?: number },
  playerId: string,
  players: { id: string }[]
): TicTacToeState {
  if (playerId !== state.currentPlayerId) {
    throw new Error("Not your turn!");
  }
  if (state.winnerId && action.type !== "restart") {
    throw new Error("Game is already finished!");
  }

  if (action.type === "make_move") {
    const idx = action.cellIndex;
    if (idx === undefined || idx < 0 || idx > 8) {
      throw new Error("Invalid move index");
    }
    if (state.board[idx] !== null) {
      throw new Error("Cell already taken");
    }

    const nextBoard = [...state.board];
    const isPlayer1 = playerId === players[0].id;
    nextBoard[idx] = isPlayer1 ? "X" : "O";

    const winnerSymbol = checkWinner(nextBoard);
    let nextWinner: string | null = null;
    if (winnerSymbol === "X") {
      nextWinner = players[0].id;
    } else if (winnerSymbol === "O") {
      nextWinner = players[1].id;
    } else if (nextBoard.every((cell) => cell !== null)) {
      nextWinner = "draw";
    }

    const nextPlayerId = isPlayer1 ? players[1].id : players[0].id;

    return {
      ...state,
      board: nextBoard,
      currentPlayerId: nextPlayerId,
      winnerId: nextWinner,
    };
  }

  if (action.type === "restart") {
    return initTicTacToe(players);
  }

  return state;
}

function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
