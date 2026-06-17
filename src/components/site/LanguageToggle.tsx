import { Globe } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const OPTS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "yo", label: "YO" },
  { code: "ig", label: "IG" },
];

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="hidden items-center gap-1 rounded-full border border-emerald-deep/15 bg-surface px-1 py-1 text-[11px] font-bold text-emerald-deep sm:flex" aria-label="Language">
      <Globe className="ml-1 h-3.5 w-3.5 opacity-60" />
      {OPTS.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`rounded-full px-2 py-1 transition ${lang === o.code ? "bg-emerald-deep text-cream" : "hover:bg-emerald-soft"}`}
          aria-pressed={lang === o.code}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
