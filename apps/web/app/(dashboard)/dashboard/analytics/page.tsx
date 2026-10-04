"use client";

import { useEffect, useState, useCallback, type ReactElement } from "react";
import { Eye, Link2, Mail, Smartphone, type LucideIcon } from "lucide-react";
import { adminApi } from "@/lib/api";
import {
  D3AreaChart, D3Donut, D3HBarChart, D3Sparkline,
  type DonutSlice,
} from "@/components/dashboard/D3Charts";
import { AiInsights } from "@/components/dashboard/AiInsights";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { AnalyticsOverview, SubscriberAnalytics, ApiResponse } from "@devcraft/types";

// ── STAT CARD ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:       LucideIcon;
  label:      string;
  value:      string | number;
  sparkData?: number[];
  delta?:     string;
  deltaPos?:  boolean;
}

function StatCard({ icon, label, value, sparkData, delta, deltaPos }: StatCardProps): ReactElement {
  const Icon = icon;
  return (
    <div className="dash-panel p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--brand-muted)", border: "1px solid var(--rim)" }}
        >
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        </div>
        {sparkData && <D3Sparkline data={sparkData} />}
      </div>
      <p
        className="text-[28px] font-bold leading-none mb-1 truncate"
        style={{ color: "var(--ink)", fontFamily: "var(--font-dm), system-ui, sans-serif" }}
        title={typeof value === "string" ? value : undefined}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[12px] mb-2" style={{ color: "var(--dim)" }}>{label}</p>
      {delta && (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: deltaPos ? "var(--pos-bg)" : "var(--neg-bg)",
            color:      deltaPos ? "var(--pos-text)" : "var(--neg-text)",
          }}
        >
          {delta}
        </span>
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: readonly number[] = [7, 14, 30, 90];

export default function AnalyticsPage(): ReactElement {
  const [analytics, setAnalytics]     = useState<AnalyticsOverview | null>(null);
  const [subscribers, setSubscribers] = useState<SubscriberAnalytics | null>(null);
  const [loading, setLoading]         = useState<boolean>(true);
  const [days, setDays]               = useState<number>(30);

  const load = useCallback(async (d: number): Promise<void> => {
    setLoading(true);
    const [a, s] = await Promise.all([
      adminApi.analytics.overview(d) as Promise<ApiResponse<AnalyticsOverview>>,
      adminApi.analytics.subscribers(d) as Promise<ApiResponse<SubscriberAnalytics>>,
    ]);
    if (a.ok) setAnalytics(a.data);
    if (s.ok) setSubscribers(s.data);
    setLoading(false);
  }, []);

  useEffect((): void => {
    void load(days);
  }, [days, load]);

  const deviceData: DonutSlice[] = analytics
    ? [
        { name: "Desktop", value: analytics.deviceSplit.desktop, color: "var(--brand)"  },
        { name: "Mobile",  value: analytics.deviceSplit.mobile,  color: "var(--indigo)" },
        { name: "Tablet",  value: analytics.deviceSplit.tablet,  color: "var(--rim)"    },
      ]
    : [];

  const sparkViews: number[] = analytics?.viewsByDay
    .slice(-14)
    .map((d): number => d.count) ?? [];

  const sparkSubs: number[] = subscribers?.growthByDay
    .slice(-14)
    .map((d): number => d.count) ?? [];

  const viewsDelta: string | undefined =
    analytics
      ? `${(((analytics.totalViews - analytics.viewsLastPeriod) / Math.max(analytics.viewsLastPeriod, 1)) * 100).toFixed(0)}% vs prior`
      : undefined;

  const mobileShare: string =
    analytics
      ? `${Math.round((analytics.deviceSplit.mobile / Math.max(analytics.totalViews, 1)) * 100)}%`
      : "—";

  const topReferrerLabel: string =
    analytics?.topReferrers[0]?.referrer.replace(/^https?:\/\//, "") ?? "direct";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-300 mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
            Dashboard
          </p>
          <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Analytics</h1>
        </div>
        <SegmentedControl
          options={PERIOD_OPTIONS.map((d) => ({ value: String(d), label: `${d}d` }))}
          value={String(days)}
          onChange={(v): void => setDays(Number(v))}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {([0, 1, 2, 3] as const).map((key: number): ReactElement => (
            <div
              key={key}
              className="dash-panel h-36 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Eye} label={`Page Views (${days}d)`}
              value={analytics?.totalViews ?? 0} sparkData={sparkViews}
              delta={viewsDelta}
              deltaPos={(analytics?.totalViews ?? 0) >= (analytics?.viewsLastPeriod ?? 0)}
            />
            <StatCard
              icon={Mail} label="Active Subscribers"
              value={subscribers?.total ?? 0} sparkData={sparkSubs}
              delta={subscribers?.newThisPeriod ? `+${subscribers.newThisPeriod} new` : undefined}
              deltaPos
            />
            <StatCard icon={Smartphone} label="Mobile Share" value={mobileShare} />
            <StatCard icon={Link2} label="Top Referrer" value={topReferrerLabel} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
            <div className="dash-panel p-5 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>
                  Page Views — last {days} days
                </p>
                <span
                  className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: "var(--ghost)", borderColor: "var(--rim)", background: "var(--raised)" }}
                >
                  D3.js
                </span>
              </div>
              {analytics?.viewsByDay && (
                <D3AreaChart data={analytics.viewsByDay} label="Views" height={200} />
              )}
            </div>

            <div className="dash-panel p-5 min-w-0">
              <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>Device Split</p>
              <D3Donut data={deviceData} size={150} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="dash-panel p-5 min-w-0">
              <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>
                New Subscribers — {days}d
              </p>
              {subscribers?.growthByDay && (
                <D3AreaChart data={subscribers.growthByDay} color="var(--indigo)" label="Subscribers" height={180} />
              )}
            </div>

            <div className="dash-panel p-5 min-w-0">
              <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>Top Pages</p>
              {analytics?.topPages && (
                <D3HBarChart data={analytics.topPages} height={200} maxItems={6} />
              )}
            </div>
          </div>

          <div className="dash-panel p-5 mb-8 min-w-0">
            <p className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>Top Referrers</p>
            {analytics?.topReferrers && (
              <D3HBarChart data={analytics.topReferrers} color="var(--indigo)" height={180} maxItems={6} />
            )}
          </div>

          <div className="dash-panel p-6">
            <AiInsights analytics={analytics} subscribers={subscribers} />
          </div>
        </>
      )}
    </div>
  );
}
