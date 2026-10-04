"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Wraps a button/link and pulls it gently toward the cursor while hovered —
 * the actual behavior `.mag-btn` was named for. Snaps back with a springy
 * overshoot on release. Respects prefers-reduced-motion via the CSS
 * transition swap below (no JS motion is disabled, but the settle is instant
 * rather than animated when reduced motion is requested — see globals.css).
 */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    setPos({ x: relX * strength, y: relY * strength });
  }

  function handleLeave() {
    setPos({ x: 0, y: 0 });
    setActive(false);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={handleLeave}
      className={`magnetic-wrap ${className ?? ""}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: active
          ? "transform 0.35s ease-out"
          : "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
