"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Chat overlay constants (mirrors Jobs HubChatInput) ────────────────────────
const BTN_SIZE  = 48;
const SEND_SIZE = 36;
const LINE_H    = 21;
const PILL_PY   = 6;
const MAX_LINES = 5;
const CHAT_EASE = [0.7, 0, 0.3, 1] as const;
const CHAT_DUR  = 0.28;
const btnMotion = {
  initial:    { opacity: 0, x: 16 },
  animate:    { opacity: 1, x: 0  },
  exit:       { opacity: 0, x: 16 },
  transition: { duration: CHAT_DUR * 0.75, ease: CHAT_EASE },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type Screen    = "form" | "review" | "loading" | "reveal";
type TimeRange = "morning" | "afternoon" | "evening" | "night" | "unknown";

interface FormData {
  day: string; month: string; year: string;
  hour: string; minute: string; period: "AM" | "PM";
  isApproximate: boolean; range?: TimeRange;
  city: string; state: string;
}

// In production this comes from auth/user profile
const USER_NAME = "Shivali";

const EMPTY: FormData = {
  day: "", month: "", year: "",
  hour: "", minute: "", period: "AM",
  isApproximate: false,
  city: "", state: "",
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const CITIES = [
  { city: "Mumbai",        state: "Maharashtra"    },
  { city: "Delhi",         state: "Delhi"          },
  { city: "Bengaluru",     state: "Karnataka"      },
  { city: "Hyderabad",     state: "Telangana"      },
  { city: "Chennai",       state: "Tamil Nadu"     },
  { city: "Kolkata",       state: "West Bengal"    },
  { city: "Jaipur",        state: "Rajasthan"      },
  { city: "Pune",          state: "Maharashtra"    },
  { city: "Ahmedabad",     state: "Gujarat"        },
  { city: "Lucknow",       state: "Uttar Pradesh"  },
  { city: "Bhopal",        state: "Madhya Pradesh" },
  { city: "Chandigarh",    state: "Punjab"         },
  { city: "Indore",        state: "Madhya Pradesh" },
  { city: "Patna",         state: "Bihar"          },
  { city: "Surat",         state: "Gujarat"        },
  { city: "Nagpur",        state: "Maharashtra"    },
  { city: "Coimbatore",    state: "Tamil Nadu"     },
  { city: "Kochi",         state: "Kerala"         },
  { city: "Visakhapatnam", state: "Andhra Pradesh" },
  { city: "Vadodara",      state: "Gujarat"        },
];

const TIME_RANGES: {
  id: TimeRange; label: string; sub: string;
  hour: string; minute: string; period: "AM" | "PM";
}[] = [
  { id: "morning",   label: "Morning",                        sub: "6am – 12pm", hour: "9",  minute: "00", period: "AM" },
  { id: "afternoon", label: "Afternoon",                      sub: "12pm – 6pm", hour: "3",  minute: "00", period: "PM" },
  { id: "evening",   label: "Evening",                        sub: "6pm – 12am", hour: "9",  minute: "00", period: "PM" },
  { id: "night",     label: "Night",                          sub: "12am – 6am", hour: "3",  minute: "00", period: "AM" },
  { id: "unknown",   label: "Approximate time bhi nahi pata", sub: "",           hour: "12", minute: "00", period: "PM" },
];

// ─── Sarvam TTS ────────────────────────────────────────────────────────────────

const SARVAM_KEY = "sk_afh7owtd_prjoh7ZH0nIN1HqF8wqRDuzU";

// Generate warm, personalised narration clips from birth data (each < 500 chars)
function generateBeatNarrations(data: FormData, userName: string): string[] {
  const ji    = userName ? `${userName} जी` : "आप";
  const name  = userName || "आप";
  const place = data.city || "आपके शहर";
  const date  = data.day && data.month ? `${data.day} ${data.month}` : "उस खास दिन";
  return [
    `${ji}, नमस्कार! आइए देखते हैं आपकी कुंडली। ${name} ${date} को ${place} में पैदा हुए — बड़ा खास दिन था वह। यहाँ देखिए पहला भाव — यह है आपका लग्न, आपकी पूरी पर्सनालिटी यहीं छुपी है। सूर्य यहाँ हैं, यानी आप में एक नैचरल लीडरशिप है।`,
    `अब आइए — यह देखिए दसवाँ भाव, यहाँ होता है आपका करियर। मंगल यहाँ बहुत मज़बूत खड़े हैं। मतलब जो भी काम करो, दिल लगाकर करो — सफलता खुद चलकर आएगी। बड़े goals रखो, डरो मत।`,
    `और यह देखिए — सातवाँ भाव, रिश्तों का घर। बृहस्पति यहाँ हैं, बहुत शुभ है यह। आपकी ज़िंदगी में एक समझदार और प्यार करने वाला साथी है या आएगा। रिश्तों में गहराई होगी।`,
    `चलते हैं चौथे भाव पर — घर, माँ और अंदर की शांति। चंद्रमा यहाँ बैठे हैं। घर में सुकून है, परिवार का प्यार भरपूर है। जब भी मन भारी हो, घर लौट आइए — वहीं energy मिलेगी।`,
    `और आखिर में — दूसरा भाव, धन और वाणी का घर। बुध यहाँ हैं। पैसा आएगा, और जो भी बोलेंगे लोग सुनेंगे — आपकी बात में दम है। ${ji}, सितारे आपके साथ हैं!`,
  ];
}

async function fetchSarvamAudio(text: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_KEY,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "hi-IN",
        speaker: "anushka",
        model: "bulbul:v2",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return `data:audio/wav;base64,${data.audios[0]}`;
  } catch {
    return null;
  }
}

// ─── Kundali Chart Geometry ─────────────────────────────────────────────────────
// 480×480 canvas. Key points:
//   Outer corners: TL(0,0), TR(480,0), BR(480,480), BL(0,480)
//   Diamond midpoints: T(240,0), R(480,240), B(240,480), L(0,240), C(240,240)
//   Diagonal×diamond intersections: D1(120,120), D2(360,120), D3(360,360), D4(120,360)

const HOUSE_POLYGONS: Record<number, string> = {
  1:  "240,0 360,120 240,240 120,120",       // top kite    (Lagna)
  2:  "240,0 480,0 360,120",                 // top-right ▲ upper
  3:  "480,0 480,240 360,120",               // top-right ▲ right
  4:  "480,240 360,360 240,240 360,120",     // right kite
  5:  "480,240 480,480 360,360",             // bottom-right ▲ right
  6:  "480,480 240,480 360,360",             // bottom-right ▲ lower
  7:  "240,480 120,360 240,240 360,360",     // bottom kite
  8:  "240,480 0,480 120,360",              // bottom-left ▲ lower
  9:  "0,480 0,240 120,360",               // bottom-left ▲ left
  10: "0,240 120,120 240,240 120,360",     // left kite
  11: "0,240 0,0 120,120",                // top-left ▲ left
  12: "0,0 240,0 120,120",               // top-left ▲ upper
};

const HOUSE_CENTROIDS: Record<number, [number, number]> = {
  1:  [240, 118],
  2:  [362,  38],
  3:  [442, 120],
  4:  [360, 240],
  5:  [442, 362],
  6:  [362, 442],
  7:  [240, 362],
  8:  [118, 442],
  9:  [ 38, 362],
  10: [120, 240],
  11: [ 38, 118],
  12: [118,  38],
};

const MOCK_PLANETS: { symbol: string; house: number; color: string }[] = [
  { symbol: "Su", house: 1,  color: "#e67e22" },
  { symbol: "Mo", house: 4,  color: "#607d8b" },
  { symbol: "Ma", house: 10, color: "#c0392b" },
  { symbol: "Me", house: 2,  color: "#27ae60" },
  { symbol: "Ju", house: 7,  color: "#f39c12" },
  { symbol: "Ve", house: 12, color: "#e91e63" },
  { symbol: "Sa", house: 3,  color: "#546e7a" },
  { symbol: "Ra", house: 6,  color: "#6d17ce" },
  { symbol: "Ke", house: 12, color: "#9b59b6" },
];

// ─── Reveal Beats ───────────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function validateDate(day: string, month: string, year: string): {
  error: boolean; message: string | null;
} {
  if (!day || !month || !year) return { error: false, message: null };
  const d     = new Date(parseInt(year), MONTHS.indexOf(month), parseInt(day));
  const now   = new Date();
  const min   = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  const age18 = new Date(now.getFullYear() - 18,  now.getMonth(), now.getDate());
  if (d.getMonth() !== MONTHS.indexOf(month)) return { error: true,  message: "Yeh date exist nahi karti." };
  if (d > now)  return { error: true,  message: "Future date select nahi kar sakte." };
  if (d < min)  return { error: true,  message: "Date 120 saal se zyada purani hai." };
  if (d > age18) return { error: false, message: "18 saal se kam age ke liye kuch insights limited ho sakti hain." };
  return { error: false, message: null };
}

function parseBirthDetails(text: string): Partial<FormData> {
  const result: Partial<FormData> = {};
  const t = text;
  const d1 = t.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join("|")}|${MONTHS.map(m => m.slice(0,3)).join("|")})\\s+(\\d{4})`, "i"));
  const d2 = t.match(new RegExp(`(${MONTHS.join("|")}|${MONTHS.map(m => m.slice(0,3)).join("|")})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})`, "i"));
  const d3 = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (d1) { const mi = MONTHS.findIndex(m => m.toLowerCase().startsWith(d1[2].toLowerCase().slice(0,3))); if (mi !== -1) { result.day = String(parseInt(d1[1])); result.month = MONTHS[mi]; result.year = d1[3]; } }
  else if (d2) { const mi = MONTHS.findIndex(m => m.toLowerCase().startsWith(d2[1].toLowerCase().slice(0,3))); if (mi !== -1) { result.day = String(parseInt(d2[2])); result.month = MONTHS[mi]; result.year = d2[3]; } }
  else if (d3) { result.day = String(parseInt(d3[1])); result.month = MONTHS[parseInt(d3[2]) - 1]; result.year = d3[3]; }
  const t1 = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  const t2 = t.match(/(\d{1,2})\s*(am|pm)/i);
  const t3 = t.match(/(\d{1,2}):(\d{2})/);
  if (t1) { result.hour = String(parseInt(t1[1])); result.minute = t1[2]; result.period = t1[3].toUpperCase() as "AM"|"PM"; }
  else if (t2) { result.hour = String(parseInt(t2[1])); result.minute = "00"; result.period = t2[2].toUpperCase() as "AM"|"PM"; }
  else if (t3) { const h24 = parseInt(t3[1]); result.hour = String(h24 > 12 ? h24-12 : h24 === 0 ? 12 : h24); result.minute = t3[2]; result.period = h24 >= 12 ? "PM" : "AM"; }
  for (const c of CITIES) { if (t.toLowerCase().includes(c.city.toLowerCase())) { result.city = c.city; result.state = c.state; break; } }
  return result;
}

// ─── ScrollPicker ──────────────────────────────────────────────────────────────

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
  const ref     = useRef<HTMLDivElement>(null);
  const timer   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ITEM_H  = 48;
  const VISIBLE = 5;
  const PAD     = ITEM_H * 2;

  useEffect(() => {
    if (!ref.current) return;
    const idx = Math.max(0, items.indexOf(value));
    // defer so the sheet has fully painted
    requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = idx * ITEM_H;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  function handleScroll() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx     = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onChange(items[clamped]);
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    }, 80);
  }

  return (
    <div className={`relative ${flex} overflow-hidden`}>
      {/* selection band */}
      <div className="pointer-events-none absolute left-1 right-1 rounded-xl"
        style={{ top: PAD, height: ITEM_H, background: "rgba(109,23,206,0.07)", borderTop: "1.5px solid rgba(109,23,206,0.2)", borderBottom: "1.5px solid rgba(109,23,206,0.2)" }} />
      {/* top fade */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-10"
        style={{ height: PAD, background: "linear-gradient(to bottom,rgba(255,255,255,0.97),rgba(255,255,255,0))" }} />
      {/* bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
        style={{ height: PAD, background: "linear-gradient(to top,rgba(255,255,255,0.97),rgba(255,255,255,0))" }} />

      <div
        ref={ref}
        onScroll={handleScroll}
        style={{ height: VISIBLE * ITEM_H, scrollSnapType: "y mandatory", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" as never }}
        className="overflow-y-scroll"
      >
        <div style={{ height: PAD }} />
        {items.map((item) => {
          const active = item === value;
          return (
            <div
              key={item}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className={`flex items-center justify-center select-none transition-all duration-75 font-jio ${
                active ? "text-[20px] font-bold text-[#0c0d10]" : "text-[15px] font-normal text-[rgba(12,13,16,0.22)]"
              }`}
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

// ─── Date Picker Sheet ─────────────────────────────────────────────────────────

function DatePickerSheet({
  data, onConfirm, onClose,
}: {
  data: FormData;
  onConfirm: (day: string, month: string, year: string) => void;
  onClose: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: currentYear - 1899 }, (_, i) => String(currentYear - i)), [currentYear]);

  const [month, setMonth] = useState(data.month || MONTHS[0]);
  const [year,  setYear]  = useState(data.year  || String(currentYear - 25));

  const daysInMonth = useMemo(() => new Date(parseInt(year), MONTHS.indexOf(month) + 1, 0).getDate(), [month, year]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0")), [daysInMonth]);

  const initDay = data.day ? String(Math.min(parseInt(data.day), daysInMonth)).padStart(2, "0") : "01";
  const [day, setDay] = useState(initDay);
  const clampedDay = useMemo(() => {
    const d = parseInt(day); return String(d > daysInMonth ? daysInMonth : d).padStart(2, "0");
  }, [day, daysInMonth]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(12,13,16,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl px-5 pt-3 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-[rgba(12,13,16,0.1)] rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-2">
          <p className="text-[17px] font-bold font-jio text-[#0c0d10]">Date of Birth</p>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Column labels */}
        <div className="flex mb-0 text-[11px] font-jio text-[rgba(12,13,16,0.38)] font-medium">
          <div className="flex-1 text-center">Day</div>
          <div className="flex-[2] text-center">Month</div>
          <div className="flex-1 text-center">Year</div>
        </div>

        <div className="flex gap-1">
          <ScrollPicker items={days}   value={clampedDay} onChange={setDay}   flex="flex-1" />
          <ScrollPicker items={MONTHS} value={month}      onChange={setMonth}  flex="flex-[2]" />
          <ScrollPicker items={years}  value={year}       onChange={setYear}   flex="flex-1" />
        </div>

        <button type="button" onClick={() => onConfirm(clampedDay, month, year)}
          className="w-full h-13 rounded-full text-white font-jio font-semibold text-[15px] mt-4"
          style={{ background: "#6d17ce", boxShadow: "0 8px 24px rgba(109,23,206,0.3)", height: 52 }}>
          Confirm
        </button>
      </div>
    </div>
  );
}

// ─── Time Picker Sheet ─────────────────────────────────────────────────────────

function TimePickerSheet({
  data, onConfirm, onConfirmApprox, onClose,
}: {
  data: FormData;
  onConfirm: (hour: string, minute: string, period: "AM" | "PM") => void;
  onConfirmApprox: (range: TimeRange) => void;
  onClose: () => void;
}) {
  const hours   = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),    []);

  const [hour,       setHour]       = useState(data.hour   ? String(parseInt(data.hour)).padStart(2, "0") : "09");
  const [minute,     setMinute]     = useState(data.minute || "00");
  const [period,     setPeriod]     = useState<"AM" | "PM">(data.period || "AM");
  const [showApprox, setShowApprox] = useState(false);
  const [approxSel,  setApproxSel]  = useState<TimeRange | null>(null);

  if (showApprox) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(12,13,16,0.5)" }} onClick={onClose}>
        <div className="bg-white rounded-t-3xl px-5 pt-3 pb-8" onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-1 bg-[rgba(12,13,16,0.1)] rounded-full mx-auto mb-4" />
          <div className="flex items-center gap-3 mb-5">
            <button type="button" onClick={() => setShowApprox(false)}
              className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <p className="text-[17px] font-bold font-jio text-[#0c0d10]">🙏 Koi baat nahi!</p>
          </div>
          <p className="text-[13px] font-jio text-[rgba(12,13,16,0.55)] mb-4">Approximate time se bhi insights milenge.</p>
          <div className="flex flex-col gap-2 mb-5">
            {TIME_RANGES.map((r) => {
              const active = approxSel === r.id;
              return (
                <button key={r.id} type="button" onClick={() => setApproxSel(r.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-150 text-left"
                  style={active ? { borderColor: "#6d17ce", background: "#ede7ff" } : { borderColor: "rgba(12,13,16,0.08)", background: "#f5f5f7" }}>
                  <div>
                    <p className="text-[14px] font-semibold font-jio" style={{ color: active ? "#6d17ce" : "#0c0d10" }}>{r.label}</p>
                    {r.sub && <p className="text-[12px] font-jio text-[rgba(12,13,16,0.45)] mt-0.5">{r.sub}</p>}
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3"
                    style={{ borderColor: active ? "#6d17ce" : "rgba(12,13,16,0.2)" }}>
                    {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6d17ce" }} />}
                  </div>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => { if (approxSel) onConfirmApprox(approxSel); }}
            disabled={!approxSel}
            className="w-full rounded-full text-white font-jio font-semibold text-[15px] disabled:opacity-40 disabled:pointer-events-none"
            style={{ background: "#6d17ce", height: 52 }}>
            Confirm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(12,13,16,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl px-5 pt-3 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-[rgba(12,13,16,0.1)] rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-2">
          <p className="text-[17px] font-bold font-jio text-[#0c0d10]">Time of Birth</p>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex mb-0 text-[11px] font-jio text-[rgba(12,13,16,0.38)] font-medium">
          <div className="flex-1 text-center">Hour</div>
          <div className="flex-1 text-center">Minute</div>
          <div className="w-[72px] text-center">AM / PM</div>
        </div>

        <div className="flex items-center gap-2">
          <ScrollPicker items={hours}   value={hour}   onChange={setHour}   flex="flex-1" />
          <span className="text-[22px] font-bold text-[rgba(12,13,16,0.2)] shrink-0 mb-0.5">:</span>
          <ScrollPicker items={minutes} value={minute} onChange={setMinute} flex="flex-1" />

          {/* AM / PM stacked toggle */}
          <div className="flex flex-col gap-2 w-[68px]">
            {(["AM","PM"] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)}
                className="h-[52px] rounded-2xl font-jio font-semibold text-[15px] transition-all"
                style={period === p ? { background: "#6d17ce", color: "#fff" } : { background: "#f5f5f5", color: "rgba(12,13,16,0.45)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={() => setShowApprox(true)}
          className="w-full text-center text-[13px] font-jio mt-3 mb-1" style={{ color: "#6d17ce" }}>
          I don't know my exact birth time →
        </button>

        <button type="button" onClick={() => onConfirm(String(parseInt(hour)), minute, period)}
          className="w-full rounded-full text-white font-jio font-semibold text-[15px] mt-2"
          style={{ background: "#6d17ce", boxShadow: "0 8px 24px rgba(109,23,206,0.3)", height: 52 }}>
          Confirm
        </button>
      </div>
    </div>
  );
}

// ─── City Picker Sheet ─────────────────────────────────────────────────────────

function CityPickerSheet({
  data, onConfirm, onClose,
}: {
  data: FormData;
  onConfirm: (city: string, state: string) => void;
  onClose: () => void;
}) {
  const [search,     setSearch]     = useState("");
  const [view,       setView]       = useState<"list" | "manual">("list");
  const [manualName, setManualName] = useState("");
  const [locating,   setLocating]   = useState(false);
  const [locateMsg,  setLocateMsg]  = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return CITIES;
    const q = search.toLowerCase();
    return CITIES.filter(c => c.city.toLowerCase().includes(q));
  }, [search]);

  function handleLocate() {
    if (typeof window === "undefined" || !navigator.geolocation) { setLocateMsg("Location is browser mein supported nahi hai."); return; }
    setLocating(true); setLocateMsg("");
    navigator.geolocation.getCurrentPosition(
      () => { setLocating(false); setLocateMsg("Location detect hua — neechay se apna city select karein."); },
      () => { setLocating(false); setLocateMsg("Location detect nahi hua. Please manually select karein."); },
    );
  }

  // ── Manual city sub-view ──
  if (view === "manual") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(12,13,16,0.5)" }} onClick={onClose}>
        <div className="bg-white rounded-t-3xl px-5 pt-3 pb-8" onClick={(e) => e.stopPropagation()}>
          <div className="w-10 h-1 bg-[rgba(12,13,16,0.1)] rounded-full mx-auto mb-4" />
          <div className="flex items-center gap-3 mb-5">
            <button type="button" onClick={() => setView("list")}
              className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <p className="text-[17px] font-bold font-jio text-[#0c0d10]">Enter City Name</p>
          </div>

          <div className="bg-[#f5f5f5] rounded-2xl px-4 py-4 mb-6 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z" stroke="#6d17ce" strokeWidth="1.3"/>
              <circle cx="9" cy="7.5" r="2" stroke="#6d17ce" strokeWidth="1.3"/>
            </svg>
            <input
              type="text"
              placeholder="Type your city / town / village"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-[14px] font-jio text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.35)]"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setView("list")}
              className="flex-1 h-12 rounded-full border border-[rgba(12,13,16,0.12)] text-[14px] font-jio text-[rgba(12,13,16,0.6)]">
              Cancel
            </button>
            <button type="button"
              onClick={() => { if (manualName.trim()) onConfirm(manualName.trim(), ""); }}
              disabled={!manualName.trim()}
              className="flex-1 h-12 rounded-full text-white text-[14px] font-jio font-semibold disabled:opacity-35 disabled:pointer-events-none"
              style={{ background: "#6d17ce" }}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── City list view ──
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(12,13,16,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-t-3xl pt-3 flex flex-col" style={{ maxHeight: "84%" }} onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-[rgba(12,13,16,0.1)] rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-3">
          <p className="text-[17px] font-bold font-jio text-[#0c0d10]">Select City</p>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 mb-2">
          <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-2xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="rgba(12,13,16,0.4)" strokeWidth="1.3"/>
              <path d="M11.5 11.5l2.5 2.5" stroke="rgba(12,13,16,0.4)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[14px] font-jio text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.35)]"
            />
            {search.length > 0 && (
              <button type="button" onClick={() => setSearch("")}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="rgba(12,13,16,0.35)" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        </div>

        {/* Locate me */}
        <div className="px-5 mb-1">
          <button type="button" onClick={handleLocate}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-colors"
            style={{ background: "rgba(109,23,206,0.07)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="3" stroke="#6d17ce" strokeWidth="1.3"/>
              <path d="M9 1.5v2.5M9 14v2.5M1.5 9H4M14 9h2.5" stroke="#6d17ce" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="text-[14px] font-jio font-medium" style={{ color: "#6d17ce" }}>
              {locating ? "Locating..." : "Locate me"}
            </span>
          </button>
          {locateMsg && <p className="text-[12px] font-jio text-[rgba(12,13,16,0.5)] mt-1 px-1">{locateMsg}</p>}
        </div>

        {/* City list */}
        <div className="overflow-y-auto flex-1 pb-6">
          {filtered.map((c) => {
            const selected = data.city === c.city;
            return (
              <button key={`${c.city}-${c.state}`} type="button"
                onClick={() => onConfirm(c.city, c.state)}
                className="w-full px-5 py-3 flex items-center gap-3 transition-colors text-left"
                style={selected ? { background: "rgba(109,23,206,0.05)" } : undefined}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(109,23,206,0.08)" }}>
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                    <path d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z" stroke="#6d17ce" strokeWidth="1.3"/>
                    <circle cx="9" cy="7.5" r="2" stroke="#6d17ce" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold font-jio text-[#0c0d10]">{c.city}</p>
                  <p className="text-[12px] font-jio text-[rgba(12,13,16,0.45)]">{c.state}</p>
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#6d17ce" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </button>
            );
          })}

          {/* No results → Add my own city */}
          {filtered.length === 0 && search.length > 0 && (
            <div className="px-5 pt-3">
              <p className="text-[12px] font-jio text-[rgba(12,13,16,0.45)] mb-3">
                No cities found for "{search}"
              </p>
              <button type="button"
                onClick={() => { setManualName(search); setView("manual"); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border"
                style={{ borderColor: "#6d17ce", background: "rgba(109,23,206,0.07)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 3v12M3 9h12" stroke="#6d17ce" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-[14px] font-jio font-semibold" style={{ color: "#6d17ce" }}>
                  Add my own city
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Overlay ──────────────────────────────────────────────────────────────

type ChatMsgType = "text" | "confirm" | "widget";
type ChatMsg = {
  id: string;
  role: "assistant" | "user";
  type: ChatMsgType;
  text: string;
  parsed?: Partial<FormData>;
};

type ChatState = "idle" | "confirming" | "done";

function ChatOverlay({
  data, onUpdateData, onClose, onReveal,
}: {
  data: FormData;
  onUpdateData: (d: FormData) => void;
  onClose: () => void;
  onReveal: () => void;
}) {
  const INIT: ChatMsg = {
    id: "init", role: "assistant", type: "text",
    text: "Namaskar! 🙏 Apni janam details batao — date, time aur jagah ek saath.\n\nExample: \"15 March 1990, 11:30 AM, Mumbai\"",
  };
  const [messages,    setMessages]    = useState<ChatMsg[]>([INIT]);
  const [chatState,   setChatState]   = useState<ChatState>("idle");
  const [pendingData, setPendingData] = useState<Partial<FormData> | null>(null);
  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]    = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const listRef     = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addRef      = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isListening]);

  useEffect(() => {
    const ta  = textareaRef.current;
    const add = addRef.current;
    if (!ta || !add) return;
    ta.style.height = "auto";
    const lines = Math.min(MAX_LINES, Math.ceil(ta.scrollHeight / LINE_H));
    ta.style.height = `${LINE_H * lines}px`;
    ta.style.overflowY = lines >= MAX_LINES ? "auto" : "hidden";
    const nowMulti = lines > 1;
    setIsMultiLine(nowMulti);
    add.style.alignSelf = nowMulti ? "flex-end" : "center";
  }, [input]);

  function addAssistant(text: string, type: ChatMsgType = "text", extra?: Partial<ChatMsg>) {
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", type, text, ...extra }]);
  }

  // ── User confirms the parsed details ──
  function handleConfirm(pd: Partial<FormData>) {
    setChatState("done");
    const merged = { ...data, ...pd };
    onUpdateData(merged);
    setTimeout(() => {
      addAssistant("✦ Perfect! Teri janam kundli ban rahi hai…", "text");
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `w-${Date.now()}`, role: "assistant", type: "widget",
          text: "Your birth chart is ready",
        }]);
      }, 800);
    }, 300);
  }

  // ── User wants to edit ──
  function handleEdit() {
    setChatState("idle");
    setPendingData(null);
    setTimeout(() => {
      addAssistant("Koi baat nahi! 🙏 Batao kya change karna hai — date, time ya jagah?");
    }, 200);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", type: "text", text };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setIsTyping(false);

    // If we're waiting for a yes/no confirmation
    if (chatState === "confirming" && pendingData) {
      const isYes = /^(yes|haan|ha\b|correct|theek|sahi|ok|okay|right|bilkul|haa|yep|yup|confirm)/i.test(text);
      const isNo  = /^(no|nahi|nope|edit|change|galat|wrong|update)/i.test(text);
      if (isYes) { setTimeout(() => handleConfirm(pendingData), 200); return; }
      if (isNo)  { setTimeout(() => handleEdit(), 200); return; }
      setTimeout(() => addAssistant("'Yes' bolo agar sab sahi hai, ya 'Edit' bolo kuch change karne ke liye."), 300);
      return;
    }

    // Parse details
    const parsed    = parseBirthDetails(text);
    const hasParsed = parsed.day || parsed.hour || parsed.city;

    setTimeout(() => {
      if (!hasParsed) {
        addAssistant("Kuch samajh nahi aaya 🙏\n\nPlease aise likho:\n\"15 March 1990, 11:30 AM, Mumbai\"");
        return;
      }
      const parts: string[] = [];
      if (parsed.day)  parts.push(`📅 ${parsed.day} ${parsed.month} ${parsed.year}`);
      if (parsed.hour) parts.push(`⏰ ${parsed.hour}:${parsed.minute} ${parsed.period}`);
      if (parsed.city) parts.push(`📍 ${parsed.city}${parsed.state ? `, ${parsed.state}` : ""}`);

      setPendingData(parsed);
      setChatState("confirming");
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`, role: "assistant", type: "confirm",
        text: parts.join("\n"),
        parsed,
      }]);
    }, 350);
  }

  function startVoice() {
    const SR = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      addAssistant("Voice input is browser mein supported nahi hai.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN"; rec.continuous = false; rec.interimResults = false;
    setIsListening(true);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInput(p => p ? `${p} ${t}` : t);
      setIsTyping(true);
      setIsListening(false);
    };
    rec.onerror = () => {
      setIsListening(false);
      addAssistant("Voice capture nahi hua. Dobara try karein.");
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 border-b border-[#EAEAEA]"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingBottom: 12 }}>
        <button type="button" onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="#0c0d10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <p className="text-[15px] font-bold font-jio text-[#0c0d10] leading-tight">Chat with Jyotish AI</p>
          <p className="text-[11px] font-jio text-[rgba(12,13,16,0.4)]">Type or speak your birth details</p>
        </div>
      </div>

      {/* Messages list */}
      <div ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages.map((msg) => {

          // ── Widget card ──
          if (msg.type === "widget") {
            return (
              <div key={msg.id} className="flex justify-start w-full">
                <button
                  type="button"
                  onClick={onReveal}
                  className="w-full rounded-3xl overflow-hidden active:scale-[0.97] transition-transform"
                  style={{
                    background: "linear-gradient(135deg,#3e0084 0%,#6d17ce 55%,#9b4de8 100%)",
                    boxShadow: "0 12px 32px rgba(109,23,206,0.45)",
                  }}>
                  {/* Stars decoration */}
                  <div className="relative px-5 pt-6 pb-5 flex flex-col items-center gap-3">
                    <div className="absolute top-3 right-4 text-[18px] opacity-60">✦</div>
                    <div className="absolute top-6 left-5 text-[11px] opacity-40">✦</div>
                    <div className="absolute bottom-4 right-8 text-[13px] opacity-50">✦</div>
                    {/* Mandala ring */}
                    <div className="w-16 h-16 rounded-full border-2 border-white border-opacity-30 flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.12)" }}>
                      <div className="w-10 h-10 rounded-full border border-white border-opacity-40 flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)" }}>
                        <span className="text-[22px]">🪐</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold font-jio text-[16px] leading-tight mb-1">
                        Your birth chart is ready
                      </p>
                      <p className="text-[rgba(255,255,255,0.65)] font-jio text-[12px]">
                        Tap to reveal your Kundli ✦
                      </p>
                    </div>
                    {/* Tap pill */}
                    <div className="mt-1 px-5 py-2 rounded-full"
                      style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}>
                      <span className="text-white font-jio font-semibold text-[13px]">Reveal now →</span>
                    </div>
                  </div>
                </button>
              </div>
            );
          }

          // ── Confirm card ──
          if (msg.type === "confirm") {
            const isActive = chatState === "confirming";
            return (
              <div key={msg.id} className="flex justify-start w-full">
                <div className="w-full rounded-2xl overflow-hidden" style={{ borderBottomLeftRadius: 6, background: "#f0f0f2" }}>
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[12px] font-semibold font-jio text-[rgba(12,13,16,0.45)] mb-2 uppercase tracking-wide">
                      Yeh details mili hain — sahi hai?
                    </p>
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className="text-[14px] font-jio text-[#0c0d10] leading-relaxed">{line}</p>
                    ))}
                  </div>
                  {isActive && msg.parsed && (
                    <div className="flex border-t border-[rgba(12,13,16,0.06)]">
                      <button type="button"
                        onClick={() => handleEdit()}
                        className="flex-1 py-3 text-[13px] font-jio font-medium text-[rgba(12,13,16,0.5)] border-r border-[rgba(12,13,16,0.06)] active:bg-[rgba(12,13,16,0.04)] transition-colors">
                        Edit details
                      </button>
                      <button type="button"
                        onClick={() => handleConfirm(msg.parsed!)}
                        className="flex-1 py-3 text-[13px] font-jio font-semibold active:bg-[rgba(109,23,206,0.05)] transition-colors"
                        style={{ color: "#6d17ce" }}>
                        Looks right ✓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // ── Regular text bubble ──
          return (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] font-jio leading-snug whitespace-pre-wrap"
                style={msg.role === "user"
                  ? { background: "#6d17ce", color: "#fff",    borderBottomRightRadius: 6 }
                  : { background: "#f0f0f2", color: "#0c0d10", borderBottomLeftRadius:  6 }}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isListening && (
          <div className="flex justify-start">
            <div className="bg-[#f0f0f2] rounded-2xl px-4 py-2.5 flex items-center gap-2" style={{ borderBottomLeftRadius: 6 }}>
              <span className="w-2 h-2 rounded-full bg-[#6d17ce] animate-ping" />
              <span className="text-[13px] font-jio text-[rgba(12,13,16,0.5)]">Listening…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input footer — exact Jobs HubChatInput pattern */}
      <footer className="sticky bottom-0 w-full bg-white"
        style={{ borderTop: "1px solid #EAEAEA", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center gap-[6px] px-4 py-3">

          {/* Add / attachment button */}
          <button ref={addRef} type="button" aria-label="Add"
            className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none"
            style={{ width: BTN_SIZE, height: BTN_SIZE, backgroundColor: "#f0e8fa", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="#6d17ce" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Input pill */}
          <motion.div
            className="flex min-w-0 flex-1 overflow-hidden"
            animate={{ borderRadius: isMultiLine ? 18 : 40 }}
            transition={{ duration: CHAT_DUR, ease: CHAT_EASE }}
            style={{
              backgroundColor: "#f5f5f5", borderRadius: 40,
              paddingLeft: 10, paddingRight: 6,
              paddingTop: PILL_PY, paddingBottom: PILL_PY,
              gap: "8px", display: "flex",
              alignItems: isMultiLine ? "flex-end" : "center",
              minHeight: BTN_SIZE,
            }}>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={chatState === "confirming" ? "Type 'yes' to confirm or 'edit' to change…" : "Type your birth details…"}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 resize-none border-none bg-transparent ring-0 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                fontSize: 16, lineHeight: `${LINE_H}px`,
                color: input ? "#141414" : "rgba(0,0,0,0.65)",
                height: LINE_H, maxHeight: LINE_H * MAX_LINES,
                overflowY: "hidden", padding: 0, margin: 0, display: "block",
              }}
            />
            <AnimatePresence>
              {isTyping && (
                <motion.button key="send" type="button" aria-label="Send"
                  onClick={handleSubmit}
                  className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center justify-center overflow-hidden rounded-full outline-none"
                  style={{ width: SEND_SIZE, height: SEND_SIZE, backgroundColor: "#3e0084", flexShrink: 0 }}
                  {...btnMotion}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 13V3M3 8l5-5 5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Speak button — disappears while typing */}
          <AnimatePresence>
            {!isTyping && (
              <motion.button key="speak" type="button" aria-label="Speak"
                onClick={startVoice}
                className="flex shrink-0 cursor-pointer touch-manipulation appearance-none items-center gap-[5px] overflow-hidden rounded-full px-3 outline-none"
                style={{ height: BTN_SIZE, backgroundColor: isListening ? "#6d17ce" : "#3e0084", flexShrink: 0 }}
                {...btnMotion}>
                {isListening
                  ? <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                  : <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="7" y="2" width="6" height="10" rx="3" stroke="white" strokeWidth="1.4"/>
                      <path d="M4 10a6 6 0 0 0 12 0M10 16v3" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                }
                <span className="text-base leading-normal whitespace-nowrap text-white">
                  {isListening ? "Listening" : "Speak"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      </footer>
    </div>
  );
}

// ─── Kundali Chart SVG ─────────────────────────────────────────────────────────

function KundaliChart({
  activeHouse, visitedHouses = new Set<number>(), allGlow = false, className,
}: {
  activeHouse: number | null;
  visitedHouses?: Set<number>;
  allGlow?: boolean;
  className?: string;
}) {
  const houseEntries = Object.entries(HOUSE_POLYGONS) as [string, string][];
  const centroidEntries = Object.entries(HOUSE_CENTROIDS) as [string, [number, number]][];
  const [spotX, spotY] = activeHouse !== null ? HOUSE_CENTROIDS[activeHouse] : [240, 240];

  return (
    <svg viewBox="0 0 480 480" className={className} style={{ display: "block" }}>
      <defs>
        <filter id="kglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="kglow-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* CSS keyframe for entry stagger — avoids Framer Motion owning SVG element styles */}
        <style>{`
          @keyframes kPoly { from { opacity: 0; } to { opacity: 1; } }
          @keyframes kText { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </defs>

      {/* ── House polygons: CSS-only stagger + CSS transitions for reactive glow ── */}
      {houseEntries.map(([hs, pts], index) => {
        const h       = parseInt(hs);
        const active  = h === activeHouse;
        const visited = visitedHouses.has(h);
        const fill        = allGlow || active ? "rgba(109,23,206,0.18)"
                          : visited           ? "rgba(109,23,206,0.09)"
                          :                     "rgba(255,255,255,0.55)";
        const stroke      = allGlow || active ? "#6d17ce"
                          : visited           ? "rgba(109,23,206,0.55)"
                          :                     "rgba(109,23,206,0.22)";
        const strokeWidth = allGlow || active ? 2.5 : visited ? 1.8 : 1.5;
        const filter      = active ? "url(#kglow)" : visited ? "url(#kglow-soft)" : undefined;
        return (
          <polygon
            key={h}
            points={pts}
            style={{
              fill, stroke, strokeWidth, filter,
              animation:       `kPoly 0.45s ease both`,
              animationDelay:  `${index * 0.07}s`,
              transition:      "fill 0.6s ease, stroke 0.6s ease",
              transitionDelay: allGlow ? `${index * 0.045}s` : "0s",
            }}
          />
        );
      })}

      {/* ── House numbers ── */}
      {centroidEntries.map(([hs, [cx, cy]], index) => {
        const h       = parseInt(hs);
        const active  = h === activeHouse;
        const visited = visitedHouses.has(h);
        return (
          <text
            key={h}
            x={cx} y={cy}
            textAnchor="middle" dominantBaseline="central"
            style={{
              fontSize:      active ? 20 : visited ? 16 : 15,
              fontWeight:    active ? 800 : visited ? 600 : 500,
              fill:          active ? "#6d17ce" : visited ? "rgba(109,23,206,0.65)" : "rgba(109,23,206,0.4)",
              animation:     `kText 0.3s ease both`,
              animationDelay:`${index * 0.07 + 0.18}s`,
              transition:    "fill 0.5s ease",
              fontFamily:    "system-ui,sans-serif",
              pointerEvents: "none",
            }}
          >{h}</text>
        );
      })}

      {/* ── Planet symbols ── */}
      {MOCK_PLANETS.map((p, i) => {
        const [cx, cy] = HOUSE_CENTROIDS[p.house];
        const angle    = (i * 137.5 * Math.PI) / 180;
        const px = cx + 22 * Math.cos(angle);
        const py = cy + 20 + 22 * Math.sin(angle);
        return (
          <text
            key={`pl-${i}`}
            x={px} y={py}
            textAnchor="middle" dominantBaseline="central"
            style={{
              fontSize: 9, fontWeight: 700, fill: p.color, fontFamily: "system-ui,sans-serif",
              animation: `kText 0.3s ease both`,
              animationDelay: `${0.85 + i * 0.05}s`,
              opacity: 0.9,
            }}
          >{p.symbol}</text>
        );
      })}

      {/* ── Sweeping spotlight — CSS transform transition for reliable SVG positioning ── */}
      {activeHouse !== null && (
        <g style={{
          transform: `translate(${spotX}px, ${spotY}px)`,
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <circle cx={0} cy={0} r="30" fill="none" stroke="#6d17ce" strokeWidth="2" opacity="0.45">
            <animate attributeName="r"       values="30;46;30" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.45;0;0.45" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={0} cy={0} r="13" fill="rgba(109,23,206,0.18)" stroke="#6d17ce" strokeWidth="1.5">
            <animate attributeName="opacity" values="1;0.35;1" dur="1.3s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  );
}

// ─── Reveal Screen ──────────────────────────────────────────────────────────────

function RevealScreen({ data, onDone }: { data: FormData; onDone: () => void }) {
  const [elapsed,     setElapsed]     = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [audioPaused, setAudioPaused] = useState(true);   // requires user tap
  // Pre-fetched base64 audio clips — one per beat (fetched in parallel on mount)
  const [audioClips,  setAudioClips]  = useState<(string | null)[]>(REVEAL_BEATS.map(() => null));
  const audioRef = useRef<HTMLAudioElement>(null);
  const cardRef  = useRef<HTMLDivElement>(null);
  const done     = elapsed >= REVEAL_TOTAL_SECS;

  // Current active beat + its index
  const activeBeatIdx = useMemo(
    () => {
      const idx = [...REVEAL_BEATS].map((b, i) => ({ b, i })).reverse().find(({ b }) => elapsed >= b.startSec);
      return idx?.i ?? 0;
    },
    [elapsed],
  );
  const activeBeat   = REVEAL_BEATS[activeBeatIdx];
  const visibleBeats = useMemo(() => REVEAL_BEATS.filter(b => elapsed >= b.startSec), [elapsed]);

  // Timer tick — runs independently of audio
  useEffect(() => {
    if (timerPaused || done) return;
    const id = setInterval(() => setElapsed(e => Math.min(e + 1, REVEAL_TOTAL_SECS)), 1000);
    return () => clearInterval(id);
  }, [timerPaused, done]);

  // Generate personalised narrations from birth data (memoised — doesn't change)
  const beatNarrations = useMemo(() => generateBeatNarrations(data, USER_NAME), [data]);

  // Pre-fetch all beat audio clips in parallel on mount
  useEffect(() => {
    beatNarrations.forEach((text, i) => {
      fetchSarvamAudio(text).then(src => {
        if (src) setAudioClips(prev => { const next = [...prev]; next[i] = src; return next; });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When beat advances and audio is playing — swap to next clip
  // This works because the audio element is already "unlocked" by the first user tap
  useEffect(() => {
    if (audioPaused) return;
    const clip = audioClips[activeBeatIdx];
    const audio = audioRef.current;
    if (!clip || !audio) return;
    audio.src = clip;
    audio.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBeatIdx]);

  // ── Audio toggle — MUST be called directly inside a click handler (user gesture) ──
  function handleAudioToggle() {
    const audio = audioRef.current;
    if (audioPaused) {
      setAudioPaused(false);
      setTimerPaused(false);
      // Play the current beat's clip — user gesture unlocks the audio element permanently
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

  // Scroll insight cards list when new card appears
  useEffect(() => {
    if (cardRef.current) cardRef.current.scrollTop = cardRef.current.scrollHeight;
  }, [visibleBeats.length]);

  const progress = Math.min(elapsed / REVEAL_TOTAL_SECS, 1);
  const timeLabel = done ? "Done" : `${REVEAL_TOTAL_SECS - elapsed}s`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 border-b border-[rgba(12,13,16,0.07)]"
        style={{ paddingTop: "calc(env(safe-area-inset-top,0px) + 12px)", paddingBottom: 12 }}>
        <div>
          <p className="text-[15px] font-bold font-jio text-[#0c0d10] leading-tight">
            {USER_NAME ? `${USER_NAME} ki Kundali` : "Aapki Kundali"}
          </p>
          <p className="text-[11px] font-jio text-[rgba(12,13,16,0.4)]">
            {data.day} {data.month} {data.year} · {data.city}
          </p>
        </div>
        <button type="button" onClick={onDone}
          className="text-[13px] font-jio font-semibold px-4 py-2 rounded-full transition-colors active:opacity-70"
          style={{ background: "#ede7ff", color: "#6d17ce" }}>
          Skip →
        </button>
      </div>

      {/* Progress bar + timer */}
      <div className="flex items-center gap-3 px-5 py-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(109,23,206,0.1)" }}>
          <div className="h-full rounded-full"
            style={{ background: "#6d17ce", width: `${progress * 100}%`, transition: "width 0.9s linear" }} />
        </div>
        <span className="text-[11px] font-jio font-medium shrink-0" style={{ color: "#6d17ce", minWidth: 32 }}>{timeLabel}</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Kundali chart — bigger, more breathing room */}
        <div className="px-3 pt-1 pb-2">
          <div className="rounded-3xl overflow-hidden p-3"
            style={{ background: "linear-gradient(145deg,#f8f5ff 0%,#ede7ff 60%,#f3eeff 100%)", boxShadow: "0 8px 32px rgba(109,23,206,0.12)" }}>
            <KundaliChart
              activeHouse={activeBeat.house}
              visitedHouses={new Set(visibleBeats.map(b => b.house).filter((h): h is number => h !== null))}
              allGlow={done}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Big punchy keyword */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`kw-${activeBeat.startSec}`}
            initial={{ opacity: 0, scale: 0.82, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.06, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center font-bold font-jio px-5 pt-3 pb-1"
            style={{ fontSize: 30, lineHeight: 1.15, color: "#0c0d10", letterSpacing: "-0.3px" }}>
            {activeBeat.keyword}
          </motion.p>
        </AnimatePresence>

        {/* Insight pill — one punchy line, different from audio */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`ins-${activeBeat.startSec}`}
            initial={{ opacity: 0, y: 10, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center px-5 pb-5">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-jio font-semibold"
              style={{ background: "rgba(109,23,206,0.08)", color: "#6d17ce", border: "1px solid rgba(109,23,206,0.16)" }}>
              ✦ {activeBeat.insight}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Completed beats — quiet progress chips */}
        {visibleBeats.length > 1 && (
          <div ref={cardRef} className="px-5 pb-3 flex flex-row flex-wrap gap-2 justify-center">
            {visibleBeats.slice(0, -1).map(beat => (
              <motion.span
                key={beat.startSec}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-[11px] font-jio font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: "#f0f0f2", color: "rgba(12,13,16,0.4)" }}>
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="#6d17ce" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {beat.badge ?? beat.title}
              </motion.span>
            ))}
          </div>
        )}

        {/* Done CTA — shimmer button */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="px-5 pt-2 pb-8">
            <button type="button" onClick={onDone}
              className="w-full h-14 rounded-full text-white font-jio font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
              style={{
                background: "linear-gradient(90deg,#3e0084 0%,#6d17ce 40%,#9b4de8 60%,#6d17ce 80%,#3e0084 100%)",
                backgroundSize: "250% auto",
                animation: "revealShimmer 2.5s linear infinite",
                boxShadow: "0 8px 32px rgba(109,23,206,0.5)",
              }}>
              <span>Poori Kundali Dekho</span>
              <span>✦</span>
            </button>
          </motion.div>
        )}
        <style>{`@keyframes revealShimmer { from { background-position: 0% center } to { background-position: 250% center } }`}</style>

        {/* Spacer so content isn't clipped by footer */}
        {!done && <div className="h-20" />}
      </div>

      {/* Floating pause/play footer */}
      {!done && (
        <div className="px-5 pb-6 pt-3 bg-white" style={{ borderTop: "1px solid rgba(12,13,16,0.06)" }}>
          <button type="button" onClick={handleAudioToggle}
            className="w-full h-12 rounded-full flex items-center justify-center gap-2 font-jio font-medium text-[14px] border transition-colors"
            style={{
              borderColor: "rgba(109,23,206,0.2)",
              color: "#6d17ce",
              background: audioPaused ? "rgba(109,23,206,0.06)" : "transparent",
            }}>
            {audioPaused ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 3l10 5-10 5V3z" fill="#6d17ce" />
                </svg>
                {audioClips[0] ? "Narration sunna shuru karein ▶" : "Narration load ho rahi hai…"}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="3" width="4" height="10" rx="1" fill="#6d17ce" />
                  <rect x="9" y="3" width="4" height="10" rx="1" fill="#6d17ce" />
                </svg>
                Pause narration
              </>
            )}
          </button>
        </div>
      )}

      {/* Hidden audio element — always mounted so ref is available on first tap */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}

// ─── Form Screen ───────────────────────────────────────────────────────────────

type Sheet = null | "date" | "time" | "city";

function FormScreen({
  data, setData, onNext, onReveal,
}: {
  data: FormData;
  setData: (d: FormData) => void;
  onNext: () => void;
  onReveal: () => void;
}) {
  const [sheet,     setSheet]     = useState<Sheet>(null);
  const [chatOpen,  setChatOpen]  = useState(false);

  const dateValidation = validateDate(data.day, data.month, data.year);
  const isValid =
    !!data.day && !!data.month && !!data.year &&
    !!data.hour && !!data.minute &&
    !!data.city &&
    !dateValidation.error;

  // ── Display strings for pills ──
  const dateDisplay = data.day && data.month && data.year
    ? `${data.day} ${data.month} ${data.year}`
    : null;
  const timeDisplay = data.hour && data.minute
    ? data.isApproximate
      ? `~${TIME_RANGES.find(r => r.id === data.range)?.label ?? "Approximate"}`
      : `${data.hour}:${data.minute} ${data.period}`
    : null;
  const cityDisplay = data.city
    ? data.state ? `${data.city}, ${data.state}` : data.city
    : null;

  // ── Sheet confirm handlers ──
  function handleDateConfirm(day: string, month: string, year: string) {
    setData({ ...data, day, month, year });
    setSheet(null);
  }
  function handleTimeConfirm(hour: string, minute: string, period: "AM" | "PM") {
    setData({ ...data, hour, minute, period, isApproximate: false, range: undefined });
    setSheet(null);
  }
  function handleTimeApprox(range: TimeRange) {
    const r = TIME_RANGES.find(x => x.id === range)!;
    setData({ ...data, hour: r.hour, minute: r.minute, period: r.period, isApproximate: true, range });
    setSheet(null);
  }
  function handleCityConfirm(city: string, state: string) {
    setData({ ...data, city, state });
    setSheet(null);
  }

  // ── Shared pill style ──
  const pill = "w-full bg-[#eeeeef] rounded-full px-5 py-4 flex items-center gap-3 cursor-pointer active:bg-[#e4e4e6] transition-colors";

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Hero */}
        <div className="px-5 pt-10 pb-8 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg,#f6f3ff 0%,#ede7ff 55%,#e4dbff 100%)" }}>
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(109,23,206,0.18) 0%,transparent 70%)" }} />
          <div className="absolute bottom-2 right-8 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(109,23,206,0.1) 0%,transparent 70%)" }} />
          <h1 className="text-[26px] font-bold text-[#0c0d10] font-jio leading-tight mb-3">
            Let's read your stars
          </h1>
          <p className="text-[14px] text-[rgba(12,13,16,0.55)] font-jio leading-snug">
            Your birth details help us map your unique cosmic blueprint.
          </p>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-5 px-5 pt-5 pb-6">

            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold font-jio text-[#0c0d10]">Date of Birth</p>
              <button type="button" onClick={() => setSheet("date")} className={pill}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0" style={{ color: "#6d17ce" }}>
                  <rect x="1.5" y="3" width="15" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M6 1.5v3M12 1.5v3M1.5 7.5h15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className={`flex-1 text-left text-[14px] font-jio ${dateDisplay ? "text-[#0c0d10] font-medium" : "text-[rgba(12,13,16,0.35)]"}`}>
                  {dateDisplay ?? "DD / Month / YYYY"}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M5 7l3 3 3-3" stroke="rgba(12,13,16,0.3)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {dateValidation.message && (
                <p className={`text-[12px] font-jio px-1 ${dateValidation.error ? "text-[#c0392b]" : "text-[rgba(12,13,16,0.5)]"}`}>
                  {dateValidation.error ? "⚠ " : "ℹ "}{dateValidation.message}
                </p>
              )}
            </div>

            {/* Time of Birth */}
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold font-jio text-[#0c0d10]">Time of Birth</p>
              <button type="button" onClick={() => setSheet("time")} className={pill}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0" style={{ color: "#6d17ce" }}>
                  <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M9 5.5v4l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className={`flex-1 text-left text-[14px] font-jio ${timeDisplay ? "text-[#0c0d10] font-medium" : "text-[rgba(12,13,16,0.35)]"}`}>
                  {timeDisplay ?? "HH : MM  AM / PM"}
                </span>
                {data.isApproximate && (
                  <span className="text-[11px] font-jio rounded-full px-2.5 py-[3px] shrink-0 font-medium" style={{ background: "#fef0e6", color: "#c87532" }}>~Approx</span>
                )}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M5 7l3 3 3-3" stroke="rgba(12,13,16,0.3)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Place of Birth */}
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold font-jio text-[#0c0d10]">Place of Birth</p>
              <button type="button" onClick={() => setSheet("city")} className={pill}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0" style={{ color: "#6d17ce" }}>
                  <path d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="9" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <span className={`flex-1 text-left text-[14px] font-jio ${cityDisplay ? "text-[#0c0d10] font-medium" : "text-[rgba(12,13,16,0.35)]"}`}>
                  {cityDisplay ?? "Select city"}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M5 7l3 3 3-3" stroke="rgba(12,13,16,0.3)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

          </div>

      </div>{/* end scrollable */}

      {/* Sticky CTA row */}
      <div className="px-5 pt-3 pb-6 bg-[#f5f5f5] flex items-center gap-3">
        {/* Chat / Voice button */}
        <button type="button" onClick={() => setChatOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
          style={{ background: "#f0e8fa" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="7" y="2" width="8" height="12" rx="4" stroke="#6d17ce" strokeWidth="1.5"/>
            <path d="M4 11a7 7 0 0 0 14 0M11 18v3" stroke="#6d17ce" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Calculate Kundli */}
        <button type="button" onClick={onNext} disabled={!isValid}
          className="flex-1 h-14 rounded-full text-white font-jio font-semibold text-[15px] flex items-center justify-center gap-2
            transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-35 disabled:pointer-events-none"
          style={{ background: "#6d17ce", boxShadow: "0 8px 28px rgba(109,23,206,0.35)" }}>
          <span>Calculate Kundli</span>
          <span className="opacity-70">✦</span>
        </button>
      </div>

      {/* Bottom sheets */}
      {sheet === "date" && (
        <DatePickerSheet data={data} onConfirm={handleDateConfirm} onClose={() => setSheet(null)} />
      )}
      {sheet === "time" && (
        <TimePickerSheet data={data} onConfirm={handleTimeConfirm} onConfirmApprox={handleTimeApprox} onClose={() => setSheet(null)} />
      )}
      {sheet === "city" && (
        <CityPickerSheet data={data} onConfirm={handleCityConfirm} onClose={() => setSheet(null)} />
      )}

      {/* Chat overlay */}
      {chatOpen && (
        <ChatOverlay
          data={data}
          onUpdateData={setData}
          onClose={() => setChatOpen(false)}
          onReveal={() => { setChatOpen(false); onReveal(); }}
        />
      )}
    </div>
  );
}

// ─── Review Screen ─────────────────────────────────────────────────────────────

function ReviewScreen({ data, onEdit, onSubmit }: {
  data: FormData; onEdit: () => void; onSubmit: () => void;
}) {
  const timeDisplay = data.isApproximate
    ? (TIME_RANGES.find(r => r.id === data.range)?.label ?? "Approximate")
    : `${data.hour}:${data.minute} ${data.period}`;
  const placeDisplay = data.state ? `${data.city}, ${data.state}` : data.city;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-8 pb-8 [scrollbar-width:none]">
      <h1 className="text-[22px] font-bold font-jio text-[#0c0d10] mb-1">Sab sahi hai?</h1>
      <p className="text-[14px] font-jio text-[rgba(12,13,16,0.55)] mb-7">Check karein — yeh aapki kundli ki neenv hai</p>

      <div className="bg-white rounded-3xl border border-[rgba(12,13,16,0.07)] shadow-sm overflow-hidden mb-4">
        {[
          { emoji: "📅", label: "DATE OF BIRTH",  value: `${data.day} ${data.month} ${data.year}`,  approx: false },
          { emoji: "⏰", label: "TIME OF BIRTH",  value: timeDisplay,                               approx: data.isApproximate },
          { emoji: "📍", label: "PLACE OF BIRTH", value: placeDisplay,                              approx: false },
        ].map((row, i) => (
          <div key={row.label} className={`flex items-center gap-3 px-5 py-4 ${i < 2 ? "border-b border-[rgba(12,13,16,0.05)]" : ""}`}>
            <span className="text-2xl shrink-0">{row.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium font-jio tracking-widest text-[rgba(12,13,16,0.35)] mb-0.5">{row.label}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[15px] font-semibold font-jio text-[#0c0d10]">{row.value}</p>
                {row.approx && (
                  <span className="text-[11px] font-jio rounded-full px-2.5 py-[2px] font-medium" style={{ background: "#fef0e6", color: "#c87532" }}>Approx</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.isApproximate && (
        <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: "#fef0e6" }}>
          <p className="text-[12px] font-jio text-[rgba(12,13,16,0.65)]">
            ⚠ Approximate time se kuch house-based insights limited honge. Exact time milne pe update kar sakte hain.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-auto">
        <button type="button" onClick={onSubmit}
          className="w-full h-14 rounded-full text-white font-jio font-semibold text-[15px] flex items-center justify-center gap-2
            transition-transform hover:scale-[1.02] active:scale-[0.97]"
          style={{ background: "#6d17ce", boxShadow: "0 8px 28px rgba(109,23,206,0.4)" }}>
          <span>Calculate Kundli</span><span className="opacity-70">✦</span>
        </button>
        <button type="button" onClick={onEdit}
          className="w-full h-12 rounded-full font-jio font-semibold text-[14px] text-[#0c0d10] transition-transform hover:scale-[1.02] active:scale-[0.97]"
          style={{ background: "#eeeeef" }}>
          Edit Details
        </button>
      </div>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!onComplete) return;
    const id = setTimeout(onComplete, 5500);
    return () => clearTimeout(id);
  }, [onComplete]);
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-8 gap-8 bg-[#f5f5f5]">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: "radial-gradient(circle, rgba(109,23,206,0.1) 0%, transparent 70%)" }} />
        <div className="absolute inset-5 rounded-xl border-2 animate-pulse" style={{ borderColor: "rgba(109,23,206,0.4)" }} />
        <div className="absolute inset-11 rotate-45 border-2 rounded-sm animate-pulse"
          style={{ borderColor: "#6d17ce", animationDelay: "0.4s" }} />
        <div className="w-4 h-4 rounded-full animate-ping" style={{ background: "#6d17ce" }} />
        {([{ top: 18, left: 18 },{ top: 18, right: 18 },{ bottom: 18, left: 18 },{ bottom: 18, right: 18 }] as React.CSSProperties[]).map((pos, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s`, background: "rgba(109,23,206,0.4)", ...pos }} />
        ))}
      </div>
      <p key={msgIdx} className="text-[16px] font-bold font-jio text-[#0c0d10] text-center">
        {LOADING_MESSAGES[msgIdx]}
      </p>
      <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(109,23,206,0.2)" }}>
        <div className="h-full rounded-full" style={{ background: "#6d17ce", animation: "kundliload 5s ease-in-out forwards" }} />
      </div>
      <style>{`@keyframes kundliload { from { width: 0% } to { width: 90% } }`}</style>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AstroPage() {
  const [screen, setScreen] = useState<Screen>("form");
  const [data,   setData]   = useState<FormData>(EMPTY);

  return (
    <div className="bg-[#f5f5f5] flex h-full flex-col pt-safe">
      {screen === "form"    && <FormScreen   data={data} setData={setData} onNext={() => setScreen("review")} onReveal={() => setScreen("loading")} />}
      {screen === "review"  && <ReviewScreen data={data} onEdit={() => setScreen("form")} onSubmit={() => setScreen("loading")} />}
      {screen === "loading" && <LoadingScreen onComplete={() => setScreen("reveal")} />}
      {screen === "reveal"  && <RevealScreen data={data} onDone={() => setScreen("form")} />}
    </div>
  );
}
