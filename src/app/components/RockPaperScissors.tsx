import { useState } from "react";
import { Flame, Hand, RotateCcw, Scissors, Trophy } from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw";

const CHOICES: { id: Choice; label: string; icon: React.ReactNode }[] = [
  { id: "rock", label: "Rock", icon: <span className="text-2xl">✊</span> },
  { id: "paper", label: "Paper", icon: <Hand size={22} /> },
  { id: "scissors", label: "Scissors", icon: <Scissors size={22} /> },
];
const BEATS: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export default function RockPaperScissors({ onBack }: { onBack: () => void }) {
  const [player, setPlayer] = useState<Choice | null>(null);
  const [bot, setBot] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [score, setScore] = useState({ w: 0, l: 0, d: 0, streak: 0, best: 0 });
  const [animating, setAnimating] = useState(false);
  const [mode, setMode] = useState<"first3" | "endless">("first3");
  const [history, setHistory] = useState<{ p: Choice; b: Choice; r: Result }[]>(
    [],
  );

  const over = mode === "first3" && (score.w >= 3 || score.l >= 3);

  function play(choice: Choice) {
    if (animating || over) return;
    setAnimating(true);
    setPlayer(null);
    setBot(null);
    setResult(null);

    let botChoice = (["rock", "paper", "scissors"] as Choice[])[
      Math.floor(Math.random() * 3)
    ];
    if (history.length >= 3) {
      const freq = { rock: 0, paper: 0, scissors: 0 } as Record<Choice, number>;
      history.slice(0, 5).forEach((h) => (freq[h.p] += 1));
      const most = Object.entries(freq).sort(
        (a, b) => b[1] - a[1],
      )[0][0] as Choice;
      if (Math.random() > 0.4)
        botChoice =
          most === "rock" ? "paper" : most === "paper" ? "scissors" : "rock";
    }

    let tick = 0;
    const interval = setInterval(() => {
      setPlayer(CHOICES[Math.floor(Math.random() * 3)].id);
      setBot(CHOICES[Math.floor(Math.random() * 3)].id);
      tick += 1;
      if (tick > 10) {
        clearInterval(interval);
        setPlayer(choice);
        setBot(botChoice);
        const r: Result =
          choice === botChoice
            ? "draw"
            : BEATS[choice] === botChoice
              ? "win"
              : "lose";
        setResult(r);
        setHistory((h) => [{ p: choice, b: botChoice, r }, ...h].slice(0, 10));
        setScore((s) => {
          const next = { ...s };
          if (r === "win") {
            next.w += 1;
            next.streak += 1;
            next.best = Math.max(next.best, next.streak);
          } else if (r === "lose") {
            next.l += 1;
            next.streak = 0;
          } else next.d += 1;
          return next;
        });
        setAnimating(false);
      }
    }, 70);
  }

  function reset() {
    setScore({ w: 0, l: 0, d: 0, streak: 0, best: score.best });
    setHistory([]);
    setPlayer(null);
    setBot(null);
    setResult(null);
  }

  return (
    <GameShell
      title="Rock Paper Scissors"
      subtitle="Quick choice blitz · pattern-aware bot · First to 3 or Endless"
      onBack={onBack}
      badge="QUICK PLAY"
      right={
        <div className="flex gap-2">
          <button
            onClick={() => setMode("first3")}
            className={`heritage-button !min-h-10 ${mode === "first3" ? "ink" : "secondary"}`}
          >
            First to 3
          </button>
          <button
            onClick={() => setMode("endless")}
            className={`heritage-button !min-h-10 ${mode === "endless" ? "ink" : "secondary"}`}
          >
            Endless
          </button>
        </div>
      }
      sidebar={
        <>
          <Panel title="Live Stats">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Wins" value={score.w} />
              <Stat label="Draws" value={score.d} />
              <Stat label="Losses" value={score.l} />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold">
              <span className="inline-flex items-center gap-1">
                <Flame size={14} className="text-[var(--saffron)]" /> Streak{" "}
                {score.streak}
              </span>
              <span className="inline-flex items-center gap-1">
                <Trophy size={14} className="text-[var(--gold)]" /> Best{" "}
                {score.best}
              </span>
            </div>
            <button
              onClick={reset}
              className="heritage-button secondary w-full mt-4"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </Panel>
          <Panel title="Recent Battles">
            <div className="space-y-2 max-h-[220px] overflow-auto scrollbar-thin">
              {history.length === 0 && (
                <div className="text-xs text-[var(--ink-soft)] py-6 text-center">
                  No rounds yet
                </div>
              )}
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-bold"
                >
                  <span>
                    {h.p} vs {h.b}
                  </span>
                  <span
                    className={
                      h.r === "win"
                        ? "text-[var(--teal)]"
                        : h.r === "lose"
                          ? "text-[var(--saffron-dark)]"
                          : ""
                    }
                  >
                    {h.r.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      }
      tips={[
        "Rock beats Scissors, Scissors beats Paper, Paper beats Rock.",
        "The bot tries to counter your recent favorites.",
        "First-to-3 ends when either side reaches three wins.",
      ]}
    >
      <div className="heritage-card p-4 md:p-6 relative">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[
            ["You", player],
            ["Bot", bot],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="border-2 border-[var(--ink)] bg-[var(--paper)] p-4 text-center"
            >
              <div className="text-[10px] font-black tracking-widest uppercase text-[var(--ink-soft)]">
                {label as string}
              </div>
              <div
                className={`mt-3 h-20 grid place-items-center text-4xl ${animating ? "animate-wiggle" : ""}`}
              >
                {value ? CHOICES.find((c) => c.id === value)?.icon : "?"}
              </div>
              <div className="mt-2 text-sm font-bold capitalize">
                {(value as string) || "—"}
              </div>
            </div>
          ))}
        </div>

        <div className="my-5 text-center">
          {!result && !animating && (
            <div className="text-sm font-bold text-[var(--ink-soft)]">
              Choose your move
            </div>
          )}
          {animating && (
            <div className="text-sm font-bold text-[var(--saffron-dark)]">
              Shuffling…
            </div>
          )}
          {result && (
            <div
              className={`inline-flex px-4 py-2 border-2 border-[var(--ink)] font-black text-sm ${
                result === "win"
                  ? "bg-[#d8f3dc]"
                  : result === "lose"
                    ? "bg-[#ffe3e3]"
                    : "bg-[var(--paper-deep)]"
              }`}
            >
              {result === "win"
                ? "You Win"
                : result === "lose"
                  ? "You Lose"
                  : "Draw"}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CHOICES.map((c) => (
            <button
              key={c.id}
              disabled={animating || over}
              onClick={() => play(c.id)}
              className="heritage-button secondary !min-h-[88px] !flex-col"
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {over && (
          <div className="absolute inset-0 bg-[rgba(247,240,223,0.94)] border-2 border-[var(--ink)] flex flex-col items-center justify-center gap-3">
            <div className="serif text-3xl font-bold">
              {score.w >= 3 ? "Victory" : "Bot Wins"}
            </div>
            <div className="text-sm text-[var(--ink-soft)]">
              {score.w} – {score.l}
            </div>
            <button onClick={reset} className="heritage-button">
              Rematch
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
