"use client";

import { useEffect, useState, useCallback, type ReactElement } from "react";
import { Inbox, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingRow } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ContactMessage } from "@devcraft/types";

type Filter = "all" | "unread" | "read";

export default function ContactsPage(): ReactElement {
  const [messages, setMessages]   = useState<ContactMessage[]>([]);
  const [filter, setFilter]       = useState<Filter>("all");
  const [loading, setLoading]     = useState<boolean>(true);
  const [unreadCount, setUnread]  = useState<number>(0);
  const [selected, setSelected]   = useState<ContactMessage | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const load = useCallback(async (f: Filter): Promise<void> => {
    setLoading(true);
    const readParam: "true" | "false" | undefined =
      f === "read" ? "true" : f === "unread" ? "false" : undefined;

    const res = (await adminApi.contacts.list({ read: readParam })) as {
      ok: boolean;
      data?: { messages: ContactMessage[]; unreadCount: number };
    };

    if (res.ok && res.data) {
      setMessages(res.data.messages);
      setUnread(res.data.unreadCount);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const openMessage = async (msg: ContactMessage): Promise<void> => {
    setSelected(msg);
    if (!msg.read) {
      await adminApi.contacts.markRead(msg.id, true);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      );
      setUnread((c) => Math.max(0, c - 1));
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    setDeleting(id);
    await adminApi.contacts.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
    setDeleteTarget(null);
  };

  const toggleRead = async (msg: ContactMessage): Promise<void> => {
    const nextRead = !msg.read;
    await adminApi.contacts.markRead(msg.id, nextRead);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m))
    );
    if (selected?.id === msg.id) {
      setSelected({ ...selected, read: nextRead });
    }
    setUnread((c) => (nextRead ? Math.max(0, c - 1) : c + 1));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-275 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[2px] mb-1"
            style={{ color: "var(--brand)" }}
          >
            Dashboard
          </p>
          <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>
            Inbox
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void load(filter)}
            icon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <span
              className="text-[12px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: "var(--brand)", color: "var(--on-brand)" }}
            >
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {(["all", "unread", "read"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setSelected(null);
            }}
            className="px-4 py-2 rounded-full text-[12px] font-semibold border transition-all capitalize"
            style={{
              background:  filter === f ? "var(--brand-muted)" : "var(--raised)",
              borderColor: filter === f ? "var(--brand)"        : "var(--rim)",
              color:       filter === f ? "var(--brand)"        : "var(--dim)",
            }}
          >
            {f === "unread" ? `Unread (${unreadCount})` : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
        {/* Message list */}
        <div
          className={`dash-panel overflow-hidden ${
            selected ? "hidden lg:block" : "block"
          }`}
        >
          {loading ? (
            <LoadingRow label="Loading messages…" />
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<Inbox size={32} strokeWidth={1.5} />}
              title={`No ${filter !== "all" ? filter + " " : ""}messages found`}
            />
          ) : (
            <div className="max-h-150 overflow-y-auto divide-y divide-(--rim-sub)">
              {messages.map((msg: ContactMessage) => {
                const isActive = selected?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => void openMessage(msg)}
                    className="w-full text-left px-4 py-3.5 transition-colors block"
                    style={{
                      background: isActive ? "var(--brand-muted)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.read && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: "var(--brand)" }}
                        />
                      )}
                      <p
                        className="text-[13px] truncate flex-1"
                        style={{
                          color:      "var(--ink)",
                          fontWeight: msg.read ? 500 : 700,
                        }}
                      >
                        {msg.name}
                      </p>
                      <span className="text-[10px] shrink-0" style={{ color: "var(--ghost)" }}>
                        {new Date(msg.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p
                      className="text-[12px] truncate"
                      style={{ color: "var(--dim)", fontWeight: msg.read ? 400 : 600 }}
                    >
                      {msg.subject}
                    </p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--ghost)" }}>
                      {msg.message}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div
          className={`dash-panel p-4 sm:p-6 ${
            !selected ? "hidden lg:block" : "block"
          }`}
        >
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="lg:hidden flex items-center gap-2 text-[12px] font-semibold mb-4 hover:opacity-70"
              style={{ color: "var(--brand)" }}
            >
              <ArrowLeft size={16} />
              Back to inbox list
            </button>
          )}

          {!selected ? (
            <EmptyState
              icon={<Mail size={32} strokeWidth={1.5} />}
              title="Select a message from the list to read it"
            />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div>
                  <p className="font-display font-bold text-[20px] mb-1" style={{ color: "var(--ink)" }}>
                    {selected.subject}
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--dim)" }}>
                    From <strong>{selected.name}</strong> ·{" "}
                    <a
                      href={`mailto:${selected.email}`}
                      className="hover:opacity-70"
                      style={{ color: "var(--brand)" }}
                    >
                      {selected.email}
                    </a>
                  </p>
                  <p className="text-[11px] font-mono mt-1" style={{ color: "var(--ghost)" }}>
                    {new Date(selected.createdAt).toLocaleString("en-NG")}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => void toggleRead(selected)}>
                    {selected.read ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleteTarget(selected)}
                    loading={deleting === selected.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div
                className="rounded-xl p-4 sm:p-5 text-[14px] leading-[1.8] whitespace-pre-wrap wrap-break-word"
                style={{ background: "var(--raised)", color: "var(--ink)" }}
              >
                {selected.message}
              </div>

              <ButtonLink
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="self-start"
              >
                Reply via email →
              </ButtonLink>

              {(selected.ipAddress || selected.userAgent) && (
                <div className="text-[10px] font-mono pt-3 border-t" style={{ color: "var(--ghost)", borderColor: "var(--rim-sub)" }}>
                  {selected.ipAddress && <p>IP: {selected.ipAddress}</p>}
                  {selected.userAgent && <p className="truncate">UA: {selected.userAgent}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this message?"
        description="This permanently removes the message from the inbox and cannot be undone."
        confirmLabel="Delete message"
        loading={deleting === deleteTarget?.id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void handleDelete(deleteTarget.id); }}
      />
    </div>
  );
}
