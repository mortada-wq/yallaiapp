"use client";

import { ArrowDownToLine, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useStudioStore } from "@/lib/store";
import { SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

export function InsertCodeButton({
  code,
  language,
  suggestedFilename,
  className,
}: {
  code: string;
  language: string;
  suggestedFilename?: string;
  className?: string;
}) {
  const insertOrUpdateFile = useStudioStore((s) => s.insertOrUpdateFile);
  const applyCodeToPreview = useStudioStore((s) => s.applyCodeToPreview);

  const fileName =
    suggestedFilename ??
    (language.toLowerCase().includes("html")
      ? "index.html"
      : language.toLowerCase().includes("css")
        ? "styles.css"
        : "script.js");

  return (
    <div className={cn("flex flex-wrap gap-2 py-2", className)}>
      <SahibSecondaryButton
        type="button"
        onClick={() => {
          insertOrUpdateFile(fileName, language, code);
          toast.success("أُدرج في المحرر", { description: fileName });
        }}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs"
      >
        <ArrowDownToLine className="h-3.5 w-3.5" />
        إدراج في المحرر
      </SahibSecondaryButton>
      <SahibSecondaryButton
        type="button"
        onClick={() => {
          applyCodeToPreview(language, code);
          toast.success("طُبِّق على المعاينة");
        }}
        className="inline-flex items-center gap-1 border-[rgba(58,138,175,0.45)] px-3 py-1.5 text-xs text-[#E5E7EB] hover:border-[rgba(58,138,175,0.65)] hover:bg-[rgba(58,138,175,0.1)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-sahib-ocean" />
        تطبيق على المعاينة
      </SahibSecondaryButton>
    </div>
  );
}
