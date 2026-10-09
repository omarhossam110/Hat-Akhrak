"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Dev-only: React's Strict Mode remounts once and resets <html> to only
  // the attributes it manages from JSX, clearing the data-theme the inline
  // script set in <head>. Re-apply it before paint so dev doesn't flash
  // back to light. No-op in production (nothing to re-apply there).
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") document.documentElement.setAttribute("data-theme", "dark");
    } catch {
      // localStorage unavailable — ignore, default theme stands
    }
  }, []);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore — best-effort persistence only
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft sm:h-[42px] sm:min-w-[42px]"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
