import { useRouter, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

type Props = {
  fallbackTo?: string;
  label?: string;
  className?: string;
};

export function BackButton({ fallbackTo = "/", label = "Back", className = "" }: Props) {
  const router = useRouter();
  const navigate = useNavigate();

  function handleBack() {
    const canGoBack =
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer !== "";
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: fallbackTo });
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={
        "inline-flex items-center gap-2 rounded-full border border-emerald-deep/15 bg-surface/80 px-3.5 py-2 text-sm font-semibold text-emerald-deep backdrop-blur transition-colors hover:bg-emerald-soft " +
        className
      }
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
