"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { MessageBubble } from "@/components/MessageBubble";
import { ThinkingIndicator } from "@/components/vibe/ThinkingIndicator";
import { useStudioStore, buildChatContextForApi } from "@/lib/store";
import { loadTemplate, type TemplateId } from "@/lib/templates/projects";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

const MAX_CHARS = 4000;

type Chip = { label: string; prompt: string; template?: TemplateId };

// User asked to remove AI-authored Arabic prompt suggestions; keep the empty state clean.
const CHIPS: Chip[] = [];

export function VibeChat({ onOpenCode }: { onOpenCode?: () => void }) {
  const messages = useStudioStore((s) => s.messages);
  const addMessage = useStudioStore((s) => s.addMessage);
  const updateMessage = useStudioStore((s) => s.updateMessage);
  const clearMessages = useStudioStore((s) => s.clearMessages);
  const chatLoading = useStudioStore((s) => s.chatLoading);
  const setChatLoading = useStudioStore((s) => s.setChatLoading);
  const chatError = useStudioStore((s) => s.chatError);
  const setChatError = useStudioStore((s) => s.setChatError);
  const loadTemplateFiles = useStudioStore((s) => s.loadTemplateFiles);

  const [text, setText] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentAssistantId = useRef<string | null>(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, chatLoading, messages[messages.length - 1]?.content]);

  const resizeArea = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(52, Math.min(el.scrollHeight, 180))}px`;
  }, []);
  useEffect(() => resizeArea(), [text, resizeArea]);

  const sendPrompt = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || chatLoading || trimmed.length > MAX_CHARS) return;
      setChatError(null);
      setText("");

      const userMsg: Message = {
        id: nanoid(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);

      const assistantId = nanoid();
      currentAssistantId.current = assistantId;
      addMessage({
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      });
      setChatLoading(true);

      const history = useStudioStore
        .getState()
        .messages.filter((m) => m.id !== userMsg.id && m.id !== assistantId);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history,
            context: buildChatContextForApi(),
          }),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
          throw new Error(j.error || j.detail || "Request failed");
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No body");
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          updateMessage(assistantId, { content: buf, isStreaming: true });
        }
        updateMessage(assistantId, { content: buf, isStreaming: false });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setChatError(msg);
        updateMessage(assistantId, {
          content: `**Error**\n\n${msg}`,
          isStreaming: false,
        });
      } finally {
        setChatLoading(false);
        currentAssistantId.current = null;
      }
    },
    [addMessage, chatLoading, setChatError, setChatLoading, updateMessage],
  );

  const handleChip = useCallback(
    (chip: Chip) => {
      if (chip.template) loadTemplateFiles(loadTemplate(chip.template));
      setText(chip.prompt);
      areaRef.current?.focus();
    },
    [loadTemplateFiles],
  );

  // While streaming, the last assistant message is empty until first chunk arrives.
  const lastMsg = messages[messages.length - 1];
  const showThinking =
    chatLoading &&
    lastMsg?.role === "assistant" &&
    (lastMsg.content?.trim().length ?? 0) === 0;

  return (
    <section className="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(18,19,22,0.85)] backdrop-blur-xl">
      {/* Header row */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sahib-ocean" />
          <span className="text-sm font-semibold text-white">المحادثة</span>
          <span className="text-xs text-white/35">
            {messages.length ? `${messages.length} رسالة` : "ابدأ البناء"}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => clearMessages()}
            data-testid="vibe-chat-clear"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-3 w-3" />
            مسح
          </button>
        )}
      </header>

      {/* Messages */}
      <div
        className="studio-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3"
        role="log"
      >
        {messages.length === 0 ? (
          <EmptyPrompt onChip={handleChip} />
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} isStreaming={m.isStreaming} />
            ))}
            {showThinking && (
              <div className="px-3 py-2">
                <ThinkingIndicator />
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {chatError && (
        <div className="border-t border-red-500/35 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {chatError}
        </div>
      )}

      {/* Composer */}
      <footer className="shrink-0 border-t border-white/5 bg-[rgba(14,15,17,0.9)] p-3">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-[#1b1d20] p-2 transition-all",
            chatLoading
              ? "border-sahib-ocean/60 shadow-[0_0_0_1px_rgba(58,138,175,0.3),0_0_30px_rgba(58,138,175,0.15)]"
              : "border-white/10 focus-within:border-sahib-ocean/60 focus-within:shadow-[0_0_0_1px_rgba(58,138,175,0.3),0_0_30px_rgba(58,138,175,0.1)]",
          )}
        >
          <textarea
            ref={areaRef}
            data-testid="vibe-chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendPrompt(text);
              }
            }}
            placeholder={
              messages.length === 0
                ? "ماذا تريد أن تبني اليوم؟"
                : "اطلب تعديلات… (Shift+Enter لسطر جديد)"
            }
            maxLength={MAX_CHARS}
            rows={1}
            dir="auto"
            className="min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-white outline-none placeholder:text-white/35"
          />
          <button
            type="button"
            onClick={() => void sendPrompt(text)}
            disabled={!text.trim() || chatLoading}
            data-testid="vibe-chat-send"
            aria-label="Send"
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
              text.trim() && !chatLoading
                ? "bg-gradient-to-br from-sahib-ocean to-[#2d7a9f] text-white shadow-lg shadow-sahib-ocean/30 hover:shadow-sahib-ocean/50 active:scale-95"
                : "bg-white/5 text-white/30",
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[10px] text-white/30">
            {text.length}/{MAX_CHARS} · Enter للإرسال
          </span>
          {onOpenCode && (
            <button
              type="button"
              onClick={onOpenCode}
              data-testid="vibe-open-code-inline"
              className="text-[11px] text-white/40 transition-colors hover:text-white"
            >
              عرض الكود ←
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

function EmptyPrompt({ onChip }: { onChip: (c: Chip) => void }) {
  void onChip; // chips removed per user request; kept signature stable
  return (
    <div
      data-testid="vibe-empty-state"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sahib-ocean/20 to-[#DF7825]/10 ring-1 ring-white/10">
        <Sparkles className="h-6 w-6 text-sahib-ocean" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">فلنبني شيئًا معًا</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-white/50">
          اكتب طلبك في الأسفل.
        </p>
      </div>
    </div>
  );
}
