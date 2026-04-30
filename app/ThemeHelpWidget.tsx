"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "tornpage-theme";

export function ThemeHelpWidget() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  });
  const [isBouncing, setIsBouncing] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const onToggle = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setIsBouncing(true);
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
    window.setTimeout(() => {
      setIsBouncing(false);
    }, 280);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        onClick={onToggle}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900/95 text-zinc-100 shadow-lg shadow-black/40 transition hover:border-amber-400/50 hover:text-amber-200 ${
          isBouncing ? "theme-toggle-bounce" : ""
        }`}
      >
        {theme === "dark" ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
