"use client";

import { useEffect, useMemo, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Screen = "form" | "review" | "loading";
type TimeRange = "morning" | "afternoon" | "evening" | "night" | "unknown";

interface FormData {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  period: "AM" | "PM";
  isApproximate: boolean;
  range?: TimeRange;
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
  isApproximate: false,
  city: "",
  state: "",
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
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

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

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

const TIME_RANGES: {
  id: TimeRange;
  label: string;
  sub: string;
  hour: string;
  minute: string;
  period: "AM" | "PM";
}[] = [
  { id: "morning", label: "Morning", sub: "6am – 12pm", hour: "9", minute: "00", period: "AM" },
  { id: "afternoon", label: "Afternoon", sub: "12pm – 6pm", hour: "3", minute: "00", period: "PM" },
  { id: "evening", label: "Evening", sub: "6pm – 12am", hour: "9", minute: "00", period: "PM" },
  { id: "night", label: "Night", sub: "12am – 6am", hour: "3", minute: "00", period: "AM" },
  {
    id: "unknown",
    label: "Approximate time bhi nahi pata",
    sub: "",
    hour: "12",
    minute: "00",
    period: "PM",
  },
];

const LOADING_MESSAGES = [
  "Aapki kundli ban rahi hai...",
  "Graho ki positions calculate ho rahi hain...",
  "Aapki unique personality decode ho rahi hai...",
  "Nakshatra aur dasha calculate ho rahe hain...",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function validateDate(
  day: string,
  month: string,
  year: string,
): {
  error: boolean;
  message: string | null;
} {
  if (!day || !month || !year) return { error: false, message: null };

  const d = new Date(parseInt(year), MONTHS.indexOf(month), parseInt(day));
  const now = new Date();
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  const age18 = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());

  // Invalid calendar date (e.g. Feb 30)
  if (d.getMonth() !== MONTHS.indexOf(month)) {
    return { error: true, message: "Yeh date exist nahi karti." };
  }
  if (d > now) {
    return { error: true, message: "Future date select nahi kar sakte." };
  }
  if (d < min) {
    return { error: true, message: "Date 120 saal se zyada purani hai." };
  }
  if (d > age18) {
    return {
      error: false,
      message: "18 saal se kam age ke liye kuch insights limited ho sakti hain.",
    };
  }
  return { error: false, message: null };
}

// ─── NLP Parser ───────────────────────────────────────────────────────────────

function parseBirthDetails(text: string): Partial<FormData> {
  const result: Partial<FormData> = {};
  const t = text;

  // ── Date ──
  // "15 March 1990" / "15th March 1990"
  const d1 = t.match(
    new RegExp(
      `(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join("|")}|${MONTHS.map((m) => m.slice(0, 3)).join("|")})\\s+(\\d{4})`,
      "i",
    ),
  );
  // "March 15, 1990"
  const d2 = t.match(
    new RegExp(
      `(${MONTHS.join("|")}|${MONTHS.map((m) => m.slice(0, 3)).join("|")})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})`,
      "i",
    ),
  );
  // DD/MM/YYYY or DD-MM-YYYY
  const d3 = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);

  if (d1) {
    const mIdx = MONTHS.findIndex((m) =>
      m.toLowerCase().startsWith(d1[2].toLowerCase().slice(0, 3)),
    );
    if (mIdx !== -1) {
      result.day = String(parseInt(d1[1]));
      result.month = MONTHS[mIdx];
      result.year = d1[3];
    }
  } else if (d2) {
    const mIdx = MONTHS.findIndex((m) =>
      m.toLowerCase().startsWith(d2[1].toLowerCase().slice(0, 3)),
    );
    if (mIdx !== -1) {
      result.day = String(parseInt(d2[2]));
      result.month = MONTHS[mIdx];
      result.year = d2[3];
    }
  } else if (d3) {
    result.day = String(parseInt(d3[1]));
    result.month = MONTHS[parseInt(d3[2]) - 1];
    result.year = d3[3];
  }

  // ── Time ── (HH:MM AM/PM first, then HH AM/PM, then 24h HH:MM)
  const t1 = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  const t2 = t.match(/(\d{1,2})\s*(am|pm)/i);
  const t3 = t.match(/(\d{1,2}):(\d{2})/);

  if (t1) {
    result.hour = String(parseInt(t1[1]));
    result.minute = t1[2];
    result.period = t1[3].toUpperCase() as "AM" | "PM";
  } else if (t2) {
    result.hour = String(parseInt(t2[1]));
    result.minute = "00";
    result.period = t2[2].toUpperCase() as "AM" | "PM";
  } else if (t3) {
    const h24 = parseInt(t3[1]);
    result.hour = String(h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24);
    result.minute = t3[2];
    result.period = h24 >= 12 ? "PM" : "AM";
  }

  // ── City — match against known list ──
  for (const c of CITIES) {
    if (t.toLowerCase().includes(c.city.toLowerCase())) {
      result.city = c.city;
      result.state = c.state;
      break;
    }
  }

  return result;
}

// ─── Unknown Time Bottom Sheet ─────────────────────────────────────────────────
// State is LOCAL — no stale-closure risk when calling onConfirm

function UnknownTimeModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (range: TimeRange) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<TimeRange | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(12,13,16,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface overflow-y-auto rounded-t-2xl px-5 pt-3 pb-10"
        style={{ maxHeight: "82%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-surface-moderate mx-auto mb-5 h-1 w-10 rounded-full" />

        <p className="text-headline-3xs font-jio mb-1 text-[#0c0d10]">🙏 Koi baat nahi!</p>
        <p className="text-body-s font-jio mb-5 text-[rgba(12,13,16,0.6)]">
          Approximate time se bhi insights milenge.
        </p>

        <div className="mb-6 flex flex-col gap-2">
          {TIME_RANGES.map((r) => {
            const active = selected === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id)}
                className="flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-150"
                style={
                  active
                    ? { borderColor: "#6d17ce", background: "#ede7ff" }
                    : { borderColor: "rgba(12,13,16,0.08)", background: "#f5f5f7" }
                }
              >
                <div>
                  <p
                    className="text-body-s font-jio font-semibold"
                    style={{ color: active ? "#6d17ce" : "#0c0d10" }}
                  >
                    {r.label}
                  </p>
                  {r.sub && (
                    <p className="text-body-2xs font-jio mt-0.5 text-[rgba(12,13,16,0.45)]">
                      {r.sub}
                    </p>
                  )}
                </div>
                <div
                  className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: active ? "#6d17ce" : "rgba(12,13,16,0.2)" }}
                >
                  {active && (
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#6d17ce" }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            if (selected) onConfirm(selected);
          }}
          disabled={!selected}
          className="text-btn font-jio duration-snappy h-12 w-full rounded-full text-white transition-transform hover:scale-[1.02] focus:outline-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          style={{ background: "#6d17ce" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Form Screen ───────────────────────────────────────────────────────────────

function FormScreen({
  data,
  setData,
  onNext,
  onOpenModal,
}: {
  data: FormData;
  setData: (d: FormData) => void;
  onNext: () => void;
  onOpenModal: () => void;
}) {
  const [inputMode, setInputMode] = useState<"form" | "chat">("form");
  const [chatText, setChatText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [parseResult, setParseResult] = useState<Partial<FormData> | null>(null);
  const [parseError, setParseError] = useState("");

  const [cityQuery, setCityQuery] = useState(
    data.city ? `${data.city}${data.state ? `, ${data.state}` : ""}` : "",
  );
  const [cityOpen, setCityOpen] = useState(false);
  const [manualCity, setManualCity] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualState, setManualState] = useState("");

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const daysInMonth = useMemo(() => {
    if (!data.month || !data.year) return 31;
    return new Date(parseInt(data.year), MONTHS.indexOf(data.month) + 1, 0).getDate();
  }, [data.month, data.year]);

  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  // Convert stored 12h (hour, minute, period) → "HH:MM" 24h string for <input type="time">
  const timeInputValue = useMemo(() => {
    if (!data.hour || !data.minute) return "";
    let h = parseInt(data.hour);
    if (data.period === "PM" && h !== 12) h += 12;
    if (data.period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${data.minute}`;
  }, [data.hour, data.minute, data.period]);

  function handleTimeChange(val: string) {
    if (!val) {
      setData({ ...data, hour: "", minute: "", isApproximate: false, range: undefined });
      return;
    }
    const [h24str, min] = val.split(":");
    const h24 = parseInt(h24str);
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const hour12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    setData({
      ...data,
      hour: String(hour12),
      minute: min,
      period,
      isApproximate: false,
      range: undefined,
    });
  }

  const filteredCities = useMemo(() => {
    if (cityQuery.length < 2) return [];
    const q = cityQuery.toLowerCase();
    return CITIES.filter((c) => c.city.toLowerCase().includes(q)).slice(0, 6);
  }, [cityQuery]);

  const dateValidation = validateDate(data.day, data.month, data.year);

  const isValid =
    !!data.day &&
    !!data.month &&
    !!data.year &&
    !!data.hour &&
    !!data.minute &&
    !!data.city &&
    !dateValidation.error;

  // Rounded-time nudge: exact :00 entered but not from approximate flow
  const showRoundedNudge = !!data.hour && data.minute === "00" && !data.isApproximate;

  const pill = "w-full bg-[#eeeeef] rounded-full px-5 py-4 flex items-center gap-3";
  const sel =
    "bg-transparent text-body-s font-jio text-[#0c0d10] appearance-none outline-none border-none";

  function handleReadDetails() {
    if (!chatText.trim()) {
      setParseError("Kuch type ya bol ke try karein.");
      return;
    }
    const parsed = parseBirthDetails(chatText);
    const hasAny = parsed.day || parsed.hour || parsed.city;
    if (!hasAny) {
      setParseError(
        'Koi detail samajh nahi aaya. Dobara try karein — e.g. "15 March 1990, 11:30 AM, Mumbai"',
      );
      return;
    }
    setParseError("");
    setParseResult(parsed);
    setData({ ...data, ...parsed });
    if (parsed.city) setCityQuery(`${parsed.city}${parsed.state ? `, ${parsed.state}` : ""}`);
  }

  function startVoice() {
    const SR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      setParseError("Voice input is browser mein supported nahi hai.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    setIsListening(true);
    setParseError("");
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setChatText((prev) => (prev ? `${prev} ${t}` : t));
      setIsListening(false);
    };
    rec.onerror = () => {
      setIsListening(false);
      setParseError("Voice capture nahi hua, dobara try karein.");
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  }

  function applyManualCity() {
    const name = manualName.trim();
    if (!name || !manualState) return;
    setData({ ...data, city: name, state: manualState });
    setCityQuery(`${name}, ${manualState}`);
    setManualCity(false);
    setManualName("");
    setManualState("");
  }

  function openManualEntry() {
    setManualCity(true);
    setCityOpen(false);
    setManualName(cityQuery.split(",")[0]?.trim() ?? "");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Hero — purple gradient, no overline */}
        <div
          className="relative overflow-hidden px-5 pt-10 pb-8"
          style={{ background: "linear-gradient(145deg,#f6f3ff 0%,#ede7ff 55%,#e4dbff 100%)" }}
        >
          <div
            className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full"
            style={{
              background: "radial-gradient(circle,rgba(109,23,206,0.18) 0%,transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute right-8 bottom-2 h-20 w-20 rounded-full"
            style={{
              background: "radial-gradient(circle,rgba(109,23,206,0.1) 0%,transparent 70%)",
            }}
          />

          <h1 className="font-jio mb-3 text-[26px] leading-tight font-bold text-[#0c0d10]">
            Let's read your stars
          </h1>
          <p className="text-body-l font-jio leading-snug text-[rgba(12,13,16,0.55)]">
            Your birth details help us map your unique cosmic blueprint.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 px-5 pt-5">
          {(["form", "chat"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setInputMode(m);
                setParseResult(null);
                setParseError("");
              }}
              className="text-body-s font-jio flex h-10 flex-1 items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150"
              style={
                inputMode === m
                  ? { background: "#6d17ce", color: "#fff" }
                  : { background: "#eeeeef", color: "rgba(12,13,16,0.55)" }
              }
            >
              {m === "form" ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="1"
                      y="3"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M4 7h8M4 10h5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>{" "}
                  Fill Form
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1a5 5 0 0 1 5 5c0 2.5-1.5 4.5-3.5 5.3L8 13l-1.5-1.7C4.5 10.5 3 8.5 3 6a5 5 0 0 1 5-5z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="8" cy="6" r="1.2" fill="currentColor" />
                  </svg>{" "}
                  Chat / Voice
                </>
              )}
            </button>
          ))}
        </div>

        {/* Chat / Voice panel */}
        {inputMode === "chat" && (
          <div className="flex flex-col gap-3 px-5 pt-4 pb-2">
            <p className="text-body-s font-jio text-[rgba(12,13,16,0.5)]">
              Apni janam details ek baar mein bolo ya likho — date, time, aur jagah.
            </p>

            {/* Input area */}
            <div className="relative">
              <textarea
                value={chatText}
                onChange={(e) => {
                  setChatText(e.target.value);
                  setParseResult(null);
                  setParseError("");
                }}
                placeholder={"e.g. I was born on 15 March 1990 at 11:30 AM in Mumbai"}
                rows={3}
                className="text-body-s font-jio w-full resize-none rounded-2xl bg-[#eeeeef] px-4 pt-4 pb-12 text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.35)]"
              />
              {/* Mic + clear row inside textarea */}
              <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={startVoice}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                  style={{ background: isListening ? "#6d17ce" : "rgba(109,23,206,0.1)" }}
                  title="Speak"
                >
                  {isListening ? (
                    <span className="h-3 w-3 animate-ping rounded-full bg-white" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="5"
                        y="1"
                        width="6"
                        height="9"
                        rx="3"
                        stroke="#6d17ce"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M2.5 8a5.5 5.5 0 0 0 11 0M8 13.5v2"
                        stroke="#6d17ce"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
                {chatText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setChatText("");
                      setParseResult(null);
                      setParseError("");
                    }}
                    className="text-body-2xs font-jio text-[rgba(12,13,16,0.35)]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {parseError && <p className="text-body-2xs font-jio text-[#c0392b]">⚠ {parseError}</p>}

            {/* Read button */}
            <button
              type="button"
              onClick={handleReadDetails}
              disabled={!chatText.trim()}
              className="text-body-s font-jio h-11 w-full rounded-full font-semibold text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35"
              style={{ background: "#6d17ce" }}
            >
              Read my details ✦
            </button>

            {/* Parsed preview */}
            {parseResult && (
              <div className="flex flex-col gap-1.5 rounded-2xl bg-[#ede7ff] px-4 py-3">
                <p className="text-body-2xs font-jio mb-1 font-semibold text-[#6d17ce]">
                  ✦ Yeh details mili hain:
                </p>
                {[
                  {
                    label: "Date",
                    value: parseResult.day
                      ? `${parseResult.day} ${parseResult.month} ${parseResult.year}`
                      : null,
                  },
                  {
                    label: "Time",
                    value: parseResult.hour
                      ? `${parseResult.hour}:${parseResult.minute} ${parseResult.period}`
                      : null,
                  },
                  {
                    label: "Place",
                    value: parseResult.city
                      ? `${parseResult.city}${parseResult.state ? `, ${parseResult.state}` : ""}`
                      : null,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-body-2xs font-jio w-10 text-[rgba(12,13,16,0.45)]">
                      {label}
                    </span>
                    {value ? (
                      <span className="text-body-s font-jio font-medium text-[#0c0d10]">
                        ✓ {value}
                      </span>
                    ) : (
                      <span className="text-body-2xs font-jio text-[#c0392b]">
                        Not found — fill manually
                      </span>
                    )}
                  </div>
                ))}
                {(!parseResult.day || !parseResult.hour || !parseResult.city) && (
                  <p className="text-body-2xs font-jio mt-1 text-[rgba(12,13,16,0.5)]">
                    Missing fields ko "Fill Form" tab mein complete karein.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fields */}
        <div
          className={`flex flex-col gap-6 px-5 pt-6 pb-8 ${inputMode === "chat" ? "hidden" : ""}`}
        >
          {/* ── Date of Birth ── */}
          <div className="flex flex-col gap-2">
            <p className="text-title-s font-jio text-[#0c0d10]">Date of Birth</p>
            <div className={pill}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="text-primary-50 shrink-0"
              >
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
              <select
                value={data.day}
                onChange={(e) => setData({ ...data, day: e.target.value })}
                className={`${sel} w-[42px]`}
              >
                <option value="">DD</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="font-jio text-[rgba(12,13,16,0.25)]">/</span>
              <select
                value={data.month}
                onChange={(e) => setData({ ...data, month: e.target.value })}
                className={`${sel} flex-1`}
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="font-jio text-[rgba(12,13,16,0.25)]">/</span>
              <select
                value={data.year}
                onChange={(e) => setData({ ...data, year: e.target.value })}
                className={`${sel} w-[68px]`}
              >
                <option value="">YYYY</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Date validation / under-18 note */}
            {dateValidation.message && (
              <p
                className={`text-body-2xs font-jio px-1 ${
                  dateValidation.error ? "text-[#c0392b]" : "text-[rgba(12,13,16,0.5)]"
                }`}
              >
                {dateValidation.error ? "⚠ " : "ℹ "}
                {dateValidation.message}
              </p>
            )}
          </div>

          {/* ── Time of Birth ── */}
          <div className="flex flex-col gap-2">
            <p className="text-title-s font-jio text-[#0c0d10]">Time of Birth</p>
            <div className={pill}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="text-primary-50 shrink-0"
              >
                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M9 5.5v4l2.5 2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="time"
                value={timeInputValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="text-body-s font-jio flex-1 border-none bg-transparent text-[#0c0d10] [color-scheme:light] outline-none"
              />
              {data.isApproximate && (
                <span className="text-warning text-label-s font-jio ml-auto shrink-0 rounded-full bg-[#fef0e6] px-2.5 py-[3px]">
                  ~Approx
                </span>
              )}
            </div>

            {/* Rounded time nudge */}
            {showRoundedNudge && (
              <p className="text-body-2xs font-jio px-1 text-[rgba(12,13,16,0.45)]">
                ℹ Exact minute add karne se aur accurate insights milenge.
              </p>
            )}

            {/* I don't know my exact time */}
            <button
              type="button"
              onClick={onOpenModal}
              className="mt-0.5 flex w-fit items-center gap-2.5 focus:outline-none"
            >
              <div
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${data.isApproximate ? "border-primary-50 bg-primary-50" : "border-[rgba(12,13,16,0.3)]"}`}
              >
                {data.isApproximate && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-body-s font-jio text-[rgba(12,13,16,0.6)]">
                I don't know my exact birth time
              </span>
            </button>
          </div>

          {/* ── Place of Birth ── */}
          <div className="flex flex-col gap-2">
            <p className="text-title-s font-jio text-[#0c0d10]">Place of Birth</p>

            {!manualCity ? (
              /* Search mode */
              <div className="relative">
                <div className={`${pill} ${cityOpen ? "bg-surface border-primary-50 border" : ""}`}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="text-primary-50 shrink-0"
                  >
                    <path
                      d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <circle cx="9" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter city name"
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setData({ ...data, city: "", state: "" });
                      setCityOpen(true);
                    }}
                    onFocus={() => setCityOpen(true)}
                    onBlur={() => setTimeout(() => setCityOpen(false), 200)}
                    className="text-body-s font-jio flex-1 bg-transparent text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.35)]"
                  />
                  {cityQuery.length > 0 && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setCityQuery("");
                        setData({ ...data, city: "", state: "" });
                      }}
                      className="shrink-0 text-[rgba(12,13,16,0.35)] focus:outline-none"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 4l8 8M12 4l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {cityOpen && cityQuery.length >= 2 && (
                  <div className="bg-surface shadow-elev-3 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border border-[rgba(12,13,16,0.06)]">
                    {filteredCities.length === 0 && (
                      <p className="text-body-2xs font-jio px-4 py-3 text-[rgba(12,13,16,0.45)]">
                        No results for "{cityQuery}"
                      </p>
                    )}

                    {filteredCities.map((c) => (
                      <button
                        key={`${c.city}-${c.state}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setData({ ...data, city: c.city, state: c.state });
                          setCityQuery(`${c.city}, ${c.state}`);
                          setCityOpen(false);
                        }}
                        className="hover:bg-primary-20 flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none"
                      >
                        <div className="bg-primary-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                          <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                            <path
                              d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z"
                              stroke="#6d17ce"
                              strokeWidth="1.3"
                            />
                            <circle cx="9" cy="7.5" r="2" stroke="#6d17ce" strokeWidth="1.3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-body-s font-jio font-semibold text-[#0c0d10]">
                            {c.city}
                          </p>
                          <p className="text-body-2xs font-jio text-[rgba(12,13,16,0.5)]">
                            {c.state}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Can't find city — always visible at bottom */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={openManualEntry}
                      className={`hover:bg-surface-ghost flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none ${filteredCities.length > 0 ? "border-t border-[rgba(12,13,16,0.05)]" : ""}`}
                    >
                      <div className="bg-surface-ghost flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 3v10M3 8h10"
                            stroke="#6d17ce"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-body-s font-jio text-primary-60 font-semibold">
                          Can't find your city?
                        </p>
                        <p className="text-body-2xs font-jio text-[rgba(12,13,16,0.45)]">
                          Enter manually
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Manual entry mode */
              <div className="flex flex-col gap-3">
                <div className={pill}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="text-primary-50 shrink-0"
                  >
                    <path
                      d="M9 1.5a6 6 0 0 1 6 6c0 4.5-6 9-6 9S3 12 3 7.5a6 6 0 0 1 6-6z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <circle cx="9" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="City / Town / Village"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    autoFocus
                    className="text-body-s font-jio flex-1 bg-transparent text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.35)]"
                  />
                </div>

                <div className={pill}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="text-primary-50 shrink-0"
                  >
                    <rect
                      x="1.5"
                      y="3.5"
                      width="15"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M6 8l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <select
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    className={`${sel} flex-1`}
                  >
                    <option value="">Select State / UT</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setManualCity(false);
                      setManualName("");
                      setManualState("");
                    }}
                    className="text-body-s font-jio hover:bg-surface-ghost h-10 flex-1 rounded-full border border-[rgba(12,13,16,0.12)] text-[rgba(12,13,16,0.6)] transition-colors focus:outline-none"
                  >
                    ← Back to search
                  </button>
                  <button
                    type="button"
                    onClick={applyManualCity}
                    disabled={!manualName.trim() || !manualState}
                    className="bg-primary-50 text-body-s font-jio hover:bg-primary-60 h-10 flex-1 rounded-full text-white transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-35"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* end scrollable */}

      {/* Sticky CTA — always visible */}
      <div className="bg-[#f5f5f5] px-5 pt-3 pb-6">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="text-btn font-jio duration-snappy flex h-14 w-full items-center justify-center gap-2 rounded-full text-white transition-transform hover:scale-[1.02] focus:outline-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35"
          style={{ background: "#6d17ce", boxShadow: "0 8px 28px rgba(109,23,206,0.35)" }}
        >
          <span>Calculate Kundli</span>
          <span className="opacity-70">✦</span>
        </button>
      </div>
    </div>
  );
}

// ─── Review Screen ─────────────────────────────────────────────────────────────

function ReviewScreen({
  data,
  onEdit,
  onSubmit,
}: {
  data: FormData;
  onEdit: () => void;
  onSubmit: () => void;
}) {
  const timeDisplay = data.isApproximate
    ? (TIME_RANGES.find((r) => r.id === data.range)?.label ?? "Approximate")
    : `${data.hour}:${data.minute} ${data.period}`;

  const placeDisplay = data.state ? `${data.city}, ${data.state}` : data.city;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-8 pb-8 [scrollbar-width:none]">
      <h1 className="text-headline-m font-jio mb-1 text-[#0c0d10]">Sab sahi hai?</h1>
      <p className="text-body-m font-jio mb-7 text-[rgba(12,13,16,0.55)]">
        Check karein — yeh aapki kundli ki neenv hai
      </p>

      <div className="bg-surface shadow-elev-2 mb-4 overflow-hidden rounded-3xl border border-[rgba(12,13,16,0.07)]">
        {[
          {
            emoji: "📅",
            label: "Date of Birth",
            value: `${data.day} ${data.month} ${data.year}`,
            approx: false,
          },
          { emoji: "⏰", label: "Time of Birth", value: timeDisplay, approx: data.isApproximate },
          { emoji: "📍", label: "Place of Birth", value: placeDisplay, approx: false },
        ].map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center gap-3 px-5 py-4 ${i < 2 ? "border-b border-[rgba(12,13,16,0.05)]" : ""}`}
          >
            <span className="shrink-0 text-2xl">{row.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-overline font-jio mb-0.5 text-[rgba(12,13,16,0.35)]">
                {row.label.toUpperCase()}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-title-s font-jio text-[#0c0d10]">{row.value}</p>
                {row.approx && (
                  <span className="text-warning text-label-s font-jio rounded-full bg-[#fef0e6] px-2.5 py-[2px]">
                    Approx
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.isApproximate && (
        <div className="mb-4 rounded-2xl bg-[#fef0e6] px-4 py-3">
          <p className="text-body-xs font-jio text-[rgba(12,13,16,0.65)]">
            ⚠ Approximate time se kuch house-based insights limited honge. Exact time milne pe
            update kar sakte hain.
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={onSubmit}
          className="text-btn font-jio duration-snappy flex h-14 w-full items-center justify-center gap-2 rounded-full text-white transition-transform hover:scale-[1.02] focus:outline-none active:scale-[0.97]"
          style={{ background: "#6d17ce", boxShadow: "0 8px 28px rgba(109,23,206,0.4)" }}
        >
          <span>Calculate Kundli</span>
          <span className="opacity-70">✦</span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="bg-surface-ghost text-btn font-jio duration-snappy focus-visible:ring-primary-60 h-12 w-full rounded-full text-[#0c0d10] transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          Edit Details
        </button>
      </div>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-[#f5f5f5] px-8">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(109,23,206,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="border-primary-40 absolute inset-5 animate-pulse rounded-xl border-2" />
        <div
          className="border-primary-50 absolute inset-11 rotate-45 animate-pulse rounded-sm border-2"
          style={{ animationDelay: "0.4s" }}
        />
        <div className="bg-primary-50 h-4 w-4 animate-ping rounded-full" />
        {(
          [
            { top: 18, left: 18 },
            { top: 18, right: 18 },
            { bottom: 18, left: 18 },
            { bottom: 18, right: 18 },
          ] as React.CSSProperties[]
        ).map((pos, i) => (
          <div
            key={i}
            className="bg-primary-40 absolute h-2 w-2 animate-pulse rounded-full"
            style={{ animationDelay: `${i * 0.2}s`, ...pos }}
          />
        ))}
      </div>

      <p
        key={msgIdx}
        className="text-headline-3xs font-jio animate-fade-in text-center text-[#0c0d10]"
      >
        {LOADING_MESSAGES[msgIdx]}
      </p>

      <div className="bg-primary-30 h-1.5 w-48 overflow-hidden rounded-full">
        <div
          className="bg-primary-50 h-full rounded-full"
          style={{ animation: "kundliload 5s ease-in-out forwards" }}
        />
      </div>

      <style>{`@keyframes kundliload { from { width: 0% } to { width: 90% } }`}</style>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AstroPage() {
  const [screen, setScreen] = useState<Screen>("form");
  const [data, setData] = useState<FormData>(EMPTY);
  const [showModal, setShowModal] = useState(false);

  // range comes from modal's LOCAL state — no stale closure
  function handleModalConfirm(range: TimeRange) {
    const r = TIME_RANGES.find((x) => x.id === range)!;
    setData((prev) => ({
      ...prev,
      hour: r.hour,
      minute: r.minute,
      period: r.period,
      isApproximate: true,
      range,
    }));
    setShowModal(false);
  }

  return (
    <div className="pt-safe flex h-full flex-col bg-[#f5f5f5]">
      {screen === "form" && (
        <FormScreen
          data={data}
          setData={setData}
          onNext={() => setScreen("review")}
          onOpenModal={() => setShowModal(true)}
        />
      )}
      {screen === "review" && (
        <ReviewScreen
          data={data}
          onEdit={() => setScreen("form")}
          onSubmit={() => setScreen("loading")}
        />
      )}
      {screen === "loading" && <LoadingScreen />}

      {/* Modal at root level — never clipped by any scroll container */}
      {showModal && (
        <UnknownTimeModal onConfirm={handleModalConfirm} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
