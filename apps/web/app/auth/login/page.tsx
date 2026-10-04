"use client";

import { useState, type FormEvent, type ChangeEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { adminApi, setToken } from "@/lib/api";
import { ZaureArch } from "@/components/hausa";
import { LogoMark } from "@/components/ui/LogoMark";
import { Button } from "@/components/ui/Button";

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail]     = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError]     = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await adminApi.auth.login(email, password);

    if (res.ok) {
      setToken(res.data.accessToken);
      router.push("/dashboard");
    } else {
      setError(res.error ?? "Invalid credentials.");
      setLoading(false);
    }
  };

  const handleEmailChange    = (e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--canvas)" }}
    >
      <div className="absolute inset-0 sawaki-bg opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-95">
        <div className="flex justify-center mb-6 opacity-30">
          <ZaureArch size={160} />
        </div>

        <div className="dash-panel p-8" style={{ boxShadow: "var(--elevation-2)" }}>
          <div className="flex items-center gap-3 mb-7">
            <LogoMark size={40} />
            <div>
              <p className="font-display font-bold text-[18px]" style={{ color: "var(--ink)" }}>DevCraft</p>
              <p className="text-[11px]" style={{ color: "var(--ghost)" }}>Dashboard Login</p>
            </div>
          </div>

          <form onSubmit={(e): void => { void handleSubmit(e); }} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl text-[14px] border outline-none transition-all
                  focus:border-(--brand) focus:ring-2 focus:ring-(--brand-muted)"
                style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--dim)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••••"
                className="w-full px-4 py-3 rounded-xl text-[14px] border outline-none transition-all
                  focus:border-(--brand) focus:ring-2 focus:ring-(--brand-muted)"
                style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--ink)" }}
              />
            </div>

            {error && (
              <p
                className="text-[12px] px-3 py-2 rounded-lg"
                style={{ background: "var(--neg-bg)", color: "var(--neg-text)" }}
              >
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
              Sign in →
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] mt-4" style={{ color: "var(--ghost)" }}>
          ← <a href="/" className="hover:underline" style={{ color: "var(--brand)" }}>Back to portfolio</a>
        </p>
      </div>
    </main>
  );
}
