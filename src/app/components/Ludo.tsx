import { useEffect, useMemo, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

type PlayerId = "red" | "green" | "yellow" | "blue";
type Token = { steps: number; finished: boolean };

const ORDER: PlayerId[] = ["red", "green", "yellow", "blue"];
const COLORS: Record<PlayerId, string> = {
  red: "bg-[#e46427]",
  green: "bg-[#1d7373]",
  yellow: "bg-[#e5b343]",
  blue: "bg-[#172748]",
};
const START: Record<PlayerId, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
const TRACK = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],
];
const HOME: Record<PlayerId, number[][]> = {
  red: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};
const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

function pos(player: PlayerId, steps: number) {
  if (steps < 0) return null;
  if (steps < 52) {
    const idx = (START[player] + steps) % 52;
    return TRACK[idx];
  }
  if (steps <= 57) return HOME[player][steps - 52];
  return [7, 7];
}

function canMove(token: Token, dice: number) {
  if (token.finished) return false;
  if (token.steps === -1) return dice === 6;
  const next = token.steps + dice;
  if (token.steps < 52) return next <= 58;
  return next <= 58;
}

export default function Ludo({ onBack }: { onBack: () => void }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [tokens, setTokens] = useState<Record<PlayerId, Token[]>>({
    red: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
    green: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
    yellow: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
    blue: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
  });
  const [current, setCurrent] = useState<PlayerId>("red");
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [movable, setMovable] = useState<number[]>([]);
  const [message, setMessage] = useState("Roll the dice to start");
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [sixStreak, setSixStreak] = useState(0);

  const active = useMemo(() => ORDER.slice(0, playerCount), [playerCount]);

  function reset() {
    setTokens({
      red: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
      green: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
      yellow: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
      blue: Array(4).fill(0).map(() => ({ steps: -1, finished: false })),
    });
    setCurrent("red");
    setDice(null);
    setHasRolled(false);
    setMovable([]);
    setMessage("Roll the dice to start");
    setWinner(null);
    setSixStreak(0);
  }

  function nextPlayer(keep = false) {
    if (keep) return;
    const idx = active.indexOf(current);
    const next = active[(idx + 1) % active.length];
    setCurrent(next);
    setDice(null);
    setHasRolled(false);
    setMovable([]);
    setMessage(`${next.toUpperCase()}'s turn`);
  }

  function afterRoll(d: number) {
    if (d === 6) {
      if (sixStreak >= 2) {
        setMessage("Three sixes! Turn lost");
        setSixStreak(0);
        setTimeout(() => nextPlayer(), 700);
        return;
      }
      setSixStreak((s) => s + 1);
    } else setSixStreak(0);

    const moves = tokens[current].map((t, i) => (canMove(t, d) ? i : -1)).filter((i) => i >= 0);
    if (moves.length === 0) {
      setMessage(d === 6 ? "No move. Extra turn." : "No moves. Next player.");
      setTimeout(() => {
        if (d === 6) {
          setHasRolled(false);
          setDice(null);
        } else nextPlayer();
      }, 700);
      return;
    }
    setMovable(moves);
    if (current !== "red") setTimeout(() => botMove(moves, d), 600);
    else setMessage(`Select a token to move ${d}`);
  }

  function rollDice() {
    if (hasRolled || rolling || winner || current !== "red") return;
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
        setHasRolled(true);
        afterRoll(d);
      }
    }, 70);
  }

  function botMove(indices: number[], d: number) {
    let best = indices[0];
    let score = -999;
    indices.forEach((i) => {
      const tok = tokens[current][i];
      let s = tok.steps === -1 ? 50 : tok.steps;
      if (tok.steps + d >= 58) s += 1000;
      if (s > score) {
        score = s;
        best = i;
      }
    });
    moveToken(best, d);
  }

  function moveToken(tokenIdx: number, d = dice || 0) {
    if (!hasRolled || !movable.includes(tokenIdx)) return;
    const copy = { ...tokens, [current]: tokens[current].map((t) => ({ ...t })) };
    const tok = copy[current][tokenIdx];
    let next = tok.steps === -1 ? 0 : tok.steps + d;
    if (next >= 58) {
      next = 58;
      tok.finished = true;
    }
    tok.steps = next;

    if (next >= 0 && next < 52) {
      const p = pos(current, next)!;
      const gIdx = TRACK.findIndex(([r, c]) => r === p[0] && c === p[1]);
      if (!SAFE.has(gIdx)) {
        for (const pid of active) {
          if (pid === current) continue;
          copy[pid].forEach((ot, j) => {
            if (ot.steps >= 0 && ot.steps < 52) {
              const op = pos(pid, ot.steps);
              if (op && op[0] === p[0] && op[1] === p[1]) {
                copy[pid][j].steps = -1;
                setMessage(`Captured ${pid}! Extra turn`);
                setTokens(copy);
                setHasRolled(false);
                setDice(null);
                setMovable([]);
                return;
              }
            }
          });
        }
      }
    }

    setTokens(copy);
    setMovable([]);
    if (copy[current].every((t) => t.finished)) {
      setWinner(current);
      setMessage(`${current.toUpperCase()} wins the board`);
      return;
    }
    if (d === 6) {
      setMessage("Rolled 6. Roll again.");
      setHasRolled(false);
      setDice(null);
    } else setTimeout(() => nextPlayer(), 450);
  }

  useEffect(() => {
    if (current === "red" || hasRolled || rolling || winner) return;
    const t = setTimeout(() => {
      setRolling(true);
      setTimeout(() => {
        const d = Math.floor(Math.random() * 6) + 1;
        setDice(d);
        setRolling(false);
        setHasRolled(true);
        afterRoll(d);
      }, 500);
    }, 700);
    return () => clearTimeout(t);
  }, [current, hasRolled, rolling, winner]);

  return (
    <GameShell
      title="Ludo"
      subtitle="2–4 players · captures · safe stars · exact home finish"
      onBack={onBack}
      badge="BOARD STRATEGY"
      right={
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <button key={n} onClick={() => { setPlayerCount(n); reset(); }} className={`heritage-button !min-h-10 !px-3 ${playerCount === n ? "ink" : "secondary"}`}>
              {n}P
            </button>
          ))}
        </div>
      }
      sidebar={
        <Panel title="Match Status">
          <div className="text-sm font-bold mb-3">{message}</div>
          {active.map((pid) => (
            <div key={pid} className={`flex items-center justify-between border-2 px-3 py-2 mb-2 ${current === pid ? "border-[var(--saffron)]" : "border-[var(--ink)]"}`}>
              <div className="flex items-center gap-2 text-sm font-bold capitalize">
                <span className={`w-3 h-3 rounded-full ${COLORS[pid]} border border-[var(--ink)]`} />
                {pid} {pid === "red" ? "(You)" : "(Bot)"}
              </div>
              <span className="text-xs font-black">{tokens[pid].filter((t) => t.finished).length}/4</span>
            </div>
          ))}
          <button onClick={reset} className="heritage-button secondary w-full mt-2"><RotateCcw size={14} /> Reset</button>
        </Panel>
      }
      tips={[
        "Roll a 6 to bring a token out of the yard.",
        "Landing on an opponent (non-safe) sends them home.",
        "Exact count is required to finish on the home path.",
      ]}
    >
      <div className="heritage-card p-3 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-sm font-bold capitalize">{current} to play · {dice ? `Dice ${dice}` : "Ready"}</div>
          <button onClick={rollDice} disabled={hasRolled || rolling || winner !== null || current !== "red"} className="heritage-button">
            <Dices size={16} /> {dice ?? "Roll"}
          </button>
        </div>

        <div className="relative max-w-[560px] mx-auto aspect-square border-2 border-[var(--ink)] bg-[var(--paper)] p-2 shadow-[var(--shadow)]">
          <div className="grid grid-cols-15 grid-rows-15 gap-px h-full w-full bg-[rgba(23,39,72,0.12)]">
            {Array.from({ length: 15 }).map((_, r) =>
              Array.from({ length: 15 }).map((_, c) => {
                let bg = "bg-[var(--paper)]";
                if (r < 6 && c < 6) bg = "bg-[#ffd8c2]";
                if (r < 6 && c > 8) bg = "bg-[#cdeedc]";
                if (r > 8 && c > 8) bg = "bg-[#fff0bf]";
                if (r > 8 && c < 6) bg = "bg-[#d7e0f2]";
                if (TRACK.some(([tr, tc]) => tr === r && tc === c)) bg = "bg-white";
                if (HOME.red.some(([hr, hc]) => hr === r && hc === c)) bg = "bg-[#ffc9b0]";
                if (HOME.green.some(([hr, hc]) => hr === r && hc === c)) bg = "bg-[#bfe8d2]";
                if (HOME.yellow.some(([hr, hc]) => hr === r && hc === c)) bg = "bg-[#ffe9a8]";
                if (HOME.blue.some(([hr, hc]) => hr === r && hc === c)) bg = "bg-[#c7d3ef]";
                if (r === 7 && c === 7) bg = "bg-[var(--saffron)]";
                const safe = TRACK.findIndex(([tr, tc]) => tr === r && tc === c);
                return (
                  <div key={`${r}-${c}`} className={`relative ${bg}`}>
                    {SAFE.has(safe) && <span className="absolute inset-0 grid place-items-center text-[8px] opacity-50">★</span>}
                  </div>
                );
              })
            )}
          </div>

          <div className="absolute inset-2">
            {active.map((pid) =>
              tokens[pid].map((tok, idx) => {
                let r = 0;
                let c = 0;
                if (tok.finished) {
                  r = 7; c = 7;
                } else if (tok.steps === -1) {
                  if (pid === "red") { r = 1 + Math.floor(idx / 2) * 2; c = 1 + (idx % 2) * 2; }
                  if (pid === "green") { r = 1 + Math.floor(idx / 2) * 2; c = 10 + (idx % 2) * 2; }
                  if (pid === "yellow") { r = 10 + Math.floor(idx / 2) * 2; c = 10 + (idx % 2) * 2; }
                  if (pid === "blue") { r = 10 + Math.floor(idx / 2) * 2; c = 1 + (idx % 2) * 2; }
                } else {
                  const p = pos(pid, tok.steps);
                  if (!p) return null;
                  r = p[0]; c = p[1];
                }
                const can = current === pid && movable.includes(idx);
                return (
                  <button
                    key={`${pid}-${idx}`}
                    onClick={() => moveToken(idx)}
                    disabled={!can}
                    style={{ left: `${(c / 15) * 100}%`, top: `${(r / 15) * 100}%`, width: `${100 / 15}%`, height: `${100 / 15}%` }}
                    className="absolute grid place-items-center"
                  >
                    <span className={`w-[78%] h-[78%] rounded-full border-2 border-white shadow ${COLORS[pid]} ${can ? "ring-2 ring-[var(--ink)] scale-110" : ""}`} />
                  </button>
                );
              })
            )}
          </div>

          {winner && (
            <div className="absolute inset-0 bg-[rgba(247,240,223,0.94)] grid place-items-center">
              <div className="text-center">
                <div className="serif text-3xl font-bold capitalize">{winner} Wins</div>
                <button onClick={reset} className="heritage-button mt-4">Play Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
