import { useEffect, useMemo, useState } from "react";
import { Bot, RotateCcw, Undo2, Users } from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

type Cell = "X" | "O" | null;
type Mode = "2P" | "AI_EASY" | "AI_HARD";
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null as Cell, line: null as number[] | null };
}

function minimax(board: Cell[], isMax: boolean, depth: number): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (board.every(Boolean)) return 0;
  if (isMax) {
    let best = -Infinity;
    board.forEach((c, i) => {
      if (!c) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false, depth + 1));
        board[i] = null;
      }
    });
    return best;
  }
  let best = Infinity;
  board.forEach((c, i) => {
    if (!c) {
      board[i] = "X";
      best = Math.min(best, minimax(board, true, depth + 1));
      board[i] = null;
    }
  });
  return best;
}

export default function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [mode, setMode] = useState<Mode>("2P");
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [history, setHistory] = useState<Cell[][]>([]);

  const { winner, line } = useMemo(() => checkWinner(board), [board]);
  const isDraw = !winner && board.every(Boolean);

  useEffect(() => {
    if (winner || isDraw) {
      if (winner)
        setScores((s) => ({ ...s, [winner]: s[winner as "X" | "O"] + 1 }));
      else setScores((s) => ({ ...s, D: s.D + 1 }));
      if (line) setWinningLine(line);
    }
  }, [winner, isDraw, line]);

  useEffect(() => {
    if (mode === "2P" || winner || isDraw || xTurn) return;
    const t = setTimeout(() => {
      if (mode === "AI_EASY") {
        const empties = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
        play(empties[Math.floor(Math.random() * empties.length)]);
      } else {
        let bestVal = -Infinity;
        let bestIdx = -1;
        const copy = [...board];
        copy.forEach((c, i) => {
          if (!c) {
            copy[i] = "O";
            const val = minimax([...copy], false, 0);
            copy[i] = null;
            if (val > bestVal) {
              bestVal = val;
              bestIdx = i;
            }
          }
        });
        if (bestIdx >= 0) play(bestIdx);
      }
    }, 420);
    return () => clearTimeout(t);
  }, [xTurn, board, mode, winner, isDraw]);

  function play(idx: number) {
    if (board[idx] || winner) return;
    setHistory((h) => [...h, [...board]]);
    const next = [...board];
    next[idx] = xTurn ? "X" : "O";
    setBoard(next);
    setXTurn(!xTurn);
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setBoard(last);
    setHistory((h) => h.slice(0, -1));
    setXTurn((t) => !t);
    setWinningLine(null);
  }

  function reset(round = false) {
    setBoard(Array(9).fill(null));
    setXTurn(true);
    setWinningLine(null);
    setHistory([]);
    if (!round) setScores({ X: 0, O: 0, D: 0 });
  }

  return (
    <GameShell
      title="Tic-Tac-Toe"
      subtitle="3×3 alignment · Easy AI · Pro AI · Local multiplayer test mode"
      onBack={onBack}
      badge="GRID STRATEGY"
      right={
        <div className="flex gap-2">
          {(
            [
              ["2P", Users, "2P"],
              ["AI_EASY", Bot, "Easy"],
              ["AI_HARD", Bot, "Pro"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => {
                setMode(id);
                reset(true);
              }}
              className={`heritage-button !min-h-10 !px-3 ${mode === id ? "ink" : "secondary"}`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      }
      sidebar={
        <Panel title="Scoreboard">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="X" value={scores.X} active={xTurn && !winner} />
            <Stat label="Draw" value={scores.D} />
            <Stat label="O" value={scores.O} active={!xTurn && !winner} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={undo} className="heritage-button secondary">
              <Undo2 size={14} /> Undo
            </button>
            <button onClick={() => reset(true)} className="heritage-button">
              <RotateCcw size={14} /> New Round
            </button>
          </div>
        </Panel>
      }
      tips={[
        "Get three marks in a row — horizontal, vertical, or diagonal.",
        "Pro AI uses minimax and is extremely hard to beat.",
        "Use 2P mode to validate local multiplayer flow.",
      ]}
    >
      <div className="heritage-card p-4 md:p-6">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-[var(--ink)] bg-[var(--paper)] text-xs font-bold">
            {winner
              ? `${winner} wins this round`
              : isDraw
                ? "Draw game"
                : `${xTurn ? "X" : "O"} to move`}
          </div>
        </div>

        <div className="relative max-w-[420px] mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, i) => {
              const win = winningLine?.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => play(i)}
                  className={`aspect-square border-2 border-[var(--ink)] text-[42px] md:text-[48px] font-black serif transition active:translate-x-[1px] active:translate-y-[1px] ${
                    win
                      ? "bg-[rgba(228,100,39,0.18)] shadow-[3px_3px_0_var(--ink)]"
                      : "bg-[var(--paper)] hover:bg-[var(--paper-deep)]"
                  }`}
                >
                  <span
                    className={
                      cell === "X"
                        ? "text-[var(--saffron-dark)]"
                        : "text-[var(--teal)]"
                    }
                  >
                    {cell}
                  </span>
                </button>
              );
            })}
          </div>

          {(winner || isDraw) && (
            <div className="absolute inset-0 bg-[rgba(247,240,223,0.92)] border-2 border-[var(--ink)] flex flex-col items-center justify-center gap-3 animate-fade-up">
              <div className="serif text-3xl font-bold">
                {winner ? `${winner} Wins` : "Draw"}
              </div>
              <button onClick={() => reset(true)} className="heritage-button">
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
