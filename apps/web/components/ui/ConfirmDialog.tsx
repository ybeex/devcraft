"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** A small, reusable confirmation surface for irreversible dashboard work. */
export function ConfirmDialog({ open, title, description, confirmLabel, loading, onConfirm, onClose }: ConfirmDialogProps): ReactElement | null {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button type="button" aria-label="Close confirmation" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} disabled={loading} />
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="relative w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--glass-bg-strong)", borderColor: "var(--glass-border)", boxShadow: "var(--elevation-3)", backdropFilter: "var(--glass-blur)" }}>
        <button type="button" aria-label="Close confirmation" onClick={onClose} disabled={loading} className="absolute right-4 top-4 p-2 rounded-lg hover:opacity-70" style={{ color: "var(--ghost)" }}><X size={16} /></button>
        <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--neg-text)" }}>Confirm action</p>
        <h2 id="confirm-dialog-title" className="font-display text-[22px] font-bold leading-tight pr-8" style={{ color: "var(--ink)" }}>{title}</h2>
        <p id="confirm-dialog-description" className="text-[14px] leading-[1.7] mt-3" style={{ color: "var(--dim)" }}>{description}</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-7">
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
