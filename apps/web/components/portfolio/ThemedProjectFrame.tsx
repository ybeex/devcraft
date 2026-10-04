"use client";

import { useEffect, useState } from "react";

function withThemeParam(url: string, theme: "dark" | "light"): string {
  try {
    const u = new URL(url);
    u.searchParams.set("theme", theme);
    return u.toString();
  } catch {
    // Malformed/relative URL — fall back to a plain query-string append
    // rather than dropping the theme param entirely.
    return `${url}${url.includes("?") ? "&" : "?"}theme=${theme}`;
  }
}

// Keeps a project's embedded live preview in sync with the portfolio's own
// dark/light theme. ThemeToggle flips a class on <html> directly (no custom
// event), so a MutationObserver is the reliable way to pick that up and
// reload the iframe with a matching `?theme=` param.
export function ThemedProjectFrame({ src, title }: { src: string; title: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const root = document.documentElement;
    const readTheme = (): void => setTheme(root.classList.contains("dark") ? "dark" : "light");
    readTheme();

    const observer = new MutationObserver(readTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <iframe
      src={withThemeParam(src, theme)}
      title={title}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full border-0"
      style={{ background: "var(--canvas)" }}
    />
  );
}
