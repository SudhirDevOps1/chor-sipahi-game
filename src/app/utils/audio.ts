let isMuted = false;

if (typeof window !== "undefined") {
  isMuted = localStorage.getItem("rmsc-muted") === "true";
}

export function setMuteState(muted: boolean) {
  isMuted = muted;
  if (typeof window !== "undefined") {
    localStorage.setItem("rmsc-muted", String(muted));
  }
}

export function getMuteState() {
  return isMuted;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

// 1. CLICK SOUND
export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

// 2. DICE ROLL SOUND (Rolling noise click)
export function playDiceRollSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.4;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, ctx.currentTime);

  // Simulate rolling pitch drops
  for (let i = 0; i < 4; i++) {
    const time = ctx.currentTime + i * 0.1;
    osc.frequency.setValueAtTime(100 + Math.random() * 200, time);
  }

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// 3. MOVE TOKEN SOUND (Slide/Jump pitch rise)
export function playMoveSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

// 4. WIN / SUCCESS ACCLAIM SOUND (Happy chord arpeggio)
export function playWinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const playNote = (freq: number, startDelay: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);

    gain.gain.setValueAtTime(0.08, ctx.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + startDelay + duration,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startDelay);
    osc.stop(ctx.currentTime + startDelay + duration);
  };

  // Play C Major Arpeggio: C4 -> E4 -> G4 -> C5
  playNote(261.63, 0.0, 0.2); // C4
  playNote(329.63, 0.1, 0.2); // E4
  playNote(392.0, 0.2, 0.2); // G4
  playNote(523.25, 0.3, 0.4); // C5
}
