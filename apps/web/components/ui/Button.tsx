"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { LaujeSpinner } from "@/components/hausa";
import { buttonClassName, buttonStyle, type Variant, type Size } from "@/components/ui/buttonStyles";

/**
 * Single source of truth for every brand button in the app. Before this,
 * 18 separate files each hand-rolled `style={{ background: "var(--brand)" }}`
 * plus their own padding/radius/hover/disabled handling — meaning a tap
 * target, a focus state, or a brand tweak had to be fixed in 18 places.
 * The global `:focus-visible` ring in globals.css applies automatically;
 * this component only needs to get sizing, variants, and states right once.
 *
 * The style computation itself lives in buttonStyles.ts (no "use client"),
 * so a Server Component styling a plain <Link> as a button (Projects.tsx,
 * Blog.tsx, the unsubscribe page) can call buttonClassName()/buttonStyle()
 * directly without importing this client boundary just for a string.
 */

interface SharedProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconTrailing?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, iconTrailing, fullWidth, className, children, disabled, style, ...rest },
  ref
): ReactElement {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={buttonClassName(size, fullWidth, className)}
      style={{ ...buttonStyle(variant, disabled || loading), ...style }}
      {...rest}
    >
      {loading ? <LaujeSpinner size={size === "sm" ? 15 : 18} color="currentColor" spin /> : icon}
      {children}
      {!loading && iconTrailing}
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconTrailing,
  fullWidth,
  className,
  children,
  style,
  ...rest
}: LinkProps): ReactElement {
  return (
    <a
      className={buttonClassName(size, fullWidth, className) + " no-underline"}
      style={{ ...buttonStyle(variant), ...style }}
      {...rest}
    >
      {icon}
      {children}
      {iconTrailing}
    </a>
  );
}
