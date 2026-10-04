"use client";

import { useState, useCallback, type ChangeEvent, type ReactElement } from "react";
import { Check, Sparkles } from "lucide-react";
import { callAI, type ModelId, type CallResult } from "@/lib/models";
import { ModelDropdown } from "./ModelSelector";
import { Button } from "@/components/ui/Button";
import type { Era } from "@devcraft/types";

interface EnhancedProject {
  tagline:          string;
  description:      string;
  problem:          string;
  solution:         string;
  impact:           string;
  suggestedMetrics: string[];
}

interface AiProjectEnhancerProps {
  title?:   string;
  era?:     Era;
  onApply?: (fields: Partial<EnhancedProject>) => void;
}

interface FieldConfigEntry {
  key:        keyof Omit<EnhancedProject, "suggestedMetrics">;
  label:      string;
  multiline?: boolean;
}

const ERA_LABELS: Record<Era, string> = {
  FOUNDATION: "Foundation — early learning project",
  INTERNSHIP: "HNG Internship — team sprint project",
  SAAS:       "SaaS — live product with real users",
};

const ERA_ENTRIES: [Era, string][] = Object.entries(ERA_LABELS) as [Era, string][];

const FIELD_CONFIG: readonly FieldConfigEntry[] = [
  { key: "tagline",     label: "Tagline" },
  { key: "description", label: "Description",       multiline: true },
  { key: "problem",     label: "Problem Statement",  multiline: true },
  { key: "solution",    label: "Solution",           multiline: true },
  { key: "impact",      label: "Impact / Outcome",   multiline: true },
];

export function AiProjectEnhancer({
  title: initialTitle = "",
  era:   initialEra    = "SAAS",
  onApply,
}: AiProjectEnhancerProps): ReactElement {
  const [title, setTitle]     = useState<string>(initialTitle);
  const [era, setEra]         = useState<Era>(initialEra);
  const [notes, setNotes]     = useState<string>("");
  const [model, setModel]     = useState<ModelId>("qwen/qwen3-coder-480b-a35b-07-25");
  const [result, setResult]   = useState<EnhancedProject | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]     = useState<string>("");
  const [applied, setApplied] = useState<Set<keyof EnhancedProject>>(new Set());

  const enhance = useCallback(async (): Promise<void> => {
    if (!title.trim() || !notes.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setApplied(new Set());

    const res: CallResult<EnhancedProject> = await callAI<EnhancedProject>("/ai/generate/project", {
      title,
      rawNotes: notes,
      era,
      model,
    });

    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error ?? "Enhancement failed.");
    }
    setLoading(false);
  }, [title, notes, era, model, loading]);

  const applyField = (field: keyof Omit<EnhancedProject, "suggestedMetrics">): void => {
    if (!result || !onApply) return;
    onApply({ [field]: result[field] });
    setApplied((prev: Set<keyof EnhancedProject>): Set<keyof EnhancedProject> => new Set(prev).add(field));
  };

  const applyAll = (): void => {
    if (!result || !onApply) return;
    const { suggestedMetrics: _suggestedMetrics, ...fields }: EnhancedProject = result;
    onApply(fields);
    setApplied(new Set(Object.keys(result) as (keyof EnhancedProject)[]));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => setTitle(e.target.value);
  const handleEraChange   = (e: ChangeEvent<HTMLSelectElement>): void => setEra(e.target.value as Era);
  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>): void => setNotes(e.target.value);

  return (
    <div className="flex flex-col gap-5">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>
            Project Title *
          </label>
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. DevRent"
            className="w-full px-4 py-2.5 rounded-xl border text-[13px] outline-none transition-all focus:border-(--brand)"
            style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Era</label>
          <select
            value={era}
            onChange={handleEraChange}
            className="w-full px-4 py-2.5 rounded-xl border text-[13px] outline-none"
            style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
          >
            {ERA_ENTRIES.map(([v, l]: [Era, string]): ReactElement => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>
          Raw Notes — dump everything here *
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          rows={6}
          placeholder="What did you build? What problem did it solve? Any metrics (users, uptime, performance gains)? Tech used? What went wrong? What did you learn? Just bullet points is fine."
          className="w-full px-4 py-3 rounded-xl border text-[13px] leading-[1.6] outline-none transition-all
            focus:border-(--brand) resize-y"
          style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
        />
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-[12px] font-semibold" style={{ color: "var(--dim)" }}>Model</label>
          <ModelDropdown value={model} onChange={setModel} />
        </div>
        <Button
          onClick={(): void => { void enhance(); }}
          disabled={!title.trim() || !notes.trim()}
          loading={loading}
          icon={!loading && <Sparkles size={16} aria-hidden="true" />}
        >
          {loading ? "Enhancing…" : "Enhance Project"}
        </Button>
      </div>

      {error && (
        <p
          className="text-[12px] px-4 py-3 rounded-xl"
          style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
        >
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>AI-Enhanced Fields</p>
            {onApply && (
              <Button size="sm" onClick={applyAll}>
                Apply All
              </Button>
            )}
          </div>

          {FIELD_CONFIG.map(({ key, label }: FieldConfigEntry): ReactElement => {
            const val: string   = result[key];
            const done: boolean = applied.has(key);
            return (
              <div
                key={key}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: done ? "var(--brand)" : "var(--rim)" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: done ? "var(--brand-muted)" : "var(--raised)", borderBottom: "1px solid var(--rim)" }}
                >
                  <p
                    className="text-[11px] font-bold uppercase tracking-[1px]"
                    style={{ color: done ? "var(--brand)" : "var(--dim)" }}
                  >
                    {label}
                  </p>
                  {onApply && (
                    <button
                      type="button"
                      onClick={(): void => applyField(key)}
                      className="text-[11px] font-semibold transition-all hover:opacity-70"
                      style={{ color: done ? "var(--brand)" : "var(--ghost)" }}
                    >
                      {done ? <span className="inline-flex items-center gap-1"><Check size={13} aria-hidden="true" />Applied</span> : "Apply"}
                    </button>
                  )}
                </div>
                <p
                  className="px-4 py-3 text-[13px] leading-[1.65]"
                  style={{ color: "var(--ink)", background: "var(--card)" }}
                >
                  {val}
                </p>
              </div>
            );
          })}

          {result.suggestedMetrics.length > 0 && (
            <div
              className="rounded-xl border p-4"
              style={{ background: "var(--indigo-bg)", borderColor: "var(--indigo)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[1px] mb-2" style={{ color: "var(--indigo)" }}>
                Suggested Metrics to Track
              </p>
              <div className="flex flex-wrap gap-2">
                {result.suggestedMetrics.map((m: string): ReactElement => (
                  <span
                    key={m}
                    className="text-[12px] px-2.5 py-1 rounded-full border font-mono"
                    style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--dim)" }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
