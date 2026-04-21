"use client";

import { useState } from "react";
import { Copy, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useStudioStore } from "@/lib/store";
import { shareLinkOrigin } from "@/lib/site";
const primaryChrome =
  "flex flex-1 items-center justify-center rounded-xl border border-[rgba(58,138,175,0.55)] bg-[#252526] transition-all duration-300 hover:border-[rgba(58,138,175,0.8)] hover:shadow-sahib-ring disabled:pointer-events-none disabled:opacity-45";
import { SahibIconButton, SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

type ExportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const files = useStudioStore((s) => s.files);
  const activeFileId = useStudioStore((s) => s.activeFileId);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  if (!open) return null;

  const share = async () => {
    setLoading(true);
    setUrl(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, activeFileId }),
      });
      const j = (await res.json()) as { path?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Share failed");
      const path = j.path ?? "";
      const full = `${shareLinkOrigin()}${path}`;
      setUrl(full);
      await navigator.clipboard.writeText(full);
      toast.success("Link copied");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Share failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn("sahib-glass w-full max-w-md overflow-hidden border border-white/10")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="export-modal-title" className="text-sm font-bold text-white">
            Share snapshot
          </h2>
          <SahibIconButton type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </SahibIconButton>
        </header>
        <div className="space-y-3 p-4 text-sm text-[#9CA3AF]">
          <p>
            Creates a read-only link others can open in the browser. Data is stored on this server
            instance for a limited time (dev: in-memory).
          </p>
          {url && (
            <div className="break-all rounded-xl border border-white/10 bg-[#2d2d30] px-2 py-2 font-mono text-xs text-[#E5E7EB]">
              {url}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void share()}
              disabled={loading || files.length === 0}
              className={cn(primaryChrome)}
            >
              <span className="flex min-h-10 w-full items-center justify-center gap-2 px-3 py-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 text-white" />
                )}
                <span className="text-sm font-semibold text-[#E5E7EB]">
                  {loading ? "Working…" : "Create & copy link"}
                </span>
              </span>
            </button>
            {url && (
              <SahibSecondaryButton
                type="button"
                onClick={() => void navigator.clipboard.writeText(url).then(() => toast.success("Copied"))}
              >
                Copy again
              </SahibSecondaryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
