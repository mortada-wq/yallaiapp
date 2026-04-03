"use client";

import { Bug, HelpCircle, Layout, Sparkles, Type } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

export function AiToolbar() {
  const setChatDraftPrefill = useStudioStore((s) => s.setChatDraftPrefill);
  const setMainPanelMode = useStudioStore((s) => s.setMainPanelMode);

  const run = (body: string) => {
    setChatDraftPrefill(`Please help:\n\n\`\`\`\n${body.slice(0, 12_000)}\n\`\`\`\n`);
    setMainPanelMode("chat");
  };

  const sel = () =>
    (window as unknown as { __sahibGetSelection?: () => string }).__sahibGetSelection?.() ?? "";
  const file = () =>
    useStudioStore.getState().files.find((f) => f.id === useStudioStore.getState().activeFileId)
      ?.content ?? "";

  const act = (kind: string) => {
    const body = sel() || file();
    const map: Record<string, string> = {
      improve: `Improve this code:\n${body}`,
      fix: `Fix errors:\n${body}`,
      explain: `Explain:\n${body}`,
      comments: `Add comments:\n${body}`,
      responsive: `Make responsive:\n${body}`,
    };
    run(map[kind] ?? map.improve);
  };

  const btn = (label: string, kind: string, Icon: typeof Sparkles) => (
    <SahibSecondaryButton
      key={kind}
      type="button"
      onClick={() => act(kind)}
      className={cn("inline-flex items-center gap-1 px-2 py-1 text-[11px]")}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </SahibSecondaryButton>
  );

  return (
    <div className="flex flex-wrap gap-1 border-b border-[#3c3c3c] bg-[#252526] px-2 py-2">
      {btn("Improve", "improve", Sparkles)}
      {btn("Fix", "fix", Bug)}
      {btn("Explain", "explain", HelpCircle)}
      {btn("Comments", "comments", Type)}
      {btn("Responsive", "responsive", Layout)}
    </div>
  );
}
