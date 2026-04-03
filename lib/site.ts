/**
 * Canonical site URL for SEO metadata (server).
 * Set NEXT_PUBLIC_APP_URL in production (e.g. https://sahib.chat).
 */
export function publicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://sahib.chat";
}

/**
 * Base URL for copied share links (client).
 * Prefers NEXT_PUBLIC_APP_URL so links match production domain when set.
 */
export function shareLinkOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://sahib.chat";
}
