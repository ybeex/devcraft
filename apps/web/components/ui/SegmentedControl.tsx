"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Replaces the "swap the active button's background color" pattern (used
 * previously for the Projects era filter and the Analytics date range) with
 * a pill that physically slides to the active option — the sliding-indicator
 * micro-interaction called for in the elevation pass. Vanilla CSS transform,
 * not Framer Motion: the rest of the app's motion is deliberately vanilla
 * CSS + IntersectionObserver (framer-motion is an installed but unused
 * dependency), and introducing a second animation system here would cost
 * more in consistency than it buys in code size.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = (): void => {
      const activeEl = container.querySelector<HTMLElement>(`[data-value="${value}"]`);
      if (activeEl) {
        setPill({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
      }
    };

    measure();
    // Labels can reflow (font load, container resize) after first paint —
    // re-measure rather than trusting a one-time layout read.
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return (): void => ro.disconnect();
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      role="group"
      className={`segmented-control ${className ?? ""}`}
    >
      {pill && (
        <span
          className="segmented-control-pill"
          style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
          aria-hidden="true"
        />
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-value={opt.value}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="segmented-control-option"
          style={{ color: value === opt.value ? "var(--on-brand)" : "var(--dim)" }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
