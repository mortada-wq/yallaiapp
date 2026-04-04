/**
 * Unified streaming AI provider interface.
 * Supports: AWS Bedrock, Anthropic (direct), OpenAI, DeepSeek.
 */
import type { Message } from "@/lib/types";

export type AiProvider = "bedrock" | "anthropic" | "openai" | "deepseek";

export interface AiProviderConfig {
  provider: AiProvider;
  apiKey?: string;   // not used for bedrock (uses env vars)
  model?: string;
}

// Default models per provider
export const DEFAULT_MODELS: Record<AiProvider, string> = {
  bedrock: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  anthropic: "claude-3-5-sonnet-20241022",
  openai: "gpt-4o",
  deepseek: "deepseek-chat",
};

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  bedrock: "AWS Bedrock",
  anthropic: "Anthropic",
  openai: "OpenAI",
  deepseek: "DeepSeek",
};

const SYSTEM_PROMPT =
  `You are the Yallai coding assistant. You help with implementation, UI polish (including glassmorphism and modern layouts), and cloud architecture. Be concise and professional. Always format code in markdown with syntax highlighting.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function toMessages(history: Message[], userMessage: string): ChatMessage[] {
  const filtered = history.filter(
    (m) => m.role === "user" || (m.role === "assistant" && m.content.trim().length > 0),
  );
  return [
    ...filtered.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];
}

// ─── Anthropic Direct ──────────────────────────────────────────────────────────

export async function* streamAnthropic(
  userMessage: string,
  history: Message[],
  apiKey: string,
  model: string,
  extraSystem?: string,
): AsyncGenerator<string> {
  const system = extraSystem?.trim()
    ? `${SYSTEM_PROMPT}\n\n${extraSystem.trim()}`
    : SYSTEM_PROMPT;

  const messages = toMessages(history, userMessage).map((m) => ({
    role: m.role,
    content: [{ type: "text", text: m.content }],
  }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic error ${res.status}: ${text.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from Anthropic");
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const ev = JSON.parse(raw) as {
          type?: string;
          delta?: { type?: string; text?: string };
        };
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) {
          yield ev.delta.text;
        }
      } catch {
        // ignore malformed
      }
    }
  }
}

// ─── OpenAI-compatible (OpenAI + DeepSeek) ────────────────────────────────────

async function* streamOpenAICompatible(
  userMessage: string,
  history: Message[],
  apiKey: string,
  model: string,
  baseUrl: string,
  extraSystem?: string,
): AsyncGenerator<string> {
  const systemContent = extraSystem?.trim()
    ? `${SYSTEM_PROMPT}\n\n${extraSystem.trim()}`
    : SYSTEM_PROMPT;

  const messages = [
    { role: "system", content: systemContent },
    ...toMessages(history, userMessage),
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, stream: true, max_tokens: 4096 }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${baseUrl} error ${res.status}: ${text.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const ev = JSON.parse(raw) as {
          choices?: { delta?: { content?: string } }[];
        };
        const text = ev.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // ignore
      }
    }
  }
}

export function streamOpenAI(
  userMessage: string,
  history: Message[],
  apiKey: string,
  model: string,
  extraSystem?: string,
): AsyncGenerator<string> {
  return streamOpenAICompatible(
    userMessage, history, apiKey, model,
    "https://api.openai.com/v1",
    extraSystem,
  );
}

export function streamDeepSeek(
  userMessage: string,
  history: Message[],
  apiKey: string,
  model: string,
  extraSystem?: string,
): AsyncGenerator<string> {
  return streamOpenAICompatible(
    userMessage, history, apiKey, model,
    "https://api.deepseek.com/v1",
    extraSystem,
  );
}

// ─── Bedrock (re-exported from bedrock.ts) ────────────────────────────────────
export { streamMessageFromBedrock as streamBedrock } from "@/lib/bedrock";
