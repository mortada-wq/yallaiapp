"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, FolderOpen, X } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

type ProjectFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, we are editing an existing project. Otherwise creating. */
  editProject?: Project | null;
  /** Called after creation/update, passes the project id */
  onDone?: (projectId: string) => void;
};

export function ProjectFormModal({ open, onOpenChange, editProject, onDone }: ProjectFormModalProps) {
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId);
  const saveProjectWorkspace = useProjectStore((s) => s.saveProjectWorkspace);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const studioFiles = useStudioStore((s) => s.files);
  const studioMessages = useStudioStore((s) => s.messages);
  const loadProject = useStudioStore((s) => s.loadProject);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const isEditing = !!editProject;

  useEffect(() => {
    if (open) {
      if (editProject) {
        setName(editProject.name);
        setDescription(editProject.description);
        setInstructions(editProject.instructions);
        setShowInstructions(!!editProject.instructions);
      } else {
        setName("");
        setDescription("");
        setInstructions("");
        setShowInstructions(false);
      }
    }
  }, [open, editProject]);

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (isEditing && editProject) {
      updateProject(editProject.id, {
        name: trimmedName,
        description,
        instructions,
      });
      onDone?.(editProject.id);
    } else {
      // Save current workspace to active project before creating/switching
      if (activeProjectId) {
        saveProjectWorkspace(activeProjectId, studioFiles, studioMessages);
      }
      const newId = createProject({ name: trimmedName, description, instructions });
      setActiveProjectId(newId);
      // New project starts empty
      loadProject([], []);
      onDone?.(newId);
    }
    onOpenChange(false);
  }, [
    name, description, instructions, isEditing, editProject,
    updateProject, createProject, setActiveProjectId, saveProjectWorkspace,
    loadProject, activeProjectId, studioFiles, studioMessages, onDone, onOpenChange,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
      if (e.key === "Escape") onOpenChange(false);
    },
    [handleSubmit, onOpenChange],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="sahib-glass w-full max-w-lg overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[#3A8AAF]" />
            <h2 id="project-form-title" className="text-base font-bold text-white">
              {isEditing ? "Edit Project" : "New Project"}
            </h2>
          </div>
          <SahibIconButton type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </SahibIconButton>
        </header>

        {/* Form body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-name" className="text-xs font-medium text-[#9CA3AF]">
              Project name <span className="text-red-400">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Portfolio, SaaS Dashboard..."
              maxLength={80}
              className={cn(
                "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25",
                "outline-none focus:border-[rgba(58,138,175,0.5)] focus:ring-1 focus:ring-[rgba(58,138,175,0.3)]",
              )}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-desc" className="text-xs font-medium text-[#9CA3AF]">
              Description <span className="text-white/25">(optional)</span>
            </label>
            <input
              id="project-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              maxLength={160}
              className={cn(
                "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25",
                "outline-none focus:border-[rgba(58,138,175,0.5)] focus:ring-1 focus:ring-[rgba(58,138,175,0.3)]",
              )}
            />
          </div>

          {/* Instructions toggle */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setShowInstructions((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#3A8AAF] hover:text-[#5aabcf] transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {showInstructions ? "Hide" : "Add"} project instructions (memory)
            </button>

            {showInstructions && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[11px] text-white/35 leading-relaxed">
                  Instructions are sent to the AI at the start of every conversation in this project. Use them to set context, style, or rules — like Claude's project memory.
                </p>
                <textarea
                  id="project-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={`e.g. "This project uses React 18 with TypeScript. Always use TailwindCSS. Prefer functional components. The app is a SaaS dashboard for..."`}
                  rows={6}
                  maxLength={4000}
                  className={cn(
                    "w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20",
                    "outline-none focus:border-[rgba(58,138,175,0.5)] focus:ring-1 focus:ring-[rgba(58,138,175,0.3)]",
                  )}
                />
                <p className="text-right text-[10px] text-white/20">
                  {instructions.length}/4000
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-white/10 px-4 py-1.5 text-sm text-[#9CA3AF] transition-all hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              name.trim()
                ? "bg-[#3A8AAF] text-white hover:bg-[#2d7a9f]"
                : "cursor-not-allowed bg-white/10 text-white/30",
            )}
          >
            {isEditing ? "Save changes" : "Create project"}
          </button>
        </footer>
      </div>
    </div>
  );
}
