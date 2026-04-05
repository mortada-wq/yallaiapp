"use client";

import { useState, useCallback } from "react";
import { Brain, Trash2, Cpu, FileCode, Zap } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import { cn } from "@/lib/utils";
import type { ProcessingEntry } from "@/lib/types";

const TYPE_CONFIG = {
  ai_call: { label: "AI", icon: Zap, color: "text-[#3A8AAF] bg-[rgba(58,138,175,0.15)]" },
  code_run: { label: "Run", icon: Cpu, color: "text-emerald-400 bg-emerald-400/10" },
  file_change: { label: "File", icon: FileCode, color: "text-[#DF7825] bg-[rgba(223,120,37,0.15)]" },
} satisfies Record<ProcessingEntry["type"], { label: string; icon: React.ElementType; color: string }>;

export function ProjectMemoryPanel() {
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const project = useProjectStore((s) =>
    s.activeProjectId ? s.projects.find((p) => p.id === s.activeProjectId) : null,
  );
  const updateProjectMemory = useProjectStore((s) => s.updateProjectMemory);
  const clearProcessingLog = useProjectStore((s) => s.clearProcessingLog);

  const [notes, setNotes] = useState(project?.memory?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleNotesBlur = useCallback(() => {
    if (!activeProjectId || !project) return;
    setSaving(true);
    updateProjectMemory(activeProjectId, {
      notes,
      processingLog: project.memory?.processingLog ?? [],
    });
    setTimeout(() => setSaving(false), 800);
  }, [activeProjectId, notes, project, updateProjectMemory]);

  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
        <Brain className="h-8 w-8 text-[#9CA3AF]" />
        <p className="text-xs text-[#9CA3AF]">No active project.</p>
      </div>
    );
  }

  const processingLog = project.memory?.processingLog ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Notes */}
      <div className="flex flex-col gap-1 border-b border-white/10 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Notes
          </span>
          {saving && (
            <span className="text-[10px] text-[#3A8AAF]">Saved</span>
          )}
        </div>
        <textarea
          className="studio-scroll min-h-[120px] resize-none rounded-md border border-white/10 bg-[#1a1a1a] p-2 text-xs text-[#E5E7EB] placeholder-[#6B7280] focus:border-[rgba(58,138,175,0.5)] focus:outline-none"
          placeholder="Add notes, decisions, context for this project..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
        />
      </div>

      {/* Processing Log */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Processing Log
          </span>
          {processingLog.length > 0 && (
            <button
              type="button"
              onClick={() => activeProjectId && clearProcessingLog(activeProjectId)}
              title="Clear log"
              className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-[#9CA3AF] transition hover:bg-white/5 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        <div className="studio-scroll flex-1 overflow-y-auto py-1">
          {processingLog.length === 0 ? (
            <p className="px-3 py-4 text-center text-[11px] text-[#9CA3AF]">
              No processing entries yet.
            </p>
          ) : (
            processingLog.map((entry) => {
              const cfg = TYPE_CONFIG[entry.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={entry.id}
                  className="memory-log-entry mx-2 my-1 rounded-md border border-white/5 bg-[#1a1a1a] p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", cfg.color)}>
                      <Icon className="h-2.5 w-2.5" />
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {entry.tokensUsed !== undefined && (
                      <span className="ml-auto text-[10px] text-[#6B7280]">
                        {entry.tokensUsed.toLocaleString()} tok
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-[#9CA3AF]">{entry.summary}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
