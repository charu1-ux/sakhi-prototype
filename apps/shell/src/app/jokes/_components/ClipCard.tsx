"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type ClipFormat = "audio" | "image" | "video";

export type ClipData = {
  jokeText: string; // the actual joke/banter line
  punchline?: string; // optional second line
  voiceTag?: string; // e.g. "Raju Sir voice", "Aunty voice"
  imageBg?: string; // tailwind bg class for image card
  imageEmoji?: string; // large emoji for image card
  durationSec?: number;
  lang?: string;
  tone?: string; // "Roast", "Warm", "Absurd", etc.
  shareText?: string; // pre-composed WhatsApp message
};

// ── Waveform (audio preview) ─────────────────────────────────────────────────

function Waveform({ playing }: { playing: boolean }) {
  const heights = [
    0.3, 0.6, 0.9, 0.7, 1, 0.5, 0.8, 0.4, 0.7, 0.9, 0.6, 0.3, 0.8, 0.5, 1, 0.4, 0.7, 0.6, 0.9, 0.3,
    0.8, 0.5, 0.7, 1, 0.4, 0.6, 0.3, 0.9, 0.7, 0.5,
  ];

  return (
    <div className="flex items-end gap-[3px]" style={{ height: 40 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-white/70"
          style={{
            height: `${h * 40}px`,
            animation: playing
              ? `wave-bar 0.6s ease-in-out ${i * 40}ms infinite alternate`
              : "none",
            opacity: playing ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ── Audio preview ─────────────────────────────────────────────────────────────

function AudioPreview({ clip }: { clip: ClipData }) {
  const [playing, setPlaying] = useState(false);
  const duration = clip.durationSec ?? 25;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[#1a0030] p-5">
      {/* Tags row */}
      <div className="flex items-center gap-2">
        {clip.tone && (
          <span className="rounded-full bg-[#ea580c] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
            {clip.tone}
          </span>
        )}
        {clip.voiceTag && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/70">
            {clip.voiceTag}
          </span>
        )}
        {clip.lang && clip.lang !== "English" && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/70">
            {clip.lang}
          </span>
        )}
        <span className="ml-auto text-[11px] font-medium text-white/40">{duration}s</span>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ea580c] transition-opacity active:opacity-80"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <Waveform playing={playing} />
      </div>

      {/* Joke preview */}
      <div className="rounded-xl bg-white/8 px-4 py-3">
        <p className="text-[13px] leading-relaxed font-medium text-white/90 italic">
          &ldquo;{clip.jokeText}&rdquo;
        </p>
        {clip.punchline && (
          <p className="mt-1 text-[13px] font-bold text-[#ea580c]">{clip.punchline}</p>
        )}
      </div>
    </div>
  );
}

// ── Image preview ─────────────────────────────────────────────────────────────

function ImagePreview({ clip }: { clip: ClipData }) {
  const bg = clip.imageBg ?? "bg-[#ea580c]";
  const emoji = clip.imageEmoji ?? "😂";

  return (
    <div className="flex flex-col gap-3">
      {/* WhatsApp-style image card */}
      <div
        className={`${bg} flex flex-col items-center justify-center gap-4 rounded-2xl px-6 py-10`}
      >
        <span className="text-6xl leading-none">{emoji}</span>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[17px] leading-snug font-black text-white">{clip.jokeText}</p>
          {clip.punchline && (
            <p className="text-[15px] font-bold text-white/80">{clip.punchline}</p>
          )}
        </div>
        {/* JBIQ watermark */}
        <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1">
          <span className="text-[10px] font-bold text-white/60">via JBIQ</span>
        </div>
      </div>

      {/* Format info */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-black/40">1080×1080 · PNG · Shareable</span>
        <button className="bg-surface-ghost flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-[#0c0d10] transition-opacity active:opacity-70">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Save image
        </button>
      </div>
    </div>
  );
}

// ── Video preview ─────────────────────────────────────────────────────────────

function VideoPreview({ clip }: { clip: ClipData }) {
  const [playing, setPlaying] = useState(false);
  const duration = clip.durationSec ?? 25;
  const bg = clip.imageBg ?? "bg-[#ea580c]";
  const emoji = clip.imageEmoji ?? "😂";

  return (
    <div className="flex flex-col gap-3">
      {/* Video thumbnail */}
      <div
        className={`relative ${bg} flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-8`}
      >
        {/* Scanline overlay for video feel */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.04)_3px,rgba(0,0,0,0.04)_4px)]" />

        <span className="text-5xl leading-none">{emoji}</span>
        <p className="text-center text-[15px] leading-snug font-black text-white">
          {clip.jokeText}
        </p>
        {clip.punchline && (
          <p className="text-center text-[13px] font-bold text-white/80">{clip.punchline}</p>
        )}

        {/* Duration badge */}
        <span className="absolute right-3 bottom-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-bold text-white">
          0:{String(duration).padStart(2, "0")}
        </span>

        {/* Play button */}
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform active:scale-95">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0c0d10">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
        {playing && (
          <button
            onClick={() => setPlaying(false)}
            className="absolute bottom-3 left-3 flex items-center justify-center rounded-full bg-black/40 p-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        )}
      </div>

      {/* Format info */}
      <span className="px-1 text-[11px] font-medium text-black/40">
        9:16 · MP4 · 25s · Share as video or GIF
      </span>
    </div>
  );
}

// ── Share row ─────────────────────────────────────────────────────────────────

function ShareRow({ clip }: { clip: ClipData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* WhatsApp CTA */}
      <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
        Share on WhatsApp
      </button>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="bg-surface-ghost flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[13px] font-bold text-[#0c0d10] transition-opacity active:opacity-70"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5L19 7"
                  stroke="#25ab21"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#25ab21]">Copied!</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Copy link
            </>
          )}
        </button>
        <button className="bg-surface-ghost flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[13px] font-bold text-[#0c0d10] transition-opacity active:opacity-70">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          More
        </button>
      </div>
    </div>
  );
}

// ── Main ClipCard export ──────────────────────────────────────────────────────

export function ClipCard({ clip }: { clip: ClipData }) {
  const [format, setFormat] = useState<ClipFormat>("audio");

  const FORMATS: { id: ClipFormat; label: string; icon: string }[] = [
    { id: "audio", label: "Audio", icon: "🎵" },
    { id: "image", label: "Image", icon: "🖼️" },
    { id: "video", label: "Video", icon: "🎬" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        @keyframes wave-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      {/* Format toggle */}
      <div className="bg-surface-ghost flex gap-2 rounded-full p-1">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition-all ${
              format === f.id ? "bg-white text-[#0c0d10] shadow-sm" : "text-black/40"
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Preview */}
      {format === "audio" && <AudioPreview clip={clip} />}
      {format === "image" && <ImagePreview clip={clip} />}
      {format === "video" && <VideoPreview clip={clip} />}

      {/* Share */}
      <ShareRow clip={clip} />
    </div>
  );
}
