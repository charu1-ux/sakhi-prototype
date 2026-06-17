"use client";

import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { PenLine, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { HubChatInput } from "@/app/jobs/design-prototype/HubChatInput";
import { HubHeader } from "@/app/jobs/design-prototype/HubHeader";
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Screen = "form" | "loading" | "reveal";
type Sheet = null | "date" | "time" | "city";
type CityView = "list" | "manual";

interface FormData {
  day: string;
  month: string; // full name e.g. "January"
  year: string;
  hour: string;
  minute: string;
  period: "AM" | "PM";
  timeUnknown: boolean;
  city: string;
  state: string;
}

const EMPTY: FormData = {
  day: "",
  month: "",
  year: "",
  hour: "",
  minute: "",
  period: "AM",
  timeUnknown: false,
  city: "",
  state: "",
};

// ─── Data constants ─────────────────────────────────────────────────────────────

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CITIES = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Chandigarh", state: "Punjab" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Patna", state: "Bihar" },
  { city: "Surat", state: "Gujarat" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Kochi", state: "Kerala" },
  { city: "Visakhapatnam", state: "Andhra Pradesh" },
  { city: "Vadodara", state: "Gujarat" },
];

const TOP_CITIES = CITIES.slice(0, 6);
const OTHER_CITIES = CITIES.slice(6);

// ─── Kundali reveal constants (mirrors PM prototype) ───────────────────────────

const USER_NAME = "Shivali";

const HOUSE_POLYGONS: Record<number, string> = {
  1: "240,0 360,120 240,240 120,120",
  2: "240,0 480,0 360,120",
  3: "480,0 480,240 360,120",
  4: "480,240 360,360 240,240 360,120",
  5: "480,240 480,480 360,360",
  6: "480,480 240,480 360,360",
  7: "240,480 120,360 240,240 360,360",
  8: "240,480 0,480 120,360",
  9: "0,480 0,240 120,360",
  10: "0,240 120,120 240,240 120,360",
  11: "0,240 0,0 120,120",
  12: "0,0 240,0 120,120",
};

const HOUSE_CENTROIDS: Record<number, [number, number]> = {
  1: [240, 118],
  2: [362, 38],
  3: [442, 120],
  4: [360, 240],
  5: [442, 362],
  6: [362, 442],
  7: [240, 362],
  8: [118, 442],
  9: [38, 362],
  10: [120, 240],
  11: [38, 118],
  12: [118, 38],
};

const MOCK_PLANETS: { symbol: string; house: number; color: string }[] = [
  { symbol: "Su", house: 1, color: "#e67e22" },
  { symbol: "Mo", house: 4, color: "#607d8b" },
  { symbol: "Ma", house: 10, color: "#c0392b" },
  { symbol: "Me", house: 2, color: "#27ae60" },
  { symbol: "Ju", house: 7, color: "#f39c12" },
  { symbol: "Ve", house: 12, color: "#e91e63" },
  { symbol: "Sa", house: 3, color: "#546e7a" },
  { symbol: "Ra", house: 6, color: "#6d17ce" },
  { symbol: "Ke", house: 12, color: "#9b59b6" },
];

interface RevealBeat {
  startSec: number;
  house: number | null;
  title: string;
  body: string;
  badge?: string;
  keyword: string;
  insight: string;
}

const REVEAL_BEATS: RevealBeat[] = [
  {
    startSec: 0,
    house: 1,
    title: "Pahla Bhav — Lagna",
    body: "Aapki personality, health aur life outlook ka ghar.",
    badge: "🌅 Lagna",
    keyword: "Born to Lead",
    insight: "सूर्य आपका रक्षक है",
  },
  {
    startSec: 12,
    house: 10,
    title: "Dashama Bhav — Karm",
    body: "Career aur ambition ka bhav.",
    badge: "⚡ Career",
    keyword: "Career Will Soar",
    insight: "मंगल आपकी ताकत है",
  },
  {
    startSec: 24,
    house: 7,
    title: "Saptam Bhav — Rishte",
    body: "Vivah aur close relationships ka ghar.",
    badge: "💫 Rishte",
    keyword: "Love Awaits",
    insight: "बृहस्पति प्रेम का वरदान है",
  },
  {
    startSec: 36,
    house: 4,
    title: "Chaturth Bhav — Ghar",
    body: "Ghar, maa aur emotional sukh ka bhav.",
    badge: "🏡 Ghar",
    keyword: "Home is Strength",
    insight: "चंद्रमा शांति लाता है",
  },
  {
    startSec: 48,
    house: 2,
    title: "Dwitiya Bhav — Dhan",
    body: "Dhan aur vaani ka ghar.",
    badge: "💰 Dhan",
    keyword: "Stars With You",
    insight: "बुध समृद्धि देता है",
  },
];

const REVEAL_TOTAL_SECS = 62;

const LOADING_MESSAGES = [
  "Aapki kundli ban rahi hai...",
  "Graho ki positions calculate ho rahi hain...",
  "Aapki unique personality decode ho rahi hai...",
  "Nakshatra aur dasha calculate ho rahe hain...",
];

// ─── Sarvam TTS (mirrors PM prototype) ─────────────────────────────────────────

const SARVAM_KEY = "sk_afh7owtd_prjoh7ZH0nIN1HqF8wqRDuzU";

function generateBeatNarrations(data: FormData, userName: string): string[] {
  const ji = userName ? `${userName} जी` : "आप";
  const name = userName || "आप";
  const place = data.city || "आपके शहर";
  const date = data.day && data.month ? `${data.day} ${data.month}` : "उस खास दिन";
  return [
    `${ji}, नमस्कार! आइए देखते हैं आपकी कुंडली। ${name} ${date} को ${place} में पैदा हुए — बड़ा खास दिन था वह। यहाँ देखिए पहला भाव — यह है आपका लग्न, आपकी पूरी पर्सनालिटी यहीं छुपी है। सूर्य यहाँ हैं, यानी आप में एक नैचरल लीडरशिप है।`,
    `अब आइए — यह देखिए दसवाँ भाव, यहाँ होता है आपका करियर। मंगल यहाँ बहुत मज़बूत खड़े हैं। मतलब जो भी काम करो, दिल लगाकर करो — सफलता खुद चलकर आएगी।`,
    `और यह देखिए — सातवाँ भाव, रिश्तों का घर। बृहस्पति यहाँ हैं, बहुत शुभ है यह। आपकी ज़िंदगी में एक समझदार और प्यार करने वाला साथी है या आएगा।`,
    `चलते हैं चौथे भाव पर — घर, माँ और अंदर की शांति। चंद्रमा यहाँ बैठे हैं। घर में सुकून है, परिवार का प्यार भरपूर है।`,
    `और आखिर में — दूसरा भाव, धन और वाणी का घर। बुध यहाँ हैं। पैसा आएगा, और जो भी बोलेंगे लोग सुनेंगे। ${ji}, सितारे आपके साथ हैं!`,
  ];
}

async function fetchSarvamAudio(text: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": SARVAM_KEY },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "hi-IN",
        speaker: "anushka",
        model: "bulbul:v2",
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return `data:audio/wav;base64,${json.audios[0]}`;
  } catch {
    return null;
  }
}

// ─── ScrollPicker ───────────────────────────────────────────────────────────────

function ScrollPicker({
  items,
  value,
  onChange,
  flex = "flex-1",
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  flex?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ITEM_H = 48;
  const VISIBLE = 5;
  const PAD = ITEM_H * 2;

  useEffect(() => {
    if (!ref.current) return;
    const idx = Math.max(0, items.indexOf(value));
    requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = idx * ITEM_H;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onChange(items[clamped]);
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    }, 80);
  }

  return (
    <div className={`relative ${flex} overflow-hidden`}>
      {/* Selection band — bg-surface-ghost-icon tinted, no border */}
      <div
        className="bg-surface-ghost-icon dark:bg-primary-60/60 pointer-events-none absolute right-1 left-1 rounded-xl"
        style={{ top: PAD, height: ITEM_H }}
      />
      {/* Fade top */}
      <div
        className="dark:from-bg-panel pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-white to-transparent"
        style={{ height: PAD }}
      />
      {/* Fade bottom */}
      <div
        className="dark:from-bg-panel pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white to-transparent"
        style={{ height: PAD }}
      />

      <div
        ref={ref}
        onScroll={handleScroll}
        style={{ height: VISIBLE * ITEM_H, scrollSnapType: "y mandatory" }}
        className="overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div style={{ height: PAD }} />
        {items.map((item) => {
          const active = item === value;
          return (
            <div
              key={item}
              style={{
                height: ITEM_H,
                scrollSnapAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                position: "relative",
                zIndex: active ? 30 : undefined,
                fontSize: active ? 20 : 15,
                fontWeight: active ? 700 : 400,
                transition: "font-size 75ms, color 75ms",
              }}
              className={`font-jio ${active ? "dark:text-ink text-[#0c0d10]" : "dark:text-ink-mute text-[rgba(12,13,16,0.55)]"}`}
            >
              {item}
            </div>
          );
        })}
        <div style={{ height: PAD }} />
      </div>
    </div>
  );
}

// ─── CalendarModal — centered date-picker modal ─────────────────────────────────

function CalendarModal({
  data,
  onConfirm,
  onClose,
}: {
  data: FormData;
  onConfirm: (day: string, month: string, year: string) => void;
  onClose: () => void;
}) {
  const today = useMemo(() => new Date(), []);
  // Default to 18 years ago (sensible birth-year starting point)
  const initMIdx = data.month ? MONTHS_FULL.indexOf(data.month) : today.getMonth();
  const initYear = data.year ? parseInt(data.year) : today.getFullYear() - 18;

  const [viewMonth, setViewMonth] = useState(initMIdx < 0 ? today.getMonth() : initMIdx);
  const [viewYear, setViewYear] = useState(initYear);
  const [selDay, setSelDay] = useState(data.day ? parseInt(data.day) : today.getDate());
  const [showYears, setShowYears] = useState(false);
  const [yearVal, setYearVal] = useState(String(initYear));

  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = today.getFullYear(); y >= today.getFullYear() - 100; y--) arr.push(String(y));
    return arr;
  }, [today]);

  const firstDOW = useMemo(() => new Date(viewYear, viewMonth, 1).getDay(), [viewMonth, viewYear]);
  const daysInMonth = useMemo(
    () => new Date(viewYear, viewMonth + 1, 0).getDate(),
    [viewMonth, viewYear],
  );

  const cells = useMemo(() => {
    const arr: (number | null)[] = [
      ...Array<null>(firstDOW).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [firstDOW, daysInMonth]);

  const isFuture = (d: number) => new Date(viewYear, viewMonth, d) > today;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setSelDay(0);
  }

  function nextMonth() {
    if (viewYear > today.getFullYear()) return;
    if (viewYear === today.getFullYear() && viewMonth >= today.getMonth()) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setSelDay(0);
  }

  const canNext = !(viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  function confirmYear() {
    const y = parseInt(yearVal);
    setViewYear(y);
    setSelDay(0);
    setShowYears(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(12,13,16,0.55)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="shadow-elev-2 dark:bg-bg-panel w-full max-w-sm overflow-hidden rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — hidden in year sub-view (replaced by back + Select Year) */}
        {!showYears && (
          <div className="px-5 pt-5 pb-3">
            <p className="text-headline-2xs font-jio dark:text-ink text-[#0c0d10]">Date of Birth</p>
          </div>
        )}

        {showYears ? (
          /* Year picker sub-view */
          <div className="px-5 pt-5 pb-5">
            <div className="mb-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowYears(false)}
                className="bg-surface-ghost dark:bg-bg-elev focus-visible:ring-primary-60 inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9 2L4 7l5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <p className="text-title-s font-jio dark:text-ink text-[#0c0d10]">Select Year</p>
            </div>
            <ScrollPicker items={years} value={yearVal} onChange={setYearVal} />
            <button
              type="button"
              onClick={confirmYear}
              className="bg-primary-50 text-btn font-jio focus-visible:ring-primary-60 mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-[22px] text-white transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Month / Year navigation */}
            <div className="flex items-center justify-between px-4 pb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="bg-surface-ghost dark:bg-bg-elev focus-visible:ring-primary-60 inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9 2L4 7l5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Select-year trigger — gray text + icon, no bg */}
              <button
                type="button"
                onClick={() => {
                  setYearVal(String(viewYear));
                  setShowYears(true);
                }}
                className="focus-visible:ring-primary-60 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
              >
                <span className="text-title-s font-jio dark:text-ink text-[#0c0d10]">
                  {MONTHS_FULL[viewMonth]} {viewYear}
                </span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="dark:text-ink-soft text-[rgba(12,13,16,0.55)]"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={nextMonth}
                disabled={!canNext}
                className="bg-surface-ghost dark:bg-bg-elev focus-visible:ring-primary-60 inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95] disabled:pointer-events-none disabled:opacity-25"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M5 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-1 grid grid-cols-7 px-3">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-overline font-jio dark:text-ink-mute py-1 text-center text-[rgba(12,13,16,0.38)]"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
              {cells.map((d, i) => {
                if (!d) return <div key={`e-${i}`} className="h-9" />;
                const future = isFuture(d);
                const selected = d === selDay;
                return (
                  <button
                    key={`${viewYear}-${viewMonth}-${d}`}
                    type="button"
                    onClick={() => {
                      if (!future) setSelDay(d);
                    }}
                    disabled={future}
                    className={`text-body-s font-jio focus-visible:ring-primary-60 inline-flex h-9 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 disabled:pointer-events-none ${
                      selected
                        ? "bg-primary-20 text-primary-50 font-bold active:scale-[0.95]"
                        : future
                          ? "dark:text-ink-mute text-[rgba(12,13,16,0.18)]"
                          : "dark:text-ink text-[#0c0d10] active:scale-[0.95]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Cancel (Ghost) / Confirm (Secondary purple) — equal size */}
            <div className="flex gap-3 px-5 pt-1 pb-5">
              {/* JDS Ghost button */}
              <button
                type="button"
                onClick={onClose}
                className="bg-surface-ghost dark:bg-bg-elev text-btn font-jio focus-visible:ring-primary-60 dark:text-ink-soft inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-[22px] text-[rgba(12,13,16,0.65)] transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
              >
                Cancel
              </button>
              {/* JDS Primary button */}
              <button
                type="button"
                onClick={() => {
                  if (selDay) onConfirm(String(selDay), MONTHS_FULL[viewMonth], String(viewYear));
                }}
                disabled={!selDay}
                className="bg-primary-50 text-btn font-jio focus-visible:ring-primary-60 inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-[22px] text-white transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── TimeSheet — bottom sheet ───────────────────────────────────────────────────

function TimeSheet({
  data,
  onConfirm,
  onUnknown,
  onClose,
}: {
  data: FormData;
  onConfirm: (hour: string, minute: string, period: "AM" | "PM") => void;
  onUnknown: () => void;
  onClose: () => void;
}) {
  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );

  const [hour, setHour] = useState(data.hour ? String(parseInt(data.hour)).padStart(2, "0") : "09");
  const [minute, setMinute] = useState(data.minute || "00");
  const [period, setPeriod] = useState<"AM" | "PM">(data.period || "AM");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(12,13,16,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="dark:bg-bg-panel rounded-t-xl bg-white px-5 pt-3 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="bg-surface-moderate mx-auto mb-4 h-1 w-10 rounded-full" />

        {/* Header: "Select time of birth" + close */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-headline-2xs font-jio dark:text-ink text-[#0c0d10]">
            Select time of birth
          </p>
          <button
            type="button"
            onClick={onClose}
            className="bg-surface-ghost dark:bg-bg-elev focus-visible:ring-primary-60 inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M1 1l9 9M10 1L1 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Column labels */}
        <div
          className="font-jio dark:text-ink-mute mb-0 flex text-[rgba(12,13,16,0.38)]"
          style={{ fontSize: 11 }}
        >
          <div className="flex-1 text-center">Hour</div>
          <div className="flex-1 text-center">Minute</div>
          <div className="w-[72px] text-center">AM / PM</div>
        </div>

        {/* Scroll pickers row — items-start so AM/PM aligns with selection band */}
        <div className="flex items-start gap-2">
          <ScrollPicker items={hours} value={hour} onChange={setHour} flex="flex-1" />
          {/* Colon vertically centered on selection band: PAD(96) + ITEM_H/2(24) - half-line-height(11) = 109px */}
          <span
            className="dark:text-ink-mute shrink-0 text-[22px] font-bold text-[rgba(12,13,16,0.35)]"
            style={{ marginTop: "109px" }}
          >
            :
          </span>
          <ScrollPicker items={minutes} value={minute} onChange={setMinute} flex="flex-1" />

          {/* AM / PM stacked toggle — selected one aligns with the hh/mm selection band */}
          <div
            className="flex w-[68px] flex-col gap-2 transition-all duration-200 ease-out"
            style={{ marginTop: period === "AM" ? "94px" : "34px" }}
          >
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`text-btn font-jio focus-visible:ring-primary-60 h-[52px] rounded-full border transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
                  period === p
                    ? "bg-primary-20 border-transparent font-bold text-[#0c0d10]"
                    : "dark:bg-bg-panel dark:text-ink-soft border-[rgba(12,13,16,0.12)] bg-white text-[rgba(12,13,16,0.45)] dark:border-[rgba(255,255,255,0.14)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Primary: Confirm time of birth */}
        <button
          type="button"
          onClick={() => onConfirm(String(parseInt(hour)), minute, period)}
          className="bg-primary-50 text-btn font-jio focus-visible:ring-primary-60 mt-4 inline-flex h-14 w-full items-center justify-center rounded-full text-white transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          Confirm time of birth
        </button>

        {/* Ghost: I don't know — secondary JDS button below confirm */}
        <button
          type="button"
          onClick={onUnknown}
          className="bg-surface-ghost dark:bg-bg-elev text-btn font-jio focus-visible:ring-primary-60 dark:text-ink mt-3 inline-flex h-12 w-full items-center justify-center rounded-full text-[#0c0d10] transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          I don&apos;t know my time of birth
        </button>
      </motion.div>
    </div>
  );
}

// ─── PlaceSheet — 85 % height bottom sheet ─────────────────────────────────────

function PlaceSheet({
  data,
  onConfirm,
  onClose,
}: {
  data: FormData;
  onConfirm: (city: string, state: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<CityView>("list");
  const [manual, setManual] = useState("");
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState("");
  const [locKind, setLocKind] = useState<"info" | "success" | "error">("info");
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the city input when the manual modal opens
  useEffect(() => {
    if (view !== "manual") return;
    const t = setTimeout(() => manualInputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [view]);

  // Auto-hide the location feedback banner after 3s
  useEffect(() => {
    if (!locMsg) return;
    const t = setTimeout(() => setLocMsg(""), 3000);
    return () => clearTimeout(t);
  }, [locMsg]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return CITIES.filter(
      (c) => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
    );
  }, [search]);

  function handleLocate() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocKind("error");
      setLocMsg("Location is browser mein supported nahi hai.");
      return;
    }
    setLocating(true);
    setLocMsg("");
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);
        setLocKind("success");
        setLocMsg("Location detect hua — neechay apna city select karein.");
      },
      () => {
        setLocating(false);
        setLocKind("error");
        setLocMsg("Location detect nahi hua. Manually select karein.");
      },
    );
  }

  // City row — JDSListItem pattern
  function CityRow({ city, state }: { city: string; state: string }) {
    const selected = data.city === city;
    return (
      <button
        type="button"
        onClick={() => onConfirm(city, state)}
        className={`focus-visible:ring-primary-60 flex w-full items-start gap-3 px-5 py-3 text-left transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 active:scale-[0.99] ${selected ? "bg-primary-20" : "hover:bg-surface-minimal dark:hover:bg-bg-elev"}`}
      >
        <div className="mt-0.5 flex w-9 shrink-0 items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="dark:text-ink-soft text-[rgba(12,13,16,0.45)]"
          >
            <path
              d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <circle cx="9" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-title-2xs font-jio dark:text-ink text-[#0c0d10]">{city}</p>
          <p className="text-body-2xs font-jio dark:text-ink-soft mt-0.5 text-[rgba(12,13,16,0.65)]">
            {state}
          </p>
        </div>
        {selected && (
          <div className="bg-primary-50 flex h-5 w-5 shrink-0 items-center justify-center self-center rounded-full">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5l2 2 4-4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </button>
    );
  }

  // Main city list view (85 % height) + Enter-City modal layered over it
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        style={{ background: "rgba(12,13,16,0.5)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="dark:bg-bg-panel flex flex-col overflow-hidden rounded-t-xl bg-white"
          style={{ height: "85%" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="bg-surface-moderate mx-auto mt-3 h-1 w-10 shrink-0 rounded-full" />

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
            <p className="text-headline-2xs font-jio dark:text-ink text-[#0c0d10]">
              Select place of birth
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-surface-ghost dark:bg-bg-elev focus-visible:ring-primary-60 inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M1 1l9 9M10 1L1 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Search — web field focus: white bg + surface-moderate border (§12.1) */}
          <div className="mb-2 shrink-0 px-5">
            <div className="focus-within:border-surface-moderate dark:bg-bg-panel flex items-center gap-2 rounded-2xl border border-[rgba(12,13,16,0.12)] bg-white px-4 py-3 transition-colors dark:border-[rgba(255,255,255,0.14)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="dark:text-ink-mute shrink-0 text-[rgba(12,13,16,0.38)]"
              >
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M11.5 11.5l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search city"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-body-s font-jio dark:text-ink flex-1 bg-transparent text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.38)]"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="focus-visible:ring-primary-60 rounded-full focus:outline-none focus-visible:ring-2"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 2l10 10M12 2L2 12"
                      stroke="rgba(12,13,16,0.35)"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Locate me + Enter manually — fixed list rows above the scrolling cities */}
          {!search && (
            <div className="shrink-0 border-b border-[rgba(12,13,16,0.09)] pb-1 dark:border-[rgba(255,255,255,0.12)]">
              <button
                type="button"
                onClick={handleLocate}
                className="focus-visible:ring-primary-60 flex w-full items-center gap-3 px-5 py-3 text-left transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 active:scale-[0.99]"
              >
                <span className="text-primary-50 flex w-9 shrink-0 items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3" />
                    <path
                      d="M9 1.5v2.5M9 14v2.5M1.5 9H4M14 9h2.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-body-s font-jio text-primary-50 font-medium">
                  {locating ? "Locating…" : "Locate me"}
                </span>
              </button>
              {/* Location feedback banner — JDS Feedback Banner (fill only, no border) */}
              {locMsg && (
                <div
                  className={`mx-5 mb-2 rounded-xl px-3.5 py-2.5 ${
                    locKind === "error"
                      ? "bg-[#fde8ea] dark:bg-[#3b1f22]"
                      : locKind === "success"
                        ? "bg-[#e6f7e6] dark:bg-[#16261a]"
                        : "bg-primary-20"
                  }`}
                >
                  <p
                    className={`text-body-2xs font-jio font-medium ${
                      locKind === "error"
                        ? "text-[#b3261e] dark:text-[#ffb4ab]"
                        : locKind === "success"
                          ? "text-[#1e7d32] dark:text-[#7ee787]"
                          : "text-primary-60"
                    }`}
                  >
                    {locMsg}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setView("manual")}
                className="focus-visible:ring-primary-60 flex w-full items-center gap-3 px-5 py-3 text-left transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 active:scale-[0.99]"
              >
                <span className="text-primary-50 flex w-9 shrink-0 items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M2.5 13.5l1.5-4.5L12 1l3.5 3.5-8 8L2.5 13.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <path d="M10 3l3 3" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </span>
                <span className="text-body-s font-jio text-primary-50 font-medium">
                  Enter manually
                </span>
              </button>
            </div>
          )}

          {/* Scrollable city list */}
          <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered !== null ? (
              /* Search results */
              filtered.length > 0 ? (
                filtered.map((c) => <CityRow key={c.city} city={c.city} state={c.state} />)
              ) : (
                <div className="flex flex-col items-center gap-3 px-5 pt-8">
                  <p className="text-body-s font-jio dark:text-ink-soft text-[rgba(12,13,16,0.45)]">
                    No results for &ldquo;{search}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setManual(search);
                      setView("manual");
                    }}
                    className="bg-surface text-primary-50 border-primary-50 text-btn font-jio focus-visible:ring-primary-60 inline-flex h-11 items-center gap-2 rounded-full border px-[22px] transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
                  >
                    + Add my city
                  </button>
                </div>
              )
            ) : (
              /* Sectioned list */
              <>
                <p className="text-overline font-jio dark:text-ink-mute px-5 pt-3 pb-1 text-[rgba(12,13,16,0.38)]">
                  TOP CITIES
                </p>
                {TOP_CITIES.map((c) => (
                  <CityRow key={c.city} city={c.city} state={c.state} />
                ))}
                <div className="mx-5 my-2 border-t border-[rgba(12,13,16,0.07)] dark:border-[rgba(255,255,255,0.1)]" />
                <p className="text-overline font-jio dark:text-ink-mute px-5 pt-1 pb-1 text-[rgba(12,13,16,0.38)]">
                  OTHER CITIES
                </p>
                {OTHER_CITIES.map((c) => (
                  <CityRow key={c.city} city={c.city} state={c.state} />
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Enter City Name — modal layered over the city sheet */}
      <AnimatePresence>
        {view === "manual" && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            style={{ background: "rgba(12,13,16,0.55)" }}
            onClick={() => setView("list")}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="shadow-elev-2 dark:bg-bg-panel w-full max-w-sm rounded-xl bg-white px-5 pt-5 pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-jio dark:text-ink mb-5 text-[18px] font-semibold text-[#0c0d10]">
                Enter City Name
              </p>

              <div className="focus-within:border-surface-moderate dark:bg-bg-panel mb-6 flex items-center gap-3 rounded-2xl border border-[rgba(12,13,16,0.12)] bg-white px-4 py-4 transition-colors dark:border-[rgba(255,255,255,0.14)]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="dark:text-ink-soft shrink-0 text-[rgba(12,13,16,0.45)]"
                >
                  <path
                    d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle cx="9" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <input
                  ref={manualInputRef}
                  type="text"
                  placeholder="Type your city / town / village"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  className="text-body-s font-jio dark:text-ink flex-1 bg-transparent text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.38)]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="bg-surface-ghost dark:bg-bg-elev text-btn font-jio focus-visible:ring-primary-60 dark:text-ink inline-flex h-11 flex-1 items-center justify-center rounded-full text-[#0c0d10] transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (manual.trim()) onConfirm(manual.trim(), "");
                  }}
                  disabled={!manual.trim()}
                  className="bg-primary-50 text-btn font-jio focus-visible:ring-primary-60 inline-flex h-11 flex-1 items-center justify-center rounded-full text-white transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── KundaliChart SVG (mirrors PM prototype) ───────────────────────────────────

function KundaliChart({
  activeHouse,
  visitedHouses = new Set<number>(),
  done = false,
  className,
}: {
  activeHouse: number | null;
  visitedHouses?: Set<number>;
  done?: boolean;
  className?: string;
}) {
  const houseEntries = Object.entries(HOUSE_POLYGONS) as [string, string][];
  const centroidEntries = Object.entries(HOUSE_CENTROIDS) as [string, [number, number]][];

  return (
    <svg
      viewBox="0 0 480 480"
      className={`${className ?? ""} text-[rgba(12,13,16,0.18)] dark:text-[rgba(255,255,255,0.22)]`}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id="dp-kclip">
          <rect x="0" y="0" width="480" height="480" rx="24" ry="24" />
        </clipPath>
        <style>{`
          @keyframes dp-kPoly { from{opacity:0} to{opacity:1} }
          @keyframes dp-kText { from{opacity:0} to{opacity:1} }
        `}</style>
      </defs>

      <g clipPath="url(#dp-kclip)">
        {/* House fills only — no per-polygon stroke (avoids overlapping double borders).
            Focused = light purple; once narration is done all boxes turn light yellow. */}
        {houseEntries.map(([hs, pts], i) => {
          const h = parseInt(hs);
          const active = h === activeHouse;
          return (
            <polygon
              key={h}
              points={pts}
              style={{
                fill: done
                  ? "rgba(250,204,21,0.11)"
                  : active
                    ? "rgba(109,23,206,0.12)"
                    : "transparent",
                stroke: "none",
                animation: "dp-kPoly 0.45s ease both",
                animationDelay: `${i * 0.07}s`,
                transition: "fill 0.6s ease",
              }}
            />
          );
        })}

        {/* Inner grid — light gray, each line drawn exactly once */}
        <g style={{ stroke: "currentColor", strokeWidth: 1.2 }}>
          <line x1="0" y1="0" x2="480" y2="480" />
          <line x1="480" y1="0" x2="0" y2="480" />
          <polygon points="240,0 480,240 240,480 0,240" fill="none" />
        </g>

        {/* Focused house — dotted 1px primary border, on top of the grid */}
        {activeHouse !== null && HOUSE_POLYGONS[activeHouse] && (
          <polygon
            points={HOUSE_POLYGONS[activeHouse]}
            fill="none"
            stroke="#6d17ce"
            strokeWidth="1"
            strokeDasharray="1 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>

      {/* Outer border — light gray, 2xl rounded corners */}
      <rect
        x="0.9"
        y="0.9"
        width="478.2"
        height="478.2"
        rx="23"
        ry="23"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      {centroidEntries.map(([hs, [cx, cy]], i) => {
        const h = parseInt(hs);
        const active = h === activeHouse;
        const visited = visitedHouses.has(h);
        return (
          <text
            key={h}
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            className={active ? "fill-[#6d17ce]" : "dark:fill-ink fill-[#0c0d10]"}
            style={{
              // Numbers lg; only active is purple, rest gray (currentColor via fill-* class)
              fontSize: active ? 27 : visited ? 26 : 24,
              fontWeight: active ? 800 : visited ? 700 : 600,
              fillOpacity: active ? 1 : visited ? 0.82 : 0.5,
              animation: "dp-kText 0.3s ease both",
              animationDelay: `${i * 0.07 + 0.18}s`,
              transition: "fill 0.5s ease",
              fontFamily: "system-ui,sans-serif",
              pointerEvents: "none",
            }}
          >
            {h}
          </text>
        );
      })}

      {/* Planet abbreviations — stacked under each house number, small text */}
      {centroidEntries.flatMap(([hs, [cx, cy]]) => {
        const h = parseInt(hs);
        return MOCK_PLANETS.filter((p) => p.house === h).map((p, idx) => (
          <text
            key={`pl-${h}-${idx}`}
            x={cx}
            y={cy + 20 + idx * 15}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: 14,
              fontWeight: 600,
              fill: p.color,
              fontFamily: "system-ui,sans-serif",
              animation: "dp-kText 0.3s ease both",
              animationDelay: `${0.85 + idx * 0.05}s`,
              opacity: 0.92,
            }}
          >
            {p.symbol}
          </text>
        ));
      })}
    </svg>
  );
}

// ─── LoadingScreen (mirrors PM prototype) ──────────────────────────────────────

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(onComplete, 5500);
    return () => clearTimeout(id);
  }, [onComplete]);

  const corners = [
    { top: "18px", left: "18px" },
    { top: "18px", right: "18px" },
    { bottom: "18px", left: "18px" },
    { bottom: "18px", right: "18px" },
  ];

  return (
    <div className="bg-surface-minimal dark:bg-bg-panel flex flex-1 flex-col items-center justify-center gap-8 px-8">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{ background: "radial-gradient(circle,rgba(109,23,206,0.1) 0%,transparent 70%)" }}
        />
        <div
          className="border-primary-50 absolute inset-5 animate-pulse rounded-xl border"
          style={{ opacity: 0.4 }}
        />
        <div
          className="border-primary-50 absolute inset-11 rotate-45 animate-pulse rounded-sm border"
          style={{ animationDelay: "0.4s" }}
        />
        <div className="bg-primary-50 h-4 w-4 animate-ping rounded-full" />
        {corners.map((pos, i) => (
          <div
            key={i}
            className="bg-primary-50 absolute h-2 w-2 animate-pulse rounded-full"
            style={{ animationDelay: `${i * 0.2}s`, opacity: 0.4, ...pos }}
          />
        ))}
      </div>

      <p
        key={msgIdx}
        className="text-headline-2xs font-jio dark:text-ink text-center text-[#0c0d10]"
      >
        {LOADING_MESSAGES[msgIdx]}
      </p>

      <div className="bg-primary-20 dark:bg-primary-50/25 h-1.5 w-48 overflow-hidden rounded-full">
        <div
          className="bg-primary-50 h-full rounded-full"
          style={{ animation: "dp-kundliload 5s ease-in-out forwards" }}
        />
      </div>

      <style>{`@keyframes dp-kundliload { from{width:0%} to{width:90%} }`}</style>
    </div>
  );
}

// ─── RevealScreen (mirrors PM prototype) ───────────────────────────────────────

function RevealScreen({ data, onDone }: { data: FormData; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [audioClips, setAudioClips] = useState<(string | null)[]>(REVEAL_BEATS.map(() => null));
  const [seeking, setSeeking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const done = elapsed >= REVEAL_TOTAL_SECS;
  const progress = Math.min(elapsed / REVEAL_TOTAL_SECS, 1);

  const activeBeatIdx = useMemo(() => {
    const found = [...REVEAL_BEATS]
      .map((b, i) => ({ b, i }))
      .reverse()
      .find(({ b }) => elapsed >= b.startSec);
    return found?.i ?? 0;
  }, [elapsed]);

  const activeBeat = REVEAL_BEATS[activeBeatIdx];
  const visibleBeats = useMemo(() => REVEAL_BEATS.filter((b) => elapsed >= b.startSec), [elapsed]);

  useEffect(() => {
    if (timerPaused || done) return;
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, REVEAL_TOTAL_SECS)), 1000);
    return () => clearInterval(id);
  }, [timerPaused, done]);

  const beatNarrations = useMemo(() => generateBeatNarrations(data, USER_NAME), [data]);

  useEffect(() => {
    beatNarrations.forEach((text, i) => {
      fetchSarvamAudio(text).then((src) => {
        if (src)
          setAudioClips((prev) => {
            const n = [...prev];
            n[i] = src;
            return n;
          });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioPaused) return;
    const clip = audioClips[activeBeatIdx];
    const audio = audioRef.current;
    if (!clip || !audio) return;
    if (audio.getAttribute("src") !== clip) audio.src = clip;
    audio.play().catch(() => {});
  }, [activeBeatIdx, audioClips, audioPaused]);

  function handleAudioToggle() {
    const audio = audioRef.current;
    if (audioPaused) {
      setAudioPaused(false);
      setTimerPaused(false);
      const clip = audioClips[activeBeatIdx];
      if (audio && clip) {
        audio.src = clip;
        audio.play().catch(() => {});
      }
    } else {
      setAudioPaused(true);
      setTimerPaused(true);
      if (audio) audio.pause();
    }
  }

  function handleRestart() {
    setElapsed(0);
    setAudioPaused(false);
    setTimerPaused(false);
    const audio = audioRef.current;
    const clip = audioClips[0];
    if (audio && clip) {
      audio.src = clip;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  function seekFromEvent(clientX: number, el: HTMLDivElement) {
    const rect = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setElapsed(Math.round(frac * REVEAL_TOTAL_SECS));
  }

  useEffect(() => {
    if (cardRef.current) cardRef.current.scrollTop = cardRef.current.scrollHeight;
  }, [visibleBeats.length]);

  return (
    <div className="bg-surface relative flex min-h-0 flex-1 flex-col">
      {/* HubHeader — back + skip only, no title */}
      <HubHeader
        title=""
        pageBg="white"
        onBack={onDone}
        rightSlot={
          <button
            type="button"
            onClick={onDone}
            className="text-btn font-jio focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink inline-flex h-10 items-center gap-1 rounded-full bg-[#f5f5f5] px-4 text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 active:scale-[0.97]"
          >
            Skip
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        }
      />

      {/* Scrollable body — only the header is fixed; the title scrolls with the content */}
      <div
        className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 80px)" }}
      >
        {/* Title + description */}
        <div className="px-5 pb-3">
          <p className="font-jio dark:text-ink text-xl leading-tight font-bold text-[#0c0d10]">
            {USER_NAME} ki Kundali
          </p>
          <p className="text-body-2xs font-jio dark:text-ink-soft mt-0.5 text-[rgba(12,13,16,0.65)]">
            {data.day} {data.month} {data.year} · {data.city}
          </p>
        </div>

        {/* Kundali chart — no outer container */}
        <div className="px-4 pt-2 pb-2">
          <KundaliChart
            activeHouse={done ? null : activeBeat.house}
            visitedHouses={
              new Set(visibleBeats.map((b) => b.house).filter((h): h is number => h !== null))
            }
            done={done}
            className="h-auto w-full"
          />
        </div>

        {/* Keyword (title) — enters from top, exits downward */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`kw-${activeBeat.startSec}`}
            initial={{ opacity: 0, scale: 0.9, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="font-jio dark:text-ink px-5 pt-3 pb-1 text-center font-bold text-[#0c0d10]"
            style={{ fontSize: 30, lineHeight: 1.15, letterSpacing: "-0.3px" }}
          >
            {activeBeat.keyword}
          </motion.p>
        </AnimatePresence>

        {/* Insight pill (tag) — staggered IN (after title), but exits together with title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`ins-${activeBeat.startSec}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.97,
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0 },
            }}
            className="flex justify-center px-5 pb-5"
          >
            <span className="text-body-s font-jio text-primary-50 dark:text-primary-30 bg-primary-20 dark:bg-primary-60/40 border-primary-20 dark:border-primary-60/40 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold">
              ✦ {activeBeat.insight}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Completed beat chips — JDS neutral TagChip; animate in & out */}
        {visibleBeats.length > 1 && (
          <div ref={cardRef} className="flex flex-row flex-wrap justify-center gap-2 px-5 pb-3">
            <AnimatePresence>
              {visibleBeats.slice(0, -1).map((beat) => (
                <motion.span
                  key={beat.startSec}
                  initial={{ opacity: 0, y: -8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-surface-ghost dark:bg-bg-elev text-label-s dark:text-ink inline-flex items-center rounded-full px-3 py-1 text-[#0c0d10]"
                >
                  {(beat.badge ?? beat.title).replace(/^[^\p{L}]+/u, "").trim()}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="h-20" />
      </div>

      {/* Footer */}
      <div className="bg-surface border-t border-[rgba(12,13,16,0.06)] px-5 pt-3 pb-6 dark:border-[rgba(255,255,255,0.1)]">
        {/* Narration controls — play/pause + seek bar */}
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={done ? handleRestart : handleAudioToggle}
            aria-label={
              done ? "Restart narration" : audioPaused ? "Play narration" : "Pause narration"
            }
            className="bg-primary-50 focus-visible:ring-primary-60 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
          >
            {done ? (
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2.6 9a6.4 6.4 0 1 0 1.9-4.55"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M2 2.5V6h3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : audioPaused ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M5 3l8 5-8 5V3z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
                <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Seek bar — tap or drag to scrub; smooth 1s-linear fill during playback */}
          <div
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setSeeking(true);
              seekFromEvent(e.clientX, e.currentTarget);
            }}
            onPointerMove={(e) => {
              if (seeking) seekFromEvent(e.clientX, e.currentTarget);
            }}
            onPointerUp={() => setSeeking(false)}
            onPointerCancel={() => setSeeking(false)}
            className="bg-surface-ghost dark:bg-bg-elev relative h-2 flex-1 cursor-pointer touch-none rounded-full"
          >
            <div
              className="bg-primary-50 absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress * 100}%`,
                transition: seeking ? "none" : "width 1s linear",
              }}
            />
            <div
              className="bg-primary-50 shadow-elev-1 border-primary-50 absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                left: `${progress * 100}%`,
                transition: seeking ? "none" : "left 1s linear",
              }}
            />
          </div>

          <span
            className="text-body-2xs font-jio text-primary-50 shrink-0 text-right font-medium tabular-nums"
            style={{ minWidth: 58 }}
          >
            {REVEAL_TOTAL_SECS - elapsed}s / {REVEAL_TOTAL_SECS}s
          </span>
        </div>

        {/* Poori Kundali Dikhao — always secondary purple */}
        <button
          type="button"
          onClick={onDone}
          className="bg-primary-40 text-primary-50 text-btn font-jio focus-visible:ring-primary-60 inline-flex h-12 w-full items-center justify-center rounded-full transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          Poori Kundali Dikhao
        </button>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}

// ─── ChatOverlay — conversational birth-data collection ─────────────────────────

interface ChatMsg {
  id: number;
  role: "ai" | "user";
  kind: "text" | "confirm" | "reveal";
  text?: string;
  snapshot?: FormData;
}

const MONTH_ABBR = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const TIME_PERIODS: Record<string, { hour: string; period: "AM" | "PM"; label: string }> = {
  subah: { hour: "7", period: "AM", label: "subah" },
  morning: { hour: "7", period: "AM", label: "subah" },
  dopahar: { hour: "1", period: "PM", label: "dopahar" },
  afternoon: { hour: "1", period: "PM", label: "dopahar" },
  shaam: { hour: "6", period: "PM", label: "shaam" },
  evening: { hour: "6", period: "PM", label: "shaam" },
  raat: { hour: "9", period: "PM", label: "raat" },
  night: { hour: "9", period: "PM", label: "raat" },
};

// Regex + keyword extraction — no LLM needed for the happy path
function extractBirthData(text: string, cur: FormData): FormData {
  const t = ` ${text.toLowerCase().replace(/,/g, " ")} `;
  const next: FormData = { ...cur };

  // Numeric date dd/mm/yyyy
  const numDate = t.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (numDate) {
    next.day = String(parseInt(numDate[1]));
    const mi = parseInt(numDate[2]) - 1;
    if (mi >= 0 && mi < 12) next.month = MONTHS_FULL[mi];
    let y = numDate[3];
    if (y.length === 2) y = (parseInt(y) > 30 ? "19" : "20") + y;
    next.year = y;
  } else {
    for (let i = 0; i < 12; i++) {
      if (
        t.includes(MONTHS_FULL[i].toLowerCase()) ||
        new RegExp(`\\b${MONTH_ABBR[i]}[a-z]*\\b`).test(t)
      ) {
        next.month = MONTHS_FULL[i];
        break;
      }
    }
    const dayM =
      t.match(/\b(\d{1,2})\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/) ||
      t.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})\b/);
    if (dayM && parseInt(dayM[1]) >= 1 && parseInt(dayM[1]) <= 31)
      next.day = String(parseInt(dayM[1]));
  }

  const yearM = t.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearM) next.year = yearM[1];

  // City — match against the known list
  for (const c of CITIES) {
    if (t.includes(c.city.toLowerCase())) {
      next.city = c.city;
      next.state = c.state;
      break;
    }
  }

  // Time
  let periodWord: string | null = null;
  for (const k of Object.keys(TIME_PERIODS)) {
    if (t.includes(k)) {
      periodWord = k;
      break;
    }
  }
  const timeM =
    t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(?:am|pm|baje|bje|o'?clock)/) ||
    t.match(/around\s*(\d{1,2})/);
  if (timeM) {
    let h = parseInt(timeM[1]);
    const min = timeM[2] ?? "00";
    let period: "AM" | "PM";
    if (/\bpm\b/.test(t)) period = "PM";
    else if (/\bam\b/.test(t)) period = "AM";
    else if (periodWord) period = TIME_PERIODS[periodWord].period;
    else period = h >= 12 ? "PM" : "AM";
    if (h > 12) {
      h -= 12;
      period = "PM";
    }
    if (h === 0) h = 12;
    next.hour = String(h);
    next.minute = min;
    next.period = period;
    next.timeUnknown = false;
  } else if (periodWord) {
    const p = TIME_PERIODS[periodWord];
    next.hour = p.hour;
    next.minute = "00";
    next.period = p.period;
    next.timeUnknown = true;
  }

  return next;
}

function timePhrase(d: FormData): string {
  if (d.timeUnknown) {
    const label = Object.values(TIME_PERIODS).find(
      (p) => p.hour === d.hour && p.period === d.period,
    )?.label;
    return label ? `${label} ka waqt` : "approx samay";
  }
  return `${d.hour}:${d.minute} ${d.period}`;
}

function ChatOverlay({
  onComplete,
  onClose,
}: {
  onComplete: (d: FormData) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<FormData>(EMPTY);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [muted, setMuted] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [loaderLabel, setLoaderLabel] = useState("");
  const [phase, setPhase] = useState<"collect" | "confirm" | "ready">("collect");
  const idRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mutedRef = useRef(false);

  function speak(text: string) {
    if (mutedRef.current) return;
    fetchSarvamAudio(text).then((src) => {
      if (src && audioRef.current && !mutedRef.current) {
        audioRef.current.src = src;
        audioRef.current.play().catch(() => {});
      }
    });
  }

  function pushAi(text: string) {
    setMessages((m) => [...m, { id: idRef.current++, role: "ai", kind: "text", text }]);
    speak(text);
  }

  // Opening greeting
  useEffect(() => {
    const greet =
      'Namaskar! Apni janam details batao — date, time aur jagah ek saath chat me likhiye.\nExample: "15 March 1990, 11:30 AM, Mumbai"';
    setMessages([{ id: idRef.current++, role: "ai", kind: "text", text: greet }]);
    speak(greet);
    return () => audioRef.current?.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const dateDone = (d: FormData) => !!(d.day && d.month && d.year);
  const timeDone = (d: FormData) => !!(d.hour || d.timeUnknown);
  const allDone = (d: FormData) => dateDone(d) && timeDone(d) && !!d.city;

  // AI got all three → show the confirmation card
  function showConfirm(d: FormData) {
    setMessages((m) => [
      ...m,
      { id: idRef.current++, role: "ai", kind: "confirm", snapshot: { ...d } },
    ]);
    setPhase("confirm");
    speak("Yeh details mili hain — sahi hai?");
  }

  // Confirmed → loader (Lottie + "Perfect…") for 2s, which then vanishes and the reveal card appears
  function showReveal() {
    setPhase("ready");
    setLoaderLabel("Perfect! Janam kundli ban rahi hai");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setLoaderLabel("");
      setMessages((m) => [...m, { id: idRef.current++, role: "ai", kind: "reveal" }]);
    }, 2000);
  }

  function respond(d: FormData) {
    setThinking(false);
    if (allDone(d)) {
      showConfirm(d);
      return;
    }
    if (!dateDone(d)) {
      const got: string[] = [];
      if (d.city) got.push(d.city);
      if (timeDone(d)) got.push(timePhrase(d));
      pushAi(
        `${got.length ? `${got.join(", ")} — mil gaya. ` : ""}Aapki poori janam tithi bata dein — din, mahina aur saal?`,
      );
    } else if (!d.city) {
      pushAi("Theek hai. Aur janam sthan? Kis sheher mein paida hue the?");
    } else {
      pushAi("Aur janam ka waqt? Subah, dopahar, ya shaam? Exact pata ho to wo bhi bata dein.");
    }
  }

  function handleConfirmDetails() {
    if (phase !== "confirm") return;
    showReveal();
  }

  function handleEditDetails() {
    if (phase !== "confirm") return;
    setPhase("collect");
    pushAi("Theek hai — phir se bata dein. Date, time aur jagah ek saath.");
  }

  function handleSend(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || phase === "ready") return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", kind: "text", text }]);
    setInput("");

    if (phase === "confirm") {
      if (/\b(yes|haan|han|sahi|theek|ok|okay|confirm|bilkul|looks?\s*right)\b/i.test(text)) {
        handleConfirmDetails();
        return;
      }
      if (/\b(edit|nahi|nahin|no|change|galat|wrong)\b/i.test(text)) {
        handleEditDetails();
        return;
      }
      // otherwise treat as a correction
    }

    const next = extractBirthData(text, data);
    setData(next);
    setThinking(true);
    setTimeout(() => respond(next), 650);
  }

  function toggleMute() {
    const nextMuted = !muted;
    setMuted(nextMuted);
    mutedRef.current = nextMuted;
    if (nextMuted) audioRef.current?.pause();
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="bg-surface flex h-full flex-col"
      >
        <HubHeader
          title="Chat with Jyotish AI"
          pageBg="white"
          onBack={onClose}
          rightSlot={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute voice" : "Mute voice"}
                className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
              >
                {muted ? (
                  <VolumeX size={18} strokeWidth={2} />
                ) : (
                  <Volume2 size={18} strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                aria-label="New chat"
                className="focus-visible:ring-primary-60 dark:bg-bg-elev dark:text-ink flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#0c0d10] transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.95]"
              >
                <PenLine size={19} strokeWidth={2} />
              </button>
            </div>
          }
        />

        {/* Messages — top padding clears the fixed HubHeader */}
        <div
          ref={bodyRef}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 72px)" }}
        >
          {messages.map((m) => {
            // ── Confirmation widget — MCP SurfaceCard + tinted IconCircle rows + ActionFooter ──
            if (m.kind === "confirm" && m.snapshot) {
              const s = m.snapshot;
              const isActive = phase === "confirm" && messages[messages.length - 1]?.id === m.id;
              const rows = [
                {
                  label: `${parseInt(s.day)} ${s.month} ${s.year}`,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <rect
                        x="2"
                        y="3.5"
                        width="14"
                        height="12"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M6 1.8v3.4M12 1.8v3.4M2 7.5h14"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
                {
                  label: timePhrase(s),
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                      <path
                        d="M9 5.2V9l2.6 2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  label: s.state ? `${s.city}, ${s.state}` : s.city,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M9 1.8a5.6 5.6 0 0 1 5.6 5.6c0 4.2-5.6 8.4-5.6 8.4S3.4 11.6 3.4 7.4A5.6 5.6 0 0 1 9 1.8z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <circle cx="9" cy="7.4" r="1.9" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  ),
                },
              ];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-start"
                >
                  <div className="shadow-elev-2 bg-surface w-full max-w-[92%] overflow-hidden rounded-lg border border-[rgba(12,13,16,0.08)] dark:border-[rgba(255,255,255,0.1)]">
                    <div className="p-4">
                      <p className="text-overline font-jio dark:text-ink-soft mb-3 text-[rgba(12,13,16,0.45)]">
                        YEH DETAILS MILI HAIN — SAHI HAI?
                      </p>
                      <div className="flex flex-col gap-3">
                        {rows.map((r) => (
                          <div key={r.label} className="flex items-center gap-3">
                            <span className="bg-surface-ghost-icon dark:bg-primary-60/60 text-primary-50 dark:text-primary-30 flex size-8 shrink-0 items-center justify-center rounded-full">
                              {r.icon}
                            </span>
                            <span className="text-body-s font-jio dark:text-ink text-[#0c0d10]">
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex gap-3 px-4 pb-4">
                        <button
                          type="button"
                          onClick={handleEditDetails}
                          className="text-body-s font-jio dark:bg-bg-elev dark:text-ink flex-1 rounded-full bg-[#eeeeef] px-5 py-2.5 text-[#0c0d10] transition-transform duration-150 ease-out active:scale-[0.97]"
                        >
                          Edit details
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDetails}
                          className="bg-primary-50 text-body-s font-jio flex-1 rounded-full px-5 py-2.5 text-white transition-transform duration-150 ease-out active:scale-[0.97]"
                        >
                          Looks right
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            }

            // ── Reveal widget — MCP solid brand surface; tap to start the reveal ──
            if (m.kind === "reveal") {
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-start"
                >
                  <div className="bg-surface w-full max-w-[92%] rounded-lg border border-[rgba(12,13,16,0.08)] p-4 dark:border-[rgba(255,255,255,0.1)]">
                    {/* Icon left · title + description right */}
                    <div className="flex items-center gap-3">
                      <span className="bg-surface-ghost-icon dark:bg-primary-60/60 text-primary-50 dark:text-primary-30 flex size-12 shrink-0 items-center justify-center rounded-full">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2l2.2 6.4L21 11l-6.8 2.6L12 20l-2.2-6.4L3 11l6.8-2.6L12 2z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-jio text-body-l dark:text-ink font-bold tracking-[-0.48px] text-[#0c0d10]">
                          Your birth chart is ready
                        </p>
                        <p className="text-body-s font-jio dark:text-ink-soft text-[rgba(12,13,16,0.55)]">
                          Tap to reveal your Kundli
                        </p>
                      </div>
                    </div>
                    {/* CTA — bottom-left, JDSButton with chevron */}
                    <button
                      type="button"
                      onClick={() => onComplete(data)}
                      className="bg-primary-50 text-btn font-jio focus-visible:ring-primary-60 mt-4 inline-flex h-11 items-center gap-1 rounded-full px-[22px] text-white transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                      Reveal now
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              );
            }

            // ── Text message — user = bubble, AI = plain text (commerce / microlearning style) ──
            const isUser = m.role === "user";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {isUser ? (
                  <div
                    className="text-body-s font-jio dark:text-ink max-w-[80%] bg-[#eeeeef] px-3 py-2 text-[#0c0d10] dark:bg-[#2a2d40]"
                    style={{ borderRadius: "14px 14px 4px 14px" }}
                  >
                    {m.text}
                  </div>
                ) : (
                  <p className="text-body-s font-jio dark:text-ink max-w-[92%] leading-relaxed font-medium whitespace-pre-line text-[#0c0d10]">
                    {m.text}
                  </p>
                )}
              </motion.div>
            );
          })}
          {thinking && (
            <div className="flex items-center gap-2.5 self-start">
              <Lottie animationData={spinLoaderData} loop className="size-8 shrink-0" />
              {loaderLabel && (
                <span className="text-body-s font-jio dark:text-ink font-medium text-[#0c0d10]">
                  {loaderLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Input — shared HubChatInput */}
        <HubChatInput
          variant="sleek"
          value={input}
          onChange={setInput}
          onSubmit={(v) => handleSend(v)}
          placeholder={
            phase === "confirm"
              ? "Type 'yes' to confirm or 'edit' to change…"
              : "Type your birth details…"
          }
        />

        <audio ref={audioRef} style={{ display: "none" }} />
      </motion.div>
    </div>
  );
}

// ─── FormScreen ─────────────────────────────────────────────────────────────────

function FormScreen({
  data,
  setData,
  onCalculate,
}: {
  data: FormData;
  setData: (d: FormData) => void;
  onCalculate: () => void;
}) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = useRef(false);

  function handleScroll(e: React.UIEvent<HTMLElement>) {
    const past = e.currentTarget.scrollTop > 8;
    if (past !== scrollRef.current) {
      scrollRef.current = past;
      setScrolled(past);
    }
  }

  const [showErrors, setShowErrors] = useState(false);

  // Calculate enabled once all three fields are filled
  const canCalc = !!(data.day && (data.hour || data.timeUnknown) && data.city);

  // Per-field validation messages (only after a Calculate attempt)
  const dateError = showErrors && !data.day ? "Please select your date of birth" : null;
  const timeError =
    showErrors && !data.hour && !data.timeUnknown ? "Please select your time of birth" : null;
  const cityError = showErrors && !data.city ? "Please select your place of birth" : null;

  // Display labels
  const dateLabel = data.day ? `${parseInt(data.day)} ${data.month} ${data.year}` : null;
  const timeLabel = data.timeUnknown
    ? "Time not known"
    : data.hour
      ? `${data.hour}:${data.minute} ${data.period}`
      : null;
  const cityLabel = data.city ? (data.state ? `${data.city}, ${data.state}` : data.city) : null;

  function handleDateConfirm(day: string, month: string, year: string) {
    setData({ ...data, day, month, year });
    setSheet(null);
    // Auto-open time sheet after calendar closes
    setTimeout(() => setSheet("time"), 320);
  }

  function handleTimeConfirm(hour: string, minute: string, period: "AM" | "PM") {
    setData({ ...data, hour, minute, period, timeUnknown: false });
    setSheet(null);
    // Auto-open place sheet after time sheet closes
    if (!data.city) setTimeout(() => setSheet("city"), 320);
  }

  function handleTimeUnknown() {
    setData({ ...data, hour: "12", minute: "00", period: "AM", timeUnknown: true });
    setSheet(null);
    if (!data.city) setTimeout(() => setSheet("city"), 320);
  }

  function handleCityConfirm(city: string, state: string) {
    setData({ ...data, city, state });
    setSheet(null);
  }

  function toggleTimeUnknown() {
    if (data.timeUnknown) setData({ ...data, timeUnknown: false });
    else setData({ ...data, timeUnknown: true, hour: "", minute: "" });
  }

  // Tappable field row — pill button on bg-surface-ghost dark:bg-bg-elev
  const FieldRow = ({
    icon,
    label,
    value,
    isApprox,
    active,
    error,
    onTap,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | null;
    isApprox?: boolean;
    active?: boolean;
    error?: string | null;
    onTap: () => void;
  }) => (
    <div className="flex flex-col gap-2">
      <p className="text-overline font-jio dark:text-ink-mute px-1 text-[rgba(12,13,16,0.38)]">
        {label}
      </p>
      <button
        type="button"
        onClick={onTap}
        className={`focus-visible:ring-primary-60 inline-flex h-14 w-full items-center gap-3 rounded-2xl border px-4 transition-[background-color,border-color,transform] duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
          error
            ? "border-error dark:bg-bg-panel bg-white"
            : active
              ? "border-surface-moderate dark:bg-bg-panel bg-white"
              : "dark:bg-bg-panel border-[rgba(12,13,16,0.12)] bg-white dark:border-[rgba(255,255,255,0.14)]"
        }`}
      >
        <span className="dark:text-ink shrink-0 text-[#0c0d10]">{icon}</span>
        <span
          className={`text-body-s font-jio flex-1 text-left ${
            value
              ? data.timeUnknown && label === "TIME OF BIRTH"
                ? "dark:text-ink-soft text-[rgba(12,13,16,0.5)] italic"
                : "dark:text-ink font-semibold text-[#0c0d10]"
              : "dark:text-ink-mute text-[rgba(12,13,16,0.38)]"
          }`}
        >
          {value ?? `Select ${label.toLowerCase().replace(" of birth", "")}`}
        </span>
        {isApprox && (
          <span
            className="text-overline font-jio shrink-0 rounded-full px-2.5 py-[3px] font-medium"
            style={{ background: "#fef0e6", color: "#c87532" }}
          >
            Approx
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="dark:text-ink-mute shrink-0 text-[rgba(12,13,16,0.3)]"
        >
          <path
            d="M5 7l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {error && <p className="text-error text-body-2xs font-jio px-1">{error}</p>}
    </div>
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <HubHeader title="Astrology" backHref="/" scrolled={scrolled} pageBg="transparent" />

      {/* Scrollable area — hero's purple fills behind the transparent header */}
      <div
        className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {/* ── Hero — primary-70 → primary-50 gradient, fills behind transparent header ── */}
        <div
          className="relative overflow-hidden px-5 pb-8"
          style={{
            paddingTop: "calc(env(safe-area-inset-top,0px) + 76px)",
            background: "linear-gradient(145deg,#13002d 0%,#3e0084 50%,#6d17ce 100%)",
          }}
        >
          {/* Decorative star glyphs */}
          <span aria-hidden className="absolute top-20 right-8 text-xl text-white/20 select-none">
            ✦
          </span>
          <span aria-hidden className="absolute top-24 right-16 text-sm text-white/10 select-none">
            ✦
          </span>
          <span aria-hidden className="absolute top-24 left-14 text-xs text-white/15 select-none">
            ✦
          </span>
          <span
            aria-hidden
            className="absolute right-10 bottom-7 text-base text-white/15 select-none"
          >
            ✦
          </span>

          <h1 className="text-headline-m font-jio leading-tight text-white">
            Let&apos;s read your stars
          </h1>
        </div>

        {/* ── Form content — bg-surface (default) ── */}
        <div className="bg-surface px-5 pt-6 pb-4">
          {/* Section heading */}
          <p className="text-headline-2xs font-jio dark:text-ink mb-1 leading-tight text-[#0c0d10]">
            Your Birth Details
          </p>
          <p className="text-body-s font-jio dark:text-ink-soft mb-6 text-[rgba(12,13,16,0.65)]">
            to help us map your unique cosmic blueprint
          </p>

          {/* All three fields shown at once */}
          <div className="flex flex-col gap-5">
            {/* Field 1: Date of Birth */}
            <FieldRow
              label="DATE OF BIRTH"
              value={dateLabel}
              active={sheet === "date"}
              error={dateError}
              onTap={() => setSheet("date")}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="1.5"
                    y="3"
                    width="15"
                    height="13.5"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M6 1.5v3M12 1.5v3M1.5 7.5h15"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />

            {/* Field 2: Time of Birth + "I don't know" checkbox */}
            <div className="flex flex-col gap-3">
              <FieldRow
                label="TIME OF BIRTH"
                value={timeLabel}
                isApprox={data.timeUnknown}
                active={sheet === "time"}
                error={timeError}
                onTap={() => setSheet("time")}
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
                    <path
                      d="M9 5.5v4l2.5 2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />

              <button
                type="button"
                role="checkbox"
                aria-checked={data.timeUnknown}
                onClick={toggleTimeUnknown}
                className="focus-visible:ring-primary-60 flex w-fit items-center gap-2.5 rounded-md px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                    data.timeUnknown
                      ? "bg-primary-50 border-primary-50"
                      : "dark:bg-bg-panel border-[rgba(12,13,16,0.3)] bg-white dark:border-[rgba(255,255,255,0.28)]"
                  }`}
                >
                  {data.timeUnknown && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6l2.5 2.5L9.5 3.5"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-body-s font-jio dark:text-ink-soft text-[rgba(12,13,16,0.65)]">
                  I don&apos;t know my time of birth
                </span>
              </button>
            </div>

            {/* Field 3: Place of Birth */}
            <FieldRow
              label="PLACE OF BIRTH"
              value={cityLabel}
              active={sheet === "city"}
              error={cityError}
              onTap={() => setSheet("city")}
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <circle cx="9" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div className="bg-surface flex shrink-0 items-center gap-3 border-t border-[rgba(12,13,16,0.07)] px-5 pt-4 pb-6 dark:border-[rgba(255,255,255,0.1)]">
        {/* Primary: Calculate Kundali — always enabled; only proceeds once all three fields are filled */}
        <button
          type="button"
          onClick={() => {
            if (canCalc) onCalculate();
            else setShowErrors(true);
          }}
          className="bg-primary-50 text-btn font-jio focus-visible:ring-primary-60 inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-white transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          Calculate Kundali
        </button>

        {/* Secondary: Chat button — opens the conversational birth-data overlay */}
        <button
          type="button"
          aria-label="Chat with assistant"
          onClick={() => setChatOpen(true)}
          className="bg-primary-50 focus-visible:ring-primary-60 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            />
          </svg>
        </button>
      </div>

      {/* Modals & sheets — in AnimatePresence for exit animations */}
      <AnimatePresence>
        {sheet === "date" && (
          <CalendarModal
            key="cal"
            data={data}
            onConfirm={handleDateConfirm}
            onClose={() => setSheet(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sheet === "time" && (
          <TimeSheet
            key="time"
            data={data}
            onConfirm={handleTimeConfirm}
            onUnknown={handleTimeUnknown}
            onClose={() => setSheet(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sheet === "city" && (
          <PlaceSheet
            key="city"
            data={data}
            onConfirm={handleCityConfirm}
            onClose={() => setSheet(null)}
          />
        )}
      </AnimatePresence>

      {/* Conversational chat overlay */}
      <AnimatePresence>
        {chatOpen && (
          <ChatOverlay
            key="chat"
            onClose={() => setChatOpen(false)}
            onComplete={(d) => {
              setData(d);
              onCalculate();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AstroDesignPrototypePage() {
  const [screen, setScreen] = useState<Screen>("form");
  const [data, setData] = useState<FormData>(EMPTY);

  return (
    <div className="bg-surface flex h-full flex-col">
      {screen === "form" && (
        <FormScreen data={data} setData={setData} onCalculate={() => setScreen("loading")} />
      )}
      {screen === "loading" && <LoadingScreen onComplete={() => setScreen("reveal")} />}
      {screen === "reveal" && (
        <RevealScreen
          data={data}
          onDone={() => {
            setData(EMPTY);
            setScreen("form");
          }}
        />
      )}
    </div>
  );
}
