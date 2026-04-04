"use client";

import { useState, useCallback } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Login failed. Check your credentials.");
          return;
        }
        router.push("/");
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-[#1a1a1b] p-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 50%, rgba(58,138,175,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(223,120,37,0.06) 0%, transparent 60%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3A8AAF] to-[#2d7a9f] shadow-lg shadow-[rgba(58,138,175,0.3)]">
            <span className="text-2xl font-black text-white">Y</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Yallai</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
          style={{ background: "rgba(37,37,38,0.85)" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#9CA3AF]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[rgba(58,138,175,0.6)] focus:ring-1 focus:ring-[rgba(58,138,175,0.3)] transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-[#9CA3AF]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/25 outline-none focus:border-[rgba(58,138,175,0.6)] focus:ring-1 focus:ring-[rgba(58,138,175,0.3)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#3A8AAF] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2d7a9f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/20">
          Yallai — AI coding workspace
        </p>
      </div>
    </div>
  );
}
