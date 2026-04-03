import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { saveShare } from "@/lib/shareStore";
import type { EditorFile } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      files?: EditorFile[];
      activeFileId?: string | null;
    };
    if (!body.files || !Array.isArray(body.files)) {
      return new Response(JSON.stringify({ error: "files required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const id = nanoid(12);
    saveShare(id, {
      files: body.files,
      activeFileId: body.activeFileId ?? null,
      createdAt: new Date().toISOString(),
    });
    return Response.json({ id, path: `/s/${id}` });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
