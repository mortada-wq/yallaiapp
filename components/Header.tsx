"use client";

import { useCallback } from "react";
import { Share2, ChevronDown } from "lucide-react";
import { SahibLogo } from "@/components/SahibLogo";
import { SahibIconButton } from "@/components/SahibButton";
import { useProjectStore } from "@/lib/projectStore";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onExport: () => void;
  onProjects: () => void;
};

export function Header({ onExport, onProjects }: HeaderProps) {
  const activeProject = useProjectStore((s) =>
    s.activeProjectId ? s.projects.find((p) => p.id === s.activeProjectId) : null,
  );
  const setActivePanel = useStudioStore((s) => s.setActivePanel);
  const setSidebarCollapsed = useStudioStore((s) => s.setSidebarCollapsed);

  const openProfile = useCallback(() => {
    setActivePanel("profile");
    setSidebarCollapsed(false);
  }, [setActivePanel, setSidebarCollapsed]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between border-b px-3 backdrop-blur-md",
        "border-[#3c3c3c] bg-[#1e1e1e] shadow-sahib-glow",
      )}
    >
      {/* Left: Logo + project name */}
      <div className="flex min-w-0 items-center gap-2">
        <SahibLogo />
        {activeProject ? (
          <button
            type="button"
            onClick={onProjects}
            className="flex min-w-0 max-w-[200px] items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
            title="Switch project"
          >
            <span className="truncate">{activeProject.name}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onProjects}
            className="rounded-md px-2 py-1 text-sm text-[#6B7280] transition hover:bg-white/5 hover:text-white"
          >
            Open project
          </button>
        )}
      </div>

      {/* Right: Share + Profile avatar */}
      <div className="flex items-center gap-1">
        <SahibIconButton type="button" onClick={onExport} aria-label="Share / Export">
          <Share2 className="h-4 w-4" />
        </SahibIconButton>

        {/* Profile avatar button */}
        <button
          type="button"
          onClick={openProfile}
          title="Profile"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#3A8AAF] to-[#DF7825] text-[11px] font-bold text-white transition hover:opacity-90"
        >
          U
        </button>
      </div>
    </header>
  );
}
