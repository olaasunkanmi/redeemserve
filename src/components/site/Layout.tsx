import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BackButton } from "./BackButton";

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBack = pathname !== "/";
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {showBack && (
        <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-8 sm:pt-6">
          <BackButton />
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
