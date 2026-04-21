"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import {
  Download,
  LayoutGrid,
  MessageSquare,
  PanelsTopLeft,
  Settings,
  Trash2,
  Type,
} from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplates: () => void;
  onSettings: () => void;
  onExport: () => void;
};

const itemCls =
  "flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#E5E7EB] transition-all duration-300 data-[selected=true]:bg-[rgba(58,138,175,0.18)] data-[selected=true]:text-white";

const groupHeading =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-[#9CA3AF]";

export function CommandPalette({
  open,
  onOpenChange,
  onTemplates,
  onSettings,
  onExport,
}: CommandPaletteProps) {
  const clearMessages = useStudioStore((s) => s.clearMessages);
  const setMainPanelMode = useStudioStore((s) => s.setMainPanelMode);
  const toggleConsole = useStudioStore((s) => s.toggleConsole);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const close = () => onOpenChange(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm transition-all duration-300"
      onClick={() => close()}
    >
      <Command
        className={cn(
          "sahib-glass w-full max-w-lg overflow-hidden border border-white/10 shadow-sahib-glow",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-white/10 px-3">
          <Command.Input
            autoFocus
            placeholder="Search commands…"
            className="sahib-input !border-0 !bg-transparent !shadow-none h-11 py-2"
          />
        </div>
        <Command.List className="max-h-[min(420px,55vh)] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-[#9CA3AF]">No matches.</Command.Empty>
          <Command.Group heading="Layout" className={groupHeading}>
            <Command.Item className={itemCls} onSelect={() => { setMainPanelMode("split"); close(); }}>
              <PanelsTopLeft className="h-4 w-4 shrink-0 text-sahib-ocean" />
              Split: chat + editor
            </Command.Item>
            <Command.Item className={itemCls} onSelect={() => { setMainPanelMode("chat"); close(); }}>
              <MessageSquare className="h-4 w-4 shrink-0 text-sahib-ocean" />
              Focus chat
            </Command.Item>
            <Command.Item className={itemCls} onSelect={() => { setMainPanelMode("editor"); close(); }}>
              <Type className="h-4 w-4 shrink-0 text-sahib-ocean" />
              Focus editor
            </Command.Item>
          </Command.Group>
          <Command.Group heading="sahib.chat" className={groupHeading}>
            <Command.Item className={itemCls} onSelect={() => { onTemplates(); close(); }}>
              <LayoutGrid className="h-4 w-4 shrink-0" />
              Templates…
            </Command.Item>
            <Command.Item className={itemCls} onSelect={() => { onExport(); close(); }}>
              <Download className="h-4 w-4 shrink-0" />
              Share / export link…
            </Command.Item>
            <Command.Item className={itemCls} onSelect={() => { onSettings(); close(); }}>
              <Settings className="h-4 w-4 shrink-0" />
              Settings…
            </Command.Item>
            <Command.Item className={itemCls} onSelect={() => { toggleConsole(); close(); }}>
              <PanelsTopLeft className="h-4 w-4 shrink-0" />
              Toggle console
            </Command.Item>
            <Command.Item
              className={cn(itemCls, "data-[selected=true]:bg-red-950/35")}
              onSelect={() => { clearMessages(); close(); }}
            >
              <Trash2 className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
              Clear chat history
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
