import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Project, EditorFile, Message, ProjectMemory, ProcessingEntry } from "@/lib/types";

type ProjectsState = {
  projects: Project[];
  activeProjectId: string | null;

  createProject: (data: { name: string; description: string; instructions: string }) => string;
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "description" | "instructions">>) => void;
  deleteProject: (id: string) => void;
  setActiveProjectId: (id: string | null) => void;
  saveProjectWorkspace: (id: string, files: EditorFile[], messages: Message[]) => void;
  getActiveProject: () => Project | null;
  updateProjectMemory: (id: string, memory: ProjectMemory) => void;
  addProcessingEntry: (projectId: string, entry: Omit<ProcessingEntry, "id" | "timestamp">) => void;
  clearProcessingLog: (projectId: string) => void;
};

export const useProjectStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProject: ({ name, description, instructions }) => {
        const id = nanoid();
        const now = new Date().toISOString();
        const project: Project = {
          id,
          name: name.trim() || "Untitled Project",
          description: description.trim(),
          instructions: instructions.trim(),
          files: [],
          messages: [],
          memory: { notes: "", processingLog: [] },
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return id;
      },

      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  name: patch.name !== undefined ? patch.name.trim() || p.name : p.name,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),

      setActiveProjectId: (id) => set({ activeProjectId: id }),

      saveProjectWorkspace: (id, files, messages) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, files, messages, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId) ?? null;
      },

      updateProjectMemory: (id, memory) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, memory, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      addProcessingEntry: (projectId, entry) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== projectId) return p;
            const log = p.memory?.processingLog ?? [];
            const newEntry: ProcessingEntry = {
              id: nanoid(),
              timestamp: new Date().toISOString(),
              ...entry,
            };
            return {
              ...p,
              memory: {
                notes: p.memory?.notes ?? "",
                processingLog: [newEntry, ...log].slice(0, 100),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      clearProcessingLog: (projectId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, memory: { notes: p.memory?.notes ?? "", processingLog: [] } }
              : p,
          ),
        })),
    }),
    {
      name: "yallai-projects-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
