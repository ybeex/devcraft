"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        w-10 h-10 rounded-xl border flex items-center justify-center
        transition-all duration-200 hover:scale-105 active:scale-90
        bg-(--raised) border-(--rim) text-(--ink)
        ${className ?? ""}
      `}
    >
      {dark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </button>
  );
}
