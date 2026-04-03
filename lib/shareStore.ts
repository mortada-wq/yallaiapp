import type { EditorFile } from "@/lib/types";

export interface SharePayload {
  files: EditorFile[];
  activeFileId: string | null;
  createdAt: string;
}

const store = new Map<string, SharePayload>();
const TTL_MS = 1000 * 60 * 60 * 24;

export function saveShare(id: string, payload: SharePayload): void {
  store.set(id, payload);
  setTimeout(() => store.delete(id), TTL_MS);
}

export function getShare(id: string): SharePayload | undefined {
  return store.get(id);
}
