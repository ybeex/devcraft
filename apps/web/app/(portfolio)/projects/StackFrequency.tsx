import type { ReactElement } from "react";
import {
  formatProjectCount,
  formatShare,
  type StackFrequencyItem,
} from "@/lib/techStack";

interface StackFrequencyProps {
  data: StackFrequencyItem[];
  totalProjects: number;
}

export function StackFrequency({ data, totalProjects }: StackFrequencyProps): ReactElement {
  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-6 text-center text-[13px]" style={{ borderColor: "var(--rim)", color: "var(--ghost)" }}>
        No technology tags added to published projects yet.
      </p>
    );
  }

  const maxCount: number = Math.max(...data.map((item: StackFrequencyItem) => item.count), 1);

  return (
    <div className="flex w-full flex-col gap-3" aria-label="Technology frequency ranking">
      <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: "var(--ghost)" }}>
        <span aria-hidden="true">#</span>
        <span>Technology · usage</span>
        <span>Share</span>
      </div>

      <ol className="flex list-none flex-col gap-1.5 p-0" aria-label="Most used technologies">
        {data.map((item: StackFrequencyItem, index: number) => {
          const barWidth: number = (item.count / maxCount) * 100;
          const rowLabel: string = `${item.label}: ${formatProjectCount(item.count)} of ${totalProjects} projects, ${formatShare(item.share)}`;

          return (
            <li
              key={item.label}
              className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors duration-200 hover:border-(--rim-sub) hover:bg-(--raised)"
            >
              <span className="font-mono text-[11px]" style={{ color: "var(--ghost)" }} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div className="mb-1.5 flex min-w-0 items-baseline justify-between gap-3">
                  <span className="truncate font-mono text-[13px] font-semibold" style={{ color: "var(--ink)" }} title={item.label}>
                    {item.label}
                  </span>
                  <span className="shrink-0 text-[11px]" style={{ color: "var(--dim)" }}>
                    {formatProjectCount(item.count)}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ background: "var(--raised)" }}
                  role="progressbar"
                  aria-label={rowLabel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.share}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      background: index === 0 ? "var(--indigo)" : "var(--brand)",
                      opacity: index === 0 ? 1 : Math.max(0.55, 0.82 - index * 0.04),
                    }}
                  />
                </div>
              </div>

              <span className="w-10 text-right font-mono text-[12px] font-semibold tabular-nums" style={{ color: index === 0 ? "var(--indigo)" : "var(--dim)" }}>
                {formatShare(item.share)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
