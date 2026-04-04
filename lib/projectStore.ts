import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Project, EditorFile, Message } from "@/lib/types";

type ProjectsState = {
  projects: Project[];
  activeProjectId: string | null;

  createProject: (data: { name: string; description: string; instructions: string }) => string;
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "description" | "instructions">>) => void;
  deleteProject: (id: string) => void;
  setActiveProjectId: (id: string | null) => void;
  saveProjectWorkspace: (id: string, files: EditorFile[], messages: Message[]) => void;
  getActiveProject: () => Project | null;
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
    }),
    {
      name: "yallai-projects-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
