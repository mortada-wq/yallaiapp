"use client";

import Split from "react-split";
import { LayoutPanelLeft, MessageSquare, PanelsTopLeft } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StudioWorkspace() {
  const mainPanelMode = useStudioStore((s) => s.mainPanelMode);
  const setMainPanelMode = useStudioStore((s) => s.setMainPanelMode);

  const seg = (mode: typeof mainPanelMode, label: string, Icon: typeof MessageSquare) => (
    <button
      key={mode}
      type="button"
      onClick={() => setMainPanelMode(mode)}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ease-in-out",
        mainPanelMode === mode
          ? "border border-[rgba(58,138,175,0.55)] bg-[rgba(58,138,175,0.15)] text-white shadow-[0_0_16px_rgba(58,138,175,0.2)]"
          : "border border-transparent text-[#9CA3AF] hover:border-[rgba(58,138,175,0.35)] hover:bg-[rgba(58,138,175,0.08)] hover:text-[#E5E7EB]",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-[#3c3c3c] bg-[#252526] px-2 py-2">
        {seg("split", "Split", PanelsTopLeft)}
        {seg("chat", "Chat", MessageSquare)}
        {seg("editor", "Editor", LayoutPanelLeft)}
      </div>
      <div className="flex min-h-0 flex-1 p-2 pt-2">
        {mainPanelMode === "chat" && (
          <div className="flex min-h-0 w-full">
            <ChatPanel />
          </div>
        )}
        {mainPanelMode === "editor" && (
          <div className="flex min-h-0 w-full">
            <EditorPanel />
          </div>
        )}
        {mainPanelMode === "split" && (
          <>
            {/* Desktop: resizable split */}
            <div className="hidden min-h-0 w-full md:flex">
              <Split
                className="flex min-h-0 w-full"
                sizes={[42, 58]}
                minSize={[280, 360]}
                gutterSize={8}
                direction="horizontal"
              >
                <div className="flex min-h-0 min-w-0">
                  <ChatPanel />
                </div>
                <div className="flex min-h-0 min-w-0">
                  <EditorPanel />
                </div>
              </Split>
            </div>
            {/* Mobile: stacked (chat on top, editor below) */}
            <div className="flex min-h-0 w-full flex-col gap-2 md:hidden">
              <div className="flex min-h-[320px] flex-1">
                <ChatPanel />
              </div>
              <div className="flex min-h-[320px] flex-1">
                <EditorPanel />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
