/**
 * Client-safe AI provider labels and default model ids.
 * Chat calls go to Next.js `/api/chat`, which proxies to FastAPI and `emergentintegrations`
 * (see `backend/server.py`). The server uses the Emergent key; admin can set a global
 * default model, and in-app Settings can override provider + model per request.
 */
import type { AiProvider } from "@/lib/types";

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  bedrock: "claude-sonnet-4-5-20250929",
  anthropic: "claude-sonnet-4-5-20250929",
  openai: "gpt-5.2",
  deepseek: "deepseek-chat",
};

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  bedrock: "Claude Sonnet 4.5 (default)",
  anthropic: "Claude (Anthropic)",
  openai: "GPT (OpenAI)",
  deepseek: "DeepSeek",
};
