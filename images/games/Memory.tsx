import { useEffect, useState } from "react";
import GameShell, { Panel, Stat } from "../components/GameShell";

const EMOJIS = ["🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥝","🍌","🍉","🍍","🥭"];

export default function Memory({ onBack }: { onBack: () => void }) {
  const [pairs, setPairs] = useState(8);
  const [players, setPlayers] = useState(1);
  const [grid, setGrid] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [matched, setMatched] = useState<boolean[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState("Flip two cards to find a pair");

  useEffect(() => {
    const selected = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, pairs);
    const cards = [...selected, ...selected].sort(() => Math.random() - 0.5);
    setGrid(cards);
    setFlipped(Array(cards.length).fill(false));
    setMatched(Array(cards.length).fill(false));
    setOpen([]);
    setMoves(0);
    setScores([0, 0]);
    setCurrent(0);
    setMessage("Flip two cards to find a pair");
  }, [pairs, players]);

  function flip(idx: number) {
    if (matched[idx] || open.includes(idx) || open.length >= 2) return;
    const nextFlipped = [...flipped];
    nextFlipped[idx] = true;
    setFlipped(nextFlipped);
    const nextOpen = [...open, idx];
    setOpen(nextOpen);
    if (nextOpen.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextOpen;
      if (grid[a] === grid[b]) {
        const nextMatched = [...matched];
        nextMatched[a] = true;
        nextMatched[b] = true;
        setMatched(nextMatched);
        setScores((s) => {
          const n = [...s];
          n[current] += 1;
          return n;
        });
        setOpen([]);
        setMessage(nextMatched.every(Boolean) ? "All pairs found!" : `Player ${current + 1} found a pair`);
      } else {
        setMessage("No match");
        setTimeout(() => {
          const reset = [...flipped];
          reset[a] = false;
          reset[b] = false;
          setFlipped(reset);
          setOpen([]);
          if (players > 1) setCurrent((c) => (c + 1) % players);
        }, 700);
      }
    }
  }

  return (
    <GameShell
      title="Memory"
      subtitle="Flip cards · find pairs · train focus"
      onBack={onBack}
      badge="MEMORY"
      right={
        <div className="flex gap-2">
          {[6, 8, 12].map((n) => (
            <button key={n} onClick={() => setPairs(n)} className={`heritage-button !min-h-10 !px-3 ${pairs === n ? "ink" : "secondary"}`}>{n}</button>
          ))}
          <button onClick={() => setPlayers((p) => (p === 1 ? 2 : 1))} className="heritage-button secondary !min-h-10 !px-3">
            {players}P
          </button>
        </div>
      }
      sidebar={
        <Panel title="Session">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Moves" value={moves} />
            <Stat label="Pairs" value={pairs} />
          </div>
          {players === 2 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label="P1" value={scores[0]} active={current === 0} />
              <Stat label="P2" value={scores[1]} active={current === 1} />
            </div>
          )}
          <div className="mt-3 text-xs font-bold text-[var(--ink-soft)]">{message}</div>
        </Panel>
      }
      tips={["Remember card positions after each flip.", "In 2P mode, turns switch after a miss.", "Fewer pairs = faster games."]}
    >
      <div className="heritage-card p-4 md:p-5">
        <div className={`grid gap-3 max-w-[560px] mx-auto ${pairs > 8 ? "grid-cols-6" : "grid-cols-4"}`}>
          {grid.map((emoji, i) => (
            <button
              key={i}
              onClick={() => flip(i)}
              className={`aspect-square border-2 border-[var(--ink)] text-2xl md:text-3xl grid place-items-center transition ${
                flipped[i] || matched[i]
                  ? "bg-[var(--paper-light)] shadow-[3px_3px_0_var(--ink)]"
                  : "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--line)]"
              }`}
            >
              {flipped[i] || matched[i] ? emoji : "?"}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
