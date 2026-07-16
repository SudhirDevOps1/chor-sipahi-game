import { useEffect, useMemo, useState } from "react";
import { Bot, RotateCcw, Undo2, Users } from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

const ROWS = 6;
const COLS = 7;
type Cell = 0 | 1 | 2;
type Mode = "2P" | "AI";

function checkWin(board: Cell[][]) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (!player) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) break;
          line.push([nr, nc]);
        }
        if (line.length === 4) return { winner: player, line };
      }
    }
  }
  return { winner: 0 as Cell, line: null as [number, number][] | null };
}

export default function ConnectFour({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Cell[][]>(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[]));
  const [turn, setTurn] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode>("2P");
  const [scores, setScores] = useState({ 1: 0, 2: 0, D: 0 });
  const [winningLine, setWinningLine] = useState<[number, number][] | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [history, setHistory] = useState<Cell[][][]>([]);

  const { winner } = useMemo(() => checkWin(board), [board]);
  const isDraw = board.every((row) => row.every((c) => c !== 0));

  useEffect(() => {
    const result = checkWin(board);
    if (result.winner || isDraw) {
      if (result.line) setWinningLine(result.line);
      if (result.winner) setScores((s) => ({ ...s, [result.winner]: s[result.winner as 1 | 2] + 1 }));
      else if (isDraw) setScores((s) => ({ ...s, D: s.D + 1 }));
    }
  }, [board, isDraw]);

  useEffect(() => {
    if (mode !== "AI" || turn !== 2 || winner || isDraw) return;
    const t = setTimeout(() => {
      const findWinning = (player: Cell) => {
        for (let c = 0; c < COLS; c++) {
          const r = getDropRow(board, c);
          if (r === -1) continue;
          const nb = board.map((row) => [...row]);
          nb[r][c] = player;
          if (checkWin(nb).winner === player) return c;
        }
        return null;
      };
      let col = findWinning(2);
      if (col === null) col = findWinning(1);
      if (col === null) {
        for (const c of [3, 2, 4, 1, 5, 0, 6]) {
          if (getDropRow(board, c) !== -1) {
            col = c;
            break;
          }
        }
      }
      if (col !== null) drop(col);
    }, 450);
    return () => clearTimeout(t);
  }, [turn, board, mode, winner, isDraw]);

  function getDropRow(b: Cell[][], col: number) {
    for (let r = ROWS - 1; r >= 0; r--) if (b[r][col] === 0) return r;
    return -1;
  }

  function drop(col: number) {
    if (winner || isDraw) return;
    const r = getDropRow(board, col);
    if (r === -1) return;
    setHistory((h) => [...h, board.map((row) => [...row])]);
    const nb = board.map((row) => [...row]);
    nb[r][col] = turn;
    setBoard(nb);
    setLastMove([r, col]);
    setTurn((t) => (t === 1 ? 2 : 1));
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setBoard(last.map((r) => [...r]) as Cell[][]);
    setHistory((h) => h.slice(0, -1));
    setTurn((t) => (t === 1 ? 2 : 1));
    setWinningLine(null);
    setLastMove(null);
  }

  function reset(full = false) {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[]));
    setTurn(1);
    setWinningLine(null);
    setLastMove(null);
    setHistory([]);
    if (full) setScores({ 1: 0, 2: 0, D: 0 });
  }

  return (
    <GameShell
      title="Connect Four"
      subtitle="7×6 gravity grid · drop discs · connect four in any direction"
      onBack={onBack}
      badge="GRID STRATEGY"
      right={
        <div className="flex gap-2">
          <button onClick={() => { setMode("2P"); reset(true); }} className={`heritage-button !min-h-10 ${mode === "2P" ? "ink" : "secondary"}`}>
            <Users size={14} /> 2P
          </button>
          <button onClick={() => { setMode("AI"); reset(true); }} className={`heritage-button !min-h-10 ${mode === "AI" ? "ink" : "secondary"}`}>
            <Bot size={14} /> Bot
          </button>
        </div>
      }
      sidebar={
        <Panel title="Match Center">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Red" value={scores[1]} active={turn === 1 && !winner} />
            <Stat label="Yellow" value={scores[2]} active={turn === 2 && !winner} />
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--ink-soft)]">Draws: {scores.D}</div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={undo} className="heritage-button secondary"><Undo2 size={14} /> Undo</button>
            <button onClick={() => reset(false)} className="heritage-button"><RotateCcw size={14} /> New</button>
          </div>
        </Panel>
      }
      tips={[
        "Drop a disc into any column. Gravity places it at the lowest free cell.",
        "Connect four discs horizontally, vertically, or diagonally.",
        "Center control creates the most simultaneous threats.",
      ]}
    >
      <div className="heritage-card p-3 md:p-5">
        <div className="text-center mb-4 text-sm font-bold">
          {!winner && !isDraw
            ? `${turn === 1 ? "Red" : "Yellow"} to move${mode === "AI" && turn === 2 ? " · Bot thinking…" : ""}`
            : winner
              ? `${winner === 1 ? "Red" : "Yellow"} wins`
              : "Draw game"}
        </div>

        <div
          className="max-w-[520px] mx-auto border-2 border-[var(--ink)] bg-[var(--ink)] p-3 shadow-[var(--shadow)]"
          onMouseLeave={() => setHoverCol(null)}
        >
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: COLS }).map((_, c) => {
                const val = board[r][c];
                const isWin = winningLine?.some(([wr, wc]) => wr === r && wc === c);
                const isLast = lastMove?.[0] === r && lastMove?.[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    onMouseEnter={() => setHoverCol(c)}
                    onClick={() => drop(c)}
                    className="aspect-square rounded-full bg-[var(--paper)] border-2 border-[rgba(255,255,255,0.08)] relative"
                  >
                    {val !== 0 && (
                      <div
                        className={`absolute inset-[10%] rounded-full border-2 border-[var(--ink)] ${
                          val === 1 ? "bg-[#e46427]" : "bg-[#e5b343]"
                        } ${isLast ? "animate-drop" : ""} ${isWin ? "ring-4 ring-[var(--paper)]" : ""}`}
                      />
                    )}
                    {val === 0 && hoverCol === c && getDropRow(board, c) === r && (
                      <div className={`absolute inset-[22%] rounded-full border-2 border-dashed ${turn === 1 ? "border-[#e46427]" : "border-[#e5b343]"}`} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {(winner !== 0 || isDraw) && (
          <div className="mt-4 text-center">
            <button onClick={() => reset(false)} className="heritage-button">Play Again</button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
