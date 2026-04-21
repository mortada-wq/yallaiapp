"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { previewSizeLabel, useStudioStore } from "@/lib/store";
import { SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

export function PreviewFrame({ html, className }: { html: string; className?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [busy, setBusy] = useState(true);
  const appendConsole = useStudioStore((s) => s.appendConsole);
  const setPreviewRuntimeError = useStudioStore((s) => s.setPreviewRuntimeError);
  const previewDeviceIndex = useStudioStore((s) => s.previewDeviceIndex);
  const device = previewSizeLabel(previewDeviceIndex);

  const inject = useCallback(() => {
    const el = iframeRef.current;
    if (!el) return;
    setBusy(true);
    setPreviewRuntimeError(null);
    el.srcdoc = html;
  }, [html, setPreviewRuntimeError]);

  useEffect(() => {
    inject();
  }, [inject]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as Record<string, unknown>;
      if (d?.source !== "sahib-preview") return;
      if (d.type === "ready") {
        setBusy(false);
        return;
      }
      if (d.type === "console") {
        appendConsole({
          level: d.level as "log" | "warn" | "error" | "info",
          args: String(d.args ?? ""),
        });
        return;
      }
      if (d.type === "runtime-error") {
        setPreviewRuntimeError(String(d.message ?? ""));
        appendConsole({ level: "error", args: `${d.message}\n${d.stack ?? ""}` });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [appendConsole, setPreviewRuntimeError]);

  const frameStyle = useMemo(
    () => ({
      width: device.width === "100%" ? "100%" : device.width,
      maxWidth: "100%" as const,
      minHeight: 320,
    }),
    [device.width],
  );

  return (
    <div
      className={cn(
        "sahib-glass-sm flex min-h-0 flex-1 flex-col overflow-hidden border border-white/10 shadow-sahib-glow",
        className,
      )}
    >
      <div className="flex justify-end border-b border-white/10 px-2 py-1.5">
        <SahibSecondaryButton
          type="button"
          onClick={inject}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </SahibSecondaryButton>
      </div>
      <div className="relative flex flex-1 justify-center overflow-auto bg-[#1e1e1e] p-2">
        {busy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1e1e1e]/90 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-sahib-ocean" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
          className="rounded-lg border border-white/10 bg-white shadow-lg"
          style={frameStyle}
        />
      </div>
      <p className="py-1 text-center text-[10px] text-[#9CA3AF]">
        {device.label} ({device.width})
      </p>
    </div>
  );
}
