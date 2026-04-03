const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;

export function rateLimitChat(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(ip, b);
  }
  if (b.count >= MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}
