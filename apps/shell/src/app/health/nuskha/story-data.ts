// Data + timing for the Sehat Saathi "Ghar ke Nushke" chat story.
// Reframed as a WELLNESS-EXPLORE experience (browse by bucket → pick a remedy →
// guided walkthrough), distinct from symptom triage (../takleef). Pure data — no
// JSX — shared by the orchestrator and the widgets. Mirrors ../../commerce/jiomart.

export type StepIcon = "leaf" | "flame" | "cup" | "moon" | "droplet" | "sparkles";
export type BucketIcon = "soup" | "shield" | "thermometer" | "sparkles";

export type WalkthroughStep = {
  title: string;
  instruction: string;
  icon: StepIcon;
};

export type Remedy = {
  id: string;
  title: string;
  meta: string;
  social: string;
  icon: StepIcon;
  steps: WalkthroughStep[];
};

export type Bucket = {
  id: string;
  title: string;
  hint: string;
  icon: BucketIcon;
  bg: string;
  fg: string;
  remedies: Remedy[];
};

// ── Wellness buckets (what the user wants to explore) ─────────────────────────────

export const BUCKETS: Bucket[] = [
  {
    id: "pachan",
    title: "पाचन",
    hint: "गैस · एसिडिटी · अपच",
    icon: "soup",
    bg: "#E6F1FB",
    fg: "#185FA5",
    remedies: [
      {
        id: "jeera",
        title: "जीरा पानी",
        meta: "3 कदम · 5 मिनट",
        social: "712 लोगों को फ़ायदा हुआ",
        icon: "cup",
        steps: [
          { title: "जीरा भूनो", instruction: "एक चम्मच जीरा हल्का भून लें।", icon: "flame" },
          {
            title: "पानी में उबालो",
            instruction: "एक कप पानी में जीरा डालकर 3 मिनट उबालें।",
            icon: "flame",
          },
          { title: "गुनगुना पियो", instruction: "छानकर खाने के बाद गुनगुना पिएँ।", icon: "cup" },
        ],
      },
      {
        id: "ajwain",
        title: "अजवाइन-नमक",
        meta: "2 कदम · 3 मिनट",
        social: "540 लोगों को फ़ायदा हुआ",
        icon: "leaf",
        steps: [
          {
            title: "अजवाइन लो",
            instruction: "आधा चम्मच अजवाइन और चुटकी काला नमक लें।",
            icon: "leaf",
          },
          {
            title: "गुनगुने पानी से लो",
            instruction: "गुनगुने पानी के साथ निगल लें।",
            icon: "cup",
          },
        ],
      },
    ],
  },
  {
    id: "immunity",
    title: "इम्युनिटी",
    hint: "रोज़ की सेहत · थकान",
    icon: "shield",
    bg: "#E3F3E9",
    fg: "#1E7A46",
    remedies: [
      {
        id: "tulsi",
        title: "तुलसी काढ़ा",
        meta: "3 कदम · 8 मिनट",
        social: "1,321 लोगों को फ़ायदा हुआ",
        icon: "leaf",
        steps: [
          {
            title: "तुलसी पत्ते कूटो",
            instruction: "8–10 ताज़े तुलसी पत्ते हल्का कूट लें।",
            icon: "leaf",
          },
          {
            title: "पानी में उबालो",
            instruction: "एक कप पानी में तुलसी, 2 काली मिर्च और अदरक डालकर 5 मिनट उबालें।",
            icon: "flame",
          },
          {
            title: "गरम-गरम पियो",
            instruction: "छानकर थोड़ा शहद मिलाकर गरम-गरम पिएँ।",
            icon: "cup",
          },
        ],
      },
      {
        id: "haldi",
        title: "हल्दी दूध",
        meta: "3 कदम · 5 मिनट",
        social: "540 लोगों को फ़ायदा हुआ",
        icon: "cup",
        steps: [
          { title: "दूध गरम करो", instruction: "एक कप दूध हल्का गरम करें।", icon: "cup" },
          {
            title: "हल्दी मिलाओ",
            instruction: "आधा चम्मच हल्दी और चुटकी काली मिर्च मिलाएँ।",
            icon: "leaf",
          },
          {
            title: "सोने से पहले पियो",
            instruction: "रात सोने से 30 मिनट पहले गरम-गरम पिएँ।",
            icon: "moon",
          },
        ],
      },
    ],
  },
  {
    id: "sardi",
    title: "सर्दी-खाँसी",
    hint: "गला · मौसमी",
    icon: "thermometer",
    bg: "#FBEAE7",
    fg: "#C0492F",
    remedies: [
      {
        id: "adrak",
        title: "अदरक की चाय",
        meta: "3 कदम · 6 मिनट",
        social: "980 लोगों को फ़ायदा हुआ",
        icon: "cup",
        steps: [
          { title: "अदरक कूटो", instruction: "एक इंच अदरक छीलकर कूट लें।", icon: "leaf" },
          {
            title: "उबालो",
            instruction: "डेढ़ कप पानी में अदरक डालकर 5 मिनट उबालें।",
            icon: "flame",
          },
          {
            title: "शहद के साथ पियो",
            instruction: "छानकर थोड़ा शहद मिलाएँ और गरम पिएँ।",
            icon: "cup",
          },
        ],
      },
      {
        id: "shahad",
        title: "शहद-अदरक",
        meta: "2 कदम · 2 मिनट",
        social: "430 लोगों को फ़ायदा हुआ",
        icon: "leaf",
        steps: [
          {
            title: "रस निकालो",
            instruction: "थोड़ा अदरक कूटकर आधा चम्मच रस निकालें।",
            icon: "leaf",
          },
          {
            title: "शहद मिलाकर लो",
            instruction: "बराबर शहद मिलाकर दिन में दो बार चाटें।",
            icon: "cup",
          },
        ],
      },
    ],
  },
  {
    id: "twacha",
    title: "त्वचा और बाल",
    hint: "रूखापन · चमक",
    icon: "sparkles",
    bg: "#EFE8FB",
    fg: "#6D17CE",
    remedies: [
      {
        id: "naariyal",
        title: "नारियल तेल मालिश",
        meta: "2 कदम · 5 मिनट",
        social: "360 लोगों को फ़ायदा हुआ",
        icon: "droplet",
        steps: [
          {
            title: "तेल गुनगुना करो",
            instruction: "थोड़ा नारियल तेल हल्का गुनगुना करें।",
            icon: "droplet",
          },
          {
            title: "मालिश करो",
            instruction: "बालों की जड़ों में 5 मिनट हल्की मालिश करें।",
            icon: "sparkles",
          },
        ],
      },
      {
        id: "besan",
        title: "बेसन-हल्दी उबटन",
        meta: "3 कदम · 8 मिनट",
        social: "290 लोगों को फ़ायदा हुआ",
        icon: "leaf",
        steps: [
          {
            title: "पेस्ट बनाओ",
            instruction: "2 चम्मच बेसन, चुटकी हल्दी और थोड़ा दूध मिलाएँ।",
            icon: "leaf",
          },
          { title: "लगाओ", instruction: "चेहरे पर लगाकर 10 मिनट सूखने दें।", icon: "sparkles" },
          { title: "धो लो", instruction: "गुनगुने पानी से हल्के हाथ से धो लें।", icon: "droplet" },
        ],
      },
    ],
  },
];

export const FEELINGS: { id: string; label: string; icon: "smile" | "meh" | "frown" }[] = [
  { id: "good", label: "आराम है", icon: "smile" },
  { id: "some", label: "थोड़ा", icon: "meh" },
  { id: "no", label: "अभी नहीं", icon: "frown" },
];

// ── Timeline pacing (ms) ──────────────────────────────────────────────────────────

export const TIMING = {
  initial: 500,
  searchHold: 1800,
};
