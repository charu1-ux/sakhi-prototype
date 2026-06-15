"use client";

import { useEffect, useState } from "react";

// Lightweight i18n for the Daily Saathi flow. English is the default; Hindi
// (Devanagari) is the second language. Designed to extend easily — add a new
// Lang key + a STRINGS entry. Selection persists in localStorage and syncs
// across the (full-page) route navigations and any mounted components.

export type Lang = "en" | "hi";

export const LANG_KEY = "saathi_lang";
const LANG_EVENT = "saathi-lang-change";

type CardRows = [string, string][];

// One scripted exchange: the suggested replies the user can tap this turn, and
// the assistant's bubbles after they respond (typing freely advances it too).
export type StoryTurn = { suggestions: string[]; reply: string[] };

export type Strings = {
  appTitle: string;
  back: string;
  greeting: (name: string) => string;
  greetingSub: string;
  modes: {
    dil: { label: string; sub: string };
    kaam: { label: string; sub: string };
  };
  recall: { text: string; hint: string };
  forToday: string;
  reminders: { title: string; subtitle: string };
  briefing: { title: string; subtitle: string };
  diary: { title: string; subtitle: string; add: string };
  composer: string;
  speak: string;
  assistant: string;
  kaam: {
    title: string;
    headerSub: string;
    greet: string;
    pills: { reminder: string; image: string; doc: string };
    placeholder: string;
    fallback: string;
    // Tappable example prompts that drive the three reminder widget states.
    examples: {
      empty: { chip: string; line: string };
      partial: { chip: string; line: string; what: string };
      full: { chip: string; line: string; what: string };
    };
  };
  image: {
    title: string;
    sub: string;
    greet: string;
    ack: string;
    resultTag: string;
    resultNote: string;
    placeholder: string;
    story: StoryTurn[];
  };
  doc: {
    title: string;
    sub: string;
    greet: string;
    ack: string;
    summaryTag: string;
    summary: string[];
    placeholder: string;
    story: StoryTurn[];
  };
  remindersChat: { seed: string; ack: string; cardHeading: string; cardRows: CardRows };
  briefingChat: { seed: string; ack: string; cardHeading: string; cardRows: CardRows };
  diaryScreen: { title: string; subtitle: string; placeholder: string; save: string };
  rem: {
    title: string;
    add: string;
    filters: { overdue: string; today: string; upcoming: string; all: string };
    allClear: string;
    moreSuffix: string;
    tapExpand: string;
    overdueWord: string;
    todayWord: string;
    doneTodayWord: string;
    nudgeSuffix: string;
    strip: string;
    lists: { Work: string; Personal: string; Shopping: string };
    chatTitle: string;
    chatSub: string;
    greet: string;
    askWhat: string;
    askWhen: string;
    confirmIntro: string;
    cardTag: string;
    save: string;
    edit: string;
    cancel: string;
    editPrompt: string;
    placeholder: string;
    widget: {
      whatLabel: string;
      whatPh: string;
      dateLabel: string;
      today: string;
      tomorrow: string;
      timeLabel: string;
      selectTime: string;
      submit: string;
      composerPh: string;
      leadEmpty: string;
      leadAllSet: string;
      needWhat: string;
      needDate: string;
      needTime: string;
      needMore: string;
      edit: string;
      dpToday: string;
      dpTomorrow: string;
      dpOn: string;
      success: (what: string, datePhrase: string, time: string) => string;
    };
  };
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    appTitle: "Daily Saathi",
    back: "Back",
    greeting: (name) => (name ? `Namaste, ${name}` : "Namaste"),
    greetingSub: "What would you like to do?",
    modes: {
      dil: { label: "Dil Ki Baat", sub: "Talk to me" },
      kaam: { label: "Kaam Ki Baat", sub: "Get things done" },
    },
    recall: { text: "How is your sister feeling now?", hint: "Tap to reply in Dil Ki Baat" },
    forToday: "For today",
    reminders: { title: "Reminders", subtitle: "Bank call · 3:00 PM" },
    briefing: { title: "Daily briefing", subtitle: "Weather · news · plan" },
    diary: { title: "Today's diary", subtitle: "How was your day?", add: "+ Add" },
    composer: "Speak or type…",
    speak: "Speak",
    assistant: "assistant",
    kaam: {
      title: "Kaam Ki Baat",
      headerSub: "Your assistant",
      greet: "Namaste! I can help you get things done. What would you like to do?",
      pills: { reminder: "Add a reminder", image: "Create an image", doc: "Explain a doc" },
      placeholder: "Ask me anything…",
      fallback:
        "I can help with reminders, creating an image, or explaining a document — tap one above to start.",
      examples: {
        empty: { chip: "Set a reminder", line: "Set a reminder" },
        partial: {
          chip: "Remind me to call the bank",
          line: "Remind me to call the bank",
          what: "Call the bank",
        },
        full: {
          chip: "Pay rent tomorrow 9 AM",
          line: "Remind me to pay the rent tomorrow at 9 AM",
          what: "Pay the rent",
        },
      },
    },
    image: {
      title: "Create an image",
      sub: "assistant",
      greet: "Describe the image you'd like and I'll create it.",
      ack: "Here's what I created —",
      resultTag: "Generated image",
      resultNote: "Tap to save or regenerate",
      placeholder: "Describe an image…",
      story: [
        {
          suggestions: [
            "A Diwali greeting card",
            "A poster for my shop",
            "A birthday card for Mom",
          ],
          reply: ["On it — give me a moment.", "Here's a first version 👇"],
        },
        {
          suggestions: ["Make it warmer", "Add 'Happy Diwali' text", "More colourful"],
          reply: ["Nice idea — tweaking it now.", "How does this version feel?"],
        },
        {
          suggestions: ["Add my shop name", "Make the diya bigger"],
          reply: ["Done — added that in.", "Want any other change?"],
        },
        {
          suggestions: ["That's perfect", "Try a different style"],
          reply: ["Glad you like it!", "I can save it or make a few variations."],
        },
        {
          suggestions: ["Save it", "Make 2 more variations"],
          reply: ["Saved to your gallery.", "Anything else you'd like to create?"],
        },
        {
          suggestions: ["Resize for WhatsApp status", "I'm done for now"],
          reply: ["Sure — resized for a WhatsApp status.", "Ping me whenever you need another."],
        },
      ],
    },
    doc: {
      title: "Explain a doc",
      sub: "assistant",
      greet: "Share a document or paste some text and I'll break it down for you.",
      ack: "Here's the gist —",
      summaryTag: "Summary",
      summary: [
        "It's an 11-month rent agreement for ₹18,000/month.",
        "Deposit of ₹54,000 is due within 7 days of signing.",
        "You need to sign page 3; a 2% monthly late fee applies.",
      ],
      placeholder: "Paste text or describe the doc…",
      story: [
        {
          suggestions: [
            "Summarise my rent agreement",
            "Explain this bank SMS",
            "What does this form ask for?",
          ],
          reply: ["Got it — reading through it now.", "Here's the gist 👇"],
        },
        {
          suggestions: ["What do I need to do?", "Any important dates?"],
          reply: [
            "Two things need you: sign page 3, and pay the deposit.",
            "The deposit is due within 7 days of signing.",
          ],
        },
        {
          suggestions: ["Is anything unusual in it?", "Explain the late-fee clause"],
          reply: [
            "One thing to note: there's a 2% monthly late fee on delayed rent.",
            "Nothing else looks out of the ordinary.",
          ],
        },
        {
          suggestions: ["Draft a reply to the landlord", "Add the deadline to my reminders"],
          reply: ["Sure — I can do either.", "Which would help more right now?"],
        },
        {
          suggestions: ["Add the deadline to reminders", "Just save the summary"],
          reply: [
            "Done — I'll remind you before the deposit is due.",
            "Anything else from the document?",
          ],
        },
        {
          suggestions: ["No, that's all — thanks", "Explain one more line"],
          reply: ["Anytime.", "Send me any document and I'll break it down just like this."],
        },
      ],
    },
    remindersChat: {
      seed: "You have one reminder set for today. Tell me if you'd like to add another.",
      ack: "Done — I'll remind you.",
      cardHeading: "Task",
      cardRows: [
        ["What", "Bank call"],
        ["When", "Today"],
        ["Time", "3:00 PM"],
      ],
    },
    briefingChat: {
      seed: "Your morning briefing is ready — weather, news and today's plan.",
      ack: "Got it, I'll keep you updated.",
      cardHeading: "Today",
      cardRows: [
        ["Weather", "32° · clear"],
        ["News", "3 new"],
        ["Day ahead", "2 tasks"],
      ],
    },
    diaryScreen: {
      title: "Today's diary",
      subtitle: "Today",
      placeholder: "What happened today…",
      save: "Save",
    },
    rem: {
      title: "Reminders",
      add: "Add",
      filters: { overdue: "Overdue", today: "Today", upcoming: "Upcoming", all: "All" },
      allClear: "All clear",
      moreSuffix: "more",
      tapExpand: "tap to expand",
      overdueWord: "overdue",
      todayWord: "today",
      doneTodayWord: "done today",
      nudgeSuffix: "need attention",
      strip: "Remind me to…",
      lists: { Work: "Work", Personal: "Personal", Shopping: "Shopping" },
      chatTitle: "Add a reminder",
      chatSub: "Type or speak naturally",
      greet: "Hey! What do you want to remember?",
      askWhat: "What should I remind you about?",
      askWhen: "Sure — when should I remind you?",
      confirmIntro: "Got it. Here's what I'll save —",
      cardTag: "New reminder",
      save: "Save",
      edit: "Edit",
      cancel: "Cancel",
      editPrompt: "No problem — what should I change?",
      placeholder: "Type a reminder…",
      widget: {
        whatLabel: "What to remind",
        whatPh: "e.g. Call the doctor",
        dateLabel: "Date",
        today: "Today",
        tomorrow: "Tomorrow",
        timeLabel: "Time",
        selectTime: "Select time",
        submit: "Set reminder",
        composerPh: "Type or speak…",
        leadEmpty:
          "Sure. Fill in the details below — you can type in a field, type in the chat, or just speak.",
        leadAllSet: "All set. Just confirm the details and tap below.",
        needWhat: "Got it. Just tell me what to remind you about.",
        needDate: "Got it. Just pick a date and you're set.",
        needTime: "Got it. Just pick a time and you're set.",
        needMore: "Got it. Fill in the highlighted fields and you're set.",
        edit: "Edit",
        dpToday: "today",
        dpTomorrow: "tomorrow",
        dpOn: "on ",
        success: (what, datePhrase, time) =>
          `Reminder set. I'll remind you to ${what} ${datePhrase} at ${time}.`,
      },
    },
  },
  hi: {
    appTitle: "डेली साथी",
    back: "वापस",
    greeting: (name) => (name ? `नमस्ते, ${name}` : "नमस्ते"),
    greetingSub: "आज क्या करें?",
    modes: {
      dil: { label: "दिल की बात", sub: "मुझसे बात करें" },
      kaam: { label: "काम की बात", sub: "काम करवाना है" },
    },
    recall: { text: "बहन की तबियत कैसी है अब?", hint: "दिल की बात में जवाब दें" },
    forToday: "आज के लिए",
    reminders: { title: "रिमाइंडर", subtitle: "बैंक कॉल · 3 बजे" },
    briefing: { title: "डेली ब्रीफिंग", subtitle: "मौसम · खबरें · प्लान" },
    diary: { title: "आज की डायरी", subtitle: "आज का दिन कैसा था?", add: "+ जोड़ें" },
    composer: "बोलो या लिखो…",
    speak: "बोलें",
    assistant: "असिस्टेंट",
    kaam: {
      title: "काम की बात",
      headerSub: "आपका असिस्टेंट",
      greet: "नमस्ते! मैं आपका काम आसान कर सकता हूँ। क्या करना है?",
      pills: { reminder: "रिमाइंडर जोड़ें", image: "इमेज बनाएं", doc: "डॉक समझाएं" },
      placeholder: "कुछ भी पूछें…",
      fallback:
        "मैं रिमाइंडर, इमेज बनाने, या डॉक समझाने में मदद कर सकता हूँ — ऊपर किसी एक को चुनें।",
      examples: {
        empty: { chip: "रिमाइंडर सेट करें", line: "रिमाइंडर सेट करो" },
        partial: {
          chip: "बैंक कॉल याद दिलाओ",
          line: "बैंक को कॉल करना याद दिलाओ",
          what: "बैंक को कॉल करें",
        },
        full: {
          chip: "कल 9 बजे किराया",
          line: "कल सुबह 9 बजे किराया देना याद दिलाओ",
          what: "किराया देना",
        },
      },
    },
    image: {
      title: "इमेज बनाएं",
      sub: "असिस्टेंट",
      greet: "जो इमेज चाहिए उसका विवरण दें, मैं बना देता हूँ।",
      ack: "यह बनाया है —",
      resultTag: "बनाई गई इमेज",
      resultNote: "सेव या दोबारा बनाने के लिए टैप करें",
      placeholder: "इमेज का विवरण दें…",
      story: [
        {
          suggestions: ["दिवाली ग्रीटिंग कार्ड", "मेरी दुकान का पोस्टर", "माँ के लिए बर्थडे कार्ड"],
          reply: ["ठीक है — एक पल दीजिए।", "यह पहला वर्शन है 👇"],
        },
        {
          suggestions: ["थोड़ा गर्म रंग करो", "'Happy Diwali' लिखो", "और रंगीन करो"],
          reply: ["अच्छा सुझाव — अभी बदल देता हूँ।", "यह वर्शन कैसा लग रहा है?"],
        },
        {
          suggestions: ["दुकान का नाम जोड़ो", "दीया बड़ा करो"],
          reply: ["हो गया — जोड़ दिया।", "कोई और बदलाव चाहिए?"],
        },
        {
          suggestions: ["यह परफेक्ट है", "कोई अलग स्टाइल दिखाओ"],
          reply: ["अच्छा लगा कि पसंद आया!", "मैं इसे सेव कर सकता हूँ या कुछ वैरिएशन बना सकता हूँ।"],
        },
        {
          suggestions: ["इसे सेव करो", "2 और वैरिएशन बनाओ"],
          reply: ["आपकी गैलरी में सेव कर दिया।", "और कुछ बनाना चाहेंगे?"],
        },
        {
          suggestions: ["WhatsApp स्टेटस साइज़ करो", "अभी के लिए बस"],
          reply: ["ज़रूर — WhatsApp स्टेटस के लिए साइज़ कर दिया।", "जब भी ज़रूरत हो, बता दीजिए।"],
        },
      ],
    },
    doc: {
      title: "डॉक समझाएं",
      sub: "असिस्टेंट",
      greet: "कोई डॉक्यूमेंट शेयर करें या टेक्स्ट पेस्ट करें, मैं समझा देता हूँ।",
      ack: "संक्षेप में यह है —",
      summaryTag: "सारांश",
      summary: [
        "यह ₹18,000/माह का 11 महीने का रेंट एग्रीमेंट है।",
        "साइन करने के 7 दिन में ₹54,000 जमा देना है।",
        "पेज 3 पर साइन करना है; देरी पर 2% मासिक लेट फीस लगेगी।",
      ],
      placeholder: "टेक्स्ट पेस्ट करें या डॉक बताएं…",
      story: [
        {
          suggestions: [
            "मेरा रेंट एग्रीमेंट समझाओ",
            "यह बैंक SMS समझाओ",
            "यह फॉर्म क्या माँग रहा है?",
          ],
          reply: ["ठीक है — पढ़ रहा हूँ।", "संक्षेप में यह है 👇"],
        },
        {
          suggestions: ["मुझे क्या करना है?", "कोई ज़रूरी तारीख?"],
          reply: [
            "दो काम आपके हैं: पेज 3 पर साइन, और डिपॉज़िट देना।",
            "डिपॉज़िट साइन करने के 7 दिन के अंदर देना है।",
          ],
        },
        {
          suggestions: ["कुछ असामान्य है क्या?", "लेट-फीस वाला हिस्सा समझाओ"],
          reply: [
            "एक बात ध्यान दें: देरी से किराए पर 2% मासिक लेट फीस है।",
            "बाकी कुछ असामान्य नहीं दिख रहा।",
          ],
        },
        {
          suggestions: ["मकान-मालिक को जवाब लिखो", "तारीख रिमाइंडर में डालो"],
          reply: ["ज़रूर — दोनों कर सकता हूँ।", "अभी किससे ज़्यादा मदद होगी?"],
        },
        {
          suggestions: ["तारीख रिमाइंडर में डालो", "बस सारांश सेव करो"],
          reply: ["हो गया — डिपॉज़िट से पहले याद दिला दूँगा।", "डॉक्यूमेंट से और कुछ?"],
        },
        {
          suggestions: ["नहीं, बस — शुक्रिया", "एक और लाइन समझाओ"],
          reply: ["कभी भी।", "कोई भी डॉक्यूमेंट भेजिए, मैं ऐसे ही समझा दूँगा।"],
        },
      ],
    },
    remindersChat: {
      seed: "आज के लिए एक रिमाइंडर सेट है। नया जोड़ना हो तो बताइए।",
      ack: "हो गया — मैं आपको याद दिला दूँगा।",
      cardHeading: "टास्क",
      cardRows: [
        ["क्या", "बैंक कॉल"],
        ["कब", "आज"],
        ["समय", "3:00 बजे"],
      ],
    },
    briefingChat: {
      seed: "सुबह की ब्रीफिंग तैयार है — मौसम, खबरें और आज का प्लान।",
      ack: "ठीक है, मैं अपडेट करता रहूँगा।",
      cardHeading: "आज",
      cardRows: [
        ["मौसम", "32° · साफ"],
        ["खबरें", "3 नई"],
        ["दिन आगे", "2 काम"],
      ],
    },
    diaryScreen: {
      title: "आज की डायरी",
      subtitle: "आज",
      placeholder: "आज क्या हुआ…",
      save: "सेव करें",
    },
    rem: {
      title: "रिमाइंडर",
      add: "जोड़ें",
      filters: { overdue: "बकाया", today: "आज", upcoming: "आगामी", all: "सभी" },
      allClear: "सब हो गया",
      moreSuffix: "और",
      tapExpand: "देखने के लिए टैप करें",
      overdueWord: "बकाया",
      todayWord: "आज",
      doneTodayWord: "आज पूरे",
      nudgeSuffix: "ध्यान दें",
      strip: "याद दिलाओ…",
      lists: { Work: "काम", Personal: "निजी", Shopping: "खरीदारी" },
      chatTitle: "रिमाइंडर जोड़ें",
      chatSub: "बोलकर या लिखकर बताएं",
      greet: "नमस्ते! क्या याद रखना है?",
      askWhat: "किस बारे में याद दिलाऊँ?",
      askWhen: "ठीक है — कब याद दिलाऊँ?",
      confirmIntro: "समझ गया। यह सेव करूँगा —",
      cardTag: "नया रिमाइंडर",
      save: "सेव करें",
      edit: "बदलें",
      cancel: "रद्द करें",
      editPrompt: "कोई बात नहीं — क्या बदलूँ?",
      placeholder: "रिमाइंडर लिखें…",
      widget: {
        whatLabel: "किसकी याद",
        whatPh: "जैसे डॉक्टर को कॉल करें",
        dateLabel: "तारीख",
        today: "आज",
        tomorrow: "कल",
        timeLabel: "समय",
        selectTime: "समय चुनें",
        submit: "रिमाइंडर सेट करें",
        composerPh: "लिखें या बोलें…",
        leadEmpty: "ज़रूर। नीचे विवरण भरें — आप फ़ील्ड में लिखें, चैट में लिखें, या बस बोलें।",
        leadAllSet: "सब तैयार। विवरण देखकर नीचे टैप करें।",
        needWhat: "ठीक है। बस बताएं किसकी याद दिलानी है।",
        needDate: "ठीक है। बस तारीख चुनें।",
        needTime: "ठीक है। बस समय चुनें।",
        needMore: "ठीक है। हाइलाइट किए फ़ील्ड भरें।",
        edit: "बदलें",
        dpToday: "आज",
        dpTomorrow: "कल",
        dpOn: "",
        success: (what, datePhrase, time) => `रिमाइंडर सेट! ${what} — ${datePhrase} ${time}।`,
      },
    },
  },
};

function readLang(): Lang {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";
}

// Reactive language hook. Defaults to English on first render (export-safe),
// then hydrates from localStorage and listens for changes from other instances.
export function useLang() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(readLang());
    const sync = () => setLangState(readLang());
    window.addEventListener(LANG_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LANG_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setLang = (l: Lang) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_KEY, l);
      window.dispatchEvent(new Event(LANG_EVENT));
    }
    setLangState(l);
  };

  return { lang, setLang, t: STRINGS[lang] };
}
