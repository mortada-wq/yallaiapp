"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useMemo } from "react";
import type { editor as M } from "monaco-editor";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] items-center justify-center bg-[#1e1e1e] text-sm text-sahib-ocean">
      Loading…
    </div>
  ),
});

export function MonacoEditor({
  value,
  onChange,
  language,
  className,
  onMount,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
  className?: string;
  onMount?: (editor: M.IStandaloneCodeEditor) => void;
}) {
  const { resolvedTheme } = useTheme();
  const fontSize = useStudioStore((s) => s.editorFontSize);
  const theme = resolvedTheme === "light" ? "light" : "vs-dark";

  const options = useMemo(
    () => ({
      fontSize,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
      wordWrap: "on" as const,
    }),
    [fontSize],
  );

  const handleMount = useCallback(
    (editor: M.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => {
      editor.addAction({
        id: "format-doc",
        label: "Format",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
        run: (ed) => void ed.getAction("editor.action.formatDocument")?.run(),
      });
      onMount?.(editor);
    },
    [onMount],
  );

  return (
    <div className={cn("min-h-0 flex-1 overflow-hidden", className)}>
      <Monaco
        theme={theme}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={options}
        onMount={handleMount}
      />
    </div>
  );
}
