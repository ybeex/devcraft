"use client";

import { useState, type FormEvent, type ChangeEvent, type ReactElement } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

export function SubscribeWidget(): ReactElement {
  const [email, setEmail]   = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage("");

    const res = await api.subscribe(email.trim());

    if (res.ok) {
      setStatus("success");
      setMessage(res.data.message ?? "You're subscribed!");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(res.error ?? "Something went wrong. Try again.");
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value);

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl border"
        style={{ background: "var(--pos-bg)", borderColor: "rgba(16,185,129,.3)" }}>
        <Check size={20} strokeWidth={2.5} aria-hidden="true" style={{ color: "var(--pos-text)" }} />
        <p className="text-sm font-semibold" role="status" style={{ color: "var(--pos-text)" }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e): void => { void handleSubmit(e); }} className="flex flex-col gap-3 w-full max-w-sm">
      <p className="text-sm font-semibold" style={{ color: "var(--dim)" }}>
        Get notified when I ship new projects or write something worth reading.
      </p>

      <div className="flex flex-col min-[381px]:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className="flex-1 min-w-0 px-4 py-3 rounded-xl text-sm outline-none
            transition-all duration-200 border
            focus:border-(--brand) focus:ring-2 focus:ring-(--brand-muted)"
          style={{
            background: "var(--raised)",
            borderColor: "var(--rim)",
            color: "var(--ink)",
          }}
        />
        <Button
          type="submit"
          disabled={!email.trim()}
          loading={status === "loading"}
          className="shrink-0 max-[380px]:w-full"
        >
          Subscribe
        </Button>
      </div>

      {status === "error" && (
        <p className="text-xs" role="alert" style={{ color: "var(--neg-text)" }}>
          {message}
        </p>
      )}

      <p className="text-xs" style={{ color: "var(--ghost)" }}>
        No spam. Unsubscribe any time.
      </p>
    </form>
  );
}
