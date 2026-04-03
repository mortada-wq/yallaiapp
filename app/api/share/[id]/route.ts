import { getShare } from "@/lib/shareStore";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: { id: string } }) {
  const data = getShare(context.params.id);
  if (!data) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return Response.json(data);
}
