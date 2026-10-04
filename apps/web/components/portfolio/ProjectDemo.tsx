"use client";

import { useState, useRef, useCallback } from "react";
import { Lock, TriangleAlert, X } from "lucide-react";
import { LaujeSpinner, ZaureArch } from "@/components/hausa";
import { Button, ButtonLink } from "@/components/ui/Button";

export interface ProjectDemoProps {
  liveUrl:      string;
  title:        string;
  thumbnailUrl?: string | null;
}

type DemoState = "idle" | "loading" | "loaded" | "error" | "blocked";

export function ProjectDemo({ liveUrl, title, thumbnailUrl }: ProjectDemoProps) {
  const [state, setState]     = useState<DemoState>("idle");
  const [expanded, setExpand] = useState(false);
  const iframeRef             = useRef<HTMLIFrameElement>(null);
  const timeoutRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  const launch = useCallback(() => {
    setState("loading");
    // Timeout: if iframe doesn't load in 8s, likely blocked by X-Frame-Options
    timeoutRef.current = setTimeout(() => {
      setState((s) => s === "loading" ? "blocked" : s);
    }, 8000);
  }, []);

  const onLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Try to detect X-Frame-Options block (can't fully detect cross-origin, but try)
    try {
      // If we can access contentDocument, it loaded without block
      const _ = iframeRef.current?.contentDocument;
      setState("loaded");
    } catch {
      setState("loaded"); // Cross-origin loaded successfully
    }
  };

  const onError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState("error");
  };

  const isSafeUrl = (() => {
    try {
      const u = new URL(liveUrl);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch { return false; }
  })();

  return (
    <>
      {/* Demo panel */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: "var(--glass-bg-strong)",
          borderColor: "var(--glass-border)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: "var(--raised)", borderColor: "var(--rim)" }}
        >
          {/* Browser chrome dots */}
          <div className="flex gap-1.5">
            {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.7 }} />
            ))}
          </div>
          {/* Fake address bar */}
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono"
            style={{ background: "var(--canvas)", color: "var(--ghost)", border: "1px solid var(--rim)" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ color: "#10b981", flexShrink: 0 }}>
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m4.258 8.975a.5.5 0 1 0-.903-.423 8 8 0 0 1-.57 1.023c-.145.213-.297.42-.454.616A7 7 0 0 0 8 15a7 7 0 0 0 2.331-5.025zm-3.28-5.595a7 7 0 0 0 2.36 4.545A7 7 0 0 0 8 1a7 7 0 0 0-2.978.66 7 7 0 0 0 4.456 2.72z"/>
            </svg>
            <span className="truncate">{liveUrl.replace(/^https?:\/\//, "")}</span>
          </div>
          <div className="flex gap-2">
            {state !== "idle" && (
              <button
                onClick={() => { setState("idle"); if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
                className="text-[11px] px-2.5 py-1 rounded-lg border transition-all hover:border-(--brand)"
                style={{ borderColor: "var(--rim)", color: "var(--dim)", background: "var(--canvas)" }}
              >
                ↺
              </button>
            )}
            <button
              onClick={() => setExpand(true)}
              className="text-[11px] px-2.5 py-1 rounded-lg border transition-all hover:border-(--brand)"
              style={{ borderColor: "var(--rim)", color: "var(--dim)", background: "var(--canvas)" }}
              title="Expand"
            >
              ⤢
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
              style={{ background: "var(--brand)", borderColor: "var(--brand)", color: "var(--on-brand)" }}
            >
              Open ↗
            </a>
          </div>
        </div>

        {/* Demo area */}
        <div className="relative" style={{ height: 420 }}>
          {/* Idle state — thumbnail + launch button */}
          {state === "idle" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5"
              style={{ background: "var(--canvas)" }}
            >
              {thumbnailUrl && (
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover opacity-30 blur-[2px] scale-105"
                  />
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
                <ZaureArch size={90} opacity={0.3} />
                <p className="text-[13px]" style={{ color: "var(--dim)" }}>
                  Live preview of <strong style={{ color: "var(--ink)" }}>{title}</strong>
                </p>
                {isSafeUrl ? (
                  <Button onClick={launch}>Load live demo</Button>
                ) : (
                  <p className="text-[12px]" style={{ color: "var(--ghost)" }}>
                    Demo URL is not available.
                  </p>
                )}
                <p className="text-[11px]" style={{ color: "var(--ghost)" }}>
                  Or{" "}
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                    className="underline hover:opacity-70" style={{ color: "var(--brand)" }}>
                    open in a new tab ↗
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {state === "loading" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "var(--canvas)" }}
            >
              <LaujeSpinner size={48} color="var(--brand)" spin />
              <p className="text-[13px]" style={{ color: "var(--dim)" }}>
                Loading {title}…
              </p>
            </div>
          )}

          {/* Blocked by X-Frame-Options */}
          {state === "blocked" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center"
              style={{ background: "var(--canvas)" }}
            >
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt={title}
                  className="w-full h-full object-cover absolute inset-0 opacity-20 blur-sm" />
              )}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <Lock size={30} strokeWidth={1.5} color="var(--ghost)" />
                <p className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>
                  This site restricts iframe embedding
                </p>
                <p className="text-[13px]" style={{ color: "var(--dim)" }}>
                  The live site is running — it just can't be embedded here for security reasons.
                </p>
                <ButtonLink href={liveUrl} target="_blank" rel="noopener noreferrer" className="mt-1">
                  Visit {title} ↗
                </ButtonLink>
              </div>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8"
              style={{ background: "var(--canvas)" }}>
              <TriangleAlert size={30} strokeWidth={1.5} color="var(--ghost)" />
              <p className="text-[13px]" style={{ color: "var(--dim)" }}>
                Couldn't load the demo. The site may be down.
              </p>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                className="text-[13px] font-semibold underline hover:opacity-70"
                style={{ color: "var(--brand)" }}>
                Try opening directly ↗
              </a>
            </div>
          )}

          {/* Iframe — rendered when loading/loaded */}
          {(state === "loading" || state === "loaded") && (
            <iframe
              ref={iframeRef}
              src={liveUrl}
              title={`Live demo: ${title}`}
              onLoad={onLoad}
              onError={onError}
              className="w-full h-full border-none"
              style={{ opacity: state === "loaded" ? 1 : 0, transition: "opacity 0.4s" }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-300 flex flex-col"
          style={{ background: "#0d1220" }}
        >
          {/* Modal header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
            style={{ background: "#161c30", borderColor: "#313d63" }}>
            <div className="flex gap-1.5">
              <button onClick={() => setExpand(false)}
                className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
            </div>
            <span className="flex-1 text-center text-[12px] font-mono" style={{ color: "#acb2c9" }}>
              {liveUrl}
            </span>
            <div className="flex gap-2">
              <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                className="text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "#d4ac55", color: "#191225" }}>
                Open ↗
              </a>
              <button onClick={() => setExpand(false)}
                className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg border"
                style={{ borderColor: "#313d63", color: "#acb2c9" }}>
                <X size={12} strokeWidth={2} aria-hidden="true" />
                Close
              </button>
            </div>
          </div>
          <iframe
            src={liveUrl}
            title={`Live demo (expanded): ${title}`}
            className="flex-1 border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </>
  );
}
