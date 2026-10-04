"use client";

import { useEffect, useState, useRef, type ChangeEvent, type ReactElement } from "react";
import { Check, FileText, Sparkles, Upload } from "lucide-react";
import { adminApi } from "@/lib/api";
import { callAI, type CallResult } from "@/lib/models";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { ApiResponse, SiteSettings, SiteSettingsInput } from "@devcraft/types";

interface SiteConfigField {
  label:       string;
  placeholder: string;
  key:         keyof SiteSettingsInput;
}

const SITE_CONFIG_FIELDS: readonly SiteConfigField[] = [
  { label: "Display Name",        placeholder: "Your full name",                   key: "name" },
  { label: "Hero Tagline",        placeholder: "Full-stack engineer. Ex-tailor.",   key: "tagline" },
  { label: "Availability Status", placeholder: "Open to new roles · Remote-first", key: "availability" },
  { label: "GitHub URL",          placeholder: "https://github.com/…",             key: "githubUrl" },
  { label: "LinkedIn URL",        placeholder: "https://linkedin.com/in/…",        key: "linkedinUrl" },
  { label: "Twitter / X URL",     placeholder: "https://twitter.com/…",            key: "twitterUrl" },
  { label: "Email Address",       placeholder: "hello@yourdomain.com",             key: "email" },
  { label: "CV URL",              placeholder: "/cv.pdf or https://…",             key: "cvUrl" },
];

const EMPTY_SETTINGS: SiteSettingsInput = {
  name: "", tagline: "", availability: "", githubUrl: "", linkedinUrl: "", twitterUrl: "", email: "", cvUrl: "/cv.pdf",
};

const BIO_SYSTEM_PROMPT_TEMPLATE = (context: string): string => `Write a compelling 3-paragraph "About Me" bio for a developer portfolio.
Context: ${context}
Requirements: First person, honest, warm. Mention math background, tailoring background, and self-taught coding journey.
Keep each paragraph under 60 words.`;

interface CompleteResponseData {
  content: string;
}

export default function SettingsPage(): ReactElement {
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved]   = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<SiteSettingsInput>(EMPTY_SETTINGS);
  const [settingsError, setSettingsError] = useState<string>("");

  const [bioPrompt, setBioPrompt]   = useState<string>("");
  const [genBio, setGenBio]         = useState<string>("");
  const [genLoading, setGenLoading] = useState<boolean>(false);

  // CV Upload state
  const [uploadingCv, setUploadingCv] = useState<boolean>(false);
  const [cvMsg, setCvMsg]             = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const generateBio = async (): Promise<void> => {
    if (!bioPrompt.trim()) return;
    setGenLoading(true);

    const res: CallResult<CompleteResponseData> = await callAI<CompleteResponseData>("/ai/complete", {
      prompt:    BIO_SYSTEM_PROMPT_TEMPLATE(bioPrompt),
      model:     "openai/gpt-4o-mini",
      maxTokens: 400,
    });

    if (res.ok && res.data) {
      setGenBio(res.data.content);
    }
    setGenLoading(false);
  };

  const handleBioPromptChange = (e: ChangeEvent<HTMLTextAreaElement>): void => setBioPrompt(e.target.value);

  useEffect((): void => {
    const loadSettings = async (): Promise<void> => {
      const res = (await adminApi.settings.get()) as ApiResponse<SiteSettings>;
      if (res.ok) {
        const { id: _id, updatedAt: _updatedAt, ...data } = res.data;
        setSettings({
          name:         data.name ?? "",
          tagline:      data.tagline ?? "",
          availability: data.availability ?? "",
          githubUrl:    data.githubUrl ?? "",
          linkedinUrl:  data.linkedinUrl ?? "",
          twitterUrl:   data.twitterUrl ?? "",
          email:        data.email ?? "",
          cvUrl:        data.cvUrl ?? "/cv.pdf",
        });
      } else {
        setSettingsError(res.error ?? "Unable to load settings.");
      }
      setLoading(false);
    };
    void loadSettings();
  }, []);

  const copyBio = (): void => {
    void navigator.clipboard.writeText(genBio);
  };

  const handleSettingsChange = (key: keyof SiteSettingsInput) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setSettings((current: SiteSettingsInput): SiteSettingsInput => ({ ...current, [key]: e.target.value }));
    };

  const handleSaveSettings = async (): Promise<void> => {
    setSaving(true);
    setSettingsError("");
    const res = (await adminApi.settings.update(settings)) as ApiResponse<SiteSettings>;
    if (res.ok) {
      setSaving(false);
      setSaved(true);
      setTimeout((): void => setSaved(false), 2000);
    } else {
      setSettingsError(res.error ?? "Unable to save settings.");
      setSaving(false);
    }
  };

  const handleCvFileUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Bug fix: this only checked the filename extension, which is
    // trivially wrong — renaming any file to end in ".pdf" passed. Also
    // checking the browser-reported MIME type catches the common case of
    // an honest mistake (picking the wrong file) without being a false
    // sense of real security (a MIME type is still just a client-supplied
    // label) — it's a UX safeguard, not a trust boundary.
    const isPdf = file.name.toLowerCase().endsWith(".pdf") && file.type === "application/pdf";
    if (!isPdf) {
      setCvMsg({ type: "error", text: "Please select a valid .pdf file." });
      return;
    }

    // Bug fix: there was no size check at all before attempting the
    // upload — a wrong/huge file selected by mistake would sit uploading
    // for a long time before Cloudinary (or the network) eventually
    // rejected it, with no early feedback.
    const MAX_CV_BYTES = 10 * 1024 * 1024; // 10MB — generous for a resume PDF
    if (file.size > MAX_CV_BYTES) {
      setCvMsg({ type: "error", text: "That PDF is larger than 10MB — please use a smaller file." });
      return;
    }

    setUploadingCv(true);
    setCvMsg(null);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

      // Security fix: this used to be an unsigned upload authorized only
      // by a preset name that's necessarily public (it ships in the
      // client bundle) — see apps/api/src/routes/uploads.routes.ts for
      // the full explanation. Getting a real signature here requires a
      // valid admin session, so an attacker who's merely read the preset
      // name out of devtools can no longer upload anything with it.
      const signParams = { public_id: "Yusuf_Bashir_Nayaya_CV", overwrite: true };
      const signRes = await adminApi.uploads.sign(signParams);
      if (!signRes.ok) {
        setCvMsg({ type: "error", text: signRes.error ?? "Could not authorize the upload." });
        return;
      }
      const { signature, timestamp, apiKey } = signRes.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("public_id", signParams.public_id);
      formData.append("overwrite", String(signParams.overwrite));

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.secure_url) {
        const newCvUrl = data.secure_url;
        const updatedSettings = { ...settings, cvUrl: newCvUrl };
        setSettings(updatedSettings);

        await adminApi.settings.update(updatedSettings);
        setCvMsg({ type: "success", text: "CV uploaded to Cloudinary as Yusuf_Bashir_Nayaya_CV.pdf & settings updated!" });
      } else {
        setCvMsg({ type: "error", text: data.error?.message ?? "Cloudinary upload failed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "CV upload failed";
      setCvMsg({ type: "error", text: msg });
    } finally {
      setUploadingCv(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-190 mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
          Dashboard
        </p>
        <h1 className="font-display font-bold text-[28px]" style={{ color: "var(--ink)" }}>Settings</h1>
      </div>

      {/* CV Upload */}
      <div className="dash-panel p-6 mb-5">
        <h3 className="font-semibold text-[16px] mb-1" style={{ color: "var(--ink)" }}>CV / Resume</h3>
        <p className="text-[13px] mb-4" style={{ color: "var(--ghost)" }}>
          Upload PDF directly to Cloudinary as <code className="font-mono font-bold" style={{ color: "var(--brand)" }}>Yusuf_Bashir_Nayaya_CV.pdf</code> or set custom URL.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => void handleCvFileUpload(e)}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: "var(--raised)", borderColor: "var(--rim)" }}
          >
            <FileText size={20} strokeWidth={1.8} aria-hidden="true" />
            <input
              value={settings.cvUrl ?? ""}
              onChange={handleSettingsChange("cvUrl")}
              placeholder="/cv.pdf or https://…"
              disabled={loading || uploadingCv}
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            loading={uploadingCv}
            icon={<Upload size={16} />}
          >
            {uploadingCv ? "Uploading CV…" : "Upload PDF"}
          </Button>

          <ButtonLink
            href={settings.cvUrl || "/cv.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="text-center"
          >
            View current
          </ButtonLink>
        </div>

        {cvMsg && (
          <p
            className={`text-[12px] p-3 rounded-xl font-medium ${
              cvMsg.type === "success" ? "bg-(--pos-bg) text-(--pos-text)" : "bg-(--neg-bg) text-(--neg-text)"
            }`}
          >
            {cvMsg.text}
          </p>
        )}
      </div>

      {/* AI Bio Generator */}
      <div className="dash-panel p-6 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--brand)" }} />
          <h3 className="font-semibold text-[16px]" style={{ color: "var(--ink)" }}>AI Bio Generator</h3>
        </div>
        <p className="text-[13px] mb-4" style={{ color: "var(--ghost)" }}>
          Paste rough notes about yourself → get a polished 3-paragraph portfolio bio.
        </p>
        <textarea
          value={bioPrompt}
          onChange={handleBioPromptChange}
          rows={3}
          placeholder="e.g. Maths grad from Kano. Ex-tailor. Taught myself to code. Built 2 SaaS apps…"
          className="w-full px-4 py-3 rounded-xl border text-[13px] outline-none transition-all
            focus:border-(--brand) resize-y mb-3"
          style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
        />
        <Button
          onClick={(): void => { void generateBio(); }}
          disabled={!bioPrompt.trim()}
          loading={genLoading}
        >
          Generate Bio
        </Button>
        {genBio && (
          <div className="mt-4 p-4 rounded-xl border" style={{ background: "var(--raised)", borderColor: "var(--rim)" }}>
            <p className="text-[12.5px] leading-[1.75] whitespace-pre-wrap mb-3" style={{ color: "var(--ink)" }}>
              {genBio}
            </p>
            <Button size="sm" variant="secondary" onClick={copyBio}>
              Copy text
            </Button>
          </div>
        )}
      </div>

      {/* Site config */}
      <div className="dash-panel p-6 mb-5">
        <h3 className="font-semibold text-[16px] mb-4" style={{ color: "var(--ink)" }}>Site Configuration</h3>
        {SITE_CONFIG_FIELDS.map(({ label, placeholder, key }: SiteConfigField): ReactElement => (
          <div key={key} className="mb-4">
            <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>{label}</label>
            <input
              value={settings[key] ?? ""}
              onChange={handleSettingsChange(key)}
              placeholder={placeholder}
              disabled={loading || saving}
              className="w-full px-4 py-2.5 rounded-xl border text-[13px] outline-none transition-all focus:border-(--brand)"
              style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
            />
          </div>
        ))}
        <Button
          onClick={(): void => { void handleSaveSettings(); }}
          disabled={loading}
          loading={saving}
          size="lg"
          style={saved ? { background: "#10b981", borderColor: "#10b981", color: "#fff" } : undefined}
          icon={saved && <Check size={15} aria-hidden="true" />}
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </Button>
        {settingsError && <p className="mt-3 text-[12px]" style={{ color: "var(--neg-text)" }}>{settingsError}</p>}
      </div>

      {/* Hash generator helper */}
      <div className="dash-panel p-6">
        <h3 className="font-semibold text-[16px] mb-1" style={{ color: "var(--ink)" }}>Password Hash Tool</h3>
        <p className="text-[13px] mb-3" style={{ color: "var(--ghost)" }}>
          Run this in your terminal to generate the bcrypt hash for{" "}
          <code className="font-mono text-[12px] px-1.5 py-0.5 rounded" style={{ background: "var(--raised)", color: "var(--brand)" }}>
            ADMIN_PASSWORD_HASH
          </code>:
        </p>
        <pre className="px-4 py-3 rounded-xl text-[12px] font-mono overflow-x-auto" style={{ background: "#14192b", color: "#c9cfe8" }}>
          {`node -e "require('bcryptjs').hash('yourpassword',12).then(console.log)"`}
        </pre>
      </div>
    </div>
  );
}
