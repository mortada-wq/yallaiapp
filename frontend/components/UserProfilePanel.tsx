"use client";

import { useCallback } from "react";
import { LogOut, Settings, LayoutGrid, Share2, FolderOpen, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/projectStore";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { AiProvider } from "@/lib/types";

const PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: "bedrock", label: "AWS Bedrock" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "deepseek", label: "DeepSeek" },
];

type UserProfilePanelProps = {
  onSettings: () => void;
  onTemplates: () => void;
  onExport: () => void;
  onProjects: () => void;
};

export function UserProfilePanel({ onSettings, onTemplates, onExport, onProjects }: UserProfilePanelProps) {
  const router = useRouter();
  const activeProject = useProjectStore((s) =>
    s.activeProjectId ? s.projects.find((p) => p.id === s.activeProjectId) : null,
  );
  const aiProvider = useStudioStore((s) => s.aiProvider);
  const setAiProvider = useStudioStore((s) => s.setAiProvider);
  const files = useStudioStore((s) => s.files);
  const messages = useStudioStore((s) => s.messages);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 border-b border-white/10 px-3 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3A8AAF] to-[#DF7825] text-lg font-bold text-white shadow-lg">
          U
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#E5E7EB]">User</p>
          <p className="text-[10px] text-[#6B7280]">yallai workspace</p>
        </div>
      </div>

      {/* Stats */}
      {activeProject && (
        <div className="border-b border-white/10 px-3 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Current Project
          </p>
          <p className="mb-1 truncate text-xs font-medium text-[#E5E7EB]">{activeProject.name}</p>
          <div className="flex gap-3">
            <span className="text-[11px] text-[#6B7280]">
              <span className="text-[#9CA3AF]">{files.length}</span> files
            </span>
            <span className="text-[11px] text-[#6B7280]">
              <span className="text-[#9CA3AF]">{messages.length}</span> messages
            </span>
          </div>
        </div>
      )}

      {/* AI Provider */}
      <div className="border-b border-white/10 px-3 py-3">
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          <Bot className="h-3 w-3" />
          AI Provider
        </p>
        <div className="flex flex-col gap-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setAiProvider(p.value)}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-[11px] transition",
                aiProvider === p.value
                  ? "bg-[rgba(58,138,175,0.2)] text-[#3A8AAF]"
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex-1 px-3 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Quick Actions
        </p>
        <div className="flex flex-col gap-0.5">
          {[
            { icon: FolderOpen, label: "Projects", action: onProjects },
            { icon: LayoutGrid, label: "Templates", action: onTemplates },
            { icon: Share2, label: "Export / Share", action: onExport },
            { icon: Settings, label: "Settings", action: onSettings },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-[#9CA3AF] transition hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-[#9CA3AF] transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
