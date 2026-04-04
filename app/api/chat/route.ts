import type { NextRequest } from "next/server";
import { buildContextFromPayload } from "@/lib/contextBuilder";
import { rateLimitChat } from "@/lib/rateLimit";
import type { AiProvider, ChatContextPayload, Message } from "@/lib/types";
import {
  DEFAULT_MODELS,
  streamAnthropic,
  streamBedrock,
  streamDeepSeek,
  streamOpenAI,
} from "@/lib/aiProvider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}

type RequestBody = {
  message?: string;
  history?: Message[];
  context?: ChatContextPayload;
  provider?: AiProvider;
  apiKey?: string;
  model?: string;
};

export async function POST(req: NextRequest) {
  const rl = rateLimitChat(clientIp(req));
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message = body.message?.trim();
  const history = Array.isArray(body.history) ? body.history : [];
  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const provider: AiProvider = body.provider ?? "bedrock";
  const apiKey = body.apiKey ?? "";
  const model = body.model || DEFAULT_MODELS[provider];
  const extra = body.context != null ? buildContextFromPayload(body.context) : undefined;

  // Validate provider credentials
  if (provider === "bedrock") {
    if (!process.env.AWS_ACCESS_KEY_ID?.trim() || !process.env.AWS_SECRET_ACCESS_KEY?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local for Bedrock.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }
  } else if (!apiKey.trim()) {
    return new Response(
      JSON.stringify({ error: `API key required for ${provider}. Add it in Settings.` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let generator: AsyncGenerator<string>;

        switch (provider) {
          case "anthropic":
            generator = streamAnthropic(message, history, apiKey, model, extra);
            break;
          case "openai":
            generator = streamOpenAI(message, history, apiKey, model, extra);
            break;
          case "deepseek":
            generator = streamDeepSeek(message, history, apiKey, model, extra);
            break;
          case "bedrock":
          default:
            generator = streamBedrock(message, history, extra);
            break;
        }

        let had = false;
        for await (const chunk of generator) {
          if (chunk) had = true;
          controller.enqueue(encoder.encode(chunk));
        }
        if (!had) controller.enqueue(encoder.encode("No response. Please try again."));
      } catch (e) {
        const raw = e instanceof Error ? e.message : String(e);
        const msg =
          raw.includes("Throttl") || raw.includes("Rate") || raw.includes("429")
            ? "Too many requests. Please wait a moment."
            : raw.includes("credentials") || raw.includes("Credential") || raw.includes("401")
              ? "Authentication error. Check your API key."
              : raw.includes("fetch") || raw.includes("network")
                ? "Failed to connect. Check your internet."
                : `Error: ${raw.slice(0, 200)}`;
        controller.enqueue(encoder.encode(msg));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
