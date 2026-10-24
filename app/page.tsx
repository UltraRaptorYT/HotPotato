"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type Track = { name: string; src: string };

const INITIAL_TRACKS: Track[] = [
  { name: "你是我最亮的星 讚頌", src: "/你是我最亮的星 讚頌.mp3" },
  { name: "Geometry Dash — Stereo Madness", src: "/Geometry%20Dash%20Stereo%20Madness%20soundtrack.mp3" },
];
const MIN_PAUSE_SECONDS = 8;
const MAX_PAUSE_SECONDS = 24;

type GameState = "ready" | "playing" | "paused";

function MusicNote() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M9 18V5l12-2v13M9 18c0 1.1-1.6 2-3.5 2S2 19.1 2 18s1.6-2 3.5-2S9 16.9 9 18Zm12-2c0 1.1-1.6 2-3.5 2S14 17.1 14 16s1.6-2 3.5-2 3.5.9 3.5 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Potato() {
  return (
    <svg className="potato-art" viewBox="0 0 300 270" role="img" aria-label="A happy potato wearing sneakers">
      <ellipse cx="151" cy="236" rx="108" ry="15" fill="#b94d1b" opacity=".16" />
      <path d="M53 139c-7-50 25-94 73-105 18-4 31 1 49-3 32-8 74 15 79 56 2 18-5 29-1 44 7 26-7 60-29 76-28 21-103 20-137 6-26-11-32-43-34-74Z" fill="#e6a34a" stroke="#172c29" strokeWidth="6" />
      <path d="M78 83c14-24 37-37 62-39" fill="none" stroke="#f2c879" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="102" cy="117" rx="7" ry="10" fill="#172c29" />
      <ellipse cx="170" cy="112" rx="7" ry="10" fill="#172c29" />
      <path d="M118 141c13 15 31 16 44 1" fill="none" stroke="#172c29" strokeWidth="6" strokeLinecap="round" />
      <circle cx="91" cy="141" r="9" fill="#f28362" opacity=".7" />
      <circle cx="188" cy="137" r="9" fill="#f28362" opacity=".7" />
      <circle cx="205" cy="74" r="5" fill="#bd762e" />
      <circle cx="66" cy="156" r="5" fill="#bd762e" />
      <path d="m224 49 5-12 5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" fill="#fa6651" stroke="#172c29" strokeWidth="3" strokeLinejoin="round" />
      <path d="M104 204v22m72-22v22" stroke="#172c29" strokeWidth="8" strokeLinecap="round" />
      <path d="M75 225c7-5 26-5 35 0l7 13c2 4-1 8-5 8H74c-8 0-11-8-6-14l7-7Zm72 0c7-5 26-5 35 0l7 13c2 4-1 8-5 8h-38c-8 0-11-8-6-14l7-7Z" fill="#fa6651" stroke="#172c29" strokeWidth="5" strokeLinejoin="round" />
      <path d="m87 232 12 4m60-4 12 4" stroke="#fff6e9" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [trackIndex, setTrackIndex] = useState(0);
  const [hasPlaylist, setHasPlaylist] = useState(false);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [round, setRound] = useState(1);
  const [error, setError] = useState("");

  const currentTrack = tracks[trackIndex] ?? tracks[0];
  const canChooseMusic = gameState === "ready" && round === 1;

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    objectUrlsRef.current.forEach(URL.revokeObjectURL);
  }, []);

  function stopMusic() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    audioRef.current?.pause();
    setGameState("paused");
  }

  async function startRound() {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    const pauseIn = Math.floor(Math.random() * (MAX_PAUSE_SECONDS - MIN_PAUSE_SECONDS + 1)) + MIN_PAUSE_SECONDS;
    try {
      await audio.play();
      setGameState("playing");
      timeoutRef.current = setTimeout(stopMusic, pauseIn * 1000);
    } catch {
      setError("Your browser couldn’t play this track. Try choosing another audio file.");
    }
  }

  function toggleRound() {
    if (gameState === "playing") {
      stopMusic();
      return;
    }
    void startRound();
  }

  function nextRound() {
    setRound((value) => value + 1);
    if (hasPlaylist && tracks.length > 1) {
      setTrackIndex((value) => (value + 1) % tracks.length);
    }
    setGameState("ready");
  }

  function addTracks(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("audio/"));
    if (!files.length) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    audioRef.current?.pause();
    const urls = files.map((file) => URL.createObjectURL(file));
    objectUrlsRef.current.push(...urls);
    const newTracks = files.map((file, index) => ({ name: file.name.replace(/\.[^/.]+$/, ""), src: urls[index] }));
    setTracks(newTracks);
    setTrackIndex(0);
    setHasPlaylist(newTracks.length > 1);
    setGameState("ready");
    setRound(1);
    setError("");
    event.target.value = "";
  }

  return (
    <main className="home-shell">
      <audio ref={audioRef} src={currentTrack?.src} loop preload="metadata" />
      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> THE MUSIC’S IN CHARGE</div>
          <h1>Pass the<br /><span>potato.</span><br />Beat the pause.</h1>
          <p className="intro">Keep it moving while the music plays. When it stops, whoever’s holding the potato is out. Easy? <strong>Not even a little.</strong></p>
          <div className="hero-buttons">
            <button className={`play-button ${gameState === "playing" ? "is-playing" : ""}`} onClick={toggleRound}>
              <span className={`play-icon ${gameState === "playing" ? "stop-icon" : ""}`} aria-hidden="true">{gameState === "playing" ? "" : "▶"}</span>
              {gameState === "playing" ? "STOP" : gameState === "paused" ? "Play again" : "Start the game"}
              <span className="button-arrow" aria-hidden="true">→</span>
            </button>
            <span className="round-note">ROUND <b>{String(round).padStart(2, "0")}</b></span>
          </div>
          <p className="auto-pause-note"><span className="sparkle" aria-hidden="true">✳</span> Music pauses at a surprise moment</p>
        </div>

        <div className="hero-art-wrap" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="burst burst-one">✳</div>
          <div className="burst burst-two">✳</div>
          <div className="burst burst-three">✳</div>
          <div className="hero-art-label label-top">DON’T HOLD<br />YOUR BREATH</div>
          <div className="hero-art-label label-bottom">HOT POTATO<br /><span>HOT POTATO</span></div>
          <Potato />
          <div className="music-bubble"><MusicNote /></div>
        </div>
        <div className="hero-stamp" aria-hidden="true"><span>PASS</span><b>IT<br />ON!</b><i>↗</i></div>
      </section>

      <section className={`game-panel ${gameState === "paused" ? "panel-paused" : ""}`} id="game-controls" aria-live="polite">
        <div className="panel-status">
          <span className={`status-indicator ${gameState === "playing" ? "status-playing" : gameState === "paused" ? "status-paused" : ""}`} />
          <span>{gameState === "playing" ? "MUSIC IS PLAYING" : gameState === "paused" ? "THE MUSIC STOPPED" : "READY WHEN YOU ARE"}</span>
        </div>
        <div className="track-info">
          <div className="track-art"><MusicNote /></div>
          <div className="track-copy"><span className="track-label">NOW PLAYING</span><strong title={currentTrack?.name}>{currentTrack?.name}</strong></div>
          <div className={`equalizer ${gameState === "playing" ? "equalizer-on" : ""}`} aria-label={gameState === "playing" ? "Music playing" : "Music paused"}><i /><i /><i /><i /><i /></div>
        </div>
        <div className="panel-divider" />
        {canChooseMusic && <div className="music-picker">
          <label className="track-select-label">
            <span className="sr-only">Choose a soundtrack</span>
            <select aria-label="Choose a soundtrack" value={trackIndex} onChange={(event) => setTrackIndex(Number(event.target.value))}>
              {tracks.map((track, index) => <option key={`${track.src}-${index}`} value={index}>{track.name}</option>)}
            </select>
          </label>
          <label className="upload-button upload-compact"><input type="file" accept="audio/*" multiple onChange={addTracks} /><span aria-hidden="true">＋</span> Add music</label>
        </div>}
        {gameState === "paused" && <button className="next-button" onClick={nextRound}>Next round <span aria-hidden="true">→</span></button>}
      </section>
      {error && <p className="error-message" role="alert">{error}</p>}
    </main>
  );
}
