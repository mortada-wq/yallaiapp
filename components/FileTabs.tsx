"use client";

import { Plus, X } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { blankCss, blankHtml, blankJs, blankReact } from "@/lib/templates/defaults";
import { cn } from "@/lib/utils";

export function FileTabs() {
  const files = useStudioStore((s) => s.files);
  const activeFileId = useStudioStore((s) => s.activeFileId);
  const setActiveFileId = useStudioStore((s) => s.setActiveFileId);
  const deleteFile = useStudioStore((s) => s.deleteFile);
  const addFile = useStudioStore((s) => s.addFile);

  return (
    <div className="flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto border-b border-white/10 px-1">
      {files.map((f) => {
        const active = f.id === activeFileId;
        return (
          <div
            key={f.id}
            className={cn(
              "group flex max-w-[140px] shrink-0 items-center rounded-t-xl border border-b-0 px-2 py-1.5 text-xs transition-all duration-300",
              active
                ? "border-[rgba(58,138,175,0.5)] bg-[rgba(58,138,175,0.12)] text-white shadow-[inset_0_-2px_0_0_rgba(58,138,175,0.65)]"
                : "border-transparent text-[#9CA3AF] opacity-90 hover:bg-[#2d2d30]",
            )}
          >
            <button
              type="button"
              onClick={() => setActiveFileId(f.id)}
              className="min-w-0 flex-1 truncate text-left font-medium"
            >
              {f.name}
              {f.isDirty && <span className="text-sahib-ocean"> •</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                if (files.length <= 1 || window.confirm(`Close ${f.name}?`)) deleteFile(f.id);
              }}
              className="p-0.5 text-[#9CA3AF] opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          const k = window.prompt("html | css | js | jsx", "html")?.toLowerCase();
          if (k === "css") addFile(blankCss());
          else if (k === "jsx") addFile(blankReact());
          else if (k === "js") addFile(blankJs());
          else addFile(blankHtml());
        }}
        className="mb-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-[rgba(58,138,175,0.45)] text-[#9CA3AF] transition-all hover:border-sahib-ocean hover:text-white"
        aria-label="New file"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
