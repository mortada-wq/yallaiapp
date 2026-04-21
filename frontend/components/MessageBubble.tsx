"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";
import type { Message } from "@/lib/types";
import { CodeBlock } from "@/components/CodeBlock";
import { InsertCodeButton } from "@/components/InsertCodeButton";
import { extractCodeBlocks } from "@/lib/codeExtractor";
import { cn } from "@/lib/utils";

export function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === "user";
  const blocks = useMemo(
    () => (!isUser ? extractCodeBlocks(message.content) : []),
    [isUser, message.content],
  );

  return (
    <div className={cn("flex gap-2 px-1 py-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs transition-all duration-300",
          isUser
            ? "border-white/15 bg-[#2d2d30] text-[#E5E7EB]"
            : "border-white/15 bg-[#252526] text-sahib-ocean",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[min(100%,720px)] text-sm text-[#E5E7EB] transition-all duration-300",
          isUser ? "sahib-msg-user" : "sahib-msg-ai",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-white">{message.content}</p>
        ) : (
          <div className="sahib-markdown prose-headings:text-white">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const inline = !match && !String(children).includes("\n");
                  if (inline) {
                    return <code>{children}</code>;
                  }
                  const c = String(children).replace(/\n$/, "");
                  const lang = match?.[1] ?? "text";
                  const suggested = blocks.find((b) => b.code.trim() === c.trim())?.suggestedFilename;
                  return (
                    <div className="my-2">
                      <CodeBlock code={c} language={lang} />
                      {!isStreaming && (
                        <InsertCodeButton code={c} language={lang} suggestedFilename={suggested} />
                      )}
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="ml-1 inline-block h-3 w-1 animate-pulse rounded bg-sahib-ocean" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
