"use client";

import { useState, useCallback, type ReactElement } from "react";
import { Brain, Lightbulb, RefreshCw, Sparkles, TrendingUp, TriangleAlert, type LucideIcon } from "lucide-react";
import { callAI, type ModelId, type CallResult } from "@/lib/models";
import { ModelDropdown } from "./ModelSelector";
import { Button } from "@/components/ui/Button";
import type { AnalyticsOverview, SubscriberAnalytics } from "@devcraft/types";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type InsightPriority = "high" | "medium" | "low";
type InsightType      = "growth" | "warning" | "opportunity";

interface Insight {
  title:       string;
  observation: string;
  action:      string;
  priority:    InsightPriority;
  type:        InsightType;
}

interface AiInsightsProps {
  analytics:   AnalyticsOverview | null;
  subscribers: SubscriberAnalytics | null;
}

interface TypeConfigEntry {
  icon:  LucideIcon;
  color: string;
  bg:    string;
  label: string;
}

interface PriorityConfigEntry {
  label: string;
  color: string;
  bg:    string;
}

const TYPE_CONFIG: Record<InsightType, TypeConfigEntry> = {
  growth:      { icon: TrendingUp,    color: "var(--pos-text)", bg: "var(--pos-bg)",     label: "Growth"      },
  warning:     { icon: TriangleAlert, color: "#f59e0b",       bg: "rgba(245,158,11,.1)", label: "Watch"       },
  opportunity: { icon: Lightbulb,     color: "var(--indigo)", bg: "var(--indigo-bg)",   label: "Opportunity" },
};

const PRIORITY_CONFIG: Record<InsightPriority, PriorityConfigEntry> = {
  high:   { label: "High",   color: "var(--neg-text)", bg: "var(--neg-bg)"      },
  medium: { label: "Medium", color: "var(--brand)", bg: "var(--brand-muted)" },
  low:    { label: "Low",    color: "var(--ghost)", bg: "var(--raised)"      },
};

const SKELETON_COUNT = 5;
const SKELETON_KEYS: readonly number[] = Array.from({ length: SKELETON_COUNT }, (_v, i: number): number => i);

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function AiInsights({ analytics, subscribers }: AiInsightsProps): ReactElement {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading]   = useState<boolean>(false);
  const [error, setError]       = useState<string>("");
  const [model, setModel]       = useState<ModelId>("openai/gpt-4o");
  const [ran, setRan]           = useState<boolean>(false);

  const runInsights = useCallback(async (): Promise<void> => {
    if (loading || !analytics) return;
    setLoading(true);
    setError("");

    const res: CallResult<Insight[]> = await callAI<Insight[]>("/ai/insights", {
      analytics,
      subscribers,
      model,
    });

    if (res.ok && Array.isArray(res.data)) {
      setInsights(res.data);
      setRan(true);
    } else {
      setError(res.error ?? "Insights failed. Check API key.");
    }
    setLoading(false);
  }, [analytics, subscribers, model, loading]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-[16px]" style={{ color: "var(--ink)" }}>
            AI Analytics Insights
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--ghost)" }}>
            {ran ? "5 insights generated from your 30-day data" : "Let AI analyse your data and suggest next actions."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ModelDropdown value={model} onChange={setModel} />
          <Button
            onClick={(): void => { void runInsights(); }}
            disabled={!analytics}
            loading={loading}
            size="sm"
            className="shrink-0"
            icon={!loading && (ran ? <RefreshCw size={15} aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />)}
          >
            {loading ? "Analysing…" : ran ? "Refresh" : "Run Analysis"}
          </Button>
        </div>
      </div>

      {error && (
        <p
          className="text-[12px] px-4 py-3 rounded-xl"
          style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
        >
          {error}
        </p>
      )}

      {loading && (
        <div className="grid gap-3">
          {SKELETON_KEYS.map((key: number): ReactElement => (
            <div
              key={key}
              className="h-24 rounded-2xl animate-pulse border"
              style={{ background: "var(--raised)", borderColor: "var(--rim)" }}
            />
          ))}
        </div>
      )}

      {!loading && insights.length > 0 && (
        <div className="grid gap-3">
          {insights.map((ins: Insight, i: number): ReactElement => {
            const tc: TypeConfigEntry     = TYPE_CONFIG[ins.type] ?? TYPE_CONFIG.opportunity;
            const pc: PriorityConfigEntry = PRIORITY_CONFIG[ins.priority] ?? PRIORITY_CONFIG.medium;
            const Icon = tc.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border p-4 flex gap-4"
                style={{ background: "var(--card)", borderColor: "var(--rim)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: tc.bg }}
                >
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" style={{ color: tc.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>
                      {ins.title}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: pc.bg, color: pc.color }}
                    >
                      {pc.label} priority
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {tc.label}
                    </span>
                  </div>

                  <p className="text-[13px] leading-[1.6] mb-2" style={{ color: "var(--dim)" }}>
                    {ins.observation}
                  </p>

                  <div
                    className="flex items-start gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "var(--raised)", borderLeft: `2px solid ${tc.color}` }}
                  >
                    <span className="text-[11px] font-bold shrink-0 mt-0.5" style={{ color: tc.color }}>→</span>
                    <p className="text-[12.5px] leading-[1.55]" style={{ color: "var(--ink)" }}>
                      {ins.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && insights.length === 0 && !error && (
        <div
          className="flex flex-col items-center gap-3 py-10 rounded-2xl border"
          style={{ background: "var(--raised)", borderColor: "var(--rim)" }}
        >
          <Brain size={36} strokeWidth={1.6} aria-hidden="true" style={{ color: "var(--ghost)" }} />
          <p className="text-[13px] text-center max-w-70" style={{ color: "var(--ghost)" }}>
            Click "Run Analysis" to get 5 actionable insights from your analytics data.
          </p>
        </div>
      )}
    </div>
  );
}
