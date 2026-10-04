"use client";

import { useEffect, useState, useCallback, useRef, type ChangeEvent, type ReactElement } from "react";
import { FolderKanban, Sparkles, Star, Upload, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { AiProjectEnhancer } from "@/components/dashboard/AiProjectEnhancer";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState, TableSkeleton } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Project, ProjectCodeExample, Era, ApiResponse } from "@devcraft/types";

type Tab = "list" | "new" | "edit";

interface ProjectFormState {
  title:         string;
  slug:          string;
  tagline:       string;
  description:   string;
  era:           Era;
  problem:       string;
  solution:      string;
  impact:        string;
  metrics:       string; // raw JSON text — parsed on submit
  codeExamples:  string; // raw JSON text — verified snippets for homepage AI
  techStack:     string; // comma-separated — split on submit
  liveUrl:       string;
  githubUrl:     string;
  thumbnailUrl:  string;
  featured:      boolean;
  published:     boolean;
  displayOrder:  number;
}

interface EnhancedFields {
  tagline?:     string;
  description?: string;
  problem?:     string;
  solution?:    string;
  impact?:      string;
}
type PendingAction = { type: "archive" | "notify"; project: Project } | null;

const ERA_LABELS: Record<Era, string> = {
  FOUNDATION: "Foundation",
  INTERNSHIP: "HNG Internship",
  SAAS:       "SaaS",
};

const ERA_COLORS: Record<Era, string> = {
  FOUNDATION: "var(--ghost)",
  INTERNSHIP: "var(--brand)",
  SAAS:       "var(--indigo)",
};

const ERA_OPTIONS: readonly Era[] = ["FOUNDATION", "INTERNSHIP", "SAAS"];
const ERA_FILTER_OPTIONS: readonly (Era | "ALL")[] = ["ALL", "FOUNDATION", "INTERNSHIP", "SAAS"];

const EMPTY_FORM: ProjectFormState = {
  title: "", slug: "", tagline: "", description: "",
  era: "SAAS",
  problem: "", solution: "", impact: "",
  metrics: "",
  codeExamples: "",
  techStack: "",
  liveUrl: "", githubUrl: "", thumbnailUrl: "",
  featured: false, published: false, displayOrder: 0,
};

function slugify(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface TextFieldConfig {
  key:  keyof Pick<ProjectFormState,
    "tagline" | "description" | "problem" | "solution" | "impact" |
    "techStack" | "metrics" | "codeExamples" | "liveUrl" | "githubUrl">;
  label: string;
  ph:    string;
  rows?: number;
}

const TEXT_FIELDS: readonly TextFieldConfig[] = [
  { key: "tagline",      label: "Tagline *",         ph: "One punchy sentence under 80 chars" },
  { key: "description",  label: "Description",       ph: "2-3 paragraph overview", rows: 3 },
  { key: "problem",      label: "Problem",           ph: "What problem does this solve?", rows: 3 },
  { key: "solution",     label: "Solution",          ph: "How did you solve it technically?", rows: 3 },
  { key: "impact",       label: "Impact / Outcome",  ph: "Measurable result or lesson" },
  { key: "techStack",    label: "Tech Stack",        ph: "Next.js, Fastify, PostgreSQL (comma separated)" },
  { key: "metrics",      label: "Metrics (JSON)",    ph: '{"users": 120, "uptime": "99.8%"}' },
  { key: "codeExamples", label: "Code examples for AI (JSON)", ph: '[{"language":"ts","solves":"Validates checkout input","code":"const input = schema.parse(body);"}]', rows: 7 },
  { key: "liveUrl",      label: "Live URL",          ph: "https://devrent.app" },
  { key: "githubUrl",    label: "GitHub URL",        ph: "https://github.com/…" },
];

export default function ProjectsDashboard(): ReactElement {
  const [tab, setTab]             = useState<Tab>("list");
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState<boolean>(true);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<ProjectFormState>({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState<boolean>(false);
  const [saveErr, setSaveErr]     = useState<string>("");
  const [eraFilter, setEraFilter] = useState<Era | "ALL">("ALL");
  const [showAI, setShowAI]       = useState<boolean>(false);
  const [notifying, setNotifying] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [notice, setNotice] = useState<string>("");
  const [uploadingThumb, setUploadingThumb] = useState<boolean>(false);
  const [uploadThumbErr, setUploadThumbErr] = useState<string>("");
  const thumbFileInputRef = useRef<HTMLInputElement | null>(null);

  // Same signed-Cloudinary-upload pattern as the blog form's cover image
  // (see dashboard/blog/page.tsx's handleCoverUpload) — kept as a separate
  // copy rather than a shared hook since the two forms' field names and
  // folders differ and there was no third caller to justify extracting one.
  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadThumbErr("Please select an image file.");
      e.target.value = "";
      return;
    }
    const MAX_THUMB_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_THUMB_BYTES) {
      setUploadThumbErr("That image is larger than 8MB — please use a smaller one.");
      e.target.value = "";
      return;
    }

    setUploadingThumb(true);
    setUploadThumbErr("");
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

      const signParams = { folder: "projects" };
      const signRes = await adminApi.uploads.sign(signParams);
      if (!signRes.ok) {
        setUploadThumbErr(signRes.error ?? "Could not authorize the upload.");
        return;
      }
      const { signature, timestamp, apiKey } = signRes.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", signParams.folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.secure_url) {
        setField("thumbnailUrl", data.secure_url as string);
      } else {
        setUploadThumbErr(data.error?.message ?? "Upload failed.");
      }
    } catch (err) {
      setUploadThumbErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingThumb(false);
      if (thumbFileInputRef.current) thumbFileInputRef.current.value = "";
    }
  };

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    const res = (await adminApi.projects.list()) as ApiResponse<Project[]>;
    if (res.ok) setProjects(res.data);
    setLoading(false);
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  const startNew = (): void => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowAI(false);
    setTab("new");
  };

  const startEdit = (p: Project): void => {
    setEditId(p.id);
    setForm({
      title: p.title, slug: p.slug, tagline: p.tagline,
      description: p.description, era: p.era,
      problem: p.problem, solution: p.solution, impact: p.impact,
      metrics: p.metrics ? JSON.stringify(p.metrics) : "",
      codeExamples: JSON.stringify(p.codeExamples, null, 2),
      techStack: p.techStack.join(", "),
      liveUrl: p.liveUrl ?? "", githubUrl: p.githubUrl ?? "",
      thumbnailUrl: p.thumbnailUrl ?? "",
      featured: p.featured, published: p.published,
      displayOrder: p.displayOrder,
    });
    setShowAI(false);
    setTab("edit");
  };

  const setField = <K extends keyof ProjectFormState>(key: K, val: ProjectFormState[K]): void => {
    setForm((prev: ProjectFormState): ProjectFormState => ({ ...prev, [key]: val }));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    setForm((prev: ProjectFormState): ProjectFormState => ({
      ...prev,
      title: value,
      slug: editId ? prev.slug : slugify(value),
    }));
  };

  const save = async (): Promise<void> => {
    setSaving(true);
    setSaveErr("");

    let metrics: Record<string, string | number> | null = null;
    let codeExamples: ProjectCodeExample[] = [];
    if (form.metrics.trim()) {
      try {
        metrics = JSON.parse(form.metrics) as Record<string, string | number>;
      } catch {
        setSaveErr('Metrics must be valid JSON e.g. {"users": 120}');
        setSaving(false);
        return;
      }
    }

    if (form.codeExamples.trim()) {
      try {
        const parsedExamples: unknown = JSON.parse(form.codeExamples);
        if (!Array.isArray(parsedExamples)) throw new Error("not an array");
        codeExamples = parsedExamples as ProjectCodeExample[];
      } catch {
        setSaveErr('Code examples must be a JSON array, e.g. [{"language":"ts","solves":"...","code":"..."}]');
        setSaving(false);
        return;
      }
    }

    const payload = {
      title:        form.title,
      slug:         form.slug,
      tagline:      form.tagline,
      description:  form.description,
      era:          form.era,
      problem:      form.problem,
      solution:     form.solution,
      impact:       form.impact,
      featured:     form.featured,
      published:    form.published,
      displayOrder: form.displayOrder,
      techStack:    form.techStack.split(",").map((t: string): string => t.trim()).filter(Boolean),
      liveUrl:      form.liveUrl || null,
      githubUrl:    form.githubUrl || null,
      thumbnailUrl: form.thumbnailUrl || null,
      galleryUrls:  [] as string[],
      metrics,
      codeExamples,
    };

    const res = (editId
      ? await adminApi.projects.update(editId, payload)
      : await adminApi.projects.create(payload)) as ApiResponse<Project>;

    if (res.ok) {
      await load();
      setTab("list");
    } else {
      setSaveErr(res.error ?? "Save failed.");
    }
    setSaving(false);
  };

  const del = async (id: string): Promise<void> => {
    await adminApi.projects.delete(id);
    await load();
    setPendingAction(null);
  };

  const notify = async (id: string): Promise<void> => {
    setNotifying(true);
    // Bug fix: this used to show "Notification sent!" unconditionally,
    // even on failure — including the new case where the backend now
    // blocks a repeat notification for the same project with a 409, and
    // any case where sends partially failed (see email.service.ts).
    const res = await adminApi.notify.send("PROJECT", id);
    setNotifying(false);
    const firstDeliveryError = res.ok ? res.data.errors?.[0] : undefined;
    if (!res.ok) {
      setNotice(res.error ?? "SMTP did not accept the notification.");
    } else if (res.data.failed > 0) {
      setNotice(`SMTP accepted ${res.data.accepted}; ${res.data.failed} recipient${res.data.failed === 1 ? " was" : "s were"} rejected.${firstDeliveryError ? ` First error: ${firstDeliveryError}` : ""} Inbox delivery is not confirmed.`);
    } else {
      setNotice(`SMTP accepted the notification for ${res.data.accepted} subscriber${res.data.accepted === 1 ? "" : "s"}. Inbox delivery is not confirmed.`);
    }
    setPendingAction(null);
  };

  const toggleField = async (p: Project, field: "published" | "featured"): Promise<void> => {
    await adminApi.projects.update(p.id, { ...p, [field]: !p[field] });
    await load();
  };

  const applyEnhanced = (fields: EnhancedFields): void => {
    setForm((prev: ProjectFormState): ProjectFormState => ({ ...prev, ...fields }));
  };

  const filtered: Project[] = projects
    .filter((p: Project): boolean => eraFilter === "ALL" || p.era === eraFilter)
    .sort((a: Project, b: Project): number => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-300 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
            Dashboard
          </p>
          <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Projects</h1>
        </div>
        <div className="flex gap-2">
          {tab !== "list" && (
            <Button variant="secondary" onClick={(): void => setTab("list")}>
              ← Back
            </Button>
          )}
          {tab === "list" && (
            <Button onClick={startNew}>+ Add Project</Button>
          )}
        </div>
      </div>

      {/* LIST */}
      {tab === "list" && (
        <>
          <SegmentedControl
            className="mb-5 w-fit"
            options={ERA_FILTER_OPTIONS.map((e) => ({ value: e, label: e === "ALL" ? "All" : ERA_LABELS[e] }))}
            value={eraFilter}
            onChange={setEraFilter}
          />

          <div className="dash-panel overflow-hidden">
            {loading ? (
              <TableSkeleton rows={5} />
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-140 border-collapse text-[13px]">
                <thead>
                  <tr style={{ background: "var(--raised)", borderBottom: "1px solid var(--rim)" }}>
                    {["Project", "Era", "Status", "Views", ""].map((h: string): ReactElement => (
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon={<FolderKanban size={32} strokeWidth={1.5} />}
                          title={eraFilter === "ALL" ? "No projects yet" : `No ${ERA_LABELS[eraFilter]} projects`}
                          hint={eraFilter === "ALL" ? "Add your first project to see it here and on the homepage." : "Try a different era filter, or add one."}
                          action={eraFilter === "ALL" ? <Button size="sm" onClick={startNew} className="mt-1">+ Add Project</Button> : undefined}
                        />
                      </td>
                    </tr>
                  ) : filtered.map((p: Project): ReactElement => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "1px solid var(--rim-sub)" }}
                      className="hover:bg-(--raised) transition-colors"
                    >
                      <td className="px-4 py-3 max-w-60">
                        <p className="font-semibold truncate" style={{ color: "var(--ink)" }}>{p.title}</p>
                        <p className="text-[11px] truncate" style={{ color: "var(--ghost)" }}>{p.tagline}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="swatch-tag"
                          style={{
                            background: `color-mix(in srgb, ${ERA_COLORS[p.era]} 18%, transparent)`,
                            color:      ERA_COLORS[p.era],
                            borderColor: `color-mix(in srgb, ${ERA_COLORS[p.era]} 44%, transparent)`,
                          }}
                        >
                          {ERA_LABELS[p.era]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(): void => { void toggleField(p, "published"); }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
                            style={{
                              background: p.published ? "var(--pos-bg)" : "var(--raised)",
                              color:      p.published ? "var(--pos-text)" : "var(--ghost)",
                              border:     `1px solid ${p.published ? "rgba(16,185,129,.3)" : "var(--rim)"}`,
                            }}
                          >
                            {p.published ? "Live" : "Draft"}
                          </button>
                          <button
                            type="button"
                            onClick={(): void => { void toggleField(p, "featured"); }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
                            style={{
                              background: p.featured ? "var(--brand-muted)" : "var(--raised)",
                              color:      p.featured ? "var(--brand)" : "var(--ghost)",
                              border:     `1px solid ${p.featured ? "var(--rim)" : "var(--rim-sub)"}`,
                            }}
                          >
                            {p.featured ? <><Star size={12} fill="currentColor" aria-hidden="true" /> Featured</> : <Star size={12} aria-hidden="true" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "var(--dim)" }}>
                        {p.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={(): void => startEdit(p)}
                            className="text-[12px] font-semibold hover:opacity-70"
                            style={{ color: "var(--brand)" }}
                          >
                            Edit
                          </button>
                          {p.published && (
                            <button
                              type="button"
                              onClick={(): void => setPendingAction({ type: "notify", project: p })}
                              disabled={notifying}
                              className="text-[12px] hover:opacity-70"
                              style={{ color: "var(--indigo)" }}
                            >
                              {notifying ? "…" : "Notify"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(): void => setPendingAction({ type: "archive", project: p })}
                            className="text-[12px] hover:opacity-70"
                            style={{ color: "var(--ghost)" }}
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* EDITOR */}
      {(tab === "new" || tab === "edit") && (
        <div className={`grid gap-6 grid-cols-1 ${showAI ? "lg:grid-cols-2" : ""}`}>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border p-6" style={{ background: "var(--card)", borderColor: "var(--rim)" }}>
              <div className="flex items-center justify-between mb-5">
                <p className="font-semibold text-[16px]" style={{ color: "var(--ink)" }}>
                  {editId ? "Edit Project" : "New Project"}
                </p>
                <button
                  type="button"
                  onClick={(): void => setShowAI((prev: boolean): boolean => !prev)}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    background:  showAI ? "var(--brand-muted)" : "var(--raised)",
                    borderColor: showAI ? "var(--brand)"        : "var(--rim)",
                    color:       showAI ? "var(--brand)"        : "var(--dim)",
                  }}
                >
                  <Sparkles size={15} aria-hidden="true" /> {showAI ? "Hide AI" : "AI Enhance"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>Title *</label>
                  <input
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="DevRent"
                    className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none focus:border-(--brand)"
                    style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => setField("slug", e.target.value)}
                    placeholder="devrent"
                    className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none focus:border-(--brand)"
                    style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>Era</label>
                <div className="flex gap-2">
                  {ERA_OPTIONS.map((e: Era): ReactElement => (
                    <button
                      key={e}
                      type="button"
                      onClick={(): void => setField("era", e)}
                      className="flex-1 py-2 rounded-xl border text-[12px] font-semibold transition-all"
                      style={{
                        background:  form.era === e ? `${ERA_COLORS[e]}18` : "var(--raised)",
                        borderColor: form.era === e ? ERA_COLORS[e]         : "var(--rim)",
                        color:       form.era === e ? ERA_COLORS[e]         : "var(--dim)",
                      }}
                    >
                      {ERA_LABELS[e]}
                    </button>
                  ))}
                </div>
              </div>

              {TEXT_FIELDS.map(({ key, label, ph, rows }: TextFieldConfig): ReactElement => (
                <div key={key} className="mt-3">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>{label}</label>
                  <textarea
                    value={form[key]}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => setField(key, e.target.value)}
                    placeholder={ph}
                    rows={rows ?? 1}
                    className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none focus:border-(--brand) resize-y"
                    style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
                  />
                </div>
              ))}

              <div className="mt-3">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>Thumbnail</label>
                {form.thumbnailUrl ? (
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "var(--rim)" }}>
                    <img src={form.thumbnailUrl} alt="Thumbnail preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={(): void => setField("thumbnailUrl", "")}
                      className="absolute top-2 right-2 p-1.5 rounded-lg"
                      style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                      aria-label="Remove thumbnail"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex items-center justify-center gap-2 py-6 rounded-xl border border-dashed text-[13px] font-semibold cursor-pointer transition-colors hover:border-(--brand)"
                    style={{ borderColor: "var(--rim)", color: "var(--dim)", background: "var(--raised)" }}
                  >
                    <Upload size={15} />
                    {uploadingThumb ? "Uploading…" : "Upload thumbnail"}
                    <input
                      ref={thumbFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e): void => { void handleThumbnailUpload(e); }}
                      disabled={uploadingThumb}
                    />
                  </label>
                )}
                {uploadThumbErr && (
                  <p className="text-[12px] mt-1.5" style={{ color: "#f87171" }}>{uploadThumbErr}</p>
                )}
              </div>

              <div className="flex gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => setField("published", e.target.checked)}
                  />
                  <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void => setField("featured", e.target.checked)}
                  />
                  <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>featured</span>
                </label>
              </div>

              {saveErr && (
                <p
                  className="mt-3 text-[12px] px-4 py-3 rounded-xl"
                  style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
                >
                  {saveErr}
                </p>
              )}

              <button
                type="button"
                onClick={(): void => { void save(); }}
                disabled={saving || !form.title}
                className="mt-5 w-full py-3 rounded-xl text-[14px] font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: "var(--brand)", color: "var(--on-brand)" }}
              >
                {saving ? "Saving…" : editId ? "Update Project" : "Create Project"}
              </button>
            </div>
          </div>

          {showAI && (
            <div className="rounded-2xl border p-6 h-fit" style={{ background: "var(--card)", borderColor: "var(--rim)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--brand)" }} />
                <p className="font-semibold text-[16px]" style={{ color: "var(--ink)" }}>AI Project Enhancer</p>
              </div>
              <AiProjectEnhancer title={form.title} era={form.era} onApply={applyEnhanced} />
            </div>
          )}
        </div>
      )}
      {notice && <p role="status" className="fixed right-6 bottom-6 z-50 max-w-sm rounded-xl px-4 py-3 text-[13px] shadow-lg" style={{ background: "var(--raised)", color: "var(--ink)", border: "1px solid var(--rim)" }}>{notice}</p>}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === "archive" ? "Archive this project?" : "Notify all subscribers?"}
        description={pendingAction?.type === "archive" ? "The project will be removed from the portfolio until you restore it." : "Every active subscriber will receive an email about this project."}
        confirmLabel={pendingAction?.type === "archive" ? "Archive project" : "Send notification"}
        loading={notifying}
        onClose={() => setPendingAction(null)}
        onConfirm={() => { if (!pendingAction) return; if (pendingAction.type === "archive") void del(pendingAction.project.id); else void notify(pendingAction.project.id); }}
      />
    </div>
  );
}
