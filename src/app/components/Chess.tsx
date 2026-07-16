import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

type Piece = { type: "k" | "q" | "r" | "b" | "n" | "p"; color: "w" | "b" };
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const UNI: Record<string, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
};

function initBoard(): (Piece | null)[][] {
  const back: Piece["type"][] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const b: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null),
  );
  back.forEach((p, i) => {
    b[0][i] = { type: p, color: "b" };
    b[1][i] = { type: "p", color: "b" };
    b[6][i] = { type: "p", color: "w" };
    b[7][i] = { type: p, color: "w" };
  });
  return b;
}

export default function Chess({
  onBack,
  state,
  onAction,
  playerId,
}: {
  onBack: () => void;
  state?: any;
  onAction?: any;
  playerId?: string;
}) {
  const [board, setBoard] = useState(initBoard());
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [captured, setCaptured] = useState<Piece[]>([]);

  // Live Sync Hook
  useEffect(() => {
    if (state?.gameState) {
      const s = state.gameState;
      if (s.board !== undefined) setBoard(s.board);
      if (s.turn !== undefined) setTurn(s.turn);
      if (s.moves !== undefined) setMoves(s.moves);
      if (s.captured !== undefined) setCaptured(s.captured);
    }
  }, [state?.gameState]);

  const broadcastSync = (payload: any) => {
    if (onAction) onAction({ type: "SYNC", payloadState: payload });
  };

  function click(r: number, c: number) {
    if (selected) {
      const [sr, sc] = selected;
      const piece = board[sr][sc];
      if (piece && piece.color === turn) {
        const next = board.map((row) => [...row]);
        if (next[r][c]) setCaptured((prev) => [...prev, next[r][c]!]);
        next[r][c] = next[sr][sc];
        next[sr][sc] = null;
        setBoard(next);
        setTurn((t) => (t === "w" ? "b" : "w"));
        setSelected(null);
        setMoves((m) =>
          [`${FILES[sc]}${8 - sr} → ${FILES[c]}${8 - r}`, ...m].slice(0, 16),
        );
        broadcastSync({
          board: next,
          turn: turn === "w" ? "b" : "w",
          moves: [
            `${FILES[sc]}${8 - sr} → ${FILES[c]}${8 - r}`,
            ...moves,
          ].slice(0, 16),
          captured: next[r][c] ? [...captured, next[r][c]!] : captured,
        });
        return;
      }
    }
    const piece = board[r][c];
    if (piece && piece.color === turn) setSelected([r, c]);
    else setSelected(null);
  }

  function reset() {
    setBoard(initBoard());
    setTurn("w");
    setSelected(null);
    setMoves([]);
    setCaptured([]);
    broadcastSync({ board: initBoard(), turn: "w", moves: [], captured: [] });
  }

  return (
    <GameShell
      title="Chess"
      subtitle="Local two-player chess · move history · captures"
      onBack={onBack}
      badge="STRATEGY"
      right={
        <button onClick={reset} className="heritage-button !min-h-10">
          <RotateCcw size={14} /> New Game
        </button>
      }
      sidebar={
        <Panel title="Moves">
          <div className="text-xs font-bold mb-3">
            {turn === "w" ? "White" : "Black"} to move
          </div>
          <div className="space-y-1 max-h-[280px] overflow-auto scrollbar-thin">
            {moves.length === 0 && (
              <div className="text-xs text-[var(--ink-soft)] py-4 text-center">
                No moves yet
              </div>
            )}
            {moves.map((m, i) => (
              <div
                key={i}
                className="text-xs border border-[var(--ink)] bg-[var(--paper)] px-2 py-1"
              >
                {i + 1}. {m}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-[var(--ink-soft)]">
            Captured:{" "}
            {captured.slice(-8).map((p, i) => (
              <span key={i}>
                {UNI[p.color === "w" ? p.type.toUpperCase() : p.type]}
              </span>
            ))}
          </div>
        </Panel>
      }
      tips={[
        "Click a piece, then click a destination square.",
        "White moves first.",
        "This local version focuses on clean UX and readable board state.",
      ]}
    >
      <div className="heritage-card p-3 md:p-5">
        <div className="max-w-[480px] mx-auto border-2 border-[var(--ink)] shadow-[var(--shadow)]">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((piece, c) => {
                const light = (r + c) % 2 === 0;
                const isSelected = selected?.[0] === r && selected?.[1] === c;
                return (
                  <button
                    key={c}
                    onClick={() => click(r, c)}
                    className={`flex-1 aspect-square text-[26px] md:text-[32px] grid place-items-center ${
                      light ? "bg-[#f3e6c8]" : "bg-[#7f9b63]"
                    } ${isSelected ? "outline outline-4 outline-[var(--saffron)] outline-offset-[-4px]" : ""}`}
                  >
                    {piece && (
                      <span
                        className={
                          piece.color === "w"
                            ? "text-white drop-shadow"
                            : "text-black"
                        }
                      >
                        {
                          UNI[
                            piece.color === "w"
                              ? piece.type.toUpperCase()
                              : piece.type
                          ]
                        }
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
