import React, { useEffect } from "react";
import type { RajaGameState } from "@/shared/types";
import { playClickSound, playDiceRollSound, playMoveSound, playWinSound } from "../utils/audio";

interface MultiGamePanelProps {
  state: RajaGameState;
  playerId: string;
  busy: boolean;
  onAction: (payload: Record<string, any>) => void;
  isHost: boolean;
  onStart: () => void;
}

export function MultiGamePanel({ state, playerId, busy, onAction, isHost, onStart }: MultiGamePanelProps) {
  const gameType = state.gameType;
  const gameState = state.gameState;

  const handleAction = (payload: Record<string, any>) => {
    playClickSound();
    onAction(payload);
  };

  // Play win sound when status changes to finished
  useEffect(() => {
    if (state.status === "finished") {
      playWinSound();
    }
  }, [state.status]);

  // Play dice roll sound
  useEffect(() => {
    if (gameState?.diceRoll) {
      playDiceRollSound();
    }
  }, [gameState?.diceRoll]);

  // Play token/turn move sound
  useEffect(() => {
    if (gameState?.currentPlayerId) {
      playMoveSound();
    }
  }, [gameState?.currentPlayerId, gameState?.board]);

  // LOBBY STATE
  if (state.status === "waiting") {
    const isLudo = gameType === "ludo";
    const minPlayers = isLudo ? 2 : (["tic_tac_toe", "rps", "connect_four"].includes(gameType) ? 2 : 4);
    const canStart = isLudo ? (state.players.length >= 2 && state.players.length <= 4) : (state.players.length === minPlayers);

    return (
      <div className="phase-card" style={{ border: "2px solid #6366f1", borderRadius: "16px", background: "#0f172a", color: "#fff", padding: "2rem", boxShadow: "0 10px 30px rgba(99, 102, 241, 0.2)" }}>
        <p className="eyebrow" style={{ color: "#818cf8", fontWeight: "bold" }}>🎮 GAME LOBBY</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#fff" }}>Waiting for Players</h1>
        <p style={{ color: "#94a3b8" }}>{isLudo ? "This Ludo game requires 2 to 4 players to start." : `This game requires exactly ${minPlayers} players to start.`}</p>
        
        <div className="ready-count" style={{ margin: "2rem 0" }}>
          <span style={{ fontSize: "4rem", fontWeight: "800", color: "#6366f1" }}>{state.players.length}</span>
          <span style={{ fontSize: "1.5rem", color: "#475569", margin: "0 0.5rem" }}>/</span>
          <span style={{ fontSize: "1.5rem", color: "#94a3b8" }}>{isLudo ? "2-4" : minPlayers}</span>
          <div style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>players currently inside</div>
        </div>

        {isHost ? (
          <button
            type="button"
            className="heritage-button"
            disabled={busy || !canStart}
            onClick={() => { playClickSound(); onStart(); }}
            style={{
              width: "100%",
              padding: "1rem",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
              cursor: "pointer",
            }}
          >
            Start Table 🚀
          </button>
        ) : (
          <div className="wait-message" style={{ border: "1px dashed #334155", padding: "1rem", borderRadius: "12px", color: "#94a3b8", textAlign: "center" }}>
            Waiting for host to launch match...
          </div>
        )}
      </div>
    );
  }

  // GAME OVER STATE
  if (state.status === "finished") {
    const winnerName = state.players.find((p) => p.id === gameState?.winnerId)?.name ?? "Draw / Tie";
    return (
      <div className="phase-card result-phase" style={{ textAlign: "center", border: "2px solid #fbbf24", borderRadius: "16px", background: "#0f172a", color: "#fff", padding: "3rem 2rem" }}>
        <p className="eyebrow" style={{ color: "#fbbf24" }}>🏆 CHAMPION DECLARED</p>
        <h1 style={{ fontSize: "2.5rem", color: "#fbbf24", margin: "1rem 0" }}>
          {gameState?.winnerId === "draw" ? "It is a Draw!" : `${winnerName} Wins!`}
        </h1>
        <p style={{ color: "#94a3b8" }}>Outstanding performance! Play another round to settle the score.</p>
        {isHost && (
          <button
            type="button"
            className="heritage-button"
            disabled={busy}
            onClick={() => handleAction({ type: "restart" })}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: "#000",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Play Again 🎲
          </button>
        )}
      </div>
    );
  }

  if (!gameState) return <div className="phase-card">Loading board matrix...</div>;

  // 1. TIC-TAC-TOE UI
  if (gameType === "tic_tac_toe") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    return (
      <div className="phase-card" style={{ background: "#0f172a", borderRadius: "16px", padding: "2rem", color: "#fff", border: "1px solid #1e293b" }}>
        <p className="eyebrow" style={{ color: "#38bdf8" }}>❌ TIC-TAC-TOE ⭕</p>
        <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>{isMyTurn ? "Your Turn! Make a move." : "Waiting for opponent..."}</h1>
        
        <div className="ttt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", margin: "2rem auto", maxWidth: "260px" }}>
          {gameState.board.map((cell: string | null, idx: number) => (
            <button
              key={idx}
              type="button"
              disabled={busy || !isMyTurn || cell !== null}
              onClick={() => handleAction({ type: "make_move", cellIndex: idx })}
              style={{
                height: "80px",
                fontSize: "2.5rem",
                fontWeight: "bold",
                backgroundColor: cell ? "#1e293b" : "#1e293b",
                color: cell === "X" ? "#38bdf8" : "#f43f5e",
                border: "2px solid #334155",
                borderRadius: "12px",
                cursor: (isMyTurn && !cell) ? "pointer" : "default",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                transition: "all 0.15s ease",
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
      <div className="phase-card" style={{ background: "#0f172a", borderRadius: "16px", padding: "2rem", color: "#fff", border: "1px solid #1e293b" }}>
        <p className="eyebrow" style={{ color: "#3b82f6" }}>🔴 CONNECT FOUR 🟡</p>
        <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>{isMyTurn ? "Your Turn! Drop a coin." : "Waiting for opponent..."}</h1>

        <div className="c4-container" style={{ margin: "2rem auto", maxWidth: "360px" }}>
          {/* Column Drop Buttons */}
          <div className="c4-drops" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "12px" }}>
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <button
                key={colIdx}
                type="button"
                disabled={busy || !isMyTurn || gameState.board[0][colIdx] !== null}
                onClick={() => handleAction({ type: "make_move", colIndex: colIdx })}
                style={{
                  padding: "8px 0",
                  fontSize: "16px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ▼
              </button>
            ))}
          </div>

          {/* Grid Board */}
          <div className="c4-grid" style={{ backgroundColor: "#1e3a8a", padding: "14px", borderRadius: "16px", display: "grid", gap: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
            {gameState.board.map((row: (string | null)[], rIdx: number) => (
              <div key={rIdx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                {row.map((cell: string | null, cIdx: number) => (
                  <div
                    key={cIdx}
                    style={{
                      height: "38px",
                      borderRadius: "50%",
                      backgroundColor: cell === "R" ? "#ef4444" : cell === "Y" ? "#eab308" : "#0f172a",
                      border: "3px solid #1d4ed8",
                      boxShadow: "inset 0 4px 4px rgba(0,0,0,0.6)",
                      transition: "background-color 0.3s ease",
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
      <div className="phase-card" style={{ background: "#0f172a", borderRadius: "16px", padding: "2rem", color: "#fff", border: "1px solid #1e293b" }}>
        <p className="eyebrow" style={{ color: "#ec4899" }}>✊ ROCK PAPER SCISSORS ✌️</p>
        <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>Round {gameState.round}</h1>

        {!showRoundResults ? (
          <div style={{ margin: "2rem 0" }}>
            {hasChosen ? (
              <div style={{ padding: "2rem", border: "1px dashed #334155", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>
                Choice submitted! Waiting for opponent... ({myChoice.toUpperCase()})
              </div>
            ) : (
              <div>
                <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>Make your selection:</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                  {["rock", "paper", "scissors"].map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction({ type: "make_choice", choice })}
                      style={{
                        flex: 1,
                        padding: "1.5rem 1rem",
                        fontSize: "1.1rem",
                        borderRadius: "12px",
                        backgroundColor: "#1e293b",
                        border: "2px solid #334155",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "2.5rem" }}>
                        {choice === "rock" ? "✊" : choice === "paper" ? "✋" : "✌️"}
                      </span>
                      <strong style={{ fontSize: "0.85rem", letterSpacing: "0.05em" }}>{choice.toUpperCase()}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ margin: "2rem 0", textAlign: "center" }}>
            <h3>Round Choices:</h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "3rem", margin: "1.5rem 0" }}>
              <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "16px", minWidth: "120px" }}>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{state.players[0].name}</p>
                <span style={{ fontSize: "3rem", display: "block", margin: "0.5rem 0" }}>
                  {gameState.player1Choice === "rock" ? "✊" : gameState.player1Choice === "paper" ? "✋" : "✌️"}
                </span>
                <strong>{gameState.player1Choice.toUpperCase()}</strong>
              </div>
              <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "16px", minWidth: "120px" }}>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{state.players[1].name}</p>
                <span style={{ fontSize: "3rem", display: "block", margin: "0.5rem 0" }}>
                  {gameState.player2Choice === "rock" ? "✊" : gameState.player2Choice === "paper" ? "✋" : "✌️"}
                </span>
                <strong>{gameState.player2Choice.toUpperCase()}</strong>
              </div>
            </div>
            <h2 style={{ color: "#fbbf24", margin: "1.5rem 0" }}>
              {gameState.roundWinnerId === "draw"
                ? "It's a draw round!"
                : `${state.players.find((p) => p.id === gameState.roundWinnerId)?.name} wins the round!`}
            </h2>
            <div style={{ background: "#334155", padding: "0.5rem 1rem", borderRadius: "8px", display: "inline-block", fontSize: "14px" }}>
              Score: <strong>{gameState.player1Score}</strong> - <strong>{gameState.player2Score}</strong>
            </div>
            {isHost && (
              <button
                type="button"
                className="heritage-button"
                disabled={busy}
                onClick={() => handleAction({ type: "next_round" })}
                style={{ display: "block", width: "100%", marginTop: "2rem", padding: "0.75rem", background: "#ec4899", border: "none", color: "#fff", fontWeight: "bold", borderRadius: "8px", cursor: "pointer" }}
              >
                Next Round ➔
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. LUDO VISUAL BOARD UI
  if (gameType === "ludo") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const tokens = gameState.playerTokens[playerId] || [-1, -1];
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

    return (
      <div className="phase-card" style={{ background: "#0f172a", borderRadius: "16px", padding: "2rem", color: "#fff", border: "1px solid #1e293b" }}>
        <p className="eyebrow" style={{ color: "#10b981" }}>🎲 VISUAL LUDO BOARD</p>
        <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>
          {isMyTurn ? "Your Turn! Roll or Move." : `Waiting for other player's turn...`}
        </h1>

        {/* Dice roll controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", margin: "1.5rem 0" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#1e293b",
              border: "3px solid #334155",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#10b981",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
            }}
          >
            {gameState.diceRoll ?? "?"}
          </div>
          {isMyTurn && !gameState.hasRolled && (
            <button
              type="button"
              className="heritage-button"
              disabled={busy}
              onClick={() => handleAction({ type: "roll_die" })}
              style={{ padding: "0.85rem 1.5rem", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "#fff", fontWeight: "bold", borderRadius: "8px", cursor: "pointer" }}
            >
              Roll Die 🎲
            </button>
          )}
        </div>

        {/* Dynamic visual track (30 Steps grid block) */}
        <div className="ludo-track-board" style={{ margin: "2rem auto", maxWidth: "480px" }}>
          <p style={{ fontSize: "0.8rem", color: "#64748b", textAlign: "center", marginBottom: "8px" }}>Track Path Progress (Start ➔ Goal 30)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "6px", background: "#1e293b", padding: "10px", borderRadius: "12px", border: "2px solid #334155" }}>
            {Array.from({ length: 30 }).map((_, stepIdx) => {
              const stepNumber = stepIdx + 1;
              const playersOnStep: { name: string; color: string; tokenLabel: string }[] = [];
              
              state.players.forEach((p, pIdx) => {
                const pt = gameState.playerTokens[p.id] || [-1, -1];
                const playerColor = colors[pIdx % colors.length];
                if (pt[0] === stepNumber) playersOnStep.push({ name: p.name, color: playerColor, tokenLabel: "T1" });
                if (pt[1] === stepNumber) playersOnStep.push({ name: p.name, color: playerColor, tokenLabel: "T2" });
              });

              return (
                <div
                  key={stepIdx}
                  title={`Step ${stepNumber}`}
                  style={{
                    height: "36px",
                    borderRadius: "6px",
                    background: stepNumber === 30 ? "#10b981" : "#0f172a",
                    border: stepNumber === 30 ? "2px solid #059669" : "1px solid #334155",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2px",
                  }}
                >
                  {stepNumber === 30 ? (
                    <span style={{ fontSize: "11px" }}>🏁</span>
                  ) : (
                    <span style={{ fontSize: "9px", color: "#334155", fontWeight: "bold" }}>{stepNumber}</span>
                  )}

                  <div style={{ position: "absolute", display: "flex", gap: "2px", flexWrap: "wrap", justifyContent: "center", padding: "2px" }}>
                    {playersOnStep.map((token, tIdx) => (
                      <div
                        key={tIdx}
                        title={`${token.name} (${token.tokenLabel})`}
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: token.color,
                          border: "1px solid #fff",
                          boxShadow: "0 0 4px #fff",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yard overview area */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "1.5rem 0", flexWrap: "wrap" }}>
          {state.players.map((p, pIdx) => {
            const pt = gameState.playerTokens[p.id] || [-1, -1];
            const playerColor = colors[pIdx % colors.length];
            const yardCount = (pt[0] === -1 ? 1 : 0) + (pt[1] === -1 ? 1 : 0);
            if (yardCount === 0) return null;
            return (
              <div key={p.id} style={{ background: "#1e293b", padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${playerColor}` }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: playerColor }} />
                <span style={{ fontSize: "12px" }}>{p.name}'s Yard: <strong>{yardCount} Left</strong></span>
              </div>
            );
          })}
        </div>

        {/* Move Token selection */}
        {isMyTurn && gameState.hasRolled && (
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
            <p style={{ margin: "0 0 1rem", color: "#94a3b8" }}>Move Piece ({gameState.diceRoll} steps):</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              {tokens.map((pos: number, idx: number) => {
                const cannotMove = (pos === -1 && gameState.diceRoll !== 6) || (pos + (gameState.diceRoll || 0) > 30);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={busy || cannotMove}
                    onClick={() => handleAction({ type: "move_token", tokenIndex: idx })}
                    style={{
                      flex: 1,
                      padding: "1rem",
                      borderRadius: "10px",
                      backgroundColor: cannotMove ? "#0f172a" : "#10b981",
                      color: cannotMove ? "#475569" : "#fff",
                      border: "none",
                      fontWeight: "bold",
                      cursor: cannotMove ? "default" : "pointer",
                      boxShadow: cannotMove ? "none" : "0 4px 12px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    🚀 Token {idx + 1}
                    <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "normal", marginTop: "4px" }}>
                      {pos === -1 ? "Yard (Needs 6)" : `At step ${pos}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div className="phase-card">Unsupported game type</div>;
}
