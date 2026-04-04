import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const SESSION_COOKIE = "yallai_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function createToken(email: string, secret: string): Promise<string> {
  const payload = `${email}:${Date.now()}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret || "yallai-secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  const sig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return btoa(`${payload}:${sig}`);
}

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, password } = body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Auth not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment." },
      { status: 503 },
    );
  }

  if (!email || !password || email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const secret = process.env.SESSION_SECRET ?? "yallai-secret-change-me";
  const token = await createToken(email, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return res;
}
