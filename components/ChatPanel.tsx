"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import { MessageCircle, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { MessageBubble } from "@/components/MessageBubble";
import { SahibPrimaryButton, SahibSecondaryButton } from "@/components/SahibButton";
import { cn } from "@/lib/utils";
import { buildChatContextForApi, useStudioStore } from "@/lib/store";
import type { Message } from "@/lib/types";

const MAX_CHARS = 4000;
const VIRTUAL_THRESHOLD = 100;
const ROW_H = 128;

export function ChatPanel() {
  const messages = useStudioStore((s) => s.messages);
  const addMessage = useStudioStore((s) => s.addMessage);
  const updateMessage = useStudioStore((s) => s.updateMessage);
  const clearMessages = useStudioStore((s) => s.clearMessages);
  const chatLoading = useStudioStore((s) => s.chatLoading);
  const setChatLoading = useStudioStore((s) => s.setChatLoading);
  const chatError = useStudioStore((s) => s.chatError);
  const setChatError = useStudioStore((s) => s.setChatError);
  const chatDraftPrefill = useStudioStore((s) => s.chatDraftPrefill);
  const setChatDraftPrefill = useStudioStore((s) => s.setChatDraftPrefill);

  const [text, setText] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<FixedSizeList>(null);
  const listWrapRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(320);

  useEffect(() => {
    if (chatDraftPrefill) {
      setText(chatDraftPrefill);
      setChatDraftPrefill(null);
      areaRef.current?.focus();
    }
  }, [chatDraftPrefill, setChatDraftPrefill]);

  useLayoutEffect(() => {
    if (messages.length < VIRTUAL_THRESHOLD && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else listRef.current?.scrollToItem(messages.length - 1, "end");
  }, [messages.length, chatLoading]);

  useEffect(() => {
    const el = listWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setListWidth(el.clientWidth));
    ro.observe(el);
    setListWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [messages.length]);

  const resizeArea = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(44, Math.min(el.scrollHeight, 120))}px`;
  }, []);
  useEffect(() => resizeArea(), [text, resizeArea]);

  const send = useCallback(async () => {
    const trimmed = text.trim();
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
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(typeof j.error === "string" ? j.error : "Request failed");
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
    }
  }, [addMessage, chatLoading, text, updateMessage, setChatLoading, setChatError]);

  const rowRenderer = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const m = messages[index];
      if (!m) return null;
      return (
        <div style={style} className="px-2">
          <MessageBubble message={m} isStreaming={m.isStreaming} />
        </div>
      );
    },
    [messages],
  );

  const listHeight = useMemo(
    () => Math.min(520, Math.max(240, messages.length * ROW_H)),
    [messages.length],
  );

  return (
    <section className="sahib-glass flex min-h-0 flex-1 flex-col overflow-hidden lg:min-w-[400px]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#3c3c3c] px-4 py-3">
        <h2 className="text-sm font-bold text-white">Chat</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9CA3AF]">{messages.length}</span>
          <SahibSecondaryButton
            type="button"
            onClick={() => clearMessages()}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </SahibSecondaryButton>
        </div>
      </header>
      <div className="studio-scroll relative min-h-0 flex-1 overflow-y-auto bg-[#1e1e1e]" role="log">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <MessageCircle className="h-10 w-10 text-sahib-ocean drop-shadow-[0_0_12px_rgba(58,138,175,0.5)]" />
            <p className="text-sm text-[#9CA3AF]">Start a conversation on sahib.chat…</p>
          </div>
        ) : messages.length >= VIRTUAL_THRESHOLD ? (
          <div ref={listWrapRef} className="h-[min(520px,calc(100vh-280px))] min-h-[240px] w-full">
            <FixedSizeList
              ref={listRef}
              height={listHeight}
              itemCount={messages.length}
              itemSize={ROW_H}
              width={listWidth}
            >
              {rowRenderer}
            </FixedSizeList>
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} isStreaming={m.isStreaming} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {chatError && (
        <div className="flex items-center justify-between border-t border-red-500/35 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          <span>{chatError}</span>
          <button type="button" onClick={() => setChatError(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <footer className="shrink-0 border-t border-[#3c3c3c] p-3">
        <div className="flex gap-2">
          <textarea
            ref={areaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Message… (⌘+Enter)"
            maxLength={MAX_CHARS}
            rows={1}
            className="sahib-input min-h-[44px] flex-1 resize-none"
          />
          <SahibPrimaryButton disabled={!text.trim() || chatLoading} onClick={() => void send()}>
            Send
          </SahibPrimaryButton>
        </div>
        <p className="mt-1 text-[11px] text-[#6B7280]">
          {text.length}/{MAX_CHARS}
        </p>
      </footer>
    </section>
  );
}
