"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — Hausa-aesthetic Rub el Hizb (8-pointed star)
 *
 * Inner element: an 8-pointed star (two overlapping squares rotated 45°),
 * the classic Rub el Hizb motif found in Hausa Islamic calligraphy,
 * mosque decoration, and illuminated manuscripts.
 *
 * Three fully custom states — no native browser cursor ever shows:
 *   - normal:  default idle spin, base scale, brass color
 *   - text:    smaller and slower, indigo — reading/typing contexts
 *   - button:  larger, brass-hover color, spins faster with a small
 *              bounce layered in — clickable elements
 *
 * Outer element: a larger, faint 8-pointed star frame that trails behind
 * with a lerp, creating layered geometric depth. Currently hidden via
 * `display: none` in CSS but left wired up in case that's reversed later.
 */
export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos     = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId   = useRef<number>(0);

  useEffect(() => {
    /* ---- touch device bail-out ---- */
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.14;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.14;

      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top  = `${pos.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top  = `${ringPos.current.y}px`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;

      // Button-like: clickable, action-triggering elements
      const isButton = !!target.closest(
        "button, a, [role='button'], [data-cursor='pointer'], select"
      );

      // Text-like: reading or typing contexts — checked only if not
      // already a button, so a <button> containing a <span> of label
      // text still reads as a button, not text
      const isText =
        !isButton &&
        !!target.closest(
          "p, h1, h2, h3, h4, h5, h6, span, li, label, input, textarea"
        );

      dotRef.current?.classList.toggle("is-button", isButton);
      dotRef.current?.classList.toggle("is-text", isText);
      // Ring kept on its original class name — it's independently hidden
      // via `display: none` in CSS, but this preserves its exact prior
      // behavior if that's ever re-enabled.
      ringRef.current?.classList.toggle("is-hovering", isButton);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  /*
   * Rub el Hizb = two overlapping squares rotated 45° relative to each other.
   * Inner star: solid brass fill, compact.
   * Outer star: outlined, larger, trailing.
   */
  return (
    <>
      {/* ── Inner: solid 8-pointed star ── */}
      <div ref={dotRef} className="cursor-dot" aria-hidden="true">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-star-inner"
        >
          {/* Square 1 (axis-aligned) */}
          <rect
            x="22" y="22" width="56" height="56"
            fill="currentColor"
          />
          {/* Square 2 (rotated 45°) */}
          <rect
            x="22" y="22" width="56" height="56"
            fill="currentColor"
            transform="rotate(45 50 50)"
          />
          {/* Centre accent — small negative-space diamond */}
          <rect
            x="40" y="40" width="20" height="20"
            transform="rotate(45 50 50)"
            fill="var(--canvas)"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* ── Outer: outlined 8-pointed star frame ── */}
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-star-outer"
        >
          {/* Square 1 outline */}
          <rect
            x="18" y="18" width="64" height="64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="cursor-outer-sq"
          />
          {/* Square 2 outline (rotated 45°) */}
          <rect
            x="18" y="18" width="64" height="64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            transform="rotate(45 50 50)"
            className="cursor-outer-sq"
          />
        </svg>
      </div>
    </>
  );
}