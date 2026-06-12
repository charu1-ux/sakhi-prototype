"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";

// ── Data ──────────────────────────────────────────────────────────────────────

type Song = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  lang: string;
  imageBg: string;
  imageEmoji: string;
};

type RJCard = {
  text: string;
  followUp: string;
  category: "film" | "singer" | "composer" | "trivia";
  categoryLabel: string;
};

const SONGS: Song[] = [
  {
    id: "tum-hi-ho",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    film: "Aashiqui 2",
    year: 2013,
    lang: "Hindi",
    imageBg: "bg-[#312e81]",
    imageEmoji: "💙",
  },
  {
    id: "ae-dil",
    title: "Ae Dil Hai Mushkil",
    artist: "Arijit Singh",
    film: "Ae Dil Hai Mushkil",
    year: 2016,
    lang: "Hindi",
    imageBg: "bg-[#7c2d12]",
    imageEmoji: "🎸",
  },
  {
    id: "kesariya",
    title: "Kesariya",
    artist: "Arijit Singh",
    film: "Brahmastra",
    year: 2022,
    lang: "Hindi",
    imageBg: "bg-[#78350f]",
    imageEmoji: "🌸",
  },
  {
    id: "chaiyya",
    title: "Chaiyya Chaiyya",
    artist: "Sukhwinder Singh",
    film: "Dil Se",
    year: 1998,
    lang: "Hindi",
    imageBg: "bg-[#14532d]",
    imageEmoji: "🌿",
  },
];

const RJ_CARDS: Record<string, RJCard> = {
  "tum-hi-ho": {
    text: "Arijit Singh recorded Tum Hi Ho in one take — at 2 AM. Mithoon almost didn't include it. He thought it was too simple. Too simple. For what became the anthem of a generation.",
    followUp:
      "Mithoon composes exclusively in D minor for heartbreak. 'It's the only key that sounds like crying,' he once said. Tum Hi Ho, Hasi, Woh Lamhe — all D minor. All still playing on loop somewhere in the world right now.",
    category: "trivia",
    categoryLabel: "Behind the mic",
  },
  "ae-dil": {
    text: "Karan Johar sat with Pritam for three separate sessions just writing this title track. At one point, Ranbir walked into the studio during playback — and started crying. That's when they knew the song was done.",
    followUp:
      "Pritam had 40 songs ready for this film. Six made the album. The other 34 are sitting on a hard drive somewhere — possibly the greatest unreleased music in Bollywood history.",
    category: "film",
    categoryLabel: "Film story",
  },
  kesariya: {
    text: "The orchestra for Kesariya was recorded in Prague. 72 musicians, one song. Pritam flew there just for this. And that opening hum you hear before the words start? That's Arijit's warmup take. Pritam heard the playback and said — 'That stays in.'",
    followUp:
      "Brahmastra took Ayan Mukerji 9 years to make. He started writing it in 2013. Kesariya is the love theme — and by the time the film released, the song had already become bigger than the movie itself.",
    category: "composer",
    categoryLabel: "Composer notes",
  },
  chaiyya: {
    text: "Chaiyya Chaiyya was filmed on a moving train — the Nilgiri Mountain Railway. 200 dancers. No CGI. AR Rahman composed the entire thing in 48 hours for Mani Ratnam. Shah Rukh Khan rehearsed on the roof while the train was still in the station.",
    followUp:
      "The lyrics are by Gulzar, drawn from a Sufi verse by Bulleh Shah. Rahman later said this was one of the hardest shoots he ever scored for — because the train's speed kept changing the natural echo in the hills.",
    category: "trivia",
    categoryLabel: "Making of",
  },
};

const PREFS: { id: string; label: string }[] = [
  { id: "film", label: "Film trivia" },
  { id: "singer", label: "Singer stories" },
  { id: "composer", label: "Composer notes" },
  { id: "making", label: "Song making" },
  { id: "plot", label: "Film plot" },
  { id: "none", label: "Just music 🎵" },
];

const CATEGORY_COLORS: Record<string, string> = {
  film: "bg-[#dbeafe] text-[#1e40af]",
  singer: "bg-[#fce7f3] text-[#9d174d]",
  composer: "bg-[#ede9fe] text-[#5b21b6]",
  trivia: "bg-[#d1fae5] text-[#065f46]",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MusicBars() {
  return (
    <div className="flex items-end gap-0.5" style={{ height: "20px" }}>
      {[60, 100, 75, 45].map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm bg-white/75"
          style={{
            height: `${h}%`,
            transformOrigin: "bottom",
            animation: `music-bar 0.7s ease-in-out ${i * 160}ms infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

function RJWaveform() {
  const heights = [4, 8, 6, 11, 7, 5, 10, 6, 8, 4, 9, 5];
  return (
    <div className="flex items-center gap-0.5" style={{ height: "12px" }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-full bg-[#7c3aed]"
          style={{
            width: "2px",
            height: `${h}px`,
            animation: `rj-wave 0.6s ease-in-out ${i * 60}ms infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type PageState = "playing" | "rj_on" | "adjusting";

export default function MusicRJPage() {
  const [songIdx, setSongIdx] = useState(0);
  const [pageState, setPageState] = useState<PageState>("playing");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [activePrefs, setActivePrefs] = useState<Set<string>>(
    new Set(["film", "singer", "composer", "making"]),
  );
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSong = SONGS[songIdx % SONGS.length];
  const nextSong = SONGS[(songIdx + 1) % SONGS.length];
  const rjCard = RJ_CARDS[currentSong.id];

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  // Restart countdown whenever we enter "playing" state
  useEffect(() => {
    if (pageState !== "playing") return;

    setCountdown(8);
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          setShowFollowUp(false);
          setPageState("rj_on");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pageState, songIdx]);

  const nextSongHandler = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setShowFollowUp(false);
    setPageState("playing");
    setSongIdx((i) => i + 1);
  }, []);

  const skipRJ = useCallback(() => {
    setShowFollowUp(false);
    setPageState("playing");
  }, []);

  const togglePref = useCallback((id: string) => {
    setActivePrefs((prev) => {
      const next = new Set(prev);
      if (id === "none") return new Set(["none"]);
      next.delete("none");
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      {/* Keyframe styles */}
      <style>{`
        @keyframes music-bar { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }
        @keyframes rj-wave   { from { transform: scaleY(0.3);  } to { transform: scaleY(1); } }
      `}</style>

      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* ── Now Playing ── */}
          <div className={`flex items-center gap-4 rounded-2xl ${currentSong.imageBg} px-4 py-4`}>
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-3xl">
              {currentSong.imageEmoji}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[15px] font-black text-white">{currentSong.title}</p>
              <p className="truncate text-[12px] font-medium text-white/70">{currentSong.artist}</p>
              <p className="truncate text-[11px] font-medium text-white/50">
                {currentSong.film} · {currentSong.year}
              </p>
            </div>
            <MusicBars />
          </div>

          {/* ── Progress bar (mock) ── */}
          <div className="flex flex-col gap-1.5 rounded-2xl bg-white px-4 py-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
              <div className="h-full w-[38%] rounded-full bg-[#7c3aed]" />
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-medium text-black/40">1:24</span>
              <span className="text-[10px] font-medium text-black/40">3:42</span>
            </div>
          </div>

          {/* ── RJ area: playing state ── */}
          {pageState === "playing" && (
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-base">
                🎙️
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-[13px] font-bold text-[#0c0d10]">RJ Priya is listening…</p>
                <p className="text-[11px] font-medium text-black/40">
                  Coming on after this song · {countdown}s
                </p>
              </div>
              <button
                onClick={() => setPageState("adjusting")}
                className="bg-surface-ghost rounded-full px-3 py-1.5 text-[10px] font-bold text-black/50 active:opacity-70"
              >
                Tune RJ
              </button>
            </div>
          )}

          {/* ── RJ area: rj_on state ── */}
          {pageState === "rj_on" && rjCard && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4">
              {/* RJ header */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]">
                  <span className="text-[14px] font-black text-white">P</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-[13px] font-black text-[#0c0d10]">RJ Priya</p>
                  <RJWaveform />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[rjCard.category] ?? "bg-surface-ghost text-black/50"}`}
                >
                  {rjCard.categoryLabel}
                </span>
              </div>

              {/* RJ trivia text */}
              <p className="text-[14px] leading-relaxed font-medium text-[#0c0d10]">
                &ldquo;{rjCard.text}&rdquo;
              </p>

              {/* Follow-up (revealed on Tell me more) */}
              {showFollowUp && (
                <p className="border-l-2 border-[#7c3aed] pl-3 text-[13px] leading-relaxed font-medium text-black/60">
                  {rjCard.followUp}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!showFollowUp && (
                  <button
                    onClick={() => setShowFollowUp(true)}
                    className="flex-1 rounded-full bg-[#ede9fe] py-2.5 text-[12px] font-bold text-[#7c3aed] active:opacity-70"
                  >
                    Tell me more
                  </button>
                )}
                <button
                  onClick={nextSongHandler}
                  className={`rounded-full bg-[#7c3aed] py-2.5 text-[12px] font-bold text-white active:opacity-80 ${showFollowUp ? "flex-1" : ""}`}
                >
                  Next song →
                </button>
                <button
                  onClick={skipRJ}
                  className="bg-surface-ghost rounded-full px-3.5 py-2.5 text-[12px] font-bold text-black/50 active:opacity-70"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* ── Up Next ── */}
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <span className="shrink-0 text-[10px] font-bold tracking-widest text-black/30 uppercase">
              Up next
            </span>
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${nextSong.imageBg} text-sm`}
            >
              {nextSong.imageEmoji}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-[13px] font-bold text-[#0c0d10]">{nextSong.title}</p>
              <p className="truncate text-[10px] font-medium text-black/40">
                {nextSong.artist} · {nextSong.film}
              </p>
            </div>
          </div>

          {/* ── RJ info chip ── */}
          <div className="flex items-center gap-2 rounded-xl bg-[#f5f3ff] px-4 py-2.5">
            <span className="text-base">🎙️</span>
            <p className="text-[11px] font-medium text-[#5b21b6]">
              RJ Priya · Specialises in Bollywood lore, A-list composers, and untold film stories
            </p>
          </div>
        </div>
      </main>

      {/* ── Adjust RJ sheet ── */}
      {pageState === "adjusting" && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setPageState("playing")} />
          <div className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-white px-5 pt-5 pb-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-[16px] font-black text-[#0c0d10]">
                  What should RJ Priya talk about?
                </p>
                <p className="text-[11px] font-medium text-black/40">
                  Changes take effect from the next song
                </p>
              </div>
              <button
                onClick={() => setPageState("playing")}
                className="bg-surface-ghost rounded-full p-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#0c0d10"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PREFS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePref(p.id)}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-bold transition-all active:opacity-70 ${
                    activePrefs.has(p.id)
                      ? "bg-[#7c3aed] text-white"
                      : "bg-surface-ghost text-black/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPageState("playing")}
              className="mt-5 w-full rounded-full bg-[#7c3aed] py-3.5 text-[14px] font-bold text-white active:opacity-80"
            >
              Done
            </button>
          </div>
        </>
      )}

      <HubHeader title="Music RJ" backHref="/music" scrolled={scrolled} />
    </div>
  );
}
