import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { KnowledgeEntry } from "@/lib/types";

type KnowledgeState = {
  entries: KnowledgeEntry[];
  addEntry: (data: Pick<KnowledgeEntry, "title" | "content" | "tags" | "linkedProjectIds">) => string;
  updateEntry: (id: string, patch: Partial<Pick<KnowledgeEntry, "title" | "content" | "tags" | "linkedProjectIds">>) => void;
  deleteEntry: (id: string) => void;
};

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: ({ title, content, tags, linkedProjectIds }) => {
        const id = nanoid();
        const now = new Date().toISOString();
        const entry: KnowledgeEntry = {
          id,
          title: title.trim() || "Untitled",
          content: content.trim(),
          tags,
          linkedProjectIds,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return id;
      },

      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? { ...e, ...patch, updatedAt: new Date().toISOString() }
              : e,
          ),
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    {
      name: "yallai-knowledge-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
