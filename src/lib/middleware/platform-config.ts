/**
 * Fetches platform configuration from NestJS for use in Next.js middleware.
 * Replaces direct Prisma calls for the 3 settings the middleware needs.
 *
 * - Cached in module-level memory for 60 seconds
 * - Falls back to safe defaults if NestJS is unreachable (never blocks requests)
 * - Zero DB calls from the frontend middleware path
 */

type PlatformConfig = {
  maintenanceActive: boolean;
  enableRegistrations: boolean;
  apiRateLimit: number;
};

const DEFAULT_CONFIG: PlatformConfig = {
  maintenanceActive: false,
  enableRegistrations: true,
  apiRateLimit: 120,
};

let cache: { value: PlatformConfig; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function getPlatformConfig(): Promise<PlatformConfig> {
  // Return cached value if fresh
  if (cache && Date.now() < cache.expiresAt) {
    return cache.value;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return DEFAULT_CONFIG;

  try {
    const res = await fetch(`${apiUrl}/api/health/platform-config`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000), // 2s timeout — never block requests
    });

    if (!res.ok) {
      cache = { value: DEFAULT_CONFIG, expiresAt: Date.now() + CACHE_TTL_MS };
      return DEFAULT_CONFIG;
    }

    const data = (await res.json()) as PlatformConfig;
    const value: PlatformConfig = {
      maintenanceActive: Boolean(data.maintenanceActive),
      enableRegistrations: data.enableRegistrations !== false,
      apiRateLimit: typeof data.apiRateLimit === "number" && data.apiRateLimit > 0
        ? data.apiRateLimit
        : DEFAULT_CONFIG.apiRateLimit,
    };

    cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch {
    // NestJS unreachable — use defaults, cache briefly to avoid hammering
    cache = { value: DEFAULT_CONFIG, expiresAt: Date.now() + 5_000 };
    return DEFAULT_CONFIG;
  }
}

/** Invalidate the cache (e.g. after admin changes a platform setting) */
export function invalidatePlatformConfigCache(): void {
  cache = null;
}
