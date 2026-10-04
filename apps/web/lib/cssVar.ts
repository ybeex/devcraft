/**
 * D3Charts.tsx and skillIcons.tsx each hardcoded raw hex duplicates of
 * tokens already defined in globals.css (`#d4ac55` for `--brand`, `#313d63`
 * for `--rim`, etc.) because D3/Canvas need a literal color string, not a
 * CSS var() reference. That meant a palette change (or the light/dark
 * switch) silently didn't reach charts and icons — this reads the live,
 * theme-resolved value instead, so there is exactly one source of truth.
 */
export function cssVar(name: string, fallback = "#000000"): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Re-reads every token in `names` — call inside a theme-change effect so
 *  chart colors update immediately when the user flips light/dark, rather
 *  than only on next mount. */
export function cssVars<T extends Record<string, string>>(map: T): { [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const key in map) out[key] = cssVar(map[key], "#000000");
  return out;
}
