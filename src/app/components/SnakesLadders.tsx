import { useEffect, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

const BOARD = 100;
const LINKS = [
  { from: 16, to: 6, type: "snake" },
  { from: 47, to: 26, type: "snake" },
  { from: 49, to: 11, type: "snake" },
  { from: 56, to: 53, type: "snake" },
  { from: 62, to: 19, type: "snake" },
  { from: 64, to: 60, type: "snake" },
  { from: 87, to: 24, type: "snake" },
  { from: 93, to: 73, type: "snake" },
  { from: 95, to: 75, type: "snake" },
  { from: 98, to: 78, type: "snake" },
  { from: 1, to: 38, type: "ladder" },
  { from: 4, to: 14, type: "ladder" },
  { from: 9, to: 31, type: "ladder" },
  { from: 21, to: 42, type: "ladder" },
  { from: 28, to: 84, type: "ladder" },
  { from: 36, to: 44, type: "ladder" },
  { from: 51, to: 67, type: "ladder" },
  { from: 71, to: 91, type: "ladder" },
  { from: 80, to: 100, type: "ladder" },
];
const COLORS = ["bg-[#e46427]", "bg-[#1d7373]", "bg-[#e5b343]", "bg-[#172748]"];
const NAMES = ["You", "Bot A", "Bot B", "Bot C"];

export default function SnakesLadders({ onBack }: { onBack: () => void }) {
  const [players, setPlayers] = useState(2);
  const [positions, setPositions] = useState([0, 0, 0, 0]);
  const [current, setCurrent] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("Roll to begin");
  const [winner, setWinner] = useState<number | null>(null);

  function reset() {
    setPositions([0, 0, 0, 0]);
    setCurrent(0);
    setDice(null);
    setMessage("Game reset. Your turn.");
    setWinner(null);
  }

  function roll() {
    if (rolling || winner !== null || current !== 0) return;
    setRolling(true);
    let t = 0;
    const iv = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      t += 1;
      if (t > 8) {
        clearInterval(iv);
        const d = Math.floor(Math.random() * 6) + 1;
        setDice(d);
        setRolling(false);
        move(0, d);
      }
    }, 70);
  }

  function move(player: number, d: number) {
    const pos = positions[player];
    const next = pos + d;
    if (next > BOARD) {
      setMessage(`${NAMES[player]} needs exact roll`);
      setTimeout(() => setCurrent((c) => (c + 1) % players), 500);
      return;
    }
    let final = next;
    const link = LINKS.find((l) => l.from === next);
    if (link) {
      final = link.to;
      setMessage(
        link.type === "snake"
          ? `Snake! Down to ${link.to}`
          : `Ladder! Up to ${link.to}`,
      );
    } else setMessage(`${NAMES[player]} moves to ${next}`);
    const arr = [...positions];
    arr[player] = final;
    setPositions(arr);
    if (final === BOARD) {
      setWinner(player);
      setMessage(`${NAMES[player]} wins!`);
      return;
    }
    setTimeout(() => setCurrent((c) => (c + 1) % players), link ? 900 : 500);
  }

  useEffect(() => {
    if (current === 0 || winner !== null || rolling) return;
    const t = setTimeout(() => {
      const d = Math.floor(Math.random() * 6) + 1;
      setDice(d);
      move(current, d);
    }, 700);
    return () => clearTimeout(t);
  }, [current, winner, rolling]);

  const cells = Array.from({ length: 100 }, (_, i) => {
    const num = 100 - i;
    const row = Math.floor(i / 10);
    const col = i % 10;
    const display = row % 2 === 0 ? num : row * 10 + (10 - col);
    return display;
  });

  return (
    <GameShell
      title="Snakes & Ladders"
      subtitle="Race to 100 · climb ladders · avoid snakes"
      onBack={onBack}
      badge="BOARD LUCK"
      right={
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => {
                setPlayers(n);
                reset();
              }}
              className={`heritage-button !min-h-10 !px-3 ${players === n ? "ink" : "secondary"}`}
            >
              {n}P
            </button>
          ))}
        </div>
      }
      sidebar={
        <Panel title="Players">
          {Array.from({ length: players }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between border-2 px-3 py-2 mb-2 ${current === i ? "border-[var(--saffron)] bg-[rgba(228,100,39,0.08)]" : "border-[var(--ink)] bg-[var(--paper)]"}`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <span
                  className={`w-4 h-4 rounded-full ${COLORS[i]} border border-[var(--ink)]`}
                />
                {NAMES[i]}
              </div>
              <span className="font-black">{positions[i]}</span>
            </div>
          ))}
          <button
            onClick={reset}
            className="heritage-button secondary w-full mt-2"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </Panel>
      }
      tips={[
        "Exact roll required to finish on 100.",
        "Ladders boost you up. Snakes send you down.",
        "Bots roll automatically on their turns.",
      ]}
    >
      <div className="heritage-card p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm font-bold">{message}</div>
          <button
            onClick={roll}
            disabled={rolling || current !== 0 || winner !== null}
            className="heritage-button"
          >
            <Dices size={16} /> {dice ?? "Roll"}
          </button>
        </div>
        <div className="grid grid-cols-10 gap-1 max-w-[560px] mx-auto border-2 border-[var(--ink)] p-2 bg-[var(--ink)]">
          {cells.map((num) => {
            const link = LINKS.find((l) => l.from === num);
            const here = positions
              .map((p, i) => (p === num ? i : -1))
              .filter((i) => i >= 0);
            return (
              <div
                key={num}
                className={`aspect-square relative border border-[rgba(23,39,72,0.15)] text-[9px] font-bold flex items-start justify-start p-0.5 ${link?.type === "snake" ? "bg-[#ffe3e3]" : link?.type === "ladder" ? "bg-[#d8f3dc]" : "bg-[var(--paper)]"}`}
              >
                <span className="opacity-50">{num}</span>
                {link && (
                  <span className="absolute bottom-0.5 right-0.5 text-[10px]">
                    {link.type === "snake" ? "S" : "L"}
                  </span>
                )}
                {here.map((pi, idx) => (
                  <span
                    key={pi}
                    className={`absolute w-3 h-3 rounded-full border border-white ${COLORS[pi]}`}
                    style={{ right: 2 + idx * 5, top: 10 }}
                  />
                ))}
              </div>
            );
          })}
        </div>
        {winner !== null && (
          <div className="mt-4 text-center">
            <div className="serif text-2xl font-bold">{NAMES[winner]} wins</div>
            <button onClick={reset} className="heritage-button mt-3">
              Play Again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
