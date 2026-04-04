import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  ChatContextPayload,
  ConsoleEntry,
  EditorFile,
  Message,
  ViewMode,
} from "@/lib/types";
import { getFileByName } from "@/lib/codeProcessor";

const PREVIEW_SIZES = [
  { label: "Mobile", width: "375px" },
  { label: "Tablet", width: "768px" },
  { label: "Desktop", width: "100%" },
] as const;

type StudioState = {
  messages: Message[];
  chatLoading: boolean;
  chatError: string | null;
  chatDraftPrefill: string | null;
  files: EditorFile[];
  activeFileId: string | null;
  lastSavedAt: string | null;
  sidebarCollapsed: boolean;
  consoleOpen: boolean;
  viewMode: ViewMode;
  previewDeviceIndex: number;
  editorFontSize: number;
  previewDebounceMs: number;
  mainPanelMode: "split" | "chat" | "editor";
  consoleEntries: ConsoleEntry[];
  previewRuntimeError: string | null;

  focusEditorTab: () => void;
  setChatDraftPrefill: (text: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  clearMessages: () => void;
  setChatLoading: (v: boolean) => void;
  setChatError: (e: string | null) => void;
  setFiles: (files: EditorFile[]) => void;
  setActiveFileId: (id: string | null) => void;
  addFile: (file: EditorFile) => void;
  updateFileContent: (id: string, content: string) => void;
  renameFile: (id: string, name: string) => void;
  deleteFile: (id: string) => void;
  markFileSaved: (id: string) => void;
  loadTemplateFiles: (files: EditorFile[]) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setConsoleOpen: (v: boolean) => void;
  toggleConsole: () => void;
  setViewMode: (m: ViewMode) => void;
  setPreviewDeviceIndex: (i: number) => void;
  setEditorFontSize: (n: number) => void;
  setPreviewDebounceMs: (n: number) => void;
  setMainPanelMode: (m: "split" | "chat" | "editor") => void;
  clearConsole: () => void;
  appendConsole: (entry: Omit<ConsoleEntry, "id" | "timestamp">) => void;
  setPreviewRuntimeError: (e: string | null) => void;
  insertOrUpdateFile: (name: string, language: string, content: string) => void;
  applyCodeToPreview: (language: string, code: string) => void;
  loadProject: (files: EditorFile[], messages: Message[]) => void;
};

let editorTabFocusHandler: (() => void) | null = null;

export function registerEditorTabFocusHandler(fn: () => void) {
  editorTabFocusHandler = fn;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      messages: [],
      chatLoading: false,
      chatError: null,
      chatDraftPrefill: null,
      files: [],
      activeFileId: null,
      lastSavedAt: null,
      sidebarCollapsed: false,
      consoleOpen: true,
      viewMode: "split",
      previewDeviceIndex: 2,
      editorFontSize: 14,
      previewDebounceMs: 500,
      mainPanelMode: "split",
      consoleEntries: [],
      previewRuntimeError: null,

      focusEditorTab: () => editorTabFocusHandler?.(),
      setChatDraftPrefill: (text) => set({ chatDraftPrefill: text }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
      updateMessage: (id, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      clearMessages: () => set({ messages: [] }),
      setChatLoading: (chatLoading) => set({ chatLoading }),
      setChatError: (chatError) => set({ chatError }),

      setFiles: (files) => set({ files }),
      setActiveFileId: (activeFileId) => set({ activeFileId }),
      addFile: (file) =>
        set((s) => ({ files: [...s.files, file], activeFileId: file.id })),
      updateFileContent: (id, content) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, content, isDirty: true } : f,
          ),
          lastSavedAt: null,
        })),
      renameFile: (id, name) =>
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, name, isDirty: true } : f)),
        })),
      deleteFile: (id) =>
        set((s) => {
          const files = s.files.filter((f) => f.id !== id);
          let activeFileId = s.activeFileId;
          if (activeFileId === id) activeFileId = files[0]?.id ?? null;
          return { files, activeFileId };
        }),
      markFileSaved: (id) =>
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, isDirty: false } : f)),
          lastSavedAt: new Date().toISOString(),
        })),
      loadTemplateFiles: (files) =>
        set({ files, activeFileId: files[0]?.id ?? null }),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setConsoleOpen: (consoleOpen) => set({ consoleOpen }),
      toggleConsole: () => set((s) => ({ consoleOpen: !s.consoleOpen })),
      setViewMode: (viewMode) => set({ viewMode }),
      setPreviewDeviceIndex: (previewDeviceIndex) => set({ previewDeviceIndex }),
      setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
      setPreviewDebounceMs: (previewDebounceMs) => set({ previewDebounceMs }),
      setMainPanelMode: (mainPanelMode) => set({ mainPanelMode }),

      clearConsole: () => set({ consoleEntries: [] }),
      appendConsole: ({ level, args }) =>
        set((s) => ({
          consoleEntries: [
            ...s.consoleEntries,
            {
              id: nanoid(),
              level,
              args,
              timestamp: new Date().toISOString(),
            },
          ].slice(-500),
        })),
      setPreviewRuntimeError: (previewRuntimeError) => set({ previewRuntimeError }),

      insertOrUpdateFile: (name, language, content) => {
        const existing = getFileByName(get().files, name);
        if (existing) {
          get().updateFileContent(existing.id, content);
          set({ activeFileId: existing.id });
        } else {
          get().addFile({
            id: nanoid(),
            name,
            language,
            content,
            isDirty: true,
          });
        }
        get().focusEditorTab();
      },

      loadProject: (files, messages) =>
        set({
          files,
          messages,
          activeFileId: files[0]?.id ?? null,
          consoleEntries: [],
          previewRuntimeError: null,
          chatError: null,
        }),

      applyCodeToPreview: (language, code) => {
        const lang = (language || "text").toLowerCase();
        let name = "snippet.txt";
        let fileLang = lang;
        if (lang.includes("html") || /<\s*(!DOCTYPE|html|body|div|span)/i.test(code)) {
          name = "index.html";
          fileLang = "html";
        } else if (lang.includes("css")) {
          name = "styles.css";
          fileLang = "css";
        } else if (lang.includes("tsx")) {
          name = "App.tsx";
          fileLang = "tsx";
        } else if (lang.includes("jsx")) {
          name = "App.jsx";
          fileLang = "jsx";
        } else if (
          lang.includes("javascript") ||
          lang === "js" ||
          lang.includes("typescript") ||
          lang === "ts"
        ) {
          name = "script.js";
          fileLang = lang.includes("typescript") || lang === "ts" ? "typescript" : "javascript";
        }
        get().insertOrUpdateFile(name, fileLang, code);
        set({ viewMode: "split" });
      },
    }),
    {
      name: "sahib-chat-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        files: s.files,
        activeFileId: s.activeFileId,
        messages: s.messages,
        sidebarCollapsed: s.sidebarCollapsed,
        viewMode: s.viewMode,
        mainPanelMode: s.mainPanelMode,
        editorFontSize: s.editorFontSize,
        previewDebounceMs: s.previewDebounceMs,
        consoleOpen: s.consoleOpen,
        previewDeviceIndex: s.previewDeviceIndex,
      }),
    },
  ),
);

export function previewSizeLabel(index: number) {
  return PREVIEW_SIZES[index] ?? PREVIEW_SIZES[2];
}

export function buildChatContextForApi(): ChatContextPayload {
  const s = useStudioStore.getState();
  const active = s.files.find((f) => f.id === s.activeFileId);
  const errs = s.consoleEntries
    .filter((e) => e.level === "error")
    .slice(-8)
    .map((e) => e.args)
    .join("\n");

  // Import lazily to avoid circular dependency
  let projectInstructions: string | undefined;
  try {
    const { useProjectStore } = require("@/lib/projectStore") as typeof import("@/lib/projectStore");
    const project = useProjectStore.getState().getActiveProject();
    if (project?.instructions?.trim()) {
      projectInstructions = project.instructions.trim();
    }
  } catch {
    // ignore
  }

  return {
    activeFileName: active?.name,
    activeFileContent: active?.content,
    fileTree: s.files.map((f) => `- ${f.name} (${f.language})`).join("\n"),
    consoleErrors: errs || s.previewRuntimeError || undefined,
    projectInstructions,
  };
}
