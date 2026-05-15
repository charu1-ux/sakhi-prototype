"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ─────────────────────────────────────────
   SARVAM TTS — bulbul:v2 Indian voices
   ───────────────────────────────────────── */
const SARVAM_KEY = process.env.NEXT_PUBLIC_SARVAM_API_KEY ?? "";
const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

const VOICE_MAP: Record<string, string> = {
  raj: "abhilash",
  daniel: "karun",
  bill: "hitesh",
  chris: "arya",
  advait: "abhilash",
  kabir: "karun",
  ratan: "hitesh",
  aayan: "arya",
  manan: "abhilash",
  arvind: "karun",
  abhilash: "abhilash",
  karun: "karun",
  hitesh: "hitesh",
  arya: "arya",
  anushka: "anushka",
  manisha: "manisha",
  vidya: "vidya",
};
const DEFAULT_VOICE = "abhilash";
const mapSpeaker = (s: string) => VOICE_MAP[s] || DEFAULT_VOICE;

const _b64ToBlob = (b64: string, mime = "audio/wav"): Blob => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

const _sarvamTTS = async (text: string, speaker: string): Promise<Blob> => {
  const speakerName = mapSpeaker(speaker);
  const resp = await fetch(SARVAM_TTS_URL, {
    method: "POST",
    headers: { "api-subscription-key": SARVAM_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: "hi-IN",
      speaker: speakerName,
      model: "bulbul:v2",
      pitch: 0,
      pace: 1.0,
      loudness: 1.2,
      enable_preprocessing: true,
    }),
  });
  if (!resp.ok) throw new Error("Sarvam TTS: " + resp.status);
  const data = await resp.json();
  if (!data.audios || !data.audios[0]) throw new Error("Sarvam: no audio");
  return _b64ToBlob(data.audios[0]);
};

/* ── Module-level audio cache — shared across all components ── */
const audioCache: Record<string, string> = {};

/* ── Standalone TTS fetch (used by scene-synced cards + narration hook) ── */
const fetchTTS = async (
  text: string,
  cacheKey: string,
  speaker = "advait",
): Promise<string | null> => {
  if (audioCache[cacheKey]) return audioCache[cacheKey];
  try {
    const blob = await _sarvamTTS(text, speaker);
    const src = URL.createObjectURL(blob);
    audioCache[cacheKey] = src;
    return src;
  } catch (e) {
    console.warn("Sarvam TTS fetch failed:", e);
    return null;
  }
};

/* ── Split text into chunks under 480 chars at sentence boundaries ── */
const chunkTextForTTS = (text: string): string[] => {
  if (text.length <= 480) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= 480) {
      chunks.push(remaining);
      break;
    }
    const cut = remaining.substring(0, 480);
    let splitAt = -1;
    for (const sep of ["।", ".", "!", "?"]) {
      const idx = cut.lastIndexOf(sep);
      if (idx > 150 && idx > splitAt) splitAt = idx;
    }
    if (splitAt < 0) {
      for (const sep of [" — ", ", ", "— "]) {
        const idx = cut.lastIndexOf(sep);
        if (idx > 150) {
          splitAt = idx + sep.length - 1;
          break;
        }
      }
    }
    if (splitAt < 0) splitAt = 479;
    chunks.push(remaining.substring(0, splitAt + 1).trim());
    remaining = remaining.substring(splitAt + 1).trim();
  }
  return chunks;
};

/* ── Global audio prefetch queue — staggers ALL TTS requests across the page ── */
const _prefetchQueue: { chunk: string; key: string; speaker: string }[] = [];
let _prefetchRunning = false;

const queuePrefetch = (text: string, cacheKey: string, speaker: string) => {
  const chunks = chunkTextForTTS(text);
  chunks.forEach((chunk, ci) => {
    const key = chunks.length === 1 ? cacheKey : cacheKey + "_c" + ci;
    if (audioCache[key]) return;
    _prefetchQueue.push({ chunk, key, speaker });
  });
  if (!_prefetchRunning) _drainPrefetchQueue();
};

const _drainPrefetchQueue = async () => {
  _prefetchRunning = true;
  while (_prefetchQueue.length > 0) {
    const item = _prefetchQueue.shift();
    if (!item) continue;
    const { chunk, key, speaker } = item;
    if (audioCache[key]) continue;
    try {
      const blob = await _sarvamTTS(chunk, speaker);
      audioCache[key] = URL.createObjectURL(blob);
      console.log("Pre-cached", key);
    } catch (e) {
      console.warn("Prefetch failed for", key, e);
    }
    // 400ms gap between requests to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 400));
  }
  _prefetchRunning = false;
};

/* ─────────────────────────────────────────
   ORBIT_PLANETS — data driving LivingSolarSystem
   ───────────────────────────────────────── */
interface StoryBeat {
  at: number;
  icon: string;
  text: string;
  sub: string;
  type: "house" | "trait" | "transit" | "highlight" | "window";
  fromHouse?: string;
  toHouse?: string;
}

interface OrbitPlanet {
  id: string;
  glyph: string;
  label: string;
  house: string;
  strength: number;
  orbitRadius: number;
  speed: number;
  startAngle: number;
  color: string;
  glowColor: string;
  size: number;
  speaker: string;
  title: string;
  subtitle: string;
  narration: string;
  storyBeats: StoryBeat[];
  chatReplies: Record<string, string>;
}

const ORBIT_PLANETS: OrbitPlanet[] = [
  {
    id: "Mars",
    glyph: "♂",
    label: "मंगल",
    house: "1st House",
    strength: 0.95,
    orbitRadius: 0.3,
    speed: 120,
    startAngle: 0,
    color: "#ff6644",
    glowColor: "rgba(255,102,68,0.4)",
    size: 48,
    speaker: "kabir",
    title: "मंगल — Your Fire",
    subtitle: "The force behind every bold decision",
    narration: `मैं मंगल हूँ, और शिवाली जी, आपकी birth chart में मैं पहले घर में — लग्न में — बैठा हूँ। ये सबसे powerful placement है। इसका मतलब है कि आपकी personality में ही courage है — आपको अलग से हिम्मत जुटानी नहीं पड़ती। जहाँ दूसरे permission माँगते हैं, आप initiative लेती हैं। Quick decisions, leadership, किसी भी situation में सबसे पहले खड़ा होना — ये आपकी core strengths हैं। और अभी एक interesting चीज़ हो रही है — इस वक़्त मैं transit करके आपके दसवें घर में आया हूँ, career और public recognition वाले घर में। ये combination rare है — लग्न का मंगल जब दसवें में transit करे, तो professionally कुछ बड़ा होता है। पिछले कुछ हफ़्तों में आपने notice किया होगा — work में ज़्यादा energy है, decisions तेज़ हो रहे हैं, लोग आपकी बात ज़्यादा seriously ले रहे हैं। ये phase अगले तीन महीने तक है — इसका पूरा फ़ायदा उठाइए।`,
    storyBeats: [
      {
        at: 0.12,
        icon: "🏠",
        text: "लग्न भाव में मंगल",
        sub: "1st House · Personality = Courage",
        type: "house",
        fromHouse: undefined,
        toHouse: "1",
      },
      {
        at: 0.3,
        icon: "⚔️",
        text: "Core Strengths",
        sub: "Quick decisions · Leadership · Initiative",
        type: "trait",
      },
      {
        at: 0.48,
        icon: "→",
        text: "Transit: लग्न → दसवाँ भाव",
        sub: "Career & Public Recognition House",
        type: "transit",
        fromHouse: "1",
        toHouse: "10",
      },
      {
        at: 0.65,
        icon: "🔥",
        text: "Rare Combination Active",
        sub: "लग्न का मंगल + 10th house transit",
        type: "highlight",
      },
      {
        at: 0.82,
        icon: "⏳",
        text: "3 महीने का Power Phase",
        sub: "Work energy UP · Decisions sharp · Recognition",
        type: "window",
      },
    ],
    chatReplies: {
      health:
        "मंगल लग्न में है — शरीर में गर्मी और एसिडिटी हो सकती है। तीन महीने बाद जब मैं चतुर्थ भाव में जाऊंगा, आप health wise बेहतर feel करेंगी। अभी ठंडी चीज़ें खाएं, मसालेदार avoid करें।",
      career:
        "अभी मैं दसवें भाव में transit कर रहा हूँ — career का सबसे powerful phase है। अगले 3 महीने में promotion, recognition, या role change — कुछ बड़ा होगा। Bold moves लो।",
      love: "मंगल की वजह से relationships में थोड़ा aggression आ सकता है। Soft बोलो, ज़बरदस्ती अपनी बात मत रखो। जब मैं चतुर्थ भाव में जाऊंगा, love life smooth होगी।",
      default:
        "मैं आपका सबसे dominant planet हूँ — लग्न में बैठा हूँ। जो भी सवाल है, बेझिझक पूछो। आपकी हिम्मत और decision power मेरी देन है।",
    },
  },
  {
    id: "Saturn",
    glyph: "♄",
    label: "शनि",
    house: "10th House",
    strength: 0.8,
    orbitRadius: 0.44,
    speed: 200,
    startAngle: 72,
    color: "rgba(200,190,160,0.8)",
    glowColor: "rgba(200,190,160,0.25)",
    size: 44,
    speaker: "ratan",
    title: "शनि — Your Patience",
    subtitle: "The quiet strength behind your perseverance",
    narration: `मैं शनि हूँ। शिवाली जी, आपकी birth chart में मैं दसवें घर में बैठा हूँ — career और public life के घर में। इसकी वजह से आपमें genuine discipline है, shortcuts लेना आपकी nature में नहीं है। जो भी आपने build किया है life में, वो solid है क्योंकि आपने properly किया है। लोग आप पर trust करते हैं — आपकी professional reputation हमेशा आपसे पहले पहुँचती है। अभी मैं transit करके आपके पाँचवें घर में आया हूँ — creativity, self-expression, और learning वाले घर में। ये January से शुरू हुआ है और अगले डेढ़ साल तक रहेगा। आपने शायद notice किया हो — कुछ नया सीखने का मन कर रहा है, या कोई creative project seriously लेने की इच्छा हो रही है। ये मेरा influence है। लेकिन मेरा तरीक़ा आप जानती हैं — मैं जल्दी results नहीं देता, पर जो देता हूँ वो lasting होता है। इस phase में जो भी skill आप सीखेंगी, वो आगे जाकर आपके career को next level पर ले जाएगी।`,
    storyBeats: [
      {
        at: 0.12,
        icon: "🏠",
        text: "दसवाँ भाव में शनि",
        sub: "10th House · Career & Discipline",
        type: "house",
      },
      {
        at: 0.3,
        icon: "🧱",
        text: "Solid Foundation",
        sub: "Genuine discipline · No shortcuts",
        type: "trait",
      },
      {
        at: 0.48,
        icon: "→",
        text: "Transit: दसवाँ → पाँचवाँ भाव",
        sub: "Creativity & Learning House",
        type: "transit",
        fromHouse: "10",
        toHouse: "5",
      },
      {
        at: 0.65,
        icon: "📚",
        text: "नया सीखने का Phase",
        sub: "Jan 2026 — 1.5 years",
        type: "window",
      },
      {
        at: 0.85,
        icon: "🏆",
        text: "Lasting Results",
        sub: "Skills now = Career next level",
        type: "highlight",
      },
    ],
    chatReplies: {
      health:
        "मैं हड्डियों और जोड़ों का कारक हूँ। अगर घुटने या कमर में दर्द है तो सरसों का तेल लगाओ। जब मेरा transit बदलेगा, राहत आएगी।",
      career:
        "मैं आपके दसवें भाव में बैठा हूँ — career मेरा domain है। Slow but solid growth होगी। 2-3 साल में बड़ा promotion पक्का। Shortcuts मत लो।",
      default:
        "मैं शनि हूँ — discipline और karma का देवता। जो सवाल है पूछो, पर याद रखो — मेरे जवाब honest होते हैं, comfortable नहीं।",
    },
  },
  {
    id: "Jupiter",
    glyph: "♃",
    label: "गुरु",
    house: "5th House",
    strength: 0.85,
    orbitRadius: 0.56,
    speed: 160,
    startAngle: 144,
    color: "#5555ff",
    glowColor: "rgba(53,53,243,0.3)",
    size: 44,
    speaker: "advait",
    title: "गुरु — Your Expansion",
    subtitle: "The wisdom you carry within",
    narration: `मैं गुरु हूँ — बृहस्पति। शिवाली जी, आपकी chart में मैं पाँचवें घर में बैठा हूँ — wisdom, creativity और deep understanding वाला घर। इसकी वजह से आपमें एक natural intelligence है — आप चीज़ों को surface पर नहीं, deeper level पर समझती हैं। आपकी advice लोग इसलिए मानते हैं क्योंकि आप genuinely समझकर बोलती हैं। और अभी सबसे exciting बात — मैं इस वक़्त आपके नवें घर में हूँ, भाग्य और higher learning वाले घर में। इसीलिए last कुछ महीनों में आपने feel किया होगा कि perspective broaden हो रहा है — नई चीज़ें attract हो रही हैं, शायद travel या कोई नया knowledge area खिंच रहा है। लेकिन असली game-changer ये है — late 2026 में मैं आपके दसवें घर में enter करूँगा। दसवाँ घर — career, legacy, public impact। जब गुरु यहाँ आता है, तो professionally एक completely new chapter खुलता है। जो groundwork आप अभी कर रही हैं, उसका reward तब मिलेगा। ये आपके career का सबसे important 14-month window होने वाला है।`,
    storyBeats: [
      {
        at: 0.1,
        icon: "🏠",
        text: "पाँचवाँ भाव में गुरु",
        sub: "5th House · Wisdom & Creativity",
        type: "house",
      },
      {
        at: 0.28,
        icon: "🧠",
        text: "Natural Intelligence",
        sub: "Deep understanding · Genuine advice",
        type: "trait",
      },
      {
        at: 0.45,
        icon: "→",
        text: "Transit: पाँचवाँ → नवाँ भाव",
        sub: "भाग्य & Higher Learning",
        type: "transit",
        fromHouse: "5",
        toHouse: "9",
      },
      {
        at: 0.62,
        icon: "✈️",
        text: "Perspective Broadening",
        sub: "Travel · New knowledge areas",
        type: "highlight",
      },
      {
        at: 0.8,
        icon: "🚀",
        text: "Late 2026: दसवाँ भाव Entry",
        sub: "Career game-changer · 14-month window",
        type: "window",
      },
    ],
    chatReplies: {
      health:
        "मैं लिवर और weight का कारक हूँ। Overeating से बचो, हल्दी वाला दूध पियो। जब मैं strong position में होता हूँ, immunity अच्छी रहती है।",
      career:
        "Late 2026 में मैं आपके दसवें भाव में आ रहा हूँ — ये career का सबसे बड़ा window होगा। अभी groundwork करो, तब reward मिलेगा।",
      default:
        "मैं गुरु हूँ — ज्ञान और विस्तार का ग्रह। आपकी chart में मेरी position excellent है। जो भी सीखना है, अभी सीखो — timing perfect है।",
    },
  },
  {
    id: "Moon",
    glyph: "☽",
    label: "चन्द्र",
    house: "7th House",
    strength: 0.6,
    orbitRadius: 0.36,
    speed: 90,
    startAngle: 216,
    color: "rgba(200,200,220,0.9)",
    glowColor: "rgba(200,200,220,0.2)",
    size: 40,
    speaker: "aayan",
    title: "चन्द्रमा — Your Emotional Intelligence",
    subtitle: "The depth that makes your connections real",
    narration: `मैं चन्द्रमा हूँ। शिवाली जी, आपकी chart में मैं सातवें घर में बैठा हूँ — partnerships और close relationships वाले घर में। इसकी वजह से आपको एक rare strength मिलती है — emotional intelligence। आप लोगों की energy बिना उनके बोले read कर लेती हैं। कौन genuine है, कौन नहीं — ये आपको जल्दी समझ आता है। आपके relationships deep हैं क्योंकि आप surface level connections में interested ही नहीं हैं। मेरी ख़ासियत ये है कि मैं सबसे तेज़ चलता हूँ — हर ढाई दिन में sign बदलता हूँ। तो मेरा influence आप daily feel करती हैं। कुछ दिन ऐसे होते हैं जब आप emotionally बहुत clear होती हैं, decisions आसान लगते हैं — वो मेरे अच्छे दिन हैं। और कुछ दिन ऐसे होते हैं जब सब heavy लगता है, overthinking होती है — वो भी मेरा ही cycle है। ये जानना important है कि ये permanent नहीं है, ये rhythm है। और आपकी सबसे बड़ी strength ये है कि आप इन emotional waves को navigate करना जानती हैं — बहुत कम लोग ये कर पाते हैं।`,
    storyBeats: [
      {
        at: 0.1,
        icon: "🏠",
        text: "सातवाँ भाव में चंद्र",
        sub: "7th House · Partnerships",
        type: "house",
      },
      {
        at: 0.28,
        icon: "💡",
        text: "Emotional Intelligence",
        sub: "Energy read कर लेती हैं",
        type: "trait",
      },
      {
        at: 0.48,
        icon: "🔄",
        text: "हर 2.5 दिन Sign Change",
        sub: "Daily influence · Fastest planet",
        type: "transit",
      },
      {
        at: 0.68,
        icon: "🌊",
        text: "Emotional Rhythm",
        sub: "Clear days ↔ Heavy days = Normal cycle",
        type: "highlight",
      },
      {
        at: 0.85,
        icon: "🧭",
        text: "Rare Strength",
        sub: "Navigate emotional waves — बहुत कम लोग कर पाते हैं",
        type: "trait",
      },
    ],
    chatReplies: {
      health:
        "मैं मन और पानी का कारक हूँ। बेचैनी या नींद की दिक्कत हो तो सोने से पहले दूध पियो। जब मेरा cycle अच्छा होगा, मन शांत रहेगा।",
      love: "सातवें भाव में बैठा हूँ — relationships मेरा domain है। Deep connections आपकी strength है। Partner से soft tone में बात करो, misunderstanding से बचो।",
      default:
        "मैं चंद्रमा हूँ — मन और भावनाओं का स्वामी। हर 2.5 दिन मेरा mood बदलता है, और आपका भी। ये cycle समझो तो life easy हो जाती है।",
    },
  },
  {
    id: "Venus",
    glyph: "♀",
    label: "शुक्र",
    house: "4th House",
    strength: 0.7,
    orbitRadius: 0.48,
    speed: 140,
    startAngle: 288,
    color: "#9999ff",
    glowColor: "rgba(153,153,255,0.25)",
    size: 42,
    speaker: "manan",
    title: "शुक्र — Your Aesthetic Sense",
    subtitle: "The eye for beauty that comes naturally to you",
    narration: `मैं शुक्र हूँ। शिवाली जी, आपकी chart में मैं चौथे घर में बैठा हूँ — home, comfort और inner peace वाले घर में। इसकी वजह से आपमें एक refined taste है — aesthetics, design, music, कोई भी creative चीज़ — आपकी eye for detail remarkable है। आप जहाँ होती हैं वहाँ एक warmth create करती हैं, लोग आपके around comfortable feel करते हैं। और पिछले करीब एक साल से मैं आपके पाँचवें घर में हूँ — romance, creativity और self-expression वाले घर में। आपने ज़रूर महसूस किया होगा कि इस पूरे साल आपकी creative side काफ़ी active रही है — नए ideas आए हैं, चीज़ों को express करने का तरीक़ा बदला है, शायद love life में भी कुछ clarity आई है। ये सब इस placement का असर है। अभी कुछ महीने और हैं मेरे यहाँ — तो जो भी creative या personal goals हैं, उन्हें priority दीजिए। ये आपका golden phase है, पूरा फ़ायदा उठाइए।`,
    storyBeats: [
      {
        at: 0.1,
        icon: "🏠",
        text: "चौथा भाव में शुक्र",
        sub: "4th House · Home & Inner Peace",
        type: "house",
      },
      {
        at: 0.28,
        icon: "🎨",
        text: "Refined Taste",
        sub: "Aesthetics · Design · Eye for detail",
        type: "trait",
      },
      {
        at: 0.48,
        icon: "→",
        text: "Transit: चौथा → पाँचवाँ भाव",
        sub: "Romance & Self-Expression",
        type: "transit",
        fromHouse: "4",
        toHouse: "5",
      },
      {
        at: 0.68,
        icon: "💜",
        text: "Creative Side Active",
        sub: "New ideas · Expression changed · Love clarity",
        type: "highlight",
      },
      {
        at: 0.85,
        icon: "✨",
        text: "Golden Phase — कुछ महीने और",
        sub: "Creative + personal goals = priority",
        type: "window",
      },
    ],
    chatReplies: {
      health:
        "मैं skin और reproductive health का कारक हूँ। ज़्यादा मीठा avoid करो। जब मैं strong position में होता हूँ, natural glow आता है।",
      love: "मैं पाँचवें भाव में हूँ — romance मेरा zone है। अभी love life में clarity आने का phase है। Partner के साथ quality time spend करो।",
      career:
        "Creative fields मेरा domain है — design, art, beauty। अभी 5th house transit चल रहा है तो creative projects को priority दो।",
      default:
        "मैं शुक्र हूँ — सौंदर्य, प्रेम और comfort का ग्रह। ये आपका golden phase है — creative और personal goals पर focus करो।",
    },
  },
];

/* ── Pre-cache all planet audio chunks in background so tap → instant playback ── */
const prefetchPlanetAudio = () => {
  ORBIT_PLANETS.forEach((p) => {
    queuePrefetch(p.narration, "planet_" + p.id, p.speaker || "advait");
  });
};

/* ─────────────────────────────────────────
   useNarration — multi-chunk Sarvam TTS hook
   ───────────────────────────────────────── */
export function useNarration() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);

  // Split text into chunks under 480 chars at sentence boundaries
  const chunkText = (text: string): string[] => {
    if (text.length <= 480) return [text];
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= 480) {
        chunks.push(remaining);
        break;
      }
      const cut = remaining.substring(0, 480);
      let splitAt = -1;
      for (const sep of ["।", ".", "!", "?"]) {
        const idx = cut.lastIndexOf(sep);
        if (idx > 150 && idx > splitAt) splitAt = idx;
      }
      if (splitAt < 0) {
        for (const sep of [" — ", ", ", "— "]) {
          const idx = cut.lastIndexOf(sep);
          if (idx > 150) {
            splitAt = idx + sep.length - 1;
            break;
          }
        }
      }
      if (splitAt < 0) splitAt = 479;
      chunks.push(remaining.substring(0, splitAt + 1).trim());
      remaining = remaining.substring(splitAt + 1).trim();
    }
    return chunks;
  };

  // Fetch audio for a single chunk (with cache) — Sarvam
  const fetchChunkAudio = async (
    chunkStr: string,
    chunkKey: string,
    speaker: string,
  ): Promise<string | null> => {
    if (audioCache[chunkKey]) return audioCache[chunkKey];
    try {
      const blob = await _sarvamTTS(chunkStr, speaker);
      const src = URL.createObjectURL(blob);
      audioCache[chunkKey] = src;
      return src;
    } catch (e) {
      console.warn("Sarvam TTS error:", e);
      return null;
    }
  };

  const speak = useCallback(async (text: string, cacheKey: string, speaker = "advait") => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    cancelledRef.current = false;
    setSpeaking(true);
    setProgress(0);

    try {
      const chunks = chunkText(text);
      const totalChunks = chunks.length;

      for (let i = 0; i < totalChunks; i++) {
        if (cancelledRef.current) break;
        const chunkKey = totalChunks === 1 ? cacheKey : cacheKey + "_c" + i;
        const audioSrc = await fetchChunkAudio(chunks[i], chunkKey, speaker);
        if (!audioSrc || cancelledRef.current) break;

        // Play this chunk and wait for it to finish
        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          audio.ontimeupdate = () => {
            if (audio.duration) {
              const chunkProgress = audio.currentTime / audio.duration;
              setProgress((i + chunkProgress) / totalChunks);
            }
          };
          audio.onended = () => {
            audioRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            audioRef.current = null;
            reject();
          };
          audio.play().catch(reject);
        });
      }
    } catch (err) {
      console.warn("ElevenLabs TTS error:", err);
    }
    if (!cancelledRef.current) {
      setSpeaking(false);
      setProgress(0);
    }
  }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
    setProgress(0);
  }, []);

  const toggle = useCallback(
    (text: string, cacheKey: string, speaker?: string) => {
      if (speaking) {
        stop();
      } else {
        speak(text, cacheKey, speaker);
      }
    },
    [speaking, speak, stop],
  );

  return { speaking, progress, speak, stop, toggle };
}

/* ─────────────────────────────────────────
   PlanetImg — photorealistic planet SVGs
   ───────────────────────────────────────── */
const PlanetImg = ({ id, size }: { id: string; size: number }) => {
  const s = size;
  if (id === "Mars")
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="mars_g" cx="38%" cy="32%" r="55%">
            <stop offset="0%" stopColor="#ffaa77" />
            <stop offset="25%" stopColor="#ee7744" />
            <stop offset="55%" stopColor="#cc4422" />
            <stop offset="80%" stopColor="#882211" />
            <stop offset="100%" stopColor="#441100" />
          </radialGradient>
          <radialGradient id="mars_hl" cx="30%" cy="25%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#mars_g)" />
        <ellipse cx="38" cy="40" rx="14" ry="5" fill="rgba(100,30,10,0.35)" />
        <ellipse cx="60" cy="58" rx="18" ry="4" fill="rgba(120,40,15,0.25)" />
        <ellipse cx="45" cy="30" rx="8" ry="3" fill="rgba(160,60,20,0.2)" />
        <circle cx="50" cy="50" r="48" fill="url(#mars_hl)" />
      </svg>
    );
  if (id === "Saturn")
    return (
      <svg width={s * 1.8} height={s} viewBox="0 0 180 100">
        <defs>
          <radialGradient id="sat_g" cx="38%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#d4c898" />
            <stop offset="30%" stopColor="#b0a070" />
            <stop offset="60%" stopColor="#7a7050" />
            <stop offset="85%" stopColor="#3a3528" />
            <stop offset="100%" stopColor="#1a1510" />
          </radialGradient>
          <radialGradient id="sat_hl" cx="35%" cy="28%" r="28%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="ring_g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(160,140,100,0.05)" />
            <stop offset="15%" stopColor="rgba(180,160,120,0.5)" />
            <stop offset="30%" stopColor="rgba(140,120,80,0.2)" />
            <stop offset="45%" stopColor="rgba(200,180,140,0.55)" />
            <stop offset="55%" stopColor="rgba(160,140,100,0.15)" />
            <stop offset="70%" stopColor="rgba(180,160,120,0.5)" />
            <stop offset="85%" stopColor="rgba(140,130,100,0.3)" />
            <stop offset="100%" stopColor="rgba(160,140,100,0.05)" />
          </linearGradient>
        </defs>
        <ellipse
          cx="90"
          cy="52"
          rx="85"
          ry="18"
          fill="none"
          stroke="url(#ring_g)"
          strokeWidth="10"
          opacity="0.6"
        />
        <circle cx="90" cy="50" r="32" fill="url(#sat_g)" />
        <ellipse cx="90" cy="40" rx="30" ry="3" fill="rgba(160,140,100,0.12)" />
        <ellipse cx="90" cy="50" rx="31" ry="2.5" fill="rgba(140,120,80,0.1)" />
        <ellipse cx="90" cy="58" rx="29" ry="2" fill="rgba(160,140,100,0.08)" />
        <circle cx="90" cy="50" r="32" fill="url(#sat_hl)" />
        <ellipse
          cx="90"
          cy="52"
          rx="85"
          ry="18"
          fill="none"
          stroke="url(#ring_g)"
          strokeWidth="10"
          opacity="0.6"
          style={{ clipPath: "inset(52% 0 0 0)" }}
        />
      </svg>
    );
  if (id === "Jupiter")
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="jup_g" cx="38%" cy="32%" r="55%">
            <stop offset="0%" stopColor="#c8b898" />
            <stop offset="20%" stopColor="#b8956a" />
            <stop offset="50%" stopColor="#8a6840" />
            <stop offset="80%" stopColor="#4a3820" />
            <stop offset="100%" stopColor="#1a1008" />
          </radialGradient>
          <radialGradient id="jup_hl" cx="32%" cy="26%" r="28%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#jup_g)" />
        <ellipse cx="50" cy="28" rx="46" ry="4" fill="rgba(200,170,120,0.2)" />
        <ellipse cx="50" cy="38" rx="47" ry="5" fill="rgba(180,140,90,0.15)" />
        <ellipse cx="50" cy="48" rx="47" ry="3.5" fill="rgba(220,190,140,0.18)" />
        <ellipse cx="50" cy="56" rx="46" ry="4.5" fill="rgba(160,120,70,0.12)" />
        <ellipse cx="50" cy="66" rx="45" ry="3" fill="rgba(200,170,120,0.15)" />
        <ellipse cx="62" cy="55" rx="8" ry="5" fill="rgba(180,80,40,0.3)" />
        <circle cx="50" cy="50" r="48" fill="url(#jup_hl)" />
      </svg>
    );
  if (id === "Moon")
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="moon_g" cx="40%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#e8e8ee" />
            <stop offset="25%" stopColor="#c8c8d0" />
            <stop offset="55%" stopColor="#9898a4" />
            <stop offset="80%" stopColor="#606070" />
            <stop offset="100%" stopColor="#303038" />
          </radialGradient>
          <radialGradient id="moon_hl" cx="32%" cy="28%" r="25%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#moon_g)" />
        <circle cx="35" cy="38" r="10" fill="rgba(80,80,90,0.2)" />
        <circle cx="55" cy="30" r="7" fill="rgba(80,80,90,0.15)" />
        <circle cx="45" cy="55" r="12" fill="rgba(80,80,90,0.18)" />
        <circle cx="65" cy="50" r="6" fill="rgba(80,80,90,0.12)" />
        <circle cx="30" cy="60" r="5" fill="rgba(80,80,90,0.1)" />
        <circle cx="60" cy="65" r="8" fill="rgba(80,80,90,0.14)" />
        <circle cx="50" cy="50" r="48" fill="url(#moon_hl)" />
      </svg>
    );
  if (id === "Venus")
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="ven_g" cx="40%" cy="33%" r="55%">
            <stop offset="0%" stopColor="#ede8d8" />
            <stop offset="25%" stopColor="#d8d0b8" />
            <stop offset="50%" stopColor="#b8a888" />
            <stop offset="80%" stopColor="#787060" />
            <stop offset="100%" stopColor="#383430" />
          </radialGradient>
          <radialGradient id="ven_hl" cx="34%" cy="28%" r="26%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#ven_g)" />
        <ellipse
          cx="45"
          cy="40"
          rx="25"
          ry="8"
          fill="rgba(220,210,180,0.12)"
          transform="rotate(-15 45 40)"
        />
        <ellipse
          cx="55"
          cy="55"
          rx="22"
          ry="6"
          fill="rgba(200,190,160,0.1)"
          transform="rotate(10 55 55)"
        />
        <ellipse
          cx="40"
          cy="60"
          rx="18"
          ry="5"
          fill="rgba(210,200,170,0.08)"
          transform="rotate(-8 40 60)"
        />
        <circle cx="50" cy="50" r="48" fill="url(#ven_hl)" />
      </svg>
    );
  if (id === "Sun")
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="sun_g" cx="45%" cy="42%" r="50%">
            <stop offset="0%" stopColor="#fff8e0" />
            <stop offset="15%" stopColor="#ffdd55" />
            <stop offset="35%" stopColor="#ffaa22" />
            <stop offset="55%" stopColor="#ee7711" />
            <stop offset="75%" stopColor="#cc4400" />
            <stop offset="100%" stopColor="#661800" />
          </radialGradient>
          <radialGradient id="sun_hl" cx="38%" cy="32%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="sun_corona" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="rgba(255,170,0,0)" />
            <stop offset="85%" stopColor="rgba(255,170,0,0.08)" />
            <stop offset="100%" stopColor="rgba(255,170,0,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#sun_corona)" />
        <circle cx="50" cy="50" r="44" fill="url(#sun_g)" />
        <circle cx="38" cy="38" r="6" fill="rgba(255,200,50,0.15)" />
        <circle cx="55" cy="35" r="8" fill="rgba(255,180,30,0.1)" />
        <circle cx="42" cy="55" r="7" fill="rgba(255,190,40,0.12)" />
        <circle cx="60" cy="55" r="5" fill="rgba(255,170,20,0.1)" />
        <circle cx="48" cy="48" r="4" fill="rgba(150,60,0,0.2)" />
        <circle cx="56" cy="52" r="3" fill="rgba(150,60,0,0.15)" />
        <circle cx="50" cy="50" r="44" fill="url(#sun_hl)" />
      </svg>
    );
  return null;
};

/* ── Planet particle effects ── */
const PlanetParticles = ({ planetId, size }: { planetId: string; size: number }) => {
  if (planetId === "Mars")
    return (
      <>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${50 + Math.sin(i * 0.8) * 45}%`,
              left: `${50 + Math.cos(i * 1.2) * 45}%`,
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              borderRadius: "50%",
              background: `rgba(255,${80 + Math.random() * 60},0,${0.3 + Math.random() * 0.4})`,
              animation: `flameSpark ${1 + Math.random()}s ease-out ${i * 0.2}s infinite`,
              filter: "blur(1px)",
            }}
          />
        ))}
      </>
    );
  if (planetId === "Saturn")
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: size * (1.4 + i * 0.3),
              height: size * (0.35 + i * 0.08),
              borderRadius: "50%",
              border: `1px solid rgba(200,190,160,${0.12 - i * 0.03})`,
              transform: "translate(-50%,-50%) rotateX(75deg)",
              animation: `ringWave ${3 + i}s ease-in-out ${i * 0.5}s infinite alternate`,
            }}
          />
        ))}
      </>
    );
  if (planetId === "Jupiter")
    return (
      <div
        style={{
          position: "absolute",
          inset: -20,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(53,53,243,0.15) 0%, rgba(255,215,0,0.08) 40%, transparent 70%)",
          animation: "jupiterAura 3s ease-in-out infinite alternate",
        }}
      />
    );
  if (planetId === "Moon")
    return (
      <div
        style={{
          position: "absolute",
          inset: -15,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,200,220,0.12) 0%, transparent 60%)",
          animation: "moonTide 4s ease-in-out infinite alternate",
        }}
      />
    );
  if (planetId === "Venus")
    return (
      <>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${30 + Math.random() * 40}%`,
              left: `${30 + Math.random() * 40}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: `rgba(200,180,255,${0.2 + Math.random() * 0.4})`,
              animation: `venusShimmer ${2 + Math.random() * 2}s ease-in-out ${i * 0.3}s infinite alternate`,
            }}
          />
        ))}
      </>
    );
  return null;
};

/* ─────────────────────────────────────────
   LivingSolarSystem — animated SVG/CSS elliptical solar system
   ───────────────────────────────────────── */
export function LivingSolarSystem({
  onPlanetClick,
}: {
  onPlanetClick: (planet: OrbitPlanet) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const [hintPlanet, setHintPlanet] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef({ dragging: false, startX: 0, startOffset: 0 });
  const SIZE = 320;
  const CX = SIZE / 2,
    CY = SIZE / 2;

  // Animation loop
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setTime((t) => t + 0.06);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pre-cache all planet audio on mount so tap → instant playback
  useEffect(() => {
    prefetchPlanetAudio();
  }, []);

  // Hint: strongest planet pulses after 4s idle
  useEffect(() => {
    const timer = setTimeout(() => {
      const strongest = ORBIT_PLANETS.reduce((a, b) => (a.strength > b.strength ? a : b));
      setHintPlanet(strongest.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Drag to rotate
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startOffset: dragOffset };
    setHintPlanet(null);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    setDragOffset(dragRef.current.startOffset + dx * 0.5);
  };
  const onPointerUp = () => {
    dragRef.current.dragging = false;
  };

  return (
    <div
      style={{
        margin: "0 16px",
        borderRadius: 24,
        overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 40%, #0c0028 0%, #050014 40%, #020008 100%)",
        padding: "20px 0 12px",
        position: "relative",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 0 60px rgba(53,53,243,0.05)",
        animation: "fadeInUp 600ms ease-out 500ms both",
      }}
    >
      {/* Starfield */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            borderRadius: "50%",
            background: `rgba(255,255,255,${0.08 + Math.random() * 0.2})`,
            animation:
              i % 7 === 0 ? `breathe ${3 + Math.random() * 2}s ease-in-out infinite` : "none",
          }}
        />
      ))}

      {/* Orbit container */}
      <div
        ref={containerRef}
        style={{
          width: SIZE,
          height: SIZE,
          margin: "0 auto",
          position: "relative",
          cursor: "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Orbit rings */}
        {ORBIT_PLANETS.map((p) => (
          <div
            key={p.id + "_ring"}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: SIZE * p.orbitRadius * 2,
              height: SIZE * p.orbitRadius * 2,
              borderRadius: "50%",
              border: `1px solid rgba(255,255,255,${0.04 + p.strength * 0.03})`,
              transform: "translate(-50%,-50%)",
            }}
          />
        ))}

        {/* Center zodiac core */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 40% 35%, #6040cc, #3900ad 50%, #1a0066 100%)",
              boxShadow: "0 0 25px 8px rgba(53,53,243,0.3), 0 0 50px 15px rgba(53,53,243,0.1)",
              border: "2px solid rgba(153,153,255,0.3)",
              animation: "breathe 4s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 24, color: "rgba(255,255,255,0.9)" }}>♏</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "rgba(153,153,255,0.6)",
                letterSpacing: 0.5,
              }}
            >
              Shivali
            </span>
          </div>
        </div>

        {/* Orbiting planets */}
        {ORBIT_PLANETS.map((planet) => {
          const angle =
            (time / planet.speed + planet.startAngle / 360 + dragOffset / 360) * Math.PI * 2;
          const rx = SIZE * planet.orbitRadius;
          const ry = SIZE * planet.orbitRadius * 0.6; // elliptical
          const px = CX + Math.cos(angle) * rx - planet.size / 2;
          const py = CY + Math.sin(angle) * ry - planet.size / 2;
          const isHint = hintPlanet === planet.id;
          const scale = 0.7 + planet.strength * 0.3;

          return (
            <div
              key={planet.id}
              onClick={(e) => {
                e.stopPropagation();
                setHintPlanet(null);
                onPlanetClick(planet);
              }}
              style={{
                position: "absolute",
                left: px,
                top: py,
                width: planet.size,
                height: planet.size,
                zIndex: 10,
                cursor: "pointer",
                transition: "filter 200ms",
                transform: `scale(${scale})`,
                filter: isHint ? "brightness(1.5)" : "none",
              }}
            >
              {/* Glow */}
              <div
                style={{
                  position: "absolute",
                  inset: -planet.size * 0.4,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${planet.glowColor} 0%, transparent 65%)`,
                  animation: `breathe ${3 + planet.strength}s ease-in-out infinite`,
                  opacity: 0.5 + planet.strength * 0.5,
                }}
              />
              {/* Tappable ring indicator */}
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: "50%",
                  border: `1.5px dashed rgba(255,255,255,${isHint ? 0.4 : 0.12})`,
                  animation: isHint ? "breathe 1.5s ease-in-out infinite" : "none",
                }}
              />
              {/* Planet orb — SVG */}
              <div
                style={{
                  position: "relative",
                  filter: `drop-shadow(0 0 ${4 + planet.strength * 8}px ${planet.glowColor})`,
                }}
              >
                <PlanetImg id={planet.id} size={planet.size} />
              </div>
              {/* Label with house */}
              <div style={{ textAlign: "center", marginTop: 3, minWidth: 60 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: `rgba(255,255,255,${0.4 + planet.strength * 0.4})`,
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  {planet.label}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.2)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  }}
                >
                  {planet.house}
                </div>
              </div>
              {/* Hint badge */}
              {isHint && (
                <div
                  style={{
                    position: "absolute",
                    top: -16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    animation: "fadeInUp 400ms ease-out both",
                  }}
                >
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: planet.color,
                      background: "rgba(0,0,0,0.7)",
                      padding: "3px 10px",
                      borderRadius: 10,
                      border: `1px solid ${planet.glowColor}`,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ✦ Tap to listen
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom label */}
      <div style={{ textAlign: "center", marginTop: 14, padding: "0 20px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.5,
            letterSpacing: 0.2,
          }}
        >
          Shivali ka Graha Mandal — tap any planet to hear its message for you
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PlanetStoryCapsule — full-screen overlay
   ───────────────────────────────────────── */
const matchPlanetChatCategory = (text: string): string => {
  const t = text.toLowerCase();
  if (/bimar|health|sehat|tabiyat|doctor|pet|sir|dard|neend|bimari/.test(t)) return "health";
  if (/career|naukri|job|boss|promotion|kaam|office|business/.test(t)) return "career";
  if (/pyar|love|partner|shaadi|rishta|relation|husband|wife|boyfriend|girlfriend/.test(t))
    return "love";
  return "default";
};

interface PlanetStoryCapsuleProps {
  planet: OrbitPlanet;
  onClose: () => void;
  onNext?: (() => void) | null;
  onPrev?: (() => void) | null;
  currentIndex: number;
  total: number;
}

export function PlanetStoryCapsule({
  planet,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  total,
}: PlanetStoryCapsuleProps) {
  const { speaking, progress, speak, stop, toggle } = useNarration();
  const [phase, setPhase] = useState<"intro" | "story" | "done">("intro");
  const [visibleBeats, setVisibleBeats] = useState<number[]>([]);
  const [activeBeatIdx, setActiveBeatIdx] = useState(-1);
  const shownBeats = useRef(new Set<number>());
  const contentRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "planet"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSpeaking, setChatSpeaking] = useState(false);
  const chatAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopChatAudio = () => {
    if (chatAudioRef.current) {
      try {
        chatAudioRef.current.pause();
        chatAudioRef.current.currentTime = 0;
      } catch (e) {}
      chatAudioRef.current = null;
    }
  };

  // Phase 1: Cinematic intro (5s) → then start narration
  useEffect(() => {
    shownBeats.current = new Set();
    setVisibleBeats([]);
    setActiveBeatIdx(-1);
    setPhase("intro");
    setChatMessages([]);

    const introTimer = setTimeout(() => {
      setPhase("story");
      speak(planet.narration, "planet_" + planet.id, planet.speaker || "advait");
    }, 5000);

    return () => {
      clearTimeout(introTimer);
      stop();
      stopChatAudio();
    };
  }, [planet.id]);

  // Track progress → trigger beats
  useEffect(() => {
    if (phase !== "story" || !planet.storyBeats) return;
    planet.storyBeats.forEach((beat, i) => {
      if (progress >= beat.at && !shownBeats.current.has(i)) {
        shownBeats.current.add(i);
        setVisibleBeats((prev) => [...prev, i]);
        setActiveBeatIdx(i);
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollTo({
              top: contentRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    });
    // When narration ends
    if (!speaking && progress === 0 && visibleBeats.length > 0) {
      setPhase("done");
    }
  }, [progress, speaking, phase]);

  const handleChatSend = async (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg || chatSpeaking) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);

    const cat = matchPlanetChatCategory(msg);
    const replies = planet.chatReplies || {};
    const reply = replies[cat] || replies.default || "इस बारे में मैं आपको जल्दी बताऊंगा।";

    setChatSpeaking(true);
    setChatMessages((prev) => [...prev, { role: "planet", text: reply }]);

    try {
      const cacheKey = "pchat_" + planet.id + "_" + cat;
      if (audioCache[cacheKey]) {
        const audio = new Audio(audioCache[cacheKey]);
        chatAudioRef.current = audio;
        await new Promise<void>((r) => {
          audio.onended = () => r();
          audio.onerror = () => r();
          audio.play().catch(() => r());
        });
      } else {
        const voiceId = mapSpeaker(planet.speaker || "advait");
        try {
          const blob = await _sarvamTTS(reply, voiceId);
          const src = URL.createObjectURL(blob);
          audioCache[cacheKey] = src;
          const audio = new Audio(src);
          chatAudioRef.current = audio;
          await new Promise<void>((r) => {
            audio.onended = () => r();
            audio.onerror = () => r();
            audio.play().catch(() => r());
          });
        } catch (err) {
          console.warn("Sarvam TTS failed:", err);
        }
      }
    } catch (e) {
      console.warn("Chat TTS error:", e);
    }
    chatAudioRef.current = null;
    setChatSpeaking(false);

    setTimeout(() => {
      if (contentRef.current)
        contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const bgMap: Record<string, string> = {
    Mars: "radial-gradient(ellipse at 50% 30%, #2a0800 0%, #0d0200 60%, #050100 100%)",
    Saturn: "radial-gradient(ellipse at 50% 30%, #15150f 0%, #0a0a08 60%, #030303 100%)",
    Jupiter: "radial-gradient(ellipse at 50% 30%, #0a0a30 0%, #050518 60%, #020208 100%)",
    Moon: "radial-gradient(ellipse at 50% 30%, #10101a 0%, #080810 60%, #030306 100%)",
    Venus: "radial-gradient(ellipse at 50% 30%, #14101e 0%, #0a0810 60%, #040306 100%)",
  };

  const beatTypeStyles: Record<string, { bg: string; border: string }> = {
    house: { bg: `${planet.color}12`, border: `${planet.color}25` },
    trait: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
    transit: { bg: "rgba(245,208,96,0.08)", border: "rgba(245,208,96,0.2)" },
    highlight: { bg: `${planet.color}10`, border: `${planet.color}20` },
    window: { bg: "rgba(78,205,196,0.06)", border: "rgba(78,205,196,0.15)" },
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        background: bgMap[planet.id] || bgMap.Mars,
        animation: "fadeIn 400ms ease-out both",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          background: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: 18, color: planet.color }}>{planet.glyph}</span>
        <span
          style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginLeft: 8 }}
        >
          {planet.label}
        </span>
        {speaking && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 10 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ff3c3c",
                animation: "breathe 1.5s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#ff5c5c" }}>LIVE</span>
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div
          onClick={() => toggle(planet.narration, "planet_" + planet.id, planet.speaker)}
          data-interactive
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            marginRight: 8,
            background: speaking ? `${planet.color}20` : "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 15,
            color: speaking ? planet.color : "rgba(255,255,255,0.5)",
          }}
        >
          {speaking ? "🔊" : "🔇"}
        </div>
        <div
          onClick={() => {
            stop();
            stopChatAudio();
            onClose();
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          ✕
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 3, padding: "8px 16px", background: "rgba(0,0,0,0.2)" }}>
        {[...Array(total)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2.5,
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
              background: i < currentIndex ? planet.color : "rgba(255,255,255,0.1)",
            }}
          >
            {i === currentIndex && speaking && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: planet.color,
                  width: `${progress * 100}%`,
                  transition: "width 200ms linear",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflow: "auto" }}>
        {/* PHASE 1: Cinematic planet entrance (5s) */}
        <div
          style={{
            padding: "40px 20px 20px",
            textAlign: "center",
            animation: "fadeInUp 800ms ease-out both",
          }}
        >
          {/* Large planet with dramatic glow */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
              position: "relative",
              height: planet.id === "Saturn" ? 140 : 170,
            }}
          >
            <div style={{ position: "relative" }}>
              <PlanetParticles planetId={planet.id} size={150} />
              <div
                style={{
                  position: "absolute",
                  inset: -40,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${planet.glowColor} 0%, transparent 60%)`,
                  animation:
                    phase === "intro"
                      ? "breathe 2s ease-in-out infinite"
                      : "breathe 3s ease-in-out infinite",
                  transform: phase === "intro" ? "scale(1.2)" : "scale(1)",
                  transition: "transform 1s ease",
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  filter: `drop-shadow(0 0 20px ${planet.glowColor}) drop-shadow(0 0 40px ${planet.glowColor})`,
                  animation: phase === "intro" ? "fadeInScale 1.2s ease-out both" : "none",
                }}
              >
                <PlanetImg id={planet.id} size={planet.id === "Saturn" ? 90 : 150} />
              </div>
            </div>
          </div>

          {/* Title + subtitle */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: planet.color,
              textTransform: "uppercase",
              letterSpacing: 2,
              animation: "fadeInUp 600ms ease-out 400ms both",
            }}
          >
            {planet.title}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "rgba(255,255,255,0.95)",
              marginTop: 8,
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
              animation: "fadeInUp 600ms ease-out 600ms both",
            }}
          >
            {planet.subtitle}
          </div>

          {/* House + Strength */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 16,
              animation: "fadeInUp 600ms ease-out 800ms both",
            }}
          >
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                background: `${planet.color}15`,
                border: `1px solid ${planet.color}25`,
                fontSize: 11,
                fontWeight: 600,
                color: planet.color,
              }}
            >
              {planet.house}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${planet.strength * 100}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: planet.color,
                    animation: "fillBar 1s ease-out 1s both",
                  }}
                />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: planet.color }}>
                {planet.strength >= 0.9
                  ? "Dominant"
                  : planet.strength >= 0.75
                    ? "Strong"
                    : "Moderate"}
              </span>
            </div>
          </div>

          {/* Intro loading dots */}
          {phase === "intro" && (
            <div style={{ marginTop: 24, animation: "fadeInUp 500ms ease-out 1.5s both" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: planet.color,
                      animation: "breathe 1s ease-in-out infinite",
                      animationDelay: d * 0.2 + "s",
                      opacity: 0.5,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>
                {planet.label} बोलने की तैयारी कर रहा है...
              </div>
            </div>
          )}
        </div>

        {/* PHASE 2: Visual story beats (synced to narration) */}
        {phase !== "intro" && visibleBeats.length > 0 && (
          <div style={{ padding: "0 16px" }}>
            {planet.storyBeats &&
              planet.storyBeats.map((beat, i) => {
                if (!visibleBeats.includes(i)) return null;
                const isLatest = i === activeBeatIdx;
                const bStyle = beatTypeStyles[beat.type] || beatTypeStyles.trait;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px",
                      borderRadius: 16,
                      marginBottom: 8,
                      background: isLatest ? bStyle.bg : "rgba(255,255,255,0.02)",
                      border: "1px solid " + (isLatest ? bStyle.border : "rgba(255,255,255,0.04)"),
                      animation: "fadeInUp 400ms ease-out both",
                      opacity: isLatest ? 1 : 0.5,
                      transition: "opacity 400ms ease, background 400ms ease",
                    }}
                  >
                    {/* Transit arrow visual */}
                    {beat.type === "transit" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: planet.color + "20",
                            border: "1px solid " + planet.color + "30",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            color: planet.color,
                          }}
                        >
                          {beat.fromHouse || "?"}
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#f5d060",
                            animation: isLatest ? "breathe 1.5s ease-in-out infinite" : "none",
                          }}
                        >
                          →
                        </div>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(245,208,96,0.15)",
                            border: "1px solid rgba(245,208,96,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#f5d060",
                          }}
                        >
                          {beat.toHouse || "?"}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: isLatest ? planet.color + "20" : "rgba(255,255,255,0.03)",
                          border:
                            "1px solid " +
                            (isLatest ? planet.color + "25" : "rgba(255,255,255,0.06)"),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          boxShadow: isLatest ? "0 0 12px " + planet.color + "15" : "none",
                        }}
                      >
                        {beat.icon}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isLatest
                            ? beat.type === "transit"
                              ? "#f5d060"
                              : planet.color
                            : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {beat.text}
                      </div>
                      {beat.sub && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 400,
                            color: "rgba(255,255,255,0.35)",
                            marginTop: 2,
                          }}
                        >
                          {beat.sub}
                        </div>
                      )}
                    </div>
                    {isLatest && speaking && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: planet.color,
                          animation: "breathe 1s ease-in-out infinite",
                        }}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* PHASE 3: Planet chat */}
        {phase !== "intro" && (
          <div style={{ padding: "12px 16px 24px" }}>
            {/* Chat messages */}
            {chatMessages.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {chatMessages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div
                      key={i}
                      style={{
                        alignSelf: "flex-end",
                        maxWidth: "80%",
                        padding: "8px 12px",
                        borderRadius: "14px 14px 4px 14px",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.8)",
                        animation: "fadeInUp 300ms ease-out both",
                      }}
                    >
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      key={i}
                      style={{
                        alignSelf: "flex-start",
                        maxWidth: "85%",
                        animation: "fadeInUp 300ms ease-out both",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
                      >
                        <span style={{ fontSize: 14 }}>{planet.glyph}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: planet.color }}>
                          {planet.label}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: "4px 14px 14px 14px",
                          background: `${planet.color}10`,
                          border: `1px solid ${planet.color}18`,
                          fontSize: 12,
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.6,
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ),
                )}
                {chatSpeaking && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: planet.color,
                          animation: "breathe 0.8s ease-in-out infinite",
                          animationDelay: d * 0.15 + "s",
                        }}
                      />
                    ))}
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                      बोल रहा है...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Suggested question chips */}
            {chatMessages.length === 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {[
                  { text: "मेरी सेहत कैसी रहेगी?", cat: "health" },
                  { text: "करियर में क्या होगा?", cat: "career" },
                  { text: "और बताइए...", cat: "default" },
                ].map((q, i) => (
                  <div
                    key={i}
                    onClick={() => handleChatSend(q.text)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: `${planet.color}12`,
                      border: `1px solid ${planet.color}25`,
                      fontSize: 11,
                      fontWeight: 500,
                      color: planet.color,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {q.text}
                  </div>
                ))}
              </div>
            )}

            {/* Chat input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{planet.glyph}</span>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChatSend();
                }}
                placeholder={planet.label + " से कुछ पूछें..."}
                data-interactive
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "Outfit, sans-serif",
                }}
              />
              <div
                onClick={() => handleChatSend()}
                data-interactive
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: chatInput.trim()
                    ? `linear-gradient(135deg, ${planet.color}, ${planet.color}cc)`
                    : "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: chatInput.trim() ? "pointer" : "default",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: chatInput.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                  }}
                >
                  ➤
                </span>
              </div>
            </div>

            {/* Navigation hint */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {onPrev && "← "}tap sides for next planet{onNext && " →"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
