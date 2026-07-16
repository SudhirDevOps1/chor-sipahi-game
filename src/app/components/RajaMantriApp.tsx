"use client";

import { AlertCircle, ArrowRight, Check, ChevronRight, Copy, Crown, Eye, LockKeyhole, LogOut, Play, Send, ShieldCheck, Sparkles, Swords, Users, UserRoundCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { readJson } from "@/lib/http";
import { ROLE_DETAILS } from "@/lib/raja-game";
import type { ChatItem, GameRole, RajaGameState, RoomSummary } from "@/shared/types";
import { ThemeToggle } from "./ThemeToggle";
import { MultiGamePanel } from "./MultiGamePanel";
import { PrismAnalyticsWidget, FormForgeContactForm } from "./AnalyticsAndFeedback";




const AVATARS = ["✦", "◆", "●", "▲"];

type ApiError = { error?: string };
type RoomResponse = { roomCode: string; playerId: string };

function createSeed() { return `${crypto.randomUUID()}-${Math.random().toString(36).slice(2)}`; }

export function RajaMantriApp() {
  const [seed, setSeed, seedReady] = useLocalStorage("rmsc-device-seed", "");
  const [dark, setDark] = useLocalStorage("rmsc-dark-mode", true);

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  const [roomCode, setRoomCode] = useLocalStorage<string | null>("rmsc-room-code", null);
  const [playerId, setPlayerId] = useLocalStorage<string | null>("rmsc-player-id", null);
  const [displayName, setDisplayName] = useLocalStorage("rmsc-display-name", "");
  const [state, setState] = useState<RajaGameState | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [createName, setCreateName] = useState("");
  const [rounds, setRounds] = useState<3 | 5 | 10>(5);
  const [chatDraft, setChatDraft] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("chor_sipahi");

  const headers = useCallback((json = false): HeadersInit => ({ ...(json ? { "Content-Type": "application/json" } : {}), "x-device-seed": seed, ...(playerId ? { "x-player-id": playerId } : {}) }), [playerId, seed]);
  const ready = seedReady && Boolean(seed);

  const request = useCallback(async <T,>(url: string, init?: RequestInit) => {
    const response = await fetch(url, init);
    const data = await readJson<T & ApiError>(response);
    if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
    return data;
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      const data = await request<{ rooms: RoomSummary[] }>("/api/rooms", { cache: "no-store" });
      setRooms(data.rooms);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load open rooms"); }
  }, [request]);

  const refreshState = useCallback(async () => {
    if (!roomCode || !playerId || !seed) return;
    try {
      const data = await request<RajaGameState>(`/api/rooms/${roomCode}/state`, { cache: "no-store", headers: headers() });
      setState(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reconnect to the room";
      setNotice(message);
      if (message === "Room not found") { setRoomCode(null); setPlayerId(null); setState(null); }
    }
  }, [headers, playerId, request, roomCode, seed, setPlayerId, setRoomCode]);

  useEffect(() => { if (seedReady && !seed) setSeed(createSeed()); }, [seed, seedReady, setSeed]);
  useEffect(() => { void loadRooms(); }, [loadRooms]);
  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get("room");
    if (invite && /^\d{6}$/.test(invite)) setJoinCode(invite);
  }, []);
  useEffect(() => {
    void refreshState();
    if (!roomCode || !playerId || !seed) return;
    const poller = window.setInterval(() => void refreshState(), 1800);
    return () => window.clearInterval(poller);
  }, [playerId, refreshState, roomCode, seed]);

  async function createRoom(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await request<RoomResponse>("/api/rooms", { method: "POST", headers: headers(true), body: JSON.stringify({ playerName: createName, roundsToPlay: rounds, isPrivate: true, gameType: selectedGame }) });

      setDisplayName(createName.trim()); setRoomCode(result.roomCode); setPlayerId(result.playerId); setNotice(`Room ${result.roomCode} is ready. Invite three friends.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not create room"); } finally { setBusy(false); }
  }

  async function joinRoom(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const code = joinCode.trim();
      const result = await request<RoomResponse>(`/api/rooms/${code}/join`, { method: "POST", headers: headers(true), body: JSON.stringify({ playerName: joinName }) });
      setDisplayName(joinName.trim()); setRoomCode(result.roomCode); setPlayerId(result.playerId); setNotice(`You joined room ${result.roomCode}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not join room"); } finally { setBusy(false); }
  }

  async function gameAction(payload: Record<string, string>) {
    if (!roomCode || !playerId) return;
    setBusy(true);
    try {
      await request(`/api/rooms/${roomCode}/action`, { method: "POST", headers: headers(true), body: JSON.stringify({ ...payload, playerId }) });
      await refreshState();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Action could not be completed"); } finally { setBusy(false); }
  }

  async function startGame() {
    if (!roomCode) return;
    setBusy(true);
    try {
      await request(`/api/rooms/${roomCode}/start`, { method: "POST", headers: headers() });
      await refreshState();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not start game"); } finally { setBusy(false); }
  }

  async function sendChat(event: React.FormEvent) {
    event.preventDefault();
    if (!roomCode || !playerId || !chatDraft.trim()) return;
    try {
      await request(`/api/rooms/${roomCode}/chat`, { method: "POST", headers: headers(true), body: JSON.stringify({ playerId, message: chatDraft.trim(), scope: "all" }) });
      setChatDraft(""); await refreshState();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Message could not be sent"); }
  }

  async function copyInvite() {
    if (!roomCode) return;
    try { await navigator.clipboard.writeText(`${window.location.origin}?room=${roomCode}`); setNotice("Invite link copied — send it to three friends."); }
    catch { setNotice(`Share this code: ${roomCode}`); }
  }

  function leaveRoom() { setRoomCode(null); setPlayerId(null); setState(null); setNotice(null); void loadRooms(); }

  return <div className="heritage-app">
    <header className="heritage-nav">
      <a className="heritage-brand" href="/">
        <span className="brand-seal">R</span>
        <span><strong>RAJA MANTRI</strong><small>CHOR SIPAHI</small></span>
      </a>
      <div className="nav-center"><span>4 PLAYER CLASSIC</span><i /> <span>PRIVATE ROOMS</span><i /> <span>NO ACCOUNTS</span></div>
      <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} />
        <a className="rules-link" href="#rules"><ShieldCheck size={15} /> How to play</a>
      </div>
    </header>

    {state && roomCode && playerId ? <GameRoom state={state} playerId={playerId} busy={busy} onAction={gameAction} onStart={startGame} onInvite={copyInvite} onLeave={leaveRoom} onChat={sendChat} chatDraft={chatDraft} setChatDraft={setChatDraft} /> : <Landing selectedGame={selectedGame} setSelectedGame={setSelectedGame} createName={createName} setCreateName={setCreateName} joinName={joinName} setJoinName={setJoinName} joinCode={joinCode} setJoinCode={setJoinCode} rounds={rounds} setRounds={setRounds} rooms={rooms} busy={busy || !ready} onCreate={createRoom} onJoin={joinRoom} onRoomPick={setJoinCode} onRefresh={loadRooms} />}

    <section className="rules-section" id="rules"><p className="section-kicker">THE CLASSIC RULES</p><h2>Four slips. One sharp guess.</h2><div className="rules-grid"><Rule n="01" icon="👑" title="Roles are dealt" text="Exactly four players receive a secret Raja, Mantri, Chor or Sipahi card." /><Rule n="02" icon="🗡️" title="Mantri steps forward" text="Raja calls for the Mantri. The Mantri reveals and prepares to identify Chor." /><Rule n="03" icon="🕵️" title="Make the guess" text="The Mantri picks one of the two hidden players as Chor. Sipahi stays silent." /><Rule n="04" icon="✦" title="Count the points" text="Raja gets 1000, Sipahi 500; Mantri gets 800 on a correct guess, otherwise Chor takes 800." /></div></section>
    <footer className="heritage-footer">
      <div className="footer-content">
        <p>© 2026 <strong>SudhirDevOps1</strong>. All Rights Reserved.</p>

        <div className="footer-links">
          <a href="https://github.com/SudhirDevOps1/chor-sipahi-game" target="_blank" rel="noopener noreferrer" className="footer-repo-link">
            GitHub Repository
          </a>
          <span>·</span>
          <span>Open Source (MIT)</span>
        </div>
      </div>
    </footer>

    {notice && <div className="notice" role="status"><AlertCircle size={16} /><span>{notice}</span><button type="button" onClick={() => setNotice(null)}>×</button></div>}
  </div>;
}

function Landing({ selectedGame, setSelectedGame, createName, setCreateName, joinName, setJoinName, joinCode, setJoinCode, rounds, setRounds, rooms, busy, onCreate, onJoin, onRoomPick, onRefresh }: { selectedGame: string; setSelectedGame: (value: string) => void; createName: string; setCreateName: (value: string) => void; joinName: string; setJoinName: (value: string) => void; joinCode: string; setJoinCode: (value: string) => void; rounds: 3 | 5 | 10; setRounds: (value: 3 | 5 | 10) => void; rooms: RoomSummary[]; busy: boolean; onCreate: (event: React.FormEvent) => void; onJoin: (event: React.FormEvent) => void; onRoomPick: (code: string) => void; onRefresh: () => void }) {
  return <><main className="landing"><section className="intro"><p className="eyebrow"><Sparkles size={14} /> MULTI-GAME PARTY HUB</p><h1>Play classic games.<br /><em>Bluff & Win.</em></h1><p className="intro-copy">Select from 5 classic board, card and role-deduction games. Instant rooms. No downloads. No account. Fast & Secure.</p><div className="role-stamps"><span>👑 Raja Mantri</span><span>🎲 Ludo</span><span>❌ Tic-Tac-Toe</span><span>🔴 Connect 4</span></div></section><section className="paper-stack"><div className="paper-note paper-back" /><div className="paper-note paper-main"><p className="eyebrow">ONE LOBBY · ZERO SETUP</p><h3>Choose Your Game</h3><div className="paper-roles"><span>👑</span><span>🎲</span><span>❌</span><span>🔴</span></div><p>Play with 2, 3 or 4 players instantly.</p></div></section></main><section className="lobby-area"><div className="lobby-card"><div className="lobby-card-heading"><span className="card-number">01</span><div><p className="eyebrow">OPEN A TABLE</p><h2>Create a private room</h2></div></div><form onSubmit={onCreate} className="lobby-form"><label>Your name<input value={createName} onChange={(event) => setCreateName(event.target.value)} maxLength={24} placeholder="e.g. Aanya" required /></label><label>Select Game<select value={selectedGame} onChange={(event) => setSelectedGame(event.target.value)}><option value="chor_sipahi">👑 Raja Mantri Chor Sipahi (4 Players)</option><option value="ludo">🎲 Rapid Ludo (2-4 Players)</option><option value="tic_tac_toe">❌⭕ Tic-Tac-Toe (2 Players)</option><option value="rps">✊✌️ Rock Paper Scissors (2 Players)</option><option value="connect_four">🔴 Connect Four (2 Players)</option></select></label><label>How many rounds?<select value={rounds} onChange={(event) => setRounds(Number(event.target.value) as 3 | 5 | 10)}><option value={3}>3 quick rounds</option><option value={5}>5 classic rounds</option><option value={10}>10 long-game rounds</option></select></label><button className="heritage-button" disabled={busy}>Create private room <ArrowRight size={17} /></button></form></div><div className="lobby-card join-card"><div className="lobby-card-heading"><span className="card-number">02</span><div><p className="eyebrow">HAVE A CODE?</p><h2>Join your friends</h2></div></div><form onSubmit={onJoin} className="lobby-form"><label>Room code<input value={joinCode} onChange={(event) => setJoinCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6 digits" required /></label><label>Your name<input value={joinName} onChange={(event) => setJoinName(event.target.value)} maxLength={24} placeholder="e.g. Kabir" required /></label><button className="outline-button" disabled={busy || joinCode.length !== 6}>Join room <ChevronRight size={17} /></button></form></div><div className="open-rooms"><div className="open-rooms-head"><div><p className="eyebrow">OPTIONAL</p><h2>Open tables</h2></div><button type="button" onClick={onRefresh} aria-label="Refresh public rooms">↻</button></div>{rooms.length ? <div className="room-mini-list">{rooms.map((room) => <button type="button" key={room.roomCode} onClick={() => onRoomPick(room.roomCode)}><strong>{room.roomCode}</strong><span>{room.playersCount}/{room.maxPlayers} players · {room.roundsToPlay} rounds</span><ChevronRight size={15} /></button>)}</div> : <div className="empty-rooms"><Users size={22} /><strong>No public table is waiting</strong><span>Create a private room and share its code instead.</span></div>}</div></section><section className="widgets-area" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "2rem", padding: "0 32px 60px", maxWidth: "1130px", margin: "0 auto" }}><PrismAnalyticsWidget /><FormForgeContactForm /></section></>;


}


function GameRoom({ state, playerId, busy, onAction, onStart, onInvite, onLeave, onChat, chatDraft, setChatDraft }: { state: RajaGameState; playerId: string; busy: boolean; onAction: (payload: Record<string, string>) => void; onStart: () => void; onInvite: () => void; onLeave: () => void; onChat: (event: React.FormEvent) => void; chatDraft: string; setChatDraft: (value: string) => void }) {
  const me = state.players.find((player) => player.id === playerId);
  const isHost = Boolean(me?.isHost);
  const rank = useMemo(() => [...state.players].sort((a, b) => b.score - a.score), [state.players]);
  const rajaId = state.publicRoles?.raja;
  const mantriId = state.publicRoles?.mantri;
  const candidates = state.players.filter((player) => player.id !== rajaId && player.id !== mantriId);

  const phaseCopy: Record<string, string> = { lobby: "Waiting for all four players", role_reveal: "Read your secret role", minister_reveal: "Raja is calling for the Mantri", guess: "Mantri must identify Chor", round_result: "The truth is on the table", game_over: "The crown has been decided", playing: "Game In Progress" };
  return <main className="game-page"><div className="game-toolbar"><button type="button" className="leave-button" onClick={onLeave}><LogOut size={15} /> Leave</button><div className="room-code-toolbar"><span>PRIVATE ROOM</span><strong onClick={() => { navigator.clipboard.writeText(state.roomCode); onInvite(); }} style={{ cursor: "pointer" }} title="Click to copy code">{state.roomCode}</strong><button type="button" onClick={() => { navigator.clipboard.writeText(state.roomCode); alert("Room Code copied: " + state.roomCode); }} style={{ marginRight: "4px" }}><Copy size={14} /> Copy Code</button><button type="button" onClick={onInvite}><Copy size={14} /> Copy Link</button></div><span className="sync-pill"><span /> Live sync</span></div><div className="phase-banner"><span>ROUND {Math.max(state.currentRound, 1)} / {state.roundsToPlay}</span><strong>{phaseCopy[state.phase] || "Playing"}</strong><i /></div><div className="game-grid"><section className="table-panel">{state.gameType === "chor_sipahi" ? (<><PlayerTable players={state.players} playerId={playerId} publicRoles={state.publicRoles} /><PhasePanel state={state} playerId={playerId} candidates={candidates} isHost={isHost} busy={busy} onAction={onAction} onStart={onStart} /></>) : (<MultiGamePanel state={state} playerId={playerId} busy={busy} onAction={onAction} isHost={isHost} onStart={onStart} />)}</section><aside className="game-side"><ScorePanel ranked={rank} playerId={playerId} /><ChatPanel messages={state.chat} draft={chatDraft} setDraft={setChatDraft} onSubmit={onChat} /></aside></div></main>;


}

function PlayerTable({ players, playerId, publicRoles }: { players: RajaGameState["players"]; playerId: string; publicRoles: RajaGameState["publicRoles"] }) {
  const roleFor = (id: string) => Object.entries(publicRoles).find(([, value]) => value === id)?.[0] as GameRole | undefined;
  return <div className="player-table"><div className="table-center"><span>THE<br />TABLE</span></div>{players.map((player, index) => { const role = roleFor(player.id); return <div className={`seat seat-${index + 1} ${player.id === playerId ? "seat-you" : ""}`} key={player.id}><span className="seat-avatar">{role ? ROLE_DETAILS[role].icon : AVATARS[index]}</span><span><strong>{player.name}{player.id === playerId && <em>you</em>}</strong><small>{role ? ROLE_DETAILS[role].title : player.isHost ? "Host" : "At the table"}</small></span>{role && <span className="public-role">{ROLE_DETAILS[role].hindi}</span>}</div>; })}{Array.from({ length: Math.max(0, 4 - players.length) }, (_, index) => <div className={`seat seat-empty seat-${players.length + index + 1}`} key={`empty-${index}`}><span className="seat-avatar">?</span><span><strong>Waiting…</strong><small>Invite a friend</small></span></div>)}</div>;
}

function PhasePanel({ state, playerId, candidates, isHost, busy, onAction, onStart }: { state: RajaGameState; playerId: string; candidates: RajaGameState["players"]; isHost: boolean; busy: boolean; onAction: (payload: Record<string, string>) => void; onStart: () => void }) {
  const role = state.myRole;
  if (state.phase === "lobby") return <section className="phase-card"><p className="eyebrow"><Users size={14} /> THE LOBBY</p><h1>Bring all four to the table.</h1><p>Roles are dealt only when exactly four players have joined. Share the six-digit room code with your friends.</p><div className="ready-count"><span>{state.players.length}</span><small>of 4 players ready</small></div>{isHost ? <button type="button" className="heritage-button" disabled={busy || state.players.length !== 4} onClick={onStart}><Play size={16} fill="currentColor" /> Deal the role cards</button> : <div className="wait-message"><Eye size={18} /> The host will deal the cards when everyone arrives.</div>}</section>;
  if (state.phase === "role_reveal" && role) { const info = ROLE_DETAILS[role]; return <section className="phase-card role-phase"><p className="eyebrow"><LockKeyhole size={14} /> FOR YOUR EYES ONLY</p><div className={`secret-role role-${role}`}><span>{info.icon}</span><small>YOU ARE THE</small><h1>{info.title}</h1><b>{info.hindi}</b><p>{info.description}</p><i>{info.basePoints} points at stake</i></div>{state.hasSeenRole ? <div className="wait-message"><Check size={18} /> You have locked in. Waiting for {4 - state.rolesSeenCount} player{4 - state.rolesSeenCount === 1 ? "" : "s"}.</div> : <button type="button" className="heritage-button" disabled={busy} onClick={() => onAction({ type: "acknowledge_role" })}><Check size={16} /> I have seen my role</button>}<small className="secret-note">Never show this card to another player.</small></section>; }
  if (state.phase === "minister_reveal") return <section className="phase-card"><p className="eyebrow"><Crown size={14} /> RAJA SPEAKS</p><h1>“Mera Mantri kaun hai?”</h1><p>The Raja has called. The Mantri should step forward; everyone else keeps their role completely secret.</p>{role === "mantri" ? <button type="button" className="heritage-button" disabled={busy} onClick={() => onAction({ type: "reveal_mantri" })}><Swords size={16} /> I am the Mantri</button> : <div className="wait-message"><Eye size={18} /> Waiting for the Mantri to reveal.</div>}</section>;
  if (state.phase === "guess") { const mantri = state.publicRoles.mantri === playerId; return <section className="phase-card"><p className="eyebrow"><UserRoundCheck size={14} /> THE DECISIVE GUESS</p><h1>{mantri ? "Who is the Chor?" : "The Mantri is deciding."}</h1><p>{mantri ? "Choose one of the two players whose role is still hidden. One is Chor, the other is Sipahi." : "Watch carefully. The Mantri must identify the Chor from the two unknown players."}</p>{mantri ? <div className="suspect-list">{candidates.map((player) => <button type="button" key={player.id} disabled={busy} onClick={() => onAction({ type: "guess_chor", suspectPlayerId: player.id })}><span>{player.name.slice(0, 1).toUpperCase()}</span><strong>{player.name}</strong><small>Accuse as Chor</small><ChevronRight size={16} /></button>)}</div> : <div className="wait-message"><Eye size={18} /> The two candidates are under suspicion.</div>}</section>; }
  const winner = [...state.players].sort((a, b) => b.score - a.score)[0];
  const guessed = state.players.find((player) => player.id === state.result?.mantriGuessPlayerId);
  return <section className="phase-card result-phase"><p className="eyebrow"><Sparkles size={14} /> {state.phase === "game_over" ? "FINAL SCORE" : "ROUND REVEAL"}</p><h1>{state.result?.isGuessCorrect ? "The Mantri caught Chor." : "The Chor slipped away."}</h1><p>{state.result?.isGuessCorrect ? `${guessed?.name ?? "The accused"} was indeed the Chor. The Mantri keeps 800 points.` : `${guessed?.name ?? "The accused"} was Sipahi. The Chor takes the Mantri's 800 points.`}</p><div className="reveal-roles">{state.players.map((player) => { const roleName = Object.entries(state.publicRoles).find(([, id]) => id === player.id)?.[0] as GameRole; return <div key={player.id}><span>{roleName ? ROLE_DETAILS[roleName].icon : "?"}</span><strong>{player.name}</strong><small>{roleName ? ROLE_DETAILS[roleName].title : "—"} · +{state.result?.awards[player.id] ?? 0}</small></div>; })}</div>{state.phase === "round_result" && isHost ? <button type="button" className="heritage-button" disabled={busy} onClick={() => onAction({ type: "next_round" })}>Deal round {state.currentRound + 1} <ArrowRight size={16} /></button> : state.phase === "game_over" ? <div className="winner-message"><Crown size={20} /> <span><strong>{winner?.name} wins the crown.</strong><small>{winner?.score ?? 0} total points after {state.roundsToPlay} rounds</small></span></div> : <div className="wait-message"><Eye size={18} /> Host is preparing the next round.</div>}</section>;
}

function ScorePanel({ ranked, playerId }: { ranked: RajaGameState["players"]; playerId: string }) { return <section className="score-panel"><p className="eyebrow">RUNNING SCORE</p><h2>The ledger</h2>{ranked.map((player, index) => <div className={`score-line ${player.id === playerId ? "score-self" : ""}`} key={player.id}><span>{index + 1}</span><strong>{player.name}{player.id === playerId && <em>you</em>}</strong><b>{player.score}</b></div>)}<div className="score-key"><span>👑 Raja <b>1000</b></span><span>🛡️ Sipahi <b>500</b></span><span>🗡️ Mantri / 💰 Chor <b>800</b></span></div></section> }

function ChatPanel({ messages, draft, setDraft, onSubmit }: { messages: ChatItem[]; draft: string; setDraft: (value: string) => void; onSubmit: (event: React.FormEvent) => void }) { return <section className="chat-panel"><div><p className="eyebrow">TABLE TALK</p><h2>Chat</h2></div><div className="chat-feed">{messages.length ? messages.map((message) => <p key={message.id}><strong>{message.playerName}</strong>{message.message}</p>) : <span>Keep a straight face. Say hello.</span>}</div><form onSubmit={onSubmit}><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={280} placeholder="Message the table" /><button type="submit" aria-label="Send message"><Send size={15} /></button></form></section> }
function Rule({ n, icon, title, text }: { n: string; icon: string; title: string; text: string }) { return <article><span>{n}</span><i>{icon}</i><h3>{title}</h3><p>{text}</p></article> }
