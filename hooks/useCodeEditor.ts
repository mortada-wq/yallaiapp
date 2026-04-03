import { useStudioStore } from "@/lib/store";
import type { EditorFile } from "@/lib/types";

export function useCodeEditor() {
  const files = useStudioStore((s) => s.files);
  const activeFileId = useStudioStore((s) => s.activeFileId);
  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0] ?? null;
  const updateCode = useStudioStore((s) => s.updateFileContent);
  const addFile = useStudioStore((s) => s.addFile);
  const deleteFile = useStudioStore((s) => s.deleteFile);
  const setActiveFileId = useStudioStore((s) => s.setActiveFileId);
  const loadTemplateFiles = useStudioStore((s) => s.loadTemplateFiles);
  const renameFile = useStudioStore((s) => s.renameFile);
  const lastSavedAt = useStudioStore((s) => s.lastSavedAt);

  return {
    files,
    activeFileId,
    activeFile,
    updateCode,
    addFile,
    deleteFile,
    setActiveFileId,
    loadTemplateFiles,
    renameFile,
    lastSavedAt,
  };
}

export type { EditorFile };
