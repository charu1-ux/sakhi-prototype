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
  };
  image: {
    title: string;
    sub: string;
    greet: string;
    ack: string;
    resultTag: string;
    resultNote: string;
    placeholder: string;
  };
  doc: {
    title: string;
    sub: string;
    greet: string;
    ack: string;
    summaryTag: string;
    summary: string[];
    placeholder: string;
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
    },
    image: {
      title: "Create an image",
      sub: "assistant",
      greet: "Describe the image you'd like and I'll create it.",
      ack: "Here's what I created —",
      resultTag: "Generated image",
      resultNote: "Tap to save or regenerate",
      placeholder: "Describe an image…",
    },
    doc: {
      title: "Explain a doc",
      sub: "assistant",
      greet: "Share a document or paste some text and I'll break it down for you.",
      ack: "Here's the gist —",
      summaryTag: "Summary",
      summary: [
        "Main point captured in one line.",
        "Key dates and numbers pulled out.",
        "Action items highlighted for you.",
      ],
      placeholder: "Paste text or describe the doc…",
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
    },
    image: {
      title: "इमेज बनाएं",
      sub: "असिस्टेंट",
      greet: "जो इमेज चाहिए उसका विवरण दें, मैं बना देता हूँ।",
      ack: "यह बनाया है —",
      resultTag: "बनाई गई इमेज",
      resultNote: "सेव या दोबारा बनाने के लिए टैप करें",
      placeholder: "इमेज का विवरण दें…",
    },
    doc: {
      title: "डॉक समझाएं",
      sub: "असिस्टेंट",
      greet: "कोई डॉक्यूमेंट शेयर करें या टेक्स्ट पेस्ट करें, मैं समझा देता हूँ।",
      ack: "संक्षेप में यह है —",
      summaryTag: "सारांश",
      summary: [
        "मुख्य बात एक लाइन में।",
        "ज़रूरी तारीखें और आँकड़े निकाले गए।",
        "करने वाले काम हाइलाइट किए गए।",
      ],
      placeholder: "टेक्स्ट पेस्ट करें या डॉक बताएं…",
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
