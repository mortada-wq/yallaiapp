"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already signed in, bounce to /admin
    const check = async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        if (r.ok) {
          router.replace("/admin");
          return;
        }
      } catch {
        // ignore
      }
      setChecking(false);
    };
    void check();
  }, [router]);

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (checking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0b0c0d]">
        <Loader2 className="h-6 w-6 animate-spin text-sahib-ocean" />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-[100dvh] items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(1200px 600px at -10% -20%, rgba(58,138,175,0.18) 0%, transparent 60%), radial-gradient(900px 600px at 120% 110%, rgba(223,120,37,0.14) 0%, transparent 55%), linear-gradient(180deg, #0f1114 0%, #0a0b0d 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="font-aref text-5xl font-bold text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #3A8AAF 0%, #DF7825 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            صاحب يلا
          </h1>
          <p className="mt-2 text-sm text-white/50">لوحة الإدارة</p>
        </div>

        <div
          className="rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
          style={{ background: "rgba(18,19,22,0.85)" }}
        >
          <p className="mb-4 text-center text-sm text-white/60">
            سجّل الدخول بحساب Google المعتمَد للوصول إلى لوحة الإدارة.
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            data-testid="login-google-btn"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1f1f1f] transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            <GoogleLogo />
            متابعة عبر Google
          </button>
          <p className="mt-4 text-center text-[11px] text-white/30">
            الوصول مقتصر على أصحاب الصلاحية.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/20">
          © صاحب يلا
        </p>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
