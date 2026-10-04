import type { ReactElement, ReactNode } from "react";
import { LaujeSpinner, ZaureArch } from "@/components/hausa";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/**
 * Every dashboard list/table renders this instead of a silently blank
 * `<tbody>` when there's nothing to show — previously true for Blog,
 * Reviews, and Subscribers, but not Projects or a filtered-to-zero result
 * anywhere else. One component now, so the next list gets it for free.
 *
 * The faint ZaureArch behind the icon is the same brand-illustration move
 * already used in ContactForm's success state, reused here rather than a
 * new one-off graphic invented for this component — one motif, one meaning
 * ("nothing here yet"), not a generic stock-illustration substitute.
 */
export function EmptyState({ icon, title, hint, action }: EmptyStateProps): ReactElement {
  return (
    <div className="dash-empty" style={{ position: "relative" }}>
      <div
        aria-hidden="true"
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)", opacity: 0.06, pointerEvents: "none" }}
      >
        <ZaureArch size={160} />
      </div>
      <div style={{ opacity: 0.55, position: "relative" }}>{icon}</div>
      <p className="font-semibold text-[14px] relative" style={{ color: "var(--dim)" }}>{title}</p>
      {hint && <p className="text-[12px] max-w-[320px] relative" style={{ color: "var(--ghost)" }}>{hint}</p>}
      <div className="relative">{action}</div>
    </div>
  );
}

/** Short, shapeless waits (a button mid-submit) still use a spinner — the
 * skill's own guidance is spinners are fine there, skeletons are for
 * predictable-shape content regions. */
export function LoadingRow({ label = "Loading…" }: { label?: string }): ReactElement {
  return (
    <div className="flex items-center justify-center gap-2.5 p-10 text-[13px]" style={{ color: "var(--ghost)" }}>
      <LaujeSpinner size={16} color="var(--ghost)" spin />
      {label}
    </div>
  );
}

/**
 * Skeleton rows matching the real table's shape (icon/avatar + two text
 * lines), so a list loading in doesn't cause layout shift the way swapping
 * a spinner for real rows would. Shimmer animates `transform`, not
 * `background-position`, per the performance rule — translateX on a
 * pseudo-element overlay is compositor-only.
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }): ReactElement {
  return (
    <div role="status" aria-label="Loading" className="divide-y" style={{ borderColor: "var(--rim)" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="skeleton-block shrink-0" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="skeleton-block" style={{ width: `${58 + (i % 3) * 9}%`, height: 12 }} />
            <div className="skeleton-block" style={{ width: `${28 + (i % 4) * 7}%`, height: 9 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
