import { useState } from "react";
import { RotateCcw, Eye } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

const SHIPS = [
  { name: "Carrier", size: 5 },
  { name: "Battleship", size: 4 },
  { name: "Cruiser", size: 3 },
  { name: "Submarine", size: 3 },
  { name: "Destroyer", size: 2 },
];

function empty() {
  return Array.from({ length: 10 }, () => Array(10).fill(0));
}

function placeShips() {
  const g = empty();
  SHIPS.forEach((ship) => {
    let ok = false;
    while (!ok) {
      const r = Math.floor(Math.random() * 10);
      const c = Math.floor(Math.random() * 10);
      const horiz = Math.random() > 0.5;
      if (
        horiz &&
        c + ship.size <= 10 &&
        g[r].slice(c, c + ship.size).every((v) => v === 0)
      ) {
        for (let i = 0; i < ship.size; i++) g[r][c + i] = 1;
        ok = true;
      } else if (
        !horiz &&
        r + ship.size <= 10 &&
        g.slice(r, r + ship.size).every((row) => row[c] === 0)
      ) {
        for (let i = 0; i < ship.size; i++) g[r + i][c] = 1;
        ok = true;
      }
    }
  });
  return g;
}

export default function Battleship({ onBack }: { onBack: () => void }) {
  const [playerGrid, setPlayerGrid] = useState(placeShips);
  const [botGrid, setBotGrid] = useState(placeShips);
  const [playerShots, setPlayerShots] = useState(empty);
  const [botShots, setBotShots] = useState(empty);
  const [message, setMessage] = useState("Your turn — fire on the enemy grid");
  const [ended, setEnded] = useState(false);
  const [show, setShow] = useState(false);

  function reset() {
    setPlayerGrid(placeShips());
    setBotGrid(placeShips());
    setPlayerShots(empty());
    setBotShots(empty());
    setMessage("New battle. Fire when ready.");
    setEnded(false);
  }

  function fire(r: number, c: number) {
    if (ended || playerShots[r][c] !== 0) return;
    const ps = playerShots.map((row) => [...row]);
    ps[r][c] = botGrid[r][c] === 1 ? 2 : 1;
    setPlayerShots(ps);
    const hits = ps.flat().filter((v) => v === 2).length;
    if (hits >= 17) {
      setEnded(true);
      setMessage("All enemy ships sunk. You win!");
      return;
    }
    setMessage(ps[r][c] === 2 ? "Hit!" : "Miss");
    setTimeout(() => {
      let br = 0,
        bc = 0;
      do {
        br = Math.floor(Math.random() * 10);
        bc = Math.floor(Math.random() * 10);
      } while (botShots[br][bc] !== 0);
      const bs = botShots.map((row) => [...row]);
      bs[br][bc] = playerGrid[br][bc] === 1 ? 2 : 1;
      setBotShots(bs);
      if (bs.flat().filter((v) => v === 2).length >= 17) {
        setEnded(true);
        setMessage("Your fleet is gone. Bot wins.");
      }
    }, 450);
  }

  return (
    <GameShell
      title="Battleship"
      subtitle="10×10 naval combat · sink all five ships"
      onBack={onBack}
      badge="STRATEGY"
      right={
        <div className="flex gap-2">
          <button
            onClick={() => setShow((s) => !s)}
            className="heritage-button secondary !min-h-10"
          >
            <Eye size={14} /> {show ? "Hide" : "Show"}
          </button>
          <button onClick={reset} className="heritage-button !min-h-10">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      }
      sidebar={
        <Panel title="Fleet">
          <div className="text-sm font-bold mb-3">{message}</div>
          <div className="space-y-1 text-xs font-bold text-[var(--ink-soft)]">
            {SHIPS.map((s) => (
              <div key={s.name}>
                {s.name} · {s.size}
              </div>
            ))}
          </div>
        </Panel>
      }
      tips={[
        "Click enemy cells to fire.",
        "Dark cells are misses. Saffron cells are hits.",
        "Sink all 17 ship cells to win.",
      ]}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="heritage-card p-3">
          <div className="text-[10px] font-black tracking-widest uppercase mb-2">
            Your Fleet
          </div>
          <div className="grid grid-cols-10 gap-1">
            {playerGrid.map((row, r) =>
              row.map((v, c) => {
                const shot = botShots[r][c];
                let cls = "bg-[var(--paper)]";
                if (v === 1 && show && shot === 0) cls = "bg-[#1d7373]";
                if (shot === 1) cls = "bg-[#c5c8d0]";
                if (shot === 2) cls = "bg-[#e46427]";
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square border border-[var(--ink)] ${cls}`}
                  />
                );
              }),
            )}
          </div>
        </div>
        <div className="heritage-card p-3">
          <div className="text-[10px] font-black tracking-widest uppercase mb-2">
            Enemy Grid
          </div>
          <div className="grid grid-cols-10 gap-1">
            {playerShots.map((row, r) =>
              row.map((v, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => fire(r, c)}
                  className={`aspect-square border border-[var(--ink)] ${
                    v === 0
                      ? "bg-[var(--paper-deep)] hover:bg-[var(--paper)]"
                      : v === 1
                        ? "bg-[#c5c8d0]"
                        : "bg-[#e46427]"
                  }`}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
