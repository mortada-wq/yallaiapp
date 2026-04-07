"use client";

import { nanoid } from "nanoid";
import { FilePlus, FolderOpen, Brain, Layers, User, Laugh } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { ProjectMemoryPanel } from "@/components/ProjectMemoryPanel";
import { KnowledgeTowerPanel } from "@/components/KnowledgeTowerPanel";
import { UserProfilePanel } from "@/components/UserProfilePanel";
import { JokePanel } from "@/components/JokePanel";
import { cn } from "@/lib/utils";

// Props are passed through from StudioChrome for UserProfilePanel actions
type SidebarProps = {
  onSettings: () => void;
  onTemplates: () => void;
  onExport: () => void;
  onProjects: () => void;
};

function FilesPanel() {
  const files = useStudioStore((s) => s.files);
  const activeFileId = useStudioStore((s) => s.activeFileId);
  const setActiveFileId = useStudioStore((s) => s.setActiveFileId);
  const addFile = useStudioStore((s) => s.addFile);

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-2 py-2">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-[#3A8AAF]" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Files
          </span>
        </div>
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
    </>
  );
}

export function Sidebar({ onSettings, onTemplates, onExport, onProjects }: SidebarProps) {
  const sidebarCollapsed = useStudioStore((s) => s.sidebarCollapsed);
  const activePanel = useStudioStore((s) => s.activePanel);

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <aside className="sahib-nav-surface flex w-[240px] shrink-0 flex-col border-r border-white/10 shadow-sahib-glow">
      {activePanel === "files" && <FilesPanel />}
      {activePanel === "memory" && (
        <>
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <Brain className="h-3.5 w-3.5 text-[#3A8AAF]" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Memory
            </span>
          </div>
          <ProjectMemoryPanel />
        </>
      )}
      {activePanel === "knowledge" && <KnowledgeTowerPanel />}
      {activePanel === "profile" && (
        <>
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <User className="h-3.5 w-3.5 text-[#3A8AAF]" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Profile
            </span>
          </div>
          <UserProfilePanel
            onSettings={onSettings}
            onTemplates={onTemplates}
            onExport={onExport}
            onProjects={onProjects}
          />
        </>
      )}
      {activePanel === "jokes" && <JokePanel />}
    </aside>
  );
}
