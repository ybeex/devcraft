"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
} from "react";
import { Copy, Image as ImageIcon, X, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface HighlightPopupProps {
  text:      string;
  postTitle: string;
  postSlug:  string;
  x:         number;
  y:         number;
  onClose:   () => void;
}

type ExportState = "idle" | "rendering" | "done";

type CornerRadius = number | [number, number, number, number];

// ── CANVAS IMAGE RENDERER ─────────────────────────────────────────────────────

function renderHighlightCard(
  quote:     string,
  postTitle: string,
  siteUrl:   string,
  dark:      boolean
): Promise<string> {
  return new Promise<string>((resolve: (value: string) => void): void => {
    const W = 800;
    const H = 420;
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width  = W * 2; // 2x for retina
    canvas.height = H * 2;

    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }
    ctx.scale(2, 2);

    const bg     = dark ? "#0d1220" : "#f1ecde";
    const cardBg = dark ? "#161c30" : "#e7dfc9";
    const brand  = dark ? "#d4ac55" : "#a2762a";
    const ink    = dark ? "#f4efe3" : "#1c2036";
    const dim    = dark ? "#acb2c9" : "#5b5847";
    const rim    = dark ? "#313d63" : "#c7b78c";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const pad = 40;
    roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 16);
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.strokeStyle = rim;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    const grad: CanvasGradient = ctx.createLinearGradient(pad, 0, W - pad, 0);
    grad.addColorStop(0, brand);
    grad.addColorStop(1, dark ? "#a2762a" : "#d4ac55");
    ctx.fillStyle = grad;
    roundRect(ctx, pad, pad, W - pad * 2, 4, [4, 4, 0, 0]);
    ctx.fill();

    // Hausa diamond decoration (top-right)
    ctx.save();
    ctx.translate(W - pad - 28, pad + 24);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = brand;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth   = 1.5;
    for (const s of [10, 18, 26] as const) {
      ctx.strokeRect(-s, -s, s * 2, s * 2);
    }
    ctx.restore();

    // Opening quote mark
    ctx.font = "700 72px Georgia, serif";
    ctx.fillStyle = brand;
    ctx.globalAlpha = 0.25;
    ctx.fillText('"', pad + 20, pad + 72);
    ctx.globalAlpha = 1;

    // Quote text (wrapped)
    const maxW:   number   = W - pad * 2 - 60;
    const truncQ: string   = quote.length > 240 ? `${quote.slice(0, 237)}…` : quote;
    ctx.font      = "italic 18px Georgia, serif";
    ctx.fillStyle = ink;
    const qLines: string[] = wrapText(ctx, truncQ, maxW);
    const qTop:   number   = pad + 76;

    qLines.slice(0, 7).forEach((line: string, i: number): void => {
      ctx.fillText(line, pad + 44, qTop + i * 28);
    });

    const divY: number = Math.min(qTop + qLines.length * 28 + 20, H - 90);
    ctx.beginPath();
    ctx.moveTo(pad + 44, divY);
    ctx.lineTo(W - pad - 44, divY);
    ctx.strokeStyle = rim;
    ctx.lineWidth   = 1;
    ctx.stroke();

    ctx.font      = "600 13px system-ui, sans-serif";
    ctx.fillStyle = dim;
    ctx.fillText(
      postTitle.length > 60 ? `${postTitle.slice(0, 57)}…` : postTitle,
      pad + 44,
      divY + 20
    );

    ctx.font      = "700 13px system-ui, sans-serif";
    ctx.fillStyle = brand;
    ctx.fillText(siteUrl, pad + 44, divY + 40);

    drawLaujeMark(ctx, W - pad - 44, divY + 22, 18, brand);

    resolve(canvas.toDataURL("image/png"));
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: CornerRadius = 0
): void {
  const [tl, tr, br, bl]: [number, number, number, number] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);         ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);     ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);         ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);             ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words: string[] = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test: string = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawLaujeMark(
  ctx:   CanvasRenderingContext2D,
  cx:    number,
  cy:    number,
  size:  number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;

  const radii: number[] = [size * 0.4, size * 0.7, size];

  radii.forEach((r: number, i: number): void => {
    ctx.globalAlpha = 0.6 - i * 0.18;
    ctx.lineWidth   = 1.5 - i * 0.3;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const rx: number = cx + r * Math.cos(a - Math.PI / 8);
      const ry: number = cy + r * Math.sin(a - Math.PI / 8);
      if (a === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  });

  ctx.restore();
}

// ── HIGHLIGHT POPUP ───────────────────────────────────────────────────────────

function HighlightPopup({ text, postTitle, postSlug, x, y, onClose }: HighlightPopupProps): ReactElement {
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [imageUrl, setImageUrl]       = useState<string | null>(null);
  const [copied, setCopied]           = useState<boolean>(false);
  const [showCard, setShowCard]       = useState<boolean>(false);
  const [pos, setPos]                 = useState<{ left: number; top: number }>({ left: x, top: y });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const isDark: boolean = document.documentElement.classList.contains("dark");
  const siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL!;

  // Bug fix: the old version guessed a fixed 340px popup width when
  // clamping to the viewport, which only clamped the LEFT edge and didn't
  // account for the popup growing much taller once the card preview
  // appears. Measuring the real rendered box (and re-measuring whenever
  // showCard changes its size) keeps it fully on-screen on any viewport,
  // phones included.
  useLayoutEffect((): void => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const left = Math.min(Math.max(x, margin), window.innerWidth - rect.width - margin);
    const top = Math.min(Math.max(y - rect.height - 12, margin), window.innerHeight - rect.height - margin);
    setPos({ left, top });
  }, [x, y, showCard]);

  const makeImage = useCallback(async (): Promise<void> => {
    setExportState("rendering");
    const url: string = await renderHighlightCard(text, postTitle, siteUrl, isDark);
    setImageUrl(url);
    setExportState("done");
    setShowCard(true);
  }, [text, postTitle, siteUrl, isDark]);

  const copyText = (): void => {
    void navigator.clipboard.writeText(`"${text}"\n\n— ${postTitle}\n${siteUrl}/blog/${postSlug}`);
    setCopied(true);
    setTimeout((): void => setCopied(false), 2000);
  };

  const downloadImage = (): void => {
    if (!imageUrl) return;
    const a: HTMLAnchorElement = document.createElement("a");
    a.href     = imageUrl;
    a.download = "devcraft-highlight.png";
    a.click();
  };

  const style: CSSProperties = {
    position: "fixed",
    zIndex:   500,
    left:     pos.left,
    top:      pos.top,
    animation: "fade-up 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
  };

  return (
    <div ref={wrapRef} style={style} className="flex flex-col gap-2">
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border"
        style={{
          background: "var(--glass-bg-strong)",
          borderColor: "var(--glass-border)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          boxShadow: "inset 0 1px 0 0 var(--glass-highlight), 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <Button size="sm" onClick={copyText} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
          {copied ? "Copied" : "Copy quote"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={(): void => { void makeImage(); }}
          loading={exportState === "rendering"}
          icon={<ImageIcon size={14} />}
        >
          {exportState === "rendering" ? "Creating…" : "Share as image"}
        </Button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 rounded-lg transition-all hover:opacity-60"
          style={{ color: "var(--ghost)" }}
        >
          <X size={14} />
        </button>
      </div>

      {showCard && imageUrl && (
        <div
          className="rounded-2xl overflow-hidden border"
          style={{
            width: 340,
            background: "var(--glass-bg-strong)",
            borderColor: "var(--glass-border)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            boxShadow: "inset 0 1px 0 0 var(--glass-highlight), 0 12px 40px rgba(0,0,0,0.35)",
          }}
        >
          <img src={imageUrl} alt="Highlight card" className="w-full" />
          <div className="flex gap-2 p-3">
            <Button size="sm" onClick={downloadImage} icon={<Download size={13} />} fullWidth>
              Download PNG
            </Button>
            <Button size="sm" variant="secondary" onClick={copyText} fullWidth>
              Copy text
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── READING MODE WRAPPER ──────────────────────────────────────────────────────

export interface ReadingModeProps {
  children:  ReactNode;
  postTitle: string;
  postSlug:  string;
}

interface SelectionState {
  text: string;
  x:    number;
  y:    number;
}

export function ReadingMode({ children, postTitle, postSlug }: ReadingModeProps): ReactElement {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Bug fix: the old version only listened for onMouseUp, which never
  // fires for a touch-based selection (long-press + drag) on phones and
  // tablets — the exact audience most likely to be reading a blog post on
  // a small screen. selectionchange fires for both mouse and touch
  // selection uniformly, so this covers both without separate handlers.
  // It fires on every caret movement though, so it's debounced slightly
  // to avoid recalculating a layout-triggering getBoundingClientRect() on
  // every intermediate event while a selection is still being dragged.
  useEffect((): (() => void) => {
    let frame: number | null = null;

    const evaluate = (): void => {
      const sel: Selection | null = window.getSelection();
      const text: string = sel?.toString().trim() ?? "";

      if (!text || text.length < 20 || text.length > 600) {
        setSelection(null);
        return;
      }
      if (!contentRef.current || !sel || sel.rangeCount === 0) return;

      const range: Range = sel.getRangeAt(0);
      if (!contentRef.current.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }

      const rect: DOMRect = range.getBoundingClientRect();
      setSelection({
        text,
        x: rect.left + rect.width / 2 - 160,
        y: rect.top,
      });
    };

    const onSelectionChange = (): void => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(evaluate);
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return (): void => {
      document.removeEventListener("selectionchange", onSelectionChange);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect((): (() => void) => {
    const close = (): void => setSelection(null);
    window.addEventListener("scroll", close, { passive: true });
    return (): void => window.removeEventListener("scroll", close);
  }, []);

  return (
    <div className="relative">
      <div ref={contentRef}>
        {children}
      </div>

      <div
        className="mt-8 flex items-center gap-2 text-[12px] px-4 py-2.5 rounded-xl border w-fit"
        style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ghost)" }}
      >
        <span>Select any text to create a shareable highlight card.</span>
      </div>

      {selection && (
        <HighlightPopup
          text={selection.text}
          postTitle={postTitle}
          postSlug={postSlug}
          x={selection.x}
          y={selection.y}
          onClose={(): void => setSelection(null)}
        />
      )}
    </div>
  );
}
