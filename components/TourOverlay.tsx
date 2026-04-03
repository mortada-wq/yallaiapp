"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SahibPrimaryButton, SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sahib-chat-tour-dismissed";

const STEPS = [
  {
    title: "Welcome to sahib.chat",
    body: "Glassmorphic workspace: split chat and editor, live preview, ocean & sunset accents. Let’s build.",
  },
  {
    title: "AI in the editor",
    body: "Use the AI toolbar or right-click in the editor and choose “Ask sahib.chat” to send selection to chat.",
  },
  {
    title: "Share snapshots",
    body: "Export a read-only link from the header so collaborators can open your files instantly.",
  },
];

export function TourOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const s = STEPS[step] ?? STEPS[0];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className={cn("sahib-glass w-full max-w-md border border-white/10 p-5")}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 id="tour-title" className="text-base font-bold text-white">
            {s.title}
          </h2>
          <button
            type="button"
            className="rounded-lg p-1 text-[#9CA3AF] transition-colors hover:bg-[rgba(58,138,175,0.12)] hover:text-white"
            aria-label="Close tour"
            onClick={dismiss}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-[#E5E7EB]">{s.body}</p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <span className="text-xs text-[#9CA3AF]">
            {step + 1} / {STEPS.length}
          </span>
          <div className="flex gap-2">
            {step > 0 && (
              <SahibSecondaryButton type="button" onClick={() => setStep((i) => Math.max(0, i - 1))}>
                Back
              </SahibSecondaryButton>
            )}
            {step < STEPS.length - 1 ? (
              <SahibPrimaryButton type="button" onClick={() => setStep((i) => i + 1)}>
                Next
              </SahibPrimaryButton>
            ) : (
              <SahibPrimaryButton type="button" onClick={dismiss}>
                Got it
              </SahibPrimaryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
