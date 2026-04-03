import { nanoid } from "nanoid";
import type { EditorFile } from "@/lib/types";

export function dashboardTemplate(): EditorFile[] {
  return [
    {
      id: nanoid(),
      name: "index.html",
      language: "html",
      content:
        "<!DOCTYPE html>\n<html><body><div class=\"layout\"><aside class=\"side\">Nav</aside><main class=\"main\"><h1>Overview</h1></main></div></body></html>\n",
      isDirty: false,
    },
    {
      id: nanoid(),
      name: "styles.css",
      language: "css",
      content:
        ".layout { display: grid; grid-template-columns: 200px 1fr; min-height: 100vh; }\n.side { background: #1e293b; color: #fff; padding: 1rem; }\n.main { padding: 2rem; }\n",
      isDirty: false,
    },
    { id: nanoid(), name: "script.js", language: "javascript", content: "", isDirty: false },
  ];
}
