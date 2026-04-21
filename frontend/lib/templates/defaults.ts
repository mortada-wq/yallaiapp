import { nanoid } from "nanoid";
import type { EditorFile } from "@/lib/types";

export function blankHtml(): EditorFile {
  return {
    id: nanoid(),
    name: "index.html",
    language: "html",
    content:
      "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>App</title>\n</head>\n<body>\n  <h1>Hello sahib.chat</h1>\n</body>\n</html>\n",
    isDirty: false,
  };
}

export function blankCss(): EditorFile {
  return {
    id: nanoid(),
    name: "styles.css",
    language: "css",
    content: "body { font-family: system-ui, sans-serif; margin: 2rem; }\n",
    isDirty: false,
  };
}

export function blankJs(): EditorFile {
  return {
    id: nanoid(),
    name: "script.js",
    language: "javascript",
    content: "console.log('Ready');\n",
    isDirty: false,
  };
}

export function blankReact(): EditorFile {
  return {
    id: nanoid(),
    name: "App.jsx",
    language: "jsx",
    content:
      "function App() {\n  return <div style={{ padding: 24 }}><h1>Hello</h1></div>;\n}\nconst r = document.getElementById('root');\nReactDOM.createRoot(r).render(<App />);\n",
    isDirty: false,
  };
}

export function blankProject(): EditorFile[] {
  return [blankHtml(), blankCss(), blankJs()];
}
