import type { NextRequest } from "next/server";
import { streamMessageFromBedrock } from "@/lib/bedrock";
import { buildContextFromPayload } from "@/lib/contextBuilder";
import { rateLimitChat } from "@/lib/rateLimit";
import type { ChatContextPayload, Message } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}

export async function POST(req: NextRequest) {
  const rl = rateLimitChat(clientIp(req));
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { message?: string; history?: Message[]; context?: ChatContextPayload };
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

  if (
    !process.env.AWS_ACCESS_KEY_ID?.trim() ||
    !process.env.AWS_SECRET_ACCESS_KEY?.trim()
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local for Bedrock.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const extra =
    body.context != null ? buildContextFromPayload(body.context) : undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let had = false;
        for await (const chunk of streamMessageFromBedrock(message, history, extra)) {
          if (chunk) had = true;
          controller.enqueue(encoder.encode(chunk));
        }
        if (!had) controller.enqueue(encoder.encode("sahib.chat didn't respond. Try again."));
      } catch (e) {
        const raw = e instanceof Error ? e.message : String(e);
        const msg =
          raw.includes("Throttl") || raw.includes("Rate")
            ? "Too many requests. Please wait a moment."
            : raw.includes("credentials") || raw.includes("Credential")
              ? "Bedrock error. Check your credentials."
              : raw.includes("fetch")
                ? "Failed to connect. Check your internet."
                : `Bedrock error. ${raw}`;
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
