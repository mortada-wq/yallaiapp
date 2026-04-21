"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { EditorPanel } from "@/components/EditorPanel";
import { cn } from "@/lib/utils";

/**
 * Slide-over that wraps the existing EditorPanel (Monaco + file tabs + preview + console).
 * - Desktop (≥ lg): slides from the right, covers ~65% of viewport.
 * - Mobile: bottom-sheet covering ~92% of viewport.
 */
export function CodeDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close code drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* panel: desktop = right slide, mobile = bottom sheet */}
      <div
        data-testid="code-drawer"
        className={cn(
          "absolute overflow-hidden bg-[#141517] shadow-2xl transition-transform duration-300 ease-out",
          // desktop: right-side slide-over
          "lg:right-0 lg:top-0 lg:h-full lg:w-[min(1100px,70vw)] lg:border-l lg:border-white/10 lg:rounded-none",
          open ? "lg:translate-x-0" : "lg:translate-x-full",
          // mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t border-white/10 lg:border-t-0",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* grab handle (mobile only) */}
        <div className="flex items-center justify-center py-2 lg:hidden">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* header */}
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <h2 className="text-sm font-semibold text-white">Code</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid="code-drawer-close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* body: reuse existing EditorPanel — lazy-mount so files aren't auto-seeded on page load */}
        <div className="flex h-[calc(100%-57px)] min-h-0 w-full">
          {open && <EditorPanel />}
        </div>
      </div>
    </div>
  );
}
