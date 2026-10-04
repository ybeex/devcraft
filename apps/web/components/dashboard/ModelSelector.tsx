"use client";

import type { ChangeEvent, ReactElement } from "react";
import { Brain, Gauge, Zap, type LucideIcon } from "lucide-react";
import { MODELS, SPEED_LABELS, type ModelId, type ModelConfig } from "@/lib/models";

interface ModelSelectorProps {
  value:      ModelId;
  onChange:   (m: ModelId) => void;
  label?:     string;
  className?: string;
}

/** Typed entries of MODELS — avoids re-deriving the cast at every call site */
const MODEL_ENTRIES: [ModelId, ModelConfig][] = Object.entries(MODELS) as [ModelId, ModelConfig][];

const SPEED_ICONS: Record<ModelConfig["speed"], LucideIcon> = {
  fast:   Zap,
  medium: Gauge,
  slow:   Brain,
};

export function ModelSelector({
  value,
  onChange,
  label = "Model",
  className,
}: ModelSelectorProps): ReactElement {
  return (
    <div className={className}>
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-2" style={{ color: "var(--dim)" }}>
          {label}
        </p>
      )}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {MODEL_ENTRIES.map(([id, cfg]: [ModelId, ModelConfig]): ReactElement => {
          const active: boolean = value === id;
          const SpeedIcon: LucideIcon = SPEED_ICONS[cfg.speed];
          return (
            <button
              key={id}
              type="button"
              onClick={(): void => onChange(id)}
              className="flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all duration-200"
              style={{
                background:  active ? "var(--brand-muted)" : "var(--raised)",
                borderColor: active ? "var(--brand)"        : "var(--rim)",
                boxShadow:   active ? "0 0 0 1px var(--brand)" : "none",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: `${cfg.color}22`, color: cfg.color }}
                >
                  {cfg.badge}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--ghost)" }}>
                  <SpeedIcon size={12} strokeWidth={1.8} aria-hidden="true" />
                  {SPEED_LABELS[cfg.speed]}
                </span>
              </div>
              <p className="text-[12px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>
                {cfg.label}
              </p>
              <p className="text-[11px] leading-normal" style={{ color: "var(--ghost)" }}>
                {cfg.description}
              </p>
              {cfg.maxTokens !== undefined && (
                <p className="text-[10px] font-mono" style={{ color: "var(--ghost)" }}>
                  max {cfg.maxTokens.toLocaleString()} tokens
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── COMPACT DROPDOWN VERSION ──────────────────────────────────────────────────

type ModelDropdownProps = Omit<ModelSelectorProps, "label">;

export function ModelDropdown({ value, onChange, className }: ModelDropdownProps): ReactElement {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    onChange(e.target.value as ModelId);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`px-3 py-2 rounded-xl border text-[12px] font-medium outline-none
        transition-all focus:border-(--brand) ${className ?? ""}`}
      style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
    >
      {MODEL_ENTRIES.map(([id, cfg]: [ModelId, ModelConfig]): ReactElement => (
        <option key={id} value={id}>
          {cfg.label} ({SPEED_LABELS[cfg.speed]})
        </option>
      ))}
    </select>
  );
}
