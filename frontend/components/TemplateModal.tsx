"use client";

import { X } from "lucide-react";
import { loadTemplate, type TemplateId } from "@/lib/templates/projects";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

const ITEMS: { id: TemplateId; title: string; description: string }[] = [
  { id: "blank", title: "Blank", description: "Empty HTML/CSS/JS starter" },
  { id: "react-app", title: "React (in-browser)", description: "JSX preview via Babel" },
  { id: "landing", title: "Landing", description: "Marketing-style layout" },
  { id: "dashboard", title: "Dashboard", description: "Charts & cards shell" },
  { id: "portfolio", title: "Portfolio", description: "Projects grid" },
];

type TemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TemplateModal({ open, onOpenChange }: TemplateModalProps) {
  const loadTemplateFiles = useStudioStore((s) => s.loadTemplateFiles);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn("sahib-glass max-h-[90vh] w-full max-w-2xl overflow-hidden border border-white/10")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="template-modal-title" className="text-base font-bold text-white">
            Choose a template
          </h2>
          <SahibIconButton type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </SahibIconButton>
        </header>
        <div className="grid max-h-[calc(90vh-120px)] gap-2 overflow-y-auto p-4 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "sahib-glass-sm flex flex-col items-start gap-1 border border-white/10 p-4 text-left transition-all duration-300",
                "hover:border-[rgba(58,138,175,0.45)] hover:shadow-sahib-ring",
              )}
              onClick={() => {
                loadTemplateFiles(loadTemplate(item.id));
                onOpenChange(false);
              }}
            >
              <span className="text-sm font-semibold text-white">{item.title}</span>
              <span className="text-xs text-[#9CA3AF]">{item.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
