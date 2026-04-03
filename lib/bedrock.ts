import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { Message } from "@/lib/types";

const DEFAULT_MODEL = "anthropic.claude-3-5-sonnet-20241022-v2:0";

const SAHIB_SYSTEM = `You are the sahib.chat coding assistant. You help with implementation, UI polish (including glassmorphism and modern layouts), and cloud architecture. Be concise and professional. Always format code in markdown with syntax highlighting.`;

export function getBedrockClient(): BedrockRuntimeClient {
  const region = process.env.AWS_REGION ?? "us-east-1";
  return new BedrockRuntimeClient({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

type BedrockMessage = { role: "user" | "assistant"; content: string };

function toAnthropicMessages(history: Message[]): BedrockMessage[] {
  return history
    .filter(
      (m) =>
        m.role === "user" ||
        (m.role === "assistant" && m.content.trim().length > 0),
    )
    .map((m) => ({ role: m.role, content: m.content }));
}

export async function* streamMessageFromBedrock(
  userMessage: string,
  conversationHistory: Message[],
  extraSystem?: string,
): AsyncGenerator<string, void, unknown> {
  const client = getBedrockClient();
  const modelId = process.env.BEDROCK_MODEL_ID ?? DEFAULT_MODEL;

  const historyPayload = toAnthropicMessages(conversationHistory);
  const messages = [
    ...historyPayload.map((m) => ({
      role: m.role as "user" | "assistant",
      content: [{ type: "text" as const, text: m.content }],
    })),
    {
      role: "user" as const,
      content: [{ type: "text" as const, text: userMessage }],
    },
  ];

  const system =
    extraSystem && extraSystem.trim().length > 0
      ? `${SAHIB_SYSTEM}\n\n${extraSystem.trim()}`
      : SAHIB_SYSTEM;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    temperature: 0.7,
    system,
    messages,
  });

  const response = await client.send(
    new InvokeModelWithResponseStreamCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body,
    }),
  );

  const stream = response.body;
  if (!stream) throw new Error("No response body from Bedrock");

  for await (const event of stream) {
    const chunk = event.chunk;
    if (!chunk?.bytes) continue;
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(new TextDecoder().decode(chunk.bytes)) as Record<string, unknown>;
    } catch {
      continue;
    }
    const type = json.type as string | undefined;
    if (type === "content_block_delta") {
      const delta = json.delta as Record<string, unknown> | undefined;
      if (delta?.type === "text_delta" && typeof delta.text === "string") {
        yield delta.text;
      } else if (typeof (delta as { text?: string })?.text === "string") {
        yield (delta as { text: string }).text;
      }
    } else if (type === "message_delta") {
      const delta = json.delta as { text?: string } | undefined;
      if (delta?.text) yield delta.text;
    }
  }
}
