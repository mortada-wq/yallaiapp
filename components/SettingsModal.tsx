"use client";

import { X } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const editorFontSize = useStudioStore((s) => s.editorFontSize);
  const setEditorFontSize = useStudioStore((s) => s.setEditorFontSize);
  const previewDebounceMs = useStudioStore((s) => s.previewDebounceMs);
  const setPreviewDebounceMs = useStudioStore((s) => s.setPreviewDebounceMs);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn("sahib-glass w-full max-w-md overflow-hidden border border-white/10")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="settings-modal-title" className="text-sm font-bold text-white">
            Settings
          </h2>
          <SahibIconButton type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </SahibIconButton>
        </header>
        <div className="space-y-5 p-4 text-sm text-[#E5E7EB]">
          <label className="flex flex-col gap-2">
            <span className="font-medium text-white">Editor font size ({editorFontSize}px)</span>
            <input
              type="range"
              min={12}
              max={22}
              value={editorFontSize}
              onChange={(e) => setEditorFontSize(Number(e.target.value))}
              className="sahib-input h-2 cursor-pointer py-0"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-medium text-white">Preview debounce ({previewDebounceMs} ms)</span>
            <input
              type="range"
              min={150}
              max={2000}
              step={50}
              value={previewDebounceMs}
              onChange={(e) => setPreviewDebounceMs(Number(e.target.value))}
              className="sahib-input h-2 cursor-pointer py-0"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
