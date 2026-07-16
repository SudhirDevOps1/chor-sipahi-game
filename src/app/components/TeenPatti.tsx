import { useEffect, useState } from "react";
import { RotateCcw, Eye } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

type Suit = "♠" | "♥" | "♣" | "♦";
type Card = { suit: Suit; rank: number };
const SUITS: Suit[] = ["♠", "♥", "♣", "♦"];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const DISP: Record<number, string> = { 11: "J", 12: "Q", 13: "K", 14: "A" };

function shuffle(): Card[] {
  return Array.from({ length: 52 }, (_, i) => ({
    suit: SUITS[i % 4],
    rank: RANKS[Math.floor(i / 4)],
  })).sort(() => Math.random() - 0.5);
}

function scoreHand(cards: Card[]) {
  const s = [...cards].sort((a, b) => b.rank - a.rank);
  const sameSuit = cards.every((c) => c.suit === cards[0].suit);
  const consec = s[0].rank - s[2].rank === 2 && s[0].rank - s[1].rank === 1;
  if (s[0].rank === s[1].rank && s[1].rank === s[2].rank)
    return { rank: "Trail", score: 500 + s[0].rank };
  if (sameSuit && consec)
    return { rank: "Pure Sequence", score: 400 + s[0].rank };
  if (consec) return { rank: "Sequence", score: 300 + s[0].rank };
  if (sameSuit) return { rank: "Color", score: 200 + s[0].rank };
  if (s[0].rank === s[1].rank || s[1].rank === s[2].rank)
    return { rank: "Pair", score: 100 + s[1].rank };
  return { rank: "High Card", score: s[0].rank };
}

export default function TeenPatti({ onBack }: { onBack: () => void }) {
  const [players, setPlayers] = useState(3);
  const [hands, setHands] = useState<Card[][]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [message, setMessage] = useState("Reveal hands to compare rankings");
  const [scores, setScores] = useState<number[]>(Array(6).fill(0));

  function deal() {
    const deck = shuffle();
    const next = Array.from({ length: players }, (_, i) =>
      deck.slice(i * 3, i * 3 + 3),
    );
    setHands(next);
    setRevealed(Array(players).fill(false));
    setMessage("Tap a hand or show all");
  }

  useEffect(() => {
    deal();
  }, [players]);

  function revealAll() {
    setRevealed(Array(players).fill(true));
    const ranks = hands.map(scoreHand);
    const best = Math.max(...ranks.map((r) => r.score));
    const winners = ranks
      .map((r, i) => (r.score === best ? i : -1))
      .filter((i) => i >= 0);
    setMessage(
      `Winner: Player ${winners.map((i) => i + 1).join(", ")} · ${ranks[winners[0]].rank}`,
    );
    setScores((s) => {
      const n = [...s];
      winners.forEach((i) => (n[i] += 1));
      return n;
    });
  }

  return (
    <GameShell
      title="Teen Patti"
      subtitle="Indian poker · Trail · Sequence · Color · Pair · High card"
      onBack={onBack}
      badge="CARD GAME"
      right={
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setPlayers(n)}
              className={`heritage-button !min-h-10 !px-3 ${players === n ? "ink" : "secondary"}`}
            >
              {n}P
            </button>
          ))}
        </div>
      }
      sidebar={
        <Panel title="Round Controls">
          <div className="text-sm font-bold mb-3">{message}</div>
          <button onClick={revealAll} className="heritage-button w-full mb-2">
            <Eye size={14} /> Show All
          </button>
          <button onClick={deal} className="heritage-button secondary w-full">
            <RotateCcw size={14} /> New Deal
          </button>
        </Panel>
      }
      tips={[
        "Trail beats pure sequence, sequence, color, pair, then high card.",
        "Tap any player card stack to reveal it.",
        "Best hand wins the round.",
      ]}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hands.map((cards, i) => {
          const open = revealed[i];
          const rank = open ? scoreHand(cards).rank : "Hidden";
          return (
            <button
              key={i}
              onClick={() =>
                setRevealed((r) => {
                  const n = [...r];
                  n[i] = true;
                  return n;
                })
              }
              className="heritage-card p-4 text-left hover:-translate-y-0.5 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-black">Player {i + 1}</div>
                <div className="text-xs font-bold text-[var(--ink-soft)]">
                  Wins {scores[i]}
                </div>
              </div>
              <div className="flex gap-2">
                {cards.map((c, j) => (
                  <div
                    key={j}
                    className={`w-14 h-20 border-2 border-[var(--ink)] grid place-items-center font-black ${open ? "bg-white" : "bg-[var(--ink)] text-[var(--paper)]"} ${open && (c.suit === "♥" || c.suit === "♦") ? "text-red-600" : ""}`}
                  >
                    {open ? `${DISP[c.rank] || c.rank}${c.suit}` : "?"}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs font-bold text-[var(--ink-soft)]">
                {rank}
              </div>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
