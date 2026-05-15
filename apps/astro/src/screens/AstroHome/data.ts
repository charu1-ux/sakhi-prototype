/* ═══════════════════════════════════════════════════════════════════
   AstroHome — Static Data Constants
   Extracted from astro-home.html <script type="text/babel"> block
   ═══════════════════════════════════════════════════════════════════ */

// ─── User Profile ────────────────────────────────────────────────────────────

export const USER = {
  name: "Shivali",
  sign: "Vrishchik",
  signSymbol: "♏",
  element: "Water",
  rulingPlanet: "Mars",
  cosmicScore: 78,
  archetype: "The Deep Strategist",
  rashi: "Scorpio",
  mulank: 9,
  nakshatra: "Anuradha",
  luckyDay: "Mangalwar",
} as const;

// ─── Birth / Age Constants ────────────────────────────────────────────────────

export const BIRTH_YEAR = 1995;
export const CURRENT_AGE = 30;
export const CURRENT_YEAR = 2025;

// ─── Planets in Houses ───────────────────────────────────────────────────────

export type PlanetEntry = {
  name: string;
  abbr: string;
  glyph: string;
};

export const PLANETS_IN_HOUSES: Record<number, PlanetEntry[]> = {
  1: [{ name: "Mars", abbr: "Ma", glyph: "♂" }],
  2: [
    { name: "Sun", abbr: "Su", glyph: "☉" },
    { name: "Mercury", abbr: "Bu", glyph: "☿" },
  ],
  4: [{ name: "Venus", abbr: "Ve", glyph: "♀" }],
  5: [{ name: "Jupiter", abbr: "Ju", glyph: "♃" }],
  7: [{ name: "Moon", abbr: "Mo", glyph: "☽" }],
  8: [{ name: "Ketu", abbr: "Ke", glyph: "☋" }],
  10: [{ name: "Saturn", abbr: "Sa", glyph: "♄" }],
  12: [{ name: "Rahu", abbr: "Ra", glyph: "☊" }],
};

// ─── Planet Colors ────────────────────────────────────────────────────────────

export const PLANET_COLORS = {
  Sun: "#f7ab20",
  Moon: "#b5b5b5",
  Mars: "#ff6644",
  Mercury: "#1eccb0",
  Jupiter: "#3535f3",
  Venus: "#9999ff",
  Saturn: "#141414",
  Rahu: "#000093",
  Ketu: "#3800ac",
} as const;

export type PlanetName = keyof typeof PLANET_COLORS;

// ─── Personality Traits ───────────────────────────────────────────────────────

export type PersonalityTrait = {
  icon: string;
  text: string;
};

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  { icon: "🔥", text: "Log bolne se pehle padh leti hain" },
  { icon: "⚡", text: "Faisla jaldi. Galat kabhi nahi." },
  { icon: "🌊", text: "Sab mehsoos karti hain. Dikhati kuch nahi." },
];

// ─── Story Cards (Tray previews) ──────────────────────────────────────────────

export type StoryCardVisual =
  | "mars"
  | "numerology"
  | "moon"
  | "saturn"
  | "triangle"
  | "twin"
  | "clock";

export type StoryCard = {
  id: string;
  title: string;
  subtitle: string;
  planet: string;
  accentBg: string;
  isDark: boolean;
  visual: StoryCardVisual;
};

export const STORY_CARDS: StoryCard[] = [
  {
    id: "superpower",
    title: "Why people follow your lead",
    subtitle: "without you even asking",
    planet: "Mars",
    accentBg: "linear-gradient(135deg, #1a0500 0%, #0d0200 100%)",
    isDark: true,
    visual: "mars",
  },
  {
    id: "mulank",
    title: "Mulank 9 + Makar",
    subtitle: "a rare powerful combination",
    planet: "Mars",
    accentBg: "linear-gradient(135deg, #1a0a00 0%, #0d0500 100%)",
    isDark: true,
    visual: "numerology",
  },
  {
    id: "blindspot",
    title: "The trait that pushes people away",
    subtitle: "and you don't see it",
    planet: "Moon",
    accentBg: "linear-gradient(135deg, #0d0d18 0%, #080810 100%)",
    isDark: true,
    visual: "moon",
  },
  {
    id: "misunderstood",
    title: "Why people think you're intimidating",
    subtitle: "when you're not",
    planet: "Saturn",
    accentBg: "linear-gradient(135deg, #0a0a14 0%, #050508 100%)",
    isDark: true,
    visual: "saturn",
  },
  {
    id: "destiny",
    title: "The rare pattern in your chart",
    subtitle: "only 5% have this",
    planet: "Mars",
    accentBg: "linear-gradient(135deg, var(--surface-bold) 0%, #1a0066 100%)",
    isDark: true,
    visual: "triangle",
  },
  {
    id: "twin",
    title: "Your kundli matches Dhoni's",
    subtitle: "89% cosmic overlap",
    planet: "Jupiter",
    accentBg: "linear-gradient(135deg, #001a15 0%, #000d0a 100%)",
    isDark: true,
    visual: "twin",
  },
  {
    id: "future",
    title: "In 14 months, something shifts",
    subtitle: "your biggest career window",
    planet: "Jupiter",
    accentBg: "linear-gradient(135deg, #0a0020 0%, #050010 100%)",
    isDark: true,
    visual: "clock",
  },
];

// ─── Card Narration Scenes ────────────────────────────────────────────────────

export type NarrationScene = {
  chunk: string;
  text: string;
  size?: number;
  color: string;
  emoji?: string;
  glow?: boolean;
  emphasis?: boolean;
  energy?: "fire" | "ice";
  /** Card 5 UI type */
  ui?: "text" | "reveal" | "stat" | "block" | "traits";
  stat?: number;
  unit?: string;
  label?: string;
  icon?: string;
  title?: string;
  desc?: string;
  traits?: string[];
};

export const CARD1_NARRATION_SCENES: NarrationScene[] = [
  {
    chunk: "शिवाली जी, आपकी कुंडली और मूलांक नौ के हिसाब से, ये हैं आपकी strengths।",
    text: "आपकी कुंडली ·\nमूलांक 9",
    size: 26,
    color: "rgba(255,255,255,0.85)",
    emoji: "♏",
  },
  {
    chunk: "आपमें कुछ बहुत ख़ास है।",
    text: "कुछ ख़ास है\nआपमें",
    size: 30,
    color: "#ff9966",
    emoji: "✨",
  },
  {
    chunk: "आपमें leadership quality है। ये quality सबमें नहीं होती।",
    text: "Leadership\nQuality है",
    size: 40,
    color: "#ff6644",
    glow: true,
    emphasis: true,
    emoji: "👑",
  },
  {
    chunk:
      "आपमें एक natural authority है। जो लोग सालों में build करते हैं, वो आपको naturally मिली है।",
    text: "Natural\nAuthority",
    size: 48,
    color: "#ffcc66",
    glow: true,
    emphasis: true,
  },
  {
    chunk: "जब आप बोलती हैं, लोग ध्यान से सुनते हैं। आपकी बात में weight है।",
    text: "लोग ध्यान से\nसुनते हैं",
    size: 28,
    color: "rgba(255,255,255,0.9)",
    emoji: "🎯",
  },
  {
    chunk: "आपमें एक अलग charm है। लोग आपकी तरफ़ खिंचे चले आते हैं।",
    text: "एक अलग\nCharm है",
    size: 36,
    color: "#ff9966",
    glow: true,
    emoji: "🔥",
  },
  {
    chunk: "आप initiative लेती हैं। जहाँ लोग problems ढूंढते हैं, आप solutions ढूंढती हैं।",
    text: "Initiative लेती हैं\nSolutions ढूंढती हैं",
    size: 30,
    color: "#ff9966",
    glow: true,
    emphasis: true,
  },
  {
    chunk: "और सबसे बड़ी बात — दिल की बहुत साफ़ हैं आप।",
    text: "दिल की बहुत\nसाफ़ हैं आप",
    size: 36,
    color: "#ffcc66",
    glow: true,
    emphasis: true,
    emoji: "💛",
  },
  {
    chunk: "आप emotionally बहुत strong हैं शिवाली जी। ये आपकी सबसे बड़ी ताक़त है।",
    text: "Emotionally\nबहुत Strong हैं",
    size: 38,
    color: "#ff6644",
    glow: true,
    emphasis: true,
    emoji: "💪",
  },
];

export const CARD2_NARRATION_SCENES: NarrationScene[] = [
  {
    chunk: "शिवाली जी, आपका मूलांक है नौ और राशि है मकर।",
    text: "मूलांक 9\n× मकर",
    size: 32,
    color: "#ffb450",
    emoji: "♏",
  },
  {
    chunk: "ये combination बहुत rare है।",
    text: "बहुत Rare\nCombination",
    size: 36,
    color: "rgba(255,255,255,0.9)",
    glow: true,
    emphasis: true,
    emoji: "💎",
  },
  {
    chunk: "मंगल देता है आग — हिम्मत और साहस।",
    text: "आग · हिम्मत\n· साहस",
    size: 38,
    color: "#ff6644",
    glow: true,
    emphasis: true,
    emoji: "🔥",
    energy: "fire",
  },
  {
    chunk: "और शनि देता है धैर्य — ताक़त और सही timing।",
    text: "धैर्य · ताक़त\n· Timing",
    size: 38,
    color: "#8899cc",
    glow: true,
    emphasis: true,
    emoji: "❄️",
    energy: "ice",
  },
  {
    chunk: "ज़्यादातर लोगों में या आग होती है, या बर्फ़। आपमें दोनों हैं।",
    text: "आपमें\nदोनों हैं",
    size: 44,
    color: "#ffcc66",
    glow: true,
    emphasis: true,
  },
  {
    chunk: "आप सालों तक wait कर सकती हैं सही moment के लिए।",
    text: "सही Moment\nका Wait",
    size: 30,
    color: "#8899cc",
    emoji: "⏳",
    energy: "ice",
  },
  {
    chunk: "और जब move करती हैं, किसी को पता भी नहीं चलता।",
    text: "फिर एक ही\nMove में 💥",
    size: 36,
    color: "#ff6644",
    glow: true,
    emphasis: true,
    energy: "fire",
  },
  {
    chunk: "ये आपकी सबसे powerful quality है।",
    text: "सबसे Powerful\nQuality",
    size: 40,
    color: "#ffb450",
    glow: true,
    emphasis: true,
    emoji: "⚡",
  },
];

export const CARD5_NARRATION_SCENES: NarrationScene[] = [
  {
    chunk: "शिवाली जी, आपकी कुंडली में एक बहुत rare yog है।",
    ui: "text",
    text: "एक बहुत\nRare Yog",
    size: 36,
    color: "#7aebd9",
    glow: true,
    emoji: "✦",
  },
  {
    chunk: "इसका नाम है रुचक महापुरुष योग।",
    ui: "reveal",
    text: "रुचक\nमहापुरुष योग",
    size: 42,
    color: "#ffd700",
    glow: true,
    emphasis: true,
  },
  {
    chunk: "दुनिया में सिर्फ़ पाँच percent लोगों के पास ये होता है।",
    ui: "stat",
    stat: 5,
    label: "लोगों के पास ये yog है",
    unit: "%",
    color: "#ffd700",
    text: "",
  },
  {
    chunk: "ये मंगल का विशेष योग है। जब मंगल अपने ही घर में बैठता है, तो ये बनता है।",
    ui: "block",
    icon: "♂",
    title: "मंगल का योग",
    desc: "Mars अपने घर में — maximum power position",
    color: "#ff6644",
    text: "",
  },
  {
    chunk: "इसका मतलब है — courage, leadership, और किसी भी situation को dominate करने की power।",
    ui: "traits",
    traits: ["Courage", "Leadership", "Dominance"],
    color: "#ff6644",
    text: "",
  },
  {
    chunk: "और आपके मूलांक नौ के साथ मिलकर ये दोगुना powerful हो जाता है।",
    ui: "block",
    icon: "9",
    title: "मूलांक 9 × रुचक योग",
    desc: "Double Mars energy — extremely rare combination",
    color: "#ffd700",
    glow: true,
    text: "",
  },
  {
    chunk:
      "हर कुछ सालों में आप सब कुछ तोड़कर नए सिरे से शुरू करती हैं। लोग इसे restless कहते हैं। लेकिन ये evolution है।",
    ui: "text",
    text: "Restless नहीं\nEvolution है",
    size: 38,
    color: "#7aebd9",
    glow: true,
    emphasis: true,
  },
  {
    chunk: "ये yog आपको बाकी सबसे अलग बनाता है शिवाली जी।",
    ui: "text",
    text: "आप बाकी सबसे\nअलग हैं",
    size: 40,
    color: "#ffd700",
    glow: true,
    emphasis: true,
    emoji: "⚡",
  },
];

// ─── Card Narrations (full text, 7 cards) ────────────────────────────────────

/**
 * Full narration strings, one per card (index 0-6).
 * Cards 0, 1, 4 use scene-synced audio; the others use these full strings.
 */
export const CARD_NARRATIONS: string[] = [
  // Card 0 — Superpower
  `शिवाली जी, आपकी कुंडली और मूलांक नौ के हिसाब से, ये हैं आपकी strengths। आपमें कुछ बहुत ख़ास है। आपमें leadership quality है। ये quality सबमें नहीं होती। आपमें एक natural authority है। जो लोग सालों में build करते हैं, वो आपको naturally मिली है। जब आप बोलती हैं, लोग ध्यान से सुनते हैं। आपकी बात में weight है। आपमें एक अलग charm है। लोग आपकी तरफ़ खिंचे चले आते हैं। आप initiative लेती हैं। जहाँ लोग problems ढूंढते हैं, आप solutions ढूंढती हैं। और सबसे बड़ी बात — दिल की बहुत साफ़ हैं आप। आप emotionally बहुत strong हैं शिवाली जी। ये आपकी सबसे बड़ी ताक़त है।`,
  // Card 1 — Mulank 9 + Makar
  `शिवाली जी, आपका मूलांक है नौ और राशि है मकर। ये combination बहुत rare है। मंगल देता है आग — हिम्मत और साहस। और शनि देता है धैर्य — ताक़त और सही timing। ज़्यादातर लोगों में या आग होती है, या बर्फ़। आपमें दोनों हैं। आप सालों तक wait कर सकती हैं सही moment के लिए। और जब move करती हैं, किसी को पता भी नहीं चलता। ये आपकी सबसे powerful quality है।`,
  // Card 2 — Blind Spot
  `शिवाली जी, अब एक ऐसा rahasya बताता हूँ जो आप ख़ुद नहीं देख पाती। आपके चन्द्रमा की स्थिति ऐसी है कि, जब आप चुप हो जाती हैं — लोग सोचते हैं आप नाराज़ हैं। लेकिन सच ये है — आप सोच रही होती हैं, अंदर ही अंदर process कर रही होती हैं। ये आपके Moon की intensity है। लेकिन वो ख़ामोशी? वो एक दीवार बन जाती है। और जो लोग आपसे सबसे ज़्यादा प्यार करते हैं — वही आपसे सबसे ज़्यादा डरते हैं reach करने से। ये कमी नहीं है आपकी — ये आपकी गहराई है।`,
  // Card 3 — Misunderstood
  `शिवाली जी, आपको एक बात बताऊँ? आपके शनि और मंगल दोनों इतने strong हैं कि लोग आपको intimidating समझते हैं। लेकिन सच ये है — आप selective हैं। आप हर किसी को अपने पास नहीं आने देती, क्योंकि आपके मूलांक नौ की वजह से आप जानती हैं — ग़लत इंसान के close आने का क्या cost होता है। अंदर से आप कितनी soft हैं, ये बहुत कम लोग जानते हैं। लेकिन जो जान लेते हैं — वो कभी नहीं जाते।`,
  // Card 4 — Destiny / Rare Yog
  `शिवाली जी, आपकी कुंडली में एक बहुत rare yog है। इसका नाम है रुचक महापुरुष योग। दुनिया में सिर्फ़ पाँच percent लोगों के पास ये होता है। ये मंगल का विशेष योग है। जब मंगल अपने ही घर में बैठता है, तो ये बनता है। इसका मतलब है — courage, leadership, और किसी भी situation को dominate करने की power। और आपके मूलांक नौ के साथ मिलकर ये दोगुना powerful हो जाता है। हर कुछ सालों में आप सब कुछ तोड़कर नए सिरे से शुरू करती हैं। लोग इसे restless कहते हैं। लेकिन ये evolution है। ये yog आपको बाकी सबसे अलग बनाता है शिवाली जी।`,
  // Card 5 — Celebrity Twin
  `शिवाली जी, ये सुनकर हैरान हो जाएँगी। आपकी कुंडली का 89 percent match है MS Dhoni के साथ। Same वृश्चिक राशि की fire। Same मंगल-driven calmness जब सब panic कर रहे होते हैं। उनके मूलांक भी नौ के करीब energy रखते हैं। वो matches last over में finish करता है। आप वो काम finish करती हैं जो बाकी सब छोड़ देते हैं। दोनों कुंडली में रुचक योग है — जो उन्होंने cricket field पर किया, आपकी कुंडली कहती है कि आप अपने arena में करेंगी।`,
  // Card 6 — Future Window
  `शिवाली जी, अब सबसे ज़रूरी बात। आपके गुरु यानी Jupiter, अगले चौदह महीनों में आपके कर्म भाव में आ रहे हैं — ये दसवाँ घर है, legacy और public recognition का घर। और जब गुरु यहाँ आता है, तो career में कुछ बड़ा होता है। पिछली बार जब ये energy align हुई थी — याद कीजिए, आपकी work life में कुछ बदला था ना? इस बार window और भी बड़ा है। जो decisions आप अभी से लेंगी — वो अगले दस साल तक echo करेंगी। ये आपका time है शिवाली जी। तैयार रहिए।`,
];

// ─── Orbit Planets ────────────────────────────────────────────────────────────

export type StoryBeat = {
  at: number;
  icon: string;
  text: string;
  sub: string;
  type: "house" | "trait" | "transit" | "highlight" | "window";
  fromHouse?: string;
  toHouse?: string;
};

export type ChatReplies = {
  health?: string;
  career?: string;
  love?: string;
  default: string;
};

export type OrbitPlanet = {
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
  chatReplies: ChatReplies;
};

export const ORBIT_PLANETS: OrbitPlanet[] = [
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

// ─── Destiny Rituals ──────────────────────────────────────────────────────────

export type DestinyRitual = {
  id: string;
  planetId: string;
  glyph: string;
  planet: string;
  planetEn: string;
  day: string;
  dayHi: string;
  dayNum: number;
  color: string;
  glowColor: string;
  title: string;
  recurrence: string;
  instruction: string;
  why: string;
  improves: string[];
  narration: string;
  speaker: string;
  whisper: string;
};

export const DESTINY_RITUALS: DestinyRitual[] = [
  {
    id: "sun",
    planetId: "Sun",
    glyph: "☉",
    planet: "सूर्य",
    planetEn: "Sun",
    day: "Sunday",
    dayHi: "रविवार",
    dayNum: 0,
    color: "#f7ab20",
    glowColor: "rgba(247,171,32,0.4)",
    title: "सूर्य Arghya Upay",
    recurrence: "हर रविवार, सूर्योदय",
    instruction:
      'ताम्बे के लोटे से सूर्य को जल अर्पित करें, जल में लाल चंदन और लाल फूल डालें। "ॐ सूर्याय नमः" 11 बार बोलें।',
    why: "सूर्य आपकी chart में आत्मा का कारक है। सूर्य कमज़ोर होने से confidence और government matters में रुकावट आती है — arghya देने से सूर्य प्रसन्न होता है।",
    improves: ["Self-confidence", "Government matters", "Father's health"],
    narration: `रविवार मेरा दिन है। शिवाली जी, मैं सूर्य हूँ — आपकी आत्मा का कारक। हर रविवार सूर्योदय के समय ताम्बे के लोटे में जल लीजिए, उसमें लाल चंदन और लाल फूल डालिए, और मुझे अर्पित कीजिए। जल देते वक़्त "ॐ सूर्याय नमः" 11 बार बोलिए। ये सबसे powerful सूर्य उपाय है। इससे आपका confidence बढ़ता है, सरकारी कामों में रुकावट हटती है, और आपकी overall vitality strong रहती है। जो रविवार आप ये करती हैं, पूरा हफ़्ता अलग जाता है।`,
    speaker: "advait",
    whisper: "आज ताम्बे के लोटे से मुझे जल अर्पित कीजिए",
  },
  {
    id: "mars",
    planetId: "Mars",
    glyph: "♂",
    planet: "मंगल",
    planetEn: "Mars",
    day: "Tuesday",
    dayHi: "मंगलवार",
    dayNum: 2,
    color: "#ff6644",
    glowColor: "rgba(255,102,68,0.4)",
    title: "मंगल Hanuman Upay",
    recurrence: "हर मंगलवार, सुबह",
    instruction:
      "हनुमान चालीसा का पाठ करें, सिन्दूर का तिलक लगाएँ, और मंदिर में लाल चोला चढ़ाएँ। मसूर दाल दान करें।",
    why: "मंगल आपके लग्न में है — dominant planet। मंगल को strong रखने से courage, property matters और blood-related health सब सही रहता है।",
    improves: ["Courage & willpower", "Property matters", "Blood health"],
    narration: `मंगलवार मेरा दिन है। शिवाली जी, मैं आपके लग्न में बैठा हूँ — आपका सबसे dominant planet। हर मंगलवार सुबह हनुमान चालीसा का पाठ कीजिए और माथे पर सिन्दूर का तिलक लगाइए। हो सके तो हनुमान जी को लाल चोला चढ़ाइए और मसूर की दाल किसी ज़रूरतमंद को दान कीजिए। ये उपाय मुझे strong रखता है, जिससे आपकी courage, willpower और decision-making power हमेशा sharp रहे।`,
    speaker: "kabir",
    whisper: "आज हनुमान चालीसा और सिन्दूर तिलक से मुझे strong रखिए",
  },
  {
    id: "guru",
    planetId: "Mercury",
    glyph: "♃",
    planet: "गुरु",
    planetEn: "Jupiter",
    day: "Thursday",
    dayHi: "गुरुवार",
    dayNum: 4,
    color: "#5555ff",
    glowColor: "rgba(85,85,255,0.4)",
    title: "गुरु Brihaspati Upay",
    recurrence: "हर गुरुवार, सुबह",
    instruction:
      'चने की दाल और हल्दी दान करें, पीले कपड़े पहनें, केले के पेड़ पर जल चढ़ाएँ, और "ॐ बृहस्पतये नमः" 19 बार जपें। विष्णु सहस्रनाम का पाठ करें।',
    why: "गुरु आपके पाँचवें घर में है — wisdom और creativity का घर। गुरुवार का उपाय गुरु को strong रखता है जिससे भाग्य, विद्या और संतान सुख बना रहे।",
    improves: ["Wisdom & luck", "Education & growth", "Wealth expansion"],
    narration: `गुरुवार मेरा दिन है। शिवाली जी, मैं गुरु हूँ — बृहस्पति। आपकी chart में मैं पाँचवें घर में बैठा हूँ — wisdom और creativity वाले घर में। हर गुरुवार सुबह चने की दाल और हल्दी दान कीजिए, पीले कपड़े पहनिए। केले के पेड़ पर जल चढ़ाइए — केला मेरा वृक्ष है। "ॐ बृहस्पतये नमः" 19 बार जपिए और हो सके तो विष्णु सहस्रनाम का पाठ कीजिए। ये उपाय मुझे प्रसन्न करता है — जब मैं strong होता हूँ तो भाग्य खुलता है, नई opportunities आती हैं, और financial growth होती है।`,
    speaker: "advait",
    whisper: "आज चने की दाल दान और केले के पेड़ पर जल चढ़ाइए",
  },
  {
    id: "saturn",
    planetId: "Saturn",
    glyph: "♄",
    planet: "शनि",
    planetEn: "Saturn",
    day: "Saturday",
    dayHi: "शनिवार",
    dayNum: 6,
    color: "#8b7fd4",
    glowColor: "rgba(139,127,212,0.4)",
    title: "शनि Shani Upay",
    recurrence: "हर शनिवार, शाम",
    instruction:
      'काले तिल के तेल का दीपक जलाएँ पीपल के पेड़ के नीचे। काली उड़द दाल और सरसों का तेल दान करें। "ॐ शं शनैश्चराय नमः" 11 बार जपें।',
    why: "शनि आपके दसवें घर में है — career house। शनि को प्रसन्न रखने से career में obstacles हटते हैं और discipline reward होती है।",
    improves: ["Career obstacles removed", "Legal matters", "Bone & joint health"],
    narration: `शनिवार मेरा दिन है। शिवाली जी, मैं आपके दसवें घर में बैठा हूँ — career वाले घर में। हर शनिवार शाम पीपल के पेड़ के नीचे काले तिल के तेल का दीपक जलाइए। काली उड़द दाल और सरसों का तेल किसी ज़रूरतमंद को दान कीजिए। और "ॐ शं शनैश्चराय नमः" 11 बार जपिए। ये उपाय मुझे प्रसन्न करता है — मैं discipline reward करता हूँ, और जब मैं खुश होता हूँ तो career में obstacles अपने आप हटते हैं।`,
    speaker: "ratan",
    whisper: "आज तिल का दीपक और उड़द दाल दान से मुझे प्रसन्न कीजिए",
  },
];

// ─── Life Eras ────────────────────────────────────────────────────────────────

export type LifeEraAvatar = "baby" | "child" | "teen" | "youngAdult" | "adult" | "elder";

export type LifeEra = {
  id: string;
  label: string;
  labelHi: string;
  range: [number, number];
  avatar: LifeEraAvatar;
  bg: string;
  roadColor: string;
  starColor: string;
};

export const LIFE_ERAS: LifeEra[] = [
  {
    id: "dawn",
    label: "Chandra Yog",
    labelHi: "चंद्र योग",
    range: [0, 3],
    avatar: "baby",
    bg: "linear-gradient(135deg, #1a0020 0%, #2d1040 40%, #1a0030 100%)",
    roadColor: "#9898a4",
    starColor: "#ffaadd",
  },
  {
    id: "child",
    label: "Budh Dasha",
    labelHi: "बुध दशा",
    range: [4, 11],
    avatar: "child",
    bg: "linear-gradient(135deg, #0a1028 0%, #162050 40%, #0a1030 100%)",
    roadColor: "#4ecdc4",
    starColor: "#aaccff",
  },
  {
    id: "teen",
    label: "Mangal Yuti",
    labelHi: "मंगल युति",
    range: [12, 17],
    avatar: "teen",
    bg: "linear-gradient(135deg, #180808 0%, #301818 40%, #200a0a 100%)",
    roadColor: "#ff8844",
    starColor: "#ffaa66",
  },
  {
    id: "young",
    label: "Raj Yog",
    labelHi: "राज योग",
    range: [18, 28],
    avatar: "youngAdult",
    bg: "linear-gradient(135deg, #1a0a00 0%, #302000 40%, #1a0a00 100%)",
    roadColor: "#ff6644",
    starColor: "#ff8866",
  },
  {
    id: "prime",
    label: "Shani Dasha",
    labelHi: "शनि दशा",
    range: [29, 45],
    avatar: "adult",
    bg: "linear-gradient(135deg, #0a0a20 0%, #1a1a40 40%, #0a0a20 100%)",
    roadColor: "#7777ff",
    starColor: "#9999ff",
  },
  {
    id: "mature",
    label: "Guru Chandal",
    labelHi: "गुरु चांडाल",
    range: [46, 60],
    avatar: "adult",
    bg: "linear-gradient(135deg, #0a0818 0%, #181030 40%, #0a0818 100%)",
    roadColor: "#8b7fd4",
    starColor: "#ccaaff",
  },
  {
    id: "legacy",
    label: "Ketu Moksha",
    labelHi: "केतु मोक्ष",
    range: [61, 113],
    avatar: "elder",
    bg: "linear-gradient(135deg, #0a0a10 0%, #1a1a28 40%, #0a0a10 100%)",
    roadColor: "#aa66cc",
    starColor: "#aabbcc",
  },
];

// ─── Destiny Gates ────────────────────────────────────────────────────────────

export type DestinyGate = {
  age: number;
  label: string;
  planet: string;
  color: string;
  desc: string;
};

export const DESTINY_GATES: DestinyGate[] = [
  {
    age: 7,
    label: "Mercury Awakening",
    planet: "Mercury",
    color: "#4ecdc4",
    desc: "बुद्धि का जागरण — school, speech, और learning की शुरुआत",
  },
  {
    age: 18,
    label: "Ketu Liberation Gate",
    planet: "Ketu",
    color: "#aa66cc",
    desc: "Childhood ends. अब आप अपनी destiny खुद choose करती हैं",
  },
  {
    age: 25,
    label: "Mars Command Peak",
    planet: "Mars",
    color: "#ff6644",
    desc: "लग्न का मंगल peak पर — career में पहली बड़ी leadership opportunity",
  },
  {
    age: 29,
    label: "Saturn Return",
    planet: "Saturn",
    color: "#8b7fd4",
    desc: "शनि की वापसी — life का सबसे defining year। जो build किया वो test होगा",
  },
  {
    age: 36,
    label: "Jupiter Crown",
    planet: "Jupiter",
    color: "#5555ff",
    desc: "गुरु दसवें घर में — professional life का golden chapter शुरू",
  },
  {
    age: 48,
    label: "Rahu Transformation",
    planet: "Rahu",
    color: "#000093",
    desc: "Rahu cycle complete — reinvention, नई direction, deeper purpose",
  },
  {
    age: 60,
    label: "Wisdom Throne",
    planet: "Jupiter",
    color: "#f7ab20",
    desc: "Saturn + Jupiter alignment — legacy और mentorship का दौर",
  },
];

// ─── Month Names ──────────────────────────────────────────────────────────────

export const MONTH_NAMES_HI = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
] as const;

export const MONTH_NAMES_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
