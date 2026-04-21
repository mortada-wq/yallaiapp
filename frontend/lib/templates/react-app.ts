import { nanoid } from "nanoid";
import type { EditorFile } from "@/lib/types";

export function reactAppTemplate(): EditorFile[] {
  return [
    {
      id: nanoid(),
      name: "index.html",
      language: "html",
      content:
        "<!DOCTYPE html>\n<html><head><meta charset=\"UTF-8\" /><title>React</title></head><body><div id=\"root\"></div></body></html>\n",
      isDirty: false,
    },
    {
      id: nanoid(),
      name: "styles.css",
      language: "css",
      content: "body { margin: 0; font-family: system-ui; background: #0f172a; color: #e2e8f0; }\n",
      isDirty: false,
    },
    {
      id: nanoid(),
      name: "App.jsx",
      language: "jsx",
      content:
        "function App() {\n  const [n,setN]=React.useState(0);\n  return <main style={{padding:24}}><h1>sahib.chat</h1><p>{n}</p><button onClick={()=>setN(n+1)}>+1</button></main>;\n}\nReactDOM.createRoot(document.getElementById('root')).render(<App />);\n",
      isDirty: false,
    },
  ];
}
