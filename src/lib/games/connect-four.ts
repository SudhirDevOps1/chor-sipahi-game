export interface ConnectFourState {
  board: (string | null)[][]; // 6 rows x 7 cols
  currentPlayerId: string;
  winnerId: string | null; // or "draw"
  roundsPlayed: number;
}

export function initConnectFour(players: { id: string }[]): ConnectFourState {
  return {
    board: Array(6).fill(null).map(() => Array(7).fill(null)),
    currentPlayerId: players[0].id,
    winnerId: null,
    roundsPlayed: 1,
  };
}

export function handleConnectFourAction(
  state: ConnectFourState,
  action: { type: string; colIndex?: number },
  playerId: string,
  players: { id: string }[]
): ConnectFourState {
  if (playerId !== state.currentPlayerId) {
    throw new Error("Not your turn!");
  }
  if (state.winnerId && action.type !== "restart") {
    throw new Error("Game is already finished!");
  }

  if (action.type === "make_move") {
    const col = action.colIndex;
    if (col === undefined || col < 0 || col > 6) {
      throw new Error("Invalid column index");
    }

    // Find lowest empty row in this column
    let rowToPlace = -1;
    for (let r = 5; r >= 0; r--) {
      if (state.board[r][col] === null) {
        rowToPlace = r;
        break;
      }
    }

    if (rowToPlace === -1) {
      throw new Error("Column is full");
    }

    const nextBoard = state.board.map((row) => [...row]);
    const isPlayer1 = playerId === players[0].id;
    const playerSymbol = isPlayer1 ? "R" : "Y"; // Red vs Yellow
    nextBoard[rowToPlace][col] = playerSymbol;

    const hasWon = checkConnectFourWinner(nextBoard, rowToPlace, col, playerSymbol);
    let nextWinner: string | null = null;
    if (hasWon) {
      nextWinner = playerId;
    } else if (nextBoard.every((row) => row.every((cell) => cell !== null))) {
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
    return initConnectFour(players);
  }

  return state;
}

function checkConnectFourWinner(
  board: (string | null)[][],
  row: number,
  col: number,
  symbol: string
): boolean {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check forward direction
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === symbol) {
      count++;
      r += dr;
      c += dc;
    }

    // Check backward direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === symbol) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= 4) {
      return true;
    }
  }

  return false;
}
