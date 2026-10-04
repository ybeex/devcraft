import type { ReactElement } from "react";
import { LaujeSpinner, SawakiBg } from "@/components/hausa";

export function PageLoading(): ReactElement {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--canvas)" }}
      role="status"
      aria-label="Loading page"
    >
      <SawakiBg className="opacity-40" />
      <LaujeSpinner size={48} color="var(--brand)" spin />
    </div>
  );
}