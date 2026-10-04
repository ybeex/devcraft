"use client";

import type { CSSProperties, ReactElement, ReactNode } from "react";

interface IconFillProps {
  /** How large the icon grows on hover — 1.4 means 40% bigger. Tune this
   *  per call site to roughly match container-size ÷ icon-size, so the
   *  icon visually fills the box it sits in rather than just nudging. */
  scale?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps an icon so it grows to fill more of its surrounding container on
 * hover — either hovering the icon directly, or hovering an ancestor
 * marked with the `fill-trigger` class (a card, row, badge, or button the
 * icon lives inside). The actual transform lives in the "ICON GROW-TO-FILL"
 * block in globals.css; this component just sets the --fill-scale custom
 * property and the .icon-fill hook class.
 */
export function IconFill({ scale = 1.4, className, children }: IconFillProps): ReactElement {
  return (
    <span
      className={`icon-fill ${className ?? ""}`}
      style={{ "--fill-scale": scale } as CSSProperties}
    >
      {children}
    </span>
  );
}
