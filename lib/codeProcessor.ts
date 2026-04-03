import * as Babel from "@babel/standalone";
import type { EditorFile } from "@/lib/types";

export function transpileReact(code: string): { code: string; error?: string } {
  try {
    const result = Babel.transform(code, { presets: ["react"], filename: "preview.jsx" });
    if (!result?.code) return { code: "", error: "Empty transpile result" };
    return { code: result.code };
  } catch (e) {
    return { code: "", error: e instanceof Error ? e.message : String(e) };
  }
}

const REACT_DEV = "https://unpkg.com/react@18/umd/react.development.js";
const REACT_DOM_DEV = "https://unpkg.com/react-dom@18/umd/react-dom.development.js";

function consoleBridgeScript(): string {
  return `(function(){
  function send(o){ try { parent.postMessage(Object.assign({source:'sahib-preview'}, o), '*'); } catch(e){} }
  ['log','warn','error','info'].forEach(function(level){
    var orig = console[level];
    console[level] = function(){
      var msg = Array.prototype.slice.call(arguments).map(function(a){
        try { return typeof a==='object'? JSON.stringify(a): String(a);} catch(e){ return String(a); }
      }).join(' ');
      send({type:'console', level:level, args:msg});
      try { orig.apply(console, arguments); } catch(e){}
    };
  });
  window.addEventListener('error', function(e){
    send({type:'runtime-error', message:(e.message||'')+'', stack:(e.error&&e.error.stack)||''});
  });
  send({type:'ready'});
})();`;
}

export function bundleCode(
  htmlFile: string,
  cssFile: string,
  jsFile: string,
  jsxMode: boolean,
): { html: string; error?: string } {
  let userJs = jsFile;
  if (jsxMode) {
    const t = transpileReact(jsFile);
    if (t.error) return { html: "", error: t.error };
    userJs = t.code;
  }

  const hasFullDoc = /<\s*html[\s>]/i.test(htmlFile);
  const bodyInner = hasFullDoc
    ? htmlFile.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? htmlFile
    : htmlFile;

  const styleBlock = cssFile.replace(/<\/style/gi, "<\\/style");

  if (jsxMode) {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<script crossorigin src="${REACT_DEV}"></script>
<script crossorigin src="${REACT_DOM_DEV}"></script>
<style>${styleBlock}</style>
</head><body>
<div id="root"></div>
<script>${consoleBridgeScript()}</script>
<script>${userJs.replace(/<\/script/gi, "<\\/script")}</script>
</body></html>`;
    return { html };
  }

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><style>${styleBlock}</style></head>
<body>
${bodyInner.replace(/<\/script/gi, "<\\/script")}
<script>${consoleBridgeScript()}</script>
<script>${userJs.replace(/<\/script/gi, "<\\/script")}</script>
</body></html>`;

  return { html };
}

export function detectJsxProject(files: EditorFile[]): boolean {
  return files.some(
    (f) =>
      f.name.endsWith(".jsx") ||
      f.name.endsWith(".tsx") ||
      f.language === "jsx" ||
      f.language === "tsx",
  );
}

export function getFileByName(files: EditorFile[], name: string): EditorFile | undefined {
  return files.find((f) => f.name.toLowerCase() === name.toLowerCase());
}
