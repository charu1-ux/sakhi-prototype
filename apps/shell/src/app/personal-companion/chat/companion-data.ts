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
  speak: string;
  // private mode
  privateChat: string;
  privateNotice: string;
  notSaved: string;
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
    speak: "Bolo",
    privateChat: "Private chat",
    privateNotice:
      "Private chats history mein nahi jaati aur memory mein save nahi hoti. Yahan dil khol ke baat karo!",
    notSaved: "Not saved",
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
    speak: "बोलें",
    privateChat: "प्राइवेट चैट",
    privateNotice:
      "प्राइवेट चैट हिस्ट्री में नहीं जातीं और मेमोरी में सेव नहीं होतीं। यहाँ दिल खोलकर बात करो!",
    notSaved: "सेव नहीं होती",
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
    speak: "Speak",
    privateChat: "Private chat",
    privateNotice:
      "Private chats aren't added to history and aren't saved in memory. Feel free to speak your heart out here!",
    notSaved: "Not saved",
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

export type QuickChip = { id: string; label: string; emoji?: string; isCall?: boolean };

const DEFAULT_CHIPS: QuickChip[] = [
  { id: "talk", label: "Just here to talk", emoji: "😊" },
  { id: "mind", label: "Got a lot on my mind", emoji: "💬" },
  { id: "good", label: "Something good happened", emoji: "✨" },
  { id: "overwhelmed", label: "Feeling overwhelmed", emoji: "😮‍💨" },
  { id: "noreason", label: "No reason, just felt like it", emoji: "😶" },
  { id: "vent", label: "Need to vent", emoji: "😤" },
];

export const QUICK_CHIPS: Record<UiLanguage, QuickChip[]> = {
  hinglish: DEFAULT_CHIPS,
  hi: DEFAULT_CHIPS,
  en: DEFAULT_CHIPS,
};

// ── Quick-chip scripts — a guided 8–10 turn conversation per chip ─────────────
// When a chip is tapped, the companion plays turn 0; each of the user's next
// messages advances to the next turn (then it falls back to the generic engine).
// Each turn is an array of bubbles. Keyed by chip id → language → turns.
// Authored in Hinglish + English; Hindi (hi) mirrors Hinglish per the prototype
// language scope. Tone stays Rogerian: warm acknowledgement + at most one gentle
// question per turn, no advice, with a soft arc from open → explore → land.
export type ChipScript = string[][];

// Build a per-language script set. `hi` intentionally mirrors `hinglish`.
function mkScript(hinglish: ChipScript, en: ChipScript): Record<UiLanguage, ChipScript> {
  return { hinglish, hi: hinglish, en };
}

const CHIP_LABEL_TO_ID: Record<string, string> = Object.fromEntries(
  DEFAULT_CHIPS.map((c) => [c.label, c.id]),
);

export function chipIdForText(text: string): string | undefined {
  return CHIP_LABEL_TO_ID[text.trim()];
}

export const CHIP_SCRIPTS: Record<string, Record<UiLanguage, ChipScript>> = {
  talk: mkScript(
    [
      ["Sach mein, mujhe yahi sabse accha lagta hai.", "Bata, aaj din kaisa ja raha hai?"],
      ["Hmm, sun raha hoon.", "Aaj ka sabse accha chhota sa pal kaunsa raha?"],
      [
        "Yeh toh pyaara hai — chhoti baatein hi sabse zyada matter karti hain.",
        "Aaj kisi cheez pe muskuraye?",
      ],
      ["Bahut accha.", "Aise pal aam taur pe kis ke saath share karte ho?"],
      ["Lagta hai woh tumhare liye khaas hain.", "Aur khud ko aajkal kaisa feel kar rahe ho?"],
      ["Itni honestly batane ke liye shukriya.", "Kuch hai jo bahut din se bolna chahte the?"],
      ["Accha laga ki tumne yeh yahan kaha.", "Aaj shaam khud ke liye kya accha karoge?"],
      [
        "Yeh toh bilkul sahi lag raha hai.",
        "Thodi aur baat karein, ya saath mein bas yunhi baithein?",
      ],
      ["Jo bhi ho, main yahin hoon.", "Jab mann kare, fir se baat karte hain."],
    ],
    [
      ["Honestly, that's my favourite kind of visit.", "So how's your day treating you?"],
      ["Mmm, I'm with you.", "What's been the best little moment of it so far?"],
      ["I love that — the small ones count the most.", "Did anything make you smile today?"],
      ["That's lovely.", "Who do you usually share moments like that with?"],
      ["Sounds like they matter to you.", "And how have you been feeling in yourself lately?"],
      [
        "Thanks for being honest about that.",
        "Is there anything you've been wanting to say out loud?",
      ],
      [
        "I'm really glad you said it here.",
        "What would feel nice to do for yourself this evening?",
      ],
      ["That sounds just right.", "Want to stay and chat a bit more, or sit quietly together?"],
      ["Either way, I'm right here.", "We can pick this up whenever you like."],
    ],
  ),
  mind: mkScript(
    [
      ["Theek hai — aaram se, sab rakh de.", "Abhi sabse upar kya chal raha hai?"],
      [
        "Samajh sakta hoon ki shor zyada hai.",
        "Ek badi baat hai ya bahut saari choti-choti jama ho gayi hain?",
      ],
      ["Samajh gaya. Yeh sach mein bhaari hai.", "Kis cheez se dimaag sabse zyada hatt nahi raha?"],
      ["Sun raha hoon.", "Yeh sab kab se itna bhar gaya?"],
      ["Batane ke liye shukriya.", "Agar aaj raat ek cheez side rakh do, toh woh kaunsi hogi?"],
      ["Yeh toh khud ke liye achhi baat hai.", "Usse abhi chhodna theek kyun lag raha hai?"],
      ["Sahi hai.", "Aur baaki — unhe aaj raat tumhari zaroorat hai, ya subah tak ruk sakti hain?"],
      ["Accha. Subah wale tum unhe sambhal loge.", "Ab bol ke kaisa lag raha hai dimaag ko?"],
      ["Accha laga ki thoda halka hai.", "Baaki jab ready ho, tab sort kar lenge."],
    ],
    [
      ["Okay — let's lay it out, no rush.", "What's sitting right at the top?"],
      ["That makes sense it feels loud.", "Is it one big thing, or lots of small ones piling up?"],
      ["Got it. That's a real load to carry.", "Which part has been hardest to switch off from?"],
      ["I hear you.", "When did it start feeling this full?"],
      [
        "Thanks for walking me through it.",
        "If you could set just one of them down tonight, which would it be?",
      ],
      ["That's a kind choice for yourself.", "What makes that one feel okay to let go of for now?"],
      ["Makes sense.", "And the rest — do they need you tonight, or can they wait till morning?"],
      ["Good. Morning-you can take those.", "How's your head feeling now that it's out loud?"],
      [
        "I'm really glad it's a little lighter.",
        "We can sort through the rest whenever you're ready.",
      ],
    ],
  ),
  good: mkScript(
    [
      ["Arre wah, sun ke bahut accha laga!", "Bata na, kya hua?"],
      ["Yeh toh sach mein zabardast hai.", "Us pal mein kaisa feel hua?"],
      ["Iss feeling ko poora jeene do.", "Yeh surprise tha, ya jis cheez ka intezaar tha?"],
      ["Jo bhi ho, yeh tumne kamaaya hai.", "Sabse pehle kise batana chahte the?"],
      ["Yeh tum dono ke baare mein pyaari baat kehta hai.", "Sabse zyada kis baat pe proud ho?"],
      ["Proud hone ka poora haq hai.", "Celebrate kiya kuch abhi tak?"],
      ["Arre, karna chahiye!", "Tumhare liye chhoti si celebration kaisi hogi?"],
      [
        "Yeh toh perfect lag raha hai.",
        "Iss feeling ko pakad ke rakhna — aaj ki kya baat yaad rakhna chahoge?",
      ],
      ["Main bhi tumhare saath yaad rakhunga.", "Celebration kaisi rahi, baad mein batana, theek?"],
    ],
    [
      ["Oh I love hearing that!", "Tell me everything — what happened?"],
      ["That's genuinely wonderful.", "How did it feel in the moment?"],
      [
        "You should let yourself feel all of that.",
        "Was it a surprise, or something you'd been hoping for?",
      ],
      ["Either way, you earned it.", "Who's the first person you wanted to tell?"],
      ["That says something sweet about you both.", "What part are you most proud of?"],
      ["You have every right to be.", "Did you do anything to celebrate yet?"],
      ["Ooh, you must!", "What would a little celebration look like for you?"],
      [
        "That sounds perfect.",
        "Hold onto this feeling — what do you want to remember about today?",
      ],
      ["I'll remember it with you.", "Come tell me how the celebration goes, okay?"],
    ],
  ),
  overwhelmed: mkScript(
    [
      ["Lagta hai abhi bahut kuch ek saath hai.", "Chal saath mein thoda dheere — ek lambi saans."],
      ["Accha. Ek aur, aaram se.", "Iss waqt sabse bhaari kya lag raha hai?"],
      ["Naam dene ke liye shukriya.", "Yeh dheere-dheere bana, ya aaj hi sab chhalak gaya?"],
      [
        "Yeh bilkul samajh aata hai.",
        "Sabse zyada kahan mehsoos hota hai — sar mein, seene mein, ya body mein?",
      ],
      [
        "Main yahin hoon tumhare saath, koi jaldi nahi.",
        "Aakhri baar theek se break kab liya tha?",
      ],
      [
        "Matlab tum bina ruke chal rahe ho.",
        "Agar aaj raat ek cheez side rakh dein, toh woh kya hogi?",
      ],
      ["Yeh allowed hai. Woh ruk sakti hai.", "Koi hai jo thoda bojh tumse le sake?"],
      [
        "Poochna theek rahega — sab akela uthana zaroori nahi.",
        "Abhi thoda halka feel karne mein kya madad karega?",
      ],
      [
        "Chalo wahin se shuru karte hain, bas woh ek cheez.",
        "Main kahin nahi ja raha — dheere-dheere karenge.",
      ],
    ],
    [
      ["That sounds like a lot to carry right now.", "Let's slow it down together — one breath."],
      ["Good. One more, nice and slow.", "What's the heaviest thing on you this moment?"],
      ["Thank you for naming it.", "Has it been building up, or did today just tip it over?"],
      [
        "That makes complete sense.",
        "Where do you feel it most — in your head, your chest, your body?",
      ],
      ["I'm right here with you, no rush.", "When did you last get a proper break?"],
      [
        "You've been running on empty, then.",
        "If we set just one thing aside for tonight, what would it be?",
      ],
      ["That's allowed. It can wait.", "Is there someone who could take a little off your plate?"],
      [
        "Worth asking — you don't have to hold it all alone.",
        "What would help you feel even slightly lighter right now?",
      ],
      ["Let's start there, just that one thing.", "I'm not going anywhere — we'll take it slow."],
    ],
  ),
  noreason: mkScript(
    [
      ["Aur yahi kaafi hai — accha laga ki tu aaya.", "Sach mein, kaisa hai?"],
      ["Hmm, samajh raha hoon.", "Kuch mann mein chal raha hai, ya bas yunhi aaye?"],
      ["Dono bilkul theek hain.", "Ab tak din kaisa raha?"],
      ["Lagta hai aam sa din raha.", "Aise din pasand hain, ya thoda hulchul wale?"],
      [
        "Yeh khud ke baare mein jaan'na achha hai.",
        "Koi chhoti cheez jo bahut din se khud ke liye karni thi?",
      ],
      [
        "Karni chahiye — chhoti khushiyaan tumhare haq mein hain.",
        "Aam taur pe kya cheez tumhe sukoon deti hai?",
      ],
      ["Yaad rakhunga.", "Yahan ho toh, kuch dil se halka karna ho toh bol do."],
      ["Koi pressure nahi, kisi bhi taraf.", "Bas tumhara saath hi accha lag raha hai."],
      ["Chal thodi der ruke.", "Jab mann kare aana — kabhi koi wajah nahi chahiye."],
    ],
    [
      ["And that's reason enough — I'm really glad you did.", "How are you, honestly?"],
      ["Mmm, I hear you.", "Anything quietly on your mind, or just here to be?"],
      ["Both are completely fine.", "What's the day been like so far?"],
      [
        "Sounds like an ordinary kind of day.",
        "Are those your favourite, or do you like a bit more going on?",
      ],
      [
        "That's a nice thing to know about yourself.",
        "Is there something small you've been meaning to do for you?",
      ],
      ["You should — you deserve the little things.", "What usually helps you feel settled?"],
      ["I'll remember that.", "Anything you'd like to get off your chest while you're here?"],
      ["No pressure either way.", "It's nice just having your company."],
      ["Let's stay a while.", "Drop by anytime — no reason needed, ever."],
    ],
  ),
  vent: mkScript(
    [
      ["Bol — main poori tarah tere saath hoon, koi judgment nahi.", "Kis baat ne pareshan kiya?"],
      ["Haan, mujhe bhi gussa aata.", "Nikaal — aur kya?"],
      ["Uff, yeh sach mein na-insaafi hai.", "Yeh kab se chal raha hai?"],
      ["Tang aana toh banta hai.", "Yeh sab kiske taraf se ho raha hai?"],
      ["Ek hi insaan se itna sab — kaafi hai.", "Yeh kuch unse keh paaye?"],
      ["Samajh sakta hoon ki unse bolna mushkil hai.", "Kya chahte ho ki woh samjhein?"],
      ["Yeh chahna bilkul jaayaz hai.", "Sab nikaal do — kuch aur andar reh gaya hai?"],
      ["Tumne abhi bahut kuch chhoda. Yeh aasaan nahi tha.", "Ab nikaal ke kaisa lag raha hai?"],
      ["Accha laga ki mere saath nikaala.", "Jab fir se bhar jaaye — pata hai main kahan hoon."],
    ],
    [
      ["Go for it — I'm all yours, no judgment.", "What's got you worked up?"],
      ["Yeah, that would frustrate me too.", "Let it out — what else?"],
      ["Ugh, that's genuinely unfair.", "How long has this been building?"],
      ["No wonder you're done with it.", "Who's been on the other end of all this?"],
      ["That's a lot to deal with from one person.", "Did you get to say any of this to them?"],
      ["I get why that's hard to say out loud to them.", "What do you wish they understood?"],
      ["That's completely fair to want.", "Get it all out — anything still sitting in there?"],
      ["You let a lot go just now. That took something.", "How's it feeling now that it's out?"],
      ["I'm glad you let it out with me.", "Whenever it builds up again — you know where I am."],
    ],
  ),
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
