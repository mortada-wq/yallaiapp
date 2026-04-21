"use client";

import { useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

export function ConsolePanel() {
  const entries = useStudioStore((s) => s.consoleEntries);
  const clearConsole = useStudioStore((s) => s.clearConsole);
  const consoleOpen = useStudioStore((s) => s.consoleOpen);
  const setConsoleOpen = useStudioStore((s) => s.setConsoleOpen);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "log">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.level === filter);
  }, [entries, filter]);

  if (!consoleOpen) {
    return (
      <button
        type="button"
        onClick={() => setConsoleOpen(true)}
        className="w-full border-t border-white/10 py-2 text-center text-[11px] text-[#9CA3AF] transition-colors hover:bg-[rgba(58,138,175,0.08)] hover:text-white"
      >
        Console ({entries.length})
      </button>
    );
  }

  return (
    <div className="flex max-h-[200px] min-h-[100px] shrink-0 flex-col border-t border-[#3c3c3c] bg-[#181818] text-[#E5E7EB]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-2 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white">Console</span>
        {(["all", "error", "warn", "log"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-2 py-0.5 text-[10px] capitalize transition-all duration-300",
              filter === f
                ? "border border-[rgba(58,138,175,0.45)] bg-[rgba(58,138,175,0.15)] text-white"
                : "text-[#9CA3AF] hover:text-white",
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <SahibSecondaryButton
            type="button"
            onClick={() =>
              void navigator.clipboard.writeText(
                filtered.map((e) => `[${e.level}] ${e.args}`).join("\n"),
              )
            }
            className="p-1.5"
            aria-label="Copy console"
          >
            <Copy className="h-3.5 w-3.5" />
          </SahibSecondaryButton>
          <SahibSecondaryButton type="button" onClick={() => clearConsole()} className="p-1.5" aria-label="Clear">
            <Trash2 className="h-3.5 w-3.5" />
          </SahibSecondaryButton>
          <SahibSecondaryButton
            type="button"
            onClick={() => setConsoleOpen(false)}
            className="px-2 py-1 text-[10px]"
          >
            Hide
          </SahibSecondaryButton>
        </div>
      </div>
      <div className="studio-scroll flex-1 overflow-y-auto p-2 font-mono text-[11px]">
        {filtered.map((e) => (
          <div
            key={e.id}
            className={cn(
              "border-b border-white/5 py-1",
              e.level === "error" && "text-red-300",
              e.level === "warn" && "text-amber-200",
            )}
          >
            [{e.level}] {e.args}
          </div>
        ))}
      </div>
    </div>
  );
}
