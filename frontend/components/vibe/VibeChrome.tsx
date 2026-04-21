"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, Copy, Download, Share2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { LivePreview } from "@/components/vibe/LivePreview";
import { VibeChat } from "@/components/vibe/VibeChat";
import { CodeDrawer } from "@/components/vibe/CodeDrawer";
import { useStudioStore } from "@/lib/store";
import { shareLinkOrigin } from "@/lib/site";
import { cn } from "@/lib/utils";

type MobileTab = "chat" | "preview";

/**
 * Top-level vibe-coding shell.
 * Desktop: preview (left, hero) + chat (right).
 * Mobile:  tabs (Preview / Chat), sticky prompt inherited from VibeChat.
 */
export function VibeChrome() {
  const files = useStudioStore((s) => s.files);
  const [codeOpen, setCodeOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [sharing, setSharing] = useState(false);
  const [flashCode, setFlashCode] = useState(false);

  // Flash the Code button when files get inserted (from InsertCodeButton).
  const prevFilesRef = useRef(files.length);
  useEffect(() => {
    if (files.length > prevFilesRef.current) {
      setFlashCode(true);
      const t = setTimeout(() => setFlashCode(false), 1500);
      return () => clearTimeout(t);
    }
    prevFilesRef.current = files.length;
  }, [files.length]);

  const share = useCallback(async () => {
    if (!files.length) {
      toast.error("لا يوجد شيء لمشاركته بعد");
      return;
    }
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          activeFileId: useStudioStore.getState().activeFileId,
        }),
      });
      const j = (await res.json()) as { path?: string; error?: string; detail?: string };
      if (!res.ok) throw new Error(j.error || j.detail || "تعذّرت المشاركة");
      const full = `${shareLinkOrigin()}${j.path ?? ""}`;
      await navigator.clipboard.writeText(full);
      toast.success("تم نسخ رابط المشاركة", { description: full });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّرت المشاركة");
    } finally {
      setSharing(false);
    }
  }, [files]);

  const downloadZip = useCallback(async () => {
    if (!files.length) {
      toast.error("لا يوجد شيء للتنزيل بعد");
      return;
    }
    const z = new JSZip();
    files.forEach((f) => z.file(f.name, f.content));
    const blob = await z.generateAsync({ type: "blob" });
    saveAs(blob, "sahib-yalla-project.zip");
    toast.success("تم التنزيل");
  }, [files]);

  const copyAll = useCallback(() => {
    if (!files.length) return;
    void navigator.clipboard
      .writeText(files.map((f) => `/* ${f.name} */\n${f.content}`).join("\n\n"))
      .then(() => toast.success("تم نسخ الكود كاملًا"));
  }, [files]);

  return (
    <div
      className="vibe-bg flex h-[100dvh] min-h-0 flex-col overflow-hidden"
      data-testid="vibe-chrome"
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-[rgba(10,11,13,0.8)] px-3 py-2.5 backdrop-blur-md sm:px-4">
        <div className="flex items-center gap-2">
          <h1
            className="font-aref text-2xl font-bold leading-none text-transparent sm:text-[28px]"
            style={{
              backgroundImage: "linear-gradient(135deg, #3A8AAF 0%, #DF7825 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
            data-testid="app-logo"
          >
            صاحب يلا
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCodeOpen(true)}
            data-testid="topbar-code"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all",
              flashCode
                ? "border-[#28c840]/60 bg-[#28c840]/10 text-[#28c840] shadow-[0_0_20px_rgba(40,200,64,0.25)]"
                : "border-white/10 bg-white/5 text-white/80 hover:border-sahib-ocean/40 hover:bg-sahib-ocean/10 hover:text-white",
            )}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline sm:inline">الكود</span>
            {files.length > 0 && (
              <span className="ms-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
                {files.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => void share()}
            disabled={sharing}
            data-testid="topbar-share"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sharing ? "جاري المشاركة…" : "مشاركة"}</span>
          </button>

          <button
            type="button"
            onClick={copyAll}
            aria-label="نسخ الكود"
            data-testid="topbar-copy"
            className="hidden h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void downloadZip()}
            aria-label="تنزيل ZIP"
            data-testid="topbar-zip"
            className="hidden h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="flex shrink-0 items-center justify-center gap-1 border-b border-white/5 bg-[rgba(10,11,13,0.6)] px-2 py-2 lg:hidden">
        {([
          { k: "chat" as const, label: "المحادثة" },
          { k: "preview" as const, label: "المعاينة" },
        ]).map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setMobileTab(t.k)}
            data-testid={`mobile-tab-${t.k}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              mobileTab === t.k
                ? "bg-white text-[#141517] shadow-lg"
                : "text-white/50 hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex min-h-0 flex-1 gap-3 p-2 sm:p-3 lg:gap-4 lg:p-4">
        {/* Preview: always rendered. On mobile, only visible when tab = preview. On lg+, always visible. */}
        <div
          className={cn(
            "min-h-0 flex-1 lg:flex lg:flex-[1.35]",
            mobileTab === "preview" ? "flex w-full" : "hidden",
          )}
        >
          <LivePreview />
        </div>
        {/* Chat: always rendered. On mobile, only visible when tab = chat. On lg+, always visible. */}
        <div
          className={cn(
            "min-h-0 flex-1 lg:flex lg:w-[min(460px,40vw)] lg:flex-none",
            mobileTab === "chat" ? "flex w-full" : "hidden",
          )}
        >
          <VibeChat onOpenCode={() => setCodeOpen(true)} />
        </div>
      </main>

      <CodeDrawer open={codeOpen} onClose={() => setCodeOpen(false)} />
    </div>
  );
}
