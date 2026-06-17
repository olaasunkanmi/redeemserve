import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "yo" | "ig";

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.discover": "Browse vendors",
    "nav.saved": "Saved",
    "nav.orders": "My orders",
    "nav.sell": "Sell",
    "nav.refer": "Refer & earn",
    "nav.about": "About",
    "nav.signin": "Sign in",
    "nav.portal": "My portal",
    "common.search": "Search vendors…",
    "lang.label": "Language",
  },
  yo: {
    "nav.home": "Ile",
    "nav.discover": "Wa awọn olutaja",
    "nav.saved": "Ti a fipamọ",
    "nav.orders": "Awọn aṣẹ mi",
    "nav.sell": "Ta",
    "nav.refer": "Tọka, gba ere",
    "nav.about": "Nipa",
    "nav.signin": "Wọle",
    "nav.portal": "Ọnà mi",
    "common.search": "Wa olutaja…",
    "lang.label": "Èdè",
  },
  ig: {
    "nav.home": "Ụlọ",
    "nav.discover": "Chọta ndị na-ere",
    "nav.saved": "Echekwara",
    "nav.orders": "Iwu m",
    "nav.sell": "Ree",
    "nav.refer": "Kpọkuo, nweta ego",
    "nav.about": "Banyere",
    "nav.signin": "Banye",
    "nav.portal": "Ebe m",
    "common.search": "Chọọ ndị na-ere…",
    "lang.label": "Asụsụ",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored && DICT[stored]) setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };
  const t = (key: string) => DICT[lang][key] ?? DICT.en[key] ?? key;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
