type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_STYLE: Record<Variant, { background: string; color: string; border: string; glass?: boolean }> = {
  primary:   { background: "var(--brand)",     color: "var(--on-brand)", border: "var(--brand)" },
  secondary: { background: "var(--glass-bg)",  color: "var(--ink)",  border: "var(--glass-border)", glass: true },
  ghost:     { background: "transparent",      color: "var(--dim)", border: "transparent" },
  danger:    { background: "var(--neg-bg)",    color: "var(--neg-text)", border: "var(--neg-text)" },
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[13px] gap-1.5 min-h-[38px]",
  md: "px-5 py-2.5 text-[14px] gap-2 min-h-[44px]",
  lg: "px-6 py-3.5 text-[16px] gap-2.5 min-h-[50px]",
};

function classes(size: Size, fullWidth: boolean | undefined, className?: string) {
  return [
    "btn-liquid inline-flex items-center justify-center rounded-xl font-semibold relative overflow-hidden",
    "transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed",
    "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:duration-100",
    SIZE_CLASS[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

function variantStyle(variant: Variant, disabled?: boolean) {
  const v = VARIANT_STYLE[variant];
  return {
    background: v.background,
    color: v.color,
    borderWidth: 1,
    borderStyle: "solid" as const,
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

export function buttonClassName(size: Size, fullWidth?: boolean, className?: string): string {
  return classes(size, fullWidth, className);
}

export function buttonStyle(variant: Variant, disabled?: boolean): ReturnType<typeof variantStyle> {
  return variantStyle(variant, disabled);
}

export type { Variant as ButtonVariant, Size as ButtonSize };
