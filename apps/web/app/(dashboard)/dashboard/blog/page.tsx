"use client";

import { useEffect, useState, useCallback, useRef, type ChangeEvent, type ReactElement } from "react";
import { FileText, Sparkles, Upload, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { AiBlogWriter } from "@/components/dashboard/AiBlogWriter";
import { Button } from "@/components/ui/Button";
import { EmptyState, TableSkeleton } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ApiResponse } from "@devcraft/types";

type Tab = "list" | "new" | "edit";

interface PostMeta {
  id:          string;
  title:       string;
  slug:        string;
  published:   boolean;
  publishedAt: string | null;
  views:       number;
  tags:        string[];
  readingTime: number | null;
  updatedAt:   string;
}

interface PostDetail extends PostMeta {
  excerpt:       string;
  content:       string;
  coverImageUrl: string | null;
}
type PendingAction = { type: "delete" | "notify"; post: PostMeta } | null;

interface BlogFormState {
  title:         string;
  slug:          string;
  excerpt:       string;
  content:       string;
  coverImageUrl: string;
  tags:          string;
  published:     boolean;
}

const EMPTY_FORM: BlogFormState = {
  title: "", slug: "", excerpt: "", content: "",
  coverImageUrl: "", tags: "", published: false,
};

interface TextFieldConfig {
  key:         keyof Pick<BlogFormState, "title" | "slug" | "excerpt" | "tags">;
  label:       string;
  placeholder: string;
}

const TEXT_FIELDS: readonly TextFieldConfig[] = [
  { key: "title",         label: "Title *",           placeholder: "Post title" },
  { key: "slug",          label: "Slug *",            placeholder: "post-slug" },
  { key: "excerpt",       label: "Excerpt *",         placeholder: "2-3 sentence summary" },
  { key: "tags",          label: "Tags",              placeholder: "fastify, node, postgres (comma separated)" },
];

function slugify(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BlogDashboard(): ReactElement {
  const [tab, setTab]         = useState<Tab>("list");
  const [posts, setPosts]     = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editId, setEditId]   = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState<string>("");

  const [form, setForm]           = useState<BlogFormState>({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState<boolean>(false);
  const [saveErr, setSaveErr]     = useState<string>("");
  const [notifying, setNotifying] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [notice, setNotice] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState<boolean>(false);
  const [uploadCoverErr, setUploadCoverErr] = useState<string>("");
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    const res = (await adminApi.blog.list()) as ApiResponse<PostMeta[]>;
    if (res.ok) setPosts(res.data);
    setLoading(false);
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  const startNew = (): void => {
    setEditId(null);
    setAiDraft("");
    setForm({ ...EMPTY_FORM });
    setTab("new");
  };

  const startEdit = async (id: string): Promise<void> => {
    const res = (await adminApi.blog.get(id)) as ApiResponse<PostDetail>;
    if (!res.ok) return;
    const p: PostDetail = res.data;

    setEditId(id);
    setAiDraft("");
    setForm({
      title:         p.title,
      slug:          p.slug,
      excerpt:       p.excerpt,
      content:       p.content,
      coverImageUrl: p.coverImageUrl ?? "",
      tags:          p.tags.join(", "),
      published:     p.published,
    });
    setTab("edit");
  };

  const setField = <K extends keyof BlogFormState>(key: K, val: BlogFormState[K]): void => {
    setForm((prev: BlogFormState): BlogFormState => ({ ...prev, [key]: val }));
  };

  // Same signed direct-to-Cloudinary upload used by the Reviews dashboard
  // page's photo uploader (see apps/api/src/routes/uploads.routes.ts) —
  // replaces what used to be a plain "paste a URL" text field.
  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadCoverErr("Please select an image file.");
      e.target.value = "";
      return;
    }
    const MAX_COVER_BYTES = 8 * 1024 * 1024; // 8MB — a cover image can reasonably run bigger than an avatar
    if (file.size > MAX_COVER_BYTES) {
      setUploadCoverErr("That image is larger than 8MB — please use a smaller one.");
      e.target.value = "";
      return;
    }

    setUploadingCover(true);
    setUploadCoverErr("");
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

      const signParams = { folder: "blog" };
      const signRes = await adminApi.uploads.sign(signParams);
      if (!signRes.ok) {
        setUploadCoverErr(signRes.error ?? "Could not authorize the upload.");
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
        setField("coverImageUrl", data.secure_url as string);
      } else {
        setUploadCoverErr(data.error?.message ?? "Upload failed.");
      }
    } catch (err) {
      setUploadCoverErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  const handleFieldChange = (key: TextFieldConfig["key"]) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      if (key === "title") {
        const value: string = e.target.value;
        setForm((prev: BlogFormState): BlogFormState => ({
          ...prev,
          title: value,
          slug: editId ? prev.slug : slugify(value),
        }));
      } else {
        setField(key, e.target.value);
      }
    };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => setField("content", e.target.value);
  const handlePublishedChange = (e: ChangeEvent<HTMLInputElement>): void => setField("published", e.target.checked);

  const save = async (): Promise<void> => {
    setSaving(true);
    setSaveErr("");

    const payload = {
      title:         form.title,
      slug:          form.slug,
      excerpt:       form.excerpt,
      content:       form.content,
      published:     form.published,
      tags:          form.tags.split(",").map((t: string): string => t.trim()).filter(Boolean),
      coverImageUrl: form.coverImageUrl || null,
    };

    const res = (editId
      ? await adminApi.blog.update(editId, payload)
      : await adminApi.blog.create(payload)) as ApiResponse<PostDetail>;

    if (res.ok) {
      await load();
      setTab("list");
    } else {
      setSaveErr(res.error ?? "Save failed.");
    }
    setSaving(false);
  };

  const notify = async (id: string): Promise<void> => {
    setNotifying(true);
    // Bug fix: see the identical fix + comment in dashboard/projects/page.tsx —
    // this always claimed success before, regardless of the real result.
    const res = await adminApi.notify.send("BLOG", id);
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

  const del = async (id: string): Promise<void> => {
    await adminApi.blog.delete(id);
    await load();
    setPendingAction(null);
  };

  const togglePublish = async (post: PostMeta): Promise<void> => {
    await adminApi.blog.update(post.id, { ...post, published: !post.published, tags: post.tags });
    await load();
  };

  const insertDraft = (mdx: string): void => {
    setField("content", mdx);
    setAiDraft("");
  };

  const handleAiInsert = (mdx: string): void => {
    setAiDraft(mdx);
    setField("content", mdx);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-275 mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
            Dashboard
          </p>
          <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Blog</h1>
        </div>
        <div className="flex gap-2">
          {tab !== "list" && (
            <Button variant="secondary" onClick={(): void => setTab("list")}>
              ← Back
            </Button>
          )}
          {tab === "list" && <Button onClick={startNew}>+ New Post</Button>}
        </div>
      </div>

      {/* LIST */}
      {tab === "list" && (
        <div className="dash-panel overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<FileText size={32} strokeWidth={1.5} />}
              title="No posts yet"
              hint="Create your first post to see it here and on the blog."
              action={<Button size="sm" onClick={startNew} className="mt-1">Create Post</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-140 border-collapse text-[13px]">
              <thead>
                <tr style={{ background: "var(--raised)", borderBottom: "1px solid var(--rim)" }}>
                  {["Title", "Status", "Views", "Updated", ""].map((h: string): ReactElement => (
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
                {posts.map((p: PostMeta): ReactElement => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid var(--rim-sub)" }}
                    className="hover:bg-(--raised) transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: "var(--ink)" }}>{p.title}</p>
                      <p className="text-[11px] font-mono" style={{ color: "var(--ghost)" }}>{p.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(): void => { void togglePublish(p); }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                        style={{
                          background: p.published ? "var(--pos-bg)" : "var(--raised)",
                          color:      p.published ? "var(--pos-text)" : "var(--ghost)",
                          border:     `1px solid ${p.published ? "rgba(16,185,129,.3)" : "var(--rim)"}`,
                        }}
                      >
                        {p.published ? "● Published" : "○ Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "var(--dim)" }}>
                      {p.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[11px]" style={{ color: "var(--ghost)" }}>
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={(): void => { void startEdit(p.id); }}
                          className="text-[12px] font-semibold transition-opacity hover:opacity-70"
                          style={{ color: "var(--brand)" }}
                        >
                          Edit
                        </button>
                        {p.published && (
                          <button
                            type="button"
                            onClick={(): void => setPendingAction({ type: "notify", post: p })}
                            disabled={notifying}
                            className="text-[12px] transition-opacity hover:opacity-70"
                            style={{ color: "var(--indigo)" }}
                          >
                            {notifying ? "…" : "Notify"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(): void => setPendingAction({ type: "delete", post: p })}
                          className="text-[12px] transition-opacity hover:opacity-70"
                          style={{ color: "var(--ghost)" }}
                        >
                          Delete
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
      )}

      {/* EDITOR */}
      {(tab === "new" || tab === "edit") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="dash-panel p-5">
              <p className="font-semibold text-[16px] mb-4" style={{ color: "var(--ink)" }}>
                {editId ? "Edit Post" : "New Post"}
              </p>

              {TEXT_FIELDS.map(({ key, label, placeholder }: TextFieldConfig): ReactElement => (
                <div key={key} className="mb-3">
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={handleFieldChange(key)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none transition-all focus:border-(--brand)"
                    style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
                  />
                </div>
              ))}

              <div className="mb-3">
                <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--dim)" }}>Cover Image</label>
                {form.coverImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "var(--rim)" }}>
                    <img src={form.coverImageUrl} alt="Cover preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={(): void => setField("coverImageUrl", "")}
                      className="absolute top-2 right-2 p-1.5 rounded-lg"
                      style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                      aria-label="Remove cover image"
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
                    {uploadingCover ? "Uploading…" : "Upload cover image"}
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e): void => { void handleCoverUpload(e); }}
                      disabled={uploadingCover}
                    />
                  </label>
                )}
                {uploadCoverErr && (
                  <p className="text-[12px] mt-1.5" style={{ color: "#f87171" }}>{uploadCoverErr}</p>
                )}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input type="checkbox" checked={form.published} onChange={handlePublishedChange} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>Publish immediately</span>
              </label>
            </div>

            <div className="dash-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>MDX Content</p>
                {aiDraft && (
                  <Button size="sm" onClick={(): void => insertDraft(aiDraft)}>
                    ← Insert AI Draft
                  </Button>
                )}
              </div>
              <textarea
                value={form.content}
                onChange={handleContentChange}
                rows={16}
                className="w-full px-4 py-3 rounded-xl border text-[12px] font-mono leading-[1.7] outline-none transition-all
                  focus:border-(--brand) resize-y"
                style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
                placeholder="## Your post content in MDX…"
              />
            </div>

            {saveErr && (
              <p
                className="text-[12px] px-4 py-3 rounded-xl"
                style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
              >
                {saveErr}
              </p>
            )}

            <Button
              onClick={(): void => { void save(); }}
              disabled={!form.title || !form.content}
              loading={saving}
              size="lg"
            >
              {saving ? "Saving…" : editId ? "Update Post" : "Create Post"}
            </Button>
          </div>

          <div className="dash-panel p-5 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--brand)" }} />
              <p className="font-semibold text-[16px]" style={{ color: "var(--ink)" }}>AI Blog Writer</p>
            </div>
            <AiBlogWriter onInsert={handleAiInsert} />
          </div>
        </div>
      )}
      {notice && <p role="status" className="fixed right-6 bottom-6 z-50 max-w-sm rounded-xl px-4 py-3 text-[13px] shadow-lg" style={{ background: "var(--raised)", color: "var(--ink)", border: "1px solid var(--rim)" }}>{notice}</p>}
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === "delete" ? "Delete this post?" : "Notify all subscribers?"}
        description={pendingAction?.type === "delete" ? "This permanently removes the post and cannot be undone." : "Every active subscriber will receive an email about this post."}
        confirmLabel={pendingAction?.type === "delete" ? "Delete post" : "Send notification"}
        loading={notifying}
        onClose={() => setPendingAction(null)}
        onConfirm={() => { if (!pendingAction) return; if (pendingAction.type === "delete") void del(pendingAction.post.id); else void notify(pendingAction.post.id); }}
      />
    </div>
  );
}
