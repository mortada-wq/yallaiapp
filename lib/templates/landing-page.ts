import { nanoid } from "nanoid";
import type { EditorFile } from "@/lib/types";

export function landingPageTemplate(): EditorFile[] {
  return [
    {
      id: nanoid(),
      name: "index.html",
      language: "html",
      content:
        "<!DOCTYPE html>\n<html><body><header class=\"hero\"><h1>Ship faster</h1><p>Launch today.</p></header></body></html>\n",
      isDirty: false,
    },
    {
      id: nanoid(),
      name: "styles.css",
      language: "css",
      content:
        ".hero { max-width: 720px; margin: 0 auto; padding: 4rem 1.5rem; text-align: center; }\nh1 { font-size: 2.5rem; }\n",
      isDirty: false,
    },
    { id: nanoid(), name: "script.js", language: "javascript", content: "console.log('ok');\n", isDirty: false },
  ];
}
