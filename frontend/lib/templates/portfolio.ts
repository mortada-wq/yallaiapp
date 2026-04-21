import { nanoid } from "nanoid";
import type { EditorFile } from "@/lib/types";

export function portfolioTemplate(): EditorFile[] {
  return [
    {
      id: nanoid(),
      name: "index.html",
      language: "html",
      content:
        "<!DOCTYPE html>\n<html><body><nav>Portfolio</nav><section class=\"grid\"><div class=\"tile\">A</div><div class=\"tile\">B</div></section></body></html>\n",
      isDirty: false,
    },
    {
      id: nanoid(),
      name: "styles.css",
      language: "css",
      content:
        ".grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 2rem; }\n.tile { border: 1px solid #ccc; padding: 2rem; text-align: center; }\n",
      isDirty: false,
    },
  ];
}
