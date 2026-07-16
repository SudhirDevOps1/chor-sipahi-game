import { useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

const SYMBOLS = [
  { id: "heart", label: "Heart", mark: "H" },
  { id: "diamond", label: "Diamond", mark: "D" },
  { id: "club", label: "Club", mark: "C" },
  { id: "spade", label: "Spade", mark: "S" },
  { id: "crown", label: "Crown", mark: "K" },
  { id: "flag", label: "Flag", mark: "F" },
];

export default function JhandiMunda({ onBack }: { onBack: () => void }) {
  const [chips, setChips] = useState(500);
  const [bets, setBets] = useState<Record<string, number>>({
    heart: 0, diamond: 0, club: 0, spade: 0, crown: 0, flag: 0,
  });
  const [result, setResult] = useState<{ dice: number[]; counts: Record<string, number>; payout: number } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("Place bets on one or more symbols");

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  function bet(id: string, amount: number) {
    if (chips < amount || rolling) return;
    setBets((b) => ({ ...b, [id]: b[id] + amount }));
    setChips((c) => c - amount);
  }

  function roll() {
    if (!totalBet || rolling) return;
    setRolling(true);
    setMessage("Rolling six dice…");
    setTimeout(() => {
      const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6));
      const counts: Record<string, number> = { heart: 0, diamond: 0, club: 0, spade: 0, crown: 0, flag: 0 };
      dice.forEach((d) => (counts[SYMBOLS[d].id] += 1));
      let payout = 0;
      Object.entries(bets).forEach(([id, amount]) => {
        if (amount > 0 && counts[id] > 0) payout += amount * counts[id];
      });
      setResult({ dice, counts, payout });
      setChips((c) => c + payout);
      setBets({ heart: 0, diamond: 0, club: 0, spade: 0, crown: 0, flag: 0 });
      setMessage(`Payout +${payout}`);
      setRolling(false);
    }, 900);
  }

  function reset() {
    setChips(500);
    setBets({ heart: 0, diamond: 0, club: 0, spade: 0, crown: 0, flag: 0 });
    setResult(null);
    setMessage("Bank restored to 500");
  }

  return (
    <GameShell
      title="Jhandi Munda"
      subtitle="Traditional Indian dice-luck game · bet symbols · match the roll"
      onBack={onBack}
      badge="DICE LUCK"
      right={
        <div className="flex gap-2">
          <div className="border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-black">Bank {chips}</div>
          <button onClick={reset} className="heritage-button secondary !min-h-10"><RotateCcw size={14} /></button>
        </div>
      }
      sidebar={
        <Panel title="Round">
          <Stat label="Total Bet" value={totalBet} />
          <div className="mt-3 text-xs font-bold text-[var(--ink-soft)]">{message}</div>
          <button onClick={roll} disabled={!totalBet || rolling} className="heritage-button w-full mt-4">
            <Dices size={14} /> {rolling ? "Rolling…" : "Roll Dice"}
          </button>
        </Panel>
      }
      tips={["Bet any amount on one or more symbols.", "Six dice are rolled together.", "If a symbol appears N times, that bet pays N×."]}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYMBOLS.map((s) => (
          <div key={s.id} className={`heritage-card p-4 ${bets[s.id] > 0 ? "outline outline-2 outline-[var(--saffron)]" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="serif text-xl">{s.label}</div>
                <div className="text-xs text-[var(--ink-soft)] font-bold">Mark {s.mark}</div>
              </div>
              <div className="w-10 h-10 border-2 border-[var(--ink)] bg-[var(--paper-deep)] grid place-items-center font-black">
                {s.mark}
              </div>
            </div>
            <div className="mt-3 text-2xl font-black">{bets[s.id]}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => bet(s.id, 10)} className="heritage-button secondary">+10</button>
              <button onClick={() => bet(s.id, 50)} className="heritage-button secondary">+50</button>
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div className="heritage-card p-5 mt-4">
          <div className="text-[10px] font-black tracking-widest uppercase text-[var(--ink-soft)] mb-3">Result</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {result.dice.map((d, i) => (
              <div key={i} className="w-12 h-12 border-2 border-[var(--ink)] bg-[var(--paper)] grid place-items-center font-black">
                {SYMBOLS[d].mark}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs font-bold">
            {SYMBOLS.map((s) => (
              <div key={s.id} className={`border border-[var(--ink)] p-2 text-center ${result.counts[s.id] ? "bg-[#d8f3dc]" : "bg-[var(--paper)]"}`}>
                {s.mark} × {result.counts[s.id]}
              </div>
            ))}
          </div>
          <div className="mt-3 font-black">Payout +{result.payout}</div>
        </div>
      )}
    </GameShell>
  );
}
