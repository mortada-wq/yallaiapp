import type { ChatContextPayload, EditorFile } from "@/lib/types";

export function buildFileTree(files: EditorFile[]): string {
  return files.map((f) => `- ${f.name} (${f.language})`).join("\n");
}

export function buildContextFromPayload(payload: ChatContextPayload | undefined): string {
  if (!payload) return "";
  const chunks: string[] = [];
  if (payload.fileTree) chunks.push("## Files\n", payload.fileTree);
  if (payload.activeFileName && payload.activeFileContent) {
    chunks.push(
      `\n## Current file: ${payload.activeFileName}\n`,
      "```\n",
      payload.activeFileContent.slice(0, 24_000),
      "\n```\n",
    );
  }
  if (payload.consoleErrors) chunks.push("\n## Errors\n", payload.consoleErrors);
  if (payload.selection) chunks.push("\n## Selection\n```\n", payload.selection, "\n```\n");
  return chunks.join("");
}
