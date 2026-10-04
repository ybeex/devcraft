import { LaujeSpinner } from "@/components/hausa";
import Link from "next/link";
import { buttonClassName, buttonStyle } from "@/components/ui/buttonStyles";

export default function UnsubscribedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--canvas)" }}>
      <LaujeSpinner size={48} color="var(--brand)" />
      <h1 className="font-display font-bold text-[32px] mt-6 mb-3" style={{ color: "var(--ink)" }}>
        You've been unsubscribed.
      </h1>
      <p className="text-[16px] leading-[1.7] max-w-100 mb-8" style={{ color: "var(--dim)" }}>
        No hard feelings. You won't receive any more emails from DevCraft.
        You can always re-subscribe from the homepage if you change your mind.
      </p>
      <Link href="/" className={buttonClassName("md", false, "no-underline")} style={buttonStyle("primary")}>
        ← Back to portfolio
      </Link>
    </main>
  );
}
