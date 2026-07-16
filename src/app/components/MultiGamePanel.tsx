import React, { useEffect, useState, useRef } from "react";
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

/* ═══════════════════ LUDO PATH COORDINATES ═══════════════════ */
// Standard 15x15 board path mapping from ludo.html
const LUDO_PATH_COORDS = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],[6,0]
];

const LUDO_HOME_PATHS: Record<string, number[][]> = {
  red: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]
};

const LUDO_START_POS = [0, 13, 39, 26]; // Red, Green, Blue, Yellow start steps

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

export function MultiGamePanel({ state, playerId, busy, onAction, isHost, onStart }: MultiGamePanelProps) {
  const gameType = state.gameType;
  const gameState = state.gameState;
  const [diceAnimating, setDiceAnimating] = useState(false);
  const prevDice = useRef(gameState?.diceRoll);

  const handleAction = (payload: Record<string, any>) => {
    playClickSound();
    onAction(payload);
  };

  useEffect(() => { if (state.status === "finished") playWinSound(); }, [state.status]);
  useEffect(() => {
    if (gameState?.diceRoll && gameState.diceRoll !== prevDice.current) {
      playDiceRollSound();
      setDiceAnimating(true);
      const t = setTimeout(() => setDiceAnimating(false), 500);
      prevDice.current = gameState.diceRoll;
      return () => clearTimeout(t);
    }
  }, [gameState?.diceRoll]);
  useEffect(() => { if (gameState?.currentPlayerId) playMoveSound(); }, [gameState?.currentPlayerId]);

  /* ── LOBBY STATE ── */
  if (state.status === "waiting") {
    const isLudo = gameType === "ludo";
    const minP = isLudo ? 2 : (["tic_tac_toe", "rps", "connect_four"].includes(gameType) ? 2 : 4);
    const canStart = isLudo ? (state.players.length >= 2 && state.players.length <= 4) : (state.players.length === minP);
    const gameLabels: Record<string, string> = { tic_tac_toe: "❌ Tic-Tac-Toe ⭕", connect_four: "🔴 Connect Four 🟡", rps: "✊ Rock Paper Scissors ✌️", ludo: "🎲 Ludo" };
    return (
      <div className="phase-card" style={{ background: "linear-gradient(145deg, #0f172a, #1e1b4b)", borderRadius: "20px", border: "2px solid rgba(99,102,241,0.4)", padding: "2.5rem", color: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", color: "#818cf8", textTransform: "uppercase" as const }}>🎮 GAME LOBBY</p>
        <h1 style={{ fontSize: "2.2rem", margin: "0.5rem 0", fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>{gameLabels[gameType] || "Game"}</h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{isLudo ? "2 to 4 players can join" : `Exactly ${minP} players needed`}</p>

        {/* Player Cards */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", margin: "2rem 0", flexWrap: "wrap" }}>
          {state.players.map((p, i) => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)",
              border: p.id === playerId ? "2px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px", padding: "14px 20px", minWidth: "110px",
              boxShadow: p.id === playerId ? "0 0 20px rgba(129,140,248,0.3)" : "none",
            }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
                {["🔴", "🔵", "🟢", "🟡"][i % 4]}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{p.name}</div>
              {p.id === playerId && <span style={{ fontSize: "0.65rem", color: "#818cf8", fontWeight: 800 }}>YOU</span>}
            </div>
          ))}
        </div>

        {isHost ? (
          <button type="button" disabled={busy || !canStart} onClick={() => { playClickSound(); onStart(); }}
            style={{ width: "100%", maxWidth: "300px", padding: "1rem", background: canStart ? "linear-gradient(135deg, #6366f1, #a855f7)" : "#1e293b", border: "none", borderRadius: "14px", color: "#fff", fontWeight: "bold", fontSize: "1rem", cursor: canStart ? "pointer" : "default", boxShadow: canStart ? "0 6px 20px rgba(99,102,241,0.4)" : "none", transition: "all 0.3s" }}>
            Start Game 🚀
          </button>
        ) : (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", padding: "1rem", borderRadius: "12px", color: "#94a3b8", fontSize: "0.9rem" }}>
            ⏳ Waiting for host to start...
          </div>
        )}
      </div>
    );
  }

  /* ── GAME OVER ── */
  if (state.status === "finished") {
    const winnerName = state.players.find((p) => p.id === gameState?.winnerId)?.name ?? "Draw";
    return (
      <div className="phase-card" style={{ textAlign: "center", background: "linear-gradient(145deg, #0f172a, #1e1b4b)", borderRadius: "20px", border: "2px solid rgba(251,191,36,0.4)", padding: "3rem 2rem", color: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🏆</div>
        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", color: "#fbbf24", textTransform: "uppercase" as const }}>CHAMPION DECLARED</p>
        <h1 style={{ fontSize: "2.5rem", color: "#fbbf24", margin: "0.5rem 0", fontFamily: "Georgia, serif" }}>
          {gameState?.winnerId === "draw" ? "It is a Draw!" : `${winnerName} Wins!`}
        </h1>
        {isHost && (
          <button type="button" disabled={busy} onClick={() => handleAction({ type: "restart" })}
            style={{ marginTop: "2rem", padding: "0.85rem 2.5rem", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", fontWeight: "bold", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "1rem" }}>
            Play Again 🎲
          </button>
        )}
      </div>
    );
  }

  if (!gameState) return <div className="phase-card" style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>;

  /* ═══════════════════ 1. TIC-TAC-TOE — ENGLISH ═══════════════════ */
  if (gameType === "tic_tac_toe") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const p1Score = gameState.player1Score ?? 0;
    const p2Score = gameState.player2Score ?? 0;
    const draws = gameState.drawsScore ?? 0;

    return (
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "30px", borderRadius: "20px", maxWidth: "500px", width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)", color: "#333", margin: "0 auto"
      }}>
        <h1 style={{ textAlign: "center", color: "#fff", marginBottom: "5px", fontSize: "2.2rem", fontWeight: 800 }}>🎮 Tic-Tac-Toe</h1>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", marginBottom: "20px", fontSize: "0.9rem" }}>2026 Edition - Multiplayer Ready</div>
        
        {/* Score Board */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "25px", padding: "16px", background: "#f8f9fa", borderRadius: "15px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>Player X ({state.players[0]?.name || "P1"})</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#667eea" }}>{p1Score}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>Draws</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#888" }}>{draws}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>Player O ({state.players[1]?.name || "P2"})</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#764ba2" }}>{p2Score}</div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          textAlign: "center", fontSize: "1.2rem", marginBottom: "20px", color: "#fff",
          minHeight: "35px", fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}>
          {gameState.winnerId ? `🎉 Player ${gameState.winnerId === state.players[0]?.id ? "X" : "O"} Wins!` : `Player ${gameState.currentPlayerId === state.players[0]?.id ? "X" : "O"}'s Turn`}
        </div>

        {/* 3x3 Board Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
          {gameState.board.map((cell: string | null, idx: number) => {
            const isTaken = cell !== null;
            const isWinner = gameState.winningLine?.includes(idx);
            const isX = cell === "X";

            let cellBg = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            let color = "#fff";
            if (isWinner) {
              cellBg = "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
            } else if (cell === "O") {
              color = "#ffd700";
            }

            return (
              <button key={idx} type="button" disabled={busy || !isMyTurn || isTaken}
                onClick={() => handleAction({ type: "make_move", cellIndex: idx })}
                style={{
                  aspectRatio: "1", background: cellBg, border: "none", borderRadius: "15px",
                  fontSize: "3rem", fontWeight: "bold", color: color, cursor: isTaken ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(102,126,234,0.3)", transition: "all 0.3s ease",
                  transform: isWinner ? "scale(1.05)" : "none",
                  animation: isWinner ? "win-pulse 0.8s ease infinite" : "none",
                }}
              >
                {cell || ""}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn btn-primary" style={{ background: "#fff", color: "#667eea", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", border: "none" }} onClick={() => handleAction({ type: "restart" })} disabled={busy}>New Game</button>
          <button className="btn btn-secondary" style={{ background: "transparent", border: "2px solid #fff", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold" }} onClick={() => handleAction({ type: "restart" })} disabled={busy}>Reset Score</button>
        </div>
      </div>
    );
  }

  /* ═══════════════════ 2. CONNECT FOUR — ENGLISH ═══════════════════ */
  if (gameType === "connect_four") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const p1Score = gameState.player1Score ?? 0;
    const p2Score = gameState.player2Score ?? 0;

    return (
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        padding: "30px", borderRadius: "20px", maxWidth: "560px", width: "100%",
        boxShadow: "0 25px 70px rgba(0, 0, 0, 0.4)", color: "#333", margin: "0 auto"
      }}>
        <h1 style={{ textAlign: "center", color: "#fff", marginBottom: "8px", fontSize: "2.3rem", fontWeight: 800 }}>🔴 Connect Four 🟡</h1>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", marginBottom: "20px", fontSize: "0.9rem" }}>4 in a row to win • 2026 Edition</div>

        {/* Scoreboard */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "12px" }}>
          <div style={{ textShadow: "none" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "14px", height: "14px", borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)" }}></span>
              Red ({state.players[0]?.name || "P1"})
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#2c5364", textAlign: "center" }}>{p1Score}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "14px", height: "14px", borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #ffe066, #f59f00)" }}></span>
              Yellow ({state.players[1]?.name || "P2"})
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#2c5364", textAlign: "center" }}>{p2Score}</div>
          </div>
        </div>

        {/* Turn description */}
        <div style={{ textAlign: "center", fontSize: "1.2rem", marginBottom: "15px", color: "#fff", fontWeight: "bold" }}>
          {gameState.winnerId ? `🎉 ${gameState.winnerId === state.players[0]?.id ? "🔴 Red" : "🟡 Yellow"} Wins!` : `${gameState.currentPlayerId === state.players[0]?.id ? "🔴 Red" : "🟡 Yellow"}'s Turn`}
        </div>

        {/* Board grid wrapper */}
        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2c5364 100%)", padding: "12px", borderRadius: "15px", marginBottom: "20px", boxShadow: "inset 0 4px 10px rgba(0, 0, 0, 0.3)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(6, 1fr)", gap: "6px", aspectRatio: "7/6" }}>
            {gameState.board.map((row: (string | null)[], rIdx: number) => (
              row.map((cell: string | null, cIdx: number) => {
                const index = rIdx * 7 + cIdx;
                const isWinner = gameState.winningLine?.includes(index);
                
                let cellBg = "#0f2027";
                if (cell === "R") {
                  cellBg = "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)";
                } else if (cell === "Y") {
                  cellBg = "radial-gradient(circle at 30% 30%, #ffe066, #f59f00)";
                }

                return (
                  <div key={index} onClick={() => handleAction({ type: "make_move", colIndex: cIdx })}
                    style={{
                      background: cellBg, borderRadius: "50%", cursor: (busy || !isMyTurn) ? "default" : "pointer",
                      boxShadow: "inset 0 4px 8px rgba(0, 0, 0, 0.4)",
                      animation: cell ? "drop 0.4s ease-out" : "none",
                      position: "relative"
                    }}
                    className={`${isWinner ? "winner" : ""}`}
                  />
                );
              })
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn btn-primary" style={{ background: "#fff", color: "#2c5364", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", border: "none" }} onClick={() => handleAction({ type: "restart" })} disabled={busy}>New Game</button>
          <button className="btn btn-secondary" style={{ background: "transparent", border: "2px solid #fff", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold" }} onClick={() => handleAction({ type: "restart" })} disabled={busy}>Reset Score</button>
        </div>
      </div>
    );
  }

  /* ═══════════════════ 3. ROCK PAPER SCISSORS — ENGLISH ═══════════════════ */
  if (gameType === "rps") {
    const p1 = gameState.player1Id === playerId;
    const myChoice = p1 ? gameState.player1Choice : gameState.player2Choice;
    const hasChosen = myChoice !== null;
    const showResults = gameState.player1Choice && gameState.player2Choice;
    const p1Score = gameState.player1Score ?? 0;
    const p2Score = gameState.player2Score ?? 0;
    const draws = gameState.drawsScore ?? 0;

    const icons: Record<string, string> = { rock: '✊', paper: '✋', scissors: '✌️' };
    const myIcon = myChoice ? icons[myChoice] : "❓";
    const opponentChoice = p1 ? gameState.player2Choice : gameState.player1Choice;
    const oppIcon = showResults && opponentChoice ? icons[opponentChoice] : "❓";

    return (
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        padding: "40px 30px", borderRadius: "25px", maxWidth: "600px", width: "100%",
        boxShadow: "0 25px 70px rgba(0, 0, 0, 0.25)", color: "#333", margin: "0 auto"
      }}>
        <h1 style={{ textAlign: "center", color: "#fff", marginBottom: "8px", fontSize: "3rem", textShadow: "0 2px 5px rgba(0,0,0,0.15)" }}>✊ ✋ ✌️</h1>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.9)", marginBottom: "25px", fontSize: "0.9rem" }}>Rock Paper Scissors 2026</div>

        {/* Score board */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px", padding: "20px", background: "linear-gradient(135deg, #fff5f7 0%, #fffef5 100%)", borderRadius: "15px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>You</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#fa709a" }}>{p1 ? p1Score : p2Score}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>Draw</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#999" }}>{draws}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px" }}>Opponent</div>
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>{p1 ? p2Score : p1Score}</div>
          </div>
        </div>

        {/* Battle Arena */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "20px", marginBottom: "25px", padding: "20px", background: "#f8f9fa", borderRadius: "15px", minHeight: "150px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#666", marginBottom: "10px" }}>YOU</div>
            <div className={`fighter-icon ${diceAnimating ? "shake" : ""}`} style={{ fontSize: "4rem", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {myIcon}
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fa709a" }}>VS</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#666", marginBottom: "10px" }}>OPPONENT</div>
            <div className={`fighter-icon ${diceAnimating ? "shake" : ""}`} style={{ fontSize: "4rem", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {oppIcon}
            </div>
          </div>
        </div>

        {/* Dynamic English status text */}
        {(() => {
          let resultText = "Make your choice!";
          let resultClass = "";
          if (showResults) {
            const c1 = myChoice === "rock" ? "Rock" : myChoice === "paper" ? "Paper" : "Scissors";
            const c2 = opponentChoice === "rock" ? "Rock" : opponentChoice === "paper" ? "Paper" : "Scissors";
            const win = gameState.roundWinnerId === playerId;
            const draw = gameState.roundWinnerId === "draw";
            if (win) {
              resultText = `🎉 You Win! ${c1} beats ${c2}`;
              resultClass = "win";
            } else if (draw) {
              resultText = `🤝 Draw! Both chose ${c1}`;
              resultClass = "draw";
            } else {
              resultText = `😢 You Lose! ${c2} beats ${c1}`;
              resultClass = "lose";
            }
          }
          return (
            <div className={`result ${resultClass}`} style={{ textAlign: "center", fontSize: "1.3rem", fontWeight: 600, minHeight: "35px", marginBottom: "25px", color: resultClass === "win" ? "#22c55e" : resultClass === "lose" ? "#ef4444" : "#f59e0b" }}>
              {resultText}
            </div>
          );
        })()}

        {/* Controls choices */}
        {!hasChosen && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <button className="choice-btn" onClick={() => handleAction({ type: "make_choice", choice: "rock" })} disabled={busy}
              style={{ background: "#fff", border: "3px solid transparent", borderRadius: "15px", padding: "20px 10px", cursor: "pointer", fontSize: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
              <span>✊</span><span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Rock</span>
            </button>
            <button className="choice-btn" onClick={() => handleAction({ type: "make_choice", choice: "paper" })} disabled={busy}
              style={{ background: "#fff", border: "3px solid transparent", borderRadius: "15px", padding: "20px 10px", cursor: "pointer", fontSize: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
              <span>✋</span><span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Paper</span>
            </button>
            <button className="choice-btn" onClick={() => handleAction({ type: "make_choice", choice: "scissors" })} disabled={busy}
              style={{ background: "#fff", border: "3px solid transparent", borderRadius: "15px", padding: "20px 10px", cursor: "pointer", fontSize: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
              <span>✌️</span><span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Scissors</span>
            </button>
          </div>
        )}

        <button className="btn-reset" onClick={() => handleAction({ type: "restart" })} disabled={busy}
          style={{ width: "100%", padding: "12px", background: "#fff", color: "#fa709a", borderRadius: "12px", fontSize: "1rem", fontWeight: "bold", border: "none", cursor: "pointer", textTransform: "uppercase" }}>
          Reset Score
        </button>
      </div>
    );
  }

  /* ═══════════════════ 4. LUDO — ENGLISH ═══════════════════ */
  if (gameType === "ludo") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const colors = ["red", "green", "yellow", "blue"];
    const activeColor = colors[state.players.findIndex(p => p.id === gameState.currentPlayerId) % 4] || "red";

    return (
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
        padding: "20px", borderRadius: "20px", maxWidth: "560px", width: "100%",
        boxShadow: "0 25px 70px rgba(0, 0, 0, 0.4)", color: "#333", margin: "0 auto"
      }}>
        <h1 style={{ textAlign: "center", color: "#fff", marginBottom: "5px", fontSize: "2rem", fontWeight: 800 }}>🎲 Ludo King 🎲</h1>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", marginBottom: "15px", fontSize: "0.85rem" }}>2026 Edition • 4 Players Local</div>

        {/* Turn & Dice Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "10px 15px", borderRadius: "12px", marginBottom: "15px", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
            <div style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: activeColor === "red" ? "#c92a2a" : activeColor === "green" ? "#2b8a3e" : activeColor === "yellow" ? "#e67700" : "#1864ab"
            }} />
            <span>{activeColor.charAt(0).toUpperCase() + activeColor.slice(1)}'s Turn</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "45px", height: "45px", background: "white", border: "2px solid #333", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: "bold" }}>
              {gameState.diceRoll ? DICE_FACES[gameState.diceRoll - 1] : "?"}
            </div>
            {isMyTurn && !gameState.hasRolled && (
              <button style={{ padding: "8px 16px", background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }} onClick={() => handleAction({ type: "roll_die" })}>
                Roll
              </button>
            )}
          </div>
        </div>

        {/* Board Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gridTemplateRows: "repeat(15, 1fr)", gap: "1px", background: "#333", padding: "2px", borderRadius: "10px", position: "relative", marginBottom: "15px", aspectRatio: "1" }}>
          {Array.from({ length: 15 }).map((_, r) => {
            const row = r;
            return Array.from({ length: 15 }).map((_, c) => {
              const col = c;

              // Color bases
              let bg = "#fff";
              if (row < 6 && col < 6) bg = "#ff6b6b";
              else if (row < 6 && col > 8) bg = "#51cf66";
              else if (row > 8 && col > 8) bg = "#ffd43b";
              else if (row > 8 && col < 6) bg = "#4dabf7";
              else if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
                if (row === 7 && col === 7) bg = "conic-gradient(#ff6b6b 0 25%, #51cf66 25% 50%, #ffd43b 50% 75%, #4dabf7 75% 100%)";
                else bg = "#f1f3f5";
              } else {
                // Colored Paths
                const isHomeRed = row === 7 && col >= 1 && col <= 6;
                const isHomeGreen = col === 7 && row >= 1 && row <= 6;
                const isHomeYellow = row === 7 && col >= 8 && col <= 13;
                const isHomeBlue = col === 7 && row >= 8 && row <= 13;

                if (isHomeRed) bg = "#ffc9c9";
                else if (isHomeGreen) bg = "#d3f9d8";
                else if (isHomeYellow) bg = "#fff3bf";
                else if (isHomeBlue) bg = "#d0ebff";
                else if (row === 6 && col === 1) bg = "#ffc9c9"; // Red start
                else if (row === 1 && col === 8) bg = "#d3f9d8"; // Green start
                else if (row === 8 && col === 13) bg = "#fff3bf"; // Yellow start
                else if (row === 13 && col === 6) bg = "#d0ebff"; // Blue start
              }

              // Stars & Safe cells
              const isSafe = (row === 6 && col === 1) || (row === 8 && col === 1) || (row === 1 && col === 6) || (row === 1 && col === 8) || (row === 6 && col === 13) || (row === 8 && col === 13) || (row === 13 && col === 6) || (row === 13 && col === 8);

              // Check if any player's token is on this cell
              const matchingTokens: { playerIndex: number; tokenIndex: number; color: string; isMovable: boolean }[] = [];
              state.players.forEach((p, pIdx) => {
                const pt = gameState.playerTokens[p.id] || [-1, -1];
                const pColor = colors[pIdx % 4];
                pt.forEach((stepPos: number, tIdx: number) => {
                  if (stepPos >= 0 && stepPos <= 30) {
                    let targetCoords = null;
                    if (stepPos >= 0 && stepPos < 24) {
                      const perimeterIndex = (LUDO_START_POS[pIdx % 4] + stepPos) % 52;
                      targetCoords = LUDO_PATH_COORDS[perimeterIndex];
                    } else if (stepPos >= 24 && stepPos < 30) {
                      const stretchIndex = stepPos - 24;
                      targetCoords = LUDO_HOME_PATHS[pColor]?.[stretchIndex];
                    } else if (stepPos === 30) {
                      targetCoords = [7, 7]; // Goal center
                    }

                    if (targetCoords && targetCoords[0] === row && targetCoords[1] === col) {
                      const isMovable = isMyTurn && p.id === playerId && !((stepPos === -1 && gameState.diceRoll !== 6) || (stepPos + (gameState.diceRoll || 0) > 30));
                      matchingTokens.push({
                        playerIndex: pIdx,
                        tokenIndex: tIdx,
                        color: pColor,
                        isMovable
                      });
                    }
                  }
                });
              });

              return (
                <div key={`${row}-${col}`} style={{
                  gridArea: `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`,
                  background: bg, display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", border: "1px solid rgba(0,0,0,0.03)"
                }}>
                  {isSafe && <span style={{ fontSize: "0.65rem", opacity: 0.5 }}>⭐</span>}
                  {matchingTokens.map((t, ti) => (
                    <button key={ti} type="button" disabled={!t.isMovable}
                      onClick={() => handleAction({ type: "move_token", tokenIndex: t.tokenIndex })}
                      style={{
                        position: "absolute", width: "80%", height: "80%", borderRadius: "50%",
                        border: "2px solid #fff", boxShadow: t.isMovable ? "0 0 10px #fff" : "0 2px 4px rgba(0,0,0,0.3)",
                        background: t.color === "red" ? "radial-gradient(circle at 30% 30%, #ff8787, #c92a2a)" : t.color === "green" ? "radial-gradient(circle at 30% 30%, #8ce99a, #2b8a3e)" : t.color === "yellow" ? "radial-gradient(circle at 30% 30%, #ffe066, #e67700)" : "radial-gradient(circle at 30% 30%, #74c0fc, #1864ab)",
                        color: t.color === "yellow" ? "#333" : "#fff", fontSize: "0.55rem", fontWeight: "bold",
                        cursor: t.isMovable ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 10, transform: t.isMovable ? "scale(1.15)" : "none",
                      }}
                    >
                      {t.tokenIndex + 1}
                    </button>
                  ))}
                </div>
              );
            });
          })}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn btn-reset" style={{ background: "#fff", color: "#185a9d", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", border: "none" }} onClick={() => handleAction({ type: "restart" })} disabled={busy}>New Game</button>
        </div>
      </div>
    );
  }

  return <div className="phase-card">Unsupported game type</div>;
}
