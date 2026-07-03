"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "hi" | "en";
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "hi",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");
  useEffect(() => {
    const saved = localStorage.getItem("sakhi_lang") as Lang | null;
    if (saved === "hi" || saved === "en") setLangState(saved);
  }, []);
  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("sakhi_lang", l);
  }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
