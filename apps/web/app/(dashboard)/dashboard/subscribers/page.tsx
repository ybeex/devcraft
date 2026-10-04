"use client";

import { useEffect, useState, useCallback, type ReactElement } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { adminApi } from "@/lib/api";
import { EmptyState, LoadingRow } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Subscriber, EmailNotificationLog, ApiResponse } from "@devcraft/types";

type Filter = "active" | "unsubscribed" | "all";
type Tab    = "subscribers" | "history";

interface SubscriberCounts {
  active:       number;
  unsubscribed: number;
  total:        number;
}

const FILTER_OPTIONS: readonly Filter[] = ["active", "unsubscribed", "all"];

export default function SubscribersPage(): ReactElement {
  const [tab, setTab]                   = useState<Tab>("subscribers");
  const [subscribers, setSubscribers]   = useState<Subscriber[]>([]);
  const [counts, setCounts]             = useState<SubscriberCounts>({ active: 0, unsubscribed: 0, total: 0 });
  const [filter, setFilter]             = useState<Filter>("active");
  const [loading, setLoading]           = useState<boolean>(true);
  const [removing, setRemoving]         = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Subscriber | null>(null);
  const [notifications, setNotifications] = useState<EmailNotificationLog[]>([]);
  const [notifLoading, setNotifLoading] = useState<boolean>(false);

  const load = useCallback(async (f: Filter): Promise<void> => {
    setLoading(true);
    const res = await adminApi.subscribers.list({ status: f });
    if (res.ok) {
      setSubscribers(res.data.subscribers);
      setCounts(res.data.counts);
    }
    setLoading(false);
  }, []);

  const loadHistory = useCallback(async (): Promise<void> => {
    setNotifLoading(true);
    const res: ApiResponse<EmailNotificationLog[]> = await adminApi.notify.history();
    if (res.ok) setNotifications(res.data);
    setNotifLoading(false);
  }, []);

  useEffect((): void => { void load(filter); }, [filter, load]);
  useEffect((): void => { if (tab === "history") void loadHistory(); }, [tab, loadHistory]);

  const handleRemove = async (id: string): Promise<void> => {
    setRemoving(id);
    await adminApi.subscribers.remove(id);
    setSubscribers((prev: Subscriber[]): Subscriber[] => prev.filter((x: Subscriber): boolean => x.id !== id));
    setRemoving(null);
    setRemoveTarget(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-250 mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
            Dashboard
          </p>
          <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Subscribers</h1>
        </div>
        {tab === "subscribers" && (
          <a
            href={adminApi.subscribers.export()}
            download
            className="px-4 py-2 rounded-xl border text-[13px] font-semibold transition-all hover:border-(--brand)"
            style={{ borderColor: "var(--rim)", color: "var(--dim)", background: "var(--raised)" }}
          >
            Export CSV ↓
          </a>
        )}
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl border w-fit max-w-full overflow-x-auto" style={{ background: "var(--raised)", borderColor: "var(--rim)" }}>
        {([
          { id: "subscribers", label: `Subscribers (${counts.active})` },
          { id: "history",     label: "Email History" },
        ] as { id: Tab; label: string }[]).map((t: { id: Tab; label: string }): ReactElement => (
          <button
            key={t.id}
            type="button"
            onClick={(): void => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap"
            style={{
              background: tab === t.id ? "var(--brand)" : "transparent",
              color:      tab === t.id ? "var(--on-brand)" : "var(--dim)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SUBSCRIBERS TAB ─────────────────────────────────────────── */}
      {tab === "subscribers" && (
        <>
          <div className="flex gap-1.5 mb-5 flex-wrap">
            {FILTER_OPTIONS.map((f: Filter): ReactElement => (
              <button
                key={f}
                type="button"
                onClick={(): void => setFilter(f)}
                className="px-4 py-2 rounded-full text-[12px] font-semibold border transition-all"
                style={{
                  background:  filter === f ? "var(--brand-muted)" : "var(--raised)",
                  borderColor: filter === f ? "var(--brand)"        : "var(--rim)",
                  color:       filter === f ? "var(--brand)"        : "var(--dim)",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                <span className="opacity-60">
                  ({f === "active" ? counts.active : f === "unsubscribed" ? counts.unsubscribed : counts.total})
                </span>
              </button>
            ))}
          </div>

          <div className="dash-panel overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-140 border-collapse text-[13px]">
              <thead>
                <tr style={{ background: "var(--raised)", borderBottom: "1px solid var(--rim)" }}>
                  {["Email", "Name", "Subscribed", "Status", ""].map((h: string): ReactElement => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold"
                      style={{ color: "var(--dim)", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}><LoadingRow label="Loading subscribers…" /></td></tr>
                ) : subscribers.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState icon={<Inbox size={32} strokeWidth={1.5} />} title="No subscribers found" /></td></tr>
                ) : subscribers.map((s: Subscriber): ReactElement => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--rim-sub)" }} className="transition-colors hover:bg-(--raised)">
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "var(--ink)" }}>{s.email}</td>
                    <td className="px-4 py-3" style={{ color: "var(--dim)" }}>{s.name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: "var(--ghost)" }}>
                      {new Date(s.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {s.unsubscribedAt ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}>
                          Unsubscribed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: "var(--pos-text)" }}>
                          <span className="pulse-dot" style={{ width: 6, height: 6 }} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(): void => setRemoveTarget(s)}
                        disabled={removing === s.id}
                        className="text-[11px] transition-opacity hover:opacity-70"
                        style={{ color: "var(--ghost)" }}
                      >
                        {removing === s.id ? "…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* ── EMAIL HISTORY TAB ───────────────────────────────────────── */}
      {tab === "history" && (
        <>
          {notifLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rim)", borderTopColor: "var(--brand)" }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="dash-panel py-16 text-center" style={{ background: "var(--raised)" }}>
              <Inbox size={36} strokeWidth={1.6} aria-hidden="true" className="block mx-auto mb-3" style={{ color: "var(--ghost)" }} />
              <p className="text-[13px] max-w-90 mx-auto" style={{ color: "var(--ghost)" }}>
                No email notifications have been accepted by SMTP yet. Publish a blog post or project and click "Notify" to
                submit a message to active subscribers.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {[
                  { label: "Campaigns accepted", val: notifications.length },
                  { label: "Blog campaigns",  val: notifications.filter((n: EmailNotificationLog): boolean => n.type === "BLOG").length },
                  { label: "Project alerts",  val: notifications.filter((n: EmailNotificationLog): boolean => n.type === "PROJECT").length },
                  { label: "Total SMTP accepted", val: notifications.reduce((acc: number, n: EmailNotificationLog): number => acc + n.recipientCount, 0) },
                ].map(({ label, val }: { label: string; val: number }): ReactElement => (
                  <div key={label} className="dash-panel px-4 py-3 min-w-0">
                    <p className="text-[24px] font-bold truncate" style={{ color: "var(--brand)", fontFamily: "var(--font-dm), system-ui, sans-serif" }}>
                      {val.toLocaleString()}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "var(--ghost)" }}>{label}</p>
                  </div>
                ))}
              </div>

              <div className="dash-panel overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-160 border-collapse text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--raised)", borderBottom: "1px solid var(--rim)" }}>
                      {["Type", "Subject", "Recipients", "Reference", "Sent at"].map((h: string): ReactElement => (
                        <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: "var(--dim)", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((n: EmailNotificationLog): ReactElement => (
                      <tr key={n.id} style={{ borderBottom: "1px solid var(--rim-sub)" }} className="hover:bg-(--raised) transition-colors">
                        <td className="px-4 py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: n.type === "BLOG" ? "var(--brand-muted)" : "var(--indigo-bg,rgba(26,63,111,.07))",
                              color:      n.type === "BLOG" ? "var(--brand)"        : "var(--indigo)",
                              border:     `1px solid ${n.type === "BLOG" ? "var(--rim)" : "rgba(26,63,111,.25)"}`,
                            }}
                          >
                            {n.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-55">
                          <p className="truncate font-medium" style={{ color: "var(--ink)" }}>{n.subject}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[12px]" style={{ color: "var(--dim)" }}>{n.recipientCount.toLocaleString()}</span>
                          <span className="text-[10px] ml-1" style={{ color: "var(--ghost)" }}>accepted by SMTP</span>
                        </td>
                        <td className="px-4 py-3 text-[12px]">
                          {n.blogPost ? (
                            <Link
                              href={`/blog/${n.blogPost.slug}`}
                              target="_blank"
                              className="underline underline-offset-2 hover:opacity-70 transition-opacity truncate block max-w-35"
                              style={{ color: "var(--brand)" }}
                            >
                              {n.blogPost.title}
                            </Link>
                          ) : n.projectId ? (
                            <span className="font-mono text-[11px]" style={{ color: "var(--ghost)" }}>{n.projectId.slice(0, 12)}…</span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-mono" style={{ color: "var(--dim)" }}>
                            {new Date(n.sentAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-[11px] font-mono" style={{ color: "var(--ghost)" }}>
                            {new Date(n.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove subscriber data?"
        description={`This permanently erases ${removeTarget?.email ?? "this subscriber"} and cannot be undone.`}
        confirmLabel="Remove data"
        loading={removing === removeTarget?.id}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => { if (removeTarget) void handleRemove(removeTarget.id); }}
      />
    </div>
  );
}
