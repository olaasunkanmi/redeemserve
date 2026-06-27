import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Lang = "en" | "yo" | "ig";

const NAV: Record<Lang, Record<string, string>> = {
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

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; translating: boolean };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k, translating: false });

const CACHE_KEY = (lang: Lang) => `i18n-cache-${lang}`;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "SVG", "PATH"]);

function loadCache(lang: Lang): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY(lang));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveCache(lang: Lang, cache: Record<string, string>) {
  try { sessionStorage.setItem(CACHE_KEY(lang), JSON.stringify(cache)); } catch {}
}

function collectTextNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
      const text = node.nodeValue ?? "";
      const trimmed = text.trim();
      if (trimmed.length < 2) return NodeFilter.FILTER_REJECT;
      // Skip pure numbers / symbols
      if (/^[\d\s.,:;%₦$€£·→★◆\-+/()]+$/.test(trimmed)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  } as any);
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

const ORIG_ATTR = "__i18n_orig__";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [translating, setTranslating] = useState(false);
  const cacheRef = useRef<Record<string, string>>({});
  const langRef = useRef<Lang>("en");
  const queueTimer = useRef<any>(null);

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored && NAV[stored]) {
      setLangState(stored);
      langRef.current = stored;
      cacheRef.current = loadCache(stored);
    }
  }, []);

  const restoreOriginals = useCallback(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-i18n-touched='1']");
    nodes.forEach((el) => {
      const stored = (el as any)[ORIG_ATTR] as Map<Node, string> | undefined;
      if (!stored) return;
      stored.forEach((orig, node) => { if (node.nodeValue !== orig) node.nodeValue = orig; });
    });
  }, []);

  const translateDom = useCallback(async (target: Lang) => {
    if (target === "en") {
      restoreOriginals();
      return;
    }
    const cache = cacheRef.current;
    const nodes = collectTextNodes(document.body);
    if (nodes.length === 0) return;

    // Save originals + apply cached translations immediately
    const missing: { node: Text; original: string }[] = [];
    nodes.forEach((node) => {
      const original = node.nodeValue ?? "";
      const key = original.trim();
      if (!key) return;
      const parent = node.parentElement;
      if (parent) {
        parent.setAttribute("data-i18n-touched", "1");
        const map = ((parent as any)[ORIG_ATTR] ||= new Map<Node, string>());
        if (!map.has(node)) map.set(node, original);
      }
      const cached = cache[key];
      if (cached) {
        // Preserve original surrounding whitespace
        const leading = original.match(/^\s*/)?.[0] ?? "";
        const trailing = original.match(/\s*$/)?.[0] ?? "";
        if (node.nodeValue !== leading + cached + trailing) {
          node.nodeValue = leading + cached + trailing;
        }
      } else {
        missing.push({ node, original });
      }
    });

    if (missing.length === 0) return;
    setTranslating(true);
    try {
      // Dedupe missing keys
      const unique = Array.from(new Set(missing.map((m) => m.original.trim())));
      // Batch in chunks of 80
      for (let i = 0; i < unique.length; i += 80) {
        const slice = unique.slice(i, i + 80);
        const res = await fetch("/api/public/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lang: target, texts: slice }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const translations: string[] = Array.isArray(data.translations) ? data.translations : [];
        slice.forEach((src, idx) => {
          const tr = translations[idx];
          if (typeof tr === "string" && tr.length > 0) cache[src] = tr;
        });
        // If user switched language mid-fetch, abort applying
        if (langRef.current !== target) return;
        // Apply newly translated
        missing.forEach(({ node, original }) => {
          const key = original.trim();
          const tr = cache[key];
          if (!tr) return;
          const leading = original.match(/^\s*/)?.[0] ?? "";
          const trailing = original.match(/\s*$/)?.[0] ?? "";
          const next = leading + tr + trailing;
          if (node.nodeValue !== next) node.nodeValue = next;
        });
      }
      saveCache(target, cache);
    } finally {
      setTranslating(false);
    }
  }, [restoreOriginals]);

  const scheduleTranslate = useCallback(() => {
    if (langRef.current === "en") return;
    clearTimeout(queueTimer.current);
    queueTimer.current = setTimeout(() => translateDom(langRef.current), 250);
  }, [translateDom]);

  // Run on language change
  useEffect(() => {
    langRef.current = lang;
    cacheRef.current = loadCache(lang);
    if (lang === "en") restoreOriginals();
    else translateDom(lang);
  }, [lang, translateDom, restoreOriginals]);

  // Observe DOM mutations to translate new content (route changes, dynamic data)
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => scheduleTranslate());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [scheduleTranslate]);

  const setLang = (l: Lang) => {
    setLangState(l);
    langRef.current = l;
    try { localStorage.setItem("lang", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };
  const t = (key: string) => NAV[lang][key] ?? NAV.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t, translating }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
