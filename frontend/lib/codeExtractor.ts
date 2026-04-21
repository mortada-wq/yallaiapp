import type { CodeBlockExtract } from "@/lib/types";

const FENCE = /```(\w[\w+#-]*)?\s*\n?([\s\S]*?)```/g;

function guessFilename(lang: string, index: number): string {
  const l = (lang || "txt").toLowerCase();
  const map: Record<string, string> = {
    html: "index.html",
    css: "styles.css",
    javascript: "script.js",
    js: "script.js",
    jsx: "App.jsx",
    typescript: "main.ts",
    ts: "main.ts",
    tsx: "App.tsx",
    json: "package.json",
    python: "main.py",
    bash: "script.sh",
    md: "README.md",
  };
  if (map[l]) return map[l];
  return `snippet-${index + 1}.${l.length > 8 ? "txt" : l}`;
}

export function extractCodeBlocks(message: string): CodeBlockExtract[] {
  const out: CodeBlockExtract[] = [];
  const re = new RegExp(FENCE.source, FENCE.flags);
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(message)) !== null) {
    const lang = (m[1] ?? "text").trim();
    const code = m[2]?.trim() ?? "";
    if (!code) continue;
    out.push({
      language: lang,
      code,
      suggestedFilename: guessFilename(lang, i),
    });
    i += 1;
  }
  return out;
}
