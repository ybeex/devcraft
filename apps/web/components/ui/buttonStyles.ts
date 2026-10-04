/**
 * Pure style computation for buttons — no "use client" directive, no React
 * components, so Server Components (Projects.tsx, Blog.tsx, the unsubscribe
 * page) can call buttonClassName()/buttonStyle() directly without pulling in
 * Button.tsx's client boundary (forwardRef, event handlers) just to style a
 * plain `<Link>`. Button.tsx imports these same functions for the actual
 * interactive <Button>/<ButtonLink> components, so there's exactly one
 * definition either way.
 */

export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";

const VARIANT_STYLE: Record<Variant, { background: string; color: string; border: string; glass?: boolean }> = {
  primary:   { background: "var(--brand)",     color: "var(--on-brand)", border: "var(--brand)" },
  // Secondary/ghost are real frosted glass — translucent + blurred — rather
  // than a flat "raised" fill, so the liquid-glass material reaches every
  // button in the app, not just the panels behind them.
  secondary: { background: "var(--glass-bg)",  color: "var(--ink)",  border: "var(--glass-border)", glass: true },
  ghost:     { background: "transparent",      color: "var(--dim)", border: "transparent" },
  danger:    { background: "var(--neg-bg)",    color: "var(--neg-text)", border: "var(--neg-text)" },
};

// Padding is generous enough that even "sm" clears the ~44px touch target
// via its hit area, not by shrinking the visible label.
const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[13px] gap-1.5 min-h-[38px]",
  md: "px-5 py-2.5 text-[14px] gap-2 min-h-[44px]",
  lg: "px-6 py-3.5 text-[16px] gap-2.5 min-h-[50px]",
};

export function buttonClassName(size: Size, fullWidth?: boolean, className?: string): string {
  return [
    "btn-liquid inline-flex items-center justify-center rounded-xl font-semibold relative overflow-hidden",
    "transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    // Liquid press: a real depress (scale), not just a color/opacity flick —
    // the state mandate every AI-slop checklist calls out as missing.
    "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:duration-100",
    SIZE_CLASS[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

export function buttonStyle(variant: Variant, disabled?: boolean): {
  background: string;
  color: string;
  borderWidth: number;
  borderStyle: "solid";
  borderColor: string;
  boxShadow: string;
  backdropFilter: string | undefined;
  WebkitBackdropFilter: string | undefined;
} {
  const v = VARIANT_STYLE[variant];
  return {
    background: v.background,
    color: v.color,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: v.border,
    boxShadow: variant === "primary" && !disabled
      ? "0 6px 18px -8px var(--brand-glow)"
      : v.glass
        ? "inset 0 1px 0 0 var(--glass-highlight)"
        : "none",
    backdropFilter: v.glass ? "var(--glass-blur)" : undefined,
    WebkitBackdropFilter: v.glass ? "var(--glass-blur)" : undefined,
  };
}
