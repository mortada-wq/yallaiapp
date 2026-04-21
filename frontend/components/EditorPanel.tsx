"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Split from "react-split";
import { Copy, Download, Maximize2, Monitor, Smartphone, Tablet } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { editor as M } from "monaco-editor";
import { toast } from "sonner";
import { useCodeEditor } from "@/hooks/useCodeEditor";
import { MonacoEditor } from "@/components/MonacoEditor";
import { PreviewFrame } from "@/components/PreviewFrame";
import { FileTabs } from "@/components/FileTabs";
import { ConsolePanel } from "@/components/ConsolePanel";
import { AiToolbar } from "@/components/AiToolbar";
import { SahibIconButton } from "@/components/SahibButton";
import { bundleCode, detectJsxProject } from "@/lib/codeProcessor";
import { loadTemplate } from "@/lib/templates/projects";
import { registerEditorTabFocusHandler, useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function EditorPanel() {
  const { files, activeFile, updateCode, loadTemplateFiles } = useCodeEditor();
  const viewMode = useStudioStore((s) => s.viewMode);
  const setViewMode = useStudioStore((s) => s.setViewMode);
  const setPreviewDeviceIndex = useStudioStore((s) => s.setPreviewDeviceIndex);
  const previewDebounceMs = useStudioStore((s) => s.previewDebounceMs);
  const lastSavedAt = useStudioStore((s) => s.lastSavedAt);

  const [debouncedHtml, setDebouncedHtml] = useState("");
  const [bundleErr, setBundleErr] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const rootRef = useRef<HTMLDivElement>(null);

  const monacoMount = useCallback((editor: M.IStandaloneCodeEditor) => {
    const w = window as unknown as {
      __sahibGetSelection?: () => string;
      __sahibEditor?: M.IStandaloneCodeEditor;
    };
    w.__sahibEditor = editor;
    w.__sahibGetSelection = () => {
      const m = editor.getModel();
      const sel = editor.getSelection();
      if (!m || !sel) return "";
      return m.getValueInRange(sel);
    };
    editor.onDidChangeCursorSelection(() => {
      w.__sahibGetSelection = () => {
        const m = editor.getModel();
        const sel = editor.getSelection();
        if (!m || !sel) return "";
        return m.getValueInRange(sel);
      };
    });
    editor.addAction({
      id: "sahib-ask",
      label: "Ask sahib.chat",
      contextMenuGroupId: "navigation",
      run: () => {
        const m = editor.getModel();
        const sel = editor.getSelection();
        const snip = m && sel ? m.getValueInRange(sel) : "";
        useStudioStore.getState().setChatDraftPrefill(`Help:\n\n\`\`\`\n${snip}\n\`\`\`\n`);
        useStudioStore.getState().setMainPanelMode("chat");
      },
    });
  }, []);

  useEffect(() => {
    registerEditorTabFocusHandler(() => {});
    if (useStudioStore.getState().files.length === 0) {
      loadTemplateFiles(loadTemplate("blank"));
    }
  }, [loadTemplateFiles]);

  const bundled = useMemo(() => {
    const html = files.find((f) => f.name.endsWith(".html"))?.content ?? "<body></body>";
    const css = files.find((f) => f.name.endsWith(".css"))?.content ?? "";
    const jsxFile = files.find((f) => f.name.endsWith(".jsx") || f.name.endsWith(".tsx"));
    const jsPlain = files.find((f) => f.name.endsWith(".js") && !f.name.endsWith(".jsx"));
    const jsxMode = detectJsxProject(files);
    const js = jsxFile?.content ?? jsPlain?.content ?? "";
    return bundleCode(html, css, js, jsxMode);
  }, [files]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (bundled.error) {
        setBundleErr(bundled.error);
        setDebouncedHtml("");
        toast.error("Preview", { description: bundled.error });
      } else {
        setBundleErr(null);
        setDebouncedHtml(bundled.html);
      }
    }, previewDebounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [bundled, previewDebounceMs]);

  const lang = activeFile?.language ?? "plaintext";

  return (
    <section
      ref={rootRef}
      className={cn(
        "sahib-glass flex min-h-0 flex-[1.15] flex-col overflow-hidden font-mono lg:min-w-[500px]",
      )}
    >
      <div className="flex shrink-0 flex-col border-b border-[#3c3c3c] bg-[#252526]">
        <div className="flex flex-wrap items-center gap-2 py-1">
          <FileTabs />
          <div className="ml-auto flex flex-wrap gap-1 pr-1">
            {(["split", "editor", "preview"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={cn(
                  "rounded-xl border px-2.5 py-1 text-[11px] capitalize transition-all duration-300",
                  viewMode === m
                    ? "border-[rgba(58,138,175,0.55)] bg-[rgba(58,138,175,0.15)] text-white"
                    : "border-transparent text-[#9CA3AF] hover:border-[rgba(58,138,175,0.35)] hover:text-white",
                )}
              >
                {m}
              </button>
            ))}
            <SahibIconButton type="button" onClick={() => setPreviewDeviceIndex(0)} aria-label="Mobile">
              <Smartphone className="h-4 w-4" />
            </SahibIconButton>
            <SahibIconButton type="button" onClick={() => setPreviewDeviceIndex(1)} aria-label="Tablet">
              <Tablet className="h-4 w-4" />
            </SahibIconButton>
            <SahibIconButton type="button" onClick={() => setPreviewDeviceIndex(2)} aria-label="Desktop">
              <Monitor className="h-4 w-4" />
            </SahibIconButton>
            <SahibIconButton
              type="button"
              onClick={() =>
                void navigator.clipboard
                  .writeText(files.map((f) => `/* ${f.name} */\n${f.content}`).join("\n\n"))
                  .then(() => toast.success("Copied"))
              }
              aria-label="Copy all"
            >
              <Copy className="h-4 w-4" />
            </SahibIconButton>
            <SahibIconButton
              type="button"
              onClick={() => {
                const z = new JSZip();
                files.forEach((f) => z.file(f.name, f.content));
                void z.generateAsync({ type: "blob" }).then((b) => {
                  saveAs(b, "sahib-project.zip");
                  toast.success("ZIP");
                });
              }}
              aria-label="Download ZIP"
            >
              <Download className="h-4 w-4" />
            </SahibIconButton>
            <SahibIconButton
              type="button"
              onClick={() => void rootRef.current?.requestFullscreen?.()}
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </SahibIconButton>
          </div>
        </div>
        {lastSavedAt && (
          <p className="px-3 pb-1 text-[10px] text-[#9CA3AF]">
            Saved {new Date(lastSavedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
      <AiToolbar />
      {bundleErr && (
        <div className="border-b border-red-500/35 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {bundleErr}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e]">
        {viewMode === "split" && (
          <Split className="flex min-h-[280px] w-full" sizes={[50, 50]} minSize={[160, 160]} gutterSize={6} direction="horizontal">
            <div className="min-h-0 min-w-0">
              {activeFile ? (
                <MonacoEditor
                  key={activeFile.id}
                  language={lang}
                  value={activeFile.content}
                  onChange={(v) => updateCode(activeFile.id, v)}
                  onMount={monacoMount}
                />
              ) : (
                <p className="p-4 text-sm text-[#9CA3AF]">No file</p>
              )}
            </div>
            <div className="min-h-0 min-w-0 p-1">
              <PreviewFrame html={debouncedHtml || "<html><body></body></html>"} />
            </div>
          </Split>
        )}
        {viewMode === "editor" && activeFile && (
          <MonacoEditor
            key={activeFile.id}
            language={lang}
            value={activeFile.content}
            onChange={(v) => updateCode(activeFile.id, v)}
            onMount={monacoMount}
          />
        )}
        {viewMode === "preview" && (
          <div className="min-h-0 flex-1 p-2">
            <PreviewFrame html={debouncedHtml || "<html><body></body></html>"} />
          </div>
        )}
      </div>
      <ConsolePanel />
    </section>
  );
}
