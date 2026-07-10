"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "hi" | "en";
// `ready` is false until the saved language has been read from localStorage.
// Consumers that fire a one-shot action on mount (e.g. the Content Hub auto-
// submitting a `?q=` deep link) must wait for `ready`, otherwise they capture
// the default "hi" before the user's saved "en" is applied.
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; ready: boolean }>({
  lang: "hi",
  setLang: () => {},
  ready: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("sakhi_lang") as Lang | null;
    if (saved === "hi" || saved === "en") setLangState(saved);
    setReady(true);
  }, []);
  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("sakhi_lang", l);
  }
  return <LangContext.Provider value={{ lang, setLang, ready }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
