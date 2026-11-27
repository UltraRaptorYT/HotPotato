"use client";

import { ChangeEvent, CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Track = { name: string; src: string };
type Challenge = { id: string; text: string; done: boolean };
type GameState = "ready" | "playing" | "paused";

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "name-everyone",
    text: "Name everyone in the group in a direction chosen by the facilitator.",
    done: false,
  },
  {
    id: "interesting-about-yourself",
    text: "What is something interesting about yourself?",
    done: false,
  },
  {
    id: "similar-interest",
    text: "Who in the group shares a similar interest as you?",
    done: false,
  },
  {
    id: "favorite-hobby",
    text: "What is a hobby you enjoy?",
    done: false,
  },
  {
    id: "learn-something-new",
    text: "What is something new you would like to learn?",
    done: false,
  },
  {
    id: "makes-you-smile",
    text: "What is one small thing that always makes you smile?",
    done: false,
  },
  {
    id: "free-day",
    text: "What is your favorite way to spend a free day?",
    done: false,
  },
  {
    id: "dream-destination",
    text: "What is a place you would love to visit?",
    done: false,
  },
  {
    id: "proud-of",
    text: "What is something you are proud of?",
    done: false,
  },
  {
    id: "chant-wisdom",
    text: 'Chant "Om Ara Pa Cha Na Di" 7 times.',
    done: false,
  },
  {
    id: "chant-compassion",
    text: 'Chant "Om Mani Padme Hum" 7 times.',
    done: false,
  },
  {
    id: "chant-green-tara",
    text: 'Chant "Om Tare Tuttare Ture Soha" 7 times.',
    done: false,
  },
  {
    id: "chicken-dance",
    text: "Do Chicken Dance.",
    done: false,
  },
  {
    id: "three-dali-bai",
    text: "Do 3 大礼拜.",
    done: false,
  },
  {
    id: "seven-duan-bai",
    text: "Do 7 段拜.",
    done: false,
  },
  {
    id: "jumping-jacks",
    text: "Do 15 jumping jacks.",
    done: false,
  },
];

const CHALLENGE_STORAGE_KEY = "hot-potato-challenges-v1";
const CHALLENGE_MIGRATION_KEY = "hot-potato-challenges-migrated-v5";
const REMOVED_TRACK_STORAGE_KEY = "hot-potato-removed-tracks-v1";
const MIN_PAUSE_SECONDS = 8;
const MAX_PAUSE_SECONDS = 24;
const MUSIC_START_OFFSET_SECONDS = 60;

function MusicNote() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M9 18V5l12-2v13M9 18c0 1.1-1.6 2-3.5 2S2 19.1 2 18s1.6-2 3.5-2S9 16.9 9 18Zm12-2c0 1.1-1.6 2-3.5 2S14 17.1 14 16s1.6-2 3.5-2 3.5.9 3.5 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Potato({ className = "potato-art", showShadow = true }: { className?: string; showShadow?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 270"
      role="img"
      aria-label="A happy potato wearing sneakers"
    >
      {showShadow && <ellipse className="potato-shadow" cx="151" cy="236" rx="108" ry="15" fill="#b94d1b" opacity=".16" />}
      <g className="potato-body">
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
      </g>
      <g className="potato-foot potato-foot-left">
        <path d="M104 204v23" fill="none" stroke="#172c29" strokeWidth="8" strokeLinecap="round" />
        <path d="M75 225c7-5 26-5 35 0l7 13c2 4-1 8-5 8H74c-8 0-11-8-6-14l7-7Z" fill="#fa6651" stroke="#172c29" strokeWidth="5" strokeLinejoin="round" />
        <path d="m87 232 12 4" fill="none" stroke="#fff6e9" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="potato-foot potato-foot-right">
        <path d="M176 204v23" fill="none" stroke="#172c29" strokeWidth="8" strokeLinecap="round" />
        <path d="M147 225c7-5 26-5 35 0l7 13c2 4-1 8-5 8h-38c-8 0-11-8-6-14l7-7Z" fill="#fa6651" stroke="#172c29" strokeWidth="5" strokeLinejoin="round" />
        <path d="m159 232 12 4" fill="none" stroke="#fff6e9" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function isChallengeList(value: unknown): value is Challenge[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item?.id === "string" &&
        typeof item?.text === "string" &&
        typeof item?.done === "boolean",
    )
  );
}

export default function Home({ libraryTracks }: { libraryTracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const rulesDialogRef = useRef<HTMLDialogElement>(null);
  const challengeDialogRef = useRef<HTMLDialogElement>(null);
  const revealDialogRef = useRef<HTMLDialogElement>(null);
  const reelWindowRef = useRef<HTMLDivElement>(null);
  const [tracks, setTracks] = useState<Track[]>(libraryTracks);
  const [availableLibraryTracks, setAvailableLibraryTracks] = useState(libraryTracks);
  const [removedLibraryTracks, setRemovedLibraryTracks] = useState<string[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [hasPlaylist, setHasPlaylist] = useState(false);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [round, setRound] = useState(1);
  const [error, setError] = useState("");
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const challengesRef = useRef(challenges);
  challengesRef.current = challenges;
  const [challengesLoaded, setChallengesLoaded] = useState(false);
  const [newChallenge, setNewChallenge] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [revealText, setRevealText] = useState("");
  const [reelItems, setReelItems] = useState<string[]>([]);
  const [reelIndex, setReelIndex] = useState(0);
  const [reelDuration, setReelDuration] = useState(100);
  const [reelItemHeight, setReelItemHeight] = useState(0);

  const currentTrack = tracks[trackIndex] ?? tracks[0];
  const canChooseMusic = gameState !== "playing";
  const completedCount = challenges.filter(
    (challenge) => challenge.done,
  ).length;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isChallengeList(parsed)) {
          const migrated = window.localStorage.getItem(CHALLENGE_MIGRATION_KEY) === "true";
          const merged = [...parsed];
          if (!migrated) {
            for (const challenge of DEFAULT_CHALLENGES) {
              if (!merged.some((savedChallenge) => savedChallenge.id === challenge.id)) {
                merged.push({ ...challenge, done: false });
              }
            }
            window.localStorage.setItem(CHALLENGE_MIGRATION_KEY, "true");
          }
          setChallenges(merged);
        }
      } else {
        window.localStorage.setItem(CHALLENGE_MIGRATION_KEY, "true");
      }
    } catch {
      // Keep the example challenges if local storage is unavailable.
    }
    try {
      const removed = window.localStorage.getItem(REMOVED_TRACK_STORAGE_KEY);
      if (removed) {
        const parsed: unknown = JSON.parse(removed);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          setRemovedLibraryTracks(parsed);
          setTracks((items) => items.filter((track) => !parsed.includes(track.src)));
        }
      }
    } catch {
      // The music library remains available if storage is unavailable.
    }
    setChallengesLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function refreshLibrary() {
      try {
        const response = await fetch("/api/tracks", { cache: "no-store" });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        if (!Array.isArray((payload as { tracks?: unknown })?.tracks)) return;
        const latestTracks = (payload as { tracks: Track[] }).tracks.filter(
          (track) => typeof track?.name === "string" && typeof track?.src === "string",
        );
        if (cancelled) return;
        setAvailableLibraryTracks(latestTracks);
        let removed: string[] = [];
        try {
          const saved = window.localStorage.getItem(REMOVED_TRACK_STORAGE_KEY);
          const parsed: unknown = saved ? JSON.parse(saved) : [];
          if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
            removed = parsed;
          }
        } catch {
          // Show the available library if storage cannot be read.
        }
        setTracks((current) => [
          ...latestTracks.filter((track) => !removed.includes(track.src)),
          ...current.filter((track) => track.src.startsWith("blob:")),
        ]);
      } catch {
        // Use the build-time library if the refresh endpoint is unavailable.
      }
    }
    void refreshLibrary();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!challengesLoaded) return;
    try {
      window.localStorage.setItem(
        CHALLENGE_STORAGE_KEY,
        JSON.stringify(challenges),
      );
    } catch {
      // The list still works for this session when storage is unavailable.
    }
  }, [challenges, challengesLoaded]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
    },
    [],
  );

  function stopMusic() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    audioRef.current?.pause();
    setGameState("paused");
  }

  function rollChallenge() {
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);

    const allChallenges = challengesRef.current;
    const requiredChallenge = round <= 2
      ? allChallenges.find((challenge) => challenge.id === "name-everyone")
      : undefined;
    const available = allChallenges.filter((challenge) => !challenge.done);
    const choices = requiredChallenge ? [requiredChallenge] : available;
    if (!choices.length) {
      setRevealText("All challenges are complete");
      setReelItems(["All challenges are complete"]);
      setReelIndex(0);
      setReelItemHeight(reelWindowRef.current?.clientHeight ?? 0);
      setIsRolling(false);
      return;
    }

    const chosen = choices[Math.floor(Math.random() * choices.length)];
    const reelPool = round <= 2 ? allChallenges : available;
    const rollDurations = [85, 85, 85, 95, 100, 110, 125, 150, 190, 245, 320, 420, 540, 680];
    const entries = Array.from({ length: rollDurations.length }, () =>
      reelPool[Math.floor(Math.random() * reelPool.length)].text,
    );
    entries.push(chosen.text);
    setReelItems(entries);
    setReelIndex(0);
    setReelItemHeight(reelWindowRef.current?.clientHeight ?? 0);
    setReelDuration(rollDurations[0]);
    setIsRolling(true);
    let step = 0;
    const spin = () => {
      step += 1;
      const duration = rollDurations[step - 1];
      setReelDuration(duration);
      setReelIndex(step);
      if (step >= rollDurations.length) {
        rollTimeoutRef.current = setTimeout(() => {
        setRevealText(chosen.text);
        setChallenges((items) => items.map((item) =>
          item.id === chosen.id ? { ...item, done: true } : item,
        ));
        setIsRolling(false);
        rollTimeoutRef.current = null;
        }, duration);
        return;
      }
      rollTimeoutRef.current = setTimeout(spin, duration);
    };
    rollTimeoutRef.current = setTimeout(spin, 40);
  }

  useEffect(() => {
    if (gameState !== "paused" || !challengesLoaded) return;
    if (!revealDialogRef.current?.open) revealDialogRef.current?.showModal();
    rollChallenge();
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    };
  }, [gameState, challengesLoaded, round]);

  async function startRound() {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    const pauseIn =
      Math.floor(Math.random() * (MAX_PAUSE_SECONDS - MIN_PAUSE_SECONDS + 1)) +
      MIN_PAUSE_SECONDS;
    try {
      const metadataReady = audio.readyState >= HTMLMediaElement.HAVE_METADATA;
      if (metadataReady) {
        audio.currentTime = audio.duration > MUSIC_START_OFFSET_SECONDS
          ? MUSIC_START_OFFSET_SECONDS
          : 0;
      }
      await audio.play();
      if (!metadataReady) {
        audio.currentTime = audio.duration > MUSIC_START_OFFSET_SECONDS
          ? MUSIC_START_OFFSET_SECONDS
          : 0;
      }
      setGameState("playing");
      timeoutRef.current = setTimeout(stopMusic, pauseIn * 1000);
    } catch {
      setError(
        "Your browser couldn't play this track. Try choosing another audio file.",
      );
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
    revealDialogRef.current?.close();
    setRound((value) => value + 1);
    if (hasPlaylist && tracks.length > 1) {
      setTrackIndex((value) => (value + 1) % tracks.length);
    }
    setChallenges((items) => items.map((item) => ({ ...item, done: false })));
    setRevealText("");
    setGameState("ready");
  }

  function resetRounds() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    timeoutRef.current = null;
    rollTimeoutRef.current = null;
    audioRef.current?.pause();
    revealDialogRef.current?.close();
    setRound(1);
    setChallenges((items) => items.map((item) => ({ ...item, done: false })));
    setRevealText("");
    setReelItems([]);
    setIsRolling(false);
    setGameState("ready");
  }

  function removeCurrentTrack() {
    if (!currentTrack || !canChooseMusic) return;
    const source = currentTrack.src;
    const nextTracks = tracks.filter((track) => track.src !== source);
    const isLibraryTrack = !source.startsWith("blob:");
    if (isLibraryTrack) {
      const removed = [...new Set([...removedLibraryTracks, source])];
      setRemovedLibraryTracks(removed);
      try {
        window.localStorage.setItem(REMOVED_TRACK_STORAGE_KEY, JSON.stringify(removed));
      } catch {
        // The track is still removed for this session if storage is unavailable.
      }
    } else {
      URL.revokeObjectURL(source);
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== source);
    }
    audioRef.current?.pause();
    setTracks(nextTracks);
    setTrackIndex((index) => Math.max(0, Math.min(index, nextTracks.length - 1)));
    setHasPlaylist(nextTracks.length > 1);
  }

  function restoreLibraryTracks() {
    const uploads = tracks.filter((track) => track.src.startsWith("blob:"));
    setRemovedLibraryTracks([]);
    try {
      window.localStorage.removeItem(REMOVED_TRACK_STORAGE_KEY);
    } catch {
      // The library can still be restored for this session.
    }
    setTracks([...availableLibraryTracks, ...uploads]);
    setTrackIndex(0);
  }

  function addTracks(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("audio/"),
    );
    if (!files.length) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    audioRef.current?.pause();
    objectUrlsRef.current.forEach(URL.revokeObjectURL);
    const urls = files.map((file) => URL.createObjectURL(file));
    objectUrlsRef.current = urls;
    setTracks(
      files.map((file, index) => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        src: urls[index],
      })),
    );
    setTrackIndex(0);
    setRemovedLibraryTracks([]);
    try {
      window.localStorage.removeItem(REMOVED_TRACK_STORAGE_KEY);
    } catch {
      // The selected playlist still replaces the library for this session.
    }
    setHasPlaylist(files.length > 1);
    setGameState("ready");
    setRound(1);
    setError("");
    event.target.value = "";
  }

  function addChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newChallenge.trim();
    if (!text) return;
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `challenge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setChallenges((items) => [...items, { id, text, done: false }]);
    setNewChallenge("");
  }

  function refreshChallenges() {
    const defaultIds = new Set(DEFAULT_CHALLENGES.map((challenge) => challenge.id));
    setChallenges((items) => [
      ...DEFAULT_CHALLENGES.map((challenge) => ({ ...challenge, done: false })),
      ...items
        .filter((challenge) => !defaultIds.has(challenge.id))
        .map((challenge) => ({ ...challenge, done: false })),
    ]);
  }

  function toggleChallenge(id: string) {
    setChallenges((items) =>
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  }

  function removeChallenge(id: string) {
    if (id === "name-everyone" && round <= 2) return;
    setChallenges((items) => items.filter((item) => item.id !== id));
  }

  function clearCompletedChallenges() {
    setChallenges((items) => items.map((item) => ({ ...item, done: false })));
  }

  const statusText =
    gameState === "playing"
      ? "Music is playing"
      : gameState === "paused"
        ? "Music stopped"
        : "Ready to play";

  return (
    <main className="home-shell">
      <audio ref={audioRef} src={currentTrack?.src} loop preload="metadata" />

      <header className="topbar">
        <a className="brand" href="#home" aria-label="Hot Potato home">
          <span className="brand-mark">
            <Potato className="brand-potato" />
          </span>
          <span>Hot Potato</span>
        </a>
        <button
          className="quiet-button"
          type="button"
          onClick={() => rulesDialogRef.current?.showModal()}
        >
          How to play
        </button>
      </header>

      <div className="dashboard-layout">
        <section className="hero" id="home">
          <div className="hero-art" aria-hidden="true">
            <span className="potato-group-shadow" />
            <span className="potato-friend potato-friend-left">
              <Potato showShadow={false} className={`potato-art friend-potato ${gameState === "playing" ? "is-dancing" : ""}`} />
            </span>
            <span className="potato-friend potato-friend-right">
              <Potato showShadow={false} className={`potato-art friend-potato ${gameState === "playing" ? "is-dancing" : ""}`} />
            </span>
            <div className="potato-main">
              <Potato
                showShadow={false}
                className={`potato-art ${gameState === "playing" ? "is-dancing" : ""}`}
              />
            </div>
          </div>
          <div className="hero-copy">
            <div className="game-actions">
              <button
                className={`play-button ${gameState === "playing" ? "is-playing" : ""}`}
                type="button"
                onClick={toggleRound}
              >
                <span
                  className={`play-icon ${gameState === "playing" ? "stop-icon" : ""}`}
                  aria-hidden="true"
                />
                {gameState === "playing"
                  ? "Stop music"
                  : gameState === "paused"
                    ? "Play again"
                    : "Start the game"}
              </button>
              <span className="round-label">
                ROUND <strong>{String(round).padStart(2, "0")}</strong>
              </span>
              <button
                className="quiet-button reset-round-button"
                type="button"
                onClick={resetRounds}
              >
                Reset rounds
              </button>
            </div>
            <p className={`status-line status-${gameState}`} aria-live="polite">
              <span className="status-dot" />
              {statusText}
              {gameState === "playing"
                ? " - it'll pause at a surprise moment"
                : ""}
            </p>
          </div>
        </section>

        <div className="side-panels">
          <section className="music-card" aria-labelledby="music-heading">
            <div className="section-heading">
              <div>
                <p className="section-kicker">SOUNDTRACK</p>
                <h2 id="music-heading">Choose your music</h2>
              </div>
              <span className="track-count">
                {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
              </span>
            </div>
            <div className="music-controls">
              <span className="field-label" id="track-select-label">
                Current track
              </span>
              <Select
                value={String(trackIndex)}
                onValueChange={(value) => setTrackIndex(Number(value))}
                disabled={!canChooseMusic}
              >
                <SelectTrigger
                  className="track-select"
                  aria-labelledby="track-select-label"
                >
                  <SelectValue placeholder="Choose a track" />
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((track, index) => (
                    <SelectItem
                      key={`${track.src}-${index}`}
                      value={String(index)}
                    >
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="music-actions">
                <label className="upload-button">
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={addTracks}
                  />
                  <span aria-hidden="true">+</span> Add music
                </label>
                <button
                  className="remove-track-button"
                  type="button"
                  onClick={removeCurrentTrack}
                  disabled={!currentTrack || !canChooseMusic}
                  aria-label={currentTrack ? `Remove ${currentTrack.name} from the playlist` : "No track selected"}
                >
                  Remove track
                </button>
              </div>
            </div>
            <p className="helper-text">
              {tracks.length
                ? "Music stays on this device. Choose a track, or remove it from this playlist."
                : "No tracks left in this playlist. Add music or restore the library."}
              {removedLibraryTracks.length > 0 && (
                <button className="restore-button" type="button" onClick={restoreLibraryTracks}>
                  Restore removed tracks
                </button>
              )}
            </p>
          </section>

          <section
            className={`challenge-card ${gameState === "paused" ? "challenge-card-active" : ""}`}
            aria-labelledby="challenge-heading"
            aria-live="polite"
          >
            <div className="section-heading challenge-heading-row">
              <div>
                <p className="section-kicker">AFTER THE MUSIC STOPS</p>
                <h2 id="challenge-heading">Challenges</h2>
              </div>
              {gameState === "paused" && (
                <span className="progress-label">
                  {completedCount} of {challenges.length} done
                </span>
              )}
              <button
                className="quiet-button"
                type="button"
                onClick={() => challengeDialogRef.current?.showModal()}
              >
                Edit list
              </button>
            </div>

            {gameState === "paused" ? (
              <>
                <p className="challenge-prompt">
                  The selected challenge is marked complete automatically. Use Edit list to view or change challenges.
                </p>
                <button
                  className="next-button"
                  type="button"
                  onClick={nextRound}
                >
                  Start next round
                </button>
              </>
            ) : (
              <div className="challenge-teaser">
                <p>
                  {gameState === "playing"
                    ? "Keep passing! Your challenge list is ready when the music stops."
                    : `${challenges.length} ${challenges.length === 1 ? "challenge" : "challenges"} ready for the next pause.`}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <dialog
        className="challenge-reveal-dialog"
        ref={revealDialogRef}
        aria-labelledby="challenge-reveal-title"
      >
        <button
          className="dialog-close reveal-close"
          type="button"
          aria-label="Close challenge reveal"
          onClick={() => revealDialogRef.current?.close()}
        >
          ×
        </button>
        <div className="challenge-reveal-content">
          <p className="section-kicker">ROUND {String(round).padStart(2, "0")} · THE POTATO PICKS</p>
          <h2 id="challenge-reveal-title">{isRolling ? "And the challenge is…" : "Your challenge"}</h2>
          <div className={`slot-reel ${isRolling ? "is-rolling" : "is-result"}`}>
            <span className="slot-star" aria-hidden="true">✳</span>
            <div
              className="slot-window"
              ref={reelWindowRef}
              aria-live={isRolling ? "off" : "polite"}
              style={{ "--reel-duration": `${reelDuration}ms` } as CSSProperties}
            >
              <div
                className="slot-track"
                style={{
                  height: `${(reelItems.length || 1) * reelItemHeight}px`,
                  transform: `translateY(-${reelIndex * reelItemHeight}px)`,
                  transition: reelIndex === 0 ? "none" : undefined,
                  "--reel-row-height": `${reelItemHeight}px`,
                } as CSSProperties}
              >
                {(reelItems.length ? reelItems : [revealText || "All challenges are complete"]).map((item, index) => (
                  <div className="slot-item" key={`${index}-${item}`}>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <span className="slot-star" aria-hidden="true">✳</span>
          </div>
          <p className="reveal-status" aria-live="polite">
            {isRolling ? "Spinning…" : revealText === "All challenges are complete" ? "Clear the list to play again." : "Marked complete ✓"}
          </p>
          <div className="reveal-actions">
            <button className="quiet-button" type="button" onClick={clearCompletedChallenges} disabled={isRolling || completedCount === 0}>
              Clear completed
            </button>
            <button className="quiet-button" type="button" onClick={rollChallenge} disabled={isRolling || challenges.every((challenge) => challenge.done)}>
              Spin again
            </button>
            <button className="next-button" type="button" onClick={nextRound}>Start next round</button>
          </div>
        </div>
      </dialog>

      <dialog
        className="app-dialog"
        ref={rulesDialogRef}
        aria-labelledby="rules-title"
      >
        <div className="dialog-content">
          <div className="dialog-heading">
            <div>
              <p className="section-kicker">GAME NIGHT</p>
              <h2 id="rules-title">How to play</h2>
            </div>
            <form method="dialog">
              <button className="dialog-close" aria-label="Close rules">
                ×
              </button>
            </form>
          </div>
          <ol className="rules-list">
            <li>
              <span>1</span>
              <p>Choose a song or add music from this device.</p>
            </li>
            <li>
              <span>2</span>
              <p>Pass the potato while the music plays.</p>
            </li>
            <li>
              <span>3</span>
              <p>When it stops, the challenge slot picks a task at random.</p>
            </li>
            <li>
              <span>4</span>
              <p>The task is marked complete automatically. Clear tasks when needed.</p>
            </li>
          </ol>
          <form method="dialog">
            <button className="dialog-done">Got it</button>
          </form>
        </div>
      </dialog>

      <dialog
        className="app-dialog"
        ref={challengeDialogRef}
        aria-labelledby="edit-challenges-title"
      >
        <div className="dialog-content">
          <div className="dialog-heading">
            <div>
              <p className="section-kicker">MAKE IT YOURS</p>
              <h2 id="edit-challenges-title">Edit challenges</h2>
            </div>
            <form method="dialog">
              <button
                className="dialog-close"
                aria-label="Close challenge editor"
              >
                ×
              </button>
            </form>
          </div>
          <p className="dialog-description">
            Add a few quick challenges for the group. Your list is saved in this
            browser.
          </p>
          <button
            className="quiet-button refresh-challenges-button"
            type="button"
            onClick={refreshChallenges}
          >
            Refresh challenges
          </button>
          <form className="add-challenge-form" onSubmit={addChallenge}>
            <label className="sr-only" htmlFor="new-challenge">
              New challenge
            </label>
            <input
              id="new-challenge"
              value={newChallenge}
              onChange={(event) => setNewChallenge(event.target.value)}
              maxLength={120}
              placeholder="Write a challenge..."
            />
            <button
              className="add-button"
              type="submit"
              disabled={!newChallenge.trim()}
            >
              Add
            </button>
          </form>
          <ul className="manage-list">
            {challenges.map((challenge) => (
              <li key={challenge.id}>
                <span>{challenge.text}</span>
                <button
                  className="remove-button"
                  type="button"
                  onClick={() => removeChallenge(challenge.id)}
                  disabled={challenge.id === "name-everyone" && round <= 2}
                  aria-label={`Remove ${challenge.text}`}
                >
                  {challenge.id === "name-everyone" && round <= 2 ? "Required" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
          <form method="dialog">
            <button className="dialog-done" type="submit">
              Done
            </button>
          </form>
        </div>
      </dialog>
    </main>
  );
}
