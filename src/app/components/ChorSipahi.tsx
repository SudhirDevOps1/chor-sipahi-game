import { useEffect, useState } from "react";
import {
  Crown,
  Eye,
  RefreshCw,
  Shield,
  Swords,
  UserRoundSearch,
} from "lucide-react";
import GameShell, { Panel, Stat } from "../components/GameShell";

type Role = "rajah" | "mantri" | "chor" | "sipahi";
const ROLE_META: Record<
  Role,
  { label: string; points: string; desc: string; icon: React.ReactNode }
> = {
  rajah: {
    label: "Raja",
    points: "1000",
    desc: "Calls for the Mantri and anchors the round.",
    icon: <Crown size={22} />,
  },
  mantri: {
    label: "Mantri",
    points: "800 / 0",
    desc: "Must identify the Chor correctly.",
    icon: <UserRoundSearch size={22} />,
  },
  chor: {
    label: "Chor",
    points: "0 / 800",
    desc: "Stay hidden. Score if Mantri is wrong.",
    icon: <Eye size={22} />,
  },
  sipahi: {
    label: "Sipahi",
    points: "500",
    desc: "Remain quiet and collect fixed points.",
    icon: <Shield size={22} />,
  },
};
const ROLES: Role[] = ["rajah", "mantri", "chor", "sipahi"];
const NAMES = ["You", "Player 2", "Player 3", "Player 4"];

export default function ChorSipahi({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"dealing" | "show" | "guess" | "result">(
    "dealing",
  );
  const [roles, setRoles] = useState<Role[]>([]);
  const [playerRole, setPlayerRole] = useState<Role | null>(null);
  const [message, setMessage] = useState("Dealing private roles…");
  const [scores, setScores] = useState({
    rajah: 0,
    mantri: 0,
    chor: 0,
    sipahi: 0,
  });
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    deal();
  }, []);

  function deal() {
    setPhase("dealing");
    setCorrect(null);
    const shuffled = [...ROLES].sort(() => Math.random() - 0.5);
    setRoles(shuffled);
    setPlayerRole(shuffled[0]);
    setMessage("Roles dealt privately. Open your card.");
    setTimeout(() => setPhase("show"), 900);
  }

  function startGuess() {
    setPhase("guess");
    setMessage(
      playerRole === "mantri"
        ? "You are Mantri. Accuse the Chor."
        : "Waiting for Mantri's accusation…",
    );
    if (playerRole !== "mantri") {
      setTimeout(() => {
        const candidates = [0, 1, 2, 3].filter(
          (i) => roles[i] !== "mantri" && roles[i] !== "rajah",
        );
        accuse(candidates[Math.floor(Math.random() * candidates.length)]);
      }, 900);
    }
  }

  function accuse(idx: number) {
    const isCorrect = roles[idx] === "chor";
    setCorrect(isCorrect);
    if (isCorrect) {
      setScores((s) => ({
        ...s,
        rajah: s.rajah + 1,
        mantri: s.mantri + 1,
        sipahi: s.sipahi + 1,
      }));
      setMessage(`${NAMES[idx]} was the Chor. Mantri was correct.`);
    } else {
      setScores((s) => ({ ...s, chor: s.chor + 1 }));
      setMessage(
        `${NAMES[idx]} was not the Chor. Chor escapes with the points.`,
      );
    }
    setPhase("result");
  }

  return (
    <GameShell
      title="Chor Sipahi"
      subtitle="Raja · Mantri · Chor · Sipahi · classic Indian role deduction"
      onBack={onBack}
      badge="FLAGSHIP"
      right={
        <div className="text-xs font-black tracking-widest uppercase border-2 border-[var(--ink)] px-3 py-2 bg-[var(--paper)]">
          Round {round}
        </div>
      }
      sidebar={
        <Panel title="Score Ledger">
          <div className="grid grid-cols-2 gap-2">
            {(["rajah", "mantri", "chor", "sipahi"] as Role[]).map((role) => (
              <Stat
                key={role}
                label={ROLE_META[role].label}
                value={scores[role]}
              />
            ))}
          </div>
        </Panel>
      }
      tips={[
        "Four private roles are dealt every round.",
        "Raja calls Mantri. Mantri must identify the Chor.",
        "Correct guess rewards Mantri. Wrong guess rewards Chor.",
      ]}
    >
      <div className="heritage-card p-5 md:p-6">
        {phase === "dealing" && (
          <div className="text-center py-12">
            <Swords className="mx-auto text-[var(--saffron)]" size={36} />
            <div className="serif text-3xl mt-4">Dealing roles…</div>
            <p className="text-sm text-[var(--ink-soft)] mt-2">
              Private cards only. Never show your role.
            </p>
          </div>
        )}

        {phase !== "dealing" && playerRole && (
          <>
            <div className="flex items-center gap-4 border-2 border-[var(--ink)] bg-[var(--paper)] p-4">
              <div className="w-14 h-14 border-2 border-[var(--ink)] bg-[var(--saffron)] text-[var(--paper)] grid place-items-center">
                {ROLE_META[playerRole].icon}
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase text-[var(--ink-soft)]">
                  Your Role
                </div>
                <div className="serif text-2xl">
                  {ROLE_META[playerRole].label}
                </div>
                <div className="text-xs text-[var(--ink-soft)] mt-1">
                  {ROLE_META[playerRole].desc}
                </div>
                <div className="text-[11px] font-black mt-1">
                  Base points: {ROLE_META[playerRole].points}
                </div>
              </div>
            </div>

            {playerRole === "mantri" && phase === "show" && (
              <div className="mt-4 border-2 border-[var(--ink)] bg-[rgba(29,115,115,0.08)] p-4 text-sm">
                You know the Chor is{" "}
                <strong>{NAMES[roles.indexOf("chor")]}</strong>. Reveal yourself
                and accuse carefully.
              </div>
            )}

            {phase === "show" && (
              <button onClick={startGuess} className="heritage-button mt-5">
                Continue to Accusation
              </button>
            )}

            {phase === "guess" && playerRole === "mantri" && (
              <div className="mt-5">
                <div className="text-sm font-bold mb-3">Who is the Chor?</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {roles.map((role, i) =>
                    role === "mantri" ? null : (
                      <button
                        key={i}
                        onClick={() => accuse(i)}
                        className="heritage-button secondary !justify-start"
                      >
                        {NAMES[i]}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            {phase === "result" && (
              <div className="mt-5 border-2 border-[var(--ink)] bg-[var(--paper)] p-5 text-center animate-fade-up">
                <div className="serif text-2xl">
                  {correct ? "Mantri was right" : "Chor slipped away"}
                </div>
                <p className="text-sm text-[var(--ink-soft)] mt-2">{message}</p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {roles.map((role, i) => (
                    <div
                      key={i}
                      className="border border-[var(--ink)] bg-[var(--paper-deep)] p-3"
                    >
                      <div className="flex justify-center text-[var(--saffron-dark)]">
                        {ROLE_META[role].icon}
                      </div>
                      <div className="text-xs font-bold mt-2">{NAMES[i]}</div>
                      <div className="text-[11px] text-[var(--ink-soft)]">
                        {ROLE_META[role].label}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setRound((r) => r + 1);
                    deal();
                  }}
                  className="heritage-button mt-5"
                >
                  <RefreshCw size={14} /> Next Round
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </GameShell>
  );
}
