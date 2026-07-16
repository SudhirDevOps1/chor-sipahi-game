import React from "react";
import type { RajaGameState } from "@/shared/types";

interface MultiGamePanelProps {
  state: RajaGameState;
  playerId: string;
  busy: boolean;
  onAction: (payload: Record<string, any>) => void;
  isHost: boolean;
  onStart: () => void;
}

export function MultiGamePanel({ state, playerId, busy, onAction, isHost, onStart }: MultiGamePanelProps) {
  const isPlaying = state.status === "playing";
  const gameType = state.gameType;

  // LOBBY STATE
  if (state.status === "waiting") {
    const isLudo = gameType === "ludo";
    const minPlayers = isLudo ? 2 : (["tic_tac_toe", "rps", "connect_four"].includes(gameType) ? 2 : 4);
    const maxPlayers = isLudo ? 4 : minPlayers;
    const canStart = isLudo ? (state.players.length >= 2 && state.players.length <= 4) : (state.players.length === minPlayers);

    return (
      <div className="phase-card">
        <p className="eyebrow">🎮 LOBBY</p>
        <h1>Waiting for players</h1>
        <p>{isLudo ? "This game requires 2 to 4 players to start." : `This game requires exactly ${minPlayers} players to start.`}</p>
        <div className="ready-count">
          <span>{state.players.length} {isLudo ? "" : `/ ${minPlayers}`}</span>
          <small>players joined</small>
        </div>
        {isHost ? (
          <button
            type="button"
            className="heritage-button"
            disabled={busy || !canStart}
            onClick={onStart}
          >
            Start Game
          </button>
        ) : (
          <div className="wait-message">Waiting for the host to start the table...</div>
        )}
      </div>
    );
  }


  // GAME OVER STATE
  if (state.status === "finished") {
    const gameState = state.gameState;
    const winnerName = state.players.find((p) => p.id === gameState?.winnerId)?.name ?? "Draw / Tie";
    return (
      <div className="phase-card result-phase">
        <p className="eyebrow">🏆 GAME OVER</p>
        <h1>{gameState?.winnerId === "draw" ? "It is a Draw!" : `${winnerName} Wins!`}</h1>
        <p>Congratulations to the winner!</p>
        {isHost && (
          <button
            type="button"
            className="heritage-button"
            disabled={busy}
            onClick={() => onAction({ type: "restart" })}
          >
            Play Again
          </button>
        )}
      </div>
    );
  }

  const gameState = state.gameState;
  if (!gameState) return <div className="phase-card">Loading game state...</div>;

  // 1. TIC-TAC-TOE UI
  if (gameType === "tic_tac_toe") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    return (
      <div className="phase-card">
        <p className="eyebrow">❌ Tic-Tac-Toe ⭕</p>
        <h1>{isMyTurn ? "Your Turn!" : "Waiting for opponent..."}</h1>
        
        <div className="ttt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "20px auto", maxWidth: "240px" }}>
          {gameState.board.map((cell: string | null, idx: number) => (
            <button
              key={idx}
              type="button"
              disabled={busy || !isMyTurn || cell !== null}
              onClick={() => onAction({ type: "make_move", cellIndex: idx })}
              style={{
                height: "70px",
                fontSize: "24px",
                fontWeight: "bold",
                backgroundColor: cell ? "#1e293b" : "#334155",
                color: cell === "X" ? "#38bdf8" : "#f43f5e",
                border: "2px solid #475569",
                borderRadius: "8px",
                cursor: (isMyTurn && !cell) ? "pointer" : "default",
              }}
            >
              {cell ?? ""}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. CONNECT FOUR UI
  if (gameType === "connect_four") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    return (
      <div className="phase-card">
        <p className="eyebrow">🔵 Connect Four 🔴</p>
        <h1>{isMyTurn ? "Your Turn!" : "Waiting for opponent..."}</h1>

        <div className="c4-container" style={{ margin: "20px auto", maxWidth: "340px" }}>
          {/* Column Drop Buttons */}
          <div className="c4-drops" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px", marginBottom: "8px" }}>
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <button
                key={colIdx}
                type="button"
                disabled={busy || !isMyTurn || gameState.board[0][colIdx] !== null}
                onClick={() => onAction({ type: "make_move", colIndex: colIdx })}
                style={{
                  padding: "4px",
                  fontSize: "14px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ▼
              </button>
            ))}
          </div>

          {/* Grid Board */}
          <div className="c4-grid" style={{ backgroundColor: "#1e3a8a", padding: "10px", borderRadius: "12px", display: "grid", gap: "6px" }}>
            {gameState.board.map((row: (string | null)[][], rIdx: number) => (
              <div key={rIdx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                {row.map((cell: any, cIdx: number) => (
                  <div
                    key={cIdx}
                    style={{
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: cell === "R" ? "#ef4444" : cell === "Y" ? "#eab308" : "#0f172a",
                      border: "2px solid #1d4ed8",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. ROCK PAPER SCISSORS UI
  if (gameType === "rps") {
    const p1 = gameState.player1Id === playerId;
    const myChoice = p1 ? gameState.player1Choice : gameState.player2Choice;
    const hasChosen = myChoice !== null;
    const showRoundResults = gameState.player1Choice && gameState.player2Choice;

    return (
      <div className="phase-card">
        <p className="eyebrow">✊ Rock Paper Scissors ✌️</p>
        <h1>Round {gameState.round}</h1>

        {!showRoundResults ? (
          <div style={{ margin: "20px 0" }}>
            {hasChosen ? (
              <p>Choice submitted! Waiting for opponent... ({myChoice.toUpperCase()})</p>
            ) : (
              <div>
                <p>Make your move:</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
                  {["rock", "paper", "scissors"].map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      disabled={busy}
                      onClick={() => onAction({ type: "make_choice", choice })}
                      style={{
                        padding: "10px 20px",
                        fontSize: "18px",
                        borderRadius: "8px",
                        backgroundColor: "#334155",
                        border: "2px solid #475569",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {choice === "rock" ? "✊" : choice === "paper" ? "✋" : "✌️"}{" "}
                      {choice.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ margin: "20px 0" }}>
            <h3>Choices:</h3>
            <p>{state.players[0].name}: <strong>{gameState.player1Choice.toUpperCase()}</strong></p>
            <p>{state.players[1].name}: <strong>{gameState.player2Choice.toUpperCase()}</strong></p>
            <h2 style={{ color: "#e2e8f0", margin: "12px 0" }}>
              {gameState.roundWinnerId === "draw"
                ? "It's a draw round!"
                : `${state.players.find((p) => p.id === gameState.roundWinnerId)?.name} wins the round!`}
            </h2>
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>
              Score: {gameState.player1Score} - {gameState.player2Score}
            </div>
            {isHost && (
              <button
                type="button"
                className="heritage-button"
                disabled={busy}
                onClick={() => onAction({ type: "next_round" })}
                style={{ marginTop: "16px" }}
              >
                Next Round
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. LUDO UI
  if (gameType === "ludo") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const tokens = gameState.playerTokens[playerId] || [-1, -1];

    return (
      <div className="phase-card">
        <p className="eyebrow">🎲 Ludo</p>
        <h1>{isMyTurn ? "Your Turn!" : `Waiting for player...`}</h1>

        <div style={{ margin: "20px 0" }}>
          {/* Dice Roller */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{ width: "60px", height: "60px", backgroundColor: "#334155", border: "2px solid #475569", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", color: "#38bdf8" }}>
              {gameState.diceRoll ?? "?"}
            </div>
            {isMyTurn && !gameState.hasRolled && (
              <button
                type="button"
                className="heritage-button"
                disabled={busy}
                onClick={() => onAction({ type: "roll_die" })}
              >
                Roll Die 🎲
              </button>
            )}
          </div>

          {/* Move Tokens controls */}
          {isMyTurn && gameState.hasRolled && (
            <div>
              <p>Select a token to move ({gameState.diceRoll} steps):</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                {tokens.map((pos: number, idx: number) => {
                  const cannotMove = (pos === -1 && gameState.diceRoll !== 6) || (pos + (gameState.diceRoll || 0) > 30);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={busy || cannotMove}
                      onClick={() => onAction({ type: "move_token", tokenIndex: idx })}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        backgroundColor: cannotMove ? "#1e293b" : "#0284c7",
                        color: cannotMove ? "#475569" : "#fff",
                        border: "none",
                        cursor: cannotMove ? "default" : "pointer",
                      }}
                    >
                      Token {idx + 1} (Step: {pos === -1 ? "Yard" : pos})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tokens Tracks Overview */}
          <div style={{ marginTop: "20px", borderTop: "1px solid #334155", paddingTop: "12px", textAlign: "left" }}>
            <h4>Tracks & Positions (Goal is 30):</h4>
            {state.players.map((p) => {
              const pt = gameState.playerTokens[p.id] || [-1, -1];
              return (
                <p key={p.id} style={{ fontSize: "14px", margin: "4px 0" }}>
                  <strong>{p.name}</strong>: Token 1: <code>{pt[0] === -1 ? "Yard" : pt[0]}</code> | Token 2: <code>{pt[1] === -1 ? "Yard" : pt[1]}</code>
                </p>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return <div className="phase-card">Unsupported game type</div>;
}
