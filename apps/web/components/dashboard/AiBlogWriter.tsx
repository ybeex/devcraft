"use client";

import { useState, useRef, useCallback, type ChangeEvent, type ReactElement } from "react";
import { Sparkles } from "lucide-react";
import { streamSSE, type ModelId, type StreamResult } from "@/lib/models";
import { ModelDropdown } from "./ModelSelector";
import { Button } from "@/components/ui/Button";

type Tone  = "technical" | "conversational" | "tutorial";
type Stage = "idle" | "generating" | "done" | "error";

interface ToneOption {
  value: Tone;
  label: string;
  desc:  string;
}

const TONE_OPTIONS: readonly ToneOption[] = [
  { value: "conversational", label: "Conversational", desc: "Warm, first-person, opinionated" },
  { value: "technical",      label: "Technical",      desc: "Precise, code-heavy, detailed"    },
  { value: "tutorial",       label: "Tutorial",       desc: "Step-by-step, beginner-friendly"  },
];

const TOPIC_SUGGESTIONS: readonly string[] = [
  "Why I chose Fastify over Express for my SaaS backend",
  "What tailoring taught me about software architecture",
  "Building a multi-tenant SaaS on a solo budget",
  "PostgreSQL vs MongoDB: a practitioner's honest take",
  "The maths behind efficient API pagination",
];

interface AiBlogWriterProps {
  onInsert?: (mdx: string) => void;
}

export function AiBlogWriter({ onInsert }: AiBlogWriterProps): ReactElement {
  const [topic, setTopic]     = useState<string>("");
  const [outline, setOutline] = useState<string>("");
  const [tone, setTone]       = useState<Tone>("conversational");
  const [model, setModel]     = useState<ModelId>("deepseek/deepseek-chat-v3-0324");
  const [draft, setDraft]     = useState<string>("");
  const [stage, setStage]     = useState<Stage>("idle");
  const [error, setError]     = useState<string>("");
  const [showOutline, setShowOutline] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (): Promise<void> => {
    if (!topic.trim() || stage === "generating") return;
    setStage("generating");
    setDraft("");
    setError("");

    abortRef.current = new AbortController();

    const result: StreamResult = await streamSSE(
      "/ai/generate/blog/stream",
      { topic: topic.trim(), outline: outline.trim() || undefined, tone, model },
      (delta: string): void => setDraft((prev: string): string => prev + delta),
      abortRef.current.signal
    );

    if (result.ok) {
      setStage("done");
    } else {
      setStage("error");
      setError(result.error ?? "Generation failed.");
    }
  }, [topic, outline, tone, model, stage]);

  const stop = (): void => {
    abortRef.current?.abort();
    setStage("done");
  };

  const copy = (): void => {
    void navigator.clipboard.writeText(draft);
  };

  const handleTopicChange = (e: ChangeEvent<HTMLInputElement>): void => setTopic(e.target.value);
  const handleOutlineChange = (e: ChangeEvent<HTMLTextAreaElement>): void => setOutline(e.target.value);
  const toggleOutline = (): void => setShowOutline((prev: boolean): boolean => !prev);

  const wordCount: number = draft.split(/\s+/).filter(Boolean).length;
  const readTime:  number = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="flex flex-col gap-5">
      {/* Topic */}
      <div>
        <label className="block text-[12px] font-semibold mb-2" style={{ color: "var(--dim)" }}>
          Blog Topic *
        </label>
        <input
          value={topic}
          onChange={handleTopicChange}
          placeholder="e.g. Why I chose Fastify over Express"
          disabled={stage === "generating"}
          className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none transition-all
            focus:border-(--brand) disabled:opacity-50"
          style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TOPIC_SUGGESTIONS.map((s: string): ReactElement => (
            <button
              key={s}
              type="button"
              onClick={(): void => setTopic(s)}
              className="text-[10px] px-2 py-1 rounded-full border transition-all hover:border-(--brand)"
              style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ghost)" }}
            >
              {s.length > 40 ? `${s.slice(0, 40)}…` : s}
            </button>
          ))}
        </div>
      </div>

      {/* Outline toggle */}
      <div>
        <button
          type="button"
          onClick={toggleOutline}
          className="text-[12px] font-semibold flex items-center gap-1.5"
          style={{ color: "var(--brand)" }}
        >
          {showOutline ? "▼" : "▶"} Add outline (optional)
        </button>
        {showOutline && (
          <textarea
            value={outline}
            onChange={handleOutlineChange}
            placeholder="List section headings or key points to cover…"
            rows={4}
            className="w-full mt-2 px-4 py-3 rounded-xl border text-[13px] outline-none transition-all
              focus:border-(--brand) resize-y"
            style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
          />
        )}
      </div>

      {/* Tone + Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[12px] font-semibold mb-2" style={{ color: "var(--dim)" }}>Tone</p>
          <div className="flex flex-col gap-1.5">
            {TONE_OPTIONS.map(({ value, label, desc }: ToneOption): ReactElement => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all"
                style={{
                  background:  tone === value ? "var(--brand-muted)" : "var(--raised)",
                  borderColor: tone === value ? "var(--brand)"        : "var(--rim)",
                }}
              >
                <input
                  type="radio"
                  value={value}
                  checked={tone === value}
                  onChange={(): void => setTone(value)}
                  className="sr-only"
                />
                <span
                  className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ borderColor: tone === value ? "var(--brand)" : "var(--rim)" }}
                >
                  {tone === value && <span className="w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />}
                </span>
                <span>
                  <p className="text-[12px] font-semibold" style={{ color: "var(--ink)" }}>{label}</p>
                  <p className="text-[11px]" style={{ color: "var(--ghost)" }}>{desc}</p>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-semibold mb-2" style={{ color: "var(--dim)" }}>Model</p>
          <ModelDropdown value={model} onChange={setModel} className="w-full" />
          <p className="text-[11px] mt-1.5" style={{ color: "var(--ghost)" }}>
            Tip: DeepSeek R1 for depth, Qwen3 for technical posts, GPT-4o for polish.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={(): void => { void generate(); }}
          disabled={!topic.trim()}
          loading={stage === "generating"}
          fullWidth
          size="lg"
          icon={!(stage === "generating") && <Sparkles size={16} aria-hidden="true" />}
        >
          {stage === "generating" ? "Generating…" : "Generate Draft"}
        </Button>
        {stage === "generating" && (
          <Button variant="secondary" onClick={stop} size="lg">
            Stop
          </Button>
        )}
      </div>

      {error && (
        <p
          className="text-[12px] px-4 py-3 rounded-xl"
          style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
        >
          {error}
        </p>
      )}

      {draft && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[12px] font-semibold" style={{ color: "var(--dim)" }}>Draft Preview</span>
              <span
                className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: "var(--raised)", color: "var(--ghost)", border: "1px solid var(--rim)" }}
              >
                {wordCount} words · {readTime} min read
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={copy}>
                Copy MDX
              </Button>
              {onInsert && stage === "done" && (
                <Button size="sm" onClick={(): void => onInsert(draft)}>
                  Insert into Editor
                </Button>
              )}
            </div>
          </div>

          <pre
            className="p-4 rounded-xl text-[12px] leading-[1.7] overflow-auto max-h-100 whitespace-pre-wrap font-mono"
            style={{ background: "#14192b", color: "#c9cfe8", border: "1px solid var(--rim)" }}
          >
            {draft}
            {stage === "generating" && (
              <span
                className="inline-block w-2 h-4 ml-0.5 align-text-bottom animate-pulse"
                style={{ background: "var(--brand)" }}
              />
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
