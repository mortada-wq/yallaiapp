"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { SahibIconButton } from "@/components/SahibButton";
import { PROVIDER_LABELS, DEFAULT_MODELS } from "@/lib/aiProvider";
import { cn } from "@/lib/utils";
import type { AiProvider } from "@/lib/types";

const PROVIDERS: AiProvider[] = ["bedrock", "anthropic", "openai", "deepseek"];

const PROVIDER_MODELS: Record<AiProvider, { value: string; label: string }[]> = {
  bedrock: [
    { value: "anthropic.claude-3-5-sonnet-20241022-v2:0", label: "Claude 3.5 Sonnet" },
    { value: "anthropic.claude-3-opus-20240229-v1:0", label: "Claude 3 Opus" },
    { value: "anthropic.claude-3-haiku-20240307-v1:0", label: "Claude 3 Haiku" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "o1", label: "o1" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek Chat (V3)" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner (R1)" },
  ],
};

type SettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ApiKeyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 pr-9 font-mono text-xs text-white placeholder:text-white/20",
          "outline-none focus:border-[rgba(58,138,175,0.5)] focus:ring-1 focus:ring-[rgba(58,138,175,0.25)]",
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
        aria-label={visible ? "Hide key" : "Show key"}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const editorFontSize = useStudioStore((s) => s.editorFontSize);
  const setEditorFontSize = useStudioStore((s) => s.setEditorFontSize);
  const previewDebounceMs = useStudioStore((s) => s.previewDebounceMs);
  const setPreviewDebounceMs = useStudioStore((s) => s.setPreviewDebounceMs);

  const aiProvider = useStudioStore((s) => s.aiProvider);
  const aiApiKeys = useStudioStore((s) => s.aiApiKeys);
  const aiModels = useStudioStore((s) => s.aiModels);
  const setAiProvider = useStudioStore((s) => s.setAiProvider);
  const setAiApiKey = useStudioStore((s) => s.setAiApiKey);
  const setAiModel = useStudioStore((s) => s.setAiModel);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn("sahib-glass w-full max-w-lg overflow-hidden border border-white/10")}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="settings-modal-title" className="text-sm font-bold text-white">
            Settings
          </h2>
          <SahibIconButton type="button" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </SahibIconButton>
        </header>

        <div className="max-h-[75vh] overflow-y-auto">
          {/* ── AI Provider ── */}
          <section className="border-b border-white/10 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              AI Provider
            </h3>

            {/* Provider tabs */}
            <div className="mb-4 grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAiProvider(p)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-[11px] font-medium transition-all",
                    aiProvider === p
                      ? "bg-[#3A8AAF] text-white shadow"
                      : "text-[#9CA3AF] hover:text-white",
                  )}
                >
                  {p === "bedrock" ? "Bedrock" : PROVIDER_LABELS[p].split(" ")[0]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {/* Model selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9CA3AF]">Model</label>
                <select
                  value={aiModels[aiProvider] || DEFAULT_MODELS[aiProvider]}
                  onChange={(e) => setAiModel(aiProvider, e.target.value)}
                  className={cn(
                    "w-full rounded-md border border-white/10 bg-[#252526] px-3 py-2 text-sm text-white",
                    "outline-none focus:border-[rgba(58,138,175,0.5)] focus:ring-1 focus:ring-[rgba(58,138,175,0.25)]",
                  )}
                >
                  {PROVIDER_MODELS[aiProvider].map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              {aiProvider === "bedrock" ? (
                <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#9CA3AF]">
                  AWS Bedrock uses{" "}
                  <code className="text-white/60">AWS_ACCESS_KEY_ID</code> and{" "}
                  <code className="text-white/60">AWS_SECRET_ACCESS_KEY</code> from your{" "}
                  <code className="text-white/60">.env.local</code> file.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#9CA3AF]">
                    {PROVIDER_LABELS[aiProvider]} API Key
                  </label>
                  <ApiKeyInput
                    value={aiApiKeys[aiProvider] ?? ""}
                    onChange={(v) => setAiApiKey(aiProvider, v)}
                    placeholder={
                      aiProvider === "anthropic"
                        ? "sk-ant-..."
                        : aiProvider === "openai"
                          ? "sk-..."
                          : "sk-..."
                    }
                  />
                  <p className="text-[11px] text-white/25">
                    Stored in your browser only. Sent securely per-request.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Editor ── */}
          <section className="p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Editor
            </h3>
            <div className="space-y-4 text-sm text-[#E5E7EB]">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-white">
                  Font size ({editorFontSize}px)
                </span>
                <input
                  type="range"
                  min={12}
                  max={22}
                  value={editorFontSize}
                  onChange={(e) => setEditorFontSize(Number(e.target.value))}
                  className="sahib-input h-2 cursor-pointer py-0"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-medium text-white">
                  Preview debounce ({previewDebounceMs} ms)
                </span>
                <input
                  type="range"
                  min={150}
                  max={2000}
                  step={50}
                  value={previewDebounceMs}
                  onChange={(e) => setPreviewDebounceMs(Number(e.target.value))}
                  className="sahib-input h-2 cursor-pointer py-0"
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
