"use client";

import { useState, useCallback } from "react";
import { FolderOpen, Plus, Trash2, Edit3, Clock, X, BookOpen } from "lucide-react";
import { useProjectStore } from "@/lib/projectStore";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

type ProjectsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ProjectsModal({ open, onOpenChange, onNewProject, onEditProject }: ProjectsModalProps) {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId);
  const saveProjectWorkspace = useProjectStore((s) => s.saveProjectWorkspace);

  const studioFiles = useStudioStore((s) => s.files);
  const studioMessages = useStudioStore((s) => s.messages);
  const loadProject = useStudioStore((s) => s.loadProject);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openProject = useCallback(
    (project: Project) => {
      // Save current workspace back to the active project before switching
      if (activeProjectId && activeProjectId !== project.id) {
        saveProjectWorkspace(activeProjectId, studioFiles, studioMessages);
      }
      setActiveProjectId(project.id);
      loadProject(project.files, project.messages);
      onOpenChange(false);
    },
    [activeProjectId, studioFiles, studioMessages, saveProjectWorkspace, setActiveProjectId, loadProject, onOpenChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirmDeleteId === id) {
        deleteProject(id);
        setConfirmDeleteId(null);
      } else {
        setConfirmDeleteId(id);
      }
    },
    [confirmDeleteId, deleteProject],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="projects-modal-title"
      onClick={() => { setConfirmDeleteId(null); onOpenChange(false); }}
    >
      <div
        className="sahib-glass flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[#3A8AAF]" />
            <h2 id="projects-modal-title" className="text-base font-bold text-white">
              Projects
            </h2>
            {projects.length > 0 && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-[#9CA3AF]">
                {projects.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewProject}
              className={cn(
                "flex items-center gap-1.5 rounded-md border border-[rgba(58,138,175,0.4)] px-3 py-1.5 text-xs font-medium text-[#3A8AAF] transition-all",
                "hover:border-[rgba(58,138,175,0.7)] hover:bg-[rgba(58,138,175,0.1)]",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </button>
            <SahibIconButton type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </SahibIconButton>
          </div>
        </header>

        {/* Project list */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FolderOpen className="h-12 w-12 text-white/20" />
              <p className="text-sm text-[#9CA3AF]">No projects yet.</p>
              <p className="text-xs text-white/30">
                Create a project to organize your files, chat history, and custom AI instructions.
              </p>
              <button
                type="button"
                onClick={onNewProject}
                className={cn(
                  "mt-2 flex items-center gap-1.5 rounded-md border border-[rgba(58,138,175,0.4)] px-4 py-2 text-sm font-medium text-[#3A8AAF] transition-all",
                  "hover:border-[rgba(58,138,175,0.7)] hover:bg-[rgba(58,138,175,0.1)]",
                )}
              >
                <Plus className="h-4 w-4" />
                Create your first project
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                const isConfirming = confirmDeleteId === project.id;
                return (
                  <li
                    key={project.id}
                    className={cn(
                      "sahib-glass-sm group flex items-start gap-3 rounded-lg border p-4 transition-all duration-200",
                      isActive
                        ? "border-[rgba(58,138,175,0.5)] bg-[rgba(58,138,175,0.06)]"
                        : "border-white/10 hover:border-[rgba(58,138,175,0.3)] hover:bg-white/5",
                    )}
                  >
                    {/* Project icon */}
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[rgba(58,138,175,0.15)]">
                      <FolderOpen className="h-4 w-4 text-[#3A8AAF]" />
                    </div>

                    {/* Main content — clickable */}
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => openProject(project)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-white">
                          {project.name}
                        </span>
                        {isActive && (
                          <span className="shrink-0 rounded-full bg-[rgba(58,138,175,0.25)] px-2 py-0.5 text-[10px] font-medium text-[#3A8AAF]">
                            Open
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">
                          {project.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-white/30">
                        {project.instructions && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-2.5 w-2.5" />
                            Instructions set
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDate(project.updatedAt)}
                        </span>
                        {project.files.length > 0 && (
                          <span>{project.files.length} file{project.files.length !== 1 ? "s" : ""}</span>
                        )}
                        {project.messages.length > 0 && (
                          <span>{project.messages.length} message{project.messages.length !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <SahibIconButton
                        type="button"
                        aria-label="Edit project"
                        onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                        className="h-7 w-7"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </SahibIconButton>
                      <button
                        type="button"
                        aria-label={isConfirming ? "Confirm delete" : "Delete project"}
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-all",
                          isConfirming
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "text-[#9CA3AF] hover:bg-white/10 hover:text-red-400",
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
