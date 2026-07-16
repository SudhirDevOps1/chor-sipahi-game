import { useMemo, useState } from "react";
import { Link2, RotateCcw } from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

export default function WordLink({ onBack }: { onBack: () => void }) {
  const [players, setPlayers] = useState(2);
  const [current, setCurrent] = useState(0);
  const [used, setUsed] = useState<string[]>([]);
  const [last, setLast] = useState("");
  const [input, setInput] = useState("");
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [message, setMessage] = useState("Player 1 starts with any word");

  const hint = useMemo(() => {
    if (!last) return "Any valid word starts the chain.";
    return `Next word must start with “${last[last.length - 1]}”`;
  }, [last]);

  function submit() {
    const word = input.trim().toLowerCase();
    if (word.length < 2) {
      setMessage("Word is too short");
      return;
    }
    if (used.includes(word)) {
      setMessage("Word already used");
      return;
    }
    if (last && word[0] !== last[last.length - 1]) {
      setMessage(`Must start with “${last[last.length - 1]}”`);
      return;
    }
    setUsed((u) => [word, ...u]);
    setLast(word);
    setInput("");
    setScores((s) => {
      const n = [...s];
      n[current] += 1;
      return n;
    });
    setMessage(`Accepted “${word}”. Player ${((current + 1) % players) + 1} next.`);
    setCurrent((c) => (c + 1) % players);
  }

  function reset() {
    setUsed([]);
    setLast("");
    setInput("");
    setCurrent(0);
    setScores([0, 0, 0, 0]);
    setMessage("Player 1 starts with any word");
  }

  return (
    <GameShell
      title="Word Link"
      subtitle="Word association chain · last letter connects the next word"
      onBack={onBack}
      badge="WORD PUZZLE"
      right={
        <div className="flex gap-2">
          {[2,3,4].map((n) => (
            <button key={n} onClick={() => setPlayers(n)} className={`heritage-button !min-h-10 !px-3 ${players === n ? "ink" : "secondary"}`}>{n}P</button>
          ))}
        </div>
      }
      sidebar={
        <Panel title="Scoreboard">
          {Array.from({ length: players }).map((_, i) => (
            <div key={i} className="mb-2">
              <Stat label={`Player ${i + 1}`} value={scores[i]} active={current === i} />
            </div>
          ))}
          <button onClick={reset} className="heritage-button secondary w-full mt-2"><RotateCcw size={14} /> Reset</button>
        </Panel>
      }
      tips={["Each new word must begin with the previous word’s last letter.", "No repeats allowed.", "Keep the chain alive as long as possible."]}
    >
      <div className="heritage-card p-5">
        <div className="border-2 border-[var(--ink)] bg-[var(--paper)] p-5 text-center mb-4">
          <div className="text-[10px] font-black tracking-widest uppercase text-[var(--ink-soft)]">Current Word</div>
          <div className="serif text-3xl md:text-4xl mt-2">{last || "—"}</div>
          <div className="text-xs text-[var(--ink-soft)] mt-2">{hint}</div>
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type a word..."
            className="heritage-input !pl-4 flex-1"
          />
          <button onClick={submit} className="heritage-button"><Link2 size={14} /> Link</button>
        </div>
        <div className="mt-3 text-xs font-bold text-[var(--ink-soft)]">{message}</div>
        <div className="mt-5 flex flex-wrap gap-2">
          {used.map((w, i) => (
            <span key={i} className="px-3 py-1.5 border border-[var(--ink)] bg-[var(--paper-deep)] text-sm font-bold">
              {w}
            </span>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
