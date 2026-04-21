"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PHASES = [
  "Reading your request…",
  "Planning the structure…",
  "Writing the code…",
  "Styling & polish…",
  "Wiring it up…",
  "Almost there…",
];

/**
 * Replit-Agent style thinking indicator.
 * Cycles through status phrases while the AI is working.
 */
export function ThinkingIndicator({ className }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PHASES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      data-testid="thinking-indicator"
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(37,37,38,0.85)] px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Dot delay="0ms" />
        <Dot delay="160ms" />
        <Dot delay="320ms" />
      </div>
      <span
        key={i}
        data-testid="thinking-phase"
        className="vibe-fade-in text-sm text-white/80"
      >
        {PHASES[i]}
      </span>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="vibe-pulse-dot inline-block h-2 w-2 rounded-full bg-sahib-ocean"
      style={{ animationDelay: delay }}
    />
  );
}
