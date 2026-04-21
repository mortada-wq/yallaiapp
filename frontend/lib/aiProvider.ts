/**
 * Client-safe AI provider config.
 * Actual LLM calls are handled by the FastAPI backend using Emergent LLM key.
 * This file only exists so `store.ts` can reference DEFAULT_MODELS for type purposes.
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
