import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

type Color = "red" | "green" | "blue" | "yellow" | "wild";
type Card = { color: Color; value: string; id: string };
const COLORS: Color[] = ["red", "green", "blue", "yellow"];
const VALUES = ["0","1","2","3","4","5","6","7","8","9","skip","reverse","+2"];

function makeDeck(): Card[] {
  const d: Card[] = [];
  COLORS.forEach((c) => {
    VALUES.forEach((v, i) => {
      d.push({ color: c, value: v, id: `${c}-${v}-${i}` });
      if (v !== "0") d.push({ color: c, value: v, id: `${c}-${v}-${i}-b` });
    });
    d.push({ color: "wild", value: "wild", id: `wild-${c}` });
    d.push({ color: "wild", value: "+4", id: `wild4-${c}` });
  });
  return d.sort(() => Math.random() - 0.5);
}

const BG: Record<Color, string> = {
  red: "bg-[#e46427]",
  green: "bg-[#1d7373]",
  blue: "bg-[#172748]",
  yellow: "bg-[#e5b343]",
  wild: "bg-[var(--ink)]",
};

export default function Uno({ onBack }: { onBack: () => void }) {
  const [players, setPlayers] = useState(3);
  const [hands, setHands] = useState<Card[][]>([]);
  const [discard, setDiscard] = useState<Card | null>(null);
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [message, setMessage] = useState("Match color or value");
  const [ended, setEnded] = useState(false);

  function deal() {
    const deck = makeDeck();
    const h = Array.from({ length: players }, () => deck.splice(0, 7));
    setHands(h);
    setDiscard(deck[0]);
    setCurrent(0);
    setDir(1);
    setEnded(false);
    setMessage("Your turn — play a matching card or draw");
  }

  useEffect(() => { deal(); }, [players]);

  function canPlay(card: Card) {
    if (!discard) return true;
    return card.color === "wild" || card.color === discard.color || card.value === discard.value;
  }

  function advance(from: number, steps = 1) {
    return (from + dir * steps + players * 10) % players;
  }

  function applyEffect(card: Card, from: number) {
    let nextDir = dir;
    if (card.value === "reverse") nextDir = -dir;
    setDir(nextDir);
    const steps = card.value === "skip" ? 2 : 1;
    setCurrent((from + nextDir * steps + players * 10) % players);
  }

  function playCard(idx: number) {
    if (ended || current !== 0) return;
    const card = hands[0][idx];
    if (!card || !canPlay(card)) return;
    const nh = hands.map((h, i) => (i === 0 ? h.filter((_, j) => j !== idx) : [...h]));
    setHands(nh);
    setDiscard(card);
    if (nh[0].length === 0) {
      setEnded(true);
      setMessage("You win!");
      return;
    }
    applyEffect(card, 0);
    setMessage("Card played");
  }

  function draw() {
    if (ended || current !== 0) return;
    const color = COLORS[Math.floor(Math.random() * 4)];
    const nh = hands.map((h, i) => (i === 0 ? [...h, { color, value: String(Math.floor(Math.random() * 10)), id: `draw-${Date.now()}` }] : h));
    setHands(nh);
    setCurrent(advance(0));
    setMessage("You drew a card");
  }

  useEffect(() => {
    if (ended || current === 0) return;
    const t = setTimeout(() => {
      const hand = hands[current];
      const idx = hand.findIndex(canPlay);
      if (idx >= 0) {
        const card = hand[idx];
        const nh = hands.map((h, i) => (i === current ? h.filter((_, j) => j !== idx) : [...h]));
        setHands(nh);
        setDiscard(card);
        if (nh[current].length === 0) {
          setEnded(true);
          setMessage(`Player ${current + 1} wins`);
          return;
        }
        applyEffect(card, current);
      } else {
        const color = COLORS[Math.floor(Math.random() * 4)];
        const nh = hands.map((h, i) => (i === current ? [...h, { color, value: "0", id: `bot-${Date.now()}` }] : h));
        setHands(nh);
        setCurrent(advance(current));
      }
    }, 700);
    return () => clearTimeout(t);
  }, [current, ended]);

  return (
    <GameShell
      title="Uno"
      subtitle="Color and number matching · reverse · skip · draw cards"
      onBack={onBack}
      badge="CARD GAME"
      right={
        <div className="flex gap-2">
          {[2,3,4].map((n) => (
            <button key={n} onClick={() => setPlayers(n)} className={`heritage-button !min-h-10 !px-3 ${players === n ? "ink" : "secondary"}`}>{n}P</button>
          ))}
        </div>
      }
      sidebar={
        <Panel title="Table">
          <div className="text-sm font-bold mb-3">{message}</div>
          {discard && (
            <div className={`h-24 border-2 border-[var(--ink)] ${BG[discard.color]} text-white grid place-items-center font-black text-lg mb-3`}>
              {discard.value}
            </div>
          )}
          <button onClick={deal} className="heritage-button secondary w-full"><RotateCcw size={14} /> New Game</button>
        </Panel>
      }
      tips={["Play a card matching color or value.", "Wild cards can be played anytime.", "Empty your hand to win."]}
    >
      <div className="space-y-3">
        {hands.map((hand, i) => (
          <div key={i} className={`heritage-card p-4 ${current === i ? "outline outline-2 outline-[var(--saffron)]" : ""}`}>
            <div className="flex items-center justify-between mb-2 text-sm font-bold">
              <span>Player {i + 1}{i === 0 ? " (You)" : ""}</span>
              <span className="text-xs text-[var(--ink-soft)]">{hand.length} cards</span>
            </div>
            {i === 0 ? (
              <div className="flex flex-wrap gap-2">
                {hand.map((c, idx) => (
                  <button key={c.id} onClick={() => playCard(idx)} className={`w-12 h-16 border-2 border-[var(--ink)] ${BG[c.color]} text-white text-[10px] font-black grid place-items-center ${canPlay(c) ? "shadow-[3px_3px_0_var(--ink)]" : "opacity-60"}`}>
                    {c.value}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[var(--ink-soft)]">Hidden bot hand</div>
            )}
          </div>
        ))}
        {current === 0 && !ended && (
          <button onClick={draw} className="heritage-button">Draw Card</button>
        )}
      </div>
    </GameShell>
  );
}
