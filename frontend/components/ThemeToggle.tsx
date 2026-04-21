"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SahibIconButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme !== "light";

  if (!mounted) {
    return <span className="inline-flex h-9 w-9 rounded-xl border border-[rgba(58,138,175,0.35)]" aria-hidden />;
  }

  return (
    <SahibIconButton
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Light mode" : "Dark mode"}
      className={cn("focus-visible:ring-2 focus-visible:ring-sahib-ocean/50")}
    >
      <span className="relative block h-5 w-5">
        <Sun
          className={cn(
            "absolute inset-0 h-5 w-5 text-yellow-400 transition-all duration-300 ease-in-out",
            isDark ? "scale-0 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-5 w-5 text-sahib-ocean transition-all duration-300 ease-in-out",
            isDark ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />
      </span>
    </SahibIconButton>
  );
}
