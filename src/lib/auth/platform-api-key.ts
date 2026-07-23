import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

/** Extract the raw API key token from a request (Authorization or X-Pryrox-Api-Key header). */
export function extractPlatformApiKeyToken(request: { headers: { get: (name: string) => string | null } }): string | null {
  const header = request.headers.get("x-pryrox-api-key");
  if (header) return header;

  const auth = request.headers.get("authorization");
  if (!auth) return null;

  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/** Resolve platform API key context via backend. Returns null if invalid/expired. */
export async function resolvePlatformApiKey(token: string): Promise<{ id: string; name: string; permissions: string[] } | null> {
  if (!token || token.length < 8) return null;

  const { url } = resolveApiUrl("/api/admin/api-keys/resolve");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Check if a resolved platform API key has a given permission. */
export function platformApiKeyHasPermission(key: { permissions: string[] }, permission: string): boolean {
  return key.permissions.includes(permission);
}
