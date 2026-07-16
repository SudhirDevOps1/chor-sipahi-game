import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import GameShell, { Panel } from "../components/GameShell";

type Suit = "♠" | "♥" | "♣" | "♦";
type Card = { suit: Suit; rank: number };
const SUITS: Suit[] = ["♠", "♥", "♣", "♦"];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const DISP: Record<number, string> = { 11: "J", 12: "Q", 13: "K", 14: "A" };

function deck() {
  const d: Card[] = [];
  SUITS.forEach((s) => RANKS.forEach((r) => d.push({ suit: s, rank: r })));
  return d.sort(() => Math.random() - 0.5);
}

export default function CallBreak({ onBack }: { onBack: () => void }) {
  const [hands, setHands] = useState<Card[][]>([]);
  const [bids, setBids] = useState([0, 0, 0, 0]);
  const [tricks, setTricks] = useState([0, 0, 0, 0]);
  const [phase, setPhase] = useState<"bid" | "play" | "result">("bid");
  const [bidIdx, setBidIdx] = useState(0);
  const [current, setCurrent] = useState(0);
  const [lead, setLead] = useState<Suit | null>(null);
  const [played, setPlayed] = useState<(Card | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [message, setMessage] = useState("Player 1, place your bid");
  const [scores, setScores] = useState([0, 0, 0, 0]);

  function deal() {
    const d = deck();
    const h: Card[][] = [[], [], [], []];
    d.forEach((c, i) => h[i % 4].push(c));
    h.forEach((hand) =>
      hand.sort((a, b) =>
        a.suit === b.suit ? b.rank - a.rank : a.suit.localeCompare(b.suit),
      ),
    );
    setHands(h);
    setBids([0, 0, 0, 0]);
    setTricks([0, 0, 0, 0]);
    setPhase("bid");
    setBidIdx(0);
    setCurrent(0);
    setLead(null);
    setPlayed([null, null, null, null]);
    setMessage("Player 1, place your bid (0–8)");
  }

  useEffect(() => {
    deal();
  }, []);

  function placeBid(v: number) {
    const nb = [...bids];
    nb[bidIdx] = v;
    setBids(nb);
    if (bidIdx < 3) {
      setBidIdx((i) => i + 1);
      setMessage(`Player ${bidIdx + 2}, place your bid`);
    } else {
      setPhase("play");
      setMessage("Play starts. Follow suit if you can. Spades are trump.");
    }
  }

  function playCard(player: number, idx: number) {
    if (phase !== "play" || player !== current) return;
    const card = hands[player][idx];
    if (!card) return;
    if (
      lead &&
      card.suit !== lead &&
      hands[player].some((c) => c.suit === lead)
    )
      return;
    const nh = hands.map((h) => [...h]);
    nh[player].splice(idx, 1);
    setHands(nh);
    const np = [...played];
    np[player] = card;
    setPlayed(np);
    const nextLead = lead ?? card.suit;
    if (!lead) setLead(card.suit);

    if (np.every(Boolean)) {
      let winner = 0;
      let best = np[0]!;
      np.forEach((c, i) => {
        if (!c) return;
        const beats =
          (c.suit === "♠" && best.suit !== "♠") ||
          (c.suit === best.suit && c.rank > best.rank) ||
          (c.suit === nextLead && best.suit !== nextLead && best.suit !== "♠");
        if (beats) {
          best = c;
          winner = i;
        }
      });
      const nt = [...tricks];
      nt[winner] += 1;
      setTricks(nt);
      setMessage(`Player ${winner + 1} wins the trick`);
      setPlayed([null, null, null, null]);
      setLead(null);
      setCurrent(winner);
      if (nh.every((h) => h.length === 0)) {
        setPhase("result");
        setScores((s) =>
          s.map((val, i) => val + (nt[i] >= bids[i] ? nt[i] : -bids[i])),
        );
        setMessage("Round complete");
      }
      return;
    }

    const next = (player + 1) % 4;
    setCurrent(next);
    if (next !== 0) {
      setTimeout(() => {
        const hand = nh[next];
        let pick = 0;
        if (nextLead) {
          const same = hand
            .map((c, i) => (c.suit === nextLead ? i : -1))
            .filter((i) => i >= 0);
          if (same.length) pick = same[0];
        }
        playCard(next, pick);
      }, 450);
    }
  }

  return (
    <GameShell
      title="Call Break"
      subtitle="Indian trick-taking · bid tricks · spades are trump"
      onBack={onBack}
      badge="CARD GAME"
      right={
        <button onClick={deal} className="heritage-button !min-h-10">
          <RotateCcw size={14} /> New Round
        </button>
      }
      sidebar={
        <Panel title="Bids & Tricks">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 mb-2 text-xs font-bold"
            >
              <span>
                Player {i + 1}
                {i === 0 ? " (You)" : ""}
              </span>
              <span>
                Bid {bids[i]} · Won {tricks[i]} · Score {scores[i]}
              </span>
            </div>
          ))}
          <div className="text-xs text-[var(--ink-soft)] font-bold mt-2">
            {message}
          </div>
        </Panel>
      }
      tips={[
        "Bid the number of tricks you expect to win.",
        "You must follow the lead suit when possible.",
        "Spades beat every other suit.",
      ]}
    >
      <div className="space-y-3">
        {phase === "bid" && (
          <div className="heritage-card p-4">
            <div className="text-sm font-bold mb-3">{message}</div>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => placeBid(i)}
                  className="heritage-button secondary"
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {hands.map((hand, pi) => (
          <div
            key={pi}
            className={`heritage-card p-4 ${current === pi && phase === "play" ? "outline outline-2 outline-[var(--saffron)]" : ""}`}
          >
            <div className="flex items-center justify-between mb-2 text-sm font-bold">
              <span>
                Player {pi + 1}
                {pi === 0 ? " (You)" : ""}
              </span>
              <span className="text-xs text-[var(--ink-soft)]">
                {played[pi]
                  ? `Played ${DISP[played[pi]!.rank] || played[pi]!.rank}${played[pi]!.suit}`
                  : `${hand.length} cards`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hand.map((c, i) => (
                <button
                  key={`${c.suit}-${c.rank}-${i}`}
                  onClick={() => playCard(pi, i)}
                  disabled={phase !== "play" || pi !== current || pi !== 0}
                  className={`px-2 py-1 border-2 border-[var(--ink)] text-xs font-black bg-white ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : ""}`}
                >
                  {(DISP[c.rank] || c.rank) + c.suit}
                </button>
              ))}
            </div>
          </div>
        ))}

        {phase === "result" && (
          <div className="heritage-card p-5 text-center">
            <div className="serif text-2xl font-bold">Round Over</div>
            <button onClick={deal} className="heritage-button mt-4">
              Next Round
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
