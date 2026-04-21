"use client";

import { useState } from "react";
import hljs from "highlight.js";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";

export function CodeBlock({
  code,
  language = "text",
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  let highlighted = code;
  try {
    highlighted =
      language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;
  } catch {
    highlighted = code.replace(/</g, "&lt;");
  }
  const lines = code.split("\n");
  const pad = String(lines.length).length;

  return (
    <div
      dir="ltr"
      className={cn(
        "overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#2d2d30] shadow-sahib-glow",
        className,
      )}
    >
      <div className="flex justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">{language}</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="flex items-center gap-1 text-[11px] text-sahib-ocean transition-colors hover:text-white"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "نُسخ" : "نسخ"}
        </button>
      </div>
      <div className="flex max-h-[400px] overflow-auto font-mono text-[13px]">
        <div className="border-r border-white/10 py-3 pl-3 pr-2 text-right text-[#6B7280]">
          {lines.map((_, i) => (
            <div key={i}>{String(i + 1).padStart(pad, " ")}</div>
          ))}
        </div>
        <pre className="m-0 flex-1 p-3">
          <code className="hljs !bg-transparent text-[#E5E7EB]" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
}
