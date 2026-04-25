"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { bundleCode, detectJsxProject } from "@/lib/codeProcessor";
import { useStudioStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DEVICES = [
  { label: "Mobile", width: "375px", Icon: Smartphone },
  { label: "Tablet", width: "768px", Icon: Tablet },
  { label: "Desktop", width: "100%", Icon: Monitor },
] as const;

/**
 * Hero live preview — modern browser-chrome look with device toggle.
 * Renders the iframe directly (no nested PreviewFrame) to avoid double chrome.
 */
export function LivePreview({ className }: { className?: string }) {
  const files = useStudioStore((s) => s.files);
  const previewDebounceMs = useStudioStore((s) => s.previewDebounceMs);
  const deviceIndex = useStudioStore((s) => s.previewDeviceIndex);
  const setDeviceIndex = useStudioStore((s) => s.setPreviewDeviceIndex);
  const appendConsole = useStudioStore((s) => s.appendConsole);
  const setPreviewRuntimeError = useStudioStore((s) => s.setPreviewRuntimeError);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [busy, setBusy] = useState(false);

  const bundled = useMemo(() => {
    const html = files.find((f) => f.name.endsWith(".html"))?.content ?? "<body></body>";
    const css = files.find((f) => f.name.endsWith(".css"))?.content ?? "";
    const jsxFile = files.find((f) => f.name.endsWith(".jsx") || f.name.endsWith(".tsx"));
    const jsPlain = files.find((f) => f.name.endsWith(".js") && !f.name.endsWith(".jsx"));
    const jsxMode = detectJsxProject(files);
    const js = jsxFile?.content ?? jsPlain?.content ?? "";
    return bundleCode(html, css, js, jsxMode);
  }, [files]);

  const [html, setHtml] = useState("");
  const tRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => {
      if (!bundled.error) setHtml(bundled.html);
    }, previewDebounceMs);
    return () => tRef.current && clearTimeout(tRef.current);
  }, [bundled, previewDebounceMs]);

  const inject = useCallback(() => {
    const el = iframeRef.current;
    if (!el) return;
    setBusy(true);
    setPreviewRuntimeError(null);
    el.srcdoc = html || "<html><body></body></html>";
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
      }
      if (d.type === "runtime-error") {
        setPreviewRuntimeError(String(d.message ?? ""));
        appendConsole({ level: "error", args: `${d.message}\n${d.stack ?? ""}` });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [appendConsole, setPreviewRuntimeError]);

  const isEmpty = files.length === 0;
  const device = DEVICES[deviceIndex] ?? DEVICES[2];
  const iframeStyle = useMemo(
    () => ({
      width: device.width === "100%" ? "100%" : device.width,
      maxWidth: "100%" as const,
      height: "100%",
    }),
    [device.width],
  );

  return (
    <div
      data-testid="live-preview"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141517] shadow-2xl",
        className,
      )}
    >
      {/* Browser chrome */}
      <div dir="ltr" className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#1b1d20] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ms-2 text-[11px] text-white/40">
            preview · <span className="text-white/50">{device.label.toLowerCase()}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-[#0e0f11] p-0.5">
            {DEVICES.map((d, idx) => {
              const Icon = d.Icon;
              const active = idx === deviceIndex;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDeviceIndex(idx)}
                  aria-label={d.label}
                  data-testid={`preview-device-${d.label.toLowerCase()}`}
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full transition-all",
                    active
                      ? "bg-sahib-ocean/20 text-sahib-ocean"
                      : "text-white/40 hover:bg-white/5 hover:text-white/80",
                  )}
                >
                  <Icon className="h-3 w-3" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={inject}
            aria-label="Refresh preview"
            data-testid="preview-refresh"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0e0f11] text-white/40 transition-all hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Frame body */}
      <div className="relative flex min-h-0 flex-1 items-stretch justify-center overflow-hidden bg-[#0b0c0d] p-3">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {busy && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#0b0c0d]/70 backdrop-blur-sm">
                <Loader2 className="h-7 w-7 animate-spin text-sahib-ocean" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              title="Live preview"
              sandbox="allow-scripts allow-same-origin"
              style={iframeStyle}
              className="h-full w-full rounded-xl border border-white/10 bg-white shadow-[0_8px_40px_rgba(58,138,175,0.18)]"
            />
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sahib-ocean/20 to-[#DF7825]/10 ring-1 ring-white/10">
        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sahib-ocean to-[#DF7825]" />
      </div>
      <p className="max-w-xs text-sm text-white/50">
        سيظهر تطبيقك هنا. اطلب من الذكاء الاصطناعي أن يبني شيئًا — صفحة هبوط، تطبيق مهام، أي شيء.
      </p>
    </div>
  );
}
