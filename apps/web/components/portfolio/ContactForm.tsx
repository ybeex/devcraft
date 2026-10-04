"use client";

import { useState, type FormEvent, type ChangeEvent, type ReactNode, type ReactElement } from "react";
import { ZaureArch } from "@/components/hausa";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface FormState {
  name:    string;
  email:   string;
  subject: string;
  message: string;
  website: string; // honeypot — never shown to user
}

type FormErrors = Partial<Record<keyof FormState, string>>;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface ContactApiResponse {
  ok:    boolean;
  error?: string;
}

const SUBJECTS: readonly string[] = [
  "Hiring inquiry",
  "Freelance / contract project",
  "Technical collaboration",
  "Speaking / mentorship",
  "General question",
  "Other",
];

const EMPTY_FORM: FormState = { name: "", email: "", subject: "", message: "", website: "" };

// ── FIELD ─────────────────────────────────────────────────────────────────────

interface FieldProps {
  id:        string;
  label:     string;
  error?:    string;
  children:  ReactNode;
  required?: boolean;
}

function Field({ id, label, error, children, required }: FieldProps): ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] font-semibold" style={{ color: "var(--dim)" }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: "var(--brand)" }}>*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="text-[11px]" role="alert" style={{ color: "var(--neg-text)" }}>{error}</p>}
    </div>
  );
}

const inputClass: string =
  "w-full px-4 py-3 rounded-xl border text-[14px] outline-none transition-all duration-200 " +
  "focus:border-(--brand) focus:ring-2 focus:ring-(--brand-muted) disabled:opacity-50";

const inputStyle = {
  background:  "var(--raised)",
  borderColor: "var(--rim)",
  color:       "var(--ink)",
} as const;

// ── VALIDATION ────────────────────────────────────────────────────────────────

const EMAIL_RE: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim().length < 2)      errors.name    = "Please enter your name.";
  if (!EMAIL_RE.test(form.email))       errors.email   = "Please enter a valid email.";
  if (form.subject.trim().length < 3)   errors.subject = "Please choose or enter a subject.";
  if (form.message.trim().length < 10)  errors.message = "Please write at least 10 characters.";
  if (form.message.length > 4000)       errors.message = "Please keep your message under 4,000 characters.";
  return errors;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function ContactForm(): ReactElement {
  const [form, setForm]     = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string>("");

  type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

  const change = (field: keyof FormState) =>
    (e: FieldChangeEvent): void => {
      const nextValue: string = e.target.value;
      setForm((prev: FormState): FormState => ({ ...prev, [field]: nextValue }));
      if (errors[field]) {
        setErrors((prev: FormErrors): FormErrors => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (status === "submitting") return;

    const validationErrors: FormErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    setServerError("");

    const res: ContactApiResponse = (await api.contact({
      name:    form.name.trim(),
      email:   form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      website: form.website, // honeypot
    })) as ContactApiResponse;

    if (res.ok) {
      setStatus("success");
      setForm(EMPTY_FORM);
    } else {
      setStatus("error");
      setServerError(res.error ?? "Something went wrong. Please try again.");
    }
  };

  // ── SUCCESS STATE ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-12 px-6 text-center">
        <div className="opacity-40">
          <ZaureArch size={120} />
        </div>
        <div>
          <p className="font-display font-bold text-[24px] mb-2" style={{ color: "var(--ink)" }}>
            Message received.
          </p>
          <p className="text-[14px] leading-[1.7]" style={{ color: "var(--dim)" }}>
            I read every message personally. I'll be in touch soon — usually within a couple of days.
          </p>
        </div>
        <button
          type="button"
          onClick={(): void => setStatus("idle")}
          className="text-[13px] font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "var(--brand)" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  const busy: boolean = status === "submitting";

  return (
    <form onSubmit={(e): void => { void handleSubmit(e); }} noValidate className="flex flex-col gap-5">
      {/* Honeypot — hidden from real users, bots fill it in.
          NOTE: previously named "website" and hidden only via off-screen
          absolute positioning (left: -9999px). That combination is a known
          false-positive trap: Chrome/Firefox and password managers (LastPass,
          1Password, etc.) specifically autofill fields named "website" with
          a saved company/site URL, and their autofill heuristics don't
          reliably skip fields that are merely positioned off-screen — only
          ones that are `display: none` or `type="hidden"`. A real visitor
          with autofill enabled would silently trip this check: the backend
          honeypot branch returns a fake "success" response without ever
          writing the message to the database, so it never appears in the
          inbox even though the sender saw "Message received."
          Fixed by (a) using a name that doesn't match any browser autofill
          heuristic, (b) hiding via display:none so autofill engines skip it
          outright, and (c) opting out of known password-manager autofill
          explicitly. */}
      <input
        type="text"
        name="dc_extra_note"
        id="dc_extra_note"
        value={form.website}
        onChange={change("website")}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
        style={{ display: "none" }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="contact-name" label="Name" error={errors.name} required>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={change("name")}
            placeholder="Ada Okafor"
            disabled={busy}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email} required>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={change("email")}
            placeholder="ada@company.com"
            disabled={busy}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass}
            style={inputStyle}
          />
        </Field>
      </div>

      <Field id="contact-subject" label="Subject" error={errors.subject} required>
        <select
          id="contact-subject"
          value={form.subject}
          onChange={change("subject")}
          disabled={busy}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          className={inputClass}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">Select a subject…</option>
          {SUBJECTS.map((s: string): ReactElement => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>

      <Field id="contact-message" label="Message" error={errors.message} required>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={change("message")}
          placeholder="Tell me about your project, role, or question. The more context, the better."
          rows={6}
          maxLength={4000}
          disabled={busy}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : "contact-message-count"}
          className={`${inputClass} resize-y`}
          style={{ ...inputStyle, lineHeight: 1.7 }}
        />
        <p
          id="contact-message-count"
          className="text-[11px] text-right"
          aria-live="polite"
          style={{ color: form.message.length > 3800 ? "var(--neg-text)" : "var(--ghost)" }}
        >
          {form.message.length} / 4000
        </p>
      </Field>

      {status === "error" && serverError && (
        <p
          role="alert"
          className="text-[13px] px-4 py-3 rounded-xl"
          style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
        >
          {serverError}
        </p>
      )}

      <Button type="submit" loading={busy} fullWidth size="lg">
        {busy ? "Sending…" : "Send message →"}
      </Button>

      <p className="text-[12px] text-center" style={{ color: "var(--ghost)" }}>
        No spam, no unsolicited replies. I read every message personally.
      </p>
    </form>
  );
}
