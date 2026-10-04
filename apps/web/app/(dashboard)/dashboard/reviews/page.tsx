"use client";

import { useEffect, useState, useCallback, useRef, type ChangeEvent, type ReactElement } from "react";
import { Star, Trash2, Upload, ExternalLink } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingRow } from "@/components/dashboard/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Review, ReviewRelation, ApiResponse } from "@devcraft/types";

type Tab = "list" | "new";

interface ReviewFormState {
  name:         string;
  role:         string;
  company:      string;
  quote:        string;
  rating:       number;
  initials:     string;
  photoUrl:     string;
  linkedinUrl:  string;
  relation:     ReviewRelation;
  published:    boolean;
  displayOrder: number;
}

const EMPTY_FORM: ReviewFormState = {
  name: "", role: "", company: "", quote: "",
  rating: 5, initials: "", photoUrl: "", linkedinUrl: "",
  relation: "COLLEAGUE", published: true, displayOrder: 0,
};

const RELATION_LABELS: Record<ReviewRelation, string> = {
  TEAM: "Team / Internship",
  CLIENT: "Client",
  COLLEAGUE: "Colleague",
};

const RELATION_OPTIONS: readonly ReviewRelation[] = ["TEAM", "CLIENT", "COLLEAGUE"];

function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string): string => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ReviewsDashboard(): ReactElement {
  const [tab, setTab]         = useState<Tab>("list");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm]       = useState<ReviewFormState>({ ...EMPTY_FORM });
  const [saving, setSaving]   = useState<boolean>(false);
  const [saveErr, setSaveErr] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadErr, setUploadErr] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    const res = (await adminApi.reviews.list()) as ApiResponse<Review[]>;
    if (res.ok) setReviews(res.data);
    setLoading(false);
  }, []);

  useEffect((): void => {
    void load();
  }, [load]);

  const startNew = (): void => {
    setForm({ ...EMPTY_FORM });
    setSaveErr("");
    setUploadErr("");
    setTab("new");
  };

  const setField = <K extends keyof ReviewFormState>(key: K, val: ReviewFormState[K]): void => {
    setForm((prev: ReviewFormState): ReviewFormState => ({ ...prev, [key]: val }));
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    setForm((prev: ReviewFormState): ReviewFormState => ({
      ...prev,
      name: value,
      // Only auto-fill initials while the reviewer hasn't typed their own —
      // once they touch that field directly, stop overwriting it.
      initials: prev.initials === initialsFromName(prev.name) ? initialsFromName(value) : prev.initials,
    }));
  };

  // Same direct-to-Cloudinary unsigned upload used by the settings page's
  // CV uploader — the file goes straight from the browser to Cloudinary,
  // and only the resulting URL ever reaches our own API (see
  // apps/api/src/routes/reviews.routes.ts).
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    // Bug fix: neither an image-type nor a file-size check existed here
    // at all before attempting the upload, unlike the CV uploader's
    // equivalent checks — a non-image file would just fail late (after a
    // full upload round-trip) with Cloudinary's own generic error, and an
    // oversized image had no early warning either.
    if (!file.type.startsWith("image/")) {
      setUploadErr("Please select an image file.");
      e.target.value = "";
      return;
    }
    const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB — plenty for a headshot
    if (file.size > MAX_PHOTO_BYTES) {
      setUploadErr("That image is larger than 5MB — please use a smaller one.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadErr("");
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

      // Security fix: signed upload instead of the old unsigned-preset
      // one — see apps/api/src/routes/uploads.routes.ts.
      const signParams = { folder: "reviews" };
      const signRes = await adminApi.uploads.sign(signParams);
      if (!signRes.ok) {
        setUploadErr(signRes.error ?? "Could not authorize the upload.");
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
        setField("photoUrl", data.secure_url as string);
      } else {
        setUploadErr(data.error?.message ?? "Upload failed.");
      }
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      // Bug fix: this never reset the input's value, so selecting the
      // exact same file twice in a row (e.g. Remove, then re-add the same
      // photo) silently did nothing the second time — file inputs only
      // fire onChange when the selection actually changes, and the
      // browser considers re-picking an identical file "unchanged".
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async (): Promise<void> => {
    if (!form.name.trim() || !form.quote.trim() || !form.initials.trim()) {
      setSaveErr("Name, quote, and initials are required.");
      return;
    }

    setSaving(true);
    setSaveErr("");

    const payload = {
      name:         form.name,
      role:         form.role || null,
      company:      form.company || null,
      quote:        form.quote,
      rating:       form.rating,
      initials:     form.initials,
      photoUrl:     form.photoUrl || null,
      linkedinUrl:  form.linkedinUrl || null,
      relation:     form.relation,
      published:    form.published,
      displayOrder: form.displayOrder,
    };

    const res = (await adminApi.reviews.create(payload)) as ApiResponse<Review>;
    if (res.ok) {
      await load();
      setTab("list");
    } else {
      setSaveErr(res.error ?? "Save failed.");
    }
    setSaving(false);
  };

  const del = async (id: string): Promise<void> => {
    setDeleting(true);
    await adminApi.reviews.delete(id);
    await load();
    setDeleting(false);
    setDeleteTarget(null);
  };

  const togglePublished = async (r: Review): Promise<void> => {
    await adminApi.reviews.update(r.id, { published: !r.published });
    await load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-225 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
            Dashboard
          </p>
          <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Reviews</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--ghost)" }}>
            The homepage's Social Proof section shows the placeholder testimonials until at
            least one real review exists here — then those take over automatically.
          </p>
        </div>
        <div className="flex gap-2">
          {tab !== "list" && (
            <Button variant="secondary" onClick={(): void => setTab("list")}>
              ← Back
            </Button>
          )}
          {tab === "list" && <Button onClick={startNew}>+ Add Review</Button>}
        </div>
      </div>

      {/* LIST */}
      {tab === "list" && (
        <>
          {loading ? (
            <LoadingRow label="Loading reviews…" />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={<Star size={32} strokeWidth={1.5} />}
              title="No reviews yet"
              hint="The homepage is showing placeholder testimonials until you add your first real one above."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r: Review) => (
                <div
                  key={r.id}
                  className="dash-panel flex items-start gap-4 p-4"
                  style={{ opacity: r.published ? 1 : 0.55 }}
                >
                  <div
                    className="shrink-0 w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-display font-bold text-[13px]"
                    style={{ background: "var(--raised)", color: "var(--brand)" }}
                  >
                    {r.photoUrl ? (
                      <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      r.initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>{r.name}</p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--brand-muted)", color: "var(--brand)" }}>
                        {RELATION_LABELS[r.relation]}
                      </span>
                      {!r.published && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--raised)", color: "var(--ghost)" }}>
                          Hidden
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 ml-auto">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < r.rating ? "var(--brand)" : "none"}
                            color="var(--brand)"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--ghost)" }}>
                      {[r.role, r.company].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="text-[13px] mt-2 italic line-clamp-2" style={{ color: "var(--dim)" }}>
                      "{r.quote}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {r.linkedinUrl && (
                      <a
                        href={r.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:opacity-70"
                        style={{ color: "var(--ghost)" }}
                        aria-label="Open LinkedIn"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(): void => { void togglePublished(r); }}
                      className="text-[11px] px-2 py-1 rounded-lg border font-semibold"
                      style={{ borderColor: "var(--rim)", color: "var(--dim)" }}
                    >
                      {r.published ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={(): void => setDeleteTarget(r)}
                      className="p-2 rounded-lg hover:opacity-70"
                      style={{ color: "#f87171" }}
                      aria-label="Delete review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* NEW */}
      {tab === "new" && (
        <div className="dash-panel p-6 flex flex-col gap-5">
          {/* Photo upload */}
          <div>
            <label className="block text-[12px] font-semibold mb-2" style={{ color: "var(--dim)" }}>Photo (optional)</label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 border"
                style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--brand)" }}
              >
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-[16px]">{form.initials || "?"}</span>
                )}
              </div>
              <label
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold cursor-pointer hover:opacity-80"
                style={{ borderColor: "var(--rim)", color: "var(--ink)", background: "var(--raised)" }}
              >
                <Upload size={14} />
                {uploading ? "Uploading…" : "Upload photo"}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e): void => { void handlePhotoUpload(e); }} disabled={uploading} />
              </label>
              {form.photoUrl && (
                <button
                  type="button"
                  onClick={(): void => setField("photoUrl", "")}
                  className="text-[12px] underline"
                  style={{ color: "var(--ghost)" }}
                >
                  Remove
                </button>
              )}
            </div>
            {uploadErr && <p className="text-[12px] mt-2" style={{ color: "#f87171" }}>{uploadErr}</p>}
            <p className="text-[11px] mt-2" style={{ color: "var(--ghost)" }}>
              No photo? The reviewer's initials are shown instead — nothing else changes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Aisha Musa"
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Initials *</label>
              <input
                type="text"
                value={form.initials}
                onChange={(e): void => setField("initials", e.target.value.toUpperCase().slice(0, 4))}
                placeholder="AM"
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e): void => setField("role", e.target.value)}
                placeholder="Product Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e): void => setField("company", e.target.value)}
                placeholder="Paystack"
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Relation</label>
              <select
                value={form.relation}
                onChange={(e): void => setField("relation", e.target.value as ReviewRelation)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              >
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{RELATION_LABELS[opt]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>LinkedIn URL</label>
              <input
                type="text"
                value={form.linkedinUrl}
                onChange={(e): void => setField("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Quote *</label>
            <textarea
              value={form.quote}
              onChange={(e): void => setField("quote", e.target.value)}
              placeholder="What they said, word for word…"
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border text-[14px] resize-y"
              style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Rating</label>
              <div className="flex items-center gap-1 py-2.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(): void => setField("rating", i + 1)}
                  >
                    <Star size={20} fill={i < form.rating ? "var(--brand)" : "none"} color="var(--brand)" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>Display order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e): void => setField("displayOrder", Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border text-[14px]"
                style={{ borderColor: "var(--rim)", background: "var(--raised)", color: "var(--ink)" }}
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e): void => setField("published", e.target.checked)}
                />
                Published (visible on the site)
              </label>
            </div>
          </div>

          {saveErr && <p className="text-[13px]" style={{ color: "#f87171" }}>{saveErr}</p>}

          <div className="flex gap-3">
            <Button onClick={(): void => { void save(); }} disabled={uploading} loading={saving}>
              Save review
            </Button>
            <Button variant="secondary" onClick={(): void => setTab("list")}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this review?"
        description="This removes the review from the dashboard and it can no longer appear on the portfolio."
        confirmLabel="Delete review"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void del(deleteTarget.id); }}
      />
    </div>
  );
}
