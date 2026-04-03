"use client";

import { nanoid } from "nanoid";
import { FilePlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const files = useStudioStore((s) => s.files);
  const activeFileId = useStudioStore((s) => s.activeFileId);
  const setActiveFileId = useStudioStore((s) => s.setActiveFileId);
  const sidebarCollapsed = useStudioStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStudioStore((s) => s.toggleSidebar);
  const addFile = useStudioStore((s) => s.addFile);

  if (sidebarCollapsed) {
    return (
      <div className="sahib-nav-surface flex w-10 shrink-0 flex-col items-center border-r border-white/10 py-2 shadow-sahib-glow">
        <SahibIconButton
          type="button"
          onClick={() => toggleSidebar()}
          aria-label="Expand sidebar"
          className="border-[rgba(58,138,175,0.45)]"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </SahibIconButton>
      </div>
    );
  }

  return (
    <aside className="sahib-nav-surface flex w-[220px] shrink-0 flex-col border-r border-white/10 shadow-sahib-glow">
      <div className="flex items-center justify-between border-b border-white/10 px-2 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Files
        </span>
        <div className="flex gap-0.5">
          <SahibIconButton
            type="button"
            onClick={() =>
              addFile({
                id: nanoid(),
                name: `untitled-${files.length + 1}.txt`,
                language: "plaintext",
                content: "",
                isDirty: true,
              })
            }
            aria-label="New file"
          >
            <FilePlus className="h-4 w-4" />
          </SahibIconButton>
          <SahibIconButton type="button" onClick={() => toggleSidebar()} aria-label="Collapse sidebar">
            <PanelLeftClose className="h-4 w-4" />
          </SahibIconButton>
        </div>
      </div>
      <div className="studio-scroll flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <p className="px-3 py-2 text-[11px] text-[#9CA3AF]">No files yet.</p>
        ) : (
          files.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFileId(f.id)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#E5E7EB] transition-all duration-300 ease-in-out",
                "hover:bg-[rgba(58,138,175,0.08)]",
                activeFileId === f.id && "sahib-sidebar-active font-medium text-white",
                f.isDirty && "italic opacity-95",
              )}
            >
              <span className="truncate">{f.name}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
