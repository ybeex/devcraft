"use client";

import { useEffect, useState, useCallback, type ReactElement } from "react";
import { Eye, FileText, Mail, Smartphone, type LucideIcon } from "lucide-react";
import { adminApi } from "@/lib/api";
import { D3AreaChart, D3Donut, D3Sparkline, type DonutSlice } from "@/components/dashboard/D3Charts";
import type { AnalyticsOverview, SubscriberAnalytics, ApiResponse } from "@devcraft/types";

// ── HERO STAT ────────────────────────────────────────────────────────────────
// The headline metric (page views) gets real visual weight — a large number,
// a trend line, room to breathe — instead of sitting in an identically-sized
// tile next to three unrelated numbers. Four equal boxes in a row treats
// "mobile share" as exactly as important as the site's core traffic number,
// which it isn't; component-variance says give it the weight it earns.

interface HeroStatProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPos?: boolean;
  trend?: number[];
}

function HeroStat({ label, value, delta, deltaPos, trend }: HeroStatProps): ReactElement {
  return (
    <div className="dash-panel dash-stat-hero dash-shell p-6 flex flex-col justify-between min-h-45">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "var(--brand)" }}>
            {label}
          </p>
          <p
            className="text-[32px] font-bold leading-none"
            style={{ color: "var(--ink)", fontFamily: "var(--font-dm), system-ui, sans-serif" }}
          >
            {value}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--brand-muted)", border: "1px solid var(--rim)" }}
        >
          <Eye size={20} strokeWidth={1.8} color="var(--brand)" aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 mt-4">
        {delta && (
          <span
            className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: deltaPos ? "var(--pos-bg)" : "var(--neg-bg)",
              color:      deltaPos ? "var(--pos-text)" : "var(--neg-text)",
            }}
          >
            {delta}
          </span>
        )}
        {trend && trend.length > 1 && <D3Sparkline data={trend} width={110} height={34} />}
      </div>
    </div>
  );
}

// ── SUPPORTING STAT ROW ──────────────────────────────────────────────────────
// Three secondary numbers share one panel as rows rather than three separate
// cards — a real hierarchy between "the headline" and "context around it,"
// not three more boxes competing for the same attention as the hero.

interface StatRowProps {
  icon:  LucideIcon;
  label: string;
  value: string | number;
}

function StatRow({ icon, label, value }: StatRowProps): ReactElement {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "var(--raised)", border: "1px solid var(--rim)" }}
      >
        <Icon size={16} strokeWidth={1.8} color="var(--dim)" aria-hidden="true" />
      </div>
      <p className="text-[13px] flex-1 min-w-0" style={{ color: "var(--dim)" }}>{label}</p>
      <p
        className="text-[16px] font-bold truncate max-w-[45%]"
        style={{ color: "var(--ink)", fontFamily: "var(--font-dm), system-ui, sans-serif" }}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

const SKELETON_KEYS: readonly number[] = [0, 1, 2, 3];

export default function DashboardOverview(): ReactElement {
  const [analytics, setAnalytics]     = useState<AnalyticsOverview | null>(null);
  const [subscribers, setSubscribers] = useState<SubscriberAnalytics | null>(null);
  const [loading, setLoading]         = useState<boolean>(true);

  const load = useCallback(async (): Promise<void> => {
    const [a, s]: [ApiResponse<AnalyticsOverview>, ApiResponse<SubscriberAnalytics>] = await Promise.all([
      adminApi.analytics.overview(30) as Promise<ApiResponse<AnalyticsOverview>>,
      adminApi.analytics.subscribers(30) as Promise<ApiResponse<SubscriberAnalytics>>,
    ]);
    if (a.ok) setAnalytics(a.data);
    if (s.ok) setSubscribers(s.data);
    setLoading(false);
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  const deviceData: DonutSlice[] = analytics
    ? [
        { name: "Desktop", value: analytics.deviceSplit.desktop, color: "var(--brand)"  },
        { name: "Mobile",  value: analytics.deviceSplit.mobile,  color: "var(--indigo)" },
        { name: "Tablet",  value: analytics.deviceSplit.tablet,  color: "var(--rim)"    },
      ]
    : [];

  const viewsDeltaPct: string | undefined = analytics
    ? `${(((analytics.totalViews - analytics.viewsLastPeriod) / Math.max(analytics.viewsLastPeriod, 1)) * 100).toFixed(0)}% vs prior`
    : undefined;

  const mobileSharePct: string = analytics
    ? `${Math.round((analytics.deviceSplit.mobile / Math.max(analytics.totalViews, 1)) * 100)}%`
    : "—";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-275 mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
          Dashboard
        </p>
        <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Overview</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--dim)" }}>Last 30 days</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-8">
          <div className="dash-panel animate-pulse h-45" />
          <div className="dash-panel animate-pulse h-45" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mb-8">
          <HeroStat
            label="Page views (30d)"
            value={(analytics?.totalViews ?? 0).toLocaleString()}
            delta={viewsDeltaPct}
            deltaPos={(analytics?.totalViews ?? 0) >= (analytics?.viewsLastPeriod ?? 0)}
            trend={analytics?.viewsByDay?.map((d) => d.count)}
          />
          <div className="dash-panel p-5 divide-y" style={{ borderColor: "var(--rim)" }}>
            <StatRow
              icon={Mail} label="Active subscribers"
              value={(subscribers?.total ?? 0).toLocaleString()}
            />
            <StatRow icon={FileText} label="Top page" value={analytics?.topPages[0]?.path ?? "—"} />
            <StatRow icon={Smartphone} label="Mobile share" value={mobileSharePct} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
        <div className="dash-panel p-5 min-w-0">
          <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>
            Page views — last 30 days
          </p>
          {analytics?.viewsByDay && (
            <D3AreaChart data={analytics.viewsByDay} label="Views" height={180} />
          )}
        </div>

        <div className="dash-panel p-5 min-w-0">
          <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>Device split</p>
          {deviceData.length > 0 && <D3Donut data={deviceData} size={140} />}
        </div>
      </div>

      {subscribers?.growthByDay && (
        <div className="dash-panel p-5 min-w-0">
          <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>
            New subscribers — last 30 days
          </p>
          <D3AreaChart data={subscribers.growthByDay} color="var(--indigo)" label="Subscribers" height={160} />
        </div>
      )}
    </div>
  );
}
