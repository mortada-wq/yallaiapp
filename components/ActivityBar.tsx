"use client";

import { Files, Brain, Layers, User } from "lucide-react";
import { useStudioStore, type ActivePanel } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { panel: ActivePanel; icon: React.ElementType; label: string }[] = [
  { panel: "files", icon: Files, label: "Files" },
  { panel: "memory", icon: Brain, label: "Memory" },
  { panel: "knowledge", icon: Layers, label: "Knowledge Tower" },
  { panel: "profile", icon: User, label: "Profile" },
];

export function ActivityBar() {
  const activePanel = useStudioStore((s) => s.activePanel);
  const setActivePanel = useStudioStore((s) => s.setActivePanel);
  const sidebarCollapsed = useStudioStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStudioStore((s) => s.toggleSidebar);

  const handleClick = (panel: ActivePanel) => {
    if (activePanel === panel && !sidebarCollapsed) {
      toggleSidebar();
    } else {
      setActivePanel(panel);
    }
  };

  return (
    <div className="activity-bar flex shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-[#1e1e1e] py-2">
      {NAV_ITEMS.map(({ panel, icon: Icon, label }) => (
        <button
          key={panel}
          type="button"
          onClick={() => handleClick(panel)}
          title={label}
          className={cn(
            "activity-bar-btn group relative flex h-10 w-10 items-center justify-center rounded-md transition-all duration-150",
            activePanel === panel && !sidebarCollapsed
              ? "bg-[rgba(58,138,175,0.2)] text-[#3A8AAF]"
              : "text-[#9CA3AF] hover:bg-white/5 hover:text-white",
          )}
          aria-label={label}
        >
          {activePanel === panel && !sidebarCollapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-[#3A8AAF]" />
          )}
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
