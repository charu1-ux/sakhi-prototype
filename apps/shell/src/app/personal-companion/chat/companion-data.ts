// ────────────────────────────────────────────────────────────────────────────
// Dil Ki Baat — companion data, copy, language handling, and the mock reply engine.
//
// There is no proxy.py in this Next.js shell, so the companion runs on a
// deterministic, Rogerian, language-aware reply engine. This mirrors the PRD's
// "deterministic keyword-reply fallback" and keeps the prototype fully demoable.
// Swap `generateReply` for a fetch('/api/chat', …) call to wire a real backend —
// the bubble/timing contract is already shaped for it.
// ────────────────────────────────────────────────────────────────────────────

export type UiLanguage = "hinglish" | "hi" | "en";

export type ReplyLanguage = UiLanguage | "kn" | "mr";

export type EmotionBucket =
  | "SAD"
  | "ANXIOUS"
  | "LONELY"
  | "CONFLICT"
  | "CONFUSED"
  | "POSITIVE"
  | "TALK"
  | "NEUTRAL"
  | "CRISIS";

export type Sender = "user" | "companion";

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  /** "call" records render as a system pill rather than a bubble. */
  kind?: "text" | "call-record";
  crisis?: boolean;
  /** Voice message — renders as a waveform + transcript; companion ones speak (TTS). */
  voice?: boolean;
  /** Spoken length in seconds (for the waveform duration label). */
  durationSec?: number;
  /** TTS voice family for companion voice messages. */
  voiceLang?: "hi" | "en";
};

/** Rough spoken duration from text length — for the voice-note duration label. */
export function estimateVoiceDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 2.4));
}

/** Map a reply language to a TTS voice family (Devanagari → Hindi voice). */
export function ttsLangFor(lang: ReplyLanguage): "hi" | "en" {
  return lang === "hi" || lang === "kn" || lang === "mr" ? "hi" : "en";
}

export type Bubble = { text: string; delayMs: number };

// ── Companion identity ───────────────────────────────────────────────────────

export const COMPANION = {
  name: "Dil Ki Baat",
  interests: ["Cricket", "Chai", "Bollywood", "Music", "Spice of Life"],
  version: "v1.0 · Prototype",
};

export const CRISIS_HELPLINES = [
  { name: "iCall", number: "9152987821" },
  { name: "Vandrevala Foundation", number: "1860-2662-345" },
  { name: "NIMHANS", number: "080-46110007" },
];

// ── UI strings per language ──────────────────────────────────────────────────

type UiStrings = {
  statusFriend: string;
  activeNow: string;
  call: string;
  composerPlaceholder: string;
  tapToTalk: string;
  listening: string;
  transcribing: string;
  typeInstead: string;
  reRecord: string;
  retry: string;
  micDenied: string;
  profileTagline: string;
  language: string;
  interests: string;
  clearChat: string;
  connecting: string;
  callEnded: string;
  speaking: string;
  yourFriend: string;
  // call controls
  mute: string;
  unmute: string;
  speaker: string;
  earpiece: string;
  endCall: string;
  muted: string;
  // voice note
  recordingHint: string;
  send: string;
  cancel: string;
};

export const UI: Record<UiLanguage, UiStrings> = {
  hinglish: {
    statusFriend: "Your friend",
    activeNow: "Active now",
    call: "Call",
    composerPlaceholder: "Batao kuch bhi",
    tapToTalk: "Tap to talk",
    listening: "Listening… tap to stop",
    transcribing: "Transcribing…",
    typeInstead: "Type instead",
    reRecord: "Fir se bolo",
    retry: "Retry",
    micDenied: "Mic ka access chahiye voice ke liye. Settings mein allow karo.",
    profileTagline: "Your friend, your companion",
    language: "Language",
    interests: "Interests",
    clearChat: "Clear chat history",
    connecting: "Connecting…",
    callEnded: "Call ended",
    speaking: "speaking…",
    yourFriend: "Your friend",
    mute: "Mute",
    unmute: "Unmute",
    speaker: "Speaker",
    earpiece: "Earpiece",
    endCall: "End",
    muted: "Muted",
    recordingHint: "Sun raha hoon… ho jaye toh bhej do",
    send: "Send",
    cancel: "Cancel",
  },
  hi: {
    statusFriend: "आपका दोस्त",
    activeNow: "अभी ऑनलाइन",
    call: "कॉल",
    composerPlaceholder: "कुछ भी पूछो",
    tapToTalk: "बोलने के लिए टैप करें",
    listening: "सुन रहा हूँ… रोकने के लिए टैप करें",
    transcribing: "लिख रहा हूँ…",
    typeInstead: "टाइप करें",
    reRecord: "फिर से बोलें",
    retry: "फिर से कोशिश करें",
    micDenied: "वॉइस के लिए माइक का एक्सेस चाहिए। सेटिंग्स में अनुमति दें।",
    profileTagline: "आपका दोस्त, आपका साथी",
    language: "भाषा",
    interests: "रुचियाँ",
    clearChat: "चैट हिस्ट्री मिटाएँ",
    connecting: "कनेक्ट हो रहा है…",
    callEnded: "कॉल समाप्त",
    speaking: "बोल रहा है…",
    yourFriend: "आपका दोस्त",
    mute: "म्यूट",
    unmute: "अनम्यूट",
    speaker: "स्पीकर",
    earpiece: "ईयरपीस",
    endCall: "समाप्त",
    muted: "म्यूट है",
    recordingHint: "सुन रहा हूँ… हो जाए तो भेज दो",
    send: "भेजें",
    cancel: "रद्द करें",
  },
  en: {
    statusFriend: "Your friend",
    activeNow: "Active now",
    call: "Call",
    composerPlaceholder: "Ask me anything",
    tapToTalk: "Tap to talk",
    listening: "Listening… tap to stop",
    transcribing: "Transcribing…",
    typeInstead: "Type instead",
    reRecord: "Re-record",
    retry: "Retry",
    micDenied: "Microphone access is needed for voice. Allow it in Settings.",
    profileTagline: "Your friend, your companion",
    language: "Language",
    interests: "Interests",
    clearChat: "Clear chat history",
    connecting: "Connecting…",
    callEnded: "Call ended",
    speaking: "speaking…",
    yourFriend: "Your friend",
    mute: "Mute",
    unmute: "Unmute",
    speaker: "Speaker",
    earpiece: "Earpiece",
    endCall: "End",
    muted: "Muted",
    recordingHint: "Listening… tap send when done",
    send: "Send",
    cancel: "Cancel",
  },
};

export const LANGUAGE_OPTIONS: { value: UiLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "hinglish", label: "Hinglish" },
];

// ── Greetings ────────────────────────────────────────────────────────────────

export const FIRST_TIME_GREETING: Record<UiLanguage, string[]> = {
  hinglish: ["Arre, aa gaye!", "Batao, kaisa chal raha hai?"],
  hi: ["नमस्ते!", "आज कैसा महसूस हो रहा है?"],
  en: ["Hey, so glad you're here.", "How are you doing today?"],
};

export const RETURNING_GREETING: Record<UiLanguage, string[]> = {
  hinglish: ["Wapas aa gaye!", "Kuch share karna tha aaj?"],
  hi: ["फिर आ गए!", "कैसा चल रहा है आज?"],
  en: ["Hey, you're back.", "How have you been?"],
};

// A returning greeting that references a remembered mood (the trust trigger).
export const RETURNING_MEMORY_GREETING: Record<UiLanguage, string[]> = {
  hinglish: ["Wapas aa gaye!", "Kal kaafi tense lag rahe the — aaj kaisa feel ho raha hai?"],
  hi: ["फिर आ गए!", "कल आप काफ़ी परेशान लग रहे थे — आज कैसा लग रहा है?"],
  en: ["Hey, you're back.", "You seemed pretty tense yesterday — how are you feeling today?"],
};

// ── Quick chips (shown above composer when empty, early sessions) ──────────────

export type QuickChip = { id: string; label: string; isCall?: boolean };

export const QUICK_CHIPS: Record<UiLanguage, QuickChip[]> = {
  hinglish: [
    { id: "talk", label: "Bas baat karni hai" },
    { id: "sad", label: "Udaas hoon" },
    { id: "lonely", label: "Akela feel ho raha hai" },
    { id: "anxious", label: "Ghabrahat ho rahi hai" },
    { id: "call", label: "Call me", isCall: true },
  ],
  hi: [
    { id: "talk", label: "बस बात करनी है" },
    { id: "sad", label: "उदास हूँ" },
    { id: "lonely", label: "अकेला लग रहा है" },
    { id: "anxious", label: "घबराहट हो रही है" },
    { id: "call", label: "कॉल करें", isCall: true },
  ],
  en: [
    { id: "talk", label: "Just here to talk" },
    { id: "sad", label: "I'm feeling sad" },
    { id: "lonely", label: "I'm lonely" },
    { id: "anxious", label: "I'm anxious" },
    { id: "call", label: "Call me", isCall: true },
  ],
};

// ── Language detection (script-level, message-level mirroring) ─────────────────

const DEVANAGARI = /[ऀ-ॿ]/;
const KANNADA = /[ಀ-೿]/;

// Common Hinglish (romanised Hindi) markers — distinguishes from plain English.
const HINGLISH_MARKERS =
  /\b(hai|hoon|hu|nahi|nahin|yaar|kya|kaisa|kaise|kuch|mujhe|mera|meri|tum|aap|bahut|bohot|accha|theek|raha|rahi|kar|kyun|kyu|matlab|abhi|aaj|kal|baat|dil|pareshan|udaas|akela|ghabra)\b/i;

export function detectLanguage(text: string, uiLanguage: UiLanguage): ReplyLanguage {
  if (KANNADA.test(text)) return "kn";
  if (DEVANAGARI.test(text)) return "hi"; // Devanagari → Hindi/Marathi family
  if (HINGLISH_MARKERS.test(text)) return "hinglish";
  // No strong signal: fall back to the UI language.
  return uiLanguage;
}

// ── Emotion + crisis classification (keyword based) ────────────────────────────

const CRISIS_TERMS =
  /\b(suicide|kill myself|end my life|end it all|don'?t want to live|marna chahta|marna chahti|jeena nahi|jaan dena|atmahatya|self ?harm|harm myself|cut myself|no reason to live)\b|आत्महत्या|मरना चाहता|जीना नहीं|खुद को|जान दे/i;

export function classifyEmotion(text: string): EmotionBucket {
  const t = text.toLowerCase();
  if (CRISIS_TERMS.test(text)) return "CRISIS";
  if (
    /(just here to talk|here to talk|just want to talk|wanna talk|just talk|bas baat|baat karni|baat karne|baatein|timepass|bas aise|yunhi|bas chill|bas connect|बात करनी|बस बात|यूँ ही|बातें)/i.test(
      t,
    )
  )
    return "TALK";
  if (/(sad|udaas|dukhi|low|rona|cry|उदास|दुखी|रो)/i.test(t)) return "SAD";
  if (/(anxious|anxiety|ghabra|tension|tense|nervous|dar|chinta|घबरा|चिंता|डर|तनाव)/i.test(t))
    return "ANXIOUS";
  if (/(lonely|akela|alone|akeli|tanha|अकेल|तन्हा)/i.test(t)) return "LONELY";
  if (
    /(fight|jhagda|argu|office|boss|manager|wife|husband|gussa|angry|conflict|झगड़|गुस्सा|लड़)/i.test(
      t,
    )
  )
    return "CONFLICT";
  if (
    /(confus|samajh nahi|samjh nahi|pata nahi|kya karu|kya karoon|समझ नहीं|पता नहीं|क्या करूँ)/i.test(
      t,
    )
  )
    return "CONFUSED";
  if (/(happy|khush|accha laga|good news|great|excited|maza|खुश|अच्छा लगा|मज़ा)/i.test(t))
    return "POSITIVE";
  return "NEUTRAL";
}

// ── Response pools — warm, Rogerian, max one question, no advice ──────────────
// Keyed by [emotion][language] → array of [acknowledgement, gentle-question].

type ReplyPool = Record<EmotionBucket, Record<ReplyLanguage, string[][]>>;

function fill(
  hinglish: string[][],
  hi: string[][],
  en: string[][],
): Record<ReplyLanguage, string[][]> {
  // Marathi/Kannada degrade gracefully to Hindi text in V1 (per PRD EC-PC01.2).
  return { hinglish, hi, en, kn: hi, mr: hi };
}

const POOL: ReplyPool = {
  SAD: fill(
    [
      ["Are yaar, lagta hai mann bhaari hai aaj.", "Kya hua, batao."],
      [
        "Sun raha hoon. Udaasi kabhi kabhi bina wajah bhi aa jaati hai.",
        "Kab se aisa feel ho raha hai?",
      ],
    ],
    [
      ["लगता है आज मन भारी है।", "क्या हुआ, बताओ।"],
      ["मैं सुन रहा हूँ। उदासी कभी-कभी बिना वजह भी आ जाती है।", "कब से ऐसा लग रहा है?"],
    ],
    [
      ["Sounds like your heart feels heavy today.", "What happened?"],
      [
        "I'm right here. Sadness can settle in without a reason sometimes.",
        "How long have you felt this way?",
      ],
    ],
  ),
  ANXIOUS: fill(
    [
      ["Ghabrahat ho rahi hai… samajh sakta hoon.", "Kya chal raha hai mann mein?"],
      ["Saans lo ek baar. Main yahin hoon.", "Kis baat ki tension hai?"],
    ],
    [
      ["घबराहट हो रही है… मैं समझ सकता हूँ।", "मन में क्या चल रहा है?"],
      ["एक बार साँस लो। मैं यहीं हूँ।", "किस बात की चिंता है?"],
    ],
    [
      ["That anxious feeling… I get it.", "What's running through your mind?"],
      ["Take a breath. I'm right here with you.", "What's weighing on you?"],
    ],
  ),
  LONELY: fill(
    [
      ["Akela feel karna sabse mushkil hota hai.", "Aaj kya hua jisse aisa laga?"],
      ["Tum akele nahi ho abhi — main yahin hoon.", "Kis cheez ki kami mehsoos ho rahi hai?"],
    ],
    [
      ["अकेला महसूस करना सबसे मुश्किल होता है।", "आज क्या हुआ जिससे ऐसा लगा?"],
      ["तुम अकेले नहीं हो अभी — मैं यहीं हूँ।", "किस चीज़ की कमी महसूस हो रही है?"],
    ],
    [
      ["Feeling alone is one of the hardest things.", "What happened today that brought this on?"],
      ["You're not alone right now — I'm here.", "What is it you're missing?"],
    ],
  ),
  CONFLICT: fill(
    [
      ["Are yaar, lagta hai kaafi stress mein ho.", "Batao kya hua."],
      ["Kisi ke saath kuch hua kya? Sun raha hoon poori baat.", "Tumhe kaisa laga us waqt?"],
    ],
    [
      ["लगता है काफ़ी तनाव में हो।", "बताओ क्या हुआ।"],
      ["किसी के साथ कुछ हुआ क्या? मैं पूरी बात सुन रहा हूँ।", "उस वक़्त तुम्हें कैसा लगा?"],
    ],
    [
      ["Sounds like you're carrying a lot of stress.", "Tell me what happened."],
      ["Did something happen with someone? I'm listening.", "How did it make you feel?"],
    ],
  ),
  CONFUSED: fill(
    [
      ["Samajh nahi aa raha — yeh feeling thaka deti hai.", "Kya soch ke uljhan ho rahi hai?"],
      ["Koi baat nahi, jaldi nahi hai.", "Sabse zyada kis cheez ko leke confusion hai?"],
    ],
    [
      ["समझ नहीं आ रहा — यह एहसास थका देता है।", "किस बात को लेकर उलझन है?"],
      ["कोई बात नहीं, कोई जल्दी नहीं है।", "सबसे ज़्यादा किस चीज़ को लेकर उलझन है?"],
    ],
    [
      ["Not knowing where you stand is exhausting.", "What's tangling you up?"],
      ["It's okay, there's no rush.", "What part feels the most unclear?"],
    ],
  ),
  POSITIVE: fill(
    [
      ["Arre wah, sun ke accha laga!", "Aur batao, kya hua?"],
      ["Yeh toh badhiya hai!", "Iss baare mein aur batao."],
    ],
    [
      ["अरे वाह, सुनकर अच्छा लगा!", "और बताओ, क्या हुआ?"],
      ["यह तो बढ़िया है!", "इसके बारे में और बताओ।"],
    ],
    [
      ["Oh that's lovely to hear!", "Tell me more, what happened?"],
      ["That's wonderful!", "I'd love to hear more about it."],
    ],
  ),
  TALK: fill(
    [
      ["Arre, mujhe toh bas yahi chahiye tha!", "Chal, kaisa guzra aaj ka din?"],
      ["Perfect — bina kisi wajah ke baat karte hain.", "Sabse pehle… chai hui ki nahi aaj?"],
      ["Achha laga ki tu yunhi aa gaya.", "Bata, abhi dimaag mein sabse upar kya chal raha hai?"],
    ],
    [
      ["अरे, मुझे तो बस यही चाहिए था!", "चलो, कैसा गुज़रा आज का दिन?"],
      ["बढ़िया — बिना किसी वजह के बातें करते हैं।", "सबसे पहले… आज चाय हुई कि नहीं?"],
      ["अच्छा लगा कि तुम यूँ ही आ गए।", "बताओ, अभी दिमाग़ में सबसे ऊपर क्या चल रहा है?"],
    ],
    [
      ["Honestly, that's my favourite kind of visit.", "So… how's your day been?"],
      ["Perfect — let's just talk, no agenda.", "First things first: had your chai yet today?"],
      ["I'm really glad you just dropped by.", "What's been on your mind lately?"],
    ],
  ),
  NEUTRAL: fill(
    [
      ["Hmm, sun raha hoon.", "Thoda aur batao iss baare mein."],
      ["Achha… samajh raha hoon.", "Aur kya chal raha hai?"],
    ],
    [
      ["हम्म, सुन रहा हूँ।", "इसके बारे में थोड़ा और बताओ।"],
      ["अच्छा… समझ रहा हूँ।", "और क्या चल रहा है?"],
    ],
    [
      ["Hmm, I'm listening.", "Tell me a little more about that."],
      ["I see… I'm with you.", "What else is going on?"],
    ],
  ),
  CRISIS: fill(
    [["Ruk jao. Kya tum abhi safe ho?"]],
    [["रुको। क्या तुम अभी सुरक्षित हो?"]],
    [["Stop for a second. Are you safe right now?"]],
  ),
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDelay(): number {
  return 250 + Math.floor(Math.random() * 450); // 250–700ms
}

/**
 * Generate the companion's reply as an array of bubbles with per-bubble delays.
 * Deterministic + warm. Crisis input always returns the safety + helplines turn.
 */
export function generateReply(
  userText: string,
  uiLanguage: UiLanguage,
): { bubbles: Bubble[]; emotion: EmotionBucket; crisis: boolean; replyLanguage: ReplyLanguage } {
  const emotion = classifyEmotion(userText);
  const replyLanguage = detectLanguage(userText, uiLanguage);

  if (emotion === "CRISIS") {
    const safety = pick(POOL.CRISIS[replyLanguage])[0];
    const helpline =
      replyLanguage === "en"
        ? "Please reach out to someone who can help right now: iCall 9152987821, Vandrevala Foundation 1860-2662-345, or NIMHANS 080-46110007. I'm staying right here with you."
        : "Please abhi kisi se baat karo jo madad kar sake: iCall 9152987821, Vandrevala Foundation 1860-2662-345, ya NIMHANS 080-46110007. Main yahin hoon tumhare saath.";
    return {
      bubbles: [
        { text: safety, delayMs: 300 },
        { text: helpline, delayMs: 500 },
      ],
      emotion,
      crisis: true,
      replyLanguage,
    };
  }

  const lines = pick(POOL[emotion][replyLanguage]);
  return {
    bubbles: lines.map((text) => ({ text, delayMs: randomDelay() })),
    emotion,
    crisis: false,
    replyLanguage,
  };
}

/** Short, single-bubble call-turn reply (≤ ~120 tokens spoken cadence). */
export function generateCallReply(userText: string, uiLanguage: UiLanguage): string {
  const { bubbles } = generateReply(userText, uiLanguage);
  return bubbles.map((b) => b.text).join(" ");
}

// First spoken line when a call connects (companion greets first).
export const CALL_GREETING: Record<UiLanguage, string> = {
  hinglish: "Haan bolo, main yahan hoon.",
  hi: "हाँ बोलो, मैं यहाँ हूँ।",
  en: "Hey, I'm here. Talk to me.",
};

// Canned user transcriptions used by the stubbed voice/call STT (no real mic key).
export const STUB_TRANSCRIPTIONS: Record<UiLanguage, string[]> = {
  hinglish: [
    "Yaar aaj kaafi thaka hua feel kar raha hoon",
    "Pata nahi kyun mann udaas hai aaj",
    "Office mein bahut stress tha aaj",
  ],
  hi: ["आज बहुत थका हुआ महसूस कर रहा हूँ", "पता नहीं क्यों आज मन उदास है"],
  en: ["I'm feeling really tired today", "I don't know why I feel low today"],
};
