import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

const DIRS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

function init(): (0 | 1 | 2)[][] {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0) as (0 | 1 | 2)[]);
  b[3][3] = b[4][4] = 2;
  b[3][4] = b[4][3] = 1;
  return b;
}

function flips(board: (0 | 1 | 2)[][], r: number, c: number, player: 1 | 2) {
  if (board[r][c] !== 0) return [] as [number, number][];
  const opp = player === 1 ? 2 : 1;
  const all: [number, number][] = [];
  DIRS.forEach(([dr, dc]) => {
    let nr = r + dr,
      nc = c + dc;
    const line: [number, number][] = [];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opp) {
      line.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    if (
      nr >= 0 &&
      nr < 8 &&
      nc >= 0 &&
      nc < 8 &&
      board[nr][nc] === player &&
      line.length
    )
      all.push(...line);
  });
  return all;
}

export default function Othello({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState(init);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [message, setMessage] = useState("Black starts");
  const [over, setOver] = useState(false);

  const valid = useMemo(() => {
    const list: [number, number][] = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (flips(board, r, c, turn).length) list.push([r, c]);
    return list;
  }, [board, turn]);

  const scores = useMemo(() => {
    const flat = board.flat();
    return {
      black: flat.filter((v) => v === 1).length,
      white: flat.filter((v) => v === 2).length,
    };
  }, [board]);

  function place(r: number, c: number) {
    if (over) return;
    const f = flips(board, r, c, turn);
    if (!f.length) return;
    const next = board.map((row) => [...row]) as (0 | 1 | 2)[][];
    next[r][c] = turn;
    f.forEach(([fr, fc]) => (next[fr][fc] = turn));
    setBoard(next);
    const nxt = turn === 1 ? 2 : 1;
    const hasNext = (() => {
      for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
          if (flips(next, i, j, nxt).length) return true;
      return false;
    })();
    if (!hasNext) {
      const hasSame = (() => {
        for (let i = 0; i < 8; i++)
          for (let j = 0; j < 8; j++)
            if (flips(next, i, j, turn).length) return true;
        return false;
      })();
      if (!hasSame) {
        setOver(true);
        setMessage(
          scores.black === scores.white
            ? "Draw"
            : scores.black > scores.white
              ? "Black wins"
              : "White wins",
        );
        return;
      }
      setMessage(`${turn === 1 ? "Black" : "White"} plays again`);
    } else {
      setTurn(nxt);
      setMessage(`${nxt === 1 ? "Black" : "White"} to move`);
    }
  }

  function reset() {
    setBoard(init());
    setTurn(1);
    setMessage("Black starts");
    setOver(false);
  }

  return (
    <GameShell
      title="Othello / Reversi"
      subtitle="Flip discs · control corners · outnumber your opponent"
      onBack={onBack}
      badge="STRATEGY"
      right={
        <button onClick={reset} className="heritage-button !min-h-10">
          <RotateCcw size={14} /> New
        </button>
      }
      sidebar={
        <Panel title="Score">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Black" value={scores.black} active={turn === 1} />
            <Stat label="White" value={scores.white} active={turn === 2} />
          </div>
          <div className="mt-3 text-xs font-bold text-[var(--ink-soft)]">
            {message} · {valid.length} moves
          </div>
        </Panel>
      }
      tips={[
        "Place a disc that outflanks at least one opponent disc.",
        "All flanked discs flip to your color.",
        "Corners are the strongest squares.",
      ]}
    >
      <div className="heritage-card p-3 md:p-5">
        <div className="max-w-[480px] mx-auto border-2 border-[var(--ink)] bg-[#1b5e20] p-2 shadow-[var(--shadow)]">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const isValid = valid.some(([vr, vc]) => vr === r && vc === c);
                return (
                  <button
                    key={c}
                    onClick={() => place(r, c)}
                    className={`flex-1 aspect-square border border-[rgba(0,0,0,0.15)] grid place-items-center ${isValid ? "bg-[rgba(255,255,255,0.08)]" : ""}`}
                  >
                    {cell === 1 && (
                      <span className="w-[78%] h-[78%] rounded-full bg-black border border-white/20" />
                    )}
                    {cell === 2 && (
                      <span className="w-[78%] h-[78%] rounded-full bg-white border border-black/10" />
                    )}
                    {cell === 0 && isValid && (
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {over && (
          <div className="mt-4 text-center">
            <div className="serif text-2xl font-bold">{message}</div>
            <button onClick={reset} className="heritage-button mt-3">
              Play Again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
