"use client";

import { useCallback, useRef, useState } from "react";

import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import { ClipCard, type ClipData } from "../_components/ClipCard";

// ── Language config ───────────────────────────────────────────────────────────

type Language = {
  id: string;
  label: string;
  native: string;
  region: string;
  accent: string;
  iconBg: string;
  flag: string;
};

const LANGUAGES: Language[] = [
  {
    id: "bhojpuri",
    label: "Bhojpuri",
    native: "भोजपुरी",
    region: "Bihar · Purvanchal · Eastern UP",
    accent: "Rasgulla accent",
    iconBg: "bg-[#fef3c7]",
    flag: "🏔️",
  },
  {
    id: "marathi",
    label: "Marathi",
    native: "मराठी",
    region: "Maharashtra · Mumbai · Pune",
    accent: "Maharashtrian warmth",
    iconBg: "bg-[#fff7ed]",
    flag: "🟧",
  },
  {
    id: "tamil",
    label: "Tamil",
    native: "தமிழ்",
    region: "Tamil Nadu · Chennai · Coimbatore",
    accent: "Chennai swagger",
    iconBg: "bg-[#fde8ea]",
    flag: "⭐",
  },
  {
    id: "punjabi",
    label: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    region: "Punjab · Delhi · Chandigarh",
    accent: "Punjabi energy",
    iconBg: "bg-[#f0fdf4]",
    flag: "🌾",
  },
  {
    id: "gujarati",
    label: "Gujarati",
    native: "ગુજરાતી",
    region: "Gujarat · Surat · Ahmedabad",
    accent: "Gujju entrepreneur tone",
    iconBg: "bg-[#ecf7ff]",
    flag: "💼",
  },
  {
    id: "bengali",
    label: "Bengali",
    native: "বাংলা",
    region: "West Bengal · Kolkata",
    accent: "Bong intellectual",
    iconBg: "bg-[#f6f3ff]",
    flag: "🐟",
  },
];

const CLIPS: Record<string, ClipData[]> = {
  bhojpuri: [
    {
      jokeText:
        "Ek thaa lalanwa, master ji se puchis — 'Gurujee, padhai kara ke ka hoi?' Master ji bolein — 'Beta, naukri milii.' Lalanwa phir puchis — 'Aur naukri se ka hoi?' Master ji bolein — 'Tani soch le pehle.'",
      punchline: "Bhojpuri mein philosophy bhi seedhi hoti hai. 😂",
      voiceTag: "Bhojpuri babu voice",
      tone: "Classic",
      imageBg: "bg-[#92400e]",
      imageEmoji: "🏔️",
      durationSec: 23,
      lang: "Bhojpuri",
    },
    {
      jokeText:
        "Rani ke papa se puchli — 'Damad kaisan chahiin?' Papa bolein — 'Jo hamar beti ke nak naa katawwe.' Rani boli — 'Toh phir aapna naak mat katao. Seedha match karo.'",
      punchline: "Bhojpuri mein comeback bhi dhamakedar hota hai. 🎯",
      voiceTag: "Village chacha voice",
      tone: "Warm",
      imageBg: "bg-[#b45309]",
      imageEmoji: "🎯",
      durationSec: 25,
      lang: "Bhojpuri",
    },
  ],
  marathi: [
    {
      jokeText:
        "Ekda ek manoos doctor kade gela. Doctor mhanaala, 'Tumhala rest ghyayla haave.' Tya manushine vicharla, 'Kiti diwas?' Doctor mhanaala, 'Baaghaa, tumchi wife saangte ti.' Ha mazaa aala!",
      punchline: "Maharashtra mein doctor pण sarkaari sahayata karato. 😂",
      voiceTag: "Pune uncle voice",
      tone: "Warm",
      imageBg: "bg-[#ea580c]",
      imageEmoji: "🟧",
      durationSec: 22,
      lang: "Marathi",
    },
    {
      jokeText:
        "Baap mulaala mhanaala — 'Padha, naahi tar rikshawala hoishil.' Mula mhanaala — 'Baba, rikshawalyanna tumbhyapeksha jaast milat.' Tyalaa scholarship milali.",
      punchline: "Marathi wisdom — life mein numbers mahtvache. 📊",
      voiceTag: "Mumbai Marathi voice",
      tone: "Dry",
      imageBg: "bg-[#c2410c]",
      imageEmoji: "📊",
      durationSec: 20,
      lang: "Marathi",
    },
  ],
  tamil: [
    {
      jokeText:
        "Oru paiyyan doctor-kita ponan. Doctor keetan — 'Enna problem?' Paiyyan sonnan — 'Thoongave maaten.' Doctor sonnan — 'Yen?' Paiyyan — 'Neengal bill ezhudhadhum thoonga mattaen nu bayam.'",
      punchline: "Chennai hospital fees — nightmare fuel since 1990. 😅",
      voiceTag: "Chennai office voice",
      tone: "Dry",
      imageBg: "bg-[#dc2626]",
      imageEmoji: "⭐",
      durationSec: 21,
      lang: "Tamil",
    },
    {
      jokeText:
        "Appa kita keten — 'Naalu perum naambala vittu poacha, yen?' Appa sonnan — 'Dei, naalaiyum engineering poduvaan-nu bayandhu ponaanga.' Ellaarum engineer.",
      punchline: "TN engineering culture — global phenomenon. 🎓",
      voiceTag: "Madurai warmth",
      tone: "Relatable",
      imageBg: "bg-[#991b1b]",
      imageEmoji: "🎓",
      durationSec: 23,
      lang: "Tamil",
    },
  ],
  punjabi: [
    {
      jokeText:
        "Sardar ji daa munda pehli baar London gaya. Wapas aake keha — 'Papa, otthe sab log tez chalthe ne, slow nahi.' Sardar ji ne keha — 'Beta, otthe tere warge tractor nahi ne sadon de liye.'",
      punchline: "Punjab da tractor — global icon. 🚜",
      voiceTag: "Ludhiana voice",
      tone: "Warm",
      imageBg: "bg-[#15803d]",
      imageEmoji: "🌾",
      durationSec: 22,
      lang: "Punjabi",
    },
  ],
  gujarati: [
    {
      jokeText:
        "Ek Gujju businessman Dubai gayo. Tyaa koi bole — 'Aa mehlo ₹500 crore no chhe.' Gujju bole — '₹450 maa aapso?' Tene Burj Khalifa pe discount maangi. Ne mafyo pan.",
      punchline: "Gujjus negotiate everything. Including landmarks. 💼",
      voiceTag: "Surat entrepreneur voice",
      tone: "Classic",
      imageBg: "bg-[#0284c7]",
      imageEmoji: "💼",
      durationSec: 21,
      lang: "Gujarati",
    },
  ],
  bengali: [
    {
      jokeText:
        "Ek Bangali chhele teacher-ke jiggesh korlo — 'Sir, ami ki bhabishyote engineer hobo?' Teacher bollen — 'Tumi ki math bhalobasho?' Chhele bollen — 'Na, kintu baba bhalobase.'",
      punchline: "Bangali parents: engineering by proxy since forever. 📐",
      voiceTag: "Kolkata intellectual voice",
      tone: "Dry",
      imageBg: "bg-[#7c3aed]",
      imageEmoji: "🐟",
      durationSec: 20,
      lang: "Bengali",
    },
  ],
};

type GenState = "idle" | "generating" | "ready";

export default function RegionalPage() {
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [genState, setGenState] = useState<GenState>("idle");
  const [clip, setClip] = useState<ClipData | null>(null);
  const [jokeIdx, setJokeIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }, []);

  const generate = useCallback(() => {
    setGenState("generating");
    setTimeout(() => {
      const pool = CLIPS[selectedLang.id] ?? [];
      if (pool.length > 0) {
        setClip(pool[jokeIdx % pool.length]);
        setJokeIdx((i) => i + 1);
      }
      setGenState("ready");
    }, 1600);
  }, [selectedLang, jokeIdx]);

  const reset = useCallback(() => {
    setGenState("idle");
    setClip(null);
  }, []);

  return (
    <div className="bg-canvas-grey text-fg relative flex h-full flex-col">
      <main
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)" }}
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
          {/* Language grid */}
          <section className="flex flex-col gap-3">
            <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
              Choose your language
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLang(lang);
                    reset();
                  }}
                  className={`flex flex-col gap-1.5 rounded-2xl px-3.5 py-3.5 text-left transition-all active:scale-[0.97] ${
                    selectedLang.id === lang.id
                      ? `${lang.iconBg} ring-2 ring-[#ea580c]/50`
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl leading-none">{lang.flag}</span>
                    {selectedLang.id === lang.id && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12l5 5L19 7"
                          stroke="#ea580c"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-0">
                    <p className="text-[13px] font-bold text-[#0c0d10]">{lang.label}</p>
                    <p className="text-[11px] font-medium text-black/40">{lang.native}</p>
                  </div>
                  <p className="text-[10px] leading-snug font-medium text-black/35">
                    {lang.region}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Selected language detail */}
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xl ${selectedLang.iconBg}`}
            >
              {selectedLang.flag}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-bold text-[#0c0d10]">
                {selectedLang.label} · {selectedLang.native}
              </p>
              <p className="text-[11px] font-medium text-black/40">
                {selectedLang.accent} · Jokes written for this culture — not translated
              </p>
            </div>
          </div>

          {/* Generate */}
          {genState === "idle" && (
            <button
              onClick={generate}
              className="w-full rounded-full bg-[#ea580c] py-4 text-[15px] font-bold text-white transition-opacity active:opacity-80"
            >
              Get a {selectedLang.label} joke →
            </button>
          )}

          {/* Generating */}
          {genState === "generating" && (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-6">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-2 rounded-full bg-[#ea580c]"
                    style={{ animation: `dot-bounce 0.8s ease-in-out ${i * 160}ms infinite` }}
                  />
                ))}
              </div>
              <p className="text-[13px] font-medium text-black/50">
                Writing in {selectedLang.label}…
              </p>
              <style>{`@keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
            </div>
          )}

          {/* Ready */}
          {genState === "ready" && clip && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-black/40 uppercase">
                    {selectedLang.flag} {selectedLang.label} joke
                  </span>
                  <p className="text-[11px] font-medium text-black/40">
                    Written for {selectedLang.region.split(" · ")[0]} · Not translated
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generate}
                    className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-[11px] font-bold text-[#ea580c] active:opacity-70"
                  >
                    Another →
                  </button>
                  <button
                    onClick={reset}
                    className="bg-surface-ghost rounded-full px-3 py-1.5 text-[11px] font-bold text-black/60 active:opacity-70"
                  >
                    Change
                  </button>
                </div>
              </div>
              <ClipCard clip={clip} />
            </>
          )}
        </div>
      </main>

      <HubHeader title="Regional Jokes" backHref="/jokes" scrolled={scrolled} />
    </div>
  );
}
