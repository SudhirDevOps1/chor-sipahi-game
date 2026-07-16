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

/* ═══════════════════ DICE FACE COMPONENT ═══════════════════ */
function DiceFace({ value }: { value: number }) {
  const pipPositions: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [[0, 2], [2, 0]],
    3: [[0, 2], [1, 1], [2, 0]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
  };
  const pips = pipPositions[value] || pipPositions[1];
  return (
    <div style={{
      width: "68px", height: "68px", background: "linear-gradient(145deg, #ffffff, #e8e8e8)",
      borderRadius: "14px", border: "3px solid #333", display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)",
      padding: "8px", boxShadow: "0 6px 12px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.5)",
    }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const hasPip = pips.some(([r, c]) => r === row && c === col);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hasPip && (
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #555, #111)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════ MAIN EXPORT ═══════════════════ */
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
      const t = setTimeout(() => setDiceAnimating(false), 600);
      prevDice.current = gameState.diceRoll;
      return () => clearTimeout(t);
    }
  }, [gameState?.diceRoll]);
  useEffect(() => { if (gameState?.currentPlayerId) playMoveSound(); }, [gameState?.currentPlayerId, gameState?.board]);

  /* ── LOBBY ── */
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
          {Array.from({ length: (isLudo ? 4 : minP) - state.players.length }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.1)",
              borderRadius: "14px", padding: "14px 20px", minWidth: "110px", color: "#475569",
            }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "6px", opacity: 0.3 }}>👤</div>
              <div style={{ fontSize: "0.75rem" }}>Waiting...</div>
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

  if (!gameState) return <div className="phase-card" style={{ textAlign: "center", padding: "3rem" }}>Loading game board...</div>;

  /* ═══════════════════ 1. TIC-TAC-TOE — NEON GLOW BOARD ═══════════════════ */
  if (gameType === "tic_tac_toe") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const mySymbol = state.players[0]?.id === playerId ? "X" : "O";
    return (
      <div className="phase-card" style={{ background: "linear-gradient(145deg, #0f172a, #0c0c1d)", borderRadius: "20px", padding: "2rem", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
        {/* Turn Indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem" }}>
          {state.players.map((p, i) => {
            const sym = i === 0 ? "X" : "O";
            const active = gameState.currentPlayerId === p.id;
            const symColor = sym === "X" ? "#0FF0FC" : "#FF6EC7";
            return (
              <div key={p.id} style={{
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                border: active ? `2px solid ${symColor}` : "2px solid transparent",
                borderRadius: "12px", padding: "10px 20px", transition: "all 0.3s",
                boxShadow: active ? `0 0 20px ${symColor}40` : "none",
              }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: symColor, textShadow: active ? `0 0 10px ${symColor}` : "none" }}>{sym}</span>
                <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>{p.name}{p.id === playerId ? " (You)" : ""}</div>
              </div>
            );
          })}
        </div>

        {/* Neon Board */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px",
          margin: "0 auto", maxWidth: "300px", padding: "16px",
          background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
          borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {gameState.board.map((cell: string | null, idx: number) => {
            const cellColor = cell === "X" ? "#0FF0FC" : cell === "O" ? "#FF6EC7" : "transparent";
            return (
              <button key={idx} type="button" disabled={busy || !isMyTurn || cell !== null}
                onClick={() => handleAction({ type: "make_move", cellIndex: idx })}
                style={{
                  height: "88px", fontSize: "2.8rem", fontWeight: 800,
                  fontFamily: "'Poppins', sans-serif",
                  background: cell ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                  color: cellColor, border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", cursor: (isMyTurn && !cell) ? "pointer" : "default",
                  textShadow: cell ? `0 0 8px ${cellColor}, 0 0 20px ${cellColor}, 0 0 40px ${cellColor}` : "none",
                  transition: "all 0.2s ease",
                  boxShadow: cell ? `inset 0 0 20px ${cellColor}15` : "none",
                }}>
                {cell ?? ""}
              </button>
            );
          })}
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: isMyTurn ? "#38bdf8" : "#64748b" }}>
          {isMyTurn ? `Your turn! Place ${mySymbol}` : "Waiting for opponent..."}
        </p>
      </div>
    );
  }

  /* ═══════════════════ 2. CONNECT FOUR — PREMIUM BOARD ═══════════════════ */
  if (gameType === "connect_four") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const myColor = state.players[0]?.id === playerId ? "Red" : "Yellow";
    return (
      <div className="phase-card" style={{ background: "linear-gradient(145deg, #0f172a, #0c0c1d)", borderRadius: "20px", padding: "2rem", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
        {/* Player indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem" }}>
          {state.players.map((p, i) => {
            const color = i === 0 ? "#ef4444" : "#eab308";
            const active = gameState.currentPlayerId === p.id;
            return (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                border: active ? `2px solid ${color}` : "2px solid transparent",
                borderRadius: "12px", padding: "10px 18px", transition: "all 0.3s",
                boxShadow: active ? `0 0 15px ${color}40` : "none",
              }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}60` }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{p.name}{p.id === playerId ? " (You)" : ""}</span>
              </div>
            );
          })}
        </div>

        <div style={{ margin: "0 auto", maxWidth: "380px" }}>
          {/* Drop Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "8px" }}>
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <button key={colIdx} type="button" disabled={busy || !isMyTurn || gameState.board[0][colIdx] !== null}
                onClick={() => handleAction({ type: "make_move", colIndex: colIdx })}
                style={{
                  padding: "6px 0", fontSize: "14px", fontWeight: "bold",
                  background: isMyTurn ? "rgba(37,99,235,0.8)" : "rgba(37,99,235,0.3)",
                  color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer",
                  transition: "all 0.2s",
                }}>▼</button>
            ))}
          </div>

          {/* Board */}
          <div style={{
            background: "linear-gradient(180deg, #1e3a8a, #1e40af)",
            padding: "12px", borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)",
            border: "3px solid #1d4ed8",
          }}>
            {gameState.board.map((row: (string | null)[], rIdx: number) => (
              <div key={rIdx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: rIdx < 5 ? "6px" : "0" }}>
                {row.map((cell: string | null, cIdx: number) => (
                  <div key={cIdx} style={{
                    aspectRatio: "1", borderRadius: "50%",
                    background: cell === "R"
                      ? "radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 50%, #b91c1c)"
                      : cell === "Y"
                        ? "radial-gradient(circle at 35% 35%, #fef08a, #eab308 50%, #a16207)"
                        : "radial-gradient(circle at 50% 50%, #1e293b, #0f172a)",
                    border: cell ? "none" : "2px solid #1d4ed8",
                    boxShadow: cell
                      ? `inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)`
                      : "inset 0 4px 8px rgba(0,0,0,0.5)",
                    transition: "all 0.35s ease",
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: "1.2rem", fontSize: "0.85rem", color: isMyTurn ? "#38bdf8" : "#64748b" }}>
          {isMyTurn ? `Your turn! Drop ${myColor}` : "Waiting for opponent..."}
        </p>
      </div>
    );
  }

  /* ═══════════════════ 3. ROCK PAPER SCISSORS — POKER CHIP DESIGN ═══════════════════ */
  if (gameType === "rps") {
    const p1 = gameState.player1Id === playerId;
    const myChoice = p1 ? gameState.player1Choice : gameState.player2Choice;
    const hasChosen = myChoice !== null;
    const showResults = gameState.player1Choice && gameState.player2Choice;

    const chipColors: Record<string, { from: string; to: string; shadow: string }> = {
      rock: { from: "hsl(349, 71%, 52%)", to: "hsl(349, 70%, 56%)", shadow: "hsl(349, 68%, 34%)" },
      paper: { from: "hsl(230, 89%, 62%)", to: "hsl(230, 89%, 65%)", shadow: "hsl(230, 75%, 40%)" },
      scissors: { from: "hsl(39, 89%, 49%)", to: "hsl(40, 84%, 53%)", shadow: "hsl(39, 80%, 32%)" },
    };
    const icons: Record<string, string> = { rock: "✊", paper: "✋", scissors: "✌️" };

    const PokerChip = ({ choice, size, isWinner, onClick, disabled }: { choice: string; size: number; isWinner?: boolean; onClick?: () => void; disabled?: boolean }) => {
      const c = chipColors[choice];
      return (
        <button type="button" onClick={onClick} disabled={disabled}
          style={{
            width: `${size}px`, height: `${size}px`, borderRadius: "50%",
            background: `linear-gradient(180deg, ${c.from}, ${c.to})`,
            display: "flex", justifyContent: "center", alignItems: "center",
            border: "none", cursor: onClick && !disabled ? "pointer" : "default",
            boxShadow: isWinner
              ? `0 8px 0 ${c.shadow}, 0 0 0 20px rgba(255,255,255,0.04), 0 0 0 40px rgba(255,255,255,0.03), 0 0 0 60px rgba(255,255,255,0.02)`
              : `0 8px 0 ${c.shadow}`,
            transition: "all 0.25s ease", position: "relative",
          }}>
          <div style={{
            width: "78%", height: "78%", borderRadius: "50%",
            background: "linear-gradient(180deg, #f3f3f3, #dadada)",
            boxShadow: "inset 0 6px 0 rgba(0,0,0,0.08)",
            display: "flex", justifyContent: "center", alignItems: "center",
            fontSize: `${size * 0.32}px`,
          }}>
            {icons[choice]}
          </div>
        </button>
      );
    };

    return (
      <div className="phase-card" style={{
        background: "radial-gradient(circle at top, hsl(214, 47%, 23%), hsl(237, 49%, 15%))",
        borderRadius: "20px", padding: "2rem", color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)", textAlign: "center",
        minHeight: "420px",
      }}>
        {/* Score Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: "3px solid hsl(217, 16%, 45%)", borderRadius: "12px",
          padding: "12px 20px", marginBottom: "2rem",
        }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em" }}>ROCK</div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em" }}>PAPER</div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em" }}>SCISSORS</div>
          </div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8" }}>ROUND {gameState.round}</div>
          <div style={{
            background: "#fff", borderRadius: "8px", padding: "8px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: "hsl(229, 64%, 46%)" }}>SCORE</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "hsl(229, 25%, 31%)", lineHeight: 1 }}>
              {gameState.player1Score} - {gameState.player2Score}
            </div>
          </div>
        </div>

        {!showResults ? (
          <div style={{ margin: "1rem 0" }}>
            {hasChosen ? (
              <div style={{ padding: "3rem 2rem" }}>
                <PokerChip choice={myChoice} size={130} />
                <p style={{ marginTop: "1.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                  Waiting for opponent to choose...
                </p>
              </div>
            ) : (
              <div>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Choose your weapon:</p>
                {/* Triangle layout */}
                <div style={{ position: "relative", width: "320px", height: "280px", margin: "0 auto" }}>
                  {/* Top row: Paper & Scissors */}
                  <div style={{ position: "absolute", top: 0, left: "15px" }}>
                    <PokerChip choice="paper" size={120} onClick={() => handleAction({ type: "make_choice", choice: "paper" })} disabled={busy} />
                    <div style={{ fontSize: "0.7rem", marginTop: "8px", fontWeight: 700, letterSpacing: "0.1em" }}>PAPER</div>
                  </div>
                  <div style={{ position: "absolute", top: 0, right: "15px" }}>
                    <PokerChip choice="scissors" size={120} onClick={() => handleAction({ type: "make_choice", choice: "scissors" })} disabled={busy} />
                    <div style={{ fontSize: "0.7rem", marginTop: "8px", fontWeight: 700, letterSpacing: "0.1em" }}>SCISSORS</div>
                  </div>
                  {/* Bottom center: Rock */}
                  <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
                    <PokerChip choice="rock" size={120} onClick={() => handleAction({ type: "make_choice", choice: "rock" })} disabled={busy} />
                    <div style={{ fontSize: "0.7rem", marginTop: "8px", fontWeight: 700, letterSpacing: "0.1em" }}>ROCK</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results display */
          <div style={{ margin: "1rem 0" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              {/* Player 1 */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "#94a3b8", marginBottom: "12px" }}>
                  {state.players[0]?.name?.toUpperCase()} PICKED
                </p>
                <PokerChip choice={gameState.player1Choice} size={130} isWinner={gameState.roundWinnerId === state.players[0]?.id} />
              </div>

              {/* Result text */}
              <div style={{ textAlign: "center", minWidth: "120px" }}>
                <h2 style={{
                  fontSize: "1.8rem", fontWeight: 800, margin: "0 0 1rem",
                  color: gameState.roundWinnerId === "draw" ? "#94a3b8" : "#fff",
                  textShadow: gameState.roundWinnerId !== "draw" ? "0 0 20px rgba(255,255,255,0.3)" : "none",
                }}>
                  {gameState.roundWinnerId === "draw" ? "DRAW" : gameState.roundWinnerId === playerId ? "YOU WIN" : "YOU LOSE"}
                </h2>
                {isHost && (
                  <button type="button" disabled={busy} onClick={() => handleAction({ type: "next_round" })}
                    style={{ padding: "10px 28px", background: "#fff", color: "hsl(229, 25%, 31%)", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.15em", cursor: "pointer" }}>
                    NEXT ROUND
                  </button>
                )}
              </div>

              {/* Player 2 */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "#94a3b8", marginBottom: "12px" }}>
                  {state.players[1]?.name?.toUpperCase()} PICKED
                </p>
                <PokerChip choice={gameState.player2Choice} size={130} isWinner={gameState.roundWinnerId === state.players[1]?.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════ 4. LUDO — VISUAL TRACK BOARD ═══════════════════ */
  if (gameType === "ludo") {
    const isMyTurn = gameState.currentPlayerId === playerId;
    const tokens = gameState.playerTokens[playerId] || [-1, -1];
    const colors = ["#E53935", "#1E88E5", "#43A047", "#FDD835"];
    const colorNames = ["Red", "Blue", "Green", "Yellow"];

    return (
      <div className="phase-card" style={{
        background: "linear-gradient(145deg, #1a1a2e, #16213e)",
        borderRadius: "20px", padding: "2rem", color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", color: "#10b981", textTransform: "uppercase" as const, textAlign: "center" }}>🎲 LUDO BOARD</p>

        {/* Player info cards row */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "1rem 0", flexWrap: "wrap" }}>
          {state.players.map((p, pIdx) => {
            const c = colors[pIdx % 4];
            const active = gameState.currentPlayerId === p.id;
            const pt = gameState.playerTokens[p.id] || [-1, -1];
            const homeCount = pt.filter((t: number) => t >= 30).length;
            return (
              <div key={p.id} style={{
                background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                border: active ? `2px solid ${c}` : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "10px 14px", minWidth: "90px", textAlign: "center",
                boxShadow: active ? `0 0 15px ${c}40` : "none",
                transition: "all 0.3s", opacity: active ? 1 : 0.7,
              }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "6px" }}>
                  {pt.map((pos: number, ti: number) => (
                    <div key={ti} style={{
                      width: "14px", height: "14px", borderRadius: "50%",
                      background: pos >= 30 ? "gold" : c,
                      border: pos >= 30 ? "2px solid #b8860b" : `2px solid ${c}`,
                      opacity: pos === -1 ? 0.3 : 1,
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>{p.name}</div>
                {active && <div style={{ fontSize: "0.6rem", color: c, fontWeight: 800 }}>TURN</div>}
                {homeCount > 0 && <div style={{ fontSize: "0.6rem", color: "gold" }}>🏠 {homeCount}</div>}
              </div>
            );
          })}
        </div>

        {/* Dice + Roll area */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", margin: "1.5rem 0" }}>
          <div style={{
            transform: diceAnimating ? "rotate(720deg) scale(1.1)" : "rotate(0deg) scale(1)",
            transition: diceAnimating ? "transform 0.6s ease-out" : "transform 0.3s ease",
          }}>
            <DiceFace value={gameState.diceRoll || 1} />
          </div>
          {isMyTurn && !gameState.hasRolled && (
            <button type="button" disabled={busy} onClick={() => handleAction({ type: "roll_die" })}
              style={{
                padding: "14px 28px", background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none", color: "#fff", fontWeight: 700, borderRadius: "12px",
                cursor: "pointer", fontSize: "0.95rem",
                boxShadow: "0 6px 20px rgba(16,185,129,0.4)",
              }}>
              Roll Dice 🎲
            </button>
          )}
        </div>

        {/* Visual Track Board — 10x3 grid showing the 30-step path */}
        <div style={{ margin: "1rem auto", maxWidth: "500px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "4px",
            background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "14px",
            border: "2px solid rgba(255,255,255,0.08)",
          }}>
            {Array.from({ length: 30 }).map((_, stepIdx) => {
              const stepNum = stepIdx + 1;
              const playersHere: { color: string; label: string }[] = [];
              state.players.forEach((p, pIdx) => {
                const pt = gameState.playerTokens[p.id] || [-1, -1];
                if (pt[0] === stepNum) playersHere.push({ color: colors[pIdx % 4], label: "T1" });
                if (pt[1] === stepNum) playersHere.push({ color: colors[pIdx % 4], label: "T2" });
              });
              const isGoal = stepNum === 30;
              const isSafe = [1, 8, 14, 22].includes(stepNum);
              return (
                <div key={stepIdx} title={`Step ${stepNum}`} style={{
                  height: "38px", borderRadius: "8px", position: "relative",
                  background: isGoal ? "linear-gradient(135deg, #10b981, #059669)" : isSafe ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                  border: isGoal ? "2px solid #059669" : isSafe ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                }}>
                  {isGoal ? (
                    <span style={{ fontSize: "14px" }}>🏁</span>
                  ) : isSafe ? (
                    <span style={{ fontSize: "10px", color: "#10b981", fontWeight: 800 }}>★</span>
                  ) : (
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.15)", fontWeight: 700 }}>{stepNum}</span>
                  )}

                  {/* Tokens on this cell */}
                  {playersHere.length > 0 && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                      {playersHere.map((t, ti) => (
                        <div key={ti} title={t.label} style={{
                          width: "14px", height: "14px", borderRadius: "50%",
                          background: `radial-gradient(circle at 35% 35%, ${t.color}aa, ${t.color})`,
                          border: "2px solid #fff", boxShadow: `0 0 6px ${t.color}`,
                          zIndex: 2,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Yard status */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "1rem 0", flexWrap: "wrap" }}>
          {state.players.map((p, pIdx) => {
            const pt = gameState.playerTokens[p.id] || [-1, -1];
            const c = colors[pIdx % 4];
            const inYard = pt.filter((t: number) => t === -1).length;
            if (inYard === 0) return null;
            return (
              <div key={p.id} style={{
                background: "rgba(255,255,255,0.04)", padding: "6px 12px", borderRadius: "8px",
                display: "flex", alignItems: "center", gap: "6px", border: `1px solid ${c}30`,
                fontSize: "0.75rem",
              }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                {p.name}: <strong>{inYard} in yard</strong>
              </div>
            );
          })}
        </div>

        {/* Move Token Buttons */}
        {isMyTurn && gameState.hasRolled && (
          <div style={{
            background: "rgba(255,255,255,0.04)", padding: "1.2rem", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)", textAlign: "center",
          }}>
            <p style={{ margin: "0 0 1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
              Move a piece <strong>{gameState.diceRoll}</strong> steps:
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
              {tokens.map((pos: number, idx: number) => {
                const cannotMove = (pos === -1 && gameState.diceRoll !== 6) || (pos + (gameState.diceRoll || 0) > 30);
                const myColor = colors[state.players.findIndex(p => p.id === playerId) % 4];
                return (
                  <button key={idx} type="button" disabled={busy || cannotMove}
                    onClick={() => handleAction({ type: "move_token", tokenIndex: idx })}
                    style={{
                      flex: "0 0 auto", width: "120px", padding: "14px", borderRadius: "14px",
                      background: cannotMove ? "rgba(255,255,255,0.03)" : `linear-gradient(135deg, ${myColor}, ${myColor}cc)`,
                      color: cannotMove ? "#475569" : "#fff", border: "none",
                      fontWeight: 700, cursor: cannotMove ? "default" : "pointer",
                      boxShadow: cannotMove ? "none" : `0 6px 16px ${myColor}40`,
                      transition: "all 0.2s",
                    }}>
                    <div style={{ fontSize: "1.5rem" }}>{cannotMove ? "🔒" : "🚀"}</div>
                    <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>Token {idx + 1}</div>
                    <div style={{ fontSize: "0.65rem", marginTop: "2px", opacity: 0.8 }}>
                      {pos === -1 ? "Yard (Need 6)" : `Step ${pos}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status message */}
        {!isMyTurn && (
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginTop: "1rem" }}>
            ⏳ Waiting for {state.players.find(p => p.id === gameState.currentPlayerId)?.name}'s turn...
          </p>
        )}
      </div>
    );
  }

  return <div className="phase-card">Unsupported game type</div>;
}
